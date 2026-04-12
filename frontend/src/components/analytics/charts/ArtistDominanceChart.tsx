import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Platform, TextInput } from 'react-native';
import { useTheme, Text, ActivityIndicator } from 'react-native-paper';
import { CartesianChart, StackedBar, useChartPressState } from 'victory-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { useArtistTrackDominance } from '../../../hooks/useAnalyticsApi';
import { CHART_COLORS } from '../../../utils/chartTheme';

const { width } = Dimensions.get('window');
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

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

  const { state, isActive } = useChartPressState({ 
      x: "", 
      y: Object.fromEntries(topArtists.map(a => [a, 0])) 
  });

  const tooltipTextProps = useAnimatedProps(() => {
    return {
      text: `${state.x.value.value} Dominance`,
    } as any;
  });

  if (loading) return <View style={styles.centered}><ActivityIndicator /></View>;
  if (error) return <View style={styles.centered}><Text style={{ color: theme.colors.error }}>{error}</Text></View>;
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={{ height: 300 }}>
        <CartesianChart
          data={chartData}
          xKey="month"
          yKeys={topArtists as any}
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
              <StackedBar
                points={topArtists.map(a => points[a])}
                chartBounds={chartBounds}
                colors={[...CHART_COLORS.slice(0, 5), "#666"]}
                barWidth={20}
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

export default ArtistDominanceChart;
