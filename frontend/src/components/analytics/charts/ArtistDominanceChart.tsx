import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme, Typography, CircularProgress } from '@mui/material';
import { 
  VictoryChart, 
  VictoryBar, 
  VictoryAxis, 
  VictoryStack, 
  VictoryVoronoiContainer, 
  VictoryTooltip 
} from 'victory';
import { useArtistTrackDominance } from '../../../hooks/useAnalyticsApi';
import { CHART_COLORS } from '../../../utils/chartTheme';

const width = window.innerWidth;

const ArtistDominanceChart: React.FC = () => {
  const theme = useTheme();
  const { data, loading, error } = useArtistTrackDominance();

  const { chartData, topArtists } = useMemo(() => {
    if (!data) return { chartData: [], topArtists: [] };
    
    const artistTotals = new Map<string, number>();
    data.forEach(m => {
      m.artists.forEach(a => {
        artistTotals.set(a.name, (artistTotals.get(a.name) || 0) + a.track_count);
      });
    });

    const artistsList = Array.from(artistTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Limit for mobile
      .map(([name]) => name);

    const formattedData = data.map(m => {
      const monthLabel = `${String(m.month).padStart(2, '0')}/${String(m.year).slice(-2)}`;
      const point: any = { month: monthLabel };
      
      // Initialize all selected artists to 0 to prevent NaN in VictoryStack
      artistsList.forEach(name => {
        point[name] = 0;
      });
      point['Other'] = 0;

      let otherCount = 0;
      m.artists.forEach(a => {
        if (artistsList.includes(a.name)) {
          point[a.name] = a.track_count;
        } else {
          otherCount += a.track_count;
        }
      });
      point['Other'] = otherCount;
      return point;
    });

    return { chartData: formattedData, topArtists: [...artistsList, 'Other'] };
  }, [data]);

  if (loading) return <Box sx={styles.centered}><CircularProgress /></Box>;
  if (error) return <Box sx={styles.centered}><Typography style={{ color: theme.palette.error.main }}>{error}</Typography></Box>;
  if (!data || data.length === 0) return null;

  return (
    <Box sx={styles.container}>
      <Box sx={styles.chartWrapper}>
        <VictoryChart
          width={width - 32}
          height={300}
          padding={{ top: 20, bottom: 40, left: 40, right: 40 }}
          containerComponent={
            <VictoryVoronoiContainer
              labels={({ datum }: { datum: any }) => {
                const y = typeof datum.y === 'number' ? datum.y : 0;
                const name = datum.childName || 'Artist';
                return `${name}: ${y} tracks`;
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
              tickLabels: { fill: theme.palette.text.secondary, fontSize: 8 },
              grid: { stroke: 'transparent' }
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: theme.palette.divider },
              tickLabels: { fill: theme.palette.text.secondary, fontSize: 8 },
              grid: { stroke: theme.palette.divider, strokeDasharray: "4, 4" }
            }}
          />
          
          <VictoryStack colorScale={[...CHART_COLORS.slice(0, 5), "#666"]}>
            {topArtists.map((artist, i) => (
              <VictoryBar
                key={artist}
                name={artist}
                data={chartData}
                x="month"
                y={artist}
                animate={{ duration: 500 }}
              />
            ))}
          </VictoryStack>
        </VictoryChart>
      </Box>

       <Box sx={styles.legendContainer}>
        {topArtists.map((artist, i) => (
            <Box key={artist} sx={styles.legendItem}>
                <Box sx={{ ...styles.colorDot,  backgroundColor: i < CHART_COLORS.length ? CHART_COLORS[i] : "#666"  }} />
                <Typography variant="caption" noWrap>{artist}</Typography>
            </Box>
        ))}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 4,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  }
};

export default ArtistDominanceChart;

