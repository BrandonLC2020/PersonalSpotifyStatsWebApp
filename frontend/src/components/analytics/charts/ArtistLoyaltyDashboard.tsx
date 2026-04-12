import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, ScrollView, Platform, TextInput } from 'react-native';
import { useTheme, Text, SegmentedButtons, DataTable, Avatar, ActivityIndicator } from 'react-native-paper';
import { CartesianChart, StackedBar, Line, useChartPressState } from 'victory-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import { GroupedRecords, Artist } from '../../../types';
import { computeLoyaltyStats, computeEntityChurn } from '../../../utils/analyticsUtils';

const { width } = Dimensions.get('window');
const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

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

  const { state, isActive } = useChartPressState({ 
      x: "", 
      y: { entered: 0, exited: 0, retained: 0 } 
  });

  const tooltipTextProps = useAnimatedProps(() => {
    return {
      text: `${state.x.value.value}: +${state.y.entered.value.value} | -${state.y.exited.value.value}`,
    } as any;
  });

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
      ) : (
        <View>
          <View style={{ height: 300 }}>
            <CartesianChart
              data={churnData}
              xKey="label"
              yKeys={["entered", "exited", "retained"]}
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
                    points={[points.entered, points.exited]}
                    chartBounds={chartBounds}
                    colors={["#1DB954", "#E91E63"]}
                    barWidth={15}
                    animate={{ type: "timing", duration: 300 }}
                  />
                  <Line
                    points={points.retained}
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

export default ArtistLoyaltyDashboard;
