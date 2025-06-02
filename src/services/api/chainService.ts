
import { mockApi } from '@/lib/api';

export interface ChainInfo {
  chainId: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  isActive: boolean;
  features: string[];
}

export interface DeploymentRequest {
  chainId: number;
  contractType: string;
  parameters: Record<string, any>;
}

export interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  deploymentTime: number;
  gasUsed: string;
}

export class ChainService {
  async getSupportedChains() {
    return mockApi.get<ChainInfo[]>('/api/chains');
  }

  async getChainStatus(chainId: number) {
    return mockApi.get(`/api/chains/${chainId}/status`);
  }

  async deployContract(request: DeploymentRequest) {
    return mockApi.post<DeploymentResult>('/api/deploy', request);
  }

  async getDeploymentHistory(chainId?: number) {
    const params = chainId ? `?chainId=${chainId}` : '';
    return mockApi.get(`/api/deploy/history${params}`);
  }

  async batchDeploy(requests: DeploymentRequest[]) {
    return mockApi.post('/api/deploy/batch', { deployments: requests });
  }
}

export const chainService = new ChainService();
