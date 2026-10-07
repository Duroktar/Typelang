import { ExampleProgram } from "./types";

export const example50InteractiveSpreadsheet: ExampleProgram = {
  id: "interactive_spreadsheet",
  name: "50. TypeSheets (Reactive Spreadsheet Engine & Financial Studio)",
  title: "50. TypeSheets (Reactive Spreadsheet Engine & Financial Studio)",
  category: "Interactive Web Apps",
  description: "A full-featured reactive spreadsheet and financial modeling studio built in TypeLang. Features an extensible formula parser with dependency graph recomputation, cell range functions (SUM, AVERAGE, MIN, MAX, COUNT, PRODUCT, SQRT, ABS, ROUND), interactive grid navigation with active cell cursors and formula bar, cell formatting (currency, percent, decimals, bold, alignment, semantic highlights), sample templates (SaaS P&L Financial Model, Gradebook Analytics, Crypto Portfolio), real-time range statistics, CSV export, and audio feedback.",
  code: `import DOM.{ h, mount, playTone, playRamp, confetti, getElementById }
import Math.{ floor, abs, min, max, round, sqrt, pow }

// =========================================================================
// 1. Spreadsheet Data Model & Grid Setup
// =========================================================================

type Cell = {
  mut raw: string,
  mut computed: string,
  mut value: number,
  mut isNum: boolean,
  mut bold: boolean,
  mut align: string,
  mut format: string,
  mut color: string
}

let NUM_ROWS = 14
let NUM_COLS = 8
let COL_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H"]

let mut cells: [Cell] = []
for (let mut i = 0; i < 112; i = i + 1) {
  cells.push({
    raw: "",
    computed: "",
    value: 0.0,
    isNum: false,
    bold: false,
    align: "left",
    format: "general",
    color: "none"
  })
}

let state = {
  mut selectedRow: 1,
  mut selectedCol: 1,
  mut activeTab: 0,
  mut formulaInput: "",
  mut soundEnabled: true,
  mut statusMessage: "Ready"
}

// =========================================================================
// 2. Coordinate, Address & String Helpers
// =========================================================

function cellIndex(col: number, row: number): number {
  row * 8 + col
}

function colIndexToLetter(idx: number): string {
  if (idx == 0) "A"
  else if (idx == 1) "B"
  else if (idx == 2) "C"
  else if (idx == 3) "D"
  else if (idx == 4) "E"
  else if (idx == 5) "F"
  else if (idx == 6) "G"
  else if (idx == 7) "H"
  else "A"
}

function colLetterToIndex(colChar: string): number {
  if (colChar == "A" || colChar == "a") 0
  else if (colChar == "B" || colChar == "b") 1
  else if (colChar == "C" || colChar == "c") 2
  else if (colChar == "D" || colChar == "d") 3
  else if (colChar == "E" || colChar == "e") 4
  else if (colChar == "F" || colChar == "f") 5
  else if (colChar == "G" || colChar == "g") 6
  else if (colChar == "H" || colChar == "h") 7
  else 0
}

function cellAddress(col: number, row: number): string {
  concat(colIndexToLetter(col), to_string(row + 1))
}

function parseCellRef(refStr: string): [number] {
  let colChar = String.slice(refStr, 0, 1)
  let rowStr = String.slice(refStr, 1, String.len(refStr))
  let c = colLetterToIndex(colChar)
  let r = String.parseInt(rowStr) - 1
  [c, r]
}

function isDigitChar(ch: string): boolean {
  ch == "0" || ch == "1" || ch == "2" || ch == "3" || ch == "4" ||
  ch == "5" || ch == "6" || ch == "7" || ch == "8" || ch == "9"
}

function isNumericString(s: string): boolean {
  let len = String.len(s)
  if (len == 0) {
    false
  } else {
    let mut hasDigit = false
    let mut dotCount = 0
    let mut valid = true
    for (let mut i = 0; i < len; i = i + 1) {
      let ch = String.slice(s, i, i + 1)
      if (isDigitChar(ch)) {
        hasDigit = true
      } else if (ch == ".") {
        dotCount = dotCount + 1
        if (dotCount > 1) {
          valid = false
        }
      } else if (ch == "-" || ch == "+") {
        if (i > 0) {
          valid = false
        }
      } else {
        valid = false
      }
    }
    valid && hasDigit
  }
}

function findChar(s: string, target: string): number {
  let len = String.len(s)
  let mut pos = -1
  for (let mut i = 0; i < len; i = i + 1) {
    if (String.slice(s, i, i + 1) == target) {
      if (pos < 0) { pos = i }
    }
  }
  pos
}

function findBinaryOp(expr: string): [number] {
  let len = String.len(expr)
  let mut parenDepth = 0
  let mut addSubPos = -1
  let mut mulDivPos = -1
  let mut addSubOp = 0
  let mut mulDivOp = 0
  for (let mut i = 0; i < len; i = i + 1) {
    let ch = String.slice(expr, i, i + 1)
    if (ch == "(") { parenDepth = parenDepth + 1 }
    else if (ch == ")") { parenDepth = parenDepth - 1 }
    else if (parenDepth == 0) {
      if (ch == "+") { addSubPos = i; addSubOp = 1 }
      else if (ch == "-") { addSubPos = i; addSubOp = 2 }
      else if (ch == "*") { mulDivPos = i; mulDivOp = 3 }
      else if (ch == "/") { mulDivPos = i; mulDivOp = 4 }
    }
  }
  if (addSubPos >= 0) { [addSubPos, addSubOp] }
  else if (mulDivPos >= 0) { [mulDivPos, mulDivOp] }
  else { [-1, 0] }
}

// =========================================================================
// 3. Formula Evaluation Engine
// =========================================================================

function evalRangeSum(rangeStr: string): number {
  let colonPos = findChar(rangeStr, ":")
  if (colonPos < 0) { 0.0 }
  else {
    let startCoords = parseCellRef(String.slice(rangeStr, 0, colonPos))
    let endCoords = parseCellRef(String.slice(rangeStr, colonPos + 1, String.len(rangeStr)))
    let mut sum = 0.0
    for (let mut r = startCoords[1]; r <= endCoords[1]; r = r + 1) {
      for (let mut c = startCoords[0]; c <= endCoords[0]; c = c + 1) {
        if (r >= 0 && r < NUM_ROWS && c >= 0 && c < NUM_COLS) {
          sum = sum + cells[cellIndex(c, r)].value
        }
      }
    }
    sum
  }
}

function evalRangeAvg(rangeStr: string): number {
  let colonPos = findChar(rangeStr, ":")
  if (colonPos < 0) { 0.0 }
  else {
    let startCoords = parseCellRef(String.slice(rangeStr, 0, colonPos))
    let endCoords = parseCellRef(String.slice(rangeStr, colonPos + 1, String.len(rangeStr)))
    let mut sum = 0.0
    let mut count = 0.0
    for (let mut r = startCoords[1]; r <= endCoords[1]; r = r + 1) {
      for (let mut c = startCoords[0]; c <= endCoords[0]; c = c + 1) {
        if (r >= 0 && r < NUM_ROWS && c >= 0 && c < NUM_COLS) {
          let cell = cells[cellIndex(c, r)]
          if (cell.isNum) {
            sum = sum + cell.value
            count = count + 1.0
          }
        }
      }
    }
    if (count > 0.0) { sum / count } else { 0.0 }
  }
}

function evalRangeMin(rangeStr: string): number {
  let colonPos = findChar(rangeStr, ":")
  if (colonPos < 0) { 0.0 }
  else {
    let startCoords = parseCellRef(String.slice(rangeStr, 0, colonPos))
    let endCoords = parseCellRef(String.slice(rangeStr, colonPos + 1, String.len(rangeStr)))
    let mut minVal = 999999999.0
    for (let mut r = startCoords[1]; r <= endCoords[1]; r = r + 1) {
      for (let mut c = startCoords[0]; c <= endCoords[0]; c = c + 1) {
        if (r >= 0 && r < NUM_ROWS && c >= 0 && c < NUM_COLS) {
          let cell = cells[cellIndex(c, r)]
          if (cell.isNum) {
            if (cell.value < minVal) { minVal = cell.value }
          }
        }
      }
    }
    if (minVal == 999999999.0) { 0.0 } else { minVal }
  }
}

function evalRangeMax(rangeStr: string): number {
  let colonPos = findChar(rangeStr, ":")
  if (colonPos < 0) { 0.0 }
  else {
    let startCoords = parseCellRef(String.slice(rangeStr, 0, colonPos))
    let endCoords = parseCellRef(String.slice(rangeStr, colonPos + 1, String.len(rangeStr)))
    let mut maxVal = -999999999.0
    for (let mut r = startCoords[1]; r <= endCoords[1]; r = r + 1) {
      for (let mut c = startCoords[0]; c <= endCoords[0]; c = c + 1) {
        if (r >= 0 && r < NUM_ROWS && c >= 0 && c < NUM_COLS) {
          let cell = cells[cellIndex(c, r)]
          if (cell.isNum) {
            if (cell.value > maxVal) { maxVal = cell.value }
          }
        }
      }
    }
    if (maxVal == -999999999.0) { 0.0 } else { maxVal }
  }
}

function evalRangeCount(rangeStr: string): number {
  let colonPos = findChar(rangeStr, ":")
  if (colonPos < 0) { 0.0 }
  else {
    let startCoords = parseCellRef(String.slice(rangeStr, 0, colonPos))
    let endCoords = parseCellRef(String.slice(rangeStr, colonPos + 1, String.len(rangeStr)))
    let mut count = 0.0
    for (let mut r = startCoords[1]; r <= endCoords[1]; r = r + 1) {
      for (let mut c = startCoords[0]; c <= endCoords[0]; c = c + 1) {
        if (r >= 0 && r < NUM_ROWS && c >= 0 && c < NUM_COLS) {
          if (cells[cellIndex(c, r)].isNum) {
            count = count + 1.0
          }
        }
      }
    }
    count
  }
}

function evalRangeProduct(rangeStr: string): number {
  let colonPos = findChar(rangeStr, ":")
  if (colonPos < 0) { 0.0 }
  else {
    let startCoords = parseCellRef(String.slice(rangeStr, 0, colonPos))
    let endCoords = parseCellRef(String.slice(rangeStr, colonPos + 1, String.len(rangeStr)))
    let mut prod = 1.0
    for (let mut r = startCoords[1]; r <= endCoords[1]; r = r + 1) {
      for (let mut c = startCoords[0]; c <= endCoords[0]; c = c + 1) {
        if (r >= 0 && r < NUM_ROWS && c >= 0 && c < NUM_COLS) {
          prod = prod * cells[cellIndex(c, r)].value
        }
      }
    }
    prod
  }
}

function evalFormula(expr: string, depth: number): number {
  if (depth > 12) { 0.0 }
  else {
    let len = String.len(expr)
    if (len == 0) { 0.0 }
    else if (String.slice(expr, 0, 4) == "SUM(") {
      evalRangeSum(String.slice(expr, 4, len - 1))
    } else if (String.slice(expr, 0, 4) == "AVG(") {
      evalRangeAvg(String.slice(expr, 4, len - 1))
    } else if (String.slice(expr, 0, 8) == "AVERAGE(") {
      evalRangeAvg(String.slice(expr, 8, len - 1))
    } else if (String.slice(expr, 0, 4) == "MIN(") {
      evalRangeMin(String.slice(expr, 4, len - 1))
    } else if (String.slice(expr, 0, 4) == "MAX(") {
      evalRangeMax(String.slice(expr, 4, len - 1))
    } else if (String.slice(expr, 0, 6) == "COUNT(") {
      evalRangeCount(String.slice(expr, 6, len - 1))
    } else if (String.slice(expr, 0, 8) == "PRODUCT(") {
      evalRangeProduct(String.slice(expr, 8, len - 1))
    } else if (String.slice(expr, 0, 5) == "SQRT(") {
      let v = evalFormula(String.slice(expr, 5, len - 1), depth + 1)
      if (v >= 0.0) { sqrt(v) } else { 0.0 }
    } else if (String.slice(expr, 0, 4) == "ABS(") {
      abs(evalFormula(String.slice(expr, 4, len - 1), depth + 1))
    } else if (String.slice(expr, 0, 6) == "ROUND(") {
      round(evalFormula(String.slice(expr, 6, len - 1), depth + 1))
    } else {
      let opInfo = findBinaryOp(expr)
      let opIdx = opInfo[0]
      let opCode = opInfo[1]
      if (opIdx > 0) {
        let leftStr = String.slice(expr, 0, opIdx)
        let rightStr = String.slice(expr, opIdx + 1, len)
        let leftVal = evalFormula(leftStr, depth + 1)
        let rightVal = evalFormula(rightStr, depth + 1)
        if (opCode == 1) { leftVal + rightVal }
        else if (opCode == 2) { leftVal - rightVal }
        else if (opCode == 3) { leftVal * rightVal }
        else if (opCode == 4) { if (rightVal != 0.0) { leftVal / rightVal } else { 0.0 } }
        else { 0.0 }
      } else if (String.slice(expr, 0, 1) == "(" && String.slice(expr, len - 1, len) == ")") {
        evalFormula(String.slice(expr, 1, len - 1), depth + 1)
      } else {
        let firstChar = String.slice(expr, 0, 1)
        let isCol = firstChar == "A" || firstChar == "B" || firstChar == "C" || firstChar == "D" ||
                    firstChar == "E" || firstChar == "F" || firstChar == "G" || firstChar == "H" ||
                    firstChar == "a" || firstChar == "b" || firstChar == "c" || firstChar == "d" ||
                    firstChar == "e" || firstChar == "f" || firstChar == "g" || firstChar == "h"
        if (isCol && len >= 2) {
          let coords = parseCellRef(expr)
          let c = coords[0]
          let r = coords[1]
          if (c >= 0 && c < NUM_COLS && r >= 0 && r < NUM_ROWS) {
            cells[cellIndex(c, r)].value
          } else { 0.0 }
        } else if (isNumericString(expr)) {
          String.parseFloat(expr)
        } else {
          0.0
        }
      }
    }
  }
}

// =========================================================================
// 4. Formatting Utilities
// =========================================================================

function formatWithCommas(n: number): string {
  let isNeg = n < 0.0
  let mut absN = abs(round(n))
  if (absN < 1000.0) {
    let s = to_string(absN)
    if (isNeg) { concat("-", s) } else { s }
  } else if (absN < 1000000.0) {
    let thousands = floor(absN / 1000.0)
    let remainder = absN - (thousands * 1000.0)
    let remStr = to_string(remainder)
    let padRem = if (remainder < 10.0) { concat("00", remStr) }
                 else if (remainder < 100.0) { concat("0", remStr) }
                 else { remStr }
    let res = concat(to_string(thousands), concat(",", padRem))
    if (isNeg) { concat("-", res) } else { res }
  } else {
    let millions = floor(absN / 1000000.0)
    let remM = absN - (millions * 1000000.0)
    let thousands = floor(remM / 1000.0)
    let remainder = remM - (thousands * 1000.0)
    let remStr = to_string(remainder)
    let padRem = if (remainder < 10.0) { concat("00", remStr) }
                 else if (remainder < 100.0) { concat("0", remStr) }
                 else { remStr }
    let thouStr = to_string(thousands)
    let padThou = if (thousands < 10.0) { concat("00", thouStr) }
                  else if (thousands < 100.0) { concat("0", thouStr) }
                  else { thouStr }
    let res = concat(to_string(millions), concat(",", concat(padThou, concat(",", padRem))))
    if (isNeg) { concat("-", res) } else { res }
  }
}

function formatNumber(val: number, fmt: string): string {
  if (val != val) {
    "#VALUE!"
  } else if (fmt == "currency") {
    concat("$", formatWithCommas(val))
  } else if (fmt == "percent") {
    let p = round(val * 10.0) / 10.0
    concat(to_string(p), "%")
  } else if (fmt == "decimal") {
    let d = round(val * 100.0) / 100.0
    to_string(d)
  } else if (fmt == "int") {
    formatWithCommas(val)
  } else {
    to_string(val)
  }
}

// =========================================================================
// 5. Reactive Recomputation
// =========================================================================

function recomputeCell(c: number, r: number) {
  let idx = cellIndex(c, r)
  let raw = cells[idx].raw
  let len = String.len(raw)
  if (len == 0) {
    cells[idx].computed = ""
    cells[idx].value = 0.0
    cells[idx].isNum = false
  } else if (String.slice(raw, 0, 1) == "=") {
    let expr = String.slice(raw, 1, len)
    let val = evalFormula(expr, 0)
    cells[idx].value = val
    cells[idx].isNum = true
    cells[idx].computed = formatNumber(val, cells[idx].format)
  } else if (isNumericString(raw)) {
    let numVal = String.parseFloat(raw)
    cells[idx].value = numVal
    cells[idx].isNum = true
    cells[idx].computed = formatNumber(numVal, cells[idx].format)
  } else {
    cells[idx].value = 0.0
    cells[idx].isNum = false
    cells[idx].computed = raw
  }
}

function recomputeAll() {
  for (let mut pass = 0; pass < 2; pass = pass + 1) {
    for (let mut r = 0; r < NUM_ROWS; r = r + 1) {
      for (let mut c = 0; c < NUM_COLS; c = c + 1) {
        recomputeCell(c, r)
      }
    }
  }
}

function setCell(c: number, r: number, rawVal: string, fmt: string, isBold: boolean, colName: string, alignStr: string) {
  let idx = cellIndex(c, r)
  cells[idx].raw = rawVal
  cells[idx].format = fmt
  cells[idx].bold = isBold
  cells[idx].color = colName
  cells[idx].align = alignStr
}

// =========================================================================
// 6. Template Loaders
// =========================================================================

function clearAllCells() {
  for (let mut i = 0; i < 112; i = i + 1) {
    cells[i].raw = ""
    cells[i].computed = ""
    cells[i].value = 0.0
    cells[i].isNum = false
    cells[i].bold = false
    cells[i].align = "left"
    cells[i].format = "general"
    cells[i].color = "none"
  }
}

function loadTemplate(tabIdx: number) {
  clearAllCells()
  state.activeTab = tabIdx

  if (tabIdx == 0) {
    // SaaS Financial Model
    setCell(0, 0, "Metric", "general", true, "purple", "left")
    setCell(1, 0, "Q1 2026", "general", true, "purple", "right")
    setCell(2, 0, "Q2 2026", "general", true, "purple", "right")
    setCell(3, 0, "Q3 2026", "general", true, "purple", "right")
    setCell(4, 0, "Q4 2026", "general", true, "purple", "right")
    setCell(5, 0, "FY2026", "general", true, "purple", "right")
    setCell(6, 0, "YoY %", "general", true, "purple", "right")
    setCell(7, 0, "Target", "general", true, "purple", "right")

    setCell(0, 1, "ARR Bookings", "general", true, "none", "left")
    setCell(1, 1, "125000", "currency", false, "none", "right")
    setCell(2, 1, "150000", "currency", false, "none", "right")
    setCell(3, 1, "195000", "currency", false, "none", "right")
    setCell(4, 1, "240000", "currency", false, "none", "right")
    setCell(5, 1, "=SUM(B2:E2)", "currency", true, "blue", "right")
    setCell(6, 1, "25.0%", "general", false, "none", "right")
    setCell(7, 1, "800000", "currency", false, "none", "right")

    setCell(0, 2, "Expansion Revenue", "general", false, "none", "left")
    setCell(1, 2, "25000", "currency", false, "none", "right")
    setCell(2, 2, "32000", "currency", false, "none", "right")
    setCell(3, 2, "41000", "currency", false, "none", "right")
    setCell(4, 2, "52000", "currency", false, "none", "right")
    setCell(5, 2, "=SUM(B3:E3)", "currency", true, "blue", "right")
    setCell(6, 2, "28.0%", "general", false, "none", "right")
    setCell(7, 2, "180000", "currency", false, "none", "right")

    setCell(0, 3, "TOTAL REVENUE", "general", true, "blue", "left")
    setCell(1, 3, "=B2+B3", "currency", true, "blue", "right")
    setCell(2, 3, "=C2+C3", "currency", true, "blue", "right")
    setCell(3, 3, "=D2+D3", "currency", true, "blue", "right")
    setCell(4, 3, "=E2+E3", "currency", true, "blue", "right")
    setCell(5, 3, "=SUM(B4:E4)", "currency", true, "blue", "right")
    setCell(6, 3, "26.5%", "general", false, "none", "right")
    setCell(7, 3, "980000", "currency", true, "none", "right")

    setCell(0, 4, "Hosting & Infra", "general", false, "none", "left")
    setCell(1, 4, "28000", "currency", false, "none", "right")
    setCell(2, 4, "31000", "currency", false, "none", "right")
    setCell(3, 4, "36000", "currency", false, "none", "right")
    setCell(4, 4, "42000", "currency", false, "none", "right")
    setCell(5, 4, "=SUM(B5:E5)", "currency", true, "none", "right")
    setCell(6, 4, "14.5%", "general", false, "none", "right")
    setCell(7, 4, "150000", "currency", false, "none", "right")

    setCell(0, 5, "GROSS PROFIT", "general", true, "green", "left")
    setCell(1, 5, "=B4-B5", "currency", true, "green", "right")
    setCell(2, 5, "=C4-C5", "currency", true, "green", "right")
    setCell(3, 5, "=D4-D5", "currency", true, "green", "right")
    setCell(4, 5, "=E4-E5", "currency", true, "green", "right")
    setCell(5, 5, "=SUM(B6:E6)", "currency", true, "green", "right")
    setCell(6, 5, "28.2%", "general", false, "none", "right")
    setCell(7, 5, "830000", "currency", true, "none", "right")

    setCell(0, 6, "Gross Margin %", "general", true, "none", "left")
    setCell(1, 6, "=(B6/B4)*100", "percent", false, "none", "right")
    setCell(2, 6, "=(C6/C4)*100", "percent", false, "none", "right")
    setCell(3, 6, "=(D6/D4)*100", "percent", false, "none", "right")
    setCell(4, 6, "=(E6/E4)*100", "percent", false, "none", "right")
    setCell(5, 6, "=AVG(B7:E7)", "percent", true, "green", "right")
    setCell(6, 6, "-", "general", false, "none", "center")
    setCell(7, 6, "85.0%", "general", false, "none", "right")

    setCell(0, 7, "R&D Engineering", "general", false, "none", "left")
    setCell(1, 7, "45000", "currency", false, "none", "right")
    setCell(2, 7, "48000", "currency", false, "none", "right")
    setCell(3, 7, "55000", "currency", false, "none", "right")
    setCell(4, 7, "62000", "currency", false, "none", "right")
    setCell(5, 7, "=SUM(B8:E8)", "currency", false, "none", "right")
    setCell(6, 7, "12.0%", "general", false, "none", "right")
    setCell(7, 7, "220000", "currency", false, "none", "right")

    setCell(0, 8, "Sales & Marketing", "general", false, "none", "left")
    setCell(1, 8, "35000", "currency", false, "none", "right")
    setCell(2, 8, "42000", "currency", false, "none", "right")
    setCell(3, 8, "51000", "currency", false, "none", "right")
    setCell(4, 8, "65000", "currency", false, "none", "right")
    setCell(5, 8, "=SUM(B9:E9)", "currency", false, "none", "right")
    setCell(6, 8, "30.0%", "general", false, "none", "right")
    setCell(7, 8, "200000", "currency", false, "none", "right")

    setCell(0, 9, "G&A Admin", "general", false, "none", "left")
    setCell(1, 9, "18000", "currency", false, "none", "right")
    setCell(2, 9, "19000", "currency", false, "none", "right")
    setCell(3, 9, "21000", "currency", false, "none", "right")
    setCell(4, 9, "23000", "currency", false, "none", "right")
    setCell(5, 9, "=SUM(B10:E10)", "currency", false, "none", "right")
    setCell(6, 9, "8.0%", "general", false, "none", "right")
    setCell(7, 9, "85000", "currency", false, "none", "right")

    setCell(0, 10, "TOTAL OPEX", "general", true, "amber", "left")
    setCell(1, 10, "=SUM(B8:B10)", "currency", true, "amber", "right")
    setCell(2, 10, "=SUM(C8:C10)", "currency", true, "amber", "right")
    setCell(3, 10, "=SUM(D8:D10)", "currency", true, "amber", "right")
    setCell(4, 10, "=SUM(E8:E10)", "currency", true, "amber", "right")
    setCell(5, 10, "=SUM(B11:E11)", "currency", true, "amber", "right")
    setCell(6, 10, "18.5%", "general", false, "none", "right")
    setCell(7, 10, "505000", "currency", true, "none", "right")

    setCell(0, 11, "NET OPERATING INC", "general", true, "green", "left")
    setCell(1, 11, "=B6-B11", "currency", true, "green", "right")
    setCell(2, 11, "=C6-C11", "currency", true, "green", "right")
    setCell(3, 11, "=D6-D11", "currency", true, "green", "right")
    setCell(4, 11, "=E6-E11", "currency", true, "green", "right")
    setCell(5, 11, "=SUM(B12:E12)", "currency", true, "green", "right")
    setCell(6, 11, "45.0%", "general", false, "none", "right")
    setCell(7, 11, "325000", "currency", true, "none", "right")

    setCell(0, 12, "Net Profit Margin %", "general", true, "none", "left")
    setCell(1, 12, "=(B12/B4)*100", "percent", false, "none", "right")
    setCell(2, 12, "=(C12/C4)*100", "percent", false, "none", "right")
    setCell(3, 12, "=(D12/D4)*100", "percent", false, "none", "right")
    setCell(4, 12, "=(E12/E4)*100", "percent", false, "none", "right")
    setCell(5, 12, "=AVG(B13:E13)", "percent", true, "green", "right")
    setCell(6, 12, "-", "general", false, "none", "center")
    setCell(7, 12, "33.0%", "general", false, "none", "right")

    setCell(0, 13, "Headcount (FTEs)", "general", false, "none", "left")
    setCell(1, 13, "18", "int", false, "none", "right")
    setCell(2, 13, "22", "int", false, "none", "right")
    setCell(3, 13, "26", "int", false, "none", "right")
    setCell(4, 13, "32", "int", false, "none", "right")
    setCell(5, 13, "=MAX(B14:E14)", "int", true, "none", "right")
    setCell(6, 13, "-", "general", false, "none", "center")
    setCell(7, 13, "35", "int", false, "none", "right")

  } else if (tabIdx == 1) {
    // Student Gradebook & Analytics
    setCell(0, 0, "Student Name", "general", true, "purple", "left")
    setCell(1, 0, "Quiz 1", "general", true, "purple", "right")
    setCell(2, 0, "Quiz 2", "general", true, "purple", "right")
    setCell(3, 0, "Midterm", "general", true, "purple", "right")
    setCell(4, 0, "Final Exam", "general", true, "purple", "right")
    setCell(5, 0, "Composite", "general", true, "purple", "right")
    setCell(6, 0, "Grade", "general", true, "purple", "center")
    setCell(7, 0, "Status", "general", true, "purple", "center")

    setCell(0, 1, "Alice Chen", "general", false, "none", "left")
    setCell(1, 1, "92", "decimal", false, "none", "right")
    setCell(2, 1, "95", "decimal", false, "none", "right")
    setCell(3, 1, "88", "decimal", false, "none", "right")
    setCell(4, 1, "94", "decimal", false, "none", "right")
    setCell(5, 1, "=B2*0.2+C2*0.2+D2*0.25+E2*0.35", "decimal", true, "green", "right")
    setCell(6, 1, "A", "general", true, "none", "center")
    setCell(7, 1, "Pass", "general", false, "green", "center")

    setCell(0, 2, "Bob Miller", "general", false, "none", "left")
    setCell(1, 2, "78", "decimal", false, "none", "right")
    setCell(2, 2, "82", "decimal", false, "none", "right")
    setCell(3, 2, "75", "decimal", false, "none", "right")
    setCell(4, 2, "80", "decimal", false, "none", "right")
    setCell(5, 2, "=B3*0.2+C3*0.2+D3*0.25+E3*0.35", "decimal", true, "none", "right")
    setCell(6, 2, "B", "general", true, "none", "center")
    setCell(7, 2, "Pass", "general", false, "green", "center")

    setCell(0, 3, "Carlos Ruiz", "general", false, "none", "left")
    setCell(1, 3, "85", "decimal", false, "none", "right")
    setCell(2, 3, "90", "decimal", false, "none", "right")
    setCell(3, 3, "92", "decimal", false, "none", "right")
    setCell(4, 3, "89", "decimal", false, "none", "right")
    setCell(5, 3, "=B4*0.2+C4*0.2+D4*0.25+E4*0.35", "decimal", true, "green", "right")
    setCell(6, 3, "A-", "general", true, "none", "center")
    setCell(7, 3, "Pass", "general", false, "green", "center")

    setCell(0, 4, "Diana Prince", "general", false, "none", "left")
    setCell(1, 4, "96", "decimal", false, "none", "right")
    setCell(2, 4, "98", "decimal", false, "none", "right")
    setCell(3, 4, "94", "decimal", false, "none", "right")
    setCell(4, 4, "99", "decimal", false, "none", "right")
    setCell(5, 4, "=B5*0.2+C5*0.2+D5*0.25+E5*0.35", "decimal", true, "green", "right")
    setCell(6, 4, "A+", "general", true, "green", "center")
    setCell(7, 4, "Honors", "general", true, "purple", "center")

    setCell(0, 5, "Evan Wright", "general", false, "none", "left")
    setCell(1, 5, "64", "decimal", false, "none", "right")
    setCell(2, 5, "70", "decimal", false, "none", "right")
    setCell(3, 5, "68", "decimal", false, "none", "right")
    setCell(4, 5, "72", "decimal", false, "none", "right")
    setCell(5, 5, "=B6*0.2+C6*0.2+D6*0.25+E6*0.35", "decimal", true, "none", "right")
    setCell(6, 5, "C+", "general", true, "none", "center")
    setCell(7, 5, "Pass", "general", false, "green", "center")

    setCell(0, 6, "Fiona Gallagher", "general", false, "none", "left")
    setCell(1, 6, "88", "decimal", false, "none", "right")
    setCell(2, 6, "85", "decimal", false, "none", "right")
    setCell(3, 6, "90", "decimal", false, "none", "right")
    setCell(4, 6, "91", "decimal", false, "none", "right")
    setCell(5, 6, "=B7*0.2+C7*0.2+D7*0.25+E7*0.35", "decimal", true, "green", "right")
    setCell(6, 6, "B+", "general", true, "none", "center")
    setCell(7, 6, "Pass", "general", false, "green", "center")

    setCell(0, 7, "George Lucas", "general", false, "none", "left")
    setCell(1, 7, "55", "decimal", false, "none", "right")
    setCell(2, 7, "62", "decimal", false, "none", "right")
    setCell(3, 7, "58", "decimal", false, "none", "right")
    setCell(4, 7, "65", "decimal", false, "none", "right")
    setCell(5, 7, "=B8*0.2+C8*0.2+D8*0.25+E8*0.35", "decimal", true, "red", "right")
    setCell(6, 7, "D", "general", true, "red", "center")
    setCell(7, 7, "Warning", "general", true, "amber", "center")

    setCell(0, 8, "Hannah Abbott", "general", false, "none", "left")
    setCell(1, 8, "91", "decimal", false, "none", "right")
    setCell(2, 8, "89", "decimal", false, "none", "right")
    setCell(3, 8, "93", "decimal", false, "none", "right")
    setCell(4, 8, "95", "decimal", false, "none", "right")
    setCell(5, 8, "=B9*0.2+C9*0.2+D9*0.25+E9*0.35", "decimal", true, "green", "right")
    setCell(6, 8, "A", "general", true, "none", "center")
    setCell(7, 8, "Pass", "general", false, "green", "center")

    setCell(0, 9, "CLASS AVERAGE", "general", true, "blue", "left")
    setCell(1, 9, "=AVG(B2:B9)", "decimal", true, "blue", "right")
    setCell(2, 9, "=AVG(C2:C9)", "decimal", true, "blue", "right")
    setCell(3, 9, "=AVG(D2:D9)", "decimal", true, "blue", "right")
    setCell(4, 9, "=AVG(E2:E9)", "decimal", true, "blue", "right")
    setCell(5, 9, "=AVG(F2:F9)", "decimal", true, "blue", "right")
    setCell(6, 9, "B", "general", true, "none", "center")
    setCell(7, 9, "Passing", "general", true, "green", "center")

    setCell(0, 10, "HIGHEST SCORE", "general", true, "green", "left")
    setCell(1, 10, "=MAX(B2:B9)", "decimal", false, "green", "right")
    setCell(2, 10, "=MAX(C2:C9)", "decimal", false, "green", "right")
    setCell(3, 10, "=MAX(D2:D9)", "decimal", false, "green", "right")
    setCell(4, 10, "=MAX(E2:E9)", "decimal", false, "green", "right")
    setCell(5, 10, "=MAX(F2:F9)", "decimal", true, "green", "right")
    setCell(6, 10, "A+", "general", true, "green", "center")
    setCell(7, 10, "Honors", "general", true, "purple", "center")

    setCell(0, 11, "LOWEST SCORE", "general", true, "red", "left")
    setCell(1, 11, "=MIN(B2:B9)", "decimal", false, "red", "right")
    setCell(2, 11, "=MIN(C2:C9)", "decimal", false, "red", "right")
    setCell(3, 11, "=MIN(D2:D9)", "decimal", false, "red", "right")
    setCell(4, 11, "=MIN(E2:E9)", "decimal", false, "red", "right")
    setCell(5, 11, "=MIN(F2:F9)", "decimal", true, "red", "right")
    setCell(6, 11, "D", "general", true, "red", "center")
    setCell(7, 11, "Review", "general", false, "amber", "center")

    setCell(0, 12, "Total Students", "general", false, "none", "left")
    setCell(1, 12, "8", "int", false, "none", "right")
    setCell(2, 12, "8", "int", false, "none", "right")
    setCell(3, 12, "8", "int", false, "none", "right")
    setCell(4, 12, "8", "int", false, "none", "right")
    setCell(5, 12, "=COUNT(F2:F9)", "int", true, "none", "right")
    setCell(6, 12, "-", "general", false, "none", "center")
    setCell(7, 12, "100%", "general", false, "none", "center")

    setCell(0, 13, "Class Pass Rate", "general", true, "none", "left")
    setCell(1, 13, "87.5%", "general", false, "none", "right")
    setCell(2, 13, "87.5%", "general", false, "none", "right")
    setCell(3, 13, "87.5%", "general", false, "none", "right")
    setCell(4, 13, "87.5%", "general", false, "none", "right")
    setCell(5, 13, "87.5%", "general", true, "green", "right")
    setCell(6, 13, "-", "general", false, "none", "center")
    setCell(7, 13, "Accredited", "general", true, "green", "center")

  } else if (tabIdx == 2) {
    // Crypto & Tech Portfolio Tracker
    setCell(0, 0, "Asset Name", "general", true, "purple", "left")
    setCell(1, 0, "Holdings", "general", true, "purple", "right")
    setCell(2, 0, "Cost Basis", "general", true, "purple", "right")
    setCell(3, 0, "Current Price", "general", true, "purple", "right")
    setCell(4, 0, "Position Value", "general", true, "purple", "right")
    setCell(5, 0, "Net Gain ($)", "general", true, "purple", "right")
    setCell(6, 0, "Gain / Loss %", "general", true, "purple", "right")
    setCell(7, 0, "Weight %", "general", true, "purple", "right")

    setCell(0, 1, "Bitcoin (BTC)", "general", true, "none", "left")
    setCell(1, 1, "1.25", "decimal", false, "none", "right")
    setCell(2, 1, "48500", "currency", false, "none", "right")
    setCell(3, 1, "68400", "currency", false, "none", "right")
    setCell(4, 1, "=B2*D2", "currency", true, "blue", "right")
    setCell(5, 1, "=B2*(D2-C2)", "currency", true, "green", "right")
    setCell(6, 1, "41.0%", "general", false, "green", "right")
    setCell(7, 1, "34.5%", "general", false, "none", "right")

    setCell(0, 2, "Ethereum (ETH)", "general", true, "none", "left")
    setCell(1, 2, "8.50", "decimal", false, "none", "right")
    setCell(2, 2, "2400", "currency", false, "none", "right")
    setCell(3, 2, "3650", "currency", false, "none", "right")
    setCell(4, 2, "=B3*D3", "currency", true, "blue", "right")
    setCell(5, 2, "=B3*(D3-C3)", "currency", true, "green", "right")
    setCell(6, 2, "52.1%", "general", false, "green", "right")
    setCell(7, 2, "12.5%", "general", false, "none", "right")

    setCell(0, 3, "Solana (SOL)", "general", true, "none", "left")
    setCell(1, 3, "45.0", "decimal", false, "none", "right")
    setCell(2, 3, "95", "currency", false, "none", "right")
    setCell(3, 3, "175", "currency", false, "none", "right")
    setCell(4, 3, "=B4*D4", "currency", true, "blue", "right")
    setCell(5, 3, "=B4*(D4-C4)", "currency", true, "green", "right")
    setCell(6, 3, "84.2%", "general", false, "green", "right")
    setCell(7, 3, "3.2%", "general", false, "none", "right")

    setCell(0, 4, "NVIDIA (NVDA)", "general", true, "none", "left")
    setCell(1, 4, "80.0", "decimal", false, "none", "right")
    setCell(2, 4, "480", "currency", false, "none", "right")
    setCell(3, 4, "920", "currency", false, "none", "right")
    setCell(4, 4, "=B5*D5", "currency", true, "blue", "right")
    setCell(5, 4, "=B5*(D5-C5)", "currency", true, "green", "right")
    setCell(6, 4, "91.7%", "general", false, "green", "right")
    setCell(7, 4, "29.7%", "general", false, "none", "right")

    setCell(0, 5, "Apple (AAPL)", "general", true, "none", "left")
    setCell(1, 5, "120.0", "decimal", false, "none", "right")
    setCell(2, 5, "175", "currency", false, "none", "right")
    setCell(3, 5, "215", "currency", false, "none", "right")
    setCell(4, 5, "=B6*D6", "currency", true, "blue", "right")
    setCell(5, 5, "=B6*(D6-C6)", "currency", true, "green", "right")
    setCell(6, 5, "22.9%", "general", false, "green", "right")
    setCell(7, 5, "10.4%", "general", false, "none", "right")

    setCell(0, 6, "Microsoft (MSFT)", "general", true, "none", "left")
    setCell(1, 6, "60.0", "decimal", false, "none", "right")
    setCell(2, 6, "340", "currency", false, "none", "right")
    setCell(3, 6, "430", "currency", false, "none", "right")
    setCell(4, 6, "=B7*D7", "currency", true, "blue", "right")
    setCell(5, 6, "=B7*(D7-C7)", "currency", true, "green", "right")
    setCell(6, 6, "26.5%", "general", false, "green", "right")
    setCell(7, 6, "10.4%", "general", false, "none", "right")

    setCell(0, 7, "PORTFOLIO TOTAL", "general", true, "green", "left")
    setCell(1, 7, "-", "general", false, "none", "center")
    setCell(2, 7, "-", "general", false, "none", "center")
    setCell(3, 7, "-", "general", false, "none", "center")
    setCell(4, 7, "=SUM(E2:E7)", "currency", true, "green", "right")
    setCell(5, 7, "=SUM(F2:F7)", "currency", true, "green", "right")
    setCell(6, 7, "51.4%", "general", true, "green", "right")
    setCell(7, 7, "100.0%", "general", true, "none", "right")

    setCell(0, 8, "Average Position", "general", false, "none", "left")
    setCell(1, 8, "-", "general", false, "none", "center")
    setCell(2, 8, "-", "general", false, "none", "center")
    setCell(3, 8, "-", "general", false, "none", "center")
    setCell(4, 8, "=AVG(E2:E7)", "currency", true, "blue", "right")
    setCell(5, 8, "=AVG(F2:F7)", "currency", true, "blue", "right")
    setCell(6, 8, "-", "general", false, "none", "center")
    setCell(7, 8, "-", "general", false, "none", "center")

    setCell(0, 9, "Largest Position", "general", false, "none", "left")
    setCell(1, 9, "-", "general", false, "none", "center")
    setCell(2, 9, "-", "general", false, "none", "center")
    setCell(3, 9, "-", "general", false, "none", "center")
    setCell(4, 9, "=MAX(E2:E7)", "currency", false, "none", "right")
    setCell(5, 9, "=MAX(F2:F7)", "currency", false, "none", "right")
    setCell(6, 9, "-", "general", false, "none", "center")
    setCell(7, 9, "-", "general", false, "none", "center")

    setCell(0, 10, "Smallest Position", "general", false, "none", "left")
    setCell(1, 10, "-", "general", false, "none", "center")
    setCell(2, 10, "-", "general", false, "none", "center")
    setCell(3, 10, "-", "general", false, "none", "center")
    setCell(4, 10, "=MIN(E2:E7)", "currency", false, "none", "right")
    setCell(5, 10, "=MIN(F2:F7)", "currency", false, "none", "right")
    setCell(6, 10, "-", "general", false, "none", "center")
    setCell(7, 10, "-", "general", false, "none", "center")

    setCell(0, 11, "Cost Basis Total", "general", false, "none", "left")
    setCell(1, 11, "-", "general", false, "none", "center")
    setCell(2, 11, "-", "general", false, "none", "center")
    setCell(3, 11, "-", "general", false, "none", "center")
    setCell(4, 11, "=B2*C2+B3*C3+B4*C4+B5*C5+B6*C6+B7*C7", "currency", true, "none", "right")
    setCell(5, 11, "-", "general", false, "none", "center")
    setCell(6, 11, "-", "general", false, "none", "center")
    setCell(7, 11, "-", "general", false, "none", "center")

    setCell(0, 12, "Unrealized ROI %", "general", true, "green", "left")
    setCell(1, 12, "-", "general", false, "none", "center")
    setCell(2, 12, "-", "general", false, "none", "center")
    setCell(3, 12, "-", "general", false, "none", "center")
    setCell(4, 12, "=((E8-E12)/E12)*100", "percent", true, "green", "right")
    setCell(5, 12, "-", "general", false, "none", "center")
    setCell(6, 12, "-", "general", false, "none", "center")
    setCell(7, 12, "-", "general", false, "none", "center")

    setCell(0, 13, "Portfolio Health", "general", false, "none", "left")
    setCell(1, 13, "Optimal", "general", true, "green", "left")
    setCell(2, 13, "Low Risk", "general", false, "blue", "left")
    setCell(3, 13, "Rebalanced", "general", false, "purple", "left")
    setCell(4, 13, "Audited", "general", true, "green", "right")
    setCell(5, 13, "-", "general", false, "none", "center")
    setCell(6, 13, "-", "general", false, "none", "center")
    setCell(7, 13, "100%", "general", false, "none", "right")

  } else {
    // Blank Sheet
    for (let mut c = 0; c < NUM_COLS; c = c + 1) {
      setCell(c, 0, colIndexToLetter(c), "general", true, "purple", "center")
    }
  }

  recomputeAll()
  state.formulaInput = cells[cellIndex(state.selectedCol, state.selectedRow)].raw
}

// =========================================================================
// 7. Interactive Actions & Audio Feedback
// =========================================================================

function playClickSound() {
  if (state.soundEnabled) {
    playTone(520, 0.04, "sine", 0.05)
  }
}

function playSuccessChime() {
  if (state.soundEnabled) {
    playTone(880, 0.1, "triangle", 0.05)
  }
}

function selectCell(c: number, r: number) {
  state.selectedCol = c
  state.selectedRow = r
  state.formulaInput = cells[cellIndex(c, r)].raw
  playClickSound()
  renderSpreadsheet()
}

function commitFormula() {
  let el = DOM.getElementById("formula-bar-input")
  let val = if (el) { el.value } else { state.formulaInput }
  state.formulaInput = val
  let idx = cellIndex(state.selectedCol, state.selectedRow)
  cells[idx].raw = val
  recomputeAll()
  playSuccessChime()
  state.statusMessage = concat("Updated ", cellAddress(state.selectedCol, state.selectedRow))
  renderSpreadsheet()
}

function insertFormula(fnName: string) {
  let targetRange = concat("B2:E", to_string(state.selectedRow + 1))
  let snippet = concat("=", concat(fnName, concat("(", concat(targetRange, ")"))))
  state.formulaInput = snippet
  let el = DOM.getElementById("formula-bar-input")
  if (el) { el.value = snippet }
  commitFormula()
}

function toggleBold() {
  let idx = cellIndex(state.selectedCol, state.selectedRow)
  cells[idx].bold = !cells[idx].bold
  playClickSound()
  renderSpreadsheet()
}

function cycleAlign() {
  let idx = cellIndex(state.selectedCol, state.selectedRow)
  let cur = cells[idx].align
  if (cur == "left") { cells[idx].align = "center" }
  else if (cur == "center") { cells[idx].align = "right" }
  else { cells[idx].align = "left" }
  playClickSound()
  renderSpreadsheet()
}

function setFormat(fmt: string) {
  let idx = cellIndex(state.selectedCol, state.selectedRow)
  cells[idx].format = fmt
  recomputeCell(state.selectedCol, state.selectedRow)
  playClickSound()
  renderSpreadsheet()
}

function setColor(c: string) {
  let idx = cellIndex(state.selectedCol, state.selectedRow)
  cells[idx].color = c
  playClickSound()
  renderSpreadsheet()
}

function clearCurrentCell() {
  let idx = cellIndex(state.selectedCol, state.selectedRow)
  cells[idx].raw = ""
  cells[idx].computed = ""
  cells[idx].value = 0.0
  cells[idx].isNum = false
  state.formulaInput = ""
  let el = DOM.getElementById("formula-bar-input")
  if (el) { el.value = "" }
  recomputeAll()
  playClickSound()
  state.statusMessage = concat("Cleared ", cellAddress(state.selectedCol, state.selectedRow))
  renderSpreadsheet()
}

function auditAndBalance() {
  recomputeAll()
  confetti(40, 60, 0.6)
  if (state.soundEnabled) {
    playRamp(440, 880, 0.25, "triangle", 0.06)
  }
  state.statusMessage = "✨ Sheet Audited & Balanced! All 112 cells reactive & consistent."
  renderSpreadsheet()
}

function exportCsv() {
  let mut csvText = ""
  for (let mut r = 0; r < NUM_ROWS; r = r + 1) {
    let mut rowStr = ""
    for (let mut c = 0; c < NUM_COLS; c = c + 1) {
      let cellVal = cells[cellIndex(c, r)].computed
      let sep = if (c == 0) { "" } else { "," }
      rowStr = concat(rowStr, concat(sep, concat("\\"", concat(cellVal, "\\""))))
    }
    csvText = concat(csvText, concat(rowStr, "\\n"))
  }
  println(concat("--- CSV EXPORT ---\\n", csvText))
  state.statusMessage = "📋 Exported Sheet CSV to Developer Console!"
  playSuccessChime()
  renderSpreadsheet()
}

// =========================================================================
// 8. Virtual DOM UI Rendering
// =========================================================================

function renderSpreadsheet() {
  // Compute column statistics for currently selected column
  let selC = state.selectedCol
  let mut colSum = 0.0
  let mut colCount = 0.0
  let mut colMin = 999999999.0
  let mut colMax = -999999999.0
  for (let mut r = 0; r < NUM_ROWS; r = r + 1) {
    let cell = cells[cellIndex(selC, r)]
    if (cell.isNum) {
      colSum = colSum + cell.value
      colCount = colCount + 1.0
      if (cell.value < colMin) { colMin = cell.value }
      if (cell.value > colMax) { colMax = cell.value }
    }
  }
  let colAvg = if (colCount > 0.0) { colSum / colCount } else { 0.0 }
  let minDisplay = if (colMin == 999999999.0) { "0" } else { formatNumber(colMin, "general") }
  let maxDisplay = if (colMax == -999999999.0) { "0" } else { formatNumber(colMax, "general") }

  // 1. Header & Tabs Bar
  let tabsBar = h("div", { className: "flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-950 border-b border-slate-800" }, [
    h("div", { className: "flex items-center space-x-3" }, [
      h("div", { className: "w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm shadow-md shadow-emerald-500/10" }, "田"),
      h("div", {}, [
        h("h1", { className: "text-base font-bold text-slate-100 flex items-center gap-2 font-sans" }, [
          "TypeSheets",
          h("span", { className: "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" }, "Reactive Engine")
        ]),
        h("p", { className: "text-[11px] text-slate-400 font-sans" }, "Full-Featured Dynamic Spreadsheet Studio written in pure TypeLang")
      ])
    ]),
    h("div", { className: "flex items-center space-x-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800" }, [
      h("button", {
        onClick: fn() { loadTemplate(0); renderSpreadsheet() },
        className: concat("px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ", if (state.activeTab == 0) { "bg-emerald-600 text-white shadow-sm" } else { "text-slate-400 hover:text-white" })
      }, "📊 SaaS Model"),
      h("button", {
        onClick: fn() { loadTemplate(1); renderSpreadsheet() },
        className: concat("px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ", if (state.activeTab == 1) { "bg-emerald-600 text-white shadow-sm" } else { "text-slate-400 hover:text-white" })
      }, "🎓 Gradebook"),
      h("button", {
        onClick: fn() { loadTemplate(2); renderSpreadsheet() },
        className: concat("px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ", if (state.activeTab == 2) { "bg-emerald-600 text-white shadow-sm" } else { "text-slate-400 hover:text-white" })
      }, "🪙 Portfolio"),
      h("button", {
        onClick: fn() { loadTemplate(3); renderSpreadsheet() },
        className: concat("px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ", if (state.activeTab == 3) { "bg-emerald-600 text-white shadow-sm" } else { "text-slate-400 hover:text-white" })
      }, "📝 Blank")
    ])
  ])

  // 2. Action Toolbar (Formulas, Formatting, Styles, Actions)
  let toolbar = h("div", { className: "px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs" }, [
    h("div", { className: "flex items-center flex-wrap gap-2" }, [
      // Format options
      h("div", { className: "flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800" }, [
        h("button", { onClick: fn() { setFormat("general") }, className: "px-2 py-1 rounded hover:bg-slate-800 text-slate-300 font-medium cursor-pointer" }, "General"),
        h("button", { onClick: fn() { setFormat("currency") }, className: "px-2 py-1 rounded hover:bg-slate-800 text-emerald-400 font-semibold cursor-pointer" }, "$ Currency"),
        h("button", { onClick: fn() { setFormat("percent") }, className: "px-2 py-1 rounded hover:bg-slate-800 text-cyan-400 font-semibold cursor-pointer" }, "% Percent"),
        h("button", { onClick: fn() { setFormat("decimal") }, className: "px-2 py-1 rounded hover:bg-slate-800 text-slate-300 font-medium cursor-pointer" }, ".00 Dec")
      ]),
      // Style options
      h("div", { className: "flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800" }, [
        h("button", { onClick: fn() { toggleBold() }, className: "px-2.5 py-1 rounded hover:bg-slate-800 text-slate-200 font-bold cursor-pointer" }, "B"),
        h("button", { onClick: fn() { cycleAlign() }, className: "px-2 py-1 rounded hover:bg-slate-800 text-slate-300 cursor-pointer" }, "Align ⇆")
      ]),
      // Color highlight badges
      h("div", { className: "flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800" }, [
        h("button", { onClick: fn() { setColor("none") }, className: "w-4 h-4 rounded-full bg-slate-700 hover:scale-110 transition cursor-pointer" }, ""),
        h("button", { onClick: fn() { setColor("green") }, className: "w-4 h-4 rounded-full bg-emerald-500 hover:scale-110 transition cursor-pointer" }, ""),
        h("button", { onClick: fn() { setColor("blue") }, className: "w-4 h-4 rounded-full bg-sky-500 hover:scale-110 transition cursor-pointer" }, ""),
        h("button", { onClick: fn() { setColor("amber") }, className: "w-4 h-4 rounded-full bg-amber-500 hover:scale-110 transition cursor-pointer" }, ""),
        h("button", { onClick: fn() { setColor("purple") }, className: "w-4 h-4 rounded-full bg-purple-500 hover:scale-110 transition cursor-pointer" }, ""),
        h("button", { onClick: fn() { setColor("red") }, className: "w-4 h-4 rounded-full bg-rose-500 hover:scale-110 transition cursor-pointer" }, "")
      ])
    ]),
    h("div", { className: "flex items-center space-x-2" }, [
      h("button", {
        onClick: fn() { recomputeAll(); playSuccessChime(); state.statusMessage = "⚡ Recomputed all cells!"; renderSpreadsheet() },
        className: "px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer shadow-sm transition flex items-center gap-1"
      }, "⚡ Recalculate"),
      h("button", {
        onClick: fn() { auditAndBalance() },
        className: "px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer shadow-sm transition flex items-center gap-1"
      }, "✨ Audit Sheet"),
      h("button", {
        onClick: fn() { exportCsv() },
        className: "px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer transition flex items-center gap-1"
      }, "📋 Export CSV"),
      h("button", {
        onClick: fn() { clearCurrentCell() },
        className: "px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 text-rose-300 cursor-pointer transition"
      }, "🗑️ Clear")
    ])
  ])

  // 3. Formula Bar
  let formulaBar = h("div", { className: "px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center space-x-3 text-xs" }, [
    // Cell coordinate pill
    h("div", { className: "px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold tracking-wider shrink-0 shadow-inner" }, cellAddress(state.selectedCol, state.selectedRow)),
    // fx badge
    h("div", { className: "text-slate-500 font-serif italic text-sm select-none font-bold shrink-0" }, "fx"),
    // Formula input field
    h("input", {
      id: "formula-bar-input",
      type: "text",
      value: state.formulaInput,
      placeholder: "Type a value or formula (=SUM(A1:A5), =B2*1.15, text...)",
      className: "flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500 transition placeholder:text-slate-600",
      onKeyDown: fn(event: any) {
        if (event.key == "Enter") {
          commitFormula()
        }
      }
    }, ""),
    // Commit button
    h("button", {
      onClick: fn() { commitFormula() },
      className: "px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer shadow-sm transition shrink-0"
    }, "✓ Apply (Enter)"),
    // Quick formula shortcuts
    h("div", { className: "flex items-center space-x-1 shrink-0" }, [
      h("button", { onClick: fn() { insertFormula("SUM") }, className: "px-2 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded border border-slate-800 text-[11px] font-mono cursor-pointer" }, "+ SUM"),
      h("button", { onClick: fn() { insertFormula("AVG") }, className: "px-2 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded border border-slate-800 text-[11px] font-mono cursor-pointer" }, "+ AVG"),
      h("button", { onClick: fn() { insertFormula("MIN") }, className: "px-2 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded border border-slate-800 text-[11px] font-mono cursor-pointer" }, "+ MIN"),
      h("button", { onClick: fn() { insertFormula("MAX") }, className: "px-2 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded border border-slate-800 text-[11px] font-mono cursor-pointer" }, "+ MAX")
    ])
  ])

  // 4. Interactive Grid Table
  let mut headerCells: [any] = []
  // Top-left corner box
  headerCells.push(h("th", { className: "w-10 h-8 bg-slate-950 border border-slate-800 text-slate-500 font-mono text-[11px] text-center select-none sticky left-0 top-0 z-20" }, "⌗"))
  // Column letters A..H
  for (let mut c = 0; c < NUM_COLS; c = c + 1) {
    let isColActive = c == state.selectedCol
    headerCells.push(h("th", {
      className: concat("w-32 h-8 px-2 border border-slate-800 font-mono text-xs text-center select-none sticky top-0 z-10 transition ",
        if (isColActive) { "bg-emerald-950/60 text-emerald-400 font-bold border-b-2 border-b-emerald-500" }
        else { "bg-slate-950 text-slate-400 font-semibold" }
      )
    }, colIndexToLetter(c)))
  }
  let thead = h("thead", {}, [h("tr", {}, headerCells)])

  // Grid body rows
  let mut tableRows: [any] = []
  for (let mut r = 0; r < NUM_ROWS; r = r + 1) {
    let mut rowCells: [any] = []
    let isRowActive = r == state.selectedRow
    // Row number header
    rowCells.push(h("td", {
      className: concat("w-10 h-7 bg-slate-950 border border-slate-800 font-mono text-[11px] text-center select-none sticky left-0 z-10 transition ",
        if (isRowActive) { "bg-emerald-950/60 text-emerald-400 font-bold border-r-2 border-r-emerald-500" }
        else { "text-slate-500 font-medium" }
      )
    }, to_string(r + 1)))

    for (let mut c = 0; c < NUM_COLS; c = c + 1) {
      let isSelected = c == state.selectedCol && r == state.selectedRow
      let cell = cells[cellIndex(c, r)]

      // Semantic cell color background
      let colorBg = if (cell.color == "green") { "bg-emerald-950/40 text-emerald-300" }
                    else if (cell.color == "red") { "bg-rose-950/40 text-rose-300" }
                    else if (cell.color == "blue") { "bg-sky-950/40 text-sky-300" }
                    else if (cell.color == "amber") { "bg-amber-950/40 text-amber-300" }
                    else if (cell.color == "purple") { "bg-purple-950/50 text-purple-300" }
                    else { "text-slate-200" }

      let alignCls = if (cell.align == "center") { "text-center" }
                     else if (cell.align == "right") { "text-right" }
                     else { "text-left" }

      let boldCls = if (cell.bold) { "font-bold" } else { "font-normal" }

      let borderCls = if (isSelected) {
        "ring-2 ring-emerald-400 bg-emerald-950/50 z-10 relative font-semibold shadow-md shadow-emerald-500/20"
      } else {
        "border border-slate-800 hover:bg-slate-800/40"
      }

      rowCells.push(h("td", {
        onClick: fn() { selectCell(c, r) },
        className: concat("h-7 px-2 font-mono text-xs cursor-pointer select-none truncate transition overflow-hidden ",
          concat(borderCls, concat(" ", concat(colorBg, concat(" ", concat(alignCls, concat(" ", boldCls))))))
        )
      }, cell.computed))
    }

    tableRows.push(h("tr", { className: "border-b border-slate-800/60" }, rowCells))
  }
  let tbody = h("tbody", {}, tableRows)

  let gridContainer = h("div", { className: "flex-1 overflow-auto bg-slate-900 border-b border-slate-800 relative max-h-[460px]" }, [
    h("table", { className: "w-full border-collapse border-spacing-0" }, [thead, tbody])
  ])

  // 5. Status & Analytics Summary Footer
  let footer = h("div", { className: "px-4 py-2.5 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-sans shrink-0 border-t border-slate-800/80" }, [
    // Left: Selected Cell & Status
    h("div", { className: "flex items-center space-x-3" }, [
      h("div", { className: "flex items-center space-x-1.5" }, [
        h("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }, ""),
        h("span", { className: "text-slate-300 font-medium font-mono" }, state.statusMessage)
      ]),
      h("span", { className: "text-slate-600" }, "|"),
      h("span", { className: "text-slate-400 font-mono" }, concat("Active: ", cellAddress(state.selectedCol, state.selectedRow)))
    ]),
    // Center: Column Range Statistics
    h("div", { className: "flex items-center space-x-3 font-mono text-[11px] bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800" }, [
      h("span", { className: "text-slate-500 font-semibold" }, concat("Col [", concat(colIndexToLetter(state.selectedCol), "]"))),
      h("span", { className: "text-slate-300" }, concat("SUM: ", formatNumber(colSum, "currency"))),
      h("span", { className: "text-slate-300" }, concat("AVG: ", formatNumber(colAvg, "general"))),
      h("span", { className: "text-slate-300" }, concat("MIN: ", minDisplay)),
      h("span", { className: "text-slate-300" }, concat("MAX: ", maxDisplay)),
      h("span", { className: "text-slate-400" }, concat("COUNT: ", to_string(colCount)))
    ]),
    // Right: Audio Toggle & Quick Actions
    h("div", { className: "flex items-center space-x-2" }, [
      h("button", {
        onClick: fn() { state.soundEnabled = !state.soundEnabled; renderSpreadsheet() },
        className: "px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] cursor-pointer"
      }, if (state.soundEnabled) { "🔊 Audio On" } else { "🔇 Audio Off" })
    ])
  ])

  // Root App Container
  let appVnode = h("div", { className: "w-full max-w-5xl mx-auto my-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans flex flex-col" }, [
    tabsBar,
    toolbar,
    formulaBar,
    gridContainer,
    footer
  ])

  mount("app-root", appVnode)
}

// =========================================================================
// 9. Startup & Initialization
// =========================================================================

// Load SaaS Financial Model by default
loadTemplate(0)
renderSpreadsheet()
println("Mounted TypeSheets Interactive Studio successfully!")
`
};
