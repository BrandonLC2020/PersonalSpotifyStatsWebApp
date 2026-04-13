// ===== Existing Entity Types (centralized) =====

export interface Track {
  track_id: string;
  name: string;
  standing: number;
  month: number;
  year: number;
  popularity: number;
  duration_ms: number;
  is_explicit: boolean;
  album_id: string;
  artist_ids: string | string[];
}

export interface Artist {
  artist_id: string;
  name: string;
  standing: number;
  month: number;
  year: number;
  popularity: number;
  genres: string | string[];
  images: { url: string }[];
}

export interface Album {
  album_id: string;
  name: string;
  standing: number;
  month: number;
  year: number;
  album_type: string;
  release_date: string;
  images: { url: string }[];
  artist_ids: string | string[];
}

export interface GroupedRecords<T> {
  year: number;
  month: number;
  records: T[];
}

// ===== Audio Features from Spotify API =====

export interface AudioFeatures {
  id: string;
  danceability: number;
  energy: number;
  valence: number;
  tempo: number;
  acousticness: number;
  instrumentalness: number;
  speechiness: number;
  liveness: number;
}

// ===== Analytics-specific types =====

export interface RankingDataPoint {
  month: string;
  [entityName: string]: number | string | null;
}

export interface GenreDataPoint {
  month: string;
  [genre: string]: number | string | null;
}

export interface LoyaltyEntry {
  name: string;
  id: string;
  monthsAppeared: number;
  longestStreak: number;
  avgStanding: number;
  image?: string;
}

export interface MoodDataPoint {
  trackName: string;
  trackId: string;
  valence: number;
  energy: number;
  popularity?: number;
}

export interface ChurnDataPoint {
  month: string;
  entered: number;
  exited: number;
  retained: number;
}

export interface MonthLabel {
  year: number;
  month: number;
  label: string;
  key: string; // "2025-01"
}

export interface DurationDataPoint {
  month: string;
  avgDurationMs: number;
  avgDurationFormatted: string;
  trackCount: number;
}

export interface ExplicitDataPoint {
  month: string;
  explicit: number;
  clean: number;
  explicitPercent: number;
}

export interface PopularityHeatmapCell {
  month: string;
  standing: number;
  popularity: number;
  name: string;
}

// ===== Analytics API response types =====

export interface ArtistDominanceEntry {
  name: string;
  track_count: number;
}

export interface ArtistDominanceMonth {
  month: number;
  year: number;
  artists: ArtistDominanceEntry[];
}

export interface AlbumConcentrationEntry {
  name: string;
  album_id: string;
  track_count: number;
  album_type: string;
}

export interface AlbumConcentrationMonth {
  month: number;
  year: number;
  albums: AlbumConcentrationEntry[];
}

export interface NewVsCatalogMonth {
  month: number;
  year: number;
  new_count: number;
  recent_count: number;
  catalog_count: number;
}

export interface EntityChurnMonth {
  month: number;
  year: number;
  entered: string[];
  exited: string[];
  retained_count: number;
}

export interface YearSummary {
  year: number;
  top_track: { name: string; id: string; months_appeared: number };
  top_artist: { name: string; id: string; months_appeared: number };
  top_album: { name: string; id: string; months_appeared: number };
  genre_counts: Record<string, number>;
  monthly_avg_popularity: { month: number; avg_popularity: number }[];
  unique_tracks: number;
  unique_artists: number;
  unique_albums: number;
}

// ===== Personality types =====

export type PersonalityType =
  | 'The Loyalist'
  | 'The Explorer'
  | 'The Mainstreamer'
  | 'The Hipster'
  | 'The Mood Rider'
  | 'The Energizer'
  | 'The Night Owl'
  | 'The Groove Master';

export interface PersonalityResult {
  primary: PersonalityType;
  emoji: string;
  description: string;
  stats: { label: string; value: string | number }[];
  secondary: PersonalityType[];
}
