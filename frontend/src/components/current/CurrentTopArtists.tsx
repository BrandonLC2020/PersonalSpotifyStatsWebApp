import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, useTheme, Card, CardContent } from '@mui/material';
import useSpotifyWeb from '../../hooks/useSpotifyWeb';

interface Artist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
  external_urls: {
    spotify: string;
  };
}

const ArtistItem = ({ artist, index }: { artist: Artist; index: number }) => {
  const theme = useTheme();
  return (
    <Box sx={{ cursor: "pointer", mb: 2 }} onClick={() => window.open(artist.external_urls.spotify, '_blank')}>
      <Card sx={styles.card}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={styles.avatarContainer}>
            <Box component="img" 
              src={artist.images[0]?.url || 'https://via.placeholder.com/150'} 
              sx={styles.avatar}
            />
            <Box sx={styles.rankBadge}>
              <Typography sx={styles.rankText}>{index + 1}</Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1, ml: 2, minWidth: 0 }}>
            <Typography variant="h6" noWrap>{artist.name}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {artist.genres.length > 0 ? artist.genres.slice(0, 2).join(', ') : ''}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

const CurrentTopArtists = () => {
  const { spotifyApi, loading, error } = useSpotifyWeb();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [fetching, setFetching] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (spotifyApi) {
      const fetchArtists = async () => {
        setFetching(true);
        try {
          const response = await spotifyApi.getMyTopArtists({ limit: 50, time_range: 'short_term' });
          setArtists(response.items as Artist[]);
        } catch (e) {
          console.error(e);
        } finally {
          setFetching(false);
        }
      };
      fetchArtists();
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
      {artists.map((artist, index) => (
        <ArtistItem key={artist.id} artist={artist} index={index} />
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: '50%',
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
  }
};

export default CurrentTopArtists;