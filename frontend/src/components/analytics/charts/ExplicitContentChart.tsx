import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme, Typography } from '@mui/material';
import { 
  VictoryChart, 
  VictoryBar, 
  VictoryLine, 
  VictoryAxis, 
  VictoryStack, 
  VictoryVoronoiContainer, 
  VictoryTooltip 
} from 'victory';
import { GroupedRecords, Track } from '../../../types';
import { computeExplicitRatio } from '../../../utils/analyticsUtils';

const width = window.innerWidth;

interface Props {
  tracks: GroupedRecords<Track>[];
}

const ExplicitContentChart: React.FC<Props> = ({ tracks }) => {
  const theme = useTheme();

  const data = useMemo(() => {
    const rawData = computeExplicitRatio(tracks);
    return rawData.map(d => ({
      ...d,
      explicit: Number(d.explicit) || 0,
      clean: Number(d.clean) || 0,
      explicitPercent: Number(d.explicitPercent) || 0,
    })) as (Record<string, unknown> & { month: string; explicit: number; clean: number; explicitPercent: number })[];
  }, [tracks]);

  if (data.length === 0) {
    return (
      <Box sx={styles.centered}>
        <Typography variant="body1">No explicit data available</Typography>
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
              labels={({ datum }: { datum: any }) => {
                const y = typeof datum.y === 'number' ? datum.y : 0;
                if (datum.childName === 'ExplicitPercent') {
                  return `${y}% Explicit`;
                }
                return `${datum.childName}: ${y} tracks`;
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
            domain={[0, Math.max(...data.map(d => (Number(d.explicit) || 0) + (Number(d.clean) || 0)), 100)]}
            style={{
              axis: { stroke: theme.palette.divider },
              tickLabels: { fill: theme.palette.text.secondary, fontSize: 8 },
              grid: { stroke: theme.palette.divider, strokeDasharray: "4, 4" }
            }}
          />
          
          <VictoryStack colorScale={["#E91E63", "#42A5F5"]}>
            <VictoryBar
              name="Explicit"
              data={data}
              x="month"
              y="explicit"
              animate={{ duration: 500 }}
            />
            <VictoryBar
              name="Clean"
              data={data}
              x="month"
              y="clean"
              animate={{ duration: 500 }}
            />
          </VictoryStack>

          <VictoryLine
            name="ExplicitPercent"
            data={data}
            x="month"
            y="explicitPercent"
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
          <Box sx={{ ...styles.colorDot,  backgroundColor: "#E91E63"  }} />
          <Typography variant="caption">Explicit</Typography>
        </Box>
        <Box sx={styles.legendItem}>
          <Box sx={{ ...styles.colorDot,  backgroundColor: "#42A5F5"  }} />
          <Typography variant="caption">Clean</Typography>
        </Box>
        <Box sx={styles.legendItem}>
          <Box sx={{ ...styles.colorDot,  backgroundColor: "#FF9800"  }} />
          <Typography variant="caption">Explicit %</Typography>
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

export default ExplicitContentChart;

