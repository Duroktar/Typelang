// LLVM IR & Multi-Target Code Generator for TypeLang
import { Program } from './ast';
import { JSCodeGenerator, type JSCodeGenOptions } from './codegen_js';
import { LLVMIRGenerator } from './codegen_llvm';

export { JSCodeGenerator, LLVMIRGenerator };
export type { JSCodeGenOptions };

export class LLVMGenerator {
  public generateLLVM(program: Program): string {
    const llvmGen = new LLVMIRGenerator();
    return llvmGen.generate(program);
  }

  public generateJS(program: Program, options?: JSCodeGenOptions): string {
    const jsGen = new JSCodeGenerator();
    return jsGen.generate(program, options);
  }

  public generateNode(program: Program): string {
    const jsGen = new JSCodeGenerator();
    return jsGen.generate(program, { target: 'node', includePrelude: true });
  }
}
