import fs from 'fs';
let content = fs.readFileSync('src/lang/evaluator.ts', 'utf8');
content = content.replace(/vars: new Map\(env\.vars\)/g, "vars: new Map()");
content = content.replace(/modules: new Map\(env\.modules\)/g, "modules: new Map()");
fs.writeFileSync('src/lang/evaluator.ts', content);
