import React, { useState, useEffect } from 'react';
import {
  Code2,
  Sparkles,
  Copy,
  Check,
  FileCode,
  Package,
  ArrowRight,
  Zap,
  Play,
  Layers,
  AlertCircle,
  Braces,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Info
} from 'lucide-react';
import { DTSParser, DTSParseResult, NPM_POPULAR_PRESETS, NPMPackagePreset } from '../lang/dts_parser';

interface FFIPanelProps {
  onLoadCodeIntoEditor?: (code: string, name: string) => void;
  onAppendCodeToEditor?: (codeToAppend: string) => void;
}

export const FFIPanel: React.FC<FFIPanelProps> = ({
  onLoadCodeIntoEditor,
  onAppendCodeToEditor
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('canvas_confetti');
  const [dtsInput, setDtsInput] = useState<string>(NPM_POPULAR_PRESETS[0].dts);
  const [parseResult, setParseResult] = useState<DTSParseResult | null>(null);
  const [copiedTypeLang, setCopiedTypeLang] = useState<boolean>(false);
  const [copiedDts, setCopiedDts] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'generated' | 'symbols' | 'guide'>('generated');

  // Re-parse whenever input changes
  useEffect(() => {
    try {
      const parser = new DTSParser(dtsInput);
      const result = parser.parse();
      setParseResult(result);
    } catch (err: any) {
      setParseResult({
        modules: [],
        types: [],
        functions: [],
        values: [],
        errors: [err.message || String(err)],
        typeLangCodeSummary: '// Error parsing TypeScript declaration'
      });
    }
  }, [dtsInput]);

  const handleSelectPreset = (preset: NPMPackagePreset) => {
    setSelectedPresetId(preset.id);
    setDtsInput(preset.dts);
    setActiveTab('generated');
  };

  const handleCopyCode = (text: string, setCopiedState: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopiedState(true);
    setTimeout(() => setCopiedState(false), 2000);
  };

  const selectedPreset = NPM_POPULAR_PRESETS.find(p => p.id === selectedPresetId) || NPM_POPULAR_PRESETS[0];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 gap-2 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Braces className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-slate-200 font-sans">TypeScript .d.ts & NPM FFI Generator</span>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full font-semibold">
                Type Safe FFI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Convert TypeScript declarations into compile-time TypeLang foreign function interface bindings.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('generated')}
            className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'generated'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>TypeLang FFI</span>
          </button>
          <button
            onClick={() => setActiveTab('symbols')}
            className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'symbols'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Exported Symbols</span>
            {parseResult && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/30 text-indigo-200 font-mono">
                {parseResult.modules.reduce((acc, m) => acc + m.functions.length + m.types.length + m.values.length, 0) +
                 parseResult.functions.length + parseResult.types.length + parseResult.values.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>FFI Spec</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Column: TS Declaration Input & Presets Quick Picker */}
        <div className="flex flex-col h-full overflow-hidden bg-slate-950/60 p-4 space-y-3">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
                1. TypeScript Declaration (.d.ts) Input
              </h3>
            </div>
            <button
              onClick={() => handleCopyCode(dtsInput, setCopiedDts)}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              {copiedDts ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedDts ? 'Copied' : 'Copy TS'}</span>
            </button>
          </div>

          {/* Preset Buttons Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
            <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">Presets:</span>
            {NPM_POPULAR_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`px-2.5 py-1 text-xs rounded-lg transition whitespace-nowrap cursor-pointer flex items-center space-x-1 border ${
                  selectedPresetId === preset.id
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{preset.name}</span>
              </button>
            ))}
          </div>

          {/* TS .d.ts Textarea */}
          <div className="relative flex-1 min-h-[220px] rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden flex flex-col">
            <div className="px-3 py-1.5 bg-slate-900/80 border-b border-slate-800/80 text-[11px] font-mono text-slate-400 flex justify-between items-center">
              <span>interface.d.ts</span>
              <span className="text-[10px] text-slate-500">Supports declare module, function, interface, type</span>
            </div>
            <textarea
              value={dtsInput}
              onChange={e => setDtsInput(e.target.value)}
              placeholder="Paste TypeScript .d.ts declaration content here..."
              className="w-full flex-1 p-3 bg-transparent font-mono text-xs text-indigo-100 placeholder-slate-600 resize-none focus:outline-none scrollbar-thin scrollbar-thumb-slate-800"
              spellCheck={false}
            />
          </div>

          {/* Parse Status / Errors */}
          {parseResult && parseResult.errors.length > 0 && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs space-y-1 shrink-0">
              <div className="flex items-center space-x-1.5 font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Parser Warnings / Unparsed Nodes ({parseResult.errors.length})</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-rose-300/80 space-y-0.5 max-h-20 overflow-y-auto">
                {parseResult.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Output / Symbols / Presets / Spec Guide */}
        <div className="flex flex-col h-full overflow-hidden bg-slate-950 p-4 space-y-3">
          {/* Tab 1: Generated TypeLang FFI Code */}
          {activeTab === 'generated' && (
            <div className="flex flex-col h-full space-y-3 overflow-hidden">
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">
                    2. Synthesized TypeLang FFI Declarations
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyCode(parseResult?.typeLangCodeSummary || '', setCopiedTypeLang)}
                    className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
                  >
                    {copiedTypeLang ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTypeLang ? 'Copied' : 'Copy FFI Code'}</span>
                  </button>

                  {onAppendCodeToEditor && parseResult?.typeLangCodeSummary && (
                    <button
                      onClick={() => onAppendCodeToEditor(parseResult.typeLangCodeSummary)}
                      className="flex items-center space-x-1 px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm transition cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Prepend to Editor</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Code Output Box */}
              <div className="flex-1 min-h-0 rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden flex flex-col">
                <div className="px-3 py-1.5 bg-slate-900/80 border-b border-slate-800/80 text-[11px] font-mono text-slate-400 flex justify-between items-center">
                  <span className="text-emerald-400 font-semibold">TypeLang extern output</span>
                  <span className="text-[10px] text-slate-500">100% Type Checked</span>
                </div>
                <pre className="p-4 font-mono text-xs text-indigo-200 overflow-auto flex-1 scrollbar-thin scrollbar-thumb-slate-800 leading-relaxed">
                  {parseResult?.typeLangCodeSummary || '// No declarations generated'}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 2: Exported Symbols Breakdown */}
          {activeTab === 'symbols' && (
            <div className="flex flex-col h-full space-y-3 overflow-hidden">
              <div className="flex items-center justify-between shrink-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Parsed Modules & Type Signatures</span>
                </h3>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {parseResult && parseResult.modules.length > 0 ? (
                  parseResult.modules.map((mod, i) => (
                    <div key={i} className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-indigo-400" />
                          <span className="font-mono text-sm font-bold text-slate-100">extern module {mod.name}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                          {mod.functions.length} functions, {mod.types.length} types
                        </span>
                      </div>

                      {/* Exported Functions */}
                      {mod.functions.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-semibold text-slate-400 font-sans uppercase tracking-wider">
                            Exported Functions ({mod.functions.length}):
                          </span>
                          <div className="space-y-1 font-mono text-xs">
                            {mod.functions.map((fn, j) => (
                              <div key={j} className="p-2 bg-slate-950/80 border border-slate-800/80 rounded-lg flex items-center justify-between">
                                <span className="text-indigo-300 font-semibold">
                                  {fn.name}
                                  {fn.typeParams.length > 0 ? `<${fn.typeParams.join(', ')}>` : ''}
                                  ({fn.params.map(p => `${p.name}: ${p.type.kind}`).join(', ')}): {fn.returnType.kind}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">JS: {fn.jsSymbol || fn.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exported Types */}
                      {mod.types.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[11px] font-semibold text-slate-400 font-sans uppercase tracking-wider">
                            Exported Types / Interfaces ({mod.types.length}):
                          </span>
                          <div className="space-y-1 font-mono text-xs">
                            {mod.types.map((t, j) => (
                              <div key={j} className="p-2 bg-slate-950/80 border border-slate-800/80 rounded-lg text-emerald-300">
                                type {t.name}
                                {t.typeParams.length > 0 ? `<${t.typeParams.join(', ')}>` : ''} = {t.type.kind}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 text-xs italic bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
                    No top-level module declarations parsed yet. Type or select a preset on the left!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: FFI Specification Guide */}
          {activeTab === 'guide' && (
            <div className="flex flex-col h-full space-y-3 overflow-hidden text-xs text-slate-300">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>TypeLang Foreign Function Interface (FFI) Specification</span>
              </h3>

              <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="font-bold text-indigo-300 text-sm font-sans">1. FFI Function Declarations</span>
                  <p className="text-slate-400 text-xs">
                    Bind external JavaScript functions into TypeLang with full parameter and return type safety:
                  </p>
                  <pre className="p-2.5 bg-slate-950 rounded-lg font-mono text-[11px] text-indigo-200">
                    {`extern fn alert(message: string): void as "window.alert";\nextern fn fetch(url: string): Promise<string> as "fetch";`}
                  </pre>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="font-bold text-indigo-300 text-sm font-sans">2. External Module Wrappers</span>
                  <p className="text-slate-400 text-xs">
                    Wrap whole npm packages or browser global namespaces inside an <code className="font-mono text-indigo-300">extern module</code> block:
                  </p>
                  <pre className="p-2.5 bg-slate-950 rounded-lg font-mono text-[11px] text-indigo-200">
                    {`extern module lodash {\n  function chunk<T>(arr: [T], size: number): [[T]]\n  function sum(arr: [number]): number\n}`}
                  </pre>
                </div>

                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                  <span className="font-bold text-indigo-300 text-sm font-sans">3. Automatic Code Generator</span>
                  <p className="text-slate-400 text-xs">
                    The TypeLang JS compiler outputs safe proxy bindings that dynamically resolve global objects (<code className="font-mono text-indigo-300">window</code>, <code className="font-mono text-indigo-300">globalThis</code>) or npm modules without crashing if missing!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
