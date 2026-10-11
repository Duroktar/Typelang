/**
 * TypeLang Native Compiler Test Harness
 *
 * Compiles and validates TypeLang source programs across:
 *  1. C11 Native Backend   (via clang, gcc, cc, or tcc)
 *  2. C++17 Native Backend (via clang++, g++, or c++)
 *  3. LLVM IR Native / JIT (via clang or lli)
 *  4. In-Engine LLVM SSA   (built-in TypeLang LLVMInterpreter)
 *  5. TypeLang Evaluator   (AST interpreter baseline)
 *
 * Usage:
 *   npx tsx scripts/test_native_harness.ts [options]
 *
 * Options:
 *   --file=<path>            Path to .typelang or .tl file (default: tests/comprehensive_suite.typelang)
 *   --expected=<path>        Path to expected output file (default: <file>.expected.txt)
 *   --backend=<all|c|cpp|llvm|evaluator> Target backend filter (default: all)
 *   --c-compiler=<binary>    Explicit path to C compiler (e.g. clang, gcc, cc)
 *   --cpp-compiler=<binary>  Explicit path to C++ compiler (e.g. clang++, g++)
 *   --llvm-runner=<binary>   Explicit path to LLVM runner (e.g. clang, lli)
 *   --keep-temps             Retain generated .c, .cpp, .ll, and executable binaries
 *   --out-dir=<dir>          Output directory for generated files (default: .tl_build)
 *   --update-expected        Overwrite expected output file with reference evaluator output
 *   --verbose, -v            Print full compiler commands and execution logs
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { Lexer } from '../src/lang/lexer';
import { Parser } from '../src/lang/parser';
import { TypeChecker } from '../src/lang/checker';
import { LLVMIRGenerator } from '../src/lang/codegen_llvm';
import { CCodeGenerator } from '../src/lang/codegen_c';
import { LLVMInterpreter } from '../src/lang/llvm_interpreter';
import { Evaluator } from '../src/lang/evaluator';

export interface ToolchainInfo {
  name: string;
  command: string;
  version: string;
  type: 'c' | 'cpp' | 'llvm';
}

export interface TargetRunResult {
  target: 'c' | 'cpp' | 'llvm_native' | 'llvm_vm' | 'evaluator';
  runnerName: string;
  compiled: boolean;
  executed: boolean;
  passed: boolean;
  exitCode?: number;
  stdout: string[];
  compileTimeMs: number;
  executionTimeMs: number;
  error?: string;
  diffLines?: string[];
  skippedReason?: string;
}

// ----------------------------------------------------------------------------
// Toolchain Discovery
// ----------------------------------------------------------------------------

export function checkBinary(cmd: string): { exists: boolean; version: string } {
  try {
    const res = spawnSync(cmd, ['--version'], { encoding: 'utf-8', timeout: 3000 });
    if (res.status === 0 && res.stdout) {
      const firstLine = res.stdout.split('\n')[0].trim();
      return { exists: true, version: firstLine };
    }
  } catch {
    // Binary not available
  }
  return { exists: false, version: '' };
}

export function discoverToolchains(customOpts: {
  cCompiler?: string;
  cppCompiler?: string;
  llvmRunner?: string;
}): {
  cCompilers: ToolchainInfo[];
  cppCompilers: ToolchainInfo[];
  llvmRunners: ToolchainInfo[];
} {
  const cCandidates = customOpts.cCompiler
    ? [customOpts.cCompiler]
    : [
        'clang',
        'gcc',
        'cc',
        'tcc',
        '/usr/bin/clang',
        '/usr/bin/gcc',
        '/usr/local/bin/clang',
        '/usr/local/bin/gcc',
        '/opt/homebrew/bin/clang',
        '/opt/homebrew/bin/gcc',
      ];

  const cppCandidates = customOpts.cppCompiler
    ? [customOpts.cppCompiler]
    : [
        'clang++',
        'g++',
        'c++',
        '/usr/bin/clang++',
        '/usr/bin/g++',
        '/usr/local/bin/clang++',
        '/usr/local/bin/g++',
        '/opt/homebrew/bin/clang++',
        '/opt/homebrew/bin/g++',
      ];

  const llvmCandidates = customOpts.llvmRunner
    ? [customOpts.llvmRunner]
    : [
        'clang',
        'lli',
        'lli-19',
        'lli-18',
        'lli-17',
        '/usr/bin/clang',
        '/usr/bin/lli',
        '/usr/local/bin/clang',
        '/usr/local/bin/lli',
        '/opt/homebrew/bin/clang',
        '/opt/homebrew/bin/lli',
      ];

  const cCompilers: ToolchainInfo[] = [];
  for (const cmd of cCandidates) {
    const { exists, version } = checkBinary(cmd);
    if (exists) {
      cCompilers.push({ name: path.basename(cmd), command: cmd, version, type: 'c' });
      break; // Select primary available C compiler
    }
  }

  const cppCompilers: ToolchainInfo[] = [];
  for (const cmd of cppCandidates) {
    const { exists, version } = checkBinary(cmd);
    if (exists) {
      cppCompilers.push({ name: path.basename(cmd), command: cmd, version, type: 'cpp' });
      break; // Select primary available C++ compiler
    }
  }

  const llvmRunners: ToolchainInfo[] = [];
  for (const cmd of llvmCandidates) {
    const { exists, version } = checkBinary(cmd);
    if (exists) {
      llvmRunners.push({ name: path.basename(cmd), command: cmd, version, type: 'llvm' });
      break; // Select primary available LLVM tool
    }
  }

  return { cCompilers, cppCompilers, llvmRunners };
}

// ----------------------------------------------------------------------------
// Output Normalization & Diffing
// ----------------------------------------------------------------------------

export function normalizeLines(lines: string[]): string[] {
  return lines
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      // Normalize number representations where applicable (e.g. 42.0 vs 42)
      return line.replace(/: (-?\d+)\.0(\D|$)/g, ': $1$2');
    });
}

export function compareOutput(actualLines: string[], expectedLines: string[]): {
  passed: boolean;
  diff: string[];
} {
  const normActual = normalizeLines(actualLines);
  const normExpected = normalizeLines(expectedLines);

  const diff: string[] = [];
  const maxLen = Math.max(normActual.length, normExpected.length);

  for (let i = 0; i < maxLen; i++) {
    const actual = normActual[i] ?? '<MISSING LINE>';
    const expected = normExpected[i] ?? '<UNEXPECTED EXTRA LINE>';
    if (actual !== expected) {
      diff.push(`  [Line ${i + 1}] Expected: "${expected}"`);
      diff.push(`            Actual:   "${actual}"`);
    }
  }

  return {
    passed: diff.length === 0,
    diff,
  };
}

// ----------------------------------------------------------------------------
// CLI Options Parser
// ----------------------------------------------------------------------------

export interface HarnessOptions {
  filePath: string;
  expectedPath?: string;
  backend: 'all' | 'c' | 'cpp' | 'llvm' | 'evaluator';
  cCompiler?: string;
  cppCompiler?: string;
  llvmRunner?: string;
  keepTemps: boolean;
  outDir: string;
  updateExpected: boolean;
  verbose: boolean;
}

export function parseArgs(): HarnessOptions {
  const args = process.argv.slice(2);
  let filePath = path.resolve(process.cwd(), 'tests/comprehensive_suite.typelang');
  let expectedPath: string | undefined;
  let backend: 'all' | 'c' | 'cpp' | 'llvm' | 'evaluator' = 'all';
  let cCompiler: string | undefined;
  let cppCompiler: string | undefined;
  let llvmRunner: string | undefined;
  let keepTemps = false;
  let outDir = path.resolve(process.cwd(), '.tl_build');
  let updateExpected = false;
  let verbose = false;

  for (const arg of args) {
    if (arg.startsWith('--file=')) filePath = path.resolve(process.cwd(), arg.slice(7));
    else if (arg.startsWith('--expected=')) expectedPath = path.resolve(process.cwd(), arg.slice(11));
    else if (arg.startsWith('--backend=')) backend = arg.slice(10) as any;
    else if (arg.startsWith('--c-compiler=')) cCompiler = arg.slice(13);
    else if (arg.startsWith('--cpp-compiler=')) cppCompiler = arg.slice(15);
    else if (arg.startsWith('--llvm-runner=')) llvmRunner = arg.slice(14);
    else if (arg === '--keep-temps') keepTemps = true;
    else if (arg.startsWith('--out-dir=')) outDir = path.resolve(process.cwd(), arg.slice(10));
    else if (arg === '--update-expected') updateExpected = true;
    else if (arg === '--verbose' || arg === '-v') verbose = true;
  }

  if (!expectedPath) {
    const candidateExpected = filePath
      .replace(/\.typelang$/, '.expected.txt')
      .replace(/\.tl$/, '.expected.txt');
    if (fs.existsSync(candidateExpected)) {
      expectedPath = candidateExpected;
    }
  }

  return {
    filePath,
    expectedPath,
    backend,
    cCompiler,
    cppCompiler,
    llvmRunner,
    keepTemps,
    outDir,
    updateExpected,
    verbose,
  };
}

// ----------------------------------------------------------------------------
// Main Harness Execution
// ----------------------------------------------------------------------------

export function runNativeHarness(customOpts?: Partial<HarnessOptions>): boolean {
  const opts = { ...parseArgs(), ...customOpts };

  console.log(`\n================================================================================`);
  console.log(`🚀 TypeLang Native Compiler Backend & Validation Test Harness`);
  console.log(`================================================================================`);
  console.log(`📁 Source Program:   ${path.relative(process.cwd(), opts.filePath)}`);
  if (opts.expectedPath) {
    console.log(`🎯 Expected Output:  ${path.relative(process.cwd(), opts.expectedPath)}`);
  }
  console.log(`🎯 Target Backend:   ${opts.backend.toUpperCase()}`);
  console.log(`📦 Output Directory: ${path.relative(process.cwd(), opts.outDir)}`);

  if (!fs.existsSync(opts.filePath)) {
    console.error(`❌ Source program not found: ${opts.filePath}`);
    process.exit(1);
  }

  const sourceCode = fs.readFileSync(opts.filePath, 'utf-8');

  // 1. Parsing and Type Checking
  console.log(`\n🔍 [Stage 1] Parsing & Typechecking TypeLang AST...`);
  const parseStart = performance.now();
  const lexer = new Lexer(sourceCode);
  const parser = new Parser(lexer.tokenize());
  const ast = parser.parseProgram();
  const checker = new TypeChecker();
  checker.checkProgram(ast);
  const parseTime = Math.round(performance.now() - parseStart);

  if (checker.diagnostics.length > 0) {
    console.warn(`   ⚠️ Type checker reported ${checker.diagnostics.length} diagnostic(s):`);
    checker.diagnostics.forEach(d => console.warn(`      - Line ${d.line}: ${d.message}`));
  } else {
    console.log(`   ✓ AST parsed and checked cleanly (${ast.statements.length} top-level statements, ${parseTime}ms).`);
  }

  // 2. Discover host compilers
  console.log(`\n🔎 [Stage 2] Discovering Available System Toolchains...`);
  const toolchains = discoverToolchains({
    cCompiler: opts.cCompiler,
    cppCompiler: opts.cppCompiler,
    llvmRunner: opts.llvmRunner,
  });

  if (toolchains.cCompilers.length > 0) {
    console.log(`   ✓ Found C Compiler:    ${toolchains.cCompilers[0].command} (${toolchains.cCompilers[0].version})`);
  } else {
    console.log(`   ℹ️ No native C compiler found on PATH (clang/gcc/cc).`);
  }

  if (toolchains.cppCompilers.length > 0) {
    console.log(`   ✓ Found C++ Compiler:  ${toolchains.cppCompilers[0].command} (${toolchains.cppCompilers[0].version})`);
  } else {
    console.log(`   ℹ️ No native C++ compiler found on PATH (clang++/g++/c++).`);
  }

  if (toolchains.llvmRunners.length > 0) {
    console.log(`   ✓ Found LLVM Tool:     ${toolchains.llvmRunners[0].command} (${toolchains.llvmRunners[0].version})`);
  } else {
    console.log(`   ℹ️ No native LLVM runner found on PATH (lli/clang). In-engine LLVMInterpreter will be used.`);
  }

  // 3. Load or generate expected output baseline
  fs.mkdirSync(opts.outDir, { recursive: true });

  let expectedLines: string[] = [];
  if (opts.expectedPath && fs.existsSync(opts.expectedPath) && !opts.updateExpected) {
    expectedLines = fs.readFileSync(opts.expectedPath, 'utf-8').split('\n');
    console.log(`   ✓ Loaded ${normalizeLines(expectedLines).length} expected output lines from baseline file.`);
  } else {
    console.log(`\n⚙️ Generating Reference Expected Baseline via TypeLang AST Evaluator...`);
    const evaluator = new Evaluator();
    const evalRes = evaluator.evalProgram(ast);
    expectedLines = evalRes.stdout;
    if (opts.expectedPath) {
      fs.writeFileSync(opts.expectedPath, normalizeLines(expectedLines).join('\n') + '\n', 'utf-8');
      console.log(`   ✓ Wrote reference baseline (${normalizeLines(expectedLines).length} lines) to ${opts.expectedPath}`);
    }
  }

  const results: TargetRunResult[] = [];

  // --------------------------------------------------------------------------
  // TypeLang AST Evaluator Reference
  // --------------------------------------------------------------------------
  if (opts.backend === 'all' || opts.backend === 'evaluator') {
    console.log(`\n💎 [Stage 3] Testing TypeLang AST Evaluator Reference...`);
    const evalStart = performance.now();
    const evaluator = new Evaluator();
    let evalStdout: string[] = [];
    let evalError: string | undefined;
    let evalTime = 0;
    try {
      const evalRes = evaluator.evalProgram(ast);
      evalStdout = evalRes.stdout;
      evalTime = Math.round(performance.now() - evalStart);
    } catch (e: any) {
      evalError = e.message || String(e);
      evalTime = Math.round(performance.now() - evalStart);
    }
    const evalComp = compareOutput(evalStdout, expectedLines);

    results.push({
      target: 'evaluator',
      runnerName: 'TypeLang Evaluator (Reference AST)',
      compiled: true,
      executed: !evalError,
      passed: evalComp.passed && !evalError,
      exitCode: evalError ? 1 : 0,
      stdout: evalStdout,
      compileTimeMs: 0,
      executionTimeMs: evalTime,
      error: evalError,
      diffLines: evalComp.diff,
    });

    if (evalComp.passed && !evalError) {
      console.log(`   ✅ Evaluator: Output MATCHED expected baseline exactly (${evalTime}ms).`);
    } else {
      console.log(`   ❌ Evaluator mismatch:`);
      if (evalError) console.log(`      Error: ${evalError}`);
      evalComp.diff.forEach(d => console.log(`      ${d}`));
    }
  }

  // --------------------------------------------------------------------------
  // LLVM Backend Validation
  // --------------------------------------------------------------------------
  if (opts.backend === 'all' || opts.backend === 'llvm') {
    console.log(`\n⚡ [Stage 4] Testing LLVM IR SSA Backend...`);
    const llvmStart = performance.now();
    const llvmGen = new LLVMIRGenerator();
    const llvmIR = llvmGen.generate(ast);
    const llvmCompileTime = Math.round(performance.now() - llvmStart);
    const llPath = path.join(opts.outDir, 'program.ll');
    fs.writeFileSync(llPath, llvmIR, 'utf-8');
    console.log(`   ✓ Generated ${llvmIR.split('\n').length} lines of LLVM IR SSA (${llvmCompileTime}ms).`);

    // In-engine LLVM SSA Interpreter execution
    console.log(`   ⚙️ Running via in-engine LLVM SSA Virtual Machine...`);
    const interpStart = performance.now();
    const interpreter = new LLVMInterpreter();
    const interpRes = interpreter.execute(llvmIR);
    const interpTime = Math.round(performance.now() - interpStart);

    const compInterp = compareOutput(interpRes.stdout, expectedLines);
    results.push({
      target: 'llvm_vm',
      runnerName: 'LLVMInterpreter (In-Engine SSA VM)',
      compiled: true,
      executed: !interpRes.error,
      passed: compInterp.passed && !interpRes.error,
      exitCode: interpRes.exitCode,
      stdout: interpRes.stdout,
      compileTimeMs: llvmCompileTime,
      executionTimeMs: interpTime,
      error: interpRes.error,
      diffLines: compInterp.diff,
    });

    if (compInterp.passed && !interpRes.error) {
      console.log(`   ✅ LLVMInterpreter: Output MATCHED expected baseline exactly (${interpTime}ms).`);
    } else {
      console.log(`   ❌ LLVMInterpreter: Output mismatch or execution error:`);
      if (interpRes.error) console.log(`      Error: ${interpRes.error}`);
      compInterp.diff.forEach(d => console.log(`      ${d}`));
    }

    // Host Native LLVM Execution (if clang or lli is available)
    if (toolchains.llvmRunners.length > 0) {
      const runner = toolchains.llvmRunners[0];
      const hostBin = path.join(opts.outDir, 'program_llvm_native.bin');
      let hostStdout: string[] = [];
      let hostPassed = false;
      let hostError: string | undefined;
      const hostStart = performance.now();

      if (runner.name.includes('clang')) {
        console.log(`   ⚙️ Assembling LLVM IR with ${runner.command} -O2...`);
        const buildRes = spawnSync(runner.command, ['-O2', llPath, '-lm', '-o', hostBin], {
          encoding: 'utf-8',
          timeout: 15000,
        });
        if (buildRes.status === 0 && fs.existsSync(hostBin)) {
          console.log(`   ⚙️ Executing native binary ${path.basename(hostBin)}...`);
          const runRes = spawnSync(hostBin, [], { encoding: 'utf-8', timeout: 10000 });
          hostStdout = runRes.stdout.split('\n');
          hostPassed = runRes.status === 0;
          if (!hostPassed) hostError = runRes.stderr;
        } else {
          hostError = buildRes.stderr || 'Clang failed to assemble LLVM IR';
        }
      } else if (runner.name.includes('lli')) {
        console.log(`   ⚙️ Executing LLVM IR with JIT ${runner.command}...`);
        const runRes = spawnSync(runner.command, [llPath], { encoding: 'utf-8', timeout: 10000 });
        hostStdout = runRes.stdout.split('\n');
        hostPassed = runRes.status === 0;
        if (!hostPassed) hostError = runRes.stderr;
      }

      const hostExecTime = Math.round(performance.now() - hostStart);
      const hostComp = compareOutput(hostStdout, expectedLines);
      results.push({
        target: 'llvm_native',
        runnerName: `${runner.name} (Native LLVM Toolchain)`,
        compiled: !hostError,
        executed: hostPassed,
        passed: hostPassed && hostComp.passed,
        stdout: hostStdout,
        compileTimeMs: llvmCompileTime,
        executionTimeMs: hostExecTime,
        error: hostError,
        diffLines: hostComp.diff,
      });

      if (hostPassed && hostComp.passed) {
        console.log(`   ✅ Native LLVM (${runner.name}): Output MATCHED expected baseline exactly (${hostExecTime}ms).`);
      } else {
        console.log(`   ❌ Native LLVM (${runner.name}) failed or mismatched:`);
        if (hostError) console.log(`      Error: ${hostError}`);
        hostComp.diff.forEach(d => console.log(`      ${d}`));
      }
    }
  }

  // --------------------------------------------------------------------------
  // C Native Backend Validation (C11)
  // --------------------------------------------------------------------------
  if (opts.backend === 'all' || opts.backend === 'c') {
    console.log(`\n🔥 [Stage 5] Testing C11 Native Backend...`);
    const cStart = performance.now();
    const cGen = new CCodeGenerator();
    const cCode = cGen.generate(ast, { target: 'c', standard: 'c11', includePrelude: true, includeMain: true });
    const cCompileTime = Math.round(performance.now() - cStart);
    const cPath = path.join(opts.outDir, 'program.c');
    fs.writeFileSync(cPath, cCode, 'utf-8');
    console.log(`   ✓ Generated ${cCode.split('\n').length} lines of standard C11 code (${cCompileTime}ms).`);

    if (toolchains.cCompilers.length > 0) {
      const cc = toolchains.cCompilers[0];
      const binPath = path.join(opts.outDir, 'program_c.bin');
      console.log(`   ⚙️ Compiling with ${cc.command} -std=c11 -O2...`);
      const ccStart = performance.now();
      const compRes = spawnSync(cc.command, ['-std=c11', '-O2', cPath, '-lm', '-o', binPath], {
        encoding: 'utf-8',
        timeout: 15000,
      });

      if (compRes.status === 0 && fs.existsSync(binPath)) {
        console.log(`   ⚙️ Executing native C binary ${path.basename(binPath)}...`);
        const execRes = spawnSync(binPath, [], { encoding: 'utf-8', timeout: 10000 });
        const execTime = Math.round(performance.now() - ccStart);
        const actualOut = execRes.stdout.split('\n');
        const cComp = compareOutput(actualOut, expectedLines);

        results.push({
          target: 'c',
          runnerName: `${cc.name} (C11 Native)`,
          compiled: true,
          executed: execRes.status === 0,
          passed: execRes.status === 0 && cComp.passed,
          exitCode: execRes.status ?? -1,
          stdout: actualOut,
          compileTimeMs: cCompileTime,
          executionTimeMs: execTime,
          diffLines: cComp.diff,
        });

        if (execRes.status === 0 && cComp.passed) {
          console.log(`   ✅ C11 Native Binary: Output MATCHED expected baseline exactly (${execTime}ms).`);
        } else {
          console.log(`   ❌ C11 Native Binary output mismatch:`);
          cComp.diff.forEach(d => console.log(`      ${d}`));
        }
      } else {
        const errMsg = compRes.stderr || 'Compilation error';
        console.log(`   ❌ C Compilation Failed: ${errMsg}`);
        results.push({
          target: 'c',
          runnerName: `${cc.name} (C11 Native)`,
          compiled: false,
          executed: false,
          passed: false,
          stdout: [],
          compileTimeMs: cCompileTime,
          executionTimeMs: 0,
          error: errMsg,
        });
      }
    } else {
      console.log(`   ℹ️ SKIPPED native C binary execution: No host C compiler (clang/gcc/cc) found on PATH.`);
      console.log(`      Install with: sudo apt-get install clang gcc (Linux) or brew install llvm (macOS).`);
      results.push({
        target: 'c',
        runnerName: 'C11 Code Generator',
        compiled: true,
        executed: false,
        passed: true,
        stdout: [],
        compileTimeMs: cCompileTime,
        executionTimeMs: 0,
        skippedReason: 'No host C compiler available on PATH',
      });
    }
  }

  // --------------------------------------------------------------------------
  // C++ Native Backend Validation (C++17)
  // --------------------------------------------------------------------------
  if (opts.backend === 'all' || opts.backend === 'cpp') {
    console.log(`\n💎 [Stage 6] Testing C++17 Native Backend...`);
    const cppStart = performance.now();
    const cGen = new CCodeGenerator();
    const cppCode = cGen.generate(ast, { target: 'cpp', standard: 'cpp17', includePrelude: true, includeMain: true });
    const cppCompileTime = Math.round(performance.now() - cppStart);
    const cppPath = path.join(opts.outDir, 'program.cpp');
    fs.writeFileSync(cppPath, cppCode, 'utf-8');
    console.log(`   ✓ Generated ${cppCode.split('\n').length} lines of standard C++17 code (${cppCompileTime}ms).`);

    if (toolchains.cppCompilers.length > 0) {
      const cxx = toolchains.cppCompilers[0];
      const binPath = path.join(opts.outDir, 'program_cpp.bin');
      console.log(`   ⚙️ Compiling with ${cxx.command} -std=c++17 -O2...`);
      const cxxStart = performance.now();
      const compRes = spawnSync(cxx.command, ['-std=c++17', '-O2', cppPath, '-o', binPath], {
        encoding: 'utf-8',
        timeout: 15000,
      });

      if (compRes.status === 0 && fs.existsSync(binPath)) {
        console.log(`   ⚙️ Executing native C++ binary ${path.basename(binPath)}...`);
        const execRes = spawnSync(binPath, [], { encoding: 'utf-8', timeout: 10000 });
        const execTime = Math.round(performance.now() - cxxStart);
        const actualOut = execRes.stdout.split('\n');
        const cppComp = compareOutput(actualOut, expectedLines);

        results.push({
          target: 'cpp',
          runnerName: `${cxx.name} (C++17 Native)`,
          compiled: true,
          executed: execRes.status === 0,
          passed: execRes.status === 0 && cppComp.passed,
          exitCode: execRes.status ?? -1,
          stdout: actualOut,
          compileTimeMs: cppCompileTime,
          executionTimeMs: execTime,
          diffLines: cppComp.diff,
        });

        if (execRes.status === 0 && cppComp.passed) {
          console.log(`   ✅ C++17 Native Binary: Output MATCHED expected baseline exactly (${execTime}ms).`);
        } else {
          console.log(`   ❌ C++17 Native Binary output mismatch:`);
          cppComp.diff.forEach(d => console.log(`      ${d}`));
        }
      } else {
        const errMsg = compRes.stderr || 'Compilation error';
        console.log(`   ❌ C++ Compilation Failed: ${errMsg}`);
        results.push({
          target: 'cpp',
          runnerName: `${cxx.name} (C++17 Native)`,
          compiled: false,
          executed: false,
          passed: false,
          stdout: [],
          compileTimeMs: cppCompileTime,
          executionTimeMs: 0,
          error: errMsg,
        });
      }
    } else {
      console.log(`   ℹ️ SKIPPED native C++ binary execution: No host C++ compiler (clang++/g++/c++) found on PATH.`);
      console.log(`      Install with: sudo apt-get install clang++ g++ (Linux) or brew install llvm (macOS).`);
      results.push({
        target: 'cpp',
        runnerName: 'C++17 Code Generator',
        compiled: true,
        executed: false,
        passed: true,
        stdout: [],
        compileTimeMs: cppCompileTime,
        executionTimeMs: 0,
        skippedReason: 'No host C++ compiler available on PATH',
      });
    }
  }

  // --------------------------------------------------------------------------
  // Summary Report Table
  // --------------------------------------------------------------------------
  console.log(`\n================================================================================`);
  console.log(`📊 Compiler Backend Validation Summary`);
  console.log(`================================================================================`);
  console.log(`Target / Engine                 | Gen/Build | Exec | Status`);
  console.log(`--------------------------------+-----------+------+----------------------------`);
  for (const r of results) {
    const targetCol = r.runnerName.padEnd(31);
    const buildCol = `${r.compileTimeMs}ms`.padEnd(9);
    const execCol = r.executed ? `${r.executionTimeMs}ms`.padEnd(4) : '-   ';
    let statusCol = '';
    if (r.skippedReason) {
      statusCol = `⚠️ SKIPPED (${r.skippedReason})`;
    } else if (r.passed) {
      statusCol = `✅ PASSED (Exact output match)`;
    } else {
      statusCol = `❌ FAILED ${r.error ? `(${r.error.slice(0, 30)})` : ''}`;
    }
    console.log(`${targetCol} | ${buildCol} | ${execCol} | ${statusCol}`);
  }
  console.log(`================================================================================`);

  const activeFailures = results.filter(r => !r.passed);
  if (activeFailures.length === 0) {
    console.log(`🎉 ALL ACTIVE TARGETS PASSED AND MATCHED EXPECTED OUTPUT!\n`);
    return true;
  } else {
    console.log(`❌ ${activeFailures.length} COMPILER TARGET(S) FAILED VALIDATION.\n`);
    return false;
  }
}

// Direct CLI execution
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.endsWith('test_native_harness.ts')) {
  const success = runNativeHarness();
  process.exit(success ? 0 : 1);
}
