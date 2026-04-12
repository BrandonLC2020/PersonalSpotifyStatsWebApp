import React, { useState, useEffect } from 'react';
import { PaperProvider, ActivityIndicator } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import MainNavigator from './src/navigation/MainNavigator';
import { darkTheme, lightTheme } from './src/theme';
import { useColorScheme, Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Skia initialization for web
let AppContent = MainNavigator;

if (Platform.OS === 'web') {
  const { WithSkiaWeb } = require("@shopify/react-native-skia/lib/module/web");
  AppContent = () => (
    <WithSkiaWeb
      getComponent={() => import("./src/navigation/MainNavigator")}
      opts={{
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@0.39.1/bin/full/${file}`,
      }}
      fallback={<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>}
    />
  );
}

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <AppContent />
      </PaperProvider>
    </AuthProvider>
  );
}
