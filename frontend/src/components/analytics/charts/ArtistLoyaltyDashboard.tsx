import React, { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart
} from './TypedRecharts';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { GroupedRecords, Artist } from '../../../types';
import { computeLoyaltyStats, computeEntityChurn } from '../../../utils/analyticsUtils';
import { getChartStyles, getTooltipStyle } from '../../../utils/chartTheme';

interface Props {
  artists: GroupedRecords<Artist>[];
}

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

const ArtistLoyaltyDashboard: React.FC<Props> = ({ artists }) => {
  const theme = useTheme();
  const mode = theme.palette.mode as 'light' | 'dark';
  const styles = getChartStyles(mode);
  const tooltipStyles = getTooltipStyle(mode);
  const [view, setView] = useState<'leaderboard' | 'churn'>('leaderboard');

  const loyaltyData = useMemo(() => computeLoyaltyStats(artists), [artists]);
  const churnData = useMemo(
    () => computeEntityChurn(artists, 'artist_id'),
    [artists]
  );

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: 'leaderboard' | 'churn' | null,
  ) => {
    if (newView !== null) setView(newView);
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup value={view} exclusive onChange={handleViewChange} size="small">
          <ToggleButton value="leaderboard">Leaderboard</ToggleButton>
          <ToggleButton value="churn">Churn</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === 'leaderboard' ? (
        <TableContainer sx={{ maxHeight: 350 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Artist</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Months</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Streak</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Avg Rank</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loyaltyData.slice(0, 15).map((entry, index) => (
                <TableRow
                  key={entry.id}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: 'rgba(29, 185, 84, 0.05)' },
                  }}
                >
                  <TableCell>
                    {index < 3 ? (
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          backgroundColor: MEDAL_COLORS[index],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000',
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {index + 1}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {index + 1}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {entry.image && (
                        <Avatar
                          src={entry.image}
                          sx={{ width: 28, height: 28 }}
                          alt={entry.name}
                        />
                      )}
                      <Typography variant="body2" sx={{ fontWeight: index < 3 ? 600 : 400 }}>
                        {entry.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={entry.monthsAppeared}
                      size="small"
                      color="primary"
                      variant={index < 3 ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600, fontSize: 12 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{entry.longestStreak}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color={entry.avgStanding <= 3 ? 'primary' : 'text.secondary'}>
                      {entry.avgStanding}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={churnData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={styles.gridColor} />
            <XAxis
              dataKey="month"
              tick={{ fill: styles.axisColor, fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fill: styles.axisColor, fontSize: 12 }} />
            <Tooltip
              contentStyle={tooltipStyles.contentStyle}
              labelStyle={tooltipStyles.labelStyle}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="entered" fill="#1DB954" name="Entered" radius={[4, 4, 0, 0]} />
            <Bar dataKey="exited" fill="#E91E63" name="Exited" radius={[4, 4, 0, 0]} />
            <Line
              type="monotone"
              dataKey="retained"
              stroke="#FF9800"
              strokeWidth={2}
              name="Retained"
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default ArtistLoyaltyDashboard;
