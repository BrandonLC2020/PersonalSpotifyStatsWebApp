const fs = require('fs');
const path = require('path');
const glob = require('glob'); // npm install glob

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace victory-native
  content = content.replace(/'victory-native'/g, "'victory'");

  // Replace react-native-paper imports with @mui/material
  content = content.replace(/import\s+{([^}]+)}\s+from\s+'react-native-paper';/g, (match, p1) => {
    let imports = p1.split(',').map(s => s.trim());
    let muiImports = [];
    imports.forEach(imp => {
      if (imp === 'Text') muiImports.push('Typography');
      else if (imp === 'ActivityIndicator') muiImports.push('CircularProgress');
      else if (imp === 'Card' || imp === 'Title' || imp === 'Paragraph' || imp === 'List' || imp === 'Avatar' || imp === 'Chip' || imp === 'Button' || imp === 'IconButton' || imp === 'Surface' || imp === 'SegmentedButtons') muiImports.push(imp); // Keep these or map
      // Remove useTheme, we can use useTheme from @mui/material
      else if (imp === 'useTheme') muiImports.push('useTheme');
    });
    return `import { ${muiImports.join(', ')} } from '@mui/material';`;
  });

  // Replace react-native imports
  content = content.replace(/import\s+{([^}]+)}\s+from\s+'react-native';/g, (match, p1) => {
    return `import { Box } from '@mui/material';`;
  });

  // Basic tag replacements
  content = content.replace(/<View/g, '<Box');
  content = content.replace(/<\/View>/g, '</Box>');
  
  content = content.replace(/<Text/g, '<Typography');
  content = content.replace(/<\/Text>/g, '</Typography>');
  
  content = content.replace(/<ScrollView/g, '<Box sx={{ overflowY: "auto" }}');
  content = content.replace(/<\/ScrollView>/g, '</Box>');
  
  content = content.replace(/<TouchableOpacity/g, '<Box sx={{ cursor: "pointer" }} onClick={() => {}}');
  content = content.replace(/<\/TouchableOpacity>/g, '</Box>');

  content = content.replace(/<ActivityIndicator/g, '<CircularProgress');

  content = content.replace(/StyleSheet\.create/g, '');

  content = content.replace(/style=\{styles\./g, 'sx={styles.');

  content = content.replace(/<Image/g, '<Box component="img"');

  // React Navigation
  content = content.replace(/import\s+{([^}]+)}\s+from\s+'@react-navigation[^']+';/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
};

const globOptions = {
  cwd: path.join(__dirname, 'src'),
  nodir: true,
  absolute: true,
};

glob('**/*.tsx', globOptions, (err, files) => {
  if (err) throw err;
  files.forEach(replaceInFile);
  console.log('Replaced tags in TSX files');
});
