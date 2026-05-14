const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/views/Dashboard.vue');
let content = fs.readFileSync(filePath, 'utf8');

// Fix line 229: name: `${item.grade}绾`,
content = content.replace(/name: `\$\{item\.grade\}./, 'name: `${item.grade}级`,');

// Fix line 236: formatter: '{b}: {c}浜?({d}%)'
content = content.replace(/formatter: '\{b\}: \{c\}./, "formatter: '{b}: {c}人 ({d}%)'");

// Fix line 253: formatter: '{b}: {c}浜?
content = content.replace(/label: \{[^}]*formatter: '\{b\}: \{c\}./, "label: { show: true, formatter: '{b}: {c}人'");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed Dashboard.vue encoding issues!');
