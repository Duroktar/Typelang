import { EXAMPLES, ExampleProgram } from '../src/lang/examples';
import { Lexer } from '../src/lang/lexer';
import { Parser } from '../src/lang/parser';
import { LLVMIRGenerator } from '../src/lang/codegen_llvm';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Browser / UI categories and IDs
const BROWSER_CATEGORIES = new Set([
  'Web & Frontend',
  'Web Applications',
  'Graphics & Canvas',
  'Scientific Computing',
  'Games & Interactive',
  'Simulation & Automata',
  'Graphics & Shaders',
  'Audio & DSP',
  'Finance & Time Series',
  'Algorithms & Games',
  'Artificial Life & Flocking',
]);

const BROWSER_EXAMPLE_IDS = new Set([
  '08_web_dom_vdom',
  '10_interactive_todo_app',
  '11_interactive_canvas_swarm',
  '12_scientific_calculator',
  '14_royal_blackjack_gadt',
  '15_ffi_confetti',
  '18_interactive_game_of_life',
  '20_ray_marching_3d_sdf',
  '21_retro_chiptune_synth',
  '22_stock_ticker_technical_indicators',
  '23_pathfinding_dungeon_maze',
  '24_boids_flocking_engine',
]);

export function isNonBrowserExample(ex: ExampleProgram): boolean {
  if (BROWSER_EXAMPLE_IDS.has(ex.id)) return false;
  // Check category
  if (BROWSER_CATEGORIES.has(ex.category)) return false;
  return true;
}

export interface LLVMAsResult {
  example: ExampleProgram;
  isNonBrowser: boolean;
  passed: boolean;
  irLinesCount: number;
  output?: string;
  error?: string;
  llvmAsStdout?: string;
  llvmAsStderr?: string;
}

export function findLLVMAsBinary(): string | null {
  const possibleCommands = [
    'llvm-as',
    'llvm-as-19',
    'llvm-as-18',
    'llvm-as-17',
    'llvm-as-16',
    'llvm-as-15',
    'llvm-as-14',
    '/usr/bin/llvm-as',
    '/usr/lib/llvm-19/bin/llvm-as',
    '/usr/lib/llvm-18/bin/llvm-as',
    '/usr/lib/llvm-17/bin/llvm-as',
    '/usr/lib/llvm-16/bin/llvm-as',
    '/usr/lib/llvm-15/bin/llvm-as',
    '/usr/lib/llvm-14/bin/llvm-as',
  ];

  for (const cmd of possibleCommands) {
    const res = spawnSync(cmd, ['--version'], { encoding: 'utf-8' });
    if (res.status === 0) {
      return cmd;
    }
  }
  return null;
}

export function runLLVMAsSuite(options: { nonBrowserOnly?: boolean } = { nonBrowserOnly: true }): {
  total: number;
  passed: number;
  failed: number;
  results: LLVMAsResult[];
  llvmAsBin: string;
} {
  const llvmAsBin = findLLVMAsBinary();
  if (!llvmAsBin) {
    throw new Error(
      'llvm-as binary not found on the system. Please ensure LLVM is installed (e.g. apt-get install llvm).'
    );
  }

  const versionOutput = spawnSync(llvmAsBin, ['--version'], { encoding: 'utf-8' }).stdout.trim();
  console.log(`🔧 Using LLVM Assembler: ${llvmAsBin}`);
  console.log(`📌 Version: ${versionOutput.split('\n')[0]}\n`);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llvm-as-test-'));
  const llvmGen = new LLVMIRGenerator();
  const results: LLVMAsResult[] = [];

  const targetExamples = options.nonBrowserOnly 
    ? EXAMPLES.filter(isNonBrowserExample)
    : EXAMPLES;

  console.log(`🚀 Testing ${targetExamples.length} ${options.nonBrowserOnly ? 'non-browser ' : ''}examples against llvm-as:\n`);

  for (const ex of targetExamples) {
    const isNonBrowser = isNonBrowserExample(ex);
    const sourceCode = ex.files && ex.files.length > 0
      ? ex.files.map(f => `// File: ${f.name}\n${f.content}`).join('\n\n')
      : (ex.code || '');

    try {
      const lexer = new Lexer(sourceCode);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parseProgram();

      const llvmIR = llvmGen.generate(ast);
      const irFile = path.join(tmpDir, `${ex.id}.ll`);
      const bcFile = path.join(tmpDir, `${ex.id}.bc`);
      fs.writeFileSync(irFile, llvmIR, 'utf-8');

      // Run llvm-as
      const asRes = spawnSync(llvmAsBin, [irFile, '-o', bcFile], { encoding: 'utf-8' });

      if (asRes.status === 0 && fs.existsSync(bcFile)) {
        results.push({
          example: ex,
          isNonBrowser,
          passed: true,
          irLinesCount: llvmIR.split('\n').length,
          llvmAsStdout: asRes.stdout,
        });
        console.log(`  ✅ [${ex.id}] ${ex.name} -> Assembly OK (${llvmIR.split('\n').length} IR lines, ${fs.statSync(bcFile).size} bytes bitcode)`);
      } else {
        const stderr = asRes.stderr || asRes.stdout || 'Unknown error';
        results.push({
          example: ex,
          isNonBrowser,
          passed: false,
          irLinesCount: llvmIR.split('\n').length,
          llvmAsStderr: stderr,
          error: stderr,
        });
        console.error(`  ❌ [${ex.id}] ${ex.name} -> llvm-as syntax error:`);
        console.error(`     ${stderr.trim().split('\n').join('\n     ')}`);
      }
    } catch (err: any) {
      results.push({
        example: ex,
        isNonBrowser,
        passed: false,
        irLinesCount: 0,
        error: err.message,
      });
      console.error(`  ❌ [${ex.id}] ${ex.name} -> Compilation error: ${err.message}`);
    }
  }

  // Clean up temporary files
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {}

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`\n============================================================`);
  console.log(`📊 LLVM-AS Test Suite Summary:`);
  console.log(`   Total Non-Browser Examples Tested: ${results.length}`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`============================================================\n`);

  return {
    total: results.length,
    passed,
    failed,
    results,
    llvmAsBin,
  };
}

// If run directly as a script
if (process.argv[1]?.endsWith('test_llvm_as.ts')) {
  try {
    const outcome = runLLVMAsSuite({ nonBrowserOnly: true });
    if (outcome.failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err: any) {
    console.error('Fatal test error:', err.message);
    process.exit(1);
  }
}
