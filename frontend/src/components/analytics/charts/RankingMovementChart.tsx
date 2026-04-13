import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SegmentedButtons, useTheme, Text } from 'react-native-paper';
import { 
  VictoryChart, 
  VictoryLine, 
  VictoryAxis, 
  VictoryVoronoiContainer, 
  VictoryTooltip,
  VictoryScatter,
  VictoryGroup
} from 'victory-native';
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

      <View style={styles.chartWrapper}>
        <VictoryChart
          width={width - 32}
          height={300}
          padding={{ top: 40, bottom: 40, left: 40, right: 40 }}
          containerComponent={
            <VictoryVoronoiContainer
              labels={({ datum }: { datum: any }) => {
                const y = typeof datum.y === 'number' ? datum.y : 'N/A';
                const entityName = datum.childName || 'Unknown';
                return `${entityName}: Rank ${y}`;
              }}
              labelComponent={
                <VictoryTooltip
                  flyoutStyle={{
                    fill: theme.colors.surfaceVariant,
                    stroke: theme.colors.outlineVariant,
                  }}
                  style={{ fill: theme.colors.onSurfaceVariant, fontSize: 10 }}
                />
              }
            />
          }
        >
          <VictoryAxis
            fixLabelOverlap
            style={{
              axis: { stroke: theme.colors.outlineVariant },
              tickLabels: { fill: theme.colors.onSurfaceVariant, fontSize: 8 },
              grid: { stroke: 'transparent' }
            }}
          />
          <VictoryAxis
            dependentAxis
            invertAxis
            domain={[1, 5]}
            tickValues={[1, 2, 3, 4, 5]}
            style={{
              axis: { stroke: theme.colors.outlineVariant },
              tickLabels: { fill: theme.colors.onSurfaceVariant, fontSize: 8 },
              grid: { stroke: theme.colors.outlineVariant, strokeDasharray: "4, 4" }
            }}
          />
          {topEntities.map((entity, i) => {
            const entityColor = CHART_COLORS[i % CHART_COLORS.length];
            const scatterData = data.filter(d => d[entity] !== null);
            
            return (
              <VictoryGroup key={entity}>
                <VictoryLine
                  name={entity}
                  data={data}
                  x="month"
                  y={entity}
                  style={{
                    data: {
                      stroke: entityColor,
                      strokeWidth: 3
                    }
                  }}
                  animate={{ duration: 500 }}
                />
                <VictoryScatter
                  data={scatterData}
                  x="month"
                  y={entity}
                  size={4}
                  style={{
                    data: {
                      fill: entityColor
                    }
                  }}
                />
              </VictoryGroup>
            );
          })}
        </VictoryChart>
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
    alignItems: 'center'
  },
  toggle: {
    marginBottom: 16,
    width: '100%',
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

