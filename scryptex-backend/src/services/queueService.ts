
import Bull from 'bull';
import { config } from '@/config/config';
import { logger } from '@/utils/logger';
import { web3Service } from '@/services/web3Service';
import { prisma } from '@/config/database';
import { DeploymentStatus } from '@prisma/client';

export interface DeploymentJobData {
  deploymentId: string;
  userId: string;
  chainId: number;
  templateCode: string;
  parameters: Record<string, any>;
  gasSettings?: any;
}

export interface TransactionMonitorJobData {
  deploymentId: string;
  chainId: number;
  transactionHash: string;
  maxRetries?: number;
  retryCount?: number;
}

export class QueueService {
  private deploymentQueue: Bull.Queue;
  private transactionMonitorQueue: Bull.Queue;
  private analyticsQueue: Bull.Queue;

  constructor() {
    // Initialize queues
    this.deploymentQueue = new Bull('deployment-queue', {
      redis: {
        host: this.getRedisHost(),
        port: this.getRedisPort(),
        password: this.getRedisPassword()
      },
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    });

    this.transactionMonitorQueue = new Bull('transaction-monitor-queue', {
      redis: {
        host: this.getRedisHost(),
        port: this.getRedisPort(),
        password: this.getRedisPassword()
      },
      defaultJobOptions: {
        removeOnComplete: 20,
        removeOnFail: 100,
        attempts: 20,
        backoff: {
          type: 'fixed',
          delay: 30000 // 30 seconds
        }
      }
    });

    this.analyticsQueue = new Bull('analytics-queue', {
      redis: {
        host: this.getRedisHost(),
        port: this.getRedisPort(),
        password: this.getRedisPassword()
      },
      defaultJobOptions: {
        removeOnComplete: 5,
        removeOnFail: 20,
        attempts: 2
      }
    });

    this.setupProcessors();
    this.setupEventListeners();
  }

  /**
   * Add deployment job to queue
   */
  async addDeploymentJob(data: DeploymentJobData) {
    try {
      const job = await this.deploymentQueue.add('deploy-contract', data, {
        priority: this.getDeploymentPriority(data.chainId),
        delay: 0
      });

      logger.info('Deployment job added to queue', {
        jobId: job.id,
        deploymentId: data.deploymentId,
        chainId: data.chainId
      });

      return job;
    } catch (error) {
      logger.error('Error adding deployment job to queue', {
        deploymentId: data.deploymentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Add transaction monitoring job
   */
  async addTransactionMonitorJob(data: TransactionMonitorJobData) {
    try {
      const job = await this.transactionMonitorQueue.add('monitor-transaction', data, {
        delay: 15000, // Start monitoring after 15 seconds
        jobId: `monitor-${data.transactionHash}` // Prevent duplicates
      });

      logger.info('Transaction monitor job added', {
        jobId: job.id,
        deploymentId: data.deploymentId,
        transactionHash: data.transactionHash
      });

      return job;
    } catch (error) {
      logger.error('Error adding transaction monitor job', {
        deploymentId: data.deploymentId,
        transactionHash: data.transactionHash,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Add analytics job
   */
  async addAnalyticsJob(type: string, data: any) {
    try {
      const job = await this.analyticsQueue.add(type, data);

      logger.info('Analytics job added', {
        jobId: job.id,
        type,
        data: JSON.stringify(data)
      });

      return job;
    } catch (error) {
      logger.error('Error adding analytics job', {
        type,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Setup job processors
   */
  private setupProcessors() {
    // Deployment processor
    this.deploymentQueue.process('deploy-contract', config.queueConcurrency, async (job) => {
      return this.processDeployment(job.data);
    });

    // Transaction monitor processor
    this.transactionMonitorQueue.process('monitor-transaction', 10, async (job) => {
      return this.processTransactionMonitor(job.data);
    });

    // Analytics processors
    this.analyticsQueue.process('user-activity', async (job) => {
      return this.processUserActivity(job.data);
    });

    this.analyticsQueue.process('deployment-metrics', async (job) => {
      return this.processDeploymentMetrics(job.data);
    });
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners() {
    // Deployment queue events
    this.deploymentQueue.on('completed', (job, result) => {
      logger.info('Deployment job completed', {
        jobId: job.id,
        deploymentId: job.data.deploymentId,
        result
      });
    });

    this.deploymentQueue.on('failed', (job, err) => {
      logger.error('Deployment job failed', {
        jobId: job.id,
        deploymentId: job.data.deploymentId,
        error: err.message
      });
    });

    // Transaction monitor queue events
    this.transactionMonitorQueue.on('completed', (job, result) => {
      logger.info('Transaction monitor job completed', {
        jobId: job.id,
        transactionHash: job.data.transactionHash,
        result
      });
    });

    this.transactionMonitorQueue.on('failed', (job, err) => {
      logger.error('Transaction monitor job failed', {
        jobId: job.id,
        transactionHash: job.data.transactionHash,
        error: err.message
      });
    });
  }

  /**
   * Process deployment job
   */
  private async processDeployment(data: DeploymentJobData): Promise<any> {
    const { deploymentId, chainId, templateCode, parameters, gasSettings } = data;

    try {
      // Update status to processing
      await prisma.contractDeployment.update({
        where: { id: deploymentId },
        data: { status: DeploymentStatus.PROCESSING }
      });

      // Compile contract (simplified - in real implementation would use solc)
      const compiledContract = await this.compileContract(templateCode, parameters);

      // Estimate gas
      const gasEstimate = await web3Service.estimateDeploymentGas({
        chainId,
        bytecode: compiledContract.bytecode,
        abi: compiledContract.abi,
        constructorArgs: Object.values(parameters)
      });

      // Deploy contract
      const deployment = await web3Service.deployContract({
        chainId,
        bytecode: compiledContract.bytecode,
        abi: compiledContract.abi,
        constructorArgs: Object.values(parameters),
        gasLimit: gasSettings?.gasLimit ? BigInt(gasSettings.gasLimit) : gasEstimate * BigInt(120) / BigInt(100), // 20% buffer
        gasPrice: gasSettings?.gasPrice ? BigInt(gasSettings.gasPrice) : undefined
      });

      // Update deployment record
      await prisma.contractDeployment.update({
        where: { id: deploymentId },
        data: {
          transactionHash: deployment.transactionHash,
          status: DeploymentStatus.PROCESSING,
          gasEstimate: gasEstimate.toString()
        }
      });

      // Add transaction monitoring job
      await this.addTransactionMonitorJob({
        deploymentId,
        chainId,
        transactionHash: deployment.transactionHash
      });

      return {
        success: true,
        transactionHash: deployment.transactionHash,
        gasEstimate: gasEstimate.toString()
      };
    } catch (error) {
      // Update status to failed
      await prisma.contractDeployment.update({
        where: { id: deploymentId },
        data: {
          status: DeploymentStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      logger.error('Deployment processing failed', {
        deploymentId,
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Process transaction monitoring job
   */
  private async processTransactionMonitor(data: TransactionMonitorJobData): Promise<any> {
    const { deploymentId, chainId, transactionHash, maxRetries = 20, retryCount = 0 } = data;

    try {
      const receipt = await web3Service.getTransactionReceipt(chainId, transactionHash);

      if (!receipt) {
        // Transaction not mined yet
        if (retryCount >= maxRetries) {
          throw new Error('Transaction monitoring timeout');
        }

        // Re-queue with incremented retry count
        await this.addTransactionMonitorJob({
          ...data,
          retryCount: retryCount + 1
        });

        return { status: 'pending', retryCount: retryCount + 1 };
      }

      // Transaction mined - update deployment
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
        where: { id: deploymentId },
        data: updateData
      });

      // Add analytics job
      await this.addAnalyticsJob('deployment-metrics', {
        deploymentId,
        chainId,
        status: updateData.status,
        gasUsed: receipt.gasUsed?.toString()
      });

      return {
        status: receipt.status === 1 ? 'success' : 'failed',
        contractAddress: receipt.contractAddress,
        gasUsed: receipt.gasUsed?.toString()
      };
    } catch (error) {
      logger.error('Transaction monitoring failed', {
        deploymentId,
        transactionHash,
        retryCount,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Process user activity analytics
   */
  private async processUserActivity(data: any): Promise<any> {
    try {
      await prisma.userActivity.create({
        data: {
          userId: data.userId,
          activityType: data.activityType,
          chainId: data.chainId,
          metadata: data.metadata || {}
        }
      });

      return { success: true };
    } catch (error) {
      logger.error('User activity processing failed', {
        userId: data.userId,
        activityType: data.activityType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Process deployment metrics
   */
  private async processDeploymentMetrics(data: any): Promise<any> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.chainMetric.upsert({
        where: {
          chainId_date: {
            chainId: data.chainId,
            date: today
          }
        },
        update: {
          totalDeployments: { increment: 1 },
          ...(data.status === DeploymentStatus.SUCCESS && {
            successfulDeployments: { increment: 1 }
          }),
          ...(data.gasUsed && {
            totalGasUsed: { increment: parseInt(data.gasUsed) }
          })
        },
        create: {
          chainId: data.chainId,
          date: today,
          totalDeployments: 1,
          successfulDeployments: data.status === DeploymentStatus.SUCCESS ? 1 : 0,
          totalGasUsed: data.gasUsed ? parseInt(data.gasUsed) : 0
        }
      });

      return { success: true };
    } catch (error) {
      logger.error('Deployment metrics processing failed', {
        deploymentId: data.deploymentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Compile contract (simplified)
   */
  private async compileContract(sourceCode: string, parameters: Record<string, any>) {
    // This is a simplified version - in production you'd use the Solidity compiler
    // For now, return mock compiled contract data
    return {
      bytecode: '0x608060405234801561001057600080fd5b50', // Mock bytecode
      abi: [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        }
      ]
    };
  }

  /**
   * Get deployment priority based on chain
   */
  private getDeploymentPriority(chainId: number): number {
    // Higher priority for mainnet chains
    const priorities: Record<number, number> = {
      1: 10, // Ethereum mainnet
      137: 9, // Polygon
      56: 8, // BSC
      43114: 7, // Avalanche
      250: 6, // Fantom
      // Testnets get lower priority
      11155111: 3, // Sepolia
      80001: 2, // Mumbai
      97: 2, // BSC testnet
    };

    return priorities[chainId] || 1; // Default priority
  }

  /**
   * Get Redis connection details
   */
  private getRedisHost(): string {
    const redisUrl = config.queueRedisUrl || config.redisUrl;
    try {
      const url = new URL(redisUrl);
      return url.hostname;
    } catch {
      return 'localhost';
    }
  }

  private getRedisPort(): number {
    const redisUrl = config.queueRedisUrl || config.redisUrl;
    try {
      const url = new URL(redisUrl);
      return parseInt(url.port) || 6379;
    } catch {
      return 6379;
    }
  }

  private getRedisPassword(): string | undefined {
    const redisUrl = config.queueRedisUrl || config.redisUrl;
    try {
      const url = new URL(redisUrl);
      return url.password || undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    try {
      const [deploymentStats, monitorStats, analyticsStats] = await Promise.all([
        this.deploymentQueue.getJobCounts(),
        this.transactionMonitorQueue.getJobCounts(),
        this.analyticsQueue.getJobCounts()
      ]);

      return {
        deployment: deploymentStats,
        transactionMonitor: monitorStats,
        analytics: analyticsStats
      };
    } catch (error) {
      logger.error('Error getting queue stats', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Clean old jobs
   */
  async cleanOldJobs() {
    try {
      await Promise.all([
        this.deploymentQueue.clean(24 * 60 * 60 * 1000, 'completed'), // 24 hours
        this.deploymentQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed'), // 7 days
        this.transactionMonitorQueue.clean(24 * 60 * 60 * 1000, 'completed'),
        this.transactionMonitorQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed'),
        this.analyticsQueue.clean(12 * 60 * 60 * 1000, 'completed'), // 12 hours
        this.analyticsQueue.clean(48 * 60 * 60 * 1000, 'failed') // 48 hours
      ]);

      logger.info('Old jobs cleaned successfully');
    } catch (error) {
      logger.error('Error cleaning old jobs', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export const queueService = new QueueService();
