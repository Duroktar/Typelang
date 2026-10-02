// Complete ES2022 / JavaScript Code Generator for TypeLang
import {
  Program,
  Statement,
  Expr,
  EFor,
  EWhile,
  Pattern,
  MatchArm,
  GADTConstructor,
  ImportSpecifier,
  desugarDo
} from './ast';

export interface JSCodeGenOptions {
  target?: 'browser' | 'node' | 'module';
  includePrelude?: boolean;
  minify?: boolean;
}

const JS_RESERVED_WORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'export', 'extends', 'finally',
  'for', 'function', 'if', 'import', 'in', 'instanceof', 'new',
  'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof',
  'var', 'void', 'while', 'with', 'yield', 'await', 'enum',
  'implements', 'interface', 'package', 'private', 'protected',
  'public', 'static', 'eval', 'arguments'
]);

export function sanitizeIdent(name: string): string {
  if (JS_RESERVED_WORDS.has(name)) {
    return `_${name}`;
  }
  return name;
}

export class JSCodeGenerator {
  private tempVarCounter = 0;
  private indentLevel = 0;
  private localScopeVars: Set<string>[] = [];

  private freshVar(prefix = '_t'): string {
    return `${prefix}$${++this.tempVarCounter}`;
  }

  private indent(): string {
    return '  '.repeat(this.indentLevel);
  }

  private pushScope(vars: string[] = []): void {
    this.localScopeVars.push(new Set(vars));
  }

  private popScope(): void {
    this.localScopeVars.pop();
  }

  private isLocalVar(name: string): boolean {
    for (let i = this.localScopeVars.length - 1; i >= 0; i--) {
      if (this.localScopeVars[i].has(name)) return true;
    }
    return false;
  }

  private addLocalVar(name: string): void {
    if (this.localScopeVars.length > 0) {
      this.localScopeVars[this.localScopeVars.length - 1].add(name);
    }
  }

  public generate(program: Program, options: JSCodeGenOptions = { target: 'browser', includePrelude: true }): string {
    this.tempVarCounter = 0;
    this.indentLevel = 0;
    this.localScopeVars = [];
    const lines: string[] = [];

    if (options.includePrelude !== false) {
      lines.push(this.generatePrelude(options.target || 'browser'));
      lines.push('');
    }

    this.pushScope();
    for (const stmt of program.statements) {
      const stmtStr = this.generateStatement(stmt);
      if (stmtStr.trim()) {
        lines.push(stmtStr);
      }
    }
    this.popScope();

    return lines.join('\n');
  }

  private generatePrelude(target: 'browser' | 'node' | 'module'): string {
    const isNode = target === 'node';
    const header = isNode
      ? '// TypeLang Generated Server Backend (Node.js Target)'
      : '// TypeLang Generated Client Web App (ES2022 Target)';

    const lines: string[] = [
      header,
      '"use strict";',
      '',
      '// Core Language Primitives',
      'const $print = (v) => { console.log(typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)); return null; };',
      'const $println = (v) => { console.log(typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)); return null; };',
      'const $to_string = (v) => typeof v === "object" && v !== null ? JSON.stringify(v) : String(v);',
      'const $concat = (a, b) => String(a) + String(b);',
      'class __BreakSignal {}',
      'class __ContinueSignal {}',
      'class __ReturnSignal { constructor(v) { this.value = v; } }',
      '',
      '// Standard Library: Math Module',
      'const $Math = {',
      '  sqrt: Math.sqrt,',
      '  abs: Math.abs,',
      '  floor: Math.floor,',
      '  ceil: Math.ceil,',
      '  round: Math.round,',
      '  min: Math.min,',
      '  max: Math.max,',
      '  pow: Math.pow,',
      '  random: Math.random,',
      '  cos: Math.cos,',
      '  sin: Math.sin,',
      '  atan2: Math.atan2,',
      '  log: Math.log,',
      '  bitwise_and: (a, b) => Number(a) & Number(b),',
      '  bitwise_or: (a, b) => Number(a) | Number(b),',
      '  bitwise_xor: (a, b) => Number(a) ^ Number(b),',
      '  bitwise_not: (x) => ~Number(x),',
      '  bitwise_shl: (a, b) => Number(a) << Number(b),',
      '  bitwise_shr: (a, b) => Number(a) >> Number(b),',
      '  PI: Math.PI',
      '};',
      'const Math$sqrt = $Math.sqrt, Math$abs = $Math.abs, Math$floor = $Math.floor, Math$ceil = $Math.ceil;',
      'const Math$round = $Math.round, Math$min = $Math.min, Math$max = $Math.max, Math$pow = $Math.pow, Math$random = $Math.random;',
      'const Math$cos = $Math.cos, Math$sin = $Math.sin, Math$atan2 = $Math.atan2, Math$log = $Math.log, Math$PI = $Math.PI;',
      'const Math$bitwise_and = $Math.bitwise_and, Math$bitwise_or = $Math.bitwise_or, Math$bitwise_xor = $Math.bitwise_xor;',
      'const Math$bitwise_not = $Math.bitwise_not, Math$bitwise_shl = $Math.bitwise_shl, Math$bitwise_shr = $Math.bitwise_shr;',
      '',
      '// Standard Library: Array Module',
      'const $Array = {',
      '  len: (arr) => Array.isArray(arr) ? arr.length : 0,',
      '  map: (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.map(fn) : [],',
      '  filter: (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.filter(fn) : [],',
      '  reduce: (arr, init, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.reduce(fn, init) : init,',
      '  push: (arr, elem) => Array.isArray(arr) ? [...arr, elem] : [elem],',
      '  slice: (arr, start, end) => Array.isArray(arr) ? arr.slice(start, end) : [],',
      '  concat: (a, b) => Array.isArray(a) && Array.isArray(b) ? a.concat(b) : [],',
      '  join: (arr, sep) => Array.isArray(arr) ? arr.join(sep) : ""',
      '};',
      'const Array$len = $Array.len, Array$map = $Array.map, Array$filter = $Array.filter, Array$reduce = $Array.reduce;',
      'const Array$push = $Array.push, Array$slice = $Array.slice, Array$concat = $Array.concat, Array$join = $Array.join;',
      '',
      '// Standard Library: String Module',
      'const $String = {',
      '  len: (s) => String(s).length,',
      '  slice: (s, start, end) => String(s).slice(start, end),',
      '  split: (s, delim) => String(s).split(delim),',
      '  contains: (s, sub) => String(s).includes(sub),',
      '  parseInt: (s) => Number.parseInt(String(s), 10),',
      '  parseFloat: (s) => Number.parseFloat(String(s))',
      '};',
      'const String$len = $String.len, String$slice = $String.slice, String$split = $String.split, String$contains = $String.contains;',
      'const String$parseInt = $String.parseInt, String$parseFloat = $String.parseFloat;',
      '',
      '// Standard Library: Option Module',
      'const $Some = (val) => Object.freeze({ $tag: "Some", val, $args: [val] });',
      'const $None = Object.freeze({ $tag: "None", $args: [] });',
      'const $Option = {',
      '  Some: $Some,',
      '  None: $None,',
      '  pure: $Some,',
      '  of: $Some,',
      '  some: $Some,',
      '  none: $None,',
      '  isSome: (opt) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some"),',
      '  isNone: (opt) => Boolean(!opt || typeof opt !== "object" || opt.$tag === "None"),',
      '  getOrElse: (opt, defaultVal) => (opt && typeof opt === "object" && opt.$tag === "Some" ? opt.val : defaultVal),',
      '  map: (opt, fn) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function" ? $Some(fn(opt.val)) : $None),',
      '  flatMap: (opt, fn) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function" ? fn(opt.val) : $None),',
      '  filter: (opt, pred) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof pred === "function" && pred(opt.val) ? opt : $None),',
      '  flatten: (opt) => (opt && typeof opt === "object" && opt.$tag === "Some" ? opt.val : $None),',
      '  zip: (a, b) => (a && typeof a === "object" && a.$tag === "Some" && b && typeof b === "object" && b.$tag === "Some" ? $Some([a.val, b.val]) : $None),',
      '  fromNullable: (v) => (v === null || v === undefined ? $None : $Some(v)),',
      '  fold: (opt, defaultVal, fn) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function" ? fn(opt.val) : defaultVal),',
      '  orElse: (opt, alt) => (opt && typeof opt === "object" && opt.$tag === "Some" ? opt : alt),',
      '  toResult: (opt, err) => (opt && typeof opt === "object" && opt.$tag === "Some" ? $Ok(opt.val) : $Err(err)),',
      '  contains: (opt, elem) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some" && opt.val === elem),',
      '  exists: (opt, pred) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some" && typeof pred === "function" && pred(opt.val)),',
      '  tap: (opt, fn) => { if (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function") fn(opt.val); return opt; }',
      '};',
      'const Option$Some = $Option.Some, Option$None = $Option.None, Option$pure = $Option.pure, Option$of = $Option.of;',
      'const Option$map = $Option.map, Option$flatMap = $Option.flatMap, Option$filter = $Option.filter, Option$getOrElse = $Option.getOrElse;',
      '',
      '// Standard Library: Result Module',
      'const $Ok = (val) => Object.freeze({ $tag: "Ok", val, $args: [val] });',
      'const $Err = (err) => Object.freeze({ $tag: "Err", err, $args: [err] });',
      'const $Result = {',
      '  Ok: $Ok,',
      '  Err: $Err,',
      '  pure: $Ok,',
      '  of: $Ok,',
      '  ok: $Ok,',
      '  err: $Err,',
      '  isOk: (res) => Boolean(res && typeof res === "object" && res.$tag === "Ok"),',
      '  isErr: (res) => Boolean(!res || typeof res !== "object" || res.$tag === "Err"),',
      '  getOrElse: (res, defaultVal) => (res && typeof res === "object" && res.$tag === "Ok" ? res.val : defaultVal),',
      '  map: (res, fn) => (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function" ? $Ok(fn(res.val)) : res),',
      '  mapError: (res, fn) => (res && typeof res === "object" && res.$tag === "Err" && typeof fn === "function" ? $Err(fn(res.err)) : res),',
      '  flatMap: (res, fn) => (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function" ? fn(res.val) : res),',
      '  flatten: (res) => (res && typeof res === "object" && res.$tag === "Ok" ? res.val : res),',
      '  toOption: (res) => (res && typeof res === "object" && res.$tag === "Ok" ? $Some(res.val) : $None),',
      '  fromOption: (opt, err) => (opt && typeof opt === "object" && opt.$tag === "Some" ? $Ok(opt.val) : $Err(err)),',
      '  fold: (res, onErr, onOk) => (res && typeof res === "object" && res.$tag === "Ok" && typeof onOk === "function" ? onOk(res.val) : (typeof onErr === "function" ? onErr(res && res.$tag === "Err" ? res.err : res) : res)),',
      '  orElse: (res, alt) => (res && typeof res === "object" && res.$tag === "Ok" ? res : alt),',
      '  zip: (a, b) => (a && typeof a === "object" && a.$tag === "Ok" && b && typeof b === "object" && b.$tag === "Ok" ? $Ok([a.val, b.val]) : (a && a.$tag === "Err" ? a : b)),',
      '  tap: (res, fn) => { if (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function") fn(res.val); return res; },',
      '  fromTry: (fn) => { try { return $Ok(typeof fn === "function" ? fn() : fn); } catch(e) { return $Err(e?.message || String(e)); } }',
      '};',
      'const Result$Ok = $Result.Ok, Result$Err = $Result.Err, Result$pure = $Result.pure, Result$of = $Result.of;',
      'const Result$map = $Result.map, Result$flatMap = $Result.flatMap, Result$mapError = $Result.mapError, Result$getOrElse = $Result.getOrElse;',
      '',
      '// Standard Library: Either Module',
      'const $Left = (left) => Object.freeze({ $tag: "Left", left, $args: [left] });',
      'const $Right = (right) => Object.freeze({ $tag: "Right", right, $args: [right] });',
      'const $Either = {',
      '  Left: $Left,',
      '  Right: $Right,',
      '  pure: $Right,',
      '  of: $Right,',
      '  left: $Left,',
      '  right: $Right,',
      '  isLeft: (e) => Boolean(e && typeof e === "object" && e.$tag === "Left"),',
      '  isRight: (e) => Boolean(e && typeof e === "object" && e.$tag === "Right"),',
      '  getOrElse: (e, defaultVal) => (e && typeof e === "object" && e.$tag === "Right" ? e.right : defaultVal),',
      '  map: (e, fn) => (e && typeof e === "object" && e.$tag === "Right" && typeof fn === "function" ? $Right(fn(e.right)) : e),',
      '  mapLeft: (e, fn) => (e && typeof e === "object" && e.$tag === "Left" && typeof fn === "function" ? $Left(fn(e.left)) : e),',
      '  flatMap: (e, fn) => (e && typeof e === "object" && e.$tag === "Right" && typeof fn === "function" ? fn(e.right) : e),',
      '  fold: (e, onLeft, onRight) => (e && typeof e === "object" && e.$tag === "Right" && typeof onRight === "function" ? onRight(e.right) : (typeof onLeft === "function" ? onLeft(e && e.$tag === "Left" ? e.left : e) : e)),',
      '  swap: (e) => (e && typeof e === "object" && e.$tag === "Right" ? $Left(e.right) : (e && e.$tag === "Left" ? $Right(e.left) : e)),',
      '  toOption: (e) => (e && typeof e === "object" && e.$tag === "Right" ? $Some(e.right) : $None),',
      '  toResult: (e) => (e && typeof e === "object" && e.$tag === "Right" ? $Ok(e.right) : $Err(e?.left)),',
      '  fromResult: (res) => (res && typeof res === "object" && res.$tag === "Ok" ? $Right(res.val) : $Left(res?.err))',
      '};',
      'const Either$Left = $Either.Left, Either$Right = $Either.Right, Either$pure = $Either.pure, Either$of = $Either.of;',
      'const Either$map = $Either.map, Either$mapLeft = $Either.mapLeft, Either$flatMap = $Either.flatMap, Either$fold = $Either.fold;',
      '',
      '// Standard Library: Reader Module',
      'const $wrapReader = (fn) => ({ $tag: "Reader", run: typeof fn === "function" ? fn : (_r) => fn });',
      'const $Reader = {',
      '  pure: (v) => $wrapReader((_r) => v),',
      '  of: (v) => $wrapReader((_r) => v),',
      '  ask: () => $wrapReader((r) => r),',
      '  asks: (fn) => $wrapReader((r) => typeof fn === "function" ? fn(r) : r),',
      '  run: (reader, env) => (reader && typeof reader.run === "function" ? reader.run(env) : reader),',
      '  map: (reader, fn) => $wrapReader((r) => { const v = reader && typeof reader.run === "function" ? reader.run(r) : reader; return typeof fn === "function" ? fn(v) : v; }),',
      '  flatMap: (reader, fn) => $wrapReader((r) => { const v = reader && typeof reader.run === "function" ? reader.run(r) : reader; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run(r) : next; }),',
      '  local: (reader, transformEnv) => $wrapReader((r) => { const tr = typeof transformEnv === "function" ? transformEnv(r) : r; return reader && typeof reader.run === "function" ? reader.run(tr) : reader; })',
      '};',
      'const Reader$pure = $Reader.pure, Reader$of = $Reader.of, Reader$ask = $Reader.ask, Reader$asks = $Reader.asks, Reader$run = $Reader.run;',
      'const Reader$map = $Reader.map, Reader$flatMap = $Reader.flatMap, Reader$local = $Reader.local;',
      '',
      '// Standard Library: Writer Module',
      'const $wrapWriter = (val, log = []) => ({ $tag: "Writer", val, log: Array.isArray(log) ? log : [log], run: () => [val, Array.isArray(log) ? log : [log]] });',
      'const $Writer = {',
      '  pure: (v) => $wrapWriter(v, []),',
      '  of: (v) => $wrapWriter(v, []),',
      '  tell: (entry) => $wrapWriter(null, [entry]),',
      '  run: (w) => (w && typeof w.run === "function" ? w.run() : [w?.val, w?.log || []]),',
      '  value: (w) => (w ? w.val : null),',
      '  log: (w) => (w && Array.isArray(w.log) ? w.log : []),',
      '  map: (w, fn) => $wrapWriter(typeof fn === "function" ? fn(w?.val) : w?.val, w?.log || []),',
      '  flatMap: (w, fn) => { const next = typeof fn === "function" ? fn(w?.val) : null; return $wrapWriter(next?.val, [...(w?.log || []), ...(next?.log || [])]); },',
      '  listen: (w) => $wrapWriter([w?.val, w?.log || []], w?.log || [])',
      '};',
      'const Writer$pure = $Writer.pure, Writer$of = $Writer.of, Writer$tell = $Writer.tell, Writer$run = $Writer.run;',
      'const Writer$value = $Writer.value, Writer$log = $Writer.log, Writer$map = $Writer.map, Writer$flatMap = $Writer.flatMap;',
      '',
      '// Standard Library: Task Module',
      'const $wrapTask = (fn) => ({ $tag: "Task", run: typeof fn === "function" ? fn : () => fn });',
      'const $Task = {',
      '  pure: (v) => $wrapTask(() => v),',
      '  of: (v) => $wrapTask(() => v),',
      '  succeed: (v) => $wrapTask(() => v),',
      '  delay: (fn) => $wrapTask(typeof fn === "function" ? fn : () => fn),',
      '  run: (t) => (t && typeof t.run === "function" ? t.run() : t),',
      '  map: (t, fn) => $wrapTask(() => { const v = t && typeof t.run === "function" ? t.run() : t; return typeof fn === "function" ? fn(v) : v; }),',
      '  flatMap: (t, fn) => $wrapTask(() => { const v = t && typeof t.run === "function" ? t.run() : t; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run() : next; })',
      '};',
      'const Task$pure = $Task.pure, Task$of = $Task.of, Task$succeed = $Task.succeed, Task$run = $Task.run, Task$map = $Task.map, Task$flatMap = $Task.flatMap;',
      '',
      '// Standard Library: IO Module',
      'const $wrapIO = (comp) => ({ $tag: "IO", run: typeof comp === "function" ? comp : () => comp });',
      'const $IO = {',
      '  pure: (v) => $wrapIO(() => v),',
      '  of: (v) => $wrapIO(() => v),',
      '  delay: (fn) => $wrapIO(typeof fn === "function" ? fn : () => fn),',
      '  map: (io, fn) => $wrapIO(() => { const v = io && typeof io.run === "function" ? io.run() : io; return typeof fn === "function" ? fn(v) : v; }),',
      '  flatMap: (io, fn) => $wrapIO(() => { const v = io && typeof io.run === "function" ? io.run() : io; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run() : next; }),',
      '  run: (io) => (io && typeof io.run === "function" ? io.run() : io),',
      '  println: (msg) => $wrapIO(() => console.log(String(msg)))',
      '};',
      'const IO$pure = $IO.pure, IO$of = $IO.of, IO$delay = $IO.delay, IO$map = $IO.map, IO$flatMap = $IO.flatMap, IO$run = $IO.run;',
      '',
      '// Standard Library: State Module',
      'const $wrapState = (fn) => ({ $tag: "State", run: typeof fn === "function" ? fn : (s) => [null, s] });',
      'const $State = {',
      '  pure: (v) => $wrapState((s) => [v, s]),',
      '  of: (v) => $wrapState((s) => [v, s]),',
      '  get: () => $wrapState((s) => [s, s]),',
      '  set: (ns) => $wrapState((_s) => [null, ns]),',
      '  modify: (fn) => $wrapState((s) => [null, typeof fn === "function" ? fn(s) : s]),',
      '  run: (st, s) => (st && typeof st.run === "function" ? st.run(s) : [null, s]),',
      '  evalState: (st, s) => { const r = st && typeof st.run === "function" ? st.run(s) : [null, s]; return Array.isArray(r) ? r[0] : r; },',
      '  execState: (st, s) => { const r = st && typeof st.run === "function" ? st.run(s) : [null, s]; return Array.isArray(r) ? r[1] : r; },',
      '  map: (st, fn) => $wrapState((s) => { const [v, ns] = st && typeof st.run === "function" ? st.run(s) : [null, s]; return [typeof fn === "function" ? fn(v) : v, ns]; }),',
      '  flatMap: (st, fn) => $wrapState((s) => { const [v, ns] = st && typeof st.run === "function" ? st.run(s) : [null, s]; const next = typeof fn === "function" ? fn(v) : null; return next && typeof next.run === "function" ? next.run(ns) : [null, ns]; })',
      '};',
      'const State$pure = $State.pure, State$get = $State.get, State$set = $State.set, State$modify = $State.modify, State$run = $State.run;',
      'const State$evalState = $State.evalState, State$execState = $State.execState, State$map = $State.map, State$flatMap = $State.flatMap;',
      '',
      '// Standard Library: Setoid Module',
      'const $deepEquals = (a, b) => {',
      '  if (a === b) return true;',
      '  if (a && typeof a === "object" && b && typeof b === "object") {',
      '    if (a.$tag && b.$tag && a.$tag !== b.$tag) return false;',
      '    const ka = Object.keys(a), kb = Object.keys(b);',
      '    if (ka.length !== kb.length) return false;',
      '    for (const k of ka) { if (!$deepEquals(a[k], b[k])) return false; }',
      '    return true;',
      '  }',
      '  return false;',
      '};',
      'const $Setoid = {',
      '  equals: (a, b) => $deepEquals(a, b),',
      '  notEquals: (a, b) => !$deepEquals(a, b),',
      '  fromEquals: (eqFn) => ({ equals: eqFn }),',
      '  contramap: (setoid, fn) => ({ equals: (x, y) => (setoid && typeof setoid.equals === "function" ? setoid.equals(fn(x), fn(y)) : $deepEquals(fn(x), fn(y))) })',
      '};',
      '',
      '// Standard Library: Ord Module',
      'const $OrderingLess = Object.freeze({ $tag: "Less", $args: [] });',
      'const $OrderingEqual = Object.freeze({ $tag: "Equal", $args: [] });',
      'const $OrderingGreater = Object.freeze({ $tag: "Greater", $args: [] });',
      'const $compareVals = (a, b) => {',
      '  if (a === b) return $OrderingEqual;',
      '  if (typeof a === "number" && typeof b === "number") return a < b ? $OrderingLess : $OrderingGreater;',
      '  if (typeof a === "string" && typeof b === "string") return a < b ? $OrderingLess : (a > b ? $OrderingGreater : $OrderingEqual);',
      '  return String(a) < String(b) ? $OrderingLess : (String(a) > String(b) ? $OrderingGreater : $OrderingEqual);',
      '};',
      'const $Ord = {',
      '  Less: $OrderingLess,',
      '  Equal: $OrderingEqual,',
      '  Greater: $OrderingGreater,',
      '  compare: $compareVals,',
      '  min: (a, b) => ($compareVals(a, b) === $OrderingLess ? a : b),',
      '  max: (a, b) => ($compareVals(a, b) === $OrderingGreater ? a : b),',
      '  clamp: (val, minVal, maxVal) => ($compareVals(val, minVal) === $OrderingLess ? minVal : ($compareVals(val, maxVal) === $OrderingGreater ? maxVal : val)),',
      '  between: (val, minVal, maxVal) => ($compareVals(val, minVal) !== $OrderingLess && $compareVals(val, maxVal) !== $OrderingGreater),',
      '  isLess: (a, b) => $compareVals(a, b) === $OrderingLess,',
      '  isGreater: (a, b) => $compareVals(a, b) === $OrderingGreater,',
      '  isEqual: (a, b) => $compareVals(a, b) === $OrderingEqual,',
      '  fromCompare: (cmpFn) => ({ compare: cmpFn }),',
      '  contramap: (ordB, fn) => ({ compare: (x, y) => (ordB && typeof ordB.compare === "function" ? ordB.compare(fn(x), fn(y)) : $compareVals(fn(x), fn(y))) }),',
      '  reverse: (ord) => ({ compare: (x, y) => (ord && typeof ord.compare === "function" ? ord.compare(y, x) : $compareVals(y, x)) })',
      '};',
      '',
      '// Standard Library: Semigroup & SemiGroup Modules',
      'const $combineSemigroup = (a, b) => {',
      '  if (typeof a === "number" && typeof b === "number") return a + b;',
      '  if (typeof a === "string" && typeof b === "string") return a + b;',
      '  if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b];',
      '  if (a && typeof a === "object" && a.$tag === "Some" && b && typeof b === "object" && b.$tag === "Some") return $Some($combineSemigroup(a.val, b.val));',
      '  if (a && typeof a === "object" && a.$tag === "Some") return a;',
      '  if (b && typeof b === "object" && b.$tag === "Some") return b;',
      '  if (a && typeof a === "object" && typeof a.combine === "function") return a.combine(b);',
      '  return b;',
      '};',
      'const $Semigroup = {',
      '  combine: $combineSemigroup,',
      '  concatAll: (list, fallback) => (!Array.isArray(list) || list.length === 0 ? fallback : list.reduce($combineSemigroup)),',
      '  first: () => ({ combine: (a, _b) => a }),',
      '  last: () => ({ combine: (_a, b) => b }),',
      '  struct: (semigroups) => ({ combine: (a, b) => { const res = {}; for (const k in semigroups) res[k] = semigroups[k].combine(a[k], b[k]); return res; } }),',
      '  dual: (s) => ({ combine: (a, b) => (s && typeof s.combine === "function" ? s.combine(b, a) : $combineSemigroup(b, a)) })',
      '};',
      'const $SemiGroup = $Semigroup;',
      '',
      '// Standard Library: Monoid Module',
      'const $monoidEmptyMap = { Sum: 0, Product: 1, String: "", Array: [], All: true, Any: false };',
      'const $Monoid = {',
      '  empty: (typeOrName) => (typeOrName in $monoidEmptyMap ? $monoidEmptyMap[typeOrName] : null),',
      '  combine: $combineSemigroup,',
      '  concatAll: (list, identity) => (!Array.isArray(list) || list.length === 0 ? identity : list.reduce($combineSemigroup, identity)),',
      '  Sum: { empty: () => 0, combine: (a, b) => a + b },',
      '  Product: { empty: () => 1, combine: (a, b) => a * b },',
      '  String: { empty: () => "", combine: (a, b) => a + b },',
      '  Array: { empty: () => [], combine: (a, b) => [...a, ...b] },',
      '  All: { empty: () => true, combine: (a, b) => a && b },',
      '  Any: { empty: () => false, combine: (a, b) => a || b },',
      '  struct: (monoids) => ({ empty: () => { const res = {}; for (const k in monoids) res[k] = monoids[k].empty(); return res; }, combine: (a, b) => { const res = {}; for (const k in monoids) res[k] = monoids[k].combine(a[k], b[k]); return res; } })',
      '};',
      '',
      '// Standard Library: Group Module',
      'const $Group = {',
      '  invert: (a) => (typeof a === "number" ? -a : (a && typeof a.invert === "function" ? a.invert() : a)),',
      '  subtract: (a, b) => (typeof a === "number" && typeof b === "number" ? a - b : $combineSemigroup(a, $Group.invert(b))),',
      '  SumNumber: { empty: () => 0, combine: (a, b) => a + b, invert: (a) => -a },',
      '  ProductNonZero: { empty: () => 1, combine: (a, b) => a * b, invert: (a) => 1 / a }',
      '};',
      '',
      '// Standard Library: Functor Module',
      'const $mapFunctor = (fa, fn) => {',
      '  if (fa && typeof fa === "object") {',
      '    if (fa.$tag === "Some") return $Some(fn(fa.val));',
      '    if (fa.$tag === "None") return $None;',
      '    if (fa.$tag === "Ok") return $Ok(fn(fa.val));',
      '    if (fa.$tag === "Err") return fa;',
      '    if (fa.$tag === "Right") return $Right(fn(fa.right));',
      '    if (fa.$tag === "Left") return fa;',
      '    if (fa.$tag === "Valid") return $Valid(fn(fa.val));',
      '    if (fa.$tag === "Invalid") return fa;',
      '    if (typeof fa.map === "function") return fa.map(fn);',
      '  }',
      '  if (Array.isArray(fa)) return fa.map(fn);',
      '  return fa;',
      '};',
      'const $Functor = {',
      '  map: $mapFunctor,',
      '  lift: (fn) => (fa) => $mapFunctor(fa, fn),',
      '  as: (fa, val) => $mapFunctor(fa, () => val),',
      '  voidRight: (fa) => $mapFunctor(fa, () => null),',
      '  flap: (fab, a) => $mapFunctor(fab, (f) => (typeof f === "function" ? f(a) : f))',
      '};',
      '',
      '// Standard Library: Contravariant Functor Module',
      'const $Contravariant = {',
      '  contramap: (fa, fn) => (typeof fa === "function" ? (x) => fa(fn(x)) : (x) => fa(fn(x))),',
      '  cmap: (fa, fn) => (typeof fa === "function" ? (x) => fa(fn(x)) : (x) => fa(fn(x))),',
      '  predicate: (pred) => ({ run: pred, cmap: (fn) => (x) => pred(fn(x)) })',
      '};',
      '',
      '// Standard Library: Applicative Functor Module',
      'const $apApplicative = (ff, fa) => {',
      '  if (ff && typeof ff === "object" && fa && typeof fa === "object") {',
      '    if (ff.$tag === "Some" && fa.$tag === "Some") return $Some(ff.val(fa.val));',
      '    if (ff.$tag === "None" || fa.$tag === "None") return $None;',
      '    if (ff.$tag === "Ok" && fa.$tag === "Ok") return $Ok(ff.val(fa.val));',
      '    if (ff.$tag === "Err") return ff;',
      '    if (fa.$tag === "Err") return fa;',
      '    if (ff.$tag === "Right" && fa.$tag === "Right") return $Right(ff.right(fa.right));',
      '    if (ff.$tag === "Left") return ff;',
      '    if (fa.$tag === "Left") return fa;',
      '    if (ff.$tag === "Valid" && fa.$tag === "Valid") return $Valid(ff.val(fa.val));',
      '    if (ff.$tag === "Invalid" && fa.$tag === "Invalid") return $Invalid([...ff.errs, ...fa.errs]);',
      '    if (ff.$tag === "Invalid") return ff;',
      '    if (fa.$tag === "Invalid") return fa;',
      '  }',
      '  if (Array.isArray(ff) && Array.isArray(fa)) {',
      '    const res = [];',
      '    for (const f of ff) { for (const a of fa) { if (typeof f === "function") res.push(f(a)); } }',
      '    return res;',
      '  }',
      '  return fa;',
      '};',
      'const $Applicative = {',
      '  pure: $Some,',
      '  ap: $apApplicative,',
      '  lift2: (fn, fa, fb) => $apApplicative($mapFunctor(fa, (a) => (b) => fn(a, b)), fb),',
      '  lift3: (fn, fa, fb, fc) => $apApplicative($apApplicative($mapFunctor(fa, (a) => (b) => (c) => fn(a, b, c)), fb), fc),',
      '  zip: (fa, fb) => $apApplicative($mapFunctor(fa, (a) => (b) => [a, b]), fb)',
      '};',
      '',
      '// Standard Library: Validation Module',
      'const $Valid = (val) => Object.freeze({ $tag: "Valid", val, $args: [val] });',
      'const $Invalid = (errs) => Object.freeze({ $tag: "Invalid", errs: Array.isArray(errs) ? errs : [errs], $args: [Array.isArray(errs) ? errs : [errs]] });',
      'const $Validation = {',
      '  Valid: $Valid,',
      '  Invalid: $Invalid,',
      '  pure: $Valid,',
      '  invalid: (err) => $Invalid([err]),',
      '  isValid: (v) => Boolean(v && typeof v === "object" && v.$tag === "Valid"),',
      '  isInvalid: (v) => Boolean(v && typeof v === "object" && v.$tag === "Invalid"),',
      '  map: (v, fn) => (v && typeof v === "object" && v.$tag === "Valid" && typeof fn === "function" ? $Valid(fn(v.val)) : v),',
      '  ap: $apApplicative,',
      '  accumulate: (v1, v2, fn) => {',
      '    if (v1 && v1.$tag === "Valid" && v2 && v2.$tag === "Valid" && typeof fn === "function") return $Valid(fn(v1.val, v2.val));',
      '    const errs1 = v1 && v1.$tag === "Invalid" ? v1.errs : [];',
      '    const errs2 = v2 && v2.$tag === "Invalid" ? v2.errs : [];',
      '    return $Invalid([...errs1, ...errs2]);',
      '  },',
      '  getOrElse: (v, defaultVal) => (v && v.$tag === "Valid" ? v.val : defaultVal),',
      '  toResult: (v) => (v && v.$tag === "Valid" ? $Ok(v.val) : $Err(v?.errs))',
      '};',
      '',
      '// Standard Library: Bifunctor Module',
      'const $Bifunctor = {',
      '  bimap: (fab, f, g) => {',
      '    if (fab && typeof fab === "object") {',
      '      if (fab.$tag === "Ok") return $Ok(g(fab.val));',
      '      if (fab.$tag === "Err") return $Err(f(fab.err));',
      '      if (fab.$tag === "Right") return $Right(g(fab.right));',
      '      if (fab.$tag === "Left") return $Left(f(fab.left));',
      '      if (typeof fab.bimap === "function") return fab.bimap(f, g);',
      '    }',
      '    return fab;',
      '  }',
      '};',
      '',
      '// Standard Library: Profunctor Module',
      'const $dimapFn = (pab, f, g) => (typeof pab === "function" ? (x) => g(pab(f(x))) : (pab && typeof pab.dimap === "function" ? pab.dimap(f, g) : (x) => g(pab(f(x)))));',
      'const $Profunctor = { dimap: $dimapFn, promap: $dimapFn };',
      '',
      '// Standard Library: Foldable Module',
      'const $Foldable = {',
      '  foldLeft: (fa, initial, fn) => {',
      '    if (Array.isArray(fa)) return fa.reduce(fn, initial);',
      '    if (fa && typeof fa === "object") {',
      '      if (fa.$tag === "Some" || fa.$tag === "Ok") return fn(initial, fa.val);',
      '      if (fa.$tag === "None" || fa.$tag === "Err") return initial;',
      '      if (typeof fa.reduce === "function") return fa.reduce(fn, initial);',
      '    }',
      '    return initial;',
      '  },',
      '  foldMap: (fa, monoid, fn) => {',
      '    const combine = typeof monoid === "object" && typeof monoid.combine === "function" ? monoid.combine : $combineSemigroup;',
      '    const empty = typeof monoid === "object" && typeof monoid.empty === "function" ? monoid.empty() : (typeof monoid === "string" ? $monoidEmptyMap[monoid] : null);',
      '    if (Array.isArray(fa)) return fa.reduce((acc, x) => combine(acc, fn(x)), empty);',
      '    if (fa && typeof fa === "object" && (fa.$tag === "Some" || fa.$tag === "Ok")) return combine(empty, fn(fa.val));',
      '    return empty;',
      '  }',
      '};',
      '',
      '// Standard Library: DOM Module (Browser Target)',
      'const $dom_render_vnode = (vnode) => {',
      '  if (vnode === null || vnode === undefined) return document.createTextNode("");',
      '  if (typeof vnode === "string" || typeof vnode === "number" || typeof vnode === "boolean") return document.createTextNode(String(vnode));',
      '  if (Array.isArray(vnode)) {',
      '    const frag = document.createDocumentFragment();',
      '    for (const child of vnode) frag.appendChild($dom_render_vnode(child));',
      '    return frag;',
      '  }',
      '  if (typeof Node !== "undefined" && vnode instanceof Node) return vnode;',
      '  if (!vnode.$vnode) return document.createTextNode(typeof vnode === "object" ? JSON.stringify(vnode) : String(vnode));',
      '  const isSvg = ["svg", "path", "circle", "rect", "line", "polyline", "polygon", "text", "g"].includes(vnode.tag);',
      '  const el = isSvg',
      '    ? document.createElementNS("http://www.w3.org/2000/svg", vnode.tag)',
      '    : document.createElement(vnode.tag);',
      '  if (vnode.children) {',
      '    const childrenArr = Array.isArray(vnode.children) ? vnode.children : [vnode.children];',
      '    for (const child of childrenArr) {',
      '      if (child !== null && child !== undefined) {',
      '        el.appendChild($dom_render_vnode(child));',
      '      }',
      '    }',
      '  }',
      '  if (vnode.props) {',
      '    const props = (typeof vnode.props === "object" && vnode.props !== null) ? vnode.props : {};',
      '    for (const [k, val] of Object.entries(props)) {',
      '      if (k.startsWith("on") && typeof val === "function") {',
      '        el.addEventListener(k.slice(2).toLowerCase(), val);',
      '      } else if (k === "className" || k === "class") {',
      '        if (isSvg) el.setAttribute("class", val);',
      '        else el.className = val;',
      '      } else if (k === "style") {',
      '        if (typeof val === "object" && val !== null && el.style) {',
      '          Object.assign(el.style, val);',
      '        } else if (typeof val === "string" && el.style) {',
      '          el.style.cssText = val;',
      '        }',
      '      } else if (k === "value" && el && ("value" in el)) {',
      '        el.value = String(val);',
      '      } else if (k === "selected" && el && ("selected" in el)) {',
      '        el.selected = Boolean(val);',
      '      } else if (k === "checked" && el && ("checked" in el)) {',
      '        el.checked = Boolean(val);',
      '      } else if (el && typeof el.setAttribute === "function") {',
      '        el.setAttribute(k, String(val));',
      '      }',
      '    }',
      '  }',
      '  return el;',
      '};',
      'const $get_actx = () => {',
      '  if (typeof window === "undefined") return null;',
      '  const AC = window.AudioContext || window.webkitAudioContext;',
      '  if (!AC) return null;',
      '  if (!window._tl_actx) window._tl_actx = new AC();',
      '  if (window._tl_actx.state === "suspended") {',
      '    try { window._tl_actx.resume(); } catch (_) {}',
      '  }',
      '  return window._tl_actx;',
      '};',
      'const $DOM = {',
      '  getElementById: (id) => {',
      '    if (typeof $mountTarget !== "undefined" && $mountTarget) {',
      '      if ($mountTarget.id === id) return $mountTarget;',
      '      const inner = $mountTarget.querySelector("#" + id);',
      '      if (inner) return inner;',
      '    }',
      '    return typeof document !== "undefined" ? document.getElementById(id) : null;',
      '  },',
      '  createElement: (tag) => typeof document !== "undefined" ? document.createElement(tag) : { tag, attrs: {}, children: [] },',
      '  setText: (el, text) => { if (el && "textContent" in el) el.textContent = String(text); return null; },',
      '  getValue: (el) => (el && "value" in el ? String(el.value) : ""),',
      '  setValue: (el, val) => { if (el && "value" in el) el.value = String(val); return null; },',
      '  focus: (el) => { if (el && typeof el.focus === "function") el.focus(); return null; },',
      '  blur: (el) => { if (el && typeof el.blur === "function") el.blur(); return null; },',
      '  setHtml: (el, html) => { if (el && "innerHTML" in el) el.innerHTML = String(html); return null; },',
      '  setAttr: (el, k, v) => { if (el && "setAttribute" in el) el.setAttribute(k, String(v)); return null; },',
      '  appendChild: (parent, child) => { if (parent && "appendChild" in parent && child) parent.appendChild(child); return null; },',
      '  addEventListener: (el, evt, handler) => { if (el && "addEventListener" in el) el.addEventListener(evt, handler); return null; },',
      '  h: (tag, props = {}, children = []) => ({ $vnode: true, tag, props: props || {}, children: Array.isArray(children) ? children : [children] }),',
      '  mount: (containerId, vnode) => {',
      '    let root = null;',
      '    if (typeof $mountTarget !== "undefined" && $mountTarget) {',
      '      if (typeof containerId === "string") {',
      '        if ($mountTarget.id === containerId) root = $mountTarget;',
      '        else root = $mountTarget.querySelector("#" + containerId) || $mountTarget;',
      '      } else {',
      '        root = containerId;',
      '      }',
      '    }',
      '    if (!root && typeof document !== "undefined") {',
      '      root = typeof containerId === "string" ? document.getElementById(containerId) : containerId;',
      '    }',
      '    if (root) {',
      '      root.innerHTML = "";',
      '      root.appendChild($dom_render_vnode(vnode));',
      '    }',
      '    return null;',
      '  },',
      '  eval: (code) => { try { return (typeof window !== "undefined" && window.eval ? window.eval(code) : (0, eval)(code)); } catch (e) { return null; } },',
      '  _eval: (code) => { try { return (typeof window !== "undefined" && window.eval ? window.eval(code) : (0, eval)(code)); } catch (e) { return null; } },',
      '  log: (v) => { console.log(v); return null; },',
      '  initAudio: () => { try { const c = $get_actx(); if (c && c.state === "suspended") c.resume(); return c; } catch (_) { return null; } },',
      '  playCustomTone: (freq, waveType, duration, volume, attack) => {',
      '    try {',
      '      const c = $get_actx();',
      '      if (!c) return null;',
      '      const o = c.createOscillator();',
      '      const g = c.createGain();',
      '      o.type = waveType || "square";',
      '      o.frequency.setValueAtTime(Math.max(1, freq || 440), c.currentTime);',
      '      const d = duration || 0.1;',
      '      const v = volume !== undefined ? volume : 0.1;',
      '      const atk = attack || 0.015;',
      '      g.gain.setValueAtTime(0.0001, c.currentTime);',
      '      g.gain.linearRampToValueAtTime(v, c.currentTime + atk);',
      '      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d);',
      '      o.connect(g);',
      '      g.connect(c.destination);',
      '      o.start();',
      '      o.stop(c.currentTime + d);',
      '    } catch (_) {}',
      '    return null;',
      '  },',
      '  playNoise: (duration, volume) => {',
      '    try {',
      '      const c = $get_actx();',
      '      if (!c) return null;',
      '      const dur = duration || 0.12;',
      '      const vol = volume !== undefined ? volume : 0.2;',
      '      const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);',
      '      const data = buf.getChannelData(0);',
      '      for (let i = 0; i < data.length; i++) {',
      '        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.03));',
      '      }',
      '      const src = c.createBufferSource();',
      '      src.buffer = buf;',
      '      const gain = c.createGain();',
      '      gain.gain.setValueAtTime(vol, c.currentTime);',
      '      gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);',
      '      src.connect(gain);',
      '      gain.connect(c.destination);',
      '      src.start();',
      '    } catch (_) {}',
      '    return null;',
      '  },',
      '  playTone: (freq, duration, waveType, volume) => {',
      '    try {',
      '      const c = $get_actx();',
      '      if (!c) return null;',
      '      const o = c.createOscillator();',
      '      const g = c.createGain();',
      '      o.type = waveType || "sine";',
      '      o.frequency.setValueAtTime(Math.max(1, freq || 440), c.currentTime);',
      '      const d = duration || 0.08;',
      '      const v = volume !== undefined ? volume : 0.1;',
      '      g.gain.setValueAtTime(v, c.currentTime);',
      '      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d);',
      '      o.connect(g);',
      '      g.connect(c.destination);',
      '      o.start();',
      '      o.stop(c.currentTime + d);',
      '    } catch (_) {}',
      '    return null;',
      '  },',
      '  playRamp: (startFreq, endFreq, duration, waveType, volume) => {',
      '    try {',
      '      const c = $get_actx();',
      '      if (!c) return null;',
      '      const o = c.createOscillator();',
      '      const g = c.createGain();',
      '      o.type = waveType || "sine";',
      '      o.frequency.setValueAtTime(Math.max(1, startFreq || 440), c.currentTime);',
      '      const d = duration || 0.08;',
      '      const v = volume !== undefined ? volume : 0.1;',
      '      o.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq || 220), c.currentTime + d);',
      '      g.gain.setValueAtTime(v, c.currentTime);',
      '      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d);',
      '      o.connect(g);',
      '      g.connect(c.destination);',
      '      o.start();',
      '      o.stop(c.currentTime + d);',
      '    } catch (_) {}',
      '    return null;',
      '  },',
      '  playSequence: (notes, noteDuration, waveType, volume) => {',
      '    try {',
      '      const c = $get_actx();',
      '      if (!c || !notes || !notes.length) return null;',
      '      const d = noteDuration || 0.08;',
      '      const v = volume !== undefined ? volume : 0.12;',
      '      notes.forEach((f, i) => {',
      '        if (f <= 0) return;',
      '        const o = c.createOscillator();',
      '        const g = c.createGain();',
      '        o.type = waveType || "sine";',
      '        o.frequency.setValueAtTime(f, c.currentTime + i * d);',
      '        g.gain.setValueAtTime(v, c.currentTime + i * d);',
      '        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + i * d + d * 1.5);',
      '        o.connect(g);',
      '        g.connect(c.destination);',
      '        o.start(c.currentTime + i * d);',
      '        o.stop(c.currentTime + i * d + d * 1.5);',
      '      });',
      '    } catch (_) {}',
      '    return null;',
      '  },',
      '  startMusic: (id, notes, intervalMs, waveType, volume) => {',
      '    try {',
      '      if (typeof window === "undefined") return null;',
      '      if (!window._tl_music_loops) window._tl_music_loops = {};',
      '      if (window._tl_music_loops[id]) clearInterval(window._tl_music_loops[id]);',
      '      let step = 0;',
      '      const c = $get_actx();',
      '      const iv = intervalMs || 150;',
      '      const v = volume !== undefined ? volume : 0.04;',
      '      const w = waveType || "square";',
      '      window._tl_music_loops[id] = setInterval(() => {',
      '        if (!c || !notes || !notes.length) return;',
      '        const f = notes[step % notes.length];',
      '        step++;',
      '        if (f > 0) {',
      '          const o = c.createOscillator();',
      '          const g = c.createGain();',
      '          o.type = w;',
      '          o.frequency.setValueAtTime(f, c.currentTime);',
      '          g.gain.setValueAtTime(v, c.currentTime);',
      '          g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (iv / 1000) * 0.9);',
      '          o.connect(g);',
      '          g.connect(c.destination);',
      '          o.start();',
      '          o.stop(c.currentTime + (iv / 1000) * 0.9);',
      '        }',
      '      }, iv);',
      '    } catch (_) {}',
      '    return null;',
      '  },',
      '  stopMusic: (id) => {',
      '    try {',
      '      if (typeof window !== "undefined" && window._tl_music_loops && window._tl_music_loops[id]) {',
      '        clearInterval(window._tl_music_loops[id]);',
      '        delete window._tl_music_loops[id];',
      '      }',
      '    } catch (_) {}',
      '    return null;',
      '  },',
      '  resumeAudio: () => {',
      '    try {',
      '      const c = $get_actx();',
      '      if (c && c.state === "suspended") c.resume();',
      '    } catch (_) {}',
      '    return null;',
      '  },',
      '  confetti: (count, spread, originY) => {',
      '    try {',
      '      if (typeof window !== "undefined" && window.confetti) {',
      '        window.confetti({',
      '          particleCount: count || 80,',
      '          spread: spread || 70,',
      '          origin: { y: originY !== undefined ? originY : 0.6 }',
      '        });',
      '      }',
      '    } catch (_) {}',
      '    return null;',
      '  },',
      '  setInterval: (fn, ms) => (typeof setInterval !== "undefined" ? setInterval(fn, ms) : 0),',
      '  clearInterval: (id) => { if (typeof clearInterval !== "undefined") clearInterval(id); return null; },',
      '  setTimeout: (fn, ms) => (typeof setTimeout !== "undefined" ? setTimeout(fn, ms) : 0),',
      '  clearTimeout: (id) => { if (typeof clearTimeout !== "undefined") clearTimeout(id); return null; },',
      '  requestAnimationFrame: (fn) => { if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(fn); return null; },',
      '  storageGet: (k) => { try { return (typeof localStorage !== "undefined" && localStorage.getItem(k)) || ""; } catch (_) { return ""; } },',
      '  storageSet: (k, v) => { try { if (typeof localStorage !== "undefined") localStorage.setItem(k, v); } catch (_) {} return null; },',
      '  storageRemove: (k) => { try { if (typeof localStorage !== "undefined") localStorage.removeItem(k); } catch (_) {} return null; }',
      '};',
      'const DOM = $DOM;',
      'const DOM$getElementById = $DOM.getElementById, DOM$createElement = $DOM.createElement, DOM$setText = $DOM.setText;',
      'const DOM$setHtml = $DOM.setHtml, DOM$setAttr = $DOM.setAttr, DOM$appendChild = $DOM.appendChild, DOM$addEventListener = $DOM.addEventListener;',
      'const DOM$h = $DOM.h, DOM$mount = $DOM.mount, DOM$eval = $DOM.eval, DOM$_eval = $DOM._eval, DOM$log = $DOM.log;',
      'const DOM$playTone = $DOM.playTone, DOM$playRamp = $DOM.playRamp, DOM$playSequence = $DOM.playSequence;',
      'const DOM$startMusic = $DOM.startMusic, DOM$stopMusic = $DOM.stopMusic, DOM$resumeAudio = $DOM.resumeAudio, DOM$confetti = $DOM.confetti;',
      'const DOM$setInterval = $DOM.setInterval, DOM$clearInterval = $DOM.clearInterval, DOM$setTimeout = $DOM.setTimeout, DOM$clearTimeout = $DOM.clearTimeout, DOM$requestAnimationFrame = $DOM.requestAnimationFrame;',
      'const DOM$storageGet = $DOM.storageGet, DOM$storageSet = $DOM.storageSet, DOM$storageRemove = $DOM.storageRemove;',
      '',
      '// Standard Library: Node.js / Universal Data Processing Module',
      'const $node_req = (m) => { try { return typeof require !== "undefined" ? require(m) : null; } catch (_) { return null; } };',
      'const fs = $node_req("fs");',
      'const path = $node_req("path");',
      'const http = $node_req("http");',
      '',
      'const $Node = {',
      '  envGet: (k) => (typeof process !== "undefined" && process.env ? process.env[k] || "" : ""),',
      '  readFile: (p) => fs ? fs.readFileSync(p, "utf-8") : `// Mock file content for ${p}`,',
      '  writeFile: (p, content) => { if (fs) fs.writeFileSync(p, content, "utf-8"); return null; },',
      '  stringify: (data) => JSON.stringify(data),',
      '  parse: (str) => JSON.parse(str),',
      '  now: () => Date.now(),',
      '  createApp: () => {',
      '    const express = $node_req("express");',
      '    if (express) {',
      '      try { return express(); } catch (_) {}',
      '    }',
      '    const routes = [];',
      '    const middlewares = [];',
      '    const app = {',
      '      use: (fn) => { middlewares.push(fn); return app; },',
      '      get: (p, fn) => { routes.push({ method: "GET", path: p, fn }); return app; },',
      '      post: (p, fn) => { routes.push({ method: "POST", path: p, fn }); return app; },',
      '      listen: (port, cb) => {',
      '        if (http) {',
      '          const server = http.createServer((req, res) => {',
      '            res.json = (data) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(data)); };',
      '            res.status = (code) => { res.statusCode = code; return res; };',
      '            res.send = (body) => { res.end(String(body)); };',
      '            const matched = routes.find(r => r.method === req.method && r.path === req.url);',
      '            if (matched) return matched.fn(req, res);',
      '            res.statusCode = 404; res.end("Not Found");',
      '          });',
      '          server.listen(port, () => { if (cb) cb(); });',
      '          return server;',
      '        }',
      '        console.log(`[Mock Server] Listening on port ${port}`);',
      '        if (cb) cb();',
      '        return { close: () => {} };',
      '      }',
      '    };',
      '    return app;',
      '  },',
      '  get: (app, p, handler) => { if (app && app.get) app.get(p, handler); return null; },',
      '  post: (app, p, handler) => { if (app && app.post) app.post(p, handler); return null; },',
      '  use: (app, middleware) => { if (app && app.use) app.use(middleware); return null; },',
      '  listen: (app, port, cb) => { console.log(`[Express Engine] Server listening on port ${port}`); if (cb) cb(); return { close: () => {} }; },',
      '  send: (res, body) => { if (res && res.send) res.send(body); else if (res && res.end) res.end(body); return null; },',
      '  json: (res, data) => { if (res && res.json) res.json(data); else if (res && res.end) res.end(JSON.stringify(data)); return null; },',
      '  status: (res, code) => { if (res && res.status) return res.status(code); if (res) res.statusCode = code; return res; }',
      '};',
      'const Node$envGet = $Node.envGet, Node$readFile = $Node.readFile, Node$writeFile = $Node.writeFile;',
      'const Node$stringify = $Node.stringify, Node$parse = $Node.parse, Node$now = $Node.now, Node$createApp = $Node.createApp;',
      'const Node$get = $Node.get, Node$post = $Node.post, Node$use = $Node.use, Node$listen = $Node.listen;',
      'const Node$send = $Node.send, Node$json = $Node.json, Node$status = $Node.status;'
    ];

    return lines.join('\n');
  }

  public generateStatement(stmt: Statement): string {
    switch (stmt.kind) {
      case 's_let': {
        const keyword = stmt.isMut ? 'let' : 'const';
        const safeName = sanitizeIdent(stmt.name);
        this.addLocalVar(stmt.name);
        const init = this.generateExpr(stmt.init);
        return `${this.indent()}${keyword} ${safeName} = ${init};`;
      }

      case 's_function': {
        const safeName = sanitizeIdent(stmt.name);
        this.addLocalVar(stmt.name);
        const paramNames = stmt.params.map(p => sanitizeIdent(p.name));
        this.pushScope(stmt.params.map(p => p.name));
        let whereStr = '';
        if (stmt.whereBindings && stmt.whereBindings.length > 0) {
          whereStr = stmt.whereBindings.map(s => this.generateStatement(s)).join('\n') + '\n';
        }
        const bodyStr = this.generateFunctionBody(stmt.body);
        this.popScope();
        return `${this.indent()}function ${safeName}(${paramNames.join(', ')}) {\n${whereStr}${this.indent()}  try {\n${bodyStr}\n${this.indent()}  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }\n${this.indent()}}`;
      }

      case 's_gadt': {
        const ctors = stmt.decl.constructors.map(ctor => {
          this.addLocalVar(ctor.name);
          const safeCtorName = sanitizeIdent(ctor.name);
          if (ctor.params.length === 0) {
            return `${this.indent()}const ${safeCtorName} = Object.freeze({ $tag: "${ctor.name}", $args: [] });`;
          }
          const p = ctor.params.map(x => sanitizeIdent(x.name)).join(', ');
          const props = ctor.params.map(x => `${sanitizeIdent(x.name)}: ${sanitizeIdent(x.name)}`).join(', ');
          const args = ctor.params.map(x => sanitizeIdent(x.name)).join(', ');
          return `${this.indent()}const ${safeCtorName} = (${p}) => ({ $tag: "${ctor.name}", ${props}, $args: [${args}] });`;
        });
        return ctors.join('\n');
      }

      case 's_module': {
        const modName = sanitizeIdent(stmt.name);
        this.addLocalVar(stmt.name);
        this.indentLevel++;
        this.pushScope();
        const innerStmts = stmt.body.map(s => this.generateStatement(s)).join('\n');
        this.popScope();

        // Collect all exported symbols: functions, lets, modules, GADT constructors
        const exports: string[] = [];
        const addExport = (rawName: string) => {
          const safe = sanitizeIdent(rawName);
          if (rawName !== safe) {
            exports.push(`${rawName}: ${safe}`);
            exports.push(safe);
          } else {
            exports.push(safe);
          }
        };
        for (const s of stmt.body) {
          if (s.kind === 's_let' && s.name) addExport(s.name);
          else if (s.kind === 's_function' && s.name) addExport(s.name);
          else if (s.kind === 's_module' && s.name) addExport(s.name);
          else if (s.kind === 's_gadt') {
            s.decl.constructors.forEach(c => addExport(c.name));
          }
        }
        this.indentLevel--;

        return [
          `${this.indent()}const ${modName} = (() => {`,
          innerStmts,
          `${this.indent()}  return { ${exports.join(', ')} };`,
          `${this.indent()}})();`
        ].join('\n');
      }

      case 's_import': {
        const stdModules = ['Math', 'Array', 'String', 'DOM', 'Node', 'Option', 'Result', 'Either', 'Reader', 'Writer', 'Task', 'IO', 'State', 'Setoid', 'Ord', 'Semigroup', 'SemiGroup', 'Monoid', 'Group', 'Functor', 'Contravariant', 'Applicative', 'Validation', 'Bifunctor', 'Profunctor', 'Foldable'];
        const modHead = stmt.modulePath[0];
        const modPath = stdModules.includes(modHead) && stmt.modulePath.length === 1
          ? `$${modHead}`
          : stmt.modulePath.map(sanitizeIdent).join('.');

        if (stmt.specifiers && stmt.specifiers.length > 0) {
          const specs = stmt.specifiers.map(s => {
            const srcName = s.name;
            const dstName = s.alias ? sanitizeIdent(s.alias) : sanitizeIdent(s.name);
            this.addLocalVar(s.alias || s.name);
            return dstName !== srcName ? `${srcName}: ${dstName}` : srcName;
          }).join(', ');
          return `${this.indent()}const { ${specs} } = ${modPath};`;
        }
        if (stmt.alias) {
          const safeAlias = sanitizeIdent(stmt.alias);
          this.addLocalVar(stmt.alias);
          return `${this.indent()}const ${safeAlias} = ${modPath};`;
        }
        return `${this.indent()}const ${sanitizeIdent(stmt.modulePath[stmt.modulePath.length - 1])} = ${modPath};`;
      }

      case 's_extern_function': {
        const safeName = sanitizeIdent(stmt.name);
        this.addLocalVar(stmt.name);
        const globalSymbol = stmt.jsSymbol || stmt.name;
        const targetMod = stmt.moduleName ? sanitizeIdent(stmt.moduleName) : null;
        if (targetMod) {
          return `${this.indent()}const ${safeName} = (...args) => (typeof ${targetMod} !== "undefined" && typeof ${targetMod}["${globalSymbol}"] === "function") ? ${targetMod}["${globalSymbol}"](...args) : (typeof globalThis !== "undefined" && globalThis["${targetMod}"] && typeof globalThis["${targetMod}"]["${globalSymbol}"] === "function") ? globalThis["${targetMod}"]["${globalSymbol}"](...args) : null;`;
        }
        return `${this.indent()}const ${safeName} = (...args) => { const g = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : global); const fn = g["${globalSymbol}"]; return typeof fn === "function" ? fn(...args) : null; };`;
      }

      case 's_extern_type':
        return `${this.indent()}// extern type ${stmt.name}`;

      case 's_extern_value': {
        const safeName = sanitizeIdent(stmt.name);
        this.addLocalVar(stmt.name);
        const symbol = stmt.jsSymbol || stmt.name;
        if (stmt.name === 'window' || symbol === 'window') {
          return `${this.indent()}const ${safeName} = (typeof globalThis !== "undefined" ? (globalThis.window || globalThis) : undefined);`;
        }
        return `${this.indent()}const ${safeName} = (typeof globalThis !== "undefined" && "${symbol}" in globalThis ? globalThis["${symbol}"] : (typeof globalThis !== "undefined" ? globalThis["${symbol}"] : undefined));`;
      }

      case 's_extern_module': {
        const rawModName = stmt.name.replace(/^npm:/, '');
        const safeModName = sanitizeIdent(rawModName.replace(/[^a-zA-Z0-9_]/g, '_'));
        this.addLocalVar(safeModName);

        const exportedFns = stmt.functions.map(fn => {
          const fnName = sanitizeIdent(fn.name);
          const jsSym = fn.jsSymbol || fn.name;
          return `${fnName}: (...args) => {
            const g = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : global);
            const m = g["${rawModName}"] || g["${safeModName}"] || g;
            const target = typeof m["${jsSym}"] === "function" ? m["${jsSym}"] : (typeof g["${jsSym}"] === "function" ? g["${jsSym}"] : null);
            if (target) return target(...args);
            if ("${jsSym}" === "sum" && Array.isArray(args[0])) return args[0].reduce((a, b) => Number(a) + Number(b), 0);
            if ("${jsSym}" === "chunk" && Array.isArray(args[0])) {
              const arr = args[0], size = Number(args[1]) || 1, res = [];
              for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
              return res;
            }
            console.warn("FFI call ${stmt.name}.${fn.name} missing implementation");
            return null;
          }`;
        });

        const exportedVals = stmt.values.map(v => {
          const vName = sanitizeIdent(v.name);
          const jsSym = v.jsSymbol || v.name;
          return `${vName}: (typeof globalThis !== "undefined" ? (globalThis["${rawModName}"] ? globalThis["${rawModName}"]["${jsSym}"] : globalThis["${jsSym}"]) : undefined)`;
        });

        return [
          `${this.indent()}const ${safeModName} = (() => {`,
          `${this.indent()}  const g = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : global);`,
          `${this.indent()}  const rawMod = g["${rawModName}"] || g["${safeModName}"] || {};`,
          `${this.indent()}  return {`,
          ...exportedFns.map(f => `${this.indent()}    ${f},`),
          ...exportedVals.map(v => `${this.indent()}    ${v},`),
          `${this.indent()}    ...rawMod`,
          `${this.indent()}  };`,
          `${this.indent()}})();`
        ].join('\n');
      }

      case 's_type_alias':
        return `${this.indent()}// type alias ${stmt.decl.name}`;

      case 's_expr': {
        if (stmt.expr.kind === 'e_for') {
          return this.generateForStatement(stmt.expr);
        }
        if (stmt.expr.kind === 'e_while') {
          return this.generateWhileStatement(stmt.expr);
        }
        const exprStr = this.generateExpr(stmt.expr);
        return `${this.indent()}${exprStr};`;
      }

      default:
        return '';
    }
  }

  private generateFunctionBody(body: Expr): string {
    this.indentLevel++;
    if (body.kind === 'e_block') {
      this.pushScope();
      const lines: string[] = [];
      for (const s of body.statements) {
        lines.push(this.generateStatement(s));
      }
      if (body.result) {
        lines.push(`${this.indent()}return ${this.generateExpr(body.result)};`);
      }
      this.popScope();
      this.indentLevel--;
      return lines.join('\n');
    }

    const ret = `${this.indent()}return ${this.generateExpr(body)};`;
    this.indentLevel--;
    return ret;
  }

  public generateExpr(expr: Expr): string {
    switch (expr.kind) {
      case 'e_literal':
        if (expr.value === null) return 'null';
        if (typeof expr.value === 'string') return JSON.stringify(expr.value);
        return String(expr.value);

      case 'e_var': {
        const isLocal = this.isLocalVar(expr.name);
        const corePrimitives = ['print', 'println', 'to_string', 'concat'];
        const stdModules = ['Math', 'Array', 'String', 'DOM', 'Node', 'Option', 'Result', 'Either', 'Reader', 'Writer', 'Task', 'IO', 'State', 'Setoid', 'Ord', 'Semigroup', 'SemiGroup', 'Monoid', 'Group', 'Functor', 'Contravariant', 'Applicative', 'Validation', 'Bifunctor', 'Profunctor', 'Foldable'];

        if (!isLocal && corePrimitives.includes(expr.name) && (!expr.modulePath || expr.modulePath.length === 0)) {
          return `$${expr.name}`;
        }
        if (!isLocal && stdModules.includes(expr.name) && (!expr.modulePath || expr.modulePath.length === 0)) {
          return `$${expr.name}`;
        }
        if (expr.modulePath && expr.modulePath.length > 0) {
          const modHead = expr.modulePath[0];
          const modStr = stdModules.includes(modHead) && expr.modulePath.length === 1
            ? `$${modHead}`
            : expr.modulePath.map(sanitizeIdent).join('.');
          return `${modStr}.${sanitizeIdent(expr.name)}`;
        }
        return sanitizeIdent(expr.name);
      }

      case 'e_unary': {
        const sub = this.generateExpr(expr.expr);
        return `${expr.op}(${sub})`;
      }

      case 'e_binary': {
        const left = this.generateExpr(expr.left);
        const right = this.generateExpr(expr.right);
        let op: string = expr.op;
        if (op === '==') op = '===';
        if (op === '!=') op = '!==';
        return `(${left} ${op} ${right})`;
      }

      case 'e_assign': {
        const val = this.generateExpr(expr.value);
        const op = expr.op || '=';
        if (expr.target.kind === 'e_var') {
          return `(${sanitizeIdent(expr.target.name)} ${op} ${val})`;
        } else if (expr.target.kind === 'e_field_access') {
          const obj = this.generateExpr(expr.target.object);
          return `(${obj}.${sanitizeIdent(expr.target.field)} ${op} ${val})`;
        } else if (expr.target.kind === 'e_index') {
          const obj = this.generateExpr(expr.target.target);
          const idx = this.generateExpr(expr.target.index);
          return `(${obj}[${idx}] ${op} ${val})`;
        }
        return `(${val})`;
      }

      case 'e_call': {
        const callee = this.generateExpr(expr.callee);
        const args = expr.args.map(a => this.generateExpr(a)).join(', ');
        return `${callee}(${args})`;
      }

      case 'e_method_call': {
        const obj = this.generateExpr(expr.object);
        const args = expr.args.map(a => this.generateExpr(a));
        const nativeMethods = [
          'push', 'pop', 'shift', 'unshift', 'splice', 'slice', 'indexOf', 'lastIndexOf',
          'includes', 'join', 'concat', 'map', 'filter', 'reduce', 'forEach', 'find', 'findIndex',
          'trim', 'toLowerCase', 'toUpperCase', 'replace', 'replaceAll', 'split', 'charAt',
          'substring', 'startsWith', 'endsWith', 'toString', 'valueOf',
          'addEventListener', 'removeEventListener', 'getAttribute', 'setAttribute',
          'getElementById', 'querySelector', 'querySelectorAll', 'appendChild', 'removeChild',
          'getContext', 'getBoundingClientRect', 'fill', 'stroke', 'beginPath', 'closePath',
          'moveTo', 'lineTo', 'arc', 'rect', 'fillRect', 'strokeRect', 'clearRect',
          'fillText', 'strokeText', 'setLineDash', 'getLineDash', 'measureText', 'clip',
          'createLinearGradient', 'createRadialGradient', 'createPattern', 'drawImage',
          'addColorStop', 'quadraticCurveTo', 'bezierCurveTo', 'ellipse', 'arcTo',
          'save', 'restore', 'translate', 'rotate', 'scale', 'preventDefault', 'stopPropagation'
        ];
        if (nativeMethods.includes(expr.method) || expr.isModuleMethod) {
          return `${obj}.${sanitizeIdent(expr.method)}(${args.join(', ')})`;
        }
        // Pass obj as first 'self' parameter to support TypeLang record methods
        const allArgs = [obj, ...args].join(', ');
        return `${obj}.${sanitizeIdent(expr.method)}(${allArgs})`;
      }

      case 'e_field_access': {
        const obj = this.generateExpr(expr.object);
        return `${obj}.${sanitizeIdent(expr.field)}`;
      }

      case 'e_index': {
        const target = this.generateExpr(expr.target);
        const idx = this.generateExpr(expr.index);
        return `${target}[${idx}]`;
      }

      case 'e_record': {
        const fields = expr.fields.map(f => `${sanitizeIdent(f.name)}: ${this.generateExpr(f.value)}`);
        const methods = (expr.methods || []).map(m => {
          const selfP = sanitizeIdent(m.selfParam);
          const params = [selfP, ...m.params.map(p => sanitizeIdent(p.name))].join(', ');
          this.pushScope([m.selfParam, ...m.params.map(p => p.name)]);
          const body = this.generateFunctionBody(m.body);
          this.popScope();
          return `${sanitizeIdent(m.name)}: function(${params}) {\n${body}\n${this.indent()}}`;
        });
        const all = [...fields, ...methods];
        if (all.length === 0) return '({})';
        return `({ ${all.join(', ')} })`;
      }

      case 'e_record_update': {
        const base = this.generateExpr(expr.base);
        const updates = expr.updates.map(u => `${sanitizeIdent(u.name)}: ${this.generateExpr(u.value)}`).join(', ');
        return updates ? `({ ...${base}, ${updates} })` : `({ ...${base} })`;
      }

      case 'e_tuple': {
        const elems = expr.elements.map(e => this.generateExpr(e)).join(', ');
        return `[${elems}]`;
      }

      case 'e_lambda': {
        const paramNames = expr.params.map(p => sanitizeIdent(p.name));
        this.pushScope(expr.params.map(p => p.name));
        let res: string;
        if (expr.body.kind === 'e_block') {
          const body = this.generateFunctionBody(expr.body);
          res = `((${paramNames.join(', ')}) => {\n${body}\n${this.indent()}})`;
        } else {
          res = `((${paramNames.join(', ')}) => ${this.generateExpr(expr.body)})`;
        }
        this.popScope();
        return res;
      }

      case 'e_if': {
        const cond = this.generateExpr(expr.cond);
        const thenE = this.generateExpr(expr.thenExpr);
        if (expr.elseExpr) {
          const elseE = this.generateExpr(expr.elseExpr);
          return `(${cond} ? ${thenE} : ${elseE})`;
        }
        return `(${cond} ? ${thenE} : null)`;
      }

      case 'e_block': {
        this.indentLevel++;
        this.pushScope();
        const stmts = expr.statements.map(s => this.generateStatement(s));
        const res = expr.result ? `${this.indent()}return ${this.generateExpr(expr.result)};` : '';
        this.popScope();
        this.indentLevel--;
        const content = [...stmts, res].filter(Boolean).join('\n');
        return `(() => {\n${content}\n${this.indent()}})()`;
      }

      case 'e_match': {
        return this.generateMatchExpr(expr.scrutinee, expr.arms);
      }
      
      case 'e_switch': {
        const discr = this.generateExpr(expr.discriminant);
        let out = `(() => {\n  const $discr = ${discr};\n  let $matched = false, $fallthrough = false;\n`;
        for (const c of expr.cases) {
          const vals = c.values && c.values.length > 0 ? c.values : (c.value ? [c.value] : []);
          const conds = vals.map(v => `$discr === (${this.generateExpr(v)})`).join(' || ');
          out += `  if ($fallthrough || (${conds})) {\n    $matched = true;\n    $fallthrough = false;\n    try {\n      return ${this.generateExpr(c.body)};\n    } catch ($e) {\n      if ($e instanceof __ContinueSignal) { $fallthrough = true; }\n      else if ($e instanceof __BreakSignal) { return; }\n      else throw $e;\n    }\n  }\n`;
        }
        if (expr.defaultCase) {
          out += `  if ($fallthrough || !$matched) {\n    return ${this.generateExpr(expr.defaultCase)};\n  }\n`;
        }
        out += `})()`;
        return out;
      }

      case 'e_range': {
        const start = this.generateExpr(expr.start);
        const end = this.generateExpr(expr.end);
        const inc = expr.inclusive ? 'true' : 'false';
        return `((s, e, inc) => { const res = []; if (s <= e) { const limit = inc ? e : e - 1; for (let i = s; i <= limit; i++) res.push(i); } else { const limit = inc ? e : e + 1; for (let i = s; i >= limit; i--) res.push(i); } return res; })(${start}, ${end}, ${inc})`;
      }

      case 'e_list_comp': {
        const iter = this.generateExpr(expr.iterable);
        let res = `(Array.isArray(${iter}) ? ${iter} : [])`;
        if (expr.condition) {
          res += `.filter(${expr.param} => ${this.generateExpr(expr.condition)})`;
        }
        res += `.map(${expr.param} => ${this.generateExpr(expr.element)})`;
        return res;
      }

      case 'e_for': {
        return `(() => {\n${this.generateForStatement(expr)}\n})()`;
      }

      case 'e_while': {
        return `(() => {\n${this.generateWhileStatement(expr)}\n})()`;
      }

      case 'e_break':
        return '(function(){ throw new __BreakSignal(); })()';
      case 'e_continue':
        return '(function(){ throw new __ContinueSignal(); })()';
      case 'e_return': {
        const valStr = expr.value ? this.generateExpr(expr.value) : 'null';
        return `(function(){ throw new __ReturnSignal(${valStr}); })()`;
      }
      case 'e_do': {
        const desugared = desugarDo(expr);
        return this.generateExpr(desugared);
      }
      case 'e_where': {
        this.pushScope();
        this.indentLevel++;
        const stmts = expr.bindings.map(s => this.generateStatement(s)).join('\n');
        const res = `${this.indent()}return ${this.generateExpr(expr.expr)};`;
        this.indentLevel--;
        this.popScope();
        return `(() => {\n${stmts}\n${res}\n${this.indent()}})()`;
      }
      default:
        return 'null';
    }
  }

  private generateForStatement(expr: EFor): string {
    this.pushScope();
    let initStr = '';
    if (expr.init) {
      if (expr.init.kind === 's_let') {
        const safeName = sanitizeIdent(expr.init.name);
        this.addLocalVar(expr.init.name);
        const initVal = this.generateExpr(expr.init.init);
        initStr = `let ${safeName} = ${initVal}`;
      } else if (expr.init.kind === 's_expr') {
        initStr = this.generateExpr(expr.init.expr);
      } else if (expr.init.kind.startsWith('e_')) {
        initStr = this.generateExpr(expr.init as Expr);
      }
    }
    const condStr = expr.cond ? this.generateExpr(expr.cond) : '';
    const updateStr = expr.update ? this.generateExpr(expr.update) : '';

    let bodyCode = '';
    if (expr.body.kind === 'e_block') {
      this.indentLevel++;
      const stmts = expr.body.statements.map(s => this.generateStatement(s));
      const res = expr.body.result ? `${this.indent()}${this.generateExpr(expr.body.result)};` : '';
      this.indentLevel--;
      bodyCode = `{\n${[...stmts, res].filter(Boolean).join('\n')}\n${this.indent()}}`;
    } else {
      bodyCode = `{\n${this.indent()}  ${this.generateExpr(expr.body)};\n${this.indent()}}`;
    }
    this.popScope();

    return `${this.indent()}try { for (${initStr}; ${condStr}; ${updateStr}) { try ${bodyCode} catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }`;
  }

  private generateWhileStatement(expr: EWhile): string {
    this.pushScope();
    const condStr = this.generateExpr(expr.cond);

    let bodyCode = '';
    if (expr.body.kind === 'e_block') {
      this.indentLevel++;
      const stmts = expr.body.statements.map(s => this.generateStatement(s));
      const res = expr.body.result ? `${this.indent()}${this.generateExpr(expr.body.result)};` : '';
      this.indentLevel--;
      bodyCode = `{\n${[...stmts, res].filter(Boolean).join('\n')}\n${this.indent()}}`;
    } else {
      bodyCode = `{\n${this.indent()}  ${this.generateExpr(expr.body)};\n${this.indent()}}`;
    }
    this.popScope();

    return `${this.indent()}try { while (${condStr}) { try ${bodyCode} catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }`;
  }

  private generateMatchExpr(scrutinee: Expr, arms: MatchArm[]): string {
    const scrutineeStr = this.generateExpr(scrutinee);
    const valVar = this.freshVar('_m');

    this.indentLevel++;
    const armBlocks: string[] = [];

    for (const arm of arms) {
      const matchConditions: string[] = [];
      const bindings: string[] = [];
      const boundVarNames: string[] = [];

      this.compilePatternMatch(arm.pattern, valVar, matchConditions, bindings, boundVarNames);

      this.pushScope(boundVarNames);
      let guardCheck = '';
      if (arm.guard) {
        const guardExpr = this.generateExpr(arm.guard);
        guardCheck = `if (${guardExpr}) `;
      }

      const cond = matchConditions.length > 0 ? matchConditions.join(' && ') : 'true';
      const bodyExpr = this.generateExpr(arm.body);
      this.popScope();

      const bindingLines = bindings.map(b => `${this.indent()}  ${b};`).join('\n');

      armBlocks.push(
        `${this.indent()}if (${cond}) {\n` +
        (bindingLines ? `${bindingLines}\n` : '') +
        (guardCheck
          ? `${this.indent()}  if (${this.generateExpr(arm.guard!)}) {\n` +
            `${this.indent()}    return ${bodyExpr};\n` +
            `${this.indent()}  }\n`
          : `${this.indent()}  return ${bodyExpr};\n`) +
        `${this.indent()}}`
      );
    }

    this.indentLevel--;

    return (
      `(((${valVar}) => {\n` +
      armBlocks.join('\n') + '\n' +
      `${this.indent()}  throw new Error("Unhandled pattern match in TypeLang");\n` +
      `${this.indent()}})(${scrutineeStr}))`
    );
  }

  private compilePatternMatch(
    pat: Pattern,
    currentAccessor: string,
    conditions: string[],
    bindings: string[],
    boundVarNames: string[]
  ): void {
    switch (pat.kind) {
      case 'p_wildcard':
      case 'p_rest':
        // Matches everything, no condition or binding
        break;

      case 'p_var': {
        const safeName = sanitizeIdent(pat.name);
        bindings.push(`const ${safeName} = ${currentAccessor}`);
        boundVarNames.push(pat.name);
        break;
      }

      case 'p_literal': {
        const lit = pat.value === null ? 'null' : (typeof pat.value === 'string' ? JSON.stringify(pat.value) : String(pat.value));
        conditions.push(`(${currentAccessor} === ${lit})`);
        break;
      }

      case 'p_as': {
        const safeName = sanitizeIdent(pat.name);
        bindings.push(`const ${safeName} = ${currentAccessor}`);
        boundVarNames.push(pat.name);
        this.compilePatternMatch(pat.pattern, currentAccessor, conditions, bindings, boundVarNames);
        break;
      }

      case 'p_ctor': {
        conditions.push(`Boolean(${currentAccessor} && typeof ${currentAccessor} === 'object' && ${currentAccessor}.$tag === "${pat.name}")`);
        for (let i = 0; i < pat.args.length; i++) {
          const argAccessor = `(${currentAccessor} && ${currentAccessor}.$args ? ${currentAccessor}.$args[${i}] : (${currentAccessor} ? Object.values(${currentAccessor})[${i + 1}] : undefined))`;
          this.compilePatternMatch(pat.args[i], argAccessor, conditions, bindings, boundVarNames);
        }
        break;
      }

      case 'p_record': {
        conditions.push(`Boolean(${currentAccessor} && typeof ${currentAccessor} === 'object')`);
        for (const f of pat.fields) {
          const fieldAccessor = `${currentAccessor}.${sanitizeIdent(f.name)}`;
          if (f.pattern) {
            this.compilePatternMatch(f.pattern, fieldAccessor, conditions, bindings, boundVarNames);
          } else {
            const rawVarName = f.alias || f.name;
            const safeVarName = sanitizeIdent(rawVarName);
            bindings.push(`const ${safeVarName} = ${fieldAccessor}`);
            boundVarNames.push(rawVarName);
          }
        }
        break;
      }

      case 'p_tuple': {
        conditions.push(`Array.isArray(${currentAccessor})`);
        for (let i = 0; i < pat.elements.length; i++) {
          const elemAccessor = `${currentAccessor}[${i}]`;
          this.compilePatternMatch(pat.elements[i], elemAccessor, conditions, bindings, boundVarNames);
        }
        break;
      }
    }
  }
}
