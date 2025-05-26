
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '@/config/config';
import { ResponseHelper } from '@/utils/response';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    walletAddress: string;
    email?: string;
    username?: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(
        ResponseHelper.error('UNAUTHORIZED', 'Access token required')
      );
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      
      // Check if session is still active
      const session = await prisma.userSession.findFirst({
        where: {
          token,
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (!session) {
        return res.status(401).json(
          ResponseHelper.error('UNAUTHORIZED', 'Invalid or expired token')
        );
      }

      req.user = {
        id: session.user.id,
        walletAddress: session.user.walletAddress,
        email: session.user.email || undefined,
        username: session.user.username || undefined,
      };

      next();
    } catch (jwtError) {
      logger.error('JWT verification failed:', jwtError);
      return res.status(401).json(
        ResponseHelper.error('UNAUTHORIZED', 'Invalid token')
      );
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json(
      ResponseHelper.error('INTERNAL_ERROR', 'Authentication error')
    );
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    await authMiddleware(req, res, next);
  } catch (error) {
    // If auth fails, continue without user
    next();
  }
};

export const adminMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json(
      ResponseHelper.error('UNAUTHORIZED', 'Authentication required')
    );
  }

  // Check if user is admin (you can implement your own admin logic)
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user || user.email !== config.adminEmail) {
    return res.status(403).json(
      ResponseHelper.error('FORBIDDEN', 'Admin access required')
    );
  }

  next();
};
