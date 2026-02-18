import express from 'express';
import { getProfile, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/user/profile - Get logged-in user profile
 */
router.get('/profile', verifyToken, getProfile);

/**
 * POST /api/user/logout - Logout
 */
router.post('/logout', logout);

export default router;
