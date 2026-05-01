import React, { useMemo, useState } from 'react';
import { Box, ToggleButton } from "@mui/material";
import { useTheme, Typography, CircularProgress, ToggleButtonGroup } from '@mui/material';
import { 
  VictoryChart, 
  VictoryBar, 
  VictoryAxis, 
  VictoryGroup, 
  VictoryVoronoiContainer, 
  VictoryTooltip 
} from 'victory';
import { useEntityChurn } from '../../../hooks/useAnalyticsApi';

const width = window.innerWidth;

const EntityChurnChart: React.FC = () => {
  const theme = useTheme();
  const [type, setType] = useState<'tracks' | 'artists' | 'albums'>('artists');
  const { data, loading, error } = useEntityChurn(type);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(m => ({
      month: `${String(m.month).padStart(2, '0')}/${String(m.year).slice(-2)}`,
      Entered: Number(m.entered?.length) || 0,
      Exited: Number(m.exited?.length) || 0,
      Retained: Number(m.retained_count) || 0,
    }));
  }, [data]);

  if (loading) return <Box sx={styles.centered}><CircularProgress /></Box>;
  if (error) return <Box sx={styles.centered}><Typography style={{ color: theme.palette.error.main }}>{error}</Typography></Box>;
  if (!data || data.length === 0) return null;

  return (
    <Box sx={styles.container}>
       <ToggleButtonGroup exclusive
        value={type}
        sx={styles.toggle} onChange={(event, value) => { if (value) setType(value as 'tracks' | 'artists' | 'albums'); }}
        >
<ToggleButton value='tracks'>Tracks</ToggleButton>
<ToggleButton value='artists'>Artists</ToggleButton>
<ToggleButton value='albums'>Albums</ToggleButton>
</ToggleButtonGroup>
     

      <Box sx={styles.chartWrapper}>
        <VictoryChart
          width={width - 32}
          height={350}
          padding={{ top: 20, bottom: 40, left: 40, right: 40 }}
          containerComponent={
            <VictoryVoronoiContainer
              labels={({ datum }: { datum: any }) => {
                const y = typeof datum.y === 'number' ? datum.y : 0;
                const name = datum.childName || 'Count';
                return `${name}: ${y}`;
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
            domain={[0, Math.max(...chartData.map(d => Math.max(Number(d.Entered) || 0, Number(d.Exited) || 0, Number(d.Retained) || 0)), 1)]}
            style={{
              axis: { stroke: theme.palette.divider },
              tickLabels: { fill: theme.palette.text.secondary, fontSize: 8 },
              grid: { stroke: theme.palette.divider, strokeDasharray: "4, 4" }
            }}
          />
          
          <VictoryGroup offset={10} colorScale={["#1DB954", "#E91E63", "#42A5F5"]}>
            <VictoryBar
              name="Entered"
              data={chartData}
              x="month"
              y="Entered"
              animate={{ duration: 500 }}
            />
            <VictoryBar
              name="Exited"
              data={chartData}
              x="month"
              y="Exited"
              animate={{ duration: 500 }}
            />
            <VictoryBar
              name="Retained"
              data={chartData}
              x="month"
              y="Retained"
              animate={{ duration: 500 }}
            />
          </VictoryGroup>
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
          <Box sx={{ ...styles.colorDot,  backgroundColor: "#42A5F5"  }} />
          <Typography variant="caption">Retained</Typography>
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
  toggle: {
    marginBottom: 16,
    width: '100%',
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

export default EntityChurnChart;

