
import { Request, Response } from 'express';
import { swapService } from '../services/SwapService';
import { logger } from '../utils/logger';
import {
  SwapQuoteRequest,
  SwapExecuteRequest,
  OptimalRouteRequest,
  DEXName,
  SwapType
} from '../types/swap';

export class SwapController {
  // Swap operations
  async getSwapQuote(req: Request, res: Response): Promise<void> {
    try {
      const { tokenIn, tokenOut, amountIn, chainId, dex, swapType, slippageTolerance } = req.query;
      
      if (!tokenIn || !tokenOut || !amountIn || !chainId) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: tokenIn, tokenOut, amountIn, chainId'
        });
        return;
      }

      const quoteRequest: SwapQuoteRequest = {
        tokenIn: tokenIn as string,
        tokenOut: tokenOut as string,
        amountIn: amountIn as string,
        chainId: parseInt(chainId as string),
        dex: dex as DEXName,
        swapType: swapType as SwapType,
        slippageTolerance: slippageTolerance ? parseFloat(slippageTolerance as string) : 0.5
      };

      const quote = await swapService.getSwapQuote(quoteRequest);

      if (quote) {
        res.json({
          success: true,
          data: {
            ...quote,
            amountIn: quote.amountIn.toString(),
            amountOut: quote.amountOut.toString(),
            tradingFee: quote.tradingFee.toString(),
            platformFee: quote.platformFee.toString(),
            route: quote.route.map(r => ({
              ...r,
              amountIn: r.amountIn.toString(),
              amountOut: r.amountOut.toString()
            }))
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Unable to get quote for this token pair'
        });
      }

    } catch (error) {
      logger.error('Failed to get swap quote', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query: req.query
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async executeSwap(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const executeRequest: SwapExecuteRequest = req.body;
      
      // Validate required fields
      if (!executeRequest.tokenIn || !executeRequest.tokenOut || !executeRequest.amountIn || 
          !executeRequest.minAmountOut || !executeRequest.chainId || !executeRequest.dex) {
        res.status(400).json({
          success: false,
          error: 'Missing required swap parameters'
        });
        return;
      }

      const result = await swapService.executeSwap(userId, executeRequest);

      if (result.success) {
        res.json({
          success: true,
          data: {
            txHash: result.txHash,
            amountOut: result.amountOut?.toString(),
            actualPriceImpact: result.actualPriceImpact,
            actualSlippage: result.actualSlippage,
            gasUsed: result.gasUsed,
            tradingFee: result.tradingFee?.toString()
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Failed to execute swap', {
        error: error instanceof Error ? error.message : 'Unknown error',
        body: req.body
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getSwapStatus(req: Request, res: Response): Promise<void> {
    try {
      const { txHash } = req.params;
      
      if (!txHash) {
        res.status(400).json({
          success: false,
          error: 'Transaction hash is required'
        });
        return;
      }

      // Implementation to get swap status by transaction hash
      res.json({
        success: true,
        data: {
          txHash,
          status: 'completed',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to get swap status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        txHash: req.params.txHash
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getSwapHistory(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;
      const { limit = 50, offset = 0, dex, status } = req.query;
      
      const userAddress = address || req.user?.walletAddress;
      if (!userAddress) {
        res.status(400).json({
          success: false,
          error: 'User address is required'
        });
        return;
      }

      // Implementation to get user swap history
      res.json({
        success: true,
        data: {
          swaps: [],
          pagination: {
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            total: 0
          }
        }
      });

    } catch (error) {
      logger.error('Failed to get swap history', {
        error: error instanceof Error ? error.message : 'Unknown error',
        params: req.params,
        query: req.query
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getOptimalRoute(req: Request, res: Response): Promise<void> {
    try {
      const { tokenIn, tokenOut, amountIn, preferredDEX, optimization } = req.query;
      
      if (!tokenIn || !tokenOut || !amountIn) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: tokenIn, tokenOut, amountIn'
        });
        return;
      }

      const routeRequest: OptimalRouteRequest = {
        tokenIn: tokenIn as string,
        tokenOut: tokenOut as string,
        amountIn: amountIn as string,
        preferredDEX: preferredDEX as DEXName,
        optimization: optimization as 'price' | 'gas' | 'time' | 'points'
      };

      const optimalRoute = await swapService.findOptimalRoute(routeRequest);

      res.json({
        success: true,
        data: {
          ...optimalRoute,
          estimatedAmountOut: optimalRoute.estimatedAmountOut.toString(),
          estimatedFee: optimalRoute.estimatedFee.toString(),
          alternativeRoutes: optimalRoute.alternativeRoutes.map(route => ({
            ...route,
            amountIn: route.amountIn.toString(),
            amountOut: route.amountOut.toString(),
            tradingFee: route.tradingFee.toString(),
            platformFee: route.platformFee.toString()
          }))
        }
      });

    } catch (error) {
      logger.error('Failed to get optimal route', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query: req.query
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // DEX-specific endpoints
  async getCloberOrderBook(req: Request, res: Response): Promise<void> {
    try {
      const { pair } = req.params;
      
      if (!pair) {
        res.status(400).json({
          success: false,
          error: 'Trading pair is required'
        });
        return;
      }

      // Implementation for Clober order book
      res.json({
        success: true,
        data: {
          pair,
          bids: [],
          asks: [],
          spread: '0',
          lastUpdate: Date.now()
        }
      });

    } catch (error) {
      logger.error('Failed to get Clober order book', {
        error: error instanceof Error ? error.message : 'Unknown error',
        pair: req.params.pair
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getGTERealtimePrice(req: Request, res: Response): Promise<void> {
    try {
      const { pair } = req.params;
      
      if (!pair) {
        res.status(400).json({
          success: false,
          error: 'Trading pair is required'
        });
        return;
      }

      // Implementation for GTE real-time price
      res.json({
        success: true,
        data: {
          pair,
          price: '0',
          timestamp: Date.now(),
          volume24h: '0'
        }
      });

    } catch (error) {
      logger.error('Failed to get GTE real-time price', {
        error: error instanceof Error ? error.message : 'Unknown error',
        pair: req.params.pair
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getPharosRWATokens(req: Request, res: Response): Promise<void> {
    try {
      // Implementation for Pharos RWA tokens
      res.json({
        success: true,
        data: {
          rwaTokens: []
        }
      });

    } catch (error) {
      logger.error('Failed to get Pharos RWA tokens', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Point and analytics endpoints
  async getTradingPoints(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;
      const userAddress = address || req.user?.walletAddress;
      
      if (!userAddress) {
        res.status(400).json({
          success: false,
          error: 'User address is required'
        });
        return;
      }

      const stats = await swapService.getUserTradingStats(userAddress);

      if (stats) {
        res.json({
          success: true,
          data: {
            ...stats,
            totalTradingVolumeUsd: stats.totalTradingVolumeUsd.toString()
          }
        });
      } else {
        res.json({
          success: true,
          data: {
            userAddress,
            totalTradingPoints: 0,
            swapPoints: 0,
            bonusPoints: 0,
            totalSwaps: 0,
            tradingLevel: 1
          }
        });
      }

    } catch (error) {
      logger.error('Failed to get trading points', {
        error: error instanceof Error ? error.message : 'Unknown error',
        address: req.params.address
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getTradingLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 50, period = 'all_time' } = req.query;

      // Implementation for trading leaderboard
      res.json({
        success: true,
        data: {
          leaderboard: [],
          period,
          lastUpdated: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to get trading leaderboard', {
        error: error instanceof Error ? error.message : 'Unknown error',
        query: req.query
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getTradingAchievements(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;
      const userAddress = address || req.user?.walletAddress;
      
      if (!userAddress) {
        res.status(400).json({
          success: false,
          error: 'User address is required'
        });
        return;
      }

      // Implementation for user achievements
      res.json({
        success: true,
        data: {
          achievements: [],
          totalAchievements: 0,
          recentUnlocks: []
        }
      });

    } catch (error) {
      logger.error('Failed to get trading achievements', {
        error: error instanceof Error ? error.message : 'Unknown error',
        address: req.params.address
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Daily tasks
  async getDailyTradingTasks(req: Request, res: Response): Promise<void> {
    try {
      const tasks = await swapService.getDailyTradingTasks();

      res.json({
        success: true,
        data: {
          tasks,
          date: new Date().toISOString().split('T')[0]
        }
      });

    } catch (error) {
      logger.error('Failed to get daily trading tasks', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getUserTaskProgress(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;
      const userAddress = address || req.user?.walletAddress;
      
      if (!userAddress) {
        res.status(400).json({
          success: false,
          error: 'User address is required'
        });
        return;
      }

      const progress = await swapService.getUserTaskProgress(userAddress);

      res.json({
        success: true,
        data: {
          progress: progress.map(p => ({
            ...p,
            currentVolumeUsd: p.currentVolumeUsd.toString()
          })),
          date: new Date().toISOString().split('T')[0],
          userAddress
        }
      });

    } catch (error) {
      logger.error('Failed to get user task progress', {
        error: error instanceof Error ? error.message : 'Unknown error',
        address: req.params.address
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getTradingAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { address } = req.params;
      const { timeframe = '30d' } = req.query;
      
      const userAddress = address || req.user?.walletAddress;
      if (!userAddress) {
        res.status(400).json({
          success: false,
          error: 'User address is required'
        });
        return;
      }

      const analytics = await swapService.getTradingAnalytics(userAddress, timeframe as string);

      res.json({
        success: true,
        data: {
          ...analytics,
          totalVolumeUsd: analytics.totalVolumeUsd.toString(),
          averageSwapSizeUsd: analytics.averageSwapSizeUsd.toString(),
          profitLoss: analytics.profitLoss.toString(),
          favoriteTokens: analytics.favoriteTokens.map(t => ({
            ...t,
            volume: t.volume.toString()
          })),
          favoriteDEXs: analytics.favoriteDEXs.map(d => ({
            ...d,
            volume: d.volume.toString()
          })),
          dailyActivity: analytics.dailyActivity.map(d => ({
            ...d,
            volume: d.volume.toString()
          }))
        }
      });

    } catch (error) {
      logger.error('Failed to get trading analytics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        address: req.params.address,
        timeframe: req.query.timeframe
      });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export const swapController = new SwapController();
