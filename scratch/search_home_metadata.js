const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\m4ah4\\Desktop\\اردن وظائف\\jojobs-os\\src\\app\\page.tsx', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('metadata') || line.includes('title') || line.includes('default') || line.includes('template')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
