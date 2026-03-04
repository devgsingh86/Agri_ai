import { Router } from 'express';
import { getWeather } from '../controllers/weather.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

/** GET /api/v1/weather — personalised 7-day forecast with crop advisories */
router.get('/', authenticateJWT, getWeather);

export default router;
