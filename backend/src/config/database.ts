<<<<<<< Updated upstream
import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB connected");
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
=======
import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { config } from './env';

const setupConnectionEvents = (): void => {
  const { connection } = mongoose;

  connection.on('connected', () => {
    logger.success('MongoDB Connected');
  });

  connection.on('disconnected', () => {
    logger.warn('MongoDB Disconnected');
  });

  connection.on('reconnected', () => {
    logger.success('MongoDB Reconnected');
  });

  connection.on('error', (error) => {
    logger.error('MongoDB Connection Error', error);
  });
};

export const connectDatabase = async (): Promise<void> => {
  setupConnectionEvents();

  if (!config.mongoUri) {
    const message = 'MONGO_URI is required but was not provided.';
    logger.error(message);
    throw new Error(message);
  }

  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Database connection established.');
  } catch (error) {
    logger.error('Database connection failed.', error instanceof Error ? error.message : error);
    process.exit(1);
  }
>>>>>>> Stashed changes
};
