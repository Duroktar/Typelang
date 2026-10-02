import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Code2,
  Cpu,
  Layers,
  Sparkles,
  Copy,
  Check,
  Play,
  FileCode,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  FunctionSquare,
  Box,
  Braces
} from 'lucide-react';
import { STDLIB_MODULES, StdLibModuleDoc, StdLibFunctionDoc } from '../lang/stdlibDocs';

interface StdLibExplorerProps {
  onLoadCodeIntoEditor?: (code: string, moduleName: string) => void;
  onSelectModule?: (moduleId: string) => void;
  initialModuleId?: string;
}

const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const StdLibExplorer: React.FC<StdLibExplorerProps> = ({
  onLoadCodeIntoEditor,
  onSelectModule,
  initialModuleId = 'Option'
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModuleId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Monad' | 'Algebraic' | 'Core' | 'Runtime'>('All');
  const [viewMode, setViewMode] = useState<'typelang' | 'js' | 'functions' | 'do_notation'>('typelang');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const selectedModule = useMemo(() => {
    return STDLIB_MODULES.find(m => m.id === selectedModuleId) || STDLIB_MODULES[0];
  }, [selectedModuleId]);

  const filteredModules = useMemo(() => {
    return STDLIB_MODULES.filter(m => {
      const matchesCat = selectedCategory === 'All' || m.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCat;
      const matchesName = m.name.toLowerCase().includes(q) || m.tagline.toLowerCase().includes(q);
      const matchesFunc = m.functions.some(f => f.name.toLowerCase().includes(q) || f.signature.toLowerCase().includes(q));
      return matchesCat && (matchesName || matchesFunc);
    });
  }, [searchQuery, selectedCategory]);

  const filteredFunctions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return selectedModule.functions;
    return selectedModule.functions.filter(f => 
      f.name.toLowerCase().includes(q) ||
      f.signature.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q)
    );
  }, [searchQuery, selectedModule.functions]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleTryInEditor = (snippet: string) => {
    if (onLoadCodeIntoEditor) {
      onLoadCodeIntoEditor(snippet, selectedModule.name);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const trimmed = query.trim();
    if (!trimmed) return <span>{text}</span>;
    try {
      const parts = text.split(new RegExp(`(${escapeRegExp(trimmed)})`, 'gi'));
      return (
        <span>
          {parts.map((part, i) => 
            part.toLowerCase() === trimmed.toLowerCase()
              ? <mark key={i} className="bg-amber-500/30 text-amber-100 px-0.5 rounded font-medium">{part}</mark>
              : part
          )}
        </span>
      );
    } catch {
      return <span>{text}</span>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden select-text">
      {/* Top Explorer Banner */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">Standard Library Explorer</h2>
              <span className="text-slate-600" aria-hidden="true">·</span>
              <span className="text-xs font-semibold text-emerald-400">
                {STDLIB_MODULES.length} Built-in Modules
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Inspect pure TypeLang source code, runtime JS implementations, and monad laws
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['All', 'Monad', 'Algebraic', 'Core', 'Runtime'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar: Module List */}
        <div className="w-64 sm:w-72 border-r border-slate-800 flex flex-col bg-slate-950/80 shrink-0">
          {/* Search Box */}
          <div className="p-2.5 border-b border-slate-800/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search modules or functions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 text-slate-200 text-xs rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
              />
            </div>
          </div>

          {/* List of Modules */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredModules.map(mod => {
              const isSelected = mod.id === selectedModule.id;
              const matchingFuncs = searchQuery.trim() !== ''
                ? mod.functions.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
                : [];

              return (
                <button
                  key={mod.id}
                  onClick={() => {
                    setSelectedModuleId(mod.id);
                    if (onSelectModule) onSelectModule(mod.id);
                    if (searchQuery.trim() !== '') {
                      setViewMode('functions');
                    }
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-sm'
                      : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-900 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-indigo-300">{highlightText(mod.name, searchQuery)}</span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        mod.category === 'Monad'
                          ? 'text-purple-400'
                          : mod.category === 'Algebraic'
                          ? 'text-amber-400'
                          : mod.category === 'Core'
                          ? 'text-sky-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {mod.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug">{highlightText(mod.tagline, searchQuery)}</p>
                  
                  {/* Inline list of matching functions when search query is active */}
                  {matchingFuncs.length > 0 && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/40 flex flex-wrap gap-x-1.5 gap-y-0.5">
                      {matchingFuncs.slice(0, 3).map(f => (
                        <span key={f.name} className="text-[10px] font-mono text-indigo-400">
                          · {highlightText(f.name, searchQuery)}
                        </span>
                      ))}
                      {matchingFuncs.length > 3 && (
                        <span className="text-[10px] font-mono text-slate-500">
                          (+{matchingFuncs.length - 3} more)
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}

            {filteredModules.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-xs text-slate-500 font-medium">No modules found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden">
          {/* Module Detail Header */}
          <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div>
              <div className="flex items-center space-x-2 text-xs">
                <h3 className="text-base font-mono font-bold text-white">{selectedModule.name}</h3>
                <span className="text-slate-600" aria-hidden="true">·</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    selectedModule.category === 'Monad'
                      ? 'text-purple-400'
                      : selectedModule.category === 'Core'
                      ? 'text-sky-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {selectedModule.category} Module
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">{selectedModule.description}</p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {onLoadCodeIntoEditor && (
                <button
                  onClick={() => handleTryInEditor(selectedModule.typeLangSource)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-sm cursor-pointer active:scale-95"
                  title="Load full module source code into editor"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Try in Editor</span>
                </button>
              )}
              <button
                onClick={() => handleCopy(selectedModule.typeLangSource, 'full_source')}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition cursor-pointer"
                title="Copy TypeLang source code"
              >
                {copiedSection === 'full_source' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedSection === 'full_source' ? 'Copied' : 'Copy Source'}</span>
              </button>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center space-x-1 px-4 py-2 bg-slate-900/40 border-b border-slate-800 shrink-0 overflow-x-auto">
            <button
              onClick={() => setViewMode('typelang')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                viewMode === 'typelang'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>TypeLang Source</span>
            </button>

            <button
              onClick={() => setViewMode('functions')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                viewMode === 'functions'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FunctionSquare className="w-3.5 h-3.5" />
              <span>
                Function Signatures ({searchQuery.trim() !== '' ? `${filteredFunctions.length} of ` : ''}{selectedModule.functions.length})
              </span>
            </button>

            {selectedModule.category === 'Monad' && (
              <button
                onClick={() => setViewMode('do_notation')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  viewMode === 'do_notation'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Monad Laws & do({selectedModule.name})</span>
              </button>
            )}

            <button
              onClick={() => setViewMode('js')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                viewMode === 'js'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>JS Engine Runtime</span>
            </button>
          </div>

          {/* View Body Container */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-800">
            {viewMode === 'typelang' && (
              <div className="space-y-4 max-w-4xl">
                {selectedModule.typeDefinition && (
                  <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Algebraic Type Definition
                    </span>
                    <pre className="font-mono text-xs text-amber-300 overflow-x-auto whitespace-pre leading-relaxed">
                      {selectedModule.typeDefinition}
                    </pre>
                  </div>
                )}

                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Module Implementation Source Code
                    </span>
                    <button
                      onClick={() => handleCopy(selectedModule.typeLangSource, 'source_code')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                    >
                      {copiedSection === 'source_code' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
                    {selectedModule.typeLangSource}
                  </pre>
                </div>
              </div>
            )}

            {viewMode === 'functions' && (
              <div className="space-y-4 max-w-4xl">
                {filteredFunctions.length === 0 ? (
                  <div className="bg-slate-900/40 rounded-xl p-8 border border-slate-800 text-center">
                    <p className="text-xs text-slate-400 font-medium">No functions found matching "{searchQuery}" in this module</p>
                  </div>
                ) : (
                  filteredFunctions.map(fn => (
                    <div key={fn.name} className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-2.5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-amber-300 text-sm">{highlightText(fn.name, searchQuery)}</span>
                          <code className="font-mono text-xs text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/20">
                            {highlightText(fn.signature, searchQuery)}
                          </code>
                        </div>
                        {onLoadCodeIntoEditor && (
                          <button
                            onClick={() => handleTryInEditor(fn.example)}
                            className="flex items-center space-x-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Run Example</span>
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{highlightText(fn.description, searchQuery)}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                            Implementation
                          </span>
                          <pre className="font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre">
                            {fn.typeLangImpl}
                          </pre>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                            Example
                          </span>
                          <pre className="font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre">
                            {fn.example}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {viewMode === 'do_notation' && selectedModule.lawsDoc && (
              <div className="space-y-4 max-w-4xl">
                <div className="bg-slate-900/90 rounded-xl p-4 border border-purple-500/30 space-y-3">
                  <div className="flex items-center space-x-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Monad Mathematical Laws for {selectedModule.name}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-purple-400 block mb-1">1. Left Identity</span>
                      <code className="text-emerald-300">{selectedModule.lawsDoc.leftIdentity}</code>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-purple-400 block mb-1">2. Right Identity</span>
                      <code className="text-emerald-300">{selectedModule.lawsDoc.rightIdentity}</code>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-purple-400 block mb-1">3. Associativity</span>
                      <code className="text-emerald-300">{selectedModule.lawsDoc.associativity}</code>
                    </div>
                  </div>
                </div>

                {selectedModule.doNotationSnippet && (
                  <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        Syntactic Sugar Example with do({selectedModule.name})
                      </span>
                      {onLoadCodeIntoEditor && (
                        <button
                          onClick={() => handleTryInEditor(selectedModule.doNotationSnippet || '')}
                          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Try in Editor</span>
                        </button>
                      )}
                    </div>
                    <pre className="font-mono text-xs text-amber-300 overflow-x-auto whitespace-pre leading-relaxed">
                      {selectedModule.doNotationSnippet}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'js' && (
              <div className="space-y-4 max-w-4xl">
                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Underlying JavaScript Runtime Implementation
                    </span>
                    <button
                      onClick={() => handleCopy(selectedModule.jsSource, 'js_source')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                    >
                      {copiedSection === 'js_source' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <pre className="font-mono text-xs text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed">
                    {selectedModule.jsSource}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
