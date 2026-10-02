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
  mut score: 0
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

  state.selectedSource = ""
  state.selectedIndex = -1
  state.moves = 0
  state.score = 0
}

function tryMove(dest: string) {
  if (state.selectedSource == "") { return }
  
  let sourceCol = getCol(state.selectedSource)
  if (sourceCol.length == 0) { return }
  let topCard = sourceCol[state.selectedIndex]
  let destCol = getCol(dest)

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
    state.selectedSource = ""
    state.selectedIndex = -1
    state.moves = state.moves + 1
    
    switch (dest) {
      case "f0", "f1", "f2", "f3":
        state.score = state.score + 10
    }
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
    DrawStockAction => {
      if (state.stock.length > 0) {
        let c = state.stock.pop()
        match (c) {
          Card(r, s, f) => {
            state.waste.push(Card(r, s, true))
          }
        }
        state.moves = state.moves + 1
      } else {
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
        state.moves = state.moves + 1
      }
      state.selectedSource = ""
      state.selectedIndex = -1
    }
    ClickZoneAction(zone, index) => {
      if (state.selectedSource != "") {
        if (state.selectedSource == zone && state.selectedIndex == index) {
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
                 state.selectedSource = zone
                 state.selectedIndex = index
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
  let stockEl = state.stock.length > 0
    ? h("div", { className: "relative cursor-pointer transition hover:-translate-y-1", onClick: fn() { dispatch(DrawStockAction) } }, [
        renderCardUI(state.stock[0], false, false, fn() { dispatch(DrawStockAction) })
      ])
    : h("div", { className: "cursor-pointer opacity-50", onClick: fn() { dispatch(DrawStockAction) } }, [
        renderEmptySlot(fn() { dispatch(DrawStockAction) })
      ])

  let isWasteSelected = (state.selectedSource == "waste")
  let wasteEl = state.waste.length > 0
    ? h("div", { className: "relative hover:-translate-y-1 transition" }, [
        renderCardUI(state.waste[state.waste.length - 1], isWasteSelected, true, fn() { dispatch(ClickZoneAction("waste", state.waste.length - 1)) })
      ])
    : renderEmptySlot(fn() { dispatch(ClickZoneAction("waste", -1)) })

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
    h("div", { className: "flex space-x-1 sm:space-x-2 md:space-x-4" }, [
      stockEl,
      wasteEl
    ]),
    h("div", { className: "flex space-x-1 sm:space-x-2 md:space-x-4" }, [
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
  let vnode = h("div", { className: "w-full max-w-5xl mx-auto p-1 sm:p-2 md:p-6 font-sans text-slate-100 min-h-[600px] flex flex-col" }, [
    // Header
    h("div", { className: "flex flex-wrap justify-between items-center mb-4 sm:mb-6 md:mb-8 pb-3 sm:pb-4 border-b border-emerald-800/50" }, [
      h("h1", { className: "text-lg sm:text-xl md:text-2xl font-black text-amber-400 tracking-wide font-serif" }, "♠ KLONDIKE SOLITAIRE"),
      h("div", { className: "flex items-center space-x-2 sm:space-x-4 mt-2 md:mt-0" }, [
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
