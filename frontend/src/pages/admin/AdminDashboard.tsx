import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ShieldCheck, Users, AlertTriangle, FileText, Send, Settings, LogOut, Search, Plus, Trash2, ShieldAlert } from 'lucide-react';

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
    adminSendNotification
  } = useStore();

  const navigate = useNavigate();

  // Guard: Admin only
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  // Active sub-section state
  const [activeSection, setActiveSection] = useState<'overview' | 'students' | 'high-risk' | 'recommendations' | 'notifications' | 'settings'>('overview');

  // Internal component states
  const [searchQuery, setSearchQuery] = useState('');
  const [newRec, setNewRec] = useState({ title: '', reason: '', priority: 'High' as 'High' | 'Medium' | 'Low' });
  const [dispatchNotif, setDispatchNotif] = useState({ target: 'all', message: '', category: 'General' as any });
  const [notifSuccess, setNotifSuccess] = useState(false);
  const [recSuccess, setRecSuccess] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);


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
    <div className="min-h-screen bg-slate-50/50 text-neutral-slate flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0">
        {/* Title */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-2">
          <ShieldAlert className="h-6 w-6 text-secondary shrink-0" />
          <div>
            <h2 className="font-display font-extrabold text-base tracking-tight text-white leading-none">Admin Control</h2>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1 block">Burnout Platform</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 text-sm font-semibold">
          <button
            onClick={() => setActiveSection('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeSection === 'overview' ? 'bg-secondary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
            <span>Dashboard Overview</span>
          </button>
          
          <button
            onClick={() => setActiveSection('students')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeSection === 'students' ? 'bg-secondary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>Student Monitoring</span>
          </button>

          <button
            onClick={() => setActiveSection('high-risk')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeSection === 'high-risk' ? 'bg-secondary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
            <span>High Risk Center</span>
          </button>

          <button
            onClick={() => setActiveSection('recommendations')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeSection === 'recommendations' ? 'bg-secondary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span>Recommendations CRUD</span>
          </button>

          <button
            onClick={() => setActiveSection('notifications')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeSection === 'notifications' ? 'bg-secondary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Send className="h-5 w-5" />
            <span>Notification Dispatch</span>
          </button>

          <button
            onClick={() => setActiveSection('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeSection === 'settings' ? 'bg-secondary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>System Settings</span>
          </button>
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 font-semibold text-xs transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Exit Admin Panel</span>
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="flex-1 p-6 md:p-10 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Section 1: Overview */}
          {activeSection === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-xl font-display font-extrabold text-neutral-slate">Overview Analytics</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs uppercase font-bold tracking-wider">Total Registered</span>
                    <Users className="h-5 w-5 text-indigo-500" />
                  </div>
                  <p className="text-3xl font-extrabold text-neutral-slate">{totalStudentsCount}</p>
                  <p className="text-[10px] text-neutral-outline">Academic wellness database</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs uppercase font-bold tracking-wider">Weekly Active</span>
                    <ShieldCheck className="h-5 w-5 text-success" />
                  </div>
                  <p className="text-3xl font-extrabold text-neutral-slate">{activeStudentsCount}</p>
                  <p className="text-[10px] text-neutral-outline">85% engagement rate</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2 ring-1 ring-error/20 bg-error/5">
                  <div className="flex justify-between items-center text-error">
                    <span className="text-xs uppercase font-bold tracking-wider">High Risk Flagged</span>
                    <AlertTriangle className="h-5 w-5 animate-pulse" />
                  </div>
                  <p className="text-3xl font-extrabold text-error">{highRiskStudents.length}</p>
                  <p className="text-[10px] text-error/80">Burnout score &gt;= {adminSettings.highRiskThreshold}</p>
                </div>
              </div>

              {/* Aggregated platform data */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-neutral-slate border-b border-slate-50 pb-2">Recent Risk Distribution</h3>
                <div className="space-y-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span>Low Risk (Score &lt; 40)</span>
                      <span>{adminStudents.filter(s => s.burnoutScore < adminSettings.moderateRiskThreshold).length} Students</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-success" style={{ width: `${(adminStudents.filter(s => s.burnoutScore < adminSettings.moderateRiskThreshold).length / totalStudentsCount) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span>Moderate Risk (Score 40–69)</span>
                      <span>{adminStudents.filter(s => s.burnoutScore >= adminSettings.moderateRiskThreshold && s.burnoutScore < adminSettings.highRiskThreshold).length} Students</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${(adminStudents.filter(s => s.burnoutScore >= adminSettings.moderateRiskThreshold && s.burnoutScore < adminSettings.highRiskThreshold).length / totalStudentsCount) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span>High Risk (Score &gt;= 70)</span>
                      <span>{highRiskStudents.length} Students</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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
                <h2 className="text-xl font-display font-extrabold text-neutral-slate">Student Health Logs</h2>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/10"
                  />
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
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
                    <tbody className="divide-y divide-slate-100 font-semibold text-neutral-slate/90">
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-neutral-slate">{student.name}</td>
                          <td className="p-4 text-[10px] text-slate-400">{student.email}</td>
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
                              className="text-[10px] text-secondary border border-secondary/20 hover:bg-secondary/5 font-bold px-2 py-1 rounded transition-colors"
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
              <h2 className="text-xl font-display font-extrabold text-neutral-slate">High-Risk Care Intervention Center</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {highRiskStudents.map((student) => (
                  <div key={student.id} className="bg-white p-6 rounded-2xl border border-error/20 bg-error/5 shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-error/5 rounded-full blur-xl"></div>
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-sm text-neutral-slate">{student.name}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">{student.email}</p>
                      </div>
                      <span className="bg-error text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase">
                        Score {student.burnoutScore}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-[10px]">
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
              <h2 className="text-xl font-display font-extrabold text-neutral-slate">Intervention Template Manager</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form column */}
                <div className="lg:col-span-5">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-neutral-slate border-b border-slate-50 pb-2">Add New Recommendation</h3>
                    
                    {recSuccess && (
                      <div className="bg-success/10 border border-success/20 text-success p-2.5 rounded-lg text-xs font-semibold text-center">
                        Recommendation added successfully
                      </div>
                    )}

                    <form onSubmit={handleCreateRecommendation} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold" htmlFor="rec-title">Template Title</label>
                        <input
                          id="rec-title"
                          type="text"
                          required
                          value={newRec.title}
                          onChange={(e) => setNewRec({ ...newRec, title: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary"
                          placeholder="e.g., Extended Screen-Free Hours"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold" htmlFor="rec-reason">Behavioral Reason</label>
                        <textarea
                          id="rec-reason"
                          rows={3}
                          required
                          value={newRec.reason}
                          onChange={(e) => setNewRec({ ...newRec, reason: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary"
                          placeholder="Why is this suggested? e.g., Correlates with evening screen hours exceeding 6 hours."
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold" htmlFor="rec-priority">Priority Level</label>
                        <select
                          id="rec-priority"
                          value={newRec.priority}
                          onChange={(e) => setNewRec({ ...newRec, priority: e.target.value as any })}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary bg-white"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-secondary text-white font-semibold py-2 rounded-lg text-xs flex items-center justify-center space-x-1.5 hover:bg-secondary/95 transition-all"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Template</span>
                      </button>
                    </form>
                  </div>
                </div>

                {/* Templates list column */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-sm font-bold text-neutral-slate">Global Active Recommendations ({recommendations.length})</h3>
                  
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {recommendations.map((rec) => (
                      <div key={rec.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${
                              rec.priority === 'High' ? 'bg-error/10 text-error border-error/15' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {rec.priority}
                            </span>
                            <span className="text-[8px] text-slate-400">{rec.dateGenerated}</span>
                          </div>
                          <h4 className="font-bold text-xs text-neutral-slate">{rec.title}</h4>
                          <p className="text-[10px] text-neutral-outline/90 leading-relaxed">{rec.reason}</p>
                        </div>

                        <button
                          onClick={() => adminDeleteRecommendation(rec.id)}
                          className="text-error hover:bg-error/5 p-1 rounded-md transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Send notifications (Individual/Bulk) */}
          {activeSection === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-xl font-display font-extrabold text-neutral-slate">System Notification Dispatcher</h2>
              
              <div className="max-w-xl bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-neutral-slate border-b border-slate-50 pb-2">Broadcast Settings</h3>
                
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
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary bg-white"
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
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary bg-white"
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
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary"
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
              <h2 className="text-xl font-display font-extrabold text-neutral-slate">Platform Configuration Settings</h2>
              
              <div className="max-w-xl bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-neutral-slate border-b border-slate-50 pb-2">Threshold Specifications</h3>
                
                {settingsSuccess && (
                  <div className="bg-success/10 border border-success/20 text-success p-2.5 rounded-lg text-xs font-semibold text-center">
                    Settings parameters saved.
                  </div>
                )}

                <form onSubmit={handleUpdateSettings} className="space-y-5">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <label className="text-neutral-slate">High Risk Score Threshold</label>
                      <span className="text-secondary">{adminSettings.highRiskThreshold}</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      value={adminSettings.highRiskThreshold}
                      onChange={(e) => adminUpdateSettings({ highRiskThreshold: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-secondary"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <label className="text-neutral-slate">Moderate Risk Score Threshold</label>
                      <span className="text-secondary">{adminSettings.moderateRiskThreshold}</span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="49"
                      value={adminSettings.moderateRiskThreshold}
                      onChange={(e) => adminUpdateSettings({ moderateRiskThreshold: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-secondary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" htmlFor="assess-days-select">Mandatory Assessment Interval (Days)</label>
                    <select
                      id="assess-days-select"
                      value={adminSettings.assessmentIntervalDays}
                      onChange={(e) => adminUpdateSettings({ assessmentIntervalDays: Number(e.target.value) })}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-secondary bg-white"
                    >
                      <option value={5}>Every 5 Days</option>
                      <option value={7}>Every 7 Days (Standard)</option>
                      <option value={10}>Every 10 Days</option>
                      <option value={14}>Every 14 Days</option>
                    </select>
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

        </div>
      </main>
    </div>
  );
};
