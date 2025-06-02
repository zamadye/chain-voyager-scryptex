import { prisma } from '@/config/database';
import { enhancedWeb3Service } from './enhancedWeb3Service';
import { blockchainProviderService } from './blockchainProviderService';
import { redis } from '@/config/redis';
import { logger } from '@/utils/logger';
import { config } from '@/config/config';
import { ChainMetrics } from '@/types/blockchain';

export interface ChainHealthStatus {
  chainId: number;
  isHealthy: boolean;
  lastChecked: Date;
  metrics: ChainMetrics;
  issues: string[];
  recommendations: string[];
}

export interface ChainConfiguration {
  chainId: number;
  name: string;
  displayName: string;
  rpcUrl: string;
  wsUrl?: string;
  explorerUrl: string;
  faucetUrl: string;
  isActive: boolean;
  isTestnet: boolean;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  features: string[];
  sdkOptimizations: string[];
}

/**
 * Advanced chain management service for monitoring and optimizing
 * multi-chain operations across all supported networks
 */
export class ChainManagementService {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private performanceMonitorInterval: NodeJS.Timeout | null = null;
  private chainStatuses: Map<number, ChainHealthStatus> = new Map();

  constructor() {
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    logger.info('Initializing Chain Management Service');
    
    // Start health monitoring
    await this.startHealthMonitoring();
    
    // Start performance monitoring
    await this.startPerformanceMonitoring();
    
    // Initialize chain configurations in database
    await this.syncChainConfigurations();
    
    logger.info('Chain Management Service initialized');
  }

  /**
   * Get all supported chains with their current status
   */
  async getAllChains(includeInactive: boolean = false): Promise<ChainConfiguration[]> {
    try {
      const cacheKey = `chains:all:${includeInactive}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const chains: ChainConfiguration[] = [];
      
      for (const [chainIdStr, chainConfig] of Object.entries(config.blockchain.supportedChains)) {
        const chainId = parseInt(chainIdStr);
        
        if (!includeInactive && !chainConfig.isActive) {
          continue;
        }

        const chainStatus = this.chainStatuses.get(chainId);
        
        chains.push({
          chainId,
          name: chainConfig.name,
          displayName: chainConfig.displayName,
          rpcUrl: chainConfig.rpcUrl,
          wsUrl: chainConfig.wsUrl,
          explorerUrl: chainConfig.explorerUrl,
          faucetUrl: chainConfig.faucetUrl,
          isActive: chainConfig.isActive,
          isTestnet: chainConfig.isTestnet,
          nativeCurrency: chainConfig.nativeCurrency,
          features: Object.keys(chainConfig.features).filter(
            key => chainConfig.features[key as keyof typeof chainConfig.features]
          ),
          sdkOptimizations: chainConfig.sdkOptimizations
        });
      }

      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(chains));
      
      return chains;
      
    } catch (error) {
      logger.error('Failed to get all chains', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get specific chain configuration and status
   */
  async getChainById(chainId: number): Promise<ChainConfiguration | null> {
    try {
      const chainConfig = config.blockchain.supportedChains[chainId];
      if (!chainConfig) {
        return null;
      }

      const chainStatus = this.chainStatuses.get(chainId);
      
      return {
        chainId,
        name: chainConfig.name,
        displayName: chainConfig.displayName,
        rpcUrl: chainConfig.rpcUrl,
        wsUrl: chainConfig.wsUrl,
        explorerUrl: chainConfig.explorerUrl,
        faucetUrl: chainConfig.faucetUrl,
        isActive: chainConfig.isActive,
        isTestnet: chainConfig.isTestnet,
        nativeCurrency: chainConfig.nativeCurrency,
        features: Object.keys(chainConfig.features).filter(
          key => chainConfig.features[key as keyof typeof chainConfig.features]
        ),
        sdkOptimizations: chainConfig.sdkOptimizations
      };
      
    } catch (error) {
      logger.error('Failed to get chain by ID', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Get comprehensive chain health status
   */
  async getChainHealth(chainId: number): Promise<ChainHealthStatus | null> {
    try {
      const cacheKey = `chain:health:${chainId}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return JSON.parse(cached);
      }

      const status = await this.performHealthCheck(chainId);
      
      if (status) {
        // Cache for 30 seconds
        await redis.setex(cacheKey, 30, JSON.stringify(status));
      }
      
      return status;
      
    } catch (error) {
      logger.error('Failed to get chain health', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Get real-time performance metrics for all chains
   */
  async getAllChainMetrics(): Promise<Map<number, ChainMetrics>> {
    try {
      const metrics = await enhancedWeb3Service.getAllChainMetrics();
      
      // Update local cache
      for (const [chainId, chainMetrics] of metrics) {
        await redis.setex(
          `chain:metrics:${chainId}`, 
          60, 
          JSON.stringify(chainMetrics)
        );
      }
      
      return metrics;
      
    } catch (error) {
      logger.error('Failed to get chain metrics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return new Map();
    }
  }

  /**
   * Get performance comparison between chains
   */
  async compareChainPerformance(chainIds: number[]): Promise<any> {
    try {
      const comparison: any = {
        chains: [],
        bestPerforming: null,
        recommendations: []
      };

      for (const chainId of chainIds) {
        const metrics = await blockchainProviderService.getChainMetrics(chainId);
        const config = await this.getChainById(chainId);
        
        if (metrics && config) {
          comparison.chains.push({
            chainId,
            name: config.name,
            metrics: {
              latency: metrics.actualLatency,
              throughput: metrics.currentTPS,
              gasPrice: metrics.gasPrice.standard,
              healthScore: metrics.healthScore,
              congestionLevel: metrics.congestionLevel
            },
            features: config.features,
            optimizations: config.sdkOptimizations
          });
        }
      }

      // Find best performing chain
      if (comparison.chains.length > 0) {
        comparison.bestPerforming = comparison.chains.reduce((best: any, current: any) => 
          current.metrics.healthScore > best.metrics.healthScore ? current : best
        );
        
        // Generate recommendations
        comparison.recommendations = this.generatePerformanceRecommendations(comparison.chains);
      }

      return comparison;
      
    } catch (error) {
      logger.error('Failed to compare chain performance', {
        chainIds,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Optimize chain configuration based on usage patterns
   */
  async optimizeChainConfiguration(chainId: number): Promise<any> {
    try {
      logger.info('Optimizing chain configuration', { chainId });
      
      const metrics = await blockchainProviderService.getChainMetrics(chainId);
      const currentConfig = config.blockchain.supportedChains[chainId];
      
      if (!metrics || !currentConfig) {
        throw new Error('Chain not found or metrics unavailable');
      }

      const optimizations = {
        connectionPool: this.optimizeConnectionPool(metrics, currentConfig),
        caching: this.optimizeCaching(metrics, currentConfig),
        batching: this.optimizeBatching(metrics, currentConfig),
        retryStrategy: this.optimizeRetryStrategy(metrics, currentConfig)
      };

      // Apply optimizations
      await this.applyOptimizations(chainId, optimizations);
      
      logger.info('Chain configuration optimized', { 
        chainId, 
        optimizations 
      });
      
      return optimizations;
      
    } catch (error) {
      logger.error('Failed to optimize chain configuration', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Start automated health monitoring
   */
  private async startHealthMonitoring(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      const supportedChains = blockchainProviderService.getSupportedChains();
      
      for (const chainId of supportedChains) {
        try {
          const status = await this.performHealthCheck(chainId);
          if (status) {
            this.chainStatuses.set(chainId, status);
            
            // Alert on health issues
            if (!status.isHealthy) {
              await this.handleHealthIssue(status);
            }
          }
        } catch (error) {
          logger.error('Health check failed', {
            chainId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Start performance monitoring
   */
  private async startPerformanceMonitoring(): Promise<void> {
    if (this.performanceMonitorInterval) {
      clearInterval(this.performanceMonitorInterval);
    }

    this.performanceMonitorInterval = setInterval(async () => {
      try {
        const metrics = await this.getAllChainMetrics();
        
        // Analyze performance trends
        await this.analyzePerformanceTrends(metrics);
        
        // Generate optimization recommendations
        await this.generateOptimizationRecommendations(metrics);
        
      } catch (error) {
        logger.error('Performance monitoring failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }, 60000); // Monitor every minute
  }

  /**
   * Perform comprehensive health check for a chain
   */
  private async performHealthCheck(chainId: number): Promise<ChainHealthStatus | null> {
    try {
      const startTime = Date.now();
      const provider = await blockchainProviderService.getProvider(chainId);
      
      if (!provider) {
        return {
          chainId,
          isHealthy: false,
          lastChecked: new Date(),
          metrics: this.getDefaultMetrics(chainId),
          issues: ['Provider not available'],
          recommendations: ['Check RPC configuration']
        };
      }

      const issues: string[] = [];
      const recommendations: string[] = [];

      // Test basic connectivity
      let blockNumber: number;
      try {
        blockNumber = await provider.getBlockNumber();
      } catch (error) {
        issues.push('Cannot fetch block number');
        recommendations.push('Check RPC endpoint connectivity');
        throw error;
      }

      // Test gas price fetching
      try {
        await provider.getOptimalGasPrice('standard');
      } catch (error) {
        issues.push('Cannot fetch gas price');
        recommendations.push('Verify gas price oracle');
      }

      // Get performance metrics
      const metrics = await blockchainProviderService.getChainMetrics(chainId) || this.getDefaultMetrics(chainId);
      const responseTime = Date.now() - startTime;

      // Analyze metrics for issues
      if (responseTime > 5000) {
        issues.push('High response time');
        recommendations.push('Consider RPC endpoint optimization');
      }

      if (metrics.errorRate > 0.1) {
        issues.push('High error rate');
        recommendations.push('Check network stability');
      }

      const isHealthy = issues.length === 0;

      return {
        chainId,
        isHealthy,
        lastChecked: new Date(),
        metrics: {
          ...metrics,
          actualLatency: responseTime
        },
        issues,
        recommendations
      };

    } catch (error) {
      return {
        chainId,
        isHealthy: false,
        lastChecked: new Date(),
        metrics: this.getDefaultMetrics(chainId),
        issues: ['Health check failed'],
        recommendations: ['Investigate connection issues']
      };
    }
  }

  /**
   * Sync chain configurations with database
   */
  private async syncChainConfigurations(): Promise<void> {
    try {
      for (const [chainIdStr, chainConfig] of Object.entries(config.blockchain.supportedChains)) {
        const chainId = parseInt(chainIdStr);
        
        await prisma.chain.upsert({
          where: { chainId },
          update: {
            name: chainConfig.name,
            displayName: chainConfig.displayName,
            rpcUrl: chainConfig.rpcUrl,
            explorerUrl: chainConfig.explorerUrl,
            faucetUrl: chainConfig.faucetUrl,
            isActive: chainConfig.isActive,
            isTestnet: chainConfig.isTestnet,
            nativeCurrency: chainConfig.nativeCurrency,
            features: chainConfig.features,
            updatedAt: new Date()
          },
          create: {
            chainId,
            name: chainConfig.name,
            displayName: chainConfig.displayName,
            rpcUrl: chainConfig.rpcUrl,
            explorerUrl: chainConfig.explorerUrl,
            faucetUrl: chainConfig.faucetUrl,
            isActive: chainConfig.isActive,
            isTestnet: chainConfig.isTestnet,
            nativeCurrency: chainConfig.nativeCurrency,
            features: chainConfig.features
          }
        });
      }
      
      logger.info('Chain configurations synchronized with database');
      
    } catch (error) {
      logger.error('Failed to sync chain configurations', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Handle health issues by taking corrective action
   */
  private async handleHealthIssue(status: ChainHealthStatus): Promise<void> {
    logger.warn('Chain health issue detected', {
      chainId: status.chainId,
      issues: status.issues,
      recommendations: status.recommendations
    });

    // Attempt automatic recovery
    if (status.issues.includes('Provider not available')) {
      await this.attemptProviderRecovery(status.chainId);
    }

    // Store health issue in database for tracking
    try {
      await prisma.chainHealthLog.create({
        data: {
          chainId: status.chainId,
          isHealthy: status.isHealthy,
          issues: status.issues,
          recommendations: status.recommendations,
          metrics: status.metrics,
          checkedAt: status.lastChecked
        }
      });
    } catch (error) {
      logger.error('Failed to log health issue', {
        chainId: status.chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Attempt to recover a failed provider
   */
  private async attemptProviderRecovery(chainId: number): Promise<void> {
    try {
      logger.info('Attempting provider recovery', { chainId });
      
      // Reinitialize provider
      // This would trigger provider reinitialization in the service
      const newProvider = await blockchainProviderService.getProvider(chainId);
      
      if (newProvider) {
        logger.info('Provider recovery successful', { chainId });
      } else {
        logger.warn('Provider recovery failed', { chainId });
      }
      
    } catch (error) {
      logger.error('Provider recovery failed', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Optimization helper methods
   */
  private optimizeConnectionPool(metrics: ChainMetrics, currentConfig: any): any {
    const current = currentConfig.sdkConfig.connectionPooling;
    
    if (metrics.actualLatency > 3000) {
      return {
        ...current,
        maxConnections: Math.min(current.maxConnections * 1.5, 200),
        idleTimeout: current.idleTimeout * 0.8
      };
    }
    
    return current;
  }

  private optimizeCaching(metrics: ChainMetrics, currentConfig: any): any {
    const current = currentConfig.sdkConfig.caching;
    
    if (metrics.currentTPS > 1000) {
      return {
        ...current,
        strategy: 'ultra-aggressive',
        ttl: current.ttl * 0.5,
        maxSize: current.maxSize * 2
      };
    }
    
    return current;
  }

  private optimizeBatching(metrics: ChainMetrics, currentConfig: any): any {
    const current = currentConfig.sdkConfig.batchOptimization;
    
    if (metrics.currentTPS > 10000) {
      return {
        ...current,
        maxBatchSize: Math.min(current.maxBatchSize * 2, 10000),
        batchTimeout: Math.max(current.batchTimeout * 0.5, 5)
      };
    }
    
    return current;
  }

  private optimizeRetryStrategy(metrics: ChainMetrics, currentConfig: any): any {
    const current = currentConfig.sdkConfig.retryStrategy;
    
    if (metrics.errorRate > 0.05) {
      return {
        ...current,
        maxRetries: Math.min(current.maxRetries + 2, 10),
        backoffMultiplier: Math.min(current.backoffMultiplier * 1.2, 3.0)
      };
    }
    
    return current;
  }

  private async applyOptimizations(chainId: number, optimizations: any): Promise<void> {
    // Apply optimizations to the provider configuration
    // This would update the provider's runtime configuration
    logger.info('Applied optimizations', { chainId, optimizations });
  }

  private async analyzePerformanceTrends(metrics: Map<number, ChainMetrics>): Promise<void> {
    // Analyze performance trends over time
    for (const [chainId, chainMetrics] of metrics) {
      const trendKey = `trend:${chainId}`;
      const historical = await redis.lrange(trendKey, 0, 9); // Last 10 readings
      
      historical.unshift(JSON.stringify({
        timestamp: Date.now(),
        latency: chainMetrics.actualLatency,
        throughput: chainMetrics.currentTPS,
        errorRate: chainMetrics.errorRate
      }));
      
      // Keep only last 10 readings
      await redis.ltrim(trendKey, 0, 9);
      await redis.lpush(trendKey, historical[0]);
      await redis.expire(trendKey, 3600); // Expire in 1 hour
    }
  }

  private async generateOptimizationRecommendations(metrics: Map<number, ChainMetrics>): Promise<void> {
    // Generate optimization recommendations based on metrics
    for (const [chainId, chainMetrics] of metrics) {
      const recommendations: string[] = [];
      
      if (chainMetrics.actualLatency > 3000) {
        recommendations.push('Consider increasing connection pool size');
      }
      
      if (chainMetrics.errorRate > 0.1) {
        recommendations.push('Increase retry attempts and backoff');
      }
      
      if (chainMetrics.currentTPS < chainMetrics.throughputUtilization * 0.5) {
        recommendations.push('Enable batch optimization for better throughput');
      }
      
      if (recommendations.length > 0) {
        await redis.setex(
          `recommendations:${chainId}`, 
          3600, 
          JSON.stringify(recommendations)
        );
      }
    }
  }

  private generatePerformanceRecommendations(chains: any[]): string[] {
    const recommendations: string[] = [];
    
    const avgLatency = chains.reduce((sum, chain) => sum + chain.metrics.latency, 0) / chains.length;
    const highLatencyChains = chains.filter(chain => chain.metrics.latency > avgLatency * 1.5);
    
    if (highLatencyChains.length > 0) {
      recommendations.push(`Consider avoiding ${highLatencyChains.map(c => c.name).join(', ')} for latency-sensitive operations`);
    }
    
    const highThroughputChains = chains.filter(chain => chain.metrics.throughput > 1000);
    if (highThroughputChains.length > 0) {
      recommendations.push(`Use ${highThroughputChains.map(c => c.name).join(', ')} for high-volume operations`);
    }
    
    return recommendations;
  }

  private getDefaultMetrics(chainId: number): ChainMetrics {
    const chainConfig = config.blockchain.supportedChains[chainId];
    
    return {
      chainId,
      currentTPS: 0,
      avgBlockTime: chainConfig?.avgBlockTime || 12000,
      gasPrice: {
        slow: '0',
        standard: '0',
        fast: '0',
        fastest: '0'
      },
      congestionLevel: 0,
      healthScore: 0,
      actualLatency: 0,
      throughputUtilization: 0,
      errorRate: 0
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    if (this.performanceMonitorInterval) {
      clearInterval(this.performanceMonitorInterval);
    }
    
    logger.info('Chain Management Service cleaned up');
  }
}

export const chainManagementService = new ChainManagementService();
