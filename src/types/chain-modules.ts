
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

// Deployment parameters
export interface DeployParams {
  contractName: string;
  constructorArgs: string[];
}

// Deployment result
export interface DeployResult {
  success: boolean;
  txHash: string;
  contractAddress?: string;
  error?: string;
}

// Interaction result
export interface InteractionResult {
  success: boolean;
  txHash?: string;
  data?: any;
  error?: string;
}

// Validation result
export interface ValidationResult {
  success: boolean;
  confirmed: boolean;
  blockNumber?: number;
  error?: string;
}

// Chain module interface
export interface IChainModule {
  deploy(template: string, params: DeployParams): Promise<DeployResult>;
  interact(userAddress: string): Promise<InteractionResult>;
  validate(txHash: string): Promise<ValidationResult>;
}
