# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ReelSthan is a MERN stack short video sharing platform (like Instagram Reels) with mobile-first design, glassmorphism UI, and JWT authentication.

## Quick Commands

### Backend
```bash
cd backend
npm run dev      # Start dev server with nodemon (port 3000)
npm start        # Start production server
npm run seed     # Seed database with 30 users and ~60-120 reels
```

### Frontend
```bash
cd frontend
npm run dev      # Vite dev server (port 5173)
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

### Backend (`backend/`)
- **Entry**: `index.js` → Express app from `src/app.js`
- **Database**: MongoDB via Mongoose (`src/DB/db.js`)
- **Routes**: `/api/auth`, `/api/reel`, `/api/creator`, `/api/search`
- **Auth**: JWT in cookies (httpOnly, secure in production)
- **Storage**: ImageKit for images (configurable in `src/config/services/storage.service.js`)
- **Email**: Mailtrap/Nodemailer for verification and password reset

### Frontend (`frontend/`)
- **Entry**: `src/main.jsx` → `App.jsx` → `routes/AppRoutes.jsx`
- **Styling**: TailwindCSS v4 + Framer Motion
- **State**: React Context (`ReelAudioContext`)
- **API**: Axios instance with interceptors (`src/lib/api.js`)
- **Layout**: `MainLayout` wraps public browsing routes; `ProtectedRoute` for auth-required pages

### Key Models
- **User**: name, username, email, password (hashed), avatarUrl, bio, verification/reset tokens
- **Reel**: title, description, videoUrl, uploadedBy (ref User), like[], saves[], comments[]

## Environment Variables

### Backend `.env`
```
MONGODB_URL=<mongodb-connection-string>
JWT_SECRET=<secret>
FRONTEND_URL=http://localhost:5173
PORT=3000
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_URL_ENDPOINT=...
```

### Frontend `.env`
```
VITE_API_BASE_URL=http://localhost:3000/api
```

## Common Tasks

### Run locally with seed data
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Seed DB (first time only)
cd backend && npm run seed

# Terminal 3 - Frontend
cd frontend && npm run dev
```

### Login credentials after seeding
- Email: `<generated>@example.com` (check seed output)
- Password: `password123`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/check-auth` | Verify auth status |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/reel` | Get all reels |
| POST | `/api/reel` | Upload new reel |
| POST | `/api/reel/like/:id` | Like a reel |
| POST | `/api/reel/save/:id` | Save a reel |
| GET | `/api/creator/:username` | Get creator profile |
| GET | `/api/search` | Search reels/users |
