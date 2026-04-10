import React, { useMemo, useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Tooltip as MuiTooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { GroupedRecords, Track, Artist } from '../../../types';
import { computePopularityHeatmap } from '../../../utils/analyticsUtils';
import { getMonthLabel } from '../../../utils/chartTheme';

interface Props {
  tracks: GroupedRecords<Track>[];
  artists: GroupedRecords<Artist>[];
}

const PopularityHeatmap: React.FC<Props> = ({ tracks, artists }) => {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const [entityType, setEntityType] = useState<'tracks' | 'artists'>('tracks');

  const source = entityType === 'tracks' ? tracks : artists;

  const { cells, months, maxStanding } = useMemo(() => {
    const cells = computePopularityHeatmap(source as any, 10);
    const months = Array.from(new Set(cells.map(c => c.month)));
    return { cells, months, maxStanding: 10 };
  }, [source]);

  const getColor = (popularity: number): string => {
    // Gradient from cool purple (low) → green (mid) → yellow (high)
    if (popularity === 0) return mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
    const normalized = popularity / 100;
    if (normalized < 0.33) {
      return `rgba(156, 39, 176, ${0.2 + normalized * 1.5})`;
    } else if (normalized < 0.66) {
      return `rgba(29, 185, 84, ${0.3 + (normalized - 0.33) * 1.5})`;
    } else {
      return `rgba(255, 193, 7, ${0.4 + (normalized - 0.66) * 1.5})`;
    }
  };

  const handleEntityTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: 'tracks' | 'artists' | null,
  ) => {
    if (newType !== null) setEntityType(newType);
  };

  if (months.length === 0) {
    return <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>No heatmap data available</Box>;
  }

  const cellSize = Math.min(50, Math.max(28, 600 / months.length));

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup value={entityType} exclusive onChange={handleEntityTypeChange} size="small">
          <ToggleButton value="tracks">Tracks</ToggleButton>
          <ToggleButton value="artists">Artists</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ overflowX: 'auto', pb: 1 }}>
        <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: '2px' }}>
          {/* Header row */}
          <Box sx={{ display: 'flex', gap: '2px', ml: `${cellSize}px` }}>
            {months.map(month => (
              <Box
                key={month}
                sx={{
                  width: cellSize,
                  textAlign: 'center',
                  fontSize: 9,
                  color: 'text.secondary',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'bottom left',
                  height: 40,
                  whiteSpace: 'nowrap',
                }}
              >
                {month}
              </Box>
            ))}
          </Box>

          {/* Data rows */}
          {Array.from({ length: maxStanding }, (_, i) => i + 1).map(standing => (
            <Box key={standing} sx={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <Box sx={{ width: cellSize, textAlign: 'right', pr: 1, fontSize: 11, color: 'text.secondary' }}>
                #{standing}
              </Box>
              {months.map(month => {
                const cell = cells.find(c => c.month === month && c.standing === standing);
                return (
                  <MuiTooltip
                    key={`${month}-${standing}`}
                    title={cell
                      ? `${cell.name} — Popularity: ${cell.popularity}`
                      : 'No data'
                    }
                    arrow
                    placement="top"
                  >
                    <Box
                      sx={{
                        width: cellSize,
                        height: cellSize * 0.7,
                        backgroundColor: cell ? getColor(cell.popularity) : (mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        border: '1px solid',
                        borderColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        '&:hover': {
                          transform: 'scale(1.15)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          zIndex: 10,
                        },
                      }}
                    />
                  </MuiTooltip>
                );
              })}
            </Box>
          ))}
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2, gap: 1 }}>
          <Typography variant="caption" color="text.secondary">Low</Typography>
          <Box sx={{ display: 'flex', gap: '1px' }}>
            {[10, 25, 40, 55, 70, 85, 100].map(v => (
              <Box key={v} sx={{ width: 20, height: 12, backgroundColor: getColor(v), borderRadius: '2px' }} />
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">High Popularity</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PopularityHeatmap;
