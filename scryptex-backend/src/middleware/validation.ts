
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export const validateRequest = (schema: Joi.ObjectSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const dataToValidate = req[source];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.warn('Validation error', {
        source,
        errors: validationErrors,
        originalData: dataToValidate
      });

      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
      return;
    }

    // Replace the original data with validated and sanitized data
    req[source] = value;
    next();
  };
};

export const validateBody = (schema: Joi.ObjectSchema) => validateRequest(schema, 'body');
export const validateParams = (schema: Joi.ObjectSchema) => validateRequest(schema, 'params');
export const validateQuery = (schema: Joi.ObjectSchema) => validateRequest(schema, 'query');

// Custom validation middleware for file uploads
export const validateFileUpload = (options: {
  required?: boolean;
  maxSize?: number;
  allowedMimeTypes?: string[];
  maxFiles?: number;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const {
      required = false,
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      maxFiles = 1
    } = options;

    const files = req.files as Express.Multer.File[] | undefined;
    const file = req.file as Express.Multer.File | undefined;

    // Check if file is required
    if (required && !file && (!files || files.length === 0)) {
      res.status(400).json({
        success: false,
        error: 'File upload is required'
      });
      return;
    }

    // If no file and not required, continue
    if (!file && (!files || files.length === 0)) {
      next();
      return;
    }

    const filesToValidate = files || (file ? [file] : []);

    // Check number of files
    if (filesToValidate.length > maxFiles) {
      res.status(400).json({
        success: false,
        error: `Maximum ${maxFiles} file(s) allowed`
      });
      return;
    }

    // Validate each file
    for (const uploadedFile of filesToValidate) {
      // Check file size
      if (uploadedFile.size > maxSize) {
        res.status(400).json({
          success: false,
          error: `File size exceeds maximum limit of ${Math.round(maxSize / 1024 / 1024)}MB`
        });
        return;
      }

      // Check mime type
      if (!allowedMimeTypes.includes(uploadedFile.mimetype)) {
        res.status(400).json({
          success: false,
          error: `File type ${uploadedFile.mimetype} not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`
        });
        return;
      }

      // Additional security: Check file extension matches mime type
      const expectedExtensions: Record<string, string[]> = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp'],
        'image/gif': ['.gif']
      };

      const fileExtension = uploadedFile.originalname.toLowerCase().substring(uploadedFile.originalname.lastIndexOf('.'));
      const allowedExtensions = expectedExtensions[uploadedFile.mimetype] || [];
      
      if (!allowedExtensions.includes(fileExtension)) {
        res.status(400).json({
          success: false,
          error: `File extension ${fileExtension} does not match file type ${uploadedFile.mimetype}`
        });
        return;
      }
    }

    logger.debug('File validation passed', {
      fileCount: filesToValidate.length,
      totalSize: filesToValidate.reduce((sum, f) => sum + f.size, 0),
      mimeTypes: filesToValidate.map(f => f.mimetype)
    });

    next();
  };
};

// Middleware to sanitize string inputs
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      // Basic XSS prevention
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .trim();
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

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);

  next();
};

// Validation helper for common patterns
export const commonValidations = {
  ethereumAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/),
  uuid: Joi.string().uuid(),
  positiveInteger: Joi.number().integer().positive(),
  nonNegativeInteger: Joi.number().integer().min(0),
  paginationLimit: Joi.number().integer().min(1).max(100).default(20),
  paginationPage: Joi.number().integer().min(1).default(1),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  email: Joi.string().email(),
  url: Joi.string().uri(),
  username: Joi.string().alphanum().min(3).max(30),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  chainId: Joi.number().integer().positive(),
  timestamp: Joi.date().iso(),
  hash: Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/),
  searchQuery: Joi.string().min(1).max(100).trim()
};
