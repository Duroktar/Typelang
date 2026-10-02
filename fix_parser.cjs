const fs = require('fs');

const parserFile = 'src/lang/parser.ts';
let code = fs.readFileSync(parserFile, 'utf-8');

const matchExprText = `    // Match expression: match (scrutinee) { ... }`;

const newBreakContinue = `
    // Break
    if (this.match('KEYWORD', 'break')) {
      return { kind: 'e_break', loc: tok.loc };
    }

    // Continue
    if (this.match('KEYWORD', 'continue')) {
      return { kind: 'e_continue', loc: tok.loc };
    }

    // Match expression: match (scrutinee) { ... }`;

if (code.includes(matchExprText)) {
  code = code.replace(matchExprText, newBreakContinue);
  fs.writeFileSync(parserFile, code);
  console.log('Successfully added break and continue to parser!');
} else {
  console.error('Could not find match expression in parser.');
}
