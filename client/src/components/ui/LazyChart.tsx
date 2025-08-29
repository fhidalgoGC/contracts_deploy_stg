import { lazy, Suspense } from 'react';

// Lazy load the chart component to reduce bundle size
const ChartComponent = lazy(() => import('./chart').then(module => ({
  default: module.ChartContainer
})));

const ChartLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  </div>
);

interface LazyChartProps {
  children: React.ReactNode;
  [key: string]: any;
}

export function LazyChart({ children, ...props }: LazyChartProps) {
  return (
    <Suspense fallback={<ChartLoader />}>
      <ChartComponent {...props}>
        {children}
      </ChartComponent>
    </Suspense>
  );
}