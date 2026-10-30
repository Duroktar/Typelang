// ============================================================================
// TypeLang CLI - Command: core
// ============================================================================

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { Command, CommandContext } from '../types';
import { Lexer } from '../../lang/lexer';
import { Parser } from '../../lang/parser';
import { TypeChecker } from '../../lang/checker';
import { CoreLowerer } from '../../lang/core_lower';
import { coreToString, CoreExpr, CoreProgram } from '../../lang/core';
import { printDiagnostics, icons } from '../terminal';

export const coreCommand: Command = {
  name: 'core',
  description: 'Lower TypeLang source code to Haskell-style Core Intermediate Representation',
  usage: 'typelang core [file.tl] [options]',
  examples: [
    'typelang core main.tl',
    'typelang core -e "let x = 10; x + 5"',
    'typelang core main.tl --stats'
  ],
  options: [
    {
      name: 'eval',
      short: 'e',
      type: 'string',
      description: 'Evaluate inline TypeLang source code string directly'
    },
    {
      name: 'stats',
      type: 'boolean',
      description: 'Display IR node distribution and statistic summary'
    },
    {
      name: 'no-check',
      type: 'boolean',
      description: 'Skip type checking before lowering'
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
      console.error(chalk.red(`${icons.error} Error: Must provide a file or inline expression via -e.`));
      console.log(chalk.dim(`Usage: ${this.usage}`));
      return 1;
    }

    try {
      const lexer = new Lexer(sourceCode);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parseProgram();

      if (!ctx.flags['no-check']) {
        const checker = new TypeChecker();
        checker.checkProgram(ast);
        const errors = checker.diagnostics.filter(d => d.severity === 'error');
        if (errors.length > 0) {
          printDiagnostics(checker.diagnostics, sourceCode, filename);
          console.error(chalk.red(`\n${icons.error} Core lowering aborted due to type errors.`));
          return 1;
        }
      }

      const lowerer = new CoreLowerer();
      const coreProg = lowerer.lower(ast);
      const formatted = coreToString(coreProg);

      console.log(formatted);

      if (ctx.flags.stats) {
        const stats = computeCoreStats(coreProg);
        console.log(chalk.dim('\n' + '─'.repeat(40)));
        console.log(chalk.bold.cyan('📊 TypeLang Core IR Statistics:'));
        console.log(`  Declarations:     ${stats.decls}`);
        console.log(`  Lambdas (λ):      ${stats.lambdas}`);
        console.log(`  Applications (@): ${stats.apps}`);
        console.log(`  Case / Matches:   ${stats.cases}`);
        console.log(`  Constructors:     ${stats.constructors}`);
        console.log(`  Let bindings:     ${stats.lets}`);
        console.log(chalk.dim('─'.repeat(40)));
      }

      return 0;
    } catch (err: any) {
      console.error(chalk.red(`${icons.error} Core lowering failed: ${err.message || String(err)}`));
      return 1;
    }
  }
};

function computeCoreStats(prog: CoreProgram) {
  let decls = prog.decls.length;
  let lambdas = 0;
  let apps = 0;
  let cases = 0;
  let constructors = 0;
  let lets = 0;

  function walk(expr: CoreExpr) {
    if (!expr) return;
    switch (expr.kind) {
      case 'e_lam':
        lambdas++;
        walk(expr.body);
        break;
      case 'e_app':
        apps++;
        walk(expr.fn);
        walk(expr.arg);
        break;
      case 'e_let':
        lets++;
        walk(expr.val);
        walk(expr.body);
        break;
      case 'e_case':
        cases++;
        walk(expr.scrutinee);
        for (const arm of expr.arms) {
          walk(arm.body);
        }
        if (expr.defaultArm) walk(expr.defaultArm);
        break;
      case 'e_con':
        constructors++;
        for (const arg of expr.args) walk(arg);
        break;
      case 'e_prim':
        for (const arg of expr.args) walk(arg);
        break;
      default:
        break;
    }
  }

  for (const d of prog.decls) {
    walk(d.body);
  }
  if (prog.mainExpr) {
    walk(prog.mainExpr);
  }

  return { decls, lambdas, apps, cases, constructors, lets };
}
