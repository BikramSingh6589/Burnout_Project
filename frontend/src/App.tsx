import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AIWidget } from './components/AIWidget';
import { Home } from './pages/Home';
import { Register } from './pages/auth/Register';
import { Login } from './pages/auth/Login';
import { VerifyOtp } from './pages/auth/VerifyOtp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Assessment } from './pages/Assessment';
import { Dashboard } from './pages/Dashboard';
import { HistoryTrends } from './pages/HistoryTrends';
import { Recommendations } from './pages/Recommendations';
import { Profile } from './pages/Profile';
import { Journal } from './pages/Journal';
import { Notifications } from './pages/Notifications';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { useStore } from './store/useStore';

// Root redirect: unauthenticated → Register, authenticated → Home
const RootRedirect: React.FC = () => {
  const { isAuthenticated } = useStore();
  if (!isAuthenticated) return <Navigate to="/auth/register" replace />;
  return <Navigate to="/home" replace />;
};

// Route Protection Wrapper for students
const StudentRoute: React.FC<{ children: React.ReactNode; requireAssessment?: boolean }> = ({ children, requireAssessment = false }) => {
  const { isAuthenticated, otpVerified } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth/register" replace />;
  }

  if (!otpVerified) {
    return <Navigate to="/auth/verify-otp" replace />;
  }

  // We no longer redirect here for requireAssessment.
  // The Dashboard itself will handle the locked state.

  return <>{children}</>;
};

// Route wrapper to handle Navbar visibility (hide Navbar for admin dashboard pages)
const LayoutWrapper: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const isAuthRoute = ['/auth/login', '/auth/register', '/auth/verify-otp', '/auth/forgot-password'].includes(location.pathname);
  const hideNavbar = isAdminRoute || isAuthRoute;
  React.useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // Default to light — always remove dark class if not explicitly dark
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <div className="flex-1">
        <Routes>
          {/* Root: smart redirect based on auth state */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          {/* Student Protected Routes */}
          <Route
            path="/auth/verify-otp"
            element={
              <StudentRoute>
                <VerifyOtp />
              </StudentRoute>
            }
          />
          <Route
            path="/assessment"
            element={
              <StudentRoute>
                <Assessment />
              </StudentRoute>
            }
          />
          <Route
            path="/assessment/weekly"
            element={
              <StudentRoute>
                <Assessment />
              </StudentRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <StudentRoute requireAssessment>
                <Dashboard />
              </StudentRoute>
            }
          />
          <Route
            path="/dashboard/history"
            element={
              <StudentRoute requireAssessment>
                <HistoryTrends />
              </StudentRoute>
            }
          />
          <Route
            path="/dashboard/recommendations"
            element={
              <StudentRoute requireAssessment>
                <Recommendations />
              </StudentRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <StudentRoute requireAssessment>
                <Profile />
              </StudentRoute>
            }
          />
          <Route
            path="/journal"
            element={
              <StudentRoute requireAssessment>
                <Journal />
              </StudentRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <StudentRoute requireAssessment>
                <Notifications />
              </StudentRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/auth/register" replace />} />
        </Routes>
      </div>
      {!isAdminRoute && <AIWidget />}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <LayoutWrapper />
    </BrowserRouter>
  );
}

