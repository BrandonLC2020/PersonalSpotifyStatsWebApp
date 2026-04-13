import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { 
  VictoryChart, 
  VictoryArea, 
  VictoryLine, 
  VictoryAxis, 
  VictoryStack, 
  VictoryVoronoiContainer, 
  VictoryTooltip,
} from 'victory-native';
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
  const topGenres = useMemo(() => genres.slice(0, 5), [genres]);

  const mergedData = useMemo(() =>
    data.map((point, i) => ({
      ...point,
      diversity: Number(diversityData[i]?.diversity) || 0,
    })) as (Record<string, any> & { month: string; diversity: number })[],
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
      <View style={styles.chartWrapper}>
        <VictoryChart
          width={width - 32}
          height={300}
          padding={{ top: 20, bottom: 40, left: 40, right: 40 }}
          containerComponent={
            <VictoryVoronoiContainer
              labels={({ datum }) => {
                const y = typeof datum.y === 'number' ? datum.y : 0;
                if (datum.childName === 'Diversity') {
                  return `Diversity: ${y.toFixed(1)}`;
                }
                const genreName = datum.childName || 'Unknown';
                return `${genreName}: ${y} tracks`;
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
            domain={[0, Math.max(0, ...mergedData.map(d => genres.reduce((sum, g) => sum + (Number(d[g]) || 0), 0)), 1)]}
            style={{
              axis: { stroke: theme.colors.outlineVariant },
              tickLabels: { fill: theme.colors.onSurfaceVariant, fontSize: 8 },
              grid: { stroke: theme.colors.outlineVariant, strokeDasharray: "4, 4" }
            }}
          />
          
          <VictoryStack>
            {topGenres.map((genre, i) => (
              <VictoryArea
                key={genre}
                name={genre}
                data={mergedData}
                x="month"
                y={genre}
                style={{
                  data: {
                    fill: CHART_COLORS[i % CHART_COLORS.length],
                    fillOpacity: 0.6,
                    stroke: CHART_COLORS[i % CHART_COLORS.length],
                    strokeWidth: 1
                  }
                }}
                animate={{ duration: 500 }}
              />
            ))}
          </VictoryStack>

          <VictoryLine
            name="Diversity"
            data={mergedData}
            x="month"
            y="diversity"
            style={{
              data: {
                stroke: "#FF9800",
                strokeWidth: 3
              }
            }}
            animate={{ duration: 500 }}
          />
        </VictoryChart>
      </View>

       <View style={styles.legendContainer}>
        {topGenres.map((genre, i) => (
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
  }
});

export default GenreDiversityChart;

