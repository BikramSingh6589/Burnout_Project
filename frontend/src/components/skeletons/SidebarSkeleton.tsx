import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SidebarSkeletonProps {
  className?: string;
  items?: number;
  variant?: 'student' | 'admin';
}

export const SidebarSkeleton = memo(function SidebarSkeleton({
  className,
  items = 4,
  variant = 'student',
}: SidebarSkeletonProps) {
  if (variant === 'admin') {
    return (
      <aside
        className={cn(
          'w-full md:w-64 bg-white dark:bg-slate-900 flex flex-col shrink-0',
          className
        )}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2">
          <Skeleton className="h-6 w-6 rounded-md shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {Array.from({ length: items }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-full rounded-lg" />
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <Skeleton className="h-9 w-full rounded-lg" />
        </div>
      </aside>
    );
  }

  return (
    <aside className={cn('w-full md:w-64 shrink-0', className)}>
      <div className="bg-surface rounded-2xl border border-border p-3 flex flex-row md:flex-col gap-1.5 shadow-sm">
        {Array.from({ length: items }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full md:w-full min-w-[140px] rounded-xl" />
        ))}
      </div>
    </aside>
  );
});
