import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import MainNavigator from './src/navigation/MainNavigator';
import { darkTheme, lightTheme } from './src/theme';
import { useColorScheme, LogBox, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Victory Native v36 and React Native Paper pass native-only props to SVG/DOM elements on Web,
// which triggers intensive warnings in React 19. Since these are internal to libraries,
// we suppress them to keep the developer console usable.
if (Platform.OS === 'web') {
  const IGNORED_WARNINGS = [
    'accessibilityHint',
    'accessibilityRole',
    'props.pointerEvents',
    'shadow* style props',
    'React does not recognize the',
  ];

  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && IGNORED_WARNINGS.some(w => args[0].includes(w))) {
      return;
    }
    originalError(...args);
  };

  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && IGNORED_WARNINGS.some(w => args[0].includes(w))) {
      return;
    }
    originalWarn(...args);
  };
}

LogBox.ignoreLogs([
  'React does not recognize the `accessibilityHint` prop',
  'props.pointerEvents is deprecated',
]);

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
