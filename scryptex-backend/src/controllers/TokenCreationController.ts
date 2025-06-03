
import { Request, Response, NextFunction } from 'express';
import { tokenCreationService, TokenCreationParams } from '../services/TokenCreationService';
import { bondingCurveEngine, CurveParameters } from '../services/BondingCurveEngine';
import { validationResult } from 'express-validator';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

export class TokenCreationController {
  static async calculateDeploymentCost(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const { tokenType, chainName, features = [] } = req.query;

      const params: Partial<TokenCreationParams> = {
        tokenType: tokenType as any,
        chainName: chainName as any,
        features: Array.isArray(features) ? features as string[] : [features as string],
        totalSupply: '1000000000000000000000000', // Default 1M tokens
        decimals: 18,
        creatorAddress: '0x0000000000000000000000000000000000000000' // Placeholder
      };

      const costCalculation = await tokenCreationService.calculateDeploymentCost(params as TokenCreationParams);
      const pointCalculation = await tokenCreationService.calculateTokenCreationPoints(params as TokenCreationParams);

      logger.info('Deployment cost calculated', {
        tokenType,
        chainName,
        totalCost: costCalculation.totalCost,
        estimatedPoints: pointCalculation.totalPoints
      });

      return ApiResponse.success(res, {
        costBreakdown: costCalculation,
        pointBreakdown: pointCalculation,
        estimatedCompletionTime: chainName === 'megaeth' ? '10-15 seconds' : 
                                chainName === 'risechain' ? '15-20 seconds' : 
                                '25-30 seconds'
      }, 'Deployment cost calculated successfully');
    } catch (error) {
      logger.error('Error calculating deployment cost', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  static async deployToken(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const creatorAddress = (req as any).user?.wallet_address || req.body.creatorAddress;
      if (!creatorAddress) {
        return ApiResponse.error(res, 'Creator address is required', 400);
      }

      const {
        tokenName,
        tokenSymbol,
        tokenDescription,
        tokenType,
        totalSupply,
        decimals = 18,
        chainName,
        features = [],
        advancedFeatures = {},
        bondingCurveType,
        curveParameters
      } = req.body;

      // Validate bonding curve parameters if applicable
      if (tokenType === 'bonding_curve' && curveParameters) {
        const validation = await bondingCurveEngine.validateCurveParameters(curveParameters);
        if (!validation.isValid) {
          return ApiResponse.error(res, `Invalid bonding curve parameters: ${validation.errors.join(', ')}`, 400);
        }
      }

      const deploymentParams: TokenCreationParams = {
        creatorAddress: creatorAddress.toLowerCase(),
        tokenName,
        tokenSymbol,
        tokenDescription,
        tokenType,
        totalSupply,
        decimals,
        chainName,
        features,
        advancedFeatures,
        bondingCurveType,
        curveParameters
      };

      const deploymentResult = await tokenCreationService.deployToken(deploymentParams);

      logger.info('Token deployment initiated', {
        deploymentId: deploymentResult.deploymentId,
        creator: creatorAddress,
        tokenName,
        chainName
      });

      return ApiResponse.success(res, deploymentResult, 'Token deployment initiated successfully', 201);
    } catch (error) {
      logger.error('Error deploying token', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  static async getDeploymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { deploymentId } = req.params;
      
      const deployment = await tokenCreationService.getTokenDeploymentById(deploymentId);
      if (!deployment) {
        return ApiResponse.error(res, 'Deployment not found', 404);
      }

      return ApiResponse.success(res, deployment, 'Deployment status retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving deployment status', {
        deploymentId: req.params.deploymentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  static async getUserTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      const { limit = 10, offset = 0 } = req.query;

      const deployments = await tokenCreationService.getUserTokenDeployments(
        address, 
        parseInt(limit as string), 
        parseInt(offset as string)
      );

      return ApiResponse.success(res, {
        deployments,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: deployments.length
        }
      }, 'User tokens retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving user tokens', {
        address: req.params.address,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  static async getUserCreatorStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      
      const stats = await tokenCreationService.getUserCreatorStats(address);
      
      return ApiResponse.success(res, stats || {
        creator_address: address.toLowerCase(),
        total_creation_points: 0,
        total_tokens_created: 0,
        creator_level: 1
      }, 'Creator stats retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving creator stats', {
        address: req.params.address,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  static async getDailyCreationTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query;
      
      const tasks = await tokenCreationService.getDailyCreationTasks(date as string);
      
      return ApiResponse.success(res, { tasks }, 'Daily creation tasks retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving daily creation tasks', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  static async getUserTaskProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { address } = req.params;
      const { date } = req.query;
      
      const progress = await tokenCreationService.getUserDailyTaskProgress(address, date as string);
      
      return ApiResponse.success(res, { progress }, 'User task progress retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving user task progress', {
        address: req.params.address,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  static async getCreationLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 50 } = req.query;
      
      const leaderboard = await tokenCreationService.getCreationLeaderboard(parseInt(limit as string));
      
      return ApiResponse.success(res, { leaderboard }, 'Creation leaderboard retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving creation leaderboard', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  // Bonding Curve specific endpoints
  static async calculateBondingCurvePrice(req: Request, res: Response, next: NextFunction) {
    try {
      const { supply, curveParameters } = req.body;
      
      const validation = await bondingCurveEngine.validateCurveParameters(curveParameters);
      if (!validation.isValid) {
        return ApiResponse.error(res, `Invalid curve parameters: ${validation.errors.join(', ')}`, 400);
      }

      const price = await bondingCurveEngine.calculatePrice(supply, curveParameters);
      
      return ApiResponse.success(res, { 
        supply, 
        price,
        warnings: validation.warnings 
      }, 'Bonding curve price calculated successfully');
    } catch (error) {
      logger.error('Error calculating bonding curve price', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  static async calculatePriceImpact(req: Request, res: Response, next: NextFunction) {
    try {
      const { buyAmount, currentSupply, curveParameters } = req.body;
      
      const priceImpact = await bondingCurveEngine.calculatePriceImpact(
        buyAmount, 
        currentSupply, 
        curveParameters
      );
      
      return ApiResponse.success(res, priceImpact, 'Price impact calculated successfully');
    } catch (error) {
      logger.error('Error calculating price impact', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  static async simulateBondingCurve(req: Request, res: Response, next: NextFunction) {
    try {
      const { curveParameters, steps = 100 } = req.body;
      
      const validation = await bondingCurveEngine.validateCurveParameters(curveParameters);
      if (!validation.isValid) {
        return ApiResponse.error(res, `Invalid curve parameters: ${validation.errors.join(', ')}`, 400);
      }

      const simulation = await bondingCurveEngine.simulateCurve(curveParameters, parseInt(steps));
      
      return ApiResponse.success(res, {
        simulation,
        warnings: validation.warnings
      }, 'Bonding curve simulation completed successfully');
    } catch (error) {
      logger.error('Error simulating bonding curve', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  static async getChainInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { chainName } = req.params;
      
      const chainInfo = {
        risechain: {
          name: 'RiseChain',
          chainId: 7701,
          rpcUrl: process.env.RISECHAIN_TOKEN_FACTORY_RPC,
          features: ['shreds_optimization', 'gigagas_optimization', 'parallel_deployment'],
          supportedTokenTypes: ['standard', 'bonding_curve', 'deflationary', 'reflection'],
          estimatedDeploymentTime: '15-20 seconds',
          baseFee: '0.01 ETH',
          pointBonus: 3
        },
        pharos: {
          name: 'Pharos Network', 
          chainId: 7702,
          rpcUrl: process.env.PHAROS_TOKEN_FACTORY_RPC,
          features: ['parallel_processing', 'storage_optimization', 'rwa_support'],
          supportedTokenTypes: ['standard', 'rwa', 'governance', 'storage_optimized'],
          estimatedDeploymentTime: '25-30 seconds',
          baseFee: '0.015 ETH',
          pointBonus: 5
        },
        megaeth: {
          name: 'MegaETH',
          chainId: 7703,
          rpcUrl: process.env.MEGAETH_TOKEN_FACTORY_RPC,
          features: ['realtime_processing', 'sub_millisecond_support', 'continuous_processing'],
          supportedTokenTypes: ['standard', 'memecoin', 'hft', 'streaming', 'realtime_bonding_curve'],
          estimatedDeploymentTime: '10-15 seconds',
          baseFee: '0.008 ETH',
          pointBonus: 4
        }
      }[chainName];

      if (!chainInfo) {
        return ApiResponse.error(res, 'Unsupported chain', 400);
      }

      return ApiResponse.success(res, chainInfo, 'Chain information retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving chain info', {
        chainName: req.params.chainName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }
}

export default TokenCreationController;
