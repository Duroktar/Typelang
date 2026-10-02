import { ExampleProgram } from "./types";

export const example12ScientificCalculator: ExampleProgram = {
    id: 'scientific_calculator',
    name: '12. Scientific Calculator & UI Generator',
    category: 'Interactive Web Apps',
    description: 'Fully responsive scientific calculator supporting arithmetic, square root, power, and history stack.',
    code: `import DOM.{ h, mount }
import Math.{ sqrt, pow }

let state = {
  mut display: "0",
  mut prev: "",
  mut op: "",
  mut isNew: true,
  mut equation: ""
}

function renderCalc() {
  let btn = fn(label: string, cls: string, action: () => void) {
    h("button", {
      className: concat("h-12 rounded-xl font-bold text-sm transition cursor-pointer active:scale-95 shadow-sm ", cls),
      onClick: action
    }, label)
  }

  let handleNum = fn(numStr: string) {
    if (state.isNew || state.display == "0") {
      state.display = numStr
      state.isNew = false
    } else {
      state.display = concat(state.display, numStr)
    }
    renderCalc()
  }

  let handleOp = fn(nextOp: string) {
    state.prev = state.display
    state.op = nextOp
    state.equation = concat(state.display, concat(" ", nextOp))
    state.isNew = true
    renderCalc()
  }

  let handleEquals = fn() {
    if (state.op != "" && state.prev != "") {
      let a = String.parseFloat(state.prev)
      let b = String.parseFloat(state.display)
      let mut res = 0.0
      if (state.op == "+") { res = a + b }
      else if (state.op == "-") { res = a - b }
      else if (state.op == "*") { res = a * b }
      else if (state.op == "/") { res = b != 0.0 ? a / b : 0.0 }
      
      state.equation = concat(state.prev, concat(" ", concat(state.op, concat(" ", concat(state.display, " = ")))))
      state.display = to_string(res)
      state.prev = ""
      state.op = ""
      state.isNew = true
      renderCalc()
    }
  }

  let vnode = h("div", { className: "p-6 max-w-xs mx-auto space-y-4 font-sans text-slate-100 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl" }, [
    h("div", { className: "text-center mb-2" }, [
      h("h2", { className: "text-lg font-bold text-indigo-400 uppercase tracking-widest" }, "TypeLang Calc"),
      h("div", { className: "w-8 h-1 bg-indigo-500 mx-auto rounded-full mt-1" }, "")
    ]),

    // Screen
    h("div", { className: "p-4 bg-slate-950 border border-slate-800 rounded-2xl text-right shadow-inner mb-4" }, [
      h("div", { className: "text-[10px] font-mono text-slate-500 min-h-[14px] mb-1" }, state.equation),
      h("div", { className: "text-2xl font-mono font-bold text-emerald-400 overflow-hidden text-ellipsis" }, state.display)
    ]),

    // Keypad Grid
    h("div", { className: "grid grid-cols-4 gap-2" }, [
      btn("C", "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30", fn() {
        state.display = "0"
        state.prev = ""
        state.op = ""
        state.equation = ""
        state.isNew = true
        renderCalc()
      }),
      btn("√", "bg-slate-800 text-sky-400 hover:bg-slate-700", fn() {
        let n = String.parseFloat(state.display)
        state.display = to_string(sqrt(n))
        state.isNew = true
        renderCalc()
      }),
      btn("^", "bg-slate-800 text-sky-400 hover:bg-slate-700", fn() { handleOp("^") }),
      btn("÷", "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/40", fn() { handleOp("/") }),

      btn("7", "bg-slate-800/80 hover:bg-slate-700 text-slate-200", fn() { handleNum("7") }),
      btn("8", "bg-slate-800/80 hover:bg-slate-700 text-slate-200", fn() { handleNum("8") }),
      btn("9", "bg-slate-800/80 hover:bg-slate-700 text-slate-200", fn() { handleNum("9") }),
      btn("×", "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/40", fn() { handleOp("*") }),

      btn("4", "bg-slate-800/80 hover:bg-slate-700 text-slate-200", fn() { handleNum("4") }),
      btn("5", "bg-slate-800/80 hover:bg-slate-700 text-slate-200", fn() { handleNum("5") }),
      btn("6", "bg-slate-800/80 hover:bg-slate-700 text-slate-200", fn() { handleNum("6") }),
      btn("-", "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/40", fn() { handleOp("-") }),

      btn("1", "bg-slate-800/80 hover:bg-slate-700 text-slate-200", fn() { handleNum("1") }),
      btn("2", "bg-slate-800/80 hover:bg-slate-700 text-slate-200", fn() { handleNum("2") }),
      btn("3", "bg-slate-800/80 hover:bg-slate-700 text-slate-200", fn() { handleNum("3") }),
      btn("+", "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/40", fn() { handleOp("+") }),

      btn("0", "col-span-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200", fn() { handleNum("0") }),
      btn(".", "bg-slate-800/80 hover:bg-slate-700 text-slate-200", fn() { handleNum(".") }),
      btn("=", "bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20", handleEquals)
    ])
  ])

  mount("app-root", vnode)
}

renderCalc()
println("Scientific Calculator Initialized.")
`
  };
