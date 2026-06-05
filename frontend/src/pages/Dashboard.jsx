import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, BookOpen, Brain, Activity, TrendingUp, TrendingDown, Moon, ClipboardList } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Chatbot from '../components/common/Chatbot';

// Mock Data
const trendData = [
  { name: 'Week 1', score: 25 },
  { name: 'Week 2', score: 38 },
  { name: 'Week 3', score: 52 },
  { name: 'Week 4', score: 69 },
];

const sleepData = [
  { name: 'Mon', hours: 7 },
  { name: 'Tue', hours: 5 },
  { name: 'Wed', hours: 6 },
  { name: 'Thu', hours: 4 },
  { name: 'Fri', hours: 8 },
  { name: 'Sat', hours: 9 },
  { name: 'Sun', hours: 7 },
];

const Dashboard = () => {
  const currentScore = 69;
  const riskLevel = "High"; // Low, Moderate, High
  const riskColor = "text-danger";
  const riskBg = "bg-danger/10";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome Back, John</h1>
            <p className="text-foreground-muted mt-1">Here is your wellness overview for this week.</p>
          </div>
          <Link to="/assessment" className="bg-primary text-white rounded-md h-12 px-6 font-medium transition-shadow hover:shadow-hover cursor-pointer flex justify-center items-center gap-2 shrink-0">
            <ClipboardList className="h-5 w-5" />
            Take Weekly Test
          </Link>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Burnout Score */}
          <div className="bg-surface rounded-xl shadow-card p-6 border border-border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Current Burnout Score</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">{currentScore} <span className="text-sm font-normal text-foreground-muted">/ 100</span></h3>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-danger mr-1" />
              <span className="text-danger font-medium">+17 points</span>
              <span className="text-foreground-muted ml-2">from last week</span>
            </div>
          </div>

          {/* Risk Indicator */}
          <div className="bg-surface rounded-xl shadow-card p-6 border border-border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Risk Category</p>
                <h3 className={`text-3xl font-bold mt-2 ${riskColor}`}>{riskLevel}</h3>
              </div>
              <div className={`h-12 w-12 rounded-lg ${riskBg} flex items-center justify-center`}>
                <AlertCircle className={`h-6 w-6 ${riskColor}`} />
              </div>
            </div>
            <div className="mt-4 text-sm text-foreground-muted">
              Action required to prevent burnout
            </div>
          </div>

          {/* Attendance Analytics */}
          <div className="bg-surface rounded-xl shadow-card p-6 border border-border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Attendance Rate</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">78%</h3>
              </div>
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-danger mr-1" />
              <span className="text-danger font-medium">-5%</span>
              <span className="text-foreground-muted ml-2">from last month</span>
            </div>
          </div>

          {/* Sleep Analytics */}
          <div className="bg-surface rounded-xl shadow-card p-6 border border-border">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-foreground-muted">Avg. Sleep</p>
                <h3 className="text-3xl font-bold text-foreground mt-2">6.5 <span className="text-sm font-normal text-foreground-muted">hrs</span></h3>
              </div>
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Moon className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Activity className="h-4 w-4 text-warning mr-1" />
              <span className="text-warning font-medium">Irregular pattern</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Burnout Trend Chart */}
          <div className="bg-surface rounded-xl shadow-card p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-6">Weekly Burnout Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} dot={{ r: 6, fill: '#4F46E5', strokeWidth: 2, stroke: '#FFF' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sleep Analytics Chart */}
          <div className="bg-surface rounded-xl shadow-card p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-6">Sleep Pattern (Current Week)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }}
                    cursor={{ fill: '#F8FAFC' }}
                  />
                  <Bar dataKey="hours" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recommendations & Sentiment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recommendations */}
          <div className="bg-surface rounded-xl shadow-card p-6 border border-border lg:col-span-2">
            <h3 className="text-lg font-bold text-foreground mb-4">Personalized Recommendations</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-danger/10 border border-danger/20 flex gap-4">
                <div className="mt-1">
                  <Moon className="h-5 w-5 text-danger" />
                </div>
                <div>
                  <h4 className="font-semibold text-danger">Increase Sleep Duration</h4>
                  <p className="text-sm text-foreground-muted mt-1">Your recent sleep has been under 5 hours on some nights. Try to establish a consistent sleep schedule to get at least 7 hours of rest.</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 flex gap-4">
                <div className="mt-1">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h4 className="font-semibold text-warning">Create a Study Schedule</h4>
                  <p className="text-sm text-foreground-muted mt-1">You have a pending assignment backlog. Break your goals into smaller, achievable tasks and create a priority-based schedule.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Analytics */}
          <div className="bg-surface rounded-xl shadow-card p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Mood Analysis</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground-muted">Overall Sentiment</span>
                <span className="text-sm font-bold text-warning">Negative Trend</span>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground-muted">Positive</span>
                  <span className="font-medium">15%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground-muted">Neutral</span>
                  <span className="font-medium">35%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground-muted">Negative</span>
                  <span className="font-medium">50%</span>
                </div>
                <div className="w-full bg-border rounded-full h-2">
                  <div className="bg-danger h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-background rounded-lg border border-border text-sm italic text-foreground-muted">
                "I feel exhausted and overwhelmed by assignments this week."
                <div className="mt-2 text-xs font-semibold text-danger text-right">- Recent Journal</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Chatbot />
    </div>
  );
};

export default Dashboard;
