import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * POST /api/v1/auth/register
 * Registers a new user account.
 * Stub implementation — full auth to be completed in FEAT-009.
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const db = getDb();

    // Check duplicate email
    const existing = await db('users')
      .whereNull('deleted_at')
      .where('email', email.toLowerCase())
      .first();

    if (existing) {
      throw new AppError('Registration could not be completed. Please check your details and try again.', 409);
    }

    const password_hash = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    const now = new Date();

    await db('users').insert({
      id: userId,
      email: email.toLowerCase(),
      password_hash,
      created_at: now,
      updated_at: now,
    });

    const token = jwt.sign(
      { sub: userId, email: email.toLowerCase() },
      env.jwt.secret,
      { algorithm: 'HS256', expiresIn: env.jwt.expiresIn } as jwt.SignOptions
    );

    logger.info('User registered', { userId, email });

    res.status(201).json({
      message: 'Account created successfully',
      data: {
        token,
        user: { id: userId, email: email.toLowerCase() },
      },
    });
  } catch (err) {
    next(err);
  }
}

// Constant-time dummy hash used to prevent user-enumeration via timing differences.
// bcrypt.compare against this ensures the same ~100ms delay whether or not the user exists.
const DUMMY_HASH = '$2b$12$invalidhashusedfortimingattackprevention000000000000000';

/**
 * POST /api/v1/auth/login
 * Authenticates a user and returns a JWT token.
 * Stub implementation — full auth to be completed in FEAT-009.
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const db = getDb();

    const user = await db('users')
      .whereNull('deleted_at')
      .where('email', email.toLowerCase())
      .first();

    // Always run bcrypt to prevent timing-based user enumeration
    const hashToCompare = user?.password_hash ?? DUMMY_HASH;
    const isMatch = await bcrypt.compare(password, hashToCompare);

    if (!user || !isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      env.jwt.secret,
      { algorithm: 'HS256', expiresIn: env.jwt.expiresIn } as jwt.SignOptions
    );

    logger.info('User logged in', { userId: user.id, email: user.email });

    res.status(200).json({
      message: 'Login successful',
      data: {
        token,
        user: { id: user.id, email: user.email },
      },
    });
  } catch (err) {
    next(err);
  }
}
