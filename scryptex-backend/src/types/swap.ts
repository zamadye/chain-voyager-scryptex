
import { BigNumber } from 'ethers';

// Core swap enums
export enum SwapType {
  STANDARD = 'standard',
  REALTIME = 'realtime',
  RWA = 'rwa',
  HFT = 'hft',
  ARBITRAGE = 'arbitrage'
}

export enum SwapStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum DEXName {
  CLOBER = 'clober',
  GTE = 'gte',
  PHAROS_DEX = 'pharos_dex'
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  TWAP = 'twap',
  ICEBERG = 'iceberg',
  STOP_LOSS = 'stop_loss'
}

// Core swap interfaces
export interface SwapTransaction {
  id: string;
  userAddress: string;
  chainId: number;
  dexName: DEXName;
  dexAddress: string;
  
  // Token information
  tokenIn: string;
  tokenOut: string;
  tokenInSymbol: string;
  tokenOutSymbol: string;
  
  // Swap amounts
  amountIn: BigNumber;
  amountOut: BigNumber;
  minAmountOut: BigNumber;
  
  // Execution details
  swapType: SwapType;
  executionPrice?: BigNumber;
  priceImpact: number;
  slippage: number;
  
  // Transaction details
  txHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  gasPrice?: BigNumber;
  
  // Fees
  tradingFee: BigNumber;
  platformFee: BigNumber;
  gasFee?: BigNumber;
  totalCost: BigNumber;
  
  // Status and timing
  swapStatus: SwapStatus;
  initiatedAt: Date;
  executedAt?: Date;
  
  // Point system
  pointsAwarded: number;
  pointsCalculated: boolean;
  basePoints: number;
  bonusPoints: number;
  pointCalculationDetails: any;
  
  // Daily tasks
  dailyTasksCompleted: string[];
  isFirstSwapToday: boolean;
  userDailySwapCount: number;
}

export interface UserTradingStats {
  id: string;
  userAddress: string;
  
  // Point balances
  totalTradingPoints: number;
  swapPoints: number;
  bonusPoints: number;
  achievementPoints: number;
  
  // Trading statistics
  totalSwaps: number;
  successfulSwaps: number;
  failedSwaps: number;
  totalTradingVolumeUsd: BigNumber;
  
  // DEX statistics
  cloberSwaps: number;
  gteSwaps: number;
  pharosDexSwaps: number;
  
  // Performance metrics
  averagePriceImpact: number;
  averageSlippage: number;
  profitableTrades: number;
  
  // Activity tracking
  lastSwapDate?: Date;
  currentTradingStreak: number;
  longestTradingStreak: number;
  swapsToday: number;
  
  // Progression
  tradingLevel: number;
  tradingExperience: number;
  achievements: string[];
  
  // Timestamps
  firstSwapAt?: Date;
  lastActivityAt: Date;
}

// DEX-specific interfaces
export interface CloberSwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: BigNumber;
  amountOutMin: BigNumber;
  recipient: string;
  userAddress: string;
  deadline: number;
  market?: string;
  orderType?: OrderType;
}

export interface GTESwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: BigNumber;
  amountOutMin: BigNumber;
  recipient: string;
  userAddress: string;
  realtimeMode?: boolean;
  hftMode?: boolean;
}

export interface PharosSwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: BigNumber;
  amountOutMin: BigNumber;
  recipient: string;
  userAddress: string;
  parallelMode?: boolean;
  complianceCheck?: boolean;
  rwaToken?: boolean;
}

// Swap result interfaces
export interface SwapResult {
  success: boolean;
  txHash?: string;
  amountOut?: BigNumber;
  actualPriceImpact?: number;
  actualSlippage?: number;
  gasUsed?: number;
  tradingFee?: BigNumber;
  error?: string;
}

export interface SwapQuote {
  dex: DEXName;
  tokenIn: string;
  tokenOut: string;
  amountIn: BigNumber;
  amountOut: BigNumber;
  priceImpact: number;
  tradingFee: BigNumber;
  platformFee: BigNumber;
  gasEstimate: number;
  route: SwapRoute[];
  validUntil: number;
}

export interface SwapRoute {
  dex: string;
  pair: string;
  amountIn: BigNumber;
  amountOut: BigNumber;
  fee: number;
}

// Point system interfaces
export interface PointCalculationResult {
  basePoints: number;
  dexBonus: number;
  volumeBonus: number;
  frequencyBonus: number;
  specialBonus: number;
  totalPoints: number;
  bonusBreakdown: {
    [key: string]: number;
  };
}

export interface PointAwardResult {
  pointsAwarded: number;
  newTotalPoints: number;
  achievementsUnlocked: string[];
  levelUp?: boolean;
  newLevel?: number;
}

// Daily task interfaces
export interface DailyTradingTask {
  id: string;
  taskDate: Date;
  taskId: string;
  taskName: string;
  taskDescription: string;
  taskType: string;
  requiredSwaps?: number;
  requiredVolumeUsd?: BigNumber;
  requiredDexs?: number;
  requiredTokens?: number;
  specificDex?: string;
  specificTokenPair?: string;
  taskPoints: number;
  bonusMultiplier: number;
  isActive: boolean;
}

export interface UserTaskProgress {
  taskId: string;
  taskName: string;
  currentProgress: number;
  currentVolumeUsd: BigNumber;
  requiredProgress: number;
  isCompleted: boolean;
  pointsAwarded: number;
  dexsUsed: string[];
  tokensUsed: string[];
}

// Achievement interfaces
export interface TradingAchievement {
  id: string;
  achievementId: string;
  achievementName: string;
  achievementDescription: string;
  achievementCategory: string;
  requirementType: string;
  requirementValue: BigNumber;
  requirementCondition?: string;
  achievementPoints: number;
  badgeIcon?: string;
  isActive: boolean;
}

// Analytics interfaces
export interface TradingAnalytics {
  totalSwaps: number;
  totalVolumeUsd: BigNumber;
  averageSwapSizeUsd: BigNumber;
  favoriteTokens: { symbol: string; count: number; volume: BigNumber }[];
  favoriteDEXs: { dex: string; count: number; volume: BigNumber }[];
  profitLoss: BigNumber;
  bestPerformingSwap: SwapTransaction;
  dailyActivity: { date: string; swaps: number; volume: BigNumber }[];
  pointsEarned: number;
  achievementsCount: number;
}

// API request/response types
export interface SwapQuoteRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  chainId: number;
  dex?: DEXName;
  swapType?: SwapType;
  slippageTolerance?: number;
}

export interface SwapExecuteRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  minAmountOut: string;
  chainId: number;
  dex: DEXName;
  swapType?: SwapType;
  recipient?: string;
  deadline?: number;
  slippageTolerance: number;
}

export interface OptimalRouteRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  preferredDEX?: DEXName;
  optimization?: 'price' | 'gas' | 'time' | 'points';
}

export interface OptimalRouteResponse {
  recommendedDEX: DEXName;
  recommendedChain: number;
  estimatedAmountOut: BigNumber;
  estimatedFee: BigNumber;
  estimatedGas: number;
  pointsToAward: number;
  priceImpact: number;
  reasonForRecommendation: string;
  alternativeRoutes: SwapQuote[];
}

// Market data interfaces
export interface MarketData {
  pair: string;
  price: BigNumber;
  priceChange24h: number;
  volume24h: BigNumber;
  liquidity: BigNumber;
  high24h: BigNumber;
  low24h: BigNumber;
}

export interface OrderBook {
  pair: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: BigNumber;
  lastUpdate: number;
}

export interface OrderBookLevel {
  price: BigNumber;
  amount: BigNumber;
  total: BigNumber;
}

// Configuration interfaces
export interface DEXConfig {
  rpcEndpoint: string;
  routerAddress: string;
  factoryAddress?: string;
  quoterAddress?: string;
  privateKey: string;
  pointsPerSwap: number;
  tradingFeePercentage: string;
  platformFeePercentage: string;
  gasEstimateMultiplier: number;
}

export interface SwapEnvironmentConfig {
  // Clober DEX Configuration (RiseChain)
  CLOBER_RPC_URL: string;
  CLOBER_BOOK_MANAGER_ADDRESS: string;
  CLOBER_ROUTER_ADDRESS: string;
  CLOBER_QUOTER_ADDRESS: string;
  CLOBER_PRIVATE_KEY: string;
  
  // GTE DEX Configuration (MegaETH)
  GTE_RPC_URL: string;
  GTE_ROUTER_ADDRESS: string;
  GTE_FACTORY_ADDRESS: string;
  GTE_REALTIME_PROCESSOR: string;
  GTE_PRIVATE_KEY: string;
  
  // Pharos DEX Configuration
  PHAROS_DEX_RPC_URL: string;
  PHAROS_DEX_ROUTER_ADDRESS: string;
  PHAROS_DEX_FACTORY_ADDRESS: string;
  PHAROS_RWA_COMPLIANCE_ADDRESS: string;
  PHAROS_DEX_PRIVATE_KEY: string;
  
  // External services
  PRICE_FEED_API_KEY: string;
  DEX_AGGREGATOR_API_KEY: string;
  TRADING_WEBHOOK_URL: string;
}
