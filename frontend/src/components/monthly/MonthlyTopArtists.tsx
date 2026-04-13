import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, ActivityIndicator, List, useTheme, Surface } from 'react-native-paper';
import api from '../../utils/api';

interface Artist {
  artist_id: string;
  name: string;
  genres: string;
  popularity: number;
  images: { url: string }[];
}

interface GroupedArtists {
  year: number;
  month: number;
  records: Artist[];
}

const MonthlyTopArtists = () => {
  const [groupedArtists, setGroupedArtists] = useState<GroupedArtists[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await api.get<GroupedArtists[]>('/api/artists');
        const sortedData = response.data.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        });
        setGroupedArtists(sortedData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch artists. Make sure the backend server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  if (loading) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: theme.colors.error }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Monthly Top Artists</Text>
      {groupedArtists.map((group, groupIndex) => (
        <List.Accordion
          key={`${group.year}-${group.month}`}
          title={`${getMonthName(group.month)} ${group.year}`}
          left={props => <List.Icon {...props} icon="account-music" />}
        >
          {group.records.map((artist, index) => (
            <List.Item
              key={artist.artist_id}
              title={artist.name}
              description={`Popularity: ${artist.popularity}`}
              left={props => (
                <Image
                  source={{ uri: artist.images?.[0]?.url || 'https://via.placeholder.com/150' }}
                  style={styles.avatar}
                />
              )}
              right={props => <Text style={styles.rankText}>#{index + 1}</Text>}
            />
          ))}
        </List.Accordion>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    padding: 16,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginLeft: 8,
  },
  rankText: {
    alignSelf: 'center',
    marginRight: 16,
    opacity: 0.6,
  },
});

export default MonthlyTopArtists;