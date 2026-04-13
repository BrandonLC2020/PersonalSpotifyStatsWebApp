import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, ScrollView } from 'react-native';
import { useTheme, Text, SegmentedButtons, DataTable, Avatar } from 'react-native-paper';
import { 
  VictoryChart, 
  VictoryBar, 
  VictoryLine, 
  VictoryAxis, 
  VictoryStack, 
  VictoryVoronoiContainer, 
  VictoryTooltip 
} from 'victory-native';
import { GroupedRecords, Artist } from '../../../types';
import { computeLoyaltyStats, computeEntityChurn } from '../../../utils/analyticsUtils';

const { width } = Dimensions.get('window');
const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

interface Props {
  artists: GroupedRecords<Artist>[];
}

const ArtistLoyaltyDashboard: React.FC<Props> = ({ artists }) => {
  const theme = useTheme();
  const [view, setView] = useState<'leaderboard' | 'churn'>('leaderboard');

  const loyaltyData = useMemo(() => computeLoyaltyStats(artists), [artists]);
  const churnData = useMemo(
    () => computeEntityChurn(artists, 'artist_id').map(m => ({
        ...m,
        label: `${String(m.month).split(' ')[0]}` // Short month
    })),
    [artists]
  );

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={view}
        onValueChange={value => setView(value as 'leaderboard' | 'churn')}
        buttons={[
          { value: 'leaderboard', label: 'Leaderboard' },
          { value: 'churn', label: 'Churn' },
        ]}
        style={styles.toggle}
      />

      {view === 'leaderboard' ? (
        <ScrollView horizontal bounces={false}>
          <DataTable style={{ width: width * 1.2 }}>
            <DataTable.Header>
              <DataTable.Title style={styles.rankCol}>#</DataTable.Title>
              <DataTable.Title style={styles.artistCol}>Artist</DataTable.Title>
              <DataTable.Title numeric>Months</DataTable.Title>
              <DataTable.Title numeric>Streak</DataTable.Title>
              <DataTable.Title numeric>Avg Rank</DataTable.Title>
            </DataTable.Header>

            {loyaltyData.slice(0, 10).map((entry, index) => (
              <DataTable.Row key={entry.id}>
                <DataTable.Cell style={styles.rankCol}>
                  {index < 3 ? (
                    <Avatar.Text 
                        size={24} 
                        label={(index + 1).toString()} 
                        style={{ backgroundColor: MEDAL_COLORS[index] }}
                        labelStyle={{ color: '#000', fontSize: 12, fontWeight: 'bold' }}
                    />
                  ) : (
                    <Text variant="bodySmall">{index + 1}</Text>
                  )}
                </DataTable.Cell>
                <DataTable.Cell style={styles.artistCol}>
                    <View style={styles.artistCell}>
                        {entry.image && <Image source={{ uri: entry.image }} style={styles.avatar} />}
                        <Text variant="bodySmall" numberOfLines={1}>{entry.name}</Text>
                    </View>
                </DataTable.Cell>
                <DataTable.Cell numeric>{entry.monthsAppeared}</DataTable.Cell>
                <DataTable.Cell numeric>{entry.longestStreak}</DataTable.Cell>
                <DataTable.Cell numeric>{entry.avgStanding}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </ScrollView>
      ) : churnData.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="bodyMedium">No historical data available</Text>
        </View>
      ) : (
        <View>
          <View style={styles.chartWrapper}>
            <VictoryChart
              width={width - 32}
              height={300}
              padding={{ top: 20, bottom: 40, left: 40, right: 40 }}
              containerComponent={
                <VictoryVoronoiContainer
                  labels={({ datum }: { datum: any }) => {
                    const y = typeof datum.y === 'number' ? datum.y : 0;
                    if (datum.childName === 'Retained') {
                      return `Retained: ${y}`;
                    }
                    return `${datum.childName}: ${y}`;
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
                domain={[0, Math.max(0, ...churnData.map(d => (Number(d.entered) || 0) + (Number(d.exited) || 0) + (Number(d.retained) || 0)), 1)]}
                style={{
                  axis: { stroke: theme.colors.outlineVariant },
                  tickLabels: { fill: theme.colors.onSurfaceVariant, fontSize: 8 },
                  grid: { stroke: theme.colors.outlineVariant, strokeDasharray: "4, 4" }
                }}
              />
              
              <VictoryStack colorScale={["#1DB954", "#E91E63"]}>
                <VictoryBar
                  name="Entered"
                  data={churnData}
                  x="label"
                  y="entered"
                  animate={{ duration: 500 }}
                />
                <VictoryBar
                  name="Exited"
                  data={churnData}
                  x="label"
                  y="exited"
                  animate={{ duration: 500 }}
                />
              </VictoryStack>

              <VictoryLine
                name="Retained"
                data={churnData}
                x="label"
                y="retained"
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
              <View style={[styles.colorDot, { backgroundColor: "#1DB954" }]} />
              <Text variant="labelSmall">Entered</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorDot, { backgroundColor: "#E91E63" }]} />
              <Text variant="labelSmall">Exited</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorDot, { backgroundColor: "#FF9800" }]} />
              <Text variant="labelSmall">Retained</Text>
            </View>
          </View>
        </View>
      )}
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
  toggle: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  rankCol: {
    flex: 0.1,
  },
  artistCol: {
    flex: 0.4,
  },
  artistCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
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

export default ArtistLoyaltyDashboard;

