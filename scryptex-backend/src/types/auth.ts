
import { Request } from 'express';

export interface AuthChallenge {
  challenge: string;
  expiresAt: Date;
  walletAddress: string;
}

export interface AuthResult {
  user: User;
  tokens: TokenPair;
  session: UserSession;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  userId: string;
  walletAddress: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface WalletData {
  address: string;
  type: 'metamask' | 'walletconnect' | 'coinbase';
  chainId: number;
  nickname?: string;
}

export interface User {
  id: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  bio?: string;
  referralCode: string;
  referredBy?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface UserWallet {
  id: string;
  userId: string;
  walletAddress: string;
  walletType: string;
  chainId?: number;
  isPrimary: boolean;
  nickname?: string;
  createdAt: Date;
  lastUsed: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  walletAddress: string;
  sessionToken: string;
  refreshToken: string;
  expiresAt: Date;
  lastActive: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export interface CreateUserData {
  walletAddress: string;
  walletType: string;
  chainId?: number;
  username?: string;
  email?: string;
  referralCode?: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  bio?: string;
}

export interface ProfileData {
  username?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface FileUpload {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}
