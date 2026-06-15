import React from 'react';
import { CHART_TIMEFRAME_OPTIONS, type ChartTimeframe } from '../lib/chartTimeframe';
import { cn } from '../lib/utils';

interface ChartTimeframeSelectProps {
  value: ChartTimeframe;
  onChange: (value: ChartTimeframe) => void;
  className?: string;
}

export const ChartTimeframeSelect: React.FC<ChartTimeframeSelectProps> = ({
  value,
  onChange,
  className,
}) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value as ChartTimeframe)}
    aria-label="Chart timeframe"
    className={cn(
      'text-xs font-medium text-text-secondary bg-surface border border-border rounded-lg px-2.5 py-1.5',
      'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40',
      'dark:bg-[#1E293B] dark:border-[#334155] dark:text-[#CBD5E1]',
      'cursor-pointer min-w-[5.75rem] shrink-0',
      className,
    )}
  >
    {CHART_TIMEFRAME_OPTIONS.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);
