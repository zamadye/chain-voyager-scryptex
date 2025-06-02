
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '../config/environment';
import { logger } from '../utils/logger';
import { redisService } from '../services/RedisService';

// Enhanced security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.coingecko.com", "wss://", "https://"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for API documentation
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting with Redis store
const createRateLimiter = (windowMs: number, max: number, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    message: {
      success: false,
      error: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      });

      res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    },
    standardHeaders: 'draft-7',
    store: config.nodeEnv === 'production' ? undefined : undefined, // Would use Redis store in production
  });
};

// General API rate limiting
export const generalRateLimit = createRateLimiter(
  config.rateLimit.windowMs, // 15 minutes
  config.rateLimit.max // 100 requests
);

// Strict rate limiting for authentication endpoints
export const authRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts
  true // Don't count successful requests
);

// Very strict rate limiting for challenge generation
export const challengeRateLimit = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  3, // 3 challenges
  false
);

// IP-based rate limiting for suspicious activity
export const strictRateLimit = createRateLimiter(
  60 * 1000, // 1 minute
  10, // 10 requests
  false
);

// Request size limiting
export const requestSizeLimit = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    const maxSizeBytes = parseSize(maxSize);

    if (contentLength > maxSizeBytes) {
      logger.warn('Request size exceeded limit', {
        contentLength,
        maxSize: maxSizeBytes,
        ip: req.ip,
        path: req.path
      });

      return res.status(413).json({
        success: false,
        error: 'Request entity too large',
        maxSize
      });
    }

    next();
  };
};

// Helper function to parse size strings
function parseSize(size: string): number {
  const units: Record<string, number> = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)(b|kb|mb|gb)?$/);
  if (!match) return 0;

  const [, num, unit = 'b'] = match;
  return parseFloat(num) * units[unit];
}

// Request ID middleware for tracking
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.id = req.get('X-Request-ID') || 
           req.get('X-Correlation-ID') || 
           generateRequestId();
  
  res.set('X-Request-ID', req.id);
  next();
};

function generateRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Security headers for API responses
export const apiSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent caching of sensitive endpoints
  if (req.path.includes('/auth/') || req.path.includes('/profile')) {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
  }

  // API-specific headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });

  next();
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// Suspicious activity detection
export const suspiciousActivityDetection = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;
  const userAgent = req.get('User-Agent') || '';
  const path = req.path;

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // JavaScript injection
    /vbscript:/i,  // VBScript injection
  ];

  const requestData = JSON.stringify({
    path,
    query: req.query,
    body: req.body
  });

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestData));

  if (isSuspicious) {
    logger.warn('Suspicious activity detected', {
      ip,
      userAgent,
      path,
      method: req.method,
      suspiciousData: requestData
    });

    // Track suspicious IPs (in production, would use Redis)
    try {
      const key = `suspicious:${ip}`;
      const count = await redisService.get(key);
      const newCount = count ? parseInt(count) + 1 : 1;
      
      await redisService.set(key, newCount.toString(), 3600); // 1 hour TTL

      if (newCount > 5) {
        logger.error('IP blocked due to repeated suspicious activity', { ip, count: newCount });
        
        return res.status(403).json({
          success: false,
          error: 'Access denied due to suspicious activity'
        });
      }
    } catch (error) {
      logger.error('Failed to track suspicious activity', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  next();
};

// Bot detection (basic)
export const botDetection = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || '';
  
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /go-http-client/i
  ];

  const isBot = botPatterns.some(pattern => pattern.test(userAgent));

  if (isBot && !req.path.startsWith('/health')) {
    logger.info('Bot detected', {
      ip: req.ip,
      userAgent,
      path: req.path
    });

    return res.status(403).json({
      success: false,
      error: 'Automated requests not allowed'
    });
  }

  next();
};

// CORS preflight handling
export const corsHandler = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('Origin');
  const allowedOrigins = Array.isArray(config.cors.origin) ? config.cors.origin : [config.cors.origin];

  if (origin && allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  }

  res.set({
    'Access-Control-Allow-Methods': config.cors.methods.join(', '),
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Request-ID',
    'Access-Control-Allow-Credentials': config.cors.credentials.toString(),
    'Access-Control-Max-Age': '86400' // 24 hours
  });

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
};

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
