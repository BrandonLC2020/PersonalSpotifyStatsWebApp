import React, { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from './TypedRecharts';
import { ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { GroupedRecords, Track, Artist } from '../../../types';
import { computeRankingTimeline } from '../../../utils/analyticsUtils';
import { CHART_COLORS, getChartStyles, getTooltipStyle } from '../../../utils/chartTheme';

interface Props {
  tracks: GroupedRecords<Track>[];
  artists: GroupedRecords<Artist>[];
}

const RankingMovementChart: React.FC<Props> = ({ tracks, artists }) => {
  const theme = useTheme();
  const mode = theme.palette.mode as 'light' | 'dark';
  const styles = getChartStyles(mode);
  const tooltipStyles = getTooltipStyle(mode);
  const [entityType, setEntityType] = useState<'tracks' | 'artists'>('tracks');
  const [highlightedEntity, setHighlightedEntity] = useState<string | null>(null);

  const { data, entities } = useMemo(() => {
    const source = entityType === 'tracks' ? tracks : artists;
    const idField = entityType === 'tracks' ? 'track_id' : 'artist_id';
    return computeRankingTimeline(source as any, 10, idField);
  }, [tracks, artists, entityType]);

  const handleEntityTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newType: 'tracks' | 'artists' | null,
  ) => {
    if (newType !== null) {
      setEntityType(newType);
      setHighlightedEntity(null);
    }
  };

  if (data.length === 0) {
    return <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>No ranking data available</Box>;
  }

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
        <ToggleButtonGroup
          value={entityType}
          exclusive
          onChange={handleEntityTypeChange}
          size="small"
        >
          <ToggleButton value="tracks">Tracks</ToggleButton>
          <ToggleButton value="artists">Artists</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={styles.gridColor} />
          <XAxis
            dataKey="month"
            tick={{ fill: styles.axisColor, fontSize: 11 }}
            tickLine={{ stroke: styles.axisColor }}
            axisLine={{ stroke: styles.gridColor }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            reversed
            domain={[1, 10]}
            tick={{ fill: styles.axisColor, fontSize: 12 }}
            tickLine={{ stroke: styles.axisColor }}
            axisLine={{ stroke: styles.gridColor }}
            label={{
              value: 'Ranking',
              angle: -90,
              position: 'insideLeft',
              fill: styles.axisColor,
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={tooltipStyles.contentStyle}
            labelStyle={tooltipStyles.labelStyle}
            itemStyle={tooltipStyles.itemStyle}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', cursor: 'pointer' }}
            onClick={(e: any) => {
              setHighlightedEntity(
                highlightedEntity === e.value ? null : e.value
              );
            }}
          />
          {entities.slice(0, 10).map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={highlightedEntity === null || highlightedEntity === name ? 2.5 : 0.5}
              opacity={highlightedEntity === null || highlightedEntity === name ? 1 : 0.15}
              dot={{ r: 3, strokeWidth: 1 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default RankingMovementChart;
