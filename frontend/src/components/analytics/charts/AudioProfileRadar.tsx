import React, { useMemo, useState, useEffect } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip
} from './TypedRecharts';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SpotifyWebApi from 'spotify-web-api-js';
import { GroupedRecords, Track } from '../../../types';
import useAudioFeatures from '../../../hooks/useAudioFeatures';
import { computeAudioProfileAvg } from '../../../utils/analyticsUtils';
import { getMonthLabel } from '../../../utils/chartTheme';

interface Props {
  tracks: GroupedRecords<Track>[];
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
}

const RADAR_AXES = [
  { key: 'danceability', label: 'Danceability' },
  { key: 'energy', label: 'Energy' },
  { key: 'valence', label: 'Happiness' },
  { key: 'acousticness', label: 'Acoustic' },
  { key: 'instrumentalness', label: 'Instrumental' },
  { key: 'speechiness', label: 'Speechiness' },
];

const AudioProfileRadar: React.FC<Props> = ({ tracks, spotifyApi }) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { fetchFeatures, loading } = useAudioFeatures(spotifyApi);
  const [selectedMonth1, setSelectedMonth1] = useState<string>('all');
  const [selectedMonth2, setSelectedMonth2] = useState<string>('none');
  const [radarData1, setRadarData1] = useState<any[]>([]);
  const [radarData2, setRadarData2] = useState<any[]>([]);

  // Build month options
  const monthOptions = useMemo(() => {
    const sorted = [...tracks].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    return sorted.map(g => ({
      key: `${g.year}-${g.month}`,
      label: getMonthLabel(g.month, g.year),
      group: g,
    }));
  }, [tracks]);

  // Fetch features for selected months
  useEffect(() => {
    const fetchForMonth = async (monthKey: string, setData: (d: any[]) => void) => {
      let trackIds: string[];

      if (monthKey === 'all' || monthKey === 'none') {
        if (monthKey === 'none') { setData([]); return; }
        trackIds = tracks.flatMap(g => g.records.map(t => t.track_id));
      } else {
        const [year, month] = monthKey.split('-').map(Number);
        const group = tracks.find(g => g.year === year && g.month === month);
        trackIds = group ? group.records.map(t => t.track_id) : [];
      }

      if (trackIds.length === 0) { setData([]); return; }

      const features = await fetchFeatures(trackIds);
      const avg = computeAudioProfileAvg(features);
      if (!avg) { setData([]); return; }

      setData(RADAR_AXES.map(axis => ({
        axis: axis.label,
        value: (avg as any)[axis.key] ?? 0,
      })));
    };

    fetchForMonth(selectedMonth1, setRadarData1);
    fetchForMonth(selectedMonth2, setRadarData2);
  }, [selectedMonth1, selectedMonth2, tracks, fetchFeatures]);

  // Merge data for dual radar
  const chartData = useMemo(() => {
    return RADAR_AXES.map((axis, i) => ({
      axis: axis.label,
      primary: radarData1[i]?.value ?? 0,
      ...(radarData2.length > 0 ? { comparison: radarData2[i]?.value ?? 0 } : {}),
    }));
  }, [radarData1, radarData2]);

  const primaryLabel = selectedMonth1 === 'all' ? 'All Time' : (monthOptions.find(m => m.key === selectedMonth1)?.label || '');
  const compLabel = selectedMonth2 === 'none' ? '' : selectedMonth2 === 'all' ? 'All Time' : (monthOptions.find(m => m.key === selectedMonth2)?.label || '');

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Primary Month</InputLabel>
          <Select
            value={selectedMonth1}
            label="Primary Month"
            onChange={e => setSelectedMonth1(e.target.value)}
          >
            <MenuItem value="all">All Time</MenuItem>
            {monthOptions.map(opt => (
              <MenuItem key={opt.key} value={opt.key}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Compare With</InputLabel>
          <Select
            value={selectedMonth2}
            label="Compare With"
            onChange={e => setSelectedMonth2(e.target.value)}
          >
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
            {monthOptions.map(opt => (
              <MenuItem key={opt.key} value={opt.key}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">Loading audio features...</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={chartData}>
            <PolarGrid stroke={mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
            <PolarAngleAxis
              dataKey="axis"
              tick={{
                fill: mode === 'dark' ? '#b3b3b3' : '#535353',
                fontSize: 12,
                fontWeight: 500,
              }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 1]}
              tick={{ fill: mode === 'dark' ? '#666' : '#999', fontSize: 10 }}
            />
            <Radar
              name={primaryLabel}
              dataKey="primary"
              stroke="#1DB954"
              fill="#1DB954"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            {radarData2.length > 0 && (
              <Radar
                name={compLabel}
                dataKey="comparison"
                stroke="#E91E63"
                fill="#E91E63"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            )}
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: mode === 'dark' ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: mode === 'dark' ? '#fff' : '#191414',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default AudioProfileRadar;
