import * as dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { initDatabase, closeDatabase } from './config/database';
import { env } from './config/env';
import { logger } from './utils/logger';

/**
 * Application entry point.
 * Initialises database connection and starts the HTTP server.
 */
async function main(): Promise<void> {
  // Initialise database
  initDatabase();

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`🚀 Agri AI Backend running`, {
      port: env.port,
      env: env.nodeEnv,
      apiPrefix: env.apiPrefix,
    });
  });

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await closeDatabase();
      logger.info('Server closed');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason });
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { err });
    process.exit(1);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
