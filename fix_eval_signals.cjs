const fs = require('fs');
const path = 'src/lang/evaluator.ts';
let code = fs.readFileSync(path, 'utf-8');

if (!code.includes('class BreakSignal')) {
  const signalCode = `
export class BreakSignal { _isBreak = true; }
export class ContinueSignal { _isContinue = true; }
`;
  code = code.replace(/export class Evaluator \{/, signalCode + '\nexport class Evaluator {');
}

// Fix block
const blockOld = `      case 'e_block': {
        const localEnv: RuntimeEnv = {
          vars: new Map(),
          modules: new Map(),
          exports: new Set(),
          parent: env
        };

        let lastVal = null;
        for (const s of expr.statements) {
          lastVal = this.evalStatement(s, localEnv);
        }
        return lastVal;
      }`;

const blockNew = `      case 'e_block': {
        const localEnv: RuntimeEnv = {
          vars: new Map(),
          modules: new Map(),
          exports: new Set(),
          parent: env
        };

        let lastVal = null;
        for (const s of expr.statements) {
          lastVal = this.evalStatement(s, localEnv);
          if (lastVal instanceof BreakSignal || lastVal instanceof ContinueSignal) {
            return lastVal;
          }
        }
        return lastVal;
      }`;

if (code.includes(blockOld)) {
  code = code.replace(blockOld, blockNew);
  console.log("Replaced e_block");
} else {
  console.log("Could not find blockOld");
}

// Fix while
const whileOld = `      case 'e_while': {
        const localEnv: RuntimeEnv = {
          vars: new Map(),
          modules: new Map(),
          exports: new Set(),
          parent: env
        };
        let iterations = 0;
        const maxLoopIterations = 100000000;
        while (Boolean(this.evalExpr(expr.cond, localEnv))) {
          iterations++;
          if (iterations > maxLoopIterations) {
            throw new Error(\`Runtime Error: Loop exceeded maximum iteration count (\${maxLoopIterations}). Infinite loop detected.\`);
          }
          this.evalExpr(expr.body, localEnv);
        }
        return null;
      }`;

const whileNew = `      case 'e_while': {
        const localEnv: RuntimeEnv = {
          vars: new Map(),
          modules: new Map(),
          exports: new Set(),
          parent: env
        };
        let iterations = 0;
        const maxLoopIterations = 100000000;
        while (Boolean(this.evalExpr(expr.cond, localEnv))) {
          iterations++;
          if (iterations > maxLoopIterations) {
            throw new Error(\`Runtime Error: Loop exceeded maximum iteration count (\${maxLoopIterations}). Infinite loop detected.\`);
          }
          const res = this.evalExpr(expr.body, localEnv);
          if (res instanceof BreakSignal) break;
          if (res instanceof ContinueSignal) continue;
        }
        return null;
      }
      case 'e_break': {
        return new BreakSignal();
      }
      case 'e_continue': {
        return new ContinueSignal();
      }`;

if (code.includes(whileOld)) {
  code = code.replace(whileOld, whileNew);
  console.log("Replaced e_while");
} else {
  console.log("Could not find whileOld");
}

// Fix for
const forOld = `      case 'e_for': {
        const localEnv: RuntimeEnv = {
          vars: new Map(),
          modules: new Map(),
          exports: new Set(),
          parent: env
        };
        if (expr.init) {
          if (expr.init.kind === 's_let') {
            this.evalStatement(expr.init, localEnv);
          } else if (expr.init.kind === 's_expr') {
            this.evalExpr(expr.init.expr, localEnv);
          } else if (expr.init.kind.startsWith('e_')) {
            this.evalExpr(expr.init as Expr, localEnv);
          }
        }
        let iterations = 0;
        const maxLoopIterations = 100000000;
        while (expr.cond ? Boolean(this.evalExpr(expr.cond, localEnv)) : true) {
          iterations++;
          if (iterations > maxLoopIterations) {
            throw new Error(\`Runtime Error: Loop exceeded maximum iteration count (\${maxLoopIterations}). Infinite loop detected.\`);
          }
          this.evalExpr(expr.body, localEnv);
          if (expr.update) {
            this.evalExpr(expr.update, localEnv);
          }
        }
        return null;
      }`;

const forNew = `      case 'e_for': {
        const localEnv: RuntimeEnv = {
          vars: new Map(),
          modules: new Map(),
          exports: new Set(),
          parent: env
        };
        if (expr.init) {
          if (expr.init.kind === 's_let') {
            this.evalStatement(expr.init, localEnv);
          } else if (expr.init.kind === 's_expr') {
            this.evalExpr(expr.init.expr, localEnv);
          } else if (expr.init.kind.startsWith('e_')) {
            this.evalExpr(expr.init as Expr, localEnv);
          }
        }
        let iterations = 0;
        const maxLoopIterations = 100000000;
        while (expr.cond ? Boolean(this.evalExpr(expr.cond, localEnv)) : true) {
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
        }
        return null;
      }`;

if (code.includes(forOld)) {
  code = code.replace(forOld, forNew);
  console.log("Replaced e_for");
} else {
  console.log("Could not find forOld");
}

fs.writeFileSync(path, code);
