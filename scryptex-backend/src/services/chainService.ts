
import { prisma } from '@/config/database';
import { web3Service } from '@/services/web3Service';
import { redis } from '@/config/redis';
import { logger } from '@/utils/logger';

export interface GetChainsParams {
  includeInactive?: boolean;
}

export interface UserChainPreferenceParams {
  userId: string;
  chainId: number;
  isActive?: boolean;
  priorityOrder?: number;
}

export class ChainService {
  /**
   * Get all supported chains
   */
  async getAllChains(params: GetChainsParams = {}) {
    const { includeInactive = false } = params;

    try {
      const cacheKey = `chains:all:${includeInactive}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const chains = await prisma.chain.findMany({
        where: includeInactive ? {} : { isActive: true },
        include: {
          status: true,
          _count: {
            select: {
              deployments: true,
              transactions: true
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      const result = chains.map(chain => ({
        id: chain.id,
        chainId: chain.chainId,
        name: chain.name,
        displayName: chain.displayName,
        rpcUrl: chain.rpcUrl,
        explorerUrl: chain.explorerUrl,
        faucetUrl: chain.faucetUrl,
        nativeCurrency: chain.nativeCurrency,
        isActive: chain.isActive,
        isTestnet: chain.isTestnet,
        iconUrl: chain.iconUrl,
        description: chain.description,
        status: chain.status ? {
          blockHeight: chain.status.blockHeight,
          gasPrice: chain.status.gasPrice,
          isHealthy: chain.status.isHealthy,
          lastUpdated: chain.status.lastUpdated
        } : null,
        stats: {
          totalDeployments: chain._count.deployments,
          totalTransactions: chain._count.transactions
        }
      }));

      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error getting all chains', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get chain by ID
   */
  async getChainById(chainId: number) {
    try {
      const cacheKey = `chain:${chainId}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const chain = await prisma.chain.findUnique({
        where: { chainId },
        include: {
          status: true,
          _count: {
            select: {
              deployments: true,
              transactions: true,
              userChains: true
            }
          }
        }
      });

      if (!chain) {
        return null;
      }

      const result = {
        id: chain.id,
        chainId: chain.chainId,
        name: chain.name,
        displayName: chain.displayName,
        rpcUrl: chain.rpcUrl,
        explorerUrl: chain.explorerUrl,
        faucetUrl: chain.faucetUrl,
        nativeCurrency: chain.nativeCurrency,
        isActive: chain.isActive,
        isTestnet: chain.isTestnet,
        iconUrl: chain.iconUrl,
        description: chain.description,
        features: chain.features,
        status: chain.status ? {
          blockHeight: chain.status.blockHeight,
          gasPrice: chain.status.gasPrice,
          isHealthy: chain.status.isHealthy,
          lastUpdated: chain.status.lastUpdated,
          avgBlockTime: chain.status.avgBlockTime,
          networkCongestion: chain.status.networkCongestion
        } : null,
        stats: {
          totalDeployments: chain._count.deployments,
          totalTransactions: chain._count.transactions,
          totalUsers: chain._count.userChains
        }
      };

      // Cache for 2 minutes
      await redis.setex(cacheKey, 120, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error getting chain by ID', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get chain status and health
   */
  async getChainStatus(chainId: number) {
    try {
      const cacheKey = `chain:status:${chainId}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      // Get from database
      let status = await prisma.chainStatus.findUnique({
        where: { chainId }
      });

      // If not found or outdated, fetch fresh data
      if (!status || (Date.now() - status.lastUpdated.getTime()) > 60000) {
        try {
          const freshStatus = await this.fetchChainStatusFromBlockchain(chainId);
          
          if (freshStatus) {
            status = await prisma.chainStatus.upsert({
              where: { chainId },
              update: freshStatus,
              create: { chainId, ...freshStatus }
            });
          }
        } catch (error) {
          logger.warn('Failed to fetch fresh chain status', { chainId, error });
        }
      }

      if (!status) {
        return null;
      }

      const result = {
        chainId: status.chainId,
        blockHeight: status.blockHeight,
        gasPrice: status.gasPrice,
        isHealthy: status.isHealthy,
        lastUpdated: status.lastUpdated,
        avgBlockTime: status.avgBlockTime,
        networkCongestion: status.networkCongestion,
        rpcLatency: status.rpcLatency
      };

      // Cache for 30 seconds
      await redis.setex(cacheKey, 30, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error getting chain status', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get current gas prices for chain
   */
  async getCurrentGasPrice(chainId: number) {
    try {
      const cacheKey = `chain:gas:${chainId}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const gasPrice = await web3Service.getGasPrice(chainId);

      const result = {
        chainId,
        standard: gasPrice.standard,
        fast: gasPrice.fast,
        fastest: gasPrice.fastest,
        timestamp: new Date(),
        unit: 'gwei'
      };

      // Cache for 15 seconds
      await redis.setex(cacheKey, 15, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error getting gas price', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get supported tokens for chain
   */
  async getSupportedTokens(chainId: number) {
    try {
      const cacheKey = `chain:tokens:${chainId}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      // Get tokens from database or external API
      const tokens = await this.fetchSupportedTokens(chainId);

      // Cache for 1 hour
      await redis.setex(cacheKey, 3600, JSON.stringify(tokens));

      return tokens;
    } catch (error) {
      logger.error('Error getting supported tokens', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Update user chain preference
   */
  async updateUserChainPreference(params: UserChainPreferenceParams) {
    const { userId, chainId, isActive, priorityOrder } = params;

    try {
      const preference = await prisma.userChain.upsert({
        where: {
          userId_chainId: {
            userId,
            chainId
          }
        },
        update: {
          ...(isActive !== undefined && { isActive }),
          ...(priorityOrder !== undefined && { priorityOrder }),
          updatedAt: new Date()
        },
        create: {
          userId,
          chainId,
          isActive: isActive ?? true,
          priorityOrder: priorityOrder ?? 0
        }
      });

      // Invalidate user chains cache
      await redis.del(`user:chains:${userId}`);

      logger.info('User chain preference updated', {
        userId,
        chainId,
        isActive,
        priorityOrder
      });

      return preference;
    } catch (error) {
      logger.error('Error updating user chain preference', {
        userId,
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get user's active chains
   */
  async getUserChains(userId: string) {
    try {
      const cacheKey = `user:chains:${userId}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const userChains = await prisma.userChain.findMany({
        where: {
          userId,
          isActive: true
        },
        include: {
          chain: {
            include: {
              status: true
            }
          }
        },
        orderBy: { priorityOrder: 'asc' }
      });

      const result = userChains.map(uc => ({
        chainId: uc.chainId,
        name: uc.chain.name,
        displayName: uc.chain.displayName,
        isActive: uc.isActive,
        priorityOrder: uc.priorityOrder,
        status: uc.chain.status ? {
          isHealthy: uc.chain.status.isHealthy,
          blockHeight: uc.chain.status.blockHeight,
          gasPrice: uc.chain.status.gasPrice
        } : null
      }));

      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error getting user chains', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Fetch chain status from blockchain
   */
  private async fetchChainStatusFromBlockchain(chainId: number) {
    try {
      const [blockHeight, gasPrice, rpcLatency] = await Promise.all([
        web3Service.getBlockNumber(chainId),
        web3Service.getGasPrice(chainId),
        web3Service.measureRpcLatency(chainId)
      ]);

      return {
        blockHeight,
        gasPrice: gasPrice.standard,
        isHealthy: rpcLatency < 5000, // 5 seconds threshold
        rpcLatency,
        lastUpdated: new Date(),
        avgBlockTime: 12000, // Default 12 seconds, should be chain-specific
        networkCongestion: gasPrice.standard > 50 ? 'HIGH' : gasPrice.standard > 20 ? 'MEDIUM' : 'LOW'
      };
    } catch (error) {
      logger.error('Error fetching chain status from blockchain', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Fetch supported tokens for chain
   */
  private async fetchSupportedTokens(chainId: number) {
    // This would typically fetch from a token list API or database
    // For now, return native currency and common tokens
    const chain = await prisma.chain.findUnique({
      where: { chainId }
    });

    if (!chain) {
      return [];
    }

    return [
      {
        address: '0x0000000000000000000000000000000000000000',
        symbol: chain.nativeCurrency.symbol,
        name: chain.nativeCurrency.name,
        decimals: chain.nativeCurrency.decimals,
        isNative: true,
        logoURI: chain.iconUrl
      }
      // Add more tokens as needed
    ];
  }
}

export const chainService = new ChainService();
