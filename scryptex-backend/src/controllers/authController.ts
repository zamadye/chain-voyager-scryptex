
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { verifyMessage } from 'viem';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { config } from '@/config/config';
import { ResponseHelper } from '@/utils/response';
import { logger } from '@/utils/logger';
import { asyncHandler, AppError } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';

const prisma = new PrismaClient();

// Validation schemas
const connectWalletSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
});

const verifySignatureSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
  signature: z.string(),
  nonce: z.string(),
});

const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(50).optional(),
});

// Temporary nonce storage (in production, use Redis)
const nonceStore = new Map<string, { nonce: string; timestamp: number }>();

class AuthController {
  connectWallet = asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress } = connectWalletSchema.parse(req.body);

    // Generate nonce
    const nonce = Math.random().toString(36).substring(7);
    const timestamp = Date.now();

    // Store nonce temporarily (expires in 5 minutes)
    nonceStore.set(walletAddress.toLowerCase(), { nonce, timestamp });

    // Clean up expired nonces
    this.cleanupExpiredNonces();

    logger.info(`Nonce generated for wallet: ${walletAddress}`);

    res.json(ResponseHelper.success({
      nonce,
      message: `Sign this message to authenticate with SCRYPTEX: ${nonce}`,
    }));
  });

  verifySignature = asyncHandler(async (req: Request, res: Response) => {
    const { walletAddress, signature, nonce } = verifySignatureSchema.parse(req.body);

    const normalizedAddress = walletAddress.toLowerCase();

    // Verify nonce
    const storedNonce = nonceStore.get(normalizedAddress);
    if (!storedNonce || storedNonce.nonce !== nonce) {
      throw new AppError('Invalid or expired nonce', 400, 'INVALID_NONCE');
    }

    // Check nonce expiration (5 minutes)
    if (Date.now() - storedNonce.timestamp > 5 * 60 * 1000) {
      nonceStore.delete(normalizedAddress);
      throw new AppError('Nonce expired', 400, 'NONCE_EXPIRED');
    }

    // Verify signature
    const message = `Sign this message to authenticate with SCRYPTEX: ${nonce}`;
    
    try {
      const isValid = await verifyMessage({
        address: walletAddress as `0x${string}`,
        message,
        signature: signature as `0x${string}`,
      });

      if (!isValid) {
        throw new AppError('Invalid signature', 400, 'INVALID_SIGNATURE');
      }
    } catch (error) {
      logger.error('Signature verification failed:', error);
      throw new AppError('Signature verification failed', 400, 'SIGNATURE_VERIFICATION_FAILED');
    }

    // Clean up used nonce
    nonceStore.delete(normalizedAddress);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: normalizedAddress },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: normalizedAddress,
        },
      });
      logger.info(`New user created: ${user.id}`);
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, walletAddress: user.walletAddress },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn }
    );

    // Store session
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        token: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    logger.info(`User authenticated: ${user.id}`);

    res.json(ResponseHelper.success({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    }));
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400, 'REFRESH_TOKEN_REQUIRED');
    }

    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as any;

      // Find session
      const session = await prisma.userSession.findFirst({
        where: {
          refreshToken,
          isActive: true,
        },
        include: {
          user: true,
        },
      });

      if (!session) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { userId: session.user.id, walletAddress: session.user.walletAddress },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      // Update session
      await prisma.userSession.update({
        where: { id: session.id },
        data: {
          token: newAccessToken,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      res.json(ResponseHelper.success({
        accessToken: newAccessToken,
      }));
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  });

  logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.substring(7);

    if (token) {
      await prisma.userSession.updateMany({
        where: {
          token,
          userId: req.user!.id,
        },
        data: {
          isActive: false,
        },
      });
    }

    logger.info(`User logged out: ${req.user!.id}`);

    res.json(ResponseHelper.success({ message: 'Logout successful' }));
  });

  getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        preferences: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json(ResponseHelper.success({
      id: user.id,
      walletAddress: user.walletAddress,
      email: user.email,
      username: user.username,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      preferences: user.preferences,
    }));
  });

  updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const updateData = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
    });

    logger.info(`User profile updated: ${user.id}`);

    res.json(ResponseHelper.success({
      id: user.id,
      walletAddress: user.walletAddress,
      email: user.email,
      username: user.username,
      updatedAt: user.updatedAt,
    }));
  });

  private cleanupExpiredNonces() {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;

    for (const [address, data] of nonceStore.entries()) {
      if (data.timestamp < fiveMinutesAgo) {
        nonceStore.delete(address);
      }
    }
  }
}

export const authController = new AuthController();
