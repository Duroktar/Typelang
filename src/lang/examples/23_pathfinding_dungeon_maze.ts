import { ExampleProgram } from "./types";

export const example23PathfindingDungeonMaze: ExampleProgram = {
    id: 'pathfinding_dungeon_maze',
    name: '23. Pathfinding & Procedural Dungeon Maze Generator',
    category: 'Interactive Web Apps',
    description: 'Procedural dungeon maze generator with A* and Dijkstra pathfinding visualizers powered by custom Priority Queue heaps and GADT tile types.',
    code: `import DOM.{ h, mount, getElementById }

// ============================================================================
// Pathfinding & Procedural Dungeon Maze Generator
// Language Features Showcased:
// 1. Priority queues (Binary Min-Heap data structure with custom ordering)
// 2. Multi-dimensional array & 2D grid matrix operations
// 3. GADT Tile Types (Wall, Floor, Door, Key, Start, Target)
// 4. Recursive pattern matching on GADT tile states & heuristics
// ============================================================================

// ----------------------------------------------------------------------------
// 1. GADT Tile Types & Domain Models
// ----------------------------------------------------------------------------

export type Tile =
  | TileWall
  | TileFloor
  | TileDoor(isLocked: boolean)
  | TileKey(id: number)
  | TileStart
  | TileTarget

export type SearchAlg =
  | AlgAStar
  | AlgDijkstra
  | AlgBFS

export type HeuristicMode =
  | HeuristicManhattan
  | HeuristicEuclidean
  | HeuristicChebyshev

export type BrushTool =
  | ToolWall
  | ToolFloor
  | ToolDoor
  | ToolKey
  | ToolStart
  | ToolTarget

// Recursive Pattern Matching for Tile Attributes
function getTileCost(t: Tile): number {
  match (t) {
    TileWall => 999999.0
    TileFloor => 1.0
    TileDoor(locked) => locked ? 15.0 : 2.0
    TileKey(id) => 1.0
    TileStart => 1.0
    TileTarget => 1.0
  }
}

function getTileColor(t: Tile): string {
  match (t) {
    TileWall => "#1e293b"        // slate-800
    TileFloor => "#0f172a"       // slate-900
    TileDoor(locked) => locked ? "#e11d48" : "#a855f7" // rose-600 / purple-500
    TileKey(id) => "#f59e0b"     // amber-500
    TileStart => "#10b981"       // emerald-500
    TileTarget => "#3b82f6"      // blue-500
  }
}

function getTileName(t: Tile): string {
  match (t) {
    TileWall => "Wall (Obstacle)"
    TileFloor => "Floor (Cost 1)"
    TileDoor(locked) => locked ? "Locked Door (Cost 15)" : "Unlocked Door (Cost 2)"
    TileKey(id) => "Dungeon Key"
    TileStart => "Start Node"
    TileTarget => "Target Goal"
  }
}

// ----------------------------------------------------------------------------
// 2. Grid Dimensions & Matrix Operations
// ----------------------------------------------------------------------------

let GRID_ROWS = 17
let GRID_COLS = 29
let CELL_SIZE = 30

type Point = {
  r: number,
  c: number
}

let mut gridMatrix: [Tile] = []
let mut startPoint: Point = { r: 1, c: 1 }
let mut targetPoint: Point = { r: 15, c: 27 }

function getIndex(r: number, c: number): number {
  r * GRID_COLS + c
}

function inBounds(r: number, c: number): boolean {
  r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS
}

function getTile(r: number, c: number): Tile {
  gridMatrix[getIndex(r, c)]
}

function setTile(r: number, c: number, tile: Tile) {
  gridMatrix[getIndex(r, c)] = tile
}

function initGrid(fillTile: Tile) {
  gridMatrix = []
  let total = GRID_ROWS * GRID_COLS
  for (let mut i = 0; i < total; i = i + 1) {
    gridMatrix.push(fillTile)
  }
}

// ----------------------------------------------------------------------------
// 3. Priority Queue (Binary Min-Heap) Implementation
// ----------------------------------------------------------------------------

type PQNode = {
  r: number,
  c: number,
  priority: number,
  gScore: number
}

function pqParent(i: number): number {
  Math.floor((i - 1) / 2)
}

function pqLeft(i: number): number {
  2 * i + 1
}

function pqRight(i: number): number {
  2 * i + 2
}

function pushPQ(heap: [PQNode], node: PQNode) {
  heap.push(node)
  let mut idx = heap.length - 1
  while (idx > 0) {
    let p = pqParent(idx)
    if (heap[idx].priority < heap[p].priority) {
      let temp = heap[idx]
      heap[idx] = heap[p]
      heap[p] = temp
      idx = p
    } else {
      idx = 0
    }
  }
}

function popPQ(heap: [PQNode]): PQNode {
  if (heap.length == 0) {
    { r: -1, c: -1, priority: 999999.0, gScore: 999999.0 }
  } else if (heap.length == 1) {
    heap.pop()
  } else {
    let top = heap[0]
    let last = heap.pop()
    heap[0] = last
    let mut idx = 0
    let len = heap.length
    let mut active = true
    while (active) {
      let l = pqLeft(idx)
      let r = pqRight(idx)
      let mut smallest = idx
      if (l < len && heap[l].priority < heap[smallest].priority) {
        smallest = l
      }
      if (r < len && heap[r].priority < heap[smallest].priority) {
        smallest = r
      }
      if (smallest != idx) {
        let temp = heap[idx]
        heap[idx] = heap[smallest]
        heap[smallest] = temp
        idx = smallest
      } else {
        active = false
      }
    }
    top
  }
}

// ----------------------------------------------------------------------------
// 4. Heuristics & Distance Calculations
// ----------------------------------------------------------------------------

function computeHeuristic(p1: Point, p2: Point, mode: HeuristicMode): number {
  let dr = Math.abs(p1.r - p2.r)
  let dc = Math.abs(p1.c - p2.c)
  match (mode) {
    HeuristicManhattan => dr + dc
    HeuristicEuclidean => Math.sqrt(dr * dr + dc * dc)
    HeuristicChebyshev => Math.max(dr, dc)
  }
}

// ----------------------------------------------------------------------------
// 5. Procedural Maze & Dungeon Generators
// ----------------------------------------------------------------------------

function generateRecursiveMaze() {
  initGrid(TileWall)

  let mut stack: [Point] = []
  setTile(1, 1, TileFloor)
  stack.push({ r: 1, c: 1 })

  while (stack.length > 0) {
    let curr = stack[stack.length - 1]
    let mut unvisited: [Point] = []

    let dirs = [
      { dr: -2, dc: 0 },
      { dr: 2, dc: 0 },
      { dr: 0, dc: -2 },
      { dr: 0, dc: 2 }
    ]

    for (let mut d = 0; d < dirs.length; d = d + 1) {
      let nr = curr.r + dirs[d].dr
      let nc = curr.c + dirs[d].dc
      if (inBounds(nr, nc)) {
        let t = getTile(nr, nc)
        match (t) {
          TileWall => unvisited.push({ r: nr, c: nc })
          TileFloor => ()
          TileDoor(l) => ()
          TileKey(k) => ()
          TileStart => ()
          TileTarget => ()
        }
      }
    }

    if (unvisited.length > 0) {
      let randIdx = Math.floor(Math.random() * unvisited.length)
      let nextPt = unvisited[randIdx]
      let midR = Math.floor((curr.r + nextPt.r) / 2)
      let midC = Math.floor((curr.c + nextPt.c) / 2)
      setTile(midR, midC, TileFloor)
      setTile(nextPt.r, nextPt.c, TileFloor)
      stack.push(nextPt)
    } else {
      stack.pop()
    }
  }

  // Add random doors and keys
  setTile(3, 3, TileDoor(true))
  setTile(5, 5, TileKey(1))
  setTile(11, 15, TileDoor(true))

  startPoint = { r: 1, c: 1 }
  targetPoint = { r: GRID_ROWS - 2, c: GRID_COLS - 2 }
  setTile(startPoint.r, startPoint.c, TileStart)
  setTile(targetPoint.r, targetPoint.c, TileTarget)
}

function generateProceduralDungeon() {
  initGrid(TileWall)

  // Define 4 Dungeon Chambers
  let rooms = [
    { r: 1, c: 1, h: 5, w: 7 },
    { r: 1, c: 19, h: 5, w: 8 },
    { r: 10, c: 1, h: 6, w: 8 },
    { r: 10, c: 18, h: 6, w: 9 }
  ]

  for (let mut i = 0; i < rooms.length; i = i + 1) {
    let rm = rooms[i]
    for (let mut r = rm.r; r < rm.r + rm.h; r = r + 1) {
      for (let mut c = rm.c; c < rm.c + rm.w; c = c + 1) {
        if (inBounds(r, c)) {
          setTile(r, c, TileFloor)
        }
      }
    }
  }

  // Connect Room 0 -> Room 1
  let mut c0 = 8
  while (c0 <= 19) {
    if (inBounds(3, c0)) {
      setTile(3, c0, TileFloor)
    }
    c0 = c0 + 1
  }
  setTile(3, 13, TileDoor(true))

  // Connect Room 1 -> Room 3
  let mut r1 = 6
  while (r1 <= 10) {
    if (inBounds(r1, 22)) {
      setTile(r1, 22, TileFloor)
    }
    r1 = r1 + 1
  }

  // Connect Room 0 -> Room 2
  let mut r0 = 6
  while (r0 <= 10) {
    if (inBounds(r0, 4)) {
      setTile(r0, 4, TileFloor)
    }
    r0 = r0 + 1
  }
  setTile(8, 4, TileDoor(true))

  // Connect Room 2 -> Room 3
  let mut c2 = 9
  while (c2 <= 18) {
    if (inBounds(12, c2)) {
      setTile(12, c2, TileFloor)
    }
    c2 = c2 + 1
  }

  // Place keys & doors
  setTile(2, 4, TileKey(1))
  setTile(12, 4, TileKey(2))

  startPoint = { r: 3, c: 3 }
  targetPoint = { r: 12, c: 22 }
  setTile(startPoint.r, startPoint.c, TileStart)
  setTile(targetPoint.r, targetPoint.c, TileTarget)
}

function clearGridToFloors() {
  initGrid(TileFloor)
  // Add perimeter walls
  for (let mut r = 0; r < GRID_ROWS; r = r + 1) {
    setTile(r, 0, TileWall)
    setTile(r, GRID_COLS - 1, TileWall)
  }
  for (let mut c = 0; c < GRID_COLS; c = c + 1) {
    setTile(0, c, TileWall)
    setTile(GRID_ROWS - 1, c, TileWall)
  }

  startPoint = { r: 3, c: 3 }
  targetPoint = { r: 13, c: 25 }
  setTile(startPoint.r, startPoint.c, TileStart)
  setTile(targetPoint.r, targetPoint.c, TileTarget)
}

// ----------------------------------------------------------------------------
// 6. Pathfinding Search Engine & State Machine
// ----------------------------------------------------------------------------

let mut activeAlg: SearchAlg = AlgAStar
let mut activeHeuristic: HeuristicMode = HeuristicManhattan
let mut activeBrush: BrushTool = ToolWall

let mut isSearching = false
let mut isSearchComplete = false
let mut isPathFound = false
let mut nodesExploredCount = 0
let mut pathCostCount = 0.0

let mut visitedMatrix: [boolean] = []
let mut openSetMatrix: [boolean] = []
let mut parentMatrix: [number] = []
let mut gScoreMatrix: [number] = []
let mut pathResult: [Point] = []
let mut searchHeap: [PQNode] = []

function resetSearchState() {
  isSearching = false
  isSearchComplete = false
  isPathFound = false
  nodesExploredCount = 0
  pathCostCount = 0.0

  visitedMatrix = []
  openSetMatrix = []
  parentMatrix = []
  gScoreMatrix = []
  pathResult = []
  searchHeap = []

  let total = GRID_ROWS * GRID_COLS
  for (let mut i = 0; i < total; i = i + 1) {
    visitedMatrix.push(false)
    openSetMatrix.push(false)
    parentMatrix.push(-1)
    gScoreMatrix.push(999999.0)
  }
}

function prepareSearch() {
  resetSearchState()

  let startIdx = getIndex(startPoint.r, startPoint.c)
  gScoreMatrix[startIdx] = 0.0
  openSetMatrix[startIdx] = true

  let h0 = (activeAlg == AlgDijkstra || activeAlg == AlgBFS)
    ? 0.0
    : computeHeuristic(startPoint, targetPoint, activeHeuristic)

  pushPQ(searchHeap, {
    r: startPoint.r,
    c: startPoint.c,
    priority: h0,
    gScore: 0.0
  })

  isSearching = true
}

function reconstructPath() {
  pathResult = []
  let mut currIdx = getIndex(targetPoint.r, targetPoint.c)
  let startIdx = getIndex(startPoint.r, startPoint.c)

  let mut totalCost = 0.0
  while (currIdx != -1) {
    let r = Math.floor(currIdx / GRID_COLS)
    let c = currIdx % GRID_COLS
    pathResult.push({ r: r, c: c })
    totalCost = totalCost + getTileCost(getTile(r, c))
    if (currIdx == startIdx) {
      currIdx = -1
    } else {
      currIdx = parentMatrix[currIdx]
    }
  }

  pathCostCount = totalCost
  isPathFound = true
  isSearching = false
  isSearchComplete = true
}

function stepSearch(): boolean {
  if (!isSearching || searchHeap.length == 0) {
    if (isSearching) {
      isSearching = false
      isSearchComplete = true
      isPathFound = false
    }
    false
  } else {
    let curr = popPQ(searchHeap)
    let currIdx = getIndex(curr.r, curr.c)

    if (curr.r == -1) {
      isSearching = false
      isSearchComplete = true
      isPathFound = false
      false
    } else if (visitedMatrix[currIdx]) {
      true
    } else {
      visitedMatrix[currIdx] = true
      nodesExploredCount = nodesExploredCount + 1

      if (curr.r == targetPoint.r && curr.c == targetPoint.c) {
        reconstructPath()
        false
      } else {
        let neighbors = [
          { dr: -1, dc: 0 },
          { dr: 1, dc: 0 },
          { dr: 0, dc: -1 },
          { dr: 0, dc: 1 }
        ]

        for (let mut i = 0; i < neighbors.length; i = i + 1) {
          let nr = curr.r + neighbors[i].dr
          let nc = curr.c + neighbors[i].dc

          if (inBounds(nr, nc)) {
            let nIdx = getIndex(nr, nc)
            if (!visitedMatrix[nIdx]) {
              let tile = getTile(nr, nc)
              let cost = getTileCost(tile)
              if (cost < 999999.0) {
                let stepCost = (activeAlg == AlgBFS) ? 1.0 : cost
                let tentG = curr.gScore + stepCost

                if (tentG < gScoreMatrix[nIdx]) {
                  parentMatrix[nIdx] = currIdx
                  gScoreMatrix[nIdx] = tentG

                  let hVal = (activeAlg == AlgDijkstra || activeAlg == AlgBFS)
                    ? 0.0
                    : computeHeuristic({ r: nr, c: nc }, targetPoint, activeHeuristic)

                  let p = (activeAlg == AlgBFS) ? tentG : (tentG + hVal)

                  pushPQ(searchHeap, {
                    r: nr,
                    c: nc,
                    priority: p,
                    gScore: tentG
                  })
                  openSetMatrix[nIdx] = true
                }
              }
            }
          }
        }
        true
      }
    }
  }
}

function runFullSearch() {
  prepareSearch()
  let mut safety = 0
  let mut keepGoing = true
  while (keepGoing && safety < 5000) {
    keepGoing = stepSearch()
    safety = safety + 1
  }
  updateHUD()
  drawDungeonCanvas()
}

// ----------------------------------------------------------------------------
// 7. Interactive Canvas Drawing & UI Rendering
// ----------------------------------------------------------------------------

let mut animationTimerId = 0
let mut isDraggingNode = false
let mut dragNodeType = "none"

function updateHUD() {
  let sNodes = getElementById("stat-nodes-explored")
  let sPath = getElementById("stat-path-length")
  let sCost = getElementById("stat-path-cost")
  let sStatus = getElementById("stat-search-status")

  if (sNodes) sNodes.innerText = to_string(nodesExploredCount)
  if (sPath) sPath.innerText = to_string(pathResult.length)
  if (sCost) sCost.innerText = to_string(Math.floor(pathCostCount))
  if (sStatus) {
    let msg = isPathFound ? "✅ Path Found" : (isSearchComplete ? "❌ No Path Found" : (isSearching ? "🔍 Searching..." : "⏸ Idle"))
    let cls = isPathFound ? "text-sm font-bold text-emerald-400" : (isSearchComplete ? "text-sm font-bold text-rose-400" : "text-sm font-bold text-amber-400")
    sStatus.innerText = msg
    sStatus.className = cls
  }
}

function drawDungeonCanvas() {
  let cvs = getElementById("dungeon-canvas")
  if (cvs) {
    if (cvs.width != 870) {
      cvs.width = 870
      cvs.height = 510
    }
    let ctx = cvs.getContext("2d")
    if (ctx) {
      let W = cvs.width
      let H = cvs.height

      // Dark slate canvas background
      ctx.fillStyle = "#090d16"
      ctx.fillRect(0, 0, W, H)

      // Draw Grid Cells
      for (let mut r = 0; r < GRID_ROWS; r = r + 1) {
        for (let mut c = 0; c < GRID_COLS; c = c + 1) {
          let x = c * CELL_SIZE
          let y = r * CELL_SIZE
          let idx = getIndex(r, c)
          let tile = getTile(r, c)

          // Base Tile Color
          ctx.fillStyle = getTileColor(tile)
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)

          // Overlays for visited / open set
          if (tile != TileStart && tile != TileTarget && tile != TileWall) {
            if (openSetMatrix[idx]) {
              ctx.fillStyle = "rgba(6, 182, 212, 0.35)"
              ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4)
            } else if (visitedMatrix[idx]) {
              ctx.fillStyle = "rgba(99, 102, 241, 0.3)"
              ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4)
            }
          }

          // Tile Grid Border
          ctx.strokeStyle = "rgba(51, 65, 85, 0.4)"
          ctx.lineWidth = 1
          ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE)

          // Tile Symbols & Icons
          match (tile) {
            TileDoor(locked) => {
              ctx.fillStyle = "#ffffff"
              ctx.font = "14px sans-serif"
              ctx.fillText(locked ? "🔒" : "🚪", x + 6, y + 21)
            }
            TileKey(id) => {
              ctx.fillStyle = "#ffffff"
              ctx.font = "14px sans-serif"
              ctx.fillText("🔑", x + 6, y + 21)
            }
            TileStart => {
              ctx.fillStyle = "#ffffff"
              ctx.font = "15px sans-serif"
              ctx.fillText("🚩", x + 6, y + 22)
            }
            TileTarget => {
              ctx.fillStyle = "#ffffff"
              ctx.font = "15px sans-serif"
              ctx.fillText("🎯", x + 6, y + 22)
            }
            TileWall => ()
            TileFloor => ()
          }
        }
      }

      // Draw Golden Path Line
      if (pathResult.length > 1) {
        ctx.strokeStyle = "#f59e0b"
        ctx.lineWidth = 4
        ctx.beginPath()

        for (let mut i = 0; i < pathResult.length; i = i + 1) {
          let pt = pathResult[i]
          let px = pt.c * CELL_SIZE + CELL_SIZE / 2
          let py = pt.r * CELL_SIZE + CELL_SIZE / 2
          if (i == 0) {
            ctx.moveTo(px, py)
          } else {
            ctx.lineTo(px, py)
          }
        }
        ctx.stroke()

        // Glowing path waypoints
        for (let mut i = 0; i < pathResult.length; i = i + 1) {
          let pt = pathResult[i]
          let px = pt.c * CELL_SIZE + CELL_SIZE / 2
          let py = pt.r * CELL_SIZE + CELL_SIZE / 2
          ctx.fillStyle = "#fbbf24"
          ctx.beginPath()
          ctx.arc(px, py, 4, 0, 6.28)
          ctx.fill()
        }
      }
    }
  }
}

function handleCanvasMouseDown(e: any) {
  let cvs = getElementById("dungeon-canvas")
  if (cvs) {
    let rect = cvs.getBoundingClientRect()
    let clientX = e.clientX
    let clientY = e.clientY

    let mx = clientX - rect.left
    let my = clientY - rect.top

    let c = Math.floor(mx / CELL_SIZE)
    let r = Math.floor(my / CELL_SIZE)

    if (inBounds(r, c)) {
      isDraggingNode = true
      if (r == startPoint.r && c == startPoint.c) {
        dragNodeType = "start"
      } else if (r == targetPoint.r && c == targetPoint.c) {
        dragNodeType = "target"
      } else {
        dragNodeType = "brush"
        applyBrush(r, c)
      }
    }
  }
}

function handleCanvasMouseMove(e: any) {
  if (isDraggingNode) {
    let cvs = getElementById("dungeon-canvas")
    if (cvs) {
      let rect = cvs.getBoundingClientRect()
      let clientX = e.clientX
      let clientY = e.clientY

      let mx = clientX - rect.left
      let my = clientY - rect.top

      let c = Math.floor(mx / CELL_SIZE)
      let r = Math.floor(my / CELL_SIZE)

      if (inBounds(r, c)) {
        if (dragNodeType == "start") {
          setTile(startPoint.r, startPoint.c, TileFloor)
          startPoint = { r: r, c: c }
          setTile(r, c, TileStart)
          if (isSearchComplete) runFullSearch() else drawDungeonCanvas()
        } else if (dragNodeType == "target") {
          setTile(targetPoint.r, targetPoint.c, TileFloor)
          targetPoint = { r: r, c: c }
          setTile(r, c, TileTarget)
          if (isSearchComplete) runFullSearch() else drawDungeonCanvas()
        } else if (dragNodeType == "brush") {
          applyBrush(r, c)
        }
      }
    }
  }
}

function handleCanvasMouseUp() {
  isDraggingNode = false
  dragNodeType = "none"
}

function applyBrush(r: number, c: number) {
  if ((r == startPoint.r && c == startPoint.c) || (r == targetPoint.r && c == targetPoint.c)) {
    ()
  } else {
    match (activeBrush) {
      ToolWall => setTile(r, c, TileWall)
      ToolFloor => setTile(r, c, TileFloor)
      ToolDoor => setTile(r, c, TileDoor(true))
      ToolKey => setTile(r, c, TileKey(1))
      ToolStart => {
        setTile(startPoint.r, startPoint.c, TileFloor)
        startPoint = { r: r, c: c }
        setTile(r, c, TileStart)
      }
      ToolTarget => {
        setTile(targetPoint.r, targetPoint.c, TileFloor)
        targetPoint = { r: r, c: c }
        setTile(r, c, TileTarget)
      }
    }

    if (isSearchComplete) resetSearchState()
    updateHUD()
    drawDungeonCanvas()
  }
}

function startAnimationLoop() {
  stopAnimationLoop()
  prepareSearch()
  updateHUD()
  drawDungeonCanvas()

  animationTimerId = setInterval(fn() {
    let mut steps = 0
    let mut active = true
    while (active && steps < 3) {
      active = stepSearch()
      steps = steps + 1
    }
    updateHUD()
    drawDungeonCanvas()

    if (!active) {
      stopAnimationLoop()
    }
  }, 40)
}

function stopAnimationLoop() {
  if (animationTimerId != 0) {
    clearInterval(animationTimerId)
    animationTimerId = 0
  }
}

// Initial setup
generateProceduralDungeon()

// ----------------------------------------------------------------------------
// 8. Main Application UI Layout
// ----------------------------------------------------------------------------

function renderUI() {
  let vnode = h("div", { className: "min-h-screen bg-slate-950 text-slate-100 p-4 font-sans space-y-4 max-w-7xl mx-auto" }, [
    // Top Header
    h("div", { className: "flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl" }, [
      h("div", { className: "flex items-center space-x-3" }, [
        h("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/20" }, "🏰"),
        h("div", {}, [
          h("h1", { className: "text-lg font-black tracking-tight text-white flex items-center gap-2 uppercase italic" }, [
            "TypeLang Dungeon & Pathfinding Lab",
            h("span", { className: "text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold not-italic" }, "GADT & Heap Engine")
          ]),
          h("p", { className: "text-xs text-slate-400" }, "Procedural maze generators paired with A*, Dijkstra & BFS pathfinding solvers")
        ])
      ]),

      // Generator Action Toolbar
      h("div", { className: "flex flex-wrap items-center gap-2" }, [
        h("button", {
          className: "px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition shadow-lg shadow-indigo-900/30 cursor-pointer active:scale-95",
          onClick: fn() { stopAnimationLoop(); generateProceduralDungeon(); resetSearchState(); renderUI() }
        }, "📦 Procedural Dungeon"),
        h("button", {
          className: "px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition shadow-lg shadow-amber-900/30 cursor-pointer active:scale-95",
          onClick: fn() { stopAnimationLoop(); generateRecursiveMaze(); resetSearchState(); renderUI() }
        }, "🧱 Recursive Maze"),
        h("button", {
          className: "px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition border border-slate-700 cursor-pointer",
          onClick: fn() { stopAnimationLoop(); clearGridToFloors(); resetSearchState(); renderUI() }
        }, "🧹 Clear Grid")
      ])
    ]),

    // Algorithm & Heuristic Control Panel
    h("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3" }, [
      // Algorithm Picker
      h("div", { className: "p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2" }, [
        h("div", { className: "text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider" }, "Select Search Algorithm"),
        h("div", { className: "flex gap-1.5" }, [
          h("button", {
            className: activeAlg == AlgAStar ? "flex-1 py-1.5 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold cursor-pointer" : "flex-1 py-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 font-mono text-xs cursor-pointer",
            onClick: fn() { activeAlg = AlgAStar; resetSearchState(); renderUI() }
          }, "A* Search"),
          h("button", {
            className: activeAlg == AlgDijkstra ? "flex-1 py-1.5 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold cursor-pointer" : "flex-1 py-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 font-mono text-xs cursor-pointer",
            onClick: fn() { activeAlg = AlgDijkstra; resetSearchState(); renderUI() }
          }, "Dijkstra"),
          h("button", {
            className: activeAlg == AlgBFS ? "flex-1 py-1.5 rounded-lg bg-indigo-600 text-white font-mono text-xs font-bold cursor-pointer" : "flex-1 py-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 font-mono text-xs cursor-pointer",
            onClick: fn() { activeAlg = AlgBFS; resetSearchState(); renderUI() }
          }, "BFS")
        ])
      ]),

      // Heuristic Picker
      h("div", { className: "p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2" }, [
        h("div", { className: "text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider" }, "A* Distance Heuristic"),
        h("div", { className: "flex gap-1.5" }, [
          h("button", {
            className: activeHeuristic == HeuristicManhattan ? "flex-1 py-1.5 rounded-lg bg-cyan-600 text-white font-mono text-xs font-bold cursor-pointer" : "flex-1 py-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 font-mono text-xs cursor-pointer",
            onClick: fn() { activeHeuristic = HeuristicManhattan; resetSearchState(); renderUI() }
          }, "Manhattan"),
          h("button", {
            className: activeHeuristic == HeuristicEuclidean ? "flex-1 py-1.5 rounded-lg bg-cyan-600 text-white font-mono text-xs font-bold cursor-pointer" : "flex-1 py-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 font-mono text-xs cursor-pointer",
            onClick: fn() { activeHeuristic = HeuristicEuclidean; resetSearchState(); renderUI() }
          }, "Euclidean"),
          h("button", {
            className: activeHeuristic == HeuristicChebyshev ? "flex-1 py-1.5 rounded-lg bg-cyan-600 text-white font-mono text-xs font-bold cursor-pointer" : "flex-1 py-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 font-mono text-xs cursor-pointer",
            onClick: fn() { activeHeuristic = HeuristicChebyshev; resetSearchState(); renderUI() }
          }, "Chebyshev")
        ])
      ]),

      // Execution & Animation Playback Controls
      h("div", { className: "p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2" }, [
        h("div", { className: "text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider" }, "Solver Playback"),
        h("div", { className: "flex gap-2" }, [
          h("button", {
            className: "flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer shadow-lg shadow-emerald-900/20 active:scale-95",
            onClick: fn() { startAnimationLoop() }
          }, "▶ Animate Search"),
          h("button", {
            className: "flex-1 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold cursor-pointer shadow-lg shadow-amber-900/20 active:scale-95",
            onClick: fn() { stopAnimationLoop(); runFullSearch() }
          }, "⚡ Instant Solve")
        ])
      ])
    ]),

    // Interactive Canvas & Brush Tools Section
    h("div", { className: "relative bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-2xl space-y-3" }, [
      // Palette Brush Selector
      h("div", { className: "flex flex-wrap items-center justify-between gap-2 text-xs font-mono border-b border-slate-800/80 pb-3" }, [
        h("div", { className: "flex items-center space-x-2" }, [
          h("span", { className: "text-slate-400 text-[11px] font-bold uppercase mr-1" }, "Paint Brush Tool:"),
          h("button", {
            className: activeBrush == ToolWall ? "px-2.5 py-1 rounded-lg bg-slate-800 text-amber-400 border border-amber-500/50 font-bold cursor-pointer" : "px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer",
            onClick: fn() { activeBrush = ToolWall; renderUI() }
          }, "🧱 Wall"),
          h("button", {
            className: activeBrush == ToolFloor ? "px-2.5 py-1 rounded-lg bg-slate-800 text-amber-400 border border-amber-500/50 font-bold cursor-pointer" : "px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer",
            onClick: fn() { activeBrush = ToolFloor; renderUI() }
          }, "⬛ Floor"),
          h("button", {
            className: activeBrush == ToolDoor ? "px-2.5 py-1 rounded-lg bg-slate-800 text-amber-400 border border-amber-500/50 font-bold cursor-pointer" : "px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer",
            onClick: fn() { activeBrush = ToolDoor; renderUI() }
          }, "🔒 Door (15)"),
          h("button", {
            className: activeBrush == ToolKey ? "px-2.5 py-1 rounded-lg bg-slate-800 text-amber-400 border border-amber-500/50 font-bold cursor-pointer" : "px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer",
            onClick: fn() { activeBrush = ToolKey; renderUI() }
          }, "🔑 Key"),
          h("button", {
            className: activeBrush == ToolStart ? "px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400 border border-emerald-500/50 font-bold cursor-pointer" : "px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer",
            onClick: fn() { activeBrush = ToolStart; renderUI() }
          }, "🚩 Start"),
          h("button", {
            className: activeBrush == ToolTarget ? "px-2.5 py-1 rounded-lg bg-slate-800 text-blue-400 border border-blue-500/50 font-bold cursor-pointer" : "px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer",
            onClick: fn() { activeBrush = ToolTarget; renderUI() }
          }, "🎯 Target")
        ]),
        h("div", { className: "text-slate-400 text-[11px]" }, "💡 Tip: Click or drag on canvas to paint or move Start / Target nodes!")
      ]),

      // Interactive Canvas Container
      h("div", { className: "flex justify-center overflow-x-auto p-1" }, [
        h("canvas", {
          id: "dungeon-canvas",
          width: "870",
          height: "510",
          className: "rounded-xl bg-slate-950 border border-slate-800 shadow-inner cursor-crosshair touch-none"
        }, "")
      ])
    ]),

    // Stats & Live Diagnostic Telemetry Footer
    h("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs" }, [
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "Nodes Explored"),
        h("div", { id: "stat-nodes-explored", className: "text-lg font-bold text-cyan-400" }, to_string(nodesExploredCount))
      ]),
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "Path Length / Steps"),
        h("div", { id: "stat-path-length", className: "text-lg font-bold text-amber-400" }, to_string(pathResult.length))
      ]),
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "Path Total Cost"),
        h("div", { id: "stat-path-cost", className: "text-lg font-bold text-emerald-400" }, to_string(Math.floor(pathCostCount)))
      ]),
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "Search Status"),
        h("div", {
          id: "stat-search-status",
          className: isPathFound
            ? "text-sm font-bold text-emerald-400"
            : (isSearchComplete ? "text-sm font-bold text-rose-400" : "text-sm font-bold text-amber-400")
        }, isPathFound ? "✅ Path Found" : (isSearchComplete ? "❌ No Path Found" : (isSearching ? "🔍 Searching..." : "⏸ Idle")))
      ])
    ])
  ])

  mount("app-root", vnode)

  // Attach Canvas Mouse / Touch Listeners
  let cvs = getElementById("dungeon-canvas")
  if (cvs) {
    cvs.onmousedown = handleCanvasMouseDown
    cvs.onmousemove = handleCanvasMouseMove
    cvs.onmouseup = handleCanvasMouseUp
    cvs.ontouchstart = handleCanvasMouseDown
    cvs.ontouchmove = handleCanvasMouseMove
    cvs.ontouchend = handleCanvasMouseUp
  }

  drawDungeonCanvas()
}

// Initial UI Render & Canvas Draw
renderUI()
drawDungeonCanvas()

println("TypeLang Dungeon & Pathfinding Lab Initialized Successfully!")
`
  };
