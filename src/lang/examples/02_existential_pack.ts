import { ExampleProgram } from "./types";

export const example02ExistentialPack: ExampleProgram = {
    id: 'existential_pack',
    name: '2. Existential Packed Types',
    category: 'Existentials',
    description: 'Packed existential types with custom show functions.',
    code: `type Packed =
  | Pack<a>(value: a, show: (x: a) => string): Packed

function showPacked(p: Packed): string {
  match (p) {
    Pack(value, show) => show(value)
  }
}

let p1 = Pack(42, (n: number) => concat("Packed Number: ", to_string(n)))
let p2 = Pack("TypeLang v0.1", (s: string) => concat("Packed String: ", s))

println(showPacked(p1))
println(showPacked(p2))
`
  };
