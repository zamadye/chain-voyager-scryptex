
import { APIResponse } from '@/types';

export const mockApi = {
  async get<T>(endpoint: string): Promise<APIResponse<T>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Mock successful response
      return {
        success: true,
        data: {} as T,
        error: '',
        message: 'Success'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as T,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Request failed'
      };
    }
  },

  async post<T>(endpoint: string, data: any): Promise<APIResponse<T>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      // Mock successful response
      return {
        success: true,
        data: {} as T,
        error: '',
        message: 'Success'
      };
    } catch (error) {
      return {
        success: false,
        data: {} as T,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Request failed'
      };
    }
  }
};
