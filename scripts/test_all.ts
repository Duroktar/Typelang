import { runCompilerTestSuite } from '../src/lang/tests';
import { runLLVMUnitTests } from '../src/lang/tests_llvm';
import { EXAMPLES } from '../src/lang/examples';
import { Lexer } from '../src/lang/lexer';
import { Parser } from '../src/lang/parser';
import { TypeChecker } from '../src/lang/checker';
import { LLVMIRGenerator } from '../src/lang/codegen_llvm';

console.log("Running Core Compiler Tests...");
const res = runCompilerTestSuite();
const failed = res.filter(r => !r.passed);
if (failed.length > 0) {
  console.log(`❌ ${failed.length} compiler tests failed:`);
  failed.forEach(f => {
    console.log(`  - [${f.test.id}] ${f.test.name}: ${f.errorMessage}`);
  });
  process.exit(1);
} else {
  console.log(`✅ All ${res.length} compiler tests passed.`);
}

console.log("\nRunning Granular LLVM IR TDD Tests (Stage 1 & 2)...");
const llvmUnitRes = runLLVMUnitTests();
if (llvmUnitRes.failed > 0) {
  console.log(`❌ ${llvmUnitRes.failed} LLVM unit tests failed:`);
  llvmUnitRes.errors.forEach(err => console.log(`  - ${err}`));
  process.exit(1);
} else {
  console.log(`✅ All ${llvmUnitRes.passed} LLVM unit tests passed.`);
}

console.log("\nRunning Example Type Checking...");
let allPassed = true;
EXAMPLES.forEach((ex, i) => {
  try {
    const sourceCode = ex.files && ex.files.length > 0 
      ? ex.files.map(f => `// File: ${f.name}\n${f.content}`).join('\n\n')
      : (ex.code || '');
      
    const lexer = new Lexer(sourceCode);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    try {
      const ast = parser.parseProgram();
      const checker = new TypeChecker();
      checker.checkProgram(ast);
      if (ex.expectsErrors) {
        if (checker.diagnostics.length > 0) {
          console.log(`✅ Example ${i + 1} (${ex.name}) verified expected compiler diagnostic output (${checker.diagnostics.length} diagnostics generated).`);
        } else {
          console.log(`❌ Example ${i + 1} (${ex.name}) expected type errors but none were reported.`);
          allPassed = false;
        }
      } else {
        if (checker.diagnostics.length > 0) {
          console.log(`❌ Example ${i + 1} (${ex.name}) has type errors:`);
          checker.diagnostics.forEach(d => console.log(`  - Line ${d.line}: ${d.message}`));
          allPassed = false;
        } else {
          console.log(`✅ Example ${i + 1} (${ex.name}) parsed and checked successfully.`);
        }
      }
    } catch (e: any) {
      const curTok = tokens[(parser as any).pos];
      console.log(`❌ Example ${i + 1} (${ex.name}) failed to parse:`, e.message, curTok ? `at line ${curTok.loc.line}, col ${curTok.loc.col}, token '${curTok.value}'` : '');
      allPassed = false;
    }
  } catch (e: any) {
    console.log(`❌ Example ${i + 1} (${ex.name}) error:`, e.message);
    allPassed = false;
  }
});

console.log("\nRunning LLVM IR Generation & Execution Validation...");
const llvmGen = new LLVMIRGenerator();
import { LLVMInterpreter } from '../src/lang/llvm_interpreter';
const interpreter = new LLVMInterpreter();

EXAMPLES.filter(ex => !ex.expectsErrors).forEach((ex, i) => {
  try {
    const sourceCode = ex.files && ex.files.length > 0 
      ? ex.files.map(f => `// File: ${f.name}\n${f.content}`).join('\n\n')
      : (ex.code || '');
    const lexer = new Lexer(sourceCode);
    const ast = new Parser(lexer.tokenize()).parseProgram();
    const llvmIR = llvmGen.generate(ast);
    if (!llvmIR || llvmIR.length === 0) {
      console.log(`❌ Example ${i + 1} (${ex.name}) generated empty LLVM IR`);
      allPassed = false;
    } else {
      const execResult = interpreter.execute(llvmIR);
      if (execResult.error) {
        console.log(`❌ Example ${i + 1} (${ex.name}) LLVM execution error:`, execResult.error);
        allPassed = false;
      } else {
        console.log(`✅ Example ${i + 1} (${ex.name}) LLVM IR executed cleanly (exit code ${execResult.exitCode})`);
      }
    }
  } catch (e: any) {
    console.log(`❌ Example ${i + 1} (${ex.name}) LLVM codegen/exec error:`, e.message);
    allPassed = false;
  }
});
if (allPassed) {
  console.log("✅ All examples generated valid LLVM SSA IR successfully!");
}

if (allPassed) {
  console.log("\n✅ All compiler, type-check, and LLVM codegen tests passed!");
  process.exit(0);
} else {
  console.log("\n❌ Some tests failed.");
  process.exit(1);
}

