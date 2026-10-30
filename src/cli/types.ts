// ============================================================================
// TypeLang CLI - Command & Option Interfaces
// ============================================================================

export interface CommandOption {
  name: string;             // e.g. 'target'
  short?: string;           // e.g. 't'
  description: string;      // description shown in help
  type: 'boolean' | 'string' | 'number';
  default?: string | boolean | number;
  choices?: string[];       // valid choices if applicable
}

export interface ParsedArgs {
  command?: string;
  args: string[];
  positional: string[];
  flags: Record<string, string | boolean | number>;
  raw: string[];
}

export interface CommandContext {
  args: string[];
  flags: Record<string, string | boolean | number>;
  rawArgs: string[];
  cwd: string;
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  exit: (code?: number) => void;
}

export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  examples?: string[];
  options?: CommandOption[];
  execute(ctx: CommandContext): Promise<number | void> | number | void;
}
