// ============================================================================
// TypeLang CLI - Command: docs
// ============================================================================

import chalk from 'chalk';
import { Command, CommandContext } from '../types';
import { STDLIB_MODULES, getRootBuiltinDoc } from '../../lang/stdlibDocs';
import { icons } from '../terminal';

export const docsCommand: Command = {
  name: 'docs',
  aliases: ['doc'],
  description: 'Lookup TypeLang standard library modules, functions, and language documentation',
  usage: 'typelang docs [symbol_or_module]',
  examples: [
    'typelang docs',
    'typelang docs Option',
    'typelang docs Result',
    'typelang docs map'
  ],
  async execute(ctx: CommandContext): Promise<number> {
    const query = ctx.args[0];

    if (!query) {
      console.log(chalk.bold.hex('#38bdf8')('📚 TypeLang Standard Library Modules\n'));
      for (const mod of STDLIB_MODULES) {
        console.log(
          chalk.bold.green(`  ${mod.name.padEnd(16)} `) +
          chalk.dim(`[${mod.category}] `) +
          chalk.gray(mod.tagline)
        );
      }
      console.log(chalk.dim('\nRun `typelang docs <ModuleName>` to inspect functions and laws.'));
      return 0;
    }

    // Check exact module match
    const modMatch = STDLIB_MODULES.find(m => m.name.toLowerCase() === query.toLowerCase() || m.id.toLowerCase() === query.toLowerCase());
    if (modMatch) {
      console.log(chalk.bold.hex('#38bdf8')(`\n📦 Module: ${modMatch.name} (${modMatch.category})\n`));
      console.log(chalk.gray(modMatch.description) + '\n');

      if (modMatch.typeDefinition) {
        console.log(chalk.bold('Type Definition:'));
        console.log(chalk.cyan(modMatch.typeDefinition.trim()) + '\n');
      }

      if (modMatch.functions && modMatch.functions.length > 0) {
        console.log(chalk.bold(`Functions (${modMatch.functions.length}):`));
        for (const fn of modMatch.functions) {
          console.log(chalk.bold.green(`  ${fn.signature || fn.name}`));
          console.log(chalk.dim(`    ${fn.description}`));
          if (fn.example) {
            console.log(chalk.gray(`    Example: ${fn.example}`));
          }
          console.log('');
        }
      }

      if (modMatch.lawsDoc) {
        console.log(chalk.bold('Algebraic / Monadic Laws:'));
        for (const [law, desc] of Object.entries(modMatch.lawsDoc)) {
          if (desc) {
            console.log(chalk.cyan(`  • ${law}: `) + chalk.dim(desc));
          }
        }
        console.log('');
      }

      return 0;
    }

    // Check built-in functions
    const builtinDoc = getRootBuiltinDoc(query);
    if (builtinDoc) {
      console.log(chalk.bold.green(`\n⚙ Built-in: ${query}`));
      console.log(chalk.gray(builtinDoc.description));
      if (builtinDoc.signature) {
        console.log(chalk.cyan(`\nSignature: ${builtinDoc.signature}`));
      }
      return 0;
    }

    // Search across all module functions
    const matchingFns: { moduleName: string; fn: any }[] = [];
    for (const m of STDLIB_MODULES) {
      for (const fn of m.functions) {
        if (fn.name.toLowerCase().includes(query.toLowerCase()) || fn.description.toLowerCase().includes(query.toLowerCase())) {
          matchingFns.push({ moduleName: m.name, fn });
        }
      }
    }

    if (matchingFns.length > 0) {
      console.log(chalk.bold.hex('#38bdf8')(`\n🔍 Found ${matchingFns.length} result(s) for "${query}":\n`));
      for (const { moduleName, fn } of matchingFns) {
        console.log(chalk.bold.green(`  ${moduleName}.${fn.signature || fn.name}`));
        console.log(chalk.dim(`    ${fn.description}\n`));
      }
      return 0;
    }

    console.log(chalk.yellow(`${icons.warning} No documentation found for "${query}".`));
    console.log(chalk.dim('Run `typelang docs` to list all available standard library modules.'));
    return 1;
  }
};
