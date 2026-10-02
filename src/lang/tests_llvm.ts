import { Lexer } from './lexer';
import { Parser } from './parser';
import { LLVMIRGenerator } from './codegen_llvm';

export interface LLVMTestCase {
  name: string;
  stage: number;
  code: string;
  expectedOpcodes?: string[];
  forbiddenPatterns?: RegExp[];
  validate?: (llvmIR: string) => void;
}

export const llvmTestCases: LLVMTestCase[] = [
  // -------------------------------------------------------------------------
  // Stage 1: Primitives & Constants
  // -------------------------------------------------------------------------
  {
    name: '1.1 Number literal emission',
    stage: 1,
    code: `println(42.5);`,
    expectedOpcodes: ['@printf', '@.fmt_num', 'double 42.5'],
    forbiddenPatterns: [/bitcast double.*to i8\*/i]
  },
  {
    name: '1.2 Integer formatting emission',
    stage: 1,
    code: `println(100);`,
    expectedOpcodes: ['@printf', '@.fmt_num'],
    forbiddenPatterns: [/bitcast double.*to i8\*/i]
  },
  {
    name: '1.3 Boolean constants (true & false)',
    stage: 1,
    code: `println(true); println(false);`,
    expectedOpcodes: ['@.fmt_bool_t', '@.fmt_bool_f', 'select i1'],
    forbiddenPatterns: [/bitcast i1.*to i8\*/i]
  },
  {
    name: '1.4 String literals with interning & escaping',
    stage: 1,
    code: `println("Hello, LLVM!"); println("Hello, LLVM!");`,
    expectedOpcodes: ['@.str.0', 'c"Hello, LLVM!\\00"', '@printf', '@.fmt_str'],
    validate: (llvmIR) => {
      // Must intern string so only one @.str.0 constant exists for duplicates
      const matches = llvmIR.match(/@\.str\.\d+ = private unnamed_addr constant \[13 x i8\]/g);
      if (!matches || matches.length !== 1) {
        throw new Error(`Expected exactly 1 interned string declaration, found: ${matches?.length}`);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Stage 2: Operators & Expressions
  // -------------------------------------------------------------------------
  {
    name: '2.1 Floating-point arithmetic (+, -, *, /, %)',
    stage: 2,
    code: `
      let a = 10.0;
      let b = 3.0;
      let sum = a + b;
      let diff = a - b;
      let prod = a * b;
      let quot = a / b;
      let rem = a % b;
      println(sum);
    `,
    expectedOpcodes: [
      'fadd double',
      'fsub double',
      'fmul double',
      'fdiv double',
      'frem double'
    ]
  },
  {
    name: '2.2 Relational comparisons (<, <=, >, >=, ==, !=)',
    stage: 2,
    code: `
      let x = 5.0;
      let y = 10.0;
      let eq = x == y;
      let neq = x != y;
      let lt = x < y;
      let lte = x <= y;
      let gt = x > y;
      let gte = x >= y;
      println(eq);
    `,
    expectedOpcodes: [
      'fcmp oeq double',
      'fcmp one double',
      'fcmp olt double',
      'fcmp ole double',
      'fcmp ogt double',
      'fcmp oge double'
    ]
  },
  {
    name: '2.3 Boolean logic (&&, ||, !)',
    stage: 2,
    code: `
      let p = true;
      let q = false;
      let andRes = p && q;
      let orRes = p || q;
      let notRes = !p;
      println(andRes);
    `,
    expectedOpcodes: [
      'and i1',
      'or i1',
      'xor i1'
    ]
  },
  {
    name: '2.4 Unary negation (-)',
    stage: 2,
    code: `
      let x = 42.0;
      let neg = -x;
      println(neg);
    `,
    expectedOpcodes: [
      'fneg double'
    ]
  },

  // -------------------------------------------------------------------------
  // Stage 3: Variables, Scoping & Stack Slots
  // -------------------------------------------------------------------------
  {
    name: '3.1 Alloca allocation & store/load for numeric let bindings',
    stage: 3,
    code: `
      let a = 10.0;
      let b = 20.0;
      let c = a + b;
      println(c);
    `,
    expectedOpcodes: [
      '%a.var = alloca double',
      'store double 10.0, double* %a.var',
      '%b.var = alloca double',
      'store double 20.0, double* %b.var',
      'load double, double* %a.var',
      'load double, double* %b.var'
    ]
  },
  {
    name: '3.2 Stack allocation for string & boolean variables',
    stage: 3,
    code: `
      let msg = "Hello Native";
      let flag = true;
      println(msg);
      println(flag);
    `,
    expectedOpcodes: [
      '%msg.var = alloca i8*',
      '%flag.var = alloca i1',
      'store i8*',
      'store i1'
    ]
  },
  {
    name: '3.3 Variable reassignment & mutation',
    stage: 3,
    code: `
      let counter = 0.0;
      counter = 1.0;
      counter = counter + 5.0;
      println(counter);
    `,
    expectedOpcodes: [
      '%counter.var = alloca double',
      'store double 0.0, double* %counter.var',
      'store double 1.0, double* %counter.var',
      'fadd double'
    ]
  },

  // -------------------------------------------------------------------------
  // Stage 4: Control Flow & Basic Blocks
  // -------------------------------------------------------------------------
  {
    name: '4.1 If/else conditional branching and SSA phi merge',
    stage: 4,
    code: `
      let x = 15.0;
      let label = if (x > 10.0) { "Greater" } else { "Smaller" };
      println(label);
    `,
    expectedOpcodes: [
      'fcmp ogt double',
      'br i1',
      'then.',
      'else.',
      'merge.',
      '= phi i8*'
    ]
  },
  {
    name: '4.2 Statement if-block without else',
    stage: 4,
    code: `
      let count = 5.0;
      if (count > 0.0) {
        println("Positive count");
      }
    `,
    expectedOpcodes: [
      'fcmp ogt double',
      'br i1',
      'then.',
      'else.',
      'merge.'
    ]
  },

  // -------------------------------------------------------------------------
  // Stage 5: Loops & Iteration
  // -------------------------------------------------------------------------
  {
    name: '5.1 While loop with counter condition & back-edge jump',
    stage: 5,
    code: `
      let i = 0.0;
      let total = 0.0;
      while (i < 5.0) {
        total = total + i;
        i = i + 1.0;
      }
      println(total);
    `,
    expectedOpcodes: [
      'while.cond.',
      'while.body.',
      'while.merge.',
      'br i1',
      'fcmp olt double'
    ]
  },
  {
    name: '5.2 For loop with init, condition, update, and body',
    stage: 5,
    code: `
      let sum = 0.0;
      for (let i = 0.0; i < 10.0; i = i + 1.0) {
        sum = sum + i;
      }
      println(sum);
    `,
    expectedOpcodes: [
      'for.cond.',
      'for.body.',
      'for.merge.',
      'fcmp olt double'
    ]
  },

  // -------------------------------------------------------------------------
  // Stage 6: Top-Level Functions & Signatures
  // -------------------------------------------------------------------------
  {
    name: '6.1 Top-level typed function with parameters and return value',
    stage: 6,
    code: `
      function add(a: number, b: number): number {
        return a + b;
      }
      let res = add(3.0, 7.0);
      println(res);
    `,
    expectedOpcodes: [
      'define double @add(double %arg.a, double %arg.b) {',
      '%a.addr = alloca double',
      '%b.addr = alloca double',
      'fadd double',
      'ret double',
      'call double @add(double 3.0, double 7.0)'
    ]
  },
  {
    name: '6.2 Recursive factorial function',
    stage: 6,
    code: `
      function factorial(n: number): number {
        if (n <= 1.0) {
          1.0
        } else {
          n * factorial(n - 1.0)
        }
      }
      println(factorial(5.0));
    `,
    expectedOpcodes: [
      'define double @factorial(double %arg.n) {',
      'call double @factorial(',
      'fmul double',
      '= phi double'
    ]
  },

  // -------------------------------------------------------------------------
  // Stage 7: Higher-Order Functions & Lambdas
  // -------------------------------------------------------------------------
  {
    name: '7.1 First-class anonymous lambda and function pointer call',
    stage: 7,
    code: `
      let square = (x: number) => x * x;
      let res = square(6.0);
      println(res);
    `,
    expectedOpcodes: [
      'define internal i8* @.lambda_',
      'bitcast i8* (i8*)* @.lambda_',
      'fmul double'
    ]
  },

  // -------------------------------------------------------------------------
  // Stage 8: Tagged Unions (GADTs) & Heap Layouts
  // -------------------------------------------------------------------------
  {
    name: '8.1 GADT constructor allocation & struct tagging',
    stage: 8,
    code: `
      type Expr<a> =
        | Lit(val: a): Expr<a>
        | Succ(prev: Expr<number>): Expr<number>;

      let e1 = Lit(42.0);
      let e2 = Succ(e1);
    `,
    expectedOpcodes: [
      'call i8* @malloc(i64 16)',
      'bitcast i8* %t',
      '%struct.GADTValue*',
      'store i32 0, i32*',
      'store i32 1, i32*'
    ]
  },

  // -------------------------------------------------------------------------
  // Stage 9: Pattern Matching Engine
  // -------------------------------------------------------------------------
  {
    name: '9.1 Pattern matching switch table & arm deconstruction',
    stage: 9,
    code: `
      type Option<a> =
        | Some(val: a): Option<a>
        | None: Option<a>;

      function unwrapOr(opt: Option<number>, fallback: number): number {
        match (opt) {
          Some(v) => v,
          None => fallback
        }
      }

      let o1 = Some(99.0);
      let res = unwrapOr(o1, 0.0);
      println(res);
    `,
    expectedOpcodes: [
      'switch i32',
      'label %match.arm0',
      'label %match.arm1',
      'match.merge.',
      '= phi double'
    ]
  }
];

export function runLLVMUnitTests(): { total: number; passed: number; failed: number; errors: string[] } {
  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const test of llvmTestCases) {
    try {
      const lexer = new Lexer(test.code);
      const parser = new Parser(lexer.tokenize());
      const ast = parser.parseProgram();
      const generator = new LLVMIRGenerator();
      const llvmIR = generator.generate(ast);

      // 1. Basic structural validation
      if (!llvmIR.includes('define i32 @main()') || !llvmIR.includes('ret i32 0')) {
        throw new Error(`Generated LLVM IR missing valid main() function wrapper.`);
      }

      // 2. Expected opcodes check
      if (test.expectedOpcodes) {
        for (const op of test.expectedOpcodes) {
          if (!llvmIR.includes(op)) {
            throw new Error(`Missing expected LLVM opcode/symbol: "${op}"`);
          }
        }
      }

      // 3. Forbidden pattern check
      if (test.forbiddenPatterns) {
        for (const pattern of test.forbiddenPatterns) {
          if (pattern.test(llvmIR)) {
            throw new Error(`LLVM IR contained forbidden invalid pattern: ${pattern}`);
          }
        }
      }

      // 4. Custom validation callback
      if (test.validate) {
        test.validate(llvmIR);
      }

      passed++;
    } catch (err: any) {
      failed++;
      errors.push(`[${test.name}]: ${err.message || String(err)}`);
    }
  }

  return { total: llvmTestCases.length, passed, failed, errors };
}
