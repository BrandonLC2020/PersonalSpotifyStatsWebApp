import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from './TypedRecharts';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useArtistTrackDominance } from '../../../hooks/useAnalyticsApi';
import { getChartStyles, getTooltipStyle, CHART_COLORS } from '../../../utils/chartTheme';

const ArtistDominanceChart: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode as 'light' | 'dark';
  const styles = getChartStyles(mode);
  const tooltipStyles = getTooltipStyle(mode);
  const { data, loading, error } = useArtistTrackDominance();

  const chartData = useMemo(() => {
    if (!data) return [];
    
    // Transform data for Recharts
    // We want to see how many tracks each of the top artists had per month
    // First, find the top artists overall to keep the legend manageable
    const artistTotals = new Map<string, number>();
    data.forEach(m => {
      m.artists.forEach(a => {
        artistTotals.set(a.name, (artistTotals.get(a.name) || 0) + a.track_count);
      });
    });

    const topArtists = Array.from(artistTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);

    return data.map(m => {
      const monthLabel = `${m.year}-${String(m.month).padStart(2, '0')}`;
      const point: any = { month: monthLabel };
      let otherCount = 0;
      
      m.artists.forEach(a => {
        if (topArtists.includes(a.name)) {
          point[a.name] = a.track_count;
        } else {
          otherCount += a.track_count;
        }
      });
      point['Other'] = otherCount;
      return point;
    });
  }, [data]);

  const topArtists = useMemo(() => {
    if (!data) return [];
    const artistTotals = new Map<string, number>();
    data.forEach(m => {
      m.artists.forEach(a => {
        artistTotals.set(a.name, (artistTotals.get(a.name) || 0) + a.track_count);
      });
    });
    return Array.from(artistTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);
  }, [data]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data || data.length === 0) return null;

  return (
    <Box>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={styles.gridColor} />
          <XAxis 
            dataKey="month" 
            tick={{ fill: styles.axisColor, fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fill: styles.axisColor, fontSize: 12 }} />
          <Tooltip
            contentStyle={tooltipStyles.contentStyle}
            labelStyle={tooltipStyles.labelStyle}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          {topArtists.map((artist, i) => (
            <Bar 
              key={artist} 
              dataKey={artist} 
              stackId="a" 
              fill={CHART_COLORS[i % CHART_COLORS.length]} 
            />
          ))}
          <Bar dataKey="Other" stackId="a" fill="#666" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ArtistDominanceChart;
