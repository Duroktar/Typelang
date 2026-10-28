// ============================================================================
// TypeLang WebAssembly (WASM) Target Validation Test Suite
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { Lexer } from '../src/lang/lexer';
import { Parser } from '../src/lang/parser';
import { TypeChecker } from '../src/lang/checker';
import { WasmCodeGenerator } from '../src/lang/codegen_wasm';

export async function runWasmTests(): Promise<boolean> {
  console.log('================================================================================');
  console.log('🌐 TypeLang WebAssembly (WASM / WAT) Target Test Runner');
  console.log('================================================================================\n');

  const rootDir = process.cwd();
  const wasmGen = new WasmCodeGenerator();

  const testCases = [
    {
      name: 'hello.tl',
      code: fs.readFileSync(path.join(rootDir, 'bootstrap', 'tests', 'hello.tl'), 'utf-8'),
      expectedSubstrings: ['Hello from TypeLang Self-Hosted C11 Compiler!', 'Computed value: 42']
    },
    {
      name: 'fib.tl',
      code: fs.readFileSync(path.join(rootDir, 'bootstrap', 'tests', 'fib.tl'), 'utf-8'),
      expectedSubstrings: ['fib(10) = 55']
    },
    {
      name: 'data_structures.tl',
      code: fs.readFileSync(path.join(rootDir, 'bootstrap', 'tests', 'data_structures.tl'), 'utf-8'),
      expectedSubstrings: ['Array sum = 150']
    }
  ];

  let allPassed = true;

  for (const tc of testCases) {
    console.log(`🧪 Testing ${tc.name}...`);
    const t0 = performance.now();

    const lexer = new Lexer(tc.code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parseProgram();

    const checker = new TypeChecker();
    checker.checkProgram(ast);

    const wat = wasmGen.generateWat(ast);
    const execRes = await wasmGen.executeWasm(wat);

    const duration = Math.round((performance.now() - t0) * 100) / 100;

    if (execRes.exitCode !== 0 || execRes.error) {
      console.error(`❌ ${tc.name} execution failed: ${execRes.error}`);
      console.error(`Generated WAT:\n${wat.slice(0, 500)}...\n`);
      allPassed = false;
      continue;
    }

    const outputStr = execRes.stdout.join('\n');
    let matched = true;
    for (const exp of tc.expectedSubstrings) {
      if (!outputStr.includes(exp)) {
        console.error(`❌ Output mismatch in ${tc.name}: expected to contain "${exp}"`);
        console.error(`Actual stdout:\n${outputStr}`);
        matched = false;
        allPassed = false;
        break;
      }
    }

    if (matched) {
      console.log(`   ✓ ${tc.name} generated valid WAT (${execRes.binarySizeBytes} bytes WASM) and executed in ${duration}ms!`);
      console.log(`     Stdout:\n${execRes.stdout.map(s => '       ' + s).join('\n')}`);
    }
  }

  console.log('\n================================================================================');
  if (allPassed) {
    console.log('🎉 ALL WEBASSEMBLY (WASM) TARGET TESTS PASSED NATIVELY!');
  } else {
    console.log('❌ SOME WEBASSEMBLY (WASM) TESTS FAILED');
  }
  console.log('================================================================================\n');

  return allPassed;
}

if (process.argv[1]?.endsWith('test_wasm.ts')) {
  runWasmTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(err => {
    console.error('Fatal error in WASM test suite:', err);
    process.exit(1);
  });
}
