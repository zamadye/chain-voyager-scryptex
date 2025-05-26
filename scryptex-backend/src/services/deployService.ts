
import { prisma } from '@/config/database';
import { web3Service } from '@/services/web3Service';
import { queueService } from '@/services/queueService';
import { logger } from '@/utils/logger';
import { DeploymentStatus } from '@prisma/client';

export interface DeployContractParams {
  userId: string;
  chainId: number;
  templateId: string;
  parameters: Record<string, any>;
  gasSettings?: {
    gasLimit?: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  };
}

export interface BatchDeployParams {
  userId: string;
  deployments: Array<{
    chainId: number;
    templateId: string;
    parameters: Record<string, any>;
    gasSettings?: any;
  }>;
}

export interface DeploymentHistoryParams {
  userId: string;
  page: number;
  limit: number;
  chainId?: number;
  status?: string;
}

export class DeployService {
  /**
   * Deploy a smart contract
   */
  async deployContract(params: DeployContractParams) {
    const { userId, chainId, templateId, parameters, gasSettings } = params;

    try {
      // Get template details
      const template = await prisma.contractTemplate.findUnique({
        where: { id: templateId }
      });

      if (!template) {
        throw new Error('Template not found');
      }

      // Get chain details
      const chain = await prisma.chain.findUnique({
        where: { chainId }
      });

      if (!chain || !chain.isActive) {
        throw new Error('Chain not supported or inactive');
      }

      // Create deployment record
      const deployment = await prisma.contractDeployment.create({
        data: {
          userId,
          chainId,
          templateId,
          status: DeploymentStatus.PENDING,
          parameters: JSON.stringify(parameters),
          gasSettings: gasSettings ? JSON.stringify(gasSettings) : null,
        },
        include: {
          template: true,
          chain: true,
          user: true
        }
      });

      // Add to deployment queue
      await queueService.addDeploymentJob({
        deploymentId: deployment.id,
        userId,
        chainId,
        templateCode: template.solidityCode,
        parameters,
        gasSettings
      });

      logger.info('Contract deployment queued', {
        deploymentId: deployment.id,
        chainId,
        templateId,
        userId
      });

      return {
        id: deployment.id,
        status: deployment.status,
        chainId: deployment.chainId,
        templateName: template.name,
        transactionHash: deployment.transactionHash,
        contractAddress: deployment.contractAddress,
        createdAt: deployment.createdAt
      };
    } catch (error) {
      logger.error('Error deploying contract', {
        userId,
        chainId,
        templateId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string, userId?: string) {
    try {
      const deployment = await prisma.contractDeployment.findFirst({
        where: {
          id: deploymentId,
          ...(userId && { userId })
        },
        include: {
          template: true,
          chain: true,
          parameters: true
        }
      });

      if (!deployment) {
        return null;
      }

      // If deployment is pending or processing, check blockchain status
      if (deployment.status === DeploymentStatus.PENDING || 
          deployment.status === DeploymentStatus.PROCESSING) {
        await this.updateDeploymentStatus(deployment);
      }

      return {
        id: deployment.id,
        status: deployment.status,
        chainId: deployment.chainId,
        chainName: deployment.chain.name,
        templateName: deployment.template.name,
        contractAddress: deployment.contractAddress,
        transactionHash: deployment.transactionHash,
        gasUsed: deployment.gasUsed,
        deploymentCost: deployment.deploymentCost,
        error: deployment.error,
        createdAt: deployment.createdAt,
        updatedAt: deployment.updatedAt,
        parameters: deployment.parameters
      };
    } catch (error) {
      logger.error('Error getting deployment status', {
        deploymentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get deployment history for user
   */
  async getDeploymentHistory(params: DeploymentHistoryParams) {
    const { userId, page, limit, chainId, status } = params;

    try {
      const skip = (page - 1) * limit;
      
      const where = {
        userId,
        ...(chainId && { chainId }),
        ...(status && { status: status as DeploymentStatus })
      };

      const [deployments, total] = await Promise.all([
        prisma.contractDeployment.findMany({
          where,
          include: {
            template: true,
            chain: true
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.contractDeployment.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        deployments: deployments.map(d => ({
          id: d.id,
          status: d.status,
          chainId: d.chainId,
          chainName: d.chain.name,
          templateName: d.template.name,
          contractAddress: d.contractAddress,
          transactionHash: d.transactionHash,
          gasUsed: d.gasUsed,
          deploymentCost: d.deploymentCost,
          createdAt: d.createdAt
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Error getting deployment history', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Batch deploy contracts
   */
  async batchDeploy(params: BatchDeployParams) {
    const { userId, deployments } = params;
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const results = {
        batchId,
        successful: [] as any[],
        failed: [] as any[]
      };

      for (const deployment of deployments) {
        try {
          const result = await this.deployContract({
            userId,
            ...deployment
          });
          results.successful.push(result);
        } catch (error) {
          results.failed.push({
            chainId: deployment.chainId,
            templateId: deployment.templateId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      logger.info('Batch deployment completed', {
        batchId,
        userId,
        totalRequested: deployments.length,
        successful: results.successful.length,
        failed: results.failed.length
      });

      return results;
    } catch (error) {
      logger.error('Error in batch deployment', {
        batchId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Verify deployed contract
   */
  async verifyContract(deploymentId: string, userId?: string) {
    try {
      const deployment = await prisma.contractDeployment.findFirst({
        where: {
          id: deploymentId,
          ...(userId && { userId })
        },
        include: {
          template: true,
          chain: true
        }
      });

      if (!deployment) {
        throw new Error('Deployment not found');
      }

      if (deployment.status !== DeploymentStatus.SUCCESS) {
        throw new Error('Contract must be successfully deployed before verification');
      }

      if (!deployment.contractAddress) {
        throw new Error('Contract address not available');
      }

      // Verify contract on blockchain explorer
      const verification = await web3Service.verifyContract({
        chainId: deployment.chainId,
        contractAddress: deployment.contractAddress,
        sourceCode: deployment.template.solidityCode,
        contractName: deployment.template.name,
        compilerVersion: '0.8.19'
      });

      // Update deployment record
      await prisma.contractDeployment.update({
        where: { id: deploymentId },
        data: {
          isVerified: verification.isVerified,
          verificationDetails: JSON.stringify(verification)
        }
      });

      logger.info('Contract verification completed', {
        deploymentId,
        contractAddress: deployment.contractAddress,
        isVerified: verification.isVerified
      });

      return verification;
    } catch (error) {
      logger.error('Error verifying contract', {
        deploymentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Update deployment status by checking blockchain
   */
  private async updateDeploymentStatus(deployment: any) {
    try {
      if (!deployment.transactionHash) {
        return;
      }

      const receipt = await web3Service.getTransactionReceipt(
        deployment.chainId,
        deployment.transactionHash
      );

      if (receipt) {
        const updateData: any = {
          status: receipt.status === 1 ? DeploymentStatus.SUCCESS : DeploymentStatus.FAILED,
          gasUsed: receipt.gasUsed?.toString(),
          blockNumber: receipt.blockNumber?.toString()
        };

        if (receipt.contractAddress) {
          updateData.contractAddress = receipt.contractAddress;
        }

        if (receipt.status === 0) {
          updateData.error = 'Transaction failed on blockchain';
        }

        await prisma.contractDeployment.update({
          where: { id: deployment.id },
          data: updateData
        });

        logger.info('Deployment status updated', {
          deploymentId: deployment.id,
          status: updateData.status,
          contractAddress: receipt.contractAddress
        });
      }
    } catch (error) {
      logger.error('Error updating deployment status', {
        deploymentId: deployment.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const deployService = new DeployService();
