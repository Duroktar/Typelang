// ============================================================================
// TypeLang CLI - Extensible Command Registry
// ============================================================================

import { Command } from './types';

export class CommandRegistry {
  private commands = new Map<string, Command>();
  private aliases = new Map<string, string>();

  public register(command: Command): this {
    this.commands.set(command.name.toLowerCase(), command);
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.set(alias.toLowerCase(), command.name.toLowerCase());
      }
    }
    return this;
  }

  public get(nameOrAlias: string): Command | undefined {
    const key = nameOrAlias.toLowerCase();
    const primaryName = this.aliases.get(key) || key;
    return this.commands.get(primaryName);
  }

  public has(nameOrAlias: string): boolean {
    return this.get(nameOrAlias) !== undefined;
  }

  public getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  public getNames(): string[] {
    return Array.from(this.commands.keys());
  }
}

export const cliRegistry = new CommandRegistry();
