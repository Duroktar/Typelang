import React, { useState } from 'react';
import { X, Download, Copy, Check, FileCode, Terminal, Sparkles, BookOpen, Layers } from 'lucide-react';
import {
  TYPELANG_TM_LANGUAGE,
  TYPELANG_LANGUAGE_CONFIGURATION,
  TYPELANG_VSCODE_PACKAGE_JSON,
  downloadTextMateGrammar,
  downloadLanguageConfiguration,
  downloadVSCodeManifest
} from '../lang/textmateGrammar';

interface VSCodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VSCodeExportModal: React.FC<VSCodeExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'grammar' | 'config' | 'package' | 'instructions'>('grammar');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const tmLanguageStr = JSON.stringify(TYPELANG_TM_LANGUAGE, null, 2);
  const langConfigStr = JSON.stringify(TYPELANG_LANGUAGE_CONFIGURATION, null, 2);
  const packageJsonStr = JSON.stringify(TYPELANG_VSCODE_PACKAGE_JSON, null, 2);

  const getCurrentText = () => {
    switch (activeTab) {
      case 'grammar': return tmLanguageStr;
      case 'config': return langConfigStr;
      case 'package': return packageJsonStr;
      default: return tmLanguageStr;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadActive = () => {
    switch (activeTab) {
      case 'grammar':
        downloadTextMateGrammar();
        break;
      case 'config':
        downloadLanguageConfiguration();
        break;
      case 'package':
        downloadVSCodeManifest();
        break;
      default:
        downloadTextMateGrammar();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>VS Code Syntax Extension & TextMate Grammar</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  typelang.tmLanguage.json
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Full syntax highlighting & language support for VS Code, VSCodium, and TextMate-compatible editors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 pt-2 space-x-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('grammar')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'grammar'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>typelang.tmLanguage.json</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>language-configuration.json</span>
          </button>
          <button
            onClick={() => setActiveTab('package')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'package'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>package.json (Extension)</span>
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'instructions'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Quick Setup Guide</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-5 bg-slate-900/50">
          {activeTab === 'instructions' ? (
            <div className="space-y-5 text-sm">
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 text-blue-200 leading-relaxed text-xs">
                <span className="font-bold text-white block mb-1">💡 1-Minute VS Code Setup:</span>
                You can turn any folder in your local VS Code extensions directory into a full TypeLang extension in seconds!
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Step 1: Create the Extension Folder</h3>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 space-y-1 select-all">
                  <p className="text-slate-500"># macOS / Linux:</p>
                  <p>mkdir -p ~/.vscode/extensions/typelang-syntax/syntaxes</p>
                  <p className="text-slate-500 mt-2"># Windows PowerShell:</p>
                  <p>mkdir -p $HOME\.vscode\extensions\typelang-syntax\syntaxes</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Step 2: Save the Three Files</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="font-mono text-xs font-bold text-blue-400">syntaxes/typelang.tmLanguage.json</div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Contains the syntax patterns for GADTs, Monads, loops, types, keywords, and strings.
                      </p>
                    </div>
                    <button
                      onClick={downloadTextMateGrammar}
                      className="mt-3 w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Grammar</span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="font-mono text-xs font-bold text-indigo-400">language-configuration.json</div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Handles bracket auto-closing, comment toggles (`//`), and code folding.
                      </p>
                    </div>
                    <button
                      onClick={downloadLanguageConfiguration}
                      className="mt-3 w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Config</span>
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="font-mono text-xs font-bold text-purple-400">package.json</div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Registers the `typelang` language ID and associates `.tl` and `.typelang` files.
                      </p>
                    </div>
                    <button
                      onClick={downloadVSCodeManifest}
                      className="mt-3 w-full py-1.5 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Manifest</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Step 3: Reload VS Code</h3>
                <p className="text-xs text-slate-300">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[11px]">Cmd+Shift+P</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono text-[11px]">Ctrl+Shift+P</kbd>) in VS Code and run <strong>Developer: Reload Window</strong>.
                </p>
                <p className="text-xs text-emerald-400 font-medium">
                  🎉 Any <code className="px-1 py-0.5 rounded bg-slate-950 border border-slate-800 text-emerald-300 font-mono">*.tl</code> file will now highlight with high-contrast, theme-adaptive syntax colors!
                </p>
              </div>
            </div>
          ) : (
            <div className="relative h-full flex flex-col">
              <pre className="flex-1 p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-auto max-h-[55vh] selection:bg-indigo-600 selection:text-white leading-relaxed">
                {getCurrentText()}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>File: <code className="text-slate-300 font-mono">{activeTab === 'grammar' ? 'typelang.tmLanguage.json' : activeTab === 'config' ? 'language-configuration.json' : activeTab === 'package' ? 'package.json' : 'Setup Guide'}</code></span>
          </div>

          <div className="flex items-center space-x-2">
            {activeTab !== 'instructions' && (
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-xs font-semibold border border-slate-700 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            )}

            <button
              onClick={handleDownloadActive}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition text-xs font-bold shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {activeTab === 'grammar'
                  ? 'Download typelang.tmLanguage.json'
                  : activeTab === 'config'
                  ? 'Download language-configuration.json'
                  : activeTab === 'package'
                  ? 'Download package.json'
                  : 'Download typelang.tmLanguage.json'}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
