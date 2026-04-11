import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { VictoryChart, VictoryBar, VictoryLine, VictoryAxis, VictoryTheme, VictoryLegend, VictoryStack, VictoryVoronoiContainer, VictoryTooltip } from 'victory-native';
import { GroupedRecords, Track } from '../../../types';
import { computeExplicitRatio } from '../../../utils/analyticsUtils';

const { width } = Dimensions.get('window');

interface Props {
  tracks: GroupedRecords<Track>[];
}

const ExplicitContentChart: React.FC<Props> = ({ tracks }) => {
  const theme = useTheme();

  const data = useMemo(() => computeExplicitRatio(tracks), [tracks]);

  if (data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyMedium">No explicit data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VictoryChart
        theme={VictoryTheme.material}
        width={width - 32}
        height={300}
        padding={{ top: 20, bottom: 50, left: 50, right: 50 }}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) => `${datum.childName}: ${datum.y}${datum.childName === 'Explicit %' ? '%' : ''}`}
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
            axisLabel: { fontSize: 10, padding: 30, fill: theme.colors.onSurfaceVariant }
          }}
          label="Track Count"
        />
        
        <VictoryStack colorScale={["#E91E63", "#42A5F5"]}>
          <VictoryBar
            name="Explicit"
            data={data.map(d => ({ x: d.month, y: d.explicit }))}
          />
          <VictoryBar
            name="Clean"
            data={data.map(d => ({ x: d.month, y: d.clean }))}
          />
        </VictoryStack>

        <VictoryAxis
          dependentAxis
          orientation="right"
          domain={[0, 100]}
          style={{
            tickLabels: { fontSize: 10, fill: "#FF9800" },
            axisLabel: { fontSize: 10, padding: 35, fill: "#FF9800" }
          }}
          label="Explicit %"
        />
        
        <VictoryLine
          name="Explicit %"
          data={data.map(d => ({ x: d.month, y: d.explicitPercent }))}
          style={{
            data: { stroke: "#FF9800", strokeWidth: 2 }
          }}
        />
      </VictoryChart>
      
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
});

export default ExplicitContentChart;
