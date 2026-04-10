import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from './TypedRecharts';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { GroupedRecords, Track } from '../../../types';
import { computeAvgDuration } from '../../../utils/analyticsUtils';
import { getChartStyles, getTooltipStyle, formatDuration } from '../../../utils/chartTheme';

interface Props {
  tracks: GroupedRecords<Track>[];
}

const TrackDurationChart: React.FC<Props> = ({ tracks }) => {
  const theme = useTheme();
  const mode = theme.palette.mode as 'light' | 'dark';
  const styles = getChartStyles(mode);
  const tooltipStyles = getTooltipStyle(mode);

  const data = useMemo(() => computeAvgDuration(tracks), [tracks]);

  const overallAvg = useMemo(() => {
    const validPoints = data.filter(d => d.avgDurationMs > 0);
    if (validPoints.length === 0) return 0;
    return validPoints.reduce((sum, d) => sum + d.avgDurationMs, 0) / validPoints.length;
  }, [data]);

  if (data.length === 0) {
    return <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>No duration data available</Box>;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <Box sx={{
        ...tooltipStyles.contentStyle,
        p: 1.5,
      }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{label}</Typography>
        <Typography variant="body2">
          Avg Duration: <strong>{d.avgDurationFormatted}</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {d.trackCount} tracks
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, gap: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">Overall Average</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {formatDuration(overallAvg)}
          </Typography>
        </Box>
      </Box>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1DB954" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#1DB954" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={styles.gridColor} />
          <XAxis
            dataKey="month"
            tick={{ fill: styles.axisColor, fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={(value: number) => formatDuration(value)}
            tick={{ fill: styles.axisColor, fontSize: 12 }}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={overallAvg}
            stroke="#FF9800"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            label={{
              value: `Avg: ${formatDuration(overallAvg)}`,
              fill: '#FF9800',
              fontSize: 11,
              position: 'right',
            }}
          />
          <Area
            type="monotone"
            dataKey="avgDurationMs"
            stroke="#1DB954"
            strokeWidth={2.5}
            fill="url(#durationGradient)"
            dot={{ r: 4, fill: '#1DB954', strokeWidth: 1, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default TrackDurationChart;
