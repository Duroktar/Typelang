import { ExampleProgram } from "./types";

export const example03HigherRank: ExampleProgram = {
    id: 'higher_rank',
    name: '3. Higher-Rank Polymorphism',
    category: 'Type System',
    description: 'Functions taking universally quantified polymorphic arguments.',
    code: `// Parameter f is a polymorphic function <a>(x: a) => a
function applyPolymorphic(f: <a>(x: a) => a): [number, string] {
  let numVal = f(100)
  let strVal = f("Polymorphic Higher Rank")
  [numVal, strVal]
}

function identity<a>(x: a): a {
  x
}

let res = applyPolymorphic(identity)
println(concat("Number result: ", to_string(res[0])))
println(concat("String result: ", res[1]))
`
  };
