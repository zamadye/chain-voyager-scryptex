
import { BigNumber } from 'ethers';
import { databaseService } from './DatabaseService';
import { priceOracleService } from './PriceOracleService';
import { logger } from '../utils/logger';
import { redis } from '../config/redis';
import {
  UserPortfolio,
  TradingPosition,
  PortfolioMetrics,
  Token
} from '../types/trading';

export class PortfolioService {
  private updateQueue: Set<string> = new Set();

  constructor() {
    this.initializePortfolioService();
  }

  private async initializePortfolioService(): Promise<void> {
    logger.info('Initializing Portfolio Service');
    
    // Start background portfolio updates
    this.startPortfolioUpdates();
    this.startRiskMonitoring();
    
    logger.info('Portfolio Service initialized');
  }

  async getPortfolioSummary(userId: string): Promise<{
    totalValue: BigNumber;
    totalPnL: BigNumber;
    dayChange: number;
    portfolios: UserPortfolio[];
  }> {
    try {
      const portfolios = await this.getUserPortfolios(userId);
      
      let totalValue = BigNumber.from(0);
      let totalUnrealizedPnL = BigNumber.from(0);
      let totalRealizedPnL = BigNumber.from(0);
      
      for (const portfolio of portfolios) {
        totalValue = totalValue.add(portfolio.totalValueUsd);
        totalUnrealizedPnL = totalUnrealizedPnL.add(portfolio.unrealizedPnL);
        totalRealizedPnL = totalRealizedPnL.add(portfolio.realizedPnL);
      }

      const totalPnL = totalUnrealizedPnL.add(totalRealizedPnL);
      
      // Calculate day change (this would need historical data)
      const dayChange = await this.calculateDayChange(userId);

      return {
        totalValue,
        totalPnL,
        dayChange,
        portfolios
      };
    } catch (error) {
      logger.error('Failed to get portfolio summary', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        totalValue: BigNumber.from(0),
        totalPnL: BigNumber.from(0),
        dayChange: 0,
        portfolios: []
      };
    }
  }

  async getUserPortfolios(userId: string): Promise<UserPortfolio[]> {
    try {
      const query = `
        SELECT p.*,
               COUNT(pos.id) as position_count,
               COALESCE(SUM(pos.quantity * pos.current_price), 0) as calculated_value
        FROM user_portfolios p
        LEFT JOIN trading_positions pos ON p.user_id = pos.user_id AND p.chain_id = pos.chain_id
        WHERE p.user_id = $1
        GROUP BY p.id, p.user_id, p.chain_id, p.total_value_usd, p.unrealized_pnl, 
                 p.realized_pnl, p.total_fees_paid, p.var_95, p.sharpe_ratio, 
                 p.max_drawdown, p.last_calculated
        ORDER BY p.total_value_usd DESC
      `;
      
      const portfolios = await databaseService.query<UserPortfolio>(query, [userId]);
      
      return portfolios.map(portfolio => ({
        ...portfolio,
        totalValueUsd: BigNumber.from(portfolio.totalValueUsd),
        unrealizedPnL: BigNumber.from(portfolio.unrealizedPnL),
        realizedPnL: BigNumber.from(portfolio.realizedPnL),
        totalFeesPaid: BigNumber.from(portfolio.totalFeesPaid),
        var95: portfolio.var95 ? BigNumber.from(portfolio.var95) : undefined
      }));
    } catch (error) {
      logger.error('Failed to get user portfolios', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  async getUserPositions(userId: string, chainId?: number): Promise<TradingPosition[]> {
    try {
      const query = `
        SELECT p.*, t.symbol, t.name, t.decimals, t.logo_url, t.contract_address, t.chain_id
        FROM trading_positions p
        JOIN tokens t ON p.token_id = t.id
        WHERE p.user_id = $1 AND p.quantity > 0
        ${chainId ? 'AND p.chain_id = $2' : ''}
        ORDER BY (p.quantity * p.current_price) DESC NULLS LAST
      `;
      
      const params = chainId ? [userId, chainId] : [userId];
      const positions = await databaseService.query<TradingPosition & Token>(query, params);
      
      return positions.map(position => ({
        ...position,
        quantity: BigNumber.from(position.quantity),
        averageCost: BigNumber.from(position.averageCost),
        currentPrice: position.currentPrice ? BigNumber.from(position.currentPrice) : undefined,
        unrealizedPnL: position.unrealizedPnL ? BigNumber.from(position.unrealizedPnL) : undefined,
        stopLossPrice: position.stopLossPrice ? BigNumber.from(position.stopLossPrice) : undefined,
        takeProfitPrice: position.takeProfitPrice ? BigNumber.from(position.takeProfitPrice) : undefined,
        positionSizeLimit: position.positionSizeLimit ? BigNumber.from(position.positionSizeLimit) : undefined,
        token: {
          id: position.id,
          contractAddress: position.contractAddress,
          chainId: position.chainId,
          symbol: position.symbol,
          name: position.name,
          decimals: position.decimals,
          logoUrl: position.logoUrl,
          isVerified: false,
          isStable: false
        }
      }));
    } catch (error) {
      logger.error('Failed to get user positions', {
        userId,
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  async calculatePortfolioMetrics(userId: string): Promise<PortfolioMetrics> {
    try {
      const portfolios = await this.getUserPortfolios(userId);
      const positions = await this.getUserPositions(userId);
      const trades = await this.getUserTrades(userId);

      // Calculate basic metrics
      const totalValue = portfolios.reduce((sum, p) => sum.add(p.totalValueUsd), BigNumber.from(0));
      const unrealizedPnL = portfolios.reduce((sum, p) => sum.add(p.unrealizedPnL), BigNumber.from(0));
      const realizedPnL = portfolios.reduce((sum, p) => sum.add(p.realizedPnL), BigNumber.from(0));
      const totalFeesPaid = portfolios.reduce((sum, p) => sum.add(p.totalFeesPaid), BigNumber.from(0));

      // Calculate returns
      const totalInvested = totalValue.sub(unrealizedPnL);
      const totalReturn = totalInvested.gt(0) 
        ? unrealizedPnL.add(realizedPnL).mul(100).div(totalInvested).toNumber() 
        : 0;

      // Calculate trading metrics
      const winningTrades = trades.filter(t => t.pnl && t.pnl.gt(0));
      const losingTrades = trades.filter(t => t.pnl && t.pnl.lt(0));
      const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0;
      
      const averageWin = winningTrades.length > 0 
        ? winningTrades.reduce((sum, t) => sum.add(t.pnl!), BigNumber.from(0)).div(winningTrades.length)
        : BigNumber.from(0);
      
      const averageLoss = losingTrades.length > 0
        ? losingTrades.reduce((sum, t) => sum.add(t.pnl!.abs()), BigNumber.from(0)).div(losingTrades.length)
        : BigNumber.from(0);

      const profitFactor = averageLoss.gt(0) ? averageWin.mul(100).div(averageLoss).toNumber() / 100 : 0;

      // Calculate risk metrics
      const returns = await this.getHistoricalReturns(userId, 30); // 30 days
      const volatility = this.calculateVolatility(returns);
      const sharpeRatio = this.calculateSharpeRatio(returns);
      const maxDrawdown = this.calculateMaxDrawdown(returns);
      const var95 = this.calculateVaR(returns, 0.95);

      // Calculate chain allocation
      const chainAllocation: { [chainId: number]: number } = {};
      for (const position of positions) {
        const positionValue = position.quantity.mul(position.currentPrice || BigNumber.from(0));
        const allocation = totalValue.gt(0) ? positionValue.mul(100).div(totalValue).toNumber() : 0;
        chainAllocation[position.chainId] = (chainAllocation[position.chainId] || 0) + allocation;
      }

      // Calculate cross-chain metrics
      const crossChainTrades = trades.filter(t => t.type === 'cross_chain').length;
      const crossChainPnL = trades
        .filter(t => t.type === 'cross_chain' && t.pnl)
        .reduce((sum, t) => sum.add(t.pnl!), BigNumber.from(0));

      return {
        totalValue,
        unrealizedPnL,
        realizedPnL,
        totalReturn,
        sharpeRatio,
        sortinoratio: this.calculateSortinoRatio(returns),
        maxDrawdown,
        volatility,
        beta: await this.calculateBeta(userId),
        var95,
        winRate,
        averageWin,
        averageLoss,
        profitFactor,
        totalTrades: trades.length,
        avgTradeSize: trades.length > 0 
          ? trades.reduce((sum, t) => sum.add(t.amount || BigNumber.from(0)), BigNumber.from(0)).div(trades.length)
          : BigNumber.from(0),
        avgHoldingPeriod: await this.calculateAverageHoldingPeriod(userId),
        turnoverRate: await this.calculateTurnoverRate(userId),
        chainAllocation,
        crossChainTrades,
        crossChainPnL
      };
    } catch (error) {
      logger.error('Failed to calculate portfolio metrics', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Return default metrics
      return {
        totalValue: BigNumber.from(0),
        unrealizedPnL: BigNumber.from(0),
        realizedPnL: BigNumber.from(0),
        totalReturn: 0,
        sharpeRatio: 0,
        sortinoratio: 0,
        maxDrawdown: 0,
        volatility: 0,
        beta: 1,
        var95: BigNumber.from(0),
        winRate: 0,
        averageWin: BigNumber.from(0),
        averageLoss: BigNumber.from(0),
        profitFactor: 0,
        totalTrades: 0,
        avgTradeSize: BigNumber.from(0),
        avgHoldingPeriod: 0,
        turnoverRate: 0,
        chainAllocation: {},
        crossChainTrades: 0,
        crossChainPnL: BigNumber.from(0)
      };
    }
  }

  async updatePosition(
    userId: string, 
    tokenId: string, 
    chainId: number, 
    quantityChange: BigNumber, 
    price: BigNumber
  ): Promise<void> {
    try {
      await databaseService.withTransaction(async (client) => {
        // Get existing position
        const existingQuery = `
          SELECT * FROM trading_positions 
          WHERE user_id = $1 AND token_id = $2 AND chain_id = $3
        `;
        const existing = await client.query(existingQuery, [userId, tokenId, chainId]);
        
        if (existing.rows.length > 0) {
          // Update existing position
          const position = existing.rows[0];
          const currentQuantity = BigNumber.from(position.quantity);
          const currentAvgCost = BigNumber.from(position.average_cost);
          
          const newQuantity = currentQuantity.add(quantityChange);
          
          if (newQuantity.lte(0)) {
            // Close position
            await client.query(
              'DELETE FROM trading_positions WHERE user_id = $1 AND token_id = $2 AND chain_id = $3',
              [userId, tokenId, chainId]
            );
          } else {
            // Update position
            const totalCost = currentQuantity.mul(currentAvgCost).add(quantityChange.mul(price));
            const newAvgCost = totalCost.div(newQuantity);
            
            await client.query(`
              UPDATE trading_positions 
              SET quantity = $1, average_cost = $2, last_updated = NOW()
              WHERE user_id = $3 AND token_id = $4 AND chain_id = $5
            `, [newQuantity.toString(), newAvgCost.toString(), userId, tokenId, chainId]);
          }
        } else if (quantityChange.gt(0)) {
          // Create new position
          await client.query(`
            INSERT INTO trading_positions (user_id, token_id, chain_id, quantity, average_cost)
            VALUES ($1, $2, $3, $4, $5)
          `, [userId, tokenId, chainId, quantityChange.toString(), price.toString()]);
        }
      });

      // Queue portfolio update
      this.updateQueue.add(userId);
    } catch (error) {
      logger.error('Failed to update position', {
        userId,
        tokenId,
        chainId,
        quantityChange: quantityChange.toString(),
        price: price.toString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async rebalancePortfolio(
    userId: string, 
    targetAllocation: { [tokenSymbol: string]: number }
  ): Promise<{ success: boolean; trades: any[]; error?: string }> {
    try {
      const currentPositions = await this.getUserPositions(userId);
      const portfolioValue = await this.getPortfolioValue(userId);
      
      const trades: any[] = [];
      
      // Calculate required trades for rebalancing
      for (const [symbol, targetPercent] of Object.entries(targetAllocation)) {
        const currentPosition = currentPositions.find(p => p.token?.symbol === symbol);
        const currentValue = currentPosition 
          ? currentPosition.quantity.mul(currentPosition.currentPrice || BigNumber.from(0))
          : BigNumber.from(0);
        
        const targetValue = portfolioValue.mul(Math.floor(targetPercent * 100)).div(10000);
        const difference = targetValue.sub(currentValue);
        
        if (difference.abs().gt(portfolioValue.div(100))) { // Only if >1% of portfolio
          trades.push({
            symbol,
            action: difference.gt(0) ? 'buy' : 'sell',
            amount: difference.abs(),
            currentValue: currentValue.toString(),
            targetValue: targetValue.toString()
          });
        }
      }
      
      // Execute trades (this would integrate with the trading service)
      // For now, just return the calculated trades
      
      return {
        success: true,
        trades
      };
    } catch (error) {
      logger.error('Failed to rebalance portfolio', {
        userId,
        targetAllocation,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        trades: [],
        error: error instanceof Error ? error.message : 'Failed to rebalance portfolio'
      };
    }
  }

  async setRiskLimits(
    userId: string, 
    limits: {
      maxPositionSize?: BigNumber;
      maxDailyLoss?: BigNumber;
      stopLossPercentage?: number;
      takeProfitPercentage?: number;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const query = `
        INSERT INTO user_risk_limits (user_id, max_position_size, max_daily_loss, stop_loss_percentage, take_profit_percentage)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO UPDATE SET
          max_position_size = COALESCE(EXCLUDED.max_position_size, user_risk_limits.max_position_size),
          max_daily_loss = COALESCE(EXCLUDED.max_daily_loss, user_risk_limits.max_daily_loss),
          stop_loss_percentage = COALESCE(EXCLUDED.stop_loss_percentage, user_risk_limits.stop_loss_percentage),
          take_profit_percentage = COALESCE(EXCLUDED.take_profit_percentage, user_risk_limits.take_profit_percentage),
          updated_at = NOW()
      `;
      
      await databaseService.query(query, [
        userId,
        limits.maxPositionSize?.toString(),
        limits.maxDailyLoss?.toString(),
        limits.stopLossPercentage,
        limits.takeProfitPercentage
      ]);
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to set risk limits', {
        userId,
        limits,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set risk limits'
      };
    }
  }

  async getRiskAlerts(userId: string): Promise<any[]> {
    try {
      const alerts: any[] = [];
      const metrics = await this.calculatePortfolioMetrics(userId);
      const positions = await this.getUserPositions(userId);
      
      // Check for high concentration risk
      for (const [chainId, allocation] of Object.entries(metrics.chainAllocation)) {
        if (allocation > 50) {
          alerts.push({
            type: 'concentration_risk',
            severity: 'high',
            message: `Over 50% of portfolio allocated to chain ${chainId}`,
            value: allocation
          });
        }
      }
      
      // Check for high drawdown
      if (metrics.maxDrawdown > 20) {
        alerts.push({
          type: 'max_drawdown',
          severity: 'high',
          message: `Maximum drawdown exceeds 20%: ${metrics.maxDrawdown.toFixed(2)}%`,
          value: metrics.maxDrawdown
        });
      }
      
      // Check for low diversification
      if (positions.length < 3 && metrics.totalValue.gt(BigNumber.from('1000000000000000000000'))) { // >1000 tokens
        alerts.push({
          type: 'diversification',
          severity: 'medium',
          message: 'Portfolio may benefit from increased diversification',
          value: positions.length
        });
      }
      
      // Check VaR
      if (metrics.var95.gt(metrics.totalValue.div(10))) { // >10% of portfolio
        alerts.push({
          type: 'value_at_risk',
          severity: 'high',
          message: 'Value at Risk (95%) exceeds 10% of portfolio',
          value: metrics.var95.mul(100).div(metrics.totalValue).toNumber()
        });
      }
      
      return alerts;
    } catch (error) {
      logger.error('Failed to get risk alerts', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  // Background processes
  private startPortfolioUpdates(): void {
    setInterval(async () => {
      try {
        await this.processUpdateQueue();
      } catch (error) {
        logger.error('Portfolio update error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 30000); // Every 30 seconds
  }

  private startRiskMonitoring(): void {
    setInterval(async () => {
      try {
        await this.monitorRiskAcrossPortfolios();
      } catch (error) {
        logger.error('Risk monitoring error', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 300000); // Every 5 minutes
  }

  private async processUpdateQueue(): Promise<void> {
    const userIds = Array.from(this.updateQueue);
    this.updateQueue.clear();
    
    for (const userId of userIds) {
      await this.updatePortfolioValues(userId);
    }
  }

  private async updatePortfolioValues(userId: string): Promise<void> {
    try {
      const positions = await this.getUserPositions(userId);
      const portfoliosByChain: { [chainId: number]: UserPortfolio } = {};
      
      // Group positions by chain and calculate values
      for (const position of positions) {
        const chainId = position.chainId;
        
        if (!portfoliosByChain[chainId]) {
          portfoliosByChain[chainId] = {
            id: '',
            userId,
            chainId,
            totalValueUsd: BigNumber.from(0),
            unrealizedPnL: BigNumber.from(0),
            realizedPnL: BigNumber.from(0),
            totalFeesPaid: BigNumber.from(0),
            lastCalculated: new Date()
          };
        }
        
        // Get current price
        const currentPrice = position.currentPrice || await this.getCurrentTokenPrice(position.tokenId);
        if (currentPrice) {
          position.currentPrice = currentPrice;
          
          // Calculate position value and PnL
          const positionValue = position.quantity.mul(currentPrice);
          const costBasis = position.quantity.mul(position.averageCost);
          const unrealizedPnL = positionValue.sub(costBasis);
          
          // Update position
          await this.updatePositionPriceAndPnL(position.id, currentPrice, unrealizedPnL);
          
          // Add to portfolio totals
          portfoliosByChain[chainId].totalValueUsd = portfoliosByChain[chainId].totalValueUsd.add(positionValue);
          portfoliosByChain[chainId].unrealizedPnL = portfoliosByChain[chainId].unrealizedPnL.add(unrealizedPnL);
        }
      }
      
      // Update portfolio records
      for (const [chainId, portfolio] of Object.entries(portfoliosByChain)) {
        await this.updatePortfolioRecord(userId, parseInt(chainId), portfolio);
      }
    } catch (error) {
      logger.error('Failed to update portfolio values', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async monitorRiskAcrossPortfolios(): Promise<void> {
    try {
      const query = 'SELECT DISTINCT user_id FROM user_portfolios WHERE total_value_usd > 1000';
      const users = await databaseService.query<{ user_id: string }>(query);
      
      for (const user of users) {
        const alerts = await this.getRiskAlerts(user.user_id);
        if (alerts.length > 0) {
          // Log high-severity alerts
          const highSeverityAlerts = alerts.filter(alert => alert.severity === 'high');
          if (highSeverityAlerts.length > 0) {
            logger.warn('High-severity risk alerts detected', {
              userId: user.user_id,
              alerts: highSeverityAlerts
            });
          }
        }
      }
    } catch (error) {
      logger.error('Risk monitoring failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper methods
  private async getUserTrades(userId: string): Promise<any[]> {
    try {
      const query = `
        SELECT te.*, tp.base_token_id, tp.quote_token_id
        FROM trade_executions te
        JOIN trading_orders tor ON te.order_id = tor.id
        JOIN trading_pairs tp ON te.pair_id = tp.id
        WHERE tor.user_id = $1
        ORDER BY te.executed_at DESC
        LIMIT 1000
      `;
      
      const trades = await databaseService.query(query, [userId]);
      return trades.map(trade => ({
        ...trade,
        quantity: BigNumber.from(trade.quantity),
        price: BigNumber.from(trade.price),
        fee: BigNumber.from(trade.fee),
        pnl: trade.pnl ? BigNumber.from(trade.pnl) : undefined,
        amount: BigNumber.from(trade.quantity).mul(BigNumber.from(trade.price))
      }));
    } catch (error) {
      logger.error('Failed to get user trades', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  private async calculateDayChange(userId: string): Promise<number> {
    // This would calculate the 24h portfolio change
    // For now, return 0
    return 0;
  }

  private async getHistoricalReturns(userId: string, days: number): Promise<number[]> {
    // This would fetch historical portfolio returns
    // For now, return empty array
    return [];
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    
    return Math.sqrt(variance) * Math.sqrt(365); // Annualized volatility
  }

  private calculateSharpeRatio(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = this.calculateVolatility(returns);
    const riskFreeRate = 0.02; // 2% annual risk-free rate
    
    return volatility > 0 ? (mean * 365 - riskFreeRate) / volatility : 0;
  }

  private calculateSortinoRatio(returns: number[]): number {
    if (returns.length < 2) return 0;
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const negativeReturns = returns.filter(r => r < 0);
    
    if (negativeReturns.length === 0) return Infinity;
    
    const downstdDev = Math.sqrt(
      negativeReturns.reduce((sum, r) => sum + r * r, 0) / negativeReturns.length
    );
    
    return downstdDev > 0 ? (mean * 365) / (downstdDev * Math.sqrt(365)) : 0;
  }

  private calculateMaxDrawdown(returns: number[]): number {
    if (returns.length === 0) return 0;
    
    let peak = 0;
    let maxDrawdown = 0;
    let cumulative = 0;
    
    for (const returnValue of returns) {
      cumulative += returnValue;
      peak = Math.max(peak, cumulative);
      const drawdown = (peak - cumulative) / peak * 100;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    return maxDrawdown;
  }

  private calculateVaR(returns: number[], confidence: number): BigNumber {
    if (returns.length === 0) return BigNumber.from(0);
    
    const sortedReturns = returns.sort((a, b) => a - b);
    const index = Math.floor((1 - confidence) * sortedReturns.length);
    const varReturn = sortedReturns[index] || 0;
    
    // Convert to absolute value (this would need portfolio value)
    return BigNumber.from(Math.floor(Math.abs(varReturn) * 1000000000000000000)); // Placeholder
  }

  private async calculateBeta(userId: string): Promise<number> {
    // This would calculate portfolio beta vs market
    // For now, return 1
    return 1;
  }

  private async calculateAverageHoldingPeriod(userId: string): Promise<number> {
    // This would calculate average holding period in days
    // For now, return 0
    return 0;
  }

  private async calculateTurnoverRate(userId: string): Promise<number> {
    // This would calculate portfolio turnover rate
    // For now, return 0
    return 0;
  }

  private async getPortfolioValue(userId: string): Promise<BigNumber> {
    const portfolios = await this.getUserPortfolios(userId);
    return portfolios.reduce((sum, p) => sum.add(p.totalValueUsd), BigNumber.from(0));
  }

  private async getCurrentTokenPrice(tokenId: string): Promise<BigNumber | null> {
    try {
      const query = 'SELECT symbol FROM tokens WHERE id = $1';
      const token = await databaseService.queryOne<{ symbol: string }>(query, [tokenId]);
      
      if (!token) return null;
      
      const prices = await priceOracleService.getCurrentPrices([token.symbol]);
      const price = prices[token.symbol];
      
      return price ? price.price : null;
    } catch (error) {
      logger.error('Failed to get current token price', {
        tokenId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  private async updatePositionPriceAndPnL(positionId: string, currentPrice: BigNumber, unrealizedPnL: BigNumber): Promise<void> {
    const query = `
      UPDATE trading_positions 
      SET current_price = $1, unrealized_pnl = $2, last_updated = NOW()
      WHERE id = $3
    `;
    
    await databaseService.query(query, [
      currentPrice.toString(),
      unrealizedPnL.toString(),
      positionId
    ]);
  }

  private async updatePortfolioRecord(userId: string, chainId: number, portfolio: UserPortfolio): Promise<void> {
    const query = `
      INSERT INTO user_portfolios (user_id, chain_id, total_value_usd, unrealized_pnl, realized_pnl, total_fees_paid, last_calculated)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (user_id, chain_id) DO UPDATE SET
        total_value_usd = EXCLUDED.total_value_usd,
        unrealized_pnl = EXCLUDED.unrealized_pnl,
        last_calculated = EXCLUDED.last_calculated
    `;
    
    await databaseService.query(query, [
      userId,
      chainId,
      portfolio.totalValueUsd.toString(),
      portfolio.unrealizedPnL.toString(),
      portfolio.realizedPnL.toString(),
      portfolio.totalFeesPaid.toString()
    ]);
  }

  async cleanup(): Promise<void> {
    logger.info('Portfolio Service cleaned up');
  }
}

export const portfolioService = new PortfolioService();
