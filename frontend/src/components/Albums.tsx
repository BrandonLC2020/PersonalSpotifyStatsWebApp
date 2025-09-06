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
  CardMedia,
  CardContent
} from '@mui/material';

// Define the structure of an Image object
interface Image {
  url: string;
}

// Define the structure of an Album object to match the database
interface Album {
  album_id: string;
  name: string;
  album_type: string;
  release_date: string;
  images: Image[]; 
}

// The API endpoint for fetching albums.
const API_URL = 'http://localhost:3001/api/albums';

interface AlbumsProps {
  viewMode: 'table' | 'grid';
}

const Albums: React.FC<AlbumsProps> = ({ viewMode }) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios.get<Album[]>(API_URL);
        console.log('Albums data from backend:', response.data); // <-- Added for debugging
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
      {viewMode === 'table' ? (
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
                <TableRow key={album.album_id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{album.name}</TableCell>
                  <TableCell>{album.album_type}</TableCell>
                  <TableCell>{album.release_date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={2}>
          {albums.map((album) => (
            <Grid item xs={6} sm={4} md={3} key={album.album_id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={album.images?.[0]?.url || 'https://via.placeholder.com/150'}
                  alt={album.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    {album.name}
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

export default Albums;