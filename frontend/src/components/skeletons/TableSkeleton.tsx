import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TableSkeletonProps {
  className?: string;
  rows?: number;
  columns?: number;
}

export const TableSkeleton = memo(function TableSkeleton({
  className,
  rows = 6,
  columns = 6,
}: TableSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#1E293B] rounded-2xl border border-border shadow-sm overflow-hidden',
        className
      )}
    >
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="bg-surface-elevated dark:bg-slate-800 border-b border-border p-4 flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-3 flex-1 min-w-[80px]" />
            ))}
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <div key={rowIndex} className="p-4 flex gap-4">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    className={cn(
                      'h-4 flex-1 min-w-[80px]',
                      colIndex === 0 && 'max-w-[120px]'
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
