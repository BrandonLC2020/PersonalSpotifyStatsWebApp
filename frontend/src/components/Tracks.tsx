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

// Define the structure of a Track object to match the database
interface Track {
  track_id: string;
  name: string;
  album_id: string;
  artist_ids: string; // artist_ids is a JSON string
  popularity: number;
}

// The API endpoint for fetching tracks
const API_URL = 'http://localhost:3001/api/tracks';

interface TracksProps {
    viewMode: 'table' | 'grid';
}

const Tracks: React.FC<TracksProps> = ({ viewMode }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axios.get<Track[]>(API_URL);
        setTracks(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch tracks. Make sure the backend server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
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
        Top Tracks
      </Typography>
      {viewMode === 'table' ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Title</TableCell>
                <TableCell align="right">Popularity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tracks.map((track, index) => (
                <TableRow key={track.track_id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{track.name}</TableCell>
                  <TableCell align="right">{track.popularity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={2}>
          {tracks.map((track) => (
            <Grid item xs={6} sm={4} md={3} key={track.track_id}>
              <Card sx={{ height: '100%', backgroundColor: 'background.card' }}>
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {track.name}
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

export default Tracks;