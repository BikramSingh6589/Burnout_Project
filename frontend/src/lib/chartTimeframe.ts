import type { TrackerHistory } from '../store/useStore';

export type ChartTimeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const CHART_TIMEFRAME_OPTIONS: { value: ChartTimeframe; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export type ChartDataPoint = {
  id: string;
  index: number;
  dateLabel: string;
  hoverTimeLabel: string;
  timestamp: number;
  burnoutScore: number;
  sleepHours: number;
  screenTime: number;
  stressLevel: number;
};

type TrackerEntry = TrackerHistory & { id?: string };

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDDMM = (timestamp: number) => {
  const dt = new Date(timestamp);
  return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
};

const formatAssessmentTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const round1 = (value: number) => Math.round(value * 10) / 10;

const average = (values: number[]) => {
  if (values.length === 0) return 0;
  return round1(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const getSortedEntries = (history: TrackerEntry[]) =>
  [...history].sort((a, b) => a.timestamp - b.timestamp);

const toChartPoint = (
  entry: TrackerEntry,
  index: number,
  dateLabel: string,
  hoverTimeLabel: string,
  aggregates?: Partial<Pick<ChartDataPoint, 'burnoutScore' | 'sleepHours' | 'screenTime' | 'stressLevel'>>,
): ChartDataPoint => ({
  id: entry.id ?? `${entry.timestamp}-${index}`,
  index,
  dateLabel,
  hoverTimeLabel,
  timestamp: entry.timestamp,
  burnoutScore: aggregates?.burnoutScore ?? entry.burnoutScore,
  sleepHours: aggregates?.sleepHours ?? entry.sleepHours,
  screenTime: aggregates?.screenTime ?? entry.screenTime,
  stressLevel: aggregates?.stressLevel ?? entry.stressLevel,
});

const buildDailyData = (history: TrackerEntry[]): ChartDataPoint[] => {
  // Sort by timestamp descending to inspect the latest entries first
  const sortedDesc = [...history].sort((a, b) => b.timestamp - a.timestamp);

  // Slice only the latest 7 entries (or fewer if less than 7 are available)
  const latest7 = sortedDesc.slice(0, 7);

  // Reverse to restore chronological order (ascending time) for chart rendering
  const entries = latest7.reverse();

  return entries.map((entry, index) =>
    toChartPoint(entry, index, formatDDMM(entry.timestamp), formatAssessmentTime(entry.timestamp)),
  );
};

const getWeekStart = (date: Date) => {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
  weekStart.setDate(diff);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

const buildWeeklyData = (history: TrackerEntry[]): ChartDataPoint[] => {
  const sorted = getSortedEntries(history);
  if (sorted.length === 0) return [];

  const weekMap = new Map<number, TrackerEntry[]>();
  for (const entry of sorted) {
    const weekStart = getWeekStart(new Date(entry.timestamp)).getTime();
    const bucket = weekMap.get(weekStart) ?? [];
    bucket.push(entry);
    weekMap.set(weekStart, bucket);
  }

  const weekStarts = [...weekMap.keys()].sort((a, b) => a - b).slice(-4);

  return weekStarts.map((weekStart, index) => {
    const entries = weekMap.get(weekStart)!;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return toChartPoint(
      entries[entries.length - 1],
      index,
      `Week ${index + 1}`,
      `${formatDDMM(weekStart)} - ${formatDDMM(weekEnd.getTime())}`,
      {
        burnoutScore: average(entries.map((entry) => entry.burnoutScore)),
        sleepHours: average(entries.map((entry) => entry.sleepHours)),
        screenTime: average(entries.map((entry) => entry.screenTime)),
        stressLevel: average(entries.map((entry) => entry.stressLevel)),
      },
    );
  });
};

const buildMonthlyData = (history: TrackerEntry[]): ChartDataPoint[] => {
  const sorted = getSortedEntries(history);
  if (sorted.length === 0) return [];

  const monthMap = new Map<string, TrackerEntry[]>();
  for (const entry of sorted) {
    const date = new Date(entry.timestamp);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const bucket = monthMap.get(key) ?? [];
    bucket.push(entry);
    monthMap.set(key, bucket);
  }

  const monthKeys = [...monthMap.keys()].sort((a, b) => {
    const [yearA, monthA] = a.split('-').map(Number);
    const [yearB, monthB] = b.split('-').map(Number);
    return yearA - yearB || monthA - monthB;
  });

  return monthKeys.map((key, index) => {
    const [year, month] = key.split('-').map(Number);
    const entries = monthMap.get(key)!;

    return toChartPoint(
      entries[entries.length - 1],
      index,
      MONTH_LABELS[month],
      `${MONTH_LABELS[month]} ${year}`,
      {
        burnoutScore: average(entries.map((entry) => entry.burnoutScore)),
        sleepHours: average(entries.map((entry) => entry.sleepHours)),
        screenTime: average(entries.map((entry) => entry.screenTime)),
        stressLevel: average(entries.map((entry) => entry.stressLevel)),
      },
    );
  });
};

const buildYearlyData = (history: TrackerEntry[]): ChartDataPoint[] => {
  const sorted = getSortedEntries(history);
  if (sorted.length === 0) return [];

  const yearMap = new Map<number, TrackerEntry[]>();
  for (const entry of sorted) {
    const year = new Date(entry.timestamp).getFullYear();
    const bucket = yearMap.get(year) ?? [];
    bucket.push(entry);
    yearMap.set(year, bucket);
  }

  const years = [...yearMap.keys()].sort((a, b) => a - b);

  return years.map((year, index) => {
    const entries = yearMap.get(year)!;

    return toChartPoint(
      entries[entries.length - 1],
      index,
      String(year),
      String(year),
      {
        burnoutScore: average(entries.map((entry) => entry.burnoutScore)),
        sleepHours: average(entries.map((entry) => entry.sleepHours)),
        screenTime: average(entries.map((entry) => entry.screenTime)),
        stressLevel: average(entries.map((entry) => entry.stressLevel)),
      },
    );
  });
};

export const buildChartData = (
  history: TrackerEntry[],
  timeframe: ChartTimeframe,
): ChartDataPoint[] => {
  switch (timeframe) {
    case 'daily':
      return buildDailyData(history);
    case 'weekly':
      return buildWeeklyData(history);
    case 'monthly':
      return buildMonthlyData(history);
    case 'yearly':
      return buildYearlyData(history);
  }
};
