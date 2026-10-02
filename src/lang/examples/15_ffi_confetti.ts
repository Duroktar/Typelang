import { ExampleProgram } from "./types";

export const example15FfiConfetti: ExampleProgram = {
    id: 'ffi_confetti',
    name: '15. NPM FFI: canvas-confetti (Particles & Fireworks)',
    category: 'NPM FFI & Interop',
    description: 'Type-safe foreign function interface (FFI) bindings to the canvas-confetti npm package with interactive fireworks controls.',
    code: `// ==========================================================
// TypeLang NPM FFI: canvas-confetti Particles & Fireworks
// ==========================================================

import DOM.{ h, mount }

// TypeLang Foreign Function Interface (FFI) Declaration
extern module confetti {
  function confetti(options: {
    particleCount: number,
    spread: number,
    startVelocity: number,
    ticks: number,
    gravity: number,
    decay: number,
    origin: { x: number, y: number }
  }): void
  function reset(): void
}

// Particle Configuration Presets
let fireworkPreset = {
  particleCount: 150,
  spread: 100,
  startVelocity: 55,
  ticks: 200,
  gravity: 1,
  decay: 0.94,
  origin: { x: 0.5, y: 0.6 }
}

let rainbowCannonPreset = {
  particleCount: 80,
  spread: 60,
  startVelocity: 45,
  ticks: 150,
  gravity: 0.9,
  decay: 0.92,
  origin: { x: 0.2, y: 0.8 }
}

let rightCannonPreset = {
  particleCount: 80,
  spread: 60,
  startVelocity: 45,
  ticks: 150,
  gravity: 0.9,
  decay: 0.92,
  origin: { x: 0.8, y: 0.8 }
}

// Virtual DOM Interactive Particle Controller
let vnode = h("div", { className: "p-6 max-w-xl mx-auto space-y-6 font-sans text-slate-100" }, [
  h("div", { className: "text-center space-y-2" }, [
    h("span", { className: "px-3 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400" }, 
      "NPM Foreign Function Interface"
    ),
    h("h1", { className: "text-3xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent" },
      "TypeLang + canvas-confetti"
    ),
    h("p", { className: "text-xs text-slate-400 max-w-md mx-auto" },
      "Compile-time type-checked bindings executing real NPM canvas-confetti particle physics in the browser."
    )
  ]),

  h("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" }, [
    h("button", {
      className: "p-4 bg-gradient-to-br from-pink-600/90 to-rose-600/90 hover:from-pink-500 hover:to-rose-500 text-white rounded-2xl shadow-lg shadow-pink-600/30 transition cursor-pointer active:scale-95 text-left border border-pink-400/30",
      onClick: fn() {
        confetti.confetti(fireworkPreset)
        println("✨ Triggered Fireworks Burst via FFI (150 particles)!")
      }
    }, [
      h("div", { className: "text-lg font-bold" }, "🎆 Center Fireworks"),
      h("div", { className: "text-[11px] text-pink-100/80 mt-1" }, "High-velocity 360° particle explosion")
    ]),

    h("button", {
      className: "p-4 bg-gradient-to-br from-indigo-600/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl shadow-lg shadow-indigo-600/30 transition cursor-pointer active:scale-95 text-left border border-indigo-400/30",
      onClick: fn() {
        confetti.confetti(rainbowCannonPreset)
        confetti.confetti(rightCannonPreset)
        println("🎉 Triggered Dual Cross-Cannons (160 particles)!")
      }
    }, [
      h("div", { className: "text-lg font-bold" }, "🎉 Dual Cannons"),
      h("div", { className: "text-[11px] text-indigo-100/80 mt-1" }, "Simultaneous angled corner bursts")
    ])
  ]),

  h("div", { className: "p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono" }, [
    h("div", { className: "text-slate-400 font-semibold uppercase text-[10px] tracking-wider" }, "FFI Type Guarantee:"),
    h("div", { className: "text-emerald-400" }, "✓ confetti.confetti(options: ConfettiOptions): void"),
    h("div", { className: "text-slate-400 text-[11px]" }, "Passed structural options record checked strictly by TypeLang HM type system.")
  ])
])

mount("app-root", vnode)
println("Mounted canvas-confetti FFI Playground successfully!")
`
  };
