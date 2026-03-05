import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import {
  getMandiPrices,
  getMandiHistory,
  getMandiComparisonCtrl,
  getMandiAlerts,
  createMandiAlert,
  deleteMandiAlert,
} from '../controllers/mandi.controller';

const router = Router();

router.get('/prices',             authenticateJWT, getMandiPrices);
router.get('/history/:cropKey',   authenticateJWT, getMandiHistory);
router.get('/comparison/:cropKey',authenticateJWT, getMandiComparisonCtrl);
router.get('/alerts',             authenticateJWT, getMandiAlerts);
router.post('/alerts',            authenticateJWT, createMandiAlert);
router.delete('/alerts/:id',      authenticateJWT, deleteMandiAlert);

export default router;
