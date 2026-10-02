import { Lexer } from '../src/lang/lexer';
import { Parser } from '../src/lang/parser';
import { LLVMIRGenerator } from '../src/lang/codegen_llvm';
import { EXAMPLES } from '../src/lang/examples';

console.log('🔍 Validating LLVM IR Code Generation for all TypeLang Examples...\n');

let passCount = 0;
const llvmGen = new LLVMIRGenerator();

for (const example of EXAMPLES) {
  try {
    const lexer = new Lexer(example.code || '');
    const parser = new Parser(lexer.tokenize());
    const ast = parser.parseProgram();

    const llvmIR = llvmGen.generate(ast);

    // Validate all constant byte arrays: [N x i8] c"..."
    const constantRegex = /@\S+\s*=\s*(?:private\s+unnamed_addr\s+constant|constant)\s+\[(\d+)\s+x\s+i8\]\s+c"([^"]*)"/g;
    let match;
    let errors: string[] = [];

    while ((match = constantRegex.exec(llvmIR)) !== null) {
      const declaredLen = parseInt(match[1], 10);
      const strContent = match[2];

      // Calculate actual bytes in LLVM escaped string
      // e.g. \0A is 1 byte, \00 is 1 byte, \\ is 1 byte, normal char is 1 byte
      let actualBytes = 0;
      let i = 0;
      while (i < strContent.length) {
        if (strContent[i] === '\\' && i + 2 < strContent.length && /^[0-9A-Fa-f]{2}$/.test(strContent.slice(i + 1, i + 3))) {
          actualBytes += 1;
          i += 3;
        } else if (strContent[i] === '\\' && i + 1 < strContent.length) {
          actualBytes += 1;
          i += 2;
        } else {
          // UTF-8 bytes of this character
          actualBytes += Buffer.from(strContent[i], 'utf8').length;
          i += 1;
        }
      }

      if (declaredLen !== actualBytes) {
        errors.push(`Constant size mismatch: declared [${declaredLen} x i8] but string has ${actualBytes} bytes (str: "${strContent}")`);
      }
    }

    if (errors.length > 0) {
      console.error(`❌ Example "${example.name}" has LLVM IR constant errors:`);
      errors.forEach(e => console.error(`   ${e}`));
      process.exit(1);
    }

    passCount++;
    console.log(`✅ Example ${example.id} (${example.name}): Valid LLVM IR generated (${llvmIR.split('\n').length} lines).`);
  } catch (err: any) {
    console.error(`❌ Example "${example.name}" failed LLVM generation:`, err.message);
    process.exit(1);
  }
}

console.log(`\n🎉 All ${passCount} examples passed LLVM IR generation & constant validation!`);
