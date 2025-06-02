
// Social Trading Platform Types for Phase 4

export interface User {
  id: string;
  wallet_address?: string;
  email?: string;
  username?: string;
  social_score: number;
  trading_tier: string;
  influence_rank?: number;
  total_referrals: number;
  kyc_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

// Referral System Types
export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  tier_level: number;
  status: 'pending' | 'active' | 'expired';
  points_earned: number;
  lifetime_volume: string;
  created_at: Date;
  updated_at: Date;
}

export interface ReferralStats {
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

// Points & Gamification Types
export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  current_streak: number;
  rank?: number;
  gm_today: boolean;
  swaps_today: number;
  bridges_today: number;
  tokens_created_today: number;
  last_activity: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  points_earned: number;
  description: string;
  chain_id?: number;
  transaction_hash?: string;
  metadata?: any;
  created_at: Date;
}

export interface DailyTask {
  id: string;
  user_id: string;
  task_type: string;
  target_count: number;
  current_progress: number;
  completed: boolean;
  reward_points: number;
  reset_date: string;
  created_at: Date;
  updated_at: Date;
}

// Social Features Types
export interface SocialPost {
  id: string;
  user_id: string;
  post_type: string;
  content: string;
  trade_reference?: string;
  attachments?: any;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  visibility: 'public' | 'private' | 'followers';
  created_at: Date;
  updated_at: Date;
}

export interface PostInteraction {
  id: string;
  user_id: string;
  post_id: string;
  interaction_type: 'like' | 'comment' | 'share';
  content?: string;
  created_at: Date;
}

// Copy Trading Types
export interface CopyTradingFollow {
  id: string;
  follower_id: string;
  trader_id: string;
  copy_percentage: number;
  max_trade_size?: string;
  stop_loss_threshold: number;
  is_active: boolean;
  total_copied_volume: string;
  total_profit_loss: string;
  created_at: Date;
  updated_at: Date;
}

export interface TraderProfile {
  id: string;
  user_id: string;
  display_name?: string;
  bio?: string;
  trading_style?: string;
  risk_level: string;
  verified_trader: boolean;
  public_performance: boolean;
  follower_count: number;
  total_copied_volume: string;
  win_rate: number;
  average_return: number;
  max_drawdown: number;
  sharpe_ratio: number;
  created_at: Date;
  updated_at: Date;
}

// Competition Types
export interface Competition {
  id: string;
  name: string;
  description?: string;
  competition_type: string;
  start_date: Date;
  end_date: Date;
  prize_pool: string;
  entry_fee: string;
  max_participants?: number;
  current_participants: number;
  rules: any;
  status: 'upcoming' | 'active' | 'ended';
  winner_id?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CompetitionParticipant {
  id: string;
  competition_id: string;
  user_id: string;
  starting_balance: string;
  current_balance: string;
  total_return: number;
  rank?: number;
  is_active: boolean;
  joined_at: Date;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points_reward: number;
  requirements: any;
  is_active: boolean;
  created_at: Date;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: Date;
  progress?: any;
}

// Governance Types
export interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  proposer_id: string;
  proposal_type: string;
  voting_end_date: Date;
  minimum_votes: number;
  yes_votes: number;
  no_votes: number;
  abstain_votes: number;
  status: 'active' | 'passed' | 'rejected' | 'expired';
  implementation_details?: any;
  created_at: Date;
  updated_at: Date;
}

export interface GovernanceVote {
  id: string;
  proposal_id: string;
  user_id: string;
  vote: 'yes' | 'no' | 'abstain';
  voting_power: number;
  reason?: string;
  created_at: Date;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: Date;
}

// API Request/Response Types
export interface CreateReferralRequest {
  email?: string;
}

export interface CreateReferralResponse {
  referral_code: string;
  success: boolean;
}

export interface ClaimReferralRewardRequest {
  referral_id: string;
}

export interface CreateSocialPostRequest {
  post_type: string;
  content: string;
  trade_reference?: string;
  visibility?: 'public' | 'private' | 'followers';
}

export interface FollowTraderRequest {
  trader_id: string;
  copy_percentage: number;
  max_trade_size?: string;
  stop_loss_threshold?: number;
}

export interface CreateCompetitionRequest {
  name: string;
  description?: string;
  competition_type: string;
  start_date: Date;
  end_date: Date;
  prize_pool: string;
  entry_fee?: string;
  max_participants?: number;
  rules: any;
}

export interface JoinCompetitionRequest {
  competition_id: string;
}

export interface CreateProposalRequest {
  title: string;
  description: string;
  proposal_type: string;
  voting_end_date: Date;
  minimum_votes?: number;
  implementation_details?: any;
}

export interface VoteOnProposalRequest {
  proposal_id: string;
  vote: 'yes' | 'no' | 'abstain';
  reason?: string;
}
