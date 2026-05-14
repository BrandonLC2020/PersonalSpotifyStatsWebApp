import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, CircularProgress, Container } from '@mui/material';
import api from '../../../utils/api';
import { Insight } from '../../../types';
import InsightCard from '../InsightCard';
import GenreEvolutionChart from '../charts/GenreEvolutionChart';

const AdvancedInsights: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await api.get<Insight[]>('/api/analytics/automated_insights');
        setInsights(response.data);
      } catch (err) {
        setError('Failed to fetch automated insights');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Advanced Analytics & Insights
      </Typography>
      
      <Box sx={{ mb: 6 }}>
        <GenreEvolutionChart />
      </Box>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Automated Insights
      </Typography>
      
      {insights.length === 0 ? (
        <Typography variant="body1" align="center" color="text.secondary">
          No insights discovered yet. Keep listening!
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {insights.map((insight, index) => (
            <Grid item xs={12} md={6} key={`${insight.type}-${index}`}>
              <InsightCard insight={insight} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AdvancedInsights;
