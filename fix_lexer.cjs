const fs = require('fs');
const path = 'src/lang/lexer.ts';
let code = fs.readFileSync(path, 'utf-8');

code = code.replace("'if',", "'if',\n  'return',");

fs.writeFileSync(path, code);
