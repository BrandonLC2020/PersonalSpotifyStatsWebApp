import React, { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Grid,
  Card,
  CardContent,
  Link,
  CardMedia
} from '@mui/material';
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

interface CurrentArtistsProps {
  viewMode: 'table' | 'grid';
}

const CurrentTopArtists: React.FC<CurrentArtistsProps> = ({ viewMode }) => {
  const { spotifyApi, loading: spotifyLoading, error: spotifyError } = useSpotifyWeb();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopArtists = async () => {
      if (!spotifyApi) return;

      try {
        setLoading(true);
        const response = await spotifyApi.getMyTopArtists({ limit: 50, time_range: 'short_term' });
        setArtists(response.items as Artist[]);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch top artists from Spotify:', err);
        setError('Failed to fetch top artists. Please ensure you are logged in to Spotify.');
      } finally {
        setLoading(false);
      }
    };

    if (!spotifyLoading) {
      fetchTopArtists();
    }
  }, [spotifyApi, spotifyLoading]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', e.currentTarget.src);
    e.currentTarget.src = 'https://via.placeholder.com/150';
  };

  if (loading || spotifyLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || spotifyError) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error || spotifyError?.message}</Alert>;
  }

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Current Top Artists
      </Typography>
      {viewMode === 'table' ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Genres</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {artists.map((artist, index) => (
                <TableRow key={artist.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Link href={artist.external_urls.spotify} target="_blank" rel="noopener noreferrer" color="inherit">
                      {artist.name}
                    </Link>
                  </TableCell>
                  <TableCell>{artist.genres.join(', ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={2}>
          {artists.map((artist) => (
            <Grid item xs={6} sm={4} md={3} key={artist.id}>
              <Card sx={{ height: '100%', backgroundColor: 'background.card' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={artist.images[0]?.url || 'https://via.placeholder.com/150'}
                  alt={artist.name}
                  onError={handleImageError}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    <Link href={artist.external_urls.spotify} target="_blank" rel="noopener noreferrer" color="inherit">
                      {artist.name}
                    </Link>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {artist.genres.join(', ')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default CurrentTopArtists;