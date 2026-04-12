import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Platform, TextInput } from 'react-native';
import { useTheme, Text, ActivityIndicator } from 'react-native-paper';
import { CartesianChart, Area, Line, useChartPressState } from 'victory-native';
import Animated, { useAnimatedProps, useDerivedValue } from 'react-native-reanimated';
import { GroupedRecords, Track } from '../../../types';
import { computeAvgDuration } from '../../../utils/analyticsUtils';

const { width } = Dimensions.get('window');
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface Props {
  tracks: GroupedRecords<Track>[];
}

const TrackDurationChart: React.FC<Props> = ({ tracks }) => {
  const theme = useTheme();

  const data = useMemo(() => computeAvgDuration(tracks) as (Record<string, any> & { month: string; avgDurationMs: number })[], [tracks]);

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

  const { state, isActive } = useChartPressState({ 
      x: "", 
      y: { avgDurationMs: 0 } 
  });

  const tooltipTextProps = useAnimatedProps(() => {
    const ms = state.y.avgDurationMs.value.value;
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    return {
      text: `${state.x.value.value}: ${formatted}`,
    } as any;
  });

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

      <View style={{ height: 300 }}>
        <CartesianChart
          data={data}
          xKey="month"
          yKeys={["avgDurationMs"]}
          padding={{ top: 20, bottom: 5, left: 10, right: 10 }}
          axisOptions={{
            labelColor: theme.colors.onSurfaceVariant as string,
            lineColor: theme.colors.outlineVariant as string,
            formatXLabel: (label) => label,
            formatYLabel: (value: string | number) => formatDuration(Number(value)),
          }}
          chartPressState={state}
        >
          {({ points, chartBounds }) => (
            <>
              <Area
                points={points.avgDurationMs}
                y0={chartBounds.bottom}
                color="#1DB954"
                opacity={0.3}
                animate={{ type: "timing", duration: 300 }}
              />
              <Line
                points={points.avgDurationMs}
                color="#1DB954"
                strokeWidth={2}
                animate={{ type: "timing", duration: 300 }}
              />
              {overallAvg > 0 && (
                  <Line
                    points={data.map(d => ({ x: d.month, y: overallAvg })) as any}
                    color="#FF9800"
                    strokeWidth={1}
                    opacity={0.5}
                  />
              )}
            </>
          )}
        </CartesianChart>

        {isActive && (
          <View pointerEvents="none" style={[styles.tooltipContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <AnimatedTextInput
              editable={false}
              underlineColorAndroid="transparent"
              style={[styles.tooltipText, { color: theme.colors.onSurface }]}
              animatedProps={tooltipTextProps}
            />
          </View>
        )}
      </View>
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
  tooltipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tooltipContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 8,
    borderRadius: 8,
    ...Platform.select({
      web: {
        // @ts-ignore - Web specific
        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    })
  }
});

export default TrackDurationChart;
