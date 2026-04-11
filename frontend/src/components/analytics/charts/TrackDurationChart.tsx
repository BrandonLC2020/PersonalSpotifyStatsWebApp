import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { VictoryChart, VictoryArea, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer, VictoryLine } from 'victory-native';
import { GroupedRecords, Track } from '../../../types';
import { computeAvgDuration } from '../../../utils/analyticsUtils';

const { width } = Dimensions.get('window');

interface Props {
  tracks: GroupedRecords<Track>[];
}

const TrackDurationChart: React.FC<Props> = ({ tracks }) => {
  const theme = useTheme();

  const data = useMemo(() => computeAvgDuration(tracks), [tracks]);

  const overallAvg = useMemo(() => {
    const validPoints = data.filter(d => d.avgDurationMs > 0);
    if (validPoints.length === 0) return 0;
    return validPoints.reduce((sum, d) => sum + d.avgDurationMs, 0) / validPoints.length;
  }, [data]);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyMedium">No duration data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <Text variant="labelSmall" style={styles.summaryLabel}>Overall Average</Text>
        <Text variant="headlineSmall" style={styles.summaryValue}>
          {formatDuration(overallAvg)}
        </Text>
      </View>

      <VictoryChart
        theme={VictoryTheme.material}
        width={width - 32}
        height={300}
        padding={{ top: 20, bottom: 50, left: 50, right: 30 }}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => `${datum.x}: ${datum.label}`}
            labelComponent={<VictoryTooltip />}
          />
        }
      >
        <VictoryAxis
          style={{
            tickLabels: { fontSize: 8, padding: 5, fill: theme.colors.onSurfaceVariant },
          }}
          fixLabelOverlap
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => formatDuration(t)}
          style={{
            tickLabels: { fontSize: 8, fill: theme.colors.onSurfaceVariant },
          }}
        />
        
        <VictoryArea
          data={data.map(d => ({ x: d.month, y: d.avgDurationMs, label: d.avgDurationFormatted }))}
          style={{
            data: { fill: "#1DB954", fillOpacity: 0.3, stroke: "#1DB954", strokeWidth: 2 }
          }}
        />

        {overallAvg > 0 && (
          <VictoryLine
            y={() => overallAvg}
            style={{
              data: { stroke: "#FF9800", strokeWidth: 1.5, strokeDasharray: "5,5" }
            }}
          />
        )}
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
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
});

export default TrackDurationChart;
