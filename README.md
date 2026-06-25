# Burnout Management Application

A modern full-stack web application designed to help students monitor, assess, and manage academic burnout through continuous assessments, AI-powered journal analysis, and personalized recommendations.

## Features

- **Burnout Assessment**: Take initial and daily wellness assessments to track mental health
- **Dynamic Streak Calculation**: Automatic streak calculation using all assessment types (initial, daily, weekly, standard)
- **Dashboard**: Overview of burnout metrics, risk levels, sleep patterns, and screen time
- **History & Trends**: Visualize assessment history and burnout trends over time
- **AI Journal**: Sentiment-aware journaling with AI-powered wellness insights
- **Personalized Recommendations**: Get AI-generated interventions based on your burnout profile
- **Profile Management**: Manage personal information
- **Notifications**: Stay updated with assessment reminders and risk alerts
- **Admin Dashboard**: Administrative interface with 3 new reminder buttons for targeted student outreach
  - Remind Just Logged In 🚀: Students with 0 assessments
  - Remind 1 Assessment Users ✅: Students with exactly 1 assessment
  - Remind Streak Maintainers 🔥: Students with 2+ assessments
- **Browser Extension**: Chrome extension for quick streak and burnout score access

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS 3, Zustand 5, React Router 7, Recharts |
| **Backend** | Node.js, Express 4, TypeScript, Mongoose 8 (MongoDB), Zod 4, JWT |
| **Extension** | Chrome Extension (Manifest V3) |
| **Database** | MongoDB |

## Project Structure

```
frontend/           # React SPA
├── src/
│   ├── components/ # Reusable UI components
│   ├── pages/      # Page components (Dashboard, Assessment, etc.)
│   ├── store/      # Zustand state management
│   └── lib/        # Utilities and API client

backend/            # Express API server
├── src/
│   ├── controllers/# Route handlers
│   ├── services/   # Business logic
│   ├── models/     # Mongoose schemas
│   ├── routes/     # API route definitions
│   └── jobs/       # Cron jobs (streak checks, reminders)

extension/          # Chrome browser extension
└── icons/          # Extension icons
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance
- npm or yarn

### Installation

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Environment Setup

Copy `.env.example` to `.env` in the backend directory and configure:

- `PORT` - Server port (default: 5001)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - Frontend URL for CORS

### Development

```bash
# Start frontend dev server
cd frontend
npm run dev

# Start backend dev server (in separate terminal)
cd backend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Build

```bash
cd frontend
npm run build
```

## API Documentation

See [API_DOCS.md](./API_DOCS.md) for complete API reference.

## License

ISC
