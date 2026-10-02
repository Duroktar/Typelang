// TypeScript Declaration (.d.ts) and NPM FFI Interface Parser for TypeLang
// Parses TypeScript declaration syntax (declare module, declare function, interface, type, declare class, declare const/let)
// and transforms them into TypeLang External Declarations (SExternFunction, SExternType, SExternModule)

import {
  TypeAST,
  TBase,
  TVar,
  TFun,
  TRecord,
  TApp,
  SExternModule,
  SExternFunction,
  SExternType,
  SExternValue
} from './ast';

export interface DTSParseResult {
  modules: SExternModule[];
  types: SExternType[];
  functions: SExternFunction[];
  values: SExternValue[];
  errors: string[];
  typeLangCodeSummary: string;
}

export class DTSParser {
  private input: string;
  private pos: number = 0;
  private len: number = 0;

  constructor(input: string) {
    this.input = input;
    this.len = input.length;
  }

  public parse(): DTSParseResult {
    const modules: SExternModule[] = [];
    const types: SExternType[] = [];
    const functions: SExternFunction[] = [];
    const values: SExternValue[] = [];
    const errors: string[] = [];

    while (this.skipTrivia()) {
      try {
        if (this.matchKeyword('declare') || this.matchKeyword('export')) {
          this.skipTrivia();
          if (this.matchKeyword('declare')) {
            this.skipTrivia();
          }

          if (this.matchKeyword('module') || this.matchKeyword('namespace')) {
            const mod = this.parseDeclareModule();
            if (mod) modules.push(mod);
            continue;
          }

          if (this.matchKeyword('function')) {
            const fn = this.parseDeclareFunction();
            if (fn) functions.push(fn);
            continue;
          }

          if (this.matchKeyword('interface')) {
            const iface = this.parseInterface();
            if (iface) types.push(iface);
            continue;
          }

          if (this.matchKeyword('type')) {
            const tAlias = this.parseTypeAlias();
            if (tAlias) types.push(tAlias);
            continue;
          }

          if (this.matchKeyword('const') || this.matchKeyword('let') || this.matchKeyword('var')) {
            const val = this.parseDeclareVal();
            if (val) values.push(val);
            continue;
          }
        } else if (this.matchKeyword('interface')) {
          const iface = this.parseInterface();
          if (iface) types.push(iface);
          continue;
        } else if (this.matchKeyword('type')) {
          const tAlias = this.parseTypeAlias();
          if (tAlias) types.push(tAlias);
          continue;
        } else if (this.matchKeyword('function')) {
          const fn = this.parseDeclareFunction();
          if (fn) functions.push(fn);
          continue;
        }

        // Unrecognized token; skip word or character to recover
        this.advanceWordOrChar();
      } catch (err: any) {
        errors.push(err.message || String(err));
        this.advanceWordOrChar();
      }
    }

    const typeLangCodeSummary = this.generateTypeLangCode(modules, types, functions, values);

    return {
      modules,
      types,
      functions,
      values,
      errors,
      typeLangCodeSummary
    };
  }

  // ==================== PARSERS ====================

  private parseDeclareModule(): SExternModule | null {
    this.skipTrivia();
    let moduleName = '';
    if (this.peek() === '"' || this.peek() === "'") {
      moduleName = this.parseStringLiteral();
    } else {
      moduleName = this.parseIdentifier();
    }

    this.skipTrivia();
    if (!this.matchChar('{')) {
      return null;
    }

    const functions: SExternFunction[] = [];
    const types: SExternType[] = [];
    const values: SExternValue[] = [];

    while (this.skipTrivia() && this.peek() !== '}') {
      try {
        if (this.matchKeyword('export') || this.matchKeyword('declare')) {
          this.skipTrivia();
          if (this.matchKeyword('export') || this.matchKeyword('declare')) {
            this.skipTrivia();
          }
        }

        if (this.matchKeyword('function')) {
          const fn = this.parseDeclareFunction(moduleName);
          if (fn) functions.push(fn);
        } else if (this.matchKeyword('interface')) {
          const iface = this.parseInterface();
          if (iface) types.push(iface);
        } else if (this.matchKeyword('type')) {
          const tAlias = this.parseTypeAlias();
          if (tAlias) types.push(tAlias);
        } else if (this.matchKeyword('const') || this.matchKeyword('let') || this.matchKeyword('var')) {
          const val = this.parseDeclareVal(moduleName);
          if (val) values.push(val);
        } else {
          this.advanceWordOrChar();
        }
      } catch {
        this.advanceWordOrChar();
      }
    }

    this.matchChar('}');

    return {
      kind: 's_extern_module',
      name: moduleName,
      functions,
      types,
      values
    };
  }

  private parseDeclareFunction(moduleName?: string): SExternFunction | null {
    this.skipTrivia();
    const name = this.parseIdentifier();
    if (!name) return null;

    let typeParams: string[] = [];
    this.skipTrivia();
    if (this.peek() === '<') {
      typeParams = this.parseTypeParams();
    }

    this.skipTrivia();
    if (!this.matchChar('(')) return null;

    const params: { name: string; type: TypeAST; isOptional?: boolean }[] = [];
    while (this.skipTrivia() && this.peek() !== ')') {
      const paramName = this.parseIdentifier();
      this.skipTrivia();
      const isOptional = this.matchChar('?');
      this.skipTrivia();
      let paramType: TypeAST = { kind: 'base', name: 'string' };
      if (this.matchChar(':')) {
        paramType = this.parseTSType();
      }
      params.push({ name: paramName || `p${params.length}`, type: paramType, isOptional });
      this.skipTrivia();
      if (!this.matchChar(',')) break;
    }
    this.matchChar(')');

    this.skipTrivia();
    let returnType: TypeAST = { kind: 'base', name: 'void' };
    if (this.matchChar(':')) {
      returnType = this.parseTSType();
    }

    this.skipTrivia();
    this.matchChar(';');

    return {
      kind: 's_extern_function',
      name,
      moduleName,
      typeParams,
      params,
      returnType,
      jsSymbol: name
    };
  }

  private parseInterface(): SExternType | null {
    this.skipTrivia();
    const name = this.parseIdentifier();
    if (!name) return null;

    let typeParams: string[] = [];
    this.skipTrivia();
    if (this.peek() === '<') {
      typeParams = this.parseTypeParams();
    }

    this.skipTrivia();
    // optional extends
    if (this.matchKeyword('extends')) {
      while (this.skipTrivia() && this.peek() !== '{') {
        this.advanceWordOrChar();
      }
    }

    if (!this.matchChar('{')) return null;

    const fields: { name: string; type: TypeAST; isOptional?: boolean; isMut?: boolean }[] = [];

    while (this.skipTrivia() && this.peek() !== '}') {
      try {
        const isReadonly = this.matchKeyword('readonly');
        this.skipTrivia();
        const fieldName = this.parseIdentifierOrString();
        if (!fieldName) {
          this.advanceWordOrChar();
          continue;
        }

        this.skipTrivia();
        const isOptional = this.matchChar('?');
        this.skipTrivia();

        let fieldType: TypeAST = { kind: 'base', name: 'string' };
        if (this.matchChar(':')) {
          fieldType = this.parseTSType();
        } else if (this.peek() === '(') {
          // Method signature in interface e.g. run(x: number): void;
          this.matchChar('(');
          const methodParams: { name: string; type: TypeAST }[] = [];
          while (this.skipTrivia() && this.peek() !== ')') {
            const pName = this.parseIdentifier();
            this.skipTrivia();
            this.matchChar('?');
            this.skipTrivia();
            let pType: TypeAST = { kind: 'base', name: 'string' };
            if (this.matchChar(':')) pType = this.parseTSType();
            methodParams.push({ name: pName, type: pType });
            this.skipTrivia();
            if (!this.matchChar(',')) break;
          }
          this.matchChar(')');
          this.skipTrivia();
          let retType: TypeAST = { kind: 'base', name: 'void' };
          if (this.matchChar(':')) retType = this.parseTSType();
          fieldType = {
            kind: 'fun',
            typeParams: [],
            params: methodParams,
            returnType: retType
          };
        }

        fields.push({
          name: fieldName,
          type: fieldType,
          isOptional,
          isMut: !isReadonly
        });

        this.skipTrivia();
        this.matchChar(';') || this.matchChar(',');
      } catch {
        this.advanceWordOrChar();
      }
    }

    this.matchChar('}');

    return {
      kind: 's_extern_type',
      name,
      typeParams,
      type: {
        kind: 'record',
        fields: fields.map(f => ({
          name: f.name,
          type: f.type,
          isOptional: f.isOptional,
          isMut: f.isMut
        }))
      }
    };
  }

  private parseTypeAlias(): SExternType | null {
    this.skipTrivia();
    const name = this.parseIdentifier();
    if (!name) return null;

    let typeParams: string[] = [];
    this.skipTrivia();
    if (this.peek() === '<') {
      typeParams = this.parseTypeParams();
    }

    this.skipTrivia();
    if (!this.matchChar('=')) return null;

    const type = this.parseTSType();
    this.skipTrivia();
    this.matchChar(';');

    return {
      kind: 's_extern_type',
      name,
      typeParams,
      type
    };
  }

  private parseDeclareVal(moduleName?: string): SExternValue | null {
    this.skipTrivia();
    const name = this.parseIdentifier();
    if (!name) return null;

    this.skipTrivia();
    let valType: TypeAST = { kind: 'base', name: 'string' };
    if (this.matchChar(':')) {
      valType = this.parseTSType();
    }

    this.skipTrivia();
    this.matchChar(';');

    return {
      kind: 's_extern_value',
      name,
      moduleName,
      type: valType,
      jsSymbol: name
    };
  }

  // ==================== TYPE PARSER ====================

  private parseTSType(): TypeAST {
    this.skipTrivia();

    // Arrow Function: (a: number, b: string) => boolean
    if (this.peek() === '(') {
      const savedPos = this.pos;
      try {
        this.advance(); // '('
        const params: { name: string; type: TypeAST }[] = [];
        while (this.skipTrivia() && this.peek() !== ')') {
          const pName = this.parseIdentifier();
          this.skipTrivia();
          this.matchChar('?');
          this.skipTrivia();
          let pType: TypeAST = { kind: 'base', name: 'string' };
          if (this.matchChar(':')) pType = this.parseTSType();
          params.push({ name: pName, type: pType });
          this.skipTrivia();
          if (!this.matchChar(',')) break;
        }
        if (this.matchChar(')')) {
          this.skipTrivia();
          if (this.matchStr('=>')) {
            const retType = this.parseTSType();
            return {
              kind: 'fun',
              typeParams: [],
              params,
              returnType: retType
            };
          }
        }
      } catch {
        // backtrack
        this.pos = savedPos;
      }
    }

    // Object Record type: { a: number, b: string }
    if (this.peek() === '{') {
      this.advance();
      const fields: { name: string; type: TypeAST; isMut?: boolean; isOptional?: boolean }[] = [];
      while (this.skipTrivia() && this.peek() !== '}') {
        const isReadonly = this.matchKeyword('readonly');
        this.skipTrivia();
        const fieldName = this.parseIdentifierOrString();
        if (!fieldName) {
          this.advanceWordOrChar();
          continue;
        }
        this.skipTrivia();
        const isOptional = this.matchChar('?');
        this.skipTrivia();
        let fieldType: TypeAST = { kind: 'base', name: 'string' };
        if (this.matchChar(':')) {
          fieldType = this.parseTSType();
        }
        fields.push({
          name: fieldName,
          type: fieldType,
          isMut: !isReadonly,
          isOptional
        });
        this.skipTrivia();
        this.matchChar(';') || this.matchChar(',');
      }
      this.matchChar('}');
      let recType: TypeAST = { kind: 'record', fields };
      return this.checkPostTypeModifiers(recType);
    }

    // Tuple type: [number, string]
    if (this.peek() === '[') {
      this.advance();
      const elements: TypeAST[] = [];
      while (this.skipTrivia() && this.peek() !== ']') {
        elements.push(this.parseTSType());
        this.skipTrivia();
        if (!this.matchChar(',')) break;
      }
      this.matchChar(']');
      let tupType: TypeAST = { kind: 'tuple', elements };
      return this.checkPostTypeModifiers(tupType);
    }

    // Primitive or Named Identifier
    const ident = this.parseIdentifier();
    let baseType: TypeAST;

    if (ident === 'number') {
      baseType = { kind: 'base', name: 'number' };
    } else if (ident === 'string') {
      baseType = { kind: 'base', name: 'string' };
    } else if (ident === 'boolean') {
      baseType = { kind: 'base', name: 'boolean' };
    } else if (ident === 'void' || ident === 'undefined' || ident === 'null' || ident === 'never') {
      baseType = { kind: 'base', name: 'void' };
    } else if (ident === 'any' || ident === 'unknown') {
      // Map unknown/any to polymorphic generic TVar
      baseType = { kind: 'var', name: 'any' };
    } else if (ident === 'Array' || ident === 'ReadonlyArray') {
      this.skipTrivia();
      if (this.peek() === '<') {
        const args = this.parseTypeArgs();
        baseType = { kind: 'app', name: 'Array', args };
      } else {
        baseType = { kind: 'app', name: 'Array', args: [{ kind: 'var', name: 'any' }] };
      }
    } else if (ident === 'Promise') {
      this.skipTrivia();
      if (this.peek() === '<') {
        const args = this.parseTypeArgs();
        baseType = { kind: 'app', name: 'Promise', args };
      } else {
        baseType = { kind: 'app', name: 'Promise', args: [{ kind: 'base', name: 'void' }] };
      }
    } else if (ident) {
      this.skipTrivia();
      if (this.peek() === '<') {
        const args = this.parseTypeArgs();
        baseType = { kind: 'app', name: ident, args };
      } else {
        baseType = { kind: 'var', name: ident };
      }
    } else {
      baseType = { kind: 'base', name: 'string' };
    }

    return this.checkPostTypeModifiers(baseType);
  }

  private checkPostTypeModifiers(baseType: TypeAST): TypeAST {
    this.skipTrivia();
    let curr = baseType;

    // Array brackets: T[]
    while (this.matchStr('[]')) {
      curr = { kind: 'app', name: 'Array', args: [curr] };
      this.skipTrivia();
    }

    // Union type: T | U (Take primary branch for TypeLang safety or synthesize variant)
    if (this.matchChar('|')) {
      const right = this.parseTSType();
      // If right is null/undefined, mark nullable/optional or union representation
      this.skipTrivia();
    }

    return curr;
  }

  private parseTypeParams(): string[] {
    const params: string[] = [];
    if (!this.matchChar('<')) return params;
    while (this.skipTrivia() && this.peek() !== '>') {
      const p = this.parseIdentifier();
      if (p) params.push(p);
      this.skipTrivia();
      // Skip extends constraint e.g. T extends HTMLElement
      if (this.matchKeyword('extends')) {
        while (this.skipTrivia() && this.peek() !== ',' && this.peek() !== '>') {
          this.advanceWordOrChar();
        }
      }
      this.skipTrivia();
      if (!this.matchChar(',')) break;
    }
    this.matchChar('>');
    return params;
  }

  private parseTypeArgs(): TypeAST[] {
    const args: TypeAST[] = [];
    if (!this.matchChar('<')) return args;
    while (this.skipTrivia() && this.peek() !== '>') {
      args.push(this.parseTSType());
      this.skipTrivia();
      if (!this.matchChar(',')) break;
    }
    this.matchChar('>');
    return args;
  }

  // ==================== SCANNER HELPERS ====================

  private peek(): string {
    return this.pos < this.len ? this.input[this.pos] : '';
  }

  private advance(): string {
    return this.pos < this.len ? this.input[this.pos++] : '';
  }

  private matchChar(ch: string): boolean {
    if (this.peek() === ch) {
      this.advance();
      return true;
    }
    return false;
  }

  private matchStr(str: string): boolean {
    if (this.input.startsWith(str, this.pos)) {
      this.pos += str.length;
      return true;
    }
    return false;
  }

  private matchKeyword(kw: string): boolean {
    if (this.input.startsWith(kw, this.pos)) {
      const nextChar = this.input[this.pos + kw.length] || '';
      if (!/[a-zA-Z0-9_$]/.test(nextChar)) {
        this.pos += kw.length;
        return true;
      }
    }
    return false;
  }

  private parseIdentifier(): string {
    this.skipTrivia();
    let id = '';
    while (this.pos < this.len && /[a-zA-Z0-9_$]/.test(this.input[this.pos])) {
      id += this.input[this.pos++];
    }
    return id;
  }

  private parseIdentifierOrString(): string {
    this.skipTrivia();
    if (this.peek() === '"' || this.peek() === "'") {
      return this.parseStringLiteral();
    }
    return this.parseIdentifier();
  }

  private parseStringLiteral(): string {
    const quote = this.advance();
    let str = '';
    while (this.pos < this.len && this.peek() !== quote) {
      if (this.peek() === '\\') this.advance();
      str += this.advance();
    }
    this.matchChar(quote);
    return str;
  }

  private advanceWordOrChar(): void {
    if (/[a-zA-Z0-9_$]/.test(this.peek())) {
      while (this.pos < this.len && /[a-zA-Z0-9_$]/.test(this.peek())) {
        this.advance();
      }
    } else {
      this.advance();
    }
  }

  private skipTrivia(): boolean {
    while (this.pos < this.len) {
      const ch = this.input[this.pos];
      if (/\s/.test(ch)) {
        this.pos++;
        continue;
      }
      // Single line comment //
      if (ch === '/' && this.input[this.pos + 1] === '/') {
        while (this.pos < this.len && this.input[this.pos] !== '\n') {
          this.pos++;
        }
        continue;
      }
      // Multiline comment /* */
      if (ch === '/' && this.input[this.pos + 1] === '*') {
        this.pos += 2;
        while (this.pos < this.len && !(this.input[this.pos] === '*' && this.input[this.pos + 1] === '/')) {
          this.pos++;
        }
        if (this.pos < this.len) this.pos += 2;
        continue;
      }
      break;
    }
    return this.pos < this.len;
  }

  // ==================== CODE GENERATOR FOR TYPELANG ====================

  private generateTypeLangCode(
    modules: SExternModule[],
    types: SExternType[],
    functions: SExternFunction[],
    values: SExternValue[]
  ): string {
    const lines: string[] = [
      '// ==========================================',
      '// TypeLang Foreign Function Interface (FFI)',
      '// Auto-generated from TypeScript (.d.ts)',
      '// ==========================================',
      ''
    ];

    // Global types
    for (const t of types) {
      const tParams = t.typeParams.length > 0 ? `<${t.typeParams.join(', ')}>` : '';
      lines.push(`extern type ${t.name}${tParams} = ${this.typeASTToString(t.type)}`);
    }
    if (types.length > 0) lines.push('');

    // Global values
    for (const v of values) {
      lines.push(`extern let ${v.name}: ${this.typeASTToString(v.type)}`);
    }
    if (values.length > 0) lines.push('');

    // Global functions
    for (const fn of functions) {
      const tParams = fn.typeParams.length > 0 ? `<${fn.typeParams.join(', ')}>` : '';
      const params = fn.params.map(p => `${p.name}: ${this.typeASTToString(p.type)}`).join(', ');
      lines.push(`extern function ${fn.name}${tParams}(${params}): ${this.typeASTToString(fn.returnType)}`);
    }
    if (functions.length > 0) lines.push('');

    // Modules (e.g. npm packages like "zod", "canvas-confetti", "lodash")
    for (const mod of modules) {
      const sanitizedName = mod.name.replace(/[^a-zA-Z0-9_]/g, '_');
      lines.push(`extern module ${sanitizedName} {`);

      for (const t of mod.types) {
        const tParams = t.typeParams.length > 0 ? `<${t.typeParams.join(', ')}>` : '';
        lines.push(`  type ${t.name}${tParams} = ${this.typeASTToString(t.type)}`);
      }

      for (const v of mod.values) {
        lines.push(`  let ${v.name}: ${this.typeASTToString(v.type)}`);
      }

      for (const fn of mod.functions) {
        const tParams = fn.typeParams.length > 0 ? `<${fn.typeParams.join(', ')}>` : '';
        const params = fn.params.map(p => `${p.name}: ${this.typeASTToString(p.type)}`).join(', ');
        lines.push(`  function ${fn.name}${tParams}(${params}): ${this.typeASTToString(fn.returnType)}`);
      }

      lines.push('}');
      lines.push('');
    }

    return lines.join('\n');
  }

  private typeASTToString(t: TypeAST): string {
    switch (t.kind) {
      case 'base':
        return t.name;
      case 'var':
        return t.name;
      case 'fun': {
        const params = t.params.map(p => (p.name ? `${p.name}: ${this.typeASTToString(p.type)}` : this.typeASTToString(p.type))).join(', ');
        return `(${params}) => ${this.typeASTToString(t.returnType)}`;
      }
      case 'record': {
        const fields = t.fields.map(f => `${f.isMut ? 'mut ' : ''}${f.name}: ${this.typeASTToString(f.type)}`).join(', ');
        return `{ ${fields} }`;
      }
      case 'tuple': {
        return `[${t.elements.map(e => this.typeASTToString(e)).join(', ')}]`;
      }
      case 'app': {
        if (t.name === 'Array' && t.args.length === 1) {
          return `[${this.typeASTToString(t.args[0])}]`;
        }
        return `${t.name}<${t.args.map(a => this.typeASTToString(a)).join(', ')}>`;
      }
      case 'forall':
        return `<${t.typeParams.join(', ')}> ${this.typeASTToString(t.type)}`;
      default:
        return 'string';
    }
  }
}

// ==================== BUILT-IN POPULAR NPM DECLARATION PRESETS ====================

export interface NPMPackagePreset {
  id: string;
  name: string;
  version: string;
  description: string;
  dts: string;
  sampleTypeLangCode: string;
}

export const NPM_POPULAR_PRESETS: NPMPackagePreset[] = [
  {
    id: 'canvas_confetti',
    name: 'canvas-confetti',
    version: '1.9.4',
    description: 'High performance particle confetti animations for web apps and games.',
    dts: `declare module "confetti" {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: { x: number; y: number };
    colors?: string[];
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  function confetti(options?: ConfettiOptions): Promise<void>;
  function reset(): void;
}`,
    sampleTypeLangCode: `import DOM.{ h, mount }
extern module confetti {
  function confetti(options: { particleCount: number, spread: number, startVelocity: number }): void
}

let vnode = h("div", { className: "p-8 text-center space-y-4 font-sans text-slate-100" }, [
  h("h2", { className: "text-2xl font-bold bg-gradient-to-r from-pink-400 to-amber-300 bg-clip-text text-transparent" }, 
    "TypeLang + NPM FFI Confetti"
  ),
  h("p", { className: "text-xs text-slate-400" }, "Calling external canvas-confetti npm package with full compile-time type safety!"),
  h("button", {
    className: "px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-pink-500/25 transition cursor-pointer active:scale-95",
    onClick: fn() {
      // Direct Type-Safe FFI Invocation!
      confetti.confetti({
        particleCount: 120,
        spread: 70,
        startVelocity: 45
      })
      println("Spawned 120 confetti particles via TypeLang FFI!")
    }
  }, "🎉 Launch Confetti Burst!")
])

mount("app-root", vnode)
println("Mounted Confetti FFI Demo.")
`
  },
  {
    id: 'lodash_fp',
    name: 'lodash (Data Utilities)',
    version: '4.17.21',
    description: 'Popular functional utilities for arrays, objects, math, and string manipulation.',
    dts: `declare module "lodash" {
  function chunk<T>(arr: T[], size: number): T[][];
  function compact<T>(arr: T[]): T[];
  function uniq<T>(arr: T[]): T[];
  function shuffle<T>(arr: T[]): T[];
  function sum(arr: number[]): number;
  function mean(arr: number[]): number;
  function clamp(val: number, lower: number, upper: number): number;
  function camelCase(str: string): string;
  function kebabCase(str: string): string;
}`,
    sampleTypeLangCode: `extern module lodash {
  function chunk<T>(arr: [T], size: number): [[T]]
  function uniq<T>(arr: [T], ...): [T]
  function sum(arr: [number]): number
  function mean(arr: [number]): number
  function camelCase(str: string): string
}

let numbers = [10, 20, 30, 40, 50, 60, 70]
let total = lodash.sum(numbers)
let average = lodash.mean(numbers)
let chunks = lodash.chunk(numbers, 3)

println(concat("Total Sum: ", to_string(total)))
println(concat("Average Mean: ", to_string(average)))
println(concat("CamelCase: ", lodash.camelCase("type lang foreign function interface")))
`
  },
  {
    id: 'zod_schema',
    name: 'zod (Type-Safe Validation)',
    version: '3.23.8',
    description: 'TypeScript-first schema declaration and validation library.',
    dts: `declare module "zod" {
  interface ZodString {
    min(length: number): ZodString;
    max(length: number): ZodString;
    email(): ZodString;
    parse(val: string): string;
  }

  interface ZodNumber {
    min(value: number): ZodNumber;
    max(value: number): ZodNumber;
    positive(): ZodNumber;
    parse(val: number): number;
  }

  function string(): ZodString;
  function number(): ZodNumber;
  function boolean(): any;
}`,
    sampleTypeLangCode: `extern module zod {
  function string(): { min: (n: number) => any, email: () => any, parse: (val: string) => string }
  function number(): { min: (n: number) => any, parse: (val: number) => number }
}

let userEmailSchema = zod.string().email()
let userAgeSchema = zod.number().min(18)

println("Zod validation schemas initialized with TypeLang FFI safety.")
`
  }
];
