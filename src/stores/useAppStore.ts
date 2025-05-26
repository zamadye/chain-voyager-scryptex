
import { create } from 'zustand';
import { ChainStatus, WalletState, DeploymentStatus, SwapTransaction, GMPost, AnalyticsOverview, ChainMetrics, QualificationData, Notification } from '@/types';

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
