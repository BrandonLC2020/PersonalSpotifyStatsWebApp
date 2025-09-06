import React, { useState } from 'react';
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PersonIcon from '@mui/icons-material/Person';
import AlbumIcon from '@mui/icons-material/Album';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import MonthlyTopTracks from './components/monthly/MonthlyTopTracks';
import MonthlyTopArtists from './components/monthly/MonthlyTopArtists';
import MonthlyTopAlbums from './components/monthly/MonthlyTopAlbums';
import CurrentTopTracks from './components/current/CurrentTopTracks';
import CurrentTopArtists from './components/current/CurrentTopArtists';
import useSpotifyWeb from './hooks/useSpotifyWeb';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1DB954', // Spotify Green
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
      card: '#383838ff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
  },
});

function App() {
  const [value, setValue] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [timeRange, setTimeRange] = useState<'current' | 'monthly'>('current');

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
      if (value === 0) return <MonthlyTopTracks viewMode={viewMode} />;
      if (value === 1) return <MonthlyTopArtists viewMode={viewMode} />;
      if (value === 2) return <MonthlyTopAlbums viewMode={viewMode} />;
    }
    return null;
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #292929' }}>
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
        </AppBar>

        <Container component="main" sx={{ flexGrow: 1, py: 4, mb: 7 }}>
          {renderContent()}
        </Container>

        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation
            showLabels
            value={value}
            onChange={(event: React.SyntheticEvent, newValue: number) => {
              setValue(newValue);
            }}
            sx={{ background: '#1e1e1e' }}
          >
            <BottomNavigationAction label="Top Songs" icon={<MusicNoteIcon />} />
            <BottomNavigationAction label="Top Artists" icon={<PersonIcon />} />
            {timeRange === 'monthly' && <BottomNavigationAction label="Top Albums" icon={<AlbumIcon />} />}
          </BottomNavigation>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default App;