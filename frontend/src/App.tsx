import React, { useState } from 'react';
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
import { ThemeProvider } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { createCustomTheme } from './theme';
import MonthlyTopTracks from './components/monthly/MonthlyTopTracks';
import MonthlyTopArtists from './components/monthly/MonthlyTopArtists';
import MonthlyTopAlbums from './components/monthly/MonthlyTopAlbums';
import CurrentTopTracks from './components/current/CurrentTopTracks';
import CurrentTopArtists from './components/current/CurrentTopArtists';
import useSpotifyWeb from './hooks/useSpotifyWeb';



function App() {
  const [value, setValue] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [timeRange, setTimeRange] = useState<'current' | 'monthly'>('current');
  const [mode, setMode] = useState<PaletteMode>('dark');
  const theme = React.useMemo(() => createCustomTheme(mode), [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const { spotifyApi, loading: spotifyLoading, error: spotifyError } = useSpotifyWeb();

  const handleViewChange = () => {
    setViewMode(prevMode => (prevMode === 'table' ? 'grid' : 'table'));
  };

  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newTimeRange: 'current' | 'monthly',
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
      if (newTimeRange === 'current' && value === 2) {
        setValue(0);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

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

    if (timeRange === 'current') {
      if (value === 0) return <CurrentTopTracks viewMode={viewMode} spotifyApi={spotifyApi!} />;
      if (value === 1) return <CurrentTopArtists viewMode={viewMode} spotifyApi={spotifyApi!} />;
    } else { // monthly
      if (value === 0) return <MonthlyTopTracks viewMode={viewMode} spotifyApi={spotifyApi!} />;
      if (value === 1) return <MonthlyTopArtists viewMode={viewMode} />;
      if (value === 2) return <MonthlyTopAlbums viewMode={viewMode} />;
    }
    return null;
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
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              aria-label="time range"
              sx={{ marginRight: 2 }}
            >
              <ToggleButton value="current" aria-label="current">
                Current
              </ToggleButton>
              <ToggleButton value="monthly" aria-label="monthly">
                Monthly
              </ToggleButton>
            </ToggleButtonGroup>
            <IconButton onClick={handleViewChange} color="inherit">
              {viewMode === 'table' ? <ViewModuleIcon /> : <ViewListIcon />}
            </IconButton>
          </Toolbar>
          <Tabs
            value={value}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="inherit"
            variant="fullWidth"
            aria-label="navigation tabs"
          >
            <Tab icon={<MusicNoteIcon />} label="Top Songs" />
            <Tab icon={<PersonIcon />} label="Top Artists" />
            {timeRange === 'monthly' && <Tab icon={<AlbumIcon />} label="Top Albums" />}
          </Tabs>
        </AppBar>

        <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
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

export default App;