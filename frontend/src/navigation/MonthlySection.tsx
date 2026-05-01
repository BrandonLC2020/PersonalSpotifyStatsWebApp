import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';
import MonthlyTopTracks from '../components/monthly/MonthlyTopTracks';
import MonthlyTopArtists from '../components/monthly/MonthlyTopArtists';
import MonthlyTopAlbums from '../components/monthly/MonthlyTopAlbums';

export default function MonthlySection() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    if (location.pathname.endsWith('/artists')) return 1;
    if (location.pathname.endsWith('/albums')) return 2;
    return 0;
  };

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) navigate('songs');
    else if (newValue === 1) navigate('artists');
    else if (newValue === 2) navigate('albums');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={getActiveTab()} onChange={handleChange} variant="fullWidth">
          <Tab label="Songs" />
          <Tab label="Artists" />
          <Tab label="Albums" />
        </Tabs>
      </Box>
      <Box sx={{ p: 2 }}>
        <Routes>
          <Route path="songs" element={<MonthlyTopTracks />} />
          <Route path="artists" element={<MonthlyTopArtists />} />
          <Route path="albums" element={<MonthlyTopAlbums />} />
          <Route path="*" element={<Navigate to="songs" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}