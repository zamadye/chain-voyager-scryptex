
import { Request, Response, NextFunction } from 'express';
import { chainService } from '@/services/chainService';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/utils/response';
import { RequestWithId } from '@/middleware/requestLogger';

export class ChainController {
  /**
   * Get all supported chains
   */
  static async getAllChains(req: RequestWithId, res: Response, next: NextFunction) {
    try {
      const { includeInactive = false } = req.query;
      
      const chains = await chainService.getAllChains({
        includeInactive: includeInactive === 'true'
      });

      logger.info('Chains retrieved successfully', {
        requestId: req.requestId,
        count: chains.length
      });

      return ApiResponse.success(res, chains, 'Chains retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving chains', {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  /**
   * Get specific chain details
   */
  static async getChainById(req: RequestWithId, res: Response, next: NextFunction) {
    try {
      const { chainId } = req.params;
      
      const chain = await chainService.getChainById(Number(chainId));

      if (!chain) {
        return ApiResponse.error(res, 'Chain not found', 404);
      }

      logger.info('Chain details retrieved successfully', {
        requestId: req.requestId,
        chainId
      });

      return ApiResponse.success(res, chain, 'Chain details retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving chain details', {
        requestId: req.requestId,
        chainId: req.params.chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  /**
   * Get chain status and health
   */
  static async getChainStatus(req: RequestWithId, res: Response, next: NextFunction) {
    try {
      const { chainId } = req.params;
      
      const status = await chainService.getChainStatus(Number(chainId));

      if (!status) {
        return ApiResponse.error(res, 'Chain status not available', 404);
      }

      logger.info('Chain status retrieved successfully', {
        requestId: req.requestId,
        chainId,
        isHealthy: status.isHealthy
      });

      return ApiResponse.success(res, status, 'Chain status retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving chain status', {
        requestId: req.requestId,
        chainId: req.params.chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  /**
   * Get current gas price for chain
   */
  static async getGasPrice(req: RequestWithId, res: Response, next: NextFunction) {
    try {
      const { chainId } = req.params;
      
      const gasPrice = await chainService.getCurrentGasPrice(Number(chainId));

      logger.info('Gas price retrieved successfully', {
        requestId: req.requestId,
        chainId,
        gasPrice: gasPrice.standard
      });

      return ApiResponse.success(res, gasPrice, 'Gas price retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving gas price', {
        requestId: req.requestId,
        chainId: req.params.chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  /**
   * Get supported tokens for chain
   */
  static async getChainTokens(req: RequestWithId, res: Response, next: NextFunction) {
    try {
      const { chainId } = req.params;
      
      const tokens = await chainService.getSupportedTokens(Number(chainId));

      logger.info('Chain tokens retrieved successfully', {
        requestId: req.requestId,
        chainId,
        count: tokens.length
      });

      return ApiResponse.success(res, tokens, 'Chain tokens retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving chain tokens', {
        requestId: req.requestId,
        chainId: req.params.chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  /**
   * Update user chain preferences
   */
  static async updateUserChainPreference(req: RequestWithId, res: Response, next: NextFunction) {
    try {
      const { chainId } = req.params;
      const { isActive, priorityOrder } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        return ApiResponse.error(res, 'User not authenticated', 401);
      }

      const preference = await chainService.updateUserChainPreference({
        userId,
        chainId: Number(chainId),
        isActive,
        priorityOrder
      });

      logger.info('User chain preference updated', {
        requestId: req.requestId,
        userId,
        chainId,
        isActive
      });

      return ApiResponse.success(res, preference, 'Chain preference updated successfully');
    } catch (error) {
      logger.error('Error updating chain preference', {
        requestId: req.requestId,
        chainId: req.params.chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  /**
   * Get user's active chains
   */
  static async getUserChains(req: RequestWithId, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return ApiResponse.error(res, 'User not authenticated', 401);
      }

      const userChains = await chainService.getUserChains(userId);

      logger.info('User chains retrieved successfully', {
        requestId: req.requestId,
        userId,
        count: userChains.length
      });

      return ApiResponse.success(res, userChains, 'User chains retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving user chains', {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }
}

export default ChainController;
