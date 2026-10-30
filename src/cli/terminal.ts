// ============================================================================
// TypeLang CLI - Terminal Formatting & Styling
// ============================================================================

import chalk from 'chalk';
import { Diagnostic } from '../lang/types';
import { formatAriadneDiagnostic } from '../lang/diagnostics';

export const icons = {
  success: chalk.green('✔'),
  error: chalk.red('✖'),
  warning: chalk.yellow('⚠'),
  info: chalk.cyan('ℹ'),
  arrow: chalk.blue('➜'),
  bullet: chalk.gray('•'),
  sparkle: chalk.magenta('✨'),
  gear: chalk.dim('⚙'),
};

export function banner(): string {
  return [
    chalk.bold.hex('#38bdf8')('  _______                     __                           '),
    chalk.bold.hex('#38bdf8')(' |_     _|_ _ .-----.-----.--|  |_.---.-.-----.-----.      '),
    chalk.bold.hex('#818cf8')('   |   | | | ||  _  |  -__|  _  | |  _  |     |  _  |      '),
    chalk.bold.hex('#c084fc')('   |___| |_  ||   __|_____|_____|_|___._|__|__|___  |      '),
    chalk.bold.hex('#c084fc')('         |___||__|                            |_____|      '),
    chalk.dim('   TypeLang Compiler (tlc) • Modern Typed Functional Language')
  ].join('\n');
}

export function printDiagnostics(diagnostics: Diagnostic[], sourceCode: string, filename: string = 'main.tl'): void {
  for (const diag of diagnostics) {
    const { ariadneReport } = formatAriadneDiagnostic(diag, sourceCode, filename);
    if (ariadneReport && ariadneReport.trim().length > 0) {
      console.log(ariadneReport);
    } else {
      const color = diag.severity === 'error' ? chalk.red : chalk.yellow;
      console.log(
        color(`[${diag.severity.toUpperCase()}] `) +
        chalk.bold(diag.message) +
        chalk.dim(` at ${filename}:${diag.line}:${diag.col}`)
      );
      if (diag.hint) {
        console.log(chalk.cyan(`  help: ${diag.hint}`));
      }
    }
  }
}

export function formatTime(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)}µs`;
  if (ms < 1000) return `${ms.toFixed(1)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function box(title: string, content: string): string {
  const lines = content.split('\n');
  const maxLen = Math.max(title.length, ...lines.map(l => l.replace(/\u001b\[\d+m/g, '').length)) + 4;
  const top = '┌─ ' + chalk.bold(title) + ' ' + '─'.repeat(Math.max(0, maxLen - title.length - 4)) + '┐';
  const bottom = '└' + '─'.repeat(maxLen - 2) + '┘';
  const padded = lines.map(l => {
    const visibleLen = l.replace(/\u001b\[\d+m/g, '').length;
    return `│ ${l}${' '.repeat(Math.max(0, maxLen - visibleLen - 4))} │`;
  });
  return [top, ...padded, bottom].join('\n');
}
