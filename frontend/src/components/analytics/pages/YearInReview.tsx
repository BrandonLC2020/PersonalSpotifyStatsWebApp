import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Paragraph, ActivityIndicator, List, useTheme, Button, IconButton, Avatar } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import useAnalyticsData from '../../../hooks/useAnalyticsData';
import { CHART_COLORS } from '../../../utils/chartTheme';

const { width } = Dimensions.get('window');

const YearInReview: React.FC = () => {
    const theme = useTheme();
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const year = route.params?.year || new Date().getFullYear();

    const { tracks, artists, albums, allMonths, loading, error } = useAnalyticsData();
    const [topArtistImage, setTopArtistImage] = useState<string>('');

    // Filter data for the selected year
    const yearTracks = useMemo(() => tracks.filter(g => g.year === year), [tracks, year]);
    const yearArtists = useMemo(() => artists.filter(g => g.year === year), [artists, year]);
    const yearAlbums = useMemo(() => albums.filter(g => g.year === year), [albums, year]);

    // Available years
    const availableYears = useMemo(
        () => Array.from(new Set(allMonths.map(m => m.year))).sort((a, b) => b - a),
        [allMonths]
    );

    // Summary stats
    const summary = useMemo(() => {
        const trackCounts = new Map<string, { name: string; count: number }>();
        yearTracks.forEach(g => g.records.forEach(t => {
            const entry = trackCounts.get(t.track_id) || { name: t.name, count: 0 };
            entry.count++;
            trackCounts.set(t.track_id, entry);
        }));
        const topTrack = trackCounts.size > 0
            ? Array.from(trackCounts.entries()).sort(([, a], [, b]) => b.count - a.count)[0]
            : null;

        const artistCounts = new Map<string, { name: string; count: number; image?: string }>();
        yearArtists.forEach(g => g.records.forEach(a => {
            const entry = artistCounts.get(a.artist_id) || { name: a.name, count: 0, image: a.images?.[0]?.url };
            entry.count++;
            artistCounts.set(a.artist_id, entry);
        }));
        const topArtist = artistCounts.size > 0
            ? Array.from(artistCounts.entries()).sort(([, a], [, b]) => b.count - a.count)[0]
            : null;

        const albumCounts = new Map<string, { name: string; count: number; image?: string }>();
        yearAlbums.forEach(g => g.records.forEach(a => {
            const entry = albumCounts.get(a.album_id) || { name: a.name, count: 0, image: a.images?.[0]?.url };
            entry.count++;
            albumCounts.set(a.album_id, entry);
        }));
        const topAlbum = albumCounts.size > 0
            ? Array.from(albumCounts.entries()).sort(([, a], [, b]) => b.count - a.count)[0]
            : null;

        const genreCounts = new Map<string, number>();
        yearArtists.forEach(g => g.records.forEach(a => {
            const genres = Array.isArray(a.genres) ? a.genres : (() => { try { return JSON.parse(a.genres as string); } catch { return []; } })();
            genres.forEach((genre: string) => genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1));
        }));
        const topGenres = Array.from(genreCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);

        const uniqueTracks = new Set(yearTracks.flatMap(g => g.records.map(t => t.track_id))).size;
        const uniqueArtists = new Set(yearArtists.flatMap(g => g.records.map(a => a.artist_id))).size;
        const uniqueAlbums = new Set(yearAlbums.flatMap(g => g.records.map(a => a.album_id))).size;

        return { topTrack, topArtist, topAlbum, topGenres, uniqueTracks, uniqueArtists, uniqueAlbums };
    }, [yearTracks, yearArtists, yearAlbums]);

    useEffect(() => {
        if (summary.topArtist) {
            setTopArtistImage(summary.topArtist[1].image || '');
        }
    }, [summary]);

    if (loading) return <ActivityIndicator style={styles.centered} />;
    if (error) return <View style={styles.centered}><Text style={{ color: theme.colors.error }}>{error}</Text></View>;

    if (yearTracks.length === 0) {
        return (
            <View style={styles.centered}>
                <Text variant="headlineSmall">No data for {year}</Text>
                <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>Go Back</Button>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.nav}>
                <IconButton 
                    icon="arrow-left" 
                    disabled={!availableYears.includes(year - 1)} 
                    onPress={() => navigation.setParams({ year: year - 1 })}
                />
                <Text variant="headlineMedium" style={styles.yearTitle}>{year}</Text>
                <IconButton 
                    icon="arrow-right" 
                    disabled={!availableYears.includes(year + 1)} 
                    onPress={() => navigation.setParams({ year: year + 1 })}
                />
            </View>

            <Card style={styles.heroCard}>
                <Card.Content style={styles.centered}>
                    <Text variant="headlineLarge" style={styles.heroText}>{year}</Text>
                    <Text variant="titleMedium">Your Year in Music</Text>
                </Card.Content>
            </Card>

            {summary.topArtist && (
                <Card style={styles.sectionCard}>
                    <Card.Content style={styles.centered}>
                        <Text variant="labelLarge" style={styles.sectionLabel}>YOUR TOP ARTIST</Text>
                        {topArtistImage ? (
                            <Image source={{ uri: topArtistImage }} style={styles.topArtistImage} />
                        ) : (
                            <Avatar.Icon size={120} icon="account" style={styles.artistPlaceholder} />
                        )}
                        <Text variant="headlineMedium" style={styles.artistName}>{summary.topArtist[1].name}</Text>
                        <Text variant="bodyMedium">In your top list for {summary.topArtist[1].count} months</Text>
                    </Card.Content>
                </Card>
            )}

            {summary.topTrack && (
                <Card style={styles.sectionCard}>
                   <Card.Content style={styles.centered}>
                        <Text variant="labelLarge" style={styles.sectionLabel}>YOUR TOP TRACK</Text>
                        <View style={styles.trackHero}>
                            <Text variant="headlineSmall" style={styles.trackName}>🎵 {summary.topTrack[1].name}</Text>
                            <Text variant="bodyMedium">Featured in {summary.topTrack[1].count} months this year</Text>
                        </View>
                    </Card.Content>
                </Card>
            )}

            <Card style={styles.sectionCard}>
                <Card.Title title="By the Numbers" />
                <Card.Content style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text variant="headlineMedium" style={styles.statValue}>{summary.uniqueTracks}</Text>
                        <Text variant="labelSmall">Tracks</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text variant="headlineMedium" style={styles.statValue}>{summary.uniqueArtists}</Text>
                        <Text variant="labelSmall">Artists</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text variant="headlineMedium" style={styles.statValue}>{summary.uniqueAlbums}</Text>
                        <Text variant="labelSmall">Albums</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text variant="headlineMedium" style={styles.statValue}>{summary.topGenres.length}</Text>
                        <Text variant="labelSmall">Genres</Text>
                    </View>
                </Card.Content>
            </Card>

            <View style={styles.footer}>
                <Text variant="titleMedium" style={styles.footerText}>That was your {year} 🎉</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  yearTitle: {
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  heroCard: {
    marginBottom: 16,
    paddingVertical: 32,
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    borderRadius: 16,
  },
  heroText: {
    fontWeight: '900',
    fontSize: 64,
    color: '#1DB954',
  },
  sectionCard: {
    marginBottom: 16,
    borderRadius: 16,
    paddingVertical: 16,
  },
  sectionLabel: {
    color: '#1DB954',
    letterSpacing: 2,
    marginBottom: 16,
  },
  topArtistImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#1DB954',
  },
  artistPlaceholder: {
      marginBottom: 16,
  },
  artistName: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  trackHero: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  trackName: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statBox: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#1DB954',
  },
  footer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  footerText: {
    opacity: 0.6,
  }
});

export default YearInReview;
