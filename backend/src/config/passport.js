import passport from 'passport';
import LocalStrategy from 'passport-local';
import GoogleStrategy from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import { findUserByEmail, findUserById } from '../store/userStore.js';

/**
 * Local Strategy - Email/Password Authentication
 */
passport.use(
  'local',
  new LocalStrategy.Strategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    (email, password, done) => {
      try {
        const user = findUserByEmail(email);

        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);

        if (!isPasswordValid) {
          return done(null, false, { message: 'Invalid password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

/**
 * Google Strategy - OAuth Authentication
 */
passport.use(
  new GoogleStrategy.Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      try {
        return done(null, profile);
      } catch (error) {
        return done(error);
      }
    }
  )
);

/**
 * Serialize user for session
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Deserialize user from session
 */
passport.deserializeUser((id, done) => {
  try {
    const user = findUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
