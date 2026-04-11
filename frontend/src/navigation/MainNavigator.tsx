import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LoginScreen from '../screens/LoginScreen';
import CurrentSection from './CurrentSection';
import MonthlySection from './MonthlySection';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import useSpotifyWeb from '../hooks/useSpotifyWeb';
import { ActivityIndicator } from 'react-native-paper';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator({ spotifyApi }: { spotifyApi: any }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'music';
          if (route.name === 'Monthly') iconName = 'calendar';
          else if (route.name === 'Analytics') iconName = 'chart-bar';
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Current" component={CurrentSection} />
      <Tab.Screen name="Monthly" component={MonthlySection} />
      <Tab.Screen name="Analytics">
        {() => <AnalyticsDashboard spotifyApi={spotifyApi} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  const { isAuthenticated } = useAuth();
  const { spotifyApi, loading } = useSpotifyWeb();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main">
            {() => <TabNavigator spotifyApi={spotifyApi} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
