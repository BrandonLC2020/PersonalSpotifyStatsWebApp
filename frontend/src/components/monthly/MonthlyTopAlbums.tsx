import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, List, ListItem, ListItemAvatar, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../../utils/api';

interface Album {
  album_id: string;
  name: string;
  album_type: string;
  release_date: string;
  images: { url: string }[];
}

interface GroupedAlbums {
  year: number;
  month: number;
  records: Album[];
}

const MonthlyTopAlbums = () => {
  const [groupedAlbums, setGroupedAlbums] = useState<GroupedAlbums[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await api.get<GroupedAlbums[]>('/api/albums');
        const sortedData = response.data.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });
        setGroupedAlbums(sortedData);
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
      <Typography variant="h5" sx={styles.title}>Monthly Top Albums</Typography>
      {groupedAlbums.map((group, groupIndex) => (
        <Accordion key={`${group.year}-${group.month}`}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{`${getMonthName(group.month)} ${group.year}`}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List>
              {group.records.map((album, index) => (
                <ListItem key={album.album_id} divider>
                  <Typography sx={styles.rankText}>#{index + 1}</Typography>
                  <ListItemAvatar sx={{ ml: 1, mr: 2 }}>
                    <Box component="img"
                      src={album.images?.[0]?.url || 'https://via.placeholder.com/150'}
                      sx={styles.thumbnail}
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={album.name} 
                    secondary={`${album.album_type} • ${album.release_date}`} 
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
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
    objectFit: 'cover' as const,
  },
  rankText: {
    fontWeight: 'bold',
    opacity: 0.6,
    width: 30,
    textAlign: "center",
  },
};

export default MonthlyTopAlbums;