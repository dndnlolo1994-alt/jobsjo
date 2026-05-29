const fs = require('fs');
const path = require('path');

function walk(dir, results = []) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.next' || file === '.git' || file === 'dist') return;
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      walk(fullPath, results);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.md')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '..'));
console.log(`Found ${files.length} source files to search.`);

const searchTerms = ['?????', '؟؟؟؟؟'];
const matches = [];

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    searchTerms.forEach(term => {
      if (content.includes(term)) {
        matches.push({ file, term });
      }
    });
  } catch (err) {
    // Ignore read errors
  }
});

console.log('Matches:', matches);
