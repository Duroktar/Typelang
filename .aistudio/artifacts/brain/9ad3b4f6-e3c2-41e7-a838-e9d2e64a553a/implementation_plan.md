# TypeLang Self-Hosted Compiler & Multi-Stage Bootstrap Pipeline

A complete self-hosted compiler for TypeLang written entirely in TypeLang, producing portable standard C11/C99 code, organized into a clean modular architecture under `/bootstrap`, with automated multi-stage bootstrap verification.

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural directions below were confirmed in Phase 1 clarification:

- **Confirmed Target**: Standard portable C11 / C99. Universal compatibility with GCC, Clang, and MSVC; zero external runtime dependencies; transparent human-readable emitted code.
- **Confirmed Directory Structure**: Dedicated modular `/bootstrap/` workspace containing decoupled modules (`tokens.tl`, `lexer.tl`, `ast.tl`, `parser.tl`, `checker.tl`, `codegen_c.tl`, `driver.tl`).
- **Confirmed Playground Strategy**: Example 35 marked as Deprecated with an explanatory banner and direct reference pointing developers to the canonical `/bootstrap/` suite.
- **Confirmed Verification Strategy**: Automated multi-stage bootstrap pipeline (`Stage 1 -> Stage 2 -> Test Programs -> Fixed-Point Comparison`) validating that the self-compiled compiler produces identical native binaries.

---

## 1. Overview & Core Concept

TypeLang has matured with algebraic data types, pattern matching, records, first-class functions, and native execution. This milestone transitions TypeLang from a TypeScript-hosted prototype into a fully self-hosted language ecosystem:

- **Self-Hosting Capability**: The TypeLang compiler itself is written in TypeLang (`/bootstrap/`).
- **Portable Native Target**: Compiles TypeLang source code into clean, standalone ISO C11/C99 source files with an embedded lightweight runtime header (`tl_runtime.h`).
- **Dual-Mode Operation**: Can be bundled and executed inside the TypeScript host (Stage 0) or compiled via native host compilers (`gcc`/`clang`) to produce a fast native CLI compiler executable (`tlc`).
- **End-to-End Validation**: Rigorous test harness proving self-hosting equivalence:
  $$\text{Source} \xrightarrow{\text{Stage 0 (TS)}} \text{Stage 1 (C)} \xrightarrow{\text{gcc}} \text{Binary 1} \xrightarrow{\text{compile /bootstrap}} \text{Stage 2 (C)} \xrightarrow{\text{diff}} \text{Fixed Point}$$

---

## 2. User Experience & Visual Design

### Key User Flows in Playground IDE

```
┌────────────────────────────────────────────────────────────────────────┐
│ TypeLang Playground IDE                                                │
│ ┌─────────────────────────┬──────────────────────────────────────────┐ │
│ │ Example Menu            │ Editor & Diagnostics                     │ │
│ │  ├─ 01. Basic Syntax    │ [DEPRECATED NOTICE: Example 35 has been  │ │
│ │  ├─ ...                 │  migrated to dedicated /bootstrap suite] │ │
│ │  └─ 35. Self-Hosted (⚑) │                                          │ │
│ └─────────────────────────┴──────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Bottom Panel: Compiler Output / Native Terminal / Bootstrap Status │ │
│ │ Stage 0 (TS) -> Stage 1 (C) -> Stage 2 (Fixed Point Verified ✓)    │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Playground Example Menu Update**:
   - Example 35 displays a clear `(Deprecated)` label in the dropdown and sidebar.
   - When selected, a notice informs the developer: *"Example 35 is a single-file prototype. The production self-hosted compiler has moved to the `/bootstrap/` directory with full C11 code generation and multi-stage verification."*
   - Existing automated test references in `src/lang/tests.ts` remain functional without breaking regression test runs.

2. **CLI & Bootstrap Workflow**:
   - `npm run bootstrap`: Runs the complete multi-stage pipeline, outputting clear step-by-step progress, timings, and validation results.
   - `npm run bootstrap:stage1`: Compiles `/bootstrap` with the Stage 0 TypeScript compiler into `.tl_build/bootstrap/stage1.c`.
   - `npm run bootstrap:stage2`: Compiles `/bootstrap` using the Stage 1 native binary to generate `.tl_build/bootstrap/stage2.c`.
   - `npm run bootstrap:verify`: Validates binary parity / AST equivalence between Stage 1 and Stage 2 outputs.

---

## 3. Key Product Decisions & Trade-Offs

- **Standard C11/C99 over LLVM IR**:
  - *Chosen Approach*: Emits clean, human-readable C code adhering to standard C11/C99.
  - *Why*: Direct LLVM IR bindings are tightly coupled to LLVM version changes (LLVM 14 vs 16 vs 18 differences in opaque pointers, attributes, etc.). C is universally portable, compiles on any platform using `gcc`, `clang`, or `tcc`, and can be inspected without LLVM toolchains installed.
  - *Trade-off*: Slightly slower compile step than in-memory LLVM JIT, but vastly superior reliability, debuggability, and native portability.

- **Modular `/bootstrap` with Single-Source Bundle Capability**:
  - *Chosen Approach*: Maintain modular source files (`tokens.tl`, `lexer.tl`, `ast.tl`, `parser.tl`, `checker.tl`, `codegen_c.tl`, `main.tl`) with a lightweight bundler script (`scripts/bundle_bootstrap.ts`) that produces a monolithic compiler file for Stage 0 compilation.
  - *Why*: Developers get clean separation of concerns and maintainable code without needing a complex multi-file linker in Stage 0.

- **Lightweight Standalone Runtime Header (`tl_runtime.h`)**:
  - *Chosen Approach*: A zero-dependency C header file providing arena memory management, dynamic string buffers, and slice/list representations needed by the emitted code.
  - *Why*: The emitted C code requires no external libraries (like GLib or Boehm GC); standard `malloc`/`free` or arena allocation is completely self-contained.

---

## 4. Technical Architecture & Data Strategy

### Bootstrap Compilation Flow Diagram

```
                ┌───────────────────────────────────┐
                │   Modular Source (/bootstrap/)    │
                │  tokens · lexer · ast · parser    │
                │     checker · codegen_c · main    │
                └─────────────────┬─────────────────┘
                                  │ (bundle)
                                  ▼
                ┌───────────────────────────────────┐
                │ .tl_build/bootstrap/compiler.tl   │
                └─────────────────┬─────────────────┘
                                  │
                   ┌──────────────┴──────────────┐
                   │ Stage 0: TypeScript Host    │
                   │ (npm run build:stage0)      │
                   └──────────────┬──────────────┘
                                  │ emits
                                  ▼
                ┌───────────────────────────────────┐
                │ .tl_build/bootstrap/stage1.c      │
                │ + bootstrap/runtime/tl_runtime.h  │
                └─────────────────┬─────────────────┘
                                  │
                   ┌──────────────┴──────────────┐
                   │ Host C Compiler (gcc/clang) │
                   └──────────────┬──────────────┘
                                  │ builds
                                  ▼
                ┌───────────────────────────────────┐
                │ .tl_build/bootstrap/tlc_stage1    │ (Native Executable)
                └─────────────────┬─────────────────┘
                                  │
                   ┌──────────────┴──────────────┐
                   │ Compiles compiler.tl        │
                   │ using tlc_stage1            │
                   └──────────────┬──────────────┘
                                  │ emits
                                  ▼
                ┌───────────────────────────────────┐
                │ .tl_build/bootstrap/stage2.c      │
                └─────────────────┬─────────────────┘
                                  │
                                  ▼
                ┌───────────────────────────────────┐
                │ Verification Engine:              │
                │ diff(stage1.c, stage2.c) == 0     │
                │ ✓ Fixed-Point Bootstrap Confirmed │
                └───────────────────────────────────┘
```

### Module Responsibilities in `/bootstrap`

1. **`runtime/tl_runtime.h`**:
   - Tagged value representations, dynamic string formatting, list buffers, memory arena.
2. **`tokens.tl`**:
   - Enumeration of token kinds, keyword lookup table, token position tracking.
3. **`lexer.tl`**:
   - Lexical scanner: handles numbers, identifiers, string literals, operators, comments, whitespace.
4. **`ast.tl`**:
   - AST node types: Statements (VarDecl, Assign, If, While, For, Return, FuncDecl, StructDecl), Expressions (Binary, Unary, Call, Member, Identifier, Literal).
5. **`parser.tl`**:
   - Recursive-descent parser with precedence climbing for binary expressions.
6. **`checker.tl`**:
   - Type inference, scope environment tables, type validation (primitives, structs, functions).
7. **`codegen_c.tl`**:
   - C11/C99 emitter: writes forward declarations, struct definitions, runtime functions, and formatted C statement/expression trees.
8. **`main.tl`**:
   - CLI entrypoint: parses input flags, reads source code, runs lexer/parser/checker/codegen, and outputs target C code to `stdout` or file.

---

## 5. Verification & Test Plan

1. **Automated Stage Pipeline**:
   - Run `npm run bootstrap` to execute all steps sequentially:
     - Bundle `/bootstrap` modules.
     - Stage 0 generates `stage1.c`.
     - `gcc` compiles `stage1.c` into native `tlc_stage1`.
     - `tlc_stage1` compiles test programs (`hello.tl`, `fib.tl`, `mandelbrot.tl`).
     - `gcc` compiles the test programs and verifies expected runtime output.
     - `tlc_stage1` compiles `compiler.tl` into `stage2.c`.
     - Validate that `stage1.c` and `stage2.c` are functionally identical or reach fixed-point convergence.
2. **Regression Safety**:
   - `npm test` continues to pass 100% of existing unit tests.
   - `npm run lint` and `npm run build` pass without warnings or errors.
