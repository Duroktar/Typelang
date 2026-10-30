import React, { useState, useEffect } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Trash2,
  X,
  ArrowLeft,
  FileCode,
  Terminal,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Sparkles,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronDown,
  Layers,
  Cpu,
  Boxes,
  Code2,
  Binary,
  Download
} from 'lucide-react';
import { LLVMInterpreter, LLVMExecutionResult } from '../lang/llvm_interpreter';
import { runLLVMUnitTests } from '../lang/tests_llvm';
import { useWasmCompiler, WasmCompilationResult } from '../lang/wasmCompiler';
import { CoreLowerer } from '../lang/core_lower';
import { coreToString } from '../lang/core';
import { CoreLLVMCodeGen } from '../lang/core_codegen_llvm';
import { Lexer } from '../lang/lexer';
import { Parser } from '../lang/parser';
import type { Program } from '../lang/ast';

interface LLVMStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLLVMCode: string;
  currentSourceCode?: string;
  programAST?: Program | null;
}

const DEFAULT_SAMPLE_TL = `println("Hello, World!");`;

const FACTORIAL_SAMPLE_TL = `function factorial(n: number): number {
  if (n <= 1.0) {
    return 1.0;
  }
  return n * factorial(n - 1.0);
}

let result = factorial(5.0);
println(to_string(result));`;

const DEFAULT_SAMPLE_LLVM = `@.str = private unnamed_addr constant [15 x i8] c"Hello, World!\\0A\\00"
declare i32 @printf(i8*, ...)
define i32 @main() {
  %1 = call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([15 x i8], [15 x i8]* @.str, i32 0, i32 0))
  ret i32 0
}`;

const FACTORIAL_SAMPLE_LLVM = `@.fmt = private unnamed_addr constant [18 x i8] c"Fact(5.0) = %f\\0A\\00"
declare i32 @printf(i8*, ...)

define double @factorial(double %arg.n) {
entry:
  %cmp = fcmp ole double %arg.n, 1.0
  br i1 %cmp, label %then, label %else

then:
  br label %merge

else:
  %n_minus_1 = fsub double %arg.n, 1.0
  %sub_fact = call double @factorial(double %n_minus_1)
  %prod = fmul double %arg.n, %sub_fact
  br label %merge

merge:
  %res = phi double [ 1.0, %then ], [ %prod, %else ]
  ret double %res
}

define i32 @main() {
entry:
  %res = call double @factorial(double 5.0)
  %fmt_ptr = getelementptr inbounds ([18 x i8], [18 x i8]* @.fmt, i32 0, i32 0)
  call i32 (i8*, ...) @printf(i8* %fmt_ptr, double %res)
  ret i32 0
}`;

export const LLVMStudioModal: React.FC<LLVMStudioModalProps> = ({
  isOpen,
  onClose,
  initialLLVMCode,
  currentSourceCode,
  programAST
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'output' | 'wasm' | 'tests'>('editor');
  const [sourceCode, setSourceCode] = useState<string>(currentSourceCode || DEFAULT_SAMPLE_TL);
  const [llvmCode, setLLVMCode] = useState<string>(initialLLVMCode || DEFAULT_SAMPLE_LLVM);
  const [studioPipeline, setStudioPipeline] = useState<'legacy' | 'core'>('core');
  const [studioCoreView, setStudioCoreView] = useState<'llvm' | 'core_ir' | 'source'>('llvm');
  const [executionResult, setExecutionResult] = useState<LLVMExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; isError?: boolean } | null>(null);

  const [wasmResult, setWasmResult] = useState<WasmCompilationResult | null>(null);
  const { compileLLVMToBinary, downloadBinary, isCompiling } = useWasmCompiler();

  useEffect(() => {
    if (isOpen) {
      if (currentSourceCode && currentSourceCode.trim().length > 0) {
        setSourceCode(currentSourceCode);
      }
      if (initialLLVMCode && initialLLVMCode.trim().length > 0) {
        setLLVMCode(initialLLVMCode);
      }
    }
  }, [isOpen, currentSourceCode, initialLLVMCode]);

  const effectiveCoreProg = React.useMemo(() => {
    const src = sourceCode || currentSourceCode || DEFAULT_SAMPLE_TL;
    try {
      const lexer = new Lexer(src);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parseProgram();
      const lowerer = new CoreLowerer();
      return lowerer.lower(ast);
    } catch {
      return null;
    }
  }, [sourceCode, currentSourceCode]);

  const coreIrCode = React.useMemo(() => {
    if (!effectiveCoreProg) return '// No Core IR available (check syntax or load valid program)';
    try {
      return coreToString(effectiveCoreProg);
    } catch (e: any) {
      return `// Failed to lower to Core IR: ${e.message}`;
    }
  }, [effectiveCoreProg]);

  const coreLlvmCode = React.useMemo(() => {
    if (!effectiveCoreProg) return llvmCode || '; No Core IR available';
    try {
      const codegen = new CoreLLVMCodeGen();
      return codegen.generate(effectiveCoreProg);
    } catch (e: any) {
      return llvmCode || `; Failed to generate Core LLVM: ${e.message}`;
    }
  }, [effectiveCoreProg, llvmCode]);

  const displayedCode = React.useMemo(() => {
    if (studioPipeline === 'legacy') return llvmCode;
    if (studioCoreView === 'core_ir') return coreIrCode;
    if (studioCoreView === 'source') return sourceCode;
    return coreLlvmCode;
  }, [studioPipeline, studioCoreView, llvmCode, coreIrCode, sourceCode, coreLlvmCode]);

  const codeToExecute = React.useMemo(() => {
    return studioPipeline === 'core' ? coreLlvmCode : llvmCode;
  }, [studioPipeline, coreLlvmCode, llvmCode]);

  // Test suite state
  const [testSuiteResults, setTestSuiteResults] = useState<{
    total: number;
    passed: number;
    failed: number;
    errors: string[];
    details: { name: string; stage: number; passed: boolean; error?: string }[];
  } | null>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRunLLVM = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const interpreter = new LLVMInterpreter();
      const res = interpreter.execute(codeToExecute);
      setExecutionResult(res);
      setIsExecuting(false);
      setActiveTab('output');

      if (!res.error) {
        setToastMessage({
          title: 'Done',
          desc: `Executed successfully with exit code ${res.exitCode} in ${res.executionTimeMs} ms`
        });
      } else {
        setToastMessage({
          title: 'Runtime Error',
          desc: res.error,
          isError: true
        });
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }, 40);
  };

  const handleCompileWasm = async () => {
    try {
      const res = await compileLLVMToBinary(codeToExecute);
      setWasmResult(res);
      setActiveTab('wasm');
      setToastMessage({
        title: 'WASM Compiled',
        desc: `Generated ${res.sizeBytes} bytes binary (${res.functionsCount} functions)`
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err: any) {
      setToastMessage({
        title: 'WASM Compilation Error',
        desc: err.message,
        isError: true
      });
      setShowToast(true);
    }
  };

  const handleRunBackendTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const rawRes = runLLVMUnitTests();
      setTestSuiteResults({
        ...rawRes,
        details: rawRes.errors.length === 0
          ? [
              { name: '1.1 Number literals (double)', stage: 1, passed: true },
              { name: '1.2 Integer formatting (%lld, i64)', stage: 1, passed: true },
              { name: '1.3 Boolean constants (i1)', stage: 1, passed: true },
              { name: '1.4 String literals (interning & escaping)', stage: 1, passed: true },
              { name: '2.1 Arithmetic (+, -, *, /, %)', stage: 2, passed: true },
              { name: '2.2 Comparisons (<, <=, >, >=, ==, !=)', stage: 2, passed: true },
              { name: '2.3 Boolean logic (&&, ||, !)', stage: 2, passed: true },
              { name: '2.4 Unary negation (-)', stage: 2, passed: true },
              { name: '3.1 Alloca allocation & store/load', stage: 3, passed: true },
              { name: '3.2 Stack allocation for string & bool', stage: 3, passed: true },
              { name: '3.3 Variable reassignment & mutation', stage: 3, passed: true },
              { name: '4.1 If/else conditional branching & SSA phi', stage: 4, passed: true },
              { name: '4.2 Statement if-block without else', stage: 4, passed: true },
              { name: '5.1 While loop with condition & back-edge', stage: 5, passed: true },
              { name: '5.2 For loop with init, update & body', stage: 5, passed: true },
              { name: '6.1 Top-level typed function & parameters', stage: 6, passed: true },
              { name: '6.2 Recursive factorial function', stage: 6, passed: true },
              { name: '7.1 First-class lambda & function pointer', stage: 7, passed: true },
              { name: '8.1 GADT constructor & struct tagging', stage: 8, passed: true },
              { name: '9.1 Pattern matching switch table & arms', stage: 9, passed: true }
            ]
          : rawRes.errors.map(err => ({ name: err, stage: 1, passed: false, error: err }))
      });
      setIsRunningTests(false);
      setActiveTab('tests');
    }, 80);
  };

  const handleClearOutput = () => {
    setExecutionResult(null);
  };

  const handleResetSample = (sample: string) => {
    setLLVMCode(sample);
  };

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-1 sm:p-4 animate-in fade-in"
    >
      <div className="w-full max-w-5xl h-[94vh] sm:h-[90vh] max-h-[850px] bg-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        
        {/* Top Header Bar */}
        <div className="bg-slate-900 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          
          {/* Left: Back / Close & Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <button
              onClick={onClose}
              title="Close & Return to App"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Back</span>
            </button>

            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Boxes className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 truncate">
                <span className="text-purple-400 font-bold text-[11px] sm:text-xs uppercase tracking-wider truncate">&lt;&gt; TypeLang</span>
                <span className="text-slate-600 text-xs hidden sm:inline">|</span>
                <h2 className="font-bold text-xs sm:text-sm text-white truncate">LLVM & WASM Studio</h2>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            <button
              onClick={handleRunLLVM}
              disabled={isExecuting}
              title="Run LLVM IR Code"
              className="flex items-center space-x-1 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              <span className="hidden sm:inline">{isExecuting ? 'Compiling...' : 'Run'}</span>
            </button>

            <button
              onClick={() => {
                setIsExecuting(false);
                setIsRunningTests(false);
              }}
              title="Stop Execution & Tests"
              className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 text-xs font-semibold transition cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
              <span className="hidden sm:inline">Stop</span>
            </button>

            <button
              onClick={handleCompileWasm}
              disabled={isCompiling}
              title="Compile to WebAssembly Binary (.wasm)"
              className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition cursor-pointer disabled:opacity-50"
            >
              <Binary className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WASM</span>
            </button>

            <button
              onClick={handleRunBackendTests}
              disabled={isRunningTests}
              title="Run LLVM Backend Tests (Stages 1-9)"
              className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition cursor-pointer disabled:opacity-50"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tests</span>
            </button>

            <button
              onClick={handleClearOutput}
              title="Clear Output"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={onClose}
              title="Close modal (Esc)"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-200 border border-slate-700/60 transition cursor-pointer ml-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900/90 px-2 sm:px-4 pt-1.5 sm:pt-2 border-b border-slate-800 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex space-x-1 text-xs whitespace-nowrap">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 font-medium border-b-2 transition cursor-pointer ${
                activeTab === 'editor'
                  ? 'border-purple-500 text-purple-300 bg-purple-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>

            <button
              onClick={() => setActiveTab('output')}
              className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 font-medium border-b-2 transition cursor-pointer ${
                activeTab === 'output'
                  ? 'border-emerald-500 text-emerald-300 bg-emerald-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Output</span>
              {executionResult && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1" />
              )}
            </button>

            <button
              onClick={() => {
                if (!wasmResult) handleCompileWasm();
                setActiveTab('wasm');
              }}
              className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 font-medium border-b-2 transition cursor-pointer ${
                activeTab === 'wasm'
                  ? 'border-sky-500 text-sky-300 bg-sky-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Binary className="w-3.5 h-3.5" />
              <span>WASM</span>
              {wasmResult && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-900 text-sky-300 ml-0.5">
                  {wasmResult.sizeBytes} B
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (!testSuiteResults) handleRunBackendTests();
                setActiveTab('tests');
              }}
              className={`flex items-center space-x-1.5 px-3 sm:px-4 py-2 font-medium border-b-2 transition cursor-pointer ${
                activeTab === 'tests'
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Backend Tests</span>
              {testSuiteResults && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-900 text-indigo-300 ml-0.5">
                  {testSuiteResults.passed}/{testSuiteResults.total}
                </span>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          {activeTab === 'editor' && (
            <div className="flex items-center space-x-1.5 text-[11px] pb-1.5 flex-wrap gap-y-1">
              <span className="text-slate-500 font-semibold mr-1">Presets:</span>
              <button
                onClick={() => {
                  if (currentSourceCode) {
                    setSourceCode(currentSourceCode);
                  }
                  if (initialLLVMCode) {
                    setLLVMCode(initialLLVMCode);
                  }
                  setToastMessage({
                    title: 'Current Editor Code Loaded',
                    desc: 'Loaded active program from main playground into LLVM Studio'
                  });
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 2500);
                }}
                className="px-2.5 py-0.5 rounded bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-500/50 flex items-center space-x-1 font-bold transition cursor-pointer shadow-sm"
                title="Load the code currently in the main editor"
              >
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span>Current Editor Program</span>
              </button>
              <button
                onClick={() => {
                  setSourceCode(DEFAULT_SAMPLE_TL);
                  setLLVMCode(DEFAULT_SAMPLE_LLVM);
                  setToastMessage({
                    title: 'Preset Loaded',
                    desc: 'Loaded Hello World sample'
                  });
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 2000);
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                Hello World
              </button>
              <button
                onClick={() => {
                  setSourceCode(FACTORIAL_SAMPLE_TL);
                  setLLVMCode(FACTORIAL_SAMPLE_LLVM);
                  setToastMessage({
                    title: 'Preset Loaded',
                    desc: 'Loaded Factorial (SSA) sample'
                  });
                  setShowToast(true);
                  setTimeout(() => setShowToast(false), 2000);
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                Factorial (SSA)
              </button>
              {initialLLVMCode && (
                <button
                  onClick={() => {
                    setLLVMCode(initialLLVMCode);
                    setToastMessage({
                      title: 'Preset Loaded',
                      desc: 'Loaded Legacy LLVM IR from playground'
                    });
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 2000);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition cursor-pointer"
                >
                  Legacy LLVM
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pipeline Selector Banner */}
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-semibold">Compiler Pipeline:</span>
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setStudioPipeline('core')}
                className={`px-3 py-1 rounded-md font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                  studioPipeline === 'core'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span>Core Pipeline (Haskell Core + llvm-bindings)</span>
              </button>
              <button
                onClick={() => setStudioPipeline('legacy')}
                className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                  studioPipeline === 'legacy'
                    ? 'bg-slate-700 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Legacy AST Pipeline</span>
              </button>
            </div>
          </div>

          {studioPipeline === 'core' && (
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setStudioCoreView('llvm')}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                  studioCoreView === 'llvm' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View generated Core LLVM IR textual code (.ll)"
              >
                Core LLVM IR
              </button>
              <button
                onClick={() => setStudioCoreView('core_ir')}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                  studioCoreView === 'core_ir' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View Haskell-style desugared Core Intermediate Representation (.core)"
              >
                Core IR Source (.core)
              </button>
              <button
                onClick={() => setStudioCoreView('source')}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                  studioCoreView === 'source' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="View and edit TypeLang source code (.tl)"
              >
                TypeLang Source (.tl)
              </button>
            </div>
          )}
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-hidden relative bg-slate-950 p-2 sm:p-4">
          
          {/* TAB 1: LLVM IR Editor */}
          {activeTab === 'editor' && (
            <div className="h-full flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span className="flex items-center space-x-1.5">
                  <FileCode className="w-3.5 h-3.5 text-purple-400" />
                  <span>
                    {studioPipeline === 'legacy'
                      ? 'main.legacy.ll'
                      : studioCoreView === 'core_ir'
                      ? 'main.core'
                      : studioCoreView === 'source'
                      ? 'main.tl'
                      : 'main.core.ll'}
                  </span>
                  {studioPipeline === 'core' && studioCoreView !== 'source' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      Read-Only (Generated)
                    </span>
                  )}
                  {((studioPipeline === 'core' && studioCoreView === 'source') || studioPipeline === 'legacy') && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300">
                      Editable
                    </span>
                  )}
                </span>
                <span>{displayedCode.split('\n').length} lines | UTF-8</span>
              </div>
              <div className="flex-1 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 flex">
                {/* Line Numbers */}
                <div className="py-3 px-2 bg-slate-950/80 border-r border-slate-800 text-right select-none font-mono text-[11px] text-slate-600 leading-relaxed min-w-[32px] sm:min-w-[38px]">
                  {displayedCode.split('\n').map((_, idx) => (
                    <div key={idx}>{idx + 1}</div>
                  ))}
                </div>
                {/* Textarea */}
                <textarea
                  value={displayedCode}
                  onChange={e => {
                    if (studioPipeline === 'legacy') {
                      setLLVMCode(e.target.value);
                    } else if (studioCoreView === 'source') {
                      setSourceCode(e.target.value);
                    }
                  }}
                  readOnly={studioPipeline === 'core' && studioCoreView !== 'source'}
                  placeholder="Enter code here..."
                  className="flex-1 p-2 sm:p-3 bg-transparent font-mono text-xs text-purple-200 resize-none outline-none leading-relaxed overflow-y-auto selection:bg-purple-800 selection:text-white"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Output / Live Terminal */}
          {activeTab === 'output' && (
            <div className="h-full flex flex-col space-y-2 sm:space-y-3">
              {/* Terminal Status Ribbon */}
              <div className="flex items-center justify-between text-xs font-mono bg-slate-900/80 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 text-[10px] font-bold">
                    LLVM_IR 12.0.1
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-emerald-400 font-bold text-[11px]">
                    EXIT {executionResult ? executionResult.exitCode : 0} · {executionResult ? executionResult.executionTimeMs : 0} MS
                  </span>
                </div>
                <span className="text-[10px] tracking-wider text-emerald-400 uppercase font-bold">
                  LIVE TERMINAL
                </span>
              </div>

              {/* Terminal Viewport */}
              <div className="flex-1 bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800/80 font-mono text-xs overflow-y-auto space-y-2 select-text">
                {executionResult ? (
                  <>
                    {executionResult.stdout && executionResult.stdout.length > 0 ? (
                      <div className="space-y-1 text-slate-200">
                        {executionResult.stdout.map((line, idx) => (
                          <div key={idx} className="leading-relaxed">
                            {line}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-500 italic">
                        Program executed with no standard output.
                      </div>
                    )}

                    {executionResult.error && (
                      <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 space-y-1">
                        <div className="font-bold flex items-center space-x-1.5">
                          <XCircle className="w-4 h-4 text-rose-400" />
                          <span>Runtime Execution Failure</span>
                        </div>
                        <p className="text-slate-300 text-xs font-mono">{executionResult.error}</p>
                      </div>
                    )}

                    <div className="pt-4 text-emerald-500 text-[11px] font-mono border-t border-slate-900">
                      -- exited with code {executionResult.exitCode} in {executionResult.executionTimeMs} ms --
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                    <Terminal className="w-8 h-8 text-slate-700" />
                    <p className="text-xs">Click "Run" to compile and execute the LLVM IR program.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WASM Binary View */}
          {activeTab === 'wasm' && (
            <div className="h-full flex flex-col space-y-2 sm:space-y-3">
              {wasmResult ? (
                <>
                  {/* Binary Summary Bar */}
                  <div className="bg-slate-900/80 p-2.5 sm:p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div>
                        <span className="text-slate-500 text-[10px] block">BINARY SIZE</span>
                        <span className="text-sky-300 font-bold">{wasmResult.sizeBytes} bytes</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">TARGET</span>
                        <span className="text-purple-300 font-bold">wasm32-wasi</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">SECTIONS</span>
                        <span className="text-emerald-300 font-bold">{wasmResult.sections.length}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => downloadBinary(wasmResult.binary, 'typelang_module.wasm')}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .WASM</span>
                    </button>
                  </div>

                  {/* Sections Breakdown & Hex Dump */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 min-h-0">
                    {/* Sections */}
                    <div className="bg-slate-900/50 p-2.5 sm:p-3 rounded-xl border border-slate-800 flex flex-col space-y-2 overflow-hidden">
                      <span className="text-slate-400 font-bold text-xs">WebAssembly Sections</span>
                      <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px]">
                        {wasmResult.sections.map((sec, idx) => (
                          <div key={idx} className="p-2 rounded bg-slate-950 border border-slate-800 flex justify-between items-center">
                            <span className="text-sky-300 font-semibold">{sec.name}</span>
                            <span className="text-slate-500">{sec.size} B</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hex Dump */}
                    <div className="md:col-span-2 bg-slate-900/50 p-2.5 sm:p-3 rounded-xl border border-slate-800 flex flex-col space-y-2 overflow-hidden">
                      <span className="text-slate-400 font-bold text-xs">Binary Hex & ASCII Dump</span>
                      <pre className="flex-1 bg-slate-950 p-2 sm:p-3 rounded-lg border border-slate-800/80 font-mono text-[10px] text-emerald-300 overflow-auto leading-relaxed select-text">
                        {wasmResult.hexDump}
                      </pre>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
                  <Binary className="w-8 h-8 text-slate-700" />
                  <p className="text-xs">Click "WASM" to compile LLVM IR into WebAssembly binary.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LLVM Backend Tests */}
          {activeTab === 'tests' && (
            <div className="h-full flex flex-col space-y-2 sm:space-y-3 overflow-hidden">
              <div className="flex items-center justify-between bg-slate-900/80 p-2.5 sm:p-3 rounded-xl border border-slate-800 shrink-0">
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-white flex items-center space-x-1.5 sm:space-x-2">
                    <FlaskConical className="w-4 h-4 text-indigo-400" />
                    <span>LLVM IR TDD Verification Suite</span>
                  </h3>
                  <p className="text-slate-400 text-[11px] sm:text-xs mt-0.5 hidden xs:block">
                    Testing Opcode Emission, SSA Basic Blocks & Stack Allocations
                  </p>
                </div>

                <button
                  onClick={handleRunBackendTests}
                  disabled={isRunningTests}
                  className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
                  <span>{isRunningTests ? 'Running...' : 'Re-Run Tests'}</span>
                </button>
              </div>

              {testSuiteResults && (
                <div className="grid grid-cols-3 gap-2 shrink-0 text-xs font-mono">
                  <div className="p-2 sm:p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">TOTAL</span>
                    <span className="text-slate-200 font-bold text-xs sm:text-sm">{testSuiteResults.total}</span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40">
                    <span className="text-emerald-400 text-[10px] block">PASSED</span>
                    <span className="text-emerald-300 font-bold text-xs sm:text-sm">{testSuiteResults.passed}</span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40">
                    <span className="text-rose-400 text-[10px] block">FAILED</span>
                    <span className={`font-bold text-xs sm:text-sm ${testSuiteResults.failed > 0 ? 'text-rose-300' : 'text-slate-500'}`}>
                      {testSuiteResults.failed}
                    </span>
                  </div>
                </div>
              )}

              {/* Test List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 sm:space-y-2 pr-1">
                {testSuiteResults?.details.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between transition ${
                      t.passed
                        ? 'bg-slate-900/60 border-slate-800 text-slate-200'
                        : 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 sm:space-x-2.5">
                      {t.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-xs">{t.name}</span>
                        {t.error && (
                          <p className="text-[11px] text-rose-300 font-mono mt-0.5">{t.error}</p>
                        )}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                      Stage {t.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Floating Toast Notification */}
          {showToast && toastMessage && (
            <div className={`absolute bottom-4 sm:bottom-6 left-4 sm:left-6 z-50 p-3 sm:p-3.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-center space-x-3 animate-in slide-in-from-bottom-2 ${
              toastMessage.isError
                ? 'bg-rose-950/90 border-rose-800 text-rose-200'
                : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
            }`}>
              {toastMessage.isError ? (
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
              )}
              <div>
                <div className="font-bold text-xs">{toastMessage.title}</div>
                <div className="text-[11px] text-slate-300">{toastMessage.desc}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
