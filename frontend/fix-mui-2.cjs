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

const fixMUI2 = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Typography variants
  content = content.replace(/variant="bodyMedium"/g, 'variant="body1"');
  content = content.replace(/variant="bodyLarge"/g, 'variant="body1"');
  content = content.replace(/variant="bodySmall"/g, 'variant="body2"');
  content = content.replace(/variant="headlineMedium"/g, 'variant="h5"');
  content = content.replace(/variant="headlineLarge"/g, 'variant="h4"');
  content = content.replace(/variant="displaySmall"/g, 'variant="h4"');
  content = content.replace(/variant="titleMedium"/g, 'variant="h6"');
  content = content.replace(/variant="labelSmall"/g, 'variant="caption"');

  // React Native array styles `style={[a, b]}` -> `sx={{ ...a, ...b }}`
  content = content.replace(/style=\{\[styles\.([^,]+),\s*\{([^}]+)\}\]\}/g, 'sx={{ ...styles.$1, $2 }}');

  // `contentContainerStyle={styles.scrollContent}` -> `sx={styles.scrollContent}`
  content = content.replace(/contentContainerStyle=/g, 'sx=');

  // TextInput -> TextField
  if (content.includes('<TextInput')) {
    content = content.replace(/<TextInput/g, '<TextField');
    content = content.replace(/<\/TextInput>/g, '</TextField>');
    content = content.replace(/TextInput\.Icon/g, 'IconButton');
    content = content.replace(/import {([^}]+)} from '@mui\/material';/, (match, p1) => {
      let imports = p1.split(',').map(s => s.trim()).filter(s => s !== 'TextInput');
      imports.push('TextField');
      imports = [...new Set(imports)];
      return `import { ${imports.join(', ')} } from '@mui/material';`;
    });
  }

  // KeyboardAvoidingView
  content = content.replace(/<KeyboardAvoidingView[^>]*>/g, '<Box sx={{ flex: 1 }}>');
  content = content.replace(/<\/KeyboardAvoidingView>/g, '</Box>');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
};

const files = getFiles(path.join(__dirname, 'src'));
files.forEach(fixMUI2);
console.log('Fixed Typography variants and other RN remnants');
