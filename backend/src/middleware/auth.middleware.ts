import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

/**
 * Extended Express Request with authenticated user context.
 */
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

/**
 * JWT authentication middleware.
 * Extracts and verifies Bearer token from the Authorization header.
 * Attaches decoded user context to req.user.
 */
export async function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as jwt.JwtPayload;
    (req as AuthenticatedRequest).user = {
      id: decoded.sub as string,
      email: decoded.email as string,
    };
    next();
  } catch {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
}
