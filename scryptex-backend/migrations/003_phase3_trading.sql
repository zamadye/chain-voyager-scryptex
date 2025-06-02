
-- Phase 3: Advanced Trading Engine & Cross-Chain DEX Platform
-- Migration for comprehensive trading infrastructure

-- Tokens registry
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_address VARCHAR(42) NOT NULL,
  chain_id INTEGER NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  decimals INTEGER NOT NULL DEFAULT 18,
  logo_url VARCHAR(500),
  coingecko_id VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  is_stable BOOLEAN DEFAULT FALSE,
  total_supply DECIMAL(78,0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contract_address, chain_id)
);

-- Trading pairs and markets
CREATE TABLE trading_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_token_id UUID NOT NULL REFERENCES tokens(id),
  quote_token_id UUID NOT NULL REFERENCES tokens(id),
  chain_id INTEGER NOT NULL,
  dex_address VARCHAR(42),
  dex_name VARCHAR(50) NOT NULL,
  dex_version VARCHAR(10) DEFAULT 'v2',
  fee_tier INTEGER DEFAULT 3000,
  tick_spacing INTEGER,
  price_oracle VARCHAR(42),
  min_trade_size DECIMAL(36,18) DEFAULT 0,
  max_trade_size DECIMAL(36,18),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(base_token_id, quote_token_id, chain_id, dex_name)
);

-- Order management
CREATE TABLE trading_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  pair_id UUID NOT NULL REFERENCES trading_pairs(id),
  order_type VARCHAR(20) NOT NULL,
  side VARCHAR(4) NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity DECIMAL(36,18) NOT NULL,
  price DECIMAL(36,18),
  filled_quantity DECIMAL(36,18) DEFAULT 0,
  average_price DECIMAL(36,18),
  status VARCHAR(20) DEFAULT 'pending',
  time_in_force VARCHAR(10) DEFAULT 'GTC',
  
  -- Advanced order parameters
  stop_price DECIMAL(36,18),
  trailing_amount DECIMAL(36,18),
  trigger_condition JSONB,
  execution_instructions JSONB,
  
  -- MEV protection
  mev_protection_level VARCHAR(20) DEFAULT 'basic',
  private_mempool BOOLEAN DEFAULT FALSE,
  fair_ordering BOOLEAN DEFAULT TRUE,
  max_slippage DECIMAL(5,4) DEFAULT 0.005,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  filled_at TIMESTAMP WITH TIME ZONE,
  
  -- Blockchain data
  transaction_hash VARCHAR(66),
  block_number BIGINT,
  gas_used INTEGER,
  gas_price DECIMAL(36,0)
);

-- Trade executions
CREATE TABLE trade_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES trading_orders(id),
  pair_id UUID NOT NULL REFERENCES trading_pairs(id),
  side VARCHAR(4) NOT NULL,
  quantity DECIMAL(36,18) NOT NULL,
  price DECIMAL(36,18) NOT NULL,
  fee DECIMAL(36,18) NOT NULL,
  fee_token_id UUID REFERENCES tokens(id),
  
  -- Execution details
  execution_type VARCHAR(20) NOT NULL,
  liquidity_type VARCHAR(10),
  dex_name VARCHAR(50),
  route_path JSONB,
  
  -- MEV data
  mev_detected BOOLEAN DEFAULT FALSE,
  mev_type VARCHAR(20),
  protection_used VARCHAR(20),
  
  -- Blockchain data
  transaction_hash VARCHAR(66) NOT NULL,
  block_number BIGINT NOT NULL,
  transaction_index INTEGER,
  log_index INTEGER,
  gas_used INTEGER,
  
  -- Timing data
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmation_time INTEGER
);

-- Liquidity pools
CREATE TABLE liquidity_pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pair_id UUID NOT NULL REFERENCES trading_pairs(id),
  pool_address VARCHAR(42) NOT NULL,
  dex_name VARCHAR(50) NOT NULL,
  pool_type VARCHAR(20) NOT NULL,
  
  -- Pool parameters
  fee DECIMAL(10,6) NOT NULL,
  tick_lower INTEGER,
  tick_upper INTEGER,
  sqrt_price_x96 DECIMAL(78,0),
  
  -- Liquidity data
  reserve0 DECIMAL(36,18),
  reserve1 DECIMAL(36,18),
  total_liquidity DECIMAL(36,18),
  
  -- Performance metrics
  volume_24h DECIMAL(36,18) DEFAULT 0,
  fees_24h DECIMAL(36,18) DEFAULT 0,
  apy DECIMAL(8,4),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(pool_address, dex_name)
);

-- Portfolio tracking
CREATE TABLE user_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  chain_id INTEGER NOT NULL,
  
  -- Portfolio metrics
  total_value_usd DECIMAL(36,18) DEFAULT 0,
  unrealized_pnl DECIMAL(36,18) DEFAULT 0,
  realized_pnl DECIMAL(36,18) DEFAULT 0,
  total_fees_paid DECIMAL(36,18) DEFAULT 0,
  
  -- Risk metrics
  var_95 DECIMAL(36,18),
  sharpe_ratio DECIMAL(8,4),
  max_drawdown DECIMAL(8,4),
  
  -- Last update
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, chain_id)
);

-- Position tracking
CREATE TABLE trading_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  token_id UUID NOT NULL REFERENCES tokens(id),
  chain_id INTEGER NOT NULL,
  
  -- Position data
  quantity DECIMAL(36,18) NOT NULL,
  average_cost DECIMAL(36,18) NOT NULL,
  current_price DECIMAL(36,18),
  unrealized_pnl DECIMAL(36,18),
  
  -- Risk parameters
  stop_loss_price DECIMAL(36,18),
  take_profit_price DECIMAL(36,18),
  position_size_limit DECIMAL(36,18),
  
  -- Timestamps
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, token_id, chain_id)
);

-- Price feeds and oracles
CREATE TABLE price_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id UUID NOT NULL REFERENCES tokens(id),
  price_usd DECIMAL(36,18) NOT NULL,
  price_source VARCHAR(50) NOT NULL,
  confidence DECIMAL(5,4) DEFAULT 1.0,
  volume_24h DECIMAL(36,18),
  market_cap DECIMAL(36,18),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_price_feeds_token_time (token_id, timestamp),
  INDEX idx_price_feeds_source (price_source)
);

-- Trading algorithms
CREATE TABLE trading_algorithms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  strategy_type VARCHAR(50) NOT NULL,
  parameters JSONB NOT NULL,
  risk_limits JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'created',
  
  -- Performance tracking
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  total_pnl DECIMAL(36,18) DEFAULT 0,
  max_drawdown DECIMAL(8,4) DEFAULT 0,
  sharpe_ratio DECIMAL(8,4),
  
  -- Execution settings
  preferred_chains INTEGER[] DEFAULT '{}',
  cross_chain_enabled BOOLEAN DEFAULT FALSE,
  max_position_size DECIMAL(36,18),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_executed TIMESTAMP WITH TIME ZONE
);

-- MEV protection logs
CREATE TABLE mev_protection_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES trading_orders(id),
  transaction_hash VARCHAR(66),
  mev_type VARCHAR(50),
  detection_confidence DECIMAL(5,4),
  protection_applied VARCHAR(50),
  potential_loss DECIMAL(36,18),
  actual_loss DECIMAL(36,18),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Arbitrage opportunities
CREATE TABLE arbitrage_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_pair VARCHAR(50) NOT NULL,
  source_chain INTEGER NOT NULL,
  target_chain INTEGER NOT NULL,
  source_dex VARCHAR(50) NOT NULL,
  target_dex VARCHAR(50) NOT NULL,
  price_difference DECIMAL(8,4) NOT NULL,
  potential_profit DECIMAL(36,18) NOT NULL,
  status VARCHAR(20) DEFAULT 'detected',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cross-chain bridge transactions
CREATE TABLE bridge_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  source_chain INTEGER NOT NULL,
  target_chain INTEGER NOT NULL,
  token_id UUID NOT NULL REFERENCES tokens(id),
  amount DECIMAL(36,18) NOT NULL,
  
  -- Transaction hashes
  source_tx_hash VARCHAR(66),
  target_tx_hash VARCHAR(66),
  
  -- Bridge details
  bridge_protocol VARCHAR(50) NOT NULL,
  fees DECIMAL(36,18),
  estimated_time INTEGER,
  actual_time INTEGER,
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Extend users table for trading features
ALTER TABLE users ADD COLUMN IF NOT EXISTS trading_tier VARCHAR(20) DEFAULT 'basic';
ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_tolerance VARCHAR(20) DEFAULT 'medium';
ALTER TABLE users ADD COLUMN IF NOT EXISTS trading_preferences JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trading_volume_30d DECIMAL(36,18) DEFAULT 0;

-- Extend user_wallets for trading
ALTER TABLE user_wallets ADD COLUMN IF NOT EXISTS trading_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE user_wallets ADD COLUMN IF NOT EXISTS daily_trade_limit DECIMAL(36,18);
ALTER TABLE user_wallets ADD COLUMN IF NOT EXISTS mev_protection_enabled BOOLEAN DEFAULT TRUE;

-- Create indexes for performance
CREATE INDEX idx_trading_orders_user_status ON trading_orders(user_id, status);
CREATE INDEX idx_trading_orders_pair_side ON trading_orders(pair_id, side);
CREATE INDEX idx_trading_orders_created_at ON trading_orders(created_at);
CREATE INDEX idx_trading_orders_price ON trading_orders(pair_id, price) WHERE status = 'open';

CREATE INDEX idx_trade_executions_order ON trade_executions(order_id);
CREATE INDEX idx_trade_executions_pair_time ON trade_executions(pair_id, executed_at);
CREATE INDEX idx_trade_executions_tx ON trade_executions(transaction_hash);

CREATE INDEX idx_trading_positions_user_chain ON trading_positions(user_id, chain_id);
CREATE INDEX idx_liquidity_pools_pair ON liquidity_pools(pair_id);
CREATE INDEX idx_user_portfolios_user ON user_portfolios(user_id);

-- Create partitions for high-volume tables (optional, for production scaling)
-- This would be done in production for better performance
-- CREATE TABLE trade_executions_y2024m01 PARTITION OF trade_executions
-- FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
