
import { getPublicClient, getWalletClient } from '@wagmi/core';
import { parseEther, formatEther } from 'viem';
import { config } from './web3-config';
import { getContractTemplate } from './contract-templates';

export class Web3Service {
  static async deployContract(
    chainId: number,
    templateName: string,
    contractName: string,
    constructorArgs: string[]
  ) {
    const template = getContractTemplate(templateName);
    if (!template) throw new Error('Template not found');

    const walletClient = await getWalletClient(config, { chainId });
    if (!walletClient) throw new Error('Wallet not connected');

    // Deploy the contract
    const hash = await walletClient.deployContract({
      abi: template.abi as any,
      bytecode: template.bytecode as `0x${string}`,
      args: constructorArgs as any,
    });

    const publicClient = getPublicClient(config, { chainId });
    const receipt = await publicClient?.waitForTransactionReceipt({ hash });

    return {
      txHash: hash,
      contractAddress: receipt?.contractAddress,
      gasUsed: receipt?.gasUsed?.toString(),
    };
  }

  static async postGM(chainId: number) {
    const template = getContractTemplate('GM Contract');
    if (!template) throw new Error('GM template not found');

    const walletClient = await getWalletClient(config, { chainId });
    if (!walletClient) throw new Error('Wallet not connected');

    // First deploy GM contract if needed
    const deployHash = await walletClient.deployContract({
      abi: template.abi as any,
      bytecode: template.bytecode as `0x${string}`,
      args: [] as any,
    });

    const publicClient = getPublicClient(config, { chainId });
    const deployReceipt = await publicClient?.waitForTransactionReceipt({ hash: deployHash });
    
    if (!deployReceipt?.contractAddress) throw new Error('Contract deployment failed');

    // Now post GM using writeContract
    const hash = await walletClient.writeContract({
      address: deployReceipt.contractAddress,
      abi: template.abi as any,
      functionName: 'postGM',
      args: [],
    });

    const receipt = await publicClient?.waitForTransactionReceipt({ hash });

    return {
      txHash: hash,
      contractAddress: deployReceipt.contractAddress,
      gasUsed: receipt?.gasUsed?.toString(),
    };
  }

  static async getBalance(address: string, chainId: number) {
    const publicClient = getPublicClient(config, { chainId });
    if (!publicClient) return '0';

    const balance = await publicClient.getBalance({ address: address as `0x${string}` });
    return formatEther(balance);
  }

  static async getGasPrice(chainId: number) {
    const publicClient = getPublicClient(config, { chainId });
    if (!publicClient) return '0';

    const gasPrice = await publicClient.getGasPrice();
    return formatEther(gasPrice * BigInt(21000)); // Convert to gwei equivalent
  }

  static async getBlockNumber(chainId: number) {
    const publicClient = getPublicClient(config, { chainId });
    if (!publicClient) return 0;

    const blockNumber = await publicClient.getBlockNumber();
    return Number(blockNumber);
  }
}
