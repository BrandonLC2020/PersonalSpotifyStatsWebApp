import React, { useMemo, useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ShareIcon from '@mui/icons-material/Share';
import SpotifyWebApi from 'spotify-web-api-js';
import { GroupedRecords, Track, Artist, Album } from '../../../types';
import { computeLoyaltyStats, computeAudioProfileAvg } from '../../../utils/analyticsUtils';
import useAudioFeatures from '../../../hooks/useAudioFeatures';
import { toPng } from 'html-to-image';

interface Props {
  tracks: GroupedRecords<Track>[];
  artists: GroupedRecords<Artist>[];
  albums: GroupedRecords<Album>[];
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
}

const MusicDNACard: React.FC<Props> = ({ tracks, artists, albums, spotifyApi }) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const cardRef = useRef<HTMLDivElement>(null);
  const { fetchFeatures } = useAudioFeatures(spotifyApi);
  const [avgEnergy, setAvgEnergy] = useState<number | null>(null);
  const [avgDanceability, setAvgDanceability] = useState<number | null>(null);
  const [avgValence, setAvgValence] = useState<number | null>(null);

  // Compute static stats
  const stats = useMemo(() => {
    const uniqueTracks = new Set(tracks.flatMap(g => g.records.map(t => t.track_id))).size;
    const uniqueArtists = new Set(artists.flatMap(g => g.records.map(a => a.artist_id))).size;
    const uniqueAlbums = new Set(albums.flatMap(g => g.records.map(a => a.album_id))).size;

    // Top genre
    const genreCounts = new Map<string, number>();
    for (const group of artists) {
      for (const artist of group.records) {
        const genres = Array.isArray(artist.genres)
          ? artist.genres
          : typeof artist.genres === 'string'
          ? (() => { try { return JSON.parse(artist.genres as string); } catch { return []; } })()
          : [];
        for (const genre of genres) {
          genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
        }
      }
    }
    const topGenre = genreCounts.size > 0
      ? Array.from(genreCounts.entries()).sort((a, b) => b[1] - a[1])[0][0]
      : 'Unknown';

    // Avg popularity → obscurity
    const allPops = tracks.flatMap(g => g.records.map(t => t.popularity)).filter(p => p > 0);
    const avgPop = allPops.length > 0 ? allPops.reduce((a, b) => a + b, 0) / allPops.length : 50;
    const obscurityScore = Math.round(100 - avgPop);

    // Most loyal artist
    const loyalty = computeLoyaltyStats(artists);
    const mostLoyal = loyalty.length > 0 ? loyalty[0] : null;

    return { uniqueTracks, uniqueArtists, uniqueAlbums, topGenre, obscurityScore, mostLoyal, avgPop };
  }, [tracks, artists, albums]);

  // Fetch audio features for DNA stats
  useEffect(() => {
    const load = async () => {
      const allTrackIds = Array.from(new Set(tracks.flatMap(g => g.records.map(t => t.track_id))));
      if (allTrackIds.length === 0) return;

      const features = await fetchFeatures(allTrackIds.slice(0, 200)); // Cap to avoid excessive API calls
      const avg = computeAudioProfileAvg(features);
      if (avg) {
        setAvgEnergy(avg.energy);
        setAvgDanceability(avg.danceability);
        setAvgValence(avg.valence);
      }
    };
    load();
  }, [tracks, fetchFeatures]);

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = 'my-music-dna.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export card:', err);
    }
  };

  const StatItem = ({ label, value, emoji }: { label: string; value: string | number; emoji: string }) => (
    <Box sx={{ textAlign: 'center', flex: '1 1 45%', minWidth: 120, py: 1 }}>
      <Typography variant="h5" sx={{ mb: 0.5 }}>{emoji}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#fff' }}>{value}</Typography>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>{label}</Typography>
    </Box>
  );

  const Meter = ({ label, value }: { label: string; value: number | null }) => (
    <Box sx={{ flex: '1 1 45%', minWidth: 120, py: 1 }}>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5, display: 'block' }}>
        {label}
      </Typography>
      <Box sx={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
        <Box sx={{
          height: '100%',
          width: value !== null ? `${value * 100}%` : '0%',
          borderRadius: 3,
          background: 'linear-gradient(90deg, #1DB954, #1ED760)',
          transition: 'width 1s ease-out',
        }} />
      </Box>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5, display: 'block' }}>
        {value !== null ? `${Math.round(value * 100)}%` : '...'}
      </Typography>
    </Box>
  );

  return (
    <Paper
      ref={cardRef}
      sx={{
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #1a0533 0%, #0d1117 30%, #0a1628 60%, #0f2b1a 100%)',
        border: '1px solid rgba(29, 185, 84, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 20%, rgba(29, 185, 84, 0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="overline" sx={{ color: '#1DB954', letterSpacing: 2 }}>
            YOUR MUSIC
          </Typography>
          <Typography variant="h5" sx={{
            fontWeight: 700,
            color: '#fff',
            background: 'linear-gradient(135deg, #1DB954, #1ED760)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            DNA
          </Typography>
        </Box>
        <Tooltip title="Download as image">
          <IconButton onClick={handleShare} sx={{ color: 'rgba(255,255,255,0.5)' }}>
            <ShareIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <StatItem emoji="🎵" label="Top Genre" value={stats.topGenre} />
        <StatItem emoji="🎯" label="Obscurity Score" value={`${stats.obscurityScore}/100`} />
        <StatItem emoji="🤝" label="Most Loyal" value={stats.mostLoyal?.name ?? 'N/A'} />
        <StatItem emoji="📊" label="Unique Tracks" value={stats.uniqueTracks} />
        <StatItem emoji="🎤" label="Unique Artists" value={stats.uniqueArtists} />
        <StatItem emoji="💿" label="Unique Albums" value={stats.uniqueAlbums} />
      </Box>

      {/* Audio meters */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Meter label="Energy" value={avgEnergy} />
        <Meter label="Danceability" value={avgDanceability} />
        <Meter label="Happiness" value={avgValence} />
      </Box>
    </Paper>
  );
};

export default MusicDNACard;
