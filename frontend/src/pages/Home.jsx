import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, ShieldAlert, TrendingUp, BookOpen } from 'lucide-react';
import Navbar from '../components/common/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-extrabold text-foreground tracking-tight mb-6">
              Predict and Prevent <span className="text-primary">Academic Burnout</span>
            </h1>
            <p className="text-xl text-foreground-muted mb-10 leading-relaxed">
              Continuously monitor your academic, behavioral, and emotional indicators. Get early warnings and personalized recommendations before burnout impacts your performance and well-being.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/dashboard" className="bg-primary text-white rounded-md h-14 px-8 text-lg font-medium transition-shadow hover:shadow-hover cursor-pointer flex justify-center items-center gap-2 w-full sm:w-auto">
                <LayoutDashboard className="h-5 w-5" />
                Show Dashboard
              </Link>
              <Link to="/assessment" className="bg-transparent border-2 border-primary text-primary rounded-md h-14 px-8 text-lg font-medium transition-colors hover:bg-primary/5 cursor-pointer flex justify-center items-center gap-2 w-full sm:w-auto">
                <ClipboardList className="h-5 w-5" />
                Take Burnout Test
              </Link>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div id="about" className="bg-surface border-y border-border py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">About The Project</h2>
              <p className="text-foreground-muted max-w-2xl mx-auto">
                Many students experience burnout due to excessive coursework, continuous examinations, and poor sleep habits. Our platform aims to detect these warning signs early using intelligent monitoring and sentiment analysis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background rounded-xl p-6 border border-border">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ShieldAlert className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Early Detection</h3>
                <p className="text-foreground-muted">
                  Identify high-risk burnout patterns before they cause significant GPA decline or motivation loss through continuous monitoring.
                </p>
              </div>

              <div className="bg-background rounded-xl p-6 border border-border">
                <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Trend Analysis</h3>
                <p className="text-foreground-muted">
                  Track behavioral and emotional changes over time with an intuitive dashboard that visualizes your weekly wellness trends.
                </p>
              </div>

              <div className="bg-background rounded-xl p-6 border border-border">
                <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-success" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Actionable Advice</h3>
                <p className="text-foreground-muted">
                  Receive personalized wellness recommendations on sleep, study planning, and stress management based on your unique data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-background py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-foreground-muted">© 2026 Academic Burnout Prediction Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
