
import { mockApi } from '@/lib/api';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  wallet_address?: string;
  kyc_verified: boolean;
  trading_tier: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_in: number;
}

export class AuthService {
  async login(credentials: AuthCredentials) {
    return mockApi.post<AuthResponse>('/api/auth/login', credentials);
  }

  async register(credentials: AuthCredentials & { username?: string }) {
    return mockApi.post<AuthResponse>('/api/auth/register', credentials);
  }

  async logout() {
    return mockApi.post('/api/auth/logout', {});
  }

  async getProfile() {
    return mockApi.get<User>('/api/auth/profile');
  }

  async updateProfile(data: Partial<User>) {
    return mockApi.post<User>('/api/auth/profile', data);
  }

  async connectWallet(walletAddress: string) {
    return mockApi.post('/api/auth/connect-wallet', { wallet_address: walletAddress });
  }
}

export const authService = new AuthService();
