import { ExampleProgram } from "./types";

export const example46MonadicStdlibSuite: ExampleProgram = {
  id: 'monadic_stdlib_suite',
  name: '46. Standard Library: Monadic Modules (Option, Result, Either, Reader, Writer, State, Task)',
  category: 'Functional Programming',
  description: 'Full overview of TypeLang standard library monadic objects: Option, Result, Either, Reader, Writer, State, and Task with do-notation sequencing.',
  code: `// TypeLang Monadic Standard Library Showcase
// Demonstrating Option, Result, Either, Reader, Writer, State, and Task

import Option.{ Some, None, getOrElse, map, filter, fold }
import Result.{ Ok, Err, mapError, fromOption, toOption }
import Either.{ Left, Right, isRight, isLeft, swap }
import Reader.{ ask, asks, local }
import Writer.{ tell, listen }
import State.{ get, set, modify }
import Task.{ succeed, delay }

println("=== 1. Option Monad ===")
let userAge: Option<number> = Some(24)
let adultStatus = do(Option) {
  age <- userAge;
  validAge <- Option.filter(Some(age), (a: number) => a >= 18);
  pure concat("Verified Adult of age ", to_string(validAge));
}
println(Option.getOrElse(adultStatus, "Access Denied"))

println("\\n=== 2. Result Monad (Railway Oriented Programming) ===")
function parsePositiveNumber(str: string): Result<number, string> {
  let n = String.parseFloat(str)
  if (n > 0) {
    Ok(n)
  } else {
    Err(concat("Invalid positive number: ", str))
  }
}

let computeRatio = do(Result) {
  a <- parsePositiveNumber("150");
  b <- parsePositiveNumber("25");
  pure a / b;
}
match (computeRatio) {
  Ok(val) => println(concat("Ratio computation succeeded: ", to_string(val)))
  Err(err) => println(concat("Ratio computation failed: ", err))
}

println("\\n=== 3. Either Monad ===")
let eitherVal: Either<string, number> = Right(42)
let eitherTransformed = do(Either) {
  x <- eitherVal;
  y <- Right(x * 10);
  pure concat("Either final value: ", to_string(y));
}
println(Either.getOrElse(eitherTransformed, "Either error"))

println("\\n=== 4. Reader Monad (Dependency Injection & Environment) ===")
type AppConfig = { apiHost: string, port: number, verbose: boolean }

let requestHandler = do(Reader) {
  host <- Reader.asks((c: AppConfig) => c.apiHost);
  port <- Reader.asks((c: AppConfig) => c.port);
  pure concat("https://", concat(host, concat(":", to_string(port))))
}

let config: AppConfig = { apiHost: "api.typelang.dev", port: 443, verbose: true }
let fullUrl = Reader.run(requestHandler, config)
println(concat("Reader constructed API endpoint: ", fullUrl))

println("\\n=== 5. Writer Monad (Pure Monadic Logging) ===")
let calculateWithAudit = do(Writer) {
  _ <- Writer.tell("Started cryptographic keygen step 1");
  let secret = 1048576;
  _ <- Writer.tell("Generated master secret, proceeding to hashing");
  pure secret;
}
let writerRes = Writer.run(calculateWithAudit)
let auditLog = writerRes[1]
println(concat("Writer produced log lines count: ", to_string(Array.len(auditLog))))
println(concat("Audit entry 1: ", auditLog[0]))

println("\\n=== 6. State Monad (Pure Stateful Transformation) ===")
let statefulPipeline = do(State) {
  curr <- State.get();
  _ <- State.set(curr + 50);
  _ <- State.modify((s: number) => s * 2);
  finalState <- State.get();
  pure concat("State accumulator reached ", to_string(finalState));
}
let stateRes = State.run(statefulPipeline, 10)
println(concat("State output: ", stateRes[0]))
println(concat("Final state value: ", to_string(stateRes[1])))

println("\\n=== 7. Task Monad (Deferred / Lazy Execution) ===")
let lazyTask = do(Task) {
  x <- Task.succeed(500);
  y <- Task.delay(() => x + 250);
  pure y * 2;
}
let finalTaskVal = Task.run(lazyTask)
println(concat("Task lazily evaluated result: ", to_string(finalTaskVal)))
`
};
