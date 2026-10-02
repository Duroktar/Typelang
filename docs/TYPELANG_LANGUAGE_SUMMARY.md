# TypeLang Language Summary

This repository is a TypeScript host implementation of a custom language called TypeLang. The host app is written in TypeScript and React, but the language itself lives in the compiler pipeline under `src/lang/`.

## Core idea

The actual language being designed is not JavaScript or TypeScript. It is a custom typed language with a lexer, parser, AST, evaluator, type checker, and code generators.

The host project is the tooling around it:

- `src/lang/lexer.ts` — lexical analysis for TypeLang tokens
- `src/lang/parser.ts` — recursive-descent parser for TypeLang syntax
- `src/lang/ast.ts` — TypeLang AST and type representation
- `src/lang/textmateGrammar.ts` — VS Code syntax highlighting for the language
- `src/lang/examples/` — language examples showing the intended semantics and syntax

## Why this matters

The TypeScript files in the repo are not the language itself. They are the implementation environment that compiles, checks, and executes TypeLang programs.

In other words:

- TypeScript is the implementation language of the compiler and IDE
- TypeLang is the custom language being compiled and edited

## Language characteristics

From the lexer, parser, type system, and examples, TypeLang clearly includes:

- modules and imports
- exports and extern bindings
- typed function declarations
- `let` bindings and mutable variables
- pattern matching with guards
- `if`, `switch`, `for`, and `while`
- block expressions and record literals
- algebraic data types and GADTs
- `match` expressions with fallback/rest patterns
- `do { ... }` monadic notation
- `where { ... }` scoped bindings
- polymorphic type syntax such as `<a>` and `Option<a>`

## Examples that reveal the language

The examples folder is especially useful for understanding the language because it shows intended real-world usage.

Key examples include:

- `src/lang/examples/06_pattern_matching.ts` — exhaustive match syntax and guards
- `src/lang/examples/44_monads_do_where.ts` — monadic `do` notation and scoped `where` blocks
- `src/lang/examples/` overall — demonstrates the breadth of the language, from cryptography to games and UI to compiler experiments

## Lexer overview

The lexer in `src/lang/lexer.ts` tokenizes TypeLang into:

- `KEYWORD`
- `IDENT`
- `NUMBER`
- `STRING`
- `BOOLEAN`
- `SYMBOL`
- `EOF`

It handles:

- identifier and keyword recognition
- numeric literals
- string literals with quotes
- multi-character operators such as `=>`, `->`, `<-`, `==`, `!=`, `<=`, `>=`, `&&`, `||`, `+=`, `-=`, `*=`, `/=`
- comments (`//`, `/* ... */`)
- whitespace skipping
- source locations with line/column tracking

This is a complete front-end tokenization layer, not a loose parser shortcut.

### Documentation comments

Contiguous `///` lines and `/** ... */` blocks immediately before a declaration
are retained as documentation trivia. A blank line separates a comment from the
following declaration. Documentation is available in editor hover for functions,
parameters, variables, type aliases, GADTs, and GADT constructors; ordinary
`//` and `/* ... */` comments remain non-documenting comments.

Function comments support Markdown summaries and tags such as `@param`,
`@returns`/`@return`, `@example`, `@deprecated`, `@since`, `@throws`, `@see`,
and `@typeparam`/`@template`. `@param` also accepts an optional JSDoc-style type
and `-` separator. Parameter descriptions appear both in the function hover and
when hovering the parameter itself. The formatter normalizes documentation to
`///` lines and preserves it on the declaration.

Standard-library module and global-function hovers use the same doc-comment
renderer. The curated standard-library catalog supplies descriptions and
examples, while the checker derives parameter names and return types from its
actual synthetic API types. Qualified and selectively imported members retain
their documentation in hovers.

```typelang
/// Combines a display name and a greeting.
/// @param name - The person to greet.
/// @returns The completed greeting.
/// @example
/// greet("Ada")
export function greet(name: string): string {
  concat("Hello, ", name)
}
```

## Parser overview

The parser in `src/lang/parser.ts` is a recursive-descent parser built around `parseProgram()`, `parseStatement()`, and `parseExpr()`.

It supports:

- module declarations
- import/export statements
- extern declarations
- type declarations and GADT constructors
- function definitions
- let declarations
- expression statements
- block expressions
- control-flow expressions
- match expressions
- `do` notation
- record and tuple expressions
- field access, method calls, and indexing

The parser includes precedence levels for:

1. assignment
2. ternary
3. logical OR / AND
4. equality
5. relational
6. range
7. additive
8. multiplicative
9. unary
10. postfix

This is the standard compiler pipeline shape for a typed expression language.

## AST and type system

The AST in `src/lang/ast.ts` shows the intended abstraction layer of the language.

It defines:

- type expressions
- Kinds and higher-kinded type parameter representations
- GADTs and type aliases
- patterns such as wildcard, variable, literal, constructor, record, tuple, alias, and rest
- expressions such as `e_match`, `e_do`, `e_where`, `e_lambda`, field access, method calls, and indexing

This demonstrates that TypeLang is intended to be a serious, type-driven language rather than a simple scripting language.

## TextMate grammar

The TextMate grammar in `src/lang/textmateGrammar.ts` confirms the intended editor experience.

It defines syntax scopes for:

- comments
- strings
- numbers
- booleans
- keywords
- operators
- declarations
- function names
- punctuation
- identifiers

This file is the editor-facing syntax model for the language and is a strong indicator that TypeLang is intended to work well inside VS Code and similar editors.

## Representative syntax samples

### Pattern matching

```type
type Shape =
  | Circle(radius: number): Shape
  | Rectangle(width: number, height: number): Shape
  | Point: Shape

function describeShape(s: Shape): string {
  match (s) {
    Circle(r) if r > 10.0      => "Large Circle"
    Circle(r)                  => "Small Circle"
    Rectangle(w, h) if w == h  => "Square"
    Rectangle(w, h)            => "Rectangle"
    ...                        => "Point or Other"
  }
}
```

### Monadic do notation and where clauses

```type
function purchaseItem(userId: number, cost: number): Option<string> {
  do {
    user <- findUser(userId);
    remaining <- validateFunds(user, totalCost);
    pure formatReceipt(user.name, totalCost, remaining);
  }
} where {
  function formatReceipt(...) { ... }
}
```

## Summary

TypeLang is best understood as a custom typed language with a real front-end pipeline, implemented in TypeScript for the host environment. The language is not TypeScript; it is a distinct language that happens to be implemented and evaluated inside a TypeScript project.

This is a compiler playground / language workbench, and the repository structure reflects that design clearly.
