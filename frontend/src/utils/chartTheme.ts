/**
 * Chart theming utilities for Recharts components.
 * Provides color palettes and styling that align with the MUI theme.
 */

// Primary palette — Spotify green + complementary hues
export const CHART_COLORS = [
  '#1DB954', // Spotify Green
  '#1ED760', // Lighter Green
  '#E91E63', // Pink
  '#FF9800', // Orange
  '#2196F3', // Blue
  '#9C27B0', // Purple
  '#00BCD4', // Cyan
  '#FF5722', // Deep Orange
  '#4CAF50', // Green
  '#FFC107', // Amber
  '#673AB7', // Deep Purple
  '#009688', // Teal
];

// Warm palette for explicit/energy-related charts
export const WARM_COLORS = ['#FF5252', '#FF7043', '#FFB74D', '#FFF176'];

// Cool palette for clean/calm-related charts
export const COOL_COLORS = ['#42A5F5', '#26C6DA', '#66BB6A', '#AB47BC'];

// Mood quadrant colors
export const MOOD_COLORS = {
  happyEnergetic: '#1DB954',
  intenseMoody: '#E91E63',
  happyChill: '#42A5F5',
  sadMellow: '#9C27B0',
};

// Gradient definitions for area charts
export const GRADIENTS = {
  green: { start: '#1DB954', end: 'rgba(29, 185, 84, 0.05)' },
  blue: { start: '#2196F3', end: 'rgba(33, 150, 243, 0.05)' },
  pink: { start: '#E91E63', end: 'rgba(233, 30, 99, 0.05)' },
  purple: { start: '#9C27B0', end: 'rgba(156, 39, 176, 0.05)' },
  orange: { start: '#FF9800', end: 'rgba(255, 152, 0, 0.05)' },
};

// Chart axis/grid styles by mode
export const getChartStyles = (mode: 'light' | 'dark') => ({
  axisColor: mode === 'dark' ? '#b3b3b3' : '#535353',
  gridColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  tooltipBg: mode === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
  tooltipBorder: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  tooltipText: mode === 'dark' ? '#ffffff' : '#191414',
  labelColor: mode === 'dark' ? '#b3b3b3' : '#535353',
  cursorColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
});

// Recharts tooltip style builder
export const getTooltipStyle = (mode: 'light' | 'dark') => {
  const styles = getChartStyles(mode);
  return {
    contentStyle: {
      backgroundColor: styles.tooltipBg,
      border: `1px solid ${styles.tooltipBorder}`,
      borderRadius: '8px',
      padding: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      backdropFilter: 'blur(10px)',
      color: styles.tooltipText,
      fontSize: '13px',
    },
    labelStyle: {
      color: styles.tooltipText,
      fontWeight: 600,
      marginBottom: '4px',
    },
    itemStyle: {
      color: styles.tooltipText,
      fontSize: '12px',
    },
  };
};

// Glassmorphism card style for chart wrappers
export const chartCardSx = (mode: 'light' | 'dark') => ({
  p: 3,
  borderRadius: 3,
  backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(10px)',
  border: '1px solid',
  borderColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
  boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    borderColor: mode === 'dark' ? 'rgba(29, 185, 84, 0.3)' : 'rgba(29, 185, 84, 0.2)',
    boxShadow: '0 8px 40px rgba(29, 185, 84, 0.1)',
  },
});

/**
 * Format duration from ms to m:ss
 */
export const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Get month label from month number
 */
export const getMonthLabel = (month: number, year: number): string => {
  const date = new Date(year, month - 1);
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

/**
 * Get short month label
 */
export const getShortMonthLabel = (month: number): string => {
  const date = new Date(2000, month - 1);
  return date.toLocaleString('en-US', { month: 'short' });
};
