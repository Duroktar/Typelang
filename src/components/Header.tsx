import React from 'react';
import { Play, Sparkles, BookOpen, Share2, Download, Code2, Check, ChevronDown, Wand2, Boxes, FileCode } from 'lucide-react';
import { EXAMPLES, ExampleProgram } from '../lang/examples';

interface HeaderProps {
  currentExampleId: string;
  onSelectExample: (ex: ExampleProgram) => void;
  onRun: () => void;
  isExecuting: boolean;
  onOpenSpec: () => void;
  onOpenStdLib?: () => void;
  onOpenLLVMStudio?: () => void;
  onOpenVSCodeModal?: () => void;
  onFormat: () => void;
  onShare: () => void;
  onNew: () => void;
  onSave: () => void;
  onLoad: (file: File) => void;
  onTogglePreview: () => void;
  isPreviewOpen: boolean;
  copied: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentExampleId,
  onSelectExample,
  onRun,
  isExecuting,
  onOpenSpec,
  onOpenStdLib,
  onOpenLLVMStudio,
  onOpenVSCodeModal,
  onFormat,
  onShare,
  onNew,
  onSave,
  onLoad,
  onTogglePreview,
  isPreviewOpen,
  copied
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = React.useState(false);

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-2 sm:px-3 py-1.5 sm:py-2 text-slate-200 flex items-center justify-between gap-1.5 sm:gap-2 shadow-md z-50 w-full max-w-full overflow-hidden">
      {/* Brand */}
      <div className="flex items-center space-x-2 shrink-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <Code2 className="w-4 h-4 text-white" />
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center space-x-1.5">
            <h1 className="text-xs sm:text-sm font-black tracking-tight text-white uppercase italic">TypeLang</h1>
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[9px] font-bold border border-indigo-500/20 hidden md:inline-block">
              Beta v0.2
            </span>
          </div>
        </div>
      </div>

      {/* Center Section: Examples & Project Menu */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 flex-1 min-w-0 max-w-xs sm:max-w-sm md:max-w-md">
        <div className="relative shrink-0">
          <button
            onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
            className="flex items-center space-x-1 px-1.5 sm:px-2.5 h-8 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
            title="Project Menu & Tools"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden md:inline text-[11px]">Project</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isProjectMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProjectMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsProjectMenuOpen(false)}
              />
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-1">
                <button
                  onClick={() => { onNew(); setIsProjectMenuOpen(false); }}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs font-semibold"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>New Project</span>
                </button>
                <button
                  onClick={() => { onSave(); setIsProjectMenuOpen(false); }}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs font-semibold border-t border-slate-800/50"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Export File (.tl)</span>
                </button>
                <button
                  onClick={() => { fileInputRef.current?.click(); setIsProjectMenuOpen(false); }}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-xs font-semibold border-t border-slate-800/50"
                >
                  <Download className="w-4 h-4 text-amber-400 rotate-180" />
                  <span>Import File (.tl)</span>
                </button>
                <button
                  onClick={() => { onOpenVSCodeModal?.(); setIsProjectMenuOpen(false); }}
                  className="w-full flex items-center space-x-3 px-3.5 py-2.5 hover:bg-slate-800 text-sky-300 hover:text-white transition-colors text-xs font-semibold border-t border-slate-800/50"
                  title="Export typelang.tmLanguage.json for VS Code"
                >
                  <FileCode className="w-4 h-4 text-sky-400" />
                  <span>VS Code Syntax (.json)</span>
                </button>
                {onOpenLLVMStudio && (
                  <button
                    onClick={() => { onOpenLLVMStudio(); setIsProjectMenuOpen(false); }}
                    className="w-full flex items-center space-x-3 px-3.5 py-2.5 hover:bg-slate-800 text-purple-300 hover:text-white transition-colors text-xs font-semibold border-t border-slate-800/50"
                  >
                    <Boxes className="w-4 h-4 text-purple-400" />
                    <span>LLVM IR Studio</span>
                  </button>
                )}
                <div className="border-t border-slate-800/50 p-1.5 bg-slate-950/50 space-y-1">
                  {onOpenStdLib && (
                    <button
                      onClick={() => { onOpenStdLib(); setIsProjectMenuOpen(false); }}
                      className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-slate-800 text-emerald-300 hover:text-white rounded-lg transition-colors text-[10px] font-bold uppercase tracking-widest"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                      <span>StdLib Explorer</span>
                    </button>
                  )}
                  <button
                    onClick={() => { onFormat(); setIsProjectMenuOpen(false); }}
                    className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Auto-Format</span>
                  </button>
                  <button
                    onClick={() => { onOpenSpec(); setIsProjectMenuOpen(false); }}
                    className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors text-[10px] font-bold uppercase tracking-widest"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Language Spec</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <select
          value={currentExampleId}
          onChange={e => {
            const ex = EXAMPLES.find(ex => ex.id === e.target.value);
            if (ex) onSelectExample(ex);
          }}
          className="flex-1 min-w-0 w-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium h-8 py-1 px-1.5 sm:px-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer truncate"
          title="Load Example Program"
        >
          <option value="" disabled>Load Example...</option>
          {EXAMPLES.map(ex => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onLoad(file);
          }}
          className="hidden"
          accept=".json,.tl"
        />
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
        {onOpenLLVMStudio && (
          <button
            onClick={onOpenLLVMStudio}
            className="flex items-center justify-center space-x-1 w-8 h-8 sm:w-auto sm:px-2.5 sm:h-8 rounded-lg border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 hover:text-white transition-all cursor-pointer text-xs font-semibold shrink-0"
            title="Open LLVM IR Online Compiler & Interpreter"
          >
            <Boxes className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="hidden lg:inline text-[11px]">LLVM Studio</span>
          </button>
        )}

        <button
          onClick={onTogglePreview}
          className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all cursor-pointer shrink-0 ${
            isPreviewOpen 
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20' 
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
          title={isPreviewOpen ? "Close Live App Preview" : "Open Live App Preview"}
        >
          <Play className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onRun}
          disabled={isExecuting}
          className="flex items-center justify-center space-x-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-2.5 sm:px-3.5 h-8 rounded-lg shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          title="Run Code (Ctrl+Enter)"
        >
          <Play className="w-3 h-3 fill-current shrink-0" />
          <span className="hidden sm:inline uppercase tracking-wider text-[11px]">{isExecuting ? '...' : 'Run'}</span>
        </button>

        <button
          onClick={onShare}
          className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer shrink-0"
          title="Share Code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
