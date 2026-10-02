# TypeLang Spec Checklist

This document is a stricter implementation-aligned checklist that separates what the current TypeLang parser and lexer clearly support from what is more aspirational or experimental.

It is intended to act as a practical specification guide for the repo, grounded in the actual parser in `src/lang/parser.ts` and the examples in `src/lang/examples/`.

## 1. Clearly supported today

These constructs are implemented in the current parser and/or examples:

### Module system

- [x] `module Name { ... }`
- [x] nested statements inside modules
- [x] `export` on functions and declarations
- [x] `import` statements with optional aliasing

### Type declarations

- [x] `type Name = AliasType;`
- [x] `type Name = | Constructor(...) | ...`
- [x] constructor-style GADT declarations
- [x] optional type parameters, such as `Type<a>` and `F<_>`

### Function declarations

- [x] `function name(param: Type, ...): ReturnType { ... }`
- [x] `fn` short form for lambdas and declarations
- [x] named functions with optional type parameters
- [x] `where` clauses after function declarations

### Let bindings

- [x] `let x = expr`
- [x] `let mut x = expr`
- [x] optional type annotation `let x: number = expr`

### Expressions

- [x] numbers, strings, booleans
- [x] variable references and function calls
- [x] arithmetic and comparison operators
- [x] logical `&&` and `||`
- [x] assignment operators `=`, `+=`, `-=`, `*=`, `/=`
- [x] range syntax `..` and `..=`
- [x] unary `!` and `-`
- [x] ternary `? :`
- [x] record literals `{ key: value }`
- [x] array/index style access `expr[index]`
- [x] field access `obj.field`
- [x] method calls `obj.method(args)`
- [x] block expressions `{ ... }`

### Control flow

- [x] `if cond then expr else expr`
- [x] `if (cond) expr else expr`
- [x] `while (cond) { ... }`
- [x] `for (init; cond; update) { ... }`
- [x] `switch` expression syntax
- [x] `break` and `continue`
- [x] `return expr`

### Pattern matching

- [x] `match (expr) { ... }`
- [x] constructor patterns like `Circle(r)`
- [x] guard clauses `if ...`
- [x] aliasing via `as`
- [x] fallback/rest pattern `...`

### Do-notation / monadic syntax

- [x] `do { ... }`
- [x] bind operator `<-`
- [x] `pure expr`
- [x] `let` inside do blocks
- [x] `where` blocks on functions and expressions

### Type system surface

- [x] explicit type annotations
- [x] polymorphic generics
- [x] records and tuples as type shapes
- [x] function types in syntax
- [x] higher-order-ish type parameter notation such as `F<_>`

## 2. Supported but more experimental / evolving

These are present in the design and implementation but may be less stable than the core syntax:

- [x] higher-kinded type concepts and kind inference logic
- [x] existential packing patterns
- [x] advanced monadic examples in `src/lang/examples/`
- [x] `where` expression scoping beyond simple helper functions
- [x] `extern module` declarations and FFI-style integration
- [x] `switch` and `case` values in expression form

These should be treated as advanced compiler features rather than a fully stabilized public language surface.

## 3. Likely aspirational / not yet canonicalized

These are not necessarily a formal finalized part of the public language spec, even if they are partially represented in the parser or examples:

- [ ] a fully finalized public grammar specification for every edge case
- [ ] strict rule coverage for all possible higher-kinded type combinations
- [ ] complete exhaustiveness checking for all match forms in all contexts
- [ ] complete standard-library API freeze
- [ ] final, canonical docs for every DSL/host integration
- [ ] unambiguous semantics for every exotic expression form

These areas are clearly being explored and built out, but they are not presented as final language commitments in the repo.

## 4. Canonical syntax to preserve

The following patterns should be treated as the “gold standard” TypeLang surfaces for future work:

```type
module Name {
  export function foo(x: number): number {
    return x + 1
  }
}

type Shape =
  | Circle(radius: number): Shape
  | Rectangle(width: number, height: number): Shape
  | Point: Shape

match (value) {
  Circle(r) if r > 10 => "big"
  Rectangle(w, h) => "rect"
  ... => "fallback"
}

do {
  x <- loadValue();
  pure transform(x);
}

function pair<a, b>(x: a, y: b): (a, b) {
  (x, y)
}
```

These are the most representative examples of the language surface that the repository currently embodies.

## 5. Implementation guidance for future changes

When changing the language, the safest rule is:

1. Keep core syntax stable.
2. Prefer adding features that fit the existing parser precedence and AST structure.
3. Update both the examples and the grammar docs together.
4. Treat the parser as the real source of truth, not informal prose.
5. Keep the UI/editor grammar aligned with the language surface.

## 6. Final status

The repo currently presents TypeLang as a real custom language with a working front-end pipeline and a broad research/compiler-playground scope. The parser and examples are the primary source of truth, and the grammar docs should evolve in step with them.
