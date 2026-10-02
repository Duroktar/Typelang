const fs = require('fs');
let code = fs.readFileSync('src/lang/examples.ts', 'utf8');

// Find all occurrences of '27. Cryptography Lab'
const occurrences = code.split('27. Cryptography Lab');
if (occurrences.length > 2) {
  // It means it was added more than once. We can just take everything up to the first occurrence
  // Wait, let's just find the first `id: "27"` and remove it and everything after, then re-append.
  
  const idx = code.indexOf('id: "27"');
  // go back to the opening brace of this object
  const startIdx = code.lastIndexOf('{', idx);
  // and go back one more to remove the comma
  const commaIdx = code.lastIndexOf(',', startIdx);
  
  code = code.substring(0, commaIdx) + '\n];\n';
  fs.writeFileSync('src/lang/examples.ts', code);
  console.log('Cleaned up EXAMPLES');
}
