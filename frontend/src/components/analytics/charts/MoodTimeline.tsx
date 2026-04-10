import React, { useMemo, useState, useEffect } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell
} from './TypedRecharts';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SpotifyWebApi from 'spotify-web-api-js';
import { GroupedRecords, Track, MoodDataPoint } from '../../../types';
import useAudioFeatures from '../../../hooks/useAudioFeatures';
import { getMonthLabel, MOOD_COLORS } from '../../../utils/chartTheme';

interface Props {
  tracks: GroupedRecords<Track>[];
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
}

const getMoodColor = (valence: number, energy: number): string => {
  if (valence >= 0.5 && energy >= 0.5) return MOOD_COLORS.happyEnergetic;
  if (valence < 0.5 && energy >= 0.5) return MOOD_COLORS.intenseMoody;
  if (valence >= 0.5 && energy < 0.5) return MOOD_COLORS.happyChill;
  return MOOD_COLORS.sadMellow;
};

const MoodTimeline: React.FC<Props> = ({ tracks, spotifyApi }) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const { fetchFeatures, loading } = useAudioFeatures(spotifyApi);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [moodData, setMoodData] = useState<MoodDataPoint[]>([]);

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

  useEffect(() => {
    const load = async () => {
      let relevantTracks: Track[];

      if (selectedMonth === 'all') {
        relevantTracks = tracks.flatMap(g => g.records);
      } else {
        const [year, month] = selectedMonth.split('-').map(Number);
        const group = tracks.find(g => g.year === year && g.month === month);
        relevantTracks = group ? group.records : [];
      }

      const trackIds = Array.from(new Set(relevantTracks.map(t => t.track_id)));
      if (trackIds.length === 0) { setMoodData([]); return; }

      // Build name map
      const nameMap = new Map<string, string>();
      relevantTracks.forEach(t => nameMap.set(t.track_id, t.name));

      const features = await fetchFeatures(trackIds);
      setMoodData(features.map(f => ({
        trackName: nameMap.get(f.id) || f.id,
        trackId: f.id,
        valence: f.valence,
        energy: f.energy,
        popularity: relevantTracks.find(t => t.track_id === f.id)?.popularity,
      })));
    };

    load();
  }, [selectedMonth, tracks, fetchFeatures]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload as MoodDataPoint;
    const mood = d.valence >= 0.5
      ? (d.energy >= 0.5 ? 'Happy & Energetic 🎉' : 'Happy & Chill 😌')
      : (d.energy >= 0.5 ? 'Intense & Moody 🔥' : 'Sad & Mellow 💙');

    return (
      <Box sx={{
        backgroundColor: mode === 'dark' ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        p: 1.5,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.trackName}</Typography>
        <Typography variant="caption" color="text.secondary">{mood}</Typography>
        <Box sx={{ mt: 0.5 }}>
          <Typography variant="caption">Happiness: {(d.valence * 100).toFixed(0)}%</Typography>
          <br />
          <Typography variant="caption">Energy: {(d.energy * 100).toFixed(0)}%</Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Month</InputLabel>
          <Select
            value={selectedMonth}
            label="Month"
            onChange={e => setSelectedMonth(e.target.value)}
          >
            <MenuItem value="all">All Time</MenuItem>
            {monthOptions.map(opt => (
              <MenuItem key={opt.key} value={opt.key}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Quadrant labels */}
      <Box sx={{ position: 'relative' }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">Loading mood data...</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
              />
              <XAxis
                type="number"
                dataKey="valence"
                domain={[0, 1]}
                name="Happiness"
                tick={{ fill: mode === 'dark' ? '#b3b3b3' : '#535353', fontSize: 11 }}
                label={{
                  value: '← Sad · Happy →',
                  position: 'bottom',
                  fill: mode === 'dark' ? '#b3b3b3' : '#535353',
                  fontSize: 12,
                }}
              />
              <YAxis
                type="number"
                dataKey="energy"
                domain={[0, 1]}
                name="Energy"
                tick={{ fill: mode === 'dark' ? '#b3b3b3' : '#535353', fontSize: 11 }}
                label={{
                  value: '← Chill · Energetic →',
                  angle: -90,
                  position: 'insideLeft',
                  fill: mode === 'dark' ? '#b3b3b3' : '#535353',
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                x={0.5}
                stroke={mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}
                strokeDasharray="5 5"
              />
              <ReferenceLine
                y={0.5}
                stroke={mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}
                strokeDasharray="5 5"
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={moodData} name="Tracks">
                {moodData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getMoodColor(entry.valence, entry.energy)}
                    fillOpacity={0.7}
                    r={6}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        )}

        {/* Quadrant corner labels */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -1, px: 4 }}>
          <Typography variant="caption" sx={{ color: MOOD_COLORS.sadMellow, opacity: 0.7 }}>💙 Sad & Mellow</Typography>
          <Typography variant="caption" sx={{ color: MOOD_COLORS.happyChill, opacity: 0.7 }}>😌 Happy & Chill</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -28, px: 4, pointerEvents: 'none' }}>
          <Typography variant="caption" sx={{ color: MOOD_COLORS.intenseMoody, opacity: 0.7 }}>🔥 Intense</Typography>
          <Typography variant="caption" sx={{ color: MOOD_COLORS.happyEnergetic, opacity: 0.7 }}>🎉 Happy & Energetic</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default MoodTimeline;
