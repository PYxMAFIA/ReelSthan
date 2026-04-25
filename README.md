# ReelSthan 🎥

**ReelSthan** is a modern, mobile-first short video sharing platform built with the MERN stack (MongoDB, Express, React, Node.js). Inspired by Instagram Reels and TikTok, it features a sleek glassmorphism UI, optimized video playback, and seamless user experience.

![ReelSthan UI](./frontend/public/vite.svg) 
![alt text](image.png)
![alt text](image-1.png)
![alt text](image-2.png)

## ✨ Features

- **📱 Mobile-First Experience**: Optimized for mobile devices with responsive bottom navigation
- **📹 Optimized Video Playback**: 
  - Lazy loading for fast initial page loads
  - Only one video plays at a time (like Instagram Reels)
  - Auto-play/pause on scroll with Intersection Observer
  - Smooth loading indicators and transitions
- **❤️ Social Interactions**: Like, comment, and save your favorite reels
- **👤 User Profiles**: Customizable profiles with avatars, bios, and video grids
- **🔒 Secure Authentication**: 
  - JWT-based auth with httpOnly cookies
  - Email verification and password reset
  - Comprehensive error handling with toast notifications
- **☁️ Cloud Storage**: ImageKit integration for images and videos
- **🎬 Pexels API Integration**: Fetch HD videos from Pexels for seeding
- **🎨 Modern UI**: Built with TailwindCSS v4, featuring glassmorphism effects and Framer Motion animations

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite) - Fast build tool and dev server
- **TailwindCSS v4** - Modern utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router DOM** - Client-side routing
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - Toast notifications for better UX

### Backend
- **Node.js & Express.js** - Fast, minimal web framework
- **MongoDB & Mongoose** - NoSQL database with ODM
- **JWT** - Secure token-based authentication
- **Bcrypt.js** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email sending (verification, password reset)
- **ImageKit SDK** - Image and video storage
- **Pexels API** - HD video content provider

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16+ recommended)
- **MongoDB** (Local installation or MongoDB Atlas account)
- **npm** or **yarn**

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/yourusername/reelsthan.git
cd reelsthan
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
# Use MongoDB Atlas SRV URI format in production
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/reelsthan

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
APP_URL=http://localhost:5173

# CORS (temporary debug mode)
CORS_ALLOW_ALL=true
# Use only when CORS_ALLOW_ALL=false
CORS_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app

# ImageKit (for uploads)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Email (Gmail or Mailtrap)
GMAIL_USER=your_email@gmail.com
GOOGLE_APP_PASSWORD=your_app_password

# Pexels API (for video content)
PEXELS_API_KEY=your_pexels_api_key
```

**Seed the database** (creates 30 users and 30 HD reels):
```bash
node seed-with-api.js
```
> Uses Pexels API if key is provided, otherwise falls back to Mixkit videos

Start the development server:
```bash
npm run dev
```
Server runs at `http://localhost:3000`

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:3000
```

Start the development server:
```bash
npm run dev
```
Frontend runs at `http://localhost:5173`

#### 4. Test Login
After seeding, use these credentials:
```
Email: aaravsharma@example.com
Password: password123
```

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `MONGODB_URL` | MongoDB connection string (Atlas SRV URI recommended) | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `FRONTEND_URL` | Frontend URL (for reset-password links) | Yes |
| `BACKEND_URL` | Backend URL (for email links) | Yes |
| `APP_URL` | App URL shown in welcome emails (optional fallback to `FRONTEND_URL`) | No |
| `CORS_ALLOW_ALL` | Temporary CORS debugging switch (`true` allows all origins) | No |
| `CORS_ORIGINS` | Comma-separated allowed origins when `CORS_ALLOW_ALL=false` | No |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key | Yes |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key | Yes |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint | Yes |
| `GMAIL_USER` | Gmail address for emails | Yes |
| `GOOGLE_APP_PASSWORD` | Gmail app password | Yes |
| `PEXELS_API_KEY` | Pexels API key (optional) | No |

**Getting API Keys:**
- **MongoDB Atlas**: [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- **ImageKit**: [imagekit.io](https://imagekit.io/) (Free tier: 20GB bandwidth/month)
- **Pexels API**: [pexels.com/api](https://www.pexels.com/api/) (Free: 200 requests/hour)
- **Gmail App Password**: [Google Account Settings](https://myaccount.google.com/apppasswords)

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend base URL (root or `/api` path; both are supported) | Yes |

## 📦 Available Scripts

### Backend
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
npm run seed     # Seed with static videos
node seed-with-api.js  # Seed with Pexels API (recommended)
```

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🚀 Deployment

### Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. Add all environment variables from `.env.example`
5. Deploy!

### Frontend (Vercel)
1. Import project on [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `VITE_API_BASE_URL`: Your Render backend URL (with or without `/api`)
4. Deploy!

**Important**: Update `FRONTEND_URL` in backend env vars to your Vercel URL after deployment. For production security, set `CORS_ALLOW_ALL=false` and configure `CORS_ORIGINS`.

## 📚 Project Structure

```
reelsthan/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── services/         # Pexels, ImageKit, email services
│   │   ├── config/           # Configuration files
│   │   └── DB/               # Database connection
│   ├── seed.js               # Static video seeder
│   ├── seed-with-api.js      # Pexels API seeder
│   └── index.js              # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Route pages
    │   ├── context/          # React contexts (video manager)
    │   ├── lib/              # Utilities (axios, validation)
    │   ├── routes/           # Route configuration
    │   └── main.jsx          # Entry point
    └── public/               # Static assets
```

## 🎯 Key Features Explained

### Video Optimization
- **Lazy Loading**: Videos use `preload="metadata"` instead of `preload="auto"` for ~70% faster initial load
- **Global Video Manager**: Custom context ensures only one video plays at a time
- **Intersection Observer**: Auto-play/pause based on viewport visibility (60% threshold)
- **150ms Delay**: Prevents flickering during fast scrolling

### Error Handling
- Comprehensive toast notifications for all user actions
- API interceptor handles 401, 429, 500, 503, timeouts, and network errors
- Forgot password shows "Service unavailable" when email service is down
- YouTube embed fallback UI when videos fail to load

### Authentication
- JWT tokens stored in httpOnly cookies (XSS protection)
- Email verification required for new accounts
- Password reset with secure tokens (1-hour expiry)
- Protected routes with automatic redirect

## 🐛 Troubleshooting

**Videos not loading?**
- Check if Pexels API key is valid
- Run `node seed-with-api.js` to refresh video URLs
- Verify CORS settings in backend

**Email not sending?**
- Check Gmail app password (not your regular password)
- Enable 2FA on Google account first
- For testing, use Mailtrap instead

**Database connection failed?**
- Verify MongoDB Atlas IP whitelist (add `0.0.0.0/0` for all IPs)
- Check connection string format
- Prefer Atlas SRV URI (`mongodb+srv://...`) and avoid `directConnection=true` on clustered Atlas
- Ensure database user has read/write permissions

**Build errors?**
- Clear `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version: `node -v` (should be v16+)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Pexels** for providing free HD video content
- **Mixkit** for fallback video CDN
- **ImageKit** for cloud storage
- **MongoDB** for excellent database documentation
- Inspired by Instagram Reels and TikTok's UX

---

**Made with ❤️ by ReelSthan Team**
