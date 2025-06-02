
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config/environment';
import { logger } from '@/utils/logger';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    wallet_address?: string;
    email?: string;
    username?: string;
  };
}

export class AuthMiddleware {
  async authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required' });
      }

      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, config.jwt.secret) as any;
        req.user = {
          id: decoded.userId || decoded.id,
          wallet_address: decoded.wallet_address,
          email: decoded.email,
          username: decoded.username
        };
        
        next();
      } catch (jwtError) {
        logger.warn('Invalid JWT token:', jwtError);
        return res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      logger.error('AuthMiddleware.authenticate error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }

  async optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        try {
          const decoded = jwt.verify(token, config.jwt.secret) as any;
          req.user = {
            id: decoded.userId || decoded.id,
            wallet_address: decoded.wallet_address,
            email: decoded.email,
            username: decoded.username
          };
        } catch (jwtError) {
          // Continue without user for optional auth
          logger.debug('Optional auth failed:', jwtError);
        }
      }
      
      next();
    } catch (error) {
      logger.error('AuthMiddleware.optionalAuth error:', error);
      next();
    }
  }
}

export const authMiddleware = new AuthMiddleware();
