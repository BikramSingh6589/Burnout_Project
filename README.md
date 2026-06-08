# Burnout Management Application

A modern web application designed to help users monitor, assess, and manage burnout through assessments, journaling, and personalized recommendations.

## Features

- **Burnout Assessment**: Take comprehensive burnout assessments to track your mental health
- **Dashboard**: Overview of your burnout metrics and progress
- **History & Trends**: Visualize your assessment history and trends over time
- **Journal**: Keep track of your thoughts and experiences
- **Personalized Recommendations**: Get AI-powered recommendations
- **Profile Management**: Manage your personal profile
- **Notifications**: Stay updated with important notifications
- **Admin Dashboard**: Administrative interface for managing the application

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - State management
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Lucide React** - Icons

## Getting Started

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/          # Static assets
├── src/
│   ├── assets/      # Images and other assets
│   ├── components/
│   │   ├── skeletons/  # Loading skeletons
│   │   └── ui/        # UI components
│   ├── lib/         # Utility functions
│   ├── pages/       # Page components
│   │   ├── admin/     # Admin pages
│   │   └── auth/      # Authentication pages
│   ├── store/       # Zustand store
│   ├── App.tsx      # Main app component
│   └── main.tsx     # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## License

ISC
