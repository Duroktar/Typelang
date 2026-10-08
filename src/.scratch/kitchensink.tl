// THE ULTIMATE TYPELANG FEATURE TOUR
// This file intentionally lists and demonstrates the implemented language surface.
/* Block comments are also accepted by the lexer. */
// Lexing: identifiers/keywords, decimal numbers, booleans, quoted strings and escapes,
// // line comments, /* block comments */, whitespace, and source locations.
// Declarations: let/let mut, annotations, functions, exports, modules, imports, extern.
// Types: aliases, records, tuples, arrays, ADTs/GADTs, generics, function types,
// higher-rank and higher-kinded types, type lambdas, and existential-style packages.
// Expressions: literals, calls, lambdas, blocks, records/spread/methods, arrays/tuples,
// indexing/fields, arithmetic/comparison/logical/assignment/range/ternary operators.
// Control: if/else, while/for, return, break/continue, switch/case/default/fallthrough.
// Patterns: constructors, variables, wildcard, literals, tuples, records, guards, as, ... .
// Functional syntax: list comprehensions, do/bind/pure and function/expression where.
// Standard modules are sampled below; see examples 46 and 47 for their full showcase.

// 1. Modules, exports, selected imports, and nested declarations.
module UltimateKit {
  export type Badge =
    | Star(level: number): Badge
    | Plain: Badge

  export function square(n: number): number {
    n * n
  }

  module Text {
    export function greet(who: string): string {
      concat("Hello, ", who)
    }
  }
}

import UltimateKit.{ Badge, square as squareFromKit }
import UltimateKit.Text.{ greet }
import UltimateKit as UK

// Extern declarations describe host bindings. This signature is intentionally not
// called: available host globals depend on where the example is run.
extern module "ultimate-host" as Host {
  function notify(message: string): void
  type Handle = number
  let version: string
}

// 2. Type aliases, structural record/tuple/function types, and type constructors.
type UserId = number
type User = { name: string, age: number, mut score: number }
type PreviewMetadata = { caption?: string }
type Pair<A, B> = [A, B]
type OptionBox<T> =
  | Box(value: T): OptionBox<T>
  | Empty: OptionBox<T>

// GADT result indices refine the result type in each constructor arm.
type Term<a> =
  | NumberTerm(value: number): Term<number>
  | SumTerm(left: Term<number>, right: Term<number>): Term<number>

function evaluateNumber(term: Term<number>): number {
  match (term) {
    NumberTerm(value) => value
    SumTerm(left, right) => evaluateNumber(left) + evaluateNumber(right)
  }
}
function printPlusOne(value: number) { println(to_string(value + 1)) }
function earlyReturn(value: number): number {
  if (value > 0) { return value }
  return 0
}
function bareReturn(): void { return }

// Higher-kinded type constructor parameter and a polymorphic function type.
type Mapper<F: * -> *> = {
  map: <A, B>(value: F<A>, f: (x: A) => B) => F<B>
}
function usePolymorphic(f: <A>(x: A) => A): [number, string] {
  [f(7), f("rank-2")]
}
function identity<A>(value: A): A { value }

// Type lambdas have syntax <a> => Type<a>; the body is represented at the type level.
type OptionalConstructor = <A> => Option<A>

// 3. Functions, generic inference, typed/inferred lambdas, closures, and existential packs.
function makePair<A, B>(left: A, right: B): Pair<A, B> { [left, right] }
function apply<A, B>(callback: (value: A) => B, value: A): B { callback(value) }
let shortLambda = fn(value: number) => value * 3

type Packed =
  | Pack<A>(value: A, show: (x: A) => string): Packed
function showPacked(value: Packed): string {
  match (value) {
    Pack(item, show) => show(item)
  }
}

// 4. Record literals, shorthand/mutable fields, methods, field access, spread/update.
let typedUser: User = { name: "Ada", age: 36, mut score: 10 }
let name = "Ada"
let shorthandRecord = { name }
let user = {
  name: "Ada", age: 36, mut score: 10,
  celebrate(self): void { self.score += 1 },
  summary(self): string { concat(self.name, " the builder") }
}
user.celebrate()
let revisedUser = { ...user, age: user.age + 1 }

// 5. Arrays, tuples, indexing, ranges, list comprehensions, and higher-order calls.
let pair = makePair(3, "three")
let numbers: number[] = [1, 2, 3, 4, 5]
let first = numbers[0]
let oddsSquared = [n * n for n in 1..=5 if n % 2 != 0]
let exclusiveRange = [2..5]
let total = numbers.reduce((acc: number, n: number) => acc + n, 0)

// 6. Operators, ternary, blocks, conditionals, loops, mutation, break and continue.
let mut counter: number = 0
counter = counter + 1
counter += 2
counter -= 1
counter *= 3
counter /= 2
let logical = counter > 0 && !(counter == 99) || false
let label = logical ? "ready" : "waiting"
let blockValue = {
  let base = 4
  base * base
}
let thenValue = if counter > 0 then "positive" else "zero"

if (counter >= 1) {
  counter += 1
} else if (counter == 0) {
  counter = 1
} else {
  counter = 2
}

let mut loopTotal = 0
for (let mut i = 0; i < 6; i += 1) {
  if (i == 1) { continue }
  if (i == 5) { break }
  loopTotal += i
}
let mut countdown = 2
while (countdown > 0) {
  countdown -= 1
}

// 7. Switch expression forms: single/default, stacked and comma-separated labels.
let dayKind = switch (5) {
  case 1, 2, 3, 4, 5: "weekday"
  case 6:
  case 7: "weekend"
  default: "unknown"
}
function fallThroughDemo(code: number): void {
  switch (code) {
    case 1: {
      println("case 1 falls through")
      continue
    }
    case 2: {
      println("case 2 reached")
    }
    default: {
      println("default reached")
    }
  }
}

// 8. Pattern forms: guards, aliases, tuples, records, literals, variables and fallback.
type Shape =
  | Circle(radius: number): Shape
  | Rectangle(width: number, height: number): Shape
  | Dot: Shape
function describe(shape: Shape): string {
  match (shape) {
    Circle(radius) as original if radius > 10 => "large circle"
    Circle(radius) => "small circle"
    Rectangle(width, height) if width == height => "square"
    Rectangle(_, _) => "rectangle"
    Dot => "dot"
    ... => "other shape"
  }
}
function describePair(value: [number, string]): string {
  match (value) {
    [n, text] => concat(text, to_string(n))
  }
}
function readRecord(value: { name: string, age: number }): string {
  match (value) {
    { name: personName, age: personAge } => concat(personName, to_string(personAge))
  }
}
function literalMatch(value: number): string {
  match (value) {
    0 => "zero"
    1 => "one"
    other => concat("number ", to_string(other))
  }
}

// 9. Return values, generic ADTs, imported declarations and built-in modules.
function lookup(id: UserId): OptionBox<string> {
  if (id == 1) { Box("found") } else { Empty }
}
let selectedText = "typelang".toUpperCase()
let clipped = Math.min(10, numbers[4])
let maybe: Option<number> = Option.Some(42)
let maybeText = Option.map(maybe, (n: number) => to_string(n))

// 10. Do notation: monadic bind (<-), local let and pure.
let computation = do(Option) {
  value <- maybe;
  let incremented = value + 1;
  pure incremented * 2;
}
let returnedComputation = do(Option) {
  return Option.Some(7);
}

// 11. Function-level and expression-level where scopes.
function report(value: number): string {
  render(value)
} where {
  function render(n: number): string { concat("value=", to_string(n)) }
}
let scopedResult = (left + right) where {
  let left = 20
  let right = 22
}

// 12. Execute the tour and make each group of features observable.
println("=== Ultimate TypeLang Feature Tour ===")
let escapedText = "line\\nnext\\tcolumn"
println(concat("module/import + helper: ", to_string(squareFromKit(6))))
println(concat("module alias + block: ", to_string(UK.square(blockValue))))
println(greet("TypeLang"))
println(concat("record method/update: ", concat(user.summary(), to_string(revisedUser.age))))
println(concat("shorthand/if-then/return: ", concat(shorthandRecord.name, concat(thenValue, to_string(earlyReturn(5))))))
println(concat("generic pair/index: ", concat(pair[1], to_string(pair[0]))))
println(concat("comprehension + range + fold: ", to_string(oddsSquared[1])))
println(concat("operators/if/loops: ", concat(label, to_string(loopTotal))))
println(concat("switch: ", dayKind))
println(concat("match/GADT: ", concat(describe(Circle(12)), to_string(evaluateNumber(SumTerm(NumberTerm(9), NumberTerm(4)))))))
println(concat("tuple/record/literal patterns: ", concat(describePair(pair), concat(readRecord(user), literalMatch(1)))))
println(concat("existential package: ", showPacked(Pack(8, (n: number) => to_string(n)))))
let rankResults = usePolymorphic(identity)
println(concat("higher-rank: ", concat(to_string(rankResults[0]), rankResults[1])))
println(concat("stdlib/Option/do: ", to_string(Option.getOrElse(computation, 0))))
println(concat("do-return/omitted return annotation/escape: ", concat(to_string(returnedComputation), escapedText)))
printPlusOne(1)
println(concat("String/Math/Array: ", concat(selectedText, to_string(clipped))))
println(concat("where/return/switch flow: ", report(scopedResult)))
fallThroughDemo(1)
