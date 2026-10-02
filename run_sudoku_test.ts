import { COMPILER_TEST_SUITE } from './src/lang/tests';
import { Lexer } from './src/lang/lexer';
import { Parser } from './src/lang/parser';
import { Evaluator } from './src/lang/evaluator';
import { TypeChecker } from './src/lang/checker';

const test = COMPILER_TEST_SUITE.find(t => t.id === 'test_sudoku_backtracking_loop_limit');

const lexer = new Lexer(test.code);
const parser = new Parser(lexer.tokenize());
const ast = parser.parseProgram();

const checker = new TypeChecker();
checker.checkProgram(ast);

const evaluator = new Evaluator();
try {
  evaluator.evalProgram(ast);
  console.log("Passed!");
} catch (e) {
  console.log("Failed:", e);
}
