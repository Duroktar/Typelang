const fs = require('fs');
const path = 'src/lang/codegen_js.ts';
let code = fs.readFileSync(path, 'utf-8');

code = code.replace(
  'return `${this.indent()}function ${safeName}(${paramNames.join(\', \')}) {\\n${bodyStr}\\n${this.indent()}}`;',
  'return `${this.indent()}function ${safeName}(${paramNames.join(\', \')}) {\\n${this.indent()}  try {\\n${bodyStr}\\n${this.indent()}  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }\\n${this.indent()}}`;'
);

code = code.replace(
  'return `(${paramNames.join(\', \')}) => {\\n${bodyCode}\\n${this.indent()}}`;',
  'return `(${paramNames.join(\', \')}) => {\\n${this.indent()}  try {\\n${bodyCode}\\n${this.indent()}  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }\\n${this.indent()}}`;'
);

fs.writeFileSync(path, code);
