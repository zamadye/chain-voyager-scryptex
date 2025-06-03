
import { APIResponse } from '@/types';

export const mockApi = {
  async get<T = any>(endpoint: string, options?: { params?: Record<string, any> }): Promise<APIResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Mock different responses based on endpoint for bridge service
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
            },
            {
              provider: 'megaeth' as const,
              sourceChain: 1,
              targetChain: 6342,
              estimatedFee: '800000000000000', // 0.0008 ETH in wei
              estimatedTime: 15,
              securityScore: 88,
              pointsReward: 13
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

      if (endpoint.includes('/bridge/points')) {
        const mockPoints = {
          userAddress: '0x1234567890123456789012345678901234567890',
          totalPoints: 1250,
          bridgePoints: 1000,
          bonusPoints: 200,
          dailyTaskPoints: 50,
          totalBridges: 85,
          successfulBridges: 82,
          totalBridgeVolume: '15500000000000000000',
          risechainBridges: 35,
          pharosBridges: 25,
          megaethBridges: 22,
          currentDailyStreak: 5,
          longestDailyStreak: 12,
          bridgesToday: 2,
          achievements: ['first_bridge', 'speed_demon', 'multi_chain_master'],
          rank: 47
        };

        return {
          success: true,
          data: mockPoints as T,
          error: '',
          message: 'Success'
        };
      }

      if (endpoint.includes('/bridge/leaderboard')) {
        const mockLeaderboard = {
          leaderboard: [
            {
              rank: 1,
              userAddress: '0x1111111111111111111111111111111111111111',
              totalPoints: 5420,
              totalBridges: 342,
              totalVolume: '85000000000000000000',
              achievements: ['legendary_bridger', 'volume_king', 'speed_demon']
            },
            {
              rank: 2,
              userAddress: '0x2222222222222222222222222222222222222222',
              totalPoints: 4850,
              totalBridges: 298,
              totalVolume: '72000000000000000000',
              achievements: ['multi_chain_master', 'consistency_champion']
            }
          ],
          period: 'all_time',
          lastUpdated: new Date().toISOString()
        };

        return {
          success: true,
          data: mockLeaderboard as T,
          error: '',
          message: 'Success'
        };
      }

      if (endpoint.includes('/bridge/tasks/daily')) {
        const mockTasks = {
          tasks: [
            {
              taskId: 'daily_bridge_1',
              taskName: 'First Bridge of the Day',
              taskDescription: 'Complete your first bridge transaction today',
              taskType: 'bridge_count',
              requiredProgress: 1,
              taskPoints: 5,
              isActive: true
            },
            {
              taskId: 'daily_bridge_3',
              taskName: 'Bridge Explorer',
              taskDescription: 'Bridge to 3 different chains today',
              taskType: 'bridge_chains',
              requiredProgress: 3,
              taskPoints: 15,
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
