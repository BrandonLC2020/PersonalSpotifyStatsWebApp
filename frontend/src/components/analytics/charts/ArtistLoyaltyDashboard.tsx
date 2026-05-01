import React, { useMemo, useState } from 'react';
import { Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ToggleButton } from "@mui/material";
import { useTheme, Typography, ToggleButtonGroup, Table, Avatar } from '@mui/material';
import { 
  VictoryChart, 
  VictoryBar, 
  VictoryLine, 
  VictoryAxis, 
  VictoryStack, 
  VictoryVoronoiContainer, 
  VictoryTooltip 
} from 'victory';
import { GroupedRecords, Artist } from '../../../types';
import { computeLoyaltyStats, computeEntityChurn } from '../../../utils/analyticsUtils';

const width = window.innerWidth;
const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

interface Props {
  artists: GroupedRecords<Artist>[];
}

const ArtistLoyaltyDashboard: React.FC<Props> = ({ artists }) => {
  const theme = useTheme();
  const [view, setView] = useState<'leaderboard' | 'churn'>('leaderboard');

  const loyaltyData = useMemo(() => computeLoyaltyStats(artists), [artists]);
  const churnData = useMemo(
    () => computeEntityChurn(artists, 'artist_id').map(m => ({
        ...m,
        label: `${String(m.month).split(' ')[0]}` // Short month
    })),
    [artists]
  );

  return (
    <Box sx={styles.container}>
      <ToggleButtonGroup exclusive
        value={view}
        sx={styles.toggle} onChange={(event, value) => { if (value) setView(value as 'leaderboard' | 'churn'); }}
        >
<ToggleButton value='leaderboard'>Leaderboard</ToggleButton>
<ToggleButton value='churn'>Churn</ToggleButton>
</ToggleButtonGroup>
     

      {view === 'leaderboard' ? (
        <Box sx={{ overflowY: "auto", display: "flex", flexDirection: "row" }}>
          <TableContainer component={Paper}>
          <Table sx={{ width: width * 1.2, tableLayout: "fixed" }}>
            <TableHead>
              <TableCell style={styles.rankCol}>#</TableCell>
              <TableCell style={styles.artistCol}>Artist</TableCell>
              <TableCell align="right">Months</TableCell>
              <TableCell align="right">Streak</TableCell>
              <TableCell align="right">Avg Rank</TableCell>
            </TableHead>

            {loyaltyData.slice(0, 10).map((entry, index) => (
              <TableRow key={entry.id}>
                <TableCell style={styles.rankCol}>
                  {index < 3 ? (
                    <Avatar sx={{ width: 24, height: 24, bgcolor: MEDAL_COLORS[index], color: "#000", fontSize: 12, fontWeight: "bold" }}>{index + 1}</Avatar>
                  ) : (
                    <Typography variant="body2">{index + 1}</Typography>
                  )}
                </TableCell>
                <TableCell style={styles.artistCol}>
                    <Box sx={styles.artistCell}>
                        {entry.image && <Box component="img" src={entry.image} sx={styles.avatar} />}
                        <Typography variant="body2" noWrap>{entry.name}</Typography>
                    </Box>
                </TableCell>
                <TableCell align="right">{entry.monthsAppeared}</TableCell>
                <TableCell align="right">{entry.longestStreak}</TableCell>
                <TableCell align="right">{entry.avgStanding}</TableCell>
              </TableRow>
            ))}
          </Table></TableContainer>
        </Box>
      ) : churnData.length === 0 ? (
        <Box sx={styles.centered}>
          <Typography variant="body1">No historical data available</Typography>
        </Box>
      ) : (
        <Box>
          <Box sx={styles.chartWrapper}>
            <VictoryChart
              width={width - 32}
              height={300}
              padding={{ top: 20, bottom: 40, left: 40, right: 40 }}
              containerComponent={
                <VictoryVoronoiContainer
                  labels={({ datum }: { datum: any }) => {
                    const y = typeof datum.y === 'number' ? datum.y : 0;
                    if (datum.childName === 'Retained') {
                      return `Retained: ${y}`;
                    }
                    return `${datum.childName}: ${y}`;
                  }}
                  labelComponent={
                    <VictoryTooltip
                      flyoutStyle={{
                        fill: theme.palette.action.hover,
                        stroke: theme.palette.divider,
                      }}
                      style={{ fill: theme.palette.text.secondary, fontSize: 10 }}
                    />
                  }
                />
              }
            >
              <VictoryAxis
                fixLabelOverlap
                style={{
                  axis: { stroke: theme.palette.divider },
                  tickLabels: { fill: theme.palette.text.secondary, fontSize: 8 },
                  grid: { stroke: 'transparent' }
                }}
              />
              <VictoryAxis
                dependentAxis
                domain={[0, Math.max(0, ...churnData.map(d => (Number(d.entered) || 0) + (Number(d.exited) || 0) + (Number(d.retained) || 0)), 1)]}
                style={{
                  axis: { stroke: theme.palette.divider },
                  tickLabels: { fill: theme.palette.text.secondary, fontSize: 8 },
                  grid: { stroke: theme.palette.divider, strokeDasharray: "4, 4" }
                }}
              />
              
              <VictoryStack colorScale={["#1DB954", "#E91E63"]}>
                <VictoryBar
                  name="Entered"
                  data={churnData}
                  x="label"
                  y="entered"
                  animate={{ duration: 500 }}
                />
                <VictoryBar
                  name="Exited"
                  data={churnData}
                  x="label"
                  y="exited"
                  animate={{ duration: 500 }}
                />
              </VictoryStack>

              <VictoryLine
                name="Retained"
                data={churnData}
                x="label"
                y="retained"
                style={{
                  data: {
                    stroke: "#FF9800",
                    strokeWidth: 3
                  }
                }}
                animate={{ duration: 500 }}
              />
            </VictoryChart>
          </Box>

          <Box sx={styles.legendContainer}>
            <Box sx={styles.legendItem}>
              <Box sx={{ ...styles.colorDot,  backgroundColor: "#1DB954"  }} />
              <Typography variant="caption">Entered</Typography>
            </Box>
            <Box sx={styles.legendItem}>
              <Box sx={{ ...styles.colorDot,  backgroundColor: "#E91E63"  }} />
              <Typography variant="caption">Exited</Typography>
            </Box>
            <Box sx={styles.legendItem}>
              <Box sx={{ ...styles.colorDot,  backgroundColor: "#FF9800"  }} />
              <Typography variant="caption">Retained</Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

const styles = {
  container: {
    padding: 8,
  },
  centered: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggle: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  rankCol: {
    flex: 0.1,
  },
  artistCol: {
    flex: 0.4,
  },
  artistCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  }
};

export default ArtistLoyaltyDashboard;

