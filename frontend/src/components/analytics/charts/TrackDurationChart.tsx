import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme, Typography } from '@mui/material';
import { 
  VictoryChart, 
  VictoryArea, 
  VictoryLine, 
  VictoryAxis, 
  VictoryVoronoiContainer, 
  VictoryTooltip 
} from 'victory';
import { GroupedRecords, Track } from '../../../types';
import { computeAvgDuration } from '../../../utils/analyticsUtils';

const width = window.innerWidth;

interface Props {
  tracks: GroupedRecords<Track>[];
}

const TrackDurationChart: React.FC<Props> = ({ tracks }) => {
  const theme = useTheme();

  const data = useMemo(() => {
    const rawData = computeAvgDuration(tracks);
    return rawData.map(d => ({
        ...d,
        avgDurationMs: Number(d.avgDurationMs) || 0,
    })) as (Record<string, any> & { month: string; avgDurationMs: number })[];
  }, [tracks]);

  const overallAvg = useMemo(() => {
    const validPoints = data.filter(d => (Number(d.avgDurationMs) || 0) > 0);
    if (validPoints.length === 0) return 0;
    const total = validPoints.reduce((sum, d) => sum + (Number(d.avgDurationMs) || 0), 0);
    return total / validPoints.length || 0;
  }, [data]);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (data.length === 0) {
    return (
      <Box sx={styles.centered}>
        <Typography variant="body1">No duration data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Box sx={styles.summaryContainer}>
        <Typography variant="caption" style={styles.summaryLabel}>Overall Average</Typography>
        <Typography variant="h5" style={styles.summaryValue}>
          {formatDuration(overallAvg)}
        </Typography>
      </Box>

      <Box sx={styles.chartWrapper}>
        <VictoryChart
          width={width - 32}
          height={300}
          padding={{ top: 20, bottom: 40, left: 50, right: 40 }}
          containerComponent={
            <VictoryVoronoiContainer
              labels={({ datum }: { datum: any }) => {
                const y = typeof datum.avgDurationMs === 'number' ? datum.avgDurationMs : 0;
                return `${datum.month}: ${formatDuration(y)}`;
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
            tickFormat={(t: any) => formatDuration(t)}
            domain={[0, Math.max(0, ...data.map(d => Number(d.avgDurationMs) || 0), Number(overallAvg) || 0, 1)]}
            style={{
              axis: { stroke: theme.palette.divider },
              tickLabels: { fill: theme.palette.text.secondary, fontSize: 8 },
              grid: { stroke: theme.palette.divider, strokeDasharray: "4, 4" }
            }}
          />
          
          <VictoryArea
            data={data}
            x="month"
            y="avgDurationMs"
            style={{
              data: {
                fill: "#1DB954",
                fillOpacity: 0.3,
                stroke: "#1DB954",
                strokeWidth: 2
              }
            }}
            animate={{ duration: 500 }}
          />

          {overallAvg > 0 && (
            <VictoryLine
              data={data.map(d => ({ month: d.month, y: overallAvg }))}
              x="month"
              y="y"
              style={{
                data: {
                  stroke: "#FF9800",
                  strokeWidth: 1,
                  strokeDasharray: "5, 5",
                  opacity: 0.7
                }
              }}
            />
          )}
        </VictoryChart>
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
  summaryContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    opacity: 0.6,
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#1DB954',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  }
};

export default TrackDurationChart;

