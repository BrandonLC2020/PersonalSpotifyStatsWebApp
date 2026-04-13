import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { 
  VictoryChart, 
  VictoryBar, 
  VictoryLine, 
  VictoryAxis, 
  VictoryStack, 
  VictoryVoronoiContainer, 
  VictoryTooltip 
} from 'victory-native';
import { GroupedRecords, Track } from '../../../types';
import { computeExplicitRatio } from '../../../utils/analyticsUtils';

const { width } = Dimensions.get('window');

interface Props {
  tracks: GroupedRecords<Track>[];
}

const ExplicitContentChart: React.FC<Props> = ({ tracks }) => {
  const theme = useTheme();

  const data = useMemo(() => {
    const rawData = computeExplicitRatio(tracks);
    return rawData.map(d => ({
      ...d,
      explicit: Number(d.explicit) || 0,
      clean: Number(d.clean) || 0,
      explicitPercent: Number(d.explicitPercent) || 0,
    })) as (Record<string, unknown> & { month: string; explicit: number; clean: number; explicitPercent: number })[];
  }, [tracks]);

  if (data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyMedium">No explicit data available</Text>
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
              labels={({ datum }: { datum: any }) => {
                const y = typeof datum.y === 'number' ? datum.y : 0;
                if (datum.childName === 'ExplicitPercent') {
                  return `${y}% Explicit`;
                }
                return `${datum.childName}: ${y} tracks`;
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
            domain={[0, Math.max(...data.map(d => (Number(d.explicit) || 0) + (Number(d.clean) || 0)), 100)]}
            style={{
              axis: { stroke: theme.colors.outlineVariant },
              tickLabels: { fill: theme.colors.onSurfaceVariant, fontSize: 8 },
              grid: { stroke: theme.colors.outlineVariant, strokeDasharray: "4, 4" }
            }}
          />
          
          <VictoryStack colorScale={["#E91E63", "#42A5F5"]}>
            <VictoryBar
              name="Explicit"
              data={data}
              x="month"
              y="explicit"
              animate={{ duration: 500 }}
            />
            <VictoryBar
              name="Clean"
              data={data}
              x="month"
              y="clean"
              animate={{ duration: 500 }}
            />
          </VictoryStack>

          <VictoryLine
            name="ExplicitPercent"
            data={data}
            x="month"
            y="explicitPercent"
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

export default ExplicitContentChart;

