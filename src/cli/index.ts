// ============================================================================
// TypeLang Compiler CLI (tlc / typelang)
// Main CLI Entry Point & Command Dispatcher
// ============================================================================

import chalk from 'chalk';
import { cliRegistry } from './registry';
import { parseArgs } from './args';
import { CommandContext } from './types';

// Import standard commands
import { checkCommand } from './commands/check';
import { buildCommand } from './commands/build';
import { runCommand } from './commands/run';
import { coreCommand } from './commands/core';
import { formatCommand } from './commands/format';
import { replCommand } from './commands/repl';
import { docsCommand } from './commands/docs';
import { examplesCommand } from './commands/examples';
import { versionCommand } from './commands/version';
import { helpCommand } from './commands/help';

// Register standard commands
cliRegistry
  .register(checkCommand)
  .register(buildCommand)
  .register(runCommand)
  .register(coreCommand)
  .register(formatCommand)
  .register(replCommand)
  .register(docsCommand)
  .register(examplesCommand)
  .register(versionCommand)
  .register(helpCommand);

export { cliRegistry };

export async function runCli(argv: string[] = process.argv.slice(2)): Promise<number> {
  // Check for immediate version or help flags
  if (argv.includes('--version') || argv.includes('-v')) {
    const ctx: CommandContext = {
      args: [],
      flags: {},
      rawArgs: argv,
      cwd: process.cwd(),
      log: console.log,
      error: console.error,
      warn: console.warn,
      exit: process.exit
    };
    await versionCommand.execute(ctx);
    return 0;
  }

  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    if (argv.length === 0) {
      // If no arguments and stdout is a terminal, launch REPL or display help
      const ctx: CommandContext = {
        args: [],
        flags: {},
        rawArgs: argv,
        cwd: process.cwd(),
        log: console.log,
        error: console.error,
        warn: console.warn,
        exit: process.exit
      };
      await helpCommand.execute(ctx);
      return 0;
    }
  }

  const parsed = parseArgs(argv);
  const commandName = parsed.command;

  // If commandName is not a registered command, but looks like a .tl file, default to 'run'
  if (commandName && !cliRegistry.has(commandName) && (commandName.endsWith('.tl') || commandName.endsWith('.typelang'))) {
    const runCmd = cliRegistry.get('run')!;
    const ctx: CommandContext = {
      args: [commandName, ...parsed.args],
      flags: parsed.flags,
      rawArgs: argv,
      cwd: process.cwd(),
      log: console.log,
      error: console.error,
      warn: console.warn,
      exit: process.exit
    };
    const exitCode = await runCmd.execute(ctx);
    return typeof exitCode === 'number' ? exitCode : 0;
  }

  // If -e inline eval is passed without command
  if (!commandName && (parsed.flags.eval || parsed.flags.e)) {
    const runCmd = cliRegistry.get('run')!;
    const ctx: CommandContext = {
      args: parsed.args,
      flags: parsed.flags,
      rawArgs: argv,
      cwd: process.cwd(),
      log: console.log,
      error: console.error,
      warn: console.warn,
      exit: process.exit
    };
    const exitCode = await runCmd.execute(ctx);
    return typeof exitCode === 'number' ? exitCode : 0;
  }

  if (!commandName) {
    const ctx: CommandContext = {
      args: [],
      flags: parsed.flags,
      rawArgs: argv,
      cwd: process.cwd(),
      log: console.log,
      error: console.error,
      warn: console.warn,
      exit: process.exit
    };
    await helpCommand.execute(ctx);
    return 0;
  }

  const cmd = cliRegistry.get(commandName);
  if (!cmd) {
    console.error(chalk.red(`Unknown command: "${commandName}"`));
    console.log(chalk.dim('Run `typelang help` to see all available commands.'));
    return 1;
  }

  // Check if subcommand requested help (e.g. `typelang build --help`)
  if (parsed.flags.help || parsed.flags.h) {
    const helpCtx: CommandContext = {
      args: [cmd.name],
      flags: {},
      rawArgs: argv,
      cwd: process.cwd(),
      log: console.log,
      error: console.error,
      warn: console.warn,
      exit: process.exit
    };
    await helpCommand.execute(helpCtx);
    return 0;
  }

  // Re-parse with command options config to ensure correct flag types
  const specializedParsed = parseArgs(argv.slice(1), cmd.options || []);

  const ctx: CommandContext = {
    args: specializedParsed.positional,
    flags: { ...parsed.flags, ...specializedParsed.flags },
    rawArgs: argv,
    cwd: process.cwd(),
    log: console.log,
    error: console.error,
    warn: console.warn,
    exit: process.exit
  };

  try {
    const exitCode = await cmd.execute(ctx);
    return typeof exitCode === 'number' ? exitCode : 0;
  } catch (err: any) {
    console.error(chalk.red(`Command error: ${err.message || String(err)}`));
    return 1;
  }
}

// Auto-run when executed directly as script
if (typeof process !== 'undefined' && process.argv && process.argv[1]) {
  const arg1 = process.argv[1];
  const isDirectEntry =
    arg1.endsWith('index.ts') ||
    arg1.endsWith('index.js') ||
    arg1.includes('typelang') ||
    arg1.includes('tlc');

  if (isDirectEntry) {
    runCli().then((code) => {
      if (code !== 0) {
        process.exit(code);
      }
    }).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  }
}
