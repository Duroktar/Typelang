// ============================================================================
// TypeLang CLI - Command Line Argument Parser
// ============================================================================

import { ParsedArgs, CommandOption } from './types';

export function parseArgs(rawArgs: string[], optionsConfig: CommandOption[] = []): ParsedArgs {
  const flags: Record<string, string | boolean | number> = {};
  const positional: string[] = [];

  // Index options by long name and short flag
  const optByLong = new Map<string, CommandOption>();
  const optByShort = new Map<string, CommandOption>();

  // Default common options recognized across compiler commands
  const defaultCommonOptions: CommandOption[] = [
    { name: 'eval', short: 'e', type: 'string', description: 'Inline code' },
    { name: 'output', short: 'o', type: 'string', description: 'Output path' },
    { name: 'target', short: 't', type: 'string', description: 'Target' },
    { name: 'pipeline', short: 'p', type: 'string', description: 'Pipeline' },
    { name: 'engine', type: 'string', description: 'Engine' },
    { name: 'help', short: 'h', type: 'boolean', description: 'Help' },
    { name: 'version', short: 'v', type: 'boolean', description: 'Version' },
  ];

  for (const opt of defaultCommonOptions) {
    optByLong.set(opt.name, opt);
    if (opt.short) optByShort.set(opt.short, opt);
  }

  for (const opt of optionsConfig) {
    optByLong.set(opt.name, opt);
    if (opt.short) {
      optByShort.set(opt.short, opt);
    }
    if (opt.default !== undefined) {
      flags[opt.name] = opt.default;
    }
  }

  let i = 0;
  while (i < rawArgs.length) {
    const arg = rawArgs[i];

    if (arg === '--') {
      // Everything after -- is positional
      positional.push(...rawArgs.slice(i + 1));
      break;
    }

    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=');
      let key: string;
      let val: string | undefined;

      if (eqIdx !== -1) {
        key = arg.slice(2, eqIdx);
        val = arg.slice(eqIdx + 1);
      } else {
        key = arg.slice(2);
      }

      const opt = optByLong.get(key);
      if (key.startsWith('no-')) {
        const negatedKey = key.slice(3);
        flags[negatedKey] = false;
      } else if (val !== undefined) {
        if (opt?.type === 'number') {
          flags[key] = Number(val);
        } else if (opt?.type === 'boolean') {
          flags[key] = val !== 'false';
        } else {
          flags[key] = val;
        }
      } else if (opt?.type === 'string' || opt?.type === 'number') {
        const nextArg = rawArgs[i + 1];
        if (nextArg !== undefined && !nextArg.startsWith('-')) {
          flags[key] = opt.type === 'number' ? Number(nextArg) : nextArg;
          i++;
        } else {
          flags[key] = '';
        }
      } else {
        // Default boolean flag
        flags[key] = true;
      }
    } else if (arg.startsWith('-') && arg.length > 1) {
      const shortChar = arg.slice(1);
      const opt = optByShort.get(shortChar);
      const key = opt ? opt.name : shortChar;

      if (opt?.type === 'string' || opt?.type === 'number') {
        const nextArg = rawArgs[i + 1];
        if (nextArg !== undefined && !nextArg.startsWith('-')) {
          flags[key] = opt.type === 'number' ? Number(nextArg) : nextArg;
          i++;
        } else {
          flags[key] = '';
        }
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }

    i++;
  }

  const command = positional[0];
  const args = positional.slice(1);

  return {
    command,
    args,
    positional,
    flags,
    raw: rawArgs
  };
}
