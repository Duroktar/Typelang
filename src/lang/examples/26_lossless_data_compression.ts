import { ExampleProgram } from "./types";

export const example26LosslessDataCompression: ExampleProgram = {
    id: "26",
    name: "26. Lossless Data Compression Lab (Huffman Coding & LZW)",
    title: "26. Lossless Data Compression Lab (Huffman Coding & LZW)",
    description: "Constructs Huffman encoding trees and LZW dictionary tables to compress text data in real-time with priority queues, binary trees, and compression analytics.",
    category: "Algorithms & Data Structures",
    code: `import DOM.{ h, mount, getElementById }

let CANVAS_W = 870
let CANVAS_H = 420

type HuffmanNode = {
  id: number,
  char: string,
  weight: number,
  leftId: number,
  rightId: number
}

type CodeMapEntry = {
  char: string,
  freq: number,
  code: string,
  bits: number
}

type LzwStep = {
  step: number,
  pStr: string,
  cStr: string,
  outputCode: number,
  addedPhrase: string,
  dictCode: number
}

type LzwDictEntry = {
  code: number,
  phrase: string
}

type TreeNodePos = {
  id: number,
  x: number,
  y: number,
  char: string,
  weight: number,
  isLeaf: boolean,
  leftId: number,
  rightId: number
}

let mut inputText = "BEEBBOOP_ALGORITHM_DATA_COMPRESSION"
let mut activeTab = "HUFFMAN"

let mut huffmanNodes: HuffmanNode[] = []
let mut rootNodeId = -1
let mut codeMap: CodeMapEntry[] = []
let mut huffmanBitstream = ""

let mut lzwSteps: LzwStep[] = []
let mut lzwDict: LzwDictEntry[] = []
let mut lzwOutput: number[] = []

function isLeafNode(node: HuffmanNode): boolean {
  node.leftId == -1 && node.rightId == -1
}

function buildHuffmanTree(text: string) {
  huffmanNodes = []
  codeMap = []
  huffmanBitstream = ""

  if (text.length > 0) {
    let mut charCounts: string[] = []
    let mut freqs: number[] = []

    let len = text.length
    for (let mut i = 0; i < len; i = i + 1) {
      let c = text.charAt(i)
      let mut found = false
      for (let mut k = 0; k < charCounts.length; k = k + 1) {
        if (charCounts[k] == c) {
          freqs[k] = freqs[k] + 1
          found = true
        }
      }
      if (!found) {
        charCounts.push(c)
        freqs.push(1)
      }
    }

    let mut nextId = 0
    let mut heapNodes: number[] = []

    for (let mut i = 0; i < charCounts.length; i = i + 1) {
      let nid = nextId
      nextId = nextId + 1
      huffmanNodes.push({
        id: nid,
        char: charCounts[i],
        weight: freqs[i],
        leftId: -1,
        rightId: -1
      })
      heapNodes.push(nid)
    }

    if (heapNodes.length == 1) {
      let nid = nextId
      nextId = nextId + 1
      let childId = heapNodes[0]
      let child = huffmanNodes[childId]
      huffmanNodes.push({
        id: nid,
        char: "",
        weight: child.weight,
        leftId: childId,
        rightId: -1
      })
      rootNodeId = nid
    } else {
      while (heapNodes.length > 1) {
        let mut min1Idx = 0
        for (let mut i = 1; i < heapNodes.length; i = i + 1) {
          let n1 = huffmanNodes[heapNodes[i]]
          let nMin = huffmanNodes[heapNodes[min1Idx]]
          if (n1.weight < nMin.weight) {
            min1Idx = i
          }
        }
        let node1Id = heapNodes[min1Idx]
        heapNodes.splice(min1Idx, 1)

        let mut min2Idx = 0
        for (let mut i = 1; i < heapNodes.length; i = i + 1) {
          let n1 = huffmanNodes[heapNodes[i]]
          let nMin = huffmanNodes[heapNodes[min2Idx]]
          if (n1.weight < nMin.weight) {
            min2Idx = i
          }
        }
        let node2Id = heapNodes[min2Idx]
        heapNodes.splice(min2Idx, 1)

        let n1 = huffmanNodes[node1Id]
        let n2 = huffmanNodes[node2Id]

        let parentId = nextId
        nextId = nextId + 1

        huffmanNodes.push({
          id: parentId,
          char: "",
          weight: n1.weight + n2.weight,
          leftId: node1Id,
          rightId: node2Id
        })

        heapNodes.push(parentId)
      }

      if (heapNodes.length > 0) {
        rootNodeId = heapNodes[0]
      }
    }

    function generateCodes(nodeId: number, currentCode: string) {
      if (nodeId != -1) {
        let mut node = huffmanNodes[0]
        for (let mut i = 0; i < huffmanNodes.length; i = i + 1) {
          if (huffmanNodes[i].id == nodeId) node = huffmanNodes[i]
        }

        if (isLeafNode(node)) {
          codeMap.push({
            char: node.char,
            freq: node.weight,
            code: currentCode.length == 0 ? "0" : currentCode,
            bits: currentCode.length == 0 ? 1 : currentCode.length
          })
        } else {
          generateCodes(node.leftId, concat(currentCode, "0"))
          generateCodes(node.rightId, concat(currentCode, "1"))
        }
      }
    }

    if (rootNodeId != -1) {
      generateCodes(rootNodeId, "")
    }

    let mut bs = ""
    for (let mut i = 0; i < len; i = i + 1) {
      let c = text.charAt(i)
      let mut code = ""
      for (let mut k = 0; k < codeMap.length; k = k + 1) {
        if (codeMap[k].char == c) code = codeMap[k].code
      }
      bs = concat(bs, code)
    }
    huffmanBitstream = bs
  } else {
    rootNodeId = -1
  }
}

function runLZW(text: string) {
  lzwSteps = []
  lzwDict = []
  lzwOutput = []

  if (text.length > 0) {
    let mut initialPhrases: string[] = []
    let len = text.length
    for (let mut i = 0; i < len; i = i + 1) {
      let c = text.charAt(i)
      if (!initialPhrases.includes(c)) {
        initialPhrases.push(c)
      }
    }

    let mut nextCode = 256
    for (let mut i = 0; i < initialPhrases.length; i = i + 1) {
      lzwDict.push({
        code: nextCode,
        phrase: initialPhrases[i]
      })
      nextCode = nextCode + 1
    }

    let mut p = text.charAt(0)
    let mut stepNum = 1

    for (let mut i = 1; i < len; i = i + 1) {
      let c = text.charAt(i)
      let pc = concat(p, c)

      let mut pcFoundCode = -1
      for (let mut k = 0; k < lzwDict.length; k = k + 1) {
        if (lzwDict[k].phrase == pc) pcFoundCode = lzwDict[k].code
      }

      if (pcFoundCode != -1) {
        p = pc
      } else {
        let mut pCode = -1
        for (let mut k = 0; k < lzwDict.length; k = k + 1) {
          if (lzwDict[k].phrase == p) pCode = lzwDict[k].code
        }

        let newCode = nextCode
        nextCode = nextCode + 1
        lzwDict.push({
          code: newCode,
          phrase: pc
        })

        lzwOutput.push(pCode)

        lzwSteps.push({
          step: stepNum,
          pStr: p,
          cStr: c,
          outputCode: pCode,
          addedPhrase: pc,
          dictCode: newCode
        })

        stepNum = stepNum + 1
        p = c
      }
    }

    if (p.length > 0) {
      let mut pCode = -1
      for (let mut k = 0; k < lzwDict.length; k = k + 1) {
        if (lzwDict[k].phrase == p) pCode = lzwDict[k].code
      }
      lzwOutput.push(pCode)
      lzwSteps.push({
        step: stepNum,
        pStr: p,
        cStr: "EOF",
        outputCode: pCode,
        addedPhrase: "-",
        dictCode: -1
      })
    }
  }
}

function calculateEntropy(): number {
  let mut entropy = 0.0
  if (inputText.length > 0) {
    let mut total = inputText.length
    for (let mut i = 0; i < codeMap.length; i = i + 1) {
      let p = codeMap[i].freq / total
      if (p > 0.0) {
        let log2p = Math.log(p) / 0.6931471805599453
        entropy = entropy - p * log2p
      }
    }
  }
  entropy
}

function drawHuffmanTreeCanvas() {
  let cvs = getElementById("huffman-canvas")
  if (cvs) {
    if (cvs.width != CANVAS_W) {
      cvs.width = CANVAS_W
      cvs.height = CANVAS_H
    }
    let ctx = cvs.getContext("2d")
    if (ctx) {
      ctx.fillStyle = "#020617"
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

      if (rootNodeId == -1) {
        ctx.fillStyle = "#64748b"
        ctx.font = "14px monospace"
        ctx.textAlign = "center"
        ctx.fillText("Enter text to generate Huffman Binary Tree", CANVAS_W / 2, CANVAS_H / 2)
      } else {
        let mut treePositions: TreeNodePos[] = []

        function layoutTree(nodeId: number, x: number, y: number, spreadX: number) {
          if (nodeId != -1) {
            let mut node = huffmanNodes[0]
            for (let mut i = 0; i < huffmanNodes.length; i = i + 1) {
              if (huffmanNodes[i].id == nodeId) node = huffmanNodes[i]
            }

            let leaf = isLeafNode(node)
            treePositions.push({
              id: node.id,
              x: x,
              y: y,
              char: node.char,
              weight: node.weight,
              isLeaf: leaf,
              leftId: node.leftId,
              rightId: node.rightId
            })

            if (node.leftId != -1) {
              layoutTree(node.leftId, x - spreadX, y + 65, spreadX * 0.52)
            }
            if (node.rightId != -1) {
              layoutTree(node.rightId, x + spreadX, y + 65, spreadX * 0.52)
            }
          }
        }

        layoutTree(rootNodeId, CANVAS_W / 2, 45, CANVAS_W * 0.22)

        for (let mut i = 0; i < treePositions.length; i = i + 1) {
          let parent = treePositions[i]

          if (parent.leftId != -1) {
            let mut child = treePositions[0]
            for (let mut k = 0; k < treePositions.length; k = k + 1) {
              if (treePositions[k].id == parent.leftId) child = treePositions[k]
            }
            ctx.strokeStyle = "rgba(56, 189, 248, 0.5)"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(parent.x, parent.y)
            ctx.lineTo(child.x, child.y)
            ctx.stroke()

            let midX = (parent.x + child.x) / 2
            let midY = (parent.y + child.y) / 2
            ctx.fillStyle = "#0284c7"
            ctx.font = "bold 11px monospace"
            ctx.fillText("0", midX - 8, midY)
          }

          if (parent.rightId != -1) {
            let mut child = treePositions[0]
            for (let mut k = 0; k < treePositions.length; k = k + 1) {
              if (treePositions[k].id == parent.rightId) child = treePositions[k]
            }
            ctx.strokeStyle = "rgba(16, 185, 129, 0.5)"
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(parent.x, parent.y)
            ctx.lineTo(child.x, child.y)
            ctx.stroke()

            let midX = (parent.x + child.x) / 2
            let midY = (parent.y + child.y) / 2
            ctx.fillStyle = "#10b981"
            ctx.font = "bold 11px monospace"
            ctx.fillText("1", midX + 8, midY)
          }
        }

        for (let mut i = 0; i < treePositions.length; i = i + 1) {
          let p = treePositions[i]

          ctx.fillStyle = p.isLeaf ? "#0f172a" : "#1e293b"
          ctx.strokeStyle = p.isLeaf ? "#38bdf8" : "#64748b"
          ctx.lineWidth = 2

          ctx.beginPath()
          ctx.arc(p.x, p.y, p.isLeaf ? 20 : 16, 0, 6.283)
          ctx.fill()
          ctx.stroke()

          if (p.isLeaf) {
            ctx.fillStyle = "#38bdf8"
            ctx.font = "bold 12px monospace"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            let displayChar = p.char == " " ? "␣" : p.char
            ctx.fillText(displayChar, p.x, p.y - 3)

            ctx.fillStyle = "#94a3b8"
            ctx.font = "9px monospace"
            ctx.fillText(to_string(p.weight), p.x, p.y + 9)
          } else {
            ctx.fillStyle = "#e2e8f0"
            ctx.font = "bold 11px monospace"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(to_string(p.weight), p.x, p.y)
          }
        }
      }
    }
  }
}

function updateAnalytics() {
  buildHuffmanTree(inputText)
  runLZW(inputText)
}

function renderUI() {
  let origBits = inputText.length * 8
  let huffBits = huffmanBitstream.length
  let huffRatio = origBits > 0 ? ((1.0 - huffBits / origBits) * 100.0) : 0.0

  let lzwBits = lzwOutput.length * 9
  let lzwRatio = origBits > 0 ? ((1.0 - lzwBits / origBits) * 100.0) : 0.0

  let entropyVal = calculateEntropy()

  let vnode = h("div", { className: "min-h-screen bg-slate-950 text-slate-100 p-4 font-sans space-y-4 max-w-7xl mx-auto" }, [
    h("div", { className: "flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl" }, [
      h("div", { className: "flex items-center space-x-3" }, [
        h("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-cyan-500/20" }, "📦"),
        h("div", {}, [
          h("h1", { className: "text-lg font-black tracking-tight text-white flex items-center gap-2 uppercase italic" }, [
            "TypeLang Lossless Data Compression Lab",
            h("span", { className: "text-[10px] px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold not-italic" }, "Huffman + LZW Engine")
          ]),
          h("p", { className: "text-xs text-slate-400" }, "Priority Queues, Huffman Encoding Binary Trees, LZW Dictionary Generation & Real-Time Analytics")
        ])
      ]),

      h("div", { className: "flex flex-wrap items-center gap-2" }, [
        h("span", { className: "text-slate-400 font-mono text-xs font-bold mr-1" }, "Presets:"),
        h("button", {
          className: "px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs font-bold border border-slate-700 cursor-pointer",
          onClick: fn() { inputText = "BEEBBOOP_ALGORITHM_DATA_COMPRESSION"; updateAnalytics(); renderUI() }
        }, "🐝 BEEBBOOP"),
        h("button", {
          className: "px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 font-mono text-xs font-bold border border-slate-700 cursor-pointer",
          onClick: fn() { inputText = "ABRACADABRA_SIMSALABIM"; updateAnalytics(); renderUI() }
        }, "✨ ABRACADABRA"),
        h("button", {
          className: "px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono text-xs font-bold border border-slate-700 cursor-pointer",
          onClick: fn() { inputText = "TOBEORNOTTOBEORTOBEORNOTTOBE"; updateAnalytics(); renderUI() }
        }, "🎭 TOBEORNOTTOBE"),
        h("button", {
          className: "px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono text-xs font-bold border border-slate-700 cursor-pointer",
          onClick: fn() { inputText = "MISSISSIPPI_RIVER_PATTERN"; updateAnalytics(); renderUI() }
        }, "🌊 MISSISSIPPI")
      ])
    ]),

    h("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs" }, [
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "Uncompressed Size"),
        h("div", { className: "text-lg font-bold text-slate-200" }, concat(to_string(origBits), " bits")),
        h("div", { className: "text-[10px] text-slate-500" }, concat(to_string(inputText.length), " ASCII chars @ 8b/c"))
      ]),
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "Huffman Compressed"),
        h("div", { className: "text-lg font-bold text-cyan-400" }, concat(to_string(huffBits), " bits")),
        h("div", { className: "text-[10px] text-emerald-400 font-bold" }, concat("Savings: ", concat(to_string(Math.round(huffRatio)), "%")))
      ]),
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "LZW Compressed"),
        h("div", { className: "text-lg font-bold text-emerald-400" }, concat(to_string(lzwBits), " bits")),
        h("div", { className: "text-[10px] text-emerald-400 font-bold" }, concat(to_string(lzwOutput.length), " tokens @ 9b"))
      ]),
      h("div", { className: "p-3 bg-slate-900/80 rounded-xl border border-slate-800" }, [
        h("div", { className: "text-slate-500 text-[10px] uppercase font-bold" }, "Shannon Entropy (H)"),
        h("div", { className: "text-lg font-bold text-indigo-400" }, concat(to_string(Math.round(entropyVal * 100) / 100), " b/sym")),
        h("div", { className: "text-[10px] text-slate-500" }, "Theoretical Minimum Limit")
      ])
    ]),

    h("div", { className: "p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 font-mono text-xs" }, [
      h("div", { className: "flex justify-between items-center" }, [
        h("div", { className: "text-[10px] uppercase font-bold text-slate-400" }, "Input Text Stream for Compression"),
        h("div", { className: "text-slate-500 text-[10px]" }, concat("Unique Chars: ", to_string(codeMap.length)))
      ]),
      h("input", {
        type: "text",
        value: inputText,
        className: "w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-bold font-mono focus:outline-none focus:border-cyan-500 text-sm",
        onInput: fn(e: any) {
          inputText = e.target.value
          updateAnalytics()
          renderUI()
        }
      }, "")
    ]),

    h("div", { className: "flex space-x-2 border-b border-slate-800 pb-2" }, [
      h("button", {
        className: activeTab == "HUFFMAN" ? "px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold text-xs font-mono cursor-pointer" : "px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:bg-slate-800 text-xs font-mono cursor-pointer",
        onClick: fn() { activeTab = "HUFFMAN"; renderUI() }
      }, "🌳 Huffman Binary Tree & Code Map"),
      h("button", {
        className: activeTab == "LZW" ? "px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-xs font-mono cursor-pointer" : "px-4 py-2 rounded-xl bg-slate-900 text-slate-400 hover:bg-slate-800 text-xs font-mono cursor-pointer",
        onClick: fn() { activeTab = "LZW"; renderUI() }
      }, "📖 LZW Dictionary & Execution Trace")
    ]),

    activeTab == "HUFFMAN" ? h("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4" }, [
      h("div", { className: "lg:col-span-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-2" }, [
        h("div", { className: "w-full flex justify-between items-center px-2 text-xs font-mono" }, [
          h("span", { className: "font-bold text-slate-300" }, "Huffman Encoding Tree"),
          h("span", { className: "text-slate-500 text-[10px]" }, "Left = 0 (Cyan) | Right = 1 (Emerald)")
        ]),
        h("canvas", { id: "huffman-canvas", width: CANVAS_W, height: CANVAS_H, className: "rounded-xl border border-slate-800 bg-slate-950 w-full" }, "")
      ]),

      h("div", { className: "space-y-4 font-mono text-xs" }, [
        h("div", { className: "bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-2 max-h-[280px] overflow-y-auto" }, [
          h("div", { className: "text-[10px] uppercase font-bold text-slate-400" }, "Character Code Dictionary"),
          h("table", { className: "w-full text-left text-xs" }, [
            h("thead", { className: "text-[10px] text-slate-500 uppercase border-b border-slate-800" }, [
              h("tr", {}, [
                h("th", { className: "pb-1" }, "Char"),
                h("th", { className: "pb-1" }, "Freq"),
                h("th", { className: "pb-1" }, "Code"),
                h("th", { className: "pb-1" }, "Bits")
              ])
            ]),
            h("tbody", { className: "divide-y divide-slate-800/50" }, 
              codeMap.map(fn(entry: CodeMapEntry) {
                h("tr", { key: entry.char }, [
                  h("td", { className: "py-1 font-bold text-cyan-400" }, entry.char == " " ? "' '" : entry.char),
                  h("td", { className: "py-1 text-slate-400" }, to_string(entry.freq)),
                  h("td", { className: "py-1 text-emerald-400 font-bold" }, entry.code),
                  h("td", { className: "py-1 text-slate-400" }, to_string(entry.bits))
                ])
              })
            )
          ])
        ]),

        h("div", { className: "bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-2" }, [
          h("div", { className: "text-[10px] uppercase font-bold text-slate-400" }, "Huffman Compressed Bitstream"),
          h("div", { className: "p-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-bold break-all max-h-[120px] overflow-y-auto text-[11px] leading-relaxed" }, 
            huffmanBitstream.length > 0 ? huffmanBitstream : "No data"
          )
        ])
      ])
    ]) : h("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4 font-mono text-xs" }, [
      h("div", { className: "lg:col-span-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-2 max-h-[460px] overflow-y-auto" }, [
        h("div", { className: "text-[10px] uppercase font-bold text-slate-400" }, "LZW Compression Execution Trace"),
        h("table", { className: "w-full text-left text-xs" }, [
          h("thead", { className: "text-[10px] text-slate-500 uppercase border-b border-slate-800" }, [
            h("tr", {}, [
              h("th", { className: "pb-1" }, "Step"),
              h("th", { className: "pb-1" }, "P (Prefix)"),
              h("th", { className: "pb-1" }, "C (Next)"),
              h("th", { className: "pb-1" }, "Emit Code"),
              h("th", { className: "pb-1" }, "New Dict Phrase")
            ])
          ]),
          h("tbody", { className: "divide-y divide-slate-800/50" }, 
            lzwSteps.map(fn(s: LzwStep) {
              h("tr", { key: to_string(s.step) }, [
                h("td", { className: "py-1 text-slate-500" }, to_string(s.step)),
                h("td", { className: "py-1 text-cyan-400 font-bold" }, s.pStr),
                h("td", { className: "py-1 text-slate-400" }, s.cStr),
                h("td", { className: "py-1 text-emerald-400 font-bold" }, to_string(s.outputCode)),
                h("td", { className: "py-1 text-amber-400" }, s.dictCode != -1 ? concat(concat(s.addedPhrase, " -> #"), to_string(s.dictCode)) : "-")
              ])
            })
          )
        ])
      ]),

      h("div", { className: "space-y-4" }, [
        h("div", { className: "bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-2" }, [
          h("div", { className: "text-[10px] uppercase font-bold text-slate-400" }, "LZW Encoded Token Sequence"),
          h("div", { className: "flex flex-wrap gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800 max-h-[160px] overflow-y-auto" }, 
            lzwOutput.map(fn(token: number) {
              h("span", { key: to_string(token), className: "px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/30" }, to_string(token))
            })
          )
        ]),

        h("div", { className: "bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-2 max-h-[260px] overflow-y-auto" }, [
          h("div", { className: "text-[10px] uppercase font-bold text-slate-400" }, "LZW Generated Dictionary Table"),
          h("table", { className: "w-full text-left text-xs" }, [
            h("thead", { className: "text-[10px] text-slate-500 uppercase border-b border-slate-800" }, [
              h("tr", {}, [
                h("th", { className: "pb-1" }, "Code"),
                h("th", { className: "pb-1" }, "Phrase")
              ])
            ]),
            h("tbody", { className: "divide-y divide-slate-800/50" }, 
              lzwDict.map(fn(d: LzwDictEntry) {
                h("tr", { key: to_string(d.code) }, [
                  h("td", { className: "py-1 text-emerald-400 font-bold" }, to_string(d.code)),
                  h("td", { className: "py-1 text-slate-300 font-mono" }, concat("'", concat(d.phrase, "'")))
                ])
              })
            )
          ])
        ])
      ])
    ])
  ])

  mount("app-root", vnode)
  if (activeTab == "HUFFMAN") {
    drawHuffmanTreeCanvas()
  }
}

updateAnalytics()
renderUI()

println("TypeLang Lossless Data Compression Lab Initialized!")
`
  };
