const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load .env
dotenv.config();

console.log('--- process.env ---');
console.log('NEXT_PUBLIC_SITE_NAME:', process.env.NEXT_PUBLIC_SITE_NAME);
console.log('NEXT_PUBLIC_SITE_NAME hex:', Buffer.from(process.env.NEXT_PUBLIC_SITE_NAME || '').toString('hex'));

console.log('\n--- env file content ---');
const envPath = path.join(__dirname, '../.env');
const content = fs.readFileSync(envPath, 'utf8');
console.log(content.split('\n').filter(line => line.includes('SITE_NAME') || line.includes('SITE_URL')));
console.log('File encoding check (first 100 bytes):', Buffer.from(content.substring(0, 100)).toString('hex'));
