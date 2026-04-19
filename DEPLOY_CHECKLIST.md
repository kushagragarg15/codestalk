# 🚀 Quick Deployment Checklist

## Before You Start

- [ ] GitHub repository is up to date
- [ ] Code is tested locally
- [ ] All features work in development

---

## Step 1: MongoDB Atlas (5 minutes)

1. [ ] Go to https://www.mongodb.com/cloud/atlas
2. [ ] Sign up / Log in
3. [ ] Create free cluster
4. [ ] Create database user (username: `codestalk`, strong password)
5. [ ] Whitelist all IPs (0.0.0.0/0)
6. [ ] Copy connection string
7. [ ] Save connection string securely

**Connection String Format**:
```
mongodb+srv://codestalk:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/codestalk?retryWrites=true&w=majority
```

---

## Step 2: Deploy Backend to Render (10 minutes)

1. [ ] Go to https://render.com
2. [ ] Sign up with GitHub
3. [ ] Click "New +" → "Web Service"
4. [ ] Connect repository: `kushagragarg15/codestalk`
5. [ ] Configure:
   - Name: `codestalk-api`
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

6. [ ] Add Environment Variables:
   ```
   PORT=4000
   MONGODB_URI=<your_mongodb_connection_string>
   JWT_SECRET=<generate_random_32_char_string>
   JWT_EXPIRES_IN=30d
   CLIENT_ORIGIN=http://localhost:5173
   LEETCODE_PROVIDER=alfa
   ALFA_LEETCODE_API_URL=https://alfa-leetcode-api.onrender.com
   LEETCODE_GRAPHQL_URL=https://leetcode.com/graphql
   DEFAULT_CACHE_TTL_SEC=300
   LEETCODE_PROXY_MAX=60
   LEETCODE_PROXY_WINDOW_MS=60000
   ```

7. [ ] Click "Create Web Service"
8. [ ] Wait for deployment (5-10 minutes)
9. [ ] Copy your API URL: `https://codestalk-api.onrender.com`
10. [ ] Test: `curl https://codestalk-api.onrender.com/health`

**Expected Response**: `{"ok":true,"service":"codestalk-api"}`

---

## Step 3: Deploy Frontend to Netlify (5 minutes)

1. [ ] Update `client/.env.production`:
   ```
   VITE_API_URL=https://codestalk-api.onrender.com
   ```

2. [ ] Commit and push changes:
   ```bash
   git add .
   git commit -m "Configure for production deployment"
   git push
   ```

3. [ ] Go to https://netlify.com
4. [ ] Sign up with GitHub
5. [ ] Click "Add new site" → "Import an existing project"
6. [ ] Choose GitHub → Select `kushagragarg15/codestalk`
7. [ ] Configure:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`

8. [ ] Add Environment Variable:
   ```
   VITE_API_URL=https://codestalk-api.onrender.com
   ```

9. [ ] Click "Deploy site"
10. [ ] Wait 2-3 minutes
11. [ ] Copy your site URL: `https://random-name.netlify.app`

---

## Step 4: Update Backend CORS (2 minutes)

1. [ ] Go back to Render dashboard
2. [ ] Click on your `codestalk-api` service
3. [ ] Go to "Environment" tab
4. [ ] Update `CLIENT_ORIGIN`:
   ```
   CLIENT_ORIGIN=https://your-netlify-app.netlify.app,http://localhost:5173
   ```
5. [ ] Save changes
6. [ ] Service will auto-redeploy

---

## Step 5: Test Everything (5 minutes)

1. [ ] Visit your Netlify URL
2. [ ] Create a test account
3. [ ] Add your LeetCode username
4. [ ] Add a friend (try: `tourist`)
5. [ ] Check Dashboard
6. [ ] Check Daily Challenge page
7. [ ] Check Competition page
8. [ ] Check all features work

---

## Step 6: Update GitHub README (2 minutes)

Add live demo link to your README:

```markdown
## 🌐 Live Demo

**Try it now**: https://your-app.netlify.app

**API**: https://codestalk-api.onrender.com
```

Commit and push:
```bash
git add README.md
git commit -m "Add live demo link"
git push
```

---

## ✅ Deployment Complete!

Your app is now live at:
- **Frontend**: https://your-app.netlify.app
- **Backend**: https://codestalk-api.onrender.com
- **Database**: MongoDB Atlas

---

## 🎯 Optional: Custom Domain

### Netlify Custom Domain

1. [ ] Go to Netlify dashboard
2. [ ] Click "Domain settings"
3. [ ] Click "Add custom domain"
4. [ ] Enter your domain (e.g., `codestalk.yourdomain.com`)
5. [ ] Follow DNS configuration instructions
6. [ ] Wait for DNS propagation (up to 24 hours)
7. [ ] SSL certificate auto-generated

### Update Backend CORS

After setting custom domain:
```
CLIENT_ORIGIN=https://codestalk.yourdomain.com,http://localhost:5173
```

---

## 📊 Monitoring

### Netlify
- Dashboard: https://app.netlify.com
- View deploy logs
- Check analytics
- Monitor bandwidth

### Render
- Dashboard: https://dashboard.render.com
- View logs
- Monitor performance
- Check uptime

### MongoDB Atlas
- Dashboard: https://cloud.mongodb.com
- Monitor database usage
- View metrics
- Check storage

---

## 🔧 Common Issues

### Issue: "Network Error" on frontend

**Solution**: 
1. Check `VITE_API_URL` in Netlify environment variables
2. Verify backend is running on Render
3. Check browser console for CORS errors

### Issue: CORS Error

**Solution**:
1. Update `CLIENT_ORIGIN` in Render to include your Netlify URL
2. Restart backend service
3. Clear browser cache

### Issue: MongoDB Connection Failed

**Solution**:
1. Check IP whitelist in MongoDB Atlas (should be 0.0.0.0/0)
2. Verify connection string is correct
3. Check database user has correct permissions

### Issue: Backend Sleeping (Render Free Tier)

**Note**: Render free tier spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Upgrade to paid tier ($7/month) for always-on service

---

## 💡 Pro Tips

1. **Generate Strong JWT Secret**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Monitor Logs**:
   - Render: Click "Logs" tab
   - Netlify: Click "Deploys" → Select deploy → "Deploy log"

3. **Auto-Deploy**:
   - Both Netlify and Render auto-deploy on git push
   - Disable in settings if you want manual deploys

4. **Environment Variables**:
   - Never commit .env files
   - Use platform-specific environment variable settings
   - Restart services after changing env vars

---

## 🎉 Success Criteria

- [ ] Frontend loads without errors
- [ ] Can create account
- [ ] Can login (stays logged in)
- [ ] Can add friends
- [ ] Dashboard shows data
- [ ] Daily Challenge works
- [ ] Competition page loads
- [ ] All API calls succeed
- [ ] No CORS errors
- [ ] MongoDB connection stable

---

## 📝 Next Steps

1. [ ] Share your live demo
2. [ ] Add screenshots to README
3. [ ] Monitor usage and performance
4. [ ] Consider upgrading to paid tiers if needed
5. [ ] Set up custom domain (optional)
6. [ ] Add monitoring/analytics
7. [ ] Set up error tracking (Sentry, etc.)

---

**Total Time**: ~30 minutes

**Cost**: $0 (using free tiers)

**Your app is live!** 🚀
