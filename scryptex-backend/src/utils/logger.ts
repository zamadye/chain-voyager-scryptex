
import winston from 'winston';
import { config } from '../config/environment';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    
    const logEntry: any = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    };

    if (stack) {
      logEntry.stack = stack;
    }

    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${level}: ${message} ${metaStr}`;
  })
);

// Create transports array
const transports: winston.transport[] = [];

// Console transport
if (config.nodeEnv === 'development') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: config.logging.level,
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      format: logFormat,
      level: config.logging.level,
    })
  );
}

// File transports for production
if (config.nodeEnv !== 'development') {
  // General log file
  transports.push(
    new winston.transports.File({
      filename: 'logs/app.log',
      format: logFormat,
      level: config.logging.level,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: config.logging.maxFiles,
    })
  );

  // Error log file
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      format: logFormat,
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: config.logging.maxFiles,
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { 
    service: 'scryptex-backend',
    version: process.env.npm_package_version || '1.0.0',
    environment: config.nodeEnv,
    pid: process.pid
  },
  transports,
  exitOnError: false,
});

// Handle uncaught exceptions and unhandled rejections
if (config.nodeEnv === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({ 
      filename: 'logs/exceptions.log',
      format: logFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    })
  );

  logger.rejections.handle(
    new winston.transports.File({ 
      filename: 'logs/rejections.log',
      format: logFormat,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    })
  );
}

// Add request ID to logs (middleware will set this)
export const addRequestId = (requestId: string) => {
  return logger.child({ requestId });
};

// Export logger with additional convenience methods
export default logger;

// Utility functions for structured logging
export const loggers = {
  // HTTP request logging
  request: (method: string, url: string, status: number, duration: number, userAgent?: string, ip?: string) => {
    logger.info('HTTP Request', {
      type: 'http_request',
      method,
      url,
      status,
      duration: `${duration}ms`,
      userAgent,
      ip
    });
  },

  // Database query logging
  database: (query: string, duration: number, rowCount?: number) => {
    logger.debug('Database Query', {
      type: 'database_query',
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      duration: `${duration}ms`,
      rowCount
    });
  },

  // Authentication events
  auth: (event: string, userId?: string, walletAddress?: string, success: boolean = true) => {
    const level = success ? 'info' : 'warn';
    logger[level]('Authentication Event', {
      type: 'auth_event',
      event,
      userId,
      walletAddress,
      success
    });
  },

  // Security events
  security: (event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium') => {
    const level = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
    logger[level]('Security Event', {
      type: 'security_event',
      event,
      severity,
      ...details
    });
  },

  // Business logic events
  business: (action: string, userId?: string, details?: any) => {
    logger.info('Business Event', {
      type: 'business_event',
      action,
      userId,
      ...details
    });
  },

  // Performance monitoring
  performance: (operation: string, duration: number, details?: any) => {
    const level = duration > 1000 ? 'warn' : 'debug';
    logger[level]('Performance Event', {
      type: 'performance_event',
      operation,
      duration: `${duration}ms`,
      ...details
    });
  },

  // Error tracking with context
  error: (error: Error, context?: any) => {
    logger.error('Application Error', {
      type: 'application_error',
      message: error.message,
      stack: error.stack,
      ...context
    });
  }
};
