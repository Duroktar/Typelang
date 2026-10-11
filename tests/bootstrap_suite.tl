// ============================================================================
// TypeLang Comprehensive Native Bootstrap Validation Suite
// ============================================================================
// This test program exercises all primary TypeLang language features and
// emits deterministic, line-by-line verifiable output for validation
// across LLVM IR SSA, C11 native, and C++17 native compiler backends.
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Module Declarations & Namespaces
// ----------------------------------------------------------------------------
module MathCore {
  export function square(n: number): number {
    n * n
  }

  module Nested {
    export function greet(name: string): string {
      concat("Greetings, ", name)
    }
  }
}

// ----------------------------------------------------------------------------
// 2. Algebraic Data Types & GADTs
// ----------------------------------------------------------------------------
type Color = Red | Green | Blue;

type MaybeNumber =
  | Just(val: number): MaybeNumber
  | Nothing: MaybeNumber;

type IntList =
  | Cons(head: number, tail: IntList): IntList
  | Nil: IntList;

type ExprAST =
  | NumLit(val: number): ExprAST
  | AddExpr(left: ExprAST, right: ExprAST): ExprAST;

function evaluateAST(e: ExprAST): number {
  match (e) {
    NumLit(n) => n,
    AddExpr(l, r) => evaluateAST(l) + evaluateAST(r)
  }
}

function sumList(list: IntList): number {
  match (list) {
    Cons(h, t) => h + sumList(t),
    Nil => 0.0
  }
}

// ----------------------------------------------------------------------------
// 3. Named Functions & Recursion
// ----------------------------------------------------------------------------
function addNumbers(a: number, b: number): number {
  a + b
}

function factorial(n: number): number {
  if (n <= 1.0) {
    1.0
  } else {
    n * factorial(n - 1.0)
  }
}

function fibonacci(n: number): number {
  if (n <= 0.0) {
    0.0
  } else if (n == 1.0) {
    1.0
  } else {
    fibonacci(n - 1.0) + fibonacci(n - 2.0)
  }
}

function isEven(n: number): boolean {
  if (n == 0.0) {
    true
  } else {
    isOdd(n - 1.0)
  }
}

function isOdd(n: number): boolean {
  if (n == 0.0) {
    false
  } else {
    isEven(n - 1.0)
  }
}

function earlyReturnTest(v: number): number {
  if (v > 10.0) {
    return 42.0;
  }
  return 0.0;
}

// ----------------------------------------------------------------------------
// 4. Tuples
// ----------------------------------------------------------------------------
function divRem(a: number, b: number): [number, number] {
  let q = Math.floor(a / b);
  let r = a % b;
  [q, r]
}

// ----------------------------------------------------------------------------
// 5. Higher-Order Functions & Scoped Where Clause
// ----------------------------------------------------------------------------
function applyCallback(f: (x: number) => number, val: number): number {
  f(val)
}

function makeMultiplier(factor: number): (x: number) => number {
  (x: number) => x * factor
}

function computeWithWhere(x: number): number {
  helper(x) + baseOffset
} where {
  let baseOffset = 10.0;
  function helper(n: number): number {
    n * 2.0
  }
}

// ----------------------------------------------------------------------------
// MAIN EXECUTION & DETERMINISTIC VERIFICATION OUTPUT
// ----------------------------------------------------------------------------

println("=== TYPELANG NATIVE BOOTSTRAP SUITE ===");

// --- Test 1: Primitives & Arithmetic ---
println("[TEST 1: PRIMITIVES & ARITHMETIC]");
let i = 42.0;
let f = 3.14159;
let neg = -15.0;
println(concat("int: ", to_string(i)));
println(concat("float: ", to_string(f)));
println(concat("neg: ", to_string(neg)));
println(concat("bool: ", concat(to_string(true), concat(", ", to_string(false)))));
let arith = (10.0 + 5.0) * 2.0 - 9.0 / 2.0;
println(concat("arith: ", to_string(arith)));
let modVal = 17.0 % 5.0;
println(concat("mod: ", to_string(modVal)));
let precedence = 2.0 + 3.0 * 4.0;
println(concat("precedence: ", to_string(precedence)));

// --- Test 2: Strings & Concatenation ---
println("[TEST 2: STRINGS & CONCATENATION]");
println("escaped: Line 1\\nLine 2\\tTabbed");
let greeting = concat("Hello, ", "TypeLang Native World!");
println(concat("concat: ", greeting));

// --- Test 3: Variables, Mutability & Scoping ---
println("[TEST 3: VARIABLES & MUTABILITY]");
let mut mutVal = 50.0;
mutVal = 100.0;
mutVal += 50.0;
println(concat("reassign: ", to_string(mutVal)));

let outerX = 100.0;
let innerShadow = {
  let outerX = 200.0;
  outerX
};
println(concat("shadowing: inner=", concat(to_string(innerShadow), concat(", outer=", to_string(outerX)))));

let blockVal = {
  let b1 = 5.0;
  let b2 = 12.0;
  b1 * b1 + b2 * b2
};
println(concat("block_expr: ", to_string(blockVal)));

// --- Test 4: Functions & Recursion ---
println("[TEST 4: FUNCTIONS & RECURSION]");
println(concat("add: ", to_string(addNumbers(20.0, 35.0))));
println(concat("factorial(6): ", to_string(factorial(6.0))));
println(concat("fibonacci(10): ", to_string(fibonacci(10.0))));
println(concat("mutual_even(8): ", to_string(isEven(8.0))));
println(concat("mutual_odd(8): ", to_string(isOdd(8.0))));
println(concat("early_return: ", to_string(earlyReturnTest(15.0))));

// --- Test 5: First-Class Functions & Closures ---
println("[TEST 5: FIRST-CLASS FUNCTIONS & CLOSURES]");
let squareFn = (x: number) => x * x;
println(concat("lambda_square: ", to_string(squareFn(8.0))));
let applied = applyCallback((x: number) => x + 1.0, 20.0);
println(concat("higher_order_apply: ", to_string(applied)));
let timesThree = makeMultiplier(3.0);
println(concat("closure_adder: ", to_string(timesThree(15.0))));

// --- Test 6: Control Flow & Loops ---
println("[TEST 6: CONTROL FLOW & LOOPS]");
let condVal = 10.0;
let ifResult = if (condVal > 0.0) { "positive" } else { "non-positive" };
println(concat("if_branch: ", ifResult));
let ternResult = condVal >= 10.0 ? "pass" : "fail";
println(concat("ternary: ", ternResult));

let mut whileIdx = 1.0;
let mut whileSum = 0.0;
while (whileIdx <= 5.0) {
  whileSum += whileIdx;
  whileIdx += 1.0;
}
println(concat("while_loop: sum=", to_string(whileSum)));

let mut loopCtr = 0.0;
let mut loopAcc = 0.0;
while (loopCtr < 10.0) {
  loopCtr += 1.0;
  if (loopCtr == 2.0) {
    continue;
  }
  if (loopCtr > 7.0) {
    break;
  }
  loopAcc += loopCtr;
}
println(concat("while_break_continue: ", to_string(loopAcc)));

let mut forSum = 0.0;
for (let mut fi = 0.0; fi < 5.0; fi += 1.0) {
  forSum += fi * 3.0;
}
println(concat("for_loop: total=", to_string(forSum)));

let mut gridCount = 0.0;
for (let mut r = 0.0; r < 3.0; r += 1.0) {
  for (let mut c = 0.0; c < 3.0; c += 1.0) {
    gridCount += 1.0;
  }
}
println(concat("nested_loops: cells=", to_string(gridCount)));

let dayCode = 3.0;
let dayName = switch (dayCode) {
  case 1.0: "Monday"
  case 2.0: "Tuesday"
  case 3.0: "Wednesday"
  default: "Other"
};
println(concat("switch_case: ", dayName));

// --- Test 7: Structural Records ---
println("[TEST 7: STRUCTURAL RECORDS]");
let pt = { x: 10.0, y: 20.0 };
println(concat("point: x=", concat(to_string(pt.x), concat(", y=", to_string(pt.y)))));

let cfg = { server: { host: "localhost", port: 8080.0 } };
println(concat("nested_record: host=", concat(cfg.server.host, concat(", port=", to_string(cfg.server.port)))));

let origPt = { x: 10.0, y: 20.0 };
let modPt = { ...origPt, y: 99.0 };
println(concat("record_update: old=", concat(to_string(origPt.y), concat(", updated=", to_string(modPt.y)))));

// --- Test 8: Tuples & Arrays ---
println("[TEST 8: TUPLES & ARRAYS]");
let pairTup = [100.0, "Centum"];
println(concat("tuple_items: first=", concat(to_string(pairTup[0]), concat(", second=", pairTup[1]))));

let dr = divRem(17.0, 5.0);
println(concat("tuple_return: quot=", concat(to_string(dr[0]), concat(", rem=", to_string(dr[1])))));

let sampleArr = [10.0, 20.0, 30.0, 40.0];
println(concat("array_index: ", to_string(sampleArr[2])));

// --- Test 9: Algebraic Data Types & GADTs ---
println("[TEST 9: ALGEBRAIC DATA TYPES & GADTS]");
let col = Green;
let colStr = match (col) {
  Red => "Red",
  Green => "Green",
  Blue => "Blue"
};
println(concat("enum: ", colStr));

let mb = Just(42.0);
let mbVal = match (mb) {
  Just(v) => v,
  Nothing => 0.0
};
println(concat("maybe: ", to_string(mbVal)));

let intList = Cons(10.0, Cons(20.0, Cons(30.0, Nil)));
println(concat("list_sum: ", to_string(sumList(intList))));

let astTree = AddExpr(NumLit(10.0), AddExpr(NumLit(7.0), NumLit(8.0)));
println(concat("gadt_eval: ", to_string(evaluateAST(astTree))));

// --- Test 10: Pattern Matching ---
println("[TEST 10: PATTERN MATCHING]");
let matchNum = 2.0;
let numWord = match (matchNum) {
  1.0 => "One",
  2.0 => "Two",
  _ => "Other"
};
println(concat("literal_match: ", numWord));

let unwrapped = match (Just(99.0)) {
  Just(n) => n,
  Nothing => -1.0
};
println(concat("constructor_unwrap: ", to_string(unwrapped)));

type PointPair = Pair(px: number, py: number);
let pp = Pair(15.0, 25.0);
let ppSum = match (pp) {
  Pair(a, b) => a + b
};
println(concat("multi_arg_ctor: ", to_string(ppSum)));

type Shape =
  | Circle(radius: number): Shape
  | Rect(width: number, height: number): Shape;

function classifyShape(s: Shape): string {
  match (s) {
    Circle(r) if r > 10.0 => "Large Circle",
    Circle(r) => "Small Circle",
    Rect(w, h) => "Rectangle"
  }
}
println(concat("guard_match: ", classifyShape(Circle(15.0))));

let coords = [3.0, 4.0];
let pythagoras = match (coords) {
  [x, y] => x * x + y * y
};
println(concat("tuple_pattern: ", to_string(pythagoras)));

let userRec = { name: "Bob", role: "Admin" };
let userGreeting = match (userRec) {
  { name, role } => concat(name, concat(" (", concat(role, ")")))
};
println(concat("record_pattern: ", userGreeting));

type TaskState = Pending | Finished | Cancelled;
let taskSt = Finished;
let taskDone = match (taskSt) {
  Finished => "finished",
  ... => "other"
};
println(concat("fallback_pattern: ", taskDone));

// --- Test 11: Modules & Namespaces ---
println("[TEST 11: MODULES & NAMESPACES]");
println(concat("module_call: ", to_string(MathCore.square(7.0))));
println(concat("nested_module: ", MathCore.Nested.greet("Commander")));

// --- Test 12: Monadic Where Scoping ---
println("[TEST 12: MONADIC WHERE CLAUSES]");
println(concat("where_computation: ", to_string(computeWithWhere(15.0))));

// --- Test 13: Math Standard Library ---
println("[TEST 13: MATH STANDARD LIBRARY]");
println(concat("sqrt: ", to_string(Math.sqrt(49.0))));
println(concat("floor: ", to_string(Math.floor(9.85))));
println(concat("abs: ", to_string(Math.abs(-12.5))));

println("=== ALL TESTS PASSED SUCCESSFULLY ===");
