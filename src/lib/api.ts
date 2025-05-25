
import { APIResponse, ChainStatus, AnalyticsOverview, ChainMetrics, QualificationData } from '@/types';

// API base configuration
const API_BASE_URL = process.env.VITE_API_BASE_URL || '/api';

class APIService {
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
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Chain Management APIs
  async getChainStatus(): Promise<APIResponse<Record<string, ChainStatus>>> {
    return this.request('/chains/status');
  }

  async getChainInfo(chainId: number): Promise<APIResponse<any>> {
    return this.request(`/chains/${chainId}`);
  }

  async getGasPrices(chainId: number): Promise<APIResponse<any>> {
    return this.request(`/chains/${chainId}/gas`);
  }

  // Contract Operations APIs
  async deployContract(data: any): Promise<APIResponse<any>> {
    return this.request('/contracts/deploy', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getContractTemplates(): Promise<APIResponse<any>> {
    return this.request('/contracts/templates');
  }

  async getDeploymentStatus(id: string): Promise<APIResponse<any>> {
    return this.request(`/contracts/deployment/${id}`);
  }

  async verifyContract(data: any): Promise<APIResponse<any>> {
    return this.request('/contracts/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Swap Operations APIs
  async getSwapQuote(data: any): Promise<APIResponse<any>> {
    return this.request('/swap/quote', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async executeSwap(data: any): Promise<APIResponse<any>> {
    return this.request('/swap/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSwapHistory(): Promise<APIResponse<any>> {
    return this.request('/swap/history');
  }

  async getSupportedTokens(chainId: number): Promise<APIResponse<any>> {
    return this.request(`/swap/tokens/${chainId}`);
  }

  // GM Operations APIs
  async postGM(data: any): Promise<APIResponse<any>> {
    return this.request('/gm/post', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getGMStreak(): Promise<APIResponse<any>> {
    return this.request('/gm/streak');
  }

  async getGMHistory(): Promise<APIResponse<any>> {
    return this.request('/gm/history');
  }

  async getBatchGMStatus(id: string): Promise<APIResponse<any>> {
    return this.request(`/gm/batch/${id}`);
  }

  // Analytics APIs
  async getAnalyticsOverview(): Promise<APIResponse<AnalyticsOverview>> {
    return this.request('/analytics/overview');
  }

  async getChainMetrics(): Promise<APIResponse<ChainMetrics[]>> {
    return this.request('/analytics/chains');
  }

  async getQualificationScore(): Promise<APIResponse<QualificationData[]>> {
    return this.request('/analytics/qualification');
  }

  async getROIMetrics(): Promise<APIResponse<any>> {
    return this.request('/analytics/roi');
  }

  // User Management APIs
  async getUserProfile(): Promise<APIResponse<any>> {
    return this.request('/user/profile');
  }

  async updateUserSettings(data: any): Promise<APIResponse<any>> {
    return this.request('/user/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getTransactionHistory(): Promise<APIResponse<any>> {
    return this.request('/user/transactions');
  }
}

export const apiService = new APIService();
