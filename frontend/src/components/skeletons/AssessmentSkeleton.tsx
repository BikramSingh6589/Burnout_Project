import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SliderFieldSkeleton = memo(function SliderFieldSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-10" />
      </div>
      <Skeleton className="h-2 w-full rounded-lg" />
    </div>
  );
});

export const AssessmentSkeleton = memo(function AssessmentSkeleton() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-[500px]">
      <div className="bg-surface rounded-2xl border border-border shadow-level2 p-8 space-y-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-7 w-64 max-w-full" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>

        <div className="space-y-5">
          <Skeleton className="h-4 w-40" />
          <SliderFieldSkeleton />
          <SliderFieldSkeleton />
          <SliderFieldSkeleton />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
});
