// ============================================================================
// TypeLang CLI - Command: run
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Command, CommandContext } from '../types';
import { Lexer } from '../../lang/lexer';
import { Parser } from '../../lang/parser';
import { TypeChecker } from '../../lang/checker';
import { CoreLowerer } from '../../lang/core_lower';
import { CoreLLVMCodeGen } from '../../lang/core_codegen_llvm';
import { LLVMIRGenerator } from '../../lang/codegen_llvm';
import { LLVMInterpreter } from '../../lang/llvm_interpreter';
import { Evaluator } from '../../lang/evaluator';
import { printDiagnostics, icons, formatTime } from '../terminal';

export const runCommand: Command = {
  name: 'run',
  aliases: ['r', 'exec'],
  description: 'Compile and immediately execute TypeLang code or an inline expression',
  usage: 'typelang run [file.tl] [options]',
  examples: [
    'typelang run main.tl',
    'typelang run main.tl --engine llvm --pipeline core',
    'typelang run -e "println(21 * 2);"',
    'typelang run main.tl --engine js'
  ],
  options: [
    {
      name: 'eval',
      short: 'e',
      type: 'string',
      description: 'Evaluate inline TypeLang source code string directly'
    },
    {
      name: 'engine',
      type: 'string',
      default: 'llvm',
      choices: ['llvm', 'js'],
      description: 'Execution engine: "llvm" (SSA interpreter) or "js" (tree-walking evaluator)'
    },
    {
      name: 'pipeline',
      short: 'p',
      type: 'string',
      default: 'core',
      choices: ['core', 'legacy'],
      description: 'LLVM lowering pipeline: "core" or "legacy"'
    },
    {
      name: 'time',
      type: 'boolean',
      description: 'Print compilation and execution timings'
    }
  ],
  async execute(ctx: CommandContext): Promise<number> {
    const inlineCode = ctx.flags.eval ? String(ctx.flags.eval) : undefined;
    const filePath = ctx.args[0];

    let sourceCode = '';
    let filename = '<eval>';

    if (inlineCode) {
      sourceCode = inlineCode;
    } else if (filePath) {
      const resolvedPath = path.resolve(ctx.cwd, filePath);
      if (!fs.existsSync(resolvedPath)) {
        console.error(chalk.red(`${icons.error} Error: File not found: ${filePath}`));
        return 1;
      }
      sourceCode = fs.readFileSync(resolvedPath, 'utf8');
      filename = path.basename(resolvedPath);
    } else {
      console.error(chalk.red(`${icons.error} Error: Must provide a file to run or inline code via -e.`));
      console.log(chalk.dim(`Usage: ${this.usage}`));
      return 1;
    }

    const engine = String(ctx.flags.engine || 'llvm').toLowerCase();
    const pipeline = String(ctx.flags.pipeline || 'core').toLowerCase();
    const showTiming = Boolean(ctx.flags.time);

    const totalStart = performance.now();

    try {
      // 1. Lex & Parse
      const lexer = new Lexer(sourceCode);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parseProgram();

      // 2. Type Check
      const checker = new TypeChecker();
      checker.checkProgram(ast);

      const errors = checker.diagnostics.filter(d => d.severity === 'error');
      if (errors.length > 0) {
        printDiagnostics(checker.diagnostics, sourceCode, filename);
        console.error(chalk.red(`\n${icons.error} Run aborted due to type errors.`));
        return 1;
      }

      if (engine === 'js') {
        const evaluator = new Evaluator();
        const logs: string[] = [];
        const origLog = console.log;
        console.log = (...args: any[]) => {
          logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
        };

        try {
          evaluator.evaluateProgram(ast);
        } finally {
          console.log = origLog;
        }

        for (const line of logs) {
          process.stdout.write(line + '\n');
        }

        if (showTiming) {
          console.log(chalk.dim(`\nFinished in ${formatTime(performance.now() - totalStart)}`));
        }
        return 0;
      }

      // Default LLVM execution
      let llvmIR = '';
      if (pipeline === 'core') {
        const lowerer = new CoreLowerer();
        const coreProgram = lowerer.lower(ast);
        const codegen = new CoreLLVMCodeGen();
        llvmIR = codegen.generate(coreProgram);
      } else {
        const generator = new LLVMIRGenerator();
        llvmIR = generator.generate(ast);
      }

      const interpreter = new LLVMInterpreter();
      const execResult = interpreter.execute(llvmIR);

      if (execResult.stdout && execResult.stdout.length > 0) {
        for (const line of execResult.stdout) {
          process.stdout.write(line + '\n');
        }
      }

      if (execResult.error) {
        console.error(chalk.red(`${icons.error} Runtime error: ${execResult.error}`));
        return execResult.exitCode || 1;
      }

      if (showTiming) {
        console.log(chalk.dim(`\nFinished in ${formatTime(performance.now() - totalStart)} (exit code: ${execResult.exitCode})`));
      }

      return execResult.exitCode || 0;
    } catch (err: any) {
      console.error(chalk.red(`${icons.error} Execution failed: ${err.message || String(err)}`));
      return 1;
    }
  }
};
