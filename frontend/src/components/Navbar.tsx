import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Bell, LogOut, Activity, ChevronDown, Menu, X, Settings, Moon, Sun, Flame, Trophy } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    notifications, 
    unreadNotificationCount, 
    logout, 
    markNotificationRead, 
    deleteAllNotifications,
    weeklyAssessmentHistory
  } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [streakPopupOpen, setStreakPopupOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const notifRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const streakRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notifDropdownOpen && notifRef.current && !notifRef.current.contains(target)) {
        setNotifDropdownOpen(false);
      }
      if (profileDropdownOpen && profileRef.current && !profileRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
      if (streakPopupOpen && streakRef.current && !streakRef.current.contains(target)) {
        setStreakPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifDropdownOpen, profileDropdownOpen, streakPopupOpen]);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const activeNotificationsCount = unreadNotificationCount;

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    if (!user?.assessmentCompleted) {
      navigate('/assessment?from=dashboard');
      return;
    }
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const { daysCompletedThisWeek, isDailyLimitReached } = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const isDoneToday = weeklyAssessmentHistory.some(
      (assessment) => (assessment as any).date === today || 
      new Date((assessment as any).completedAt || (assessment as any).createdAt).toISOString().split('T')[0] === today
    );

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const daysDone = weeklyAssessmentHistory.filter(
      (assessment) => {
        const assessmentDate = (assessment as any).date 
          ? new Date((assessment as any).date) 
          : new Date((assessment as any).completedAt || (assessment as any).createdAt);
        return assessmentDate >= startOfWeek;
      }
    ).length;

    return {
      isDailyLimitReached: isDoneToday,
      daysCompletedThisWeek: daysDone
    };
  }, [weeklyAssessmentHistory]);

  const isLinkActive = (path: string, hash?: string) => {
    if (hash) {
      return location.pathname === path && location.hash === hash;
    }
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-nav overflow-visible transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="flex justify-between h-16 overflow-visible">
          {/* Left Section - Logo */}
          <div className="flex items-center">
            <Link to="/home" className="flex items-center space-x-2 text-primary font-display font-extrabold text-2xl tracking-tight transition-transform duration-200 hover:scale-105">
              <Activity className="h-6 w-6 stroke-[3]" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">BurnoutGuard</span>
            </Link>
          </div>

          {/* Middle Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-8 font-medium">
            <Link
              to="/home"
              className={`transition-colors duration-200 hover:text-primary ${
                isLinkActive('/home') && !location.hash ? 'text-primary border-b-2 border-primary py-5' : 'text-text-secondary'
              }`}
            >
              Home
            </Link>
            <a
              href="/home#about"
              onClick={(e) => {
                if (location.pathname !== '/home') {
                  e.preventDefault();
                  navigate('/home');
                  setTimeout(() => {
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className={`transition-colors duration-200 hover:text-primary ${
                isLinkActive('/home', '#about') ? 'text-primary border-b-2 border-primary py-5' : 'text-text-secondary'
              }`}
            >
              About Us
            </a>
            <a
              href="/home#contact"
              onClick={(e) => {
                if (location.pathname !== '/home') {
                  e.preventDefault();
                  navigate('/home');
                  setTimeout(() => {
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="text-text-secondary transition-colors duration-200 hover:text-primary"
            >
              Contact Us
            </a>
            {isAuthenticated && user?.role === 'student' && (
              <Link
                to="/journal-ai"
                className={`bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent duration-200 ${
                  isLinkActive('/journal-ai') ? 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent border-b-2 border-primary py-5' : 'text-text-secondary hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:bg-clip-text hover:text-transparent'
                }`}
              >
                AI Journal
              </Link>
            )}
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'student' && (
              <div className="relative group hidden md:block" ref={streakRef}>
                <button
                  onClick={() => {
                    setStreakPopupOpen(!streakPopupOpen);
                    setNotifDropdownOpen(false);
                    setProfileDropdownOpen(false);
                  }}
                  className="relative w-10 h-10 rounded-full transition-all duration-500 flex items-center justify-center hover:scale-105 active:scale-95"
                  style={{
                    background: isDailyLimitReached
                      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)',
                    boxShadow: isDailyLimitReached
                      ? '0 2px 8px rgba(16, 185, 129, 0.3)'
                      : '0 2px 8px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  <svg className="absolute w-full h-full" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="none" />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="white"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray="201"
                      strokeDashoffset={isDailyLimitReached ? 0 : 201}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                      style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%'
                      }}
                    />
                  </svg>
                  <div className="relative z-10">
                    <Flame className={`w-5 h-5 ${isDailyLimitReached ? 'text-green-300' : 'text-red-300'}`} fill="currentColor" />
                  </div>
                </button>
                <div className={`pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 rounded-lg px-3 py-2 text-xs font-bold shadow-lg transition-opacity duration-200 opacity-0 group-hover:opacity-100 ${
                    isDailyLimitReached
                      ? 'border-2 border-green-500 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100 dark:border-green-400'
                      : 'border-2 border-red-500 bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100 dark:border-red-400'
                  }`}>
                  {daysCompletedThisWeek}/7
                </div>

                {/* Streak Popup */}
                {streakPopupOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-80 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-sm rounded-3xl border border-slate-200/60 dark:border-[#334155] shadow-2xl py-4 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    {/* Header */}
                    <div className="px-5 pb-4 border-b border-slate-100/50 dark:border-[#334155] bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)' }}>
                            <Flame className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-text-primary dark:text-[#F8FAFC]">Your Streak</h3>
                            <p className="text-xs text-text-muted dark:text-[#CBD5E1]">
                              {isDailyLimitReached ? "Today's assessment complete!" : "Don't break your streak!"}
                            </p>
                          </div>
                        </div>
                        <Trophy className="h-6 w-6 text-yellow-500" />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="bg-gradient-to-br from-primary/15 to-primary/5 dark:from-primary/25 dark:to-primary/10 rounded-2xl p-4 text-center">
                          <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Current Streak</p>
                          <p className="text-3xl font-extrabold text-primary">{user?.currentStreak || 0}</p>
                          <p className="text-xs text-text-muted">days</p>
                        </div>
                        <div className="bg-gradient-to-br from-secondary/15 to-secondary/5 dark:from-secondary/25 dark:to-secondary/10 rounded-2xl p-4 text-center">
                          <p className="text-xs font-bold text-secondary uppercase tracking-wide mb-1">Best Streak</p>
                          <p className="text-3xl font-extrabold text-secondary">{user?.longestStreak || 0}</p>
                          <p className="text-xs text-text-muted">days</p>
                        </div>
                      </div>

                      {/* Weekly Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-sm text-text-primary dark:text-[#F8FAFC]">This Week</span>
                          <span className="font-bold text-primary">{daysCompletedThisWeek}/7 days</span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 dark:bg-[#334155] rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{ 
                              width: `${(daysCompletedThisWeek / 7) * 100}%`,
                              background: 'linear-gradient(90deg, #4F46E5 0%, #8B5CF6 100%)'
                            }}
                          />
                        </div>
                      </div>

                      {/* Today Status */}
                      <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                        isDailyLimitReached 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                          : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDailyLimitReached ? 'bg-green-500' : 'bg-orange-500'
                        }`}>
                          {isDailyLimitReached ? (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-text-primary dark:text-[#F8FAFC]">
                            {isDailyLimitReached ? "Today's assessment done!" : "Assessment pending"}
                          </p>
                          <p className="text-xs text-text-muted dark:text-[#CBD5E1]">
                            {isDailyLimitReached ? "Keep up the good work!" : "Take your assessment to keep the streak alive"}
                          </p>
                        </div>
                      </div>

                      {/* Quick Action */}
                      {!isDailyLimitReached && (
                        <button
                          onClick={() => {
                            setStreakPopupOpen(false);
                            navigate('/assessment/daily');
                          }}
                          className="w-full mt-4 bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                        >
                          Take Assessment
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="bg-transparent hover:bg-secondary/5 text-secondary border border-secondary font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Admin panel
                  </Link>
                )}

                {/* Dark Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-text-primary hover:bg-surface-elevated hover:text-primary transition-all"
                  title="Toggle Dark Theme"
                >
                  {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setProfileDropdownOpen(false);
                    }}
                    className="p-2 rounded-full text-text-primary hover:bg-surface-elevated hover:text-primary relative transition-all"
                  >
                    <Bell className="h-5 w-5" />
                    {activeNotificationsCount > 0 && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-error rounded-full animate-pulse">
                        {activeNotificationsCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-96 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-sm rounded-3xl border border-slate-200/60 dark:border-[#334155] shadow-2xl py-2 z-[1000] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100/50 dark:border-[#334155] flex justify-between items-center bg-slate-50/60 dark:bg-[#111827]/70">
                        <span className="font-semibold text-sm tracking-tight dark:text-[#F8FAFC]">Notifications</span>
                        <div className="flex items-center gap-3">
                          {notifications.length > 0 && (
                            <button
                              onClick={() => {
                                deleteAllNotifications();
                                setNotifDropdownOpen(false);
                              }}
                              className="text-xs text-error hover:underline"
                            >
                              Clear All
                            </button>
                          )}
                          <Link
                            to="/notifications"
                            onClick={() => setNotifDropdownOpen(false)}
                            className="text-xs text-primary hover:underline"
                          >
                            View All
                          </Link>
                        </div>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-5 py-8 text-center text-sm text-text-muted dark:text-[#CBD5E1]">
                            No notifications
                          </div>
                        ) : (
                          notifications.slice(0, 4).map((n) => {
                            const getNotifCategory = (type: string) => {
                              switch (type) {
                                case 'assessment_reminder': return 'Assessment';
                                case 'risk_alert': return 'Risk';
                                case 'recommendation': return 'Recommendation';
                                case 'ai_alert': return 'AI Alert';
                                default: return 'System';
                              }
                            };
                            const category = getNotifCategory(n.type);
                            const formattedDate = new Date(n.createdAt).toLocaleDateString();

                            return (
                              <div
                                key={n._id}
                                onClick={() => {
                                  markNotificationRead(n._id);
                                  if (n.type === 'assessment_reminder') navigate('/assessment');
                                  if (n.type === 'recommendation') navigate('/dashboard/recommendations');
                                  setNotifDropdownOpen(false);
                                }}
                                className={`px-5 py-4 hover:bg-slate-50 dark:hover:bg-[#273449] cursor-pointer border-b border-slate-100/50 dark:border-[#334155] last:border-0 text-sm transition-colors ${
                                  !n.isRead ? 'bg-primary/5 dark:bg-primary/10 font-medium' : ''
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1.5">
                                  <span className={`font-semibold px-2 py-0.5 rounded-md text-[10px] tracking-wide uppercase border ${
                                    category === 'Risk' ? 'bg-error/10 text-error dark:border-error/20 border-error/20' :
                                    category === 'Assessment' ? 'bg-primary/10 text-primary dark:border-primary/20 border-primary/20' :
                                    category === 'Recommendation' ? 'bg-secondary/10 text-secondary dark:border-secondary/20 border-secondary/20' :
                                    category === 'AI Alert' ? 'bg-indigo-500/10 text-indigo-600 dark:border-indigo-500/20 border-indigo-500/20' :
                                    'bg-slate-100 text-slate-600 border-slate-200/60 dark:bg-[#334155] dark:text-[#CBD5E1] dark:border-[#334155]'
                                  }`}>
                                    {category}
                                  </span>
                                  <span className="text-[10px] text-text-muted dark:text-[#CBD5E1]">{formattedDate}</span>
                                </div>
                                <p className="text-text-primary dark:text-[#F8FAFC] line-clamp-2">{n.message}</p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center space-x-1 p-1 rounded-full hover:bg-surface-low transition-all"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <ChevronDown className="h-4 w-4 text-text-muted" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-[#334155] shadow-2xl py-1 z-[1000] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                      <div className="px-5 py-3 border-b border-slate-100/50 dark:border-[#334155] bg-slate-50/50 dark:bg-[#111827]/50">
                        <p className="text-sm font-semibold tracking-tight text-text-primary dark:text-[#F8FAFC] truncate">{user?.name}</p>
                        <p className="text-xs text-text-muted dark:text-[#CBD5E1] truncate mt-0.5">{user?.email}</p>
                      </div>
                      
                      {user?.role === 'student' && (
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-[#273449] text-text-primary dark:text-[#CBD5E1] dark:hover:text-[#F8FAFC] transition-colors"
                        >
                          <Settings className="mr-2 h-4 w-4 text-text-muted" />
                          Edit Profile
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-error hover:bg-error/5 text-left transition-colors border-t border-slate-100"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/auth/login"
                  className="text-text-primary hover:text-primary font-medium text-sm px-4 py-2 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-surface-low"
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  className="bg-primary text-white font-medium text-sm px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:bg-primary/95 hover:-translate-y-0.5 active:translate-y-0"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button & streak */}
          <div className="flex items-center md:hidden space-x-2">
            {isAuthenticated && user?.role === 'student' && (
              <div className="relative group md:hidden" ref={streakRef}>
                <button
                  onClick={() => {
                    setStreakPopupOpen(!streakPopupOpen);
                    setNotifDropdownOpen(false);
                    setProfileDropdownOpen(false);
                  }}
                  className="relative w-8 h-8 rounded-full transition-all duration-500 flex items-center justify-center hover:scale-105 active:scale-95"
                  style={{
                    background: isDailyLimitReached
                      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                      : 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)',
                    boxShadow: isDailyLimitReached
                      ? '0 2px 8px rgba(16, 185, 129, 0.3)'
                      : '0 2px 8px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  <svg className="absolute w-full h-full" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.2)" strokeWidth="6" fill="none" />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      stroke="white"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray="201"
                      strokeDashoffset={isDailyLimitReached ? 0 : 201}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                      style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%'
                      }}
                    />
                  </svg>
                  <div className="relative z-10">
                    <Flame className={`w-5 h-5 ${isDailyLimitReached ? 'text-green-300' : 'text-red-300'}`} fill="currentColor" />
                  </div>
                </button>
                <div className={`pointer-events-none absolute right-0 top-full z-20 mt-2 w-max rounded-lg px-3 py-2 text-xs font-bold shadow-lg transition-opacity duration-200 opacity-0 group-hover:opacity-100 ${
                    isDailyLimitReached
                      ? 'border-2 border-green-500 bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-100 dark:border-green-400'
                      : 'border-2 border-red-500 bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-100 dark:border-red-400'
                  }`}>
                  {daysCompletedThisWeek}/7
                </div>

                {/* Streak Popup for mobile */}
                {streakPopupOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-72 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-sm rounded-3xl border border-slate-200/60 dark:border-[#334155] shadow-2xl py-4 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    {/* Header */}
                    <div className="px-5 pb-4 border-b border-slate-100/50 dark:border-[#334155] bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)' }}>
                            <Flame className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-text-primary dark:text-[#F8FAFC]">Your Streak</h3>
                            <p className="text-xs text-text-muted dark:text-[#CBD5E1]">
                              {isDailyLimitReached ? "Today's assessment complete!" : "Don't break your streak!"}
                            </p>
                          </div>
                        </div>
                        <Trophy className="h-6 w-6 text-yellow-500" />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="bg-gradient-to-br from-primary/15 to-primary/5 dark:from-primary/25 dark:to-primary/10 rounded-2xl p-4 text-center">
                          <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">Current Streak</p>
                          <p className="text-3xl font-extrabold text-primary">{user?.currentStreak || 0}</p>
                          <p className="text-xs text-text-muted">days</p>
                        </div>
                        <div className="bg-gradient-to-br from-secondary/15 to-secondary/5 dark:from-secondary/25 dark:to-secondary/10 rounded-2xl p-4 text-center">
                          <p className="text-xs font-bold text-secondary uppercase tracking-wide mb-1">Longest Streak</p>
                          <p className="text-3xl font-extrabold text-secondary">{user?.longestStreak || 0}</p>
                          <p className="text-xs text-text-muted">days</p>
                        </div>
                      </div>

                      {/* Weekly Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-sm text-text-primary dark:text-[#F8FAFC]">This Week</span>
                          <span className="font-bold text-primary">{daysCompletedThisWeek}/7 days</span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 dark:bg-[#334155] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${(daysCompletedThisWeek / 7) * 100}%`,
                              background: 'linear-gradient(90deg, #4F46E5 0%, #8B5CF6 100%)'
                            }}
                          />
                        </div>
                      </div>

                      {/* Today Status */}
                      <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                        isDailyLimitReached
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isDailyLimitReached ? 'bg-green-500' : 'bg-orange-500'
                        }`}>
                          {isDailyLimitReached ? (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-text-primary dark:text-[#F8FAFC]">
                            {isDailyLimitReached ? "Today's assessment done!" : "Assessment pending"}
                          </p>
                          <p className="text-xs text-text-muted dark:text-[#CBD5E1]">
                            {isDailyLimitReached ? "Keep up the good work!" : "Take your assessment to keep the streak alive"}
                          </p>
                        </div>
                      </div>

                      {/* Quick Action */}
                      {!isDailyLimitReached && (
                        <button
                          onClick={() => {
                            setStreakPopupOpen(false);
                            navigate('/assessment/daily');
                          }}
                          className="w-full mt-4 bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                        >
                          Take Assessment
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-text-primary hover:bg-surface-low focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-100 shadow-md animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/home"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isLinkActive('/home') ? 'bg-primary/10 text-primary' : 'text-text-primary'
              }`}
            >
              Home
            </Link>
            <a
              href="/home#about"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/home');
                setTimeout(() => {
                  document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-surface-low"
            >
              About Us
            </a>
            <a
              href="/home#contact"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/home');
                setTimeout(() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-surface-low"
            >
              Contact Us
            </a>
            {isAuthenticated && user?.role === 'student' && (
              <Link
                to="/journal-ai"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isLinkActive('/journal-ai') ? 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent bg-primary/10' : 'text-text-primary hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:bg-clip-text hover:text-transparent'
                }`}
              >
                AI Journal
              </Link>
            )}

            {isAuthenticated ? (
              <div className="pt-4 pb-2 border-t border-slate-200">
                <div className="flex items-center px-3 mb-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow">
                    {user?.name?.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-text-primary leading-tight">{user?.name}</p>
                    <p className="text-xs text-text-muted leading-tight">{user?.email}</p>
                  </div>
                </div>

                {user?.role === 'student' && (
                  <>
                    <button
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        handleDashboardClick(e);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary/5"
                    >
                      Dashboard Overview
                    </button>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-surface-low"
                    >
                      Edit Profile
                    </Link>
                  </>
                )}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:bg-secondary/5"
                  >
                    Admin Panel
                  </Link>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-error hover:bg-error/5"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-200 flex flex-col space-y-2 px-3">
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full py-2 border border-slate-200 rounded-md font-semibold text-sm hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full py-2 bg-primary text-white rounded-md font-semibold text-sm hover:bg-primary/95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
