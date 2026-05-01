import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme, Typography, CircularProgress } from '@mui/material';
import { 
  VictoryChart, 
  VictoryBar, 
  VictoryAxis, 
  VictoryVoronoiContainer, 
  VictoryTooltip 
} from 'victory';
import { useAlbumConcentration } from '../../../hooks/useAnalyticsApi';
import { CHART_COLORS } from '../../../utils/chartTheme';

const width = window.innerWidth;

const AlbumConcentrationChart: React.FC = () => {
  const theme = useTheme();
  const { data, loading, error } = useAlbumConcentration();

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
      .slice(0, 5) // Limit for mobile readability
      .map(d => ({ ...d, x: d.name }));
  }, [data]);

  if (loading) return <Box sx={styles.centered}><CircularProgress /></Box>;
  if (error) return <Box sx={styles.centered}><Typography style={{ color: theme.palette.error.main }}>{error}</Typography></Box>;
  if (!data || data.length === 0) return null;

  return (
    <Box sx={styles.container}>
      <Box sx={styles.chartWrapper}>
        <VictoryChart
          width={width - 32}
          height={350}
          padding={{ top: 20, bottom: 80, left: 40, right: 40 }}
          containerComponent={
            <VictoryVoronoiContainer
              labels={({ datum }: { datum: any }) => {
                const count = typeof datum.count === 'number' ? datum.count : 0;
                const name = datum.x || 'Unknown Album';
                return `${name}: ${count} Tracks`;
              }}
              labelComponent={
                <VictoryTooltip
                  flyoutStyle={{
                    fill: theme.palette.action.hover,
                    stroke: theme.palette.divider,
                  }}
                  style={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                />
              }
            />
          }
        >
          <VictoryAxis
            fixLabelOverlap
            style={{
              axis: { stroke: theme.palette.divider },
              tickLabels: { 
                fill: theme.palette.text.secondary, 
                fontSize: 8,
                angle: -45,
                textAnchor: 'end'
              },
              grid: { stroke: 'transparent' }
            }}
          />
          <VictoryAxis
            dependentAxis
            domain={[0, Math.max(...aggregateData.map(d => Number(d.count) || 0), 1)]}
            style={{
              axis: { stroke: theme.palette.divider },
              tickLabels: { fill: theme.palette.text.secondary, fontSize: 8 },
              grid: { stroke: theme.palette.divider, strokeDasharray: "4, 4" }
            }}
          />
          
          <VictoryBar
            data={aggregateData}
            x="x"
            y="count"
            style={{
              data: {
                fill: CHART_COLORS[0],
                width: 30
              }
            }}
            animate={{ duration: 500 }}
          />
        </VictoryChart>
      </Box>
      
      <Box sx={styles.legendContainer}>
          <Typography variant="caption" style={{ opacity: 0.7 }}>Showing top 5 most frequent albums</Typography>
      </Box>
    </Box>
  );
};

const styles = {
  container: {
    padding: 8,
    alignItems: 'center'
  },
  centered: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    alignItems: 'center',
    marginTop: 8,
  }
};

export default AlbumConcentrationChart;

