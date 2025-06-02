
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import type {
  User,
  Referral,
  ReferralStats,
  UserPoints,
  UserActivity,
  DailyTask,
  SocialPost,
  PostInteraction,
  CopyTradingFollow,
  TraderProfile,
  Competition,
  CompetitionParticipant,
  Achievement,
  UserAchievement,
  GovernanceProposal,
  GovernanceVote,
  Notification
} from '@/types/social';

export class SocialService {
  // User Management
  static async getUser(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        logger.error('Error fetching user:', error);
        return null;
      }
      return data;
    } catch (error) {
      logger.error('SocialService.getUser error:', error);
      return null;
    }
  }

  static async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating user:', error);
        return null;
      }

      // Initialize user points
      await supabase
        .from('user_points')
        .insert({ user_id: data.id });

      return data;
    } catch (error) {
      logger.error('SocialService.createUser error:', error);
      return null;
    }
  }

  // Referral System
  static async generateReferralCode(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('generate_referral_code', {
        user_id: userId
      });

      if (error) {
        logger.error('Error generating referral code:', error);
        throw error;
      }
      return data;
    } catch (error) {
      logger.error('SocialService.generateReferralCode error:', error);
      throw error;
    }
  }

  static async createReferral(
    referrerId: string,
    referredId: string,
    code: string
  ): Promise<Referral | null> {
    try {
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
        logger.error('Error creating referral:', error);
        return null;
      }
      return data;
    } catch (error) {
      logger.error('SocialService.createReferral error:', error);
      return null;
    }
  }

  static async getReferralStats(userId: string): Promise<ReferralStats | null> {
    try {
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select(`
          *,
          referred:users!referrals_referred_id_fkey(username, created_at)
        `)
        .eq('referrer_id', userId);

      if (error) {
        logger.error('Error fetching referral stats:', error);
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
    } catch (error) {
      logger.error('SocialService.getReferralStats error:', error);
      return null;
    }
  }

  // Points & Gamification
  static async getUserPoints(userId: string): Promise<UserPoints | null> {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        logger.error('Error fetching user points:', error);
        return null;
      }
      return data;
    } catch (error) {
      logger.error('SocialService.getUserPoints error:', error);
      return null;
    }
  }

  static async awardPoints(
    userId: string,
    points: number,
    activityType: string,
    description: string,
    chainId?: number,
    transactionHash?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('award_points', {
        p_user_id: userId,
        p_points: points,
        p_activity_type: activityType,
        p_description: description,
        p_chain_id: chainId,
        p_transaction_hash: transactionHash
      });

      if (error) {
        logger.error('Error awarding points:', error);
        throw error;
      }
    } catch (error) {
      logger.error('SocialService.awardPoints error:', error);
      throw error;
    }
  }

  static async updateDailyActivity(userId: string, activityType: string): Promise<void> {
    try {
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
    } catch (error) {
      logger.error('SocialService.updateDailyActivity error:', error);
      throw error;
    }
  }

  // Social Features
  static async createSocialPost(
    userId: string,
    postType: string,
    content: string,
    tradeReference?: string,
    visibility: string = 'public'
  ): Promise<SocialPost | null> {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: userId,
          post_type: postType,
          content,
          trade_reference: tradeReference,
          visibility
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating social post:', error);
        return null;
      }
      return data;
    } catch (error) {
      logger.error('SocialService.createSocialPost error:', error);
      return null;
    }
  }

  static async getSocialFeed(userId: string, limit: number = 50): Promise<SocialPost[]> {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          user:users(username, social_score)
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching social feed:', error);
        return [];
      }
      return data;
    } catch (error) {
      logger.error('SocialService.getSocialFeed error:', error);
      return [];
    }
  }

  static async likePost(userId: string, postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('post_interactions')
        .upsert({
          user_id: userId,
          post_id: postId,
          interaction_type: 'like'
        });

      if (error) {
        logger.error('Error liking post:', error);
        throw error;
      }

      // Update post likes count
      await supabase.rpc('increment_post_likes', { post_id: postId });
    } catch (error) {
      logger.error('SocialService.likePost error:', error);
      throw error;
    }
  }

  // Copy Trading
  static async followTrader(
    followerId: string,
    traderId: string,
    copyPercentage: number,
    maxTradeSize?: string,
    stopLossThreshold: number = 10
  ): Promise<CopyTradingFollow | null> {
    try {
      const { data, error } = await supabase
        .from('copy_trading_follows')
        .insert({
          follower_id: followerId,
          trader_id: traderId,
          copy_percentage: copyPercentage,
          max_trade_size: maxTradeSize,
          stop_loss_threshold: stopLossThreshold,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        logger.error('Error following trader:', error);
        return null;
      }
      return data;
    } catch (error) {
      logger.error('SocialService.followTrader error:', error);
      return null;
    }
  }

  static async getTraderProfile(userId: string): Promise<TraderProfile | null> {
    try {
      const { data, error } = await supabase
        .from('trader_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        logger.error('Error fetching trader profile:', error);
        return null;
      }
      return data;
    } catch (error) {
      logger.error('SocialService.getTraderProfile error:', error);
      return null;
    }
  }

  // Competitions
  static async getActiveCompetitions(): Promise<Competition[]> {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .in('status', ['upcoming', 'active'])
        .order('start_date', { ascending: true });

      if (error) {
        logger.error('Error fetching competitions:', error);
        return [];
      }
      return data;
    } catch (error) {
      logger.error('SocialService.getActiveCompetitions error:', error);
      return [];
    }
  }

  static async joinCompetition(
    userId: string,
    competitionId: string,
    startingBalance: string
  ): Promise<CompetitionParticipant | null> {
    try {
      const { data, error } = await supabase
        .from('competition_participants')
        .insert({
          competition_id: competitionId,
          user_id: userId,
          starting_balance: startingBalance,
          current_balance: startingBalance,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        logger.error('Error joining competition:', error);
        return null;
      }
      return data;
    } catch (error) {
      logger.error('SocialService.joinCompetition error:', error);
      return null;
    }
  }

  // Achievements
  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(name, description, badge_icon, points_reward)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

      if (error) {
        logger.error('Error fetching user achievements:', error);
        return [];
      }
      return data;
    } catch (error) {
      logger.error('SocialService.getUserAchievements error:', error);
      return [];
    }
  }

  // Governance
  static async getActiveProposals(): Promise<GovernanceProposal[]> {
    try {
      const { data, error } = await supabase
        .from('governance_proposals')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching proposals:', error);
        return [];
      }
      return data;
    } catch (error) {
      logger.error('SocialService.getActiveProposals error:', error);
      return [];
    }
  }

  static async voteOnProposal(
    userId: string,
    proposalId: string,
    vote: 'yes' | 'no' | 'abstain',
    votingPower: number,
    reason?: string
  ): Promise<GovernanceVote | null> {
    try {
      const { data, error } = await supabase
        .from('governance_votes')
        .insert({
          proposal_id: proposalId,
          user_id: userId,
          vote,
          voting_power: votingPower,
          reason
        })
        .select()
        .single();

      if (error) {
        logger.error('Error voting on proposal:', error);
        return null;
      }
      return data;
    } catch (error) {
      logger.error('SocialService.voteOnProposal error:', error);
      return null;
    }
  }

  // Leaderboard
  static async getLeaderboard(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_points')
        .select(`
          *,
          user:users(username, wallet_address)
        `)
        .order('total_points', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching leaderboard:', error);
        return [];
      }
      return data;
    } catch (error) {
      logger.error('SocialService.getLeaderboard error:', error);
      return [];
    }
  }
}
