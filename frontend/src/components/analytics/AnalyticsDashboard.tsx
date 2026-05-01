import React from 'react';
import { Box, CardContent, CardHeader } from '@mui/material';
import { Typography, Card, CircularProgress, useTheme } from '@mui/material';
import useAnalyticsData from '../../hooks/useAnalyticsData';
import RankingMovementChart from './charts/RankingMovementChart';
import GenreDiversityChart from './charts/GenreDiversityChart';
import ExplicitContentChart from './charts/ExplicitContentChart';
import ArtistDominanceChart from './charts/ArtistDominanceChart';

const AnalyticsDashboard = () => {
  const { tracks, artists, allMonths, loading, error } = useAnalyticsData();
  const theme = useTheme();

  if (loading) {
    return <CircularProgress style={styles.centered} size="large" />;
  }

  if (error) {
    return (
      <Box sx={styles.centered}>
        <Typography style={{ color: theme.palette.error.main }}>{error}</Typography>
      </Box>
    );
  }

  const totalMonths = allMonths.length;
  const uniqueTracks = new Set(tracks.flatMap(g => g.records.map(r => r.track_id))).size;
  const uniqueArtists = new Set(artists.flatMap(g => g.records.map(r => r.artist_id))).size;

  return (
    <Box sx={{ overflowY: "auto", ...styles.container }}>
      <Box sx={styles.header}>
        <Typography variant="h4" style={styles.title}>Your Stats</Typography>
        <Typography variant="body1" sx={styles.subtitle}>
          Deep insights into your music taste across {totalMonths} months of data
        </Typography>
      </Box>

      <Box sx={styles.statsRow}>
        <Card style={styles.statCard}>
          <CardContent>
            <Typography variant="h5" style={styles.statValue}>{uniqueTracks}</Typography>
            <Typography variant="body2">Tracks</Typography>
          </CardContent>
        </Card>
        <Card style={styles.statCard}>
          <CardContent>
            <Typography variant="h5" style={styles.statValue}>{uniqueArtists}</Typography>
            <Typography variant="body2">Artists</Typography>
          </CardContent>
        </Card>
      </Box>

      <Card style={styles.chartCard}>
        <CardHeader title="Ranking Movement" subtitle="Top track and artist history" />
        <CardContent>
            <RankingMovementChart tracks={tracks} artists={artists} />
        </CardContent>
      </Card>

      <Card style={styles.chartCard}>
        <CardHeader title="Explicit Content" subtitle="Ratio of explicit vs clean tracks" />
        <CardContent>
            <ExplicitContentChart tracks={tracks} />
        </CardContent>
      </Card>

      <Card style={styles.chartCard}>
        <CardHeader title="Genre Diversity" subtitle="Distribution of your music taste" />
        <CardContent>
            <GenreDiversityChart artists={artists} />
        </CardContent>
      </Card>

      <Card style={styles.chartCard}>
        <CardHeader title="Artist Dominance" subtitle="Share of top tracks by artist" />
        <CardContent>
            <ArtistDominanceChart />
        </CardContent>
      </Card>

      <Box sx={styles.footer}>
        <Typography variant="caption" style={styles.footerText}>
            Personal Spotify Stats &copy; {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};

const styles = {
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
};

export default AnalyticsDashboard;
