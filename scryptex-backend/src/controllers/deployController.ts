
import { Request, Response, NextFunction } from 'express';
import { deployService } from '@/services/deployService';
import { templateService } from '@/services/templateService';
import { validationResult } from 'express-validator';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/utils/response';
import { RequestWithId } from '@/middleware/requestLogger';

export class DeployController {
  /**
   * Get all contract templates
   */
  static async getTemplates(req: RequestWithId, res: Response, next: NextFunction) {
    try {
      const templates = await templateService.getAllTemplates();
      
      logger.info('Templates retrieved successfully', {
        requestId: req.requestId,
        count: templates.length
      });

      return ApiResponse.success(res, templates, 'Templates retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving templates', {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  /**
   * Get specific template by ID
   */
  static async getTemplate(req: RequestWithId, res: Response, next: NextFunction) {
    try {
      const { templateId } = req.params;
      const template = await templateService.getTemplateById(templateId);

      if (!template) {
        return ApiResponse.error(res, 'Template not found', 404);
      }

      logger.info('Template retrieved successfully', {
        requestId: req.requestId,
        templateId
      });

      return ApiResponse.success(res, template, 'Template retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving template', {
        requestId: req.requestId,
        templateId: req.params.templateId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  /**
   * Deploy a contract
   */
  static async deployContract(req: RequestWithId, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const { chainId, templateId, parameters, gasSettings } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        return ApiResponse.error(res, 'User not authenticated', 401);
      }

      logger.info('Starting contract deployment', {
        requestId: req.requestId,
        userId,
        chainId,
        templateId
      });

      const deployment = await deployService.deployContract({
        userId,
        chainId,
        templateId,
        parameters,
        gasSettings
      });

      logger.info('Contract deployment initiated', {
        requestId: req.requestId,
        deploymentId: deployment.id,
        transactionHash: deployment.transactionHash
      });

      return ApiResponse.success(res, deployment, 'Contract deployment initiated', 201);
    } catch (error) {
      logger.error('Error deploying contract', {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  /**
   * Get deployment status
   */
  static async getDeploymentStatus(req: RequestWithId, res: Response, next: NextFunction) {
    try {
      const { deploymentId } = req.params;
      const userId = (req as any).user?.id;

      const deployment = await deployService.getDeploymentStatus(deploymentId, userId);

      if (!deployment) {
        return ApiResponse.error(res, 'Deployment not found', 404);
      }

      logger.info('Deployment status retrieved', {
        requestId: req.requestId,
        deploymentId,
        status: deployment.status
      });

      return ApiResponse.success(res, deployment, 'Deployment status retrieved');
    } catch (error) {
      logger.error('Error retrieving deployment status', {
        requestId: req.requestId,
        deploymentId: req.params.deploymentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  /**
   * Get deployment history for user
   */
  static async getDeploymentHistory(req: RequestWithId, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { page = 1, limit = 10, chainId, status } = req.query;

      const history = await deployService.getDeploymentHistory({
        userId,
        page: Number(page),
        limit: Number(limit),
        chainId: chainId ? Number(chainId) : undefined,
        status: status as string
      });

      logger.info('Deployment history retrieved', {
        requestId: req.requestId,
        userId,
        count: history.deployments.length
      });

      return ApiResponse.success(res, history, 'Deployment history retrieved');
    } catch (error) {
      logger.error('Error retrieving deployment history', {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  /**
   * Batch deploy contracts
   */
  static async batchDeploy(req: RequestWithId, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const { deployments } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        return ApiResponse.error(res, 'User not authenticated', 401);
      }

      logger.info('Starting batch deployment', {
        requestId: req.requestId,
        userId,
        count: deployments.length
      });

      const batchResult = await deployService.batchDeploy({
        userId,
        deployments
      });

      logger.info('Batch deployment initiated', {
        requestId: req.requestId,
        batchId: batchResult.batchId,
        successCount: batchResult.successful.length,
        failedCount: batchResult.failed.length
      });

      return ApiResponse.success(res, batchResult, 'Batch deployment initiated', 201);
    } catch (error) {
      logger.error('Error in batch deployment', {
        requestId: req.requestId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }

  /**
   * Verify deployed contract
   */
  static async verifyContract(req: RequestWithId, res: Response, next: NextFunction) {
    try {
      const { deploymentId } = req.params;
      const userId = (req as any).user?.id;

      const verification = await deployService.verifyContract(deploymentId, userId);

      logger.info('Contract verification completed', {
        requestId: req.requestId,
        deploymentId,
        isVerified: verification.isVerified
      });

      return ApiResponse.success(res, verification, 'Contract verification completed');
    } catch (error) {
      logger.error('Error verifying contract', {
        requestId: req.requestId,
        deploymentId: req.params.deploymentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }
}

export default DeployController;
