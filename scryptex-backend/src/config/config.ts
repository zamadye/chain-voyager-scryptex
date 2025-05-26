
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',

  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Blockchain RPCs
  blockchainRpcs: {
    ethereum: process.env.ETHEREUM_SEPOLIA_RPC || '',
    nexus: process.env.NEXUS_RPC || 'https://evm-rpc.nexus.xyz',
    zeroXG: process.env.ZEROXG_GALILEO_RPC || 'https://evmrpc-testnet.0g.ai',
    somnia: process.env.SOMNIA_SHANNON_RPC || 'https://testnet.somnia.network',
    aztec: process.env.AZTEC_TESTNET_RPC || 'https://rpc.aztec.network',
    risechain: process.env.RISECHAIN_RPC || 'https://rpc.testnet.risechain.io',
    r2: process.env.R2_TESTNET_RPC || 'https://rpc.testnet.r2.co',
    pharos: process.env.PHAROS_RPC || 'https://rpc.testnet.pharos.sh',
    megaeth: process.env.MEGAETH_RPC || 'https://rpc.testnet.megaeth.org',
  },

  // Web3
  privateKey: process.env.PRIVATE_KEY || '',
  gasLimitMultiplier: parseFloat(process.env.GAS_LIMIT_MULTIPLIER || '1.2'),
  gasPriceMultiplier: parseFloat(process.env.GAS_PRICE_MULTIPLIER || '1.1'),

  // External APIs
  coingeckoApiKey: process.env.COINGECKO_API_KEY || '',
  dexscreenerApiBase: process.env.DEXSCREENER_API_BASE || 'https://api.dexscreener.com/latest',
  chainlistApiBase: process.env.CHAINLIST_API_BASE || 'https://chainid.network/chains.json',

  // Queue
  queueRedisUrl: process.env.QUEUE_REDIS_URL || 'redis://localhost:6379',
  queueConcurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),

  // Monitoring
  logLevel: process.env.LOG_LEVEL || 'info',
  prometheusPort: parseInt(process.env.PROMETHEUS_PORT || '9090', 10),
  sentryDsn: process.env.SENTRY_DSN || '',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  uploadPath: process.env.UPLOAD_PATH || './uploads',

  // Email
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@scryptex.com',
  },

  // Admin
  adminEmail: process.env.ADMIN_EMAIL || 'admin@scryptex.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'change-this-password',
};

// Validate required configuration
const requiredConfigs = [
  'databaseUrl',
  'jwtSecret',
  'jwtRefreshSecret',
];

for (const configKey of requiredConfigs) {
  if (!config[configKey as keyof typeof config]) {
    throw new Error(`Missing required configuration: ${configKey}`);
  }
}

export default config;
