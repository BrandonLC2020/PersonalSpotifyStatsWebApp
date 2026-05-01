import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, useTheme, Card, CardContent, Avatar, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import useSpotifyWeb from '../../hooks/useSpotifyWeb';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  external_urls: {
    spotify: string;
  };
}

const TrackItem = ({ track, index }: { track: Track; index: number }) => {
  const theme = useTheme();
  return (
    <Box sx={{ cursor: "pointer", mb: 2 }} onClick={() => window.open(track.external_urls.spotify, '_blank')}>
      <Card sx={styles.card}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={styles.avatarContainer}>
            <Box component="img" 
              src={track.album.images[0]?.url || 'https://via.placeholder.com/150'} 
              sx={styles.thumbnail}
            />
            <Box sx={styles.rankBadge}>
              <Typography sx={styles.rankText}>{index + 1}</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1, ml: 2, minWidth: 0 }}>
            <Typography variant="h6" noWrap>{track.name}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {track.artists.length > 0 ? track.artists.map(a => a.name).join(', ') : ''}
            </Typography>
          </Box>
          <Typography sx={styles.albumText} noWrap>
            {track.album.name}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

const CurrentTopTracks = () => {
  const { spotifyApi, loading, error } = useSpotifyWeb();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [fetching, setFetching] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (spotifyApi) {
      const fetchTracks = async () => {
        setFetching(true);
        try {
          const response = await spotifyApi.getMyTopTracks({ limit: 50, time_range: 'short_term' });
          setTracks(response.items as Track[]);
        } catch (e) {
          console.error(e);
        } finally {
          setFetching(false);
        }
      };
      fetchTracks();
    }
  }, [spotifyApi]);

  if (loading || fetching) {
    return <Box sx={styles.centered}><CircularProgress size={60} /></Box>;
  }

  if (error) {
    return <Box sx={styles.centered}><Typography color="error">Error: {error.message}</Typography></Box>;
  }

  return (
    <Box sx={styles.list}>
      {tracks.map((track, index) => (
        <TrackItem key={track.id} track={track} index={index} />
      ))}
    </Box>
  );
};

const styles = {
  centered: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
  },
  list: {
    p: 2,
    pb: 10,
  },
  card: {
    borderRadius: 3,
    bgcolor: 'action.disabledBackground',
  },
  avatarContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
    objectFit: 'cover' as const,
  },
  rankBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    backgroundColor: '#1DB954',
    borderRadius: '50%',
    width: 20,
    height: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid white',
  },
  rankText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  albumText: {
    fontSize: 12,
    opacity: 0.6,
    ml: 2,
    maxWidth: 100,
  }
};

export default CurrentTopTracks;