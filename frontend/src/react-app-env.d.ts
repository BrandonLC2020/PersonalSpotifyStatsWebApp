/// <reference types="react-scripts" />

import type React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      css?: any;
    }
  }
}

// Fix Recharts components not being usable as JSX with React 18 types
declare module 'recharts' {
  export interface CategoricalChartProps {
    children?: React.ReactNode;
  }
  export const PolarAngleAxis: React.ComponentType<any>;
  export const PolarGrid: React.ComponentType<any>;
  export const PolarRadiusAxis: React.ComponentType<any>;
  export const Radar: React.ComponentType<any>;
  export const RadarChart: React.ComponentType<any>;
  export const ResponsiveContainer: React.ComponentType<any>;
  export const Tooltip: React.ComponentType<any>;
  export const Legend: React.ComponentType<any>;
  export const ScatterChart: React.ComponentType<any>;
  export const Scatter: React.ComponentType<any>;
  export const XAxis: React.ComponentType<any>;
  export const YAxis: React.ComponentType<any>;
  export const ZAxis: React.ComponentType<any>;
  export const CartesianGrid: React.ComponentType<any>;
  export const ReferenceLine: React.ComponentType<any>;
  export const AreaChart: React.ComponentType<any>;
  export const Area: React.ComponentType<any>;
  export const BarChart: React.ComponentType<any>;
  export const Bar: React.ComponentType<any>;
  export const LineChart: React.ComponentType<any>;
  export const Line: React.ComponentType<any>;
  export const PieChart: React.ComponentType<any>;
  export const Pie: React.ComponentType<any>;
  export const Cell: React.ComponentType<any>;
  export const ComposedChart: React.ComponentType<any>;
}
