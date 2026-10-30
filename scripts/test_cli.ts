// ============================================================================
// TypeLang CLI Automated Test Suite
// ============================================================================

import fs from 'fs';
import path from 'path';
import { runCli, cliRegistry } from '../src/cli/index';
import { Command, CommandContext } from '../src/cli/types';

console.log('🚀 Running TypeLang CLI Comprehensive Test Suite...\n');

let totalTests = 0;
let passedTests = 0;

async function test(name: string, fn: () => Promise<void>) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    console.error(`  ✗ ${name}:`, err.message || err);
    process.exit(1);
  }
}

function captureOutput(action: () => Promise<number | void>) {
  const stdout: string[] = [];
  const stderr: string[] = [];
  const origLog = console.log;
  const origErr = console.error;
  const origStdoutWrite = process.stdout.write;
  const origStderrWrite = process.stderr.write;

  console.log = (...args: any[]) => {
    stdout.push(args.map(a => String(a)).join(' '));
  };
  console.error = (...args: any[]) => {
    stderr.push(args.map(a => String(a)).join(' '));
  };
  process.stdout.write = (chunk: any) => {
    stdout.push(String(chunk));
    return true;
  };
  process.stderr.write = (chunk: any) => {
    stderr.push(String(chunk));
    return true;
  };

  return action().finally(() => {
    console.log = origLog;
    console.error = origErr;
    process.stdout.write = origStdoutWrite;
    process.stderr.write = origStderrWrite;
  }).then(code => ({ code, stdout: stdout.join(''), stderr: stderr.join('') }));
}

async function runSuite() {
  // 1. Version command
  await test('CLI displays version info', async () => {
    const res = await captureOutput(() => runCli(['--version']));
    if (!res.stdout.includes('TypeLang Compiler') || !res.stdout.includes('0.1.0')) {
      throw new Error(`Unexpected output: ${res.stdout}`);
    }
  });

  // 2. Help command
  await test('CLI displays help banner and command list', async () => {
    const res = await captureOutput(() => runCli(['--help']));
    if (!res.stdout.includes('COMMANDS:') || !res.stdout.includes('check') || !res.stdout.includes('build')) {
      throw new Error(`Help output missing commands: ${res.stdout}`);
    }
  });

  // 3. Subcommand help
  await test('CLI displays subcommand help', async () => {
    const res = await captureOutput(() => runCli(['help', 'build']));
    if (!res.stdout.includes('Compile TypeLang source code') || !res.stdout.includes('--target')) {
      throw new Error(`Subcommand help failed: ${res.stdout}`);
    }
  });

  // 4. Inline execution with run -e
  await test('CLI run executes inline expressions via Core/LLVM SSA pipeline', async () => {
    const res = await captureOutput(() => runCli(['run', '-e', 'println(to_string(42 * 2));']));
    if (!res.stdout.includes('84')) {
      throw new Error(`Expected '84' in output, got: ${res.stdout}`);
    }
  });

  // 5. Default run via shortcut -e
  await test('CLI executes inline expressions with top-level -e flag', async () => {
    const res = await captureOutput(() => runCli(['-e', 'println(to_string(10 + 32));']));
    if (!res.stdout.includes('42')) {
      throw new Error(`Expected '42' in output, got: ${res.stdout}`);
    }
  });

  // 6. Core command with stats
  await test('CLI core lowers to Haskell-style Core IR and displays stats', async () => {
    const res = await captureOutput(() => runCli(['core', '-e', 'let x = 10; x + 5', '--stats']));
    if (!res.stdout.includes('--- TypeLang Core IR Program ---') || !res.stdout.includes('TypeLang Core IR Statistics:')) {
      throw new Error(`Core IR output missing: ${res.stdout}`);
    }
  });

  // 7. Check command on temp files
  await test('CLI check validates valid TypeLang source files', async () => {
    const tmpFile = path.resolve(process.cwd(), '.scratch/valid_test.tl');
    fs.mkdirSync(path.dirname(tmpFile), { recursive: true });
    fs.writeFileSync(tmpFile, 'function add(a: number, b: number): number { return a + b; } let res = add(1, 2);', 'utf8');

    const res = await captureOutput(() => runCli(['check', tmpFile]));
    if (res.code !== 0 || !res.stdout.includes('Checked')) {
      throw new Error(`Check failed on valid file: ${res.stdout} ${res.stderr}`);
    }
  });

  // 8. Check command reports errors with Ariadne formatting
  await test('CLI check reports type errors with diagnostics', async () => {
    const tmpBadFile = path.resolve(process.cwd(), '.scratch/bad_test.tl');
    fs.mkdirSync(path.dirname(tmpBadFile), { recursive: true });
    fs.writeFileSync(tmpBadFile, 'let num: number = "not a number";', 'utf8');

    const res = await captureOutput(() => runCli(['check', tmpBadFile]));
    if (res.code !== 1) {
      throw new Error(`Expected check to fail with exit code 1, got: ${res.code}`);
    }
  });

  // 9. Build command with targets
  await test('CLI build compiles to LLVM IR, Core, C, and JS', async () => {
    const tmpFile = path.resolve(process.cwd(), '.scratch/build_test.tl');
    fs.writeFileSync(tmpFile, 'let x = 10; let y = 20;', 'utf8');

    const resLLVM = await captureOutput(() => runCli(['build', tmpFile, '--target', 'llvm']));
    if (!resLLVM.stdout.includes('define i32 @main()') && !resLLVM.stdout.includes('entry:')) {
      throw new Error(`LLVM codegen missing expected IR: ${resLLVM.stdout}`);
    }

    const resCore = await captureOutput(() => runCli(['build', tmpFile, '--target', 'core']));
    if (!resCore.stdout.includes('TypeLang Core IR')) {
      throw new Error(`Core codegen missing expected IR: ${resCore.stdout}`);
    }

    const resC = await captureOutput(() => runCli(['build', tmpFile, '--target', 'c']));
    if (!resC.stdout.includes('#include') && !resC.stdout.includes('int main(')) {
      throw new Error(`C codegen missing expected code: ${resC.stdout}`);
    }

    const resJS = await captureOutput(() => runCli(['build', tmpFile, '--target', 'js']));
    if (!resJS.stdout.includes('x = 10')) {
      throw new Error(`JS codegen missing expected code: ${resJS.stdout}`);
    }
  });

  // 10. Built-in Examples command
  await test('CLI examples list and run Example 1', async () => {
    const listRes = await captureOutput(() => runCli(['examples', 'list']));
    if (!listRes.stdout.includes('[01]') || !listRes.stdout.includes('GADT Expression Evaluator')) {
      throw new Error(`Examples list missing example 1: ${listRes.stdout}`);
    }

    const runRes = await captureOutput(() => runCli(['examples', 'run', '01']));
    if (!runRes.stdout.includes('21 + 21 = 42') || !runRes.stdout.includes('If true then 100 else 0 = 100')) {
      throw new Error(`Examples run failed: ${runRes.stdout}`);
    }
  });

  // 11. Docs command
  await test('CLI docs inspects stdlib modules and functions', async () => {
    const modRes = await captureOutput(() => runCli(['docs', 'Option']));
    if (!modRes.stdout.includes('Module: Option') || !modRes.stdout.includes('flatMap')) {
      throw new Error(`Docs Option failed: ${modRes.stdout}`);
    }

    const symRes = await captureOutput(() => runCli(['docs', 'println']));
    if (!symRes.stdout.includes('Built-in: println')) {
      throw new Error(`Docs println failed: ${symRes.stdout}`);
    }
  });

  // 12. Extensibility test: dynamic plugin registration
  await test('CLI is easily extensible with custom commands via cliRegistry', async () => {
    const customPluginCommand: Command = {
      name: 'hello-plugin',
      description: 'A custom user-defined compiler plugin command',
      usage: 'typelang hello-plugin [name]',
      execute(ctx: CommandContext) {
        const name = ctx.args[0] || 'TypeLang Developer';
        ctx.log(`Hello from custom plugin, ${name}!`);
        return 0;
      }
    };

    cliRegistry.register(customPluginCommand);
    if (!cliRegistry.has('hello-plugin')) {
      throw new Error('Failed to register custom plugin');
    }

    const pluginRes = await captureOutput(() => runCli(['hello-plugin', 'Alice']));
    if (!pluginRes.stdout.includes('Hello from custom plugin, Alice!')) {
      throw new Error(`Plugin output unexpected: ${pluginRes.stdout}`);
    }
  });

  console.log(`\n🎉 All ${passedTests}/${totalTests} CLI tests passed successfully!\n`);
}

runSuite().catch(err => {
  console.error('Fatal CLI test suite error:', err);
  process.exit(1);
});
