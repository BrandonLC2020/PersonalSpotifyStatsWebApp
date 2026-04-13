import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Linking } from 'react-native';
import { Text, ActivityIndicator, useTheme, Card, Avatar, Chip } from 'react-native-paper';
import useSpotifyWeb from '../../hooks/useSpotifyWeb';

interface Artist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string }[];
  external_urls: {
    spotify: string;
  };
}

const ArtistItem = ({ artist, index }: { artist: Artist; index: number }) => {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={() => Linking.openURL(artist.external_urls.spotify)}>
      <Card style={styles.card} mode="elevated">
        <Card.Title
          title={artist.name}
          subtitle={artist.genres.length > 0 ? artist.genres.slice(0, 2).join(', ') : undefined}
          left={(props) => (
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: artist.images[0]?.url || 'https://via.placeholder.com/150' }} 
                style={styles.avatar}
              />
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
            </View>
          )}
        />
      </Card>
    </TouchableOpacity>
  );
};

const CurrentTopArtists = () => {
  const { spotifyApi, loading, error } = useSpotifyWeb();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [fetching, setFetching] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (spotifyApi) {
      const fetchArtists = async () => {
        setFetching(true);
        try {
          const response = await spotifyApi.getMyTopArtists({ limit: 50, time_range: 'short_term' });
          setArtists(response.items as Artist[]);
        } catch (e) {
          console.error(e);
        } finally {
          setFetching(false);
        }
      };
      fetchArtists();
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
      data={artists}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => <ArtistItem artist={item} index={index} />}
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
  }
});

export default CurrentTopArtists;