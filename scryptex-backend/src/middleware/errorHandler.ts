
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { ResponseHelper } from '@/utils/response';
import { ZodError } from 'zod';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Zod validation errors
  if (error instanceof ZodError) {
    const validationErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return res.status(400).json(
      ResponseHelper.error(
        'VALIDATION_ERROR',
        'Invalid request data',
        validationErrors
      )
    );
  }

  // Custom application errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json(
      ResponseHelper.error(error.code, error.message)
    );
  }

  // Prisma errors
  if (error.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        return res.status(409).json(
          ResponseHelper.error('CONFLICT', 'Resource already exists')
        );
      case 'P2025':
        return res.status(404).json(
          ResponseHelper.error('NOT_FOUND', 'Resource not found')
        );
      default:
        return res.status(400).json(
          ResponseHelper.error('DATABASE_ERROR', 'Database operation failed')
        );
    }
  }

  // Default error
  return res.status(500).json(
    ResponseHelper.error(
      'INTERNAL_ERROR',
      'An unexpected error occurred',
      process.env.NODE_ENV === 'development' ? error.stack : undefined
    )
  );
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
