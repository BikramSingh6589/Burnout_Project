import React, { useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { DashboardLayout } from '../components/DashboardLayout';
import { Sparkles, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { ChartSkeleton } from '../components/skeletons';

const DashboardCharts = lazy(() =>
  import('../components/DashboardCharts').then((m) => ({ default: m.DashboardCharts }))
);

export const Dashboard: React.FC = () => {
  const { 
    user, 
    trackerHistory, 
    recommendations, 
    fetchTrackerHistory, 
    fetchRecommendations, 
    fetchNotifications, 
    latestAssessment, 
    analyticsSummary, 
    fetchAnalytics, 
    burnoutRisk, 
    fetchBurnoutRisk, 
    trackerHistoryLoading, 
    burnoutRiskLoading, 
    recommendationsLoading, 
    fetchAdminSettings, 
    weeklyAssessmentHistory,
    weeklyAssessmentHistoryLoading,
    adminSettingsLoading,
  } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrackerHistory();
    fetchRecommendations();
    fetchNotifications();
    fetchAnalytics();
    fetchBurnoutRisk();
    fetchAdminSettings();
  }, [fetchTrackerHistory, fetchRecommendations, fetchNotifications, fetchAnalytics, fetchBurnoutRisk, fetchAdminSettings]);

  const isDailyLimitReached = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return weeklyAssessmentHistory.some(
      (assessment) => (assessment as any).date === today || 
      new Date((assessment as any).completedAt || (assessment as any).createdAt).toISOString().split('T')[0] === today
    );
  }, [weeklyAssessmentHistory]);

  const isDataLoading = weeklyAssessmentHistoryLoading || adminSettingsLoading;

  // Guard checks handled in DashboardLayout, but let's read the latest values
  const latestTracker = trackerHistory.length > 0 ? trackerHistory[trackerHistory.length - 1] : null;
  const currentScore = latestTracker ? latestTracker.burnoutScore : 0;

  const isLoading = trackerHistoryLoading || burnoutRiskLoading || recommendationsLoading;

  const getRiskLabel = (score: number) => {
    if (score >= 70) return 'High Risk';
    if (score >= 40) return 'Moderate Risk';
    return 'Low Risk';
  };

  const getRiskBadgeStyles = (score: number) => {
    if (score >= 70) return 'bg-error/10 text-error border-error/20';
    if (score >= 40) return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
    return 'bg-success/10 text-success border-success/20';
  };

  const getBurnoutRiskBadgeStyles = (riskLevel: 'high' | 'moderate' | 'low') => {
    if (riskLevel === 'high') return 'bg-error/10 text-error border-error/20';
    if (riskLevel === 'moderate') return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
    return 'bg-success/10 text-success border-success/20';
  };

  const getBurnoutRiskLabel = (riskLevel: 'high' | 'moderate' | 'low') => {
    if (riskLevel === 'high') return 'High Risk';
    if (riskLevel === 'moderate') return 'Moderate Risk';
    return 'Low Risk';
  };

  // Calculations
  const averageSleep = trackerHistory.length > 0 
    ? (trackerHistory.reduce((sum, h) => sum + h.sleepHours, 0) / trackerHistory.length).toFixed(1) 
    : '0.0';
  const dashboardRecommendations = recommendations;

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
            <div className="relative group">
              <button
                type="button"
                disabled={isDataLoading || isDailyLimitReached}
                onClick={() => {
                  if (!isDailyLimitReached && !isDataLoading) {
                    navigate('/assessment/daily');
                  }
                }}
                className={`flex items-center gap-2 bg-primary text-white font-medium px-4 py-2 rounded-xl text-sm transition-all shadow-sm ${
                  isDataLoading || isDailyLimitReached
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[#4338CA] hover:shadow-md'
                }`}
              >
                {isDataLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isDailyLimitReached ? (
                  '✓ Done Today'
                ) : (
                  'Take Assessment'
                )}
              </button>
              {isDailyLimitReached && (
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-max -translate-x-1/2 rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-xs font-medium text-[#CBD5E1] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  Daily assessment limit reached! Come back tomorrow.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analytics Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Circular Burnout Score Gauge Card (Primary Card) */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 sm:col-span-2 lg:col-span-2 p-6 rounded-2xl border-2 border-indigo-200 dark:border-indigo-500/30 shadow-xl shadow-indigo-200/50 dark:shadow-indigo-900/50 hover:shadow-2xl dark:hover:shadow-indigo-900/70 transition-all duration-300 flex flex-col justify-between group">
            <div className="flex items-center space-x-8 py-3">
              <div className="relative flex items-center justify-center h-32 w-32">
                <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" stroke="#F1F5F9" strokeWidth="10" fill="transparent" />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke={currentScore >= 70 ? '#EF4444' : currentScore >= 40 ? '#F59E0B' : '#433FE5'}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={213}
                    strokeDashoffset={213 - (213 * currentScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-4xl font-extrabold text-indigo-900 dark:text-white z-10">{currentScore}</span>
              </div>
              <div>
                <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100 tracking-tight">Burnout Index</p>
                <p className="text-sm text-indigo-600 dark:text-indigo-300 mt-2">Cumulative score based on all assessments</p>
              </div>
            </div>
          </div>

          {/* Risk Level status Card */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group min-h-[180px]">
            <div className="flex flex-col h-full">
              <span className="text-sm text-text-secondary font-semibold tracking-tight mb-3 pb-1 border-b border-indigo-200 dark:border-indigo-500/30">Risk Level</span>
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                <div className={`text-lg font-semibold px-4 py-1.5 rounded-full border w-fit whitespace-nowrap ${getRiskBadgeStyles(currentScore)}`}>
                  {getRiskLabel(currentScore)}
                </div>
                <p className="text-sm text-text-secondary">Current burnout risk status calculated from your last assessment</p>
              </div>
            </div>
          </div>

          {/* AI Journal Burnout Risk Card */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group min-h-[180px]">
            <div className="flex flex-col h-full">
              <span className="text-sm text-text-secondary font-semibold tracking-tight flex items-center mb-3 pb-1 border-b border-indigo-200 dark:border-indigo-500/30">
                <Sparkles className="h-4 w-4 mr-1 text-primary" />
                AI Journal Risk
              </span>
              <div className="space-y-3 flex-1 flex flex-col justify-center">
                {burnoutRisk ? (
                  <>
                    <div className={`text-lg font-semibold px-4 py-1.5 rounded-full border w-fit whitespace-nowrap ${getBurnoutRiskBadgeStyles(burnoutRisk.riskLevel)}`}>
                      {getBurnoutRiskLabel(burnoutRisk.riskLevel)}
                    </div>
                    <p className="text-sm text-text-secondary">Analyzed from your journal entries with sentiment detection</p>
                  </>
                ) : (
                  <p className="text-sm text-text-secondary">Analyzing your journal entries to detect burnout risk</p>
                )}
              </div>
            </div>
          </div>

          {/* Average Score Card */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group min-h-[180px]">
            <div className="flex flex-col h-full">
              <span className="text-sm text-text-secondary font-semibold tracking-tight mb-3 pb-1 border-b border-indigo-200 dark:border-indigo-500/30">Average Score</span>
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-display font-semibold tracking-tight text-text-primary">
                    {analyticsSummary ? Math.round(analyticsSummary.averageScore) : '--'}
                  </span>
                </div>
                <p className="text-sm text-text-secondary">Average burnout score across all your assessments</p>
              </div>
            </div>
          </div>

          {/* Sleep Average Card */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group min-h-[180px]">
            <div className="flex flex-col h-full">
              <span className="text-sm text-text-secondary font-semibold tracking-tight mb-3 pb-1 border-b border-indigo-200 dark:border-indigo-500/30">Sleep Average</span>
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-display font-semibold tracking-tight text-text-primary">{averageSleep}</span>
                  <span className="text-sm text-text-secondary font-medium">h</span>
                </div>
                <p className="text-sm text-text-secondary">Tracks your sleep patterns from daily assessments</p>
              </div>
            </div>
          </div>

          {/* Latest Risk Level Card */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group min-h-[180px]">
            <div className="flex flex-col h-full">
              <span className="text-sm text-text-secondary font-semibold tracking-tight mb-3 pb-1 border-b border-indigo-200 dark:border-indigo-500/30">Latest Risk Level</span>
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                <div className="text-2xl font-semibold tracking-tight text-primary flex items-center space-x-2">
                  <Sparkles className="h-6 w-6 text-secondary dark:text-secondary shrink-0" />
                  <span>{latestAssessment ? latestAssessment.riskLevel : 'Unknown'}</span>
                </div>
                <p className="text-sm text-text-secondary">Your most recent burnout risk score from last assessment</p>
              </div>
            </div>
          </div>

          {/* New Card: Assessment Count */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group min-h-[180px]">
            <div className="flex flex-col h-full">
              <span className="text-sm text-text-secondary font-semibold tracking-tight mb-3 pb-1 border-b border-indigo-200 dark:border-indigo-500/30">Total Assessments</span>
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-display font-semibold tracking-tight text-text-primary">{analyticsSummary?.assessmentCount || 0}</span>
                </div>
                <p className="text-sm text-text-secondary">Complete assessments to receive personalized wellness insights</p>
              </div>
            </div>
          </div>
        </div>

        <Suspense fallback={<ChartSkeleton />}>
          <DashboardCharts
            trackerHistory={trackerHistory}
            recommendations={recommendations}
            isLoading={isLoading}
          />
        </Suspense>

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
                  <span className={`text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-md border ${
                    rec.priority === 'High' ? 'bg-error/10 text-error border-error/20' :
                    rec.priority === 'Medium' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' :
                    'bg-slate-100 dark:bg-[#334155] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#334155]'
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
