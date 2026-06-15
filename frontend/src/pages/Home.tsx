import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { apiRequest } from '../lib/api';
import { ArrowRight, Activity, Moon, Shield, Award, Sparkles, Send, Mail, Phone, MapPin } from 'lucide-react';

export const Home: React.FC = () => {
  const { isAuthenticated, user, burnoutRisk, fetchBurnoutRisk, trackerHistory, fetchTrackerHistory } = useStore();
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSending, setContactSending] = useState(false);
  const [contactToast, setContactToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBurnoutRisk();
      fetchTrackerHistory();
    }
  }, [isAuthenticated, fetchBurnoutRisk, fetchTrackerHistory]);

  useEffect(() => {
    if (!contactToast) return;
    const timer = setTimeout(() => setContactToast(null), 5000);
    return () => clearTimeout(timer);
  }, [contactToast]);

  // Calculate average sleep and study hours from tracker history
  const averageSleep = trackerHistory.length > 0 
    ? (trackerHistory.reduce((sum, h) => sum + h.sleepHours, 0) / trackerHistory.length).toFixed(1) 
    : '7.0';
    
  const averageStudyHours = trackerHistory.length > 0 
    ? (trackerHistory.reduce((sum, h) => sum + h.studyHours, 0) / trackerHistory.length).toFixed(1) 
    : '6.0';
    
  const baselineSleep = 7.0;
  const sleepDeviation = trackerHistory.length > 0 
    ? Math.round(((parseFloat(averageSleep) - baselineSleep) / baselineSleep) * 100) 
    : 0;

  const getRiskBadgeColor = (riskLevel: 'high' | 'moderate' | 'low') => {
    if (riskLevel === 'high') return 'text-error bg-error/10';
    if (riskLevel === 'moderate') return 'text-amber-500 bg-amber-500/10';
    return 'text-success bg-success/10';
  };

  const getRiskLabel = (riskLevel: 'high' | 'moderate' | 'low') => {
    if (riskLevel === 'high') return 'High Risk';
    if (riskLevel === 'moderate') return 'Moderate Risk';
    return 'Low Risk';
  };

  const getRecommendation = (riskLevel: 'high' | 'moderate' | 'low') => {
    if (riskLevel === 'high') {
      return "Your journal entries show high negative sentiment. Consider taking breaks, reducing screen time, and reaching out for support.";
    }
    if (riskLevel === 'moderate') {
      return "Your mood shows some stress patterns. Try maintaining consistent sleep schedule and taking short breaks between study sessions.";
    }
    return "Your journal sentiment is positive. Keep up the good work with your wellness routine!";
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = contactForm.name.trim();
    const email = contactForm.email.trim();
    const message = contactForm.message.trim();

    if (!name || !email || !message || contactSending) return;

    setContactSending(true);
    setContactToast(null);

    try {
      await apiRequest<{ success: boolean }>('/contact', {
        method: 'POST',
        body: JSON.stringify({ name, email, message }),
      });
      setContactForm({ name: '', email: '', message: '' });
      setContactToast({
        type: 'success',
        message: 'Message sent successfully. We will get back to you soon.',
      });
    } catch {
      setContactToast({
        type: 'error',
        message: 'Failed to send message. Please try again later.',
      });
    } finally {
      setContactSending(false);
    }
  };

  return (
    <div className="space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left duration-500">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI-Powered Wellness Insights</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-text-primary leading-[1.1] tracking-tight">
              Monitor Academic Burnout <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Before It Becomes Serious
              </span>
            </h1>
            
            <p className="text-lg text-text-secondary max-w-xl leading-relaxed">
              Track stress, sleep hours, motivation levels, and academic workload. Use our continuous behavioral and emotional monitoring platform to restore focus and balance.
            </p>

            <div className="flex flex-wrap gap-4">
              {!isAuthenticated ? (
                <button
                  onClick={() => navigate('/auth/register')}
                  className="bg-primary text-white font-semibold px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card active:translate-y-0 text-sm"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : !user?.assessmentCompleted ? (
                <button
                  onClick={() => navigate('/assessment')}
                  className="bg-primary text-white font-semibold px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card active:translate-y-0 text-sm"
                >
                  <span>Take Initial Assessment</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-primary text-white font-semibold px-6 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card active:translate-y-0 text-sm"
                >
                  <span>View Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Illustration / Mock UI */}
          <div className="relative justify-center hidden lg:flex animate-in fade-in slide-in-from-right duration-500">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-full blur-3xl -z-10"></div>
            
            {/* Glassmorphic Mock UI Dashboard */}
            <div className="w-full max-w-[480px] bg-surface backdrop-blur-md rounded-2xl border border-border/50 p-6 shadow-level2 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span className="font-bold text-sm">BurnoutGuard Analytics</span>
                </div>
                <span className="text-xs text-text-muted">Live Simulator</span>
              </div>

              {/* Stress Level vs Sleep graph placeholder simulation */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold">Weekly Risk Indicator</span>
                  {burnoutRisk ? (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getRiskBadgeColor(burnoutRisk.riskLevel)}`}>
                      {getRiskLabel(burnoutRisk.riskLevel)}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full">
                      Loading...
                    </span>
                  )}
                </div>
                <div className="h-2 w-full bg-surface-elevated rounded-full overflow-hidden">
                  <div 
                    className="h-full progress-gradient transition-all duration-500" 
                    style={{ width: burnoutRisk ? `${burnoutRisk.negativeRatio}%` : '0%' }}
                  ></div>
                </div>
                {burnoutRisk && (
                  <p className="text-[10px] text-text-muted">
                    {burnoutRisk.negativeRatio}% negative sentiment ({burnoutRisk.totalEntries} entries)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface p-4 rounded-xl border border-border shadow-sm space-y-1">
                  <span className="text-[10px] text-text-muted font-medium">Average Sleep</span>
                  <p className="text-lg font-bold text-text-primary">{averageSleep} Hours</p>
                  <span className={`text-[9px] font-medium ${sleepDeviation < 0 ? 'text-error' : 'text-success'}`}>
                    {sleepDeviation > 0 ? '+' : ''}{sleepDeviation}% from baseline
                  </span>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border shadow-sm space-y-1">
                  <span className="text-[10px] text-text-muted font-medium">Study Focus</span>
                  <p className="text-lg font-bold text-text-primary">{averageStudyHours} Hrs/Day</p>
                  <span className="text-[9px] text-success font-medium">Within target</span>
                </div>
              </div>

              {/* Recommendation card mockup */}
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-2">
                <div className="flex items-center space-x-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-bold">AI Recommendation</span>
                </div>
                <p className="text-xs text-text-primary leading-relaxed">
                  {burnoutRisk ? getRecommendation(burnoutRisk.riskLevel) : "Loading your personalized wellness insights..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. About Us Section */}
      <section id="about" className="bg-background-secondary py-20 border-y border-border ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl font-display font-extrabold text-text-primary ">
              Empowering Students Toward Cognitive Clarity
            </h2>
            <p className="text-text-secondary  leading-relaxed">
              We leverage clean technology, wellness insights, and population-based learning models to stop burnout before it affects your grades or quality of life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 - Detect */}
            <div className="bg-surface dark:bg-[#1E293B] p-8 rounded-2xl border border-border  shadow-card hover:-translate-y-1 transition-all duration-300 space-y-4">
              <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold ">Detect Early</h3>
              <p className="text-sm text-text-secondary  leading-relaxed">
                Take initial and weekly wellness assessments to detect early indicators of stress, backlog, and mental fatigue.
              </p>
            </div>

            {/* Card 2 - Analyze */}
            <div className="bg-surface dark:bg-[#1E293B] p-8 rounded-2xl border border-border  shadow-card hover:-translate-y-1 transition-all duration-300 space-y-4">
              <div className="p-3 bg-secondary/10 text-secondary rounded-xl w-fit">
                <Moon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold ">Analyze Patterns</h3>
              <p className="text-sm text-text-secondary  leading-relaxed">
                Log your thoughts in our Mood Journal. Our engine extracts emotional sentiments and correlates them with sleep and study hours.
              </p>
            </div>

            {/* Card 3 - Improve */}
            <div className="bg-surface dark:bg-[#1E293B] p-8 rounded-2xl border border-border  shadow-card hover:-translate-y-1 transition-all duration-300 space-y-4">
              <div className="p-3 bg-success/10 text-success rounded-xl w-fit">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold ">Continuous Improvement</h3>
              <p className="text-sm text-text-secondary  leading-relaxed">
                Receive customized recommendations, write experience logs, and help our AI learn what works best for your study style.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Contact Us Section */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left - Contact Details */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-3xl font-display font-extrabold text-text-primary ">Get In Touch</h2>
              <p className="text-text-secondary  mt-3 leading-relaxed">
                Have questions about our wellness metrics or system access? Reach out, and our student assistance team will contact you.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted  uppercase tracking-wider font-semibold">Email Us</p>
                  <p className="text-sm font-semibold text-text-primary ">burnoutguard123@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted  uppercase tracking-wider font-semibold">Call Us</p>
                  <p className="text-sm font-semibold text-text-primary ">+91 5684987585</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 text-primary rounded-xl">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted  uppercase tracking-wider font-semibold">University Office</p>
                  <p className="text-sm font-semibold text-text-primary ">Student Services Block C, Sector-12</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-surface dark:bg-[#1E293B] p-8 rounded-2xl border border-border  shadow-card">
              <h3 className="text-xl font-bold mb-6 ">Send Us a Message</h3>

              {contactToast && (
                <div
                  className={`mb-4 p-4 rounded-xl text-center text-sm font-semibold animate-in zoom-in duration-200 ${
                    contactToast.type === 'success'
                      ? 'bg-success/10 border border-success/20 text-success'
                      : 'bg-error/10 border border-error/20 text-error'
                  }`}
                >
                  {contactToast.message}
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-primary dark:text-[#E2E8F0]" htmlFor="contact-name">Name</label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full border border-slate-200  bg-surface dark:bg-[#111827] text-text-primary  placeholder:text-text-muted dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-4 focus:ring-primary/10"
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-text-primary dark:text-[#E2E8F0]" htmlFor="contact-email">Email</label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full border border-slate-200  bg-surface dark:bg-[#111827] text-text-primary  placeholder:text-text-muted dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-4 focus:ring-primary/10"
                        placeholder="yourname@gmail.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-primary dark:text-[#E2E8F0]" htmlFor="contact-message">Message</label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full border border-slate-200  bg-surface dark:bg-[#111827] text-text-primary  placeholder:text-text-muted dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary dark:focus:border-[#4F46E5] focus:ring-4 focus:ring-primary/10"
                      placeholder="Write your query here..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={contactSending}
                    className="w-full bg-primary dark:bg-[#4F46E5] text-white font-semibold py-2.5 rounded-lg flex items-center justify-center space-x-2 hover:bg-primary/95 dark:hover:bg-[#4338CA] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <span>{contactSending ? 'Sending Message...' : 'Send Message'}</span>
                    {!contactSending && <Send className="h-4 w-4" />}
                  </button>
                </form>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="border-t border-slate-200  bg-surface dark:bg-[#0F172A] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-primary font-display font-extrabold text-xl">
                <Activity className="h-5 w-5 stroke-[3]" />
                <span>BurnoutGuard</span>
              </div>
              <p className="text-xs text-text-muted  leading-relaxed">
                Early-warning academic health and student motivation tracker. Built for progressive cognitive recovery.
              </p>
            </div>
            
            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-text-primary  mb-4">Navigations</h4>
              <ul className="space-y-2 text-xs text-text-muted ">
                <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
                <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-text-primary  mb-4">Privacy & Security</h4>
              <ul className="space-y-2 text-xs text-text-muted ">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms & Conditions</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-wider font-bold text-text-primary  mb-4">Quick Portal Access</h4>
              <ul className="space-y-2 text-xs text-text-muted ">
                <li><a href="/auth/login" className="hover:text-primary transition-colors">Student Login</a></li>
                <li><a href="/admin/login" className="hover:text-secondary transition-colors font-medium">Administrator Login</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border  pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-text-muted ">
            <p>© {new Date().getFullYear()} Student Wellness Project Team. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
              <a href="#" className="hover:text-primary transition-all">Twitter</a>
              <a href="#" className="hover:text-primary transition-all">LinkedIn</a>
              <a href="#" className="hover:text-primary transition-all">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
