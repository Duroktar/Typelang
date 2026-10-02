const fs = require('fs');
const path = 'src/lang/evaluator.ts';
let code = fs.readFileSync(path, 'utf-8');

const breaks = `export class ContinueSignal { _isContinue = true; }`;
const breaksNew = `export class ContinueSignal { _isContinue = true; }
export class ReturnSignal { constructor(public value: any) {} }`;
code = code.replace(breaks, breaksNew);

const evalBreak = `      case 'e_continue': {
        throw new ContinueSignal();
      }`;
const evalBreakNew = `      case 'e_continue': {
        throw new ContinueSignal();
      }
      case 'e_return': {
        const val = expr.value ? this.evalExpr(expr.value, env) : null;
        throw new ReturnSignal(val);
      }`;
code = code.replace(evalBreak, evalBreakNew);

// Add catch to functions
const s_func = `          stmt.params.forEach((p, i) => {
            localEnv.vars.set(p.name, args[i]);
          });

          return this.evalExpr(stmt.body, localEnv);
        };`;
const s_func_new = `          stmt.params.forEach((p, i) => {
            localEnv.vars.set(p.name, args[i]);
          });

          try {
            return this.evalExpr(stmt.body, localEnv);
          } catch(e) {
            if (e instanceof ReturnSignal) return e.value;
            throw e;
          }
        };`;
code = code.replace(s_func, s_func_new);

const e_lambda = `          expr.params.forEach((p, i) => {
            localEnv.vars.set(p.name, args[i]);
          });
          return this.evalExpr(expr.body, localEnv);
        };`;
const e_lambda_new = `          expr.params.forEach((p, i) => {
            localEnv.vars.set(p.name, args[i]);
          });
          try {
            return this.evalExpr(expr.body, localEnv);
          } catch(e) {
            if (e instanceof ReturnSignal) return e.value;
            throw e;
          }
        };`;
code = code.replace(e_lambda, e_lambda_new);

fs.writeFileSync(path, code);
