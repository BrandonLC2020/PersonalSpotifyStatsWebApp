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

// Define the structure of a Song object
interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  popularity: number;
}

// The API endpoint for fetching songs. Change the port if your Rails server runs on a different one.
const API_URL = 'http://localhost:3001/api/songs';

const Songs: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get<Song[]>(API_URL);
        setSongs(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch songs. Make sure the backend server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []); // Empty dependency array means this effect runs once on mount

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
            Top Songs
        </Typography>
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell>Artist</TableCell>
                        <TableCell>Album</TableCell>
                        <TableCell align="right">Popularity</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {songs.map((song, index) => (
                        <TableRow key={song.id} hover>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{song.title}</TableCell>
                            <TableCell>{song.artist}</TableCell>
                            <TableCell>{song.album}</TableCell>
                            <TableCell align="right">{song.popularity}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
  );
};

export default Songs;