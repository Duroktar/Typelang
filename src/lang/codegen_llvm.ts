// Advanced LLVM IR SSA Code Generator for TypeLang
import {
  Program,
  Statement,
  Expr,
  Pattern,
  MatchArm,
  GADTDecl,
  SFunction,
  TypeAST,
  ELambda
} from './ast';

export interface LLVMValue {
  type: string;
  name: string; // register, pointer, or constant (e.g. "%t1", "42.0", "@.str.0", "null")
}

export interface FunctionSignature {
  paramTypes: string[];
  retType: string;
}

export interface FunctionInfo {
  symbol: string;
  sig: FunctionSignature;
}

interface Block {
  name: string;
  instructions: string[];
  terminated: boolean;
}

export class LLVMIRGenerator {
  private tempRegCounter = 0;
  private blockCounter = 0;
  private lambdaCounter = 0;
  private stringPool: Map<string, string> = new Map();
  private stringDecls: string[] = [];

  private blocks: Block[] = [];
  private currentBlock: Block | null = null;
  private entryAllocas: string[] = [];

  private varAllocaMap: Map<string, { type: string; reg: string }> = new Map();
  private gadtConstructorTags: Map<string, { tag: number; typeName: string; arity: number }> = new Map();
  private gadtTypeNames: Set<string> = new Set();
  private functionDefinitions: Map<string, FunctionInfo> = new Map();
  private externalDeclarations: Map<string, FunctionSignature> = new Map();
  private extraFunctionsCode: string[] = [];
  private allocatedAllocasInFn: Set<string> = new Set();
  private currentModulePrefix: string = '';
  private globalVariables: Map<string, { symbol: string; type: string }> = new Map();
  private globalVarDecls: string[] = [];

  private freshReg(): string {
    return `%t${++this.tempRegCounter}`;
  }

  private freshBlock(prefix = 'bb'): string {
    return `${prefix}.${++this.blockCounter}`;
  }

  private startBlock(name: string): Block {
    const existing = this.blocks.find(b => b.name === name);
    if (existing) {
      this.currentBlock = existing;
      return existing;
    }
    const b: Block = { name, instructions: [], terminated: false };
    this.blocks.push(b);
    this.currentBlock = b;
    return b;
  }

  private emit(instruction: string): void {
    if (!this.currentBlock) {
      this.startBlock('entry');
    }
    if (this.currentBlock!.terminated) {
      return;
    }
    this.currentBlock!.instructions.push(`  ${instruction}`);
  }

  private emitAlloca(allocaInstruction: string): void {
    this.entryAllocas.push(`  ${allocaInstruction}`);
  }

  private emitBranch(label: string): void {
    if (!this.currentBlock || this.currentBlock.terminated) return;
    this.currentBlock.instructions.push(`  br label %${label}`);
    this.currentBlock.terminated = true;
  }

  private emitCondBranch(cond: string, trueLabel: string, falseLabel: string): void {
    if (!this.currentBlock || this.currentBlock.terminated) return;
    this.currentBlock.instructions.push(`  br i1 ${cond}, label %${trueLabel}, label %${falseLabel}`);
    this.currentBlock.terminated = true;
  }

  private registerString(text: string): string {
    if (this.stringPool.has(text)) {
      return this.stringPool.get(text)!;
    }
    const sym = `@.str.${this.stringPool.size}`;
    this.stringPool.set(text, sym);

    const utf8Bytes = new TextEncoder().encode(text);
    let escaped = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      const b = utf8Bytes[i];
      if (b >= 32 && b <= 126 && b !== 34 && b !== 92) {
        escaped += String.fromCharCode(b);
      } else {
        escaped += '\\' + b.toString(16).toUpperCase().padStart(2, '0');
      }
    }
    const byteLen = utf8Bytes.length + 1;
    this.stringDecls.push(`${sym} = private unnamed_addr constant [${byteLen} x i8] c"${escaped}\\00", align 1`);
    return sym;
  }

  private llvmTypeFromAST(type?: TypeAST): string {
    if (!type) return 'double';
    switch (type.kind) {
      case 'base':
        if (type.name === 'string') return 'i8*';
        if (type.name === 'boolean') return 'i1';
        if (type.name === 'void') return 'void';
        return 'double';
      case 'app':
        if (this.gadtTypeNames.has(type.name)) {
          return '%struct.GADTValue*';
        }
        if (type.name === 'Array') {
          return '%struct.Array*';
        }
        return '%struct.GADTValue*';
      case 'var':
      case 'fun':
      case 'record':
      case 'tuple':
        return 'i8*';
      default:
        return 'double';
    }
  }

  private castToI8Ptr(val: LLVMValue): string {
    if (val.type === 'void') {
      return 'null';
    }
    if (val.type === 'i8*') {
      if (val.name === '0.0' || val.name === '0' || val.name === '') return 'null';
      return val.name;
    }
    if (val.type.endsWith('*')) {
      if (val.name === '0.0' || val.name === '0' || val.name === '' || val.name === 'null') return 'null';
      const cast = this.freshReg();
      this.emit(`${cast} = bitcast ${val.type} ${val.name} to i8*`);
      return cast;
    }
    if (val.type === 'double') {
      const dblReg = val.name.startsWith('%') ? val.name : (() => {
        const r = this.freshReg();
        this.emit(`${r} = fadd double ${val.name}, 0.0`);
        return r;
      })();
      const i64Reg = this.freshReg();
      this.emit(`${i64Reg} = bitcast double ${dblReg} to i64`);
      const ptrReg = this.freshReg();
      this.emit(`${ptrReg} = inttoptr i64 ${i64Reg} to i8*`);
      return ptrReg;
    }
    if (val.type === 'i64') {
      const ptrReg = this.freshReg();
      this.emit(`${ptrReg} = inttoptr i64 ${val.name} to i8*`);
      return ptrReg;
    }
    if (val.type === 'i32') {
      const i64Reg = this.freshReg();
      this.emit(`${i64Reg} = zext i32 ${val.name} to i64`);
      const ptrReg = this.freshReg();
      this.emit(`${ptrReg} = inttoptr i64 ${i64Reg} to i8*`);
      return ptrReg;
    }
    if (val.type === 'i1') {
      const i64Reg = this.freshReg();
      this.emit(`${i64Reg} = zext i1 ${val.name} to i64`);
      const ptrReg = this.freshReg();
      this.emit(`${ptrReg} = inttoptr i64 ${i64Reg} to i8*`);
      return ptrReg;
    }
    const cast = this.freshReg();
    this.emit(`${cast} = bitcast ${val.type} ${val.name} to i8*`);
    return cast;
  }

  private castFromI8Ptr(ptrName: string, targetType: string): string {
    if (targetType === 'void') {
      return '';
    }
    const safePtr = (ptrName === '0.0' || ptrName === '0' || ptrName === '' || !ptrName) ? 'null' : ptrName;
    if (targetType === 'i8*') {
      return safePtr;
    }
    if (targetType.endsWith('*')) {
      if (safePtr === 'null') return 'null';
      const cast = this.freshReg();
      this.emit(`${cast} = bitcast i8* ${safePtr} to ${targetType}`);
      return cast;
    }
    if (targetType === 'double') {
      if (safePtr === 'null') return '0.0';
      const i64Reg = this.freshReg();
      this.emit(`${i64Reg} = ptrtoint i8* ${safePtr} to i64`);
      const dblReg = this.freshReg();
      this.emit(`${dblReg} = bitcast i64 ${i64Reg} to double`);
      return dblReg;
    }
    if (targetType === 'i64') {
      if (safePtr === 'null') return '0';
      const i64Reg = this.freshReg();
      this.emit(`${i64Reg} = ptrtoint i8* ${safePtr} to i64`);
      return i64Reg;
    }
    if (targetType === 'i32') {
      if (safePtr === 'null') return '0';
      const i64Reg = this.freshReg();
      this.emit(`${i64Reg} = ptrtoint i8* ${safePtr} to i64`);
      const i32Reg = this.freshReg();
      this.emit(`${i32Reg} = trunc i64 ${i64Reg} to i32`);
      return i32Reg;
    }
    if (targetType === 'i1') {
      if (safePtr === 'null') return '0';
      const i64Reg = this.freshReg();
      this.emit(`${i64Reg} = ptrtoint i8* ${safePtr} to i64`);
      const i1Reg = this.freshReg();
      this.emit(`${i1Reg} = trunc i64 ${i64Reg} to i1`);
      return i1Reg;
    }
    const cast = this.freshReg();
    this.emit(`${cast} = bitcast i8* ${safePtr} to ${targetType}`);
    return cast;
  }

  private coerceToDouble(val: LLVMValue): LLVMValue {
    if (val.type === 'double') {
      return val;
    }
    if (val.type === 'void') {
      return { type: 'double', name: '0.0' };
    }
    const dest = this.freshReg();
    if (val.type === 'i1') {
      this.emit(`${dest} = uitofp i1 ${val.name} to double`);
      return { type: 'double', name: dest };
    }
    if (val.type === 'i32') {
      this.emit(`${dest} = sitofp i32 ${val.name} to double`);
      return { type: 'double', name: dest };
    }
    if (val.type === 'i64') {
      this.emit(`${dest} = sitofp i64 ${val.name} to double`);
      return { type: 'double', name: dest };
    }
    if (val.type === 'i8*' || val.type.endsWith('*')) {
      const safePtr = (val.name === '0.0' || val.name === '0' || val.name === '' || !val.name) ? 'null' : val.name;
      if (safePtr === 'null') {
        return { type: 'double', name: '0.0' };
      }
      const ptr = val.type === 'i8*' ? safePtr : this.castToI8Ptr(val);
      const i64Reg = this.freshReg();
      this.emit(`${i64Reg} = ptrtoint i8* ${ptr} to i64`);
      this.emit(`${dest} = bitcast i64 ${i64Reg} to double`);
      return { type: 'double', name: dest };
    }
    return { type: 'double', name: '0.0' };
  }

  private coerceToI1(val: LLVMValue): LLVMValue {
    if (val.type === 'i1') {
      return val;
    }
    if (val.type === 'void') {
      return { type: 'i1', name: '0' };
    }
    const dest = this.freshReg();
    if (val.type === 'double') {
      this.emit(`${dest} = fcmp one double ${val.name}, 0.0`);
      return { type: 'i1', name: dest };
    }
    if (val.type === 'i32') {
      this.emit(`${dest} = icmp ne i32 ${val.name}, 0`);
      return { type: 'i1', name: dest };
    }
    if (val.type === 'i64') {
      this.emit(`${dest} = icmp ne i64 ${val.name}, 0`);
      return { type: 'i1', name: dest };
    }
    if (val.type === 'i8*' || val.type.endsWith('*')) {
      const safePtr = (val.name === '0.0' || val.name === '0' || val.name === '' || !val.name) ? 'null' : val.name;
      const ptr = val.type === 'i8*' ? safePtr : this.castToI8Ptr(val);
      this.emit(`${dest} = icmp ne i8* ${ptr}, null`);
      return { type: 'i1', name: dest };
    }
    return { type: 'i1', name: '1' };
  }

  private convertToStringPtr(val: LLVMValue): string {
    if (val.type === 'i8*') {
      if (val.name === '0.0' || val.name === '0' || val.name === '') return 'null';
      return val.name;
    }
    if (val.type.endsWith('*')) {
      return this.castToI8Ptr(val);
    }
    const dest = this.freshReg();
    this.emit(`${dest} = call i8* @malloc(i64 64)`);
    if (val.type === 'double') {
      const p = this.freshReg();
      this.emit(`${p} = call i32 (i8*, i8*, ...) @sprintf(i8* ${dest}, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double ${val.name})`);
    } else if (val.type === 'i64' || val.type === 'i32') {
      const p = this.freshReg();
      this.emit(`${p} = call i32 (i8*, i8*, ...) @sprintf(i8* ${dest}, i8* getelementptr inbounds ([6 x i8], [6 x i8]* @.fmt_int, i64 0, i64 0), ${val.type} ${val.name})`);
    } else if (val.type === 'i1') {
      const condReg = this.freshReg();
      this.emit(`${condReg} = select i1 ${val.name}, i8* getelementptr inbounds ([6 x i8], [6 x i8]* @.fmt_bool_t, i64 0, i64 0), i8* getelementptr inbounds ([7 x i8], [7 x i8]* @.fmt_bool_f, i64 0, i64 0)`);
      const p = this.freshReg();
      this.emit(`${p} = call i8* @strcpy(i8* ${dest}, i8* ${condReg})`);
    } else {
      const ptr = this.castToI8Ptr(val);
      const p = this.freshReg();
      this.emit(`${p} = call i32 (i8*, i8*, ...) @sprintf(i8* ${dest}, i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* ${ptr})`);
    }
    return dest;
  }

  private coerceToType(val: LLVMValue, targetType: string): LLVMValue {
    if (val.type === targetType) {
      if ((val.name === '0.0' || val.name === '0' || val.name === '') && targetType.endsWith('*')) {
        return { type: targetType, name: 'null' };
      }
      return val;
    }
    if (targetType === 'void') {
      return { type: 'void', name: '' };
    }
    if (targetType === 'double') {
      return this.coerceToDouble(val);
    }
    if (targetType === 'i1') {
      return this.coerceToI1(val);
    }
    if (targetType === 'i8*') {
      return { type: 'i8*', name: this.castToI8Ptr(val) };
    }
    if (targetType.endsWith('*')) {
      if (val.name === 'null' || val.name === '0.0' || val.name === '0' || val.name === '' || !val.name) {
        return { type: targetType, name: 'null' };
      }
      const ptr = val.type === 'i8*' ? val.name : this.castToI8Ptr(val);
      const castReg = this.freshReg();
      this.emit(`${castReg} = bitcast i8* ${ptr} to ${targetType}`);
      return { type: targetType, name: castReg };
    }
    return val;
  }

  public generate(program: Program): string {
    this.tempRegCounter = 0;
    this.blockCounter = 0;
    this.lambdaCounter = 0;
    this.stringPool.clear();
    this.stringDecls = [];
    this.gadtConstructorTags.clear();
    this.gadtTypeNames.clear();
    this.functionDefinitions.clear();
    this.externalDeclarations.clear();
    this.extraFunctionsCode = [];
    this.globalVariables.clear();
    this.globalVarDecls = [];

    // 1. Collect GADT definitions
    const collectGADTs = (stmts: Statement[], prefix = '') => {
      for (const s of stmts) {
        if (s.kind === 's_gadt') {
          this.gadtTypeNames.add(s.decl.name);
          s.decl.constructors.forEach((ctor, idx) => {
            const qualifiedName = prefix ? `${prefix}_${ctor.name}` : ctor.name;
            this.gadtConstructorTags.set(qualifiedName, {
              tag: idx,
              typeName: s.decl.name,
              arity: ctor.params.length
            });
            if (prefix) {
              this.gadtConstructorTags.set(ctor.name, {
                tag: idx,
                typeName: s.decl.name,
                arity: ctor.params.length
              });
            }
          });
        } else if (s.kind === 's_module') {
          const modPrefix = prefix ? `${prefix}_${s.name}` : s.name;
          collectGADTs(s.body, modPrefix);
        }
      }
    };
    collectGADTs(program.statements);

    // 2. Collect Globals and Module-level variables
    const collectGlobals = (stmts: Statement[], prefix = '') => {
      for (const s of stmts) {
        if (s.kind === 's_let') {
          const symbol = prefix ? `${prefix}_${s.name}` : s.name;
          const llvmType = s.typeAnnotation ? this.llvmTypeFromAST(s.typeAnnotation) : 'i8*';
          const info = { symbol, type: llvmType };
          this.globalVariables.set(symbol, info);
          if (prefix) {
            this.globalVariables.set(`${prefix}.${s.name}`, info);
            this.globalVariables.set(s.name, info);
          } else {
            this.globalVariables.set(s.name, info);
          }
          let defaultVal = 'null';
          if (llvmType === 'double') defaultVal = '0.0';
          else if (llvmType === 'i1' || llvmType === 'i32') defaultVal = '0';
          else if (llvmType === 'i64') defaultVal = '0';
          this.globalVarDecls.push(`@${symbol} = global ${llvmType} ${defaultVal}, align 8`);
        } else if (s.kind === 's_module') {
          const modPrefix = prefix ? `${prefix}_${s.name}` : s.name;
          collectGlobals(s.body, modPrefix);
        }
      }
    };
    collectGlobals(program.statements);

    // 3. Collect Function Signatures
    const allFunctions: { fn: SFunction; prefix: string; symbol: string }[] = [];
    const collectFunctions = (stmts: Statement[], prefix = '') => {
      for (const s of stmts) {
        if (s.kind === 's_function') {
          const symbol = prefix ? `${prefix}_${s.name}` : s.name;
          allFunctions.push({ fn: s, prefix, symbol });
        } else if (s.kind === 's_module') {
          const modPrefix = prefix ? `${prefix}_${s.name}` : s.name;
          collectFunctions(s.body, modPrefix);
        }
      }
    };
    collectFunctions(program.statements);

    for (const item of allFunctions) {
      const fn = item.fn;
      const paramTypes = fn.params.map(p => this.llvmTypeFromAST(p.type));
      const retType = this.llvmTypeFromAST(fn.returnType);
      const sig: FunctionSignature = { paramTypes, retType };
      const info: FunctionInfo = { symbol: item.symbol, sig };

      this.functionDefinitions.set(item.symbol, info);
      if (item.prefix) {
        this.functionDefinitions.set(`${item.prefix}.${fn.name}`, info);
      } else {
        this.functionDefinitions.set(fn.name, info);
      }
    }

    const functionsCode: string[] = [];

    // 3. Generate Functions
    for (const item of allFunctions) {
      const fn = item.fn;
      const originalName = fn.name;
      fn.name = item.symbol;
      functionsCode.push(this.generateFunction(fn, item.prefix));
      fn.name = originalName;
    }

    // 4. Generate main entry point
    const mainFunc = this.generateMain(program);

    // 5. Assemble Header, Types, String Pool & Runtime
    const headerLines: string[] = [
      '; =====================================================================',
      '; Module: TypeLang Generated LLVM SSA Target',
      '; Architecture: x86_64-unknown-linux-gnu / POSIX',
      '; =====================================================================',
      '; ModuleID = "typelang_module"',
      'source_filename = "main.tl"',
      'target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-f80:128-n8:16:32:64-S128"',
      'target triple = "x86_64-unknown-linux-gnu"',
      '',
      '; --- Core Data Struct Layouts ---',
      '%struct.GADTValue = type { i32, i8* }     ; Tagged union (tag: i32, payload: i8*)',
      '%struct.Array = type { i64, i8** }        ; Dynamic array (len: i64, data: i8**)',
      '%struct.RecordField = type { i8*, i8* }   ; Structural dynamic field slot',
      '',
      '; --- Standard Formats & String Constants ---',
      '@.fmt_str = private unnamed_addr constant [4 x i8] c"%s\\0A\\00", align 1',
      '@.fmt_num = private unnamed_addr constant [4 x i8] c"%f\\0A\\00", align 1',
      '@.fmt_int = private unnamed_addr constant [6 x i8] c"%lld\\0A\\00", align 1',
      '@.fmt_bool_t = private unnamed_addr constant [6 x i8] c"true\\0A\\00", align 1',
      '@.fmt_bool_f = private unnamed_addr constant [7 x i8] c"false\\0A\\00", align 1'
    ];

    if (this.stringDecls.length > 0) {
      headerLines.push('');
      headerLines.push('; --- Interned String Literals ---');
      headerLines.push(...this.stringDecls);
    }

    if (this.globalVarDecls.length > 0) {
      headerLines.push('');
      headerLines.push('; --- Global and Module Variables ---');
      headerLines.push(...this.globalVarDecls);
    }

    headerLines.push('');
    headerLines.push('; --- External POSIX C Library Declarations ---');
    headerLines.push('declare i32 @printf(i8*, ...)');
    headerLines.push('declare i32 @sprintf(i8*, i8*, ...)');
    headerLines.push('declare i32 @puts(i8*)');
    headerLines.push('declare i8* @malloc(i64)');
    headerLines.push('declare void @free(i8*)');
    headerLines.push('declare void @exit(i32)');
    headerLines.push('declare i64 @strlen(i8*)');
    headerLines.push('declare i8* @strcpy(i8*, i8*)');
    headerLines.push('declare i8* @strcat(i8*, i8*)');
    headerLines.push('declare i32 @strcmp(i8*, i8*)');
    headerLines.push('declare double @atof(i8*)');
    headerLines.push('declare i64 @atoll(i8*)');
    headerLines.push('declare double @llvm.sqrt.f64(double)');
    headerLines.push('declare double @llvm.pow.f64(double, double)');
    headerLines.push('declare double @llvm.fabs.f64(double)');
    headerLines.push('declare double @llvm.floor.f64(double)');
    headerLines.push('declare double @llvm.ceil.f64(double)');
    headerLines.push('declare double @llvm.sin.f64(double)');
    headerLines.push('declare double @llvm.cos.f64(double)');

    // Runtime Record Lookup Function
    const recordGetFunction = [
      '',
      '; --- Runtime Helper: Dynamic Record Field Lookup ---',
      'define i8* @_tl_record_get(i8* %rec, i8* %field) {',
      'entry:',
      '  %cmp_null = icmp eq i8* %rec, null',
      '  br i1 %cmp_null, label %ret_null, label %check_rec',
      'check_rec:',
      '  %count_ptr = bitcast i8* %rec to i64*',
      '  %count = load i64, i64* %count_ptr, align 8',
      '  br label %loop.cond',
      'loop.cond:',
      '  %i = phi i64 [ 0, %check_rec ], [ %next_i, %loop.step ]',
      '  %done = icmp sge i64 %i, %count',
      '  br i1 %done, label %ret_null, label %loop.body',
      'loop.body:',
      '  %slot_offset = mul i64 %i, 16',
      '  %key_offset = add i64 %slot_offset, 8',
      '  %key_ptr_loc = getelementptr inbounds i8, i8* %rec, i64 %key_offset',
      '  %key_ptr_cast = bitcast i8* %key_ptr_loc to i8**',
      '  %key = load i8*, i8** %key_ptr_cast, align 8',
      '  %cmp = call i32 @strcmp(i8* %key, i8* %field)',
      '  %match = icmp eq i32 %cmp, 0',
      '  br i1 %match, label %found, label %loop.step',
      'found:',
      '  %val_offset = add i64 %slot_offset, 16',
      '  %val_ptr_loc = getelementptr inbounds i8, i8* %rec, i64 %val_offset',
      '  %val_ptr_cast = bitcast i8* %val_ptr_loc to i8**',
      '  %val = load i8*, i8** %val_ptr_cast, align 8',
      '  ret i8* %val',
      'loop.step:',
      '  %next_i = add i64 %i, 1',
      '  br label %loop.cond',
      'ret_null:',
      '  ret i8* null',
      '}',
      ''
    ].join('\n');

    const arrayJoinFunction = [
      '',
      '; --- Runtime Helper: Array Join ---',
      'define i8* @_tl_array_join(%struct.Array* %arr, i8* %sep) {',
      'entry:',
      '  %cmp_null = icmp eq %struct.Array* %arr, null',
      '  br i1 %cmp_null, label %ret_empty, label %check_len',
      'check_len:',
      '  %len_ptr = getelementptr inbounds %struct.Array, %struct.Array* %arr, i32 0, i32 0',
      '  %len = load i64, i64* %len_ptr, align 8',
      '  %cmp_zero = icmp sle i64 %len, 0',
      '  br i1 %cmp_zero, label %ret_empty, label %alloc_buf',
      'alloc_buf:',
      '  %buf = call i8* @malloc(i64 65536)',
      '  store i8 0, i8* %buf, align 1',
      '  %data_ptr = getelementptr inbounds %struct.Array, %struct.Array* %arr, i32 0, i32 1',
      '  %elems = load i8**, i8*** %data_ptr, align 8',
      '  br label %join.loop.cond',
      'join.loop.cond:',
      '  %i = phi i64 [ 0, %alloc_buf ], [ %next_i, %join.loop.step ]',
      '  %done = icmp sge i64 %i, %len',
      '  br i1 %done, label %join.done, label %join.loop.body',
      'join.loop.body:',
      '  %is_first = icmp eq i64 %i, 0',
      '  br i1 %is_first, label %append_elem, label %check_sep',
      'check_sep:',
      '  %sep_null = icmp eq i8* %sep, null',
      '  br i1 %sep_null, label %append_elem, label %append_sep',
      'append_sep:',
      '  %tmp_cat1 = call i8* @strcat(i8* %buf, i8* %sep)',
      '  br label %append_elem',
      'append_elem:',
      '  %elem_slot = getelementptr inbounds i8*, i8** %elems, i64 %i',
      '  %elem_str = load i8*, i8** %elem_slot, align 8',
      '  %elem_null = icmp eq i8* %elem_str, null',
      '  br i1 %elem_null, label %join.loop.step, label %do_elem_cat',
      'do_elem_cat:',
      '  %tmp_cat2 = call i8* @strcat(i8* %buf, i8* %elem_str)',
      '  br label %join.loop.step',
      'join.loop.step:',
      '  %next_i = add i64 %i, 1',
      '  br label %join.loop.cond',
      'join.done:',
      '  ret i8* %buf',
      'ret_empty:',
      '  %empty = call i8* @malloc(i64 1)',
      '  store i8 0, i8* %empty, align 1',
      '  ret i8* %empty',
      '}',
      ''
    ].join('\n');

    const arrayPushFunction = [
      '',
      '; --- Runtime Helper: Array Push ---',
      'define %struct.Array* @_tl_array_push(%struct.Array* %arr, i8* %elem) {',
      'entry:',
      '  %cmp_null = icmp eq %struct.Array* %arr, null',
      '  br i1 %cmp_null, label %ret_null, label %do_push',
      'do_push:',
      '  %len_ptr = getelementptr inbounds %struct.Array, %struct.Array* %arr, i32 0, i32 0',
      '  %len = load i64, i64* %len_ptr, align 8',
      '  %new_len = add i64 %len, 1',
      '  %data_ptr = getelementptr inbounds %struct.Array, %struct.Array* %arr, i32 0, i32 1',
      '  %old_data = load i8**, i8*** %data_ptr, align 8',
      '  %new_bytes = mul i64 %new_len, 8',
      '  %new_data_raw = call i8* @malloc(i64 %new_bytes)',
      '  %new_data = bitcast i8* %new_data_raw to i8**',
      '  br label %push.loop.cond',
      'push.loop.cond:',
      '  %idx = phi i64 [ 0, %do_push ], [ %next_idx, %push.loop.body ]',
      '  %cmp_done = icmp sge i64 %idx, %len',
      '  br i1 %cmp_done, label %push.loop.end, label %push.loop.body',
      'push.loop.body:',
      '  %old_slot = getelementptr inbounds i8*, i8** %old_data, i64 %idx',
      '  %old_val = load i8*, i8** %old_slot, align 8',
      '  %new_slot = getelementptr inbounds i8*, i8** %new_data, i64 %idx',
      '  store i8* %old_val, i8** %new_slot, align 8',
      '  %next_idx = add i64 %idx, 1',
      '  br label %push.loop.cond',
      'push.loop.end:',
      '  %push_slot = getelementptr inbounds i8*, i8** %new_data, i64 %len',
      '  store i8* %elem, i8** %push_slot, align 8',
      '  store i64 %new_len, i64* %len_ptr, align 8',
      '  store i8** %new_data, i8*** %data_ptr, align 8',
      '  ret %struct.Array* %arr',
      'ret_null:',
      '  ret %struct.Array* null',
      '}',
      ''
    ].join('\n');

    // Forward declarations for external functions called
    for (const [extName, extSig] of this.externalDeclarations.entries()) {
      if (!this.functionDefinitions.has(extName) && extName !== '_tl_record_get' && extName !== '_tl_array_join' && extName !== '_tl_array_push') {
        headerLines.push(`declare ${extSig.retType} @${extName}(${extSig.paramTypes.join(', ')})`);
      }
    }
    headerLines.push('');

    return [...headerLines, recordGetFunction, arrayJoinFunction, arrayPushFunction, ...this.extraFunctionsCode, ...functionsCode, mainFunc].join('\n');
  }

  private generateFunction(fn: SFunction, prefix = ''): string {
    const savedBlocks = this.blocks;
    const savedCurrent = this.currentBlock;
    const savedVarAlloca = new Map(this.varAllocaMap);
    const savedAllocas = [...this.entryAllocas];

    this.blocks = [];
    this.currentBlock = null;
    this.entryAllocas = [];
    this.varAllocaMap.clear();
    this.allocatedAllocasInFn.clear();
    this.currentModulePrefix = prefix;

    const paramList: string[] = fn.params.map(p => {
      const llvmType = this.llvmTypeFromAST(p.type);
      return `${llvmType} %arg.${p.name}`;
    });

    const retType = this.llvmTypeFromAST(fn.returnType);
    const lines: string[] = [`define ${retType} @${fn.name}(${paramList.join(', ')}) {`];

    this.startBlock('entry');

    // Allocate stack space for parameters
    for (const p of fn.params) {
      const targetType = this.llvmTypeFromAST(p.type);
      const allocaReg = `%${p.name}.addr`;
      this.emitAlloca(`${allocaReg} = alloca ${targetType}, align 8`);
      this.emit(`store ${targetType} %arg.${p.name}, ${targetType}* ${allocaReg}, align 8`);
      this.varAllocaMap.set(p.name, { type: targetType, reg: allocaReg });
    }

    // Lower function body
    const bodyVal = this.lowerExpr(fn.body);

    if (retType === 'void') {
      this.emitRet('void');
    } else {
      let finalRetVal = bodyVal;
      if (bodyVal.type !== retType) {
        if (bodyVal.type === 'i8*') {
          const cast = this.castFromI8Ptr(bodyVal.name, retType);
          finalRetVal = { type: retType, name: cast };
        } else if (retType === 'i8*') {
          const cast = this.castToI8Ptr(bodyVal);
          finalRetVal = { type: 'i8*', name: cast };
        } else if (retType === 'double') {
          finalRetVal = this.coerceToDouble(bodyVal);
        } else if (retType === 'i1') {
          finalRetVal = this.coerceToI1(bodyVal);
        } else if (retType.endsWith('*')) {
          if (bodyVal.name === '0.0' || bodyVal.name === '0' || bodyVal.type === 'void') {
            finalRetVal = { type: retType, name: 'null' };
          } else {
            const ptr = this.castToI8Ptr(bodyVal);
            const cast = this.freshReg();
            this.emit(`${cast} = bitcast i8* ${ptr} to ${retType}`);
            finalRetVal = { type: retType, name: cast };
          }
        }
      }
      this.emitRet(retType, finalRetVal.name);
    }

    // Ensure all blocks have instructions and terminators
    this.finalizeBlocks(retType);

    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      lines.push(`${block.name}:`);
      if (i === 0 && this.entryAllocas.length > 0) {
        lines.push(...this.entryAllocas);
      }
      lines.push(...block.instructions);
    }
    lines.push('}\n');

    this.blocks = savedBlocks;
    this.currentBlock = savedCurrent;
    this.varAllocaMap = savedVarAlloca;
    this.entryAllocas = savedAllocas;

    return lines.join('\n');
  }

  private generateMain(program: Program): string {
    this.blocks = [];
    this.currentBlock = null;
    this.entryAllocas = [];
    this.varAllocaMap.clear();
    this.allocatedAllocasInFn.clear();
    this.currentModulePrefix = '';

    const lines: string[] = ['define i32 @main() {'];
    this.startBlock('entry');

    for (const stmt of program.statements) {
      this.lowerTopLevelStatement(stmt);
    }

    this.emitRet('i32', '0');
    this.finalizeBlocks('i32');

    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      lines.push(`${block.name}:`);
      if (i === 0 && this.entryAllocas.length > 0) {
        lines.push(...this.entryAllocas);
      }
      lines.push(...block.instructions);
    }
    lines.push('}');

    return lines.join('\n');
  }

  private finalizeBlocks(retType: string): void {
    for (let i = 0; i < this.blocks.length; i++) {
      const b = this.blocks[i];
      if (b.instructions.length === 0) {
        if (i + 1 < this.blocks.length) {
          b.instructions.push(`  br label %${this.blocks[i + 1].name}`);
        } else {
          if (retType === 'void') {
            b.instructions.push('  ret void');
          } else if (retType === 'i32') {
            b.instructions.push('  ret i32 0');
          } else if (retType === 'double') {
            b.instructions.push('  ret double 0.0');
          } else if (retType === 'i1') {
            b.instructions.push('  ret i1 0');
          } else {
            b.instructions.push(`  ret ${retType} null`);
          }
        }
        b.terminated = true;
      } else if (!b.terminated) {
        if (i + 1 < this.blocks.length) {
          b.instructions.push(`  br label %${this.blocks[i + 1].name}`);
        } else {
          if (retType === 'void') {
            b.instructions.push('  ret void');
          } else if (retType === 'i32') {
            b.instructions.push('  ret i32 0');
          } else if (retType === 'double') {
            b.instructions.push('  ret double 0.0');
          } else if (retType === 'i1') {
            b.instructions.push('  ret i1 0');
          } else {
            b.instructions.push(`  ret ${retType} null`);
          }
        }
        b.terminated = true;
      }
    }
  }

  private emitRet(type: string, valName?: string): void {
    if (!this.currentBlock || this.currentBlock.terminated) return;
    if (type === 'void' || !valName) {
      this.currentBlock.instructions.push('  ret void');
    } else {
      this.currentBlock.instructions.push(`  ret ${type} ${valName}`);
    }
    this.currentBlock.terminated = true;
  }

  private lowerTopLevelStatement(stmt: Statement): void {
    switch (stmt.kind) {
      case 's_let': {
        const val = this.lowerExpr(stmt.init);
        const symbol = this.currentModulePrefix ? `${this.currentModulePrefix}_${stmt.name}` : stmt.name;
        const globalInfo = this.globalVariables.get(symbol) || this.globalVariables.get(stmt.name);

        const allocaType = val.type === 'void' ? 'i8*' : val.type;
        let baseName = `${stmt.name}.var`;
        let allocaName = baseName;
        let count = 1;
        while (this.allocatedAllocasInFn.has(allocaName)) {
          allocaName = `${stmt.name}.${count++}.var`;
        }
        this.allocatedAllocasInFn.add(allocaName);
        const allocaReg = `%${allocaName}`;
        this.emitAlloca(`${allocaReg} = alloca ${allocaType}, align 8`);
        if (val.type !== 'void') {
          this.emit(`store ${val.type} ${val.name}, ${val.type}* ${allocaReg}, align 8`);
        }
        this.varAllocaMap.set(stmt.name, { type: allocaType, reg: allocaReg });
        if (globalInfo) {
          const coerced = this.coerceToType(val, globalInfo.type);
          this.emit(`store ${globalInfo.type} ${coerced.name}, ${globalInfo.type}* @${globalInfo.symbol}, align 8`);
        }
        break;
      }

      case 's_expr': {
        this.lowerExpr(stmt.expr);
        break;
      }

      case 's_module': {
        const prevPrefix = this.currentModulePrefix;
        this.currentModulePrefix = prevPrefix ? `${prevPrefix}_${stmt.name}` : stmt.name;
        for (const s of stmt.body) {
          this.lowerTopLevelStatement(s);
        }
        this.currentModulePrefix = prevPrefix;
        break;
      }

      case 's_gadt': {
        this.emit(`; GADT Sum Type Definition: ${stmt.decl.name}`);
        stmt.decl.constructors.forEach((ctor, idx) => {
          this.emit(`;   Constructor [${idx}]: ${ctor.name}(${ctor.params.map(p => p.name).join(', ')})`);
        });
        break;
      }

      default:
        break;
    }
  }

  private lowerExpr(expr: Expr): LLVMValue {
    switch (expr.kind) {
      case 'e_literal': {
        if (typeof expr.value === 'number') {
          const numStr = Number.isInteger(expr.value) ? `${expr.value}.0` : String(expr.value);
          return { type: 'double', name: numStr };
        } else if (typeof expr.value === 'boolean') {
          return { type: 'i1', name: expr.value ? '1' : '0' };
        } else if (typeof expr.value === 'string') {
          const sym = this.registerString(expr.value);
          const reg = this.freshReg();
          const byteLen = new TextEncoder().encode(expr.value).length + 1;
          this.emit(`${reg} = getelementptr inbounds [${byteLen} x i8], [${byteLen} x i8]* ${sym}, i64 0, i64 0`);
          return { type: 'i8*', name: reg };
        }
        return { type: 'i8*', name: 'null' };
      }

      case 'e_var': {
        const modHead = expr.modulePath && expr.modulePath.length > 0 ? expr.modulePath.join('_') : '';
        const qualifiedName = modHead ? `${modHead}_${expr.name}` : expr.name;

        // Local variable
        const local = this.varAllocaMap.get(expr.name) || this.varAllocaMap.get(qualifiedName);
        if (local) {
          const loadReg = this.freshReg();
          this.emit(`${loadReg} = load ${local.type}, ${local.type}* ${local.reg}, align 8`);
          return { type: local.type, name: loadReg };
        }

        // Global / Module variable
        let globalInfo = this.globalVariables.get(qualifiedName);
        if (!globalInfo && !modHead && this.currentModulePrefix) {
          globalInfo = this.globalVariables.get(`${this.currentModulePrefix}_${expr.name}`);
        }
        if (!globalInfo && !modHead) {
          globalInfo = this.globalVariables.get(expr.name);
        }
        if (globalInfo) {
          const loadReg = this.freshReg();
          this.emit(`${loadReg} = load ${globalInfo.type}, ${globalInfo.type}* @${globalInfo.symbol}, align 8`);
          return { type: globalInfo.type, name: loadReg };
        }

        // GADT Constructor as a nullary constructor
        const ctor = this.gadtConstructorTags.get(qualifiedName) || this.gadtConstructorTags.get(expr.name);
        if (ctor && ctor.arity === 0) {
          return this.constructGADT(ctor.tag, []);
        }

        // Known top-level or module function
        let fnInfo = this.functionDefinitions.get(qualifiedName);
        if (!fnInfo && !modHead && this.currentModulePrefix) {
          fnInfo = this.functionDefinitions.get(`${this.currentModulePrefix}_${expr.name}`);
        }
        if (!fnInfo && !modHead) {
          fnInfo = this.functionDefinitions.get(expr.name);
        }
        if (fnInfo) {
          const sig = fnInfo.sig;
          const fnType = `${sig.retType} (${sig.paramTypes.join(', ')})*`;
          const castReg = this.freshReg();
          this.emit(`${castReg} = bitcast ${fnType} @${fnInfo.symbol} to i8*`);
          return { type: 'i8*', name: castReg };
        }

        return { type: 'double', name: '0.0' };
      }

      case 'e_binary': {
        const left = this.lowerExpr(expr.left);
        const right = this.lowerExpr(expr.right);
        const dest = this.freshReg();

        // String concatenation only if one operand is a string literal
        if (expr.op === '+' && (
          (expr.left.kind === 'e_literal' && typeof (expr.left as any).value === 'string') ||
          (expr.right.kind === 'e_literal' && typeof (expr.right as any).value === 'string')
        )) {
          const leftStr = this.convertToStringPtr(left);
          const rightStr = this.convertToStringPtr(right);
          const lLen = this.freshReg();
          this.emit(`${lLen} = call i64 @strlen(i8* ${leftStr})`);
          const rLen = this.freshReg();
          this.emit(`${rLen} = call i64 @strlen(i8* ${rightStr})`);
          const totLen = this.freshReg();
          this.emit(`${totLen} = add i64 ${lLen}, ${rLen}`);
          const allocLen = this.freshReg();
          this.emit(`${allocLen} = add i64 ${totLen}, 1`);
          this.emit(`${dest} = call i8* @malloc(i64 ${allocLen})`);
          const cp = this.freshReg();
          this.emit(`${cp} = call i8* @strcpy(i8* ${dest}, i8* ${leftStr})`);
          const cat = this.freshReg();
          this.emit(`${cat} = call i8* @strcat(i8* ${dest}, i8* ${rightStr})`);
          return { type: 'i8*', name: dest };
        }

        // Logical AND & OR
        if (expr.op === '&&' || expr.op === '||') {
          const lI1 = this.coerceToI1(left);
          const rI1 = this.coerceToI1(right);
          if (expr.op === '&&') {
            this.emit(`${dest} = and i1 ${lI1.name}, ${rI1.name}`);
          } else {
            this.emit(`${dest} = or i1 ${lI1.name}, ${rI1.name}`);
          }
          return { type: 'i1', name: dest };
        }

        // Equality / Inequality comparisons
        if (expr.op === '==' || expr.op === '!=') {
          if (left.type === 'i1' && right.type === 'i1') {
            const cmpOp = expr.op === '==' ? 'eq' : 'ne';
            this.emit(`${dest} = icmp ${cmpOp} i1 ${left.name}, ${right.name}`);
            return { type: 'i1', name: dest };
          }
          if (left.type.endsWith('*') && right.type.endsWith('*')) {
            const lPtr = this.castToI8Ptr(left);
            const rPtr = this.castToI8Ptr(right);
            const cmpOp = expr.op === '==' ? 'eq' : 'ne';
            this.emit(`${dest} = icmp ${cmpOp} i8* ${lPtr}, ${rPtr}`);
            return { type: 'i1', name: dest };
          }
          const lDbl = this.coerceToDouble(left);
          const rDbl = this.coerceToDouble(right);
          const cmpOp = expr.op === '==' ? 'fcmp oeq' : 'fcmp one';
          this.emit(`${dest} = ${cmpOp} double ${lDbl.name}, ${rDbl.name}`);
          return { type: 'i1', name: dest };
        }

        // Relational comparisons (<, <=, >, >=)
        if (expr.op === '<' || expr.op === '<=' || expr.op === '>' || expr.op === '>=') {
          const lDbl = this.coerceToDouble(left);
          const rDbl = this.coerceToDouble(right);
          const map: Record<string, string> = {
            '<': 'olt',
            '<=': 'ole',
            '>': 'ogt',
            '>=': 'oge'
          };
          this.emit(`${dest} = fcmp ${map[expr.op]} double ${lDbl.name}, ${rDbl.name}`);
          return { type: 'i1', name: dest };
        }

        // Standard Arithmetic (+, -, *, /, %)
        const lDbl = this.coerceToDouble(left);
        const rDbl = this.coerceToDouble(right);
        switch (expr.op) {
          case '+':
            this.emit(`${dest} = fadd double ${lDbl.name}, ${rDbl.name}`);
            return { type: 'double', name: dest };
          case '-':
            this.emit(`${dest} = fsub double ${lDbl.name}, ${rDbl.name}`);
            return { type: 'double', name: dest };
          case '*':
            this.emit(`${dest} = fmul double ${lDbl.name}, ${rDbl.name}`);
            return { type: 'double', name: dest };
          case '/':
            this.emit(`${dest} = fdiv double ${lDbl.name}, ${rDbl.name}`);
            return { type: 'double', name: dest };
          case '%':
            this.emit(`${dest} = frem double ${lDbl.name}, ${rDbl.name}`);
            return { type: 'double', name: dest };
          default:
            return left;
        }
      }

      case 'e_unary': {
        const sub = this.lowerExpr(expr.expr);
        const dest = this.freshReg();
        if (expr.op === '-') {
          const subDbl = this.coerceToDouble(sub);
          this.emit(`${dest} = fneg double ${subDbl.name}`);
          return { type: 'double', name: dest };
        } else if (expr.op === '!') {
          const subI1 = this.coerceToI1(sub);
          this.emit(`${dest} = xor i1 ${subI1.name}, 1`);
          return { type: 'i1', name: dest };
        }
        return sub;
      }

      case 'e_call': {
        if (expr.callee.kind === 'e_var') {
          const modHead = expr.callee.modulePath && expr.callee.modulePath.length > 0 ? expr.callee.modulePath.join('_') : '';
          let fnName = modHead ? `${modHead}_${expr.callee.name}` : expr.callee.name;
          if (!modHead && this.currentModulePrefix) {
            const scopedName = `${this.currentModulePrefix}_${expr.callee.name}`;
            if (this.functionDefinitions.has(scopedName) || this.gadtConstructorTags.has(scopedName)) {
              fnName = scopedName;
            }
          }

          // Standard Builtins: print, println, log
          if (fnName === 'print' || fnName === 'println' || fnName === 'log' || fnName === 'console_log') {
            const evaluatedArgs = expr.args.map(a => this.lowerExpr(a));
            for (const arg of evaluatedArgs) {
              if (arg.type === 'i8*') {
                this.emit(`call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* ${arg.name})`);
              } else if (arg.type === 'double') {
                this.emit(`call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double ${arg.name})`);
              } else if (arg.type === 'i64' || arg.type === 'i32') {
                this.emit(`call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([6 x i8], [6 x i8]* @.fmt_int, i64 0, i64 0), ${arg.type} ${arg.name})`);
              } else if (arg.type === 'i1') {
                const condReg = this.freshReg();
                this.emit(`${condReg} = select i1 ${arg.name}, i8* getelementptr inbounds ([6 x i8], [6 x i8]* @.fmt_bool_t, i64 0, i64 0), i8* getelementptr inbounds ([7 x i8], [7 x i8]* @.fmt_bool_f, i64 0, i64 0)`);
                this.emit(`call i32 (i8*, ...) @printf(i8* ${condReg})`);
              } else {
                const i8Cast = this.castToI8Ptr(arg);
                this.emit(`call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* ${i8Cast})`);
              }
            }
            return { type: 'void', name: '' };
          }

          // String utilities
          if (fnName === 'str_concat' || fnName === 'concat') {
            const left = this.lowerExpr(expr.args[0]);
            const right = this.lowerExpr(expr.args[1]);
            const lI8 = this.convertToStringPtr(left);
            const rI8 = this.convertToStringPtr(right);
            const lLen = this.freshReg();
            this.emit(`${lLen} = call i64 @strlen(i8* ${lI8})`);
            const rLen = this.freshReg();
            this.emit(`${rLen} = call i64 @strlen(i8* ${rI8})`);
            const totLen = this.freshReg();
            this.emit(`${totLen} = add i64 ${lLen}, ${rLen}`);
            const allocLen = this.freshReg();
            this.emit(`${allocLen} = add i64 ${totLen}, 1`);
            const dest = this.freshReg();
            this.emit(`${dest} = call i8* @malloc(i64 ${allocLen})`);
            const cp = this.freshReg();
            this.emit(`${cp} = call i8* @strcpy(i8* ${dest}, i8* ${lI8})`);
            const cat = this.freshReg();
            this.emit(`${cat} = call i8* @strcat(i8* ${dest}, i8* ${rI8})`);
            return { type: 'i8*', name: dest };
          }

          if (fnName === 'to_string') {
            const arg = expr.args.length > 0 ? this.lowerExpr(expr.args[0]) : { type: 'i8*', name: 'null' };
            const strPtr = this.convertToStringPtr(arg);
            return { type: 'i8*', name: strPtr };
          }

          // Parsing
          if (fnName === 'String_parseFloat' || fnName === 'parseFloat') {
            const arg = expr.args.length > 0 ? this.lowerExpr(expr.args[0]) : { type: 'i8*', name: 'null' };
            const strPtr = this.convertToStringPtr(arg);
            const dest = this.freshReg();
            this.emit(`${dest} = call double @atof(i8* ${strPtr})`);
            return { type: 'double', name: dest };
          }

          if (fnName === 'parseInt' || fnName === 'String_parseInt') {
            const arg = expr.args.length > 0 ? this.lowerExpr(expr.args[0]) : { type: 'i8*', name: 'null' };
            const strPtr = this.convertToStringPtr(arg);
            const destI64 = this.freshReg();
            this.emit(`${destI64} = call i64 @atoll(i8* ${strPtr})`);
            const dest = this.freshReg();
            this.emit(`${dest} = sitofp i64 ${destI64} to double`);
            return { type: 'double', name: dest };
          }

          // Virtual DOM / JSX helper h(tag, props, children)
          if (fnName === 'h' || fnName === 'createElement') {
            if (!this.externalDeclarations.has('h')) {
              this.externalDeclarations.set('h', {
                paramTypes: ['i8*', 'i8*', 'i8*'],
                retType: 'i8*'
              });
            }
            const arg1 = expr.args.length > 0 ? this.castToI8Ptr(this.lowerExpr(expr.args[0])) : 'null';
            const arg2 = expr.args.length > 1 ? this.castToI8Ptr(this.lowerExpr(expr.args[1])) : 'null';
            const arg3 = expr.args.length > 2 ? this.castToI8Ptr(this.lowerExpr(expr.args[2])) : 'null';
            const dest = this.freshReg();
            this.emit(`${dest} = call i8* @h(i8* ${arg1}, i8* ${arg2}, i8* ${arg3})`);
            return { type: 'i8*', name: dest };
          }

          // Array helpers
          if (fnName === 'Array_len' || fnName === 'Array_length' || fnName === 'len' || fnName === 'length') {
            const arg = this.lowerExpr(expr.args[0]);
            if (arg.type === '%struct.Array*') {
              const lenPtr = this.freshReg();
              this.emit(`${lenPtr} = getelementptr inbounds %struct.Array, %struct.Array* ${arg.name}, i32 0, i32 0`);
              const lenI64 = this.freshReg();
              this.emit(`${lenI64} = load i64, i64* ${lenPtr}, align 8`);
              const dest = this.freshReg();
              this.emit(`${dest} = sitofp i64 ${lenI64} to double`);
              return { type: 'double', name: dest };
            } else {
              const argI8 = this.castToI8Ptr(arg);
              const arrayStruct = this.freshReg();
              this.emit(`${arrayStruct} = bitcast i8* ${argI8} to %struct.Array*`);
              const lenPtr = this.freshReg();
              this.emit(`${lenPtr} = getelementptr inbounds %struct.Array, %struct.Array* ${arrayStruct}, i32 0, i32 0`);
              const lenI64 = this.freshReg();
              this.emit(`${lenI64} = load i64, i64* ${lenPtr}, align 8`);
              const dest = this.freshReg();
              this.emit(`${dest} = sitofp i64 ${lenI64} to double`);
              return { type: 'double', name: dest };
            }
          }

          if (fnName === 'Array_join' || fnName === 'join') {
            const arrVal = this.lowerExpr(expr.args[0]);
            const sepVal = expr.args.length > 1 ? this.convertToStringPtr(this.lowerExpr(expr.args[1])) : 'null';
            let arrPtr = arrVal.name;
            if (arrVal.type !== '%struct.Array*') {
              const cast = this.freshReg();
              const i8Ptr = this.castToI8Ptr(arrVal);
              this.emit(`${cast} = bitcast i8* ${i8Ptr} to %struct.Array*`);
              arrPtr = cast;
            }
            const dest = this.freshReg();
            this.emit(`${dest} = call i8* @_tl_array_join(%struct.Array* ${arrPtr}, i8* ${sepVal})`);
            return { type: 'i8*', name: dest };
          }

          if (fnName === 'Array_push' || (fnName === 'push' && expr.args.length >= 2)) {
            const arrVal = this.lowerExpr(expr.args[0]);
            const elemVal = expr.args.length > 1 ? this.castToI8Ptr(this.lowerExpr(expr.args[1])) : 'null';
            let arrPtr = arrVal.name;
            if (arrVal.type !== '%struct.Array*') {
              const cast = this.freshReg();
              const i8Ptr = this.castToI8Ptr(arrVal);
              this.emit(`${cast} = bitcast i8* ${i8Ptr} to %struct.Array*`);
              arrPtr = cast;
            }
            const dest = this.freshReg();
            this.emit(`${dest} = call %struct.Array* @_tl_array_push(%struct.Array* ${arrPtr}, i8* ${elemVal})`);
            return { type: '%struct.Array*', name: dest };
          }

          // Math builtins
          if (fnName === 'math_sqrt' || fnName === 'Math_sqrt' || fnName === 'sqrt') {
            const arg = this.coerceToDouble(this.lowerExpr(expr.args[0]));
            const dest = this.freshReg();
            this.emit(`${dest} = call double @llvm.sqrt.f64(double ${arg.name})`);
            return { type: 'double', name: dest };
          }

          if (fnName === 'math_pow' || fnName === 'Math_pow' || fnName === 'pow') {
            const a = this.coerceToDouble(this.lowerExpr(expr.args[0]));
            const b = this.coerceToDouble(this.lowerExpr(expr.args[1]));
            const dest = this.freshReg();
            this.emit(`${dest} = call double @llvm.pow.f64(double ${a.name}, double ${b.name})`);
            return { type: 'double', name: dest };
          }

          if (fnName === 'math_abs' || fnName === 'Math_abs' || fnName === 'abs') {
            const arg = this.coerceToDouble(this.lowerExpr(expr.args[0]));
            const dest = this.freshReg();
            this.emit(`${dest} = call double @llvm.fabs.f64(double ${arg.name})`);
            return { type: 'double', name: dest };
          }

          if (fnName === 'math_floor' || fnName === 'Math_floor' || fnName === 'floor') {
            const arg = this.coerceToDouble(this.lowerExpr(expr.args[0]));
            const dest = this.freshReg();
            this.emit(`${dest} = call double @llvm.floor.f64(double ${arg.name})`);
            return { type: 'double', name: dest };
          }

          if (fnName === 'math_ceil' || fnName === 'Math_ceil' || fnName === 'ceil') {
            const arg = this.coerceToDouble(this.lowerExpr(expr.args[0]));
            const dest = this.freshReg();
            this.emit(`${dest} = call double @llvm.ceil.f64(double ${arg.name})`);
            return { type: 'double', name: dest };
          }

          if (fnName === 'math_sin' || fnName === 'Math_sin' || fnName === 'sin') {
            const arg = this.coerceToDouble(this.lowerExpr(expr.args[0]));
            const dest = this.freshReg();
            this.emit(`${dest} = call double @llvm.sin.f64(double ${arg.name})`);
            return { type: 'double', name: dest };
          }

          if (fnName === 'math_cos' || fnName === 'Math_cos' || fnName === 'cos') {
            const arg = this.coerceToDouble(this.lowerExpr(expr.args[0]));
            const dest = this.freshReg();
            this.emit(`${dest} = call double @llvm.cos.f64(double ${arg.name})`);
            return { type: 'double', name: dest };
          }

          // Check if this call is a GADT constructor call
          const ctor = this.gadtConstructorTags.get(fnName) || this.gadtConstructorTags.get(expr.callee.name);
          if (ctor) {
            const argVals = expr.args.map(a => this.lowerExpr(a));
            return this.constructGADT(ctor.tag, argVals);
          }

          // Check if calling a known user-defined function
          let fnInfo = this.functionDefinitions.get(fnName);
          if (!fnInfo && !modHead && this.currentModulePrefix) {
            const scopedName = `${this.currentModulePrefix}_${expr.callee.name}`;
            fnInfo = this.functionDefinitions.get(scopedName);
          }
          if (!fnInfo && !modHead) {
            fnInfo = this.functionDefinitions.get(expr.callee.name);
          }
          if (fnInfo) {
            const sig = fnInfo.sig;
            const evaluatedArgs: LLVMValue[] = [];
            for (let i = 0; i < expr.args.length; i++) {
              const argVal = this.lowerExpr(expr.args[i]);
              const expectedType = sig.paramTypes[i] || argVal.type;
              if (argVal.type !== expectedType) {
                if (expectedType === 'i8*') {
                  const cast = this.castToI8Ptr(argVal);
                  evaluatedArgs.push({ type: 'i8*', name: cast });
                } else if (expectedType === 'double') {
                  evaluatedArgs.push(this.coerceToDouble(argVal));
                } else if (expectedType === 'i1') {
                  evaluatedArgs.push(this.coerceToI1(argVal));
                } else if (expectedType.endsWith('*')) {
                  if (argVal.type === 'i8*') {
                    const cast = this.castFromI8Ptr(argVal.name, expectedType);
                    evaluatedArgs.push({ type: expectedType, name: cast });
                  } else {
                    const ptr = this.castToI8Ptr(argVal);
                    const cast = this.freshReg();
                    this.emit(`${cast} = bitcast i8* ${ptr} to ${expectedType}`);
                    evaluatedArgs.push({ type: expectedType, name: cast });
                  }
                } else {
                  evaluatedArgs.push(argVal);
                }
              } else {
                evaluatedArgs.push(argVal);
              }
            }
            const argsStr = evaluatedArgs.map(a => `${a.type} ${a.name}`).join(', ');
            const dest = this.freshReg();
            if (sig.retType === 'void') {
              this.emit(`call void @${fnInfo.symbol}(${argsStr})`);
              return { type: 'void', name: '' };
            } else {
              this.emit(`${dest} = call ${sig.retType} @${fnInfo.symbol}(${argsStr})`);
              return { type: sig.retType, name: dest };
            }
          }

          // Check local variable function pointer
          const local = this.varAllocaMap.get(fnName) || this.varAllocaMap.get(expr.callee.name);
          if (local) {
            const loadFn = this.freshReg();
            this.emit(`${loadFn} = load ${local.type}, ${local.type}* ${local.reg}, align 8`);
            const evaluatedArgs = expr.args.map(a => this.lowerExpr(a));
            const paramTypes = evaluatedArgs.map(() => 'i8*');
            const castFn = this.freshReg();
            this.emit(`${castFn} = bitcast ${local.type} ${loadFn} to i8* (${paramTypes.join(', ')})*`);
            const castArgs = evaluatedArgs.map(a => {
              if (a.type !== 'i8*') {
                const c = this.castToI8Ptr(a);
                return `i8* ${c}`;
              }
              return `i8* ${a.name}`;
            });
            const dest = this.freshReg();
            this.emit(`${dest} = call i8* ${castFn}(${castArgs.join(', ')})`);
            return { type: 'i8*', name: dest };
          }

          // Fallback external function call
          let extSig = this.externalDeclarations.get(fnName);
          if (!extSig) {
            const evaluatedArgs = expr.args.map(a => this.lowerExpr(a));
            extSig = {
              paramTypes: evaluatedArgs.map(a => (a.type === 'void' ? 'i8*' : a.type)),
              retType: 'double'
            };
            this.externalDeclarations.set(fnName, extSig);
          }

          const evaluatedArgs: LLVMValue[] = [];
          for (let i = 0; i < expr.args.length; i++) {
            const argVal = this.lowerExpr(expr.args[i]);
            const expType = extSig.paramTypes[i] || 'double';
            if (argVal.type !== expType) {
              if (expType === 'double') {
                evaluatedArgs.push(this.coerceToDouble(argVal));
              } else if (expType === 'i8*') {
                evaluatedArgs.push({ type: 'i8*', name: this.castToI8Ptr(argVal) });
              } else if (expType === 'i1') {
                evaluatedArgs.push(this.coerceToI1(argVal));
              } else {
                evaluatedArgs.push(argVal);
              }
            } else {
              evaluatedArgs.push(argVal);
            }
          }

          const argsStr = evaluatedArgs.map(a => `${a.type} ${a.name}`).join(', ');
          const dest = this.freshReg();
          this.emit(`${dest} = call ${extSig.retType} @${fnName}(${argsStr})`);
          return { type: extSig.retType, name: dest };
        }

        // Method call on object/array (e.g. arr.push(x), arr.join(","))
        if (expr.callee.kind === 'e_field_access') {
          const field = expr.callee.field;
          if (field === 'push') {
            const arrVal = this.lowerExpr(expr.callee.object);
            const elemVal = expr.args.length > 0 ? this.castToI8Ptr(this.lowerExpr(expr.args[0])) : 'null';
            let arrPtr = arrVal.name;
            if (arrVal.type !== '%struct.Array*') {
              const cast = this.freshReg();
              const i8Ptr = this.castToI8Ptr(arrVal);
              this.emit(`${cast} = bitcast i8* ${i8Ptr} to %struct.Array*`);
              arrPtr = cast;
            }
            const dest = this.freshReg();
            this.emit(`${dest} = call %struct.Array* @_tl_array_push(%struct.Array* ${arrPtr}, i8* ${elemVal})`);
            return { type: '%struct.Array*', name: dest };
          }
          if (field === 'join') {
            const arrVal = this.lowerExpr(expr.callee.object);
            const sepVal = expr.args.length > 0 ? this.convertToStringPtr(this.lowerExpr(expr.args[0])) : 'null';
            let arrPtr = arrVal.name;
            if (arrVal.type !== '%struct.Array*') {
              const cast = this.freshReg();
              const i8Ptr = this.castToI8Ptr(arrVal);
              this.emit(`${cast} = bitcast i8* ${i8Ptr} to %struct.Array*`);
              arrPtr = cast;
            }
            const dest = this.freshReg();
            this.emit(`${dest} = call i8* @_tl_array_join(%struct.Array* ${arrPtr}, i8* ${sepVal})`);
            return { type: 'i8*', name: dest };
          }
        }

        // Callee is a general expression
        const calleeVal = this.lowerExpr(expr.callee);
        const evaluatedArgs = expr.args.map(a => this.lowerExpr(a));
        const paramTypes = evaluatedArgs.map(() => 'i8*');
        const castFn = this.freshReg();
        this.emit(`${castFn} = bitcast ${calleeVal.type} ${calleeVal.name} to i8* (${paramTypes.join(', ')})*`);
        const castArgs = evaluatedArgs.map(a => {
          if (a.type !== 'i8*') {
            const c = this.castToI8Ptr(a);
            return `i8* ${c}`;
          }
          return `i8* ${a.name}`;
        });
        const dest = this.freshReg();
        this.emit(`${dest} = call i8* ${castFn}(${castArgs.join(', ')})`);
        return { type: 'i8*', name: dest };
      }

      case 'e_lambda': {
        const lambdaName = `.lambda_${++this.lambdaCounter}`;
        const lambdaCode = this.generateLambda(lambdaName, expr);
        this.extraFunctionsCode.push(lambdaCode);
        const paramTypes = expr.params.map(() => 'i8*');
        const fnType = `i8* (${paramTypes.join(', ')})*`;
        const castReg = this.freshReg();
        this.emit(`${castReg} = bitcast ${fnType} @${lambdaName} to i8*`);
        return { type: 'i8*', name: castReg };
      }

      case 'e_if': {
        const condVal = this.coerceToI1(this.lowerExpr(expr.cond));
        const thenLabel = this.freshBlock('then');
        const elseLabel = this.freshBlock('else');
        const mergeLabel = this.freshBlock('if.merge');

        this.emitCondBranch(condVal.name, thenLabel, elseLabel);

        // Then branch
        this.startBlock(thenLabel);
        const thenVal = this.lowerExpr(expr.thenExpr);
        const thenEndBlock = this.currentBlock!.name;

        // Else branch
        this.startBlock(elseLabel);
        const elseVal = expr.elseExpr ? this.lowerExpr(expr.elseExpr) : { type: 'void', name: '' };
        const elseEndBlock = this.currentBlock!.name;

        if (thenVal.type === 'void' || !expr.elseExpr || elseVal.type === 'void') {
          this.startBlock(thenEndBlock);
          this.emitBranch(mergeLabel);

          this.startBlock(elseEndBlock);
          this.emitBranch(mergeLabel);

          this.startBlock(mergeLabel);
          return { type: 'void', name: '' };
        }

        // Determine unified type
        let unifiedType = thenVal.type;
        if (thenVal.type !== elseVal.type) {
          if ((thenVal.type === 'double' && (elseVal.type === 'i32' || elseVal.type === 'i64')) ||
              (elseVal.type === 'double' && (thenVal.type === 'i32' || thenVal.type === 'i64'))) {
            unifiedType = 'double';
          } else {
            unifiedType = 'i8*';
          }
        }

        // Finalize then block
        this.startBlock(thenEndBlock);
        const finalThen = this.coerceToType(thenVal, unifiedType);
        this.emitBranch(mergeLabel);
        const actualThenBlock = this.currentBlock!.name;

        // Finalize else block
        this.startBlock(elseEndBlock);
        const finalElse = this.coerceToType(elseVal, unifiedType);
        this.emitBranch(mergeLabel);
        const actualElseBlock = this.currentBlock!.name;

        // Merge block
        this.startBlock(mergeLabel);
        const phiReg = this.freshReg();
        this.emit(`${phiReg} = phi ${unifiedType} [ ${finalThen.name}, %${actualThenBlock} ], [ ${finalElse.name}, %${actualElseBlock} ]`);
        return { type: unifiedType, name: phiReg };
      }

      case 'e_block': {
        let lastVal: LLVMValue = { type: 'void', name: '' };
        for (const s of expr.statements) {
          if (s.kind === 's_expr') {
            lastVal = this.lowerExpr(s.expr);
            if (s.expr.kind === 'e_return') {
              return lastVal;
            }
          } else {
            this.lowerTopLevelStatement(s);
          }
        }
        if (expr.result) {
          return this.lowerExpr(expr.result);
        }
        return lastVal;
      }

      case 'e_match': {
        const scrutinee = this.lowerExpr(expr.scrutinee);
        const defaultLabel = this.freshBlock('match.default');
        const mergeLabel = this.freshBlock('match.merge');

        let gadtPtr = scrutinee.name;
        const isPtr = scrutinee.type === '%struct.GADTValue*' || scrutinee.type.endsWith('*') || scrutinee.type === 'i8*';
        if (isPtr && scrutinee.type !== '%struct.GADTValue*') {
          const cast = this.freshReg();
          const i8Ptr = this.castToI8Ptr(scrutinee);
          this.emit(`${cast} = bitcast i8* ${i8Ptr} to %struct.GADTValue*`);
          gadtPtr = cast;
        }

        let tagReg = this.freshReg();
        if (isPtr) {
          const tagPtr = this.freshReg();
          this.emit(`${tagPtr} = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* ${gadtPtr}, i32 0, i32 0`);
          this.emit(`${tagReg} = load i32, i32* ${tagPtr}, align 4`);
        } else {
          tagReg = '0';
        }

        const armLabels = expr.arms.map((_, i) => this.freshBlock(`match.arm${i}`));
        const seenTags = new Set<number>();
        const caseEntries: string[] = [];
        let defaultArmLabel = defaultLabel;

        expr.arms.forEach((arm, i) => {
          if (arm.pattern.kind === 'p_ctor') {
            const info = this.gadtConstructorTags.get(arm.pattern.name);
            const tag = info ? info.tag : i;
            if (!seenTags.has(tag)) {
              seenTags.add(tag);
              caseEntries.push(`i32 ${tag}, label %${armLabels[i]}`);
            }
          } else if (arm.pattern.kind === 'p_wildcard' || arm.pattern.kind === 'p_var') {
            defaultArmLabel = armLabels[i];
          } else {
            if (!seenTags.has(i)) {
              seenTags.add(i);
              caseEntries.push(`i32 ${i}, label %${armLabels[i]}`);
            }
          }
        });

        if (!this.currentBlock!.terminated) {
          this.currentBlock!.instructions.push(`  switch i32 ${tagReg}, label %${defaultArmLabel} [ ${caseEntries.join(' ')} ]`);
          this.currentBlock!.terminated = true;
        }

        const rawArmResults: { armIndex: number; blockName: string; val: LLVMValue }[] = [];

        expr.arms.forEach((arm, i) => {
          this.startBlock(armLabels[i]);

          if (arm.pattern.kind === 'p_ctor' && arm.pattern.args && arm.pattern.args.length > 0 && isPtr) {
            const payloadField = this.freshReg();
            this.emit(`${payloadField} = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* ${gadtPtr}, i32 0, i32 1`);
            const payloadBuf = this.freshReg();
            this.emit(`${payloadBuf} = load i8*, i8** ${payloadField}, align 8`);

            arm.pattern.args.forEach((param, pIdx) => {
              if (param.kind === 'p_var') {
                const slotPtr = this.freshReg();
                this.emit(`${slotPtr} = getelementptr inbounds i8, i8* ${payloadBuf}, i64 ${pIdx * 8}`);
                const slotCast = this.freshReg();
                this.emit(`${slotCast} = bitcast i8* ${slotPtr} to i8**`);
                const loadedVal = this.freshReg();
                this.emit(`${loadedVal} = load i8*, i8** ${slotCast}, align 8`);

                const varAlloca = this.freshReg();
                this.emitAlloca(`${varAlloca} = alloca i8*, align 8`);
                this.emit(`store i8* ${loadedVal}, i8** ${varAlloca}, align 8`);
                this.varAllocaMap.set(param.name, { type: 'i8*', reg: varAlloca });
              }
            });
          }

          const resVal = this.lowerExpr(arm.body);
          rawArmResults.push({ armIndex: i, blockName: this.currentBlock!.name, val: resVal });
        });

        // Default block if unhandled
        if (defaultArmLabel === defaultLabel) {
          this.startBlock(defaultLabel);
          rawArmResults.push({ armIndex: -1, blockName: defaultLabel, val: { type: 'i8*', name: 'null' } });
        }

        // Determine unified type
        const nonVoid = rawArmResults.filter(r => r.val.type !== 'void');
        if (nonVoid.length === 0) {
          rawArmResults.forEach(r => {
            this.startBlock(r.blockName);
            this.emitBranch(mergeLabel);
          });
          this.startBlock(mergeLabel);
          return { type: 'void', name: '' };
        }

        let unifiedType = 'i8*';
        const hasDouble = nonVoid.some(r => r.val.type === 'double');
        const hasI1 = nonVoid.some(r => r.val.type === 'i1');
        const hasArray = nonVoid.some(r => r.val.type === '%struct.Array*');
        const hasGADT = nonVoid.some(r => r.val.type === '%struct.GADTValue*');

        if (hasDouble) {
          unifiedType = 'double';
        } else if (hasI1) {
          unifiedType = 'i1';
        } else if (hasArray) {
          unifiedType = '%struct.Array*';
        } else if (hasGADT) {
          unifiedType = '%struct.GADTValue*';
        } else {
          unifiedType = 'i8*';
        }

        const phiIncoming: { label: string; valName: string }[] = [];
        rawArmResults.forEach(r => {
          this.startBlock(r.blockName);
          const coerced = this.coerceToType(r.val, unifiedType);
          this.emitBranch(mergeLabel);
          phiIncoming.push({ label: this.currentBlock!.name, valName: coerced.name });
        });

        this.startBlock(mergeLabel);
        const resultReg = this.freshReg();
        const phiPairs = phiIncoming.map(p => `[ ${p.valName}, %${p.label} ]`).join(', ');
        this.emit(`${resultReg} = phi ${unifiedType} ${phiPairs}`);
        return { type: unifiedType, name: resultReg };
      }

      case 'e_record': {
        const len = expr.fields.length;
        const totalBytes = 8 + len * 16;
        const ptr = this.freshReg();
        this.emit(`${ptr} = call i8* @malloc(i64 ${totalBytes})`);
        const lenCast = this.freshReg();
        this.emit(`${lenCast} = bitcast i8* ${ptr} to i64*`);
        this.emit(`store i64 ${len}, i64* ${lenCast}, align 8`);

        for (let i = 0; i < len; i++) {
          const field = expr.fields[i];
          const keySym = this.registerString(field.name);
          const keyByteLen = new TextEncoder().encode(field.name).length + 1;
          const keyReg = this.freshReg();
          this.emit(`${keyReg} = getelementptr inbounds [${keyByteLen} x i8], [${keyByteLen} x i8]* ${keySym}, i64 0, i64 0`);

          const val = this.lowerExpr(field.value);
          const valI8 = this.castToI8Ptr(val);

          const keySlot = this.freshReg();
          this.emit(`${keySlot} = getelementptr inbounds i8, i8* ${ptr}, i64 ${8 + i * 16}`);
          const keySlotCast = this.freshReg();
          this.emit(`${keySlotCast} = bitcast i8* ${keySlot} to i8**`);
          this.emit(`store i8* ${keyReg}, i8** ${keySlotCast}, align 8`);

          const valSlot = this.freshReg();
          this.emit(`${valSlot} = getelementptr inbounds i8, i8* ${ptr}, i64 ${16 + i * 16}`);
          const valSlotCast = this.freshReg();
          this.emit(`${valSlotCast} = bitcast i8* ${valSlot} to i8**`);
          this.emit(`store i8* ${valI8}, i8** ${valSlotCast}, align 8`);
        }
        return { type: 'i8*', name: ptr };
      }

      case 'e_tuple': {
        const len = expr.elements.length;
        const rawMalloc = this.freshReg();
        this.emit(`${rawMalloc} = call i8* @malloc(i64 16)`);
        const structPtr = this.freshReg();
        this.emit(`${structPtr} = bitcast i8* ${rawMalloc} to %struct.Array*`);

        // Store length
        const lenPtr = this.freshReg();
        this.emit(`${lenPtr} = getelementptr inbounds %struct.Array, %struct.Array* ${structPtr}, i32 0, i32 0`);
        this.emit(`store i64 ${len}, i64* ${lenPtr}, align 8`);

        // Allocate buffer
        const bufSize = Math.max(16, len * 8);
        const bufMalloc = this.freshReg();
        this.emit(`${bufMalloc} = call i8* @malloc(i64 ${bufSize})`);

        for (let i = 0; i < len; i++) {
          const elVal = this.lowerExpr(expr.elements[i]);
          const elI8 = this.castToI8Ptr(elVal);
          const slotPtr = this.freshReg();
          this.emit(`${slotPtr} = getelementptr inbounds i8, i8* ${bufMalloc}, i64 ${i * 8}`);
          const slotCast = this.freshReg();
          this.emit(`${slotCast} = bitcast i8* ${slotPtr} to i8**`);
          this.emit(`store i8* ${elI8}, i8** ${slotCast}, align 8`);
        }

        const dataFieldPtr = this.freshReg();
        this.emit(`${dataFieldPtr} = getelementptr inbounds %struct.Array, %struct.Array* ${structPtr}, i32 0, i32 1`);
        const dataBufCast = this.freshReg();
        this.emit(`${dataBufCast} = bitcast i8* ${bufMalloc} to i8**`);
        this.emit(`store i8** ${dataBufCast}, i8*** ${dataFieldPtr}, align 8`);

        return { type: '%struct.Array*', name: structPtr };
      }

      case 'e_index': {
        const targetVal = this.lowerExpr(expr.target);
        const idxVal = this.lowerExpr(expr.index);
        const idxI64 = this.freshReg();
        if (idxVal.type === 'double') {
          this.emit(`${idxI64} = fptosi double ${idxVal.name} to i64`);
        } else if (idxVal.type === 'i32') {
          this.emit(`${idxI64} = sext i32 ${idxVal.name} to i64`);
        } else if (idxVal.type === 'i64') {
          this.emit(`${idxI64} = add i64 ${idxVal.name}, 0`);
        } else {
          this.emit(`${idxI64} = add i64 0, 0`);
        }

        if (targetVal.type === '%struct.Array*' || targetVal.type.endsWith('*') || targetVal.type === 'i8*') {
          const arrPtr = targetVal.type === '%struct.Array*' ? targetVal.name : (() => {
            const ptr = this.castToI8Ptr(targetVal);
            const r = this.freshReg();
            this.emit(`${r} = bitcast i8* ${ptr} to %struct.Array*`);
            return r;
          })();
          const dataPtrField = this.freshReg();
          this.emit(`${dataPtrField} = getelementptr inbounds %struct.Array, %struct.Array* ${arrPtr}, i32 0, i32 1`);
          const dataBuf = this.freshReg();
          this.emit(`${dataBuf} = load i8**, i8*** ${dataPtrField}, align 8`);
          const elemSlot = this.freshReg();
          this.emit(`${elemSlot} = getelementptr inbounds i8*, i8** ${dataBuf}, i64 ${idxI64}`);
          const elemI8 = this.freshReg();
          this.emit(`${elemI8} = load i8*, i8** ${elemSlot}, align 8`);
          return { type: 'i8*', name: elemI8 };
        }

        return { type: 'double', name: '0.0' };
      }

      case 'e_field_access': {
        const targetVal = this.lowerExpr(expr.object);
        if (expr.field === 'length' || expr.field === 'len') {
          if (targetVal.type.endsWith('*') || targetVal.type === 'i8*') {
            const arrPtr = targetVal.type === '%struct.Array*' ? targetVal.name : (() => {
              const ptr = this.castToI8Ptr(targetVal);
              const r = this.freshReg();
              this.emit(`${r} = bitcast i8* ${ptr} to %struct.Array*`);
              return r;
            })();
            const lenPtr = this.freshReg();
            this.emit(`${lenPtr} = getelementptr inbounds %struct.Array, %struct.Array* ${arrPtr}, i32 0, i32 0`);
            const lenI64 = this.freshReg();
            this.emit(`${lenI64} = load i64, i64* ${lenPtr}, align 8`);
            const dest = this.freshReg();
            this.emit(`${dest} = sitofp i64 ${lenI64} to double`);
            return { type: 'double', name: dest };
          }
          return { type: 'double', name: '0.0' };
        }

        const recPtr = this.castToI8Ptr(targetVal);
        const fieldSym = this.registerString(expr.field);
        const fieldByteLen = new TextEncoder().encode(expr.field).length + 1;
        const fieldReg = this.freshReg();
        this.emit(`${fieldReg} = getelementptr inbounds [${fieldByteLen} x i8], [${fieldByteLen} x i8]* ${fieldSym}, i64 0, i64 0`);
        const dest = this.freshReg();
        this.emit(`${dest} = call i8* @_tl_record_get(i8* ${recPtr}, i8* ${fieldReg})`);
        return { type: 'i8*', name: dest };
      }

      case 'e_assign': {
        if (expr.target.kind === 'e_var') {
          const varName = expr.target.name;
          let local = this.varAllocaMap.get(varName);
          const rhs = this.lowerExpr(expr.value);
          let globalInfo = !local ? (this.globalVariables.get(varName) || (this.currentModulePrefix ? this.globalVariables.get(`${this.currentModulePrefix}_${varName}`) : undefined)) : undefined;

          if (!local && !globalInfo) {
            const allocaType = rhs.type === 'void' ? 'double' : rhs.type;
            const allocaReg = this.freshReg();
            this.emitAlloca(`${allocaReg} = alloca ${allocaType}, align 8`);
            local = { type: allocaType, reg: allocaReg };
            this.varAllocaMap.set(varName, local);
          }

          let finalVal = rhs;
          if (expr.op && expr.op !== '=') {
            const currentVal = this.lowerExpr(expr.target);
            const opSym = expr.op[0];
            const dest = this.freshReg();
            const cDbl = this.coerceToDouble(currentVal);
            const rDbl = this.coerceToDouble(rhs);
            if (opSym === '+') {
              this.emit(`${dest} = fadd double ${cDbl.name}, ${rDbl.name}`);
            } else if (opSym === '-') {
              this.emit(`${dest} = fsub double ${cDbl.name}, ${rDbl.name}`);
            } else if (opSym === '*') {
              this.emit(`${dest} = fmul double ${cDbl.name}, ${rDbl.name}`);
            } else if (opSym === '/') {
              this.emit(`${dest} = fdiv double ${cDbl.name}, ${rDbl.name}`);
            }
            finalVal = { type: 'double', name: dest };
          }

          if (globalInfo) {
            const coerced = this.coerceToType(finalVal, globalInfo.type);
            this.emit(`store ${globalInfo.type} ${coerced.name}, ${globalInfo.type}* @${globalInfo.symbol}, align 8`);
            return finalVal;
          }

          if (local) {
            if (finalVal.type !== local.type) {
              if (local.type === 'i8*') {
                const c = this.castToI8Ptr(finalVal);
                this.emit(`store i8* ${c}, i8** ${local.reg}, align 8`);
              } else if (finalVal.type === 'i8*') {
                const c = this.castFromI8Ptr(finalVal.name, local.type);
                this.emit(`store ${local.type} ${c}, ${local.type}* ${local.reg}, align 8`);
              } else if (local.type === 'double') {
                const c = this.coerceToDouble(finalVal);
                this.emit(`store double ${c.name}, double* ${local.reg}, align 8`);
              } else if (local.type === 'i1') {
                const c = this.coerceToI1(finalVal);
                this.emit(`store i1 ${c.name}, i1* ${local.reg}, align 8`);
              } else if (local.type.endsWith('*')) {
                const ptr = this.castToI8Ptr(finalVal);
                const cast = this.freshReg();
                this.emit(`${cast} = bitcast i8* ${ptr} to ${local.type}`);
                this.emit(`store ${local.type} ${cast}, ${local.type}* ${local.reg}, align 8`);
              } else {
                this.emit(`store ${local.type} ${finalVal.name}, ${local.type}* ${local.reg}, align 8`);
              }
            } else {
              this.emit(`store ${local.type} ${finalVal.name}, ${local.type}* ${local.reg}, align 8`);
            }
          }
          return finalVal;
        } else if (expr.target.kind === 'e_index') {
          const targetVal = this.lowerExpr(expr.target.target);
          const idxVal = this.lowerExpr(expr.target.index);
          const rhs = this.lowerExpr(expr.value);
          const rhsI8 = this.castToI8Ptr(rhs);

          const idxI64 = this.freshReg();
          if (idxVal.type === 'double') {
            this.emit(`${idxI64} = fptosi double ${idxVal.name} to i64`);
          } else if (idxVal.type === 'i32') {
            this.emit(`${idxI64} = sext i32 ${idxVal.name} to i64`);
          } else if (idxVal.type === 'i64') {
            this.emit(`${idxI64} = add i64 ${idxVal.name}, 0`);
          } else {
            this.emit(`${idxI64} = add i64 0, 0`);
          }

          if (targetVal.type === '%struct.Array*' || targetVal.type.endsWith('*') || targetVal.type === 'i8*') {
            const arrPtr = targetVal.type === '%struct.Array*' ? targetVal.name : (() => {
              const ptr = this.castToI8Ptr(targetVal);
              const r = this.freshReg();
              this.emit(`${r} = bitcast i8* ${ptr} to %struct.Array*`);
              return r;
            })();

            const dataPtrField = this.freshReg();
            this.emit(`${dataPtrField} = getelementptr inbounds %struct.Array, %struct.Array* ${arrPtr}, i32 0, i32 1`);
            const dataBuf = this.freshReg();
            this.emit(`${dataBuf} = load i8**, i8*** ${dataPtrField}, align 8`);
            const elemSlot = this.freshReg();
            this.emit(`${elemSlot} = getelementptr inbounds i8*, i8** ${dataBuf}, i64 ${idxI64}`);
            this.emit(`store i8* ${rhsI8}, i8** ${elemSlot}, align 8`);
          }

          return rhs;
        }
        return { type: 'void', name: '' };
      }

      case 'e_switch': {
        const discr = this.lowerExpr(expr.discriminant);
        const mergeLabel = this.freshBlock('switch.merge');
        const vals: { val: LLVMValue; block: string }[] = [];

        let currentCondBlock = this.freshBlock('switch.cond');
        this.emitBranch(currentCondBlock);

        for (let i = 0; i < expr.cases.length; i++) {
          const c = expr.cases[i];
          const bodyBlock = this.freshBlock(`switch.body${i}`);
          const nextCaseCondBlock = this.freshBlock(`switch.case_next${i+1}`);
          const caseVals = c.values && c.values.length > 0 ? c.values : (c.value ? [c.value] : []);

          let innerCondBlock = currentCondBlock;
          for (let vIdx = 0; vIdx < caseVals.length; vIdx++) {
            this.startBlock(innerCondBlock);
            const caseVal = this.lowerExpr(caseVals[vIdx]);
            const cmpReg = this.freshReg();

            if (discr.type.endsWith('*') && caseVal.type.endsWith('*')) {
              const dP = this.castToI8Ptr(discr);
              const cP = this.castToI8Ptr(caseVal);
              this.emit(`${cmpReg} = icmp eq i8* ${dP}, ${cP}`);
            } else {
              const dDbl = this.coerceToDouble(discr);
              const cDbl = this.coerceToDouble(caseVal);
              this.emit(`${cmpReg} = fcmp oeq double ${dDbl.name}, ${cDbl.name}`);
            }

            const nextTryBlock = (vIdx + 1 < caseVals.length) 
              ? this.freshBlock(`switch.or${i}_${vIdx+1}`)
              : nextCaseCondBlock;

            this.emitCondBranch(cmpReg, bodyBlock, nextTryBlock);
            innerCondBlock = nextTryBlock;
          }

          this.startBlock(bodyBlock);
          const res = this.lowerExpr(c.body);
          vals.push({ val: res, block: this.currentBlock!.name });

          currentCondBlock = nextCaseCondBlock;
        }

        this.startBlock(currentCondBlock);
        if (expr.defaultCase) {
          const res = this.lowerExpr(expr.defaultCase);
          vals.push({ val: res, block: this.currentBlock!.name });
        } else {
          vals.push({ val: { type: 'void', name: '' }, block: this.currentBlock!.name });
        }

        const validVals = vals.filter(v => v.val.type !== 'void');
        if (validVals.length === 0) {
           for (const v of vals) {
              this.startBlock(v.block);
              this.emitBranch(mergeLabel);
           }
           this.startBlock(mergeLabel);
           return { type: 'void', name: '' };
        }

        let unifiedType = validVals[0].val.type;
        for (const v of validVals) {
          if (v.val.type !== unifiedType) {
            if (v.val.type === 'double' || unifiedType === 'double') unifiedType = 'double';
            else if (v.val.type === 'i1' || unifiedType === 'i1') unifiedType = 'i1';
            else unifiedType = 'i8*';
          }
        }

        const phiEntries: string[] = [];
        for (const v of vals) {
          this.startBlock(v.block);
          if (v.val.type === 'void') {
            this.emitBranch(mergeLabel);
            continue;
          }
          const coerced = this.coerceToType(v.val, unifiedType);
          this.emitBranch(mergeLabel);
          phiEntries.push(`[ ${coerced.name}, %${this.currentBlock!.name} ]`);
        }
        this.startBlock(mergeLabel);
        
        if (phiEntries.length > 0) {
           const phiReg = this.freshReg();
           this.emit(`${phiReg} = phi ${unifiedType} ${phiEntries.join(', ')}`);
           return { type: unifiedType, name: phiReg };
        }
        return { type: 'void', name: '' };
      }

      case 'e_range': {
        const startVal = this.lowerExpr(expr.start);
        const endVal = this.lowerExpr(expr.end);

        const startI64 = this.freshReg();
        if (startVal.type === 'double') {
          this.emit(`${startI64} = fptosi double ${startVal.name} to i64`);
        } else {
          this.emit(`${startI64} = add i64 0, 0`);
        }

        const endI64 = this.freshReg();
        if (endVal.type === 'double') {
          this.emit(`${endI64} = fptosi double ${endVal.name} to i64`);
        } else {
          this.emit(`${endI64} = add i64 0, 0`);
        }

        const isLe = this.freshReg();
        this.emit(`${isLe} = icmp sle i64 ${startI64}, ${endI64}`);

        const limitLeVal = this.freshReg();
        if (expr.inclusive) {
          this.emit(`${limitLeVal} = add i64 ${endI64}, 0`);
        } else {
          this.emit(`${limitLeVal} = sub i64 ${endI64}, 1`);
        }

        const limitGtVal = this.freshReg();
        if (expr.inclusive) {
          this.emit(`${limitGtVal} = add i64 ${endI64}, 0`);
        } else {
          this.emit(`${limitGtVal} = add i64 ${endI64}, 1`);
        }

        const limitI64 = this.freshReg();
        this.emit(`${limitI64} = select i1 ${isLe}, i64 ${limitLeVal}, i64 ${limitGtVal}`);

        const diffLe = this.freshReg();
        this.emit(`${diffLe} = sub i64 ${limitI64}, ${startI64}`);
        const countLeVal = this.freshReg();
        this.emit(`${countLeVal} = add i64 ${diffLe}, 1`);
        const validLe = this.freshReg();
        this.emit(`${validLe} = icmp sge i64 ${limitI64}, ${startI64}`);
        const countLe = this.freshReg();
        this.emit(`${countLe} = select i1 ${validLe}, i64 ${countLeVal}, i64 0`);

        const diffGt = this.freshReg();
        this.emit(`${diffGt} = sub i64 ${startI64}, ${limitI64}`);
        const countGtVal = this.freshReg();
        this.emit(`${countGtVal} = add i64 ${diffGt}, 1`);
        const validGt = this.freshReg();
        this.emit(`${validGt} = icmp sle i64 ${limitI64}, ${startI64}`);
        const countGt = this.freshReg();
        this.emit(`${countGt} = select i1 ${validGt}, i64 ${countGtVal}, i64 0`);

        const countI64 = this.freshReg();
        this.emit(`${countI64} = select i1 ${isLe}, i64 ${countLe}, i64 ${countGt}`);

        // Allocate struct Array
        const rawMalloc = this.freshReg();
        this.emit(`${rawMalloc} = call i8* @malloc(i64 16)`);
        const structPtr = this.freshReg();
        this.emit(`${structPtr} = bitcast i8* ${rawMalloc} to %struct.Array*`);

        const lenPtr = this.freshReg();
        this.emit(`${lenPtr} = getelementptr inbounds %struct.Array, %struct.Array* ${structPtr}, i32 0, i32 0`);
        this.emit(`store i64 ${countI64}, i64* ${lenPtr}, align 8`);

        const bufBytes = this.freshReg();
        this.emit(`${bufBytes} = mul i64 ${countI64}, 8`);
        const safeBufBytes = this.freshReg();
        const isZeroBytes = this.freshReg();
        this.emit(`${isZeroBytes} = icmp eq i64 ${bufBytes}, 0`);
        this.emit(`${safeBufBytes} = select i1 ${isZeroBytes}, i64 16, i64 ${bufBytes}`);

        const bufMalloc = this.freshReg();
        this.emit(`${bufMalloc} = call i8* @malloc(i64 ${safeBufBytes})`);

        const dataFieldPtr = this.freshReg();
        this.emit(`${dataFieldPtr} = getelementptr inbounds %struct.Array, %struct.Array* ${structPtr}, i32 0, i32 1`);
        const dataBufCast = this.freshReg();
        this.emit(`${dataBufCast} = bitcast i8* ${bufMalloc} to i8**`);
        this.emit(`store i8** ${dataBufCast}, i8*** ${dataFieldPtr}, align 8`);

        return { type: '%struct.Array*', name: structPtr };
      }

      case 'e_list_comp': {
        // Fallback for LLVM backend, list comprehensions not fully supported yet in SSA IR
        return { type: '%struct.Array*', name: 'null' };
      }

      case 'e_for': {
        const loopInit = expr.init;
        const loopCond = expr.cond;
        const loopStep = expr.update;
        const body = expr.body;

        if (loopInit) {
          if ('kind' in loopInit && typeof loopInit.kind === 'string' && loopInit.kind.startsWith('s_')) {
            this.lowerTopLevelStatement(loopInit as Statement);
          } else {
            this.lowerExpr(loopInit as Expr);
          }
        }

        const condBlock = this.freshBlock('for.cond');
        const bodyBlock = this.freshBlock('for.body');
        const mergeBlock = this.freshBlock('for.merge');

        this.emitBranch(condBlock);
        this.startBlock(condBlock);

        if (loopCond) {
          const condVal = this.coerceToI1(this.lowerExpr(loopCond));
          this.emitCondBranch(condVal.name, bodyBlock, mergeBlock);
        } else {
          this.emitBranch(bodyBlock);
        }

        this.startBlock(bodyBlock);
        this.lowerExpr(body);

        if (loopStep) {
          this.lowerExpr(loopStep);
        }

        this.emitBranch(condBlock);
        this.startBlock(mergeBlock);

        return { type: 'void', name: '' };
      }

      case 'e_while': {
        const condBlock = this.freshBlock('while.cond');
        const bodyBlock = this.freshBlock('while.body');
        const mergeBlock = this.freshBlock('while.merge');

        this.emitBranch(condBlock);
        this.startBlock(condBlock);
        const condVal = this.coerceToI1(this.lowerExpr(expr.cond));
        this.emitCondBranch(condVal.name, bodyBlock, mergeBlock);

        this.startBlock(bodyBlock);
        this.lowerExpr(expr.body);
        this.emitBranch(condBlock);

        this.startBlock(mergeBlock);
        return { type: 'void', name: '' };
      }

      case 'e_return': {
        const retSub = (expr as any).value || (expr as any).expr;
        if (retSub) {
          return this.lowerExpr(retSub);
        }
        return { type: 'void', name: '' };
      }

      default:
        return { type: 'double', name: '0.0' };
    }
  }

  private generateLambda(name: string, expr: ELambda): string {
    const savedBlocks = this.blocks;
    const savedCurrent = this.currentBlock;
    const savedVarAlloca = new Map(this.varAllocaMap);
    const savedAllocas = [...this.entryAllocas];

    this.blocks = [];
    this.currentBlock = null;
    this.entryAllocas = [];
    this.varAllocaMap.clear();

    const paramList: string[] = expr.params.map(p => `i8* %arg.${p.name}`);
    const lines: string[] = [`define internal i8* @${name}(${paramList.join(', ')}) {`];

    this.startBlock('entry');

    for (const p of expr.params) {
      const targetType = this.llvmTypeFromAST(p.type);
      const allocaReg = this.freshReg();
      this.emitAlloca(`${allocaReg} = alloca ${targetType}, align 8`);
      if (targetType === 'i8*') {
        this.emit(`store i8* %arg.${p.name}, i8** ${allocaReg}, align 8`);
      } else {
        const castVal = this.castFromI8Ptr(`%arg.${p.name}`, targetType);
        this.emit(`store ${targetType} ${castVal}, ${targetType}* ${allocaReg}, align 8`);
      }
      this.varAllocaMap.set(p.name, { type: targetType, reg: allocaReg });
    }

    const bodyVal = this.lowerExpr(expr.body);
    const retName = this.castToI8Ptr(bodyVal);
    this.emitRet('i8*', retName);
    this.finalizeBlocks('i8*');

    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      lines.push(`${block.name}:`);
      if (i === 0 && this.entryAllocas.length > 0) {
        lines.push(...this.entryAllocas);
      }
      lines.push(...block.instructions);
    }
    lines.push('}\n');

    this.blocks = savedBlocks;
    this.currentBlock = savedCurrent;
    this.varAllocaMap = savedVarAlloca;
    this.entryAllocas = savedAllocas;

    return lines.join('\n');
  }

  private constructGADT(tag: number, args: LLVMValue[]): LLVMValue {
    const rawMalloc = this.freshReg();
    this.emit(`${rawMalloc} = call i8* @malloc(i64 16)`);
    const structPtr = this.freshReg();
    this.emit(`${structPtr} = bitcast i8* ${rawMalloc} to %struct.GADTValue*`);

    // Store tag
    const tagPtr = this.freshReg();
    this.emit(`${tagPtr} = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* ${structPtr}, i32 0, i32 0`);
    this.emit(`store i32 ${tag}, i32* ${tagPtr}, align 4`);

    if (args.length > 0) {
      const payloadSize = args.length * 8;
      const payloadMalloc = this.freshReg();
      this.emit(`${payloadMalloc} = call i8* @malloc(i64 ${payloadSize})`);

      for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const argI8 = this.castToI8Ptr(arg);
        const slotPtr = this.freshReg();
        this.emit(`${slotPtr} = getelementptr inbounds i8, i8* ${payloadMalloc}, i64 ${i * 8}`);
        const slotCast = this.freshReg();
        this.emit(`${slotCast} = bitcast i8* ${slotPtr} to i8**`);
        this.emit(`store i8* ${argI8}, i8** ${slotCast}, align 8`);
      }

      const payloadFieldPtr = this.freshReg();
      this.emit(`${payloadFieldPtr} = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* ${structPtr}, i32 0, i32 1`);
      this.emit(`store i8* ${payloadMalloc}, i8** ${payloadFieldPtr}, align 8`);
    } else {
      const payloadFieldPtr = this.freshReg();
      this.emit(`${payloadFieldPtr} = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* ${structPtr}, i32 0, i32 1`);
      this.emit(`store i8* null, i8** ${payloadFieldPtr}, align 8`);
    }

    return { type: '%struct.GADTValue*', name: structPtr };
  }
}
