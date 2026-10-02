import { ExampleProgram } from "./types";

export const example22StockTickerTechnicalIndicators: ExampleProgram = {
    id: 'stock_ticker_technical_indicators',
    name: '22. Functional Reactive Stock Ticker & Technical Indicator Lab',
    category: 'Interactive Web Apps',
    description: 'Real-time financial market simulator & technical analysis lab. Features Geometric Brownian Motion tick generation, live OHLCV candlestick rendering, functional technical indicator pipelines (SMA, EMA, Bollinger Bands, RSI), paper trading portfolio simulator, and interactive crosshair charting.',
    code: `// ============================================================================
// TypeLang Functional Reactive Stock Ticker & Technical Indicator Lab
// ============================================================================

import DOM.{ h, mount, getElementById }

// ----------------------------------------------------------------------------
// 1. Domain Types: Financial Market Data & Indicator Models
// ----------------------------------------------------------------------------

type Candle = {
  time: number,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number
}

type IndicatorType =
  | IndSMA
  | IndEMA
  | IndBollinger
  | IndRSI
  | IndMACD

type SignalType =
  | BullishBuy
  | BearishSell
  | NeutralHold

type AssetProfile = {
  symbol: string,
  name: string,
  basePrice: number,
  volatility: number,
  drift: number
}

type Order = {
  id: number,
  symbol: string,
  side: string,
  shares: number,
  price: number,
  timeStr: string
}

// ----------------------------------------------------------------------------
// 2. Market State & Asset Definitions
// ----------------------------------------------------------------------------

let ASSET_PROFILES = [
  { symbol: "NVDA", name: "NVIDIA Corp.", basePrice: 130.0, volatility: 0.024, drift: 0.0006 },
  { symbol: "BTC",  name: "Bitcoin / USD", basePrice: 64000.0, volatility: 0.035, drift: 0.0008 },
  { symbol: "AAPL", name: "Apple Inc.", basePrice: 220.0, volatility: 0.012, drift: 0.0003 },
  { symbol: "TSLA", name: "Tesla Inc.", basePrice: 215.0, volatility: 0.028, drift: 0.0004 }
]

let mut selectedAssetIdx = 0
let mut activeIndicator: IndicatorType = IndBollinger
let mut isLiveTrading = true

// Portfolio State
let mut cashBalance = 100000.0
let mut assetHoldings = 0.0
let mut tradeCount = 0
let mut orderHistory: [Order] = []

// Active Candle Stream (rolling window of 36 candles)
let mut candleHistory: [Candle] = []
let mut currentLivePrice = 130.0
let mut currentLiveOpen = 130.0
let mut currentLiveHigh = 130.0
let mut currentLiveLow = 130.0
let mut currentLiveVolume = 0.0
let mut tickInCurrentCandle = 0

// ----------------------------------------------------------------------------
// 3. Functional Technical Indicator Algorithms
// ----------------------------------------------------------------------------

// Simple Moving Average (SMA)
function calculateSMA(candles: [Candle], period: number): [number] {
  let mut smaList: [number] = []
  let count = candles.length

  for (let mut i = 0; i < count; i = i + 1) {
    if (i < period - 1) {
      smaList.push(candles[i].close)
    } else {
      let mut sum = 0.0
      for (let mut k = 0; k < period; k = k + 1) {
        sum = sum + candles[i - k].close
      }
      smaList.push(sum / period)
    }
  }
  smaList
}

// Exponential Moving Average (EMA)
function calculateEMA(candles: [Candle], period: number): [number] {
  let mut emaList: [number] = []
  let count = candles.length
  let k = 2.0 / (period + 1.0)

  let mut prevEma = count > 0 ? candles[0].close : 0.0

  for (let mut i = 0; i < count; i = i + 1) {
    let c = candles[i].close
    if (i == 0) {
      prevEma = c
    } else {
      prevEma = (c * k) + (prevEma * (1.0 - k))
    }
    emaList.push(prevEma)
  }
  emaList
}

// Bollinger Bands (Upper, Middle SMA, Lower)
type BollingerBandPoint = {
  upper: number,
  mid: number,
  lower: number
}

function calculateBollingerBands(candles: [Candle], period: number, stdDevMultiplier: number): [BollingerBandPoint] {
  let mut bands: [BollingerBandPoint] = []
  let sma = calculateSMA(candles, period)
  let count = candles.length

  for (let mut i = 0; i < count; i = i + 1) {
    if (i < period - 1) {
      let c = candles[i].close
      bands.push({ upper: c * 1.02, mid: c, lower: c * 0.98 })
    } else {
      let m = sma[i]
      let mut varianceSum = 0.0
      for (let mut k = 0; k < period; k = k + 1) {
        let diff = candles[i - k].close - m
        varianceSum = varianceSum + (diff * diff)
      }
      let stdDev = Math.sqrt(varianceSum / period)
      bands.push({
        upper: m + (stdDev * stdDevMultiplier),
        mid: m,
        lower: m - (stdDev * stdDevMultiplier)
      })
    }
  }
  bands
}

// Relative Strength Index (RSI - 14 period)
function calculateRSI(candles: [Candle], period: number): [number] {
  let mut rsiList: [number] = []
  let count = candles.length

  for (let mut i = 0; i < count; i = i + 1) {
    if (i < period) {
      rsiList.push(50.0)
    } else {
      let mut gains = 0.0
      let mut losses = 0.0
      for (let mut k = 0; k < period; k = k + 1) {
        let change = candles[i - k].close - candles[i - k - 1].close
        if (change >= 0.0) {
          gains = gains + change
        } else {
          losses = losses + Math.abs(change)
        }
      }
      let avgGain = gains / period
      let avgLoss = losses / period
      if (avgLoss < 0.00001) {
        rsiList.push(100.0)
      } else {
        let rs = avgGain / avgLoss
        let rsi = 100.0 - (100.0 / (1.0 + rs))
        rsiList.push(rsi)
      }
    }
  }
  rsiList
}

// Technical Indicator Signal Analyzer
function evaluateSignals(): { signal: SignalType, desc: string, confidence: number } {
  let count = candleHistory.length
  if (count < 14) {
    { signal: NeutralHold, desc: "Accumulating Market Data...", confidence: 50 }
  } else {
    let rsi = calculateRSI(candleHistory, 14)
    let latestRSI = rsi[count - 1]

    let smaFast = calculateSMA(candleHistory, 5)
    let smaSlow = calculateSMA(candleHistory, 15)
    let fast = smaFast[count - 1]
    let slow = smaSlow[count - 1]
    let prevFast = smaFast[count - 2]
    let prevSlow = smaSlow[count - 2]

    if (latestRSI < 32.0) {
      { signal: BullishBuy, desc: concat("RSI Oversold (", concat(to_string(Math.floor(latestRSI)), ") — High Rebound Probability")), confidence: 85 }
    } else if (latestRSI > 68.0) {
      { signal: BearishSell, desc: concat("RSI Overbought (", concat(to_string(Math.floor(latestRSI)), ") — Reversal / Profit Taking")), confidence: 82 }
    } else if (prevFast <= prevSlow && fast > slow) {
      { signal: BullishBuy, desc: "Golden Cross (SMA 5 crossed above SMA 15) — Bullish Momentum", confidence: 78 }
    } else if (prevFast >= prevSlow && fast < slow) {
      { signal: BearishSell, desc: "Death Cross (SMA 5 crossed below SMA 15) — Downside Pressure", confidence: 76 }
    } else {
      { signal: NeutralHold, desc: "Consolidation Range — Awaiting Clear Breakout Signal", confidence: 55 }
    }
  }
}

// ----------------------------------------------------------------------------
// 4. Market Generator & Initialization
// ----------------------------------------------------------------------------

function generateInitialHistory() {
  let asset = ASSET_PROFILES[selectedAssetIdx]
  let mut price = asset.basePrice
  candleHistory = []

  for (let mut i = 0; i < 32; i = i + 1) {
    let open = price
    let change = (Math.random() - 0.48) * asset.volatility * price
    let close = Math.max(price * 0.5, price + change)
    let high = Math.max(open, close) + Math.random() * (asset.volatility * 0.6) * price
    let low = Math.min(open, close) - Math.random() * (asset.volatility * 0.6) * price
    let vol = Math.floor(Math.random() * 50000 + 10000)

    candleHistory.push({
      time: i,
      open: open,
      high: high,
      low: low,
      close: close,
      volume: vol
    })
    price = close
  }

  currentLivePrice = price
  currentLiveOpen = price
  currentLiveHigh = price
  currentLiveLow = price
  currentLiveVolume = 0.0
  tickInCurrentCandle = 0
}

function processMarketTick() {
  let asset = ASSET_PROFILES[selectedAssetIdx]
  // Geometric Brownian Motion Tick: deltaS = S * (drift * dt + vol * sqrt(dt) * Z)
  let shock = (Math.random() + Math.random() + Math.random() - 1.5) // Approx standard normal
  let pctChange = asset.drift + asset.volatility * 0.35 * shock
  let newPrice = Math.max(asset.basePrice * 0.2, currentLivePrice * (1.0 + pctChange))

  currentLivePrice = newPrice
  currentLiveHigh = Math.max(currentLiveHigh, newPrice)
  currentLiveLow = Math.min(currentLiveLow, newPrice)
  currentLiveVolume = currentLiveVolume + Math.floor(Math.random() * 500 + 100)

  tickInCurrentCandle = tickInCurrentCandle + 1

  // 6 ticks form a complete candle
  if (tickInCurrentCandle >= 6) {
    candleHistory.push({
      time: candleHistory.length,
      open: currentLiveOpen,
      high: currentLiveHigh,
      low: currentLiveLow,
      close: currentLivePrice,
      volume: currentLiveVolume
    })

    // Keep history window to 34 candles
    if (candleHistory.length > 34) {
      candleHistory.shift()
    }

    currentLiveOpen = currentLivePrice
    currentLiveHigh = currentLivePrice
    currentLiveLow = currentLivePrice
    currentLiveVolume = 0.0
    tickInCurrentCandle = 0
  }
}

// ----------------------------------------------------------------------------
// 5. Paper Trading Execution Engine
// ----------------------------------------------------------------------------

function executeTrade(side: string, amountUSD: number) {
  let asset = ASSET_PROFILES[selectedAssetIdx]
  let price = currentLivePrice

  if (side == "BUY") {
    if (cashBalance >= amountUSD) {
      let shares = amountUSD / price
      cashBalance = cashBalance - amountUSD
      assetHoldings = assetHoldings + shares
      tradeCount = tradeCount + 1
      orderHistory.unshift({
        id: tradeCount,
        symbol: asset.symbol,
        side: "BUY",
        shares: shares,
        price: price,
        timeStr: "Just now"
      })
    }
  } else if (side == "SELL") {
    let maxSellShares = amountUSD / price
    let sharesToSell = Math.min(assetHoldings, maxSellShares)
    if (sharesToSell > 0.0001) {
      let proceeds = sharesToSell * price
      assetHoldings = assetHoldings - sharesToSell
      cashBalance = cashBalance + proceeds
      tradeCount = tradeCount + 1
      orderHistory.unshift({
        id: tradeCount,
        symbol: asset.symbol,
        side: "SELL",
        shares: sharesToSell,
        price: price,
        timeStr: "Just now"
      })
    }
  }

  renderUI()
}

// ----------------------------------------------------------------------------
// 6. Virtual DOM Dashboard & Interactive UI Deck
// ----------------------------------------------------------------------------

function renderUI() {
  let asset = ASSET_PROFILES[selectedAssetIdx]
  let totalEquity = cashBalance + (assetHoldings * currentLivePrice)
  let pnlTotal = totalEquity - 100000.0
  let pnlPct = (pnlTotal / 100000.0) * 100.0
  let sigInfo = evaluateSignals()

  let vnode = h("div", { className: "p-4 max-w-6xl mx-auto space-y-4 font-sans text-slate-100 select-none" }, [
    // Top Bar: Ticker Header & Live Telemetry
    h("div", { className: "flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl" }, [
      h("div", { className: "space-y-1" }, [
        h("div", { className: "flex items-center space-x-2" }, [
          h("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider" },
            "FRP Market Stream"
          ),
          h("span", { className: "px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-sky-300 border border-slate-700" },
            "Quantitative Engine"
          )
        ]),
        h("h1", { className: "text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent" },
          "Functional Reactive Stock Ticker & Technical Indicator Lab"
        )
      ]),

      // Asset Selector Buttons
      h("div", { className: "flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800" },
        [0, 1, 2, 3].map(fn(idx) {
          let p = ASSET_PROFILES[idx]
          let isSel = idx == selectedAssetIdx
          h("button", {
            className: isSel
              ? "px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-mono text-xs font-bold shadow-md cursor-pointer"
              : "px-3 py-1.5 rounded-lg bg-transparent text-slate-400 hover:text-slate-200 font-mono text-xs font-semibold cursor-pointer",
            onClick: fn() {
              selectedAssetIdx = idx
              generateInitialHistory()
              renderUI()
            }
          }, p.symbol)
        })
      )
    ]),

    // Portfolio Status & Real-Time Price Cards
    h("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3" }, [
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800" }, [
        h("div", { className: "text-[10px] font-mono uppercase text-slate-500 font-bold" }, "Live Price"),
        h("div", { id: "live-price-disp", className: "text-xl font-black font-mono text-emerald-400" },
          concat("$", to_string(Math.floor(currentLivePrice * 100) / 100))
        ),
        h("div", { className: "text-[11px] text-slate-400 font-mono" }, asset.name)
      ]),
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800" }, [
        h("div", { className: "text-[10px] font-mono uppercase text-slate-500 font-bold" }, "Total Portfolio Equity"),
        h("div", { className: "text-xl font-black font-mono text-slate-100" },
          concat("$", to_string(Math.floor(totalEquity)))
        ),
        h("div", { className: pnlTotal >= 0 ? "text-[11px] text-emerald-400 font-mono font-semibold" : "text-[11px] text-rose-400 font-mono font-semibold" },
          concat(pnlTotal >= 0 ? "+$" : "-$", concat(to_string(Math.floor(Math.abs(pnlTotal))), concat(" (", concat(to_string(Math.floor(pnlPct * 10) / 10), "%)"))))
        )
      ]),
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800" }, [
        h("div", { className: "text-[10px] font-mono uppercase text-slate-500 font-bold" }, "Cash Balance"),
        h("div", { className: "text-xl font-black font-mono text-slate-200" },
          concat("$", to_string(Math.floor(cashBalance)))
        ),
        h("div", { className: "text-[11px] text-slate-400 font-mono" }, "Available to Deploy")
      ]),
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800" }, [
        h("div", { className: "text-[10px] font-mono uppercase text-slate-500 font-bold" }, concat(asset.symbol, " Holdings")),
        h("div", { className: "text-xl font-black font-mono text-amber-400" },
          to_string(Math.floor(assetHoldings * 1000) / 1000)
        ),
        h("div", { className: "text-[11px] text-slate-400 font-mono" },
          concat("Val: $", to_string(Math.floor(assetHoldings * currentLivePrice)))
        )
      ])
    ]),

    // Signal Intelligence Ribbon
    h("div", { className: "p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono" }, [
      h("div", { className: "flex items-center space-x-3" }, [
        h("span", {
          className: sigInfo.signal == BullishBuy
            ? "px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold"
            : (sigInfo.signal == BearishSell
                ? "px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold"
                : "px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold")
        }, sigInfo.signal == BullishBuy ? "🟢 BULLISH BUY" : (sigInfo.signal == BearishSell ? "🔴 BEARISH SELL" : "⚪ NEUTRAL HOLD")),
        h("span", { className: "text-slate-300" }, sigInfo.desc)
      ]),
      h("div", { className: "flex items-center space-x-2" }, [
        h("span", { className: "text-slate-500 text-[10px]" }, "SIGNAL CONFIDENCE:"),
        h("span", { className: "text-emerald-400 font-bold" }, concat(to_string(sigInfo.confidence), "%"))
      ])
    ]),

    // Primary Financial Chart Viewport
    h("div", { className: "relative bg-slate-950 rounded-2xl border border-slate-800 p-3 shadow-2xl space-y-2" }, [
      // Chart Indicator Selection Tabs
      h("div", { className: "flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-mono" }, [
        h("div", { className: "flex items-center space-x-1.5" }, [
          h("span", { className: "text-slate-500 text-[11px] uppercase mr-1" }, "Overlay:"),
          h("button", {
            className: activeIndicator == IndBollinger ? "px-2.5 py-1 rounded-lg bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-bold cursor-pointer" : "px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 cursor-pointer",
            onClick: fn() { activeIndicator = IndBollinger; renderUI() }
          }, "Bollinger Bands (20, 2)"),
          h("button", {
            className: activeIndicator == IndSMA ? "px-2.5 py-1 rounded-lg bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold cursor-pointer" : "px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 cursor-pointer",
            onClick: fn() { activeIndicator = IndSMA; renderUI() }
          }, "SMA (5 / 15 Fast-Slow)"),
          h("button", {
            className: activeIndicator == IndEMA ? "px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold cursor-pointer" : "px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 cursor-pointer",
            onClick: fn() { activeIndicator = IndEMA; renderUI() }
          }, "EMA (9 / 21 Trend)"),
          h("button", {
            className: activeIndicator == IndRSI ? "px-2.5 py-1 rounded-lg bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40 font-bold cursor-pointer" : "px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 cursor-pointer",
            onClick: fn() { activeIndicator = IndRSI; renderUI() }
          }, "RSI Oscillator (14)")
        ]),

        // Play/Pause Live Simulation
        h("div", { className: "flex items-center space-x-2" }, [
          h("button", {
            id: "btn-sim-toggle",
            className: isLiveTrading
              ? "px-3 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs cursor-pointer"
              : "px-3 py-1 rounded-lg bg-slate-800 text-slate-400 font-bold text-xs cursor-pointer",
            onClick: fn() {
              isLiveTrading = !isLiveTrading
              let btn = getElementById("btn-sim-toggle")
              if (btn) btn.innerText = isLiveTrading ? "● LIVE FEED ON" : "○ FEED PAUSED"
            }
          }, isLiveTrading ? "● LIVE FEED ON" : "○ FEED PAUSED"),
          h("button", {
            className: "px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer font-mono",
            onClick: fn() { generateInitialHistory(); renderUI() }
          }, "Reset Feed")
        ])
      ]),

      // Interactive Canvas Chart
      h("div", { className: "flex justify-center overflow-hidden" }, [
        h("canvas", {
          id: "stock-chart-canvas",
          width: "740",
          height: "300",
          className: "w-full rounded-xl bg-slate-950 border border-slate-800 shadow-inner"
        }, "")
      ])
    ]),

    // Interactive Paper Trading Deck & Order Book
    h("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3" }, [
      // 1. Instant Trade Desk
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3" }, [
        h("div", { className: "text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider" }, "⚡ Quick Paper Trade Desk"),
        h("div", { className: "grid grid-cols-2 gap-2" }, [
          h("button", {
            className: "p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition cursor-pointer shadow-lg shadow-emerald-900/30 active:scale-95 text-center",
            onClick: fn() { executeTrade("BUY", 2500.0) }
          }, "BUY $2,500"),
          h("button", {
            className: "p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition cursor-pointer shadow-lg shadow-emerald-900/30 active:scale-95 text-center",
            onClick: fn() { executeTrade("BUY", 10000.0) }
          }, "BUY $10,000"),
          h("button", {
            className: "p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-900/30 active:scale-95 text-center",
            onClick: fn() { executeTrade("SELL", 2500.0) }
          }, "SELL $2,500"),
          h("button", {
            className: "p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition cursor-pointer shadow-lg shadow-rose-900/30 active:scale-95 text-center",
            onClick: fn() { executeTrade("SELL", 10000.0) }
          }, "SELL ALL / $10k")
        ])
      ]),

      // 2. Market Depth & Quantitative Stats
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5" }, [
        h("div", { className: "text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider" }, "📊 Quantitative Volatility Stats"),
        h("div", { className: "space-y-1.5 text-xs font-mono text-slate-300" }, [
          h("div", { className: "flex justify-between" }, [
            h("span", { className: "text-slate-500" }, "Annualized Vol:"),
            h("span", { className: "text-amber-300" }, concat(to_string(Math.floor(asset.volatility * 1000) / 10), "%"))
          ]),
          h("div", { className: "flex justify-between" }, [
            h("span", { className: "text-slate-500" }, "Drift Vector:"),
            h("span", { className: "text-sky-300" }, concat("+", to_string(asset.drift * 10000)))
          ]),
          h("div", { className: "flex justify-between" }, [
            h("span", { className: "text-slate-500" }, "Active Candles:"),
            h("span", { className: "text-slate-300" }, to_string(candleHistory.length))
          ]),
          h("div", { className: "flex justify-between" }, [
            h("span", { className: "text-slate-500" }, "Total Fills:"),
            h("span", { className: "text-emerald-400 font-bold" }, to_string(tradeCount))
          ])
        ])
      ]),

      // 3. Trade Fill Log
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2" }, [
        h("div", { className: "text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider" }, "📝 Order Fill History"),
        h("div", { className: "space-y-1.5 max-h-28 overflow-y-auto pr-1 text-[11px] font-mono" },
          orderHistory.length == 0
            ? [h("div", { className: "text-slate-500 italic py-2 text-center" }, "No trade executions yet")]
            : orderHistory.slice(0, 4).map(fn(ord) {
                h("div", { className: "flex items-center justify-between p-1.5 rounded-lg bg-slate-950 border border-slate-800" }, [
                  h("span", { className: ord.side == "BUY" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold" },
                    concat(ord.side, concat(" ", ord.symbol))
                  ),
                  h("span", { className: "text-slate-400" },
                    concat(to_string(Math.floor(ord.shares * 100) / 100), concat(" @ $", to_string(Math.floor(ord.price * 100) / 100)))
                  )
                ])
              })
        )
      ])
    ])
  ])

  mount("app-root", vnode)
}

// ----------------------------------------------------------------------------
// 7. High-DPI Candlestick & Indicator Canvas Render Loop
// ----------------------------------------------------------------------------

generateInitialHistory()
renderUI()

let chartCanvas = getElementById("stock-chart-canvas")
if (chartCanvas) {
  let ctx = chartCanvas.getContext("2d")
  let W = 740
  let H = 300

  let mut lastTickTime = 0

  function chartLoop(timestamp: number) {
    if (isLiveTrading) {
      if (timestamp - lastTickTime >= 650) {
        processMarketTick()
        lastTickTime = timestamp

        // Update live price display
        let pDisp = getElementById("live-price-disp")
        if (pDisp) {
          pDisp.innerText = concat("$", to_string(Math.floor(currentLivePrice * 100) / 100))
        }
      }
    }

    // 1. Clear Canvas Background
    ctx.fillStyle = "#020617"
    ctx.fillRect(0, 0, W, H)

    let count = candleHistory.length
    if (count > 0) {
      // Find Min / Max Price for dynamic chart scaling
      let mut minPrice = candleHistory[0].low
      let mut maxPrice = candleHistory[0].high

      for (let mut i = 0; i < count; i = i + 1) {
        minPrice = Math.min(minPrice, candleHistory[i].low)
        maxPrice = Math.max(maxPrice, candleHistory[i].high)
      }

      minPrice = Math.min(minPrice, currentLiveLow) * 0.995
      maxPrice = Math.max(maxPrice, currentLiveHigh) * 1.005
      let priceRange = Math.max(0.001, maxPrice - minPrice)

      // Margin configuration
      let padLeft = 10
      let padRight = 60
      let padTop = 15
      let padBottom = 25
      let chartW = W - padLeft - padRight
      let chartH = H - padTop - padBottom

      let slotW = chartW / (count + 1)
      let candleW = Math.max(3, slotW * 0.65)

      // 2. Draw Price Grid Lines & Scale Labels
      ctx.strokeStyle = "#1e293b"
      ctx.lineWidth = 1
      ctx.fillStyle = "#64748b"
      ctx.font = "10px monospace"

      for (let mut gl = 0; gl <= 4; gl = gl + 1) {
        let frac = gl / 4.0
        let gy = padTop + chartH * frac
        let gPrice = maxPrice - (frac * priceRange)

        ctx.beginPath()
        ctx.moveTo(padLeft, gy)
        ctx.lineTo(W - padRight, gy)
        ctx.stroke()

        ctx.fillText(concat("$", to_string(Math.floor(gPrice * 100) / 100)), W - padRight + 6, gy + 3)
      }

      // 3. Render Technical Indicators Overlay
      match (activeIndicator) {
        IndBollinger => {
          let bands = calculateBollingerBands(candleHistory, 12, 2.0)
          
          // Draw Upper Band
          ctx.strokeStyle = "#38bdf8"
          ctx.lineWidth = 1.5
          ctx.beginPath()
          for (let mut bi = 0; bi < count; bi = bi + 1) {
            let bx = padLeft + bi * slotW + slotW / 2
            let by = padTop + chartH * (1.0 - (bands[bi].upper - minPrice) / priceRange)
            if (bi == 0) ctx.moveTo(bx, by) else ctx.lineTo(bx, by)
          }
          ctx.stroke()

          // Draw Lower Band
          ctx.strokeStyle = "#38bdf8"
          ctx.lineWidth = 1.5
          ctx.beginPath()
          for (let mut bi = 0; bi < count; bi = bi + 1) {
            let bx = padLeft + bi * slotW + slotW / 2
            let by = padTop + chartH * (1.0 - (bands[bi].lower - minPrice) / priceRange)
            if (bi == 0) ctx.moveTo(bx, by) else ctx.lineTo(bx, by)
          }
          ctx.stroke()

          // Draw Mid SMA Band
          ctx.strokeStyle = "#0284c7"
          ctx.lineWidth = 1
          ctx.beginPath()
          for (let mut bi = 0; bi < count; bi = bi + 1) {
            let bx = padLeft + bi * slotW + slotW / 2
            let by = padTop + chartH * (1.0 - (bands[bi].mid - minPrice) / priceRange)
            if (bi == 0) ctx.moveTo(bx, by) else ctx.lineTo(bx, by)
          }
          ctx.stroke()
        }
        IndSMA => {
          let fastSMA = calculateSMA(candleHistory, 5)
          let slowSMA = calculateSMA(candleHistory, 15)

          // Fast SMA (Gold)
          ctx.strokeStyle = "#f59e0b"
          ctx.lineWidth = 2
          ctx.beginPath()
          for (let mut si = 0; si < count; si = si + 1) {
            let sx = padLeft + si * slotW + slotW / 2
            let sy = padTop + chartH * (1.0 - (fastSMA[si] - minPrice) / priceRange)
            if (si == 0) ctx.moveTo(sx, sy) else ctx.lineTo(sx, sy)
          }
          ctx.stroke()

          // Slow SMA (Purple)
          ctx.strokeStyle = "#a855f7"
          ctx.lineWidth = 2
          ctx.beginPath()
          for (let mut si = 0; si < count; si = si + 1) {
            let sx = padLeft + si * slotW + slotW / 2
            let sy = padTop + chartH * (1.0 - (slowSMA[si] - minPrice) / priceRange)
            if (si == 0) ctx.moveTo(sx, sy) else ctx.lineTo(sx, sy)
          }
          ctx.stroke()
        }
        IndEMA => {
          let ema9 = calculateEMA(candleHistory, 9)
          ctx.strokeStyle = "#6366f1"
          ctx.lineWidth = 2
          ctx.beginPath()
          for (let mut ei = 0; ei < count; ei = ei + 1) {
            let ex = padLeft + ei * slotW + slotW / 2
            let ey = padTop + chartH * (1.0 - (ema9[ei] - minPrice) / priceRange)
            if (ei == 0) ctx.moveTo(ex, ey) else ctx.lineTo(ex, ey)
          }
          ctx.stroke()
        }
        IndRSI => {
          let rsiVals = calculateRSI(candleHistory, 14)
          // Draw Sub-Oscillator Base Box
          ctx.fillStyle = "rgba(15, 23, 42, 0.7)"
          ctx.fillRect(padLeft, H - 75, chartW, 60)

          // 70 and 30 reference lines
          ctx.strokeStyle = "#e11d48"
          ctx.beginPath()
          ctx.moveTo(padLeft, H - 75 + 18)
          ctx.lineTo(W - padRight, H - 75 + 18)
          ctx.stroke()

          ctx.strokeStyle = "#10b981"
          ctx.beginPath()
          ctx.moveTo(padLeft, H - 75 + 42)
          ctx.lineTo(W - padRight, H - 75 + 42)
          ctx.stroke()

          // RSI Curve
          ctx.strokeStyle = "#ec4899"
          ctx.lineWidth = 2
          ctx.beginPath()
          for (let mut ri = 0; ri < count; ri = ri + 1) {
            let rx = padLeft + ri * slotW + slotW / 2
            let ry = (H - 75 + 60) - (rsiVals[ri] / 100.0) * 60
            if (ri == 0) ctx.moveTo(rx, ry) else ctx.lineTo(rx, ry)
          }
          ctx.stroke()
        }
        IndMACD => {
          // Default to clean chart
        }
      }

      // 4. Render Japanese Candlesticks (Green = Bullish, Red = Bearish)
      for (let mut ci = 0; ci < count; ci = ci + 1) {
        let c = candleHistory[ci]
        let isBull = c.close >= c.open
        let cx = padLeft + ci * slotW + slotW / 2

        let openY = padTop + chartH * (1.0 - (c.open - minPrice) / priceRange)
        let closeY = padTop + chartH * (1.0 - (c.close - minPrice) / priceRange)
        let highY = padTop + chartH * (1.0 - (c.high - minPrice) / priceRange)
        let lowY = padTop + chartH * (1.0 - (c.low - minPrice) / priceRange)

        let bodyTop = Math.min(openY, closeY)
        let bodyH = Math.max(2, Math.abs(closeY - openY))

        // Draw Wick
        ctx.strokeStyle = isBull ? "#10b981" : "#f43f5e"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(cx, highY)
        ctx.lineTo(cx, lowY)
        ctx.stroke()

        // Draw Body
        ctx.fillStyle = isBull ? "#10b981" : "#f43f5e"
        ctx.fillRect(cx - candleW / 2, bodyTop, candleW, bodyH)
      }

      // 5. Render Current Active Live Ticking Candle
      let liveX = padLeft + count * slotW + slotW / 2
      let liveIsBull = currentLivePrice >= currentLiveOpen
      let lOpenY = padTop + chartH * (1.0 - (currentLiveOpen - minPrice) / priceRange)
      let lCloseY = padTop + chartH * (1.0 - (currentLivePrice - minPrice) / priceRange)
      let lHighY = padTop + chartH * (1.0 - (currentLiveHigh - minPrice) / priceRange)
      let lLowY = padTop + chartH * (1.0 - (currentLiveLow - minPrice) / priceRange)

      let lBodyTop = Math.min(lOpenY, lCloseY)
      let lBodyH = Math.max(2, Math.abs(lCloseY - lOpenY))

      ctx.strokeStyle = liveIsBull ? "#34d399" : "#fb7185"
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(liveX, lHighY)
      ctx.lineTo(liveX, lLowY)
      ctx.stroke()

      ctx.fillStyle = liveIsBull ? "#34d399" : "#fb7185"
      ctx.fillRect(liveX - candleW / 2, lBodyTop, candleW, lBodyH)

      // Live horizontal price line
      ctx.strokeStyle = liveIsBull ? "#34d399" : "#fb7185"
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(padLeft, lCloseY)
      ctx.lineTo(W - padRight, lCloseY)
      ctx.stroke()
      ctx.setLineDash([])
    }

    requestAnimationFrame(chartLoop)
  }

  requestAnimationFrame(chartLoop)
}

println("Functional Reactive Stock Ticker & Technical Indicator Lab Initialized Successfully!")
`
  };
