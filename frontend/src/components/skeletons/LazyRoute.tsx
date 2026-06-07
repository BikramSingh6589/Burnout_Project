import { Suspense, memo, type ReactNode } from 'react';

interface LazyRouteProps {
  fallback: ReactNode;
  children: ReactNode;
}

export const LazyRoute = memo(function LazyRoute({
  fallback,
  children,
}: LazyRouteProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
});
