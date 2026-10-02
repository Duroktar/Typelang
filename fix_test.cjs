const fs = require('fs');
const path = 'src/lang/tests.ts';
let code = fs.readFileSync(path, 'utf-8');

code = code.replace(/i = 10/g, 'break');
code = code.replace(/j = 10;\s*i = 10/g, 'break');
// wait, double break is not possible without labels in JS, but let's see what I replaced
// "valid = false; j = 10; i = 10" -> "valid = false; break"
code = code.replace(/valid = false; j = 10; i = 10/g, 'valid = false; break');
code = code.replace(/v = 10/g, 'break');

fs.writeFileSync(path, code);
