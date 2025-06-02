
export interface AppConfig {
  // Server configuration
  port: number;
  nodeEnv: 'development' | 'staging' | 'production';
  apiVersion: string;
  
  // Security configuration
  cors: {
    origin: string[] | boolean;
    credentials: boolean;
    methods: string[];
  };
  
  // Rate limiting
  rateLimit: {
    windowMs: number;
    max: number;
    standardHeaders: boolean;
    legacyHeaders: boolean;
  };
  
  // Database configuration
  database: {
    url: string;
    maxConnections: number;
    ssl: boolean;
  };
  
  // Redis configuration
  redis: {
    url: string;
    maxRetriesPerRequest: number;
    retryDelayOnFailover: number;
  };
  
  // JWT configuration
  jwt: {
    secret: string;
    refreshSecret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
    issuer: string;
  };
  
  // Upload configuration
  upload: {
    maxFileSize: number;
    allowedMimeTypes: string[];
    uploadPath: string;
  };
  
  // Logging configuration
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    maxFiles: number;
    maxSize: string;
  };
}

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  wsUrl?: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isTestnet: boolean;
  isActive: boolean;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

export interface ServiceRegistry {
  authService: any;
  userService: any;
  databaseService: any;
  redisService: any;
  loggerService: any;
  
  // Future services (Phase 2+)
  blockchainService?: any;
  contractService?: any;
  tradingService?: any;
  priceOracleService?: any;
  pointsService?: any;
  socialService?: any;
  analyticsService?: any;
  aiService?: any;
}
