import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { DashboardLayout } from '../components/DashboardLayout';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Sparkles, Calendar, Moon, Compass, ArrowRight, Loader2 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, trackerHistory, recommendations, fetchTrackerHistory, fetchRecommendations, fetchNotifications, latestAssessment, analyticsSummary, fetchAnalytics, burnoutRisk, fetchBurnoutRisk, analyticsLoading, trackerHistoryLoading, burnoutRiskLoading, recommendationsLoading } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrackerHistory();
    fetchRecommendations();
    fetchNotifications();
    fetchAnalytics();
    fetchBurnoutRisk();
  }, [fetchTrackerHistory, fetchRecommendations, fetchNotifications, fetchAnalytics, fetchBurnoutRisk]);

  // Guard checks handled in DashboardLayout, but let's read the latest values
  const latestTracker = trackerHistory.length > 0 ? trackerHistory[trackerHistory.length - 1] : null;
  const currentScore = latestTracker ? latestTracker.burnoutScore : 0;

  const isLoading = trackerHistoryLoading || analyticsLoading || burnoutRiskLoading || recommendationsLoading;

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Moderate Risk';
    return 'Low Risk';
  };

  const getRiskBadgeStyles = (score: number) => {
    if (score >= 70) return 'bg-error/10 text-error border-error/20';
    if (score >= 40) return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    return 'bg-success/10 text-success border-success/20';
  };

  const getBurnoutRiskBadgeStyles = (riskLevel: 'high' | 'moderate' | 'low') => {
    if (riskLevel === 'high') return 'bg-error/10 text-error border-error/20';
    if (riskLevel === 'moderate') return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    return 'bg-success/10 text-success border-success/20';
  };

  const getBurnoutRiskLabel = (riskLevel: 'high' | 'moderate' | 'low') => {
    if (riskLevel === 'high') return 'High Risk';
    if (riskLevel === 'moderate') return 'Moderate Risk';
    return 'Low Risk';
  };

  const GraphLoading = () => (
    <div className="flex items-center justify-center h-64 bg-surface-elevated/50 rounded-2xl border border-border">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
        <p className="text-xs text-text-secondary">Loading...</p>
      </div>
    </div>
  );

  // Calculations
  const averageSleep = trackerHistory.length > 0 
    ? (trackerHistory.reduce((sum, h) => sum + h.sleepHours, 0) / trackerHistory.length).toFixed(1) 
    : '0.0';
  const dashboardRecommendations = analyticsSummary?.recommendations ?? recommendations;

  // Pie Chart Data: Recommendation Followed status
  const followStats = dashboardRecommendations.reduce(
    (acc, rec) => {
      if (rec.followedStatus === 'followed') acc.followed++;
      else if (rec.followedStatus === 'partially') acc.partially++;
      else if (rec.followedStatus === 'not') acc.not++;
      else acc.none++;
      return acc;
    },
    { followed: 0, partially: 0, not: 0, none: 0 }
  );

  const pieData = [
    { name: 'Followed', value: followStats.followed, color: '#10B981' },
    { name: 'Partially', value: followStats.partially, color: '#9C48EA' },
    { name: 'Not Followed', value: followStats.not, color: '#EF4444' },
    { name: 'No Feedback', value: followStats.none, color: '#C7C4D8' },
  ].filter(d => d.value > 0);

  // Fallback if no pie data has feedback yet
  const displayPieData = pieData.length > 0 ? pieData : [
    { name: 'Pending Feedback', value: dashboardRecommendations.length, color: '#C7C4D8' }
  ];

  // Format history for line chart (showing up to last 7 entries)
  const last7 = trackerHistory.slice(-7);
  const dashDateGroups: Record<string, number> = {};
  last7.forEach(h => { dashDateGroups[h.date] = (dashDateGroups[h.date] ?? 0) + 1; });
  const chartData = last7.map(h => {
    const sameDay = dashDateGroups[h.date] > 1;
    const dt = new Date(h.timestamp);
    return {
      ...h,
      dateLabel: sameDay
        ? dt.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : dt.toLocaleDateString([], { month: 'short', day: 'numeric' }),
    };
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 pb-6 border-b border-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-semibold tracking-tight text-text-primary">
              Hello, {user?.name || 'Student'}
            </h1>
            <p className="text-sm text-text-secondary flex items-center mt-2 font-medium">
              <Calendar className="h-4 w-4 mr-1.5" />
              <span>{new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/dashboard/history')}
              className="bg-transparent hover:bg-surface-elevated text-text-primary dark:text-[#E2E8F0] border border-slate-200/60 border-primary/40 font-medium px-4 py-2 rounded-xl text-sm transition-all shadow-sm hover:shadow"
            >
              History & Trends
            </button>
            <button
              onClick={() => navigate('/assessment/weekly')}
              className="bg-primary text-white font-medium px-4 py-2 rounded-xl text-sm transition-all shadow-sm hover:bg-[#4338CA] hover:shadow-md "
            >
              Take Assessment
            </button>
          </div>
        </div>

        {/* Analytics Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Circular Burnout Score Gauge Card */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md  transition-all duration-300 flex flex-col justify-between group">
            <span className="text-xs text-text-secondary font-semibold tracking-tight">Burnout Score</span>
            <div className="flex items-center space-x-5 py-3">
              <div className="relative flex items-center justify-center h-20 w-20">
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke={currentScore >= 70 ? '#EF4444' : currentScore >= 40 ? '#F59E0B' : '#433FE5'}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={213}
                    strokeDashoffset={213 - (213 * currentScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-2xl font-extrabold text-text-primary z-10">{currentScore}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary tracking-tight">Burnout Index</p>
                <p className="text-xs text-text-secondary mt-0.5">Cumulative score</p>
              </div>
            </div>
          </div>

          {/* Risk Level status Card */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md  transition-all duration-300 flex flex-col justify-between group">
            <span className="text-xs text-text-secondary font-semibold tracking-tight">Risk Level</span>
            <div className="py-2 space-y-1">
              <div className={`text-sm font-semibold px-3 py-1 rounded-lg border w-fit ${getRiskBadgeStyles(currentScore)}`}>
                {getRiskLabel(currentScore)}
              </div>
              <p className="text-xs text-text-secondary mt-2">Based on cognitive stress factors</p>
            </div>
          </div>

          {/* AI Journal Burnout Risk Card */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md  transition-all duration-300 flex flex-col justify-between group">
            <span className="text-xs text-text-secondary font-semibold tracking-tight flex items-center">
              <Sparkles className="h-3 w-3 mr-1 text-primary" />
              AI Journal Risk
            </span>
            <div className="py-2 space-y-1">
              {burnoutRisk ? (
                <>
                  <div className={`text-sm font-semibold px-3 py-1 rounded-lg border w-fit ${getBurnoutRiskBadgeStyles(burnoutRisk.riskLevel)}`}>
                    {getBurnoutRiskLabel(burnoutRisk.riskLevel)}
                  </div>
                  <p className="text-xs text-text-secondary mt-2">
                    {burnoutRisk.negativeRatio}% negative ({burnoutRisk.period})
                  </p>
                </>
              ) : (
                <p className="text-xs text-text-secondary mt-2">Loading...</p>
              )}
            </div>
          </div>

          {/* Average Score Card */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md  transition-all duration-300 flex flex-col justify-between group">
            <span className="text-xs text-text-secondary font-semibold tracking-tight">Average Score</span>
            <div className="py-2">
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-display font-semibold tracking-tight text-text-primary">
                  {analyticsSummary ? Math.round(analyticsSummary.averageScore) : '--'}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1">Based on {analyticsSummary?.assessmentCount || 0} assessments</p>
            </div>
          </div>

          {/* Average Sleep Hours Card */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md  transition-all duration-300 flex flex-col justify-between group">
            <span className="text-xs text-text-secondary font-semibold tracking-tight">Sleep Average</span>
            <div className="py-2">
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-display font-semibold tracking-tight text-text-primary">{averageSleep}</span>
                <span className="text-sm text-text-secondary font-medium">h</span>
              </div>
              <p className="text-xs text-text-secondary mt-1">Recommended target: 7.5+ Hrs</p>
            </div>
          </div>

          {/* Latest Mood Sentiment Card */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md  transition-all duration-300 flex flex-col justify-between group">
            <span className="text-xs text-text-secondary font-semibold tracking-tight">Latest Risk Level</span>
            <div className="py-2">
              <div className="text-xl font-semibold tracking-tight text-primary  flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-secondary dark:text-secondary shrink-0" />
                <span>{latestAssessment ? latestAssessment.riskLevel : 'Unknown'}</span>
              </div>
              <p className="text-xs text-text-secondary mt-2">
                Highest: {analyticsSummary?.highestScore || 0} / Lowest: {analyticsSummary?.lowestScore || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Burnout Score Trend Area Chart (col-span-2) */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md  transition-all duration-300 lg:col-span-2 space-y-6">
            <div className="flex justify-between items-end pb-4 border-b border-border">
              <h3 className="text-base font-semibold tracking-tight text-text-primary">Burnout score tracker</h3>
              <span className="text-xs text-text-secondary font-medium">Last 7 Sessions</span>
            </div>
            {isLoading ? (
              <GraphLoading />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBurnout" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dy={10} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 12, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', padding: '12px' }} 
                      cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '4 4' }} 
                    />
                    <Area 
                      type="monotone"
                      dataKey="burnoutScore"
                      stroke="var(--color-primary, #4F46E5)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorBurnout)"
                      activeDot={false}
                      name="Burnout Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Right: Recommendation Analytics Pie Chart */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md  transition-all duration-300 flex flex-col justify-between space-y-6">
            <div className="flex justify-between items-end pb-4 border-b border-border">
              <h3 className="text-base font-semibold tracking-tight text-text-primary">Interventions</h3>
              <span className="text-xs text-text-secondary font-medium">Status</span>
            </div>
            
            <div className="h-44 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    activeIndex={undefined}
                  >
                    {displayPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 12, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-display font-semibold tracking-tight text-text-primary">{dashboardRecommendations.length}</span>
                <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider mt-0.5">Total</span>
              </div>
            </div>

            {/* Pie Legends */}
            <div className="grid grid-cols-2 gap-3 text-xs font-medium text-text-secondary  mt-2">
              {displayPieData.map((d, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: d.color }}></span>
                  <span className="truncate">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Behavioral Analytics Row (Sleep & Screen Time Bars) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          {/* Sleep Hours Trend */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md  transition-all duration-300 space-y-6">
            <div className="flex justify-between items-end pb-4 border-b border-border">
              <h3 className="text-base font-semibold tracking-tight flex items-center ">
                <Moon className="h-4 w-4 mr-2 text-indigo-500" />
                <span>Sleep Tracker</span>
              </h3>
              <span className="text-xs text-text-secondary font-medium">Hours slept</span>
            </div>
            {isLoading ? (
              <GraphLoading />
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }} isAnimationActive={true} animationDuration={800} animationEasing="ease-out">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 12, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} cursor={{ fill: 'rgba(93, 92, 255, 0.05)' }} />
                    <Bar dataKey="sleepHours" fill="#5D5CFF" radius={[4, 4, 0, 0]} name="Sleep Hours" activeBar={false} key={(entry) => entry.id} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Screen Time Trend */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md  transition-all duration-300 space-y-6">
            <div className="flex justify-between items-end pb-4 border-b border-border">
              <h3 className="text-base font-semibold tracking-tight flex items-center ">
                <Compass className="h-4 w-4 mr-2 text-purple-500" />
                <span>Screen Time Exposure</span>
              </h3>
              <span className="text-xs text-text-secondary font-medium">Daily exposure</span>
            </div>
            {isLoading ? (
              <GraphLoading />
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }} isAnimationActive={true} animationDuration={800} animationEasing="ease-out">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                    <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 12, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} cursor={{ fill: 'rgba(129, 39, 207, 0.05)' }} />
                    <Bar dataKey="screenTime" fill="#8127CF" radius={[4, 4, 0, 0]} name="Screen Hours" activeBar={false} key={(entry) => entry.id} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Panel - Recommendations Preview */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md  transition-all duration-300 space-y-6">
          <div className="flex justify-between items-end pb-4 border-b border-border">
            <h3 className="text-base font-semibold tracking-tight ">Active Interventions</h3>
            <Link
              to="/dashboard/recommendations"
              className="text-sm text-primary  font-medium flex items-center space-x-1 hover:text-primary/80 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardRecommendations.slice(0, 2).map((rec) => (
              <div key={rec.id} className="border border-border rounded-xl p-5 space-y-3 bg-surface-elevated/30 hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer group">
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-md border ${
                    rec.priority === 'High' ? 'bg-error/10 text-error border-error/20' :
                    rec.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                    'bg-slate-100 dark:bg-[#334155] text-slate-600  border-slate-200 dark:border-[#334155]'
                  }`}>
                    {rec.priority}
                  </span>
                  <span className="text-xs text-text-secondary font-medium">{rec.dateGenerated}</span>
                </div>
                <h4 className="font-semibold text-sm tracking-tight text-text-primary group-hover:text-primary transition-colors">{rec.title}</h4>
                <p className="text-xs text-text-secondary  leading-relaxed">{rec.reason}</p>
              </div>
            ))}
            {dashboardRecommendations.length === 0 && (
              <div className="md:col-span-2 text-center py-8 text-xs text-text-secondary">
                Complete an assessment to generate personalized interventions.
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
