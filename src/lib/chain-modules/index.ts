
// Export the main interface and types
export type { IChainModule, DeployParams, DeployResult, InteractionResult, ValidationResult, ChainModuleConfig } from '@/types/chain-modules';

// Export the base module class
export { BaseChainModule } from './base-module';

// Export all specific chain modules
export { ZeroGModule } from './zerog-module';
export { NexusModule } from './nexus-module';
export { MegaETHModule } from './megaeth-module';
export { SomniaModule } from './somnia-module';
export { RiseChainModule } from './risechain-module';
export { AztecModule } from './aztec-module';
export { FaucetModule } from './faucet-module';

// Export the factory functions
export { 
  getChainModule, 
  getAllChainModules, 
  isChainSupported, 
  getSupportedChainIds,
  getFaucetModule,
  openChainFaucet
} from './module-factory';
