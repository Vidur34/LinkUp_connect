# 🔗 LinkUp - Social Graph & Fest Networking Platform

**LinkUp** is a state-of-the-art social networking application designed specifically for college fests and professional summits. It leverages AI to bridge the gap between students, organizations, and developers through smart matching, automated profiles, and real-time interaction.

---

## ✨ Key Features

### 🤖 AI-Powered Experience
- **Resume Parser & Profile Builder**: Upload your PDF resume, and our AI (Gemini Pro) automatically extracts your tech stack, bio, and interests to build your professional profile in seconds.
- **Smart Icebreaker Generator**: No more awkward "Hi!". We generate 3 personalized conversation starters based on shared skills and common interests between you and your connections.
- **Marketplace Magic Lister**: Type a few raw keywords about an item you want to sell, and the AI generates a professional, catchy title and persuasive description.
- **Event Review Summarizer**: Get a consensus of what people are saying about an event with AI-generated feedback summaries.

### 👥 Social & Networking
- **Smart Discovery**: Discover people using a match-scoring algorithm that considers shared skills, departments, and event participation.
- **Real-time Chat**: Connect and message instantly with built-in Socket.io integration.
- **Networking Score**: Gamified networking! Earn points by connecting with others, join teams, and attend events.
- **QR Social**: Each profile comes with a unique QR code for instant, frictionless connecting in person.

### 🏛️ Ecosystem
- **Events Hub**: Join events, track schedules, and leave nested reviews with a premium UI.
- **Marketplace**: Buy/Sell/Rent tech kits, books, and accessories within your community.
- **Societies & Clubs**: Explore organization profiles, follow updates, and join technical or cultural societies.
- **Grow Hub**: A dedicated space for resources, learning materials, and community growth.

---

## 🛠️ Tech Stack

- **Frontend**: 
  - React.js with Vite
  - TailwindCSS (Premium Glassmorphic Design)
  - Socket.io-client
- **Backend**: 
  - Node.js & Express
  - Prisma ORM (High-performance Database Management)
- **Database**: 
  - PostgreSQL (via Supabase/Docker)
- **AI Integration**: 
  - Google Gemini Pro API
- **Deployment & Ops**: 
  - Docker & Docker Compose
  - Multer (File Handling)
  - PDF-Parse (Document Ingestion)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Docker (optional, for localized DB)
- Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vidur34/LinkUp_connect.git
   cd LinkUp_connect
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env file with DATABASE_URL and GEMINI_API_KEY
   npx prisma generate
   npx prisma db push # or npx prisma migrate dev
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access the App**
   Open `http://localhost:5173` in your browser.

---

## 🏗️ Architecture & Implementation Notes

- **Glassmorphic UI**: High-end visual hierarchy using `backdrop-filter`, premium gradients, and micro-animations for a "state-of-the-art" user experience.
- **Optimized Data Pipeline**: In-memory PDF processing ensures user resumes are parsed securely without persistent file storage overhead.
- **Persistent Social Graph**: Connection states are deeply integrated into the API to avoid UI flickering and ensure a consistent "connected" experience across all pages.

---

## 📜 License
Independent Project for academic and professional showcasing.

---

*Built with ❤️ for the Developer Community.*
