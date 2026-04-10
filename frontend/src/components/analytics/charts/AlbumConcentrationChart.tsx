import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from './TypedRecharts';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAlbumConcentration } from '../../../hooks/useAnalyticsApi';
import { getChartStyles, getTooltipStyle, CHART_COLORS } from '../../../utils/chartTheme';

const AlbumConcentrationChart: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode as 'light' | 'dark';
  const styles = getChartStyles(mode);
  const tooltipStyles = getTooltipStyle(mode);
  const { data, loading, error } = useAlbumConcentration();

  // Aggregate by album across all time for a "sticky albums" view
  const aggregateData = useMemo(() => {
    if (!data) return [];
    const totals = new Map<string, { name: string; count: number; type: string }>();
    
    data.forEach(m => {
      m.albums.forEach(a => {
        const existing = totals.get(a.name) || { name: a.name, count: 0, type: a.album_type };
        existing.count += a.track_count;
        totals.set(a.name, existing);
      });
    });

    return Array.from(totals.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [data]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data || data.length === 0) return null;

  return (
    <Box>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart 
          data={aggregateData} 
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={styles.gridColor} horizontal={true} vertical={false} />
          <XAxis type="number" tick={{ fill: styles.axisColor, fontSize: 11 }} />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fill: styles.axisColor, fontSize: 11 }}
            width={90}
          />
          <Tooltip
            contentStyle={tooltipStyles.contentStyle}
            labelStyle={tooltipStyles.labelStyle}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {aggregateData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default AlbumConcentrationChart;
