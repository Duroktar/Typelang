export interface StdLibFunctionDoc {
  name: string;
  signature: string;
  description: string;
  typeLangImpl: string;
  jsImpl: string;
  example: string;
}

export interface StdLibModuleDoc {
  id: string;
  name: string;
  category: 'Monad' | 'Algebraic' | 'Core' | 'Runtime';
  tagline: string;
  description: string;
  typeDefinition: string;
  typeLangSource: string;
  jsSource: string;
  doNotationSnippet?: string;
  lawsDoc?: {
    leftIdentity?: string;
    rightIdentity?: string;
    associativity?: string;
    inverse?: string;
    reflexivity?: string;
    symmetry?: string;
    transitivity?: string;
  };
  functions: StdLibFunctionDoc[];
}

export const STDLIB_MODULES: StdLibModuleDoc[] = [
  {
    id: 'Option',
    name: 'Option',
    category: 'Monad',
    tagline: 'Safe optional values without null or undefined exceptions',
    description: 'The Option monad represents an optional value: every Option is either Some and contains a value, or None, and does not. It is the functional alternative to null/undefined pointers.',
    typeDefinition: `type Option<a> =
  | Some(val: a): Option<a>
  | None: Option<a>`,
    lawsDoc: {
      leftIdentity: 'flatMap(pure(x), f)  ===  f(x)',
      rightIdentity: 'flatMap(m, pure)  ===  m',
      associativity: 'flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))'
    },
    doNotationSnippet: `import Option.{ Some, None, getOrElse, map, filter }

let result = do(Option) {
  userId <- Some(42);
  user <- findUserById(userId);
  profile <- user.profile;
  pure profile.email;
}`,
    typeLangSource: `// Option Module Implementation in TypeLang
module Option {
  export function pure<a>(val: a): Option<a> {
    Some(val)
  }

  export function of<a>(val: a): Option<a> {
    Some(val)
  }

  export function isSome<a>(opt: Option<a>): boolean {
    match (opt) {
      Some(_) => true
      None => false
    }
  }

  export function isNone<a>(opt: Option<a>): boolean {
    match (opt) {
      Some(_) => false
      None => true
    }
  }

  export function getOrElse<a>(opt: Option<a>, defaultVal: a): a {
    match (opt) {
      Some(v) => v
      None => defaultVal
    }
  }

  export function orElse<a>(opt: Option<a>, altOpt: Option<a>): Option<a> {
    match (opt) {
      Some(_) => opt
      None => altOpt
    }
  }

  export function map<a, b>(opt: Option<a>, fn: (x: a) => b): Option<b> {
    match (opt) {
      Some(v) => Some(fn(v))
      None => None
    }
  }

  export function flatMap<a, b>(opt: Option<a>, fn: (x: a) => Option<b>): Option<b> {
    match (opt) {
      Some(v) => fn(v)
      None => None
    }
  }

  export function filter<a>(opt: Option<a>, pred: (x: a) => boolean): Option<a> {
    match (opt) {
      Some(v) => if (pred(v)) Some(v) else None
      None => None
    }
  }

  export function fold<a, b>(opt: Option<a>, defaultVal: b, fn: (x: a) => b): b {
    match (opt) {
      Some(v) => fn(v)
      None => defaultVal
    }
  }

  export function flatten<a>(opt: Option<Option<a>>): Option<a> {
    match (opt) {
      Some(inner) => inner
      None => None
    }
  }

  export function zip<a, b>(optA: Option<a>, optB: Option<b>): Option<(a, b)> {
    match (optA) {
      Some(a) => match (optB) {
        Some(b) => Some((a, b))
        None => None
      }
      None => None
    }
  }

  export function toResult<a, e>(opt: Option<a>, err: e): Result<a, e> {
    match (opt) {
      Some(v) => Ok(v)
      None => Err(err)
    }
  }

  export function contains<a>(opt: Option<a>, elem: a): boolean {
    match (opt) {
      Some(v) => v == elem
      None => false
    }
  }

  export function exists<a>(opt: Option<a>, pred: (x: a) => boolean): boolean {
    match (opt) {
      Some(v) => pred(v)
      None => false
    }
  }

  export function tap<a>(opt: Option<a>, fn: (x: a) => void): Option<a> {
    match (opt) {
      Some(v) => { fn(v); opt }
      None => None
    }
  }
}`,
    jsSource: `const $Some = (val) => Object.freeze({ $tag: "Some", val, $args: [val] });
const $None = Object.freeze({ $tag: "None", $args: [] });
const $Option = {
  Some: $Some,
  None: $None,
  pure: $Some,
  of: $Some,
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
};`,
    functions: [
      {
        name: 'pure',
        signature: 'pure<a>(val: a): Option<a>',
        description: 'Lifts a pure value into an Option by wrapping it with Some(val).',
        typeLangImpl: 'function pure<a>(val: a): Option<a> { Some(val) }',
        jsImpl: '(val) => $Some(val)',
        example: 'let opt = Option.pure(42) // Some(42)'
      },
      {
        name: 'map',
        signature: 'map<a, b>(opt: Option<a>, fn: (x: a) => b): Option<b>',
        description: 'Applies a function to the value inside Some, or returns None unchanged.',
        typeLangImpl: 'function map<a, b>(opt: Option<a>, fn: (x: a) => b): Option<b> {\n  match (opt) {\n    Some(v) => Some(fn(v))\n    None => None\n  }\n}',
        jsImpl: '(opt, fn) => (opt?.$tag === "Some" ? $Some(fn(opt.val)) : $None)',
        example: 'Option.map(Some(10), (x: number) => x * 2) // Some(20)'
      },
      {
        name: 'flatMap',
        signature: 'flatMap<a, b>(opt: Option<a>, fn: (x: a) => Option<b>): Option<b>',
        description: 'Sequences two monadic Option computations, propagating None if either fails.',
        typeLangImpl: 'function flatMap<a, b>(opt: Option<a>, fn: (x: a) => Option<b>): Option<b> {\n  match (opt) {\n    Some(v) => fn(v)\n    None => None\n  }\n}',
        jsImpl: '(opt, fn) => (opt?.$tag === "Some" ? fn(opt.val) : $None)',
        example: 'Option.flatMap(Some(10), (x: number) => if (x > 5) Some(x) else None)'
      },
      {
        name: 'getOrElse',
        signature: 'getOrElse<a>(opt: Option<a>, defaultVal: a): a',
        description: 'Extracts the value from Some, or returns defaultVal if None.',
        typeLangImpl: 'function getOrElse<a>(opt: Option<a>, defaultVal: a): a {\n  match (opt) {\n    Some(v) => v\n    None => defaultVal\n  }\n}',
        jsImpl: '(opt, defaultVal) => (opt?.$tag === "Some" ? opt.val : defaultVal)',
        example: 'Option.getOrElse(None, 100) // 100'
      },
      {
        name: 'filter',
        signature: 'filter<a>(opt: Option<a>, pred: (x: a) => boolean): Option<a>',
        description: 'Retains the value if Some and pred(val) is true, otherwise returns None.',
        typeLangImpl: 'function filter<a>(opt: Option<a>, pred: (x: a) => boolean): Option<a> {\n  match (opt) {\n    Some(v) => if (pred(v)) Some(v) else None\n    None => None\n  }\n}',
        jsImpl: '(opt, pred) => (opt?.$tag === "Some" && pred(opt.val) ? opt : $None)',
        example: 'Option.filter(Some(12), (x: number) => x % 2 == 0) // Some(12)'
      },
      {
        name: 'fold',
        signature: 'fold<a, b>(opt: Option<a>, defaultVal: b, fn: (x: a) => b): b',
        description: 'Applies fn if Some, or returns defaultVal if None.',
        typeLangImpl: 'function fold<a, b>(opt: Option<a>, defaultVal: b, fn: (x: a) => b): b {\n  match (opt) {\n    Some(v) => fn(v)\n    None => defaultVal\n  }\n}',
        jsImpl: '(opt, defaultVal, fn) => (opt?.$tag === "Some" ? fn(opt.val) : defaultVal)',
        example: 'Option.fold(Some("hello"), 0, (s: string) => String.len(s)) // 5'
      }
    ]
  },
  {
    id: 'Result',
    name: 'Result',
    category: 'Monad',
    tagline: 'Railway-oriented error handling with explicit failure values',
    description: 'Result is a type used for returning and propagating errors. It has two variants: Ok representing success and containing a value, and Err representing error and containing an error cause.',
    typeDefinition: `type Result<a, e> =
  | Ok(val: a): Result<a, e>
  | Err(err: e): Result<a, e>`,
    lawsDoc: {
      leftIdentity: 'flatMap(pure(x), f)  ===  f(x)',
      rightIdentity: 'flatMap(m, pure)  ===  m',
      associativity: 'flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))'
    },
    doNotationSnippet: `import Result.{ Ok, Err, map, mapError, getOrElse }

function safeCalculate(rawInput: string): Result<number, string> {
  do(Result) {
    num <- parseNumber(rawInput);
    positive <- if (num > 0) Ok(num) else Err("Number must be positive");
    reciprocal <- if (positive != 0) Ok(100 / positive) else Err("Division by zero");
    pure reciprocal * 2;
  }
}`,
    typeLangSource: `// Result Module Implementation in TypeLang
module Result {
  export function pure<a, e>(val: a): Result<a, e> {
    Ok(val)
  }

  export function of<a, e>(val: a): Result<a, e> {
    Ok(val)
  }

  export function isOk<a, e>(res: Result<a, e>): boolean {
    match (res) {
      Ok(_) => true
      Err(_) => false
    }
  }

  export function isErr<a, e>(res: Result<a, e>): boolean {
    match (res) {
      Ok(_) => false
      Err(_) => true
    }
  }

  export function getOrElse<a, e>(res: Result<a, e>, defaultVal: a): a {
    match (res) {
      Ok(v) => v
      Err(_) => defaultVal
    }
  }

  export function orElse<a, e>(res: Result<a, e>, altRes: Result<a, e>): Result<a, e> {
    match (res) {
      Ok(_) => res
      Err(_) => altRes
    }
  }

  export function map<a, b, e>(res: Result<a, e>, fn: (x: a) => b): Result<b, e> {
    match (res) {
      Ok(v) => Ok(fn(v))
      Err(err) => Err(err)
    }
  }

  export function mapError<a, e, e2>(res: Result<a, e>, fn: (err: e) => e2): Result<a, e2> {
    match (res) {
      Ok(v) => Ok(v)
      Err(err) => Err(fn(err))
    }
  }

  export function flatMap<a, b, e>(res: Result<a, e>, fn: (x: a) => Result<b, e>): Result<b, e> {
    match (res) {
      Ok(v) => fn(v)
      Err(err) => Err(err)
    }
  }

  export function fold<a, e, b>(res: Result<a, e>, onErr: (err: e) => b, onOk: (val: a) => b): b {
    match (res) {
      Ok(v) => onOk(v)
      Err(err) => onErr(err)
    }
  }

  export function toOption<a, e>(res: Result<a, e>): Option<a> {
    match (res) {
      Ok(v) => Some(v)
      Err(_) => None
    }
  }

  export function fromOption<a, e>(opt: Option<a>, err: e): Result<a, e> {
    match (opt) {
      Some(v) => Ok(v)
      None => Err(err)
    }
  }

  export function fromTry<a>(fn: () => a): Result<a, string> {
    // Wrapped with runtime try/catch
    Ok(fn())
  }
}`,
    jsSource: `const $Ok = (val) => Object.freeze({ $tag: "Ok", val, $args: [val] });
const $Err = (err) => Object.freeze({ $tag: "Err", err, $args: [err] });
const $Result = {
  Ok: $Ok,
  Err: $Err,
  pure: $Ok,
  of: $Ok,
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
};`,
    functions: [
      {
        name: 'pure',
        signature: 'pure<a, e>(val: a): Result<a, e>',
        description: 'Lifts a successful value into a Result by wrapping with Ok(val).',
        typeLangImpl: 'function pure<a, e>(val: a): Result<a, e> { Ok(val) }',
        jsImpl: '(val) => $Ok(val)',
        example: 'let res = Result.pure(200) // Ok(200)'
      },
      {
        name: 'map',
        signature: 'map<a, b, e>(res: Result<a, e>, fn: (x: a) => b): Result<b, e>',
        description: 'Transforms the successful Ok value, leaving Err untouched.',
        typeLangImpl: 'function map<a, b, e>(res: Result<a, e>, fn: (x: a) => b): Result<b, e> {\n  match (res) {\n    Ok(v) => Ok(fn(v))\n    Err(e) => Err(e)\n  }\n}',
        jsImpl: '(res, fn) => (res?.$tag === "Ok" ? $Ok(fn(res.val)) : res)',
        example: 'Result.map(Ok(10), (x: number) => x * 5) // Ok(50)'
      },
      {
        name: 'mapError',
        signature: 'mapError<a, e, e2>(res: Result<a, e>, fn: (err: e) => e2): Result<a, e2>',
        description: 'Transforms the error inside Err, leaving Ok untouched.',
        typeLangImpl: 'function mapError<a, e, e2>(res: Result<a, e>, fn: (err: e) => e2): Result<a, e2> {\n  match (res) {\n    Ok(v) => Ok(v)\n    Err(e) => Err(fn(e))\n  }\n}',
        jsImpl: '(res, fn) => (res?.$tag === "Err" ? $Err(fn(res.err)) : res)',
        example: 'Result.mapError(Err(404), (code: number) => concat("HTTP Error ", to_string(code)))'
      },
      {
        name: 'flatMap',
        signature: 'flatMap<a, b, e>(res: Result<a, e>, fn: (x: a) => Result<b, e>): Result<b, e>',
        description: 'Sequences fallible operations. If Ok, calls fn with the value; if Err, stops early.',
        typeLangImpl: 'function flatMap<a, b, e>(res: Result<a, e>, fn: (x: a) => Result<b, e>): Result<b, e> {\n  match (res) {\n    Ok(v) => fn(v)\n    Err(e) => Err(e)\n  }\n}',
        jsImpl: '(res, fn) => (res?.$tag === "Ok" ? fn(res.val) : res)',
        example: 'Result.flatMap(safeParse("10"), (n: number) => safeDivide(100, n))'
      },
      {
        name: 'fold',
        signature: 'fold<a, e, b>(res: Result<a, e>, onErr: (err: e) => b, onOk: (val: a) => b): b',
        description: 'Folds a Result into a single output by handling both Ok and Err cases.',
        typeLangImpl: 'function fold<a, e, b>(res: Result<a, e>, onErr: (err: e) => b, onOk: (val: a) => b): b {\n  match (res) {\n    Ok(v) => onOk(v)\n    Err(e) => onErr(e)\n  }\n}',
        jsImpl: '(res, onErr, onOk) => (res?.$tag === "Ok" ? onOk(res.val) : onErr(res.err))',
        example: 'Result.fold(res, (err: string) => 0, (val: number) => val)'
      }
    ]
  },
  {
    id: 'Either',
    name: 'Either',
    category: 'Monad',
    tagline: 'Disjoint union representing two possible types (Left or Right)',
    description: 'The Either type represents values with two possibilities: Left(a) or Right(b). By convention, Right is used to contain successful values, and Left contains error or auxiliary data.',
    typeDefinition: `type Either<l, r> =
  | Left(left: l): Either<l, r>
  | Right(right: r): Either<l, r>`,
    lawsDoc: {
      leftIdentity: 'flatMap(pure(x), f)  ===  f(x)',
      rightIdentity: 'flatMap(m, pure)  ===  m',
      associativity: 'flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))'
    },
    doNotationSnippet: `import Either.{ Left, Right, map, fold }

let computation = do(Either) {
  valA <- Right(10);
  valB <- Right(20);
  pure valA + valB;
}`,
    typeLangSource: `// Either Module Implementation in TypeLang
module Either {
  export function pure<l, r>(val: r): Either<l, r> {
    Right(val)
  }

  export function of<l, r>(val: r): Either<l, r> {
    Right(val)
  }

  export function left<l, r>(lVal: l): Either<l, r> {
    Left(lVal)
  }

  export function right<l, r>(rVal: r): Either<l, r> {
    Right(rVal)
  }

  export function isRight<l, r>(e: Either<l, r>): boolean {
    match (e) {
      Right(_) => true
      Left(_) => false
    }
  }

  export function isLeft<l, r>(e: Either<l, r>): boolean {
    match (e) {
      Right(_) => false
      Left(_) => true
    }
  }

  export function getOrElse<l, r>(e: Either<l, r>, defaultVal: r): r {
    match (e) {
      Right(v) => v
      Left(_) => defaultVal
    }
  }

  export function map<l, r, r2>(e: Either<l, r>, fn: (x: r) => r2): Either<l, r2> {
    match (e) {
      Right(v) => Right(fn(v))
      Left(lVal) => Left(lVal)
    }
  }

  export function mapLeft<l, r, l2>(e: Either<l, r>, fn: (err: l) => l2): Either<l2, r> {
    match (e) {
      Right(v) => Right(v)
      Left(lVal) => Left(fn(lVal))
    }
  }

  export function flatMap<l, r, r2>(e: Either<l, r>, fn: (x: r) => Either<l, r2>): Either<l, r2> {
    match (e) {
      Right(v) => fn(v)
      Left(lVal) => Left(lVal)
    }
  }

  export function fold<l, r, b>(e: Either<l, r>, onLeft: (l: l) => b, onRight: (r: r) => b): b {
    match (e) {
      Right(v) => onRight(v)
      Left(lVal) => onLeft(lVal)
    }
  }

  export function swap<l, r>(e: Either<l, r>): Either<r, l> {
    match (e) {
      Right(v) => Left(v)
      Left(lVal) => Right(lVal)
    }
  }
}`,
    jsSource: `const $Left = (left) => Object.freeze({ $tag: "Left", left, $args: [left] });
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
};`,
    functions: [
      {
        name: 'pure',
        signature: 'pure<l, r>(val: r): Either<l, r>',
        description: 'Lifts a value into Right(val).',
        typeLangImpl: 'function pure<l, r>(val: r): Either<l, r> { Right(val) }',
        jsImpl: '(val) => $Right(val)',
        example: 'Either.pure(42) // Right(42)'
      },
      {
        name: 'swap',
        signature: 'swap<l, r>(e: Either<l, r>): Either<r, l>',
        description: 'Swaps Left to Right and Right to Left.',
        typeLangImpl: 'function swap<l, r>(e: Either<l, r>): Either<r, l> {\n  match (e) {\n    Right(r) => Left(r)\n    Left(l) => Right(l)\n  }\n}',
        jsImpl: '(e) => (e.$tag === "Right" ? $Left(e.right) : $Right(e.left))',
        example: 'Either.swap(Left("err")) // Right("err")'
      }
    ]
  },
  {
    id: 'Reader',
    name: 'Reader',
    category: 'Monad',
    tagline: 'Dependency injection & environment propagation without global state',
    description: 'The Reader monad represents a computation that can read values from a shared environment r, pass it implicitly, and compute a result a.',
    typeDefinition: `type Reader<r, a> = {
  run: (environment: r) => a
}`,
    lawsDoc: {
      leftIdentity: 'flatMap(pure(x), f)  ===  f(x)',
      rightIdentity: 'flatMap(m, pure)  ===  m',
      associativity: 'flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))'
    },
    doNotationSnippet: `import Reader.{ ask, asks, run, local }

type Config = { host: string, port: number }

let buildUrl = do(Reader) {
  cfg <- Reader.ask();
  pure concat("https://", concat(cfg.host, concat(":", to_string(cfg.port))));
}

let endpoint = Reader.run(buildUrl, { host: "localhost", port: 8080 })`,
    typeLangSource: `// Reader Module Implementation in TypeLang
module Reader {
  export function pure<r, a>(val: a): Reader<r, a> {
    { run: (_env: r) => val }
  }

  export function ask<r>(): Reader<r, r> {
    { run: (env: r) => env }
  }

  export function asks<r, a>(fn: (env: r) => a): Reader<r, a> {
    { run: (env: r) => fn(env) }
  }

  export function run<r, a>(reader: Reader<r, a>, environment: r): a {
    reader.run(environment)
  }

  export function map<r, a, b>(reader: Reader<r, a>, fn: (x: a) => b): Reader<r, b> {
    { run: (env: r) => fn(reader.run(env)) }
  }

  export function flatMap<r, a, b>(reader: Reader<r, a>, fn: (x: a) => Reader<r, b>): Reader<r, b> {
    { run: (env: r) => {
        let val = reader.run(env);
        let nextReader = fn(val);
        nextReader.run(env)
      }
    }
  }

  export function local<r, r2, a>(reader: Reader<r, a>, transformEnv: (env: r2) => r): Reader<r2, a> {
    { run: (env: r2) => reader.run(transformEnv(env)) }
  }
}`,
    jsSource: `const $wrapReader = (fn) => ({ $tag: "Reader", run: typeof fn === "function" ? fn : (_r) => fn });
const $Reader = {
  pure: (v) => $wrapReader((_r) => v),
  of: (v) => $wrapReader((_r) => v),
  ask: () => $wrapReader((r) => r),
  asks: (fn) => $wrapReader((r) => typeof fn === "function" ? fn(r) : r),
  run: (reader, env) => (reader && typeof reader.run === "function" ? reader.run(env) : reader),
  map: (reader, fn) => $wrapReader((r) => { const v = reader && typeof reader.run === "function" ? reader.run(r) : reader; return typeof fn === "function" ? fn(v) : v; }),
  flatMap: (reader, fn) => $wrapReader((r) => { const v = reader && typeof reader.run === "function" ? reader.run(r) : reader; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run(r) : next; }),
  local: (reader, transformEnv) => $wrapReader((r) => { const tr = typeof transformEnv === "function" ? transformEnv(r) : r; return reader && typeof reader.run === "function" ? reader.run(tr) : reader; })
};`,
    functions: [
      {
        name: 'ask',
        signature: 'ask<r>(): Reader<r, r>',
        description: 'Retrieves the current ambient environment.',
        typeLangImpl: 'function ask<r>(): Reader<r, r> { { run: (env: r) => env } }',
        jsImpl: '() => $wrapReader((r) => r)',
        example: 'Reader.ask()'
      },
      {
        name: 'asks',
        signature: 'asks<r, a>(fn: (env: r) => a): Reader<r, a>',
        description: 'Projects a property or function out of the environment.',
        typeLangImpl: 'function asks<r, a>(fn: (env: r) => a): Reader<r, a> { { run: (env: r) => fn(env) } }',
        jsImpl: '(fn) => $wrapReader((r) => fn(r))',
        example: 'Reader.asks((c: Config) => c.port)'
      },
      {
        name: 'run',
        signature: 'run<r, a>(reader: Reader<r, a>, environment: r): a',
        description: 'Executes the Reader computation by supplying the environment.',
        typeLangImpl: 'function run<r, a>(reader: Reader<r, a>, environment: r): a { reader.run(environment) }',
        jsImpl: '(reader, env) => reader.run(env)',
        example: 'Reader.run(myReader, { token: "abc" })'
      }
    ]
  },
  {
    id: 'Writer',
    name: 'Writer',
    category: 'Monad',
    tagline: 'Pure functional accumulator and audit trail logging',
    description: 'The Writer monad allows accumulating an auxiliary log or monoid alongside a computed result, without mutating any global state.',
    typeDefinition: `type Writer<w, a> = {
  val: a,
  log: [w],
  run: () => (a, [w])
}`,
    lawsDoc: {
      leftIdentity: 'flatMap(pure(x), f)  ===  f(x)',
      rightIdentity: 'flatMap(m, pure)  ===  m',
      associativity: 'flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))'
    },
    doNotationSnippet: `import Writer.{ tell, run }

let loggedCompute = do(Writer) {
  _ <- Writer.tell("Parsing parameters");
  let val = 42;
  _ <- Writer.tell("Calculated master answer");
  pure val;
}

let result = Writer.run(loggedCompute)
let val = result[0]
let logs = result[1]`,
    typeLangSource: `// Writer Module Implementation in TypeLang
module Writer {
  export function pure<w, a>(val: a): Writer<w, a> {
    { val: val, log: [] }
  }

  export function tell<w>(entry: w): Writer<w, void> {
    { val: (), log: [entry] }
  }

  export function run<w, a>(writer: Writer<w, a>): (a, [w]) {
    (writer.val, writer.log)
  }

  export function value<w, a>(writer: Writer<w, a>): a {
    writer.val
  }

  export function log<w, a>(writer: Writer<w, a>): [w] {
    writer.log
  }

  export function map<w, a, b>(writer: Writer<w, a>, fn: (x: a) => b): Writer<w, b> {
    { val: fn(writer.val), log: writer.log }
  }

  export function flatMap<w, a, b>(writer: Writer<w, a>, fn: (x: a) => Writer<w, b>): Writer<w, b> {
    let next = fn(writer.val);
    { val: next.val, log: Array.concat(writer.log, next.log) }
  }
}`,
    jsSource: `const $wrapWriter = (val, log = []) => ({ $tag: "Writer", val, log: Array.isArray(log) ? log : [log], run: () => [val, Array.isArray(log) ? log : [log]] });
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
};`,
    functions: [
      {
        name: 'tell',
        signature: 'tell<w>(entry: w): Writer<w, void>',
        description: 'Appends a single log entry into the Writer accumulator.',
        typeLangImpl: 'function tell<w>(entry: w): Writer<w, void> { { val: (), log: [entry] } }',
        jsImpl: '(entry) => $wrapWriter(null, [entry])',
        example: 'Writer.tell("Step 1 done")'
      },
      {
        name: 'run',
        signature: 'run<w, a>(writer: Writer<w, a>): (a, [w])',
        description: 'Executes the Writer computation and returns a tuple of (value, logs).',
        typeLangImpl: 'function run<w, a>(writer: Writer<w, a>): (a, [w]) { (writer.val, writer.log) }',
        jsImpl: '(w) => [w.val, w.log]',
        example: 'let res = Writer.run(w)'
      }
    ]
  },
  {
    id: 'State',
    name: 'State',
    category: 'Monad',
    tagline: 'Pure stateful computation without mutable variables',
    description: 'The State monad models stateful computations as pure functions of type (s: State) => (result: a, nextState: s).',
    typeDefinition: `type State<s, a> = {
  run: (initialState: s) => (a, s)
}`,
    lawsDoc: {
      leftIdentity: 'flatMap(pure(x), f)  ===  f(x)',
      rightIdentity: 'flatMap(m, pure)  ===  m',
      associativity: 'flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))'
    },
    doNotationSnippet: `import State.{ get, set, modify, run }

let counterPipeline = do(State) {
  count <- State.get();
  _ <- State.set(count + 1);
  _ <- State.modify((s: number) => s * 10);
  pure count;
}

let result = State.run(counterPipeline, 5) // (5, 60)`,
    typeLangSource: `// State Module Implementation in TypeLang
module State {
  export function pure<s, a>(val: a): State<s, a> {
    { run: (s: s) => (val, s) }
  }

  export function get<s>(): State<s, s> {
    { run: (s: s) => (s, s) }
  }

  export function set<s>(newState: s): State<s, void> {
    { run: (_s: s) => ((), newState) }
  }

  export function modify<s>(fn: (s: s) => s): State<s, void> {
    { run: (s: s) => ((), fn(s)) }
  }

  export function run<s, a>(st: State<s, a>, initialState: s): (a, s) {
    st.run(initialState)
  }

  export function evalState<s, a>(st: State<s, a>, initialState: s): a {
    let r = st.run(initialState);
    r[0]
  }

  export function execState<s, a>(st: State<s, a>, initialState: s): s {
    let r = st.run(initialState);
    r[1]
  }

  export function map<s, a, b>(st: State<s, a>, fn: (x: a) => b): State<s, b> {
    { run: (s: s) => {
        let res = st.run(s);
        (fn(res[0]), res[1])
      }
    }
  }

  export function flatMap<s, a, b>(st: State<s, a>, fn: (x: a) => State<s, b>): State<s, b> {
    { run: (s: s) => {
        let res = st.run(s);
        let nextStateMonad = fn(res[0]);
        nextStateMonad.run(res[1])
      }
    }
  }
}`,
    jsSource: `const $wrapState = (fn) => ({ $tag: "State", run: typeof fn === "function" ? fn : (s) => [null, s] });
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
};`,
    functions: [
      {
        name: 'get',
        signature: 'get<s>(): State<s, s>',
        description: 'Fetches the current state value.',
        typeLangImpl: 'function get<s>(): State<s, s> { { run: (s: s) => (s, s) } }',
        jsImpl: '() => $wrapState((s) => [s, s])',
        example: 'State.get()'
      },
      {
        name: 'set',
        signature: 'set<s>(newState: s): State<s, void>',
        description: 'Replaces the existing state with newState.',
        typeLangImpl: 'function set<s>(newState: s): State<s, void> { { run: (_s: s) => ((), newState) } }',
        jsImpl: '(ns) => $wrapState((_s) => [null, ns])',
        example: 'State.set(100)'
      },
      {
        name: 'modify',
        signature: 'modify<s>(fn: (s: s) => s): State<s, void>',
        description: 'Modifies the current state with a transition function fn.',
        typeLangImpl: 'function modify<s>(fn: (s: s) => s): State<s, void> { { run: (s: s) => ((), fn(s)) } }',
        jsImpl: '(fn) => $wrapState((s) => [null, fn(s)])',
        example: 'State.modify((s: number) => s + 1)'
      }
    ]
  },
  {
    id: 'Task',
    name: 'Task',
    category: 'Monad',
    tagline: 'Lazy and composable asynchronous computations',
    description: 'The Task monad encapsulates lazy computations that produce a value when executed via Task.run().',
    typeDefinition: `type Task<a> = {
  run: () => a
}`,
    lawsDoc: {
      leftIdentity: 'flatMap(pure(x), f)  ===  f(x)',
      rightIdentity: 'flatMap(m, pure)  ===  m',
      associativity: 'flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))'
    },
    doNotationSnippet: `import Task.{ succeed, delay, run }

let asyncPipeline = do(Task) {
  raw <- Task.succeed(100);
  computed <- Task.delay(() => raw * 2);
  pure computed + 50;
}

let result = Task.run(asyncPipeline) // 250`,
    typeLangSource: `// Task Module Implementation in TypeLang
module Task {
  export function pure<a>(val: a): Task<a> {
    { run: () => val }
  }

  export function succeed<a>(val: a): Task<a> {
    { run: () => val }
  }

  export function delay<a>(fn: () => a): Task<a> {
    { run: fn }
  }

  export function run<a>(task: Task<a>): a {
    task.run()
  }

  export function map<a, b>(task: Task<a>, fn: (x: a) => b): Task<b> {
    { run: () => fn(task.run()) }
  }

  export function flatMap<a, b>(task: Task<a>, fn: (x: a) => Task<b>): Task<b> {
    { run: () => {
        let val = task.run();
        let nextTask = fn(val);
        nextTask.run()
      }
    }
  }
}`,
    jsSource: `const $wrapTask = (fn) => ({ $tag: "Task", run: typeof fn === "function" ? fn : () => fn });
const $Task = {
  pure: (v) => $wrapTask(() => v),
  of: (v) => $wrapTask(() => v),
  succeed: (v) => $wrapTask(() => v),
  delay: (fn) => $wrapTask(typeof fn === "function" ? fn : () => fn),
  run: (t) => (t && typeof t.run === "function" ? t.run() : t),
  map: (t, fn) => $wrapTask(() => { const v = t && typeof t.run === "function" ? t.run() : t; return typeof fn === "function" ? fn(v) : v; }),
  flatMap: (t, fn) => $wrapTask(() => { const v = t && typeof t.run === "function" ? t.run() : t; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run() : next; })
};`,
    functions: [
      {
        name: 'succeed',
        signature: 'succeed<a>(val: a): Task<a>',
        description: 'Creates a Task that immediately resolves to val upon execution.',
        typeLangImpl: 'function succeed<a>(val: a): Task<a> { { run: () => val } }',
        jsImpl: '(val) => $wrapTask(() => val)',
        example: 'Task.succeed("data")'
      },
      {
        name: 'run',
        signature: 'run<a>(task: Task<a>): a',
        description: 'Executes the task computation and returns the computed result.',
        typeLangImpl: 'function run<a>(task: Task<a>): a { task.run() }',
        jsImpl: '(task) => task.run()',
        example: 'Task.run(t)'
      }
    ]
  },
  {
    id: 'IO',
    name: 'IO',
    category: 'Monad',
    tagline: 'Deferred input/output and referentially transparent side-effects',
    description: 'The IO monad represents deferred I/O operations, ensuring pure functional code remains free of unmanaged side effects until IO.run() is invoked.',
    typeDefinition: `type IO<a> = {
  run: () => a
}`,
    lawsDoc: {
      leftIdentity: 'flatMap(pure(x), f)  ===  f(x)',
      rightIdentity: 'flatMap(m, pure)  ===  m',
      associativity: 'flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))'
    },
    doNotationSnippet: `import IO.{ println, delay, run }

let program = do(IO) {
  _ <- IO.println("Starting application...");
  time <- IO.delay(() => Date.now());
  _ <- IO.println(concat("Current timestamp: ", to_string(time)));
  pure 0;
}

IO.run(program)`,
    typeLangSource: `// IO Module Implementation in TypeLang
module IO {
  export function pure<a>(val: a): IO<a> {
    { run: () => val }
  }

  export function delay<a>(fn: () => a): IO<a> {
    { run: fn }
  }

  export function run<a>(io: IO<a>): a {
    io.run()
  }

  export function println(msg: string): IO<void> {
    { run: () => println(msg) }
  }

  export function map<a, b>(io: IO<a>, fn: (x: a) => b): IO<b> {
    { run: () => fn(io.run()) }
  }

  export function flatMap<a, b>(io: IO<a>, fn: (x: a) => IO<b>): IO<b> {
    { run: () => {
        let val = io.run();
        let nextIO = fn(val);
        nextIO.run()
      }
    }
  }
}`,
    jsSource: `const $wrapIO = (comp) => ({ $tag: "IO", run: typeof comp === "function" ? comp : () => comp });
const $IO = {
  pure: (v) => $wrapIO(() => v),
  of: (v) => $wrapIO(() => v),
  delay: (fn) => $wrapIO(typeof fn === "function" ? fn : () => fn),
  map: (io, fn) => $wrapIO(() => { const v = io && typeof io.run === "function" ? io.run() : io; return typeof fn === "function" ? fn(v) : v; }),
  flatMap: (io, fn) => $wrapIO(() => { const v = io && typeof io.run === "function" ? io.run() : io; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run() : next; }),
  run: (io) => (io && typeof io.run === "function" ? io.run() : io),
  println: (msg) => $wrapIO(() => console.log(String(msg)))
};`,
    functions: [
      {
        name: 'println',
        signature: 'println(msg: string): IO<void>',
        description: 'Creates a deferred IO operation to print a string message to console.',
        typeLangImpl: 'function println(msg: string): IO<void> { { run: () => println(msg) } }',
        jsImpl: '(msg) => $wrapIO(() => console.log(String(msg)))',
        example: 'IO.println("Hello World")'
      },
      {
        name: 'run',
        signature: 'run<a>(io: IO<a>): a',
        description: 'Executes the IO action, performing all deferred side effects.',
        typeLangImpl: 'function run<a>(io: IO<a>): a { io.run() }',
        jsImpl: '(io) => io.run()',
        example: 'IO.run(action)'
      }
    ]
  },
  {
    id: 'Array',
    name: 'Array',
    category: 'Core',
    tagline: 'Standard array and list manipulation utilities',
    description: 'High-performance collection methods for arrays including immutable transformation, mapping, filtering, reducing, slicing, and concatenating.',
    typeDefinition: `type Array<a> = [a]`,
    typeLangSource: `module Array {
  export extern function len<a>(arr: [a]): number
  export extern function map<a, b>(arr: [a], fn: (elem: a) => b): [b]
  export extern function filter<a>(arr: [a], pred: (elem: a) => boolean): [a]
  export extern function reduce<a, acc>(arr: [a], initial: acc, fn: (accumulator: acc, elem: a) => acc): acc
  export extern function push<a>(arr: [a], elem: a): [a]
  export extern function slice<a>(arr: [a], start: number, end: number): [a]
  export extern function concat<a>(a: [a], b: [a]): [a]
  export extern function join(arr: [string], separator: string): string
}`,
    jsSource: `const $Array = {
  len: (arr) => Array.isArray(arr) ? arr.length : 0,
  map: (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.map(fn) : [],
  filter: (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.filter(fn) : [],
  reduce: (arr, init, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.reduce(fn, init) : init,
  push: (arr, elem) => Array.isArray(arr) ? [...arr, elem] : [elem],
  slice: (arr, start, end) => Array.isArray(arr) ? arr.slice(start, end) : [],
  concat: (a, b) => Array.isArray(a) && Array.isArray(b) ? a.concat(b) : [],
  join: (arr, sep) => Array.isArray(arr) ? arr.join(sep) : ""
};`,
    functions: [
      {
        name: 'len',
        signature: 'len<a>(arr: [a]): number',
        description: 'Returns the number of elements in an array.',
        typeLangImpl: 'extern function len<a>(arr: [a]): number',
        jsImpl: '(arr) => arr.length',
        example: 'Array.len([1, 2, 3]) // 3'
      },
      {
        name: 'map',
        signature: 'map<a, b>(arr: [a], fn: (x: a) => b): [b]',
        description: 'Creates a new array by applying fn to every element.',
        typeLangImpl: 'extern function map<a, b>(arr: [a], fn: (x: a) => b): [b]',
        jsImpl: '(arr, fn) => arr.map(fn)',
        example: 'Array.map([1, 2, 3], (x: number) => x * 2)'
      },
      {
        name: 'filter',
        signature: 'filter<a>(arr: [a], pred: (x: a) => boolean): [a]',
        description: 'Filters array elements matching predicate pred.',
        typeLangImpl: 'extern function filter<a>(arr: [a], pred: (x: a) => boolean): [a]',
        jsImpl: '(arr, pred) => arr.filter(pred)',
        example: 'Array.filter([1, 2, 3, 4], (x: number) => x % 2 == 0)'
      },
      {
        name: 'reduce',
        signature: 'reduce<a, acc>(arr: [a], init: acc, fn: (acc: acc, x: a) => acc): acc',
        description: 'Reduces array to a single value using accumulator fn.',
        typeLangImpl: 'extern function reduce<a, acc>(arr: [a], init: acc, fn: (acc: acc, x: a) => acc): acc',
        jsImpl: '(arr, init, fn) => arr.reduce(fn, init)',
        example: 'Array.reduce([1, 2, 3], 0, (acc: number, x: number) => acc + x)'
      }
    ]
  },
  {
    id: 'String',
    name: 'String',
    category: 'Core',
    tagline: 'Text manipulation, parsing, and substring operations',
    description: 'Standard string utilities for computing string length, extracting substrings, splitting by delimiters, and parsing numbers.',
    typeDefinition: `type String = string`,
    typeLangSource: `module String {
  export extern function len(s: string): number
  export extern function slice(s: string, start: number, end: number): string
  export extern function split(s: string, delimiter: string): [string]
  export extern function contains(s: string, substr: string): boolean
  export extern function parseInt(s: string): number
  export extern function parseFloat(s: string): number
}`,
    jsSource: `const $String = {
  len: (s) => String(s).length,
  slice: (s, start, end) => String(s).slice(start, end),
  split: (s, delim) => String(s).split(delim),
  contains: (s, sub) => String(s).includes(sub),
  parseInt: (s) => Number.parseInt(String(s), 10),
  parseFloat: (s) => Number.parseFloat(String(s))
};`,
    functions: [
      {
        name: 'len',
        signature: 'len(s: string): number',
        description: 'Returns the character length of a string.',
        typeLangImpl: 'extern function len(s: string): number',
        jsImpl: '(s) => String(s).length',
        example: 'String.len("hello") // 5'
      },
      {
        name: 'split',
        signature: 'split(s: string, delimiter: string): [string]',
        description: 'Splits a string into a list of substrings separated by delimiter.',
        typeLangImpl: 'extern function split(s: string, delimiter: string): [string]',
        jsImpl: '(s, delim) => String(s).split(delim)',
        example: 'String.split("a,b,c", ",") // ["a", "b", "c"]'
      },
      {
        name: 'parseFloat',
        signature: 'parseFloat(s: string): number',
        description: 'Parses a string into a floating-point number.',
        typeLangImpl: 'extern function parseFloat(s: string): number',
        jsImpl: '(s) => Number.parseFloat(String(s))',
        example: 'String.parseFloat("3.14159") // 3.14159'
      }
    ]
  },
  {
    id: 'Math',
    name: 'Math',
    category: 'Core',
    tagline: 'Standard mathematical and trigonometric functions',
    description: 'Full suite of math operations: power, root, trigonometric functions, rounding, bitwise operations, and constants like PI.',
    typeDefinition: `module Math`,
    typeLangSource: `module Math {
  export extern function sqrt(x: number): number
  export extern function abs(x: number): number
  export extern function floor(x: number): number
  export extern function ceil(x: number): number
  export extern function round(x: number): number
  export extern function min(a: number, b: number): number
  export extern function max(a: number, b: number): number
  export extern function pow(base: number, exp: number): number
  export extern function random(): number
  export extern function cos(rad: number): number
  export extern function sin(rad: number): number
  export extern function atan2(y: number, x: number): number
  export extern function log(x: number): number
  export extern function bitwise_and(a: number, b: number): number
  export extern function bitwise_or(a: number, b: number): number
  export extern function bitwise_xor(a: number, b: number): number
  export extern function bitwise_not(x: number): number
  export extern function bitwise_shl(a: number, b: number): number
  export extern function bitwise_shr(a: number, b: number): number
  export let PI: number = 3.141592653589793
}`,
    jsSource: `const $Math = {
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
};`,
    functions: [
      {
        name: 'sqrt',
        signature: 'sqrt(x: number): number',
        description: 'Returns the square root of a number.',
        typeLangImpl: 'extern function sqrt(x: number): number',
        jsImpl: 'Math.sqrt',
        example: 'Math.sqrt(16) // 4'
      },
      {
        name: 'pow',
        signature: 'pow(base: number, exp: number): number',
        description: 'Returns base raised to the power of exp.',
        typeLangImpl: 'extern function pow(base: number, exp: number): number',
        jsImpl: 'Math.pow',
        example: 'Math.pow(2, 8) // 256'
      },
      {
        name: 'sin',
        signature: 'sin(rad: number): number',
        description: 'Returns the sine of an angle in radians.',
        typeLangImpl: 'extern function sin(rad: number): number',
        jsImpl: 'Math.sin',
        example: 'Math.sin(Math.PI / 2) // 1'
      }
    ]
  },
  {
    id: 'Setoid',
    name: 'Setoid',
    category: 'Algebraic',
    tagline: 'Equivalence relation abstraction for deep structural equality comparison',
    description: 'The Setoid abstraction represents data types with an equivalence relation satisfying reflexivity, symmetry, and transitivity.',
    typeDefinition: `type Setoid<a> = { equals: (x: a, y: a) => boolean }`,
    lawsDoc: {
      leftIdentity: 'equals(a, a) === true (Reflexivity)',
      rightIdentity: 'equals(a, b) === equals(b, a) (Symmetry)',
      associativity: 'if equals(a, b) && equals(b, c) then equals(a, c) (Transitivity)'
    },
    typeLangSource: `module Setoid {
  export function equals<a, b>(a: a, b: b): boolean
  export function notEquals<a, b>(a: a, b: b): boolean
  export function fromEquals<a>(eqFn: (x: a, y: a) => boolean): Setoid<a>
  export function contramap<a, b>(s: Setoid<b>, fn: (x: a) => b): Setoid<a>
}`,
    jsSource: `const $Setoid = {
  equals: (a, b) => $deepEquals(a, b),
  notEquals: (a, b) => !$deepEquals(a, b),
  fromEquals: (eqFn) => ({ equals: eqFn }),
  contramap: (setoid, fn) => ({ equals: (x, y) => setoid.equals(fn(x), fn(y)) })
};`,
    functions: [
      {
        name: 'equals',
        signature: 'equals<a, b>(a: a, b: b): boolean',
        description: 'Deep structural equality check across primitives, records, tuples, ADTs, and arrays.',
        typeLangImpl: 'extern function equals<a, b>(a: a, b: b): boolean',
        jsImpl: '(a, b) => $deepEquals(a, b)',
        example: 'Setoid.equals([1, 2, 3], [1, 2, 3]) // true'
      },
      {
        name: 'notEquals',
        signature: 'notEquals<a, b>(a: a, b: b): boolean',
        description: 'Negated equality comparison check.',
        typeLangImpl: 'extern function notEquals<a, b>(a: a, b: b): boolean',
        jsImpl: '(a, b) => !$deepEquals(a, b)',
        example: 'Setoid.notEquals("hello", "world") // true'
      },
      {
        name: 'contramap',
        signature: 'contramap<a, b>(setoid: Setoid<b>, fn: (x: a) => b): Setoid<a>',
        description: 'Derives a Setoid<a> from a Setoid<b> and a mapping function f: a -> b.',
        typeLangImpl: 'function contramap<a, b>(s: Setoid<b>, fn: (x: a) => b): Setoid<a>',
        jsImpl: '(setoid, fn) => ({ equals: (x, y) => setoid.equals(fn(x), fn(y)) })',
        example: 'let byId = Setoid.contramap(Setoid, (user) => user.id)'
      }
    ]
  },
  {
    id: 'Ord',
    name: 'Ord',
    category: 'Algebraic',
    tagline: 'Total ordering and comparison abstraction for sorting, clamping, and bounds',
    description: 'The Ord abstraction extends Setoid with total ordering relationships (Less, Equal, Greater).',
    typeDefinition: `type Ordering = Less | Equal | Greater
type Ord<a> = { compare: (x: a, y: a) => Ordering }`,
    typeLangSource: `module Ord {
  export function compare<a>(a: a, b: a): Ordering
  export function min<a>(a: a, b: a): a
  export function max<a>(a: a, b: a): a
  export function clamp<a>(val: a, minVal: a, maxVal: a): a
  export function between<a>(val: a, minVal: a, maxVal: a): boolean
  export function isLess<a>(a: a, b: a): boolean
  export function isGreater<a>(a: a, b: a): boolean
  export function isEqual<a>(a: a, b: a): boolean
  export function contramap<a, b>(ordB: Ord<b>, fn: (x: a) => b): Ord<a>
  export function reverse<a>(ord: Ord<a>): Ord<a>
}`,
    jsSource: `const $Ord = {
  compare: (a, b) => $compareVals(a, b),
  min: (a, b) => ($compareVals(a, b) === $OrderingLess ? a : b),
  max: (a, b) => ($compareVals(a, b) === $OrderingGreater ? a : b),
  clamp: (val, minVal, maxVal) => ($compareVals(val, minVal) === $OrderingLess ? minVal : ($compareVals(val, maxVal) === $OrderingGreater ? maxVal : val)),
  between: (val, minVal, maxVal) => ($compareVals(val, minVal) !== $OrderingLess && $compareVals(val, maxVal) !== $OrderingGreater),
  reverse: (ord) => ({ compare: (x, y) => ord.compare(y, x) })
};`,
    functions: [
      {
        name: 'compare',
        signature: 'compare<a>(a: a, b: a): Ordering',
        description: 'Compares two values returning Less, Equal, or Greater.',
        typeLangImpl: 'extern function compare<a>(a: a, b: a): Ordering',
        jsImpl: '(a, b) => $compareVals(a, b)',
        example: 'Ord.compare(10, 20) // Less'
      },
      {
        name: 'clamp',
        signature: 'clamp<a>(val: a, minVal: a, maxVal: a): a',
        description: 'Restricts a value within a lower and upper bound.',
        typeLangImpl: 'function clamp<a>(val: a, minVal: a, maxVal: a): a',
        jsImpl: '(val, minVal, maxVal) => ...',
        example: 'Ord.clamp(150, 0, 100) // 100'
      },
      {
        name: 'between',
        signature: 'between<a>(val: a, minVal: a, maxVal: a): boolean',
        description: 'Checks whether a value is inclusively within bounds.',
        typeLangImpl: 'function between<a>(val: a, minVal: a, maxVal: a): boolean',
        jsImpl: '(val, minVal, maxVal) => ...',
        example: 'Ord.between(5, 1, 10) // true'
      }
    ]
  },
  {
    id: 'Semigroup',
    name: 'Semigroup',
    category: 'Algebraic',
    tagline: 'Associative binary combination operation abstraction',
    description: 'A Semigroup is an algebraic structure with an associative binary operation `combine(a, b)`. Also accessible via alias `SemiGroup`.',
    typeDefinition: `type Semigroup<a> = { combine: (x: a, y: a) => a }`,
    lawsDoc: {
      leftIdentity: '',
      rightIdentity: '',
      associativity: 'combine(combine(a, b), c) === combine(a, combine(b, c))'
    },
    typeLangSource: `module Semigroup {
  export function combine<a>(a: a, b: a): a
  export function concatAll<a>(list: Array<a>, fallback: a): a
  export function first<a>(): Semigroup<a>
  export function last<a>(): Semigroup<a>
  export function struct<a>(semigroups: a): Semigroup<a>
  export function dual<a>(s: Semigroup<a>): Semigroup<a>
}`,
    jsSource: `const $Semigroup = {
  combine: (a, b) => $combineSemigroup(a, b),
  concatAll: (list, fallback) => (list.length === 0 ? fallback : list.reduce($combineSemigroup)),
  dual: (s) => ({ combine: (a, b) => s.combine(b, a) })
};`,
    functions: [
      {
        name: 'combine',
        signature: 'combine<a>(a: a, b: a): a',
        description: 'Combines two elements using structural or primitive semigroup addition/concatenation.',
        typeLangImpl: 'extern function combine<a>(a: a, b: a): a',
        jsImpl: '(a, b) => $combineSemigroup(a, b)',
        example: 'Semigroup.combine("Hello ", "World") // "Hello World"'
      },
      {
        name: 'concatAll',
        signature: 'concatAll<a>(list: Array<a>, fallback: a): a',
        description: 'Reduces an array of elements using the semigroup operation.',
        typeLangImpl: 'function concatAll<a>(list: Array<a>, fallback: a): a',
        jsImpl: '(list, fallback) => list.reduce($combineSemigroup, fallback)',
        example: 'Semigroup.concatAll([1, 2, 3, 4], 0) // 10'
      }
    ]
  },
  {
    id: 'Monoid',
    name: 'Monoid',
    category: 'Algebraic',
    tagline: 'Semigroup with an identity element (empty value)',
    description: 'A Monoid is an associative semigroup equipped with a identity element `empty` such that `combine(empty, x) === x === combine(x, empty)`.',
    typeDefinition: `type Monoid<a> = { empty: () => a, combine: (x: a, y: a) => a }`,
    lawsDoc: {
      leftIdentity: 'combine(empty(), x) === x',
      rightIdentity: 'combine(x, empty()) === x',
      associativity: 'combine(combine(a, b), c) === combine(a, combine(b, c))'
    },
    typeLangSource: `module Monoid {
  export function empty<a>(typeOrName: string): a
  export function combine<a>(a: a, b: a): a
  export function concatAll<a>(list: Array<a>, identity: a): a
  export const Sum: Monoid<number>
  export const Product: Monoid<number>
  export const String: Monoid<string>
  export const Array: Monoid<any>
  export const All: Monoid<boolean>
  export const Any: Monoid<boolean>
  export function struct<a>(monoids: a): Monoid<a>
}`,
    jsSource: `const $Monoid = {
  empty: (typeOrName) => $monoidEmptyMap[typeOrName],
  combine: $combineSemigroup,
  concatAll: (list, identity) => list.reduce($combineSemigroup, identity),
  Sum: { empty: () => 0, combine: (a, b) => a + b },
  Product: { empty: () => 1, combine: (a, b) => a * b },
  All: { empty: () => true, combine: (a, b) => a && b }
};`,
    functions: [
      {
        name: 'concatAll',
        signature: 'concatAll<a>(list: Array<a>, identity: a): a',
        description: 'Aggregates a list of monoidal values, returning identity if list is empty.',
        typeLangImpl: 'function concatAll<a>(list: Array<a>, identity: a): a',
        jsImpl: '(list, identity) => list.reduce($combineSemigroup, identity)',
        example: 'Monoid.concatAll(["a", "b", "c"], "") // "abc"'
      },
      {
        name: 'struct',
        signature: 'struct<a>(monoids: a): Monoid<a>',
        description: 'Combines a record of monoids into a monoid for the record shape.',
        typeLangImpl: 'function struct<a>(monoids: a): Monoid<a>',
        jsImpl: '(monoids) => ({ empty: ..., combine: ... })',
        example: 'let StatsMonoid = Monoid.struct({ count: Monoid.Sum, label: Monoid.String })'
      }
    ]
  },
  {
    id: 'Group',
    name: 'Group',
    category: 'Algebraic',
    tagline: 'Monoid equipped with an inverse operation (invert / subtract)',
    description: 'A Group extends a Monoid with an inverse operation `invert(x)` such that `combine(x, invert(x)) === empty()`.',
    typeDefinition: `type Group<a> = { empty: () => a, combine: (x: a, y: a) => a, invert: (x: a) => a }`,
    lawsDoc: {
      leftIdentity: 'combine(empty(), x) === x',
      rightIdentity: 'combine(x, empty()) === x',
      associativity: 'combine(combine(a, b), c) === combine(a, combine(b, c))',
      inverse: 'combine(x, invert(x)) === empty()'
    },
    typeLangSource: `module Group {
  export function invert<a>(a: a): a
  export function subtract<a>(a: a, b: a): a
  export const SumNumber: Group<number>
  export const ProductNonZero: Group<number>
}`,
    jsSource: `const $Group = {
  invert: (a) => (typeof a === "number" ? -a : a.invert()),
  subtract: (a, b) => a - b,
  SumNumber: { empty: () => 0, combine: (a, b) => a + b, invert: (a) => -a }
};`,
    functions: [
      {
        name: 'invert',
        signature: 'invert<a>(a: a): a',
        description: 'Returns the inverse element of a group member.',
        typeLangImpl: 'function invert<a>(a: a): a',
        jsImpl: '(a) => (typeof a === "number" ? -a : a.invert())',
        example: 'Group.invert(42) // -42'
      },
      {
        name: 'subtract',
        signature: 'subtract<a>(a: a, b: a): a',
        description: 'Subtracts b from a by combining a with the inverse of b.',
        typeLangImpl: 'function subtract<a>(a: a, b: a): a',
        jsImpl: '(a, b) => a - b',
        example: 'Group.subtract(100, 25) // 75'
      }
    ]
  },
  {
    id: 'Functor',
    name: 'Functor',
    category: 'Algebraic',
    tagline: 'Mapping interface for wrapped / parameterized container structures',
    description: 'A Functor allows mapping functions over data wrapped in containers (Option, Result, Either, Array, Task, State, etc.).',
    typeDefinition: `type Functor<f> = { map: <a, b>(fa: f<a>, fn: (x: a) => b) => f<b> }`,
    lawsDoc: {
      leftIdentity: 'map(fa, (x) => x) === fa (Identity)',
      associativity: 'map(map(fa, f), g) === map(fa, (x) => g(f(x))) (Composition)'
    },
    typeLangSource: `module Functor {
  export function map<f, a, b>(fa: f<a>, fn: (x: a) => b): f<b>
  export function lift<f, a, b>(fn: (x: a) => b): (fa: f<a>) => f<b>
  export function as<f, a, b>(fa: f<a>, val: b): f<b>
  export function voidRight<f, a>(fa: f<a>): f<null>
  export function flap<f, a, b>(fab: f<(x: a) => b>, a: a): f<b>
}`,
    jsSource: `const $Functor = {
  map: $mapFunctor,
  lift: (fn) => (fa) => $mapFunctor(fa, fn),
  as: (fa, val) => $mapFunctor(fa, () => val)
};`,
    functions: [
      {
        name: 'map',
        signature: 'map<f, a, b>(fa: f<a>, fn: (x: a) => b): f<b>',
        description: 'Applies a function to the inner value(s) of any functor object.',
        typeLangImpl: 'extern function map<f, a, b>(fa: f<a>, fn: (x: a) => b): f<b>',
        jsImpl: '(fa, fn) => $mapFunctor(fa, fn)',
        example: 'Functor.map(Some(5), (x) => x * 2) // Some(10)'
      },
      {
        name: 'lift',
        signature: 'lift<f, a, b>(fn: (x: a) => b): (fa: f<a>) => f<b>',
        description: 'Lifts an un-wrapped function a -> b to a functor function f<a> -> f<b>.',
        typeLangImpl: 'function lift<f, a, b>(fn: (x: a) => b): (fa: f<a>) => f<b>',
        jsImpl: '(fn) => (fa) => $mapFunctor(fa, fn)',
        example: 'let doubleOpt = Functor.lift((x: number) => x * 2)'
      }
    ]
  },
  {
    id: 'Contravariant',
    name: 'Contravariant',
    category: 'Algebraic',
    tagline: 'Contravariant functor mapping inputs for consumer/predicate structures',
    description: 'A Contravariant functor maps over function argument positions (inputs) rather than outputs (e.g. Predicate, Setoid, Ord, Encoder).',
    typeDefinition: `type Contravariant<f> = { contramap: <a, b>(fa: f<b>, fn: (x: a) => b) => f<a> }`,
    typeLangSource: `module Contravariant {
  export function contramap<f, a, b>(fa: f<b>, fn: (x: a) => b): f<a>
  export function cmap<f, a, b>(fa: f<b>, fn: (x: a) => b): f<a>
  export function predicate<a>(pred: (x: a) => boolean): any
}`,
    jsSource: `const $Contravariant = {
  contramap: (fa, fn) => (x) => fa(fn(x)),
  predicate: (pred) => ({ run: pred, cmap: (fn) => (x) => pred(fn(x)) })
};`,
    functions: [
      {
        name: 'contramap',
        signature: 'contramap<f, a, b>(fa: f<b>, fn: (x: a) => b): f<a>',
        description: 'Pre-composes an input transformation function fn: a -> b onto a consumer/predicate f<b>.',
        typeLangImpl: 'function contramap<f, a, b>(fa: f<b>, fn: (x: a) => b): f<a>',
        jsImpl: '(fa, fn) => (x) => fa(fn(x))',
        example: 'let isEvenUser = Contravariant.contramap((n: number) => n % 2 == 0, (user) => user.age)'
      }
    ]
  },
  {
    id: 'Applicative',
    name: 'Applicative',
    category: 'Algebraic',
    tagline: 'Applicative functors with pure injection and curried function application (ap)',
    description: 'Applicative functors allow applying wrapped functions to wrapped arguments independently and combining multiple effects.',
    typeDefinition: `type Applicative<f> = { pure: <a>(x: a) => f<a>, ap: <a, b>(ff: f<(x: a) => b>, fa: f<a>) => f<b> }`,
    lawsDoc: {
      leftIdentity: 'ap(pure(f), pure(x)) === pure(f(x)) (Identity)',
      associativity: 'ap(pure((f) => (x) => f(x)), fa) === fa'
    },
    typeLangSource: `module Applicative {
  export function pure<a>(val: a): Option<a>
  export function ap<f, a, b>(ff: f<(x: a) => b>, fa: f<a>): f<b>
  export function lift2<f, a, b, c>(fn: (x: a, y: b) => c, fa: f<a>, fb: f<b>): f<c>
  export function lift3<f, a, b, c, d>(fn: (x: a, y: b, z: c) => d, fa: f<a>, fb: f<b>, fc: f<c>): f<d>
  export function zip<f, a, b>(fa: f<a>, fb: f<b>): f<[a, b]>
}`,
    jsSource: `const $Applicative = {
  pure: $Some,
  ap: $apApplicative,
  lift2: (fn, fa, fb) => $apApplicative($mapFunctor(fa, (a) => (b) => fn(a, b)), fb),
  zip: (fa, fb) => $apApplicative($mapFunctor(fa, (a) => (b) => [a, b]), fb)
};`,
    functions: [
      {
        name: 'ap',
        signature: 'ap<f, a, b>(ff: f<(x: a) => b>, fa: f<a>): f<b>',
        description: 'Applies a wrapped function ff to a wrapped value fa.',
        typeLangImpl: 'extern function ap<f, a, b>(ff: f<(x: a) => b>, fa: f<a>): f<b>',
        jsImpl: '(ff, fa) => $apApplicative(ff, fa)',
        example: 'Applicative.ap(Some((x) => x + 10), Some(5)) // Some(15)'
      },
      {
        name: 'lift2',
        signature: 'lift2<f, a, b, c>(fn: (x: a, y: b) => c, fa: f<a>, fb: f<b>): f<c>',
        description: 'Lifts a binary function (a, b) -> c to operate over two applicative structures.',
        typeLangImpl: 'function lift2<f, a, b, c>(fn: (x: a, y: b) => c, fa: f<a>, fb: f<b>): f<c>',
        jsImpl: '(fn, fa, fb) => ...',
        example: 'Applicative.lift2((x, y) => x + y, Some(3), Some(4)) // Some(7)'
      }
    ]
  },
  {
    id: 'Validation',
    name: 'Validation',
    category: 'Algebraic',
    tagline: 'Error-accumulating Applicative structure for form & request validation',
    description: 'Unlike Result/Either (which short-circuits on first error), Validation accumulates ALL errors using a semigroup list.',
    typeDefinition: `type Validation<a> = Valid(val: a) | Invalid(errs: Array<any>)`,
    typeLangSource: `module Validation {
  export function Valid<a>(val: a): Validation<a>
  export function Invalid<e>(errs: Array<e>): Validation<any>
  export function pure<a>(val: a): Validation<a>
  export function invalid<e>(err: e): Validation<any>
  export function isValid<a>(v: Validation<a>): boolean
  export function isInvalid<a>(v: Validation<a>): boolean
  export function map<a, b>(v: Validation<a>, fn: (x: a) => b): Validation<b>
  export function ap<a, b>(vf: Validation<(x: a) => b>, va: Validation<a>): Validation<b>
  export function accumulate<a, b, c>(v1: Validation<a>, v2: Validation<b>, fn: (x: a, y: b) => c): Validation<c>
  export function getOrElse<a>(v: Validation<a>, defaultVal: a): a
  export function toResult<a>(v: Validation<a>): Result<a, any>
}`,
    jsSource: `const $Validation = {
  Valid: $Valid,
  Invalid: $Invalid,
  pure: $Valid,
  invalid: (err) => $Invalid([err]),
  accumulate: (v1, v2, fn) => {
    if (v1.$tag === 'Valid' && v2.$tag === 'Valid') return $Valid(fn(v1.val, v2.val));
    return $Invalid([...(v1.errs || []), ...(v2.errs || [])]);
  }
};`,
    functions: [
      {
        name: 'accumulate',
        signature: 'accumulate<a, b, c>(v1: Validation<a>, v2: Validation<b>, fn: (x: a, y: b) => c): Validation<c>',
        description: 'Combines two validations, gathering errors from both if invalid.',
        typeLangImpl: 'function accumulate<a, b, c>(v1: Validation<a>, v2: Validation<b>, fn: (x: a, y: b) => c): Validation<c>',
        jsImpl: '(v1, v2, fn) => ...',
        example: 'Validation.accumulate(Invalid(["Name missing"]), Invalid(["Age must be positive"]), User)'
      }
    ]
  },
  {
    id: 'Bifunctor',
    name: 'Bifunctor',
    category: 'Algebraic',
    tagline: 'Mapping two covariant type parameters independently (Result, Either, Tuple)',
    description: 'A Bifunctor is a container with two type parameters (e.g. Either<l, r>, Result<a, e>) allowing mapping both sides simultaneously via `bimap(fab, f, g)`.',
    typeDefinition: `type Bifunctor<f> = { bimap: <a, b, c, d>(fab: f<a, b>, f: (x: a) => c, g: (y: b) => d) => f<c, d> }`,
    typeLangSource: `module Bifunctor {
  export function bimap<f, a, b, c, d>(fab: f<a, b>, f: (x: a) => c, g: (y: b) => d): f<c, d>
}`,
    jsSource: `const $Bifunctor = {
  bimap: (fab, f, g) => (fab.$tag === "Ok" ? $Ok(g(fab.val)) : $Err(f(fab.err)))
};`,
    functions: [
      {
        name: 'bimap',
        signature: 'bimap<f, a, b, c, d>(fab: f<a, b>, f: (x: a) => c, g: (y: b) => d): f<c, d>',
        description: 'Applies f to the left/error parameter and g to the right/value parameter.',
        typeLangImpl: 'function bimap<f, a, b, c, d>(fab: f<a, b>, f: (x: a) => c, g: (y: b) => d): f<c, d>',
        jsImpl: '(fab, f, g) => ...',
        example: 'Bifunctor.bimap(Ok(10), (e) => "Error: " + e, (v) => v * 2) // Ok(20)'
      }
    ]
  },
  {
    id: 'Profunctor',
    name: 'Profunctor',
    category: 'Algebraic',
    tagline: 'Contravariant on input and covariant on output (Functions, Kleisli arrows)',
    description: 'Profunctors map contravariantly over input positions and covariantly over output positions via `dimap(pab, f, g)`.',
    typeDefinition: `type Profunctor<p> = { dimap: <a, b, c, d>(pab: p<a, b>, f: (x: c) => a, g: (y: b) => d) => p<c, d> }`,
    typeLangSource: `module Profunctor {
  export function dimap<p, a, b, c, d>(pab: p<a, b>, f: (x: c) => a, g: (y: b) => d): p<c, d>
  export function promap<p, a, b, c, d>(pab: p<a, b>, f: (x: c) => a, g: (y: b) => d): p<c, d>
}`,
    jsSource: `const $Profunctor = {
  dimap: (pab, f, g) => (x) => g(pab(f(x)))
};`,
    functions: [
      {
        name: 'dimap',
        signature: 'dimap<p, a, b, c, d>(pab: p<a, b>, f: (x: c) => a, g: (y: b) => d): p<c, d>',
        description: 'Transforms a function/arrow pab by pre-processing input with f and post-processing output with g.',
        typeLangImpl: 'function dimap<p, a, b, c, d>(pab: p<a, b>, f: (x: c) => a, g: (y: b) => d): p<c, d>',
        jsImpl: '(pab, f, g) => (x) => g(pab(f(x)))',
        example: 'Profunctor.dimap((n: number) => n * 2, (str) => String.parseInt(str), (num) => "Res: " + to_string(num))'
      }
    ]
  },
  {
    id: 'Foldable',
    name: 'Foldable',
    category: 'Algebraic',
    tagline: 'Data structure traversal and reduction into summary values or monoids',
    description: 'Foldable structures can be collapsed into a single value using left fold or monoidal accumulation.',
    typeDefinition: `type Foldable<f> = { foldLeft: <a, b>(fa: f<a>, initial: b, fn: (acc: b, x: a) => b) => b }`,
    typeLangSource: `module Foldable {
  export function foldLeft<f, a, b>(fa: f<a>, initial: b, fn: (acc: b, x: a) => b): b
  export function foldMap<f, a, m>(fa: f<a>, monoid: Monoid<m>, fn: (x: a) => m): m
}`,
    jsSource: `const $Foldable = {
  foldLeft: (fa, initial, fn) => (Array.isArray(fa) ? fa.reduce(fn, initial) : initial),
  foldMap: (fa, monoid, fn) => fa.reduce((acc, x) => monoid.combine(acc, fn(x)), monoid.empty())
};`,
    functions: [
      {
        name: 'foldLeft',
        signature: 'foldLeft<f, a, b>(fa: f<a>, initial: b, fn: (acc: b, x: a) => b): b',
        description: 'Reduces any foldable structure (Array, Option, Result) from left to right.',
        typeLangImpl: 'function foldLeft<f, a, b>(fa: f<a>, initial: b, fn: (acc: b, x: a) => b): b',
        jsImpl: '(fa, initial, fn) => ...',
        example: 'Foldable.foldLeft([1, 2, 3, 4], 0, (acc, x) => acc + x) // 10'
      },
      {
        name: 'foldMap',
        signature: 'foldMap<f, a, m>(fa: f<a>, monoid: Monoid<m>, fn: (x: a) => m): m',
        description: 'Maps each element to a monoid and combines the results.',
        typeLangImpl: 'function foldMap<f, a, m>(fa: f<a>, monoid: Monoid<m>, fn: (x: a) => m): m',
        jsImpl: '(fa, monoid, fn) => ...',
        example: 'Foldable.foldMap(["a", "b", "c"], Monoid.String, (x) => x + "!") // "a!b!c!"'
      }
    ]
  },
  {
    id: 'DOM',
    name: 'DOM',
    category: 'Runtime',
    tagline: 'Reactive Virtual DOM & Browser Rendering System',
    description: 'Client-side web engine for mounting Virtual DOM components, interactive stateful UI, canvas 2D contexts, audio synthesis, and event listeners.',
    typeDefinition: `type VNode = { tag: string, props: any, children: [any], $vnode: boolean }`,
    typeLangSource: `module DOM {
  export extern function h(tag: string, props: any, children: [any]): VNode
  export extern function render(vnode: VNode, containerId: string): void
  export extern function getElementById(id: string): any
  export extern function createCanvas(id: string, width: number, height: number): any
  export extern function getAudioContext(): any
}`,
    jsSource: `const $DOM = {
  h: (tag, props, children) => ({ $vnode: true, tag, props: props || {}, children: Array.isArray(children) ? children : [children] }),
  render: (vnode, containerId) => { /* virtual dom reconciler */ },
  getElementById: (id) => typeof document !== 'undefined' ? document.getElementById(id) : null
};`,
    functions: [
      {
        name: 'h',
        signature: 'h(tag: string, props: any, children: [any]): VNode',
        description: 'Creates a Virtual DOM node element.',
        typeLangImpl: 'extern function h(tag: string, props: any, children: [any]): VNode',
        jsImpl: '(tag, props, children) => ({ $vnode: true, tag, props, children })',
        example: 'DOM.h("button", { onClick: () => count = count + 1 }, ["Click me"])'
      },
      {
        name: 'render',
        signature: 'render(vnode: VNode, containerId: string): void',
        description: 'Mounts and reconciles a Virtual DOM root inside a container element.',
        typeLangImpl: 'extern function render(vnode: VNode, containerId: string): void',
        jsImpl: '(vnode, containerId) => { /* DOM mount */ }',
        example: 'DOM.render(appView, "root")'
      }
    ]
  },
  {
    id: 'Node',
    name: 'Node',
    category: 'Runtime',
    tagline: 'Server-side Express microservice & filesystem runtime',
    description: 'Server runtime providing HTTP server creation, routing, JSON response emission, asynchronous file read/write operations, and port listening.',
    typeDefinition: `module Node`,
    typeLangSource: `module Node {
  export extern function createServer(): any
  export extern function get(server: any, path: string, handler: (req: any, res: any) => void): void
  export extern function post(server: any, path: string, handler: (req: any, res: any) => void): void
  export extern function listen(server: any, port: number, callback: () => void): void
  export extern function readFile(path: string): string
  export extern function writeFile(path: string, content: string): void
  export extern function json(res: any, data: any): void
}`,
    jsSource: `const $Node = {
  createServer: () => ({ routes: [] }),
  readFile: (path) => "mock file content",
  writeFile: (path, content) => {},
  listen: (server, port, cb) => { if (typeof cb === 'function') cb(); }
};`,
    functions: [
      {
        name: 'createServer',
        signature: 'createServer(): any',
        description: 'Instantiates a new HTTP microservice server instance.',
        typeLangImpl: 'extern function createServer(): any',
        jsImpl: '() => ({ routes: [] })',
        example: 'let app = Node.createServer()'
      },
      {
        name: 'listen',
        signature: 'listen(server: any, port: number, callback: () => void): void',
        description: 'Starts the server listening on the specified port.',
        typeLangImpl: 'extern function listen(server: any, port: number, callback: () => void): void',
        jsImpl: '(server, port, cb) => cb()',
        example: 'Node.listen(app, 3000, () => println("Server running on port 3000"))'
      }
    ]
  }
];
