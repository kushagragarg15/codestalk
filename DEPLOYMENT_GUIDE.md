# 🚀 Deployment Guide - CodeStalk

## Overview

CodeStalk is a full-stack application that requires:
- **Frontend**: React app (can be deployed to Netlify, Vercel, etc.)
- **Backend**: Express API (needs Node.js hosting like Render, Railway, etc.)
- **Database**: MongoDB (MongoDB Atlas recommended)

## 📋 Deployment Architecture

```
┌─────────────────┐
│   Netlify       │  ← Frontend (React)
│   (Static)      │
└────────┬────────┘
         │
         │ API Calls
         ↓
┌─────────────────┐
│   Render/       │  ← Backend (Express)
│   Railway       │
└────────┬────────┘
         │
         │ Database
         ↓
┌─────────────────┐
│  MongoDB Atlas  │  ← Database
└─────────────────┘
```

---

# Part 1: Deploy Backend (API Server)

## Option A: Deploy to Render (Recommended - Free Tier)

### Step 1: Prepare Backend for Deployment

1. **Create `server/package.json` start script** (already done):
   ```json
   {
     "scripts": {
       "start": "node dist/index.js",
       "build": "tsc"
     }
   }
   ```

2. **Ensure environment variables are set** in `server/.env.example`

### Step 2: Deploy to Render

1. **Sign up for Render**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `kushagragarg15/codestalk`
   - Click "Connect"

3. **Configure Service**
   ```
   Name: codestalk-api
   Region: Choose closest to you
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Add Environment Variables**
   Click "Environment" and add:
   ```
   PORT=4000
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your-super-secret-key-min-16-chars
   JWT_EXPIRES_IN=30d
   CLIENT_ORIGIN=https://your-netlify-app.netlify.app
   LEETCODE_PROVIDER=alfa
   ALFA_LEETCODE_API_URL=https://alfa-leetcode-api.onrender.com
   LEETCODE_GRAPHQL_URL=https://leetcode.com/graphql
   DEFAULT_CACHE_TTL_SEC=300
   LEETCODE_PROXY_MAX=60
   LEETCODE_PROXY_WINDOW_MS=60000
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your API will be at: `https://codestalk-api.onrender.com`

### Step 3: Test Backend

```bash
# Test health endpoint
curl https://codestalk-api.onrender.com/health

# Expected response:
{"ok":true,"service":"codestalk-api"}
```

---

## Option B: Deploy to Railway

### Step 1: Deploy to Railway

1. **Sign up for Railway**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `kushagragarg15/codestalk`

3. **Configure Service**
   - Railway will auto-detect Node.js
   - Set root directory: `server`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

4. **Add Environment Variables**
   - Click "Variables" tab
   - Add all variables from above

5. **Deploy**
   - Railway will auto-deploy
   - Get your URL from the "Settings" tab

---

## Option C: Deploy to Heroku

### Step 1: Prepare for Heroku

1. **Create `Procfile` in server directory**:
   ```
   web: npm start
   ```

2. **Deploy**:
   ```bash
   # Install Heroku CLI
   # Then:
   heroku login
   heroku create codestalk-api
   
   # Set environment variables
   heroku config:set MONGODB_URI=your_uri
   heroku config:set JWT_SECRET=your_secret
   # ... add all other env vars
   
   # Deploy
   git subtree push --prefix server heroku main
   ```

---

# Part 2: Setup MongoDB Atlas

## Step 1: Create MongoDB Atlas Account

1. **Sign up**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create Cluster**
   - Choose "Free Shared" tier
   - Select region closest to your backend
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `codestalk`
   - Password: Generate secure password
   - User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Addresses**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string:
   ```
   mongodb+srv://codestalk:<password>@cluster0.xxxxx.mongodb.net/codestalk?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password

6. **Update Backend Environment Variable**
   - In Render/Railway, update `MONGODB_URI` with your connection string

---

# Part 3: Deploy Frontend to Netlify

## Step 1: Prepare Frontend for Deployment

1. **Update API URL in client**

   Create `client/.env.production`:
   ```bash
   VITE_API_URL=https://codestalk-api.onrender.com
   ```

2. **Update `client/src/api.ts`**:
   ```typescript
   import axios from "axios";

   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || "/api",
     headers: { "Content-Type": "application/json" },
   });

   export function setAuthToken(token: string | null) {
     if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
     else delete api.defaults.headers.common.Authorization;
   }

   export default api;
   ```

3. **Create `netlify.toml` in root**:
   ```toml
   [build]
     base = "client"
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

   [build.environment]
     NODE_VERSION = "20"
   ```

## Step 2: Deploy to Netlify

### Method 1: Deploy via Netlify UI (Easiest)

1. **Sign up for Netlify**
   - Go to https://netlify.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Select `kushagragarg15/codestalk`
   - Click "Deploy"

3. **Configure Build Settings**
   ```
   Base directory: client
   Build command: npm run build
   Publish directory: client/dist
   ```

4. **Add Environment Variables**
   - Go to "Site settings" → "Environment variables"
   - Add:
     ```
     VITE_API_URL=https://codestalk-api.onrender.com
     ```

5. **Deploy**
   - Click "Deploy site"
   - Wait 2-3 minutes
   - Your site will be at: `https://random-name.netlify.app`

6. **Custom Domain (Optional)**
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Follow instructions

### Method 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
cd client
netlify init

# Deploy
netlify deploy --prod
```

## Step 3: Update Backend CORS

Update `CLIENT_ORIGIN` in your backend environment variables:
```
CLIENT_ORIGIN=https://your-app.netlify.app
```

---

# Part 4: Final Configuration

## Step 1: Update Backend CORS

In Render/Railway, update environment variable:
```
CLIENT_ORIGIN=https://your-netlify-app.netlify.app,http://localhost:5173
```

## Step 2: Test Full Stack

1. **Visit your Netlify URL**
2. **Create an account**
3. **Add friends**
4. **Check all features work**

## Step 3: Monitor Deployments

### Netlify
- Dashboard: https://app.netlify.com
- View deploy logs
- Check analytics

### Render
- Dashboard: https://dashboard.render.com
- View logs
- Monitor performance

### MongoDB Atlas
- Dashboard: https://cloud.mongodb.com
- Monitor database usage
- View metrics

---

# 🔧 Troubleshooting

## Issue: CORS Errors

**Solution**: Update `CLIENT_ORIGIN` in backend to include your Netlify URL

```bash
# In Render/Railway environment variables:
CLIENT_ORIGIN=https://your-app.netlify.app
```

## Issue: API Calls Failing

**Solution**: Check `VITE_API_URL` in Netlify environment variables

```bash
# Should be:
VITE_API_URL=https://codestalk-api.onrender.com
```

## Issue: MongoDB Connection Failed

**Solution**: 
1. Check MongoDB Atlas IP whitelist (should include 0.0.0.0/0)
2. Verify connection string is correct
3. Check database user has correct permissions

## Issue: Build Fails on Netlify

**Solution**:
```bash
# Check build command is correct:
npm run build

# Check base directory is set to: client
# Check publish directory is set to: client/dist
```

## Issue: Environment Variables Not Working

**Solution**:
1. Restart services after adding env vars
2. Check variable names match exactly
3. No quotes needed in Netlify/Render UI

---

# 📊 Performance Optimization

## Frontend (Netlify)

1. **Enable Netlify CDN** (automatic)
2. **Enable Asset Optimization**
   - Go to "Site settings" → "Build & deploy" → "Post processing"
   - Enable "Bundle CSS" and "Minify JS"

3. **Add Headers** in `netlify.toml`:
   ```toml
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
       X-XSS-Protection = "1; mode=block"
       X-Content-Type-Options = "nosniff"
       Referrer-Policy = "strict-origin-when-cross-origin"
   ```

## Backend (Render)

1. **Use Render's Free Tier** (spins down after inactivity)
2. **Upgrade to Paid** for always-on service ($7/month)
3. **Enable Auto-Deploy** from GitHub

## Database (MongoDB Atlas)

1. **Create Indexes** for better performance
2. **Monitor Usage** in Atlas dashboard
3. **Upgrade Tier** if needed (free tier: 512MB)

---

# 💰 Cost Breakdown

## Free Tier (Recommended for Starting)

- **Netlify**: Free (100GB bandwidth/month)
- **Render**: Free (spins down after 15 min inactivity)
- **MongoDB Atlas**: Free (512MB storage)
- **Total**: $0/month

## Paid Tier (For Production)

- **Netlify Pro**: $19/month (more bandwidth, analytics)
- **Render Starter**: $7/month (always-on, 512MB RAM)
- **MongoDB Atlas M10**: $10/month (2GB RAM, backups)
- **Total**: ~$36/month

---

# 🔐 Security Checklist

Before deploying:

- [ ] Change JWT_SECRET to strong random string
- [ ] Use MongoDB Atlas (not local MongoDB)
- [ ] Enable HTTPS (automatic on Netlify/Render)
- [ ] Set proper CORS origins
- [ ] Don't commit .env files
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB IP whitelist
- [ ] Use strong database passwords
- [ ] Enable rate limiting (already implemented)
- [ ] Monitor logs for suspicious activity

---

# 📝 Deployment Checklist

## Pre-Deployment
- [ ] Test locally with production build
- [ ] Update all environment variables
- [ ] Create MongoDB Atlas cluster
- [ ] Test API endpoints

## Backend Deployment
- [ ] Deploy to Render/Railway
- [ ] Add all environment variables
- [ ] Test health endpoint
- [ ] Verify MongoDB connection

## Frontend Deployment
- [ ] Update API URL
- [ ] Deploy to Netlify
- [ ] Add environment variables
- [ ] Test all pages

## Post-Deployment
- [ ] Update backend CORS
- [ ] Test full user flow
- [ ] Monitor logs
- [ ] Set up custom domain (optional)

---

# 🎉 Success!

Your CodeStalk app is now live!

**Frontend**: https://your-app.netlify.app
**Backend**: https://codestalk-api.onrender.com
**Database**: MongoDB Atlas

## Share Your Deployment

Update your GitHub README with live demo link:

```markdown
## 🌐 Live Demo

**Try it now**: https://your-app.netlify.app

Test with these public LeetCode profiles:
- `tourist`
- `uwi`
- `jiangly`
```

---

# 📚 Additional Resources

- [Netlify Docs](https://docs.netlify.com)
- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

---

**Need help?** Open an issue on GitHub: https://github.com/kushagragarg15/codestalk/issues
