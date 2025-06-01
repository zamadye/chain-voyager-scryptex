
import { BaseChainModule } from './base-module';
import { DeployParams, DeployResult, InteractionResult } from '@/types/chain-modules';
import { getContractTemplate } from '@/lib/contract-templates';
import { parseEther } from 'viem';

export class RiseChainModule extends BaseChainModule {
  constructor() {
    super({
      chainId: 11155931,
      name: 'RiseChain Testnet',
      rpcUrl: 'https://testnet.riselabs.xyz',
      explorerUrl: 'https://explorer.testnet.riselabs.xyz',
      nativeCurrency: 'RISE',
      faucetUrl: 'https://thirdweb.com/rise-network-testnet',
      docsUrl: 'https://docs.risechain.com/rise-testnet/network-details.html'
    });
  }

  async deploy(template: string, params: DeployParams): Promise<DeployResult> {
    try {
      const contractTemplate = getContractTemplate(template);
      if (!contractTemplate) {
        return { success: false, txHash: '', error: 'Template not found' };
      }

      const walletClient = await this.getWalletClient();
      
      console.log(`Deploying ${params.contractName} on RiseChain Testnet...`);
      
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
      console.error('RiseChain deployment failed:', error);
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
      
      // RiseChain-specific interaction
      const hash = await walletClient.sendTransaction({
        to: userAddress as `0x${string}`,
        value: parseEther('0.002'),
        account: walletClient.account,
        chain: this.chain,
      } as any);

      console.log(`RiseChain interaction completed: ${hash}`);
      
      return {
        success: true,
        txHash: hash,
        data: { amount: '0.002 RISE', recipient: userAddress }
      };
    } catch (error) {
      console.error('RiseChain interaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Interaction failed'
      };
    }
  }
}
