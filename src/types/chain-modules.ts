
// Chain module interface that all chain modules must implement
export interface IChainModule {
  // Deploy a contract template with parameters
  deploy(template: string, params: DeployParams): Promise<DeployResult>;
  
  // Interact with deployed contracts for a user
  interact(userAddress: string): Promise<InteractionResult>;
  
  // Validate a transaction hash
  validate(txHash: string): Promise<ValidationResult>;
}

// Common types for chain modules
export interface DeployParams {
  contractName: string;
  constructorArgs: any[];
  gasLimit?: number;
  value?: string;
}

export interface DeployResult {
  success: boolean;
  txHash: string;
  contractAddress?: string;
  error?: string;
}

export interface InteractionResult {
  success: boolean;
  txHash?: string;
  data?: any;
  error?: string;
}

export interface ValidationResult {
  success: boolean;
  confirmed: boolean;
  blockNumber?: number;
  error?: string;
}

// Chain module configuration
export interface ChainModuleConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: string;
  faucetUrl: string;
  docsUrl: string;
}
