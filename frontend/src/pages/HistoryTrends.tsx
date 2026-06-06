import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { DashboardLayout } from '../components/DashboardLayout';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, Legend } from 'recharts';
import { Calendar, Filter, Sparkles, TrendingUp } from 'lucide-react';

export const HistoryTrends: React.FC = () => {
  const { trackerHistory } = useStore();
  const [filterDays, setFilterDays] = useState<7 | 30 | 90>(30);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter tracker data based on selection
  const getFilteredData = () => {
    let data = [...trackerHistory];
    
    // Sort chronologically just in case
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (startDate && endDate) {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      return data.filter(item => {
        const itemTime = new Date(item.date).getTime();
        return itemTime >= start && itemTime <= end;
      });
    }

    return data.slice(-filterDays);
  };

  const filteredData = getFilteredData();

  const formattedChartData = filteredData.map(item => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    satisfaction: 10 - item.procrastination, // Mock satisfaction inversion for comparison
  }));

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-300">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-[#334155]">
          <div>
            <h2 className="text-xl font-display font-extrabold text-neutral-slate dark:text-[#F8FAFC]">History & Wellness Trends</h2>
            <p className="text-xs text-neutral-outline dark:text-[#CBD5E1]">Monitor progress trends and behavior correlations</p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-2">
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

        {/* Custom Date Range Picker */}
        <div className="bg-surface-low/30 dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155] rounded-xl p-4 flex flex-wrap gap-4 items-center shadow-sm">
          <span className="text-xs font-bold text-neutral-slate dark:text-[#F8FAFC] flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-primary dark:text-[#4F46E5]" />
            Custom Range:
          </span>
          <div className="flex items-center space-x-2 text-xs">
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
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBurnout" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#433FE5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#433FE5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dy={5} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dx={-5} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 8, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} cursor={{ stroke: '#433FE5', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="burnoutScore" stroke="#433FE5" strokeWidth={2} fillOpacity={1} fill="url(#colorBurnout)" name="Burnout" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
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
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dy={5} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dx={-5} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 8, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#CBD5E1' }} />
                  <Line type="monotone" dataKey="sleepHours" stroke="#5D5CFF" strokeWidth={2} name="Sleep Hours" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="stressLevel" stroke="#EF4444" strokeWidth={2} name="Stress Level" dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graph 3: Study Hours vs Screen Time */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-slate-100 dark:border-[#334155] shadow-sm hover:shadow-md dark:hover:shadow-xl transition-all space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-[#334155]">
              <h3 className="text-xs font-bold dark:text-[#F8FAFC]">Study Focus vs Digital Exposure</h3>
              <span className="text-[10px] text-neutral-outline dark:text-[#CBD5E1] font-semibold">Hours per Day</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dy={5} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dx={-5} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 8, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#CBD5E1' }} />
                  <Line type="monotone" dataKey="studyHours" stroke="#8127CF" strokeWidth={2} name="Study Hours" dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="screenTime" stroke="#9C48EA" strokeWidth={2} name="Screen Time" dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Graph 4: Procrastination Trend */}
          <div className="bg-white dark:bg-[#1E293B] p-5 rounded-xl border border-slate-100 dark:border-[#334155] shadow-sm hover:shadow-md dark:hover:shadow-xl transition-all space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-[#334155]">
              <h3 className="text-xs font-bold dark:text-[#F8FAFC]">Procrastination Factor</h3>
              <span className="text-[10px] text-neutral-outline dark:text-[#CBD5E1] font-semibold">Severity (1–10)</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProcr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                  <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dy={5} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10, fontWeight: 500, fill: '#CBD5E1' }} stroke="#334155" tickLine={false} axisLine={false} dx={-5} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 8, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} cursor={{ stroke: '#EF4444', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="procrastination" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorProcr)" name="Procrastination" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};
