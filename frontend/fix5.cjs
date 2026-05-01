const fs = require('fs');
const path = require('path');

const files = [
  'frontend/src/components/analytics/charts/ArtistLoyaltyDashboard.tsx',
  'frontend/src/components/analytics/charts/EntityChurnChart.tsx',
  'frontend/src/components/analytics/charts/PopularityHeatmap.tsx',
  'frontend/src/components/analytics/charts/RankingMovementChart.tsx',
  'frontend/src/components/analytics/pages/TimeMachine.tsx'
];

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix ToggleButtonGroup broken tags
  content = content.replace(/style=\{styles\.toggle\}>\n<\/ToggleButtonGroup>/g, '</ToggleButtonGroup>');
  content = content.replace(/<ToggleButtonGroup([^>]+)>/g, (match, p1) => {
      // if it contains 'exclusive' and 'value='
      if (p1.includes('exclusive') && p1.includes('value=')) {
          return `<ToggleButtonGroup${p1} sx={styles.toggle}>`;
      }
      return match;
  });

  // Fix TableContainer in ArtistLoyaltyDashboard
  if (filePath.includes('ArtistLoyaltyDashboard')) {
      content = content.replace(/<Table style=\{\{ width: width \* 1\.2 \}\}>/, '<TableContainer component={Paper}>\n          <Table sx={{ width: width * 1.2, tableLayout: "fixed" }}>');
  }

  // TimeMachine fixes
  if (filePath.includes('TimeMachine')) {
      content = content.replace(/albumArt\[track\.track_id\] \?/g, 'albumArt[track.track_id] !== undefined ?');
      content = content.replace(/artist\.images\?\.\[0\]\?\.url \?/g, 'artist.images?.[0]?.url !== undefined ?');
      content = content.replace(/<ListItemAvatar><Avatar \{\.\.\.props\} src=\{albumArt\[track\.track_id\]\} style=\{styles\.trackImage\} \/><\/ListItemAvatar> :/g, '<ListItemAvatar><Avatar src={albumArt[track.track_id]} sx={styles.trackImage} /></ListItemAvatar> :');
      content = content.replace(/<ListItemIcon><Icon>music<\/Icon><\/ListItemIcon>/g, '<ListItemIcon>music</ListItemIcon>');
      content = content.replace(/<Avatar \{\.\.\.props\} size=\{32\} src=\{artist\.images\[0\]\.url\} \/> :/g, '<Avatar src={artist.images[0].url} sx={{ width: 32, height: 32 }} /> :');
  }

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Fixed syntax again');
