import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useTheme, Text, SegmentedButtons, Tooltip } from 'react-native-paper';
import { GroupedRecords, Track, Artist } from '../../../types';
import { computePopularityHeatmap } from '../../../utils/analyticsUtils';

const { width } = Dimensions.get('window');

interface Props {
  tracks: GroupedRecords<Track>[];
  artists: GroupedRecords<Artist>[];
}

const PopularityHeatmap: React.FC<Props> = ({ tracks, artists }) => {
  const theme = useTheme();
  const [entityType, setEntityType] = useState<'tracks' | 'artists'>('tracks');

  const source = entityType === 'tracks' ? tracks : artists;

  const { cells, months, maxStanding } = useMemo(() => {
    const cells = computePopularityHeatmap(source as any, 10);
    const months = Array.from(new Set(cells.map(c => c.month)));
    return { cells, months, maxStanding: 10 };
  }, [source]);

  const getColor = (popularity: number): string => {
    if (popularity === 0) return theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const normalized = popularity / 100;
    if (normalized < 0.33) {
      return `rgba(156, 39, 176, ${0.2 + normalized * 1.5})`;
    } else if (normalized < 0.66) {
      return `rgba(29, 185, 84, ${0.3 + (normalized - 0.33) * 1.5})`;
    } else {
      return `rgba(255, 193, 7, ${0.4 + (normalized - 0.66) * 1.5})`;
    }
  };

  if (months.length === 0) {
    return (
      <View style={styles.centered}>
        <Text variant="bodyMedium">No heatmap data available</Text>
      </View>
    );
  }

  const cellSize = 36;

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={entityType}
        onValueChange={value => setEntityType(value as 'tracks' | 'artists')}
        buttons={[
          { value: 'tracks', label: 'Tracks' },
          { value: 'artists', label: 'Artists' },
        ]}
        style={styles.toggle}
      />

      <ScrollView horizontal bounces={false}>
        <View style={styles.heatmapContainer}>
          {/* Header row labels */}
          <View style={[styles.row, { marginLeft: 40 }]}>
            {months.map(month => (
              <View key={month} style={[styles.headerCell, { width: cellSize }]}>
                <Text style={styles.headerText} numberOfLines={1}>{month.split(' ')[0]}</Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {Array.from({ length: maxStanding }, (_, i) => i + 1).map(standing => (
            <View key={standing} style={styles.row}>
              <View style={styles.standingLabel}>
                <Text variant="labelSmall">#{standing}</Text>
              </View>
              {months.map(month => {
                const cell = cells.find(c => c.month === month && c.standing === standing);
                return (
                  <Tooltip key={`${month}-${standing}`} title={cell ? `${cell.name} (${cell.popularity})` : 'No data'}>
                    <View
                        style={[
                            styles.cell,
                            {
                                width: cellSize - 4,
                                height: cellSize - 4,
                                backgroundColor: cell ? getColor(cell.popularity) : (theme.dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)')
                            }
                        ]}
                    />
                  </Tooltip>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text variant="labelSmall">Low</Text>
        <View style={styles.legendGradient}>
          {[10, 40, 70, 100].map(v => (
            <View key={v} style={[styles.legendStep, { backgroundColor: getColor(v) }]} />
          ))}
        </View>
        <Text variant="labelSmall">High</Text>
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
  heatmapContainer: {
    paddingRight: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  standingLabel: {
    width: 40,
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  headerCell: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 8,
    opacity: 0.6,
  },
  cell: {
    borderRadius: 4,
    margin: 1,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  legendGradient: {
    flexDirection: 'row',
    gap: 2,
  },
  legendStep: {
    width: 20,
    height: 10,
    borderRadius: 2,
  },
});

export default PopularityHeatmap;
