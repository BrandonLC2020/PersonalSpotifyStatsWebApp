import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';
import CurrentTopTracks from '../components/current/CurrentTopTracks';
import CurrentTopArtists from '../components/current/CurrentTopArtists';

export default function CurrentSection() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = location.pathname.endsWith('/artists') ? 1 : 0;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) navigate('songs');
    else if (newValue === 1) navigate('artists');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleChange} variant="fullWidth">
          <Tab label="Songs" />
          <Tab label="Artists" />
        </Tabs>
      </Box>
      <Box sx={{ p: 2 }}>
        <Routes>
          <Route path="songs" element={<CurrentTopTracks />} />
          <Route path="artists" element={<CurrentTopArtists />} />
          <Route path="*" element={<Navigate to="songs" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}