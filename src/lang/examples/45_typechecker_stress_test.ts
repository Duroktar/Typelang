import { ExampleProgram } from "./types";

export const example45TypecheckerStressTest: ExampleProgram = {
  id: '45_typechecker_stress_test',
  name: '45. Typechecker Stress Test (Kitchen Sink)',
  category: 'Tests',
  description: 'A kitchen sink of type errors testing the resilience and diagnostic output of the TypeLang typechecker. Generates many intentional type errors.',
  expectsErrors: true,
  code: `// Example 45: Typechecker Stress Test (Kitchen Sink)
// This file is deliberately filled with various type errors to test the resilience
// of the type checker, error boundaries, and diagnostic reporting.

module KitchenSinkErrors {
  
  // 1. Unification Errors
  let a: number = "not a number";
  let b: string = 42;
  let c = a + b; // Operator mismatch
  
  // 2. Immutability Violations
  let immutableVar = 100;
  immutableVar = 200; // Error: Cannot reassign to non-mut variable
  
  // 3. Unknown Variables & Modules
  let unknownVar = thisDoesNotExist;
  let unknownMod = MissingModule.doSomething();
  
  // 4. Record Errors
  type User = { name: string, mut score: number };
  
  let validUser: User = { name: "Alice", score: 100 };
  let invalidUser: User = { name: "Bob" }; // Error: Missing 'score' field
  let extraFieldsUser: User = { name: "Charlie", score: 50, email: "c@example.com" }; // Usually okay structurally, but let's test strictness
  
  validUser.name = "Alicia"; // Error: 'name' is not a mut field
  validUser.score = "high"; // Error: Type mismatch on assignment
  let missingField = validUser.email; // Error: Field 'email' not found
  
  // 5. Array / Tuple Errors
  let tup: [number, string] = [1, 2]; // Error: Tuple element type mismatch
  
  // 6. Function Parameter Errors
  function add(x: number, y: number): number {
    return x + y;
  }
  
  let res1 = add(5); // Error: Not enough arguments
  let res2 = add(1, 2, 3); // Error: Too many arguments
  let res3 = add(1, "two"); // Error: Type mismatch on argument
  
  function requiresString(s: string): void { }
  requiresString(validUser); // Error: Record is not a string
  
  // 7. GADT & Pattern Matching Errors
  type Result<T, E> =
    | Ok(val: T): Result<T, E>
    | Err(err: E): Result<T, E>
    
  let resultOk: Result<number, string> = Result.Ok("this should be a number"); // Error: generic type mismatch
  
  let matchRes = match (resultOk) {
    Ok(val) => val + 1,
    Err(err) => err + 2, // Error: err is string, cannot add to number
    Unknown(x) => x // Error: Constructor 'Unknown' not found
  };
  
  let mismatchMatch = match("a string") {
    1 => "one", // Error: Pattern type does not match match target type
    _ => "other"
  };
  
  // 8. Method Call Errors
  validUser.nonExistentMethod(); // Error: Method not found
  
  // 9. Return Type Errors
  function badReturn(): string {
    return 100; // Error: Return type mismatch
  }
  
  // 10. Do-Notation / List Comprehension Errors
  let comp = [x + "string" for x in [1, 2, 3] if x > "0"]; // Error: Type mismatch in list comprehension
  
  let doBlock = do {
    x <- Result.Ok(5);
    y <- "not a monad"; // Error: Cannot bind on non-monad
    pure (x + y);
  };
  
}
`
};
