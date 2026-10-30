// ============================================================================
// TypeLang CLI - Command: check
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Command, CommandContext } from '../types';
import { Lexer } from '../../lang/lexer';
import { Parser } from '../../lang/parser';
import { TypeChecker } from '../../lang/checker';
import { printDiagnostics, icons, formatTime } from '../terminal';

export const checkCommand: Command = {
  name: 'check',
  aliases: ['c'],
  description: 'Type-check and validate TypeLang source files without generating code',
  usage: 'typelang check <file.tl> [options]',
  examples: [
    'typelang check src/main.tl',
    'typelang check src/main.tl --strict',
    'typelang check src/main.tl --json'
  ],
  options: [
    {
      name: 'strict',
      short: 's',
      type: 'boolean',
      description: 'Treat warnings as errors'
    },
    {
      name: 'json',
      type: 'boolean',
      description: 'Output diagnostics in JSON format for IDE/CI tooling'
    },
    {
      name: 'dump-ast',
      type: 'boolean',
      description: 'Print AST structure on successful parse'
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
    const startTime = performance.now();

    try {
      const lexer = new Lexer(sourceCode);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parseProgram();

      const checker = new TypeChecker();
      checker.checkProgram(ast);

      const isStrict = Boolean(ctx.flags.strict);
      const isJson = Boolean(ctx.flags.json);
      const dumpAst = Boolean(ctx.flags['dump-ast']);

      const errors = checker.diagnostics.filter(d => d.severity === 'error');
      const warnings = checker.diagnostics.filter(d => d.severity === 'warning');

      if (isJson) {
        console.log(JSON.stringify({
          file: resolvedPath,
          passed: errors.length === 0 && (!isStrict || warnings.length === 0),
          diagnostics: checker.diagnostics
        }, null, 2));
        return errors.length > 0 || (isStrict && warnings.length > 0) ? 1 : 0;
      }

      if (dumpAst) {
        console.log(JSON.stringify(ast, null, 2));
      }

      if (checker.diagnostics.length > 0) {
        printDiagnostics(checker.diagnostics, sourceCode, filename);
      }

      const elapsed = formatTime(performance.now() - startTime);

      if (errors.length > 0 || (isStrict && warnings.length > 0)) {
        console.log(
          chalk.red(`\n${icons.error} Check failed with ${errors.length} error(s) and ${warnings.length} warning(s) [${elapsed}].`)
        );
        return 1;
      }

      const warnNotice = warnings.length > 0 ? chalk.yellow(` (${warnings.length} warning${warnings.length > 1 ? 's' : ''})`) : '';
      console.log(
        chalk.green(`${icons.success} Checked `) +
        chalk.bold(filename) +
        chalk.dim(` (${tokens.length} tokens, ${ast.statements.length} top-level decls) in ${elapsed}${warnNotice}`)
      );
      return 0;
    } catch (err: any) {
      console.error(chalk.red(`${icons.error} Parse error: ${err.message || String(err)}`));
      return 1;
    }
  }
};
