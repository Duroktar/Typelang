// ============================================================================
// TypeLang WebAssembly (WASM) Target Validation Test Suite
// ============================================================================

import * as fs from 'fs';
import * as path from 'path';
import { Lexer } from '../src/lang/lexer';
import { Parser } from '../src/lang/parser';
import { TypeChecker } from '../src/lang/checker';
import { WasmCodeGenerator } from '../src/lang/codegen_wasm';

export interface WasmTestCase {
  name: string;
  code: string;
  expectedSubstrings: string[];
}

export async function runWasmTests(): Promise<boolean> {
  console.log('================================================================================');
  console.log('🌐 TypeLang WebAssembly (WASM / WAT) Target Test Runner');
  console.log('================================================================================\n');

  const rootDir = process.cwd();
  const wasmGen = new WasmCodeGenerator();

  const testCases: WasmTestCase[] = [
    // 1. Bootstrap: Basic Hello World & CLI
    {
      name: 'hello.tl',
      code: fs.readFileSync(path.join(rootDir, 'bootstrap', 'tests', 'hello.tl'), 'utf-8'),
      expectedSubstrings: ['Hello from TypeLang Self-Hosted C11 Compiler!', 'Computed value: 42']
    },
    // 2. Bootstrap: Recursive Fibonacci
    {
      name: 'fib.tl',
      code: fs.readFileSync(path.join(rootDir, 'bootstrap', 'tests', 'fib.tl'), 'utf-8'),
      expectedSubstrings: ['fib(10) = 55']
    },
    // 3. Bootstrap: Dynamic Array & Loop Summation
    {
      name: 'data_structures.tl',
      code: fs.readFileSync(path.join(rootDir, 'bootstrap', 'tests', 'data_structures.tl'), 'utf-8'),
      expectedSubstrings: ['Array sum = 150']
    },
    // 4. Arithmetic, Modulo & Precedence
    {
      name: 'arithmetic_and_modulo',
      code: `
let a = 17.0;
let b = 5.0;
let rem = a % b;
let div = 20.0 / 4.0;
let mul = b * 3.0;
let sub = 100.0 - 50.0;
let prec = 2.0 + 3.0 * 4.0;
println(concat("17 % 5 = ", to_string(rem)));
println(concat("20 / 4 = ", to_string(div)));
println(concat("5 * 3 = ", to_string(mul)));
println(concat("100 - 50 = ", to_string(sub)));
println(concat("2 + 3 * 4 = ", to_string(prec)));
`,
      expectedSubstrings: [
        '17 % 5 = 2',
        '20 / 4 = 5',
        '5 * 3 = 15',
        '100 - 50 = 50',
        '2 + 3 * 4 = 14'
      ]
    },
    // 5. Standard Math Library
    {
      name: 'math_library',
      code: `
let s = Math.sqrt(64.0);
let a = Math.abs(-99.0);
let f = Math.floor(7.8);
let c = Math.ceil(7.2);
let mn = Math.min(12.0, 4.0);
let mx = Math.max(12.0, 4.0);
let p = Math.pow(2.0, 8.0);
println(concat("sqrt(64) = ", to_string(s)));
println(concat("abs(-99) = ", to_string(a)));
println(concat("floor(7.8) = ", to_string(f)));
println(concat("ceil(7.2) = ", to_string(c)));
println(concat("min(12, 4) = ", to_string(mn)));
println(concat("max(12, 4) = ", to_string(mx)));
println(concat("pow(2, 8) = ", to_string(p)));
`,
      expectedSubstrings: [
        'sqrt(64) = 8',
        'abs(-99) = 99',
        'floor(7.8) = 7',
        'ceil(7.2) = 8',
        'min(12, 4) = 4',
        'max(12, 4) = 12',
        'pow(2, 8) = 256'
      ]
    },
    // 6. Boolean Logic and Conditionals
    {
      name: 'boolean_logic_and_conditions',
      code: `
if (10.0 > 5.0 && 20.0 >= 20.0) {
  println("Logic AND verified");
}
if (1.0 == 2.0 || 3.0 != 4.0) {
  println("Logic OR verified");
}
if (!(10.0 < 2.0)) {
  println("Logic NOT verified");
}
`,
      expectedSubstrings: [
        'Logic AND verified',
        'Logic OR verified',
        'Logic NOT verified'
      ]
    },
    // 7. While Loops with Break and Continue
    {
      name: 'while_and_break_continue',
      code: `
let mut i = 0.0;
let mut sum = 0.0;
while (i < 10.0) {
  i = i + 1.0;
  if (i == 3.0) {
    continue;
  }
  if (i > 7.0) {
    break;
  }
  sum = sum + i;
}
println(concat("While loop sum = ", to_string(sum)));
`,
      expectedSubstrings: ['While loop sum = 25']
    },
    // 8. For Loops with Break and Continue
    {
      name: 'for_loops_and_control_flow',
      code: `
let mut total = 0.0;
for (let mut j = 0.0; j < 10.0; j = j + 1.0) {
  if (j == 2.0) {
    continue;
  }
  if (j == 6.0) {
    break;
  }
  total = total + j;
}
println(concat("For loop total = ", to_string(total)));
`,
      expectedSubstrings: ['For loop total = 13']
    },
    // 9. String Operations (concat, len, char_at, equality)
    {
      name: 'string_operations',
      code: `
let s1 = "Hello";
let s2 = "World";
let msg = concat(concat(s1, " "), s2);
println(msg);
println(concat("Length = ", to_string(len(msg))));
if (s1 == "Hello") {
  println("String equality holds");
}
if (s1 != s2) {
  println("String inequality holds");
}
let ch = char_at(s1, 1.0);
println(concat("Char at 1 = ", ch));
`,
      expectedSubstrings: [
        'Hello World',
        'Length = 11',
        'String equality holds',
        'String inequality holds',
        'Char at 1 = e'
      ]
    },
    // 10. Array Operations (create, index, mutate, push, length)
    {
      name: 'array_operations',
      code: `
let mut arr = [10.0, 20.0, 30.0];
println(concat("Initial len = ", to_string(len(arr))));
println(concat("arr[0] = ", to_string(arr[0.0])));
arr[1.0] = 99.0;
println(concat("arr[1] = ", to_string(arr[1.0])));
push(arr, 40.0);
println(concat("After push len = ", to_string(len(arr))));
println(concat("arr[3] = ", to_string(arr[3.0])));
let mut arrSum = 0.0;
for (let mut k = 0.0; k < len(arr); k = k + 1.0) {
  arrSum = arrSum + arr[k];
}
println(concat("Calculated sum = ", to_string(arrSum)));
`,
      expectedSubstrings: [
        'Initial len = 3',
        'arr[0] = 10',
        'arr[1] = 99',
        'After push len = 4',
        'arr[3] = 40',
        'Calculated sum = 179'
      ]
    },
    // 11. Functions and Recursion (factorial)
    {
      name: 'functions_and_recursion',
      code: `
function factorial(n: number): number {
  if (n <= 1.0) {
    return 1.0;
  }
  return n * factorial(n - 1.0);
}
function is_even(n: number): number {
  if (n % 2.0 == 0.0) {
    return 1.0;
  }
  return 0.0;
}
let fact6 = factorial(6.0);
println(concat("6! = ", to_string(fact6)));
if (is_even(fact6) == 1.0) {
  println("Factorial is even");
}
`,
      expectedSubstrings: [
        '6! = 720',
        'Factorial is even'
      ]
    },
    // 12. Host Parsing Utilities
    {
      name: 'host_parsing',
      code: `
let p1 = parse_int("12345");
let p2 = parse_float("3.14159");
println(concat("Parsed int: ", to_string(p1)));
println(concat("Parsed float: ", to_string(p2)));
`,
      expectedSubstrings: [
        'Parsed int: 12345',
        'Parsed float: 3.14159'
      ]
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
      console.error(`Generated WAT:\n${wat.slice(0, 1000)}...\n`);
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
    }
  }

  console.log('\n================================================================================');
  if (allPassed) {
    console.log(`🎉 ALL ${testCases.length} WEBASSEMBLY (WASM) TARGET TESTS PASSED NATIVELY!`);
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
