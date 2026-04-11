import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Title, Paragraph, ActivityIndicator, List, useTheme, Button } from 'react-native-paper';
import useAnalyticsData from '../../hooks/useAnalyticsData';
import { VictoryPie, VictoryChart, VictoryBar, VictoryTheme } from 'victory-native';

const { width } = Dimensions.get('window');

const AnalyticsDashboard = () => {
  const { tracks, artists, allMonths, loading, error } = useAnalyticsData();
  const theme = useTheme();

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

  // Example stats
  const totalMonths = allMonths.length;
  const uniqueTracks = new Set(tracks.flatMap(g => g.records.map(r => r.track_id))).size;
  const uniqueArtists = new Set(artists.flatMap(g => g.records.map(r => r.artist_id))).size;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>Listening Analytics</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Deep insights into your music taste across {totalMonths} months of data
        </Text>
      </View>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Title>{uniqueTracks}</Title>
            <Paragraph>Tracks</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content>
            <Title>{uniqueArtists}</Title>
            <Paragraph>Artists</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.chartCard}>
        <Card.Title title="Project Status" subtitle="Web to Mobile Migration" />
        <Card.Content>
          <Text variant="bodySmall">
            The analytics dashboard is being migrated. Basic stats are available, and charts are being re-implemented using Victory Native.
          </Text>
        </Card.Content>
      </Card>

      {/* Simple Victory Pie Placeholder */}
      <View style={styles.chartContainer}>
        <Text variant="titleMedium" style={styles.chartTitle}>Explicit Content Ratio (Sample)</Text>
        <VictoryPie
          data={[
            { x: "Explicit", y: 35 },
            { x: "Clean", y: 65 },
          ]}
          colorScale={["#1DB954", "#535353"]}
          width={width - 48}
          height={250}
          innerRadius={50}
          labelRadius={70}
          style={{ labels: { fill: "white", fontSize: 12 } }}
        />
      </View>

      <View style={styles.footer}>
        <Button mode="outlined" onPress={() => console.log('Time Machine')}>
          Time Machine
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
  },
  title: {
    fontWeight: 'bold',
    color: '#1DB954',
  },
  subtitle: {
    opacity: 0.7,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  chartContainer: {
    alignItems: 'center',
    padding: 16,
  },
  chartTitle: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
});

export default AnalyticsDashboard;
