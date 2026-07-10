import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { isProd } from '../config/env';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let apiError: ApiError;

  if (err instanceof ApiError) {
    apiError = err;
  } else if (err instanceof mongoose.Error.ValidationError) {
    apiError = ApiError.badRequest('Validation failed', err.errors);
  } else if (err instanceof mongoose.Error.CastError) {
    apiError = ApiError.badRequest(`Invalid ${err.path}`);
  } else if ((err as { code?: number })?.code === 11000) {
    apiError = ApiError.conflict('Duplicate value violates a unique constraint');
  } else {
    apiError = ApiError.internal();
    logger.error({ err }, 'Unhandled error');
  }

  if (apiError.statusCode >= 500) {
    logger.error({ err, path: req.originalUrl }, apiError.message);
  }

  res.status(apiError.statusCode).json({
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      details: apiError.details,
      ...(isProd ? {} : { stack: apiError.stack }),
    },
  });
}
