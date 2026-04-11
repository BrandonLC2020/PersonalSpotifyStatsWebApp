import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { VictoryChart, VictoryArea, VictoryLine, VictoryAxis, VictoryTheme, VictoryLegend, VictoryStack, VictoryVoronoiContainer, VictoryTooltip } from 'victory-native';
import { GroupedRecords, Artist } from '../../../types';
import { computeGenreTimeline, computeGenreDiversity } from '../../../utils/analyticsUtils';
import { CHART_COLORS } from '../../../utils/chartTheme';

const { width } = Dimensions.get('window');

interface Props {
  artists: GroupedRecords<Artist>[];
}

const GenreDiversityChart: React.FC<Props> = ({ artists }) => {
  const theme = useTheme();

  const { data, genres } = useMemo(() => computeGenreTimeline(artists), [artists]);
  const diversityData = useMemo(() => computeGenreDiversity(artists), [artists]);

  const mergedData = useMemo(() =>
    data.map((point, i) => ({
      ...point,
      diversity: diversityData[i]?.diversity ?? 0,
    })),
    [data, diversityData]
  );

  if (mergedData.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyMedium">No genre data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VictoryChart
        theme={VictoryTheme.material}
        width={width - 32}
        height={300}
        padding={{ top: 20, bottom: 50, left: 40, right: 40 }}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => `${datum.childName === 'Diversity' ? 'Diversity' : datum._group}: ${datum.y}`}
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
        
        <VictoryStack colorScale={CHART_COLORS}>
          {genres.slice(0, 5).map((genre, i) => (
            <VictoryArea
              key={genre}
              name={genre}
              data={mergedData.map(d => ({ x: d.month, y: d[genre] || 0 }))}
              style={{
                data: { fillOpacity: 0.5, stroke: CHART_COLORS[i % CHART_COLORS.length], strokeWidth: 1 }
              }}
            />
          ))}
        </VictoryStack>

        <VictoryAxis
          dependentAxis
          orientation="right"
          style={{
            tickLabels: { fontSize: 10, fill: "#FF9800" },
          }}
          label="Diversity"
        />
        
        <VictoryLine
          name="Diversity"
          data={mergedData.map(d => ({ x: d.month, y: d.diversity }))}
          style={{
            data: { stroke: "#FF9800", strokeWidth: 2 }
          }}
        />
      </VictoryChart>

       <View style={styles.legendContainer}>
        {genres.slice(0, 5).map((genre, i) => (
            <View key={genre} style={styles.legendItem}>
                <View style={[styles.colorDot, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
                <Text variant="labelSmall" numberOfLines={1}>{genre}</Text>
            </View>
        ))}
         <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: "#FF9800" }]} />
          <Text variant="labelSmall">Diversity</Text>
        </View>
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

export default GenreDiversityChart;
