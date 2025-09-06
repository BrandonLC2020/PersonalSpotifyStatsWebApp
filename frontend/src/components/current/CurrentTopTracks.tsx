import React, { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Grid,
  Card,
  CardContent,
  Link,
  CardMedia
} from '@mui/material';
import { useSpotifyWeb } from '../../hooks/useSpotifyWeb';

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

interface CurrentTracksProps {
  viewMode: 'table' | 'grid';
}

const CurrentTopTracks: React.FC<CurrentTracksProps> = ({ viewMode }) => {
  const { spotifyApi, loading: spotifyLoading, error: spotifyError } = useSpotifyWeb();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopTracks = async () => {
      if (!spotifyApi) return;

      try {
        setLoading(true);
        const response = await spotifyApi.getMyTopTracks({ limit: 50 });
        setTracks(response.items as Track[]);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch top tracks from Spotify:', err);
        setError('Failed to fetch top tracks. Please ensure you are logged in to Spotify.');
      } finally {
        setLoading(false);
      }
    };

    if (!spotifyLoading) {
      fetchTopTracks();
    }
  }, [spotifyApi, spotifyLoading]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', e.currentTarget.src);
    e.currentTarget.src = 'https://via.placeholder.com/150'; // Fallback to placeholder on