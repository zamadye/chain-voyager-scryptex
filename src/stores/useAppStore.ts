
import { create } from 'zustand';

// Simplified state interfaces to avoid circular references
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

// New interfaces for points and referral system
interface UserPointsData {
  totalPoints: number;
  currentStreak: number;
  rank: number | null;
  gmToday: boolean;
  swapsToday: number;
  bridgesToday: number;
  tokensCreatedToday: number;
  recentActivity: {
    description: string;
    points: number;
    timestamp: string;
  }[];
}

interface ReferralStatsData {
  totalReferrals: number;
  activeReferrals: number;
  earnedFromReferrals: number;
  recentReferrals: {
    username: string;
    joinedDate: string;
    status: 'active' | 'pending';
    pointsEarned: number;
  }[];
}

interface DailyTaskData {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  completed: boolean;
  resetTime: number;
}

// Store interface - simplified to avoid complex type inference
interface AppStore {
  // Wallet
  wallet: WalletData;
  setWallet: (wallet: Partial<WalletData>) => void;
  
  // Chains - using Record instead of Map to avoid type issues
  chainStatus: Record<string, ChainData>;
  setChainStatus: (status: Record<string, ChainData>) => void;
  
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

  // Points System
  userPoints: UserPointsData | null;
  setUserPoints: (points: UserPointsData) => void;
  addPoints: (points: number, description: string) => void;
  
  // Daily Tasks
  dailyTasks: DailyTaskData[];
  setDailyTasks: (tasks: DailyTaskData[]) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  completeTask: (taskId: string) => void;
  
  // Referral System
  referralStats: ReferralStatsData | null;
  setReferralStats: (stats: ReferralStatsData) => void;
  addReferral: (referral: ReferralStatsData['recentReferrals'][0]) => void;
  
  // Task Actions
  recordSwap: () => void;
  recordBridge: () => void;
  recordTokenCreation: () => void;
  recordGM: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
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
  
  // Chain status using Record instead of Map
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

  // Points System
  userPoints: {
    totalPoints: 120,
    currentStreak: 3,
    rank: 42,
    gmToday: false,
    swapsToday: 1,
    bridgesToday: 0,
    tokensCreatedToday: 0,
    recentActivity: [
      { description: "Token swap completed", points: 10, timestamp: "2 hours ago" },
      { description: "Daily GM posted", points: 10, timestamp: "1 day ago" },
      { description: "Referral bonus", points: 50, timestamp: "2 days ago" }
    ]
  },
  setUserPoints: (points) => set({ userPoints: points }),
  addPoints: (points, description) => set((state) => {
    if (!state.userPoints) return state;
    return {
      userPoints: {
        ...state.userPoints,
        totalPoints: state.userPoints.totalPoints + points,
        recentActivity: [
          { description, points, timestamp: "Just now" },
          ...state.userPoints.recentActivity.slice(0, 9)
        ]
      }
    };
  }),

  // Daily Tasks
  dailyTasks: [],
  setDailyTasks: (tasks) => set({ dailyTasks: tasks }),
  updateTaskProgress: (taskId, progress) => set((state) => ({
    dailyTasks: state.dailyTasks.map(task =>
      task.id === taskId ? { ...task, progress } : task
    )
  })),
  completeTask: (taskId) => set((state) => ({
    dailyTasks: state.dailyTasks.map(task =>
      task.id === taskId ? { ...task, completed: true } : task
    )
  })),

  // Referral System
  referralStats: {
    totalReferrals: 3,
    activeReferrals: 2,
    earnedFromReferrals: 150,
    recentReferrals: [
      { username: "alice123", joinedDate: "2024-01-15", status: "active", pointsEarned: 75 },
      { username: "bob456", joinedDate: "2024-01-10", status: "active", pointsEarned: 50 },
      { username: "charlie789", joinedDate: "2024-01-05", status: "pending", pointsEarned: 25 }
    ]
  },
  setReferralStats: (stats) => set({ referralStats: stats }),
  addReferral: (referral) => set((state) => ({
    referralStats: state.referralStats ? {
      ...state.referralStats,
      totalReferrals: state.referralStats.totalReferrals + 1,
      recentReferrals: [referral, ...state.referralStats.recentReferrals]
    } : null
  })),

  // Task Actions
  recordSwap: () => {
    const state = get();
    if (!state.userPoints) return;
    
    const newSwapsToday = state.userPoints.swapsToday + 1;
    set({
      userPoints: {
        ...state.userPoints,
        swapsToday: newSwapsToday
      }
    });

    // Check if completed 3 swaps task
    if (newSwapsToday === 3) {
      get().addPoints(30, "Completed 3 swaps daily task");
      get().addNotification({
        type: 'success',
        title: 'Task Completed!',
        message: 'You earned 30 STEX for completing 3 swaps today!',
        read: false
      });
    }
  },

  recordBridge: () => {
    const state = get();
    if (!state.userPoints) return;
    
    const newBridgesToday = state.userPoints.bridgesToday + 1;
    set({
      userPoints: {
        ...state.userPoints,
        bridgesToday: newBridgesToday
      }
    });

    // Check if completed 2 bridges task
    if (newBridgesToday === 2) {
      get().addPoints(50, "Completed 2 bridges daily task");
      get().addNotification({
        type: 'success',
        title: 'Task Completed!',
        message: 'You earned 50 STEX for completing 2 bridges today!',
        read: false
      });
    }
  },

  recordTokenCreation: () => {
    const state = get();
    if (!state.userPoints) return;
    
    const newTokensToday = state.userPoints.tokensCreatedToday + 1;
    set({
      userPoints: {
        ...state.userPoints,
        tokensCreatedToday: newTokensToday
      }
    });

    // Award points for token creation
    if (newTokensToday === 1) {
      get().addPoints(100, "Created a token");
      get().addNotification({
        type: 'success',
        title: 'Task Completed!',
        message: 'You earned 100 STEX for creating a token!',
        read: false
      });
    }
  },

  recordGM: () => {
    const state = get();
    if (!state.userPoints) return;
    
    if (!state.userPoints.gmToday) {
      set({
        userPoints: {
          ...state.userPoints,
          gmToday: true,
          currentStreak: state.userPoints.currentStreak + 1
        }
      });

      get().addPoints(10, "Daily GM ritual completed");
      get().addNotification({
        type: 'success',
        title: 'GM Posted!',
        message: 'You earned 10 STEX for your daily GM ritual!',
        read: false
      });
    }
  }
}));
