
import { useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { useAppStore } from '@/stores/useAppStore';
import { SupabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';

export const useSupabaseIntegration = () => {
  const user = useUser();
  const { 
    setUserPoints, 
    setReferralStats, 
    setDailyTasks,
    addNotification 
  } = useAppStore();

  // Load user data when authenticated
  useEffect(() => {
    if (!user?.id) return;

    const loadUserData = async () => {
      try {
        // Load user points
        const userPoints = await SupabaseService.getUserPoints(user.id);
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
        const referralStats = await SupabaseService.getReferralStats(user.id);
        if (referralStats) {
          setReferralStats(referralStats);
        }

        // Load daily tasks
        const dailyTasks = await SupabaseService.getDailyTasks(user.id);
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
        const activities = await SupabaseService.getUserActivities(user.id, 10);
        const formattedActivities = activities.map(activity => ({
          description: activity.description,
          points: activity.points_earned || 0,
          timestamp: formatTimestamp(activity.created_at)
        }));

        if (userPoints) {
          setUserPoints(prev => prev ? {
            ...prev,
            recentActivity: formattedActivities
          } : null);
        }

      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load user data');
      }
    };

    loadUserData();
  }, [user?.id, setUserPoints, setReferralStats, setDailyTasks]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    const pointsSubscription = SupabaseService.subscribeToUserPoints(
      user.id,
      (payload) => {
        const { new: newData } = payload;
        if (newData) {
          setUserPoints({
            totalPoints: newData.total_points || 0,
            currentStreak: newData.current_streak || 0,
            rank: newData.rank || null,
            gmToday: newData.gm_today || false,
            swapsToday: newData.swaps_today || 0,
            bridgesToday: newData.bridges_today || 0,
            tokensCreatedToday: newData.tokens_created_today || 0,
            recentActivity: []
          });
        }
      }
    );

    const activitiesSubscription = SupabaseService.subscribeToUserActivities(
      user.id,
      (payload) => {
        const { new: newActivity } = payload;
        if (newActivity) {
          addNotification({
            type: 'success',
            title: 'Points Earned!',
            message: `+${newActivity.points_earned} STEX: ${newActivity.description}`,
            read: false
          });
        }
      }
    );

    return () => {
      pointsSubscription.unsubscribe();
      activitiesSubscription.unsubscribe();
    };
  }, [user?.id, setUserPoints, addNotification]);

  // Helper functions to award points for various activities
  const awardPointsForActivity = async (
    activityType: 'gm' | 'swap' | 'bridge' | 'token_creation',
    description: string,
    points: number,
    chainId?: number,
    transactionHash?: string
  ) => {
    if (!user?.id) return;

    try {
      await SupabaseService.awardPoints(
        user.id,
        points,
        activityType,
        description,
        chainId,
        transactionHash
      );
      
      await SupabaseService.updateDailyActivity(user.id, activityType);
      
      toast.success(`+${points} STEX earned!`, {
        description: description
      });
    } catch (error) {
      console.error('Error awarding points:', error);
      toast.error('Failed to award points');
    }
  };

  return {
    awardPointsForActivity,
    isAuthenticated: !!user?.id,
    userId: user?.id
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
