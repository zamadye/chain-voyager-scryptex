
-- SCRYPTEX Backend Database Schema - Phase 1
-- Initial schema for authentication and user management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Management Schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255) UNIQUE,
  avatar_url VARCHAR(500),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referral_code VARCHAR(10) UNIQUE NOT NULL,
  referred_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
  CONSTRAINT valid_username CHECK (username ~* '^[A-Za-z0-9_]{3,50}$'),
  CONSTRAINT valid_referral_code CHECK (referral_code ~* '^STEX-[A-Z0-9]{6}$')
);

-- Multi-wallet Support
CREATE TABLE user_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL UNIQUE,
  wallet_type VARCHAR(20) NOT NULL, -- metamask, walletconnect, coinbase, etc.
  chain_id INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  nickname VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_wallet_address CHECK (wallet_address ~* '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT valid_wallet_type CHECK (wallet_type IN ('metamask', 'walletconnect', 'coinbase', 'other')),
  CONSTRAINT positive_chain_id CHECK (chain_id > 0)
);

-- Ensure only one primary wallet per user
CREATE UNIQUE INDEX idx_user_primary_wallet ON user_wallets(user_id, is_primary) WHERE is_primary = true;

-- Session Management
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  refresh_token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_session_wallet_address CHECK (wallet_address ~* '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT future_expiry CHECK (expires_at > created_at)
);

-- Audit Trail
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_action CHECK (action != ''),
  CONSTRAINT valid_resource_type CHECK (resource_type != '')
);

-- User preferences and settings (extensible)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preference_key VARCHAR(100) NOT NULL,
  preference_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, preference_key)
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_referred_by ON users(referred_by) WHERE referred_by IS NOT NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX idx_user_wallets_address ON user_wallets(wallet_address);
CREATE INDEX idx_user_wallets_type ON user_wallets(wallet_type);
CREATE INDEX idx_user_wallets_chain_id ON user_wallets(chain_id) WHERE chain_id IS NOT NULL;
CREATE INDEX idx_user_wallets_primary ON user_wallets(is_primary) WHERE is_primary = true;

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_wallet ON user_sessions(wallet_address);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_key ON user_preferences(preference_key);

-- Functions for automatic referral code generation
CREATE OR REPLACE FUNCTION generate_referral_code() 
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    code := 'STEX-' || UPPER(substring(encode(gen_random_bytes(4), 'hex') from 1 for 6));
    
    SELECT COUNT(*) INTO exists_check FROM users WHERE referral_code = code;
    
    IF exists_check = 0 THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral codes
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_referral_code
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_referral_code();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  old_values JSONB;
  new_values JSONB;
BEGIN
  -- Extract user_id if available
  user_id_val := NULL;
  IF TG_OP = 'DELETE' THEN
    user_id_val := OLD.user_id;
    old_values := to_jsonb(OLD);
    new_values := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    user_id_val := NEW.user_id;
    old_values := to_jsonb(OLD);
    new_values := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    user_id_val := NEW.user_id;
    old_values := NULL;
    new_values := to_jsonb(NEW);
  END IF;

  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    user_id_val,
    TG_OP,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
      ELSE NEW.id::TEXT
    END,
    old_values,
    new_values
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to relevant tables
CREATE TRIGGER trigger_audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER trigger_audit_user_wallets
  AFTER INSERT OR UPDATE OR DELETE ON user_wallets
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Row Level Security (RLS) setup for future multi-tenancy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Views for common queries
CREATE VIEW active_users AS
SELECT 
  u.*,
  COUNT(uw.id) as wallet_count,
  COUNT(CASE WHEN uw.is_primary THEN 1 END) as primary_wallet_count,
  COUNT(referrals.id) as referral_count
FROM users u
LEFT JOIN user_wallets uw ON u.id = uw.user_id
LEFT JOIN users referrals ON u.id = referrals.referred_by
WHERE u.is_active = true
GROUP BY u.id;

CREATE VIEW user_session_summary AS
SELECT 
  us.*,
  u.username,
  u.email,
  uw.wallet_type,
  uw.chain_id
FROM user_sessions us
JOIN users u ON us.user_id = u.id
LEFT JOIN user_wallets uw ON us.wallet_address = uw.wallet_address
WHERE us.is_active = true AND us.expires_at > NOW();

-- Comments for documentation
COMMENT ON TABLE users IS 'Core user accounts with wallet-based authentication';
COMMENT ON TABLE user_wallets IS 'Multi-wallet support for each user account';
COMMENT ON TABLE user_sessions IS 'JWT session management with refresh tokens';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all user actions';
COMMENT ON TABLE user_preferences IS 'Extensible user preferences and settings';

COMMENT ON COLUMN users.referral_code IS 'Unique referral code for user referral system';
COMMENT ON COLUMN user_wallets.is_primary IS 'Indicates the primary wallet for transactions';
COMMENT ON COLUMN user_sessions.expires_at IS 'Token expiration timestamp';
COMMENT ON COLUMN audit_logs.old_values IS 'JSONB snapshot of data before change';
COMMENT ON COLUMN audit_logs.new_values IS 'JSONB snapshot of data after change';

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO scryptex_app;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO scryptex_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO scryptex_app;
