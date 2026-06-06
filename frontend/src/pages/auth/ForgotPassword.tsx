import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await forgotPassword(email);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-8 rounded-2xl border border-slate-100 shadow-level2 glass-card">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-neutral-slate tracking-tight">Recover Password</h2>
          <p className="text-sm text-neutral-outline">Reset your password via verified email link</p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="bg-success/10 border border-success/20 text-success p-4 rounded-xl text-center text-xs font-semibold animate-in zoom-in duration-200">
              Recovery link has been sent! Check your inbox for verification instructions.
            </div>
            <Link
              to="/auth/login"
              className="w-full border border-slate-200 bg-white py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2 text-neutral-slate hover:bg-slate-50 transition-colors text-xs"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-slate" htmlFor="recovery-email">
                Email Address
              </label>
              <input
                id="recovery-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="biko@university.edu"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-primary/95 transition-all text-xs disabled:opacity-50"
            >
              <span>{loading ? 'Sending...' : 'Send Reset Link'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            
            <div className="text-center">
              <Link to="/auth/login" className="text-xs text-primary font-semibold hover:underline flex items-center justify-center space-x-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
