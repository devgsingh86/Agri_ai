# Local Development Setup Guide - FEAT-006

This guide covers how to set up and run FEAT-006 (Webpage with Sign-In) locally.

## Project Overview

**FEAT-006** implements a modern login system with:
- Email/password authentication
- Google OAuth sign-in
- User profile page
- JWT-based session management
- In-memory user store for local development

## Quick Start (2 minutes)

### Option 1: Basic Setup (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
# Backend starts on http://localhost:5000
# Health check: curl http://localhost:5000/health
```

**Terminal 2 - Frontend (new terminal):**
```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:3000
```

Visit `http://localhost:3000` and use these test credentials:
- **Email**: `test@example.com`
- **Password**: `password123`

### Option 2: Docker Compose (5 minutes)

```bash
docker-compose up
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

## Project Structure

```
jira_dashboard/
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx   # Login form
│   │   │   └── ProfilePage.jsx # User profile display
│   │   └── App.jsx              # Routing
│   ├── package.json
│   └── vite.config.js
├── backend/                      # Express.js backend
│   ├── src/
│   │   ├── controllers/
│   │   │   └── authController.js # Auth logic
│   │   ├── routes/
│   │   │   └── authRoutes.js     # API routes
│   │   ├── middleware/
│   │   │   └── auth.js           # Middleware
│   │   ├── config/
│   │   │   └── passport.js       # Auth strategies
│   │   └── server.js
│   └── package.json
└── docs/
    ├── dev-notes.md              # Implementation notes
    ├── architecture.md           # Architecture overview
    └── requirement-specs/
        └── FEAT-006-spec.md      # Feature specification
```

## Features

### Frontend (React)

**Login Page** (`/login`)
- Modern gradient UI
- Email/password form
- Google OAuth button
- Error message display
- Loading state
- Responsive design

**Profile Page** (`/profile`)
- User avatar with initials
- Display name, email, auth provider
- User picture (if available)
- Logout button

### Backend (Express.js)

**Authentication Endpoints:**
- `POST /api/auth/login` - Email/password login
- `GET /api/auth/google` - Start Google OAuth
- `GET /api/auth/google/callback` - Handle Google OAuth callback
- `POST /api/auth/logout` - Logout

**User Endpoints:**
- `GET /api/user/profile` - Get logged-in user profile

## API Interaction Flow

### Email/Password Login

```
User enters credentials in login form
↓
Frontend: POST /api/auth/login
├─ Email: test@example.com
├─ Password: password123
↓
Backend: Verify credentials against user store
├─ Hash password and compare
├─ Generate JWT token
├─ Set httpOnly cookie
↓
Response: { success: true, user, token }
↓
Frontend: Store token, redirect to /profile
↓
Frontend: GET /api/user/profile
├─ Header: Authorization: Bearer {token}
↓
Backend: Verify token, return user info
↓
Display profile page
```

### Google OAuth Login

```
User clicks "Sign in with Google"
↓
Frontend: Navigate to GET /api/auth/google
↓
Backend: Redirect to Google OAuth consent screen
↓
User authenticates with Google
↓
Google redirects to /api/auth/google/callback
↓
Backend: Verify Google token
├─ Create/find user
├─ Generate JWT token
├─ Set httpOnly cookie
↓
Backend: Redirect to frontend with ?token=JWT
↓
Frontend: Extract token, store, redirect to /profile
↓
Display profile page
```

## Testing

### Manual Testing

**1. Test Email/Password Login:**
```bash
# Start both backend and frontend as described above
# Visit http://localhost:3000
# Enter: test@example.com / password123
# Should see profile page
```

**2. Test with API (curl):**
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"password123"}'

# Should return: { success: true, user, token }

# Get Profile
curl http://localhost:5000/api/user/profile \
  -b cookies.txt

# Should return: { success: true, user }
```

**3. Test Google OAuth:**
Note: Requires Google OAuth credentials configured in `.env`
- Click "Sign in with Google"
- Authenticate with your Google account
- Should redirect to profile page

### Automated Tests

```bash
# Run backend tests
cd backend
npm test

# All tests should pass
```

## Configuration

### Backend (.env)

```env
PORT=5000                                                    # Backend port
NODE_ENV=development                                         # Environment
JWT_SECRET=dev_jwt_secret_key_local_only                    # JWT signing key
GOOGLE_CLIENT_ID=your_google_client_id                      # From Google Cloud Console
GOOGLE_CLIENT_SECRET=your_google_client_secret              # From Google Cloud Console
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000                          # Frontend URL for CORS
```

### Frontend (vite.config.js)

API proxy already configured:
```js
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
}
```

## Troubleshooting

### Port Already in Use

If port 5000 or 3000 is in use:

**For Backend:**
```bash
# Change PORT in backend/.env
PORT=5001
```

**For Frontend:**
```bash
# Modify vite.config.js
server: {
  port: 3001,
  proxy: { ... }
}
```

### CORS Errors

If you see CORS errors in the browser console:
1. Check `FRONTEND_URL` in backend `.env`
2. Ensure it matches your frontend URL
3. Restart backend after changes

### Google OAuth Not Working

1. Create Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials (Web)
   - Authorized redirect: `http://localhost:5000/api/auth/google/callback`

2. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

3. Restart backend

### Token Expiration

Tokens expire in 24 hours. After expiration:
- Refresh page → redirect to login
- No automatic refresh (to be added in future)

## Development Workflow

### Making Changes

**Frontend changes:**
- Hot reload enabled (Vite)
- Just save files and refresh browser

**Backend changes:**
- Watch mode enabled (`npm run dev` uses `--watch`)
- Server auto-restarts on file changes
- May need to refresh browser/re-login

### Building for Production (Future)

```bash
# Frontend
frontend npm run build
# Output: frontend/dist/

# Backend
# Deploy backend/src to production server
# Updated .env for production URL
```

## Security Notes

**For Local Development Only:**
- Passwords are hashed with bcryptjs
- JWT tokens stored in httpOnly cookies
- CORS configured for frontend
- No advanced security implemented yet

**Future Enhancements:**
- CSRF protection
- Rate limiting
- Password reset
- Email verification
- Two-factor authentication
- AD/LDAP integration

## Performance

- **Frontend**: ~500ms page load (Vite dev server)
- **Backend**: ~50ms auth response
- **In-Memory Storage**: Instant lookups
- **JWT Generation**: <10ms

Replace in-memory storage with database for production.

## Common Commands

```bash
# Frontend
npm run dev              # Start dev server
npm run build           # Build for production
npm run lint            # Run ESLint
npm run format          # Format with Prettier

# Backend
npm run dev             # Start with watch mode
npm start               # Start production
npm test                # Run tests
npm run lint            # Run ESLint
npm run format          # Format with Prettier
```

## Next Steps

After local development:

1. **Add Database**: Replace `userStore.js` with MongoDB/PostgreSQL
2. **Enhance Security**: Add CSRF, rate limiting, password policies
3. **Add More Auth**: Email verification, password reset
4. **Deploy**: Push to staging/production
5. **Integrate AD**: Replace Google OAuth with AD for internal users

## Support

For issues or questions:
1. Check `docs/dev-notes.md` for implementation details
2. Review `frontend/README.md` and `backend/README.md`
3. Check error messages in browser console and backend logs

---

**Last Updated**: 2026-02-18
**Feature**: FEAT-006 - Webpage with Sign-In (Email/Google)
