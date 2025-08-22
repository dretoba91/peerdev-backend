import { Request, Response, NextFunction } from 'express';

/**
 * 404 handler for unmatched routes
 * This middleware catches requests that don't match any defined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.name = 'NotFoundError';
  next(error);
};

/**
 * Global error handler middleware
 * This handles all errors passed via next(error) from controllers and other middleware
 */
export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", error.message);

  // Determine status code based on error type/message
  let statusCode = 500; // Default to Internal Server Error

  if (error.name === 'NotFoundError' || error.message.includes("not found")) {
    statusCode = 404; // Not Found
  } else if (error.message.includes("already exists")) {
    statusCode = 409; // Conflict
  } else if (error.message.includes("Invalid")) {
    statusCode = 400; // Bad Request
  } else if (
    error.message.includes("validation") ||
    error.message.includes("required") ||
    error.message.includes("missing")
  ) {
    statusCode = 400; // Bad Request
  } else if (error.message.includes("unauthorized") || error.message.includes("access denied")) {
    statusCode = 401; // Unauthorized
  } else if (error.message.includes("forbidden")) {
    statusCode = 403; // Forbidden
  }

  // Send error response
  res.status(statusCode).json({
    error: error.message,
    // Include stack trace only in development
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};
