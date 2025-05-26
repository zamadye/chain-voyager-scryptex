
import { create } from 'zustand';

// Define simple, explicit types for the store
type WalletState = {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string;
};

type ChainStatus = {
  chainId: number;
  isActive: boolean;
  blockHeight: number;
  gasPrice: string;
  lastUpdated: number;
  latency: number;
};

type DeploymentStatus = {
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
};

type SwapTransaction = {
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
};

type GMPost = {
  id: string;
  chainId: number;
  status: 'pending' | 'confirmed' | 'failed';
  txHash: string;
  timestamp: number;
};

type AnalyticsOverview = {
  totalTransactions: number;
  totalGasSpent: string;
  chainsActive: number;
  streakDays: number;
  qualificationScore: number;
};

type ChainMetrics = {
  chainId: number;
  transactions: number;
  gasSpent: string;
  successRate: number;
  lastActivity: number;
};

type QualificationData = {
  chainId: number;
  score: number;
  criteria: {
    transactions: boolean;
    contracts: boolean;
    dailyActivity: boolean;
    volume: boolean;
  };
};

type Notification = {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
};

interface AppState {
  // Wallet State
  wallet: WalletState;
  setWallet: (wallet: Partial<WalletState>) => void;
  
  // Chains State
  chainStatus: Record<string, ChainStatus>;
  setChainStatus: (status: Record<string, ChainStatus>) => void;
  
  // Activities State
  deployments: DeploymentStatus[];
  addDeployment: (deployment: DeploymentStatus) => void;
  updateDeployment: (id: string, updates: Partial<DeploymentStatus>) => void;
  
  swaps: SwapTransaction[];
  addSwap: (swap: SwapTransaction) => void;
  updateSwap: (id: string, updates: Partial<SwapTransaction>) => void;
  
  gmPosts: GMPost[];
  addGMPost: (post: GMPost) => void;
  updateGMPost: (id: string, updates: Partial<GMPost>) => void;
  
  // Analytics State
  analyticsOverview: AnalyticsOverview | null;
  setAnalyticsOverview: (overview: AnalyticsOverview) => void;
  
  chainMetrics: ChainMetrics[];
  setChainMetrics: (metrics: ChainMetrics[]) => void;
  
  qualificationData: QualificationData[];
  setQualificationData: (data: QualificationData[]) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotification: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial wallet state
  wallet: {
    address: null,
    isConnected: false,
    chainId: null,
    balance: '0',
  },
  setWallet: (wallet) => set((state) => ({ 
    wallet: { ...state.wallet, ...wallet } 
  })),
  
  // Initial chain status
  chainStatus: {},
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
