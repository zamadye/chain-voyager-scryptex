
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
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Testnets
    nexus: {
      url: process.env.NEXUS_RPC_URL || "https://rpc.testnet.nexus.xyz",
      chainId: 4242424,
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000, // 1 gwei
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
    },
    aztec: {
      url: process.env.AZTEC_RPC_URL || "https://rpc.testnet.aztec.network",
      chainId: 677868,
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    risechain: {
      url: process.env.RISECHAIN_RPC_URL || "https://rpc.testnet.risechain.io",
      chainId: 5555555,
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    megaeth: {
      url: process.env.MEGAETH_RPC_URL || "https://rpc.testnet.megaeth.org",
      chainId: 12345,
      accounts: [PRIVATE_KEY],
      gasPrice: 1000000000,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/your-key",
      chainId: 11155111,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
      // Add other explorer API keys as needed
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  mocha: {
    timeout: 40000,
  },
  paths: {
    sources: "./templates",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
