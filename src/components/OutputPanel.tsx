import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  AlertTriangle,
  Network,
  Cpu,
  Code,
  Clock,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Play,
  RotateCw,
  ChevronDown,
  ChevronRight,
  FileCode,
  ShieldCheck,
  Check,
  Filter,
  Wand2,
  Sparkles,
  Box,
  Layers,
  Eye,
  FileJson,
  Braces,
  Binary,
  Download
} from 'lucide-react';
import { Diagnostic, QuickFix, typeToString, typeASTToString } from '../lang/types';
import { TypeEnv } from '../lang/checker';
import { Program, Statement } from '../lang/ast';
import { runCompilerTestSuite, TestResult } from '../lang/tests';
import { JSSandbox, JSRuntimeResult } from '../lang/js_runtime';
import { LLVMInterpreter, LLVMExecutionResult } from '../lang/llvm_interpreter';
import { useWasmCompiler } from '../lang/wasmCompiler';
import { LiveAppPreview } from './LiveAppPreview';
import { FFIPanel } from './FFIPanel';
import { TypeExplorer } from './TypeExplorer';
import { ASTViewer } from './ASTViewer';
import { TypeHierarchyVisualizer } from './TypeHierarchyVisualizer';
import { StdLibExplorer } from './StdLibExplorer';
import { AnsiRenderer } from './AnsiRenderer';
import { MonitorPlay, Crosshair, SearchCode, GitBranch, BookOpen } from 'lucide-react';

interface OutputPanelProps {
  stdout: string[];
  diagnostics: Diagnostic[];
  programAST: Program | null;
  typeEnv: TypeEnv | null;
  llvmCode: string;
  jsCode: string;
  nodeCode?: string;
  executionTimeMs: number | null;
  hasError: boolean;
  onClearStdout: () => void;
  onLoadCodeIntoEditor?: (code: string, testName: string) => void;
  onApplyQuickFix?: (fix: QuickFix) => void;
  onOpenLLVMStudio?: () => void;
  code?: string;
  cursorPos?: { line: number; col: number; word?: string } | null;
  activeTab?: 'console' | 'explorer' | 'stdlib' | 'types' | 'hierarchy' | 'preview' | 'ffi' | 'ast' | 'env' | 'codegen' | 'tests';
  onTabChange?: (tab: 'console' | 'explorer' | 'stdlib' | 'types' | 'hierarchy' | 'preview' | 'ffi' | 'ast' | 'env' | 'codegen' | 'tests') => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  stdout,
  diagnostics,
  programAST,
  typeEnv,
  llvmCode,
  jsCode,
  nodeCode = '',
  executionTimeMs,
  hasError,
  onClearStdout,
  onLoadCodeIntoEditor,
  onApplyQuickFix,
  onOpenLLVMStudio,
  code = '',
  cursorPos = null,
  activeTab: controlledActiveTab,
  onTabChange
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'console' | 'explorer' | 'stdlib' | 'types' | 'hierarchy' | 'preview' | 'ffi' | 'ast' | 'env' | 'codegen' | 'tests'>('console');
  
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
  const setActiveTab = (tab: 'console' | 'explorer' | 'stdlib' | 'types' | 'hierarchy' | 'preview' | 'ffi' | 'ast' | 'env' | 'codegen' | 'tests') => {
    if (onTabChange) {
      onTabChange(tab);
    }
    setInternalActiveTab(tab);
  };
  const [codegenSubTab, setCodegenSubTab] = useState<'llvm' | 'js' | 'node'>('js');
  const [copiedTarget, setCopiedTarget] = useState<string | null>(null);
  const [showStdLibModules, setShowStdLibModules] = useState<boolean>(false);
  const [sandboxResult, setSandboxResult] = useState<JSRuntimeResult | null>(null);
  const [isRunningSandbox, setIsRunningSandbox] = useState<boolean>(false);
  const [llvmResult, setLlvmResult] = useState<LLVMExecutionResult | null>(null);
  const [isRunningLLVM, setIsRunningLLVM] = useState<boolean>(false);
  const [consoleFilter, setConsoleFilter] = useState<string>('');
  const [isWordWrapEnabled, setIsWordWrapEnabled] = useState<boolean>(false);

  const { compileLLVMToBinary, downloadBinary, isCompiling: isBuildingWasm } = useWasmCompiler();

  const handleBuildAndDownloadWasm = async () => {
    try {
      const res = await compileLLVMToBinary(llvmCode);
      downloadBinary(res.binary, 'program.wasm');
    } catch (e) {
      console.error('Failed to compile WASM binary', e);
    }
  };

  const handleRunLLVM = () => {
    setIsRunningLLVM(true);
    setTimeout(() => {
      const interpreter = new LLVMInterpreter();
      const res = interpreter.execute(llvmCode);
      setLlvmResult(res);
      setIsRunningLLVM(false);
    }, 40);
  };

  const handleCopyCodegen = (text: string, target: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTarget(target);
    setTimeout(() => setCopiedTarget(null), 2000);
  };

  const handleRunSandbox = () => {
    setIsRunningSandbox(true);
    const targetCode = codegenSubTab === 'node' ? nodeCode : jsCode;
    setTimeout(() => {
      const res = JSSandbox.execute(targetCode);
      setSandboxResult(res);
      setIsRunningSandbox(false);
    }, 40);
  };

  // Test Runner State
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [testFilter, setTestFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  // Automatically execute test suite once
  const executeSuite = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const results = runCompilerTestSuite();
      setTestResults(results);
      setIsRunningTests(false);
    }, 50);
  };

  useEffect(() => {
    executeSuite();
  }, []);

  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const totalDurationMs = testResults.reduce((acc, r) => acc + r.executionTimeMs, 0);

  const filteredResults = testResults.filter(r => {
    if (testFilter === 'passed') return r.passed;
    if (testFilter === 'failed') return !r.passed;
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border-l border-slate-800 text-slate-200">
      {/* Navigation Tabs */}
      <div className="bg-slate-950 px-3 border-b border-slate-800 flex items-center justify-between overflow-x-auto">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('console')}
            className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'console'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console</span>
            {stdout.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
                {stdout.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('explorer')}
            className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'explorer'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <SearchCode className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-amber-300">Type Explorer</span>
            {cursorPos?.word ? (
              <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-mono">
                {cursorPos.word}
              </span>
            ) : (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-500/20 text-indigo-300 font-mono uppercase tracking-wider">
                Live
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'hierarchy'
                ? 'border-cyan-500 text-cyan-300 bg-slate-900/50 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-cyan-300">Type Hierarchy</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-500/20 text-cyan-300 font-mono uppercase tracking-wider">
              D3.js
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stdlib')}
            className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'stdlib'
                ? 'border-emerald-500 text-emerald-300 bg-slate-900/50 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-emerald-300">StdLib Explorer</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-mono uppercase tracking-wider">
              Source
            </span>
          </button>

          <button
            onClick={() => setActiveTab('types')}
            className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'types'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Type Diagnostics</span>
            {diagnostics.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  hasError ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {diagnostics.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ffi')}
            className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'ffi'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Braces className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold text-indigo-300">NPM FFI & .d.ts</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-500/20 text-indigo-300 font-mono uppercase tracking-wider">
              FFI Parser
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'tests'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
            <span>Test Runner</span>
            {totalTests > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  failedTests > 0
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {passedTests}/{totalTests}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ast')}
            className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'ast'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-purple-400" />
            <span>AST Tree</span>
            {programAST && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-purple-500/20 text-purple-300 font-mono">
                {programAST.statements.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('env')}
            className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'env'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Symbol Environment</span>
          </button>

          <button
            onClick={() => setActiveTab('codegen')}
            className={`flex items-center space-x-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'codegen'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>LLVM IR / Target</span>
          </button>
        </div>

        {/* Execution Summary Status */}
        {executionTimeMs !== null && (
          <div className="flex items-center space-x-2 text-xs py-1 px-2.5 rounded bg-slate-900 border border-slate-800 hidden sm:flex">
            {hasError ? (
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className={hasError ? 'text-rose-400' : 'text-emerald-400'}>
              {hasError ? 'Type Error' : 'Success'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-mono text-[11px] flex items-center space-x-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{executionTimeMs} ms</span>
            </span>
          </div>
        )}
      </div>

      {/* Tab Panels */}
      <div className={`flex-1 min-h-0 relative ${activeTab === 'hierarchy' || activeTab === 'stdlib' ? 'overflow-hidden p-0' : 'overflow-auto p-4 font-mono text-sm'}`}>
        {/* Tab 1: Console Output */}
        {activeTab === 'console' && (
          <div className="space-y-2 h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-slate-500 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span>Standard Output (stdout)</span>
                {stdout.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[10px]">
                    {stdout.length} line(s)
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsWordWrapEnabled(!isWordWrapEnabled)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer border ${
                    isWordWrapEnabled
                      ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title="Toggle Text Word Wrapping (Off by Default)"
                >
                  Wrap: {isWordWrapEnabled ? 'On' : 'Off'}
                </button>
                {stdout.length > 0 && (
                  <input
                    type="text"
                    placeholder="Filter logs..."
                    value={consoleFilter}
                    onChange={e => setConsoleFilter(e.target.value)}
                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 text-[11px] focus:outline-none focus:border-indigo-500"
                  />
                )}
                {stdout.length > 0 && (
                  <button
                    onClick={onClearStdout}
                    className="hover:text-slate-300 underline cursor-pointer"
                  >
                    Clear Console
                  </button>
                )}
              </div>
            </div>
            {stdout.length === 0 ? (
              <div className="text-slate-600 italic py-8 text-center text-xs">
                No output produced. Run your program using the Run button above.
              </div>
            ) : (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-emerald-300 font-mono text-xs leading-relaxed max-h-[550px] overflow-x-auto shadow-inner select-text">
                {stdout
                  .filter(line => !consoleFilter || line.toLowerCase().includes(consoleFilter.toLowerCase()))
                  .map((line, i) => (
                    <AnsiRenderer
                      key={i}
                      text={line}
                      className={`font-mono text-xs leading-relaxed ${
                        isWordWrapEnabled ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
                      }`}
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Interactive Type Explorer */}
        {activeTab === 'explorer' && (
          <TypeExplorer
            typeEnv={typeEnv}
            programAST={programAST}
            code={code}
            cursorPos={cursorPos}
            onSelectSymbol={(sym) => {
              // symbol selected
            }}
          />
        )}

        {/* Tab: D3.js Type Hierarchy Visualization */}
        {activeTab === 'hierarchy' && (
          <TypeHierarchyVisualizer
            typeEnv={typeEnv}
            programAST={programAST}
            code={code}
            onSelectSymbol={(sym) => {
              // symbol selected
            }}
          />
        )}

        {/* Tab: Standard Library Module Explorer */}
        {activeTab === 'stdlib' && (
          <StdLibExplorer
            onLoadCodeIntoEditor={onLoadCodeIntoEditor}
          />
        )}

        {/* Tab 2: Type Diagnostics */}
        {activeTab === 'types' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 pb-2 border-b border-slate-800 flex justify-between items-center">
              <span>Type Checker & GADT Refinement Logs</span>
              <span className="text-indigo-400">Bidirectional Type Inference Engine</span>
            </div>
            {diagnostics.length === 0 ? (
              <div className="bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 p-4 rounded-lg text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>All types verified! Zero type errors or missing match arms detected.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {diagnostics.map((diag, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs flex flex-col space-y-2.5 ${
                      diag.severity === 'error'
                        ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
                        : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                          {diag.severity}
                        </span>
                        {diag.category && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                            {diag.category}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        Line {diag.line}, Column {diag.col}
                      </span>
                    </div>

                    <p className="font-mono text-sm font-medium">{diag.message}</p>

                    {/* Ariadne Diagnostic Report Box */}
                    {diag.ariadneReport ? (
                      <div className="bg-slate-950 rounded-lg border border-slate-800 shadow-inner overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/80">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                              Ariadne
                            </span>
                            {diag.labels && diag.labels.length > 0 && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {diag.labels.length} label{diag.labels.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">
                            ANSI Colors & Unicode Frames
                          </span>
                        </div>
                        <div className="p-3">
                          <AnsiRenderer
                            text={diag.ariadneReport}
                            showCopyButton={true}
                            className="text-[11px]"
                          />
                        </div>
                      </div>
                    ) : diag.ariadneReportPlain ? (
                      <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-200/90 overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                        {diag.ariadneReportPlain}
                      </pre>
                    ) : diag.codeSnippet ? (
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs overflow-x-auto space-y-0.5">
                        <div className="text-slate-400 flex space-x-2">
                          <span className="text-slate-600 select-none w-6 text-right font-mono">{diag.line} |</span>
                          <span className="text-slate-200">{diag.codeSnippet}</span>
                        </div>
                        {diag.caretMarker && (
                          <div className="text-rose-400 flex space-x-2">
                            <span className="text-slate-600 select-none w-6 text-right"></span>
                            <span className="whitespace-pre font-bold">{diag.caretMarker}</span>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Quick Fixes */}
                    {diag.quickFixes && diag.quickFixes.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-2">
                        {diag.quickFixes.map((fix, fIdx) => (
                          <button
                            key={fIdx}
                            onClick={() => onApplyQuickFix && onApplyQuickFix(fix)}
                            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-[11px] font-medium transition cursor-pointer"
                          >
                            <Wand2 className="w-3 h-3 text-indigo-300" />
                            <span>{fix.title}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: NPM FFI & TS Declarations Workbench */}
        {activeTab === 'ffi' && (
          <div className="h-full -m-4">
            <FFIPanel
              onLoadCodeIntoEditor={onLoadCodeIntoEditor}
              onAppendCodeToEditor={(codeToAppend) => {
                if (onLoadCodeIntoEditor) {
                  onLoadCodeIntoEditor(codeToAppend + "\n\n", "FFI Bindings");
                }
              }}
            />
          </div>
        )}

        {/* Tab 3: Test Runner Panel */}
        {activeTab === 'tests' && (
          <div className="space-y-4 font-sans text-xs">
            {/* Control Bar & Stats Header */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
                      <span>Compiler Unit Test Suite</span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-500/30">
                        v0.1 Spec
                      </span>
                    </h2>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Automated verification for GADT refinement, pattern matching, type unification, and evaluation.
                    </p>
                  </div>
                </div>

                <button
                  onClick={executeSuite}
                  disabled={isRunningTests}
                  className="flex items-center justify-center space-x-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
                  <span>{isRunningTests ? 'Running Suite...' : 'Run Test Suite'}</span>
                </button>
              </div>

              {/* Status Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 font-mono text-[11px]">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block mb-0.5">TOTAL TESTS</span>
                  <span className="text-slate-100 font-bold text-sm">{totalTests}</span>
                </div>
                <div className="bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-800/30">
                  <span className="text-emerald-400 text-[10px] block mb-0.5">PASSED</span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-emerald-300 font-bold text-sm">{passedTests}</span>
                    <span className="text-emerald-500 text-[10px]">
                      ({totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="bg-rose-950/20 p-2.5 rounded-lg border border-rose-800/30">
                  <span className="text-rose-400 text-[10px] block mb-0.5">FAILED</span>
                  <span className={`font-bold text-sm ${failedTests > 0 ? 'text-rose-300' : 'text-slate-400'}`}>
                    {failedTests}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-slate-400 text-[10px] block mb-0.5">TOTAL DURATION</span>
                  <span className="text-indigo-300 font-bold text-sm">{totalDurationMs} ms</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <span className="text-slate-500 px-2 flex items-center space-x-1">
                    <Filter className="w-3 h-3" />
                    <span>Filter:</span>
                  </span>
                  <button
                    onClick={() => setTestFilter('all')}
                    className={`px-2.5 py-1 rounded cursor-pointer transition ${
                      testFilter === 'all'
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({totalTests})
                  </button>
                  <button
                    onClick={() => setTestFilter('passed')}
                    className={`px-2.5 py-1 rounded cursor-pointer transition ${
                      testFilter === 'passed'
                        ? 'bg-emerald-600 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Passed ({passedTests})
                  </button>
                  <button
                    onClick={() => setTestFilter('failed')}
                    className={`px-2.5 py-1 rounded cursor-pointer transition ${
                      testFilter === 'failed'
                        ? 'bg-rose-600 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Failed ({failedTests})
                  </button>
                </div>

                <div className="text-slate-400 text-[11px] hidden md:flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TypeLang Language Logic Verified</span>
                </div>
              </div>
            </div>

            {/* Test Cards List */}
            <div className="space-y-2.5">
              {filteredResults.length === 0 ? (
                <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center text-slate-500">
                  No tests match the selected filter.
                </div>
              ) : (
                filteredResults.map(res => {
                  const isExpanded = expandedTestId === res.test.id;
                  return (
                    <div
                      key={res.test.id}
                      className={`rounded-xl border transition-all ${
                        res.passed
                          ? 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                          : 'bg-rose-950/20 border-rose-800/50 hover:border-rose-700'
                      }`}
                    >
                      {/* Test Card Header */}
                      <div
                        onClick={() => setExpandedTestId(isExpanded ? null : res.test.id)}
                        className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          {res.passed ? (
                            <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
                              <Check className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-full bg-rose-500/10 text-rose-400 shrink-0 border border-rose-500/20">
                              <XCircle className="w-4 h-4" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-slate-200 text-xs truncate">
                                {res.test.name}
                              </h3>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 shrink-0">
                                {res.test.category}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] truncate mt-0.5">
                              {res.test.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0 ml-2">
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                            {res.executionTimeMs} ms
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wide uppercase ${
                              res.passed
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {res.passed ? 'PASSED' : 'FAILED'}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                      </div>

                      {/* Expandable Details Section */}
                      {isExpanded && (
                        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 rounded-b-xl space-y-3 font-mono text-[11px]">
                          {/* Error Banner if failed */}
                          {!res.passed && res.errorMessage && (
                            <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 space-y-1">
                              <div className="font-bold flex items-center space-x-1">
                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                <span>Failure Details</span>
                              </div>
                              <p className="text-slate-300 leading-relaxed">{res.errorMessage}</p>
                            </div>
                          )}

                          {/* Code Snippet & Load Button */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-slate-400 text-[10px]">
                              <span>TEST CODE SNIPPET</span>
                              {onLoadCodeIntoEditor && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onLoadCodeIntoEditor(res.test.code, res.test.name);
                                  }}
                                  className="flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
                                >
                                  <FileCode className="w-3 h-3" />
                                  <span>Load in Editor</span>
                                </button>
                              )}
                            </div>
                            <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 text-slate-300 text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                              {res.test.code}
                            </pre>
                          </div>

                          {/* Test Assertions Breakdown */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                              <span className="text-slate-500 text-[10px] block">EXPECTED TYPE ERRORS</span>
                              <span className="text-slate-200 font-bold">{res.test.expectedTypeErrors}</span>
                              <span className="text-slate-500 text-[10px] block pt-1">ACTUAL DETECTED</span>
                              <span
                                className={`font-bold ${
                                  res.typeErrorsCount === res.test.expectedTypeErrors
                                    ? 'text-emerald-400'
                                    : 'text-rose-400'
                                }`}
                              >
                                {res.typeErrorsCount}
                              </span>
                            </div>

                            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                              <span className="text-slate-500 text-[10px] block">EXPECTED STDOUT SUBSTRINGS</span>
                              {res.test.expectedStdoutSubstrings && res.test.expectedStdoutSubstrings.length > 0 ? (
                                <div className="space-y-0.5">
                                  {res.test.expectedStdoutSubstrings.map((sub, i) => (
                                    <div key={i} className="text-emerald-300 text-[10px] truncate">
                                      • "{sub}"
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-slate-500 italic text-[10px]">None required</span>
                              )}
                            </div>
                          </div>

                          {/* Actual Stdout Output */}
                          {res.actualStdout.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-slate-400 text-[10px] block">ACTUAL STDOUT OUTPUT</span>
                              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-emerald-300 space-y-0.5 max-h-32 overflow-y-auto">
                                {res.actualStdout.map((line, idx) => (
                                  <div key={idx} className="truncate">
                                    {line}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 4: AST Inspector */}
        {activeTab === 'ast' && (
          <ASTViewer
            programAST={programAST}
            code={code}
          />
        )}

        {/* Tab 5: Symbol Environment */}
        {activeTab === 'env' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-500">
              <span>Inferred Top-Level Type Signatures, Modules & GADTs</span>
              <button
                onClick={() => setShowStdLibModules(!showStdLibModules)}
                className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] border transition cursor-pointer ${
                  showStdLibModules
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>{showStdLibModules ? 'Hide Standard Library' : 'Show Standard Library'}</span>
              </button>
            </div>
            {typeEnv ? (
              <div className="space-y-4">
                {/* GADTs */}
                {typeEnv.gadts.size > 0 && (
                  <div>
                    <h3 className="text-indigo-400 font-semibold mb-2 flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Declared GADTs & Sum Types</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Array.from(typeEnv.gadts.entries()).map(([gadtName, gadt], gIdx) => (
                        <div key={`gadt-${gadtName}-${gIdx}`} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                          <div className="text-purple-300 font-bold mb-1">
                            type {gadt.name}
                            {gadt.typeParams.length > 0 && `<${gadt.typeParams.join(', ')}>`}
                          </div>
                          <div className="text-slate-400 space-y-0.5 pl-2 border-l border-slate-800 text-[11px]">
                            {gadt.constructors.map((c, cIdx) => (
                              <div key={`ctor-${c.name}-${cIdx}`}>
                                • {c.name}(
                                {c.params.map(p => `${p.name}: ${typeToString(p.type)}`).join(', ')})
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top-Level Variables & Functions */}
                <div>
                  <h3 className="text-indigo-400 font-semibold mb-2 flex items-center space-x-1.5">
                    <Box className="w-3.5 h-3.5" />
                    <span>Bound Symbols & Functions</span>
                  </h3>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                    {Array.from(typeEnv.vars.entries()).map(([varName, varType], vIdx) => (
                      <div key={`var-${varName}-${vIdx}`} className="flex justify-between items-center py-0.5 border-b border-slate-900 last:border-0">
                        <span className="text-slate-200 font-semibold">{varName}</span>
                        <span className="text-emerald-400 font-mono text-[11px]">
                          {typeToString(varType)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Standard Library Submodules */}
                {showStdLibModules && typeEnv.modules.size > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <h3 className="text-sky-400 font-semibold mb-2 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Standard Library Submodules</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Array.from(typeEnv.modules.entries()).map(([modName, modEnv], mIdx) => (
                        <div key={`mod-${modName}-${mIdx}`} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                            <span className="font-bold text-sky-300 font-mono">module {modName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-950/60 text-sky-400 border border-sky-800/40">
                              {modEnv.vars.size} exports
                            </span>
                          </div>
                          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                            {Array.from(modEnv.vars.entries()).map(([fnName, fnType], fIdx) => (
                              <div key={`fn-${fnName}-${fIdx}`} className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-300 font-mono">{modName}.{fnName}</span>
                                <span className="text-emerald-400 font-mono truncate max-w-[180px]">
                                  {typeToString(fnType)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-600 italic py-8 text-center text-xs">
                No environment available.
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Codegen LLVM / JS / Node */}
        {activeTab === 'codegen' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div className="flex space-x-1.5 text-xs">
                <button
                  onClick={() => {
                    setCodegenSubTab('js');
                    setSandboxResult(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    codegenSubTab === 'js'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Client Web / ES2022
                </button>
                <button
                  onClick={() => {
                    setCodegenSubTab('node');
                    setSandboxResult(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    codegenSubTab === 'node'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Node.js / Express Server
                </button>
                <button
                  onClick={() => {
                    setCodegenSubTab('llvm');
                    setSandboxResult(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    codegenSubTab === 'llvm'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  LLVM IR Target
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {codegenSubTab === 'llvm' ? (
                  <>
                    <button
                      onClick={handleRunLLVM}
                      disabled={isRunningLLVM}
                      className="flex items-center space-x-1 px-3 py-1 text-xs rounded bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer shadow-sm disabled:opacity-50 font-medium"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isRunningLLVM ? 'Executing...' : 'Run LLVM IR'}</span>
                    </button>
                    <button
                      onClick={handleBuildAndDownloadWasm}
                      disabled={isBuildingWasm}
                      title="Compile and Download WebAssembly Binary (.wasm)"
                      className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white transition cursor-pointer border border-sky-500/30"
                    >
                      <Binary className="w-3.5 h-3.5" />
                      <span>{isBuildingWasm ? 'Building...' : '.WASM'}</span>
                    </button>
                    {onOpenLLVMStudio && (
                      <button
                        onClick={onOpenLLVMStudio}
                        className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-purple-300 hover:text-white transition cursor-pointer border border-purple-500/30"
                      >
                        <Box className="w-3.5 h-3.5" />
                        <span>LLVM Studio</span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleRunSandbox}
                    disabled={isRunningSandbox}
                    className="flex items-center space-x-1 px-3 py-1 text-xs rounded bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-sm disabled:opacity-50 font-medium"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isRunningSandbox ? 'Executing...' : 'Run in JS Sandbox'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const currentCode =
                      codegenSubTab === 'llvm'
                        ? llvmCode
                        : codegenSubTab === 'node'
                        ? nodeCode
                        : jsCode;
                    handleCopyCodegen(currentCode, codegenSubTab);
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer border border-slate-700"
                >
                  {copiedTarget === codegenSubTab ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <FileCode className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* LLVM Execution Result Card */}
            {codegenSubTab === 'llvm' && llvmResult && (
              <div className="bg-slate-950 p-3 rounded-lg border border-purple-500/40 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800">
                  <div className="flex items-center space-x-1.5 text-purple-300 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>LLVM IR Native Execution Output (EXIT {llvmResult.exitCode})</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">
                    ⏱ {llvmResult.executionTimeMs.toFixed(2)} ms · SSA Engine
                  </span>
                </div>

                {llvmResult.stdout && llvmResult.stdout.length > 0 ? (
                  <div className="space-y-0.5 text-slate-200 text-[11px] max-h-36 overflow-y-auto">
                    {llvmResult.stdout.map((line, idx) => (
                      <div key={idx} className="leading-relaxed">
                        {line}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 italic text-[11px]">
                    Code executed successfully with no stdout output.
                  </div>
                )}

                {llvmResult.error && (
                  <div className="p-2 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 text-[11px]">
                    {llvmResult.error}
                  </div>
                )}
              </div>
            )}

            {/* Sandbox Execution Result Card */}
            {sandboxResult && (
              <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/40 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>JS Sandbox Execution Output</span>
                  </div>
                  <span className="text-slate-400 text-[10px]">
                    ⏱ {sandboxResult.executionTimeMs.toFixed(2)} ms
                  </span>
                </div>

                {sandboxResult.stdout && sandboxResult.stdout.length > 0 ? (
                  <div className="space-y-0.5 text-emerald-300 text-[11px] max-h-36 overflow-y-auto">
                    {sandboxResult.stdout.map((line, idx) => (
                      <div key={idx} className="leading-relaxed">
                        {line}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 italic text-[11px]">
                    Code executed successfully with no stdout output.
                  </div>
                )}

                {sandboxResult.error && (
                  <div className="p-2 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 text-[11px]">
                    {sandboxResult.error}
                  </div>
                )}
              </div>
            )}

            <div className="text-[11px] text-slate-400 flex items-center justify-between bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800/80">
              <span>
                {codegenSubTab === 'llvm'
                  ? 'Target: x86_64 POSIX Native | Tagged Union Allocations & LLVM SSA form'
                  : codegenSubTab === 'node'
                  ? 'Target: Node.js 18+ Backend | CommonJS Express bindings & Server Prelude'
                  : 'Target: Browser ES2022 | Virtual DOM Hyperscript, DOM Mount & Web Prelude'}
              </span>
              <span className="font-mono text-slate-500 text-[10px]">
                {codegenSubTab === 'llvm'
                  ? `${llvmCode.split('\n').length} lines`
                  : codegenSubTab === 'node'
                  ? `${nodeCode.split('\n').length} lines`
                  : `${jsCode.split('\n').length} lines`}
              </span>
            </div>

            <pre className={`bg-slate-950 p-4 rounded-lg border border-slate-800 text-purple-300 text-xs overflow-x-auto leading-relaxed max-h-[500px] font-mono ${
              isWordWrapEnabled ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
            }`}>
              {codegenSubTab === 'llvm'
                ? llvmCode
                : codegenSubTab === 'node'
                ? nodeCode
                : jsCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
