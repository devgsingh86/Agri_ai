import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createProfile,
  getProfile,
  updateProfile,
  patchProfile,
  deleteProfile,
} from '../controllers/profile.controller';
import { getProgress, saveProgress } from '../controllers/onboarding.controller';
import {
  createProfileSchema,
  updateProfileSchema,
  patchProfileSchema,
  onboardingProgressSchema,
} from '../validators/profile.validator';

const router = Router();

/**
 * All profile routes require JWT authentication.
 */
router.use(authenticateJWT);

// Farm Profile CRUD
router.post('/', validate(createProfileSchema), createProfile);
router.get('/', getProfile);
router.put('/', validate(updateProfileSchema), updateProfile);
router.patch('/', validate(patchProfileSchema), patchProfile);
router.delete('/', deleteProfile);

// Onboarding Progress
router.get('/progress', getProgress);
router.post('/progress', validate(onboardingProgressSchema), saveProgress);

export default router;
