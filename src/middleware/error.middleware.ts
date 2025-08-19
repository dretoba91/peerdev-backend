import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/loggers';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class ErrorMiddleware {
  
  // Global error handler
  static handleError(err: AppError, req: Request, res: Response, next: NextFunction): void {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    // Log error details
    logger.error('Error occurred:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (statusCode === 500 && !isDevelopment) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong on our end'
      });
    } else {
      res.status(statusCode).json({
        error: message,
        ...(isDevelopment && { stack: err.stack })
      });
    }
  }

  // Handle 404 errors
  static handleNotFound(req: Request, res: Response, next: NextFunction): void {
    const error: AppError = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    error.isOperational = true;
    
    next(error);
  }

  // Async error wrapper
  static asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  // Create operational error
  static createError(message: string, statusCode: number = 500): AppError {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
  }

  // Handle specific error types
  static handleDatabaseError(err: any): AppError {
    let message = 'Database operation failed';
    let statusCode = 500;

    // Handle specific MySQL errors
    if (err.code === 'ER_DUP_ENTRY') {
      message = 'Duplicate entry. Resource already exists';
      statusCode = 409;
    } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      message = 'Referenced resource does not exist';
      statusCode = 400;
    } else if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      message = 'Cannot delete resource. It is referenced by other records';
      statusCode = 409;
    }

    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
  }

  // Handle validation errors
  static handleValidationError(errors: string[]): AppError {
    const message = `Validation failed: ${errors.join(', ')}`;
    const error: AppError = new Error(message);
    error.statusCode = 400;
    error.isOperational = true;
    return error;
  }

  // Handle JWT errors
  static handleJWTError(err: any): AppError {
    let message = 'Authentication failed';
    let statusCode = 401;

    if (err.name === 'JsonWebTokenError') {
      message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      message = 'Token expired';
    }

    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
  }
}
