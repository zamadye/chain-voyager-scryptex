
import { Request, Response } from 'express';
import { chainManagementService } from '@/services/chainManagementService';
import { enhancedWeb3Service } from '@/services/enhancedWeb3Service';
import { blockchainProviderService } from '@/services/blockchainProviderService';
import { logger } from '@/utils/logger';
import { asyncHandler } from '@/middleware/errorHandler';

/**
 * Enhanced chain controller for multi-chain operations
 */
export class ChainController {
  /**
   * Get all supported chains with their configurations
   */
  getAllChains = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { includeInactive = false } = req.query;
    
    try {
      const chains = await chainManagementService.getAllChains(
        includeInactive === 'true'
      );
      
      res.json({
        success: true,
        data: {
          chains,
          totalCount: chains.length,
          activeCount: chains.filter(c => c.isActive).length
        }
      });
      
    } catch (error) {
      logger.error('Failed to get all chains', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve chains'
      });
    }
  });

  /**
   * Get specific chain details
   */
  getChainById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { chainId } = req.params;
    
    try {
      const chain = await chainManagementService.getChainById(parseInt(chainId));
      
      if (!chain) {
        res.status(404).json({
          success: false,
          error: 'Chain not found'
        });
        return;
      }
      
      // Get additional real-time data
      const [health, metrics] = await Promise.all([
        chainManagementService.getChainHealth(parseInt(chainId)),
        blockchainProviderService.getChainMetrics(parseInt(chainId))
      ]);
      
      res.json({
        success: true,
        data: {
          ...chain,
          health,
          metrics
        }
      });
      
    } catch (error) {
      logger.error('Failed to get chain by ID', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve chain details'
      });
    }
  });

  /**
   * Get comprehensive chain status and health
   */
  getChainStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { chainId } = req.params;
    
    try {
      const [health, metrics, provider] = await Promise.all([
        chainManagementService.getChainHealth(parseInt(chainId)),
        blockchainProviderService.getChainMetrics(parseInt(chainId)),
        blockchainProviderService.getProvider(parseInt(chainId))
      ]);
      
      if (!provider) {
        res.status(404).json({
          success: false,
          error: 'Chain provider not available'
        });
        return;
      }
      
      // Get real-time blockchain data
      const [blockNumber, balance] = await Promise.all([
        provider.getBlockNumber(),
        provider.getBalance('0x0000000000000000000000000000000000000000') // Zero address for testing
      ]);
      
      res.json({
        success: true,
        data: {
          chainId: parseInt(chainId),
          health,
          metrics,
          blockchain: {
            latestBlock: blockNumber,
            isConnected: provider.isConnected
          },
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      logger.error('Failed to get chain status', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve chain status'
      });
    }
  });

  /**
   * Get current gas prices for chain
   */
  getGasPrice = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { chainId } = req.params;
    const { urgency = 'standard' } = req.query;
    
    try {
      const provider = await blockchainProviderService.getProvider(parseInt(chainId));
      
      if (!provider) {
        res.status(404).json({
          success: false,
          error: 'Chain provider not available'
        });
        return;
      }
      
      // Get gas prices for different urgency levels
      const [slow, standard, fast, fastest] = await Promise.all([
        provider.getOptimalGasPrice('slow'),
        provider.getOptimalGasPrice('standard'),
        provider.getOptimalGasPrice('fast'),
        provider.getOptimalGasPrice('fastest')
      ]);
      
      res.json({
        success: true,
        data: {
          chainId: parseInt(chainId),
          gasPrice: {
            slow,
            standard,
            fast,
            fastest
          },
          recommended: urgency === 'slow' ? slow : 
                      urgency === 'fast' ? fast :
                      urgency === 'fastest' ? fastest : standard,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      logger.error('Failed to get gas price', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve gas price'
      });
    }
  });

  /**
   * Compare performance across multiple chains
   */
  compareChains = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { chainIds } = req.body;
    
    if (!Array.isArray(chainIds) || chainIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid chain IDs provided'
      });
      return;
    }
    
    try {
      const comparison = await chainManagementService.compareChainPerformance(
        chainIds.map((id: any) => parseInt(id))
      );
      
      res.json({
        success: true,
        data: comparison
      });
      
    } catch (error) {
      logger.error('Failed to compare chains', {
        chainIds,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to compare chain performance'
      });
    }
  });

  /**
   * Get optimal chain recommendation for operation
   */
  getOptimalChain = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { 
      latency = 5000, 
      throughput = 100, 
      cost = 'medium',
      features = [],
      compliance = false
    } = req.body;
    
    try {
      const requirements = {
        latency: parseInt(latency),
        throughput: parseInt(throughput),
        cost,
        features: Array.isArray(features) ? features : [],
        compliance
      };
      
      const recommendation = await enhancedWeb3Service.getOptimalChainRecommendation(requirements);
      
      res.json({
        success: true,
        data: {
          recommendation,
          requirements,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      logger.error('Failed to get optimal chain recommendation', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to get chain recommendation'
      });
    }
  });

  /**
   * Get real-time metrics for all chains
   */
  getAllMetrics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      const allMetrics = await chainManagementService.getAllChainMetrics();
      
      const metricsArray = Array.from(allMetrics.entries()).map(([chainId, metrics]) => ({
        chainId,
        ...metrics
      }));
      
      res.json({
        success: true,
        data: {
          metrics: metricsArray,
          summary: {
            totalChains: metricsArray.length,
            healthyChains: metricsArray.filter(m => m.healthScore > 80).length,
            averageLatency: metricsArray.reduce((sum, m) => sum + m.actualLatency, 0) / metricsArray.length,
            totalThroughput: metricsArray.reduce((sum, m) => sum + m.currentTPS, 0)
          },
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      logger.error('Failed to get all metrics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve metrics'
      });
    }
  });

  /**
   * Optimize chain configuration
   */
  optimizeChain = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { chainId } = req.params;
    
    try {
      const optimizations = await chainManagementService.optimizeChainConfiguration(
        parseInt(chainId)
      );
      
      res.json({
        success: true,
        data: {
          chainId: parseInt(chainId),
          optimizations,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      logger.error('Failed to optimize chain', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to optimize chain configuration'
      });
    }
  });

  /**
   * Test chain connectivity and performance
   */
  testChain = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { chainId } = req.params;
    const { operations = ['connectivity', 'gas', 'performance'] } = req.body;
    
    try {
      const startTime = Date.now();
      const provider = await blockchainProviderService.getProvider(parseInt(chainId));
      
      if (!provider) {
        res.status(404).json({
          success: false,
          error: 'Chain provider not available'
        });
        return;
      }
      
      const testResults: any = {
        chainId: parseInt(chainId),
        tests: {},
        totalTime: 0,
        success: true
      };
      
      // Connectivity test
      if (operations.includes('connectivity')) {
        const connectivityStart = Date.now();
        try {
          const blockNumber = await provider.getBlockNumber();
          testResults.tests.connectivity = {
            success: true,
            blockNumber,
            latency: Date.now() - connectivityStart
          };
        } catch (error) {
          testResults.tests.connectivity = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            latency: Date.now() - connectivityStart
          };
          testResults.success = false;
        }
      }
      
      // Gas price test
      if (operations.includes('gas')) {
        const gasStart = Date.now();
        try {
          const gasPrice = await provider.getOptimalGasPrice('standard');
          testResults.tests.gas = {
            success: true,
            gasPrice,
            latency: Date.now() - gasStart
          };
        } catch (error) {
          testResults.tests.gas = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            latency: Date.now() - gasStart
          };
        }
      }
      
      // Performance test
      if (operations.includes('performance')) {
        const perfStart = Date.now();
        try {
          const metrics = await blockchainProviderService.getChainMetrics(parseInt(chainId));
          testResults.tests.performance = {
            success: true,
            metrics,
            latency: Date.now() - perfStart
          };
        } catch (error) {
          testResults.tests.performance = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            latency: Date.now() - perfStart
          };
        }
      }
      
      testResults.totalTime = Date.now() - startTime;
      
      res.json({
        success: true,
        data: testResults
      });
      
    } catch (error) {
      logger.error('Failed to test chain', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to test chain'
      });
    }
  });
}

export const chainController = new ChainController();
