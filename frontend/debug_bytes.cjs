const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/views/Dashboard.vue');

// Read as Buffer to see raw bytes
const buffer = fs.readFileSync(filePath);
const content = buffer.toString('utf8');

// Find corrupted patterns and their positions
const patterns = [
  '绾',
  '浜',
  '鍓',
  '浠',
  '瓒',
  '涓',
  '灏',
  '琛',
  '浼',
  '澶',
  '杩'
];

console.log('Searching for potentially corrupted characters...');
for (const char of patterns) {
  let pos = content.indexOf(char);
  if (pos !== -1) {
    console.log(`Found '${char}' at position ${pos}`);
  }
}

// Let's look at specific byte sequences around line 229
const lineStart = content.split('\n').slice(0, 229).join('\n').length;
console.log('\nBytes around line 229:');
for (let i = lineStart; i < lineStart + 100 && i < buffer.length; i++) {
  process.stdout.write(buffer[i].toString(16).padStart(2, '0') + ' ');
}
console.log('\n');
