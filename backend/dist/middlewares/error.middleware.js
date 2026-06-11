import { config } from "../config/env.js";
import { logger } from "../utils/logger.js";
export class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
const isErrorLike = (error) => {
    return typeof error === "object" && error !== null;
};
export const errorMiddleware = (err, _req, res, _next) => {
    const error = isErrorLike(err) ? err : {};
    let statusCode = error.statusCode || 500;
    let message = error.message || "Internal Server Error";
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
    }
    else {
        logger.warn(`Operational client error: ${statusCode} - ${message}`);
    }
    const responseBody = {
        success: false,
        message: config.env === "production" && statusCode === 500 ? "Internal server error" : message,
    };
    if (config.env === "development" && error.stack) {
        responseBody.stack = error.stack;
    }
    return res.status(statusCode).json(responseBody);
};
//# sourceMappingURL=error.middleware.js.map