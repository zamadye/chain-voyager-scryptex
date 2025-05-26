
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define our custom testnet chains
const nexusTestnet = defineChain({
  id: 4242424,
  name: 'Nexus Testnet',
  nativeCurrency: { name: 'Nexus', symbol: 'NEX', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.nexus.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Nexus Explorer', url: 'https://explorer.testnet.nexus.xyz' },
  },
  testnet: true,
});

const zeroGTestnet = defineChain({
  id: 16600,
  name: '0G Galileo Testnet',
  nativeCurrency: { name: '0G Token', symbol: '0G', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://explorer-testnet.0g.ai' },
  },
  testnet: true,
});

const somniaTestnet = defineChain({
  id: 50311,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'Somnia', symbol: 'SOM', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.somnia.network'] },
  },
  blockExplorers: {
    default: { name: 'Somnia Explorer', url: 'https://explorer.testnet.somnia.network' },
  },
  testnet: true,
});

export const supportedChains = [
  nexusTestnet,
  zeroGTestnet,
  somniaTestnet,
  sepolia, // Add Sepolia as fallback
] as const;

export const config = getDefaultConfig({
  appName: 'SCRYPTEX',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || 'your-project-id',
  chains: supportedChains,
  ssr: false,
});
