import { Router } from 'express';
import mongoose from 'mongoose';

const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const databaseState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const status = databaseState === 'connected' ? 'ok' : 'error';
  const statusCode = databaseState === 'connected' ? 200 : 503;

  return res.status(statusCode).json({
    status,
    database: databaseState,
  });
});

export { healthRouter };
