import { Evaluator } from './src/lang/evaluator';
import { Lexer } from './src/lang/lexer';
import { Parser } from './src/lang/parser';
import { TypeChecker } from './src/lang/checker';
import { JSCodeGenerator } from './src/lang/codegen_js';

const code = `
  let mut sum = 0
  for (let mut i = 0; i < 10; i = i + 1) {
    if (i == 3) { continue }
    if (i == 7) { break }
    sum = sum + i
  }
  sum
`;

const lexer = new Lexer(code);
const parser = new Parser(lexer.tokenize());
const ast = parser.parseProgram();

const checker = new TypeChecker();
checker.checkProgram(ast);

const evaluator = new Evaluator();
const result = evaluator.evalProgram(ast);
console.log('Evaluator Result:', result.result);

const compiler = new JSCodeGenerator();
const jsCode = compiler.generate(ast, { target: 'node' });
console.log('JS Code:', jsCode);

const fn = new Function(jsCode + '\nreturn sum;');
console.log('JS Result:', fn());
