import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { getProfitability } from '../controllers/profitability.controller';

const router = Router();

/** GET /api/v1/profitability — ranked crop profitability for the authenticated farmer */
router.get('/', authenticateJWT, getProfitability);

export default router;
