# CodeStalk 🎯

> **Track and compete with friends on LeetCode** - Daily challenges, live activity feed, and competitive rankings that actually motivate you to code.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## ✨ Features

### 🎯 Daily Challenge
- See today's LeetCode problem with completion tracking
- 🥇🥈🥉 Hall of Fame for first 3 solvers
- Live activity feed showing what friends are solving **RIGHT NOW**
- Public pending lists create healthy social pressure

### 🏆 Competition Arena
- **Badge Leaderboard** - Who has the most LeetCode badges?
- **Skill Comparison** - See who's the "Array Master" or "DP God"
- **Contest Rankings** - Average ratings, best ranks, and trends

### 👥 Social Features
- Real-time activity feed (FOMO generator!)
- Friend tracking with detailed profiles
- Multiple leaderboards (daily, weekly, monthly, rating, streak)
- Head-to-head comparisons with radar charts

### 🔐 Seamless Experience
- **Auto-login** - Stay logged in for 30 days
- Instant app load with cached data
- Background refresh for latest stats
- No repeated password entry

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/kushagragarg15/codestalk.git
cd codestalk

# Install dependencies
npm install

# Set up environment
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and JWT secret

# Start development servers
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

### First Time Setup

1. Open http://localhost:5173
2. Create an account (one time only!)
3. Add your LeetCode username in Dashboard
4. Add friends by their LeetCode usernames
5. Check `/challenges` for today's problem
6. Visit `/competition` to see rankings

## 🏗️ Architecture

### Tech Stack

**Backend**
- Express.js + TypeScript
- MongoDB with Mongoose
- JWT authentication
- Rate limiting & caching
- alfa-leetcode-api integration

**Frontend**
- React 18 + TypeScript
- Vite for blazing fast builds
- Tailwind CSS for styling
- Recharts for visualizations
- React Router for navigation

### Project Structure

```
codestalk/
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
│   │   └── middleware/ # Auth, etc.
│   └── dist/           # Build output
└── docs/               # Documentation
```

## 📚 API Documentation

See [docs/API.md](docs/API.md) for complete API documentation.

### Key Endpoints

```bash
# Authentication
POST /auth/register
POST /auth/login
GET  /auth/me

# Friends
GET    /friends
POST   /friends
DELETE /friends/:username

# Competition
GET /competition/badges
GET /competition/skills
GET /competition/contest-performance
GET /competition/recent-activity

# Challenges
GET /challenges/daily
GET /challenges/weekly
GET /challenges/trending

# Leaderboard
GET /leaderboard?metric=weekly
```

## 🎮 Usage

### Daily Routine
1. Check `/challenges` every morning
2. See who solved the daily problem
3. Race to be in top 3
4. Watch live activity feed for motivation

### Competition Tracking
1. Visit `/competition` to see rankings
2. Check badges, skills, and contests tabs
3. Find areas where you can dominate
4. Track your progress over time

### Test with Sample Users
Try adding these public LeetCode profiles:
- `tourist` - Legendary competitive programmer
- `uwi` - Top-rated user
- `jiangly` - Contest champion
- `Errichto` - Popular streamer

## 🔧 Configuration

### Environment Variables

**Server** (`server/.env`):
```bash
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/codestalk
JWT_SECRET=your-secret-key-min-16-chars
JWT_EXPIRES_IN=30d
LEETCODE_PROVIDER=alfa
ALFA_LEETCODE_API_URL=https://alfa-leetcode-api.onrender.com
```

### Features

- **Auto-login**: 30-day sessions with cached user data
- **Smart caching**: MongoDB-backed with configurable TTL
- **Rate limiting**: Protects against API abuse
- **Email reminders**: Optional daily notifications (configure SMTP)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Legal Notice

This project uses LeetCode's **unofficial** GraphQL API via [alfa-leetcode-api](https://github.com/alfaarghya/alfa-leetcode-api). Please:
- Cache aggressively to minimize API calls
- Respect rate limits
- Follow LeetCode's terms of service
- Use responsibly

## 🙏 Acknowledgments

- [alfa-leetcode-api](https://github.com/alfaarghya/alfa-leetcode-api) - LeetCode API wrapper
- [LeetCode](https://leetcode.com/) - For the amazing platform
- All contributors and users

---

**Built with ❤️ for competitive programmers who need that extra push to stay consistent.**

*Happy Coding!* 🚀
