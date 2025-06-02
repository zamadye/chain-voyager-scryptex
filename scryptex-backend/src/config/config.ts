import dotenv from 'dotenv';
import { ChainSDKConfig, GlobalPerformanceConfig } from '../types/blockchain';
import { AppConfig } from '../types/config';

dotenv.config();

// Enhanced configuration for Phase 2 blockchain integration
export const config: AppConfig & { blockchain: {
  supportedChains: {
    [chainId: number]: ChainSDKConfig;
  };
  defaultGasLimit: number;
  defaultGasPrice: string;
  contractDeploymentTimeout: number;
  privateKey?: string;
  performance: GlobalPerformanceConfig;
  };
  blockchainRpcs: {
    ethereum: string;
    nexus: string;
    zeroXG: string;
    somnia: string;
    risechain: string;
    megaeth: string;
    pharos: string;
  };
} = {
  // Server configuration
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: (process.env.NODE_ENV as any) || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  
  // Security configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/scryptex_dev',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    ssl: process.env.DB_SSL === 'true',
  },
  
  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
    retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100', 10),
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '1h',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'scryptex-api',
  },
  
  // Upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },
  
  // Logging configuration
  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
    maxSize: process.env.LOG_MAX_SIZE || '20m',
  },
  
  // Phase 2: Multi-chain SDK configuration
  blockchain: {
    // Enhanced chain configurations with SDK optimizations
    supportedChains: {
      // Ethereum Sepolia (Base layer for compatibility)
      11155111: {
        chainId: 11155111,
        name: "Ethereum Sepolia",
        displayName: "Sepolia Testnet",
        rpcUrl: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
        wsUrl: process.env.SEPOLIA_WS_URL || "wss://ws.sepolia.org",
        explorerUrl: "https://sepolia.etherscan.io",
        faucetUrl: "https://sepoliafaucet.com",
        nativeCurrency: {
          name: "Sepolia Ether",
          symbol: "SEP",
          decimals: 18
        },
        sdkType: "ethers" as const,
        sdkOptimizations: ["standard", "pos-optimized"],
        maxThroughput: 15,
        avgBlockTime: 12000,
        batchingSupport: true,
        parallelExecution: false,
        features: {
          zkCompatibility: false,
          aiIntegration: false,
          realTimeAPI: false,
          shredSupport: false,
          advancedOpcodes: [],
          customGasModel: false,
          parallelEVM: false
        },
        sdkConfig: {
          connectionPooling: {
            maxConnections: 20,
            idleTimeout: 30000,
            acquireTimeout: 60000
          },
          caching: {
            strategy: "standard",
            ttl: 300000,
            maxSize: 1000
          },
          retryStrategy: {
            maxRetries: 3,
            backoffMultiplier: 2,
            initialDelay: 1000
          },
          batchOptimization: {
            enabled: true,
            maxBatchSize: 100,
            batchTimeout: 1000
          }
        },
        isTestnet: true,
        isActive: true
      },

      // Nexus Testnet (zkVM + EVM hybrid)
      4242424: {
        chainId: 4242424,
        name: "Nexus Testnet",
        displayName: "Nexus zkVM Network",
        rpcUrl: process.env.NEXUS_RPC_URL || "https://rpc.testnet.nexus.xyz",
        wsUrl: process.env.NEXUS_WS_URL || "wss://ws.testnet.nexus.xyz",
        explorerUrl: "https://explorer.testnet.nexus.xyz",
        faucetUrl: "https://faucet.testnet.nexus.xyz",
        nativeCurrency: {
          name: "Nexus",
          symbol: "NEX",
          decimals: 18
        },
        sdkType: "viem" as const,
        sdkOptimizations: ["zkvm-optimized", "hybrid-execution"],
        maxThroughput: 1000,
        avgBlockTime: 1000,
        batchingSupport: true,
        parallelExecution: true,
        features: {
          zkCompatibility: true,
          aiIntegration: false,
          realTimeAPI: false,
          shredSupport: false,
          advancedOpcodes: ["zkproof", "zkverify"],
          customGasModel: true,
          parallelEVM: true
        },
        sdkConfig: {
          connectionPooling: {
            maxConnections: 50,
            idleTimeout: 15000,
            acquireTimeout: 30000
          },
          caching: {
            strategy: "aggressive",
            ttl: 60000,
            maxSize: 5000
          },
          retryStrategy: {
            maxRetries: 5,
            backoffMultiplier: 1.5,
            initialDelay: 500
          },
          batchOptimization: {
            enabled: true,
            maxBatchSize: 1000,
            batchTimeout: 100
          }
        },
        isTestnet: true,
        isActive: true
      },

      // 0G Network Testnet (AI-optimized)
      16600: {
        chainId: 16600,
        name: "0G Galileo Testnet",
        displayName: "0G AI Network",
        rpcUrl: process.env.ZERO_G_RPC_URL || "https://rpc-testnet.0g.ai",
        wsUrl: process.env.ZERO_G_WS_URL || "wss://ws-testnet.0g.ai",
        explorerUrl: "https://explorer-testnet.0g.ai",
        faucetUrl: "https://faucet.0g.ai",
        nativeCurrency: {
          name: "0G Token",
          symbol: "0G",
          decimals: 18
        },
        sdkType: "custom" as const,
        sdkOptimizations: ["ai-compute", "storage-optimized"],
        maxThroughput: 5000,
        avgBlockTime: 2000,
        batchingSupport: true,
        parallelExecution: true,
        features: {
          zkCompatibility: false,
          aiIntegration: true,
          realTimeAPI: false,
          shredSupport: false,
          advancedOpcodes: ["aicompute", "datastorage"],
          customGasModel: true,
          parallelEVM: false
        },
        sdkConfig: {
          connectionPooling: {
            maxConnections: 75,
            idleTimeout: 10000,
            acquireTimeout: 20000
          },
          caching: {
            strategy: "ai-optimized",
            ttl: 30000,
            maxSize: 10000
          },
          retryStrategy: {
            maxRetries: 7,
            backoffMultiplier: 1.2,
            initialDelay: 300
          },
          batchOptimization: {
            enabled: true,
            maxBatchSize: 2000,
            batchTimeout: 50
          }
        },
        isTestnet: true,
        isActive: true
      },

      // Somnia Shannon Testnet (1M+ TPS)
      50311: {
        chainId: 50311,
        name: "Somnia Shannon Testnet",
        displayName: "Somnia Dreamchain",
        rpcUrl: process.env.SOMNIA_RPC_URL || "https://rpc.testnet.somnia.network",
        wsUrl: process.env.SOMNIA_WS_URL || "wss://ws.testnet.somnia.network",
        explorerUrl: "https://explorer.testnet.somnia.network",
        faucetUrl: "https://faucet.testnet.somnia.network",
        nativeCurrency: {
          name: "Somnia",
          symbol: "SOM",
          decimals: 18
        },
        sdkType: "custom" as const,
        sdkOptimizations: ["ultra-high-throughput", "icedb-optimized"],
        maxThroughput: 1000000,
        avgBlockTime: 100,
        batchingSupport: true,
        parallelExecution: true,
        features: {
          zkCompatibility: false,
          aiIntegration: false,
          realTimeAPI: true,
          shredSupport: false,
          advancedOpcodes: ["reactive", "multistream"],
          customGasModel: true,
          parallelEVM: true
        },
        sdkConfig: {
          connectionPooling: {
            maxConnections: 200,
            idleTimeout: 5000,
            acquireTimeout: 10000
          },
          caching: {
            strategy: "ultra-aggressive",
            ttl: 10000,
            maxSize: 50000
          },
          retryStrategy: {
            maxRetries: 10,
            backoffMultiplier: 1.1,
            initialDelay: 100
          },
          batchOptimization: {
            enabled: true,
            maxBatchSize: 10000,
            batchTimeout: 10
          }
        },
        isTestnet: true,
        isActive: true
      },

      // RiseChain Testnet (Parallel EVM + Shreds)
      11155931: {
        chainId: 11155931,
        name: "RiseChain Testnet",
        displayName: "RiseChain ParallelEVM",
        rpcUrl: process.env.RISECHAIN_RPC_URL || "https://testnet.riselabs.xyz",
        wsUrl: process.env.RISECHAIN_WS_URL || "wss://ws.testnet.riselabs.xyz",
        explorerUrl: "https://explorer.testnet.riselabs.xyz",
        faucetUrl: "https://faucet.testnet.riselabs.xyz",
        nativeCurrency: {
          name: "RiseChain",
          symbol: "RISE",
          decimals: 18
        },
        sdkType: "custom" as const,
        sdkOptimizations: ["parallel-execution", "shred-technology"],
        maxThroughput: 100000,
        avgBlockTime: 10,
        batchingSupport: true,
        parallelExecution: true,
        features: {
          zkCompatibility: false,
          aiIntegration: false,
          realTimeAPI: false,
          shredSupport: true,
          advancedOpcodes: ["parallel", "shred"],
          customGasModel: true,
          parallelEVM: true
        },
        sdkConfig: {
          connectionPooling: {
            maxConnections: 100,
            idleTimeout: 5000,
            acquireTimeout: 15000
          },
          caching: {
            strategy: "parallel-optimized",
            ttl: 15000,
            maxSize: 25000
          },
          retryStrategy: {
            maxRetries: 8,
            backoffMultiplier: 1.3,
            initialDelay: 200
          },
          batchOptimization: {
            enabled: true,
            maxBatchSize: 5000,
            batchTimeout: 20
          }
        },
        isTestnet: true,
        isActive: true
      },

      // MegaETH Testnet (Real-time blockchain)
      6342: {
        chainId: 6342,
        name: "MegaETH Testnet",
        displayName: "MegaETH Real-time",
        rpcUrl: process.env.MEGAETH_RPC_URL || "https://6342.rpc.thirdweb.com",
        wsUrl: process.env.MEGAETH_WS_URL || "wss://6342.ws.thirdweb.com",
        explorerUrl: "https://testnet.megaeth.com",
        faucetUrl: "https://faucets.chain.link/megaeth-testnet",
        nativeCurrency: {
          name: "MegaETH",
          symbol: "METH",
          decimals: 18
        },
        sdkType: "custom" as const,
        sdkOptimizations: ["real-time-api", "minimal-latency"],
        maxThroughput: 10000,
        avgBlockTime: 10,
        batchingSupport: true,
        parallelExecution: false,
        features: {
          zkCompatibility: false,
          aiIntegration: false,
          realTimeAPI: true,
          shredSupport: false,
          advancedOpcodes: ["realtime", "preconfirm"],
          customGasModel: false,
          parallelEVM: false
        },
        sdkConfig: {
          connectionPooling: {
            maxConnections: 150,
            idleTimeout: 2000,
            acquireTimeout: 5000
          },
          caching: {
            strategy: "real-time",
            ttl: 5000,
            maxSize: 15000
          },
          retryStrategy: {
            maxRetries: 5,
            backoffMultiplier: 1.1,
            initialDelay: 50
          },
          batchOptimization: {
            enabled: true,
            maxBatchSize: 1000,
            batchTimeout: 5
          }
        },
        isTestnet: true,
        isActive: true
      },

      // Pharos Testnet (RWA-optimized)
      9999: {
        chainId: 9999,
        name: "Pharos Testnet",
        displayName: "Pharos RWA Network",
        rpcUrl: process.env.PHAROS_RPC_URL || "https://rpc.testnet.pharos.sh",
        wsUrl: process.env.PHAROS_WS_URL || "wss://ws.testnet.pharos.sh",
        explorerUrl: "https://explorer.testnet.pharos.sh",
        faucetUrl: "https://faucet.testnet.pharos.sh",
        nativeCurrency: {
          name: "Pharos",
          symbol: "PHR",
          decimals: 18
        },
        sdkType: "ethers" as const,
        sdkOptimizations: ["rwa-compliance", "enterprise-grade"],
        maxThroughput: 2000,
        avgBlockTime: 3000,
        batchingSupport: true,
        parallelExecution: false,
        features: {
          zkCompatibility: true,
          aiIntegration: true,
          realTimeAPI: false,
          shredSupport: false,
          advancedOpcodes: ["zkkyc", "compliance"],
          customGasModel: true,
          parallelEVM: false
        },
        sdkConfig: {
          connectionPooling: {
            maxConnections: 30,
            idleTimeout: 20000,
            acquireTimeout: 45000
          },
          caching: {
            strategy: "compliance-aware",
            ttl: 120000,
            maxSize: 3000
          },
          retryStrategy: {
            maxRetries: 3,
            backoffMultiplier: 2.0,
            initialDelay: 1000
          },
          batchOptimization: {
            enabled: true,
            maxBatchSize: 200,
            batchTimeout: 500
          }
        },
        isTestnet: true,
        isActive: true
      }
    } as const,

    // Default configurations
    defaultGasLimit: 2000000,
    defaultGasPrice: "20000000000", // 20 gwei
    contractDeploymentTimeout: 300000, // 5 minutes
    
    // Private key for contract deployment (should be set via environment)
    privateKey: process.env.PRIVATE_KEY,
    
    // Performance configuration
    performance: {
      connectionPools: {
        maxConnections: 100,
        idleTimeout: 30000,
        acquireTimeout: 60000
      },
      caching: {
        strategy: "multi-tier",
        l1Cache: "memory",
        l2Cache: "redis",
        ttl: 300000
      },
      batching: {
        enabled: true,
        maxBatchSize: 1000,
        batchTimeout: 100,
        intelligentBatching: true
      },
      rateLimiting: {
        requestsPerSecond: 1000,
        burstCapacity: 5000,
        adaptiveRateLimiting: true
      },
      monitoring: {
        metricsInterval: 1000,
        alertThresholds: {
          latency: 5000,
          errorRate: 0.05,
          throughput: 100
        }
      }
    } as GlobalPerformanceConfig
  },

  // Enhanced RPC URLs for multi-chain support
  blockchainRpcs: {
    ethereum: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org",
    nexus: process.env.NEXUS_RPC_URL || "https://rpc.testnet.nexus.xyz",
    zeroXG: process.env.ZERO_G_RPC_URL || "https://rpc-testnet.0g.ai",
    somnia: process.env.SOMNIA_RPC_URL || "https://rpc.testnet.somnia.network",
    risechain: process.env.RISECHAIN_RPC_URL || "https://testnet.riselabs.xyz",
    megaeth: process.env.MEGAETH_RPC_URL || "https://6342.rpc.thirdweb.com",
    pharos: process.env.PHAROS_RPC_URL || "https://rpc.testnet.pharos.sh"
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config;
