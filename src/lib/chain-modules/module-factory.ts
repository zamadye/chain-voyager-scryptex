
import { IChainModule } from '@/types/chain-modules';
import { ZeroGModule } from './zerog-module';
import { NexusModule } from './nexus-module';
import { MegaETHModule } from './megaeth-module';
import { SomniaModule } from './somnia-module';
import { RiseChainModule } from './risechain-module';
import { AztecModule } from './aztec-module';

// Module registry mapping chain IDs to module instances
const moduleRegistry = new Map<number, IChainModule>();

// Initialize all modules
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

// Get module for a specific chain
export const getChainModule = (chainId: number): IChainModule | null => {
  initializeModules();
  return moduleRegistry.get(chainId) || null;
};

// Get all available chain modules
export const getAllChainModules = (): Map<number, IChainModule> => {
  initializeModules();
  return new Map(moduleRegistry);
};

// Check if a chain is supported
export const isChainSupported = (chainId: number): boolean => {
  initializeModules();
  return moduleRegistry.has(chainId);
};

// Get supported chain IDs
export const getSupportedChainIds = (): number[] => {
  initializeModules();
  return Array.from(moduleRegistry.keys());
};
