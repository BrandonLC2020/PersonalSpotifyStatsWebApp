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

const fixMUI = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  content = content.replace(/theme\.colors\.error/g, "theme.palette.error.main");
  content = content.replace(/theme\.colors\.background/g, "theme.palette.background.default");
  content = content.replace(/theme\.colors\.surface/g, "theme.palette.background.paper");
  content = content.replace(/theme\.colors\.primary/g, "theme.palette.primary.main");
  content = content.replace(/theme\.colors\.secondary/g, "theme.palette.secondary.main");

  content = content.replace(/<Title/g, '<Typography variant="h5"');
  content = content.replace(/<\/Title>/g, '</Typography>');

  content = content.replace(/<Paragraph/g, '<Typography variant="body1"');
  content = content.replace(/<\/Paragraph>/g, '</Typography>');

  content = content.replace(/<Card\.Content/g, '<CardContent');
  content = content.replace(/<\/Card\.Content>/g, '</CardContent>');

  content = content.replace(/<Card\.Title/g, '<CardHeader');
  content = content.replace(/<\/Card\.Title>/g, '</CardHeader>');

  content = content.replace(/<List\.Section/g, '<Box');
  content = content.replace(/<\/List\.Section>/g, '</Box>');

  content = content.replace(/<List\.Subheader/g, '<Typography variant="h6"');
  content = content.replace(/<\/List\.Subheader>/g, '</Typography>');

  // Add CardHeader, CardContent to MUI imports if Card is imported
  if (content.includes('Card') && !content.includes('CardContent')) {
    content = content.replace(/import {([^}]+)} from '@mui\/material';/, (match, p1) => {
      let imports = p1.split(',').map(s => s.trim());
      imports.push('CardContent');
      imports.push('CardHeader');
      imports = [...new Set(imports)];
      return `import { ${imports.join(', ')} } from '@mui/material';`;
    });
  }

  // Remove KeyboardAvoidingView, Platform from react-native imports if they exist
  // We already removed react-native imports, but there might be leftovers
  content = content.replace(/<KeyboardAvoidingView[^>]*>/g, '<Box sx={{ flex: 1 }}>');
  content = content.replace(/<\/KeyboardAvoidingView>/g, '</Box>');

  // Dimensions.get('window') -> window.innerWidth / window.innerHeight
  content = content.replace(/const { width } = Dimensions\.get\('window'\);/g, 'const width = window.innerWidth;');
  content = content.replace(/const { width, height } = Dimensions\.get\('window'\);/g, 'const width = window.innerWidth; const height = window.innerHeight;');

  // SegmentedButtons to ToggleButtonGroup
  content = content.replace(/<SegmentedButtons/g, '<ToggleButtonGroup exclusive');
  content = content.replace(/<\/SegmentedButtons>/g, '</ToggleButtonGroup>');
  // Note: the items of SegmentedButtons are passed as `buttons={[{value: 'v', label: 'L'}]}`
  // We can't trivially rewrite this with regex, we'll leave manual fixes for that or just fix the import
  
  if (content.includes('SegmentedButtons')) {
    content = content.replace(/SegmentedButtons/g, 'ToggleButtonGroup');
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
};

const files = getFiles(path.join(__dirname, 'src'));
files.forEach(fixMUI);
console.log('Fixed more MUI components');
