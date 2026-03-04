import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profile.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const profileService = new ProfileService();

/**
 * POST /api/v1/profile
 * Creates a new farm profile for the authenticated user.
 */
export async function createProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const profile = await profileService.createProfile(userId, req.body);
    res.status(201).json({
      message: 'Farm profile created successfully',
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/profile
 * Returns the authenticated user's farm profile.
 */
export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const profile = await profileService.getProfile(userId);
    res.status(200).json({ data: profile });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/profile
 * Fully replaces the authenticated user's farm profile.
 */
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const profile = await profileService.updateProfile(userId, req.body);
    res.status(200).json({
      message: 'Farm profile updated successfully',
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/profile
 * Partially updates the authenticated user's farm profile.
 */
export async function patchProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const profile = await profileService.patchProfile(userId, req.body);
    res.status(200).json({
      message: 'Farm profile patched successfully',
      data: profile,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/profile
 * Soft-deletes the authenticated user's farm profile.
 */
export async function deleteProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    await profileService.deleteProfile(userId);
    res.status(200).json({ message: 'Farm profile deleted successfully' });
  } catch (err) {
    next(err);
  }
}
