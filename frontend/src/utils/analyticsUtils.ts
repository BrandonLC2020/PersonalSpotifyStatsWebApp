import {
  GroupedRecords,
  Track,
  Artist,
  RankingDataPoint,
  GenreDataPoint,
  LoyaltyEntry,
  DurationDataPoint,
  ExplicitDataPoint,
  PopularityHeatmapCell,
  ChurnDataPoint,
  MonthLabel,
  AudioFeatures,
  MoodDataPoint,
} from '../types';
import { getMonthLabel } from './chartTheme';

/**
 * Generate a sorted array of all unique month labels from grouped data.
 */
export function getAllMonths<T extends { month: number; year: number }>(
  ...groupedDataSets: GroupedRecords<any>[][]
): MonthLabel[] {
  const monthSet = new Map<string, MonthLabel>();

  for (const dataset of groupedDataSets) {
    for (const group of dataset) {
      const key = `${group.year}-${String(group.month).padStart(2, '0')}`;
      if (!monthSet.has(key)) {
        monthSet.set(key, {
          year: group.year,
          month: group.month,
          label: getMonthLabel(group.month, group.year),
          key,
        });
      }
    }
  }

  return Array.from(monthSet.values()).sort((a, b) =>
    a.key.localeCompare(b.key)
  );
}

/**
 * Compute ranking timeline data for bump/line charts.
 * Returns an array of data points where each point has a month label
 * and entity names as keys with their standing as values.
 */
export function computeRankingTimeline(
  groupedData: GroupedRecords<Track | Artist>[],
  topN: number = 10,
  idField: string = 'track_id',
  nameField: string = 'name'
): { data: RankingDataPoint[]; entities: string[] } {
  // Collect all entity names that appear in the top N across all months
  const entityNames = new Set<string>();
  const months = getAllMonths(groupedData);

  const data: RankingDataPoint[] = months.map(monthLabel => {
    const group = groupedData.find(
      g => g.year === monthLabel.year && g.month === monthLabel.month
    );
    const point: RankingDataPoint = { month: monthLabel.label };

    if (group) {
      group.records.slice(0, topN).forEach((record: any) => {
        const name = record[nameField];
        entityNames.add(name);
        point[name] = record.standing ?? (group.records.indexOf(record) + 1);
      });
    }

    return point;
  });

  return { data, entities: Array.from(entityNames) };
}

/**
 * Compute genre frequency over time from artist data.
 * Returns stacked area chart data with top N genres + "Other".
 */
export function computeGenreTimeline(
  groupedArtists: GroupedRecords<Artist>[],
  topNGenres: number = 8
): { data: GenreDataPoint[]; genres: string[] } {
  // First pass: count total genre occurrences across all months
  const globalGenreCounts = new Map<string, number>();
  const months = getAllMonths(groupedArtists);

  for (const group of groupedArtists) {
    for (const artist of group.records) {
      const genres = parseGenres(artist.genres);
      for (const genre of genres) {
        globalGenreCounts.set(genre, (globalGenreCounts.get(genre) || 0) + 1);
      }
    }
  }

  // Get top N genres
  const topGenres = Array.from(globalGenreCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topNGenres)
    .map(([genre]) => genre);

  // Second pass: build data points per month
  const data: GenreDataPoint[] = months.map(monthLabel => {
    const group = groupedArtists.find(
      g => g.year === monthLabel.year && g.month === monthLabel.month
    );
    const point: GenreDataPoint = { month: monthLabel.label };
    const genreCounts = new Map<string, number>();

    if (group) {
      for (const artist of group.records) {
        const genres = parseGenres(artist.genres);
        for (const genre of genres) {
          genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
        }
      }
    }

    let otherCount = 0;
    for (const [genre, count] of genreCounts.entries()) {
      if (topGenres.includes(genre)) {
        point[genre] = count;
      } else {
        otherCount += count;
      }
    }

    // Ensure all top genres have a value (0 if not present)
    for (const genre of topGenres) {
      if (!(genre in point)) {
        point[genre] = 0;
      }
    }
    point['Other'] = otherCount;

    return point;
  });

  return { data, genres: [...topGenres, 'Other'] };
}

/**
 * Compute genre diversity score (Shannon entropy) per month.
 */
export function computeGenreDiversity(
  groupedArtists: GroupedRecords<Artist>[]
): { month: string; diversity: number }[] {
  const months = getAllMonths(groupedArtists);

  return months.map(monthLabel => {
    const group = groupedArtists.find(
      g => g.year === monthLabel.year && g.month === monthLabel.month
    );

    if (!group || group.records.length === 0) {
      return { month: monthLabel.label, diversity: 0 };
    }

    const genreCounts = new Map<string, number>();
    let totalGenres = 0;

    for (const artist of group.records) {
      const genres = parseGenres(artist.genres);
      for (const genre of genres) {
        genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
        totalGenres++;
      }
    }

    return {
      month: monthLabel.label,
      diversity: shannonEntropy(genreCounts, totalGenres),
    };
  });
}

/**
 * Compute artist loyalty stats.
 */
export function computeLoyaltyStats(
  groupedArtists: GroupedRecords<Artist>[]
): LoyaltyEntry[] {
  const artistMap = new Map<
    string,
    { name: string; months: Set<string>; standings: number[]; image?: string; monthKeys: string[] }
  >();

  // Sort groups chronologically
  const sortedGroups = [...groupedArtists].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  for (const group of sortedGroups) {
    const monthKey = `${group.year}-${String(group.month).padStart(2, '0')}`;
    for (const artist of group.records) {
      const id = artist.artist_id;
      if (!artistMap.has(id)) {
        artistMap.set(id, {
          name: artist.name,
          months: new Set(),
          standings: [],
          image: artist.images?.[0]?.url,
          monthKeys: [],
        });
      }
      const entry = artistMap.get(id)!;
      entry.months.add(monthKey);
      entry.standings.push(artist.standing ?? (group.records.indexOf(artist) + 1));
      entry.monthKeys.push(monthKey);
    }
  }

  // Compute longest streak for each artist
  const allMonthKeys = sortedGroups.map(
    g => `${g.year}-${String(g.month).padStart(2, '0')}`
  );
  const uniqueMonthKeys = Array.from(new Set(allMonthKeys));

  return Array.from(artistMap.entries())
    .map(([id, data]) => ({
      name: data.name,
      id,
      monthsAppeared: data.months.size,
      longestStreak: computeLongestStreak(data.months, uniqueMonthKeys),
      avgStanding:
        Math.round(
          (data.standings.reduce((a, b) => a + b, 0) / data.standings.length) * 10
        ) / 10,
      image: data.image,
    }))
    .sort((a, b) => b.monthsAppeared - a.monthsAppeared);
}

/**
 * Compute entity churn (entries/exits) between consecutive months.
 */
export function computeEntityChurn<T extends { [key: string]: any }>(
  groupedData: GroupedRecords<T>[],
  idField: string
): ChurnDataPoint[] {
  // Sort chronologically
  const sorted = [...groupedData].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  const result: ChurnDataPoint[] = [];
  let previousIds = new Set<string>();

  for (let i = 0; i < sorted.length; i++) {
    const group = sorted[i];
    const currentIds = new Set(group.records.map((r: any) => r[idField]));
    const monthLabel = getMonthLabel(group.month, group.year);

    if (i === 0) {
      result.push({
        month: monthLabel,
        entered: currentIds.size,
        exited: 0,
        retained: 0,
      });
    } else {
      const entered = Array.from(currentIds).filter(id => !previousIds.has(id)).length;
      const exited = Array.from(previousIds).filter(id => !currentIds.has(id)).length;
      const retained = Array.from(currentIds).filter(id => previousIds.has(id)).length;

      result.push({ month: monthLabel, entered, exited, retained });
    }

    previousIds = currentIds;
  }

  return result;
}

/**
 * Compute average track duration per month.
 */
export function computeAvgDuration(
  groupedTracks: GroupedRecords<Track>[]
): DurationDataPoint[] {
  const months = getAllMonths(groupedTracks);

  return months.map(monthLabel => {
    const group = groupedTracks.find(
      g => g.year === monthLabel.year && g.month === monthLabel.month
    );

    if (!group || group.records.length === 0) {
      return {
        month: monthLabel.label,
        avgDurationMs: 0,
        avgDurationFormatted: '0:00',
        trackCount: 0,
      };
    }

    const validTracks = group.records.filter(t => t.duration_ms > 0);
    const avgMs =
      validTracks.reduce((sum, t) => sum + t.duration_ms, 0) / validTracks.length || 0;
    const minutes = Math.floor(avgMs / 60000);
    const seconds = Math.floor((avgMs % 60000) / 1000);

    return {
      month: monthLabel.label,
      avgDurationMs: Math.round(avgMs),
      avgDurationFormatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      trackCount: validTracks.length,
    };
  });
}

/**
 * Compute explicit vs clean ratio per month.
 */
export function computeExplicitRatio(
  groupedTracks: GroupedRecords<Track>[]
): ExplicitDataPoint[] {
  const months = getAllMonths(groupedTracks);

  return months.map(monthLabel => {
    const group = groupedTracks.find(
      g => g.year === monthLabel.year && g.month === monthLabel.month
    );

    if (!group || group.records.length === 0) {
      return { month: monthLabel.label, explicit: 0, clean: 0, explicitPercent: 0 };
    }

    const explicitCount = group.records.filter(t => t.is_explicit).length;
    const cleanCount = group.records.length - explicitCount;
    const explicitPercent = Math.round((explicitCount / group.records.length) * 100);

    return {
      month: monthLabel.label,
      explicit: explicitCount,
      clean: cleanCount,
      explicitPercent,
    };
  });
}

/**
 * Compute popularity heatmap data (standing × month × popularity).
 */
export function computePopularityHeatmap(
  groupedData: GroupedRecords<Track | Artist>[],
  maxStanding: number = 10
): PopularityHeatmapCell[] {
  const cells: PopularityHeatmapCell[] = [];

  for (const group of groupedData) {
    const monthLabel = getMonthLabel(group.month, group.year);
    for (const record of group.records) {
      const standing = (record as any).standing ?? 0;
      if (standing > 0 && standing <= maxStanding) {
        cells.push({
          month: monthLabel,
          standing,
          popularity: (record as any).popularity ?? 0,
          name: (record as any).name ?? '',
        });
      }
    }
  }

  return cells;
}

/**
 * Compute mood quadrant from audio features.
 */
export function computeMoodQuadrant(
  features: AudioFeatures[]
): MoodDataPoint[] {
  // Note: we'd need track names mapped separately
  return features.map(f => ({
    trackName: f.id, // Will be replaced with actual name in component
    trackId: f.id,
    valence: f.valence,
    energy: f.energy,
  }));
}

/**
 * Compute average audio profile across a set of features.
 */
export function computeAudioProfileAvg(
  features: AudioFeatures[]
): Omit<AudioFeatures, 'id'> | null {
  if (features.length === 0) return null;

  const sum = features.reduce(
    (acc, f) => ({
      danceability: acc.danceability + f.danceability,
      energy: acc.energy + f.energy,
      valence: acc.valence + f.valence,
      tempo: acc.tempo + f.tempo,
      acousticness: acc.acousticness + f.acousticness,
      instrumentalness: acc.instrumentalness + f.instrumentalness,
      speechiness: acc.speechiness + f.speechiness,
      liveness: acc.liveness + f.liveness,
    }),
    {
      danceability: 0,
      energy: 0,
      valence: 0,
      tempo: 0,
      acousticness: 0,
      instrumentalness: 0,
      speechiness: 0,
      liveness: 0,
    }
  );

  const n = features.length;
  return {
    danceability: Math.round((sum.danceability / n) * 100) / 100,
    energy: Math.round((sum.energy / n) * 100) / 100,
    valence: Math.round((sum.valence / n) * 100) / 100,
    tempo: Math.round((sum.tempo / n) * 10) / 10,
    acousticness: Math.round((sum.acousticness / n) * 100) / 100,
    instrumentalness: Math.round((sum.instrumentalness / n) * 100) / 100,
    speechiness: Math.round((sum.speechiness / n) * 100) / 100,
    liveness: Math.round((sum.liveness / n) * 100) / 100,
  };
}

// ===== Helper functions =====

function parseGenres(genres: string | string[]): string[] {
  if (Array.isArray(genres)) return genres;
  if (typeof genres === 'string') {
    try {
      const parsed = JSON.parse(genres);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return genres ? [genres] : [];
    }
  }
  return [];
}

function shannonEntropy(counts: Map<string, number>, total: number): number {
  if (total === 0) return 0;
  let entropy = 0;
  for (const count of counts.values()) {
    const p = count / total;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  return Math.round(entropy * 100) / 100;
}

function computeLongestStreak(
  presentMonths: Set<string>,
  allMonths: string[]
): number {
  let maxStreak = 0;
  let currentStreak = 0;

  for (const monthKey of allMonths) {
    if (presentMonths.has(monthKey)) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}
