
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-contract-sizer");
require("hardhat-gas-reporter");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        enabled: false
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    // Multi-Chain DeFi Platform Networks
    megaeth: {
      url: process.env.MEGAETH_RPC_URL || "https://carrot.megaeth.com/rpc",
      chainId: 6342,
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000, // 1 gwei - optimized for speed
      timeout: 60000,
      confirmations: 1, // Fast finality on MegaETH
    },
    
    risechain: {
      url: process.env.RISECHAIN_RPC_URL || "https://testnet.riselabs.xyz",
      chainId: 11155931,
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000,
      timeout: 60000,
      confirmations: 1, // Shreds fast confirmation
    },
    
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.dev",
      chainId: 11155111,
      accounts: [PRIVATE_KEY],
      gasPrice: 20000000000, // 20 gwei
      timeout: 120000,
      confirmations: 2, // Standard Ethereum finality
    },
    
    // Legacy testnets (still supported)
    nexus: {
      url: process.env.NEXUS_RPC_URL || "https://rpc.testnet.nexus.xyz",
      chainId: 4242424,
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    zerog: {
      url: process.env.ZEROG_RPC_URL || "https://rpc-testnet.0g.ai",
      chainId: 16600,
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    somnia: {
      url: process.env.SOMNIA_RPC_URL || "https://rpc.testnet.somnia.network",
      chainId: 50311,
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000,
    }
  },
  
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
      megaeth: "abc", // Placeholder - update when available
      risechain: "abc", // Placeholder - update when available
    },
    customChains: [
      {
        network: "megaeth",
        chainId: 6342,
        urls: {
          apiURL: "https://api.testnet.megaeth.com/api",
          browserURL: "https://testnet.megaeth.com/"
        }
      },
      {
        network: "risechain", 
        chainId: 11155931,
        urls: {
          apiURL: "https://api.testnet.riselabs.xyz/api",
          browserURL: "https://explorer.testnet.riselabs.xyz"
        }
      }
    ]
  },
  
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  
  mocha: {
    timeout: 120000, // Increased for cross-chain tests
  },
  
  paths: {
    sources: "./templates",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  
  // DeFi platform specific settings
  defaultNetwork: "hardhat",
  
  // Tenderly configuration for debugging
  tenderly: {
    project: process.env.TENDERLY_PROJECT || "scryptex",
    username: process.env.TENDERLY_USERNAME || "scryptex",
  }
};
