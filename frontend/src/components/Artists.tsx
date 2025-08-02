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
  Box
} from '@mui/material';

// Define the structure of an Artist object
interface Artist {
  id: number;
  name: string;
  genre: string;
  popularity: number;
}

// The API endpoint for fetching artists.
const API_URL = 'http://localhost:3001/api/artists';

const Artists: React.FC = () => {
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
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Genre</TableCell>
                        <TableCell align="right">Popularity</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {artists.map((artist, index) => (
                        <TableRow key={artist.id} hover>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{artist.name}</TableCell>
                            <TableCell>{artist.genre}</TableCell>
                            <TableCell align="right">{artist.popularity}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
  );
};

export default Artists;