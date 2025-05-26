
import type { IChainModule } from '@/types/chain-modules';
import { ZeroGModule } from './zerog-module';
import { NexusModule } from './nexus-module';
import { MegaETHModule } from './megaeth-module';
import { SomniaModule } from './somnia-module';
import { RiseChainModule } from './risechain-module';
import { AztecModule } from './aztec-module';
import { FaucetModule } from './faucet-module';

const moduleRegistry = new Map<number, IChainModule>();
const faucetRegistry = new Map<number, FaucetModule>();

const initializeModules = () => {
  if (moduleRegistry.size === 0) {
    moduleRegistry.set(80087, new ZeroGModule());
    moduleRegistry.set(4242424, new NexusModule());
    moduleRegistry.set(6342, new MegaETHModule());
    moduleRegistry.set(50312, new SomniaModule());
    moduleRegistry.set(11155931, new RiseChainModule());
    moduleRegistry.set(677868, new AztecModule());

    // Initialize faucet modules
    const zeroGConfig = {
      chainId: 80087,
      name: '0G Galileo Testnet',
      rpcUrl: 'https://80087.rpc.thirdweb.com',
      explorerUrl: 'https://chainscan-galileo.0g.ai',
      nativeCurrency: 'ZRO',
      faucetUrl: 'https://thirdweb.com/0g-galileo-testnet',
      docsUrl: 'https://docs.0g.ai/build-with-0g/storage-sdk'
    };

    const nexusConfig = {
      chainId: 4242424,
      name: 'Nexus Network',
      rpcUrl: 'https://rpc.testnet.nexus.xyz',
      explorerUrl: 'https://explorer.nexus.xyz/',
      nativeCurrency: 'NEX',
      faucetUrl: 'https://docs.nexus.xyz/layer-1/developer/resources',
      docsUrl: 'https://github.com/nexus-rpc/sdk-go'
    };

    const megaETHConfig = {
      chainId: 6342,
      name: 'MegaETH Testnet',
      rpcUrl: 'https://6342.rpc.thirdweb.com',
      explorerUrl: 'https://testnet.megaeth.com/',
      nativeCurrency: 'METH',
      faucetUrl: 'https://faucets.chain.link/megaeth-testnet',
      docsUrl: 'https://docs.megaeth.com/'
    };

    const somniaConfig = {
      chainId: 50312,
      name: 'Somnia Shannon Testnet',
      rpcUrl: 'https://rpc.testnet.somnia.network',
      explorerUrl: 'https://somnia-testnet.socialscan.io/',
      nativeCurrency: 'SOM',
      faucetUrl: 'https://blog.thirdweb.com/faucet-guides/how-to-get-free-eth-token-eth-from-the-somnia-shannon-testnet-faucet/',
      docsUrl: 'https://docs.somnia.network/developer/resources-and-important-links'
    };

    const riseChainConfig = {
      chainId: 11155931,
      name: 'RiseChain Testnet',
      rpcUrl: 'https://testnet.riselabs.xyz',
      explorerUrl: 'https://explorer.testnet.riselabs.xyz',
      nativeCurrency: 'RISE',
      faucetUrl: 'https://thirdweb.com/rise-network-testnet',
      docsUrl: 'https://docs.risechain.com/rise-testnet/network-details.html'
    };

    const aztecConfig = {
      chainId: 677868,
      name: 'Aztec Testnet',
      rpcUrl: 'https://677868.rpc.thirdweb.com',
      explorerUrl: 'https://forum.aztec.network/t/aztec-block-explorer-proposal-by-pk-labs/5845',
      nativeCurrency: 'AZT',
      faucetUrl: 'https://thirdweb.com/aztec-testnet',
      docsUrl: 'https://docs.aztec.network/next/sandbox_to_testnet_guide'
    };

    faucetRegistry.set(80087, new FaucetModule(zeroGConfig));
    faucetRegistry.set(4242424, new FaucetModule(nexusConfig));
    faucetRegistry.set(6342, new FaucetModule(megaETHConfig));
    faucetRegistry.set(50312, new FaucetModule(somniaConfig));
    faucetRegistry.set(11155931, new FaucetModule(riseChainConfig));
    faucetRegistry.set(677868, new FaucetModule(aztecConfig));
  }
};

export const getChainModule = (chainId: number): IChainModule | null => {
  initializeModules();
  return moduleRegistry.get(chainId) || null;
};

export const getFaucetModule = (chainId: number): FaucetModule | null => {
  initializeModules();
  return faucetRegistry.get(chainId) || null;
};

export const getAllChainModules = (): Map<number, IChainModule> => {
  initializeModules();
  return new Map(moduleRegistry);
};

export const isChainSupported = (chainId: number): boolean => {
  initializeModules();
  return moduleRegistry.has(chainId);
};

export const getSupportedChainIds = (): number[] => {
  initializeModules();
  return Array.from(moduleRegistry.keys());
};

export const openChainFaucet = (chainId: number): boolean => {
  initializeModules();
  const faucetModule = faucetRegistry.get(chainId);
  if (faucetModule) {
    faucetModule.navigateToFaucet();
    return true;
  }
  return false;
};
