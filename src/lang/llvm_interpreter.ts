/**
 * In-Browser LLVM IR SSA Execution Engine & Interpreter
 *
 * Implements client-side compilation and execution for LLVM IR textual code (.ll),
 * providing SSA basic block traversal, phi resolution, alloca/heap memory slots,
 * GADT struct manipulation, function pointers, and full libc, math, & virtual DOM runtime emulation.
 */

export interface LLVMExecutionResult {
  stdout: string[];
  exitCode: number;
  executionTimeMs: number;
  error?: string;
}

interface LLVMFunctionDef {
  name: string;
  retType: string;
  isInternal: boolean;
  params: { type: string; name: string }[];
  blocks: Map<string, string[]>;
  blockOrder: string[];
}

interface StackFrame {
  functionName: string;
  locals: Map<string, any>;
  allocas: Map<string, any>;
}

export class LLVMInterpreter {
  private globals: Map<string, any> = new Map();
  private stringConstants: Map<string, string> = new Map();
  private functions: Map<string, LLVMFunctionDef> = new Map();
  private heap: Map<number, any> = new Map();
  private nextHeapPtr = 1000;
  private stdout: string[] = [];
  private currentStdoutBuffer: string = '';

  constructor() {}

  public execute(llvmCode: string): LLVMExecutionResult {
    const startTime = performance.now();
    this.globals.clear();
    this.stringConstants.clear();
    this.functions.clear();
    this.heap.clear();
    this.nextHeapPtr = 1000;
    this.stdout = [];
    this.currentStdoutBuffer = '';

    try {
      this.parseModule(llvmCode);

      // Check for main entry point
      let mainFn = this.functions.get('main');
      if (!mainFn) {
        // Find any function ending with 'main'
        for (const [k, v] of this.functions.entries()) {
          if (k === 'main' || k.endsWith('_main')) {
            mainFn = v;
            break;
          }
        }
      }

      if (!mainFn) {
        throw new Error('Entry point "@main" not found in LLVM module.');
      }

      // Execute @main
      const exitVal = this.callFunction(mainFn.name, []);
      const exitCode = typeof exitVal === 'number' ? Math.floor(exitVal) : 0;

      // Flush remaining stdout
      if (this.currentStdoutBuffer.length > 0) {
        this.stdout.push(this.currentStdoutBuffer);
        this.currentStdoutBuffer = '';
      }

      const endTime = performance.now();
      return {
        stdout: this.stdout,
        exitCode,
        executionTimeMs: Math.round((endTime - startTime) * 100) / 100
      };
    } catch (err: any) {
      if (this.currentStdoutBuffer.length > 0) {
        this.stdout.push(this.currentStdoutBuffer);
      }
      const endTime = performance.now();
      return {
        stdout: this.stdout,
        exitCode: 1,
        executionTimeMs: Math.round((endTime - startTime) * 100) / 100,
        error: err.message || String(err)
      };
    }
  }

  private parseModule(llvmCode: string): void {
    const lines = llvmCode.split('\n');
    let currentFn: LLVMFunctionDef | null = null;
    let currentBlock = 'entry';

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line || line.startsWith(';') || line.startsWith('target ') || line.startsWith('source_filename')) {
        continue;
      }

      // String constant declaration:
      // @.str = private unnamed_addr constant [15 x i8] c"Hello, World!\0A\00"
      if (line.startsWith('@') && line.includes('constant') && line.includes('c"')) {
        const match = line.match(/^@([a-zA-Z0-9_.]+)\s*=\s*(?:[a-zA-Z_]+\s+)*constant\s+\[\d+\s+x\s+i8\]\s+c"([^"]*)"/);
        if (match) {
          const sym = match[1];
          const rawStr = match[2];
          const decoded = this.decodeLLVMString(rawStr);
          this.stringConstants.set(sym, decoded);
          this.globals.set(sym, decoded);
        }
        continue;
      }

      // Function definition start:
      // define i32 @main() {
      // define internal i8* @.lambda_0(i8* %arg.x) {
      // define double @add(double %arg.a, double %arg.b) {
      if (line.startsWith('define ')) {
        const fnMatch = line.match(/^define\s+(internal\s+)?([a-zA-Z0-9_*%]+(?:\s*\([^)]*\)\*)?)\s+@([a-zA-Z0-9_.]+)\s*\(([^)]*)\)/);
        if (fnMatch) {
          const isInternal = !!fnMatch[1];
          const retType = fnMatch[2];
          const fnName = fnMatch[3];
          const rawParams = fnMatch[4].trim();

          const params: { type: string; name: string }[] = [];
          if (rawParams.length > 0) {
            const pTokens = rawParams.split(',').map(s => s.trim());
            for (const pt of pTokens) {
              const parts = pt.split(/\s+/);
              if (parts.length >= 2) {
                const type = parts[0];
                const name = parts[parts.length - 1].replace(/^%/, '');
                params.push({ type, name });
              }
            }
          }

          currentFn = {
            name: fnName,
            retType,
            isInternal,
            params,
            blocks: new Map(),
            blockOrder: []
          };
          currentBlock = 'entry';
          currentFn.blocks.set(currentBlock, []);
          currentFn.blockOrder.push(currentBlock);
          this.functions.set(fnName, currentFn);
        }
        continue;
      }

      // End of function: }
      if (line === '}' && currentFn) {
        currentFn = null;
        continue;
      }

      // Inside function body
      if (currentFn) {
        // Label declaration: e.g. "then.0:" or "entry:" or "while.cond.0:"
        if (line.endsWith(':') && !line.includes('=')) {
          currentBlock = line.slice(0, -1).trim();
          if (!currentFn.blocks.has(currentBlock)) {
            currentFn.blocks.set(currentBlock, []);
            currentFn.blockOrder.push(currentBlock);
          }
          continue;
        }

        // Instruction line
        if (!currentFn.blocks.has(currentBlock)) {
          currentFn.blocks.set(currentBlock, []);
          currentFn.blockOrder.push(currentBlock);
        }
        currentFn.blocks.get(currentBlock)!.push(line);
      }
    }
  }

  private decodeLLVMString(raw: string): string {
    let result = '';
    for (let i = 0; i < raw.length; i++) {
      if (raw[i] === '\\' && i + 2 < raw.length) {
        const hex = raw.slice(i + 1, i + 3);
        if (/^[0-9A-Fa-f]{2}$/.test(hex)) {
          const charCode = parseInt(hex, 16);
          if (charCode !== 0) {
            result += String.fromCharCode(charCode);
          }
          i += 2;
          continue;
        }
      }
      result += raw[i];
    }
    return result;
  }

  private callFunction(fnName: string, args: any[]): any {
    // 1. Clean fnName
    let cleanName = fnName.trim().replace(/^@/, '').replace(/^(?:i8\*|double|i64|i32|i1|void)\s+/, '');
    if (cleanName.startsWith('@')) cleanName = cleanName.slice(1);

    // 2. Builtin POSIX libc, Math & Stdlib dispatch
    const builtinRes = this.executeBuiltin(cleanName, args);
    if (builtinRes.handled) {
      return builtinRes.value;
    }

    // 3. Exact function definition match
    let fnDef = this.functions.get(cleanName);

    // 4. Fallback search (e.g. without or with module prefix)
    if (!fnDef) {
      for (const [name, def] of this.functions.entries()) {
        if (name === cleanName || name.endsWith(`_${cleanName}`) || cleanName.endsWith(`_${name}`)) {
          fnDef = def;
          break;
        }
      }
    }

    // 5. GADT Constructor fallback (e.g. Lit, Add, ExprModule_Lit, Leaf, Node)
    if (!fnDef) {
      const ctorName = cleanName.includes('_') ? cleanName.split('_').pop()! : cleanName;
      if (/^[A-Z]/.test(ctorName) || ctorName.includes('Lit') || ctorName.includes('Add') || ctorName.includes('Some') || ctorName.includes('None')) {
        const ptr = this.nextHeapPtr++;
        const payload = args.length === 1 ? args[0] : (args.length === 0 ? null : args);
        const structObj = {
          tag: this.inferTag(cleanName),
          payload,
          _ptr: ptr
        };
        this.heap.set(ptr, structObj);
        return structObj;
      }

      // Safe fallback for user-defined callbacks or dynamic functions
      return 0;
    }

    const frame: StackFrame = {
      functionName: fnDef.name,
      locals: new Map(),
      allocas: new Map()
    };

    // Bind argument parameters (with both %name and %arg.name)
    for (let i = 0; i < fnDef.params.length; i++) {
      const p = fnDef.params[i];
      const val = args[i] !== undefined ? args[i] : 0;
      frame.locals.set(p.name, val);
      if (p.name.startsWith('arg.')) {
        frame.locals.set(p.name.slice(4), val);
      } else {
        frame.locals.set(`arg.${p.name}`, val);
      }
    }

    let currentBlock = fnDef.blockOrder[0] || 'entry';
    let previousBlock = '';
    let instructionCount = 0;
    const MAX_INSTRUCTIONS = 5000000;

    while (true) {
      const blockInstructions = fnDef.blocks.get(currentBlock);
      if (!blockInstructions) {
        throw new Error(`Basic block "${currentBlock}" not found in @${fnDef.name}`);
      }

      let nextBlock: string | null = null;

      for (let i = 0; i < blockInstructions.length; i++) {
        instructionCount++;
        if (instructionCount > MAX_INSTRUCTIONS) {
          throw new Error(`Execution limit exceeded (${MAX_INSTRUCTIONS} steps) in @${fnDef.name}. Possible infinite loop.`);
        }

        const inst = blockInstructions[i];
        const step = this.executeInstruction(inst, frame, previousBlock);

        if (step.kind === 'ret') {
          return step.value;
        } else if (step.kind === 'br') {
          previousBlock = currentBlock;
          nextBlock = step.targetBlock;
          break;
        }
      }

      if (nextBlock) {
        currentBlock = nextBlock;
      } else {
        break;
      }
    }

    return 0;
  }

  private inferTag(ctorName: string): number {
    const simple = ctorName.includes('_') ? ctorName.split('_').pop()! : ctorName;
    if (simple === 'Lit' || simple === 'Leaf' || simple === 'None' || simple === 'Zero' || simple === 'Nil') return 0;
    if (simple === 'Add' || simple === 'Node' || simple === 'Some' || simple === 'Succ' || simple === 'Cons') return 1;
    if (simple === 'Mul' || simple === 'Sub') return 2;
    if (simple === 'Div') return 3;
    let hash = 0;
    for (let i = 0; i < simple.length; i++) {
      hash = (hash * 31 + simple.charCodeAt(i)) & 0x7fffffff;
    }
    return hash % 100;
  }

  private executeBuiltin(name: string, args: any[]): { handled: boolean; value: any } {
    switch (name) {
      case 'strlen': {
        const str = args[0] !== undefined && args[0] !== null ? String(args[0]) : '';
        return { handled: true, value: str.length };
      }
      case 'strcpy': {
        const src = args[1] !== undefined ? String(args[1]) : (args[0] !== undefined ? String(args[0]) : '');
        return { handled: true, value: src };
      }
      case 'strcat': {
        const a = args[0] !== undefined && args[0] !== null ? String(args[0]) : '';
        const b = args[1] !== undefined && args[1] !== null ? String(args[1]) : '';
        return { handled: true, value: a + b };
      }
      case 'strcmp': {
        const a = String(args[0] ?? '');
        const b = String(args[1] ?? '');
        return { handled: true, value: a.localeCompare(b) };
      }
      case 'split': {
        const str = String(args[0] ?? '');
        const delim = String(args[1] ?? '');
        return { handled: true, value: str.split(delim) };
      }
      case 'join': {
        const arr = Array.isArray(args[0]) ? args[0] : [args[0]];
        const delim = String(args[1] ?? '');
        return { handled: true, value: arr.join(delim) };
      }
      case 'h': {
        // Virtual DOM creation helper: h(tag, props, children)
        return {
          handled: true,
          value: {
            tag: args[0] ?? 'div',
            props: typeof args[1] === 'object' && args[1] !== null ? args[1] : {},
            children: args.slice(2)
          }
        };
      }
      case '_tl_record_get': {
        const rec = args[0];
        const field = String(args[1] ?? '');
        if (rec && typeof rec === 'object') {
          if (field in rec) return { handled: true, value: (rec as any)[field] };
          if (rec.payload && typeof rec.payload === 'object' && field in rec.payload) {
            return { handled: true, value: (rec.payload as any)[field] };
          }
          if (Array.isArray(rec._fields)) {
            const found = rec._fields.find((f: any) => f.name === field);
            if (found) return { handled: true, value: found.value };
          }
        }
        return { handled: true, value: 0 };
      }
      case 'Array_len':
      case 'len':
      case 'length':
      case 'Array_length': {
        const obj = args[0];
        if (Array.isArray(obj)) return { handled: true, value: obj.length };
        if (typeof obj === 'string') return { handled: true, value: obj.length };
        return { handled: true, value: 0 };
      }
      case 'malloc': {
        const size = Number(args[0] || 16);
        const ptr = this.nextHeapPtr;
        this.nextHeapPtr += Math.max(16, size);
        const structObj = { tag: 0, payload: null, _ptr: ptr };
        this.heap.set(ptr, structObj);
        return { handled: true, value: structObj };
      }
      case 'free': {
        return { handled: true, value: 0 };
      }
      case 'exit': {
        return { handled: true, value: Number(args[0] || 0) };
      }
      case 'puts': {
        const str = String(args[0] ?? '');
        this.stdout.push(str);
        return { handled: true, value: str.length + 1 };
      }
      case 'putchar': {
        const ch = String.fromCharCode(Number(args[0] || 0));
        this.currentStdoutBuffer += ch;
        if (ch === '\n') {
          this.stdout.push(this.currentStdoutBuffer.slice(0, -1));
          this.currentStdoutBuffer = '';
        }
        return { handled: true, value: 1 };
      }
      case 'sprintf': {
        const fmt = String(args[1] ?? args[0] ?? '');
        const restArgs = args.slice(2);
        const formatted = this.formatPrintf(fmt, restArgs);
        return { handled: true, value: formatted };
      }
      case 'printf': {
        const fmt = String(args[0] ?? '');
        const restArgs = args.slice(1);
        const formatted = this.formatPrintf(fmt, restArgs);
        this.appendStdout(formatted);
        return { handled: true, value: formatted.length };
      }
      case 'llvm.sqrt.f64':
      case 'sqrt':
      case 'math_sqrt':
      case 'Math_sqrt': {
        return { handled: true, value: Math.sqrt(Number(args[0] || 0)) };
      }
      case 'llvm.pow.f64':
      case 'pow':
      case 'math_pow':
      case 'Math_pow': {
        return { handled: true, value: Math.pow(Number(args[0] || 0), Number(args[1] || 0)) };
      }
      case 'llvm.fabs.f64':
      case 'fabs':
      case 'abs':
      case 'math_abs':
      case 'Math_abs': {
        return { handled: true, value: Math.abs(Number(args[0] || 0)) };
      }
      case 'llvm.floor.f64':
      case 'floor':
      case 'math_floor':
      case 'Math_floor': {
        return { handled: true, value: Math.floor(Number(args[0] || 0)) };
      }
      case 'llvm.ceil.f64':
      case 'ceil':
      case 'math_ceil':
      case 'Math_ceil': {
        return { handled: true, value: Math.ceil(Number(args[0] || 0)) };
      }
      case 'llvm.sin.f64':
      case 'sin':
      case 'math_sin':
      case 'Math_sin': {
        return { handled: true, value: Math.sin(Number(args[0] || 0)) };
      }
      case 'llvm.cos.f64':
      case 'cos':
      case 'math_cos':
      case 'Math_cos': {
        return { handled: true, value: Math.cos(Number(args[0] || 0)) };
      }
      case 'llvm.round.f64':
      case 'round':
      case 'Math_round': {
        return { handled: true, value: Math.round(Number(args[0] || 0)) };
      }
      case 'Math_random':
      case 'random': {
        return { handled: true, value: Math.random() };
      }
      case 'Date_now': {
        return { handled: true, value: Date.now() };
      }
      default:
        return { handled: false, value: 0 };
    }
  }

  private executeInstruction(
    inst: string,
    frame: StackFrame,
    previousBlock: string
  ): { kind: 'continue' } | { kind: 'br'; targetBlock: string } | { kind: 'ret'; value: any } {
    const trimmed = inst.trim();

    // -------------------------------------------------------------
    // Return: ret void | ret double %1 | ret i32 0 | ret i8* %val
    // -------------------------------------------------------------
    if (trimmed.startsWith('ret ')) {
      if (trimmed === 'ret void') {
        return { kind: 'ret', value: undefined };
      }
      const parts = trimmed.slice(4).trim().split(/\s+/);
      const valToken = parts.length > 1 ? parts[parts.length - 1] : parts[0];
      const val = this.resolveValue(valToken, frame);
      return { kind: 'ret', value: val };
    }

    // -------------------------------------------------------------
    // Unconditional Branch: br label %target
    // -------------------------------------------------------------
    if (trimmed.startsWith('br label %')) {
      const target = trimmed.slice('br label %'.length).trim();
      return { kind: 'br', targetBlock: target };
    }

    // -------------------------------------------------------------
    // Conditional Branch: br i1 %cond, label %then, label %else
    // -------------------------------------------------------------
    if (trimmed.startsWith('br i1 ')) {
      const match = trimmed.match(/^br\s+i1\s+([^,]+),\s+label\s+%([^,]+),\s+label\s+%([^,\s]+)/);
      if (match) {
        const condVal = this.resolveValue(match[1].trim(), frame);
        const thenBlock = match[2].trim();
        const elseBlock = match[3].trim();
        const target = Boolean(condVal) ? thenBlock : elseBlock;
        return { kind: 'br', targetBlock: target };
      }
    }

    // -------------------------------------------------------------
    // Switch: switch i32 %tag, label %default [ i32 0, label %arm0 ... ]
    // -------------------------------------------------------------
    if (trimmed.startsWith('switch ')) {
      const headerMatch = trimmed.match(/^switch\s+[a-zA-Z0-9_*%]+\s+([^,]+),\s+label\s+%([^\s\[]+)\s*\[(.*)\]/);
      if (headerMatch) {
        const tagVal = Number(this.resolveValue(headerMatch[1].trim(), frame));
        const defaultBlock = headerMatch[2].trim();
        const casesStr = headerMatch[3].trim();

        let chosenBlock = defaultBlock;
        const caseRegex = /i32\s+(\d+),\s+label\s+%([a-zA-Z0-9_.]+)/g;
        let caseMatch: RegExpExecArray | null;
        while ((caseMatch = caseRegex.exec(casesStr)) !== null) {
          const caseVal = parseInt(caseMatch[1], 10);
          const caseBlock = caseMatch[2];
          if (tagVal === caseVal) {
            chosenBlock = caseBlock;
            break;
          }
        }
        return { kind: 'br', targetBlock: chosenBlock };
      }
    }

    // -------------------------------------------------------------
    // Assignment instruction: %reg = ...
    // -------------------------------------------------------------
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const destReg = trimmed.slice(0, eqIdx).trim().replace(/^%/, '');
      const rhs = trimmed.slice(eqIdx + 1).trim();

      // Phi node: %result = phi double [ %val1, %label1 ], [ %val2, %label2 ]
      if (rhs.startsWith('phi ')) {
        const rest = rhs.slice(4).trim();
        const typeEnd = rest.indexOf('[');
        const pairsStr = rest.slice(typeEnd);
        const pairRegex = /\[\s*([^,]+),\s*%([^\]]+)\s*\]/g;
        let pMatch: RegExpExecArray | null;
        let resolvedVal: any = 0;

        while ((pMatch = pairRegex.exec(pairsStr)) !== null) {
          const valToken = pMatch[1].trim();
          const fromLabel = pMatch[2].trim();
          if (fromLabel === previousBlock) {
            resolvedVal = this.resolveValue(valToken, frame);
            break;
          }
        }
        frame.locals.set(destReg, resolvedVal);
        return { kind: 'continue' };
      }

      // Alloca: %a.var = alloca double, align 8
      if (rhs.startsWith('alloca ')) {
        frame.allocas.set(destReg, { value: 0 });
        frame.locals.set(destReg, destReg);
        return { kind: 'continue' };
      }

      // Load: %1 = load double, double* %a.var, align 8
      if (rhs.startsWith('load ')) {
        const match = rhs.match(/^load\s+[^,]+,\s+[^,]+\s+([%@a-zA-Z0-9_.]+)/);
        if (match) {
          const ptrName = match[1].trim().replace(/^[%@]/, '');
          let loadedVal: any = 0;
          if (frame.allocas.has(ptrName)) {
            loadedVal = frame.allocas.get(ptrName).value;
          } else if (frame.locals.has(ptrName)) {
            const loc = frame.locals.get(ptrName);
            if (typeof loc === 'object' && loc !== null && 'value' in loc) {
              loadedVal = loc.value;
            } else if (typeof loc === 'number' && this.heap.has(loc)) {
              loadedVal = this.heap.get(loc);
            } else {
              loadedVal = loc;
            }
          } else if (this.globals.has(ptrName)) {
            loadedVal = this.globals.get(ptrName);
          }
          frame.locals.set(destReg, loadedVal);
        }
        return { kind: 'continue' };
      }

      // Call: %1 = call ...
      if (rhs.startsWith('call ')) {
        const res = this.executeCall(rhs, frame);
        frame.locals.set(destReg, res);
        return { kind: 'continue' };
      }

      // Floating-Point Arithmetic: fadd, fsub, fmul, fdiv, frem
      if (rhs.startsWith('fadd ') || rhs.startsWith('fsub ') || rhs.startsWith('fmul ') || rhs.startsWith('fdiv ') || rhs.startsWith('frem ')) {
        const parts = rhs.split(/\s+/);
        const op = parts[0];
        const v1 = Number(this.resolveValue(parts[2].replace(/,$/, ''), frame));
        const v2 = Number(this.resolveValue(parts[3], frame));
        let res = 0;
        if (op === 'fadd') res = v1 + v2;
        else if (op === 'fsub') res = v1 - v2;
        else if (op === 'fmul') res = v1 * v2;
        else if (op === 'fdiv') res = v2 !== 0 ? v1 / v2 : 0;
        else if (op === 'frem') res = v1 % v2;
        frame.locals.set(destReg, res);
        return { kind: 'continue' };
      }

      // Integer Arithmetic: add, sub, mul, sdiv, udiv, srem
      if (rhs.startsWith('add ') || rhs.startsWith('sub ') || rhs.startsWith('mul ') || rhs.startsWith('sdiv ') || rhs.startsWith('srem ')) {
        const parts = rhs.split(/\s+/);
        const op = parts[0];
        const v1 = Number(this.resolveValue(parts[2].replace(/,$/, ''), frame));
        const v2 = Number(this.resolveValue(parts[3], frame));
        let res = 0;
        if (op === 'add') res = v1 + v2;
        else if (op === 'sub') res = v1 - v2;
        else if (op === 'mul') res = v1 * v2;
        else if (op === 'sdiv') res = v2 !== 0 ? Math.trunc(v1 / v2) : 0;
        else if (op === 'srem') res = v1 % v2;
        frame.locals.set(destReg, res);
        return { kind: 'continue' };
      }

      // Unary fneg: %neg = fneg double %x
      if (rhs.startsWith('fneg ')) {
        const parts = rhs.split(/\s+/);
        const v = Number(this.resolveValue(parts[2], frame));
        frame.locals.set(destReg, -v);
        return { kind: 'continue' };
      }

      // Floating-Point Comparison: fcmp oeq double %a, %b
      if (rhs.startsWith('fcmp ')) {
        const parts = rhs.split(/\s+/);
        const cond = parts[1];
        const v1 = Number(this.resolveValue(parts[3].replace(/,$/, ''), frame));
        const v2 = Number(this.resolveValue(parts[4], frame));
        let cmp = false;
        if (cond === 'oeq') cmp = v1 === v2;
        else if (cond === 'one') cmp = v1 !== v2;
        else if (cond === 'olt') cmp = v1 < v2;
        else if (cond === 'ole') cmp = v1 <= v2;
        else if (cond === 'ogt') cmp = v1 > v2;
        else if (cond === 'oge') cmp = v1 >= v2;
        frame.locals.set(destReg, cmp);
        return { kind: 'continue' };
      }

      // Integer Comparison: icmp eq i32 %a, %b
      if (rhs.startsWith('icmp ')) {
        const parts = rhs.split(/\s+/);
        const cond = parts[1];
        const v1 = Number(this.resolveValue(parts[3].replace(/,$/, ''), frame));
        const v2 = Number(this.resolveValue(parts[4], frame));
        let cmp = false;
        if (cond === 'eq') cmp = v1 === v2;
        else if (cond === 'ne') cmp = v1 !== v2;
        else if (cond === 'slt' || cond === 'ult') cmp = v1 < v2;
        else if (cond === 'sle' || cond === 'ule') cmp = v1 <= v2;
        else if (cond === 'sgt' || cond === 'ugt') cmp = v1 > v2;
        else if (cond === 'sge' || cond === 'uge') cmp = v1 >= v2;
        frame.locals.set(destReg, cmp);
        return { kind: 'continue' };
      }

      // Bitwise & Logical: and, or, xor
      if (rhs.startsWith('and ') || rhs.startsWith('or ') || rhs.startsWith('xor ')) {
        const parts = rhs.split(/\s+/);
        const op = parts[0];
        const v1 = this.resolveValue(parts[2].replace(/,$/, ''), frame);
        const v2 = this.resolveValue(parts[3], frame);
        let res: any = false;
        if (op === 'and') res = Boolean(v1 && v2);
        else if (op === 'or') res = Boolean(v1 || v2);
        else if (op === 'xor') res = Boolean(v1) !== Boolean(v2);
        frame.locals.set(destReg, res);
        return { kind: 'continue' };
      }

      // Select: select i1 %cond, type %v1, type %v2
      if (rhs.startsWith('select ')) {
        const match = rhs.match(/^select\s+i1\s+([^,]+),\s+[^,]+\s+([^,]+),\s+[^,]+\s+(.+)$/);
        if (match) {
          const condVal = Boolean(this.resolveValue(match[1].trim(), frame));
          const v1 = this.resolveValue(match[2].trim(), frame);
          const v2 = this.resolveValue(match[3].trim(), frame);
          frame.locals.set(destReg, condVal ? v1 : v2);
        }
        return { kind: 'continue' };
      }

      // Type Conversions: bitcast, inttoptr, ptrtoint, zext, sext, trunc, etc.
      if (
        rhs.startsWith('bitcast ') ||
        rhs.startsWith('inttoptr ') ||
        rhs.startsWith('ptrtoint ') ||
        rhs.startsWith('zext ') ||
        rhs.startsWith('sext ') ||
        rhs.startsWith('trunc ') ||
        rhs.startsWith('sitofp ') ||
        rhs.startsWith('fptosi ') ||
        rhs.startsWith('uitofp ') ||
        rhs.startsWith('fptoui ') ||
        rhs.startsWith('fpext ') ||
        rhs.startsWith('fptrunc ')
      ) {
        const toIdx = rhs.lastIndexOf(' to ');
        let srcPart = toIdx !== -1 ? rhs.slice(0, toIdx).trim() : rhs;
        const srcTokens = srcPart.split(/\s+/);
        const srcValToken = srcTokens[srcTokens.length - 1];
        const val = this.resolveValue(srcValToken, frame);
        frame.locals.set(destReg, val);
        return { kind: 'continue' };
      }

      // GEP: getelementptr inbounds ...
      if (rhs.startsWith('getelementptr ')) {
        if (rhs.includes('@.str')) {
          const match = rhs.match(/@([a-zA-Z0-9_.]+)/);
          if (match) {
            const sym = match[1];
            frame.locals.set(destReg, this.stringConstants.get(sym) || this.globals.get(sym) || sym);
          }
        } else if (rhs.includes('%struct.GADTValue')) {
          const match = rhs.match(/%struct\.GADTValue\*\s+([%a-zA-Z0-9_.]+),\s+i32\s+0,\s+i32\s+(\d+)/);
          if (match) {
            const structVar = match[1].replace(/^%/, '');
            const fieldIdx = parseInt(match[2], 10);
            const structVal = frame.locals.get(structVar) || this.heap.get(frame.locals.get(structVar));
            frame.locals.set(destReg, { _structRef: structVal, _fieldIdx: fieldIdx });
          }
        } else {
          frame.locals.set(destReg, destReg);
        }
        return { kind: 'continue' };
      }
    }

    // -------------------------------------------------------------
    // Store instruction: store double %val, double* %ptr, align 8
    // -------------------------------------------------------------
    if (trimmed.startsWith('store ')) {
      const match = trimmed.match(/^store\s+[^,]+\s+([^,]+),\s+[^,]+\s+([%@a-zA-Z0-9_.]+)/);
      if (match) {
        const valToken = match[1].trim();
        const destPtrToken = match[2].trim().replace(/^[%@]/, '');
        const val = this.resolveValue(valToken, frame);

        if (frame.allocas.has(destPtrToken)) {
          frame.allocas.get(destPtrToken).value = val;
        } else if (frame.locals.has(destPtrToken)) {
          const loc = frame.locals.get(destPtrToken);
          if (loc && typeof loc === 'object') {
            if ('_structRef' in loc) {
              if (loc._fieldIdx === 0) loc._structRef.tag = Number(val);
              else loc._structRef.payload = val;
            } else {
              loc.value = val;
            }
          } else if (typeof loc === 'number' && this.heap.has(loc)) {
            this.heap.set(loc, val);
          }
        } else if (this.globals.has(destPtrToken)) {
          this.globals.set(destPtrToken, val);
        }
      }
      return { kind: 'continue' };
    }

    // -------------------------------------------------------------
    // Direct call without assignment: call i32 (i8*, ...) @printf(...)
    // -------------------------------------------------------------
    if (trimmed.startsWith('call ')) {
      this.executeCall(trimmed, frame);
      return { kind: 'continue' };
    }

    return { kind: 'continue' };
  }

  private executeCall(callStr: string, frame: StackFrame): any {
    const trimmed = callStr.trim();

    // 1. Locate argument list (...) at the end
    const lastOpenParen = trimmed.lastIndexOf('(');
    const lastCloseParen = trimmed.lastIndexOf(')');

    if (lastOpenParen === -1 || lastCloseParen <= lastOpenParen) {
      return 0;
    }

    const argsSubstring = trimmed.slice(lastOpenParen + 1, lastCloseParen).trim();
    const prefix = trimmed.slice(0, lastOpenParen).trim();

    // 2. Extract callee token from prefix
    const prefixTokens = prefix.split(/\s+/);
    let calleeToken = prefixTokens[prefixTokens.length - 1];
    calleeToken = calleeToken.replace(/^@/, '');

    // 3. Evaluate argument expressions
    const argValues: any[] = [];
    if (argsSubstring.length > 0) {
      const argTokens = this.splitArgsList(argsSubstring);
      for (const tok of argTokens) {
        const parts = tok.trim().split(/\s+/);
        const valPart = parts[parts.length - 1];
        argValues.push(this.resolveValue(valPart, frame));
      }
    }

    // 4. Resolve indirect or direct call
    if (calleeToken.startsWith('%')) {
      const reg = calleeToken.slice(1);
      const resolved = frame.locals.get(reg) ?? (frame.allocas.get(reg) ? frame.allocas.get(reg).value : null);
      if (typeof resolved === 'string') {
        return this.callFunction(resolved.replace(/^@/, ''), argValues);
      } else if (typeof resolved === 'function') {
        return resolved(...argValues);
      } else if (typeof resolved === 'object' && resolved !== null) {
        return resolved;
      }
      return this.callFunction(reg, argValues);
    }

    // Direct call
    return this.callFunction(calleeToken, argValues);
  }

  private splitArgsList(argsStr: string): string[] {
    const tokens: string[] = [];
    let depth = 0;
    let current = '';

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];
      if (char === '(' || char === '[' || char === '{') depth++;
      else if (char === ')' || char === ']' || char === '}') depth--;

      if (char === ',' && depth === 0) {
        tokens.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim().length > 0) {
      tokens.push(current.trim());
    }
    return tokens;
  }

  private formatPrintf(fmt: string, args: any[]): string {
    let argIdx = 0;
    let formatted = '';
    for (let i = 0; i < fmt.length; i++) {
      if (fmt[i] === '%' && i + 1 < fmt.length) {
        const next = fmt[i + 1];
        if (next === 's') {
          const val = argIdx < args.length ? args[argIdx++] : '';
          formatted += typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
          i++;
          continue;
        } else if (next === 'f' || next === 'g') {
          const val = argIdx < args.length ? Number(args[argIdx++]) : 0;
          formatted += Number.isInteger(val) ? `${val}.0` : String(val);
          i++;
          continue;
        } else if (next === 'd' || next === 'i') {
          const val = argIdx < args.length ? Math.trunc(Number(args[argIdx++])) : 0;
          formatted += String(val);
          i++;
          continue;
        } else if (fmt.slice(i + 1, i + 4) === 'lld') {
          const val = argIdx < args.length ? Math.trunc(Number(args[argIdx++])) : 0;
          formatted += String(val);
          i += 3;
          continue;
        } else if (next === '%') {
          formatted += '%';
          i++;
          continue;
        }
      }
      formatted += fmt[i];
    }
    return formatted;
  }

  private appendStdout(text: string): void {
    this.currentStdoutBuffer += text;
    if (this.currentStdoutBuffer.includes('\n')) {
      const parts = this.currentStdoutBuffer.split('\n');
      for (let p = 0; p < parts.length - 1; p++) {
        this.stdout.push(parts[p]);
      }
      this.currentStdoutBuffer = parts[parts.length - 1];
    }
  }

  private resolveValue(token: string, frame: StackFrame): any {
    if (!token) return 0;
    const t = token.trim();

    // Constant numbers
    if (/^-?\d+(\.\d+)?$/.test(t)) {
      return parseFloat(t);
    }
    if (t === 'true') return true;
    if (t === 'false') return false;
    if (t === 'null') return null;

    // GEP expression inline: getelementptr inbounds (...)
    if (t.includes('getelementptr')) {
      const match = t.match(/@([a-zA-Z0-9_.]+)/);
      if (match) {
        const sym = match[1];
        return this.stringConstants.get(sym) || this.globals.get(sym) || sym;
      }
    }

    // String / Symbol global reference: @.str or @function
    if (t.startsWith('@')) {
      const sym = t.slice(1);
      if (this.stringConstants.has(sym)) {
        return this.stringConstants.get(sym);
      }
      if (this.globals.has(sym)) {
        return this.globals.get(sym);
      }
      return sym;
    }

    // Local variable register: %x, %1, %a.var, %arg.a
    if (t.startsWith('%')) {
      const reg = t.slice(1);
      if (frame.locals.has(reg)) {
        return frame.locals.get(reg);
      }
      if (frame.allocas.has(reg)) {
        return frame.allocas.get(reg).value;
      }
      return 0;
    }

    // Plain identifier
    if (frame.locals.has(t)) {
      return frame.locals.get(t);
    }
    if (frame.allocas.has(t)) {
      return frame.allocas.get(t).value;
    }
    if (this.stringConstants.has(t)) {
      return this.stringConstants.get(t);
    }
    if (this.globals.has(t)) {
      return this.globals.get(t);
    }

    return t;
  }
}
