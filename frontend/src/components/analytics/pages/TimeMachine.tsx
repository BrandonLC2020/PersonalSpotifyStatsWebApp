import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { Text, Card, Title, Paragraph, List, Avatar, Chip, ActivityIndicator, useTheme } from 'react-native-paper';
import { PolarChart, Pie } from 'victory-native';
import SpotifyWebApi from 'spotify-web-api-js';
import useAnalyticsData from '../../../hooks/useAnalyticsData';
import { CHART_COLORS, getMonthLabel } from '../../../utils/chartTheme';

const { width } = Dimensions.get('window');

interface Props {
  spotifyApi?: SpotifyWebApi.SpotifyWebApiJs;
}

const TimeMachine: React.FC<Props> = ({ spotifyApi }) => {
  const theme = useTheme();
  const { tracks, artists, albums, allMonths, loading, error } = useAnalyticsData();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [comparisonMonth, setComparisonMonth] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [albumArt, setAlbumArt] = useState<Record<string, string>>({});

  // Auto-select most recent month
  useEffect(() => {
    if (allMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(allMonths[allMonths.length - 1].key);
    }
  }, [allMonths, selectedMonth]);

  // Fetch album art for selected month's tracks
  useEffect(() => {
    if (!selectedMonth || !spotifyApi) return;
    const [year, month] = selectedMonth.split('-').map(Number);
    const trackGroup = tracks.find(g => g.year === year && g.month === month);
    if (!trackGroup) return;

    const fetchArt = async () => {
      const ids = trackGroup.records.map(t => t.track_id).slice(0, 10);
      try {
        const data = await spotifyApi.getTracks(ids);
        const art: Record<string, string> = {};
        data.tracks.forEach(t => {
          if (t && t.album.images.length > 0) art[t.id] = t.album.images[0].url;
        });
        setAlbumArt(prev => ({ ...prev, ...art }));
      } catch (err) {
        console.error('Failed to fetch album art:', err);
      }
    };
    fetchArt();
  }, [selectedMonth, tracks, spotifyApi]);

  const getMonthData = (monthKey: string | null) => {
    if (!monthKey) return null;
    const [year, month] = monthKey.split('-').map(Number);
    return {
      tracks: tracks.find(g => g.year === year && g.month === month),
      artists: artists.find(g => g.year === year && g.month === month),
      albums: albums.find(g => g.year === year && g.month === month),
      label: getMonthLabel(month, year),
    };
  };

  const selectedData = getMonthData(selectedMonth);
  const comparisonData = compareMode ? getMonthData(comparisonMonth) : null;

  const genrePieData = useMemo(() => {
    if (!selectedData?.artists) return [];
    const counts = new Map<string, number>();
    for (const artist of selectedData.artists.records) {
      const genres = Array.isArray(artist.genres)
        ? artist.genres
        : typeof artist.genres === 'string'
        ? (() => { try { return JSON.parse(artist.genres as string); } catch { return []; } })()
        : [];
      for (const genre of genres) {
        counts.set(genre, (counts.get(genre) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value], i) => ({ 
          label, 
          value,
          color: CHART_COLORS[i % CHART_COLORS.length]
      }));
  }, [selectedData]);

  if (loading) return <ActivityIndicator style={styles.centered} />;
  if (error) return <View style={styles.centered}><Text style={{ color: theme.colors.error }}>{error}</Text></View>;

  const monthsByYear = allMonths.reduce((acc, m) => {
    if (!acc[m.year]) acc[m.year] = [];
    acc[m.year].push(m);
    return acc;
  }, {} as Record<number, typeof allMonths>);

  const MonthSnapshot = ({ data, label }: { data: ReturnType<typeof getMonthData>; label: string }) => {
    if (!data) return <Text variant="bodyMedium">Select a month</Text>;

    return (
      <View>
        <Text variant="titleLarge" style={styles.snapshotTitle}>{label}</Text>

        <List.Section title="🎵 Top Tracks">
          {data.tracks?.records.slice(0, 5).map((track, i) => (
            <List.Item
              key={track.track_id}
              title={track.name}
              description={`Popularity: ${track.popularity}`}
              left={props => 
                  albumArt[track.track_id] ? 
                  <List.Image {...props} source={{ uri: albumArt[track.track_id] }} style={styles.trackImage} /> : 
                  <List.Icon {...props} icon="music" />
              }
            />
          ))}
        </List.Section>

        <List.Section title="🎤 Top Artists">
          {data.artists?.records.slice(0, 5).map((artist, i) => (
            <List.Item
              key={artist.artist_id}
              title={artist.name}
              left={props => 
                artist.images?.[0]?.url ? 
                <Avatar.Image {...props} size={32} source={{ uri: artist.images[0].url }} /> : 
                <Avatar.Icon {...props} size={32} icon="account" />
              }
            />
          ))}
        </List.Section>

        {genrePieData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text variant="titleSmall" style={{ marginBottom: 16 }}>Genre Breakdown</Text>
            <View style={{ height: 200, width: width - 64 }}>
                <PolarChart
                    data={genrePieData}
                    labelKey="label"
                    valueKey="value"
                    colorKey="color"
                >
                    <Pie.Chart 
                        innerRadius={40}
                    />
                </PolarChart>
            </View>
            <View style={styles.legendContainer}>
                {genrePieData.map((d, i) => (
                    <View key={d.label} style={styles.legendItem}>
                        <View style={[styles.colorDot, { backgroundColor: d.color }]} />
                        <Text variant="labelSmall">{d.label}</Text>
                    </View>
                ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.selectorCard}>
        <Card.Title title="Select a Month" subtitle={compareMode ? "Comparison Active" : ""} />
        <Card.Content>
            {Object.entries(monthsByYear)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, months]) => (
                <View key={year} style={styles.yearRow}>
                    <Text variant="labelSmall">{year}</Text>
                    <View style={styles.chipRow}>
                        {months.map(m => (
                        <Chip
                            key={m.key}
                            selected={selectedMonth === m.key || comparisonMonth === m.key}
                            onPress={() => {
                                if (compareMode && selectedMonth && selectedMonth !== m.key) {
                                    setComparisonMonth(m.key);
                                } else {
                                    setSelectedMonth(m.key);
                                    setComparisonMonth(null);
                                }
                            }}
                            style={styles.chip}
                        >
                            {m.label.split(' ')[0]}
                        </Chip>
                        ))}
                    </View>
                </View>
            ))}
        </Card.Content>
      </Card>

      <View style={styles.snapshotContainer}>
        <Card style={styles.snapshotCard}>
            <Card.Content>
                <MonthSnapshot data={selectedData} label={selectedData?.label || ''} />
            </Card.Content>
        </Card>
        
        {compareMode && comparisonMonth && comparisonData && (
             <Card style={[styles.snapshotCard, { marginTop: 16 }]}>
                <Card.Content>
                    <MonthSnapshot data={comparisonData} label={comparisonData?.label || ''} />
                </Card.Content>
            </Card>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  selectorCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  yearRow: {
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  chip: {
    marginBottom: 4,
  },
  snapshotContainer: {
    marginBottom: 32,
  },
  snapshotCard: {
    borderRadius: 12,
  },
  snapshotTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1DB954',
  },
  trackImage: {
    width: 32,
    height: 32,
    borderRadius: 4,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  legendContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: 16,
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
  }
});

export default TimeMachine;
