
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { logger } from '@/utils/logger';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      logger.warn('Validation failed:', {
        errors: errors.array(),
        body: req.body,
        params: req.params,
        query: req.query
      });
      
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    next();
  } catch (error) {
    logger.error('Validation middleware error:', error);
    return res.status(500).json({ error: 'Validation processing failed' });
  }
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Basic input sanitization
    if (req.body) {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      }
    }
    
    next();
  } catch (error) {
    logger.error('Sanitization middleware error:', error);
    return res.status(500).json({ error: 'Input sanitization failed' });
  }
};
