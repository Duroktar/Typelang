import { Lexer } from './src/lang/lexer';
import { Parser } from './src/lang/parser';

const code = `
fn findNumber(arr: number[], target: number): boolean {
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
const tokens = lexer.tokenize();
console.log(tokens.slice(0, 50));
const parser = new Parser(tokens);
const ast = parser.parseProgram();
