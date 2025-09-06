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

interface CurrentTracksProps {
  viewMode: 'table' | 'grid';
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
}

const CurrentTopTracks: React.FC<CurrentTracksProps> = ({ viewMode, spotifyApi }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopTracks = async () => {
      setLoading(true);
      try {
        const response = await spotifyApi.getMyTopTracks({ limit: 50, time_range: 'short_term' });
        setTracks(response.items as Track[]);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch top tracks from Spotify:', err);
        setError('Failed to fetch top tracks from Spotify.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopTracks();
  }, [spotifyApi]);

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
        Current Top Tracks
      </Typography>
      {viewMode === 'table' ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Artist(s)</TableCell>
                <TableCell>Album</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tracks.map((track, index) => (
                <TableRow key={track.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Link href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer" color="inherit">
                      {track.name}
                    </Link>
                  </TableCell>
                  <TableCell>{track.artists.map(artist => artist.name).join(', ')}</TableCell>
                  <TableCell>{track.album.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={2}>
          {tracks.map((track) => (
            <Grid item xs={6} sm={4} md={3} key={track.id}>
              <Card sx={{ height: '100%', backgroundColor: 'background.card' }}>
                <img
                  src={track.album.images[0]?.url || 'https://via.placeholder.com/150'}
                  alt={track.name}
                  onError={handleImageError}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    objectFit: 'cover',
                  }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    <Link href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer" color="inherit">
                      {track.name}
                    </Link>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {track.artists.map(artist => artist.name).join(', ')}
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

export default CurrentTopTracks;