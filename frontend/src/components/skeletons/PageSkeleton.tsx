import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const PageSkeleton = memo(function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[500px]">
      <div className="space-y-3 pb-6 border-b border-border">
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-4"
          >
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
});
