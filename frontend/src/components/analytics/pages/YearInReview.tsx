import React, { useMemo, useState, useEffect } from 'react';
import { Box, CardContent, CardHeader } from '@mui/material';
import { Typography, Card, CircularProgress, List, useTheme, Button, IconButton, Avatar, Icon } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import useAnalyticsData from '../../../hooks/useAnalyticsData';
import { CHART_COLORS } from '../../../utils/chartTheme';

const width = window.innerWidth;

const YearInReview: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const params = useParams();
    const year = params.year ? parseInt(params.year, 10) : new Date().getFullYear();

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

    if (loading) return <CircularProgress style={styles.centered} />;
    if (error) return <Box sx={styles.centered}><Typography style={{ color: theme.palette.error.main }}>{error}</Typography></Box>;

    if (yearTracks.length === 0) {
        return (
            <Box sx={styles.centered}>
                <Typography variant="h5">No data for {year}</Typography>
                <Button variant="contained" onClick={() => navigate(-1)} style={{ marginTop: 16 }}>Go Back</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ overflowY: "auto", ...styles.container }}>
            <Box sx={styles.nav}>
                <IconButton 
                    disabled={!availableYears.includes(year - 1)} 
                    onClick={() => navigate(`/analytics/year/${year - 1}`)}
                >
                    <Icon>arrow_back</Icon>
                </IconButton>
                <Typography variant="h5" style={styles.yearTitle}>{year}</Typography>
                <IconButton 
                    disabled={!availableYears.includes(year + 1)} 
                    onClick={() => navigate(`/analytics/year/${year + 1}`)}
                >
                    <Icon>arrow_forward</Icon>
                </IconButton>
            </Box>

            <Card style={styles.heroCard}>
                <CardContent sx={styles.centered}>
                    <Typography variant="h4" style={styles.heroText}>{year}</Typography>
                    <Typography variant="h6">Your Year in Music</Typography>
                </CardContent>
            </Card>

            {summary.topArtist && (
                <Card style={styles.sectionCard}>
                    <CardContent sx={styles.centered}>
                        <Typography variant="subtitle1" style={styles.sectionLabel}>YOUR TOP ARTIST</Typography>
                        {topArtistImage ? (
                            <Box component="img" src={topArtistImage} sx={styles.topArtistImage} />
                        ) : (
                            <Avatar sx={{ width: 120, height: 120, ...styles.artistPlaceholder }}><Icon>account_circle</Icon></Avatar>
                        )}
                        <Typography variant="h5" sx={styles.artistName}>{summary.topArtist[1].name}</Typography>
                        <Typography variant="body1">In your top list for {summary.topArtist[1].count} months</Typography>
                    </CardContent>
                </Card>
            )}

            {summary.topTrack && (
                <Card style={styles.sectionCard}>
                   <CardContent sx={styles.centered}>
                        <Typography variant="subtitle1" style={styles.sectionLabel}>YOUR TOP TRACK</Typography>
                        <Box sx={styles.trackHero}>
                            <Typography variant="h5" sx={styles.trackName}>🎵 {summary.topTrack[1].name}</Typography>
                            <Typography variant="body1">Featured in {summary.topTrack[1].count} months this year</Typography>
                        </Box>
                    </CardContent>
                </Card>
            )}

            <Card style={styles.sectionCard}>
                <CardHeader title="By the Numbers" />
                <CardContent sx={styles.statsGrid}>
                    <Box sx={styles.statBox}>
                        <Typography variant="h5" style={styles.statValue}>{summary.uniqueTracks}</Typography>
                        <Typography variant="caption">Tracks</Typography>
                    </Box>
                    <Box sx={styles.statBox}>
                        <Typography variant="h5" style={styles.statValue}>{summary.uniqueArtists}</Typography>
                        <Typography variant="caption">Artists</Typography>
                    </Box>
                    <Box sx={styles.statBox}>
                        <Typography variant="h5" style={styles.statValue}>{summary.uniqueAlbums}</Typography>
                        <Typography variant="caption">Albums</Typography>
                    </Box>
                    <Box sx={styles.statBox}>
                        <Typography variant="h5" style={styles.statValue}>{summary.topGenres.length}</Typography>
                        <Typography variant="caption">Genres</Typography>
                    </Box>
                </CardContent>
            </Card>

            <Box sx={styles.footer}>
                <Typography variant="h6" style={styles.footerText}>That was your {year} 🎉</Typography>
            </Box>
        </Box>
    );
};

const styles = {
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
    textAlign: "center",
  },
  trackHero: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  trackName: {
    fontWeight: 'bold',
    textAlign: "center",
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
};

export default YearInReview;
