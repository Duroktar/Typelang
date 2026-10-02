const fs = require('fs');
const path = 'src/lang/parser.ts';
let code = fs.readFileSync(path, 'utf-8');

const breakContinue = `    // Break
    if (this.match('KEYWORD', 'break')) {
      return { kind: 'e_break', loc: tok.loc };
    }

    // Continue
    if (this.match('KEYWORD', 'continue')) {
      return { kind: 'e_continue', loc: tok.loc };
    }`;

const newBreakContinue = `    // Break
    if (this.match('KEYWORD', 'break')) {
      return { kind: 'e_break', loc: tok.loc };
    }

    // Continue
    if (this.match('KEYWORD', 'continue')) {
      return { kind: 'e_continue', loc: tok.loc };
    }

    // Return
    if (this.match('KEYWORD', 'return')) {
      let value = undefined;
      // Heuristic: if we aren't at the end of a block/statement, parse an expression
      if (!this.check('SYMBOL', '}') && !this.check('SYMBOL', ';') && !this.isAtEnd()) {
        const nextTok = this.peek();
        // Just to be safe against newlines ending a return statement in some contexts, but our parser ignores newlines
        // If the next token isn't closing a context, try parsing it as an expression.
        if (nextTok.type !== 'KEYWORD' || ['true', 'false', 'match', 'if', 'fn'].includes(nextTok.value)) {
           value = this.parseExpr();
        }
      }
      return { kind: 'e_return', value, loc: tok.loc };
    }`;

code = code.replace(breakContinue, newBreakContinue);
fs.writeFileSync(path, code);
