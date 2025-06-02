export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_icon: string | null
          category: string
          created_at: string | null
          description: string
          difficulty: string | null
          id: string
          is_active: boolean | null
          name: string
          points_reward: number | null
          requirements: Json
        }
        Insert: {
          badge_icon?: string | null
          category: string
          created_at?: string | null
          description: string
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_reward?: number | null
          requirements: Json
        }
        Update: {
          badge_icon?: string | null
          category?: string
          created_at?: string | null
          description?: string
          difficulty?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_reward?: number | null
          requirements?: Json
        }
        Relationships: []
      }
      competition_participants: {
        Row: {
          competition_id: string
          current_balance: number
          id: string
          is_active: boolean | null
          joined_at: string | null
          rank: number | null
          starting_balance: number
          total_return: number | null
          user_id: string
        }
        Insert: {
          competition_id: string
          current_balance: number
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          rank?: number | null
          starting_balance: number
          total_return?: number | null
          user_id: string
        }
        Update: {
          competition_id?: string
          current_balance?: number
          id?: string
          is_active?: boolean | null
          joined_at?: string | null
          rank?: number | null
          starting_balance?: number
          total_return?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_participants_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          competition_type: string
          created_at: string | null
          created_by: string | null
          current_participants: number | null
          description: string | null
          end_date: string
          entry_fee: number | null
          id: string
          max_participants: number | null
          name: string
          prize_pool: number
          rules: Json
          start_date: string
          status: string | null
          updated_at: string | null
          winner_id: string | null
        }
        Insert: {
          competition_type: string
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_date: string
          entry_fee?: number | null
          id?: string
          max_participants?: number | null
          name: string
          prize_pool: number
          rules: Json
          start_date: string
          status?: string | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Update: {
          competition_type?: string
          created_at?: string | null
          created_by?: string | null
          current_participants?: number | null
          description?: string | null
          end_date?: string
          entry_fee?: number | null
          id?: string
          max_participants?: number | null
          name?: string
          prize_pool?: number
          rules?: Json
          start_date?: string
          status?: string | null
          updated_at?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitions_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      copy_trading_follows: {
        Row: {
          copy_percentage: number
          created_at: string | null
          follower_id: string
          id: string
          is_active: boolean | null
          max_trade_size: number | null
          stop_loss_threshold: number | null
          total_copied_volume: number | null
          total_profit_loss: number | null
          trader_id: string
          updated_at: string | null
        }
        Insert: {
          copy_percentage: number
          created_at?: string | null
          follower_id: string
          id?: string
          is_active?: boolean | null
          max_trade_size?: number | null
          stop_loss_threshold?: number | null
          total_copied_volume?: number | null
          total_profit_loss?: number | null
          trader_id: string
          updated_at?: string | null
        }
        Update: {
          copy_percentage?: number
          created_at?: string | null
          follower_id?: string
          id?: string
          is_active?: boolean | null
          max_trade_size?: number | null
          stop_loss_threshold?: number | null
          total_copied_volume?: number | null
          total_profit_loss?: number | null
          trader_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "copy_trading_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "copy_trading_follows_trader_id_fkey"
            columns: ["trader_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_tasks: {
        Row: {
          completed: boolean | null
          created_at: string | null
          current_progress: number | null
          id: string
          reset_date: string | null
          reward_points: number
          target_count: number
          task_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          reset_date?: string | null
          reward_points: number
          target_count: number
          task_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          current_progress?: number | null
          id?: string
          reset_date?: string | null
          reward_points?: number
          target_count?: number
          task_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_proposals: {
        Row: {
          abstain_votes: number | null
          created_at: string | null
          description: string
          id: string
          implementation_details: Json | null
          minimum_votes: number | null
          no_votes: number | null
          proposal_type: string
          proposer_id: string
          status: string | null
          title: string
          updated_at: string | null
          voting_end_date: string
          yes_votes: number | null
        }
        Insert: {
          abstain_votes?: number | null
          created_at?: string | null
          description: string
          id?: string
          implementation_details?: Json | null
          minimum_votes?: number | null
          no_votes?: number | null
          proposal_type: string
          proposer_id: string
          status?: string | null
          title: string
          updated_at?: string | null
          voting_end_date: string
          yes_votes?: number | null
        }
        Update: {
          abstain_votes?: number | null
          created_at?: string | null
          description?: string
          id?: string
          implementation_details?: Json | null
          minimum_votes?: number | null
          no_votes?: number | null
          proposal_type?: string
          proposer_id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          voting_end_date?: string
          yes_votes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "governance_proposals_proposer_id_fkey"
            columns: ["proposer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      governance_votes: {
        Row: {
          created_at: string | null
          id: string
          proposal_id: string
          reason: string | null
          user_id: string
          vote: string
          voting_power: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          proposal_id: string
          reason?: string | null
          user_id: string
          vote: string
          voting_power: number
        }
        Update: {
          created_at?: string | null
          id?: string
          proposal_id?: string
          reason?: string | null
          user_id?: string
          vote?: string
          voting_power?: number
        }
        Relationships: [
          {
            foreignKeyName: "governance_votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "governance_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "governance_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_interactions: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          interaction_type: string
          post_id: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          interaction_type: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          interaction_type?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          updated_at: string | null
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          points_earned: number | null
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          points_earned?: number | null
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          points_earned?: number | null
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          attachments: Json | null
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          post_type: string
          shares_count: number | null
          trade_reference: string | null
          updated_at: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          attachments?: Json | null
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          post_type: string
          shares_count?: number | null
          trade_reference?: string | null
          updated_at?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          attachments?: Json | null
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          post_type?: string
          shares_count?: number | null
          trade_reference?: string | null
          updated_at?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      trader_profiles: {
        Row: {
          average_return: number | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          follower_count: number | null
          id: string
          max_drawdown: number | null
          public_performance: boolean | null
          risk_level: string | null
          sharpe_ratio: number | null
          total_copied_volume: number | null
          trading_style: string | null
          updated_at: string | null
          user_id: string
          verified_trader: boolean | null
          win_rate: number | null
        }
        Insert: {
          average_return?: number | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          follower_count?: number | null
          id?: string
          max_drawdown?: number | null
          public_performance?: boolean | null
          risk_level?: string | null
          sharpe_ratio?: number | null
          total_copied_volume?: number | null
          trading_style?: string | null
          updated_at?: string | null
          user_id: string
          verified_trader?: boolean | null
          win_rate?: number | null
        }
        Update: {
          average_return?: number | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          follower_count?: number | null
          id?: string
          max_drawdown?: number | null
          public_performance?: boolean | null
          risk_level?: string | null
          sharpe_ratio?: number | null
          total_copied_volume?: number | null
          trading_style?: string | null
          updated_at?: string | null
          user_id?: string
          verified_trader?: boolean | null
          win_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trader_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          progress: Json | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          progress?: Json | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          progress?: Json | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity_type: string
          chain_id: number | null
          created_at: string | null
          description: string
          id: string
          metadata: Json | null
          points_earned: number | null
          transaction_hash: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          chain_id?: number | null
          created_at?: string | null
          description: string
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          transaction_hash?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          chain_id?: number | null
          created_at?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          transaction_hash?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          bridges_today: number | null
          created_at: string | null
          current_streak: number | null
          gm_today: boolean | null
          id: string
          last_activity: string | null
          rank: number | null
          swaps_today: number | null
          tokens_created_today: number | null
          total_points: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bridges_today?: number | null
          created_at?: string | null
          current_streak?: number | null
          gm_today?: boolean | null
          id?: string
          last_activity?: string | null
          rank?: number | null
          swaps_today?: number | null
          tokens_created_today?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bridges_today?: number | null
          created_at?: string | null
          current_streak?: number | null
          gm_today?: boolean | null
          id?: string
          last_activity?: string | null
          rank?: number | null
          swaps_today?: number | null
          tokens_created_today?: number | null
          total_points?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          influence_rank: number | null
          kyc_verified: boolean | null
          social_score: number | null
          total_referrals: number | null
          trading_tier: string | null
          updated_at: string | null
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          influence_rank?: number | null
          kyc_verified?: boolean | null
          social_score?: number | null
          total_referrals?: number | null
          trading_tier?: string | null
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          influence_rank?: number | null
          kyc_verified?: boolean | null
          social_score?: number | null
          total_referrals?: number | null
          trading_tier?: string | null
          updated_at?: string | null
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_points: {
        Args:
          | Record<PropertyKey, never>
          | {
              p_user_id: string
              p_points: number
              p_activity_type: string
              p_description: string
              p_chain_id?: number
              p_transaction_hash?: string
            }
        Returns: undefined
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
