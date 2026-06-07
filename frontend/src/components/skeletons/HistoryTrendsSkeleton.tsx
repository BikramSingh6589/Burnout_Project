import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarSkeleton } from './SidebarSkeleton';
import { ChartSkeleton } from './ChartSkeleton';

export const HistoryTrendsSkeleton = memo(function HistoryTrendsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <SidebarSkeleton items={4} />

        <main className="flex-1 min-w-0 space-y-8 min-h-[500px]">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-[#334155]">
            <div className="space-y-2">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4 rounded shrink-0" />
              <div className="inline-flex rounded-lg border border-slate-200 dark:border-[#334155] p-0.5 gap-1">
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            </div>
          </div>

          <div className="bg-surface-low/30 dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155] rounded-xl p-4 flex flex-wrap gap-4 items-center shadow-sm min-h-[60px]">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-36 rounded-lg" />
            <Skeleton className="h-3 w-4" />
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartSkeleton height="h-56" titleWidth="w-36" />
            <ChartSkeleton height="h-56" titleWidth="w-44" />
            <ChartSkeleton height="h-56" titleWidth="w-48" />
            <ChartSkeleton height="h-56" titleWidth="w-36" />
          </div>
        </main>
      </div>
    </div>
  );
});
