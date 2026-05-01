import React, { useMemo, useState } from 'react';
import { Box, ToggleButton } from "@mui/material";
import { useTheme, Typography, ToggleButtonGroup, Tooltip } from '@mui/material';
import { GroupedRecords, Track, Artist } from '../../../types';
import { computePopularityHeatmap } from '../../../utils/analyticsUtils';

const width = window.innerWidth;

interface Props {
  tracks: GroupedRecords<Track>[];
  artists: GroupedRecords<Artist>[];
}

const PopularityHeatmap: React.FC<Props> = ({ tracks, artists }) => {
  const theme = useTheme();
  const [entityType, setEntityType] = useState<'tracks' | 'artists'>('tracks');

  const source = entityType === 'tracks' ? tracks : artists;

  const { cells, months, maxStanding } = useMemo(() => {
    const cells = computePopularityHeatmap(source as any, 10);
    const months = Array.from(new Set(cells.map(c => c.month)));
    return { cells, months, maxStanding: 10 };
  }, [source]);

  const getColor = (popularity: number): string => {
    if (popularity === 0) return theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const normalized = popularity / 100;
    if (normalized < 0.33) {
      return `rgba(156, 39, 176, ${0.2 + normalized * 1.5})`;
    } else if (normalized < 0.66) {
      return `rgba(29, 185, 84, ${0.3 + (normalized - 0.33) * 1.5})`;
    } else {
      return `rgba(255, 193, 7, ${0.4 + (normalized - 0.66) * 1.5})`;
    }
  };

  if (months.length === 0) {
    return (
      <Box sx={styles.centered}>
        <Typography variant="body1">No heatmap data available</Typography>
      </Box>
    );
  }

  const cellSize = 36;

  return (
    <Box sx={styles.container}>
      <ToggleButtonGroup exclusive
        value={entityType}
        sx={styles.toggle} onChange={(event, value) => { if (value) setEntityType(value as 'tracks' | 'artists'); }}
        >
<ToggleButton value='tracks'>Tracks</ToggleButton>
<ToggleButton value='artists'>Artists</ToggleButton>
</ToggleButtonGroup>
     

      <Box sx={{ overflowY: "auto", display: "flex", flexDirection: "row" }}>
        <Box sx={styles.heatmapContainer}>
          {/* Header row labels */}
          <Box sx={{ ...styles.row,  marginLeft: 40  }}>
            {months.map(month => (
              <Box key={month} sx={{ ...styles.headerCell,  width: cellSize  }}>
                <Typography style={styles.headerText} noWrap>{month.split(' ')[0]}</Typography>
              </Box>
            ))}
          </Box>

          {/* Data rows */}
          {Array.from({ length: maxStanding }, (_, i) => i + 1).map(standing => (
            <Box key={standing} sx={styles.row}>
              <Box sx={styles.standingLabel}>
                <Typography variant="caption">#{standing}</Typography>
              </Box>
              {months.map(month => {
                const cell = cells.find(c => c.month === month && c.standing === standing);
                return (
                  <Tooltip key={`${month}-${standing}`} title={cell ? `${cell.name} (${cell.popularity})` : 'No data'}>
                    <Box
                        sx={[
                            styles.cell,
                            {
                                width: cellSize - 4,
                                height: cellSize - 4,
                                backgroundColor: cell ? getColor(cell.popularity) : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)')
                            }
                        ]}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={styles.legend}>
        <Typography variant="caption">Low</Typography>
        <Box sx={styles.legendGradient}>
          {[10, 40, 70, 100].map(v => (
            <Box key={v} sx={{ ...styles.legendStep,  backgroundColor: getColor(v)  }} />
          ))}
        </Box>
        <Typography variant="caption">High</Typography>
      </Box>
    </Box>
  );
};

const styles = {
  container: {
    padding: 8,
  },
  toggle: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  centered: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heatmapContainer: {
    paddingRight: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  standingLabel: {
    width: 40,
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  headerCell: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 8,
    opacity: 0.6,
  },
  cell: {
    borderRadius: 4,
    margin: 1,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  legendGradient: {
    flexDirection: 'row',
    gap: 2,
  },
  legendStep: {
    width: 20,
    height: 10,
    borderRadius: 2,
  },
};

export default PopularityHeatmap;
