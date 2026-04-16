import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/loggers';

// 404 handler for unmatched routes
export const notFoundHandler = (
  req: Request, res: Response, next: NextFunction
) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

// Global error handler — must be last middleware in app.ts
export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  
  // AppError — thrown intentionally by our service layer
  if (error instanceof AppError) {
    logger.warn(`[${error.statusCode}] ${error.message}`);
    res.status(error.statusCode).json({ error: error.message });
    return;
  }


  // Unexpected error — log fully, hide details from client
  logger.error('Unexpected error:', error);
  res.status(500).json({
    error: 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && {
      details: error.message,
      stack: error.stack
    }),
  });
};