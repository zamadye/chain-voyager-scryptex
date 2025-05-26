
import type { IChainModule } from '@/types/chain-modules';
import { ZeroGModule } from './zerog-module';
import { NexusModule } from './nexus-module';
import { MegaETHModule } from './megaeth-module';
import { SomniaModule } from './somnia-module';
import { RiseChainModule } from './risechain-module';
import { AztecModule } from './aztec-module';

const moduleRegistry = new Map<number, IChainModule>();

const initializeModules = () => {
  if (moduleRegistry.size === 0) {
    moduleRegistry.set(80087, new ZeroGModule());
    moduleRegistry.set(4242424, new NexusModule());
    moduleRegistry.set(6342, new MegaETHModule());
    moduleRegistry.set(50312, new SomniaModule());
    moduleRegistry.set(11155931, new RiseChainModule());
    moduleRegistry.set(677868, new AztecModule());
  }
};

export const getChainModule = (chainId: number): IChainModule | null => {
  initializeModules();
  return moduleRegistry.get(chainId) || null;
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
