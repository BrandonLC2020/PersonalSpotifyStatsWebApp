import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, ScrollView } from 'react-native';
import { useTheme, Text, SegmentedButtons, DataTable, Avatar } from 'react-native-paper';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryTooltip, VictoryVoronoiContainer, VictoryLine } from 'victory-native';
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
        <ScrollView horizontal>
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
      ) : (
        <View>
          <VictoryChart
            theme={VictoryTheme.material}
            width={width - 32}
            height={300}
            padding={{ top: 20, bottom: 50, left: 40, right: 30 }}
            containerComponent={
              <VictoryVoronoiContainer
                labels={({ datum }) => `${datum._group}: ${datum.y}`}
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
            
            <VictoryBar
              name="Entered"
              data={churnData.map(d => ({ x: d.month, y: d.entered }))}
              style={{ data: { fill: "#1DB954" } }}
            />
            <VictoryBar
              name="Exited"
              data={churnData.map(d => ({ x: d.month, y: d.exited }))}
              style={{ data: { fill: "#E91E63" } }}
            />
            <VictoryLine
              name="Retained"
              data={churnData.map(d => ({ x: d.month, y: d.retained }))}
              style={{ data: { stroke: "#FF9800", strokeWidth: 2 } }}
            />
          </VictoryChart>

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

export default ArtistLoyaltyDashboard;
