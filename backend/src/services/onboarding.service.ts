import { getDb } from '../config/database';
import { OnboardingProgress } from '../models/OnboardingProgress.model';
import { AppError } from '../middleware/error.middleware';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface OnboardingProgressData {
  current_step: number;
  saved_data?: Record<string, unknown> | null;
}

export interface OnboardingProgressResult {
  id: string;
  user_id: string;
  current_step: number;
  total_steps: number;
  saved_data?: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Service layer for onboarding progress business logic.
 */
export class OnboardingService {
  /**
   * Retrieves the onboarding progress for a user.
   * Returns null if no progress record exists yet.
   */
  async getProgress(userId: string): Promise<OnboardingProgressResult | null> {
    const progress = await OnboardingProgress.query()
      .where('user_id', userId)
      .first();

    if (!progress) return null;

    return progress as OnboardingProgressResult;
  }

  /**
   * Creates or updates onboarding progress for a user (upsert behaviour).
   */
  async saveProgress(
    userId: string,
    data: OnboardingProgressData
  ): Promise<OnboardingProgressResult> {
    const db = getDb();
    const existing = await OnboardingProgress.query()
      .where('user_id', userId)
      .first();

    if (existing) {
      await OnboardingProgress.query()
        .where('user_id', userId)
        .patch({
          current_step: data.current_step,
          saved_data: data.saved_data ?? null,
          updated_at: new Date(),
        });

      const updated = await OnboardingProgress.query()
        .where('user_id', userId)
        .first();

      logger.info('Onboarding progress updated', { userId, step: data.current_step });
      return updated as OnboardingProgressResult;
    }

    // Create new progress record
    const newProgress = await OnboardingProgress.query().insertAndFetch({
      id: uuidv4(),
      user_id: userId,
      current_step: data.current_step,
      total_steps: 5,
      saved_data: data.saved_data ?? null,
    } as OnboardingProgress);

    logger.info('Onboarding progress created', { userId, step: data.current_step });
    return newProgress as OnboardingProgressResult;
  }
}
