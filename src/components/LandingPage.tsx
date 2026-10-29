import React, { useState } from 'react';
import {
  Code,
  Terminal,
  Cpu,
  Zap,
  Layers,
  Sparkles,
  Play,
  ArrowRight,
  CheckCircle2,
  FileCode,
  Box,
  Binary,
  Layers3,
  BookOpen,
  Github,
  ExternalLink,
  ShieldCheck,
  Globe,
  Gauge
} from 'lucide-react';

interface LandingPageProps {
  onOpenPlayground: () => void;
  onOpenSpec: () => void;
  onLoadExampleInPlayground: (exampleCode: string) => void;
}

const SAMPLE_SNIPPETS = [
  {
    name: 'Higher-Order Types (HKTs)',
    code: `type Functor<F: * -> *> = {
  map: <A, B>(fa: F<A>, f: (x: A) => B) => F<B>
}

type Option<T> = Some(val: T) | None

let optionFunctor: Functor<Option> = {
  map: <A, B>(opt: Option<A>, f: (x: A) => B): Option<B> => {
    match (opt) {
      Some(v) => Some(f(v))
      None => None
    }
  }
}

let result = optionFunctor.map(Some(21), fn(x) => x * 2);
println(to_string(result));`
  },
  {
    name: 'GADT Pattern Matching',
    code: `type Expr<T> =
  | Lit(val: number)
  | Add(left: Expr<number>, right: Expr<number>)
  | If(cond: Expr<boolean>, thenExpr: Expr<T>, elseExpr: Expr<T>)

function eval<T>(e: Expr<T>): number {
  match (e) {
    Lit(n) => n
    Add(l, r) => eval(l) + eval(r)
    If(c, t, e) => 0.0
  }
}

println(to_string(eval(Add(Lit(10), Lit(32)))));`
  },
  {
    name: 'WebAssembly & Native C/C++',
    code: `// TypeLang compiles effortlessly to LLVM IR, WAT (WebAssembly), C11, C++17, and JS
function fib(n: number): number {
  if (n <= 1.0) { return n; }
  return fib(n - 1.0) + fib(n - 2.0);
}

let ans = fib(12.0);
println(concat("fib(12) = ", to_string(ans)));`
  }
];

const highlightCode = (input: string) => {
  const lines = input.split('\n');
  return lines.map((line, lIdx) => {
    if (line.trim().startsWith('//')) {
      return <div key={lIdx} className="text-slate-500 italic">{line}</div>;
    }
    const parts = line.split(/(\/\/.+$|\/\*[\s\S]*?\*\/|"[^"]*"|'[^']*'|\b\d+(?:\.\d+)?\b|\b(?:type|let|function|fn|match|if|else|return|mut|true|false|for|while|do|where|import|export|as)\b|\b[A-Z][a-zA-Z0-9_]*\b|[{}()\[\]:=><+\-*/%|&!,.])/g);
    return (
      <div key={lIdx} className="whitespace-pre">
        {parts.map((part, pIdx) => {
          if (!part) return null;
          if (part.startsWith('//') || part.startsWith('/*')) {
            return <span key={pIdx} className="text-slate-500 italic">{part}</span>;
          }
          if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
            return <span key={pIdx} className="text-emerald-300">{part}</span>;
          }
          if (/^\d+(\.\d+)?$/.test(part)) {
            return <span key={pIdx} className="text-amber-300">{part}</span>;
          }
          if (['type', 'let', 'function', 'fn', 'match', 'if', 'else', 'return', 'mut', 'true', 'false', 'for', 'while', 'do', 'where', 'import', 'export', 'as'].includes(part)) {
            return <span key={pIdx} className="text-purple-400 font-bold">{part}</span>;
          }
          if (/^[A-Z]/.test(part)) {
            return <span key={pIdx} className="text-amber-200 font-semibold">{part}</span>;
          }
          if (['{', '}', '(', ')', '[', ']', '=', '=>', '<', '>', '+', '-', '*', '/', '%', '|', '&', '!', ',', '.'].includes(part)) {
            return <span key={pIdx} className="text-indigo-400">{part}</span>;
          }
          return <span key={pIdx} className="text-sky-200">{part}</span>;
        })}
      </div>
    );
  });
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenPlayground,
  onOpenSpec,
  onLoadExampleInPlayground
}) => {
  const [activeSnippetIdx, setActiveSnippetIdx] = useState(0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Announcement / Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                TypeLang
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                v0.2 Compiler & IDE
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#examples" className="hover:text-indigo-400 transition-colors">Examples</a>
            <a href="#targets" className="hover:text-indigo-400 transition-colors">Multi-Target</a>
            <button onClick={onOpenSpec} className="hover:text-indigo-400 transition-colors cursor-pointer flex items-center space-x-1">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Language Spec</span>
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <a
              href="https://github.com/google/ai-studio-applet"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
              title="GitHub Repository"
            >
              <Github className="w-5 h-5" />
            </a>
            <button
              onClick={onOpenPlayground}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/25 transition cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Playground</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-36">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generalized Algebraic Data Types & Multi-Target Code Generation</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              The Typed Functional Language for{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                High-Performance Systems
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed">
              TypeLang is an advanced statically typed programming language featuring bidirectional type checking, GADTs, pattern matching, and native compilation to LLVM IR, WebAssembly (WASM), C11, C++17, and ES2022 JavaScript.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={onOpenPlayground}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-base shadow-xl shadow-indigo-500/30 transition cursor-pointer active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Open Interactive Playground</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </button>

              <a
                href="#examples"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-semibold text-base transition cursor-pointer"
              >
                <Code className="w-5 h-5 text-indigo-400" />
                <span>Explore Code Examples</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-500 font-mono">
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Setup Browser IDE</span>
              </span>
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>WASM & LLVM Subsystems</span>
              </span>
              <span className="flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Ariadne ANSI Diagnostics</span>
              </span>
            </div>
          </div>

          {/* Interactive Code Preview Box */}
          <div className="mt-16 max-w-4xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">typelang-compiler-preview.tl</span>
              </div>

              {/* Snippet Selector Tabs */}
              <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                {SAMPLE_SNIPPETS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSnippetIdx(idx)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                      activeSnippetIdx === idx
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 font-mono text-xs sm:text-sm bg-slate-950/80 overflow-x-auto leading-relaxed min-h-[300px]">
              {highlightCode(SAMPLE_SNIPPETS[activeSnippetIdx].code)}
            </div>

            <div className="bg-slate-900 px-6 py-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-slate-400">
                Run this snippet instantly with full type checking and compilation.
              </span>
              <button
                onClick={() => {
                  onLoadExampleInPlayground(SAMPLE_SNIPPETS[activeSnippetIdx].code);
                }}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer shadow"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run in Playground</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TL;DR & Core Architecture */}
      <section id="features" className="py-24 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Engineered for Precision & Speed
            </h2>
            <p className="text-slate-400 text-base">
              TypeLang combines rigorous functional programming guarantees with lightning-fast multi-target code generation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-indigo-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Bidirectional GADT Inference</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Advanced type checker with Generalized Algebraic Data Types (GADTs), exhaustiveness checking, and polymorphic type inference.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-purple-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Multi-Target Code Generation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Compile once to LLVM SSA IR, WebAssembly (WAT/WASM), standalone ANSI C11, C++17, or ES2022 JavaScript / Node.js.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-pink-500/50 transition">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Ariadne ANSI Diagnostics</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Stunning compiler error messages with multi-line diagnostic callouts, exact caret pointers, and automated Quick Fix suggestions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Examples Section */}
      <section id="examples" className="py-24 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Examples & Demos
              </h2>
              <p className="text-slate-400 text-base mt-2">
                Explore real-world TypeLang programs ranging from mini-compilers to canvas simulations and games.
              </p>
            </div>
            <button
              onClick={onOpenPlayground}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 font-semibold text-sm transition cursor-pointer"
            >
              <span>View All 50+ Examples in Playground</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Higher-Order Types (HKTs)',
                desc: 'Polymorphic type constructors, Functor and Monad interfaces.',
                code: SAMPLE_SNIPPETS[0].code
              },
              {
                title: 'GADT Expression Evaluator',
                desc: 'Type-safe algebraic interpreters with pattern matching.',
                code: SAMPLE_SNIPPETS[1].code
              },
              {
                title: 'WebAssembly & Native C/C++',
                desc: 'High-performance recursive algorithms compiled to WASM and C.',
                code: SAMPLE_SNIPPETS[2].code
              },
              {
                title: 'Interactive Particle Swarm',
                desc: 'Canvas 2D simulation with reactive state updates.',
                code: `// Canvas Particle Swarm Demo\nlet count = 100.0;\nprintln(concat("Initialized ", concat(to_string(count), " particles")));`
              },
              {
                title: 'NPM FFI Integration',
                desc: 'Call canvas-confetti, lodash, and zod directly from TypeLang.',
                code: `// FFI with Zod schema validation\nlet schema = z.object({ name: z.string() });\nprintln("Zod schema loaded successfully");`
              },
              {
                title: 'TypeSheets Spreadsheet',
                desc: 'Reactive spreadsheet engine and financial modeling studio.',
                code: `// TypeSheets Reactive Engine\nlet cellA1 = 100.0;\nlet cellB1 = cellA1 * 1.15;\nprintln(concat("Total = ", to_string(cellB1)));`
              }
            ].map((ex, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      Example {idx + 1}
                    </span>
                    <FileCode className="w-4 h-4 text-slate-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{ex.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{ex.desc}</p>
                </div>

                <button
                  onClick={() => onLoadExampleInPlayground(ex.code)}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-slate-950 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-500/40 text-xs font-semibold transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Load & Run Example</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Multi-Target Architecture Grid */}
      <section id="targets" className="py-24 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              One Language, Five Powerful Backends
            </h2>
            <p className="text-slate-400 text-base">
              TypeLang is designed from the ground up for maximum portability and native execution performance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: 'LLVM IR', badge: 'SSA Optimizations', desc: 'Native x86_64 and ARM64 compilation via LLVM toolchains.', icon: Cpu },
              { name: 'WebAssembly', badge: 'Universal Bytecode', desc: 'Lightning-fast WASM binary compilation with WABT & WAT support.', icon: Binary },
              { name: 'C11 Native', badge: 'Standalone C', desc: 'Portable C code generation with tagged union heap allocators.', icon: Code },
              { name: 'C++17', badge: 'Zero-Overhead STL', desc: 'High-performance C++ code generation with smart pointers.', icon: FileCode },
              { name: 'Node.js / Web', badge: 'Express / React VDOM', desc: 'Full-stack JS generation with React hyperscript and Express bindings.', icon: Globe }
            ].map((t, idx) => {
              const IconComp = t.icon;
              return (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200 text-sm">{t.name}</h3>
                      <span className="text-[10px] text-indigo-400 font-mono">{t.badge}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              T
            </div>
            <span>TypeLang Compiler & IDE · Built for GitHub Pages</span>
          </div>

          <div className="flex items-center space-x-6">
            <button onClick={onOpenSpec} className="hover:text-slate-300 transition">Language Specification</button>
            <a href="https://github.com/google/ai-studio-applet" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition">GitHub</a>
            <button onClick={onOpenPlayground} className="text-indigo-400 font-semibold hover:underline">Launch Playground →</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
