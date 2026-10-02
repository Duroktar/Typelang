import { ExampleProgram } from "./types";

export const example04RecordsMethods: ExampleProgram = {
    id: 'records_methods',
    name: '4. Structural Records & Methods',
    category: 'Records & State',
    description: 'Structural record types with mutable fields, methods, and immutable updates.',
    code: `let counter = {
  mut count: 0,
  inc(self): void {
    self.count = self.count + 1
  },
  value(self): number {
    self.count
  }
}

counter.inc()
counter.inc()
counter.inc()
println(concat("Counter value after 3 increments: ", to_string(counter.value())))

// Immutable record spread/update
let person = { name: "Alice", age: 30 }
let updatedPerson = { ...person, age: 31 }

println(concat("Updated Person: ", updatedPerson.name))
println(concat("Age: ", to_string(updatedPerson.age)))
`
  };
