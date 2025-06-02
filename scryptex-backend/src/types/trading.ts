
import { BigNumber } from 'ethers';

// Core trading enums
export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP_LOSS = 'stop_loss',
  STOP_LIMIT = 'stop_limit',
  TRAILING_STOP = 'trailing_stop',
  ICEBERG = 'iceberg',
  TWA = 'time_weighted_average',
  ALGORITHMIC = 'algorithmic',
  CONDITIONAL = 'conditional',
  CROSS_CHAIN = 'cross_chain'
}

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell'
}

export enum OrderStatus {
  PENDING = 'pending',
  OPEN = 'open',
  PARTIAL = 'partial',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum TimeInForce {
  GTC = 'good_till_cancelled',
  IOC = 'immediate_or_cancel',
  FOK = 'fill_or_kill',
  GTD = 'good_till_date',
  AON = 'all_or_none'
}

export enum ProtectionLevel {
  BASIC = 'basic',
  ENHANCED = 'enhanced',
  MAXIMUM = 'maximum',
  INSTITUTIONAL = 'institutional'
}

export enum MEVAttackType {
  SANDWICH = 'sandwich',
  FRONTRUN = 'frontrun',
  BACKRUN = 'backrun',
  ARBITRAGE = 'arbitrage',
  LIQUIDATION = 'liquidation',
  FLASHLOAN = 'flashloan'
}

export enum StrategyType {
  DCA = 'dollar_cost_averaging',
  GRID = 'grid_trading',
  ARBITRAGE = 'arbitrage',
  MARKET_MAKING = 'market_making',
  MOMENTUM = 'momentum',
  MEAN_REVERSION = 'mean_reversion',
  CUSTOM = 'custom'
}

// Core trading interfaces
export interface Token {
  id: string;
  contractAddress: string;
  chainId: number;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  coingeckoId?: string;
  isVerified: boolean;
  isStable: boolean;
  totalSupply?: BigNumber;
}

export interface TradingPair {
  id: string;
  baseTokenId: string;
  quoteTokenId: string;
  chainId: number;
  dexAddress?: string;
  dexName: string;
  dexVersion: string;
  feeTier: number;
  tickSpacing?: number;
  priceOracle?: string;
  minTradeSize: BigNumber;
  maxTradeSize?: BigNumber;
  status: string;
  baseToken?: Token;
  quoteToken?: Token;
}

export interface TradingOrder {
  id: string;
  userId: string;
  pairId: string;
  orderType: OrderType;
  side: OrderSide;
  quantity: BigNumber;
  price?: BigNumber;
  filledQuantity: BigNumber;
  averagePrice?: BigNumber;
  status: OrderStatus;
  timeInForce: TimeInForce;
  
  // Advanced parameters
  stopPrice?: BigNumber;
  trailingAmount?: BigNumber;
  triggerCondition?: any;
  executionInstructions?: any;
  
  // MEV protection
  mevProtectionLevel: ProtectionLevel;
  privateMempool: boolean;
  fairOrdering: boolean;
  maxSlippage: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  filledAt?: Date;
  
  // Blockchain data
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  gasPrice?: BigNumber;
  
  // Relations
  pair?: TradingPair;
  executions?: TradeExecution[];
}

export interface TradeExecution {
  id: string;
  orderId: string;
  pairId: string;
  side: OrderSide;
  quantity: BigNumber;
  price: BigNumber;
  fee: BigNumber;
  feeTokenId?: string;
  executionType: string;
  liquidityType?: string;
  dexName: string;
  routePath?: any;
  
  // MEV data
  mevDetected: boolean;
  mevType?: MEVAttackType;
  protectionUsed?: string;
  
  // Blockchain data
  transactionHash: string;
  blockNumber: number;
  transactionIndex?: number;
  logIndex?: number;
  gasUsed?: number;
  
  // Timing
  executedAt: Date;
  confirmationTime?: number;
}

export interface LiquidityPool {
  id: string;
  pairId: string;
  poolAddress: string;
  dexName: string;
  poolType: string;
  fee: number;
  tickLower?: number;
  tickUpper?: number;
  sqrtPriceX96?: BigNumber;
  reserve0: BigNumber;
  reserve1: BigNumber;
  totalLiquidity: BigNumber;
  volume24h: BigNumber;
  fees24h: BigNumber;
  apy?: number;
  isActive: boolean;
  lastUpdated: Date;
}

export interface UserPortfolio {
  id: string;
  userId: string;
  chainId: number;
  totalValueUsd: BigNumber;
  unrealizedPnL: BigNumber;
  realizedPnL: BigNumber;
  totalFeesPaid: BigNumber;
  var95?: BigNumber;
  sharpeRatio?: number;
  maxDrawdown?: number;
  lastCalculated: Date;
  positions?: TradingPosition[];
}

export interface TradingPosition {
  id: string;
  userId: string;
  tokenId: string;
  chainId: number;
  quantity: BigNumber;
  averageCost: BigNumber;
  currentPrice?: BigNumber;
  unrealizedPnL?: BigNumber;
  stopLossPrice?: BigNumber;
  takeProfitPrice?: BigNumber;
  positionSizeLimit?: BigNumber;
  openedAt: Date;
  lastUpdated: Date;
  token?: Token;
}

export interface PriceFeed {
  id: string;
  tokenId: string;
  priceUsd: BigNumber;
  priceSource: string;
  confidence: number;
  volume24h?: BigNumber;
  marketCap?: BigNumber;
  timestamp: Date;
}

export interface TradingAlgorithm {
  id: string;
  userId: string;
  name: string;
  strategyType: StrategyType;
  parameters: any;
  riskLimits: any;
  status: string;
  totalTrades: number;
  winningTrades: number;
  totalPnL: BigNumber;
  maxDrawdown: number;
  sharpeRatio?: number;
  preferredChains: number[];
  crossChainEnabled: boolean;
  maxPositionSize?: BigNumber;
  createdAt: Date;
  updatedAt: Date;
  lastExecuted?: Date;
}

export interface ArbitrageOpportunity {
  id: string;
  tokenPair: string;
  sourceChain: number;
  targetChain: number;
  sourceDex: string;
  targetDex: string;
  priceDifference: number;
  potentialProfit: BigNumber;
  status: string;
  expiresAt?: Date;
  createdAt: Date;
}

export interface BridgeTransaction {
  id: string;
  userId: string;
  sourceChain: number;
  targetChain: number;
  tokenId: string;
  amount: BigNumber;
  sourceTxHash?: string;
  targetTxHash?: string;
  bridgeProtocol: string;
  fees?: BigNumber;
  estimatedTime?: number;
  actualTime?: number;
  status: string;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Trading API request/response types
export interface PlaceOrderRequest {
  pairId: string;
  orderType: OrderType;
  side: OrderSide;
  quantity: string;
  price?: string;
  timeInForce?: TimeInForce;
  stopPrice?: string;
  trailingAmount?: string;
  mevProtectionLevel?: ProtectionLevel;
  maxSlippage?: number;
  expiresAt?: Date;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
  estimatedGas?: number;
  estimatedTime?: number;
}

export interface SwapRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  minAmountOut: string;
  slippage: number;
  chainId: number;
  dexPreference?: string;
  mevProtection?: boolean;
}

export interface SwapQuote {
  amountOut: string;
  priceImpact: number;
  fee: string;
  route: SwapRoute[];
  estimatedGas: number;
  estimatedTime: number;
}

export interface SwapRoute {
  dex: string;
  path: string[];
  fee: number;
  amountIn: string;
  amountOut: string;
}

export interface CrossChainSwapRequest {
  sourceChain: number;
  targetChain: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  minAmountOut: string;
  slippage: number;
  bridgeProtocol?: string;
}

export interface PortfolioMetrics {
  totalValue: BigNumber;
  unrealizedPnL: BigNumber;
  realizedPnL: BigNumber;
  totalReturn: number;
  sharpeRatio: number;
  sortinoratio: number;
  maxDrawdown: number;
  volatility: number;
  beta: number;
  var95: BigNumber;
  winRate: number;
  averageWin: BigNumber;
  averageLoss: BigNumber;
  profitFactor: number;
  totalTrades: number;
  avgTradeSize: BigNumber;
  avgHoldingPeriod: number;
  turnoverRate: number;
  chainAllocation: { [chainId: number]: number };
  crossChainTrades: number;
  crossChainPnL: BigNumber;
}

export interface MEVDetectionResult {
  isMEV: boolean;
  attackType?: MEVAttackType;
  confidence: number;
  potentialLoss: BigNumber;
  recommendedAction: string;
  protectionStrategies: string[];
}

export interface OrderBookLevel {
  price: BigNumber;
  quantity: BigNumber;
  orderCount: number;
  chainDistribution?: { [chainId: number]: BigNumber };
}

export interface OrderBook {
  symbol: string;
  timestamp: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  spread: BigNumber;
  midPrice: BigNumber;
  totalBidVolume: BigNumber;
  totalAskVolume: BigNumber;
}

export interface MarketStats {
  symbol: string;
  price: BigNumber;
  priceChange24h: number;
  volume24h: BigNumber;
  high24h: BigNumber;
  low24h: BigNumber;
  marketCap?: BigNumber;
  circulatingSupply?: BigNumber;
}

// Algorithm and AI types
export interface AlgorithmConfig {
  name: string;
  strategyType: StrategyType;
  parameters: StrategyParameters;
  riskLimits: RiskLimits;
  execution: ExecutionConfig;
  preferredChains: number[];
  crossChainEnabled: boolean;
  targetReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

export interface StrategyParameters {
  [key: string]: any;
}

export interface RiskLimits {
  maxPositionSize: BigNumber;
  maxDailyLoss: BigNumber;
  maxOrderSize: BigNumber;
  stopLossPercentage: number;
  maxSlippage: number;
}

export interface ExecutionConfig {
  frequency: string;
  batchSize: number;
  maxLatency: number;
  preferredDexes: string[];
  mevProtection: boolean;
}

export interface TradingSignal {
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  targetPrice: BigNumber;
  reasoning: string;
  timeframe: string;
  risk: 'low' | 'medium' | 'high';
}

export interface PricePrediction {
  symbol: string;
  currentPrice: BigNumber;
  predictedPrice: BigNumber;
  confidence: number;
  timeframe: string;
  factors: string[];
}
