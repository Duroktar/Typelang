// ============================================================================
// WebAssembly (WAT / WASM) Code Generator & Runtime for TypeLang
// ============================================================================

import {
  Program,
  Statement,
  Expr,
  SFunction,
  SLet,
  SExpr,
  SGADT,
  ELiteral,
  EVar,
  EBinary,
  EUnary,
  ECall,
  EIf,
  EBlock,
  EWhile,
  EFor,
  EIndex,
  EAssign,
  EFieldAccess,
  ERecord,
  EMatch,
  ELambda,
  Pattern,
  MatchArm
} from './ast';

export interface WasmCodeGenOptions {
  includeHostImports?: boolean;
  initialMemoryPages?: number;
  maxMemoryPages?: number;
}

export interface WasmExecutionResult {
  stdout: string[];
  result?: any;
  exitCode: number;
  executionTimeMs: number;
  watSource: string;
  binarySizeBytes: number;
  error?: string;
}

export interface GADTConstructorInfo {
  name: string;
  tag: number;
  arity: number;
  typeName: string;
}

export class WasmCodeGenerator {
  private indentLevel = 0;
  private stringTable = new Map<string, { offset: number; len: number }>();
  private nextStringOffset = 1024;
  private functionNames = new Set<string>();
  private fnSignatures = new Map<string, 'void' | 'f64' | 'i32'>();
  private currentLocals = new Map<string, string>(); // name -> wasm type ('f64' | 'i32')
  private localCounter = 0;
  private loopStack: { exit: string; loop: string }[] = [];

  private gadtConstructors = new Map<string, GADTConstructorInfo>();
  private zeroArityCtors = new Set<string>();
  private lambdas: { id: number; funcName: string; expr: ELambda }[] = [];
  private lambdaCounter = 0;
  private topLevelGlobals = new Map<string, 'f64' | 'i32'>();
  private capturedGlobals = new Set<string>();
  private isTopLevel = false;

  private indent(): string {
    return '  '.repeat(this.indentLevel);
  }

  private registerString(text: string): { offset: number; len: number } {
    if (this.stringTable.has(text)) {
      return this.stringTable.get(text)!;
    }
    const utf8Bytes = new TextEncoder().encode(text);
    const len = utf8Bytes.length;
    const offset = this.nextStringOffset;
    // Align string to 8 bytes: 4 bytes for length prefix + len bytes + 1 byte null terminator
    const totalAlloc = ((4 + len + 1 + 7) & ~7);
    this.nextStringOffset += totalAlloc;
    const info = { offset, len };
    this.stringTable.set(text, info);
    return info;
  }

  private sanitizeWasmIdent(name: string): string {
    return name.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  private registerConstructor(name: string, tag: number, arity: number, typeName: string) {
    this.gadtConstructors.set(name, { name, tag, arity, typeName });
    if (arity === 0) {
      this.zeroArityCtors.add(name);
    }
    this.functionNames.add(name);
    this.fnSignatures.set(name, 'i32');
  }

  private isStringExpr(expr: Expr): boolean {
    if (!expr) return false;
    if (expr.kind === 'e_literal' && typeof expr.value === 'string') return true;
    if (expr.kind === 'e_var') {
      const type = this.currentLocals.get(expr.name) || this.topLevelGlobals.get(expr.name);
      return type === 'i32';
    }
    if (expr.kind === 'e_call' && expr.callee.kind === 'e_var') {
      const name = expr.callee.name;
      if (['concat', 'to_string', 'read_file', 'get_cli_arg', 'String_slice', 'String_charAt', 'char_at', 'charAt'].includes(name)) {
        return true;
      }
      return this.fnSignatures.get(name) === 'i32';
    }
    if (expr.kind === 'e_method_call') {
      if (['charAt', 'char_at'].includes(expr.method)) return true;
    }
    return false;
  }

  private isI32Expr(expr: Expr): boolean {
    if (!expr) return false;
    if (expr.kind === 'e_literal' && typeof expr.value === 'string') return true;
    if (expr.kind === 'e_tuple' || expr.kind === 'e_record') return true;
    if (expr.kind === 'e_var') {
      if (this.zeroArityCtors.has(expr.name)) return true;
      const type = this.currentLocals.get(expr.name) || this.topLevelGlobals.get(expr.name);
      return type === 'i32';
    }
    if (expr.kind === 'e_call' && expr.callee.kind === 'e_var') {
      const name = expr.callee.name;
      if (this.gadtConstructors.has(name)) return true;
      if (['concat', 'to_string', 'read_file', 'get_cli_arg', 'String_slice', 'String_charAt', 'char_at', 'charAt'].includes(name)) {
        return true;
      }
      return this.fnSignatures.get(name) === 'i32';
    }
    return false;
  }

  private ensureF64(expr: Expr, wat: string): string {
    const trimmed = wat.trim();
    if (!trimmed) return `${this.indent()}(f64.const 0)`;
    if (this.isI32Expr(expr)) {
      return `${this.indent()}(f64.convert_i32_u\n${wat}\n${this.indent()})`;
    }
    return wat;
  }

  private ensureI32(expr: Expr, wat: string): string {
    const trimmed = wat.trim();
    if (!trimmed) return `${this.indent()}(i32.const 0)`;
    if (!this.isI32Expr(expr)) {
      return `${this.indent()}(i32.trunc_f64_u\n${wat}\n${this.indent()})`;
    }
    return wat;
  }

  public generateWat(program: Program, options: WasmCodeGenOptions = {}): string {
    this.stringTable.clear();
    this.nextStringOffset = 1024;
    this.functionNames.clear();
    this.fnSignatures.clear();
    this.gadtConstructors.clear();
    this.zeroArityCtors.clear();
    this.lambdas = [];
    this.lambdaCounter = 0;
    this.topLevelGlobals.clear();
    this.capturedGlobals.clear();
    this.loopStack = [];

    // Register built-in function signatures
    this.fnSignatures.set('println', 'void');
    this.fnSignatures.set('print', 'void');
    this.fnSignatures.set('concat', 'i32');
    this.fnSignatures.set('to_string', 'i32');
    this.fnSignatures.set('len', 'f64');
    this.fnSignatures.set('push', 'i32');
    this.fnSignatures.set('char_at', 'i32');
    this.fnSignatures.set('charAt', 'i32');
    this.fnSignatures.set('time_now', 'f64');
    this.fnSignatures.set('read_file', 'i32');
    this.fnSignatures.set('write_file', 'f64');
    this.fnSignatures.set('get_cli_arg', 'i32');
    this.fnSignatures.set('parse_int', 'f64');
    this.fnSignatures.set('parse_float', 'f64');

    // Register standard Prelude constructors
    this.registerConstructor('Some', 0, 1, 'Option');
    this.registerConstructor('None', 1, 0, 'Option');
    this.registerConstructor('Ok', 0, 1, 'Result');
    this.registerConstructor('Err', 1, 1, 'Result');
    this.registerConstructor('Left', 0, 1, 'Either');
    this.registerConstructor('Right', 1, 1, 'Either');
    this.registerConstructor('Cons', 0, 2, 'List');
    this.registerConstructor('Nil', 1, 0, 'List');

    // Collect GADT definitions from program statements
    for (const stmt of program.statements) {
      if (stmt.kind === 's_gadt') {
        stmt.decl.constructors.forEach((ctor, idx) => {
          this.registerConstructor(ctor.name, idx, ctor.params.length, stmt.decl.name);
        });
      }
    }

    // Collect all user functions
    for (const stmt of program.statements) {
      if (stmt.kind === 's_function') {
        this.functionNames.add(stmt.name);
        let retKind: 'void' | 'f64' | 'i32' = 'f64';
        if (stmt.returnType) {
          const typeName = (stmt.returnType as any).name;
          const typeKind = (stmt.returnType as any).kind;
          if (typeName === 'void') {
            retKind = 'void';
          } else if (typeName === 'string' || typeKind === 't_array') {
            retKind = 'i32';
          } else {
            retKind = 'f64';
          }
        }
        this.fnSignatures.set(stmt.name, retKind);
      }
    }

    // Collect captured parameter and pattern variables across AST
    const scanParams = (node: any) => {
      if (!node) return;
      if (node.kind === 's_function' && node.params) {
        for (const p of node.params) this.capturedGlobals.add(p.name);
      }
      if (node.kind === 'e_lambda' && node.params) {
        for (const p of node.params) this.capturedGlobals.add(p.name);
      }
      if (node.kind === 'p_var' && node.name) {
        this.capturedGlobals.add(node.name);
      }
      for (const k of Object.keys(node)) {
        const val = node[k];
        if (val && typeof val === 'object') {
          if (Array.isArray(val)) {
            val.forEach(scanParams);
          } else {
            scanParams(val);
          }
        }
      }
    };
    scanParams(program);

    // Collect top-level let variable names
    for (const stmt of program.statements) {
      if (stmt.kind === 's_let') {
        let type: 'f64' | 'i32' = 'f64';
        if (stmt.typeAnnotation) {
          const tName = (stmt.typeAnnotation as any).name;
          const tKind = (stmt.typeAnnotation as any).kind;
          if (tName === 'string' || tKind === 't_array') type = 'i32';
        }
        if (type === 'f64' && stmt.init) {
          if ((stmt.init.kind === 'e_literal' && typeof stmt.init.value === 'string') ||
              (stmt.init.kind === 'e_tuple' || stmt.init.kind === 'e_record') ||
              this.isStringExpr(stmt.init)) {
            type = 'i32';
          }
        }
        this.topLevelGlobals.set(stmt.name, type);
      }
    }

    const initialPages = options.initialMemoryPages || 2;
    const maxPages = options.maxMemoryPages || 100;

    // Generate GADT constructor helper functions
    const ctorFunctionsWat: string[] = [];
    for (const ctor of this.gadtConstructors.values()) {
      const ctorName = this.sanitizeWasmIdent(ctor.name);
      if (ctor.arity === 0) {
        ctorFunctionsWat.push([
          `  (func $${ctorName} (result i32)`,
          `    (call $gadt_create (i32.const ${ctor.tag}) (i32.const 0))`,
          `  )`
        ].join('\n'));
      } else {
        const paramsStr = Array.from({ length: ctor.arity }, (_, i) => `(param $p${i} f64)`).join(' ');
        const setFields = Array.from({ length: ctor.arity }, (_, i) =>
          `    (call $gadt_set_field (local.get $ptr) (i32.const ${i}) (local.get $p${i}))`
        ).join('\n');
        ctorFunctionsWat.push([
          `  (func $${ctorName} ${paramsStr} (result i32)`,
          `    (local $ptr i32)`,
          `    (local.set $ptr (call $gadt_create (i32.const ${ctor.tag}) (i32.const ${ctor.arity})))`,
          setFields,
          `    (local.get $ptr)`,
          `  )`
        ].join('\n'));
      }
    }

    const functionsWat: string[] = [];
    const mainBodyWat: string[] = [];

    // Generate user functions
    this.isTopLevel = false;
    for (const stmt of program.statements) {
      if (stmt.kind === 's_function') {
        functionsWat.push(this.generateFunction(stmt));
      }
    }

    // Generate main body
    this.currentLocals.clear();
    this.localCounter = 0;
    this.indentLevel = 2;
    this.isTopLevel = true;
    for (const stmt of program.statements) {
      if (stmt.kind !== 's_function') {
        const sWat = this.generateStatement(stmt);
        if (sWat.trim()) {
          mainBodyWat.push(sWat);
        }
      }
    }
    this.isTopLevel = false;

    // Generate lambdas that were registered during expression generation
    const lambdasWat: string[] = [];
    let lIdx = 0;
    while (lIdx < this.lambdas.length) {
      const l = this.lambdas[lIdx++];
      lambdasWat.push(this.generateLambda(l));
    }

    // Build data section for static string table
    const dataSegments: string[] = [];
    for (const [text, info] of this.stringTable.entries()) {
      const bytes = new TextEncoder().encode(text);
      const len = bytes.length;
      // 4-byte little endian length
      const lenBytes = [
        (len & 0xff).toString(16).padStart(2, '0'),
        ((len >> 8) & 0xff).toString(16).padStart(2, '0'),
        ((len >> 16) & 0xff).toString(16).padStart(2, '0'),
        ((len >> 24) & 0xff).toString(16).padStart(2, '0')
      ];
      let hexStr = lenBytes.map(h => `\\${h}`).join('');
      for (let i = 0; i < len; i++) {
        const b = bytes[i];
        if (b >= 32 && b <= 126 && b !== 34 && b !== 92) {
          hexStr += String.fromCharCode(b);
        } else {
          hexStr += `\\${b.toString(16).padStart(2, '0')}`;
        }
      }
      hexStr += '\\00';
      dataSegments.push(`  (data (i32.const ${info.offset}) "${hexStr}")`);
    }

    // Generate locals for main
    const mainLocalsWat: string[] = [];
    for (const [name, type] of this.currentLocals.entries()) {
      mainLocalsWat.push(`    (local $${this.sanitizeWasmIdent(name)} ${type})`);
    }

    // Declare mutable WebAssembly globals for top-level variables and captured closure variables
    const globalsWat: string[] = [];
    for (const [name, type] of this.topLevelGlobals.entries()) {
      const initVal = type === 'i32' ? '(i32.const 0)' : '(f64.const 0.0)';
      globalsWat.push(`  (global $${this.sanitizeWasmIdent(name)} (mut ${type}) ${initVal})`);
    }
    for (const name of this.capturedGlobals) {
      globalsWat.push(`  (global $g_var_${this.sanitizeWasmIdent(name)} (mut f64) (f64.const 0.0))`);
    }

    // Function table for indirect function calls (lambdas, function pointers)
    const tableSize = Math.max(16, this.lambdas.length + 2);
    const elemEntries = this.lambdas.map(l => `$${l.funcName}`);
    const tableWat: string[] = [
      `  (table (export "table") ${tableSize} funcref)`
    ];
    if (elemEntries.length > 0) {
      tableWat.push(`  (elem (i32.const 1) ${elemEntries.join(' ')})`);
    }

    const wat: string[] = [
      '(module',
      '  ;; ==========================================================================',
      '  ;; Generated by TypeLang WebAssembly (WASM / WAT) Code Generator',
      '  ;; ==========================================================================',
      '',
      '  ;; --- Host Runtime Imports ---',
      '  (import "host" "println_str" (func $host_println_str (param i32 i32)))',
      '  (import "host" "print_str" (func $host_print_str (param i32 i32)))',
      '  (import "host" "println_num" (func $host_println_num (param f64)))',
      '  (import "host" "print_num" (func $host_print_num (param f64)))',
      '  (import "host" "num_to_str" (func $host_num_to_str (param f64) (result i32)))',
      '  (import "host" "parse_int" (func $host_parse_int (param i32) (result f64)))',
      '  (import "host" "parse_float" (func $host_parse_float (param i32) (result f64)))',
      '  (import "host" "read_file" (func $host_read_file (param i32 i32) (result i32)))',
      '  (import "host" "write_file" (func $host_write_file (param i32 i32 i32 i32) (result f64)))',
      '  (import "host" "get_cli_arg" (func $host_get_cli_arg (param f64) (result i32)))',
      '  (import "host" "time_now" (func $host_time_now (result f64)))',
      '  (import "host" "math_pow" (func $host_math_pow (param f64 f64) (result f64)))',
      '',
      '  ;; --- Indirect Function Signatures ---',
      '  (type $sig_0 (func (result f64)))',
      '  (type $sig_1 (func (param f64) (result f64)))',
      '  (type $sig_2 (func (param f64 f64) (result f64)))',
      '  (type $sig_3 (func (param f64 f64 f64) (result f64)))',
      '  (type $sig_4 (func (param f64 f64 f64 f64) (result f64)))',
      '',
      `  ;; --- Linear Memory (${initialPages} initial pages = ${initialPages * 64}KB) ---`,
      `  (memory (export "memory") ${initialPages} ${maxPages})`,
      `  (global $heap_ptr (mut i32) (i32.const ${this.nextStringOffset}))`,
      '  (export "heap_ptr" (global $heap_ptr))',
      '',
      '  ;; --- Module Globals & Closure Storage ---',
      ...globalsWat,
      '',
      '  ;; --- Function Table ---',
      ...tableWat,
      '',
      '  ;; --- Built-in Dynamic Allocator with Auto-Growth ---',
      '  (func $alloc (export "alloc") (param $size i32) (result i32)',
      '    (local $ptr i32)',
      '    (local $new_heap i32)',
      '    (local $mem_size_bytes i32)',
      '    (local.set $ptr (global.get $heap_ptr))',
      '    (local.set $new_heap (i32.and (i32.add (i32.add (local.get $ptr) (local.get $size)) (i32.const 7)) (i32.const -8)))',
      '    (local.set $mem_size_bytes (i32.mul (memory.size) (i32.const 65536)))',
      '    (if (i32.gt_u (local.get $new_heap) (local.get $mem_size_bytes))',
      '      (then',
      '        (drop (memory.grow (i32.add (i32.div_u (i32.sub (local.get $new_heap) (local.get $mem_size_bytes)) (i32.const 65536)) (i32.const 1))))',
      '      )',
      '    )',
      '    (global.set $heap_ptr (local.get $new_heap))',
      '    (local.get $ptr)',
      '  )',
      '',
      '  ;; --- Output Helpers ---',
      '  (func $println_str_val (param $ptr i32)',
      '    (if (i32.ne (local.get $ptr) (i32.const 0))',
      '      (then',
      '        (call $host_println_str',
      '          (i32.add (local.get $ptr) (i32.const 4))',
      '          (i32.load (local.get $ptr))',
      '        )',
      '      )',
      '      (else',
      '        (call $host_println_str (i32.const 0) (i32.const 0))',
      '      )',
      '    )',
      '  )',
      '',
      '  (func $print_str_val (param $ptr i32)',
      '    (if (i32.ne (local.get $ptr) (i32.const 0))',
      '      (then',
      '        (call $host_print_str',
      '          (i32.add (local.get $ptr) (i32.const 4))',
      '          (i32.load (local.get $ptr))',
      '        )',
      '      )',
      '    )',
      '  )',
      '',
      '  ;; --- Math Modulo ---',
      '  (func $mod (param $a f64) (param $b f64) (result f64)',
      '    (if (result f64) (f64.eq (local.get $b) (f64.const 0.0))',
      '      (then (f64.const 0.0))',
      '      (else',
      '        (f64.sub (local.get $a) (f64.mul (f64.trunc (f64.div (local.get $a) (local.get $b))) (local.get $b)))',
      '      )',
      '    )',
      '  )',
      '',
      '  ;; --- Built-in Dynamic Array Utilities ---',
      '  ;; Array Header: [len: i32, cap: i32, items: f64[]]',
      '  (func $array_create (param $len i32) (result i32)',
      '    (local $ptr i32)',
      '    (local $bytes i32)',
      '    (local.set $bytes (i32.add (i32.const 8) (i32.mul (local.get $len) (i32.const 8))))',
      '    (local.set $ptr (call $alloc (local.get $bytes)))',
      '    (i32.store (local.get $ptr) (local.get $len))',
      '    (i32.store offset=4 (local.get $ptr) (local.get $len))',
      '    (local.get $ptr)',
      '  )',
      '',
      '  (func $array_get (param $arr i32) (param $idx f64) (result f64)',
      '    (local $i i32)',
      '    (if (result f64) (i32.eqz (local.get $arr))',
      '      (then (f64.const 0.0))',
      '      (else',
      '        (local.set $i (i32.trunc_f64_u (local.get $idx)))',
      '        (f64.load (i32.add (i32.add (local.get $arr) (i32.const 8)) (i32.mul (local.get $i) (i32.const 8))))',
      '      )',
      '    )',
      '  )',
      '',
      '  (func $array_set (param $arr i32) (param $idx f64) (param $val f64) (result f64)',
      '    (local $i i32)',
      '    (if (result f64) (i32.eqz (local.get $arr))',
      '      (then (local.get $val))',
      '      (else',
      '        (local.set $i (i32.trunc_f64_u (local.get $idx)))',
      '        (f64.store (i32.add (i32.add (local.get $arr) (i32.const 8)) (i32.mul (local.get $i) (i32.const 8))) (local.get $val))',
      '        (local.get $val)',
      '      )',
      '    )',
      '  )',
      '',
      '  (func $array_push (param $arr i32) (param $val f64) (result i32)',
      '    (local $len i32)',
      '    (if (result i32) (i32.eqz (local.get $arr))',
      '      (then (i32.const 0))',
      '      (else',
      '        (local.set $len (i32.load (local.get $arr)))',
      '        (f64.store (i32.add (i32.add (local.get $arr) (i32.const 8)) (i32.mul (local.get $len) (i32.const 8))) (local.get $val))',
      '        (i32.store (local.get $arr) (i32.add (local.get $len) (i32.const 1)))',
      '        (local.get $arr)',
      '      )',
      '    )',
      '  )',
      '',
      '  ;; --- Built-in Algebraic Data Type (GADT / Sum Type) Utilities ---',
      '  ;; GADT Header: [tag: i32, arity: i32, payload: f64[]]',
      '  (func $gadt_create (param $tag i32) (param $arity i32) (result i32)',
      '    (local $ptr i32)',
      '    (local.set $ptr (call $alloc (i32.add (i32.const 8) (i32.mul (local.get $arity) (i32.const 8)))))',
      '    (i32.store (local.get $ptr) (local.get $tag))',
      '    (i32.store offset=4 (local.get $ptr) (local.get $arity))',
      '    (local.get $ptr)',
      '  )',
      '',
      '  (func $gadt_get_tag (param $ptr i32) (result i32)',
      '    (if (result i32) (i32.eqz (local.get $ptr))',
      '      (then (i32.const -1))',
      '      (else (i32.load (local.get $ptr)))',
      '    )',
      '  )',
      '',
      '  (func $gadt_get_field (param $ptr i32) (param $idx i32) (result f64)',
      '    (if (result f64) (i32.eqz (local.get $ptr))',
      '      (then (f64.const 0.0))',
      '      (else',
      '        (f64.load (i32.add (i32.add (local.get $ptr) (i32.const 8)) (i32.mul (local.get $idx) (i32.const 8))))',
      '      )',
      '    )',
      '  )',
      '',
      '  (func $gadt_set_field (param $ptr i32) (param $idx i32) (param $val f64)',
      '    (if (i32.ne (local.get $ptr) (i32.const 0))',
      '      (then',
      '        (f64.store (i32.add (i32.add (local.get $ptr) (i32.const 8)) (i32.mul (local.get $idx) (i32.const 8))) (local.get $val))',
      '      )',
      '    )',
      '  )',
      '',
      '  ;; --- Built-in Record / Object Utilities ---',
      '  ;; Record Header: [num_fields: i32, fields: { key_str: i32, val: f64 }[]]',
      '  (func $record_create (param $num_fields i32) (result i32)',
      '    (local $ptr i32)',
      '    (local.set $ptr (call $alloc (i32.add (i32.const 8) (i32.mul (local.get $num_fields) (i32.const 16)))))',
      '    (i32.store (local.get $ptr) (local.get $num_fields))',
      '    (local.get $ptr)',
      '  )',
      '',
      '  (func $record_set (param $rec i32) (param $idx i32) (param $key i32) (param $val f64)',
      '    (if (i32.ne (local.get $rec) (i32.const 0))',
      '      (then',
      '        (i32.store (i32.add (i32.add (local.get $rec) (i32.const 8)) (i32.mul (local.get $idx) (i32.const 16))) (local.get $key))',
      '        (f64.store (i32.add (i32.add (local.get $rec) (i32.const 16)) (i32.mul (local.get $idx) (i32.const 16))) (local.get $val))',
      '      )',
      '    )',
      '  )',
      '',
      '  (func $record_get (param $rec i32) (param $key i32) (result f64)',
      '    (local $count i32)',
      '    (local $i i32)',
      '    (local $k i32)',
      '    (if (result f64) (i32.eqz (local.get $rec))',
      '      (then (f64.const 0.0))',
      '      (else',
      '        (local.set $count (i32.load (local.get $rec)))',
      '        (local.set $i (i32.const 0))',
      '        (block $b_rec (loop $l_rec',
      '          (br_if $b_rec (i32.ge_u (local.get $i) (local.get $count)))',
      '          (local.set $k (i32.load (i32.add (i32.add (local.get $rec) (i32.const 8)) (i32.mul (local.get $i) (i32.const 16)))))',
      '          (if (i32.or (i32.eq (local.get $k) (local.get $key)) (f64.ne (call $str_eq (local.get $k) (local.get $key)) (f64.const 0.0)))',
      '            (then',
      '              (return (f64.load (i32.add (i32.add (local.get $rec) (i32.const 16)) (i32.mul (local.get $i) (i32.const 16)))))',
      '            )',
      '          )',
      '          (local.set $i (i32.add (local.get $i) (i32.const 1)))',
      '          (br $l_rec)',
      '        ))',
      '        (f64.const 0.0)',
      '      )',
      '    )',
      '  )',
      '',
      '  ;; --- Built-in String Utilities ---',
      '  (func $concat (param $s1 i32) (param $s2 i32) (result i32)',
      '    (local $len1 i32)',
      '    (local $len2 i32)',
      '    (local $totalLen i32)',
      '    (local $newPtr i32)',
      '    (local $i i32)',
      '    (if (i32.eqz (local.get $s1)) (then (return (local.get $s2))))',
      '    (if (i32.eqz (local.get $s2)) (then (return (local.get $s1))))',
      '    (local.set $len1 (i32.load (local.get $s1)))',
      '    (local.set $len2 (i32.load (local.get $s2)))',
      '    (local.set $totalLen (i32.add (local.get $len1) (local.get $len2)))',
      '    (local.set $newPtr (call $alloc (i32.add (local.get $totalLen) (i32.const 5))))',
      '    (i32.store (local.get $newPtr) (local.get $totalLen))',
      '    ;; Copy bytes from s1',
      '    (local.set $i (i32.const 0))',
      '    (block $b1 (loop $l1',
      '      (br_if $b1 (i32.ge_u (local.get $i) (local.get $len1)))',
      '      (i32.store8 (i32.add (i32.add (local.get $newPtr) (i32.const 4)) (local.get $i))',
      '                  (i32.load8_u (i32.add (i32.add (local.get $s1) (i32.const 4)) (local.get $i))))',
      '      (local.set $i (i32.add (local.get $i) (i32.const 1)))',
      '      (br $l1)',
      '    ))',
      '    ;; Copy bytes from s2',
      '    (local.set $i (i32.const 0))',
      '    (block $b2 (loop $l2',
      '      (br_if $b2 (i32.ge_u (local.get $i) (local.get $len2)))',
      '      (i32.store8 (i32.add (i32.add (i32.add (local.get $newPtr) (i32.const 4)) (local.get $len1)) (local.get $i))',
      '                  (i32.load8_u (i32.add (i32.add (local.get $s2) (i32.const 4)) (local.get $i))))',
      '      (local.set $i (i32.add (local.get $i) (i32.const 1)))',
      '      (br $l2)',
      '    ))',
      '    (i32.store8 (i32.add (i32.add (local.get $newPtr) (i32.const 4)) (local.get $totalLen)) (i32.const 0))',
      '    (local.get $newPtr)',
      '  )',
      '',
      '  (func $str_eq (param $s1 i32) (param $s2 i32) (result f64)',
      '    (local $len1 i32)',
      '    (local $len2 i32)',
      '    (local $i i32)',
      '    (if (i32.eq (local.get $s1) (local.get $s2)) (then (return (f64.const 1.0))))',
      '    (if (i32.or (i32.eqz (local.get $s1)) (i32.eqz (local.get $s2))) (then (return (f64.const 0.0))))',
      '    (local.set $len1 (i32.load (local.get $s1)))',
      '    (local.set $len2 (i32.load (local.get $s2)))',
      '    (if (i32.ne (local.get $len1) (local.get $len2)) (then (return (f64.const 0.0))))',
      '    (local.set $i (i32.const 0))',
      '    (block $exit (loop $loop',
      '      (br_if $exit (i32.ge_u (local.get $i) (local.get $len1)))',
      '      (if (i32.ne',
      '            (i32.load8_u (i32.add (i32.add (local.get $s1) (i32.const 4)) (local.get $i)))',
      '            (i32.load8_u (i32.add (i32.add (local.get $s2) (i32.const 4)) (local.get $i))))',
      '        (then (return (f64.const 0.0))))',
      '      (local.set $i (i32.add (local.get $i) (i32.const 1)))',
      '      (br $loop)',
      '    ))',
      '    (f64.const 1.0)',
      '  )',
      '',
      '  (func $str_char_at (param $str i32) (param $idx f64) (result i32)',
      '    (local $i i32)',
      '    (local $len i32)',
      '    (local $newPtr i32)',
      '    (if (i32.eqz (local.get $str)) (then (return (i32.const 0))))',
      '    (local.set $len (i32.load (local.get $str)))',
      '    (local.set $i (i32.trunc_f64_u (local.get $idx)))',
      '    (if (i32.ge_u (local.get $i) (local.get $len)) (then (return (i32.const 0))))',
      '    (local.set $newPtr (call $alloc (i32.const 6)))',
      '    (i32.store (local.get $newPtr) (i32.const 1))',
      '    (i32.store8 (i32.add (local.get $newPtr) (i32.const 4))',
      '                (i32.load8_u (i32.add (i32.add (local.get $str) (i32.const 4)) (local.get $i))))',
      '    (i32.store8 (i32.add (local.get $newPtr) (i32.const 5)) (i32.const 0))',
      '    (local.get $newPtr)',
      '  )',
      '',
      '  ;; --- Built-in Generic Length Query ---',
      '  (func $len (param $obj i32) (result f64)',
      '    (if (result f64) (i32.eqz (local.get $obj))',
      '      (then (f64.const 0.0))',
      '      (else (f64.convert_i32_u (i32.load (local.get $obj))))',
      '    )',
      '  )',
      '',
      '  ;; --- Static Data Segments (String Literals) ---',
      ...dataSegments,
      '',
      '  ;; --- Algebraic Data Type Constructors ---',
      ...ctorFunctionsWat,
      '',
      '  ;; --- User Functions ---',
      ...functionsWat,
      '',
      '  ;; --- Lambdas & Closures ---',
      ...lambdasWat,
      '',
      '  ;; --- Main Entry Point ---',
      '  (func (export "_start") (export "main") (result f64)',
      ...mainLocalsWat,
      ...mainBodyWat,
      '    (f64.const 0)',
      '  )',
      ')'
    ];

    return wat.join('\n');
  }

  private generateFunction(func: SFunction): string {
    const fnName = this.sanitizeWasmIdent(func.name);
    this.currentLocals.clear();

    const paramsWat: string[] = [];
    for (const p of func.params) {
      const pName = this.sanitizeWasmIdent(p.name);
      const pType = (p.type && ((p.type as any).name === 'string' || (p.type as any).kind === 't_array')) ? 'i32' : 'f64';
      this.currentLocals.set(p.name, pType);
      paramsWat.push(`(param $${pName} ${pType})`);
    }

    const retKind = this.fnSignatures.get(func.name) || 'f64';
    const isVoid = retKind === 'void';
    const resultClause = isVoid ? '' : `(result ${retKind})`;

    this.indentLevel = 2;
    const bodyWat = this.generateFunctionBody(func.body, isVoid, retKind);

    const localDecls: string[] = [];
    for (const [name, type] of this.currentLocals.entries()) {
      if (!func.params.some(p => p.name === name)) {
        localDecls.push(`    (local $${this.sanitizeWasmIdent(name)} ${type})`);
      }
    }

    const lines: string[] = [
      `  (func $${fnName} ${paramsWat.join(' ')} ${resultClause}`.trimEnd(),
      ...localDecls,
      bodyWat,
      '  )'
    ];

    return lines.join('\n');
  }

  private generateLambda(lambda: { id: number; funcName: string; expr: ELambda }): string {
    const expr = lambda.expr;
    const savedLocals = new Map(this.currentLocals);
    this.currentLocals.clear();

    const paramsWat: string[] = [];
    const paramInits: string[] = [];
    const localDecls: string[] = [];

    expr.params.forEach((p, idx) => {
      const pName = this.sanitizeWasmIdent(p.name);
      this.currentLocals.set(p.name, 'f64');
      paramsWat.push(`(param $p${idx} f64)`);
      localDecls.push(`    (local $${pName} f64)`);
      paramInits.push(`    (local.set $${pName} (local.get $p${idx}))`);
      paramInits.push(`    (global.set $g_var_${pName} (local.get $p${idx}))`);
    });

    this.indentLevel = 2;
    const bodyWat = this.generateFunctionBody(expr.body, false, 'f64');

    for (const [name, type] of this.currentLocals.entries()) {
      if (!expr.params.some(p => p.name === name)) {
        localDecls.push(`    (local $${this.sanitizeWasmIdent(name)} ${type})`);
      }
    }

    this.currentLocals = savedLocals;

    return [
      `  (func $${lambda.funcName} ${paramsWat.join(' ')} (result f64)`,
      ...localDecls,
      ...paramInits,
      bodyWat,
      '  )'
    ].join('\n');
  }

  private generateFunctionBody(body: Expr, isVoid: boolean, retKind: string): string {
    if (!body) {
      return isVoid ? '' : `${this.indent()}(${retKind}.const 0)`;
    }

    if (body.kind === 'e_block') {
      const statements = body.statements;
      const count = statements.length;
      const bodyLines: string[] = [];

      for (let i = 0; i < count; i++) {
        const stmt = statements[i];
        const isLast = i === count - 1;

        if (isLast && !body.result && !isVoid) {
          // If the last statement is an expression statement, generate as return value
          if (stmt.kind === 's_expr' && stmt.expr) {
            const valWat = this.generateExpr(stmt.expr, false);
            bodyLines.push(retKind === 'f64' ? this.ensureF64(stmt.expr, valWat) : valWat);
          } else {
            bodyLines.push(this.generateStatement(stmt));
            bodyLines.push(`${this.indent()}(${retKind}.const 0)`);
          }
        } else {
          bodyLines.push(this.generateStatement(stmt));
        }
      }

      if (body.result) {
        if (isVoid) {
          bodyLines.push(this.generateStatement({ kind: 's_expr', expr: body.result }));
        } else {
          const valWat = this.generateExpr(body.result, false);
          bodyLines.push(retKind === 'f64' ? this.ensureF64(body.result, valWat) : valWat);
        }
      } else if (count === 0 && !isVoid) {
        bodyLines.push(`${this.indent()}(${retKind}.const 0)`);
      }

      return bodyLines.filter(l => l.trim()).join('\n');
    }

    // Direct expression body (e.g. function add(a, b) = a + b)
    if (isVoid) {
      return this.generateExpr(body, true);
    }
    const valWat = this.generateExpr(body, false);
    return retKind === 'f64' ? this.ensureF64(body, valWat) : valWat;
  }

  private generateStatement(stmt: Statement): string {
    switch (stmt.kind) {
      case 's_let': {
        const varName = this.sanitizeWasmIdent(stmt.name);
        let type: 'i32' | 'f64' = 'f64';
        if (stmt.typeAnnotation) {
          const tName = (stmt.typeAnnotation as any).name;
          const tKind = (stmt.typeAnnotation as any).kind;
          if (tName === 'string' || tKind === 't_array') type = 'i32';
        }
        if (type === 'f64' && stmt.init) {
          if ((stmt.init.kind === 'e_literal' && typeof stmt.init.value === 'string') ||
              (stmt.init.kind === 'e_tuple' || stmt.init.kind === 'e_record') ||
              this.isStringExpr(stmt.init)) {
            type = 'i32';
          }
        }
        this.currentLocals.set(stmt.name, type);
        let initVal = this.generateExpr(stmt.init, false);
        if (type === 'f64' && this.isI32Expr(stmt.init)) {
          initVal = this.ensureF64(stmt.init, initVal);
        } else if (type === 'i32' && !this.isI32Expr(stmt.init)) {
          initVal = this.ensureI32(stmt.init, initVal);
        }

        if (this.isTopLevel) {
          this.topLevelGlobals.set(stmt.name, type);
          return `${this.indent()}(local.set $${varName}\n${initVal}\n${this.indent()})\n${this.indent()}(global.set $${varName} (local.get $${varName}))`;
        }
        return `${this.indent()}(local.set $${varName}\n${initVal}\n${this.indent()})`;
      }

      case 's_gadt': {
        return '';
      }

      case 's_expr': {
        if (!stmt.expr) return '';
        // If expr is an assignment to local var or while/for/void call, it leaves no value on stack
        if (stmt.expr.kind === 'e_assign' && stmt.expr.target.kind === 'e_var') {
          return this.generateExpr(stmt.expr, true);
        }
        if (stmt.expr.kind === 'e_call' && stmt.expr.callee.kind === 'e_var') {
          const fnName = stmt.expr.callee.name;
          if (this.fnSignatures.get(fnName) === 'void') {
            return this.generateExpr(stmt.expr, true);
          }
        }
        if (stmt.expr.kind === 'e_while' || stmt.expr.kind === 'e_for') {
          return this.generateExpr(stmt.expr, true);
        }
        if (stmt.expr.kind === 'e_if') {
          return this.generateExpr(stmt.expr, true);
        }
        if (stmt.expr.kind === 'e_match') {
          return this.generateExpr(stmt.expr, true);
        }
        if (stmt.expr.kind === 'e_return') {
          return this.generateExpr(stmt.expr, true);
        }

        // Any other expression statement produces a value that MUST be dropped
        const exprWat = this.generateExpr(stmt.expr, false);
        return `${this.indent()}(drop\n${exprWat}\n${this.indent()})`;
      }

      default:
        return '';
    }
  }

  private generateCondition(cond: Expr): string {
    if (!cond) return '(i32.const 1)';

    if (cond.kind === 'e_binary') {
      const op = cond.op;
      if (['<', '<=', '>', '>=', '==', '!='].includes(op)) {
        const left = this.generateExpr(cond.left, false);
        const right = this.generateExpr(cond.right, false);

        if (op === '==') {
          if (this.isStringExpr(cond.left) || this.isStringExpr(cond.right)) {
            return `(i32.trunc_f64_u (call $str_eq\n${left}\n${right}\n${this.indent()}))`;
          }
          return `(f64.eq\n${left}\n${right}\n${this.indent()})`;
        }
        if (op === '!=') {
          if (this.isStringExpr(cond.left) || this.isStringExpr(cond.right)) {
            return `(i32.eqz (i32.trunc_f64_u (call $str_eq\n${left}\n${right}\n${this.indent()})))`;
          }
          return `(f64.ne\n${left}\n${right}\n${this.indent()})`;
        }
        if (op === '<') return `(f64.lt\n${left}\n${right}\n${this.indent()})`;
        if (op === '<=') return `(f64.le\n${left}\n${right}\n${this.indent()})`;
        if (op === '>') return `(f64.gt\n${left}\n${right}\n${this.indent()})`;
        if (op === '>=') return `(f64.ge\n${left}\n${right}\n${this.indent()})`;
      }
      if (op === '&&') {
        const c1 = this.generateCondition(cond.left);
        const c2 = this.generateCondition(cond.right);
        return `(i32.and ${c1} ${c2})`;
      }
      if (op === '||') {
        const c1 = this.generateCondition(cond.left);
        const c2 = this.generateCondition(cond.right);
        return `(i32.or ${c1} ${c2})`;
      }
    }

    if (cond.kind === 'e_unary' && cond.op === '!') {
      const inner = this.generateCondition(cond.expr);
      return `(i32.eqz ${inner})`;
    }

    const val = this.generateExpr(cond, false);
    return `(f64.ne ${val.trim()} (f64.const 0))`;
  }

  private generateExpr(expr: Expr, isStatement = false): string {
    if (!expr) return isStatement ? '' : `${this.indent()}(f64.const 0)`;

    switch (expr.kind) {
      case 'e_literal': {
        if (typeof expr.value === 'number') {
          const numStr = Number.isInteger(expr.value) ? `${expr.value}.0` : `${expr.value}`;
          return `${this.indent()}(f64.const ${numStr})`;
        }
        if (typeof expr.value === 'boolean') {
          return `${this.indent()}(f64.const ${expr.value ? 1.0 : 0.0})`;
        }
        if (typeof expr.value === 'string') {
          const strInfo = this.registerString(expr.value);
          return `${this.indent()}(i32.const ${strInfo.offset})`;
        }
        return `${this.indent()}(f64.const 0)`;
      }

      case 'e_var': {
        const vName = this.sanitizeWasmIdent(expr.name);
        if (this.currentLocals.has(expr.name)) {
          return `${this.indent()}(local.get $${vName})`;
        }
        if (this.zeroArityCtors.has(expr.name)) {
          return `${this.indent()}(call $${vName})`;
        }
        if (this.topLevelGlobals.has(expr.name)) {
          return `${this.indent()}(global.get $${vName})`;
        }
        if (this.capturedGlobals.has(expr.name)) {
          return `${this.indent()}(global.get $g_var_${vName})`;
        }
        return `${this.indent()}(local.get $${vName})`;
      }

      case 'e_assign': {
        if (expr.target.kind === 'e_var') {
          const vName = this.sanitizeWasmIdent(expr.target.name);
          const val = this.generateExpr(expr.value, false);
          const op = expr.op;
          let assignWat = '';
          if (op && op !== '=') {
            const mathOp = op === '+=' ? 'f64.add' :
                           op === '-=' ? 'f64.sub' :
                           op === '*=' ? 'f64.mul' :
                           op === '/=' ? 'f64.div' : 'f64.add';
            assignWat = `${this.indent()}(local.set $${vName}\n${this.indent()}  (${mathOp} (local.get $${vName})\n${val}\n${this.indent()}  )\n${this.indent()})`;
          } else {
            assignWat = `${this.indent()}(local.set $${vName}\n${val}\n${this.indent()})`;
          }
          if (this.topLevelGlobals.has(expr.target.name)) {
            assignWat += `\n${this.indent()}(global.set $${vName} (local.get $${vName}))`;
          }
          if (this.capturedGlobals.has(expr.target.name)) {
            assignWat += `\n${this.indent()}(global.set $g_var_${vName} (local.get $${vName}))`;
          }
          return assignWat;
        }
        if (expr.target.kind === 'e_index') {
          const arr = this.generateExpr(expr.target.target, false);
          const idx = this.generateExpr(expr.target.index, false);
          const val = this.generateExpr(expr.value, false);
          const op = expr.op;
          let callWat = '';
          if (op && op !== '=') {
            const mathOp = op === '+=' ? 'f64.add' :
                           op === '-=' ? 'f64.sub' :
                           op === '*=' ? 'f64.mul' :
                           op === '/=' ? 'f64.div' : 'f64.add';
            callWat = `${this.indent()}(call $array_set\n${arr}\n${idx}\n${this.indent()}  (${mathOp} (call $array_get\n${arr}\n${idx}\n${this.indent()}  )\n${val}\n${this.indent()}  )\n${this.indent()})`;
          } else {
            callWat = `${this.indent()}(call $array_set\n${arr}\n${idx}\n${val}\n${this.indent()})`;
          }
          return isStatement ? `${this.indent()}(drop\n${callWat}\n${this.indent()})` : callWat;
        }
        return '';
      }

      case 'e_binary': {
        const op = expr.op;

        if (op === '&&') {
          const left = this.generateExpr(expr.left, false);
          const right = this.generateExpr(expr.right, false);
          return `${this.indent()}(f64.convert_i32_s (i32.and (f64.ne ${left.trim()} (f64.const 0)) (f64.ne ${right.trim()} (f64.const 0))))`;
        }
        if (op === '||') {
          const left = this.generateExpr(expr.left, false);
          const right = this.generateExpr(expr.right, false);
          return `${this.indent()}(f64.convert_i32_s (i32.or (f64.ne ${left.trim()} (f64.const 0)) (f64.ne ${right.trim()} (f64.const 0))))`;
        }
        if (op === '%') {
          const left = this.generateExpr(expr.left, false);
          const right = this.generateExpr(expr.right, false);
          return `${this.indent()}(call $mod\n${left}\n${right}\n${this.indent()})`;
        }

        const left = this.generateExpr(expr.left, false);
        const right = this.generateExpr(expr.right, false);

        if (op === '+') return `${this.indent()}(f64.add\n${left}\n${right}\n${this.indent()})`;
        if (op === '-') return `${this.indent()}(f64.sub\n${left}\n${right}\n${this.indent()})`;
        if (op === '*') return `${this.indent()}(f64.mul\n${left}\n${right}\n${this.indent()})`;
        if (op === '/') return `${this.indent()}(f64.div\n${left}\n${right}\n${this.indent()})`;
        if (op === '<=') return `${this.indent()}(f64.convert_i32_s (f64.le\n${left}\n${right}\n${this.indent()}))`;
        if (op === '<') return `${this.indent()}(f64.convert_i32_s (f64.lt\n${left}\n${right}\n${this.indent()}))`;
        if (op === '>=') return `${this.indent()}(f64.convert_i32_s (f64.ge\n${left}\n${right}\n${this.indent()}))`;
        if (op === '>') return `${this.indent()}(f64.convert_i32_s (f64.gt\n${left}\n${right}\n${this.indent()}))`;
        if (op === '==') {
          if (this.isStringExpr(expr.left) || this.isStringExpr(expr.right)) {
            return `${this.indent()}(call $str_eq\n${left}\n${right}\n${this.indent()})`;
          }
          return `${this.indent()}(f64.convert_i32_s (f64.eq\n${left}\n${right}\n${this.indent()}))`;
        }
        if (op === '!=') {
          if (this.isStringExpr(expr.left) || this.isStringExpr(expr.right)) {
            return `${this.indent()}(f64.convert_i32_s (i32.eqz (i32.trunc_f64_u (call $str_eq\n${left}\n${right}\n${this.indent()}))))`;
          }
          return `${this.indent()}(f64.convert_i32_s (f64.ne\n${left}\n${right}\n${this.indent()}))`;
        }

        return `${this.indent()}(f64.add\n${left}\n${right}\n${this.indent()})`;
      }

      case 'e_unary': {
        const arg = this.generateExpr(expr.expr, false);
        if (expr.op === '-') {
          return `${this.indent()}(f64.neg\n${arg}\n${this.indent()})`;
        }
        if (expr.op === '!') {
          return `${this.indent()}(f64.convert_i32_s (f64.eq\n${arg}\n${this.indent()}  (f64.const 0)\n${this.indent()}))`;
        }
        return arg;
      }

      case 'e_if': {
        const cond = this.generateCondition(expr.cond);
        const thenExpr = expr.thenExpr || (expr as any).then;
        const elseExpr = expr.elseExpr || (expr as any).else;

        if (isStatement) {
          const thenBody = this.generateBlockOrStatement(thenExpr);
          const elseBody = elseExpr ? this.generateBlockOrStatement(elseExpr) : '';
          return [
            `${this.indent()}(if ${cond.trim()}`,
            `${this.indent()}  (then`,
            thenBody,
            `${this.indent()}  )`,
            elseBody ? `${this.indent()}  (else\n${elseBody}\n${this.indent()}  )` : '',
            `${this.indent()})`
          ].filter(Boolean).join('\n');
        } else {
          const thenVal = this.generateExpr(thenExpr, false);
          const elseVal = elseExpr ? this.generateExpr(elseExpr, false) : `${this.indent()}  (f64.const 0)`;
          return [
            `${this.indent()}(if (result f64) ${cond.trim()}`,
            `${this.indent()}  (then`,
            thenVal,
            `${this.indent()}  )`,
            `${this.indent()}  (else`,
            elseVal,
            `${this.indent()}  )`,
            `${this.indent()})`
          ].join('\n');
        }
      }

      case 'e_while': {
        const loopId = ++this.localCounter;
        const exitLabel = `while_exit_${loopId}`;
        const loopLabel = `while_loop_${loopId}`;
        this.loopStack.push({ exit: exitLabel, loop: loopLabel });

        const cond = this.generateCondition(expr.cond);
        const body = this.generateBlockOrStatement(expr.body);

        this.loopStack.pop();

        return [
          `${this.indent()}(block $${exitLabel}`,
          `${this.indent()}  (loop $${loopLabel}`,
          `${this.indent()}    (br_if $${exitLabel} (i32.eqz ${cond.trim()}))`,
          body,
          `${this.indent()}    (br $${loopLabel})`,
          `${this.indent()}  )`,
          `${this.indent()})`
        ].join('\n');
      }

      case 'e_for': {
        const loopId = ++this.localCounter;
        const exitLabel = `for_exit_${loopId}`;
        const loopLabel = `for_loop_${loopId}`;
        const contLabel = `for_cont_${loopId}`;
        // Push contLabel as the loop target for continue statement
        this.loopStack.push({ exit: exitLabel, loop: contLabel });

        const initWat = expr.init
          ? (expr.init.kind.startsWith('s_')
              ? this.generateStatement(expr.init as Statement)
              : this.generateExpr(expr.init as Expr, true))
          : '';
        const condWat = expr.cond ? this.generateCondition(expr.cond).trim() : '(i32.const 1)';
        const updateWat = expr.update ? this.generateExpr(expr.update, true) : '';
        const bodyWat = this.generateBlockOrStatement(expr.body);

        this.loopStack.pop();

        return [
          initWat,
          `${this.indent()}(block $${exitLabel}`,
          `${this.indent()}  (loop $${loopLabel}`,
          `${this.indent()}    (br_if $${exitLabel} (i32.eqz ${condWat}))`,
          `${this.indent()}    (block $${contLabel}`,
          bodyWat,
          `${this.indent()}    )`,
          updateWat,
          `${this.indent()}    (br $${loopLabel})`,
          `${this.indent()}  )`,
          `${this.indent()})`
        ].filter(Boolean).join('\n');
      }

      case 'e_break': {
        if (this.loopStack.length > 0) {
          const current = this.loopStack[this.loopStack.length - 1];
          return `${this.indent()}(br $${current.exit})`;
        }
        return '';
      }

      case 'e_continue': {
        if (this.loopStack.length > 0) {
          const current = this.loopStack[this.loopStack.length - 1];
          return `${this.indent()}(br $${current.loop})`;
        }
        return '';
      }

      case 'e_return': {
        if (expr.value) {
          const valWat = this.generateExpr(expr.value, false);
          return `${this.indent()}(return\n${valWat}\n${this.indent()})`;
        }
        return `${this.indent()}(return)`;
      }

      case 'e_call': {
        if (expr.callee.kind === 'e_var') {
          const fnName = expr.callee.name;
          const mod = expr.callee.modulePath?.[0];

          // Math module functions
          if (mod === 'Math' || fnName.startsWith('Math_')) {
            const baseName = fnName.replace(/^Math_/, '');
            if (baseName === 'sqrt' && expr.args.length === 1) {
              const arg = this.generateExpr(expr.args[0], false);
              return `${this.indent()}(f64.sqrt\n${arg}\n${this.indent()})`;
            }
            if (baseName === 'abs' && expr.args.length === 1) {
              const arg = this.generateExpr(expr.args[0], false);
              return `${this.indent()}(f64.abs\n${arg}\n${this.indent()})`;
            }
            if (baseName === 'floor' && expr.args.length === 1) {
              const arg = this.generateExpr(expr.args[0], false);
              return `${this.indent()}(f64.floor\n${arg}\n${this.indent()})`;
            }
            if (baseName === 'ceil' && expr.args.length === 1) {
              const arg = this.generateExpr(expr.args[0], false);
              return `${this.indent()}(f64.ceil\n${arg}\n${this.indent()})`;
            }
            if (baseName === 'trunc' && expr.args.length === 1) {
              const arg = this.generateExpr(expr.args[0], false);
              return `${this.indent()}(f64.trunc\n${arg}\n${this.indent()})`;
            }
            if (baseName === 'round' && expr.args.length === 1) {
              const arg = this.generateExpr(expr.args[0], false);
              return `${this.indent()}(f64.nearest\n${arg}\n${this.indent()})`;
            }
            if (baseName === 'min' && expr.args.length === 2) {
              const a1 = this.generateExpr(expr.args[0], false);
              const a2 = this.generateExpr(expr.args[1], false);
              return `${this.indent()}(f64.min\n${a1}\n${a2}\n${this.indent()})`;
            }
            if (baseName === 'max' && expr.args.length === 2) {
              const a1 = this.generateExpr(expr.args[0], false);
              const a2 = this.generateExpr(expr.args[1], false);
              return `${this.indent()}(f64.max\n${a1}\n${a2}\n${this.indent()})`;
            }
            if (baseName === 'pow' && expr.args.length === 2) {
              const a1 = this.generateExpr(expr.args[0], false);
              const a2 = this.generateExpr(expr.args[1], false);
              return `${this.indent()}(call $host_math_pow\n${a1}\n${a2}\n${this.indent()})`;
            }
          }

          // Special built-in functions
          if (fnName === 'println' && expr.args.length === 1) {
            const arg = expr.args[0];
            if (this.isStringExpr(arg)) {
              const strPtr = this.generateExpr(arg, false);
              return `${this.indent()}(call $println_str_val\n${strPtr}\n${this.indent()})`;
            }
            const val = this.ensureF64(arg, this.generateExpr(arg, false));
            return `${this.indent()}(call $host_println_num\n${val}\n${this.indent()})`;
          }

          if (fnName === 'print' && expr.args.length === 1) {
            const arg = expr.args[0];
            if (this.isStringExpr(arg)) {
              const strPtr = this.generateExpr(arg, false);
              return `${this.indent()}(call $print_str_val\n${strPtr}\n${this.indent()})`;
            }
            const val = this.ensureF64(arg, this.generateExpr(arg, false));
            return `${this.indent()}(call $host_print_num\n${val}\n${this.indent()})`;
          }

          if (fnName === 'concat' && expr.args.length === 2) {
            const s1 = this.generateExpr(expr.args[0], false);
            const s2 = this.generateExpr(expr.args[1], false);
            return `${this.indent()}(call $concat\n${s1}\n${s2}\n${this.indent()})`;
          }

          if (fnName === 'to_string' && expr.args.length === 1) {
            const n = this.ensureF64(expr.args[0], this.generateExpr(expr.args[0], false));
            return `${this.indent()}(call $host_num_to_str\n${n}\n${this.indent()})`;
          }

          if ((fnName === 'len' || (mod === 'Array' && fnName === 'len') || (mod === 'String' && fnName === 'len')) && expr.args.length === 1) {
            const obj = this.generateExpr(expr.args[0], false);
            return `${this.indent()}(call $len\n${obj}\n${this.indent()})`;
          }

          if ((fnName === 'push' || (mod === 'Array' && fnName === 'push')) && expr.args.length === 2) {
            const arr = this.generateExpr(expr.args[0], false);
            const val = this.ensureF64(expr.args[1], this.generateExpr(expr.args[1], false));
            return `${this.indent()}(call $array_push\n${arr}\n${val}\n${this.indent()})`;
          }

          if (fnName === 'time_now' && expr.args.length === 0) {
            return `${this.indent()}(call $host_time_now)`;
          }

          if (fnName === 'parse_int' && expr.args.length === 1) {
            const strPtr = this.generateExpr(expr.args[0], false);
            return `${this.indent()}(call $host_parse_int\n${strPtr}\n${this.indent()})`;
          }

          if (fnName === 'parse_float' && expr.args.length === 1) {
            const strPtr = this.generateExpr(expr.args[0], false);
            return `${this.indent()}(call $host_parse_float\n${strPtr}\n${this.indent()})`;
          }

          if (fnName === 'read_file' && expr.args.length === 1) {
            const pathPtr = this.generateExpr(expr.args[0], false);
            return `${this.indent()}(call $host_read_file\n${pathPtr}\n${this.indent()}  (i32.load ${pathPtr.trim()})\n${this.indent()})`;
          }

          if (fnName === 'write_file' && expr.args.length === 2) {
            const pathPtr = this.generateExpr(expr.args[0], false);
            const contentPtr = this.generateExpr(expr.args[1], false);
            return `${this.indent()}(call $host_write_file\n${pathPtr}\n${this.indent()}  (i32.load ${pathPtr.trim()})\n${contentPtr}\n${this.indent()}  (i32.load ${contentPtr.trim()})\n${this.indent()})`;
          }

          if (fnName === 'get_cli_arg' && expr.args.length === 1) {
            const idx = this.generateExpr(expr.args[0], false);
            return `${this.indent()}(call $host_get_cli_arg\n${idx}\n${this.indent()})`;
          }

          if ((fnName === 'char_at' || fnName === 'charAt' || (mod === 'String' && (fnName === 'charAt' || fnName === 'char_at'))) && expr.args.length === 2) {
            const s = this.generateExpr(expr.args[0], false);
            const idx = this.generateExpr(expr.args[1], false);
            return `${this.indent()}(call $str_char_at\n${s}\n${idx}\n${this.indent()})`;
          }

          // Check if calling a GADT constructor
          if (this.gadtConstructors.has(fnName)) {
            const argsWat = expr.args.map(a => this.ensureF64(a, this.generateExpr(a, false))).join('\n');
            return `${this.indent()}(call $${this.sanitizeWasmIdent(fnName)}\n${argsWat}\n${this.indent()})`;
          }

          // User-defined top-level function call
          if (this.functionNames.has(fnName)) {
            const argsWat = expr.args.map(a => this.generateExpr(a, false)).join('\n');
            return `${this.indent()}(call $${this.sanitizeWasmIdent(fnName)}\n${argsWat}\n${this.indent()})`;
          }

          // Variable holding a function reference or lambda parameter (e.g. f(v))
          const arity = Math.min(4, expr.args.length);
          const fnIdxWat = `(i32.trunc_f64_u (local.get $${this.sanitizeWasmIdent(fnName)}))`;
          const argsWat = expr.args.map(a => this.ensureF64(a, this.generateExpr(a, false))).join('\n');
          return `${this.indent()}(call_indirect (type $sig_${arity})\n${argsWat}\n${this.indent()}  ${fnIdxWat}\n${this.indent()})`;
        }

        // Callee is field access on a record (e.g. functor.map(container, f1), optionMonad.flatMap(ma, f))
        if (expr.callee.kind === 'e_field_access') {
          const objWat = this.generateExpr(expr.callee.object, false);
          const keyInfo = this.registerString(expr.callee.field);
          const arity = Math.min(4, expr.args.length);
          const argsWat = expr.args.map(a => this.ensureF64(a, this.generateExpr(a, false))).join('\n');
          const fnIdxWat = `(i32.trunc_f64_u (call $record_get ${this.ensureI32(expr.callee.object, objWat)} (i32.const ${keyInfo.offset})))`;
          return `${this.indent()}(call_indirect (type $sig_${arity})\n${argsWat}\n${this.indent()}  ${fnIdxWat}\n${this.indent()})`;
        }

        // Callee is an arbitrary expression evaluating to a function index
        const calleeWat = this.generateExpr(expr.callee, false);
        const arity = Math.min(4, expr.args.length);
        const argsWat = expr.args.map(a => this.ensureF64(a, this.generateExpr(a, false))).join('\n');
        const fnIdxWat = `(i32.trunc_f64_u ${calleeWat.trim()})`;
        return `${this.indent()}(call_indirect (type $sig_${arity})\n${argsWat}\n${this.indent()}  ${fnIdxWat}\n${this.indent()})`;
      }

      case 'e_field_access': {
        if (expr.field === 'len' || expr.field === 'length') {
          const obj = this.generateExpr(expr.object, false);
          return `${this.indent()}(call $len\n${obj}\n${this.indent()})`;
        }
        const objWat = this.generateExpr(expr.object, false);
        const keyInfo = this.registerString(expr.field);
        return `${this.indent()}(call $record_get\n${this.ensureI32(expr.object, objWat)}\n${this.indent()}(i32.const ${keyInfo.offset})\n${this.indent()})`;
      }

      case 'e_method_call': {
        const method = expr.method;
        if (method === 'len' || method === 'length') {
          const obj = this.generateExpr(expr.object, false);
          return `${this.indent()}(call $len\n${obj}\n${this.indent()})`;
        }
        if (method === 'push' && expr.args.length === 1) {
          const obj = this.generateExpr(expr.object, false);
          const val = this.ensureF64(expr.args[0], this.generateExpr(expr.args[0], false));
          const pushCall = `${this.indent()}(call $array_push\n${obj}\n${val}\n${this.indent()})`;
          return isStatement ? `${this.indent()}(drop\n${pushCall}\n${this.indent()})` : pushCall;
        }
        if ((method === 'charAt' || method === 'char_at') && expr.args.length === 1) {
          const obj = this.generateExpr(expr.object, false);
          const idx = this.generateExpr(expr.args[0], false);
          return `${this.indent()}(call $str_char_at\n${obj}\n${idx}\n${this.indent()})`;
        }

        // Method call on a record/object: obj.method(...args)
        const objWat = this.generateExpr(expr.object, false);
        const keyInfo = this.registerString(method);
        const arity = Math.min(4, expr.args.length);
        const argsWat = expr.args.map(a => this.ensureF64(a, this.generateExpr(a, false))).join('\n');
        const fnIdxWat = `(i32.trunc_f64_u (call $record_get ${this.ensureI32(expr.object, objWat)} (i32.const ${keyInfo.offset})))`;
        const callWat = `${this.indent()}(call_indirect (type $sig_${arity})\n${argsWat}\n${this.indent()}  ${fnIdxWat}\n${this.indent()})`;
        return isStatement ? `${this.indent()}(drop\n${callWat}\n${this.indent()})` : callWat;
      }

      case 'e_tuple': {
        const elems = expr.elements;
        const count = elems.length;
        const tempArr = `_arr_${++this.localCounter}`;
        this.currentLocals.set(tempArr, 'i32');
        const setupLines: string[] = [
          `${this.indent()}(local.set $${tempArr} (call $array_create (i32.const ${count})))`
        ];
        for (let i = 0; i < count; i++) {
          const valWat = this.ensureF64(elems[i], this.generateExpr(elems[i], false));
          setupLines.push(
            `${this.indent()}(f64.store (i32.add (i32.add (local.get $${tempArr}) (i32.const 8)) (i32.const ${i * 8})) ${valWat.trim()})`
          );
        }
        setupLines.push(`${this.indent()}(local.get $${tempArr})`);
        return setupLines.join('\n');
      }

      case 'e_record': {
        const fields = expr.fields || [];
        const count = fields.length;
        const tempRec = `_rec_${++this.localCounter}`;
        this.currentLocals.set(tempRec, 'i32');
        const setupLines: string[] = [
          `${this.indent()}(local.set $${tempRec} (call $record_create (i32.const ${count})))`
        ];
        fields.forEach((f, idx) => {
          const keyInfo = this.registerString(f.name);
          const valWat = this.ensureF64(f.value, this.generateExpr(f.value, false));
          setupLines.push(
            `${this.indent()}(call $record_set (local.get $${tempRec}) (i32.const ${idx}) (i32.const ${keyInfo.offset}) ${valWat.trim()})`
          );
        });
        setupLines.push(`${this.indent()}(local.get $${tempRec})`);
        return setupLines.join('\n');
      }

      case 'e_lambda': {
        const lambdaId = ++this.lambdaCounter;
        const funcName = `_lambda_${lambdaId}`;
        this.lambdas.push({ id: lambdaId, funcName, expr });
        return `${this.indent()}(f64.const ${lambdaId}.0)`;
      }

      case 'e_match': {
        const matchId = ++this.localCounter;
        const scrutineeVar = `_scrutinee_${matchId}`;
        const matchResVar = `_match_res_${matchId}`;
        this.currentLocals.set(scrutineeVar, 'i32');
        if (!isStatement) {
          this.currentLocals.set(matchResVar, 'f64');
        }

        const scrutineeWat = this.ensureI32(expr.scrutinee, this.generateExpr(expr.scrutinee, false));
        const exitLabel = `match_exit_${matchId}`;

        const armsWat: string[] = [];
        for (const arm of expr.arms) {
          const pat = arm.pattern;
          let condWat = '(i32.const 1)';
          const bindLines: string[] = [];

          if (pat.kind === 'p_ctor') {
            const ctorInfo = this.gadtConstructors.get(pat.name);
            const tag = ctorInfo ? ctorInfo.tag : 0;
            condWat = `(i32.eq (call $gadt_get_tag (local.get $${scrutineeVar})) (i32.const ${tag}))`;
            (pat.args || []).forEach((arg, idx) => {
              if (arg.kind === 'p_var') {
                const varName = this.sanitizeWasmIdent(arg.name);
                this.currentLocals.set(arg.name, 'f64');
                bindLines.push(
                  `${this.indent()}    (local.set $${varName} (call $gadt_get_field (local.get $${scrutineeVar}) (i32.const ${idx})))`
                );
                bindLines.push(
                  `${this.indent()}    (global.set $g_var_${varName} (local.get $${varName}))`
                );
              }
            });
          } else if (pat.kind === 'p_var') {
            const varName = this.sanitizeWasmIdent(pat.name);
            this.currentLocals.set(pat.name, 'f64');
            bindLines.push(
              `${this.indent()}    (local.set $${varName} (f64.convert_i32_u (local.get $${scrutineeVar})))`
            );
            bindLines.push(
              `${this.indent()}    (global.set $g_var_${varName} (local.get $${varName}))`
            );
          } else if (pat.kind === 'p_literal') {
            if (typeof pat.value === 'number') {
              condWat = `(f64.eq (f64.convert_i32_u (local.get $${scrutineeVar})) (f64.const ${pat.value}))`;
            }
          }

          if (arm.guard) {
            condWat = `(i32.and ${condWat} ${this.generateCondition(arm.guard).trim()})`;
          }

          let bodyWat = '';
          if (isStatement) {
            bodyWat = this.generateBlockOrStatement(arm.body);
          } else {
            const valWat = this.ensureF64(arm.body, this.generateExpr(arm.body, false));
            bodyWat = `${this.indent()}    (local.set $${matchResVar} ${valWat.trim()})`;
          }

          armsWat.push([
            `${this.indent()}  (if ${condWat}`,
            `${this.indent()}    (then`,
            bindLines.join('\n'),
            bodyWat,
            `${this.indent()}      (br $${exitLabel})`,
            `${this.indent()}    )`,
            `${this.indent()}  )`
          ].filter(Boolean).join('\n'));
        }

        const lines = [
          `${this.indent()}(local.set $${scrutineeVar} ${scrutineeWat.trim()})`,
          `${this.indent()}(block $${exitLabel}`,
          armsWat.join('\n'),
          `${this.indent()})`,
          isStatement ? '' : `${this.indent()}(local.get $${matchResVar})`
        ].filter(Boolean).join('\n');

        return lines;
      }

      case 'e_index': {
        const target = this.generateExpr(expr.target, false);
        const index = this.generateExpr(expr.index, false);
        return `${this.indent()}(call $array_get\n${target}\n${index}\n${this.indent()})`;
      }

      case 'e_block': {
        const bodyLines: string[] = [];
        const count = expr.statements.length;

        for (let i = 0; i < count; i++) {
          const s = expr.statements[i];
          const isLast = i === count - 1;

          if (isLast && !expr.result && !isStatement) {
            if (s.kind === 's_expr' && s.expr) {
              const valWat = this.generateExpr(s.expr, false);
              bodyLines.push(this.ensureF64(s.expr, valWat));
            } else {
              bodyLines.push(this.generateStatement(s));
              bodyLines.push(`${this.indent()}(f64.const 0)`);
            }
          } else {
            bodyLines.push(this.generateStatement(s));
          }
        }

        if (expr.result) {
          if (isStatement) {
            bodyLines.push(this.generateStatement({ kind: 's_expr', expr: expr.result }));
          } else {
            const valWat = this.generateExpr(expr.result, false);
            bodyLines.push(this.ensureF64(expr.result, valWat));
          }
        } else if (count === 0 && !isStatement) {
          bodyLines.push(`${this.indent()}(f64.const 0)`);
        }

        return bodyLines.filter(l => l.trim()).join('\n');
      }

      default:
        return isStatement ? '' : `${this.indent()}(f64.const 0)`;
    }
  }

  private generateBlockOrStatement(expr: Expr): string {
    if (!expr) return '';
    if (expr.kind === 'e_block') {
      const lines = expr.statements.map(s => this.generateStatement(s));
      if (expr.result) {
        lines.push(this.generateStatement({ kind: 's_expr', expr: expr.result }));
      }
      return lines.filter(l => l.trim()).join('\n');
    }
    return this.generateExpr(expr, true);
  }

  /**
   * Compiles WebAssembly Text (.wat) into binary Uint8Array (.wasm)
   */
  public async compileWatToWasm(wat: string): Promise<Uint8Array> {
    const wabtModule = await import('wabt');
    const wabt = await wabtModule.default();
    const parsed = wabt.parseWat('module.wat', wat);
    const { buffer } = parsed.toBinary({ log: false, write_debug_names: true });
    return new Uint8Array(buffer);
  }

  /**
   * Executes WebAssembly module with full TypeLang host runtime
   */
  public async executeWasm(
    watOrBinary: string | Uint8Array,
    options: { cliArgs?: string[] } = {}
  ): Promise<WasmExecutionResult> {
    const startTime = performance.now();
    const stdout: string[] = [];
    let watSource = '';
    let binary: Uint8Array;

    if (typeof watOrBinary === 'string') {
      watSource = watOrBinary;
      binary = await this.compileWatToWasm(watOrBinary);
    } else {
      binary = watOrBinary;
    }

    let memory: WebAssembly.Memory;
    let instanceRef: WebAssembly.Instance | null = null;
    let nextHostAlloc = 65536;
    const cliArgs = options.cliArgs || ['typelang.wasm'];

    // Helper to read UTF-8 string from linear memory
    const readString = (ptr: number, len: number): string => {
      if (ptr <= 0 || len <= 0 || !memory) return '';
      const buffer = new Uint8Array(memory.buffer, ptr, len);
      return new TextDecoder('utf-8').decode(buffer);
    };

    // Helper to write string into WASM memory and return pointer
    const writeString = (text: string): number => {
      const bytes = Buffer.from(text, 'utf-8');
      const len = bytes.length;
      let ptr: number;
      if (instanceRef && typeof (instanceRef.exports.alloc as any) === 'function') {
        ptr = (instanceRef.exports.alloc as Function)(len + 8);
      } else {
        ptr = nextHostAlloc;
        nextHostAlloc += ((len + 16) & ~7);
      }
      const memView = new DataView(memory.buffer);
      memView.setUint32(ptr, len, true);
      const byteArr = new Uint8Array(memory.buffer, ptr + 4, len);
      byteArr.set(bytes);
      new Uint8Array(memory.buffer, ptr + 4 + len, 1)[0] = 0;
      return ptr;
    };

    const hostImports = {
      host: {
        println_str: (ptr: number, len: number) => {
          stdout.push(readString(ptr, len));
        },
        print_str: (ptr: number, len: number) => {
          const str = readString(ptr, len);
          if (stdout.length === 0) stdout.push('');
          stdout[stdout.length - 1] += str;
        },
        println_num: (n: number) => {
          stdout.push(Number.isInteger(n) ? `${n}` : `${n}`);
        },
        print_num: (n: number) => {
          const s = Number.isInteger(n) ? `${n}` : `${n}`;
          if (stdout.length === 0) stdout.push('');
          stdout[stdout.length - 1] += s;
        },
        num_to_str: (n: number): number => {
          const s = Number.isInteger(n) ? `${n}` : `${n}`;
          return writeString(s);
        },
        parse_int: (ptr: number): number => {
          const len = new DataView(memory.buffer).getUint32(ptr, true);
          const str = readString(ptr + 4, len);
          return parseInt(str, 10) || 0;
        },
        parse_float: (ptr: number): number => {
          const len = new DataView(memory.buffer).getUint32(ptr, true);
          const str = readString(ptr + 4, len);
          return parseFloat(str) || 0;
        },
        read_file: (pathPtr: number, pathLen: number): number => {
          const p = readString(pathPtr, pathLen);
          try {
            const fs = require('fs');
            if (fs.existsSync(p)) {
              return writeString(fs.readFileSync(p, 'utf-8'));
            }
          } catch {}
          return writeString('');
        },
        write_file: (pathPtr: number, pathLen: number, cPtr: number, cLen: number): number => {
          const p = readString(pathPtr, pathLen);
          const c = readString(cPtr, cLen);
          try {
            const fs = require('fs');
            fs.writeFileSync(p, c, 'utf-8');
            return 1.0;
          } catch {
            return 0.0;
          }
        },
        get_cli_arg: (idx: number): number => {
          const i = Math.floor(idx);
          if (i >= 0 && i < cliArgs.length) {
            return writeString(cliArgs[i]);
          }
          return writeString('');
        },
        time_now: (): number => Date.now(),
        math_pow: (base: number, exp: number): number => Math.pow(base, exp)
      }
    };

    try {
      const moduleInstance = await WebAssembly.instantiate(binary, hostImports);
      instanceRef = moduleInstance.instance;
      memory = moduleInstance.instance.exports.memory as WebAssembly.Memory;

      let result: any = 0;
      if (typeof (moduleInstance.instance.exports.main as any) === 'function') {
        result = (moduleInstance.instance.exports.main as Function)();
      } else if (typeof (moduleInstance.instance.exports._start as any) === 'function') {
        result = (moduleInstance.instance.exports._start as Function)();
      }

      const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
      return {
        stdout,
        result,
        exitCode: 0,
        executionTimeMs,
        watSource,
        binarySizeBytes: binary.length
      };
    } catch (err: any) {
      const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
      return {
        stdout,
        exitCode: 1,
        executionTimeMs,
        watSource,
        binarySizeBytes: binary.length,
        error: String(err.message || err)
      };
    }
  }
}
