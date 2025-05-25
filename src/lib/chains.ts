
import { ChainConfig } from '@/types';

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  nexus: {
    id: 4242424,
    name: "Nexus Testnet",
    rpcUrl: "https://rpc.testnet.nexus.xyz",
    blockExplorer: "https://explorer.testnet.nexus.xyz",
    faucetUrl: "https://faucet.testnet.nexus.xyz",
    nativeCurrency: {
      name: "Nexus",
      symbol: "NXS",
      decimals: 18,
    },
    testnet: true,
  },
  zeroxg: {
    id: 16600,
    name: "0G Galileo Testnet", 
    rpcUrl: "https://rpc-testnet.0g.ai",
    blockExplorer: "https://explorer-testnet.0g.ai",
    faucetUrl: "https://faucet.0g.ai",
    nativeCurrency: {
      name: "0G",
      symbol: "0G",
      decimals: 18,
    },
    testnet: true,
  },
  somnia: {
    id: 50311,
    name: "Somnia Testnet",
    rpcUrl: "https://rpc.testnet.somnia.network",
    blockExplorer: "https://explorer.testnet.somnia.network", 
    faucetUrl: "https://faucet.testnet.somnia.network",
    nativeCurrency: {
      name: "Somnia",
      symbol: "SOM",
      decimals: 18,
    },
    testnet: true,
  },
  aztec: {
    id: 677868,
    name: "Aztec Testnet",
    rpcUrl: "https://rpc.testnet.aztec.network",
    blockExplorer: "https://explorer.testnet.aztec.network",
    faucetUrl: "https://faucet.testnet.aztec.network",
    nativeCurrency: {
      name: "Aztec",
      symbol: "AZT",
      decimals: 18,
    },
    testnet: true,
  },
  risechain: {
    id: 5555555,
    name: "RiseChain Testnet",
    rpcUrl: "https://rpc.testnet.risechain.io",
    blockExplorer: "https://explorer.testnet.risechain.io",
    faucetUrl: "https://faucet.testnet.risechain.io",
    nativeCurrency: {
      name: "RiseChain",
      symbol: "RISE",
      decimals: 18,
    },
    testnet: true,
  },
  r2: {
    id: 23333,
    name: "R2 Testnet",
    rpcUrl: "https://rpc.testnet.r2.co",
    blockExplorer: "https://explorer.testnet.r2.co",
    faucetUrl: "https://faucet.testnet.r2.co",
    nativeCurrency: {
      name: "R2",
      symbol: "R2",
      decimals: 18,
    },
    testnet: true,
  },
  pharos: {
    id: 9999,
    name: "Pharos Testnet",
    rpcUrl: "https://rpc.testnet.pharos.sh",
    blockExplorer: "https://explorer.testnet.pharos.sh",
    faucetUrl: "https://faucet.testnet.pharos.sh",
    nativeCurrency: {
      name: "Pharos",
      symbol: "PHR",
      decimals: 18,
    },
    testnet: true,
  },
  megaeth: {
    id: 12345,
    name: "MegaETH Testnet",
    rpcUrl: "https://rpc.testnet.megaeth.org",
    blockExplorer: "https://explorer.testnet.megaeth.org",
    faucetUrl: "https://faucet.testnet.megaeth.org",
    nativeCurrency: {
      name: "MegaETH",
      symbol: "METH",
      decimals: 18,
    },
    testnet: true,
  }
};

export const getChainById = (chainId: number): ChainConfig | undefined => {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === chainId);
};

export const getChainByKey = (key: string): ChainConfig | undefined => {
  return SUPPORTED_CHAINS[key];
};

export const getAllChains = (): ChainConfig[] => {
  return Object.values(SUPPORTED_CHAINS);
};
