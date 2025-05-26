
import { create } from 'zustand';

// Simple state interfaces
interface WalletData {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string;
}

interface ChainData {
  chainId: number;
  isActive: boolean;
  blockHeight: number;
  gasPrice: string;
  lastUpdated: number;
  latency: number;
}

interface DeploymentData {
  id: string;
  chainId: number;
  contractAddress: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash: string;
  template: string;
  timestamp: number;
  contractName: string;
  contractCode: string;
  constructorArgs: string;
  gasUsed: string;
  deploymentCost: string;
}

interface SwapData {
  id: string;
  chainId: number;
  fromToken: string;
  toToken: string;
  amount: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash: string;
  timestamp: number;
  slippage: number;
  amountOut: string;
  gasUsed: string;
  priceImpact: string;
}

interface GMData {
  id: string;
  chainId: number;
  status: 'pending' | 'confirmed' | 'failed';
  txHash: string;
  timestamp: number;
}

interface AnalyticsData {
  totalTransactions: number;
  totalGasSpent: string;
  chainsActive: number;
  streakDays: number;
  qualificationScore: number;
}

interface ChainMetricsData {
  chainId: number;
  transactions: number;
  gasSpent: string;
  successRate: number;
  lastActivity: number;
}

interface QualificationInfo {
  chainId: number;
  score: number;
  criteria: {
    transactions: boolean;
    contracts: boolean;
    dailyActivity: boolean;
    volume: boolean;
  };
}

interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// Store interface
interface AppStore {
  // Wallet
  wallet: WalletData;
  setWallet: (wallet: Partial<WalletData>) => void;
  
  // Chains - using Map instead of Record
  chainStatus: Map<string, ChainData>;
  setChainStatus: (status: Map<string, ChainData>) => void;
  
  // Activities
  deployments: DeploymentData[];
  addDeployment: (deployment: DeploymentData) => void;
  updateDeployment: (id: string, updates: Partial<DeploymentData>) => void;
  
  swaps: SwapData[];
  addSwap: (swap: SwapData) => void;
  updateSwap: (id: string, updates: Partial<SwapData>) => void;
  
  gmPosts: GMData[];
  addGMPost: (post: GMData) => void;
  updateGMPost: (id: string, updates: Partial<GMData>) => void;
  
  // Analytics
  analyticsOverview: AnalyticsData | null;
  setAnalyticsOverview: (overview: AnalyticsData) => void;
  
  chainMetrics: ChainMetricsData[];
  setChainMetrics: (metrics: ChainMetricsData[]) => void;
  
  qualificationData: QualificationInfo[];
  setQualificationData: (data: QualificationInfo[]) => void;
  
  // Notifications
  notifications: NotificationData[];
  addNotification: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotification: (id: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Wallet state
  wallet: {
    address: null,
    isConnected: false,
    chainId: null,
    balance: '0',
  },
  setWallet: (wallet) => set((state) => ({ 
    wallet: { ...state.wallet, ...wallet } 
  })),
  
  // Chain status using Map
  chainStatus: new Map(),
  setChainStatus: (status) => set({ chainStatus: status }),
  
  // Deployments
  deployments: [],
  addDeployment: (deployment) => set((state) => ({ 
    deployments: [...state.deployments, deployment] 
  })),
  updateDeployment: (id, updates) => set((state) => ({
    deployments: state.deployments.map(d => 
      d.id === id ? { ...d, ...updates } : d
    )
  })),
  
  // Swaps
  swaps: [],
  addSwap: (swap) => set((state) => ({ 
    swaps: [...state.swaps, swap] 
  })),
  updateSwap: (id, updates) => set((state) => ({
    swaps: state.swaps.map(s => 
      s.id === id ? { ...s, ...updates } : s
    )
  })),
  
  // GM Posts
  gmPosts: [],
  addGMPost: (post) => set((state) => ({ 
    gmPosts: [...state.gmPosts, post] 
  })),
  updateGMPost: (id, updates) => set((state) => ({
    gmPosts: state.gmPosts.map(g => 
      g.id === id ? { ...g, ...updates } : g
    )
  })),
  
  // Analytics
  analyticsOverview: null,
  setAnalyticsOverview: (overview) => set({ analyticsOverview: overview }),
  
  chainMetrics: [],
  setChainMetrics: (metrics) => set({ chainMetrics: metrics }),
  
  qualificationData: [],
  setQualificationData: (data) => set({ qualificationData: data }),
  
  // Notifications
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    }]
  })),
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
  })),
  clearNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
}));
