const fs = require('fs');
const path = 'src/lang/codegen_js.ts';
let code = fs.readFileSync(path, 'utf-8');

const preludeOld = `      'const $concat = (a, b) => String(a) + String(b);',`;
const preludeNew = `      'const $concat = (a, b) => String(a) + String(b);',
      'class __BreakSignal {}',
      'class __ContinueSignal {}',`;

if (code.includes(preludeOld)) {
  code = code.replace(preludeOld, preludeNew);
} else {
  console.log("Could not find prelude string");
}

const whileOld = `  private generateWhileStatement(expr: EWhile): string {
    const condStr = this.generateExpr(expr.cond);
    const bodyCode = this.generateExpr(expr.body);
    return \`\${this.indent()}while (\${condStr}) \${bodyCode}\`;
  }`;

const whileNew = `  private generateWhileStatement(expr: EWhile): string {
    const condStr = this.generateExpr(expr.cond);
    const bodyCode = this.generateExpr(expr.body);
    return \`\${this.indent()}try { while (\${condStr}) { try { \${bodyCode} } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }\`;
  }`;

if (code.includes(whileOld)) {
  code = code.replace(whileOld, whileNew);
} else {
  console.log("Could not find while loop generation");
}

const forOld = `  private generateForStatement(expr: EFor): string {
    let initStr = '';
    if (expr.init) {
      if (expr.init.kind.startsWith('s_')) {
        initStr = this.generateStatement(expr.init as Statement).trim();
      } else {
        initStr = this.generateExpr(expr.init as Expr) + ';';
      }
    }
    const condStr = expr.cond ? this.generateExpr(expr.cond) : 'true';
    const updateStr = expr.update ? this.generateExpr(expr.update) : '';
    const bodyCode = this.generateExpr(expr.body);

    return \`\${this.indent()}for (\${initStr} \${condStr}; \${updateStr}) \${bodyCode}\`;
  }`;

const forNew = `  private generateForStatement(expr: EFor): string {
    let initStr = '';
    if (expr.init) {
      if (expr.init.kind.startsWith('s_')) {
        initStr = this.generateStatement(expr.init as Statement).trim();
      } else {
        initStr = this.generateExpr(expr.init as Expr) + ';';
      }
    }
    const condStr = expr.cond ? this.generateExpr(expr.cond) : 'true';
    const updateStr = expr.update ? this.generateExpr(expr.update) : '';
    const bodyCode = this.generateExpr(expr.body);

    return \`\${this.indent()}try { for (\${initStr} \${condStr}; \${updateStr}) { try { \${bodyCode} } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }\`;
  }`;

if (code.includes(forOld)) {
  code = code.replace(forOld, forNew);
} else {
  console.log("Could not find for loop generation");
}

const defaultExprOld = `      default:
        return 'null';`;

const breakContinueNew = `      case 'e_break':
        return '(function(){ throw new __BreakSignal(); })()';
      case 'e_continue':
        return '(function(){ throw new __ContinueSignal(); })()';
      default:
        return 'null';`;

if (code.includes(defaultExprOld)) {
  code = code.replace(defaultExprOld, breakContinueNew);
} else {
  console.log("Could not find default expr");
}

fs.writeFileSync(path, code);
console.log("Replaced codegen_js");
