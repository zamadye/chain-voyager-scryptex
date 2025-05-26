
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';

export interface RequestWithId extends Request {
  requestId: string;
}

export const requestLogger = (
  req: RequestWithId,
  res: Response,
  next: NextFunction
) => {
  const requestId = uuidv4();
  req.requestId = requestId;

  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);

  const startTime = Date.now();

  // Log request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentLength: req.get('Content-Length'),
  });

  // Log response
  const originalSend = res.send;
  res.send = function (body: any) {
    const duration = Date.now() - startTime;
    
    logger.info('Outgoing response', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: body ? body.length : 0,
    });

    return originalSend.call(this, body);
  };

  next();
};
