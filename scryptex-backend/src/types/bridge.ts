
import { BigNumber } from 'ethers';

// Core Bridge Types
export interface BridgeParams {
  fromChain: number;
  toChain: number;
  tokenAddress: string;
  amount: BigNumber;
  recipient: string;
  userAddress: string;
}

export interface BridgeResult {
  success: boolean;
  bridgeId: string;
  txHash?: string;
  estimatedTime?: number;
  actualFee?: BigNumber;
  error?: string;
}

export interface BridgeStatus {
  bridgeId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'failed';
  sourceChain: number;
  targetChain: number;
  sourceTransaction?: string;
  targetTransaction?: string;
  timestamp: Date;
  estimatedCompletionTime?: Date;
}

// RiseChain Specific Types
export interface RiseChainBridgeResult extends BridgeResult {
  shredsOptimization?: boolean;
  gigagasUsed?: BigNumber;
  parallelProcessing?: boolean;
}

export interface RiseChainConfig {
  rpcEndpoint: string;
  bridgeContractAddress: string;
  tokenFactoryAddress: string;
  shredsEnabled: boolean;
  parallelProcessing: boolean;
  gigagasOptimization: boolean;
  pointsPerBridge: number;
  baseBridgeFee: string;
  gasEstimateMultiplier: number;
}

export interface RiseBridgeTransfer extends BridgeParams {
  shredsOptimized?: boolean;
  priority?: 'low' | 'medium' | 'high';
}

export interface RiseBatchResult {
  batchId: string;
  totalTransfers: number;
  successfulTransfers: number;
  failedTransfers: number;
  totalFees: BigNumber;
  results: RiseChainBridgeResult[];
}

export interface RiseFeeCalculation {
  baseFee: BigNumber;
  gasFee: BigNumber;
  shredsDiscount: BigNumber;
  totalFee: BigNumber;
  estimatedTime: number;
}

// Pharos Network Specific Types
export interface PharosBridgeResult extends BridgeResult {
  complianceChecked?: boolean;
  rwaAsset?: boolean;
  parallelProcessed?: boolean;
}

export interface PharosConfig {
  rpcEndpoint: string;
  bridgeContractAddress: string;
  rwaTokenFactory: string;
  complianceContract: string;
  parallelEnabled: boolean;
  maxConcurrentBridges: number;
  pointsPerBridge: number;
  standardBridgeFee: string;
  rwaBridgeFee: string;
  complianceFee: string;
}

export interface RWABridgeParams extends BridgeParams {
  assetType: 'real_estate' | 'commodity' | 'security' | 'other';
  complianceRequired: boolean;
  regulatoryJurisdiction?: string;
}

export interface PharosBridgeTransfer extends BridgeParams {
  assetType?: 'standard' | 'rwa';
  complianceLevel?: 'basic' | 'enhanced' | 'full';
}

export interface PharosParallelResult {
  batchId: string;
  parallelProcessingEnabled: boolean;
  concurrentBridges: number;
  results: PharosBridgeResult[];
}

export interface PharosFeeCalculation {
  standardFee: BigNumber;
  rwaFee?: BigNumber;
  complianceFee?: BigNumber;
  parallelDiscount: BigNumber;
  totalFee: BigNumber;
}

// MegaETH Specific Types
export interface MegaETHBridgeResult extends BridgeResult {
  realtimeMode?: boolean;
  subMillisecondProcessing?: boolean;
  continuousValidation?: boolean;
}

export interface MegaETHConfig {
  rpcEndpoint: string;
  bridgeContractAddress: string;
  realtimeProcessorAddress: string;
  realtimeEnabled: boolean;
  subMillisecondProcessing: boolean;
  continuousValidation: boolean;
  pointsPerBridge: number;
  standardBridgeFee: string;
  realtimeBridgeFee: string;
  subMillisecondFee: string;
}

export interface MegaETHBridgeTransfer extends BridgeParams {
  realtimeMode?: boolean;
  priorityLevel?: 'standard' | 'fast' | 'instant';
}

export interface MegaETHBatchResult {
  batchId: string;
  realtimeProcessing: boolean;
  averageProcessingTime: number;
  results: MegaETHBridgeResult[];
}

export interface MegaETHFeeCalculation {
  baseFee: BigNumber;
  realtimeFee?: BigNumber;
  subMillisecondFee?: BigNumber;
  speedBonus: BigNumber;
  totalFee: BigNumber;
}

// Unified Bridge Types
export interface UnifiedBridgeResult {
  bridgeProvider: 'risechain' | 'pharos' | 'megaeth';
  bridgeResult: BridgeResult;
  pointsAwarded: number;
  route: BridgeRoute;
  optimization: RouteOptimization;
}

export interface BridgeRoute {
  provider: 'risechain' | 'pharos' | 'megaeth';
  sourceChain: number;
  targetChain: number;
  estimatedFee: BigNumber;
  estimatedTime: number;
  securityScore: number;
  pointsReward: number;
}

export interface RouteAnalysis {
  route: BridgeRoute;
  pros: string[];
  cons: string[];
  recommendationScore: number;
}

export interface RouteOptimization {
  strategy: 'fastest' | 'cheapest' | 'most_secure' | 'most_points';
  selectedRoute: BridgeRoute;
  alternativeRoutes: BridgeRoute[];
  reasonForSelection: string;
}

// Point System Types
export interface PointCalculationResult {
  basePoints: number;
  chainBonus: number;
  volumeBonus: number;
  timeBonus: number;
  dailyTaskBonus: number;
  achievementBonus: number;
  totalPoints: number;
  calculation: PointCalculationDetails;
}

export interface PointCalculationDetails {
  bridgeAmount: BigNumber;
  bridgeProvider: string;
  isFirstBridgeToday: boolean;
  consecutiveDaysBridging: number;
  totalBridgesThisWeek: number;
  volumeBracket: 'small' | 'medium' | 'large';
  specialEventBonus?: number;
}

export interface PointAwardResult {
  pointsAwarded: number;
  newTotalPoints: number;
  newRank: number;
  dailyTasksCompleted: string[];
  achievementsUnlocked: string[];
  transactionHash: string;
}

export interface TaskProgressUpdate {
  taskId: string;
  taskName: string;
  currentProgress: number;
  requiredProgress: number;
  isCompleted: boolean;
  pointsAwarded: number;
}

export interface LeaderboardUpdate {
  previousRank: number;
  newRank: number;
  pointsGained: number;
  totalPoints: number;
  percentileRank: number;
}

// Transaction Monitoring Types
export interface BridgeActivity {
  bridgeType: 'to_rise' | 'to_pharos' | 'to_megaeth' | 'from_rise' | 'from_pharos' | 'from_megaeth';
  amount: BigNumber;
  sourceChain: number;
  targetChain: number;
  timestamp: Date;
  transactionHash: string;
  userAddress: string;
}

export interface TransactionProcessingResult {
  processed: boolean;
  pointsAwarded: number;
  tasksCompleted: string[];
  error?: string;
}

export interface TransactionValidation {
  isValid: boolean;
  confirmations: number;
  requiredConfirmations: number;
  blockNumber: number;
  gasUsed: BigNumber;
  status: 'pending' | 'confirmed' | 'failed';
}

// Database Types
export interface BridgeTransaction {
  id: string;
  userAddress: string;
  sourceChainId: number;
  targetChainId: number;
  bridgeProvider: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: BigNumber;
  sourceTxHash?: string;
  targetTxHash?: string;
  bridgeId: string;
  bridgeFee: BigNumber;
  gasFee?: BigNumber;
  totalCost: BigNumber;
  bridgeStatus: string;
  initiatedAt: Date;
  completedAt?: Date;
  pointsAwarded: number;
  pointsCalculated: boolean;
  basePoints: number;
  bonusPoints: number;
  pointCalculationDetails: any;
  dailyTasksCompleted: string[];
  isFirstBridgeToday: boolean;
}

export interface UserPoints {
  id: string;
  userAddress: string;
  totalPoints: number;
  bridgePoints: number;
  bonusPoints: number;
  dailyTaskPoints: number;
  totalBridges: number;
  successfulBridges: number;
  failedBridges: number;
  totalBridgeVolume: BigNumber;
  risechainBridges: number;
  pharosBridges: number;
  megaethBridges: number;
  lastBridgeDate?: Date;
  currentDailyStreak: number;
  longestDailyStreak: number;
  bridgesToday: number;
  achievements: string[];
  achievementPoints: number;
  firstBridgeAt?: Date;
  lastActivityAt: Date;
  updatedAt: Date;
}

export interface DailyBridgeTask {
  id: string;
  taskDate: Date;
  taskId: string;
  taskName: string;
  taskDescription: string;
  taskType: string;
  requiredBridges: number;
  requiredVolume: BigNumber;
  requiredChains: number;
  specificChainId?: number;
  taskPoints: number;
  bonusMultiplier: number;
  isActive: boolean;
  createdAt: Date;
}

export interface UserDailyTaskCompletion {
  id: string;
  userAddress: string;
  taskDate: Date;
  taskId: string;
  completedAt: Date;
  completionTxHash?: string;
  pointsAwarded: number;
  currentProgress: number;
  requiredProgress: number;
  isCompleted: boolean;
}

export interface PointTransaction {
  id: string;
  userAddress: string;
  pointType: string;
  pointsAmount: number;
  description: string;
  relatedTxHash?: string;
  relatedBridgeId?: string;
  relatedTaskId?: string;
  metadata: any;
  createdAt: Date;
}

// Event Types
export interface BridgeInitiatedEvent {
  bridgeId: string;
  userAddress: string;
  sourceChain: number;
  targetChain: number;
  amount: BigNumber;
  transactionHash: string;
}

export interface BridgeCompletedEvent {
  bridgeId: string;
  userAddress: string;
  sourceChain: number;
  targetChain: number;
  sourceTxHash: string;
  targetTxHash: string;
  amount: BigNumber;
  completedAt: Date;
}

export interface BridgeFailedEvent {
  bridgeId: string;
  userAddress: string;
  reason: string;
  transactionHash?: string;
  failedAt: Date;
}

export type PointsAwarded = PointAwardResult;
export type BridgeValidation = TransactionValidation;
export type ComplianceValidation = { isCompliant: boolean; violations: string[]; riskScore: number };
export type RealtimeValidation = { isValid: boolean; processingTime: number; validatedAt: Date };
export type CrossChainBridgeStatus = BridgeStatus & { chainSyncStatus: { [chainId: number]: boolean } };
export type BridgeRecoveryResult = { recovered: boolean; newBridgeId?: string; refundTxHash?: string };
export type FeeComparison = { cheapest: BridgeRoute; mostExpensive: BridgeRoute; averageFee: BigNumber };
export type SpeedOptimization = { fastest: BridgeRoute; slowest: BridgeRoute; averageTime: number };
export type SecurityOptimization = { mostSecure: BridgeRoute; leastSecure: BridgeRoute; averageScore: number };
export type PointsOptimization = { mostPoints: BridgeRoute; leastPoints: BridgeRoute; averagePoints: number };
