import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, useTheme } from '@mui/material';
import {
  Star as StarIcon,
  NewReleases as NewReleasesIcon,
  PersonAdd as PersonAddIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';
import { Insight } from '../../types';
import { chartCardSx } from '../../utils/chartTheme';

interface InsightCardProps {
  insight: Insight;
}

const iconMap: Record<string, React.ReactElement> = {
  star: <StarIcon />,
  new_releases: <NewReleasesIcon />,
  person_add: <PersonAddIcon />,
  history: <HistoryIcon />,
  trending_up: <TrendingUpIcon />,
  emoji_events: <EmojiEventsIcon />,
};

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const theme = useTheme();
  const icon = iconMap[insight.icon] || <EmojiEventsIcon />;

  return (
    <Card sx={chartCardSx(theme.palette.mode)}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
            {icon}
          </Avatar>
          <Typography variant="h6" component="div">
            {insight.title}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {insight.description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default InsightCard;
