const fs = require('fs');
const path = 'src/lang/evaluator.ts';
let code = fs.readFileSync(path, 'utf-8');

if (!code.includes('class BreakSignal')) {
  code = `
export class BreakSignal {}
export class ContinueSignal {}
` + code;
}

const forLoop = `      case 'e_for': {
        const localEnv = createScopedEnv(env);
        if (expr.init) {
          if ('kind' in expr.init && expr.init.kind.startsWith('s_')) {
            this.evalStatement(expr.init as Statement, localEnv);
          } else {
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

const newForLoop = `      case 'e_for': {
        const localEnv = createScopedEnv(env);
        if (expr.init) {
          if ('kind' in expr.init && expr.init.kind.startsWith('s_')) {
            this.evalStatement(expr.init as Statement, localEnv);
          } else {
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
          
          let res = this.evalExpr(expr.body, localEnv);
          if (res instanceof BreakSignal) break;
          // if res instanceof ContinueSignal, it's just fine, we just fall through to update
          
          if (expr.update) {
            this.evalExpr(expr.update, localEnv);
          }
        }
        return null;
      }`;

const whileLoop = `      case 'e_while': {
        const localEnv = createScopedEnv(env);
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

const newWhileLoop = `      case 'e_while': {
        const localEnv = createScopedEnv(env);
        let iterations = 0;
        const maxLoopIterations = 100000000;
        while (Boolean(this.evalExpr(expr.cond, localEnv))) {
          iterations++;
          if (iterations > maxLoopIterations) {
            throw new Error(\`Runtime Error: Loop exceeded maximum iteration count (\${maxLoopIterations}). Infinite loop detected.\`);
          }
          let res = this.evalExpr(expr.body, localEnv);
          if (res instanceof BreakSignal) break;
        }
        return null;
      }
      case 'e_break': {
        return new BreakSignal();
      }
      case 'e_continue': {
        return new ContinueSignal();
      }`;

const blockEval = `      case 'e_block': {
        const localEnv = createScopedEnv(env);
        let result: any = null;
        for (const e of expr.exprs) {
          result = this.evalExpr(e, localEnv);
        }
        return result;
      }`;

const newBlockEval = `      case 'e_block': {
        const localEnv = createScopedEnv(env);
        let result: any = null;
        for (const e of expr.exprs) {
          result = this.evalExpr(e, localEnv);
          if (result instanceof BreakSignal || result instanceof ContinueSignal) {
            return result;
          }
        }
        return result;
      }`;

if (code.includes(forLoop.trim())) {
  code = code.replace(forLoop.trim(), newForLoop.trim());
  console.log('Replaced forLoop');
} else {
  console.error('Could not find forLoop');
}

if (code.includes(whileLoop.trim())) {
  code = code.replace(whileLoop.trim(), newWhileLoop.trim());
  console.log('Replaced whileLoop');
} else {
  console.error('Could not find whileLoop');
}

if (code.includes(blockEval.trim())) {
  code = code.replace(blockEval.trim(), newBlockEval.trim());
  console.log('Replaced blockEval');
} else {
  console.error('Could not find blockEval');
}

fs.writeFileSync(path, code);
