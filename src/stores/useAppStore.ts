
import { create } from 'zustand';
import { 
  WalletState, 
  ChainStatus, 
  DeploymentStatus, 
  SwapTransaction, 
  GMPost, 
  AnalyticsOverview, 
  ChainMetrics, 
  QualificationData, 
  Notification 
} from '@/types';

interface AppState {
  // Wallet State
  wallet: WalletState;
  setWallet: (wallet: Partial<WalletState>) => void;
  
  // Chains State
  selectedChains: string[];
  chainStatus: Record<string, ChainStatus>;
  gasPrice: Record<string, string>;
  setSelectedChains: (chains: string[]) => void;
  setChainStatus: (status: Record<string, ChainStatus>) => void;
  setGasPrice: (chainId: string, price: string) => void;
  
  // Activities State
  deployments: DeploymentStatus[];
  swaps: SwapTransaction[];
  gmPosts: GMPost[];
  setDeployments: (deployments: DeploymentStatus[]) => void;
  setSwaps: (swaps: SwapTransaction[]) => void;
  setGMPosts: (posts: GMPost[]) => void;
  addDeployment: (deployment: DeploymentStatus) => void;
  addSwap: (swap: SwapTransaction) => void;
  addGMPost: (post: GMPost) => void;
  
  // Analytics State
  analyticsOverview: AnalyticsOverview | null;
  chainMetrics: ChainMetrics[];
  qualificationData: QualificationData[];
  setAnalyticsOverview: (overview: AnalyticsOverview) => void;
  setChainMetrics: (metrics: ChainMetrics[]) => void;
  setQualificationData: (data: QualificationData[]) => void;
  
  // UI State
  isLoading: boolean;
  activeModal: string | null;
  notifications: Notification[];
  setIsLoading: (loading: boolean) => void;
  setActiveModal: (modal: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial Wallet State
  wallet: {
    address: null,
    isConnected: false,
    chainId: null,
    balance: undefined,
  },
  setWallet: (walletUpdate) => 
    set((state) => ({
      wallet: { ...state.wallet, ...walletUpdate }
    })),

  // Initial Chains State
  selectedChains: [],
  chainStatus: {},
  gasPrice: {},
  setSelectedChains: (chains) => set({ selectedChains: chains }),
  setChainStatus: (status) => set({ chainStatus: status }),
  setGasPrice: (chainId, price) => 
    set((state) => ({
      gasPrice: { ...state.gasPrice, [chainId]: price }
    })),

  // Initial Activities State
  deployments: [],
  swaps: [],
  gmPosts: [],
  setDeployments: (deployments) => set({ deployments }),
  setSwaps: (swaps) => set({ swaps }),
  setGMPosts: (posts) => set({ gmPosts: posts }),
  addDeployment: (deployment) => 
    set((state) => ({
      deployments: [...state.deployments, deployment]
    })),
  addSwap: (swap) => 
    set((state) => ({
      swaps: [...state.swaps, swap]
    })),
  addGMPost: (post) => 
    set((state) => ({
      gmPosts: [...state.gmPosts, post]
    })),

  // Initial Analytics State
  analyticsOverview: null,
  chainMetrics: [],
  qualificationData: [],
  setAnalyticsOverview: (overview) => set({ analyticsOverview: overview }),
  setChainMetrics: (metrics) => set({ chainMetrics: metrics }),
  setQualificationData: (data) => set({ qualificationData: data }),

  // Initial UI State
  isLoading: false,
  activeModal: null,
  notifications: [],
  setIsLoading: (loading) => set({ isLoading: loading }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    set((state) => ({
      notifications: [...state.notifications, { 
        ...notification, 
        id, 
        timestamp, 
        read: false 
      }]
    }));
  },
  removeNotification: (id) => 
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),
  markNotificationAsRead: (id) => 
    set((state) => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    })),
}));
