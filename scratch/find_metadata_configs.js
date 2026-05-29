const fs = require('fs');
const path = require('path');

function walk(dir, results = []) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.next' || file === '.git') return;
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      walk(fullPath, results);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../src/app'));
files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('const metadata') || content.includes('let metadata') || content.includes('export const metadata') || content.includes('generateMetadata')) {
      console.log('=== MATCH ===');
      console.log('File:', file);
      // Print the lines containing metadata
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('metadata') || line.includes('title') || line.includes('default') || line.includes('template')) {
          console.log(`${idx + 1}: ${line.trim()}`);
        }
      });
    }
  } catch (err) {}
});
