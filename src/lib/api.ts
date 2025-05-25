
import { APIResponse, ChainStatus, DeploymentStatus, SwapTransaction, GMPost, AnalyticsOverview, ChainMetrics, QualificationData } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Chain Management
  async getChainStatus(): Promise<APIResponse<Record<string, ChainStatus>>> {
    return this.request('/api/chains/status');
  }

  async getChainInfo(chainId: number): Promise<APIResponse<any>> {
    return this.request(`/api/chains/${chainId}`);
  }

  async getGasPrices(chainId: number): Promise<APIResponse<string>> {
    return this.request(`/api/chains/${chainId}/gas`);
  }

  // Contract Operations
  async deployContract(data: {
    chainIds: number[];
    template: string;
    parameters: Record<string, any>;
  }): Promise<APIResponse<DeploymentStatus[]>> {
    return this.request('/api/contracts/deploy', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getContractTemplates(): Promise<APIResponse<any[]>> {
    return this.request('/api/contracts/templates');
  }

  async getDeploymentStatus(id: string): Promise<APIResponse<DeploymentStatus>> {
    return this.request(`/api/contracts/deployment/${id}`);
  }

  async verifyContract(data: {
    chainId: number;
    contractAddress: string;
    sourceCode: string;
  }): Promise<APIResponse<any>> {
    return this.request('/api/contracts/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Swap Operations
  async getSwapQuote(data: {
    chainId: number;
    fromToken: string;
    toToken: string;
    amount: string;
  }): Promise<APIResponse<any>> {
    return this.request('/api/swap/quote', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async executeSwap(data: {
    chainId: number;
    fromToken: string;
    toToken: string;
    amount: string;
    slippage: number;
  }): Promise<APIResponse<SwapTransaction>> {
    return this.request('/api/swap/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSwapHistory(): Promise<APIResponse<SwapTransaction[]>> {
    return this.request('/api/swap/history');
  }

  async getSupportedTokens(chainId: number): Promise<APIResponse<any[]>> {
    return this.request(`/api/swap/tokens/${chainId}`);
  }

  // GM Operations
  async postGM(chainIds: number[]): Promise<APIResponse<GMPost[]>> {
    return this.request('/api/gm/post', {
      method: 'POST',
      body: JSON.stringify({ chainIds }),
    });
  }

  async getGMStreak(): Promise<APIResponse<Record<number, number>>> {
    return this.request('/api/gm/streak');
  }

  async getGMHistory(): Promise<APIResponse<GMPost[]>> {
    return this.request('/api/gm/history');
  }

  async getBatchGMStatus(id: string): Promise<APIResponse<any>> {
    return this.request(`/api/gm/batch/${id}`);
  }

  // Analytics
  async getAnalyticsOverview(): Promise<APIResponse<AnalyticsOverview>> {
    return this.request('/api/analytics/overview');
  }

  async getChainMetrics(): Promise<APIResponse<ChainMetrics[]>> {
    return this.request('/api/analytics/chains');
  }

  async getQualificationScore(): Promise<APIResponse<QualificationData[]>> {
    return this.request('/api/analytics/qualification');
  }

  async getROIMetrics(): Promise<APIResponse<any>> {
    return this.request('/api/analytics/roi');
  }

  // User Management
  async getUserProfile(): Promise<APIResponse<any>> {
    return this.request('/api/user/profile');
  }

  async updateUserSettings(settings: Record<string, any>): Promise<APIResponse<any>> {
    return this.request('/api/user/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getTransactionHistory(): Promise<APIResponse<any[]>> {
    return this.request('/api/user/transactions');
  }
}

export const apiService = new ApiService();
