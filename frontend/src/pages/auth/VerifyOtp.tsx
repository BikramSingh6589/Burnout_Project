import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ShieldCheck, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';

export const VerifyOtp: React.FC = () => {
  const { verifyOtp, resendOtp } = useStore();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setResendStatus(null);

    if (otp.length !== 6 || isNaN(Number(otp))) {
      setError('Please enter a valid 6-digit number.');
      return;
    }

    setLoading(true);
    const success = await verifyOtp(otp);
    setLoading(false);
    if (success) {
      navigate('/');
    } else {
      setError(useStore.getState().authError || 'Invalid verification code.');
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setResendStatus(null);
    const success = await resendOtp();
    setResending(false);
    if (success) {
      setResendStatus('A new code has been sent to your email.');
    } else {
      setError(useStore.getState().authError || 'Unable to resend verification code.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-md p-8 rounded-2xl border border-slate-100 dark:border-[#334155] shadow-level2 glass-card">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC] tracking-tight">Email Verification</h2>
          <p className="text-sm text-neutral-outline dark:text-[#CBD5E1]">We sent a 6-digit OTP code to verify your account</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {resendStatus && (
          <div className="bg-success/10 border border-success/20 text-success p-3 rounded-lg text-xs font-semibold text-center">
            {resendStatus}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-slate dark:text-[#E2E8F0] block text-center mb-2" htmlFor="otp-input">
              Enter 6-Digit OTP
            </label>
            <input
              id="otp-input"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-[0.5em] text-2xl font-mono border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B] rounded-lg px-3 py-3 focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-4 focus:ring-primary/10"
              placeholder="000000"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-primary/95 transition-all text-xs shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            <span>{loading ? 'Verifying...' : 'Verify Email'}</span>
          </button>
        </form>

        <div className="flex justify-center items-center mt-6">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
            <span>{resending ? 'Sending...' : 'Resend Verification Code'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
