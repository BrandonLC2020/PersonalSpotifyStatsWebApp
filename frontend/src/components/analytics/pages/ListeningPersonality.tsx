import React, { useMemo, useEffect, useState } from 'react';
import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import ShareIcon from '@mui/icons-material/Share';
import SpotifyWebApi from 'spotify-web-api-js';
import { GroupedRecords, Track, Artist, PersonalityType, PersonalityResult } from '../../../types';
import { computeLoyaltyStats, computeGenreDiversity, computeEntityChurn, computeAudioProfileAvg } from '../../../utils/analyticsUtils';
import useAudioFeatures from '../../../hooks/useAudioFeatures';
import { chartCardSx } from '../../../utils/chartTheme';
import { toPng } from 'html-to-image';

interface Props {
  tracks: GroupedRecords<Track>[];
  artists: GroupedRecords<Artist>[];
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
  compact?: boolean;
}

const PERSONALITY_CONFIG: Record<PersonalityType, { emoji: string; description: string }> = {
  'The Loyalist': { emoji: '🤝', description: 'You build deep connections with your favorite artists and stick with them through thick and thin.' },
  'The Explorer': { emoji: '🧭', description: 'You\'re always seeking new sounds and genres, never settling for what\'s comfortable.' },
  'The Mainstreamer': { emoji: '📻', description: 'You have your finger on the pulse of popular music. The charts are your domain.' },
  'The Hipster': { emoji: '🎸', description: 'You dig deep into underground scenes and love discovering hidden gems before they go mainstream.' },
  'The Mood Rider': { emoji: '🎭', description: 'Your music follows your emotions. Each month tells a different emotional story.' },
  'The Energizer': { emoji: '⚡', description: 'High energy is your default. Your playlists could power a workout or a party.' },
  'The Night Owl': { emoji: '🌙', description: 'You gravitate toward acoustic, mellow tones. Late nights and intimate vibes are your thing.' },
  'The Groove Master': { emoji: '💃', description: 'Rhythm is everything. If it makes you move, it\'s on your playlist.' },
};

const ListeningPersonality: React.FC<Props> = ({ tracks, artists, spotifyApi, compact = false }) => {
  const theme = useTheme();
  const mode = theme.palette.mode as 'light' | 'dark';
  const cardRef = React.useRef<HTMLDivElement>(null);
  const { fetchFeatures } = useAudioFeatures(spotifyApi);
  const [personality, setPersonality] = useState<PersonalityResult | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Compute personality
  useEffect(() => {
    const compute = async () => {
      // 1. Artist churn rate
      const churn = computeEntityChurn(artists, 'artist_id');
      const avgChurnRate = churn.length > 1
        ? churn.slice(1).reduce((sum, c) => sum + (c.exited / (c.retained + c.exited + c.entered || 1)), 0) / (churn.length - 1)
        : 0.5;

      // 2. Genre diversity
      const diversity = computeGenreDiversity(artists);
      const avgDiversity = diversity.length > 0
        ? diversity.reduce((sum, d) => sum + d.diversity, 0) / diversity.length
        : 0;

      // 3. Average popularity
      const allPops = tracks.flatMap(g => g.records.map(t => t.popularity)).filter(p => p > 0);
      const avgPop = allPops.length > 0 ? allPops.reduce((a, b) => a + b, 0) / allPops.length : 50;

      // 4. Audio features
      const allTrackIds = Array.from(new Set(tracks.flatMap(g => g.records.map(t => t.track_id))));
      const features = await fetchFeatures(allTrackIds.slice(0, 200));
      const avgProfile = computeAudioProfileAvg(features);

      // 5. Valence variance
      const valences = features.map(f => f.valence);
      const meanValence = valences.length > 0 ? valences.reduce((a, b) => a + b, 0) / valences.length : 0.5;
      const valenceVariance = valences.length > 0
        ? valences.reduce((sum, v) => sum + Math.pow(v - meanValence, 2), 0) / valences.length
        : 0;

      // Scoring
      const scores: { type: PersonalityType; score: number; stats: { label: string; value: string }[] }[] = [
        {
          type: 'The Loyalist',
          score: avgChurnRate < 0.2 ? 100 : avgChurnRate < 0.35 ? 60 : 20,
          stats: [{ label: 'Avg Churn Rate', value: `${Math.round(avgChurnRate * 100)}%` }],
        },
        {
          type: 'The Explorer',
          score: avgDiversity > 3.5 ? 100 : avgDiversity > 2.5 ? 70 : 30,
          stats: [{ label: 'Genre Diversity', value: avgDiversity.toFixed(1) }],
        },
        {
          type: 'The Mainstreamer',
          score: avgPop > 70 ? 100 : avgPop > 55 ? 60 : 20,
          stats: [{ label: 'Avg Popularity', value: Math.round(avgPop).toString() }],
        },
        {
          type: 'The Hipster',
          score: (avgPop < 40 && avgDiversity > 2.5) ? 100 : (avgPop < 50 ? 50 : 15),
          stats: [{ label: 'Avg Popularity', value: Math.round(avgPop).toString() }, { label: 'Diversity', value: avgDiversity.toFixed(1) }],
        },
        {
          type: 'The Mood Rider',
          score: valenceVariance > 0.05 ? 100 : valenceVariance > 0.03 ? 60 : 20,
          stats: [{ label: 'Mood Variance', value: (valenceVariance * 100).toFixed(1) }],
        },
        {
          type: 'The Energizer',
          score: (avgProfile?.energy ?? 0) > 0.7 ? 100 : (avgProfile?.energy ?? 0) > 0.55 ? 60 : 20,
          stats: [{ label: 'Avg Energy', value: `${Math.round((avgProfile?.energy ?? 0) * 100)}%` }],
        },
        {
          type: 'The Night Owl',
          score: ((avgProfile?.acousticness ?? 0) > 0.4 && (avgProfile?.energy ?? 0) < 0.45) ? 100 : 20,
          stats: [{ label: 'Acousticness', value: `${Math.round((avgProfile?.acousticness ?? 0) * 100)}%` }],
        },
        {
          type: 'The Groove Master',
          score: (avgProfile?.danceability ?? 0) > 0.7 ? 100 : (avgProfile?.danceability ?? 0) > 0.55 ? 60 : 20,
          stats: [{ label: 'Danceability', value: `${Math.round((avgProfile?.danceability ?? 0) * 100)}%` }],
        },
      ];

      scores.sort((a, b) => b.score - a.score);
      const primary = scores[0];
      const secondary = scores.slice(1, 3).map(s => s.type);

      setPersonality({
        primary: primary.type,
        emoji: PERSONALITY_CONFIG[primary.type].emoji,
        description: PERSONALITY_CONFIG[primary.type].description,
        stats: primary.stats.map(s => ({ label: s.label, value: s.value })),
        secondary,
      });

      setTimeout(() => setRevealed(true), 500);
    };

    compute();
  }, [tracks, artists, fetchFeatures]);

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = 'my-listening-personality.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export:', err);
    }
  };

  if (!personality) {
    return (
      <Paper sx={{ ...chartCardSx(mode), textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">Analyzing your listening personality...</Typography>
      </Paper>
    );
  }

  return (
    <Paper
      ref={cardRef}
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      sx={{
        p: compact ? 2.5 : 4,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #1a0533 0%, #0d1117 40%, #0a1628 100%)',
        border: '1px solid rgba(29, 185, 84, 0.2)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Share button */}
      <Tooltip title="Download as image">
        <IconButton
          onClick={handleShare}
          sx={{ position: 'absolute', top: 8, right: 8, color: 'rgba(255,255,255,0.4)' }}
        >
          <ShareIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Typography variant="overline" sx={{ color: '#1DB954', letterSpacing: 3 }}>
        YOUR LISTENING PERSONALITY
      </Typography>

      {/* Main personality reveal */}
      <motion.div
        initial={{ scale: 0 }}
        animate={revealed ? { scale: 1 } : {}}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
      >
        <Typography variant={compact ? 'h3' : 'h2'} sx={{ my: 1 }}>
          {personality.emoji}
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={revealed ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.5 }}
      >
        <Typography
          variant={compact ? 'h5' : 'h4'}
          sx={{
            fontWeight: 700,
            color: '#fff',
            mb: 1,
            background: 'linear-gradient(135deg, #1DB954, #42A5F5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {personality.primary}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2, maxWidth: 400, mx: 'auto' }}>
          {personality.description}
        </Typography>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 1 } : {}}
        transition={{ delay: 0.8 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
          {personality.stats.map((stat, i) => (
            <Box key={i}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1DB954' }}>{stat.value}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>{stat.label}</Typography>
            </Box>
          ))}
        </Box>

        {/* Secondary personalities */}
        {!compact && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
              Also a bit of:
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 0.5 }}>
              {personality.secondary.map(type => (
                <Typography key={type} variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  {PERSONALITY_CONFIG[type].emoji} {type}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </motion.div>
    </Paper>
  );
};

export default ListeningPersonality;
