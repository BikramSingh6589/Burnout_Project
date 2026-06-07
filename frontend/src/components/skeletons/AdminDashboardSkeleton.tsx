import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarSkeleton } from './SidebarSkeleton';
import { TableSkeleton } from './TableSkeleton';
import { CardSkeleton } from './CardSkeleton';

const HighRiskCardSkeleton = memo(function HighRiskCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#3f1f1f] p-6 rounded-2xl border border-error/20 shadow-sm space-y-4 min-h-[180px]">
      <div className="flex justify-between items-start">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 dark:border-slate-700">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>
    </div>
  );
});

export const AdminDashboardSkeleton = memo(function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col md:flex-row">
      <SidebarSkeleton variant="admin" items={6} />

      <main className="flex-1 p-6 md:p-10 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto flex justify-end mb-6">
          <Skeleton className="h-9 w-36 rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          <Skeleton className="h-7 w-48" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-100 dark:border-[#334155] shadow-sm space-y-2 min-h-[120px]"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-5 w-5 rounded" />
                </div>
                <Skeleton className="h-9 w-16" />
                <Skeleton className="h-2.5 w-36" />
              </div>
            ))}
          </div>

          <CardSkeleton lines={5} className="min-h-[200px]" />

          <TableSkeleton rows={5} columns={8} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HighRiskCardSkeleton />
            <HighRiskCardSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
});
