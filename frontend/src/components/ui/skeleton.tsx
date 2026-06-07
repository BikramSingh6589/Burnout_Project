import * as React from 'react';
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-200 dark:bg-slate-700/80',
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Skeleton };
