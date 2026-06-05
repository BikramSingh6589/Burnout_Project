import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted', formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-foreground-muted">Sign in to monitor your wellness</p>
        </div>

        <div className="bg-surface rounded-lg shadow-card p-6 border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground-muted mb-1" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-foreground-muted" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-12 pl-10 pr-4 rounded-md border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="student@university.edu"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-foreground-muted mb-0" htmlFor="password">Password</label>
                <a href="#" className="text-sm font-medium text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-foreground-muted" />
                </div>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-12 pl-10 pr-4 rounded-md border border-border bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button type="submit" className="bg-primary text-white rounded-md h-12 px-6 font-medium transition-shadow hover:shadow-hover cursor-pointer w-full flex justify-center items-center gap-2">
              <LogIn className="h-5 w-5" />
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-foreground-muted">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline inline-flex items-center">
                Create one <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
