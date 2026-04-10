import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { GroupedRecords, Track, Artist, Album, MonthLabel } from '../types';
import { getAllMonths } from '../utils/analyticsUtils';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface AnalyticsDataState {
  tracks: GroupedRecords<Track>[];
  artists: GroupedRecords<Artist>[];
  albums: GroupedRecords<Album>[];
  allMonths: MonthLabel[];
  loading: boolean;
  error: string | null;
}

/**
 * Fetches all three entity endpoints in parallel, caches the result,
 * and provides the raw grouped data plus a sorted list of all months.
 */
const useAnalyticsData = (): AnalyticsDataState => {
  const [state, setState] = useState<AnalyticsDataState>({
    tracks: [],
    artists: [],
    albums: [],
    allMonths: [],
    loading: true,
    error: null,
  });

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchAll = async () => {
      try {
        const [tracksRes, artistsRes, albumsRes] = await Promise.all([
          axios.get<GroupedRecords<Track>[]>(`${API_BASE}/api/tracks`),
          axios.get<GroupedRecords<Artist>[]>(`${API_BASE}/api/artists`),
          axios.get<GroupedRecords<Album>[]>(`${API_BASE}/api/albums`),
        ]);

        const allMonths = getAllMonths(
          tracksRes.data,
          artistsRes.data,
          albumsRes.data
        );

        setState({
          tracks: tracksRes.data,
          artists: artistsRes.data,
          albums: albumsRes.data,
          allMonths,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to fetch data. Make sure the backend server is running.',
        }));
      }
    };

    fetchAll();
  }, []);

  return state;
};

export default useAnalyticsData;
