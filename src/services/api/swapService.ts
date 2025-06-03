
import { mockApi } from '@/lib/api';

export interface SwapQuoteRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  chainId: number;
  dex?: 'clober' | 'gte' | 'pharos_dex';
  swapType?: 'standard' | 'realtime' | 'rwa' | 'hft';
  slippageTolerance?: number;
}

export interface SwapQuote {
  dex: 'clober' | 'gte' | 'pharos_dex';
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  tradingFee: string;
  platformFee: string;
  gasEstimate: number;
  route: SwapRoute[];
  validUntil: number;
}

export interface SwapRoute {
  dex: string;
  pair: string;
  amountIn: string;
  amountOut: string;
  fee: number;
}

export interface SwapExecuteRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  minAmountOut: string;
  chainId: number;
  dex: 'clober' | 'gte' | 'pharos_dex';
  swapType?: 'standard' | 'realtime' | 'rwa' | 'hft';
  recipient?: string;
  deadline?: number;
  slippageTolerance: number;
}

export interface SwapResult {
  success: boolean;
  txHash?: string;
  amountOut?: string;
  actualPriceImpact?: number;
  actualSlippage?: number;
  gasUsed?: number;
  tradingFee?: string;
  error?: string;
}

export interface OptimalRouteRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  preferredDEX?: 'clober' | 'gte' | 'pharos_dex';
  optimization?: 'price' | 'gas' | 'time' | 'points';
}

export interface OptimalRouteResponse {
  recommendedDEX: 'clober' | 'gte' | 'pharos_dex';
  recommendedChain: number;
  estimatedAmountOut: string;
  estimatedFee: string;
  estimatedGas: number;
  pointsToAward: number;
  priceImpact: number;
  reasonForRecommendation: string;
  alternativeRoutes: SwapQuote[];
}

export interface UserTradingStats {
  userAddress: string;
  totalTradingPoints: number;
  swapPoints: number;
  bonusPoints: number;
  achievementPoints: number;
  totalSwaps: number;
  successfulSwaps: number;
  totalTradingVolumeUsd: string;
  cloberSwaps: number;
  gteSwaps: number;
  pharosDexSwaps: number;
  averagePriceImpact: number;
  averageSlippage: number;
  currentTradingStreak: number;
  longestTradingStreak: number;
  swapsToday: number;
  tradingLevel: number;
  tradingExperience: number;
  achievements: string[];
  lastActivityAt: string;
}

export interface DailyTradingTask {
  taskId: string;
  taskName: string;
  taskDescription: string;
  taskType: string;
  requiredSwaps?: number;
  requiredVolumeUsd?: string;
  requiredDexs?: number;
  taskPoints: number;
  bonusMultiplier: number;
  isActive: boolean;
}

export interface UserTaskProgress {
  taskId: string;
  taskName: string;
  currentProgress: number;
  currentVolumeUsd: string;
  requiredProgress: number;
  isCompleted: boolean;
  pointsAwarded: number;
  dexsUsed: string[];
  tokensUsed: string[];
}

export interface TradingAnalytics {
  totalSwaps: number;
  totalVolumeUsd: string;
  averageSwapSizeUsd: string;
  favoriteTokens: { symbol: string; count: number; volume: string }[];
  favoriteDEXs: { dex: string; count: number; volume: string }[];
  profitLoss: string;
  dailyActivity: { date: string; swaps: number; volume: string }[];
  pointsEarned: number;
  achievementsCount: number;
}

export interface OrderBook {
  pair: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: string;
  lastUpdate: number;
}

export interface OrderBookLevel {
  price: string;
  amount: string;
  total: string;
}

export interface MarketData {
  pair: string;
  price: string;
  timestamp: number;
  volume24h: string;
}

export class SwapService {
  // Swap operations
  async getSwapQuote(request: SwapQuoteRequest) {
    return mockApi.get<SwapQuote>('/api/v1/swap/quote', {
      params: request
    });
  }

  async executeSwap(request: SwapExecuteRequest) {
    return mockApi.post<SwapResult>('/api/v1/swap/execute', request);
  }

  async getSwapStatus(txHash: string) {
    return mockApi.get(`/api/v1/swap/status/${txHash}`);
  }

  async getSwapHistory(address?: string, limit = 50, offset = 0, dex?: string, status?: string) {
    const endpoint = address 
      ? `/api/v1/swap/history/${address}`
      : '/api/v1/swap/history';
    
    return mockApi.get<{
      swaps: any[];
      pagination: { limit: number; offset: number; total: number };
    }>(endpoint, {
      params: { limit, offset, dex, status }
    });
  }

  async findOptimalRoute(request: OptimalRouteRequest) {
    return mockApi.get<OptimalRouteResponse>('/api/v1/swap/routes/optimal', {
      params: request
    });
  }

  // DEX-specific operations
  async getCloberOrderBook(pair: string) {
    return mockApi.get<OrderBook>(`/api/v1/swap/dex/clober/orderbook/${pair}`);
  }

  async getGTERealtimePrice(pair: string) {
    return mockApi.get<MarketData>(`/api/v1/swap/dex/gte/realtime-price/${pair}`);
  }

  async getPharosRWATokens() {
    return mockApi.get<{
      rwaTokens: any[];
    }>('/api/v1/swap/dex/pharos/rwa-tokens');
  }

  // Point system
  async getUserTradingStats(address?: string) {
    const endpoint = address 
      ? `/api/v1/swap/trading/points/${address}`
      : '/api/v1/swap/trading/points';
    
    return mockApi.get<UserTradingStats>(endpoint);
  }

  async getTradingLeaderboard(limit = 50, period = 'all_time') {
    return mockApi.get<{
      leaderboard: any[];
      period: string;
      lastUpdated: string;
    }>('/api/v1/swap/trading/leaderboard', {
      params: { limit, period }
    });
  }

  async getTradingAchievements(address?: string) {
    const endpoint = address 
      ? `/api/v1/swap/trading/achievements/${address}`
      : '/api/v1/swap/trading/achievements';
    
    return mockApi.get<{
      achievements: any[];
      totalAchievements: number;
      recentUnlocks: any[];
    }>(endpoint);
  }

  // Daily tasks
  async getDailyTradingTasks() {
    return mockApi.get<{
      tasks: DailyTradingTask[];
      date: string;
    }>('/api/v1/swap/trading/tasks/daily');
  }

  async getUserTaskProgress(address?: string) {
    const endpoint = address 
      ? `/api/v1/swap/trading/tasks/${address}/progress`
      : '/api/v1/swap/trading/tasks/progress';
    
    return mockApi.get<{
      progress: UserTaskProgress[];
      date: string;
      userAddress: string;
    }>(endpoint);
  }

  // Analytics
  async getTradingAnalytics(address?: string, timeframe = '30d') {
    const endpoint = address 
      ? `/api/v1/swap/trading/analytics/${address}`
      : '/api/v1/swap/trading/analytics';
    
    return mockApi.get<TradingAnalytics>(endpoint, {
      params: { timeframe }
    });
  }

  // Helper methods
  async getSupportedTokens(chainId: number) {
    const tokens = {
      1: [
        { address: '0x0000000000000000000000000000000000000000', symbol: 'ETH', name: 'Ethereum' },
        { address: '0xA0b86a33E6411679C79F7c37a8CbAd19506e5d8b', symbol: 'USDC', name: 'USD Coin' },
        { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', name: 'Tether USD' }
      ],
      6342: [
        { address: '0x0000000000000000000000000000000000000000', symbol: 'RISE', name: 'RiseChain' },
        { address: '0x1234567890123456789012345678901234567890', symbol: 'USDC', name: 'USD Coin' }
      ],
      11155931: [
        { address: '0x0000000000000000000000000000000000000000', symbol: 'METH', name: 'MegaETH' },
        { address: '0x2345678901234567890123456789012345678901', symbol: 'USDC', name: 'USD Coin' }
      ]
    };

    return tokens[chainId as keyof typeof tokens] || [];
  }

  async getSupportedDEXs() {
    return [
      { 
        id: 'clober', 
        name: 'Clober DEX', 
        chainId: 6342, 
        chain: 'RiseChain',
        type: 'CLOB',
        features: ['Market Orders', 'Limit Orders', 'Shreds Optimization']
      },
      { 
        id: 'gte', 
        name: 'GTE DEX', 
        chainId: 11155931, 
        chain: 'MegaETH',
        type: 'AMM',
        features: ['Real-time Trading', 'Sub-millisecond Execution', 'HFT Support']
      },
      { 
        id: 'pharos_dex', 
        name: 'Pharos DEX', 
        chainId: 1, 
        chain: 'Ethereum',
        type: 'AMM',
        features: ['Parallel Processing', 'RWA Tokens', 'Advanced Orders']
      }
    ];
  }

  formatAmount(amount: string, decimals = 18): string {
    const num = parseFloat(amount) / Math.pow(10, decimals);
    return num.toFixed(6);
  }

  formatFee(fee: string): string {
    const feeInEth = parseFloat(fee) / Math.pow(10, 18);
    return `${feeInEth.toFixed(6)} ETH`;
  }

  getDEXName(dex: string): string {
    const names = {
      'clober': 'Clober DEX',
      'gte': 'GTE DEX',
      'pharos_dex': 'Pharos DEX'
    };
    return names[dex as keyof typeof names] || dex;
  }

  getSwapStatusColor(status: string): string {
    const colors = {
      'pending': 'text-yellow-400',
      'confirmed': 'text-blue-400',
      'completed': 'text-green-400',
      'failed': 'text-red-400',
      'cancelled': 'text-gray-400'
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  }

  getPointsColor(points: number): string {
    if (points >= 20) return 'text-purple-400';
    if (points >= 15) return 'text-blue-400';
    if (points >= 10) return 'text-green-400';
    return 'text-gray-400';
  }

  getDEXIcon(dex: string): string {
    const icons = {
      'clober': '📊',
      'gte': '⚡',
      'pharos_dex': '🏛️'
    };
    return icons[dex as keyof typeof icons] || '🔄';
  }
}

export const swapService = new SwapService();
