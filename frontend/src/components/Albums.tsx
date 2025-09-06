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

// Define the structure of an Album object
interface Album {
  id: number;
  name: string;
  album_type: string;
  release_date: string;
}

// The API endpoint for fetching albums.
const API_URL = 'http://localhost:3001/api/albums';

const Albums: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios.get<Album[]>(API_URL);
        setAlbums(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch albums. Make sure the backend server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
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
            Top Albums
        </Typography>
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Release Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {albums.map((album, index) => (
                        <TableRow key={album.id} hover>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{album.name}</TableCell>
                            <TableCell>{album.album_type}</TableCell>
                            <TableCell>{album.release_date}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
  );
};

export default Albums;