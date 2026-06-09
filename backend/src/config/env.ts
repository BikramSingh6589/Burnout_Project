import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

type NodeEnv = 'development' | 'production' | 'test' | string;

export interface EnvConfig {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  env: NodeEnv;
  emailUser?: string;
  emailPassword?: string;
  googleClientId?: string;
  googleClientSecret?: string;
}

const requiredVariables = ['PORT', 'MONGODB_URI', 'JWT_SECRET'] as const;

const missingVariables = requiredVariables.filter((key) => {
  const value = process.env[key];
  return !value || value.trim() === '';
});

if (missingVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
}

const port = Number(process.env.PORT);
if (Number.isNaN(port) || port <= 0) {
  throw new Error('Invalid PORT value. PORT must be a positive integer.');
}

const emailUser = process.env.EMAIL_USER?.trim();
const emailPassword = process.env.EMAIL_PASSWORD?.trim();

if ((emailUser && !emailPassword) || (!emailUser && emailPassword)) {
  throw new Error('EMAIL_USER and EMAIL_PASSWORD must both be set if either one is provided.');
}

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

if ((googleClientId && !googleClientSecret) || (!googleClientId && googleClientSecret)) {
  throw new Error('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must both be set if either one is provided.');
}

export const config: EnvConfig = {
  port,
  mongoUri: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  env: (process.env.NODE_ENV || 'development').trim() as NodeEnv,
  emailUser: emailUser || undefined,
  emailPassword: emailPassword || undefined,
  googleClientId: googleClientId || undefined,
  googleClientSecret: googleClientSecret || undefined,
};
