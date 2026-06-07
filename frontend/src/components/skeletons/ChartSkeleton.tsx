import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ChartSkeletonProps {
  className?: string;
  height?: string;
  titleWidth?: string;
  showLegend?: boolean;
}

export const ChartSkeleton = memo(function ChartSkeleton({
  className,
  height = 'h-64',
  titleWidth = 'w-40',
  showLegend = false,
}: ChartSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-6',
        className
      )}
    >
      <div className="flex justify-between items-end pb-4 border-b border-border">
        <Skeleton className={cn('h-4', titleWidth)} />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className={cn(height, 'relative w-full')}>
        <Skeleton className="absolute inset-0 rounded-xl" />
        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-2 w-6" />
          ))}
        </div>
      </div>
      {showLegend && (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
              <Skeleton className="h-3 flex-1" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
