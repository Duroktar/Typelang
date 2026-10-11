// ============================================================================
// TypeLang Comprehensive Native Compiler Validation Suite
// ============================================================================
// This test program exercises all major TypeLang language features and
// emits deterministic, line-by-line verifiable output for validation
// across LLVM IR SSA, C11 native, and C++17 native compiler backends.
// ============================================================================

println("=== TYPELANG COMPREHENSIVE COMPILER VALIDATION SUITE ===");

// ----------------------------------------------------------------------------
// 1. Primitives, Constants & Arithmetic
// ----------------------------------------------------------------------------
println("[TEST 1: PRIMITIVES & ARITHMETIC]");
let intVal = 42.0;
let floatVal = 3.14159;
let negVal = -15.0;
println(concat("int: ", to_string(intVal)));
println(concat("float: ", to_string(floatVal)));
println(concat("neg: ", to_string(negVal)));

let arithAdd = intVal + 8.0;
let arithSub = intVal - 12.0;
let arithMul = intVal * 2.0;
let arithDiv = 84.0 / 2.0;
let arithMod = 17.0 % 5.0;
let precedence = (2.0 + 3.0) * 4.0 - 10.0 / 2.0;
println(concat("arith_add: ", to_string(arithAdd)));
println(concat("arith_sub: ", to_string(arithSub)));
println(concat("arith_mul: ", to_string(arithMul)));
println(concat("arith_div: ", to_string(arithDiv)));
println(concat("arith_mod: ", to_string(arithMod)));
println(concat("precedence: ", to_string(precedence)));

// ----------------------------------------------------------------------------
// 2. Booleans, Relational & Logical Operators
// ----------------------------------------------------------------------------
println("[TEST 2: BOOLEANS & LOGIC]");
let boolTrue = true;
let boolFalse = false;
println(concat("true_val: ", to_string(boolTrue)));
println(concat("false_val: ", to_string(boolFalse)));
println(concat("op_and: ", to_string(boolTrue && boolFalse)));
println(concat("op_or: ", to_string(boolTrue || boolFalse)));
println(concat("op_not: ", to_string(!boolFalse)));

println(concat("cmp_eq: ", to_string(intVal == 42.0)));
println(concat("cmp_ne: ", to_string(intVal != 42.0)));
println(concat("cmp_lt: ", to_string(10.0 < 20.0)));
println(concat("cmp_le: ", to_string(20.0 <= 20.0)));
println(concat("cmp_gt: ", to_string(30.0 > 20.0)));
println(concat("cmp_ge: ", to_string(30.0 >= 30.0)));

// ----------------------------------------------------------------------------
// 3. Strings & Concatenation
// ----------------------------------------------------------------------------
println("[TEST 3: STRINGS & CONCATENATION]");
let hello = "Hello";
let world = "TypeLang";
let joined = concat(concat(hello, ", "), concat(world, "!"));
println(concat("greeting: ", joined));

// ----------------------------------------------------------------------------
// 4. Variables, Mutability & Scoping
// ----------------------------------------------------------------------------
println("[TEST 4: VARIABLES & MUTABILITY]");
let mut acc = 10.0;
acc = acc + 15.0;
acc += 25.0;
acc -= 10.0;
acc *= 2.0;
acc /= 4.0;
println(concat("mut_acc: ", to_string(acc)));

let blockResult = {
  let inner1 = 7.0;
  let inner2 = 8.0;
  inner1 * inner2
};
println(concat("block_result: ", to_string(blockResult)));

// ----------------------------------------------------------------------------
// 5. Functions & Recursion
// ----------------------------------------------------------------------------
println("[TEST 5: FUNCTIONS & RECURSION]");
function addTwo(x: number, y: number): number {
  x + y
}
println(concat("addTwo(18, 24): ", to_string(addTwo(18.0, 24.0))));

function factorial(n: number): number {
  if (n <= 1.0) {
    1.0
  } else {
    n * factorial(n - 1.0)
  }
}
println(concat("factorial(6): ", to_string(factorial(6.0))));

function fibonacci(n: number): number {
  if (n <= 0.0) {
    0.0
  } else if (n == 1.0) {
    1.0
  } else {
    fibonacci(n - 1.0) + fibonacci(n - 2.0)
  }
}
println(concat("fibonacci(8): ", to_string(fibonacci(8.0))));

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
println(concat("isEven(10): ", to_string(isEven(10.0))));
println(concat("isOdd(10): ", to_string(isOdd(10.0))));

// ----------------------------------------------------------------------------
// 6. First-Class Functions & Lambdas
// ----------------------------------------------------------------------------
println("[TEST 6: FIRST-CLASS FUNCTIONS]");
let squareLambda = (n: number): number => n * n;
println(concat("lambda_square(9): ", to_string(squareLambda(9.0))));

function applyHigherOrder(f: (x: number) => number, val: number): number {
  f(val)
}
println(concat("apply_higher_order: ", to_string(applyHigherOrder(squareLambda, 12.0))));

// ----------------------------------------------------------------------------
// 7. Control Flow & Loops
// ----------------------------------------------------------------------------
println("[TEST 7: CONTROL FLOW]");
let ternaryVal = (intVal > 40.0) ? "above_40" : "below_or_equal";
println(concat("ternary: ", ternaryVal));

let mut loopSum = 0.0;
let mut counter = 1.0;
while (counter <= 5.0) {
  loopSum += counter;
  counter += 1.0;
}
println(concat("while_sum: ", to_string(loopSum)));

let mut breakSum = 0.0;
let mut bIndex = 0.0;
while (bIndex < 20.0) {
  bIndex += 1.0;
  if (bIndex > 6.0) {
    break;
  }
  if (bIndex == 3.0) {
    continue;
  }
  breakSum += bIndex;
}
println(concat("break_continue_sum: ", to_string(breakSum)));

let switchResult = switch (3.0) {
  case 1.0: "First"
  case 2.0: "Second"
  case 3.0: "Third"
  default: "Other"
};
println(concat("switch_result: ", switchResult));

// ----------------------------------------------------------------------------
// 8. Modules & Namespaces
// ----------------------------------------------------------------------------
println("[TEST 8: MODULES & NAMESPACES]");
module MathHelper {
  export function cube(x: number): number {
    x * x * x
  }

  module NestedGeometry {
    export function area(w: number, h: number): number {
      w * h
    }
  }
}
println(concat("module_cube(4): ", to_string(MathHelper.cube(4.0))));
println(concat("nested_area(5, 7): ", to_string(MathHelper.NestedGeometry.area(5.0, 7.0))));

// ----------------------------------------------------------------------------
// 9. Scoped Where Clauses
// ----------------------------------------------------------------------------
println("[TEST 9: WHERE CLAUSES]");
function computeWhere(x: number): number {
  doubleVal(x) + offset
} where {
  let offset = 100.0;
  function doubleVal(n: number): number {
    n * 2.0
  }
}
println(concat("where_result(25): ", to_string(computeWhere(25.0))));

// ----------------------------------------------------------------------------
// 10. Standard Math Library
// ----------------------------------------------------------------------------
println("[TEST 10: MATH LIBRARY]");
println(concat("sqrt(64): ", to_string(Math.sqrt(64.0))));
println(concat("floor(9.87): ", to_string(Math.floor(9.87))));
println(concat("abs(-42.5): ", to_string(Math.abs(-42.5))));

// ----------------------------------------------------------------------------
// 11. Algebraic Data Types & Pattern Matching
// ----------------------------------------------------------------------------
println("[TEST 11: ADTS & PATTERN MATCHING]");
type Color = Red | Green | Blue;
function colorToCode(c: Color): number {
  match (c) {
    Red => 1.0,
    Green => 2.0,
    Blue => 3.0
  }
}
println(concat("color_red: ", to_string(colorToCode(Red))));
println(concat("color_green: ", to_string(colorToCode(Green))));
println(concat("color_blue: ", to_string(colorToCode(Blue))));

type MaybeNum = Some(val: number): MaybeNum | None: MaybeNum;
function getWithDefault(m: MaybeNum, defVal: number): number {
  match (m) {
    Some(v) => v,
    None => defVal
  }
}
println(concat("maybe_some: ", to_string(getWithDefault(Some(88.0), 0.0))));
println(concat("maybe_none: ", to_string(getWithDefault(None, 99.0))));

println("=== ALL VALIDATION TESTS COMPLETED SUCCESSFULLY ===");
