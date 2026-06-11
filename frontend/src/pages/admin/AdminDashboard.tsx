import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import type { PendingAiRecommendation } from '../../store/useStore';
import { ShieldCheck, Users, AlertTriangle, FileText, Send, Settings, LogOut, Search, Plus, Trash2, ShieldAlert, Moon, Sun, Brain, CheckCircle2, XCircle, Pencil, Clock, RefreshCw } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    isAuthenticated,
    user,
    logout,
    adminStudents,
    adminSettings,
    adminUpdateSettings,
    recommendations,
    adminCreateRecommendation,
    adminDeleteRecommendation,
    adminSendNotification,
    pendingAiRecommendations,
    pendingAiLoading,
    fetchPendingAiRecommendations,
    approveAiRecommendation,
    editApproveAiRecommendation,
    rejectAiRecommendation,
  } = useStore();

  const navigate = useNavigate();

  // Guard: Admin only
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  // Active sub-section state
  const [activeSection, setActiveSection] = useState<'overview' | 'students' | 'high-risk' | 'recommendations' | 'notifications' | 'settings' | 'ai-queue'>('overview');

  // Internal component states
  const [searchQuery, setSearchQuery] = useState('');
  const [newRec, setNewRec] = useState({ title: '', reason: '', priority: 'High' as 'High' | 'Medium' | 'Low' });
  const [dispatchNotif, setDispatchNotif] = useState({ target: 'all', message: '', category: 'General' as any });
  const [notifSuccess, setNotifSuccess] = useState(false);
  const [recSuccess, setRecSuccess] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  // AI Review Queue state
  const [queueActionId, setQueueActionId] = useState<string | null>(null);
  const [editingRec, setEditingRec] = useState<PendingAiRecommendation | null>(null);
  const [editFields, setEditFields] = useState({ title: '', message: '', priority: '' });
  const [queueError, setQueueError] = useState<string | null>(null);
  const [queueSuccess, setQueueSuccess] = useState<string | null>(null);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  // Fetch pending AI recommendations when tab is opened
  useEffect(() => {
    if (activeSection === 'ai-queue') {
      fetchPendingAiRecommendations();
    }
  }, [activeSection]);

  const handleApprove = async (id: string) => {
    setQueueActionId(id);
    setQueueError(null);
    try {
      await approveAiRecommendation(id);
      setQueueSuccess('Recommendation approved and published to student.');
      setTimeout(() => setQueueSuccess(null), 3000);
    } catch {
      setQueueError('Failed to approve. Please try again.');
    } finally {
      setQueueActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    setQueueActionId(id);
    setQueueError(null);
    try {
      await rejectAiRecommendation(id);
      setQueueSuccess('Recommendation rejected and removed.');
      setTimeout(() => setQueueSuccess(null), 3000);
    } catch {
      setQueueError('Failed to reject. Please try again.');
    } finally {
      setQueueActionId(null);
    }
  };

  const handleEditApprove = async () => {
    if (!editingRec) return;
    setQueueActionId(editingRec.id);
    setQueueError(null);
    try {
      await editApproveAiRecommendation(editingRec.id, {
        title: editFields.title || editingRec.title,
        message: editFields.message || editingRec.message,
        priority: editFields.priority || editingRec.priority,
      });
      setEditingRec(null);
      setQueueSuccess('Recommendation edited and approved.');
      setTimeout(() => setQueueSuccess(null), 3000);
    } catch {
      setQueueError('Failed to edit-approve. Please try again.');
    } finally {
      setQueueActionId(null);
    }
  };


  // Calculations
  const totalStudentsCount = adminStudents.length;
  const highRiskStudents = adminStudents.filter(s => s.burnoutScore >= adminSettings.highRiskThreshold);
  const activeStudentsCount = Math.round(totalStudentsCount * 0.85); // Simulated active count

  // Filter students based on search
  const filteredStudents = adminStudents.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRecommendation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRec.title || !newRec.reason) return;
    
    adminCreateRecommendation({
      title: newRec.title,
      reason: newRec.reason,
      priority: newRec.priority,
    });
    
    setNewRec({ title: '', reason: '', priority: 'High' });
    setRecSuccess(true);
    setTimeout(() => setRecSuccess(false), 2500);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchNotif.message) return;
    
    adminSendNotification(dispatchNotif.target, dispatchNotif.message, dispatchNotif.category);
    setDispatchNotif({ target: 'all', message: '', category: 'General' });
    setNotifSuccess(true);
    setTimeout(() => setNotifSuccess(false), 2500);
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 2500);
  };

  const triggerDirectAlert = (studentEmail: string) => {
    setDispatchNotif({
      target: studentEmail,
      message: 'Urgent Care Alert: Your burnout scores are critically high. Please check in with the wellness center or talk to our AI Assistant.',
      category: 'Risk'
    });
    setActiveSection('notifications');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-neutral-slate dark:text-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 flex flex-col shrink-0">
        {/* Title */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-2">
          <ShieldAlert className="h-6 w-6 text-secondary shrink-0" />
          <div>
            <h2 className="font-display font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">Admin Control</h2>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1 block">Burnout Platform</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 text-sm font-semibold">
          <button
            onClick={() => setActiveSection('overview')}
            className={`w-full flex justify-start items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              activeSection === 'overview'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[rgba(124,92,252,0.18)] dark:hover:text-[#9B84FF]'
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
            <span>Dashboard Overview</span>
          </button>
          
          <button
            onClick={() => setActiveSection('students')}
            className={`w-full flex justify-start items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              activeSection === 'students'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[rgba(124,92,252,0.18)] dark:hover:text-[#9B84FF]'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Student Monitoring</span>
          </button>

          <button
            onClick={() => setActiveSection('high-risk')}
            className={`w-full flex justify-start items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              activeSection === 'high-risk'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[rgba(124,92,252,0.18)] dark:hover:text-[#9B84FF]'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
            <span>High Risk Center</span>
          </button>

          <button
            onClick={() => setActiveSection('recommendations')}
            className={`w-full flex justify-start items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              activeSection === 'recommendations'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[rgba(124,92,252,0.18)] dark:hover:text-[#9B84FF]'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Recommendations CRUD</span>
          </button>

          <button
            onClick={() => { setActiveSection('ai-queue'); }}
            className={`w-full flex justify-start items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 relative ${
              activeSection === 'ai-queue'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[rgba(124,92,252,0.18)] dark:hover:text-[#9B84FF]'
            }`}
          >
            <Brain className="h-5 w-5" />
            <span>AI Review Queue</span>
            {pendingAiRecommendations.length > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {pendingAiRecommendations.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSection('notifications')}
            className={`w-full flex justify-start items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              activeSection === 'notifications'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[rgba(124,92,252,0.18)] dark:hover:text-[#9B84FF]'
            }`}
          >
            <Send className="h-5 w-5" />
            <span>Notification Dispatch</span>
          </button>

          <button
            onClick={() => setActiveSection('settings')}
            className={`w-full flex justify-start items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              activeSection === 'settings'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[rgba(124,92,252,0.18)] dark:hover:text-[#9B84FF]'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>System Settings</span>
          </button>
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-600 transition-colors duration-200 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700/90 dark:hover:border dark:hover:border-slate-700 font-semibold text-xs"
          >
            <LogOut className="h-4 w-4" />
            <span>Exit Admin Panel</span>
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-6 md:p-10 min-w-0 overflow-y-auto bg-slate-50/50 dark:bg-slate-950 transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex justify-end mb-6">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition duration-200 hover:border-secondary/80 hover:bg-secondary/15 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary/30 dark:border-[#334155] dark:bg-[#111827] dark:text-slate-100 dark:hover:border-secondary/70 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{isDark ? 'Switch to Light' : 'Switch to Dark'}</span>
          </button>
        </div>
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Section 1: Overview */}
          {activeSection === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC]">Overview Analytics</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-100 dark:border-[#334155] shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs uppercase font-bold tracking-wider">Total Registered</span>
                    <Users className="h-5 w-5 text-indigo-500" />
                  </div>
                  <p className="text-3xl font-extrabold text-neutral-slate">{totalStudentsCount}</p>
                  <p className="text-[10px] text-neutral-outline">Academic wellness database</p>
                </div>

                <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-100 dark:border-[#334155] shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs uppercase font-bold tracking-wider">Weekly Active</span>
                    <ShieldCheck className="h-5 w-5 text-success" />
                  </div>
                  <p className="text-3xl font-extrabold text-neutral-slate">{activeStudentsCount}</p>
                  <p className="text-[10px] text-neutral-outline">85% engagement rate</p>
                </div>

                <div className="bg-white dark:bg-[#3f1f1f] p-6 rounded-2xl border border-slate-100 dark:border-[#7f1d1d] shadow-sm space-y-2 ring-1 ring-error/20 bg-error/5 dark:bg-error/10">
                  <div className="flex justify-between items-center text-error">
                    <span className="text-xs uppercase font-bold tracking-wider">High Risk Flagged</span>
                    <AlertTriangle className="h-5 w-5 animate-pulse" />
                  </div>
                  <p className="text-3xl font-extrabold text-error">{highRiskStudents.length}</p>
                  <p className="text-[10px] text-error/80">Burnout score &gt;= {adminSettings.highRiskThreshold}</p>
                </div>
              </div>

              {/* Aggregated platform data */}
              <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-100 dark:border-[#334155] shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-neutral-slate dark:text-[#F8FAFC] border-b border-slate-50 dark:border-[#334155] pb-2">Recent Risk Distribution</h3>
                <div className="space-y-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span>Low Risk (Score &lt; 40)</span>
                      <span>{adminStudents.filter(s => s.burnoutScore < adminSettings.moderateRiskThreshold).length} Students</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-success" style={{ width: `${(adminStudents.filter(s => s.burnoutScore < adminSettings.moderateRiskThreshold).length / totalStudentsCount) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-200">
                      <span>Moderate Risk (Score 40–69)</span>
                      <span>{adminStudents.filter(s => s.burnoutScore >= adminSettings.moderateRiskThreshold && s.burnoutScore < adminSettings.highRiskThreshold).length} Students</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${(adminStudents.filter(s => s.burnoutScore >= adminSettings.moderateRiskThreshold && s.burnoutScore < adminSettings.highRiskThreshold).length / totalStudentsCount) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-200">
                      <span>High Risk (Score &gt;= 70)</span>
                      <span>{highRiskStudents.length} Students</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-error" style={{ width: `${(highRiskStudents.length / totalStudentsCount) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Student Monitoring Table */}
          {activeSection === 'students' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC]">Student Health Logs</h2>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full border border-slate-300 dark:border-[#334155] bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-secondary dark:focus:border-[#2DD4BF] focus:ring-2 focus:ring-secondary/10"
                  />
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div className="bg-white/95 dark:bg-slate-950/95 rounded-2xl border border-slate-200 dark:border-[#334155] shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="p-4">Student Name</th>
                        <th className="p-4">Contact info</th>
                        <th className="p-4">Burnout score</th>
                        <th className="p-4">Risk Level</th>
                        <th className="p-4">Avg Sleep</th>
                        <th className="p-4">Avg Stress</th>
                        <th className="p-4">Sentiment</th>
                        <th className="p-4 text-center">Alert action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-200">
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="transition-colors hover:bg-slate-100/80 dark:hover:bg-slate-700/90">
                          <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{student.name}</td>
                          <td className="p-4 text-[10px] text-slate-300">{student.email}</td>
                          <td className="p-4 font-extrabold">{student.burnoutScore}/100</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold ${
                              student.burnoutScore >= adminSettings.highRiskThreshold ? 'bg-error/10 text-error border-error/15' :
                              student.burnoutScore >= adminSettings.moderateRiskThreshold ? 'bg-amber-500/10 text-amber-600 border-amber-500/15' :
                              'bg-success/10 text-success border-success/15'
                            }`}>
                              {student.riskLevel}
                            </span>
                          </td>
                          <td className="p-4">{student.sleepHoursAvg}h</td>
                          <td className="p-4">{student.stressLevelAvg}/10</td>
                          <td className="p-4 text-[10px]">{student.journalSentimentSummary}</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => triggerDirectAlert(student.email)}
                              className="text-[10px] text-secondary border border-secondary/20 hover:bg-secondary/15 font-bold px-2 py-1 rounded transition-colors duration-200"
                            >
                              Dispatch Alert
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: High Risk Center */}
          {activeSection === 'high-risk' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC]">High-Risk Care Intervention Center</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {highRiskStudents.map((student) => (
                  <div key={student.id} className="bg-white dark:bg-[#3f1f1f] p-6 rounded-2xl border border-error/20 dark:border-error/30 bg-error/5 dark:bg-error/10 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-error/5 dark:bg-error/10 rounded-full blur-xl"></div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-sm text-neutral-slate">{student.name}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">{student.email}</p>
                      </div>
                      <span className="bg-error text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                        Score {student.burnoutScore}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-700 text-[10px]">
                      <div>
                        <span className="text-slate-400 block">Age/Gender</span>
                        <span className="font-bold">{student.age} / {student.gender}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Sleep Average</span>
                        <span className="font-bold text-error">{student.sleepHoursAvg} Hours</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Stress Average</span>
                        <span className="font-bold text-error">{student.stressLevelAvg}/10</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-[10px]">
                        <span className="text-slate-400">Extracted mood markers: </span>
                        <span className="font-bold text-error">{student.journalSentimentSummary}</span>
                      </div>
                      
                      <button
                        onClick={() => triggerDirectAlert(student.email)}
                        className="bg-error text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-error/95 transition-all shadow-sm"
                      >
                        Dispatch Alert Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Recommendation templates CRUD */}
          {activeSection === 'recommendations' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC]">Intervention Template Manager</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form column */}
                <div className="lg:col-span-5">
                  <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-xl shadow-slate-950/20 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-[#334155] pb-2">Add New Recommendation</h3>
                    
                    {recSuccess && (
                      <div className="bg-success/10 dark:bg-success/20 border border-success/20 text-success p-2.5 rounded-lg text-xs font-semibold text-center">
                        Recommendation added successfully
                      </div>
                    )}

                    <form onSubmit={handleCreateRecommendation} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="rec-title">Template Title</label>
                        <input
                          id="rec-title"
                          type="text"
                          required
                          value={newRec.title}
                          onChange={(e) => setNewRec({ ...newRec, title: e.target.value })}
                          className="w-full border border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-2xl px-3 py-2 text-xs transition duration-200 focus:border-secondary/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary/20 hover:border-slate-300"
                          placeholder="e.g., Extended Screen-Free Hours"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="rec-reason">Behavioral Reason</label>
                        <textarea
                          id="rec-reason"
                          rows={3}
                          required
                          value={newRec.reason}
                          onChange={(e) => setNewRec({ ...newRec, reason: e.target.value })}
                          className="w-full border border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 rounded-2xl px-3 py-2 text-xs transition duration-200 focus:border-secondary/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary/20 hover:border-slate-300"
                          placeholder="Why is this suggested? e.g., Correlates with evening screen hours exceeding 6 hours."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="rec-priority">Priority Level</label>
                        <select
                          id="rec-priority"
                          value={newRec.priority}
                          onChange={(e) => setNewRec({ ...newRec, priority: e.target.value as any })}
                          className="w-full border border-slate-300 rounded-2xl px-3 py-2 text-xs focus:outline-none focus:border-secondary/80 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 transition duration-200 focus:ring-2 focus:ring-secondary/20 hover:border-slate-300"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-secondary text-white font-semibold py-2 rounded-2xl text-xs flex items-center justify-center space-x-1.5 hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/10"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Template</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Templates list column */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Global Active Recommendations ({recommendations.length})</h3>
                  
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {recommendations.length === 0 ? (
                      <div className="rounded-3xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950/90 p-6 text-sm text-slate-600 dark:text-slate-400 text-center">
                        No active recommendation templates yet. Add one to keep your intervention library fresh.
                      </div>
                    ) : (
                      recommendations.slice().sort((a, b) => {
                        const weight = { High: 0, Medium: 1, Low: 2 } as const;
                        return weight[a.priority] - weight[b.priority];
                      }).map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-white/95 dark:bg-[#0F172A] p-5 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-lg shadow-slate-950/20 flex flex-col sm:flex-row justify-between items-start gap-4 transition-all duration-200 hover:border-secondary/40 hover:bg-slate-100 dark:hover:bg-slate-900"
                        >
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                rec.priority === 'High'
                                  ? 'bg-error/10 text-error border-error/15'
                                  : rec.priority === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-200 border-amber-400/20'
                                  : 'bg-emerald-500/10 text-success border-success/20'
                              }`}>
                                {rec.priority}
                              </span>
                              <span className="text-[10px] text-slate-700 dark:text-slate-400">{rec.dateGenerated}</span>
                            </div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{rec.title}</h4>
                            <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 max-w-2xl">{rec.reason}</p>
                          </div>

                          <button
                            onClick={() => adminDeleteRecommendation(rec.id)}
                            className="inline-flex items-center justify-center rounded-2xl border border-error/20 bg-error/10 px-3 py-2 text-xs font-semibold text-error transition-all duration-200 hover:bg-error/15 hover:text-error/90"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Remove</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Send notifications (Individual/Bulk) */}
          {activeSection === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC]">System Notification Dispatcher</h2>
              
              <div className="max-w-xl bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-100 dark:border-[#334155] shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-neutral-slate dark:text-[#F8FAFC] border-b border-slate-50 dark:border-[#334155] pb-2">Broadcast Settings</h3>
                
                {notifSuccess && (
                  <div className="bg-success/10 border border-success/20 text-success p-2.5 rounded-lg text-xs font-semibold text-center">
                    Alert dispatch instructions queued successfully.
                  </div>
                )}

                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" htmlFor="dispatch-target">Alert Target User</label>
                    <select
                      id="dispatch-target"
                      value={dispatchNotif.target}
                      onChange={(e) => setDispatchNotif({ ...dispatchNotif, target: e.target.value })}
                      className="w-full border border-slate-200 dark:border-[#334155] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B]"
                    >
                      <option value="all">Broadcast: All Students</option>
                      {adminStudents.map(student => (
                        <option key={student.id} value={student.email}>
                          Student: {student.name} ({student.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" htmlFor="dispatch-category">Notification Category</label>
                    <select
                      id="dispatch-category"
                      value={dispatchNotif.category}
                      onChange={(e) => setDispatchNotif({ ...dispatchNotif, category: e.target.value as any })}
                      className="w-full border border-slate-200 dark:border-[#334155] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B]"
                    >
                      <option value="General">General Platform Info</option>
                      <option value="Assessment">Assessment Reminder</option>
                      <option value="Risk">High Stress Warning</option>
                      <option value="Recommendation">Intervention Update</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" htmlFor="dispatch-msg">Alert Message Body</label>
                    <textarea
                      id="dispatch-msg"
                      rows={4}
                      required
                      value={dispatchNotif.message}
                      onChange={(e) => setDispatchNotif({ ...dispatchNotif, message: e.target.value })}
                      className="w-full border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] placeholder:text-neutral-outline dark:placeholder:text-[#64748B] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary dark:focus:border-[#2DD4BF]"
                      placeholder="Write your alert details here..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-secondary text-white font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1.5 hover:bg-secondary/95 transition-all shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                    <span>Dispatch Alert Message</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Section 6: System Settings */}
          {activeSection === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC]">Platform Configuration Settings</h2>
              
              <div className="max-w-xl bg-white/95 dark:bg-[#0B1120] p-6 rounded-3xl border border-slate-200 dark:border-[#334155] shadow-xl shadow-slate-950/20 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC] border-b border-slate-200 dark:border-[#334155] pb-2">Threshold Specifications</h3>
                
                {settingsSuccess && (
                  <div className="bg-success/10 border border-success/20 text-success p-2.5 rounded-lg text-xs font-semibold text-center">
                    Settings parameters saved.
                  </div>
                )}

                <form onSubmit={handleUpdateSettings} className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <label className="text-slate-700 dark:text-slate-300">High Risk Score Threshold</label>
                      <span className="text-secondary">{adminSettings.highRiskThreshold}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      value={adminSettings.highRiskThreshold}
                      onChange={(e) => adminUpdateSettings({ highRiskThreshold: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-secondary"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <label className="text-slate-700 dark:text-slate-300">Moderate Risk Score Threshold</label>
                      <span className="text-secondary">{adminSettings.moderateRiskThreshold}</span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="49"
                      value={adminSettings.moderateRiskThreshold}
                      onChange={(e) => adminUpdateSettings({ moderateRiskThreshold: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-secondary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="assess-days-select">Mandatory Assessment Interval (Days)</label>
                    <select
                      id="assess-days-select"
                      value={adminSettings.assessmentIntervalDays}
                      onChange={(e) => adminUpdateSettings({ assessmentIntervalDays: Number(e.target.value) })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 placeholder:text-slate-500"
                    >
                      <option value={5}>Every 5 Days</option>
                      <option value={7}>Every 7 Days (Standard)</option>
                      <option value={10}>Every 10 Days</option>
                      <option value={14}>Every 14 Days</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300" htmlFor="weekly-assessment-limit">
                      Weekly Assessments Allowed Per Student
                    </label>
                    <input
                      id="weekly-assessment-limit"
                      type="number"
                      min="1"
                      max="20"
                      value={adminSettings.maxWeeklyAssessmentsPerStudent}
                      onChange={(e) => adminUpdateSettings({
                        maxWeeklyAssessmentsPerStudent: Math.max(1, Number(e.target.value)),
                      })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 placeholder:text-slate-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-secondary text-white font-semibold py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1.5 hover:bg-secondary/95 transition-all shadow-sm"
                  >
                    <span>Save Configurations</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Section: AI Review Queue */}
          {activeSection === 'ai-queue' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC]">AI Recommendation Review Queue</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI-generated suggestions awaiting counselor approval before being shown to students.</p>
                </div>
                <button
                  onClick={() => fetchPendingAiRecommendations()}
                  disabled={pendingAiLoading}
                  className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-secondary/10 hover:text-secondary transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${pendingAiLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {queueSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold px-4 py-3 rounded-xl">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  {queueSuccess}
                </div>
              )}
              {queueError && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-xs font-semibold px-4 py-3 rounded-xl">
                  <XCircle className="h-4 w-4 shrink-0" />
                  {queueError}
                </div>
              )}

              {editingRec && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Pencil className="h-4 w-4 text-secondary" /> Edit and Approve Recommendation
                      </h3>
                      <button onClick={() => setEditingRec(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <p><span className="font-semibold text-slate-700 dark:text-slate-300">Student:</span> {editingRec.studentName} ({editingRec.studentEmail})</p>
                      <p><span className="font-semibold text-slate-700 dark:text-slate-300">Category:</span> {editingRec.category}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title</label>
                        <input
                          type="text"
                          defaultValue={editingRec.title}
                          onChange={(e) => setEditFields(f => ({ ...f, title: e.target.value }))}
                          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Message</label>
                        <textarea
                          rows={4}
                          defaultValue={editingRec.message}
                          onChange={(e) => setEditFields(f => ({ ...f, message: e.target.value }))}
                          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 resize-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Priority</label>
                        <select
                          defaultValue={editingRec.priority}
                          onChange={(e) => setEditFields(f => ({ ...f, priority: e.target.value }))}
                          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-2">
                      <button
                        onClick={() => setEditingRec(null)}
                        className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEditApprove}
                        disabled={!!queueActionId}
                        className="text-xs font-semibold px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Save and Approve
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {pendingAiLoading && (
                <div className="flex items-center justify-center py-16 text-slate-400 dark:text-slate-500">
                  <RefreshCw className="h-6 w-6 animate-spin mr-3" />
                  <span className="text-sm font-semibold">Loading pending recommendations...</span>
                </div>
              )}

              {!pendingAiLoading && pendingAiRecommendations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500 space-y-3">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 dark:text-emerald-500 opacity-60" />
                  <p className="text-sm font-semibold">All caught up! No pending AI recommendations.</p>
                  <p className="text-xs text-center max-w-xs">AI recommendations will appear here when GROQ generates new suggestions that require counselor review.</p>
                </div>
              )}

              {!pendingAiLoading && pendingAiRecommendations.length > 0 && (
                <div className="space-y-4">
                  {pendingAiRecommendations.map((rec) => (
                    <div key={rec.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-violet-500 shrink-0" />
                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{rec.title}</h3>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            For: <span className="font-semibold text-slate-700 dark:text-slate-300">{rec.studentName}</span> &middot; {rec.studentEmail}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                            rec.priority === 'high' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700' :
                            rec.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700' :
                            'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700'
                          }`}>{rec.priority}</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-700 uppercase">{rec.category}</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700 flex items-center gap-1">
                            <Brain className="h-2.5 w-2.5" /> AI
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3">
                        {rec.message}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(rec.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditingRec(rec); setEditFields({ title: rec.title, message: rec.message, priority: rec.priority }); }}
                            disabled={!!queueActionId}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                          >
                            <Pencil className="h-3 w-3" /> Edit and Approve
                          </button>
                          <button
                            onClick={() => handleApprove(rec.id)}
                            disabled={!!queueActionId}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-40"
                          >
                            {queueActionId === rec.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(rec.id)}
                            disabled={!!queueActionId}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-40"
                          >
                            {queueActionId === rec.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
