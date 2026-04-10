import * as Recharts from 'recharts';

/**
 * React 18 + Recharts v2 type compatibility helper.
 * Recharts components return React.ReactNode, but React 18 expects JSX.Element? for components.
 * This file exports casted versions of common Recharts components to bypass the TS2786 error.
 */

// @ts-ignore
export const Area = Recharts.Area as any;
// @ts-ignore
export const AreaChart = Recharts.AreaChart as any;
// @ts-ignore
export const Bar = Recharts.Bar as any;
// @ts-ignore
export const BarChart = Recharts.BarChart as any;
// @ts-ignore
export const CartesianGrid = Recharts.CartesianGrid as any;
// @ts-ignore
export const Cell = Recharts.Cell as any;
// @ts-ignore
export const Legend = Recharts.Legend as any;
// @ts-ignore
export const Line = Recharts.Line as any;
// @ts-ignore
export const LineChart = Recharts.LineChart as any;
// @ts-ignore
export const PolarAngleAxis = Recharts.PolarAngleAxis as any;
// @ts-ignore
export const PolarGrid = Recharts.PolarGrid as any;
// @ts-ignore
export const PolarRadiusAxis = Recharts.PolarRadiusAxis as any;
// @ts-ignore
export const Radar = Recharts.Radar as any;
// @ts-ignore
export const RadarChart = Recharts.RadarChart as any;
// @ts-ignore
export const ReferenceLine = Recharts.ReferenceLine as any;
// @ts-ignore
export const ResponsiveContainer = Recharts.ResponsiveContainer as any;
// @ts-ignore
export const Scatter = Recharts.Scatter as any;
// @ts-ignore
export const ScatterChart = Recharts.ScatterChart as any;
// @ts-ignore
export const Tooltip = Recharts.Tooltip as any;
// @ts-ignore
export const XAxis = Recharts.XAxis as any;
// @ts-ignore
export const YAxis = Recharts.YAxis as any;
// @ts-ignore
export const ZAxis = Recharts.ZAxis as any;
// @ts-ignore
export const Pie = Recharts.Pie as any;
// @ts-ignore
export const PieChart = Recharts.PieChart as any;
// @ts-ignore
export const ComposedChart = Recharts.ComposedChart as any;
// @ts-ignore
export const Rectangle = Recharts.Rectangle as any;
