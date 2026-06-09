import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorMiddleware } from './middlewares/error.middleware';
import { ApiResponse } from './types/common.types';

const app: Express = express();

// Security Middlewares
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: ['http://localhost:5173'], // Frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  })
);

// Logging Middleware
app.use(morgan('dev'));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Health Check Route
app.get('/', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'Academic Burnout Detection Backend Running',
  };
  res.status(200).json(response);
});

// Detailed Health Check Route
app.get('/health', (req: Request, res: Response) => {
  const response = {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(response);
});

// Global Error Handler Middleware (must be registered last)
app.use(errorMiddleware);

export default app;
