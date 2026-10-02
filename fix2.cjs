const fs = require('fs');
let code = fs.readFileSync('src/lang/examples.ts', 'utf8');

// Find the first occurrence of "27. Cryptography Lab"
const searchStr = 'id: "27"';
const firstIdx = code.indexOf(searchStr);

if (firstIdx !== -1) {
  const startIdx = code.lastIndexOf('{', firstIdx);
  const commaIdx = code.lastIndexOf(',', startIdx);
  code = code.substring(0, commaIdx) + '\n];\n';
  fs.writeFileSync('src/lang/examples.ts', code);
  console.log('Fixed examples!');
}
