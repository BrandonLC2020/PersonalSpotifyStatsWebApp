import React, { useMemo } from 'react';
import { ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import MainNavigator from './navigation/MainNavigator';
import { darkTheme, lightTheme } from './theme';

export default function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = prefersDarkMode ? darkTheme : lightTheme;

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MainNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}