import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme, Text, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { 
  VictoryChart, 
  VictoryBar, 
  VictoryAxis, 
  VictoryGroup, 
  VictoryVoronoiContainer, 
  VictoryTooltip 
} from 'victory-native';
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
      Entered: Number(m.entered?.length) || 0,
      Exited: Number(m.exited?.length) || 0,
      Retained: Number(m.retained_count) || 0,
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

      <View style={styles.chartWrapper}>
        <VictoryChart
          width={width - 32}
          height={350}
          padding={{ top: 20, bottom: 40, left: 40, right: 40 }}
          containerComponent={
            <VictoryVoronoiContainer
              labels={({ datum }: { datum: any }) => {
                const y = typeof datum.y === 'number' ? datum.y : 0;
                const name = datum.childName || 'Count';
                return `${name}: ${y}`;
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
            domain={[0, Math.max(...chartData.map(d => Math.max(Number(d.Entered) || 0, Number(d.Exited) || 0, Number(d.Retained) || 0)), 1)]}
            style={{
              axis: { stroke: theme.colors.outlineVariant },
              tickLabels: { fill: theme.colors.onSurfaceVariant, fontSize: 8 },
              grid: { stroke: theme.colors.outlineVariant, strokeDasharray: "4, 4" }
            }}
          />
          
          <VictoryGroup offset={10} colorScale={["#1DB954", "#E91E63", "#42A5F5"]}>
            <VictoryBar
              name="Entered"
              data={chartData}
              x="month"
              y="Entered"
              animate={{ duration: 500 }}
            />
            <VictoryBar
              name="Exited"
              data={chartData}
              x="month"
              y="Exited"
              animate={{ duration: 500 }}
            />
            <VictoryBar
              name="Retained"
              data={chartData}
              x="month"
              y="Retained"
              animate={{ duration: 500 }}
            />
          </VictoryGroup>
        </VictoryChart>
      </View>

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
  }
});

export default EntityChurnChart;

