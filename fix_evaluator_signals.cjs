const fs = require('fs');
const path = 'src/lang/evaluator.ts';
let code = fs.readFileSync(path, 'utf-8');

// replace e_break and e_continue to throw
code = code.replace(
  /case 'e_break': {\s*return new BreakSignal\(\);\s*}/,
  "case 'e_break': {\n        throw new BreakSignal();\n      }"
);
code = code.replace(
  /case 'e_continue': {\s*return new ContinueSignal\(\);\s*}/,
  "case 'e_continue': {\n        throw new ContinueSignal();\n      }"
);

// fix for loop to use try/catch
const forLoopRegex = /while \(expr\.cond \? Boolean\(this\.evalExpr\(expr\.cond, localEnv\)\) : true\) \{\s*iterations\+\+;\s*if \(iterations > maxLoopIterations\) \{\s*throw new Error\(\`Runtime Error: Loop exceeded maximum iteration count \(\\\$\{[^}]+\}\)\. Infinite loop detected\.\`\);\s*\}\s*const res = this\.evalExpr\(expr\.body, localEnv\);\s*if \(res instanceof BreakSignal\) break;\s*\/\/ if res instanceof ContinueSignal, it falls through to update naturally\s*if \(expr\.update\) \{\s*this\.evalExpr\(expr\.update, localEnv\);\s*\}\s*\}/;

const forLoopNew = `while (expr.cond ? Boolean(this.evalExpr(expr.cond, localEnv)) : true) {
          iterations++;
          if (iterations > maxLoopIterations) {
            throw new Error(\`Runtime Error: Loop exceeded maximum iteration count (\${maxLoopIterations}). Infinite loop detected.\`);
          }
          
          try {
            this.evalExpr(expr.body, localEnv);
          } catch (e) {
            if (e instanceof BreakSignal) {
              break;
            } else if (e instanceof ContinueSignal) {
              // continue naturally falls through to update
            } else {
              throw e;
            }
          }
          
          if (expr.update) {
            this.evalExpr(expr.update, localEnv);
          }
        }`;

code = code.replace(forLoopRegex, forLoopNew);

// fix while loop to use try/catch
const whileLoopRegex = /while \(Boolean\(this\.evalExpr\(expr\.cond, localEnv\)\)\) \{\s*iterations\+\+;\s*if \(iterations > maxLoopIterations\) \{\s*throw new Error\(\`Runtime Error: Loop exceeded maximum iteration count \(\\\$\{[^}]+\}\)\. Infinite loop detected\.\`\);\s*\}\s*const res = this\.evalExpr\(expr\.body, localEnv\);\s*if \(res instanceof BreakSignal\) break;\s*if \(res instanceof ContinueSignal\) continue;\s*\}/;

const whileLoopNew = `while (Boolean(this.evalExpr(expr.cond, localEnv))) {
          iterations++;
          if (iterations > maxLoopIterations) {
            throw new Error(\`Runtime Error: Loop exceeded maximum iteration count (\${maxLoopIterations}). Infinite loop detected.\`);
          }
          try {
            this.evalExpr(expr.body, localEnv);
          } catch(e) {
            if (e instanceof BreakSignal) {
              break;
            } else if (e instanceof ContinueSignal) {
              continue;
            } else {
              throw e;
            }
          }
        }`;

code = code.replace(whileLoopRegex, whileLoopNew);

// remove the instanceof checks in e_block
const blockRegex = /lastVal = this\.evalStatement\(s, localEnv\);\s*if \(lastVal instanceof BreakSignal \|\| lastVal instanceof ContinueSignal\) \{\s*return lastVal;\s*\}/g;
code = code.replace(blockRegex, 'lastVal = this.evalStatement(s, localEnv);');

fs.writeFileSync(path, code);
