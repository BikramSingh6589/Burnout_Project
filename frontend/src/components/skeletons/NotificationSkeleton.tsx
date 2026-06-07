import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const NotificationItemSkeleton = memo(function NotificationItemSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-100 dark:border-[#334155] p-5 shadow-sm flex items-start gap-4 min-h-[88px]">
      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center space-x-2.5">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="flex items-center space-x-1 shrink-0">
        <Skeleton className="h-7 w-7 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>
    </div>
  );
});

export const NotificationSkeleton = memo(function NotificationSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[500px]">
      <div className="pb-4 border-b border-slate-200 dark:border-[#334155] flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-3 w-72 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-slate-100 dark:border-[#334155]">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-lg shrink-0" />
        ))}
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <NotificationItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
});
