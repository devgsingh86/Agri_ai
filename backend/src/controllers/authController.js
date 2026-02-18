import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users } from '../store/userStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

/**
 * Handle local email/password login
 */
export const loginLocal = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare passwords
    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: 'local',
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
    });
  }
};

/**
 * Handle Google OAuth callback
 */
export const googleCallback = (req, res) => {
  try {
    const { id, displayName, emails, photos } = req.user;
    const email = emails?.[0]?.value;
    const picture = photos?.[0]?.value;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Failed to get email from Google',
      });
    }

    // Check if user exists
    let user = users.find((u) => u.email === email);

    if (!user) {
      // Create new user
      user = {
        id: `google_${id}`,
        email,
        name: displayName,
        provider: 'google',
        picture,
        passwordHash: null,
        createdAt: new Date(),
      };

      users.push(user);
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend profile with token in query
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/profile?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during Google login',
    });
  }
};

/**
 * Get user profile
 */
export const getProfile = (req, res) => {
  try {
    const { userId } = req.user;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching profile',
    });
  }
};

/**
 * Logout (client-side token removal)
 */
export const logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
};
