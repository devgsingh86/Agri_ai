import express from 'express';
import passport from 'passport';
import { loginLocal, googleCallback } from '../controllers/authController.js';

const router = express.Router();

/**
 * POST /api/auth/login - Local email/password login
 */
router.post('/login', loginLocal);

/**
 * GET /api/auth/google - Initiate Google OAuth flow
 */
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * GET /api/auth/google/callback - Handle Google OAuth callback
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  googleCallback
);

export default router;
