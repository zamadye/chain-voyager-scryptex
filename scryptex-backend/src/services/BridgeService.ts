
import { BigNumber, ethers } from 'ethers';
import { databaseService } from './DatabaseService';
import { logger } from '../utils/logger';
import { 
  BridgeParams, 
  BridgeResult, 
  UnifiedBridgeResult, 
  BridgeRoute, 
  RouteOptimization,
  PointCalculationResult,
  PointAwardResult,
  BridgeTransaction,
  UserPoints,
  BridgeActivity,
  TransactionValidation
} from '../types/bridge';

export class BridgeService {
  private riseChainService: RiseChainBridgeService;
  private pharosService: PharosNetworkBridgeService;
  private megaETHService: MegaETHBridgeService;
  private pointService: BridgePointService;
  private monitorService: BridgeTransactionMonitor;

  constructor() {
    this.riseChainService = new RiseChainBridgeService();
    this.pharosService = new PharosNetworkBridgeService();
    this.megaETHService = new MegaETHBridgeService();
    this.pointService = new BridgePointService();
    this.monitorService = new BridgeTransactionMonitor();
    
    this.initializeBridgeService();
  }

  private async initializeBridgeService(): Promise<void> {
    logger.info('Initializing Bridge Service');
    
    // Initialize all bridge providers
    await Promise.all([
      this.riseChainService.initialize(),
      this.pharosService.initialize(),
      this.megaETHService.initialize()
    ]);
    
    // Start transaction monitoring
    await this.monitorService.initializeEventListeners();
    
    logger.info('Bridge Service initialized successfully');
  }

  // Unified Bridge Orchestration
  async coordinateMultiChainBridge(params: BridgeParams & {
    preferredRoute?: 'fastest' | 'cheapest' | 'most_secure' | 'most_points';
  }): Promise<UnifiedBridgeResult> {
    try {
      // Get optimal route
      const routeOptimization = await this.selectOptimalBridgeRoute(
        params.fromChain,
        params.toChain,
        params.amount,
        params.preferredRoute || 'fastest'
      );

      let bridgeResult: BridgeResult;
      let pointsAwarded = 0;

      // Execute bridge based on selected provider
      switch (routeOptimization.selectedRoute.provider) {
        case 'risechain':
          bridgeResult = await this.riseChainService.bridgeToRiseChain(params);
          break;
        case 'pharos':
          bridgeResult = await this.pharosService.bridgeToPharos(params);
          break;
        case 'megaeth':
          bridgeResult = await this.megaETHService.bridgeToMegaETH(params);
          break;
        default:
          throw new Error('Invalid bridge provider');
      }

      // Calculate and award points if bridge was successful
      if (bridgeResult.success && bridgeResult.bridgeId) {
        const pointCalculation = await this.pointService.calculateBridgePoints({
          amount: params.amount,
          sourceChain: params.fromChain,
          targetChain: params.toChain,
          userAddress: params.userAddress,
          bridgeProvider: routeOptimization.selectedRoute.provider,
          isFirstBridgeToday: await this.isFirstBridgeToday(params.userAddress),
          userDailyBridgeCount: await this.getUserDailyBridgeCount(params.userAddress)
        });

        const pointAward = await this.pointService.awardPointsForBridge(
          params.userAddress,
          bridgeResult.txHash!,
          pointCalculation
        );

        pointsAwarded = pointAward.pointsAwarded;

        // Save bridge transaction to database
        await this.saveBridgeTransaction({
          userAddress: params.userAddress,
          sourceChainId: params.fromChain,
          targetChainId: params.toChain,
          bridgeProvider: routeOptimization.selectedRoute.provider,
          tokenAddress: params.tokenAddress,
          amount: params.amount,
          bridgeId: bridgeResult.bridgeId,
          sourceTxHash: bridgeResult.txHash,
          bridgeFee: bridgeResult.actualFee || BigNumber.from(0),
          pointsAwarded,
          pointCalculationDetails: pointCalculation
        });
      }

      return {
        bridgeProvider: routeOptimization.selectedRoute.provider,
        bridgeResult,
        pointsAwarded,
        route: routeOptimization.selectedRoute,
        optimization: routeOptimization
      };

    } catch (error) {
      logger.error('Failed to coordinate multi-chain bridge', {
        params,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async selectOptimalBridgeRoute(
    sourceChain: number,
    targetChain: number,
    amount: BigNumber,
    strategy: 'fastest' | 'cheapest' | 'most_secure' | 'most_points' = 'fastest'
  ): Promise<RouteOptimization> {
    try {
      const availableRoutes = await this.getAvailableRoutes(sourceChain, targetChain, amount);
      
      if (availableRoutes.length === 0) {
        throw new Error('No available routes for this bridge');
      }

      let selectedRoute: BridgeRoute;
      let reasonForSelection: string;

      switch (strategy) {
        case 'fastest':
          selectedRoute = availableRoutes.reduce((fastest, current) => 
            current.estimatedTime < fastest.estimatedTime ? current : fastest
          );
          reasonForSelection = `Selected for fastest completion time: ${selectedRoute.estimatedTime}s`;
          break;

        case 'cheapest':
          selectedRoute = availableRoutes.reduce((cheapest, current) => 
            current.estimatedFee.lt(cheapest.estimatedFee) ? current : cheapest
          );
          reasonForSelection = `Selected for lowest fee: ${ethers.utils.formatEther(selectedRoute.estimatedFee)} ETH`;
          break;

        case 'most_secure':
          selectedRoute = availableRoutes.reduce((mostSecure, current) => 
            current.securityScore > mostSecure.securityScore ? current : mostSecure
          );
          reasonForSelection = `Selected for highest security score: ${selectedRoute.securityScore}/100`;
          break;

        case 'most_points':
          selectedRoute = availableRoutes.reduce((mostPoints, current) => 
            current.pointsReward > mostPoints.pointsReward ? current : mostPoints
          );
          reasonForSelection = `Selected for maximum points reward: ${selectedRoute.pointsReward} points`;
          break;

        default:
          selectedRoute = availableRoutes[0];
          reasonForSelection = 'Default selection';
      }

      const alternativeRoutes = availableRoutes.filter(route => route !== selectedRoute);

      return {
        strategy,
        selectedRoute,
        alternativeRoutes,
        reasonForSelection
      };

    } catch (error) {
      logger.error('Failed to select optimal bridge route', {
        sourceChain,
        targetChain,
        strategy,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async getAvailableRoutes(
    sourceChain: number,
    targetChain: number,
    amount: BigNumber
  ): Promise<BridgeRoute[]> {
    const routes: BridgeRoute[] = [];

    try {
      // Check RiseChain route
      if (await this.riseChainService.isRouteSupported(sourceChain, targetChain)) {
        const feeCalculation = await this.riseChainService.calculateRiseBridgeFees(amount, sourceChain, targetChain);
        routes.push({
          provider: 'risechain',
          sourceChain,
          targetChain,
          estimatedFee: feeCalculation.totalFee,
          estimatedTime: feeCalculation.estimatedTime,
          securityScore: 85, // RiseChain security score
          pointsReward: 10 // Base points for RiseChain
        });
      }

      // Check Pharos route
      if (await this.pharosService.isRouteSupported(sourceChain, targetChain)) {
        const feeCalculation = await this.pharosService.calculatePharosBridgeFees(amount, 'standard');
        routes.push({
          provider: 'pharos',
          sourceChain,
          targetChain,
          estimatedFee: feeCalculation.totalFee,
          estimatedTime: 120, // 2 minutes average
          securityScore: 90, // Higher due to compliance features
          pointsReward: 12 // Extra points for RWA capabilities
        });
      }

      // Check MegaETH route
      if (await this.megaETHService.isRouteSupported(sourceChain, targetChain)) {
        const feeCalculation = await this.megaETHService.calculateMegaETHBridgeFees(amount, false);
        routes.push({
          provider: 'megaeth',
          sourceChain,
          targetChain,
          estimatedFee: feeCalculation.totalFee,
          estimatedTime: 30, // Fastest due to real-time processing
          securityScore: 80, // Good but optimized for speed
          pointsReward: 13 // Highest points for real-time processing
        });
      }

    } catch (error) {
      logger.error('Error getting available routes', {
        sourceChain,
        targetChain,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return routes;
  }

  // Bridge Status and Management
  async getBridgeStatus(bridgeId: string): Promise<any> {
    try {
      const transaction = await this.getBridgeTransactionById(bridgeId);
      if (!transaction) {
        throw new Error('Bridge transaction not found');
      }

      // Check status from appropriate provider
      switch (transaction.bridgeProvider) {
        case 'risechain':
          return await this.riseChainService.trackBridgeStatus(bridgeId);
        case 'pharos':
          return await this.pharosService.trackBridgeStatus(bridgeId);
        case 'megaeth':
          return await this.megaETHService.trackBridgeStatus(bridgeId);
        default:
          throw new Error('Unknown bridge provider');
      }
    } catch (error) {
      logger.error('Failed to get bridge status', {
        bridgeId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async getUserBridgeHistory(userAddress: string, limit = 50, offset = 0): Promise<BridgeTransaction[]> {
    try {
      const query = `
        SELECT * FROM bridge_transactions 
        WHERE user_address = $1 
        ORDER BY initiated_at DESC 
        LIMIT $2 OFFSET $3
      `;
      
      const transactions = await databaseService.query<BridgeTransaction>(
        query,
        [userAddress, limit, offset]
      );

      return transactions.map(tx => ({
        ...tx,
        amount: BigNumber.from(tx.amount),
        bridgeFee: BigNumber.from(tx.bridgeFee),
        gasFee: tx.gasFee ? BigNumber.from(tx.gasFee) : undefined,
        totalCost: BigNumber.from(tx.totalCost)
      }));

    } catch (error) {
      logger.error('Failed to get user bridge history', {
        userAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  async getUserPoints(userAddress: string): Promise<UserPoints | null> {
    try {
      const query = `
        SELECT * FROM user_points 
        WHERE user_address = $1
      `;
      
      const result = await databaseService.queryOne<UserPoints>(query, [userAddress]);
      
      if (result) {
        return {
          ...result,
          totalBridgeVolume: BigNumber.from(result.totalBridgeVolume)
        };
      }
      
      return null;

    } catch (error) {
      logger.error('Failed to get user points', {
        userAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  // Private helper methods
  private async isFirstBridgeToday(userAddress: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const query = `
        SELECT COUNT(*) as count FROM bridge_transactions 
        WHERE user_address = $1 
        AND DATE(initiated_at) = $2 
        AND bridge_status = 'completed'
      `;
      
      const result = await databaseService.queryOne<{ count: string }>(query, [userAddress, today]);
      return parseInt(result?.count || '0') === 0;

    } catch (error) {
      logger.error('Failed to check if first bridge today', {
        userAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  private async getUserDailyBridgeCount(userAddress: string): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const query = `
        SELECT COUNT(*) as count FROM bridge_transactions 
        WHERE user_address = $1 
        AND DATE(initiated_at) = $2 
        AND bridge_status IN ('completed', 'pending')
      `;
      
      const result = await databaseService.queryOne<{ count: string }>(query, [userAddress, today]);
      return parseInt(result?.count || '0');

    } catch (error) {
      logger.error('Failed to get user daily bridge count', {
        userAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 0;
    }
  }

  private async saveBridgeTransaction(transactionData: Partial<BridgeTransaction>): Promise<void> {
    try {
      const query = `
        INSERT INTO bridge_transactions (
          user_address, source_chain_id, target_chain_id, bridge_provider,
          token_address, token_symbol, amount, bridge_id, source_tx_hash,
          bridge_fee, total_cost, points_awarded, point_calculation_details,
          is_first_bridge_today
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `;

      await databaseService.query(query, [
        transactionData.userAddress,
        transactionData.sourceChainId,
        transactionData.targetChainId,
        transactionData.bridgeProvider,
        transactionData.tokenAddress,
        'ETH', // Default token symbol
        transactionData.amount?.toString(),
        transactionData.bridgeId,
        transactionData.sourceTxHash,
        transactionData.bridgeFee?.toString(),
        transactionData.bridgeFee?.toString(), // total cost = bridge fee for now
        transactionData.pointsAwarded,
        JSON.stringify(transactionData.pointCalculationDetails),
        await this.isFirstBridgeToday(transactionData.userAddress!)
      ]);

    } catch (error) {
      logger.error('Failed to save bridge transaction', {
        transactionData,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async getBridgeTransactionById(bridgeId: string): Promise<BridgeTransaction | null> {
    try {
      const query = `SELECT * FROM bridge_transactions WHERE bridge_id = $1`;
      const result = await databaseService.queryOne<BridgeTransaction>(query, [bridgeId]);
      
      if (result) {
        return {
          ...result,
          amount: BigNumber.from(result.amount),
          bridgeFee: BigNumber.from(result.bridgeFee),
          gasFee: result.gasFee ? BigNumber.from(result.gasFee) : undefined,
          totalCost: BigNumber.from(result.totalCost)
        };
      }
      
      return null;

    } catch (error) {
      logger.error('Failed to get bridge transaction by ID', {
        bridgeId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }
}

// Individual Bridge Service Classes (placeholder implementations)
class RiseChainBridgeService {
  async initialize(): Promise<void> {
    logger.info('Initializing RiseChain Bridge Service');
  }

  async bridgeToRiseChain(params: BridgeParams): Promise<BridgeResult> {
    return {
      success: true,
      bridgeId: `rise_${Date.now()}`,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      estimatedTime: 60,
      actualFee: BigNumber.from('1000000000000000') // 0.001 ETH
    };
  }

  async isRouteSupported(sourceChain: number, targetChain: number): Promise<boolean> {
    return true; // Simplified for demo
  }

  async calculateRiseBridgeFees(amount: BigNumber, sourceChain: number, targetChain: number): Promise<any> {
    return {
      totalFee: BigNumber.from('1000000000000000'), // 0.001 ETH
      estimatedTime: 60
    };
  }

  async trackBridgeStatus(bridgeId: string): Promise<any> {
    return {
      bridgeId,
      status: 'completed',
      timestamp: new Date()
    };
  }
}

class PharosNetworkBridgeService {
  async initialize(): Promise<void> {
    logger.info('Initializing Pharos Network Bridge Service');
  }

  async bridgeToPharos(params: BridgeParams): Promise<BridgeResult> {
    return {
      success: true,
      bridgeId: `pharos_${Date.now()}`,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      estimatedTime: 120,
      actualFee: BigNumber.from('1500000000000000') // 0.0015 ETH
    };
  }

  async isRouteSupported(sourceChain: number, targetChain: number): Promise<boolean> {
    return true; // Simplified for demo
  }

  async calculatePharosBridgeFees(amount: BigNumber, assetType: 'standard' | 'rwa'): Promise<any> {
    return {
      totalFee: BigNumber.from('1500000000000000'), // 0.0015 ETH
      estimatedTime: 120
    };
  }

  async trackBridgeStatus(bridgeId: string): Promise<any> {
    return {
      bridgeId,
      status: 'completed',
      timestamp: new Date()
    };
  }
}

class MegaETHBridgeService {
  async initialize(): Promise<void> {
    logger.info('Initializing MegaETH Bridge Service');
  }

  async bridgeToMegaETH(params: BridgeParams): Promise<BridgeResult> {
    return {
      success: true,
      bridgeId: `megaeth_${Date.now()}`,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      estimatedTime: 30,
      actualFee: BigNumber.from('800000000000000') // 0.0008 ETH
    };
  }

  async isRouteSupported(sourceChain: number, targetChain: number): Promise<boolean> {
    return true; // Simplified for demo
  }

  async calculateMegaETHBridgeFees(amount: BigNumber, realtimeMode: boolean): Promise<any> {
    return {
      totalFee: BigNumber.from('800000000000000'), // 0.0008 ETH
      estimatedTime: 30
    };
  }

  async trackBridgeStatus(bridgeId: string): Promise<any> {
    return {
      bridgeId,
      status: 'completed',
      timestamp: new Date()
    };
  }
}

class BridgePointService {
  async calculateBridgePoints(data: {
    amount: BigNumber;
    sourceChain: number;
    targetChain: number;
    userAddress: string;
    bridgeProvider: string;
    isFirstBridgeToday: boolean;
    userDailyBridgeCount: number;
  }): Promise<PointCalculationResult> {
    const basePoints = 10;
    let chainBonus = 0;
    let volumeBonus = 0;
    let timeBonus = 0;
    const dailyTaskBonus = 0;
    const achievementBonus = 0;

    // Chain-specific bonuses
    switch (data.bridgeProvider) {
      case 'pharos':
        chainBonus = 2;
        break;
      case 'megaeth':
        chainBonus = 3;
        break;
      default:
        chainBonus = 0;
    }

    // Volume bonuses
    const amountInEth = parseFloat(ethers.utils.formatEther(data.amount));
    if (amountInEth >= 10) {
      volumeBonus = 10;
    } else if (amountInEth >= 1) {
      volumeBonus = 5;
    }

    // First bridge of day bonus
    if (data.isFirstBridgeToday) {
      timeBonus = 5;
    }

    const totalPoints = basePoints + chainBonus + volumeBonus + timeBonus + dailyTaskBonus + achievementBonus;

    return {
      basePoints,
      chainBonus,
      volumeBonus,
      timeBonus,
      dailyTaskBonus,
      achievementBonus,
      totalPoints,
      calculation: {
        bridgeAmount: data.amount,
        bridgeProvider: data.bridgeProvider,
        isFirstBridgeToday: data.isFirstBridgeToday,
        consecutiveDaysBridging: 1,
        totalBridgesThisWeek: data.userDailyBridgeCount,
        volumeBracket: amountInEth >= 10 ? 'large' : amountInEth >= 1 ? 'medium' : 'small'
      }
    };
  }

  async awardPointsForBridge(
    userAddress: string,
    transactionHash: string,
    calculatedPoints: PointCalculationResult
  ): Promise<PointAwardResult> {
    try {
      // Update or create user points record
      await this.updateUserPoints(userAddress, calculatedPoints.totalPoints);

      // Record point transaction
      await this.recordPointTransaction({
        userAddress,
        pointType: 'bridge_completion',
        pointsAmount: calculatedPoints.totalPoints,
        description: `Bridge completion: ${calculatedPoints.totalPoints} points`,
        relatedTxHash: transactionHash
      });

      const userPoints = await this.getUserCurrentPoints(userAddress);

      return {
        pointsAwarded: calculatedPoints.totalPoints,
        newTotalPoints: userPoints.totalPoints,
        newRank: userPoints.rank || 0,
        dailyTasksCompleted: [],
        achievementsUnlocked: [],
        transactionHash
      };

    } catch (error) {
      logger.error('Failed to award points for bridge', {
        userAddress,
        transactionHash,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  private async updateUserPoints(userAddress: string, pointsToAdd: number): Promise<void> {
    const query = `
      INSERT INTO user_points (user_address, total_points, bridge_points, total_bridges, successful_bridges)
      VALUES ($1, $2, $2, 1, 1)
      ON CONFLICT (user_address) 
      DO UPDATE SET 
        total_points = user_points.total_points + $2,
        bridge_points = user_points.bridge_points + $2,
        total_bridges = user_points.total_bridges + 1,
        successful_bridges = user_points.successful_bridges + 1,
        last_activity_at = NOW(),
        updated_at = NOW()
    `;

    await databaseService.query(query, [userAddress, pointsToAdd]);
  }

  private async recordPointTransaction(data: {
    userAddress: string;
    pointType: string;
    pointsAmount: number;
    description: string;
    relatedTxHash?: string;
  }): Promise<void> {
    const query = `
      INSERT INTO point_transactions (user_address, point_type, points_amount, description, related_tx_hash)
      VALUES ($1, $2, $3, $4, $5)
    `;

    await databaseService.query(query, [
      data.userAddress,
      data.pointType,
      data.pointsAmount,
      data.description,
      data.relatedTxHash
    ]);
  }

  private async getUserCurrentPoints(userAddress: string): Promise<{ totalPoints: number; rank: number }> {
    const query = `
      SELECT total_points, 
             RANK() OVER (ORDER BY total_points DESC) as rank
      FROM user_points 
      WHERE user_address = $1
    `;

    const result = await databaseService.queryOne<{ total_points: number; rank: number }>(
      query, 
      [userAddress]
    );

    return {
      totalPoints: result?.total_points || 0,
      rank: result?.rank || 0
    };
  }
}

class BridgeTransactionMonitor {
  async initializeEventListeners(): Promise<void> {
    logger.info('Initializing Bridge Transaction Monitor');
    // Implementation for monitoring blockchain events
  }
}

export const bridgeService = new BridgeService();
