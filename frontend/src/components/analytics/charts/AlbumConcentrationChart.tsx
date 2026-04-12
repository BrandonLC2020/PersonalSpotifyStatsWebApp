import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Platform, TextInput } from 'react-native';
import { useTheme, Text, ActivityIndicator } from 'react-native-paper';
import { CartesianChart, Bar, useChartPressState } from 'victory-native';
import Animated, { useAnimatedProps, useDerivedValue } from 'react-native-reanimated';
import { useAlbumConcentration } from '../../../hooks/useAnalyticsApi';
import { CHART_COLORS } from '../../../utils/chartTheme';

const { width } = Dimensions.get('window');
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

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

  const { state, isActive } = useChartPressState({ 
      x: "", 
      y: { count: 0 } 
  });

  const tooltipTextProps = useAnimatedProps(() => {
    return {
      text: `${state.x.value.value}: ${state.y.count.value.value} Tracks`,
    } as any;
  });

  if (loading) return <View style={styles.centered}><ActivityIndicator /></View>;
  if (error) return <View style={styles.centered}><Text style={{ color: theme.colors.error }}>{error}</Text></View>;
  if (!data || data.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={{ height: 350 }}>
        <CartesianChart
          data={aggregateData}
          xKey="x"
          yKeys={["count"]}
          padding={{ top: 20, bottom: 80, left: 10, right: 10 }} // Extra bottom padding for labels
          axisOptions={{
            labelColor: theme.colors.onSurfaceVariant as string,
            lineColor: theme.colors.outlineVariant as string,
            formatXLabel: (label: string) => label.length > 15 ? label.slice(0, 12) + "..." : label,
          }}
          chartPressState={state}
        >
          {({ points, chartBounds }) => (
            <>
              <Bar
                points={points.count}
                chartBounds={chartBounds}
                color={CHART_COLORS[0]}
                barWidth={30}
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
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>Showing top 5 most frequent albums</Text>
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
    alignItems: 'center',
    marginTop: 8,
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

export default AlbumConcentrationChart;
