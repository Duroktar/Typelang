import { ExampleProgram } from "./types";

export const example37Minesweeper: ExampleProgram = {
  id: 'minesweeper_pro',
  name: '37. Interactive Minesweeper (GADT State Machine & AI Solver)',
  category: 'Interactive Web Apps',
  description: 'A complete, feature-packed Minesweeper game engine built with GADTs, pattern-matching state dispatch, recursive flood-fill reveal, deterministic AI hint deduction, retro LED counters, sound synthesis, and Virtual DOM rendering.',
  code: `import DOM.{ h, mount, playRamp, playSequence, confetti }
import Math.{ floor, random, min, max, abs }

// =========================================================================
// 1. Domain Types & GADTs
// =========================================================================

type Difficulty =
  | Easy: Difficulty         // 9x9, 10 mines
  | Medium: Difficulty       // 16x16, 40 mines
  | Hard: Difficulty         // 30x16 (or 24x12 compact), 60 mines

type GameStatus =
  | Ready: GameStatus
  | Playing: GameStatus
  | Won: GameStatus
  | Lost: GameStatus

type ToolMode =
  | Dig: ToolMode
  | Flag: ToolMode
  | Question: ToolMode

type CellState =
  | Hidden: CellState
  | Revealed: CellState
  | Flagged: CellState
  | Marked: CellState

type Action =
  | StartNewGame(diff: Difficulty): Action
  | PrimaryClick(idx: number): Action
  | SecondaryClick(idx: number): Action
  | ChordClick(idx: number): Action
  | ChangeTool(tool: ToolMode): Action
  | TriggerHint: Action
  | AutoSolveStep: Action
  | TickTimer: Action
  | ToggleAudio: Action
  | RestartBoard: Action

// =========================================================================
// 2. Application State & Storage
// =========================================================================

let state = {
  mut rows: 9,
  mut cols: 9,
  mut totalMines: 10,
  mut difficulty: 0, // 0: Easy, 1: Medium, 2: Hard
  mut status: 0,     // 0: Ready, 1: Playing, 2: Won, 3: Lost
  mut tool: 0,       // 0: Dig, 1: Flag, 2: Question
  mut flagsPlaced: 0,
  mut revealedCount: 0,
  mut timer: 0,
  mut timerId: 0,
  mut firstClickDone: false,
  mut audioEnabled: true,
  mut hintIndex: -1,
  mut hintMessage: "Click any cell to begin!",
  mut lastExplodedIndex: -1,
  mut bestTimeEasy: 999,
  mut bestTimeMedium: 999,
  mut bestTimeHard: 999,
  mut gamesPlayed: 0,
  mut gamesWon: 0,
  // Board Arrays (flat 1D arrays of size rows * cols)
  mut isMine: [],       // boolean[]
  mut cellState: [],    // number[] (0: Hidden, 1: Revealed, 2: Flagged, 3: Marked)
  mut adjCount: []      // number[] (0..8)
}

// =========================================================================
// 3. Audio Synthesizer (Web Audio API via DOM Library)
// =========================================================================

function playSound(soundType: string) {
  if (!state.audioEnabled) {
    return
  }
  
  if (soundType == "click") {
    let _ = playRamp(440.0, 880.0, 0.04, "sine", 0.08)
  }
  if (soundType == "flag") {
    let _ = playRamp(587.33, 880.0, 0.12, "triangle", 0.1)
  }
  if (soundType == "unflag") {
    let _ = playRamp(659.25, 440.0, 0.1, "triangle", 0.08)
  }
  if (soundType == "explode") {
    let _ = playRamp(150.0, 30.0, 0.35, "sawtooth", 0.25)
  }
  if (soundType == "win") {
    let _ = playSequence([523.25, 659.25, 783.99, 1046.5], 0.09, "sine", 0.12)
  }
  if (soundType == "chord") {
    let _ = playRamp(330.0, 660.0, 0.06, "sine", 0.1)
  }
}

// =========================================================================
// 4. Board Generation & Coordinates
// =========================================================================

function getIndex(r: number, c: number): number {
  r * state.cols + c
}

function getRow(idx: number): number {
  Math.floor(idx / state.cols)
}

function getCol(idx: number): number {
  idx % state.cols
}

function isValidCoord(r: number, c: number): boolean {
  r >= 0 && r < state.rows && c >= 0 && c < state.cols
}

function getNeighbors(idx: number): number[] {
  let r = getRow(idx)
  let c = getCol(idx)
  let mut list = []
  
  for (let mut dr = -1; dr <= 1; dr = dr + 1) {
    for (let mut dc = -1; dc <= 1; dc = dc + 1) {
      if (dr != 0 || dc != 0) {
        let nr = r + dr
        let nc = c + dc
        if (isValidCoord(nr, nc)) {
          list.push(getIndex(nr, nc))
        }
      }
    }
  }
  list
}

function recalculateAdjacency() {
  let totalCells = state.rows * state.cols
  for (let mut i = 0; i < totalCells; i = i + 1) {
    if (state.isMine[i]) {
      state.adjCount[i] = 9
    } else {
      let nbrs = getNeighbors(i)
      let mut count = 0
      for (let mut k = 0; k < Array.len(nbrs); k = k + 1) {
        let nIdx = nbrs[k]
        if (state.isMine[nIdx]) {
          count = count + 1
        }
      }
      state.adjCount[i] = count
    }
  }
}

// Plant mines ensuring safe first-click neighborhood
function plantMines(safeIdx: number) {
  let totalCells = state.rows * state.cols
  let safeNeighbors = getNeighbors(safeIdx)
  
  // Clear all mines
  for (let mut i = 0; i < totalCells; i = i + 1) {
    state.isMine[i] = false
  }

  let mut planted = 0
  let mut attempts = 0
  let maxAttempts = totalCells * 10

  while (planted < state.totalMines && attempts < maxAttempts) {
    attempts = attempts + 1
    let randIdx = Math.floor(Math.random() * totalCells)
    
    // Check if randIdx is safe zone (clicked cell or immediate neighbor)
    let mut inSafeZone = (randIdx == safeIdx)
    if (!inSafeZone) {
      for (let mut k = 0; k < Array.len(safeNeighbors); k = k + 1) {
        if (safeNeighbors[k] == randIdx) {
          inSafeZone = true
        }
      }
    }

    if (!inSafeZone && !state.isMine[randIdx]) {
      state.isMine[randIdx] = true
      planted = planted + 1
    }
  }

  // Fallback if tight grid
  if (planted < state.totalMines) {
    for (let mut i = 0; i < totalCells; i = i + 1) {
      if (planted >= state.totalMines) { break }
      if (i != safeIdx && !state.isMine[i]) {
        state.isMine[i] = true
        planted = planted + 1
      }
    }
  }

  recalculateAdjacency()
}

// =========================================================================
// 5. Game Actions & Business Logic
// =========================================================================

function resetGame(diffLevel: number) {
  state.difficulty = diffLevel
  if (diffLevel == 0) {
    state.rows = 9
    state.cols = 9
    state.totalMines = 10
  } else if (diffLevel == 1) {
    state.rows = 16
    state.cols = 16
    state.totalMines = 40
  } else {
    state.rows = 16
    state.cols = 24
    state.totalMines = 65
  }

  let totalCells = state.rows * state.cols
  state.isMine = []
  state.cellState = []
  state.adjCount = []
  
  for (let mut i = 0; i < totalCells; i = i + 1) {
    state.isMine.push(false)
    state.cellState.push(0) // 0: Hidden
    state.adjCount.push(0)
  }

  state.status = 0 // 0: Ready
  state.flagsPlaced = 0
  state.revealedCount = 0
  state.timer = 0
  state.firstClickDone = false
  state.hintIndex = -1
  state.hintMessage = "Click anywhere on the grid to reveal a cell!"
  state.lastExplodedIndex = -1
}

function checkWinCondition(): boolean {
  let totalCells = state.rows * state.cols
  let safeCellsTotal = totalCells - state.totalMines
  if (state.revealedCount >= safeCellsTotal) {
    state.status = 2 // 2: Won
    state.gamesWon = state.gamesWon + 1
    state.hintMessage = "🎉 VICTORY! All mines cleared successfully!"
    playSound("win")

    // Update high scores
    if (state.difficulty == 0 && state.timer < state.bestTimeEasy) {
      state.bestTimeEasy = state.timer
    } else if (state.difficulty == 1 && state.timer < state.bestTimeMedium) {
      state.bestTimeMedium = state.timer
    } else if (state.difficulty == 2 && state.timer < state.bestTimeHard) {
      state.bestTimeHard = state.timer
    }

    // Auto flag remaining mines
    for (let mut i = 0; i < totalCells; i = i + 1) {
      if (state.isMine[i]) {
        state.cellState[i] = 2 // Flagged
      }
    }
    state.flagsPlaced = state.totalMines

    // Confetti celebration
    let _ = confetti(80.0, 70.0, 0.6)
    return true
  }
  false
}

function revealCellRecursive(startIdx: number) {
  let totalCells = state.rows * state.cols
  let mut queue = [startIdx]
  let mut queueHead = 0

  while (queueHead < Array.len(queue)) {
    let curr = queue[queueHead]
    queueHead = queueHead + 1

    if (curr >= 0 && curr < totalCells) {
      let cState = state.cellState[curr]
      if (cState == 0 || cState == 3) { // Hidden or Marked
        state.cellState[curr] = 1 // Revealed
        state.revealedCount = state.revealedCount + 1

        // If zero adjacent mines, cascade reveal to all unrevealed neighbors
        if (state.adjCount[curr] == 0 && !state.isMine[curr]) {
          let nbrs = getNeighbors(curr)
          for (let mut k = 0; k < Array.len(nbrs); k = k + 1) {
            let nIdx = nbrs[k]
            let nState = state.cellState[nIdx]
            if ((nState == 0 || nState == 3) && !state.isMine[nIdx]) {
              // Add to queue if not already queued
              let mut alreadyQueued = false
              for (let mut q = queueHead; q < Array.len(queue); q = q + 1) {
                if (queue[q] == nIdx) {
                  alreadyQueued = true
                  break
                }
              }
              if (!alreadyQueued) {
                queue.push(nIdx)
              }
            }
          }
        }
      }
    }
  }
}

function triggerGameOver(explodedIdx: number) {
  state.status = 3 // 3: Lost
  state.lastExplodedIndex = explodedIdx
  state.hintMessage = "💥 BOOM! You triggered a hidden landmine."
  playSound("explode")

  let totalCells = state.rows * state.cols
  for (let mut i = 0; i < totalCells; i = i + 1) {
    if (state.isMine[i] && state.cellState[i] != 2) {
      state.cellState[i] = 1 // Reveal unflagged mines
    }
  }
}

function handleReveal(idx: number) {
  if (state.status == 2 || state.status == 3) { return }
  
  // First Click Safety Guarantee
  if (!state.firstClickDone) {
    plantMines(idx)
    state.firstClickDone = true
    state.status = 1 // 1: Playing
    state.gamesPlayed = state.gamesPlayed + 1
  }

  let cState = state.cellState[idx]
  if (cState == 2) { // Cannot reveal flagged cell
    return
  }

  if (state.isMine[idx]) {
    triggerGameOver(idx)
    return
  }

  playSound("click")
  revealCellRecursive(idx)
  let _ = checkWinCondition()
}

function handleToggleFlag(idx: number) {
  if (state.status == 2 || state.status == 3) { return }
  let cState = state.cellState[idx]

  if (cState == 0) { // Hidden -> Flagged
    state.cellState[idx] = 2
    state.flagsPlaced = state.flagsPlaced + 1
    playSound("flag")
  } else if (cState == 2) { // Flagged -> Question/Marked
    state.cellState[idx] = 3
    state.flagsPlaced = state.flagsPlaced - 1
    playSound("unflag")
  } else if (cState == 3) { // Question -> Hidden
    state.cellState[idx] = 0
    playSound("unflag")
  }
}

// Chord Click: quick sweep when flags match neighbor mine count
function handleChord(idx: number) {
  if (state.status != 1) { return }
  if (state.cellState[idx] != 1) { return } // Must be revealed
  let reqCount = state.adjCount[idx]
  if (reqCount <= 0 || reqCount > 8) { return }

  let nbrs = getNeighbors(idx)
  let mut flagCount = 0
  for (let mut i = 0; i < Array.len(nbrs); i = i + 1) {
    if (state.cellState[nbrs[i]] == 2) {
      flagCount = flagCount + 1
    }
  }

  // If flagged neighbors equal the number, reveal all remaining hidden neighbors
  if (flagCount == reqCount) {
    let mut exploded = false
    let mut explodedIdx = -1

    for (let mut i = 0; i < Array.len(nbrs); i = i + 1) {
      let nIdx = nbrs[i]
      let nState = state.cellState[nIdx]
      if (nState == 0 || nState == 3) { // Hidden or Question
        if (state.isMine[nIdx]) {
          exploded = true
          explodedIdx = nIdx
        } else {
          revealCellRecursive(nIdx)
        }
      }
    }

    if (exploded) {
      triggerGameOver(explodedIdx)
    } else {
      playSound("chord")
      let _ = checkWinCondition()
    }
  } else {
    state.hintMessage = concat("Chord Sweep requires exactly ", concat(to_string(reqCount), " flags around this cell."))
  }
}

// =========================================================================
// 6. Deterministic AI Solver & Hint Engine
// =========================================================================

function findAiHint(): number {
  let totalCells = state.rows * state.cols
  
  if (!state.firstClickDone) {
    // Recommend center cell for first move
    let centerR = Math.floor(state.rows / 2)
    let centerC = Math.floor(state.cols / 2)
    state.hintIndex = getIndex(centerR, centerC)
    state.hintMessage = "💡 Pro Tip: Opening a central cell maximizes safe cascade chances."
    return state.hintIndex
  }

  // Strategy 1: Safe Neighbor Reduction
  // If (revealed number == flagged neighbors), all other hidden neighbors are 100% SAFE
  for (let mut i = 0; i < totalCells; i = i + 1) {
    if (state.cellState[i] == 1 && state.adjCount[i] > 0 && state.adjCount[i] <= 8) {
      let nbrs = getNeighbors(i)
      let mut flagCount = 0
      let mut unrevealedSafe = []
      
      for (let mut k = 0; k < Array.len(nbrs); k = k + 1) {
        let nIdx = nbrs[k]
        let st = state.cellState[nIdx]
        if (st == 2) {
          flagCount = flagCount + 1
        } else if (st == 0 || st == 3) {
          unrevealedSafe.push(nIdx)
        }
      }

      if (flagCount == state.adjCount[i] && Array.len(unrevealedSafe) > 0) {
        let target = unrevealedSafe[0]
        state.hintIndex = target
        let r = getRow(target) + 1
        let c = getCol(target) + 1
        state.hintMessage = concat("💡 Deduction: Cell (R:", concat(to_string(r), concat(", C:", concat(to_string(c), ") is 100% SAFE to reveal!"))))
        return target
      }
    }
  }

  // Strategy 2: Guaranteed Mine Deduction
  // If (unrevealed hidden neighbors == remaining required mines), all unrevealed are MINES
  for (let mut i = 0; i < totalCells; i = i + 1) {
    if (state.cellState[i] == 1 && state.adjCount[i] > 0 && state.adjCount[i] <= 8) {
      let nbrs = getNeighbors(i)
      let mut flagCount = 0
      let mut unrevealed = []

      for (let mut k = 0; k < Array.len(nbrs); k = k + 1) {
        let nIdx = nbrs[k]
        let st = state.cellState[nIdx]
        if (st == 2) {
          flagCount = flagCount + 1
        } else if (st == 0 || st == 3) {
          unrevealed.push(nIdx)
        }
      }

      let remainingMines = state.adjCount[i] - flagCount
      if (remainingMines > 0 && remainingMines == Array.len(unrevealed)) {
        let target = unrevealed[0]
        state.hintIndex = target
        let r = getRow(target) + 1
        let c = getCol(target) + 1
        state.hintMessage = concat("🚩 Deduction: Cell (R:", concat(to_string(r), concat(", C:", concat(to_string(c), ") is a GUARANTEED MINE! Flag it."))))
        return target
      }
    }
  }

  // Strategy 3: Best probability / Random safe corner
  for (let mut i = 0; i < totalCells; i = i + 1) {
    if (state.cellState[i] == 0) {
      state.hintIndex = i
      state.hintMessage = "🎲 No 100% deterministic move found. Pick any highlighted unrevealed cell."
      return i
    }
  }

  state.hintIndex = -1
  state.hintMessage = "All available safe moves exhausted or board solved!"
  return 0 - 1
}

function executeAiStep() {
  let target = findAiHint()
  if (target >= 0) {
    // If it's a guaranteed mine according to Strategy 2, flag it; else reveal it
    let mut shouldFlag = false
    let r = getRow(target)
    let c = getCol(target)
    let nbrs = getNeighbors(target)
    
    // Check if any neighbor deduced it as a mine
    for (let mut k = 0; k < Array.len(nbrs); k = k + 1) {
      let pIdx = nbrs[k]
      if (state.cellState[pIdx] == 1 && state.adjCount[pIdx] > 0) {
        let pNbrs = getNeighbors(pIdx)
        let mut fCount = 0
        let mut unrevCount = 0
        for (let mut m = 0; m < Array.len(pNbrs); m = m + 1) {
          let s = state.cellState[pNbrs[m]]
          if (s == 2) { fCount = fCount + 1 }
          else if (s == 0 || s == 3) { unrevCount = unrevCount + 1 }
        }
        if (state.adjCount[pIdx] - fCount == unrevCount) {
          shouldFlag = true
          break
        }
      }
    }

    if (shouldFlag && state.cellState[target] == 0) {
      handleToggleFlag(target)
    } else {
      handleReveal(target)
    }
  }
}

// =========================================================================
// 7. Action Dispatcher
// =========================================================================

function dispatch(action: Action) {
  match (action) {
    StartNewGame(diff) => {
      match (diff) {
        Easy => { resetGame(0) }
        Medium => { resetGame(1) }
        Hard => { resetGame(2) }
      }
    }
    PrimaryClick(idx) => {
      state.hintIndex = -1
      if (state.tool == 0) {
        // Dig Mode
        if (state.cellState[idx] == 1) {
          // Clicking an already revealed number attempts chord sweep
          handleChord(idx)
        } else {
          handleReveal(idx)
        }
      } else if (state.tool == 1) {
        // Flag Mode
        handleToggleFlag(idx)
      } else {
        // Question Mode
        handleToggleFlag(idx)
      }
    }
    SecondaryClick(idx) => {
      state.hintIndex = -1
      handleToggleFlag(idx)
    }
    ChordClick(idx) => {
      state.hintIndex = -1
      handleChord(idx)
    }
    ChangeTool(tool) => {
      match (tool) {
        Dig => { state.tool = 0 }
        Flag => { state.tool = 1 }
        Question => { state.tool = 2 }
      }
    }
    TriggerHint => {
      let _ = findAiHint()
    }
    AutoSolveStep => {
      executeAiStep()
    }
    TickTimer => {
      if (state.status == 1 && state.timer < 999) {
        state.timer = state.timer + 1
      }
    }
    ToggleAudio => {
      state.audioEnabled = !state.audioEnabled
    }
    RestartBoard => {
      resetGame(state.difficulty)
    }
  }
  
  renderUI()
}

// =========================================================================
// 8. Virtual DOM UI Rendering
// =========================================================================

function getNumberColor(count: number): string {
  if (count == 1) { "text-blue-500 font-bold" }
  else if (count == 2) { "text-emerald-500 font-bold" }
  else if (count == 3) { "text-rose-500 font-bold" }
  else if (count == 4) { "text-indigo-600 font-extrabold" }
  else if (count == 5) { "text-amber-600 font-extrabold" }
  else if (count == 6) { "text-teal-500 font-extrabold" }
  else if (count == 7) { "text-violet-500 font-black" }
  else if (count == 8) { "text-slate-400 font-black" }
  else { "text-slate-600" }
}

function getFaceEmoji(): string {
  if (state.status == 0) { "🙂" }
  else if (state.status == 1) { "🙂" }
  else if (state.status == 2) { "😎" }
  else { "😵" }
}

function formatLed(num: number): string {
  let mut s = to_string(num)
  if (num < 0) {
    if (num > -10) { concat("-0", to_string(abs(num))) }
    else { s }
  } else if (num < 10) {
    concat("00", s)
  } else if (num < 100) {
    concat("0", s)
  } else {
    s
  }
}

function renderCell(idx: number) {
  let cState = state.cellState[idx]
  let isM = state.isMine[idx]
  let adj = state.adjCount[idx]
  let isHint = (state.hintIndex == idx)
  let isLastExploded = (state.lastExplodedIndex == idx)

  let mut cellContent = ""
  let mut cellClass = "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center text-xs sm:text-sm md:text-base font-mono font-bold select-none cursor-pointer rounded transition-all duration-75 relative "

  if (cState == 0) {
    // Hidden
    let bg = isHint
      ? "bg-amber-400/30 border-2 border-amber-400 hover:bg-amber-400/40 shadow-inner ring-2 ring-amber-400/50 animate-pulse"
      : "bg-slate-700 hover:bg-slate-600 border-t border-l border-slate-500 border-b-2 border-r-2 border-slate-900 shadow-sm active:border active:border-slate-800"
    cellClass = concat(cellClass, bg)
    if (isHint) {
      cellContent = "💡"
    }
  } else if (cState == 2) {
    // Flagged
    cellClass = concat(cellClass, "bg-slate-700 border-t border-l border-slate-500 border-b-2 border-r-2 border-slate-900 text-rose-400 hover:bg-slate-600 shadow-sm")
    cellContent = "🚩"
  } else if (cState == 3) {
    // Question / Marked
    cellClass = concat(cellClass, "bg-slate-700 border-t border-l border-slate-500 border-b-2 border-r-2 border-slate-900 text-cyan-400 hover:bg-slate-600 shadow-sm")
    cellContent = "❓"
  } else {
    // Revealed
    if (isM) {
      if (isLastExploded) {
        cellClass = concat(cellClass, "bg-rose-600 text-white border border-rose-800 animate-bounce shadow-lg")
        cellContent = "💥"
      } else {
        cellClass = concat(cellClass, "bg-slate-800 border border-slate-900 text-slate-300")
        cellContent = "💣"
      }
    } else {
      cellClass = concat(cellClass, "bg-slate-900/90 border border-slate-800/80 shadow-inner ")
      if (adj > 0) {
        cellClass = concat(cellClass, getNumberColor(adj))
        cellContent = to_string(adj)
      } else {
        cellContent = ""
      }
    }
  }

  let captureIdx = idx
  h("div", {
    className: cellClass,
    onClick: fn() { dispatch(PrimaryClick(captureIdx)) },
    onContextMenu: fn(e) {
      dispatch(SecondaryClick(captureIdx))
    }
  }, cellContent)
}

function renderBoard() {
  let mut cellElements = []
  let totalCells = state.rows * state.cols
  for (let mut i = 0; i < totalCells; i = i + 1) {
    cellElements.push(renderCell(i))
  }

  let gridColsClass = state.cols == 9
    ? "grid-cols-9"
    : state.cols == 16
      ? "grid-cols-16"
      : "grid-cols-24"

  let gridStyleClass = concat("grid gap-1 p-2 sm:p-3 bg-slate-950/80 rounded-xl border border-slate-800 shadow-2xl justify-center items-center overflow-x-auto ", gridColsClass)

  h("div", { className: "w-full flex justify-center py-2 sm:py-4 overflow-x-auto" }, [
    h("div", { className: gridStyleClass }, cellElements)
  ])
}

function renderHeader() {
  let remainingMines = state.totalMines - state.flagsPlaced
  let minesText = formatLed(remainingMines)
  let timerText = formatLed(state.timer)

  h("div", { className: "bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 shadow-xl flex items-center justify-between" }, [
    // LED: Remaining Mines
    h("div", { className: "flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800" }, [
      h("span", { className: "text-xs uppercase tracking-wider text-rose-400 font-semibold hidden sm:inline" }, "Mines"),
      h("span", { className: "font-mono text-xl sm:text-2xl font-black text-rose-500 tracking-widest drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" }, minesText)
    ]),

    // Face Button (Smiley Status)
    h("button", {
      className: "w-11 h-11 sm:w-12 sm:h-12 bg-slate-800 hover:bg-slate-700 active:scale-95 border-2 border-slate-700 hover:border-amber-400/50 rounded-xl text-2xl flex items-center justify-center shadow-lg transition-all cursor-pointer",
      onClick: fn() { dispatch(RestartBoard) }
    }, getFaceEmoji()),

    // LED: Timer
    h("div", { className: "flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800" }, [
      h("span", { className: "text-xs uppercase tracking-wider text-emerald-400 font-semibold hidden sm:inline" }, "Time"),
      h("span", { className: "font-mono text-xl sm:text-2xl font-black text-emerald-400 tracking-widest drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" }, timerText)
    ])
  ])
}

function renderControls() {
  let digActive = state.tool == 0 ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]" : "bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800"
  let flagActive = state.tool == 1 ? "bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]" : "bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800"
  let qActive = state.tool == 2 ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]" : "bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800"

  let easyActive = state.difficulty == 0 ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
  let medActive = state.difficulty == 1 ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
  let hardActive = state.difficulty == 2 ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:bg-slate-700"

  h("div", { className: "flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs sm:text-sm" }, [
    // Difficulty Selector
    h("div", { className: "flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800" }, [
      h("button", { className: concat("px-3 py-1.5 rounded-md cursor-pointer transition-colors ", easyActive), onClick: fn() { dispatch(StartNewGame(Easy)) } }, "Beginner (9x9)"),
      h("button", { className: concat("px-3 py-1.5 rounded-md cursor-pointer transition-colors ", medActive), onClick: fn() { dispatch(StartNewGame(Medium)) } }, "Medium (16x16)"),
      h("button", { className: concat("px-3 py-1.5 rounded-md cursor-pointer transition-colors ", hardActive), onClick: fn() { dispatch(StartNewGame(Hard)) } }, "Expert (24x16)")
    ]),

    // Action Tools (Mobile friendly click toggle)
    h("div", { className: "flex items-center space-x-2" }, [
      h("button", {
        className: concat("px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95 ", digActive),
        onClick: fn() { dispatch(ChangeTool(Dig)) }
      }, [
        h("span", {}, "⛏️"),
        h("span", { className: "font-semibold" }, "Dig")
      ]),
      h("button", {
        className: concat("px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95 ", flagActive),
        onClick: fn() { dispatch(ChangeTool(Flag)) }
      }, [
        h("span", {}, "🚩"),
        h("span", { className: "font-semibold" }, "Flag")
      ]),
      h("button", {
        className: concat("px-3 py-1.5 rounded-lg border flex items-center space-x-1.5 cursor-pointer transition-all active:scale-95 ", qActive),
        onClick: fn() { dispatch(ChangeTool(Question)) }
      }, [
        h("span", {}, "❓"),
        h("span", { className: "font-semibold" }, "Mark")
      ])
    ]),

    // AI Solver & Audio Toggles
    h("div", { className: "flex items-center space-x-2" }, [
      h("button", {
        className: "px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 font-semibold rounded-lg shadow cursor-pointer transition-all flex items-center space-x-1 active:scale-95",
        onClick: fn() { dispatch(TriggerHint) }
      }, [
        h("span", {}, "💡"),
        h("span", {}, "AI Hint")
      ]),
      h("button", {
        className: "px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 font-semibold rounded-lg shadow cursor-pointer transition-all flex items-center space-x-1 active:scale-95",
        onClick: fn() { dispatch(AutoSolveStep) }
      }, [
        h("span", {}, "⚡"),
        h("span", {}, "AI Step")
      ]),
      h("button", {
        className: "px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg cursor-pointer transition-colors",
        onClick: fn() { dispatch(ToggleAudio) }
      }, state.audioEnabled ? "🔊" : "🔇")
    ])
  ])
}

function renderHud() {
  let bestTime = state.difficulty == 0
    ? (state.bestTimeEasy == 999 ? "--" : concat(to_string(state.bestTimeEasy), "s"))
    : state.difficulty == 1
      ? (state.bestTimeMedium == 999 ? "--" : concat(to_string(state.bestTimeMedium), "s"))
      : (state.bestTimeHard == 999 ? "--" : concat(to_string(state.bestTimeHard), "s"))

  let winPct = state.gamesPlayed == 0
    ? "0%"
    : concat(to_string(Math.floor((state.gamesWon / state.gamesPlayed) * 100)), "%")

  h("div", { className: "flex flex-wrap items-center justify-between text-xs text-slate-400 bg-slate-950/60 px-4 py-2.5 rounded-lg border border-slate-800/80 gap-2" }, [
    h("div", { className: "flex items-center space-x-4" }, [
      h("div", {}, [
        h("span", { className: "text-slate-500 uppercase tracking-wider mr-1" }, "Played:"),
        h("span", { className: "font-mono font-bold text-slate-200" }, to_string(state.gamesPlayed))
      ]),
      h("div", {}, [
        h("span", { className: "text-slate-500 uppercase tracking-wider mr-1" }, "Won:"),
        h("span", { className: "font-mono font-bold text-emerald-400" }, to_string(state.gamesWon))
      ]),
      h("div", {}, [
        h("span", { className: "text-slate-500 uppercase tracking-wider mr-1" }, "Win Rate:"),
        h("span", { className: "font-mono font-bold text-cyan-400" }, winPct)
      ]),
      h("div", {}, [
        h("span", { className: "text-slate-500 uppercase tracking-wider mr-1" }, "Best Time:"),
        h("span", { className: "font-mono font-bold text-amber-400" }, bestTime)
      ])
    ]),
    h("div", { className: "font-mono text-amber-300/90 text-xs italic" }, state.hintMessage)
  ])
}

function renderUI() {
  let vnode = h("div", { className: "w-full max-w-4xl mx-auto p-2 sm:p-4 md:p-6 font-sans text-slate-100 min-h-[600px] flex flex-col space-y-3" }, [
    // Top Title Bar
    h("div", { className: "flex items-center justify-between pb-2 border-b border-slate-800" }, [
      h("div", { className: "flex items-center space-x-2" }, [
        h("span", { className: "text-xl sm:text-2xl" }, "💣"),
        h("h1", { className: "text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-amber-400 via-rose-400 to-cyan-400 bg-clip-text text-transparent tracking-wide" }, "MINESWEEPER PRO"),
        h("span", { className: "text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-semibold border border-indigo-500/30" }, "TypeLang GADT")
      ]),
      h("div", { className: "text-xs text-slate-500 font-mono hidden sm:block" }, "Left Click: Dig | Right Click: Flag | Number: Chord")
    ]),

    // Scoreboard & Controls
    renderHeader(),
    renderControls(),

    // Interactive Minefield Grid
    renderBoard(),

    // Statistics & Hint HUD
    renderHud()
  ])

  mount("app-root", vnode)
}

// =========================================================================
// 9. Engine Loop & Startup
// =========================================================================

resetGame(0)
renderUI()

function onMinesweeperTick() {
  dispatch(TickTimer)
}

// Setup live 1-second interval timer for the game
let _ = setInterval(onMinesweeperTick, 1000.0)

println("================================================================")
println("💣 TypeLang Minesweeper Pro Game Engine Initialized!")
println("================================================================")
println("• 3 Difficulty Presets: Beginner (9x9), Medium (16x16), Expert (24x16)")
println("• Safe First-Click neighborhood generation & recursive zero flood-fill")
println("• Real-time Chording, Flagging, Question Marking, & AI Deductive Hint Engine")
println("• Web Audio dynamic synthesis, LED digital scoreboards & Confetti celebration")
println("================================================================")
`
};
