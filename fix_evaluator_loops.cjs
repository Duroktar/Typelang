const fs = require('fs');
const path = 'src/lang/evaluator.ts';
let code = fs.readFileSync(path, 'utf-8');

const forOld = `        while (expr.cond ? Boolean(this.evalExpr(expr.cond, localEnv)) : true) {
          iterations++;
          if (iterations > maxLoopIterations) {
            throw new Error(\`Runtime Error: Loop exceeded maximum iteration count (\${maxLoopIterations}). Infinite loop detected.\`);
          }
          const res = this.evalExpr(expr.body, localEnv);
          if (res instanceof BreakSignal) break;
          // if res instanceof ContinueSignal, it falls through to update naturally
          
          if (expr.update) {
            this.evalExpr(expr.update, localEnv);
          }
        }`;

const forNew = `        while (expr.cond ? Boolean(this.evalExpr(expr.cond, localEnv)) : true) {
          iterations++;
          if (iterations > maxLoopIterations) {
            throw new Error(\`Runtime Error: Loop exceeded maximum iteration count (\${maxLoopIterations}). Infinite loop detected.\`);
          }
          try {
            this.evalExpr(expr.body, localEnv);
          } catch(e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) {
              // continue falls through to update
            } else {
              throw e;
            }
          }
          if (expr.update) {
            this.evalExpr(expr.update, localEnv);
          }
        }`;

if (code.includes(forOld)) {
  code = code.replace(forOld, forNew);
  console.log("Replaced e_for");
}

const whileOld = `        while (Boolean(this.evalExpr(expr.cond, localEnv))) {
          iterations++;
          if (iterations > maxLoopIterations) {
            throw new Error(\`Runtime Error: Loop exceeded maximum iteration count (\${maxLoopIterations}). Infinite loop detected.\`);
          }
          const res = this.evalExpr(expr.body, localEnv);
          if (res instanceof BreakSignal) break;
          if (res instanceof ContinueSignal) continue;
        }`;

const whileNew = `        while (Boolean(this.evalExpr(expr.cond, localEnv))) {
          iterations++;
          if (iterations > maxLoopIterations) {
            throw new Error(\`Runtime Error: Loop exceeded maximum iteration count (\${maxLoopIterations}). Infinite loop detected.\`);
          }
          try {
            this.evalExpr(expr.body, localEnv);
          } catch(e) {
            if (e instanceof BreakSignal) break;
            if (e instanceof ContinueSignal) continue;
            throw e;
          }
        }`;

if (code.includes(whileOld)) {
  code = code.replace(whileOld, whileNew);
  console.log("Replaced e_while");
}

fs.writeFileSync(path, code);
