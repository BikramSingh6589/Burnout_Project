import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Activity, ArrowRight, Loader2, Shield } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

export const Login: React.FC = () => {
  const { login, loginWithGoogle } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    // Call Login Action
    setLoading(true);
    const success = await login(email, password, 'student');
    setLoading(false);
    if (success) {
      navigate('/');
    } else {
      setError(useStore.getState().authError || 'Invalid email or password.');
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    if (loading || googleLoading) return;
    setError(null);
    setGoogleLoading(true);

    const success = await loginWithGoogle(idToken);
    setGoogleLoading(false);

    if (success) {
      const user = useStore.getState().user;
      navigate(user?.profileCompleted === false ? '/complete-profile' : '/');
    } else {
      setError(useStore.getState().authError || 'Google sign-in failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-md w-full space-y-8 bg-white/90 dark:bg-[#1E293B] backdrop-blur-md p-8 rounded-2xl border border-slate-100 dark:border-[#334155] shadow-level2">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Activity className="h-8 w-8 stroke-[3]" />
            </div>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC] tracking-tight">Welcome Back</h2>
          <p className="text-sm text-neutral-outline dark:text-[#CBD5E1]">Login to access your wellness dashboard</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-xs font-semibold text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-slate dark:text-[#E2E8F0]" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-2 focus:ring-primary/10"
              placeholder="Enter Your Email Address"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-neutral-slate dark:text-[#E2E8F0]" htmlFor="login-password">Password</label>
              <Link to="/auth/forgot-password" className="text-[10px] text-primary dark:text-[#A5B4FC] hover:underline font-semibold">
                Forgot Password?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-2 focus:ring-primary/10"
              placeholder="Enter Your Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-primary/95 transition-all text-xs disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            <span>{loading ? 'Logging in...' : 'Login'}</span>
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100 dark:border-[#334155]"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#1E293B] px-2 text-neutral-outline dark:text-[#CBD5E1]">Or Continue With</span>
          </div>
        </div>

        <GoogleSignInButton
          onSuccess={handleGoogleLogin}
          onError={setError}
          disabled={loading}
          loading={googleLoading}
          label="Continue with Google"
        />

        <div className="flex flex-col space-y-4 pt-4 border-t border-slate-100 dark:border-[#334155] mt-6 text-center text-xs">
          <p className="text-neutral-outline dark:text-[#CBD5E1]">
            Don't have an account?{' '}
            <Link to="/auth/register" className="text-primary dark:text-[#A5B4FC] font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
          <p className="text-neutral-outline dark:text-[#CBD5E1] flex items-center justify-center">
            <Shield className="h-3.5 w-3.5 mr-1 text-secondary" />
            Are you an administrator?{' '}
            <Link to="/admin/login" className="text-secondary font-semibold hover:underline ml-1">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
