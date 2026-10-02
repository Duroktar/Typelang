import { ExampleProgram } from "./types";

export const example24BoidsFlockingEngine: ExampleProgram = {
    id: "boids-flocking-engine",
    name: "24. Boids Flocking & Autonomous Artificial Life Engine",
    category: "Games & Graphics",
    description: "High-FPS 2D artificial life engine featuring Craig Reynolds' Boids algorithm (Separation, Alignment, Cohesion), spatial hashing grid partitioning for O(N) neighbor queries, predators, food attractors, and interactive steering behavior sliders.",
    code: `import DOM.{ h, mount, getElementById }

let CANVAS_W = 870
let CANVAS_H = 500
let GRID_CELL_SIZE = 60
let COLS = 15
let ROWS = 9

let mut boidCount = 180
let mut perceptionRadius = 50.0
let mut maxSpeed = 4.5
let mut maxForce = 0.25
let mut separationWeight = 1.8
let mut alignmentWeight = 1.2
let mut cohesionWeight = 1.0
let mut predatorWeight = 3.5

let mut isRunning = true
let mut showSpatialGrid = true
let mut showPerception = false
let mut activeClickTool = "food"

let mut animTimerId = 0

type Boid = {
  id: number,
  mut x: number,
  mut y: number,
  mut vx: number,
  mut vy: number,
  mut ax: number,
  mut ay: number,
  typeId: number,
  hue: number
}

let mut nextEntityId = 1
let mut boids: Boid[] = []

function createBoid(x: number, y: number, typeId: number): Boid {
  let id = nextEntityId
  nextEntityId = nextEntityId + 1
  let angle = Math.random() * 6.28318
  let speed = typeId == 1 ? 3.5 : (typeId == 2 ? 0.0 : 2.0 + Math.random() * 2.0)
  let vx = typeId == 2 ? 0.0 : Math.cos(angle) * speed
  let vy = typeId == 2 ? 0.0 : Math.sin(angle) * speed
  let hue = typeId == 1 ? 0 : (typeId == 2 ? 120 : Math.floor(Math.random() * 60 + 190))
  {
    id: id,
    x: x,
    y: y,
    vx: vx,
    vy: vy,
    ax: 0.0,
    ay: 0.0,
    typeId: typeId,
    hue: hue
  }
}

function initSimulation() {
  boids = []
  nextEntityId = 1
  for (let mut i = 0; i < 180; i = i + 1) {
    let rx = 50.0 + Math.random() * (CANVAS_W - 100)
    let ry = 50.0 + Math.random() * (CANVAS_H - 100)
    boids.push(createBoid(rx, ry, 0))
  }
  boids.push(createBoid(CANVAS_W / 2, CANVAS_H / 2, 1))
  boids.push(createBoid(CANVAS_W / 3, CANVAS_H / 3, 2))
  boids.push(createBoid((CANVAS_W * 2) / 3, (CANVAS_H * 2) / 3, 2))
}

function getGridCellIndex(x: number, y: number): number {
  let c = Math.max(0, Math.min(COLS - 1, Math.floor(x / GRID_CELL_SIZE)))
  let r = Math.max(0, Math.min(ROWS - 1, Math.floor(y / GRID_CELL_SIZE)))
  r * COLS + c
}

function updatePhysics() {
  let mut gridBuckets: Boid[][] = []
  let totalCells = COLS * ROWS
  for (let mut i = 0; i < totalCells; i = i + 1) {
    gridBuckets.push([])
  }

  for (let mut i = 0; i < boids.length; i = i + 1) {
    let b = boids[i]
    let cellIdx = getGridCellIndex(b.x, b.y)
    gridBuckets[cellIdx].push(b)
  }

  for (let mut i = 0; i < boids.length; i = i + 1) {
    let b = boids[i]
    if (b.typeId != 2) {
      let cellC = Math.max(0, Math.min(COLS - 1, Math.floor(b.x / GRID_CELL_SIZE)))
      let cellR = Math.max(0, Math.min(ROWS - 1, Math.floor(b.y / GRID_CELL_SIZE)))

      let mut sepX = 0.0
      let mut sepY = 0.0
      let mut sepCount = 0

      let mut aliX = 0.0
      let mut aliY = 0.0
      let mut aliCount = 0

      let mut cohX = 0.0
      let mut cohY = 0.0
      let mut cohCount = 0

      let mut fleeX = 0.0
      let mut fleeY = 0.0
      let mut fleeCount = 0

      let mut foodX = 0.0
      let mut foodY = 0.0
      let mut foodCount = 0

      for (let mut dr = -1; dr <= 1; dr = dr + 1) {
        for (let mut dc = -1; dc <= 1; dc = dc + 1) {
          let nr = cellR + dr
          let nc = cellC + dc
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            let nIdx = nr * COLS + nc
            let bucket = gridBuckets[nIdx]
            for (let mut k = 0; k < bucket.length; k = k + 1) {
              let other = bucket[k]
              if (other.id != b.id) {
                let dx = other.x - b.x
                let dy = other.y - b.y
                let distSq = dx * dx + dy * dy
                let dist = Math.sqrt(distSq)

                if (b.typeId == 0) {
                  if (other.typeId == 1) {
                    if (dist < perceptionRadius * 1.8 && dist > 0.001) {
                      fleeX = fleeX - (dx / dist)
                      fleeY = fleeY - (dy / dist)
                      fleeCount = fleeCount + 1
                    }
                  } else if (other.typeId == 2) {
                    if (dist < perceptionRadius * 2.5 && dist > 0.001) {
                      foodX = foodX + other.x
                      foodY = foodY + other.y
                      foodCount = foodCount + 1
                    }
                  } else if (other.typeId == 0) {
                    if (dist < perceptionRadius * 0.5 && dist > 0.001) {
                      sepX = sepX - (dx / dist)
                      sepY = sepY - (dy / dist)
                      sepCount = sepCount + 1
                    }
                    if (dist < perceptionRadius && dist > 0.001) {
                      aliX = aliX + other.vx
                      aliY = aliY + other.vy
                      aliCount = aliCount + 1

                      cohX = cohX + other.x
                      cohY = cohY + other.y
                      cohCount = cohCount + 1
                    }
                  }
                } else if (b.typeId == 1) {
                  if (other.typeId == 0 && dist < perceptionRadius * 2.0 && dist > 0.001) {
                    cohX = cohX + other.x
                    cohY = cohY + other.y
                    cohCount = cohCount + 1
                  }
                }
              }
            }
          }
        }
      }

      if (sepCount > 0) {
        sepX = sepX / sepCount
        sepY = sepY / sepCount
        let len = Math.sqrt(sepX * sepX + sepY * sepY)
        if (len > 0.001) {
          sepX = (sepX / len) * maxSpeed - b.vx
          sepY = (sepY / len) * maxSpeed - b.vy
        }
      }

      if (aliCount > 0) {
        aliX = aliX / aliCount
        aliY = aliY / aliCount
        let len = Math.sqrt(aliX * aliX + aliY * aliY)
        if (len > 0.001) {
          aliX = (aliX / len) * maxSpeed - b.vx
          aliY = (aliY / len) * maxSpeed - b.vy
        }
      }

      if (cohCount > 0) {
        let targetX = cohX / cohCount - b.x
        let targetY = cohY / cohCount - b.y
        let len = Math.sqrt(targetX * targetX + targetY * targetY)
        if (len > 0.001) {
          cohX = (targetX / len) * maxSpeed - b.vx
          cohY = (targetY / len) * maxSpeed - b.vy
        }
      }

      if (fleeCount > 0) {
        let len = Math.sqrt(fleeX * fleeX + fleeY * fleeY)
        if (len > 0.001) {
          fleeX = (fleeX / len) * (maxSpeed * 1.3) - b.vx
          fleeY = (fleeY / len) * (maxSpeed * 1.3) - b.vy
        }
      }

      if (foodCount > 0) {
        let targetX = foodX / foodCount - b.x
        let targetY = foodY / foodCount - b.y
        let len = Math.sqrt(targetX * targetX + targetY * targetY)
        if (len > 0.001) {
          foodX = (targetX / len) * maxSpeed - b.vx
          foodY = (targetY / len) * maxSpeed - b.vy
        }
      }

      let mut ax = sepX * separationWeight + aliX * alignmentWeight + cohX * cohesionWeight + fleeX * predatorWeight + foodX * 1.5
      let mut ay = sepY * separationWeight + aliY * alignmentWeight + cohY * cohesionWeight + fleeY * predatorWeight + foodY * 1.5

      let accMag = Math.sqrt(ax * ax + ay * ay)
      if (accMag > maxForce) {
        ax = (ax / accMag) * maxForce
        ay = (ay / accMag) * maxForce
      }

      b.ax = ax
      b.ay = ay

      b.vx = b.vx + b.ax
      b.vy = b.vy + b.ay

      let speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy)
      let currentMaxSpeed = b.typeId == 1 ? maxSpeed * 1.1 : maxSpeed
      if (speed > currentMaxSpeed) {
        b.vx = (b.vx / speed) * currentMaxSpeed
        b.vy = (b.vy / speed) * currentMaxSpeed
      }

      b.x = b.x + b.vx
      b.y = b.y + b.vy

      if (b.x < 0) b.x = b.x + CANVAS_W
      if (b.x > CANVAS_W) b.x = b.x - CANVAS_W
      if (b.y < 0) b.y = b.y + CANVAS_H
      if (b.y > CANVAS_H) b.y = b.y - CANVAS_H
    }
  }
}

function updateHUD() {
  let elBoid = getElementById("hud-boids")
  let elPred = getElementById("hud-predators")
  let elFood = getElementById("hud-food")

  let mut nBoids = 0
  let mut nPreds = 0
  let mut nFoods = 0
  for (let mut i = 0; i < boids.length; i = i + 1) {
    if (boids[i].typeId == 0) nBoids = nBoids + 1
    else if (boids[i].typeId == 1) nPreds = nPreds + 1
    else if (boids[i].typeId == 2) nFoods = nFoods + 1
  }

  if (elBoid) elBoid.innerText = to_string(nBoids)
  if (elPred) elPred.innerText = to_string(nPreds)
  if (elFood) elFood.innerText = to_string(nFoods)
}

function drawCanvas() {
  let cvs = getElementById("boids-canvas")
  if (cvs) {
    if (cvs.width != CANVAS_W) {
      cvs.width = CANVAS_W
      cvs.height = CANVAS_H
    }
    let ctx = cvs.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#020617"
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

      if (showSpatialGrid) {
        ctx.strokeStyle = "rgba(30, 41, 59, 0.6)"
        ctx.lineWidth = 1
        for (let mut c = 0; c <= COLS; c = c + 1) {
          ctx.beginPath()
          ctx.moveTo(c * GRID_CELL_SIZE, 0)
          ctx.lineTo(c * GRID_CELL_SIZE, CANVAS_H)
          ctx.stroke()
        }
        for (let mut r = 0; r <= ROWS; r = r + 1) {
          ctx.beginPath()
          ctx.moveTo(0, r * GRID_CELL_SIZE)
          ctx.lineTo(CANVAS_W, r * GRID_CELL_SIZE)
          ctx.stroke()
        }
      }

      for (let mut i = 0; i < boids.length; i = i + 1) {
        let b = boids[i]
        let angle = Math.atan2(b.vy, b.vx)

        if (b.typeId == 0) {
          ctx.save()
          ctx.translate(b.x, b.y)
          ctx.rotate(angle)

          if (showPerception && i < 15) {
            ctx.strokeStyle = "rgba(99, 102, 241, 0.25)"
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.arc(0, 0, perceptionRadius, 0, 6.283)
            ctx.stroke()
          }

          ctx.fillStyle = concat("hsl(", concat(to_string(b.hue), ", 85%, 60%)"))
          ctx.beginPath()
          ctx.moveTo(8, 0)
          ctx.lineTo(-6, -4)
          ctx.lineTo(-4, 0)
          ctx.lineTo(-6, 4)
          ctx.closePath()
          ctx.fill()
          ctx.restore()
        } else if (b.typeId == 1) {
          ctx.save()
          ctx.translate(b.x, b.y)
          ctx.rotate(angle)

          ctx.fillStyle = "#ef4444"
          ctx.shadowColor = "#f87171"
          ctx.shadowBlur = 10
          ctx.beginPath()
          ctx.moveTo(14, 0)
          ctx.lineTo(-10, -7)
          ctx.lineTo(-6, 0)
          ctx.lineTo(-10, 7)
          ctx.closePath()
          ctx.fill()
          ctx.shadowBlur = 0
          ctx.restore()
        } else if (b.typeId == 2) {
          ctx.fillStyle = "#22c55e"
          ctx.shadowColor = "#4ade80"
          ctx.shadowBlur = 12
          ctx.beginPath()
          ctx.arc(b.x, b.y, 6, 0, 6.283)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }
    }
  }
}

function startLoop() {
  stopLoop()
  isRunning = true
  animTimerId = setInterval(fn() {
    if (isRunning) {
      updatePhysics()
      updateHUD()
      drawCanvas()
    }
  }, 25)
}

function stopLoop() {
  if (animTimerId != 0) {
    clearInterval(animTimerId)
    animTimerId = 0
  }
}

function handleCanvasClick(e: any) {
  let cvs = getElementById("boids-canvas")
  if (cvs) {
    let rect = cvs.getBoundingClientRect()
    let mx = e.clientX - rect.left
    let my = e.clientY - rect.top
    if (mx >= 0 && mx <= CANVAS_W && my >= 0 && my <= CANVAS_H) {
      if (activeClickTool == "food") {
        boids.push(createBoid(mx, my, 2))
      } else if (activeClickTool == "predator") {
        boids.push(createBoid(mx, my, 1))
      } else if (activeClickTool == "boid") {
        for (let mut k = 0; k < 10; k = k + 1) {
          boids.push(createBoid(mx + (Math.random() - 0.5) * 20, my + (Math.random() - 0.5) * 20, 0))
        }
      }
      updateHUD()
      drawCanvas()
    }
  }
}

function renderUI() {
  let vnode = h("div", { className: "min-h-screen bg-slate-950 text-slate-100 p-4 font-sans space-y-4 max-w-7xl mx-auto" }, [
    h("div", { className: "flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl" }, [
      h("div", { className: "flex items-center space-x-3" }, [
        h("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-cyan-500/20" }, "🦅"),
        h("div", {}, [
          h("h1", { className: "text-lg font-black tracking-tight text-white flex items-center gap-2 uppercase italic" }, [
            "TypeLang Boids & Artificial Life Engine",
            h("span", { className: "text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold not-italic" }, "Spatial Hash O(N)")
          ]),
          h("p", { className: "text-xs text-slate-400" }, "Reynolds' Flocking Behaviors with Spatial Grid Partitioning & Predator/Attractor Dynamics")
        ])
      ]),

      h("div", { className: "flex flex-wrap items-center gap-2" }, [
        h("button", {
          className: "px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition shadow-lg shadow-indigo-900/30 cursor-pointer active:scale-95",
          onClick: fn() {
            for (let mut k = 0; k < 50; k = k + 1) {
              boids.push(createBoid(CANVAS_W / 2 + (Math.random() - 0.5) * 100, CANVAS_H / 2 + (Math.random() - 0.5) * 100, 0))
            }
            updateHUD()
            drawCanvas()
          }
        }, "➕ Add 50 Boids"),
        h("button", {
          className: "px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition shadow-lg shadow-rose-900/30 cursor-pointer active:scale-95",
          onClick: fn() {
            boids.push(createBoid(Math.random() * CANVAS_W, Math.random() * CANVAS_H, 1))
            updateHUD()
            drawCanvas()
          }
        }, "🦖 Add Predator"),
        h("button", {
          className: "px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition shadow-lg shadow-emerald-900/30 cursor-pointer active:scale-95",
          onClick: fn() {
            boids.push(createBoid(Math.random() * CANVAS_W, Math.random() * CANVAS_H, 2))
            updateHUD()
            drawCanvas()
          }
        }, "🍏 Add Food"),
        h("button", {
          className: "px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition border border-slate-700 cursor-pointer",
          onClick: fn() { initSimulation(); updateHUD(); drawCanvas() }
        }, "🔄 Reset World")
      ])
    ]),

    h("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono" }, [
      h("div", { className: "p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2" }, [
        h("div", { className: "flex justify-between font-bold text-slate-400" }, [
          h("span", {}, "Separation Weight"),
          h("span", { className: "text-indigo-400" }, to_string(separationWeight))
        ]),
        h("input", {
          type: "range", min: "0", max: "50", value: to_string(Math.floor(separationWeight * 10)),
          className: "w-full accent-indigo-500 cursor-pointer",
          onInput: fn(e: any) { separationWeight = (e.target.value / 10.0); renderUI() }
        }, ""),

        h("div", { className: "flex justify-between font-bold text-slate-400 pt-1" }, [
          h("span", {}, "Alignment Weight"),
          h("span", { className: "text-indigo-400" }, to_string(alignmentWeight))
        ]),
        h("input", {
          type: "range", min: "0", max: "50", value: to_string(Math.floor(alignmentWeight * 10)),
          className: "w-full accent-indigo-500 cursor-pointer",
          onInput: fn(e: any) { alignmentWeight = (e.target.value / 10.0); renderUI() }
        }, "")
      ]),

      h("div", { className: "p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2" }, [
        h("div", { className: "flex justify-between font-bold text-slate-400" }, [
          h("span", {}, "Cohesion Weight"),
          h("span", { className: "text-indigo-400" }, to_string(cohesionWeight))
        ]),
        h("input", {
          type: "range", min: "0", max: "50", value: to_string(Math.floor(cohesionWeight * 10)),
          className: "w-full accent-indigo-500 cursor-pointer",
          onInput: fn(e: any) { cohesionWeight = (e.target.value / 10.0); renderUI() }
        }, ""),

        h("div", { className: "flex justify-between font-bold text-slate-400 pt-1" }, [
          h("span", {}, "Predator Flee Weight"),
          h("span", { className: "text-rose-400" }, to_string(predatorWeight))
        ]),
        h("input", {
          type: "range", min: "0", max: "80", value: to_string(Math.floor(predatorWeight * 10)),
          className: "w-full accent-rose-500 cursor-pointer",
          onInput: fn(e: any) { predatorWeight = (e.target.value / 10.0); renderUI() }
        }, "")
      ]),

      h("div", { className: "p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2" }, [
        h("div", { className: "flex justify-between font-bold text-slate-400" }, [
          h("span", {}, "Perception Radius"),
          h("span", { className: "text-cyan-400" }, concat(to_string(Math.floor(perceptionRadius)), "px"))
        ]),
        h("input", {
          type: "range", min: "15", max: "120", value: to_string(Math.floor(perceptionRadius)),
          className: "w-full accent-cyan-500 cursor-pointer",
          onInput: fn(e: any) { perceptionRadius = (e.target.value * 1.0); renderUI() }
        }, ""),

        h("div", { className: "flex justify-between font-bold text-slate-400 pt-1" }, [
          h("span", {}, "Max Speed"),
          h("span", { className: "text-cyan-400" }, to_string(maxSpeed))
        ]),
        h("input", {
          type: "range", min: "10", max: "100", value: to_string(Math.floor(maxSpeed * 10)),
          className: "w-full accent-cyan-500 cursor-pointer",
          onInput: fn(e: any) { maxSpeed = (e.target.value / 10.0); renderUI() }
        }, "")
      ]),

      h("div", { className: "p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2" }, [
        h("div", { className: "text-[10px] uppercase font-bold text-slate-400" }, "Canvas Click Tool"),
        h("div", { className: "flex gap-1" }, [
          h("button", {
            className: activeClickTool == "food" ? "flex-1 py-1 rounded bg-emerald-600 text-white font-bold cursor-pointer" : "flex-1 py-1 rounded bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer",
            onClick: fn() { activeClickTool = "food"; renderUI() }
          }, "🍏 Food"),
          h("button", {
            className: activeClickTool == "predator" ? "flex-1 py-1 rounded bg-rose-600 text-white font-bold cursor-pointer" : "flex-1 py-1 rounded bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer",
            onClick: fn() { activeClickTool = "predator"; renderUI() }
          }, "🦖 Predator"),
          h("button", {
            className: activeClickTool == "boid" ? "flex-1 py-1 rounded bg-indigo-600 text-white font-bold cursor-pointer" : "flex-1 py-1 rounded bg-slate-950 text-slate-400 hover:text-slate-200 cursor-pointer",
            onClick: fn() { activeClickTool = "boid"; renderUI() }
          }, "🦅 Flock")
        ]),

        h("div", { className: "flex gap-2 pt-1" }, [
          h("button", {
            className: showSpatialGrid ? "flex-1 py-1 rounded bg-slate-800 text-cyan-400 border border-cyan-500/40 cursor-pointer" : "flex-1 py-1 rounded bg-slate-950 text-slate-500 cursor-pointer",
            onClick: fn() { showSpatialGrid = !showSpatialGrid; renderUI(); drawCanvas() }
          }, showSpatialGrid ? "🌐 Grid ON" : "🌐 Grid OFF"),
          h("button", {
            className: showPerception ? "flex-1 py-1 rounded bg-slate-800 text-indigo-400 border border-indigo-500/40 cursor-pointer" : "flex-1 py-1 rounded bg-slate-950 text-slate-500 cursor-pointer",
            onClick: fn() { showPerception = !showPerception; renderUI(); drawCanvas() }
          }, showPerception ? "👁 Radar ON" : "👁 Radar OFF")
        ])
      ])
    ]),

    h("div", { className: "relative bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-2xl space-y-2" }, [
      h("div", { className: "flex justify-between items-center text-xs font-mono text-slate-400 border-b border-slate-800/80 pb-2" }, [
        h("span", {}, "💡 Tip: Click on canvas to spawn selected tool entities (Food, Predator, or Boid Flock)."),
        h("button", {
          className: isRunning ? "px-3 py-1 rounded-lg bg-amber-600/30 text-amber-400 border border-amber-500/40 font-bold cursor-pointer" : "px-3 py-1 rounded-lg bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 font-bold cursor-pointer",
          onClick: fn() { isRunning = !isRunning; renderUI() }
        }, isRunning ? "⏸ Pause Physics" : "▶ Resume Physics")
      ]),
      h("div", { className: "flex justify-center overflow-x-auto p-1" }, [
        h("canvas", {
          id: "boids-canvas",
          width: "870",
          height: "500",
          className: "rounded-xl bg-slate-950 border border-slate-800 shadow-inner cursor-crosshair touch-none"
        }, "")
      ])
    ]),

    h("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs" }, [
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "Active Boids"),
        h("div", { id: "hud-boids", className: "text-lg font-bold text-indigo-400" }, "0")
      ]),
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "Predators"),
        h("div", { id: "hud-predators", className: "text-lg font-bold text-rose-400" }, "0")
      ]),
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "Food Attractors"),
        h("div", { id: "hud-food", className: "text-lg font-bold text-emerald-400" }, "0")
      ]),
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "Spatial Hashing Grid"),
        h("div", { className: "text-sm font-bold text-cyan-400 pt-0.5" }, concat("15x9 Cells (", concat(to_string(COLS * ROWS), " Total)")))
      ])
    ])
  ])

  mount("app-root", vnode)

  let cvs = getElementById("boids-canvas")
  if (cvs) {
    cvs.onclick = handleCanvasClick
  }

  drawCanvas()
}

initSimulation()
renderUI()
startLoop()

println("TypeLang Boids & Artificial Life Engine Initialized!")
`
  };
