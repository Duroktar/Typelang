import { ExampleProgram } from "./types";

export const example01GadtEval: ExampleProgram = {
    id: 'gadt_eval',
    name: '1. GADT Expression Evaluator',
    category: 'GADTs & Refinement',
    description: 'Type-safe expression evaluator using GADTs and type refinement in match arms.',
    code: `module ExprModule {
  export type Expr<a> =
    | Lit(value: number): Expr<number>
    | Bool(value: boolean): Expr<boolean>
    | Add(left: Expr<number>, right: Expr<number>): Expr<number>
    | If(cond: Expr<boolean>, then: Expr<a>, else: Expr<a>): Expr<a>

  export function eval<a>(e: Expr<a>): a {
    match (e) {
      Lit(v)      => v
      Bool(b)     => b
      Add(l, r)   => eval(l) + eval(r)
      If(c, t, f) => eval(c) ? eval(t) : eval(f)
    }
  }
}

import ExprModule.{ Expr, eval }

// Constructing GADT expressions
let e1 = ExprModule.Add(ExprModule.Lit(21), ExprModule.Lit(21))
let result1 = eval(e1)
println(concat("21 + 21 = ", to_string(result1)))

let e2 = ExprModule.If(
  ExprModule.Bool(true),
  ExprModule.Lit(100),
  ExprModule.Lit(0)
)
let result2 = eval(e2)
println(concat("If true then 100 else 0 = ", to_string(result2)))
`
  };
