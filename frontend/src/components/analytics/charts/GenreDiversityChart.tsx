import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme, Typography } from '@mui/material';
import { 
  VictoryChart, 
  VictoryArea, 
  VictoryLine, 
  VictoryAxis, 
  VictoryStack, 
  VictoryVoronoiContainer, 
  VictoryTooltip,
} from 'victory';
import { GroupedRecords, Artist } from '../../../types';
import { computeGenreTimeline, computeGenreDiversity } from '../../../utils/analyticsUtils';
import { CHART_COLORS } from '../../../utils/chartTheme';

const width = window.innerWidth;

interface Props {
  artists: GroupedRecords<Artist>[];
}

const GenreDiversityChart: React.FC<Props> = ({ artists }) => {
  const theme = useTheme();

  const { data, genres } = useMemo(() => computeGenreTimeline(artists), [artists]);
  const diversityData = useMemo(() => computeGenreDiversity(artists), [artists]);
  const topGenres = useMemo(() => genres.slice(0, 5), [genres]);

  const mergedData = useMemo(() =>
    data.map((point, i) => ({
      ...point,
      diversity: Number(diversityData[i]?.diversity) || 0,
    })) as (Record<string, any> & { month: string; diversity: number })[],
    [data, diversityData]
  );

  if (mergedData.length === 0) {
    return (
      <Box sx={styles.centered}>
        <Typography variant="body1">No genre data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Box sx={styles.chartWrapper}>
        <VictoryChart
          width={width - 32}
          height={300}
          padding={{ top: 20, bottom: 40, left: 40, right: 40 }}
          containerComponent={
            <VictoryVoronoiContainer
              labels={({ datum }) => {
                const y = typeof datum.y === 'number' ? datum.y : 0;
                if (datum.childName === 'Diversity') {
                  return `Diversity: ${y.toFixed(1)}`;
                }
                const genreName = datum.childName || 'Unknown';
                return `${genreName}: ${y} tracks`;
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
            domain={[0, Math.max(0, ...mergedData.map(d => genres.reduce((sum, g) => sum + (Number(d[g]) || 0), 0)), 1)]}
            style={{
              axis: { stroke: theme.palette.divider },
              tickLabels: { fill: theme.palette.text.secondary, fontSize: 8 },
              grid: { stroke: theme.palette.divider, strokeDasharray: "4, 4" }
            }}
          />
          
          <VictoryStack>
            {topGenres.map((genre, i) => (
              <VictoryArea
                key={genre}
                name={genre}
                data={mergedData}
                x="month"
                y={genre}
                style={{
                  data: {
                    fill: CHART_COLORS[i % CHART_COLORS.length],
                    fillOpacity: 0.6,
                    stroke: CHART_COLORS[i % CHART_COLORS.length],
                    strokeWidth: 1
                  }
                }}
                animate={{ duration: 500 }}
              />
            ))}
          </VictoryStack>

          <VictoryLine
            name="Diversity"
            data={mergedData}
            x="month"
            y="diversity"
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
        {topGenres.map((genre, i) => (
            <Box key={genre} sx={styles.legendItem}>
                <Box sx={{ ...styles.colorDot,  backgroundColor: CHART_COLORS[i % CHART_COLORS.length]  }} />
                <Typography variant="caption" noWrap>{genre}</Typography>
            </Box>
        ))}
         <Box sx={styles.legendItem}>
          <Box sx={{ ...styles.colorDot,  backgroundColor: "#FF9800"  }} />
          <Typography variant="caption">Diversity</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const styles = {
  container: {
    padding: 8,
    alignItems: 'center'
  },
  centered: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 4,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  }
};

export default GenreDiversityChart;

