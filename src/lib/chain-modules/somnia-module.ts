
import { BaseChainModule } from './base-module';
import { DeployParams, DeployResult, InteractionResult } from '@/types/chain-modules';
import { getContractTemplate } from '@/lib/contract-templates';
import { parseEther } from 'viem';

export class SomniaModule extends BaseChainModule {
  constructor() {
    super({
      chainId: 50312,
      name: 'Somnia Shannon Testnet',
      rpcUrl: 'https://rpc.testnet.somnia.network',
      explorerUrl: 'https://somnia-testnet.socialscan.io/',
      nativeCurrency: 'SOM',
      faucetUrl: 'https://blog.thirdweb.com/faucet-guides/how-to-get-free-eth-token-eth-from-the-somnia-shannon-testnet-faucet/',
      docsUrl: 'https://docs.somnia.network/developer/resources-and-important-links'
    });
  }

  async deploy(template: string, params: DeployParams): Promise<DeployResult> {
    try {
      const contractTemplate = getContractTemplate(template);
      if (!contractTemplate) {
        return { success: false, txHash: '', error: 'Template not found' };
      }

      const walletClient = await this.getWalletClient();
      
      console.log(`Deploying ${params.contractName} on Somnia Shannon Testnet...`);
      
      const hash = await walletClient.deployContract({
        abi: contractTemplate.abi as any,
        bytecode: contractTemplate.bytecode as `0x${string}`,
        args: params.constructorArgs as any,
        account: walletClient.account,
        chain: this.chain,
      });

      const publicClient = await this.getPublicClient();
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        success: true,
        txHash: hash,
        contractAddress: receipt.contractAddress
      };
    } catch (error) {
      console.error('Somnia deployment failed:', error);
      return {
        success: false,
        txHash: '',
        error: error instanceof Error ? error.message : 'Deployment failed'
      };
    }
  }

  async interact(userAddress: string): Promise<InteractionResult> {
    try {
      const walletClient = await this.getWalletClient();
      
      // Somnia-specific interaction
      const hash = await walletClient.sendTransaction({
        to: userAddress as `0x${string}`,
        value: parseEther('0.005'),
        account: walletClient.account,
        chain: this.chain,
      });

      console.log(`Somnia interaction completed: ${hash}`);
      
      return {
        success: true,
        txHash: hash,
        data: { amount: '0.005 SOM', recipient: userAddress }
      };
    } catch (error) {
      console.error('Somnia interaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Interaction failed'
      };
    }
  }
}
