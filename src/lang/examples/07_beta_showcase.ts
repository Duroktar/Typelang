import { ExampleProgram } from "./types";

export const example07BetaShowcase: ExampleProgram = {
    id: 'beta_showcase',
    name: '7. Beta Showcase: Functional Stdlib Pipeline',
    category: 'Standard Library',
    description: 'Full functional pipeline combining Array, String, and Math standard library modules.',
    code: `import String.{ split, parseInt }
import Array.{ map, filter, reduce, len }
import Math.{ max, sqrt }

let rawData = "10, 25, 42, 7, 88, 100, 3"
let parts = split(rawData, ",")

let numbers = map(parts, fn(p) { parseInt(p) })
let bigNumbers = filter(numbers, fn(n) { n >= 20 })
let total = reduce(bigNumbers, 0, fn(acc, n) { acc + n })
let maxVal = reduce(numbers, 0, fn(acc, n) { max(acc, n) })
let sqrtMax = sqrt(maxVal)

println(concat("Parsed count: ", to_string(len(numbers))))
println(concat("Big numbers sum: ", to_string(total)))
println(concat("Max number in dataset: ", to_string(maxVal)))
println(concat("Square root of max: ", to_string(sqrtMax)))
`
  };
