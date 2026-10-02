const fs = require('fs');
const path = 'src/lang/evaluator.ts';
let code = fs.readFileSync(path, 'utf-8');

code = code.replace(
  'export class ContinueSignal {}', 
  'export class ContinueSignal {}\nexport class ReturnSignal { constructor(public value: any) {} }'
);
fs.writeFileSync(path, code);
