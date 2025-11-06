# Smart Medicine - Render Deployment Guide

## 🚀 Quick Deployment Steps

### Backend Deployment (Web Service)

1. **Create Web Service on Render**
   - Connect your GitHub repository
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

2. **Add Environment Variables** (copy from `backend/.env.example`)
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

3. **Deploy** and copy your backend URL

---

### Frontend Deployment (Static Site)

1. **Create Static Site on Render**
   - Connect your GitHub repository
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

2. **Add Environment Variables** (copy from `frontend/.env.example`)
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```
   
   ⚠️ **Important**: Make sure to include `/api` at the end!

3. **Deploy** and copy your frontend URL

---

### After Both Are Deployed

1. **Update Backend CORS Settings**
   - Go to Backend service → Environment
   - Update `CORS_ORIGINS` with your actual frontend URL
   - Update `CLIENT_URL` with your actual frontend URL
   - Save (triggers redeploy)

2. **Test Your Deployment**
   - Visit: `https://your-backend-url.onrender.com/health`
   - Should return: `{"success": true, "status": "OK"}`
   - Visit your frontend URL and try signing up/logging in

---

## 🔧 Local Development Setup

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Git

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and other settings
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
# Edit .env with your backend URL (default: http://localhost:5001/api)
npm install
npm start
```

---

## 📝 Environment Variables

### Backend (.env)
See `backend/.env.example` for all available options.

**Required:**
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 chars)
- `CORS_ORIGINS` - Allowed frontend URLs

### Frontend (.env)
See `frontend/.env.example` for all available options.

**Required:**
- `REACT_APP_API_URL` - Your backend API URL (include `/api` suffix)

---

## 🐛 Common Issues

### "API endpoint not found"
- ✅ Check `REACT_APP_API_URL` has `/api` at the end
- ✅ Verify backend is deployed and running
- ✅ Test backend health: `https://backend-url/health`

### CORS errors
- ✅ Update backend `CORS_ORIGINS` with exact frontend URL
- ✅ No trailing slashes in URLs
- ✅ Make sure both use `https://`

### MongoDB connection failed
- ✅ Check MongoDB Atlas IP whitelist: `0.0.0.0/0`
- ✅ Verify connection string includes database name
- ✅ Check username/password are correct

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/cloud/atlas)
- [Environment Variables Best Practices](https://render.com/docs/environment-variables)

---

## 🔒 Security Notes

- Never commit `.env` files to Git (already in `.gitignore`)
- Use strong JWT secrets (min 32 characters, random)
- Keep MongoDB credentials secure
- Enable MongoDB Atlas network access restrictions in production
- Use environment-specific configurations

---

## 📞 Support

For issues or questions, check the logs in Render dashboard or create an issue in the repository.
