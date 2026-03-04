import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Validates and exports all required environment variables.
 * Throws an error at startup if critical variables are missing.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const env = {
  nodeEnv: getEnv('NODE_ENV', 'development'),
  port: parseInt(getEnv('PORT', '3000'), 10),
  apiPrefix: getEnv('API_PREFIX', '/api/v1'),

  db: {
    host: getEnv('DB_HOST', 'localhost'),
    port: parseInt(getEnv('DB_PORT', '5432'), 10),
    user: getEnv('DB_USER', 'agriai'),
    password: requireEnv('DB_PASSWORD'),
    name: getEnv('DB_NAME', 'agri_ai_db'),
    poolMin: parseInt(getEnv('DB_POOL_MIN', '2'), 10),
    poolMax: parseInt(getEnv('DB_POOL_MAX', '10'), 10),
  },

  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: getEnv('JWT_EXPIRES_IN', '24h'),
  },

  rateLimit: {
    windowMs: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '60000'), 10),
    max: parseInt(getEnv('RATE_LIMIT_MAX', '100'), 10),
  },

  cors: {
    origin: getEnv('CORS_ORIGIN', 'http://localhost:8081'),
  },

  logLevel: getEnv('LOG_LEVEL', process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),

  isProduction: getEnv('NODE_ENV', 'development') === 'production',
  isDevelopment: getEnv('NODE_ENV', 'development') === 'development',
  isTest: getEnv('NODE_ENV', 'development') === 'test',
} as const;
