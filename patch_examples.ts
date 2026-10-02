import fs from 'fs';
let content = fs.readFileSync('src/lang/examples.ts', 'utf8');
content = content.replace(/for \(let i = /g, "for (let mut i = ");
content = content.replace(/for \(let j = /g, "for (let mut j = ");
fs.writeFileSync('src/lang/examples.ts', content);
