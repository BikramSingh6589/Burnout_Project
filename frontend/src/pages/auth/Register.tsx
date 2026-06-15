import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Activity, ArrowRight, Loader2 } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { getPasswordRequirementError } from '@/lib/passwordValidation';

export const Register: React.FC = () => {
  const { register, loginWithGoogle } = useStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: '',
    age: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    // Validation
    if (!formData.name || !formData.phone || !formData.email || !formData.gender || !formData.age || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const passwordError = getPasswordRequirementError(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum <= 0) {
      setError('Please enter a valid age.');
      return;
    }

    // Call Register Action
    setLoading(true);
    const success = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      gender: formData.gender,
      age: ageNum,
      role: 'student',
    }, formData.password);
    setLoading(false);

    if (success) {
      navigate('/auth/verify-otp');
    } else {
      setError(useStore.getState().authError || 'Registration failed. Please check your backend connection.');
    }
  };

  const handleGoogleSignup = async (idToken: string) => {
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
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -z-10"></div>

      <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-md p-8 rounded-2xl border border-slate-100 dark:border-[#334155] shadow-level2 glass-card">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <Activity className="h-8 w-8 stroke-[3]" />
            </div>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC] tracking-tight">Create Account</h2>
          <p className="text-sm text-neutral-outline dark:text-[#CBD5E1]">Start monitoring your academic wellness</p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg text-xs font-semibold text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-slate dark:text-[#E2E8F0]" htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-2 focus:ring-primary/10"
                placeholder="Enter Your Name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-slate dark:text-[#E2E8F0]" htmlFor="reg-phone">Phone Number</label>
              <input
                id="reg-phone"
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-2 focus:ring-primary/10"
                placeholder="Enter Your Phone Number"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-slate dark:text-[#E2E8F0]" htmlFor="reg-email">Email Address</label>
            <input
              id="reg-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-2 focus:ring-primary/10"
              placeholder="Enter Your Email Address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-slate dark:text-[#E2E8F0]" htmlFor="reg-gender">Gender</label>
              <select
                id="reg-gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-2 focus:ring-primary/10"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-slate dark:text-[#E2E8F0]" htmlFor="reg-age">Age</label>
              <input
                id="reg-age"
                type="number"
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-2 focus:ring-primary/10"
                placeholder="Enter Your Age"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-slate dark:text-[#E2E8F0]" htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-2 focus:ring-primary/10"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-slate dark:text-[#E2E8F0]" htmlFor="reg-confirm">Confirm Password</label>
              <input
                id="reg-confirm"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-2 focus:ring-primary/10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-primary/95 transition-all text-xs disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#1E293B] px-2 text-neutral-outline dark:text-[#CBD5E1]">Or Sign Up With</span>
          </div>
        </div>

        <GoogleSignInButton
          onSuccess={handleGoogleSignup}
          onError={setError}
          disabled={loading}
          loading={googleLoading}
          label="Continue with Google"
        />

        <p className="text-center text-xs text-neutral-outline mt-6">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
