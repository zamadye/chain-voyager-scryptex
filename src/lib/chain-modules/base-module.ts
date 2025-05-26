
import { IChainModule, ChainModuleConfig, DeployParams, DeployResult, InteractionResult, ValidationResult } from '@/types/chain-modules';
import { getPublicClient, getWalletClient } from '@wagmi/core';
import { config } from '@/lib/web3-config';
import { defineChain } from 'viem';

export abstract class BaseChainModule implements IChainModule {
  protected config: ChainModuleConfig;
  protected chain: any;

  constructor(config: ChainModuleConfig) {
    this.config = config;
    this.chain = defineChain({
      id: config.chainId,
      name: config.name,
      nativeCurrency: { name: config.nativeCurrency, symbol: config.nativeCurrency, decimals: 18 },
      rpcUrls: {
        default: { http: [config.rpcUrl] },
      },
      blockExplorers: {
        default: { name: 'Explorer', url: config.explorerUrl },
      },
      testnet: true,
    });
  }

  abstract deploy(template: string, params: DeployParams): Promise<DeployResult>;
  abstract interact(userAddress: string): Promise<InteractionResult>;

  async validate(txHash: string): Promise<ValidationResult> {
    try {
      const publicClient = getPublicClient(config, { chainId: this.config.chainId as any });
      if (!publicClient) {
        return { success: false, confirmed: false, error: 'Public client not available' };
      }

      const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
      
      return {
        success: true,
        confirmed: receipt.status === 'success',
        blockNumber: Number(receipt.blockNumber)
      };
    } catch (error) {
      return {
        success: false,
        confirmed: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      };
    }
  }

  protected async getWalletClient() {
    const walletClient = await getWalletClient(config, { chainId: this.config.chainId as any });
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }
    return walletClient;
  }

  protected async getPublicClient() {
    const publicClient = getPublicClient(config, { chainId: this.config.chainId as any });
    if (!publicClient) {
      throw new Error('Public client not available');
    }
    return publicClient;
  }
}
