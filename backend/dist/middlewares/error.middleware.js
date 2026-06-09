"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = exports.AppError = void 0;
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
/**
 * Standard operational error class for the application.
 */
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Global Express Error Handling Middleware.
 */
const errorMiddleware = (err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = undefined;
    // Handle Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errors = Object.values(err.errors).map((el) => el.message);
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
        logger_1.logger.error(`Unhandled server error: ${err.message || err}`, err.stack);
    }
    else {
        logger_1.logger.warn(`Operational client error: ${statusCode} - ${message}`);
    }
    const responseBody = {
        success: false,
        message: statusCode === 500 && env_1.config.env === 'production' ? 'Internal Server Error' : message,
    };
    if (errors) {
        responseBody.errors = errors;
    }
    // Show stack traces only during development
    if (env_1.config.env === 'development') {
        responseBody.stack = err.stack;
    }
    res.status(statusCode).json(responseBody);
};
exports.errorMiddleware = errorMiddleware;
