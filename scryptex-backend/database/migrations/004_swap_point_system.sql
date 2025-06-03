
-- Phase 4: Multi-Chain DEX Swap Integration with Point System
-- Database Schema for Swap Activities and Point Management

-- Swap transactions with point integration
CREATE TABLE swap_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address VARCHAR(42) NOT NULL,
  
  -- Swap details
  chain_id INTEGER NOT NULL,
  dex_name VARCHAR(20) NOT NULL, -- 'clober', 'gte', 'pharos_dex'
  dex_address VARCHAR(42) NOT NULL,
  
  -- Token information
  token_in VARCHAR(42) NOT NULL,
  token_out VARCHAR(42) NOT NULL,
  token_in_symbol VARCHAR(20) NOT NULL,
  token_out_symbol VARCHAR(20) NOT NULL,
  
  -- Swap amounts
  amount_in DECIMAL(36,18) NOT NULL,
  amount_out DECIMAL(36,18) NOT NULL,
  min_amount_out DECIMAL(36,18) NOT NULL,
  
  -- Swap execution details
  swap_type VARCHAR(20) NOT NULL, -- 'standard', 'realtime', 'rwa', 'hft'
  execution_price DECIMAL(36,18),
  price_impact DECIMAL(8,4), -- Percentage
  slippage DECIMAL(8,4), -- Percentage
  
  -- Transaction details
  tx_hash VARCHAR(66) UNIQUE,
  block_number BIGINT,
  gas_used BIGINT,
  gas_price DECIMAL(36,18),
  
  -- Fees
  trading_fee DECIMAL(36,18) NOT NULL,
  platform_fee DECIMAL(36,18) NOT NULL,
  gas_fee DECIMAL(36,18),
  total_cost DECIMAL(36,18),
  
  -- Status and timing
  swap_status VARCHAR(20) DEFAULT 'pending',
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE,
  
  -- Point system integration
  points_awarded INTEGER DEFAULT 0,
  points_calculated BOOLEAN DEFAULT FALSE,
  base_points INTEGER DEFAULT 5,
  bonus_points INTEGER DEFAULT 0,
  point_calculation_details JSONB DEFAULT '{}',
  
  -- Daily task integration
  daily_tasks_completed TEXT[] DEFAULT '{}',
  is_first_swap_today BOOLEAN DEFAULT FALSE,
  user_daily_swap_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User trading statistics and points
CREATE TABLE user_trading_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address VARCHAR(42) UNIQUE NOT NULL,
  
  -- Point balances
  total_trading_points INTEGER DEFAULT 0,
  swap_points INTEGER DEFAULT 0,
  bonus_points INTEGER DEFAULT 0,
  achievement_points INTEGER DEFAULT 0,
  
  -- Trading activity statistics
  total_swaps INTEGER DEFAULT 0,
  successful_swaps INTEGER DEFAULT 0,
  failed_swaps INTEGER DEFAULT 0,
  total_trading_volume_usd DECIMAL(36,8) DEFAULT 0,
  
  -- DEX-specific statistics
  clober_swaps INTEGER DEFAULT 0,
  gte_swaps INTEGER DEFAULT 0,
  pharos_dex_swaps INTEGER DEFAULT 0,
  
  -- Trading performance
  average_price_impact DECIMAL(8,4) DEFAULT 0,
  average_slippage DECIMAL(8,4) DEFAULT 0,
  profitable_trades INTEGER DEFAULT 0,
  
  -- Daily activity
  last_swap_date DATE,
  current_trading_streak INTEGER DEFAULT 0,
  longest_trading_streak INTEGER DEFAULT 0,
  swaps_today INTEGER DEFAULT 0,
  
  -- Trading level and achievements
  trading_level INTEGER DEFAULT 1,
  trading_experience INTEGER DEFAULT 0,
  achievements TEXT[] DEFAULT '{}',
  
  -- Timestamps
  first_swap_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily trading tasks
CREATE TABLE daily_trading_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Task definitions
  task_id VARCHAR(50) NOT NULL,
  task_name VARCHAR(100) NOT NULL,
  task_description TEXT NOT NULL,
  task_type VARCHAR(30) NOT NULL, -- 'swap_count', 'swap_volume', 'dex_variety', 'token_variety'
  
  -- Task requirements
  required_swaps INTEGER DEFAULT 1,
  required_volume_usd DECIMAL(36,8) DEFAULT 0,
  required_dexs INTEGER DEFAULT 1,
  required_tokens INTEGER DEFAULT 1,
  specific_dex VARCHAR(20),
  specific_token_pair VARCHAR(50),
  
  -- Rewards
  task_points INTEGER NOT NULL,
  bonus_multiplier DECIMAL(3,2) DEFAULT 1.0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(task_date, task_id)
);

-- User daily trading task completions
CREATE TABLE user_daily_trading_task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address VARCHAR(42) NOT NULL,
  task_date DATE NOT NULL,
  task_id VARCHAR(50) NOT NULL,
  
  -- Completion details
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_tx_hash VARCHAR(66),
  points_awarded INTEGER NOT NULL,
  
  -- Progress tracking
  current_progress INTEGER DEFAULT 0,
  current_volume_usd DECIMAL(36,8) DEFAULT 0,
  required_progress INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- Task-specific data
  dexs_used TEXT[] DEFAULT '{}',
  tokens_used TEXT[] DEFAULT '{}',
  
  UNIQUE(user_address, task_date, task_id)
);

-- Trading achievements
CREATE TABLE trading_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id VARCHAR(50) UNIQUE NOT NULL,
  
  -- Achievement details
  achievement_name VARCHAR(100) NOT NULL,
  achievement_description TEXT NOT NULL,
  achievement_category VARCHAR(30) NOT NULL, -- 'volume', 'frequency', 'variety', 'special'
  
  -- Requirements
  requirement_type VARCHAR(30) NOT NULL, -- 'total_swaps', 'total_volume', 'streak', 'special'
  requirement_value DECIMAL(36,8) NOT NULL,
  requirement_condition TEXT,
  
  -- Rewards
  achievement_points INTEGER NOT NULL,
  badge_icon VARCHAR(100),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User trading achievement unlocks
CREATE TABLE user_trading_achievement_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address VARCHAR(42) NOT NULL,
  achievement_id VARCHAR(50) NOT NULL,
  
  -- Unlock details
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trigger_tx_hash VARCHAR(66),
  points_awarded INTEGER NOT NULL,
  
  -- Achievement progress when unlocked
  achievement_progress DECIMAL(36,8) NOT NULL,
  
  UNIQUE(user_address, achievement_id)
);

-- Create indexes for optimal performance
CREATE INDEX idx_swap_user ON swap_transactions(user_address);
CREATE INDEX idx_swap_dex ON swap_transactions(dex_name);
CREATE INDEX idx_swap_status ON swap_transactions(swap_status);
CREATE INDEX idx_swap_points ON swap_transactions(points_awarded DESC);
CREATE INDEX idx_swap_date ON swap_transactions(executed_at);
CREATE INDEX idx_swap_pair ON swap_transactions(token_in, token_out);

CREATE INDEX idx_user_trading_points ON user_trading_stats(total_trading_points DESC);
CREATE INDEX idx_user_trading_volume ON user_trading_stats(total_trading_volume_usd DESC);
CREATE INDEX idx_user_trading_level ON user_trading_stats(trading_level DESC);
CREATE INDEX idx_user_trading_activity ON user_trading_stats(last_activity_at DESC);

CREATE INDEX idx_daily_trading_tasks_date ON daily_trading_tasks(task_date);
CREATE INDEX idx_daily_trading_tasks_active ON daily_trading_tasks(is_active);

CREATE INDEX idx_user_trading_task_completion ON user_daily_trading_task_completions(user_address, task_date);
CREATE INDEX idx_user_trading_task_points ON user_daily_trading_task_completions(points_awarded DESC);

CREATE INDEX idx_trading_achievements_category ON trading_achievements(achievement_category);
CREATE INDEX idx_trading_achievements_active ON trading_achievements(is_active);

CREATE INDEX idx_user_achievement_unlocks ON user_trading_achievement_unlocks(user_address);
CREATE INDEX idx_user_achievement_points ON user_trading_achievement_unlocks(points_awarded DESC);

-- Insert initial trading achievements
INSERT INTO trading_achievements (achievement_id, achievement_name, achievement_description, achievement_category, requirement_type, requirement_value, achievement_points, badge_icon) VALUES
('first_swap', 'First Swap', 'Complete your first token swap', 'milestone', 'total_swaps', 1, 10, '🔄'),
('volume_100', 'Volume Trader', 'Trade over $100 total volume', 'volume', 'total_volume', 100, 25, '💰'),
('multi_dex', 'Multi-DEX Trader', 'Trade on all 3 DEXs', 'variety', 'dex_count', 3, 50, '🌐'),
('day_trader', '5-Day Streak', 'Trade for 5 consecutive days', 'frequency', 'streak', 5, 30, '📈'),
('whale_trader', 'Whale Trader', 'Single swap over $1,000', 'volume', 'single_swap', 1000, 100, '🐋'),
('speed_demon', 'Speed Demon', 'Complete 10 real-time swaps', 'special', 'realtime_swaps', 10, 75, '⚡'),
('rwa_pioneer', 'RWA Pioneer', 'Complete 5 RWA token swaps', 'special', 'rwa_swaps', 5, 80, '🏛️');

-- Insert initial daily trading tasks
INSERT INTO daily_trading_tasks (task_id, task_name, task_description, task_type, required_swaps, task_points) VALUES
('daily_swap_1', 'First Swap of the Day', 'Complete your first swap today', 'swap_count', 1, 5),
('daily_swap_3', 'Active Trader', 'Complete 3 swaps today', 'swap_count', 3, 15),
('daily_volume_10', 'Volume Target', 'Trade $10 volume today', 'swap_volume', 0, 10),
('daily_dex_variety', 'DEX Explorer', 'Trade on 2 different DEXs today', 'dex_variety', 0, 20);
