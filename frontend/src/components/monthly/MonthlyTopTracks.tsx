import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Image } from 'react-native';
import { Text, ActivityIndicator, List, useTheme, Surface, Card } from 'react-native-paper';
import api from '../../utils/api';
import useSpotifyWeb from '../../hooks/useSpotifyWeb';

interface Track {
  track_id: string;
  name: string;
  album_id: string;
  artist_ids: string;
  popularity: number;
}

interface GroupedTracks {
  year: number;
  month: number;
  records: Track[];
}

const MonthlyTopTracks = () => {
  const [groupedTracks, setGroupedTracks] = useState<GroupedTracks[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [albumArt, setAlbumArt] = useState<Record<string, string>>({});
  const { spotifyApi } = useSpotifyWeb();
  const theme = useTheme();

  useEffect(() => {
    const fetchTracksAndArt = async () => {
      try {
        const response = await api.get<GroupedTracks[]>('/api/tracks');
        setGroupedTracks(response.data);
        setError(null);

        // Fetch album art if Spotify API is available
        if (spotifyApi && response.data.length > 0) {
          const allTrackIds = response.data.flatMap(group => group.records.map(track => track.track_id));
          const chunk = 50;
          for (let i = 0; i < allTrackIds.length; i += chunk) {
            const trackIds = allTrackIds.slice(i, i + chunk);
            const tracksData = await spotifyApi.getTracks(trackIds);
            const art = tracksData.tracks.reduce((acc, track) => {
              if (track && track.album.images.length > 0) {
                acc[track.id] = track.album.images[0].url;
              }
              return acc;
            }, {} as Record<string, string>);
            setAlbumArt(prevArt => ({ ...prevArt, ...art }));
          }
        }
      } catch (err) {
        setError('Failed to fetch tracks. Make sure the backend server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracksAndArt();
  }, [spotifyApi]);

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
      <Text variant="headlineSmall" style={styles.title}>Monthly Top Tracks</Text>
      {groupedTracks.map((group, groupIndex) => (
        <List.Accordion
          key={`${group.year}-${group.month}`}
          title={`${getMonthName(group.month)} ${group.year}`}
          left={props => <List.Icon {...props} icon="calendar" />}
        >
          {group.records.map((track, index) => (
            <List.Item
              key={track.track_id}
              title={track.name}
              description={`Popularity: ${track.popularity}`}
              left={props => (
                <Image
                  source={{ uri: albumArt[track.track_id] || 'https://via.placeholder.com/150' }}
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

export default MonthlyTopTracks;