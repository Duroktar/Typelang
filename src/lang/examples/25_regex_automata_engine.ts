import { ExampleProgram } from "./types";

export const example25RegexAutomataEngine: ExampleProgram = {
    id: "regex-automata-engine",
    name: "25. Regex Engine & Finite Automata (NFA / DFA) Visualizer",
    category: "Compilers & Tools",
    description: "Compiles regular expressions into Thompson's Non-deterministic Finite Automata (NFA) and converts to Deterministic Finite Automata (DFA) via Powerset Subset Construction. Includes real-time step-by-step regex matching, active state highlighting, and interactive graph rendering.",
    code: `import DOM.{ h, mount, getElementById }

let CANVAS_W = 870
let CANVAS_H = 460

type Transition = {
  fromId: number,
  toId: number,
  symbol: string
}

type Fragment = {
  startId: number,
  acceptId: number
}

type DFAState = {
  id: number,
  nfaSetKey: string,
  nfaSet: number[],
  isAccept: boolean
}

type NodePos = {
  id: number,
  x: number,
  y: number,
  label: string,
  isAccept: boolean,
  isStart: boolean
}

type LogEntry = {
  step: number,
  char: string,
  statesStr: string,
  status: string
}

let mut currentRegex = "(a|b)*abb"
let mut currentTestStr = "aabb"
let mut isDfaMode = false

let mut nextStateId = 0
let mut nfaTransitions: Transition[] = []
let mut nfaStatesCount = 0
let mut nfaStartId = 0
let mut nfaAcceptId = 0

let mut dfaStates: DFAState[] = []
let mut dfaTransitions: Transition[] = []

let mut activeNfaStates: number[] = []
let mut activeDfaId = 0
let mut stepIndex = 0
let mut isAutoPlaying = false
let mut playTimerId = 0
let mut evalStatus = "IDLE"
let mut playSpeedMs = 600

let mut executionLogs: LogEntry[] = []

function isAlpha(c: string): boolean {
  c != "|" && c != "*" && c != "+" && c != "?" && c != "(" && c != ")" && c != "."
}

function preprocessRegex(re: string): string {
  let mut res = ""
  let len = re.length
  for (let mut i = 0; i < len; i = i + 1) {
    let c1 = re.charAt(i)
    res = concat(res, c1)
    if (i + 1 < len) {
      let c2 = re.charAt(i + 1)
      let c1CanEnd = isAlpha(c1) || c1 == "." || c1 == "*" || c1 == "+" || c1 == "?" || c1 == ")"
      let c2CanStart = isAlpha(c2) || c2 == "." || c2 == "("
      if (c1CanEnd && c2CanStart) {
        res = concat(res, ".")
      }
    }
  }
  res
}

function getOpPrecedence(op: string): number {
  if (op == "*") 3
  else if (op == "+") 3
  else if (op == "?") 3
  else if (op == ".") 2
  else if (op == "|") 1
  else 0
}

function infixToPostfix(re: string): string {
  let formatted = preprocessRegex(re)
  let mut postfix = ""
  let mut opStack: string[] = []
  let len = formatted.length

  for (let mut i = 0; i < len; i = i + 1) {
    let c = formatted.charAt(i)
    if (isAlpha(c)) {
      postfix = concat(postfix, c)
    } else if (c == "(") {
      opStack.push(c)
    } else if (c == ")") {
      while (opStack.length > 0 && opStack[opStack.length - 1] != "(") {
        let op = opStack.pop()
        postfix = concat(postfix, op)
      }
      if (opStack.length > 0) {
        opStack.pop()
      }
    } else {
      let prec = getOpPrecedence(c)
      while (opStack.length > 0 && opStack[opStack.length - 1] != "(" && getOpPrecedence(opStack[opStack.length - 1]) >= prec) {
        let op = opStack.pop()
        postfix = concat(postfix, op)
      }
      opStack.push(c)
    }
  }

  while (opStack.length > 0) {
    let op = opStack.pop()
    postfix = concat(postfix, op)
  }

  postfix
}

function buildNFA(re: string) {
  let pf = infixToPostfix(re)
  nextStateId = 0
  nfaTransitions = []

  let mut fragStack: Fragment[] = []
  let len = pf.length

  for (let mut i = 0; i < len; i = i + 1) {
    let c = pf.charAt(i)
    if (isAlpha(c)) {
      let s0 = nextStateId
      let s1 = nextStateId + 1
      nextStateId = nextStateId + 2
      nfaTransitions.push({ fromId: s0, toId: s1, symbol: c })
      fragStack.push({ startId: s0, acceptId: s1 })
    } else if (c == ".") {
      if (fragStack.length >= 2) {
        let f2 = fragStack.pop()
        let f1 = fragStack.pop()
        nfaTransitions.push({ fromId: f1.acceptId, toId: f2.startId, symbol: "ε" })
        fragStack.push({ startId: f1.startId, acceptId: f2.acceptId })
      }
    } else if (c == "|") {
      if (fragStack.length >= 2) {
        let f2 = fragStack.pop()
        let f1 = fragStack.pop()
        let sStart = nextStateId
        let sAccept = nextStateId + 1
        nextStateId = nextStateId + 2

        nfaTransitions.push({ fromId: sStart, toId: f1.startId, symbol: "ε" })
        nfaTransitions.push({ fromId: sStart, toId: f2.startId, symbol: "ε" })
        nfaTransitions.push({ fromId: f1.acceptId, toId: sAccept, symbol: "ε" })
        nfaTransitions.push({ fromId: f2.acceptId, toId: sAccept, symbol: "ε" })

        fragStack.push({ startId: sStart, acceptId: sAccept })
      }
    } else if (c == "*") {
      if (fragStack.length >= 1) {
        let f = fragStack.pop()
        let sStart = nextStateId
        let sAccept = nextStateId + 1
        nextStateId = nextStateId + 2

        nfaTransitions.push({ fromId: sStart, toId: f.startId, symbol: "ε" })
        nfaTransitions.push({ fromId: sStart, toId: sAccept, symbol: "ε" })
        nfaTransitions.push({ fromId: f.acceptId, toId: f.startId, symbol: "ε" })
        nfaTransitions.push({ fromId: f.acceptId, toId: sAccept, symbol: "ε" })

        fragStack.push({ startId: sStart, acceptId: sAccept })
      }
    } else if (c == "+") {
      if (fragStack.length >= 1) {
        let f = fragStack.pop()
        let sStart = nextStateId
        let sAccept = nextStateId + 1
        nextStateId = nextStateId + 2

        nfaTransitions.push({ fromId: sStart, toId: f.startId, symbol: "ε" })
        nfaTransitions.push({ fromId: f.acceptId, toId: f.startId, symbol: "ε" })
        nfaTransitions.push({ fromId: f.acceptId, toId: sAccept, symbol: "ε" })

        fragStack.push({ startId: sStart, acceptId: sAccept })
      }
    } else if (c == "?") {
      if (fragStack.length >= 1) {
        let f = fragStack.pop()
        let sStart = nextStateId
        let sAccept = nextStateId + 1
        nextStateId = nextStateId + 2

        nfaTransitions.push({ fromId: sStart, toId: f.startId, symbol: "ε" })
        nfaTransitions.push({ fromId: sStart, toId: sAccept, symbol: "ε" })
        nfaTransitions.push({ fromId: f.acceptId, toId: sAccept, symbol: "ε" })

        fragStack.push({ startId: sStart, acceptId: sAccept })
      }
    }
  }

  if (fragStack.length > 0) {
    let top = fragStack.pop()
    nfaStartId = top.startId
    nfaAcceptId = top.acceptId
  } else {
    nfaStartId = 0
    nfaAcceptId = 0
  }
  nfaStatesCount = nextStateId
}

function getEpsilonClosure(states: number[]): number[] {
  let mut closure: number[] = []
  for (let mut i = 0; i < states.length; i = i + 1) {
    closure.push(states[i])
  }

  let mut stack: number[] = []
  for (let mut i = 0; i < states.length; i = i + 1) {
    stack.push(states[i])
  }

  while (stack.length > 0) {
    let curr = stack.pop()
    for (let mut i = 0; i < nfaTransitions.length; i = i + 1) {
      let tr = nfaTransitions[i]
      if (tr.fromId == curr && tr.symbol == "ε") {
        if (!closure.includes(tr.toId)) {
          closure.push(tr.toId)
          stack.push(tr.toId)
        }
      }
    }
  }

  closure
}

function moveNFA(states: number[], symbol: string): number[] {
  let mut nextStates: number[] = []
  for (let mut i = 0; i < states.length; i = i + 1) {
    let curr = states[i]
    for (let mut k = 0; k < nfaTransitions.length; k = k + 1) {
      let tr = nfaTransitions[k]
      if (tr.fromId == curr && (tr.symbol == symbol || tr.symbol == ".")) {
        if (!nextStates.includes(tr.toId)) {
          nextStates.push(tr.toId)
        }
      }
    }
  }
  getEpsilonClosure(nextStates)
}

function stateSetToKey(set: number[]): string {
  let mut sorted: number[] = []
  for (let mut i = 0; i < set.length; i = i + 1) {
    sorted.push(set[i])
  }
  let mut key = ""
  for (let mut i = 0; i < sorted.length; i = i + 1) {
    if (i > 0) key = concat(key, ",")
    key = concat(key, to_string(sorted[i]))
  }
  key
}

function buildDFA() {
  dfaStates = []
  dfaTransitions = []

  let mut alphabet: string[] = []
  for (let mut i = 0; i < nfaTransitions.length; i = i + 1) {
    let sym = nfaTransitions[i].symbol
    if (sym != "ε" && !alphabet.includes(sym)) {
      alphabet.push(sym)
    }
  }

  let startClosure = getEpsilonClosure([nfaStartId])
  let startKey = stateSetToKey(startClosure)
  let mut startIsAccept = false
  for (let mut i = 0; i < startClosure.length; i = i + 1) {
    if (startClosure[i] == nfaAcceptId) startIsAccept = true
  }

  dfaStates.push({
    id: 0,
    nfaSetKey: startKey,
    nfaSet: startClosure,
    isAccept: startIsAccept
  })

  let mut unvisitedKeys: string[] = [startKey]
  let mut nextDfaId = 1

  while (unvisitedKeys.length > 0) {
    let currKey = unvisitedKeys.pop()
    let mut currDfaState: DFAState = dfaStates[0]
    for (let mut i = 0; i < dfaStates.length; i = i + 1) {
      if (dfaStates[i].nfaSetKey == currKey) {
        currDfaState = dfaStates[i]
      }
    }

    for (let mut a = 0; a < alphabet.length; a = a + 1) {
      let sym = alphabet[a]
      let moveSet = moveNFA(currDfaState.nfaSet, sym)

      if (moveSet.length > 0) {
        let targetKey = stateSetToKey(moveSet)
        let mut targetDfaId = -1
        for (let mut d = 0; d < dfaStates.length; d = d + 1) {
          if (dfaStates[d].nfaSetKey == targetKey) {
            targetDfaId = dfaStates[d].id
          }
        }

        if (targetDfaId == -1) {
          targetDfaId = nextDfaId
          nextDfaId = nextDfaId + 1

          let mut isAcc = false
          for (let mut m = 0; m < moveSet.length; m = m + 1) {
            if (moveSet[m] == nfaAcceptId) isAcc = true
          }

          dfaStates.push({
            id: targetDfaId,
            nfaSetKey: targetKey,
            nfaSet: moveSet,
            isAccept: isAcc
          })
          unvisitedKeys.push(targetKey)
        }

        dfaTransitions.push({
          fromId: currDfaState.id,
          toId: targetDfaId,
          symbol: sym
        })
      }
    }
  }
}

function statesToString(states: number[]): string {
  let mut s = "{"
  for (let mut i = 0; i < states.length; i = i + 1) {
    if (i > 0) s = concat(s, ", ")
    s = concat(s, concat("S", to_string(states[i])))
  }
  concat(s, "}")
}

function initEvaluator() {
  stopAutoPlay()
  buildNFA(currentRegex)
  buildDFA()

  stepIndex = 0
  activeNfaStates = getEpsilonClosure([nfaStartId])
  activeDfaId = 0
  evalStatus = "RUNNING"
  executionLogs = []

  let initStr = isDfaMode ? concat("q0 (", concat(statesToString(dfaStates[0].nfaSet), ")")) : statesToString(activeNfaStates)
  executionLogs.push({
    step: 0,
    char: "ε-closure",
    statesStr: initStr,
    status: "START"
  })

  if (currentTestStr.length == 0) {
    let isAcc = isDfaMode ? dfaStates[0].isAccept : activeNfaStates.includes(nfaAcceptId)
    evalStatus = isAcc ? "ACCEPTED" : "REJECTED"
  }
}

function stepEvaluator() {
  if (stepIndex < currentTestStr.length && evalStatus == "RUNNING") {
    let charRead = currentTestStr.charAt(stepIndex)
    if (isDfaMode) {
      let mut nextDfa = -1
      for (let mut i = 0; i < dfaTransitions.length; i = i + 1) {
        let tr = dfaTransitions[i]
        if (tr.fromId == activeDfaId && tr.symbol == charRead) {
          nextDfa = tr.toId
        }
      }
      activeDfaId = nextDfa
      stepIndex = stepIndex + 1

      if (activeDfaId == -1) {
        evalStatus = "REJECTED"
        executionLogs.push({
          step: stepIndex,
          char: charRead,
          statesStr: "∅ (Trap)",
          status: "REJECTED"
        })
      } else {
        let mut dObj = dfaStates[0]
        for (let mut i = 0; i < dfaStates.length; i = i + 1) {
          if (dfaStates[i].id == activeDfaId) dObj = dfaStates[i]
        }
        let stStr = concat(concat("q", to_string(activeDfaId)), concat(" (", concat(statesToString(dObj.nfaSet), ")")))
        let isDone = stepIndex == currentTestStr.length
        if (isDone) {
          evalStatus = dObj.isAccept ? "ACCEPTED" : "REJECTED"
        }
        executionLogs.push({
          step: stepIndex,
          char: charRead,
          statesStr: stStr,
          status: evalStatus
        })
      }
    } else {
      activeNfaStates = moveNFA(activeNfaStates, charRead)
      stepIndex = stepIndex + 1

      let stStr = statesToString(activeNfaStates)
      let isDone = stepIndex == currentTestStr.length
      if (isDone) {
        evalStatus = activeNfaStates.includes(nfaAcceptId) ? "ACCEPTED" : "REJECTED"
      } else if (activeNfaStates.length == 0) {
        evalStatus = "REJECTED"
      }

      executionLogs.push({
        step: stepIndex,
        char: charRead,
        statesStr: stStr,
        status: evalStatus
      })
    }
  }
}

function startAutoPlay() {
  stopAutoPlay()
  isAutoPlaying = true
  playTimerId = setInterval(fn() {
    if (evalStatus == "RUNNING") {
      stepEvaluator()
      updateHUD()
      drawAutomataCanvas()
    } else {
      stopAutoPlay()
    }
  }, playSpeedMs)
}

function stopAutoPlay() {
  if (playTimerId != 0) {
    clearInterval(playTimerId)
    playTimerId = 0
  }
  isAutoPlaying = false
}

function updateHUD() {
  let elStates = getElementById("hud-states")
  let elTrans = getElementById("hud-transitions")
  let elActive = getElementById("hud-active-states")
  let elStatus = getElementById("hud-match-status")
  let elChar = getElementById("hud-step-char")

  let nStates = isDfaMode ? dfaStates.length : nfaStatesCount
  let nTrans = isDfaMode ? dfaTransitions.length : nfaTransitions.length
  let activeStr = isDfaMode ? concat("q", to_string(activeDfaId)) : statesToString(activeNfaStates)

  if (elStates) elStates.innerText = to_string(nStates)
  if (elTrans) elTrans.innerText = to_string(nTrans)
  if (elActive) elActive.innerText = activeStr

  if (elStatus) {
    let msg = evalStatus == "ACCEPTED" ? "✅ ACCEPTED" : (evalStatus == "REJECTED" ? "❌ REJECTED" : "🔍 MATCHING...")
    let cls = evalStatus == "ACCEPTED" ? "text-sm font-bold text-emerald-400" : (evalStatus == "REJECTED" ? "text-sm font-bold text-rose-400" : "text-sm font-bold text-amber-400")
    elStatus.innerText = msg
    elStatus.className = cls
  }

  if (elChar) {
    if (stepIndex > 0 && stepIndex <= currentTestStr.length) {
      elChar.innerText = concat("Read '", concat(currentTestStr.charAt(stepIndex - 1), "'"))
    } else {
      elChar.innerText = "Start Position"
    }
  }
}

function getNodePositions(): NodePos[] {
  let mut nodes: NodePos[] = []
  if (isDfaMode) {
    let total = dfaStates.length
    for (let mut i = 0; i < total; i = i + 1) {
      let ds = dfaStates[i]
      let angle = (i * 6.28318) / Math.max(1, total)
      let radiusX = Math.min(320, 140 + total * 25)
      let radiusY = Math.min(160, 100 + total * 15)
      let nx = CANVAS_W / 2 + Math.cos(angle) * radiusX
      let ny = CANVAS_H / 2 + Math.sin(angle) * radiusY
      nodes.push({
        id: ds.id,
        x: nx,
        y: ny,
        label: concat("q", to_string(ds.id)),
        isAccept: ds.isAccept,
        isStart: ds.id == 0
      })
    }
  } else {
    let total = nfaStatesCount
    let cols = Math.min(6, Math.ceil(Math.sqrt(total * 1.5)))
    let rows = Math.ceil(total / Math.max(1, cols))
    let spacingX = (CANVAS_W - 160) / Math.max(1, cols)
    let spacingY = (CANVAS_H - 120) / Math.max(1, rows)

    for (let mut i = 0; i < total; i = i + 1) {
      let r = Math.floor(i / cols)
      let c = i % cols
      let nx = 90 + c * spacingX + (r % 2 == 1 ? spacingX * 0.3 : 0)
      let ny = 70 + r * spacingY
      nodes.push({
        id: i,
        x: nx,
        y: ny,
        label: concat("S", to_string(i)),
        isAccept: i == nfaAcceptId,
        isStart: i == nfaStartId
      })
    }
  }
  nodes
}

function drawAutomataCanvas() {
  let cvs = getElementById("regex-canvas")
  if (cvs) {
    if (cvs.width != CANVAS_W) {
      cvs.width = CANVAS_W
      cvs.height = CANVAS_H
    }
    let ctx = cvs.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#020617"
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

      let nodes = getNodePositions()
      let transitions = isDfaMode ? dfaTransitions : nfaTransitions

      for (let mut i = 0; i < transitions.length; i = i + 1) {
        let tr = transitions[i]
        let mut nodeFrom = nodes[0]
        let mut nodeTo = nodes[0]
        for (let mut k = 0; k < nodes.length; k = k + 1) {
          if (nodes[k].id == tr.fromId) nodeFrom = nodes[k]
          if (nodes[k].id == tr.toId) nodeTo = nodes[k]
        }

        if (tr.fromId == tr.toId) {
          ctx.strokeStyle = "rgba(148, 163, 184, 0.5)"
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(nodeFrom.x, nodeFrom.y - 28, 16, 0, 6.283)
          ctx.stroke()

          ctx.fillStyle = "#38bdf8"
          ctx.font = "bold 11px monospace"
          ctx.fillText(tr.symbol, nodeFrom.x - 4, nodeFrom.y - 48)
        } else {
          let dx = nodeTo.x - nodeFrom.x
          let dy = nodeTo.y - nodeFrom.y
          let dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > 0.001) {
            let uX = dx / dist
            let uY = dy / dist
            let pX = -uY
            let pY = uX

            let offset = 20.0
            let startX = nodeFrom.x + uX * 24 + pX * 6
            let startY = nodeFrom.y + uY * 24 + pY * 6
            let endX = nodeTo.x - uX * 24 + pX * 6
            let endY = nodeTo.y - uY * 24 + pY * 6

            let ctrlX = (startX + endX) / 2 + pX * offset
            let ctrlY = (startY + endY) / 2 + pY * offset

            ctx.strokeStyle = tr.symbol == "ε" ? "rgba(244, 63, 94, 0.5)" : "rgba(56, 189, 248, 0.6)"
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(startX, startY)
            ctx.lineTo(ctrlX, ctrlY)
            ctx.lineTo(endX, endY)
            ctx.stroke()

            let arrowAngle = Math.atan2(endY - ctrlY, endX - ctrlX)
            ctx.fillStyle = tr.symbol == "ε" ? "#f43f5e" : "#38bdf8"
            ctx.beginPath()
            ctx.moveTo(endX, endY)
            ctx.lineTo(endX - 8 * Math.cos(arrowAngle - 0.5), endY - 8 * Math.sin(arrowAngle - 0.5))
            ctx.lineTo(endX - 8 * Math.cos(arrowAngle + 0.5), endY - 8 * Math.sin(arrowAngle + 0.5))
            ctx.closePath()
            ctx.fill()

            let midX = (startX + endX) / 2 + pX * (offset * 0.7)
            let midY = (startY + endY) / 2 + pY * (offset * 0.7)

            ctx.fillStyle = "#0f172a"
            ctx.beginPath()
            ctx.arc(midX, midY, 10, 0, 6.283)
            ctx.fill()

            ctx.fillStyle = tr.symbol == "ε" ? "#f43f5e" : "#38bdf8"
            ctx.font = "bold 11px monospace"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(tr.symbol, midX, midY)
          }
        }
      }

      for (let mut i = 0; i < nodes.length; i = i + 1) {
        let n = nodes[i]
        let isActive = isDfaMode ? activeDfaId == n.id : activeNfaStates.includes(n.id)

        if (n.isStart) {
          ctx.strokeStyle = "#a855f7"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(n.x - 45, n.y)
          ctx.lineTo(n.x - 26, n.y)
          ctx.stroke()

          ctx.fillStyle = "#a855f7"
          ctx.beginPath()
          ctx.moveTo(n.x - 26, n.y)
          ctx.lineTo(n.x - 33, n.y - 5)
          ctx.lineTo(n.x - 33, n.y + 5)
          ctx.closePath()
          ctx.fill()
        }

        ctx.fillStyle = isActive ? "#0284c7" : "#0f172a"
        ctx.strokeStyle = isActive ? "#38bdf8" : (n.isAccept ? "#10b981" : "#475569")
        ctx.lineWidth = isActive ? 3 : 2

        if (isActive) {
          ctx.shadowColor = "#38bdf8"
          ctx.shadowBlur = 16
        }

        ctx.beginPath()
        ctx.arc(n.x, n.y, 22, 0, 6.283)
        ctx.fill()
        ctx.stroke()
        ctx.shadowBlur = 0

        if (n.isAccept) {
          ctx.strokeStyle = isActive ? "#ffffff" : "#10b981"
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(n.x, n.y, 17, 0, 6.283)
          ctx.stroke()
        }

        ctx.fillStyle = isActive ? "#ffffff" : "#e2e8f0"
        ctx.font = "bold 12px monospace"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(n.label, n.x, n.y)
      }
    }
  }
}

function renderUI() {
  let vnode = h("div", { className: "min-h-screen bg-slate-950 text-slate-100 p-4 font-sans space-y-4 max-w-7xl mx-auto" }, [
    h("div", { className: "flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl" }, [
      h("div", { className: "flex items-center space-x-3" }, [
        h("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-cyan-500/20" }, "⚡"),
        h("div", {}, [
          h("h1", { className: "text-lg font-black tracking-tight text-white flex items-center gap-2 uppercase italic" }, [
            "TypeLang Regex & Automata Visualizer",
            h("span", { className: "text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold not-italic" }, "Thompson NFA + Powerset DFA")
          ]),
          h("p", { className: "text-xs text-slate-400" }, "Regex Parsing, Infix-to-Postfix Shunting-Yard, NFA Automata & Step-by-Step State Machine Evaluator")
        ])
      ]),

      h("div", { className: "flex flex-wrap items-center gap-2" }, [
        h("span", { className: "text-slate-400 font-mono text-xs font-bold mr-1" }, "Presets:"),
        h("button", {
          className: "px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs font-bold border border-slate-700 cursor-pointer",
          onClick: fn() { currentRegex = "(a|b)*abb"; currentTestStr = "aabb"; initEvaluator(); renderUI() }
        }, "(a|b)*abb"),
        h("button", {
          className: "px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 font-mono text-xs font-bold border border-slate-700 cursor-pointer",
          onClick: fn() { currentRegex = "a(b|c)+d?"; currentTestStr = "abccd"; initEvaluator(); renderUI() }
        }, "a(b|c)+d?"),
        h("button", {
          className: "px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-xs font-bold border border-slate-700 cursor-pointer",
          onClick: fn() { currentRegex = "1(0|1)*1"; currentTestStr = "1011"; initEvaluator(); renderUI() }
        }, "1(0|1)*1"),
        h("button", {
          className: "px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono text-xs font-bold border border-slate-700 cursor-pointer",
          onClick: fn() { currentRegex = "go*d"; currentTestStr = "good"; initEvaluator(); renderUI() }
        }, "go*d")
      ])
    ]),

    h("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs" }, [
      h("div", { className: "p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2" }, [
        h("div", { className: "text-[10px] uppercase font-bold text-slate-400" }, "Regex Pattern"),
        h("input", {
          type: "text",
          value: currentRegex,
          className: "w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-cyan-400 font-bold focus:outline-none focus:border-cyan-500",
          onInput: fn(e: any) { currentRegex = e.target.value; initEvaluator(); renderUI() }
        }, "")
      ]),

      h("div", { className: "p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2" }, [
        h("div", { className: "text-[10px] uppercase font-bold text-slate-400" }, "Test Input String"),
        h("input", {
          type: "text",
          value: currentTestStr,
          className: "w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500",
          onInput: fn(e: any) { currentTestStr = e.target.value; initEvaluator(); renderUI() }
        }, "")
      ]),

      h("div", { className: "p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2" }, [
        h("div", { className: "text-[10px] uppercase font-bold text-slate-400" }, "Automata Graph Mode"),
        h("div", { className: "flex gap-1.5" }, [
          h("button", {
            className: !isDfaMode ? "flex-1 py-1.5 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer" : "flex-1 py-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer",
            onClick: fn() { isDfaMode = false; initEvaluator(); renderUI() }
          }, "NFA (Thompson)"),
          h("button", {
            className: isDfaMode ? "flex-1 py-1.5 rounded-lg bg-indigo-600 text-white font-bold cursor-pointer" : "flex-1 py-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer",
            onClick: fn() { isDfaMode = true; initEvaluator(); renderUI() }
          }, "DFA (Powerset)")
        ])
      ])
    ]),

    h("div", { className: "relative bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-2xl space-y-3" }, [
      h("div", { className: "flex flex-wrap justify-between items-center text-xs font-mono border-b border-slate-800/80 pb-3 gap-2" }, [
        h("div", { className: "flex items-center space-x-2" }, [
          h("button", {
            className: isAutoPlaying ? "px-3 py-1.5 rounded-xl bg-amber-600/30 text-amber-400 border border-amber-500/40 font-bold cursor-pointer" : "px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-lg shadow-indigo-900/30",
            onClick: fn() { if (isAutoPlaying) stopAutoPlay() else startAutoPlay(); renderUI() }
          }, isAutoPlaying ? "⏸ Pause" : "▶ Auto Step"),
          h("button", {
            className: "px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold cursor-pointer shadow-lg shadow-cyan-900/30",
            onClick: fn() { stopAutoPlay(); stepEvaluator(); updateHUD(); drawAutomataCanvas(); renderUI() }
          }, "⏭ Step Forward"),
          h("button", {
            className: "px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 cursor-pointer",
            onClick: fn() { initEvaluator(); renderUI() }
          }, "⏮ Reset")
        ]),

        h("div", { className: "flex items-center space-x-2" }, [
          h("span", { className: "text-slate-400" }, "Tape:"),
          h("div", { className: "flex gap-1" }, [
            h("span", { className: stepIndex == 0 ? "px-2 py-1 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40" : "px-2 py-1 rounded bg-slate-950 text-slate-500" }, "^")
          ])
        ])
      ]),

      h("div", { className: "flex justify-center overflow-x-auto p-1" }, [
        h("canvas", {
          id: "regex-canvas",
          width: "870",
          height: "460",
          className: "rounded-xl bg-slate-950 border border-slate-800 shadow-inner"
        }, "")
      ])
    ]),

    h("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs" }, [
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "Total States"),
        h("div", { id: "hud-states", className: "text-lg font-bold text-indigo-400" }, to_string(isDfaMode ? dfaStates.length : nfaStatesCount))
      ]),
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "Total Transitions"),
        h("div", { id: "hud-transitions", className: "text-lg font-bold text-cyan-400" }, to_string(isDfaMode ? dfaTransitions.length : nfaTransitions.length))
      ]),
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "Active State(s)"),
        h("div", { id: "hud-active-states", className: "text-lg font-bold text-emerald-400" }, isDfaMode ? concat("q", to_string(activeDfaId)) : statesToString(activeNfaStates))
      ]),
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "Evaluation Status"),
        h("div", {
          id: "hud-match-status",
          className: evalStatus == "ACCEPTED" ? "text-sm font-bold text-emerald-400" : (evalStatus == "REJECTED" ? "text-sm font-bold text-rose-400" : "text-sm font-bold text-amber-400")
        }, evalStatus == "ACCEPTED" ? "✅ ACCEPTED" : (evalStatus == "REJECTED" ? "❌ REJECTED" : "🔍 MATCHING..."))
      ])
    ])
  ])

  mount("app-root", vnode)
  drawAutomataCanvas()
}

initEvaluator()
renderUI()

println("TypeLang Regex Engine & Automata Visualizer Initialized!")
`
  };
