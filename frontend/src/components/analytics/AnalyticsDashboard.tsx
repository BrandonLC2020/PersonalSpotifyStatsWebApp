import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, ActivityIndicator, useTheme } from 'react-native-paper';
import useAnalyticsData from '../../hooks/useAnalyticsData';
import RankingMovementChart from './charts/RankingMovementChart';
import GenreDiversityChart from './charts/GenreDiversityChart';
import ExplicitContentChart from './charts/ExplicitContentChart';
import ArtistDominanceChart from './charts/ArtistDominanceChart';

const AnalyticsDashboard = () => {
  const { tracks, artists, allMonths, loading, error } = useAnalyticsData();
  const theme = useTheme();

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: theme.colors.error }}>{error}</Text>
      </View>
    );
  }

  const totalMonths = allMonths.length;
  const uniqueTracks = new Set(tracks.flatMap(g => g.records.map(r => r.track_id))).size;
  const uniqueArtists = new Set(artists.flatMap(g => g.records.map(r => r.artist_id))).size;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>Your Stats</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Deep insights into your music taste across {totalMonths} months of data
        </Text>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.statValue}>{uniqueTracks}</Text>
            <Text variant="bodySmall">Tracks</Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.statValue}>{uniqueArtists}</Text>
            <Text variant="bodySmall">Artists</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.chartCard}>
        <Card.Title title="Ranking Movement" subtitle="Top track and artist history" />
        <Card.Content>
            <RankingMovementChart tracks={tracks} artists={artists} />
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Title title="Explicit Content" subtitle="Ratio of explicit vs clean tracks" />
        <Card.Content>
            <ExplicitContentChart tracks={tracks} />
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Title title="Genre Diversity" subtitle="Distribution of your music taste" />
        <Card.Content>
            <GenreDiversityChart artists={artists} />
        </Card.Content>
      </Card>

      <Card style={styles.chartCard}>
        <Card.Title title="Artist Dominance" subtitle="Share of top tracks by artist" />
        <Card.Content>
            <ArtistDominanceChart />
        </Card.Content>
      </Card>

      <View style={styles.footer}>
        <Text variant="labelSmall" style={styles.footerText}>
            Personal Spotify Stats &copy; {new Date().getFullYear()}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
  },
  title: {
    fontWeight: 'bold',
    color: '#1DB954',
  },
  subtitle: {
    opacity: 0.7,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#1DB954',
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
  },
  footer: {
    padding: 32,
    alignItems: 'center',
  },
  footerText: {
    opacity: 0.5,
  },
});

export default AnalyticsDashboard;
