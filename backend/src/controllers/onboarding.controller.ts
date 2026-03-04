import { Request, Response, NextFunction } from 'express';
import { OnboardingService } from '../services/onboarding.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const onboardingService = new OnboardingService();

/**
 * GET /api/v1/profile/progress
 * Returns the onboarding progress for the authenticated user.
 */
export async function getProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const progress = await onboardingService.getProgress(userId);

    if (!progress) {
      res.status(200).json({
        data: {
          current_step: 1,
          total_steps: 5,
          saved_data: null,
        },
      });
      return;
    }

    res.status(200).json({ data: progress });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/profile/progress
 * Creates or updates the onboarding progress for the authenticated user.
 */
export async function saveProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as AuthenticatedRequest).user.id;
    const progress = await onboardingService.saveProgress(userId, req.body);
    res.status(200).json({
      message: 'Onboarding progress saved',
      data: progress,
    });
  } catch (err) {
    next(err);
  }
}
