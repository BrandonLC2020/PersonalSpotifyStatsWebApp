import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, TextInput } from 'react-native';
import { SegmentedButtons, useTheme, Text } from 'react-native-paper';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { GroupedRecords, Track, Artist } from '../../../types';
import { computeRankingTimeline } from '../../../utils/analyticsUtils';
import { CHART_COLORS } from '../../../utils/chartTheme';

const { width } = Dimensions.get('window');
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface Props {
  tracks: GroupedRecords<Track>[];
  artists: GroupedRecords<Artist>[];
}

const RankingMovementChart: React.FC<Props> = ({ tracks, artists }) => {
  const theme = useTheme();
  const [entityType, setEntityType] = useState<'tracks' | 'artists'>('tracks');
  const { state, isActive } = useChartPressState({ x: "", y: {} });

  const { data, entities } = useMemo(() => {
    const source = entityType === 'tracks' ? tracks : artists;
    const idField = entityType === 'tracks' ? 'track_id' : 'artist_id';
    return computeRankingTimeline(source as any, 5, idField); // Limit to top 5 for mobile clarity
  }, [tracks, artists, entityType]);

  const tooltipTextProps = useAnimatedProps(() => {
    return {
      text: `Month: ${state.x.value.value}`,
    } as any;
  });

  if (data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyMedium">No ranking data available</Text>
      </View>
    );
  }

  // Ensure we only use top 5 entities
  const topEntities = entities.slice(0, 5);

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={entityType}
        onValueChange={value => setEntityType(value as 'tracks' | 'artists')}
        buttons={[
          { value: 'tracks', label: 'Tracks' },
          { value: 'artists', label: 'Artists' },
        ]}
        style={styles.toggle}
      />

      <View style={{ height: 300 }}>
        <CartesianChart
          data={data}
          xKey="month"
          yKeys={topEntities as any}
          padding={{ top: 20, bottom: 5, left: 20, right: 20 }}
          domain={{ y: [10, 1] }}
          axisOptions={{
            tickCount: 5,
            labelColor: theme.colors.onSurfaceVariant as string,
            labelOffset: 4,
            lineColor: theme.colors.outlineVariant as string,
            labelPosition: "outset",
            formatXLabel: (label) => label,
            formatYLabel: (label: string | number) => Math.round(Number(label)).toString(),
          }}
          chartPressState={state}
        >
          {({ points, chartBounds }) => (
            <>
              {topEntities.map((entity, i) => (
                <Line
                  key={entity}
                  points={(points as any)[entity]}
                  color={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={3}
                  curveType="monotoneX"
                  animate={{ type: "timing", duration: 300 }}
                />
              ))}
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
      
      <View style={styles.legendContainer}>
        {topEntities.map((name, i) => (
            <View key={name} style={styles.legendItem}>
                <View style={[styles.colorDot, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
                <Text variant="labelSmall" numberOfLines={1} style={styles.legendText}>{name}</Text>
            </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  toggle: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  centered: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
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
      marginRight: 12,
      marginBottom: 4,
  },
  colorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 4,
  },
  legendText: {
      maxWidth: 100,
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

export default RankingMovementChart;
