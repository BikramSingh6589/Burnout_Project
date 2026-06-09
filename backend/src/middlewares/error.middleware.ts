import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import { ErrorResponse } from '../types/common.types';

/**
 * Standard operational error class for the application.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Express Error Handling Middleware.
 */
export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors: any = undefined;

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((el: any) => el.message);
  }

  // Handle Mongoose Cast Error (e.g. invalid MongoDB ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for path ${err.path}`;
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const value = Object.keys(err.keyValue).join(', ');
    message = `Duplicate entry for field: ${value}`;
  }

  // Log error details
  if (statusCode === 500) {
    logger.error(`Unhandled server error: ${err.message || err}`, err.stack);
  } else {
    logger.warn(`Operational client error: ${statusCode} - ${message}`);
  }

  const responseBody: ErrorResponse = {
    success: false,
    message: statusCode === 500 && config.env === 'production' ? 'Internal Server Error' : message,
  };

  if (errors) {
    responseBody.errors = errors;
  }

  // Show stack traces only during development
  if (config.env === 'development') {
    responseBody.stack = err.stack;
  }

  res.status(statusCode).json(responseBody);
};
