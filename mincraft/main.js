// TypeLang Generated Client Web App (ES2022 Target)
"use strict";

// Core Language Primitives
const $print = (v) => { console.log(typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)); return null; };
const $println = (v) => { console.log(typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)); return null; };
const $to_string = (v) => typeof v === "object" && v !== null ? JSON.stringify(v) : String(v);
const $concat = (a, b) => String(a) + String(b);
class __BreakSignal {}
class __ContinueSignal {}
class __ReturnSignal { constructor(v) { this.value = v; } }

// Standard Library: Math Module
const $Math = {
  sqrt: Math.sqrt,
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
  random: Math.random,
  cos: Math.cos,
  sin: Math.sin,
  atan2: Math.atan2,
  log: Math.log,
  bitwise_and: (a, b) => Number(a) & Number(b),
  bitwise_or: (a, b) => Number(a) | Number(b),
  bitwise_xor: (a, b) => Number(a) ^ Number(b),
  bitwise_not: (x) => ~Number(x),
  bitwise_shl: (a, b) => Number(a) << Number(b),
  bitwise_shr: (a, b) => Number(a) >> Number(b),
  PI: Math.PI
};
const Math$sqrt = $Math.sqrt, Math$abs = $Math.abs, Math$floor = $Math.floor, Math$ceil = $Math.ceil;
const Math$round = $Math.round, Math$min = $Math.min, Math$max = $Math.max, Math$pow = $Math.pow, Math$random = $Math.random;
const Math$cos = $Math.cos, Math$sin = $Math.sin, Math$atan2 = $Math.atan2, Math$log = $Math.log, Math$PI = $Math.PI;
const Math$bitwise_and = $Math.bitwise_and, Math$bitwise_or = $Math.bitwise_or, Math$bitwise_xor = $Math.bitwise_xor;
const Math$bitwise_not = $Math.bitwise_not, Math$bitwise_shl = $Math.bitwise_shl, Math$bitwise_shr = $Math.bitwise_shr;

// Standard Library: Array Module
const $Array = {
  len: (arr) => Array.isArray(arr) ? arr.length : 0,
  map: (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.map(fn) : [],
  filter: (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.filter(fn) : [],
  reduce: (arr, init, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.reduce(fn, init) : init,
  push: (arr, elem) => Array.isArray(arr) ? [...arr, elem] : [elem],
  slice: (arr, start, end) => Array.isArray(arr) ? arr.slice(start, end) : [],
  concat: (a, b) => Array.isArray(a) && Array.isArray(b) ? a.concat(b) : [],
  join: (arr, sep) => Array.isArray(arr) ? arr.join(sep) : ""
};
const Array$len = $Array.len, Array$map = $Array.map, Array$filter = $Array.filter, Array$reduce = $Array.reduce;
const Array$push = $Array.push, Array$slice = $Array.slice, Array$concat = $Array.concat, Array$join = $Array.join;

// Standard Library: String Module
const $String = {
  len: (s) => String(s).length,
  slice: (s, start, end) => String(s).slice(start, end),
  split: (s, delim) => String(s).split(delim),
  contains: (s, sub) => String(s).includes(sub),
  parseInt: (s) => Number.parseInt(String(s), 10),
  parseFloat: (s) => Number.parseFloat(String(s))
};
const String$len = $String.len, String$slice = $String.slice, String$split = $String.split, String$contains = $String.contains;
const String$parseInt = $String.parseInt, String$parseFloat = $String.parseFloat;

// Standard Library: Option Module
const $Some = (val) => Object.freeze({ $tag: "Some", val, $args: [val] });
const $None = Object.freeze({ $tag: "None", $args: [] });
const $Option = {
  Some: $Some,
  None: $None,
  pure: $Some,
  of: $Some,
  some: $Some,
  none: $None,
  isSome: (opt) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some"),
  isNone: (opt) => Boolean(!opt || typeof opt !== "object" || opt.$tag === "None"),
  getOrElse: (opt, defaultVal) => (opt && typeof opt === "object" && opt.$tag === "Some" ? opt.val : defaultVal),
  map: (opt, fn) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function" ? $Some(fn(opt.val)) : $None),
  flatMap: (opt, fn) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function" ? fn(opt.val) : $None),
  filter: (opt, pred) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof pred === "function" && pred(opt.val) ? opt : $None),
  flatten: (opt) => (opt && typeof opt === "object" && opt.$tag === "Some" ? opt.val : $None),
  zip: (a, b) => (a && typeof a === "object" && a.$tag === "Some" && b && typeof b === "object" && b.$tag === "Some" ? $Some([a.val, b.val]) : $None),
  fromNullable: (v) => (v === null || v === undefined ? $None : $Some(v)),
  fold: (opt, defaultVal, fn) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function" ? fn(opt.val) : defaultVal),
  orElse: (opt, alt) => (opt && typeof opt === "object" && opt.$tag === "Some" ? opt : alt),
  toResult: (opt, err) => (opt && typeof opt === "object" && opt.$tag === "Some" ? $Ok(opt.val) : $Err(err)),
  contains: (opt, elem) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some" && opt.val === elem),
  exists: (opt, pred) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some" && typeof pred === "function" && pred(opt.val)),
  tap: (opt, fn) => { if (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function") fn(opt.val); return opt; }
};
const Option$Some = $Option.Some, Option$None = $Option.None, Option$pure = $Option.pure, Option$of = $Option.of;
const Option$map = $Option.map, Option$flatMap = $Option.flatMap, Option$filter = $Option.filter, Option$getOrElse = $Option.getOrElse;

// Standard Library: Result Module
const $Ok = (val) => Object.freeze({ $tag: "Ok", val, $args: [val] });
const $Err = (err) => Object.freeze({ $tag: "Err", err, $args: [err] });
const $Result = {
  Ok: $Ok,
  Err: $Err,
  pure: $Ok,
  of: $Ok,
  ok: $Ok,
  err: $Err,
  isOk: (res) => Boolean(res && typeof res === "object" && res.$tag === "Ok"),
  isErr: (res) => Boolean(!res || typeof res !== "object" || res.$tag === "Err"),
  getOrElse: (res, defaultVal) => (res && typeof res === "object" && res.$tag === "Ok" ? res.val : defaultVal),
  map: (res, fn) => (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function" ? $Ok(fn(res.val)) : res),
  mapError: (res, fn) => (res && typeof res === "object" && res.$tag === "Err" && typeof fn === "function" ? $Err(fn(res.err)) : res),
  flatMap: (res, fn) => (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function" ? fn(res.val) : res),
  flatten: (res) => (res && typeof res === "object" && res.$tag === "Ok" ? res.val : res),
  toOption: (res) => (res && typeof res === "object" && res.$tag === "Ok" ? $Some(res.val) : $None),
  fromOption: (opt, err) => (opt && typeof opt === "object" && opt.$tag === "Some" ? $Ok(opt.val) : $Err(err)),
  fold: (res, onErr, onOk) => (res && typeof res === "object" && res.$tag === "Ok" && typeof onOk === "function" ? onOk(res.val) : (typeof onErr === "function" ? onErr(res && res.$tag === "Err" ? res.err : res) : res)),
  orElse: (res, alt) => (res && typeof res === "object" && res.$tag === "Ok" ? res : alt),
  zip: (a, b) => (a && typeof a === "object" && a.$tag === "Ok" && b && typeof b === "object" && b.$tag === "Ok" ? $Ok([a.val, b.val]) : (a && a.$tag === "Err" ? a : b)),
  tap: (res, fn) => { if (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function") fn(res.val); return res; },
  fromTry: (fn) => { try { return $Ok(typeof fn === "function" ? fn() : fn); } catch(e) { return $Err(e?.message || String(e)); } }
};
const Result$Ok = $Result.Ok, Result$Err = $Result.Err, Result$pure = $Result.pure, Result$of = $Result.of;
const Result$map = $Result.map, Result$flatMap = $Result.flatMap, Result$mapError = $Result.mapError, Result$getOrElse = $Result.getOrElse;

// Standard Library: Either Module
const $Left = (left) => Object.freeze({ $tag: "Left", left, $args: [left] });
const $Right = (right) => Object.freeze({ $tag: "Right", right, $args: [right] });
const $Either = {
  Left: $Left,
  Right: $Right,
  pure: $Right,
  of: $Right,
  left: $Left,
  right: $Right,
  isLeft: (e) => Boolean(e && typeof e === "object" && e.$tag === "Left"),
  isRight: (e) => Boolean(e && typeof e === "object" && e.$tag === "Right"),
  getOrElse: (e, defaultVal) => (e && typeof e === "object" && e.$tag === "Right" ? e.right : defaultVal),
  map: (e, fn) => (e && typeof e === "object" && e.$tag === "Right" && typeof fn === "function" ? $Right(fn(e.right)) : e),
  mapLeft: (e, fn) => (e && typeof e === "object" && e.$tag === "Left" && typeof fn === "function" ? $Left(fn(e.left)) : e),
  flatMap: (e, fn) => (e && typeof e === "object" && e.$tag === "Right" && typeof fn === "function" ? fn(e.right) : e),
  fold: (e, onLeft, onRight) => (e && typeof e === "object" && e.$tag === "Right" && typeof onRight === "function" ? onRight(e.right) : (typeof onLeft === "function" ? onLeft(e && e.$tag === "Left" ? e.left : e) : e)),
  swap: (e) => (e && typeof e === "object" && e.$tag === "Right" ? $Left(e.right) : (e && e.$tag === "Left" ? $Right(e.left) : e)),
  toOption: (e) => (e && typeof e === "object" && e.$tag === "Right" ? $Some(e.right) : $None),
  toResult: (e) => (e && typeof e === "object" && e.$tag === "Right" ? $Ok(e.right) : $Err(e?.left)),
  fromResult: (res) => (res && typeof res === "object" && res.$tag === "Ok" ? $Right(res.val) : $Left(res?.err))
};
const Either$Left = $Either.Left, Either$Right = $Either.Right, Either$pure = $Either.pure, Either$of = $Either.of;
const Either$map = $Either.map, Either$mapLeft = $Either.mapLeft, Either$flatMap = $Either.flatMap, Either$fold = $Either.fold;

// Standard Library: Reader Module
const $wrapReader = (fn) => ({ $tag: "Reader", run: typeof fn === "function" ? fn : (_r) => fn });
const $Reader = {
  pure: (v) => $wrapReader((_r) => v),
  of: (v) => $wrapReader((_r) => v),
  ask: () => $wrapReader((r) => r),
  asks: (fn) => $wrapReader((r) => typeof fn === "function" ? fn(r) : r),
  run: (reader, env) => (reader && typeof reader.run === "function" ? reader.run(env) : reader),
  map: (reader, fn) => $wrapReader((r) => { const v = reader && typeof reader.run === "function" ? reader.run(r) : reader; return typeof fn === "function" ? fn(v) : v; }),
  flatMap: (reader, fn) => $wrapReader((r) => { const v = reader && typeof reader.run === "function" ? reader.run(r) : reader; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run(r) : next; }),
  local: (reader, transformEnv) => $wrapReader((r) => { const tr = typeof transformEnv === "function" ? transformEnv(r) : r; return reader && typeof reader.run === "function" ? reader.run(tr) : reader; })
};
const Reader$pure = $Reader.pure, Reader$of = $Reader.of, Reader$ask = $Reader.ask, Reader$asks = $Reader.asks, Reader$run = $Reader.run;
const Reader$map = $Reader.map, Reader$flatMap = $Reader.flatMap, Reader$local = $Reader.local;

// Standard Library: Writer Module
const $wrapWriter = (val, log = []) => ({ $tag: "Writer", val, log: Array.isArray(log) ? log : [log], run: () => [val, Array.isArray(log) ? log : [log]] });
const $Writer = {
  pure: (v) => $wrapWriter(v, []),
  of: (v) => $wrapWriter(v, []),
  tell: (entry) => $wrapWriter(null, [entry]),
  run: (w) => (w && typeof w.run === "function" ? w.run() : [w?.val, w?.log || []]),
  value: (w) => (w ? w.val : null),
  log: (w) => (w && Array.isArray(w.log) ? w.log : []),
  map: (w, fn) => $wrapWriter(typeof fn === "function" ? fn(w?.val) : w?.val, w?.log || []),
  flatMap: (w, fn) => { const next = typeof fn === "function" ? fn(w?.val) : null; return $wrapWriter(next?.val, [...(w?.log || []), ...(next?.log || [])]); },
  listen: (w) => $wrapWriter([w?.val, w?.log || []], w?.log || [])
};
const Writer$pure = $Writer.pure, Writer$of = $Writer.of, Writer$tell = $Writer.tell, Writer$run = $Writer.run;
const Writer$value = $Writer.value, Writer$log = $Writer.log, Writer$map = $Writer.map, Writer$flatMap = $Writer.flatMap;

// Standard Library: Task Module
const $wrapTask = (fn) => ({ $tag: "Task", run: typeof fn === "function" ? fn : () => fn });
const $Task = {
  pure: (v) => $wrapTask(() => v),
  of: (v) => $wrapTask(() => v),
  succeed: (v) => $wrapTask(() => v),
  delay: (fn) => $wrapTask(typeof fn === "function" ? fn : () => fn),
  run: (t) => (t && typeof t.run === "function" ? t.run() : t),
  map: (t, fn) => $wrapTask(() => { const v = t && typeof t.run === "function" ? t.run() : t; return typeof fn === "function" ? fn(v) : v; }),
  flatMap: (t, fn) => $wrapTask(() => { const v = t && typeof t.run === "function" ? t.run() : t; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run() : next; })
};
const Task$pure = $Task.pure, Task$of = $Task.of, Task$succeed = $Task.succeed, Task$run = $Task.run, Task$map = $Task.map, Task$flatMap = $Task.flatMap;

// Standard Library: IO Module
const $wrapIO = (comp) => ({ $tag: "IO", run: typeof comp === "function" ? comp : () => comp });
const $IO = {
  pure: (v) => $wrapIO(() => v),
  of: (v) => $wrapIO(() => v),
  delay: (fn) => $wrapIO(typeof fn === "function" ? fn : () => fn),
  map: (io, fn) => $wrapIO(() => { const v = io && typeof io.run === "function" ? io.run() : io; return typeof fn === "function" ? fn(v) : v; }),
  flatMap: (io, fn) => $wrapIO(() => { const v = io && typeof io.run === "function" ? io.run() : io; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run() : next; }),
  run: (io) => (io && typeof io.run === "function" ? io.run() : io),
  println: (msg) => $wrapIO(() => console.log(String(msg)))
};
const IO$pure = $IO.pure, IO$of = $IO.of, IO$delay = $IO.delay, IO$map = $IO.map, IO$flatMap = $IO.flatMap, IO$run = $IO.run;

// Standard Library: State Module
const $wrapState = (fn) => ({ $tag: "State", run: typeof fn === "function" ? fn : (s) => [null, s] });
const $State = {
  pure: (v) => $wrapState((s) => [v, s]),
  of: (v) => $wrapState((s) => [v, s]),
  get: () => $wrapState((s) => [s, s]),
  set: (ns) => $wrapState((_s) => [null, ns]),
  modify: (fn) => $wrapState((s) => [null, typeof fn === "function" ? fn(s) : s]),
  run: (st, s) => (st && typeof st.run === "function" ? st.run(s) : [null, s]),
  evalState: (st, s) => { const r = st && typeof st.run === "function" ? st.run(s) : [null, s]; return Array.isArray(r) ? r[0] : r; },
  execState: (st, s) => { const r = st && typeof st.run === "function" ? st.run(s) : [null, s]; return Array.isArray(r) ? r[1] : r; },
  map: (st, fn) => $wrapState((s) => { const [v, ns] = st && typeof st.run === "function" ? st.run(s) : [null, s]; return [typeof fn === "function" ? fn(v) : v, ns]; }),
  flatMap: (st, fn) => $wrapState((s) => { const [v, ns] = st && typeof st.run === "function" ? st.run(s) : [null, s]; const next = typeof fn === "function" ? fn(v) : null; return next && typeof next.run === "function" ? next.run(ns) : [null, ns]; })
};
const State$pure = $State.pure, State$get = $State.get, State$set = $State.set, State$modify = $State.modify, State$run = $State.run;
const State$evalState = $State.evalState, State$execState = $State.execState, State$map = $State.map, State$flatMap = $State.flatMap;

// Standard Library: Setoid Module
const $deepEquals = (a, b) => {
  if (a === b) return true;
  if (a && typeof a === "object" && b && typeof b === "object") {
    if (a.$tag && b.$tag && a.$tag !== b.$tag) return false;
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) { if (!$deepEquals(a[k], b[k])) return false; }
    return true;
  }
  return false;
};
const $Setoid = {
  equals: (a, b) => $deepEquals(a, b),
  notEquals: (a, b) => !$deepEquals(a, b),
  fromEquals: (eqFn) => ({ equals: eqFn }),
  contramap: (setoid, fn) => ({ equals: (x, y) => (setoid && typeof setoid.equals === "function" ? setoid.equals(fn(x), fn(y)) : $deepEquals(fn(x), fn(y))) })
};

// Standard Library: Ord Module
const $OrderingLess = Object.freeze({ $tag: "Less", $args: [] });
const $OrderingEqual = Object.freeze({ $tag: "Equal", $args: [] });
const $OrderingGreater = Object.freeze({ $tag: "Greater", $args: [] });
const $compareVals = (a, b) => {
  if (a === b) return $OrderingEqual;
  if (typeof a === "number" && typeof b === "number") return a < b ? $OrderingLess : $OrderingGreater;
  if (typeof a === "string" && typeof b === "string") return a < b ? $OrderingLess : (a > b ? $OrderingGreater : $OrderingEqual);
  return String(a) < String(b) ? $OrderingLess : (String(a) > String(b) ? $OrderingGreater : $OrderingEqual);
};
const $Ord = {
  Less: $OrderingLess,
  Equal: $OrderingEqual,
  Greater: $OrderingGreater,
  compare: $compareVals,
  min: (a, b) => ($compareVals(a, b) === $OrderingLess ? a : b),
  max: (a, b) => ($compareVals(a, b) === $OrderingGreater ? a : b),
  clamp: (val, minVal, maxVal) => ($compareVals(val, minVal) === $OrderingLess ? minVal : ($compareVals(val, maxVal) === $OrderingGreater ? maxVal : val)),
  between: (val, minVal, maxVal) => ($compareVals(val, minVal) !== $OrderingLess && $compareVals(val, maxVal) !== $OrderingGreater),
  isLess: (a, b) => $compareVals(a, b) === $OrderingLess,
  isGreater: (a, b) => $compareVals(a, b) === $OrderingGreater,
  isEqual: (a, b) => $compareVals(a, b) === $OrderingEqual,
  fromCompare: (cmpFn) => ({ compare: cmpFn }),
  contramap: (ordB, fn) => ({ compare: (x, y) => (ordB && typeof ordB.compare === "function" ? ordB.compare(fn(x), fn(y)) : $compareVals(fn(x), fn(y))) }),
  reverse: (ord) => ({ compare: (x, y) => (ord && typeof ord.compare === "function" ? ord.compare(y, x) : $compareVals(y, x)) })
};

// Standard Library: Semigroup & SemiGroup Modules
const $combineSemigroup = (a, b) => {
  if (typeof a === "number" && typeof b === "number") return a + b;
  if (typeof a === "string" && typeof b === "string") return a + b;
  if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b];
  if (a && typeof a === "object" && a.$tag === "Some" && b && typeof b === "object" && b.$tag === "Some") return $Some($combineSemigroup(a.val, b.val));
  if (a && typeof a === "object" && a.$tag === "Some") return a;
  if (b && typeof b === "object" && b.$tag === "Some") return b;
  if (a && typeof a === "object" && typeof a.combine === "function") return a.combine(b);
  return b;
};
const $Semigroup = {
  combine: $combineSemigroup,
  concatAll: (list, fallback) => (!Array.isArray(list) || list.length === 0 ? fallback : list.reduce($combineSemigroup)),
  first: () => ({ combine: (a, _b) => a }),
  last: () => ({ combine: (_a, b) => b }),
  struct: (semigroups) => ({ combine: (a, b) => { const res = {}; for (const k in semigroups) res[k] = semigroups[k].combine(a[k], b[k]); return res; } }),
  dual: (s) => ({ combine: (a, b) => (s && typeof s.combine === "function" ? s.combine(b, a) : $combineSemigroup(b, a)) })
};
const $SemiGroup = $Semigroup;

// Standard Library: Monoid Module
const $monoidEmptyMap = { Sum: 0, Product: 1, String: "", Array: [], All: true, Any: false };
const $Monoid = {
  empty: (typeOrName) => (typeOrName in $monoidEmptyMap ? $monoidEmptyMap[typeOrName] : null),
  combine: $combineSemigroup,
  concatAll: (list, identity) => (!Array.isArray(list) || list.length === 0 ? identity : list.reduce($combineSemigroup, identity)),
  Sum: { empty: () => 0, combine: (a, b) => a + b },
  Product: { empty: () => 1, combine: (a, b) => a * b },
  String: { empty: () => "", combine: (a, b) => a + b },
  Array: { empty: () => [], combine: (a, b) => [...a, ...b] },
  All: { empty: () => true, combine: (a, b) => a && b },
  Any: { empty: () => false, combine: (a, b) => a || b },
  struct: (monoids) => ({ empty: () => { const res = {}; for (const k in monoids) res[k] = monoids[k].empty(); return res; }, combine: (a, b) => { const res = {}; for (const k in monoids) res[k] = monoids[k].combine(a[k], b[k]); return res; } })
};

// Standard Library: Group Module
const $Group = {
  invert: (a) => (typeof a === "number" ? -a : (a && typeof a.invert === "function" ? a.invert() : a)),
  subtract: (a, b) => (typeof a === "number" && typeof b === "number" ? a - b : $combineSemigroup(a, $Group.invert(b))),
  SumNumber: { empty: () => 0, combine: (a, b) => a + b, invert: (a) => -a },
  ProductNonZero: { empty: () => 1, combine: (a, b) => a * b, invert: (a) => 1 / a }
};

// Standard Library: Functor Module
const $mapFunctor = (fa, fn) => {
  if (fa && typeof fa === "object") {
    if (fa.$tag === "Some") return $Some(fn(fa.val));
    if (fa.$tag === "None") return $None;
    if (fa.$tag === "Ok") return $Ok(fn(fa.val));
    if (fa.$tag === "Err") return fa;
    if (fa.$tag === "Right") return $Right(fn(fa.right));
    if (fa.$tag === "Left") return fa;
    if (fa.$tag === "Valid") return $Valid(fn(fa.val));
    if (fa.$tag === "Invalid") return fa;
    if (typeof fa.map === "function") return fa.map(fn);
  }
  if (Array.isArray(fa)) return fa.map(fn);
  return fa;
};
const $Functor = {
  map: $mapFunctor,
  lift: (fn) => (fa) => $mapFunctor(fa, fn),
  as: (fa, val) => $mapFunctor(fa, () => val),
  voidRight: (fa) => $mapFunctor(fa, () => null),
  flap: (fab, a) => $mapFunctor(fab, (f) => (typeof f === "function" ? f(a) : f))
};

// Standard Library: Contravariant Functor Module
const $Contravariant = {
  contramap: (fa, fn) => (typeof fa === "function" ? (x) => fa(fn(x)) : (x) => fa(fn(x))),
  cmap: (fa, fn) => (typeof fa === "function" ? (x) => fa(fn(x)) : (x) => fa(fn(x))),
  predicate: (pred) => ({ run: pred, cmap: (fn) => (x) => pred(fn(x)) })
};

// Standard Library: Applicative Functor Module
const $apApplicative = (ff, fa) => {
  if (ff && typeof ff === "object" && fa && typeof fa === "object") {
    if (ff.$tag === "Some" && fa.$tag === "Some") return $Some(ff.val(fa.val));
    if (ff.$tag === "None" || fa.$tag === "None") return $None;
    if (ff.$tag === "Ok" && fa.$tag === "Ok") return $Ok(ff.val(fa.val));
    if (ff.$tag === "Err") return ff;
    if (fa.$tag === "Err") return fa;
    if (ff.$tag === "Right" && fa.$tag === "Right") return $Right(ff.right(fa.right));
    if (ff.$tag === "Left") return ff;
    if (fa.$tag === "Left") return fa;
    if (ff.$tag === "Valid" && fa.$tag === "Valid") return $Valid(ff.val(fa.val));
    if (ff.$tag === "Invalid" && fa.$tag === "Invalid") return $Invalid([...ff.errs, ...fa.errs]);
    if (ff.$tag === "Invalid") return ff;
    if (fa.$tag === "Invalid") return fa;
  }
  if (Array.isArray(ff) && Array.isArray(fa)) {
    const res = [];
    for (const f of ff) { for (const a of fa) { if (typeof f === "function") res.push(f(a)); } }
    return res;
  }
  return fa;
};
const $Applicative = {
  pure: $Some,
  ap: $apApplicative,
  lift2: (fn, fa, fb) => $apApplicative($mapFunctor(fa, (a) => (b) => fn(a, b)), fb),
  lift3: (fn, fa, fb, fc) => $apApplicative($apApplicative($mapFunctor(fa, (a) => (b) => (c) => fn(a, b, c)), fb), fc),
  zip: (fa, fb) => $apApplicative($mapFunctor(fa, (a) => (b) => [a, b]), fb)
};

// Standard Library: Validation Module
const $Valid = (val) => Object.freeze({ $tag: "Valid", val, $args: [val] });
const $Invalid = (errs) => Object.freeze({ $tag: "Invalid", errs: Array.isArray(errs) ? errs : [errs], $args: [Array.isArray(errs) ? errs : [errs]] });
const $Validation = {
  Valid: $Valid,
  Invalid: $Invalid,
  pure: $Valid,
  invalid: (err) => $Invalid([err]),
  isValid: (v) => Boolean(v && typeof v === "object" && v.$tag === "Valid"),
  isInvalid: (v) => Boolean(v && typeof v === "object" && v.$tag === "Invalid"),
  map: (v, fn) => (v && typeof v === "object" && v.$tag === "Valid" && typeof fn === "function" ? $Valid(fn(v.val)) : v),
  ap: $apApplicative,
  accumulate: (v1, v2, fn) => {
    if (v1 && v1.$tag === "Valid" && v2 && v2.$tag === "Valid" && typeof fn === "function") return $Valid(fn(v1.val, v2.val));
    const errs1 = v1 && v1.$tag === "Invalid" ? v1.errs : [];
    const errs2 = v2 && v2.$tag === "Invalid" ? v2.errs : [];
    return $Invalid([...errs1, ...errs2]);
  },
  getOrElse: (v, defaultVal) => (v && v.$tag === "Valid" ? v.val : defaultVal),
  toResult: (v) => (v && v.$tag === "Valid" ? $Ok(v.val) : $Err(v?.errs))
};

// Standard Library: Bifunctor Module
const $Bifunctor = {
  bimap: (fab, f, g) => {
    if (fab && typeof fab === "object") {
      if (fab.$tag === "Ok") return $Ok(g(fab.val));
      if (fab.$tag === "Err") return $Err(f(fab.err));
      if (fab.$tag === "Right") return $Right(g(fab.right));
      if (fab.$tag === "Left") return $Left(f(fab.left));
      if (typeof fab.bimap === "function") return fab.bimap(f, g);
    }
    return fab;
  }
};

// Standard Library: Profunctor Module
const $dimapFn = (pab, f, g) => (typeof pab === "function" ? (x) => g(pab(f(x))) : (pab && typeof pab.dimap === "function" ? pab.dimap(f, g) : (x) => g(pab(f(x)))));
const $Profunctor = { dimap: $dimapFn, promap: $dimapFn };

// Standard Library: Foldable Module
const $Foldable = {
  foldLeft: (fa, initial, fn) => {
    if (Array.isArray(fa)) return fa.reduce(fn, initial);
    if (fa && typeof fa === "object") {
      if (fa.$tag === "Some" || fa.$tag === "Ok") return fn(initial, fa.val);
      if (fa.$tag === "None" || fa.$tag === "Err") return initial;
      if (typeof fa.reduce === "function") return fa.reduce(fn, initial);
    }
    return initial;
  },
  foldMap: (fa, monoid, fn) => {
    const combine = typeof monoid === "object" && typeof monoid.combine === "function" ? monoid.combine : $combineSemigroup;
    const empty = typeof monoid === "object" && typeof monoid.empty === "function" ? monoid.empty() : (typeof monoid === "string" ? $monoidEmptyMap[monoid] : null);
    if (Array.isArray(fa)) return fa.reduce((acc, x) => combine(acc, fn(x)), empty);
    if (fa && typeof fa === "object" && (fa.$tag === "Some" || fa.$tag === "Ok")) return combine(empty, fn(fa.val));
    return empty;
  }
};

// Standard Library: DOM Module (Browser Target)
const $dom_render_vnode = (vnode) => {
  if (vnode === null || vnode === undefined) return document.createTextNode("");
  if (typeof vnode === "string" || typeof vnode === "number" || typeof vnode === "boolean") return document.createTextNode(String(vnode));
  if (Array.isArray(vnode)) {
    const frag = document.createDocumentFragment();
    for (const child of vnode) frag.appendChild($dom_render_vnode(child));
    return frag;
  }
  if (typeof Node !== "undefined" && vnode instanceof Node) return vnode;
  if (!vnode.$vnode) return document.createTextNode(typeof vnode === "object" ? JSON.stringify(vnode) : String(vnode));
  const isSvg = ["svg", "path", "circle", "rect", "line", "polyline", "polygon", "text", "g"].includes(vnode.tag);
  const el = isSvg
    ? document.createElementNS("http://www.w3.org/2000/svg", vnode.tag)
    : document.createElement(vnode.tag);
  if (vnode.children) {
    const childrenArr = Array.isArray(vnode.children) ? vnode.children : [vnode.children];
    for (const child of childrenArr) {
      if (child !== null && child !== undefined) {
        el.appendChild($dom_render_vnode(child));
      }
    }
  }
  if (vnode.props) {
    const props = (typeof vnode.props === "object" && vnode.props !== null) ? vnode.props : {};
    for (const [k, val] of Object.entries(props)) {
      if (k.startsWith("on") && typeof val === "function") {
        el.addEventListener(k.slice(2).toLowerCase(), val);
      } else if (k === "className" || k === "class") {
        if (isSvg) el.setAttribute("class", val);
        else el.className = val;
      } else if (k === "style") {
        if (typeof val === "object" && val !== null && el.style) {
          Object.assign(el.style, val);
        } else if (typeof val === "string" && el.style) {
          el.style.cssText = val;
        }
      } else if (k === "value" && el && ("value" in el)) {
        el.value = String(val);
      } else if (k === "selected" && el && ("selected" in el)) {
        el.selected = Boolean(val);
      } else if (k === "checked" && el && ("checked" in el)) {
        el.checked = Boolean(val);
      } else if (el && typeof el.setAttribute === "function") {
        el.setAttribute(k, String(val));
      }
    }
  }
  return el;
};
const $get_actx = () => {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!window._tl_actx) window._tl_actx = new AC();
  if (window._tl_actx.state === "suspended") {
    try { window._tl_actx.resume(); } catch (_) {}
  }
  return window._tl_actx;
};
const $DOM = {
  getElementById: (id) => {
    if (typeof $mountTarget !== "undefined" && $mountTarget) {
      if ($mountTarget.id === id) return $mountTarget;
      const inner = $mountTarget.querySelector("#" + id);
      if (inner) return inner;
    }
    return typeof document !== "undefined" ? document.getElementById(id) : null;
  },
  createElement: (tag) => typeof document !== "undefined" ? document.createElement(tag) : { tag, attrs: {}, children: [] },
  setText: (el, text) => { if (el && "textContent" in el) el.textContent = String(text); return null; },
  getValue: (el) => (el && "value" in el ? String(el.value) : ""),
  setValue: (el, val) => { if (el && "value" in el) el.value = String(val); return null; },
  focus: (el) => { if (el && typeof el.focus === "function") el.focus(); return null; },
  blur: (el) => { if (el && typeof el.blur === "function") el.blur(); return null; },
  setHtml: (el, html) => { if (el && "innerHTML" in el) el.innerHTML = String(html); return null; },
  setAttr: (el, k, v) => { if (el && "setAttribute" in el) el.setAttribute(k, String(v)); return null; },
  appendChild: (parent, child) => { if (parent && "appendChild" in parent && child) parent.appendChild(child); return null; },
  addEventListener: (el, evt, handler) => { if (el && "addEventListener" in el) el.addEventListener(evt, handler); return null; },
  h: (tag, props = {}, children = []) => ({ $vnode: true, tag, props: props || {}, children: Array.isArray(children) ? children : [children] }),
  mount: (containerId, vnode) => {
    let root = null;
    if (typeof $mountTarget !== "undefined" && $mountTarget) {
      if (typeof containerId === "string") {
        if ($mountTarget.id === containerId) root = $mountTarget;
        else root = $mountTarget.querySelector("#" + containerId) || $mountTarget;
      } else {
        root = containerId;
      }
    }
    if (!root && typeof document !== "undefined") {
      root = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
    }
    if (root) {
      root.innerHTML = "";
      root.appendChild($dom_render_vnode(vnode));
    }
    return null;
  },
  eval: (code) => { try { return (typeof window !== "undefined" && window.eval ? window.eval(code) : (0, eval)(code)); } catch (e) { return null; } },
  _eval: (code) => { try { return (typeof window !== "undefined" && window.eval ? window.eval(code) : (0, eval)(code)); } catch (e) { return null; } },
  log: (v) => { console.log(v); return null; },
  initAudio: () => { try { const c = $get_actx(); if (c && c.state === "suspended") c.resume(); return c; } catch (_) { return null; } },
  playCustomTone: (freq, waveType, duration, volume, attack) => {
    try {
      const c = $get_actx();
      if (!c) return null;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = waveType || "square";
      o.frequency.setValueAtTime(Math.max(1, freq || 440), c.currentTime);
      const d = duration || 0.1;
      const v = volume !== undefined ? volume : 0.1;
      const atk = attack || 0.015;
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.linearRampToValueAtTime(v, c.currentTime + atk);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d);
      o.connect(g);
      g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + d);
    } catch (_) {}
    return null;
  },
  playNoise: (duration, volume) => {
    try {
      const c = $get_actx();
      if (!c) return null;
      const dur = duration || 0.12;
      const vol = volume !== undefined ? volume : 0.2;
      const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.03));
      }
      const src = c.createBufferSource();
      src.buffer = buf;
      const gain = c.createGain();
      gain.gain.setValueAtTime(vol, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      src.connect(gain);
      gain.connect(c.destination);
      src.start();
    } catch (_) {}
    return null;
  },
  playTone: (freq, duration, waveType, volume) => {
    try {
      const c = $get_actx();
      if (!c) return null;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = waveType || "sine";
      o.frequency.setValueAtTime(Math.max(1, freq || 440), c.currentTime);
      const d = duration || 0.08;
      const v = volume !== undefined ? volume : 0.1;
      g.gain.setValueAtTime(v, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d);
      o.connect(g);
      g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + d);
    } catch (_) {}
    return null;
  },
  playRamp: (startFreq, endFreq, duration, waveType, volume) => {
    try {
      const c = $get_actx();
      if (!c) return null;
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = waveType || "sine";
      o.frequency.setValueAtTime(Math.max(1, startFreq || 440), c.currentTime);
      const d = duration || 0.08;
      const v = volume !== undefined ? volume : 0.1;
      o.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq || 220), c.currentTime + d);
      g.gain.setValueAtTime(v, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d);
      o.connect(g);
      g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + d);
    } catch (_) {}
    return null;
  },
  playSequence: (notes, noteDuration, waveType, volume) => {
    try {
      const c = $get_actx();
      if (!c || !notes || !notes.length) return null;
      const d = noteDuration || 0.08;
      const v = volume !== undefined ? volume : 0.12;
      notes.forEach((f, i) => {
        if (f <= 0) return;
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = waveType || "sine";
        o.frequency.setValueAtTime(f, c.currentTime + i * d);
        g.gain.setValueAtTime(v, c.currentTime + i * d);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + i * d + d * 1.5);
        o.connect(g);
        g.connect(c.destination);
        o.start(c.currentTime + i * d);
        o.stop(c.currentTime + i * d + d * 1.5);
      });
    } catch (_) {}
    return null;
  },
  startMusic: (id, notes, intervalMs, waveType, volume) => {
    try {
      if (typeof window === "undefined") return null;
      if (!window._tl_music_loops) window._tl_music_loops = {};
      if (window._tl_music_loops[id]) clearInterval(window._tl_music_loops[id]);
      let step = 0;
      const c = $get_actx();
      const iv = intervalMs || 150;
      const v = volume !== undefined ? volume : 0.04;
      const w = waveType || "square";
      window._tl_music_loops[id] = setInterval(() => {
        if (!c || !notes || !notes.length) return;
        const f = notes[step % notes.length];
        step++;
        if (f > 0) {
          const o = c.createOscillator();
          const g = c.createGain();
          o.type = w;
          o.frequency.setValueAtTime(f, c.currentTime);
          g.gain.setValueAtTime(v, c.currentTime);
          g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (iv / 1000) * 0.9);
          o.connect(g);
          g.connect(c.destination);
          o.start();
          o.stop(c.currentTime + (iv / 1000) * 0.9);
        }
      }, iv);
    } catch (_) {}
    return null;
  },
  stopMusic: (id) => {
    try {
      if (typeof window !== "undefined" && window._tl_music_loops && window._tl_music_loops[id]) {
        clearInterval(window._tl_music_loops[id]);
        delete window._tl_music_loops[id];
      }
    } catch (_) {}
    return null;
  },
  resumeAudio: () => {
    try {
      const c = $get_actx();
      if (c && c.state === "suspended") c.resume();
    } catch (_) {}
    return null;
  },
  confetti: (count, spread, originY) => {
    try {
      if (typeof window !== "undefined" && window.confetti) {
        window.confetti({
          particleCount: count || 80,
          spread: spread || 70,
          origin: { y: originY !== undefined ? originY : 0.6 }
        });
      }
    } catch (_) {}
    return null;
  },
  setInterval: (fn, ms) => (typeof setInterval !== "undefined" ? setInterval(fn, ms) : 0),
  clearInterval: (id) => { if (typeof clearInterval !== "undefined") clearInterval(id); return null; },
  setTimeout: (fn, ms) => (typeof setTimeout !== "undefined" ? setTimeout(fn, ms) : 0),
  clearTimeout: (id) => { if (typeof clearTimeout !== "undefined") clearTimeout(id); return null; },
  requestAnimationFrame: (fn) => { if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(fn); return null; },
  storageGet: (k) => { try { return (typeof localStorage !== "undefined" && localStorage.getItem(k)) || ""; } catch (_) { return ""; } },
  storageSet: (k, v) => { try { if (typeof localStorage !== "undefined") localStorage.setItem(k, v); } catch (_) {} return null; },
  storageRemove: (k) => { try { if (typeof localStorage !== "undefined") localStorage.removeItem(k); } catch (_) {} return null; }
};
const DOM = $DOM;
const DOM$getElementById = $DOM.getElementById, DOM$createElement = $DOM.createElement, DOM$setText = $DOM.setText;
const DOM$setHtml = $DOM.setHtml, DOM$setAttr = $DOM.setAttr, DOM$appendChild = $DOM.appendChild, DOM$addEventListener = $DOM.addEventListener;
const DOM$h = $DOM.h, DOM$mount = $DOM.mount, DOM$eval = $DOM.eval, DOM$_eval = $DOM._eval, DOM$log = $DOM.log;
const DOM$playTone = $DOM.playTone, DOM$playRamp = $DOM.playRamp, DOM$playSequence = $DOM.playSequence;
const DOM$startMusic = $DOM.startMusic, DOM$stopMusic = $DOM.stopMusic, DOM$resumeAudio = $DOM.resumeAudio, DOM$confetti = $DOM.confetti;
const DOM$setInterval = $DOM.setInterval, DOM$clearInterval = $DOM.clearInterval, DOM$setTimeout = $DOM.setTimeout, DOM$clearTimeout = $DOM.clearTimeout, DOM$requestAnimationFrame = $DOM.requestAnimationFrame;
const DOM$storageGet = $DOM.storageGet, DOM$storageSet = $DOM.storageSet, DOM$storageRemove = $DOM.storageRemove;

// Standard Library: Node.js / Universal Data Processing Module
const $node_req = (m) => { try { return typeof require !== "undefined" ? require(m) : null; } catch (_) { return null; } };
const fs = $node_req("fs");
const path = $node_req("path");
const http = $node_req("http");

const $Node = {
  envGet: (k) => (typeof process !== "undefined" && process.env ? process.env[k] || "" : ""),
  readFile: (p) => fs ? fs.readFileSync(p, "utf-8") : `// Mock file content for ${p}`,
  writeFile: (p, content) => { if (fs) fs.writeFileSync(p, content, "utf-8"); return null; },
  stringify: (data) => JSON.stringify(data),
  parse: (str) => JSON.parse(str),
  now: () => Date.now(),
  createApp: () => {
    const express = $node_req("express");
    if (express) {
      try { return express(); } catch (_) {}
    }
    const routes = [];
    const middlewares = [];
    const app = {
      use: (fn) => { middlewares.push(fn); return app; },
      get: (p, fn) => { routes.push({ method: "GET", path: p, fn }); return app; },
      post: (p, fn) => { routes.push({ method: "POST", path: p, fn }); return app; },
      listen: (port, cb) => {
        if (http) {
          const server = http.createServer((req, res) => {
            res.json = (data) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(data)); };
            res.status = (code) => { res.statusCode = code; return res; };
            res.send = (body) => { res.end(String(body)); };
            const matched = routes.find(r => r.method === req.method && r.path === req.url);
            if (matched) return matched.fn(req, res);
            res.statusCode = 404; res.end("Not Found");
          });
          server.listen(port, () => { if (cb) cb(); });
          return server;
        }
        console.log(`[Mock Server] Listening on port ${port}`);
        if (cb) cb();
        return { close: () => {} };
      }
    };
    return app;
  },
  get: (app, p, handler) => { if (app && app.get) app.get(p, handler); return null; },
  post: (app, p, handler) => { if (app && app.post) app.post(p, handler); return null; },
  use: (app, middleware) => { if (app && app.use) app.use(middleware); return null; },
  listen: (app, port, cb) => { console.log(`[Express Engine] Server listening on port ${port}`); if (cb) cb(); return { close: () => {} }; },
  send: (res, body) => { if (res && res.send) res.send(body); else if (res && res.end) res.end(body); return null; },
  json: (res, data) => { if (res && res.json) res.json(data); else if (res && res.end) res.end(JSON.stringify(data)); return null; },
  status: (res, code) => { if (res && res.status) return res.status(code); if (res) res.statusCode = code; return res; }
};
const Node$envGet = $Node.envGet, Node$readFile = $Node.readFile, Node$writeFile = $Node.writeFile;
const Node$stringify = $Node.stringify, Node$parse = $Node.parse, Node$now = $Node.now, Node$createApp = $Node.createApp;
const Node$get = $Node.get, Node$post = $Node.post, Node$use = $Node.use, Node$listen = $Node.listen;
const Node$send = $Node.send, Node$json = $Node.json, Node$status = $Node.status;

const { getElementById } = $DOM;
const Title = Object.freeze({ $tag: "Title", $args: [] });
const Playing = Object.freeze({ $tag: "Playing", $args: [] });
const Inventory = Object.freeze({ $tag: "Inventory", $args: [] });
const Paused = Object.freeze({ $tag: "Paused", $args: [] });
const Dead = Object.freeze({ $tag: "Dead", $args: [] });
// type alias Mob
const SCREEN_W = 480;
const SCREEN_H = 300;
const WORLD_W = 48;
const WORLD_D = 48;
const WORLD_H = 14;
const RENDER_COLUMNS = 180;
const FOV = 1.12;
const MAX_REACH = 5.2;
const BLOCK_NAMES = ["Air", "Grass", "Dirt", "Stone", "Sand", "Oak Log", "Leaves", "Water", "Coal Ore", "Planks", "Workbench", "Torch", "Wood Pick", "Wood Sword", "Stick", "Wool", "Apple"];
const BLOCK_COLORS = ["#000000", "#70a83b", "#85613c", "#777a7e", "#d8c27a", "#79512e", "#4e883b", "#397cbd", "#35373a", "#b88752", "#9a6738", "#f3b84b", "#b78b52", "#bd7c4a", "#ab764f", "#ded7c8", "#dc4c36"];
const HOTBAR = [1, 2, 3, 4, 5, 6, 9, 10];
const WORLD_SIZE = ((WORLD_W * WORLD_D) * WORLD_H);
const canvas = getElementById("world");
const ctx = canvas.getContext("2d");
(canvas.width = SCREEN_W);
(canvas.height = SCREEN_H);
let world = [];
let heights = [];
let inventory = [];
let mobs = [];
let phase = Title;
let seed = 918273;
let playerX = 24.5;
let playerZ = 24.5;
let playerYaw = 0.3;
let playerPitch = 0;
let playerGround = 4;
let playerEyeHeight = 1.62;
let playerHealth = 10;
let playerHunger = 10;
let selected = 0;
let dayClock = 0.18;
let scoreMined = 0;
let jumpOffset = 0;
let jumpVelocity = 0;
let lastFrame = 0;
let lastMove = 0;
let message = "Click to enter the world";
let messageTime = 0;
let showDebug = false;
let keys = [];
let targetX = -(1);
let targetZ = -(1);
let targetBlock = 0;
let hitDistance = 0;
let mouseDown = false;
let lookDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let craftScroll = 0;
function worldIndex(x, z, y) {
  try {
  return ((((x * WORLD_D) + z) * WORLD_H) + y);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function columnIndex(x, z) {
  try {
  return ((x * WORLD_D) + z);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function random01() {
  try {
  (seed = ((seed * 16807) % 2147483647));
  return (seed / 2147483647);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function inBounds(x, z, y) {
  try {
  return ((((((x >= 0) && (x < WORLD_W)) && (z >= 0)) && (z < WORLD_D)) && (y >= 0)) && (y < WORLD_H));
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function getBlock(x, z, y) {
  try {
  (!(inBounds(x, z, y)) ? (() => {
    return (function(){ throw new __ReturnSignal(0); })();
  })() : null);
  return world[worldIndex(x, z, y)];
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function setBlock(x, z, y, block) {
  try {
  (!(inBounds(x, z, y)) ? (() => {
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  (world[worldIndex(x, z, y)] = block);
  (((block !== 0) && (y > heights[columnIndex(x, z)])) ? (() => {
    return (heights[columnIndex(x, z)] = y);
  })() : null);
  return (((block === 0) && (y === heights[columnIndex(x, z)])) ? (() => {
    let top = (y - 1);
    try { while (((top >= 0) && (getBlock(x, z, top) === 0))) { try {
      (top = (top - 1));
    } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
    return (heights[columnIndex(x, z)] = top);
  })() : null);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function terrainHeight(x, z) {
  try {
  const wave = ((($Math.sin((x * 0.34)) * 1.25) + ($Math.cos((z * 0.27)) * 1.1)) + ($Math.sin(((x + z) * 0.17)) * 0.9));
  const hill = ($Math.sin(((x * 0.11) + (z * 0.09))) * 1.5);
  return $Math.floor(((4 + wave) + hill));
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function showMessage(text) {
  try {
  (message = text);
  return (messageTime = 2.6);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function phaseLabel() {
  try {
  return (((_m$1) => {
    if (Boolean(_m$1 && typeof _m$1 === 'object' && _m$1.$tag === "Title")) {
      return "title";
    }
    if (Boolean(_m$1 && typeof _m$1 === 'object' && _m$1.$tag === "Playing")) {
      return "exploring";
    }
    if (Boolean(_m$1 && typeof _m$1 === 'object' && _m$1.$tag === "Inventory")) {
      return "inventory";
    }
    if (Boolean(_m$1 && typeof _m$1 === 'object' && _m$1.$tag === "Paused")) {
      return "paused";
    }
    if (Boolean(_m$1 && typeof _m$1 === 'object' && _m$1.$tag === "Dead")) {
      return "fallen";
    }
    throw new Error("Unhandled pattern match in TypeLang");
  })(phase));
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function generateWorld() {
  try {
  (world = []);
  (heights = []);
  try { for (let i = 0; (i < WORLD_SIZE); (i = (i + 1))) { try {
    world.push(0);
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
  try { for (let i = 0; (i < (WORLD_W * WORLD_D)); (i = (i + 1))) { try {
    heights.push(0);
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
  try { for (let x = 0; (x < WORLD_W); (x = (x + 1))) { try {
    (() => {
    try { for (let z = 0; (z < WORLD_D); (z = (z + 1))) { try {
      let h = terrainHeight(x, z);
      ((h < 2) ? (() => {
        return (h = 2);
      })() : null);
      ((h > (WORLD_H - 5)) ? (() => {
        return (h = (WORLD_H - 5));
      })() : null);
      const beach = (h <= 3);
      try { for (let y = 0; (y <= h); (y = (y + 1))) { try {
        let block = 3;
        ((y === 0) ? (() => {
          return (block = 3);
        })() : (((y === h) && beach) ? (() => {
          return (block = 4);
        })() : ((y === h) ? (() => {
          return (block = 1);
        })() : ((y >= (h - 2)) ? (() => {
          return (block = 2);
        })() : null))));
        ((((((x > 15) && (x < 22)) && (z > 15)) && (z < 22)) && (y === h)) ? (() => {
          return (block = 7);
        })() : null);
        setBlock(x, z, y, block);
      } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
      (((h < 3) && !(((((x > 15) && (x < 22)) && (z > 15)) && (z < 22)))) ? (() => {
        return setBlock(x, z, h, 4);
      })() : null);
    } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
})();
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
  try { for (let x = 2; (x < (WORLD_W - 2)); (x = (x + 1))) { try {
    (() => {
    try { for (let z = 2; (z < (WORLD_D - 2)); (z = (z + 1))) { try {
      const chance = random01();
      const ground = heights[columnIndex(x, z)];
      const safeSpawn = (($Math.abs((x - 24)) + $Math.abs((z - 24))) < 5);
      (((((chance > 0.982) && !(safeSpawn)) && (ground > 3)) && (ground < (WORLD_H - 5))) ? (() => {
        const trunk = (3 + $Math.floor((random01() * 2)));
        try { for (let ty = 1; (ty <= trunk); (ty = (ty + 1))) { try {
          setBlock(x, z, (ground + ty), 5);
        } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
        const crownY = (ground + trunk);
        return (() => {
        try { for (let dx = -(2); (dx <= 2); (dx = (dx + 1))) { try {
          (() => {
          try { for (let dz = -(2); (dz <= 2); (dz = (dz + 1))) { try {
            (() => {
            try { for (let dy = 0; (dy <= 2); (dy = (dy + 1))) { try {
              ((((($Math.abs(dx) + $Math.abs(dz)) + dy) < 5) && (getBlock((x + dx), (z + dz), (crownY + dy)) === 0)) ? (() => {
                return setBlock((x + dx), (z + dz), (crownY + dy), 6);
              })() : null);
            } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
})();
          } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
})();
        } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
})();
      })() : null);
    } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
})();
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
  try { for (let x = 2; (x < (WORLD_W - 2)); (x = (x + 1))) { try {
    (() => {
    try { for (let z = 2; (z < (WORLD_D - 2)); (z = (z + 1))) { try {
      ((random01() > 0.987) ? (() => {
        const y = (heights[columnIndex(x, z)] - 2);
        return ((y > 1) ? (() => {
          return setBlock(x, z, y, 8);
        })() : null);
      })() : null);
    } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
})();
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
  return (playerGround = heights[columnIndex(24, 24)]);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function resetInventory() {
  try {
  (inventory = []);
  try { for (let i = 0; (i < 17); (i = (i + 1))) { try {
    inventory.push(0);
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
  (inventory[1] = 8);
  (inventory[2] = 8);
  (inventory[3] = 4);
  (inventory[4] = 4);
  (inventory[9] = 8);
  (inventory[14] = 4);
  return (inventory[11] = 8);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function resetGame() {
  try {
  (seed = (918273 + $Math.floor(($Math.random() * 100000))));
  generateWorld();
  resetInventory();
  (mobs = []);
  (playerX = 24.5);
  (playerZ = 24.5);
  (playerYaw = 0.3);
  (playerPitch = 0);
  (playerHealth = 10);
  (playerHunger = 10);
  (selected = 0);
  (dayClock = 0.18);
  (scoreMined = 0);
  (phase = Playing);
  try { for (let i = 0; (i < 12); (i = (i + 1))) { try {
    const mx = (5 + $Math.floor((random01() * 38)));
    const mz = (5 + $Math.floor((random01() * 38)));
    let kind = 0;
    ((i > 6) ? (() => {
      return (kind = 1);
    })() : null);
    mobs.push(({ x: (mx + 0.5), z: (mz + 0.5), kind: kind, hp: 3, wander: (random01() * 6), attack: 0 }));
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
  return showMessage("New world generated • gather, craft, survive");
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function blockLabel(block) {
  try {
  (((block < 0) || (block >= 17)) ? (() => {
    return (function(){ throw new __ReturnSignal("Unknown"); })();
  })() : null);
  return BLOCK_NAMES[block];
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function terrainAt(x, z) {
  try {
  const ix = $Math.floor(x);
  const iz = $Math.floor(z);
  (((((ix < 0) || (ix >= WORLD_W)) || (iz < 0)) || (iz >= WORLD_D)) ? (() => {
    return (function(){ throw new __ReturnSignal((WORLD_H - 1)); })();
  })() : null);
  return heights[columnIndex(ix, iz)];
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function terrainAround(x, z) {
  try {
  const radius = 0.22;
  let top = terrainAt((x - radius), (z - radius));
  const h1 = terrainAt((x + radius), (z - radius));
  const h2 = terrainAt((x - radius), (z + radius));
  const h3 = terrainAt((x + radius), (z + radius));
  ((h1 > top) ? (() => {
    return (top = h1);
  })() : null);
  ((h2 > top) ? (() => {
    return (top = h2);
  })() : null);
  ((h3 > top) ? (() => {
    return (top = h3);
  })() : null);
  return top;
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function isSolidAt(x, z) {
  try {
  return isSolidAtHeight(x, z, playerGround, jumpOffset);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function isSolidAtHeight(x, z, ground, offset) {
  try {
  (((((x < 0.24) || (x > (WORLD_W - 0.24))) || (z < 0.24)) || (z > (WORLD_D - 0.24))) ? (() => {
    return (function(){ throw new __ReturnSignal(true); })();
  })() : null);
  const obstacleTop = terrainAround(x, z);
  let allowedTop = ground;
  ((offset > 0.05) ? (() => {
    return (allowedTop = (ground + offset));
  })() : null);
  return (obstacleTop > allowedTop);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function tryMove(dx, dz) {
  try {
  const nextX = (playerX + dx);
  (!(isSolidAt(nextX, playerZ)) ? (() => {
    const nextGroundX = terrainAt(nextX, playerZ);
    (playerX = nextX);
    return ((((jumpOffset <= 0.05) && (nextGroundX > playerGround)) && (nextGroundX <= (playerGround + 1))) ? (() => {
      return (playerGround = nextGroundX);
    })() : ((((jumpOffset <= 0.05) && (nextGroundX < playerGround)) && ((playerGround - nextGroundX) <= 1)) ? (() => {
      return (playerGround = nextGroundX);
    })() : (((jumpOffset <= 0.05) && (nextGroundX < (playerGround - 1))) ? (() => {
      (jumpOffset = (playerGround - nextGroundX));
      (jumpVelocity = 0);
      return (playerGround = nextGroundX);
    })() : null)));
  })() : null);
  const nextZ = (playerZ + dz);
  return (!(isSolidAt(playerX, nextZ)) ? (() => {
    const nextGroundZ = terrainAt(playerX, nextZ);
    (playerZ = nextZ);
    return ((((jumpOffset <= 0.05) && (nextGroundZ > playerGround)) && (nextGroundZ <= (playerGround + 1))) ? (() => {
      return (playerGround = nextGroundZ);
    })() : ((((jumpOffset <= 0.05) && (nextGroundZ < playerGround)) && ((playerGround - nextGroundZ) <= 1)) ? (() => {
      return (playerGround = nextGroundZ);
    })() : (((jumpOffset <= 0.05) && (nextGroundZ < (playerGround - 1))) ? (() => {
      (jumpOffset = (playerGround - nextGroundZ));
      (jumpVelocity = 0);
      return (playerGround = nextGroundZ);
    })() : null)));
  })() : null);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function traceTarget() {
  try {
  (targetX = -(1));
  (targetZ = -(1));
  (targetBlock = 0);
  (hitDistance = 0);
  const rayX = $Math.sin(playerYaw);
  const rayZ = $Math.cos(playerYaw);
  return (() => {
  try { for (let step = 1; (step < 55); (step = (step + 1))) { try {
    const dist = (step * 0.1);
    const x = $Math.floor((playerX + (rayX * dist)));
    const z = $Math.floor((playerZ + (rayZ * dist)));
    (((((x < 0) || (x >= WORLD_W)) || (z < 0)) || (z >= WORLD_D)) ? (() => {
      return (function(){ throw new __BreakSignal(); })();
    })() : null);
    const h = heights[columnIndex(x, z)];
    ((h >= (playerGround + 1)) ? (() => {
      (targetX = x);
      (targetZ = z);
      (targetBlock = getBlock(x, z, h));
      (hitDistance = dist);
      return (function(){ throw new __BreakSignal(); })();
    })() : null);
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
})();
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function mineTarget() {
  try {
  traceTarget();
  (((targetBlock === 0) || (hitDistance > MAX_REACH)) ? (() => {
    showMessage("Out of reach");
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  (((targetBlock === 3) && (inventory[12] === 0)) ? (() => {
    showMessage("Stone needs a pickaxe • craft one in the workbench");
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  ((targetBlock === 7) ? (() => {
    showMessage("Water cannot be mined");
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  ((targetBlock === 1) ? (() => {
    (inventory[2] = (inventory[2] + 1));
    return (inventory[1] = (inventory[1] + 1));
  })() : ((targetBlock === 6) ? (() => {
    (inventory[6] = (inventory[6] + 1));
    return ((random01() > 0.86) ? (() => {
      (inventory[16] = (inventory[16] + 1));
      return showMessage("An apple dropped from the leaves");
    })() : null);
  })() : ((targetBlock === 5) ? (() => {
    return (inventory[5] = (inventory[5] + 1));
  })() : ((targetBlock === 8) ? (() => {
    return (inventory[8] = (inventory[8] + 1));
  })() : (() => {
    return (inventory[targetBlock] = (inventory[targetBlock] + 1));
  })()))));
  setBlock(targetX, targetZ, heights[columnIndex(targetX, targetZ)], 0);
  (scoreMined = (scoreMined + 1));
  return showMessage((blockLabel(targetBlock) + " mined"));
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function placeBlock() {
  try {
  traceTarget();
  const block = HOTBAR[selected];
  ((inventory[block] <= 0) ? (() => {
    showMessage((("No " + blockLabel(block)) + " in your hotbar"));
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  let px = $Math.floor((playerX + ($Math.sin(playerYaw) * (hitDistance + 0.15))));
  let pz = $Math.floor((playerZ + ($Math.cos(playerYaw) * (hitDistance + 0.15))));
  (((((((targetBlock === 0) || (hitDistance > MAX_REACH)) || (px < 0)) || (px >= WORLD_W)) || (pz < 0)) || (pz >= WORLD_D)) ? (() => {
    (px = $Math.floor((playerX + ($Math.sin(playerYaw) * 2))));
    return (pz = $Math.floor((playerZ + ($Math.cos(playerYaw) * 2))));
  })() : null);
  const h = heights[columnIndex(px, pz)];
  (((h < 0) || (h >= (WORLD_H - 1))) ? (() => {
    showMessage("No room to place a block");
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  (((($Math.abs(((px + 0.5) - playerX)) < 0.7) && ($Math.abs(((pz + 0.5) - playerZ)) < 0.7)) && ((h + 1) >= playerGround)) ? (() => {
    showMessage("You cannot place a block inside yourself");
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  const putY = (h + 1);
  ((getBlock(px, pz, putY) !== 0) ? (() => {
    showMessage("That space is occupied");
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  setBlock(px, pz, putY, block);
  (inventory[block] = (inventory[block] - 1));
  return showMessage((blockLabel(block) + " placed"));
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function canCraft(recipe) {
  try {
  ((recipe === 0) ? (() => {
    return (function(){ throw new __ReturnSignal((inventory[5] >= 1)); })();
  })() : null);
  ((recipe === 1) ? (() => {
    return (function(){ throw new __ReturnSignal((inventory[9] >= 2)); })();
  })() : null);
  ((recipe === 2) ? (() => {
    return (function(){ throw new __ReturnSignal((inventory[9] >= 4)); })();
  })() : null);
  ((recipe === 3) ? (() => {
    return (function(){ throw new __ReturnSignal((((inventory[9] >= 3) && (inventory[14] >= 2)) && (inventory[10] > 0))); })();
  })() : null);
  ((recipe === 4) ? (() => {
    return (function(){ throw new __ReturnSignal((((inventory[9] >= 2) && (inventory[14] >= 1)) && (inventory[10] > 0))); })();
  })() : null);
  ((recipe === 5) ? (() => {
    return (function(){ throw new __ReturnSignal(((inventory[8] >= 1) && (inventory[14] >= 1))); })();
  })() : null);
  ((recipe === 6) ? (() => {
    return (function(){ throw new __ReturnSignal((((inventory[9] >= 2) && (inventory[14] >= 1)) && (inventory[10] > 0))); })();
  })() : null);
  return false;
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function craft(recipe) {
  try {
  (!(canCraft(recipe)) ? (() => {
    showMessage("Missing ingredients • collect blocks first");
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  return ((recipe === 0) ? (() => {
    (inventory[5] = (inventory[5] - 1));
    (inventory[9] = (inventory[9] + 4));
    return showMessage("Crafted 4 oak planks");
  })() : ((recipe === 1) ? (() => {
    (inventory[9] = (inventory[9] - 2));
    (inventory[14] = (inventory[14] + 4));
    return showMessage("Crafted 4 sticks");
  })() : ((recipe === 2) ? (() => {
    (inventory[9] = (inventory[9] - 4));
    (inventory[10] = (inventory[10] + 1));
    return showMessage("Crafted a workbench");
  })() : ((recipe === 3) ? (() => {
    (inventory[9] = (inventory[9] - 3));
    (inventory[14] = (inventory[14] - 2));
    (inventory[12] = (inventory[12] + 1));
    return showMessage("Crafted a wooden pickaxe");
  })() : ((recipe === 4) ? (() => {
    (inventory[9] = (inventory[9] - 2));
    (inventory[14] = (inventory[14] - 1));
    (inventory[13] = (inventory[13] + 1));
    return showMessage("Crafted a wooden sword");
  })() : ((recipe === 5) ? (() => {
    (inventory[8] = (inventory[8] - 1));
    (inventory[14] = (inventory[14] - 1));
    (inventory[11] = (inventory[11] + 4));
    return showMessage("Crafted 4 torches");
  })() : (() => {
    (inventory[9] = (inventory[9] - 2));
    (inventory[14] = (inventory[14] - 1));
    (inventory[15] = (inventory[15] + 1));
    return showMessage("Crafted a wool bedroll");
  })()))))));
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function swingSword() {
  try {
  ((inventory[13] <= 0) ? (() => {
    showMessage("Craft a wooden sword at a workbench");
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  let found = false;
  try { for (let i = 0; (i < mobs.length); (i = (i + 1))) { try {
    const mob = mobs[i];
    const dx = (mob.x - playerX);
    const dz = (mob.z - playerZ);
    const dist = $Math.sqrt(((dx * dx) + (dz * dz)));
    const dot = (((dx * $Math.sin(playerYaw)) + (dz * $Math.cos(playerYaw))) / $Math.max(0.001, dist));
    (((!(found) && (dist < 3.2)) && (dot > 0.45)) ? (() => {
      (mob.hp = (mob.hp - 2));
      (found = true);
      return ((mob.hp <= 0) ? (() => {
        (inventory[15] = (inventory[15] + 1));
        mobs.splice(i, 1);
        return showMessage("Hostile defeated • +1 wool");
      })() : (() => {
        return showMessage("Sword strike!");
      })());
    })() : null);
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
  return (!(found) ? (() => {
    return showMessage("Whoosh!");
  })() : null);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function updateMobs(dt) {
  try {
  const night = ((dayClock > 0.62) && (dayClock < 0.96));
  try { for (let i = 0; (i < mobs.length); (i = (i + 1))) { try {
    const mob = mobs[i];
    (mob.wander = (mob.wander + dt));
    (mob.attack = $Math.max(0, (mob.attack - dt)));
    const dx = (playerX - mob.x);
    const dz = (playerZ - mob.z);
    const dist = $Math.sqrt(((dx * dx) + (dz * dz)));
    const hostile = ((mob.kind === 1) && night);
    (((hostile && (dist < 12)) && (dist > 1.1)) ? (() => {
      const speed = (dt * 1);
      const nx = (mob.x + ((dx / $Math.max(0.001, dist)) * speed));
      const nz = (mob.z + ((dz / $Math.max(0.001, dist)) * speed));
      const mobGround = terrainAt(mob.x, mob.z);
      (!(isSolidAtHeight(nx, mob.z, mobGround, 0)) ? (() => {
        return (mob.x = nx);
      })() : null);
      return (!(isSolidAtHeight(mob.x, nz, terrainAt(mob.x, mob.z), 0)) ? (() => {
        return (mob.z = nz);
      })() : null);
    })() : (((mob.kind === 0) && (mob.wander > 3)) ? (() => {
      const sheepX = (mob.x + (($Math.sin((mob.wander * 1.7)) * dt) * 0.35));
      const sheepZ = (mob.z + (($Math.cos((mob.wander * 1.3)) * dt) * 0.35));
      (!(isSolidAtHeight(sheepX, mob.z, terrainAt(mob.x, mob.z), 0)) ? (() => {
        return (mob.x = sheepX);
      })() : null);
      (!(isSolidAtHeight(mob.x, sheepZ, terrainAt(mob.x, mob.z), 0)) ? (() => {
        return (mob.z = sheepZ);
      })() : null);
      return ((mob.wander > 8) ? (() => {
        return (mob.wander = 0);
      })() : null);
    })() : null));
    ((((hostile && (dist < 1.25)) && (mob.attack <= 0)) && (playerHealth > 0)) ? (() => {
      (playerHealth = (playerHealth - 1));
      (playerHunger = $Math.max(0, (playerHunger - 1)));
      (mob.attack = 1.1);
      showMessage("A night crawler hit you! Find shelter or fight back");
      return ((playerHealth <= 0) ? (() => {
        return (phase = Dead);
      })() : null);
    })() : null);
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
  return (((($Math.floor((dayClock * 10)) === 3) && (random01() > 0.98)) && (mobs.length < 18)) ? (() => {
    const sx = ((playerX + 10) + (random01() * 8));
    const sz = ((playerZ + (random01() * 10)) - 5);
    return mobs.push(({ x: sx, z: sz, kind: 1, hp: 3, wander: 0, attack: 0 }));
  })() : null);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function colorShade(hex, factor) {
  try {
  return hex;
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function drawSky(time) {
  try {
  const night = ((dayClock > 0.62) && (dayClock < 0.96));
  let top = "#67b8e8";
  let bottom = "#c4e6f0";
  (night ? (() => {
    (top = "#10172e");
    return (bottom = "#38496b");
  })() : (((dayClock < 0.12) || (dayClock > 0.48)) ? (() => {
    (top = "#e99770");
    return (bottom = "#f2c58c");
  })() : null));
  const horizon = (((SCREEN_H * 0.48) + (playerPitch * 42)) + (jumpOffset * 26));
  (ctx.fillStyle = top);
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  (ctx.fillStyle = bottom);
  ctx.fillRect(0, ((SCREEN_H * 0.34) + (playerPitch * 45)), SCREEN_W, SCREEN_H);
  return (night ? (() => {
    (ctx.fillStyle = "#f8ecc5");
    ctx.beginPath();
    ctx.arc(375, 48, 13, 0, ($Math.PI * 2));
    ctx.fill();
    return (() => {
    try { for (let i = 0; (i < 32); (i = (i + 1))) { try {
      const sx = (((i * 79) + 23) % SCREEN_W);
      const sy = (((i * 43) + 15) % 90);
      (ctx.fillStyle = "rgba(255,255,220,0.7)");
      ctx.fillRect(sx, sy, 2, 2);
    } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
})();
  })() : (() => {
    (ctx.fillStyle = "#fff0b1");
    ctx.beginPath();
    ctx.arc((370 - (dayClock * 140)), 56, 18, 0, ($Math.PI * 2));
    ctx.fill();
    return (() => {
    try { for (let i = 0; (i < 5); (i = (i + 1))) { try {
      const cx = ((((i * 117) + (time * 0.009)) % (SCREEN_W + 80)) - 40);
      const cy = (30 + ((i * 29) % 65));
      (ctx.fillStyle = "rgba(255,255,255,0.48)");
      ctx.fillRect(cx, cy, 42, 8);
      ctx.fillRect((cx + 9), (cy - 6), 24, 8);
    } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
})();
  })());
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function renderWorld(time) {
  try {
  drawSky(time);
  const horizon = (((SCREEN_H * 0.48) + (playerPitch * 42)) + (jumpOffset * 26));
  const angleStep = (FOV / RENDER_COLUMNS);
  const startAngle = (playerYaw - (FOV / 2));
  (targetX = -(1));
  (targetZ = -(1));
  (targetBlock = 0);
  (hitDistance = 0);
  try { for (let col = 0; (col < RENDER_COLUMNS); (col = (col + 1))) { try {
    const rayAngle = (startAngle + (col * angleStep));
    const rayX = $Math.sin(rayAngle);
    const rayZ = $Math.cos(rayAngle);
    let nearest = 22;
    let nearestHeight = 0;
    let nearestBlock = 0;
    let dist = 0.2;
    let maxTop = (SCREEN_H + 1);
    let stepCount = 0;
    try { while (((dist < 22) && (stepCount < 135))) { try {
      const wx = $Math.floor((playerX + (rayX * dist)));
      const wz = $Math.floor((playerZ + (rayZ * dist)));
      (((((wx < 0) || (wx >= WORLD_W)) || (wz < 0)) || (wz >= WORLD_D)) ? (() => {
        return (function(){ throw new __BreakSignal(); })();
      })() : null);
      const h = heights[columnIndex(wx, wz)];
      const topY = (horizon + ((((playerGround + playerEyeHeight) - h) - 1) * (105 / dist)));
      ((topY < maxTop) ? (() => {
        return (maxTop = topY);
      })() : null);
      (((nearestBlock === 0) && (h >= (playerGround + 1))) ? (() => {
        (nearest = dist);
        (nearestHeight = h);
        return (nearestBlock = getBlock(wx, wz, h));
      })() : null);
      ((maxTop < 2) ? (() => {
        return (function(){ throw new __BreakSignal(); })();
      })() : null);
      (dist = (dist + 0.16));
      (stepCount = (stepCount + 1));
    } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
    const sx = ((col * SCREEN_W) / RENDER_COLUMNS);
    const sw = ((SCREEN_W / RENDER_COLUMNS) + 1);
    const groundY = $Math.max((horizon + 4), $Math.min(SCREEN_H, maxTop));
    (ctx.fillStyle = "#4d7839");
    (((dayClock > 0.62) && (dayClock < 0.96)) ? (() => {
      return (ctx.fillStyle = "#1c342d");
    })() : null);
    ctx.fillRect(sx, groundY, sw, (SCREEN_H - groundY));
    let groundPixelY = ($Math.floor((groundY / 6)) * 6);
    try { while ((groundPixelY < SCREEN_H)) { try {
      const sampleDist = $Math.max(0.5, $Math.min(22, (100 / $Math.max(1, ((groundPixelY - horizon) + 12)))));
      const groundX = $Math.floor((playerX + (rayX * sampleDist)));
      const groundZ = $Math.floor((playerZ + (rayZ * sampleDist)));
      const surfaceY = terrainAt(groundX, groundZ);
      const surfaceBlock = getBlock(groundX, groundZ, surfaceY);
      let surfaceColor = "#547d3d";
      ((surfaceBlock === 4) ? (() => {
        return (surfaceColor = "#c7ae69");
      })() : ((surfaceBlock === 7) ? (() => {
        return (surfaceColor = "#3876a2");
      })() : ((surfaceBlock === 3) ? (() => {
        return (surfaceColor = "#777674");
      })() : ((surfaceBlock === 6) ? (() => {
        return (surfaceColor = "#466e38");
      })() : ((surfaceBlock === 2) ? (() => {
        return (surfaceColor = "#806043");
      })() : null)))));
      const textureCell = (($Math.abs($Math.floor((groundX * 2))) + $Math.abs($Math.floor((groundZ * 2)))) % 9);
      (((surfaceBlock === 1) && (textureCell === 0)) ? (() => {
        return (surfaceColor = "#668e43");
      })() : (((surfaceBlock === 1) && (textureCell === 1)) ? (() => {
        return (surfaceColor = "#496f36");
      })() : null));
      const surfaceShade = $Math.max(0.42, (1 - (sampleDist / 34)));
      (ctx.globalAlpha = surfaceShade);
      (ctx.fillStyle = surfaceColor);
      ctx.fillRect(sx, groundPixelY, sw, 6);
      (ctx.globalAlpha = 1);
      (groundPixelY = (groundPixelY + 6));
    } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
    ((nearestBlock !== 0) ? (() => {
      const corrected = (nearest * $Math.cos((rayAngle - playerYaw)));
      let wallTop = (horizon + ((((playerGround + playerEyeHeight) - nearestHeight) - 1) * (108 / corrected)));
      let wallBottom = (horizon + (((playerGround + playerEyeHeight) - nearestHeight) * (108 / corrected)));
      ((wallBottom < groundY) ? (() => {
        return (wallBottom = groundY);
      })() : null);
      ((wallTop < -(60)) ? (() => {
        return (wallTop = -(60));
      })() : null);
      const wallColor = BLOCK_COLORS[nearestBlock];
      const shade = $Math.max(0.35, (1 - (corrected / 25)));
      (ctx.globalAlpha = shade);
      (ctx.fillStyle = wallColor);
      ctx.fillRect(sx, wallTop, sw, $Math.max(1, (wallBottom - wallTop)));
      (ctx.globalAlpha = 1);
      (((nearestBlock === 1) || (nearestBlock === 6)) ? (() => {
        (ctx.fillStyle = ((nearestBlock === 1) ? "#80c44c" : "#70a74c"));
        return ctx.fillRect(sx, wallTop, sw, 2);
      })() : null);
      ((nearestBlock === 5) ? (() => {
        (ctx.fillStyle = "#573b27");
        return (((col % 3) === 0) ? (() => {
          return ctx.fillRect(sx, (wallTop + 3), sw, $Math.max(1, ((wallBottom - wallTop) - 4)));
        })() : null);
      })() : null);
      (((col % 9) === 0) ? (() => {
        (ctx.fillStyle = "rgba(24,27,22,0.22)");
        return ctx.fillRect(sx, wallTop, sw, $Math.max(1, (wallBottom - wallTop)));
      })() : null);
      return (($Math.abs((col - (RENDER_COLUMNS / 2))) <= 1) ? (() => {
        const wx = $Math.floor((playerX + (rayX * nearest)));
        const wz = $Math.floor((playerZ + (rayZ * nearest)));
        (targetX = wx);
        (targetZ = wz);
        (targetBlock = nearestBlock);
        return (hitDistance = nearest);
      })() : null);
    })() : null);
    ((groundY < SCREEN_H) ? (() => {
      (ctx.fillStyle = "rgba(35,45,33,0.28)");
      return ctx.fillRect(sx, $Math.max(groundY, (SCREEN_H - 22)), sw, 2);
    })() : null);
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
  drawMobs();
  drawCrosshair();
  return drawHUD();
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function drawMobs() {
  try {
  return (() => {
  try { for (let i = 0; (i < mobs.length); (i = (i + 1))) { try {
    const mob = mobs[i];
    const dx = (mob.x - playerX);
    const dz = (mob.z - playerZ);
    const dist = $Math.sqrt(((dx * dx) + (dz * dz)));
    let relative = ($Math.atan2(dx, dz) - playerYaw);
    try { while ((relative > $Math.PI)) { try {
      (relative = (relative - ($Math.PI * 2)));
    } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
    try { while ((relative < -($Math.PI))) { try {
      (relative = (relative + ($Math.PI * 2)));
    } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
    ((($Math.abs(relative) < (FOV * 0.62)) && (dist > 0.4)) ? (() => {
      const screenX = ((SCREEN_W / 2) + (relative * (SCREEN_W / FOV)));
      const size = $Math.min(64, (72 / dist));
      const mobGround = terrainAt(mob.x, mob.z);
      const horizon = (((SCREEN_H * 0.48) + (playerPitch * 42)) + (jumpOffset * 26));
      const baseY = ((horizon + ((((playerGround + playerEyeHeight) - mobGround) - 1) * (108 / dist))) + (size * 0.65));
      let hiddenByTerrain = false;
      let sightStep = 1;
      try { while (((sightStep < 150) && ((sightStep * 0.15) < dist))) { try {
        const sightX = (playerX + (((dx / dist) * sightStep) * 0.15));
        const sightZ = (playerZ + (((dz / dist) * sightStep) * 0.15));
        ((terrainAt(sightX, sightZ) > (playerGround + 1)) ? (() => {
          return (hiddenByTerrain = true);
        })() : null);
        (sightStep = (sightStep + 1));
      } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
      return ((!(hiddenByTerrain) && (mob.kind === 0)) ? (() => {
        (ctx.fillStyle = "#ded8c8");
        ctx.fillRect((screenX - (size * 0.4)), (baseY - (size * 0.72)), (size * 0.8), (size * 0.52));
        ctx.fillRect((screenX - (size * 0.19)), (baseY - (size * 0.97)), (size * 0.47), (size * 0.34));
        (ctx.fillStyle = "#2b2927");
        return ctx.fillRect((screenX + (size * 0.11)), (baseY - (size * 0.83)), 2, 2);
      })() : (!(hiddenByTerrain) ? (() => {
        (ctx.fillStyle = "#425f4c");
        ctx.fillRect((screenX - (size * 0.34)), (baseY - (size * 0.92)), (size * 0.68), (size * 0.82));
        (ctx.fillStyle = "#7e9f75");
        ctx.fillRect((screenX - (size * 0.28)), (baseY - size), (size * 0.56), (size * 0.28));
        (ctx.fillStyle = "#d94d45");
        ctx.fillRect((screenX - (size * 0.18)), (baseY - (size * 0.92)), 3, 2);
        return ctx.fillRect((screenX + (size * 0.09)), (baseY - (size * 0.92)), 3, 2);
      })() : null));
    })() : null);
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
})();
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function drawCrosshair() {
  try {
  (ctx.strokeStyle = "rgba(255,255,255,0.9)");
  (ctx.lineWidth = 2);
  ctx.beginPath();
  ctx.moveTo(((SCREEN_W / 2) - 7), (SCREEN_H / 2));
  ctx.lineTo(((SCREEN_W / 2) - 2), (SCREEN_H / 2));
  ctx.moveTo(((SCREEN_W / 2) + 2), (SCREEN_H / 2));
  ctx.lineTo(((SCREEN_W / 2) + 7), (SCREEN_H / 2));
  ctx.moveTo((SCREEN_W / 2), ((SCREEN_H / 2) - 7));
  ctx.lineTo((SCREEN_W / 2), ((SCREEN_H / 2) - 2));
  ctx.moveTo((SCREEN_W / 2), ((SCREEN_H / 2) + 2));
  ctx.lineTo((SCREEN_W / 2), ((SCREEN_H / 2) + 7));
  return ctx.stroke();
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function drawHUD() {
  try {
  (ctx.fillStyle = "rgba(13,19,20,0.74)");
  ctx.fillRect(10, 10, 148, 38);
  (ctx.fillStyle = "#f5f1df");
  (ctx.font = "bold 12px monospace");
  ctx.fillText(("DAY " + $to_string($Math.floor((dayClock * 24)))), 19, 25);
  (ctx.fillStyle = "#473b36");
  ctx.fillRect(18, 33, 82, 8);
  (ctx.fillStyle = "#e85c50");
  ctx.fillRect(18, 33, (playerHealth * 8.2), 8);
  (ctx.fillStyle = "#473b36");
  ctx.fillRect(108, 33, 38, 8);
  (ctx.fillStyle = "#e9b84e");
  ctx.fillRect(108, 33, (playerHunger * 3.8), 8);
  try { for (let i = 0; (i < 8); (i = (i + 1))) { try {
    const bx = (((SCREEN_W / 2) - 100) + (i * 25));
    const by = (SCREEN_H - 36);
    (ctx.fillStyle = "rgba(12,16,18,0.82)");
    ctx.fillRect(bx, by, 24, 24);
    ((i === selected) ? (() => {
      (ctx.strokeStyle = "#f5d27d");
      (ctx.lineWidth = 2);
      return ctx.strokeRect(bx, by, 24, 24);
    })() : null);
    const block = HOTBAR[i];
    (ctx.fillStyle = BLOCK_COLORS[block]);
    ctx.fillRect((bx + 6), (by + 5), 12, 12);
    (ctx.fillStyle = "#f4f1e7");
    (ctx.font = "10px monospace");
    ctx.fillText($to_string(inventory[block]), (bx + 7), (by + 22));
    (ctx.fillStyle = "rgba(240,235,210,0.7)");
    ctx.fillText($to_string((i + 1)), (bx + 2), (by - 2));
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
  (((targetBlock !== 0) && (hitDistance < MAX_REACH)) ? (() => {
    (ctx.fillStyle = "rgba(14,18,18,0.78)");
    ctx.fillRect(((SCREEN_W / 2) - 76), (SCREEN_H - 58), 152, 16);
    (ctx.fillStyle = "#f2e9d3");
    (ctx.font = "10px monospace");
    return ctx.fillText((((blockLabel(targetBlock) + "  •  ") + $to_string(($Math.floor((hitDistance * 10)) / 10))) + "m"), ((SCREEN_W / 2) - 68), (SCREEN_H - 47));
  })() : null);
  ((messageTime > 0) ? (() => {
    const toast = message.substring(0, 30);
    (ctx.font = "bold 11px monospace");
    const width = $Math.min(260, ((toast.length * 7) + 24));
    const toastX = ((SCREEN_W - width) - 10);
    (ctx.fillStyle = "rgba(14,18,18,0.84)");
    ctx.fillRect(toastX, 59, width, 24);
    (ctx.fillStyle = "#fff4d5");
    return ctx.fillText(toast, (toastX + 12), 75);
  })() : null);
  (showDebug ? (() => {
    (ctx.fillStyle = "rgba(8,12,14,0.78)");
    ctx.fillRect(10, 57, 180, 96);
    (ctx.fillStyle = "#9ee5bc");
    (ctx.font = "10px monospace");
    ctx.fillText(((((("XYZ " + $to_string($Math.floor(playerX))) + " / ") + $to_string(playerGround)) + " / ") + $to_string($Math.floor(playerZ))), 18, 73);
    ctx.fillText(((("SEED " + $to_string(seed)) + "  MOBS ") + $to_string(mobs.length)), 18, 88);
    ctx.fillText((("MINED " + $to_string(scoreMined)) + "  FPS ~30"), 18, 103);
    ctx.fillText(("STATE " + phaseLabel()), 18, 118);
    ctx.fillText(("JUMP " + $to_string(($Math.floor((jumpOffset * 100)) / 100))), 18, 133);
    return ctx.fillText(((("DIR " + $to_string(($Math.floor((playerYaw * 100)) / 100))) + " / ") + $to_string(($Math.floor((playerPitch * 100)) / 100))), 18, 148);
  })() : null);
  ((((phase === Paused) || (phase === Dead)) || (phase === Title)) ? (() => {
    return drawOverlay();
  })() : null);
  return ((phase === Inventory) ? (() => {
    return drawInventory();
  })() : null);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function drawOverlay() {
  try {
  (ctx.fillStyle = "rgba(8,13,16,0.68)");
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  (ctx.textAlign = "center");
  return ((phase === Title) ? (() => {
    (ctx.fillStyle = "#7fd17b");
    (ctx.font = "bold 38px monospace");
    ctx.fillText("MINCRAFT", (SCREEN_W / 2), 87);
    (ctx.fillStyle = "#f3e8cc");
    (ctx.font = "bold 12px monospace");
    ctx.fillText("A TypeLang voxel survival sandbox", (SCREEN_W / 2), 112);
    (ctx.fillStyle = "#d5c9ae");
    (ctx.font = "11px monospace");
    ctx.fillText("Mine • craft • build • survive the night", (SCREEN_W / 2), 146);
    (ctx.fillStyle = "#f6ce76");
    ctx.fillText("CLICK TO CREATE A WORLD", (SCREEN_W / 2), 191);
    (ctx.fillStyle = "#d6e3df");
    (ctx.font = "10px monospace");
    ctx.fillText("WASD move  •  hold + drag to look  •  left mine  •  right place", (SCREEN_W / 2), 218);
    return (ctx.textAlign = "left");
  })() : ((phase === Dead) ? (() => {
    (ctx.fillStyle = "#ef7769");
    (ctx.font = "bold 28px monospace");
    ctx.fillText("YOU FADED INTO THE NIGHT", (SCREEN_W / 2), 113);
    (ctx.fillStyle = "#f4e8d4");
    (ctx.font = "12px monospace");
    ctx.fillText("The forest keeps your story. Start another world?", (SCREEN_W / 2), 145);
    (ctx.fillStyle = "#f6ce76");
    ctx.fillText("CLICK OR PRESS R TO RESPAWN", (SCREEN_W / 2), 184);
    return (ctx.textAlign = "left");
  })() : (() => {
    (ctx.fillStyle = "#f6ce76");
    (ctx.font = "bold 30px monospace");
    ctx.fillText("PAUSED", (SCREEN_W / 2), 130);
    (ctx.fillStyle = "#f4e8d4");
    (ctx.font = "12px monospace");
    ctx.fillText("Press ESC or click to return", (SCREEN_W / 2), 160);
    return (ctx.textAlign = "left");
  })()));
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function drawInventory() {
  try {
  (ctx.fillStyle = "rgba(9,14,16,0.83)");
  ctx.fillRect(48, 26, 384, 248);
  (ctx.strokeStyle = "#8d9b78");
  ctx.strokeRect(48, 26, 384, 248);
  (ctx.fillStyle = "#f2e7cb");
  (ctx.font = "bold 16px monospace");
  ctx.fillText("FIELD KIT  /  CRAFTING", 66, 51);
  (ctx.font = "10px monospace");
  (ctx.fillStyle = "#a8b7a0");
  ctx.fillText("ITEMS", 67, 75);
  try { for (let i = 1; (i < 17); (i = (i + 1))) { try {
    const bx = (67 + (((i - 1) % 5) * 47));
    const by = (84 + ($Math.floor(((i - 1) / 5)) * 26));
    (ctx.fillStyle = "rgba(46,57,52,0.9)");
    ctx.fillRect(bx, by, 39, 28);
    (ctx.fillStyle = BLOCK_COLORS[i]);
    ctx.fillRect((bx + 5), (by + 6), 12, 12);
    (ctx.fillStyle = "#f3eddf");
    (ctx.font = "9px monospace");
    ctx.fillText($to_string(inventory[i]), (bx + 20), (by + 15));
    (ctx.fillStyle = "#bac6bb");
    ctx.fillText(BLOCK_NAMES[i].substring(0, 6), (bx + 4), (by + 27));
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
  (ctx.fillStyle = "#a8b7a0");
  (ctx.font = "10px monospace");
  ctx.fillText("RECIPES  (click to craft)", 67, 202);
  const recipes = ["Planks  ←  log", "Sticks  ←  2 planks", "Workbench  ←  4 planks", "Wood pick  ←  bench", "Sword  ←  bench", "Torches  ←  coal", "Wool wrap  ←  bench"];
  try { for (let r = 0; (r < 7); (r = (r + 1))) { try {
    const bx = (67 + ((r % 2) * 174));
    const by = (218 + ($Math.floor((r / 2)) * 15));
    (canCraft(r) ? (() => {
      return (ctx.fillStyle = "#d9c98f");
    })() : (() => {
      return (ctx.fillStyle = "#778078");
    })());
    ctx.fillRect(bx, (by - 10), 164, 13);
    (ctx.fillStyle = (canCraft(r) ? "#242a24" : "#202624"));
    ctx.fillText(recipes[r], (bx + 4), by);
  } catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }
  (ctx.fillStyle = "#cad1c5");
  return ctx.fillText("E / ESC closes kit", 316, 51);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function update(dt) {
  try {
  ((messageTime > 0) ? (() => {
    return (messageTime = $Math.max(0, (messageTime - dt)));
  })() : null);
  ((phase !== Playing) ? (() => {
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  (dayClock = (dayClock + (dt / 150)));
  ((dayClock >= 1) ? (() => {
    return (dayClock = (dayClock - 1));
  })() : null);
  (playerHunger = $Math.max(0, (playerHunger - (dt * 0.012))));
  ((((playerHunger <= 0) && (($Math.floor((dayClock * 8)) % 3) === 0)) && (random01() > 0.985)) ? (() => {
    (playerHealth = $Math.max(0, (playerHealth - 1)));
    return ((playerHealth === 0) ? (() => {
      return (phase = Dead);
    })() : null);
  })() : null);
  let forward = 0;
  let strafe = 0;
  (((keys.indexOf("w") >= 0) || (keys.indexOf("arrowup") >= 0)) ? (() => {
    return (forward = (forward + 1));
  })() : null);
  (((keys.indexOf("s") >= 0) || (keys.indexOf("arrowdown") >= 0)) ? (() => {
    return (forward = (forward - 1));
  })() : null);
  (((keys.indexOf("a") >= 0) || (keys.indexOf("arrowleft") >= 0)) ? (() => {
    return (strafe = (strafe - 1));
  })() : null);
  (((keys.indexOf("d") >= 0) || (keys.indexOf("arrowright") >= 0)) ? (() => {
    return (strafe = (strafe + 1));
  })() : null);
  const magnitude = $Math.sqrt(((forward * forward) + (strafe * strafe)));
  ((magnitude > 0) ? (() => {
    const speed = ((3.2 * dt) / magnitude);
    const dx = ((($Math.sin(playerYaw) * forward) + ($Math.cos(playerYaw) * strafe)) * speed);
    const dz = ((($Math.cos(playerYaw) * forward) - ($Math.sin(playerYaw) * strafe)) * speed);
    tryMove(dx, dz);
    (lastMove = (lastMove + dt));
    return (((lastMove > 1.8) && (playerHunger > 0)) ? (() => {
      (playerHunger = $Math.max(0, (playerHunger - 0.1)));
      return (lastMove = 0);
    })() : null);
  })() : null);
  (((keys.indexOf(" ") >= 0) && (jumpOffset <= 0.01)) ? (() => {
    return (jumpVelocity = 4.4);
  })() : null);
  (((jumpOffset > 0) || (jumpVelocity > 0)) ? (() => {
    (jumpOffset = (jumpOffset + (jumpVelocity * dt)));
    (jumpVelocity = (jumpVelocity - (12 * dt)));
    const supportHeight = terrainAt(playerX, playerZ);
    return ((((jumpVelocity < 0) && (supportHeight > playerGround)) && (jumpOffset <= (supportHeight - playerGround))) ? (() => {
      (playerGround = supportHeight);
      (jumpOffset = 0);
      return (jumpVelocity = 0);
    })() : ((jumpOffset < 0) ? (() => {
      (jumpOffset = 0);
      (jumpVelocity = 0);
      return (playerGround = supportHeight);
    })() : null));
  })() : null);
  return updateMobs(dt);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function handleKeyDown(event) {
  try {
  const key = event.key;
  const lower = key.toLowerCase();
  const isNewPress = (keys.indexOf(lower) < 0);
  (isNewPress ? (() => {
    return keys.push(lower);
  })() : null);
  ((((((key === " ") && isNewPress) && (phase === Playing)) && (jumpOffset <= 0.01)) && (jumpVelocity <= 0)) ? (() => {
    return (jumpVelocity = 5.5);
  })() : null);
  ((key === "Escape") ? (() => {
    return ((phase === Inventory) ? (() => {
      return (phase = Playing);
    })() : ((phase === Playing) ? (() => {
      return (phase = Paused);
    })() : ((phase === Paused) ? (() => {
      return (phase = Playing);
    })() : null)));
  })() : (((key === "e") || (key === "E")) ? (() => {
    return ((phase === Playing) ? (() => {
      return (phase = Inventory);
    })() : ((phase === Inventory) ? (() => {
      return (phase = Playing);
    })() : null));
  })() : ((key === "F3") ? (() => {
    return (showDebug = !(showDebug));
  })() : (((key === "r") || (key === "R")) ? (() => {
    return (((phase === Title) || (phase === Dead)) ? (() => {
      return resetGame();
    })() : null);
  })() : (((key === "q") || (key === "Q")) ? (() => {
    return ((phase === Playing) ? (() => {
      return swingSword();
    })() : null);
  })() : (((key === "f") || (key === "F")) ? (() => {
    return (((phase === Playing) && (inventory[16] > 0)) ? (() => {
      (inventory[16] = (inventory[16] - 1));
      (playerHealth = $Math.min(10, (playerHealth + 2)));
      (playerHunger = $Math.min(10, (playerHunger + 3)));
      return showMessage("A forest apple restored your strength");
    })() : null);
  })() : ((key === "1") ? (() => {
    return (selected = 0);
  })() : ((key === "2") ? (() => {
    return (selected = 1);
  })() : ((key === "3") ? (() => {
    return (selected = 2);
  })() : ((key === "4") ? (() => {
    return (selected = 3);
  })() : ((key === "5") ? (() => {
    return (selected = 4);
  })() : ((key === "6") ? (() => {
    return (selected = 5);
  })() : ((key === "7") ? (() => {
    return (selected = 6);
  })() : ((key === "8") ? (() => {
    return (selected = 7);
  })() : null))))))))))))));
  return (((key === " ") || (key.indexOf("Arrow") === 0)) ? (() => {
    return event.preventDefault();
  })() : null);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function handleKeyUp(event) {
  try {
  const lower = event.key.toLowerCase();
  const idx = keys.indexOf(lower);
  return ((idx >= 0) ? (() => {
    return keys.splice(idx, 1);
  })() : null);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function handleMouseMove(event) {
  try {
  (((phase === Playing) && lookDragging) ? (() => {
    const scaleX = (SCREEN_W / canvas.clientWidth);
    const scaleY = (SCREEN_H / canvas.clientHeight);
    (playerYaw = (playerYaw + ((event.movementX * scaleX) * 0.003)));
    return (playerPitch = $Math.max(-(0.65), $Math.min(0.65, (playerPitch + ((event.movementY * scaleY) * 0.002)))));
  })() : null);
  (lastMouseX = event.offsetX);
  return (lastMouseY = event.offsetY);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function handleMouseDown(event) {
  try {
  (((phase === Title) || (phase === Dead)) ? (() => {
    resetGame();
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  ((phase === Paused) ? (() => {
    (phase = Playing);
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  ((phase === Inventory) ? (() => {
    const x = ((event.offsetX * SCREEN_W) / canvas.clientWidth);
    const y = ((event.offsetY * SCREEN_H) / canvas.clientHeight);
    (((y >= 210) && (y <= 271)) ? (() => {
      const row = $Math.floor(((y - 210) / 15));
      const col = $Math.floor(((x - 67) / 174));
      return (((x >= 67) && (x <= 405)) ? (() => {
        const recipe = ((row * 2) + col);
        return (((recipe >= 0) && (recipe <= 6)) ? (() => {
          return craft(recipe);
        })() : null);
      })() : null);
    })() : null);
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  ((phase !== Playing) ? (() => {
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  (lookDragging = true);
  return ((event.button === 0) ? (() => {
    return (((inventory[13] > 0) && (keys.indexOf("shift") >= 0)) ? (() => {
      return swingSword();
    })() : (() => {
      return mineTarget();
    })());
  })() : ((event.button === 2) ? (() => {
    return placeBlock();
  })() : null));
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function handleWheel(event) {
  try {
  (selected = (((selected + 8) + $Math.floor((event.deltaY / 100))) % 8));
  return event.preventDefault();
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function drawFrame(time) {
  try {
  (((time - lastFrame) < 30) ? (() => {
    requestAnimationFrame(drawFrame);
    return (function(){ throw new __ReturnSignal(null); })();
  })() : null);
  let dt = ((time - lastFrame) / 1000);
  ((dt > 0.08) ? (() => {
    return (dt = 0.08);
  })() : null);
  (lastFrame = time);
  update(dt);
  renderWorld(time);
  return requestAnimationFrame(drawFrame);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
function start() {
  try {
  (ctx.imageSmoothingEnabled = false);
  canvas.addEventListener("contextmenu", ((event) => {
    return event.preventDefault();
  }));
  canvas.addEventListener("mousedown", ((event) => {
    return handleMouseDown(event);
  }));
  canvas.addEventListener("mousemove", ((event) => {
    return handleMouseMove(event);
  }));
  canvas.addEventListener("mouseup", ((event) => {
    return (lookDragging = false);
  }));
  canvas.addEventListener("wheel", ((event) => {
    return handleWheel(event);
  }));
  canvas.addEventListener("keydown", ((event) => {
    return handleKeyDown(event);
  }));
  canvas.addEventListener("keyup", ((event) => {
    return handleKeyUp(event);
  }));
  canvas.addEventListener("blur", ((event) => {
    return (keys = []);
  }));
  return requestAnimationFrame(drawFrame);
  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
}
resetInventory();
start();