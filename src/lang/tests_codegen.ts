/**
 * Exhaustive Compiler Code Generation Backend Test Suite
 *
 * Covers each TypeLang language feature and its key permutations across:
 *  1. LLVM IR SSA Backend (IR generation, SSA invariants, and VM execution)
 *  2. C11 Native Backend (Tagged unions, C forward decls, C runtime structures)
 *  3. C++17 Native Backend (typelang namespace, TLValue, lambdas, STL containers)
 */

import { Lexer } from './lexer';
import { Parser } from './parser';
import { LLVMIRGenerator } from './codegen_llvm';
import { CCodeGenerator } from './codegen_c';
import { LLVMInterpreter } from './llvm_interpreter';

export interface CodegenTestCase {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
  target?: 'all' | 'llvm' | 'c' | 'cpp';
  expectedLLVM?: {
    expectedOpcodes?: string[];
    forbiddenPatterns?: RegExp[];
    execute?: boolean;
    expectedStdoutSubstrings?: string[];
    expectedExitCode?: number;
    validate?: (llvmIR: string) => void;
  };
  expectedC?: {
    expectedSnippets?: string[];
    forbiddenPatterns?: RegExp[];
    validate?: (cCode: string) => void;
  };
  expectedCpp?: {
    expectedSnippets?: string[];
    forbiddenPatterns?: RegExp[];
    validate?: (cppCode: string) => void;
  };
}

export interface CodegenTestResult {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  llvmPassed: boolean;
  cPassed: boolean;
  cppPassed: boolean;
  durationMs: number;
  errors: string[];
}

export interface CodegenSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: CodegenTestResult[];
  errors: string[];
}

export const CODEGEN_TEST_CASES: CodegenTestCase[] = [
  // =========================================================================
  // Category 1: Primitives, Literals & Constants
  // =========================================================================
  {
    id: 'prim_01_numeric_literals',
    name: '1.1 Numeric Literals (Int, Float, Negatives, Zero)',
    category: 'Primitives & Constants',
    description: 'Verifies numeric literal representation across backends.',
    code: `
      let a = 42.0;
      let b = -17.5;
      let c = 0.0;
      let d = 100.0;
      println(a);
      println(b);
      println(c);
      println(d);
    `,
    expectedLLVM: {
      expectedOpcodes: ['double 42.0', 'double 17.5', 'fneg double', 'double 0.0', 'double 100.0', '@printf'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_num(42)', 'tl_neg(', 'tl_num(0)', 'tl_num(100)']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue(42)', 'TLValue(0)', 'TLValue(100)']
    }
  },
  {
    id: 'prim_02_booleans',
    name: '1.2 Boolean Literals (true & false)',
    category: 'Primitives & Constants',
    description: 'Verifies boolean constant emission and formatting.',
    code: `
      let isTrue = true;
      let isFalse = false;
      println(isTrue);
      println(isFalse);
    `,
    expectedLLVM: {
      expectedOpcodes: ['@.fmt_bool_t', '@.fmt_bool_f', 'store i1 1', 'store i1 0'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_bool(true)', 'tl_bool(false)']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue(true)', 'TLValue(false)']
    }
  },
  {
    id: 'prim_03_strings_and_escapes',
    name: '1.3 String Literals and Escape Sequences',
    category: 'Primitives & Constants',
    description: 'Verifies string literal interning and escape code formatting.',
    code: `
      let greeting = "Hello, world!\\n";
      let tabbed = "Item\\tValue";
      let quoted = "He said \\"TypeLang\\"";
      println(greeting);
      println(tabbed);
      println(quoted);
    `,
    expectedLLVM: {
      expectedOpcodes: ['c"Hello, world!\\0A\\00"', 'c"Item\\09Value\\00"', '@printf'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_str("Hello, world!\\n")', 'tl_str("Item\\tValue")', 'tl_str("He said \\"TypeLang\\"")']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue("Hello, world!\\n")', 'TLValue("Item\\tValue")']
    }
  },
  {
    id: 'prim_04_array_literals',
    name: '1.4 Array Literals (Numbers, Strings, Empty)',
    category: 'Primitives & Constants',
    description: 'Verifies heap allocated array literals in all backends.',
    code: `
      let nums = [1.0, 2.0, 3.0];
      let tags = ["alpha", "beta"];
      let empty = [];
      println(nums);
      println(tags);
    `,
    expectedLLVM: {
      expectedOpcodes: ['call i8* @malloc', '%struct.Array*'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_array(']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue::make_array(']
    }
  },
  {
    id: 'prim_05_unit_expression',
    name: '1.5 Unit / Void Expression',
    category: 'Primitives & Constants',
    description: 'Verifies unit/void value handling and emission.',
    code: `
      let u = ();
      println("Unit executed cleanly");
    `,
    expectedLLVM: {
      expectedOpcodes: ['@printf', 'c"Unit executed cleanly\\00"'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_null()']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue()']
    }
  },

  // =========================================================================
  // Category 2: Operators & Expressions
  // =========================================================================
  {
    id: 'op_01_arithmetic',
    name: '2.1 Arithmetic Expressions (+, -, *, /, %)',
    category: 'Operators & Expressions',
    description: 'Tests floating-point arithmetic instructions and precedence.',
    code: `
      let a = 20.0;
      let b = 6.0;
      let sum = a + b;
      let diff = a - b;
      let prod = a * b;
      let quot = a / b;
      let rem = a % b;
      let complex = (a + b) * (a - b) / 4.0;
      println(sum);
      println(diff);
      println(prod);
      println(quot);
      println(rem);
      println(complex);
    `,
    expectedLLVM: {
      expectedOpcodes: ['fadd double', 'fsub double', 'fmul double', 'fdiv double', 'frem double'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_add(', 'tl_sub(', 'tl_mul(', 'tl_div(', 'tl_mod(']
    },
    expectedCpp: {
      expectedSnippets: ['+ ', '- ', '* ', '/ ', '% ']
    }
  },
  {
    id: 'op_02_relational',
    name: '2.2 Relational Comparisons (==, !=, <, <=, >, >=)',
    category: 'Operators & Expressions',
    description: 'Tests relational comparisons yielding boolean results.',
    code: `
      let x = 15.0;
      let y = 30.0;
      let eq = x == y;
      let ne = x != y;
      let lt = x < y;
      let le = x <= y;
      let gt = x > y;
      let ge = x >= y;
      println(eq);
      println(ne);
      println(lt);
      println(le);
      println(gt);
      println(ge);
    `,
    expectedLLVM: {
      expectedOpcodes: ['fcmp oeq double', 'fcmp one double', 'fcmp olt double', 'fcmp ole double', 'fcmp ogt double', 'fcmp oge double'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_eq(', 'tl_ne(', 'tl_lt(', 'tl_le(', 'tl_gt(', 'tl_ge(']
    },
    expectedCpp: {
      expectedSnippets: ['==', '!=', '<', '<=', '>', '>=']
    }
  },
  {
    id: 'op_03_logical_operators',
    name: '2.3 Logical Operators (&&, ||, !)',
    category: 'Operators & Expressions',
    description: 'Tests boolean logic conjunction, disjunction, and negation.',
    code: `
      let p = true;
      let q = false;
      let andVal = p && q;
      let orVal = p || q;
      let notVal = !p;
      let combined = (p || q) && (!q);
      println(andVal);
      println(orVal);
      println(notVal);
      println(combined);
    `,
    expectedLLVM: {
      expectedOpcodes: ['and i1', 'or i1', 'xor i1'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_bool(tl_is_truthy(', 'tl_not(']
    },
    expectedCpp: {
      expectedSnippets: ['.is_truthy()', '!']
    }
  },
  {
    id: 'op_04_unary_negation',
    name: '2.4 Unary Negation (-x and !flag)',
    category: 'Operators & Expressions',
    description: 'Tests numeric negation and boolean inversion.',
    code: `
      let num = 88.0;
      let neg = -num;
      let flag = false;
      let inv = !flag;
      println(neg);
      println(inv);
    `,
    expectedLLVM: {
      expectedOpcodes: ['fneg double', 'xor i1'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_neg(', 'tl_not(']
    },
    expectedCpp: {
      expectedSnippets: ['-', '!']
    }
  },
  {
    id: 'op_05_compound_assignment',
    name: '2.5 Compound Assignment (+=, -=, *=, /=)',
    category: 'Operators & Expressions',
    description: 'Tests inplace mutation with compound operator assignment.',
    code: `
      let mut val = 100.0;
      val += 50.0;
      val -= 20.0;
      val *= 2.0;
      val /= 4.0;
      println(val);
    `,
    expectedLLVM: {
      expectedOpcodes: ['fadd double', 'fsub double', 'fmul double', 'fdiv double', 'store double'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['val +=', 'val -=', 'val *=', 'val /=']
    },
    expectedCpp: {
      expectedSnippets: ['val +=', 'val -=', 'val *=', 'val /=']
    }
  },
  {
    id: 'op_06_ternary_expression',
    name: '2.6 Ternary Conditional Expression (cond ? a : b)',
    category: 'Operators & Expressions',
    description: 'Tests ternary conditional expression evaluation.',
    code: `
      let score = 85.0;
      let grade = score >= 70.0 ? "Pass" : "Fail";
      let bonus = score > 90.0 ? 10.0 : 0.0;
      println(grade);
      println(bonus);
    `,
    expectedLLVM: {
      expectedOpcodes: ['fcmp oge double', 'br i1', 'phi'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_is_truthy(']
    },
    expectedCpp: {
      expectedSnippets: ['?']
    }
  },
  {
    id: 'op_07_string_concatenation',
    name: '2.7 String Concatenation (concat & +)',
    category: 'Operators & Expressions',
    description: 'Tests string joining through builtin concat function and +.',
    code: `
      let first = "Type";
      let second = "Lang";
      let full = concat(first, second);
      let withPlus = first + "Script";
      println(full);
      println(withPlus);
    `,
    expectedLLVM: {
      expectedOpcodes: ['call i8* @strcpy', 'call i8* @strcat', '@printf'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['concat(']
    },
    expectedCpp: {
      expectedSnippets: ['concat(']
    }
  },

  // =========================================================================
  // Category 3: Variables, Scoping & Mutability
  // =========================================================================
  {
    id: 'var_01_immutable_let',
    name: '3.1 Immutable Let Bindings',
    category: 'Variables, Scoping & Mutability',
    description: 'Tests multiple immutable let bindings and dependency chaining.',
    code: `
      let x = 10.0;
      let y = x * 2.0;
      let z = x + y + 5.0;
      println(z);
    `,
    expectedLLVM: {
      expectedOpcodes: ['%x.var = alloca double', '%y.var = alloca double', '%z.var = alloca double'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue x =', 'TLValue y =', 'TLValue z =']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue x =', 'TLValue y =', 'TLValue z =']
    }
  },
  {
    id: 'var_02_mutable_reassignment',
    name: '3.2 Mutable Variables and Reassignment',
    category: 'Variables, Scoping & Mutability',
    description: 'Tests mutable variable creation and direct reassignment.',
    code: `
      let mut counter = 0.0;
      counter = 1.0;
      counter = counter + 10.0;
      counter = counter * 2.0;
      println(counter);
    `,
    expectedLLVM: {
      expectedOpcodes: ['store double 0.0', 'store double 1.0', 'store double', 'load double'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['counter =', 'tl_add(counter,', 'tl_mul(counter,']
    },
    expectedCpp: {
      expectedSnippets: ['counter =', '(counter +', '(counter *']
    }
  },
  {
    id: 'var_03_lexical_shadowing',
    name: '3.3 Lexical Scoping and Shadowing in Nested Blocks',
    category: 'Variables, Scoping & Mutability',
    description: 'Tests variable shadowing across outer and inner block scopes.',
    code: `
      let x = 100.0;
      let innerVal = {
        let x = 200.0;
        let y = x + 50.0;
        y
      };
      println(x);
      println(innerVal);
    `,
    expectedLLVM: {
      expectedOpcodes: ['double 100.0', 'double 200.0', 'fadd double'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue x =']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue x =']
    }
  },
  {
    id: 'var_04_block_expressions',
    name: '3.4 Block Expressions Evaluating to a Result',
    category: 'Variables, Scoping & Mutability',
    description: 'Tests block expressions yielding a final computed expression.',
    code: `
      let calc = {
        let p = 5.0;
        let q = 12.0;
        p * p + q * q
      };
      println(calc);
    `,
    expectedLLVM: {
      expectedOpcodes: ['fmul double', 'fadd double'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_mul(', 'tl_add(']
    },
    expectedCpp: {
      expectedSnippets: ['* ', '+ ']
    }
  },

  // =========================================================================
  // Category 4: Functions & Recursion
  // =========================================================================
  {
    id: 'fn_01_named_function',
    name: '4.1 Named Top-Level Functions with Signatures',
    category: 'Functions & Recursion',
    description: 'Tests top-level typed function definition and function call invocation.',
    code: `
      function multiply(a: number, b: number): number {
        a * b
      }
      let res = multiply(7.0, 9.0);
      println(res);
    `,
    expectedLLVM: {
      expectedOpcodes: ['define double @multiply(double %arg.a, double %arg.b)', 'fmul double', 'call double @multiply'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue multiply(TLValue a, TLValue b)', 'tl_mul(a, b)']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue multiply(const TLValue& a, const TLValue& b)', 'return (a * b);']
    }
  },
  {
    id: 'fn_02_explicit_return',
    name: '4.2 Explicit Return Statement vs Implicit Body',
    category: 'Functions & Recursion',
    description: 'Tests functions utilizing explicit return keywords.',
    code: `
      function computeDiscount(price: number, member: boolean): number {
        if (member) {
          return price * 0.8;
        }
        return price * 0.95;
      }
      let r1 = computeDiscount(100.0, true);
      let r2 = computeDiscount(100.0, false);
      println(r1);
      println(r2);
    `,
    expectedLLVM: {
      expectedOpcodes: ['define double @computeDiscount', 'ret double', 'call double @computeDiscount'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue computeDiscount(', 'return ']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue computeDiscount(', 'return ']
    }
  },
  {
    id: 'fn_03_direct_recursion',
    name: '4.3 Direct Recursion: Factorial and Fibonacci',
    category: 'Functions & Recursion',
    description: 'Tests recursive function calls with base cases and stack unwind.',
    code: `
      function fact(n: number): number {
        if (n <= 1.0) { 1.0 } else { n * fact(n - 1.0) }
      }
      function fib(n: number): number {
        if (n <= 0.0) { 0.0 }
        else if (n == 1.0) { 1.0 }
        else { fib(n - 1.0) + fib(n - 2.0) }
      }
      println(fact(5.0));
      println(fib(7.0));
    `,
    expectedLLVM: {
      expectedOpcodes: ['define double @fact', 'call double @fact', 'define double @fib', 'call double @fib'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue fact(TLValue n)', 'fact(tl_sub(n, tl_num(1)))', 'TLValue fib(TLValue n)']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue fact(const TLValue& n)', 'fact((n - TLValue(1)))', 'TLValue fib(const TLValue& n)']
    }
  },
  {
    id: 'fn_04_mutual_recursion',
    name: '4.4 Mutual Recursion (isEven & isOdd)',
    category: 'Functions & Recursion',
    description: 'Tests forward declarations and mutual recursion between functions.',
    code: `
      function isEven(n: number): boolean {
        if (n == 0.0) { true } else { isOdd(n - 1.0) }
      }
      function isOdd(n: number): boolean {
        if (n == 0.0) { false } else { isEven(n - 1.0) }
      }
      println(isEven(4.0));
      println(isEven(5.0));
      println(isOdd(3.0));
    `,
    expectedLLVM: {
      expectedOpcodes: ['define i1 @isEven', 'define i1 @isOdd', 'call i1 @isEven', 'call i1 @isOdd'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue isEven(TLValue n);', 'TLValue isOdd(TLValue n);']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue isEven(const TLValue& n);', 'TLValue isOdd(const TLValue& n);']
    }
  },
  {
    id: 'fn_05_multi_arg_mixed_types',
    name: '4.5 Multi-Argument Functions with Mixed Types',
    category: 'Functions & Recursion',
    description: 'Tests function calls passing number, boolean, and string parameters.',
    code: `
      function formatStatus(id: number, active: boolean, label: string): string {
        concat(label, active ? " [Active]" : " [Inactive]")
      }
      let s = formatStatus(101.0, true, "Worker");
      println(s);
    `,
    expectedLLVM: {
      expectedOpcodes: ['define i8* @formatStatus(double %arg.id, i1 %arg.active, i8* %arg.label)', 'call i8* @formatStatus'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue formatStatus(TLValue id, TLValue active, TLValue label)']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue formatStatus(const TLValue& id, const TLValue& active, const TLValue& label)']
    }
  },

  // =========================================================================
  // Category 5: First-Class Functions, Lambdas & Closures
  // =========================================================================
  {
    id: 'lambda_01_anonymous_lambda',
    name: '5.1 Anonymous Lambdas and Function Pointers',
    category: 'First-Class Functions & Lambdas',
    description: 'Tests single-parameter anonymous lambda definitions and invocations.',
    code: `
      let square = (x: number) => x * x;
      let cube = (x: number) => x * x * x;
      println(square(5.0));
      println(cube(3.0));
    `,
    expectedLLVM: {
      expectedOpcodes: ['@.lambda_', 'bitcast i8*', 'fmul double'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['square', 'cube']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue(TLFunction([&](const std::vector<TLValue>&']
    }
  },
  {
    id: 'lambda_02_multi_param_lambda',
    name: '5.2 Multi-Parameter Anonymous Lambdas',
    category: 'First-Class Functions & Lambdas',
    description: 'Tests multi-parameter lambda functions.',
    code: `
      let adder = (a: number, b: number) => a + b;
      let res = adder(14.0, 28.0);
      println(res);
    `,
    expectedLLVM: {
      expectedOpcodes: ['@.lambda_', 'fadd double'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['adder']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue(TLFunction([&](const std::vector<TLValue>&']
    }
  },
  {
    id: 'lambda_03_higher_order_arg',
    name: '5.3 Higher-Order Function Passing Callbacks',
    category: 'First-Class Functions & Lambdas',
    description: 'Tests passing first-class functions as arguments to other functions.',
    code: `
      function applyTwice(f: (n: number) => number, x: number): number {
        f(f(x))
      }
      let inc = (n: number) => n + 1.0;
      let res = applyTwice(inc, 10.0);
      println(res);
    `,
    expectedLLVM: {
      expectedOpcodes: ['define double @applyTwice', 'call double @applyTwice'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue applyTwice(']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue applyTwice(']
    }
  },
  {
    id: 'lambda_04_returning_closure',
    name: '5.4 Higher-Order Function Returning Closures',
    category: 'First-Class Functions & Lambdas',
    description: 'Tests function factories returning customized closures.',
    code: `
      function makeMultiplier(factor: number): (x: number) => number {
        (x: number) => x * factor
      }
      let triple = makeMultiplier(3.0);
      println(triple(6.0));
    `,
    expectedLLVM: {
      expectedOpcodes: ['define i8* @makeMultiplier', 'call i8* @makeMultiplier'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue makeMultiplier(']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue makeMultiplier(', 'TLValue(TLFunction([&]']
    }
  },

  // =========================================================================
  // Category 6: Control Flow: Branching & Loops
  // =========================================================================
  {
    id: 'flow_01_if_else_statement',
    name: '6.1 If / Else If / Else Statement Branches',
    category: 'Control Flow: Branching & Loops',
    description: 'Tests multi-branch conditional execution statements.',
    code: `
      let x = 12.0;
      let category = if (x > 20.0) {
        "High"
      } else if (x > 10.0) {
        "Medium"
      } else {
        "Low"
      };
      println(category);
    `,
    expectedLLVM: {
      expectedOpcodes: ['fcmp ogt double', 'then.', 'else.', 'merge.'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['(tl_is_truthy(']
    },
    expectedCpp: {
      expectedSnippets: ['.is_truthy() ?']
    }
  },
  {
    id: 'flow_02_if_else_expression',
    name: '6.2 If / Else Expression Yielding a Value',
    category: 'Control Flow: Branching & Loops',
    description: 'Tests if-else used directly as an expression with SSA phi join.',
    code: `
      let temp = 22.0;
      let weather = if (temp > 20.0) { "Warm" } else { "Cool" };
      println(weather);
    `,
    expectedLLVM: {
      expectedOpcodes: ['fcmp ogt double', 'phi i8*'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['(tl_is_truthy(']
    },
    expectedCpp: {
      expectedSnippets: ['.is_truthy() ?']
    }
  },
  {
    id: 'flow_03_while_loop',
    name: '6.3 While Loop with Accumulator',
    category: 'Control Flow: Branching & Loops',
    description: 'Tests while loop back-edge condition and loop variable mutation.',
    code: `
      let mut i = 1.0;
      let mut sum = 0.0;
      while (i <= 5.0) {
        sum = sum + i;
        i = i + 1.0;
      }
      println(sum);
    `,
    expectedLLVM: {
      expectedOpcodes: ['while.cond.', 'while.body.', 'while.merge.', 'fcmp ole double', 'br label %while.cond.'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['while (']
    },
    expectedCpp: {
      expectedSnippets: ['while (']
    }
  },
  {
    id: 'flow_04_while_break_continue',
    name: '6.4 While Loop with Break and Continue',
    category: 'Control Flow: Branching & Loops',
    description: 'Tests early termination and next iteration jumps in while loops.',
    code: `
      let mut n = 0.0;
      let mut collected = 0.0;
      while (n < 10.0) {
        n = n + 1.0;
        if (n == 3.0) {
          continue;
        }
        if (n > 6.0) {
          break;
        }
        collected = collected + n;
      }
      println(collected);
    `,
    expectedLLVM: {
      expectedOpcodes: ['while.body.', 'while.cond.', 'while.merge.'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['continue;', 'break;']
    },
    expectedCpp: {
      expectedSnippets: ['__TLContinueSignal', '__TLBreakSignal']
    }
  },
  {
    id: 'flow_05_for_loop',
    name: '6.5 Counter-Based For Loop',
    category: 'Control Flow: Branching & Loops',
    description: 'Tests standard three-part for loop with initializer, guard, and update.',
    code: `
      let mut total = 0.0;
      for (let mut i = 0.0; i < 4.0; i = i + 1.0) {
        total = total + i * 2.0;
      }
      println(total);
    `,
    expectedLLVM: {
      expectedOpcodes: ['for.cond.', 'for.body.', 'for.merge.', 'fcmp olt double'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['for (TLValue i =']
    },
    expectedCpp: {
      expectedSnippets: ['for (TLValue i =']
    }
  },
  {
    id: 'flow_06_nested_loops',
    name: '6.6 Nested Loops (2D Grid Accumulation)',
    category: 'Control Flow: Branching & Loops',
    description: 'Tests nested loop counters and basic block isolation.',
    code: `
      let mut pairsCount = 0.0;
      for (let mut r = 0.0; r < 3.0; r = r + 1.0) {
        for (let mut c = 0.0; c < 3.0; c = c + 1.0) {
          pairsCount = pairsCount + 1.0;
        }
      }
      println(pairsCount);
    `,
    expectedLLVM: {
      expectedOpcodes: ['for.cond.', 'for.body.', 'for.merge.'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['for (TLValue r =', 'for (TLValue c =']
    },
    expectedCpp: {
      expectedSnippets: ['for (TLValue r =', 'for (TLValue c =']
    }
  },
  {
    id: 'flow_07_switch_statement',
    name: '6.7 Switch Statement with Multi-Cases and Default',
    category: 'Control Flow: Branching & Loops',
    description: 'Tests switch statement branching over multiple matching values.',
    code: `
      let day = 3.0;
      let dayName = switch (day) {
        case 1.0: "Monday"
        case 2.0: "Tuesday"
        case 3.0: "Wednesday"
        default: "Other"
      };
      println(dayName);
    `,
    expectedLLVM: {
      expectedOpcodes: ['switch.case', 'switch.merge', 'switch.cond'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_eq(']
    },
    expectedCpp: {
      expectedSnippets: ['==']
    }
  },

  // =========================================================================
  // Category 7: Records & Structural Objects
  // =========================================================================
  {
    id: 'rec_01_literal_and_access',
    name: '7.1 Record Literals and Field Access',
    category: 'Records & Structural Objects',
    description: 'Tests structural record creation, heap mapping, and field retrieval.',
    code: `
      let user = { name: "Alice", age: 30.0, active: true };
      println(user.name);
      println(user.age);
      println(user.active);
    `,
    expectedLLVM: {
      expectedOpcodes: ['call i8* @malloc', 'call i8* @_tl_record_get'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_record(', 'tl_get_field(']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue::make_record(', '.get("name")', '.get("age")']
    }
  },
  {
    id: 'rec_02_nested_records',
    name: '7.2 Nested Structural Records',
    category: 'Records & Structural Objects',
    description: 'Tests hierarchical multi-level record access and indexing.',
    code: `
      let config = {
        server: { host: "localhost", port: 8080.0 },
        debug: true
      };
      println(config.server.host);
      println(config.server.port);
    `,
    expectedLLVM: {
      expectedOpcodes: ['call i8* @malloc', 'call i8* @_tl_record_get'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_get_field(']
    },
    expectedCpp: {
      expectedSnippets: ['.get("server").get("host")', '.get("server").get("port")']
    }
  },
  {
    id: 'rec_03_record_spread_update',
    name: '7.3 Immutable Record Spread / Functional Update',
    category: 'Records & Structural Objects',
    description: 'Tests functional copy and field override of records.',
    code: `
      let base = { x: 10.0, y: 20.0 };
      let updated = { ...base, y: 99.0 };
      println(base.y);
      println(updated.x);
      println(updated.y);
    `,
    expectedLLVM: {
      expectedOpcodes: ['call i8* @malloc'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue updated = base;']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue _b = base;']
    }
  },

  // =========================================================================
  // Category 8: Tuples
  // =========================================================================
  {
    id: 'tup_01_literal_and_access',
    name: '8.1 Tuple Literals and Element Indexing',
    category: 'Tuples',
    description: 'Tests tuple creation, 0-indexed member access, and passing.',
    code: `
      let pair = [100.0, "Centum"];
      println(pair[0]);
      println(pair[1]);
    `,
    expectedLLVM: {
      expectedOpcodes: ['%struct.Array*'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_get_index(pair, tl_num(0))', 'tl_get_index(pair, tl_num(1))']
    },
    expectedCpp: {
      expectedSnippets: ['pair[TLValue(0)]', 'pair[TLValue(1)]']
    }
  },
  {
    id: 'tup_02_function_returning_tuple',
    name: '8.2 Function Returning and Consuming Tuples',
    category: 'Tuples',
    description: 'Tests functions returning multiple values packaged in tuples.',
    code: `
      function divMod(a: number, b: number): [number, number] {
        let q = a / b;
        let r = a % b;
        [q, r]
      }
      let res = divMod(17.0, 5.0);
      println(res[0]);
      println(res[1]);
    `,
    expectedLLVM: {
      expectedOpcodes: ['define i8* @divMod', 'call i8* @divMod'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue divMod(TLValue a, TLValue b)', 'tl_array(']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue divMod(const TLValue& a, const TLValue& b)', 'TLValue::make_array(']
    }
  },

  // =========================================================================
  // Category 9: Algebraic Data Types (ADTs & GADTs)
  // =========================================================================
  {
    id: 'adt_01_enum_adt',
    name: '9.1 Enumeration ADT (Zero-Arity Constructors)',
    category: 'Algebraic Data Types (ADTs & GADTs)',
    description: 'Tests sum type enums with nullary constructors.',
    code: `
      type TrafficLight =
        | Red
        | Yellow
        | Green;

      let c1 = Red;
      let c2 = Green;
      println("Enums instantiated cleanly");
    `,
    expectedLLVM: {
      expectedOpcodes: ['call i8* @malloc', 'store i32 0', 'store i32 2'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['typedef TLValue TrafficLight;', 'TLValue Red(', 'TLValue Green(']
    },
    expectedCpp: {
      expectedSnippets: ['using TrafficLight = TLValue;', 'TLValue Red()', 'TLValue Green()']
    }
  },
  {
    id: 'adt_02_parameterized_option',
    name: '9.2 Generic Parameterized ADT (Custom Variant)',
    category: 'Algebraic Data Types (ADTs & GADTs)',
    description: 'Tests custom generic ADT with constructor payloads.',
    code: `
      type Maybe<a> =
        | Just(val: a): Maybe<a>
        | Nothing: Maybe<a>;

      let m1 = Just(42.0);
      let m2 = Nothing;
      println("Maybe variants created");
    `,
    expectedLLVM: {
      expectedOpcodes: ['call i8* @malloc', 'store i32 0', 'store i32 1'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['typedef TLValue Maybe;', 'TLValue Just(TLValue val)', 'tl_variant("Just"']
    },
    expectedCpp: {
      expectedSnippets: ['using Maybe = TLValue;', 'TLValue Just(const TLValue& val)', 'TLValue::make_variant("Just"']
    }
  },
  {
    id: 'adt_03_recursive_linked_list',
    name: '9.3 Recursive Linked List ADT',
    category: 'Algebraic Data Types (ADTs & GADTs)',
    description: 'Tests recursively defined ADTs for dynamic data structures.',
    code: `
      type List<a> =
        | Cons(head: a, tail: List<a>): List<a>
        | Nil: List<a>;

      let l0 = Nil;
      let l1 = Cons(10.0, l0);
      let l2 = Cons(20.0, l1);
      println("Linked list nodes constructed");
    `,
    expectedLLVM: {
      expectedOpcodes: ['call i8* @malloc', 'store i32 0', 'store i32 1'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue Cons(TLValue head, TLValue tail)', 'tl_variant("Cons"']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue Cons(const TLValue& head, const TLValue& tail)', 'TLValue::make_variant("Cons"']
    }
  },
  {
    id: 'adt_04_gadt_typed_constructors',
    name: '9.4 GADT with Typed Constructor Return Signatures',
    category: 'Algebraic Data Types (ADTs & GADTs)',
    description: 'Tests Generalized Algebraic Data Types with explicit return types.',
    code: `
      type Expr<a> =
        | Lit(n: number): Expr<number>
        | Flag(b: boolean): Expr<boolean>
        | Add(left: Expr<number>, right: Expr<number>): Expr<number>;

      let e1 = Lit(5.0);
      let e2 = Lit(10.0);
      let eSum = Add(e1, e2);
      println("GADT AST nodes constructed");
    `,
    expectedLLVM: {
      expectedOpcodes: ['call i8* @malloc', 'store i32 0', 'store i32 2'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue Lit(TLValue n)', 'TLValue Add(TLValue left, TLValue right)']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue Lit(const TLValue& n)', 'TLValue Add(const TLValue& left, const TLValue& right)']
    }
  },

  // =========================================================================
  // Category 10: Pattern Matching (match expressions)
  // =========================================================================
  {
    id: 'match_01_literal_matching',
    name: '10.1 Literal Value Pattern Matching',
    category: 'Pattern Matching',
    description: 'Tests literal integer and wildcard matching in match blocks.',
    code: `
      let code = 2.0;
      let desc = match (code) {
        1.0 => "One",
        2.0 => "Two",
        _   => "Other"
      };
      println(desc);
    `,
    expectedLLVM: {
      expectedOpcodes: ['switch', 'match.arm0', 'match.arm1', 'match.merge'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_eq_bool(', 'desc']
    },
    expectedCpp: {
      expectedSnippets: ['==', 'desc']
    }
  },
  {
    id: 'match_02_constructor_deconstruction',
    name: '10.2 ADT Constructor Pattern Deconstruction',
    category: 'Pattern Matching',
    description: 'Tests tag unwrapping and variable binding from ADT variants.',
    code: `
      type Opt<a> = SomeVal(v: a) | NoVal;

      function unwrap(opt: Opt<number>, fallback: number): number {
        match (opt) {
          SomeVal(val) => val,
          NoVal => fallback
        }
      }

      let res1 = unwrap(SomeVal(99.0), 0.0);
      let res2 = unwrap(NoVal, -1.0);
      println(res1);
      println(res2);
    `,
    expectedLLVM: {
      expectedOpcodes: ['switch i32', 'match.arm0', 'match.arm1', 'match.merge', 'phi double'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_is_tag(', 'tl_var_arg(']
    },
    expectedCpp: {
      expectedSnippets: ['->tag == "SomeVal"', '.var_val->args']
    }
  },
  {
    id: 'match_03_multi_arg_constructor_pattern',
    name: '10.3 Multi-Argument Constructor Pattern Matching',
    category: 'Pattern Matching',
    description: 'Tests unpacking multiple constructor arguments simultaneously.',
    code: `
      type Pair<a> = Pair(first: a, second: a);

      let p = Pair(15.0, 25.0);
      let sum = match (p) {
        Pair(a, b) => a + b
      };
      println(sum);
    `,
    expectedLLVM: {
      expectedOpcodes: ['match.arm0', 'fadd double'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_is_tag(', 'tl_var_arg(']
    },
    expectedCpp: {
      expectedSnippets: ['->tag == "Pair"', '.var_val->args']
    }
  },
  {
    id: 'match_04_pattern_guards',
    name: '10.4 Pattern Matching with Guards (if condition)',
    category: 'Pattern Matching',
    description: 'Tests conditional guard evaluation before executing match arm.',
    code: `
      type BoxNum = Val(n: number);

      function classify(b: BoxNum): string {
        match (b) {
          Val(x) if x > 100.0 => "High",
          Val(x)              => "Normal"
        }
      }

      println(classify(Val(150.0)));
      println(classify(Val(42.0)));
    `,
    expectedLLVM: {
      expectedOpcodes: ['fcmp ogt double', 'match.guard_pass', 'br i1'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_is_truthy(tl_gt(']
    },
    expectedCpp: {
      expectedSnippets: ['> TLValue(100)']
    }
  },
  {
    id: 'match_05_tuple_pattern_matching',
    name: '10.5 Tuple Pattern Matching',
    category: 'Pattern Matching',
    description: 'Tests matching and deconstructing tuple structures.',
    code: `
      let coords = [3.0, 4.0];
      let hypotSq = match (coords) {
        [x, y] => x * x + y * y
      };
      println(hypotSq);
    `,
    expectedLLVM: {
      expectedOpcodes: ['fmul double', 'fadd double'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_get_index(']
    },
    expectedCpp: {
      expectedSnippets: ['[TLValue(0)]', '[TLValue(1)]']
    }
  },
  {
    id: 'match_06_record_pattern_matching',
    name: '10.6 Record Pattern Matching',
    category: 'Pattern Matching',
    description: 'Tests matching and binding specific named fields from records.',
    code: `
      let user = { name: "Bob", role: "Admin" };
      let greeting = match (user) {
        { name, role } => concat(concat("Hello ", name), concat(" (", concat(role, ")")))
      };
      println(greeting);
    `,
    expectedLLVM: {
      expectedOpcodes: ['call i8* @_tl_record_get'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_get_field(']
    },
    expectedCpp: {
      expectedSnippets: ['.get("name")', '.get("role")']
    }
  },
  {
    id: 'match_07_rest_fallback_pattern',
    name: '10.7 Rest / Fallback Pattern (... => fallback)',
    category: 'Pattern Matching',
    description: 'Tests rest wildcard pattern syntax catching remaining variants.',
    code: `
      type State = Init | Running | Suspended | Terminated;

      function isFinished(s: State): boolean {
        match (s) {
          Terminated => true,
          ...        => false
        }
      }

      println(isFinished(Terminated));
      println(isFinished(Running));
    `,
    expectedLLVM: {
      expectedOpcodes: ['match.arm', 'match.merge'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_is_tag(']
    },
    expectedCpp: {
      expectedSnippets: ['->tag == "Terminated"']
    }
  },

  // =========================================================================
  // Category 11: Modules & Namespaces
  // =========================================================================
  {
    id: 'mod_01_exported_functions',
    name: '11.1 Module with Exported Functions',
    category: 'Modules & Namespaces',
    description: 'Tests module declarations with public exported helper functions.',
    code: `
      module MathUtils {
        export function square(n: number): number {
          n * n
        }
        export function twice(n: number): number {
          n + n
        }
      }

      let sq = MathUtils.square(6.0);
      let dbl = MathUtils.twice(9.0);
      println(sq);
      println(dbl);
    `,
    expectedLLVM: {
      expectedOpcodes: ['define double @MathUtils_square', 'define double @MathUtils_twice', 'call double @MathUtils_square'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue MathUtils_square(TLValue n)', 'TLValue MathUtils_twice(TLValue n)']
    },
    expectedCpp: {
      expectedSnippets: ['namespace MathUtils {', 'TLValue square(', 'TLValue twice(']
    }
  },
  {
    id: 'mod_02_nested_modules',
    name: '11.2 Nested Modules and Qualified Calls',
    category: 'Modules & Namespaces',
    description: 'Tests multi-level module hierarchies and qualified member access.',
    code: `
      module Outer {
        module Inner {
          export function greet(name: string): string {
            concat("Greetings, ", name)
          }
        }
      }

      let msg = Outer.Inner.greet("Commander");
      println(msg);
    `,
    expectedLLVM: {
      expectedOpcodes: ['define i8* @Outer_Inner_greet', 'call i8* @Outer_Inner_greet'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['Outer_Inner_greet(']
    },
    expectedCpp: {
      expectedSnippets: ['namespace Outer {', 'namespace Inner {', 'TLValue greet(']
    }
  },

  // =========================================================================
  // Category 12: Monadic Do-Notation & Scoped Where Clauses
  // =========================================================================
  {
    id: 'monad_01_do_desugaring',
    name: '12.1 Monadic Do-Notation with Bind and Pure',
    category: 'Monadic Do & Where Clauses',
    description: 'Tests do-notation desugaring into flatMap sequences and pure returns.',
    code: `
      type Option<a> = Some(v: a) | None;

      function flatMap<a, b>(opt: Option<a>, f: (x: a) => Option<b>): Option<b> {
        match (opt) {
          Some(v) => f(v),
          None => None
        }
      }

      function pure<a>(val: a): Option<a> {
        Some(val)
      }

      function addOptions(oa: Option<number>, ob: Option<number>): Option<number> {
        do {
          a <- oa;
          b <- ob;
          pure a + b;
        }
      }

      let res = addOptions(Some(10.0), Some(20.0));
      println("Monadic do completed");
    `,
    expectedLLVM: {
      expectedOpcodes: ['define %struct.GADTValue* @addOptions', 'call %struct.GADTValue* @flatMap'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue flatMap(', 'TLValue pure(']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue flatMap(', 'TLValue pure(']
    }
  },
  {
    id: 'monad_02_where_clause',
    name: '12.2 Scoped Where Clause on Function Definitions',
    category: 'Monadic Do & Where Clauses',
    description: 'Tests local scoped where definitions attached to function bodies.',
    code: `
      function compute(x: number): number {
        helper(x) + offset
      } where {
        let offset = 10.0;
        function helper(n: number): number {
          n * 2.0
        }
      }

      let result = compute(15.0);
      println(result);
    `,
    expectedLLVM: {
      expectedOpcodes: ['define double @compute', 'fmul double', 'fadd double'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['TLValue compute(TLValue x)']
    },
    expectedCpp: {
      expectedSnippets: ['TLValue compute(const TLValue& x)']
    }
  },

  // =========================================================================
  // Category 13: Collections & Comprehensions
  // =========================================================================
  {
    id: 'coll_01_array_indexing',
    name: '13.1 Array Element Indexing and Length',
    category: 'Collections & Comprehensions',
    description: 'Tests dynamic array creation, element access via brackets, and updates.',
    code: `
      let items = [10.0, 20.0, 30.0, 40.0];
      let first = items[0];
      let third = items[2];
      println(first);
      println(third);
    `,
    expectedLLVM: {
      expectedOpcodes: ['%struct.Array*', 'getelementptr inbounds %struct.Array'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['tl_get_index(items, tl_num(0))', 'tl_get_index(items, tl_num(2))']
    },
    expectedCpp: {
      expectedSnippets: ['items[TLValue(0)]', 'items[TLValue(2)]']
    }
  },
  {
    id: 'coll_02_list_comprehension',
    name: '13.2 List Comprehensions with Mapping and Filter',
    category: 'Collections & Comprehensions',
    description: 'Tests Python-style list comprehensions transformed to filtered map loops.',
    code: `
      let nums = [1.0, 2.0, 3.0, 4.0, 5.0];
      let evensDoubled = [x * 2.0 for x in nums if x > 2.0];
      println(evensDoubled);
    `,
    expectedLLVM: {
      execute: true
    },
    expectedC: {
      expectedSnippets: ['nums']
    },
    expectedCpp: {
      expectedSnippets: ['TLArray _res', '.push_back(']
    }
  },

  // =========================================================================
  // Category 14: Standard Library & Built-in Interop
  // =========================================================================
  {
    id: 'stdlib_01_println_and_to_string',
    name: '14.1 Standard Output Logging and to_string Conversion',
    category: 'Standard Library & Builtins',
    description: 'Tests standard printing and type conversions.',
    code: `
      let count = 42.0;
      let label = "Total count: ";
      let msg = concat(label, to_string(count));
      println(msg);
    `,
    expectedLLVM: {
      expectedOpcodes: ['@printf', '@.fmt_str'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['to_string(', 'println(']
    },
    expectedCpp: {
      expectedSnippets: ['to_string(', 'println(']
    }
  },
  {
    id: 'stdlib_02_math_library',
    name: '14.2 Math Builtin Library (sqrt, floor, abs)',
    category: 'Standard Library & Builtins',
    description: 'Tests math functions across backends.',
    code: `
      let root = Math.sqrt(25.0);
      let rounded = Math.floor(9.8);
      let magnitude = Math.abs(-12.4);
      println(root);
      println(rounded);
      println(magnitude);
    `,
    expectedLLVM: {
      expectedOpcodes: ['call double @llvm.sqrt.f64', 'call double @llvm.floor.f64', 'call double @llvm.fabs.f64'],
      execute: true
    },
    expectedC: {
      expectedSnippets: ['sqrt(', 'floor(', 'fabs(']
    },
    expectedCpp: {
      expectedSnippets: ['std::sqrt(', 'std::floor(', 'std::abs(']
    }
  }
];

/**
 * Runs the exhaustive code generation test suite across LLVM, C, and C++ backends.
 */
export function runCodegenTestSuite(options: {
  filterId?: string;
  category?: string;
  target?: 'all' | 'llvm' | 'c' | 'cpp';
  verbose?: boolean;
} = {}): CodegenSuiteSummary {
  const startTime = performance.now();
  const results: CodegenTestResult[] = [];
  const errors: string[] = [];

  const llvmGen = new LLVMIRGenerator();
  const cGen = new CCodeGenerator();
  const interpreter = new LLVMInterpreter();

  const filteredTests = CODEGEN_TEST_CASES.filter(t => {
    if (options.filterId && t.id !== options.filterId) return false;
    if (options.category && t.category !== options.category) return false;
    if (options.target && t.target && t.target !== 'all' && t.target !== options.target) return false;
    return true;
  });

  for (const test of filteredTests) {
    const testStartTime = performance.now();
    const testErrors: string[] = [];
    let llvmPassed = true;
    let cPassed = true;
    let cppPassed = true;

    try {
      // 1. Lex and parse program AST
      const lexer = new Lexer(test.code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parseProgram();

      // ---------------------------------------------------------------------
      // 2. LLVM IR SSA Backend Validation
      // ---------------------------------------------------------------------
      if (!options.target || options.target === 'all' || options.target === 'llvm') {
        try {
          const llvmIR = llvmGen.generate(ast);

          // Structural header and entry checks
          if (!llvmIR.includes('define i32 @main()') || !llvmIR.includes('ret i32 0')) {
            throw new Error(`LLVM IR missing valid main() wrapper or return 0.`);
          }

          // Expected opcodes
          if (test.expectedLLVM?.expectedOpcodes) {
            for (const op of test.expectedLLVM.expectedOpcodes) {
              if (!llvmIR.includes(op)) {
                throw new Error(`LLVM IR missing expected opcode or token: "${op}"`);
              }
            }
          }

          // Forbidden patterns
          if (test.expectedLLVM?.forbiddenPatterns) {
            for (const pat of test.expectedLLVM.forbiddenPatterns) {
              if (pat.test(llvmIR)) {
                throw new Error(`LLVM IR matches forbidden pattern: ${pat}`);
              }
            }
          }

          // Custom LLVM validation callback
          if (test.expectedLLVM?.validate) {
            test.expectedLLVM.validate(llvmIR);
          }

          // In-engine LLVM execution verification
          if (test.expectedLLVM?.execute !== false) {
            const execResult = interpreter.execute(llvmIR);
            if (execResult.error) {
              throw new Error(`LLVM execution error: ${execResult.error}`);
            }
            if (test.expectedLLVM?.expectedExitCode !== undefined && execResult.exitCode !== test.expectedLLVM.expectedExitCode) {
              throw new Error(`Expected exit code ${test.expectedLLVM.expectedExitCode}, got ${execResult.exitCode}`);
            }
            if (test.expectedLLVM?.expectedStdoutSubstrings) {
              const fullOut = execResult.stdout.join('\n');
              for (const sub of test.expectedLLVM.expectedStdoutSubstrings) {
                if (!fullOut.includes(sub)) {
                  throw new Error(`LLVM stdout missing expected substring: "${sub}". Actual stdout: ${fullOut}`);
                }
              }
            }
          }
        } catch (err: any) {
          llvmPassed = false;
          testErrors.push(`[LLVM Backend]: ${err.message || String(err)}`);
        }
      }

      // ---------------------------------------------------------------------
      // 3. C Native Backend Validation (C11 / C99)
      // ---------------------------------------------------------------------
      if (!options.target || options.target === 'all' || options.target === 'c') {
        try {
          const cCode = cGen.generate(ast, { target: 'c', standard: 'c11', includePrelude: true, includeMain: true });

          // C structural validation
          if (!cCode.includes('int main(int argc, char** argv)') || !cCode.includes('return 0;')) {
            throw new Error(`C code missing valid main entry point.`);
          }
          if (!cCode.includes('typedef struct TL_Val TL_Val;') || !cCode.includes('TL_Kind')) {
            throw new Error(`C code missing TypeLang C tagged union runtime definition.`);
          }

          // Strictly ensure no C++ artifacts in C emission
          if (cCode.includes('namespace typelang') || cCode.includes('std::') || cCode.includes('using TLValue')) {
            throw new Error(`C code emission leaked C++ namespace or template features.`);
          }

          // Expected snippets
          if (test.expectedC?.expectedSnippets) {
            for (const snip of test.expectedC.expectedSnippets) {
              if (!cCode.includes(snip)) {
                throw new Error(`C code missing expected snippet: "${snip}"`);
              }
            }
          }

          // Forbidden patterns
          if (test.expectedC?.forbiddenPatterns) {
            for (const pat of test.expectedC.forbiddenPatterns) {
              if (pat.test(cCode)) {
                throw new Error(`C code matches forbidden pattern: ${pat}`);
              }
            }
          }

          if (test.expectedC?.validate) {
            test.expectedC.validate(cCode);
          }
        } catch (err: any) {
          cPassed = false;
          testErrors.push(`[C Backend]: ${err.message || String(err)}`);
        }
      }

      // ---------------------------------------------------------------------
      // 4. C++ Native Backend Validation (C++17 / C++20)
      // ---------------------------------------------------------------------
      if (!options.target || options.target === 'all' || options.target === 'cpp') {
        try {
          const cppCode = cGen.generate(ast, { target: 'cpp', standard: 'cpp17', includePrelude: true, includeMain: true });

          // C++ structural validation
          if (!cppCode.includes('int main(int argc, char** argv)') || !cppCode.includes('return 0;')) {
            throw new Error(`C++ code missing valid main entry point.`);
          }
          if (!cppCode.includes('namespace typelang') || !cppCode.includes('class TLValue')) {
            throw new Error(`C++ code missing typelang namespace or TLValue runtime class.`);
          }

          // Expected snippets
          if (test.expectedCpp?.expectedSnippets) {
            for (const snip of test.expectedCpp.expectedSnippets) {
              if (!cppCode.includes(snip)) {
                throw new Error(`C++ code missing expected snippet: "${snip}"`);
              }
            }
          }

          // Forbidden patterns
          if (test.expectedCpp?.forbiddenPatterns) {
            for (const pat of test.expectedCpp.forbiddenPatterns) {
              if (pat.test(cppCode)) {
                throw new Error(`C++ code matches forbidden pattern: ${pat}`);
              }
            }
          }

          if (test.expectedCpp?.validate) {
            test.expectedCpp.validate(cppCode);
          }
        } catch (err: any) {
          cppPassed = false;
          testErrors.push(`[C++ Backend]: ${err.message || String(err)}`);
        }
      }
    } catch (parseErr: any) {
      llvmPassed = false;
      cPassed = false;
      cppPassed = false;
      testErrors.push(`[Front-End]: ${parseErr.message || String(parseErr)}`);
    }

    const testPassed = llvmPassed && cPassed && cppPassed && testErrors.length === 0;
    const duration = Math.round(performance.now() - testStartTime);

    results.push({
      id: test.id,
      name: test.name,
      category: test.category,
      passed: testPassed,
      llvmPassed,
      cPassed,
      cppPassed,
      durationMs: duration,
      errors: testErrors
    });

    if (!testPassed) {
      errors.push(`❌ [${test.id}] ${test.name}:\n  ${testErrors.join('\n  ')}`);
    }
  }

  const durationMs = Math.round(performance.now() - startTime);
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    durationMs,
    results,
    errors
  };
}
