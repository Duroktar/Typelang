import { ExampleProgram } from "./types";

export const example41OutrunSynthwave: ExampleProgram = {
  id: "outrun_synthwave",
  name: "41. Outrun Synthwave 1986 (2.5D Pseudo-3D Highway & AI Demo Engine)",
  title: "41. Outrun Synthwave 1986 (2.5D Pseudo-3D Highway & AI Demo Engine)",
  category: "Games & Graphics",
  description: "A high-speed 2.5D pseudo-3D Outrun arcade racing engine in TypeLang featuring retro synthwave aesthetics with a glowing horizon sun/moon, parallax wireframe mountains, neon grid terrain, road elevation curves, interactive 1-Player & CPU AI Auto-Drive Demo Mode, traffic dodging, nitro turbo boost, and WebAudio synthwave chiptune soundtrack.",
  code: `import DOM.{ h, mount, getElementById, playRamp, playSequence, startMusic, stopMusic }
import Math.{ floor, max, min, abs, random, sqrt, cos, sin }

extern let window: any

// ============================================================================
// 1. Types & GADT Domain Models
// ============================================================================

type DriveMode =
  | ModePlayer: DriveMode
  | ModeDemoAI: DriveMode

type GameState =
  | StateReady: GameState
  | StateRacing: GameState
  | StateCrashed: GameState
  | StateGameOver: GameState
  | StateVictory: GameState

type Segment = {
  index: number,
  mut p1WorldX: number,
  mut p1WorldY: number,
  mut p1WorldZ: number,
  mut p1ScreenX: number,
  mut p1ScreenY: number,
  mut p1ScreenW: number,
  mut p1ScreenScale: number,
  mut p2WorldX: number,
  mut p2WorldY: number,
  mut p2WorldZ: number,
  mut p2ScreenX: number,
  mut p2ScreenY: number,
  mut p2ScreenW: number,
  mut p2ScreenScale: number,
  curve: number,
  mut clipY: number,
  spriteType: number, // 0: none, 1: palm, 2: pyramid, 3: billboard, 4: arch
  spriteX: number,
  colorDark: boolean
}

type TrafficCar = {
  id: number,
  mut x: number,
  mut z: number,
  mut speed: number,
  kind: number, // 0: DeLorean, 1: Countach, 2: CyberCruiser, 3: CyberTruck
  color: string,
  width: number
}

type SparkParticle = {
  mut x: number,
  mut y: number,
  mut vx: number,
  mut vy: number,
  mut life: number,
  mut maxLife: number,
  color: string,
  size: number
}

// ============================================================================
// 2. Constants & Game Engine State
// ============================================================================

let CANVAS_W = 640.0
let CANVAS_H = 380.0
let ROAD_WIDTH = 2000.0
let SEGMENT_LENGTH = 200.0
let TOTAL_SEGMENTS = 800
let DRAW_DISTANCE = 150
let CAMERA_HEIGHT = 1000.0
let CAMERA_DEPTH = 0.84 // 1 / tan((40 / 2) * PI / 180)

let mut state = {
  mut mode: 1, // 0: 1-Player Manual, 1: CPU AI Demo Mode
  mut gameState: 1, // 0: Ready, 1: Racing, 2: Crashed, 3: GameOver, 4: Victory
  mut score: 0,
  mut highScore: 184500,
  mut speed: 0.0,
  mut maxSpeed: 230.0, // MPH
  mut offRoadLimit: 75.0,
  mut playerX: 0.0, // -1.0 left edge to 1.0 right edge of road
  mut playerZ: 0.0, // track position
  mut centrifugal: 0.36,
  mut nitro: 100.0,
  mut isNitro: false,
  mut isBraking: false,
  mut steerInput: 0.0,
  mut gasInput: 0.0,
  mut brakeInput: 0.0,
  mut timeLeft: 60.0,
  mut stage: 1,
  mut stageDistance: 0.0,
  mut nextCheckpointZ: 40000.0, // at segment 200, 400, 600...
  mut distanceTraveled: 0.0,
  mut crashTimer: 0,
  mut animTick: 0,
  mut audioEnabled: true,
  mut musicEnabled: false,
  // AI Demo State
  mut aiTargetX: 0.0,
  mut aiNitroCooldown: 0,
  mut segments: [],
  mut traffic: [],
  mut particles: []
}

// ============================================================================
// 3. WebAudio Retro Synthwave Synthesizer & SFX
// ============================================================================

function playSynthSound(soundKey: string) {
  if (!state.audioEnabled) { return }

  if (soundKey == "engine_rev") {
    let _ = playRamp(80.0, 140.0, 0.08, "sawtooth", 0.04)
  } else if (soundKey == "nitro") {
    let _ = playRamp(440.0, 880.0, 0.15, "sine", 0.08)
  } else if (soundKey == "screech") {
    let _ = playRamp(900.0, 450.0, 0.1, "triangle", 0.05)
  } else if (soundKey == "checkpoint") {
    let _ = playSequence([523.0, 659.0, 784.0, 1046.0], 0.06, "sine", 0.12)
  } else if (soundKey == "crash") {
    let _ = playRamp(120.0, 30.0, 0.25, "sawtooth", 0.2)
  }
}

function toggleOutrunMusic() {
  state.musicEnabled = !state.musicEnabled
  if (state.musicEnabled) {
    let bass = [
      146.8, 146.8, 146.8, 146.8,
      116.5, 116.5, 116.5, 116.5,
      130.8, 130.8, 130.8, 130.8,
      110.0, 110.0, 110.0, 110.0
    ]
    let _ = startMusic("outrun_synthwave", bass, 130.0, "sawtooth", 0.03)
  } else {
    let _ = stopMusic("outrun_synthwave")
  }
  renderUI()
}

// ============================================================================
// 4. Track Generation & Road Segments
// ============================================================================

function buildTrack() {
  state.segments = []
  let mut currentY = 0.0

  for (let mut i = 0; i < TOTAL_SEGMENTS; i = i + 1) {
    let mut curve = 0.0
    let mut spriteType = 0
    let mut spriteX = 0.0

    // Curvature sections
    if (i > 80 && i < 180) {
      curve = 2.4 // Right curve
    } else if (i > 220 && i < 320) {
      curve = -2.8 // Left curve
    } else if (i > 360 && i < 440) {
      curve = 3.6 // Sharp right
    } else if (i > 460 && i < 540) {
      curve = -3.2 // Sharp left
    } else if (i > 580 && i < 680) {
      curve = 1.8 // Gentle sweep
    }

    // Hills & Elevation (Synthwave rollercoaster)
    if (i > 100 && i < 200) {
      currentY = Math.sin((i - 100) / 100.0 * 3.14159) * 1400.0
    } else if (i > 300 && i < 420) {
      currentY = Math.sin((i - 300) / 120.0 * 3.14159) * 1800.0
    } else if (i > 500 && i < 620) {
      currentY = Math.sin((i - 500) / 120.0 * 3.14159) * -1200.0
    } else {
      currentY = 0.0
    }

    // Roadside Scenery Placement
    if (i % 200 == 0 && i > 0) {
      spriteType = 4 // Checkpoint Arch
      spriteX = 0.0
    } else if (i % 16 == 0) {
      spriteType = 1 // Neon Palm Tree
      spriteX = (i % 32 == 0) ? -1.6 : 1.6
    } else if (i % 35 == 0) {
      spriteType = 2 // Holographic Pyramid
      spriteX = (i % 70 == 0) ? -2.2 : 2.2
    } else if (i % 55 == 0) {
      spriteType = 3 // Synthwave Billboard
      spriteX = (i % 110 == 0) ? -1.9 : 1.9
    }

    let z1 = i * SEGMENT_LENGTH
    let z2 = (i + 1) * SEGMENT_LENGTH

    let seg: Segment = {
      index: i,
      mut p1WorldX: 0.0,
      mut p1WorldY: currentY,
      mut p1WorldZ: z1,
      mut p1ScreenX: 0.0,
      mut p1ScreenY: 0.0,
      mut p1ScreenW: 0.0,
      mut p1ScreenScale: 0.0,
      mut p2WorldX: 0.0,
      mut p2WorldY: currentY,
      mut p2WorldZ: z2,
      mut p2ScreenX: 0.0,
      mut p2ScreenY: 0.0,
      mut p2ScreenW: 0.0,
      mut p2ScreenScale: 0.0,
      curve: curve,
      mut clipY: 0.0,
      spriteType: spriteType,
      spriteX: spriteX,
      colorDark: Math.floor(i / 3) % 2 == 0
    }
    state.segments.push(seg)
  }

  // Generate Traffic Vehicles
  state.traffic = []
  let colors = ["#00f0ff", "#ff007f", "#ffe600", "#a855f7", "#ffffff"]
  for (let mut c = 0; c < 14; c = c + 1) {
    let tCar: TrafficCar = {
      id: c,
      mut x: (c % 4 - 1.5) * 0.5, // Distribute across 4 lanes
      mut z: (c + 1) * 9000.0 + (c * 2300.0),
      mut speed: 110.0 + (c % 4) * 15.0,
      kind: c % 4,
      color: colors[c % 5],
      width: 140.0
    }
    state.traffic.push(tCar)
  }
}

// ============================================================================
// 5. 3D Camera Projection Math
// ============================================================================

function projectCoord(
  worldX: number, worldY: number, worldZ: number,
  camX: number, camY: number, camZ: number
): { sx: number, sy: number, sw: number, scale: number } {
  let transX = worldX - camX
  let transY = worldY - camY
  let transZ = worldZ - camZ

  if (transZ <= 0.001) {
    return { sx: 0.0, sy: 0.0, sw: 0.0, scale: 0.0 }
  }

  let scale = CAMERA_DEPTH / transZ
  let screenX = Math.floor((CANVAS_W / 2.0) + (scale * transX * CANVAS_W / 2.0))
  let screenY = Math.floor((CANVAS_H / 2.0) - (scale * transY * CANVAS_H / 2.0))
  let screenW = Math.floor(scale * ROAD_WIDTH * CANVAS_W / 2.0)

  return { sx: screenX, sy: screenY, sw: screenW, scale: scale }
}

// ============================================================================
// 6. CPU AI Driver Engine (Demo Mode)
// ============================================================================

function updateCpuPilot() {
  if (state.mode != 1 || state.gameState != 1) { return }

  let playerSegIndex = Math.floor(state.playerZ / SEGMENT_LENGTH) % TOTAL_SEGMENTS
  let lookAheadSegIndex = (playerSegIndex + 18) % TOTAL_SEGMENTS
  let aheadSegment = state.segments[lookAheadSegIndex]

  // Track Curvature Anticipation:
  // Counteract curve by leaning into apex
  let mut desiredX = 0.0
  if (aheadSegment.curve > 0.0) {
    desiredX = 0.45 // Apex on right turn
  } else if (aheadSegment.curve < 0.0) {
    desiredX = -0.45 // Apex on left turn
  }

  // Scan for traffic obstacles ahead
  for (let mut t = 0; t < Array.len(state.traffic); t = t + 1) {
    let car = state.traffic[t]
    let distZ = car.z - state.playerZ

    // Look at cars within danger bubble (0 to 3500 world units ahead)
    if (distZ > 0.0 && distZ < 3800.0) {
      let latDist = Math.abs(car.x - state.playerX)
      if (latDist < 0.42) {
        // Danger! Move away to adjacent lane
        if (car.x > 0.0) {
          desiredX = desiredX - 0.55
        } else {
          desiredX = desiredX + 0.55
        }
      }
    }
  }

  // Clamp desired X to stay safely on road
  if (desiredX < -0.8) { desiredX = -0.8 }
  if (desiredX > 0.8) { desiredX = 0.8 }
  state.aiTargetX = desiredX

  // Steer towards target
  let diffX = state.aiTargetX - state.playerX
  if (diffX > 0.06) {
    state.steerInput = 0.85
  } else if (diffX < -0.06) {
    state.steerInput = -0.85
  } else {
    state.steerInput = diffX * 8.0
  }

  // Throttle control
  state.gasInput = 1.0
  state.brakeInput = 0.0

  // If cornering too hard on sharp curve, ease off slightly
  if (Math.abs(aheadSegment.curve) > 3.0 && state.speed > 175.0) {
    state.gasInput = 0.6
  }

  // Nitro Boost Logic: fire nitro on open straights!
  if (state.aiNitroCooldown > 0) {
    state.aiNitroCooldown = state.aiNitroCooldown - 1
  } else if (state.nitro > 25.0 && Math.abs(aheadSegment.curve) < 1.0 && state.speed > 140.0) {
    state.isNitro = true
    state.aiNitroCooldown = 180 // Cooldown ticks
    playSynthSound("nitro")
  } else {
    state.isNitro = false
  }
}

// ============================================================================
// 7. Physics, Controls & Game Step
// ============================================================================

function triggerNitro() {
  if (state.nitro > 15.0 && !state.isNitro && state.gameState == 1) {
    state.isNitro = true
    playSynthSound("nitro")
  }
}

function handleSteer(dir: number) {
  state.steerInput = dir
  if (state.mode == 1) {
    // Player manually took the wheel: switch to 1-Player mode!
    state.mode = 0
    renderUI()
  }
}

function handleThrottle(gas: number) {
  state.gasInput = gas
  if (state.mode == 1) {
    state.mode = 0
    renderUI()
  }
}

function handleBrake(brake: number) {
  state.brakeInput = brake
  if (state.mode == 1) {
    state.mode = 0
    renderUI()
  }
}

function addSparks(px: number, py: number, color: string, count: number) {
  for (let mut i = 0; i < count; i = i + 1) {
    let p: SparkParticle = {
      mut x: px,
      mut y: py,
      mut vx: (Math.random() - 0.5) * 8.0,
      mut vy: -Math.random() * 6.0 - 2.0,
      mut life: 1.0,
      mut maxLife: 15.0 + Math.random() * 10.0,
      color: color,
      size: 2.0 + Math.random() * 2.5
    }
    state.particles.push(p)
  }
}

function gameStep() {
  state.animTick = state.animTick + 1

  if (state.gameState != 1) {
    // Update crash recovery
    if (state.gameState == 2) {
      state.crashTimer = state.crashTimer - 1
      if (state.crashTimer <= 0) {
        state.gameState = 1 // Resume
        state.speed = 40.0
      }
    }
    return
  }

  // CPU AI Pilot in Demo Mode
  updateCpuPilot()

  // Acceleration & Top Speed
  let mut maxS = state.maxSpeed
  let mut accelRate = 1.1

  if (state.isNitro && state.nitro > 0.0) {
    maxS = 265.0
    accelRate = 2.4
    state.nitro = Math.max(0.0, state.nitro - 0.4)
    if (state.nitro <= 0.0) { state.isNitro = false }
  } else {
    // Recharge nitro slowly
    state.nitro = Math.min(100.0, state.nitro + 0.06)
  }

  // Off-road penalty
  let offRoad = Math.abs(state.playerX) > 1.0
  if (offRoad) {
    maxS = state.offRoadLimit
    if (state.speed > 50.0 && state.animTick % 4 == 0) {
      addSparks(CANVAS_W / 2.0 + (state.playerX > 0.0 ? 50.0 : -50.0), CANVAS_H - 40.0, "#00f0ff", 3)
      playSynthSound("screech")
    }
  }

  // Speed integration
  if (state.gasInput > 0.0) {
    state.speed = Math.min(maxS, state.speed + accelRate * state.gasInput)
  } else if (state.brakeInput > 0.0) {
    state.speed = Math.max(0.0, state.speed - 2.5 * state.brakeInput)
    if (state.speed > 60.0 && state.animTick % 8 == 0) {
      playSynthSound("screech")
    }
  } else {
    state.speed = Math.max(0.0, state.speed - 0.5) // Natural rolling friction
  }

  // Current Road Segment
  let trackLen = TOTAL_SEGMENTS * SEGMENT_LENGTH
  state.playerZ = (state.playerZ + state.speed * 12.0) % trackLen
  state.distanceTraveled = state.distanceTraveled + state.speed * 0.05
  state.stageDistance = state.stageDistance + state.speed * 0.05

  let currentSegIndex = Math.floor(state.playerZ / SEGMENT_LENGTH) % TOTAL_SEGMENTS
  let currentSeg = state.segments[currentSegIndex]

  // Centrifugal curve force & steering
  let speedRatio = state.speed / state.maxSpeed
  state.playerX = state.playerX + (state.steerInput * 0.04 * (0.3 + 0.7 * speedRatio))
  state.playerX = state.playerX - (currentSeg.curve * speedRatio * speedRatio * 0.007)

  // Clamp limits
  if (state.playerX < -2.2) { state.playerX = -2.2 }
  if (state.playerX > 2.2) { state.playerX = 2.2 }

  // Checkpoint detection
  if (state.playerZ >= state.nextCheckpointZ && state.playerZ < state.nextCheckpointZ + 2500.0) {
    state.timeLeft = state.timeLeft + 30.0
    state.score = state.score + 10000
    state.stage = state.stage + 1
    state.nextCheckpointZ = (state.nextCheckpointZ + 40000.0) % trackLen
    playSynthSound("checkpoint")
    renderUI()
  }

  // Timer countdown
  state.timeLeft = Math.max(0.0, state.timeLeft - 0.016)
  if (state.timeLeft <= 0.0) {
    state.gameState = 3 // Game Over
    state.speed = 0.0
    playSynthSound("crash")
    renderUI()
    return
  }

  // Update Score based on distance & speed
  state.score = state.score + Math.floor(state.speed * 0.2)
  if (state.score > state.highScore) {
    state.highScore = state.score
  }

  // Traffic AI & Collision Detection
  for (let mut t = 0; t < Array.len(state.traffic); t = t + 1) {
    let car = state.traffic[t]
    car.z = (car.z + car.speed * 10.0) % trackLen

    // Check collision with player
    let dz = Math.abs(car.z - state.playerZ)
    if (dz < 280.0) {
      let dx = Math.abs(car.x - state.playerX)
      if (dx < 0.28) {
        // Crash!
        state.gameState = 2 // Crashed state
        state.crashTimer = 45 // Frames
        state.speed = 20.0
        addSparks(CANVAS_W / 2.0, CANVAS_H - 50.0, "#ff007f", 18)
        playSynthSound("crash")
      }
    }
  }

  // Update Particles
  let mut aliveParticles = []
  for (let mut p = 0; p < Array.len(state.particles); p = p + 1) {
    let part = state.particles[p]
    part.x = part.x + part.vx
    part.y = part.y + part.vy
    part.life = part.life + 1.0
    if (part.life < part.maxLife) {
      aliveParticles.push(part)
    }
  }
  state.particles = aliveParticles
}

// ============================================================================
// 8. Visual Rendering: Synthwave Sun, Mountains, Neon Grid & Horizon
// ============================================================================

function drawSkyAndHorizon(ctx: any, horizonY: number, curveOffset: number) {
  // Deep synthwave sky gradient (midnight violet to electric magenta)
  let skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY)
  skyGrad.addColorStop(0.0, "#050012")
  skyGrad.addColorStop(0.6, "#1f0038")
  skyGrad.addColorStop(1.0, "#ff007f")
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, CANVAS_W, horizonY)

  // Twinkling Synthwave Stars
  ctx.fillStyle = "#ffffff"
  for (let mut s = 0; s < 24; s = s + 1) {
    let starX = (s * 37 + state.animTick * 0.1) % CANVAS_W
    let starY = (s * 17) % (horizonY - 40)
    let starAlpha = (s % 3 == 0) ? 0.9 : 0.4
    ctx.fillRect(starX, starY, 1.5, 1.5)
  }

  // Distant Mountain Ranges (Layer 1: Back Purple Silhouette)
  let mtnOffset1 = ((state.playerZ * 0.0004) + curveOffset * 0.3) % CANVAS_W
  ctx.fillStyle = "#160026"
  ctx.beginPath()
  ctx.moveTo(0, horizonY)
  for (let mut m = 0; m <= CANVAS_W; m = m + 40) {
    let peakY = horizonY - 35.0 - Math.sin((m + mtnOffset1) * 0.02) * 25.0
    ctx.lineTo(m, peakY)
  }
  ctx.lineTo(CANVAS_W, horizonY)
  ctx.closePath()
  ctx.fill()

  // Distant Mountain Ranges (Layer 2: Foreground Neon Wireframe Peaks)
  let mtnOffset2 = ((state.playerZ * 0.0008) + curveOffset * 0.7) % CANVAS_W
  ctx.fillStyle = "#090014"
  ctx.strokeStyle = "#00f0ff"
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(0, horizonY)
  for (let mut m = 0; m <= CANVAS_W; m = m + 30) {
    let peakY = horizonY - 20.0 - Math.sin((m + mtnOffset2) * 0.035) * 18.0
    ctx.lineTo(m, peakY)
  }
  ctx.lineTo(CANVAS_W, horizonY)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Iconic Retro Synthwave Sun / Moon on the Horizon
  let sunX = CANVAS_W / 2.0 - curveOffset * 0.5
  let sunY = horizonY - 28.0
  let sunR = 56.0

  // Glowing Outer Corona Aura
  let auraGrad = ctx.createRadialGradient(sunX, sunY, sunR * 0.4, sunX, sunY, sunR * 1.5)
  auraGrad.addColorStop(0.0, "rgba(255, 0, 127, 0.45)")
  auraGrad.addColorStop(0.7, "rgba(255, 230, 0, 0.15)")
  auraGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)")
  ctx.fillStyle = auraGrad
  ctx.fillRect(sunX - sunR * 1.5, sunY - sunR * 1.5, sunR * 3.0, sunR * 3.0)

  // Sun Body Gradient
  let sunGrad = ctx.createLinearGradient(sunX, sunY - sunR, sunX, sunY + sunR)
  sunGrad.addColorStop(0.0, "#ffe600") // Radiant neon yellow at top
  sunGrad.addColorStop(0.45, "#ff007f") // Hot magenta
  sunGrad.addColorStop(1.0, "#a855f7") // Electric purple at base

  ctx.save()
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR, 0, 6.28318)
  ctx.clip()

  ctx.fillStyle = sunGrad
  ctx.fillRect(sunX - sunR, sunY - sunR, sunR * 2.0, sunR * 2.0)

  // Venetian Blind Horizontal Cutouts (Classic 80s Retrowave Slices)
  ctx.fillStyle = "#080017"
  let sliceCount = 6
  for (let mut sl = 0; sl < sliceCount; sl = sl + 1) {
    let sliceY = sunY + (sl * 7.0)
    let sliceHeight = 1.2 + (sl * 0.9)
    ctx.fillRect(sunX - sunR, sliceY, sunR * 2.0, sliceHeight)
  }
  ctx.restore()
}

function drawNeonTerrain(ctx: any, horizonY: number) {
  // Deep cyber grid terrain background
  let groundGrad = ctx.createLinearGradient(0, horizonY, 0, CANVAS_H)
  groundGrad.addColorStop(0.0, "#080017")
  groundGrad.addColorStop(1.0, "#19002e")
  ctx.fillStyle = groundGrad
  ctx.fillRect(0, horizonY, CANVAS_W, CANVAS_H - horizonY)

  // Perspective Neon Grid Lines radiating to canvas corners
  ctx.strokeStyle = "rgba(0, 240, 255, 0.28)"
  ctx.lineWidth = 1.0
  let gridVanishX = CANVAS_W / 2.0

  for (let mut g = -8; g <= 8; g = g + 1) {
    if (g == 0) { continue }
    let bottomX = gridVanishX + (g * 75.0)
    ctx.beginPath()
    ctx.moveTo(gridVanishX, horizonY)
    ctx.lineTo(bottomX, CANVAS_H)
    ctx.stroke()
  }

  // Horizontal Pulsing Neon Grid Lines
  let speedShift = (state.playerZ * 0.02) % 30.0
  ctx.strokeStyle = "rgba(255, 0, 127, 0.35)"
  for (let mut h = 1; h <= 12; h = h + 1) {
    let ratio = (h * h) / 144.0
    let lineY = horizonY + (CANVAS_H - horizonY) * ratio + speedShift * ratio
    if (lineY <= CANVAS_H) {
      ctx.beginPath()
      ctx.moveTo(0, lineY)
      ctx.lineTo(CANVAS_W, lineY)
      ctx.stroke()
    }
  }
}

// ============================================================================
// 9. Road Rendering (Curbs, Lanes & Sprites)
// ============================================================================

function drawSegmentPoly(ctx: any, x1: number, y1: number, w1: number, x2: number, y2: number, w2: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x1 - w1, y1)
  ctx.lineTo(x1 + w1, y1)
  ctx.lineTo(x2 + w2, y2)
  ctx.lineTo(x2 - w2, y2)
  ctx.closePath()
  ctx.fill()
}

function drawRoadsideSprite(ctx: any, spriteType: number, screenX: number, screenY: number, scale: number) {
  if (scale <= 0.002) { return }

  let size = scale * 2600.0

  if (spriteType == 1) {
    // Neon Palm Tree (Cyan/Pink Wireframe)
    ctx.strokeStyle = "#ff007f"
    ctx.lineWidth = Math.max(1.0, scale * 35.0)
    // Trunk
    ctx.beginPath()
    ctx.moveTo(screenX, screenY)
    ctx.quadraticCurveTo(screenX + size * 0.15, screenY - size * 0.5, screenX, screenY - size)
    ctx.stroke()

    // Neon Fronds
    ctx.strokeStyle = "#00f0ff"
    ctx.lineWidth = Math.max(1.0, scale * 20.0)
    let palmTopY = screenY - size
    for (let mut f = -3; f <= 3; f = f + 1) {
      if (f == 0) { continue }
      ctx.beginPath()
      ctx.moveTo(screenX, palmTopY)
      ctx.quadraticCurveTo(screenX + f * size * 0.25, palmTopY - size * 0.2, screenX + f * size * 0.4, palmTopY + size * 0.1)
      ctx.stroke()
    }
  } else if (spriteType == 2) {
    // Holographic Wireframe Pyramid
    ctx.strokeStyle = "#00f0ff"
    ctx.lineWidth = Math.max(1.0, scale * 18.0)
    ctx.fillStyle = "rgba(0, 240, 255, 0.08)"
    let pyrH = size * 0.9
    let pyrW = size * 0.7
    ctx.beginPath()
    ctx.moveTo(screenX, screenY - pyrH)
    ctx.lineTo(screenX + pyrW, screenY)
    ctx.lineTo(screenX - pyrW, screenY)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Inner wireframe line
    ctx.beginPath()
    ctx.moveTo(screenX, screenY - pyrH)
    ctx.lineTo(screenX, screenY)
    ctx.stroke()
  } else if (spriteType == 3) {
    // Retro Synthwave Billboard
    let bbW = size * 1.1
    let bbH = size * 0.6
    ctx.fillStyle = "#0c031c"
    ctx.strokeStyle = "#ff007f"
    ctx.lineWidth = Math.max(1.0, scale * 20.0)
    ctx.fillRect(screenX - bbW / 2.0, screenY - bbH, bbW, bbH)
    ctx.strokeRect(screenX - bbW / 2.0, screenY - bbH, bbW, bbH)

    if (scale > 0.04) {
      ctx.fillStyle = "#ffe600"
      ctx.font = "bold 9px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("OUTRUN '86", screenX, screenY - bbH * 0.5)
    }
  } else if (spriteType == 4) {
    // Overhead Neon Checkpoint Arch
    let archW = scale * ROAD_WIDTH * 1.2
    let archH = size * 0.8
    ctx.strokeStyle = "#ffe600"
    ctx.lineWidth = Math.max(2.0, scale * 45.0)
    ctx.strokeRect(screenX - archW / 2.0, screenY - archH, archW, archH)

    ctx.fillStyle = "rgba(255, 230, 0, 0.2)"
    ctx.fillRect(screenX - archW / 2.0, screenY - archH, archW, archH * 0.35)

    if (scale > 0.05) {
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 11px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("⚡ CHECKPOINT ⚡", screenX, screenY - archH * 0.7)
    }
  }
}

function drawPlayerCar(ctx: any) {
  let carW = 105.0
  let carH = 50.0
  let carX = CANVAS_W / 2.0
  let carY = CANVAS_H - 28.0

  // Body lean / tilt on steering
  let lean = state.steerInput * 7.0

  // Neon Underglow Aura (Hot Magenta / Cyan)
  let underglowColor = state.isNitro ? "rgba(0, 240, 255, 0.7)" : "rgba(255, 0, 127, 0.6)"
  ctx.fillStyle = underglowColor
  ctx.beginPath()
  ctx.ellipse(carX, carY + 8.0, carW * 0.55, 14.0, 0, 0, 6.28318)
  ctx.fill()

  ctx.save()
  ctx.translate(carX, carY)
  ctx.rotate(lean * 0.01745)

  // Rear Tires
  ctx.fillStyle = "#0a0a0f"
  ctx.fillRect(-carW * 0.48, -carH * 0.35, 18.0, 32.0)
  ctx.fillRect(carW * 0.48 - 18.0, -carH * 0.35, 18.0, 32.0)

  // Chrome Rim Hubs
  ctx.fillStyle = "#00f0ff"
  ctx.fillRect(-carW * 0.46, -carH * 0.15, 6.0, 14.0)
  ctx.fillRect(carW * 0.46 - 6.0, -carH * 0.15, 6.0, 14.0)

  // Main Wedge Body (Outrun Testarossa Style)
  let bodyGrad = ctx.createLinearGradient(0, -carH, 0, 0)
  bodyGrad.addColorStop(0.0, "#ff007f") // Neon Hot Magenta
  bodyGrad.addColorStop(0.6, "#d9006c")
  bodyGrad.addColorStop(1.0, "#4a0026")
  ctx.fillStyle = bodyGrad

  ctx.beginPath()
  ctx.moveTo(-carW * 0.44, 0)
  ctx.lineTo(-carW * 0.42, -carH * 0.45)
  ctx.lineTo(-carW * 0.28, -carH * 0.85)
  ctx.lineTo(carW * 0.28, -carH * 0.85)
  ctx.lineTo(carW * 0.42, -carH * 0.45)
  ctx.lineTo(carW * 0.44, 0)
  ctx.closePath()
  ctx.fill()

  // Rear Louvers / Grille (Black Slats)
  ctx.fillStyle = "#110321"
  ctx.fillRect(-carW * 0.38, -carH * 0.42, carW * 0.76, 18.0)

  // Glowing Retro Taillights (Outrun Dual Neon Bars)
  let tailColor = state.isBraking ? "#ffffff" : "#ff0055"
  ctx.fillStyle = tailColor
  ctx.fillRect(-carW * 0.36, -carH * 0.36, carW * 0.3, 7.0)
  ctx.fillRect(carW * 0.06, -carH * 0.36, carW * 0.3, 7.0)

  // Retro License Plate
  ctx.fillStyle = "#ffe600"
  ctx.fillRect(-12.0, -carH * 0.22, 24.0, 8.0)

  // Cabin / Windshield with Driver & Passenger Silhouettes
  ctx.fillStyle = "#050012"
  ctx.fillRect(-carW * 0.24, -carH * 0.75, carW * 0.48, 14.0)

  // Driver Hair & Glasses (Classic 80s Cool)
  ctx.fillStyle = "#ffe600" // Blonde 80s hair
  ctx.fillRect(-14.0, -carH * 0.78, 9.0, 7.0)
  ctx.fillStyle = "#ff007f" // Passenger Pink Hair
  ctx.fillRect(5.0, -carH * 0.78, 9.0, 7.0)

  // Dual Twin Exhaust Tips
  ctx.fillStyle = "#718096"
  ctx.fillRect(-carW * 0.26, 0, 7.0, 5.0)
  ctx.fillRect(-carW * 0.16, 0, 7.0, 5.0)
  ctx.fillRect(carW * 0.16 - 7.0, 0, 7.0, 5.0)
  ctx.fillRect(carW * 0.26 - 7.0, 0, 7.0, 5.0)

  // Turbo Nitro Flames!
  if (state.isNitro && state.speed > 80.0) {
    let flameLen = 14.0 + (state.animTick % 3) * 6.0
    ctx.fillStyle = "#00f0ff"
    ctx.fillRect(-carW * 0.24, 4.0, 4.0, flameLen)
    ctx.fillRect(carW * 0.24 - 4.0, 4.0, 4.0, flameLen)
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(-carW * 0.23, 4.0, 2.0, flameLen * 0.6)
    ctx.fillRect(carW * 0.23 - 2.0, 4.0, 2.0, flameLen * 0.6)
  }

  ctx.restore()

  // Render Spark Particles
  for (let mut p = 0; p < Array.len(state.particles); p = p + 1) {
    let part = state.particles[p]
    ctx.fillStyle = part.color
    ctx.fillRect(part.x, part.y, part.size, part.size)
  }
}

// ============================================================================
// 10. Main Canvas Render Pipeline
// ============================================================================

function drawCanvas() {
  let canvas: any = getElementById("outrun-canvas")
  if (!canvas) { return }
  let ctx = canvas.getContext("2d")
  if (!ctx) { return }

  let baseSegIndex = Math.floor(state.playerZ / SEGMENT_LENGTH) % TOTAL_SEGMENTS
  let baseSeg = state.segments[baseSegIndex]

  // Dynamic Camera & Horizon
  let horizonY = CANVAS_H * 0.44
  let curveOffset = baseSeg.curve * (state.speed / state.maxSpeed) * 35.0

  // 1. Synthwave Horizon & Sun/Moon
  drawSkyAndHorizon(ctx, horizonY, curveOffset)

  // 2. Neon Perspective Terrain Grid
  drawNeonTerrain(ctx, horizonY)

  // 3. Project & Render Road Segments (from back to front)
  let mut maxClipY = CANVAS_H
  let camX = state.playerX * ROAD_WIDTH
  let camY = CAMERA_HEIGHT + baseSeg.p1WorldY
  let camZ = state.playerZ

  let mut visibleSegments = []

  for (let mut n = 0; n < DRAW_DISTANCE; n = n + 1) {
    let segIndex = (baseSegIndex + n) % TOTAL_SEGMENTS
    let seg = state.segments[segIndex]

    // World to Camera coordinates with looping track
    let mut loopedZ1 = seg.p1WorldZ
    if (loopedZ1 < camZ) {
      loopedZ1 = loopedZ1 + TOTAL_SEGMENTS * SEGMENT_LENGTH
    }
    let mut loopedZ2 = seg.p2WorldZ
    if (loopedZ2 < camZ) {
      loopedZ2 = loopedZ2 + TOTAL_SEGMENTS * SEGMENT_LENGTH
    }

    let proj1 = projectCoord(seg.p1WorldX, seg.p1WorldY, loopedZ1, camX, camY, camZ)
    let proj2 = projectCoord(seg.p2WorldX, seg.p2WorldY, loopedZ2, camX, camY, camZ)

    seg.p1ScreenX = proj1.sx
    seg.p1ScreenY = proj1.sy
    seg.p1ScreenW = proj1.sw
    seg.p1ScreenScale = proj1.scale

    seg.p2ScreenX = proj2.sx
    seg.p2ScreenY = proj2.sy
    seg.p2ScreenW = proj2.sw
    seg.p2ScreenScale = proj2.scale

    if (proj1.sy >= maxClipY || proj2.sy >= proj1.sy) {
      continue
    }

    // Colors: Synthwave Electric Cyan & Hot Magenta Curbs + Dark Reflective Asphalt
    let asphaltColor = seg.colorDark ? "#0c0417" : "#140726"
    let curbColor = seg.colorDark ? "#ff007f" : "#00f0ff"
    let laneColor = seg.colorDark ? "rgba(0, 240, 255, 0.75)" : "rgba(0,0,0,0)"

    // Draw Curbs / Rumble Strips
    drawSegmentPoly(ctx, proj1.sx, proj1.sy, proj1.sw * 1.15, proj2.sx, proj2.sy, proj2.sw * 1.15, curbColor)

    // Draw Road Asphalt
    drawSegmentPoly(ctx, proj1.sx, proj1.sy, proj1.sw, proj2.sx, proj2.sy, proj2.sw, asphaltColor)

    // Draw Dashed Lane Lines (4 Lanes)
    if (laneColor != "rgba(0,0,0,0)") {
      let laneW1 = proj1.sw * 0.025
      let laneW2 = proj2.sw * 0.025
      // Left lane divider
      drawSegmentPoly(ctx, proj1.sx - proj1.sw * 0.5, proj1.sy, laneW1, proj2.sx - proj2.sw * 0.5, proj2.sy, laneW2, laneColor)
      // Center lane divider
      drawSegmentPoly(ctx, proj1.sx, proj1.sy, laneW1, proj2.sx, proj2.sy, laneW2, laneColor)
      // Right lane divider
      drawSegmentPoly(ctx, proj1.sx + proj1.sw * 0.5, proj1.sy, laneW1, proj2.sx + proj2.sw * 0.5, proj2.sy, laneW2, laneColor)
    }

    seg.clipY = proj1.sy
    maxClipY = proj1.sy
    visibleSegments.push(seg)
  }

  // 4. Render Sprites & Traffic Vehicles Back-to-Front
  for (let mut i = Array.len(visibleSegments) - 1; i >= 0; i = i - 1) {
    let s = visibleSegments[i]

    // Roadside synthwave props
    if (s.spriteType > 0) {
      let spriteScreenX = s.p1ScreenX + (s.spriteX * s.p1ScreenW)
      drawRoadsideSprite(ctx, s.spriteType, spriteScreenX, s.p1ScreenY, s.p1ScreenScale)
    }

    // Traffic Cars matching this segment depth
    for (let mut tc = 0; tc < Array.len(state.traffic); tc = tc + 1) {
      let car = state.traffic[tc]
      let carSeg = Math.floor(car.z / SEGMENT_LENGTH) % TOTAL_SEGMENTS
      if (carSeg == s.index && s.p1ScreenScale > 0.003) {
        let carScreenX = s.p1ScreenX + (car.x * s.p1ScreenW)
        let carScreenY = s.p1ScreenY
        let carDrawW = s.p1ScreenScale * 1400.0
        let carDrawH = carDrawW * 0.48

        // Draw Rival Cyber Car
        ctx.fillStyle = car.color
        ctx.fillRect(carScreenX - carDrawW / 2.0, carScreenY - carDrawH, carDrawW, carDrawH)
        // Red Taillights
        ctx.fillStyle = "#ff0000"
        ctx.fillRect(carScreenX - carDrawW * 0.45, carScreenY - carDrawH * 0.4, carDrawW * 0.25, carDrawH * 0.3)
        ctx.fillRect(carScreenX + carDrawW * 0.2, carScreenY - carDrawH * 0.4, carDrawW * 0.25, carDrawH * 0.3)
      }
    }
  }

  // 5. Render Player's Synthwave Convertible
  drawPlayerCar(ctx)

  // 6. On-Screen Demo Mode Badge or Game Over
  if (state.mode == 1) {
    // Pulse effect
    let pulseAlpha = 0.75 + Math.sin(state.animTick * 0.1) * 0.2
    ctx.fillStyle = "rgba(10, 0, 24, 0.85)"
    ctx.strokeStyle = "#00f0ff"
    ctx.lineWidth = 1.5
    ctx.fillRect(CANVAS_W / 2.0 - 160.0, 14.0, 320.0, 28.0)
    ctx.strokeRect(CANVAS_W / 2.0 - 160.0, 14.0, 320.0, 28.0)

    ctx.fillStyle = "#00f0ff"
    ctx.font = "bold 11px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("⚡ DEMO MODE: CPU AI AUTO-PILOT ON HIGHWAY ⚡", CANVAS_W / 2.0, 32.0)
  }

  if (state.gameState == 3) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)"
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    ctx.fillStyle = "#ff007f"
    ctx.font = "bold 28px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("TIME OUT - GAME OVER", CANVAS_W / 2.0, CANVAS_H / 2.0 - 10.0)
    ctx.fillStyle = "#00f0ff"
    ctx.font = "14px monospace"
    ctx.fillText("PRESS [R] OR CLICK 'NEW RACE' TO DRIVE AGAIN", CANVAS_W / 2.0, CANVAS_H / 2.0 + 25.0)
  }
}

// ============================================================================
// 11. Interactive HUD & DOM UI
// ============================================================================

function updateHUD() {
  let speedEl = getElementById("hud-speed")
  if (speedEl) {
    speedEl.innerText = concat(to_string(Math.floor(state.speed)), " MPH")
  }
  let timeEl = getElementById("hud-time")
  if (timeEl) {
    timeEl.innerText = concat(to_string(Math.floor(state.timeLeft)), "s")
  }
  let scoreEl = getElementById("hud-score")
  if (scoreEl) {
    scoreEl.innerText = to_string(state.score)
  }
  let nitroEl: any = getElementById("hud-nitro-bar")
  if (nitroEl && nitroEl.style) {
    nitroEl.style.width = concat(to_string(Math.floor(state.nitro)), "%")
  }
}

function startNewRace() {
  state.gameState = 1
  state.speed = 40.0
  state.playerX = 0.0
  state.playerZ = 0.0
  state.timeLeft = 60.0
  state.score = 0
  state.nitro = 100.0
  state.isNitro = false
  state.nextCheckpointZ = 40000.0
  buildTrack()
  renderUI()
}

function setMode(newMode: number) {
  state.mode = newMode
  renderUI()
}

function renderUI() {
  let vnode = h("div", {
    className: "w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-3 sm:p-5 font-sans select-none"
  }, [
    // Top Arcade Header Banner
    h("div", { className: "w-full max-w-4xl flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-purple-900/60 pb-3" }, [
      h("div", { className: "flex items-center space-x-3" }, [
        h("div", { className: "w-9 h-9 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-cyan-400 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-fuchsia-500/30 text-lg" }, "🏁"),
        h("div", {}, [
          h("h1", { className: "text-lg sm:text-xl font-black tracking-wider uppercase bg-gradient-to-r from-fuchsia-400 via-pink-300 to-cyan-300 bg-clip-text text-transparent" }, "OUTRUN SYNTHWAVE '86"),
          h("p", { className: "text-xs font-mono text-purple-300" }, "2.5D Highway Engine • Horizon Sun & Neon Grid • CPU AI Pilot")
        ])
      ]),

      // Mode Switcher: 1-Player vs CPU Demo
      h("div", { className: "flex items-center space-x-2 bg-slate-900/90 p-1 rounded-xl border border-purple-800/80" }, [
        h("button", {
          className: state.mode == 0
            ? "px-3 py-1.5 rounded-lg text-xs font-bold bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/40 cursor-pointer"
            : "px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer",
          onClick: fn() { setMode(0) }
        }, "🎮 1-Player"),
        h("button", {
          className: state.mode == 1
            ? "px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 text-white shadow-md shadow-cyan-500/40 cursor-pointer"
            : "px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer",
          onClick: fn() { setMode(1) }
        }, "🤖 Demo (AI Pilot)")
      ])
    ]),

    // Arcade Dashboard & Canvas Container
    h("div", { className: "w-full max-w-4xl flex flex-col items-center bg-slate-900/70 border border-purple-800/60 rounded-2xl p-3 sm:p-4 shadow-2xl shadow-purple-950/80" }, [
      
      // HUD Status Bar
      h("div", { className: "w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 font-mono text-xs" }, [
        h("div", { className: "bg-slate-950/80 border border-purple-900/80 rounded-xl p-2 flex flex-col" }, [
          h("span", { className: "text-purple-400 text-[10px] uppercase font-bold" }, "SPEEDOMETER"),
          h("span", { id: "hud-speed", className: "text-lg font-black text-cyan-300" }, concat(to_string(Math.floor(state.speed)), " MPH"))
        ]),
        h("div", { className: "bg-slate-950/80 border border-purple-900/80 rounded-xl p-2 flex flex-col" }, [
          h("span", { className: "text-pink-400 text-[10px] uppercase font-bold" }, "TIME REMAINING"),
          h("span", { id: "hud-time", className: "text-lg font-black text-pink-300" }, concat(to_string(Math.floor(state.timeLeft)), "s"))
        ]),
        h("div", { className: "bg-slate-950/80 border border-purple-900/80 rounded-xl p-2 flex flex-col" }, [
          h("span", { className: "text-amber-400 text-[10px] uppercase font-bold" }, "SCORE"),
          h("span", { id: "hud-score", className: "text-lg font-black text-amber-300" }, to_string(state.score))
        ]),
        h("div", { className: "bg-slate-950/80 border border-purple-900/80 rounded-xl p-2 flex flex-col justify-between" }, [
          h("div", { className: "flex justify-between items-center text-[10px] text-cyan-400 font-bold" }, [
            h("span", {}, "NITRO BOOST"),
            h("span", {}, concat(to_string(Math.floor(state.nitro)), "%"))
          ]),
          h("div", { className: "w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-1" }, [
            h("div", {
              id: "hud-nitro-bar",
              className: "h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all",
              style: "width: 100%"
            }, [])
          ])
        ])
      ]),

      // 2.5D Pseudo-3D Canvas
      h("div", { className: "relative w-full max-w-[640px] aspect-[16/9.5] rounded-xl overflow-hidden border border-purple-700/80 shadow-inner bg-slate-950" }, [
        h("canvas", {
          id: "outrun-canvas",
          width: "640",
          height: "380",
          className: "w-full h-full block"
        }, [])
      ]),

      // Interactive Driving Controls & Audio Toggles
      h("div", { className: "w-full max-w-[640px] flex flex-wrap items-center justify-between gap-2 mt-3" }, [
        // Left Audio / Reset controls
        h("div", { className: "flex items-center space-x-2" }, [
          h("button", {
            className: "px-3 py-1.5 rounded-lg text-xs font-bold border border-purple-700/80 bg-slate-800 hover:bg-slate-700 cursor-pointer active:scale-95 transition-all",
            onClick: fn() { state.audioEnabled = !state.audioEnabled; renderUI() }
          }, state.audioEnabled ? "🔊 SFX ON" : "🔇 SFX OFF"),
          h("button", {
            className: "px-3 py-1.5 rounded-lg text-xs font-bold border border-fuchsia-700/80 bg-fuchsia-950/60 text-fuchsia-300 hover:bg-fuchsia-900/60 cursor-pointer active:scale-95 transition-all",
            onClick: fn() { toggleOutrunMusic() }
          }, state.musicEnabled ? "🎵 MUSIC ON" : "🎶 MUSIC OFF"),
          h("button", {
            className: "px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-700 bg-slate-800 hover:bg-slate-700 cursor-pointer active:scale-95 transition-all",
            onClick: fn() { startNewRace() }
          }, "🔄 New Race")
        ]),

        // Right Mode Banner / Take Wheel
        h("div", { className: "flex items-center space-x-2" }, [
          state.mode == 1 ? h("button", {
            className: "px-4 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-lg shadow-pink-500/40 cursor-pointer active:scale-95 transition-all animate-pulse",
            onClick: fn() { setMode(0) }
          }, "🎮 Take The Wheel (Manual)") : h("button", {
            className: "px-4 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/40 cursor-pointer active:scale-95 transition-all",
            onClick: fn() { setMode(1) }
          }, "🤖 Engage AI Auto-Pilot")
        ])
      ]),

      // On-Screen Touch Driving Controls (Mobile / Tablet)
      h("div", { className: "w-full max-w-[640px] grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-purple-900/40" }, [
        // Steering Touch Buttons
        h("div", { className: "flex items-center space-x-2" }, [
          h("button", {
            className: "flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:bg-cyan-500/30 rounded-xl border border-slate-700 text-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all font-bold",
            onMouseDown: fn() { handleSteer(-1.0) },
            onMouseUp: fn() { handleSteer(0.0) },
            onTouchStart: fn() { handleSteer(-1.0) },
            onTouchEnd: fn() { handleSteer(0.0) }
          }, "◀ STEER"),
          h("button", {
            className: "flex-1 py-3 bg-slate-800 hover:bg-slate-700 active:bg-cyan-500/30 rounded-xl border border-slate-700 text-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all font-bold",
            onMouseDown: fn() { handleSteer(1.0) },
            onMouseUp: fn() { handleSteer(0.0) },
            onTouchStart: fn() { handleSteer(1.0) },
            onTouchEnd: fn() { handleSteer(0.0) }
          }, "STEER ▶")
        ]),

        // Pedals & Nitro
        h("div", { className: "flex items-center space-x-2" }, [
          h("button", {
            className: "w-16 py-3 bg-rose-950/60 hover:bg-rose-900/60 active:bg-rose-600 rounded-xl border border-rose-800 text-xs font-bold text-rose-300 cursor-pointer active:scale-95 transition-all",
            onMouseDown: fn() { handleBrake(1.0) },
            onMouseUp: fn() { handleBrake(0.0) },
            onTouchStart: fn() { handleBrake(1.0) },
            onTouchEnd: fn() { handleBrake(0.0) }
          }, "BRAKE"),
          h("button", {
            className: "flex-1 py-3 bg-emerald-950/60 hover:bg-emerald-900/60 active:bg-emerald-600 rounded-xl border border-emerald-800 text-xs font-bold text-emerald-300 cursor-pointer active:scale-95 transition-all",
            onMouseDown: fn() { handleThrottle(1.0) },
            onMouseUp: fn() { handleThrottle(0.0) },
            onTouchStart: fn() { handleThrottle(1.0) },
            onTouchEnd: fn() { handleThrottle(0.0) }
          }, "GAS / ACCEL"),
          h("button", {
            className: "w-20 py-3 bg-gradient-to-r from-cyan-600 to-fuchsia-600 rounded-xl text-xs font-black text-white cursor-pointer active:scale-95 transition-all shadow-md shadow-fuchsia-500/30",
            onClick: fn() { triggerNitro() }
          }, "NITRO 🚀")
        ])
      ]),

      // Keyboard Help Legend
      h("div", { className: "w-full max-w-[640px] mt-3 p-2 bg-slate-950/60 rounded-xl border border-purple-900/50 text-[11px] font-mono text-slate-400 flex flex-wrap justify-between gap-2" }, [
        h("span", {}, "🎮 WASD / Arrows: Steer, Gas & Brake"),
        h("span", {}, "🚀 [Space] / [Shift]: Nitro Turbo"),
        h("span", {}, "🤖 [M]: Toggle 1-Player / Demo Mode")
      ])
    ])
  ])

  mount("app-root", vnode)
  drawCanvas()
}

// ============================================================================
// 12. Keyboard Handlers & Animation Game Loop
// ============================================================================

function handleKeyDown(e: any) {
  let k = e.key
  if (k == "ArrowLeft" || k == "a" || k == "A") {
    handleSteer(-1.0)
  } else if (k == "ArrowRight" || k == "d" || k == "D") {
    handleSteer(1.0)
  } else if (k == "ArrowUp" || k == "w" || k == "W") {
    handleThrottle(1.0)
  } else if (k == "ArrowDown" || k == "s" || k == "S") {
    handleBrake(1.0)
  } else if (k == " " || k == "Shift") {
    triggerNitro()
    if (state.mode == 1) { state.mode = 0; renderUI() }
  } else if (k == "m" || k == "M") {
    state.mode = (state.mode == 0) ? 1 : 0
    renderUI()
  } else if (k == "r" || k == "R") {
    startNewRace()
  }
}

function handleKeyUp(e: any) {
  let k = e.key
  if (k == "ArrowLeft" || k == "a" || k == "A" || k == "ArrowRight" || k == "d" || k == "D") {
    state.steerInput = 0.0
  } else if (k == "ArrowUp" || k == "w" || k == "W") {
    state.gasInput = 0.0
  } else if (k == "ArrowDown" || k == "s" || k == "S") {
    state.brakeInput = 0.0
  }
}

if (window && window.addEventListener) {
  if (window._tl_outrun_keydown && window.removeEventListener) {
    window.removeEventListener("keydown", window._tl_outrun_keydown)
  }
  if (window._tl_outrun_keyup && window.removeEventListener) {
    window.removeEventListener("keyup", window._tl_outrun_keyup)
  }
  window._tl_outrun_keydown = handleKeyDown
  window._tl_outrun_keyup = handleKeyUp
  window.addEventListener("keydown", handleKeyDown)
  window.addEventListener("keyup", handleKeyUp)
}

function startLoop() {
  if (window && window._tl_outrun_timer) {
    clearInterval(window._tl_outrun_timer)
  }
  let _timer = setInterval(fn() {
    gameStep()
    drawCanvas()
    if (state.animTick % 4 == 0) {
      updateHUD()
    }
  }, 16)
  if (window) {
    window._tl_outrun_timer = _timer
  }
}

// ============================================================================
// 13. Initialization & Startup
// ============================================================================

buildTrack()
renderUI()
startLoop()

println("================================================================")
println("  Outrun Synthwave '86 (2.5D Pseudo-3D Engine) Initialized")
println("================================================================")
`
};
