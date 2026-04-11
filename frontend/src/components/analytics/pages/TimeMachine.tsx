import React, { useMemo, useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid,
  CircularProgress, Alert, Chip, Avatar
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from '../charts/TypedRecharts';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import SpotifyWebApi from 'spotify-web-api-js';
import useAnalyticsData from '../../../hooks/useAnalyticsData';
import { chartCardSx, CHART_COLORS, getMonthLabel } from '../../../utils/chartTheme';

interface Props {
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
}

const MotionBox = motion(Box);

const TimeMachine: React.FC<Props> = ({ spotifyApi }) => {
  const theme = useTheme();
  const mode = theme.palette.mode as 'light' | 'dark';
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

  // Genre pie data for the selected month
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
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [selectedData]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  // Group months by year for the selector
  const monthsByYear = allMonths.reduce((acc, m) => {
    if (!acc[m.year]) acc[m.year] = [];
    acc[m.year].push(m);
    return acc;
  }, {} as Record<number, typeof allMonths>);

  const MonthSnapshot = ({ data, label }: { data: ReturnType<typeof getMonthData>; label: string }) => {
    if (!data) return <Typography color="text.secondary">Select a month</Typography>;

    return (
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
          {label}
        </Typography>

        {/* Top Tracks */}
        {data.tracks && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>🎵 Top Tracks</Typography>
            {data.tracks.records.slice(0, 10).map((track, i) => (
              <Box key={track.track_id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 20 }}>
                  {i + 1}
                </Typography>
                {albumArt[track.track_id] && (
                  <Avatar
                    src={albumArt[track.track_id]}
                    sx={{ width: 32, height: 32, borderRadius: 1 }}
                    variant="rounded"
                  />
                )}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{track.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pop: {track.popularity}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Top Artists */}
        {data.artists && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>🎤 Top Artists</Typography>
            {data.artists.records.slice(0, 10).map((artist, i) => (
              <Box key={artist.artist_id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 20 }}>
                  {i + 1}
                </Typography>
                {artist.images?.[0]?.url && (
                  <Avatar src={artist.images[0].url} sx={{ width: 32, height: 32 }} />
                )}
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{artist.name}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Genre Breakdown */}
        {genrePieData.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>🎵 Genre Breakdown</Typography>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={genrePieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name }: { name: string }) => name}
                  labelLine={{ strokeWidth: 1 }}
                >
                  {genrePieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 1,
          background: 'linear-gradient(135deg, #1DB954 0%, #42A5F5 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        ⏰ Time Machine
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Travel back to any month and see what you were listening to
      </Typography>

      {/* Month selector */}
      <Paper sx={{ ...chartCardSx(mode), mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Select a Month</Typography>
          <Chip
            label={compareMode ? 'Compare Mode ON' : 'Compare Mode OFF'}
            color={compareMode ? 'primary' : 'default'}
            onClick={() => setCompareMode(!compareMode)}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>

        {Object.entries(monthsByYear)
          .sort(([a], [b]) => Number(b) - Number(a))
          .map(([year, months]) => (
            <Box key={year} sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                {year}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {months.map(m => (
                  <Chip
                    key={m.key}
                    label={m.label.split(' ')[0]} // Just month abbreviation
                    size="small"
                    color={selectedMonth === m.key ? 'primary' : comparisonMonth === m.key ? 'secondary' : 'default'}
                    variant={selectedMonth === m.key || comparisonMonth === m.key ? 'filled' : 'outlined'}
                    onClick={() => {
                      if (compareMode && selectedMonth && selectedMonth !== m.key) {
                        setComparisonMonth(m.key);
                      } else {
                        setSelectedMonth(m.key);
                        setComparisonMonth(null);
                      }
                    }}
                    sx={{ fontWeight: 500 }}
                  />
                ))}
              </Box>
            </Box>
          ))}
      </Paper>

      {/* Month snapshot(s) */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={compareMode && comparisonData ? 6 : 12}>
          <Paper sx={chartCardSx(mode)}>
            <MonthSnapshot data={selectedData} label={selectedData?.label || ''} />
          </Paper>
        </Grid>
        {compareMode && comparisonData && (
          <Grid item xs={12} md={6}>
            <Paper sx={chartCardSx(mode)}>
              <MonthSnapshot data={comparisonData} label={comparisonData?.label || ''} />
            </Paper>
          </Grid>
        )}
      </Grid>
    </MotionBox>
  );
};

export default TimeMachine;
