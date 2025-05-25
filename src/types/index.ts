
export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  faucetUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  testnet: boolean;
}

export interface ChainStatus {
  chainId: number;
  isActive: boolean;
  blockHeight?: number;
  gasPrice?: string;
  lastUpdated: number;
  latency?: number;
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance?: string;
}

export interface DeploymentStatus {
  id: string;
  chainId: number;
  contractAddress?: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  template: string;
  timestamp: number;
  contractName?: string;
  contractCode?: string;
  constructorArgs?: string;
  gasUsed?: string;
  deploymentCost?: string;
}

export interface SwapTransaction {
  id: string;
  chainId: number;
  fromToken: string;
  toToken: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  timestamp: number;
  slippage?: number;
  amountOut?: string;
  gasUsed?: string;
  priceImpact?: string;
}

export interface GMPost {
  id: string;
  chainId: number;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  timestamp: number;
}

export interface AnalyticsOverview {
  totalTransactions: number;
  totalGasSpent: string;
  chainsActive: number;
  streakDays: number;
  qualificationScore: number;
}

export interface ChainMetrics {
  chainId: number;
  transactions: number;
  gasSpent: string;
  successRate: number;
  lastActivity: number;
}

export interface QualificationData {
  chainId: number;
  score: number;
  criteria: {
    transactions: boolean;
    contracts: boolean;
    dailyActivity: boolean;
    volume: boolean;
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
