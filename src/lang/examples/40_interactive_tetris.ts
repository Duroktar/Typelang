import { ExampleProgram } from "./types";

export const example40Tetris: ExampleProgram = {
  id: "tetris_arcade",
  name: "40. Tetris 1989 Arcade (GADT State Machine & SRS Rotation Engine)",
  title: "40. Tetris 1989 Arcade (GADT State Machine & SRS Rotation Engine)",
  category: "Games & Graphics",
  description: "An authentic 1989 arcade Tetris engine in TypeLang featuring GADTs, the 7 standard tetrominoes, Super Rotation System (SRS) with wall kicks, 7-Bag fair randomizer, ghost piece drop projection, hold piece queue, 4-line Tetris combos with confetti, Korobeiniki 8-bit chiptune audio synthesizer, and mobile touch D-pad.",
  code: `import DOM.{ h, mount, getElementById, playRamp, playSequence, startMusic, stopMusic, confetti }
import Math.{ floor, max, min, abs, random, sqrt, cos, sin }

extern let window: any

// ============================================================================
// 1. GADT Domain Models
// ============================================================================

type TetrominoKind =
  | TetroI: TetrominoKind // Cyan
  | TetroJ: TetrominoKind // Blue
  | TetroL: TetrominoKind // Orange
  | TetroO: TetrominoKind // Yellow
  | TetroS: TetrominoKind // Green
  | TetroT: TetrominoKind // Purple
  | TetroZ: TetrominoKind // Red

type GameState =
  | StateReady: GameState
  | StatePlaying: GameState
  | StatePaused: GameState
  | StateLineClear: GameState
  | StateGameOver: GameState

type MoveAction =
  | ActionLeft: MoveAction
  | ActionRight: MoveAction
  | ActionSoftDrop: MoveAction
  | ActionHardDrop: MoveAction
  | ActionRotateCW: MoveAction
  | ActionRotateCCW: MoveAction
  | ActionHold: MoveAction

// ============================================================================
// 2. Constants & Piece Definitions
// ============================================================================

let COLS = 10
let ROWS = 20
let HIDDEN_ROWS = 2
let TOTAL_ROWS = 22
let BLOCK_SIZE = 24

// Piece Colors: I, J, L, O, S, T, Z
let PIECE_COLORS = [
  "#06b6d4", // 0: I - Cyan
  "#3b82f6", // 1: J - Blue
  "#f97316", // 2: L - Orange
  "#eab308", // 3: O - Yellow
  "#22c55e", // 4: S - Green
  "#a855f7", // 5: T - Purple
  "#ef4444"  // 6: Z - Red
]

let PIECE_NAMES = ["I", "J", "L", "O", "S", "T", "Z"]

// 4 Rotations for each of the 7 tetrominoes: [kind][rot][block_idx] -> [x, y]
// I Piece (4x4 bounding box)
let I_SHAPES = [
  [[0, 1], [1, 1], [2, 1], [3, 1]],
  [[2, 0], [2, 1], [2, 2], [2, 3]],
  [[0, 2], [1, 2], [2, 2], [3, 2]],
  [[1, 0], [1, 1], [1, 2], [1, 3]]
]

// J Piece (3x3 bounding box)
let J_SHAPES = [
  [[0, 0], [0, 1], [1, 1], [2, 1]],
  [[1, 0], [2, 0], [1, 1], [1, 2]],
  [[0, 1], [1, 1], [2, 1], [2, 2]],
  [[1, 0], [1, 1], [0, 2], [1, 2]]
]

// L Piece (3x3 bounding box)
let L_SHAPES = [
  [[2, 0], [0, 1], [1, 1], [2, 1]],
  [[1, 0], [1, 1], [1, 2], [2, 2]],
  [[0, 1], [1, 1], [2, 1], [0, 2]],
  [[0, 0], [1, 0], [1, 1], [1, 2]]
]

// O Piece (2x2 bounding box)
let O_SHAPES = [
  [[1, 0], [2, 0], [1, 1], [2, 1]],
  [[1, 0], [2, 0], [1, 1], [2, 1]],
  [[1, 0], [2, 0], [1, 1], [2, 1]],
  [[1, 0], [2, 0], [1, 1], [2, 1]]
]

// S Piece (3x3 bounding box)
let S_SHAPES = [
  [[1, 0], [2, 0], [0, 1], [1, 1]],
  [[1, 0], [1, 1], [2, 1], [2, 2]],
  [[1, 1], [2, 1], [0, 2], [1, 2]],
  [[0, 0], [0, 1], [1, 1], [1, 2]]
]

// T Piece (3x3 bounding box)
let T_SHAPES = [
  [[1, 0], [0, 1], [1, 1], [2, 1]],
  [[1, 0], [1, 1], [2, 1], [1, 2]],
  [[0, 1], [1, 1], [2, 1], [1, 2]],
  [[1, 0], [0, 1], [1, 1], [1, 2]]
]

// Z Piece (3x3 bounding box)
let Z_SHAPES = [
  [[0, 0], [1, 0], [1, 1], [2, 1]],
  [[2, 0], [1, 1], [2, 1], [1, 2]],
  [[0, 1], [1, 1], [1, 2], [2, 2]],
  [[1, 0], [0, 1], [1, 1], [0, 2]]
]

function getPieceCoords(kind: number, rot: number): number[][] {
  let r = rot % 4
  if (kind == 0) { return I_SHAPES[r] }
  if (kind == 1) { return J_SHAPES[r] }
  if (kind == 2) { return L_SHAPES[r] }
  if (kind == 3) { return O_SHAPES[r] }
  if (kind == 4) { return S_SHAPES[r] }
  if (kind == 5) { return T_SHAPES[r] }
  Z_SHAPES[r]
}

// ============================================================================
// 3. Mutable Game Engine State
// ============================================================================

let mut state = {
  mut gameState: 0, // 0: Ready, 1: Playing, 2: Paused, 3: LineClear, 4: GameOver
  mut score: 0,
  mut highScore: 0,
  mut level: 1,
  mut linesCleared: 0,
  mut comboCount: 0,
  mut backToBack: false,
  // Board matrix: TOTAL_ROWS (22) * COLS (10). 0: empty, 1..7: piece color index + 1
  mut grid: [],
  // 7-Bag Randomizer
  mut bag: [],
  // Active Tetromino
  mut curKind: 0,
  mut curRot: 0,
  mut curX: 3,
  mut curY: 0,
  // Hold piece
  mut holdKind: -1,
  mut canHold: true,
  // Next pieces preview queue (3 pieces)
  mut nextQueue: [],
  // Timing & Gravity
  mut dropCounter: 0,
  mut lockDelay: 0,
  mut maxLockDelay: 30, // ~0.5s grace window at bottom
  mut lockMovesRemaining: 15,
  // Animation for line clearing
  mut clearingRows: [],
  mut clearAnimTimer: 0,
  // Sound & Music
  mut audioEnabled: true,
  mut musicEnabled: false,
  mut animTick: 0,
  // Tetromino statistics counters (I, J, L, O, S, T, Z)
  mut pieceStats: [0, 0, 0, 0, 0, 0, 0]
}

// ============================================================================
// 4. Web Audio Retro Synthesizer
// ============================================================================

function playSound(soundKey: string) {
  if (!state.audioEnabled) { return }

  if (soundKey == "move") {
    let _ = playRamp(320.0, 480.0, 0.03, "triangle", 0.08)
  } else if (soundKey == "rotate") {
    let _ = playRamp(440.0, 720.0, 0.04, "square", 0.06)
  } else if (soundKey == "hard_drop") {
    let _ = playRamp(160.0, 40.0, 0.1, "sawtooth", 0.2)
  } else if (soundKey == "lock") {
    let _ = playRamp(220.0, 110.0, 0.05, "sine", 0.1)
  } else if (soundKey == "hold") {
    let _ = playSequence([523.0, 659.0], 0.04, "sine", 0.1)
  } else if (soundKey == "clear_single") {
    let _ = playSequence([440.0, 659.0], 0.05, "triangle", 0.12)
  } else if (soundKey == "clear_multi") {
    let _ = playSequence([440.0, 554.0, 659.0, 880.0], 0.04, "square", 0.12)
  } else if (soundKey == "tetris") {
    let _ = playSequence([523.0, 659.0, 784.0, 1046.0, 1318.0], 0.05, "sawtooth", 0.15)
  } else if (soundKey == "game_over") {
    let _ = playSequence([392.0, 349.0, 311.0, 261.0], 0.12, "sawtooth", 0.15)
  }
}

// Optional 8-Bit Chiptune Theme Music (Korobeiniki)
function toggleMusic() {
  state.musicEnabled = !state.musicEnabled
  if (state.musicEnabled) {
    let notes = [
      659.0, 493.0, 523.0, 587.0, 523.0, 493.0, 440.0, 440.0, 523.0, 659.0,
      587.0, 523.0, 493.0, 523.0, 587.0, 659.0, 523.0, 440.0, 440.0, 0.0,
      587.0, 698.0, 880.0, 784.0, 698.0, 659.0, 523.0, 659.0, 587.0, 523.0,
      493.0, 493.0, 523.0, 587.0, 659.0, 523.0, 440.0, 440.0
    ]
    let _ = startMusic("tetris_music", notes, 240.0, "square", 0.04)
  } else {
    let _ = stopMusic("tetris_music")
  }
  renderUI()
}

// ============================================================================
// 5. Board Grid Operations
// ============================================================================

function initGrid() {
  state.grid = []
  for (let mut i = 0; i < TOTAL_ROWS * COLS; i = i + 1) {
    state.grid.push(0)
  }
}

function getGridCell(x: number, y: number): number {
  if (x < 0 || x >= COLS || y < 0 || y >= TOTAL_ROWS) {
    return 1 // out of bounds treated as filled
  }
  state.grid[y * COLS + x]
}

function setGridCell(x: number, y: number, val: number) {
  if (x >= 0 && x < COLS && y >= 0 && y < TOTAL_ROWS) {
    state.grid[y * COLS + x] = val
  }
}

// ============================================================================
// 6. 7-Bag Fair Piece Generator
// ============================================================================

function refillBag() {
  let bag = [0, 1, 2, 3, 4, 5, 6]
  // Fisher-Yates Shuffle
  for (let mut i = 6; i > 0; i = i - 1) {
    let j = Math.floor(Math.random() * (i + 1))
    let tmp = bag[i]
    bag[i] = bag[j]
    bag[j] = tmp
  }
  for (let mut k = 0; k < 7; k = k + 1) {
    state.bag.push(bag[k])
  }
}

function popBag(): number {
  if (Array.len(state.bag) <= 4) {
    refillBag()
  }
  let p = state.bag[0]
  let newBag = []
  for (let mut i = 1; i < Array.len(state.bag); i = i + 1) {
    newBag.push(state.bag[i])
  }
  state.bag = newBag
  p
}

function initNextQueue() {
  state.bag = []
  refillBag()
  refillBag()
  state.nextQueue = [popBag(), popBag(), popBag()]
}

function spawnPiece(): boolean {
  state.curKind = state.nextQueue[0]
  let newQueue = [state.nextQueue[1], state.nextQueue[2], popBag()]
  state.nextQueue = newQueue

  state.curRot = 0
  state.curX = 3
  state.curY = 0 // Top hidden rows
  state.canHold = true
  state.lockDelay = 0
  state.lockMovesRemaining = 15

  // Increment piece statistics
  state.pieceStats[state.curKind] = state.pieceStats[state.curKind] + 1

  // Check if spawn position collides (Game Over condition)
  if (!isValidPosition(state.curKind, state.curRot, state.curX, state.curY)) {
    state.gameState = 4 // GameOver
    playSound("game_over")
    renderUI()
    return false
  }
  true
}

// ============================================================================
// 7. Collision Detection & Wall Kick Rules
// ============================================================================

function isValidPosition(kind: number, rot: number, px: number, py: number): boolean {
  let coords = getPieceCoords(kind, rot)
  for (let mut i = 0; i < Array.len(coords); i = i + 1) {
    let block = coords[i]
    let bx = px + block[0]
    let by = py + block[1]

    // Left/right wall bounds
    if (bx < 0 || bx >= COLS) { return false }
    // Bottom floor bounds
    if (by >= TOTAL_ROWS) { return false }
    // Cell collision with settled grid blocks (only if within grid)
    if (by >= 0) {
      if (getGridCell(bx, by) > 0) { return false }
    }
  }
  true
}

// Super Rotation System (SRS) Wall Kick Offsets
let KICK_OFFSETS = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [0, -1],
  [-2, 0],
  [2, 0],
  [-1, -1],
  [1, -1]
]

function tryRotate(direction: number): boolean {
  let newRot = (state.curRot + direction + 4) % 4

  for (let mut i = 0; i < Array.len(KICK_OFFSETS); i = i + 1) {
    let kick = KICK_OFFSETS[i]
    let testX = state.curX + kick[0]
    let testY = state.curY + kick[1]

    if (isValidPosition(state.curKind, newRot, testX, testY)) {
      state.curRot = newRot
      state.curX = testX
      state.curY = testY
      playSound("rotate")
      if (state.lockMovesRemaining > 0) {
        state.lockDelay = 0
        state.lockMovesRemaining = state.lockMovesRemaining - 1
      }
      return true
    }
  }
  false
}

// Calculate Ghost Drop Y
function getGhostY(): number {
  let mut ghostY = state.curY
  while (isValidPosition(state.curKind, state.curRot, state.curX, ghostY + 1)) {
    ghostY = ghostY + 1
  }
  ghostY
}

// ============================================================================
// 8. Player Actions
// ============================================================================

function moveLeft() {
  if (state.gameState != 1) { return }
  if (isValidPosition(state.curKind, state.curRot, state.curX - 1, state.curY)) {
    state.curX = state.curX - 1
    playSound("move")
    if (state.lockMovesRemaining > 0) {
      state.lockDelay = 0
      state.lockMovesRemaining = state.lockMovesRemaining - 1
    }
  }
}

function moveRight() {
  if (state.gameState != 1) { return }
  if (isValidPosition(state.curKind, state.curRot, state.curX + 1, state.curY)) {
    state.curX = state.curX + 1
    playSound("move")
    if (state.lockMovesRemaining > 0) {
      state.lockDelay = 0
      state.lockMovesRemaining = state.lockMovesRemaining - 1
    }
  }
}

function softDrop() {
  if (state.gameState != 1) { return }
  if (isValidPosition(state.curKind, state.curRot, state.curX, state.curY + 1)) {
    state.curY = state.curY + 1
    state.score = state.score + 1
    updateHUD()
  }
}

function hardDrop() {
  if (state.gameState != 1) { return }
  let ghostY = getGhostY()
  let dist = ghostY - state.curY
  state.curY = ghostY
  state.score = state.score + (dist * 2)
  playSound("hard_drop")
  lockPiece()
  updateHUD()
}

function rotateCW() {
  if (state.gameState != 1) { return }
  let _ = tryRotate(1)
}

function rotateCCW() {
  if (state.gameState != 1) { return }
  let _ = tryRotate(-1)
}

function holdPiece() {
  if (state.gameState != 1 || !state.canHold) { return }

  let current = state.curKind
  playSound("hold")

  if (state.holdKind == -1) {
    state.holdKind = current
    let _ = spawnPiece()
  } else {
    let prevHeld = state.holdKind
    state.holdKind = current
    state.curKind = prevHeld
    state.curRot = 0
    state.curX = 3
    state.curY = 0
    state.lockDelay = 0
    state.lockMovesRemaining = 15
    state.pieceStats[state.curKind] = state.pieceStats[state.curKind] + 1
  }

  state.canHold = false
  updateHUD()
}

// ============================================================================
// 9. Piece Lock, Line Clears & Gravity Engine
// ============================================================================

function lockPiece() {
  let coords = getPieceCoords(state.curKind, state.curRot)
  for (let mut i = 0; i < Array.len(coords); i = i + 1) {
    let block = coords[i]
    let bx = state.curX + block[0]
    let by = state.curY + block[1]
    if (by >= 0 && by < TOTAL_ROWS && bx >= 0 && bx < COLS) {
      setGridCell(bx, by, state.curKind + 1)
    }
  }

  playSound("lock")
  checkForLineClears()
}

function checkForLineClears() {
  let fullRows = []

  for (let mut r = 0; r < TOTAL_ROWS; r = r + 1) {
    let mut isFull = true
    for (let mut c = 0; c < COLS; c = c + 1) {
      if (getGridCell(c, r) == 0) {
        isFull = false
      }
    }
    if (isFull) {
      fullRows.push(r)
    }
  }

  let lines = Array.len(fullRows)
  if (lines > 0) {
    state.clearingRows = fullRows
    state.clearAnimTimer = 10
    state.gameState = 3 // LineClear Animation state

    // Classic Tetris Scoring
    let mut basePts = 0
    if (lines == 1) {
      basePts = 100 * state.level
      playSound("clear_single")
    } else if (lines == 2) {
      basePts = 300 * state.level
      playSound("clear_multi")
    } else if (lines == 3) {
      basePts = 500 * state.level
      playSound("clear_multi")
    } else if (lines == 4) {
      // TETRIS!
      basePts = 800 * state.level
      if (state.backToBack) {
        basePts = Math.floor(basePts * 1.5)
      }
      state.backToBack = true
      playSound("tetris")
      let _ = confetti(100.0, 70.0, 0.6)
    }

    if (lines < 4) {
      state.backToBack = false
    }

    state.score = state.score + basePts
    if (state.score > state.highScore) {
      state.highScore = state.score
    }
    state.linesCleared = state.linesCleared + lines
    state.level = Math.floor(state.linesCleared / 10) + 1
    updateHUD()
  } else {
    let _ = spawnPiece()
  }
}

function collapseClearedRows() {
  for (let mut idx = 0; idx < Array.len(state.clearingRows); idx = idx + 1) {
    let targetRow = state.clearingRows[idx]

    // Move all rows above targetRow down by 1
    for (let mut r = targetRow; r > 0; r = r - 1) {
      for (let mut c = 0; c < COLS; c = c + 1) {
        setGridCell(c, r, getGridCell(c, r - 1))
      }
    }
    // Clear topmost row
    for (let mut c = 0; c < COLS; c = c + 1) {
      setGridCell(c, 0, 0)
    }
  }

  state.clearingRows = []
  state.gameState = 1 // Resume playing
  let _ = spawnPiece()
}

// Gravity Frames Speed based on Level
function getGravityFrames(): number {
  let lvl = state.level
  if (lvl >= 15) { return 3 }
  if (lvl >= 12) { return 6 }
  if (lvl >= 9) { return 10 }
  if (lvl >= 6) { return 18 }
  if (lvl >= 4) { return 26 }
  if (lvl >= 2) { return 34 }
  42
}

function gameStep() {
  state.animTick = state.animTick + 1

  if (state.gameState == 3) {
    // Line clear animation in progress
    state.clearAnimTimer = state.clearAnimTimer - 1
    if (state.clearAnimTimer <= 0) {
      collapseClearedRows()
    }
    return
  }

  if (state.gameState != 1) { return }

  // Gravity drop tick
  state.dropCounter = state.dropCounter + 1
  let gravityThreshold = getGravityFrames()

  if (state.dropCounter >= gravityThreshold) {
    state.dropCounter = 0
    if (isValidPosition(state.curKind, state.curRot, state.curX, state.curY + 1)) {
      state.curY = state.curY + 1
      state.lockDelay = 0
    }
  }

  // Check if resting on floor / settled piece for Lock Delay
  if (!isValidPosition(state.curKind, state.curRot, state.curX, state.curY + 1)) {
    state.lockDelay = state.lockDelay + 1
    if (state.lockDelay >= state.maxLockDelay) {
      lockPiece()
    }
  } else {
    state.lockDelay = 0
  }
}

// ============================================================================
// 10. Canvas 2D Rendering Engine
// ============================================================================

function drawBeveledBlock(ctx: any, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, size, size)

  // Top and Left Highlights (White tint)
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)"
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + size, y)
  ctx.lineTo(x + size - 3, y + 3)
  ctx.lineTo(x + 3, y + 3)
  ctx.lineTo(x + 3, y + size - 3)
  ctx.lineTo(x, y + size)
  ctx.closePath()
  ctx.fill()

  // Bottom and Right Shadows (Black tint)
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)"
  ctx.beginPath()
  ctx.moveTo(x + size, y)
  ctx.lineTo(x + size, y + size)
  ctx.lineTo(x, y + size)
  ctx.lineTo(x + 3, y + size - 3)
  ctx.lineTo(x + size - 3, y + size - 3)
  ctx.lineTo(x + size - 3, y + 3)
  ctx.closePath()
  ctx.fill()

  // Fine border
  ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, size, size)
}

function drawMiniTetromino(ctx: any, kind: number, cx: number, cy: number, size: number) {
  if (kind < 0) { return }
  let coords = getPieceCoords(kind, 0)
  let color = PIECE_COLORS[kind]

  // Calculate bounding box center offset
  let mut minX = 99
  let mut maxX = -99
  let mut minY = 99
  let mut maxY = -99
  for (let mut i = 0; i < Array.len(coords); i = i + 1) {
    let c = coords[i]
    if (c[0] < minX) { minX = c[0] }
    if (c[0] > maxX) { maxX = c[0] }
    if (c[1] < minY) { minY = c[1] }
    if (c[1] > maxY) { maxY = c[1] }
  }
  let pieceWidth = (maxX - minX + 1) * size
  let pieceHeight = (maxY - minY + 1) * size
  let startX = cx - (pieceWidth / 2) - (minX * size)
  let startY = cy - (pieceHeight / 2) - (minY * size)

  for (let mut i = 0; i < Array.len(coords); i = i + 1) {
    let c = coords[i]
    let bx = startX + c[0] * size
    let by = startY + c[1] * size
    drawBeveledBlock(ctx, bx, by, size, color)
  }
}

function drawCanvas() {
  let canvas = getElementById("tetris-canvas")
  if (!canvas) { return }
  let ctx = canvas.getContext("2d")
  if (!ctx) { return }

  let width = 240
  let height = 480
  let bs = BLOCK_SIZE // 24

  // Clear Background
  ctx.fillStyle = "#090d16" // Arcade Deep Navy Slate
  ctx.fillRect(0, 0, width, height)

  // 1. Draw subtle grid background
  ctx.strokeStyle = "#172033"
  ctx.lineWidth = 1
  for (let mut c = 0; c <= COLS; c = c + 1) {
    ctx.beginPath()
    ctx.moveTo(c * bs, 0)
    ctx.lineTo(c * bs, height)
    ctx.stroke()
  }
  for (let mut r = 0; r <= ROWS; r = r + 1) {
    ctx.beginPath()
    ctx.moveTo(0, r * bs)
    ctx.lineTo(width, r * bs)
    ctx.stroke()
  }

  // 2. Draw Settled Matrix Blocks (Skip hidden buffer rows 0 and 1)
  for (let mut r = HIDDEN_ROWS; r < TOTAL_ROWS; r = r + 1) {
    let drawY = (r - HIDDEN_ROWS) * bs

    // Check if this row is currently clearing
    let mut isClearing = false
    for (let mut k = 0; k < Array.len(state.clearingRows); k = k + 1) {
      if (state.clearingRows[k] == r) { isClearing = true }
    }

    if (isClearing) {
      // Flashing beam effect for clearing rows
      ctx.fillStyle = (state.animTick % 4 < 2) ? "#ffffff" : "#facc15"
      ctx.fillRect(0, drawY, width, bs)
    } else {
      for (let mut c = 0; c < COLS; c = c + 1) {
        let cellVal = getGridCell(c, r)
        if (cellVal > 0) {
          let color = PIECE_COLORS[cellVal - 1]
          drawBeveledBlock(ctx, c * bs, drawY, bs, color)
        }
      }
    }
  }

  // 3. Draw Active Piece and Ghost Piece (if game active)
  if (state.gameState == 1 || state.gameState == 2) {
    let ghostY = getGhostY()
    let coords = getPieceCoords(state.curKind, state.curRot)
    let pColor = PIECE_COLORS[state.curKind]

    // 3a. Ghost Piece (Translucent outline)
    ctx.strokeStyle = pColor
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)"
    ctx.lineWidth = 2
    for (let mut i = 0; i < Array.len(coords); i = i + 1) {
      let b = coords[i]
      let gx = (state.curX + b[0]) * bs
      let gy = (ghostY + b[1] - HIDDEN_ROWS) * bs
      if (ghostY + b[1] >= HIDDEN_ROWS) {
        ctx.fillRect(gx + 2, gy + 2, bs - 4, bs - 4)
        ctx.strokeRect(gx + 2, gy + 2, bs - 4, bs - 4)
      }
    }

    // 3b. Active Falling Piece
    for (let mut i = 0; i < Array.len(coords); i = i + 1) {
      let b = coords[i]
      let px = (state.curX + b[0]) * bs
      let py = (state.curY + b[1] - HIDDEN_ROWS) * bs
      if (state.curY + b[1] >= HIDDEN_ROWS) {
        drawBeveledBlock(ctx, px, py, bs, pColor)
      }
    }
  }

  // 4. Overlays: Ready, Paused, GameOver
  if (state.gameState == 0) {
    ctx.fillStyle = "rgba(9, 13, 22, 0.85)"
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = "#38bdf8"
    ctx.font = "bold 22px monospace"
    ctx.textAlign = "center"
    ctx.fillText("TETRIS", width / 2, height / 2 - 30)
    ctx.fillStyle = "#facc15"
    ctx.font = "14px monospace"
    ctx.fillText("PRESS START", width / 2, height / 2 + 10)
    ctx.fillStyle = "#94a3b8"
    ctx.font = "11px monospace"
    ctx.fillText("OR PRESS ANY KEY", width / 2, height / 2 + 35)
  } else if (state.gameState == 2) {
    ctx.fillStyle = "rgba(9, 13, 22, 0.8)"
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = "#facc15"
    ctx.font = "bold 20px monospace"
    ctx.textAlign = "center"
    ctx.fillText("PAUSED", width / 2, height / 2)
  } else if (state.gameState == 4) {
    ctx.fillStyle = "rgba(15, 23, 42, 0.9)"
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = "#ef4444"
    ctx.font = "bold 22px monospace"
    ctx.textAlign = "center"
    ctx.fillText("GAME OVER", width / 2, height / 2 - 20)
    ctx.fillStyle = "#f8fafc"
    ctx.font = "14px monospace"
    ctx.fillText("SCORE: " + to_string(state.score), width / 2, height / 2 + 15)
    ctx.fillStyle = "#38bdf8"
    ctx.font = "12px monospace"
    ctx.fillText("TAP RESTART", width / 2, height / 2 + 45)
  }

  // Draw Side Previews (Hold & Next)
  drawHoldCanvas()
  drawNextCanvas()
}

function drawHoldCanvas() {
  let canvas = getElementById("hold-canvas")
  if (!canvas) { return }
  let ctx = canvas.getContext("2d")
  if (!ctx) { return }
  ctx.fillStyle = "#090d16"
  ctx.fillRect(0, 0, 72, 72)
  if (state.holdKind >= 0) {
    drawMiniTetromino(ctx, state.holdKind, 36, 36, 16)
  }
}

function drawNextCanvas() {
  let canvas = getElementById("next-canvas")
  if (!canvas) { return }
  let ctx = canvas.getContext("2d")
  if (!ctx) { return }
  ctx.fillStyle = "#090d16"
  ctx.fillRect(0, 0, 72, 180)
  for (let mut i = 0; i < Array.len(state.nextQueue); i = i + 1) {
    let k = state.nextQueue[i]
    drawMiniTetromino(ctx, k, 36, 30 + i * 58, 14)
  }
}

// ============================================================================
// 11. Interactive Game Control & Keyboard Handlers
// ============================================================================

function startGame() {
  initGrid()
  initNextQueue()
  state.score = 0
  state.level = 1
  state.linesCleared = 0
  state.comboCount = 0
  state.backToBack = false
  state.holdKind = -1
  state.pieceStats = [0, 0, 0, 0, 0, 0, 0]
  state.gameState = 1 // Playing
  let _ = spawnPiece()
  renderUI()
}

function togglePause() {
  if (state.gameState == 1) {
    state.gameState = 2
  } else if (state.gameState == 2) {
    state.gameState = 1
  }
  renderUI()
}

function toggleAudio() {
  state.audioEnabled = !state.audioEnabled
  renderUI()
}

function handleKeyDown(evt: any) {
  let key = evt.key
  if (key == "ArrowLeft" || key == "a" || key == "A") {
    if (state.gameState == 0) { startGame(); return }
    evt.preventDefault()
    moveLeft()
  } else if (key == "ArrowRight" || key == "d" || key == "D") {
    if (state.gameState == 0) { startGame(); return }
    evt.preventDefault()
    moveRight()
  } else if (key == "ArrowDown" || key == "s" || key == "S") {
    if (state.gameState == 0) { startGame(); return }
    evt.preventDefault()
    softDrop()
  } else if (key == "ArrowUp" || key == "w" || key == "W" || key == "x" || key == "X") {
    if (state.gameState == 0) { startGame(); return }
    evt.preventDefault()
    rotateCW()
  } else if (key == "z" || key == "Z") {
    if (state.gameState == 0) { startGame(); return }
    evt.preventDefault()
    rotateCCW()
  } else if (key == " ") {
    if (state.gameState == 0) { startGame(); return }
    evt.preventDefault()
    hardDrop()
  } else if (key == "c" || key == "C" || key == "Shift") {
    if (state.gameState == 0) { startGame(); return }
    evt.preventDefault()
    holdPiece()
  } else if (key == "p" || key == "P") {
    evt.preventDefault()
    togglePause()
  } else if (key == "r" || key == "R") {
    evt.preventDefault()
    startGame()
  }
}

function updateHUD() {
  let sEl = DOM.getElementById("tet-score")
  if (sEl) { DOM.setText(sEl, to_string(state.score)) }
  let lEl = DOM.getElementById("tet-level")
  if (lEl) { DOM.setText(lEl, to_string(state.level)) }
  let lnEl = DOM.getElementById("tet-lines")
  if (lnEl) { DOM.setText(lnEl, to_string(state.linesCleared)) }
  let hsEl = DOM.getElementById("tet-high")
  if (hsEl) { DOM.setText(hsEl, to_string(state.highScore)) }
}

// ============================================================================
// 12. UI DOM Tree & Mobile D-Pad Controls
// ============================================================================

function renderUI() {
  let root = DOM.getElementById("app-root")
  if (!root) { return }

  let isPlaying = state.gameState == 1
  let isPaused = state.gameState == 2

  let ui = h("div", { className: "w-full max-w-5xl mx-auto p-4 select-none font-sans text-slate-100" }, [
    // Top Arcade Header
    h("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-4 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm" }, [
      h("div", { className: "flex items-center gap-3" }, [
        h("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-fuchsia-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/30" }, "T"),
        h("div", {}, [
          h("h1", { className: "text-lg sm:text-xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-yellow-300 to-fuchsia-400 bg-clip-text text-transparent" }, "TETRIS 1989 ARCADE"),
          h("p", { className: "text-xs text-slate-400 font-mono" }, "SRS Rotation • 7-Bag Fair Randomizer • Web Audio")
        ])
      ]),
      h("div", { className: "flex items-center gap-2" }, [
        h("button", {
          className: "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 " + (state.audioEnabled ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40" : "bg-slate-800 text-slate-400 border border-slate-700"),
          onClick: fn() { toggleAudio() }
        }, state.audioEnabled ? "🔊 SFX ON" : "🔇 SFX OFF"),
        h("button", {
          className: "px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 " + (state.musicEnabled ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-slate-800 text-slate-400 border border-slate-700"),
          onClick: fn() { toggleMusic() }
        }, state.musicEnabled ? "🎵 THEME ON" : "🎵 THEME OFF"),
        h("button", {
          className: "px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition",
          onClick: fn() { togglePause() }
        }, isPaused ? "▶ RESUME" : "⏸ PAUSE"),
        h("button", {
          className: "px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 hover:brightness-110 transition",
          onClick: fn() { startGame() }
        }, "NEW GAME")
      ])
    ]),

    // Main Game Workspace Layout (Left: Hold & Stats, Center: Well, Right: Next & Score)
    h("div", { className: "grid grid-cols-1 md:grid-cols-12 gap-4 items-start" }, [
      // Left Column: Hold Piece & Tetromino Statistics
      h("div", { className: "md:col-span-3 flex flex-col gap-4" }, [
        // Hold Card
        h("div", { className: "p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg text-center" }, [
          h("h2", { className: "text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2" }, "HOLD (C / Shift)"),
          h("div", { className: "flex justify-center items-center py-2" }, [
            h("canvas", {
              id: "hold-canvas",
              width: "72",
              height: "72",
              className: "rounded-xl border border-slate-800 bg-slate-950 shadow-inner"
            }, [])
          ]),
          h("span", { className: "text-[10px] font-mono text-slate-400" }, state.canHold ? "READY TO SWAP" : "LOCKED THIS DROP")
        ]),

        // Statistics Card
        h("div", { className: "p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg" }, [
          h("h2", { className: "text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3" }, "TETROMINO STATS"),
          h("div", { className: "space-y-1.5 text-xs font-mono" }, [
            h("div", { className: "flex justify-between items-center text-cyan-400" }, [
              h("span", {}, "I (Bar):"),
              h("span", { className: "font-bold" }, to_string(state.pieceStats[0]))
            ]),
            h("div", { className: "flex justify-between items-center text-blue-400" }, [
              h("span", {}, "J (Left):"),
              h("span", { className: "font-bold" }, to_string(state.pieceStats[1]))
            ]),
            h("div", { className: "flex justify-between items-center text-amber-500" }, [
              h("span", {}, "L (Right):"),
              h("span", { className: "font-bold" }, to_string(state.pieceStats[2]))
            ]),
            h("div", { className: "flex justify-between items-center text-yellow-300" }, [
              h("span", {}, "O (Cube):"),
              h("span", { className: "font-bold" }, to_string(state.pieceStats[3]))
            ]),
            h("div", { className: "flex justify-between items-center text-green-400" }, [
              h("span", {}, "S (Snake):"),
              h("span", { className: "font-bold" }, to_string(state.pieceStats[4]))
            ]),
            h("div", { className: "flex justify-between items-center text-purple-400" }, [
              h("span", {}, "T (Cross):"),
              h("span", { className: "font-bold" }, to_string(state.pieceStats[5]))
            ]),
            h("div", { className: "flex justify-between items-center text-rose-400" }, [
              h("span", {}, "Z (ZigZag):"),
              h("span", { className: "font-bold" }, to_string(state.pieceStats[6]))
            ])
          ])
        ])
      ]),

      // Center Column: Main Matrix Canvas & Controls
      h("div", { className: "md:col-span-6 flex flex-col items-center" }, [
        h("div", { className: "p-3 bg-slate-900/90 border-2 border-slate-700/80 rounded-2xl shadow-2xl shadow-indigo-950/40 relative" }, [
          h("canvas", {
            id: "tetris-canvas",
            width: "240",
            height: "480",
            className: "rounded-xl border border-slate-800 bg-slate-950 block shadow-inner"
          }, [])
        ]),

        // Mobile On-Screen Touch Controls
        h("div", { className: "mt-4 w-full max-w-sm flex flex-col gap-2 md:hidden" }, [
          h("div", { className: "grid grid-cols-3 gap-2" }, [
            h("button", {
              className: "p-3 bg-slate-800 active:bg-cyan-600 rounded-xl font-black text-lg border border-slate-700 text-center shadow",
              onClick: fn() { moveLeft() }
            }, "◀"),
            h("button", {
              className: "p-3 bg-slate-800 active:bg-cyan-600 rounded-xl font-black text-lg border border-slate-700 text-center shadow",
              onClick: fn() { rotateCW() }
            }, "↻"),
            h("button", {
              className: "p-3 bg-slate-800 active:bg-cyan-600 rounded-xl font-black text-lg border border-slate-700 text-center shadow",
              onClick: fn() { moveRight() }
            }, "▶")
          ]),
          h("div", { className: "grid grid-cols-4 gap-2" }, [
            h("button", {
              className: "p-3 bg-slate-800 active:bg-cyan-600 rounded-xl font-bold text-xs border border-slate-700 text-center shadow",
              onClick: fn() { rotateCCW() }
            }, "↺ CCW"),
            h("button", {
              className: "p-3 bg-slate-800 active:bg-cyan-600 rounded-xl font-bold text-xs border border-slate-700 text-center shadow",
              onClick: fn() { softDrop() }
            }, "▼ DROP"),
            h("button", {
              className: "p-3 bg-cyan-700 active:bg-cyan-500 rounded-xl font-black text-xs border border-cyan-600 text-center text-white shadow",
              onClick: fn() { hardDrop() }
            }, "⚡ SLAM"),
            h("button", {
              className: "p-3 bg-amber-700 active:bg-amber-500 rounded-xl font-bold text-xs border border-amber-600 text-center text-white shadow",
              onClick: fn() { holdPiece() }
            }, "HOLD")
          ])
        ])
      ]),

      // Right Column: Next Piece Queue & Score Panel
      h("div", { className: "md:col-span-3 flex flex-col gap-4" }, [
        // Next Pieces Card
        h("div", { className: "p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg text-center" }, [
          h("h2", { className: "text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2" }, "NEXT PIECES"),
          h("div", { className: "flex justify-center items-center py-2" }, [
            h("canvas", {
              id: "next-canvas",
              width: "72",
              height: "180",
              className: "rounded-xl border border-slate-800 bg-slate-950 shadow-inner"
            }, [])
          ])
        ]),

        // Score, Level, Lines Panel
        h("div", { className: "p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg space-y-3" }, [
          h("div", { className: "flex justify-between items-center border-b border-slate-800/80 pb-2" }, [
            h("span", { className: "text-xs font-mono uppercase text-slate-400" }, "SCORE"),
            h("span", { id: "tet-score", className: "text-lg font-mono font-black text-amber-300" }, to_string(state.score))
          ]),
          h("div", { className: "flex justify-between items-center border-b border-slate-800/80 pb-2" }, [
            h("span", { className: "text-xs font-mono uppercase text-slate-400" }, "LEVEL"),
            h("span", { id: "tet-level", className: "text-lg font-mono font-black text-cyan-300" }, to_string(state.level))
          ]),
          h("div", { className: "flex justify-between items-center border-b border-slate-800/80 pb-2" }, [
            h("span", { className: "text-xs font-mono uppercase text-slate-400" }, "LINES"),
            h("span", { id: "tet-lines", className: "text-lg font-mono font-black text-green-300" }, to_string(state.linesCleared))
          ]),
          h("div", { className: "flex justify-between items-center" }, [
            h("span", { className: "text-xs font-mono uppercase text-slate-400" }, "HIGH SCORE"),
            h("span", { id: "tet-high", className: "text-lg font-mono font-black text-fuchsia-300" }, to_string(state.highScore))
          ])
        ]),

        // Keyboard Controls Legend
        h("div", { className: "p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl text-[11px] font-mono text-slate-400 hidden md:block space-y-1" }, [
          h("div", { className: "font-bold text-slate-300 mb-1" }, "KEYBOARD CONTROLS:"),
          h("div", {}, "◀ ▶ / A D : Move Left / Right"),
          h("div", {}, "▲ / W / X : Rotate Clockwise"),
          h("div", {}, "Z : Rotate Counter-Clockwise"),
          h("div", {}, "▼ / S : Soft Drop"),
          h("div", {}, "SPACE : Hard Drop Slam"),
          h("div", {}, "C / SHIFT : Hold Tetromino"),
          h("div", {}, "P : Pause / Resume"),
          h("div", {}, "R : Restart Game")
        ])
      ])
    ])
  ])

  DOM.mount(root, ui)
}

// ============================================================================
// 13. Initialization & Main Game Loop
// ============================================================================

initGrid()
initNextQueue()
renderUI()

if (window && window.addEventListener) {
  if (window._tl_tet_keydown && window.removeEventListener) {
    window.removeEventListener("keydown", window._tl_tet_keydown)
  }
  window._tl_tet_keydown = handleKeyDown
  window.addEventListener("keydown", handleKeyDown)
}

function startLoop() {
  if (window && window._tl_tet_timer) {
    clearInterval(window._tl_tet_timer)
  }
  let _timer = setInterval(fn() {
    gameStep()
    drawCanvas()
  }, 16)
  if (window) {
    window._tl_tet_timer = _timer
  }
}

startLoop()
`
};
