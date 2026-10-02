import { ExampleProgram } from "./types";

export const example34AriadneDiagnosticsShowcase: ExampleProgram = {
  id: 'ariadne_diagnostics_showcase',
  name: '34. Ariadne Compiler Diagnostics & Error Showcase',
  category: 'Compiler Diagnostics',
  description: 'Demonstrates Rust-style Ariadne diagnostic reports with source code snippets, line gutters, error carets, and type error notes.',
  expectsErrors: true,
  code: `// Example 34: Ariadne Compiler Diagnostics & Error Showcase
// Designed to demonstrate Rust-style Ariadne rich error reporting with line gutters,
// source code snippets, error carets, and actionable compiler notes.

module DiagnosticShowcase {
  export function run() {
    // 1. Type Unification Error: Adding number and string directly
    let count = 42
    let text = " items"
    let invalidSum = count + text

    // 2. Immutability Violation: Attempting to mutate an immutable binding
    let baseRate = 100
    baseRate = 150

    // 3. Undefined Symbol: Invoking an undeclared function
    let total = computeScore(count)

    // 4. Pattern Matching Type Error: Matching a string against integer patterns
    let userRole = "admin"
    let accessLevel = match (userRole) {
      1 => "Level 1",
      2 => "Level 2",
      _ => "Guest"
    }

    println(concat("Done checking diagnostics: ", to_string(count)))
  }
}
`
};
