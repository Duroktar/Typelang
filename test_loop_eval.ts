import { Evaluator } from './src/lang/evaluator';
import { Lexer } from './src/lang/lexer';
import { Parser } from './src/lang/parser';
import { TypeChecker } from './src/lang/checker';

const code = `
  let mut i = 0
  while (i < 500000) {
    i = i + 1
  }
`;

const lexer = new Lexer(code);
const parser = new Parser(lexer.tokenize());
const ast = parser.parseProgram();

const checker = new TypeChecker();
checker.checkProgram(ast);

const start = Date.now();
const evaluator = new Evaluator();
evaluator.evalProgram(ast);
console.log('Evaluated in', Date.now() - start, 'ms');
