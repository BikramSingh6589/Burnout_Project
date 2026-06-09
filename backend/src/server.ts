<<<<<<< Updated upstream
import "dotenv/config";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import { connectDatabase } from "./config/database.js";
import { HttpError } from "./controllers/auth.controller.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
const port = Number(process.env.PORT ?? 5000);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()) ?? ["http://localhost:5173"],
    credentials: true,
  }),
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, "Route not found"));
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? "Internal server error" : error.message,
  });
=======
import http from 'http';
import app from './app';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

let server: http.Server;

process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', error);
  process.exit(1);
>>>>>>> Stashed changes
});

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

<<<<<<< Updated upstream
    const server = app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    const shutdown = async (signal: string): Promise<void> => {
      console.log(`${signal} received. Shutting down gracefully.`);
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    console.error("Failed to start server", error);
=======
    server = app.listen(config.port, () => {
      logger.success(`Server Running On Port ${config.port}`);
      logger.info(`Environment: ${config.env}`);
    });
  } catch (error) {
    logger.error('Server startup aborted due to database connection failure.', error instanceof Error ? error.message : error);
>>>>>>> Stashed changes
    process.exit(1);
  }
};

<<<<<<< Updated upstream
void startServer();

export default app;
=======
const gracefulShutdown = (): void => {
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

process.on('unhandledRejection', (reason) => {
  logger.error('UNHANDLED REJECTION! Initiating graceful shutdown...', reason);
  gracefulShutdown();
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();
>>>>>>> Stashed changes
