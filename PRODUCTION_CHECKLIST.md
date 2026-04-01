# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment Verification

### Code Quality
- [x] Frontend build successful (`npm run build` - 469KB, gzip: 148KB)
- [x] Backend syntax validated (no errors)
- [x] All unnecessary documentation removed
- [x] README.md updated with comprehensive instructions
- [x] .env.example files updated for both backend and frontend
- [x] Git repository clean and pushed to GitHub

### Database
- [x] Database seeded with 30 users and 30 HD Pexels videos
- [x] Test account working: `aaravsharma@example.com` / `password123`
- [x] Seed script with Pexels API integration (`seed-with-api.js`)
- [x] Fallback videos configured (Mixkit CDN)

### Features Verified
- [x] Video optimization (lazy loading, single playback)
- [x] Global video manager (only one video plays at a time)
- [x] Loading indicators and smooth transitions
- [x] Toast notifications for all user actions
- [x] Error handling (API interceptor, forgot password, YouTube embeds)
- [x] Authentication (login, signup, forgot password, email verification)

---

## 🌐 Deployment Steps

### 1. Backend Deployment (Render)

#### Setup on Render:
1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `PYxMAFIA/ReelSthan`
4. Configure the service:
   - **Name**: `reelsthan` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

#### Environment Variables to Add:
```env
PORT=3000
NODE_ENV=production
MONGODB_URL=mongodb://piyuscollege_db_user:FMumbRAVcgFmIQ9u@ac-dduwihm-shard-00-01.tapdutr.mongodb.net:27017/insta_db?ssl=true&authSource=admin&retryWrites=true&w=majority&directConnection=true
JWT_SECRET=3bc761256f153e354c99cc93d3d574f2
FRONTEND_URL=https://reel-sthan.vercel.app
BACKEND_URL=https://reelsthan.onrender.com
IMAGEKIT_PUBLIC_KEY=public_xKA217akVXg3wezZIst4FkUFqA0=
IMAGEKIT_PRIVATE_KEY=private_uljJHn8ZNth2raX2EOXGYiaBaKg=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/kizn4nmkl
GMAIL_USER=piyus.useless@gmail.com
GOOGLE_APP_PASSWORD=boqrgdnhbudmudal
MAILTRAP_TOKEN=4fdc01807ba3d3f52283a972092b4510
PEXELS_API_KEY=356bo6wIOTlh6MgWbiX5cDTky3PIBNajnoV0bSpWFUvpQAcovEYdVoUN
```

5. Click **"Create Web Service"**
6. Wait for deployment (usually 2-5 minutes)
7. Note your backend URL: `https://reelsthan.onrender.com`

#### Post-Deployment (Optional):
```bash
# SSH into Render or use Shell
# Seed production database with Pexels videos
node seed-with-api.js
```

---

### 2. Frontend Deployment (Vercel)

#### Setup on Vercel:
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Import your GitHub repository: `PYxMAFIA/ReelSthan`
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Environment Variables to Add:
```env
VITE_API_BASE_URL=https://reelsthan.onrender.com/api
```

5. Click **"Deploy"**
6. Wait for deployment (usually 1-2 minutes)
7. Note your frontend URL: `https://reel-sthan.vercel.app`

---

### 3. Update Backend Environment Variables

**IMPORTANT**: After frontend deploys, update backend `FRONTEND_URL`:

1. Go to Render dashboard → Your service → Environment
2. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://reel-sthan.vercel.app
   ```
3. Save changes (this will trigger auto-redeploy)

---

## 🧪 Post-Deployment Testing

### Test Checklist:
- [ ] **Homepage loads** (visit your Vercel URL)
- [ ] **Backend API responds** (check Network tab, should see 200 responses)
- [ ] **Login works** with test account: `aaravsharma@example.com` / `password123`
- [ ] **Videos load and play** (check console for errors)
- [ ] **Only one video plays at a time** (scroll through reels)
- [ ] **Like/Comment/Save actions work** (check toast notifications)
- [ ] **Profile pages load** (click on usernames)
- [ ] **Upload reel works** (requires login)
- [ ] **Forgot password shows proper message** (if email service is down)
- [ ] **YouTube embeds fallback works** (if any YouTube videos fail)
- [ ] **Mobile responsive** (test on mobile device or DevTools)

### Performance Checks:
- [ ] **Lighthouse score** (should be 80+ on Performance)
- [ ] **Network waterfall** (videos should lazy load)
- [ ] **Console errors** (should be minimal or none)
- [ ] **Memory leaks** (scroll through 50+ reels, check memory usage)

---

## 🔧 Troubleshooting

### Backend Issues:

**Build fails on Render:**
- Check Node.js version (should be v16+)
- Verify all environment variables are set
- Check build logs for specific errors

**MongoDB connection fails:**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure database user has read/write permissions

**Email not sending:**
- Verify Gmail app password (not regular password)
- Check Google account has 2FA enabled
- Try Mailtrap as fallback

### Frontend Issues:

**API requests fail (CORS):**
- Verify `FRONTEND_URL` is set correctly in backend
- Check `VITE_API_BASE_URL` points to your Render backend
- Ensure backend is deployed and running

**Videos not loading:**
- Check if Pexels API key is valid
- Verify seed script ran successfully
- Check browser console for specific errors

**Build fails on Vercel:**
- Check `package.json` has correct build script
- Verify all dependencies are in `dependencies` (not `devDependencies`)
- Check build logs for specific errors

### General Issues:

**Slow performance:**
- Upgrade Render instance to paid tier
- Check Render logs for memory/CPU issues
- Consider adding Redis for caching

**Database grows too large:**
- Implement cleanup cron job
- Set MongoDB TTL indexes on old reels
- Archive old data to separate collection

---

## 📊 Monitoring

### Recommended Tools:
- **Render Dashboard**: Monitor backend logs, metrics, and health
- **Vercel Analytics**: Track frontend performance and page views
- **MongoDB Atlas**: Monitor database performance and storage
- **Sentry** (optional): Real-time error tracking
- **Google Analytics** (optional): User behavior tracking

### Key Metrics to Monitor:
- **Response times**: Backend API should respond < 500ms
- **Error rates**: Should be < 1% of total requests
- **Video load times**: Should be < 3 seconds on good connections
- **User engagement**: Average session duration, reels viewed
- **Database size**: Should grow predictably based on upload rate

---

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Users can sign up and log in
- ✅ Videos play smoothly (only one at a time)
- ✅ All social features work (like, comment, save)
- ✅ Mobile experience is smooth
- ✅ No major console errors
- ✅ Page load time < 3 seconds
- ✅ Lighthouse Performance score > 80

---

## 🔄 Future Updates

When pushing new changes:
1. Commit changes to GitHub: `git push origin main`
2. Vercel will auto-deploy frontend (1-2 min)
3. Render will auto-deploy backend (2-5 min)
4. Test changes on production URLs

---

## 📞 Support

If you encounter issues:
1. Check Render logs: Dashboard → Logs
2. Check Vercel logs: Dashboard → Deployments → View Logs
3. Check browser console for frontend errors
4. Check MongoDB Atlas logs for database issues

---

**Last Updated**: April 1, 2026  
**Deployment Status**: Ready for Production 🚀  
**Version**: 1.0.0
