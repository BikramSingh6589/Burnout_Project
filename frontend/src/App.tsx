import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
const AIWidget = lazy(() =>
  import('./components/AIWidget').then((m) => ({ default: m.AIWidget }))
);
import { useStore } from './store/useStore';
import { LazyRoute } from './components/skeletons/LazyRoute';
import { PageTransition } from './components/PageTransition';
import {
  AssessmentSkeleton,
  DashboardSkeleton,
  HistoryTrendsSkeleton,
  RecommendationSkeleton,
  ProfileSkeleton,
  JournalSkeleton,
  NotificationSkeleton,
  AdminDashboardSkeleton,
  PageSkeleton,
} from './components/skeletons';

const Home = lazy(() =>
  import('./pages/Home').then((m) => ({ default: m.Home }))
);
const Register = lazy(() =>
  import('./pages/auth/Register').then((m) => ({ default: m.Register }))
);
const Login = lazy(() =>
  import('./pages/auth/Login').then((m) => ({ default: m.Login }))
);
const VerifyOtp = lazy(() =>
  import('./pages/auth/VerifyOtp').then((m) => ({ default: m.VerifyOtp }))
);
const ForgotPassword = lazy(() =>
  import('./pages/auth/ForgotPassword').then((m) => ({ default: m.ForgotPassword }))
);
const ResetPassword = lazy(() =>
  import('./pages/auth/ResetPassword').then((m) => ({ default: m.ResetPassword }))
);
const AdminLogin = lazy(() =>
  import('./pages/admin/AdminLogin').then((m) => ({ default: m.AdminLogin }))
);

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
const JournalAI = lazy(() =>
  import('./pages/JournalAI').then((m) => ({ default: m.JournalAI }))
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

// OTP page: available after registration while email verification is pending
const OtpRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, otpVerified, pendingVerificationEmail } = useStore();

  if (!pendingVerificationEmail && !isAuthenticated) {
    return <Navigate to="/auth/register" replace />;
  }

  if (otpVerified) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

// Route Protection Wrapper for students (post-OTP routes)
const StudentRoute: React.FC<{ children: React.ReactNode; requireAssessment?: boolean }> = ({ children, requireAssessment = false }) => {
  const { isAuthenticated, otpVerified, user } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth/register" replace />;
  }

  if (!otpVerified) {
    return <Navigate to="/auth/verify-otp" replace />;
  }

  if (requireAssessment && user && !user.assessmentCompleted) {
    return <Navigate to="/assessment?from=dashboard" replace />;
  }

  return <>{children}</>;
};

const ExtensionPromo: React.FC = () => {
  const { showExtensionPromo, closeExtensionPromo } = useStore();
  const [showInstructions, setShowInstructions] = React.useState(false);
  const [showPinInstructions, setShowPinInstructions] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);
  
  const copyToken = async () => {
    const token = localStorage.getItem('burnout_auth_token') || '';
    await navigator.clipboard.writeText(token);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };
  
  if (!showExtensionPromo) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-[60] flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </div>
      )}
      <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-8 border border-slate-700 shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">⚡</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Burnout Guard Extension</h2>
              <p className="text-slate-400 mt-1">Track your streak & burnout right in your browser!</p>
            </div>
          </div>
          <button 
            onClick={closeExtensionPromo} 
            className="text-slate-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        {!showInstructions ? (
          <>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-slate-300">
                <span className="text-green-400">✅</span>
                See your current streak at a glance
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <span className="text-green-400">✅</span>
                Check your burnout score instantly
              </li>
              <li className="flex items-center gap-3 text-slate-300">
                <span className="text-green-400">✅</span>
                Daily motivational quote to keep going
              </li>
            </ul>
            
            <div className="flex items-center gap-3">
              <button
                onClick={closeExtensionPromo}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
              >
                Later
              </button>
              <button
                onClick={() => setShowInstructions(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all"
              >
                Install Now
              </button>
            </div>
          </>
        ) : (
          <>
            {!showPinInstructions ? (
              <>
                <h3 className="text-xl font-bold text-white mb-4">Install the Extension</h3>
                
                <div className="mb-4">
                  <a
                    href="/burnout-guard-extension.zip"
                    download="burnout-guard-extension.zip"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all text-center block"
                  >
                    Download Extension ZIP
                  </a>
                </div>
                
                <div className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="text-slate-300 text-sm mb-3">Need to set up the extension manually?</p>
                  <button
                    onClick={copyToken}
                    className="w-full py-2 px-4 rounded-lg bg-slate-700 text-slate-200 font-semibold hover:bg-slate-600 transition-all text-sm"
                  >
                    📋 Copy Your Auth Token
                  </button>
                </div>
                
                <ol className="space-y-3 text-slate-300 mb-6">
              <li className="flex gap-3">
                <span className="text-indigo-400 font-bold">1.</span>
                <div>
                  <p className="font-semibold mb-1">Extract the ZIP file</p>
                  <p className="text-sm">Unzip the downloaded file to a folder on your computer</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-400 font-bold">2.</span>
                <div>
                  <p className="font-semibold mb-1">Open Extensions</p>
                  <p className="text-sm">Type <code className="bg-slate-800 px-2 py-1 rounded">browser://extensions</code> in your address bar and press Enter</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-400 font-bold">3.</span>
                <div>
                  <p className="font-semibold mb-1">Enable Developer Mode</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-400 font-bold">4.</span>
                <div>
                  <p className="font-semibold mb-1">Load the Extension</p>
                  <p className="text-sm">Click "Load unpacked" and select the extracted folder</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-400 font-bold">5.</span>
                <div>
                  <p className="font-semibold mb-1">Done!</p>
                  <p className="text-sm">You'll see Burnout Guard in your toolbar</p>
                </div>
              </li>
            </ol>
                
                <div className="flex gap-3">
                  <button
                    onClick={closeExtensionPromo}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-all"
                  >
                    Got It!
                  </button>
                  <button
                    onClick={() => setShowPinInstructions(true)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all"
                  >
                    Next: Pin It!
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setShowPinInstructions(false)}
                    className="text-slate-400 hover:text-white transition-all"
                  >
                    ← Back
                  </button>
                  <h3 className="text-xl font-bold text-white">Pin the Extension!</h3>
                </div>
                
                <div className="mb-6">
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-4">
                    <p className="text-slate-300 text-sm mb-3">Follow these steps to keep Burnout Guard visible:</p>
                    <ol className="space-y-3 text-slate-300">
                      <li className="flex gap-3">
                        <span className="text-indigo-400 font-bold">1.</span>
                        <div>
                          <p className="font-semibold mb-1">Locate the Puzzle Icon</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-indigo-400 font-bold">2.</span>
                        <div>
                          <p className="font-semibold mb-1">Find Burnout Guard</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-indigo-400 font-bold">3.</span>
                        <div>
                          <p className="font-semibold mb-1">Pin It!</p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
                
                <button
                  onClick={closeExtensionPromo}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-all"
                >
                  All Done!
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Route wrapper to handle Navbar visibility (hide Navbar for admin dashboard pages)
const LayoutWrapper: React.FC = () => {
  const location = useLocation();
  const { fetchMe, isAuthenticated, checkExtensionInstalled, sendTokenToExtension } = useStore();
  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const isAuthRoute = ['/auth/login', '/auth/register', '/auth/verify-otp', '/auth/forgot-password', '/auth/reset-password'].includes(location.pathname);
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
  
  React.useEffect(() => {
    fetchMe();
  }, [fetchMe]);
  
  // Check extension status and send token when authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      checkExtensionInstalled();
      sendTokenToExtension();
    }
  }, [isAuthenticated, checkExtensionInstalled, sendTokenToExtension]);
  return (
    <div className="min-h-screen flex flex-col">
      <ExtensionPromo />
      {!hideNavbar && <header><Navbar /></header>}
      <main className="flex-1">
        <PageTransition>
          <Routes>
            {/* Root: smart redirect based on auth state */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public Routes */}
            <Route path="/home" element={<LazyRoute fallback={<PageSkeleton />}><Home /></LazyRoute>} />
            <Route path="/auth/login" element={<LazyRoute fallback={<PageSkeleton />}><Login /></LazyRoute>} />
            <Route path="/auth/register" element={<LazyRoute fallback={<PageSkeleton />}><Register /></LazyRoute>} />
            <Route path="/auth/forgot-password" element={<LazyRoute fallback={<PageSkeleton />}><ForgotPassword /></LazyRoute>} />
            <Route path="/auth/reset-password" element={<LazyRoute fallback={<PageSkeleton />}><ResetPassword /></LazyRoute>} />

            {/* Student Protected Routes */}
            <Route
              path="/auth/verify-otp"
              element={
                <OtpRoute>
                  <LazyRoute fallback={<PageSkeleton />}>
                    <VerifyOtp />
                  </LazyRoute>
                </OtpRoute>
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
              path="/assessment/daily"
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
              path="/complete-profile"
              element={
                <StudentRoute>
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
              path="/journal-ai"
              element={
                <StudentRoute requireAssessment>
                  <LazyRoute fallback={<JournalSkeleton />}>
                    <JournalAI />
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
            <Route path="/admin/login" element={<LazyRoute fallback={<PageSkeleton />}><AdminLogin /></LazyRoute>} />
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
        </PageTransition>
      </main>
      {!isAdminRoute && !isAuthRoute && (
        <Suspense fallback={null}>
          <AIWidget />
        </Suspense>
      )}
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
