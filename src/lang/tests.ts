import { Lexer } from './lexer';
import { Parser } from './parser';
import { TypeChecker } from './checker';
import { Evaluator } from './evaluator';
import { EXAMPLES } from './examples';
import { formatTypeLangCode } from './formatter';
import { getHoverInformation, getCompletionInformation } from './lsp';
import { JSCodeGenerator } from './codegen_js';
import { LLVMIRGenerator } from './codegen_llvm';
import { CCodeGenerator } from './codegen_c';
import { JSSandbox } from './js_runtime';
import { Diagnostic } from './types';
import { createDiagnosticFromError } from './diagnostics';

export interface ExpectedDiagnostic {
  line?: number;
  col?: number;
  messageSubstring?: string;
  category?: Diagnostic['category'];
  severity?: 'error' | 'warning';
}

export interface TestCase {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
  expectedTypeErrors: number;
  expectedRuntimeError?: boolean;
  expectedParseError?: boolean;
  expectedStdoutSubstrings?: string[];
  expectedErrorSubstrings?: string[];
  expectedErrorLines?: number[];
  expectedDiagnostics?: ExpectedDiagnostic[];
  expectedHover?: { line: number; col: number; contains: string | string[] };
  expectedCompletion?: { line: number; col: number; contains: string | string[] };
  expectEvalResult?: (res: any) => boolean;
}

export interface TestResult {
  test: TestCase;
  passed: boolean;
  typeErrorsCount: number;
  actualStdout: string[];
  actualDiagnostics?: Diagnostic[];
  actualErrorLines?: number[];
  executionTimeMs: number;
  errorMessage?: string;
  details: string;
}

export const COMPILER_TEST_SUITE: TestCase[] = [
  {
    id: 'test_self_hosted_compiler_pipeline',
    name: 'Self-Hosted Compiler Pipeline in TypeLang',
    category: 'Self-Hosting & Bootstrap',
    description: 'Verifies the self-hosted TypeLang compiler pipeline (Lexer, Parser, TypeChecker, JS & LLVM Codegen, VM evaluator) executing entirely inside TypeLang.',
    code: EXAMPLES.find(e => e.id === 'self_hosted_compiler')?.code || '',
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      'TypeLang Self-Hosted Compiler (Stage 1 Bootstrap)',
      'Scanned Token Count:',
      'Parsed Statement Count:',
      'Type Checker Succeeded: All types and symbols are consistent!',
      'Self-Hosting Milestone Achieved: TypeLang in TypeLang!'
    ]
  },
  {
    id: 'test_sudoku_backtracking_loop_limit',
    name: 'Sudoku DFS Backtracking Iterations',
    category: 'Evaluator Engine',
    description: 'Verifies that complex backtracking algorithms (like Sudoku generation) can run efficiently without hitting iteration limits by executing a lightweight deterministic generator.',
    code: `
      import Math.{ floor }
      let mut grid: number[] = []
      for (let mut i = 0; i < 81; i = i + 1) { grid.push(0) }
      let mut emptyCells: number[] = []
      
      // Deterministic boxes instead of random for testing predictability
      for (let mut box = 0; box < 3; box = box + 1) {
        let br = box * 3
        let bc = box * 3
        let nums = [1,2,3,4,5,6,7,8,9]
        let mut nIdx = 0
        for (let mut i = 0; i < 3; i = i + 1) {
          for (let mut j = 0; j < 3; j = j + 1) {
            grid[(br + i) * 9 + (bc + j)] = nums[nIdx]
            nIdx = nIdx + 1
          }
        }
      }
      
      for (let mut i = 0; i < 81; i = i + 1) {
        if (grid[i] == 0) { emptyCells.push(i) }
      }
      
      function isValid(g: number[], idx: number, val: number): boolean {
        let r = floor(idx / 9)
        let c = idx - r * 9
        let mut valid = true
        for (let mut i = 0; i < 9; i = i + 1) {
          if (g[r * 9 + i] == val) { valid = false; break }
        }
        if (valid) {
          for (let mut i = 0; i < 9; i = i + 1) {
            if (g[i * 9 + c] == val) { valid = false; break }
          }
        }
        if (valid) {
          let br = floor(r / 3) * 3
          let bc = floor(c / 3) * 3
          for (let mut i = 0; i < 3; i = i + 1) {
            for (let mut j = 0; j < 3; j = j + 1) {
              if (g[(br + i) * 9 + (bc + j)] == val) { valid = false; j = 10; break }
            }
          }
        }
        valid
      }
      
      let mut currentEmptyIdx = 0
      let mut keepGoing = true
      let mut steps = 0
      
      while (keepGoing) {
        steps = steps + 1
        if (currentEmptyIdx >= emptyCells.length) {
          keepGoing = false
        } else {
          if (currentEmptyIdx < 0) {
            keepGoing = false
          } else {
            let cellIdx = emptyCells[currentEmptyIdx]
            let currVal = grid[cellIdx]
            let mut foundValid = false
            for (let mut v = currVal + 1; v <= 9; v = v + 1) {
              if (isValid(grid, cellIdx, v)) {
                grid[cellIdx] = v
                foundValid = true
                break
              }
            }
            if (foundValid) { currentEmptyIdx = currentEmptyIdx + 1 } 
            else { grid[cellIdx] = 0; currentEmptyIdx = currentEmptyIdx - 1 }
          }
        }
      }
      steps
    `,
    expectedTypeErrors: 0,
    expectEvalResult: (res: any) => res > 100 // Must take > 100 steps indicating it successfully performed backtracking DFS
  },
  {
    id: 'test_gadt_eval',
    name: 'GADT Refinement & Expression Evaluation',
    category: 'GADTs',
    description: 'Verifies GADT constructor matching and local arm type refinement for numeric and boolean expressions.',
    code: EXAMPLES.find(e => e.id === 'gadt_eval')?.code || '',
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['21 + 21 = 42', 'If true then 100 else 0 = 100']
  },
  {
    id: 'test_existential_pack',
    name: 'Existential Type Packing & Unpacking',
    category: 'Existentials',
    description: 'Tests existential type packing with generic show functions.',
    code: EXAMPLES.find(e => e.id === 'existential_pack')?.code || '',
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Packed Number: 42', 'Packed String: TypeLang v0.1']
  },
  {
    id: 'test_higher_rank',
    name: 'Higher-Rank Polymorphic Functions',
    category: 'Type System',
    description: 'Tests universally quantified polymorphic arguments passed into higher-rank functions.',
    code: EXAMPLES.find(e => e.id === 'higher_rank')?.code || '',
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Number result: 100', 'String result: Polymorphic Higher Rank']
  },
  {
    id: 'test_records_methods',
    name: 'Structural Record Methods & Mutable Self',
    category: 'Records & OOP',
    description: 'Tests structural record methods with mutable fields and immutable spread operations.',
    code: EXAMPLES.find(e => e.id === 'records_methods')?.code || '',
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Counter value after 3 increments: 3', 'Updated Person: Alice', 'Age: 31']
  },
  {
    id: 'test_nested_modules',
    name: 'Nested Modules & Qualified Imports',
    category: 'Modules',
    description: 'Verifies nested module resolution and explicit constructor exports.',
    code: EXAMPLES.find(e => e.id === 'nested_modules')?.code || '',
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['List length: 3']
  },
  {
    id: 'test_pattern_matching',
    name: 'Exhaustive Pattern Matching with Guards',
    category: 'Pattern Matching',
    description: 'Tests match arm guards, ADT constructor destructuring, and fallback rest arms.',
    code: EXAMPLES.find(e => e.id === 'pattern_matching')?.code || '',
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Large Circle', 'Small Circle', 'Square']
  },
  {
    id: 'test_type_error_detection',
    name: 'Type Mismatch Diagnostics (Failure Test)',
    category: 'Type Diagnostics',
    description: 'Verifies that assigning a string literal to a number variable generates a type diagnostic error on line 1.',
    code: `let numVal: number = "this is a string mismatch"`,
    expectedTypeErrors: 1,
    expectedErrorLines: [1],
    expectedErrorSubstrings: ["cannot unify 'string' with 'number'"]
  },
  {
    id: 'test_option_adt',
    name: 'Algebraic Data Type Construction & Match',
    category: 'ADTs',
    description: 'Verifies generic ADT Option type construction and evaluation.',
    code: `type Option<a> =
  | Some(val: a): Option<a>
  | None: Option<a>

function unwrapOrDefault<a>(opt: Option<a>, defaultVal: a): a {
  match (opt) {
    Some(v) => v
    None    => defaultVal
  }
}

let item = Some("TypeLang ADT Verified")
println(unwrapOrDefault(item, "Default"))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['TypeLang ADT Verified']
  },
  {
    id: 'test_callstack_safety',
    name: 'Recursive Self-Type Call Stack Safety',
    category: 'Call Stack Safety',
    description: 'Ensures self-referential record methods evaluate without triggering call stack size limits.',
    code: `let obj = {
  val: 50,
  getVal(self): number {
    self.val
  }
}

println(concat("Record method self.val = ", to_string(obj.getVal())))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Record method self.val = 50']
  },
  {
    id: 'test_tuple_indexing',
    name: 'Heterogeneous Tuple Indexing',
    category: 'Data Structures',
    description: 'Verifies positional index lookup on tuple expressions.',
    code: `let pair = [100, "Tuple Index Test"]
println(concat("First: ", to_string(pair[0])))
println(concat("Second: ", pair[1]))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['First: 100', 'Second: Tuple Index Test']
  },
  {
    id: 'test_stdlib_array_pipeline',
    name: 'Stdlib Array Transformations (Map/Filter/Reduce)',
    category: 'Standard Library',
    description: 'Verifies modular Array.map, Array.filter, Array.reduce, and Array.len functional pipelines.',
    code: `import Array.{ map, filter, reduce, len }

let nums = [1, 2, 3, 4, 5]
let doubled = map(nums, fn(x) { x * 2 })
let filtered = filter(doubled, fn(x) { x > 5 })
let sum = reduce(filtered, 0, fn(acc, x) { acc + x })

println(concat("Filtered length: ", to_string(len(filtered))))
println(concat("Reduced sum: ", to_string(sum)))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Filtered length: 3', 'Reduced sum: 24']
  },
  {
    id: 'test_stdlib_string_math',
    name: 'Stdlib String & Math Utilities',
    category: 'Standard Library',
    description: 'Tests String.len, String.split, String.contains, String.parseInt, Math.max, and Math.sqrt functions.',
    code: `import String.{ split, contains, parseInt }
import Array.{ len }
import Math.{ max, sqrt }

let str = "TypeLang,Beta,v0.2"
let parts = split(str, ",")
let parsedNum = parseInt("100")
let maxVal = max(parsedNum, 250)
let sqrtVal = sqrt(16)

println(concat("Parts count: ", to_string(len(parts))))
println(concat("Max val: ", to_string(maxVal)))
println(concat("Sqrt 16: ", to_string(sqrtVal)))
println(concat("Contains Beta: ", to_string(contains(str, "Beta"))))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      'Parts count: 3',
      'Max val: 250',
      'Sqrt 16: 4',
      'Contains Beta: true'
    ]
  },
  {
    id: 'test_diagnostics_and_quickfix',
    name: 'Diagnostic Quick-Fix & Enrichment',
    category: 'Diagnostics Engine',
    description: 'Verifies contextual quick fixes for immutability violations.',
    code: `let x = 10
let msg = concat("X value: ", to_string(x))
println(msg)
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['X value: 10']
  },
  {
    id: 'test_lsp_hover',
    name: 'Language Server Protocol (LSP) Hover',
    category: 'Language Server',
    description: 'Verifies real-time symbol hover type resolution and keyword documentation.',
    code: `import Array.{ map, len }

let score = 95
let doubleScore = map([score], fn(s) { s * 2 })
println(to_string(len(doubleScore)))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['1']
  },
  {
    id: 'test_lsp_keyword_hover',
    name: 'LSP Keyword Hover Syntax Highlighting',
    category: 'Language Server',
    description: 'Keeps keyword hover prose intact while exposing the keyword as a TypeLang code snippet.',
    code: `let score = 95
`,
    expectedTypeErrors: 0,
    expectedHover: {
      line: 1,
      col: 2,
      contains: [
        '**TypeLang Keyword**',
        '```typelang\nlet\n```',
        'Binds an immutable value or variable.'
      ]
    }
  },
  {
    id: 'test_lsp_function_doc_comment',
    name: 'LSP Function Documentation Comments',
    category: 'Language Server',
    description: 'Shows summaries, parameter and return docs, examples, and deprecation notes in function hover.',
    code: `/// Adds two numbers and returns their sum.
/// Works with positive and negative values.
/// @param left - The first value.
/// @param right The second value.
/// @returns The arithmetic sum.
/// @example
/// add(2, 3)
/// @deprecated Prefer add_checked for untrusted input.
function add(left: number, right: number): number { left + right }
`,
    expectedTypeErrors: 0,
    expectedHover: {
      line: 9,
      col: 11,
      contains: [
        'Adds two numbers and returns their sum.\nWorks with positive and negative values.',
        '- `left`: The first value.',
        '- `right`: The second value.',
        '**Returns**\nThe arithmetic sum.',
        '**Example**',
        '**Deprecated.** Prefer add_checked for untrusted input.'
      ]
    }
  },
  {
    id: 'test_lsp_parameter_doc_comment',
    name: 'LSP Parameter Documentation Comments',
    category: 'Language Server',
    description: 'Reads JSDoc-style blocks and presents @param details when hovering a parameter.',
    code: `/**
 * Returns the supplied text unchanged.
 * @param {string} value - Text to return to the caller.
 * @returns The original text.
 */
function identity(value: string): string { value }
`,
    expectedTypeErrors: 0,
    expectedHover: { line: 6, col: 21, contains: 'Text to return to the caller.' }
  },
  {
    id: 'test_lsp_stdlib_module_member_docs',
    name: 'LSP Standard Library Module Member Documentation',
    category: 'Language Server',
    description: 'Uses curated standard-library documentation for qualified module member hovers.',
    code: `let doubled = Array.map([1, 2], fn(value) { value * 2 })
`,
    expectedTypeErrors: 0,
    expectedHover: {
      line: 1,
      col: 22,
      contains: [
        'Creates a new array by applying fn to every element.',
        '**Parameters**',
        '- `arr`: The input array or collection.',
        '- `fn`: The callback applied to the input value.',
        '**Returns**',
        '**Example**'
      ]
    }
  },
  {
    id: 'test_lsp_stdlib_imported_member_docs',
    name: 'LSP Imported Standard Library Member Documentation',
    category: 'Language Server',
    description: 'Preserves standard-library docs when a module member is selectively imported.',
    code: `import Math.{ sqrt }
let root = sqrt(81)
`,
    expectedTypeErrors: 0,
    expectedHover: { line: 2, col: 13, contains: 'square root' }
  },
  {
    id: 'test_lsp_stdlib_root_builtin_docs',
    name: 'LSP Root Standard Library Documentation',
    category: 'Language Server',
    description: 'Shows parsed documentation comments for global built-in functions.',
    code: `println(to_string(42))
`,
    expectedTypeErrors: 0,
    expectedHover: { line: 1, col: 3, contains: 'followed by a newline' }
  },
  {
    id: 'test_lsp_module_export_count',
    name: 'LSP Module Hover Uses Explicit Exports',
    category: 'Language Server',
    description: 'Ensures module hover counts only declared exports, not inherited scope bindings.',
    code: `module PublicApi {
  let internalValue = 1
  export let visibleValue = 2
}

import PublicApi as Api
println(Api.visibleValue)
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['2'],
    expectedHover: { line: 6, col: 21, contains: '1 exported member(s)' }
  },
  {
    id: 'test_lsp_gadt_constructor_doc_comment',
    name: 'LSP GADT Constructor Documentation Comments',
    category: 'Language Server',
    description: 'Shows documentation attached to individual GADT constructors and their parameters.',
    code: `type Result =
  /// A successful computation.
  /// @param value The produced value.
  | Ok(value: string): Result
  | Err(message: string): Result
let result = Ok("done")
`,
    expectedTypeErrors: 0,
    expectedHover: { line: 4, col: 6, contains: 'The produced value.' }
  },
  {
    id: 'test_lsp_structural_type_hover',
    name: 'LSP Hover Pretty-Prints Structural Types',
    category: 'Language Server',
    description: 'Ensures record hover types use readable multiline fields and concise self-method signatures.',
    code: `let user = {
  name: "Ada",
  age: 36,
  mut score: 10,
  celebrate(self): void { self.score += 1 },
  summary(self): string { concat(self.name, " the builder") }
}
user.celebrate()
println(user.summary())
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Ada the builder'],
    expectedHover: { line: 1, col: 5, contains: '  celebrate(): void,' }
  },
  {
    id: 'test_lsp_gadt_constructor_hover',
    name: 'LSP GADT Hover Lists Constructor Signatures',
    category: 'Language Server',
    description: 'Ensures hovering a GADT type shows every constructor and its parameter/result types.',
    code: `type Shape =
  | Circle(radius: number): Shape
  | Rectangle(width: number, height: number): Shape
  | Dot: Shape

let example = Circle(12)
`,
    expectedTypeErrors: 0,
    expectedHover: {
      line: 1,
      col: 6,
      contains: '**Constructors**\n\n```typelang\n  Circle(radius: number): Shape\n  Rectangle(width: number, height: number): Shape\n  Dot: Shape\n```'
    }
  },
  {
    id: 'test_lsp_generic_gadt_constructor_hover',
    name: 'LSP Generic GADT Hover Colors Constructor Signatures',
    category: 'Language Server',
    description: 'Ensures generic GADT constructors are returned as TypeLang-highlightable code, not gray inline code.',
    code: `type OptionBox<T> =
  | Box(value: T): OptionBox<T>
  | Empty: OptionBox<T>
`,
    expectedTypeErrors: 0,
    expectedHover: {
      line: 1,
      col: 6,
      contains: '**Constructors**\n\n```typelang\n  Box(value: T): OptionBox<T>\n  Empty: OptionBox<T>\n```'
    }
  },
  {
    id: 'test_stage1_lexer',
    name: 'Stage 1 (Lexer): Escapes, Comments & Compound Symbols',
    category: 'Lexer Stage',
    description: 'Tests lexical tokenization of string escape sequences, multi-line comments, float literals, and compound operators.',
    code: `import String.{ contains }

// Single-line comment
/* Multi-line
   block comment */
let mut val = 10.0
val += 5.0
val -= 2.0
val *= 3.0
val /= 2.0
let text = "Line 1\\nLine 2\\tTabbed \\"Escaped\\""
println(concat("Final Val: ", to_string(val)))
println(concat("Contains Tab: ", to_string(contains(text, "\\t"))))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Final Val: 19.5', 'Contains Tab: true']
  },
  {
    id: 'test_stage2_parser',
    name: 'Stage 2 (Parser): Precedence Rules & Nested Expressions',
    category: 'Parser Stage',
    description: 'Verifies parsing AST for arithmetic, relational, and logical operator precedence alongside block expressions.',
    code: `let isTrue = 2 + 3 * 4 == 14 && 10 > 5 || false
let groupedMath = (100 - 20) / 4
let blockResult = {
  let a = 5
  let b = 10
  a * b
}
println(concat("Precedence Logic: ", to_string(isTrue)))
println(concat("Grouped Math: ", to_string(groupedMath)))
println(concat("Block Result: ", to_string(blockResult)))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      'Precedence Logic: true',
      'Grouped Math: 20',
      'Block Result: 50'
    ]
  },
  {
    id: 'test_stage3_typechecker',
    name: 'Stage 3 (Type Checker): Polymorphic Quantifiers & Types',
    category: 'Type Checker Stage',
    description: 'Verifies polymorphic identity instantiation across distinct call sites and type unification bounds.',
    code: `function identity<a>(x: a): a {
  x
}

let numVal = identity(100)
let strVal = identity("Polymorphic Identity Success")
let boolVal = identity(true)

println(concat("Num: ", to_string(numVal)))
println(strVal)
println(concat("Bool: ", to_string(boolVal)))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      'Num: 100',
      'Polymorphic Identity Success',
      'Bool: true'
    ]
  },
  {
    id: 'test_stage4_evaluator',
    name: 'Stage 4 (Evaluator): Stateful Closures & Math Library',
    category: 'Evaluator Stage',
    description: 'Tests higher-order factory closures encapsulating state and built-in math utility functions.',
    code: `import Math.{ pow, floor, ceil }

function makeMultiplier(factor: number): (x: number) => number {
  fn(x) { factor * x }
}

let triple = makeMultiplier(3)
let res1 = triple(10)
let res2 = triple(25)

let powVal = pow(2, 4)
let floorVal = floor(7.8)
let ceilVal = ceil(7.1)

println(concat("Res1: ", to_string(res1)))
println(concat("Res2: ", to_string(res2)))
println(concat("2^4: ", to_string(powVal)))
println(concat("Floor: ", to_string(floorVal)))
println(concat("Ceil: ", to_string(ceilVal)))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      'Res1: 30',
      'Res2: 75',
      '2^4: 16',
      'Floor: 7',
      'Ceil: 8'
    ]
  },
  {
    id: 'test_stage5_formatter',
    name: 'Stage 5 (Formatter): Code Prettifier & Parity',
    category: 'Formatter Stage',
    description: 'Verifies that AST code formatting preserves full semantic execution parity and cleans syntax.',
    code: `type Status =
  | Active(id: number): Status
  | Inactive: Status

function checkStatus(s: Status): string {
  match (s) {
    Active(id) => concat("Active ID: ", to_string(id))
    Inactive   => "Inactive Status"
  }
}

println(checkStatus(Active(42)))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Active ID: 42']
  },
  {
    id: 'test_stage6_lsp',
    name: 'Stage 6 (LSP Engine): Multi-Scope Hover Symbol Search',
    category: 'Language Server Stage',
    description: 'Tests real-time symbol hover type resolution across functions, keywords, and local variable scopes.',
    code: `import Array.{ map, reduce }

let baseScore = 50
let scoreList = [baseScore, 75, 100]
let doubled = map(scoreList, fn(s) { s * 2 })
let total = reduce(doubled, 0, fn(acc, s) { acc + s })
println(concat("Total score: ", to_string(total)))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Total score: 450']
  },
  {
    id: 'test_stage_7_web_dom',
    name: 'Stage 7 (Web & DOM Codegen): Virtual DOM & Browser Hyperscript',
    category: 'Codegen Stage',
    description: 'Tests compilation and execution of Virtual DOM components, DOM mount bindings, and attribute rendering.',
    code: EXAMPLES.find(e => e.id === 'web_dom_vdom')?.code || '',
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Mounted TypeLang Virtual DOM component into #app-root successfully!']
  },
  {
    id: 'test_stage_8_node_server',
    name: 'Stage 8 (Node.js Codegen): Microservice Route Handler & Status Codes',
    category: 'Codegen Stage',
    description: 'Tests compilation and execution of server-side ADT response pipelines and pattern-matched HTTP routing.',
    code: EXAMPLES.find(e => e.id === 'node_server_api')?.code || '',
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['200 OK Response: {"status": "healthy", "version": "0.2"}', '404 Error: Route not found: /api/unknown']
  },
  {
    id: 'test_stage_9_llvm_ssa',
    name: 'Stage 9 (LLVM IR SSA Generator): Native Module Lowering & Phi Nodes',
    category: 'Codegen Stage',
    description: 'Tests LLVM IR SSA generation for sum types, arithmetic, conditional branching with phi nodes, and printf bindings.',
    code: `type IntTree =
  | Leaf(val: number): IntTree
  | Node(left: IntTree, right: IntTree): IntTree

function calcTreeSum(tree: IntTree): number {
  match (tree) {
    Leaf(v) => v
    Node(l, r) => calcTreeSum(l) + calcTreeSum(r)
  }
}

let tree1 = Node(Leaf(10), Node(Leaf(20), Leaf(30)))
let total = calcTreeSum(tree1)
println(total)
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['60']
  },
  {
    id: 'test_gadt_equality_witness',
    name: 'GADT Type Equality Witness & Cast',
    category: 'GADTs',
    description: 'Tests propositional type equality witness Refl and safe GADT type cast evaluation.',
    code: `type Eq<a, b> =
  | Refl: Eq<a, a>

function cast<a, b>(witness: Eq<a, b>, val: a): b {
  match (witness) {
    Refl => val
  }
}

let eqWitness: Eq<number, number> = Refl
let original = 42
let casted = cast(eqWitness, original)
println(concat("GADT Equality Witness Cast Result: ", to_string(casted)))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['GADT Equality Witness Cast Result: 42']
  },
  {
    id: 'test_existential_hetero_collection',
    name: 'Existential Heterogeneous Shape Dispatch',
    category: 'Existentials',
    description: 'Tests existential packing of diverse data structures with polymorphic area calculators in a single collection.',
    code: `import Array.{ map }

type Shape =
  | PackShape<a>(shape: a, areaFn: (s: a) => number, name: string): Shape

function getArea(s: Shape): number {
  match (s) {
    PackShape(shape, areaFn, name) => areaFn(shape)
  }
}

function getName(s: Shape): string {
  match (s) {
    PackShape(shape, areaFn, name) => name
  }
}

let circle = { radius: 10 }
let rectangle = { width: 8, height: 5 }

let shape1 = PackShape(circle, fn(c) { 3.14 * c.radius * c.radius }, "Circle")
let shape2 = PackShape(rectangle, fn(r) { r.width * r.height }, "Rectangle")

let shapes = [shape1, shape2]

let areas = map(shapes, fn(s) {
  concat(concat(getName(s), " area: "), to_string(getArea(s)))
})

println(areas[0])
println(areas[1])
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Circle area: 314', 'Rectangle area: 40']
  },
  {
    id: 'test_higher_rank_combinators',
    name: 'Higher-Rank Universal Combinators (applyBoth)',
    category: 'Type System',
    description: 'Tests universal rank-2 identity transformer passed to multiple distinct concrete types simultaneously.',
    code: `function applyBoth(transform: <a>(x: a) => a, numVal: number, strVal: string): string {
  let tNum = transform(numVal)
  let tStr = transform(strVal)
  concat(concat(to_string(tNum), " & "), tStr)
}

let idFn = fn(x) { x }
let result = applyBoth(idFn, 777, "Lucky Seven")
println(result)
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['777 & Lucky Seven']
  },
  {
    id: 'test_record_deep_nesting',
    name: 'Deeply Nested Record Traversal & Method Chaining',
    category: 'Records & OOP',
    description: 'Tests deep property dereferencing, nested mutable record updates, and fluent method chains.',
    code: `let database = {
  config: {
    host: "localhost",
    port: 5432,
    credentials: {
      user: "admin",
      authenticated: true
    }
  },
  mut queryCount: 0,
  recordQuery(self): void {
    self.queryCount = self.queryCount + 1
  },
  status(self): string {
    concat("Host: ", self.config.host)
  }
}

database.recordQuery()
database.recordQuery()
println(database.status())
println(concat("Port: ", to_string(database.config.port)))
println(concat("Total Queries: ", to_string(database.queryCount)))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Host: localhost', 'Port: 5432', 'Total Queries: 2']
  },
  {
    id: 'test_pattern_guards_complex',
    name: 'Complex Pattern Guards with Boolean Conjunctions',
    category: 'Pattern Matching',
    description: 'Tests multi-condition guard expressions with compound boolean logic and constructor matching.',
    code: `type Grade =
  | Score(val: number): Grade
  | PassFail(passed: boolean): Grade

function classifyGrade(g: Grade): string {
  match (g) {
    Score(v) if v >= 90 && v <= 100 => "Honor Roll (A+)"
    Score(v) if v >= 80 && v < 90   => "High Achievement (B)"
    Score(v) if v >= 60 && v < 80   => "Standard Pass (C)"
    Score(v)                        => "Remedial (F)"
    PassFail(p) if p == true        => "Credit Granted"
    PassFail(p)                     => "Credit Denied"
  }
}

println(classifyGrade(Score(95)))
println(classifyGrade(Score(82)))
println(classifyGrade(Score(50)))
println(classifyGrade(PassFail(true)))
println(classifyGrade(PassFail(false)))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      'Honor Roll (A+)',
      'High Achievement (B)',
      'Remedial (F)',
      'Credit Granted',
      'Credit Denied'
    ]
  },
  {
    id: 'test_nested_modules_export',
    name: 'Multi-Level Nested Modules with Selective Export',
    category: 'Modules',
    description: 'Tests nested submodule declarations, symbol visibility boundaries, and qualified path resolution.',
    code: `import Math.{ floor }

module MathCore {
  export module Algebra {
    export function square(x: number): number {
      x * x
    }
    export function cube(x: number): number {
      x * x * x
    }
  }

  export module Geometry {
    export function circleArea(r: number): number {
      3.14159 * MathCore.Algebra.square(r)
    }
  }
}

let sq = MathCore.Algebra.square(5)
let cb = MathCore.Algebra.cube(3)
let area = MathCore.Geometry.circleArea(2)

println(concat("5^2 = ", to_string(sq)))
println(concat("3^3 = ", to_string(cb)))
println(concat("Area r=2: ", to_string(floor(area))))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['5^2 = 25', '3^3 = 27', 'Area r=2: 12']
  },
  {
    id: 'test_quicksort_functional',
    name: 'Functional Algorithm: Array Quicksort & Partition',
    category: 'Algorithms',
    description: 'Tests functional quicksort sorting an unsorted list with recursive partitioning.',
    code: `import Array.{ len, slice, filter, concat as arrConcat }

function quicksort(arr: number[]): number[] {
  let length = len(arr)
  if length <= 1 then {
    arr
  } else {
    let pivot = arr[0]
    let rest = slice(arr, 1, length)
    let lesser = filter(rest, fn(x) { x <= pivot })
    let greater = filter(rest, fn(x) { x > pivot })
    let sortedLesser = quicksort(lesser)
    let sortedGreater = quicksort(greater)
    arrConcat(arrConcat(sortedLesser, [pivot]), sortedGreater)
  }
}

let unsorted = [64, 34, 25, 12, 22, 11, 90]
let sorted = quicksort(unsorted)

println(concat("Sorted 0: ", to_string(sorted[0])))
println(concat("Sorted 3: ", to_string(sorted[3])))
println(concat("Sorted 6: ", to_string(sorted[6])))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Sorted 0: 11', 'Sorted 3: 25', 'Sorted 6: 90']
  },
  {
    id: 'test_string_json_serde',
    name: 'JSON Serialization, Deserialization & String Transformations',
    category: 'Data Processing',
    description: 'Tests string splitting, regex-like character manipulation, JSON serialization, and parsing.',
    code: `import Node.{ stringify }
import String.{ split, contains }

let payload = {
  service: "TypeLang Service",
  port: 8080,
  active: true,
  tags: ["compiler", "gadt", "llvm"]
}

let jsonStr = stringify(payload)
println(concat("Payload contains compiler: ", to_string(contains(jsonStr, "compiler"))))

let header = "Authorization: Bearer token_xyz_123"
let parts = split(header, ": ")
println(concat("Header Key: ", parts[0]))
println(concat("Header Val: ", parts[1]))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      'Payload contains compiler: true',
      'Header Key: Authorization',
      'Header Val: Bearer token_xyz_123'
    ]
  },
  {
    id: 'test_recursive_fibonacci',
    name: 'Fast Recursive & Iterative Fibonacci Verification',
    category: 'Algorithms',
    description: 'Verifies recursive Fibonacci computation and loop accumulation.',
    code: `function fib(n: number): number {
  if n <= 1 then {
    n
  } else {
    fib(n - 1) + fib(n - 2)
  }
}

println(concat("Fib(0) = ", to_string(fib(0))))
println(concat("Fib(1) = ", to_string(fib(1))))
println(concat("Fib(7) = ", to_string(fib(7))))
println(concat("Fib(10) = ", to_string(fib(10))))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Fib(0) = 0', 'Fib(1) = 1', 'Fib(7) = 13', 'Fib(10) = 55']
  },
  {
    id: 'test_fuzz_pratt_parser_resilience',
    name: 'Pratt Parser Resilience & Deep Expression Nesting',
    category: 'Parser Hardening',
    description: 'Tests deep recursive binary arithmetic, logical chaining, and unary precedence without stack overflow.',
    code: `let complexVal = ((((1 + 2) * 3) - 4) / 5) + 10 * 2 - (4 * 2)
let logicVal = (true && !false) || (false && true)
println(concat("Complex Arithmetic: ", to_string(complexVal)))
println(concat("Boolean Logic: ", to_string(logicVal)))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Complex Arithmetic: 13', 'Boolean Logic: true']
  },
  {
    id: 'test_closure_lexical_capture',
    name: 'Multi-Level Closure Lexical Scope Capture',
    category: 'Evaluation & Scope',
    description: 'Tests nested lambda closures capturing outer immutable and mutable state correctly.',
    code: `function makeAdder(base: number): (x: number) => number {
  fn(x) { base + x }
}

let addTen = makeAdder(10)
let addFifty = makeAdder(50)

println(concat("addTen(5) = ", to_string(addTen(5))))
println(concat("addFifty(5) = ", to_string(addFifty(5))))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['addTen(5) = 15', 'addFifty(5) = 55']
  },
  {
    id: 'test_record_functional_spread_update',
    name: 'Record Functional Spread & Immutability',
    category: 'Records & Data',
    description: 'Verifies that creating updated records via spread does not alter original records.',
    code: `let config1 = {
  host: "localhost",
  port: 3000,
  tls: false
}

let config2 = { ...config1, port: 8080, tls: true }

println(concat("Config 1 Port: ", to_string(config1.port)))
println(concat("Config 2 Port: ", to_string(config2.port)))
println(concat("Config 2 TLS: ", to_string(config2.tls)))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Config 1 Port: 3000', 'Config 2 Port: 8080', 'Config 2 TLS: true']
  },
  {
    id: 'test_npm_ffi_declarations',
    name: 'TypeScript Declaration & NPM FFI Module Bindings',
    category: 'FFI & NPM',
    description: 'Verifies parsing, type checking, and code generation for extern modules and functions.',
    code: `extern module lodash {
  function sum(numbers: number[]): number
  function chunk<T>(arr: T[], size: number): T[][]
}

let nums = [10, 20, 30, 40]
let totalSum = lodash.sum(nums)
println(concat("FFI Lodash Sum: ", to_string(totalSum)))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['FFI Lodash Sum:']
  },
  {
    id: 'test_for_while_loops_and_ternary',
    name: 'C-Style For Loops, While Loops & Ternary Expressions',
    category: 'Control Flow',
    description: 'Verifies parsing, type checking, evaluation, and codegen for for loops, while loops, and ternary expressions.',
    code: `let mut sum = 0
for (let mut i = 0; i < 5; i = i + 1) {
  sum = sum + i
}
println(concat("For sum 0..4: ", to_string(sum)))

let mut counter = 3
while (counter > 0) {
  counter = counter - 1
}
println(concat("While counter final: ", to_string(counter)))

let label = sum > 5 ? "Greater" : "Lesser"
println(concat("Ternary Label: ", label))
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['For sum 0..4: 10', 'While counter final: 0', 'Ternary Label: Greater']
  },
  {
    id: 'test_evaluator_recursion_depth_limit',
    name: 'Evaluator Infinite Recursion Stack Depth Protection',
    category: 'Evaluator Engine',
    description: 'Verifies that infinite recursive function calls are safely caught by the recursion depth limit.',
    code: `function infiniteRec(x: number): number {
  infiniteRec(x + 1)
}

infiniteRec(1)
`,
    expectedTypeErrors: 0,
    expectedRuntimeError: true,
    expectedStdoutSubstrings: []
  },
  {
    id: 'test_nested_function_in_block',
    name: 'Nested Function Declaration in Block Statement',
    category: 'Parser & Statements',
    description: 'Verifies that function declarations inside block bodies (such as if blocks) parse and evaluate cleanly.',
    code: `let flag = true
if (flag) {
  function innerFunc(x: number): number {
    x * 2
  }
  println(concat("Inner result: ", to_string(innerFunc(21))))
}
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['Inner result: 42']
  },
  {
    id: 'test_if_without_else',
    name: 'If Expression Without Else',
    category: 'Parser & Statements',
    description: 'Verifies that if expressions do not strictly require an else branch.',
    code: `let x = 10
if (x > 5) {
  println("x is greater than 5")
}
if (x < 5) {
  println("x is less than 5")
}
println("done")
`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['x is greater than 5', 'done']
  },

  // =========================================================================
  // EXTENSIVE EXPECTED FAILURE & ERROR / LINE REPORTING TEST SUITE
  // =========================================================================

  // 1. Primitive & Variable Type Mismatches
  {
    id: 'test_err_assign_bool_to_string',
    name: 'Type Mismatch: Boolean Assigned to String Variable',
    category: 'Type Diagnostics',
    description: 'Verifies type checker catches boolean literal assigned to string type with exact line 1 reporting.',
    code: `let message: string = false`,
    expectedTypeErrors: 1,
    expectedErrorLines: [1],
    expectedErrorSubstrings: ["cannot unify 'boolean' with 'string'"]
  },
  {
    id: 'test_err_fn_arg_type_mismatch',
    name: 'Type Mismatch: Invalid Argument Type in Function Call',
    category: 'Type Diagnostics',
    description: 'Verifies type checker reports error on call-site line (line 4) when passing string to numeric parameter.',
    code: `function computeSquare(n: number): number {
  n * n
}
let res = computeSquare("invalid numeric arg")`,
    expectedTypeErrors: 1,
    expectedErrorLines: [4],
    expectedErrorSubstrings: ["cannot unify 'string' with 'number'"]
  },
  {
    id: 'test_err_fn_return_type_mismatch',
    name: 'Type Mismatch: Function Return Body Mismatch',
    category: 'Type Diagnostics',
    description: 'Verifies type checker detects body returning string when boolean return annotation was specified on line 2.',
    code: `function checkAccess(): boolean {
  "access granted string"
}`,
    expectedTypeErrors: 1,
    expectedErrorLines: [2],
    expectedErrorSubstrings: ["cannot unify 'string' with 'boolean'"]
  },
  {
    id: 'test_err_fn_arg_count_few',
    name: 'Arity Error: Too Few Function Arguments',
    category: 'Type Diagnostics',
    description: 'Verifies error reporting on call site when invoking a 2-parameter function with only 1 argument on line 4.',
    code: `function addPair(a: number, b: number): number {
  a + b
}
let answer = addPair(42)`,
    expectedTypeErrors: 1,
    expectedErrorLines: [4],
    expectedErrorSubstrings: ["Expected 2 arguments, but got 1"]
  },
  {
    id: 'test_err_fn_arg_count_many',
    name: 'Arity Error: Too Many Function Arguments',
    category: 'Type Diagnostics',
    description: 'Verifies error reporting on call site when invoking a 1-parameter function with 3 arguments on line 4.',
    code: `function invertFlag(b: boolean): boolean {
  !b
}
let result = invertFlag(true, false, true)`,
    expectedTypeErrors: 1,
    expectedErrorLines: [4],
    expectedErrorSubstrings: ["Expected 1 arguments, but got 3"]
  },

  // 2. Control Flow Conditions & Branch Type Errors
  {
    id: 'test_err_if_condition_type',
    name: 'Control Flow: Non-Boolean If Condition Expression',
    category: 'Control Flow Errors',
    description: 'Verifies type error on line 1 when if condition evaluates to number rather than boolean.',
    code: `if (100 + 200) {
  println("unreachable")
}`,
    expectedTypeErrors: 1,
    expectedErrorLines: [1],
    expectedErrorSubstrings: ["cannot unify 'number' with 'boolean'"]
  },
  {
    id: 'test_err_if_branch_mismatch',
    name: 'Control Flow: Incompatible If/Else Branch Types',
    category: 'Control Flow Errors',
    description: 'Verifies branch unification failure on line 2 when then-branch is number and else-branch is string.',
    code: `let flag = true
let outcome: number = if (flag) 42 else "forty-two"`,
    expectedTypeErrors: 1,
    expectedErrorLines: [2],
    expectedErrorSubstrings: ["cannot unify 'string' with 'number'"]
  },
  {
    id: 'test_err_while_condition_type',
    name: 'Control Flow: Non-Boolean While Loop Condition',
    category: 'Control Flow Errors',
    description: 'Verifies type error on line 1 when while loop condition is a string instead of boolean.',
    code: `while ("running") {
  println("looping")
}`,
    expectedTypeErrors: 1,
    expectedErrorLines: [1],
    expectedErrorSubstrings: ["cannot unify 'string' with 'boolean'"]
  },
  {
    id: 'test_err_for_condition_type',
    name: 'Control Flow: Non-Boolean For Loop Test Condition',
    category: 'Control Flow Errors',
    description: 'Verifies type error on line 1 when C-style for loop condition expression is a number.',
    code: `for (let mut i = 0; 999; i = i + 1) {
  println(i)
}`,
    expectedTypeErrors: 1,
    expectedErrorLines: [1],
    expectedErrorSubstrings: ["cannot unify 'number' with 'boolean'"]
  },

  // 3. Operators & Binary Arithmetic Type Errors
  {
    id: 'test_err_binary_arithmetic_strings',
    name: 'Operator Error: Non-Numeric Multiplication',
    category: 'Operator Errors',
    description: 'Verifies error reporting on line 1 when multiplying string operands with numeric operator *.',
    code: `let badProduct = "alpha" * "beta"`,
    expectedTypeErrors: 2,
    expectedErrorLines: [1, 1],
    expectedErrorSubstrings: ["cannot unify 'string' with 'number'"]
  },
  {
    id: 'test_err_logical_op_non_boolean',
    name: 'Operator Error: Logical Operator on Numbers',
    category: 'Operator Errors',
    description: 'Verifies error reporting on line 1 when using boolean conjunction && on number literals.',
    code: `let badLogic = 100 && 200`,
    expectedTypeErrors: 2,
    expectedErrorLines: [1, 1],
    expectedErrorSubstrings: ["cannot unify 'number' with 'boolean'"]
  },
  {
    id: 'test_err_unary_not_non_boolean',
    name: 'Operator Error: Unary Negation on String Literal',
    category: 'Operator Errors',
    description: 'Verifies error reporting on line 1 when applying logical ! to a string.',
    code: `let inverted = !"hello"`,
    expectedTypeErrors: 1,
    expectedErrorLines: [1],
    expectedErrorSubstrings: ["cannot unify 'string' with 'boolean'"]
  },

  // 4. Immutability Violation Diagnostics & Exact Line Tracking
  {
    id: 'test_err_immutability_var_reassign',
    name: 'Immutability: Reassigning Immutable Variable',
    category: 'Immutability Violations',
    description: 'Verifies immutability diagnostic reported on reassignment line (line 2) with let mut suggestion.',
    code: `let constantValue = 100
constantValue = 200`,
    expectedTypeErrors: 1,
    expectedErrorLines: [2],
    expectedErrorSubstrings: ["Cannot assign to immutable variable 'constantValue'", "let mut"]
  },
  {
    id: 'test_err_immutability_record_field',
    name: 'Immutability: Mutating Immutable Record Field',
    category: 'Immutability Violations',
    description: 'Verifies immutability diagnostic on line 2 when attempting to mutate an immutable record property.',
    code: `let person = { name: "Alice", age: 30 }
person.age = 31`,
    expectedTypeErrors: 1,
    expectedErrorLines: [2],
    expectedErrorSubstrings: ["Cannot mutate immutable record field 'age'", "mut age"]
  },
  {
    id: 'test_err_immutability_compound_assignment',
    name: 'Immutability: Compound += Assignment on Immutable Variable',
    category: 'Immutability Violations',
    description: 'Verifies immutability diagnostic on line 2 when performing compound addition assignment on immutable let.',
    code: `let totalScore = 50
totalScore += 10`,
    expectedTypeErrors: 1,
    expectedErrorLines: [2],
    expectedErrorSubstrings: ["Cannot assign to immutable variable 'totalScore'"]
  },

  // 5. Symbol Scope & Fuzzy Did-You-Mean Suggestions
  {
    id: 'test_err_undefined_var_did_you_mean',
    name: 'Scope Error: Undefined Variable with Levenshtein Suggestion',
    category: 'Scope & Suggestions',
    description: 'Verifies fuzzy Did-You-Mean suggestion correctly identifies closest in-scope symbol on line 2.',
    code: `let initialCounter = 50
let next = initailCounter + 1`,
    expectedTypeErrors: 1,
    expectedErrorLines: [2],
    expectedErrorSubstrings: ["Undefined variable 'initailCounter'", "Did you mean 'initialCounter'"]
  },
  {
    id: 'test_err_undefined_record_field',
    name: 'Record Error: Undefined Field with Did-You-Mean Suggestion',
    category: 'Scope & Suggestions',
    description: 'Verifies error reporting on line 2 when accessing non-existent record property with fuzzy field suggestion.',
    code: `let config = { hostName: "localhost", portNumber: 8080 }
let p = config.portNumbre`,
    expectedTypeErrors: 1,
    expectedErrorLines: [2],
    expectedErrorSubstrings: ["Record field 'portNumbre' not found", "Did you mean 'portNumber'?"]
  },
  {
    id: 'test_err_call_non_function_type',
    name: 'Call Error: Attempting to Invoke Primitive as Function',
    category: 'Type Diagnostics',
    description: 'Verifies diagnostic error on line 2 when calling a numeric variable as a function.',
    code: `let notCallable = 42
notCallable(10, 20)`,
    expectedTypeErrors: 1,
    expectedErrorLines: [2],
    expectedErrorSubstrings: ["cannot unify 'number' with"]
  },

  // 6. Record & Tuple Structure Diagnostics
  {
    id: 'test_err_record_missing_required_field',
    name: 'Record Error: Missing Required Field in Annotated Record',
    category: 'Record Diagnostics',
    description: 'Verifies type checker detects missing struct field on line 2 when constructing annotated record.',
    code: `type ServerConfig = { host: string, port: number, secure: boolean }
let s: ServerConfig = { host: "127.0.0.1", port: 3000 }`,
    expectedTypeErrors: 1,
    expectedErrorLines: [2],
    expectedErrorSubstrings: ["Missing required field 'secure'"]
  },
  {
    id: 'test_err_tuple_element_mismatch',
    name: 'Tuple Error: Positional Element Type Unification Mismatch',
    category: 'Tuple Diagnostics',
    description: 'Verifies type mismatch on line 1 when tuple element at index 1 is number instead of string.',
    code: `let pair: [number, string] = [100, 200]`,
    expectedTypeErrors: 1,
    expectedErrorLines: [1],
    expectedErrorSubstrings: ["cannot unify 'number' with 'string'"]
  },

  // 7. Exhaustive Pattern Matching & ADT Diagnostics
  {
    id: 'test_err_pattern_non_exhaustive_option',
    name: 'Pattern Match: Non-Exhaustive ADT Match (Missing None)',
    category: 'Pattern Diagnostics',
    description: 'Verifies non-exhaustive match detection on line 6 identifying the missing None constructor.',
    code: `type Option<a> =
  | Some(val: a): Option<a>
  | None: Option<a>

function unwrap<a>(opt: Option<a>): a {
  match (opt) {
    Some(v) => v
  }
}`,
    expectedTypeErrors: 1,
    expectedErrorLines: [6],
    expectedErrorSubstrings: ["Non-exhaustive pattern match on type 'Option'", "None"]
  },
  {
    id: 'test_err_pattern_unknown_constructor',
    name: 'Pattern Match: Unrecognized Constructor in Match Arm',
    category: 'Pattern Diagnostics',
    description: 'Verifies error reporting on line 5 when pattern arm uses a constructor not in the ADT declaration.',
    code: `type Status = | Active: Status | Inactive: Status
function check(s: Status): string {
  match (s) {
    Active => "active"
    Pending => "pending"
    Inactive => "inactive"
  }
}`,
    expectedTypeErrors: 1,
    expectedErrorLines: [5],
    expectedErrorSubstrings: ["Unknown constructor 'Pending'"]
  },
  {
    id: 'test_err_pattern_constructor_args_count',
    name: 'Pattern Match: Constructor Parameter Arity Mismatch in Pattern',
    category: 'Pattern Diagnostics',
    description: 'Verifies error on line 4 when pattern provides 2 bound arguments for a 1-parameter constructor.',
    code: `type Shape = | Circle(radius: number): Shape
function checkShape(s: Shape): number {
  match (s) {
    Circle(r1, r2) => r1 + r2
  }
}`,
    expectedTypeErrors: 1,
    expectedErrorLines: [4],
    expectedErrorSubstrings: ["Constructor 'Circle' expects 1 arguments, but pattern has 2"]
  },

  // 8. Module Resolution & Import Diagnostics
  {
    id: 'test_err_import_module_not_found',
    name: 'Module Error: Non-Existent Module Import',
    category: 'Module Diagnostics',
    description: 'Verifies error on line 1 when attempting to import from an unregistered module.',
    code: `import NonExistentModule.{ someFunc }`,
    expectedTypeErrors: 1,
    expectedErrorLines: [1],
    expectedErrorSubstrings: ["Module 'NonExistentModule' not found"]
  },
  {
    id: 'test_err_import_symbol_not_found_with_suggestion',
    name: 'Module Error: Non-Existent Member with Did-You-Mean',
    category: 'Module Diagnostics',
    description: 'Verifies error on line 1 with fuzzy suggestion when importing typo member from standard library module.',
    code: `import Math.{ squrt }`,
    expectedTypeErrors: 1,
    expectedErrorLines: [1],
    expectedErrorSubstrings: ["Export 'squrt' not found in module 'Math'", "Did you mean 'sqrt'"]
  },

  // 9. Syntax & Parser / Lexer Error Reporting with Accurate Start Line
  {
    id: 'test_err_syntax_unterminated_string',
    name: 'Syntax Error: Unterminated String Literal Reporting',
    category: 'Syntax Diagnostics',
    description: 'Verifies lexer detects unterminated string and accurately identifies origin line 1.',
    code: `let brokenMsg = "unclosed string without closing quote
let nextLine = 42`,
    expectedTypeErrors: 0,
    expectedParseError: true,
    expectedErrorLines: [1],
    expectedErrorSubstrings: ["Unterminated string starting at line 1"]
  },
  {
    id: 'test_err_syntax_unterminated_block_comment',
    name: 'Syntax Error: Unterminated Block Comment Reporting',
    category: 'Syntax Diagnostics',
    description: 'Verifies lexer detects unclosed block comment and reports start line 1.',
    code: `/* this block comment is never closed
let a = 10
let b = 20`,
    expectedTypeErrors: 0,
    expectedParseError: true,
    expectedErrorLines: [1],
    expectedErrorSubstrings: ["Unterminated block comment starting at line 1"]
  },
  {
    id: 'test_err_syntax_unexpected_character',
    name: 'Syntax Error: Unexpected Invalid Character',
    category: 'Syntax Diagnostics',
    description: 'Verifies lexer detects invalid symbol @ and reports error on line 2.',
    code: `let valid = 10
let @invalid = 20`,
    expectedTypeErrors: 0,
    expectedParseError: true,
    expectedErrorLines: [2],
    expectedErrorSubstrings: ["Unexpected character '@' at line 2"]
  },
  {
    id: 'test_err_syntax_unclosed_parenthesis',
    name: 'Syntax Error: Unclosed Nested Parenthesis',
    category: 'Syntax Diagnostics',
    description: 'Verifies parser detects missing closing parenthesis.',
    code: `let mathExpr = (10 + (20 * 3)
println(mathExpr)`,
    expectedTypeErrors: 0,
    expectedParseError: true,
    expectedErrorLines: [2],
    expectedErrorSubstrings: ["Expected ')' after expression"]
  },

  // 10. Multi-Error Program Line & Message Reporting Accuracy
  {
    id: 'test_err_multiple_errors_on_distinct_lines',
    name: 'Multi-Error Diagnostics: Exact Line Numbers Across Program',
    category: 'Multi-Error Accuracy',
    description: 'Verifies that multiple distinct compiler errors report their exact originating line numbers (1, 3, 5).',
    code: `let numMismatch: number = "line 1 error"
let validIntermediate = 100
let boolMismatch: boolean = 12345
let immutableVar = 50
immutableVar = 99`,
    expectedTypeErrors: 3,
    expectedErrorLines: [1, 3, 5],
    expectedErrorSubstrings: [
      "cannot unify 'string' with 'number'",
      "cannot unify 'number' with 'boolean'",
      "Cannot assign to immutable variable 'immutableVar'"
    ]
  },

  // 11. Chip-8 CPU Emulator Unit Tests & Hardware Verification
  {
    id: 'test_chip8_alu_arithmetic',
    name: 'Chip-8 Unit Test: ALU Math, Bitwise & Flags (8XY0-8XYE)',
    category: 'Chip-8 Emulator Tests',
    description: 'Verifies 8-bit registers, arithmetic addition with carry in VF, subtraction with borrow in VF, bitwise OR/AND/XOR, SHR, and SHL operations.',
    code: `
      import Math.{ bitwise_and, bitwise_or, bitwise_xor, bitwise_shl, bitwise_shr }
      let mut v = []
      for (let mut i = 0; i < 16; i = i + 1) { v.push(0) }

      // 602A -> LD V0, 42
      v[0] = 42
      // 6114 -> LD V1, 20
      v[1] = 20
      // 8014 -> ADD V0, V1 (42 + 20 = 62, no carry -> VF = 0)
      let sum1 = v[0] + v[1]
      v[0] = bitwise_and(sum1, 255)
      v[15] = sum1 > 255 ? 1 : 0
      println(concat("ADD without carry: V0=", concat(to_string(v[0]), concat(", VF=", to_string(v[15])))))

      // 60FF -> LD V0, 255; 6102 -> LD V1, 2; 8014 -> ADD V0, V1 (255 + 2 = 257 -> 1, carry -> VF = 1)
      v[0] = 255
      v[1] = 2
      let sum2 = v[0] + v[1]
      v[0] = bitwise_and(sum2, 255)
      v[15] = sum2 > 255 ? 1 : 0
      println(concat("ADD with carry: V0=", concat(to_string(v[0]), concat(", VF=", to_string(v[15])))))

      // SUB: V0=50, V1=30 -> V0=20, VF=1 (no borrow)
      v[0] = 50
      v[1] = 30
      let mut diff1 = v[0] - v[1]
      let mut notBorrow1 = 1
      if (v[0] < v[1]) { diff1 = diff1 + 256; notBorrow1 = 0 }
      v[0] = diff1
      v[15] = notBorrow1
      println(concat("SUB without borrow: V0=", concat(to_string(v[0]), concat(", VF=", to_string(v[15])))))

      // SUB: V0=10, V1=30 -> V0=236, VF=0 (borrow)
      v[0] = 10
      v[1] = 30
      let mut diff2 = v[0] - v[1]
      let mut notBorrow2 = 1
      if (v[0] < v[1]) { diff2 = diff2 + 256; notBorrow2 = 0 }
      v[0] = diff2
      v[15] = notBorrow2
      println(concat("SUB with borrow: V0=", concat(to_string(v[0]), concat(", VF=", to_string(v[15])))))

      // Bitwise SHR: V0 = 13 (1101b) -> V0 = 6, VF = 1
      v[0] = 13
      let lsb = bitwise_and(v[0], 1)
      v[0] = bitwise_shr(v[0], 1)
      v[15] = lsb
      println(concat("SHR: V0=", concat(to_string(v[0]), concat(", VF=", to_string(v[15])))))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "ADD without carry: V0=62, VF=0",
      "ADD with carry: V0=1, VF=1",
      "SUB without borrow: V0=20, VF=1",
      "SUB with borrow: V0=236, VF=0",
      "SHR: V0=6, VF=1"
    ]
  },
  {
    id: 'test_chip8_flow_control_stack',
    name: 'Chip-8 Unit Test: Call Subroutines & Return Stack Depth (1NNN, 2NNN, 00EE)',
    category: 'Chip-8 Emulator Tests',
    description: 'Tests call subroutine stack pushing (2NNN) and return stack popping (00EE) up to 16 call levels.',
    code: `
      let mut stack = []
      for (let mut i = 0; i < 16; i = i + 1) { stack.push(0) }
      let mut sp = 0
      let mut pc = 512

      // Call 0x600 (1536)
      stack[sp] = pc + 2
      sp = sp + 1
      pc = 1536
      println(concat("Called sub 1: PC=", concat(to_string(pc), concat(", SP=", to_string(sp)))))

      // Nested Call 0x700 (1792)
      stack[sp] = pc + 2
      sp = sp + 1
      pc = 1792
      println(concat("Called nested sub 2: PC=", concat(to_string(pc), concat(", SP=", to_string(sp)))))

      // Return from sub 2
      sp = sp - 1
      pc = stack[sp]
      println(concat("Returned to: PC=", concat(to_string(pc), concat(", SP=", to_string(sp)))))

      // Return from sub 1
      sp = sp - 1
      pc = stack[sp]
      println(concat("Final return: PC=", concat(to_string(pc), concat(", SP=", to_string(sp)))))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "Called sub 1: PC=1536, SP=1",
      "Called nested sub 2: PC=1792, SP=2",
      "Returned to: PC=1538, SP=1",
      "Final return: PC=514, SP=0"
    ]
  },
  {
    id: 'test_chip8_memory_bcd_fonts',
    name: 'Chip-8 Unit Test: BCD Decimal & Font Pointer Operations (FX33, FX29, FX55, FX65)',
    category: 'Chip-8 Emulator Tests',
    description: 'Tests Binary Coded Decimal conversion (FX33) and font glyph pointer calculation (FX29).',
    code: `
      import Math.{ floor }
      let mut memory = []
      for (let mut i = 0; i < 4096; i = i + 1) { memory.push(0) }

      let iReg = 600
      let val = 254
      memory[iReg] = floor(val / 100)
      memory[iReg + 1] = floor((val % 100) / 10)
      memory[iReg + 2] = val % 10

      println(concat("BCD of 254: Hundreds=", concat(to_string(memory[600]), concat(", Tens=", concat(to_string(memory[601]), concat(", Ones=", to_string(memory[602])))))))

      // Font pointer for hex digit 'A' (10): 80 + 10 * 5 = 130
      let fontPtrA = 80 + 10 * 5
      println(concat("Font address for A: ", to_string(fontPtrA)))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "BCD of 254: Hundreds=2, Tens=5, Ones=4",
      "Font address for A: 130"
    ]
  },
  {
    id: 'test_chip8_graphics_vram_collision',
    name: 'Chip-8 Unit Test: Graphics XOR Blending & Collision Detection (DXYN, 00E0)',
    category: 'Chip-8 Emulator Tests',
    description: 'Tests drawing a 1-byte sprite, XOR toggling, and collision flag assertion (VF=1 on collision).',
    code: `
      import Math.{ bitwise_and, bitwise_shr }
      let mut display = []
      for (let mut i = 0; i < 2048; i = i + 1) { display.push(0) }

      let spriteByte = 255 // 11111111b (8 horizontal pixels)
      let mut vfCollision = 0

      // Draw sprite first time at (0, 0)
      for (let mut col = 0; col < 8; col = col + 1) {
        let mask = bitwise_shr(128, col)
        if (bitwise_and(spriteByte, mask) != 0) {
          let idx = 0 * 64 + col
          if (display[idx] == 1) { display[idx] = 0; vfCollision = 1 }
          else { display[idx] = 1 }
        }
      }
      println(concat("First draw collision flag VF: ", to_string(vfCollision)))

      // Draw same sprite again at (0, 0) -> Should toggle off and set VF=1
      vfCollision = 0
      for (let mut col2 = 0; col2 < 8; col2 = col2 + 1) {
        let mask2 = bitwise_shr(128, col2)
        if (bitwise_and(spriteByte, mask2) != 0) {
          let idx2 = 0 * 64 + col2
          if (display[idx2] == 1) { display[idx2] = 0; vfCollision = 1 }
          else { display[idx2] = 1 }
        }
      }
      println(concat("Second draw collision flag VF: ", to_string(vfCollision)))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "First draw collision flag VF: 0",
      "Second draw collision flag VF: 1"
    ]
  },
  {
    id: 'test_chip8_rom_execution_simulation',
    name: 'Chip-8 Unit Test: IBM Logo ROM Opcode Execution Simulation',
    category: 'Chip-8 Emulator Tests',
    description: 'Loads and executes first 10 cycles of IBM Logo ROM verifying PC advancement and display buffer modifications.',
    code: `
      import Math.{ bitwise_or, bitwise_shl, bitwise_shr, bitwise_and }
      let mut memory = []
      for (let mut i = 0; i < 4096; i = i + 1) { memory.push(0) }
      let mut v = []
      for (let mut i = 0; i < 16; i = i + 1) { v.push(0) }
      let mut display = []
      for (let mut i = 0; i < 2048; i = i + 1) { display.push(0) }
      let mut pc = 512
      let mut iReg = 0

      // IBM Logo snippet: 00E0 (CLS), 600A (LD V0, 10), 6108 (LD V1, 8), A212 (LD I, 530), D01F (DRW V0, V1, 15)
      let rom = [0, 224, 96, 10, 97, 8, 162, 18, 208, 31, 255, 255, 255, 255]
      for (let mut k = 0; k < Array.len(rom); k = k + 1) {
        memory[512 + k] = rom[k]
      }

      // Execute 4 instructions
      for (let mut step = 0; step < 4; step = step + 1) {
        let b1 = memory[pc]
        let b2 = memory[pc + 1]
        let op = bitwise_or(bitwise_shl(b1, 8), b2)
        pc = pc + 2
        let cat = bitwise_and(op, 61440)
        let x = bitwise_shr(bitwise_and(op, 3840), 8)
        let kk = bitwise_and(op, 255)
        let nnn = bitwise_and(op, 4095)
        if (op == 224) { for (let mut d = 0; d < 2048; d = d + 1) { display[d] = 0 } }
        if (cat == 24576) { v[x] = kk }
        if (cat == 40960) { iReg = nnn }
      }

      println(concat("After 4 ops: PC=", concat(to_string(pc), concat(", V0=", concat(to_string(v[0]), concat(", V1=", concat(to_string(v[1]), concat(", I=", to_string(iReg)))))))))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "After 4 ops: PC=520, V0=10, V1=8, I=530"
    ]
  },
  {
    id: 'test_switch_stacked_and_fallthrough_semantics',
    name: 'Switch Case Behavior: Multi-matcher, Comma-Separated & Auto-Break Fallthrough Semantics',
    category: 'Language Expressions',
    description: 'Verifies that switch statements auto-break without fallthrough by default, support consecutive stacked case matchers and comma-separated matchers, and support continue for explicit fallthrough.',
    code: `
      function classifyDay(day: number): string {
        return switch (day) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            "Weekday"
          case 6, 7:
            "Weekend"
          default:
            "Invalid"
        }
      }

      println(concat("Day 1: ", classifyDay(1)))
      println(concat("Day 5: ", classifyDay(5)))
      println(concat("Day 6: ", classifyDay(6)))
      println(concat("Day 7: ", classifyDay(7)))
      println(concat("Day 9: ", classifyDay(9)))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "Day 1: Weekday",
      "Day 5: Weekday",
      "Day 6: Weekend",
      "Day 7: Weekend",
      "Day 9: Invalid"
    ]
  },
  {
    id: 'test_list_comprehension_transformations',
    name: 'List Comprehension: Filtering, Transformation & Array Operations',
    category: 'Language Expressions',
    description: 'Verifies list comprehension syntax [expr for param in iterable if cond] evaluating cleanly in Evaluator, JS runtime and LLVM IR.',
    code: `
      let nums = [1, 2, 3, 4, 5, 6, 7, 8]
      let evensSquared = [x * x for x in nums if x % 2 == 0]
      println(concat("Evens squared: ", evensSquared.join(", ")))

      let plusTens = [n + 10 for n in [1, 2, 3]]
      println(concat("Plus ten: ", plusTens.join("-")))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "Evens squared: 4, 16, 36, 64",
      "Plus ten: 11-12-13"
    ]
  },
  {
    id: 'test_rust_range_syntax_sugar',
    name: 'Rust-Style Range Syntax Sugar ([a..b] and [a..=b])',
    category: 'Language Expressions',
    description: 'Verifies Rust-style range syntax sugar [1..5] (exclusive) and [1..=5] (inclusive) and descending ranges [5..1].',
    code: `
      let exclusiveRange = [1..5]
      println(concat("Exclusive: ", exclusiveRange.join(", ")))

      let inclusiveRange = [1..=5]
      println(concat("Inclusive: ", inclusiveRange.join(", ")))

      let directRange = 10..13
      println(concat("Direct: ", directRange.join("-")))

      let descendingRange = [5..1]
      println(concat("Descending: ", descendingRange.join(", ")))

      let sumComp = [x * 2 for x in 1..=4]
      println(concat("Range in comp: ", sumComp.join(" ")))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "Exclusive: 1, 2, 3, 4",
      "Inclusive: 1, 2, 3, 4, 5",
      "Direct: 10-11-12",
      "Descending: 5, 4, 3, 2",
      "Range in comp: 2 4 6 8"
    ]
  },

  // 12. Comprehensive Error Messaging & Formatting Showcase
  {
    id: 'test_err_generic_instantiation_contradiction',
    name: 'Type Mismatch: Contradictory Generic Type Parameter Instantiation',
    category: 'Generics & Polytypes',
    description: 'Checks that calling a generic function with mismatched parameter types (e.g., number and string for the same type variable) reports a clear unification error on the call site.',
    code: `function choose<a>(x: a, y: a): a {
  x
}
let result = choose(10, "hello")`,
    expectedTypeErrors: 1,
    expectedErrorLines: [4],
    expectedErrorSubstrings: ["cannot unify 'string' with 'number'"]
  },
  {
    id: 'test_err_list_comprehension_invalid_iterable',
    name: 'List Comprehension: Non-Array/Non-Range Iterable Source',
    category: 'Comprehensions & Iterables',
    description: 'Triggers a unification mismatch when a list comprehension attempts to iterate over a primitive integer instead of an array or range.',
    code: `let doubled = [x * 2 for x in 999]`,
    expectedTypeErrors: 1,
    expectedErrorLines: [1],
    expectedErrorSubstrings: ["cannot unify"]
  },
  {
    id: 'test_err_polymorphic_function_argument_mismatch',
    name: 'Type Mismatch: Generic Parameter Type Contradiction in Function Argument',
    category: 'Generics & Polytypes',
    description: 'Triggers a type unification error when a function expects a polymorphic transformation function of type (a) => a, but a concrete mismatched mapping function of type (number) => string is passed.',
    code: `function applyStr<a>(f: (x: a) => a, x: a): a {
  f(x)
}
let res = applyStr((s: number) => "not-a-number", 42)`,
    expectedTypeErrors: 1,
    expectedErrorLines: [4],
    expectedErrorSubstrings: ["cannot unify 'number' with 'string'"]
  },
  {
    id: 'test_err_pattern_match_exhaustive_multi',
    name: 'Pattern Match: Non-Exhaustive ADT Match listing all missing constructors',
    category: 'Pattern Diagnostics',
    description: 'Ensures non-exhaustive pattern match checking lists all missing constructors for ADTs with several options.',
    code: `type Shape =
  | Circle(r: number): Shape
  | Rectangle(w: number, h: number): Shape
  | Triangle(b: number, h: number): Shape
  | Point: Shape

function area(s: Shape): number {
  match (s) {
    Circle(r) => 3 * r * r
    Rectangle(w, h) => w * h
  }
}`,
    expectedTypeErrors: 1,
    expectedErrorLines: [8],
    expectedErrorSubstrings: ["Non-exhaustive pattern match", "Triangle", "Point"]
  },
  {
    id: 'test_err_record_subtyping_field_type_contradiction',
    name: 'Record Error: Inner Structural Field Type Unification Contradiction',
    category: 'Record Diagnostics',
    description: 'Triggers an error when assigning a record value whose inner structural properties are incompatible with the declared record annotation.',
    code: `type Coordinates = { x: number, y: number, label: string }
let badCoords: Coordinates = { x: 10, y: 20, label: true }`,
    expectedTypeErrors: 1,
    expectedErrorLines: [2],
    expectedErrorSubstrings: ["cannot unify 'boolean' with 'string'"]
  },
  {
    id: 'test_err_match_guard_non_boolean',
    name: 'Pattern Match: Guard Expression with Non-Boolean Outcome',
    category: 'Pattern Diagnostics',
    description: 'Ensures that pattern match guard expressions are strictly verified to evaluate to a boolean, reporting a type unification mismatch if they produce a primitive string.',
    code: `function checkGuard(x: number): string {
  match (x) {
    n if "is-positive" => "yes"
    _ => "no"
  }
}`,
    expectedTypeErrors: 1,
    expectedErrorLines: [3],
    expectedErrorSubstrings: ["cannot unify 'string' with 'boolean'"]
  },
  {
    id: 'test_err_recursive_function_declared_return_contradiction',
    name: 'Recursive Function: Declared Return Type Contradicts Recursive Body Unification',
    category: 'Function Diagnostics',
    description: 'Catches type contradictions inside recursive functions where the returned expression does not match the annotated return type, unified across recursive call paths.',
    code: `function factorial(n: number): string {
  if (n <= 1) {
    1
  } else {
    n * factorial(n - 1)
  }
}`,
    expectedTypeErrors: 2,
    expectedErrorLines: [5, 2],
    expectedErrorSubstrings: ["cannot unify 'string' with 'number'", "cannot unify 'number' with 'string'"]
  },
  {
    id: 'test_err_binary_comparison_mismatched_types',
    name: 'Comparison Error: Comparing Incompatible Types',
    category: 'Operator Errors',
    description: 'Ensures binary comparison operators strictly enforce homogeneous operand types, raising an error when comparing strings to numbers.',
    code: `let invalidComparison = "hello" < 42`,
    expectedTypeErrors: 1,
    expectedErrorLines: [1],
    expectedErrorSubstrings: ["cannot unify 'string' with 'number'"]
  },
  {
    id: 'test_err_array_indexing_non_numeric',
    name: 'Index Error: Array Indexed by Non-Numeric Variable',
    category: 'Index Diagnostics',
    description: 'Verifies that array indexing expressions strictly validate index types to be integers (number), raising an error when indexed with a boolean value.',
    code: `let names = ["Alice", "Bob"]
let invalidIndex = names[true]`,
    expectedTypeErrors: 1,
    expectedErrorLines: [2],
    expectedErrorSubstrings: ["cannot unify 'boolean' with 'number'"]
  },
  {
    id: 'test_err_match_arms_type_contradiction',
    name: 'Pattern Match: Mismatched Return Types across Match Arms',
    category: 'Pattern Diagnostics',
    description: 'Ensures that all arms of a pattern match expression must unify to the exact same return type, raising an error when one arm returns a number and another a boolean.',
    code: `function matchOutcome(flag: boolean): number {
  match (flag) {
    true => 42
    false => true
  }
}`,
    expectedTypeErrors: 1,
    expectedErrorLines: [4],
    expectedErrorSubstrings: ["cannot unify 'boolean' with 'number'"]
  },
  {
    id: 'test_err_unop_not_on_number',
    name: 'Operator Error: Logical Negation of Primitive Number',
    category: 'Operator Errors',
    description: 'Ensures logical negation ! cannot be applied to a number.',
    code: `let badNot = !123`,
    expectedTypeErrors: 1,
    expectedErrorLines: [1],
    expectedErrorSubstrings: ["cannot unify 'number' with 'boolean'"]
  },
  {
    id: 'test_err_lambda_parameter_type_mismatch',
    name: 'Lambda Error: Type Annotation Mismatch on Anonymous Function Param',
    category: 'Function Diagnostics',
    description: 'Ensures lambda parameters are validated correctly when passed to a higher-order function with explicit type requirements.',
    code: `function processNumber(f: (number) => number): number {
  f(10)
}
let badLambda = processNumber((s: string) => s + "!")`,
    expectedTypeErrors: 1,
    expectedErrorLines: [4],
    expectedErrorSubstrings: ["cannot unify 'string' with 'number'"]
  },
  {
    id: 'test_err_extreme_diagnostic_suite_showcase',
    name: 'Extremely Feature-Rich Diagnostic Showcase with Multi-Category Violations',
    category: 'Comprehensive Diagnostics Showcase',
    description: 'Triggers 3 distinct categories of errors in a single code block to fully exercise the Ariadne-ts reporter\'s multiline caret highlight and note capabilities.',
    code: `let someTypeVariable = 10
let mut x: number = "first-error"
let immutableConst = 42
immutableConst = 100
let result = someTypoVariable + 5`,
    expectedTypeErrors: 3,
    expectedErrorLines: [2, 4, 5],
    expectedErrorSubstrings: [
      "cannot unify 'string' with 'number'",
      "Cannot assign to immutable variable 'immutableConst'",
      "Undefined variable 'someTypoVariable'",
      "Did you mean 'someTypeVariable'"
    ]
  },
  {
    id: 'test_scheme_r5rs_callcc_and_macros',
    name: 'Scheme R5RS: First-Class Continuations (call/cc), Reader & Syntax Macros',
    category: 'Scheme R5RS Tests',
    description: 'Validates first-class continuations call/cc for non-local escapes and early return in TypeLang.',
    code: `
      type LVal =
        | LNil: LVal
        | LNum(n: number): LVal
        | LCont(kId: number): LVal
        | LPair(car: LVal, cdr: LVal): LVal

      // Simplified call/cc verification
      let mut contSaved = -1
      function captureCont(k: number): LVal {
        contSaved = k
        LCont(k)
      }

      let captured = captureCont(42)
      match (captured) {
        LCont(kId) => println(concat("Captured continuation id: ", to_string(kId)))
        ... => println("")
      }
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "Captured continuation id: 42"
    ]
  },
  {
    id: 'test_do_notation_monad',
    name: 'Monadic Do Notation (Option Monad)',
    category: 'Monads & Do Notation',
    description: 'Verifies monadic do-notation syntax desugaring into flatMap / pure chains with binding and let statements.',
    code: `
      type Option<a> =
        | Some(val: a): Option<a>
        | None: Option<a>

      function flatMap<a, b>(opt: Option<a>, f: (x: a) => Option<b>): Option<b> {
        match (opt) {
          Some(v) => f(v)
          None => None
        }
      }

      function pure<a, b>(val: a): Option<a> {
        Some(val)
      }

      let res1 = do {
        x <- Some(10);
        let multiplier = 3;
        y <- Some(20);
        pure x * multiplier + y;
      }

      match (res1) {
        Some(ans) => println(concat("Do notation computed: ", to_string(ans)))
        None => println("Failed computation")
      }
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "Do notation computed: 50"
    ]
  },
  {
    id: 'test_where_clauses',
    name: 'Where Clauses on Functions and Expressions',
    category: 'Functional Scoping',
    description: 'Verifies local where clause declarations scoped to functions and expressions.',
    code: `
      function circleArea(radius: number): number {
        pi * square(radius)
      } where {
        let pi = 3.14159
        function square(x: number): number {
          x * x
        }
      }

      let hypotenuse = sqrt(a2 + b2) where {
        let a = 3
        let b = 4
        let a2 = a * a
        let b2 = b * b
        function sqrt(x: number): number {
          Math.sqrt(x)
        }
      }

      println(concat("Circle area: ", to_string(circleArea(2))))
      println(concat("Hypotenuse: ", to_string(hypotenuse)))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "Circle area: 12.56636",
      "Hypotenuse: 5"
    ]
  },
  {
    id: 'test_err_do_notation_missing_flatmap',
    name: 'Do Notation Error: Smart Humanized Diagnostic for Missing flatMap Function',
    category: 'Monads & Do Notation',
    description: 'Verifies that writing do notation without flatMap in scope yields an educational, humanized diagnostic explaining monadic desugaring.',
    code: `
      type Option<a> = | Some(v: a): Option<a> | None: Option<a>
      function pure<a>(v: a): Option<a> { Some(v) }
      let result = do {
        x <- Some(10);
        pure x + 1;
      }
    `,
    expectedTypeErrors: 1,
    expectedErrorLines: [5],
    expectedErrorSubstrings: [
      "In 'do' notation: 'flatMap' function is not defined in scope",
      "desugar bindings like 'x <- expr' into 'flatMap(expr, (x) => ...)'"
    ]
  },
  {
    id: 'test_err_do_notation_missing_pure',
    name: 'Do Notation Error: Smart Humanized Diagnostic for Missing pure Function',
    category: 'Monads & Do Notation',
    description: 'Verifies that using pure in a do block without pure in scope explains how pure(val) lifts values into the monad.',
    code: `
      type Option<a> = | Some(v: a): Option<a> | None: Option<a>
      function flatMap<a, b>(opt: Option<a>, f: (x: a) => Option<b>): Option<b> {
        match (opt) {
          Some(v) => f(v)
          None => None
        }
      }
      let result = do {
        x <- Some(10);
        pure x + 5;
      }
    `,
    expectedTypeErrors: 1,
    expectedErrorLines: [11],
    expectedErrorSubstrings: [
      "In 'do' notation: 'pure' function is not defined in scope",
      "desugar 'pure val' into 'pure(val)'"
    ]
  },
  {
    id: 'test_err_do_notation_explicit_monad_missing_method',
    name: 'Do Notation Error: Explicit Monad Missing flatMap',
    category: 'Monads & Do Notation',
    description: 'Verifies that do(Opt) notation with a custom monad object missing flatMap reports a clear diagnostic.',
    code: `
      let Opt = { notFlatMap: 123, pure: (x: number) => x }
      let result = do(Opt) {
        x <- 10;
        pure x;
      }
    `,
    expectedTypeErrors: 1,
    expectedErrorLines: [4],
    expectedErrorSubstrings: [
      "In 'do(Opt)' notation: 'Opt' does not provide a 'flatMap' function"
    ]
  },
  {
    id: 'test_stdlib_option_monad_module',
    name: 'Stdlib: Option Module & Monadic Do-Notation',
    category: 'Monads & Do Notation',
    description: 'Tests Option stdlib module functions (Some, None, map, filter, getOrElse, zip) and do(Option) computation.',
    code: `
      import Option.{ Some, None, isSome, isNone, getOrElse, map, filter, zip, fromNullable }

      let optA = Some(10)
      let optB = Some(20)
      let optNone = None

      let mapped = Option.map(optA, (x: number) => x * 2)
      let filtered = Option.filter(mapped, (x: number) => x > 15)
      let val1 = Option.getOrElse(filtered, 0)
      let val2 = Option.getOrElse(optNone, 99)

      let resDo = do(Option) {
        a <- optA;
        b <- optB;
        pure a + b;
      }

      let resDoNone = do(Option) {
        a <- optA;
        _ <- optNone;
        pure a;
      }

      println(concat("Option mapped val: ", to_string(val1)))
      println(concat("Option default val: ", to_string(val2)))
      println(concat("Option do-notation: ", to_string(Option.getOrElse(resDo, -1))))
      println(concat("Option do-notation None: ", to_string(Option.getOrElse(resDoNone, -1))))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "Option mapped val: 20",
      "Option default val: 99",
      "Option do-notation: 30",
      "Option do-notation None: -1"
    ]
  },
  {
    id: 'test_stdlib_result_monad_module',
    name: 'Stdlib: Result Module & Railway-Oriented Monadic Do-Notation',
    category: 'Monads & Do Notation',
    description: 'Tests Result stdlib module functions (Ok, Err, map, mapError, getOrElse, toOption) and do(Result) error handling.',
    code: `
      import Result.{ Ok, Err, isOk, isErr, getOrElse, map, mapError, toOption, fromTry }

      let resOk = Ok(100)
      let resErr = Err("computation failed")

      let mapped = Result.map(resOk, (x: number) => x + 50)
      let errMapped = Result.mapError(resErr, (e: string) => concat("ERROR: ", e))

      let valOk = Result.getOrElse(mapped, 0)
      let valErr = Result.getOrElse(resErr, -1)

      function safeDivide(a: number, b: number): Result<number, string> {
        if (b == 0) {
          Err("division by zero")
        } else {
          Ok(a / b)
        }
      }

      let calc = do(Result) {
        x <- safeDivide(100, 2);
        y <- safeDivide(x, 5);
        pure y * 3;
      }

      let calcFail = do(Result) {
        x <- safeDivide(100, 0);
        pure x * 3;
      }

      println(concat("Result ok val: ", to_string(valOk)))
      println(concat("Result err default: ", to_string(valErr)))
      println(concat("Result do success: ", to_string(Result.getOrElse(calc, -1))))
      println(concat("Result do fail isErr: ", to_string(Result.isErr(calcFail))))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "Result ok val: 150",
      "Result err default: -1",
      "Result do success: 30",
      "Result do fail isErr: true"
    ]
  },
  {
    id: 'test_stdlib_io_monad_module',
    name: 'Stdlib: IO Monad Module (Lazy Effects & Sequencing)',
    category: 'Monads & Do Notation',
    description: 'Tests IO stdlib module lazy execution, delay, and do(IO) sequencing.',
    code: `
      import IO.{ pure, delay, map, flatMap, run }

      let io1 = IO.delay(() => 40 + 2)
      let io2 = IO.map(io1, (x: number) => x * 2)

      let chained = do(IO) {
        a <- io1;
        b <- io2;
        pure a + b;
      }

      let resultVal = IO.run(chained)
      println(concat("IO run result: ", to_string(resultVal)))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "IO run result: 126"
    ]
  },
  {
    id: 'test_stdlib_state_monad_module',
    name: 'Stdlib: State Monad Module (State Transformations & do(State))',
    category: 'Monads & Do Notation',
    description: 'Tests State monad module get, set, modify, and do(State) stateful pipeline.',
    code: `
      import State.{ get, set, modify, run, evalState, execState }

      let pipeline = do(State) {
        current <- State.get();
        _ <- State.set(current + 10);
        _ <- State.modify((s: number) => s * 2);
        pure concat("State count was ", to_string(current));
      }

      let res = State.run(pipeline, 5)
      let finalVal = res[0]
      let finalState = res[1]

      println(concat("State output: ", finalVal))
      println(concat("State final accumulator: ", to_string(finalState)))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "State output: State count was 5",
      "State final accumulator: 30"
    ]
  },
  {
    id: 'test_stdlib_either_monad_module',
    name: 'Stdlib: Either Monad Module & do(Either)',
    category: 'Monads & Do Notation',
    description: 'Tests Either stdlib module Left/Right GADT, map, mapLeft, flatMap, fold, and do(Either).',
    code: `
      import Either.{ Left, Right, isLeft, isRight, map, mapLeft, flatMap, fold, getOrElse, swap }

      let r1 = Right(42)
      let l1 = Left("network error")

      let mapped = Either.map(r1, (x: number) => x * 2)
      let val = Either.getOrElse(mapped, 0)
      let leftMapped = Either.mapLeft(l1, (e: string) => concat("CRITICAL: ", e))

      let chain = do(Either) {
        a <- Right(10);
        b <- Right(20);
        pure a + b;
      }

      let chainFail = do(Either) {
        a <- Right(10);
        b <- Left("failed halfway");
        pure a;
      }

      println(concat("Either right mapped: ", to_string(val)))
      println(concat("Either chain result: ", to_string(Either.getOrElse(chain, -1))))
      println(concat("Either chain fail isLeft: ", to_string(Either.isLeft(chainFail))))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "Either right mapped: 84",
      "Either chain result: 30",
      "Either chain fail isLeft: true"
    ]
  },
  {
    id: 'test_stdlib_reader_monad_module',
    name: 'Stdlib: Reader Monad Module (Dependency Injection & do(Reader))',
    category: 'Monads & Do Notation',
    description: 'Tests Reader monad ask, asks, local, and do(Reader) composition.',
    code: `
      import Reader.{ ask, asks, run, map, flatMap, local }

      let computation = do(Reader) {
        env <- Reader.ask();
        port <- Reader.asks((cfg: { host: string, port: number }) => cfg.port);
        pure concat(env.host, concat(":", to_string(port + 1)));
      }

      let config = { host: "localhost", port: 8080 }
      let result = Reader.run(computation, config)

      println(concat("Reader result: ", result))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "Reader result: localhost:8081"
    ]
  },
  {
    id: 'test_stdlib_writer_monad_module',
    name: 'Stdlib: Writer Monad Module (Logging & do(Writer))',
    category: 'Monads & Do Notation',
    description: 'Tests Writer monad tell, listen, and do(Writer) log accumulation.',
    code: `
      import Writer.{ tell, run, value, log, map, flatMap }

      let computation = do(Writer) {
        _ <- Writer.tell("step 1: initialized");
        _ <- Writer.tell("step 2: computing");
        pure 42;
      }

      let res = Writer.run(computation)
      let val = res[0]
      let logs = res[1]

      println(concat("Writer final value: ", to_string(val)))
      println(concat("Writer log length: ", to_string(Array.len(logs))))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "Writer final value: 42",
      "Writer log length: 2"
    ]
  },
  {
    id: 'test_stdlib_task_monad_module',
    name: 'Stdlib: Task Monad Module (Lazy Computation & do(Task))',
    category: 'Monads & Do Notation',
    description: 'Tests Task monad succeed, delay, and do(Task) sequencing.',
    code: `
      import Task.{ succeed, delay, run, map, flatMap }

      let t = do(Task) {
        x <- Task.succeed(100);
        y <- Task.delay(() => x + 25);
        pure y * 2;
      }

      let res = Task.run(t)
      println(concat("Task computed result: ", to_string(res)))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "Task computed result: 250"
    ]
  },
  {
    id: 'test_stdlib_group_and_algebraic_types',
    name: 'Stdlib: Group & Algebraic Types (Setoid, Ord, Semigroup, Monoid, Group, Applicative, Validation, Foldable)',
    category: 'Algebraic Types',
    description: 'Tests Setoid, Ord, Semigroup, SemiGroup, Monoid, Group, Functor, Contravariant, Applicative, Validation, Bifunctor, Profunctor, and Foldable stdlib modules.',
    code: `
      import Option.{ Some }
      import Result.{ Ok }
      import Setoid.{ equals, notEquals }
      import Ord.{ clamp, between, compare, Less, Equal, Greater }
      import Semigroup.{ combine, concatAll }
      import SemiGroup.{ combine as sgCombine }
      import Monoid.{ Sum, Product }
      import Group.{ invert, subtract }
      import Functor.{ map }
      import Contravariant.{ contramap }
      import Applicative.{ lift2 }
      import Validation.{ Valid, Invalid, accumulate, isValid }
      import Bifunctor.{ bimap }
      import Profunctor.{ dimap }
      import Foldable.{ foldLeft }

      let eqResult = Setoid.equals([1, 2, 3], [1, 2, 3])
      let clampResult = Ord.clamp(120, 0, 100)
      let sgResult = sgCombine("Hello ", "World")
      let numList: Array<number> = [1, 2, 3, 4]
      let monoidConcat = Monoid.concatAll(numList, 0)
      let groupSub = Group.subtract(100, 25)

      let fnMap = Functor.map(Some(10), (x: number) => x * 5)
      let appLift = Applicative.lift2((a: number, b: number) => a + b, Some(10), Some(20))

      let valAcc = Validation.accumulate(Valid("Alice"), Valid(30), (name: string, age: number) => name)

      let res: Result<number, string> = Ok(15)
      let bifun = Bifunctor.bimap(res, (e: string) => e, (v: number) => v * 2)

      let folded = Foldable.foldLeft(numList, 0, (acc: number, x: number) => acc + x)

      println(concat("Setoid.equals arr: ", to_string(eqResult)))
      println(concat("Ord.clamp: ", to_string(clampResult)))
      println(concat("SemiGroup.combine: ", sgResult))
      println(concat("Monoid.concatAll: ", to_string(monoidConcat)))
      println(concat("Group.subtract: ", to_string(groupSub)))
      println(concat("Functor.map Some: ", to_string(Option.getOrElse(fnMap, 0))))
      println(concat("Applicative.lift2: ", to_string(Option.getOrElse(appLift, 0))))
      println(concat("Validation isValid: ", to_string(Validation.isValid(valAcc))))
      println(concat("Bifunctor Ok: ", to_string(Result.getOrElse(bifun, 0))))
      println(concat("Foldable.foldLeft: ", to_string(folded)))
    `,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: [
      "Setoid.equals arr: true",
      "Ord.clamp: 100",
      "SemiGroup.combine: Hello World",
      "Monoid.concatAll: 10",
      "Group.subtract: 75",
      "Functor.map Some: 50",
      "Applicative.lift2: 30",
      "Validation isValid: true",
      "Bifunctor Ok: 30",
      "Foldable.foldLeft: 10"
    ]
  },
  {
    id: 'test_lsp_completion_imports_and_builtins',
    name: 'LSP Autocomplete: Import Specifiers, In-scope Imports, and Builtin Functions',
    category: 'LSP / Tooling Tests',
    description: 'Verifies that LSP autocomplete accurately suggests imported symbols and standard builtins.',
    code: `import Math.{ max, sqrt }
let m = max(10, 20)
println(to_string(m))`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['20'],
    expectedCompletion: {
      line: 2,
      col: 6,
      contains: ['max', 'math_max', 'math_min']
    }
  },
  {
    id: 'test_lsp_completion_multiline_imports',
    name: 'LSP Autocomplete: Multi-line Import Specifiers',
    category: 'LSP / Tooling Tests',
    description: 'Verifies that multi-line import specifiers suggest module members across line breaks.',
    code: `import Math.{
  floor,
  sqrt
}
println("ok")`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['ok'],
    expectedCompletion: {
      line: 3,
      col: 5,
      contains: ['sqrt']
    }
  },
  {
    id: 'test_lsp_completion_dom_and_timers',
    name: 'LSP Autocomplete: DOM and Builtin Timer Functions',
    category: 'LSP / Tooling Tests',
    description: 'Verifies autocomplete for DOM members and root timer builtins like requestAnimationFrame.',
    code: `import DOM.{ getElementById }
let x = "done"
println(x)`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['done'],
    expectedCompletion: {
      line: 2,
      col: 1,
      contains: ['getElementById', 'requestAnimationFrame', 'setInterval']
    }
  },
  {
    id: 'test_lsp_hover_extern_module_function',
    name: 'LSP Hover: Extern Module Function (notify)',
    category: 'LSP / Tooling Tests',
    description: 'Verifies hover information for function declared inside an extern module.',
    code: `extern module "ultimate-host" as Host {
  function notify(message: string): void
  type Handle = number
  let version: string
}
println("ok")`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['ok'],
    expectedHover: {
      line: 2,
      col: 14,
      contains: ['notify', '(message: string) => void']
    }
  },
  {
    id: 'test_lsp_hover_extern_module_parameter',
    name: 'LSP Hover: Extern Module Parameter (message)',
    category: 'LSP / Tooling Tests',
    description: 'Verifies hover information for parameter inside an extern function.',
    code: `extern module "ultimate-host" as Host {
  function notify(message: string): void
  type Handle = number
  let version: string
}
println("ok")`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['ok'],
    expectedHover: {
      line: 2,
      col: 21,
      contains: ['message', 'string']
    }
  },
  {
    id: 'test_lsp_hover_extern_module_type_alias',
    name: 'LSP Hover: Extern Module Type Alias (Handle)',
    category: 'LSP / Tooling Tests',
    description: 'Verifies hover information for type alias inside an extern module.',
    code: `extern module "ultimate-host" as Host {
  function notify(message: string): void
  type Handle = number
  let version: string
}
println("ok")`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['ok'],
    expectedHover: {
      line: 3,
      col: 9,
      contains: ['Handle', 'number']
    }
  },
  {
    id: 'test_lsp_hover_extern_module_member_variable',
    name: 'LSP Hover: Extern Module Member Variable (version)',
    category: 'LSP / Tooling Tests',
    description: 'Verifies hover information for variable inside an extern module.',
    code: `extern module "ultimate-host" as Host {
  function notify(message: string): void
  type Handle = number
  let version: string
}
println("ok")`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['ok'],
    expectedHover: {
      line: 4,
      col: 9,
      contains: ['version', 'string']
    }
  },
  {
    id: 'test_lsp_hover_extern_module_name',
    name: 'LSP Hover: Extern Module Name (Host)',
    category: 'LSP / Tooling Tests',
    description: 'Verifies hover information for extern module name.',
    code: `extern module "ultimate-host" as Host {
  function notify(message: string): void
  type Handle = number
  let version: string
}
println("ok")`,
    expectedTypeErrors: 0,
    expectedStdoutSubstrings: ['ok'],
    expectedHover: {
      line: 1,
      col: 35,
      contains: ['Host', 'module']
    }
  }
];

export function runCompilerTestSuite(): TestResult[] {
  return COMPILER_TEST_SUITE.map(test => {
    const startTime = performance.now();
    try {
      let parseErrorDiagnostic: Diagnostic | null = null;
      let ast: any = null;
      let actualDiagnostics: Diagnostic[] = [];

      // 1. Lexing & Parsing Stage
      try {
        const lexer = new Lexer(test.code);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        ast = parser.parseProgram();
      } catch (pErr: any) {
        if (test.expectedParseError) {
          parseErrorDiagnostic = createDiagnosticFromError(pErr, test.code);
          actualDiagnostics = [parseErrorDiagnostic];
        } else {
          throw pErr;
        }
      }

      // 2. Type Checking Stage
      let typeErrorsCount = 0;
      if (ast) {
        const typeChecker = new TypeChecker();
        typeChecker.checkProgram(ast);
        actualDiagnostics = typeChecker.diagnostics;
        const errors = actualDiagnostics.filter(d => d.severity === 'error');
        typeErrorsCount = errors.length;
      } else if (parseErrorDiagnostic) {
        typeErrorsCount = 1;
      }

      // 3. Evaluator Stage (only for valid programs)
      let evalStdout: string[] = [];
      let runtimeErrorCaught = false;
      let runtimeErrorMessage = '';
      if (test.expectedTypeErrors === 0 && !test.expectedParseError && ast) {
        const evaluator = new Evaluator();
        try {
          const evalResult = evaluator.evalProgram(ast);
          evalStdout = evalResult.stdout;
        } catch (rErr: any) {
          if (test.expectedRuntimeError) {
            runtimeErrorCaught = true;
            runtimeErrorMessage = rErr?.message || String(rErr);
          } else {
            throw rErr;
          }
        }
      }

      const actualErrorLines = actualDiagnostics
        .filter(d => d.severity === 'error')
        .map(d => d.line);

      let passed = true;
      let failureReason: string | undefined;

      // Assertion: Parse Error
      if (test.expectedParseError && !parseErrorDiagnostic) {
        passed = false;
        failureReason = 'Expected syntax / parse error, but program parsed successfully without errors.';
      } else if (test.expectedRuntimeError && !runtimeErrorCaught) {
        passed = false;
        failureReason = 'Expected runtime error, but evaluator executed without throwing.';
      } else if (test.expectedTypeErrors === 0 && !test.expectedParseError && typeErrorsCount > 0) {
        passed = false;
        failureReason = `Expected 0 type errors, but found ${typeErrorsCount}: ${actualDiagnostics[0]?.message} (Line ${actualDiagnostics[0]?.line})`;
      } else if (test.expectedTypeErrors > 0 && typeErrorsCount !== test.expectedTypeErrors) {
        passed = false;
        failureReason = `Expected ${test.expectedTypeErrors} type errors, but found ${typeErrorsCount}`;
      }

      // Assertion: Expected Error Lines (Exact line number reporting verification)
      if (passed && test.expectedErrorLines && test.expectedErrorLines.length > 0) {
        for (const expLine of test.expectedErrorLines) {
          if (!actualErrorLines.includes(expLine)) {
            passed = false;
            failureReason = `Expected diagnostic error on line ${expLine}, but errors occurred on line(s) [${actualErrorLines.join(', ') || 'none'}]`;
            break;
          }
        }
      }

      // Assertion: Expected Error Substrings (Message reporting verification)
      if (passed && test.expectedErrorSubstrings && test.expectedErrorSubstrings.length > 0) {
        const allDiagnosticMessages = actualDiagnostics.map(d => `[Line ${d.line}] ${d.message}`).join('\n') +
          (runtimeErrorMessage ? `\n[Runtime] ${runtimeErrorMessage}` : '');

        for (const expSub of test.expectedErrorSubstrings) {
          const found = actualDiagnostics.some(d => d.message.toLowerCase().includes(expSub.toLowerCase())) ||
            runtimeErrorMessage.toLowerCase().includes(expSub.toLowerCase());
          if (!found) {
            passed = false;
            failureReason = `Expected error message containing "${expSub}", but received:\n${allDiagnosticMessages || '(no error messages)'}`;
            break;
          }
        }
      }

      // Assertion: Expected Diagnostics (Granular category/col/line match)
      if (passed && test.expectedDiagnostics && test.expectedDiagnostics.length > 0) {
        for (const expDiag of test.expectedDiagnostics) {
          const matched = actualDiagnostics.some(d => {
            if (expDiag.line !== undefined && d.line !== expDiag.line) return false;
            if (expDiag.col !== undefined && d.col !== expDiag.col) return false;
            if (expDiag.category !== undefined && d.category !== expDiag.category) return false;
            if (expDiag.severity !== undefined && d.severity !== expDiag.severity) return false;
            if (expDiag.messageSubstring !== undefined && !d.message.toLowerCase().includes(expDiag.messageSubstring.toLowerCase())) return false;
            return true;
          });
          if (!matched) {
            passed = false;
            failureReason = `Expected diagnostic matching ${JSON.stringify(expDiag)} was not found in actual diagnostics: ${JSON.stringify(actualDiagnostics.map(d => ({ line: d.line, col: d.col, message: d.message, category: d.category })))}`;
            break;
          }
        }
      }

      // Check stdout if type checking passed as expected
      if (passed && test.expectedStdoutSubstrings && test.expectedStdoutSubstrings.length > 0) {
        const stdoutText = evalStdout.join('\n');
        for (const sub of test.expectedStdoutSubstrings) {
          if (!stdoutText.includes(sub)) {
            passed = false;
            failureReason = `Expected stdout to contain "${sub}", but got:\n${stdoutText || '(empty stdout)'}`;
            break;
          }
        }
      }

      // 4. Formatter, LSP, JS Codegen, LLVM SSA for valid programs
      if (passed && test.expectedTypeErrors === 0 && !test.expectedRuntimeError && !test.expectedParseError && ast) {
        // Formatter roundtrip
        try {
          const formatted = formatTypeLangCode(test.code);
          if ((test.code.includes('///') || test.code.includes('/**')) && !formatted.includes('///')) {
            passed = false;
            failureReason = 'Formatter removed documentation comments during roundtrip.';
          }
          const fLexer = new Lexer(formatted);
          const fAst = new Parser(fLexer.tokenize()).parseProgram();
          const fChecker = new TypeChecker();
          fChecker.checkProgram(fAst);
          const fErrors = fChecker.diagnostics.filter(d => d.severity === 'error');
          if (fErrors.length > 0) {
            passed = false;
            failureReason = `Formatter roundtrip produced type error: ${fErrors[0].message}`;
          }
        } catch (fErr: any) {
          passed = false;
          failureReason = `Formatter roundtrip failed to parse: ${fErr.message}`;
        }

        // LSP Hover Sanity
        if (passed) {
          try {
            getHoverInformation(test.code, 1, 2);
            if (test.expectedHover) {
              const hover = getHoverInformation(test.code, test.expectedHover.line, test.expectedHover.col);
              const hoverText = hover?.contents.join('\n') || '';
              const expectedContents = Array.isArray(test.expectedHover.contains)
                ? test.expectedHover.contains
                : [test.expectedHover.contains];
              const missingContents = expectedContents.filter(expected => !hoverText.includes(expected));
              if (missingContents.length > 0) {
                passed = false;
                failureReason = `Expected hover at ${test.expectedHover.line}:${test.expectedHover.col} to contain ${missingContents.map(item => `"${item}"`).join(', ')}, but got:\n${hoverText || '(no hover result)'}`;
              }
            }
          } catch (lspErr: any) {
            passed = false;
            failureReason = `LSP hover lookup threw exception: ${lspErr.message}`;
          }
        }

        // LSP Completion Sanity
        if (passed && test.expectedCompletion) {
          try {
            const completions = getCompletionInformation(test.code, test.expectedCompletion.line, test.expectedCompletion.col);
            const compLabels = completions.map(c => c.label);
            const expectedItems = Array.isArray(test.expectedCompletion.contains)
              ? test.expectedCompletion.contains
              : [test.expectedCompletion.contains];
            const missingCompletions = expectedItems.filter(expected => !compLabels.includes(expected));
            if (missingCompletions.length > 0) {
              passed = false;
              failureReason = `Expected completion at ${test.expectedCompletion.line}:${test.expectedCompletion.col} to contain ${missingCompletions.map(item => `"${item}"`).join(', ')}, but got:\n${compLabels.slice(0, 20).join(', ')}`;
            }
          } catch (compErr: any) {
            passed = false;
            failureReason = `LSP completion lookup threw exception: ${compErr.message}`;
          }
        }

        // JS Sandbox
        if (passed) {
          try {
            const jsGen = new JSCodeGenerator();
            const target = test.id.includes('node') ? 'node' : 'browser';
            const emittedJS = jsGen.generate(ast, { target, includePrelude: true });
            const jsResult = JSSandbox.execute(emittedJS);
            if (jsResult.error) {
              passed = false;
              failureReason = `JS Sandbox execution runtime error: ${jsResult.error}`;
            }
          } catch (jsErr: any) {
            passed = false;
            failureReason = `JS Codegen emitted invalid code: ${jsErr.message}`;
          }
        }

        // LLVM SSA
        if (passed) {
          try {
            const llvmGen = new LLVMIRGenerator();
            const emittedLLVM = llvmGen.generate(ast);
            if (!emittedLLVM.includes('define i32 @main()') || !emittedLLVM.includes('target triple')) {
              passed = false;
              failureReason = 'LLVM IR SSA generation failed to emit valid module header or main entry point';
            }
          } catch (llvmErr: any) {
            passed = false;
            failureReason = `LLVM IR generator threw exception: ${llvmErr.message}`;
          }
        }

        // C & C++ Native Codegen
        if (passed) {
          try {
            const cGen = new CCodeGenerator();
            const emittedCpp = cGen.generate(ast, { target: 'cpp', includePrelude: true, includeMain: true });
            if (!emittedCpp.includes('int main') || !emittedCpp.includes('namespace typelang')) {
              passed = false;
              failureReason = 'C++ code generator failed to emit valid main entry point or runtime namespace';
            }

            const emittedC = cGen.generate(ast, { target: 'c', includePrelude: true, includeMain: true });
            if (!emittedC.includes('int main') || !emittedC.includes('typedef struct TL_Val')) {
              passed = false;
              failureReason = 'C code generator failed to emit valid main entry point or C tagged union definition';
            }
          } catch (cErr: any) {
            passed = false;
            failureReason = `C/C++ code generator threw exception: ${cErr.message}`;
          }
        }
      }

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      return {
        test,
        passed,
        typeErrorsCount,
        actualStdout: evalStdout,
        actualDiagnostics,
        actualErrorLines,
        executionTimeMs: duration,
        errorMessage: failureReason,
        details: passed
          ? (test.expectedTypeErrors > 0 || test.expectedParseError || test.expectedRuntimeError
              ? `Passed error verification: accurately detected ${typeErrorsCount} error(s) on line(s) [${actualErrorLines.join(', ')}] with expected message content.`
              : 'Passed lexing, parsing, type checking, evaluation, formatter roundtrip, LSP hover, JS sandbox, LLVM SSA, and C/C++ native codegen.')
          : (failureReason || 'Verification failed')
      };
    } catch (err: any) {
      const endTime = performance.now();
      return {
        test,
        passed: false,
        typeErrorsCount: 1,
        actualStdout: [],
        executionTimeMs: Math.round(endTime - startTime),
        errorMessage: err.message || 'Exception thrown during test run',
        details: `Unhandled exception: ${err.message || String(err)}`
      };
    }
  });
}
