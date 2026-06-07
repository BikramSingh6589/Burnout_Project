import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarSkeleton } from './SidebarSkeleton';

const RecommendationCardSkeleton = memo(function RecommendationCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl border border-slate-100 dark:border-[#334155] p-6 shadow-sm min-h-[140px]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center space-x-2.5">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-3/4 max-w-sm" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <Skeleton className="h-9 w-40 rounded-lg shrink-0" />
      </div>
    </div>
  );
});

export const RecommendationSkeleton = memo(function RecommendationSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <SidebarSkeleton items={4} />

        <main className="flex-1 min-w-0 space-y-8 min-h-[500px]">
          <div className="pb-4 border-b border-slate-100 dark:border-[#334155] space-y-2">
            <Skeleton className="h-7 w-72 max-w-full" />
            <Skeleton className="h-3 w-96 max-w-full" />
          </div>

          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <RecommendationCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
});
