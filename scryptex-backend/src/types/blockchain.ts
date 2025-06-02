
import { BigNumber } from 'ethers';

// Core blockchain types and interfaces

export type SDKType = 'ethers' | 'viem' | 'web3' | 'custom';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';
export type GasUrgency = 'slow' | 'standard' | 'fast' | 'fastest';

// Enhanced chain configuration with SDK optimizations
export interface ChainSDKConfig {
  chainId: number;
  name: string;
  displayName: string;
  rpcUrl: string;
  wsUrl?: string;
  explorerUrl: string;
  faucetUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  
  // SDK specifications
  sdkType: SDKType;
  sdkOptimizations: string[];
  
  // Performance specifications
  maxThroughput: number;
  avgBlockTime: number;
  batchingSupport: boolean;
  parallelExecution: boolean;
  
  // Chain-specific features
  features: {
    realTimeAPI?: boolean;
    shredSupport?: boolean;
    zkCompatibility?: boolean;
    aiIntegration?: boolean;
    advancedOpcodes?: string[];
    customGasModel?: boolean;
    parallelEVM?: boolean;
  };
  
  // SDK-specific optimizations
  sdkConfig: {
    connectionPooling: PoolConfig;
    caching: CacheConfig;
    retryStrategy: RetryConfig;
    batchOptimization: BatchConfig;
  };
  
  isTestnet: boolean;
  isActive: boolean;
}

export interface PoolConfig {
  maxConnections: number;
  idleTimeout: number;
  acquireTimeout: number;
}

export interface CacheConfig {
  strategy: string;
  ttl: number;
  maxSize: number;
}

export interface RetryConfig {
  maxRetries: number;
  backoffMultiplier: number;
  initialDelay: number;
}

export interface BatchConfig {
  enabled: boolean;
  maxBatchSize: number;
  batchTimeout: number;
}

// Global performance configuration
export interface GlobalPerformanceConfig {
  connectionPools: {
    maxConnections: number;
    idleTimeout: number;
    acquireTimeout: number;
  };
  caching: {
    strategy: string;
    l1Cache: string;
    l2Cache: string;
    ttl: number;
  };
  batching: {
    enabled: boolean;
    maxBatchSize: number;
    batchTimeout: number;
    intelligentBatching: boolean;
  };
  rateLimiting: {
    requestsPerSecond: number;
    burstCapacity: number;
    adaptiveRateLimiting: boolean;
  };
  monitoring: {
    metricsInterval: number;
    alertThresholds: {
      latency: number;
      errorRate: number;
      throughput: number;
    };
  };
}

// Universal transaction interface
export interface UniversalTransaction {
  chainId: number;
  type: 'deploy' | 'call' | 'transfer';
  to?: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: number;
  
  // Performance hints
  performanceHints?: {
    priority: 'low' | 'normal' | 'high' | 'urgent';
    preferredConfirmations: number;
    maxLatency: number;
  };
  
  // Chain-specific optimizations
  chainOptimizations?: {
    useBatching?: boolean;
    useParallelExecution?: boolean;
    enableRealTime?: boolean;
    useShreds?: boolean;
    enableAI?: boolean;
  };
}

// Transaction result interface
export interface TransactionResult {
  hash: string;
  status: TransactionStatus;
  blockNumber?: number;
  blockHash?: string;
  gasUsed?: string;
  effectiveGasPrice?: string;
  confirmations: number;
  timestamp: number;
  
  // Performance metrics
  metrics?: {
    latency: number;
    processingTime: number;
    confirmationTime: number;
  };
}

// Deployment result interface
export interface DeploymentResult {
  transactionHash: string;
  contractAddress?: string;
  status: TransactionStatus;
  gasUsed?: string;
  blockNumber?: number;
  
  // Deployment-specific data
  constructorArgs?: any[];
  contractCode?: string;
  verificationStatus?: 'pending' | 'verified' | 'failed';
  
  // Performance metrics
  deploymentTime: number;
  estimatedCost: string;
}

// Batch operation interface
export interface BatchOperation {
  id: string;
  chainId: number;
  operation: 'deploy' | 'call' | 'transfer';
  params: any;
  priority: number;
}

// Batch result interface
export interface BatchResult {
  operationId: string;
  success: boolean;
  result?: any;
  error?: string;
  gasUsed?: string;
  executionTime: number;
}

// Event filter interface
export interface EventFilter {
  address?: string;
  topics?: string[];
  fromBlock?: number;
  toBlock?: number;
}

// Enhanced event interface
export interface EnhancedEvent {
  chainId: number;
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  blockHash: string;
  transactionHash: string;
  transactionIndex: number;
  logIndex: number;
  timestamp: number;
  
  // Decoded data
  decoded?: {
    name: string;
    signature: string;
    args: any[];
  };
}

// Chain metrics interface
export interface ChainMetrics {
  chainId: number;
  currentTPS: number;
  avgBlockTime: number;
  gasPrice: {
    slow: string;
    standard: string;
    fast: string;
    fastest: string;
  };
  congestionLevel: number;
  healthScore: number;
  actualLatency: number;
  throughputUtilization: number;
  errorRate: number;
  
  // Chain-specific metrics
  customMetrics?: {
    iceDBPerformance?: number;
    reactiveContractUsage?: number;
    realTimeAPILatency?: number;
    preconfirmationRate?: number;
    shredProcessingTime?: number;
    parallelExecutionEfficiency?: number;
    aiComputeUtilization?: number;
    storageEfficiency?: number;
    complianceProcessingTime?: number;
    rwaTransactionVolume?: number;
  };
}

// Performance optimization interfaces
export interface PerformanceProfile {
  name: string;
  latencyTarget: number;
  throughputTarget: number;
  costOptimization: boolean;
  reliabilityTarget: number;
}

export interface DeploymentOptimizations {
  useChainSpecificFeatures: boolean;
  optimizeForPerformance: boolean;
  minimizeGasCost: boolean;
  enableRealTimeFeatures: boolean;
  useBatchDeployment: boolean;
  
  chainSpecific?: {
    enableReactiveContracts?: boolean;
    useCustomOpcodes?: boolean;
    enableRealTimeAPI?: boolean;
    usePreconfirmations?: boolean;
    enableParallelExecution?: boolean;
    useShredTechnology?: boolean;
    integrateAICapabilities?: boolean;
    useAdvancedStorage?: boolean;
    enableRWACompliance?: boolean;
    useEnterpriseFeatures?: boolean;
  };
}

// Cross-chain operation interfaces
export interface CrossChainOperation {
  id: string;
  sourceChain: number;
  targetChain: number;
  operation: 'transfer' | 'deploy' | 'call';
  params: any;
  bridgeMethod?: string;
}

export interface CrossChainResult {
  operationId: string;
  sourceResult: TransactionResult;
  targetResult?: TransactionResult;
  bridgeResult?: TransactionResult;
  totalTime: number;
  status: 'pending' | 'completed' | 'failed';
}

// Chain selection interfaces
export interface OperationRequirements {
  latency: number;
  throughput: number;
  cost: 'low' | 'medium' | 'high';
  features: string[];
  compliance?: boolean;
}

export interface ChainRecommendation {
  chainId: number;
  confidence: number;
  reasoning: string[];
  alternativeChains: number[];
  
  performanceMetrics: {
    expectedLatency: number;
    estimatedCost: string;
    throughputCapability: number;
    confirmationTime: number;
  };
  
  optimizations: {
    enabledFeatures: string[];
    recommendedSettings: any;
    performanceTuning: any;
  };
}

// Provider interfaces
export interface OptimizedProvider {
  chainId: number;
  isConnected: boolean;
  
  // Enhanced capabilities
  batchCall(calls: any[]): Promise<any[]>;
  streamEvents(filters: EventFilter[]): AsyncIterator<EnhancedEvent>;
  getOptimalGasPrice(urgency: GasUrgency): Promise<string>;
  
  // Chain-specific features
  enableRealTimeFeatures?(): Promise<void>;
  enableShredSupport?(): Promise<void>;
  enableZKFeatures?(): Promise<void>;
  enableAIIntegration?(): Promise<void>;
  enableCustomOpcodes?(): Promise<void>;
  enableRWACompliance?(): Promise<void>;
  
  // Standard provider methods
  getBalance(address: string): Promise<string>;
  getTransactionCount(address: string): Promise<number>;
  sendTransaction(transaction: any): Promise<string>;
  getTransactionReceipt(hash: string): Promise<any>;
  estimateGas(transaction: any): Promise<string>;
  getBlockNumber(): Promise<number>;
}

// Contract template interface
export interface ContractTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  solidityCode: string;
  abi: any[];
  bytecode: string;
  constructorParams?: {
    name: string;
    type: string;
    description: string;
  }[];
  
  // Chain compatibility
  supportedChains: number[];
  chainSpecificOptimizations?: {
    [chainId: number]: {
      gasOptimizations?: string[];
      featureUsage?: string[];
      performanceHints?: string[];
    };
  };
}

// Gas estimation interface
export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  estimatedCost: string;
  confidence: number;
}
