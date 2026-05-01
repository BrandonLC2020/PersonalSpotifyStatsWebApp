const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (name.endsWith('.tsx') || name.endsWith('.ts')) {
        files.push(name);
      }
    }
  }
  return files;
}

const fixFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Fix ToggleButtonGroup dangling styles and closing
  content = content.replace(/<\/ToggleButtonGroup>\s*style=\{([^}]+)\}/g, 'style={$1}>\n</ToggleButtonGroup>');

  // Replace style= with sx= on ToggleButtonGroup
  content = content.replace(/<ToggleButtonGroup([^>]*)style=\{([^}]+)\}([^>]*)>/g, '<ToggleButtonGroup$1sx={$2}$3>');

  // Fix onChange parameter on ToggleButtonGroup
  // value => setType(value as 'tracks')  -- needs event
  content = content.replace(/onChange=\{value => set([A-Za-z0-9_]+)\(value as ([^)]+)\)\}/g, "onChange={(event, value) => { if (value) set$1(value as $2); }}");
  content = content.replace(/onChange=\{value => set([A-Za-z0-9_]+)\(value as '([A-Za-z0-9_]+)' \| '([A-Za-z0-9_]+)'\)\}/g, "onChange={(event, value) => { if (value) set$1(value as '$2' | '$3'); }}");
  content = content.replace(/onChange=\{value => set([A-Za-z0-9_]+)\(value as '([A-Za-z0-9_]+)' \| '([A-Za-z0-9_]+)' \| '([A-Za-z0-9_]+)'\)\}/g, "onChange={(event, value) => { if (value) set$1(value as '$2' | '$3' | '$4'); }}");

  // Fix ArtistLoyaltyDashboard Table syntax error
  if (content.includes('<TableContainer component={Paper}><Table')) {
    content = content.replace(/<TableContainer component=\{Paper\}><Table sx=\{([^}]+)\}><\/TableContainer>/g, '<TableContainer component={Paper}><Table sx={$1}>');
  }

  // Fix TimeMachine / YearInReview imports
  if (filePath.includes('TimeMachine') || filePath.includes('YearInReview')) {
    content = content.replace(/<ListItemAvatar><Avatar([^>]*) \/><\/ListItemAvatar>/g, '<ListItemAvatar><Avatar$1 /></ListItemAvatar>');
  }

  if (content.includes('Avatar.Image')) {
    content = content.replace(/<Avatar\.Image([^>]*) \/>/g, '<Avatar$1 />');
  }

  // TimeMachine ListItem etc fixes
  content = content.replace(/<List\.Item/g, '<ListItem');
  content = content.replace(/<\/List\.Item>/g, '</ListItem>');
  content = content.replace(/<List\.Icon/g, '<ListItemIcon');
  content = content.replace(/<\/List\.Icon>/g, '</ListItemIcon>');
  content = content.replace(/<List\.Image/g, '<ListItemAvatar');
  content = content.replace(/<\/List\.Image>/g, '</ListItemAvatar>');

  // Fix TimeMachine left props
  content = content.replace(/left=\{props =>/g, ''); // we can't use left=... in ListItem, just put it inside
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
};

const files = getFiles(path.join(__dirname, 'src'));
files.forEach(fixFile);
console.log('Fixed more syntax issues');
