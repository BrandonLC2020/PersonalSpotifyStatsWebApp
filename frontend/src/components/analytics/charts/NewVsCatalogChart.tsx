import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from './TypedRecharts';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNewVsCatalog } from '../../../hooks/useAnalyticsApi';
import { getChartStyles, getTooltipStyle } from '../../../utils/chartTheme';

const NewVsCatalogChart: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode as 'light' | 'dark';
  const styles = getChartStyles(mode);
  const tooltipStyles = getTooltipStyle(mode);
  const { data, loading, error } = useNewVsCatalog();

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(m => ({
      month: `${m.year}-${String(m.month).padStart(2, '0')}`,
      New: m.new_count,
      Recent: m.recent_count,
      Catalog: m.catalog_count,
    }));
  }, [data]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data || data.length === 0) return null;

  return (
    <Box>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1DB954" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#1DB954" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorRecent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#42A5F5" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#42A5F5" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCatalog" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9C27B0" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#9C27B0" stopOpacity={0}/>
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
          <YAxis tick={{ fill: styles.axisColor, fontSize: 12 }} />
          <Tooltip
            contentStyle={tooltipStyles.contentStyle}
            labelStyle={tooltipStyles.labelStyle}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area 
            type="monotone" 
            dataKey="New" 
            stackId="1" 
            stroke="#1DB954" 
            fillOpacity={1} 
            fill="url(#colorNew)" 
          />
          <Area 
            type="monotone" 
            dataKey="Recent" 
            stackId="1" 
            stroke="#42A5F5" 
            fillOpacity={1} 
            fill="url(#colorRecent)" 
          />
          <Area 
            type="monotone" 
            dataKey="Catalog" 
            stackId="1" 
            stroke="#9C27B0" 
            fillOpacity={1} 
            fill="url(#colorCatalog)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default NewVsCatalogChart;
