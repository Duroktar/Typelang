const fs = require('fs');
const path = 'src/lang/evaluator.ts';
let code = fs.readFileSync(path, 'utf-8');

const blockRegex = /for \(const s of expr\.statements\) \{\s*lastVal = this\.evalStatement\(s, localEnv\);\s*\}/;
if (blockRegex.test(code)) {
  code = code.replace(blockRegex, 'for (const s of expr.statements) {\n          lastVal = this.evalStatement(s, localEnv);\n          if (lastVal instanceof BreakSignal || lastVal instanceof ContinueSignal) {\n            return lastVal;\n          }\n        }');
  fs.writeFileSync(path, code);
  console.log("Replaced using regex");
} else {
  console.log("Regex failed too");
}
