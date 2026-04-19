# CodeStalk - Quick Start Guide

## ✅ Setup Status

- ✅ Node.js v22.15.1 installed
- ✅ npm v10.9.2 installed
- ✅ MongoDB v8.0.11 installed and running
- ✅ Dependencies installed
- ✅ Environment configured
- ✅ Production build successful

## 🚀 Start Development Server

Run this command in your terminal:

```bash
npm run dev
```

This will start:
- **API Server** on http://localhost:4000
- **Web App** on http://localhost:5173

## 📝 What to Do Next

1. Open your browser to http://localhost:5173
2. Click "Create account" to register a new user
3. Add your LeetCode username in the Dashboard
4. Add friends by their LeetCode usernames
5. Explore the features:
   - Dashboard: Your stats and friend activity
   - Friends: Detailed view with heatmaps
   - Leaderboard: Rankings by different metrics
   - Compare: Head-to-head comparisons
   - Contests: Upcoming LeetCode contests

## 🧪 Test with Sample Users

Try adding these public LeetCode profiles:
- `tourist` (competitive programming legend)
- `uwi` (top-rated user)
- `jiangly` (contest champion)

## 🛠️ Useful Commands

```bash
# Development (both server + client)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Server only (development)
npm run dev -w server

# Client only (development)
npm run dev -w client
```

## 📊 API Endpoints

Base URL: http://localhost:4000

- `GET /health` - Health check
- `POST /auth/register` - Create account
- `POST /auth/login` - Sign in
- `GET /auth/me` - Get current user
- `GET /friends` - List friends
- `POST /friends` - Add friend
- `GET /leetcode/:username` - Get LeetCode data
- `GET /leaderboard?metric=weekly` - Get rankings
- `GET /contests` - Upcoming contests
- `GET /compare?a=user1&b=user2` - Compare users

## 🔧 Configuration

Server config is in `server/.env`:
- Using **alfa-leetcode-api** (REST) as data provider
- MongoDB at `mongodb://127.0.0.1:27017/codestalk`
- Cache TTL: 300 seconds
- Rate limit: 60 requests per minute

## 💡 Tips

- The app uses LeetCode's unofficial API - be respectful with rate limits
- Data is cached in MongoDB to reduce API calls
- Email reminders are disabled by default (no SMTP configured)
- JWT tokens expire after 7 days

## 🐛 Troubleshooting

If you encounter issues:

1. **MongoDB not running**: Start MongoDB service
2. **Port already in use**: Change PORT in `server/.env`
3. **API errors**: Check if alfa-leetcode-api is accessible
4. **Build errors**: Run `npm install` to ensure all dependencies are installed

---

**Ready to start!** Run `npm run dev` and open http://localhost:5173
