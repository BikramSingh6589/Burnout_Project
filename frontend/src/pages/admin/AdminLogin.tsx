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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Please fill in both fields.');
      return;
    }

    // Call Login with admin override
    const success = await login(username, password, 'admin');
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-slate-100 shadow-level2 glass-card">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-secondary/10 text-secondary rounded-2xl">
              <ShieldAlert className="h-8 w-8 text-secondary" />
            </div>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-neutral-slate tracking-tight">Admin Console</h2>
          <p className="text-sm text-neutral-outline">Secure management access for student administrators</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-slate" htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10"
              placeholder="admin"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-slate" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-secondary text-white py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-secondary/95 transition-all text-xs"
          >
            <span>Administrator Login</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 mt-6">
          <button
            onClick={() => navigate('/auth/login')}
            className="text-xs text-primary font-semibold hover:underline flex items-center justify-center space-x-1 mx-auto"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Student Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
