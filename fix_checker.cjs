const fs = require('fs');

const checkerFile = 'src/lang/checker.ts';
let code = fs.readFileSync(checkerFile, 'utf-8');

const whileCheck = `
      case 'e_while': {
        const localEnv = createScopedEnv(env);
        this.checkExpr(expr.cond, PRIM_BOOLEAN, localEnv);
        this.synthExpr(expr.body, localEnv);
        return PRIM_VOID;
      }
`;

const newBreakContinueCheck = `
      case 'e_while': {
        const localEnv = createScopedEnv(env);
        this.checkExpr(expr.cond, PRIM_BOOLEAN, localEnv);
        this.synthExpr(expr.body, localEnv);
        return PRIM_VOID;
      }

      case 'e_break':
      case 'e_continue': {
        return PRIM_VOID;
      }
`;

if (code.includes(whileCheck.trim())) {
  code = code.replace(whileCheck.trim(), newBreakContinueCheck.trim());
  fs.writeFileSync(checkerFile, code);
  console.log('Successfully added break/continue to checker!');
} else {
  console.error('Could not find e_while in checker.');
}
