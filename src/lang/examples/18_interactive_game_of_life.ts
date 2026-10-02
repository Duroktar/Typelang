import { ExampleProgram } from "./types";

export const example18InteractiveGameOfLife: ExampleProgram = {
    id: 'interactive_game_of_life',
    name: '18. Quantum Game of Life & Cellular Automata Engine (Interactive 2D Lab)',
    category: 'Interactive Web Apps',
    description: 'High-performance cellular automata simulation featuring GADT rules, pattern matching, age-based chromatic heatmaps, pattern stampers (Gosper Gun, Pulsar, Acorn), and interactive canvas painting.',
    code: `// ============================================================================
// TypeLang Advanced Cellular Automata & Quantum Game of Life Engine
// ============================================================================

import DOM.{ h, mount, getElementById }

// ----------------------------------------------------------------------------
// 1. Algebraic Data Types & GADT State Definitions
// ----------------------------------------------------------------------------

type Cell =
  | Dead
  | Alive(age: number)

type Rule =
  | Conway
  | HighLife
  | Seeds
  | DayNight

type Pattern =
  | Glider
  | GosperGun
  | Pulsar
  | Spaceship
  | Acorn

// ----------------------------------------------------------------------------
// 2. Simulation Configuration & State
// ----------------------------------------------------------------------------

let GRID_W = 44
let GRID_H = 26
let CELL_SIZE = 12
let CANVAS_W = GRID_W * CELL_SIZE
let CANVAS_H = GRID_H * CELL_SIZE

let mut grid: [number] = []
let mut nextGrid: [number] = []
let totalCells = GRID_W * GRID_H

for (let mut i = 0; i < totalCells; i = i + 1) {
  grid.push(0)
  nextGrid.push(0)
}

let mut isRunning = true
let mut currentRule: Rule = Conway
let mut generation = 0
let mut population = 0
let mut peakPopulation = 0
let mut totalBirths = 0
let mut totalDeaths = 0
let mut targetFPS = 30
let mut selectedPattern: Pattern = Glider
let mut isDrawing = false
let mut drawMode = 1 // 1 = paint alive, 0 = erase

// ----------------------------------------------------------------------------
// 3. Pattern Matching Transition Rules
// ----------------------------------------------------------------------------

function evaluateRule(rule: Rule, isAlive: boolean, neighbors: number): boolean {
  match (rule) {
    Conway => {
      if (isAlive) {
        neighbors == 2 || neighbors == 3
      } else {
        neighbors == 3
      }
    }
    HighLife => {
      if (isAlive) {
        neighbors == 2 || neighbors == 3
      } else {
        neighbors == 3 || neighbors == 6
      }
    }
    Seeds => {
      if (isAlive) {
        false
      } else {
        neighbors == 2
      }
    }
    DayNight => {
      if (isAlive) {
        neighbors == 3 || neighbors == 4 || neighbors == 6 || neighbors == 7 || neighbors == 8
      } else {
        neighbors == 3 || neighbors == 6 || neighbors == 7 || neighbors == 8
      }
    }
  }
}

function getRuleName(rule: Rule): string {
  match (rule) {
    Conway => "Conway's Life (B3/S23)"
    HighLife => "HighLife (B36/S23 - Replicator)"
    Seeds => "Seeds (B2/S0 - Pure Growth)"
    DayNight => "Day & Night (B3678/S34678)"
  }
}

// ----------------------------------------------------------------------------
// 4. Grid Coordinate Helpers & Neighbor Counting
// ----------------------------------------------------------------------------

function getIndex(x: number, y: number): number {
  let wx = (x + GRID_W) % GRID_W
  let wy = (y + GRID_H) % GRID_H
  wy * GRID_W + wx
}

function countNeighbors(x: number, y: number): number {
  let mut count = 0
  for (let mut dy = -1; dy <= 1; dy = dy + 1) {
    for (let mut dx = -1; dx <= 1; dx = dx + 1) {
      if (dx != 0 || dy != 0) {
        let idx = getIndex(x + dx, y + dy)
        if (grid[idx] > 0) {
          count = count + 1
        }
      }
    }
  }
  count
}

function setCell(x: number, y: number, alive: boolean) {
  let idx = getIndex(x, y)
  if (alive) {
    if (grid[idx] == 0) {
      grid[idx] = 1
    }
  } else {
    grid[idx] = 0
  }
}

// ----------------------------------------------------------------------------
// 5. Pattern Stampers
// ----------------------------------------------------------------------------

function stampGlider(cx: number, cy: number) {
  setCell(cx + 1, cy + 0, true)
  setCell(cx + 2, cy + 1, true)
  setCell(cx + 0, cy + 2, true)
  setCell(cx + 1, cy + 2, true)
  setCell(cx + 2, cy + 2, true)
}

function stampSpaceship(cx: number, cy: number) {
  setCell(cx + 1, cy + 0, true)
  setCell(cx + 4, cy + 0, true)
  setCell(cx + 0, cy + 1, true)
  setCell(cx + 0, cy + 2, true)
  setCell(cx + 4, cy + 2, true)
  setCell(cx + 0, cy + 3, true)
  setCell(cx + 1, cy + 3, true)
  setCell(cx + 2, cy + 3, true)
  setCell(cx + 3, cy + 3, true)
}

function stampPulsar(cx: number, cy: number) {
  let offsets = [-4, -3, -2, 2, 3, 4]
  for (let mut i = 0; i < offsets.length; i = i + 1) {
    let o = offsets[i]
    setCell(cx + o, cy - 6, true)
    setCell(cx + o, cy - 1, true)
    setCell(cx + o, cy + 1, true)
    setCell(cx + o, cy + 6, true)
    setCell(cx - 6, cy + o, true)
    setCell(cx - 1, cy + o, true)
    setCell(cx + 1, cy + o, true)
    setCell(cx + 6, cy + o, true)
  }
}

function stampAcorn(cx: number, cy: number) {
  setCell(cx + 1, cy + 0, true)
  setCell(cx + 3, cy + 1, true)
  setCell(cx + 0, cy + 2, true)
  setCell(cx + 1, cy + 2, true)
  setCell(cx + 4, cy + 2, true)
  setCell(cx + 5, cy + 2, true)
  setCell(cx + 6, cy + 2, true)
}

function stampGosperGun(cx: number, cy: number) {
  let pts = [
    [0, 4], [0, 5], [1, 4], [1, 5],
    [10, 4], [10, 5], [10, 6], [11, 3], [11, 7], [12, 2], [12, 8],
    [13, 2], [13, 8], [14, 5], [15, 3], [15, 7], [16, 4], [16, 5], [16, 6], [17, 5],
    [20, 2], [20, 3], [20, 4], [21, 2], [21, 3], [21, 4], [22, 1], [22, 5],
    [24, 0], [24, 1], [24, 5], [24, 6],
    [34, 2], [34, 3], [35, 2], [35, 3]
  ]
  for (let mut i = 0; i < pts.length; i = i + 1) {
    let p = pts[i]
    setCell(cx + p[0], cy + p[1], true)
  }
}

function stampSelectedPattern(cx: number, cy: number) {
  match (selectedPattern) {
    Glider => stampGlider(cx, cy)
    Spaceship => stampSpaceship(cx, cy)
    Pulsar => stampPulsar(cx, cy)
    Acorn => stampAcorn(cx, cy)
    GosperGun => stampGosperGun(cx, cy)
  }
}

function randomizeGrid(density: number) {
  for (let mut i = 0; i < totalCells; i = i + 1) {
    if (Math.random() < density) {
      grid[i] = 1
    } else {
      grid[i] = 0
    }
  }
  generation = 0
}

function clearGrid() {
  for (let mut i = 0; i < totalCells; i = i + 1) {
    grid[i] = 0
    nextGrid[i] = 0
  }
  generation = 0
  population = 0
}

function invertGrid() {
  for (let mut i = 0; i < totalCells; i = i + 1) {
    if (grid[i] == 0) {
      grid[i] = 1
    } else {
      grid[i] = 0
    }
  }
}

// ----------------------------------------------------------------------------
// 6. Simulation Step Calculation (Pure HM-Checked Engine)
// ----------------------------------------------------------------------------

function stepSimulation() {
  let mut currentPop = 0
  let mut births = 0
  let mut deaths = 0

  for (let mut y = 0; y < GRID_H; y = y + 1) {
    for (let mut x = 0; x < GRID_W; x = x + 1) {
      let idx = y * GRID_W + x
      let age = grid[idx]
      let isAlive = age > 0
      let neighbors = countNeighbors(x, y)

      let survives = evaluateRule(currentRule, isAlive, neighbors)

      if (survives) {
        if (isAlive) {
          nextGrid[idx] = age + 1
        } else {
          nextGrid[idx] = 1
          births = births + 1
        }
        currentPop = currentPop + 1
      } else {
        if (isAlive) {
          deaths = deaths + 1
        }
        nextGrid[idx] = 0
      }
    }
  }

  // Swap grids
  for (let mut i = 0; i < totalCells; i = i + 1) {
    grid[i] = nextGrid[i]
  }

  generation = generation + 1
  population = currentPop
  totalBirths = births
  totalDeaths = deaths

  if (population > peakPopulation) {
    peakPopulation = population
  }
}

// ----------------------------------------------------------------------------
// 7. Chromatic Age-Based Cell Color Interpolation
// ----------------------------------------------------------------------------

function getCellColor(age: number): string {
  if (age <= 1) {
    "#38bdf8" // Neon Sky Blue (Newborn)
  } else if (age <= 3) {
    "#818cf8" // Indigo (Youth)
  } else if (age <= 8) {
    "#c084fc" // Purple (Mature)
  } else if (age <= 18) {
    "#f472b6" // Hot Pink (Senior)
  } else if (age <= 35) {
    "#fb923c" // Amber Flame (Ancient)
  } else {
    "#34d399" // Jade Matrix (Immortal)
  }
}

// Seed initial pattern (Gosper Glider Gun + Pulsar)
stampGosperGun(2, 4)
stampPulsar(34, 14)

// ----------------------------------------------------------------------------
// 8. Virtual DOM UI Layout & Interactive HUD
// ----------------------------------------------------------------------------

function renderApp() {
  let vnode = h("div", { className: "p-4 max-w-5xl mx-auto space-y-4 font-sans text-slate-100 select-none" }, [
    // Header & Telemetry Banner
    h("div", { className: "flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl" }, [
      h("div", { className: "space-y-1" }, [
        h("div", { className: "flex items-center space-x-2" }, [
          h("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider" },
            "Cellular Automata Lab"
          ),
          h("span", { className: "px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-sky-300" },
            concat("Grid: ", concat(to_string(GRID_W), concat("x", to_string(GRID_H))))
          )
        ]),
        h("h1", { className: "text-2xl font-black bg-gradient-to-r from-sky-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent" },
          "Quantum Game of Life"
        )
      ]),

      // Stats Counters
      h("div", { className: "flex items-center gap-3 text-xs font-mono" }, [
        h("div", { className: "px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center" }, [
          h("div", { className: "text-[10px] text-slate-500 uppercase" }, "Generation"),
          h("div", { id: "stat-gen", className: "text-base font-bold text-sky-400" }, to_string(generation))
        ]),
        h("div", { className: "px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center" }, [
          h("div", { className: "text-[10px] text-slate-500 uppercase" }, "Population"),
          h("div", { id: "stat-pop", className: "text-base font-bold text-emerald-400" }, to_string(population))
        ]),
        h("div", { className: "px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center" }, [
          h("div", { className: "text-[10px] text-slate-500 uppercase" }, "Peak"),
          h("div", { id: "stat-peak", className: "text-base font-bold text-purple-400" }, to_string(peakPopulation))
        ]),
        h("div", { className: "px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center hidden sm:block" }, [
          h("div", { className: "text-[10px] text-slate-500 uppercase" }, "Birth / Death"),
          h("div", { id: "stat-bd", className: "text-xs font-bold text-slate-300" }, 
            concat("+", concat(to_string(totalBirths), concat(" / -", to_string(totalDeaths))))
          )
        ])
      ])
    ]),

    // Main Simulation Viewport (Canvas)
    h("div", { className: "relative bg-slate-950 rounded-2xl border border-indigo-500/20 p-2 shadow-2xl flex flex-col items-center justify-center overflow-hidden" }, [
      h("canvas", {
        id: "life-canvas",
        width: to_string(CANVAS_W),
        height: to_string(CANVAS_H),
        className: "rounded-xl bg-slate-950 cursor-crosshair border border-slate-800/80 shadow-inner max-w-full"
      }, ""),
      
      // Floating Canvas Hint
      h("div", { className: "mt-2 flex flex-wrap items-center justify-between w-full px-2 text-[11px] text-slate-400 font-mono" }, [
        h("div", { className: "flex items-center space-x-2" }, [
          h("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }, ""),
          h("span", {}, "Click/Drag on canvas to paint cells. Shift+Click to stamp preset.")
        ]),
        h("div", { id: "current-rule-badge", className: "text-indigo-400 font-semibold" }, getRuleName(currentRule))
      ])
    ]),

    // Control Deck
    h("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3" }, [
      // 1. Playback Controls
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5" }, [
        h("div", { className: "text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider" }, "Playback & Step"),
        h("div", { className: "flex items-center gap-2" }, [
          h("button", {
            id: "btn-play",
            className: "flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1.5",
            onClick: fn() {
              isRunning = !isRunning
              let btn = getElementById("btn-play")
              if (btn) {
                if (isRunning) {
                  btn.innerText = "⏸ Pause"
                } else {
                  btn.innerText = "▶ Resume"
                }
              }
            }
          }, isRunning ? "⏸ Pause" : "▶ Resume"),
          h("button", {
            className: "py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition cursor-pointer border border-slate-700",
            onClick: fn() {
              stepSimulation()
              updateHUD()
            }
          }, "⏭ Step")
        ]),
        h("div", { className: "flex items-center justify-between text-xs font-mono text-slate-400 pt-1" }, [
          h("span", {}, "Speed:"),
          h("div", { className: "flex gap-1" }, [
            h("button", {
              className: "px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600 text-[10px] text-slate-300 cursor-pointer",
              onClick: fn() { targetFPS = 10 }
            }, "10 FPS"),
            h("button", {
              className: "px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600 text-[10px] text-slate-300 cursor-pointer",
              onClick: fn() { targetFPS = 30 }
            }, "30 FPS"),
            h("button", {
              className: "px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600 text-[10px] text-slate-300 cursor-pointer",
              onClick: fn() { targetFPS = 60 }
            }, "60 FPS")
          ])
        ])
      ]),

      // 2. Automata Rules (GADT Switcher)
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5" }, [
        h("div", { className: "text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider" }, "Rule Selection (GADT)"),
        h("div", { className: "grid grid-cols-2 gap-1.5 text-[11px] font-mono" }, [
          h("button", {
            className: "p-1.5 rounded-lg bg-slate-800/80 hover:bg-sky-600/30 text-slate-200 border border-slate-700/60 text-left transition cursor-pointer truncate",
            onClick: fn() {
              currentRule = Conway
              updateRuleBadge()
            }
          }, "• Conway (B3/S23)"),
          h("button", {
            className: "p-1.5 rounded-lg bg-slate-800/80 hover:bg-sky-600/30 text-slate-200 border border-slate-700/60 text-left transition cursor-pointer truncate",
            onClick: fn() {
              currentRule = HighLife
              updateRuleBadge()
            }
          }, "• HighLife (B36/S23)"),
          h("button", {
            className: "p-1.5 rounded-lg bg-slate-800/80 hover:bg-sky-600/30 text-slate-200 border border-slate-700/60 text-left transition cursor-pointer truncate",
            onClick: fn() {
              currentRule = Seeds
              updateRuleBadge()
            }
          }, "• Seeds (B2/S0)"),
          h("button", {
            className: "p-1.5 rounded-lg bg-slate-800/80 hover:bg-sky-600/30 text-slate-200 border border-slate-700/60 text-left transition cursor-pointer truncate",
            onClick: fn() {
              currentRule = DayNight
              updateRuleBadge()
            }
          }, "• Day & Night")
        ])
      ]),

      // 3. Preset Stamps & Grid Tools
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5" }, [
        h("div", { className: "text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider" }, "Stamps & Grid Actions"),
        h("div", { className: "flex flex-wrap gap-1.5 text-[11px]" }, [
          h("button", {
            className: "px-2 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-200 rounded-lg transition cursor-pointer font-mono",
            onClick: fn() {
              clearGrid()
              stampGosperGun(2, 4)
              stampPulsar(34, 14)
              updateHUD()
            }
          }, "🔫 Gosper Gun"),
          h("button", {
            className: "px-2 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-200 rounded-lg transition cursor-pointer font-mono",
            onClick: fn() {
              clearGrid()
              stampAcorn(18, 12)
              updateHUD()
            }
          }, "🌰 Acorn"),
          h("button", {
            className: "px-2 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-200 rounded-lg transition cursor-pointer font-mono",
            onClick: fn() {
              randomizeGrid(0.25)
              updateHUD()
            }
          }, "🎲 Random"),
          h("button", {
            className: "px-2 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 rounded-lg transition cursor-pointer font-mono",
            onClick: fn() {
              clearGrid()
              updateHUD()
            }
          }, "🗑 Clear"),
          h("button", {
            className: "px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition cursor-pointer font-mono",
            onClick: fn() {
              invertGrid()
              updateHUD()
            }
          }, "🔄 Invert")
        ])
      ])
    ]),

    // Chromatic Age Legend
    h("div", { className: "p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400" }, [
      h("span", { className: "text-slate-300 font-semibold" }, "Cell Age Chromatic Heatmap:"),
      h("div", { className: "flex flex-wrap items-center gap-3" }, [
        h("div", { className: "flex items-center space-x-1" }, [
          h("span", { className: "w-2.5 h-2.5 rounded-sm bg-[#38bdf8]" }, ""),
          h("span", {}, "Gen 1 (Newborn)")
        ]),
        h("div", { className: "flex items-center space-x-1" }, [
          h("span", { className: "w-2.5 h-2.5 rounded-sm bg-[#818cf8]" }, ""),
          h("span", {}, "Gen 2-3 (Youth)")
        ]),
        h("div", { className: "flex items-center space-x-1" }, [
          h("span", { className: "w-2.5 h-2.5 rounded-sm bg-[#c084fc]" }, ""),
          h("span", {}, "Gen 4-8 (Prime)")
        ]),
        h("div", { className: "flex items-center space-x-1" }, [
          h("span", { className: "w-2.5 h-2.5 rounded-sm bg-[#f472b6]" }, ""),
          h("span", {}, "Gen 9-18 (Senior)")
        ]),
        h("div", { className: "flex items-center space-x-1" }, [
          h("span", { className: "w-2.5 h-2.5 rounded-sm bg-[#34d399]" }, ""),
          h("span", {}, "Gen 35+ (Immortal)")
        ])
      ])
    ])
  ])

  mount("app-root", vnode)
}

function updateRuleBadge() {
  let badge = getElementById("current-rule-badge")
  if (badge) {
    badge.innerText = getRuleName(currentRule)
  }
}

function updateHUD() {
  let sGen = getElementById("stat-gen")
  let sPop = getElementById("stat-pop")
  let sPeak = getElementById("stat-peak")
  let sBD = getElementById("stat-bd")

  if (sGen) sGen.innerText = to_string(generation)
  if (sPop) sPop.innerText = to_string(population)
  if (sPeak) sPeak.innerText = to_string(peakPopulation)
  if (sBD) sBD.innerText = concat("+", concat(to_string(totalBirths), concat(" / -", to_string(totalDeaths))))
}

// ----------------------------------------------------------------------------
// 9. Canvas Rendering Pipeline & Interactive Mouse Handlers
// ----------------------------------------------------------------------------

renderApp()

let canvas = getElementById("life-canvas")
if (canvas) {
  let ctx = canvas.getContext("2d")

  function drawCanvas() {
    // Background Dark Slate
    ctx.fillStyle = "#020617"
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Draw Subtle Grid Lines
    ctx.strokeStyle = "rgba(30, 41, 59, 0.4)"
    ctx.lineWidth = 0.5
    for (let mut x = 0; x <= GRID_W; x = x + 1) {
      ctx.beginPath()
      ctx.moveTo(x * CELL_SIZE, 0)
      ctx.lineTo(x * CELL_SIZE, CANVAS_H)
      ctx.stroke()
    }
    for (let mut y = 0; y <= GRID_H; y = y + 1) {
      ctx.beginPath()
      ctx.moveTo(0, y * CELL_SIZE)
      ctx.lineTo(CANVAS_W, y * CELL_SIZE)
      ctx.stroke()
    }

    // Render Living Cells with Glow
    for (let mut y = 0; y < GRID_H; y = y + 1) {
      for (let mut x = 0; x < GRID_W; x = x + 1) {
        let idx = y * GRID_W + x
        let age = grid[idx]
        if (age > 0) {
          let color = getCellColor(age)
          ctx.fillStyle = color
          ctx.shadowColor = color
          ctx.shadowBlur = age > 3 ? 6 : 2

          let pad = 1
          let px = x * CELL_SIZE + pad
          let py = y * CELL_SIZE + pad
          let sz = CELL_SIZE - pad * 2
          ctx.fillRect(px, py, sz, sz)
        }
      }
    }
    ctx.shadowBlur = 0
  }

  // Interactive Mouse Canvas Controls
  function handlePointerAction(e: any, isClick: boolean) {
    let rect = canvas.getBoundingClientRect()
    let mx = e.clientX - rect.left
    let my = e.clientY - rect.top
    let gx = Math.floor(mx / CELL_SIZE)
    let gy = Math.floor(my / CELL_SIZE)

    if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
      if (e.shiftKey && isClick) {
        stampSelectedPattern(gx, gy)
      } else {
        if (isClick) {
          let idx = gy * GRID_W + gx
          drawMode = grid[idx] > 0 ? 0 : 1
        }
        setCell(gx, gy, drawMode == 1)
      }
      updateHUD()
      drawCanvas()
    }
  }

  canvas.addEventListener("mousedown", fn(e) {
    isDrawing = true
    handlePointerAction(e, true)
  })

  canvas.addEventListener("mousemove", fn(e) {
    if (isDrawing) {
      handlePointerAction(e, false)
    }
  })

  canvas.addEventListener("mouseup", fn() {
    isDrawing = false
  })

  canvas.addEventListener("mouseleave", fn() {
    isDrawing = false
  })

  // Animation Loop with Target FPS Throttling
  let mut lastTime = 0
  function animationLoop(timestamp: number) {
    let interval = 1000 / targetFPS
    if (timestamp - lastTime >= interval) {
      if (isRunning) {
        stepSimulation()
        updateHUD()
      }
      drawCanvas()
      lastTime = timestamp
    }
    requestAnimationFrame(animationLoop)
  }

  requestAnimationFrame(animationLoop)
}

println("Quantum Game of Life & Cellular Automata Engine Initialized Successfully!")
`
  };
