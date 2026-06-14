import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { DashboardLayout } from '../components/DashboardLayout';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, Legend } from 'recharts';
import { Calendar, Filter, Sparkles, TrendingUp, Loader2 } from 'lucide-react';

const formatDDMM = (timestamp: number) => {
  const dt = new Date(timestamp);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
};

const formatAssessmentTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const tooltipTimeLabel = (_: unknown, payload: readonly { payload?: { hoverTimeLabel?: string } }[]) =>
  payload?.[0]?.payload?.hoverTimeLabel ?? '';

export const HistoryTrends: React.FC = () => {
  const { trackerHistory, fetchTrackerHistory, analyticsSummary, fetchAnalytics, trackerHistoryLoading, analyticsLoading } = useStore();

  const isLoading = trackerHistoryLoading || analyticsLoading;

  useEffect(() => {
    fetchTrackerHistory();
    fetchAnalytics();
  }, [fetchTrackerHistory, fetchAnalytics]);

  const [filterDays, setFilterDays] = useState<7 | 30 | 90>(30);
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

  const filteredData = getFilteredData();

  const formattedChartData = filteredData.map((item, index) => ({
    ...item,
    index,
    dateLabel: formatDDMM(item.timestamp),
    hoverTimeLabel: formatAssessmentTime(item.timestamp),
    satisfaction: 10 - item.procrastination,
  }));

  const EmptyState = ({ title }: { title: string }) => (
    <div className="flex items-center justify-center h-56 bg-white/50 dark:bg-[#1E293B]/50 backdrop-blur-sm rounded-xl border border-slate-100 dark:border-[#334155]">
      <div className="text-center">
        <p className="text-sm text-neutral-outline dark:text-[#CBD5E1] font-medium mb-1">No assessment is taken</p>
        <p className="text-xs text-neutral-outline dark:text-[#CBD5E1]/70">during this period</p>
      </div>
    </div>
  );

  const GraphLoading = () => (
    <div className="flex items-center justify-center h-56 bg-white/50 dark:bg-[#1E293B]/50 backdrop-blur-sm rounded-xl border border-slate-100 dark:border-[#334155]">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
        <p className="text-xs text-neutral-outline dark:text-[#CBD5E1]">Loading...</p>
      </div>
    </div>
  );

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
                  onClick={() => { setStartDate(''); setEndDate(''); setFilterDays(30); }}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Graph 1: Burnout Index Trend */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-slate-100 dark:border-[#334155] shadow-sm hover:shadow-md dark:hover:shadow-xl transition-all space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-[#334155]">
              <h3 className="text-xs font-bold flex items-center dark:text-[#F8FAFC]">
                <TrendingUp className="h-4 w-4 mr-1 text-primary dark:text-[#4F46E5]" />
                <span>Burnout Index Trend</span>
              </h3>
              <span className="text-[10px] text-neutral-outline dark:text-[#CBD5E1] font-semibold">Scale (0–100)</span>
            </div>
            {isLoading ? (
              <GraphLoading />
            ) : formattedChartData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }} isAnimationActive={true} animationDuration={800} animationEasing="ease-out">
                    <defs>
                      <linearGradient id="colorBurnout" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#433FE5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#433FE5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                    <XAxis
                      dataKey="index"
                      type="category"
                      interval={0}
                      tickFormatter={(value) => formattedChartData[Number(value)]?.dateLabel ?? ''}
                      tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }}
                      stroke="#334155"
                      tickLine={false}
                      axisLine={false}
                      dy={5}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dx={-5} />
                    <Tooltip labelFormatter={tooltipTimeLabel} contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 8, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} cursor={{ stroke: '#433FE5', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="burnoutScore" stroke="#433FE5" strokeWidth={2} fillOpacity={1} fill="url(#colorBurnout)" activeDot={false} name="Burnout" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="Burnout Index Trend" />
            )}
          </div>

          {/* Graph 2: Sleep & Stress Correlation */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-slate-100 dark:border-[#334155] shadow-sm hover:shadow-md dark:hover:shadow-xl transition-all space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-[#334155]">
              <h3 className="text-xs font-bold flex items-center dark:text-[#F8FAFC]">
                <Sparkles className="h-4 w-4 mr-1 text-secondary dark:text-secondary" />
                <span>Sleep vs Stress Correlation</span>
              </h3>
              <span className="text-[10px] text-neutral-outline dark:text-[#CBD5E1] font-semibold">Dual Metric Analysis</span>
            </div>
            {isLoading ? (
              <GraphLoading />
            ) : formattedChartData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }} isAnimationActive={true} animationDuration={800} animationEasing="ease-out">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                    <XAxis
                      dataKey="index"
                      type="category"
                      interval={0}
                      tickFormatter={(value) => formattedChartData[Number(value)]?.dateLabel ?? ''}
                      tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }}
                      stroke="#334155"
                      tickLine={false}
                      axisLine={false}
                      dy={5}
                    />
                    <YAxis tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dx={-5} />
                    <Tooltip labelFormatter={tooltipTimeLabel} contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 8, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#CBD5E1' }} />
                    <Line type="monotone" dataKey="sleepHours" stroke="#5D5CFF" strokeWidth={2} name="Sleep Hours" dot={{ r: 2 }} activeDot={false} />
                    <Line type="monotone" dataKey="stressLevel" stroke="#EF4444" strokeWidth={2} name="Stress Level" dot={{ r: 2 }} activeDot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="Sleep & Stress Correlation" />
            )}
          </div>

          {/* Graph 3: Study Hours vs Screen Time */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-slate-100 dark:border-[#334155] shadow-sm hover:shadow-md dark:hover:shadow-xl transition-all space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-[#334155]">
              <h3 className="text-xs font-bold dark:text-[#F8FAFC]">Study Focus vs Digital Exposure</h3>
              <span className="text-[10px] text-neutral-outline dark:text-[#CBD5E1] font-semibold">Hours per Day</span>
            </div>
            {isLoading ? (
              <GraphLoading />
            ) : formattedChartData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }} isAnimationActive={true} animationDuration={800} animationEasing="ease-out">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                    <XAxis
                      dataKey="index"
                      type="category"
                      interval={0}
                      tickFormatter={(value) => formattedChartData[Number(value)]?.dateLabel ?? ''}
                      tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }}
                      stroke="#334155"
                      tickLine={false}
                      axisLine={false}
                      dy={5}
                    />
                    <YAxis tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dx={-5} />
                    <Tooltip labelFormatter={tooltipTimeLabel} contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 8, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#CBD5E1' }} />
                    <Line type="monotone" dataKey="studyHours" stroke="#10B981" strokeWidth={2} name="Study Hours" dot={{ r: 2 }} activeDot={false} />
                    <Line type="monotone" dataKey="screenTime" stroke="#F59E0B" strokeWidth={2} name="Screen Time" dot={{ r: 2 }} activeDot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="Study Focus vs Digital Exposure" />
            )}
          </div>

          {/* Graph 4: Procrastination Trend */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-slate-100 dark:border-[#334155] shadow-sm hover:shadow-md dark:hover:shadow-xl transition-all space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-[#334155]">
              <h3 className="text-xs font-bold dark:text-[#F8FAFC]">Procrastination Factor</h3>
              <span className="text-[10px] text-neutral-outline dark:text-[#CBD5E1] font-semibold">Severity (1–10)</span>
            </div>
            {isLoading ? (
              <GraphLoading />
            ) : formattedChartData.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formattedChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }} isAnimationActive={true} animationDuration={800} animationEasing="ease-out">
                    <defs>
                      <linearGradient id="colorProcr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                    <XAxis
                      dataKey="index"
                      type="category"
                      interval={0}
                      tickFormatter={(value) => formattedChartData[Number(value)]?.dateLabel ?? ''}
                      tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }}
                      stroke="#334155"
                      tickLine={false}
                      axisLine={false}
                      dy={5}
                    />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dx={-5} />
                    <Tooltip labelFormatter={tooltipTimeLabel} contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 8, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} cursor={{ stroke: '#EF4444', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="procrastination" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorProcr)" activeDot={false} name="Procrastination" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="Procrastination Factor" />
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};
