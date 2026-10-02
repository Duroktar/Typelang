const fs = require('fs');
const path = 'src/lang/codegen_js.ts';
let code = fs.readFileSync(path, 'utf-8');

const forOld = '    return `${this.indent()}for (${initStr}; ${condStr}; ${updateStr}) ${bodyCode}`;';
const forNew = '    return `${this.indent()}try { for (${initStr}; ${condStr}; ${updateStr}) { try ${bodyCode} catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }`;';

if (code.includes(forOld)) {
  code = code.replace(forOld, forNew);
  fs.writeFileSync(path, code);
  console.log("Replaced for return");
} else {
  console.log("Could not find for return");
}
