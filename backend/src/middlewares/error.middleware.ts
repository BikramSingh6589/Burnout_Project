import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for path ${err.path}`;
  }

  if (err.code === 11000) {
    statusCode = 400;
    const value = Object.keys(err.keyValue).join(', ');
    message = `Duplicate entry for field: ${value}`;
  }

  if (statusCode === 500) {
    logger.error('Unhandled server error:', err.stack || err);
  } else {
    logger.warn(`Operational client error: ${statusCode} - ${message}`);
  }

  const responseBody: Record<string, unknown> = {
    success: false,
    message: config.env === 'production' && statusCode === 500 ? 'Internal Server Error' : message,
  };

  if (config.env === 'development') {
    responseBody.stack = err.stack;
  }

  return res.status(statusCode).json(responseBody);
};
