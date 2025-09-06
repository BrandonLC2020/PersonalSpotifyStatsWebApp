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
  Paper
} from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PersonIcon from '@mui/icons-material/Person';
import AlbumIcon from '@mui/icons-material/Album';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Songs from './components/Songs';
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

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid #292929' }}>
          <Toolbar>
            <MusicNoteIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" color="inherit" noWrap>
              My Spotify Stats
            </Typography>
          </Toolbar>
        </AppBar>

        <Container component="main" sx={{ flexGrow: 1, py: 4, mb: 7 }}>
          {value === 0 && <Songs />}
          {value === 1 && <Artists />}
          {value === 2 && <Albums />}
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