// ============================================================================
// TypeLang CLI - Command: examples
// ============================================================================

import chalk from 'chalk';
import { Command, CommandContext } from '../types';
import { EXAMPLES } from '../../lang/examples';
import { Lexer } from '../../lang/lexer';
import { Parser } from '../../lang/parser';
import { CoreLowerer } from '../../lang/core_lower';
import { CoreLLVMCodeGen } from '../../lang/core_codegen_llvm';
import { LLVMInterpreter } from '../../lang/llvm_interpreter';
import { icons } from '../terminal';

export const examplesCommand: Command = {
  name: 'examples',
  aliases: ['ex'],
  description: 'Explore, inspect, and run built-in TypeLang code examples',
  usage: 'typelang examples <list | cat <id> | run <id>>',
  examples: [
    'typelang examples list',
    'typelang examples cat 01',
    'typelang examples run 01'
  ],
  async execute(ctx: CommandContext): Promise<number> {
    const subAction = ctx.args[0] || 'list';
    const targetId = ctx.args[1];

    if (subAction === 'list') {
      console.log(chalk.bold.hex('#38bdf8')('📁 TypeLang Built-in Examples\n'));
      EXAMPLES.forEach((ex, idx) => {
        const numStr = String(idx + 1).padStart(2, '0');
        console.log(
          chalk.bold.green(`  [${numStr}] `) +
          chalk.white(ex.name) +
          chalk.dim(` (${ex.category || 'general'})`)
        );
      });
      console.log(chalk.dim('\nRun `typelang examples cat <number>` to view source code.'));
      console.log(chalk.dim('Run `typelang examples run <number>` to execute directly.'));
      return 0;
    }

    if (subAction === 'cat') {
      if (!targetId) {
        console.error(chalk.red(`${icons.error} Error: Specify example number or id (e.g. \`typelang examples cat 1\`)`));
        return 1;
      }

      const ex = findExample(targetId);
      if (!ex) {
        console.error(chalk.red(`${icons.error} Error: Example "${targetId}" not found.`));
        return 1;
      }

      console.log(chalk.bold.hex('#38bdf8')(`// Example: ${ex.name}\n`));
      const code = ex.files && ex.files.length > 0
        ? ex.files.map(f => `// File: ${f.name}\n${f.content}`).join('\n\n')
        : (ex.code || '');
      console.log(code);
      return 0;
    }

    if (subAction === 'run') {
      if (!targetId) {
        console.error(chalk.red(`${icons.error} Error: Specify example number or id (e.g. \`typelang examples run 1\`)`));
        return 1;
      }

      const ex = findExample(targetId);
      if (!ex) {
        console.error(chalk.red(`${icons.error} Error: Example "${targetId}" not found.`));
        return 1;
      }

      console.log(chalk.bold.hex('#38bdf8')(`🚀 Running Example: ${ex.name}...\n`));

      const code = ex.files && ex.files.length > 0
        ? ex.files.map(f => `// File: ${f.name}\n${f.content}`).join('\n\n')
        : (ex.code || '');

      try {
        const tokens = new Lexer(code).tokenize();
        const ast = new Parser(tokens).parseProgram();
        const coreProg = new CoreLowerer().lower(ast);
        const llvmIR = new CoreLLVMCodeGen().generate(coreProg);
        const interpreter = new LLVMInterpreter();
        const res = interpreter.execute(llvmIR);

        if (res.stdout && res.stdout.length > 0) {
          for (const line of res.stdout) {
            console.log(line);
          }
        }
        if (res.error) {
          console.error(chalk.red(`${icons.error} Error: ${res.error}`));
          return 1;
        }
        return res.exitCode || 0;
      } catch (err: any) {
        console.error(chalk.red(`${icons.error} Execution failed: ${err.message}`));
        return 1;
      }
    }

    console.error(chalk.red(`${icons.error} Unknown action "${subAction}". Valid actions: list, cat, run`));
    return 1;
  }
};

function findExample(id: string) {
  const num = parseInt(id, 10);
  if (!isNaN(num) && num >= 1 && num <= EXAMPLES.length) {
    return EXAMPLES[num - 1];
  }
  return EXAMPLES.find(e => e.id.toLowerCase() === id.toLowerCase() || e.name.toLowerCase().includes(id.toLowerCase()));
}
