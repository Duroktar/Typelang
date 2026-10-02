import { ExampleProgram } from "./types";

export const example14RoyalBlackjackGadt: ExampleProgram = {
    id: 'royal_blackjack_gadt',
    name: '14. Royal Blackjack Casino (Functional GADT Engine & Live UI)',
    category: 'Interactive Web Apps',
    description: 'Advanced casino Blackjack engine built with GADTs, pure state transitions, pattern matching, soft-Ace calculation, basic strategy advisor, and responsive Virtual DOM table rendering.',
    code: `import DOM.{ h, mount }
import Math.{ floor, random }

// ==========================================
// 1. GADT & Algebraic Data Types Modeling
// ==========================================

type Suit =
  | Hearts: Suit
  | Diamonds: Suit
  | Clubs: Suit
  | Spades: Suit

type SuitMeta =
  | SuitMeta(symbol: string, color: string, name: string): SuitMeta

type Card =
  | Card(rank: string, value: number, isAce: boolean, suit: Suit): Card

type HandScore =
  | HandScore(total: number, isSoft: boolean, isBust: boolean, isBlackjack: boolean): HandScore

type GamePhase =
  | Betting: GamePhase
  | PlayerTurn: GamePhase
  | DealerTurn: GamePhase
  | RoundOver: GamePhase

type Outcome =
  | InProgress: Outcome
  | PlayerBlackjack: Outcome
  | DealerBlackjack: Outcome
  | PlayerBust: Outcome
  | DealerBust: Outcome
  | PlayerWon: Outcome
  | DealerWon: Outcome
  | Push: Outcome

type Action =
  | BetAction(amount: number): Action
  | DealAction: Action
  | HitAction: Action
  | StandAction: Action
  | DoubleDownAction: Action
  | NextRoundAction: Action
  | ResetBankrollAction: Action

// ==========================================
// 2. Pure Functional Helper Functions
// ==========================================

function getSuitMeta(suit: Suit): SuitMeta {
  match (suit) {
    Hearts   => SuitMeta("♥", "#ef4444", "Hearts")
    Diamonds => SuitMeta("♦", "#ef4444", "Diamonds")
    Clubs    => SuitMeta("♣", "#334155", "Clubs")
    Spades   => SuitMeta("♠", "#0f172a", "Spades")
  }
}

function createStandardDeck(): Card[] {
  let suits = [Hearts, Diamonds, Clubs, Spades]
  let ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
  let values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11]

  let mut deck = []
  for (let mut s = 0; s < 4; s = s + 1) {
    let suit = suits[s]
    for (let mut r = 0; r < 13; r = r + 1) {
      let isAce = (r == 12)
      let card = Card(ranks[r], values[r], isAce, suit)
      deck.push(card)
    }
  }
  deck
}

function shuffleDeck(deck: Card[]): Card[] {
  let mut shuffled = []
  for (let mut i = 0; i < deck.length; i = i + 1) {
    shuffled.push(deck[i])
  }
  for (let mut i = shuffled.length - 1; i > 0; i = i - 1) {
    let j = Math.floor(Math.random() * (i + 1))
    let temp = shuffled[i]
    shuffled[i] = shuffled[j]
    shuffled[j] = temp
  }
  shuffled
}

function calculateScore(cards: Card[]): HandScore {
  let mut sum = 0
  let mut aceCount = 0
  for (let mut i = 0; i < cards.length; i = i + 1) {
    match (cards[i]) {
      Card(rank, value, isAce, suit) => {
        sum = sum + value
        if (isAce) {
          aceCount = aceCount + 1
        }
      }
    }
  }

  while (sum > 21 && aceCount > 0) {
    sum = sum - 10
    aceCount = aceCount - 1
  }

  let isSoft = (aceCount > 0)
  let isBust = (sum > 21)
  let isBlackjack = (cards.length == 2 && sum == 21)

  HandScore(sum, isSoft, isBust, isBlackjack)
}

function evaluateOutcome(playerScore: HandScore, dealerScore: HandScore): Outcome {
  match (playerScore) {
    HandScore(pTot, pSoft, pBust, pBj) => {
      match (dealerScore) {
        HandScore(dTot, dSoft, dBust, dBj) => {
          if (pBust) {
            PlayerBust
          } else if (pBj && dBj) {
            Push
          } else if (pBj) {
            PlayerBlackjack
          } else if (dBj) {
            DealerBlackjack
          } else if (dBust) {
            DealerBust
          } else if (pTot > dTot) {
            PlayerWon
          } else if (pTot < dTot) {
            DealerWon
          } else {
            Push
          }
        }
      }
    }
  }
}

// ==========================================
// 3. Application State & Game Store
// ==========================================

let state = {
  mut bankroll: 1000,
  mut currentBet: 50,
  mut deck: [],
  mut playerHand: [],
  mut dealerHand: [],
  mut phase: Betting,
  mut outcome: InProgress,
  mut message: "Welcome to Royal Blackjack! Place your bet and click DEAL.",
  mut rounds: 0,
  mut wins: 0,
  mut losses: 0,
  mut pushes: 0,
  mut blackjacks: 0
}

function finalizeRound(outcome: Outcome) {
  state.outcome = outcome
  state.phase = RoundOver
  state.rounds = state.rounds + 1

  match (outcome) {
    PlayerBlackjack => {
      let winBonus = Math.floor(state.currentBet * 1.5)
      state.bankroll = state.bankroll + state.currentBet + winBonus
      state.wins = state.wins + 1
      state.blackjacks = state.blackjacks + 1
      state.message = concat("✨ ROYAL BLACKJACK! 3:2 Payout! Won +$", to_string(winBonus))
    }
    PlayerWon => {
      state.bankroll = state.bankroll + (state.currentBet * 2)
      state.wins = state.wins + 1
      state.message = concat("🎉 YOU WIN! Beat Dealer hand. Won +$", to_string(state.currentBet))
    }
    DealerBust => {
      state.bankroll = state.bankroll + (state.currentBet * 2)
      state.wins = state.wins + 1
      state.message = concat("💥 DEALER BUSTS! You win +$", to_string(state.currentBet))
    }
    Push => {
      state.bankroll = state.bankroll + state.currentBet
      state.pushes = state.pushes + 1
      state.message = "🤝 PUSH (Tied Scores). Bet returned in full."
    }
    PlayerBust => {
      state.losses = state.losses + 1
      state.message = concat("💥 PLAYER BUST! Exceeded 21. Lost -$", to_string(state.currentBet))
    }
    DealerBlackjack => {
      state.losses = state.losses + 1
      state.message = concat("🃏 Dealer has Natural Blackjack! Lost -$", to_string(state.currentBet))
    }
    DealerWon => {
      state.losses = state.losses + 1
      state.message = concat("😢 Dealer wins with higher hand. Lost -$", to_string(state.currentBet))
    }
    InProgress => {
      state.message = "Round in progress..."
    }
  }
}

// ==========================================
// 4. Action Dispatcher (Pattern Matching GADTs)
// ==========================================

function dispatch(action: Action) {
  match (action) {
    BetAction(amount) => {
      if (state.phase == Betting) {
        if (amount == 0) {
          state.currentBet = 10
        } else {
          let nextBet = state.currentBet + amount
          if (nextBet >= 10 && nextBet <= state.bankroll) {
            state.currentBet = nextBet
          } else if (nextBet > state.bankroll) {
            state.currentBet = state.bankroll
          }
        }
      }
    }

    DealAction => {
      if (state.phase == Betting && state.bankroll >= state.currentBet && state.currentBet > 0) {
        state.bankroll = state.bankroll - state.currentBet
        let shoe = shuffleDeck(createStandardDeck())

        let p1 = shoe[0]
        let d1 = shoe[1]
        let p2 = shoe[2]
        let d2 = shoe[3]

        state.playerHand = [p1, p2]
        state.dealerHand = [d1, d2]

        let mut remDeck = []
        for (let mut i = 4; i < shoe.length; i = i + 1) {
          remDeck.push(shoe[i])
        }
        state.deck = remDeck
        state.phase = PlayerTurn
        state.outcome = InProgress

        let pScore = calculateScore(state.playerHand)
        let dScore = calculateScore(state.dealerHand)

        match (pScore) {
          HandScore(pt, ps, pb, pbj) => {
            if (pbj) {
              let out = evaluateOutcome(pScore, dScore)
              finalizeRound(out)
            } else {
              state.message = "Hand dealt. Choose: Hit, Stand, or Double Down."
            }
          }
        }
      }
    }

    HitAction => {
      if (state.phase == PlayerTurn && state.deck.length > 0) {
        let topCard = state.deck[0]
        let mut remDeck = []
        for (let mut i = 1; i < state.deck.length; i = i + 1) {
          remDeck.push(state.deck[i])
        }
        state.deck = remDeck
        state.playerHand.push(topCard)

        let pScore = calculateScore(state.playerHand)
        match (pScore) {
          HandScore(total, soft, bust, bj) => {
            if (bust) {
              let dScore = calculateScore(state.dealerHand)
              let out = evaluateOutcome(pScore, dScore)
              finalizeRound(out)
            } else if (total == 21) {
              dispatch(StandAction)
            } else {
              state.message = concat("Player hits. Hand total: ", to_string(total))
            }
          }
        }
      }
    }

    StandAction => {
      if (state.phase == PlayerTurn) {
        state.phase = DealerTurn

        let mut dScore = calculateScore(state.dealerHand)
        let mut currentDeck = state.deck
        let mut dealerActive = true

        while (dealerActive && currentDeck.length > 0) {
          match (dScore) {
            HandScore(dTot, dSoft, dBust, dBj) => {
              if (dTot < 17) {
                let card = currentDeck[0]
                let mut nextDeck = []
                for (let mut i = 1; i < currentDeck.length; i = i + 1) {
                  nextDeck.push(currentDeck[i])
                }
                currentDeck = nextDeck
                state.dealerHand.push(card)
                dScore = calculateScore(state.dealerHand)
              } else {
                dealerActive = false
              }
            }
          }
        }
        state.deck = currentDeck

        let pScore = calculateScore(state.playerHand)
        let out = evaluateOutcome(pScore, dScore)
        finalizeRound(out)
      }
    }

    DoubleDownAction => {
      if (state.phase == PlayerTurn && state.playerHand.length == 2 && state.bankroll >= state.currentBet) {
        state.bankroll = state.bankroll - state.currentBet
        state.currentBet = state.currentBet * 2

        let card = state.deck[0]
        let mut remDeck = []
        for (let mut i = 1; i < state.deck.length; i = i + 1) {
          remDeck.push(state.deck[i])
        }
        state.deck = remDeck
        state.playerHand.push(card)

        let pScore = calculateScore(state.playerHand)
        match (pScore) {
          HandScore(total, soft, bust, bj) => {
            if (bust) {
              let dScore = calculateScore(state.dealerHand)
              let out = evaluateOutcome(pScore, dScore)
              finalizeRound(out)
            } else {
              dispatch(StandAction)
            }
          }
        }
      }
    }

    NextRoundAction => {
      if (state.phase == RoundOver) {
        if (state.bankroll <= 0) {
          state.bankroll = 1000
          state.currentBet = 50
          state.message = "Reloaded $1,000 casino chips! Place your next bet."
        } else {
          state.message = "New round. Adjust your bet and click DEAL."
        }
        if (state.currentBet > state.bankroll) {
          state.currentBet = state.bankroll
        }
        state.playerHand = []
        state.dealerHand = []
        state.phase = Betting
        state.outcome = InProgress
      }
    }

    ResetBankrollAction => {
      state.bankroll = 1000
      state.currentBet = 50
      state.playerHand = []
      state.dealerHand = []
      state.phase = Betting
      state.outcome = InProgress
      state.rounds = 0
      state.wins = 0
      state.losses = 0
      state.pushes = 0
      state.blackjacks = 0
      state.message = "Table reset. Fresh $1,000 stack loaded."
    }
  }

  renderGame()
}

// ==========================================
// 5. Virtual DOM View Rendering
// ==========================================

function renderCard(card: Card, isHoleCard: boolean) {
  if (isHoleCard) {
    h("div", {
      className: "w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-34 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border-2 border-amber-400/60 rounded-xl shadow-xl flex flex-col items-center justify-center p-1 sm:p-1.5 transform hover:-translate-y-1 transition duration-200 select-none overflow-hidden"
    }, [
      h("div", { className: "w-full h-full border border-dashed border-amber-400/40 rounded-lg flex flex-col items-center justify-center bg-indigo-950/60" }, [
        h("div", { className: "text-amber-400 font-serif font-black text-xl sm:text-2xl tracking-widest animate-pulse" }, "♠"),
        h("span", { className: "text-[8px] sm:text-[9px] font-mono text-amber-300 font-semibold uppercase tracking-wider mt-0.5" }, "ROYAL")
      ])
    ])
  } else {
    match (card) {
      Card(rank, value, isAce, suit) => {
        let meta = getSuitMeta(suit)
        match (meta) {
          SuitMeta(symbol, color, name) => {
            let isRed = (color == "#ef4444")
            let textCls = isRed ? "text-rose-600" : "text-slate-900"
            let rankCls = concat("font-black font-mono text-xs sm:text-sm md:text-base leading-none tracking-tight ", textCls)
            let smallSymbolCls = concat("text-[10px] sm:text-xs leading-none ", textCls)

            h("div", {
              className: "w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-34 bg-white border border-slate-200/90 rounded-xl shadow-lg flex flex-col justify-between p-1.5 sm:p-2 relative transform hover:-translate-y-1 transition duration-200 select-none overflow-hidden"
            }, [
              // Top-left Rank & Suit
              h("div", { className: "flex flex-col items-start leading-none space-y-0.5" }, [
                h("span", { className: rankCls }, rank),
                h("span", { className: smallSymbolCls }, symbol)
              ]),
              // Bottom-right Inverted Rank & Suit
              h("div", { className: "flex flex-col items-end leading-none rotate-180 space-y-0.5" }, [
                h("span", { className: rankCls }, rank),
                h("span", { className: smallSymbolCls }, symbol)
              ])
            ])
          }
        }
      }
    }
  }
}

function renderScoreBadge(score: HandScore, label: string) {
  match (score) {
    HandScore(total, isSoft, isBust, isBj) => {
      let mut badgeText = to_string(total)
      let mut badgeCls = "bg-slate-800 text-slate-200 border-slate-700"

      if (isBj) {
        badgeText = "21 (Blackjack!)"
        badgeCls = "bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse"
      } else if (isBust) {
        badgeText = concat(to_string(total), " (Bust!)")
        badgeCls = "bg-rose-500/20 text-rose-300 border-rose-500/50"
      } else if (isSoft) {
        badgeText = concat(to_string(total), " (Soft)")
        badgeCls = "bg-indigo-500/20 text-indigo-300 border-indigo-500/50"
      }

      h("div", { className: "flex items-center space-x-1.5 sm:space-x-2" }, [
        h("span", { className: "text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400" }, label),
        h("span", { className: concat("px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-mono font-bold border ", badgeCls) }, badgeText)
      ])
    }
  }
}

function getStrategyAdvice(playerScore: HandScore, dealerUpCard: Card): string {
  match (playerScore) {
    HandScore(pTot, isSoft, isBust, isBj) => {
      if (isBust) {
        "Bust"
      } else if (isBj) {
        "Natural 21 • Stand"
      } else {
        match (dealerUpCard) {
          Card(dRank, dVal, dAce, dSuit) => {
            if (pTot >= 17) {
              "Strategy: Stand (Strong Total)"
            } else if (pTot <= 11) {
              if (pTot == 11 && state.playerHand.length == 2 && state.bankroll >= state.currentBet) {
                "Strategy: Double Down (Optimal)"
              } else {
                "Strategy: Hit (Low Total)"
              }
            } else if (pTot >= 12 && pTot <= 16) {
              if (dVal >= 7) {
                "Strategy: Hit (Dealer card is high)"
              } else {
                "Strategy: Stand (Dealer risk of bust)"
              }
            } else {
              "Strategy: Hit"
            }
          }
        }
      }
    }
  }
}

function renderGame() {
  let isBetting = (state.phase == Betting)
  let isPlaying = (state.phase == PlayerTurn)
  let isOver = (state.phase == RoundOver)

  // Dealer Card List
  let dealerCards = []
  for (let mut i = 0; i < state.dealerHand.length; i = i + 1) {
    let hideCard = (i == 1 && isPlaying)
    dealerCards.push(renderCard(state.dealerHand[i], hideCard))
  }

  // Player Card List
  let playerCards = []
  for (let mut i = 0; i < state.playerHand.length; i = i + 1) {
    playerCards.push(renderCard(state.playerHand[i], false))
  }

  let pScore = calculateScore(state.playerHand)
  let dScore = calculateScore(state.dealerHand)

  let winRate = state.rounds > 0 ? Math.floor((state.wins / state.rounds) * 100) : 0

  let vnode = h("div", { className: "w-full max-w-4xl mx-auto p-1 sm:p-4 md:p-6 font-sans text-slate-100 space-y-4 sm:space-y-6" }, [
    // Top Casino Header Bar
    h("div", { className: "flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-800/40" }, [
      h("div", { className: "flex items-center space-x-2.5 sm:space-x-3" }, [
        h("div", { className: "w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-lg sm:text-xl shadow-lg shadow-amber-500/20" }, "♠"),
        h("div", {}, [
          h("h1", { className: "text-sm sm:text-lg md:text-xl font-bold text-amber-300 tracking-wide font-serif" }, "ROYAL BLACKJACK CASINO"),
          h("p", { className: "text-[10px] sm:text-xs text-emerald-400/80 font-mono" }, "TypeLang Functional GADT Engine • Virtual DOM")
        ])
      ]),

      // Bankroll & Chip Pill
      h("div", { className: "flex items-center space-x-2 sm:space-x-3" }, [
        h("div", { className: "px-3 sm:px-4 py-1 sm:py-1.5 bg-slate-900/90 border border-amber-500/40 rounded-xl sm:rounded-2xl flex items-center space-x-1.5 sm:space-x-2 shadow-lg" }, [
          h("span", { className: "text-[10px] sm:text-[11px] uppercase tracking-wider text-amber-400/80 font-semibold" }, "Bankroll:"),
          h("span", { className: "text-sm sm:text-base font-bold font-mono text-emerald-400" }, concat("$", to_string(state.bankroll)))
        ]),
        h("button", {
          className: "px-2.5 sm:px-3 py-1 sm:py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition cursor-pointer border border-slate-700 shadow-sm",
          onClick: fn() { dispatch(ResetBankrollAction) }
        }, "Reset")
      ])
    ]),

    // Main Blackjack Felt Table
    h("div", { className: "relative bg-gradient-to-b from-emerald-950 via-green-950 to-slate-950 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 border-2 sm:border-4 border-amber-900/40 shadow-2xl overflow-hidden" }, [
      // Table Watermark & Trim
      h("div", { className: "absolute inset-0 border border-emerald-500/10 rounded-2xl pointer-events-none" }, ""),
      h("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-900/15 font-serif font-black text-3xl sm:text-6xl md:text-8xl select-none pointer-events-none tracking-widest uppercase text-center" }, "BLACKJACK"),

      // DEALER SECTION
      h("div", { className: "space-y-2 sm:space-y-3 mb-4 sm:mb-6 relative z-10" }, [
        h("div", { className: "flex items-center justify-between" }, [
          renderScoreBadge(isPlaying ? HandScore(state.dealerHand.length > 0 ? state.dealerHand[0].value : 0, false, false, false) : dScore, "Dealer Hand"),
          h("span", { className: "text-[10px] sm:text-xs font-mono text-emerald-400/60" }, "Dealer stands on soft 17")
        ]),
        h("div", { className: "flex flex-wrap gap-2 sm:gap-3 min-h-[95px] sm:min-h-[115px] items-center p-2.5 sm:p-3 bg-emerald-900/20 rounded-xl sm:rounded-2xl border border-emerald-800/30" }, 
          dealerCards.length > 0 ? dealerCards : [
            h("span", { className: "text-xs italic text-emerald-400/50 py-4 px-2" }, "Waiting for deal...")
          ]
        )
      ]),

      // CENTER TABLE BANNER & MESSAGE
      h("div", { className: "my-3 sm:my-5 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/85 border border-amber-500/30 backdrop-blur text-center space-y-1 shadow-xl relative z-10" }, [
        h("p", { className: "text-xs sm:text-sm md:text-base font-bold text-amber-300" }, state.message),
        isPlaying && state.dealerHand.length > 0 ? (
          h("p", { className: "text-[11px] sm:text-xs font-mono text-sky-400" }, getStrategyAdvice(pScore, state.dealerHand[0]))
        ) : h("div", {}, "")
      ]),

      // PLAYER SECTION
      h("div", { className: "space-y-2 sm:space-y-3 relative z-10" }, [
        h("div", { className: "flex items-center justify-between" }, [
          renderScoreBadge(pScore, "Player Hand"),
          h("div", { className: "flex items-center space-x-1.5 text-[11px] sm:text-xs font-mono" }, [
            h("span", { className: "text-amber-400/80" }, "Active Bet:"),
            h("span", { className: "font-bold text-amber-300 px-2 py-0.5 bg-amber-500/10 rounded-lg border border-amber-500/20" }, concat("$", to_string(state.currentBet)))
          ])
        ]),
        h("div", { className: "flex flex-wrap gap-2 sm:gap-3 min-h-[95px] sm:min-h-[115px] items-center p-2.5 sm:p-3 bg-emerald-900/20 rounded-xl sm:rounded-2xl border border-emerald-800/30" }, 
          playerCards.length > 0 ? playerCards : [
            h("span", { className: "text-xs italic text-emerald-400/50 py-4 px-2" }, "Place bet and click DEAL to start round.")
          ]
        )
      ])
    ]),

    // ACTION CONTROLS PANEL
    h("div", { className: "p-3.5 sm:p-5 bg-slate-900/90 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-3 sm:space-y-4 shadow-xl" }, [
      isBetting ? (
        // BETTING PHASE CONTROLS
        h("div", { className: "space-y-3" }, [
          h("div", { className: "flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs font-semibold text-slate-400" }, [
            h("span", {}, "SELECT CHIP VALUE TO ADJUST BET:"),
            h("span", { className: "font-mono text-amber-400" }, concat("Current Bet: $", to_string(state.currentBet)))
          ]),
          h("div", { className: "grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2" }, [
            h("button", {
              className: "h-9 sm:h-11 rounded-lg sm:rounded-xl font-bold text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/40 transition cursor-pointer active:scale-95",
              onClick: fn() { dispatch(BetAction(10)) }
            }, "+ $10"),
            h("button", {
              className: "h-9 sm:h-11 rounded-lg sm:rounded-xl font-bold text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/40 transition cursor-pointer active:scale-95",
              onClick: fn() { dispatch(BetAction(25)) }
            }, "+ $25"),
            h("button", {
              className: "h-9 sm:h-11 rounded-lg sm:rounded-xl font-bold text-xs bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/40 transition cursor-pointer active:scale-95",
              onClick: fn() { dispatch(BetAction(50)) }
            }, "+ $50"),
            h("button", {
              className: "h-9 sm:h-11 rounded-lg sm:rounded-xl font-bold text-xs bg-amber-600/20 text-amber-400 border border-amber-500/30 hover:bg-amber-600/40 transition cursor-pointer active:scale-95",
              onClick: fn() { dispatch(BetAction(100)) }
            }, "+ $100"),
            h("button", {
              className: "h-9 sm:h-11 rounded-lg sm:rounded-xl font-bold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer active:scale-95",
              onClick: fn() { dispatch(BetAction(0)) }
            }, "Min ($10)"),
            h("button", {
              className: "h-9 sm:h-11 rounded-lg sm:rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition cursor-pointer active:scale-95",
              onClick: fn() { dispatch(DealAction) }
            }, "♠ DEAL")
          ])
        ])
      ) : isPlaying ? (
        // PLAYING PHASE CONTROLS (HIT / STAND / DOUBLE)
        h("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3" }, [
          h("button", {
            className: "h-11 sm:h-14 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-600/30 transition cursor-pointer active:scale-95 flex items-center justify-center space-x-1.5 sm:space-x-2",
            onClick: fn() { dispatch(HitAction) }
          }, [
            h("span", { className: "text-base sm:text-lg" }, "+"),
            h("span", {}, "HIT (Draw Card)")
          ]),
          h("button", {
            className: "h-11 sm:h-14 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/30 transition cursor-pointer active:scale-95 flex items-center justify-center space-x-1.5 sm:space-x-2",
            onClick: fn() { dispatch(StandAction) }
          }, [
            h("span", { className: "text-base sm:text-lg" }, "✋"),
            h("span", {}, "STAND (Hold Hand)")
          ]),
          h("button", {
            className: concat("h-11 sm:h-14 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm border transition cursor-pointer active:scale-95 flex items-center justify-center space-x-1.5 sm:space-x-2 ",
              state.playerHand.length == 2 && state.bankroll >= state.currentBet
                ? "bg-amber-600/20 text-amber-300 border-amber-500/40 hover:bg-amber-600/30 shadow-lg shadow-amber-600/20"
                : "bg-slate-800/40 text-slate-500 border-slate-800 cursor-not-allowed opacity-60"),
            onClick: fn() { dispatch(DoubleDownAction) }
          }, [
            h("span", { className: "text-base sm:text-lg" }, "⚡"),
            h("span", {}, "DOUBLE DOWN (2x)")
          ])
        ])
      ) : (
        // ROUND OVER PHASE CONTROLS
        h("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-3" }, [
          h("div", { className: "text-xs font-mono text-slate-300 text-center sm:text-left" }, "Round resolved. Ready for next hand?"),
          h("button", {
            className: "w-full sm:w-auto px-8 py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/25 transition cursor-pointer active:scale-95 flex items-center justify-center space-x-1.5",
            onClick: fn() { dispatch(NextRoundAction) }
          }, [
            h("span", {}, "NEXT ROUND"),
            h("span", { className: "text-base font-black" }, "→")
          ])
        ])
      )
    ]),

    // GAME STATISTICS FOOTER
    h("div", { className: "grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 text-center" }, [
      h("div", { className: "p-2.5 sm:p-3 bg-slate-900/60 rounded-xl sm:rounded-2xl border border-slate-800" }, [
        h("div", { className: "text-[9px] sm:text-[10px] uppercase font-semibold text-slate-500" }, "Rounds"),
        h("div", { className: "text-base sm:text-lg font-bold font-mono text-slate-200 mt-0.5" }, to_string(state.rounds))
      ]),
      h("div", { className: "p-2.5 sm:p-3 bg-slate-900/60 rounded-xl sm:rounded-2xl border border-slate-800" }, [
        h("div", { className: "text-[9px] sm:text-[10px] uppercase font-semibold text-emerald-400/80" }, "Wins"),
        h("div", { className: "text-base sm:text-lg font-bold font-mono text-emerald-400 mt-0.5" }, to_string(state.wins))
      ]),
      h("div", { className: "p-2.5 sm:p-3 bg-slate-900/60 rounded-xl sm:rounded-2xl border border-slate-800" }, [
        h("div", { className: "text-[9px] sm:text-[10px] uppercase font-semibold text-rose-400/80" }, "Losses"),
        h("div", { className: "text-base sm:text-lg font-bold font-mono text-rose-400 mt-0.5" }, to_string(state.losses))
      ]),
      h("div", { className: "p-2.5 sm:p-3 bg-slate-900/60 rounded-xl sm:rounded-2xl border border-slate-800" }, [
        h("div", { className: "text-[9px] sm:text-[10px] uppercase font-semibold text-amber-400/80" }, "Blackjacks"),
        h("div", { className: "text-base sm:text-lg font-bold font-mono text-amber-400 mt-0.5" }, to_string(state.blackjacks))
      ]),
      h("div", { className: "p-2.5 sm:p-3 bg-slate-900/60 rounded-xl sm:rounded-2xl border border-slate-800 col-span-2 sm:col-span-1" }, [
        h("div", { className: "text-[9px] sm:text-[10px] uppercase font-semibold text-sky-400/80" }, "Win Rate"),
        h("div", { className: "text-base sm:text-lg font-bold font-mono text-sky-400 mt-0.5" }, concat(to_string(winRate), "%"))
      ])
    ])
  ])

  mount("app-root", vnode)
}

// Initial Virtual DOM Mount
renderGame()
println("Royal Blackjack Casino Engine Initialized Successfully!")
`
  };
