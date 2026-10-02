import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CodeEditor } from './components/CodeEditor';
import { OutputPanel } from './components/OutputPanel';
import { SpecDoc } from './components/SpecDoc';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { PromptDialog } from './components/PromptDialog';
import { LiveAppPreview } from './components/LiveAppPreview';
import { EXAMPLES, ExampleProgram } from './lang/examples';
import { Lexer } from './lang/lexer';
import { Parser } from './lang/parser';
import { TypeChecker, TypeEnv } from './lang/checker';
import { Evaluator } from './lang/evaluator';
import { LLVMGenerator } from './lang/codegen';
import { Diagnostic, QuickFix } from './lang/types';
import { Program } from './lang/ast';
import { ProjectFile } from './types/project';
import { enrichDiagnostics, createDiagnosticFromError } from './lang/diagnostics';
import { MiniConsole } from './components/MiniConsole';
import { formatTypeLangCode } from './lang/formatter';
import { LLVMStudioModal } from './components/LLVMStudioModal';
import { VSCodeExportModal } from './components/VSCodeExportModal';
import { Code2, Terminal as TerminalIcon, Eye, Sparkles, Download, Play, X, ChevronDown, Wand2, Crosshair, GripVertical, ChevronsLeft, ChevronsRight, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'typelang_project_v1';

export default function App() {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>('');

  const [stdout, setStdout] = useState<string[]>([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [programAST, setProgramAST] = useState<Program | null>(null);
  const [typeEnv, setTypeEnv] = useState<TypeEnv | null>(null);
  const [llvmCode, setLlvmCode] = useState<string>('');
  const [jsCode, setJsCode] = useState<string>('');
  const [nodeCode, setNodeCode] = useState<string>('');
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const [isSpecOpen, setIsSpecOpen] = useState<boolean>(false);
  const [isLLVMStudioOpen, setIsLLVMStudioOpen] = useState<boolean>(false);
  const [isVSCodeModalOpen, setIsVSCodeModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Split pane sizing & resizability for laptop / desktop screens
  const splitAreaRef = React.useRef<HTMLDivElement>(null);
  const [splitPct, setSplitPct] = useState<number>(() => {
    const saved = localStorage.getItem('typelang_editor_split_pct');
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 15 && parsed <= 88) return parsed;
    }
    return 60; // 60% default is spacious and comfortable on laptops & large screens
  });
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const updateSplitPct = (pct: number) => {
    const clamped = Math.min(88, Math.max(15, Math.round(pct * 10) / 10));
    setSplitPct(clamped);
    setIsMaximized(false);
    localStorage.setItem('typelang_editor_split_pct', clamped.toString());
  };

  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX: number) => {
      if (!splitAreaRef.current) return;
      const rect = splitAreaRef.current.getBoundingClientRect();
      const newPct = ((clientX - rect.left) / rect.width) * 100;
      updateSplitPct(newPct);
    };

    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const onEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging]);

  // Mobile layout active tab
  const [isFabMinimized, setIsFabMinimized] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'output' | 'preview'>('editor');
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState<boolean>(false);
  const [outputPanelTab, setOutputPanelTab] = useState<'console' | 'explorer' | 'stdlib' | 'types' | 'hierarchy' | 'preview' | 'ffi' | 'ast' | 'env' | 'codegen' | 'tests'>('console');
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number; word?: string } | null>(null);

  // Confirmation Dialog State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'warning'
  });

  // Prompt Dialog State
  const [promptState, setPromptState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    initialValue: string;
    placeholder: string;
    onConfirm: (value: string) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    initialValue: '',
    placeholder: '',
    onConfirm: () => {},
  });

  const activeFile = files.find(f => f.id === activeFileId) || files[0];
  const activeCode = activeFile?.content || '';

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.files && parsed.files.length > 0) {
          setFiles(parsed.files);
          setActiveFileId(parsed.activeFileId || parsed.files[0].id);
          return;
        }
      } catch (e) {
        console.error('Failed to load project from localStorage', e);
      }
    }
    // Default to first example if nothing saved
    const initialFiles = [{ id: 'main', name: 'main.tl', content: EXAMPLES[0].code }];
    setFiles(initialFiles);
    setActiveFileId('main');
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (files.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        files,
        activeFileId,
        timestamp: new Date().toISOString()
      }));
    }
  }, [files, activeFileId]);

  const confirm = (title: string, message: string, onConfirm: () => void, variant: 'danger' | 'warning' | 'info' = 'warning') => {
    setConfirmState({ isOpen: true, title, message, onConfirm, variant });
  };

  const sortFilesByDependencies = (fileList: ProjectFile[]) => {
    const graph = new Map<string, string[]>();
    const moduleToFile = new Map<string, string>();
    
    // Pass 1: map modules to the files that define them
    for (const f of fileList) {
      const modMatch = f.content.match(/module\s+([A-Za-z_][A-Za-z0-9_]*)/g);
      if (modMatch) {
        for (const m of modMatch) {
          const modName = m.replace('module', '').trim();
          moduleToFile.set(modName, f.id);
        }
      }
    }
    
    // Pass 2: map files to their dependencies
    for (const f of fileList) {
      const deps = new Set<string>();
      const importMatch = f.content.match(/import\s+([A-Za-z_][A-Za-z0-9_]*)/g);
      if (importMatch) {
        for (const imp of importMatch) {
          const modName = imp.replace('import', '').trim();
          if (moduleToFile.has(modName) && moduleToFile.get(modName) !== f.id) {
            deps.add(moduleToFile.get(modName)!);
          }
        }
      }
      graph.set(f.id, Array.from(deps));
    }
    
    // Topological sort
    const result: ProjectFile[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    const visit = (f: ProjectFile) => {
      if (visited.has(f.id)) return;
      if (visiting.has(f.id)) return; // Circular dependency, just ignore
      visiting.add(f.id);
      
      const deps = graph.get(f.id) || [];
      for (const depId of deps) {
        const depFile = fileList.find(x => x.id === depId);
        if (depFile) {
          visit(depFile);
        }
      }
      
      visiting.delete(f.id);
      visited.add(f.id);
      result.push(f);
    };
    
    for (const f of fileList) {
      visit(f);
    }
    
    return result;
  };

  // Concatenate all files into a single virtual source for the compiler and track line mapping
  const getCombinedSourceWithMap = (fileList: ProjectFile[]) => {
    fileList = sortFilesByDependencies(fileList);
    
    if (fileList.length === 0) {
      return { combinedSource: '', map: [] };
    }

    if (fileList.length === 1) {
      return {
        combinedSource: fileList[0].content,
        map: [{
          fileId: fileList[0].id,
          filename: fileList[0].name,
          startLine: 1,
          endLine: fileList[0].content.split('\n').length,
          content: fileList[0].content
        }]
      };
    }

    let combinedSource = '';
    let currentLine = 1;
    const map: { fileId: string; filename: string; startLine: number; endLine: number; content: string }[] = [];

    fileList.forEach((f, index) => {
      const header = `// File: ${f.name}\n`;
      const fileLines = f.content.split('\n').length;
      const startLine = currentLine + 1; // Code starts after header line
      const endLine = startLine + fileLines - 1;

      combinedSource += header + f.content;
      if (index < fileList.length - 1) {
        combinedSource += '\n\n';
        currentLine = endLine + 2;
      } else {
        currentLine = endLine;
      }

      map.push({
        fileId: f.id,
        filename: f.name,
        startLine,
        endLine,
        content: f.content
      });
    });

    return { combinedSource, map };
  };

  const processDiagnostics = (rawDiagnostics: Diagnostic[], combinedSource: string, mapEntries: { fileId: string; filename: string; startLine: number; endLine: number; content: string }[]) => {
    return rawDiagnostics.map(diag => {
      const entry = mapEntries.find(e => diag.line >= e.startLine && diag.line <= e.endLine) || mapEntries[0];
      const lineOffset = entry ? entry.startLine - 1 : 0;
      const mappedLine = Math.max(1, diag.line - lineOffset);
      const mappedEndLine = diag.endLine ? Math.max(mappedLine, diag.endLine - lineOffset) : mappedLine;

      const fileDiag: Diagnostic = {
        ...diag,
        line: mappedLine,
        endLine: mappedEndLine,
        fileId: entry?.fileId,
        filename: entry?.filename
      };

      const fileContent = entry?.content || combinedSource;
      const filename = entry?.filename || 'main.tl';

      const enrichedList = enrichDiagnostics([fileDiag], fileContent, filename);
      return enrichedList[0] || fileDiag;
    });
  };

  const clearPreviewAndStatus = () => {
    setStdout([]);
    setDiagnostics([]);
    setProgramAST(null);
    setExecutionTimeMs(null);
    setHasError(false);
    setLastError(null);
    setJsCode('');
    setLlvmCode('');
    setNodeCode('');
    setIsLivePreviewOpen(false);
    setMobileTab('editor');
  };

  const runCode = () => {
    const { combinedSource, map } = getCombinedSourceWithMap(files);
    setIsExecuting(true);
    setHasError(false);
    setLastError(null);

    try {
      const lexer = new Lexer(combinedSource);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parseProgram();
      setProgramAST(ast);

      const typeChecker = new TypeChecker();
      const env = typeChecker.checkProgram(ast);
      setTypeEnv(env);

      const enriched = processDiagnostics(typeChecker.diagnostics, combinedSource, map);
      setDiagnostics(enriched);

      const typeErrors = typeChecker.diagnostics.filter(d => d.severity === 'error');
      if (typeErrors.length > 0) {
        setHasError(true);
        const report = enriched[0]?.ariadneReport || enriched[0]?.ariadneReportPlain || typeErrors[0].message;
        setStdout([
          `❌ Type Check Failed: ${typeErrors.length} error(s) found.\n\n${report}`
        ]);
        setExecutionTimeMs(null);
        return;
      }

      const evaluator = new Evaluator();
      const evalResult = evaluator.evalProgram(ast);
      setStdout(evalResult.stdout);
      setExecutionTimeMs(evalResult.executionTimeMs);

      const codegen = new LLVMGenerator();
      setLlvmCode(codegen.generateLLVM(ast));
      setJsCode(codegen.generateJS(ast));
      setNodeCode(codegen.generateNode(ast));
    } catch (err: any) {
      setHasError(true);
      const errorMessage = err.message || String(err);
      setLastError(errorMessage);
      const diag = createDiagnosticFromError(err, combinedSource);
      const enriched = processDiagnostics([diag], combinedSource, map);
      setDiagnostics(enriched);
      const reportStr = enriched[0]?.ariadneReport || enriched[0]?.ariadneReportPlain || errorMessage;
      setStdout([`❌ Error:\n\n${reportStr}`]);
      setExecutionTimeMs(null);
    } finally {
      setIsExecuting(false);
    }
  };

  // Debounced live type-checking
  useEffect(() => {
    const timer = setTimeout(() => {
      if (files.length === 0) return;
      const { combinedSource, map } = getCombinedSourceWithMap(files);
      try {
        const lexer = new Lexer(combinedSource);
        const tokens = lexer.tokenize();
        const parser = new Parser(tokens);
        const ast = parser.parseProgram();
        setProgramAST(ast);

        const typeChecker = new TypeChecker();
        const env = typeChecker.checkProgram(ast);
        setTypeEnv(env);

        const enriched = processDiagnostics(typeChecker.diagnostics, combinedSource, map);
        setDiagnostics(enriched);
        setHasError(typeChecker.diagnostics.some(d => d.severity === 'error'));
      } catch (err: any) {
        const diag = createDiagnosticFromError(err, combinedSource);
        const { combinedSource: src, map } = getCombinedSourceWithMap(files);
        setDiagnostics(processDiagnostics([diag], src, map));
        setHasError(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [files]);

  const handleSelectExample = (ex: ExampleProgram) => {
    confirm(
      "Load Example?",
      "This will replace your current files. Make sure you have saved your work.",
      () => {
        clearPreviewAndStatus();
        
        if (ex.files && ex.files.length > 0) {
          const newFiles = ex.files.map(f => ({
            id: Math.random().toString(36).substring(7),
            name: f.name,
            content: f.content
          }));
          setFiles(newFiles);
          // Set main.tl as active if it exists, otherwise the first one
          const mainFile = newFiles.find(f => f.name === 'main.tl');
          setActiveFileId(mainFile ? mainFile.id : newFiles[0].id);
        } else {
          const newFiles = [{ id: 'main', name: 'main.tl', content: ex.code || '' }];
          setFiles(newFiles);
          setActiveFileId('main');
        }
      },
      'warning'
    );
  };

  const handleFormatCode = () => {
    const formatted = formatTypeLangCode(activeCode);
    updateFileContent(activeFileId, formatted);
  };

  const updateFileContent = (id: string, content: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, content } : f));
  };

  const handleAddFile = () => {
    setPromptState({
      isOpen: true,
      title: 'New File',
      message: 'Enter a name for your new TypeLang module:',
      initialValue: '',
      placeholder: 'utils.tl',
      onConfirm: (name) => {
        const id = Math.random().toString(36).substring(7);
        const newFile = { id, name: name.endsWith('.tl') ? name : `${name}.tl`, content: '' };
        setFiles(prev => [...prev, newFile]);
        setActiveFileId(id);
      }
    });
  };

  const handleDeleteFile = (id: string) => {
    if (files.length <= 1) {
      alert('Cannot delete the last file.');
      return;
    }
    confirm(
      "Delete File?",
      "Are you sure you want to delete this file? This action cannot be undone.",
      () => {
        const newFiles = files.filter(f => f.id !== id);
        setFiles(newFiles);
        if (activeFileId === id) {
          setActiveFileId(newFiles[0].id);
        }
      },
      'danger'
    );
  };

  const handleRenameFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;
    
    setPromptState({
      isOpen: true,
      title: 'Rename File',
      message: `Enter a new name for "${file.name}":`,
      initialValue: file.name,
      placeholder: 'new_name.tl',
      onConfirm: (newName) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, name: newName.endsWith('.tl') ? newName : `${newName}.tl` } : f));
      }
    });
  };

  const handleApplyQuickFix = (fix: QuickFix) => {
    if (!fix.replacementText && !fix.title) return;
    const lines = activeCode.split('\n');
    const targetLineNum = fix.targetLine || 1;
    const targetIndex = Math.max(0, Math.min(lines.length - 1, targetLineNum - 1));

    if (fix.replacementText !== undefined) {
      const newLines = fix.replacementText.split('\n');
      lines.splice(targetIndex, 1, ...newLines);
      updateFileContent(activeFileId, lines.join('\n'));
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewProject = () => {
    confirm(
      "Create New Project?",
      "This will clear all your files. Make sure you have saved your work if needed.",
      () => {
        const newFiles = [{ id: 'main', name: 'main.tl', content: '' }];
        setFiles(newFiles);
        setActiveFileId('main');
        clearPreviewAndStatus();
      },
      'danger'
    );
  };

  const handleSaveProject = () => {
    const project = {
      name: 'TypeLang Project',
      files,
      activeFileId,
      timestamp: new Date().toISOString(),
      version: '0.2'
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project_${new Date().getTime()}.tl.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadProject = (file: File) => {
    confirm(
      "Load Project File?",
      "This will replace your current files with the contents of the project file.",
      () => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const project = JSON.parse(e.target?.result as string);
            if (project && project.files) {
              setFiles(project.files);
              setActiveFileId(project.activeFileId || project.files[0].id);
              clearPreviewAndStatus();
            } else if (project && typeof project.code === 'string') {
              // Backward compatibility
              setFiles([{ id: 'main', name: 'main.tl', content: project.code }]);
              setActiveFileId('main');
              clearPreviewAndStatus();
            }
          } catch (err) {
            alert('Failed to load project file: Invalid JSON');
          }
        };
        reader.readAsText(file);
      },
      'warning'
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 font-sans text-slate-100 overflow-hidden">
      <Header
        currentExampleId={''} // Not used as much now
        onSelectExample={handleSelectExample}
        onRun={runCode}
        isExecuting={isExecuting}
        onOpenSpec={() => setIsSpecOpen(true)}
        onOpenStdLib={() => {
          setOutputPanelTab('stdlib');
          setMobileTab('output');
        }}
        onOpenLLVMStudio={() => setIsLLVMStudioOpen(true)}
        onOpenVSCodeModal={() => setIsVSCodeModalOpen(true)}
        onFormat={handleFormatCode}
        onShare={handleShare}
        onNew={handleNewProject}
        onSave={handleSaveProject}
        onLoad={handleLoadProject}
        onTogglePreview={() => setIsLivePreviewOpen(!isLivePreviewOpen)}
        isPreviewOpen={isLivePreviewOpen}
        copied={copied}
      />

      <div ref={splitAreaRef} className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Mobile Navigation Bar */}
        <div className="md:hidden bg-slate-950 border-b border-slate-800 flex justify-around p-1 text-[10px] font-bold uppercase tracking-wider z-10">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-2.5 flex flex-col items-center justify-center space-y-1 rounded-lg transition-all ${
              mobileTab === 'editor' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Editor</span>
          </button>
          <button
            onClick={() => {
              setMobileTab('output');
              setOutputPanelTab('explorer');
            }}
            className={`flex-1 py-2.5 flex flex-col items-center justify-center space-y-1 rounded-lg transition-all ${
              mobileTab === 'output' && outputPanelTab === 'explorer' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>Explorer</span>
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2.5 flex flex-col items-center justify-center space-y-1 rounded-lg transition-all ${
              mobileTab === 'preview' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => {
              setMobileTab('output');
              if (outputPanelTab === 'explorer') setOutputPanelTab('console');
            }}
            className={`flex-1 py-2.5 flex flex-col items-center justify-center space-y-1 rounded-lg transition-all ${
              mobileTab === 'output' && outputPanelTab !== 'explorer' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'
            }`}
          >
            <TerminalIcon className="w-4 h-4" />
            <span>Output</span>
          </button>
        </div>

        {/* Project Quick Actions (Floating Bubble Group) */}
        <motion.div 
          drag
          dragMomentum={false}
          dragConstraints={{ left: -1200, right: 50, top: -800, bottom: 50 }}
          whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
          className="fixed bottom-24 right-6 flex flex-col items-end space-y-4 z-[60] pointer-events-none"
        >
          <div className="bg-indigo-500/20 backdrop-blur-md rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-tighter text-indigo-400 border border-indigo-500/30 mb-1 pointer-events-auto cursor-grab active:cursor-grabbing shadow-sm flex items-center space-x-1">
             <Code2 className="w-2.5 h-2.5" />
             <span>Drag Group</span>
          </div>
          <AnimatePresence mode="wait">
            {!isFabMinimized ? (
              <motion.div
                key="fab-group"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="flex flex-col space-y-4 pointer-events-auto items-end bg-slate-900/40 p-3 rounded-3xl border border-slate-800/50 backdrop-blur-sm"
              >
                <button
                  onClick={runCode}
                  disabled={isExecuting}
                  className="p-4 bg-emerald-600 text-white rounded-full shadow-2xl border-4 border-emerald-500/50 active:scale-95 transition-all"
                  title="Run Code"
                >
                  <Play className="w-7 h-7 fill-current" />
                </button>
                <button
                  onClick={handleNewProject}
                  className="p-3 bg-slate-800 text-indigo-400 rounded-full shadow-2xl border border-indigo-500/20 active:scale-95 transition-all"
                  title="New Project"
                >
                  <Sparkles className="w-6 h-6" />
                </button>
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json,.tl';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleLoadProject(file);
                    };
                    input.click();
                  }}
                  className="p-3 bg-slate-800 text-amber-400 rounded-full shadow-2xl border border-amber-500/20 active:scale-95 transition-all"
                  title="Load Project"
                >
                  <Download className="w-6 h-6 rotate-180" />
                </button>
                <button
                  onClick={handleSaveProject}
                  className="p-3 bg-indigo-600 text-white rounded-full shadow-2xl border border-indigo-500 active:scale-95 transition-all"
                  title="Save Project"
                >
                  <Download className="w-6 h-6" />
                </button>
                
                <button
                  onClick={() => setIsFabMinimized(true)}
                  className="p-2 bg-slate-900/80 backdrop-blur-sm text-slate-500 hover:text-white rounded-full border border-slate-700 active:scale-95 transition-all"
                  title="Minimize Actions"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="fab-toggle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setIsFabMinimized(false)}
                className="p-4 bg-indigo-600/20 hover:bg-indigo-600/40 backdrop-blur-md text-indigo-400 rounded-full shadow-2xl border border-indigo-500/30 active:scale-95 transition-all pointer-events-auto"
                title="Show Actions"
              >
                <Sparkles className="w-6 h-6" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Left Panel: Code Editor */}
        <div
          style={{
            flex: typeof window !== 'undefined' && window.innerWidth >= 768 ? (isMaximized ? '1 1 100%' : `0 0 ${splitPct}%`) : undefined,
            width: typeof window !== 'undefined' && window.innerWidth >= 768 ? (isMaximized ? '100%' : `${splitPct}%`) : undefined,
            maxWidth: typeof window !== 'undefined' && window.innerWidth >= 768 ? (isMaximized ? '100%' : `${splitPct}%`) : undefined
          }}
          className={`h-full min-h-0 relative ${
            mobileTab === 'editor' ? 'flex-1 md:flex-none block' : 'hidden md:block'
          } ${isMaximized ? 'w-full' : ''}`}
        >
          <CodeEditor
            files={files}
            activeFileId={activeFileId}
            onFileSelect={setActiveFileId}
            onFileAdd={handleAddFile}
            onFileDelete={handleDeleteFile}
            onFileRename={handleRenameFile}
            code={activeCode}
            onChange={val => updateFileContent(activeFileId, val)}
            onRun={runCode}
            onFormat={handleFormatCode}
            onApplyQuickFix={handleApplyQuickFix}
            diagnostics={diagnostics}
            onCursorChange={setCursorPos}
            onOpenTypeExplorer={() => {
              setMobileTab('output');
              setOutputPanelTab('explorer');
            }}
            splitPct={splitPct}
            onSetSplitPct={updateSplitPct}
            isMaximized={isMaximized}
            onToggleMaximize={() => setIsMaximized(!isMaximized)}
            onOpenVSCodeModal={() => setIsVSCodeModalOpen(true)}
          />

          <MiniConsole 
            stdout={stdout}
            executionTimeMs={executionTimeMs || undefined}
            error={lastError}
            onClear={() => {
              setStdout([]);
              setLastError(null);
            }}
          />
        </div>

        {/* Desktop Splitter Bar (Draggable Resize Divider) */}
        {!isMaximized && (
          <div
            onMouseDown={handleStartDrag}
            onTouchStart={handleStartDrag}
            onDoubleClick={() => updateSplitPct(60)}
            className={`hidden md:flex relative group cursor-col-resize select-none shrink-0 w-2.5 hover:w-3.5 bg-slate-950 border-x border-slate-800 hover:bg-indigo-600/40 active:bg-indigo-600 transition-all z-30 flex-col items-center justify-center ${
              isDragging ? 'bg-indigo-600 w-3.5 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : ''
            }`}
            title="Drag to resize panels. Double-click to reset to 60%."
          >
            {/* Grip handle indicator */}
            <div className="flex flex-col items-center space-y-1 py-4 px-0.5 rounded-full bg-slate-800/90 group-hover:bg-indigo-500 transition-colors pointer-events-none shadow-sm">
              <div className="w-1 h-1 rounded-full bg-slate-400 group-hover:bg-white transition-colors" />
              <div className="w-1 h-1 rounded-full bg-slate-400 group-hover:bg-white transition-colors" />
              <div className="w-1 h-1 rounded-full bg-slate-400 group-hover:bg-white transition-colors" />
              <div className="w-1 h-1 rounded-full bg-slate-400 group-hover:bg-white transition-colors" />
            </div>

            {/* Quick mini collapse / snap buttons on hover */}
            <div 
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex flex-col space-y-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 bg-slate-900/95 backdrop-blur-md p-1 rounded-2xl border border-slate-700 shadow-2xl pointer-events-auto"
            >
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  updateSplitPct(Math.max(20, splitPct - 10));
                }}
                className="w-6 h-6 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-full flex items-center justify-center shadow transition active:scale-90 cursor-pointer"
                title="Shrink Editor (-10%)"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  updateSplitPct(60);
                }}
                className="w-6 h-6 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-full flex items-center justify-center shadow transition active:scale-90 cursor-pointer text-[10px] font-bold"
                title="Reset to Default (60%)"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  updateSplitPct(Math.min(85, splitPct + 10));
                }}
                className="w-6 h-6 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-full flex items-center justify-center shadow transition active:scale-90 cursor-pointer"
                title="Expand Editor (+10%)"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Hover Tooltip showing width ratio & click-to-cycle */}
            <div 
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const presets = [50, 60, 75, 90];
                const current = Math.round(splitPct);
                const next = presets.find(p => p > current + 2) || presets[0];
                updateSplitPct(next);
              }}
              className="absolute top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/95 text-indigo-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-700 shadow-xl whitespace-nowrap z-50 cursor-pointer hover:bg-indigo-950/80 hover:text-white pointer-events-auto active:scale-95"
              title="Click to cycle preset splits (50% -> 60% -> 75% -> 90%)"
            >
              {Math.round(splitPct)}% : {Math.round(100 - splitPct)}%
            </div>
          </div>
        )}

        {/* Right Panel: Output / Diagnostics / Preview */}
        <div
          style={{
            flex: typeof window !== 'undefined' && window.innerWidth >= 768 ? (isMaximized ? '0 0 0%' : `1 1 ${100 - splitPct}%`) : undefined,
            width: typeof window !== 'undefined' && window.innerWidth >= 768 ? (isMaximized ? '0%' : `${100 - splitPct}%`) : undefined,
            maxWidth: typeof window !== 'undefined' && window.innerWidth >= 768 ? (isMaximized ? '0%' : `${100 - splitPct}%`) : undefined
          }}
          className={`h-full min-h-0 relative ${
            mobileTab === 'output' ? 'flex-1 md:flex-none block' : mobileTab === 'preview' ? 'flex-1 md:flex-none block md:hidden' : isMaximized ? 'hidden' : 'hidden md:block'
          }`}
        >
          {mobileTab === 'preview' ? (
            <div className="absolute inset-0 bg-slate-950 z-20 overflow-hidden">
               <LiveAppPreview 
                jsCode={jsCode} 
                onLoadCodeIntoEditor={(c) => {
                  const id = Math.random().toString(36).substring(7);
                  setFiles([...files, { id, name: `test_${Date.now()}.tl`, content: c }]);
                  setActiveFileId(id);
                  setMobileTab('editor');
                }} 
              />
            </div>
          ) : (
            <OutputPanel
              stdout={stdout}
              diagnostics={diagnostics}
              programAST={programAST}
              typeEnv={typeEnv}
              llvmCode={llvmCode}
              jsCode={jsCode}
              nodeCode={nodeCode}
              executionTimeMs={executionTimeMs}
              hasError={hasError}
              onClearStdout={() => setStdout([])}
              onApplyQuickFix={handleApplyQuickFix}
              onOpenLLVMStudio={() => setIsLLVMStudioOpen(true)}
              onLoadCodeIntoEditor={(testCode) => {
                const id = Math.random().toString(36).substring(7);
                setFiles([...files, { id, name: `test_${Date.now()}.tl`, content: testCode }]);
                setActiveFileId(id);
              }}
              code={activeCode}
              cursorPos={cursorPos}
              activeTab={outputPanelTab}
              onTabChange={setOutputPanelTab}
            />
          )}
        </div>

        {/* Fullscreen drag barrier overlay to prevent iframe / monaco capturing pointer */}
        {isDragging && (
          <div className="fixed inset-0 cursor-col-resize z-[100] select-none pointer-events-auto" />
        )}

        <AnimatePresence>
          {isLivePreviewOpen && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="hidden md:flex absolute top-4 right-4 bottom-4 w-[450px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 flex-col overflow-hidden"
            >
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Runtime Preview</span>
                </div>
                <button 
                  onClick={() => setIsLivePreviewOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <LiveAppPreview 
                  jsCode={jsCode} 
                  onLoadCodeIntoEditor={(c) => {
                    const id = Math.random().toString(36).substring(7);
                    setFiles([...files, { id, name: `generated_${Date.now()}.tl`, content: c }]);
                    setActiveFileId(id);
                  }} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SpecDoc isOpen={isSpecOpen} onClose={() => setIsSpecOpen(false)} />

      <LLVMStudioModal
        isOpen={isLLVMStudioOpen}
        onClose={() => setIsLLVMStudioOpen(false)}
        initialLLVMCode={llvmCode}
      />

      <VSCodeExportModal
        isOpen={isVSCodeModalOpen}
        onClose={() => setIsVSCodeModalOpen(false)}
      />

      <ConfirmationDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel="Confirm"
        onConfirm={confirmState.onConfirm}
        onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        variant={confirmState.variant}
      />

      <PromptDialog
        isOpen={promptState.isOpen}
        title={promptState.title}
        message={promptState.message}
        initialValue={promptState.initialValue}
        placeholder={promptState.placeholder}
        confirmLabel="Confirm"
        onConfirm={promptState.onConfirm}
        onCancel={() => setPromptState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
