
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/environment';
import { logger } from '../utils/logger';
import { databaseService } from './DatabaseService';
import { redisService } from './RedisService';
import { 
  AuthChallenge, 
  AuthResult, 
  TokenPair, 
  TokenPayload, 
  WalletData, 
  User, 
  UserWallet,
  CreateUserData 
} from '../types/auth';

export class AuthService {
  private readonly challengeExpiry = 300; // 5 minutes
  private readonly sessionExpiry = 7 * 24 * 60 * 60; // 7 days

  async generateChallenge(walletAddress: string): Promise<AuthChallenge> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      const nonce = Math.random().toString(36).substring(7);
      const timestamp = Date.now();
      const challenge = `Sign this message to authenticate with SCRYPTEX:\n\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
      const expiresAt = new Date(Date.now() + this.challengeExpiry * 1000);

      // Store challenge in Redis
      await redisService.setChallenge(normalizedAddress, JSON.stringify({
        challenge,
        nonce,
        timestamp,
        expiresAt: expiresAt.toISOString()
      }), this.challengeExpiry);

      logger.info('Challenge generated', { walletAddress: normalizedAddress });

      return {
        challenge,
        expiresAt,
        walletAddress: normalizedAddress
      };
    } catch (error) {
      logger.error('Failed to generate challenge', {
        walletAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to generate authentication challenge');
    }
  }

  async verifySignature(walletAddress: string, signature: string, providedChallenge: string): Promise<AuthResult> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      // Retrieve stored challenge
      const storedChallengeData = await redisService.getChallenge(normalizedAddress);
      if (!storedChallengeData) {
        throw new Error('Challenge not found or expired');
      }

      const challengeData = JSON.parse(storedChallengeData);
      
      // Verify challenge matches
      if (challengeData.challenge !== providedChallenge) {
        throw new Error('Invalid challenge');
      }

      // Verify signature
      const recoveredAddress = ethers.utils.verifyMessage(providedChallenge, signature);
      if (recoveredAddress.toLowerCase() !== normalizedAddress) {
        throw new Error('Invalid signature');
      }

      // Clean up used challenge
      await redisService.deleteChallenge(normalizedAddress);

      // Find or create user
      let user = await this.getUserByWallet(normalizedAddress);
      if (!user) {
        user = await this.createUser({
          walletAddress: normalizedAddress,
          walletType: 'metamask', // Default, can be updated later
        });
      }

      // Update last login
      await this.updateLastLogin(user.id);

      // Generate tokens
      const tokens = await this.generateTokens(user.id, normalizedAddress);

      // Create session
      const session = await this.createSession(user.id, normalizedAddress, tokens);

      logger.info('User authenticated successfully', { 
        userId: user.id, 
        walletAddress: normalizedAddress 
      });

      return { user, tokens, session };
    } catch (error) {
      logger.error('Authentication failed', {
        walletAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async generateTokens(userId: string, walletAddress: string): Promise<TokenPair> {
    try {
      const sessionId = uuidv4();
      
      const accessTokenPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
        userId,
        walletAddress,
        sessionId
      };

      const accessToken = jwt.sign(accessTokenPayload, config.jwt.secret, {
        expiresIn: config.jwt.accessTokenExpiry,
        issuer: config.jwt.issuer,
      });

      const refreshToken = jwt.sign({ 
        userId, 
        sessionId, 
        type: 'refresh' 
      }, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshTokenExpiry,
        issuer: config.jwt.issuer,
      });

      const decodedToken = jwt.decode(accessToken) as any;
      const expiresIn = decodedToken.exp - decodedToken.iat;

      return { accessToken, refreshToken, expiresIn };
    } catch (error) {
      logger.error('Failed to generate tokens', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw new Error('Failed to generate authentication tokens');
    }
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as TokenPayload;
      
      // Check if session is still active
      const sessionData = await redisService.getSession(payload.sessionId);
      if (!sessionData || !sessionData.isActive) {
        throw new Error('Session not found or inactive');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;
      
      if (payload.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Check if session exists and is active
      const sessionData = await redisService.getSession(payload.sessionId);
      if (!sessionData || !sessionData.isActive) {
        throw new Error('Session not found or inactive');
      }

      // Generate new tokens
      const newTokens = await this.generateTokens(payload.userId, sessionData.walletAddress);
      
      // Update session with new tokens
      await this.updateSessionTokens(payload.sessionId, newTokens);

      return newTokens;
    } catch (error) {
      logger.error('Failed to refresh tokens', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async revokeSession(sessionId: string): Promise<boolean> {
    try {
      await redisService.deleteSession(sessionId);
      
      // Also mark session as inactive in database
      await databaseService.query(
        'UPDATE user_sessions SET is_active = FALSE WHERE session_token = $1',
        [sessionId]
      );

      return true;
    } catch (error) {
      logger.error('Failed to revoke session', {
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  async linkWallet(userId: string, walletData: WalletData): Promise<UserWallet> {
    try {
      const normalizedAddress = walletData.address.toLowerCase();

      // Check if wallet is already linked to another user
      const existingUser = await this.getUserByWallet(normalizedAddress);
      if (existingUser && existingUser.id !== userId) {
        throw new Error('Wallet is already linked to another account');
      }

      // Check if this is the first wallet for the user
      const existingWallets = await this.getUserWallets(userId);
      const isPrimary = existingWallets.length === 0;

      const walletId = uuidv4();
      const now = new Date();

      await databaseService.query(`
        INSERT INTO user_wallets (id, user_id, wallet_address, wallet_type, chain_id, is_primary, nickname, created_at, last_used)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      `, [
        walletId,
        userId,
        normalizedAddress,
        walletData.type,
        walletData.chainId || null,
        isPrimary,
        walletData.nickname || null,
        now
      ]);

      const wallet = await databaseService.queryOne<UserWallet>(`
        SELECT * FROM user_wallets WHERE id = $1
      `, [walletId]);

      if (!wallet) {
        throw new Error('Failed to create wallet record');
      }

      logger.info('Wallet linked successfully', { userId, walletAddress: normalizedAddress });
      return wallet;
    } catch (error) {
      logger.error('Failed to link wallet', {
        userId,
        walletAddress: walletData.address,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async unlinkWallet(userId: string, walletAddress: string): Promise<boolean> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      // Don't allow unlinking the last wallet
      const userWallets = await this.getUserWallets(userId);
      if (userWallets.length <= 1) {
        throw new Error('Cannot unlink the last wallet from account');
      }

      const result = await databaseService.query(
        'DELETE FROM user_wallets WHERE user_id = $1 AND wallet_address = $2',
        [userId, normalizedAddress]
      );

      if (result.length === 0) {
        return false;
      }

      // If primary wallet was removed, set another wallet as primary
      const remainingWallets = await this.getUserWallets(userId);
      const hasPrimary = remainingWallets.some(w => w.isPrimary);
      
      if (!hasPrimary && remainingWallets.length > 0) {
        await this.setPrimaryWallet(userId, remainingWallets[0].walletAddress);
      }

      logger.info('Wallet unlinked successfully', { userId, walletAddress: normalizedAddress });
      return true;
    } catch (error) {
      logger.error('Failed to unlink wallet', {
        userId,
        walletAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async setPrimaryWallet(userId: string, walletAddress: string): Promise<boolean> {
    try {
      const normalizedAddress = walletAddress.toLowerCase();

      await databaseService.withTransaction(async (client) => {
        // Unset all primary flags for user
        await client.query(
          'UPDATE user_wallets SET is_primary = FALSE WHERE user_id = $1',
          [userId]
        );

        // Set new primary wallet
        await client.query(
          'UPDATE user_wallets SET is_primary = TRUE WHERE user_id = $1 AND wallet_address = $2',
          [userId, normalizedAddress]
        );
      });

      logger.info('Primary wallet updated', { userId, walletAddress: normalizedAddress });
      return true;
    } catch (error) {
      logger.error('Failed to set primary wallet', {
        userId,
        walletAddress,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  private async getUserByWallet(walletAddress: string): Promise<User | null> {
    const result = await databaseService.queryOne<User>(`
      SELECT u.* FROM users u
      JOIN user_wallets uw ON u.id = uw.user_id
      WHERE uw.wallet_address = $1
    `, [walletAddress.toLowerCase()]);

    return result;
  }

  private async getUserWallets(userId: string): Promise<UserWallet[]> {
    return await databaseService.query<UserWallet>(`
      SELECT * FROM user_wallets WHERE user_id = $1 ORDER BY created_at ASC
    `, [userId]);
  }

  private async createUser(userData: CreateUserData): Promise<User> {
    const userId = uuidv4();
    const referralCode = this.generateReferralCode();
    const now = new Date();

    await databaseService.withTransaction(async (client) => {
      // Create user
      await client.query(`
        INSERT INTO users (id, username, email, referral_code, referred_by, created_at, updated_at, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $6, TRUE)
      `, [
        userId,
        userData.username || null,
        userData.email || null,
        referralCode,
        userData.referralCode || null,
        now
      ]);

      // Create primary wallet
      await client.query(`
        INSERT INTO user_wallets (id, user_id, wallet_address, wallet_type, chain_id, is_primary, created_at, last_used)
        VALUES ($1, $2, $3, $4, $5, TRUE, $6, $6)
      `, [
        uuidv4(),
        userId,
        userData.walletAddress.toLowerCase(),
        userData.walletType,
        userData.chainId || null,
        now
      ]);
    });

    const user = await databaseService.queryOne<User>(`
      SELECT * FROM users WHERE id = $1
    `, [userId]);

    if (!user) {
      throw new Error('Failed to create user');
    }

    logger.info('User created successfully', { userId, walletAddress: userData.walletAddress });
    return user;
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await databaseService.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [userId]
    );
  }

  private async createSession(userId: string, walletAddress: string, tokens: TokenPair): Promise<any> {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + this.sessionExpiry * 1000);

    const sessionData = {
      userId,
      walletAddress,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: expiresAt.toISOString(),
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Store in Redis
    await redisService.setSession(sessionId, sessionData, this.sessionExpiry);

    // Store in database
    await databaseService.query(`
      INSERT INTO user_sessions (id, user_id, wallet_address, session_token, refresh_token, expires_at, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, TRUE)
    `, [
      sessionId,
      userId,
      walletAddress,
      tokens.accessToken,
      tokens.refreshToken,
      expiresAt
    ]);

    return { id: sessionId, ...sessionData };
  }

  private async updateSessionTokens(sessionId: string, tokens: TokenPair): Promise<void> {
    const expiresAt = new Date(Date.now() + this.sessionExpiry * 1000);

    // Update Redis
    const sessionData = await redisService.getSession(sessionId);
    if (sessionData) {
      sessionData.accessToken = tokens.accessToken;
      sessionData.refreshToken = tokens.refreshToken;
      sessionData.expiresAt = expiresAt.toISOString();
      await redisService.setSession(sessionId, sessionData, this.sessionExpiry);
    }

    // Update database
    await databaseService.query(`
      UPDATE user_sessions 
      SET session_token = $1, refresh_token = $2, expires_at = $3, last_active = NOW()
      WHERE id = $4
    `, [tokens.accessToken, tokens.refreshToken, expiresAt, sessionId]);
  }

  private generateReferralCode(): string {
    return 'STEX-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

export const authService = new AuthService();
