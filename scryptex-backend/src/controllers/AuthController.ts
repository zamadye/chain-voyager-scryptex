
import { Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { userService } from '../services/UserService';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth';
import { validateRequest } from '../middleware/validation';
import { 
  challengeSchema, 
  verifySignatureSchema, 
  refreshTokenSchema,
  addWalletSchema,
  updateProfileSchema 
} from '../validators/authValidators';

export class AuthController {
  async generateChallenge(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = challengeSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.details
        });
        return;
      }

      const { walletAddress } = value;
      const challenge = await authService.generateChallenge(walletAddress);

      res.json({
        success: true,
        data: {
          challenge: challenge.challenge,
          expiresAt: challenge.expiresAt,
          message: 'Please sign this challenge with your wallet to authenticate'
        }
      });
    } catch (error) {
      logger.error('Generate challenge error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        body: req.body
      });

      res.status(500).json({
        success: false,
        error: 'Failed to generate authentication challenge'
      });
    }
  }

  async verifySignature(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = verifySignatureSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.details
        });
        return;
      }

      const { walletAddress, signature, challenge } = value;
      const authResult = await authService.verifySignature(walletAddress, signature, challenge);

      // Set HTTP-only cookie for refresh token (optional, for web clients)
      res.cookie('refreshToken', authResult.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        data: {
          user: {
            id: authResult.user.id,
            username: authResult.user.username,
            email: authResult.user.email,
            avatarUrl: authResult.user.avatarUrl,
            bio: authResult.user.bio,
            referralCode: authResult.user.referralCode,
            createdAt: authResult.user.createdAt,
            lastLogin: authResult.user.lastLogin
          },
          accessToken: authResult.tokens.accessToken,
          refreshToken: authResult.tokens.refreshToken,
          expiresIn: authResult.tokens.expiresIn
        },
        message: 'Authentication successful'
      });
    } catch (error) {
      logger.error('Verify signature error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        walletAddress: req.body.walletAddress
      });

      const message = error instanceof Error ? error.message : 'Authentication failed';
      const statusCode = message.includes('Invalid') || message.includes('expired') ? 401 : 500;

      res.status(statusCode).json({
        success: false,
        error: message
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = refreshTokenSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.details
        });
        return;
      }

      let { refreshToken } = value;
      
      // Fallback to cookie if not in body
      if (!refreshToken) {
        refreshToken = req.cookies.refreshToken;
      }

      if (!refreshToken) {
        res.status(401).json({
          success: false,
          error: 'Refresh token required'
        });
        return;
      }

      const tokens = await authService.refreshTokens(refreshToken);

      // Update HTTP-only cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      });
    } catch (error) {
      logger.error('Refresh token error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      const message = error instanceof Error ? error.message : 'Token refresh failed';
      const statusCode = message.includes('Invalid') || message.includes('not found') ? 401 : 500;

      res.status(statusCode).json({
        success: false,
        error: message
      });
    }
  }

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      await authService.revokeSession(req.user.sessionId);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Logout error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId
      });

      res.status(500).json({
        success: false,
        error: 'Logout failed'
      });
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const user = await userService.getUserById(req.user.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const wallets = await userService.getUserWallets(req.user.userId);
      const stats = await userService.getUserStats(req.user.userId);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            referralCode: user.referralCode,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            lastLogin: user.lastLogin
          },
          wallets: wallets.map(wallet => ({
            id: wallet.id,
            address: wallet.walletAddress,
            type: wallet.walletType,
            chainId: wallet.chainId,
            isPrimary: wallet.isPrimary,
            nickname: wallet.nickname,
            createdAt: wallet.createdAt,
            lastUsed: wallet.lastUsed
          })),
          stats
        }
      });
    } catch (error) {
      logger.error('Get profile error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve profile'
      });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { error, value } = updateProfileSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.details
        });
        return;
      }

      const updatedUser = await userService.updateProfile(req.user.userId, value);

      res.json({
        success: true,
        data: {
          user: {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            avatarUrl: updatedUser.avatarUrl,
            bio: updatedUser.bio,
            referralCode: updatedUser.referralCode,
            updatedAt: updatedUser.updatedAt
          }
        },
        message: 'Profile updated successfully'
      });
    } catch (error) {
      logger.error('Update profile error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId
      });

      const message = error instanceof Error ? error.message : 'Profile update failed';
      const statusCode = message.includes('already') ? 409 : 500;

      res.status(statusCode).json({
        success: false,
        error: message
      });
    }
  }

  async getWallets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const wallets = await userService.getUserWallets(req.user.userId);

      res.json({
        success: true,
        data: {
          wallets: wallets.map(wallet => ({
            id: wallet.id,
            address: wallet.walletAddress,
            type: wallet.walletType,
            chainId: wallet.chainId,
            isPrimary: wallet.isPrimary,
            nickname: wallet.nickname,
            createdAt: wallet.createdAt,
            lastUsed: wallet.lastUsed
          }))
        }
      });
    } catch (error) {
      logger.error('Get wallets error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve wallets'
      });
    }
  }

  async addWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { error, value } = addWalletSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: error.details
        });
        return;
      }

      const wallet = await authService.linkWallet(req.user.userId, value);

      res.status(201).json({
        success: true,
        data: {
          wallet: {
            id: wallet.id,
            address: wallet.walletAddress,
            type: wallet.walletType,
            chainId: wallet.chainId,
            isPrimary: wallet.isPrimary,
            nickname: wallet.nickname,
            createdAt: wallet.createdAt
          }
        },
        message: 'Wallet linked successfully'
      });
    } catch (error) {
      logger.error('Add wallet error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId
      });

      const message = error instanceof Error ? error.message : 'Failed to link wallet';
      const statusCode = message.includes('already') ? 409 : 500;

      res.status(statusCode).json({
        success: false,
        error: message
      });
    }
  }

  async removeWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { walletAddress } = req.params;
      if (!walletAddress) {
        res.status(400).json({
          success: false,
          error: 'Wallet address required'
        });
        return;
      }

      const success = await authService.unlinkWallet(req.user.userId, walletAddress);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Wallet not found or already removed'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Wallet removed successfully'
      });
    } catch (error) {
      logger.error('Remove wallet error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        walletAddress: req.params.walletAddress
      });

      const message = error instanceof Error ? error.message : 'Failed to remove wallet';
      const statusCode = message.includes('Cannot unlink') ? 400 : 500;

      res.status(statusCode).json({
        success: false,
        error: message
      });
    }
  }

  async setPrimaryWallet(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const { walletAddress } = req.params;
      if (!walletAddress) {
        res.status(400).json({
          success: false,
          error: 'Wallet address required'
        });
        return;
      }

      const success = await authService.setPrimaryWallet(req.user.userId, walletAddress);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Wallet not found or failed to set as primary'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Primary wallet updated successfully'
      });
    } catch (error) {
      logger.error('Set primary wallet error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        walletAddress: req.params.walletAddress
      });

      res.status(500).json({
        success: false,
        error: 'Failed to set primary wallet'
      });
    }
  }
}

export const authController = new AuthController();
