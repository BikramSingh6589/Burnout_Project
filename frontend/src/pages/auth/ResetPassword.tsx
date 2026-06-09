import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, KeyRound, Loader2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const ResetPassword: React.FC = () => {
  const { resetPassword } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !token || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (token.length !== 6 || isNaN(Number(token))) {
      setError('Reset token must be a 6-digit number.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const ok = await resetPassword(email, token, password);
    setLoading(false);

    if (!ok) {
      setError(useStore.getState().authError || 'Unable to reset password.');
      return;
    }

    setSuccess('Password reset successfully. Redirecting to login...');
    setTimeout(() => navigate('/auth/login'), 900);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-md p-8 rounded-2xl border border-slate-100 dark:border-[#334155] shadow-level2 glass-card">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC] tracking-tight">Reset Password</h2>
          <p className="text-sm text-neutral-outline dark:text-[#CBD5E1]">Enter your reset code and choose a new password</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-success/10 border border-success/20 text-success p-3 rounded-lg text-xs font-semibold text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-slate dark:text-[#E2E8F0]" htmlFor="reset-email">
              Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-4 focus:ring-primary/10"
              placeholder="biko@university.edu"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-slate dark:text-[#E2E8F0]" htmlFor="reset-token">
              Reset Code
            </label>
            <input
              id="reset-token"
              type="text"
              maxLength={6}
              required
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-[0.5em] text-xl font-mono border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-4 focus:ring-primary/10"
              placeholder="000000"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-slate dark:text-[#E2E8F0]" htmlFor="reset-password">
                New Password
              </label>
              <input
                id="reset-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-2 focus:ring-primary/10"
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-slate dark:text-[#E2E8F0]" htmlFor="reset-confirm">
                Confirm Password
              </label>
              <input
                id="reset-confirm"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-2 focus:ring-primary/10"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-primary/95 transition-all text-xs disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{loading ? 'Resetting...' : 'Reset Password'}</span>
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <div className="text-center">
          <Link to="/auth/login" className="text-xs text-primary font-semibold hover:underline flex items-center justify-center space-x-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
