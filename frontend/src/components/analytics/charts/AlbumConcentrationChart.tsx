import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme, Text, ActivityIndicator } from 'react-native-paper';
import { 
  VictoryChart, 
  VictoryBar, 
  VictoryAxis, 
  VictoryVoronoiContainer, 
  VictoryTooltip 
} from 'victory-native';
import { useAlbumConcentration } from '../../../hooks/useAnalyticsApi';
import { CHART_COLORS } from '../../../utils/chartTheme';

const { width } = Dimensions.get('window');

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

  if (loading) return <View style={styles.centered}><ActivityIndicator /></View>;
  if (error) return <View style={styles.centered}><Text style={{ color: theme.colors.error }}>{error}</Text></View>;
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
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
              tickLabels: { 
                fill: theme.colors.onSurfaceVariant, 
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
              axis: { stroke: theme.colors.outlineVariant },
              tickLabels: { fill: theme.colors.onSurfaceVariant, fontSize: 8 },
              grid: { stroke: theme.colors.outlineVariant, strokeDasharray: "4, 4" }
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
      </View>
      
      <View style={styles.legendContainer}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>Showing top 5 most frequent albums</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default AlbumConcentrationChart;

