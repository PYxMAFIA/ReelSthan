# ⚡ Quick Deployment Guide

## 📦 What's Ready

✅ **32 files changed**, 2553 insertions, 317 deletions  
✅ **Frontend build**: 469KB (gzip: 148KB)  
✅ **Backend verified**: No syntax errors  
✅ **Database seeded**: 30 users + 30 HD Pexels videos  
✅ **Git pushed**: All changes on GitHub

---

## 🚀 Deploy in 3 Steps

### Step 1: Deploy Backend (Render) - 5 min

1. **Go to**: [render.com](https://render.com)
2. **New Web Service** → Connect GitHub: `PYxMAFIA/ReelSthan`
3. **Settings**:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
4. **Add all env vars from backend/.env** (see PRODUCTION_CHECKLIST.md)
5. **Deploy** → Wait 3-5 min
6. **Copy your backend URL**: `https://YOUR-APP.onrender.com`

### Step 2: Deploy Frontend (Vercel) - 2 min

1. **Go to**: [vercel.com](https://vercel.com)
2. **New Project** → Import: `PYxMAFIA/ReelSthan`
3. **Settings**:
   - Root Directory: `frontend`
   - Framework: Vite
4. **Add env var**:
   ```
   VITE_API_BASE_URL=https://YOUR-BACKEND-URL.onrender.com/api
   ```
5. **Deploy** → Wait 1-2 min

### Step 3: Update Backend CORS - 1 min

1. **Go back to Render** → Your service → Environment
2. **Update**:
   ```
   FRONTEND_URL=https://YOUR-APP.vercel.app
   ```
3. **Save** (auto-redeploys in 2 min)

---

## ✅ Test Your App

**Login**: `aaravsharma@example.com` / `password123`

**Check**:
- [ ] Homepage loads
- [ ] Videos play (only one at a time)
- [ ] Like/Comment/Save work
- [ ] Login/Signup work
- [ ] Mobile responsive

---

## 🆘 Quick Fixes

**CORS errors?**  
→ Update `FRONTEND_URL` in Render to match Vercel URL

**Videos not loading?**  
→ SSH into Render, run: `node seed-with-api.js`

**Build fails?**  
→ Check logs, verify env vars are set

---

## 📚 Full Details

See **PRODUCTION_CHECKLIST.md** for:
- Complete env var list
- Troubleshooting guide
- Monitoring tips
- Post-deployment testing

---

**Ready?** Start with Step 1! 🚀
