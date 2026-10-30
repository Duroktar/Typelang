// ============================================================================
// TypeLang CLI - Command: help
// ============================================================================

import chalk from 'chalk';
import { Command, CommandContext } from '../types';
import { cliRegistry } from '../registry';
import { banner } from '../terminal';

export const helpCommand: Command = {
  name: 'help',
  aliases: ['-h', '--help'],
  description: 'Display help and command usage information',
  usage: 'typelang help [command]',
  examples: [
    'typelang help',
    'typelang help build',
    'typelang help run'
  ],
  async execute(ctx: CommandContext): Promise<number> {
    const targetName = ctx.args[0];

    if (targetName) {
      const cmd = cliRegistry.get(targetName);
      if (!cmd) {
        console.error(chalk.red(`Unknown command: "${targetName}"`));
        console.log(chalk.dim('Run `typelang help` to list all available commands.'));
        return 1;
      }

      console.log(chalk.bold.hex('#38bdf8')(`\nTypeLang Command: ${cmd.name}`));
      console.log(chalk.dim(cmd.description) + '\n');
      console.log(chalk.bold('Usage:'));
      console.log(`  ${chalk.cyan(cmd.usage)}\n`);

      if (cmd.aliases && cmd.aliases.length > 0) {
        console.log(chalk.bold('Aliases:'));
        console.log(`  ${cmd.aliases.join(', ')}\n`);
      }

      if (cmd.options && cmd.options.length > 0) {
        console.log(chalk.bold('Options:'));
        for (const opt of cmd.options) {
          const shortPart = opt.short ? `-${opt.short}, ` : '    ';
          const defaultPart = opt.default !== undefined ? chalk.dim(` (default: ${opt.default})`) : '';
          const choicesPart = opt.choices ? chalk.dim(` [choices: ${opt.choices.join(', ')}]`) : '';
          console.log(`  ${chalk.cyan(shortPart + '--' + opt.name.padEnd(16))} ${opt.description}${choicesPart}${defaultPart}`);
        }
        console.log('');
      }

      if (cmd.examples && cmd.examples.length > 0) {
        console.log(chalk.bold('Examples:'));
        for (const ex of cmd.examples) {
          console.log(`  ${chalk.dim('$')} ${chalk.white(ex)}`);
        }
        console.log('');
      }

      return 0;
    }

    console.log(banner());
    console.log('');
    console.log(chalk.bold('USAGE:'));
    console.log(`  ${chalk.cyan('typelang <command> [file.tl] [options]')}`);
    console.log(`  ${chalk.cyan('tlc <command> [file.tl] [options]')}\n`);

    console.log(chalk.bold('COMMANDS:'));
    const commands = cliRegistry.getAll();
    for (const cmd of commands) {
      const aliasStr = cmd.aliases ? chalk.dim(` (${cmd.aliases.join(', ')})`) : '';
      console.log(`  ${chalk.bold.green(cmd.name.padEnd(12))}${aliasStr.padEnd(10)} ${chalk.dim(cmd.description)}`);
    }

    console.log('');
    console.log(chalk.bold('GLOBAL FLAGS:'));
    console.log(`  ${chalk.cyan('-h, --help')}       Show help for command`);
    console.log(`  ${chalk.cyan('-v, --version')}    Show TypeLang version\n`);

    console.log(chalk.dim('Run `typelang help <command>` for detailed options and examples on any command.'));
    return 0;
  }
};
