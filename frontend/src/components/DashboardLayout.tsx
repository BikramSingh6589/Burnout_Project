import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LayoutDashboard, BarChart2, Heart, User, AlertTriangle } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isAuthenticated, otpVerified, user } = useStore();
  const location = useLocation();

  // Authentication Guards
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!otpVerified) {
    return <Navigate to="/auth/verify-otp" replace />;
  }

  // Admin routing check: If user is admin, they shouldn't access student dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const isDashboardRoute = ['/dashboard', '/dashboard/history', '/dashboard/recommendations'].some(route => location.pathname === route);
<<<<<<< HEAD
  const isLocked = isDashboardRoute && !user?.assessmentCompleted;
=======
  const isLocked = isDashboardRoute && user && !user.assessmentCompleted;
>>>>>>> testing

  const sidebarItems = [
    {
      name: 'Dashboard Overview',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'History & Trends',
      path: '/dashboard/history',
      icon: BarChart2,
    },
    {
      name: 'Recommendations',
      path: '/dashboard/recommendations',
      icon: Heart,
    },
    {
      name: 'Profile Settings',
      path: '/profile',
      icon: User,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Risk Alert Panel if High Risk */}
      {user?.assessmentCompleted && (
        <HighRiskBanner />
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-surface backdrop-blur-md rounded-2xl border border-border p-3 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible shadow-sm transition-colors duration-300">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl text-[13px] tracking-tight font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-text-secondary hover:bg-surface-elevated hover:text-primary dark:hover:bg-[rgba(124,92,252,0.18)] dark:hover:text-[#9B84FF]'
                  }`}
                >
                  <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-white' : 'text-text-muted dark:group-hover:text-[#9B84FF]'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Dashboard Content Panel */}
        <main className="flex-1 min-w-0">
          <div className="bg-transparent md:px-2 min-h-[500px] relative">
            {isLocked && (
              <div className="absolute inset-0 z-50 flex items-start justify-center pt-16 bg-background/60 backdrop-blur-[4px] rounded-2xl">
                <div className="bg-surface p-8 rounded-2xl shadow-level2 border border-border text-center max-w-md space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary">Dashboard Locked</h2>
                  <p className="text-text-secondary leading-relaxed">
                    Please complete your initial wellness assessment to unlock your personalized dashboard and insights.
                  </p>
                  <Link
                    to="/assessment"
                    className="w-full bg-primary text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5 hover:shadow-card active:translate-y-0 mt-4"
                  >
                    <span>Take Initial Assessment</span>
                  </Link>
                </div>
              </div>
            )}
            <div className={`transition-all duration-300 ${isLocked ? 'opacity-30 pointer-events-none select-none' : ''}`}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// High Risk Alert Banner component
const HighRiskBanner: React.FC = () => {
  const { trackerHistory } = useStore();
  const latestTracker = trackerHistory.length > 0 ? trackerHistory[trackerHistory.length - 1] : null;
  
  if (!latestTracker || latestTracker.burnoutScore < 70) return null;

  return (
    <div className="mb-6 bg-error/10 border border-error/20 rounded-xl p-4 flex items-start space-x-3 text-error animate-pulse">
      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
      <div>
        <h4 className="font-bold text-sm">Critical Alert: High Burnout Risk Detected</h4>
        <p className="text-xs text-error/95 mt-0.5 leading-relaxed">
          Your current burnout index is {latestTracker.burnoutScore}/100. This indicates extreme fatigue and stress. Please review your personalized recommendations and consider consulting your academic counselor.
        </p>
      </div>
    </div>
  );
};
