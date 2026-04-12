import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform, TextInput } from 'react-native';
import { useTheme, Text, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { CartesianChart, BarGroup, useChartPressState } from 'victory-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { useEntityChurn } from '../../../hooks/useAnalyticsApi';

const { width } = Dimensions.get('window');
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const EntityChurnChart: React.FC = () => {
  const theme = useTheme();
  const [type, setType] = useState<'tracks' | 'artists' | 'albums'>('artists');
  const { data, loading, error } = useEntityChurn(type);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(m => ({
      month: `${String(m.month).padStart(2, '0')}/${String(m.year).slice(-2)}`,
      Entered: m.entered.length,
      Exited: m.exited.length,
      Retained: m.retained_count,
    }));
  }, [data]);

  const { state, isActive } = useChartPressState({ 
      x: "", 
      y: { Entered: 0, Exited: 0, Retained: 0 } 
  });

  const tooltipTextProps = useAnimatedProps(() => {
    return {
      text: `${state.x.value.value}: +${state.y.Entered.value.value} | -${state.y.Exited.value.value}`,
    } as any;
  });

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

      <View style={{ height: 350 }}>
        <CartesianChart
          data={chartData}
          xKey="month"
          yKeys={["Entered", "Exited", "Retained"]}
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
              <BarGroup
                chartBounds={chartBounds}
                betweenGroupPadding={0.3}
                withinGroupPadding={0.1}
              >
                <BarGroup.Bar
                  points={points.Entered}
                  color="#1DB954"
                  animate={{ type: "timing", duration: 300 }}
                />
                <BarGroup.Bar
                   points={points.Exited}
                   color="#E91E63"
                   animate={{ type: "timing", duration: 300 }}
                />
                <BarGroup.Bar
                   points={points.Retained}
                   color="#42A5F5"
                   animate={{ type: "timing", duration: 300 }}
                />
              </BarGroup>
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

export default EntityChurnChart;
