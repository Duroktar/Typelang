import { ExampleProgram } from "./types";

export const example39Pacman: ExampleProgram = {
  id: "pacman_arcade",
  name: "39. Pac-Man 1980 Arcade (GADT Finite State Machine & Ghost AI Engine)",
  title: "39. Pac-Man 1980 Arcade (GADT Finite State Machine & Ghost AI Engine)",
  category: "Games & Graphics",
  description: "An authentic 1980s arcade Pac-Man engine in TypeLang featuring GADTs, the 4 classic ghost AI personalities (Blinky, Pinky, Inky, Clyde) with Scatter/Chase/Frightened state machines, grid cornering buffer, warp tunnels, Fruit bonuses, Web Audio sound synthesis, interactive touch D-pad, and AI targeting debug radar.",
  code: `import DOM.{ h, mount, getElementById, playRamp, playSequence, confetti }
import Math.{ floor, max, min, abs, random, sqrt, cos, sin }

extern let window: any

// ============================================================================
// 1. GADT Domain Types & Game Models
// ============================================================================

type Direction =
  | DirUp: Direction
  | DirDown: Direction
  | DirLeft: Direction
  | DirRight: Direction
  | DirNone: Direction

type GhostMode =
  | Scatter: GhostMode
  | Chase: GhostMode
  | Frightened: GhostMode
  | Eaten: GhostMode

type GameState =
  | Ready: GameState
  | Playing: GameState
  | Paused: GameState
  | LifeLost: GameState
  | GameOver: GameState
  | Victory: GameState

type GhostId =
  | BlinkyId: GhostId // Red - Shadow (Direct aggressive chaser)
  | PinkyId: GhostId  // Pink - Speedy (Ambush 4 tiles ahead)
  | InkyId: GhostId   // Cyan - Bashful (Flanker relative to Blinky)
  | ClydeId: GhostId  // Orange - Pokey (Proximity-based coward)

export type Ghost = {
  id: number, // 0: Blinky, 1: Pinky, 2: Inky, 3: Clyde
  name: string,
  color: string,
  mut gx: number,       // Grid tile X
  mut gy: number,       // Grid tile Y
  mut px: number,       // Sub-pixel position X
  mut py: number,       // Sub-pixel position Y
  mut dir: number,      // 0: Up, 1: Right, 2: Down, 3: Left, 4: None
  mut nextDir: number,
  mut mode: number,     // 0: Scatter, 1: Chase, 2: Frightened, 3: Eaten
  mut speed: number,
  scatterX: number,
  scatterY: number,
  mut targetX: number,
  mut targetY: number,
  mut inHouse: boolean,
  mut houseTimer: number
}

// ============================================================================
// 2. Maze Definition & Tile Constants
// ============================================================================

// 0: Empty, 1: Wall, 2: Dot (10 pts), 3: Energizer (50 pts), 4: Gate, 5: Warp, 6: Fruit
let MAZE_COLS = 21
let MAZE_ROWS = 21

let INITIAL_MAZE = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 3, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 1,
  1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1,
  1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1,
  1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
  1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1,
  1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1,
  1, 1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1, 1,
  0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 4, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1,
  5, 0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 5,
  1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1, 1,
  0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1,
  1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
  1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1,
  1, 3, 2, 2, 1, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 2, 3, 1,
  1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1,
  1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1,
  1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
]

// ============================================================================
// 3. Game State Container
// ============================================================================

let state = {
  mut maze: [],
  mut score: 0,
  mut highScore: 10000,
  mut lives: 3,
  mut level: 1,
  mut gameState: 0, // 0: Ready, 1: Playing, 2: Paused, 3: LifeLost, 4: GameOver, 5: Victory
  mut dotsRemaining: 0,
  mut totalDots: 0,
  mut modeTimer: 0,
  mut isGlobalChase: false,
  mut frightenedTimer: 0,
  mut ghostComboMultiplier: 200,
  mut fruitActive: false,
  mut fruitTimer: 0,
  mut fruitScore: 100,
  mut fruitX: 10,
  mut fruitY: 12,
  mut audioEnabled: true,
  mut showRadar: false, // Debug target ray lines
  mut wakaToggle: false,
  mut animTick: 0,
  // Floating score popups
  mut popups: [],
  // Pacman
  mut pacX: 10.0,
  mut pacY: 16.0,
  mut pacDir: 3, // 0: Up, 1: Right, 2: Down, 3: Left, 4: None
  mut pacNextDir: 3,
  mut pacSpeed: 0.125,
  mut pacMouthAngle: 0.25,
  mut pacMouthSpeed: 0.05,
  // Ghosts (Blinky, Pinky, Inky, Clyde)
  mut ghosts: []
}

// Direction Offsets: [dx, dy] for [Up, Right, Down, Left, None]
let DIRS = [
  [0, -1],  // 0: Up
  [1, 0],   // 1: Right
  [0, 1],   // 2: Down
  [-1, 0],  // 3: Left
  [0, 0]    // 4: None
]

// ============================================================================
// 4. Web Audio Synthesizer (Retro 1980 Sound FX via DOM Library)
// ============================================================================

function playSound(soundKey: string) {
  if (!state.audioEnabled) { return }

  if (soundKey == "waka") {
    state.wakaToggle = !state.wakaToggle
    let freq = state.wakaToggle ? 480.0 : 320.0
    let target = state.wakaToggle ? 240.0 : 560.0
    let _ = playRamp(freq, target, 0.04, "triangle", 0.08)
  } else if (soundKey == "power") {
    let _ = playRamp(140.0, 280.0, 0.1, "sawtooth", 0.12)
  } else if (soundKey == "eat_ghost") {
    let _ = playSequence([400.0, 600.0, 800.0, 1200.0], 0.03, "square", 0.15)
  } else if (soundKey == "fruit") {
    let _ = playSequence([523.0, 659.0, 784.0, 1046.0], 0.05, "sine", 0.12)
  } else if (soundKey == "death") {
    let _ = playSequence([900.0, 800.0, 700.0, 600.0, 500.0, 400.0, 300.0, 200.0, 100.0], 0.06, "sawtooth", 0.14)
  } else if (soundKey == "victory") {
    let _ = playSequence([523.0, 587.0, 659.0, 698.0, 784.0, 880.0, 987.0, 1046.0], 0.07, "sine", 0.15)
  }
}

// ============================================================================
// 5. Maze & Map Operations
// ============================================================================

function getTile(x: number, y: number): number {
  if (x < 0 || x >= MAZE_COLS || y < 0 || y >= MAZE_ROWS) {
    return 1 // Out of bounds is wall
  }
  let idx = y * MAZE_COLS + x
  state.maze[idx]
}

function setTile(x: number, y: number, val: number) {
  if (x >= 0 && x < MAZE_COLS && y >= 0 && y < MAZE_ROWS) {
    let idx = y * MAZE_COLS + x
    state.maze[idx] = val
  }
}

function isWalkable(x: number, y: number, isGhost: boolean, inHouse: boolean): boolean {
  // Wrap tunnels
  if ((x < 0 || x >= MAZE_COLS) && y == 10) { return true }
  let t = getTile(x, y)
  if (t == 1) { return false } // Wall
  if (t == 4) { return isGhost } // Ghost house gate passable only for ghosts
  true
}

function initMaze() {
  state.maze = []
  let mut dotCount = 0
  for (let mut i = 0; i < Array.len(INITIAL_MAZE); i = i + 1) {
    let tile = INITIAL_MAZE[i]
    state.maze.push(tile)
    if (tile == 2 || tile == 3) {
      dotCount = dotCount + 1
    }
  }
  state.dotsRemaining = dotCount
  state.totalDots = dotCount
}

// ============================================================================
// 6. Ghosts & Entities Factory
// ============================================================================

function createGhosts() {
  state.ghosts = [
    // 0. Blinky (Red - Shadow)
    {
      id: 0,
      name: "Blinky",
      color: "#ef4444", // Red
      gx: 10,
      gy: 7,
      px: 10.0,
      py: 7.0,
      dir: 3, // Left
      nextDir: 3,
      mode: 0, // Scatter
      speed: 0.10,
      scatterX: 19,
      scatterY: 0,
      targetX: 19,
      targetY: 0,
      inHouse: false,
      houseTimer: 0
    },
    // 1. Pinky (Pink - Speedy)
    {
      id: 1,
      name: "Pinky",
      color: "#f472b6", // Pink
      gx: 10,
      gy: 9,
      px: 10.0,
      py: 9.0,
      dir: 0, // Up
      nextDir: 0,
      mode: 0,
      speed: 0.095,
      scatterX: 1,
      scatterY: 0,
      targetX: 1,
      targetY: 0,
      inHouse: true,
      houseTimer: 60
    },
    // 2. Inky (Cyan - Bashful)
    {
      id: 2,
      name: "Inky",
      color: "#06b6d4", // Cyan
      gx: 9,
      gy: 10,
      px: 9.0,
      py: 10.0,
      dir: 0,
      nextDir: 0,
      mode: 0,
      speed: 0.09,
      scatterX: 19,
      scatterY: 20,
      targetX: 19,
      targetY: 20,
      inHouse: true,
      houseTimer: 180
    },
    // 3. Clyde (Orange - Pokey)
    {
      id: 3,
      name: "Clyde",
      color: "#f97316", // Orange
      gx: 11,
      gy: 10,
      px: 11.0,
      py: 10.0,
      dir: 0,
      nextDir: 0,
      mode: 0,
      speed: 0.09,
      scatterX: 1,
      scatterY: 20,
      targetX: 1,
      targetY: 20,
      inHouse: true,
      houseTimer: 300
    }
  ]
}

function resetPositions() {
  state.pacX = 10.0
  state.pacY = 16.0
  state.pacDir = 3
  state.pacNextDir = 3
  createGhosts()
  state.frightenedTimer = 0
  state.modeTimer = 0
  state.isGlobalChase = false
}

function initNewGame() {
  initMaze()
  state.score = 0
  state.lives = 3
  state.level = 1
  state.gameState = 0 // Ready
  state.fruitActive = false
  state.fruitTimer = 0
  state.popups = []
  resetPositions()
}

// ============================================================================
// 7. Ghost Targeting AI (The 4 Classic Personalities)
// ============================================================================

function distanceSq(x1: number, y1: number, x2: number, y2: number): number {
  let dx = x1 - x2
  let dy = y1 - y2
  dx * dx + dy * dy
}

function updateGhostTarget(ghost: Ghost) {
  // If in Eaten mode, rush directly back to the ghost house door (10, 8)
  if (ghost.mode == 3) {
    ghost.targetX = 10
    ghost.targetY = 8
    return
  }

  // If in Frightened mode, pseudo-random wander / flee away from Pacman
  if (ghost.mode == 2) {
    ghost.targetX = Math.floor(Math.random() * MAZE_COLS)
    ghost.targetY = Math.floor(Math.random() * MAZE_ROWS)
    return
  }

  // If in Scatter mode, target designated home corner
  if (!state.isGlobalChase || ghost.mode == 0) {
    ghost.targetX = ghost.scatterX
    ghost.targetY = ghost.scatterY
    return
  }

  // --- CHASE MODE PERSONALITIES ---
  let pGx = Math.floor(state.pacX + 0.5)
  let pGy = Math.floor(state.pacY + 0.5)

  // 1. BLINKY: Direct chaser targeting Pac-Man's exact tile
  if (ghost.id == 0) {
    ghost.targetX = pGx
    ghost.targetY = pGy
  }
  // 2. PINKY: Ambush predator targeting 4 tiles ahead of Pac-Man
  else if (ghost.id == 1) {
    let pDir = state.pacDir
    let offset = DIRS[pDir]
    ghost.targetX = pGx + offset[0] * 4
    ghost.targetY = pGy + offset[1] * 4
  }
  // 3. INKY: Flanker relative to Blinky and Pacman's front vector
  else if (ghost.id == 2) {
    let pDir = state.pacDir
    let offset = DIRS[pDir]
    let pivotX = pGx + offset[0] * 2
    let pivotY = pGy + offset[1] * 2
    let blinky = state.ghosts[0]
    let bGx = Math.floor(blinky.px + 0.5)
    let bGy = Math.floor(blinky.py + 0.5)
    // Vector doubled from Blinky to pivot
    ghost.targetX = pivotX + (pivotX - bGx)
    ghost.targetY = pivotY + (pivotY - bGy)
  }
  // 4. CLYDE: Coward. Chases if far (>8 tiles), retreats to corner if close
  else if (ghost.id == 3) {
    let dist = distanceSq(ghost.gx, ghost.gy, pGx, pGy)
    if (dist > 64) { // > 8 tiles away
      ghost.targetX = pGx
      ghost.targetY = pGy
    } else {
      ghost.targetX = ghost.scatterX
      ghost.targetY = ghost.scatterY
    }
  }
}

function updateGhost(ghost: Ghost) {
  // Check Ghost House release timer
  if (ghost.inHouse) {
    if (ghost.houseTimer > 0) {
      ghost.houseTimer = ghost.houseTimer - 1
      // Gentle bounce inside ghost house
      ghost.py = ghost.gy + Math.sin(state.animTick * 0.1) * 0.2
      return
    } else {
      // Exiting ghost house
      if (ghost.py > 7.0) {
        ghost.py = ghost.py - 0.05
        ghost.px = 10.0
        return
      } else {
        ghost.inHouse = false
        ghost.gy = 7
        ghost.py = 7.0
        ghost.dir = 3
      }
    }
  }

  // Check if Eaten ghost reached home to revive
  if (ghost.mode == 3) {
    if (ghost.gx >= 9 && ghost.gx <= 11 && ghost.gy >= 7 && ghost.gy <= 9) {
      ghost.mode = state.isGlobalChase ? 1 : 0
      ghost.speed = 0.09
      ghost.dir = 0
    }
  }

  updateGhostTarget(ghost)

  // Sub-pixel movement along current direction
  let curDir = ghost.dir
  let d = DIRS[curDir]
  let spd = (ghost.mode == 3) ? 0.18 : (ghost.mode == 2) ? 0.06 : ghost.speed

  ghost.px = ghost.px + d[0] * spd
  ghost.py = ghost.py + d[1] * spd

  // Tunnel wrap-around
  if (ghost.px < -0.5) { ghost.px = MAZE_COLS - 0.5 }
  if (ghost.px > MAZE_COLS - 0.5) { ghost.px = -0.5 }

  // Check if approaching tile center
  let targetGx = Math.floor(ghost.px + 0.5)
  let targetGy = Math.floor(ghost.py + 0.5)

  let distToCenter = Math.abs(ghost.px - targetGx) + Math.abs(ghost.py - targetGy)

  if (distToCenter < spd * 1.2) {
    ghost.gx = targetGx
    ghost.gy = targetGy

    // Opposite direction to prevent immediate 180 turnaround (unless frightened)
    let oppositeDir = (curDir == 0) ? 2 : (curDir == 1) ? 3 : (curDir == 2) ? 0 : 1

    // Evaluate valid neighboring tiles
    let mut bestDir = curDir
    let mut bestDist = 9999999

    for (let mut tryDir = 0; tryDir < 4; tryDir = tryDir + 1) {
      if (tryDir != oppositeDir || ghost.mode == 3) {
        let nd = DIRS[tryDir]
        let nx = ghost.gx + nd[0]
        let ny = ghost.gy + nd[1]

        if (isWalkable(nx, ny, true, ghost.inHouse)) {
          let dScore = distanceSq(nx, ny, ghost.targetX, ghost.targetY)
          if (dScore < bestDist) {
            bestDist = dScore
            bestDir = tryDir
          }
        }
      }
    }

    ghost.dir = bestDir
    // Snap to grid axis perpendicular to new direction
    if (ghost.dir == 0 || ghost.dir == 2) {
      ghost.px = targetGx
    } else {
      ghost.py = targetGy
    }
  }
}

// ============================================================================
// 8. Pac-Man Movement, Cornering & Collisions
// ============================================================================

function updatePacman() {
  // Mouth chomp animation
  state.pacMouthAngle = state.pacMouthAngle + state.pacMouthSpeed
  if (state.pacMouthAngle > 0.35 || state.pacMouthAngle < 0.05) {
    state.pacMouthSpeed = 0 - state.pacMouthSpeed
  }

  // 1. Check if buffered direction is walkable
  let targetGx = Math.floor(state.pacX + 0.5)
  let targetGy = Math.floor(state.pacY + 0.5)
  let distToCenter = Math.abs(state.pacX - targetGx) + Math.abs(state.pacY - targetGy)

  if (state.pacNextDir != state.pacDir) {
    let nd = DIRS[state.pacNextDir]
    let nextTileX = targetGx + nd[0]
    let nextTileY = targetGy + nd[1]

    // Immediate 180 reversal can happen anywhere
    let isOpposite = (state.pacNextDir == 0 && state.pacDir == 2) ||
                     (state.pacNextDir == 2 && state.pacDir == 0) ||
                     (state.pacNextDir == 1 && state.pacDir == 3) ||
                     (state.pacNextDir == 3 && state.pacDir == 1)

    if (isOpposite) {
      state.pacDir = state.pacNextDir
    } else if (distToCenter < 0.25 && isWalkable(nextTileX, nextTileY, false, false)) {
      state.pacDir = state.pacNextDir
      if (state.pacDir == 0 || state.pacDir == 2) {
        state.pacX = targetGx
      } else {
        state.pacY = targetGy
      }
    }
  }

  // 2. Move Pac-Man forward if path is clear
  let cd = DIRS[state.pacDir]
  let aheadX = targetGx + cd[0]
  let aheadY = targetGy + cd[1]

  let canMove = isWalkable(aheadX, aheadY, false, false) || (distToCenter > 0.1)

  if (canMove) {
    state.pacX = state.pacX + cd[0] * state.pacSpeed
    state.pacY = state.pacY + cd[1] * state.pacSpeed

    // Warp Tunnel wrap
    if (state.pacX < -0.5) { state.pacX = MAZE_COLS - 0.5 }
    if (state.pacX > MAZE_COLS - 0.5) { state.pacX = -0.5 }
  } else {
    // Snap to wall
    state.pacX = targetGx
    state.pacY = targetGy
  }

  // 3. Eat Pellets & Energizers
  let curGx = Math.floor(state.pacX + 0.5)
  let curGy = Math.floor(state.pacY + 0.5)
  let currentTile = getTile(curGx, curGy)

  if (currentTile == 2) {
    // Dot
    setTile(curGx, curGy, 0)
    state.score = state.score + 10
    state.dotsRemaining = state.dotsRemaining - 1
    if (state.score > state.highScore) { state.highScore = state.score }
    playSound("waka")

    // Fruit spawn trigger (at 70 and 170 dots eaten)
    let dotsEaten = state.totalDots - state.dotsRemaining
    if (dotsEaten == 70 || dotsEaten == 140) {
      state.fruitActive = true
      state.fruitTimer = 600 // 10 seconds
    }

    // Check Victory
    if (state.dotsRemaining <= 0) {
      state.gameState = 5 // Victory
      playSound("victory")
      let _ = confetti(120.0, 80.0, 0.6)
      renderUI()
    }
  } else if (currentTile == 3) {
    // Energizer Power Pellet!
    setTile(curGx, curGy, 0)
    state.score = state.score + 50
    state.dotsRemaining = state.dotsRemaining - 1
    if (state.score > state.highScore) { state.highScore = state.score }
    state.frightenedTimer = 400 // ~6.5 seconds
    state.ghostComboMultiplier = 200
    playSound("power")

    // Set all active ghosts to Frightened mode
    for (let mut i = 0; i < Array.len(state.ghosts); i = i + 1) {
      let g = state.ghosts[i]
      if (g.mode != 3 && !g.inHouse) { // Not eaten and not inside house
        g.mode = 2 // Frightened
        // Turn around
        g.dir = (g.dir == 0) ? 2 : (g.dir == 1) ? 3 : (g.dir == 2) ? 0 : 1
      }
    }
  }

  // 4. Eat Bonus Fruit
  if (state.fruitActive && curGx == state.fruitX && curGy == state.fruitY) {
    state.fruitActive = false
    state.score = state.score + state.fruitScore
    if (state.score > state.highScore) { state.highScore = state.score }
    playSound("fruit")
    state.popups.push({ x: curGx, y: curGy, text: to_string(state.fruitScore), life: 40 })
  }
}

function checkGhostCollisions() {
  for (let mut i = 0; i < Array.len(state.ghosts); i = i + 1) {
    let g = state.ghosts[i]
    let dist = Math.sqrt(distanceSq(state.pacX, state.pacY, g.px, g.py))

    if (dist < 0.65) {
      if (g.mode == 2) {
        // Eat Frightened Ghost!
        g.mode = 3 // Eaten (eyes return home)
        let pts = state.ghostComboMultiplier
        state.score = state.score + pts
        if (state.score > state.highScore) { state.highScore = state.score }
        state.ghostComboMultiplier = state.ghostComboMultiplier * 2
        playSound("eat_ghost")
        state.popups.push({ x: g.px, y: g.py, text: to_string(pts), life: 50 })
      } else if (g.mode != 3 && !g.inHouse) {
        // Pac-Man Dies!
        playSound("death")
        state.lives = state.lives - 1
        if (state.lives <= 0) {
          state.gameState = 4 // Game Over
        } else {
          state.gameState = 3 // Life Lost
          resetPositions()
        }
        renderUI()
        return
      }
    }
  }
}

// ============================================================================
// 9. Main Game Loop Step
// ============================================================================

function gameStep() {
  state.animTick = state.animTick + 1

  if (state.gameState != 1) { return } // Only update if Playing

  // 1. Timers & Scatter/Chase Mode Cycle (7s Scatter / 20s Chase)
  if (state.frightenedTimer > 0) {
    state.frightenedTimer = state.frightenedTimer - 1
    if (state.frightenedTimer == 0) {
      for (let mut i = 0; i < Array.len(state.ghosts); i = i + 1) {
        let g = state.ghosts[i]
        if (g.mode == 2) {
          g.mode = state.isGlobalChase ? 1 : 0
        }
      }
    }
  } else {
    state.modeTimer = state.modeTimer + 1
    if (!state.isGlobalChase && state.modeTimer > 420) { // 7 seconds
      state.isGlobalChase = true
      state.modeTimer = 0
    } else if (state.isGlobalChase && state.modeTimer > 1200) { // 20 seconds
      state.isGlobalChase = false
      state.modeTimer = 0
    }
  }

  // Fruit active timer
  if (state.fruitActive) {
    state.fruitTimer = state.fruitTimer - 1
    if (state.fruitTimer <= 0) { state.fruitActive = false }
  }

  // Popups decay
  let mut livePopups = []
  for (let mut i = 0; i < Array.len(state.popups); i = i + 1) {
    let p = state.popups[i]
    p.life = p.life - 1
    if (p.life > 0) { livePopups.push(p) }
  }
  state.popups = livePopups

  // 2. Update Pac-Man & Ghosts
  updatePacman()

  for (let mut i = 0; i < Array.len(state.ghosts); i = i + 1) {
    updateGhost(state.ghosts[i])
  }

  checkGhostCollisions()
}

// ============================================================================
// 10. Canvas 2D Rendering Engine
// ============================================================================

function drawCanvas() {
  let canvas = getElementById("pacman-canvas")
  if (!canvas) { return }
  let ctx = canvas.getContext("2d")
  if (!ctx) { return }

  let width = 504
  let height = 504
  let tileSize = 24

  // Clear Background
  ctx.fillStyle = "#020617" // Deep Slate Black
  ctx.fillRect(0, 0, width, height)

  // 1. Draw Maze Walls & Pellets
  for (let mut r = 0; r < MAZE_ROWS; r = r + 1) {
    for (let mut c = 0; c < MAZE_COLS; c = c + 1) {
      let tile = getTile(c, r)
      let x = c * tileSize
      let y = r * tileSize

      if (tile == 1) {
        // Wall block with neon border glow
        ctx.fillStyle = "#0f172a"
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2)
        ctx.strokeStyle = "#38bdf8" // Neon Sky Blue
        ctx.lineWidth = 1.5
        ctx.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4)
      } else if (tile == 4) {
        // Ghost House Door
        ctx.strokeStyle = "#f472b6"
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(x, y + tileSize / 2)
        ctx.lineTo(x + tileSize, y + tileSize / 2)
        ctx.stroke()
      } else if (tile == 2) {
        // Small Dot
        ctx.fillStyle = "#fef08a" // Golden Yellow
        ctx.beginPath()
        ctx.arc(x + tileSize / 2, y + tileSize / 2, 2.5, 0, 6.283)
        ctx.fill()
      } else if (tile == 3) {
        // Energizer Power Pellet (Pulsing glow)
        let pulse = 5.0 + Math.sin(state.animTick * 0.2) * 1.5
        ctx.fillStyle = "#ffffff"
        ctx.shadowColor = "#facc15"
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(x + tileSize / 2, y + tileSize / 2, pulse, 0, 6.283)
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }
  }

  // 2. Draw Fruit Bonus
  if (state.fruitActive) {
    let fx = state.fruitX * tileSize + tileSize / 2
    let fy = state.fruitY * tileSize + tileSize / 2
    ctx.fillStyle = "#ef4444"
    ctx.beginPath()
    ctx.arc(fx, fy, 8, 0, 6.283)
    ctx.fill()
    // Stem
    ctx.strokeStyle = "#22c55e"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(fx, fy - 6)
    ctx.lineTo(fx + 4, fy - 12)
    ctx.stroke()
  }

  // 3. Optional Debug Radar / AI Target Vectors
  if (state.showRadar) {
    for (let mut i = 0; i < Array.len(state.ghosts); i = i + 1) {
      let g = state.ghosts[i]
      let gx = g.px * tileSize + tileSize / 2
      let gy = g.py * tileSize + tileSize / 2
      let tx = g.targetX * tileSize + tileSize / 2
      let ty = g.targetY * tileSize + tileSize / 2

      ctx.strokeStyle = g.color
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(gx, gy)
      ctx.lineTo(tx, ty)
      ctx.stroke()
      ctx.setLineDash([])

      // Target Ring
      ctx.strokeStyle = g.color
      ctx.strokeRect(tx - 6, ty - 6, 12, 12)
    }
  }

  // 4. Draw Ghosts
  for (let mut i = 0; i < Array.len(state.ghosts); i = i + 1) {
    let g = state.ghosts[i]
    let gx = g.px * tileSize + tileSize / 2
    let gy = g.py * tileSize + tileSize / 2
    let rad = 9.5

    if (g.mode == 3) {
      // Eaten: Draw floating eyes
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(gx - 4, gy - 2, 3.5, 0, 6.283)
      ctx.arc(gx + 4, gy - 2, 3.5, 0, 6.283)
      ctx.fill()
      // Pupils
      ctx.fillStyle = "#1e3a8a"
      let gd = DIRS[g.dir]
      ctx.beginPath()
      ctx.arc(gx - 4 + gd[0] * 1.5, gy - 2 + gd[1] * 1.5, 1.8, 0, 6.283)
      ctx.arc(gx + 4 + gd[0] * 1.5, gy - 2 + gd[1] * 1.5, 1.8, 0, 6.283)
      ctx.fill()
    } else {
      // Full Ghost Body
      let gColor = (g.mode == 2)
        ? (state.frightenedTimer < 100 && (state.animTick % 10 < 5) ? "#ffffff" : "#1d4ed8")
        : g.color

      ctx.fillStyle = gColor
      ctx.beginPath()
      // Head arc
      ctx.arc(gx, gy - 2, rad, 3.1415, 0, false)
      // Body & Wavy skirt
      ctx.lineTo(gx + rad, gy + rad)
      ctx.lineTo(gx + rad * 0.5, gy + rad - 3)
      ctx.lineTo(gx, gy + rad)
      ctx.lineTo(gx - rad * 0.5, gy + rad - 3)
      ctx.lineTo(gx - rad, gy + rad)
      ctx.closePath()
      ctx.fill()

      if (g.mode == 2) {
        // Frightened face
        ctx.fillStyle = "#fef08a"
        ctx.fillRect(gx - 5, gy - 4, 2.5, 2.5)
        ctx.fillRect(gx + 2.5, gy - 4, 2.5, 2.5)
        // Wavy mouth
        ctx.strokeStyle = "#fef08a"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(gx - 5, gy + 3)
        ctx.lineTo(gx - 2, gy + 1)
        ctx.lineTo(gx + 1, gy + 3)
        ctx.lineTo(gx + 4, gy + 1)
        ctx.stroke()
      } else {
        // Normal Eyes & Directional Pupils
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(gx - 4, gy - 4, 3.2, 0, 6.283)
        ctx.arc(gx + 4, gy - 4, 3.2, 0, 6.283)
        ctx.fill()

        ctx.fillStyle = "#0f172a"
        let gd = DIRS[g.dir]
        ctx.beginPath()
        ctx.arc(gx - 4 + gd[0] * 1.5, gy - 4 + gd[1] * 1.5, 1.8, 0, 6.283)
        ctx.arc(gx + 4 + gd[0] * 1.5, gy - 4 + gd[1] * 1.5, 1.8, 0, 6.283)
        ctx.fill()
      }
    }
  }

  // 5. Draw Pac-Man
  let px = state.pacX * tileSize + tileSize / 2
  let py = state.pacY * tileSize + tileSize / 2
  let pacRad = 10.5

  let rot = (state.pacDir == 1) ? 0 : (state.pacDir == 2) ? 1.57 : (state.pacDir == 3) ? 3.1415 : 4.712

  ctx.fillStyle = "#facc15" // Pacman Yellow
  ctx.beginPath()
  ctx.arc(px, py, pacRad, rot + state.pacMouthAngle, rot + 6.283 - state.pacMouthAngle, false)
  ctx.lineTo(px, py)
  ctx.closePath()
  ctx.fill()

  // 6. Draw Score Popups
  for (let mut i = 0; i < Array.len(state.popups); i = i + 1) {
    let pop = state.popups[i]
    let popX = pop.x * tileSize
    let popY = pop.y * tileSize - (50 - pop.life) * 0.3
    ctx.fillStyle = "#38bdf8"
    ctx.font = "bold 12px monospace"
    ctx.fillText(pop.text, popX, popY)
  }

  // 7. Overlay Messages
  if (state.gameState == 0) {
    // Ready!
    ctx.fillStyle = "#facc15"
    ctx.font = "bold 22px monospace"
    ctx.textAlign = "center"
    ctx.fillText("READY!", width / 2, height / 2 + 38)
    ctx.textAlign = "left"
  } else if (state.gameState == 2) {
    // Paused
    ctx.fillStyle = "#38bdf8"
    ctx.font = "bold 22px monospace"
    ctx.textAlign = "center"
    ctx.fillText("PAUSED", width / 2, height / 2 + 38)
    ctx.textAlign = "left"
  } else if (state.gameState == 4) {
    // Game Over
    ctx.fillStyle = "#ef4444"
    ctx.font = "bold 24px monospace"
    ctx.textAlign = "center"
    ctx.fillText("GAME OVER", width / 2, height / 2 + 38)
    ctx.textAlign = "left"
  } else if (state.gameState == 5) {
    // Victory
    ctx.fillStyle = "#22c55e"
    ctx.font = "bold 22px monospace"
    ctx.textAlign = "center"
    ctx.fillText("VICTORY! LEVEL CLEAR!", width / 2, height / 2 + 38)
    ctx.textAlign = "left"
  }
}

// ============================================================================
// 11. Virtual DOM UI Layout & Interactive Controls
// ============================================================================

function triggerDirection(dir: number) {
  state.pacNextDir = dir
  if (state.gameState == 0 || state.gameState == 3) {
    state.gameState = 1 // Auto-start moving
    renderUI()
  }
}

function updateHUD() {
  let scoreEl = DOM.getElementById("pac-score")
  if (scoreEl) { DOM.setText(scoreEl, to_string(state.score)) }
  let hsEl = DOM.getElementById("pac-highscore")
  if (hsEl) { DOM.setText(hsEl, to_string(state.highScore)) }
}

function renderUI() {
  let livesIcons = []
  for (let mut i = 0; i < state.lives; i = i + 1) {
    livesIcons.push(h("span", { className: "text-amber-400 text-lg sm:text-xl drop-shadow" }, "🟡"))
  }

  let statusBadge = (state.gameState == 1)
    ? h("span", { className: "px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30 animate-pulse" }, "▶ PLAYING")
    : (state.gameState == 2)
      ? h("span", { className: "px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30" }, "⏸ PAUSED")
      : (state.gameState == 4)
        ? h("span", { className: "px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-xs font-bold border border-rose-500/30" }, "💀 GAME OVER")
        : (state.gameState == 5)
          ? h("span", { className: "px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30 animate-bounce" }, "🏆 VICTORY")
          : h("span", { className: "px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30" }, "READY")

  let vnode = h("div", { className: "w-full max-w-4xl mx-auto p-2 sm:p-4 text-slate-100 font-sans flex flex-col space-y-3" }, [
    // Top Arcade Header
    h("div", { className: "flex items-center justify-between pb-2 border-b border-slate-800" }, [
      h("div", { className: "flex items-center space-x-2.5" }, [
        h("span", { className: "text-2xl" }, "🟡"),
        h("h1", { className: "text-xl sm:text-2xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-rose-400 bg-clip-text text-transparent tracking-wider" }, "PAC-MAN 1980"),
        h("span", { className: "text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-mono font-bold border border-yellow-500/30 hidden sm:inline" }, "TypeLang GADT Arcade")
      ]),
      h("div", { className: "flex items-center space-x-2" }, [
        statusBadge
      ])
    ]),

    // Scoreboard Banner
    h("div", { className: "grid grid-cols-3 gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg text-center" }, [
      h("div", { className: "flex flex-col" }, [
        h("span", { className: "text-[11px] font-mono uppercase tracking-wider text-slate-400" }, "SCORE"),
        h("span", { id: "pac-score", className: "text-lg sm:text-xl font-mono font-black text-amber-300" }, to_string(state.score))
      ]),
      h("div", { className: "flex flex-col" }, [
        h("span", { className: "text-[11px] font-mono uppercase tracking-wider text-slate-400" }, "HIGH SCORE"),
        h("span", { id: "pac-highscore", className: "text-lg sm:text-xl font-mono font-black text-cyan-300" }, to_string(state.highScore))
      ]),
      h("div", { className: "flex flex-col items-center" }, [
        h("span", { className: "text-[11px] font-mono uppercase tracking-wider text-slate-400" }, "LIVES / LEVEL"),
        h("div", { className: "flex items-center space-x-1" }, [
          h("div", { className: "flex space-x-0.5 mr-2" }, livesIcons),
          h("span", { className: "text-xs font-mono font-bold text-slate-300" }, concat("Lv.", to_string(state.level)))
        ])
      ])
    ]),

    // Main Game Arena: Canvas + Control Panel
    h("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 items-start" }, [
      // Left: 2D Arcade Canvas
      h("div", { className: "md:col-span-2 flex flex-col items-center" }, [
        h("div", { className: "p-2 bg-slate-950 rounded-2xl border-4 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden" }, [
          h("canvas", {
            id: "pacman-canvas",
            width: "504",
            height: "504",
            className: "w-full max-w-[504px] aspect-square rounded-lg cursor-pointer bg-slate-950"
          }, [])
        ])
      ]),

      // Right: Ghost AI Cards & Controls
      h("div", { className: "flex flex-col space-y-3" }, [
        // Ghost AI Radar & Personalities Info
        h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs flex flex-col space-y-2" }, [
          h("div", { className: "font-bold text-slate-300 flex justify-between items-center" }, [
            h("span", {}, "👻 Ghost Personalities"),
            h("button", {
              className: concat("px-2 py-0.5 rounded border text-[10px] font-mono cursor-pointer transition-colors ", state.showRadar ? "bg-cyan-500/20 border-cyan-400 text-cyan-300" : "bg-slate-800 border-slate-700 text-slate-400"),
              onClick: fn() { state.showRadar = !state.showRadar; renderUI() }
            }, state.showRadar ? "🎯 Radar ON" : "🎯 Radar OFF")
          ]),
          h("div", { className: "flex items-center space-x-2 text-[11px]" }, [
            h("span", { className: "w-3 h-3 rounded-full bg-red-500 inline-block shadow" }, []),
            h("span", { className: "font-bold text-red-400 w-14" }, "Blinky:"),
            h("span", { className: "text-slate-400" }, "Aggressive direct chaser")
          ]),
          h("div", { className: "flex items-center space-x-2 text-[11px]" }, [
            h("span", { className: "w-3 h-3 rounded-full bg-pink-400 inline-block shadow" }, []),
            h("span", { className: "font-bold text-pink-400 w-14" }, "Pinky:"),
            h("span", { className: "text-slate-400" }, "Ambush 4 tiles ahead")
          ]),
          h("div", { className: "flex items-center space-x-2 text-[11px]" }, [
            h("span", { className: "w-3 h-3 rounded-full bg-cyan-400 inline-block shadow" }, []),
            h("span", { className: "font-bold text-cyan-400 w-14" }, "Inky:"),
            h("span", { className: "text-slate-400" }, "Flanker relative to Blinky")
          ]),
          h("div", { className: "flex items-center space-x-2 text-[11px]" }, [
            h("span", { className: "w-3 h-3 rounded-full bg-orange-400 inline-block shadow" }, []),
            h("span", { className: "font-bold text-orange-400 w-14" }, "Clyde:"),
            h("span", { className: "text-slate-400" }, "Shy coward near Pacman")
          ])
        ]),

        // Interactive Touch D-Pad for Mobile & Desktop
        h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col items-center space-y-1" }, [
          h("span", { className: "text-[10px] font-mono text-slate-400 uppercase font-semibold pb-1" }, "D-Pad Navigation"),
          h("button", {
            className: "w-12 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-500/30 rounded-lg border border-slate-700 text-lg flex items-center justify-center cursor-pointer transition-all active:scale-90",
            onClick: fn() { triggerDirection(0) }
          }, "⬆️"),
          h("div", { className: "flex space-x-2" }, [
            h("button", {
              className: "w-12 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-500/30 rounded-lg border border-slate-700 text-lg flex items-center justify-center cursor-pointer transition-all active:scale-90",
              onClick: fn() { triggerDirection(3) }
            }, "⬅️"),
            h("button", {
              className: "w-12 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-500/30 rounded-lg border border-slate-700 text-lg flex items-center justify-center cursor-pointer transition-all active:scale-90",
              onClick: fn() { triggerDirection(2) }
            }, "⬇️"),
            h("button", {
              className: "w-12 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-500/30 rounded-lg border border-slate-700 text-lg flex items-center justify-center cursor-pointer transition-all active:scale-90",
              onClick: fn() { triggerDirection(1) }
            }, "➡️")
          ])
        ]),

        // Game Action Buttons
        h("div", { className: "flex flex-col space-y-2 pt-1" }, [
          h("div", { className: "flex space-x-2" }, [
            h("button", {
              className: "flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-lg text-xs cursor-pointer shadow transition-all",
              onClick: fn() {
                if (state.gameState == 1) {
                  state.gameState = 2 // Pause
                } else {
                  state.gameState = 1 // Play
                }
                renderUI()
              }
            }, state.gameState == 1 ? "⏸ Pause" : "▶ Start / Resume"),
            h("button", {
              className: "px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs cursor-pointer active:scale-95",
              onClick: fn() { state.audioEnabled = !state.audioEnabled; renderUI() }
            }, state.audioEnabled ? "🔊 Sound ON" : "🔇 Sound OFF")
          ]),
          h("button", {
            className: "w-full py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold rounded-lg text-xs cursor-pointer transition-all active:scale-95",
            onClick: fn() { initNewGame(); renderUI() }
          }, "🔄 Reset / New Game")
        ])
      ])
    ]),

    // Keyboard Shortcuts Footer
    h("div", { className: "p-2 bg-slate-900/60 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-400 flex flex-wrap justify-between gap-2" }, [
      h("span", {}, "🎮 WASD / Arrow Keys: Move Pac-Man"),
      h("span", {}, "🛑 [Space] / [P]: Pause & Resume"),
      h("span", {}, "🔄 [R]: Reset Game")
    ])
  ])

  mount("app-root", vnode)
  drawCanvas()
}

// ============================================================================
// 12. Keyboard Handlers & Game Loop Animation
// ============================================================================

function handleKeyDown(e: any) {
  let k = e.key
  if (k == "w" || k == "W" || k == "ArrowUp") { triggerDirection(0) }
  else if (k == "d" || k == "D" || k == "ArrowRight") { triggerDirection(1) }
  else if (k == "s" || k == "S" || k == "ArrowDown") { triggerDirection(2) }
  else if (k == "a" || k == "A" || k == "ArrowLeft") { triggerDirection(3) }
  else if (k == " " || k == "p" || k == "P") {
    if (state.gameState == 1) { state.gameState = 2 }
    else if (state.gameState == 2 || state.gameState == 0) { state.gameState = 1 }
    renderUI()
  } else if (k == "r" || k == "R") {
    initNewGame()
    renderUI()
  }
}

if (window && window.addEventListener) {
  if (window._tl_pac_keydown && window.removeEventListener) {
    window.removeEventListener("keydown", window._tl_pac_keydown)
  }
  window._tl_pac_keydown = handleKeyDown
  window.addEventListener("keydown", handleKeyDown)
}

function startLoop() {
  if (window && window._tl_pac_timer) {
    clearInterval(window._tl_pac_timer)
  }
  let _timer = setInterval(fn() {
    gameStep()
    drawCanvas()
    if (state.animTick % 6 == 0) {
      updateHUD()
    }
  }, 16)
  if (window) {
    window._tl_pac_timer = _timer
  }
}

// ============================================================================
// 13. Bootstrap Execution
// ============================================================================

initNewGame()
renderUI()
startLoop()

println("================================================================")
println("🟡 TypeLang Pac-Man 1980 Arcade Game Engine Initialized!")
println("================================================================")
println("• Authentic 4 Ghost AI Personalities (Blinky, Pinky, Inky, Clyde)")
println("• Scatter / Chase / Frightened / Eaten GADT Finite State Machines")
println("• Grid Cornering Buffer, Warp Tunnels & Fruit Bonus Spawns")
println("• 1980s Retro Web Audio Synthesis & Interactive Touch D-Pad")
println("================================================================")
`
};
