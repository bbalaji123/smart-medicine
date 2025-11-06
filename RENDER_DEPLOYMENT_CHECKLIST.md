# 📋 Render Deployment Checklist

Follow this checklist to ensure smooth deployment to Render.

## Before Deployment

### Prerequisites
- [ ] GitHub account created
- [ ] Render account created ([render.com](https://render.com))
- [ ] MongoDB Atlas account created ([mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas))
- [ ] Code pushed to GitHub repository

### MongoDB Atlas Setup
- [ ] Create a MongoDB cluster
- [ ] Create a database user with password
- [ ] Set network access to `0.0.0.0/0` (allow all IPs)
- [ ] Get connection string (replace `<password>` with actual password)
- [ ] Test connection string locally

## Deployment Steps

### Option A: One-Click Blueprint Deployment (Recommended)

- [ ] Ensure `render.yaml` exists in repository root
- [ ] Push all changes to GitHub
- [ ] Go to [Render Dashboard](https://dashboard.render.com/)
- [ ] Click **New** → **Blueprint**
- [ ] Select your GitHub repository
- [ ] Render auto-detects `render.yaml` and creates both services
- [ ] Wait for initial deployment (may take 5-10 minutes)
- [ ] Go to backend service → Environment tab
- [ ] Add `MONGODB_URI` environment variable
- [ ] Save (triggers redeploy)
- [ ] Wait for services to restart

### Option B: Manual Deployment

#### Backend
- [ ] Click **New** → **Web Service**
- [ ] Connect GitHub repository
- [ ] Set **Root Directory**: `backend`
- [ ] Set **Build Command**: `npm install`
- [ ] Set **Start Command**: `npm start`
- [ ] Add all environment variables from `backend/.env.example`
- [ ] Deploy

#### Frontend
- [ ] Click **New** → **Static Site**
- [ ] Connect GitHub repository
- [ ] Set **Root Directory**: `frontend`
- [ ] Set **Build Command**: `npm install && npm run build`
- [ ] Set **Publish Directory**: `build`
- [ ] Add environment variable: `REACT_APP_API_URL` = `https://your-backend-url.onrender.com/api`
- [ ] Deploy

## After Deployment

### Backend Configuration
- [ ] Copy backend URL from Render dashboard
- [ ] Test health endpoint: `https://your-backend-url.onrender.com/health`
- [ ] Should return: `{"success": true, "status": "OK"}`
- [ ] Update `CORS_ORIGINS` with frontend URL
- [ ] Update `CLIENT_URL` with frontend URL

### Frontend Configuration
- [ ] Copy frontend URL from Render dashboard
- [ ] Ensure `REACT_APP_API_URL` points to backend URL with `/api` suffix
- [ ] Visit frontend URL
- [ ] Test signup and login functionality

### Final Testing
- [ ] Create a test account
- [ ] Login successfully
- [ ] Add a medication
- [ ] Add a health metric
- [ ] Check all features work
- [ ] Test on mobile device

## Environment Variables Reference

### Backend Required Variables
```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-medicine?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=1800000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
CORS_ORIGINS=https://your-frontend-url.onrender.com
CLIENT_URL=https://your-frontend-url.onrender.com
```

### Frontend Required Variables
```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

## Common Issues & Solutions

### Issue: "API endpoint not found"
- [ ] Verify `REACT_APP_API_URL` ends with `/api`
- [ ] Check backend is running (visit health endpoint)
- [ ] Clear browser cache and hard reload

### Issue: CORS errors
- [ ] Update `CORS_ORIGINS` in backend with exact frontend URL
- [ ] No trailing slashes in URLs
- [ ] Both URLs should use `https://`
- [ ] Redeploy backend after CORS changes

### Issue: "Cannot connect to MongoDB"
- [ ] Verify MongoDB Atlas IP whitelist is `0.0.0.0/0`
- [ ] Check connection string format
- [ ] Ensure password is URL-encoded
- [ ] Database name is included in connection string

### Issue: Build failures
- [ ] Check Render logs for specific errors
- [ ] Verify all dependencies are in `package.json`
- [ ] Ensure Node version compatibility (18+)
- [ ] Check for missing environment variables

### Issue: Free tier services sleep after inactivity
- [ ] Free tier services sleep after 15 minutes of inactivity
- [ ] First request after sleep takes 30-60 seconds
- [ ] Consider upgrading to paid plan for 24/7 uptime
- [ ] Or use a service like [UptimeRobot](https://uptimerobot.com/) to ping every 5 minutes

## Important Notes

⚠️ **Security**
- Never commit `.env` files to GitHub
- Use strong, random JWT secrets (32+ characters)
- Keep MongoDB credentials secure
- Enable MongoDB network restrictions in production if possible

🆓 **Free Tier Limits**
- Backend: 750 hours/month, sleeps after 15 min inactivity
- Frontend: 100 GB bandwidth/month
- Auto-deploys on git push

💡 **Tips**
- Use Render's auto-deploy feature (deploys on git push)
- Check logs in Render dashboard for debugging
- Set up custom domains in Render dashboard (free)
- Enable branch deploys for testing

## Support & Resources

- [Render Documentation](https://render.com/docs)
- [Render Community Forum](https://community.render.com/)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Project GitHub Repository](https://github.com/yourusername/smart-medicine)

---

**Last Updated**: November 6, 2025
