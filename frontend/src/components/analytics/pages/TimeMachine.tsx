import React, { useMemo, useState, useEffect } from 'react';
import { Box, CardContent, CardHeader } from '@mui/material';
import { Typography, Card, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Avatar, Chip, CircularProgress, useTheme } from '@mui/material';
import { VictoryPie } from 'victory';
import SpotifyWebApi from 'spotify-web-api-js';
import useAnalyticsData from '../../../hooks/useAnalyticsData';
import { CHART_COLORS, getMonthLabel } from '../../../utils/chartTheme';

const width = window.innerWidth;

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

  if (loading) return <CircularProgress style={styles.centered} />;
  if (error) return <Box sx={styles.centered}><Typography style={{ color: theme.palette.error.main }}>{error}</Typography></Box>;

  const monthsByYear = allMonths.reduce((acc, m) => {
    if (!acc[m.year]) acc[m.year] = [];
    acc[m.year].push(m);
    return acc;
  }, {} as Record<number, typeof allMonths>);

  const MonthSnapshot = ({ data, label }: { data: ReturnType<typeof getMonthData>; label: string }) => {
    if (!data) return <Typography variant="body1">Select a month</Typography>;

    return (
      <Box>
        <Typography variant="h6" style={styles.snapshotTitle}>{label}</Typography>

        <Box>
          <Typography variant="h6">🎵 Top Tracks</Typography>
          <List>
          {data.tracks?.records.slice(0, 5).map((track, i) => (
            <ListItem key={track.track_id}>
              {albumArt[track.track_id] !== undefined ? 
                <ListItemAvatar><Avatar src={albumArt[track.track_id]} sx={styles.trackImage} /></ListItemAvatar> : 
                <ListItemIcon>music</ListItemIcon>}
              <ListItemText primary={track.name} secondary={`Popularity: ${track.popularity}`} />
            </ListItem>
          ))}
          </List>
        </Box>

        <Box>
          <Typography variant="h6">🎤 Top Artists</Typography>
          <List>
          {data.artists?.records.slice(0, 5).map((artist, i) => (
            <ListItem key={artist.artist_id}>
              {artist.images?.[0]?.url !== undefined ? 
                <ListItemAvatar><Avatar src={artist.images[0].url} sx={{ width: 32, height: 32 }} /></ListItemAvatar> : 
                <ListItemIcon>account</ListItemIcon>}
              <ListItemText primary={artist.name} />
            </ListItem>
          ))}
          </List>
        </Box>

        {genrePieData.length > 0 && (
          <Box sx={styles.chartContainer}>
            <Typography variant="subtitle1" style={{ marginBottom: 16 }}>Genre Breakdown</Typography>
            <Box sx={{ height: 200, width: width - 64 }}>
                <VictoryPie
                    data={genrePieData.map(d => ({ x: d.label, y: d.value }))}
                    colorScale={genrePieData.map(d => d.color)}
                    innerRadius={40}
                    padding={40}
                    labels={() => null}
                    height={200}
                    width={width - 64}
                    animate={{ duration: 500 }}
                />
            </Box>
            <Box sx={styles.legendContainer}>
                {genrePieData.map((d, i) => (
                    <Box key={d.label} sx={styles.legendItem}>
                        <Box sx={{ ...styles.colorDot,  backgroundColor: d.color  }} />
                        <Typography variant="caption">{d.label}</Typography>
                    </Box>
                ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ overflowY: "auto", ...styles.container }}>
      <Card style={styles.selectorCard}>
        <CardHeader title="Select a Month" subtitle={compareMode ? "Comparison Active" : ""} />
        <CardContent>
            {Object.entries(monthsByYear)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, months]) => (
                <Box key={year} sx={styles.yearRow}>
                    <Typography variant="caption">{year}</Typography>
                    <Box sx={styles.chipRow}>
                        {months
                        .sort((a, b) => b.month - a.month)
                        .map(m => (
                        <Chip
                            key={m.key}
                            label={m.label.split(' ')[0]}
                            color={selectedMonth === m.key || comparisonMonth === m.key ? "primary" : "default"}
                            onClick={() => {
                                if (compareMode && selectedMonth && selectedMonth !== m.key) {
                                    setComparisonMonth(m.key);
                                } else {
                                    setSelectedMonth(m.key);
                                    setComparisonMonth(null);
                                }
                            }}
                            style={styles.chip}
                        />
                        ))}
                    </Box>
                </Box>
            ))}
        </CardContent>
      </Card>

      <Box sx={styles.snapshotContainer}>
        <Card style={styles.snapshotCard}>
            <CardContent>
                <MonthSnapshot data={selectedData} label={selectedData?.label || ''} />
            </CardContent>
        </Card>
        
        {compareMode && comparisonMonth && comparisonData && (
             <Card sx={{ ...styles.snapshotCard,  marginTop: 16  }}>
                <CardContent>
                    <MonthSnapshot data={comparisonData} label={comparisonData?.label || ''} />
                </CardContent>
            </Card>
        )}
      </Box>
    </Box>
  );
};

const styles = {
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
};

export default TimeMachine;
