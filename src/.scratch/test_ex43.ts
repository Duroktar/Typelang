import { Lexer } from '../lang/lexer';
import { Parser } from '../lang/parser';
import { example43HigherOrderTypes } from '../lang/examples/43_higher_order_types';
import { WasmCodeGenerator } from '../lang/codegen_wasm';

async function main() {
  const lexer = new Lexer(example43HigherOrderTypes.code);
  const parser = new Parser(lexer.tokenize());
  const ast = parser.parseProgram();
  const gen = new WasmCodeGenerator();
  const wat = gen.generateWat(ast);
  console.log('WAT successfully generated! Length:', wat.length);
  
  const res = await gen.executeWasm(wat);
  console.log('Exit code:', res.exitCode);
  if (res.error) {
    console.error('Execution error:', res.error);
  }
  console.log('Stdout:');
  console.log(res.stdout.join('\n'));
}

main().catch(console.error);
