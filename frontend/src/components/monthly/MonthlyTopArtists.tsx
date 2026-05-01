import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../../utils/api';

interface Artist {
  artist_id: string;
  name: string;
  genres: string;
  popularity: number;
  images: { url: string }[];
}

interface GroupedArtists {
  year: number;
  month: number;
  records: Artist[];
}

const MonthlyTopArtists = () => {
  const [groupedArtists, setGroupedArtists] = useState<GroupedArtists[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await api.get<GroupedArtists[]>('/api/artists');
        const sortedData = response.data.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });
        setGroupedArtists(sortedData);
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

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  if (loading) {
    return <Box sx={styles.centered}><CircularProgress size={60} /></Box>;
  }

  if (error) {
    return (
      <Box sx={styles.centered}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Typography variant="h5" sx={styles.title}>Monthly Top Artists</Typography>
      {groupedArtists.map((group, groupIndex) => (
        <Accordion key={`${group.year}-${group.month}`}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{`${getMonthName(group.month)} ${group.year}`}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List>
              {group.records.map((artist, index) => (
                <ListItem key={artist.artist_id} divider>
                  <Typography sx={styles.rankText}>#{index + 1}</Typography>
                  <ListItemAvatar sx={{ ml: 1, mr: 2 }}>
                    <Box component="img"
                      src={artist.images?.[0]?.url || 'https://via.placeholder.com/150'}
                      sx={styles.avatar}
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={artist.name} 
                    secondary={`Popularity: ${artist.popularity}`} 
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

const styles = {
  container: {
    flex: 1,
    overflowY: "auto",
    pb: 10,
  },
  title: {
    p: 2,
    fontWeight: 'bold',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '50vh',
    p: 3,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    objectFit: 'cover' as const,
  },
  rankText: {
    fontWeight: 'bold',
    opacity: 0.6,
    width: 30,
    textAlign: "center",
  },
};

export default MonthlyTopArtists;