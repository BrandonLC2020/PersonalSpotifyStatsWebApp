import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SegmentedButtons, useTheme, Text } from 'react-native-paper';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryLegend, VictoryVoronoiContainer, VictoryTooltip } from 'victory-native';
import { GroupedRecords, Track, Artist } from '../../../types';
import { computeRankingTimeline } from '../../../utils/analyticsUtils';
import { CHART_COLORS } from '../../../utils/chartTheme';

const { width } = Dimensions.get('window');

interface Props {
  tracks: GroupedRecords<Track>[];
  artists: GroupedRecords<Artist>[];
}

const RankingMovementChart: React.FC<Props> = ({ tracks, artists }) => {
  const theme = useTheme();
  const [entityType, setEntityType] = useState<'tracks' | 'artists'>('tracks');

  const { data, entities } = useMemo(() => {
    const source = entityType === 'tracks' ? tracks : artists;
    const idField = entityType === 'tracks' ? 'track_id' : 'artist_id';
    return computeRankingTimeline(source as any, 5, idField); // Limit to top 5 for mobile clarity
  }, [tracks, artists, entityType]);

  if (data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyMedium">No ranking data available</Text>
      </View>
    );
  }

  // Transform data for Victory (VictoryLine expects array of { x, y })
  const seriesData = entities.slice(0, 5).map(name => ({
    name,
    data: data.map(d => ({
      x: d.month,
      y: d[name] || null,
      entity: name
    })).filter(d => d.y !== null)
  }));

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

      <VictoryChart
        theme={VictoryTheme.material}
        width={width - 32}
        height={300}
        padding={{ top: 20, bottom: 50, left: 40, right: 20 }}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => `${datum.entity}: ${datum.y}`}
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
          invertAxis
          domain={[1, 10]}
          style={{
            tickLabels: { fontSize: 10, fill: theme.colors.onSurfaceVariant },
          }}
        />
        {seriesData.map((series, i) => (
          <VictoryLine
            key={series.name}
            data={series.data}
            style={{
              data: { stroke: CHART_COLORS[i % CHART_COLORS.length], strokeWidth: 2 }
            }}
          />
        ))}
      </VictoryChart>
      
      <View style={styles.legendContainer}>
        {seriesData.map((series, i) => (
            <View key={series.name} style={styles.legendItem}>
                <View style={[styles.colorDot, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
                <Text variant="labelSmall" numberOfLines={1} style={styles.legendText}>{series.name}</Text>
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
  }
});

export default RankingMovementChart;
