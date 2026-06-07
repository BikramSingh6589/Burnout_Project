import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { AIWidget } from './components/AIWidget';
import { Home } from './pages/Home';
import { Register } from './pages/auth/Register';
import { Login } from './pages/auth/Login';
import { VerifyOtp } from './pages/auth/VerifyOtp';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { AdminLogin } from './pages/admin/AdminLogin';
import { useStore } from './store/useStore';
import { LazyRoute } from './components/skeletons/LazyRoute';
import {
  AssessmentSkeleton,
  DashboardSkeleton,
  HistoryTrendsSkeleton,
  RecommendationSkeleton,
  ProfileSkeleton,
  JournalSkeleton,
  NotificationSkeleton,
  AdminDashboardSkeleton,
} from './components/skeletons';

const Assessment = lazy(() =>
  import('./pages/Assessment').then((m) => ({ default: m.Assessment }))
);
const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((m) => ({ default: m.Dashboard }))
);
const HistoryTrends = lazy(() =>
  import('./pages/HistoryTrends').then((m) => ({ default: m.HistoryTrends }))
);
const Recommendations = lazy(() =>
  import('./pages/Recommendations').then((m) => ({ default: m.Recommendations }))
);
const Profile = lazy(() =>
  import('./pages/Profile').then((m) => ({ default: m.Profile }))
);
const Journal = lazy(() =>
  import('./pages/Journal').then((m) => ({ default: m.Journal }))
);
const Notifications = lazy(() =>
  import('./pages/Notifications').then((m) => ({ default: m.Notifications }))
);
const AdminDashboard = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

// Root redirect: unauthenticated → Register, authenticated → Home
const RootRedirect: React.FC = () => {
  const { isAuthenticated } = useStore();
  if (!isAuthenticated) return <Navigate to="/auth/register" replace />;
  return <Navigate to="/home" replace />;
};

// Route Protection Wrapper for students
const StudentRoute: React.FC<{ children: React.ReactNode; requireAssessment?: boolean }> = ({ children }) => {
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
                <LazyRoute fallback={<AssessmentSkeleton />}>
                  <Assessment />
                </LazyRoute>
              </StudentRoute>
            }
          />
          <Route
            path="/assessment/weekly"
            element={
              <StudentRoute>
                <LazyRoute fallback={<AssessmentSkeleton />}>
                  <Assessment />
                </LazyRoute>
              </StudentRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <StudentRoute requireAssessment>
                <LazyRoute fallback={<DashboardSkeleton />}>
                  <Dashboard />
                </LazyRoute>
              </StudentRoute>
            }
          />
          <Route
            path="/dashboard/history"
            element={
              <StudentRoute requireAssessment>
                <LazyRoute fallback={<HistoryTrendsSkeleton />}>
                  <HistoryTrends />
                </LazyRoute>
              </StudentRoute>
            }
          />
          <Route
            path="/dashboard/recommendations"
            element={
              <StudentRoute requireAssessment>
                <LazyRoute fallback={<RecommendationSkeleton />}>
                  <Recommendations />
                </LazyRoute>
              </StudentRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <StudentRoute requireAssessment>
                <LazyRoute fallback={<ProfileSkeleton />}>
                  <Profile />
                </LazyRoute>
              </StudentRoute>
            }
          />
          <Route
            path="/journal"
            element={
              <StudentRoute requireAssessment>
                <LazyRoute fallback={<JournalSkeleton />}>
                  <Journal />
                </LazyRoute>
              </StudentRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <StudentRoute requireAssessment>
                <LazyRoute fallback={<NotificationSkeleton />}>
                  <Notifications />
                </LazyRoute>
              </StudentRoute>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <LazyRoute fallback={<AdminDashboardSkeleton />}>
                <AdminDashboard />
              </LazyRoute>
            }
          />

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
