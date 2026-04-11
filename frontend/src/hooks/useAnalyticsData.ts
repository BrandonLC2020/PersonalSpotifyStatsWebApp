import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { GroupedRecords, Track, Artist, Album, MonthLabel } from '../types';
import { getAllMonths } from '../utils/analyticsUtils';

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
          api.get<GroupedRecords<Track>[]>('/api/tracks'),
          api.get<GroupedRecords<Artist>[]>('/api/artists'),
          api.get<GroupedRecords<Album>[]>('/api/albums'),
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
