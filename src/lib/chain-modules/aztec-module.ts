
import { BaseChainModule } from './base-module';
import { DeployParams, DeployResult, InteractionResult } from '@/types/chain-modules';
import { getContractTemplate } from '@/lib/contract-templates';
import { parseEther } from 'viem';

export class AztecModule extends BaseChainModule {
  constructor() {
    super({
      chainId: 677868,
      name: 'Aztec Testnet',
      rpcUrl: 'https://677868.rpc.thirdweb.com',
      explorerUrl: 'https://forum.aztec.network/t/aztec-block-explorer-proposal-by-pk-labs/5845',
      nativeCurrency: 'AZT',
      faucetUrl: 'https://thirdweb.com/aztec-testnet',
      docsUrl: 'https://docs.aztec.network/next/sandbox_to_testnet_guide'
    });
  }

  async deploy(template: string, params: DeployParams): Promise<DeployResult> {
    try {
      const contractTemplate = getContractTemplate(template);
      if (!contractTemplate) {
        return { success: false, txHash: '', error: 'Template not found' };
      }

      const walletClient = await this.getWalletClient();
      
      console.log(`Deploying ${params.contractName} on Aztec Testnet...`);
      
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
      console.error('Aztec deployment failed:', error);
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
      
      // Aztec privacy-focused interaction
      const hash = await walletClient.sendTransaction({
        to: userAddress as `0x${string}`,
        value: parseEther('0.001'),
        account: walletClient.account,
        chain: this.chain,
      } as any);

      console.log(`Aztec interaction completed: ${hash}`);
      
      return {
        success: true,
        txHash: hash,
        data: { amount: '0.001 AZT', recipient: userAddress, privacy: 'enabled' }
      };
    } catch (error) {
      console.error('Aztec interaction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Interaction failed'
      };
    }
  }
}
