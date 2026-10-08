import { Lexer } from './lexer';
import { Parser } from './parser';
import { TypeChecker, TypeEnv, ScopeSymbol, createInitialEnv } from './checker';
import { typeToString, Type, TFun, TRec, TPoly, TCons, kindArity, prune } from './types';
import { GADTConstructor, getTypeParamName, TypeParam, typeParamToString } from './ast';
import { Formatter } from './formatter';
import { STDLIB_MODULES, getRootBuiltinDoc } from './stdlibDocs';

export interface CompletionItem {
  label: string;
  kind: 'function' | 'method' | 'variable' | 'module' | 'keyword' | 'snippet' | 'type' | 'constructor' | 'property' | 'constant';
  detail?: string;
  documentation?: string;
  insertText?: string;
  isSnippet?: boolean;
  sortText?: string;
  filterText?: string;
}

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

function formatHoverType(type: Type, indent = 0, visiting = new Set<Type>()): string {
  const resolved = prune(type);
  if (visiting.has(resolved)) return 'Self';
  visiting.add(resolved);
  const format = (nested: Type) => formatHoverType(nested, indent + 1, visiting);
  let result: string;
  switch (resolved.kind) {
    case 'prim': result = resolved.name; break;
    case 'var': result = resolved.instance ? format(resolved.instance) : resolved.name || `'t${resolved.id}`; break;
    case 'existential': result = `∃${resolved.name}_${resolved.id}`; break;
    case 'poly': {
      const quantifiers = resolved.quantifiers.map(name => {
        const kind = resolved.quantifierKinds?.get(name);
        return kind?.kind === 'arrow' ? `${name}<${Array(kindArity(kind)).fill('_').join(', ')}>` : name;
      });
      result = `<${quantifiers.join(', ')}>${format(resolved.type)}`;
      break;
    }
    case 'fun': {
      const params = resolved.params.map(param => param.name ? `${param.name}: ${format(param.type)}` : format(param.type));
      result = `(${params.join(', ')}) => ${format(resolved.returnType)}`;
      break;
    }
    case 'rec': {
      const fieldIndent = '  '.repeat(indent + 1);
      const fields = resolved.fields.map((field, index) => {
        const fieldType = prune(field.type);
        const isSelfMethod = fieldType.kind === 'fun' && fieldType.params[0]?.name === 'self' && prune(fieldType.params[0].type) === resolved;
        const typeText = isSelfMethod
          ? `${fieldType.params.slice(1).map(param => param.name ? `${param.name}: ${format(param.type)}` : format(param.type)).join(', ')}): ${format(fieldType.returnType)}`
          : format(field.type);
        const fieldName = `${field.isMut ? 'mut ' : ''}${field.name}${field.isOptional ? '?' : ''}`;
        const rendered = isSelfMethod ? `${fieldName}(${typeText}` : `${fieldName}: ${typeText}`;
        return `${fieldIndent}${rendered}${index < resolved.fields.length - 1 ? ',' : ''}`;
      });
      result = ` {\n${fields.join('\n')}\n${'  '.repeat(indent)}}`;
      break;
    }
    case 'tup': result = `[${resolved.elements.map(format).join(', ')}]`; break;
    case 'cons': result = resolved.args.length ? `${resolved.name}<${resolved.args.map(format).join(', ')}>` : resolved.name; break;
    case 'hkt_app': result = `${format(resolved.constructor)}<${resolved.args.map(format).join(', ')}>`; break;
    case 'type_lambda': result = `λ<${resolved.params.join(', ')}> => ${format(resolved.body)}`; break;
  }
  visiting.delete(resolved);
  return result;
}

function appendGadtHover(contents: string[], gadt: { name: string; typeParams: TypeParam[]; constructors: GADTConstructor[] }): void {
  const typeParams = gadt.typeParams.length ? `<${gadt.typeParams.map(typeParamToString).join(', ')}>` : '';
  const genericArgs = gadt.typeParams.length ? `<${gadt.typeParams.map(getTypeParamName).join(', ')}>` : '';
  contents.push(`\`\`\`typelang\ntype ${gadt.name}${typeParams}\n\`\`\``);
  contents.push(`**Constructors**\n\n\`\`\`typelang\n${gadt.constructors.map(ctor => {
    const ctorTypeParams = ctor.typeParams.length ? `<${ctor.typeParams.map(typeParamToString).join(', ')}>` : '';
    const params = ctor.params.map(param => `${param.name}: ${Formatter.formatTypeAST(param.type)}`).join(', ');
    const args = params ? `(${params})` : '';
    const result = ctor.returnType ? Formatter.formatTypeAST(ctor.returnType) : `${gadt.name}${genericArgs}`;
    return `  ${ctor.name}${ctorTypeParams}${args}: ${result}`;
  }).join('\n')}\n\`\`\``);
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
 * Resolve a reference symbol back to its definition symbol to inherit documentation and signatures.
 */
export function resolveReferenceSymbol(matchedSymbol: ScopeSymbol, symbols: ScopeSymbol[]): ScopeSymbol {
  if (matchedSymbol.kind === 'reference') {
    let defSymbol: ScopeSymbol | undefined;
    if (matchedSymbol.scopeRange) {
      defSymbol = symbols.find(s =>
        s.name === matchedSymbol.name &&
        s.kind !== 'reference' &&
        s.loc &&
        s.loc.line === matchedSymbol.scopeRange!.startLine &&
        s.loc.col === matchedSymbol.scopeRange!.startCol
      );
      if (!defSymbol) {
        defSymbol = symbols.find(s =>
          s.name === matchedSymbol.name &&
          s.kind !== 'reference' &&
          s.loc &&
          s.loc.line === matchedSymbol.scopeRange!.startLine
        );
      }
    }
    if (!defSymbol) {
      const candidates = symbols.filter(s =>
        s.name === matchedSymbol.name &&
        s.kind !== 'reference' &&
        s.loc
      );
      if (candidates.length > 0) {
        const refLine = matchedSymbol.loc?.line ?? Infinity;
        const preceding = candidates.filter(s => s.loc!.line <= refLine);
        defSymbol = preceding.length > 0 ? preceding[preceding.length - 1] : candidates[0];
      }
    }
    if (defSymbol) {
      return {
        ...matchedSymbol,
        kind: defSymbol.kind,
        doc: defSymbol.doc || matchedSymbol.doc,
        isExported: defSymbol.isExported ?? matchedSymbol.isExported,
        containerName: defSymbol.containerName ?? matchedSymbol.containerName,
        type: defSymbol.type || matchedSymbol.type,
      };
    }
  }
  return matchedSymbol;
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

  // 1. Check Keywords
  if (KEYWORD_HOVER_DB[word]) {
    const kw = KEYWORD_HOVER_DB[word];
    contents.push('**TypeLang Keyword**');
    contents.push(`\`\`\`typelang\n${word}\n\`\`\``);
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

    const sourceLine = code.split('\n')[line - 1] || '';
    const qualifier = sourceLine.slice(0, Math.max(0, col - 1))
      .match(/([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*(?:[A-Za-z_][A-Za-z0-9_]*)?$/)?.[1];
    if (qualifier) {
      const moduleEnv = env.modules.get(qualifier);
      if (moduleEnv) {
        const memberType = moduleEnv.vars.get(word);
        if (memberType) {
          contents.push(`\`\`\`typelang\n${qualifier}.${word}: ${typeToString(memberType)}\n\`\`\``);
          contents.push(moduleEnv.docs?.get(word) || moduleEnv.moduleDoc || `Member of the \`${qualifier}\` module.`);
          return { contents, word };
        }
        const memberAlias = moduleEnv.typeAliases.get(word);
        if (memberAlias) {
          contents.push(`\`\`\`typelang\ntype ${qualifier}.${word} = ${typeToString(memberAlias.type)}\n\`\`\``);
          contents.push(moduleEnv.docs?.get(word) || `Type alias of the \`${qualifier}\` module.`);
          return { contents, word };
        }
      }
    }

    // Search in registered scoped symbols (function parameters, local variables, lambdas, patterns, etc.)
    let matchedSymbol = findMatchingSymbol(checker.symbols, word, line, col);
    if (matchedSymbol) {
      matchedSymbol = resolveReferenceSymbol(matchedSymbol, checker.symbols);
      if (matchedSymbol.kind === 'gadt' && env.gadts.has(word)) {
        appendGadtHover(contents, env.gadts.get(word)!);
        if (matchedSymbol.doc) contents.push(matchedSymbol.doc);
        return { contents, word };
      }
      const typeStr = formatHoverType(matchedSymbol.type);
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
        const container = matchedSymbol.containerName ? ` of \`${matchedSymbol.containerName}\`` : '';
        contents.push('```typelang\n' + prefix + ' ' + word + ': ' + typeStr + '\n```');
        contents.push(container ? `*Member variable${container}*` : (matchedSymbol.isExported ? '*Exported top-level variable*' : '*Local variable*'));
      } else if (matchedSymbol.kind === 'function') {
        const container = matchedSymbol.containerName ? ` of \`${matchedSymbol.containerName}\`` : '';
        contents.push('```typelang\nfunction ' + word + ': ' + typeStr + '\n```');
        contents.push(container ? `*Member function${container}*` : (matchedSymbol.isExported ? '*Exported function*' : '*Function definition*'));
      } else if (matchedSymbol.kind === 'type_alias') {
        const container = matchedSymbol.containerName ? ` in \`${matchedSymbol.containerName}\`` : '';
        contents.push('```typelang\ntype ' + word + ' = ' + typeStr + '\n```');
        contents.push(`*Type alias${container}*`);
      } else if (matchedSymbol.kind === 'module') {
        contents.push('```typelang\nmodule ' + word + '\n```');
        contents.push('*Module definition*');
      } else if (matchedSymbol.kind === 'reference') {
        const isFun = matchedSymbol.type && (matchedSymbol.type.kind === 'fun' || (matchedSymbol.type.kind === 'poly' && matchedSymbol.type.type.kind === 'fun'));
        if (isFun) {
          contents.push('```typelang\nfunction ' + word + ': ' + typeStr + '\n```');
          contents.push(matchedSymbol.isExported ? '*Exported function*' : '*Function*');
        } else {
          const prefix = matchedSymbol.isMut ? 'let mut' : 'let';
          contents.push('```typelang\n' + prefix + ' ' + word + ': ' + typeStr + '\n```');
          contents.push(matchedSymbol.isExported ? '*Exported variable*' : '*Variable*');
        }
      } else {
        contents.push('```typelang\n' + matchedSymbol.kind + ' ' + word + ': ' + typeStr + '\n```');
      }

      const docText = matchedSymbol.doc || env.docs?.get(word) || getRootBuiltinDoc(word) || BUILTIN_HOVER_DB[word]?.doc;
      if (docText) {
        contents.push(docText);
      }
      return { contents, word };
    }

    // Search in root environment variables
    if (env.vars.has(word)) {
      const type = env.vars.get(word)!;
      const typeStr = formatHoverType(type);
      contents.push('```typelang\nlet ' + word + ': ' + typeStr + '\n```');
      contents.push('*Inferred symbol type in global scope*');
      if (env.docs?.has(word)) contents.push(env.docs.get(word)!);
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
      contents.push(`**Module Scope** containing ${mod.exports.size} exported member(s).`);
      if (mod.moduleDoc) contents.push(mod.moduleDoc);
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
export function inspectSymbolByName(name: string, typeEnv: TypeEnv | null | undefined, code?: string): TypeInspectionResult | null {
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
          doc: mod.docs?.get(memberName) || `Exported member \`${memberName}\` of module \`${modName}\``,
          details: details.details
        };
      }
    }
  }

  // 2. Check Keywords
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
        doc: env.docs?.get(word) || (isExport ? `Exported top-level symbol in current module.` : `Top-level symbol bound in current environment.`),
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

    let matchedSymbol = findMatchingSymbol(checker.symbols, word, line, col);
    if (matchedSymbol) {
      matchedSymbol = resolveReferenceSymbol(matchedSymbol, checker.symbols);
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
    const defaultEnv = new TypeChecker().checkProgram({ statements: [] });
    for (const [name, type] of defaultEnv.vars.entries()) {
      list.push({
        category: 'builtins',
        name,
        typeString: typeToString(type),
        signature: `${name}: ${typeToString(type)}`
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
export function getCompletionInformation(code: string, line: number, col: number): CompletionItem[] {
  const lines = code.split('\n');
  if (line < 1 || line > lines.length) return [];
  const lineText = lines[line - 1].substring(0, col - 1);

  // Discover user-defined modules even if code has syntax errors
  const userModuleMatches = code.matchAll(/\bmodule\s+([a-zA-Z_][a-zA-Z0-9_]*)/g);
  const discoveredUserModules = new Set<string>();
  for (const m of userModuleMatches) {
    discoveredUserModules.add(m[1]);
  }

  // Parse resiliently
  let ast: any = { statements: [] };
  try {
    const lexer = new Lexer(code);
    const parser = new Parser(lexer.tokenize());
    ast = parser.parseProgram(true);
  } catch (e: any) {
    if (e && e.program) ast = e.program;
  }

  const checker = new TypeChecker();
  (checker as any).addError = () => {};
  let env: TypeEnv;
  try {
    env = checker.checkProgram(ast);
  } catch {
    env = createInitialEnv();
  }

  function getModuleExports(modName: string): CompletionItem[] {
    const items: CompletionItem[] = [];
    const seen = new Set<string>();

    const modEnv = env.modules.get(modName);
    if (modEnv) {
      const exportNames = new Set<string>(modEnv.exports);
      if (exportNames.size === 0) {
        for (const k of modEnv.vars.keys()) exportNames.add(k);
        for (const k of modEnv.gadts.keys()) exportNames.add(k);
        for (const k of modEnv.typeAliases.keys()) exportNames.add(k);
      }

      for (const name of exportNames) {
        if (seen.has(name)) continue;
        seen.add(name);

        const ty = modEnv.vars.get(name);
        let kind: CompletionItem['kind'] = 'function';
        let detail = `member of ${modName}`;
        if (ty) {
          const isFun = ty.kind === 'fun' || (ty.kind === 'poly' && ty.type.kind === 'fun');
          kind = isFun ? 'function' : 'constant';
          detail = `${name}: ${typeToString(ty)}`;
        } else if (modEnv.gadts.has(name) || modEnv.typeAliases.has(name)) {
          kind = 'type';
          detail = `type ${name}`;
        }

        let doc = modEnv.docs?.get(name) || BUILTIN_HOVER_DB[name]?.doc || BUILTIN_HOVER_DB[`${modName}.${name}`]?.doc;
        if (!doc) {
          const stdMod = STDLIB_MODULES.find(m => m.name === modName);
          const stdFn = stdMod?.functions.find(f => f.name === name);
          if (stdFn) {
            doc = stdFn.description;
            if (!detail || detail.startsWith('member of')) detail = stdFn.signature;
          }
        }

        items.push({
          label: name,
          kind,
          detail,
          documentation: doc || `Exported ${kind} \`${name}\` from module \`${modName}\`.`,
          insertText: name
        });
      }

      for (const gName of modEnv.gadts.keys()) {
        if (!seen.has(gName)) {
          seen.add(gName);
          items.push({
            label: gName,
            kind: 'type',
            detail: `type ${gName}`,
            documentation: `GADT type \`${gName}\` from module \`${modName}\`.`,
            insertText: gName
          });
        }
      }

      for (const tName of modEnv.typeAliases.keys()) {
        if (!seen.has(tName)) {
          seen.add(tName);
          items.push({
            label: tName,
            kind: 'type',
            detail: `type ${tName}`,
            documentation: `Type alias \`${tName}\` from module \`${modName}\`.`,
            insertText: tName
          });
        }
      }
    }

    // Enrich from STDLIB_MODULES
    const stdMod = STDLIB_MODULES.find(m => m.name === modName);
    if (stdMod) {
      for (const fn of stdMod.functions) {
        if (!seen.has(fn.name)) {
          seen.add(fn.name);
          items.push({
            label: fn.name,
            kind: 'function',
            detail: fn.signature,
            documentation: fn.description,
            insertText: fn.name
          });
        }
      }
      if (modName === 'Option') {
        if (!seen.has('Some')) items.push({ label: 'Some', kind: 'constructor', detail: 'Some<a>(val: a): Option<a>', documentation: 'Constructs an Option containing a value.', insertText: 'Some' });
        if (!seen.has('None')) items.push({ label: 'None', kind: 'constructor', detail: 'None: Option<a>', documentation: 'Represents the empty Option variant.', insertText: 'None' });
      } else if (modName === 'Result') {
        if (!seen.has('Ok')) items.push({ label: 'Ok', kind: 'constructor', detail: 'Ok<a, e>(val: a): Result<a, e>', documentation: 'Constructs a success Result value.', insertText: 'Ok' });
        if (!seen.has('Err')) items.push({ label: 'Err', kind: 'constructor', detail: 'Err<a, e>(err: e): Result<a, e>', documentation: 'Constructs an error Result value.', insertText: 'Err' });
      } else if (modName === 'Either') {
        if (!seen.has('Left')) items.push({ label: 'Left', kind: 'constructor', detail: 'Left<l, r>(left: l): Either<l, r>', insertText: 'Left' });
        if (!seen.has('Right')) items.push({ label: 'Right', kind: 'constructor', detail: 'Right<l, r>(right: r): Either<l, r>', insertText: 'Right' });
      } else if (modName === 'Validation') {
        if (!seen.has('Valid')) items.push({ label: 'Valid', kind: 'constructor', detail: 'Valid<a>(val: a): Validation<a>', insertText: 'Valid' });
        if (!seen.has('Invalid')) items.push({ label: 'Invalid', kind: 'constructor', detail: 'Invalid<a>(errs: [string]): Validation<a>', insertText: 'Invalid' });
      }
    }

    return items;
  }

  function getAllModules(): CompletionItem[] {
    const modules: CompletionItem[] = [];
    const seen = new Set<string>();

    for (const stdMod of STDLIB_MODULES) {
      seen.add(stdMod.name);
      modules.push({
        label: stdMod.name,
        kind: 'module',
        detail: `module ${stdMod.name} (${stdMod.category})`,
        documentation: `${stdMod.tagline}\n\n${stdMod.description}`,
        insertText: stdMod.name
      });
    }

    for (const modName of env.modules.keys()) {
      if (!seen.has(modName)) {
        seen.add(modName);
        modules.push({
          label: modName,
          kind: 'module',
          detail: `module ${modName}`,
          documentation: env.modules.get(modName)?.moduleDoc || `Module namespace \`${modName}\`.`,
          insertText: modName
        });
      }
    }

    for (const userMod of discoveredUserModules) {
      if (!seen.has(userMod)) {
        seen.add(userMod);
        modules.push({
          label: userMod,
          kind: 'module',
          detail: `module ${userMod}`,
          documentation: `User-defined module \`${userMod}\`.`,
          insertText: userMod
        });
      }
    }

    return modules;
  }

  // 1. Inside import member list: import ModuleName.{ ... (supports single- and multi-line imports)
  const fullTextBeforeCursor = lines.slice(0, line - 1).join('\n') + (line > 1 ? '\n' : '') + lineText;
  const importMembersMatch = fullTextBeforeCursor.match(/import\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)\s*\.\s*\{([^}]*)$/);
  if (importMembersMatch) {
    const modName = importMembersMatch[1];
    const inner = importMembersMatch[2];
    const parts = inner.split(',');
    const currentPrefix = parts[parts.length - 1].trim().toLowerCase();
    const alreadyImported = new Set(parts.slice(0, -1).map(p => p.trim()).filter(Boolean));

    const exports = getModuleExports(modName);
    const results: CompletionItem[] = [];

    if (!alreadyImported.has('*') && ('*'.startsWith(currentPrefix) || currentPrefix === '')) {
      results.push({
        label: '*',
        kind: 'keyword',
        detail: `Import all exports from ${modName}`,
        documentation: `Imports every exported member of \`${modName}\` into current scope.`,
        insertText: '*',
        filterText: '*',
        sortText: '0_*'
      });
    }

    for (const exp of exports) {
      if (alreadyImported.has(exp.label)) continue;
      if (currentPrefix === '' || exp.label.toLowerCase().includes(currentPrefix)) {
        const isPrefix = exp.label.toLowerCase().startsWith(currentPrefix);
        results.push({
          ...exp,
          filterText: exp.label,
          sortText: isPrefix ? `0_${exp.label}` : `1_${exp.label}`
        });
      }
    }

    return results;
  }

  // 2. Right after import ModuleName. (after dot before {)
  const importDotMatch = lineText.match(/import\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)\.\s*([a-zA-Z0-9_{]*)$/);
  if (importDotMatch) {
    const modName = importDotMatch[1];
    const dotPrefix = importDotMatch[2].toLowerCase();
    const results: CompletionItem[] = [
      {
        label: '{ ... }',
        kind: 'snippet',
        detail: `Import specifiers from ${modName}`,
        insertText: '{ ${1:members} }',
        isSnippet: true,
        filterText: '{',
        documentation: `Selectively import members from \`${modName}\`.`,
        sortText: '0_0'
      },
      {
        label: '{ * }',
        kind: 'snippet',
        detail: `Import all exports from ${modName}`,
        insertText: '{ * }',
        filterText: '{*',
        documentation: `Import every exported member of \`${modName}\`.`,
        sortText: '0_1'
      }
    ];

    const exports = getModuleExports(modName);
    for (const exp of exports) {
      if (dotPrefix === '' || exp.label.toLowerCase().includes(dotPrefix) || `{ ${exp.label} }`.toLowerCase().includes(dotPrefix)) {
        const isPrefix = exp.label.toLowerCase().startsWith(dotPrefix);
        results.push({
          ...exp,
          label: exp.label,
          detail: `import ${modName}.{ ${exp.label} }`,
          insertText: `{ ${exp.label} }`,
          filterText: exp.label,
          sortText: isPrefix ? `0_${exp.label}` : `1_${exp.label}`
        });
        results.push({
          ...exp,
          label: `{ ${exp.label} }`,
          detail: `import ${modName}.{ ${exp.label} }`,
          insertText: `{ ${exp.label} }`,
          filterText: `{ ${exp.label} }`,
          sortText: isPrefix ? `0_z_${exp.label}` : `1_z_${exp.label}`
        });
      }
    }
    return results;
  }

  // 3. Right after import or typing module name: import M...
  const importModMatch = lineText.match(/import\s+([a-zA-Z0-9_]*)$/);
  if (importModMatch) {
    const modPrefix = importModMatch[1].toLowerCase();
    const allMods = getAllModules();
    const results: CompletionItem[] = [];

    for (const mod of allMods) {
      if (modPrefix === '' || mod.label.toLowerCase().includes(modPrefix)) {
        const isPrefix = mod.label.toLowerCase().startsWith(modPrefix);
        results.push({
          ...mod,
          filterText: mod.label,
          sortText: isPrefix ? `0_${mod.label}` : `1_${mod.label}`
        });
        results.push({
          label: `${mod.label}.{ ... }`,
          kind: 'snippet',
          detail: `import ${mod.label}.{ members }`,
          insertText: `${mod.label}.{ \${1:members} }`,
          isSnippet: true,
          filterText: `${mod.label} import`,
          documentation: `Import members from \`${mod.label}\`.\n\n${mod.documentation || ''}`,
          sortText: isPrefix ? `0_${mod.label}_0` : `1_${mod.label}_0`
        });
        results.push({
          label: `${mod.label}.{ * }`,
          kind: 'snippet',
          detail: `import ${mod.label}.{ * }`,
          insertText: `${mod.label}.{ * }`,
          filterText: `${mod.label} *`,
          documentation: `Import all exports from \`${mod.label}\`.\n\n${mod.documentation || ''}`,
          sortText: isPrefix ? `0_${mod.label}_1` : `1_${mod.label}_1`
        });
      }
    }

    return results;
  }

  // 3b. TypeScript style import { ...
  const importBracesMatch = lineText.match(/import\s*\{\s*([a-zA-Z0-9_]*)$/);
  if (importBracesMatch) {
    const bracePrefix = importBracesMatch[1].toLowerCase();
    const allMods = getAllModules();
    const results: CompletionItem[] = [];
    for (const mod of allMods) {
      if (bracePrefix === '' || mod.label.toLowerCase().includes(bracePrefix)) {
        results.push({
          label: `${mod.label}.{ ... }`,
          kind: 'snippet',
          detail: `TypeLang uses: import ${mod.label}.{ members }`,
          insertText: `${mod.label}.{ \${1:members} }`,
          isSnippet: true,
          documentation: `In TypeLang, module imports follow \`import ${mod.label}.{ members }\` syntax.`,
          sortText: `0_${mod.label}`
        });
      }
    }
    return results;
  }

  // 4. Dot member access on object chain: expr.prop or Module.prop
  const dotMatch = lineText.match(/([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)\s*\.\s*([a-zA-Z0-9_]*)$/);
  if (dotMatch) {
    const objectChain = dotMatch[1].split('.');
    const propPrefix = dotMatch[2].toLowerCase();
    const rootName = objectChain[0];

    // Check if rootName is a module
    if (env.modules.has(rootName) || STDLIB_MODULES.some(m => m.name === rootName) || discoveredUserModules.has(rootName)) {
      let currentModEnv: TypeEnv | undefined = env.modules.get(rootName);
      let currentModName = rootName;
      for (let i = 1; i < objectChain.length; i++) {
        const seg = objectChain[i];
        if (currentModEnv?.modules.has(seg)) {
          currentModEnv = currentModEnv.modules.get(seg);
          currentModName = seg;
        }
      }
      const exports = getModuleExports(currentModName);
      return exports
        .filter(e => propPrefix === '' || e.label.toLowerCase().includes(propPrefix))
        .map(e => ({
          ...e,
          sortText: e.label.toLowerCase().startsWith(propPrefix) ? `0_${e.label}` : `1_${e.label}`
        }));
    }

    // Check in-scope symbols (record, object)
    let sym: any = null;
    for (let i = checker.symbols.length - 1; i >= 0; i--) {
      if (checker.symbols[i].name === rootName) {
        sym = checker.symbols[i];
        break;
      }
    }
    if (!sym && env.vars.has(rootName)) {
      sym = { name: rootName, type: env.vars.get(rootName)!, kind: 'variable' };
    }

    if (sym) {
      let currentType: Type = prune(sym.type);
      for (let i = 1; i < objectChain.length; i++) {
        const prop = objectChain[i];
        if (currentType.kind === 'rec') {
          const field = currentType.fields.find(f => f.name === prop);
          if (!field) return [];
          currentType = prune(field.type);
        } else {
          return [];
        }
      }

      if (currentType.kind === 'rec') {
        return currentType.fields
          .filter(f => propPrefix === '' || f.name.toLowerCase().includes(propPrefix))
          .map(f => {
            const isFun = f.type.kind === 'fun';
            return {
              label: f.name,
              kind: isFun ? 'method' : 'property',
              detail: `${f.name}: ${typeToString(f.type)}`,
              documentation: `Record field \`${f.name}\``,
              insertText: f.name,
              sortText: f.name.toLowerCase().startsWith(propPrefix) ? `0_${f.name}` : `1_${f.name}`
            };
          });
      }
    }

    return [];
  }

  // 5. General scope: Built-ins, In-scope symbols, Modules, Types, Keywords & Snippets
  const identMatch = lineText.match(/([a-zA-Z_][a-zA-Z0-9_]*)$/);
  const prefix = identMatch ? identMatch[1].toLowerCase() : '';

  const results: CompletionItem[] = [];
  const seenLabels = new Set<string>();

  const add = (item: CompletionItem) => {
    if (!seenLabels.has(item.label)) {
      seenLabels.add(item.label);
      const lower = item.label.toLowerCase();
      if (prefix === '' || lower.includes(prefix)) {
        const isPrefixMatch = prefix !== '' && lower.startsWith(prefix);
        results.push({
          ...item,
          sortText: item.sortText || (isPrefixMatch ? `0_${item.label}` : `1_${item.label}`)
        });
      }
    }
  };

  // A. In-scope environment variables (includes imported functions/values, top-level lets/functions, and root builtins)
  for (const [varName, varType] of env.vars.entries()) {
    if (varName.startsWith('__')) continue;
    const isFun = varType.kind === 'fun' || (varType.kind === 'poly' && varType.type.kind === 'fun');
    const doc = env.docs?.get(varName) || getRootBuiltinDoc(varName) || BUILTIN_HOVER_DB[varName]?.doc;
    add({
      label: varName,
      kind: isFun ? 'function' : 'variable',
      detail: `${varName}: ${typeToString(varType)}`,
      documentation: doc || `In-scope ${isFun ? 'function' : 'variable'} \`${varName}\`.`,
      insertText: varName
    });
  }

  // B. In-scope GADTs & constructors from environment
  for (const [gName, gVal] of env.gadts.entries()) {
    add({
      label: gName,
      kind: 'type',
      detail: `type ${gName}`,
      documentation: `GADT type \`${gName}\`.`,
      insertText: gName
    });
    for (const ctor of gVal.constructors) {
      add({
        label: ctor.name,
        kind: 'constructor',
        detail: `constructor ${ctor.name}`,
        documentation: `Constructor for GADT \`${gName}\`.`,
        insertText: ctor.name
      });
    }
  }

  // C. In-scope type aliases from environment
  for (const [tName] of env.typeAliases.entries()) {
    add({
      label: tName,
      kind: 'type',
      detail: `type ${tName}`,
      documentation: `Type alias \`${tName}\`.`,
      insertText: tName
    });
  }

  // D. Built-in functions (root builtins, including math, string, array, timer, and I/O helpers)
  const rootBuiltins = [
    { label: 'print', detail: 'function print<T>(val: T): void', doc: 'Prints a value to standard output without adding a trailing newline.' },
    { label: 'println', detail: 'function println<T>(val: T): void', doc: 'Prints a value to standard output followed by a trailing newline.' },
    { label: 'to_string', detail: 'function to_string<T>(val: T): string', doc: 'Converts any value (number, boolean, record, tuple) into its canonical string representation.' },
    { label: 'concat', detail: 'function concat(a: string, b: string): string', doc: 'Concatenates two string values into a single string.' },
    { label: 'requestAnimationFrame', detail: 'function requestAnimationFrame(callback: () => void): void', doc: 'Schedules a callback for the next animation frame in browser runtimes.' },
    { label: 'setInterval', detail: 'function setInterval(callback: () => void, ms: number): number', doc: 'Repeatedly invokes a callback at the requested millisecond interval.' },
    { label: 'clearInterval', detail: 'function clearInterval(handle: number): void', doc: 'Cancels a repeating timer created by setInterval.' },
    { label: 'setTimeout', detail: 'function setTimeout(callback: () => void, ms: number): number', doc: 'Schedules a callback to run once after a delay.' },
    { label: 'clearTimeout', detail: 'function clearTimeout(handle: number): void', doc: 'Cancels a pending one-shot timer created by setTimeout.' },
    { label: 'time_now', detail: 'function time_now(): number', doc: 'Returns the current UNIX timestamp in milliseconds.' },
    { label: 'parse_int', detail: 'function parse_int(s: string): number', doc: 'Parses an integer number from a string representation.' },
    { label: 'parse_float', detail: 'function parse_float(s: string): number', doc: 'Parses a floating-point number from a string representation.' },
    { label: 'math_sqrt', detail: 'function math_sqrt(x: number): number', doc: 'Returns the square root of a non-negative number.' },
    { label: 'math_abs', detail: 'function math_abs(x: number): number', doc: 'Returns the absolute value of a number.' },
    { label: 'math_floor', detail: 'function math_floor(x: number): number', doc: 'Rounds a floating point number down to the nearest integer.' },
    { label: 'math_ceil', detail: 'function math_ceil(x: number): number', doc: 'Rounds a floating point number up to the nearest integer.' },
    { label: 'math_round', detail: 'function math_round(x: number): number', doc: 'Rounds a number to the nearest integer.' },
    { label: 'math_min', detail: 'function math_min(a: number, b: number): number', doc: 'Returns the minimum of two numbers.' },
    { label: 'math_max', detail: 'function math_max(a: number, b: number): number', doc: 'Returns the maximum of two numbers.' },
    { label: 'math_pow', detail: 'function math_pow(base: number, exp: number): number', doc: 'Calculates base raised to the power of exp.' },
    { label: 'math_random', detail: 'function math_random(): number', doc: 'Generates a random floating-point number between 0 and 1.' },
    { label: 'str_len', detail: 'function str_len(s: string): number', doc: 'Returns the character length of a string.' },
    { label: 'str_slice', detail: 'function str_slice(s: string, start: number, end: number): string', doc: 'Extracts a substring slice.' },
    { label: 'str_split', detail: 'function str_split(s: string, delimiter: string): [string]', doc: 'Splits a string by a delimiter into an array of substrings.' },
    { label: 'str_contains', detail: 'function str_contains(s: string, substring: string): boolean', doc: 'Checks if a string contains a given substring.' },
    { label: 'array_len', detail: 'function array_len<T>(arr: [T]): number', doc: 'Returns the number of elements in an array.' },
    { label: 'array_map', detail: 'function array_map<A, B>(arr: [A], fn: (x: A) => B): [B]', doc: 'Transforms each element in an array using a mapper callback.' },
    { label: 'array_filter', detail: 'function array_filter<A>(arr: [A], predicate: (x: A) => boolean): [A]', doc: 'Filters array elements matching a boolean predicate.' },
    { label: 'array_reduce', detail: 'function array_reduce<A, B>(arr: [A], initial: B, reducer: (acc: B, elem: A) => B): B', doc: 'Reduces an array to a single accumulated value.' },
    { label: 'array_push', detail: 'function array_push<A>(arr: [A], elem: A): [A]', doc: 'Appends an element to the end of an array.' },
    { label: 'h', detail: 'function h(tag: string, props: any, children: [any]): any', doc: 'Creates a Virtual DOM node element with tag, properties/event handlers, and children.' },
    { label: 'mount', detail: 'function mount(containerId: string, vnode: any): void', doc: 'Mounts a TypeLang Virtual DOM tree into the specified DOM element container ID.' },
    { label: 'getElementById', detail: 'function getElementById(id: string): any', doc: 'Retrieves a DOM element handle by its HTML element ID.' },
    { label: 'createElement', detail: 'function createElement(tag: string): any', doc: 'Creates a new DOM element with the given HTML tag name.' },
    { label: 'playTone', detail: 'function playTone(freq: number, duration: number, waveType: string, volume: number): void', doc: 'Plays an audio tone through Web Audio API.' },
    { label: 'playRamp', detail: 'function playRamp(startFreq: number, endFreq: number, duration: number, waveType: string, volume: number): void', doc: 'Plays a frequency sweep/ramp sound.' },
    { label: 'playSequence', detail: 'function playSequence(notes: [number], noteDuration: number, waveType: string, volume: number): void', doc: 'Plays an ordered sequence of note frequencies.' },
    { label: 'confetti', detail: 'function confetti(count: number, spread: number, originY: number): void', doc: 'Triggers a colorful particle confetti celebration on screen.' }
  ];
  for (const b of rootBuiltins) {
    add({
      label: b.label,
      kind: 'function',
      detail: b.detail,
      documentation: b.doc,
      insertText: b.label,
      filterText: b.label
    });
  }

  // E. Built-in modules
  for (const mod of getAllModules()) {
    add({
      ...mod,
      filterText: mod.label
    });
  }

  // F. Qualified standard library functions (e.g. Math.sqrt, DOM.getElementById, Array.map)
  for (const stdMod of STDLIB_MODULES) {
    for (const fn of stdMod.functions) {
      const qualified = `${stdMod.name}.${fn.name}`;
      if (prefix === '' || qualified.toLowerCase().includes(prefix) || fn.name.toLowerCase().includes(prefix)) {
        add({
          label: qualified,
          kind: 'function',
          detail: `${qualified}: ${fn.signature}`,
          documentation: fn.description,
          insertText: qualified,
          filterText: `${fn.name} ${qualified}`
        });
      }
    }
  }

  // G. Built-in constructors & constants
  const constructors = [
    { label: 'Some', detail: 'Some<a>(val: a): Option<a>', doc: 'Constructs an Option containing a value.' },
    { label: 'None', detail: 'None: Option<a>', doc: 'Represents an empty Option value.' },
    { label: 'Ok', detail: 'Ok<a, e>(val: a): Result<a, e>', doc: 'Constructs a success Result value.' },
    { label: 'Err', detail: 'Err<a, e>(err: e): Result<a, e>', doc: 'Constructs an error Result value.' },
    { label: 'Left', detail: 'Left<l, r>(left: l): Either<l, r>', doc: 'Constructs the Left variant of Either.' },
    { label: 'Right', detail: 'Right<l, r>(right: r): Either<l, r>', doc: 'Constructs the Right variant of Either.' },
    { label: 'Valid', detail: 'Valid<a>(val: a): Validation<a>', doc: 'Constructs a valid Validation value.' },
    { label: 'Invalid', detail: 'Invalid<a>(errs: [string]): Validation<a>', doc: 'Constructs an invalid Validation error accumulator.' },
    { label: 'true', detail: 'boolean (literal true)', doc: 'Boolean true constant value.' },
    { label: 'false', detail: 'boolean (literal false)', doc: 'Boolean false constant value.' }
  ];
  for (const c of constructors) {
    add({
      label: c.label,
      kind: c.label === 'true' || c.label === 'false' ? 'constant' : 'constructor',
      detail: c.detail,
      documentation: c.doc,
      insertText: c.label
    });
  }

  // H. Built-in types
  const builtinTypes = [
    'number', 'string', 'boolean', 'void', 'any', 'never', 'unknown',
    'Option', 'Result', 'List', 'Array', 'Map', 'Set', 'Promise'
  ];
  for (const t of builtinTypes) {
    add({
      label: t,
      kind: 'type',
      detail: `type ${t}`,
      documentation: `TypeLang type \`${t}\`.`,
      insertText: t
    });
  }

  // I. In-scope scoped symbols (function parameters, local variables, lambdas, patterns)
  for (let i = checker.symbols.length - 1; i >= 0; i--) {
    const s = checker.symbols[i];
    if (s.name && !s.name.startsWith('__')) {
      const isFun = s.type && (s.type.kind === 'fun' || (s.type.kind === 'poly' && s.type.type.kind === 'fun'));
      add({
        label: s.name,
        kind: isFun ? 'function' : s.kind === 'constructor' ? 'constructor' : s.kind === 'gadt' ? 'type' : 'variable',
        detail: s.type ? `${s.name}: ${typeToString(s.type)}` : s.name,
        documentation: s.doc || `In-scope ${s.kind} \`${s.name}\``,
        insertText: s.name
      });
    }
  }

  // F. Keywords & Language Snippets
  const snippets: CompletionItem[] = [
    {
      label: 'import',
      kind: 'snippet',
      detail: 'import Module.{ members }',
      insertText: 'import ${1:Module}.{ ${2:members} }',
      isSnippet: true,
      documentation: 'Import exported members from a module'
    },
    {
      label: 'let',
      kind: 'snippet',
      detail: 'let name = value',
      insertText: 'let ${1:name} = ${2:value};',
      isSnippet: true,
      documentation: 'Declare an immutable let variable binding'
    },
    {
      label: 'let mut',
      kind: 'snippet',
      detail: 'let mut name = value',
      insertText: 'let mut ${1:name} = ${2:value};',
      isSnippet: true,
      documentation: 'Declare a mutable variable binding'
    },
    {
      label: 'function',
      kind: 'snippet',
      detail: 'function name(param: type): returnType',
      insertText: 'function ${1:name}(${2:param}: ${3:number}): ${4:void} {\n  $0\n}',
      isSnippet: true,
      documentation: 'Define a function declaration'
    },
    {
      label: 'type (GADT)',
      kind: 'snippet',
      detail: 'type GADT<a> = | Ctor(val: a): GADT<a>',
      insertText: 'type ${1:Expr}<a> =\n  | ${2:Lit}(value: number): ${1:Expr}<number>\n  | ${3:Bool}(value: boolean): ${1:Expr}<boolean>',
      isSnippet: true,
      documentation: 'Declare a Generalized Algebraic Data Type (GADT)'
    },
    {
      label: 'match',
      kind: 'snippet',
      detail: 'match (expr) { Pattern => result }',
      insertText: 'match (${1:expr}) {\n  ${2:Pattern} => ${3:result}\n  ... => ${4:fallback}\n}',
      isSnippet: true,
      documentation: 'Exhaustive pattern match expression'
    },
    {
      label: 'switch',
      kind: 'snippet',
      detail: 'switch (expr) { case val => result }',
      insertText: 'switch (${1:expr}) {\n  case ${2:value} => ${3:result};\n  default => ${4:fallback};\n}',
      isSnippet: true,
      documentation: 'Multi-branch switch statement'
    },
    {
      label: 'module',
      kind: 'snippet',
      detail: 'module Name { export ... }',
      insertText: 'module ${1:ModuleName} {\n  export function ${2:doWork}(): ${3:void} {\n    $0\n  }\n}',
      isSnippet: true,
      documentation: 'Define a named module namespace with exports'
    },
    {
      label: 'extern function',
      kind: 'snippet',
      detail: 'extern function name(param: type): returnType;',
      insertText: 'extern function ${1:name}(${2:param}: ${3:string}): ${4:void};',
      isSnippet: true,
      documentation: 'Declare a foreign JavaScript function interface binding'
    },
    {
      label: 'if',
      kind: 'snippet',
      detail: 'if (condition) { ... }',
      insertText: 'if (${1:condition}) {\n  $0\n}',
      isSnippet: true,
      documentation: 'Conditional branch statement'
    },
    {
      label: 'if else',
      kind: 'snippet',
      detail: 'if (condition) { ... } else { ... }',
      insertText: 'if (${1:condition}) {\n  ${2:then}\n} else {\n  ${3:else}\n}',
      isSnippet: true,
      documentation: 'Conditional if-else branch statement'
    },
    {
      label: 'for',
      kind: 'snippet',
      detail: 'for (let mut i = 0; i < len; i = i + 1) { ... }',
      insertText: 'for (let mut ${1:i} = 0; ${1:i} < ${2:len}; ${1:i} = ${1:i} + 1) {\n  $0\n}',
      isSnippet: true,
      documentation: 'Standard iterative for-loop'
    },
    {
      label: 'while',
      kind: 'snippet',
      detail: 'while (condition) { ... }',
      insertText: 'while (${1:condition}) {\n  $0\n}',
      isSnippet: true,
      documentation: 'Conditional while-loop'
    },
    {
      label: 'do',
      kind: 'snippet',
      detail: 'do(Monad) { x <- comp; pure res }',
      insertText: 'do {\n  ${1:x} <- ${2:computation};\n  pure ${3:result};\n}',
      isSnippet: true,
      documentation: 'Monadic do-notation block with bind statements and pure return'
    },
    {
      label: 'where',
      kind: 'snippet',
      detail: 'where { let helper = val }',
      insertText: 'where {\n  let ${1:helper} = ${2:value};\n}',
      isSnippet: true,
      documentation: 'Scoped auxiliary bindings and helper functions'
    },
    {
      label: 'pure',
      kind: 'keyword',
      detail: 'pure value',
      insertText: 'pure ${1:value}',
      isSnippet: true,
      documentation: 'Lifts a pure value into the current monad'
    },
    {
      label: 'return',
      kind: 'keyword',
      detail: 'return value;',
      insertText: 'return ${1:value};',
      isSnippet: true,
      documentation: 'Returns a value from a function'
    },
    {
      label: 'export',
      kind: 'keyword',
      detail: 'export declaration',
      insertText: 'export ',
      documentation: 'Exports a symbol from the current module'
    }
  ];

  for (const snip of snippets) {
    add(snip);
  }

  return results;
}
