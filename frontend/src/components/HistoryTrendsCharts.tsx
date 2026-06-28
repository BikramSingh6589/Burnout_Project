import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, Legend } from 'recharts';
import { TrendingUp, Sparkles, Loader2 } from 'lucide-react';

const tooltipTimeLabel = (_: unknown, payload: readonly { payload?: { hoverTimeLabel?: string } }[]) =>
  payload?.[0]?.payload?.hoverTimeLabel ?? '';

const EmptyState = () => (
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

interface HistoryTrendsChartsProps {
  formattedChartData: any[];
  isLoading: boolean;
}

export const HistoryTrendsCharts: React.FC<HistoryTrendsChartsProps> = ({
  formattedChartData,
  isLoading,
}) => {
  return (
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
              <AreaChart data={formattedChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }} >
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
                  tick={{ fontSize: 10, fontWeight: 500, fill: 'var(--axis-text-color)' }}
                  stroke="#334155"
                  tickLine={false}
                  axisLine={false}
                  dy={5}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fontWeight: 500, fill: 'var(--axis-text-color)' }} stroke="#334155" tickLine={false} axisLine={false} dx={-5} />
                <Tooltip labelFormatter={tooltipTimeLabel} contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 8, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} cursor={{ stroke: '#433FE5', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="burnoutScore" stroke="#433FE5" strokeWidth={2} fillOpacity={1} fill="url(#colorBurnout)" activeDot={false} name="Burnout" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState />
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
              <LineChart data={formattedChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }} >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                <XAxis
                  dataKey="index"
                  type="category"
                  interval={0}
                  tickFormatter={(value) => formattedChartData[Number(value)]?.dateLabel ?? ''}
                  tick={{ fontSize: 10, fontWeight: 500, fill: 'var(--axis-text-color)' }}
                  stroke="#334155"
                  tickLine={false}
                  axisLine={false}
                  dy={5}
                />
                <YAxis tick={{ fontSize: 10, fontWeight: 500, fill: 'var(--axis-text-color)' }} stroke="#334155" tickLine={false} axisLine={false} dx={-5} />
                <Tooltip labelFormatter={tooltipTimeLabel} contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 8, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#CBD5E1' }} />
                <Line type="monotone" dataKey="sleepHours" stroke="#5D5CFF" strokeWidth={2} name="Sleep Hours" dot={{ r: 2 }} activeDot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="stressLevel" stroke="#EF4444" strokeWidth={2} name="Stress Level" dot={{ r: 2 }} activeDot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState />
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
              <LineChart data={formattedChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }} >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                <XAxis
                  dataKey="index"
                  type="category"
                  interval={0}
                  tickFormatter={(value) => formattedChartData[Number(value)]?.dateLabel ?? ''}
                  tick={{ fontSize: 10, fontWeight: 500, fill: 'var(--axis-text-color)' }}
                  stroke="#334155"
                  tickLine={false}
                  axisLine={false}
                  dy={5}
                />
                <YAxis tick={{ fontSize: 10, fontWeight: 500, fill: 'var(--axis-text-color)' }} stroke="#334155" tickLine={false} axisLine={false} dx={-5} />
                <Tooltip labelFormatter={tooltipTimeLabel} contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 8, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#CBD5E1' }} />
                <Line type="monotone" dataKey="studyHours" stroke="#10B981" strokeWidth={2} name="Study Hours" dot={{ r: 2 }} activeDot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="screenTime" stroke="#F59E0B" strokeWidth={2} name="Screen Time" dot={{ r: 2 }} activeDot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState />
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
              <AreaChart data={formattedChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }} >
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
                  tick={{ fontSize: 10, fontWeight: 500, fill: 'var(--axis-text-color)' }}
                  stroke="#334155"
                  tickLine={false}
                  axisLine={false}
                  dy={5}
                />
                <YAxis domain={[0, 10]} tick={{ fontSize: 10, fontWeight: 500, fill: 'var(--axis-text-color)' }} stroke="#334155" tickLine={false} axisLine={false} dx={-5} />
                <Tooltip labelFormatter={tooltipTimeLabel} contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 8, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} cursor={{ stroke: '#EF4444', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="procrastination" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorProcr)" activeDot={false} name="Procrastination" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

    </div>
  );
};
