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
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../src'));
const query = 'SITE_NAME';

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(query)) {
      console.log('Match found in:', file);
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes(query)) {
          console.log(`  Line ${idx+1}: ${line.trim()}`);
        }
      });
    }
  } catch (err) {}
});
