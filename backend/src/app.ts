import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { healthRouter } from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  }),
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Academic Burnout Detection Backend Running',
  });
});

app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use(errorMiddleware);

export default app;
