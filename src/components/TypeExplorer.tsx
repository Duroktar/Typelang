import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Search,
  Code2,
  Box,
  Braces,
  Sparkles,
  Copy,
  Check,
  Tag,
  Info,
  ChevronRight,
  Filter,
  Flame,
  ArrowRight,
  ExternalLink,
  Target,
  ListTree,
  Crosshair
} from 'lucide-react';
import { TypeEnv } from '../lang/checker';
import { Program } from '../lang/ast';
import {
  inspectTypeAtPosition,
  inspectSymbolByName,
  extractTokensFromLine,
  getAllSymbolsFromTypeEnv,
  TypeInspectionResult
} from '../lang/lsp';

interface TypeExplorerProps {
  typeEnv: TypeEnv | null;
  programAST: Program | null;
  code: string;
  cursorPos: { line: number; col: number; word?: string } | null;
  onSelectSymbol?: (symbolName: string) => void;
  onNavigateToLine?: (line: number, col: number) => void;
}

export const TypeExplorer: React.FC<TypeExplorerProps> = ({
  typeEnv,
  programAST,
  code,
  cursorPos,
  onSelectSymbol,
  onNavigateToLine
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'functions' | 'gadts' | 'variables' | 'aliases' | 'modules'>('all');
  const [inspectedSymbol, setInspectedSymbol] = useState<TypeInspectionResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Extract current line of code
  const currentLine = cursorPos?.line || 1;
  const currentCol = cursorPos?.col || 1;
  const lines = useMemo(() => code.split('\n'), [code]);
  const currentLineText = (currentLine >= 1 && currentLine <= lines.length) ? lines[currentLine - 1] : '';

  // Extract tokens on the active line for quick tapping
  const activeLineTokens = useMemo(() => {
    return extractTokensFromLine(currentLineText);
  }, [currentLineText]);

  // Update inspection when cursor position changes or when user queries
  useEffect(() => {
    if (cursorPos) {
      const result = inspectTypeAtPosition(code, cursorPos.line, cursorPos.col, typeEnv);
      if (result) {
        setInspectedSymbol(result);
        return;
      }
    }
    // If no word at cursor, pick first token on line or fallback
    if (activeLineTokens.length > 0 && !inspectedSymbol) {
      const firstTokenResult = inspectSymbolByName(activeLineTokens[0], typeEnv, code);
      if (firstTokenResult) {
        setInspectedSymbol(firstTokenResult);
      }
    }
  }, [cursorPos, code, typeEnv]);

  // Handle custom search query
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const found = inspectSymbolByName(query.trim(), typeEnv, code);
      if (found) {
        setInspectedSymbol(found);
      }
    }
  };

  const handleSelectToken = (token: string) => {
    const res = inspectSymbolByName(token, typeEnv, code);
    if (res) {
      setInspectedSymbol(res);
    }
    if (onSelectSymbol) {
      onSelectSymbol(token);
    }
  };

  const handleCopySignature = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get all symbols from TypeEnv
  const allSymbols = useMemo(() => {
    return getAllSymbolsFromTypeEnv(typeEnv);
  }, [typeEnv]);

  const filteredSymbols = useMemo(() => {
    return allSymbols.filter(s => {
      if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.typeString.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allSymbols, selectedCategory, searchQuery]);

  const getCategoryBadgeClass = (category: TypeInspectionResult['category']) => {
    switch (category) {
      case 'function':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'gadt':
      case 'constructor':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'record':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'module':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'primitive':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'builtin':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'keyword':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans text-slate-200">
      {/* Top Banner: Active Cursor Context */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-200 text-xs tracking-tight">Active Cursor Focus</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 border border-slate-800 text-indigo-300">
                  Line {currentLine} : Col {currentCol}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Inspect inferred types in real-time at the cursor or click symbols below
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search or test symbol..."
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Active Line Tokens Chips */}
        {activeLineTokens.length > 0 && (
          <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center space-x-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>Tokens on Line {currentLine}:</span>
            </span>
            {activeLineTokens.map((token, idx) => (
              <button
                key={`token-${token}-${idx}`}
                onClick={() => handleSelectToken(token)}
                className={`px-2 py-0.5 rounded-md font-mono text-[11px] transition cursor-pointer border ${
                  inspectedSymbol?.symbol === token
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {token}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Focus: Inferred Type Inspector Card */}
      {inspectedSymbol ? (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3.5 shadow-md">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-slate-850 pb-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-base font-bold text-amber-300">
                  {inspectedSymbol.symbol}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeClass(
                    inspectedSymbol.category
                  )}`}
                >
                  {inspectedSymbol.category}
                </span>
              </div>
              {inspectedSymbol.doc && (
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {inspectedSymbol.doc}
                </p>
              )}
            </div>

            <button
              onClick={() => handleCopySignature(inspectedSymbol.signature || inspectedSymbol.typeString)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer text-[11px] shrink-0"
              title="Copy Type Signature"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Type Signature Code Block */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Inferred Type Signature
            </span>
            <pre className="bg-slate-900 p-3 rounded-lg border border-slate-800/90 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed whitespace-pre">
              {inspectedSymbol.signature || inspectedSymbol.typeString}
            </pre>
          </div>

          {/* Function Parameter Breakdown */}
          {inspectedSymbol.details?.params && inspectedSymbol.details.params.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Parameters & Types ({inspectedSymbol.details.params.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {inspectedSymbol.details.params.map((p, i) => (
                  <div
                    key={i}
                    className="p-2 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between"
                  >
                    <span className="font-mono text-indigo-300 font-semibold text-[11px]">{p.name}</span>
                    <span className="font-mono text-emerald-400 text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {p.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Return Type */}
          {inspectedSymbol.details?.returnType && (
            <div className="flex items-center space-x-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-semibold">Return Type:</span>
              <span className="font-mono text-sky-300 font-bold">
                {inspectedSymbol.details.returnType}
              </span>
            </div>
          )}

          {/* Record Fields Breakdown */}
          {inspectedSymbol.details?.fields && inspectedSymbol.details.fields.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Record Fields ({inspectedSymbol.details.fields.length})
              </span>
              <div className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                {inspectedSymbol.details.fields.map((f, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-amber-300 font-semibold text-[11px]">{f.name}</span>
                      {f.isMut && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          mut
                        </span>
                      )}
                      {f.isOptional && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          optional
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-emerald-400 text-[11px]">{f.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GADT Constructors */}
          {inspectedSymbol.details?.constructors && inspectedSymbol.details.constructors.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                GADT Constructor Variants ({inspectedSymbol.details.constructors.length})
              </span>
              <div className="space-y-1.5">
                {inspectedSymbol.details.constructors.map((c, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between"
                  >
                    <span className="font-mono text-indigo-300 font-bold text-[11px]">| {c.name}</span>
                    <span className="font-mono text-slate-300 text-[11px] truncate max-w-[240px]">
                      {c.signature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module Exports */}
          {inspectedSymbol.details?.moduleExports && inspectedSymbol.details.moduleExports.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Module Exports ({inspectedSymbol.details.moduleExports.length})
              </span>
              <div className="space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800 max-h-48 overflow-y-auto">
                {inspectedSymbol.details.moduleExports.map((e, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                    <span className="font-mono text-sky-300 font-semibold text-[11px]">{e.name}</span>
                    <span className="font-mono text-emerald-400 text-[11px] truncate max-w-[200px]">
                      {e.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center text-slate-500 space-y-2">
          <Info className="w-5 h-5 mx-auto text-slate-600" />
          <p className="text-xs">Place your cursor over any expression or token in the editor to inspect its type.</p>
        </div>
      )}

      {/* Symbol Registry & Environment Catalog */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <ListTree className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-200 text-xs">Type Environment Symbol Registry</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300">
              {filteredSymbols.length}
            </span>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-1">
            {(['all', 'functions', 'gadts', 'variables', 'modules'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Symbol Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
          {filteredSymbols.length === 0 ? (
            <div className="col-span-2 text-center text-slate-500 py-6 text-xs italic">
              No symbols found matching the current filter.
            </div>
          ) : (
            filteredSymbols.map((sym, idx) => (
              <div
                key={`${sym.category}-${sym.name}-${idx}`}
                onClick={() => handleSelectToken(sym.name)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  inspectedSymbol?.symbol === sym.name
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-sm'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="min-w-0 pr-2 space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-slate-200 text-xs truncate">
                      {sym.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-slate-800 text-slate-400">
                      {sym.category}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-emerald-400 truncate">
                    {sym.typeString}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
