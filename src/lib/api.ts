
import { APIResponse } from '@/types';

export const mockApi = {
  async get<T = any>(endpoint: string, options?: { params?: Record<string, any> }): Promise<APIResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Mock different responses based on endpoint
      
      // Bridge service endpoints
      if (endpoint.includes('/bridge/quote')) {
        const mockQuoteResponse = {
          selectedRoute: {
            provider: 'risechain' as const,
            sourceChain: 1,
            targetChain: 6342,
            estimatedFee: '1000000000000000', // 0.001 ETH in wei
            estimatedTime: 30,
            securityScore: 95,
            pointsReward: 12
          },
          alternativeRoutes: [
            {
              provider: 'pharos' as const,
              sourceChain: 1,
              targetChain: 6342,
              estimatedFee: '1500000000000000', // 0.0015 ETH in wei
              estimatedTime: 45,
              securityScore: 92,
              pointsReward: 15
            }
          ],
          strategy: options?.params?.strategy || 'fastest',
          recommendation: 'RiseChain selected for optimal balance of speed, cost, and security.'
        };
        
        return {
          success: true,
          data: mockQuoteResponse as T,
          error: '',
          message: 'Success'
        };
      }

      if (endpoint.includes('/bridge/history')) {
        const mockHistory = {
          bridges: [
            {
              id: 'bridge_001',
              userAddress: '0x1234567890123456789012345678901234567890',
              sourceChainId: 1,
              targetChainId: 6342,
              bridgeProvider: 'risechain',
              tokenAddress: '0x0000000000000000000000000000000000000000',
              tokenSymbol: 'ETH',
              amount: '1000000000000000000',
              sourceTxHash: '0xabc123',
              targetTxHash: '0xdef456',
              bridgeId: 'bridge_001',
              bridgeFee: '1000000000000000',
              gasFee: '500000000000000',
              totalCost: '1500000000000000',
              bridgeStatus: 'completed',
              initiatedAt: new Date(Date.now() - 3600000).toISOString(),
              completedAt: new Date().toISOString(),
              pointsAwarded: 12,
              basePoints: 10,
              bonusPoints: 2,
              isFirstBridgeToday: true
            }
          ],
          pagination: {
            limit: 50,
            offset: 0,
            total: 1
          }
        };

        return {
          success: true,
          data: mockHistory as T,
          error: '',
          message: 'Success'
        };
      }

      // Swap service endpoints
      if (endpoint.includes('/swap/quote')) {
        const mockSwapQuote = {
          dex: options?.params?.dex || 'clober',
          tokenIn: options?.params?.tokenIn || '0x0000000000000000000000000000000000000000',
          tokenOut: options?.params?.tokenOut || '0x1234567890123456789012345678901234567890',
          amountIn: options?.params?.amountIn || '1000000000000000000',
          amountOut: '2450000000', // USDC amount
          priceImpact: 0.05,
          tradingFee: '2500000000000000', // 0.0025 ETH
          platformFee: '500000000000000', // 0.0005 ETH
          gasEstimate: 150000,
          route: [
            {
              dex: 'clober',
              pair: 'ETH/USDC',
              amountIn: options?.params?.amountIn || '1000000000000000000',
              amountOut: '2450000000',
              fee: 0.25
            }
          ],
          validUntil: Date.now() + 30000
        };

        return {
          success: true,
          data: mockSwapQuote as T,
          error: '',
          message: 'Success'
        };
      }

      if (endpoint.includes('/swap/trading/points')) {
        const mockTradingStats = {
          userAddress: '0x1234567890123456789012345678901234567890',
          totalTradingPoints: 850,
          swapPoints: 600,
          bonusPoints: 200,
          achievementPoints: 50,
          totalSwaps: 120,
          successfulSwaps: 118,
          totalTradingVolumeUsd: '25000000000000000000', // $25k
          cloberSwaps: 45,
          gteSwaps: 35,
          pharosDexSwaps: 38,
          averagePriceImpact: 0.12,
          averageSlippage: 0.08,
          currentTradingStreak: 7,
          longestTradingStreak: 15,
          swapsToday: 3,
          tradingLevel: 5,
          tradingExperience: 850,
          achievements: ['first_swap', 'volume_100', 'multi_dex'],
          lastActivityAt: new Date().toISOString()
        };

        return {
          success: true,
          data: mockTradingStats as T,
          error: '',
          message: 'Success'
        };
      }

      if (endpoint.includes('/swap/trading/tasks/daily')) {
        const mockTasks = {
          tasks: [
            {
              taskId: 'daily_swap_1',
              taskName: 'First Swap of the Day',
              taskDescription: 'Complete your first swap today',
              taskType: 'swap_count',
              requiredSwaps: 1,
              taskPoints: 5,
              bonusMultiplier: 1.0,
              isActive: true
            },
            {
              taskId: 'daily_swap_3',
              taskName: 'Active Trader',
              taskDescription: 'Complete 3 swaps today',
              taskType: 'swap_count',
              requiredSwaps: 3,
              taskPoints: 15,
              bonusMultiplier: 1.0,
              isActive: true
            },
            {
              taskId: 'daily_dex_variety',
              taskName: 'DEX Explorer',
              taskDescription: 'Trade on 2 different DEXs today',
              taskType: 'dex_variety',
              requiredDexs: 2,
              taskPoints: 20,
              bonusMultiplier: 1.0,
              isActive: true
            }
          ],
          date: new Date().toISOString().split('T')[0]
        };

        return {
          success: true,
          data: mockTasks as T,
          error: '',
          message: 'Success'
        };
      }

      if (endpoint.includes('/swap/history')) {
        const mockSwapHistory = {
          swaps: [
            {
              id: 'swap_001',
              userAddress: '0x1234567890123456789012345678901234567890',
              chainId: 6342,
              dexName: 'clober',
              tokenInSymbol: 'RISE',
              tokenOutSymbol: 'USDC',
              amountIn: '1000000000000000000',
              amountOut: '2450000000',
              swapType: 'standard',
              priceImpact: 0.05,
              tradingFee: '2500000000000000',
              swapStatus: 'completed',
              executedAt: new Date(Date.now() - 1800000).toISOString(),
              pointsAwarded: 7,
              txHash: '0xabc123def456'
            }
          ],
          pagination: {
            limit: 50,
            offset: 0,
            total: 1
          }
        };

        return {
          success: true,
          data: mockSwapHistory as T,
          error: '',
          message: 'Success'
        };
      }

      if (endpoint.includes('/swap/routes/optimal')) {
        const mockOptimalRoute = {
          recommendedDEX: 'clober',
          recommendedChain: 6342,
          estimatedAmountOut: '2450000000',
          estimatedFee: '3000000000000000',
          estimatedGas: 150000,
          pointsToAward: 7,
          priceImpact: 0.05,
          reasonForRecommendation: 'Best price output with optimal gas efficiency',
          alternativeRoutes: [
            {
              dex: 'gte',
              amountOut: '2445000000',
              tradingFee: '2000000000000000',
              platformFee: '400000000000000',
              gasEstimate: 120000
            }
          ]
        };

        return {
          success: true,
          data: mockOptimalRoute as T,
          error: '',
          message: 'Success'
        };
      }

      return {
        success: true,
        data: {} as T,
        error: '',
        message: 'Success'
      };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Request failed'
      };
    }
  },

  async post<T = any>(endpoint: string, data: any): Promise<APIResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      if (endpoint.includes('/bridge/initiate')) {
        const mockBridgeResponse = {
          bridgeId: `bridge_${Date.now()}`,
          bridgeProvider: 'risechain',
          transactionHash: `0x${Math.random().toString(16).slice(2)}`,
          pointsAwarded: 12,
          estimatedTime: 30,
          actualFee: '1000000000000000',
          selectedRoute: {
            provider: 'risechain' as const,
            sourceChain: data.fromChain,
            targetChain: data.toChain,
            estimatedFee: '1000000000000000',
            estimatedTime: 30,
            securityScore: 95,
            pointsReward: 12
          }
        };

        return {
          success: true,
          data: mockBridgeResponse as T,
          error: '',
          message: 'Bridge initiated successfully'
        };
      }

      if (endpoint.includes('/swap/execute')) {
        const mockSwapResponse = {
          success: true,
          txHash: `0x${Math.random().toString(16).slice(2)}`,
          amountOut: '2445123456',
          actualPriceImpact: 0.07,
          actualSlippage: 0.05,
          gasUsed: 148523,
          tradingFee: '2500000000000000'
        };

        return {
          success: true,
          data: mockSwapResponse as T,
          error: '',
          message: 'Swap executed successfully'
        };
      }

      return {
        success: true,
        data: {} as T,
        error: '',
        message: 'Success'
      };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Request failed'
      };
    }
  }
};
