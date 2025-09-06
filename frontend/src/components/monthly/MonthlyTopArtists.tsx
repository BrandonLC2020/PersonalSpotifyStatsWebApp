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

interface Artist {
  artist_id: string;
  name: string;
  genres: string;
  popularity: number;
  images: Image[];
}

interface GroupedArtists {
  year: number;
  month: number;
  records: Artist[];
}

const API_URL = 'http://localhost:3001/api/artists';

interface ArtistsProps {
  viewMode: 'table' | 'grid';
}

const MonthlyTopArtists: React.FC<ArtistsProps> = ({ viewMode }) => {
  const [groupedArtists, setGroupedArtists] = useState<GroupedArtists[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await axios.get<GroupedArtists[]>(API_URL);
        setGroupedArtists(response.data);
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
        Top Artists
      </Typography>
      {groupedArtists.map((group, groupIndex) => (
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
                      <TableCell align="right">Popularity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.records.map((artist, index) => (
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
                {group.records.map((artist, index) => (
                  <Grid item xs={6} sm={4} md={3} key={artist.artist_id}>
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
                        src={artist.images?.[0]?.url || 'https://via.placeholder.com/150'}
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
                          {artist.name}
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

export default MonthlyTopArtists;