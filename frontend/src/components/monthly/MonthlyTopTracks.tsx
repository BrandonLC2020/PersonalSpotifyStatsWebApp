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
import SpotifyWebApi from 'spotify-web-api-js';

// Define the structure of a Track object to match the database
interface Track {
  track_id: string;
  name: string;
  album_id: string;
  artist_ids: string; // artist_ids is a JSON string
  popularity: number;
}

// Grouped tracks structure from our backend
interface GroupedTracks {
  year: number;
  month: number;
  records: Track[];
}

// The API endpoint for fetching tracks
const API_URL = 'http://localhost:3001/api/tracks';

interface TracksProps {
  viewMode: 'table' | 'grid';
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
}

const MonthlyTopTracks: React.FC<TracksProps> = ({ viewMode, spotifyApi }) => {
  const [groupedTracks, setGroupedTracks] = useState<GroupedTracks[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [albumArt, setAlbumArt] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTracksAndArt = async () => {
      try {
        const response = await axios.get<GroupedTracks[]>(API_URL);
        setGroupedTracks(response.data);
        setError(null);

        // Now fetch album art
        if (spotifyApi) {
          const allTrackIds = response.data.flatMap(group => group.records.map(track => track.track_id));
          // To avoid hitting API rate limits, let's fetch in chunks of 50
          const chunk = 50;
          for (let i = 0; i < allTrackIds.length; i += chunk) {
            const trackIds = allTrackIds.slice(i, i + chunk);
            const tracksData = await spotifyApi.getTracks(trackIds);
            const art = tracksData.tracks.reduce((acc, track) => {
              if (track && track.album.images.length > 0) {
                acc[track.id] = track.album.images[0].url;
              }
              return acc;
            }, {} as Record<string, string>);
            setAlbumArt(prevArt => ({ ...prevArt, ...art }));
          }
        }
      } catch (err) {
        setError('Failed to fetch tracks. Make sure the backend server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracksAndArt();
  }, [spotifyApi]);

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

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Top Tracks
      </Typography>
      {groupedTracks.map((group, groupIndex) => (
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
                      <TableCell>Title</TableCell>
                      <TableCell align="right">Popularity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.records.map((track, index) => (
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
                {group.records.map((track, index) => (
                  <Grid item xs={6} sm={4} md={3} key={track.track_id}>
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
                        src={albumArt[track.track_id] || 'https://via.placeholder.com/150'}
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
                          {track.name}
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

export default MonthlyTopTracks;