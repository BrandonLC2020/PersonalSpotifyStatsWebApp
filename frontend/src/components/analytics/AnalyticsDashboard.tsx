import React from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SpotifyWebApi from 'spotify-web-api-js';
import useAnalyticsData from '../../hooks/useAnalyticsData';
import { chartCardSx } from '../../utils/chartTheme';

// Tier 1 charts
import RankingMovementChart from './charts/RankingMovementChart';
import PopularityHeatmap from './charts/PopularityHeatmap';
import GenreDiversityChart from './charts/GenreDiversityChart';
import ArtistLoyaltyDashboard from './charts/ArtistLoyaltyDashboard';
import TrackDurationChart from './charts/TrackDurationChart';
import ExplicitContentChart from './charts/ExplicitContentChart';

// Tier 2 charts
import ArtistDominanceChart from './charts/ArtistDominanceChart';
import AlbumConcentrationChart from './charts/AlbumConcentrationChart';
import NewVsCatalogChart from './charts/NewVsCatalogChart';
import EntityChurnChart from './charts/EntityChurnChart';

// Tier 3 charts
import AudioProfileRadar from './charts/AudioProfileRadar';
import MoodTimeline from './charts/MoodTimeline';
import MusicDNACard from './charts/MusicDNACard';
import ListeningPersonality from './pages/ListeningPersonality';

const MotionBox = motion(Box);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

interface AnalyticsDashboardProps {
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ spotifyApi }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { tracks, artists, albums, allMonths, loading, error } = useAnalyticsData();
  const mode = theme.palette.mode as 'light' | 'dark';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  // Get available years for Year in Review links
  const years = Array.from(new Set(allMonths.map(m => m.year))).sort((a, b) => b - a);

  return (
    <MotionBox
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1DB954 0%, #1ED760 50%, #42A5F5 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Your Listening Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Deep insights into your music taste across {allMonths.length} months of data
        </Typography>
      </MotionBox>

      {/* Quick links */}
      <MotionBox variants={itemVariants} sx={{ mb: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Paper
          component={motion.div}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/analytics/time-machine')}
          sx={{
            ...chartCardSx(mode),
            cursor: 'pointer',
            px: 3,
            py: 1.5,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>⏰ Time Machine</Typography>
        </Paper>
        {years.slice(0, 3).map(year => (
          <Paper
            key={year}
            component={motion.div}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/analytics/year/${year}`)}
            sx={{
              ...chartCardSx(mode),
              cursor: 'pointer',
              px: 3,
              py: 1.5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>📊 {year} in Review</Typography>
          </Paper>
        ))}
      </MotionBox>

      {/* Chart Grid */}
      <Grid container spacing={3}>
        {/* Row 1: Ranking Movement + Popularity Heatmap */}
        <Grid item xs={12} md={6}>
          <MotionBox variants={itemVariants}>
            <Paper sx={chartCardSx(mode)}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                📈 Ranking Movement
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                How your top tracks and artists rise and fall over time
              </Typography>
              <RankingMovementChart tracks={tracks} artists={artists} />
            </Paper>
          </MotionBox>
        </Grid>
        <Grid item xs={12} md={6}>
          <MotionBox variants={itemVariants}>
            <Paper sx={chartCardSx(mode)}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                🔥 Popularity Heatmap
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Popularity scores by ranking position across months
              </Typography>
              <PopularityHeatmap tracks={tracks} artists={artists} />
            </Paper>
          </MotionBox>
        </Grid>

        {/* Row 2: Genre Diversity + Artist Loyalty */}
        <Grid item xs={12} md={6}>
          <MotionBox variants={itemVariants}>
            <Paper sx={chartCardSx(mode)}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                🎵 Genre Diversity
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                How diverse your listening habits are over time
              </Typography>
              <GenreDiversityChart artists={artists} />
            </Paper>
          </MotionBox>
        </Grid>
        <Grid item xs={12} md={6}>
          <MotionBox variants={itemVariants}>
            <Paper sx={chartCardSx(mode)}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                🤝 Artist Loyalty
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Which artists stick around in your top list
              </Typography>
              <ArtistLoyaltyDashboard artists={artists} />
            </Paper>
          </MotionBox>
        </Grid>

        {/* Row 3: Track Duration + Explicit Content */}
        <Grid item xs={12} md={6}>
          <MotionBox variants={itemVariants}>
            <Paper sx={chartCardSx(mode)}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                ⏱️ Track Duration Trends
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Are you gravitating toward shorter or longer songs?
              </Typography>
              <TrackDurationChart tracks={tracks} />
            </Paper>
          </MotionBox>
        </Grid>
        <Grid item xs={12} md={6}>
          <MotionBox variants={itemVariants}>
            <Paper sx={chartCardSx(mode)}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                🔞 Explicit Content Ratio
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The balance between explicit and clean tracks
              </Typography>
              <ExplicitContentChart tracks={tracks} />
            </Paper>
          </MotionBox>
        </Grid>

        {/* Row 4: New vs Catalog + Album Concentration */}
        <Grid item xs={12} md={6}>
          <MotionBox variants={itemVariants}>
            <Paper sx={chartCardSx(mode)}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                📅 New vs. Catalog
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Balancing fresh releases with familiar classics
              </Typography>
              <NewVsCatalogChart />
            </Paper>
          </MotionBox>
        </Grid>
        <Grid item xs={12} md={6}>
          <MotionBox variants={itemVariants}>
            <Paper sx={chartCardSx(mode)}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                💿 Album Concentration
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Which albums dominate your listening across all time?
              </Typography>
              <AlbumConcentrationChart />
            </Paper>
          </MotionBox>
        </Grid>

        {/* Row 5: Artist Dominance + Entity Churn */}
        <Grid item xs={12} md={6}>
          <MotionBox variants={itemVariants}>
            <Paper sx={chartCardSx(mode)}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                👑 Artist Dominance
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                How many spots in your top tracks did each artist claim?
              </Typography>
              <ArtistDominanceChart />
            </Paper>
          </MotionBox>
        </Grid>
        <Grid item xs={12} md={6}>
          <MotionBox variants={itemVariants}>
            <Paper sx={chartCardSx(mode)}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                🔄 Entity Churn
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Monthly entries, exits, and retention rates
              </Typography>
              <EntityChurnChart />
            </Paper>
          </MotionBox>
        </Grid>

        {/* Row 6: Audio Profile Radar (full width) */}
        <Grid item xs={12}>
          <MotionBox variants={itemVariants}>
            <Paper sx={chartCardSx(mode)}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                🎧 Audio Profile
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                What your music taste sounds like — danceability, energy, mood, and more
              </Typography>
              <AudioProfileRadar tracks={tracks} spotifyApi={spotifyApi} />
            </Paper>
          </MotionBox>
        </Grid>

        {/* Row 7: Mood Timeline + Music DNA / Personality */}
        <Grid item xs={12} md={6}>
          <MotionBox variants={itemVariants}>
            <Paper sx={chartCardSx(mode)}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                😊 Mood Timeline
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Your tracks mapped on a happiness × energy grid
              </Typography>
              <MoodTimeline tracks={tracks} spotifyApi={spotifyApi} />
            </Paper>
          </MotionBox>
        </Grid>
        <Grid item xs={12} md={6}>
          <MotionBox variants={itemVariants}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <MusicDNACard
                tracks={tracks}
                artists={artists}
                albums={albums}
                spotifyApi={spotifyApi}
              />
              <ListeningPersonality
                tracks={tracks}
                artists={artists}
                spotifyApi={spotifyApi}
                compact
              />
            </Box>
          </MotionBox>
        </Grid>
      </Grid>
    </MotionBox>
  );
};

export default AnalyticsDashboard;
