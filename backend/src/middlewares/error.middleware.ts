import type { NextFunction, Request, Response } from "express";
import { config } from "../config/env.js";
import { logger } from "../utils/logger.js";

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

interface ErrorLike {
  name?: string;
  message?: string;
  stack?: string;
  statusCode?: number;
  code?: number;
  path?: string;
  keyValue?: Record<string, unknown>;
}

const isErrorLike = (error: unknown): error is ErrorLike => {
  return typeof error === "object" && error !== null;
};

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  const error = isErrorLike(err) ? err : {};
  let statusCode = error.statusCode || 500;
  let message = error.message || "Internal Server Error";

  // Handle custom validation errors with statusCode property
  if (error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number') {
    statusCode = error.statusCode;
  }

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
  }

  if (error.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for path ${error.path ?? "unknown"}`;
  }

  if (error.code === 11000 && error.keyValue) {
    statusCode = 400;
    const value = Object.keys(error.keyValue).join(", ");
    message = `Duplicate entry for field: ${value}`;
  }

  if (statusCode === 500) {
    logger.error("Unhandled server error:", error.stack || err);
  } else {
    logger.warn(`Operational client error: ${statusCode} - ${message}`);
  }

  const responseBody: Record<string, unknown> = {
    success: false,
    message: message, // Temporarily show real error in production to debug
  };

  if (config.env === "development" && error.stack) {
    responseBody.stack = error.stack;
  }

  return res.status(statusCode).json(responseBody);
};
