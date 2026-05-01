import { createTheme } from '@mui/material/styles';

const fontConfig = {
  fontFamily: 'Inter, sans-serif',
};

export const spotifyGreen = '#1DB954';

export const lightTheme = createTheme({
  typography: fontConfig,
  palette: {
    mode: 'light',
    primary: {
      main: spotifyGreen,
    },
    background: {
      default: '#f0f2f5',
      paper: '#ffffff',
    },
    secondary: {
      main: '#535353',
    },
    action: {
      disabledBackground: 'rgba(255, 255, 255, 0.25)',
    },
  },
});

export const darkTheme = createTheme({
  typography: fontConfig,
  palette: {
    mode: 'dark',
    primary: {
      main: spotifyGreen,
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    secondary: {
      main: '#b3b3b3',
    },
    action: {
      disabledBackground: 'rgba(0, 0, 0, 0.4)',
    },
  },
});