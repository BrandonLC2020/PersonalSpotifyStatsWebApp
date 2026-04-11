import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
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
import { motion } from 'framer-motion';

const MotionTableRow = motion(TableRow);
const MotionGrid = motion(Grid);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

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
        const response = await api.get<GroupedTracks[]>('/api/tracks');
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
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        backgroundColor: 'background.glass',
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
      }}
    >
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
                  <TableBody component={motion.tbody} variants={containerVariants} initial="hidden" animate="visible">
                    {group.records.map((track, index) => (
                      <MotionTableRow
                        key={track.track_id}
                        hover
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{track.name}</TableCell>
                        <TableCell align="right">{track.popularity}</TableCell>
                      </MotionTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Grid container spacing={2} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
                {group.records.map((track, index) => (
                  <MotionGrid item xs={6} sm={4} md={3} key={track.track_id} variants={itemVariants}>
                    <Card
                      component={motion.div}
                      whileHover={{ y: -5, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
                      sx={{
                        height: '100%',
                        backgroundColor: 'background.card',
                        position: 'relative',
                        border: '1px solid',
                        borderColor: 'divider',
                        backdropFilter: 'blur(5px)'
                      }}
                    >
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
                  </MotionGrid>
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