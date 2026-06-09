"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./utils/logger");
// Catch uncaught exceptions immediately on startup
process.on('uncaughtException', (error) => {
    logger_1.logger.error('UNCAUGHT EXCEPTION! Shutting down...', error);
    process.exit(1);
});
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
let server;
/**
 * Starts the express server and attempts database connection.
 */
const startServer = async () => {
    try {
        // Attempt database connection
        await (0, database_1.connectDatabase)();
    }
    catch (error) {
        logger_1.logger.warn('✗ Database connection failed. Starting server in degraded state...');
    }
    // Create HTTP server and start listening
    server = app_1.default.listen(env_1.config.port, () => {
        logger_1.logger.success(`✓ Server Running on Port ${env_1.config.port}`);
        logger_1.logger.info(`✓ Environment: ${env_1.config.env}`);
    });
    // Catch unhandled promise rejections
    process.on('unhandledRejection', (reason) => {
        logger_1.logger.error('UNHANDLED REJECTION! Initiating graceful shutdown...', reason);
        gracefulShutdown();
    });
};
/**
 * Handles graceful shutdown by closing the HTTP server first.
 */
const gracefulShutdown = () => {
    logger_1.logger.info('Received termination signal. Closing HTTP server...');
    if (server) {
        server.close(() => {
            logger_1.logger.info('HTTP server closed. Exiting process.');
            process.exit(0);
        });
    }
    else {
        process.exit(0);
    }
};
// Register signals for graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
startServer();
