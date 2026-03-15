# FestConnect 🎇

> A full-stack Social Graph + Networking App for college tech fests. Connect with peers, join events, build teams, and chat — all in real-time.

## ✨ Features

- 🔍 **Smart Match Algorithm** – Match with peers based on skills, interests, department & shared events
- 🤝 **Social Graph** – Send/accept connection requests, build your network
- 🎪 **Events** – Browse and join fest events with countdown timers and capacity tracking  
- 👥 **Team Finder** – Post teams, join with role selection, get AI-powered team suggestions
- 💬 **Real-Time Chat** – Socket.io powered messaging with typing indicators and online presence
- 📱 **QR Connect** – Generate QR codes for instant profile sharing at the fest
- 🏆 **Leaderboard** – Recharts bar chart, ranked scores with networking breakdown
- 🌙 **Dark Glassmorphism UI** – Stunning dark theme with gradient accents

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Routing | React Router DOM v6 |
| State | Context API |
| HTTP | Axios |
| Real-Time | Socket.io |
| QR | qrcode.react |
| Charts | Recharts |
| Backend | Node.js + Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Cache | Redis |
| Auth | JWT + bcrypt |

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- Docker + Docker Compose
- Git

### 1. Clone & Install

```bash
git clone <repo-url> festconnect
cd festconnect

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
cd ..
```

### 2. Start Infrastructure (Docker)

```bash
# Start PostgreSQL + Redis only
docker-compose up postgres redis -d
```

### 3. Database Setup

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed with demo data (10 users, 8 events, 3 teams)
node prisma/seed.js
```

### 4. Start Dev Servers

**Terminal 1 – Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

### 5. Open the App

Navigate to **http://localhost:5173** and login with:

| Name | Email | Password |
|------|-------|----------|
| Arjun Sharma | arjun@fest.com | pass123 |
| Priya Patel | priya@fest.com | pass123 |
| Rahul Mehta | rahul@fest.com | pass123 |
| Anjali Singh | anjali@fest.com | pass123 |
| Kiran Reddy | kiran@fest.com | pass123 |
| + 5 more... | *@fest.com | pass123 |

---

## 🐳 Full Docker Setup

```bash
# Build and start all services
docker-compose up --build

# App → http://localhost:5173
# API → http://localhost:5000
```

---

## 📱 QR Connect Feature

1. Log in to any account
2. Navigate to **Profile** page
3. Click the **📱 QR** button
4. A QR code appears encoding your `{ id, name, skills, interests }`
5. Another user can scan this to navigate directly to your profile and connect!

---

## 🏆 Networking Score System

| Action | Points |
|--------|--------|
| Accept connection | +10 pts |
| Join an event | +15 pts |
| Join a team | +20 pts |
| Post a team | +25 pts |
| Send message | +2 pts |

---

## 📁 Project Structure

```
festconnect/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database models
│   │   └── seed.js            # Demo data
│   └── src/
│       ├── app.js             # Express + Socket.io entry
│       ├── controllers/       # Business logic
│       ├── routes/            # API endpoints
│       ├── middleware/        # Auth + Error handling
│       ├── socket/            # Real-time event handlers
│       └── utils/             # Match algorithm + Prisma client
├── frontend/
│   └── src/
│       ├── api/               # Axios instance
│       ├── components/        # Reusable UI components
│       ├── context/           # Auth + Socket contexts
│       ├── hooks/             # Custom hooks
│       └── pages/             # Page components
└── docker-compose.yml
```

---

## 🔌 API Endpoints

```
POST /api/auth/register      Register new user
POST /api/auth/login         Login → JWT token
GET  /api/auth/me            Current user

GET  /api/users              All users with match scores
GET  /api/users/:id          User profile
POST /api/users/connect/:id  Send connection request
PUT  /api/users/connect/:id/accept   Accept connection
GET  /api/users/leaderboard  Top users

GET  /api/events             All events (filter by category)
POST /api/events/:id/join    Join event
DELETE /api/events/:id/leave Leave event

GET  /api/teams              All teams
POST /api/teams              Create team
GET  /api/teams/suggestions  Teams matching your skills
POST /api/teams/:id/join     Join team with role

GET  /api/chat/conversations  All conversations
GET  /api/chat/messages/:id  Chat with user
POST /api/chat/messages/:id  Send message

GET  /api/match/suggestions  AI match suggestions
GET  /api/match/score/:id    Match score with user
```

---

Made with ❤️ for college fest networking
