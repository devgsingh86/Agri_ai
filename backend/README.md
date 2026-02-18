# JIRA Dashboard Backend

Express.js backend API for JIRA Dashboard with email/password and Google OAuth authentication.

## Features

- Email/password authentication with bcrypt
- Google OAuth 2.0 integration
- JWT-based session management
- User profile management
- Comprehensive error handling
- CORS support for frontend integration

## Tech Stack

- **Framework**: Express.js
- **Authentication**: Passport.js
- **Encryption**: bcryptjs
- **Tokens**: JWT (jsonwebtoken)
- **Session**: Express-session
- **Environment**: dotenv

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

**For Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Set authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### Development

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Test

```bash
npm test
```

## Project Structure

```
src/
├── config/
│   └── passport.js       # Passport.js strategies (Local, Google)
├── controllers/
│   ├── authController.js # Auth logic (login, Google callback, profile)
│   └── authController.test.js
├── middleware/
│   └── auth.js           # JWT verification, CORS
├── routes/
│   └── authRoutes.js     # API routes
├── store/
│   └── userStore.js      # In-memory user storage
└── server.js             # Express app setup
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with email/password
  - Request: `{ email, password }`
  - Response: `{ success, user, token }`

- `GET /api/auth/google` - Initiate Google OAuth flow

- `GET /api/auth/google/callback` - Google OAuth callback (internal)

- `POST /api/auth/logout` - Logout (clear token cookie)

### User

- `GET /api/user/profile` - Get logged-in user profile
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, user }`

## Authentication Flow

### Email/Password

1. User enters credentials on login page
2. Frontend sends `POST /api/auth/login`
3. Backend verifies credentials against user store
4. JWT token is issued and sent back
5. Frontend stores token and redirects to profile page

### Google OAuth

1. User clicks "Sign in with Google"
2. Frontend requests `GET /api/auth/google`
3. User authenticates with Google
4. Google redirects to `/api/auth/google/callback`
5. Backend verifies token and creates/retrieves user
6. Backend redirects to frontend profile page with JWT token

## Session Management

- JWT tokens expire in 24 hours
- Tokens are stored in httpOnly cookies (for XHR requests)
- Tokens can also be passed via `Authorization: Bearer <token>` header

## Error Handling

- Invalid credentials: `401 Unauthorized`
- Missing fields: `400 Bad Request`
- Token errors: `401 Unauthorized`
- Server errors: `500 Internal Server Error`

All errors include a `message` field for debugging.

## Local Development Notes

**Test Account:**
- Email: `test@example.com`
- Password: `password123`

**In-Memory Storage:**
- User data is stored in-memory (resets on server restart)
- Perfect for local development and testing
- Replace with database in production

**CORS:**
- Configured for `http://localhost:3000` (frontend)
- Modify `FRONTEND_URL` in `.env` to change

## Security Notes

This implementation is for **local development only**:
- No advanced password policy enforcement
- Basic error messages (no info leakage)
- JWT stored in httpOnly cookies
- CSRF protection to be implemented in future
- AD integration planned for production
