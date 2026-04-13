import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Linking } from 'react-native';
import { Text, ActivityIndicator, useTheme, Card, Avatar } from 'react-native-paper';
import SpotifyWebApi from 'spotify-web-api-js';
import useSpotifyWeb from '../../hooks/useSpotifyWeb';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  external_urls: {
    spotify: string;
  };
}

const TrackItem = ({ track, index }: { track: Track; index: number }) => {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={() => Linking.openURL(track.external_urls.spotify)}>
      <Card style={styles.card} mode="elevated">
        <Card.Title
          title={track.name}
          subtitle={track.artists.length > 0 ? track.artists.map(a => a.name).join(', ') : undefined}
          left={(props) => (
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: track.album.images[0]?.url || 'https://via.placeholder.com/150' }} 
                style={styles.thumbnail}
              />
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
            </View>
          )}
          right={(props) => (
            <Text style={styles.albumText} numberOfLines={1}>
              {track.album.name}
            </Text>
          )}
        />
      </Card>
    </TouchableOpacity>
  );
};

const CurrentTopTracks = () => {
  const { spotifyApi, loading, error } = useSpotifyWeb();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [fetching, setFetching] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (spotifyApi) {
      const fetchTracks = async () => {
        setFetching(true);
        try {
          const response = await spotifyApi.getMyTopTracks({ limit: 50, time_range: 'short_term' });
          setTracks(response.items as Track[]);
        } catch (e) {
          console.error(e);
        } finally {
          setFetching(false);
        }
      };
      fetchTracks();
    }
  }, [spotifyApi]);

  if (loading || fetching) {
    return <ActivityIndicator style={styles.centered} size="large" />;
  }

  if (error) {
    return <Text style={styles.centered}>Error: {error.message}</Text>;
  }

  return (
    <FlatList
      data={tracks}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => <TrackItem track={item} index={index} />}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatarContainer: {
      position: 'relative',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  rankBadge: {
      position: 'absolute',
      top: -5,
      left: -5,
      backgroundColor: '#1DB954',
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'white',
  },
  rankText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
  },
  albumText: {
      fontSize: 12,
      opacity: 0.6,
      marginRight: 16,
      maxWidth: 100,
  }
});

export default CurrentTopTracks;