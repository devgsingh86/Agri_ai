import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import router from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';

/**
 * Creates and configures the Express application.
 * Exported separately from index.ts to allow testing without starting the HTTP server.
 */
export function createApp(): Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: env.cors.origin,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too Many Requests',
      message: 'Too many requests from this IP, please try again later.',
    },
  });
  app.use(limiter);

  // Body parsing
  app.use(express.json({ limit: '50kb' }));
  app.use(express.urlencoded({ extended: true }));

  // Trust proxy (for accurate IP behind load balancer)
  app.set('trust proxy', 1);

  // API routes
  app.use(env.apiPrefix, router);

  // Health check also accessible at root /health
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'agri-ai-backend',
    });
  });

  // 404 handler — must come after all routes
  app.use(notFoundHandler);

  // Malformed JSON body handler — converts body-parser parse errors to 400
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid JSON in request body' });
    }
    next(err);
  });

  // Global error handler — must be last
  app.use(errorHandler);

  return app;
}
