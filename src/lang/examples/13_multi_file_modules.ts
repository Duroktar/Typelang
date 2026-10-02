import { ExampleProgram } from "./types";

export const example13MultiFileModules: ExampleProgram = {
    id: 'multi_file_modules',
    name: '13. Multi-File Modules & Exports',
    category: 'Advanced Modules',
    description: 'Demonstrating importing code from other files using exported modules and structured imports.',
    files: [
      {
        name: 'math_helpers.tl',
        content: `module MathHelpers {
  export function square(n: number): number {
    n * n
  }

  export function cube(n: number): number {
    n * n * n
  }

  export function isEven(n: number): boolean {
    n % 2 == 0
  }
}
`
      },
      {
        name: 'main.tl',
        content: `import MathHelpers.{ square, cube, isEven }

let val = 8
println(concat("Target Number: ", to_string(val)))
println(concat("Square: ", to_string(square(val))))
println(concat("Cube:   ", to_string(cube(val))))

if (isEven(val)) {
  println("The number is even!")
} else {
  println("The number is odd!")
}

let result = square(cube(2)) // 2^3 = 8, 8^2 = 64
println(concat("square(cube(2)) = ", to_string(result)))
`
      }
    ],
    code: `module MathHelpers {
  export function square(n: number): number {
    n * n
  }

  export function cube(n: number): number {
    n * n * n
  }

  export function isEven(n: number): boolean {
    n % 2 == 0
  }
}

import MathHelpers.{ square, cube, isEven }

let val = 8
println(concat("Target Number: ", to_string(val)))
println(concat("Square: ", to_string(square(val))))
println(concat("Cube:   ", to_string(cube(val))))

if (isEven(val)) {
  println("The number is even!")
} else {
  println("The number is odd!")
}

let result = square(cube(2)) // 2^3 = 8, 8^2 = 64
println(concat("square(cube(2)) = ", to_string(result)))
`
  };
