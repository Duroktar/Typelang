// ============================================================================
// TypeLang CLI - Command: repl
// ============================================================================

import readline from 'readline';
import chalk from 'chalk';
import { Command, CommandContext } from '../types';
import { Lexer } from '../../lang/lexer';
import { Parser } from '../../lang/parser';
import { TypeChecker, createInitialEnv } from '../../lang/checker';
import { Evaluator, createInitialRuntimeEnv } from '../../lang/evaluator';
import { CoreLowerer } from '../../lang/core_lower';
import { coreToString } from '../../lang/core';
import { CoreLLVMCodeGen } from '../../lang/core_codegen_llvm';
import { LLVMInterpreter } from '../../lang/llvm_interpreter';
import { printDiagnostics, icons } from '../terminal';

export const replCommand: Command = {
  name: 'repl',
  aliases: ['interactive', 'i'],
  description: 'Launch an interactive TypeLang Read-Eval-Print Loop (REPL)',
  usage: 'typelang repl [options]',
  examples: [
    'typelang repl',
    'typelang repl --engine llvm',
    'typelang repl --engine js'
  ],
  options: [
    {
      name: 'engine',
      type: 'string',
      default: 'llvm',
      choices: ['llvm', 'js'],
      description: 'Execution engine: "llvm" (default) or "js"'
    }
  ],
  async execute(ctx: CommandContext): Promise<number> {
    const engine = String(ctx.flags.engine || 'llvm').toLowerCase();

    console.log(chalk.bold.hex('#38bdf8')('TypeLang Interactive REPL'));
    console.log(chalk.dim(`Engine: ${engine} | Type :help for commands, :quit to exit`));
    console.log('');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.bold.hex('#818cf8')('tl> ')
    });

    let buffer = '';
    const typeEnv = createInitialEnv();
    const runtimeEnv = createInitialRuntimeEnv();
    const evaluator = new Evaluator(runtimeEnv);
    const interpreter = new LLVMInterpreter();

    rl.prompt();

    return new Promise((resolve) => {
      rl.on('line', (line) => {
        const trimmed = line.trim();

        // Check REPL meta-commands
        if (buffer === '' && trimmed.startsWith(':')) {
          const [cmd, ...args] = trimmed.split(' ');
          const argStr = args.join(' ');

          switch (cmd.toLowerCase()) {
            case ':q':
            case ':quit':
            case ':exit':
              console.log(chalk.dim('Bye!'));
              rl.close();
              resolve(0);
              return;

            case ':help':
            case ':h':
              console.log(chalk.bold('REPL Commands:'));
              console.log('  :t, :type <expr>   Inspect the type of an expression');
              console.log('  :core <expr>       Show desugared Core IR representation');
              console.log('  :ast <expr>        Dump AST structure');
              console.log('  :clear, :reset     Reset the REPL session environment');
              console.log('  :q, :quit          Exit the REPL');
              break;

            case ':clear':
            case ':reset':
              console.log(chalk.dim('Session reset.'));
              break;

            case ':t':
            case ':type': {
              if (!argStr) {
                console.log(chalk.yellow('Usage: :type <expression>'));
              } else {
                try {
                  const pTokens = new Lexer(`let _it_ = ${argStr};`).tokenize();
                  const pAst = new Parser(pTokens).parseProgram();
                  const chk = new TypeChecker(typeEnv);
                  chk.checkProgram(pAst);
                  if (chk.diagnostics.filter(d => d.severity === 'error').length > 0) {
                    printDiagnostics(chk.diagnostics, `let _it_ = ${argStr};`, '<repl>');
                  } else {
                    const sym = chk.env.lookup('_it_');
                    if (sym) {
                      console.log(chalk.cyan(argStr) + chalk.dim(' : ') + chalk.bold.green(sym.type.name));
                    }
                  }
                } catch (e: any) {
                  console.error(chalk.red(`Error: ${e.message}`));
                }
              }
              break;
            }

            case ':core': {
              if (!argStr) {
                console.log(chalk.yellow('Usage: :core <expression>'));
              } else {
                try {
                  const pTokens = new Lexer(argStr).tokenize();
                  const pAst = new Parser(pTokens).parseProgram();
                  const cProg = new CoreLowerer().lower(pAst);
                  console.log(coreToString(cProg));
                } catch (e: any) {
                  console.error(chalk.red(`Error: ${e.message}`));
                }
              }
              break;
            }

            case ':ast': {
              if (!argStr) {
                console.log(chalk.yellow('Usage: :ast <expression>'));
              } else {
                try {
                  const pTokens = new Lexer(argStr).tokenize();
                  const pAst = new Parser(pTokens).parseProgram();
                  console.log(JSON.stringify(pAst, null, 2));
                } catch (e: any) {
                  console.error(chalk.red(`Error: ${e.message}`));
                }
              }
              break;
            }

            default:
              console.log(chalk.yellow(`Unknown REPL command "${cmd}". Type :help for commands.`));
          }

          rl.prompt();
          return;
        }

        // Multi-line continuation check
        buffer += (buffer ? '\n' : '') + line;

        // If open braces/parens, wait for continuation
        const openBraces = (buffer.match(/\{/g) || []).length;
        const closeBraces = (buffer.match(/\}/g) || []).length;
        if (openBraces > closeBraces) {
          rl.setPrompt(chalk.dim('... '));
          rl.prompt();
          return;
        }

        rl.setPrompt(chalk.bold.hex('#818cf8')('tl> '));

        const codeToRun = buffer.trim();
        buffer = '';

        if (!codeToRun) {
          rl.prompt();
          return;
        }

        try {
          // If input is an expression without semicolon, wrap into println if needed or run as is
          let parsedCode = codeToRun;
          if (!codeToRun.includes(';') && !codeToRun.includes('let ') && !codeToRun.includes('function ') && !codeToRun.includes('type ') && !codeToRun.includes('module ')) {
            parsedCode = `println(to_string(${codeToRun}));`;
          }

          const tokens = new Lexer(parsedCode).tokenize();
          const ast = new Parser(tokens).parseProgram();
          const checker = new TypeChecker(typeEnv);
          checker.checkProgram(ast);

          const errors = checker.diagnostics.filter(d => d.severity === 'error');
          if (errors.length > 0) {
            printDiagnostics(checker.diagnostics, parsedCode, '<repl>');
            rl.prompt();
            return;
          }

          if (engine === 'js') {
            const result = evaluator.evaluateProgram(ast);
            if (result !== undefined && result !== null) {
              console.log(chalk.dim('➜ ') + String(result));
            }
          } else {
            const lowerer = new CoreLowerer();
            const coreProg = lowerer.lower(ast);
            const codegen = new CoreLLVMCodeGen();
            const llvmIR = codegen.generate(coreProg);
            const res = interpreter.execute(llvmIR);
            if (res.stdout && res.stdout.length > 0) {
              for (const out of res.stdout) {
                console.log(out);
              }
            }
            if (res.error) {
              console.error(chalk.red(`Error: ${res.error}`));
            }
          }
        } catch (err: any) {
          console.error(chalk.red(`Parse error: ${err.message}`));
        }

        rl.prompt();
      });

      rl.on('close', () => {
        resolve(0);
      });
    });
  }
};
