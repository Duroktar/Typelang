import { Lexer } from './lexer';
import { Parser } from './parser';
import { TypeChecker, TypeEnv, ScopeSymbol } from './checker';
import { typeToString, Type, TFun, TRec, TPoly, TCons, kindToString, prune } from './types';
import { typeParamToString } from './ast';
import { Formatter } from './formatter';

export interface HoverResult {
  contents: string[];
  word: string;
}

export interface TypeInspectionResult {
  symbol: string;
  typeString: string;
  category: 'function' | 'variable' | 'gadt' | 'constructor' | 'record' | 'module' | 'primitive' | 'alias' | 'builtin' | 'keyword' | 'unknown';
  signature: string;
  doc?: string;
  line?: number;
  col?: number;
  sourceContext?: string;
  details?: {
    params?: { name: string; type: string }[];
    returnType?: string;
    fields?: { name: string; type: string; isMut?: boolean; isOptional?: boolean }[];
    constructors?: { name: string; signature: string }[];
    typeParams?: string[];
    moduleExports?: { name: string; type: string }[];
  };
}

/**
 * Built-in Standard Library Hover Documentation Database
 */
const BUILTIN_HOVER_DB: Record<string, { signature: string; doc: string }> = {
  print: {
    signature: 'function print<T>(val: T): void',
    doc: 'Prints a value to the standard output without adding a trailing newline.'
  },
  println: {
    signature: 'function println<T>(val: T): void',
    doc: 'Prints a value to the standard output followed by a trailing newline.'
  },
  to_string: {
    signature: 'function to_string<T>(val: T): string',
    doc: 'Converts any value (number, boolean, record, tuple) into its canonical string representation.'
  },
  concat: {
    signature: 'function concat(a: string, b: string): string',
    doc: 'Concatenates two string values into a single string.'
  },
  array_len: {
    signature: 'function array_len<T>(arr: [T]): number',
    doc: 'Returns the number of elements contained in an array or tuple.'
  },
  array_map: {
    signature: 'function array_map<A, B>(arr: [A], fn: (x: A) => B): [B]',
    doc: 'Transforms each element in an array using a mapper function, returning a new array of transformed elements.'
  },
  array_filter: {
    signature: 'function array_filter<A>(arr: [A], predicate: (x: A) => boolean): [A]',
    doc: 'Filters array elements matching a boolean predicate function.'
  },
  array_reduce: {
    signature: 'function array_reduce<A, B>(arr: [A], initial: B, reducer: (acc: B, elem: A) => B): B',
    doc: 'Reduces an array to a single accumulated value using a reducer function.'
  },
  array_push: {
    signature: 'function array_push<A>(arr: [A], elem: A): [A]',
    doc: 'Appends an element to the end of an array, returning a new array.'
  },
  str_len: {
    signature: 'function str_len(s: string): number',
    doc: 'Returns the character length of a string.'
  },
  str_slice: {
    signature: 'function str_slice(s: string, start: number, end: number): string',
    doc: 'Extracts a substring slice from index `start` up to (excluding) `end`.'
  },
  str_split: {
    signature: 'function str_split(s: string, delimiter: string): [string]',
    doc: 'Splits a string by a delimiter into an array of string substrings.'
  },
  str_contains: {
    signature: 'function str_contains(s: string, substring: string): boolean',
    doc: 'Checks if a string contains a given substring.'
  },
  parse_int: {
    signature: 'function parse_int(s: string): number',
    doc: 'Parses an integer number from a string representation.'
  },
  parse_float: {
    signature: 'function parse_float(s: string): number',
    doc: 'Parses a floating-point number from a string representation.'
  },
  math_sqrt: {
    signature: 'function math_sqrt(x: number): number',
    doc: 'Returns the square root of a non-negative number.'
  },
  math_abs: {
    signature: 'function math_abs(x: number): number',
    doc: 'Returns the absolute value of a number.'
  },
  math_floor: {
    signature: 'function math_floor(x: number): number',
    doc: 'Rounds a floating point number down to the nearest integer.'
  },
  math_ceil: {
    signature: 'function math_ceil(x: number): number',
    doc: 'Rounds a floating point number up to the nearest integer.'
  },
  math_round: {
    signature: 'function math_round(x: number): number',
    doc: 'Rounds a number to the nearest integer.'
  },
  math_min: {
    signature: 'function math_min(a: number, b: number): number',
    doc: 'Returns the minimum of two numbers.'
  },
  math_max: {
    signature: 'function math_max(a: number, b: number): number',
    doc: 'Returns the maximum of two numbers.'
  },
  math_pow: {
    signature: 'function math_pow(base: number, exp: number): number',
    doc: 'Calculates `base` raised to the power of `exp`.'
  },
  math_random: {
    signature: 'function math_random(): number',
    doc: 'Generates a random floating-point number between 0 (inclusive) and 1 (exclusive).'
  },
  time_now: {
    signature: 'function time_now(): number',
    doc: 'Returns the current UNIX timestamp in milliseconds.'
  },
  // Modular Math.* methods
  sqrt: {
    signature: 'function Math.sqrt(x: number): number',
    doc: 'Returns the square root of a non-negative number.'
  },
  abs: {
    signature: 'function Math.abs(x: number): number',
    doc: 'Returns the absolute value of a number.'
  },
  floor: {
    signature: 'function Math.floor(x: number): number',
    doc: 'Rounds a number down to the nearest integer.'
  },
  ceil: {
    signature: 'function Math.ceil(x: number): number',
    doc: 'Rounds a number up to the nearest integer.'
  },
  round: {
    signature: 'function Math.round(x: number): number',
    doc: 'Rounds a number to the nearest integer value.'
  },
  min: {
    signature: 'function Math.min(a: number, b: number): number',
    doc: 'Returns the smaller of two numbers.'
  },
  max: {
    signature: 'function Math.max(a: number, b: number): number',
    doc: 'Returns the greater of two numbers.'
  },
  pow: {
    signature: 'function Math.pow(base: number, exp: number): number',
    doc: 'Returns `base` raised to the exponent `exp`.'
  },
  random: {
    signature: 'function Math.random(): number',
    doc: 'Generates a pseudo-random number in the range `[0, 1)`.'
  },
  // Modular Array.* methods
  len: {
    signature: 'function Array.len<T>(arr: [T]): number | function String.len(s: string): number',
    doc: 'Returns the length count of an array, tuple, or string.'
  },
  map: {
    signature: 'function Array.map<A, B>(arr: [A], fn: (x: A) => B): [B]',
    doc: 'Applies a transforming function to each element of the array.'
  },
  filter: {
    signature: 'function Array.filter<A>(arr: [A], predicate: (x: A) => boolean): [A]',
    doc: 'Returns a new array with all elements that satisfy the predicate function.'
  },
  reduce: {
    signature: 'function Array.reduce<A, B>(arr: [A], init: B, fn: (acc: B, elem: A) => B): B',
    doc: 'Accumulates array values from left to right using a reducer callback.'
  },
  push: {
    signature: 'function Array.push<A>(arr: [A], elem: A): [A]',
    doc: 'Returns a new array with the given element appended.'
  },
  slice: {
    signature: 'function Array.slice<A>(arr: [A], start: number, end: number): [A] | function String.slice(s: string, start: number, end: number): string',
    doc: 'Extracts a subsection of an array or string from `start` up to `end`.'
  },
  // Modular String.* methods
  split: {
    signature: 'function String.split(s: string, delimiter: string): [string]',
    doc: 'Divides a string into an ordered list of substrings separated by a delimiter.'
  },
  contains: {
    signature: 'function String.contains(s: string, substring: string): boolean',
    doc: 'Determines whether the string contains the characters of a specified string.'
  },
  parseInt: {
    signature: 'function String.parseInt(s: string): number',
    doc: 'Parses a string argument and returns an integer number.'
  },
  parseFloat: {
    signature: 'function String.parseFloat(s: string): number',
    doc: 'Parses a string argument and returns a floating-point number.'
  },
  // Modular DOM.* methods
  getElementById: {
    signature: 'function DOM.getElementById<T>(id: string): T',
    doc: 'Returns a reference to the element by its ID in the active DOM tree.'
  },
  createElement: {
    signature: 'function DOM.createElement<T>(tag: string): T',
    doc: 'Creates the HTML element specified by tagName.'
  },
  setText: {
    signature: 'function DOM.setText<T>(el: T, text: string): void',
    doc: 'Sets the text content of the specified DOM element.'
  },
  setHtml: {
    signature: 'function DOM.setHtml<T>(el: T, html: string): void',
    doc: 'Sets the raw HTML markup content of the specified element.'
  },
  setAttr: {
    signature: 'function DOM.setAttr<T>(el: T, attr: string, val: string): void',
    doc: 'Sets an attribute value on the target element.'
  },
  appendChild: {
    signature: 'function DOM.appendChild<P, C>(parent: P, child: C): void',
    doc: 'Adds a node to the end of the list of children of a specified parent node.'
  },
  addEventListener: {
    signature: 'function DOM.addEventListener<T, E>(el: T, event: string, handler: (e: E) => void): void',
    doc: 'Sets up a function that will be called whenever the specified event is delivered to the target.'
  },
  h: {
    signature: 'function DOM.h<P, C, V>(tag: string, props: P, children: C): V',
    doc: 'Virtual DOM hyperscript builder for declarative UI components.'
  },
  mount: {
    signature: 'function DOM.mount<C, V>(containerId: C, vnode: V): void',
    doc: 'Mounts a virtual DOM tree into a target container.'
  },
  // Modular Node.* methods
  stringify: {
    signature: 'function Node.stringify<T>(data: T): string',
    doc: 'Converts a TypeLang object or record into a valid JSON string.'
  },
  parse: {
    signature: 'function Node.parse<T>(jsonStr: string): T',
    doc: 'Parses a JSON string, constructing the TypeLang value or record described by the string.'
  },
  envGet: {
    signature: 'function Node.envGet(key: string): string',
    doc: 'Retrieves an environment variable value by key name.'
  },
  readFile: {
    signature: 'function Node.readFile(path: string): string',
    doc: 'Asynchronously or synchronously reads the entire contents of a file.'
  },
  writeFile: {
    signature: 'function Node.writeFile(path: string, content: string): void',
    doc: 'Writes data to the specified file path, replacing the file if it already exists.'
  },
  createApp: {
    signature: 'function Node.createApp<App>(): App',
    doc: 'Creates a new Express.js HTTP server instance.'
  },
  get: {
    signature: 'function Node.get<App, Req, Res>(app: App, path: string, handler: (req: Req, res: Res) => void): void',
    doc: 'Routes HTTP GET requests to the specified path with the specified callback functions.'
  },
  post: {
    signature: 'function Node.post<App, Req, Res>(app: App, path: string, handler: (req: Req, res: Res) => void): void',
    doc: 'Routes HTTP POST requests to the specified path with the specified callback functions.'
  },
  listen: {
    signature: 'function Node.listen<App>(app: App, port: number, onStart: () => void): void',
    doc: 'Binds and listens for incoming HTTP connections on the specified host and port.'
  }
};

/**
 * Keyword Language Reference Database
 */
const KEYWORD_HOVER_DB: Record<string, { title: string; doc: string }> = {
  let: {
    title: 'TypeLang Keyword: let',
    doc: 'Binds an immutable value or variable. Use `let mut` to allow variable reassignment.'
  },
  mut: {
    title: 'TypeLang Keyword: mut',
    doc: 'Marks a let variable binding or record field as mutable.'
  },
  type: {
    title: 'TypeLang Keyword: type',
    doc: 'Declares a type alias or Generalized Algebraic Data Type (GADT).'
  },
  function: {
    title: 'TypeLang Keyword: function',
    doc: 'Defines a top-level typed function. Supports parametric polymorphism with `<T1, T2>`.'
  },
  fn: {
    title: 'TypeLang Keyword: fn',
    doc: 'Defines an anonymous lambda function.'
  },
  match: {
    title: 'TypeLang Keyword: match',
    doc: 'Pattern matches on values, GADT constructors, tuples, records, and literals with pattern guards.'
  },
  module: {
    title: 'TypeLang Keyword: module',
    doc: 'Encapsulates types, functions, and let bindings within a named module scope.'
  },
  export: {
    title: 'TypeLang Keyword: export',
    doc: 'Exports a symbol or module to make it accessible to external modules or consumers.'
  },
  import: {
    title: 'TypeLang Keyword: import',
    doc: 'Imports exported symbols from a named module path.'
  },
  pack: {
    title: 'TypeLang Keyword: pack',
    doc: 'Packs a concrete witness type and value into an existential type abstraction (`∃a. T`).'
  },
  unpack: {
    title: 'TypeLang Keyword: unpack',
    doc: 'Unpacks an existential container into a hidden type variable and value.'
  },
  self: {
    title: 'TypeLang Keyword: self',
    doc: 'References the self record in recursive record type definitions.'
  },
  do: {
    title: 'TypeLang Keyword: do',
    doc: 'Initiates a monadic do-notation block for sequencing monadic computations with `x <- expr` bind statements, `let` bindings, and `pure` returns.'
  },
  where: {
    title: 'TypeLang Keyword: where',
    doc: 'Defines local bindings and auxiliary helper functions scoped to an expression or function declaration.'
  },
  pure: {
    title: 'TypeLang Keyword: pure',
    doc: 'Lifts a value into a monadic context inside do notation blocks (`pure expr` or `return expr`).'
  },
  extern: {
    title: 'TypeLang Keyword: extern',
    doc: 'Declares an external foreign JavaScript interface binding without implementation body.'
  },
  as: {
    title: 'TypeLang Keyword: as',
    doc: 'Aliases an imported module or renames an import specifier.'
  },
  if: {
    title: 'TypeLang Keyword: if',
    doc: 'Evaluates a boolean condition and executes a conditional branch.'
  },
  then: {
    title: 'TypeLang Keyword: then',
    doc: 'Introduces the true branch expression in a ternary or conditional form.'
  },
  else: {
    title: 'TypeLang Keyword: else',
    doc: 'Introduces the alternative fallback branch when an if condition evaluates to false.'
  },
  return: {
    title: 'TypeLang Keyword: return',
    doc: 'Returns a value from a function or early terminates execution.'
  },
  for: {
    title: 'TypeLang Keyword: for',
    doc: 'Iterates across a numeric range or array collection.'
  },
  while: {
    title: 'TypeLang Keyword: while',
    doc: 'Repeatedly executes a statement block while a boolean condition remains true.'
  },
  switch: {
    title: 'TypeLang Keyword: switch',
    doc: 'Evaluates an expression against multiple case value branches with a default fallback.'
  },
  case: {
    title: 'TypeLang Keyword: case',
    doc: 'Defines an arm variant condition within a switch statement.'
  },
  default: {
    title: 'TypeLang Keyword: default',
    doc: 'Defines the catch-all fallback arm in a switch statement.'
  },
  in: {
    title: 'TypeLang Keyword: in',
    doc: 'Specifies the target collection or iterable within a for loop.'
  },
  break: {
    title: 'TypeLang Keyword: break',
    doc: 'Terminates loop execution immediately.'
  },
  continue: {
    title: 'TypeLang Keyword: continue',
    doc: 'Skips the current loop iteration and advances to the next iteration.'
  }
};

/**
 * Extract word/identifier at a specific line and column from source code.
 */
export function getWordAtPosition(code: string, line: number, col: number): string | null {
  const lines = code.split('\n');
  const lineIdx = line - 1;
  if (lineIdx < 0 || lineIdx >= lines.length) return null;

  const lineText = lines[lineIdx];
  const colIdx = col - 1;
  if (colIdx < 0 || colIdx > lineText.length) return null;

  // Find boundaries of identifier around colIdx
  let start = colIdx;
  while (start > 0 && /[a-zA-Z0-9_]/.test(lineText[start - 1])) {
    start--;
  }

  let end = colIdx;
  while (end < lineText.length && /[a-zA-Z0-9_]/.test(lineText[end])) {
    end++;
  }

  if (start >= end) return null;
  return lineText.substring(start, end);
}

/**
 * Find the most specific ScopeSymbol matching an identifier name and cursor position.
 */
export function findMatchingSymbol(
  symbols: ScopeSymbol[],
  word: string,
  line: number,
  col: number
): ScopeSymbol | null {
  if (!symbols || symbols.length === 0) return null;

  // 1. Exact location match: symbol's declaration or occurrence site covers (line, col)
  const exactMatches = symbols.filter(s => {
    if (s.name !== word) return false;
    if (s.loc) {
      if (s.loc.line === line) {
        const startCol = s.loc.col;
        const endCol = s.loc.endCol || (startCol + s.name.length);
        if (col >= startCol && col <= endCol) {
          return true;
        }
      }
    }
    return false;
  });
  if (exactMatches.length > 0) {
    return exactMatches[0];
  }

  // 2. Lexical scope match: symbol's scope range encloses (line, col)
  const scopedMatches = symbols.filter(s => {
    if (s.name !== word) return false;
    if (s.scopeRange) {
      const inLineRange = line >= s.scopeRange.startLine && line <= s.scopeRange.endLine;
      if (!inLineRange) return false;
      if (line === s.scopeRange.startLine && col < s.scopeRange.startCol) return false;
      if (line === s.scopeRange.endLine && col > s.scopeRange.endCol) return false;
      return true;
    }
    return false;
  });

  if (scopedMatches.length > 0) {
    // Sort by smallest scope range (inner-most lexical scope first)
    scopedMatches.sort((a, b) => {
      const aSpan = (a.scopeRange!.endLine - a.scopeRange!.startLine) * 10000 + (a.scopeRange!.endCol - a.scopeRange!.startCol);
      const bSpan = (b.scopeRange!.endLine - b.scopeRange!.startLine) * 10000 + (b.scopeRange!.endCol - b.scopeRange!.startCol);
      return aSpan - bSpan;
    });
    return scopedMatches[0];
  }

  // 3. Declaration closest to the line (preceding or nearest)
  const nameMatches = symbols.filter(s => s.name === word);
  if (nameMatches.length > 0) {
    nameMatches.sort((a, b) => {
      const aLine = a.loc?.line || 0;
      const bLine = b.loc?.line || 0;
      const aPrecedes = aLine <= line;
      const bPrecedes = bLine <= line;
      if (aPrecedes && !bPrecedes) return -1;
      if (!aPrecedes && bPrecedes) return 1;
      return Math.abs(line - aLine) - Math.abs(line - bLine);
    });
    return nameMatches[0];
  }

  return null;
}

/**
 * Language Server Protocol (LSP) Mock Hover Provider
 * Analyzes source code and returns type hover information for any symbol.
 */
export interface DefinitionLocation {
  line: number;
  col: number;
  endLine?: number;
  endCol?: number;
}

export function getDefinitionLocation(code: string, line: number, col: number): DefinitionLocation | null {
  const word = getWordAtPosition(code, line, col);
  if (!word) return null;

  try {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parseProgram(true);
    const checker = new TypeChecker();
    checker.checkProgram(ast);

    const matchedSymbol = findMatchingSymbol(checker.symbols, word, line, col);
    if (matchedSymbol) {
      if (matchedSymbol.kind === 'reference' && matchedSymbol.scopeRange) {
        return {
          line: matchedSymbol.scopeRange.startLine,
          col: matchedSymbol.scopeRange.startCol,
          endLine: matchedSymbol.scopeRange.endLine,
          endCol: matchedSymbol.scopeRange.endCol
        };
      } else if (matchedSymbol.loc) {
        return {
          line: matchedSymbol.loc.line,
          col: matchedSymbol.loc.col,
          endLine: matchedSymbol.loc.endLine || matchedSymbol.loc.line,
          endCol: matchedSymbol.loc.endCol || (matchedSymbol.loc.col + word.length)
        };
      }
    }
  } catch {
    // Return null if parsing fails or symbol not found
  }
  return null;
}

export function getHoverInformation(code: string, line: number, col: number): HoverResult | null {
  const word = getWordAtPosition(code, line, col);
  if (!word) return null;

  const contents: string[] = [];

  // 1. Check Standard Library Built-ins
  if (BUILTIN_HOVER_DB[word]) {
    const builtin = BUILTIN_HOVER_DB[word];
    contents.push('```typelang\n' + builtin.signature + '\n```');
    contents.push('*Standard Library Function*');
    contents.push(builtin.doc);
    return { contents, word };
  }

  // 2. Check Keywords
  if (KEYWORD_HOVER_DB[word]) {
    const kw = KEYWORD_HOVER_DB[word];
    contents.push(`**${kw.title}**`);
    contents.push(kw.doc);
    return { contents, word };
  }

  // 3. Perform Compiler Type-Checking Symbol Lookup
  try {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parseProgram(true);
    const checker = new TypeChecker();
    const env = checker.checkProgram(ast);

    // Search in registered scoped symbols (function parameters, local variables, lambdas, patterns, etc.)
    const matchedSymbol = findMatchingSymbol(checker.symbols, word, line, col);
    if (matchedSymbol) {
      const typeStr = typeToString(matchedSymbol.type);
      if (matchedSymbol.kind === 'parameter') {
        const container = matchedSymbol.containerName ? ` of \`${matchedSymbol.containerName}\`` : '';
        contents.push('```typelang\n(parameter) ' + word + ': ' + typeStr + '\n```');
        contents.push(`*Function parameter${container}*`);
      } else if (matchedSymbol.kind === 'pattern') {
        contents.push('```typelang\n(pattern variable) ' + word + ': ' + typeStr + '\n```');
        contents.push('*Pattern-bound variable*');
      } else if (matchedSymbol.kind === 'loop') {
        contents.push('```typelang\n(loop variable) ' + word + ': ' + typeStr + '\n```');
        contents.push('*Loop iteration variable*');
      } else if (matchedSymbol.kind === 'variable') {
        const prefix = matchedSymbol.isMut ? 'let mut' : 'let';
        contents.push('```typelang\n' + prefix + ' ' + word + ': ' + typeStr + '\n```');
        contents.push(matchedSymbol.isExported ? '*Exported top-level variable*' : '*Local variable*');
      } else if (matchedSymbol.kind === 'function') {
        contents.push('```typelang\nfunction ' + word + ': ' + typeStr + '\n```');
        contents.push(matchedSymbol.isExported ? '*Exported function*' : '*Function definition*');
      } else {
        contents.push('```typelang\n' + matchedSymbol.kind + ' ' + word + ': ' + typeStr + '\n```');
      }

      if (matchedSymbol.doc) {
        contents.push(matchedSymbol.doc);
      }
      return { contents, word };
    }

    // Search in root environment variables
    if (env.vars.has(word)) {
      const type = env.vars.get(word)!;
      const typeStr = typeToString(type);
      contents.push('```typelang\nlet ' + word + ': ' + typeStr + '\n```');
      contents.push('*Inferred symbol type in global scope*');
      return { contents, word };
    }

    // Search in GADT type definitions
    if (env.gadts.has(word)) {
      const gadt = env.gadts.get(word)!;
      const params = gadt.typeParams.length > 0 ? `<${gadt.typeParams.map(tp => typeParamToString(tp)).join(', ')}>` : '';
      contents.push('```typelang\ntype ' + gadt.name + params + '\n```');
      contents.push(`**GADT Data Type** with ${gadt.constructors.length} constructor(s):`);
      gadt.constructors.forEach(c => {
        contents.push(`- \`${c.name}\``);
      });
      return { contents, word };
    }

    // Search GADT Constructors across all registered GADTs
    for (const [gadtName, gadt] of env.gadts.entries()) {
      const ctor = gadt.constructors.find(c => c.name === word);
      if (ctor) {
        const params = ctor.params.map(p => `${p.name}: ${Formatter.formatTypeAST(p.type)}`).join(', ');
        contents.push('```typelang\n' + ctor.name + '(' + params + '): ' + gadtName + '\n```');
        contents.push(`*GADT Constructor for type \`${gadtName}\`*`);
        return { contents, word };
      }
    }

    // Search Type Aliases
    if (env.typeAliases.has(word)) {
      const alias = env.typeAliases.get(word)!;
      const typeStr = typeToString(alias.type);
      const params = alias.typeParams.length > 0 ? `<${alias.typeParams.map(tp => typeParamToString(tp)).join(', ')}>` : '';
      contents.push('```typelang\ntype ' + word + params + ' = ' + typeStr + '\n```');
      contents.push(`*Type Alias Definition*`);
      return { contents, word };
    }

    // Search Modules
    if (env.modules.has(word)) {
      const mod = env.modules.get(word)!;
      contents.push('```typelang\nmodule ' + word + '\n```');
      contents.push(`**Module Scope** containing ${mod.vars.size} exported variable(s).`);
      return { contents, word };
    }
  } catch {
    // If parsing fails due to incomplete code, fallback graciously
  }

  // 4. Default Primitive Type Identifiers
  if (['number', 'boolean', 'string', 'void'].includes(word)) {
    contents.push(`\`\`\`typelang\nprimitive type ${word}\n\`\`\``);
    contents.push(`Built-in primitive type.`);
    return { contents, word };
  }

  return null;
}

/**
 * Extract tokens/identifiers from a given line of code for quick inspection chips.
 */
export function extractTokensFromLine(lineText: string): string[] {
  if (!lineText) return [];
  // Match identifiers, including keywords and symbols
  const matches = lineText.match(/[a-zA-Z_][a-zA-Z0-9_]*/g);
  if (!matches) return [];
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const m of matches) {
    if (!seen.has(m)) {
      seen.add(m);
      tokens.push(m);
    }
  }
  return tokens;
}

/**
 * Deep inspection of a type to extract parameter breakdown, fields, return types, etc.
 */
function extractTypeDetails(type: Type): {
  category: TypeInspectionResult['category'];
  typeString: string;
  signature: string;
  details?: TypeInspectionResult['details'];
} {
  const typeStr = typeToString(type);

  if (type.kind === 'fun') {
    const params = type.params.map((p, i) => ({
      name: p.name || `arg${i + 1}`,
      type: typeToString(p.type)
    }));
    const returnType = typeToString(type.returnType);
    const paramStr = params.map(p => `${p.name}: ${p.type}`).join(', ');
    return {
      category: 'function',
      typeString: typeStr,
      signature: `(${paramStr}) => ${returnType}`,
      details: { params, returnType }
    };
  }

  if (type.kind === 'poly') {
    if (type.type.kind === 'fun') {
      const fun = type.type as TFun;
      const params = fun.params.map((p, i) => ({
        name: p.name || `arg${i + 1}`,
        type: typeToString(p.type)
      }));
      const returnType = typeToString(fun.returnType);
      const quant = `<${type.quantifiers.join(', ')}>`;
      const paramStr = params.map(p => `${p.name}: ${p.type}`).join(', ');
      return {
        category: 'function',
        typeString: typeStr,
        signature: `${quant}(${paramStr}) => ${returnType}`,
        details: { params, returnType, typeParams: type.quantifiers }
      };
    }
    return {
      category: 'variable',
      typeString: typeStr,
      signature: typeStr,
      details: { typeParams: type.quantifiers }
    };
  }

  if (type.kind === 'rec') {
    const fields = type.fields.map(f => ({
      name: f.name,
      type: typeToString(f.type),
      isMut: f.isMut,
      isOptional: f.isOptional
    }));
    return {
      category: 'record',
      typeString: typeStr,
      signature: typeStr,
      details: { fields }
    };
  }

  if (type.kind === 'prim') {
    return {
      category: 'primitive',
      typeString: typeStr,
      signature: typeStr
    };
  }

  return {
    category: 'variable',
    typeString: typeStr,
    signature: typeStr
  };
}

/**
 * Inspect a specific symbol by name against the active TypeEnv, built-in catalog, and keywords.
 */
export function inspectSymbolByName(name: string, typeEnv: TypeEnv | null, code?: string): TypeInspectionResult | null {
  if (!name || name.trim() === '') return null;
  const word = name.trim();

  // 1. Check if word contains a dot (e.g. Math.sqrt, String.len, DOM.h)
  if (word.includes('.')) {
    const [modName, memberName] = word.split('.');
    if (typeEnv && typeEnv.modules.has(modName)) {
      const mod = typeEnv.modules.get(modName)!;
      if (mod.vars.has(memberName)) {
        const type = mod.vars.get(memberName)!;
        const details = extractTypeDetails(type);
        return {
          symbol: word,
          typeString: details.typeString,
          category: 'module',
          signature: `module ${modName} { export ${details.signature} }`,
          doc: `Exported member \`${memberName}\` of module \`${modName}\``,
          details: details.details
        };
      }
    }
  }

  // 2. Check Standard Library Built-ins
  if (BUILTIN_HOVER_DB[word]) {
    const builtin = BUILTIN_HOVER_DB[word];
    return {
      symbol: word,
      typeString: builtin.signature,
      category: 'builtin',
      signature: builtin.signature,
      doc: builtin.doc
    };
  }

  // 3. Check Keywords
  if (KEYWORD_HOVER_DB[word]) {
    const kw = KEYWORD_HOVER_DB[word];
    return {
      symbol: word,
      typeString: 'keyword',
      category: 'keyword',
      signature: kw.title,
      doc: kw.doc
    };
  }

  // 4. Check Primitive Types
  if (['number', 'boolean', 'string', 'void'].includes(word)) {
    return {
      symbol: word,
      typeString: word,
      category: 'primitive',
      signature: `primitive type ${word}`,
      doc: `Built-in primitive type \`${word}\`.`
    };
  }

  // 5. Look up in provided TypeEnv or compute from code
  let env = typeEnv;
  if (!env && code) {
    try {
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parseProgram(true);
      const checker = new TypeChecker();
      env = checker.checkProgram(ast);
    } catch {
      // ignore
    }
  }

  if (env) {
    // A. Check root vars
    if (env.vars.has(word)) {
      const type = env.vars.get(word)!;
      const extracted = extractTypeDetails(type);
      const isMut = env.mutVars.has(word);
      const isExport = env.exports.has(word);
      return {
        symbol: word,
        typeString: extracted.typeString,
        category: extracted.category,
        signature: `${isExport ? 'export ' : ''}${extracted.category === 'function' ? 'function' : isMut ? 'let mut' : 'let'} ${word}: ${extracted.signature}`,
        doc: isExport ? `Exported top-level symbol in current module.` : `Top-level symbol bound in current environment.`,
        details: extracted.details
      };
    }

    // A2. Check if it is a local symbol in checker symbols if checker was run
    if (code) {
      try {
        const lexer = new Lexer(code);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parseProgram(true);
        const checker = new TypeChecker();
        checker.checkProgram(ast);
        const matched = checker.symbols.find(s => s.name === word);
        if (matched) {
          const extracted = extractTypeDetails(matched.type);
          const isParam = matched.kind === 'parameter';
          const isPattern = matched.kind === 'pattern';
          const isLoop = matched.kind === 'loop';
          const category = isParam || isPattern || isLoop ? 'variable' : extracted.category;
          const prefix = isParam ? '(param)' : isPattern ? '(pattern)' : isLoop ? '(loop)' : matched.isMut ? 'let mut' : 'let';
          return {
            symbol: word,
            typeString: extracted.typeString,
            category,
            signature: `${prefix} ${word}: ${extracted.signature}`,
            doc: matched.doc || `Locally scoped ${matched.kind} \`${word}\``,
            line: matched.loc?.line,
            col: matched.loc?.col,
            details: extracted.details
          };
        }
      } catch {
        // ignore
      }
    }

    // B. Check GADTs
    if (env.gadts.has(word)) {
      const gadt = env.gadts.get(word)!;
      const paramNames = gadt.typeParams.map(tp => typeParamToString(tp));
      const params = paramNames.length > 0 ? `<${paramNames.join(', ')}>` : '';
      const ctors = gadt.constructors.map(c => {
        const pStr = c.params.map(p => `${p.name}: ${p.type.kind}`).join(', ');
        return {
          name: c.name,
          signature: `${c.name}(${pStr})`
        };
      });
      return {
        symbol: word,
        typeString: `type ${gadt.name}${params}`,
        category: 'gadt',
        signature: `type ${gadt.name}${params} = \n  | ${ctors.map(c => c.signature).join('\n  | ')}`,
        doc: `Generalized Algebraic Data Type (GADT) with ${gadt.constructors.length} constructor variant(s).`,
        details: { constructors: ctors, typeParams: paramNames }
      };
    }

    // C. Check GADT Constructors
    for (const [gadtName, gadt] of env.gadts.entries()) {
      const ctor = gadt.constructors.find(c => c.name === word);
      if (ctor) {
        const params = ctor.params.map(p => ({
          name: p.name,
          type: p.type.kind
        }));
        const pStr = params.map(p => `${p.name}: ${p.type}`).join(', ');
        return {
          symbol: word,
          typeString: `Constructor of ${gadtName}`,
          category: 'constructor',
          signature: `${ctor.name}(${pStr}): ${gadtName}`,
          doc: `Constructor variant for GADT type \`${gadtName}\`.`,
          details: { params, returnType: gadtName }
        };
      }
    }

    // D. Check Type Aliases
    if (env.typeAliases.has(word)) {
      const alias = env.typeAliases.get(word)!;
      const typeStr = typeToString(alias.type);
      const params = alias.typeParams.length > 0 ? `<${alias.typeParams.map(tp => typeParamToString(tp)).join(', ')}>` : '';
      return {
        symbol: word,
        typeString: typeStr,
        category: 'alias',
        signature: `type ${word}${params} = ${typeStr}`,
        doc: `Type alias definition.`
      };
    }

    // E. Check Modules
    if (env.modules.has(word)) {
      const mod = env.modules.get(word)!;
      const exportsList = Array.from(mod.vars.entries()).map(([k, v]) => ({
        name: k,
        type: typeToString(v)
      }));
      return {
        symbol: word,
        typeString: `module ${word}`,
        category: 'module',
        signature: `module ${word} {\n  ${exportsList.map(e => `export ${e.name}: ${e.type}`).join(';\n  ')}\n}`,
        doc: `Module namespace containing ${mod.vars.size} exported member(s).`,
        details: { moduleExports: exportsList }
      };
    }
  }

  return null;
}

/**
 * Retrieve comprehensive type inspection data at a given cursor position (line, col).
 */
export function inspectTypeAtPosition(
  code: string,
  line: number,
  col: number,
  typeEnv?: TypeEnv | null
): TypeInspectionResult | null {
  const word = getWordAtPosition(code, line, col);
  if (!word) return null;

  // Try checking with TypeChecker to get full symbol table with exact locations and scopes
  try {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parseProgram(true);
    const checker = new TypeChecker();
    checker.checkProgram(ast);

    const matchedSymbol = findMatchingSymbol(checker.symbols, word, line, col);
    if (matchedSymbol) {
      const extracted = extractTypeDetails(matchedSymbol.type);
      const isParam = matchedSymbol.kind === 'parameter';
      const isPattern = matchedSymbol.kind === 'pattern';
      const isLoop = matchedSymbol.kind === 'loop';

      const category = isParam || isPattern || isLoop ? 'variable' : extracted.category;
      const prefix = isParam ? '(param)' : isPattern ? '(pattern)' : isLoop ? '(loop)' : matchedSymbol.isMut ? 'let mut' : 'let';

      const lines = code.split('\n');
      const sourceContext = line >= 1 && line <= lines.length ? lines[line - 1] : undefined;

      return {
        symbol: word,
        typeString: extracted.typeString,
        category,
        signature: `${prefix} ${word}: ${extracted.signature}`,
        doc: matchedSymbol.doc || `Locally scoped ${matchedSymbol.kind} \`${word}\``,
        line: matchedSymbol.loc?.line || line,
        col: matchedSymbol.loc?.col || col,
        sourceContext,
        details: extracted.details
      };
    }
  } catch {
    // fallback
  }

  const result = inspectSymbolByName(word, typeEnv, code);
  if (result) {
    result.line = line;
    result.col = col;
    // Capture the line of code as context
    const lines = code.split('\n');
    if (line >= 1 && line <= lines.length) {
      result.sourceContext = lines[line - 1];
    }
    return result;
  }

  // Fallback representation for unknown or untyped tokens
  return {
    symbol: word,
    typeString: 'unresolved / generic type',
    category: 'unknown',
    signature: `symbol ${word}`,
    line,
    col,
    doc: `Expression or symbol at line ${line}, col ${col}.`
  };
}

/**
 * Summarize and categorize all symbols present in a TypeEnv for the Type Explorer catalog.
 */
export function getAllSymbolsFromTypeEnv(typeEnv: TypeEnv | null): {
  category: 'functions' | 'gadts' | 'variables' | 'aliases' | 'modules' | 'builtins';
  name: string;
  typeString: string;
  signature: string;
  details?: TypeInspectionResult;
}[] {
  const list: {
    category: 'functions' | 'gadts' | 'variables' | 'aliases' | 'modules' | 'builtins';
    name: string;
    typeString: string;
    signature: string;
    details?: TypeInspectionResult;
  }[] = [];

  if (!typeEnv) {
    // Return standard library symbols
    for (const [name, b] of Object.entries(BUILTIN_HOVER_DB)) {
      list.push({
        category: 'builtins',
        name,
        typeString: b.signature,
        signature: b.signature
      });
    }
    return list;
  }

  // 1. Root variables & functions
  for (const [name, type] of typeEnv.vars.entries()) {
    const isFun = type.kind === 'fun' || (type.kind === 'poly' && type.type.kind === 'fun');
    const typeStr = typeToString(type);
    const inspected = inspectSymbolByName(name, typeEnv);
    list.push({
      category: isFun ? 'functions' : 'variables',
      name,
      typeString: typeStr,
      signature: inspected?.signature || `${name}: ${typeStr}`,
      details: inspected || undefined
    });
  }

  // 2. GADTs
  for (const [name, gadt] of typeEnv.gadts.entries()) {
    const params = gadt.typeParams.length > 0 ? `<${gadt.typeParams.join(', ')}>` : '';
    const inspected = inspectSymbolByName(name, typeEnv);
    list.push({
      category: 'gadts',
      name,
      typeString: `type ${gadt.name}${params}`,
      signature: `type ${gadt.name}${params}`,
      details: inspected || undefined
    });
  }

  // 3. Type Aliases
  for (const [name, alias] of typeEnv.typeAliases.entries()) {
    const typeStr = typeToString(alias.type);
    const inspected = inspectSymbolByName(name, typeEnv);
    list.push({
      category: 'aliases',
      name,
      typeString: typeStr,
      signature: `type ${name} = ${typeStr}`,
      details: inspected || undefined
    });
  }

  // 4. Modules
  for (const [name, mod] of typeEnv.modules.entries()) {
    const inspected = inspectSymbolByName(name, typeEnv);
    list.push({
      category: 'modules',
      name,
      typeString: `module (${mod.vars.size} exports)`,
      signature: `module ${name}`,
      details: inspected || undefined
    });
  }

  return list;
}


/**
 * Extract autocompletion suggestions based on current cursor position
 */
export function getCompletionInformation(code: string, line: number, col: number): string[] {
  const lines = code.split('\n');
  if (line < 1 || line > lines.length) return [];
  const lineText = lines[line - 1].substring(0, col - 1);
  const regex = /([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)\s*\.\s*([a-zA-Z0-9_]*)$/;
  const match = lineText.match(regex);
  if (!match) return [];
  
  const objectChain = match[1].split('.');
  const prefix = match[2];
  
  const lexer = new Lexer(code);
  const parser = new Parser(lexer.tokenize());
  let ast;
  try {
    ast = parser.parseProgram(true);
  } catch (e: any) {
    if (e.program) ast = e.program;
    else return [];
  }
  
  const checker = new TypeChecker();
  // silence errors for completion check
  (checker as any).addError = () => {};
  const env = checker.checkProgram(ast);
  
  const rootName = objectChain[0];
  let currentType: Type | undefined;
  
  if (env.modules.has(rootName)) {
     let modEnv = env.modules.get(rootName)!;
     for (let i = 1; i < objectChain.length; i++) {
        const seg = objectChain[i];
        if (modEnv.modules.has(seg)) modEnv = modEnv.modules.get(seg)!;
        else if (modEnv.vars.has(seg)) {
           currentType = prune(modEnv.vars.get(seg)!);
           break;
        }
     }
     if (!currentType) {
        const results = [];
        for (const exp of modEnv.exports) {
           if (exp.startsWith(prefix)) {
              results.push(exp);
           }
        }
        return results;
     }
  } else {
     let sym = null;
     for (let i = checker.symbols.length - 1; i >= 0; i--) {
        if (checker.symbols[i].name === rootName) {
           sym = checker.symbols[i];
           break;
        }
     }
     if (!sym) return [];
     currentType = prune(sym.type);
     
     for (let i = 1; i < objectChain.length; i++) {
        const prop = objectChain[i];
        if (currentType.kind === "rec") {
           const field = currentType.fields.find(f => f.name === prop);
           if (!field) return [];
           currentType = prune(field.type);
        } else {
           return [];
        }
     }
  }
  
  if (currentType && currentType.kind === "rec") {
     return currentType.fields.map(f => f.name).filter(n => n.startsWith(prefix));
  }
  return [];
}
