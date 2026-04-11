import { useState, useCallback, useRef } from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import { AudioFeatures } from '../types';

// Custom error for deprecated audio-features endpoint
class AudioFeaturesDeprecatedError extends Error {
  constructor() {
    super('Spotify Audio Features API has been deprecated');
    this.name = 'AudioFeaturesDeprecatedError';
  }
}

// In-memory cache shared across hook instances
const audioFeaturesCache = new Map<string, AudioFeatures>();

interface UseAudioFeaturesReturn {
  features: AudioFeatures[];
  loading: boolean;
  error: string | null;
  fetchFeatures: (trackIds: string[]) => Promise<AudioFeatures[]>;
}

/**
 * Custom hook to fetch audio features from Spotify API.
 * Includes in-memory caching and chunked requests to respect rate limits.
 */
const useAudioFeatures = (
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs | null
): UseAudioFeaturesReturn => {
  const [features, setFeatures] = useState<AudioFeatures[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const fetchFeatures = useCallback(
    async (trackIds: string[]): Promise<AudioFeatures[]> => {
      if (!spotifyApi || trackIds.length === 0) return [];

      setLoading(true);
      setError(null);
      abortRef.current = false;

      try {
        // Separate cached and uncached IDs
        const uncachedIds: string[] = [];
        const cachedFeatures: AudioFeatures[] = [];

        for (const id of trackIds) {
          const cached = audioFeaturesCache.get(id);
          if (cached) {
            cachedFeatures.push(cached);
          } else {
            uncachedIds.push(id);
          }
        }

        // Fetch uncached in chunks of 100 (Spotify's max)
        const chunkSize = 100;
        const newFeatures: AudioFeatures[] = [];

        for (let i = 0; i < uncachedIds.length; i += chunkSize) {
          if (abortRef.current) break;

          const chunk = uncachedIds.slice(i, i + chunkSize);

          try {
            const response = await spotifyApi.getAudioFeaturesForTracks(chunk);

            for (const feature of response.audio_features) {
              if (feature) {
                const mapped: AudioFeatures = {
                  id: feature.id,
                  danceability: feature.danceability,
                  energy: feature.energy,
                  valence: feature.valence,
                  tempo: feature.tempo,
                  acousticness: feature.acousticness,
                  instrumentalness: feature.instrumentalness,
                  speechiness: feature.speechiness,
                  liveness: feature.liveness,
                };
                audioFeaturesCache.set(feature.id, mapped);
                newFeatures.push(mapped);
              }
            }
          } catch (chunkErr: any) {
            // If forbidden (403), the audio-features endpoint is deprecated
            if (chunkErr?.status === 403) {
              throw new AudioFeaturesDeprecatedError();
            }
            // If rate limited, wait and retry
            if (chunkErr?.status === 429) {
              const retryAfter = parseInt(chunkErr.headers?.['retry-after'] || '2', 10);
              await delay(retryAfter * 1000);
              i -= chunkSize; // retry this chunk
              continue;
            }
            throw chunkErr;
          }

          // Small delay between chunks to avoid rate limits
          if (i + chunkSize < uncachedIds.length) {
            await delay(100);
          }
        }

        const allFeatures = [...cachedFeatures, ...newFeatures];
        setFeatures(allFeatures);
        return allFeatures;
      } catch (err: any) {
        if (err instanceof AudioFeaturesDeprecatedError) {
          console.warn('Spotify Audio Features API is no longer available (deprecated Nov 2024).');
          setError('DEPRECATED');
        } else {
          console.error('Failed to fetch audio features:', err);
          setError('Failed to fetch audio features from Spotify.');
        }
        return [];
      } finally {
        setLoading(false);
      }
    },
    [spotifyApi]
  );

  return { features, loading, error, fetchFeatures };
};

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default useAudioFeatures;
