import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PersonIcon from '@mui/icons-material/Person';
import AlbumIcon from '@mui/icons-material/Album';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import InsightsIcon from '@mui/icons-material/Insights';
import { ThemeProvider } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { createCustomTheme } from './theme';
import MonthlyTopTracks from './components/monthly/MonthlyTopTracks';
import MonthlyTopArtists from './components/monthly/MonthlyTopArtists';
import MonthlyTopAlbums from './components/monthly/MonthlyTopAlbums';
import CurrentTopTracks from './components/current/CurrentTopTracks';
import CurrentTopArtists from './components/current/CurrentTopArtists';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import TimeMachine from './components/analytics/pages/TimeMachine';
import YearInReview from './components/analytics/pages/YearInReview';
import useSpotifyWeb from './hooks/useSpotifyWeb';

function AppContent() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [mode, setMode] = useState<PaletteMode>('dark');
  const theme = React.useMemo(() => createCustomTheme(mode), [mode]);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const { spotifyApi, loading: spotifyLoading, error: spotifyError } = useSpotifyWeb();

  const handleViewChange = () => {
    setViewMode(prevMode => (prevMode === 'table' ? 'grid' : 'table'));
  };

  // Determine which section is active based on route
  const getActiveSection = (): 'current' | 'monthly' | 'analytics' => {
    if (location.pathname.startsWith('/analytics')) return 'analytics';
    if (location.pathname.startsWith('/monthly')) return 'monthly';
    return 'current';
  };

  const activeSection = getActiveSection();

  // Determine active tab within current/monthly
  const getActiveTab = (): number => {
    if (location.pathname.includes('/artists')) return 1;
    if (location.pathname.includes('/albums')) return 2;
    return 0;
  };

  const handleSectionChange = (
    _event: React.MouseEvent<HTMLElement>,
    newSection: 'current' | 'monthly' | 'analytics' | null,
  ) => {
    if (newSection === null) return;
    if (newSection === 'current') navigate('/');
    else if (newSection === 'monthly') navigate('/monthly');
    else if (newSection === 'analytics') navigate('/analytics');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const section = activeSection === 'monthly' ? '/monthly' : '';
    if (newValue === 0) navigate(section || '/');
    else if (newValue === 1) navigate(`${section}/artists`);
    else if (newValue === 2) navigate(`${section}/albums`);
  };

  const showEntityTabs = activeSection !== 'analytics';
  const showViewToggle = activeSection !== 'analytics';

  const renderContent = () => {
    if (spotifyLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    if (spotifyError) {
      return <Alert severity="error" sx={{ mt: 2 }}>{spotifyError.message}</Alert>;
    }

    return (
      <Routes>
        {/* Current routes */}
        <Route path="/" element={<CurrentTopTracks viewMode={viewMode} spotifyApi={spotifyApi!} />} />
        <Route path="/artists" element={<CurrentTopArtists viewMode={viewMode} spotifyApi={spotifyApi!} />} />

        {/* Monthly routes */}
        <Route path="/monthly" element={<MonthlyTopTracks viewMode={viewMode} spotifyApi={spotifyApi!} />} />
        <Route path="/monthly/artists" element={<MonthlyTopArtists viewMode={viewMode} />} />
        <Route path="/monthly/albums" element={<MonthlyTopAlbums viewMode={viewMode} />} />

        {/* Analytics routes */}
        <Route path="/analytics" element={<AnalyticsDashboard spotifyApi={spotifyApi!} />} />
        <Route path="/analytics/time-machine" element={<TimeMachine spotifyApi={spotifyApi!} />} />
        <Route path="/analytics/year/:year" element={<YearInReview spotifyApi={spotifyApi!} />} />
      </Routes>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'background.glass'
        }}>
          <Toolbar>
            <MusicNoteIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
              My Spotify Stats
            </Typography>
            <ToggleButtonGroup
              value={activeSection}
              exclusive
              onChange={handleSectionChange}
              aria-label="section"
              sx={{ marginRight: 2 }}
            >
              <ToggleButton value="current" aria-label="current">
                Current
              </ToggleButton>
              <ToggleButton value="monthly" aria-label="monthly">
                Monthly
              </ToggleButton>
              <ToggleButton value="analytics" aria-label="analytics">
                <InsightsIcon sx={{ mr: 0.5, fontSize: 18 }} />
                Analytics
              </ToggleButton>
            </ToggleButtonGroup>
            {showViewToggle && (
              <IconButton onClick={handleViewChange} color="inherit">
                {viewMode === 'table' ? <ViewModuleIcon /> : <ViewListIcon />}
              </IconButton>
            )}
          </Toolbar>
          {showEntityTabs && (
            <Tabs
              value={getActiveTab()}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="inherit"
              variant="fullWidth"
              aria-label="navigation tabs"
            >
              <Tab icon={<MusicNoteIcon />} label="Top Songs" />
              <Tab icon={<PersonIcon />} label="Top Artists" />
              {activeSection === 'monthly' && <Tab icon={<AlbumIcon />} label="Top Albums" />}
            </Tabs>
          )}
        </AppBar>

        <Container component="main" sx={{ flexGrow: 1, py: 4 }} maxWidth={activeSection === 'analytics' ? 'xl' : 'lg'}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
          {renderContent()}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;