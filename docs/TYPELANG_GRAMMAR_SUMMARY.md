# TypeLang Grammar Summary

This document summarizes the TypeLang grammar as implemented by the lexer and parser in `src/lang/`.

## 1. Lexical grammar

### Tokens

```ebnf
Token          ::= Keyword
                 | Ident
                 | Number
                 | String
                 | Boolean
                 | Symbol
                 | EOF

Keyword        ::= "module" | "export" | "import" | "extern" | "as" | "type"
                 | "function" | "fn" | "match" | "if" | "return" | "else" | "then"
                 | "mut" | "true" | "false" | "let" | "self" | "for" | "while"
                 | "switch" | "case" | "default" | "in" | "break" | "continue"
                 | "do" | "where" | "pure"

Ident          ::= [A-Za-z_][A-Za-z0-9_]*
Number         ::= [0-9]+ ( "." [0-9]+ )?
String         ::= '"' ... '"' | "'" ... "'"
Boolean        ::= "true" | "false"
Symbol         ::= "..." | "..=" | ".." | "=>" | "->" | "<-" | "==" | "!="
                 | "<=" | ">=" | "&&" | "||" | "+=" | "-=" | "*=" | "/="
                 | "{" | "}" | "(" | ")" | "[" | "]" | ":" | ";" | ","
                 | "." | "|" | "?" | "=" | "+" | "-" | "*" | "/" | "%"
                 | "<" | ">" | "!"
```

### Comments

```text
// single-line comment
/* block comment */
```

## 2. Program structure

```ebnf
Program        ::= Statement*

Statement      ::= Export? ExternStatement
                 | Export? ImportStatement
                 | Export? ModuleStatement
                 | Export? TypeDeclaration
                 | Export? FunctionDeclaration
                 | Export? LetStatement
                 | ExprStatement
```

## 3. Top-level declarations

### Module

```ebnf
ModuleStatement ::= "module" Ident "{" Statement* "}"
```

### Import

```ebnf
ImportStatement ::= "import" ModulePath ("as" Ident)? ";"
ModulePath      ::= Ident ("." Ident)*
```

### Extern

```ebnf
ExternStatement ::= "extern" (
                     "module" (String | Ident) ("as" Ident)? "{" ExternMember* "}"
                   | "fn" ExternFunction
                   | "function" ExternFunction
                   | "type" ExternType
                   | ("let" | "const" | "var") ExternValue
                   )
```

### Type declaration

```ebnf
TypeDeclaration ::= "type" Ident TypeParams? "=" GADTConstructors
                  | "type" Ident TypeParams? "=" TypeAST ";"
```

### GADT constructors

```ebnf
GADTConstructors ::= ("|")? GADTConstructor ("|" GADTConstructor)*

GADTConstructor ::= Ident TypeParams? ConstructorSignature?

ConstructorSignature ::= "(" GADTParamList? ")" 
                      | ":" TypeAST
                      | "(" GADTParamList? ")" ":" TypeAST
```

### Function declaration

```ebnf
FunctionDeclaration ::= "function" Ident TypeParams? "(" ParamList? ")" (":" TypeAST)? "{" BlockBody "}" ("where" "{" Statement* "}")?
```

### Let binding

```ebnf
LetStatement ::= "let" ("mut")? Ident (":" TypeAST)? "=" Expr (";")?
```

## 4. Type syntax

```ebnf
TypeAST        ::= BaseType
                 | TypeVar
                 | FunctionType
                 | RecordType
                 | TupleType
                 | TypeApp
                 | ForallType
                 | TypeLambda

BaseType      ::= "number" | "boolean" | "string" | "void"
TypeVar       ::= Ident
TypeApp       ::= Ident TypeArgs?
TypeArgs      ::= "<" TypeAST ("," TypeAST)* ">"
FunctionType  ::= TypeAST "->" TypeAST
RecordType    ::= "{" FieldType ("," FieldType)* "}"
TupleType     ::= "[" TypeAST ("," TypeAST)* "]"
```

### Examples

```type
number
string
Option<a>
List<number>
(a, b) -> c
{ id: number, name: string }
```

## 5. Expression grammar

```ebnf
Expr          ::= Assignment

Assignment    ::= Ternary ( ("=" | "+=" | "-=" | "*=" | "/=") Assignment )?

Ternary       ::= LogicalOr ( "?" Expr ":" Expr )?
LogicalOr     ::= LogicalAnd ("||" LogicalAnd)*
LogicalAnd    ::= Equality ("&&" Equality)*
Equality      ::= Relational (("==" | "!=") Relational)*
Relational    ::= Range (("<" | "<=" | ">" | ">=") Range)*
Range         ::= Additive ( (".." | "..=") Additive )?
Additive      ::= Multiplicative (("+" | "-") Multiplicative)*
Multiplicative ::= Unary (("*" | "/" | "%") Unary)*
Unary         ::= ("!" | "-") Unary | Postfix
Postfix       ::= Primary ( Call | FieldAccess | MethodCall | IndexAccess )*
```

## 6. Primary expressions

```ebnf
Primary       ::= Number
                | String
                | Boolean
                | "break"
                | "continue"
                | "return" Expr?
                | "match" "(" Expr ")" "{" MatchArm* "}"
                | "switch" ("(" Expr ")")? "{" SwitchCase* "}"
                | "if" ("(" Expr ")")? Expr ("then" Expr)? ("else" Expr)?
                | "for" "(" (LetStatement | Expr)? ";" Expr? ";" Expr? ")" "{" BlockBody "}"
                | "while" ("(" Expr ")")? "{" BlockBody "}"
                | "do" ("(" Expr ")")? "{" DoItem* "}"
                | BlockExpression
                | RecordExpression
                | LambdaExpression
                | Ident
                | CallExpression
```

## 7. Lambda expressions

```ebnf
LambdaExpression ::= TypeParams? "(" ParamList? ")" (":" TypeAST)? "=>" Expr
                   | "fn" TypeParams? "(" ParamList? ")" (":" TypeAST)? ("=>" Expr | "{" BlockBody "}")
```

## 8. Match expressions

```ebnf
MatchArm      ::= Pattern ("if" Expr)? "=>" Expr
Pattern       ::= PatternAtom ("as" Ident)?

PatternAtom   ::= "..."
                | Ident
                | Literal
                | ConstructorPattern
                | RecordPattern
                | TuplePattern
                | "_"

ConstructorPattern ::= Ident PatternArgList?
RecordPattern     ::= "{" FieldPattern ("," FieldPattern)* "}"
TuplePattern      ::= "(" Pattern ("," Pattern)* ")"
```

## 9. Do-notation and where clauses

```ebnf
DoItem        ::= DoBind | DoLet | DoExpr | DoReturn
DoBind        ::= Pattern "<-" Expr ";"
DoLet         ::= "let" Ident "=" Expr ";"
DoExpr        ::= Expr ";"
DoReturn      ::= "pure" Expr ";"

WhereClause   ::= "where" "{" Statement* "}"
```

## 10. Examples of the intended surface syntax

```type
module Math {
  export function sqrt(x: number): number {
    return x
  }
}

function add<a>(x: a, y: a): a {
  x + y
}

match (value) {
  Some(v) if v > 0 => "positive"
  None => "empty"
  ... => "fallback"
}

let mut count = 0
count = count + 1

let result = do {
  x <- step1();
  y <- step2(x);
  pure combine(x, y);
}
```

## 11. Summary

TypeLang is a typed, expression-oriented language with algebraic data types, pattern matching, monadic `do` syntax, first-class `where` scoping, and a recursive-descent parser that is structured to handle both control flow and strongly typed expressions. The parser and AST make the intended language feel closer to a modern functional language than to plain JavaScript or TypeScript, even though the project is implemented in TypeScript.
