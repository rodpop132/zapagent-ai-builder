
import { lazy, Suspense } from 'react';

// Lazy load dos componentes específicos do Recharts
const LazyLineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const LazyBarChart = lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
const LazyAreaChart = lazy(() => import('recharts').then(module => ({ default: module.AreaChart })));

interface LazyChartProps {
  type: 'line' | 'bar' | 'area';
  children: React.ReactNode;
  width?: number;
  height?: number;
  data?: any[];
}

const LazyChart = ({ type, children, ...props }: LazyChartProps) => {
  const ChartComponent = {
    line: LazyLineChart,
    bar: LazyBarChart,
    area: LazyAreaChart
  }[type];

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Carregando gráfico...</p>
        </div>
      </div>
    }>
      <ChartComponent {...props}>
        {children}
      </ChartComponent>
    </Suspense>
  );
};

export default LazyChart;
