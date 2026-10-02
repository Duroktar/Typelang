import React from 'react';
import { X, BookOpen, Layers, Zap, Box, Code, Hash, Sparkles, FileCode, Download } from 'lucide-react';
import { downloadTextMateGrammar } from '../lang/textmateGrammar';

interface SpecDocProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecDoc: React.FC<SpecDocProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl text-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Language Specification Reference</h2>
              <p className="text-xs text-slate-400">Draft v0.1 Syntax Cheatsheet & GADT Mechanics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Section 1: Base Types & Functions */}
          <section className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold border-b border-slate-800 pb-1">
              <Zap className="w-4 h-4" />
              <h3>1. Base Types & Function Types</h3>
            </div>
            <p className="text-xs text-slate-300">
              Primitive types: <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">number</code>, <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">boolean</code>, <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">string</code>, <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">void</code>.
            </p>
            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-indigo-300 overflow-x-auto">
{`function add(x: number, y: number): number {
  x + y
}

function identity<a>(x: a): a {
  x
}`}
            </pre>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Loop Control & Early Returns</h4>
              <p className="text-xs text-slate-400 mb-2">
                Use <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">break</code>, <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">continue</code>, and <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">return</code> inside loops and functions for precise control flow:
              </p>
              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-amber-300 overflow-x-auto">
{`function findIndex(arr: number[], target: number): number {
  for (let mut i = 0; i < Array.len(arr); i = i + 1) {
    if (arr[i] == target) {
      return i // early return
    }
    if (arr[i] < 0) {
      continue // skip negative numbers
    }
    if (i > 100) {
      break // early loop termination
    }
  }
  -1
}`}
              </pre>
            </div>
          </section>

          {/* Section 2: Control Flow: Switch Expressions, Ranges & Comprehensions */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold border-b border-slate-800 pb-1">
              <Code className="w-4 h-4" />
              <h3>2. Control Flow: Switch Expressions, Ranges & Comprehensions</h3>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Switch Expressions & Fallthrough
              </h4>
              <p className="text-xs text-slate-300 mb-2">
                Switches evaluate to expressions with auto-break semantics. Supports comma-delimited matchers (<code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">case 1, 2, 3:</code>), stacked clauses, and explicit fallthrough via <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">continue</code>.
              </p>
              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-amber-300 overflow-x-auto">
{`// Switch as a value-returning expression with stacked and comma matchers
let category = switch (day) {
  case 1, 2, 3, 4:
  case 5:
    "Weekday"
  case 6, 7:
    "Weekend"
  default:
    "Unknown"
}

// Switch statement with explicit fallthrough via 'continue'
switch (securityLevel) {
  case 1: {
    println("High Clearance Granted")
    continue // Explicit fallthrough to next case
  }
  case 2: {
    println("Standard Access Granted")
  }
  default: {
    println("Guest Access Granted")
  }
}`}
              </pre>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Rust-Style Range Syntax Sugar
              </h4>
              <p className="text-xs text-slate-300 mb-2">
                Construct range arrays directly using exclusive (<code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">[start..end]</code>) or inclusive (<code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">[start..=end]</code>) range syntax. Supports ascending and descending sequences.
              </p>
              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-emerald-300 overflow-x-auto">
{`let exclusive = [1..5]   // [1, 2, 3, 4]
let inclusive = [1..=5]  // [1, 2, 3, 4, 5]
let descending = [5..1]  // [5, 4, 3, 2]`}
              </pre>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                List Comprehensions
              </h4>
              <p className="text-xs text-slate-300 mb-2">
                Transform and filter collections cleanly using list comprehensions over arrays or range expressions.
              </p>
              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-cyan-300 overflow-x-auto">
{`let evens = [x * 2 for x in 1..=5]             // [2, 4, 6, 8, 10]
let filtered = [x for x in 1..=10 if x % 2 == 0] // [2, 4, 6, 8, 10]`}
              </pre>
            </div>
          </section>

          {/* Section 3: GADTs */}
          <section className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold border-b border-slate-800 pb-1">
              <Layers className="w-4 h-4" />
              <h3>3. General Generalized Algebraic Data Types (GADTs)</h3>
            </div>
            <p className="text-xs text-slate-300">
              Supports both short form and full/existential forms. In match arms, GADT pattern matching refines type parameters automatically!
            </p>
            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-purple-300 overflow-x-auto">
{`// Short form preferred for simple variants
type Expr<a> =
  | Lit(value: number): Expr<number>
  | Bool(value: boolean): Expr<boolean>
  | Add(left: Expr<number>, right: Expr<number>): Expr<number>
  | If(cond: Expr<boolean>, then: Expr<a>, else: Expr<a>): Expr<a>

// Full form for existential quantification
type Packed =
  | Pack<b>(value: b, show: (x: b) => string): Packed`}
            </pre>
          </section>

          {/* Section 4: Pattern Matching */}
          <section className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold border-b border-slate-800 pb-1">
              <Box className="w-4 h-4" />
              <h3>4. Pattern Matching & Exhaustiveness</h3>
            </div>
            <p className="text-xs text-slate-300">
              Matches are exhaustive by default with an optional <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">...</code> escape hatch. Supports guards (<code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">if</code>) and <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">as</code> bindings.
            </p>
            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-emerald-300 overflow-x-auto">
{`match (e) {
  Lit(v)          => v
  Bool(b)         => b
  Add(l, r)       => eval(l) + eval(r)
  If(c, t, f)     => eval(c) ? eval(t) : eval(f)
  Circle(r) if r > 10.0 => "Large"
  Rectangle(w, h) as rect => "Rect"
  ...             => "Fallback"
}`}
            </pre>
          </section>

          {/* Section 5: Higher-Rank & Higher-Order Types (HKTs) */}
          <section className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold border-b border-slate-800 pb-1">
              <Code className="w-4 h-4" />
              <h3>5. Higher-Order Types (HKTs) & Higher-Rank Polymorphism</h3>
            </div>
            <p className="text-xs text-slate-300">
              TypeLang supports full Higher-Order Types with kind annotations (<code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">F: * -&gt; *</code>), type lambdas (<code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">\a =&gt; Option&lt;a&gt;</code>), and higher-kinded abstractions like Functor and Monad:
            </p>
            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-amber-300 overflow-x-auto">
{`// 1. Higher-kinded Functor abstraction
type Functor<F: * -> *> = {
  map: <A, B>(fa: F<A>, fn: (x: A) => B) => F<B>
}

// 2. Generic function over any higher-order type constructor F
function transform<F: * -> *, A>(functor: Functor<F>, data: F<A>, f: (x: A) => A): F<A> {
  functor.map(data, f)
}

// 3. Type-level lambda syntax
type OptionTransformer = \\A => Option<A>`}
            </pre>
          </section>

          {/* Section 6: Structural Records & Modules */}
          <section className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold border-b border-slate-800 pb-1">
              <Hash className="w-4 h-4" />
              <h3>6. Structural Records & Modules</h3>
            </div>
            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-indigo-300 overflow-x-auto">
{`// Structural Record with methods and mutable fields
let counter = {
  mut count: 0,
  inc(self): void { self.count += 1 }
}

// Module with abstract types and exports
module MathUtils {
  export function add(a: number, b: number): number { a + b }
}

import MathUtils.{ add }`}
            </pre>
          </section>

          {/* Section 7: Standard Library Modules */}
          <section className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-400 font-semibold border-b border-slate-800 pb-1">
              <Sparkles className="w-4 h-4" />
              <h3>7. Modular Standard Library</h3>
            </div>
            <p className="text-xs text-slate-300">
              TypeLang standard utilities are organized into specialized submodules for high cohesion and modularity:
            </p>
            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-sky-300 overflow-x-auto">
{`import Math.{ sqrt, pow, abs, floor, ceil, min, max, random }
import Array.{ len, map, filter, reduce, push, slice, concat }
import String.{ len, slice, split, contains, parseInt, parseFloat }
import DOM.{ h, mount, getElementById, createElement, setText, setHtml, addEventListener }
import Node.{ createApp, get, post, use, listen, send, json, status, readFile, writeFile }`}
            </pre>
          </section>

          {/* Section 8: VS Code & TextMate Grammar */}
          <section className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <div className="flex items-center space-x-2 text-indigo-400 font-semibold">
                <FileCode className="w-4 h-4" />
                <h3>8. VS Code Grammar & Tooling (typelang.tmLanguage.json)</h3>
              </div>
              <button
                onClick={downloadTextMateGrammar}
                className="flex items-center space-x-1.5 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-semibold transition cursor-pointer"
                title="Download typelang.tmLanguage.json"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Grammar (.json)</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              You can export the official <code className="text-blue-300 font-mono">typelang.tmLanguage.json</code> TextMate grammar directly from the playground (via <strong>Project → VS Code Syntax</strong> or the button above). Drop it into your local VS Code extensions directory to enjoy full syntax highlighting and language support for <code className="text-emerald-300 font-mono">.tl</code> source files.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};
