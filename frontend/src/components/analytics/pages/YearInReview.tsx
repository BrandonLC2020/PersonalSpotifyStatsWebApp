import React, { useMemo, useState, useEffect } from 'react';
import {
  Box, Typography, Paper, CircularProgress, Alert, IconButton
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from '../charts/TypedRecharts';
import { useTheme } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SpotifyWebApi from 'spotify-web-api-js';
import useAnalyticsData from '../../../hooks/useAnalyticsData';
import useAudioFeatures from '../../../hooks/useAudioFeatures';
import { computeLoyaltyStats, computeAudioProfileAvg } from '../../../utils/analyticsUtils';
import { getChartStyles, getTooltipStyle, getMonthLabel, CHART_COLORS } from '../../../utils/chartTheme';
import MusicDNACard from '../charts/MusicDNACard';

interface Props {
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
}

const MotionBox = motion(Box);

const Section: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
  <MotionBox
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 6 }}
  >
    {children}
  </MotionBox>
);

const YearInReview: React.FC<Props> = ({ spotifyApi }) => {
  const theme = useTheme();
  const mode = theme.palette.mode as 'light' | 'dark';
  const styles = getChartStyles(mode);
  const tooltipStyles = getTooltipStyle(mode);
  const { year: yearParam } = useParams<{ year: string }>();
  const navigate = useNavigate();
  const year = parseInt(yearParam || '2025', 10);

  const { tracks, artists, albums, allMonths, loading, error } = useAnalyticsData();
  const { fetchFeatures, error: audioError } = useAudioFeatures(spotifyApi);
  const [valenceArc, setValenceArc] = useState<{ month: string; valence: number }[]>([]);
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
    // Most appeared track
    const trackCounts = new Map<string, { name: string; count: number }>();
    yearTracks.forEach(g => g.records.forEach(t => {
      const entry = trackCounts.get(t.track_id) || { name: t.name, count: 0 };
      entry.count++;
      trackCounts.set(t.track_id, entry);
    }));
    const topTrack = trackCounts.size > 0
      ? Array.from(trackCounts.entries()).sort(([, a], [, b]) => b.count - a.count)[0]
      : null;

    // Most appeared artist
    const artistCounts = new Map<string, { name: string; count: number; image?: string }>();
    yearArtists.forEach(g => g.records.forEach(a => {
      const entry = artistCounts.get(a.artist_id) || { name: a.name, count: 0, image: a.images?.[0]?.url };
      entry.count++;
      artistCounts.set(a.artist_id, entry);
    }));
    const topArtist = artistCounts.size > 0
      ? Array.from(artistCounts.entries()).sort(([, a], [, b]) => b.count - a.count)[0]
      : null;

    // Most appeared album
    const albumCounts = new Map<string, { name: string; count: number; image?: string }>();
    yearAlbums.forEach(g => g.records.forEach(a => {
      const entry = albumCounts.get(a.album_id) || { name: a.name, count: 0, image: a.images?.[0]?.url };
      entry.count++;
      albumCounts.set(a.album_id, entry);
    }));
    const topAlbum = albumCounts.size > 0
      ? Array.from(albumCounts.entries()).sort(([, a], [, b]) => b.count - a.count)[0]
      : null;

    // Genre cloud
    const genreCounts = new Map<string, number>();
    yearArtists.forEach(g => g.records.forEach(a => {
      const genres = Array.isArray(a.genres) ? a.genres : (() => { try { return JSON.parse(a.genres as string); } catch { return []; } })();
      genres.forEach((genre: string) => genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1));
    }));
    const topGenres = Array.from(genreCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20);

    // Unique counts
    const uniqueTracks = new Set(yearTracks.flatMap(g => g.records.map(t => t.track_id))).size;
    const uniqueArtists = new Set(yearArtists.flatMap(g => g.records.map(a => a.artist_id))).size;
    const uniqueAlbums = new Set(yearAlbums.flatMap(g => g.records.map(a => a.album_id))).size;

    return { topTrack, topArtist, topAlbum, topGenres, uniqueTracks, uniqueArtists, uniqueAlbums };
  }, [yearTracks, yearArtists, yearAlbums]);

  // Set top artist image
  useEffect(() => {
    if (summary.topArtist) {
      setTopArtistImage(summary.topArtist[1].image || '');
    }
  }, [summary]);

  // Fetch valence arc (skip if audio features deprecated)
  useEffect(() => {
    if (audioError === 'DEPRECATED') return;

    const load = async () => {
      const monthlyValences: { month: string; valence: number }[] = [];

      for (const group of yearTracks.sort((a, b) => a.month - b.month)) {
        const ids = group.records.map(t => t.track_id);
        if (ids.length === 0) continue;

        const features = await fetchFeatures(ids);
        const avg = computeAudioProfileAvg(features);
        monthlyValences.push({
          month: getMonthLabel(group.month, group.year),
          valence: avg?.valence ?? 0,
        });
      }

      setValenceArc(monthlyValences);
    };

    if (yearTracks.length > 0) load();
  }, [yearTracks, fetchFeatures, audioError]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress size={48} /></Box>;
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  if (yearTracks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h5" color="text.secondary">No data available for {year}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Year navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
        <IconButton
          onClick={() => navigate(`/analytics/year/${year - 1}`)}
          disabled={!availableYears.includes(year - 1)}
          color="primary"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" color="text.secondary">{year}</Typography>
        <IconButton
          onClick={() => navigate(`/analytics/year/${year + 1}`)}
          disabled={!availableYears.includes(year + 1)}
          color="primary"
        >
          <ArrowForwardIcon />
        </IconButton>
      </Box>

      {/* Section 1: Hero */}
      <Section>
        <Box sx={{ textAlign: 'center' }}>
          <MotionBox
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '4rem', md: '8rem' },
                background: 'linear-gradient(135deg, #1DB954 0%, #1ED760 30%, #42A5F5 70%, #9C27B0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
              }}
            >
              {year}
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mt: 2 }}>
              Your Year in Music
            </Typography>
          </MotionBox>
        </Box>
      </Section>

      {/* Section 2: Top Artist */}
      {summary.topArtist && (
        <Section delay={0.1}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="overline" sx={{ color: '#1DB954', letterSpacing: 3 }}>
              YOUR TOP ARTIST
            </Typography>
            {topArtistImage && (
              <Box
                component="img"
                src={topArtistImage}
                alt={summary.topArtist[1].name}
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  mx: 'auto',
                  my: 3,
                  border: '3px solid',
                  borderColor: 'primary.main',
                  boxShadow: '0 0 40px rgba(29, 185, 84, 0.3)',
                }}
              />
            )}
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {summary.topArtist[1].name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Appeared in your top list for <strong>{summary.topArtist[1].count}</strong> months
            </Typography>
          </Box>
        </Section>
      )}

      {/* Section 3: Top Track */}
      {summary.topTrack && (
        <Section delay={0.1}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="overline" sx={{ color: '#1DB954', letterSpacing: 3 }}>
              YOUR TOP TRACK
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mt: 2 }}>
              🎵 {summary.topTrack[1].name}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              In your top tracks for <strong>{summary.topTrack[1].count}</strong> months this year
            </Typography>
          </Box>
        </Section>
      )}

      {/* Section 4: Genre Cloud */}
      {summary.topGenres.length > 0 && (
        <Section delay={0.1}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="overline" sx={{ color: '#1DB954', letterSpacing: 3 }}>
              YOUR SOUND
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, mb: 3 }}>
              Genre Cloud
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5, maxWidth: 600, mx: 'auto' }}>
              {summary.topGenres.map(([genre, count], i) => (
                <MotionBox
                  key={genre}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Paper sx={{
                    px: 2,
                    py: 0.8,
                    borderRadius: 4,
                    backgroundColor: `${CHART_COLORS[i % CHART_COLORS.length]}20`,
                    border: `1px solid ${CHART_COLORS[i % CHART_COLORS.length]}40`,
                    fontSize: Math.max(11, Math.min(18, 10 + count * 1.5)),
                    fontWeight: 500,
                    color: CHART_COLORS[i % CHART_COLORS.length],
                  }}>
                    {genre}
                  </Paper>
                </MotionBox>
              ))}
            </Box>
          </Box>
        </Section>
      )}

      {/* Section 5: Mood Arc */}
      {valenceArc.length > 0 && (
        <Section delay={0.1}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="overline" sx={{ color: '#1DB954', letterSpacing: 3 }}>
              YOUR MOOD ARC
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, mb: 3 }}>
              Your emotional journey through {year}
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={valenceArc} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="valenceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1DB954" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={styles.gridColor} />
                <XAxis dataKey="month" tick={{ fill: styles.axisColor, fontSize: 11 }} />
                <YAxis
                  domain={[0, 1]}
                  tick={{ fill: styles.axisColor, fontSize: 11 }}
                  tickFormatter={(v: number) => v >= 0.5 ? '😊' : '😢'}
                />
                <Tooltip
                  contentStyle={tooltipStyles.contentStyle}
                  formatter={(v: number) => [`${Math.round(v * 100)}% happy`, 'Mood']}
                />
                <Line
                  type="monotone"
                  dataKey="valence"
                  stroke="#1DB954"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#1DB954', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Section>
      )}

      {/* Section 6: By the Numbers */}
      <Section delay={0.1}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="overline" sx={{ color: '#1DB954', letterSpacing: 3 }}>
            BY THE NUMBERS
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, mt: 4, flexWrap: 'wrap' }}>
            {[
              { label: 'Unique Tracks', value: summary.uniqueTracks, emoji: '🎵' },
              { label: 'Unique Artists', value: summary.uniqueArtists, emoji: '🎤' },
              { label: 'Unique Albums', value: summary.uniqueAlbums, emoji: '💿' },
              { label: 'Genres', value: summary.topGenres.length, emoji: '🎼' },
            ].map(s => (
              <MotionBox
                key={s.label}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200 }}
                sx={{ textAlign: 'center' }}
              >
                <Typography variant="h3">{s.emoji}</Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #1DB954, #1ED760)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {s.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">{s.label}</Typography>
              </MotionBox>
            ))}
          </Box>
        </Box>
      </Section>

      {/* Section 7: Music DNA for this year */}
      <Section delay={0.1}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="overline" sx={{ color: '#1DB954', letterSpacing: 3 }}>
            YOUR {year} MUSIC DNA
          </Typography>
        </Box>
        <MusicDNACard tracks={yearTracks} artists={yearArtists} albums={yearAlbums} spotifyApi={spotifyApi} />
      </Section>

      {/* Outro */}
      <Section>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}>
            That was your {year} 🎉
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            {availableYears
              .filter(y => y !== year)
              .slice(0, 3)
              .map(y => (
                <Paper
                  key={y}
                  component={motion.div}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/analytics/year/${y}`)}
                  sx={{
                    px: 3, py: 1.5, cursor: 'pointer',
                    borderRadius: 2,
                    backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    '&:hover': { backgroundColor: mode === 'dark' ? 'rgba(29, 185, 84, 0.1)' : 'rgba(29, 185, 84, 0.05)' },
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>See {y}</Typography>
                </Paper>
              ))}
          </Box>
        </Box>
      </Section>
    </Box>
  );
};

export default YearInReview;
