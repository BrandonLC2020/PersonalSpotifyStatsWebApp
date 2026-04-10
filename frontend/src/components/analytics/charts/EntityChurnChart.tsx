import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from './TypedRecharts';
import { Box, Typography, CircularProgress, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEntityChurn } from '../../../hooks/useAnalyticsApi';
import { getChartStyles, getTooltipStyle } from '../../../utils/chartTheme';

const EntityChurnChart: React.FC = () => {
  const theme = useTheme();
  const mode = theme.palette.mode as 'light' | 'dark';
  const styles = getChartStyles(mode);
  const tooltipStyles = getTooltipStyle(mode);
  const [type, setType] = useState<'tracks' | 'artists' | 'albums'>('artists');
  const { data, loading, error } = useEntityChurn(type);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(m => ({
      month: `${m.year}-${String(m.month).padStart(2, '0')}`,
      Entered: m.entered.length,
      Exited: -m.exited.length, // Negative for "below the line" effect
      Retained: m.retained_count,
    }));
  }, [data]);

  const handleTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: 'tracks' | 'artists' | 'albums' | null,
  ) => {
    if (newType !== null) setType(newType);
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data || data.length === 0) return null;

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup value={type} exclusive onChange={handleTypeChange} size="small">
          <ToggleButton value="tracks">Tracks</ToggleButton>
          <ToggleButton value="artists">Artists</ToggleButton>
          <ToggleButton value="albums">Albums</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
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
            formatter={(value: number) => [Math.abs(value), 'Quantity']}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <ReferenceLine y={0} stroke={styles.gridColor} />
          <Bar dataKey="Entered" fill="#1DB954" stackId="stack" />
          <Bar dataKey="Exited" fill="#E91E63" stackId="stack" />
          <Bar dataKey="Retained" fill="#42A5F5" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default EntityChurnChart;
