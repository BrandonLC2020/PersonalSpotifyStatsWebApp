import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart
} from './TypedRecharts';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { GroupedRecords, Track } from '../../../types';
import { computeExplicitRatio } from '../../../utils/analyticsUtils';
import { getChartStyles, getTooltipStyle } from '../../../utils/chartTheme';

interface Props {
  tracks: GroupedRecords<Track>[];
}

const ExplicitContentChart: React.FC<Props> = ({ tracks }) => {
  const theme = useTheme();
  const mode = theme.palette.mode as 'light' | 'dark';
  const styles = getChartStyles(mode);
  const tooltipStyles = getTooltipStyle(mode);

  const data = useMemo(() => computeExplicitRatio(tracks), [tracks]);

  if (data.length === 0) {
    return <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>No explicit data available</Box>;
  }

  return (
    <Box>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={styles.gridColor} />
          <XAxis
            dataKey="month"
            tick={{ fill: styles.axisColor, fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            yAxisId="counts"
            tick={{ fill: styles.axisColor, fontSize: 12 }}
            label={{
              value: 'Track Count',
              angle: -90,
              position: 'insideLeft',
              fill: styles.axisColor,
              fontSize: 12,
            }}
          />
          <YAxis
            yAxisId="percent"
            orientation="right"
            domain={[0, 100]}
            tick={{ fill: '#FF9800', fontSize: 12 }}
            tickFormatter={(v: number) => `${v}%`}
            label={{
              value: 'Explicit %',
              angle: 90,
              position: 'insideRight',
              fill: '#FF9800',
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={tooltipStyles.contentStyle}
            labelStyle={tooltipStyles.labelStyle}
            formatter={(value: number, name: string) => {
              if (name === 'Explicit %') return [`${value}%`, name];
              return [value, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <Bar
            yAxisId="counts"
            dataKey="explicit"
            stackId="a"
            fill="#E91E63"
            name="Explicit"
            radius={[0, 0, 0, 0]}
            opacity={0.85}
          />
          <Bar
            yAxisId="counts"
            dataKey="clean"
            stackId="a"
            fill="#42A5F5"
            name="Clean"
            radius={[4, 4, 0, 0]}
            opacity={0.85}
          />
          <Line
            yAxisId="percent"
            type="monotone"
            dataKey="explicitPercent"
            stroke="#FF9800"
            strokeWidth={2.5}
            name="Explicit %"
            dot={{ r: 3, fill: '#FF9800' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ExplicitContentChart;
