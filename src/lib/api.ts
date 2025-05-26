
import { APIResponse } from '@/types';

export const mockApi = {
  async get<T = any>(endpoint: string): Promise<APIResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      return {
        success: true,
        data: {} as T,
        error: '',
        message: 'Success'
      };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Request failed'
      };
    }
  },

  async post<T = any>(endpoint: string, data: any): Promise<APIResponse<T>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      return {
        success: true,
        data: {} as T,
        error: '',
        message: 'Success'
      };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Request failed'
      };
    }
  }
};
