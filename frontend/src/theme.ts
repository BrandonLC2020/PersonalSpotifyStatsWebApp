import { createTheme, PaletteMode } from '@mui/material';

export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light Mode
          primary: {
            main: '#1DB954', // Spotify Green
          },
          background: {
            default: '#f0f2f5',
            paper: '#ffffff',
            card: '#ffffff',
            glass: 'rgba(255, 255, 255, 0.25)', // Frosted glass for light mode
          },
          text: {
            primary: '#191414',
            secondary: '#535353',
          },
        }
      : {
          // Dark Mode
          primary: {
            main: '#1DB954', // Spotify Green
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
            card: '#282828',
            glass: 'rgba(0, 0, 0, 0.4)', // Frosted glass for dark mode
          },
          text: {
            primary: '#ffffff',
            secondary: '#b3b3b3',
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)' 
            : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          backgroundAttachment: 'fixed',
          transition: 'background 0.3s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiContainer: {
        styleOverrides: {
            root: {
                transition: 'all 0.3s ease-in-out',
            }
        }
    }
  },
});

export const createCustomTheme = (mode: PaletteMode) => createTheme(getDesignTokens(mode));
