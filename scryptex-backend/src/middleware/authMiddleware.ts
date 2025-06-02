
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/AuthService';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types/auth';

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'MISSING_TOKEN'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const payload = await authService.verifyAccessToken(token);
      req.user = payload;
      
      logger.debug('Authentication successful', {
        userId: payload.userId,
        walletAddress: payload.walletAddress
      });

      next();
    } catch (error) {
      logger.warn('Authentication failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        token: token.substring(0, 20) + '...' // Log first 20 chars only
      });

      const message = error instanceof Error ? error.message : 'Invalid token';
      const code = message.includes('expired') ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';

      res.status(401).json({
        success: false,
        error: message,
        code
      });
    }
  } catch (error) {
    logger.error('Auth middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without authentication
    next();
    return;
  }

  try {
    const token = authHeader.substring(7);
    const payload = await authService.verifyAccessToken(token);
    req.user = payload;
    
    logger.debug('Optional authentication successful', {
      userId: payload.userId,
      walletAddress: payload.walletAddress
    });
  } catch (error) {
    // Token provided but invalid, log but continue
    logger.warn('Optional authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  next();
};

// Middleware for admin-only routes (future use)
export const adminMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  // TODO: Implement admin role checking when user roles are added
  // For now, this is a placeholder
  logger.debug('Admin check passed', { userId: req.user.userId });
  next();
};

// Rate limiting per user
export const userRateLimitMiddleware = (requestsPerMinute: number = 60) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next();
      return;
    }

    const userId = req.user.userId;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute

    const userLimit = userRequests.get(userId);
    
    if (!userLimit || now > userLimit.resetTime) {
      // Reset or initialize user's rate limit
      userRequests.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }

    if (userLimit.count >= requestsPerMinute) {
      res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
      return;
    }

    userLimit.count++;
    next();
  };
};
