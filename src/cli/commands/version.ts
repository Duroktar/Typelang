// ============================================================================
// TypeLang CLI - Command: version
// ============================================================================

import chalk from 'chalk';
import { Command, CommandContext } from '../types';

export const versionCommand: Command = {
  name: 'version',
  aliases: ['-v', '--version'],
  description: 'Display TypeLang compiler version and environment information',
  usage: 'typelang version',
  async execute(ctx: CommandContext): Promise<number> {
    console.log(chalk.bold.hex('#38bdf8')('TypeLang Compiler (tlc)'));
    console.log(`  Version:      ${chalk.bold('0.1.0')}`);
    console.log(`  Node:         ${process.version}`);
    console.log(`  Platform:     ${process.platform} (${process.arch})`);
    console.log(`  Pipeline:     Haskell-style Core IR ➜ LLVM SSA / Native / WebAssembly`);
    console.log(`  Backends:     ${chalk.cyan('llvm')}, ${chalk.cyan('core')}, ${chalk.cyan('c')}, ${chalk.cyan('js')}, ${chalk.cyan('wasm')}`);
    return 0;
  }
};
