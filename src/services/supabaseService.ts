import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserPoints = Database['public']['Tables']['user_points']['Row'];
type Referral = Database['public']['Tables']['referrals']['Row'];
type UserActivity = Database['public']['Tables']['user_activities']['Row'];
type DailyTask = Database['public']['Tables']['daily_tasks']['Row'];

export class SupabaseService {
  // Profile Management
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  }

  static async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    return data;
  }

  // Wallet Profile Management
  static async getProfileByWallet(walletAddress: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile by wallet:', error);
      return null;
    }
    return data;
  }

  static async createWalletProfile(walletAddress: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        username: `user_${walletAddress.slice(-8)}`
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating wallet profile:', error);
      throw error;
    }

    // Create user points record
    await supabase
      .from('user_points')
      .insert({
        user_id: data.id
      });

    // Create default daily tasks
    await supabase
      .from('daily_tasks')
      .insert([
        { user_id: data.id, task_type: 'daily_gm', target_count: 1, reward_points: 10 },
        { user_id: data.id, task_type: 'swap_3x', target_count: 3, reward_points: 30 },
        { user_id: data.id, task_type: 'bridge_2x', target_count: 2, reward_points: 50 },
        { user_id: data.id, task_type: 'create_token', target_count: 1, reward_points: 100 }
      ]);

    return data;
  }

  // Points Management
  static async getUserPoints(userId: string): Promise<UserPoints | null> {
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user points:', error);
      return null;
    }
    return data;
  }

  static async awardPoints(
    userId: string,
    points: number,
    activityType: string,
    description: string,
    chainId?: number,
    transactionHash?: string
  ) {
    const { error } = await supabase.rpc('award_points', {
      p_user_id: userId,
      p_points: points,
      p_activity_type: activityType,
      p_description: description,
      p_chain_id: chainId,
      p_transaction_hash: transactionHash
    });

    if (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  static async updateDailyActivity(userId: string, activityType: string) {
    switch (activityType) {
      case 'gm':
        await supabase
          .from('user_points')
          .update({ gm_today: true })
          .eq('user_id', userId);
        break;
      case 'swap':
        const { data: currentSwaps } = await supabase
          .from('user_points')
          .select('swaps_today')
          .eq('user_id', userId)
          .single();
        
        await supabase
          .from('user_points')
          .update({ swaps_today: (currentSwaps?.swaps_today || 0) + 1 })
          .eq('user_id', userId);
        break;
      case 'bridge':
        const { data: currentBridges } = await supabase
          .from('user_points')
          .select('bridges_today')
          .eq('user_id', userId)
          .single();
        
        await supabase
          .from('user_points')
          .update({ bridges_today: (currentBridges?.bridges_today || 0) + 1 })
          .eq('user_id', userId);
        break;
      case 'token_creation':
        const { data: currentTokens } = await supabase
          .from('user_points')
          .select('tokens_created_today')
          .eq('user_id', userId)
          .single();
        
        await supabase
          .from('user_points')
          .update({ tokens_created_today: (currentTokens?.tokens_created_today || 0) + 1 })
          .eq('user_id', userId);
        break;
    }
  }

  // Referral Management
  static async createReferral(referrerId: string, referredId: string, code: string) {
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: referredId,
        referral_code: code,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
    return data;
  }

  static async getReferralStats(userId: string) {
    const { data: referrals, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referred:profiles!referrals_referred_id_fkey(username, created_at)
      `)
      .eq('referrer_id', userId);

    if (error) {
      console.error('Error fetching referral stats:', error);
      return null;
    }

    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.status === 'active').length;
    const earnedFromReferrals = referrals.reduce((sum, r) => sum + (r.points_earned || 0), 0);

    return {
      totalReferrals,
      activeReferrals,
      earnedFromReferrals,
      recentReferrals: referrals.map(r => ({
        username: r.referred?.username || 'Anonymous',
        joinedDate: new Date(r.created_at).toLocaleDateString(),
        status: r.status as 'active' | 'pending',
        pointsEarned: r.points_earned || 0
      }))
    };
  }

  static async generateReferralCode(userId: string): Promise<string> {
    const { data, error } = await supabase.rpc('generate_referral_code', {
      user_id: userId
    });

    if (error) {
      console.error('Error generating referral code:', error);
      throw error;
    }
    return data;
  }

  // Activity Management
  static async getUserActivities(userId: string, limit = 10): Promise<UserActivity[]> {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user activities:', error);
      return [];
    }
    return data;
  }

  // Daily Tasks Management
  static async getDailyTasks(userId: string): Promise<DailyTask[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('reset_date', today);

    if (error) {
      console.error('Error fetching daily tasks:', error);
      return [];
    }
    return data;
  }

  static async updateTaskProgress(userId: string, taskType: string, progress: number) {
    const today = new Date().toISOString().split('T')[0];
    
    const { error } = await supabase
      .from('daily_tasks')
      .update({ 
        current_progress: progress,
        completed: progress >= 1
      })
      .eq('user_id', userId)
      .eq('task_type', taskType)
      .eq('reset_date', today);

    if (error) {
      console.error('Error updating task progress:', error);
      throw error;
    }
  }

  // Leaderboard
  static async getLeaderboard(limit = 50) {
    const { data, error } = await supabase
      .from('user_points')
      .select(`
        *,
        profile:profiles!user_points_user_id_fkey(username, wallet_address)
      `)
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
    return data;
  }

  // Real-time subscriptions
  static subscribeToUserPoints(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('user_points_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_points',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  static subscribeToUserActivities(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('user_activities_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activities',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
}
