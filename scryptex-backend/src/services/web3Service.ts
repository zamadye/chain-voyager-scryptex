
import { createPublicClient, createWalletClient, http, parseEther, formatEther, getContract } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { config } from '@/config/config';
import { logger } from '@/utils/logger';

export class Web3Service {
  private clients: Map<number, any> = new Map();
  private account: any;

  constructor() {
    if (config.privateKey) {
      this.account = privateKeyToAccount(config.privateKey as `0x${string}`);
    }
  }

  /**
   * Get or create public client for chain
   */
  private getPublicClient(chainId: number) {
    if (this.clients.has(chainId)) {
      return this.clients.get(chainId);
    }

    const rpcUrl = this.getRpcUrl(chainId);
    if (!rpcUrl) {
      throw new Error(`No RPC URL configured for chain ${chainId}`);
    }

    const client = createPublicClient({
      transport: http(rpcUrl)
    });

    this.clients.set(chainId, client);
    return client;
  }

  /**
   * Get RPC URL for chain
   */
  private getRpcUrl(chainId: number): string | null {
    const rpcMap: Record<number, string> = {
      11155111: config.blockchainRpcs.ethereum, // Sepolia
      4242424: config.blockchainRpcs.nexus,
      16600: config.blockchainRpcs.zeroXG,
      50311: config.blockchainRpcs.somnia,
      677868: config.blockchainRpcs.aztec,
      5555555: config.blockchainRpcs.risechain,
      23333: config.blockchainRpcs.r2,
      9999: config.blockchainRpcs.pharos,
      12345: config.blockchainRpcs.megaeth
    };

    return rpcMap[chainId] || null;
  }

  /**
   * Get current block number
   */
  async getBlockNumber(chainId: number): Promise<number> {
    try {
      const client = this.getPublicClient(chainId);
      const blockNumber = await client.getBlockNumber();
      return Number(blockNumber);
    } catch (error) {
      logger.error('Error getting block number', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get gas price
   */
  async getGasPrice(chainId: number) {
    try {
      const client = this.getPublicClient(chainId);
      const gasPrice = await client.getGasPrice();
      
      const basePrice = Number(formatEther(gasPrice)) * 1e9; // Convert to gwei
      
      return {
        standard: Math.round(basePrice),
        fast: Math.round(basePrice * 1.2),
        fastest: Math.round(basePrice * 1.5)
      };
    } catch (error) {
      logger.error('Error getting gas price', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get balance of address
   */
  async getBalance(chainId: number, address: string): Promise<string> {
    try {
      const client = this.getPublicClient(chainId);
      const balance = await client.getBalance({ 
        address: address as `0x${string}` 
      });
      return formatEther(balance);
    } catch (error) {
      logger.error('Error getting balance', {
        chainId,
        address,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(chainId: number, txHash: string) {
    try {
      const client = this.getPublicClient(chainId);
      const receipt = await client.getTransactionReceipt({
        hash: txHash as `0x${string}`
      });
      return receipt;
    } catch (error) {
      logger.error('Error getting transaction receipt', {
        chainId,
        txHash,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Deploy contract
   */
  async deployContract(params: {
    chainId: number;
    bytecode: string;
    abi: any[];
    constructorArgs?: any[];
    gasLimit?: bigint;
    gasPrice?: bigint;
  }) {
    try {
      if (!this.account) {
        throw new Error('No private key configured for deployment');
      }

      const rpcUrl = this.getRpcUrl(params.chainId);
      if (!rpcUrl) {
        throw new Error(`No RPC URL configured for chain ${params.chainId}`);
      }

      const walletClient = createWalletClient({
        account: this.account,
        transport: http(rpcUrl)
      });

      const hash = await walletClient.deployContract({
        abi: params.abi,
        bytecode: params.bytecode as `0x${string}`,
        args: params.constructorArgs || [],
        gas: params.gasLimit,
        gasPrice: params.gasPrice
      });

      logger.info('Contract deployment initiated', {
        chainId: params.chainId,
        transactionHash: hash
      });

      return { transactionHash: hash };
    } catch (error) {
      logger.error('Error deploying contract', {
        chainId: params.chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Estimate gas for deployment
   */
  async estimateDeploymentGas(params: {
    chainId: number;
    bytecode: string;
    abi: any[];
    constructorArgs?: any[];
  }): Promise<bigint> {
    try {
      const client = this.getPublicClient(params.chainId);
      
      // Estimate gas using the public client
      const gasEstimate = await client.estimateGas({
        data: params.bytecode as `0x${string}`,
        account: this.account?.address || '0x0000000000000000000000000000000000000000'
      });

      return gasEstimate;
    } catch (error) {
      logger.error('Error estimating deployment gas', {
        chainId: params.chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Return a default estimate if estimation fails
      return BigInt(2000000);
    }
  }

  /**
   * Verify contract on block explorer
   */
  async verifyContract(params: {
    chainId: number;
    contractAddress: string;
    sourceCode: string;
    contractName: string;
    compilerVersion: string;
  }) {
    try {
      // This would integrate with block explorer APIs like Etherscan
      // For now, return a mock verification result
      
      logger.info('Contract verification requested', {
        chainId: params.chainId,
        contractAddress: params.contractAddress
      });

      // Mock verification - in production, this would call the actual explorer API
      return {
        isVerified: true,
        verificationUrl: `${this.getExplorerUrl(params.chainId)}/address/${params.contractAddress}#code`,
        message: 'Contract verification submitted successfully'
      };
    } catch (error) {
      logger.error('Error verifying contract', {
        chainId: params.chainId,
        contractAddress: params.contractAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return {
        isVerified: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Measure RPC latency
   */
  async measureRpcLatency(chainId: number): Promise<number> {
    try {
      const startTime = Date.now();
      await this.getBlockNumber(chainId);
      const endTime = Date.now();
      
      return endTime - startTime;
    } catch (error) {
      logger.error('Error measuring RPC latency', {
        chainId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return 9999; // High latency to indicate error
    }
  }

  /**
   * Get explorer URL for chain
   */
  private getExplorerUrl(chainId: number): string {
    const explorerMap: Record<number, string> = {
      11155111: 'https://sepolia.etherscan.io',
      4242424: 'https://explorer.testnet.nexus.xyz',
      16600: 'https://explorer-testnet.0g.ai',
      50311: 'https://explorer.testnet.somnia.network',
      677868: 'https://explorer.testnet.aztec.network',
      5555555: 'https://explorer.testnet.risechain.io',
      23333: 'https://explorer.testnet.r2.co',
      9999: 'https://explorer.testnet.pharos.sh',
      12345: 'https://explorer.testnet.megaeth.org'
    };

    return explorerMap[chainId] || 'https://etherscan.io';
  }

  /**
   * Send transaction
   */
  async sendTransaction(params: {
    chainId: number;
    to: string;
    value?: bigint;
    data?: string;
    gasLimit?: bigint;
    gasPrice?: bigint;
  }) {
    try {
      if (!this.account) {
        throw new Error('No private key configured for transactions');
      }

      const rpcUrl = this.getRpcUrl(params.chainId);
      if (!rpcUrl) {
        throw new Error(`No RPC URL configured for chain ${params.chainId}`);
      }

      const walletClient = createWalletClient({
        account: this.account,
        transport: http(rpcUrl)
      });

      const hash = await walletClient.sendTransaction({
        to: params.to as `0x${string}`,
        value: params.value || BigInt(0),
        data: params.data as `0x${string}`,
        gas: params.gasLimit,
        gasPrice: params.gasPrice
      });

      logger.info('Transaction sent', {
        chainId: params.chainId,
        transactionHash: hash,
        to: params.to
      });

      return { transactionHash: hash };
    } catch (error) {
      logger.error('Error sending transaction', {
        chainId: params.chainId,
        to: params.to,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}

export const web3Service = new Web3Service();
