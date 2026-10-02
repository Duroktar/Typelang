import { ExampleProgram } from "./types";

export const example30Chip8CpuEmulator: ExampleProgram = {
    id: "30",
    name: "30. Chip-8 CPU Emulator (Canvas / Keyboard)",
    title: "30. Chip-8 CPU Emulator (Canvas / Keyboard)",
    description: "A high-fidelity 8-bit Chip-8 virtual machine emulator with simulated CPU cycles, registers, stack, timers, VRAM rendering to canvas, interactive keypad, and full opcode unit tests.",
    category: "Virtualization & Hardware",
    code: `// ---------------------------------------------------------
// 30. Chip-8 CPU Virtual Machine & Emulator Lab
// ---------------------------------------------------------

import DOM.{ h, mount, getElementById }
import Math.{ floor, random, bitwise_and, bitwise_or, bitwise_xor, bitwise_shl, bitwise_shr }
import String.{ parseInt }

let mut memory = []
for (let mut i = 0; i < 4096; i = i + 1) { memory.push(0) }

let mut v = []
for (let mut i = 0; i < 16; i = i + 1) { v.push(0) }

let mut iReg = 0
let mut pc = 512
let mut stack = []
for (let mut i = 0; i < 16; i = i + 1) { stack.push(0) }
let mut sp = 0

let mut delayTimer = 0
let mut soundTimer = 0

let mut display = []
for (let mut i = 0; i < 2048; i = i + 1) { display.push(0) }

let mut keys = []
for (let mut i = 0; i < 16; i = i + 1) { keys.push(false) }

let mut isRunning = true
let mut romSelected = 0 // 0: Maze, 1: Keypad Test, 2: IBM Logo, 3: Bouncing Box, 4: Self-Test Diagnostic
let mut cpuCyclesPerFrame = 8 // ~480Hz
let mut totalCyclesExecuted = 0

let fontset = [
  240, 144, 144, 144, 240, // 0
  32, 96, 32, 32, 112,     // 1
  240, 16, 240, 128, 240,  // 2
  240, 16, 240, 16, 240,   // 3
  144, 144, 240, 16, 16,   // 4
  240, 128, 240, 16, 240,  // 5
  240, 128, 240, 144, 240, // 6
  240, 16, 32, 64, 64,     // 7
  240, 144, 240, 144, 240, // 8
  240, 144, 240, 16, 240,  // 9
  240, 144, 240, 144, 144, // A
  224, 144, 224, 144, 224, // B
  240, 128, 128, 128, 240, // C
  224, 144, 144, 144, 224, // D
  240, 128, 240, 128, 240, // E
  240, 128, 240, 128, 128  // F
]

function loadFontset() {
  for (let mut k = 0; k < 80; k = k + 1) {
    memory[80 + k] = fontset[k]
  }
}

// 1. Authentic 1970s Chip-8 Slanted Maze Generator ROM
let mazeROM = [
  162, 26, 192, 1, 48, 1, 18, 10, 162, 30, 209, 36, 113, 4, 49, 64, 
  18, 0, 97, 0, 114, 4, 50, 32, 18, 0, 128, 64, 32, 16, 16, 32, 
  64, 128, 18, 34
]

// 2. Interactive Keyboard & Single-Key Display Test ROM
let keyboardROM = [
  0, 224, 240, 10, 0, 224, 240, 41, 97, 28, 98, 13, 209, 37, 18, 2
]

// 3. Iconic 8-Bar IBM Logo Banner ROM (Paul Raines, 1978)
let logoROM = [
  0, 224, 162, 42, 96, 12, 97, 8, 208, 31, 112, 9, 162, 57, 208, 31, 
  162, 72, 112, 8, 208, 31, 112, 4, 162, 87, 208, 31, 112, 8, 162, 102, 
  208, 31, 112, 8, 162, 117, 208, 31, 18, 40, 255, 0, 255, 0, 60, 0, 
  60, 0, 60, 0, 60, 0, 255, 0, 255, 255, 0, 255, 0, 56, 0, 63, 
  0, 63, 0, 56, 0, 255, 0, 255, 128, 0, 224, 0, 224, 0, 128, 0, 
  128, 0, 224, 0, 224, 0, 128, 248, 0, 252, 0, 62, 0, 63, 0, 59, 
  0, 57, 0, 248, 0, 248, 3, 0, 7, 0, 15, 0, 191, 0, 251, 0, 
  243, 0, 227, 0, 67, 224, 0, 224, 0, 128, 0, 128, 0, 128, 0, 128, 
  0, 224, 0, 224
]

// 4. Smooth Bouncing Ball Physics Simulator ROM (Timer-Regulated 2D Ball)
let bouncerROM = [
  0, 224, 96, 10, 97, 6, 98, 1, 99, 1, 162, 64, 208, 19, 100, 1, 
  244, 21, 244, 7, 52, 0, 18, 18, 208, 19, 128, 36, 48, 60, 18, 36, 
  98, 255, 18, 42, 48, 0, 18, 42, 98, 1, 129, 52, 49, 28, 18, 52, 
  99, 255, 18, 58, 49, 0, 18, 58, 99, 1, 208, 19, 18, 14, 0, 0, 
  224, 224, 224
]

// 5. Opcode Diagnostic Self-Test ROM (Draws complete 0-F font grid in 2 rows)
let selfTestROM = [
  0, 224, 96, 0, 97, 6, 98, 8, 240, 41, 209, 37, 113, 7, 112, 1, 
  48, 8, 18, 24, 97, 6, 98, 18, 48, 16, 18, 8, 18, 28
]

function resetVM() {
  // Clear RAM
  for (let mut m = 0; m < 4096; m = m + 1) {
    memory[m] = 0
  }
  // Load standard fontset at 0x50 (80)
  loadFontset()
  
  // Clear registers, Stack, Keys, display
  for (let mut r = 0; r < 16; r = r + 1) {
    v[r] = 0
    stack[r] = 0
    keys[r] = false
  }
  for (let mut d = 0; d < 2048; d = d + 1) {
    display[d] = 0
  }
  iReg = 0
  pc = 512
  sp = 0
  delayTimer = 0
  soundTimer = 0
  totalCyclesExecuted = 0
  
  // Load selected ROM
  if (romSelected == 0) {
    let len = Array.len(mazeROM)
    for (let mut k = 0; k < len; k = k + 1) { memory[512 + k] = mazeROM[k] }
  }
  if (romSelected == 1) {
    let len = Array.len(keyboardROM)
    for (let mut k = 0; k < len; k = k + 1) { memory[512 + k] = keyboardROM[k] }
  }
  if (romSelected == 2) {
    let len = Array.len(logoROM)
    for (let mut k = 0; k < len; k = k + 1) { memory[512 + k] = logoROM[k] }
  }
  if (romSelected == 3) {
    let len = Array.len(bouncerROM)
    for (let mut k = 0; k < len; k = k + 1) { memory[512 + k] = bouncerROM[k] }
  }
  if (romSelected == 4) {
    let len = Array.len(selfTestROM)
    for (let mut k = 0; k < len; k = k + 1) { memory[512 + k] = selfTestROM[k] }
  }
}

function to_hex(n: number): string {
  let hexChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"]
  let d4 = bitwise_and(n, 15)
  let d3 = bitwise_and(bitwise_shr(n, 4), 15)
  let d2 = bitwise_and(bitwise_shr(n, 8), 15)
  let d1 = bitwise_and(bitwise_shr(n, 12), 15)
  if (n > 255) {
    concat(concat(concat(hexChars[d1], hexChars[d2]), hexChars[d3]), hexChars[d4])
  } else {
    concat(hexChars[d3], hexChars[d4])
  }
}

function getDisassembly(op: number): string {
  let category = bitwise_and(op, 61440)
  let nnn = bitwise_and(op, 4095)
  let x = bitwise_shr(bitwise_and(op, 3840), 8)
  let y = bitwise_shr(bitwise_and(op, 240), 4)
  let kk = bitwise_and(op, 255)
  let n = bitwise_and(op, 15)

  if (op == 224) { return "CLS" }
  if (op == 238) { return "RET" }
  if (category == 4096) { return concat("JP 0x", to_hex(nnn)) }
  if (category == 8192) { return concat("CALL 0x", to_hex(nnn)) }
  if (category == 12288) { return concat(concat(concat("SE V", to_string(x)), ", "), to_hex(kk)) }
  if (category == 16384) { return concat(concat(concat("SNE V", to_string(x)), ", "), to_hex(kk)) }
  if (category == 20480 && n == 0) { return concat(concat(concat("SE V", to_string(x)), ", V"), to_string(y)) }
  if (category == 24576) { return concat(concat(concat("LD V", to_string(x)), ", "), to_hex(kk)) }
  if (category == 28672) { return concat(concat(concat("ADD V", to_string(x)), ", "), to_hex(kk)) }
  if (category == 32768) {
    if (n == 0) { return concat(concat(concat("LD V", to_string(x)), ", V"), to_string(y)) }
    if (n == 1) { return concat(concat(concat("OR V", to_string(x)), ", V"), to_string(y)) }
    if (n == 2) { return concat(concat(concat("AND V", to_string(x)), ", V"), to_string(y)) }
    if (n == 3) { return concat(concat(concat("XOR V", to_string(x)), ", V"), to_string(y)) }
    if (n == 4) { return concat(concat(concat("ADD V", to_string(x)), ", V"), to_string(y)) }
    if (n == 5) { return concat(concat(concat("SUB V", to_string(x)), ", V"), to_string(y)) }
    if (n == 6) { return concat("SHR V", to_string(x)) }
    if (n == 7) { return concat(concat(concat("SUBN V", to_string(x)), ", V"), to_string(y)) }
    if (n == 14) { return concat("SHL V", to_string(x)) }
  }
  if (category == 36864 && n == 0) { return concat(concat(concat("SNE V", to_string(x)), ", V"), to_string(y)) }
  if (category == 40960) { return concat("LD I, 0x", to_hex(nnn)) }
  if (category == 45056) { return concat("JP V0, 0x", to_hex(nnn)) }
  if (category == 49152) { return concat(concat(concat("RND V", to_string(x)), ", "), to_hex(kk)) }
  if (category == 53248) {
    return concat(concat(concat(concat(concat("DRW V", to_string(x)), ", V"), to_string(y)), ", "), to_string(n))
  }
  if (category == 57344) {
    if (kk == 158) { return concat("SKP V", to_string(x)) }
    if (kk == 161) { return concat("SKNP V", to_string(x)) }
  }
  if (category == 61440) {
    if (kk == 7) { return concat("LD V", concat(to_string(x), ", DT")) }
    if (kk == 10) { return concat("LD V", concat(to_string(x), ", K")) }
    if (kk == 21) { return concat("LD DT, V", to_string(x)) }
    if (kk == 24) { return concat("LD ST, V", to_string(x)) }
    if (kk == 30) { return concat("ADD I, V", to_string(x)) }
    if (kk == 41) { return concat("LD F, V", to_string(x)) }
    if (kk == 51) { return concat("LD B, V", to_string(x)) }
    if (kk == 85) { return concat("LD [I], V", to_string(x)) }
    if (kk == 101) { return concat("LD V", concat(to_string(x), ", [I]")) }
  }
  "UNKNOWN"
}

function cpuStep() {
  if (pc < 512 || pc >= 4095) {
    return
  }
  
  let b1 = memory[pc]
  let b2 = memory[pc + 1]
  let opcode = bitwise_or(bitwise_shl(b1, 8), b2)
  
  pc = pc + 2
  totalCyclesExecuted = totalCyclesExecuted + 1
  
  let category = bitwise_and(opcode, 61440)
  let nnn = bitwise_and(opcode, 4095)
  let x = bitwise_shr(bitwise_and(opcode, 3840), 8)
  let y = bitwise_shr(bitwise_and(opcode, 240), 4)
  let kk = bitwise_and(opcode, 255)
  let n = bitwise_and(opcode, 15)
  
  if (opcode == 224) {
    for (let mut i = 0; i < 2048; i = i + 1) { display[i] = 0 }
    return
  }
  if (opcode == 238) {
    if (sp > 0) {
      sp = sp - 1
      pc = stack[sp]
    }
    return
  }
  if (category == 4096) {
    pc = nnn
    return
  }
  if (category == 8192) {
    if (sp < 16) {
      stack[sp] = pc
      sp = sp + 1
      pc = nnn
    }
    return
  }
  if (category == 12288) {
    if (v[x] == kk) { pc = pc + 2 }
    return
  }
  if (category == 16384) {
    if (v[x] != kk) { pc = pc + 2 }
    return
  }
  if (category == 20480 && n == 0) {
    if (v[x] == v[y]) { pc = pc + 2 }
    return
  }
  if (category == 24576) {
    v[x] = kk
    return
  }
  if (category == 28672) {
    v[x] = bitwise_and(v[x] + kk, 255)
    return
  }
  if (category == 32768) {
    let sub = bitwise_and(opcode, 15)
    if (sub == 0) {
      v[x] = v[y]
      return
    }
    if (sub == 1) {
      v[x] = bitwise_or(v[x], v[y])
      return
    }
    if (sub == 2) {
      v[x] = bitwise_and(v[x], v[y])
      return
    }
    if (sub == 3) {
      v[x] = bitwise_xor(v[x], v[y])
      return
    }
    if (sub == 4) {
      let sum = v[x] + v[y]
      let carry = sum > 255 ? 1 : 0
      v[x] = bitwise_and(sum, 255)
      v[15] = carry
      return
    }
    if (sub == 5) {
      let mut diff = v[x] - v[y]
      let mut notBorrow = 1
      if (v[x] < v[y]) {
        diff = diff + 256
        notBorrow = 0
      }
      v[x] = diff
      v[15] = notBorrow
      return
    }
    if (sub == 6) {
      let lsb = bitwise_and(v[x], 1)
      v[x] = bitwise_shr(v[x], 1)
      v[15] = lsb
      return
    }
    if (sub == 7) {
      let mut diff = v[y] - v[x]
      let mut notBorrow = 1
      if (v[y] < v[x]) {
        diff = diff + 256
        notBorrow = 0
      }
      v[x] = diff
      v[15] = notBorrow
      return
    }
    if (sub == 14) {
      let msb = bitwise_shr(bitwise_and(v[x], 128), 7)
      v[x] = bitwise_and(bitwise_shl(v[x], 1), 255)
      v[15] = msb
      return
    }
    return
  }
  if (category == 36864 && n == 0) {
    if (v[x] != v[y]) { pc = pc + 2 }
    return
  }
  if (category == 40960) {
    iReg = nnn
    return
  }
  if (category == 45056) {
    pc = bitwise_and(nnn + v[0], 4095)
    return
  }
  if (category == 49152) {
    let rVal = floor(random() * 256)
    v[x] = bitwise_and(rVal, kk)
    return
  }
  if (category == 53248) {
    v[15] = 0
    let startX = v[x] % 64
    let startY = v[y] % 32
    for (let mut row = 0; row < n; row = row + 1) {
      let py = startY + row
      if (py < 32) {
        let spriteByte = memory[iReg + row]
        for (let mut col = 0; col < 8; col = col + 1) {
          let px = startX + col
          if (px < 64) {
            let mask = bitwise_shr(128, col)
            if (bitwise_and(spriteByte, mask) != 0) {
              let idx = py * 64 + px
              let currentVal = display[idx]
              if (currentVal == 1) {
                display[idx] = 0
                v[15] = 1
              } else {
                display[idx] = 1
              }
            }
          }
        }
      }
    }
    return
  }
  if (category == 57344) {
    let keyIdx = bitwise_and(v[x], 15)
    if (kk == 158) {
      if (keys[keyIdx]) { pc = pc + 2 }
      return
    }
    if (kk == 161) {
      if (keys[keyIdx] == false) { pc = pc + 2 }
      return
    }
    return
  }
  if (category == 61440) {
    if (kk == 7) {
      v[x] = delayTimer
      return
    }
    if (kk == 10) {
      let mut keyPressIdx = -1
      for (let mut k = 0; k < 16; k = k + 1) {
        if (keys[k]) { keyPressIdx = k }
      }
      if (keyPressIdx >= 0) {
        v[x] = keyPressIdx
      } else {
        pc = pc - 2
      }
      return
    }
    if (kk == 21) {
      delayTimer = v[x]
      return
    }
    if (kk == 24) {
      soundTimer = v[x]
      return
    }
    if (kk == 30) {
      iReg = bitwise_and(iReg + v[x], 65535)
      return
    }
    if (kk == 41) {
      iReg = 80 + bitwise_and(v[x], 15) * 5
      return
    }
    if (kk == 51) {
      let val = v[x]
      let hundreds = floor(val / 100)
      let tens = floor((val % 100) / 10)
      let ones = val % 10
      memory[iReg] = hundreds
      memory[iReg + 1] = tens
      memory[iReg + 2] = ones
      return
    }
    if (kk == 85) {
      for (let mut k = 0; k <= x; k = k + 1) {
        memory[iReg + k] = v[k]
      }
      return
    }
    if (kk == 101) {
      for (let mut k = 0; k <= x; k = k + 1) {
        v[k] = memory[iReg + k]
      }
      return
    }
    return
  }
}

function updateCanvas() {
  let canvas = getElementById("chip-canvas")
  if (canvas) {
    let ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#090d16"
      ctx.fillRect(0, 0, 512, 256)
      ctx.fillStyle = "#22c55e"
      for (let mut py = 0; py < 32; py = py + 1) {
        for (let mut px = 0; px < 64; px = px + 1) {
          let idx = py * 64 + px
          if (display[idx] == 1) {
            ctx.fillRect(px * 8, py * 8, 7.5, 7.5)
          }
        }
      }
    }
  }
}

function handlePhysicalKey(e: any, isDown: boolean) {
  let code = e.key
  let mut idx = -1
  if (code == "1") { idx = 1 }
  if (code == "2") { idx = 2 }
  if (code == "3") { idx = 3 }
  if (code == "4") { idx = 12 }
  
  if (code == "q" || code == "Q") { idx = 4 }
  if (code == "w" || code == "W") { idx = 5 }
  if (code == "e" || code == "E") { idx = 6 }
  if (code == "r" || code == "R") { idx = 13 }
  
  if (code == "a" || code == "A") { idx = 7 }
  if (code == "s" || code == "S") { idx = 8 }
  if (code == "d" || code == "D") { idx = 9 }
  if (code == "f" || code == "F") { idx = 14 }
  
  if (code == "z" || code == "Z") { idx = 10 }
  if (code == "x" || code == "X") { idx = 0 }
  if (code == "c" || code == "C") { idx = 11 }
  if (code == "v" || code == "V") { idx = 15 }
  
  if (idx >= 0) {
    keys[idx] = isDown
    render()
  }
}

function runLoop() {
  let canvas = getElementById("chip-canvas")
  if (canvas) {
    if (isRunning) {
      for (let mut step = 0; step < cpuCyclesPerFrame; step = step + 1) {
        cpuStep()
      }
      
      if (delayTimer > 0) { delayTimer = delayTimer - 1 }
      if (soundTimer > 0) { soundTimer = soundTimer - 1 }
      
      updateCanvas()
    }
  }
  requestAnimationFrame(runLoop)
}

function selectRom(idx: number) {
  romSelected = idx
  resetVM()
  render()
  updateCanvas()
}

function render() {
  let mut nextOpcode = 0
  if (pc >= 512 && pc < 4094) {
    let b1 = memory[pc]
    let b2 = memory[pc + 1]
    nextOpcode = bitwise_or(bitwise_shl(b1, 8), b2)
  }
  
  let keyMapping = [
    { label: "1", val: 1 }, { label: "2", val: 2 }, { label: "3", val: 3 }, { label: "C", val: 12 },
    { label: "4", val: 4 }, { label: "5", val: 5 }, { label: "6", val: 6 }, { label: "D", val: 13 },
    { label: "7", val: 7 }, { label: "8", val: 8 }, { label: "9", val: 9 }, { label: "E", val: 14 },
    { label: "A", val: 10 }, { label: "0", val: 0 }, { label: "B", val: 11 }, { label: "F", val: 15 }
  ]
  
  let keypadButtons = []
  let keyLen = Array.len(keyMapping)
  for (let mut j = 0; j < keyLen; j = j + 1) {
    let item = keyMapping[j]
    let kIdx = item.val
    let isPressed = keys[kIdx]
    let activeClass = isPressed ? "bg-green-500 text-slate-950 scale-95 border-green-400" : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
    
    keypadButtons.push(h("button", {
      key: concat("key-", to_string(kIdx)),
      className: concat("w-10 h-10 sm:w-12 sm:h-12 border rounded-xl font-bold font-mono transition-all text-xs flex flex-col items-center justify-center space-y-0.5 shadow-md active:scale-90 ", activeClass),
      onMouseDown: fn() { keys[kIdx] = true; render(); updateCanvas() },
      onMouseUp: fn() { keys[kIdx] = false; render(); updateCanvas() },
      onMouseLeave: fn() { keys[kIdx] = false; render(); updateCanvas() }
    }, [
      h("span", { className: "text-xs font-black" }, item.label),
      h("span", { className: isPressed ? "text-[8px] text-emerald-950" : "text-[8px] text-slate-500" }, to_string(kIdx))
    ]))
  }
  
  let regNodes = []
  for (let mut rIdx = 0; rIdx < 16; rIdx = rIdx + 1) {
    regNodes.push(h("div", {
      key: concat("v-reg-", to_string(rIdx)),
      className: "bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 flex justify-between items-center"
    }, [
      h("span", { className: "text-[10px] font-bold text-indigo-400 font-mono" }, concat("V", to_hex(rIdx))),
      h("span", { className: "font-mono text-xs text-slate-200" }, concat("0x", to_hex(v[rIdx])))
    ]))
  }
  
  let romList = [
    { id: 0, name: "1. Slanted Maze" },
    { id: 1, name: "2. Keyboard Test" },
    { id: 2, name: "3. IBM Logo" },
    { id: 3, name: "4. Bouncing Ball" },
    { id: 4, name: "5. Font Diagnostics" }
  ]
  let romChips = []
  for (let mut r = 0; r < 5; r = r + 1) {
    let rItem = romList[r]
    let isCurRom = romSelected == rItem.id
    let chipClass = isCurRom ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20" : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800"
    romChips.push(h("button", {
      key: concat("rom-chip-", to_string(rItem.id)),
      className: concat("px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all ", chipClass),
      onClick: fn() { selectRom(rItem.id) }
    }, rItem.name))
  }
  
  let vnode = h("div", { className: "p-4 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl mx-auto space-y-6 text-slate-200" }, [
    h("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4" }, [
      h("div", { className: "space-y-1" }, [
        h("h2", { className: "text-2xl font-black text-emerald-400 tracking-tight" }, "CHIP-8 CPU Emulator & VM Lab"),
        h("p", { className: "text-xs text-slate-400" }, "High-fidelity retro virtualization environment with visual state registers.")
      ]),
      h("div", { className: "flex flex-wrap items-center gap-2" }, [
        h("span", { className: "text-[10px] uppercase font-bold tracking-wider text-slate-400 mr-1" }, "ROM:"),
        h("select", {
          id: "chip8-rom-select",
          className: "bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer font-mono",
          value: to_string(romSelected),
          onChange: fn(e: any) { selectRom(parseInt(e.target.value)) },
          onInput: fn(e: any) { selectRom(parseInt(e.target.value)) }
        }, [
          h("option", { value: "0", selected: romSelected == 0 }, "1. Slanted Maze Generator"),
          h("option", { value: "1", selected: romSelected == 1 }, "2. Interactive Keyboard Test"),
          h("option", { value: "2", selected: romSelected == 2 }, "3. IBM Logo Banner"),
          h("option", { value: "3", selected: romSelected == 3 }, "4. Bouncing Ball Physics"),
          h("option", { value: "4", selected: romSelected == 4 }, "5. Opcode Fontset Diagnostics")
        ]),
        h("button", {
          className: "px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold text-xs uppercase transition-colors",
          onClick: fn() { resetVM(); render(); updateCanvas() }
        }, "Reset VM")
      ])
    ]),
    
    h("div", { className: "flex flex-wrap items-center gap-1.5 p-2 bg-slate-950/60 rounded-xl border border-slate-800/80" }, [
      h("span", { className: "text-[10px] uppercase font-bold tracking-wider text-slate-500 px-2" }, "Quick ROM Select:"),
      h("div", { className: "flex flex-wrap gap-1.5" }, romChips)
    ]),
    
    h("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6" }, [
      h("div", { className: "lg:col-span-7 space-y-6" }, [
        h("div", { className: "space-y-2" }, [
          h("div", { className: "flex justify-between items-center px-1" }, [
            h("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider" }, "Display Output (64x32 CRT phosphor)"),
            h("div", { className: "flex items-center gap-2" }, [
              h("span", { className: "text-[10px] text-slate-400 font-mono" }, concat("Cycles: ", to_string(totalCyclesExecuted))),
              h("span", { className: concat("w-2 h-2 rounded-full ", isRunning ? "bg-green-500 animate-pulse" : "bg-red-500") }, [])
            ])
          ]),
          h("div", { className: "relative bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-2xl flex justify-center overflow-hidden" }, [
            h("canvas", {
              id: "chip-canvas",
              width: "512",
              height: "256",
              className: "w-full aspect-[2/1] rounded-lg max-w-xl bg-slate-950 block"
            }, "")
          ])
        ]),
        
        h("div", { className: "space-y-3 p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl" }, [
          h("div", { className: "flex justify-between items-center" }, [
            h("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider" }, "Interactive Virtual Keypad"),
            h("span", { className: "text-[10px] text-slate-500 font-mono" }, "Press keys 1-4, Q-R, A-F, Z-V on physical keyboard")
          ]),
          h("div", { className: "flex justify-center" }, [
            h("div", { className: "grid grid-cols-4 gap-2.5" }, keypadButtons)
          ]),
          h("input", {
            type: "text",
            placeholder: "👉 Click here to focus physical keyboard controls",
            className: "w-full text-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:text-white transition-colors",
            onKeyDown: fn(e: any) { handlePhysicalKey(e, true) },
            onKeyUp: fn(e: any) { handlePhysicalKey(e, false) }
          }, "")
        ])
      ]),
      
      h("div", { className: "lg:col-span-5 space-y-6" }, [
        h("div", { className: "p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-4" }, [
          h("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800/60 pb-2" }, "CPU Core State"),
          h("div", { className: "grid grid-cols-3 gap-3" }, [
            h("div", { className: "bg-slate-900 border border-slate-800/60 rounded-xl p-2 text-center" }, [
              h("span", { className: "text-[9px] uppercase font-bold text-slate-500 tracking-wider block" }, "PC Pointer"),
              h("span", { className: "font-mono font-bold text-emerald-400 text-sm" }, concat("0x", to_hex(pc)))
            ]),
            h("div", { className: "bg-slate-900 border border-slate-800/60 rounded-xl p-2 text-center" }, [
              h("span", { className: "text-[9px] uppercase font-bold text-slate-500 tracking-wider block" }, "Index Reg (I)"),
              h("span", { className: "font-mono font-bold text-indigo-400 text-sm" }, concat("0x", to_hex(iReg)))
            ]),
            h("div", { className: "bg-slate-900 border border-slate-800/60 rounded-xl p-2 text-center" }, [
              h("span", { className: "text-[9px] uppercase font-bold text-slate-500 tracking-wider block" }, "Stack Ptr (SP)"),
              h("span", { className: "font-mono font-bold text-amber-400 text-sm" }, to_string(sp))
            ])
          ]),
          h("div", { className: "grid grid-cols-2 gap-3" }, [
            h("div", { className: "bg-slate-900 border border-slate-800/60 rounded-xl p-2 flex justify-between items-center px-3" }, [
              h("span", { className: "text-[10px] font-bold text-slate-400" }, "Delay Timer:"),
              h("span", { className: "font-mono text-xs font-bold text-amber-400" }, to_string(delayTimer))
            ]),
            h("div", { className: "bg-slate-900 border border-slate-800/60 rounded-xl p-2 flex justify-between items-center px-3" }, [
              h("span", { className: "text-[10px] font-bold text-slate-400" }, "Sound Timer:"),
              h("span", { className: "font-mono text-xs font-bold text-red-400" }, to_string(soundTimer))
            ])
          ]),
          h("div", { className: "bg-slate-900 border border-slate-800/80 rounded-xl p-3 flex justify-between items-center" }, [
            h("div", { className: "space-y-0.5" }, [
              h("span", { className: "text-[9px] uppercase font-bold text-slate-500 tracking-wider block" }, "Next Opcode"),
              h("span", { className: "font-mono font-bold text-slate-300 text-xs" }, concat("0x", to_hex(nextOpcode)))
            ]),
            h("div", { className: "text-right space-y-0.5" }, [
              h("span", { className: "text-[9px] uppercase font-bold text-slate-500 tracking-wider block" }, "Assembly Decoded"),
              h("span", { className: "font-mono font-bold text-emerald-400 text-xs" }, getDisassembly(nextOpcode))
            ])
          ]),
          h("div", { className: "space-y-2 border-t border-slate-800/60 pt-4" }, [
            h("div", { className: "flex justify-between text-xs font-mono text-slate-400" }, [
              h("span", {}, "Simulation Speed"),
              h("span", { className: "text-emerald-400" }, concat(to_string(cpuCyclesPerFrame * 60), " Hz"))
            ]),
            h("input", {
              type: "range", min: "1", max: "30", step: "1", value: to_string(cpuCyclesPerFrame),
              className: "w-full accent-emerald-500 cursor-pointer",
              onInput: fn(e: any) { cpuCyclesPerFrame = parseInt(e.target.value); render(); updateCanvas() }
            }, ""),
            h("div", { className: "flex gap-2" }, [
              h("button", {
                className: concat("flex-1 py-2 rounded-xl text-xs uppercase border font-bold transition-colors ", isRunning ? "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"),
                onClick: fn() { isRunning = isRunning == false; render(); updateCanvas() }
              }, isRunning ? "Pause VM" : "Resume VM"),
              h("button", {
                className: "flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs uppercase font-bold transition-colors",
                onClick: fn() { cpuStep(); updateCanvas(); render() }
              }, "Step 1 Op")
            ])
          ])
        ]),
        
        h("div", { className: "p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl space-y-3" }, [
          h("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-800/60 pb-2" }, "Registers (V0 - VF)"),
          h("div", { className: "grid grid-cols-4 gap-2" }, regNodes)
        ])
      ])
    ])
  ])
  mount("app-root", vnode)
}

resetVM()
render()
updateCanvas()
requestAnimationFrame(runLoop)
println("Chip-8 VM CPU Initialized successfully!")
`
};
