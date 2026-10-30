// ============================================================================
// TypeLang CLI - Command: build
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Command, CommandContext } from '../types';
import { Lexer } from '../../lang/lexer';
import { Parser } from '../../lang/parser';
import { TypeChecker } from '../../lang/checker';
import { CoreLowerer } from '../../lang/core_lower';
import { coreToString } from '../../lang/core';
import { CoreLLVMCodeGen } from '../../lang/core_codegen_llvm';
import { LLVMIRGenerator } from '../../lang/codegen_llvm';
import { CCodeGenerator } from '../../lang/codegen_c';
import { JSCodeGenerator } from '../../lang/codegen_js';
import { WasmCodeGenerator } from '../../lang/codegen_wasm';
import { printDiagnostics, icons, formatTime } from '../terminal';

export const buildCommand: Command = {
  name: 'build',
  aliases: ['compile', 'b'],
  description: 'Compile TypeLang source code to LLVM IR, Core IR, C, JavaScript, or WebAssembly',
  usage: 'typelang build <file.tl> [options]',
  examples: [
    'typelang build main.tl -o main.ll',
    'typelang build main.tl --target core',
    'typelang build main.tl --target c -o main.c',
    'typelang build main.tl --target js -o main.js',
    'typelang build main.tl --pipeline core --target llvm'
  ],
  options: [
    {
      name: 'target',
      short: 't',
      type: 'string',
      default: 'llvm',
      choices: ['llvm', 'core', 'c', 'js', 'wasm'],
      description: 'Compilation target backend (llvm, core, c, js, wasm)'
    },
    {
      name: 'pipeline',
      short: 'p',
      type: 'string',
      default: 'core',
      choices: ['core', 'legacy'],
      description: 'LLVM lowering pipeline: "core" (via Haskell-style Core IR) or "legacy"'
    },
    {
      name: 'output',
      short: 'o',
      type: 'string',
      description: 'Output file path (defaults to stdout if not specified)'
    },
    {
      name: 'emit-core',
      type: 'boolean',
      description: 'Emit intermediate Core IR alongside output'
    },
    {
      name: 'emit-tokens',
      type: 'boolean',
      description: 'Print token stream and exit'
    },
    {
      name: 'no-check',
      type: 'boolean',
      description: 'Skip type checking phase'
    }
  ],
  async execute(ctx: CommandContext): Promise<number> {
    const filePath = ctx.args[0];

    if (!filePath) {
      console.error(chalk.red(`${icons.error} Error: No input file specified.`));
      console.log(chalk.dim(`Usage: ${this.usage}`));
      return 1;
    }

    const resolvedPath = path.resolve(ctx.cwd, filePath);
    if (!fs.existsSync(resolvedPath)) {
      console.error(chalk.red(`${icons.error} Error: File not found: ${filePath}`));
      return 1;
    }

    const sourceCode = fs.readFileSync(resolvedPath, 'utf8');
    const filename = path.basename(resolvedPath);
    const target = String(ctx.flags.target || 'llvm').toLowerCase();
    const pipeline = String(ctx.flags.pipeline || 'core').toLowerCase();
    const outputPath = ctx.flags.output ? String(ctx.flags.output) : undefined;
    const emitCore = Boolean(ctx.flags['emit-core']);
    const emitTokens = Boolean(ctx.flags['emit-tokens']);
    const noCheck = Boolean(ctx.flags['no-check']);

    const startTime = performance.now();

    try {
      // 1. Lexing
      const lexer = new Lexer(sourceCode);
      const tokens = lexer.tokenize();

      if (emitTokens) {
        console.log(JSON.stringify(tokens, null, 2));
        return 0;
      }

      // 2. Parsing
      const parser = new Parser(tokens);
      const ast = parser.parseProgram();

      // 3. Type Checking
      if (!noCheck) {
        const checker = new TypeChecker();
        checker.checkProgram(ast);

        const errors = checker.diagnostics.filter(d => d.severity === 'error');
        if (errors.length > 0) {
          printDiagnostics(checker.diagnostics, sourceCode, filename);
          console.error(chalk.red(`\n${icons.error} Compilation aborted due to type errors.`));
          return 1;
        }
      }

      let generatedCode = '';

      // 4. Code Generation
      switch (target) {
        case 'core': {
          const lowerer = new CoreLowerer();
          const coreProgram = lowerer.lower(ast);
          generatedCode = coreToString(coreProgram);
          break;
        }

        case 'llvm': {
          if (pipeline === 'core') {
            const lowerer = new CoreLowerer();
            const coreProgram = lowerer.lower(ast);
            if (emitCore) {
              console.log(chalk.cyan('--- Core IR ---'));
              console.log(coreToString(coreProgram));
              console.log(chalk.cyan('---------------\n'));
            }
            const codegen = new CoreLLVMCodeGen();
            generatedCode = codegen.generate(coreProgram);
          } else {
            const generator = new LLVMIRGenerator();
            generatedCode = generator.generate(ast);
          }
          break;
        }

        case 'c': {
          const generator = new CCodeGenerator();
          generatedCode = generator.generate(ast);
          break;
        }

        case 'js': {
          const generator = new JSCodeGenerator();
          generatedCode = generator.generate(ast);
          break;
        }

        case 'wasm':
        case 'wat': {
          const generator = new WasmCodeGenerator();
          generatedCode = generator.generateWAT(ast);
          break;
        }

        default:
          console.error(chalk.red(`${icons.error} Unknown target: "${target}". Valid targets: llvm, core, c, js, wasm`));
          return 1;
      }

      const elapsed = formatTime(performance.now() - startTime);

      if (outputPath) {
        const dest = path.resolve(ctx.cwd, outputPath);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, generatedCode, 'utf8');
        console.log(
          chalk.green(`${icons.success} Compiled `) +
          chalk.bold(filename) +
          chalk.gray(' ➜ ') +
          chalk.bold.cyan(outputPath) +
          chalk.dim(` [target: ${target}, pipeline: ${pipeline}, ${elapsed}]`)
        );
      } else {
        process.stdout.write(generatedCode + '\n');
      }

      return 0;
    } catch (err: any) {
      console.error(chalk.red(`${icons.error} Compilation failed: ${err.message || String(err)}`));
      return 1;
    }
  }
};
