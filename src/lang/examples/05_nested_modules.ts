import { ExampleProgram } from "./types";

export const example05NestedModules: ExampleProgram = {
    id: 'nested_modules',
    name: '5. Nested Modules & Imports',
    category: 'Modules',
    description: 'Modular code organization with nested modules and imports.',
    code: `module Data {
  module List {
    export type List<a> =
      | Nil: List<a>
      | Cons(head: a, tail: List<a>): List<a>

    export function length<a>(l: List<a>): number {
      match (l) {
        Nil        => 0
        Cons(h, t) => 1 + length(t)
      }
    }
  }
}

import Data.List.{ List, Nil, Cons, length }

let list = Cons(10, Cons(20, Cons(30, Nil)))
println(concat("List length: ", to_string(length(list))))
`
  };
