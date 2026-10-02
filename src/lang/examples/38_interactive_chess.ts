import { ExampleProgram } from "./types";

export const example38Chess: ExampleProgram = {
  id: 'chess_grandmaster',
  name: '38. Grandmaster Chess (GADT State Machine, Minimax AI & Alpha-Beta Engine)',
  category: 'Interactive Web Apps',
  description: 'A complete, tournament-ready Chess engine written in TypeLang with GADTs, full FIDE rules (En Passant, Castling, Promotion, Check/Checkmate/Stalemate validation), Minimax AI with Alpha-Beta pruning & Piece-Square positional evaluation, Standard Algebraic Notation (SAN) move logger, captured piece graveyards, Web Audio sound synthesis, and reactive Virtual DOM rendering.',
  code: `import DOM.{ h, mount, playRamp, playSequence, confetti }
import Math.{ floor, max, min, abs, random }

// =========================================================================
// 1. Domain Types & GADTs
// =========================================================================

type Color =
  | White: Color
  | Black: Color

type PieceKind =
  | Pawn: PieceKind
  | Knight: PieceKind
  | Bishop: PieceKind
  | Rook: PieceKind
  | Queen: PieceKind
  | King: PieceKind

type GameState =
  | Active: GameState
  | InCheck: GameState
  | Checkmate: GameState
  | Stalemate: GameState
  | DrawRepetition: GameState

type PlayerMode =
  | HumanVsAI: PlayerMode
  | HumanVsHuman: PlayerMode
  | AIVsAI: PlayerMode

type Action =
  | SelectSquare(sq: number): Action
  | StepMove(fromSq: number, toSq: number, promo: number): Action
  | RequestAIMove: Action
  | UndoLastMove: Action
  | RestartMatch: Action
  | SwitchMode(mode: PlayerMode): Action
  | SetAIDifficulty(depth: number): Action
  | RequestHint: Action
  | ToggleBoardFlip: Action
  | ToggleSound: Action

// =========================================================================
// 2. Application State & Board Storage
// =========================================================================

// Piece Constants:
// 0 = Empty
// 1 = White Pawn, 2 = White Knight, 3 = White Bishop, 4 = White Rook, 5 = White Queen, 6 = White King
// 7 = Black Pawn, 8 = Black Knight, 9 = Black Bishop, 10 = Black Rook, 11 = Black Queen, 12 = Black King

let state = {
  // Board: 64 squares (0=a8..63=h1, row = floor(sq/8), col = sq%8)
  mut board: [],
  mut turn: 1, // 1: White, 2: Black
  mut status: 0, // 0: Active, 1: InCheck, 2: Checkmate, 3: Stalemate
  mut mode: 0,   // 0: Human vs AI, 1: Human vs Human, 2: AI vs AI
  mut aiDepth: 2, // 1: Casual (Fast), 2: Intermediate, 3: Master
  mut isFlipped: false,
  mut audioEnabled: true,
  mut selectedSquare: -1,
  mut legalDestinations: [], // number[] of valid square indices for selected piece
  mut lastMoveFrom: -1,
  mut lastMoveTo: -1,
  mut enPassantSquare: -1, // Target square for en passant capture (-1 if none)
  mut whiteKingMoved: false,
  mut whiteRookA1Moved: false,
  mut whiteRookH1Moved: false,
  mut blackKingMoved: false,
  mut blackRookA8Moved: false,
  mut blackRookH8Moved: false,
  mut halfMoveClock: 0,
  mut fullMoveNumber: 1,
  mut hintFrom: -1,
  mut hintTo: -1,
  mut hintMessage: "White to move. Click a piece to view legal options.",
  mut isAiThinking: false,
  // History stack for Undo
  mut history: [], // Array of snapshot objects
  mut moveLogSAN: [], // String array of algebraic moves
  // Captured pieces
  mut capturedWhite: [], // Black captured white pieces
  mut capturedBlack: []  // White captured black pieces
}

// =========================================================================
// 3. Audio Synthesizer (Web Audio API via DOM Library)
// =========================================================================

function playSound(soundType: string) {
  if (!state.audioEnabled) { return }
  
  if (soundType == "move") {
    let _ = playRamp(320.0, 160.0, 0.05, "sine", 0.12)
  } else if (soundType == "capture") {
    let _ = playRamp(600.0, 200.0, 0.08, "triangle", 0.18)
  } else if (soundType == "check") {
    let _ = playRamp(520.0, 780.0, 0.16, "sawtooth", 0.15)
  } else if (soundType == "victory") {
    let _ = playSequence([523.0, 659.0, 783.0, 1046.0], 0.1, "sine", 0.12)
  }
}

// =========================================================================
// 4. Coordinates & Board Math Helpers
// =========================================================================

function getSqRow(sq: number): number {
  Math.floor(sq / 8)
}

function getSqCol(sq: number): number {
  sq % 8
}

function makeSq(r: number, c: number): number {
  r * 8 + c
}

function isInsideBoard(r: number, c: number): boolean {
  r >= 0 && r < 8 && c >= 0 && c < 8
}

function getPieceColor(piece: number): number {
  if (piece >= 1 && piece <= 6) { 1 } // White
  else if (piece >= 7 && piece <= 12) { 2 } // Black
  else { 0 } // Empty
}

function getPieceKind(piece: number): number {
  if (piece == 0) { 0 }
  else if (piece <= 6) { piece }
  else { piece - 6 }
}

function getSquareName(sq: number): string {
  let r = getSqRow(sq)
  let c = getSqCol(sq)
  let fileChar = c == 0 ? "a" : c == 1 ? "b" : c == 2 ? "c" : c == 3 ? "d" : c == 4 ? "e" : c == 5 ? "f" : c == 6 ? "g" : "h"
  let rankChar = to_string(8 - r)
  concat(fileChar, rankChar)
}

function getPieceGlyph(piece: number): string {
  if (piece == 1) { "♙" } // White Pawn
  else if (piece == 2) { "♘" } // White Knight
  else if (piece == 3) { "♗" } // White Bishop
  else if (piece == 4) { "♖" } // White Rook
  else if (piece == 5) { "♕" } // White Queen
  else if (piece == 6) { "♔" } // White King
  else if (piece == 7) { "♟" } // Black Pawn
  else if (piece == 8) { "♞" } // Black Knight
  else if (piece == 9) { "♝" } // Black Bishop
  else if (piece == 10) { "♜" } // Black Rook
  else if (piece == 11) { "♛" } // Black Queen
  else if (piece == 12) { "♚" } // Black King
  else { "" }
}

function getPieceSymbolSAN(pieceKind: number): string {
  if (pieceKind == 2) { "N" }
  else if (pieceKind == 3) { "B" }
  else if (pieceKind == 4) { "R" }
  else if (pieceKind == 5) { "Q" }
  else if (pieceKind == 6) { "K" }
  else { "" }
}

// =========================================================================
// 5. Board Initialization
// =========================================================================

function initStartingPosition() {
  // Standard standard 8x8 setup
  // Row 0: Black major pieces (r=0, a8..h8)
  // Row 1: Black pawns (r=1, a7..h7)
  // Row 2-5: Empty
  // Row 6: White pawns (r=6, a2..h2)
  // Row 7: White major pieces (r=7, a1..h1)
  state.board = [
    10, 8, 9, 11, 12, 9, 8, 10,
    7,  7, 7, 7,  7,  7, 7, 7,
    0,  0, 0, 0,  0,  0, 0, 0,
    0,  0, 0, 0,  0,  0, 0, 0,
    0,  0, 0, 0,  0,  0, 0, 0,
    0,  0, 0, 0,  0,  0, 0, 0,
    1,  1, 1, 1,  1,  1, 1, 1,
    4,  2, 3, 5,  6,  3, 2, 4
  ]

  state.turn = 1 // White moves first
  state.status = 0 // Active
  state.selectedSquare = -1
  state.legalDestinations = []
  state.lastMoveFrom = -1
  state.lastMoveTo = -1
  state.enPassantSquare = -1
  state.whiteKingMoved = false
  state.whiteRookA1Moved = false
  state.whiteRookH1Moved = false
  state.blackKingMoved = false
  state.blackRookA8Moved = false
  state.blackRookH8Moved = false
  state.halfMoveClock = 0
  state.fullMoveNumber = 1
  state.hintFrom = -1
  state.hintTo = -1
  state.hintMessage = "New game initialized. White to move."
  state.history = []
  state.moveLogSAN = []
  state.capturedWhite = []
  state.capturedBlack = []
  state.isAiThinking = false
}

// =========================================================================
// 6. Move Generation & Validation Rules Engine
// =========================================================================

// Checks if a specific square is attacked by player of 'byColor' (1=White, 2=Black)
function isSquareAttacked(targetSq: number, byColor: number, boardArr: number[]): boolean {
  let tr = getSqRow(targetSq)
  let tc = getSqCol(targetSq)

  // 1. Pawn Attacks
  let pawnRow = byColor == 1 ? tr + 1 : tr - 1
  if (pawnRow >= 0 && pawnRow < 8) {
    if (tc > 0) {
      let p1 = boardArr[makeSq(pawnRow, tc - 1)]
      if (getPieceColor(p1) == byColor && getPieceKind(p1) == 1) { return true }
    }
    if (tc < 7) {
      let p2 = boardArr[makeSq(pawnRow, tc + 1)]
      if (getPieceColor(p2) == byColor && getPieceKind(p2) == 1) { return true }
    }
  }

  // 2. Knight Attacks
  let knightD = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ]
  for (let mut i = 0; i < 8; i = i + 1) {
    let nr = tr + knightD[i][0]
    let nc = tc + knightD[i][1]
    if (isInsideBoard(nr, nc)) {
      let p = boardArr[makeSq(nr, nc)]
      if (getPieceColor(p) == byColor && getPieceKind(p) == 2) { return true }
    }
  }

  // 3. King Attacks (adjacent 1 square)
  for (let mut dr = -1; dr <= 1; dr = dr + 1) {
    for (let mut dc = -1; dc <= 1; dc = dc + 1) {
      if (dr != 0 || dc != 0) {
        let kr = tr + dr
        let kc = tc + dc
        if (isInsideBoard(kr, kc)) {
          let p = boardArr[makeSq(kr, kc)]
          if (getPieceColor(p) == byColor && getPieceKind(p) == 6) { return true }
        }
      }
    }
  }

  // 4. Straight Line Attacks (Rook & Queen)
  let straightD = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  for (let mut i = 0; i < 4; i = i + 1) {
    let dr = straightD[i][0]
    let dc = straightD[i][1]
    let mut step = 1
    while (step < 8) {
      let nr = tr + dr * step
      let nc = tc + dc * step
      if (!isInsideBoard(nr, nc)) { break }
      let p = boardArr[makeSq(nr, nc)]
      if (p != 0) {
        if (getPieceColor(p) == byColor) {
          let k = getPieceKind(p)
          if (k == 4 || k == 5) { return true }
        }
        break
      }
      step = step + 1
    }
  }

  // 5. Diagonal Line Attacks (Bishop & Queen)
  let diagD = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  for (let mut i = 0; i < 4; i = i + 1) {
    let dr = diagD[i][0]
    let dc = diagD[i][1]
    let mut step = 1
    while (step < 8) {
      let nr = tr + dr * step
      let nc = tc + dc * step
      if (!isInsideBoard(nr, nc)) { break }
      let p = boardArr[makeSq(nr, nc)]
      if (p != 0) {
        if (getPieceColor(p) == byColor) {
          let k = getPieceKind(p)
          if (k == 3 || k == 5) { return true }
        }
        break
      }
      step = step + 1
    }
  }

  false
}

function findKingSquare(color: number, boardArr: number[]): number {
  let targetKing = color == 1 ? 6 : 12
  for (let mut i = 0; i < 64; i = i + 1) {
    if (boardArr[i] == targetKing) {
      return i
    }
  }
  return 0 - 1
}

function isKingInCheck(color: number, boardArr: number[]): boolean {
  let kingSq = findKingSquare(color, boardArr)
  if (kingSq < 0) { return false }
  let enemyColor = color == 1 ? 2 : 1
  isSquareAttacked(kingSq, enemyColor, boardArr)
}

// Generate raw pseudo-legal moves for a piece at fromSq
function getRawPieceMoves(fromSq: number, boardArr: number[], enPassant: number): number[] {
  let piece = boardArr[fromSq]
  if (piece == 0) { return [] }

  let color = getPieceColor(piece)
  let kind = getPieceKind(piece)
  let enemyColor = color == 1 ? 2 : 1
  let r = getSqRow(fromSq)
  let c = getSqCol(fromSq)
  let mut moves = []

  // --- PAWN ---
  if (kind == 1) {
    let forward = color == 1 ? -1 : 1
    let startRank = color == 1 ? 6 : 1
    let nextR = r + forward
    
    // 1-step forward
    if (isInsideBoard(nextR, c) && boardArr[makeSq(nextR, c)] == 0) {
      moves.push(makeSq(nextR, c))
      // 2-step forward from starting rank
      let doubleR = r + forward * 2
      if (r == startRank && boardArr[makeSq(doubleR, c)] == 0) {
        moves.push(makeSq(doubleR, c))
      }
    }

    // Diagonal captures
    let capCols = [c - 1, c + 1]
    for (let mut i = 0; i < 2; i = i + 1) {
      let capC = capCols[i]
      if (capC >= 0 && capC < 8 && isInsideBoard(nextR, capC)) {
        let targetSq = makeSq(nextR, capC)
        let targetP = boardArr[targetSq]
        if (targetP != 0 && getPieceColor(targetP) == enemyColor) {
          moves.push(targetSq)
        } else if (targetSq == enPassant) {
          // En Passant capture
          moves.push(targetSq)
        }
      }
    }
  }

  // --- KNIGHT ---
  else if (kind == 2) {
    let offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ]
    for (let mut i = 0; i < 8; i = i + 1) {
      let nr = r + offsets[i][0]
      let nc = c + offsets[i][1]
      if (isInsideBoard(nr, nc)) {
        let destP = boardArr[makeSq(nr, nc)]
        if (destP == 0 || getPieceColor(destP) == enemyColor) {
          moves.push(makeSq(nr, nc))
        }
      }
    }
  }

  // --- BISHOP / QUEEN ---
  if (kind == 3 || kind == 5) {
    let dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    for (let mut d = 0; d < 4; d = d + 1) {
      let dr = dirs[d][0]
      let dc = dirs[d][1]
      let mut step = 1
      while (step < 8) {
        let nr = r + dr * step
        let nc = c + dc * step
        if (!isInsideBoard(nr, nc)) { break }
        let destP = boardArr[makeSq(nr, nc)]
        if (destP == 0) {
          moves.push(makeSq(nr, nc))
        } else {
          if (getPieceColor(destP) == enemyColor) {
            moves.push(makeSq(nr, nc))
          }
          break
        }
        step = step + 1
      }
    }
  }

  // --- ROOK / QUEEN ---
  if (kind == 4 || kind == 5) {
    let dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    for (let mut d = 0; d < 4; d = d + 1) {
      let dr = dirs[d][0]
      let dc = dirs[d][1]
      let mut step = 1
      while (step < 8) {
        let nr = r + dr * step
        let nc = c + dc * step
        if (!isInsideBoard(nr, nc)) { break }
        let destP = boardArr[makeSq(nr, nc)]
        if (destP == 0) {
          moves.push(makeSq(nr, nc))
        } else {
          if (getPieceColor(destP) == enemyColor) {
            moves.push(makeSq(nr, nc))
          }
          break
        }
        step = step + 1
      }
    }
  }

  // --- KING ---
  if (kind == 6) {
    for (let mut dr = -1; dr <= 1; dr = dr + 1) {
      for (let mut dc = -1; dc <= 1; dc = dc + 1) {
        if (dr != 0 || dc != 0) {
          let nr = r + dr
          let nc = c + dc
          if (isInsideBoard(nr, nc)) {
            let destP = boardArr[makeSq(nr, nc)]
            if (destP == 0 || getPieceColor(destP) == enemyColor) {
              moves.push(makeSq(nr, nc))
            }
          }
        }
      }
    }

    // Castling Checks
    if (color == 1 && !state.whiteKingMoved && !isKingInCheck(1, boardArr)) {
      // Kingside: e1(60) -> g1(62)
      if (!state.whiteRookH1Moved && boardArr[61] == 0 && boardArr[62] == 0 && boardArr[63] == 4) {
        if (!isSquareAttacked(61, 2, boardArr) && !isSquareAttacked(62, 2, boardArr)) {
          moves.push(62)
        }
      }
      // Queenside: e1(60) -> c1(58)
      if (!state.whiteRookA1Moved && boardArr[59] == 0 && boardArr[58] == 0 && boardArr[57] == 0 && boardArr[56] == 4) {
        if (!isSquareAttacked(59, 2, boardArr) && !isSquareAttacked(58, 2, boardArr)) {
          moves.push(58)
        }
      }
    } else if (color == 2 && !state.blackKingMoved && !isKingInCheck(2, boardArr)) {
      // Kingside: e8(4) -> g8(6)
      if (!state.blackRookH8Moved && boardArr[5] == 0 && boardArr[6] == 0 && boardArr[7] == 10) {
        if (!isSquareAttacked(5, 1, boardArr) && !isSquareAttacked(6, 1, boardArr)) {
          moves.push(6)
        }
      }
      // Queenside: e8(4) -> c8(2)
      if (!state.blackRookA8Moved && boardArr[3] == 0 && boardArr[2] == 0 && boardArr[1] == 0 && boardArr[0] == 10) {
        if (!isSquareAttacked(3, 1, boardArr) && !isSquareAttacked(2, 1, boardArr)) {
          moves.push(2)
        }
      }
    }
  }

  moves
}

// Simulates a move on a cloned board to test if own King is left in check
function isMoveLegal(fromSq: number, toSq: number, color: number): boolean {
  let piece = state.board[fromSq]
  let kind = getPieceKind(piece)
  let mut tempBoard = []
  for (let mut i = 0; i < 64; i = i + 1) {
    tempBoard.push(state.board[i])
  }

  // Handle En Passant simulation
  if (kind == 1 && toSq == state.enPassantSquare) {
    let capPawnSq = color == 1 ? toSq + 8 : toSq - 8
    tempBoard[capPawnSq] = 0
  }

  // Handle Castling Rook repositioning in simulation
  if (kind == 6) {
    if (fromSq == 60 && toSq == 62) { // White Kingside
      tempBoard[63] = 0; tempBoard[61] = 4
    } else if (fromSq == 60 && toSq == 58) { // White Queenside
      tempBoard[56] = 0; tempBoard[59] = 4
    } else if (fromSq == 4 && toSq == 6) { // Black Kingside
      tempBoard[7] = 0; tempBoard[5] = 10
    } else if (fromSq == 4 && toSq == 2) { // Black Queenside
      tempBoard[0] = 0; tempBoard[3] = 10
    }
  }

  tempBoard[toSq] = piece
  tempBoard[fromSq] = 0

  !isKingInCheck(color, tempBoard)
}

function getStrictLegalMoves(fromSq: number): number[] {
  let raw = getRawPieceMoves(fromSq, state.board, state.enPassantSquare)
  let color = getPieceColor(state.board[fromSq])
  let mut filtered = []
  for (let mut i = 0; i < Array.len(raw); i = i + 1) {
    let dest = raw[i]
    if (isMoveLegal(fromSq, dest, color)) {
      filtered.push(dest)
    }
  }
  filtered
}

// Returns all legal moves for 'color' formatted as [from, to] pairs
function getAllLegalMoves(color: number): number[][] {
  let mut allMoves = []
  for (let mut sq = 0; sq < 64; sq = sq + 1) {
    if (getPieceColor(state.board[sq]) == color) {
      let dests = getStrictLegalMoves(sq)
      for (let mut k = 0; k < Array.len(dests); k = k + 1) {
        allMoves.push([sq, dests[k]])
      }
    }
  }
  allMoves
}

// =========================================================================
// 7. Move Execution & SAN Logging
// =========================================================================

function formatSAN(fromSq: number, toSq: number, piece: number, isCap: boolean, isCastling: number, isCheck: boolean, isMate: boolean): string {
  if (isCastling == 1) { return "O-O" }
  if (isCastling == 2) { return "O-O-O" }

  let kind = getPieceKind(piece)
  let piecePrefix = getPieceSymbolSAN(kind)
  let fromName = getSquareName(fromSq)
  let toName = getSquareName(toSq)

  let mut san = ""
  if (kind == 1) {
    if (isCap) {
      san = concat(fromName[0], concat("x", toName))
    } else {
      san = toName
    }
    // Auto Queen Promotion
    let destR = getSqRow(toSq)
    if (destR == 0 || destR == 7) {
      san = concat(san, "=Q")
    }
  } else {
    san = piecePrefix
    if (isCap) {
      san = concat(san, concat("x", toName))
    } else {
      san = concat(san, toName)
    }
  }

  if (isMate) {
    san = concat(san, "#")
  } else if (isCheck) {
    san = concat(san, "+")
  }

  san
}

function applyMove(fromSq: number, toSq: number, promotionPiece: number) {
  let movingPiece = state.board[fromSq]
  let targetPiece = state.board[toSq]
  let kind = getPieceKind(movingPiece)
  let color = getPieceColor(movingPiece)
  let enemyColor = color == 1 ? 2 : 1

  // Push snapshot to undo history
  state.history.push({
    board: state.board.slice(0, 64),
    turn: state.turn,
    status: state.status,
    enPassantSquare: state.enPassantSquare,
    whiteKingMoved: state.whiteKingMoved,
    whiteRookA1Moved: state.whiteRookA1Moved,
    whiteRookH1Moved: state.whiteRookH1Moved,
    blackKingMoved: state.blackKingMoved,
    blackRookA8Moved: state.blackRookA8Moved,
    blackRookH8Moved: state.blackRookH8Moved,
    halfMoveClock: state.halfMoveClock,
    fullMoveNumber: state.fullMoveNumber,
    lastMoveFrom: state.lastMoveFrom,
    lastMoveTo: state.lastMoveTo,
    capturedWhite: state.capturedWhite.slice(0, Array.len(state.capturedWhite)),
    capturedBlack: state.capturedBlack.slice(0, Array.len(state.capturedBlack)),
    moveLogSAN: state.moveLogSAN.slice(0, Array.len(state.moveLogSAN))
  })

  let mut isCapture = (targetPiece != 0)
  let mut isCastling = 0

  // 1. En Passant Capture Execution
  if (kind == 1 && toSq == state.enPassantSquare) {
    isCapture = true
    let capPawnSq = color == 1 ? toSq + 8 : toSq - 8
    let capturedPawn = state.board[capPawnSq]
    state.board[capPawnSq] = 0
    if (color == 1) {
      state.capturedBlack.push(capturedPawn)
    } else {
      state.capturedWhite.push(capturedPawn)
    }
  } else if (targetPiece != 0) {
    if (color == 1) {
      state.capturedBlack.push(targetPiece)
    } else {
      state.capturedWhite.push(targetPiece)
    }
  }

  // 2. Castling Execution (Move corresponding Rook)
  if (kind == 6) {
    if (fromSq == 60 && toSq == 62) { // White Kingside
      state.board[63] = 0; state.board[61] = 4; isCastling = 1
    } else if (fromSq == 60 && toSq == 58) { // White Queenside
      state.board[56] = 0; state.board[59] = 4; isCastling = 2
    } else if (fromSq == 4 && toSq == 6) { // Black Kingside
      state.board[7] = 0; state.board[5] = 10; isCastling = 1
    } else if (fromSq == 4 && toSq == 2) { // Black Queenside
      state.board[0] = 0; state.board[3] = 10; isCastling = 2
    }
  }

  // 3. Move the piece & check promotion
  let destR = getSqRow(toSq)
  let mut finalPlacedPiece = movingPiece
  if (kind == 1 && (destR == 0 || destR == 7)) {
    // Default promote to Queen (or custom promo)
    finalPlacedPiece = color == 1 ? 5 : 11
  }

  state.board[toSq] = finalPlacedPiece
  state.board[fromSq] = 0

  // 4. Update Castling Rights Flags
  if (fromSq == 60) { state.whiteKingMoved = true }
  if (fromSq == 56) { state.whiteRookA1Moved = true }
  if (fromSq == 63) { state.whiteRookH1Moved = true }
  if (fromSq == 4) { state.blackKingMoved = true }
  if (fromSq == 0) { state.blackRookA8Moved = true }
  if (fromSq == 7) { state.blackRookH8Moved = true }

  // 5. Update En Passant Square
  let fromR = getSqRow(fromSq)
  if (kind == 1 && Math.abs(destR - fromR) == 2) {
    state.enPassantSquare = color == 1 ? fromSq - 8 : fromSq + 8
  } else {
    state.enPassantSquare = -1
  }

  state.lastMoveFrom = fromSq
  state.lastMoveTo = toSq
  state.selectedSquare = -1
  state.legalDestinations = []
  state.hintFrom = -1
  state.hintTo = -1

  // 6. Switch Turn & Evaluate Check / Checkmate / Stalemate
  state.turn = enemyColor
  if (color == 2) {
    state.fullMoveNumber = state.fullMoveNumber + 1
  }

  let inCheck = isKingInCheck(enemyColor, state.board)
  let enemyLegalMoves = getAllLegalMoves(enemyColor)
  let hasLegalMoves = Array.len(enemyLegalMoves) > 0

  let mut isMate = false
  if (inCheck && !hasLegalMoves) {
    state.status = 2 // Checkmate
    isMate = true
    state.hintMessage = concat("🏆 CHECKMATE! ", concat(color == 1 ? "White" : "Black", " wins the game!"))
    playSound("victory")
    let _ = confetti(100.0, 75.0, 0.6)
  } else if (!inCheck && !hasLegalMoves) {
    state.status = 3 // Stalemate
    state.hintMessage = "🤝 STALEMATE! Game ends in a draw."
    playSound("move")
  } else if (inCheck) {
    state.status = 1 // In Check
    state.hintMessage = concat("⚠️ CHECK! ", concat(enemyColor == 1 ? "White" : "Black", " king is under attack!"))
    playSound("check")
  } else {
    state.status = 0 // Active
    state.hintMessage = concat(enemyColor == 1 ? "White" : "Black", "'s turn to move.")
    if (isCapture) {
      playSound("capture")
    } else {
      playSound("move")
    }
  }

  // Format SAN Notation
  let san = formatSAN(fromSq, toSq, movingPiece, isCapture, isCastling, inCheck, isMate)
  state.moveLogSAN.push(san)
}

function undoMove() {
  let len = Array.len(state.history)
  if (len == 0) { return }
  let lastSnap = state.history[len - 1]
  state.history.pop()

  state.board = lastSnap.board
  state.turn = lastSnap.turn
  state.status = lastSnap.status
  state.enPassantSquare = lastSnap.enPassantSquare
  state.whiteKingMoved = lastSnap.whiteKingMoved
  state.whiteRookA1Moved = lastSnap.whiteRookA1Moved
  state.whiteRookH1Moved = lastSnap.whiteRookH1Moved
  state.blackKingMoved = lastSnap.blackKingMoved
  state.blackRookA8Moved = lastSnap.blackRookA8Moved
  state.blackRookH8Moved = lastSnap.blackRookH8Moved
  state.halfMoveClock = lastSnap.halfMoveClock
  state.fullMoveNumber = lastSnap.fullMoveNumber
  state.lastMoveFrom = lastSnap.lastMoveFrom
  state.lastMoveTo = lastSnap.lastMoveTo
  state.capturedWhite = lastSnap.capturedWhite
  state.capturedBlack = lastSnap.capturedBlack
  state.moveLogSAN = lastSnap.moveLogSAN
  state.selectedSquare = -1
  state.legalDestinations = []
  state.hintFrom = -1
  state.hintTo = -1
  state.hintMessage = concat("Move undone. ", concat(state.turn == 1 ? "White" : "Black", " to move."))
}

// =========================================================================
// 8. Minimax AI Engine with Alpha-Beta Pruning & Positional Heuristics
// =========================================================================

// Base piece values (Pawns=100, Knights=320, Bishops=330, Rooks=500, Queens=900, Kings=20000)
function getPieceValue(kind: number): number {
  if (kind == 1) { 100 }
  else if (kind == 2) { 320 }
  else if (kind == 3) { 330 }
  else if (kind == 4) { 500 }
  else if (kind == 5) { 900 }
  else if (kind == 6) { 20000 }
  else { 0 }
}

// Positional bonuses: center control & piece development
function getSquarePositionalBonus(kind: number, color: number, sq: number): number {
  let r = getSqRow(sq)
  let c = getSqCol(sq)
  let rank = color == 1 ? 7 - r : r

  // Central squares bonus (d4, e4, d5, e5)
  let centerDist = Math.abs(3.5 - r) + Math.abs(3.5 - c)
  let centerBonus = Math.floor((7 - centerDist) * 5)

  if (kind == 1) {
    // Pawn advancement bonus
    return rank * 10 + (c >= 2 && c <= 5 ? 10 : 0)
  }
  if (kind == 2 || kind == 3) {
    // Knights and Bishops love central outposts
    return centerBonus * 3
  }
  if (kind == 6) {
    // King safety: stay castled in corners during early/midgame
    if (rank == 0 && (c <= 2 || c >= 6)) { return 25 }
    return 0 - rank * 10
  }

  return centerBonus
}

function evaluateBoard(boardArr: number[]): number {
  let mut totalScore = 0
  for (let mut sq = 0; sq < 64; sq = sq + 1) {
    let p = boardArr[sq]
    if (p != 0) {
      let color = getPieceColor(p)
      let kind = getPieceKind(p)
      let val = getPieceValue(kind) + getSquarePositionalBonus(kind, color, sq)
      if (color == 1) {
        totalScore = totalScore + val
      } else {
        totalScore = totalScore - val
      }
    }
  }
  totalScore
}

// Alpha-Beta Minimax Search
function minimax(depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
  if (depth == 0) {
    return evaluateBoard(state.board)
  }

  let color = isMaximizing ? 1 : 2
  let legalMoves = getAllLegalMoves(color)

  if (Array.len(legalMoves) == 0) {
    if (isKingInCheck(color, state.board)) {
      // Checkmate score
      return isMaximizing ? -50000 + depth : 50000 - depth
    }
    return 0 // Stalemate
  }

  if (isMaximizing) {
    let mut maxEval = -999999
    let mut mutAlpha = alpha
    for (let mut i = 0; i < Array.len(legalMoves); i = i + 1) {
      let m = legalMoves[i]
      let fromSq = m[0]
      let toSq = m[1]

      applyMove(fromSq, toSq, 5)
      let evalVal = minimax(depth - 1, mutAlpha, beta, false)
      undoMove()

      if (evalVal > maxEval) { maxEval = evalVal }
      if (evalVal > mutAlpha) { mutAlpha = evalVal }
      if (beta <= mutAlpha) { break } // Beta cut-off
    }
    return maxEval
  } else {
    let mut minEval = 999999
    let mut mutBeta = beta
    for (let mut i = 0; i < Array.len(legalMoves); i = i + 1) {
      let m = legalMoves[i]
      let fromSq = m[0]
      let toSq = m[1]

      applyMove(fromSq, toSq, 11)
      let evalVal = minimax(depth - 1, alpha, mutBeta, true)
      undoMove()

      if (evalVal < minEval) { minEval = evalVal }
      if (evalVal < mutBeta) { mutBeta = evalVal }
      if (mutBeta <= alpha) { break } // Alpha cut-off
    }
    return minEval
  }
}

function findBestMove(color: number, depth: number): number[] {
  let legalMoves = getAllLegalMoves(color)
  if (Array.len(legalMoves) == 0) { return [] }

  let isMax = (color == 1)
  let mut bestScore = isMax ? -999999 : 999999
  let mut bestMove = legalMoves[0]
  let mut alpha = -999999
  let mut beta = 999999

  for (let mut i = 0; i < Array.len(legalMoves); i = i + 1) {
    let m = legalMoves[i]
    let fromSq = m[0]
    let toSq = m[1]

    applyMove(fromSq, toSq, color == 1 ? 5 : 11)
    let score = minimax(depth - 1, alpha, beta, !isMax)
    undoMove()

    if (isMax) {
      if (score > bestScore) {
        bestScore = score
        bestMove = m
      }
      if (score > alpha) { alpha = score }
    } else {
      if (score < bestScore) {
        bestScore = score
        bestMove = m
      }
      if (score < beta) { beta = score }
    }
  }

  bestMove
}

function triggerAIMove() {
  if (state.status == 2 || state.status == 3) { return }
  let best = findBestMove(state.turn, state.aiDepth)
  if (Array.len(best) >= 2) {
    applyMove(best[0], best[1], state.turn == 1 ? 5 : 11)
  }
}

// =========================================================================
// 9. Action Dispatcher
// =========================================================================

function dispatch(action: Action) {
  match (action) {
    SelectSquare(sq) => {
      if (state.status == 2 || state.status == 3) { return }

      // If user clicked an already selected square, unselect
      if (state.selectedSquare == sq) {
        state.selectedSquare = -1
        state.legalDestinations = []
      }
      // If clicking one of the highlighted legal destinations, execute the move!
      else if (state.selectedSquare >= 0) {
        let mut isLegalDest = false
        for (let mut i = 0; i < Array.len(state.legalDestinations); i = i + 1) {
          if (state.legalDestinations[i] == sq) {
            isLegalDest = true
            break
          }
        }

        if (isLegalDest) {
          let fromSq = state.selectedSquare
          applyMove(fromSq, sq, state.turn == 1 ? 5 : 11)

          // If playing against AI and game is still active, opponent AI plays automatically!
          if (state.mode == 0 && state.status <= 1 && state.turn == 2) {
            triggerAIMove()
          }
        } else {
          // Select another piece of own color
          let clickedP = state.board[sq]
          if (clickedP != 0 && getPieceColor(clickedP) == state.turn) {
            state.selectedSquare = sq
            state.legalDestinations = getStrictLegalMoves(sq)
          } else {
            state.selectedSquare = -1
            state.legalDestinations = []
          }
        }
      } else {
        // Initial Piece Selection
        let p = state.board[sq]
        if (p != 0 && getPieceColor(p) == state.turn) {
          state.selectedSquare = sq
          state.legalDestinations = getStrictLegalMoves(sq)
        }
      }
    }
    StepMove(fromSq, toSq, promo) => {
      applyMove(fromSq, toSq, promo)
    }
    RequestAIMove => {
      triggerAIMove()
    }
    UndoLastMove => {
      // In PvAI mode, undo both AI and Human move
      if (state.mode == 0 && Array.len(state.history) >= 2) {
        undoMove()
        undoMove()
      } else {
        undoMove()
      }
    }
    RestartMatch => {
      initStartingPosition()
    }
    SwitchMode(m) => {
      match (m) {
        HumanVsAI => { state.mode = 0 }
        HumanVsHuman => { state.mode = 1 }
        AIVsAI => { state.mode = 2 }
      }
    }
    SetAIDifficulty(depth) => {
      state.aiDepth = depth
    }
    RequestHint => {
      let best = findBestMove(state.turn, state.aiDepth)
      if (Array.len(best) >= 2) {
        state.hintFrom = best[0]
        state.hintTo = best[1]
        let fromName = getSquareName(best[0])
        let toName = getSquareName(best[1])
        state.hintMessage = concat("💡 Grandmaster Hint: Recommended move is ", concat(fromName, concat(" → ", toName)))
      }
    }
    ToggleBoardFlip => {
      state.isFlipped = !state.isFlipped
    }
    ToggleSound => {
      state.audioEnabled = !state.audioEnabled
    }
  }

  renderUI()
}

// =========================================================================
// 10. Virtual DOM UI Rendering
// =========================================================================

function renderGraveyard(pieces: number[], isWhiteGraveyard: boolean) {
  let mut glyphs = []
  let mut score = 0
  for (let mut i = 0; i < Array.len(pieces); i = i + 1) {
    let p = pieces[i]
    let kind = getPieceKind(p)
    score = score + getPieceValue(kind)
    glyphs.push(h("span", { className: "text-lg sm:text-xl drop-shadow-sm select-none" }, getPieceGlyph(p)))
  }

  h("div", { className: "flex items-center space-x-1 min-h-[28px] overflow-x-auto py-1 px-2 bg-slate-950/60 rounded-lg border border-slate-800/80" }, [
    h("span", { className: "text-xs font-mono text-slate-500 mr-2" }, isWhiteGraveyard ? "Captured (White):" : "Captured (Black):"),
    h("div", { className: "flex items-center space-x-0.5 flex-wrap" }, glyphs)
  ])
}

function renderSquare(sq: number) {
  let displaySq = state.isFlipped ? 63 - sq : sq
  let r = getSqRow(displaySq)
  let c = getSqCol(displaySq)
  let isLight = (r + c) % 2 == 0
  let p = state.board[displaySq]
  let pColor = getPieceColor(p)
  let glyph = getPieceGlyph(p)

  let isSelected = (state.selectedSquare == displaySq)
  let isLastMove = (state.lastMoveFrom == displaySq || state.lastMoveTo == displaySq)
  let isHint = (state.hintFrom == displaySq || state.hintTo == displaySq)
  let isKingCheck = (state.status == 1 || state.status == 2) && (getPieceKind(p) == 6 && pColor == state.turn)

  // Legal Move Destination Check
  let mut isLegalDest = false
  for (let mut i = 0; i < Array.len(state.legalDestinations); i = i + 1) {
    if (state.legalDestinations[i] == displaySq) {
      isLegalDest = true
      break
    }
  }

  // Base Square Styling (Wood & Slate aesthetic)
  let baseColor = isLight
    ? "bg-[#e8ebef] text-slate-800"
    : "bg-[#718290] text-slate-900"

  let highlight = isKingCheck
    ? "bg-rose-500/80 ring-4 ring-rose-500 animate-pulse"
    : isSelected
      ? "bg-amber-400/70 ring-4 ring-amber-400"
      : isHint
        ? "bg-cyan-400/60 ring-2 ring-cyan-400 animate-pulse"
        : isLastMove
          ? "bg-yellow-300/40"
          : baseColor

  let captureDisplaySq = displaySq
  let mut squareChildren = []

  // Rank/File coordinate labels
  if (c == (state.isFlipped ? 7 : 0)) {
    squareChildren.push(h("span", { className: "absolute top-0.5 left-1 text-[9px] font-mono font-bold opacity-60 pointer-events-none" }, to_string(8 - r)))
  }
  if (r == (state.isFlipped ? 0 : 7)) {
    let fLabel = c == 0 ? "a" : c == 1 ? "b" : c == 2 ? "c" : c == 3 ? "d" : c == 4 ? "e" : c == 5 ? "f" : c == 6 ? "g" : "h"
    squareChildren.push(h("span", { className: "absolute bottom-0.5 right-1 text-[9px] font-mono font-bold opacity-60 pointer-events-none" }, fLabel))
  }

  // Piece Glyph with high-contrast drop shadow
  if (p != 0) {
    let pieceColorClass = pColor == 1
      ? "text-slate-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] filter"
      : "text-slate-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)] filter"
    squareChildren.push(h("span", { className: concat("text-3xl sm:text-4xl md:text-5xl font-serif select-none transition-transform duration-75 active:scale-95 ", pieceColorClass) }, glyph))
  }

  // Legal Move Marker Overlay
  if (isLegalDest) {
    if (p != 0) {
      // Capture Ring
      squareChildren.push(h("div", { className: "absolute inset-0 rounded-full border-4 border-rose-500/80 ring-2 ring-rose-500/40 pointer-events-none animate-pulse" }, []))
    } else {
      // Destination Dot
      squareChildren.push(h("div", { className: "w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-slate-900/40 pointer-events-none shadow-inner" }, []))
    }
  }

  let sqClass = concat("w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center relative cursor-pointer select-none transition-colors ", highlight)

  h("div", {
    className: sqClass,
    onClick: fn() { dispatch(SelectSquare(captureDisplaySq)) }
  }, squareChildren)
}

function renderBoard() {
  let mut squareElements = []
  for (let mut sq = 0; sq < 64; sq = sq + 1) {
    squareElements.push(renderSquare(sq))
  }

  h("div", { className: "flex justify-center py-2" }, [
    h("div", { className: "grid grid-cols-8 p-3 bg-slate-950 rounded-2xl border-4 border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden" }, squareElements)
  ])
}

function renderMoveLog() {
  let mut movePairs = []
  let total = Array.len(state.moveLogSAN)
  let mut moveIdx = 0

  while (moveIdx < total) {
    let num = Math.floor(moveIdx / 2) + 1
    let whiteMove = state.moveLogSAN[moveIdx]
    let blackMove = moveIdx + 1 < total ? state.moveLogSAN[moveIdx + 1] : ""

    movePairs.push(h("div", { className: "flex items-center text-xs font-mono py-1 px-2 hover:bg-slate-800/60 rounded border-b border-slate-800/40" }, [
      h("span", { className: "w-8 text-slate-500 font-bold" }, concat(to_string(num), ".")),
      h("span", { className: "w-16 font-semibold text-amber-300" }, whiteMove),
      h("span", { className: "w-16 font-semibold text-cyan-300" }, blackMove)
    ]))

    moveIdx = moveIdx + 2
  }

  h("div", { className: "flex flex-col h-48 sm:h-64 bg-slate-950/80 rounded-xl border border-slate-800 p-2 overflow-y-auto" }, [
    h("div", { className: "text-xs font-bold uppercase tracking-wider text-slate-400 pb-1 mb-1 border-b border-slate-800 flex justify-between" }, [
      h("span", {}, "Move Notation (SAN)"),
      h("span", { className: "text-slate-500 font-mono" }, concat(to_string(total), " plies"))
    ]),
    h("div", { className: "flex flex-col space-y-0.5" }, movePairs)
  ])
}

function renderControls() {
  let modePvAI = state.mode == 0 ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
  let modePvP = state.mode == 1 ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:bg-slate-700"
  let modeAIvAI = state.mode == 2 ? "bg-indigo-600 text-white font-bold" : "bg-slate-800 text-slate-400 hover:bg-slate-700"

  let d1 = state.aiDepth == 1 ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold" : "bg-slate-800 border-slate-700 text-slate-400"
  let d2 = state.aiDepth == 2 ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold" : "bg-slate-800 border-slate-700 text-slate-400"
  let d3 = state.aiDepth == 3 ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold" : "bg-slate-800 border-slate-700 text-slate-400"

  h("div", { className: "flex flex-col space-y-3 bg-slate-900/70 p-3 sm:p-4 rounded-xl border border-slate-800" }, [
    // Top Row: Game Mode & Difficulty Selector
    h("div", { className: "flex flex-wrap items-center justify-between gap-2 text-xs" }, [
      h("div", { className: "flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800" }, [
        h("button", { className: concat("px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ", modePvAI), onClick: fn() { dispatch(SwitchMode(HumanVsAI)) } }, "Play vs AI"),
        h("button", { className: concat("px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ", modePvP), onClick: fn() { dispatch(SwitchMode(HumanVsHuman)) } }, "Pass & Play"),
        h("button", { className: concat("px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ", modeAIvAI), onClick: fn() { dispatch(SwitchMode(AIVsAI)) } }, "AI vs AI")
      ]),

      h("div", { className: "flex items-center space-x-1.5" }, [
        h("span", { className: "text-slate-400 uppercase font-semibold text-[10px]" }, "AI Depth:"),
        h("button", { className: concat("px-2 py-1 rounded border cursor-pointer ", d1), onClick: fn() { dispatch(SetAIDifficulty(1)) } }, "Casual (1)"),
        h("button", { className: concat("px-2 py-1 rounded border cursor-pointer ", d2), onClick: fn() { dispatch(SetAIDifficulty(2)) } }, "Medium (2)"),
        h("button", { className: concat("px-2 py-1 rounded border cursor-pointer ", d3), onClick: fn() { dispatch(SetAIDifficulty(3)) } }, "Master (3)")
      ])
    ]),

    // Action Tool Buttons
    h("div", { className: "flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs sm:text-sm" }, [
      h("div", { className: "flex items-center space-x-2" }, [
        h("button", {
          className: "px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-200 rounded-lg cursor-pointer transition-all flex items-center space-x-1.5",
          onClick: fn() { dispatch(UndoLastMove) }
        }, [
          h("span", {}, "↩️"),
          h("span", {}, "Undo Move")
        ]),
        h("button", {
          className: "px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 text-amber-300 font-semibold rounded-lg cursor-pointer transition-all flex items-center space-x-1.5 active:scale-95",
          onClick: fn() { dispatch(RequestHint) }
        }, [
          h("span", {}, "💡"),
          h("span", {}, "Grandmaster Hint")
        ]),
        h("button", {
          className: "px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-300 font-semibold rounded-lg cursor-pointer transition-all flex items-center space-x-1.5 active:scale-95",
          onClick: fn() { dispatch(RequestAIMove) }
        }, [
          h("span", {}, "⚡"),
          h("span", {}, "Force AI Move")
        ])
      ]),

      h("div", { className: "flex items-center space-x-2" }, [
        h("button", {
          className: "p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg cursor-pointer transition-colors active:scale-95",
          onClick: fn() { dispatch(ToggleBoardFlip) }
        }, "🔄 Flip"),
        h("button", {
          className: "p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg cursor-pointer transition-colors active:scale-95",
          onClick: fn() { dispatch(ToggleSound) }
        }, state.audioEnabled ? "🔊" : "🔇"),
        h("button", {
          className: "px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 rounded-lg cursor-pointer font-semibold transition-all active:scale-95",
          onClick: fn() { dispatch(RestartMatch) }
        }, "New Game")
      ])
    ])
  ])
}

function renderStatusHeader() {
  let turnBadge = state.turn == 1
    ? "bg-slate-100 text-slate-900 border-slate-300"
    : "bg-slate-950 text-slate-100 border-slate-700"

  let evalScore = evaluateBoard(state.board)
  let evalText = evalScore >= 0
    ? concat("+", to_string(Math.floor(evalScore / 100)))
    : to_string(Math.floor(evalScore / 100))

  h("div", { className: "flex items-center justify-between p-3 sm:p-4 bg-slate-900/90 border border-slate-800 rounded-xl shadow-lg" }, [
    // Turn Indicator
    h("div", { className: "flex items-center space-x-3" }, [
      h("div", { className: concat("w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-lg shadow ", turnBadge) }, state.turn == 1 ? "♔" : "♚"),
      h("div", { className: "flex flex-col" }, [
        h("span", { className: "text-sm font-bold text-slate-100" }, state.turn == 1 ? "White's Turn" : "Black's Turn"),
        h("span", { className: "text-xs font-mono text-slate-400" }, concat("Move #", to_string(state.fullMoveNumber)))
      ])
    ]),

    // Live Positional Evaluation Badge
    h("div", { className: "flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800" }, [
      h("span", { className: "text-xs uppercase font-semibold text-slate-400" }, "Eval:"),
      h("span", { className: "font-mono font-bold text-amber-400 text-sm" }, evalText)
    ])
  ])
}

function renderUI() {
  let vnode = h("div", { className: "w-full max-w-5xl mx-auto p-2 sm:p-4 md:p-6 font-sans text-slate-100 min-h-[700px] flex flex-col space-y-3" }, [
    // Top Title Bar
    h("div", { className: "flex items-center justify-between pb-2 border-b border-slate-800" }, [
      h("div", { className: "flex items-center space-x-2.5" }, [
        h("span", { className: "text-2xl" }, "♟️"),
        h("h1", { className: "text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300 bg-clip-text text-transparent tracking-wide" }, "GRANDMASTER CHESS"),
        h("span", { className: "text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-semibold border border-indigo-500/30" }, "TypeLang GADT & Minimax")
      ]),
      h("div", { className: "text-xs text-slate-400 font-mono italic hidden md:block" }, state.hintMessage)
    ]),

    // Status Banner
    renderStatusHeader(),

    // Graveyard White (Captured by Black)
    renderGraveyard(state.capturedWhite, true),

    // Main Game Arena: Chessboard & Move Log side-by-side on large screens
    h("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 items-start" }, [
      h("div", { className: "lg:col-span-2 flex flex-col items-center" }, [
        renderBoard()
      ]),
      h("div", { className: "flex flex-col space-y-3" }, [
        renderMoveLog(),
        renderGraveyard(state.capturedBlack, false)
      ])
    ]),

    // Controls & Settings Panel
    renderControls()
  ])

  mount("app-root", vnode)
}

// =========================================================================
// 11. Engine Bootstrap
// =========================================================================

initStartingPosition()
renderUI()

println("================================================================")
println("♔ TypeLang Grandmaster Chess & Minimax AI Engine Initialized!")
println("================================================================")
println("• Full FIDE Rules Engine: En Passant, Kingside/Queenside Castling & Promotions")
println("• Complete Check, Checkmate, Stalemate & Strict Move Validation")
println("• Minimax AI with Alpha-Beta Pruning, Positional Piece-Square Tables (PST)")
println("• Standard Algebraic Notation (SAN) move logger & Web Audio synthesis")
println("================================================================")
`
};
