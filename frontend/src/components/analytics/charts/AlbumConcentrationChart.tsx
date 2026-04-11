import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme, Text, ActivityIndicator } from 'react-native-paper';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer } from 'victory-native';
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
      .slice(0, 10); // Limit to top 10 for mobile
  }, [data]);

  if (loading) return <View style={styles.centered}><ActivityIndicator /></View>;
  if (error) return <View style={styles.centered}><Text style={{ color: theme.colors.error }}>{error}</Text></View>;
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <VictoryChart
        theme={VictoryTheme.material}
        width={width - 32}
        height={350}
        padding={{ top: 20, bottom: 50, left: 100, right: 30 }}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => `${datum.name}: ${datum.count}`}
            labelComponent={<VictoryTooltip />}
          />
        }
      >
        <VictoryAxis
          style={{
            tickLabels: { fontSize: 8, padding: 5, fill: theme.colors.onSurfaceVariant },
          }}
        />
        <VictoryAxis
          dependentAxis
          invertAxis
          style={{
            tickLabels: { fontSize: 8, fill: theme.colors.onSurfaceVariant },
          }}
        />
        <VictoryBar
          horizontal
          data={aggregateData}
          x="name"
          y="count"
          style={{
            data: {
              fill: ({ index }) => CHART_COLORS[Number(index) % CHART_COLORS.length],
              width: 15
            }
          }}
        />
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
});

export default AlbumConcentrationChart;
