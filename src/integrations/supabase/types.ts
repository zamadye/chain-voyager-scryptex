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
      audit_records: {
        Row: {
          action: string
          activity_type: string
          compliance_flags: Json | null
          created_at: string | null
          id: string
          institutional_account_id: string | null
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          risk_level: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          activity_type: string
          compliance_flags?: Json | null
          created_at?: string | null
          id?: string
          institutional_account_id?: string | null
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          risk_level?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          activity_type?: string
          compliance_flags?: Json | null
          created_at?: string | null
          id?: string
          institutional_account_id?: string | null
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          risk_level?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_records_institutional_account_id_fkey"
            columns: ["institutional_account_id"]
            isOneToOne: false
            referencedRelation: "institutional_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_records_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bi_reports: {
        Row: {
          created_at: string | null
          delivery_method: string | null
          generated_by: string | null
          generated_for_period: string
          id: string
          institutional_account_id: string | null
          is_scheduled: boolean | null
          last_generated: string | null
          next_generation: string | null
          recipients: Json | null
          report_config: Json
          report_data: Json
          report_name: string
          report_type: string
          schedule_config: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_method?: string | null
          generated_by?: string | null
          generated_for_period: string
          id?: string
          institutional_account_id?: string | null
          is_scheduled?: boolean | null
          last_generated?: string | null
          next_generation?: string | null
          recipients?: Json | null
          report_config?: Json
          report_data?: Json
          report_name: string
          report_type: string
          schedule_config?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_method?: string | null
          generated_by?: string | null
          generated_for_period?: string
          id?: string
          institutional_account_id?: string | null
          is_scheduled?: boolean | null
          last_generated?: string | null
          next_generation?: string | null
          recipients?: Json | null
          report_config?: Json
          report_data?: Json
          report_name?: string
          report_type?: string
          schedule_config?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bi_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bi_reports_institutional_account_id_fkey"
            columns: ["institutional_account_id"]
            isOneToOne: false
            referencedRelation: "institutional_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      bonding_curve_analytics: {
        Row: {
          all_time_high: number | null
          all_time_low: number | null
          created_at: string | null
          current_price: number | null
          current_supply: number | null
          curve_address: string
          curve_innovation_score: number | null
          curve_parameters: Json
          curve_type: string
          id: string
          last_updated: string | null
          market_cap: number | null
          mathematical_complexity: number | null
          price_volatility: number | null
          token_deployment_id: string
          total_buy_transactions: number | null
          total_sell_transactions: number | null
          total_volume: number | null
        }
        Insert: {
          all_time_high?: number | null
          all_time_low?: number | null
          created_at?: string | null
          current_price?: number | null
          current_supply?: number | null
          curve_address: string
          curve_innovation_score?: number | null
          curve_parameters: Json
          curve_type: string
          id?: string
          last_updated?: string | null
          market_cap?: number | null
          mathematical_complexity?: number | null
          price_volatility?: number | null
          token_deployment_id: string
          total_buy_transactions?: number | null
          total_sell_transactions?: number | null
          total_volume?: number | null
        }
        Update: {
          all_time_high?: number | null
          all_time_low?: number | null
          created_at?: string | null
          current_price?: number | null
          current_supply?: number | null
          curve_address?: string
          curve_innovation_score?: number | null
          curve_parameters?: Json
          curve_type?: string
          id?: string
          last_updated?: string | null
          market_cap?: number | null
          mathematical_complexity?: number | null
          price_volatility?: number | null
          token_deployment_id?: string
          total_buy_transactions?: number | null
          total_sell_transactions?: number | null
          total_volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bonding_curve_analytics_token_deployment_id_fkey"
            columns: ["token_deployment_id"]
            isOneToOne: false
            referencedRelation: "token_deployments"
            referencedColumns: ["id"]
          },
        ]
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
      compliance_records: {
        Row: {
          assessor_id: string | null
          compliance_data: Json
          compliance_status: string
          compliance_type: string
          created_at: string | null
          id: string
          institutional_account_id: string
          jurisdiction: string
          last_assessment: string | null
          next_review_date: string | null
          regulation_name: string
          remediation_notes: string | null
          risk_score: number | null
          updated_at: string | null
        }
        Insert: {
          assessor_id?: string | null
          compliance_data?: Json
          compliance_status: string
          compliance_type: string
          created_at?: string | null
          id?: string
          institutional_account_id: string
          jurisdiction: string
          last_assessment?: string | null
          next_review_date?: string | null
          regulation_name: string
          remediation_notes?: string | null
          risk_score?: number | null
          updated_at?: string | null
        }
        Update: {
          assessor_id?: string | null
          compliance_data?: Json
          compliance_status?: string
          compliance_type?: string
          created_at?: string | null
          id?: string
          institutional_account_id?: string
          jurisdiction?: string
          last_assessment?: string | null
          next_review_date?: string | null
          regulation_name?: string
          remediation_notes?: string | null
          risk_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_records_assessor_id_fkey"
            columns: ["assessor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_records_institutional_account_id_fkey"
            columns: ["institutional_account_id"]
            isOneToOne: false
            referencedRelation: "institutional_accounts"
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
      creation_achievements: {
        Row: {
          achievement_category: string
          achievement_description: string
          achievement_id: string
          achievement_name: string
          achievement_points: number
          badge_icon: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          requirement_condition: string | null
          requirement_type: string
          requirement_value: number
          special_privilege: string | null
        }
        Insert: {
          achievement_category: string
          achievement_description: string
          achievement_id: string
          achievement_name: string
          achievement_points: number
          badge_icon?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          requirement_condition?: string | null
          requirement_type: string
          requirement_value: number
          special_privilege?: string | null
        }
        Update: {
          achievement_category?: string
          achievement_description?: string
          achievement_id?: string
          achievement_name?: string
          achievement_points?: number
          badge_icon?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          requirement_condition?: string | null
          requirement_type?: string
          requirement_value?: number
          special_privilege?: string | null
        }
        Relationships: []
      }
      daily_creation_tasks: {
        Row: {
          bonus_multiplier: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          minimum_innovation_score: number | null
          required_chains: string[] | null
          required_features: string[] | null
          required_token_types: string[] | null
          required_tokens: number | null
          special_reward: string | null
          task_date: string
          task_description: string
          task_id: string
          task_name: string
          task_points: number
          task_type: string
        }
        Insert: {
          bonus_multiplier?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_innovation_score?: number | null
          required_chains?: string[] | null
          required_features?: string[] | null
          required_token_types?: string[] | null
          required_tokens?: number | null
          special_reward?: string | null
          task_date?: string
          task_description: string
          task_id: string
          task_name: string
          task_points: number
          task_type: string
        }
        Update: {
          bonus_multiplier?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          minimum_innovation_score?: number | null
          required_chains?: string[] | null
          required_features?: string[] | null
          required_token_types?: string[] | null
          required_tokens?: number | null
          special_reward?: string | null
          task_date?: string
          task_description?: string
          task_id?: string
          task_name?: string
          task_points?: number
          task_type?: string
        }
        Relationships: []
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
      institutional_accounts: {
        Row: {
          account_name: string
          account_type: string
          billing_contact_id: string | null
          compliance_level: string | null
          contract_expiry: string | null
          created_at: string | null
          id: string
          jurisdiction: string
          kyc_status: string | null
          legal_name: string
          onboarding_date: string | null
          primary_contact_id: string | null
          regulatory_identifiers: Json | null
          risk_profile: Json | null
          service_tier: string | null
          total_aum: number | null
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_type: string
          billing_contact_id?: string | null
          compliance_level?: string | null
          contract_expiry?: string | null
          created_at?: string | null
          id?: string
          jurisdiction: string
          kyc_status?: string | null
          legal_name: string
          onboarding_date?: string | null
          primary_contact_id?: string | null
          regulatory_identifiers?: Json | null
          risk_profile?: Json | null
          service_tier?: string | null
          total_aum?: number | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_type?: string
          billing_contact_id?: string | null
          compliance_level?: string | null
          contract_expiry?: string | null
          created_at?: string | null
          id?: string
          jurisdiction?: string
          kyc_status?: string | null
          legal_name?: string
          onboarding_date?: string | null
          primary_contact_id?: string | null
          regulatory_identifiers?: Json | null
          risk_profile?: Json | null
          service_tier?: string | null
          total_aum?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      institutional_team_members: {
        Row: {
          created_at: string | null
          id: string
          institutional_account_id: string
          invited_by: string | null
          is_active: boolean | null
          joined_at: string | null
          permissions: Json
          role: string
          trading_limits: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          institutional_account_id: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json
          role: string
          trading_limits?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          institutional_account_id?: string
          invited_by?: string | null
          is_active?: boolean | null
          joined_at?: string | null
          permissions?: Json
          role?: string
          trading_limits?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "institutional_team_members_institutional_account_id_fkey"
            columns: ["institutional_account_id"]
            isOneToOne: false
            referencedRelation: "institutional_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institutional_team_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institutional_team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      market_making_strategies: {
        Row: {
          average_spread_capture: number | null
          base_spread: number
          created_at: string | null
          created_by: string
          id: string
          institutional_account_id: string
          inventory_limits: Json
          inventory_turnover: number | null
          is_active: boolean | null
          last_quote_time: string | null
          order_size: number
          performance_metrics: Json | null
          risk_controls: Json
          strategy_name: string
          target_markets: Json
          total_pnl: number | null
          total_volume: number | null
          updated_at: string | null
          uptime_percentage: number | null
        }
        Insert: {
          average_spread_capture?: number | null
          base_spread?: number
          created_at?: string | null
          created_by: string
          id?: string
          institutional_account_id: string
          inventory_limits?: Json
          inventory_turnover?: number | null
          is_active?: boolean | null
          last_quote_time?: string | null
          order_size: number
          performance_metrics?: Json | null
          risk_controls?: Json
          strategy_name: string
          target_markets?: Json
          total_pnl?: number | null
          total_volume?: number | null
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Update: {
          average_spread_capture?: number | null
          base_spread?: number
          created_at?: string | null
          created_by?: string
          id?: string
          institutional_account_id?: string
          inventory_limits?: Json
          inventory_turnover?: number | null
          is_active?: boolean | null
          last_quote_time?: string | null
          order_size?: number
          performance_metrics?: Json | null
          risk_controls?: Json
          strategy_name?: string
          target_markets?: Json
          total_pnl?: number | null
          total_volume?: number | null
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_making_strategies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_making_strategies_institutional_account_id_fkey"
            columns: ["institutional_account_id"]
            isOneToOne: false
            referencedRelation: "institutional_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      ml_models: {
        Row: {
          accuracy_score: number | null
          created_at: string | null
          created_by: string
          deployment_status: string | null
          f1_score: number | null
          features: Json
          hyperparameters: Json
          id: string
          institutional_account_id: string
          last_prediction_date: string | null
          last_training_date: string | null
          model_name: string
          model_type: string
          model_version: number | null
          parent_model_id: string | null
          performance_metrics: Json | null
          precision_score: number | null
          recall_score: number | null
          training_data_config: Json
          updated_at: string | null
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string | null
          created_by: string
          deployment_status?: string | null
          f1_score?: number | null
          features?: Json
          hyperparameters?: Json
          id?: string
          institutional_account_id: string
          last_prediction_date?: string | null
          last_training_date?: string | null
          model_name: string
          model_type: string
          model_version?: number | null
          parent_model_id?: string | null
          performance_metrics?: Json | null
          precision_score?: number | null
          recall_score?: number | null
          training_data_config?: Json
          updated_at?: string | null
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string | null
          created_by?: string
          deployment_status?: string | null
          f1_score?: number | null
          features?: Json
          hyperparameters?: Json
          id?: string
          institutional_account_id?: string
          last_prediction_date?: string | null
          last_training_date?: string | null
          model_name?: string
          model_type?: string
          model_version?: number | null
          parent_model_id?: string | null
          performance_metrics?: Json | null
          precision_score?: number | null
          recall_score?: number | null
          training_data_config?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ml_models_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ml_models_institutional_account_id_fkey"
            columns: ["institutional_account_id"]
            isOneToOne: false
            referencedRelation: "institutional_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ml_models_parent_model_id_fkey"
            columns: ["parent_model_id"]
            isOneToOne: false
            referencedRelation: "ml_models"
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
      partner_revenue: {
        Row: {
          active_users: number | null
          additional_fees: number | null
          adjustments: number | null
          created_at: string | null
          id: string
          new_users: number | null
          partner_revenue: number | null
          payout_date: string | null
          payout_status: string | null
          platform_revenue: number | null
          reporting_period: string
          revenue_share_rate: number
          total_fees: number | null
          total_volume: number | null
          transaction_count: number | null
          white_label_instance_id: string
        }
        Insert: {
          active_users?: number | null
          additional_fees?: number | null
          adjustments?: number | null
          created_at?: string | null
          id?: string
          new_users?: number | null
          partner_revenue?: number | null
          payout_date?: string | null
          payout_status?: string | null
          platform_revenue?: number | null
          reporting_period: string
          revenue_share_rate: number
          total_fees?: number | null
          total_volume?: number | null
          transaction_count?: number | null
          white_label_instance_id: string
        }
        Update: {
          active_users?: number | null
          additional_fees?: number | null
          adjustments?: number | null
          created_at?: string | null
          id?: string
          new_users?: number | null
          partner_revenue?: number | null
          payout_date?: string | null
          payout_status?: string | null
          platform_revenue?: number | null
          reporting_period?: string
          revenue_share_rate?: number
          total_fees?: number | null
          total_volume?: number | null
          transaction_count?: number | null
          white_label_instance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_revenue_white_label_instance_id_fkey"
            columns: ["white_label_instance_id"]
            isOneToOne: false
            referencedRelation: "white_label_instances"
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
      quant_strategies: {
        Row: {
          allocated_capital: number | null
          backtest_results: Json | null
          created_at: string | null
          created_by: string
          current_pnl: number | null
          deployment_date: string | null
          description: string | null
          id: string
          institutional_account_id: string
          is_live: boolean | null
          last_rebalance: string | null
          max_drawdown: number | null
          next_rebalance: string | null
          performance_metrics: Json | null
          risk_parameters: Json
          sharpe_ratio: number | null
          status: string | null
          strategy_config: Json
          strategy_name: string
          strategy_type: string
          updated_at: string | null
        }
        Insert: {
          allocated_capital?: number | null
          backtest_results?: Json | null
          created_at?: string | null
          created_by: string
          current_pnl?: number | null
          deployment_date?: string | null
          description?: string | null
          id?: string
          institutional_account_id: string
          is_live?: boolean | null
          last_rebalance?: string | null
          max_drawdown?: number | null
          next_rebalance?: string | null
          performance_metrics?: Json | null
          risk_parameters?: Json
          sharpe_ratio?: number | null
          status?: string | null
          strategy_config?: Json
          strategy_name: string
          strategy_type: string
          updated_at?: string | null
        }
        Update: {
          allocated_capital?: number | null
          backtest_results?: Json | null
          created_at?: string | null
          created_by?: string
          current_pnl?: number | null
          deployment_date?: string | null
          description?: string | null
          id?: string
          institutional_account_id?: string
          is_live?: boolean | null
          last_rebalance?: string | null
          max_drawdown?: number | null
          next_rebalance?: string | null
          performance_metrics?: Json | null
          risk_parameters?: Json
          sharpe_ratio?: number | null
          status?: string | null
          strategy_config?: Json
          strategy_name?: string
          strategy_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quant_strategies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quant_strategies_institutional_account_id_fkey"
            columns: ["institutional_account_id"]
            isOneToOne: false
            referencedRelation: "institutional_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      regulatory_reports: {
        Row: {
          acceptance_date: string | null
          checksum: string | null
          created_at: string | null
          file_path: string | null
          generated_by: string | null
          id: string
          institutional_account_id: string
          jurisdiction: string
          rejection_reason: string | null
          report_data: Json
          report_type: string
          reporting_period: string
          reviewed_by: string | null
          status: string | null
          submission_date: string | null
          submission_deadline: string | null
          submission_id: string | null
          submitted_by: string | null
          updated_at: string | null
          validation_results: Json | null
        }
        Insert: {
          acceptance_date?: string | null
          checksum?: string | null
          created_at?: string | null
          file_path?: string | null
          generated_by?: string | null
          id?: string
          institutional_account_id: string
          jurisdiction: string
          rejection_reason?: string | null
          report_data?: Json
          report_type: string
          reporting_period: string
          reviewed_by?: string | null
          status?: string | null
          submission_date?: string | null
          submission_deadline?: string | null
          submission_id?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          validation_results?: Json | null
        }
        Update: {
          acceptance_date?: string | null
          checksum?: string | null
          created_at?: string | null
          file_path?: string | null
          generated_by?: string | null
          id?: string
          institutional_account_id?: string
          jurisdiction?: string
          rejection_reason?: string | null
          report_data?: Json
          report_type?: string
          reporting_period?: string
          reviewed_by?: string | null
          status?: string | null
          submission_date?: string | null
          submission_deadline?: string | null
          submission_id?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          validation_results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "regulatory_reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regulatory_reports_institutional_account_id_fkey"
            columns: ["institutional_account_id"]
            isOneToOne: false
            referencedRelation: "institutional_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regulatory_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "regulatory_reports_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "users"
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
      system_performance_metrics: {
        Row: {
          created_at: string | null
          id: string
          institutional_account_id: string | null
          measurement_timestamp: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          metric_unit: string | null
          metric_value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          institutional_account_id?: string | null
          measurement_timestamp: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          metric_unit?: string | null
          metric_value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          institutional_account_id?: string | null
          measurement_timestamp?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          metric_unit?: string | null
          metric_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "system_performance_metrics_institutional_account_id_fkey"
            columns: ["institutional_account_id"]
            isOneToOne: false
            referencedRelation: "institutional_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      token_deployments: {
        Row: {
          advanced_features: Json | null
          base_points: number | null
          bonding_curve_type: string | null
          chain_bonus: number | null
          chain_id: number
          chain_name: string
          complexity_bonus: number | null
          creator_address: string
          creator_token_count: number | null
          curve_parameters: Json | null
          daily_tasks_completed: string[] | null
          decimals: number | null
          deployed_at: string | null
          deployment_fee: number
          deployment_status: string | null
          deployment_tx_hash: string | null
          factory_address: string
          feature_bonus: number | null
          features: Json | null
          gas_fee: number | null
          id: string
          initiated_at: string | null
          innovation_score: number | null
          innovative_features: string[] | null
          is_first_token_today: boolean | null
          optimization_features: Json | null
          point_calculation_details: Json | null
          points_awarded: number | null
          points_calculated: boolean | null
          token_address: string | null
          token_description: string | null
          token_name: string
          token_symbol: string
          token_type: string
          total_cost: number | null
          total_supply: number
          type_bonus: number | null
          verification_fee: number | null
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          advanced_features?: Json | null
          base_points?: number | null
          bonding_curve_type?: string | null
          chain_bonus?: number | null
          chain_id: number
          chain_name: string
          complexity_bonus?: number | null
          creator_address: string
          creator_token_count?: number | null
          curve_parameters?: Json | null
          daily_tasks_completed?: string[] | null
          decimals?: number | null
          deployed_at?: string | null
          deployment_fee: number
          deployment_status?: string | null
          deployment_tx_hash?: string | null
          factory_address: string
          feature_bonus?: number | null
          features?: Json | null
          gas_fee?: number | null
          id?: string
          initiated_at?: string | null
          innovation_score?: number | null
          innovative_features?: string[] | null
          is_first_token_today?: boolean | null
          optimization_features?: Json | null
          point_calculation_details?: Json | null
          points_awarded?: number | null
          points_calculated?: boolean | null
          token_address?: string | null
          token_description?: string | null
          token_name: string
          token_symbol: string
          token_type: string
          total_cost?: number | null
          total_supply: number
          type_bonus?: number | null
          verification_fee?: number | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          advanced_features?: Json | null
          base_points?: number | null
          bonding_curve_type?: string | null
          chain_bonus?: number | null
          chain_id?: number
          chain_name?: string
          complexity_bonus?: number | null
          creator_address?: string
          creator_token_count?: number | null
          curve_parameters?: Json | null
          daily_tasks_completed?: string[] | null
          decimals?: number | null
          deployed_at?: string | null
          deployment_fee?: number
          deployment_status?: string | null
          deployment_tx_hash?: string | null
          factory_address?: string
          feature_bonus?: number | null
          features?: Json | null
          gas_fee?: number | null
          id?: string
          initiated_at?: string | null
          innovation_score?: number | null
          innovative_features?: string[] | null
          is_first_token_today?: boolean | null
          optimization_features?: Json | null
          point_calculation_details?: Json | null
          points_awarded?: number | null
          points_calculated?: boolean | null
          token_address?: string | null
          token_description?: string | null
          token_name?: string
          token_symbol?: string
          token_type?: string
          total_cost?: number | null
          total_supply?: number
          type_bonus?: number | null
          verification_fee?: number | null
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: []
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
      user_creation_achievement_unlocks: {
        Row: {
          achievement_id: string
          achievement_progress: number
          creator_address: string
          id: string
          points_awarded: number
          trigger_token_address: string | null
          trigger_tx_hash: string | null
          unlocked_at: string | null
        }
        Insert: {
          achievement_id: string
          achievement_progress: number
          creator_address: string
          id?: string
          points_awarded: number
          trigger_token_address?: string | null
          trigger_tx_hash?: string | null
          unlocked_at?: string | null
        }
        Update: {
          achievement_id?: string
          achievement_progress?: number
          creator_address?: string
          id?: string
          points_awarded?: number
          trigger_token_address?: string | null
          trigger_tx_hash?: string | null
          unlocked_at?: string | null
        }
        Relationships: []
      }
      user_creator_stats: {
        Row: {
          achievement_points: number | null
          average_innovation_score: number | null
          bonding_curve_tokens: number | null
          creator_achievements: string[] | null
          creator_address: string
          creator_badges: string[] | null
          creator_experience: number | null
          creator_level: number | null
          current_creation_streak: number | null
          deflationary_tokens: number | null
          failed_deployments: number | null
          first_creation_at: string | null
          governance_tokens: number | null
          hft_tokens: number | null
          id: string
          innovation_points: number | null
          last_activity_at: string | null
          last_creation_date: string | null
          longest_creation_streak: number | null
          megaeth_tokens: number | null
          memecoins: number | null
          most_used_features: string[] | null
          pharos_tokens: number | null
          preferred_chain: string | null
          reflection_tokens: number | null
          risechain_tokens: number | null
          rwa_tokens: number | null
          standard_tokens: number | null
          streaming_tokens: number | null
          successful_deployments: number | null
          token_creation_points: number | null
          tokens_created_today: number | null
          total_creation_points: number | null
          total_deployment_cost_usd: number | null
          total_tokens_created: number | null
          updated_at: string | null
        }
        Insert: {
          achievement_points?: number | null
          average_innovation_score?: number | null
          bonding_curve_tokens?: number | null
          creator_achievements?: string[] | null
          creator_address: string
          creator_badges?: string[] | null
          creator_experience?: number | null
          creator_level?: number | null
          current_creation_streak?: number | null
          deflationary_tokens?: number | null
          failed_deployments?: number | null
          first_creation_at?: string | null
          governance_tokens?: number | null
          hft_tokens?: number | null
          id?: string
          innovation_points?: number | null
          last_activity_at?: string | null
          last_creation_date?: string | null
          longest_creation_streak?: number | null
          megaeth_tokens?: number | null
          memecoins?: number | null
          most_used_features?: string[] | null
          pharos_tokens?: number | null
          preferred_chain?: string | null
          reflection_tokens?: number | null
          risechain_tokens?: number | null
          rwa_tokens?: number | null
          standard_tokens?: number | null
          streaming_tokens?: number | null
          successful_deployments?: number | null
          token_creation_points?: number | null
          tokens_created_today?: number | null
          total_creation_points?: number | null
          total_deployment_cost_usd?: number | null
          total_tokens_created?: number | null
          updated_at?: string | null
        }
        Update: {
          achievement_points?: number | null
          average_innovation_score?: number | null
          bonding_curve_tokens?: number | null
          creator_achievements?: string[] | null
          creator_address?: string
          creator_badges?: string[] | null
          creator_experience?: number | null
          creator_level?: number | null
          current_creation_streak?: number | null
          deflationary_tokens?: number | null
          failed_deployments?: number | null
          first_creation_at?: string | null
          governance_tokens?: number | null
          hft_tokens?: number | null
          id?: string
          innovation_points?: number | null
          last_activity_at?: string | null
          last_creation_date?: string | null
          longest_creation_streak?: number | null
          megaeth_tokens?: number | null
          memecoins?: number | null
          most_used_features?: string[] | null
          pharos_tokens?: number | null
          preferred_chain?: string | null
          reflection_tokens?: number | null
          risechain_tokens?: number | null
          rwa_tokens?: number | null
          standard_tokens?: number | null
          streaming_tokens?: number | null
          successful_deployments?: number | null
          token_creation_points?: number | null
          tokens_created_today?: number | null
          total_creation_points?: number | null
          total_deployment_cost_usd?: number | null
          total_tokens_created?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_daily_creation_task_completions: {
        Row: {
          chains_used: string[] | null
          completed_at: string | null
          completion_tx_hash: string | null
          creator_address: string
          current_progress: number | null
          features_used: string[] | null
          id: string
          innovation_scores: number[] | null
          is_completed: boolean | null
          points_awarded: number
          required_progress: number
          task_date: string
          task_id: string
          token_types_created: string[] | null
          tokens_created_for_task: number | null
        }
        Insert: {
          chains_used?: string[] | null
          completed_at?: string | null
          completion_tx_hash?: string | null
          creator_address: string
          current_progress?: number | null
          features_used?: string[] | null
          id?: string
          innovation_scores?: number[] | null
          is_completed?: boolean | null
          points_awarded: number
          required_progress: number
          task_date: string
          task_id: string
          token_types_created?: string[] | null
          tokens_created_for_task?: number | null
        }
        Update: {
          chains_used?: string[] | null
          completed_at?: string | null
          completion_tx_hash?: string | null
          creator_address?: string
          current_progress?: number | null
          features_used?: string[] | null
          id?: string
          innovation_scores?: number[] | null
          is_completed?: boolean | null
          points_awarded?: number
          required_progress?: number
          task_date?: string
          task_id?: string
          token_types_created?: string[] | null
          tokens_created_for_task?: number | null
        }
        Relationships: []
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
      white_label_instances: {
        Row: {
          api_endpoints: Json | null
          branding_config: Json
          business_contact_email: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          created_at: string | null
          custom_domain: string | null
          enabled_features: Json
          feature_limits: Json | null
          go_live_date: string | null
          id: string
          instance_name: string
          monthly_fee: number | null
          partner_id: string
          partner_name: string
          revenue_share_percentage: number | null
          setup_fee: number | null
          status: string | null
          subdomain: string | null
          technical_contact_email: string | null
          updated_at: string | null
          webhook_urls: Json | null
        }
        Insert: {
          api_endpoints?: Json | null
          branding_config?: Json
          business_contact_email?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          custom_domain?: string | null
          enabled_features?: Json
          feature_limits?: Json | null
          go_live_date?: string | null
          id?: string
          instance_name: string
          monthly_fee?: number | null
          partner_id: string
          partner_name: string
          revenue_share_percentage?: number | null
          setup_fee?: number | null
          status?: string | null
          subdomain?: string | null
          technical_contact_email?: string | null
          updated_at?: string | null
          webhook_urls?: Json | null
        }
        Update: {
          api_endpoints?: Json | null
          branding_config?: Json
          business_contact_email?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          created_at?: string | null
          custom_domain?: string | null
          enabled_features?: Json
          feature_limits?: Json | null
          go_live_date?: string | null
          id?: string
          instance_name?: string
          monthly_fee?: number | null
          partner_id?: string
          partner_name?: string
          revenue_share_percentage?: number | null
          setup_fee?: number | null
          status?: string | null
          subdomain?: string | null
          technical_contact_email?: string | null
          updated_at?: string | null
          webhook_urls?: Json | null
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
