import { ExampleProgram } from "./types";

export const example19TrafficFsmNetwork: ExampleProgram = {
    id: 'traffic_fsm_network',
    name: '19. Type-Safe Finite State Machine (FSM) & Smart Traffic Control Network',
    category: 'Interactive Web Apps',
    description: 'Autonomous 4-way intersection simulator modeled with Algebraic Data Types and GADT-inspired state transitions. Features type-safe event dispatching, pedestrian crossings, emergency vehicle priority overrides, sensor detection, and interactive 2D canvas visualization.',
    code: `// ============================================================================
// TypeLang Type-Safe Finite State Machine & Smart Traffic Control Network
// ============================================================================

import DOM.{ h, mount, getElementById }

// ----------------------------------------------------------------------------
// 1. Algebraic State & Event Definitions (FSM)
// ----------------------------------------------------------------------------

type Phase =
  | NS_Green
  | NS_Yellow
  | All_Red_To_EW
  | EW_Green
  | EW_Yellow
  | All_Red_To_NS
  | Emergency_Override(direction: string)
  | Pedestrian_Crossing(axis: string)

type FSMEvent =
  | Tick(delta: number)
  | CarArrived(lane: string)
  | PedestrianButton(axis: string)
  | EmergencyTrigger(direction: string)
  | EmergencyCleared
  | ResetIntersection

type LightColor =
  | LightRed
  | LightYellow
  | LightGreen

type Direction =
  | North
  | South
  | East
  | West

// ----------------------------------------------------------------------------
// 2. State & Simulation Configuration
// ----------------------------------------------------------------------------

let mut currentPhase: Phase = NS_Green
let mut phaseTimer = 6.0
let mut totalVehiclesPassed = 0
let mut pendingPedestrianNS = false
let mut pendingPedestrianEW = false
let mut emergencyActive = false
let mut emergencyDir = "North"
let mut autoSpawnCars = true
let mut spawnTimer = 0.0

// Phase duration settings (seconds)
let GREEN_DURATION = 6.0
let YELLOW_DURATION = 2.5
let ALL_RED_DURATION = 1.2
let PEDESTRIAN_DURATION = 5.0

// ----------------------------------------------------------------------------
// 3. Vehicles in Simulation
// ----------------------------------------------------------------------------

type Vehicle = {
  id: number,
  mut x: number,
  mut y: number,
  mut vx: number,
  mut vy: number,
  lane: string,
  color: string,
  isEmergency: boolean
}

let mut vehicles: [Vehicle] = []
let mut nextVehicleId = 1

// Canvas Dimensions
let CANVAS_W = 600
let CANVAS_H = 460
let CENTER_X = 300
let CENTER_Y = 230
let ROAD_W = 100

// ----------------------------------------------------------------------------
// 4. Type-Safe Transition Reducer (Pattern Matching FSM)
// ----------------------------------------------------------------------------

function getLightForLanes(phase: Phase): { ns: LightColor, ew: LightColor, pedNS: boolean, pedEW: boolean } {
  match (phase) {
    NS_Green => {
      { ns: LightGreen, ew: LightRed, pedNS: false, pedEW: false }
    }
    NS_Yellow => {
      { ns: LightYellow, ew: LightRed, pedNS: false, pedEW: false }
    }
    All_Red_To_EW => {
      { ns: LightRed, ew: LightRed, pedNS: false, pedEW: false }
    }
    EW_Green => {
      { ns: LightRed, ew: LightGreen, pedNS: false, pedEW: false }
    }
    EW_Yellow => {
      { ns: LightRed, ew: LightYellow, pedNS: false, pedEW: false }
    }
    All_Red_To_NS => {
      { ns: LightRed, ew: LightRed, pedNS: false, pedEW: false }
    }
    Emergency_Override(dir) => {
      if (dir == "North" || dir == "South") {
        { ns: LightGreen, ew: LightRed, pedNS: false, pedEW: false }
      } else {
        { ns: LightRed, ew: LightGreen, pedNS: false, pedEW: false }
      }
    }
    Pedestrian_Crossing(axis) => {
      if (axis == "NS") {
        { ns: LightRed, ew: LightRed, pedNS: true, pedEW: false }
      } else {
        { ns: LightRed, ew: LightRed, pedNS: false, pedEW: true }
      }
    }
  }
}

function transitionFSM(event: FSMEvent) {
  match (event) {
    EmergencyTrigger(dir) => {
      emergencyActive = true
      emergencyDir = dir
      currentPhase = Emergency_Override(dir)
      phaseTimer = 8.0
      spawnEmergencyVehicle(dir)
    }
    EmergencyCleared => {
      emergencyActive = false
      currentPhase = All_Red_To_NS
      phaseTimer = ALL_RED_DURATION
    }
    PedestrianButton(axis) => {
      if (axis == "NS") {
        pendingPedestrianNS = true
      } else {
        pendingPedestrianEW = true
      }
    }
    ResetIntersection => {
      currentPhase = NS_Green
      phaseTimer = GREEN_DURATION
      pendingPedestrianNS = false
      pendingPedestrianEW = false
      emergencyActive = false
      vehicles = []
    }
    CarArrived(lane) => {
      spawnVehicle(lane, false)
    }
    Tick(dt) => {
      phaseTimer = phaseTimer - dt
      if (phaseTimer <= 0.0) {
        // Evaluate next state based on current phase and pending requests
        match (currentPhase) {
          NS_Green => {
            currentPhase = NS_Yellow
            phaseTimer = YELLOW_DURATION
          }
          NS_Yellow => {
            if (pendingPedestrianNS) {
              pendingPedestrianNS = false
              currentPhase = Pedestrian_Crossing("NS")
              phaseTimer = PEDESTRIAN_DURATION
            } else {
              currentPhase = All_Red_To_EW
              phaseTimer = ALL_RED_DURATION
            }
          }
          Pedestrian_Crossing(axis) => {
            if (axis == "NS") {
              currentPhase = All_Red_To_EW
              phaseTimer = ALL_RED_DURATION
            } else {
              currentPhase = All_Red_To_NS
              phaseTimer = ALL_RED_DURATION
            }
          }
          All_Red_To_EW => {
            currentPhase = EW_Green
            phaseTimer = GREEN_DURATION
          }
          EW_Green => {
            currentPhase = EW_Yellow
            phaseTimer = YELLOW_DURATION
          }
          EW_Yellow => {
            if (pendingPedestrianEW) {
              pendingPedestrianEW = false
              currentPhase = Pedestrian_Crossing("EW")
              phaseTimer = PEDESTRIAN_DURATION
            } else {
              currentPhase = All_Red_To_NS
              phaseTimer = ALL_RED_DURATION
            }
          }
          All_Red_To_NS => {
            currentPhase = NS_Green
            phaseTimer = GREEN_DURATION
          }
          Emergency_Override(dir) => {
            emergencyActive = false
            currentPhase = All_Red_To_NS
            phaseTimer = ALL_RED_DURATION
          }
        }
      }
    }
  }
}

function getPhaseLabel(phase: Phase): string {
  match (phase) {
    NS_Green => "North-South Green (Flowing)"
    NS_Yellow => "North-South Yellow (Clearing)"
    All_Red_To_EW => "All Red Interval (Safety Buffer)"
    EW_Green => "East-West Green (Flowing)"
    EW_Yellow => "East-West Yellow (Clearing)"
    All_Red_To_NS => "All Red Interval (Safety Buffer)"
    Emergency_Override(dir) => concat("🚨 EMERGENCY OVERRIDE (", concat(dir, ")"))
    Pedestrian_Crossing(axis) => concat("🚶 PEDESTRIAN CROSSING (", concat(axis, ")"))
  }
}

// ----------------------------------------------------------------------------
// 5. Vehicle Spawning & Physics Engine
// ----------------------------------------------------------------------------

function spawnVehicle(lane: string, isEmergency: boolean) {
  let id = nextVehicleId
  nextVehicleId = nextVehicleId + 1

  let colors = ["#38bdf8", "#818cf8", "#34d399", "#f59e0b", "#e11d48", "#a855f7"]
  let randColor = isEmergency ? "#ef4444" : colors[Math.floor(Math.random() * colors.length)]

  let speed = isEmergency ? 4.5 : (1.8 + Math.random() * 0.8)

  if (lane == "North") {
    // Coming from North going South (Driver's Right lane = West side of screen)
    let v: Vehicle = {
      id: id,
      x: CENTER_X - 20,
      y: -30,
      vx: 0,
      vy: speed,
      lane: "North",
      color: randColor,
      isEmergency: isEmergency
    }
    vehicles.push(v)
  } else if (lane == "South") {
    // Coming from South going North (Driver's Right lane = East side of screen)
    let v: Vehicle = {
      id: id,
      x: CENTER_X + 20,
      y: CANVAS_H + 30,
      vx: 0,
      vy: -speed,
      lane: "South",
      color: randColor,
      isEmergency: isEmergency
    }
    vehicles.push(v)
  } else if (lane == "East") {
    // Coming from East going West
    let v: Vehicle = {
      id: id,
      x: CANVAS_W + 30,
      y: CENTER_Y - 20,
      vx: -speed,
      vy: 0,
      lane: "East",
      color: randColor,
      isEmergency: isEmergency
    }
    vehicles.push(v)
  } else if (lane == "West") {
    // Coming from West going East
    let v: Vehicle = {
      id: id,
      x: -30,
      y: CENTER_Y + 20,
      vx: speed,
      vy: 0,
      lane: "West",
      color: randColor,
      isEmergency: isEmergency
    }
    vehicles.push(v)
  }
}

function spawnEmergencyVehicle(dir: string) {
  spawnVehicle(dir, true)
}

function updateVehicles(lights: { ns: LightColor, ew: LightColor, pedNS: boolean, pedEW: boolean }) {
  let nextVehicles: [Vehicle] = []

  let stopNS_North = CENTER_Y - ROAD_W / 2 - 15
  let stopNS_South = CENTER_Y + ROAD_W / 2 + 15
  let stopEW_West = CENTER_X - ROAD_W / 2 - 15
  let stopEW_East = CENTER_X + ROAD_W / 2 + 15

  for (let mut i = 0; i < vehicles.length; i = i + 1) {
    let v = vehicles[i]
    let mut canMove = true

    // Check Traffic Lights (Emergency vehicles disregard red lights if in priority lane)
    if (v.lane == "North") {
      let isRed = lights.ns == LightRed
      if (isRed && !v.isEmergency) {
        if (v.y < stopNS_North && (v.y + v.vy >= stopNS_North - 5)) {
          canMove = false
        }
      }
      // Check vehicle directly in front
      for (let mut j = 0; j < vehicles.length; j = j + 1) {
        let other = vehicles[j]
        if (other.id != v.id && other.lane == "North") {
          if (other.y > v.y && other.y - v.y < 35) {
            canMove = false
          }
        }
      }
    } else if (v.lane == "South") {
      let isRed = lights.ns == LightRed
      if (isRed && !v.isEmergency) {
        if (v.y > stopNS_South && (v.y + v.vy <= stopNS_South + 5)) {
          canMove = false
        }
      }
      for (let mut j = 0; j < vehicles.length; j = j + 1) {
        let other = vehicles[j]
        if (other.id != v.id && other.lane == "South") {
          if (other.y < v.y && v.y - other.y < 35) {
            canMove = false
          }
        }
      }
    } else if (v.lane == "West") {
      let isRed = lights.ew == LightRed
      if (isRed && !v.isEmergency) {
        if (v.x < stopEW_West && (v.x + v.vx >= stopEW_West - 5)) {
          canMove = false
        }
      }
      for (let mut j = 0; j < vehicles.length; j = j + 1) {
        let other = vehicles[j]
        if (other.id != v.id && other.lane == "West") {
          if (other.x > v.x && other.x - v.x < 35) {
            canMove = false
          }
        }
      }
    } else if (v.lane == "East") {
      let isRed = lights.ew == LightRed
      if (isRed && !v.isEmergency) {
        if (v.x > stopEW_East && (v.x + v.vx <= stopEW_East + 5)) {
          canMove = false
        }
      }
      for (let mut j = 0; j < vehicles.length; j = j + 1) {
        let other = vehicles[j]
        if (other.id != v.id && other.lane == "East") {
          if (other.x < v.x && v.x - other.x < 35) {
            canMove = false
          }
        }
      }
    }

    if (canMove) {
      v.x = v.x + v.vx
      v.y = v.y + v.vy
    }

    // Keep if within bounds
    let isInside = v.x >= -60 && v.x <= CANVAS_W + 60 && v.y >= -60 && v.y <= CANVAS_H + 60
    if (isInside) {
      nextVehicles.push(v)
    } else {
      totalVehiclesPassed = totalVehiclesPassed + 1
    }
  }

  vehicles = nextVehicles
}

// ----------------------------------------------------------------------------
// 6. Virtual DOM UI & Interactive Control Deck
// ----------------------------------------------------------------------------

function renderUI() {
  let vnode = h("div", { className: "p-4 max-w-5xl mx-auto space-y-4 font-sans text-slate-100 select-none" }, [
    // Top Banner / Telemetry HUD
    h("div", { className: "flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl" }, [
      h("div", { className: "space-y-1" }, [
        h("div", { className: "flex items-center space-x-2" }, [
          h("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider" },
            "Type-Safe FSM Engine"
          ),
          h("span", { id: "emergency-tag", className: "px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/60" },
            "Normal Autonomous Operation"
          )
        ]),
        h("h1", { className: "text-2xl font-black bg-gradient-to-r from-amber-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent" },
          "Smart Traffic Control Network"
        )
      ]),

      // Stats Counters
      h("div", { className: "flex items-center gap-3 text-xs font-mono" }, [
        h("div", { className: "px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center" }, [
          h("div", { className: "text-[10px] text-slate-500 uppercase" }, "Phase Timer"),
          h("div", { id: "stat-timer", className: "text-base font-bold text-amber-400" }, "6.0s")
        ]),
        h("div", { className: "px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center" }, [
          h("div", { className: "text-[10px] text-slate-500 uppercase" }, "Active Vehicles"),
          h("div", { id: "stat-cars", className: "text-base font-bold text-sky-400" }, "0")
        ]),
        h("div", { className: "px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-center" }, [
          h("div", { className: "text-[10px] text-slate-500 uppercase" }, "Throughput"),
          h("div", { id: "stat-passed", className: "text-base font-bold text-emerald-400" }, "0")
        ])
      ])
    ]),

    // Canvas Viewport & Status Bar
    h("div", { className: "relative bg-slate-950 rounded-2xl border border-slate-800 p-2 shadow-2xl flex flex-col items-center justify-center overflow-hidden" }, [
      h("canvas", {
        id: "traffic-canvas",
        width: to_string(CANVAS_W),
        height: to_string(CANVAS_H),
        className: "rounded-xl bg-slate-950 border border-slate-800 shadow-inner max-w-full"
      }, ""),
      
      // Floating Status Bar
      h("div", { className: "mt-2 flex flex-wrap items-center justify-between w-full px-2 text-[11px] text-slate-400 font-mono" }, [
        h("div", { className: "flex items-center space-x-2" }, [
          h("span", { className: "w-2 h-2 rounded-full bg-amber-400 animate-pulse" }, ""),
          h("span", { id: "active-phase-label", className: "font-semibold text-slate-200" }, getPhaseLabel(currentPhase))
        ]),
        h("div", { className: "flex items-center space-x-3" }, [
          h("span", { id: "ped-ns-tag", className: "text-slate-500" }, "Ped NS: Idle"),
          h("span", { id: "ped-ew-tag", className: "text-slate-500" }, "Ped EW: Idle")
        ])
      ])
    ]),

    // Interactive Dispatcher Control Deck
    h("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3" }, [
      // 1. Vehicle Spawning Controls
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5" }, [
        h("div", { className: "text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider" }, "🚗 Lane Vehicle Ingress"),
        h("div", { className: "grid grid-cols-2 gap-1.5" }, [
          h("button", {
            className: "py-1.5 px-2 bg-slate-800 hover:bg-sky-600/30 text-slate-200 font-semibold rounded-lg text-xs transition cursor-pointer border border-slate-700 font-mono",
            onClick: fn() { transitionFSM(CarArrived("North")) }
          }, "⬇ North Ingress"),
          h("button", {
            className: "py-1.5 px-2 bg-slate-800 hover:bg-sky-600/30 text-slate-200 font-semibold rounded-lg text-xs transition cursor-pointer border border-slate-700 font-mono",
            onClick: fn() { transitionFSM(CarArrived("South")) }
          }, "⬆ South Ingress"),
          h("button", {
            className: "py-1.5 px-2 bg-slate-800 hover:bg-sky-600/30 text-slate-200 font-semibold rounded-lg text-xs transition cursor-pointer border border-slate-700 font-mono",
            onClick: fn() { transitionFSM(CarArrived("West")) }
          }, "➡ West Ingress"),
          h("button", {
            className: "py-1.5 px-2 bg-slate-800 hover:bg-sky-600/30 text-slate-200 font-semibold rounded-lg text-xs transition cursor-pointer border border-slate-700 font-mono",
            onClick: fn() { transitionFSM(CarArrived("East")) }
          }, "⬅ East Ingress")
        ]),
        h("div", { className: "flex items-center justify-between text-xs font-mono text-slate-400 pt-1" }, [
          h("span", {}, "Traffic Flow:"),
          h("button", {
            id: "btn-auto-traffic",
            className: "px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-[10px] text-white font-bold cursor-pointer transition",
            onClick: fn() {
              autoSpawnCars = !autoSpawnCars
              let btn = getElementById("btn-auto-traffic")
              if (btn) {
                btn.innerText = autoSpawnCars ? "Auto-Traffic ON" : "Auto-Traffic OFF"
              }
            }
          }, "Auto-Traffic ON")
        ])
      ]),

      // 2. Pedestrian Crossing Signals
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5" }, [
        h("div", { className: "text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider" }, "🚶 Pedestrian Call Buttons"),
        h("div", { className: "flex flex-col gap-2" }, [
          h("button", {
            className: "py-2 px-3 bg-slate-800 hover:bg-emerald-600/30 text-slate-200 font-semibold rounded-xl text-xs transition cursor-pointer border border-slate-700 flex items-center justify-between font-mono",
            onClick: fn() {
              transitionFSM(PedestrianButton("NS"))
              updateUIHUD()
            }
          }, [
            h("span", {}, "North-South Crosswalk"),
            h("span", { className: "text-[10px] px-1.5 py-0.5 bg-slate-900 rounded text-emerald-400" }, "Request Walk")
          ]),
          h("button", {
            className: "py-2 px-3 bg-slate-800 hover:bg-emerald-600/30 text-slate-200 font-semibold rounded-xl text-xs transition cursor-pointer border border-slate-700 flex items-center justify-between font-mono",
            onClick: fn() {
              transitionFSM(PedestrianButton("EW"))
              updateUIHUD()
            }
          }, [
            h("span", {}, "East-West Crosswalk"),
            h("span", { className: "text-[10px] px-1.5 py-0.5 bg-slate-900 rounded text-emerald-400" }, "Request Walk")
          ])
        ])
      ]),

      // 3. Emergency Priority & Override
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5" }, [
        h("div", { className: "text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider" }, "🚨 Emergency Vehicle Preemption"),
        h("div", { className: "grid grid-cols-2 gap-1.5" }, [
          h("button", {
            className: "py-1.5 px-2 bg-rose-950/60 hover:bg-rose-900 text-rose-200 font-bold rounded-lg text-xs transition cursor-pointer border border-rose-800/50 font-mono flex items-center justify-center space-x-1",
            onClick: fn() {
              transitionFSM(EmergencyTrigger("North"))
              updateUIHUD()
            }
          }, "🚑 NS Siren (North)"),
          h("button", {
            className: "py-1.5 px-2 bg-rose-950/60 hover:bg-rose-900 text-rose-200 font-bold rounded-lg text-xs transition cursor-pointer border border-rose-800/50 font-mono flex items-center justify-center space-x-1",
            onClick: fn() {
              transitionFSM(EmergencyTrigger("West"))
              updateUIHUD()
            }
          }, "🚒 EW Siren (West)")
        ]),
        h("div", { className: "pt-1" }, [
          h("button", {
            className: "w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition cursor-pointer font-mono",
            onClick: fn() {
              transitionFSM(ResetIntersection)
              updateUIHUD()
            }
          }, "🔄 Reset FSM State Machine")
        ])
      ])
    ])
  ])

  mount("app-root", vnode)
}

function updateUIHUD() {
  let sTimer = getElementById("stat-timer")
  let sCars = getElementById("stat-cars")
  let sPassed = getElementById("stat-passed")
  let lblPhase = getElementById("active-phase-label")
  let tagPedNS = getElementById("ped-ns-tag")
  let tagPedEW = getElementById("ped-ew-tag")
  let tagEmergency = getElementById("emergency-tag")

  if (sTimer) sTimer.innerText = concat(to_string(Math.max(0, Math.ceil(phaseTimer * 10) / 10)), "s")
  if (sCars) sCars.innerText = to_string(vehicles.length)
  if (sPassed) sPassed.innerText = to_string(totalVehiclesPassed)
  if (lblPhase) lblPhase.innerText = getPhaseLabel(currentPhase)

  if (tagPedNS) {
    tagPedNS.innerText = pendingPedestrianNS ? "Ped NS: 🚶 Waiting" : "Ped NS: Idle"
    tagPedNS.className = pendingPedestrianNS ? "text-amber-400 font-bold" : "text-slate-500"
  }
  if (tagPedEW) {
    tagPedEW.innerText = pendingPedestrianEW ? "Ped EW: 🚶 Waiting" : "Ped EW: Idle"
    tagPedEW.className = pendingPedestrianEW ? "text-amber-400 font-bold" : "text-slate-500"
  }
  if (tagEmergency) {
    if (emergencyActive) {
      tagEmergency.innerText = concat("🚨 EMERGENCY VEHICLE INGRESS: ", emergencyDir)
      tagEmergency.className = "px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 font-bold animate-pulse"
    } else {
      tagEmergency.innerText = "Normal Autonomous Operation"
      tagEmergency.className = "px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/60"
    }
  }
}

// ----------------------------------------------------------------------------
// 7. Canvas 2D Rendering Engine (Intersection & Vehicles)
// ----------------------------------------------------------------------------

renderUI()

let canvas = getElementById("traffic-canvas")
if (canvas) {
  let ctx = canvas.getContext("2d")

  function drawIntersection(lights: { ns: LightColor, ew: LightColor, pedNS: boolean, pedEW: boolean }) {
    // 1. Clear Backdrop (Asphalt & Grass)
    ctx.fillStyle = "#090d16"
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Grass corners
    ctx.fillStyle = "#064e3b" // Deep Forest Green
    ctx.fillRect(0, 0, CENTER_X - ROAD_W / 2, CENTER_Y - ROAD_W / 2)
    ctx.fillRect(CENTER_X + ROAD_W / 2, 0, CENTER_X - ROAD_W / 2, CENTER_Y - ROAD_W / 2)
    ctx.fillRect(0, CENTER_Y + ROAD_W / 2, CENTER_X - ROAD_W / 2, CENTER_Y - ROAD_W / 2)
    ctx.fillRect(CENTER_X + ROAD_W / 2, CENTER_Y + ROAD_W / 2, CENTER_X - ROAD_W / 2, CENTER_Y - ROAD_W / 2)

    // Road Surface (Dark Asphalt)
    ctx.fillStyle = "#1e293b"
    // Vertical Road (North-South)
    ctx.fillRect(CENTER_X - ROAD_W / 2, 0, ROAD_W, CANVAS_H)
    // Horizontal Road (East-West)
    ctx.fillRect(0, CENTER_Y - ROAD_W / 2, CANVAS_W, ROAD_W)

    // Intersection Box
    ctx.fillStyle = "#1e293b"
    ctx.fillRect(CENTER_X - ROAD_W / 2, CENTER_Y - ROAD_W / 2, ROAD_W, ROAD_W)

    // Road Center Line Markers (Solid / Segments)
    ctx.strokeStyle = "#fbbf24" // Amber Center Lines
    ctx.lineWidth = 2

    // North segment
    for (let mut y = 0; y < CENTER_Y - ROAD_W / 2 - 12; y = y + 20) {
      ctx.beginPath()
      ctx.moveTo(CENTER_X, y)
      ctx.lineTo(CENTER_X, y + 10)
      ctx.stroke()
    }

    // South segment
    for (let mut y = CENTER_Y + ROAD_W / 2 + 12; y < CANVAS_H; y = y + 20) {
      ctx.beginPath()
      ctx.moveTo(CENTER_X, y)
      ctx.lineTo(CENTER_X, y + 10)
      ctx.stroke()
    }

    // West segment
    for (let mut x = 0; x < CENTER_X - ROAD_W / 2 - 12; x = x + 20) {
      ctx.beginPath()
      ctx.moveTo(x, CENTER_Y)
      ctx.lineTo(x + 10, CENTER_Y)
      ctx.stroke()
    }

    // East segment
    for (let mut x = CENTER_X + ROAD_W / 2 + 12; x < CANVAS_W; x = x + 20) {
      ctx.beginPath()
      ctx.moveTo(x, CENTER_Y)
      ctx.lineTo(x + 10, CENTER_Y)
      ctx.stroke()
    }

    // 2. Crosswalks
    function drawZebra(x1: number, y1: number, w: number, h: number, isVertical: boolean, isWalk: boolean) {
      ctx.fillStyle = isWalk ? "#34d399" : "#e2e8f0"
      let stripes = 6
      for (let mut i = 0; i < stripes; i = i + 1) {
        if (isVertical) {
          ctx.fillRect(x1, y1 + i * 16 + 2, w, 8)
        } else {
          ctx.fillRect(x1 + i * 16 + 2, y1, 8, h)
        }
      }
    }

    // North Crosswalk
    drawZebra(CENTER_X - ROAD_W / 2 + 4, CENTER_Y - ROAD_W / 2 - 14, ROAD_W - 8, 12, false, lights.pedNS)
    // South Crosswalk
    drawZebra(CENTER_X - ROAD_W / 2 + 4, CENTER_Y + ROAD_W / 2 + 2, ROAD_W - 8, 12, false, lights.pedNS)
    // West Crosswalk
    drawZebra(CENTER_X - ROAD_W / 2 - 14, CENTER_Y - ROAD_W / 2 + 4, 12, ROAD_W - 8, true, lights.pedEW)
    // East Crosswalk
    drawZebra(CENTER_X + ROAD_W / 2 + 2, CENTER_Y - ROAD_W / 2 + 4, 12, ROAD_W - 8, true, lights.pedEW)

    // 3. Traffic Light Gantry Renderers
    function drawTrafficLight(x: number, y: number, color: LightColor, label: string) {
      ctx.fillStyle = "#0f172a"
      ctx.strokeStyle = "#475569"
      ctx.lineWidth = 1.5
      ctx.fillRect(x - 12, y - 28, 24, 56)
      ctx.strokeRect(x - 12, y - 28, 24, 56)

      // Red bulb
      ctx.fillStyle = color == LightRed ? "#ef4444" : "#450a0a"
      ctx.shadowColor = color == LightRed ? "#ef4444" : "transparent"
      ctx.shadowBlur = color == LightRed ? 10 : 0
      ctx.beginPath()
      ctx.arc(x, y - 16, 6, 0, Math.PI * 2)
      ctx.fill()

      // Yellow bulb
      ctx.fillStyle = color == LightYellow ? "#f59e0b" : "#451a03"
      ctx.shadowColor = color == LightYellow ? "#f59e0b" : "transparent"
      ctx.shadowBlur = color == LightYellow ? 10 : 0
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()

      // Green bulb
      ctx.fillStyle = color == LightGreen ? "#10b981" : "#022c22"
      ctx.shadowColor = color == LightGreen ? "#10b981" : "transparent"
      ctx.shadowBlur = color == LightGreen ? 10 : 0
      ctx.beginPath()
      ctx.arc(x, y + 16, 6, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = 0
    }

    // North-South Lights
    drawTrafficLight(CENTER_X - ROAD_W / 2 - 22, CENTER_Y - ROAD_W / 2 - 20, lights.ns, "NS")
    drawTrafficLight(CENTER_X + ROAD_W / 2 + 22, CENTER_Y + ROAD_W / 2 + 20, lights.ns, "NS")

    // East-West Lights
    drawTrafficLight(CENTER_X + ROAD_W / 2 + 20, CENTER_Y - ROAD_W / 2 - 22, lights.ew, "EW")
    drawTrafficLight(CENTER_X - ROAD_W / 2 - 20, CENTER_Y + ROAD_W / 2 + 22, lights.ew, "EW")

    // 4. Render Vehicles
    for (let mut i = 0; i < vehicles.length; i = i + 1) {
      let v = vehicles[i]

      ctx.save()
      ctx.translate(v.x, v.y)

      if (v.lane == "North") {
        ctx.rotate(0)
      } else if (v.lane == "South") {
        ctx.rotate(Math.PI)
      } else if (v.lane == "West") {
        ctx.rotate(-Math.PI / 2)
      } else if (v.lane == "East") {
        ctx.rotate(Math.PI / 2)
      }

      // Car Body
      ctx.fillStyle = v.color
      ctx.shadowColor = v.isEmergency ? "#ef4444" : "transparent"
      ctx.shadowBlur = v.isEmergency ? 12 : 0

      // Rounded Vehicle Rect
      let w = 18
      let h = 30
      ctx.fillRect(-w / 2, -h / 2, w, h)

      // Windshield
      ctx.fillStyle = "#0f172a"
      ctx.fillRect(-w / 2 + 2, -h / 2 + 6, w - 4, 7)

      // Headlights
      ctx.fillStyle = "#fef08a"
      ctx.fillRect(-w / 2 + 1, h / 2 - 3, 4, 2)
      ctx.fillRect(w / 2 - 5, h / 2 - 3, 4, 2)

      // Emergency Strobe Flash
      if (v.isEmergency) {
        ctx.fillStyle = Math.random() > 0.5 ? "#38bdf8" : "#ef4444"
        ctx.beginPath()
        ctx.arc(0, 0, 4, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }
  }

  // Animation & Physics Loop
  let mut lastTime = 0
  function loop(timestamp: number) {
    let dt = lastTime == 0 ? 0.016 : Math.min(0.1, (timestamp - lastTime) / 1000)
    lastTime = timestamp

    // Tick FSM Clock
    transitionFSM(Tick(dt))

    // Auto Ingress Spawner
    if (autoSpawnCars) {
      spawnTimer = spawnTimer + dt
      if (spawnTimer >= 1.4) {
        spawnTimer = 0.0
        let lanes = ["North", "South", "East", "West"]
        let randomLane = lanes[Math.floor(Math.random() * lanes.length)]
        spawnVehicle(randomLane, false)
      }
    }

    let lights = getLightForLanes(currentPhase)
    updateVehicles(lights)
    drawIntersection(lights)
    updateUIHUD()

    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)
}

println("Type-Safe FSM & Smart Traffic Control Network Initialized Successfully!")
`
  };
