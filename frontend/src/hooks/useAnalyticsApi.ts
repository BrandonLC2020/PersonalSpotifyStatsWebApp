import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  ArtistDominanceMonth,
  AlbumConcentrationMonth,
  NewVsCatalogMonth,
  EntityChurnMonth,
  YearSummary,
} from '../types';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function useGenericFetch<T>(url: string, skip: boolean = false): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: !skip,
    error: null,
  });

  useEffect(() => {
    if (skip) return;

    let cancelled = false;

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const response = await api.get<T>(url);
        if (!cancelled) {
          setState({ data: response.data, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          console.error(`Failed to fetch ${url}:`, err);
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Failed to fetch analytics data.',
          }));
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [url, skip]);

  return state;
}

export function useArtistTrackDominance(year?: number) {
  const params = year ? `?year=${year}` : '';
  return useGenericFetch<ArtistDominanceMonth[]>(
    `/api/analytics/artist_track_dominance${params}`
  );
}

export function useAlbumConcentration(year?: number) {
  const params = year ? `?year=${year}` : '';
  return useGenericFetch<AlbumConcentrationMonth[]>(
    `/api/analytics/album_concentration${params}`
  );
}

export function useNewVsCatalog(year?: number) {
  const params = year ? `?year=${year}` : '';
  return useGenericFetch<NewVsCatalogMonth[]>(
    `/api/analytics/new_vs_catalog${params}`
  );
}

export function useEntityChurn(type: 'tracks' | 'artists' | 'albums') {
  return useGenericFetch<EntityChurnMonth[]>(
    `/api/analytics/entity_churn?type=${type}`
  );
}

export function useYearSummary(year: number | null) {
  return useGenericFetch<YearSummary>(
    `/api/analytics/year_summary?year=${year}`,
    year === null
  );
}
