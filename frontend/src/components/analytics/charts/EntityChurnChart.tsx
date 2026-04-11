import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme, Text, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer, VictoryLegend } from 'victory-native';
import { useEntityChurn } from '../../../hooks/useAnalyticsApi';

const { width } = Dimensions.get('window');

const EntityChurnChart: React.FC = () => {
  const theme = useTheme();
  const [type, setType] = useState<'tracks' | 'artists' | 'albums'>('artists');
  const { data, loading, error } = useEntityChurn(type);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(m => ({
      month: `${String(m.month).padStart(2, '0')}/${String(m.year).slice(-2)}`,
      Entered: m.entered.length,
      Exited: -m.exited.length,
      Retained: m.retained_count,
    }));
  }, [data]);

  if (loading) return <View style={styles.centered}><ActivityIndicator /></View>;
  if (error) return <View style={styles.centered}><Text style={{ color: theme.colors.error }}>{error}</Text></View>;
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
       <SegmentedButtons
        value={type}
        onValueChange={value => setType(value as 'tracks' | 'artists' | 'albums')}
        buttons={[
          { value: 'tracks', label: 'Tracks' },
          { value: 'artists', label: 'Artists' },
          { value: 'albums', label: 'Albums' },
        ]}
        style={styles.toggle}
      />

      <VictoryChart
        theme={VictoryTheme.material}
        width={width - 32}
        height={350}
        padding={{ top: 20, bottom: 50, left: 40, right: 20 }}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => `${datum._group}: ${Math.abs(datum.y)}`}
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
        
        <VictoryBar
          name="Entered"
          data={chartData.map(d => ({ x: d.month, y: d.Entered }))}
          style={{ data: { fill: "#1DB954" } }}
        />
        <VictoryBar
          name="Exited"
          data={chartData.map(d => ({ x: d.month, y: d.Exited }))}
          style={{ data: { fill: "#E91E63" } }}
        />
        <VictoryBar
          name="Retained"
          data={chartData.map(d => ({ x: d.month, y: d.Retained }))}
          style={{ data: { fill: "#42A5F5" } }}
        />
      </VictoryChart>

       <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: "#1DB954" }]} />
          <Text variant="labelSmall">Entered</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: "#E91E63" }]} />
          <Text variant="labelSmall">Exited</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: "#42A5F5" }]} />
          <Text variant="labelSmall">Retained</Text>
        </View>
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
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
});

export default EntityChurnChart;
