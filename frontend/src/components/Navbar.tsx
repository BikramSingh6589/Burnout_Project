import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Bell, LogOut, Activity, ChevronDown, Menu, X, Settings, Moon, Sun } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, notifications, logout, markNotificationRead, deleteAllNotifications } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const notifRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notifDropdownOpen && notifRef.current && !notifRef.current.contains(target)) {
        setNotifDropdownOpen(false);
      }
      if (profileDropdownOpen && profileRef.current && !profileRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifDropdownOpen, profileDropdownOpen]);

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

  const activeNotifications = notifications.filter((n) => !n.read);

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    // Always go to dashboard — it handles the locked overlay internally
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const isLinkActive = (path: string) => {
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
                isLinkActive('/home') ? 'text-primary border-b-2 border-primary py-5' : 'text-text-secondary'
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
              className="text-text-secondary transition-colors duration-200 hover:text-primary"
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
                to="/journal"
                className={`transition-colors duration-200 hover:text-primary ${
                  isLinkActive('/journal') ? 'text-primary border-b-2 border-primary py-5' : 'text-text-secondary'
                }`}
              >
                Journal
              </Link>
            )}
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'student' && (
                  <button
                    onClick={handleDashboardClick}
                    className="bg-transparent hover:bg-primary/5 text-primary border border-primary font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5"
                  >
                    Dashboard
                  </button>
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
                    {activeNotifications.length > 0 && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-error rounded-full animate-pulse">
                        {activeNotifications.length}
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
                          notifications.slice(0, 4).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationRead(n.id);
                                if (n.category === 'Assessment') navigate('/assessment');
                                if (n.category === 'Recommendation') navigate('/dashboard/recommendations');
                                setNotifDropdownOpen(false);
                              }}
                              className={`px-5 py-4 hover:bg-slate-50 dark:hover:bg-[#273449] cursor-pointer border-b border-slate-100/50 dark:border-[#334155] last:border-0 text-sm transition-colors ${
                                !n.read ? 'bg-primary/5 dark:bg-primary/10 font-medium' : ''
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1.5">
                                <span className={`font-semibold px-2 py-0.5 rounded-md text-[10px] tracking-wide uppercase border ${
                                  n.category === 'Risk' ? 'bg-error/10 text-error dark:border-error/20' :
                                  n.category === 'Assessment' ? 'bg-primary/10 text-primary dark:border-primary/20' :
                                  n.category === 'Recommendation' ? 'bg-secondary/10 text-secondary dark:border-secondary/20' :
                                  'bg-slate-100 text-slate-600 border-slate-200/60 dark:bg-[#334155] dark:text-[#CBD5E1] dark:border-[#334155]'
                                }`}>
                                  {n.category}
                                </span>
                                <span className="text-[10px] text-text-muted dark:text-[#CBD5E1]">{n.date}</span>
                              </div>
                              <p className="text-text-primary dark:text-[#F8FAFC] line-clamp-2">{n.message}</p>
                            </div>
                          ))
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

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
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
                to="/journal"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isLinkActive('/journal') ? 'bg-primary/10 text-primary' : 'text-text-primary'
                }`}
              >
                Journal
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
