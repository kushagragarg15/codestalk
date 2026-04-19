# 🎉 CodeStalk Setup Complete!

## ✅ System Check Passed

All prerequisites are installed and configured:

- ✅ **Node.js** v22.15.1
- ✅ **npm** v10.9.2  
- ✅ **MongoDB** v8.0.11 (Running)
- ✅ **Dependencies** installed
- ✅ **Environment** configured
- ✅ **Build** successful
- ✅ **Ports** 4000 & 5173 available

## 🚀 How to Run

### Option 1: Use the Batch Script (Easiest)
Double-click `start-dev.bat` or run:
```bash
start-dev.bat
```

### Option 2: Use npm Command
```bash
npm run dev
```

Both will start:
- **Backend API**: http://localhost:4000
- **Frontend App**: http://localhost:5173

## 🌐 Access the Application

1. Open your browser
2. Navigate to: **http://localhost:5173**
3. You'll see the CodeStalk login page

## 👤 Getting Started

### Step 1: Create an Account
- Click "Create account" tab
- Enter your email and password (min 8 characters)
- Optionally add a display name
- Click "Create account"

### Step 2: Set Your LeetCode Username (Optional)
- After login, you'll be on the Dashboard
- Enter your LeetCode username in the form
- Click "Save" to see your own stats

### Step 3: Add Friends
- Go to "Friends" page from the sidebar
- Enter a LeetCode username (e.g., `tourist`, `uwi`, `jiangly`)
- Click "Add"
- View their activity, streaks, and heatmaps

### Step 4: Explore Features

**Dashboard**
- Your personal LeetCode snapshot
- Friend activity pulse (who's active today)
- Weekly insights and volume leaders

**Friends**
- Detailed friend profiles
- Activity heatmaps (GitHub-style)
- Difficulty breakdown (Easy/Medium/Hard)
- Badges and friendly nudges

**Leaderboard**
- Rank friends by different metrics:
  - Daily/Weekly/Monthly submissions
  - Contest rating
  - Current streak
- Visual bar chart of top performers

**Compare**
- Head-to-head comparison of any two users
- Radar chart visualization
- Side-by-side stats

**Contests**
- Upcoming LeetCode contests
- Live countdown timers
- Local timezone conversion

## 🧪 Test with Sample Users

Try adding these public LeetCode profiles to see real data:

- **tourist** - Legendary competitive programmer
- **uwi** - Top-rated user with high activity
- **jiangly** - Contest champion
- **Errichto** - Popular competitive programmer
- **tmwilliamlin168** - Active problem solver

## 📊 API Documentation

Full API docs available at: `docs/API.md`

Quick test the API:
```bash
# Health check
curl http://localhost:4000/health

# Get LeetCode user data (after server is running)
curl http://localhost:4000/leetcode/tourist
```

## 🔧 Configuration

### Server Configuration (`server/.env`)

Current settings:
- **Port**: 4000
- **MongoDB**: mongodb://127.0.0.1:27017/codestalk
- **JWT Secret**: Configured (change for production!)
- **LeetCode Provider**: alfa-leetcode-api (REST)
- **Cache TTL**: 300 seconds (5 minutes)
- **Rate Limit**: 60 requests/minute

### Client Configuration

- **Dev Server**: http://localhost:5173
- **API Proxy**: /api/* → http://localhost:4000
- **Theme**: Dark mode with custom colors
- **Fonts**: DM Sans, Syne

## 🎨 Features Overview

### Authentication
- JWT-based auth with 7-day expiration
- Bcrypt password hashing (12 rounds)
- Protected routes with middleware

### Data Fetching
- Dual provider support (alfa REST or LeetCode GraphQL)
- Automatic retry with exponential backoff
- MongoDB-backed caching with TTL
- Rate limiting to prevent abuse

### Gamification
- **Badges**: Streak warrior, Grinder, Weekly blitz, Contest elite
- **Nudges**: Friendly motivational messages
- **Heatmaps**: Visual activity tracking

### Visualizations
- Pie charts (difficulty distribution)
- Bar charts (leaderboard rankings)
- Radar charts (head-to-head comparison)
- Heatmaps (activity calendar)

## 🛑 How to Stop

Press `Ctrl + C` in the terminal where the dev server is running.

## 📝 Development Tips

### Hot Reload
Both client and server support hot reload:
- **Client**: Vite HMR (instant updates)
- **Server**: tsx watch mode (auto-restart)

### Database Access
MongoDB is running locally. Connect with:
```bash
mongosh mongodb://127.0.0.1:27017/codestalk
```

View collections:
```javascript
show collections
db.users.find()
db.friends.find()
db.cachedleetcodedatas.find()
```

### Debugging
- Server logs appear in the terminal
- Client errors show in browser console
- MongoDB logs: Check Windows Event Viewer or MongoDB log files

## 🐛 Troubleshooting

### Port Already in Use
If you see "EADDRINUSE" error:
```bash
# Find process on port 4000
netstat -ano | findstr :4000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
net start MongoDB

# Or start manually
mongod --dbpath C:\data\db
```

### Build Errors
```bash
# Clean install
rm -rf node_modules
rm -rf client/node_modules
rm -rf server/node_modules
npm install
```

### API Rate Limiting
If you hit rate limits:
- Wait 60 seconds
- Increase cache TTL in `server/.env`
- Use cached data (automatic)

## 📚 Project Structure

```
cocoders/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/      # Route components
│   │   ├── components/ # Reusable UI
│   │   ├── auth/       # Auth context
│   │   └── api.ts      # Axios instance
│   └── dist/           # Build output
├── server/             # Express backend
│   ├── src/
│   │   ├── routes/     # API endpoints
│   │   ├── services/   # Business logic
│   │   ├── models/     # Mongoose schemas
│   │   ├── middleware/ # Auth, etc.
│   │   └── config/     # Environment
│   └── dist/           # Build output
├── docs/               # Documentation
└── node_modules/       # Dependencies
```

## 🚀 Next Steps

1. **Run the app**: `npm run dev`
2. **Create an account**: http://localhost:5173
3. **Add friends**: Track their LeetCode activity
4. **Explore features**: Dashboard, Leaderboard, Compare
5. **Customize**: Edit theme in `client/tailwind.config.js`

## 💡 Pro Tips

- Add yourself as a friend to compare with others
- Check the Dashboard daily for friend activity
- Use Compare feature to motivate yourself
- Set up email reminders (configure SMTP in .env)
- Export data via MongoDB for analysis

## 🎯 What Makes This Special

- **Real-time data** from LeetCode (cached intelligently)
- **Friendly competition** without being toxic
- **Beautiful UI** with dark theme and smooth animations
- **Smart caching** to respect API limits
- **Gamification** that motivates without pressure
- **Privacy-focused** - only tracks public LeetCode data

---

## 🎊 You're All Set!

Run `npm run dev` and start tracking your coding journey with friends!

**Happy Coding! 🚀**
