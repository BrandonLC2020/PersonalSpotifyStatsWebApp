import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart
} from './TypedRecharts';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { GroupedRecords, Artist } from '../../../types';
import { computeGenreTimeline, computeGenreDiversity } from '../../../utils/analyticsUtils';
import { CHART_COLORS, getChartStyles, getTooltipStyle } from '../../../utils/chartTheme';

interface Props {
  artists: GroupedRecords<Artist>[];
}

const GenreDiversityChart: React.FC<Props> = ({ artists }) => {
  const theme = useTheme();
  const mode = theme.palette.mode as 'light' | 'dark';
  const styles = getChartStyles(mode);
  const tooltipStyles = getTooltipStyle(mode);

  const { data, genres } = useMemo(() => computeGenreTimeline(artists), [artists]);

  const diversityData = useMemo(() => computeGenreDiversity(artists), [artists]);

  // Merge diversity data into genre data
  const mergedData = useMemo(() =>
    data.map((point, i) => ({
      ...point,
      diversity: diversityData[i]?.diversity ?? 0,
    })),
    [data, diversityData]
  );

  if (data.length === 0) {
    return <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>No genre data available</Box>;
  }

  return (
    <Box>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={mergedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            {genres.map((genre, i) => (
              <linearGradient key={genre} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.15} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={styles.gridColor} />
          <XAxis
            dataKey="month"
            tick={{ fill: styles.axisColor, fontSize: 11 }}
            tickLine={{ stroke: styles.axisColor }}
            axisLine={{ stroke: styles.gridColor }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            yAxisId="genres"
            tick={{ fill: styles.axisColor, fontSize: 12 }}
            tickLine={{ stroke: styles.axisColor }}
            axisLine={{ stroke: styles.gridColor }}
            label={{
              value: 'Genre Count',
              angle: -90,
              position: 'insideLeft',
              fill: styles.axisColor,
              fontSize: 12,
            }}
          />
          <YAxis
            yAxisId="diversity"
            orientation="right"
            tick={{ fill: '#FF9800', fontSize: 12 }}
            tickLine={{ stroke: '#FF9800' }}
            axisLine={{ stroke: '#FF9800' }}
            label={{
              value: 'Diversity Score',
              angle: 90,
              position: 'insideRight',
              fill: '#FF9800',
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={tooltipStyles.contentStyle}
            labelStyle={tooltipStyles.labelStyle}
            itemStyle={tooltipStyles.itemStyle}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          {genres.map((genre, i) => (
            <Area
              key={genre}
              yAxisId="genres"
              type="monotone"
              dataKey={genre}
              stackId="1"
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              fill={`url(#gradient-${i})`}
              strokeWidth={1}
            />
          ))}
          <Line
            yAxisId="diversity"
            type="monotone"
            dataKey="diversity"
            stroke="#FF9800"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: '#FF9800' }}
            name="Diversity Score"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default GenreDiversityChart;
