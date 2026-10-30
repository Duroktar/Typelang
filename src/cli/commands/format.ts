// ============================================================================
// TypeLang CLI - Command: fmt (format)
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Command, CommandContext } from '../types';
import { Formatter } from '../../lang/formatter';
import { icons } from '../terminal';

export const formatCommand: Command = {
  name: 'fmt',
  aliases: ['format'],
  description: 'Format TypeLang source files with standard idiomatic code style',
  usage: 'typelang fmt <file.tl...> [options]',
  examples: [
    'typelang fmt src/main.tl --write',
    'typelang fmt src/main.tl --check',
    'typelang fmt src/**/*.tl -w'
  ],
  options: [
    {
      name: 'write',
      short: 'w',
      type: 'boolean',
      description: 'Write formatted code directly to file in-place'
    },
    {
      name: 'check',
      type: 'boolean',
      description: 'Check if files are formatted without writing (exits with 1 if unformatted)'
    }
  ],
  async execute(ctx: CommandContext): Promise<number> {
    const files = ctx.args;
    if (files.length === 0) {
      console.error(chalk.red(`${icons.error} Error: No files specified to format.`));
      console.log(chalk.dim(`Usage: ${this.usage}`));
      return 1;
    }

    const isWrite = Boolean(ctx.flags.write);
    const isCheck = Boolean(ctx.flags.check);
    const formatter = new Formatter();

    let unformattedCount = 0;
    let formattedCount = 0;

    for (const file of files) {
      const resolved = path.resolve(ctx.cwd, file);
      if (!fs.existsSync(resolved)) {
        console.error(chalk.yellow(`${icons.warning} File not found: ${file}`));
        continue;
      }

      const content = fs.readFileSync(resolved, 'utf8');
      const formatted = formatter.format(content);

      if (content !== formatted) {
        unformattedCount++;
        if (isWrite) {
          fs.writeFileSync(resolved, formatted, 'utf8');
          console.log(chalk.green(`${icons.success} Formatted `) + chalk.bold(file));
          formattedCount++;
        } else if (isCheck) {
          console.log(chalk.red(`${icons.error} Needs formatting: `) + chalk.bold(file));
        } else {
          // stdout single file or print diff notice
          if (files.length === 1) {
            process.stdout.write(formatted);
            return 0;
          } else {
            console.log(chalk.yellow(`${icons.bullet} ${file} has formatting differences`));
          }
        }
      } else {
        if (!isCheck) {
          console.log(chalk.dim(`${icons.bullet} ${file} is already formatted`));
        }
      }
    }

    if (isCheck) {
      if (unformattedCount > 0) {
        console.error(chalk.red(`\n${icons.error} ${unformattedCount} file(s) need formatting.`));
        return 1;
      } else {
        console.log(chalk.green(`${icons.success} All files are properly formatted.`));
        return 0;
      }
    }

    return 0;
  }
};
