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

// (Track interface remains the same)
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
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs; // Receive spotifyApi as a prop
}

const CurrentTopTracks: React.FC<CurrentTracksProps> = ({ viewMode, spotifyApi }) => {
  // REMOVE the call to useSpotifyWeb()
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
    
  }, [spotifyApi]); // The effect now only depends on the stable spotifyApi prop

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
    // (The JSX for the table and grid remains the same)
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Current Top Tracks
      </Typography>
      {/* ... */}
    </Paper>
  );
};

export default CurrentTopTracks;