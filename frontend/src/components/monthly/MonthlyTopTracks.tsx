import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../../utils/api';
import useSpotifyWeb from '../../hooks/useSpotifyWeb';

interface Track {
  track_id: string;
  name: string;
  album_id: string;
  artist_ids: string;
  popularity: number;
}

interface GroupedTracks {
  year: number;
  month: number;
  records: Track[];
}

const MonthlyTopTracks = () => {
  const [groupedTracks, setGroupedTracks] = useState<GroupedTracks[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [albumArt, setAlbumArt] = useState<Record<string, string>>({});
  const { spotifyApi } = useSpotifyWeb();

  useEffect(() => {
    const fetchTracksAndArt = async () => {
      try {
        const response = await api.get<GroupedTracks[]>('/api/tracks');
        const sortedData = response.data.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });
        setGroupedTracks(sortedData);
        setError(null);

        if (spotifyApi && response.data.length > 0) {
          const allTrackIds = response.data.flatMap(group => group.records.map(track => track.track_id));
          const chunk = 50;
          for (let i = 0; i < allTrackIds.length; i += chunk) {
            const trackIds = allTrackIds.slice(i, i + chunk);
            const tracksData = await spotifyApi.getTracks(trackIds);
            const art = tracksData.tracks.reduce((acc, track) => {
              if (track && track.album.images.length > 0) {
                acc[track.id] = track.album.images[0].url;
              }
              return acc;
            }, {} as Record<string, string>);
            setAlbumArt(prevArt => ({ ...prevArt, ...art }));
          }
        }
      } catch (err) {
        setError('Failed to fetch tracks. Make sure the backend server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracksAndArt();
  }, [spotifyApi]);

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  if (loading) {
    return <Box sx={styles.centered}><CircularProgress size={60} /></Box>;
  }

  if (error) {
    return (
      <Box sx={styles.centered}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Typography variant="h5" sx={styles.title}>Monthly Top Tracks</Typography>
      {groupedTracks.map((group, groupIndex) => (
        <Accordion key={`${group.year}-${group.month}`}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{`${getMonthName(group.month)} ${group.year}`}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List>
              {group.records.map((track, index) => (
                <ListItem key={track.track_id} divider>
                  <Typography sx={styles.rankText}>#{index + 1}</Typography>
                  <ListItemAvatar sx={{ ml: 1, mr: 2 }}>
                    <Box component="img"
                      src={albumArt[track.track_id] || 'https://via.placeholder.com/150'}
                      sx={styles.thumbnail}
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={track.name} 
                    secondary={`Popularity: ${track.popularity}`} 
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

const styles = {
  container: {
    flex: 1,
    overflowY: "auto",
    pb: 10,
  },
  title: {
    p: 2,
    fontWeight: 'bold',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    p: 3,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
    objectFit: 'cover' as const,
  },
  rankText: {
    fontWeight: 'bold',
    opacity: 0.6,
    width: 30,
    textAlign: "center",
  },
};

export default MonthlyTopTracks;