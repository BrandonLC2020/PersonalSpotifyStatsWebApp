import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import CurrentSection from './CurrentSection';
import MonthlySection from './MonthlySection';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import useSpotifyWeb from '../hooks/useSpotifyWeb';
import { Box, CircularProgress, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { MusicNote, CalendarToday, BarChart } from '@mui/icons-material';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveValue = () => {
    if (location.pathname.startsWith('/monthly')) return 1;
    if (location.pathname.startsWith('/analytics')) return 2;
    return 0; // Default to /current
  };

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50 }} elevation={3}>
      <BottomNavigation
        showLabels
        value={getActiveValue()}
        onChange={(event, newValue) => {
          if (newValue === 0) navigate('/current');
          else if (newValue === 1) navigate('/monthly');
          else if (newValue === 2) navigate('/analytics');
        }}
      >
        <BottomNavigationAction label="Current" icon={<MusicNote />} />
        <BottomNavigationAction label="Monthly" icon={<CalendarToday />} />
        <BottomNavigationAction label="Analytics" icon={<BarChart />} />
      </BottomNavigation>
    </Paper>
  );
}

function ProtectedRoutes() {
  return (
    <Box sx={{ pb: 7 }}>
      <Routes>
        <Route path="/current/*" element={<CurrentSection />} />
        <Route path="/monthly/*" element={<MonthlySection />} />
        <Route path="/analytics/*" element={<AnalyticsDashboard />} />
        <Route path="*" element={<Navigate to="/current" replace />} />
      </Routes>
      <BottomNav />
    </Box>
  );
}

export default function MainNavigator() {
  const { isAuthenticated } = useAuth();
  const { loading } = useSpotifyWeb();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <ProtectedRoutes />
      ) : (
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}