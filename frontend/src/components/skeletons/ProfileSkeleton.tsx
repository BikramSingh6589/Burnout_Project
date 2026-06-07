import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarSkeleton } from './SidebarSkeleton';

const FormFieldSkeleton = memo(function FormFieldSkeleton({
  fullWidth = false,
}: {
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? 'space-y-1.5 col-span-2' : 'space-y-1.5'}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  );
});

export const ProfileSkeleton = memo(function ProfileSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        <SidebarSkeleton items={4} />

        <main className="flex-1 min-w-0 space-y-8 min-h-[500px]">
          <div className="pb-4 border-b border-slate-100 dark:border-[#334155] space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-3 w-80 max-w-full" />
          </div>

          <div className="flex items-center gap-4 pb-2">
            <Skeleton className="h-16 w-16 rounded-full shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-52" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-slate-100 dark:border-[#334155] shadow-sm space-y-4 min-h-[420px]">
              <Skeleton className="h-4 w-40 pb-2" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormFieldSkeleton />
                <FormFieldSkeleton />
                <FormFieldSkeleton fullWidth />
                <FormFieldSkeleton />
                <FormFieldSkeleton />
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-[#334155] space-y-3">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-[#334155]">
                <Skeleton className="h-9 w-32 rounded-lg" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1E293B] p-6 rounded-xl border border-slate-100 dark:border-[#334155] shadow-sm space-y-4 min-h-[280px]">
                <Skeleton className="h-4 w-32" />
                <FormFieldSkeleton fullWidth />
                <FormFieldSkeleton fullWidth />
                <FormFieldSkeleton fullWidth />
                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-[#334155]">
                  <Skeleton className="h-9 w-44 rounded-lg" />
                </div>
              </div>
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
});
