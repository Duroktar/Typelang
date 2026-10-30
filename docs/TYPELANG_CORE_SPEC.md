# TypeLang Core Intermediate Language (Core IR) Specification

Inspired by **GHC Haskell Core** (System $F_C$), **TypeLang Core** is a tiny, explicit, strongly-typed functional intermediate language. High-level TypeLang surface syntax (loops, pattern matching, method calls, do-notation, where clauses, type classes, GADTs, multi-statement blocks) is desugared into Core IR before code generation.

---

## 1. Syntax & Formal Grammar

The Core IR grammar consists of only **8 expression forms**:

```bnf
CoreType ::=
    PrimitiveType             -- "number" | "boolean" | "string" | "void"
  | CoreType "->" CoreType    -- Function type
  | ConName CoreType*         -- Type constructor application (e.g. Option a)
  | TypeVar                   -- Type variable (e.g. a)

CoreExpr ::=
    Var                       -- Variable reference (x)
  | Lit                       -- Literals (42.0, "hello", true)
  | "\" Var "->" CoreExpr     -- Lambda abstraction (\x -> body)
  | CoreExpr CoreExpr         -- Function application (f x)
  | "let" Var "=" CoreExpr "in" CoreExpr  -- Non-recursive / recursive let binding
  | ConName CoreExpr*         -- Data constructor application (Some x, Cons h t)
  | "case" CoreExpr "of" "{" CaseArm* "}" -- Pattern match / elimination
  | "(" PrimOp CoreExpr* ")"  -- Primitive CPU/runtime operation (+, -, *, fcmp, etc.)

CaseArm ::=
    ConName Var* "->" CoreExpr -- Constructor match with bound variables

CoreDecl ::=
    "letrec" Var Var* "=" CoreExpr

CoreProgram ::=
    CoreDecl* ("main" "=" CoreExpr)?
```

---

## 2. AST Data Structures (`src/lang/core.ts`)

```typescript
export type CoreType =
  | { kind: 't_primitive'; name: string }
  | { kind: 't_function'; param: CoreType; returnType: CoreType }
  | { kind: 't_con'; name: string; args: CoreType[] }
  | { kind: 't_var'; name: string };

export type CoreExpr =
  | { kind: 'e_var'; name: string }
  | { kind: 'e_lit'; value: number | string | boolean }
  | { kind: 'e_lam'; param: string; paramType?: CoreType; body: CoreExpr }
  | { kind: 'e_app'; fn: CoreExpr; arg: CoreExpr }
  | { kind: 'e_let'; name: string; val: CoreExpr; body: CoreExpr }
  | { kind: 'e_con'; name: string; args: CoreExpr[] }
  | { kind: 'e_case'; scrutinee: CoreExpr; arms: CoreCaseArm[] }
  | { kind: 'e_prim'; op: string; args: CoreExpr[] };

export interface CoreCaseArm {
  constructorName: string;
  boundVars: string[];
  body: CoreExpr;
}

export interface CoreDecl {
  name: string;
  type?: CoreType;
  params: { name: string; type?: CoreType }[];
  body: CoreExpr;
}

export interface CoreProgram {
  decls: CoreDecl[];
  mainExpr?: CoreExpr;
}
```

---

## 3. Surface Language Lowering Principles

| Surface TypeLang Feature | Core IR Translation |
|---|---|
| **Multi-statement blocks (`{ let x = 1; let y = 2; x + y }`)** | Nested `let` expressions: `let x = 1 in let y = 2 in (+ x y)` |
| **Multi-parameter functions (`f(a, b, c)`)** | Curried applications: `(((f a) b) c)` |
| **If-expressions (`if (c) a else b`)** | Primitive branching: `(if c a b)` |
| **Functions with `return`** | Value unrolling directly into the inner expression node |
| **Top-level statements (`let x = ...; println(...)`)** | Folded sequentially into `main = let x = ... in ...` |
| **Pattern matching (`match (x) { ... }`)** | `case x of { Ctor v1 ... vn -> body }` |
| **GADTs / Algebraic Data Types** | Constructor tags (`e_con`) eliminated by `e_case` |

---

## 4. Pipeline Flow

```
Surface TypeLang (.tl)
        │
        ▼ (Lexer & Parser)
TypeLang AST (Program)
        │
        ▼ (CoreLowerer)
TypeLang Core IR (.core)
        │
        ├──► LLVM SSA Codegen (via llvm-bindings or text emitter) ──► Executed by SSA Engine
        └──► Future Bytecode / WebAssembly VM / Optimization Passes
```
