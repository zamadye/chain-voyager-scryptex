
import { BaseChainModule } from './base-module';
import { DeployParams, DeployResult, InteractionResult } from '@/types/chain-modules';
import { getContractTemplate } from '@/lib/contract-templates';
import { parseEther } from 'viem';

export class MegaETHModule extends BaseChainModule {
  constructor() {
    super({
      chainId: 6342,
      name: 'MegaETH Testnet',
      rpcUrl: 'https://6342.rpc.thirdweb.com',
      explorerUrl: 'https://testnet.megaeth.com/',
      nativeCurrency: 'METH',
      faucetUrl: 'https://faucets.chain.link/megaeth-testnet',
      docsUrl: 'https://docs.megaeth.com/'
    });
  }

  async deploy(template: string, params: DeployParams): Promise<DeployResult> {
    try {
      const contractTemplate = getContractTemplate(template);
      if (!contractTemplate) {
        return { success: false, txHash: '', error: 'Template not found' };
      }

      const walletClient = await this.getWalletClient();
      
      console.log(`Deploying ${params.contractName} on MegaETH Testnet...`);
      
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
      console.error('MegaETH deployment failed:', error);
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
      
      // MegaETH optimized interaction
      const hash = await walletClient.sendTransaction({
        to: userAddress as `0x${string}`,
        value: parseEther('0.01'), // Higher amount for MegaETH
        account: walletClient.account,
        chain: this.chain,
      } as any);

      console.log(`MegaETH interaction completed: ${hash}`);
      
      return {
        success: true,
        txHash: hash,
        data: { amount: '0.01 METH', recipient: userAddress }
      };
    } catch (error) {
      console.error('MegaETH interaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Interaction failed'
      };
    }
  }
}
