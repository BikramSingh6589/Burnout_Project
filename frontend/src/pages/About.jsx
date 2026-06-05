import React from 'react';
import Navbar from '../components/common/Navbar';
import { Target, Lightbulb, Users, Activity } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-foreground mb-4">About BurnoutGuard</h1>
          <p className="text-xl text-foreground-muted">
            Empowering students to take control of their mental wellness through data-driven insights and early intervention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-lg text-foreground-muted mb-6 leading-relaxed">
              Academic burnout is a silent epidemic. Many students only realize they are burnt out after their grades have dropped, their sleep is ruined, and their motivation is completely gone. 
            </p>
            <p className="text-lg text-foreground-muted leading-relaxed">
              Our mission is to change that. We built BurnoutGuard to continuously monitor your academic, behavioral, and emotional indicators, providing you with an early warning system before stress becomes unmanageable.
            </p>
          </div>
          <div className="bg-surface rounded-2xl shadow-card p-8 border border-border">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-primary/5 rounded-xl">
                <h3 className="text-4xl font-bold text-primary mb-2">10k+</h3>
                <p className="text-sm font-medium text-foreground-muted">Students Helped</p>
              </div>
              <div className="text-center p-4 bg-success/5 rounded-xl">
                <h3 className="text-4xl font-bold text-success mb-2">85%</h3>
                <p className="text-sm font-medium text-foreground-muted">Recovery Rate</p>
              </div>
              <div className="text-center p-4 bg-warning/5 rounded-xl">
                <h3 className="text-4xl font-bold text-warning mb-2">50+</h3>
                <p className="text-sm font-medium text-foreground-muted">Universities</p>
              </div>
              <div className="text-center p-4 bg-secondary/5 rounded-xl">
                <h3 className="text-4xl font-bold text-secondary mb-2">24/7</h3>
                <p className="text-sm font-medium text-foreground-muted">Monitoring</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">How We Support You</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm text-center">
              <div className="h-14 w-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Smart Tracking</h3>
              <p className="text-sm text-foreground-muted">Log your sleep, mood, and study hours effortlessly.</p>
            </div>
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm text-center">
              <div className="h-14 w-14 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Early Warnings</h3>
              <p className="text-sm text-foreground-muted">Get alerted the moment your burnout risk increases.</p>
            </div>
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm text-center">
              <div className="h-14 w-14 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-7 w-7 text-warning" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Actionable Advice</h3>
              <p className="text-sm text-foreground-muted">Receive scientifically-backed recommendations to recover.</p>
            </div>
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm text-center">
              <div className="h-14 w-14 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-success" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Community</h3>
              <p className="text-sm text-foreground-muted">You are not alone. Connect with counselors and peers.</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-background py-8 border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-foreground-muted">© 2026 Academic Burnout Prediction Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default About;
