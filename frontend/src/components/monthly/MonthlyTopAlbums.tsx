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
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Image {
  url: string;
}

interface Album {
  album_id: string;
  name: string;
  album_type: string;
  release_date: string;
  images: Image[];
}

interface GroupedAlbums {
  year: number;
  month: number;
  records: Album[];
}

const API_URL = 'http://localhost:3001/api/albums';

interface AlbumsProps {
  viewMode: 'table' | 'grid';
}

const MonthlyTopAlbums: React.FC<AlbumsProps> = ({ viewMode }) => {
  const [groupedAlbums, setGroupedAlbums] = useState<GroupedAlbums[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios.get<GroupedAlbums[]>(API_URL);
        setGroupedAlbums(response.data);
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

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Top Albums
      </Typography>
      {groupedAlbums.map((group, groupIndex) => (
        <Accordion key={groupIndex}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{getMonthName(group.month)} {group.year}</Typography>
          </AccordionSummary>
          <AccordionDetails>
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
                    {group.records.map((album, index) => (
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
                {group.records.map((album, index) => (
                  <Grid item xs={6} sm={4} md={3} key={album.album_id}>
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
                        src={album.images?.[0]?.url || 'https://via.placeholder.com/150'}
                        alt={album.name}
                        onError={handleImageError}
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          objectFit: 'cover',
                        }}
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
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );
};

export default MonthlyTopAlbums;