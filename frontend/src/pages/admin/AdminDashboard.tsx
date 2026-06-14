import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { ShieldCheck, Users, AlertTriangle, Send, LogOut, Search, ShieldAlert, Moon, Sun } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    isAuthenticated,
    user,
    logout,
    adminStudents,
    adminDashboardMetrics,
    adminSettings,
    fetchAdminStudents,
    fetchAdminHighRisk,
    fetchAdminDashboardMetrics,
    fetchAdminSettings,
    sendWellnessEmail,
    fetchAdminStudentDetail,
    adminStudentDetail,
    adminStudentLoading,
  } = useStore();

  const navigate = useNavigate();

  // Guard: Admin only
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  // Active sub-section state
  const [activeSection, setActiveSection] = useState<'overview' | 'students' | 'high-risk' | 'notifications' | 'settings'>('overview');

  // Internal component states
  const [searchQuery, setSearchQuery] = useState('');
  const [notifSuccess, setNotifSuccess] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [emailLoading, setEmailLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

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

  // Fetch admin data on component mount
  useEffect(() => {
    fetchAdminSettings();
    fetchAdminStudents();
    fetchAdminDashboardMetrics();
  }, []);

  useEffect(() => {
    if (activeSection === 'high-risk') {
      fetchAdminHighRisk();
    }
  }, [activeSection]);

  // Automated send uses `sendWellnessEmail` directly from buttons.

  // Calculations
  const totalStudentsCount = adminDashboardMetrics?.totalStudents ?? adminStudents.length;
  const averageBurnoutScore = adminDashboardMetrics?.averageBurnoutScore ?? 0;
  const highRiskCount = adminDashboardMetrics?.highRiskStudents ?? adminStudents.filter(s => s.burnoutScore >= adminSettings.highRiskThreshold).length;
  const lowRiskCount = adminDashboardMetrics?.lowRiskStudents ?? adminStudents.filter(s => s.burnoutScore < adminSettings.moderateRiskThreshold).length;
  const moderateRiskCount = adminDashboardMetrics?.mediumRiskStudents ?? adminStudents.filter(s => s.burnoutScore >= adminSettings.moderateRiskThreshold && s.burnoutScore < adminSettings.highRiskThreshold).length;
  const activeStudentsCount = adminDashboardMetrics?.weeklyActiveStudents ?? Math.round(totalStudentsCount * 0.85);
  const riskBase = totalStudentsCount || 1;
  const highRiskStudents = adminHighRiskStudents.length > 0 ? adminHighRiskStudents : adminStudents.filter(s => s.burnoutScore >= adminSettings.highRiskThreshold);

  // Filter students based on search
  const filteredStudents = adminStudents.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by risk priority (HIGH -> MODERATE -> LOW) and then by burnoutScore desc
  const riskPriority = (r: string) => (r === 'High' ? 0 : r === 'Moderate' ? 1 : 2);
  const sortedStudents = filteredStudents.slice().sort((a, b) => {
    const pr = riskPriority(a.riskLevel) - riskPriority(b.riskLevel);
    if (pr !== 0) return pr;
    return b.burnoutScore - a.burnoutScore;
  });

  const sendRiskGroupEmail = async (group: 'high' | 'moderate' | 'low') => {
    setNotificationError(null);
    setEmailLoading(true);

    const high = adminSettings.highRiskThreshold ?? 70;
    const med = adminSettings.moderateRiskThreshold ?? 40;

    const targets = adminStudents.filter((student) =>
      group === 'high'
        ? student.burnoutScore >= high
        : group === 'moderate'
        ? student.burnoutScore >= med && student.burnoutScore < high
        : student.burnoutScore < med
    );

    if (targets.length === 0) {
      setNotificationError('No students found for the selected risk group.');
      setEmailLoading(false);
      return;
    }

    const subject =
      group === 'high'
        ? 'Urgent: High Burnout Risk Support'
        : group === 'moderate'
        ? 'Notice: Moderate Burnout Risk'
        : 'Good progress: Low Burnout Risk';

    const message =
      group === 'high'
        ? 'Our records indicate your recent assessments show a high burnout score. We recommend you contact the wellness center, review personalized recommendations, and consider scheduling time for rest and counseling. If you need immediate assistance, please reach out to your counselor.'
        : group === 'moderate'
        ? 'Your recent assessments show a moderate burnout score. Keep an eye on sleep, stress management and study balance. Try small adjustments such as short breaks, a sleep routine, and review your recommendations in the app.'
        : 'Nice work — your recent assessments indicate a low burnout score. Keep maintaining healthy habits. If anything changes, remember the app is here for support and recommendations.';

    try {
      for (const student of targets) {
        // sequential send reduces rate-limit risk and preserves template behavior.
        // eslint-disable-next-line no-await-in-loop
        await sendWellnessEmail(student.id, subject, message);
      }
      setNotifSuccess(true);
      setTimeout(() => setNotifSuccess(false), 2500);
    } catch (err) {
      setNotificationError(err instanceof Error ? err.message : 'Failed to send group emails.');
    } finally {
      setEmailLoading(false);
    }
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
            onClick={() => setActiveSection('notifications')}
            className={`w-full flex justify-start items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              activeSection === 'notifications'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-[rgba(124,92,252,0.18)] dark:hover:text-[#9B84FF]'
            }`}
          >
            <Send className="h-5 w-5" />
            <span>Notification Center</span>
          </button>

          {/* Sidebar reduced to Overview, Student Monitoring, Notification Center only */}
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
                    <span className="text-xs uppercase font-bold tracking-wider">Average Burnout</span>
                    <ShieldCheck className="h-5 w-5 text-success" />
                  </div>
                  <p className="text-3xl font-extrabold text-neutral-slate">{averageBurnoutScore}</p>
                  <p className="text-[10px] text-neutral-outline">Platform-wide burnout average</p>
                </div>

                <div className="bg-white dark:bg-[#3f1f1f] p-6 rounded-2xl border border-slate-100 dark:border-[#7f1d1d] shadow-sm space-y-2 ring-1 ring-error/20 bg-error/5 dark:bg-error/10">
                  <div className="flex justify-between items-center text-error">
                    <span className="text-xs uppercase font-bold tracking-wider">High Risk Flagged</span>
                    <AlertTriangle className="h-5 w-5 animate-pulse" />
                  </div>
                  <p className="text-3xl font-extrabold text-error">{highRiskCount}</p>
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
                      <span>{lowRiskCount} Students</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-success" style={{ width: `${(lowRiskCount / riskBase) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-200">
                      <span>Moderate Risk (Score 40–69)</span>
                      <span>{moderateRiskCount} Students</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${(moderateRiskCount / riskBase) * 100}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-200">
                      <span>High Risk (Score &gt;= 70)</span>
                      <span>{highRiskCount} Students</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-error" style={{ width: `${(highRiskCount / riskBase) * 100}%` }}></div>
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
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Burnout</th>
                        <th className="p-4">Risk Level</th>
                        <th className="p-4">Last Assessment</th>
                        <th className="p-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-semibold text-slate-700 dark:text-slate-200">
                      {sortedStudents.map((student) => (
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
                          <td className="p-4 text-[10px] text-slate-500">{student.lastAssessmentDate || 'N/A'}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={async () => {
                                  setDetailModalOpen(true);
                                  try {
                                    await fetchAdminStudentDetail(student.id);
                                  } catch (err) {
                                    // ignore - store handles errors
                                  }
                                }}
                                className="text-[10px] bg-white border border-slate-200 hover:bg-slate-100 font-bold px-2 py-1 rounded transition-colors duration-200"
                              >
                                View Details
                              </button>

                              <button
                                onClick={async () => {
                                  setNotificationError(null);
                                  setEmailLoading(true);
                                  try {
                                    const score = Number(student.burnoutScore || 0);
                                    const high = adminSettings.highRiskThreshold ?? 70;
                                    const med = adminSettings.moderateRiskThreshold ?? 40;
                                    let subject = 'Wellness Support Message';
                                    let message = '';

                                    if (score >= high) {
                                      subject = 'Urgent: High Burnout Risk Support';
                                      message = `Our records indicate your recent assessments show a high burnout score (${score}). We recommend you contact the wellness center, review personalized recommendations, and consider scheduling time for rest and counseling. If you need immediate assistance, please reach out to your counselor.`;
                                    } else if (score >= med) {
                                      subject = 'Notice: Moderate Burnout Risk';
                                      message = `Your recent assessments show a moderate burnout score (${score}). Keep an eye on sleep, stress management and study balance. Try small adjustments (short breaks, sleep routine) and check your recommendations in the app.`;
                                    } else {
                                      subject = 'Good Progress: Low Burnout Risk';
                                      message = `Nice work — your recent assessments indicate a low burnout score (${score}). Keep maintaining healthy habits. If anything changes, remember the app is here for support and recommendations.`;
                                    }

                                    await sendWellnessEmail(student.id, subject, message);
                                    setNotifSuccess(true);
                                    setTimeout(() => setNotifSuccess(false), 2500);
                                  } catch (err) {
                                    setNotificationError(err instanceof Error ? err.message : 'Failed to send automated email');
                                  } finally {
                                    setEmailLoading(false);
                                  }
                                }}
                                className="text-[10px] text-secondary border border-secondary/20 hover:bg-secondary/15 font-bold px-2 py-1 rounded transition-colors duration-200"
                              >
                                {emailLoading ? 'Sending…' : 'Send Email'}
                              </button>
                            </div>
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
          {/* High Risk Center removed from UI per new admin spec */}

          {/* Section 5: Send notifications (Individual/Bulk) */}
          {activeSection === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="text-xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC]">Risk-Targeted Email Dispatch</h2>
              
              <div className="max-w-xl bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-100 dark:border-[#334155] shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-neutral-slate dark:text-[#F8FAFC] border-b border-slate-50 dark:border-[#334155] pb-2">Send to Students by Risk Group</h3>

                {notifSuccess && (
                  <div className="bg-success/10 border border-success/20 text-success p-2.5 rounded-lg text-xs font-semibold text-center">
                    Group emails sent successfully.
                  </div>
                )}
                {notificationError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-lg text-xs font-semibold text-center">
                    {notificationError}
                  </div>
                )}

                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Use the controls below to send pre-defined support emails only to the selected risk tier. Manual broadcast composition is disabled to keep dispatching consistent with the current risk targeting strategy.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => sendRiskGroupEmail('high')}
                    className="w-full bg-error text-white py-3 rounded-lg text-xs font-bold hover:opacity-95 transition"
                  >
                    Send High Risk Alert
                  </button>

                  <button
                    onClick={() => sendRiskGroupEmail('moderate')}
                    className="w-full bg-amber-500 text-white py-3 rounded-lg text-xs font-bold hover:opacity-95 transition"
                  >
                    Send Moderate Reminder
                  </button>

                  <button
                    onClick={() => sendRiskGroupEmail('low')}
                    className="w-full bg-success text-white py-3 rounded-lg text-xs font-bold hover:opacity-95 transition"
                  >
                    Send Low Risk Appreciation
                  </button>
                </div>

                {emailLoading && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">Sending emails to the selected group. This may take a moment.</div>
                )}
              </div>
            </div>
          )}

          {/* Section 6: System Settings */}
          {/* System Settings removed from admin UI per spec */}

        </div>
      </main>

      {/* Manual email compose modal removed — automated sends only */}

      {/* Student Detail Modal */}
      {detailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl w-full shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student Details</h3>
              <button className="text-sm text-slate-500" onClick={() => { setDetailModalOpen(false); }}>
                Close
              </button>
            </div>

            {adminStudentLoading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : adminStudentDetail ? (
              <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
                <div>
                  <div className="text-xs text-slate-400">Profile</div>
                  <div className="font-bold text-base">{adminStudentDetail.profile?.name}</div>
                  <div className="text-[12px] text-slate-500">{adminStudentDetail.profile?.email}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Burnout Analytics</div>
                  <div className="font-bold">{adminStudentDetail.burnout?.currentScore ?? 'N/A'} / Risk: {adminStudentDetail.burnout?.riskLevel ?? 'N/A'}</div>
                  <div className="text-[12px] text-slate-500">Last updated: {adminStudentDetail.burnout?.lastUpdated ? new Date(adminStudentDetail.burnout.lastUpdated).toLocaleString() : 'N/A'}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Assessments</div>
                  <ul className="list-disc pl-5 text-[13px]">
                    {adminStudentDetail.assessments && adminStudentDetail.assessments.length > 0 ? (
                      adminStudentDetail.assessments.map((a: any, idx: number) => (
                        <li key={idx}>{a.type ?? 'Assessment'} — {a.score ?? a.predictedScore ?? 'N/A'} ({new Date(a.date || a.createdAt).toLocaleDateString()})</li>
                      ))
                    ) : (
                      <li className="text-slate-500">No assessments found</li>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No details available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
