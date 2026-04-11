import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from 'react-native-paper';
import CurrentTopTracks from '../components/current/CurrentTopTracks';
import CurrentTopArtists from '../components/current/CurrentTopArtists';

const Tab = createMaterialTopTabNavigator();

export default function CurrentSection() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarStyle: { backgroundColor: theme.colors.background },
        tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
      }}
    >
      <Tab.Screen name="Songs" component={CurrentTopTracks} />
      <Tab.Screen name="Artists" component={CurrentTopArtists} />
    </Tab.Navigator>
  );
}
