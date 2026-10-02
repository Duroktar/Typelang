import { Lexer } from './src/lang/lexer';
import { Parser } from './src/lang/parser';
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
const compiler = new JSCodeGenerator();
const js = compiler.generate(ast, { target: 'node' });

try {
  const result = new Function(js + ' return sum;')();
  console.log("Result:", result);
} catch (e) {
  console.log("Error running JS:", e);
  console.log("Code:\\n", js);
}
