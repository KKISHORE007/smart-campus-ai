// ============================================================
// Student Helpdesk Agent — Middleware: Error Handler
// ============================================================
// Custom error class, async wrapper, and global error handler.
// ============================================================

import logger from '../utils/logger.js';

/**
 * Custom application error with HTTP status code.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wraps async route handlers to catch errors automatically.
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }));
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global error handler middleware — catches all unhandled errors.
 * Must be registered AFTER all routes.
 */
export const globalErrorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  logger.error(`${req.method} ${req.originalUrl} → ${statusCode}: ${err.message}`);

  if (process.env.NODE_ENV === 'development' && !err.isOperational) {
    logger.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
