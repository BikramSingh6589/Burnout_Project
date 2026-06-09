import dotenv from 'dotenv';
import path from 'path';
import { EnvironmentConfig } from '../types/common.types';

// Load environment variables from .env file
dotenv.config();

const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];

// Validate that required variables are defined in the environment (even if they are empty strings)
requiredEnv.forEach((key) => {
  if (process.env[key] === undefined) {
    throw new Error(`Missing ${key} in environment variables.`);
  }
});

export const config: EnvironmentConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  emailUser: process.env.EMAIL_USER || '',
  emailPassword: process.env.EMAIL_PASSWORD || '',
  env: process.env.NODE_ENV || 'development',
};
