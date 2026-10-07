import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Square,
  RotateCw,
  Smartphone,
  Tablet,
  Monitor,
  Maximize,
  Minimize,
  Maximize2,
  Terminal,
  Code2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Flame,
  Calculator,
  Layers,
  Palette,
  Download
} from 'lucide-react';
import { JSSandbox, JSRuntimeResult } from '../lang/js_runtime';

interface LiveAppPreviewProps {
  jsCode: string;
  onLoadCodeIntoEditor?: (code: string, testName: string) => void;
  isRunning?: boolean;
  onStop?: () => void;
}

export const LiveAppPreview: React.FC<LiveAppPreviewProps> = ({
  jsCode,
  onLoadCodeIntoEditor,
  isRunning = false,
  onStop
}) => {
  const mountContainerRef = useRef<HTMLDivElement>(null);
  const [viewportMode, setViewportMode] = useState<'responsive' | 'desktop' | 'tablet' | 'mobile'>('responsive');
  const [autoRun, setAutoRun] = useState<boolean>(true);
  const [sandboxResult, setSandboxResult] = useState<JSRuntimeResult | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'logs' | 'dom_inspect'>('preview');
  const [inspectHtml, setInspectHtml] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isStopped, setIsStopped] = useState<boolean>(false);

  const handleStop = () => {
    JSSandbox.cleanup();
    setIsStopped(true);
    if (onStop) {
      onStop();
    }
  };

  const executeLiveSandbox = () => {
    setIsStopped(false);
    if (!mountContainerRef.current) return;
    // Clear any previous sandbox intervals/listeners
    JSSandbox.cleanup();

    // Clear mount container
    mountContainerRef.current.innerHTML = '<div id="app-root" class="w-full"></div>';

    const rootTarget = mountContainerRef.current.querySelector('#app-root') as HTMLElement;
    const res = JSSandbox.execute(jsCode, rootTarget || mountContainerRef.current);
    setSandboxResult(res);

    if (mountContainerRef.current) {
      setInspectHtml(mountContainerRef.current.innerHTML);
    }
  };

  const downloadStandaloneHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TypeLang Standalone Web App</title>
  <!-- Tailwind CSS Play CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts Pairing -->
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
  </style>
  <!-- Optional External JS Libraries for FFI support -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <!-- Root mount target for TypeLang DOM applications -->
  <div id="app-root" class="w-full min-h-screen"></div>

  <script>
    // Set up global mocks for browser environment (mock require/process)
    window.require = function(modName) {
      if (modName === 'lodash' || modName === 'lodash-es') return window._;
      if (modName === 'canvas-confetti' || modName === 'confetti') return window.confetti;
      if (modName === 'fs') {
        return {
          readFileSync: () => '{"status":"ok"}',
          writeFileSync: () => null,
          existsSync: () => true
        };
      }
      if (modName === 'path') {
        return {
          join: (...parts) => parts.join('/'),
          resolve: (...parts) => parts.join('/'),
          basename: (p) => p.split('/').pop() || '',
          dirname: (p) => p.split('/').slice(0, -1).join('/') || '.'
        };
      }
      return null;
    };
    window.process = {
      env: {
        NODE_ENV: 'production',
        PORT: '3000'
      }
    };

    // Mount container reference expected by code
    const $mountTarget = document.getElementById('app-root');

    // Compiled TypeLang code starts here
    ${jsCode}
    // Compiled TypeLang code ends here
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'typelang_app.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (autoRun) {
      executeLiveSandbox();
    }
    return () => {
      JSSandbox.cleanup();
    };
  }, [jsCode, autoRun]);

  const getViewportWidthClass = () => {
    switch (viewportMode) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'desktop':
        return 'max-w-[1024px]';
      case 'responsive':
      default:
        return 'w-full';
    }
  };

  return (
    <div className={`flex flex-col bg-slate-900 text-slate-200 ${isFullscreen ? 'fixed inset-0 z-[100]' : 'h-full'}`}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-950 border-b border-slate-800 text-xs">
        {/* Sub Navigation */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveSubTab('preview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'preview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive App</span>
          </button>

          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'logs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>App Logs</span>
            {sandboxResult?.stdout && sandboxResult.stdout.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-indigo-300 font-mono">
                {sandboxResult.stdout.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (mountContainerRef.current) {
                setInspectHtml(mountContainerRef.current.innerHTML);
              }
              setActiveSubTab('dom_inspect');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'dom_inspect'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>HTML Inspector</span>
          </button>
        </div>

        {/* Viewport & Controls */}
        <div className="flex items-center space-x-2">
          {/* Viewport size buttons */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewportMode('responsive')}
              title="Fluid Responsive (100%)"
              className={`p-1.5 rounded transition cursor-pointer ${
                viewportMode === 'responsive' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('desktop')}
              title="Desktop (1024px)"
              className={`p-1.5 rounded transition cursor-pointer ${
                viewportMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              title="Tablet (768px)"
              className={`p-1.5 rounded transition cursor-pointer ${
                viewportMode === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              title="Mobile (375px)"
              className={`p-1.5 rounded transition cursor-pointer ${
                viewportMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Re-run & Stop Buttons */}
          <button
            onClick={executeLiveSandbox}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition cursor-pointer shadow-sm"
            title="Re-run Interactive Preview"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Re-run</span>
          </button>

          <button
            onClick={handleStop}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shadow-sm ${
              isStopped
                ? 'bg-slate-800 text-rose-400 border border-rose-500/40'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
            title="Stop Execution & Halt All Active Loops, Intervals & Audio (Escape)"
          >
            <Square className="w-3.5 h-3.5 fill-current text-white" />
            <span>{isStopped ? 'Stopped' : 'Stop'}</span>
          </button>

          {/* Download HTML Button */}
          <button
            onClick={downloadStandaloneHtml}
            className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition cursor-pointer shadow-sm"
            title="Download standalone single HTML file ready for any web browser"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download HTML</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition cursor-pointer shadow-sm ml-1"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 flex flex-col items-center justify-start bg-slate-950/50 relative">
        {/* Tab 1: Live Interactive App Preview */}
        {activeSubTab === 'preview' && (
          <div
            className={`transition-all duration-300 bg-slate-950 border border-slate-800/90 rounded-2xl shadow-2xl p-2.5 sm:p-4 min-h-[460px] flex flex-col justify-start w-full ${getViewportWidthClass()}`}
          >
            {/* Window title bar mockup */}
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/80 text-[11px] text-slate-400 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-mono text-slate-500 text-[10px]">TypeLang Sandboxed Web DOM Viewport</span>
              </div>
              {isStopped ? (
                <span className="text-[10px] font-mono text-rose-400 flex items-center space-x-1 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/50">
                  <Square className="w-2.5 h-2.5 fill-current text-rose-400" />
                  <span>Execution Halted</span>
                </span>
              ) : sandboxResult ? (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{sandboxResult.executionTimeMs.toFixed(2)} ms</span>
                </span>
              ) : null}
            </div>

            {/* Error banner if any */}
            {sandboxResult && sandboxResult.error && (
              <div className="mb-3 p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-start space-x-2 font-mono shrink-0">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Sandbox Execution Error</div>
                  <div className="text-[11px] text-rose-200 mt-0.5">{sandboxResult.error}</div>
                </div>
              </div>
            )}

            {/* The Live Sandboxed Root Container */}
            <div
              ref={mountContainerRef}
              className="flex-1 w-full flex flex-col items-center justify-start min-h-[380px]"
            >
              <div id="app-root" className="w-full"></div>
            </div>
          </div>
        )}

        {/* Tab 2: Live App Console Logs */}
        {activeSubTab === 'logs' && (
          <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs text-slate-400">
              <span>Standard Output from Live Sandbox</span>
              <button
                onClick={() => setSandboxResult(prev => prev ? { ...prev, stdout: [] } : null)}
                className="hover:text-slate-200 underline cursor-pointer text-[11px]"
              >
                Clear Sandbox Logs
              </button>
            </div>
            {sandboxResult?.stdout && sandboxResult.stdout.length > 0 ? (
              <div className="space-y-1 font-mono text-xs text-emerald-300 max-h-[420px] overflow-y-auto">
                {sandboxResult.stdout.map((line, idx) => (
                  <div key={idx} className="flex space-x-2 items-start leading-relaxed">
                    <span className="text-slate-600 select-none text-[10px] w-6 text-right shrink-0">{idx + 1}</span>
                    <span className="break-all">{line}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-600 italic py-8 text-center text-xs">
                No logs recorded yet. Call `println(...)` or `DOM.log(...)` inside your TypeLang application.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Generated HTML DOM Inspector */}
        {activeSubTab === 'dom_inspect' && (
          <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-xs text-slate-400">
              <span>Live Rendered HTML Markup in #app-root</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inspectHtml);
                }}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-medium transition cursor-pointer"
              >
                Copy HTML
              </button>
            </div>
            <pre className="p-4 bg-slate-900/90 border border-slate-800/80 rounded-xl text-sky-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[420px]">
              {inspectHtml || '<div id="app-root"></div>'}
            </pre>
          </div>
        )}
      </div>

      {/* Floating Minimize Button (Only in Fullscreen) */}
      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="fixed bottom-6 right-6 z-[150] flex items-center justify-center p-3 sm:px-4 sm:py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          title="Exit Fullscreen"
        >
          <Minimize className="w-5 h-5 sm:mr-2" />
          <span className="hidden sm:inline font-bold text-sm">Exit Fullscreen</span>
        </button>
      )}
    </div>
  );
};
