import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography, useTheme, CircularProgress } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../../utils/api';
import { GenreEvolutionMonth } from '../../../types';
import { getMonthLabel, CHART_COLORS, getTooltipStyle, getChartStyles, chartCardSx } from '../../../utils/chartTheme';

const GenreEvolutionChart: React.FC = () => {
  const theme = useTheme();
  const [data, setData] = useState<GenreEvolutionMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<GenreEvolutionMonth[]>('/api/analytics/genre_evolution');
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch genre evolution data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = useMemo(() => {
    return data.map((item) => {
      const point: any = {
        month: getMonthLabel(item.month, item.year),
      };
      item.genres.forEach((g) => {
        point[g.category] = g.percentage;
      });
      return point;
    });
  }, [data]);

  const allGenres = useMemo(() => {
    const genresSet = new Set<string>();
    data.forEach((item) => {
      item.genres.forEach((g) => genresSet.add(g.category));
    });
    return Array.from(genresSet).sort();
  }, [data]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (data.length === 0) return <Typography>No data available</Typography>;

  const styles = getChartStyles(theme.palette.mode);
  const tooltipStyle = getTooltipStyle(theme.palette.mode);

  return (
    <Box sx={chartCardSx(theme.palette.mode)}>
      <Typography variant="h6" gutterBottom align="center">
        Genre Evolution
      </Typography>
      <Box sx={{ width: '100%', height: 400, mt: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={styles.gridColor} />
            <XAxis 
              dataKey="month" 
              stroke={styles.axisColor} 
              tick={{ fill: styles.labelColor, fontSize: 12 }}
            />
            <YAxis 
              unit="%" 
              stroke={styles.axisColor} 
              tick={{ fill: styles.labelColor, fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={tooltipStyle.contentStyle}
              labelStyle={tooltipStyle.labelStyle}
              itemStyle={tooltipStyle.itemStyle}
              formatter={(value: number) => [`${value}%`]}
            />
            <Legend />
            {allGenres.map((genre, index) => (
              <Area
                key={genre}
                type="monotone"
                dataKey={genre}
                stackId="1"
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default GenreEvolutionChart;
