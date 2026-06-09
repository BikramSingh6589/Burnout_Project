import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { config } from './env';

/**
 * Connects to the MongoDB Atlas database.
 * If the connection fails, it throws an error to be handled by the server initializer.
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    if (!config.mongoUri) {
      throw new Error('MONGODB_URI is empty');
    }
    
    // Set connection options if needed (Mongoose 6+ has no deprecated options like useNewUrlParser/useUnifiedTopology anymore)
    await mongoose.connect(config.mongoUri);
    logger.success('✓ MongoDB Connected');
  } catch (error: any) {
    logger.error(`✗ MongoDB Connection Failed: ${error.message}`);
    throw error;
  }
};
