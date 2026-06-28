import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Customized } from 'recharts';
import { Moon, Compass, Loader2, Info } from 'lucide-react';
import { ChartTimeframeSelect } from './ChartTimeframeSelect';
import { buildChartData, type ChartDataPoint, type ChartTimeframe } from '../lib/chartTimeframe';

const tooltipTimeLabel = (_: unknown, payload: readonly { payload?: { hoverTimeLabel?: string } }[]) =>
  payload?.[0]?.payload?.hoverTimeLabel ?? '';

type BarHoverTimeLabelProps = {
  hoveredIndex: number | null;
  data: ChartDataPoint[];
  valueKey: 'sleepHours' | 'screenTime';
  xAxisMap?: Record<string, { scale: (v: string) => number; bandSize?: number }>;
  yAxisMap?: Record<string, { scale: (v: number) => number }>;
  offset?: { left: number; top: number };
};

const BarHoverTimeLabel: React.FC<BarHoverTimeLabelProps> = ({
  hoveredIndex,
  data,
  valueKey,
  xAxisMap,
  yAxisMap,
  offset,
}) => {
  if (hoveredIndex === null || !xAxisMap || !yAxisMap || !offset) return null;

  const entry = data[hoveredIndex];
  if (!entry) return null;

  const xAxis = xAxisMap[Object.keys(xAxisMap)[0]];
  const yAxis = yAxisMap[Object.keys(yAxisMap)[0]];
  if (!xAxis?.scale || !yAxis?.scale) return null;

  const bandWidth = xAxis.bandSize ?? 0;
  const x = xAxis.scale(String(hoveredIndex)) + bandWidth / 2;
  const y = yAxis.scale(entry[valueKey]) - 6;

  return (
    <g pointerEvents="none">
      <text
        x={x + offset.left}
        y={y + offset.top}
        textAnchor="middle"
        fill="#CBD5E1"
        fontSize={11}
        fontWeight={500}
      >
        {entry.hoverTimeLabel}
      </text>
    </g>
  );
};

const GraphLoading = () => (
  <div className="flex items-center justify-center h-64 bg-surface-elevated/50 rounded-2xl border border-border">
    <div className="flex flex-col items-center">
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
      <p className="text-xs text-text-secondary">Loading...</p>
    </div>
  </div>
);

interface DashboardChartsProps {
  trackerHistory: any[];
  recommendations: any[];
  isLoading: boolean;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  trackerHistory,
  recommendations,
  isLoading,
}) => {
  const [sleepHoveredIndex, setSleepHoveredIndex] = useState<number | null>(null);
  const [screenHoveredIndex, setScreenHoveredIndex] = useState<number | null>(null);
  const [burnoutTimeframe, setBurnoutTimeframe] = useState<ChartTimeframe>('daily');
  const [sleepTimeframe, setSleepTimeframe] = useState<ChartTimeframe>('daily');
  const [screenTimeframe, setScreenTimeframe] = useState<ChartTimeframe>('daily');

  // Pie Chart Data: Recommendation Followed status
  const followStats = useMemo(() => {
    return recommendations.reduce(
      (acc, rec) => {
        if (rec.followedStatus === 'followed') acc.followed++;
        else if (rec.followedStatus === 'partially') acc.partially++;
        else if (rec.followedStatus === 'not') acc.not++;
        else acc.none++;
        return acc;
      },
      { followed: 0, partially: 0, not: 0, none: 0 }
    );
  }, [recommendations]);

  const pieData = useMemo(() => {
    return [
      { name: 'Followed', value: followStats.followed, color: '#10B981' },
      { name: 'Partially', value: followStats.partially, color: '#9C48EA' },
      { name: 'Not Followed', value: followStats.not, color: '#EF4444' },
      { name: 'No Feedback', value: followStats.none, color: '#C7C4D8' },
    ].filter(d => d.value > 0);
  }, [followStats]);

  // Fallback if no pie data has feedback yet
  const displayPieData = useMemo(() => {
    return pieData.length > 0 ? pieData : [
      { name: 'Pending Feedback', value: recommendations.length, color: '#C7C4D8' }
    ];
  }, [pieData, recommendations.length]);

  const burnoutChartData = useMemo(
    () => buildChartData(trackerHistory, burnoutTimeframe),
    [trackerHistory, burnoutTimeframe],
  );

  const sleepChartData = useMemo(
    () => buildChartData(trackerHistory, sleepTimeframe),
    [trackerHistory, sleepTimeframe],
  );

  const screenChartData = useMemo(
    () => buildChartData(trackerHistory, screenTimeframe),
    [trackerHistory, screenTimeframe],
  );

  return (
    <>
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Burnout Score Trend Area Chart (col-span-2) */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center gap-3 pb-4 border-b border-border">
            <h2 className="text-base font-semibold tracking-tight text-text-primary">Burnout score tracker</h2>
            <ChartTimeframeSelect value={burnoutTimeframe} onChange={setBurnoutTimeframe} />
          </div>
          {isLoading ? (
            <GraphLoading />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={burnoutChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBurnout" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                  <XAxis
                    dataKey="index"
                    type="category"
                    interval={0}
                    tickFormatter={(value) => burnoutChartData[Number(value)]?.dateLabel ?? ''}
                    tick={{ fontSize: 11, fontWeight: 500, fill: 'var(--axis-text-color)' }}
                    stroke="#334155"
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 500, fill: 'var(--axis-text-color)' }} stroke="#334155" tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip
                    labelFormatter={tooltipTimeLabel}
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
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: Recommendation Analytics Pie Chart */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-end pb-4 border-b border-border">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-semibold tracking-tight text-text-primary">Interventions</h3>
              <div className="relative group">
                <Info
                  className="h-4 w-4 text-text-secondary cursor-help"
                  aria-label="Interventions information"
                />
                <div className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-64 rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-xs font-medium leading-relaxed text-[#CBD5E1] opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                  Interventions are your personalized wellness recommendations.
                </div>
              </div>
            </div>
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
                >
                  {displayPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 12, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-display font-semibold tracking-tight text-text-primary">{recommendations.length}</span>
              <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider mt-0.5">Total</span>
            </div>
          </div>

          {/* Pie Legends */}
          <div className="grid grid-cols-2 gap-3 text-xs font-medium text-text-secondary mt-2">
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
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 space-y-6">
          <div className="flex justify-between items-center gap-3 pb-4 border-b border-border">
            <h3 className="text-base font-semibold tracking-tight flex items-center ">
              <Moon className="h-4 w-4 mr-2 text-indigo-500" />
              <span>Sleep Tracker</span>
            </h3>
            <ChartTimeframeSelect value={sleepTimeframe} onChange={setSleepTimeframe} />
          </div>
          {isLoading ? (
            <GraphLoading />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                  <XAxis
                    dataKey="index"
                    type="category"
                    interval={0}
                    tickFormatter={(value) => sleepChartData[Number(value)]?.dateLabel ?? ''}
                    tick={{ fontSize: 11, fontWeight: 500, fill: 'var(--axis-text-color)' }}
                    stroke="#334155"
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: 'var(--axis-text-color)' }} stroke="#334155" tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip labelFormatter={tooltipTimeLabel} contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 12, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} cursor={{ fill: 'rgba(93, 92, 255, 0.05)' }} />
                  <Customized
                    component={(props: any) => (
                      <BarHoverTimeLabel
                        {...props}
                        hoveredIndex={sleepHoveredIndex}
                        data={sleepChartData}
                        valueKey="sleepHours"
                      />
                    )}
                  />
                  <Bar
                    dataKey="sleepHours"
                    fill="#5D5CFF"
                    radius={[4, 4, 0, 0]}
                    name="Sleep Hours"
                    activeBar={false}
                    isAnimationActive={false}
                    onMouseEnter={(_, index) => setSleepHoveredIndex(index)}
                    onMouseLeave={() => setSleepHoveredIndex(null)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Screen Time Exposure */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 space-y-6">
          <div className="flex justify-between items-center gap-3 pb-4 border-b border-border">
            <h3 className="text-base font-semibold tracking-tight flex items-center ">
              <Compass className="h-4 w-4 mr-2 text-purple-500" />
              <span>Screen Time Exposure</span>
            </h3>
            <ChartTimeframeSelect value={screenTimeframe} onChange={setScreenTimeframe} />
          </div>
          {isLoading ? (
            <GraphLoading />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={screenChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/10" opacity={0.5} />
                  <XAxis
                    dataKey="index"
                    type="category"
                    interval={0}
                    tickFormatter={(value) => screenChartData[Number(value)]?.dateLabel ?? ''}
                    tick={{ fontSize: 11, fontWeight: 500, fill: 'var(--axis-text-color)' }}
                    stroke="#334155"
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: 'var(--axis-text-color)' }} stroke="#334155" tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip labelFormatter={tooltipTimeLabel} contentStyle={{ backgroundColor: '#1E293B', color: '#F8FAFC', fontSize: 12, borderRadius: 12, border: '1px solid #334155', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }} cursor={{ fill: 'rgba(129, 39, 207, 0.05)' }} />
                  <Customized
                    component={(props: any) => (
                      <BarHoverTimeLabel
                        {...props}
                        hoveredIndex={screenHoveredIndex}
                        data={screenChartData}
                        valueKey="screenTime"
                      />
                    )}
                  />
                  <Bar
                    dataKey="screenTime"
                    fill="#8127CF"
                    radius={[4, 4, 0, 0]}
                    name="Screen Hours"
                    activeBar={false}
                    isAnimationActive={false}
                    onMouseEnter={(_, index) => setScreenHoveredIndex(index)}
                    onMouseLeave={() => setScreenHoveredIndex(null)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
