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

const fixStylesClose = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace }); right before export default
  content = content.replace(/(\s*)\}\);(\s*export default)/g, '$1};$2');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
};

const files = getFiles(path.join(__dirname, 'src/components'));
files.forEach(fixStylesClose);
console.log('Fixed trailing }); in components TSX files');
