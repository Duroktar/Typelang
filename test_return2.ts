import { Lexer } from './src/lang/lexer';
import { Parser } from './src/lang/parser';
import { JSCodeGenerator } from './src/lang/codegen_js';

const code = `
function findNumber(arr: number[], target: number): boolean {
  for (let mut i = 0; i < 5; i = i + 1) {
    if (i == target) {
      return true
    }
  }
  return false
}
findNumber([1,2,3,4,5], 3)
`;

const lexer = new Lexer(code);
const parser = new Parser(lexer.tokenize());
const ast = parser.parseProgram();

const compiler = new JSCodeGenerator();
const jsCode = compiler.generate(ast, { target: 'node', includePrelude: true });

console.log(jsCode);
