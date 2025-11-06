# 🔧 Handy Commands Reference

Quick reference for common commands during development and deployment.

## 📦 Project Setup

### Initial Setup
```bash
# Clone repository
git clone <your-repo-url>
cd smart-medicine

# Install dependencies (both)
cd backend && npm install
cd ../frontend && npm install
```

### Environment Setup
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your settings

# Frontend
cd frontend
cp .env.example .env
# Edit .env with your settings
```

## 🚀 Development

### Start Backend
```bash
cd backend
npm run dev          # Development with nodemon
npm start            # Production mode
```

### Start Frontend
```bash
cd frontend
npm start            # Development server (port 3000)
npm run build        # Production build
```

### Run Both Simultaneously
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

## 🔍 Testing & Verification

### Pre-Deployment Check
```bash
# From project root
node verify-deployment.js
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:5001/health

# Or visit in browser
http://localhost:5001/health
```

### Check Build Size
```bash
cd frontend
npm run build
# Check build/ folder size
```

## 📊 MongoDB

### Local MongoDB
```bash
# Start MongoDB (if installed locally)
mongod --dbpath /path/to/data

# Connect to MongoDB
mongo
use smart-medicine
show collections
```

### MongoDB Atlas
```bash
# Test connection (using mongosh)
mongosh "mongodb+srv://username:password@cluster.mongodb.net/smart-medicine"
```

## 🌐 Git Commands

### Initial Commit
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Before Deployment
```bash
# Check status
git status

# Add deployment files
git add render.yaml DEPLOYMENT.md QUICK_DEPLOY.md
git commit -m "Add Render deployment configuration"
git push origin main
```

### Create New Branch
```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

## 🔧 Package Management

### Update Dependencies
```bash
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix
```

### Install New Package
```bash
# Backend
cd backend
npm install package-name

# Frontend
cd frontend
npm install package-name
```

### Remove Package
```bash
npm uninstall package-name
```

## 🐛 Debugging

### View Logs
```bash
# Backend logs
cd backend
npm run dev  # Shows logs in console

# Frontend logs
cd frontend
npm start    # Shows logs in console
```

### Clear Cache
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Reset Git
```bash
# Discard all changes
git reset --hard HEAD

# Clean untracked files
git clean -fd
```

## 🚀 Render Deployment

### Deploy via Blueprint
```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Go to Render dashboard
# 3. New → Blueprint
# 4. Select repository
# 5. Apply
```

### Manual Backend Deploy
```bash
# Render will run automatically:
npm install
npm start
```

### Manual Frontend Deploy
```bash
# Render will run automatically:
npm install && npm run build
# Serves from build/ directory
```

### Check Deployment Status
```bash
# Health check (replace with your URL)
curl https://your-backend.onrender.com/health

# Frontend (in browser)
https://your-frontend.onrender.com
```

## 📝 Environment Variables

### Set Locally
```bash
# Windows (cmd)
set MONGODB_URI=mongodb://localhost:27017/smart-medicine

# Windows (PowerShell)
$env:MONGODB_URI="mongodb://localhost:27017/smart-medicine"

# Linux/Mac
export MONGODB_URI=mongodb://localhost:27017/smart-medicine
```

### View Environment
```bash
# Windows (cmd)
echo %MONGODB_URI%

# Windows (PowerShell)
echo $env:MONGODB_URI

# Linux/Mac
echo $MONGODB_URI
```

## 🧪 Testing APIs

### Using curl

#### Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Get Medications (with auth)
```bash
curl http://localhost:5001/api/medications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Add Medication
```bash
curl -X POST http://localhost:5001/api/medications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name":"Aspirin","dosage":"100mg","frequency":"daily"}'
```

### Using PowerShell

#### Login
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

## 📊 Monitoring

### View Process
```bash
# Find Node processes
ps aux | grep node

# Kill specific process
kill -9 <PID>
```

### Check Port Usage
```bash
# Windows
netstat -ano | findstr :5001

# Linux/Mac
lsof -i :5001
```

### View Running Services
```bash
# Check if backend is running
curl http://localhost:5001/health

# Check if frontend is running
curl http://localhost:3000
```

## 🔒 Security

### Generate Secrets
```bash
# Generate random JWT secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

### Check Dependencies for Vulnerabilities
```bash
npm audit
npm audit fix
```

## 📦 Production Build

### Build Frontend
```bash
cd frontend
npm run build

# Build will be in frontend/build/
# Test locally
npx serve -s build
```

### Test Production Backend
```bash
cd backend
NODE_ENV=production npm start
```

## 🗄️ Database Operations

### Backup MongoDB
```bash
# Local MongoDB
mongodump --db smart-medicine --out ./backup

# Restore
mongorestore --db smart-medicine ./backup/smart-medicine
```

### Drop Database (careful!)
```bash
mongo
use smart-medicine
db.dropDatabase()
```

## 📈 Performance

### Check Bundle Size
```bash
cd frontend
npm run build
# Check build/static/js/*.js sizes
```

### Analyze Bundle
```bash
cd frontend
npm install -g source-map-explorer
npm run build
source-map-explorer build/static/js/*.js
```

## 🔄 Updates

### Update Project
```bash
# Pull latest changes
git pull origin main

# Update dependencies
cd backend && npm install
cd ../frontend && npm install

# Restart servers
```

### Deploy Updates
```bash
# Commit changes
git add .
git commit -m "Update: description of changes"
git push origin main

# Render auto-deploys on push
```

## 🆘 Emergency Commands

### Kill All Node Processes
```bash
# Windows
taskkill /F /IM node.exe

# Linux/Mac
killall node
```

### Reset Everything
```bash
# Remove all node_modules
rm -rf backend/node_modules frontend/node_modules

# Remove lock files
rm backend/package-lock.json frontend/package-lock.json

# Reinstall
cd backend && npm install
cd ../frontend && npm install
```

### Force Clean Git
```bash
git clean -fdx
git reset --hard HEAD
```

---

## 💡 Quick Tips

- **Use `npm ci` instead of `npm install` for faster, cleaner installs**
- **Always test locally before deploying**
- **Keep `.env` files out of git**
- **Use meaningful commit messages**
- **Check Render logs for deployment issues**
- **Monitor MongoDB Atlas usage**
- **Set up alerts for service health**

---

**Pro Tip**: Bookmark this file for quick reference! 📌
