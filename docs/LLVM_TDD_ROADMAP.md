# TypeLang LLVM Native Target — Architecture & TDD Roadmap

This document outlines the target compatibility matrix, memory models, SSA compilation rules, and the TDD verification checklist for TypeLang's LLVM IR native compiler backend.

---

## 1. Target Compatibility Matrix

| Feature / Subsystem | LLVM IR (Native Target) | JavaScript (Browser) | Node.js (Server) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Primitives (`number`, `boolean`, `void`)** | ✅ **Native** | ✅ Supported | ✅ Supported | Native 64-bit IEEE 754 floats (`double`) & 1-bit booleans (`i1`) |
| **String Literals & Operations** | ✅ **Native** | ✅ Supported | ✅ Supported | Interned C-strings, `malloc`/`strcpy`/`strcat`/`sprintf` |
| **Arithmetic & Bitwise Expressions** | ✅ **Native** | ✅ Supported | ✅ Supported | Native LLVM SSA floating-point & integer instructions |
| **Variables & Stack Scoping** | ✅ **Native** | ✅ Supported | ✅ Supported | Dedicated `alloca` stack slots with `load`/`store` |
| **Control Flow (`if`/`else`)** | ✅ **Native** | ✅ Supported | ✅ Supported | SSA Basic Blocks & `phi` convergence nodes |
| **Loops (`while`, `for`, `break`)** | ✅ **Native** | ✅ Supported | ✅ Supported | Condition, loop body, and merge branch blocks |
| **First-Order Functions** | ✅ **Native** | ✅ Supported | ✅ Supported | Typed C calling convention with signature inference |
| **Higher-Order Functions & Lambdas** | ✅ **Native** | ✅ Supported | ✅ Supported | First-class function pointers + `castToI8Ptr` boxing |
| **Tagged Unions & GADTs** | ✅ **Native** | ✅ Supported | ✅ Supported | `%struct.GADTValue` (`{ i32 tag, i8* payload }`) |
| **Pattern Matching** | ✅ **Native** | ✅ Supported | ✅ Supported | LLVM `switch` instruction + payload deconstruction |
| **Structural Records & Tuples** | ✅ **Native** | ✅ Supported | ✅ Supported | Dynamic heap offsets via `getelementptr` |
| **Dynamic Arrays** | ✅ **Native** | ✅ Supported | ✅ Supported | `%struct.Array` (`{ i64 len, i8** data }`) |
| **Standard C POSIX I/O** | ✅ **Native** | ✅ Supported | ✅ Supported | libc `@printf`, `@sprintf`, `@puts` |
| **Standard Math Built-ins** | ✅ **Native** | ✅ Supported | ✅ Supported | `@llvm.sqrt.f64`, `@llvm.pow.f64`, `@llvm.fabs.f64` |
| **Browser DOM / Canvas 2D / WebAudio**| ❌ **Incompatible** | ✅ Native | ❌ Incompatible | Target diagnostics flag web-only APIs |
| **Node.js APIs (`fs`, `http`, `express`)**| ❌ **Incompatible** | ❌ Incompatible | ✅ Native | Target diagnostics flag Node-only APIs |
| **Dynamic NPM Packages (JS-only)** | ❌ **Incompatible** | ✅ Native | ✅ Native | Requires C ABI FFI bindings for native targets |

---

## 2. TDD Implementation Checklist

- [x] **Stage 1: Primitives & Constants**
  - [x] 1.1 Number literals (`double`)
  - [x] 1.2 Integer formatting (`%lld`, `i64`)
  - [x] 1.3 Boolean constants (`i1` $\rightarrow$ `"true"` / `"false"`)
  - [x] 1.4 String literals (interning, null-terminator, UTF-8 escaping)

- [x] **Stage 2: Operators & Expressions**
  - [x] 2.1 Floating-point arithmetic (`+`, `-`, `*`, `/`, `%`)
  - [x] 2.2 Relational comparisons (`<`, `<=`, `>`, `>=`, `==`, `!=`)
  - [x] 2.3 Boolean logic (`&&`, `||`, `!`)
  - [x] 2.4 Unary operations (`-a`, `!b`)

- [x] **Stage 3: Variables, Scoping & Stack Slots**
  - [x] 3.1 `alloca` allocation, `store`, and `load` for `let` bindings
  - [x] 3.2 Stack allocation for string & boolean variables
  - [x] 3.3 Variable reassignment & mutation

- [x] **Stage 4: Control Flow & Basic Blocks**
  - [x] 4.1 `if` / `else` conditional branching with merge blocks
  - [x] 4.2 SSA `phi` node resolution across divergent branches
  - [x] 4.3 Statement if-block without else

- [x] **Stage 5: Loops & Iteration**
  - [x] 5.1 `while` loops with condition evaluation, body block, loop merge
  - [x] 5.2 `for` loops with initialization, condition, update, body
  - [x] 5.3 Loop-carried variables and mutation

- [x] **Stage 6: Top-Level Functions & Signatures**
  - [x] 6.1 Function signature AST inference (types $\rightarrow$ LLVM types)
  - [x] 6.2 Multi-parameter stack allocation and loading
  - [x] 6.3 Return type casting (`double`, `i8*`, `i1`, `void`)
  - [x] 6.4 Direct & recursive function calls

- [x] **Stage 7: Higher-Order Functions & Lambdas**
  - [x] 7.1 Anonymous lambda symbol generation (`@.lambda_N`)
  - [x] 7.2 Function pointer bitcasting (`i8* (i8*)*`)
  - [x] 7.3 Box/unbox roundtripping (`castToI8Ptr` / `castFromI8Ptr`)

- [x] **Stage 8: Tagged Unions (GADTs) & Heap Layouts**
  - [x] 8.1 Tagged struct allocation (`%struct.GADTValue { i32, i8* }`)
  - [x] 8.2 Nullary constructors (singleton tag)
  - [x] 8.3 Multi-argument constructor payload buffer packing

- [x] **Stage 9: Pattern Matching Engine**
  - [x] 9.1 Tag extraction and LLVM `switch` statement lowering
  - [x] 9.2 Memory payload deconstruction & variable extraction
  - [x] 9.3 Type-aware match `phi` nodes across arms
  - [x] 9.4 Wildcard & default match fallbacks

- [ ] **Stage 10: Target Diagnostics & Incompatibility Warnings**
  - [ ] 10.1 Static analysis pass identifying incompatible modules (DOM, Node, NPM) when targeting LLVM
