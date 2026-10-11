import { ExampleProgram } from "./types";

export const example32Solitaire: ExampleProgram = {
  id: 'solitaire_klondike',
  name: '32. Klondike Solitaire (Functional Card Game Engine)',
  category: 'Interactive Web Apps',
  description: 'A classic game of Klondike Solitaire built with GADTs, pattern matching, state transition dispatcher, and Virtual DOM rendering. Move cards, draw from stock, build foundations to win.',
  code: `import DOM.{ h, mount }
import Math.{ floor, random }

// ==========================================
// 1. Data Types
// ==========================================

type Suit =
  | Hearts: Suit
  | Diamonds: Suit
  | Clubs: Suit
  | Spades: Suit

type Card =
  | Card(rank: number, suit: Suit, isFaceUp: boolean): Card

type Action =
  | DrawStockAction: Action
  | ClickZoneAction(zone: string, index: number): Action
  | DealAction: Action
  | SetDrawModeAction(mode: number): Action

// ==========================================
// 2. Application State
// ==========================================

let state = {
  mut stock: [],
  mut waste: [],
  mut f0: [],
  mut f1: [],
  mut f2: [],
  mut f3: [],
  mut t0: [],
  mut t1: [],
  mut t2: [],
  mut t3: [],
  mut t4: [],
  mut t5: [],
  mut t6: [],
  mut selectedSource: "",
  mut selectedIndex: -1,
  mut moves: 0,
  mut score: 0,
  mut drawMode: 3,
  mut wasteVisibleCount: 0,
  mut isWon: false
}

// ==========================================
// 3. Helper Functions
// ==========================================

function isRed(suit: Suit): boolean {
  match (suit) {
    Hearts => true
    Diamonds => true
    Clubs => false
    Spades => false
  }
}

function canStackTableau(bottom: Card, top: Card): boolean {
  match (bottom) {
    Card(br, bs, bf) => {
      match (top) {
        Card(tr, ts, tf) => {
          if (br == tr + 1) {
            if (isRed(bs) != isRed(ts)) {
              true
            } else { false }
          } else { false }
        }
      }
    }
  }
}

function canStackFoundation(fCol: Card[], top: Card): boolean {
  match (top) {
    Card(tr, ts, tf) => {
      if (fCol.length == 0) {
        tr == 1
      } else {
        let bottom = fCol[fCol.length - 1]
        match (bottom) {
          Card(br, bs, bf) => {
            let mut sameSuit = false
            match(bs) {
              Hearts => { match(ts) { Hearts => { sameSuit = true } Diamonds => {} Clubs => {} Spades => {} } }
              Diamonds => { match(ts) { Diamonds => { sameSuit = true } Hearts => {} Clubs => {} Spades => {} } }
              Clubs => { match(ts) { Clubs => { sameSuit = true } Hearts => {} Diamonds => {} Spades => {} } }
              Spades => { match(ts) { Spades => { sameSuit = true } Hearts => {} Diamonds => {} Clubs => {} } }
            }
            if (sameSuit && tr == br + 1) {
              true
            } else { false }
          }
        }
      }
    }
  }
}

function getCol(id: string): Card[] {
  switch (id) {
    case "waste": state.waste
    case "f0": state.f0
    case "f1": state.f1
    case "f2": state.f2
    case "f3": state.f3
    case "t0": state.t0
    case "t1": state.t1
    case "t2": state.t2
    case "t3": state.t3
    case "t4": state.t4
    case "t5": state.t5
    case "t6": state.t6
    default: []
  }
}

function setCol(id: string, col: Card[]) {
  switch (id) {
    case "waste": state.waste = col
    case "f0": state.f0 = col
    case "f1": state.f1 = col
    case "f2": state.f2 = col
    case "f3": state.f3 = col
    case "t0": state.t0 = col
    case "t1": state.t1 = col
    case "t2": state.t2 = col
    case "t3": state.t3 = col
    case "t4": state.t4 = col
    case "t5": state.t5 = col
    case "t6": state.t6 = col
  }
}

function checkWin() {
  if (state.f0.length == 13 && state.f1.length == 13 && state.f2.length == 13 && state.f3.length == 13) {
    state.isWon = true
  }
}

function tryAutoMoveFoundation(sourceZone: string, cardIdx: number) {
  let sourceCol = getCol(sourceZone)
  if (sourceCol.length > 0) {
    if (cardIdx == sourceCol.length - 1) {
      let topCard = sourceCol[cardIdx]
      let foundations = ["f0", "f1", "f2", "f3"]
      let mut targetFound = ""
      for (let mut f = 0; f < 4; f = f + 1) {
        if (targetFound == "") {
          let fCol = getCol(foundations[f])
          if (canStackFoundation(fCol, topCard)) {
            targetFound = foundations[f]
          }
        }
      }

      if (targetFound != "") {
        tryMove(targetFound)
      }
    }
  }
}

function dealGame() {
  let suits = [Hearts, Diamonds, Clubs, Spades]
  let mut deck = []
  for (let mut s = 0; s < 4; s = s + 1) {
    let suit = suits[s]
    for (let mut r = 1; r <= 13; r = r + 1) {
      deck.push(Card(r, suit, false))
    }
  }

  // Shuffle
  for (let mut i = deck.length - 1; i > 0; i = i - 1) {
    let j = Math.floor(Math.random() * (i + 1))
    let temp = deck[i]
    deck[i] = deck[j]
    deck[j] = temp
  }

  // Clear existing
  state.stock = []
  state.waste = []
  state.f0 = []; state.f1 = []; state.f2 = []; state.f3 = []
  state.t0 = []; state.t1 = []; state.t2 = []; state.t3 = []; state.t4 = []; state.t5 = []; state.t6 = []

  let cols = ["t0", "t1", "t2", "t3", "t4", "t5", "t6"]
  for (let mut colIdx = 0; colIdx < 7; colIdx = colIdx + 1) {
    let mut current = getCol(cols[colIdx])
    for (let mut count = 0; count <= colIdx; count = count + 1) {
      let c = deck.pop()
      match (c) {
        Card(rank, suit, isFup) => {
          let isLast = (count == colIdx)
          current.push(Card(rank, suit, isLast))
        }
      }
    }
    setCol(cols[colIdx], current)
  }

  for (let mut i = 0; i < deck.length; i = i + 1) {
    state.stock.push(deck[i])
  }

  state.wasteVisibleCount = 0
  state.selectedSource = ""
  state.selectedIndex = -1
  state.moves = 0
  state.score = 0
  state.isWon = false
}

function tryMove(dest: string) {
  if (state.selectedSource == "") { return }
  
  let sourceCol = getCol(state.selectedSource)
  if (sourceCol.length == 0) { return }
  if (state.selectedIndex < 0 || state.selectedIndex >= sourceCol.length) { return }
  let topCard = sourceCol[state.selectedIndex]
  let destCol = getCol(dest)

  // From waste or foundation, only the top card can be moved
  if (state.selectedSource == "waste" || state.selectedSource == "f0" || state.selectedSource == "f1" || state.selectedSource == "f2" || state.selectedSource == "f3") {
    if (state.selectedIndex != sourceCol.length - 1) {
      state.selectedSource = ""
      state.selectedIndex = -1
      return
    }
  }

  let mut isValid = false
  switch (dest) {
    case "f0", "f1", "f2", "f3": {
      if (state.selectedIndex == sourceCol.length - 1) {
        if (canStackFoundation(destCol, topCard)) {
          isValid = true
        }
      }
    }
    case "t0", "t1", "t2", "t3", "t4", "t5", "t6": {
      if (destCol.length == 0) {
        match (topCard) {
          Card(r, s, f) => {
            if (r == 13) { isValid = true }
          }
        }
      } else {
        let destTop = destCol[destCol.length - 1]
        if (canStackTableau(destTop, topCard)) {
          isValid = true
        }
      }
    }
  }

  if (isValid) {
    // extract moving cards
    let mut moving = []
    for (let mut i = state.selectedIndex; i < sourceCol.length; i = i + 1) {
      moving.push(sourceCol[i])
    }
    
    // leave non-moving cards
    let mut newSource = []
    for (let mut i = 0; i < state.selectedIndex; i = i + 1) {
      newSource.push(sourceCol[i])
    }
    
    // auto-flip new top card in tableau
    if (newSource.length > 0) {
      let lastItem = newSource[newSource.length - 1]
      match (lastItem) {
        Card(r, s, f) => {
          if (!f) {
             newSource[newSource.length - 1] = Card(r, s, true)
             state.score = state.score + 5
          }
        }
      }
    }
    
    // append to dest
    for (let mut i = 0; i < moving.length; i = i + 1) {
      destCol.push(moving[i])
    }

    setCol(state.selectedSource, newSource)
    setCol(dest, destCol)

    // Update waste visibility and score if moving from waste
    if (state.selectedSource == "waste") {
      if (newSource.length == 0) {
        state.wasteVisibleCount = 0
      } else if (state.wasteVisibleCount > 1) {
        state.wasteVisibleCount = state.wasteVisibleCount - 1
      } else {
        state.wasteVisibleCount = 1
      }
      state.score = state.score + 5
    }

    state.selectedSource = ""
    state.selectedIndex = -1
    state.moves = state.moves + 1
    
    switch (dest) {
      case "f0", "f1", "f2", "f3":
        state.score = state.score + 10
    }

    checkWin()
  } else {
    // Invalid move
    state.selectedSource = ""
    state.selectedIndex = -1
  }
}

// ==========================================
// 4. Action Dispatcher
// ==========================================

function dispatch(action: Action) {
  match (action) {
    DealAction => { dealGame() }
    SetDrawModeAction(mode) => {
      state.drawMode = mode
      if (state.waste.length > 0) {
        if (mode == 1) {
          state.wasteVisibleCount = 1
        } else {
          let mut vis = 3
          if (state.waste.length < vis) {
            vis = state.waste.length
          }
          state.wasteVisibleCount = vis
        }
      }
    }
    DrawStockAction => {
      if (state.stock.length > 0) {
        let mut countToDraw = state.drawMode
        if (state.stock.length < countToDraw) {
          countToDraw = state.stock.length
        }
        for (let mut i = 0; i < countToDraw; i = i + 1) {
          let c = state.stock.pop()
          match (c) {
            Card(r, s, f) => {
              state.waste.push(Card(r, s, true))
            }
          }
        }
        state.wasteVisibleCount = countToDraw
        state.moves = state.moves + 1
      } else if (state.waste.length > 0) {
        let mut newStock = []
        for (let mut i = state.waste.length - 1; i >= 0; i = i - 1) {
          let c = state.waste[i]
          match (c) {
             Card(r, s, f) => {
               newStock.push(Card(r, s, false))
             }
          }
        }
        state.stock = newStock
        state.waste = []
        state.wasteVisibleCount = 0
        state.moves = state.moves + 1
      }
      state.selectedSource = ""
      state.selectedIndex = -1
    }
    ClickZoneAction(zone, index) => {
      if (state.selectedSource != "") {
        if (state.selectedSource == zone && state.selectedIndex == index) {
          tryAutoMoveFoundation(zone, index)
          state.selectedSource = ""
          state.selectedIndex = -1
        } else {
          tryMove(zone)
        }
      } else {
        let col = getCol(zone)
        if (col.length > 0 && index >= 0) {
           let c = col[index]
           match (c) {
             Card(r, s, f) => {
               if (f) {
                 if (zone == "waste") {
                   if (index == col.length - 1) {
                     state.selectedSource = zone
                     state.selectedIndex = index
                   }
                 } else {
                   state.selectedSource = zone
                   state.selectedIndex = index
                 }
               }
             }
           }
        }
      }
    }
  }
  renderGame()
}

// ==========================================
// 5. Virtual DOM View Rendering
// ==========================================

function renderCardUI(card: Card, isSelected: boolean, isFaceUp: boolean, onClickHandler: any) {
  if (isFaceUp) {
    match (card) {
      Card(rank, suit, f) => {
        let mut color = "#000"
        let mut symbol = ""
        match (suit) {
          Hearts => { color = "#ef4444"; symbol = "♥" }
          Diamonds => { color = "#ef4444"; symbol = "♦" }
          Clubs => { color = "#334155"; symbol = "♣" }
          Spades => { color = "#0f172a"; symbol = "♠" }
        }
        let isRedCard = (color == "#ef4444")
        let textCls = isRedCard ? "text-rose-600" : "text-slate-900"
        
        let rankStr = switch (rank) {
          case 1: "A"
          case 11: "J"
          case 12: "Q"
          case 13: "K"
          default: to_string(rank)
        }

        let ringCls = isSelected ? " ring-2 sm:ring-4 ring-yellow-400 z-50 shadow-2xl scale-105 " : " "
        
        let mut centerContent = []
        if (rank == 1) {
          centerContent.push(h("div", { className: concat("text-2xl sm:text-4xl md:text-5xl opacity-90 ", textCls) }, symbol))
        } else if (rank > 1 && rank <= 10) {
          let mut pips = []
          for (let mut p = 0; p < rank; p = p + 1) {
            pips.push(h("span", { className: "leading-none flex-shrink-0" }, symbol))
          }
          centerContent.push(h("div", { className: concat("flex flex-wrap justify-center content-center gap-[1px] sm:gap-[2px] w-full px-1 sm:px-2 text-[7px] sm:text-[11px] md:text-sm ", textCls) }, pips))
        } else {
          let faceChar = switch (rank) {
            case 11: "J"
            case 12: "Q"
            case 13: "K"
            default: "J"
          }
          centerContent.push(h("div", { className: concat("flex flex-col items-center justify-center opacity-40 ", textCls) }, [
            h("span", { className: "text-base sm:text-3xl md:text-4xl font-black font-serif leading-none" }, faceChar)
          ]))
        }

        h("div", {
          className: concat(concat("w-10 h-14 sm:w-14 sm:h-20 md:w-20 md:h-28 rounded-md sm:rounded-lg bg-slate-50 border border-slate-300 shadow-md flex flex-col justify-between p-0.5 sm:p-1.5 cursor-pointer hover:shadow-xl transition-all duration-150 ", ringCls), ""),
          onClick: onClickHandler
        }, [
          h("div", { className: concat("leading-none font-bold text-[10px] sm:text-sm ", textCls) }, rankStr),
          h("div", { className: "flex-1 flex items-center justify-center overflow-hidden" }, centerContent),
          h("div", { className: concat("leading-none font-bold text-[10px] sm:text-sm rotate-180 ", textCls) }, rankStr)
        ])
      }
    }
  } else {
    h("div", {
      className: "w-10 h-14 sm:w-14 sm:h-20 md:w-20 md:h-28 rounded-md sm:rounded-lg bg-blue-900 border-2 border-slate-200 shadow-md flex items-center justify-center cursor-pointer hover:brightness-110",
      onClick: onClickHandler
    }, [
      h("div", { className: "w-[85%] h-[88%] border border-dashed border-blue-400/50 rounded flex items-center justify-center" }, [
        h("div", { className: "text-blue-400/30 font-serif font-black text-lg sm:text-xl md:text-2xl" }, "♦")
      ])
    ])
  }
}

function renderEmptySlot(onClickHandler: any) {
  h("div", {
    className: "w-10 h-14 sm:w-14 sm:h-20 md:w-20 md:h-28 rounded-md sm:rounded-lg border-2 border-dashed border-emerald-700/50 bg-emerald-950/20 flex items-center justify-center cursor-pointer",
    onClick: onClickHandler
  }, "")
}

function renderTopRow() {
  let stockLen = state.stock.length
  let stockEl = stockLen > 0
    ? h("div", {
        className: "relative cursor-pointer transition hover:-translate-y-1 select-none",
        onClick: fn() { dispatch(DrawStockAction) }
      }, [
        renderCardUI(state.stock[state.stock.length - 1], false, false, fn() {}),
        h("div", {
          className: "absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[9px] sm:text-xs font-mono font-black px-1.5 py-0.5 rounded-full shadow border border-slate-900 pointer-events-none"
        }, to_string(stockLen))
      ])
    : (state.waste.length > 0
        ? h("div", {
            className: "w-10 h-14 sm:w-14 sm:h-20 md:w-20 md:h-28 rounded-md sm:rounded-lg border-2 border-dashed border-amber-400/80 bg-emerald-950/40 flex flex-col items-center justify-center cursor-pointer hover:border-amber-300 hover:bg-emerald-900/50 transition select-none group",
            onClick: fn() { dispatch(DrawStockAction) }
          }, [
            h("span", { className: "text-amber-400 text-base sm:text-2xl font-black group-hover:rotate-180 transition-transform duration-300" }, "↻"),
            h("span", { className: "text-[7px] sm:text-[9px] text-amber-300/80 font-mono font-bold leading-none mt-0.5 uppercase" }, "Reset")
          ])
        : renderEmptySlot(fn() { dispatch(DrawStockAction) })
      )

  let isWasteSelected = (state.selectedSource == "waste")
  let mut wasteCards = []
  if (state.waste.length == 0) {
    wasteCards.push(renderEmptySlot(fn() { dispatch(ClickZoneAction("waste", -1)) }))
  } else {
    let mut visCount = state.wasteVisibleCount
    if (visCount <= 0) {
      visCount = 1
    }
    if (visCount > state.waste.length) {
      visCount = state.waste.length
    }
    let startIdx = state.waste.length - visCount
    for (let mut i = startIdx; i < state.waste.length; i = i + 1) {
      let captureI = i
      let isTop = (i == state.waste.length - 1)
      let isSelected = (isWasteSelected && isTop)
      let offsetFromStart = i - startIdx
      let leftOffset = switch (offsetFromStart) {
        case 1: "left-3 sm:left-5 md:left-7"
        case 2: "left-6 sm:left-10 md:left-14"
        default: "left-0"
      }
      let posCls = concat("absolute top-0 ", leftOffset)
      let clickHandler = isTop ? (fn() { dispatch(ClickZoneAction("waste", captureI)) }) : (fn() {})
      let cardEl = renderCardUI(state.waste[i], isSelected, true, clickHandler)
      wasteCards.push(h("div", { className: posCls }, [cardEl]))
    }
  }

  let wasteContainer = h("div", {
    className: "relative h-14 sm:h-20 md:h-28 w-16 sm:w-24 md:w-36 flex items-start"
  }, wasteCards)

  let f0El = state.f0.length > 0
    ? renderCardUI(state.f0[state.f0.length - 1], state.selectedSource == "f0", true, fn() { dispatch(ClickZoneAction("f0", state.f0.length - 1)) })
    : renderEmptySlot(fn() { dispatch(ClickZoneAction("f0", -1)) })
  let f1El = state.f1.length > 0
    ? renderCardUI(state.f1[state.f1.length - 1], state.selectedSource == "f1", true, fn() { dispatch(ClickZoneAction("f1", state.f1.length - 1)) })
    : renderEmptySlot(fn() { dispatch(ClickZoneAction("f1", -1)) })
  let f2El = state.f2.length > 0
    ? renderCardUI(state.f2[state.f2.length - 1], state.selectedSource == "f2", true, fn() { dispatch(ClickZoneAction("f2", state.f2.length - 1)) })
    : renderEmptySlot(fn() { dispatch(ClickZoneAction("f2", -1)) })
  let f3El = state.f3.length > 0
    ? renderCardUI(state.f3[state.f3.length - 1], state.selectedSource == "f3", true, fn() { dispatch(ClickZoneAction("f3", state.f3.length - 1)) })
    : renderEmptySlot(fn() { dispatch(ClickZoneAction("f3", -1)) })

  h("div", { className: "flex justify-between items-start mb-4 sm:mb-6 md:mb-10 px-0 sm:px-2" }, [
    h("div", { className: "flex space-x-2 sm:space-x-3 md:space-x-4 items-start" }, [
      stockEl,
      wasteContainer
    ]),
    h("div", { className: "flex space-x-1 sm:space-x-2 md:space-x-4 items-start" }, [
      f0El, f1El, f2El, f3El
    ])
  ])
}

function renderTableauCol(colId: string, col: Card[]) {
  let mut cards = []
  if (col.length == 0) {
    cards.push(renderEmptySlot(fn() { dispatch(ClickZoneAction(colId, -1)) }))
  } else {
    for (let mut i = 0; i < col.length; i = i + 1) {
      let captureI = i
      let c = col[i]
      let isSelected = (state.selectedSource == colId && state.selectedIndex <= i)
      let offsetCls = i == 0 ? "" : "-mt-10 sm:-mt-14 md:-mt-20"
      
      match (c) {
        Card(rank, suit, isFaceUp) => {
          let wrapperCls = concat("relative transition-transform duration-200 ", offsetCls)
          cards.push(
            h("div", { className: wrapperCls }, [
              renderCardUI(c, isSelected, isFaceUp, fn() { dispatch(ClickZoneAction(colId, captureI)) })
            ])
          )
        }
      }
    }
  }
  
  h("div", { className: "flex flex-col items-center" }, cards)
}

function renderGame() {
  let winBanner = state.isWon
    ? h("div", { className: "mb-4 p-3 sm:p-5 bg-gradient-to-r from-amber-600/30 via-yellow-500/30 to-amber-600/30 border-2 border-yellow-400 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-2xl" }, [
        h("div", {}, [
          h("h2", { className: "text-base sm:text-2xl font-black text-amber-300 font-serif" }, "🎉 CONGRATULATIONS! YOU WON!"),
          h("p", { className: "text-xs sm:text-sm text-amber-100/90 mt-0.5" }, concat(concat("All 4 foundations built! Final moves: ", to_string(state.moves)), concat(" | Score: ", to_string(state.score))))
        ]),
        h("button", {
          className: "px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black rounded-lg sm:rounded-xl shadow-lg cursor-pointer hover:scale-105 transition-all text-xs sm:text-sm uppercase tracking-wider",
          onClick: fn() { dispatch(DealAction) }
        }, "Play Again")
      ])
    : h("div", { className: "hidden" }, "")

  let vnode = h("div", { className: "w-full max-w-5xl mx-auto p-1 sm:p-2 md:p-6 font-sans text-slate-100 min-h-[600px] flex flex-col" }, [
    // Header
    h("div", { className: "flex flex-wrap justify-between items-center mb-4 sm:mb-6 md:mb-8 pb-3 sm:pb-4 border-b border-emerald-800/50 gap-2" }, [
      h("div", { className: "flex items-center space-x-2 sm:space-x-3" }, [
        h("h1", { className: "text-lg sm:text-xl md:text-2xl font-black text-amber-400 tracking-wide font-serif" }, "♠ KLONDIKE SOLITAIRE"),
        // Draw Mode Switcher (Deal 3 vs Deal 1)
        h("div", { className: "flex items-center bg-emerald-950/80 p-0.5 rounded-lg border border-emerald-700/60 shadow-inner" }, [
          h("button", {
            className: concat("px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold transition-all cursor-pointer ", state.drawMode == 3 ? "bg-amber-500 text-slate-950 shadow" : "text-emerald-300 hover:text-white"),
            onClick: fn() { dispatch(SetDrawModeAction(3)) }
          }, "Deal 3"),
          h("button", {
            className: concat("px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold transition-all cursor-pointer ", state.drawMode == 1 ? "bg-amber-500 text-slate-950 shadow" : "text-emerald-300 hover:text-white"),
            onClick: fn() { dispatch(SetDrawModeAction(1)) }
          }, "Deal 1")
        ])
      ]),
      h("div", { className: "flex items-center space-x-2 sm:space-x-3" }, [
        h("div", { className: "px-2 py-1 sm:px-3 bg-emerald-900/50 rounded-lg border border-emerald-700/50 shadow-inner flex items-center" }, [
          h("span", { className: "text-[8px] sm:text-[10px] uppercase text-emerald-400 mr-1 sm:mr-2" }, "Moves"),
          h("span", { className: "font-mono text-sm sm:text-base font-bold text-white" }, to_string(state.moves))
        ]),
        h("div", { className: "px-2 py-1 sm:px-3 bg-emerald-900/50 rounded-lg border border-emerald-700/50 shadow-inner flex items-center" }, [
          h("span", { className: "text-[8px] sm:text-[10px] uppercase text-amber-400 mr-1 sm:mr-2" }, "Score"),
          h("span", { className: "font-mono text-sm sm:text-base font-bold text-white" }, to_string(state.score))
        ]),
        h("button", {
          className: "px-2 py-1 sm:px-4 sm:py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-amber-950 font-bold rounded-lg shadow-lg cursor-pointer transition-transform active:scale-95 text-xs sm:text-sm uppercase tracking-wider",
          onClick: fn() { dispatch(DealAction) }
        }, "New Deal")
      ])
    ]),
    
    winBanner,

    // Play Area
    h("div", { className: "flex-1 bg-emerald-900/40 rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-4 md:p-8 border border-emerald-700/30 shadow-2xl overflow-x-hidden" }, [
      renderTopRow(),
      h("div", { className: "grid grid-cols-7 gap-1 sm:gap-2 md:gap-4 mt-4 md:mt-8" }, [
        renderTableauCol("t0", state.t0),
        renderTableauCol("t1", state.t1),
        renderTableauCol("t2", state.t2),
        renderTableauCol("t3", state.t3),
        renderTableauCol("t4", state.t4),
        renderTableauCol("t5", state.t5),
        renderTableauCol("t6", state.t6)
      ])
    ])
  ])
  
  mount("app-root", vnode)
}

// ==========================================
// 6. Initialization
// ==========================================

dealGame()
renderGame()
println("Klondike Solitaire Engine Initialized!")
`
};
