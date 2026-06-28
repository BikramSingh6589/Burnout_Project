import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useStore } from '../store/useStore';
import { DashboardLayout } from '../components/DashboardLayout';
import { Calendar, Filter } from 'lucide-react';
import { ChartSkeleton } from '../components/skeletons';

const HistoryTrendsCharts = lazy(() =>
  import('../components/HistoryTrendsCharts').then((m) => ({ default: m.HistoryTrendsCharts }))
);

const formatDDMM = (timestamp: number) => {
  const dt = new Date(timestamp);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
};

const formatAssessmentTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const HistoryTrends: React.FC = () => {
  const { trackerHistory, fetchTrackerHistory, analyticsSummary, fetchAnalytics, trackerHistoryLoading, analyticsLoading } = useStore();

  const isLoading = trackerHistoryLoading || analyticsLoading;

  useEffect(() => {
    fetchTrackerHistory();
    fetchAnalytics();
  }, [fetchTrackerHistory, fetchAnalytics]);

  const [filterDays, setFilterDays] = useState<7 | 30 | 90>(7);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter tracker data based on selection
  const getFilteredData = () => {
    let data = [...trackerHistory];

    data.sort((a, b) => a.timestamp - b.timestamp);

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      return data.filter(item => item.timestamp >= start && item.timestamp <= end);
    }

    return data.slice(-filterDays);
  };

  const filteredData = useMemo(() => getFilteredData(), [trackerHistory, filterDays, startDate, endDate]);

  const formattedChartData = useMemo(() => filteredData.map((item, index) => ({
    ...item,
    index,
    dateLabel: formatDDMM(item.timestamp),
    hoverTimeLabel: formatAssessmentTime(item.timestamp),
    satisfaction: 10 - item.procrastination,
  })), [filteredData]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header Block */}
        <div className="space-y-4 pb-4 border-b border-slate-100 dark:border-[#334155]">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="lg:flex-1">
              <h2 className="text-xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC]">History & Wellness Trends</h2>
              <p className="text-xs text-neutral-outline dark:text-[#CBD5E1]">Monitor progress trends and behavior correlations</p>
            </div>

            {/* Backend Analytics Cards */}
            <div className="flex flex-wrap gap-4 lg:ml-auto lg:mr-6 xl:mr-10">
              {analyticsSummary?.currentTrend && (
                <div className="bg-white/80 dark:bg-[#1E293B]/80 px-4 py-2 rounded-xl border border-slate-200 dark:border-[#334155] shadow-sm">
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider block">Overall Trend</span>
                  <span className={`font-semibold text-sm ${
                    analyticsSummary.currentTrend === 'IMPROVING' ? 'text-success' : 
                    analyticsSummary.currentTrend === 'WORSENING' ? 'text-error' : 'text-primary'
                  }`}>
                    {analyticsSummary.currentTrend}
                  </span>
                </div>
              )}
              
              {analyticsSummary?.baselineComparison && (
                <div className="bg-white/80 dark:bg-[#1E293B]/80 px-4 py-2 rounded-xl border border-slate-200 dark:border-[#334155] shadow-sm">
                  <span className="text-[10px] text-text-secondary uppercase tracking-wider block">Baseline Shift</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold text-sm ${
                      analyticsSummary.baselineComparison.status === 'IMPROVED' ? 'text-success' : 
                      analyticsSummary.baselineComparison.status === 'WORSENED' ? 'text-error' : 'text-primary'
                    }`}>
                      {analyticsSummary.baselineComparison.status}
                    </span>
                    <span className="text-xs text-text-secondary">
                      ({analyticsSummary.baselineComparison.difference > 0 ? '+' : ''}{analyticsSummary.baselineComparison.difference} pts)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Custom Date Range Picker */}
          <div className="bg-white/50 dark:bg-[#1E293B]/50 backdrop-blur-sm border border-slate-100 dark:border-[#334155] rounded-xl p-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4 min-w-0">
              <span className="text-xs font-bold text-neutral-slate dark:text-[#F8FAFC] flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-primary dark:text-[#4F46E5]" />
                Custom Range:
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-slate-200 dark:border-[#334155] rounded-lg px-2 py-1.5 bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] focus:outline-none focus:border-primary dark:focus:border-[#4F46E5]"
                />
                <span className="text-neutral-outline dark:text-[#CBD5E1]">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-slate-200 dark:border-[#334155] rounded-lg px-2 py-1.5 bg-white dark:bg-[#111827] text-neutral-slate dark:text-[#F8FAFC] focus:outline-none focus:border-primary dark:focus:border-[#4F46E5]"
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); setFilterDays(7); }}
                  className="text-xs text-error font-semibold hover:underline"
                >
                  Clear Custom Range
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center space-x-2 sm:ml-auto shrink-0">
              <Filter className="h-4 w-4 text-neutral-outline dark:text-[#CBD5E1] shrink-0" />
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-0.5 shadow-sm text-xs font-semibold">
                <button
                  onClick={() => { setFilterDays(7); setStartDate(''); setEndDate(''); }}
                  className={`px-3 py-1.5 rounded-md transition-all ${filterDays === 7 && !startDate ? 'bg-primary dark:bg-[#4F46E5] text-white shadow-sm' : 'text-neutral-slate/75 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#273449] dark:hover:text-[#F8FAFC]'}`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => { setFilterDays(30); setStartDate(''); setEndDate(''); }}
                  className={`px-3 py-1.5 rounded-md transition-all ${filterDays === 30 && !startDate ? 'bg-primary dark:bg-[#4F46E5] text-white shadow-sm' : 'text-neutral-slate/75 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#273449] dark:hover:text-[#F8FAFC]'}`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => { setFilterDays(90); setStartDate(''); setEndDate(''); }}
                  className={`px-3 py-1.5 rounded-md transition-all ${filterDays === 90 && !startDate ? 'bg-primary dark:bg-[#4F46E5] text-white shadow-sm' : 'text-neutral-slate/75 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#273449] dark:hover:text-[#F8FAFC]'}`}
                >
                  90 Days
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Graphs Grid */}
        <Suspense fallback={<ChartSkeleton />}>
          <HistoryTrendsCharts
            formattedChartData={formattedChartData}
            isLoading={isLoading}
          />
        </Suspense>

      </div>
    </DashboardLayout>
  );
};
