# System Architecture

## Tech Stack
- **Frontend**: React (with Vite or Next.js for local dev), modern CSS (e.g., Tailwind or Material UI)
- **Backend**: Node.js (Express or Next.js API routes)
- **Auth**: Passport.js (email/password), Google OAuth (passport-google-oauth20)
- **Session**: JWT or cookie-based (local only)
- **Data**: In-memory or simple file-based user store (for local dev)

## Architecture Pattern
- **Frontend-Backend separation** (SPA or SSR)
- **API endpoints** for auth and user profile
- **OAuth flow** for Google sign-in

## Component/Module Breakdown (FEAT-006)
- **Login Page**: Modern UI, email/password form, Google sign-in button
- **Auth API**: POST /api/auth/login, GET /api/auth/google, GET /api/auth/google/callback
- **Profile Page**: Shows logged-in user info
- **Session Management**: Local session/JWT
- **User Store**: In-memory or file-based for local

## Auth Flow
1. User visits login page
2. Enters email/password or clicks Google sign-in
3. On success, session is created and user is redirected to dashboard/profile
4. Profile page fetches user info from /api/user/profile

## Security Notes
- Minimal for now (no CSRF, password policy, or advanced security)
- To be enhanced in future iterations
