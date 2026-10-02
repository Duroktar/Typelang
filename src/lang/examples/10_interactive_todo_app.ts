import { ExampleProgram } from "./types";

export const example10InteractiveTodoApp: ExampleProgram = {
    id: 'interactive_todo_app',
    name: '10. Interactive Task & Todo App (Live Preview)',
    category: 'Interactive Web Apps',
    description: 'Dynamic reactive Todo application rendering stateful Virtual DOM nodes with add/delete handlers.',
    code: `import DOM.{ h, mount }

// TypeLang Stateful Todo App
let state = {
  mut tasks: ["Implement TypeLang GADTs", "Build LLVM Code Generator", "Ship Interactive Live Preview"],
  mut newTaskText: "",
  mut filter: "all"
}

function renderApp() {
  let taskCards = []
  
  // Build task item virtual nodes
  for (let mut i = 0; i < state.tasks.length; i = i + 1) {
    let task = state.tasks[i]
    let taskNode = h("div", {
      className: "flex items-center justify-between p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl hover:border-indigo-500/50 transition shadow-sm"
    }, [
      h("div", { className: "flex items-center space-x-3" }, [
        h("div", { className: "w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" }, ""),
        h("span", { className: "text-sm text-slate-200 font-medium font-sans" }, task)
      ]),
      h("button", {
        className: "px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition cursor-pointer font-sans",
        onClick: fn() {
          let updated = []
          for (let mut j = 0; j < state.tasks.length; j = j + 1) {
            if (j != i) {
              updated.push(state.tasks[j])
            }
          }
          state.tasks = updated
          renderApp()
        }
      }, "Delete")
    ])
    taskCards.push(taskNode)
  }

  let vnode = h("div", { className: "p-6 max-w-xl mx-auto space-y-6 font-sans text-slate-100" }, [
    // Header
    h("div", { className: "flex items-center justify-between pb-4 border-b border-slate-800" }, [
      h("div", {}, [
        h("h1", { className: "text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent" }, "TypeLang Task Board"),
        h("p", { className: "text-xs text-slate-400 mt-0.5" }, "Compiled to Native Virtual DOM • 100% Type Safe")
      ]),
      h("span", { className: "px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-mono font-semibold" }, 
        concat("Active: ", to_string(state.tasks.length))
      )
    ]),

    // Add Task Input Form
    h("div", { className: "flex gap-2" }, [
      h("input", {
        type: "text",
        id: "task-input-field",
        placeholder: "Type a new task name...",
        className: "flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition font-sans"
      }, ""),
      h("button", {
        className: "px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-semibold text-sm transition shadow-md shadow-indigo-600/20 cursor-pointer font-sans",
        onClick: fn() {
          let inputEl = DOM.getElementById("task-input-field")
          let val = inputEl ? inputEl.value : ""
          if (val.trim().length > 0) {
            state.tasks.push(val.trim())
            inputEl.value = ""
            renderApp()
          }
        }
      }, "+ Add Task")
    ]),

    // Tasks List
    h("div", { className: "space-y-2.5 pt-2" }, taskCards.length > 0 ? taskCards : [
      h("div", { className: "p-8 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs italic" }, 
        "No pending tasks. Type a task name above and hit Add!"
      )
    ])
  ])

  mount("app-root", vnode)
}

// Initial Mount
renderApp()
println("Mounted TypeLang Interactive Task Board successfully!")
`
  };
