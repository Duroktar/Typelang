import { ExampleProgram } from "./types";

export const example16FfiLodash: ExampleProgram = {
    id: 'ffi_lodash',
    name: '16. NPM FFI: Lodash (Functional Data Utilities)',
    category: 'NPM FFI & Interop',
    description: 'Compile-time type-safe FFI bindings for Lodash data transformations: chunking, statistical aggregations, deduplication, and string cases.',
    code: `// ==========================================================
// TypeLang NPM FFI: Lodash Data Utilities & Transformation
// ==========================================================

import DOM.{ h, mount }

// Type-Safe Foreign Module Definition for Lodash
extern module lodash {
  function sum(arr: [number]): number
  function mean(arr: [number]): number
  function chunk<T>(arr: [T], size: number): [[T]]
  function uniq<T>(arr: [T]): [T]
  function camelCase(str: string): string
  function kebabCase(str: string): string
}

// Sample dataset
let rawScores = [88, 92, 79, 95, 88, 92, 100, 74, 95]
let duplicateWords = ["TypeLang", "GADT", "TypeLang", "Compiler", "HM", "GADT", "Vite"]

// Perform Functional Data Transformations via FFI
let uniqueScores = lodash.uniq(rawScores)
let scoreSum = lodash.sum(rawScores)
let scoreMean = lodash.mean(rawScores)
let scoreBatches = lodash.chunk(uniqueScores, 3)

let titleSample = "type lang foreign function interface"
let camelResult = lodash.camelCase(titleSample)
let kebabResult = lodash.kebabCase(titleSample)

// Terminal Log Diagnostics
println(concat("Lodash Sum: ", to_string(scoreSum)))
println(concat("Lodash Mean: ", to_string(scoreMean)))
println(concat("Lodash CamelCase: ", camelResult))
println(concat("Lodash KebabCase: ", kebabResult))

// Virtual DOM Dashboard
let vnode = h("div", { className: "p-6 max-w-xl mx-auto space-y-5 font-sans text-slate-100" }, [
  h("div", { className: "space-y-1" }, [
    h("span", { className: "px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400" },
      "Data Transformation FFI"
    ),
    h("h1", { className: "text-2xl font-bold text-slate-100" }, "Lodash FP Utility Suite"),
    h("p", { className: "text-xs text-slate-400" }, "Executing Lodash functional array, math, and string transformations through TypeLang extern signatures.")
  ]),

  h("div", { className: "grid grid-cols-2 gap-3" }, [
    h("div", { className: "p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1" }, [
      h("div", { className: "text-[11px] text-slate-400 font-mono" }, "lodash.sum(scores)"),
      h("div", { className: "text-2xl font-extrabold text-amber-400 font-mono" }, to_string(scoreSum))
    ]),
    h("div", { className: "p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1" }, [
      h("div", { className: "text-[11px] text-slate-400 font-mono" }, "lodash.mean(scores)"),
      h("div", { className: "text-2xl font-extrabold text-emerald-400 font-mono" }, to_string(scoreMean))
    ])
  ]),

  h("div", { className: "p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono" }, [
    h("div", { className: "text-slate-400 font-semibold" }, "String Transformations:"),
    h("div", { className: "flex justify-between border-b border-slate-800/80 pb-1" }, [
      h("span", { className: "text-slate-400" }, "camelCase:"),
      h("span", { className: "text-sky-300 font-bold" }, camelResult)
    ]),
    h("div", { className: "flex justify-between" }, [
      h("span", { className: "text-slate-400" }, "kebabCase:"),
      h("span", { className: "text-purple-300 font-bold" }, kebabResult)
    ])
  ])
])

mount("app-root", vnode)
println("Mounted Lodash FFI Dashboard successfully!")
`
  };
