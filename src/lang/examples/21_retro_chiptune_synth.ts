import { ExampleProgram } from "./types";

export const example21RetroChiptuneSynth: ExampleProgram = {
    id: 'retro_chiptune_synth',
    name: '21. Retro Synth & 8-Bit WebAudio Chiptune Tracker',
    category: 'Interactive Web Apps',
    description: '16-step polyphonic retro chiptune sequencer and synthesizer powered by WebAudio API. Features ADSR envelope shaping, 4 waveform channels (Pulse 1, Pulse 2, Triangle Bass, Noise Drums), arpeggiator engine, preset songs, live oscilloscope, and interactive piano roll grid.',
    code: `// ============================================================================
// TypeLang Retro 8-Bit Synthesizer & Chiptune Tracker
// ============================================================================

import DOM.{ h, mount, getElementById, initAudio, playCustomTone, playNoise }

// ----------------------------------------------------------------------------
// 1. Algebraic Sound Engine Types & Waveforms
// ----------------------------------------------------------------------------

type Waveform =
  | PulseSquare
  | PulseNarrow
  | TriangleWave
  | NoiseSnare

type Note = {
  name: string,
  freq: number,
  octave: number
}

type TrackChannel = {
  id: string,
  name: string,
  wave: Waveform,
  mut mute: boolean,
  mut volume: number,
  color: string
}

// ----------------------------------------------------------------------------
// 2. Musical Note Scale & Mathematical Frequencies
// ----------------------------------------------------------------------------

let NOTE_NAMES = ["C", "D", "E", "F", "G", "A", "B", "C+"]
let NOTE_FREQS = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]
let BASS_FREQS = [130.81, 146.83, 164.81, 174.61, 196.00, 220.00, 246.94, 261.63]

let NUM_STEPS = 16

// ----------------------------------------------------------------------------
// 3. Tracker State & Pattern Grids
// ----------------------------------------------------------------------------

let mut isPlaying = false
let mut currentStep = 0
let mut tempoBPM = 135
let mut masterGain = 0.8
let mut isArpActive = true

// 4 Active Tracker Channels: Lead 1 (Square), Lead 2 (Pulse), Bass (Triangle), Noise (Drums)
let mut patternLead1: [number] = [0, -1, 2, -1, 4, -1, 7, -1, 4, -1, 2, -1, 0, -1, 2, 4]
let mut patternLead2: [number] = [-1, 2, -1, 4, -1, 7, -1, 4, -1, 2, -1, 0, -1, 2, 4, 7]
let mut patternBass:  [number] = [0, -1, 0, -1, 3, -1, 3, -1, 4, -1, 4, -1, 0, 0, 4, 3]
let mut patternDrums: [number] = [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1]

let mut muteLead1 = false
let mut muteLead2 = false
let mut muteBass = false
let mut muteDrums = false

// ----------------------------------------------------------------------------
// 4. WebAudio Synthesizer Voices (Type-Safe Native Audio Engine)
// ----------------------------------------------------------------------------

function playSynthTone(freq: number, wave: Waveform, duration: number, vol: number) {
  let effectiveVol = vol * masterGain
  match (wave) {
    NoiseSnare => {
      DOM.playNoise(duration, effectiveVol)
    }
    PulseSquare => {
      DOM.playCustomTone(freq, "square", duration, effectiveVol, 0.015)
    }
    PulseNarrow => {
      DOM.playCustomTone(freq, "sawtooth", duration, effectiveVol, 0.01)
    }
    TriangleWave => {
      DOM.playCustomTone(freq, "triangle", duration, effectiveVol, 0.02)
    }
  }
}

// ----------------------------------------------------------------------------
// 5. Sequencer Step Execution
// ----------------------------------------------------------------------------

function stepSequencer() {
  let step = currentStep

  // 1. Lead 1 (Pulse Square Chiptune Melody)
  if (!muteLead1) {
    let n1 = patternLead1[step]
    if (n1 >= 0 && n1 < 8) {
      let f = NOTE_FREQS[n1]
      playSynthTone(f, PulseSquare, 0.18, 0.25)
    }
  }

  // 2. Lead 2 (Saw/Pulse Harmony)
  if (!muteLead2) {
    let n2 = patternLead2[step]
    if (n2 >= 0 && n2 < 8) {
      let f = NOTE_FREQS[n2]
      let detune = isArpActive ? (step % 2 == 0 ? 1.0 : 1.25) : 1.0
      playSynthTone(f * detune, PulseNarrow, 0.15, 0.2)
    }
  }

  // 3. Bass Channel (Warm Triangle)
  if (!muteBass) {
    let nb = patternBass[step]
    if (nb >= 0 && nb < 8) {
      let f = BASS_FREQS[nb]
      playSynthTone(f, TriangleWave, 0.25, 0.4)
    }
  }

  // 4. Noise Drums (White Noise Snare / Kick)
  if (!muteDrums) {
    let nd = patternDrums[step]
    if (nd > 0) {
      playSynthTone(100, NoiseSnare, 0.12, 0.7)
    }
  }

  // Advance step
  currentStep = (currentStep + 1) % NUM_STEPS
}

// ----------------------------------------------------------------------------
// 6. Song Presets & Patterns
// ----------------------------------------------------------------------------

function loadPresetCyberRun() {
  patternLead1 = [0, -1, 2, -1, 4, -1, 7, -1, 4, -1, 2, -1, 0, -1, 2, 4]
  patternLead2 = [-1, 2, -1, 4, -1, 7, -1, 4, -1, 2, -1, 0, -1, 2, 4, 7]
  patternBass  = [0, -1, 0, -1, 3, -1, 3, -1, 4, -1, 4, -1, 0, 0, 4, 3]
  patternDrums = [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1]
  tempoBPM = 140
  renderUI()
}

function loadPreset8BitHero() {
  patternLead1 = [4, 4, -1, 4, -1, 2, 4, -1, 7, -1, -1, -1, 0, -1, -1, -1]
  patternLead2 = [0, 0, -1, 0, -1, 0, 2, -1, 4, -1, -1, -1, -1, -1, -1, -1]
  patternBass  = [0, -1, 0, -1, 0, -1, 0, -1, 4, -1, 4, -1, 3, -1, 4, -1]
  patternDrums = [1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0]
  tempoBPM = 160
  renderUI()
}

function loadPresetDungeonBoss() {
  patternLead1 = [7, -1, 6, -1, 5, -1, 4, -1, 3, -1, 2, -1, 1, -1, 0, -1]
  patternLead2 = [3, -1, 2, -1, 1, -1, 0, -1, 0, -1, 1, -1, 2, -1, 3, -1]
  patternBass  = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0]
  patternDrums = [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1]
  tempoBPM = 150
  renderUI()
}

function clearAllTracks() {
  patternLead1 = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
  patternLead2 = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
  patternBass  = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
  patternDrums = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  renderUI()
}

// ----------------------------------------------------------------------------
// 7. Virtual DOM UI & Interactive Step Matrix
// ----------------------------------------------------------------------------

function renderUI() {
  let vnode = h("div", { className: "p-4 max-w-5xl mx-auto space-y-4 font-sans text-slate-100 select-none" }, [
    // Top Banner & Telemetry
    h("div", { className: "flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl" }, [
      h("div", { className: "space-y-1" }, [
        h("div", { className: "flex items-center space-x-2" }, [
          h("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 uppercase tracking-wider" },
            "8-Bit WebAudio Engine"
          ),
          h("span", { className: "px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-sky-300 border border-slate-700" },
            "4-Channel Tracker"
          )
        ]),
        h("h1", { className: "text-2xl font-black bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-300 bg-clip-text text-transparent" },
          "Retro Synth & 8-Bit Chiptune Tracker"
        )
      ]),

      // Playback Controls
      h("div", { className: "flex items-center gap-3" }, [
        h("button", {
          id: "btn-play-pause",
          className: isPlaying
            ? "px-5 py-2.5 rounded-xl font-mono text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 cursor-pointer transition flex items-center space-x-2"
            : "px-5 py-2.5 rounded-xl font-mono text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 cursor-pointer transition flex items-center space-x-2",
          onClick: fn() {
            isPlaying = !isPlaying
            let btn = getElementById("btn-play-pause")
            if (btn) {
              btn.innerText = isPlaying ? "⏸ PAUSE TRACKER" : "▶ PLAY CHIPTUNE"
              btn.className = isPlaying
                ? "px-5 py-2.5 rounded-xl font-mono text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40 cursor-pointer transition flex items-center space-x-2"
                : "px-5 py-2.5 rounded-xl font-mono text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40 cursor-pointer transition flex items-center space-x-2"
            }
          }
        }, isPlaying ? "⏸ PAUSE TRACKER" : "▶ PLAY CHIPTUNE"),

        h("div", { className: "flex items-center space-x-2 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800 font-mono text-xs text-slate-300" }, [
          h("span", { className: "text-slate-500 text-[10px]" }, "BPM"),
          h("span", { id: "bpm-label", className: "font-bold text-amber-400" }, to_string(tempoBPM)),
          h("button", {
            className: "px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer",
            onClick: fn() {
              tempoBPM = Math.max(80, tempoBPM - 5)
              let lbl = getElementById("bpm-label")
              if (lbl) lbl.innerText = to_string(tempoBPM)
            }
          }, "-"),
          h("button", {
            className: "px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 cursor-pointer",
            onClick: fn() {
              tempoBPM = Math.min(220, tempoBPM + 5)
              let lbl = getElementById("bpm-label")
              if (lbl) lbl.innerText = to_string(tempoBPM)
            }
          }, "+")
        ])
      ])
    ]),

    // Visual Waveform Oscilloscope & Piano Roll
    h("div", { className: "relative bg-slate-950 rounded-2xl border border-slate-800 p-4 shadow-2xl space-y-4" }, [
      // Oscilloscope Canvas
      h("div", { className: "flex justify-center" }, [
        h("canvas", {
          id: "synth-scope",
          width: "560",
          height: "90",
          className: "w-full rounded-xl bg-slate-950 border border-slate-800 shadow-inner"
        }, "")
      ]),

      // 16-Step Indicator Header
      h("div", { className: "grid grid-cols-16 gap-1 px-1 text-center font-mono text-[10px] text-slate-500" },
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(fn(stepIdx) {
          let isCurrent = stepIdx == currentStep
          h("div", {
            id: concat("step-dot-", to_string(stepIdx)),
            className: isCurrent
              ? "py-1 rounded bg-fuchsia-500 text-white font-bold shadow-lg shadow-fuchsia-500/50"
              : "py-1 rounded bg-slate-900 border border-slate-800 text-slate-400"
          }, to_string(stepIdx + 1))
        })
      ),

      // 1. Channel Lead 1 (Square Wave)
      renderChannelRow("CH1 • Pulse Lead (Square)", "#ec4899", patternLead1, muteLead1, fn(step) {
        patternLead1[step] = (patternLead1[step] + 2) % 9 - 1
        if (patternLead1[step] >= 0) playSynthTone(NOTE_FREQS[patternLead1[step]], PulseSquare, 0.15, 0.7)
        renderUI()
      }, fn() {
        muteLead1 = !muteLead1
        renderUI()
      }),

      // 2. Channel Lead 2 (Pulse/Saw Harmony)
      renderChannelRow("CH2 • Pulse Harmony (Saw)", "#38bdf8", patternLead2, muteLead2, fn(step) {
        patternLead2[step] = (patternLead2[step] + 2) % 9 - 1
        if (patternLead2[step] >= 0) playSynthTone(NOTE_FREQS[patternLead2[step]], PulseNarrow, 0.15, 0.6)
        renderUI()
      }, fn() {
        muteLead2 = !muteLead2
        renderUI()
      }),

      // 3. Channel Bass (Triangle Wave)
      renderChannelRow("CH3 • Triangle Bass", "#eab308", patternBass, muteBass, fn(step) {
        patternBass[step] = (patternBass[step] + 2) % 9 - 1
        if (patternBass[step] >= 0) playSynthTone(BASS_FREQS[patternBass[step]], TriangleWave, 0.2, 0.8)
        renderUI()
      }, fn() {
        muteBass = !muteBass
        renderUI()
      }),

      // 4. Channel Drums (Noise Percussion)
      renderDrumRow("CH4 • Noise Percussion (Snare)", "#a855f7", patternDrums, muteDrums, fn(step) {
        patternDrums[step] = patternDrums[step] > 0 ? 0 : 1
        if (patternDrums[step] > 0) playSynthTone(100, NoiseSnare, 0.1, 0.8)
        renderUI()
      }, fn() {
        muteDrums = !muteDrums
        renderUI()
      })
    ]),

    // Song Presets & Arpeggiator Settings
    h("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3" }, [
      // 1. Preset Chiptunes
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5" }, [
        h("div", { className: "text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider" }, "🕹 Chiptune Song Presets"),
        h("div", { className: "grid grid-cols-2 gap-1.5 text-xs font-mono" }, [
          h("button", {
            className: "p-2 rounded-xl bg-slate-800 hover:bg-fuchsia-600/30 text-slate-200 border border-slate-700 text-left transition cursor-pointer",
            onClick: fn() { loadPresetCyberRun() }
          }, "⚡ Cyber Run"),
          h("button", {
            className: "p-2 rounded-xl bg-slate-800 hover:bg-sky-600/30 text-slate-200 border border-slate-700 text-left transition cursor-pointer",
            onClick: fn() { loadPreset8BitHero() }
          }, "👾 8-Bit Hero"),
          h("button", {
            className: "p-2 rounded-xl bg-slate-800 hover:bg-amber-600/30 text-slate-200 border border-slate-700 text-left transition cursor-pointer",
            onClick: fn() { loadPresetDungeonBoss() }
          }, "💀 Dungeon Boss"),
          h("button", {
            className: "p-2 rounded-xl bg-slate-800 hover:bg-rose-600/30 text-slate-200 border border-slate-700 text-left transition cursor-pointer",
            onClick: fn() { clearAllTracks() }
          }, "🗑 Clear Grid")
        ])
      ]),

      // 2. Interactive Tone Testing Keyboard
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5" }, [
        h("div", { className: "text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider" }, "🎹 Live Synth Keyboard"),
        h("div", { className: "grid grid-cols-8 gap-1 pt-1" },
          [0, 1, 2, 3, 4, 5, 6, 7].map(fn(idx) {
            let name = NOTE_NAMES[idx]
            let f = NOTE_FREQS[idx]
            h("button", {
              className: "py-3 rounded-lg bg-slate-800 hover:bg-fuchsia-500 hover:text-white text-slate-300 font-mono text-[10px] font-bold transition cursor-pointer border border-slate-700 text-center active:scale-95",
              onClick: fn() { playSynthTone(f, PulseSquare, 0.25, 0.8) }
            }, name)
          })
        )
      ]),

      // 3. Arpeggiator & Effects
      h("div", { className: "p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5" }, [
        h("div", { className: "text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider" }, "🎛 FX & Arpeggiator"),
        h("div", { className: "flex items-center justify-between text-xs font-mono text-slate-300" }, [
          h("span", {}, "Harmonic Arp:"),
          h("button", {
            className: isArpActive
              ? "px-2.5 py-1 rounded bg-fuchsia-600 text-white font-bold cursor-pointer"
              : "px-2.5 py-1 rounded bg-slate-800 text-slate-400 cursor-pointer",
            onClick: fn() {
              isArpActive = !isArpActive
              renderUI()
            }
          }, isArpActive ? "ON (Octave Step)" : "OFF")
        ]),
        h("div", { className: "flex items-center justify-between text-xs font-mono text-slate-300 pt-1" }, [
          h("span", {}, "Master Volume:"),
          h("div", { className: "flex gap-1" }, [
            h("button", {
              className: masterGain == 0.4 ? "px-2 py-0.5 rounded bg-fuchsia-600 text-white" : "px-2 py-0.5 rounded bg-slate-800 text-slate-400",
              onClick: fn() { masterGain = 0.4; renderUI() }
            }, "Low"),
            h("button", {
              className: masterGain == 0.8 ? "px-2 py-0.5 rounded bg-fuchsia-600 text-white" : "px-2 py-0.5 rounded bg-slate-800 text-slate-400",
              onClick: fn() { masterGain = 0.8; renderUI() }
            }, "Mid"),
            h("button", {
              className: masterGain == 1.0 ? "px-2 py-0.5 rounded bg-fuchsia-600 text-white" : "px-2 py-0.5 rounded bg-slate-800 text-slate-400",
              onClick: fn() { masterGain = 1.0; renderUI() }
            }, "Max")
          ])
        ])
      ])
    ])
  ])

  mount("app-root", vnode)
}

function renderChannelRow(label: string, color: string, pattern: [number], isMute: boolean, onStepClick: (step: number) => void, onMuteToggle: () => void) {
  h("div", { className: "space-y-1" }, [
    h("div", { className: "flex items-center justify-between text-xs font-mono text-slate-300" }, [
      h("span", { className: isMute ? "text-slate-500 line-through" : "text-slate-200 font-semibold" }, label),
      h("button", {
        className: isMute
          ? "px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-400 border border-rose-800 cursor-pointer"
          : "px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 cursor-pointer",
        onClick: onMuteToggle
      }, isMute ? "MUTED" : "MUTE")
    ]),
    h("div", { className: "grid grid-cols-16 gap-1" },
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(fn(s) {
        let noteIdx = pattern[s]
        let hasNote = noteIdx >= 0
        let noteName = hasNote ? NOTE_NAMES[noteIdx] : "-"
        let isCurrent = s == currentStep

        h("button", {
          id: concat("cell-", concat(label, to_string(s))),
          className: hasNote
            ? (isCurrent
                ? "py-2 rounded-lg text-white font-mono text-[10px] font-bold bg-fuchsia-500 shadow-md shadow-fuchsia-500/50 border border-fuchsia-400 cursor-pointer active:scale-95"
                : "py-2 rounded-lg text-slate-900 font-mono text-[10px] font-bold bg-fuchsia-400/90 hover:bg-fuchsia-300 border border-fuchsia-500/40 cursor-pointer active:scale-95")
            : (isCurrent
                ? "py-2 rounded-lg text-slate-500 font-mono text-[10px] bg-slate-800 border border-slate-700 cursor-pointer"
                : "py-2 rounded-lg text-slate-600 font-mono text-[10px] bg-slate-950 hover:bg-slate-900 border border-slate-800/80 cursor-pointer"),
          onClick: fn() { onStepClick(s) }
        }, noteName)
      })
    )
  ])
}

function renderDrumRow(label: string, color: string, pattern: [number], isMute: boolean, onStepClick: (step: number) => void, onMuteToggle: () => void) {
  h("div", { className: "space-y-1" }, [
    h("div", { className: "flex items-center justify-between text-xs font-mono text-slate-300" }, [
      h("span", { className: isMute ? "text-slate-500 line-through" : "text-slate-200 font-semibold" }, label),
      h("button", {
        className: isMute
          ? "px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-400 border border-rose-800 cursor-pointer"
          : "px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 cursor-pointer",
        onClick: onMuteToggle
      }, isMute ? "MUTED" : "MUTE")
    ]),
    h("div", { className: "grid grid-cols-16 gap-1" },
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(fn(s) {
        let active = pattern[s] > 0
        let isCurrent = s == currentStep

        h("button", {
          className: active
            ? (isCurrent
                ? "py-2 rounded-lg text-white font-mono text-[10px] font-bold bg-amber-400 shadow-md shadow-amber-400/50 border border-amber-300 cursor-pointer active:scale-95"
                : "py-2 rounded-lg text-slate-950 font-mono text-[10px] font-bold bg-amber-500/90 hover:bg-amber-400 border border-amber-600/40 cursor-pointer active:scale-95")
            : (isCurrent
                ? "py-2 rounded-lg text-slate-500 font-mono text-[10px] bg-slate-800 border border-slate-700 cursor-pointer"
                : "py-2 rounded-lg text-slate-600 font-mono text-[10px] bg-slate-950 hover:bg-slate-900 border border-slate-800/80 cursor-pointer"),
          onClick: fn() { onStepClick(s) }
        }, active ? "HIT" : "-")
      })
    )
  ])
}

// ----------------------------------------------------------------------------
// 8. Visual Waveform Canvas Animation & Sequencer Timing Loop
// ----------------------------------------------------------------------------

renderUI()

let canvas = getElementById("synth-scope")
if (canvas) {
  let ctx = canvas.getContext("2d")
  let W = 560
  let H = 90

  let mut lastStepTime = 0
  let mut wavePhase = 0.0

  function synthLoop(timestamp: number) {
    let stepInterval = (60.0 / tempoBPM) * 1000.0 / 4.0 // 16th notes

    if (isPlaying) {
      if (timestamp - lastStepTime >= stepInterval) {
        stepSequencer()
        lastStepTime = timestamp

        // Update step dots
        for (let mut i = 0; i < NUM_STEPS; i = i + 1) {
          let dot = getElementById(concat("step-dot-", to_string(i)))
          if (dot) {
            dot.className = i == currentStep
              ? "py-1 rounded bg-fuchsia-500 text-white font-bold shadow-lg shadow-fuchsia-500/50 scale-105 transition-transform"
              : "py-1 rounded bg-slate-900 border border-slate-800 text-slate-400"
          }
        }
      }
    }

    // Draw Chiptune Oscilloscope & Equalizer Bars
    ctx.fillStyle = "#020617"
    ctx.fillRect(0, 0, W, H)

    // Grid lines
    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, H / 2)
    ctx.lineTo(W, H / 2)
    ctx.stroke()

    // Animated Retro Waveform
    wavePhase = wavePhase + 0.15
    ctx.strokeStyle = isPlaying ? "#f43f5e" : "#475569"
    ctx.lineWidth = 2.5
    ctx.beginPath()

    for (let mut x = 0; x < W; x = x + 4) {
      let amp = isPlaying ? 28.0 : 4.0
      let freq = isPlaying ? 0.04 : 0.02
      let y = H / 2 + Math.sin(x * freq + wavePhase) * amp * Math.cos(x * 0.01)

      if (x == 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    // 8-Bit Glowing Glow
    if (isPlaying) {
      ctx.fillStyle = "#38bdf8"
      for (let mut bar = 0; bar < 16; bar = bar + 1) {
        let barH = Math.random() * 40 + 5
        let barX = bar * 34 + 10
        ctx.fillRect(barX, H - barH, 20, barH)
      }
    }

    requestAnimationFrame(synthLoop)
  }

  requestAnimationFrame(synthLoop)
}

println("Retro Synth & 8-Bit WebAudio Chiptune Tracker Initialized Successfully!")
`
  };
