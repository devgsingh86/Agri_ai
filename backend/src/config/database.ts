import knex, { Knex } from 'knex';
import { Model } from 'objection';
import path from 'path';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Knex database configuration object.
 * Supports dynamic migration/seed paths for CLI and runtime usage.
 */
export const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
  },
  pool: {
    min: env.db.poolMin,
    max: env.db.poolMax,
  },
  migrations: {
    directory: path.join(__dirname, '../../db/migrations'),
    extension: 'ts',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: path.join(__dirname, '../../db/seeds'),
    extension: 'ts',
  },
};

let db: Knex;

/**
 * Initialises the Knex connection and binds Objection.js Models.
 * Safe to call multiple times — returns cached instance.
 */
export function initDatabase(): Knex {
  if (!db) {
    db = knex(knexConfig);
    Model.knex(db);
    logger.info('Database connection initialised', {
      host: env.db.host,
      database: env.db.name,
    });
  }
  return db;
}

/**
 * Returns the shared Knex instance.
 * Must call initDatabase() before first use.
 */
export function getDb(): Knex {
  if (!db) {
    return initDatabase();
  }
  return db;
}

/**
 * Gracefully closes the database connection pool.
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.destroy();
    logger.info('Database connection closed');
  }
}

// Export as default for knex CLI
export default knexConfig;
