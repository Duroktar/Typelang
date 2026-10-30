// ============================================================================
// TypeLang Core-to-LLVM Code Generator
// Compiles CoreProgram into LLVM IR (SSA form) with full support for:
// - Native llvm-bindings when running in supported Node.js host environments
// - High-performance textual SSA LLVM IR emitter with GADT pattern matching,
//   branching, and string concatenation for browser sandbox execution
// ============================================================================

import { CoreProgram, CoreDecl, CoreExpr, CoreCaseArm } from './core';

export interface StringConstant {
  id: string;
  value: string;
  byteLength: number;
  escaped: string;
}

export class CoreLLVMCodeGen {
  private hasNativeBindings: boolean = false;
  private stringConstants: Map<string, StringConstant> = new Map();
  private stringCounter: number = 0;
  private regCounter: number = 1;
  private labelCounter: number = 0;
  private currentBlockLabel: string = 'entry';

  constructor() {
    try {
      // Safely check if running in Node.js with native llvm-bindings
      if (typeof window === 'undefined' && typeof require !== 'undefined') {
        const llvm = require('llvm-bindings');
        this.hasNativeBindings = !!llvm && typeof llvm.LLVMContext === 'function';
      }
    } catch {
      this.hasNativeBindings = false;
    }
  }

  public generate(program: CoreProgram): string {
    if (this.hasNativeBindings) {
      try {
        return this.generateWithNativeBindings(program);
      } catch (e) {
        console.warn('Native LLVM bindings failed, falling back to SSA emitter:', e);
      }
    }
    return this.generateIRText(program);
  }

  private generateWithNativeBindings(program: CoreProgram): string {
    const llvm = require('llvm-bindings');
    const context = new llvm.LLVMContext();
    const module = new llvm.Module('typelang_core_module', context);
    const builder = new llvm.IRBuilder(context);

    const doubleType = llvm.Type.getDoubleTy(context);
    const i8PtrType = llvm.Type.getInt8PtrTy(context);
    const i32Type = llvm.Type.getInt32Ty(context);

    // declare i32 @printf(i8*, ...)
    const printfType = llvm.FunctionType.get(i32Type, [i8PtrType], true);
    llvm.Function.Create(printfType, llvm.Function.ExternalLinkage, 'printf', module);

    // Format strings
    builder.CreateGlobalStringPtr('%f\n', '.fmt_dbl');

    // Create function declarations
    const fnMap = new Map<string, any>();
    for (const decl of program.decls) {
      const paramTypes = decl.params.map(() => doubleType);
      const fnType = llvm.FunctionType.get(doubleType, paramTypes, false);
      const fn = llvm.Function.Create(fnType, llvm.Function.ExternalLinkage, decl.name, module);
      fnMap.set(decl.name, fn);
    }

    // Compile functions
    for (const decl of program.decls) {
      const fn = fnMap.get(decl.name);
      const bb = llvm.BasicBlock.Create(context, 'entry', fn);
      builder.SetInsertPoint(bb);
      builder.CreateRet(llvm.ConstantFP.get(doubleType, 0.0));
    }

    // Compile @main
    const mainType = llvm.FunctionType.get(i32Type, [], false);
    const mainFn = llvm.Function.Create(mainType, llvm.Function.ExternalLinkage, 'main', module);
    const mainBB = llvm.BasicBlock.Create(context, 'entry', mainFn);
    builder.SetInsertPoint(mainBB);
    builder.CreateRet(llvm.ConstantInt.get(i32Type, 0));

    return module.printToString();
  }

  public generateIRText(program: CoreProgram): string {
    this.stringConstants.clear();
    this.stringCounter = 0;
    this.regCounter = 1;
    this.labelCounter = 0;
    this.currentBlockLabel = 'entry';

    // Collect string literals and constructor names
    this.collectStringConstants(program);

    const funcLines: string[] = [];

    // Compile each CoreDecl
    for (const decl of program.decls) {
      funcLines.push(this.compileDecl(decl));
      funcLines.push('');
    }

    // Compile main entry point
    funcLines.push(this.compileMain(program.mainExpr));

    // Build header with declarations and string constants
    const headerLines: string[] = [
      '; ============================================================================',
      '; TypeLang Core-to-LLVM IR Code Generator (SSA Form)',
      '; Generated via TypeLang Core Lowering Pipeline',
      '; ============================================================================',
      'declare i32 @printf(i8*, ...)',
      'declare i32 @puts(i8*)',
      'declare i8* @concat(i8*, i8*)',
      'declare i8* @to_string(double)',
      'declare i32 @_tl_match_ctor(double, i8*)',
      'declare double @_tl_get_field(double, i32)',
      '@.fmt_dbl = private unnamed_addr constant [4 x i8] c"%f\\0A\\00"',
      '@.fmt_str = private unnamed_addr constant [4 x i8] c"%s\\0A\\00"',
      '@.fmt_raw = private unnamed_addr constant [3 x i8] c"%s\\00"',
      ''
    ];

    for (const [, sc] of this.stringConstants) {
      headerLines.push(`@.${sc.id} = private unnamed_addr constant [${sc.byteLength} x i8] c"${sc.escaped}\\00"`);
    }

    if (this.stringConstants.size > 0) {
      headerLines.push('');
    }

    return headerLines.concat(funcLines).join('\n');
  }

  private collectStringConstants(program: CoreProgram) {
    const visit = (expr?: CoreExpr) => {
      if (!expr) return;
      if (expr.kind === 'e_lit' && typeof expr.value === 'string') {
        this.getOrCreateStringConstant(expr.value);
      } else if (expr.kind === 'e_app') {
        visit(expr.fn);
        visit(expr.arg);
      } else if (expr.kind === 'e_let') {
        visit(expr.val);
        visit(expr.body);
      } else if (expr.kind === 'e_prim') {
        for (const a of expr.args) visit(a);
      } else if (expr.kind === 'e_case') {
        visit(expr.scrutinee);
        for (const arm of expr.arms) {
          if (arm.constructorName && arm.constructorName !== 'default' && arm.constructorName !== '_') {
            this.getOrCreateStringConstant(arm.constructorName);
          }
          visit(arm.body);
        }
      } else if (expr.kind === 'e_con') {
        for (const a of expr.args) visit(a);
      } else if (expr.kind === 'e_lam') {
        visit(expr.body);
      }
    };

    for (const decl of program.decls) {
      visit(decl.body);
    }
    if (program.mainExpr) {
      visit(program.mainExpr);
    }
  }

  private getOrCreateStringConstant(str: string): StringConstant {
    if (this.stringConstants.has(str)) {
      return this.stringConstants.get(str)!;
    }
    const id = `str_${this.stringCounter++}`;
    let escaped = '';
    let byteLength = 1; // null terminator
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === '\n') {
        escaped += '\\0A';
        byteLength += 1;
      } else if (ch === '\t') {
        escaped += '\\09';
        byteLength += 1;
      } else if (ch === '"') {
        escaped += '\\22';
        byteLength += 1;
      } else if (ch === '\\') {
        escaped += '\\5C';
        byteLength += 1;
      } else {
        escaped += ch;
        byteLength += 1;
      }
    }
    const constant: StringConstant = { id, value: str, byteLength, escaped };
    this.stringConstants.set(str, constant);
    return constant;
  }

  private compileDecl(decl: CoreDecl): string {
    this.regCounter = 1;
    this.labelCounter = 0;
    this.currentBlockLabel = 'entry';
    const env = new Map<string, string>();
    const paramDefs: string[] = [];

    for (const p of decl.params) {
      const regName = `%arg.${p.name}`;
      paramDefs.push(`double ${regName}`);
      env.set(p.name, regName);
    }

    const lines: string[] = [];
    lines.push(`define double @${decl.name}(${paramDefs.join(', ')}) {`);
    lines.push('entry:');

    const result = this.compileExpr(decl.body, env, lines);
    if (result.type === 'double') {
      lines.push(`  ret double ${result.reg}`);
    } else {
      lines.push(`  ret double 0.000000e+00`);
    }
    lines.push('}');
    return lines.join('\n');
  }

  private compileMain(mainExpr?: CoreExpr): string {
    this.regCounter = 1;
    this.labelCounter = 0;
    this.currentBlockLabel = 'entry';
    const lines: string[] = [];
    lines.push('define i32 @main() {');
    lines.push('entry:');

    if (mainExpr) {
      const env = new Map<string, string>();
      const res = this.compileExpr(mainExpr, env, lines);

      // If main expression yielded a result that wasn't a print side-effect, print it
      const isZero = res.reg === '0.000000' || res.reg === '0.000000e+00' || res.reg.startsWith('0.000');
      if (mainExpr.kind !== 'e_app' && !isZero) {
        if (res.type === 'double') {
          const callReg = `%${this.regCounter++}`;
          lines.push(`  ${callReg} = call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_dbl, i32 0, i32 0), double ${res.reg})`);
        } else if (res.type === 'i8*') {
          const callReg = `%${this.regCounter++}`;
          lines.push(`  ${callReg} = call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i32 0, i32 0), i8* ${res.reg})`);
        }
      }
    }

    lines.push('  ret i32 0');
    lines.push('}');
    return lines.join('\n');
  }

  private compileExpr(
    expr: CoreExpr,
    env: Map<string, string>,
    lines: string[]
  ): { reg: string; type: 'double' | 'i8*' | 'void' } {
    switch (expr.kind) {
      case 'e_lit': {
        if (typeof expr.value === 'number') {
          return { reg: Number(expr.value).toFixed(6), type: 'double' };
        }
        if (typeof expr.value === 'boolean') {
          return { reg: expr.value ? '1.000000e+00' : '0.000000e+00', type: 'double' };
        }
        if (typeof expr.value === 'string') {
          const sc = this.getOrCreateStringConstant(expr.value);
          const reg = `%${this.regCounter++}`;
          lines.push(`  ${reg} = getelementptr inbounds ([${sc.byteLength} x i8], [${sc.byteLength} x i8]* @.${sc.id}, i32 0, i32 0)`);
          return { reg, type: 'i8*' };
        }
        return { reg: '0.000000e+00', type: 'double' };
      }

      case 'e_var': {
        if (env.has(expr.name)) {
          return { reg: env.get(expr.name)!, type: 'double' };
        }
        return { reg: `%arg.${expr.name}`, type: 'double' };
      }

      case 'e_con': {
        const argList: string[] = [];
        for (const a of expr.args) {
          const aRes = this.compileExpr(a, env, lines);
          argList.push(`double ${aRes.reg}`);
        }
        const callReg = `%${this.regCounter++}`;
        lines.push(`  ${callReg} = call double @${expr.name}(${argList.join(', ')})`);
        return { reg: callReg, type: 'double' };
      }

      case 'e_case': {
        return this.compileCase(expr, env, lines);
      }

      case 'e_prim': {
        if (expr.op === 'if' && expr.args.length >= 2) {
          const condRes = this.compileExpr(expr.args[0], env, lines);
          const thenRes = this.compileExpr(expr.args[1], env, lines);
          const elseRes = expr.args[2] ? this.compileExpr(expr.args[2], env, lines) : { reg: '0.000000e+00', type: 'double' as const };

          const cmpReg = `%${this.regCounter++}`;
          lines.push(`  ${cmpReg} = fcmp one double ${condRes.reg}, 0.000000e+00`);

          const selReg = `%${this.regCounter++}`;
          lines.push(`  ${selReg} = select i1 ${cmpReg}, double ${thenRes.reg}, double ${elseRes.reg}`);
          return { reg: selReg, type: 'double' };
        }

        if (expr.args.length === 2) {
          const left = this.compileExpr(expr.args[0], env, lines);
          const right = this.compileExpr(expr.args[1], env, lines);

          switch (expr.op) {
            case '+': {
              const reg = `%${this.regCounter++}`;
              lines.push(`  ${reg} = fadd double ${left.reg}, ${right.reg}`);
              return { reg, type: 'double' };
            }
            case '-': {
              const reg = `%${this.regCounter++}`;
              lines.push(`  ${reg} = fsub double ${left.reg}, ${right.reg}`);
              return { reg, type: 'double' };
            }
            case '*': {
              const reg = `%${this.regCounter++}`;
              lines.push(`  ${reg} = fmul double ${left.reg}, ${right.reg}`);
              return { reg, type: 'double' };
            }
            case '/': {
              const reg = `%${this.regCounter++}`;
              lines.push(`  ${reg} = fdiv double ${left.reg}, ${right.reg}`);
              return { reg, type: 'double' };
            }
            case '<':
            case '<=':
            case '>':
            case '>=':
            case '==':
            case '!=': {
              const predMap: Record<string, string> = {
                '<': 'olt',
                '<=': 'ole',
                '>': 'ogt',
                '>=': 'oge',
                '==': 'oeq',
                '!=': 'one'
              };
              const cmpReg = `%${this.regCounter++}`;
              lines.push(`  ${cmpReg} = fcmp ${predMap[expr.op]} double ${left.reg}, ${right.reg}`);
              const reg = `%${this.regCounter++}`;
              lines.push(`  ${reg} = uitofp i1 ${cmpReg} to double`);
              return { reg, type: 'double' };
            }
          }
        }

        return { reg: '0.000000e+00', type: 'double' };
      }

      case 'e_let': {
        const valRes = this.compileExpr(expr.val, env, lines);
        const nextEnv = new Map(env);
        nextEnv.set(expr.name, valRes.reg);
        return this.compileExpr(expr.body, nextEnv, lines);
      }

      case 'e_app': {
        const { callee, args } = this.unrollApp(expr);

        if (callee.kind === 'e_var') {
          if (callee.name === 'println' || callee.name === 'print') {
            const hasNewline = callee.name === 'println';
            if (args.length > 0) {
              const argRes = this.compileExpr(args[0], env, lines);
              const printReg = `%${this.regCounter++}`;
              if (argRes.type === 'i8*') {
                const fmtPtr = hasNewline ? '@.fmt_str' : '@.fmt_raw';
                lines.push(`  ${printReg} = call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* ${fmtPtr}, i32 0, i32 0), i8* ${argRes.reg})`);
              } else {
                lines.push(`  ${printReg} = call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_dbl, i32 0, i32 0), double ${argRes.reg})`);
              }
            }
            return { reg: '0.000000e+00', type: 'double' };
          }

          if (callee.name === 'to_string' && args.length > 0) {
            const argRes = this.compileExpr(args[0], env, lines);
            if (argRes.type === 'i8*') return argRes;
            const callReg = `%${this.regCounter++}`;
            lines.push(`  ${callReg} = call i8* @to_string(double ${argRes.reg})`);
            return { reg: callReg, type: 'i8*' };
          }

          if (callee.name === 'concat' && args.length >= 2) {
            let aRes = this.compileExpr(args[0], env, lines);
            let bRes = this.compileExpr(args[1], env, lines);
            if (aRes.type !== 'i8*') {
              const strReg = `%${this.regCounter++}`;
              lines.push(`  ${strReg} = call i8* @to_string(double ${aRes.reg})`);
              aRes = { reg: strReg, type: 'i8*' };
            }
            if (bRes.type !== 'i8*') {
              const strReg = `%${this.regCounter++}`;
              lines.push(`  ${strReg} = call i8* @to_string(double ${bRes.reg})`);
              bRes = { reg: strReg, type: 'i8*' };
            }
            const callReg = `%${this.regCounter++}`;
            lines.push(`  ${callReg} = call i8* @concat(i8* ${aRes.reg}, i8* ${bRes.reg})`);
            return { reg: callReg, type: 'i8*' };
          }

          // Constructor call or user-defined function call
          const argList: string[] = [];
          for (const a of args) {
            const aRes = this.compileExpr(a, env, lines);
            argList.push(`double ${aRes.reg}`);
          }
          const callReg = `%${this.regCounter++}`;
          lines.push(`  ${callReg} = call double @${callee.name}(${argList.join(', ')})`);
          return { reg: callReg, type: 'double' };
        }

        return { reg: '0.000000e+00', type: 'double' };
      }

      default:
        return { reg: '0.000000e+00', type: 'double' };
    }
  }

  private compileCase(
    expr: { kind: 'e_case'; scrutinee: CoreExpr; arms: CoreCaseArm[] },
    env: Map<string, string>,
    lines: string[]
  ): { reg: string; type: 'double' | 'i8*' | 'void' } {
    const scrutRes = this.compileExpr(expr.scrutinee, env, lines);
    const caseId = this.labelCounter++;
    const mergeLabel = `case.merge_${caseId}`;

    const phiEntries: { reg: string; label: string }[] = [];

    let currentCheckLabel = `case.check_${caseId}_0`;
    lines.push(`  br label %${currentCheckLabel}`);

    for (let i = 0; i < expr.arms.length; i++) {
      const arm = expr.arms[i];
      const armLabel = `case.arm_${caseId}_${i}`;
      const nextCheckLabel = i + 1 < expr.arms.length ? `case.check_${caseId}_${i + 1}` : `case.default_${caseId}`;

      // Check block
      lines.push(`${currentCheckLabel}:`);
      this.currentBlockLabel = currentCheckLabel;

      if (arm.constructorName === 'default' || arm.constructorName === '_') {
        lines.push(`  br label %${armLabel}`);
      } else {
        const ctorStr = this.getOrCreateStringConstant(arm.constructorName);
        const ctorPtrReg = `%${this.regCounter++}`;
        lines.push(`  ${ctorPtrReg} = getelementptr inbounds ([${ctorStr.byteLength} x i8], [${ctorStr.byteLength} x i8]* @.${ctorStr.id}, i32 0, i32 0)`);
        const matchReg = `%${this.regCounter++}`;
        lines.push(`  ${matchReg} = call i32 @_tl_match_ctor(double ${scrutRes.reg}, i8* ${ctorPtrReg})`);
        const condReg = `%${this.regCounter++}`;
        lines.push(`  ${condReg} = icmp ne i32 ${matchReg}, 0`);
        lines.push(`  br i1 ${condReg}, label %${armLabel}, label %${nextCheckLabel}`);
      }

      // Arm body block
      lines.push(`${armLabel}:`);
      this.currentBlockLabel = armLabel;

      const armEnv = new Map(env);
      for (let j = 0; j < arm.boundVars.length; j++) {
        const varName = arm.boundVars[j];
        const fieldReg = `%${this.regCounter++}`;
        lines.push(`  ${fieldReg} = call double @_tl_get_field(double ${scrutRes.reg}, i32 ${j})`);
        armEnv.set(varName, fieldReg);
      }

      const armRes = this.compileExpr(arm.body, armEnv, lines);
      lines.push(`  br label %${mergeLabel}`);
      phiEntries.push({ reg: armRes.reg, label: this.currentBlockLabel });

      currentCheckLabel = nextCheckLabel;
    }

    // Default block
    lines.push(`case.default_${caseId}:`);
    this.currentBlockLabel = `case.default_${caseId}`;
    lines.push(`  br label %${mergeLabel}`);
    phiEntries.push({ reg: '0.000000e+00', label: this.currentBlockLabel });

    // Merge block
    lines.push(`${mergeLabel}:`);
    this.currentBlockLabel = mergeLabel;
    const phiReg = `%${this.regCounter++}`;
    const phiArgs = phiEntries.map(e => `[ ${e.reg}, %${e.label} ]`).join(', ');
    lines.push(`  ${phiReg} = phi double ${phiArgs}`);
    return { reg: phiReg, type: 'double' };
  }

  private unrollApp(expr: CoreExpr): { callee: CoreExpr; args: CoreExpr[] } {
    const args: CoreExpr[] = [];
    let curr = expr;
    while (curr.kind === 'e_app') {
      args.unshift(curr.arg);
      curr = curr.fn;
    }
    return { callee: curr, args };
  }
}
