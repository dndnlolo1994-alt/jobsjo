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

const files = walk(path.join(__dirname, '../src/app'));
const queries = ['نساء', 'للنساء'];

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    queries.forEach(query => {
      if (content.includes(query)) {
        console.log(`Match for "${query}" in:`, file);
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes(query)) {
            console.log(`  Line ${idx+1}: ${line.trim()}`);
          }
        });
      }
    });
  } catch (err) {}
});
