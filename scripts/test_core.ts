// ============================================================================
// TypeLang Core Language & LLVM Backend Test Suite
// ============================================================================

import { Lexer } from '../src/lang/lexer';
import { Parser } from '../src/lang/parser';
import { CoreLowerer } from '../src/lang/core_lower';
import { coreToString } from '../src/lang/core';
import { CoreLLVMCodeGen } from '../src/lang/core_codegen_llvm';
import { LLVMInterpreter } from '../src/lang/llvm_interpreter';

const sampleCode = `
function add(a: number, b: number): number {
  return a + b;
}

let result = add(10.0, 32.0);
println(to_string(result));
`;

console.log('🚀 Running TypeLang Core Language & LLVM Pipeline Test...\n');

const lexer = new Lexer(sampleCode);
const tokens = lexer.tokenize();
const parser = new Parser(tokens);
const ast = parser.parseProgram();

const lowerer = new CoreLowerer();
const coreProgram = lowerer.lower(ast);

console.log(coreToString(coreProgram));
console.log('\n----------------------------------------\n');

const codegen = new CoreLLVMCodeGen();
const llvmIR = codegen.generate(coreProgram);

console.log('--- Generated LLVM IR via Core Backend ---');
console.log(llvmIR);

console.log('\n--- Executing Generated Core LLVM IR via SSA Engine ---');
const interpreter = new LLVMInterpreter();
const execResult = interpreter.execute(llvmIR);
console.log('Stdout output:', execResult.stdout);
console.log('Exit code:', execResult.exitCode);
if (execResult.error) {
  console.error('Execution error:', execResult.error);
  process.exit(1);
}

console.log('\n🎉 Core pipeline basic test passed successfully with stdout:', execResult.stdout.join(' '));

console.log('\n🧪 Testing Example 01 (GADT Expression Evaluator) through Core Pipeline...');
import { example01GadtEval } from '../src/lang/examples/01_gadt_eval';

const ast01 = new Parser(new Lexer(example01GadtEval.code).tokenize()).parseProgram();
const core01 = new CoreLowerer().lower(ast01);
const ir01 = new CoreLLVMCodeGen().generate(core01);
const res01 = new LLVMInterpreter().execute(ir01);

console.log('Example 01 Stdout output:', res01.stdout);
if (res01.error) {
  console.error('Example 01 Execution error:', res01.error);
  process.exit(1);
}

const expected01 = ['21 + 21 = 42', 'If true then 100 else 0 = 100'];
if (JSON.stringify(res01.stdout) !== JSON.stringify(expected01)) {
  console.error(`Example 01 Output mismatch!\nExpected: ${JSON.stringify(expected01)}\nGot: ${JSON.stringify(res01.stdout)}`);
  process.exit(1);
}
console.log('🎉 Example 01 passed successfully through Core Pipeline!\n');
