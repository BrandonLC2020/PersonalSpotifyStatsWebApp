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
  IconButton
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PersonIcon from '@mui/icons-material/Person';
import AlbumIcon from '@mui/icons-material/Album';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Tracks from './components/Tracks';
import Artists from './components/Artists';
import Albums from './components/Albums';

// Define a dark theme for the application
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

  const handleViewChange = () => {
    setViewMode(prevMode => (prevMode === 'table' ? 'grid' : 'table'));
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
            <IconButton onClick={handleViewChange} color="inherit">
              {viewMode === 'table' ? <ViewModuleIcon /> : <ViewListIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container component="main" sx={{ flexGrow: 1, py: 4, mb: 7 }}>
          {value === 0 && <Tracks viewMode={viewMode} />}
          {value === 1 && <Artists viewMode={viewMode} />}
          {value === 2 && <Albums viewMode={viewMode} />}
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
            <BottomNavigationAction label="Top Albums" icon={<AlbumIcon />} />
          </BottomNavigation>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default App;