import { MD3DarkTheme, MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  fontFamily: 'Inter',
};

export const spotifyGreen = '#1DB954';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: spotifyGreen,
    background: '#f0f2f5',
    surface: '#ffffff',
    secondary: '#535353',
    glass: 'rgba(255, 255, 255, 0.25)',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: spotifyGreen,
    background: '#121212',
    surface: '#1e1e1e',
    secondary: '#b3b3b3',
    glass: 'rgba(0, 0, 0, 0.4)',
  },
};
