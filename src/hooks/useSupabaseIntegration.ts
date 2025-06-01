
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useAppStore } from '@/stores/useAppStore';
import { SupabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';

export const useSupabaseIntegration = () => {
  const { address, isConnected } = useAccount();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const { 
    setUserPoints, 
    setReferralStats, 
    setDailyTasks,
    addNotification 
  } = useAppStore();

  // Check if wallet is authenticated and load user data
  useEffect(() => {
    if (!address || !isConnected) {
      setIsAuthenticated(false);
      setUserId(null);
      return;
    }

    const loadWalletData = async () => {
      try {
        const profile = await SupabaseService.getProfileByWallet(address);
        if (profile) {
          setIsAuthenticated(true);
          setUserId(profile.id);
          await loadUserData(profile.id);
        }
      } catch (error) {
        console.error('Error checking wallet authentication:', error);
      }
    };

    loadWalletData();
  }, [address, isConnected]);

  const loadUserData = async (profileId: string) => {
    try {
      // Load user points
      const userPoints = await SupabaseService.getUserPoints(profileId);
      if (userPoints) {
        setUserPoints({
          totalPoints: userPoints.total_points || 0,
          currentStreak: userPoints.current_streak || 0,
          rank: userPoints.rank || null,
          gmToday: userPoints.gm_today || false,
          swapsToday: userPoints.swaps_today || 0,
          bridgesToday: userPoints.bridges_today || 0,
          tokensCreatedToday: userPoints.tokens_created_today || 0,
          recentActivity: []
        });
      }

      // Load referral stats
      const referralStats = await SupabaseService.getReferralStats(profileId);
      if (referralStats) {
        setReferralStats(referralStats);
      }

      // Load daily tasks
      const dailyTasks = await SupabaseService.getDailyTasks(profileId);
      const formattedTasks = dailyTasks.map(task => ({
        id: task.id,
        title: formatTaskTitle(task.task_type),
        description: formatTaskDescription(task.task_type, task.target_count),
        reward: task.reward_points,
        progress: task.current_progress || 0,
        target: task.target_count,
        completed: task.completed || false,
        resetTime: new Date(task.reset_date + 'T23:59:59').getTime()
      }));
      setDailyTasks(formattedTasks);

      // Load recent activities
      const activities = await SupabaseService.getUserActivities(profileId, 10);
      const formattedActivities = activities.map(activity => ({
        description: activity.description,
        points: activity.points_earned || 0,
        timestamp: formatTimestamp(activity.created_at)
      }));

      setUserPoints({
        totalPoints: userPoints?.total_points || 0,
        currentStreak: userPoints?.current_streak || 0,
        rank: userPoints?.rank || null,
        gmToday: userPoints?.gm_today || false,
        swapsToday: userPoints?.swaps_today || 0,
        bridgesToday: userPoints?.bridges_today || 0,
        tokensCreatedToday: userPoints?.tokens_created_today || 0,
        recentActivity: formattedActivities
      });

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    }
  };

  const authenticateWallet = async (walletAddress: string, signature: string, message: string) => {
    try {
      // Create or get user profile
      let profile = await SupabaseService.getProfileByWallet(walletAddress);
      
      if (!profile) {
        // Create new profile for wallet
        profile = await SupabaseService.createWalletProfile(walletAddress);
      }

      setIsAuthenticated(true);
      setUserId(profile.id);
      await loadUserData(profile.id);
      
      // Award login points
      await awardPointsForActivity('login', 'Daily wallet connection', 5);
      
    } catch (error) {
      console.error('Error authenticating wallet:', error);
      throw error;
    }
  };

  const awardPointsForActivity = async (
    activityType: 'gm' | 'swap' | 'bridge' | 'token_creation' | 'login',
    description: string,
    points: number,
    chainId?: number,
    transactionHash?: string
  ) => {
    if (!userId) return;

    try {
      await SupabaseService.awardPoints(
        userId,
        points,
        activityType,
        description,
        chainId,
        transactionHash
      );
      
      await SupabaseService.updateDailyActivity(userId, activityType);
      
      toast.success(`+${points} STEX earned!`, {
        description: description
      });
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  return {
    authenticateWallet,
    awardPointsForActivity,
    isAuthenticated,
    userId
  };
};

// Helper functions
const formatTaskTitle = (taskType: string): string => {
  const titles: Record<string, string> = {
    'daily_gm': 'Daily GM Ritual',
    'swap_3x': 'Complete 3 Swaps',
    'bridge_2x': 'Bridge 2 Times',
    'create_token': 'Create a Token'
  };
  return titles[taskType] || taskType;
};

const formatTaskDescription = (taskType: string, target: number): string => {
  const descriptions: Record<string, string> = {
    'daily_gm': 'Post your daily GM message',
    'swap_3x': `Complete ${target} token swaps today`,
    'bridge_2x': `Bridge assets ${target} times today`,
    'create_token': 'Deploy a custom token contract'
  };
  return descriptions[taskType] || `Complete ${target} actions`;
};

const formatTimestamp = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
  return `${Math.floor(diffInMinutes / 1440)} days ago`;
};
