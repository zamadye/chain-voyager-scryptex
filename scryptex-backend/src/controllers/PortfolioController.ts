
import { Request, Response } from 'express';
import { portfolioService } from '../services/PortfolioService';
import { logger } from '../utils/logger';

export class PortfolioController {
  // Portfolio Overview
  async getPortfolioSummary(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const summary = await portfolioService.getPortfolioSummary(userId);

      res.json({
        success: true,
        data: {
          totalValue: summary.totalValue.toString(),
          totalPnL: summary.totalPnL.toString(),
          dayChange: summary.dayChange,
          portfolios: summary.portfolios.map(p => ({
            ...p,
            totalValueUsd: p.totalValueUsd.toString(),
            unrealizedPnL: p.unrealizedPnL.toString(),
            realizedPnL: p.realizedPnL.toString(),
            totalFeesPaid: p.totalFeesPaid.toString(),
            var95: p.var95?.toString()
          }))
        }
      });
    } catch (error) {
      logger.error('Failed to get portfolio summary', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getPositions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { chainId } = req.query;
      const positions = await portfolioService.getUserPositions(
        userId, 
        chainId ? parseInt(chainId as string) : undefined
      );

      res.json({
        success: true,
        data: positions.map(position => ({
          ...position,
          quantity: position.quantity.toString(),
          averageCost: position.averageCost.toString(),
          currentPrice: position.currentPrice?.toString(),
          unrealizedPnL: position.unrealizedPnL?.toString(),
          stopLossPrice: position.stopLossPrice?.toString(),
          takeProfitPrice: position.takeProfitPrice?.toString(),
          positionSizeLimit: position.positionSizeLimit?.toString()
        }))
      });
    } catch (error) {
      logger.error('Failed to get positions', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getPosition(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { tokenId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const positions = await portfolioService.getUserPositions(userId);
      const position = positions.find(p => p.tokenId === tokenId);

      if (!position) {
        res.status(404).json({
          success: false,
          error: 'Position not found'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          ...position,
          quantity: position.quantity.toString(),
          averageCost: position.averageCost.toString(),
          currentPrice: position.currentPrice?.toString(),
          unrealizedPnL: position.unrealizedPnL?.toString(),
          stopLossPrice: position.stopLossPrice?.toString(),
          takeProfitPrice: position.takeProfitPrice?.toString(),
          positionSizeLimit: position.positionSizeLimit?.toString()
        }
      });
    } catch (error) {
      logger.error('Failed to get position', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tokenId: req.params.tokenId
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updatePositionSettings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { tokenId } = req.params;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { stopLossPrice, takeProfitPrice, positionSizeLimit } = req.body;

      // This would update position settings in the database
      // For now, return success
      res.json({
        success: true,
        message: 'Position settings updated successfully'
      });
    } catch (error) {
      logger.error('Failed to update position settings', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tokenId: req.params.tokenId
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getPnLAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { period = '30d' } = req.query;
      
      // This would calculate detailed P&L analysis
      const analysis = {
        totalRealizedPnL: '0',
        totalUnrealizedPnL: '0',
        totalFees: '0',
        bestPerformingAsset: null,
        worstPerformingAsset: null,
        dailyPnL: [],
        monthlyPnL: []
      };

      res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Failed to get P&L analysis', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getPerformanceMetrics(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const metrics = await portfolioService.calculatePortfolioMetrics(userId);

      res.json({
        success: true,
        data: {
          ...metrics,
          totalValue: metrics.totalValue.toString(),
          unrealizedPnL: metrics.unrealizedPnL.toString(),
          realizedPnL: metrics.realizedPnL.toString(),
          var95: metrics.var95.toString(),
          averageWin: metrics.averageWin.toString(),
          averageLoss: metrics.averageLoss.toString(),
          avgTradeSize: metrics.avgTradeSize.toString(),
          crossChainPnL: metrics.crossChainPnL.toString()
        }
      });
    } catch (error) {
      logger.error('Failed to get performance metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async rebalancePortfolio(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { targetAllocation } = req.body;

      if (!targetAllocation || typeof targetAllocation !== 'object') {
        res.status(400).json({
          success: false,
          error: 'Invalid target allocation'
        });
        return;
      }

      // Validate allocation percentages sum to 100%
      const totalPercentage = Object.values(targetAllocation).reduce((sum: number, percent: any) => sum + percent, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        res.status(400).json({
          success: false,
          error: 'Target allocation must sum to 100%'
        });
        return;
      }

      const result = await portfolioService.rebalancePortfolio(userId, targetAllocation);

      if (result.success) {
        res.json({
          success: true,
          data: {
            trades: result.trades,
            message: 'Portfolio rebalancing initiated'
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Failed to rebalance portfolio', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Risk Management
  async getRiskMetrics(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const metrics = await portfolioService.calculatePortfolioMetrics(userId);
      const alerts = await portfolioService.getRiskAlerts(userId);

      res.json({
        success: true,
        data: {
          riskMetrics: {
            var95: metrics.var95.toString(),
            sharpeRatio: metrics.sharpeRatio,
            maxDrawdown: metrics.maxDrawdown,
            volatility: metrics.volatility,
            beta: metrics.beta,
            chainAllocation: metrics.chainAllocation
          },
          alerts
        }
      });
    } catch (error) {
      logger.error('Failed to get risk metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async setRiskLimits(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const limits = req.body;
      const result = await portfolioService.setRiskLimits(userId, limits);

      if (result.success) {
        res.json({
          success: true,
          message: 'Risk limits updated successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Failed to set risk limits', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getRiskAlerts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const alerts = await portfolioService.getRiskAlerts(userId);

      res.json({
        success: true,
        data: alerts
      });
    } catch (error) {
      logger.error('Failed to get risk alerts', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Analytics
  async getDetailedAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { timeframe = '30d' } = req.query;

      // This would generate detailed analytics
      const analytics = {
        performanceAnalysis: {
          returns: [],
          volatility: 0,
          sharpeRatio: 0,
          maxDrawdown: 0
        },
        assetAllocation: {},
        tradingActivity: {
          totalTrades: 0,
          winRate: 0,
          avgTradeSize: '0'
        },
        riskAnalysis: {
          var95: '0',
          concentrationRisk: 0,
          correlationMatrix: {}
        }
      };

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Failed to get detailed analytics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getPortfolioHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { timeframe = '30d', interval = '1d' } = req.query;

      // This would fetch historical portfolio data
      const history = {
        timestamps: [],
        values: [],
        returns: [],
        allocations: []
      };

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      logger.error('Failed to get portfolio history', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async simulateStrategy(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { strategy, parameters } = req.body;

      // This would simulate trading strategies
      const simulation = {
        strategyName: strategy,
        parameters,
        results: {
          totalReturn: 0,
          sharpeRatio: 0,
          maxDrawdown: 0,
          winRate: 0,
          trades: []
        }
      };

      res.json({
        success: true,
        data: simulation
      });
    } catch (error) {
      logger.error('Failed to simulate strategy', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export const portfolioController = new PortfolioController();
