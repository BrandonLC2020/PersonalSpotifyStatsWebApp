import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTheme } from 'react-native-paper';
import MonthlyTopTracks from '../components/monthly/MonthlyTopTracks';
import MonthlyTopArtists from '../components/monthly/MonthlyTopArtists';
import MonthlyTopAlbums from '../components/monthly/MonthlyTopAlbums';

const Tab = createMaterialTopTabNavigator();

export default function MonthlySection() {
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
      <Tab.Screen name="Songs" component={MonthlyTopTracks} />
      <Tab.Screen name="Artists" component={MonthlyTopArtists} />
      <Tab.Screen name="Albums" component={MonthlyTopAlbums} />
    </Tab.Navigator>
  );
}
