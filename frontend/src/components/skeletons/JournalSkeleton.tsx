import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const JournalEntrySkeleton = memo(function JournalEntrySkeleton() {
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-100 dark:border-[#334155] p-5 shadow-sm space-y-3 min-h-[100px]">
      <div className="flex justify-between items-start">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
});

export const JournalSkeleton = memo(function JournalSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[500px]">
      <div className="pb-4 border-b border-slate-200 dark:border-[#334155] flex items-center space-x-3">
        <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 w-56 max-w-full" />
          <Skeleton className="h-3 w-80 max-w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-100 dark:border-[#334155] p-6 shadow-sm space-y-4 min-h-[280px]">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-36 w-full rounded-lg" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <Skeleton className="h-4 w-44" />
          <div className="space-y-4 max-h-[550px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <JournalEntrySkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
