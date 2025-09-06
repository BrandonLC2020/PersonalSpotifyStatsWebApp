import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  CardContent
} from '@mui/material';

// Define the structure of an Image object
interface Image {
  url: string;
}

// Define the structure of an Artist object to match the database
interface Artist {
  artist_id: string;
  name: string;
  genres: string;
  popularity: number;
  images: Image[];
}

// The API endpoint for fetching artists.
const API_URL = 'http://localhost:3001/api/artists';

interface ArtistsProps {
  viewMode: 'table' | 'grid';
}

const MonthlyTopArtists: React.FC<ArtistsProps> = ({ viewMode }) => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await axios.get<Artist[]>(API_URL);
        setArtists(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch artists. Make sure the backend server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', e.currentTarget.src);
    e.currentTarget.src = 'https://via.placeholder.com/150'; // Fallback to placeholder on error
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
        Top Artists
      </Typography>
      {viewMode === 'table' ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Popularity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {artists.map((artist, index) => (
                <TableRow key={artist.artist_id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{artist.name}</TableCell>
                  <TableCell align="right">{artist.popularity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={2}>
          {artists.map((artist) => (
            <Grid item xs={6} sm={4} md={3} key={artist.artist_id}>
              <Card sx={{ height: '100%', backgroundColor: 'background.card' }}>
                <img
                  src={artist.images?.[0]?.url || 'https://via.placeholder.com/150'}
                  alt={artist.name}
                  onError={handleImageError}
                  style={{
                    width: '100%',
                    aspectRatio: '1 / 1', // Ensures a square aspect ratio
                    objectFit: 'cover', // Ensures the image covers the area without distortion
                    // Removed: border: '1px solid red'
                  }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {artist.name}
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

export default MonthlyTopArtists;