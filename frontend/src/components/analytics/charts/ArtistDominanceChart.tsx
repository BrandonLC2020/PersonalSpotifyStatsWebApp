import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme, Text, ActivityIndicator } from 'react-native-paper';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryStack, VictoryVoronoiContainer, VictoryTooltip } from 'victory-native';
import { useArtistTrackDominance } from '../../../hooks/useAnalyticsApi';
import { CHART_COLORS } from '../../../utils/chartTheme';

const { width } = Dimensions.get('window');

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

  if (loading) return <View style={styles.centered}><ActivityIndicator /></View>;
  if (error) return <View style={styles.centered}><Text style={{ color: theme.colors.error }}>{error}</Text></View>;
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <VictoryChart
        theme={VictoryTheme.material}
        width={width - 32}
        height={300}
        padding={{ top: 20, bottom: 50, left: 40, right: 20 }}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => `${datum._group}: ${datum.y}`}
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
          style={{
            tickLabels: { fontSize: 10, fill: theme.colors.onSurfaceVariant },
          }}
        />
        
        <VictoryStack colorScale={[...CHART_COLORS, "#666"]}>
          {topArtists.map((artist) => (
            <VictoryBar
              key={artist}
              name={artist}
              data={chartData.map(d => ({ x: d.month, y: d[artist] || 0 }))}
            />
          ))}
        </VictoryStack>
      </VictoryChart>

       <View style={styles.legendContainer}>
        {topArtists.map((artist, i) => (
            <View key={artist} style={styles.legendItem}>
                <View style={[styles.colorDot, { backgroundColor: i < CHART_COLORS.length ? CHART_COLORS[i] : "#666" }]} />
                <Text variant="labelSmall" numberOfLines={1}>{artist}</Text>
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
    marginHorizontal: 8,
    marginBottom: 4,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
});

export default ArtistDominanceChart;
