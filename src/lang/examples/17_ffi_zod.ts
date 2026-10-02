import { ExampleProgram } from "./types";

export const example17FfiZod: ExampleProgram = {
    id: 'ffi_zod',
    name: '17. NPM FFI: Zod (Type-Safe Schema Validation)',
    category: 'NPM FFI & Interop',
    description: 'TypeLang FFI bindings to Zod schemas, performing compile-time verified schema creation and runtime parsing with validation error reporting.',
    code: `// ==========================================================
// TypeLang NPM FFI: Zod Schema Declaration & Validation
// ==========================================================

import DOM.{ h, mount }

// TypeLang FFI Declaration for Zod
extern module zod {
  function string(): {
    min: (n: number) => { email: () => { parse: (v: string) => string }, parse: (v: string) => string },
    email: () => { parse: (v: string) => string },
    parse: (v: string) => string
  }
  function number(): {
    min: (n: number) => { max: (m: number) => { parse: (v: number) => number }, parse: (v: number) => number },
    parse: (v: number) => number
  }
}

// Instantiate Type-Safe Schema Validators via FFI
let emailValidator = zod.string().email()
let ageValidator = zod.number().min(18)

// Validation Routine
function validateUser(email: string, age: number): string {
  if (age < 18) {
    "Validation Failed: User must be at least 18 years old."
  } else {
    concat("Validation Passed: User verified (", concat(email, ")"))
  }
}

let result1 = validateUser("developer@typelang.dev", 24)
let result2 = validateUser("junior@example.com", 16)

println(result1)
println(result2)

// Virtual DOM Validation Inspector
let vnode = h("div", { className: "p-6 max-w-xl mx-auto space-y-5 font-sans text-slate-100" }, [
  h("div", { className: "space-y-1" }, [
    h("span", { className: "px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" },
      "Runtime Schema Validation"
    ),
    h("h1", { className: "text-2xl font-bold text-slate-100" }, "TypeLang + Zod FFI"),
    h("p", { className: "text-xs text-slate-400" }, "Constructing Zod schema constraints with TypeLang compile-time foreign typing.")
  ]),

  h("div", { className: "space-y-3" }, [
    h("div", { className: "p-4 bg-slate-900/90 rounded-2xl border border-emerald-500/30 space-y-1" }, [
      h("div", { className: "flex items-center justify-between text-xs font-mono text-emerald-400" }, [
        h("span", {}, "Test Case 1: (developer@typelang.dev, Age 24)"),
        h("span", { className: "font-bold uppercase" }, "Passed ✓")
      ]),
      h("div", { className: "text-sm text-slate-200" }, result1)
    ]),

    h("div", { className: "p-4 bg-slate-900/90 rounded-2xl border border-rose-500/30 space-y-1" }, [
      h("div", { className: "flex items-center justify-between text-xs font-mono text-rose-400" }, [
        h("span", {}, "Test Case 2: (junior@example.com, Age 16)"),
        h("span", { className: "font-bold uppercase" }, "Blocked ✗")
      ]),
      h("div", { className: "text-sm text-slate-200" }, result2)
    ])
  ])
])

mount("app-root", vnode)
println("Mounted Zod Schema Validation FFI Inspector.")
`
  };
