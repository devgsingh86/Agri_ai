# Feature Specification: FEAT-006

## Title
Webpage with Sign-In (Email/Google)

## Description
As an internal user, I want to log in using email/password or Google and view my profile page after sign-in.

## Acceptance Criteria
- Modern login page with email/password and Google sign-in
- Successful login redirects to dashboard/profile page
- Profile page displays user info
- Basic error handling for failed login

## API Endpoints (Initial)
- POST /api/auth/login (email/password)
- GET /api/auth/google (Google OAuth start)
- GET /api/auth/google/callback (Google OAuth callback)
- GET /api/user/profile (get logged-in user profile)

## UI/UX
- Modern, responsive design
- Clear error messages for failed login

## Security
- Minimal for now (no CSRF, password policy, or advanced security)
- To be enhanced in future iterations

## Technical Notes
- Use a modern frontend stack (e.g., React, Next.js, or similar)
- Local user management for now; AD integration later
- Google OAuth for sign-in

## Deployment Scope
- Local only

## Dependencies
- None (for this iteration)

## Created
2026-02-18
