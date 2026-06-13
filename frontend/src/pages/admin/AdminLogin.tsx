import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login } = useStore();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!username || !password) {
      setError('Please fill in both fields.');
      setIsLoading(false);
      return;
    }

    // Call Login with admin override
    const success = await login(username, password, 'admin');
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-secondary/10 dark:bg-secondary/20 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-md w-full space-y-8 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-secondary/10 text-secondary rounded-2xl">
              <ShieldAlert className="h-8 w-8 text-secondary" />
            </div>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC] tracking-tight">Admin Console</h2>
          <p className="text-sm text-neutral-outline dark:text-[#CBD5E1]">Secure management access for student administrators</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200" htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              type="text"
              required
              disabled={isLoading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg px-3 py-2 text-xs transition duration-200 focus:border-secondary/80 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/25 hover:border-secondary/60 disabled:opacity-50"
              placeholder="admin"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 rounded-lg px-3 py-2 text-xs transition duration-200 focus:border-secondary/80 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/25 hover:border-secondary/60 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-secondary text-white py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-secondary/90 transition-all duration-200 shadow-sm shadow-secondary/20 text-xs focus:outline-none focus:ring-2 focus:ring-secondary/35 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isLoading ? 'Logging in...' : 'Administrator Login'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
          <button
            onClick={() => navigate('/auth/login')}
            className="text-xs text-primary dark:text-[#A5B4FC] font-semibold hover:underline flex items-center justify-center space-x-1 mx-auto"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Student Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
