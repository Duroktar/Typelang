import { ExampleProgram } from "./types";

export const example06PatternMatching: ExampleProgram = {
    id: 'pattern_matching',
    name: '6. Pattern Matching & Guards',
    category: 'Pattern Matching',
    description: 'Exhaustive pattern matching with guards, as-bindings, and rest fallback.',
    code: `type Shape =
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
println(describeShape(Circle(3.0)))
println(describeShape(Rectangle(10.0, 10.0)))
`
  };
