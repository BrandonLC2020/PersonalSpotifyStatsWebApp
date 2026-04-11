import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, ActivityIndicator, List, useTheme } from 'react-native-paper';
import api from '../../utils/api';

interface Album {
  album_id: string;
  name: string;
  album_type: string;
  release_date: string;
  images: { url: string }[];
}

interface GroupedAlbums {
  year: number;
  month: number;
  records: Album[];
}

const MonthlyTopAlbums = () => {
  const [groupedAlbums, setGroupedAlbums] = useState<GroupedAlbums[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await api.get<GroupedAlbums[]>('/api/albums');
        setGroupedAlbums(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch albums. Make sure the backend server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
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
      <Text variant="headlineSmall" style={styles.title}>Monthly Top Albums</Text>
      {groupedAlbums.map((group, groupIndex) => (
        <List.Accordion
          key={`${group.year}-${group.month}`}
          title={`${getMonthName(group.month)} ${group.year}`}
          left={props => <List.Icon {...props} icon="album" />}
        >
          {group.records.map((album, index) => (
            <List.Item
              key={album.album_id}
              title={album.name}
              description={`${album.album_type} • ${album.release_date}`}
              left={props => (
                <Image
                  source={{ uri: album.images?.[0]?.url || 'https://via.placeholder.com/150' }}
                  style={styles.thumbnail}
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
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
    marginLeft: 8,
  },
  rankText: {
    alignSelf: 'center',
    marginRight: 16,
    opacity: 0.6,
  },
});

export default MonthlyTopAlbums;