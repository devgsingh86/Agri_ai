# JIRA Dashboard Frontend

Modern React-based frontend for the JIRA Dashboard with email/password and Google OAuth authentication.

## Features

- Modern, responsive login page with gradient design
- Google OAuth sign-in integration
- User profile page displaying authentication info
- Clean component-based architecture
- Client-side routing with React Router

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Router**: React Router DOM
- **Styling**: Modern CSS with responsive design

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

The frontend proxies API requests to `http://localhost:5000` (configured in `vite.config.js`).

### Development

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Project Structure

```
src/
├── pages/
│   ├── LoginPage.jsx      # Login form with email/password and Google sign-in
│   ├── LoginPage.css      # Login page styles
│   ├── ProfilePage.jsx    # User profile display
│   └── ProfilePage.css    # Profile page styles
├── App.jsx                # Application root with routing
├── App.css                # App styles
├── main.jsx               # React entry point
└── index.css              # Global styles
```

## API Integration

### Login Endpoints

- `POST /api/auth/login` - Email/password login
- `GET /api/auth/google` - Google OAuth initiation
- `GET /api/auth/google/callback` - Google OAuth callback

### Profile Endpoints

- `GET /api/user/profile` - Get logged-in user profile

### Authentication

JWT tokens are stored in `localStorage` and passed as `Authorization` headers.

## Error Handling

- Invalid credentials display user-friendly error messages
- Network errors are caught and displayed to the user
- Failed authentications redirect back to login after timeout

## Local Development Notes

- The login page includes a test account: `test@example.com` / `password123`
- Google OAuth requires configuration (see backend `.env.example`)
- All styling uses CSS Grid/Flexbox for responsive design
