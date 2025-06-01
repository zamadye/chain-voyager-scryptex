
import { BaseChainModule } from './base-module';
import { DeployParams, DeployResult, InteractionResult } from '@/types/chain-modules';
import { getContractTemplate } from '@/lib/contract-templates';
import { parseEther } from 'viem';

export class NexusModule extends BaseChainModule {
  constructor() {
    super({
      chainId: 4242424, // Using the existing chain ID from the config
      name: 'Nexus Network',
      rpcUrl: 'https://rpc.testnet.nexus.xyz',
      explorerUrl: 'https://explorer.nexus.xyz/',
      nativeCurrency: 'NEX',
      faucetUrl: 'https://docs.nexus.xyz/layer-1/developer/resources',
      docsUrl: 'https://github.com/nexus-rpc/sdk-go'
    });
  }

  async deploy(template: string, params: DeployParams): Promise<DeployResult> {
    try {
      const contractTemplate = getContractTemplate(template);
      if (!contractTemplate) {
        return { success: false, txHash: '', error: 'Template not found' };
      }

      const walletClient = await this.getWalletClient();
      
      console.log(`Deploying ${params.contractName} on Nexus Network...`);
      
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
      console.error('Nexus deployment failed:', error);
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
      
      // Nexus-specific interaction
      const hash = await walletClient.sendTransaction({
        to: userAddress as `0x${string}`,
        value: parseEther('0.001'),
        account: walletClient.account,
        chain: this.chain,
      } as any);

      console.log(`Nexus interaction completed: ${hash}`);
      
      return {
        success: true,
        txHash: hash,
        data: { amount: '0.001 NEX', recipient: userAddress }
      };
    } catch (error) {
      console.error('Nexus interaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Interaction failed'
      };
    }
  }
}
