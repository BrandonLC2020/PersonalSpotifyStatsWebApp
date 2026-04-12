import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Platform, TextInput } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { CartesianChart, StackedBar, Line, useChartPressState } from 'victory-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { GroupedRecords, Track } from '../../../types';
import { computeExplicitRatio } from '../../../utils/analyticsUtils';

const { width } = Dimensions.get('window');
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface Props {
  tracks: GroupedRecords<Track>[];
}

const ExplicitContentChart: React.FC<Props> = ({ tracks }) => {
  const theme = useTheme();

  const data = useMemo(() => computeExplicitRatio(tracks) as (Record<string, unknown> & { month: string; explicit: number; clean: number; explicitPercent: number })[], [tracks]);

  const { state, isActive } = useChartPressState({ 
    x: "", 
    y: { explicit: 0, clean: 0, explicitPercent: 0 } 
  });

  const tooltipTextProps = useAnimatedProps(() => {
    return {
      text: `${state.x.value.value}: ${state.y.explicitPercent.value.value}% Explicit`,
    } as any;
  });

  if (data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyMedium">No explicit data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ height: 300 }}>
        <CartesianChart
          data={data}
          xKey="month"
          yKeys={["explicit", "clean", "explicitPercent"]}
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
                points={[points.explicit, points.clean]}
                chartBounds={chartBounds}
                colors={["#E91E63", "#42A5F5"]}
                barWidth={20}
                animate={{ type: "timing", duration: 300 }}
              />
              <Line
                points={points.explicitPercent}
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
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: "#E91E63" }]} />
          <Text variant="labelSmall">Explicit</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: "#42A5F5" }]} />
          <Text variant="labelSmall">Clean</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorDot, { backgroundColor: "#FF9800" }]} />
          <Text variant="labelSmall">Explicit %</Text>
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

export default ExplicitContentChart;
