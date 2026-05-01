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

  // multiple sx
  content = content.replace(/sx=\{\{ overflowY: "auto" \}\}\s*sx=\{styles\.container\}/g, 'sx={{ overflowY: "auto", ...styles.container }}');
  content = content.replace(/sx=\{\{ overflowY: "auto" \}\}\s*sx=\{styles\.scrollContent\}/g, 'sx={{ overflowY: "auto", ...styles.scrollContent }}');

  // Typography
  content = content.replace(/numberOfLines=\{1\}/g, 'noWrap');
  content = content.replace(/style=\{styles\.subtitle\}/g, 'sx={styles.subtitle}');
  content = content.replace(/textAlign: 'center'/g, 'textAlign: "center"'); // Just in case, some TS errors on textAlign string vs variant

  // ToggleButtonGroup
  content = content.replace(/onValueChange=/g, 'onChange=');

  // Box horizontal bounces
  content = content.replace(/<Box sx=\{\{ overflowY: "auto" \}\} horizontal bounces=\{false\}>/g, '<Box sx={{ overflowY: "auto", display: "flex", flexDirection: "row" }}>');

  // Avatar.Text -> Avatar
  content = content.replace(/<Avatar\.Text/g, '<Avatar');
  content = content.replace(/<\/Avatar\.Text>/g, '</Avatar>');

  // theme.dark -> theme.palette.mode === 'dark'
  content = content.replace(/theme\.dark \?/g, "theme.palette.mode === 'dark' ?");

  // List in TimeMachine
  content = content.replace(/<List\.Item/g, '<ListItem');
  content = content.replace(/<\/List\.Item>/g, '</ListItem>');
  content = content.replace(/<List\.Image([^>]+)\/>/g, '<ListItemAvatar><Avatar$1/></ListItemAvatar>');
  content = content.replace(/<List\.Icon([^>]+)\/>/g, '<ListItemIcon><Icon>music</Icon></ListItemIcon>');
  
  // Chip children -> label
  content = content.replace(/<Chip[^>]*>\s*\{([^}]+)\}\s*<\/Chip>/g, '<Chip label={$1} />');

  // FormHelperText
  content = content.replace(/type="error" visible=\{([^}]+)\}/g, 'error={$1}');

  // Button loading, contentStyle
  content = content.replace(/loading=\{[^}]+\}/g, ''); // just remove loading for now
  content = content.replace(/contentStyle=\{[^}]+\}/g, ''); // remove contentStyle

  // Fix imports
  if (content.includes('import { Typography, TextInput, Button, Card, HelperText, useTheme } from \'@mui/material\';')) {
    content = content.replace('TextInput, ', 'TextField, InputAdornment, ');
    content = content.replace('HelperText, ', 'FormHelperText, ');
  }

  // Remove Title, Paragraph from imports
  content = content.replace(/, Title, Paragraph/g, '');
  content = content.replace(/Title, Paragraph, /g, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
};

const files = getFiles(path.join(__dirname, 'src'));
files.forEach(fixFile);
console.log('Fixed more errors');
