import { ExampleProgram } from "./types";

export const example42VideoPoker: ExampleProgram = {
  id: "video_poker_royal",
  name: "42. Royal Video Poker (Jacks or Better & Double-Up Gamble Engine)",
  title: "42. Royal Video Poker (Jacks or Better & Double-Up Gamble Engine)",
  category: "Games & Graphics",
  description: "Authentic Vegas Jacks or Better video poker machine built in TypeLang featuring pure GADT hand evaluation (Royal Flush, Straight Flush, 4-of-a-Kind, Full House, Flush, Straight, 3-of-a-Kind, Two Pair, Jacks or Better), dynamic 1-5 coin paytable highlighting, interactive card hold toggling, optimal AI Strategy Advisor auto-hold, Double-Up High-Low Gamble mini-game, coin denomination selector, credit counter animations, casino sound synthesis, and celebratory confetti.",
  code: `import DOM.{ h, mount, playTone, playRamp, playSequence, confetti }
import Math.{ floor, random, min, max, abs }

// ============================================================================
// 1. Types & GADT Domain Models
// ============================================================================

type Suit =
  | Hearts: Suit
  | Diamonds: Suit
  | Clubs: Suit
  | Spades: Suit

type GamePhase =
  | PhaseBetting: GamePhase
  | PhaseDealt: GamePhase
  | PhaseDrawOver: GamePhase
  | PhaseDoubleUp: GamePhase
  | PhaseDoubleResult: GamePhase

type HandRank =
  | RankRoyalFlush: HandRank
  | RankStraightFlush: HandRank
  | RankFourOfAKind: HandRank
  | RankFullHouse: HandRank
  | RankFlush: HandRank
  | RankStraight: HandRank
  | RankThreeOfAKind: HandRank
  | RankTwoPair: HandRank
  | RankJacksOrBetter: HandRank
  | RankNoWin: HandRank

type Card = {
  suit: Suit,
  rank: number,       // 2 .. 14 (11=J, 12=Q, 13=K, 14=A)
  mut isHeld: boolean,
  mut isFlipped: boolean
}

type DoubleCard = {
  suit: Suit,
  rank: number,
  mut isChosen: boolean,
  mut isRevealed: boolean
}

type PaytableRow = {
  rank: HandRank,
  name: string,
  baseMultiplier: number,
  maxBetMultiplier: number
}

// ============================================================================
// 2. Global State Engine & Helper Formatters
// ============================================================================

let mut credits = 1000.0
let mut betCoins = 1.0         // 1 to 5 coins
let mut coinDenom = 1.0        // $0.25, $0.50, $1.00, $5.00
let mut currentPhase = PhaseBetting
let mut lastWinCoins = 0.0
let mut lastWinRank = RankNoWin
let mut statusMessage = "PLACE YOUR BET AND CLICK DEAL"
let mut statusColor = "#38bdf8"
let mut hintText = ""
let mut soundEnabled = true
let mut showStatsModal = false

// Deck and active hands
let mut deck: Card[] = []
let mut hand: Card[] = []

// Double-Up Gamble state
let mut doubleStake = 0.0
let mut doubleDealerCard: Card = { suit: Hearts, rank: 2, isHeld: false, isFlipped: true }
let mut doubleChoices: DoubleCard[] = []
let mut doubleOutcomeText = ""

// Statistics
let mut statsHandsPlayed = 0.0
let mut statsHandsWon = 0.0
let mut statsRoyalFlushes = 0.0
let mut statsStraightFlushes = 0.0
let mut statsFourOfAKind = 0.0
let mut statsFullHouses = 0.0
let mut statsFlushes = 0.0
let mut statsStraights = 0.0
let mut statsThreeOfAKind = 0.0
let mut statsTwoPairs = 0.0
let mut statsJacksOrBetter = 0.0
let mut statsTotalPayout = 0.0
let mut statsHighestWin = 0.0

function numStr(n: number): string {
  to_string(n)
}

function formatMoney(amount: number): string {
  let dollars = Math.floor(amount)
  let cents = Math.floor((amount - dollars) * 100.0 + 0.5)
  let centsStr = if (cents < 10) { "0" + to_string(cents) } else { to_string(cents) }
  "$" + to_string(dollars) + "." + centsStr
}

function formatPercent(pct: number): string {
  let base = Math.floor(pct)
  let decimal = Math.floor((pct - base) * 10.0 + 0.5)
  to_string(base) + "." + to_string(decimal)
}

// ============================================================================
// 3. Audio & Sound FX Helpers
// ============================================================================

function playCardFlipSfx() {
  if (soundEnabled) {
    playTone(580.0, 0.04, "triangle", 0.06)
  }
}

function playHoldSfx(held: boolean) {
  if (soundEnabled) {
    if (held) {
      playRamp(350.0, 700.0, 0.06, "sine", 0.08)
    } else {
      playRamp(600.0, 300.0, 0.05, "sine", 0.06)
    }
  }
}

function playBetSfx() {
  if (soundEnabled) {
    playTone(880.0, 0.03, "sine", 0.05)
  }
}

function playWinFanfare(rank: HandRank) {
  if (soundEnabled) {
    match (rank) {
      RankRoyalFlush => {
        playSequence([523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98], 0.12, "sawtooth", 0.16)
        let _ = confetti(100.0, 80.0, 0.6)
      }
      RankStraightFlush => {
        playSequence([523.25, 659.25, 783.99, 1046.50, 1318.51], 0.10, "triangle", 0.15)
        let _ = confetti(80.0, 70.0, 0.6)
      }
      RankFourOfAKind => {
        playSequence([440.0, 554.37, 659.25, 880.0, 1108.73], 0.09, "triangle", 0.14)
        let _ = confetti(60.0, 60.0, 0.6)
      }
      RankFullHouse => {
        playSequence([392.0, 493.88, 587.33, 783.99], 0.08, "triangle", 0.12)
      }
      RankFlush => {
        playSequence([349.23, 440.0, 523.25, 698.46], 0.08, "sine", 0.12)
      }
      RankStraight => {
        playSequence([329.63, 392.0, 493.88, 659.25], 0.08, "sine", 0.12)
      }
      RankThreeOfAKind => {
        playSequence([293.66, 369.99, 440.0, 587.33], 0.08, "sine", 0.10)
      }
      RankTwoPair => {
        playSequence([329.63, 415.30, 493.88], 0.08, "sine", 0.10)
      }
      RankJacksOrBetter => {
        playSequence([349.23, 440.0, 523.25], 0.08, "sine", 0.09)
      }
      RankNoWin => {
        playRamp(300.0, 180.0, 0.15, "sawtooth", 0.08)
      }
    }
  }
}

function playGambleWinSfx() {
  if (soundEnabled) {
    playSequence([440.0, 554.37, 659.25, 880.0], 0.08, "triangle", 0.15)
  }
}

function playGambleLoseSfx() {
  if (soundEnabled) {
    playRamp(320.0, 140.0, 0.22, "sawtooth", 0.12)
  }
}

// ============================================================================
// 4. Card & Deck Pure Logic
// ============================================================================

function suitToString(s: Suit): string {
  match (s) {
    Hearts => "♥"
    Diamonds => "♦"
    Clubs => "♣"
    Spades => "♠"
  }
}

function suitColor(s: Suit): string {
  match (s) {
    Hearts => "#ef4444"
    Diamonds => "#38bdf8"
    Clubs => "#10b981"
    Spades => "#f8fafc"
  }
}

function suitName(s: Suit): string {
  match (s) {
    Hearts => "Hearts"
    Diamonds => "Diamonds"
    Clubs => "Clubs"
    Spades => "Spades"
  }
}

function rankToString(r: number): string {
  if (r == 14) "A"
  else if (r == 13) "K"
  else if (r == 12) "Q"
  else if (r == 11) "J"
  else if (r == 10) "10"
  else to_string(r)
}

function rankFullName(r: number): string {
  if (r == 14) "Ace"
  else if (r == 13) "King"
  else if (r == 12) "Queen"
  else if (r == 11) "Jack"
  else if (r == 10) "10"
  else to_string(r)
}

function createFreshDeck(): Card[] {
  let suits = [Hearts, Diamonds, Clubs, Spades]
  let mut d: Card[] = []
  for (let mut s = 0; s < 4; s = s + 1) {
    for (let mut r = 2; r <= 14; r = r + 1) {
      d.push({
        suit: suits[s],
        rank: r,
        isHeld: false,
        isFlipped: true
      })
    }
  }
  // Shuffle using Fisher-Yates
  for (let mut i = d.length - 1; i > 0; i = i - 1) {
    let j = Math.floor(Math.random() * (i + 1))
    let temp = d[i]
    d[i] = d[j]
    d[j] = temp
  }
  d
}

// ============================================================================
// 5. Jacks or Better Paytable Definition
// ============================================================================

let paytable: PaytableRow[] = [
  { rank: RankRoyalFlush, name: "ROYAL FLUSH", baseMultiplier: 250.0, maxBetMultiplier: 4000.0 },
  { rank: RankStraightFlush, name: "STRAIGHT FLUSH", baseMultiplier: 50.0, maxBetMultiplier: 250.0 },
  { rank: RankFourOfAKind, name: "4 OF A KIND", baseMultiplier: 25.0, maxBetMultiplier: 125.0 },
  { rank: RankFullHouse, name: "FULL HOUSE", baseMultiplier: 9.0, maxBetMultiplier: 45.0 },
  { rank: RankFlush, name: "FLUSH", baseMultiplier: 6.0, maxBetMultiplier: 30.0 },
  { rank: RankStraight, name: "STRAIGHT", baseMultiplier: 4.0, maxBetMultiplier: 20.0 },
  { rank: RankThreeOfAKind, name: "3 OF A KIND", baseMultiplier: 3.0, maxBetMultiplier: 15.0 },
  { rank: RankTwoPair, name: "TWO PAIR", baseMultiplier: 2.0, maxBetMultiplier: 10.0 },
  { rank: RankJacksOrBetter, name: "JACKS OR BETTER", baseMultiplier: 1.0, maxBetMultiplier: 5.0 }
]

function getPayoutForRank(rank: HandRank, coins: number): number {
  if (rank == RankNoWin) return 0.0
  for (let mut i = 0; i < paytable.length; i = i + 1) {
    let row = paytable[i]
    if (row.rank == rank) {
      if (coins == 5.0) {
        return row.maxBetMultiplier
      } else {
        return row.baseMultiplier * coins
      }
    }
  }
  0.0
}

function handRankName(rank: HandRank): string {
  match (rank) {
    RankRoyalFlush => "ROYAL FLUSH"
    RankStraightFlush => "STRAIGHT FLUSH"
    RankFourOfAKind => "4 OF A KIND"
    RankFullHouse => "FULL HOUSE"
    RankFlush => "FLUSH"
    RankStraight => "STRAIGHT"
    RankThreeOfAKind => "3 OF A KIND"
    RankTwoPair => "TWO PAIR"
    RankJacksOrBetter => "JACKS OR BETTER"
    RankNoWin => "NO WIN"
  }
}

// ============================================================================
// 6. Poker Hand Evaluator Algorithm
// ============================================================================

function evaluatePokerHand(cards: Card[]): HandRank {
  if (cards.length < 5) return RankNoWin

  // Sort ranks ascending
  let mut ranks = [cards[0].rank, cards[1].rank, cards[2].rank, cards[3].rank, cards[4].rank]
  for (let mut i = 0; i < 5; i = i + 1) {
    for (let mut j = 0; j < 4; j = j + 1) {
      if (ranks[j] > ranks[j + 1]) {
        let temp = ranks[j]
        ranks[j] = ranks[j + 1]
        ranks[j + 1] = temp
      }
    }
  }

  // Check flush (all suits identical)
  let s0 = cards[0].suit
  let isFlush = (cards[1].suit == s0 && cards[2].suit == s0 && cards[3].suit == s0 && cards[4].suit == s0)

  // Check straight
  let isStandardStraight = (
    ranks[1] == ranks[0] + 1 &&
    ranks[2] == ranks[1] + 1 &&
    ranks[3] == ranks[2] + 1 &&
    ranks[4] == ranks[3] + 1
  )
  // Ace-low wheel straight (A, 2, 3, 4, 5 => ranks: 2, 3, 4, 5, 14)
  let isWheelStraight = (
    ranks[0] == 2 && ranks[1] == 3 && ranks[2] == 4 && ranks[3] == 5 && ranks[4] == 14
  )
  let isStraight = isStandardStraight || isWheelStraight

  // Royal Flush check (10, J, Q, K, A of same suit)
  if (isFlush && isStandardStraight && ranks[0] == 10 && ranks[4] == 14) {
    return RankRoyalFlush
  }

  // Straight Flush check
  if (isFlush && isStraight) {
    return RankStraightFlush
  }

  // Rank frequency distribution (indices 0..14)
  let mut counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  for (let mut i = 0; i < 5; i = i + 1) {
    let r = ranks[i]
    counts[r] = counts[r] + 1
  }

  let mut fourCount = 0
  let mut threeCount = 0
  let mut pairCount = 0
  let mut jacksOrBetterPair = false

  for (let mut r = 2; r <= 14; r = r + 1) {
    let c = counts[r]
    if (c == 4) {
      fourCount = fourCount + 1
    } else if (c == 3) {
      threeCount = threeCount + 1
    } else if (c == 2) {
      pairCount = pairCount + 1
      if (r >= 11) {
        jacksOrBetterPair = true
      }
    }
  }

  if (fourCount == 1) {
    return RankFourOfAKind
  }
  if (threeCount == 1 && pairCount == 1) {
    return RankFullHouse
  }
  if (isFlush) {
    return RankFlush
  }
  if (isStraight) {
    return RankStraight
  }
  if (threeCount == 1) {
    return RankThreeOfAKind
  }
  if (pairCount == 2) {
    return RankTwoPair
  }
  if (pairCount == 1 && jacksOrBetterPair) {
    return RankJacksOrBetter
  }

  RankNoWin
}

// ============================================================================
// 7. Optimal AI Strategy Advisor (Auto-Hold Logic)
// ============================================================================

function computeOptimalHolds(cards: Card[]): boolean[] {
  let mut holds = [false, false, false, false, false]
  let curRank = evaluatePokerHand(cards)

  // 1. Pat hands to keep intact: Royal, Straight Flush, 4-Kind, Full House, Flush, Straight
  if (curRank == RankRoyalFlush || curRank == RankStraightFlush || curRank == RankFullHouse || curRank == RankFlush || curRank == RankStraight) {
    return [true, true, true, true, true]
  }

  // 2. Four of a kind: hold the 4 matching cards
  if (curRank == RankFourOfAKind) {
    let mut counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (let mut i = 0; i < 5; i = i + 1) {
      counts[cards[i].rank] = counts[cards[i].rank] + 1
    }
    let mut quadRank = 0
    for (let mut r = 2; r <= 14; r = r + 1) {
      if (counts[r] == 4) {
        quadRank = r
      }
    }
    for (let mut i = 0; i < 5; i = i + 1) {
      holds[i] = (cards[i].rank == quadRank)
    }
    return holds
  }

  // 3. Check 4 to a Royal Flush
  let suits = [Hearts, Diamonds, Clubs, Spades]
  for (let mut s = 0; s < 4; s = s + 1) {
    let suit = suits[s]
    let mut royalMatches = 0
    for (let mut i = 0; i < 5; i = i + 1) {
      if (cards[i].suit == suit && cards[i].rank >= 10) {
        royalMatches = royalMatches + 1
      }
    }
    if (royalMatches == 4) {
      for (let mut i = 0; i < 5; i = i + 1) {
        holds[i] = (cards[i].suit == suit && cards[i].rank >= 10)
      }
      return holds
    }
  }

  // 4. Three of a kind: hold the 3
  if (curRank == RankThreeOfAKind) {
    let mut counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (let mut i = 0; i < 5; i = i + 1) {
      counts[cards[i].rank] = counts[cards[i].rank] + 1
    }
    let mut tripRank = 0
    for (let mut r = 2; r <= 14; r = r + 1) {
      if (counts[r] == 3) {
        tripRank = r
      }
    }
    for (let mut i = 0; i < 5; i = i + 1) {
      holds[i] = (cards[i].rank == tripRank)
    }
    return holds
  }

  // 5. Two Pair: hold both pairs
  if (curRank == RankTwoPair) {
    let mut counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (let mut i = 0; i < 5; i = i + 1) {
      counts[cards[i].rank] = counts[cards[i].rank] + 1
    }
    for (let mut i = 0; i < 5; i = i + 1) {
      holds[i] = (counts[cards[i].rank] == 2)
    }
    return holds
  }

  // 6. High Pair (Jacks, Queens, Kings, Aces)
  if (curRank == RankJacksOrBetter) {
    let mut counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for (let mut i = 0; i < 5; i = i + 1) {
      counts[cards[i].rank] = counts[cards[i].rank] + 1
    }
    for (let mut i = 0; i < 5; i = i + 1) {
      holds[i] = (counts[cards[i].rank] == 2 && cards[i].rank >= 11)
    }
    return holds
  }

  // 7. Check 4 to a Flush
  for (let mut s = 0; s < 4; s = s + 1) {
    let suit = suits[s]
    let mut suitCount = 0
    for (let mut i = 0; i < 5; i = i + 1) {
      if (cards[i].suit == suit) {
        suitCount = suitCount + 1
      }
    }
    if (suitCount == 4) {
      for (let mut i = 0; i < 5; i = i + 1) {
        holds[i] = (cards[i].suit == suit)
      }
      return holds
    }
  }

  // 8. Low Pair (22..1010)
  let mut counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  for (let mut i = 0; i < 5; i = i + 1) {
    counts[cards[i].rank] = counts[cards[i].rank] + 1
  }
  for (let mut r = 2; r <= 10; r = r + 1) {
    if (counts[r] == 2) {
      for (let mut i = 0; i < 5; i = i + 1) {
        holds[i] = (cards[i].rank == r)
      }
      return holds
    }
  }

  // 9. Hold High Cards (J, Q, K, A)
  let mut highCardIndices: number[] = []
  for (let mut i = 0; i < 5; i = i + 1) {
    if (cards[i].rank >= 11) {
      highCardIndices.push(i)
    }
  }
  if (highCardIndices.length > 0) {
    for (let mut k = 0; k < highCardIndices.length; k = k + 1) {
      holds[highCardIndices[k]] = true
    }
    return holds
  }

  // 10. Otherwise, discard all
  [false, false, false, false, false]
}

// ============================================================================
// 8. Game State Transitions & Actions
// ============================================================================

function onDealClicked() {
  let totalCost = betCoins * coinDenom
  if (credits < totalCost) {
    statusMessage = "INSUFFICIENT CREDITS! PLEASE INSERT MORE FUNDS."
    statusColor = "#f43f5e"
    renderApp()
    return
  }

  credits = credits - totalCost
  deck = createFreshDeck()
  hand = []

  for (let mut i = 0; i < 5; i = i + 1) {
    let card = deck[i]
    card.isHeld = false
    card.isFlipped = true
    hand.push(card)
  }

  currentPhase = PhaseDealt
  lastWinCoins = 0.0
  lastWinRank = RankNoWin
  hintText = ""
  statusMessage = "CHOOSE CARDS TO HOLD, THEN CLICK DRAW"
  statusColor = "#fbbf24"
  playCardFlipSfx()
  renderApp()
}

function onDrawClicked() {
  if (currentPhase != PhaseDealt) { return }

  // Replace unheld cards with new cards from deck
  let mut drawIdx = 5
  for (let mut i = 0; i < 5; i = i + 1) {
    if (!hand[i].isHeld) {
      let newCard = deck[drawIdx]
      newCard.isHeld = false
      newCard.isFlipped = true
      hand[i] = newCard
      drawIdx = drawIdx + 1
    }
  }

  let finalRank = evaluatePokerHand(hand)
  let payoutMultiplier = getPayoutForRank(finalRank, betCoins)
  let winAmount = payoutMultiplier * coinDenom
  lastWinCoins = payoutMultiplier
  lastWinRank = finalRank

  statsHandsPlayed = statsHandsPlayed + 1.0

  if (payoutMultiplier > 0.0) {
    credits = credits + winAmount
    statsHandsWon = statsHandsWon + 1.0
    statsTotalPayout = statsTotalPayout + winAmount
    if (winAmount > statsHighestWin) {
      statsHighestWin = winAmount
    }

    match (finalRank) {
      RankRoyalFlush => { statsRoyalFlushes = statsRoyalFlushes + 1.0 }
      RankStraightFlush => { statsStraightFlushes = statsStraightFlushes + 1.0 }
      RankFourOfAKind => { statsFourOfAKind = statsFourOfAKind + 1.0 }
      RankFullHouse => { statsFullHouses = statsFullHouses + 1.0 }
      RankFlush => { statsFlushes = statsFlushes + 1.0 }
      RankStraight => { statsStraights = statsStraights + 1.0 }
      RankThreeOfAKind => { statsThreeOfAKind = statsThreeOfAKind + 1.0 }
      RankTwoPair => { statsTwoPairs = statsTwoPairs + 1.0 }
      RankJacksOrBetter => { statsJacksOrBetter = statsJacksOrBetter + 1.0 }
      RankNoWin => { () }
    }

    statusMessage = "WINNER! " + handRankName(finalRank) + " PAYS " + formatMoney(winAmount)
    statusColor = "#4ade80"
    playWinFanfare(finalRank)
  } else {
    statusMessage = "GAME OVER — NO WINNING HAND. PRESS DEAL TO PLAY"
    statusColor = "#94a3b8"
    playWinFanfare(RankNoWin)
  }

  currentPhase = PhaseDrawOver
  renderApp()
}

function onToggleHold(idx: number) {
  if (currentPhase != PhaseDealt) { return }
  if (idx >= 0 && idx < hand.length) {
    hand[idx].isHeld = !hand[idx].isHeld
    playHoldSfx(hand[idx].isHeld)
    renderApp()
  }
}

function onAutoHoldAdvice() {
  if (currentPhase != PhaseDealt) { return }
  let recommended = computeOptimalHolds(hand)
  let mut heldNames: string[] = []
  for (let mut i = 0; i < 5; i = i + 1) {
    hand[i].isHeld = recommended[i]
    if (recommended[i]) {
      heldNames.push(rankToString(hand[i].rank) + suitToString(hand[i].suit))
    }
  }
  if (heldNames.length > 0) {
    hintText = "AI Advice: Held " + heldNames.join(" ")
  } else {
    hintText = "AI Advice: Discarded all cards to draw 5 fresh cards"
  }
  playHoldSfx(true)
  renderApp()
}

function onBetOne() {
  if (currentPhase != PhaseBetting && currentPhase != PhaseDrawOver) { return }
  if (betCoins >= 5.0) {
    betCoins = 1.0
  } else {
    betCoins = betCoins + 1.0
  }
  playBetSfx()
  renderApp()
}

function onBetMax() {
  if (currentPhase != PhaseBetting && currentPhase != PhaseDrawOver) { return }
  betCoins = 5.0
  playBetSfx()
  onDealClicked()
}

function onSelectDenom(denom: number) {
  if (currentPhase != PhaseBetting && currentPhase != PhaseDrawOver) { return }
  coinDenom = denom
  playBetSfx()
  renderApp()
}

function onAddCredits(amount: number) {
  credits = credits + amount
  playBetSfx()
  renderApp()
}

// ============================================================================
// 9. Double-Up High-Low Gamble Mini-Game
// ============================================================================

function onStartDoubleUp() {
  if (currentPhase != PhaseDrawOver || lastWinCoins <= 0.0) { return }
  doubleStake = lastWinCoins * coinDenom
  // Deduct previous win from credits temporarily to stake it
  credits = credits - doubleStake

  let freshDeck = createFreshDeck()
  doubleDealerCard = freshDeck[0]
  doubleDealerCard.isFlipped = true

  doubleChoices = []
  for (let mut i = 1; i <= 4; i = i + 1) {
    let c = freshDeck[i]
    doubleChoices.push({
      suit: c.suit,
      rank: c.rank,
      isChosen: false,
      isRevealed: false
    })
  }

  currentPhase = PhaseDoubleUp
  doubleOutcomeText = "BEAT DEALER'S " + rankFullName(doubleDealerCard.rank) + " TO DOUBLE " + formatMoney(doubleStake) + "!"
  statusMessage = "DOUBLE OR NOTHING: PICK ONE OF THE FOUR CARDS"
  statusColor = "#f59e0b"
  playCardFlipSfx()
  renderApp()
}

function onPickDoubleCard(idx: number) {
  if (currentPhase != PhaseDoubleUp) { return }
  if (idx < 0 || idx >= doubleChoices.length) { return }

  let choice = doubleChoices[idx]
  choice.isChosen = true
  choice.isRevealed = true

  // Reveal all remaining choices
  for (let mut i = 0; i < doubleChoices.length; i = i + 1) {
    doubleChoices[i].isRevealed = true
  }

  if (choice.rank > doubleDealerCard.rank) {
    // Player Won: Stake is doubled!
    doubleStake = doubleStake * 2.0
    doubleOutcomeText = "YOU WON! " + rankToString(choice.rank) + " BEATS " + rankToString(doubleDealerCard.rank) + "! WIN: " + formatMoney(doubleStake)
    statusMessage = "CONGRATULATIONS! DOUBLE UP SUCCESSFUL! " + formatMoney(doubleStake)
    statusColor = "#4ade80"
    currentPhase = PhaseDoubleResult
    playGambleWinSfx()
  } else if (choice.rank == doubleDealerCard.rank) {
    // Push / Tie: Stake remains unchanged
    doubleOutcomeText = "PUSH / TIE! BOTH " + rankToString(choice.rank) + ". REPLAY OR COLLECT " + formatMoney(doubleStake)
    statusMessage = "TIE CARD! REPLAY DOUBLE UP OR COLLECT"
    statusColor = "#38bdf8"
    currentPhase = PhaseDoubleResult
    playCardFlipSfx()
  } else {
    // Dealer Won: Stake is lost
    doubleOutcomeText = "DEALER WINS: " + rankToString(doubleDealerCard.rank) + " BEATS " + rankToString(choice.rank) + ". BETTER LUCK NEXT TIME!"
    statusMessage = "BUST! YOU LOST THE GAMBLE."
    statusColor = "#ef4444"
    doubleStake = 0.0
    currentPhase = PhaseBetting
    playGambleLoseSfx()
  }

  renderApp()
}

function onCollectDoubleWin() {
  if (doubleStake > 0.0) {
    credits = credits + doubleStake
    statusMessage = "COLLECTED " + formatMoney(doubleStake) + "! PRESS DEAL TO PLAY NEXT HAND"
    statusColor = "#4ade80"
    doubleStake = 0.0
  }
  currentPhase = PhaseBetting
  playWinFanfare(RankJacksOrBetter)
  renderApp()
}

// ============================================================================
// 10. Virtual DOM UI Rendering
// ============================================================================

function renderPaytable() {
  let rows = []

  // Header Row
  rows.push(
    h("div", {
      className: "grid grid-cols-6 text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider py-1 px-2 bg-blue-950/80 text-amber-300 border-b border-amber-500/30",
      id: "paytable-header"
    }, [
      h("div", { className: "text-left text-slate-200" }, "HAND RANK"),
      h("div", { className: "text-right " + (betCoins == 1.0 ? "text-amber-400 bg-amber-500/20 px-1 rounded" : "text-amber-300/70") }, "1 COIN"),
      h("div", { className: "text-right " + (betCoins == 2.0 ? "text-amber-400 bg-amber-500/20 px-1 rounded" : "text-amber-300/70") }, "2 COINS"),
      h("div", { className: "text-right " + (betCoins == 3.0 ? "text-amber-400 bg-amber-500/20 px-1 rounded" : "text-amber-300/70") }, "3 COINS"),
      h("div", { className: "text-right " + (betCoins == 4.0 ? "text-amber-400 bg-amber-500/20 px-1 rounded" : "text-amber-300/70") }, "4 COINS"),
      h("div", { className: "text-right " + (betCoins == 5.0 ? "text-amber-300 font-extrabold bg-amber-500/30 px-1 rounded shadow-inner" : "text-amber-400") }, "5 COINS MAX")
    ])
  )

  for (let mut i = 0; i < paytable.length; i = i + 1) {
    let row = paytable[i]
    let isWinningRow = (lastWinRank == row.rank && (currentPhase == PhaseDrawOver || currentPhase == PhaseDoubleUp || currentPhase == PhaseDoubleResult))
    let rowBg = isWinningRow
      ? "bg-gradient-to-r from-amber-500/40 via-yellow-500/30 to-amber-500/40 animate-pulse border-y border-amber-400"
      : (i % 2 == 0 ? "bg-slate-900/40" : "bg-slate-900/10")

    rows.push(
      h("div", {
        className: "grid grid-cols-6 text-[10px] md:text-xs font-mono py-0.5 px-2 transition-all " + rowBg,
        id: "paytable-row-" + to_string(i)
      }, [
        h("div", { className: "text-left font-semibold " + (isWinningRow ? "text-amber-200 font-black" : "text-slate-300") }, row.name),
        h("div", { className: "text-right font-mono " + (betCoins == 1.0 ? "text-amber-300 font-bold bg-amber-500/20 px-1 rounded" : "text-amber-200/80") }, to_string(row.baseMultiplier * 1.0)),
        h("div", { className: "text-right font-mono " + (betCoins == 2.0 ? "text-amber-300 font-bold bg-amber-500/20 px-1 rounded" : "text-amber-200/80") }, to_string(row.baseMultiplier * 2.0)),
        h("div", { className: "text-right font-mono " + (betCoins == 3.0 ? "text-amber-300 font-bold bg-amber-500/20 px-1 rounded" : "text-amber-200/80") }, to_string(row.baseMultiplier * 3.0)),
        h("div", { className: "text-right font-mono " + (betCoins == 4.0 ? "text-amber-300 font-bold bg-amber-500/20 px-1 rounded" : "text-amber-200/80") }, to_string(row.baseMultiplier * 4.0)),
        h("div", { className: "text-right font-mono " + (betCoins == 5.0 ? "text-amber-300 font-black bg-amber-500/30 px-1 rounded" : "text-amber-400 font-bold") }, to_string(row.maxBetMultiplier))
      ])
    )
  }

  h("div", {
    className: "w-full bg-slate-950/90 border border-amber-500/40 rounded-lg overflow-hidden shadow-2xl backdrop-blur",
    id: "paytable-container"
  }, rows)
}

function renderPlayingCard(card: Card, index: number) {
  let isSelectable = (currentPhase == PhaseDealt)
  let sSymbol = suitToString(card.suit)
  let sCol = suitColor(card.suit)
  let rStr = rankToString(card.rank)

  let heldBadge = card.isHeld
    ? h("div", {
        className: "absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-rose-600 border border-rose-300 text-white font-mono text-[10px] md:text-xs font-black uppercase rounded shadow-lg tracking-wider animate-bounce",
        id: "held-badge-" + to_string(index)
      }, "HELD")
    : h("div", { className: "h-3" }, "")

  let holdButton = isSelectable
    ? h("button", {
        className: "w-full mt-2 py-1 px-2 text-xs font-mono font-bold rounded uppercase transition-all " + (card.isHeld ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/40" : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600"),
        onClick: fn() { onToggleHold(index) },
        id: "hold-btn-" + to_string(index)
      }, card.isHeld ? "HELD" : "HOLD")
    : h("div", { className: "w-full mt-2 py-1 text-xs text-transparent select-none" }, "-")

  h("div", {
    className: "flex flex-col items-center flex-1 max-w-[120px] md:max-w-[140px]",
    id: "card-col-" + to_string(index)
  }, [
    heldBadge,
    h("div", {
      className: "relative w-full aspect-[2.5/3.5] rounded-xl p-2 md:p-3 flex flex-col justify-between transition-all duration-200 select-none cursor-pointer shadow-xl border-2 " + (card.isHeld ? "border-amber-400 ring-4 ring-amber-400/40 -translate-y-2 bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900" : "border-slate-700 hover:border-slate-500 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 hover:-translate-y-1"),
      onClick: fn() { onToggleHold(index) },
      id: "card-surface-" + to_string(index)
    }, [
      // Top Rank & Suit
      h("div", { className: "flex flex-col items-start leading-none" }, [
        h("span", { className: "font-mono font-black text-lg md:text-2xl", style: "color: " + sCol }, rStr),
        h("span", { className: "text-sm md:text-base leading-none", style: "color: " + sCol }, sSymbol)
      ]),
      // Center Big Emblem
      h("div", {
        className: "self-center text-3xl md:text-5xl opacity-90 drop-shadow-md select-none transform transition-transform hover:scale-110",
        style: "color: " + sCol
      }, sSymbol),
      // Bottom Inverted Rank & Suit
      h("div", { className: "flex flex-col items-end leading-none rotate-180" }, [
        h("span", { className: "font-mono font-black text-lg md:text-2xl", style: "color: " + sCol }, rStr),
        h("span", { className: "text-sm md:text-base leading-none", style: "color: " + sCol }, sSymbol)
      ])
    ]),
    holdButton
  ])
}

function renderDoubleUpCard(choice: DoubleCard, index: number) {
  if (!choice.isRevealed) {
    return h("div", {
      className: "flex flex-col items-center flex-1 max-w-[110px] md:max-w-[130px] cursor-pointer group",
      onClick: fn() { onPickDoubleCard(index) },
      id: "double-choice-" + to_string(index)
    }, [
      h("div", {
        className: "w-full aspect-[2.5/3.5] rounded-xl p-2 bg-gradient-to-br from-blue-900 via-indigo-950 to-blue-950 border-2 border-amber-500/60 shadow-xl group-hover:border-amber-300 group-hover:scale-105 group-hover:shadow-amber-500/30 transition-all flex flex-col items-center justify-center relative overflow-hidden"
      }, [
        h("div", { className: "absolute inset-2 border border-amber-500/30 rounded-lg flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 to-transparent" }, [
          h("span", { className: "text-2xl md:text-3xl font-black text-amber-400 group-hover:scale-125 transition-transform" }, "?")
        ])
      ]),
      h("button", {
        className: "w-full mt-2 py-1 px-2 text-xs font-mono font-bold rounded uppercase bg-amber-500 group-hover:bg-amber-400 text-slate-950 shadow transition-all",
        onClick: fn() { onPickDoubleCard(index) }
      }, "PICK #" + to_string(index + 1))
    ])
  }

  let sSymbol = suitToString(choice.suit)
  let sCol = suitColor(choice.suit)
  let rStr = rankToString(choice.rank)
  let isWon = choice.isChosen && (choice.rank > doubleDealerCard.rank)
  let isLost = choice.isChosen && (choice.rank < doubleDealerCard.rank)
  let isTie = choice.isChosen && (choice.rank == doubleDealerCard.rank)

  let borderStyle = choice.isChosen
    ? (isWon ? "border-emerald-400 ring-4 ring-emerald-500/40 bg-slate-900" : isLost ? "border-rose-500 ring-4 ring-rose-500/40 bg-slate-900" : "border-amber-400 ring-4 ring-amber-500/40 bg-slate-900")
    : "border-slate-700 bg-slate-950 opacity-60"

  h("div", {
    className: "flex flex-col items-center flex-1 max-w-[110px] md:max-w-[130px]",
    id: "double-revealed-" + to_string(index)
  }, [
    h("div", {
      className: "w-full aspect-[2.5/3.5] rounded-xl p-2 md:p-3 flex flex-col justify-between select-none shadow-xl border-2 transition-all " + borderStyle
    }, [
      h("div", { className: "flex flex-col items-start leading-none" }, [
        h("span", { className: "font-mono font-black text-base md:text-xl", style: "color: " + sCol }, rStr),
        h("span", { className: "text-xs md:text-sm", style: "color: " + sCol }, sSymbol)
      ]),
      h("div", { className: "self-center text-2xl md:text-4xl", style: "color: " + sCol }, sSymbol),
      h("div", { className: "flex flex-col items-end leading-none rotate-180" }, [
        h("span", { className: "font-mono font-black text-base md:text-xl", style: "color: " + sCol }, rStr),
        h("span", { className: "text-xs md:text-sm", style: "color: " + sCol }, sSymbol)
      ])
    ]),
    h("div", {
      className: "w-full mt-2 py-1 text-center font-mono font-bold text-xs " + (choice.isChosen ? (isWon ? "text-emerald-400" : isLost ? "text-rose-400" : "text-amber-400") : "text-slate-500")
    }, choice.isChosen ? (isWon ? "WON!" : isLost ? "LOST" : "TIE") : "OTHER")
  ])
}

function renderDoubleUpArena() {
  let sSymbol = suitToString(doubleDealerCard.suit)
  let sCol = suitColor(doubleDealerCard.suit)
  let rStr = rankToString(doubleDealerCard.rank)

  h("div", {
    className: "w-full flex flex-col items-center gap-4 py-4 bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 shadow-2xl backdrop-blur",
    id: "double-up-arena"
  }, [
    h("div", { className: "text-center" }, [
      h("h3", { className: "text-sm md:text-base font-mono font-black tracking-widest text-amber-400 uppercase" }, "★ HIGH-LOW DOUBLE OR NOTHING ★"),
      h("p", { className: "text-xs text-slate-300 font-mono mt-1" }, doubleOutcomeText)
    ]),
    h("div", { className: "flex flex-wrap items-center justify-center gap-3 md:gap-6 w-full max-w-2xl" }, [
      // Dealer Face-Up Card
      h("div", { className: "flex flex-col items-center" }, [
        h("span", { className: "text-[10px] md:text-xs font-mono font-bold text-rose-400 mb-1 tracking-wider" }, "DEALER'S CARD"),
        h("div", {
          className: "w-[90px] md:w-[120px] aspect-[2.5/3.5] rounded-xl p-2 md:p-3 flex flex-col justify-between bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-rose-400 shadow-xl shadow-rose-950/40"
        }, [
          h("div", { className: "flex flex-col items-start leading-none" }, [
            h("span", { className: "font-mono font-black text-base md:text-xl", style: "color: " + sCol }, rStr),
            h("span", { className: "text-xs md:text-sm", style: "color: " + sCol }, sSymbol)
          ]),
          h("div", { className: "self-center text-3xl md:text-4xl", style: "color: " + sCol }, sSymbol),
          h("div", { className: "flex flex-col items-end leading-none rotate-180" }, [
            h("span", { className: "font-mono font-black text-base md:text-xl", style: "color: " + sCol }, rStr),
            h("span", { className: "text-xs md:text-sm", style: "color: " + sCol }, sSymbol)
          ])
        ])
      ]),
      // Divider
      h("div", { className: "hidden md:flex text-slate-600 font-black text-xl" }, "VS"),
      // 4 Player Hidden/Revealed Cards
      h("div", { className: "flex gap-2 md:gap-3 flex-1 justify-center" }, [
        renderDoubleUpCard(doubleChoices[0], 0),
        renderDoubleUpCard(doubleChoices[1], 1),
        renderDoubleUpCard(doubleChoices[2], 2),
        renderDoubleUpCard(doubleChoices[3], 3)
      ])
    ]),
    // Action buttons in Double Up
    (currentPhase == PhaseDoubleResult && doubleStake > 0.0)
      ? h("div", { className: "flex gap-3 mt-2" }, [
          h("button", {
            className: "px-5 py-2 rounded-lg font-mono font-bold text-xs md:text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all",
            onClick: fn() { onCollectDoubleWin() },
            id: "collect-double-win-btn"
          }, "COLLECT " + formatMoney(doubleStake)),
          h("button", {
            className: "px-5 py-2 rounded-lg font-mono font-bold text-xs md:text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg transition-all",
            onClick: fn() { onStartDoubleUp() },
            id: "continue-double-up-btn"
          }, "DOUBLE UP AGAIN (" + formatMoney(doubleStake) + ")")
        ])
      : h("div", {}, "")
  ])
}

function renderHandArea() {
  if (currentPhase == PhaseDoubleUp || currentPhase == PhaseDoubleResult) {
    return renderDoubleUpArena()
  }

  if (hand.length == 0) {
    // Initial empty state cards placeholder
    let placeholders = []
    for (let mut i = 0; i < 5; i = i + 1) {
      placeholders.push(
        h("div", {
          className: "flex-1 max-w-[120px] md:max-w-[140px] aspect-[2.5/3.5] rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/40 flex flex-col items-center justify-center p-2 shadow-inner",
          id: "card-placeholder-" + to_string(i)
        }, [
          h("span", { className: "text-2xl md:text-3xl text-slate-700 select-none" }, "♠"),
          h("span", { className: "text-[10px] font-mono text-slate-600 mt-2" }, "CARD " + to_string(i + 1))
        ])
      )
    }
    return h("div", { className: "flex gap-2 md:gap-4 justify-center w-full py-4", id: "hand-area" }, placeholders)
  }

  h("div", { className: "flex gap-2 md:gap-4 justify-center w-full py-2", id: "hand-area" }, [
    renderPlayingCard(hand[0], 0),
    renderPlayingCard(hand[1], 1),
    renderPlayingCard(hand[2], 2),
    renderPlayingCard(hand[3], 3),
    renderPlayingCard(hand[4], 4)
  ])
}

function renderControls() {
  let canDeal = (currentPhase == PhaseBetting || currentPhase == PhaseDrawOver)
  let canDraw = (currentPhase == PhaseDealt)
  let canDouble = (currentPhase == PhaseDrawOver && lastWinCoins > 0.0)

  h("div", {
    className: "w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 md:p-4 shadow-2xl flex flex-col gap-3 backdrop-blur",
    id: "controls-dashboard"
  }, [
    // Top Row: Denomination & Status LED Bar
    h("div", { className: "flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3" }, [
      // Coin Denominations
      h("div", { className: "flex items-center gap-1" }, [
        h("span", { className: "text-xs font-mono text-slate-400 mr-1" }, "DENOM:"),
        h("button", {
          className: "px-2 py-1 text-xs font-mono font-bold rounded transition-all " + (coinDenom == 0.25 ? "bg-amber-400 text-slate-950 shadow" : "bg-slate-800 text-slate-300 hover:bg-slate-700"),
          onClick: fn() { onSelectDenom(0.25) },
          id: "denom-25"
        }, "$0.25"),
        h("button", {
          className: "px-2 py-1 text-xs font-mono font-bold rounded transition-all " + (coinDenom == 0.50 ? "bg-amber-400 text-slate-950 shadow" : "bg-slate-800 text-slate-300 hover:bg-slate-700"),
          onClick: fn() { onSelectDenom(0.50) },
          id: "denom-50"
        }, "$0.50"),
        h("button", {
          className: "px-2 py-1 text-xs font-mono font-bold rounded transition-all " + (coinDenom == 1.00 ? "bg-amber-400 text-slate-950 shadow" : "bg-slate-800 text-slate-300 hover:bg-slate-700"),
          onClick: fn() { onSelectDenom(1.00) },
          id: "denom-100"
        }, "$1.00"),
        h("button", {
          className: "px-2 py-1 text-xs font-mono font-bold rounded transition-all " + (coinDenom == 5.00 ? "bg-amber-400 text-slate-950 shadow" : "bg-slate-800 text-slate-300 hover:bg-slate-700"),
          onClick: fn() { onSelectDenom(5.00) },
          id: "denom-500"
        }, "$5.00")
      ]),
      // Add Credits & Audio Toggle
      h("div", { className: "flex items-center gap-2" }, [
        h("button", {
          className: "px-2.5 py-1 text-xs font-mono font-semibold rounded bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 border border-emerald-500/40 transition-all",
          onClick: fn() { onAddCredits(100.0) },
          id: "add-credits-btn"
        }, "+$100 CREDITS"),
        h("button", {
          className: "px-2.5 py-1 text-xs font-mono font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all",
          onClick: fn() { soundEnabled = !soundEnabled; renderApp() },
          id: "audio-toggle-btn"
        }, soundEnabled ? "🔊 SOUND ON" : "🔇 MUTED"),
        h("button", {
          className: "px-2.5 py-1 text-xs font-mono font-semibold rounded bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40 transition-all",
          onClick: fn() { showStatsModal = true; renderApp() },
          id: "stats-modal-btn"
        }, "📊 STATS")
      ])
    ]),

    // Middle Row: Digital Meters (Credits, Bet, Win)
    h("div", { className: "grid grid-cols-3 gap-2 md:gap-4 text-center font-mono" }, [
      h("div", { className: "bg-slate-900 border border-slate-800 rounded-lg p-2 flex flex-col" }, [
        h("span", { className: "text-[10px] text-slate-400 tracking-wider" }, "CREDITS"),
        h("span", { className: "text-base md:text-xl font-black text-amber-300" }, formatMoney(credits))
      ]),
      h("div", { className: "bg-slate-900 border border-slate-800 rounded-lg p-2 flex flex-col" }, [
        h("span", { className: "text-[10px] text-slate-400 tracking-wider" }, "TOTAL BET"),
        h("span", { className: "text-base md:text-xl font-black text-sky-400" }, to_string(betCoins) + " COINS (" + formatMoney(betCoins * coinDenom) + ")")
      ]),
      h("div", { className: "bg-slate-900 border border-slate-800 rounded-lg p-2 flex flex-col" }, [
        h("span", { className: "text-[10px] text-slate-400 tracking-wider" }, "PAID / WIN"),
        h("span", { className: "text-base md:text-xl font-black text-emerald-400" }, formatMoney(lastWinCoins * coinDenom))
      ])
    ]),

    // Status Message & Hint Banner
    h("div", {
      className: "w-full py-1.5 px-3 rounded-lg text-center font-mono text-xs md:text-sm font-bold tracking-wide border transition-all bg-slate-900/80 border-slate-700",
      style: "color: " + statusColor,
      id: "status-banner"
    }, statusMessage),

    (hintText != "")
      ? h("div", { className: "text-center font-mono text-xs text-amber-300 font-semibold animate-pulse" }, hintText)
      : h("div", {}, ""),

    // Bottom Action Buttons
    h("div", { className: "flex flex-wrap items-center justify-between gap-2 pt-1" }, [
      // Bet Configuration Buttons
      h("div", { className: "flex gap-2" }, [
        h("button", {
          className: "px-3 md:px-4 py-2.5 rounded-lg font-mono font-bold text-xs md:text-sm uppercase tracking-wider transition-all " + (canDeal ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 shadow" : "bg-slate-900 text-slate-600 cursor-not-allowed"),
          onClick: fn() { onBetOne() },
          id: "bet-one-btn"
        }, "BET ONE (" + to_string(betCoins) + "/5)"),
        h("button", {
          className: "px-3 md:px-4 py-2.5 rounded-lg font-mono font-bold text-xs md:text-sm uppercase tracking-wider transition-all " + (canDeal ? "bg-amber-600 hover:bg-amber-500 text-slate-950 font-black shadow" : "bg-slate-900 text-slate-600 cursor-not-allowed"),
          onClick: fn() { onBetMax() },
          id: "bet-max-btn"
        }, "BET MAX (5)")
      ]),

      // AI Advice Button
      h("div", { className: "flex gap-2" }, [
        h("button", {
          className: "px-3 py-2.5 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all " + (canDraw ? "bg-indigo-700 hover:bg-indigo-600 text-indigo-100 shadow" : "bg-slate-900 text-slate-600 cursor-not-allowed"),
          onClick: fn() { onAutoHoldAdvice() },
          id: "ai-autohold-btn"
        }, "💡 AI AUTO-HOLD")
      ]),

      // Primary Action Trigger (Deal, Draw, Double-Up)
      h("div", { className: "flex gap-2" }, [
        canDouble
          ? h("button", {
              className: "px-4 md:px-6 py-2.5 rounded-lg font-mono font-black text-xs md:text-sm uppercase tracking-widest bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/30 transition-all transform hover:scale-105",
              onClick: fn() { onStartDoubleUp() },
              id: "double-up-btn"
            }, "🎰 DOUBLE UP (GAMBLE)")
          : h("div", {}, ""),
        canDraw
          ? h("button", {
              className: "px-6 md:px-8 py-2.5 rounded-lg font-mono font-black text-xs md:text-sm uppercase tracking-widest bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105",
              onClick: fn() { onDrawClicked() },
              id: "draw-btn"
            }, "DRAW CARDS")
          : h("button", {
              className: "px-6 md:px-8 py-2.5 rounded-lg font-mono font-black text-xs md:text-sm uppercase tracking-widest transition-all transform " + (canDeal ? "bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white shadow-lg shadow-blue-500/30 hover:scale-105" : "bg-slate-800 text-slate-600 cursor-not-allowed"),
              onClick: fn() { if (canDeal) onDealClicked() },
              id: "deal-btn"
            }, "DEAL")
      ])
    ])
  ])
}

function renderStatsModal() {
  if (!showStatsModal) return h("div", {}, "")

  let winRate = statsHandsPlayed > 0.0 ? formatPercent((statsHandsWon / statsHandsPlayed) * 100.0) : "0.0"

  h("div", {
    className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm",
    onClick: fn() { showStatsModal = false; renderApp() },
    id: "stats-modal-backdrop"
  }, [
    h("div", {
      className: "w-full max-w-lg bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 font-mono text-slate-200",
      onClick: fn(e: any) { if (e && e.stopPropagation) e.stopPropagation() },
      id: "stats-modal-card"
    }, [
      h("div", { className: "flex items-center justify-between border-b border-slate-800 pb-3" }, [
        h("h3", { className: "text-lg font-black text-amber-400 flex items-center gap-2" }, "📊 VIDEO POKER LIFETIME STATISTICS"),
        h("button", {
          className: "text-slate-400 hover:text-white text-xl font-bold px-2",
          onClick: fn() { showStatsModal = false; renderApp() }
        }, "✕")
      ]),
      h("div", { className: "grid grid-cols-2 gap-3 text-xs md:text-sm" }, [
        h("div", { className: "bg-slate-950 p-3 rounded-lg border border-slate-800" }, [
          h("div", { className: "text-slate-400" }, "Hands Played:"),
          h("div", { className: "text-lg font-bold text-white" }, to_string(statsHandsPlayed))
        ]),
        h("div", { className: "bg-slate-950 p-3 rounded-lg border border-slate-800" }, [
          h("div", { className: "text-slate-400" }, "Win Rate:"),
          h("div", { className: "text-lg font-bold text-emerald-400" }, winRate + "%")
        ]),
        h("div", { className: "bg-slate-950 p-3 rounded-lg border border-slate-800" }, [
          h("div", { className: "text-slate-400" }, "Total Payout:"),
          h("div", { className: "text-lg font-bold text-amber-300" }, formatMoney(statsTotalPayout))
        ]),
        h("div", { className: "bg-slate-950 p-3 rounded-lg border border-slate-800" }, [
          h("div", { className: "text-slate-400" }, "Biggest Win:"),
          h("div", { className: "text-lg font-bold text-sky-400" }, formatMoney(statsHighestWin))
        ])
      ]),
      h("div", { className: "flex flex-col gap-1 text-xs border-t border-slate-800 pt-3 max-h-48 overflow-y-auto" }, [
        h("div", { className: "flex justify-between py-0.5 text-amber-300 font-bold" }, [h("span", {}, "Royal Flushes:"), h("span", {}, to_string(statsRoyalFlushes))]),
        h("div", { className: "flex justify-between py-0.5" }, [h("span", {}, "Straight Flushes:"), h("span", {}, to_string(statsStraightFlushes))]),
        h("div", { className: "flex justify-between py-0.5" }, [h("span", {}, "Four of a Kind:"), h("span", {}, to_string(statsFourOfAKind))]),
        h("div", { className: "flex justify-between py-0.5" }, [h("span", {}, "Full Houses:"), h("span", {}, to_string(statsFullHouses))]),
        h("div", { className: "flex justify-between py-0.5" }, [h("span", {}, "Flushes:"), h("span", {}, to_string(statsFlushes))]),
        h("div", { className: "flex justify-between py-0.5" }, [h("span", {}, "Straights:"), h("span", {}, to_string(statsStraights))]),
        h("div", { className: "flex justify-between py-0.5" }, [h("span", {}, "Three of a Kind:"), h("span", {}, to_string(statsThreeOfAKind))]),
        h("div", { className: "flex justify-between py-0.5" }, [h("span", {}, "Two Pairs:"), h("span", {}, to_string(statsTwoPairs))]),
        h("div", { className: "flex justify-between py-0.5" }, [h("span", {}, "Jacks or Better:"), h("span", {}, to_string(statsJacksOrBetter))])
      ]),
      h("button", {
        className: "w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase transition-all shadow-lg",
        onClick: fn() { showStatsModal = false; renderApp() }
      }, "CLOSE")
    ])
  ])
}

function renderApp() {
  let vnode = h("div", {
    className: "min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-slate-100 p-2 md:p-6 flex flex-col items-center justify-center font-sans select-none",
    id: "video-poker-app"
  }, [
    h("div", {
      className: "w-full max-w-4xl flex flex-col gap-4 bg-slate-950/70 p-3 md:p-6 rounded-2xl border border-amber-500/30 shadow-[0_0_50px_rgba(30,58,138,0.3)] backdrop-blur",
      id: "casino-cabinet"
    }, [
      // Casino Header Marquee
      h("header", { className: "flex items-center justify-between border-b border-amber-500/30 pb-3", id: "casino-header" }, [
        h("div", { className: "flex items-center gap-2" }, [
          h("span", { className: "text-2xl md:text-3xl text-amber-400 animate-pulse" }, "♠"),
          h("div", { className: "flex flex-col" }, [
            h("h1", { className: "text-lg md:text-2xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 uppercase drop-shadow" }, "ROYAL VIDEO POKER"),
            h("span", { className: "text-[10px] md:text-xs font-mono text-slate-400 tracking-wider" }, "JACKS OR BETTER • 9/6 CASINO PAYTABLE")
          ])
        ]),
        h("div", { className: "flex items-center gap-2" }, [
          h("span", { className: "text-xs font-mono px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full font-semibold" }, "VEGAS 99.54% RTP")
        ])
      ]),

      // 1. Paytable Top Section
      renderPaytable(),

      // 2. Center Playing Area (Cards or Double-Up)
      renderHandArea(),

      // 3. Controls & Dashboard
      renderControls()
    ]),

    // Statistics Modal
    renderStatsModal()
  ])

  mount("app", vnode)
}

// ============================================================================
// 11. Initializer
// ============================================================================

renderApp()
`
};
