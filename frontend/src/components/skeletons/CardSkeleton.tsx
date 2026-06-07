import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface CardSkeletonProps {
  className?: string;
  lines?: number;
  showHeader?: boolean;
}

export const CardSkeleton = memo(function CardSkeleton({
  className,
  lines = 2,
  showHeader = true,
}: CardSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-4',
        className
      )}
    >
      {showHeader && <Skeleton className="h-3 w-24" />}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
          />
        ))}
      </div>
    </div>
  );
});
