import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Platform, TextInput } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { CartesianChart, StackedArea, Line, useChartPressState } from 'victory-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { GroupedRecords, Artist } from '../../../types';
import { computeGenreTimeline, computeGenreDiversity } from '../../../utils/analyticsUtils';
import { CHART_COLORS } from '../../../utils/chartTheme';

const { width } = Dimensions.get('window');
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

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
      diversity: diversityData[i]?.diversity ?? 0,
    })) as (Record<string, any> & { month: string; diversity: number })[],
    [data, diversityData]
  );

  const { state, isActive } = useChartPressState({ 
      x: "", 
      y: { ...Object.fromEntries(topGenres.map(g => [g, 0])), diversity: 0 } 
  } as any);

  const tooltipTextProps = useAnimatedProps(() => {
    return {
      text: `${state.x.value.value} Diversity: ${state.y.diversity.value.value.toFixed(1)}`,
    } as any;
  });

  if (mergedData.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyMedium">No genre data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ height: 300 }}>
        <CartesianChart<any, any, any>
          data={mergedData}
          xKey="month"
          yKeys={[...topGenres, "diversity"]}
          padding={{ top: 20, bottom: 5, left: 10, right: 10 }}
          axisOptions={{
            labelColor: theme.colors.onSurfaceVariant as string,
            lineColor: theme.colors.outlineVariant as string,
            formatXLabel: (label) => label,
          }}
          chartPressState={state}
        >
          {({ points, chartBounds }) => (
            <>
              <StackedArea
                points={topGenres.map(g => (points as any)[g])}
                y0={chartBounds.bottom}
                colors={CHART_COLORS.slice(0, 5)}
                animate={{ type: "timing", duration: 300 }}
              />
              <Line
                points={(points as any).diversity}
                color="#FF9800"
                strokeWidth={3}
                animate={{ type: "timing", duration: 300 }}
              />
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

export default GenreDiversityChart;
