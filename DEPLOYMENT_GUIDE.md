# ReelSthan - Production Deployment Guide

## ✅ Pre-Deployment Checklist

### Backend Setup

#### 1. Environment Variables (.env)
```bash
# Production values needed:
NODE_ENV=production
MONGODB_URL=<your-production-mongodb-url>
JWT_SECRET=<strong-random-secret-at-least-32-chars>
BACKEND_URL=<your-backend-domain>
FRONTEND_URL=<your-frontend-domain>

# Email Service (Gmail)
GMAIL_USER=<your-gmail>
GOOGLE_APP_PASSWORD=<your-app-password>

# Image Storage (ImageKit)
IMAGEKIT_PUBLIC_KEY=<your-public-key>
IMAGEKIT_PRIVATE_KEY=<your-private-key>
IMAGEKIT_URL_ENDPOINT=<your-imagekit-url>
```

#### 2. Update CORS Configuration
File: `backend/src/app.js`

**IMPORTANT:** Change this line before deployment:
```javascript
// Development
app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true
}));

// Production - Update to your frontend domain
app.use(cors({
	origin: process.env.FRONTEND_URL || 'https://your-frontend-domain.com',
	credentials: true
}));
```

#### 3. Backend Scripts
✅ Already configured:
- `npm start` - Production start
- `npm run dev` - Development with nodemon

### Frontend Setup

#### 1. Environment Variables (.env)
```bash
# Update for production
VITE_API_URL=<your-backend-url>/api
```

#### 2. Build for Production
```bash
cd frontend
npm run build
```
This creates optimized production files in `frontend/dist/`

---

## 🚀 Deployment Options

### Option 1: Separate Hosting (Recommended)

#### Backend (Render/Railway/Heroku)
1. Create new service
2. Connect GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables from .env
6. Deploy

#### Frontend (Vercel/Netlify)
1. Create new project
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/dist`
4. Add environment variable: `VITE_API_URL`
5. Deploy

### Option 2: Single Server (VPS)

#### Install Dependencies
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2
```

#### Deploy Backend
```bash
cd backend
npm install
pm2 start index.js --name reelsthan-api
pm2 save
pm2 startup
```

#### Deploy Frontend
```bash
cd frontend
npm install
npm run build

# Serve with nginx or serve package
sudo npm install -g serve
pm2 start "serve -s dist -p 3001" --name reelsthan-frontend
```

---

## 🔒 Security Checklist

### Critical Items

- [ ] **Change JWT_SECRET** to a strong random value (minimum 32 characters)
- [ ] **Update CORS origin** to production frontend URL
- [ ] **Set NODE_ENV=production** in backend
- [ ] **Remove console.log** from production code (optional but recommended)
- [ ] **Enable HTTPS** on both frontend and backend
- [ ] **Secure MongoDB** with strong password and IP whitelist
- [ ] **Rate limiting** - Consider adding express-rate-limit
- [ ] **Helmet.js** - Add security headers

### Optional Security Enhancements

```bash
cd backend
npm install helmet express-rate-limit
```

Update `backend/src/app.js`:
```javascript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Add after cors
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);
```

---

## 📊 Database Setup

### MongoDB Atlas (Production)
1. Create cluster at mongodb.com
2. Add IP whitelist (0.0.0.0/0 for cloud hosting or specific IPs)
3. Create database user with strong password
4. Copy connection string to `MONGODB_URL`
5. Replace `<password>` and `<dbname>` in connection string

---

## 🌐 Domain & DNS Setup

### Backend API
- Set A record or CNAME pointing to backend server
- Example: `api.reelsthan.com`

### Frontend
- Set A record or CNAME pointing to frontend hosting
- Example: `reelsthan.com` or `app.reelsthan.com`

### Update Environment Variables
```bash
# Backend .env
BACKEND_URL=https://api.reelsthan.com
FRONTEND_URL=https://reelsthan.com

# Frontend .env
VITE_API_URL=https://api.reelsthan.com/api
```

---

## 🧪 Testing Before Go-Live

### Backend Health Check
```bash
curl https://api.reelsthan.com/api/auth/check-auth
```

### Frontend Check
1. Visit your frontend URL
2. Test user registration
3. Test login
4. Test reel upload
5. Test video playback
6. Test profile editing

### Critical User Flows
- [ ] Sign up new account
- [ ] Receive welcome email
- [ ] Upload first reel
- [ ] View reels feed
- [ ] Like/comment/save reels
- [ ] Password reset flow
- [ ] Profile photo upload
- [ ] Logout and login again

---

## 📝 Post-Deployment

### Monitoring
- Set up error logging (Sentry, LogRocket)
- Monitor server resources
- Track API response times
- Monitor MongoDB performance

### Backups
- Enable MongoDB automated backups
- Backup ImageKit assets
- Keep environment variables secure

---

## 🐛 Common Issues & Solutions

### Issue: CORS errors in production
**Solution:** Verify CORS origin matches exact frontend URL (including https://)

### Issue: Images not loading
**Solution:** Check ImageKit credentials and CORS settings in ImageKit dashboard

### Issue: Videos not autoplaying
**Solution:** Ensure HTTPS is enabled (autoplay requires secure context)

### Issue: Cookies not working
**Solution:** Set sameSite and secure flags in cookie options for cross-domain

---

## 📞 Support Resources

- MongoDB Atlas: https://cloud.mongodb.com
- ImageKit: https://imagekit.io
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs

---

## ⚡ Quick Start Commands

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run build
npm run preview  # Test production build locally
```

---

**Last Updated:** October 30, 2025
**Version:** 1.0.0
**Status:** Production Ready ✅
