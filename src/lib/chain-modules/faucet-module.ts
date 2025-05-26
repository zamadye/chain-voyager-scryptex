
import { BaseChainModule } from './base-module';
import { DeployParams, DeployResult, InteractionResult } from '@/types/chain-modules';

export class FaucetModule extends BaseChainModule {
  constructor(chainConfig: any) {
    super(chainConfig);
  }

  async deploy(template: string, params: DeployParams): Promise<DeployResult> {
    // Faucet module doesn't support deployment
    return {
      success: false,
      txHash: '',
      error: 'Faucet module does not support contract deployment'
    };
  }

  async interact(userAddress: string): Promise<InteractionResult> {
    // Open faucet URL in new tab
    if (this.config.faucetUrl) {
      window.open(this.config.faucetUrl, '_blank', 'noopener,noreferrer');
      
      return {
        success: true,
        txHash: '',
        data: { 
          action: 'faucet_opened',
          url: this.config.faucetUrl,
          chain: this.config.name
        }
      };
    }

    return {
      success: false,
      error: 'No faucet URL available for this chain'
    };
  }

  navigateToFaucet(): void {
    if (this.config.faucetUrl) {
      window.open(this.config.faucetUrl, '_blank', 'noopener,noreferrer');
    }
  }
}
