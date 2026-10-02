# TypeLang Canonical Examples

This file captures a few representative TypeLang programs that reflect the behavior and syntax implemented by the lexer and parser in `src/lang/`.

These examples are intentionally short and canonical: they illustrate the language’s actual shape rather than abstract pseudocode.

## 1. Module + function declaration

```type
module Math {
  export function add(a: number, b: number): number {
    return a + b
  }
}

let answer = Math.add(2, 3)
println(answer)
```

This shows:

- module syntax
- exported function declarations
- typed parameters and return type
- function body with `return`
- let-binding and a call expression

## 2. Algebraic data type and pattern matching

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

println(describeShape(Circle(15.0)))
```

This shows:

- GADT-ish constructor syntax
- match expressions with patterns
- guards (`if ...` inside match arms)
- fallback/rest pattern (`...`)
- constructor-style ADT use

## 3. Monadic do notation and where closure

```type
function purchaseItem(userId: number, cost: number): Option<string> {
  do {
    user <- findUser(userId);
    let taxRate = 0.08;
    let totalCost = cost * (1 + taxRate);
    remaining <- validateFunds(user, totalCost);
    pure formatReceipt(user.name, totalCost, remaining);
  }
} where {
  function formatReceipt(name: string, spent: number, rem: number): string {
    concat(name, concat(" purchased item! Total with tax: $", concat(to_string(spent), concat(". Remaining balance: $", to_string(rem)))))
  }
}
```

This shows:

- `do { ... }` syntax
- `<-` bind operator
- `pure` expression
- where-scoped helper functions
- block-scoped local bindings within a computation

## 4. Higher-order and generic function syntax

```type
function map<a, b>(items: List<a>, f: (x: a) -> b): List<b> {
  match (items) {
    Nil => Nil
    Cons(head, tail) => Cons(f(head), map(tail, f))
  }
}
```

This shows:

- polymorphic function parameters with type variables
- function type syntax as `(x: a) -> b`
- recursive match on a list-like ADT

## 5. Record literal and field access

```type
let user = {
  id: 1,
  name: "Alice",
  score: 99
}

println(user.name)
```

This shows:

- record literals using braces and field names
- dotted field access

## 6. Loop and mutation

```type
let mut total = 0
for (let i = 0; i < 10; i = i + 1) {
  total = total + i
}

println(total)
```

This shows:

- mutable binding syntax
- `for` loop syntax
- assignment inside loops

## 7. `if` expression form

```type
let status = if (score >= 90) then "excellent" else "needs work"
```

This demonstrates the parser’s `if` expression style and the `then` keyword form.

## Summary

These examples reflect the actual language surface implemented by the project:

- typed functions
- GADTs / constructor-style types
- match expressions and guards
- `do` notation
- where scopes
- records, loops, and mutation
- a syntax that is clearly distinct from plain TypeScript
