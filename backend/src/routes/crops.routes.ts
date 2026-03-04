import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { getCrops } from '../controllers/crops.controller';
import { cropsQuerySchema } from '../validators/profile.validator';

const router = Router();

/**
 * GET /api/v1/crops — Public route, no auth required.
 */
router.get('/', validate(cropsQuerySchema, 'query'), getCrops);

export default router;
