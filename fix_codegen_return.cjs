const fs = require('fs');
const path = 'src/lang/codegen_js.ts';
let code = fs.readFileSync(path, 'utf-8');

const breaks = `      'class __ContinueSignal {}',`;
const breaksNew = `      'class __ContinueSignal {}',
      'class __ReturnSignal { constructor(v) { this.value = v; } }',`;
code = code.replace(breaks, breaksNew);

const evalBreak = `      case 'e_continue':
        return '(function(){ throw new __ContinueSignal(); })()';`;
const evalBreakNew = `      case 'e_continue':
        return '(function(){ throw new __ContinueSignal(); })()';
      case 'e_return': {
        const valStr = expr.value ? this.generateExpr(expr.value) : 'null';
        return \`(function(){ throw new __ReturnSignal(\${valStr}); })()\`;
      }`;
code = code.replace(evalBreak, evalBreakNew);

const s_func = `function \${safeName}(\${paramNames.join(', ')}) {
\${bodyStr}
\${this.indent()}}`;
const s_func_new = `function \${safeName}(\${paramNames.join(', ')}) {
\${this.indent()}  try {
\${bodyStr}
\${this.indent()}  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
\${this.indent()}}`;
code = code.replace(s_func, s_func_new);

const e_lambda = `(\${paramNames.join(', ')}) => {
\${bodyCode}
\${this.indent()}}`;
const e_lambda_new = `(\${paramNames.join(', ')}) => {
\${this.indent()}  try {
\${bodyCode}
\${this.indent()}  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
\${this.indent()}}`;
code = code.replace(e_lambda, e_lambda_new);

fs.writeFileSync(path, code);
