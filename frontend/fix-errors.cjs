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

  // Fix theme colors
  content = content.replace(/theme\.palette\.background\.paperVariant/g, 'theme.palette.action.hover');
  content = content.replace(/theme\.colors\.outlineVariant/g, 'theme.palette.divider');
  content = content.replace(/theme\.colors\.onSurfaceVariant/g, 'theme.palette.text.secondary');

  // Fix variants
  content = content.replace(/variant="labelLarge"/g, 'variant="subtitle1"');
  content = content.replace(/variant="headlineSmall"/g, 'variant="h5"');
  content = content.replace(/variant="titleLarge"/g, 'variant="h6"');

  // Fix Button props
  content = content.replace(/mode="contained"/g, 'variant="contained"');
  content = content.replace(/<Button([^>]*) onPress=/g, '<Button$1 onClick=');
  content = content.replace(/<IconButton([^>]*) onPress=/g, '<IconButton$1 onClick=');

  // Fix Box component="img"
  content = content.replace(/source=\{\{ uri: ([^}]+) \}\}/g, 'src={$1}');

  // Fix TypographyInput -> TextField
  content = content.replace(/<TypographyInput\.Icon/g, '<InputAdornment position="start"');
  content = content.replace(/<\/TypographyInput\.Icon>/g, '</InputAdornment>');
  content = content.replace(/TypographyInput/g, 'TextField');

  // Fix HelperText -> FormHelperText
  content = content.replace(/<HelperText/g, '<FormHelperText');
  content = content.replace(/<\/HelperText>/g, '</FormHelperText>');

  // Fix Avatar.Icon
  content = content.replace(/<Avatar\.Icon([^>]+)\/>/g, '<Avatar$1></Avatar>');

  // Fix multiple sx attributes
  content = content.replace(/sx=\{\{ overflowY: "auto" \}\} sx=\{styles\.scrollContent\}/g, 'sx={{ overflowY: "auto", ...styles.scrollContent }}');

  // Replace style= with sx= on Box, CardContent
  content = content.replace(/<Box([^>]*) style=\{([^}]+)\}/g, '<Box$1 sx={$2}');
  content = content.replace(/<CardContent([^>]*) style=\{([^}]+)\}/g, '<CardContent$1 sx={$2}');
  content = content.replace(/<IconButton([^>]*) style=\{([^}]+)\}/g, '<IconButton$1 sx={$2}');

  // Make sure CardContent, CardHeader, IconButton are imported if used
  if (content.includes('CardContent') && !content.includes('CardContent,')) {
    content = content.replace(/import \{([^}]+)\} from '@mui\/material';/, (match, p1) => {
      let imports = p1.split(',').map(s => s.trim());
      if (!imports.includes('CardContent')) imports.push('CardContent');
      return `import { ${imports.join(', ')} } from '@mui/material';`;
    });
  }
  if (content.includes('CardHeader') && !content.includes('CardHeader,')) {
    content = content.replace(/import \{([^}]+)\} from '@mui\/material';/, (match, p1) => {
      let imports = p1.split(',').map(s => s.trim());
      if (!imports.includes('CardHeader')) imports.push('CardHeader');
      return `import { ${imports.join(', ')} } from '@mui/material';`;
    });
  }
  if (content.includes('IconButton') && !content.includes('IconButton,')) {
    content = content.replace(/import \{([^}]+)\} from '@mui\/material';/, (match, p1) => {
      let imports = p1.split(',').map(s => s.trim());
      if (!imports.includes('IconButton')) imports.push('IconButton');
      return `import { ${imports.join(', ')} } from '@mui/material';`;
    });
  }
  if (content.includes('FormHelperText') && !content.includes('FormHelperText,')) {
    content = content.replace(/import \{([^}]+)\} from '@mui\/material';/, (match, p1) => {
      let imports = p1.split(',').map(s => s.trim());
      if (!imports.includes('FormHelperText')) imports.push('FormHelperText');
      return `import { ${imports.join(', ')} } from '@mui/material';`;
    });
  }

  // Also replace icon="..." with children
  content = content.replace(/<IconButton([^>]*) icon="([^"]+)"([^>]*)\/>/g, '<IconButton$1$3><Icon>$2</Icon></IconButton>');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
};

const files = getFiles(path.join(__dirname, 'src'));
files.forEach(fixFile);
console.log('Fixed remaining errors');
