import { ExampleProgram } from "./types";

export const example29LoopControlPrimeLab: ExampleProgram = {
    id: "29",
    name: "29. Loop Control & Prime Number Lab",
    title: "29. Loop Control & Prime Number Lab",
    description: "An interactive math engine visualizing prime number generation and early-return linear searches using 'break', 'continue', and 'return'.",
    category: "Algorithms & Data Structures",
    code: `// ---------------------------------------------------------
// 29. Loop Control & Prime Number Lab (DOM & Math)
// ---------------------------------------------------------

import DOM.{ h, mount }
import Math.{ sqrt, floor }
import String.{ parseInt }

let mut maxNum: number = 100
let mut foundPrimes: number[] = []
let mut targetVal: number = 47
let mut searchIndex: number = -1

// 1. Is Prime Function utilizing loop controls (break, continue, and early return)
function isPrime(n: number): boolean {
  if (n < 2) { return false }
  if (n == 2) { return true }
  
  // Skip even numbers using continue/early returns
  if (n - floor(n / 2) * 2 == 0) { return false }
  
  let limit = floor(Math.sqrt(n))
  let mut prime = true
  
  for (let mut i = 3; i <= limit; i = i + 2) {
    if (n - floor(n / i) * i == 0) {
      prime = false
      break // early termination when divisor is found
    }
  }
  
  prime
}

// 2. Generate primes up to max using continue
function generatePrimes(limit: number): number[] {
  let mut primes: number[] = []
  for (let mut i = 2; i <= limit; i = i + 1) {
    if (isPrime(i) == false) {
      continue // Skip composite numbers
    }
    primes = Array.push(primes, i)
  }
  primes
}

// 3. Search target element using early return inside loop
function findElement(arr: number[], target: number): number {
  let fallback = -1
  for (let mut i = 0; i < Array.len(arr); i = i + 1) {
    if (arr[i] == target) {
      return i // Instant early return from function
    }
  }
  fallback
}

function runAlgorithms() {
  foundPrimes = generatePrimes(maxNum)
  searchIndex = findElement(foundPrimes, targetVal)
}

function render() {
  let vnode = h("div", { className: "p-6 bg-slate-900 border border-slate-800 rounded-2xl max-w-xl mx-auto space-y-6 text-slate-200" }, [
    h("div", { className: "space-y-1" }, [
      h("h2", { className: "text-xl font-black text-indigo-400" }, "Loop Control & Early Returns Lab"),
      h("p", { className: "text-xs text-slate-400" }, "Explore early returns, breaks, and continues executing natively in TypeLang.")
    ]),
    
    h("div", { className: "space-y-4" }, [
      h("div", { className: "grid grid-cols-2 gap-4" }, [
        h("div", { className: "space-y-1.5" }, [
          h("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider" }, "Find Primes Up To:"),
          h("input", {
            type: "number",
            value: maxNum,
            className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500",
            onInput: fn(e: any) {
              maxNum = parseInt(e.target.value)
              runAlgorithms()
              render()
            }
          }, "")
        ]),
        h("div", { className: "space-y-1.5" }, [
          h("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider" }, "Search Prime Target:"),
          h("input", {
            type: "number",
            value: targetVal,
            className: "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500",
            onInput: fn(e: any) {
              targetVal = parseInt(e.target.value)
              runAlgorithms()
              render()
            }
          }, "")
        ])
      ])
    ]),
    
    h("div", { className: "p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl space-y-3" }, [
      h("div", { className: "flex justify-between items-center border-b border-slate-800 pb-2" }, [
        h("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider" }, "Primes Found:"),
        h("span", { className: "text-xs font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full" }, to_string(Array.len(foundPrimes)))
      ]),
      h("p", { className: "text-sm font-mono tracking-tight text-emerald-400 break-words leading-relaxed" }, 
        Array.len(foundPrimes) == 0 ? "None" : to_string(foundPrimes)
      )
    ]),
    
    h("div", { className: "p-4 bg-slate-950/60 border border-slate-800/60 rounded-xl space-y-2" }, [
      h("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider block" }, "Early Return Search Result:"),
      h("div", { className: "flex items-center space-x-2 text-sm" }, [
        h("span", { className: "text-slate-300" }, "Target prime"),
        h("span", { className: "font-mono font-bold text-amber-400" }, to_string(targetVal)),
        h("span", { className: "text-slate-300" }, "found at index:"),
        h("span", { className: "font-mono font-bold text-indigo-400 text-base" }, to_string(searchIndex))
      ])
    ])
  ])
  mount("app-root", vnode)
}

runAlgorithms()
render()
println("Algorithms Lab Loaded successfully!")
`
  };
