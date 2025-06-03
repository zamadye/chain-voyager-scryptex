
import { Request, Response } from 'express';
import { bridgeService } from '../services/BridgeService';
import { logger } from '../utils/logger';
import { BigNumber } from 'ethers';
import { BridgeParams } from '../types/bridge';

export class BridgeController {
  // Bridge Operations
  async initiateBridge(req: Request, res: Response): Promise<void> {
    try {
      const {
        fromChain,
        toChain,
        tokenAddress,
        amount,
        recipient,
        preferredRoute
      } = req.body;

      const userAddress = req.user?.walletAddress || req.body.userAddress;
      if (!userAddress) {
        res.status(401).json({ success: false, error: 'User address required' });
        return;
      }

      const bridgeParams: BridgeParams & { preferredRoute?: string } = {
        fromChain: parseInt(fromChain),
        toChain: parseInt(toChain),
        tokenAddress,
        amount: BigNumber.from(amount),
        recipient: recipient || userAddress,
        userAddress,
        preferredRoute
      };

      const result = await bridgeService.coordinateMultiChainBridge(bridgeParams);

      res.json({
        success: true,
        data: {
          bridgeId: result.bridgeResult.bridgeId,
          bridgeProvider: result.bridgeProvider,
          transactionHash: result.bridgeResult.txHash,
          pointsAwarded: result.pointsAwarded,
          estimatedTime: result.bridgeResult.estimatedTime,
          actualFee: result.bridgeResult.actualFee?.toString(),
          selectedRoute: result.route,
          optimization: result.optimization
        }
      });

    } catch (error) {
      logger.error('Failed to initiate bridge', {
        error: error instanceof Error ? error.message : 'Unknown error',
        body: req.body
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initiate bridge'
      });
    }
  }

  async getBridgeStatus(req: Request, res: Response): Promise<void> {
    try {
      const { bridgeId } = req.params;

      const status = await bridgeService.getBridgeStatus(bridgeId);

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      logger.error('Failed to get bridge status', {
        bridgeId: req.params.bridgeId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get bridge status'
      });
    }
  }

  async getBridgeQuote(req: Request, res: Response): Promise<void> {
    try {
      const { fromChain, toChain, amount, strategy } = req.query;

      if (!fromChain || !toChain || !amount) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: fromChain, toChain, amount'
        });
        return;
      }

      const routeOptimization = await bridgeService.selectOptimalBridgeRoute(
        parseInt(fromChain as string),
        parseInt(toChain as string),
        BigNumber.from(amount as string),
        (strategy as any) || 'fastest'
      );

      res.json({
        success: true,
        data: {
          selectedRoute: routeOptimization.selectedRoute,
          alternativeRoutes: routeOptimization.alternativeRoutes,
          strategy: routeOptimization.strategy,
          recommendation: routeOptimization.reasonForSelection
        }
      });

    } catch (error) {
      logger.error('Failed to get bridge quote', {
        query: req.query,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get bridge quote'
      });
    }
  }

  async getUserBridgeHistory(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const userAddress = address || req.user?.walletAddress;
      if (!userAddress) {
        res.status(401).json({ success: false, error: 'User address required' });
        return;
      }

      const history = await bridgeService.getUserBridgeHistory(
        userAddress,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      res.json({
        success: true,
        data: {
          bridges: history.map(bridge => ({
            ...bridge,
            amount: bridge.amount.toString(),
            bridgeFee: bridge.bridgeFee.toString(),
            gasFee: bridge.gasFee?.toString(),
            totalCost: bridge.totalCost.toString()
          })),
          pagination: {
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            total: history.length
          }
        }
      });

    } catch (error) {
      logger.error('Failed to get user bridge history', {
        address: req.params.address,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get bridge history'
      });
    }
  }

  // Point System APIs
  async getUserPoints(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;

      const userAddress = address || req.user?.walletAddress;
      if (!userAddress) {
        res.status(401).json({ success: false, error: 'User address required' });
        return;
      }

      const userPoints = await bridgeService.getUserPoints(userAddress);

      if (!userPoints) {
        res.json({
          success: true,
          data: {
            userAddress,
            totalPoints: 0,
            bridgePoints: 0,
            totalBridges: 0,
            rank: 0,
            achievements: []
          }
        });
        return;
      }

      res.json({
        success: true,
        data: {
          ...userPoints,
          totalBridgeVolume: userPoints.totalBridgeVolume.toString()
        }
      });

    } catch (error) {
      logger.error('Failed to get user points', {
        address: req.params.address,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user points'
      });
    }
  }

  async getBridgeLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 50, period = 'all_time' } = req.query;

      // Get leaderboard based on total bridge points
      const leaderboard = await this.getBridgeLeaderboardData(
        parseInt(limit as string),
        period as string
      );

      res.json({
        success: true,
        data: {
          leaderboard,
          period,
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to get bridge leaderboard', {
        query: req.query,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get leaderboard'
      });
    }
  }

  async getBridgeAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;
      const { timeframe = '30d' } = req.query;

      const userAddress = address || req.user?.walletAddress;
      if (!userAddress) {
        res.status(401).json({ success: false, error: 'User address required' });
        return;
      }

      const analytics = await this.getUserBridgeAnalytics(userAddress, timeframe as string);

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      logger.error('Failed to get bridge analytics', {
        address: req.params.address,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics'
      });
    }
  }

  async getGlobalBridgeAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { timeframe = '30d' } = req.query;

      const analytics = await this.getGlobalAnalytics(timeframe as string);

      res.json({
        success: true,
        data: analytics
      });

    } catch (error) {
      logger.error('Failed to get global bridge analytics', {
        query: req.query,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get global analytics'
      });
    }
  }

  // Daily Tasks APIs
  async getDailyTasks(req: Request, res: Response): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const tasks = await this.getDailyBridgeTasks(today);

      res.json({
        success: true,
        data: {
          tasks,
          date: today
        }
      });

    } catch (error) {
      logger.error('Failed to get daily tasks', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get daily tasks'
      });
    }
  }

  async getUserTaskProgress(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;
      const userAddress = address || req.user?.walletAddress;
      
      if (!userAddress) {
        res.status(401).json({ success: false, error: 'User address required' });
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const progress = await this.getUserDailyTaskProgress(userAddress, today);

      res.json({
        success: true,
        data: {
          progress,
          date: today,
          userAddress
        }
      });

    } catch (error) {
      logger.error('Failed to get user task progress', {
        address: req.params.address,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get task progress'
      });
    }
  }

  // Private helper methods
  private async getBridgeLeaderboardData(limit: number, period: string): Promise<any[]> {
    // Implementation for getting leaderboard data
    return [];
  }

  private async getUserBridgeAnalytics(userAddress: string, timeframe: string): Promise<any> {
    // Implementation for user analytics
    return {
      totalBridges: 0,
      totalVolume: '0',
      averageAmount: '0',
      favoriteChains: [],
      pointsEarned: 0
    };
  }

  private async getGlobalAnalytics(timeframe: string): Promise<any> {
    // Implementation for global analytics
    return {
      totalBridges: 0,
      totalVolume: '0',
      totalUsers: 0,
      popularRoutes: [],
      providerStats: {}
    };
  }

  private async getDailyBridgeTasks(date: string): Promise<any[]> {
    // Implementation for getting daily tasks
    return [];
  }

  private async getUserDailyTaskProgress(userAddress: string, date: string): Promise<any[]> {
    // Implementation for getting user task progress
    return [];
  }
}

export const bridgeController = new BridgeController();
