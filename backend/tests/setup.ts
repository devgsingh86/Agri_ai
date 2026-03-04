/**
 * Jest test environment setup.
 * Sets NODE_ENV to 'test' to suppress logger output and use test DB config.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-tests-only';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'agriai';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'agriaipassword';
process.env.DB_NAME = process.env.DB_NAME || 'agri_ai_db';
process.env.LOG_LEVEL = 'error';
