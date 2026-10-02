import { ExampleProgram } from "./types";

export const example08WebDomVdom: ExampleProgram = {
    id: 'web_dom_vdom',
    name: '8. Client Web & Reactive Virtual DOM',
    category: 'Web & DOM Target',
    description: 'Building client-side interactive UI components using TypeLang DOM module and Virtual DOM hyperscript.',
    code: `import DOM.{ h, mount }

// Virtual DOM Component in TypeLang
function renderCounterCard(count: number, title: string) {
  h("div", { className: "p-4 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800" }, [
    h("h2", { className: "text-lg font-bold text-sky-400" }, title),
    h("p", { className: "text-2xl font-mono my-2" }, concat("Current Count: ", to_string(count))),
    h("div", { className: "flex gap-2 mt-4" }, [
      h("button", { className: "px-3 py-1 bg-sky-600 hover:bg-sky-500 rounded font-semibold text-sm" }, "+ Increment"),
      h("button", { className: "px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded font-semibold text-sm" }, "Reset")
    ])
  ])
}

let vdomTree = renderCounterCard(5, "TypeLang Reactive Web Component")
mount("app-root", vdomTree)
println("Mounted TypeLang Virtual DOM component into #app-root successfully!")
`
  };
