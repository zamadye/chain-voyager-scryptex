
import { BaseChainModule } from './base-module';
import { DeployParams, DeployResult, InteractionResult } from '@/types/chain-modules';
import { getContractTemplate } from '@/lib/contract-templates';
import { parseEther } from 'viem';

export class ZeroGModule extends BaseChainModule {
  constructor() {
    super({
      chainId: 80087,
      name: '0G Galileo Testnet',
      rpcUrl: 'https://80087.rpc.thirdweb.com',
      explorerUrl: 'https://chainscan-galileo.0g.ai',
      nativeCurrency: 'ZRO',
      faucetUrl: 'https://thirdweb.com/0g-galileo-testnet',
      docsUrl: 'https://docs.0g.ai/build-with-0g/storage-sdk'
    });
  }

  async deploy(template: string, params: DeployParams): Promise<DeployResult> {
    try {
      const contractTemplate = getContractTemplate(template);
      if (!contractTemplate) {
        return { success: false, txHash: '', error: 'Template not found' };
      }

      const walletClient = await this.getWalletClient();
      
      console.log(`Deploying ${params.contractName} on 0G Galileo Testnet...`);
      
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
      console.error('0G deployment failed:', error);
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
      
      const hash = await walletClient.sendTransaction({
        to: userAddress as `0x${string}`,
        value: parseEther('0.001'),
        account: walletClient.account,
        chain: this.chain,
      });

      console.log(`0G interaction completed: ${hash}`);
      
      return {
        success: true,
        txHash: hash,
        data: { amount: '0.001 ZRO', recipient: userAddress }
      };
    } catch (error) {
      console.error('0G interaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Interaction failed'
      };
    }
  }
}
