import { logger } from './utils/logger';

// Catch uncaught exceptions immediately on startup
process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', error);
  process.exit(1);
});

import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import http from 'http';

let server: http.Server;

/**
 * Starts the express server and attempts database connection.
 */
const startServer = async () => {
  try {
    // Attempt database connection
    await connectDatabase();
  } catch (error: any) {
    logger.warn('✗ Database connection failed. Starting server in degraded state...');
  }

  // Create HTTP server and start listening
  server = app.listen(config.port, () => {
    logger.success(`✓ Server Running on Port ${config.port}`);
    logger.info(`✓ Environment: ${config.env}`);
  });

  // Catch unhandled promise rejections
  process.on('unhandledRejection', (reason: any) => {
    logger.error('UNHANDLED REJECTION! Initiating graceful shutdown...', reason);
    gracefulShutdown();
  });
};

/**
 * Handles graceful shutdown by closing the HTTP server first.
 */
const gracefulShutdown = () => {
  logger.info('Received termination signal. Closing HTTP server...');
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed. Exiting process.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

// Register signals for graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();
