
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';

// Define our supported chains with real RPC endpoints
export const supportedChains = [
  {
    ...sepolia,
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
  },
  {
    ...sepolia,
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
  },
  {
    ...sepolia,
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
  },
  sepolia, // Add Sepolia as fallback
] as const;

export const config = getDefaultConfig({
  appName: 'SCRYPTEX',
  projectId: 'YOUR_PROJECT_ID', // Get this from WalletConnect Cloud
  chains: supportedChains,
  ssr: false,
});
