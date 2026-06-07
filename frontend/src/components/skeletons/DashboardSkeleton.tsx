import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarSkeleton } from './SidebarSkeleton';
import { ChartSkeleton } from './ChartSkeleton';
import { CardSkeleton } from './CardSkeleton';

const AnalyticsCardSkeleton = memo(function AnalyticsCardSkeleton({
  tall = false,
}: {
  tall?: boolean;
}) {
  return (
    <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col justify-between min-h-[140px]">
      <Skeleton className="h-3 w-24" />
      <div className={tall ? 'py-3 space-y-3' : 'py-2 space-y-2'}>
        {tall ? (
          <div className="flex items-center space-x-5">
            <Skeleton className="h-20 w-20 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        ) : (
          <>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-40" />
          </>
        )}
      </div>
    </div>
  );
});

const RecommendationPreviewSkeleton = memo(function RecommendationPreviewSkeleton() {
  return (
    <div className="border border-border rounded-xl p-5 space-y-3 bg-surface-elevated/30 min-h-[120px]">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );
});

export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <SidebarSkeleton items={4} />

        <main className="flex-1 min-w-0 space-y-8 min-h-[500px]">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 pb-6 border-b border-border">
            <div className="space-y-2">
              <Skeleton className="h-8 w-56 max-w-full" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-9 w-36 rounded-xl" />
              <Skeleton className="h-9 w-36 rounded-xl" />
            </div>
          </div>

          {/* Analytics row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnalyticsCardSkeleton tall />
            <AnalyticsCardSkeleton />
            <AnalyticsCardSkeleton />
            <AnalyticsCardSkeleton />
          </div>

          {/* Charts section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartSkeleton className="lg:col-span-2" height="h-64" titleWidth="w-44" />
            <ChartSkeleton height="h-44" titleWidth="w-28" showLegend />
          </div>

          {/* Sleep & screen time charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartSkeleton height="h-56" titleWidth="w-32" />
            <ChartSkeleton height="h-56" titleWidth="w-40" />
          </div>

          {/* Recommendations preview */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-6">
            <div className="flex justify-between items-end pb-4 border-b border-border">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RecommendationPreviewSkeleton />
              <RecommendationPreviewSkeleton />
            </div>
          </div>

          {/* Recent activity placeholder */}
          <CardSkeleton lines={4} className="min-h-[160px]" />
        </main>
      </div>
    </div>
  );
});
