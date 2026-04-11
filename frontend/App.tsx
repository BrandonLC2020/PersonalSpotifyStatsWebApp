import React, { useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import MainNavigator from './src/navigation/MainNavigator';
import { darkTheme, lightTheme } from './src/theme';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <MainNavigator />
      </PaperProvider>
    </AuthProvider>
  );
}
