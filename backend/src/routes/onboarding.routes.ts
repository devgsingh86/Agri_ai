import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { register, login } from '../controllers/auth.controller';
import { registerSchema, loginSchema } from '../validators/profile.validator';

const router = Router();

/**
 * Auth routes — public, no JWT required.
 * Full implementation planned for FEAT-009.
 */
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

export default router;
