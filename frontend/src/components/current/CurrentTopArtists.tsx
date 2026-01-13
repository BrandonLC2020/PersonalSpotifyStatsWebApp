import React, { useState, useEffect } from 'react';
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
  Link
} from '@mui/material';
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

// Define the structure of an Artist object
interface Artist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
  external_urls: {
    spotify: string;
  };
}

// Update props to receive the spotifyApi object
interface CurrentArtistsProps {
  viewMode: 'table' | 'grid';
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
}

const CurrentTopArtists: React.FC<CurrentArtistsProps> = ({ viewMode, spotifyApi }) => {
  // Remove the useSpotifyWeb() hook call
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopArtists = async () => {
      setLoading(true);
      try {
        const response = await spotifyApi.getMyTopArtists({ limit: 50, time_range: 'short_term' });
        setArtists(response.items as Artist[]);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch top artists from Spotify:', err);
        setError('Failed to fetch top artists from Spotify.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopArtists();

  }, [spotifyApi]); // Effect now depends on the stable spotifyApi prop

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
        Current Top Artists
      </Typography>
      {viewMode === 'table' ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Genres</TableCell>
              </TableRow>
            </TableHead>
            <TableBody component={motion.tbody} variants={containerVariants} initial="hidden" animate="visible">
              {artists.map((artist, index) => (
                <MotionTableRow
                  key={artist.id}
                  hover
                  variants={itemVariants}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Link href={artist.external_urls.spotify} target="_blank" rel="noopener noreferrer" color="inherit">
                      {artist.name}
                    </Link>
                  </TableCell>
                  <TableCell>{artist.genres.join(', ')}</TableCell>
                </MotionTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid container spacing={2} component={motion.div} variants={containerVariants} initial="hidden" animate="visible">
          {artists.map((artist, index) => (
            <MotionGrid item xs={6} sm={4} md={3} key={artist.id} variants={itemVariants}>
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
                  src={artist.images[0]?.url || 'https://via.placeholder.com/150'}
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
                    <Link href={artist.external_urls.spotify} target="_blank" rel="noopener noreferrer" color="inherit">
                      {artist.name}
                    </Link>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {artist.genres.join(', ')}
                  </Typography>
                </CardContent>
              </Card>
            </MotionGrid>
          ))}
        </Grid>
      )}
    </Paper>
  );
};

export default CurrentTopArtists;