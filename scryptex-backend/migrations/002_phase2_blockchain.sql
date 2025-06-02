
-- Phase 2: Multi-Chain SDK Integration Database Schema

-- Enhanced chain management
CREATE TABLE IF NOT EXISTS chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id INTEGER NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  rpc_url VARCHAR(500) NOT NULL,
  ws_url VARCHAR(500),
  explorer_url VARCHAR(500) NOT NULL,
  faucet_url VARCHAR(500),
  native_currency JSONB NOT NULL,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  is_testnet BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chain status tracking
CREATE TABLE IF NOT EXISTS chain_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id INTEGER NOT NULL REFERENCES chains(chain_id),
  block_height BIGINT DEFAULT 0,
  gas_price DECIMAL(20,0) DEFAULT 0,
  is_healthy BOOLEAN DEFAULT TRUE,
  rpc_latency INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avg_block_time INTEGER DEFAULT 12000,
  network_congestion VARCHAR(20) DEFAULT 'LOW',
  UNIQUE(chain_id)
);

-- Chain health monitoring logs
CREATE TABLE IF NOT EXISTS chain_health_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id INTEGER NOT NULL,
  is_healthy BOOLEAN NOT NULL,
  issues TEXT[],
  recommendations TEXT[],
  metrics JSONB,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics tracking
CREATE TABLE IF NOT EXISTS chain_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  latency INTEGER NOT NULL,
  throughput DECIMAL(10,2) DEFAULT 0,
  error_rate DECIMAL(5,4) DEFAULT 0,
  gas_price_standard DECIMAL(20,0) DEFAULT 0,
  health_score INTEGER DEFAULT 100,
  custom_metrics JSONB DEFAULT '{}'
);

-- User chain preferences (for future use)
CREATE TABLE IF NOT EXISTS user_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chain_id INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  priority_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, chain_id)
);

-- Contract deployments tracking (Phase 2 preparation)
CREATE TABLE IF NOT EXISTS contract_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  chain_id INTEGER NOT NULL,
  template_id VARCHAR(100),
  contract_address VARCHAR(42),
  transaction_hash VARCHAR(66) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  gas_used DECIMAL(20,0),
  deployment_cost DECIMAL(30,0),
  block_number BIGINT,
  parameters JSONB,
  gas_settings JSONB,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_details JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cross-chain transactions (Phase 2 preparation)
CREATE TABLE IF NOT EXISTS cross_chain_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  source_chain_id INTEGER NOT NULL,
  target_chain_id INTEGER NOT NULL,
  source_tx_hash VARCHAR(66),
  target_tx_hash VARCHAR(66),
  bridge_tx_hash VARCHAR(66),
  status VARCHAR(20) DEFAULT 'pending',
  operation_type VARCHAR(50) NOT NULL,
  amount DECIMAL(30,0),
  fees DECIMAL(30,0),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chains_chain_id ON chains(chain_id);
CREATE INDEX IF NOT EXISTS idx_chains_active ON chains(is_active);
CREATE INDEX IF NOT EXISTS idx_chain_status_chain_id ON chain_status(chain_id);
CREATE INDEX IF NOT EXISTS idx_chain_status_healthy ON chain_status(is_healthy);
CREATE INDEX IF NOT EXISTS idx_chain_health_logs_chain_id ON chain_health_logs(chain_id);
CREATE INDEX IF NOT EXISTS idx_chain_health_logs_timestamp ON chain_health_logs(checked_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_chain_id ON chain_performance_metrics(chain_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON chain_performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_chains_user_id ON user_chains(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chains_active ON user_chains(is_active);
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON contract_deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_chain_id ON contract_deployments(chain_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON contract_deployments(status);
CREATE INDEX IF NOT EXISTS idx_cross_chain_user_id ON cross_chain_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_cross_chain_status ON cross_chain_transactions(status);

-- Insert supported chains configuration
INSERT INTO chains (chain_id, name, display_name, rpc_url, explorer_url, faucet_url, native_currency, features, is_testnet) VALUES
(11155111, 'Ethereum Sepolia', 'Sepolia Testnet', 'https://rpc.sepolia.org', 'https://sepolia.etherscan.io', 'https://sepoliafaucet.com', 
 '{"name": "Sepolia Ether", "symbol": "SEP", "decimals": 18}', 
 '{"zkCompatibility": false, "aiIntegration": false, "realTimeAPI": false, "shredSupport": false, "parallelEVM": false}', true),

(4242424, 'Nexus Testnet', 'Nexus zkVM Network', 'https://rpc.testnet.nexus.xyz', 'https://explorer.testnet.nexus.xyz', 'https://faucet.testnet.nexus.xyz',
 '{"name": "Nexus", "symbol": "NEX", "decimals": 18}',
 '{"zkCompatibility": true, "aiIntegration": false, "realTimeAPI": false, "shredSupport": false, "parallelEVM": true}', true),

(16600, '0G Galileo Testnet', '0G AI Network', 'https://rpc-testnet.0g.ai', 'https://explorer-testnet.0g.ai', 'https://faucet.0g.ai',
 '{"name": "0G Token", "symbol": "0G", "decimals": 18}',
 '{"zkCompatibility": false, "aiIntegration": true, "realTimeAPI": false, "shredSupport": false, "parallelEVM": false}', true),

(50311, 'Somnia Shannon Testnet', 'Somnia Dreamchain', 'https://rpc.testnet.somnia.network', 'https://explorer.testnet.somnia.network', 'https://faucet.testnet.somnia.network',
 '{"name": "Somnia", "symbol": "SOM", "decimals": 18}',
 '{"zkCompatibility": false, "aiIntegration": false, "realTimeAPI": true, "shredSupport": false, "parallelEVM": true}', true),

(11155931, 'RiseChain Testnet', 'RiseChain ParallelEVM', 'https://testnet.riselabs.xyz', 'https://explorer.testnet.riselabs.xyz', 'https://faucet.testnet.riselabs.xyz',
 '{"name": "RiseChain", "symbol": "RISE", "decimals": 18}',
 '{"zkCompatibility": false, "aiIntegration": false, "realTimeAPI": false, "shredSupport": true, "parallelEVM": true}', true),

(6342, 'MegaETH Testnet', 'MegaETH Real-time', 'https://6342.rpc.thirdweb.com', 'https://testnet.megaeth.com', 'https://faucets.chain.link/megaeth-testnet',
 '{"name": "MegaETH", "symbol": "METH", "decimals": 18}',
 '{"zkCompatibility": false, "aiIntegration": false, "realTimeAPI": true, "shredSupport": false, "parallelEVM": false}', true),

(9999, 'Pharos Testnet', 'Pharos RWA Network', 'https://rpc.testnet.pharos.sh', 'https://explorer.testnet.pharos.sh', 'https://faucet.testnet.pharos.sh',
 '{"name": "Pharos", "symbol": "PHR", "decimals": 18}',
 '{"zkCompatibility": true, "aiIntegration": true, "realTimeAPI": false, "shredSupport": false, "parallelEVM": false}', true)

ON CONFLICT (chain_id) DO UPDATE SET
  name = EXCLUDED.name,
  display_name = EXCLUDED.display_name,
  rpc_url = EXCLUDED.rpc_url,
  explorer_url = EXCLUDED.explorer_url,
  faucet_url = EXCLUDED.faucet_url,
  native_currency = EXCLUDED.native_currency,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Initialize chain status for all chains
INSERT INTO chain_status (chain_id) 
SELECT chain_id FROM chains 
ON CONFLICT (chain_id) DO NOTHING;
