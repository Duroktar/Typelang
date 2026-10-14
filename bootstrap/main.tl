// ============================================================================
// TypeLang Self-Hosted Compiler: Driver & CLI Module
// ============================================================================

function compile_source(sourceCode: string): string {
  // Stage 1: Lexical Analysis
  let tokens = tokenize(sourceCode);
  println(concat("Scanned Token Count: ", to_string(Array.len(tokens))));

  // Stage 2: Syntactic Parsing
  let parseResult = parse(tokens);
  println(concat("Parsed Statement Count: ", to_string(Array.len(parseResult.stmts))));
  if (Array.len(parseResult.errors) > 0.0) {
    println("❌ Parsing Errors Encountered:");
    let mut errIdx = 0.0;
    let errCount = Array.len(parseResult.errors);
    while (errIdx < errCount) {
      println(concat("  - ", parseResult.errors[errIdx]));
      errIdx += 1.0;
    }
    return "";
  }

  // Stage 3: Semantic Analysis & Type Checking
  let checkResult = check_semantics(parseResult.stmts);
  if (!checkResult.isValid) {
    println("❌ Semantic Errors Encountered:");
    let mut errIdx = 0.0;
    let errCount = Array.len(checkResult.errors);
    while (errIdx < errCount) {
      println(concat("  - ", checkResult.errors[errIdx]));
      errIdx += 1.0;
    }
    return "";
  }

  // Stage 4: C11 / C99 Code Generation
  let cSource = emit_program(parseResult.stmts);
  cSource
}

function run_compiler_cli(): void {
  let cliInput = get_cli_arg(1.0);
  if (cliInput != "") {
    let sourceText = read_file(cliInput);
    if (sourceText != "") {
      let emittedC = compile_source(sourceText);
      let cliOutput = get_cli_arg(2.0);
      if (cliOutput != "") {
        write_file(cliOutput, emittedC);
        println(concat("✓ Successfully compiled to ", cliOutput));
      } else {
        println(emittedC);
      }
    } else {
      println(concat("❌ Error reading input file: ", cliInput));
    }
  } else {
    println("🚀 TypeLang Self-Hosted C11 / C99 Native Compiler Initialized");
    let sampleProgram = "println(\"Hello from TypeLang Compiled C11!\");\nlet x = 10.0 + 32.0;\nprintln(concat(\"Computed value: \", to_string(x)));\n";
    let compiledOutput = compile_source(sampleProgram);
    println("✓ Emitted C11 Code Preview:");
    println(compiledOutput);
  }
}

run_compiler_cli();
