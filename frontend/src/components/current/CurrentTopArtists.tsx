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
import SpotifyWebApi from 'spotify-web-api-js';

// Define the structure of an Artist object
interface Artist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
  external_urls: {
    spotify: string;
  };
}

// Update props to receive the spotifyApi object
interface CurrentArtistsProps {
  viewMode: 'table' | 'grid';
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
}

const CurrentTopArtists: React.FC<CurrentArtistsProps> = ({ viewMode, spotifyApi }) => {
  // Remove the useSpotifyWeb() hook call
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopArtists = async () => {
      setLoading(true);
      try {
        const response = await spotifyApi.getMyTopArtists({ limit: 50, time_range: 'short_term' });
        setArtists(response.items as Artist[]);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch top artists from Spotify:', err);
        setError('Failed to fetch top artists from Spotify.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopArtists();
    
  }, [spotifyApi]); // Effect now depends on the stable spotifyApi prop

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', e.currentTarget.src);
    e.currentTarget.src = 'https://via.placeholder.com/150';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
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
          {artists.map((artist, index) => (
            <Grid item xs={6} sm={4} md={3} key={artist.id}>
              <Card sx={{ height: '100%', backgroundColor: 'background.card', position: 'relative' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  <Typography variant="body1" component="span">{index + 1}</Typography>
                </Box>
                <img
                  src={artist.images[0]?.url || 'https://via.placeholder.com/150'}
                  alt={artist.name}
                  onError={handleImageError}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    objectFit: 'cover',
                  }}
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