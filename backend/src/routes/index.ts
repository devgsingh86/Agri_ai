import { Router, Request, Response } from 'express';
import profileRoutes from './profile.routes';
import cropsRoutes from './crops.routes';
import authRoutes from './onboarding.routes';
import weatherRoutes from './weather.routes';

const router = Router();

/**
 * Aggregates all API routes under /api/v1.
 */

// Health check (public)
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'agri-ai-backend',
  });
});

// Feature routes
router.use('/profile', profileRoutes);
router.use('/crops', cropsRoutes);
router.use('/auth', authRoutes);
router.use('/weather', weatherRoutes);

export default router;
