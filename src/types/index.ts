
// Basic primitive types
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

// Currency interface
export interface NativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

// Chain configuration
export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  faucetUrl: string;
  nativeCurrency: NativeCurrency;
  testnet: boolean;
}

// Chain status
export interface ChainStatus {
  chainId: number;
  isActive: boolean;
  blockHeight: number;
  gasPrice: string;
  lastUpdated: number;
  latency: number;
}

// Wallet state
export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string;
}

// Deployment status
export interface DeploymentStatus {
  id: string;
  chainId: number;
  contractAddress: string;
  status: TransactionStatus;
  txHash: string;
  template: string;
  timestamp: number;
  contractName: string;
  contractCode: string;
  constructorArgs: string;
  gasUsed: string;
  deploymentCost: string;
}

// Swap transaction
export interface SwapTransaction {
  id: string;
  chainId: number;
  fromToken: string;
  toToken: string;
  amount: string;
  status: TransactionStatus;
  txHash: string;
  timestamp: number;
  slippage: number;
  amountOut: string;
  gasUsed: string;
  priceImpact: string;
}

// GM post
export interface GMPost {
  id: string;
  chainId: number;
  status: TransactionStatus;
  txHash: string;
  timestamp: number;
}

// Analytics overview
export interface AnalyticsOverview {
  totalTransactions: number;
  totalGasSpent: string;
  chainsActive: number;
  streakDays: number;
  qualificationScore: number;
}

// Chain metrics
export interface ChainMetrics {
  chainId: number;
  transactions: number;
  gasSpent: string;
  successRate: number;
  lastActivity: number;
}

// Qualification criteria
export interface QualificationCriteria {
  transactions: boolean;
  contracts: boolean;
  dailyActivity: boolean;
  volume: boolean;
}

// Qualification data
export interface QualificationData {
  chainId: number;
  score: number;
  criteria: QualificationCriteria;
}

// Notification
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// Simple API response without generics
export interface APIResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}
