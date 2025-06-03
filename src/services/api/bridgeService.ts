
import { mockApi } from '@/lib/api';

export interface BridgeQuoteRequest {
  fromChain: number;
  toChain: number;
  amount: string;
  strategy?: 'fastest' | 'cheapest' | 'most_secure' | 'most_points';
}

export interface BridgeRoute {
  provider: 'risechain' | 'pharos' | 'megaeth';
  sourceChain: number;
  targetChain: number;
  estimatedFee: string;
  estimatedTime: number;
  securityScore: number;
  pointsReward: number;
}

export interface BridgeQuoteResponse {
  selectedRoute: BridgeRoute;
  alternativeRoutes: BridgeRoute[];
  strategy: string;
  recommendation: string;
}

export interface BridgeInitiateRequest {
  fromChain: number;
  toChain: number;
  tokenAddress: string;
  amount: string;
  recipient?: string;
  userAddress?: string;
  preferredRoute?: 'fastest' | 'cheapest' | 'most_secure' | 'most_points';
}

export interface BridgeInitiateResponse {
  bridgeId: string;
  bridgeProvider: string;
  transactionHash: string;
  pointsAwarded: number;
  estimatedTime: number;
  actualFee: string;
  selectedRoute: BridgeRoute;
}

export interface BridgeTransaction {
  id: string;
  userAddress: string;
  sourceChainId: number;
  targetChainId: number;
  bridgeProvider: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: string;
  sourceTxHash?: string;
  targetTxHash?: string;
  bridgeId: string;
  bridgeFee: string;
  gasFee?: string;
  totalCost: string;
  bridgeStatus: string;
  initiatedAt: string;
  completedAt?: string;
  pointsAwarded: number;
  basePoints: number;
  bonusPoints: number;
  isFirstBridgeToday: boolean;
}

export interface UserBridgePoints {
  userAddress: string;
  totalPoints: number;
  bridgePoints: number;
  bonusPoints: number;
  dailyTaskPoints: number;
  totalBridges: number;
  successfulBridges: number;
  totalBridgeVolume: string;
  risechainBridges: number;
  pharosBridges: number;
  megaethBridges: number;
  currentDailyStreak: number;
  longestDailyStreak: number;
  bridgesToday: number;
  achievements: string[];
  rank?: number;
}

export interface BridgeLeaderboardEntry {
  rank: number;
  userAddress: string;
  totalPoints: number;
  totalBridges: number;
  totalVolume: string;
  achievements: string[];
}

export interface DailyBridgeTask {
  taskId: string;
  taskName: string;
  taskDescription: string;
  taskType: string;
  requiredProgress: number;
  taskPoints: number;
  isActive: boolean;
}

export interface UserTaskProgress {
  taskId: string;
  taskName: string;
  currentProgress: number;
  requiredProgress: number;
  isCompleted: boolean;
  pointsAwarded: number;
}

export interface BridgeAnalytics {
  totalBridges: number;
  totalVolume: string;
  averageAmount: string;
  favoriteChains: { chainId: number; chainName: string; count: number }[];
  pointsEarned: number;
  bridgesByProvider: { provider: string; count: number; volume: string }[];
  dailyActivity: { date: string; bridges: number; volume: string }[];
}

export class BridgeService {
  // Bridge Operations
  async getBridgeQuote(request: BridgeQuoteRequest) {
    return mockApi.get<BridgeQuoteResponse>('/api/v1/bridge/quote', {
      params: request
    });
  }

  async initiateBridge(request: BridgeInitiateRequest) {
    return mockApi.post<BridgeInitiateResponse>('/api/v1/bridge/initiate', request);
  }

  async getBridgeStatus(bridgeId: string) {
    return mockApi.get(`/api/v1/bridge/status/${bridgeId}`);
  }

  async getUserBridgeHistory(address?: string, limit = 50, offset = 0) {
    const endpoint = address 
      ? `/api/v1/bridge/history/${address}`
      : '/api/v1/bridge/history';
    
    return mockApi.get<{
      bridges: BridgeTransaction[];
      pagination: { limit: number; offset: number; total: number };
    }>(endpoint, {
      params: { limit, offset }
    });
  }

  // Point System
  async getUserPoints(address?: string) {
    const endpoint = address 
      ? `/api/v1/bridge/points/${address}`
      : '/api/v1/bridge/points';
    
    return mockApi.get<UserBridgePoints>(endpoint);
  }

  async getBridgeLeaderboard(limit = 50, period = 'all_time') {
    return mockApi.get<{
      leaderboard: BridgeLeaderboardEntry[];
      period: string;
      lastUpdated: string;
    }>('/api/v1/bridge/leaderboard', {
      params: { limit, period }
    });
  }

  // Analytics
  async getUserBridgeAnalytics(address?: string, timeframe = '30d') {
    const endpoint = address 
      ? `/api/v1/bridge/analytics/user/${address}`
      : '/api/v1/bridge/analytics/user';
    
    return mockApi.get<BridgeAnalytics>(endpoint, {
      params: { timeframe }
    });
  }

  async getGlobalBridgeAnalytics(timeframe = '30d') {
    return mockApi.get<BridgeAnalytics>('/api/v1/bridge/analytics/global', {
      params: { timeframe }
    });
  }

  // Daily Tasks
  async getDailyTasks() {
    return mockApi.get<{
      tasks: DailyBridgeTask[];
      date: string;
    }>('/api/v1/bridge/tasks/daily');
  }

  async getUserTaskProgress(address?: string) {
    const endpoint = address 
      ? `/api/v1/bridge/tasks/progress/${address}`
      : '/api/v1/bridge/tasks/progress';
    
    return mockApi.get<{
      progress: UserTaskProgress[];
      date: string;
      userAddress: string;
    }>(endpoint);
  }

  // Helper Methods
  async getSupportedChains() {
    return [
      { id: 1, name: 'Ethereum Mainnet', testnet: false },
      { id: 11155111, name: 'Ethereum Sepolia', testnet: true },
      { id: 6342, name: 'MegaETH Testnet', testnet: true },
      { id: 11155931, name: 'RiseChain Testnet', testnet: true }
    ];
  }

  async getSupportedTokens(chainId: number) {
    const tokens = {
      1: [
        { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ethereum' },
        { address: '0xA0b86a33E6411679C79F7c37a8CbAd19506e5d8b', symbol: 'USDC', name: 'USD Coin' },
        { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD' }
      ],
      11155111: [
        { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ethereum' },
        { address: '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8', symbol: 'USDC', name: 'USD Coin' }
      ],
      6342: [
        { address: '0x0000000000000000000000000000000000000000', symbol: 'METH', name: 'MegaETH' }
      ],
      11155931: [
        { address: '0x0000000000000000000000000000000000000000', symbol: 'RISE', name: 'RiseChain' }
      ]
    };

    return tokens[chainId as keyof typeof tokens] || [];
  }

  formatBridgeAmount(amount: string, decimals = 18): string {
    const num = parseFloat(amount) / Math.pow(10, decimals);
    return num.toFixed(6);
  }

  formatBridgeFee(fee: string): string {
    const feeInEth = parseFloat(fee) / Math.pow(10, 18);
    return `${feeInEth.toFixed(6)} ETH`;
  }

  getBridgeProviderName(provider: string): string {
    const names = {
      'risechain': 'RiseChain',
      'pharos': 'Pharos Network',
      'megaeth': 'MegaETH'
    };
    return names[provider as keyof typeof names] || provider;
  }

  getBridgeStatusColor(status: string): string {
    const colors = {
      'pending': 'text-yellow-400',
      'confirmed': 'text-blue-400',
      'completed': 'text-green-400',
      'failed': 'text-red-400'
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  }

  getPointsColor(points: number): string {
    if (points >= 20) return 'text-purple-400';
    if (points >= 15) return 'text-blue-400';
    if (points >= 10) return 'text-green-400';
    return 'text-gray-400';
  }
}

export const bridgeService = new BridgeService();
