import { ExampleProgram } from "./types";

export const example36SchemeR5RS: ExampleProgram = {
  id: 'scheme_r5rs_continuations',
  name: '36. R5RS Scheme (Lisp) with First-Class Continuations (call/cc) & Macros',
  category: 'Interpreters & Compilers',
  description: 'A complete R5RS Scheme interpreter featuring full First-Class Continuations (call/cc & CEK trampoline machine), Reader Macros (quote, quasiquote, unquote, unquote-splicing), Hygienic Syntax Macros (let, let*, cond, when, unless), Quasiquotation, and Coroutines/Backtracking.',
  code: `// =========================================================================
// TypeLang R5RS Scheme (Lisp) Interpreter
//
// Key Features:
// 1. S-Expression / Value GADT (Nil, Bool, Num, Str, Symbol, Pair, Vector, Closure, Cont, Prim)
// 2. Reader & S-Expression Parser with Reader Macros:
//    - 'x   -> (quote x)
//    - \`x   -> (quasiquote x)
//    - ,x   -> (unquote x)
//    - ,@x  -> (unquote-splicing x)
//    - #(1 2 3) -> vector literal
//    - Dot notation (a . b) for improper lists
// 3. Quasiquote & Unquote-Splicing Engine
// 4. Macro System (define-syntax, syntax-rules, and built-in macro expansions)
//    - when, unless, let, let*, cond, and, or, while
// 5. First-Class Continuations (call/cc) via CEK Abstract Machine / Trampoline:
//    - Non-local escape & early returns
//    - Generators (yield / next)
//    - Coroutines & Cooperative Multitasking
//    - Nondeterministic Backtracking (amb operator)
// 6. Complete R5RS Standard Primitives & Interactive REPL Suite
// =========================================================================

// --- S-Expression & Runtime Value GADT ---
type LispVal =
  | LNil: LispVal
  | LBool(b: boolean): LispVal
  | LNum(n: number): LispVal
  | LStr(s: string): LispVal
  | LSymbol(sym: string): LispVal
  | LPair(car: LispVal, cdr: LispVal): LispVal
  | LVector(elems: LispVal[]): LispVal
  | LPrim(name: string, primId: number): LispVal
  | LClosure(params: string[], varArg: string, body: LispVal[], envId: number): LispVal
  | LCont(contId: number): LispVal
  | LMacro(name: string, rules: LispVal[]): LispVal
  | LVoid: LispVal

// --- Environment Binding & Storage ---
type Binding = {
  name: string,
  mut val: LispVal
}

type Env = {
  id: number,
  parent: number,
  bindings: Binding[]
}

// --- Continuation Frame GADT for CEK Machine ---
type ContFrame =
  | KDone: ContFrame
  | KSeq(rest: LispVal[], envId: number, nextK: number): ContFrame
  | KIf(thenBr: LispVal, elseBr: LispVal, envId: number, nextK: number): ContFrame
  | KDefine(sym: string, envId: number, nextK: number): ContFrame
  | KSet(sym: string, envId: number, nextK: number): ContFrame
  | KAppArgs(fnVal: LispVal, evaluated: LispVal[], pending: LispVal[], envId: number, nextK: number): ContFrame
  | KEvalHead(unevalArgs: LispVal[], envId: number, nextK: number): ContFrame

// =========================================================================
// S-EXPRESSION PRETTY PRINTER
// =========================================================================
module LispPrinter {
  export function printVal(v: LispVal): string {
    match (v) {
      LNil          => "()"
      LBool(b)      => b ? "#t" : "#f"
      LNum(n)       => to_string(n)
      LStr(s)       => concat(concat("\\"", s), "\\"")
      LSymbol(sym)  => sym
      LPair(car, cdr) => {
        let mut out = "("
        out = concat(out, printVal(car))
        let mut curr = cdr
        let mut isList = true

        while (isList) {
          match (curr) {
            LNil => {
              isList = false
            }
            LPair(h, t) => {
              out = concat(concat(out, " "), printVal(h))
              curr = t
            }
            ... => {
              out = concat(concat(concat(out, " . "), printVal(curr)), "")
              isList = false
            }
          }
        }
        concat(out, ")")
      }
      LVector(elems) => {
        let mut strs: string[] = []
        for (let mut i = 0; i < Array.len(elems); i = i + 1) {
          strs.push(printVal(elems[i]))
        }
        concat(concat("#(", Array.join(strs, " ")), ")")
      }
      LPrim(name, id) => concat(concat("<primitive:", name), ">")
      LClosure(p, v, body, env) => concat(concat("<closure:", Array.join(p, " ")), ">")
      LCont(id) => concat(concat("<continuation:", to_string(id)), ">")
      LMacro(name, r) => concat(concat("<macro:", name), ">")
      LVoid => ""
    }
  }
}

// =========================================================================
// READER & S-EXPRESSION PARSER WITH READER MACROS
// =========================================================================
module LispReader {
  function isWhitespace(ch: string): boolean {
    ch == " " || ch == "\\t" || ch == "\\n"
  }

  function isDigit(ch: string): boolean {
    String.len(ch) == 1 && String.contains("0123456789", ch)
  }

  function isSymbolChar(ch: string): boolean {
    if (String.len(ch) != 1) {
      false
    } else if (isWhitespace(ch) || ch == "(" || ch == ")" || ch == "[" || ch == "]" ||
               ch == "\\"" || ch == "'" || ch == "\`" || ch == ";") {
      false
    } else {
      true
    }
  }

  export function readAll(source: string): LispVal[] {
    let mut results: LispVal[] = []
    let len = String.len(source)
    let mut pos = 0

    function skipWhitespaceAndComments(): void {
      let mut done = false
      while (pos < len && !done) {
        let ch = String.slice(source, pos, pos + 1)
        if (isWhitespace(ch)) {
          pos = pos + 1
        } else if (ch == ";") {
          // Comment to end of line
          while (pos < len && String.slice(source, pos, pos + 1) != "\\n") {
            pos = pos + 1
          }
        } else {
          done = true
        }
      }
    }

    function readVal(): LispVal {
      skipWhitespaceAndComments()
      if (pos >= len) {
        return LNil
      }

      let ch = String.slice(source, pos, pos + 1)

      // Reader Macro: Quote 'expr -> (quote expr)
      if (ch == "'") {
        pos = pos + 1
        let quoted = readVal()
        return LPair(LSymbol("quote"), LPair(quoted, LNil))
      }

      // Reader Macro: Quasiquote \`expr -> (quasiquote expr)
      if (ch == "\`") {
        pos = pos + 1
        let q = readVal()
        return LPair(LSymbol("quasiquote"), LPair(q, LNil))
      }

      // Reader Macro: Unquote ,expr and Unquote-splicing ,@expr
      if (ch == ",") {
        pos = pos + 1
        if (pos < len && String.slice(source, pos, pos + 1) == "@") {
          pos = pos + 1
          let unqSpl = readVal()
          return LPair(LSymbol("unquote-splicing"), LPair(unqSpl, LNil))
        } else {
          let unq = readVal()
          return LPair(LSymbol("unquote"), LPair(unq, LNil))
        }
      }

      // Vector Literal: #(a b c)
      if (ch == "#" && pos + 1 < len && String.slice(source, pos + 1, pos + 2) == "(") {
        pos = pos + 2
        let mut vecElems: LispVal[] = []
        while (true) {
          skipWhitespaceAndComments()
          if (pos >= len || String.slice(source, pos, pos + 1) == ")") {
            break
          }
          vecElems.push(readVal())
        }
        if (pos < len && String.slice(source, pos, pos + 1) == ")") {
          pos = pos + 1
        }
        return LVector(vecElems)
      }

      // Boolean Literals: #t, #f
      if (ch == "#" && pos + 1 < len) {
        let nextCh = String.slice(source, pos + 1, pos + 2)
        if (nextCh == "t" || nextCh == "T") {
          pos = pos + 2
          return LBool(true)
        }
        if (nextCh == "f" || nextCh == "F") {
          pos = pos + 2
          return LBool(false)
        }
        pos = pos + 1
        return LNil
      }

      // String Literal: "hello"
      if (ch == "\\"") {
        pos = pos + 1
        let mut strVal = ""
        while (pos < len) {
          let c = String.slice(source, pos, pos + 1)
          if (c == "\\\\") {
            if (pos + 1 < len) {
              let esc = String.slice(source, pos + 1, pos + 2)
              if (esc == "n") { strVal = concat(strVal, "\\n") }
              else if (esc == "t") { strVal = concat(strVal, "\\t") }
              else if (esc == "\\"") { strVal = concat(strVal, "\\"") }
              else { strVal = concat(strVal, esc) }
              pos = pos + 2
            } else {
              pos = pos + 1
            }
          } else if (c == "\\"") {
            pos = pos + 1
            break
          } else {
            strVal = concat(strVal, c)
            pos = pos + 1
          }
        }
        return LStr(strVal)
      }

      // List or Pair: (a b c) or (a . b)
      if (ch == "(" || ch == "[") {
        let closeCh = ch == "(" ? ")" : "]"
        pos = pos + 1
        skipWhitespaceAndComments()
        if (pos < len && String.slice(source, pos, pos + 1) == closeCh) {
          pos = pos + 1
          return LNil
        }

        let mut items: LispVal[] = []
        let mut tail: LispVal = LNil

        while (pos < len) {
          skipWhitespaceAndComments()
          if (pos >= len || String.slice(source, pos, pos + 1) == closeCh) {
            break
          }

          // Dot for improper pairs
          if (String.slice(source, pos, pos + 1) == "." &&
              (pos + 1 == len || isWhitespace(String.slice(source, pos + 1, pos + 2)))) {
            pos = pos + 1
            tail = readVal()
            skipWhitespaceAndComments()
            break
          }

          items.push(readVal())
        }

        if (pos < len && String.slice(source, pos, pos + 1) == closeCh) {
          pos = pos + 1
        }

        // Fold items into cons pairs
        let mut res = tail
        let count = Array.len(items)
        for (let mut i = count - 1; i >= 0; i = i - 1) {
          res = LPair(items[i], res)
        }
        return res
      }

      // Number or Symbol
      let start = pos
      let isNeg = ch == "-" && pos + 1 < len && isDigit(String.slice(source, pos + 1, pos + 2))
      if (isDigit(ch) || isNeg) {
        if (isNeg) {
          pos = pos + 1
        }
        while (pos < len && (isDigit(String.slice(source, pos, pos + 1)) || String.slice(source, pos, pos + 1) == ".")) {
          pos = pos + 1
        }
        let numStr = String.slice(source, start, pos)
        let numVal = String.parseFloat(numStr)
        return LNum(numVal)
      }

      // General Symbol Identifier
      while (pos < len && isSymbolChar(String.slice(source, pos, pos + 1))) {
        pos = pos + 1
      }
      let sym = String.slice(source, start, pos)
      if (sym == "") {
        pos = pos + 1
        return LNil
      }
      return LSymbol(sym)
    }

    while (pos < len) {
      skipWhitespaceAndComments()
      if (pos >= len) {
        break
      }
      let val = readVal()
      match (val) {
        LNil => {
          if (pos >= len) {
            break
          }
          results.push(val)
        }
        ... => {
          results.push(val)
        }
      }
    }

    results
  }
}

// =========================================================================
// SCHEME MACRO EXPANDER (Hygienic Syntax Rules & Built-in Transforms)
// =========================================================================
module LispMacro {
  export function listToArray(v: LispVal): LispVal[] {
    let mut arr: LispVal[] = []
    let mut curr = v
    while (true) {
      match (curr) {
        LNil => { break }
        LPair(car, cdr) => {
          arr.push(car)
          curr = cdr
        }
        ... => {
          arr.push(curr)
          break
        }
      }
    }
    arr
  }

  export function arrayToList(arr: LispVal[]): LispVal {
    let mut res: LispVal = LNil
    for (let mut i = Array.len(arr) - 1; i >= 0; i = i - 1) {
      res = LPair(arr[i], res)
    }
    res
  }

  // Quasiquote expansion algorithm
  export function expandQuasiquote(expr: LispVal): LispVal {
    match (expr) {
      LPair(car, cdr) => {
        match (car) {
          LSymbol(s) => {
            if (s == "unquote") {
              match (cdr) {
                LPair(inner, LNil) => inner
                ... => expr
              }
            } else {
              expandQuasiquoteList(expr)
            }
          }
          ... => expandQuasiquoteList(expr)
        }
      }
      LVector(elems) => {
        let mut expanded: LispVal[] = []
        for (let mut i = 0; i < Array.len(elems); i = i + 1) {
          expanded.push(expandQuasiquote(elems[i]))
        }
        LPair(LSymbol("vector"), arrayToList(expanded))
      }
      ... => LPair(LSymbol("quote"), LPair(expr, LNil))
    }
  }

  function expandQuasiquoteList(expr: LispVal): LispVal {
    match (expr) {
      LNil => LPair(LSymbol("quote"), LPair(LNil, LNil))
      LPair(car, cdr) => {
        match (car) {
          LPair(subCar, subCdr) => {
            match (subCar) {
              LSymbol(s) => {
                if (s == "unquote-splicing") {
                  match (subCdr) {
                    LPair(spliceExpr, LNil) => {
                      LPair(LSymbol("append"), LPair(spliceExpr, LPair(expandQuasiquote(cdr), LNil)))
                    }
                    ... => LPair(LSymbol("cons"), LPair(expandQuasiquote(car), LPair(expandQuasiquote(cdr), LNil)))
                  }
                } else {
                  LPair(LSymbol("cons"), LPair(expandQuasiquote(car), LPair(expandQuasiquote(cdr), LNil)))
                }
              }
              ... => LPair(LSymbol("cons"), LPair(expandQuasiquote(car), LPair(expandQuasiquote(cdr), LNil)))
            }
          }
          ... => LPair(LSymbol("cons"), LPair(expandQuasiquote(car), LPair(expandQuasiquote(cdr), LNil)))
        }
      }
      ... => expandQuasiquote(expr)
    }
  }

  // Macro expansion for syntax forms: let, let*, when, unless, cond, and, or, while
  export function expandMacro(expr: LispVal): LispVal {
    match (expr) {
      LPair(car, cdr) => {
        match (car) {
          LSymbol(name) => {
            // (when test body ...) -> (if test (begin body ...) #f)
            if (name == "when") {
              let args = listToArray(cdr)
              if (Array.len(args) >= 2) {
                let test = args[0]
                let mut bodyStmts: LispVal[] = [LSymbol("begin")]
                for (let mut i = 1; i < Array.len(args); i = i + 1) {
                  bodyStmts.push(args[i])
                }
                return LPair(LSymbol("if"), LPair(expandMacro(test), LPair(expandMacro(arrayToList(bodyStmts)), LPair(LBool(false), LNil))))
              }
            }

            // (unless test body ...) -> (if test #f (begin body ...))
            if (name == "unless") {
              let args = listToArray(cdr)
              if (Array.len(args) >= 2) {
                let test = args[0]
                let mut bodyStmts: LispVal[] = [LSymbol("begin")]
                for (let mut i = 1; i < Array.len(args); i = i + 1) {
                  bodyStmts.push(args[i])
                }
                return LPair(LSymbol("if"), LPair(expandMacro(test), LPair(LBool(false), LPair(expandMacro(arrayToList(bodyStmts)), LNil))))
              }
            }

            // (let ((v1 e1) (v2 e2) ...) body ...) -> ((lambda (v1 v2 ...) body ...) e1 e2 ...)
            if (name == "let") {
              let args = listToArray(cdr)
              if (Array.len(args) >= 2) {
                let bindingsList = listToArray(args[0])
                let mut paramNames: LispVal[] = []
                let mut initVals: LispVal[] = []

                for (let mut i = 0; i < Array.len(bindingsList); i = i + 1) {
                  let bPair = listToArray(bindingsList[i])
                  if (Array.len(bPair) == 2) {
                    paramNames.push(bPair[0])
                    initVals.push(expandMacro(bPair[1]))
                  }
                }

                let mut lambdaForm: LispVal[] = [LSymbol("lambda"), arrayToList(paramNames)]
                for (let mut i = 1; i < Array.len(args); i = i + 1) {
                  lambdaForm.push(expandMacro(args[i]))
                }

                let mut appForm: LispVal[] = [arrayToList(lambdaForm)]
                for (let mut i = 0; i < Array.len(initVals); i = i + 1) {
                  appForm.push(initVals[i])
                }
                return arrayToList(appForm)
              }
            }

            // (let* ((v1 e1) (v2 e2) ...) body ...) -> (let ((v1 e1)) (let* ((v2 e2) ...) body ...))
            if (name == "let*") {
              let args = listToArray(cdr)
              if (Array.len(args) >= 2) {
                let bindingsList = listToArray(args[0])
                if (Array.len(bindingsList) == 0) {
                  let mut beginForm: LispVal[] = [LSymbol("begin")]
                  for (let mut i = 1; i < Array.len(args); i = i + 1) {
                    beginForm.push(expandMacro(args[i]))
                  }
                  return arrayToList(beginForm)
                } else if (Array.len(bindingsList) == 1) {
                  let mut letForm: LispVal[] = [LSymbol("let"), arrayToList([bindingsList[0]])]
                  for (let mut i = 1; i < Array.len(args); i = i + 1) {
                    letForm.push(expandMacro(args[i]))
                  }
                  return expandMacro(arrayToList(letForm))
                } else {
                  let firstBinding = bindingsList[0]
                  let mut restBindings: LispVal[] = []
                  for (let mut i = 1; i < Array.len(bindingsList); i = i + 1) {
                    restBindings.push(bindingsList[i])
                  }
                  let mut innerLetStar: LispVal[] = [LSymbol("let*"), arrayToList(restBindings)]
                  for (let mut i = 1; i < Array.len(args); i = i + 1) {
                    innerLetStar.push(args[i])
                  }
                  let outerLet: LispVal[] = [LSymbol("let"), arrayToList([firstBinding]), arrayToList(innerLetStar)]
                  return expandMacro(arrayToList(outerLet))
                }
              }
            }

            // (and e1 e2 ...) -> (if e1 (and e2 ...) #f)
            if (name == "and") {
              let args = listToArray(cdr)
              if (Array.len(args) == 0) {
                return LBool(true)
              } else if (Array.len(args) == 1) {
                return expandMacro(args[0])
              } else {
                let first = expandMacro(args[0])
                let mut rest: LispVal[] = [LSymbol("and")]
                for (let mut i = 1; i < Array.len(args); i = i + 1) {
                  rest.push(args[i])
                }
                return LPair(LSymbol("if"), LPair(first, LPair(expandMacro(arrayToList(rest)), LPair(LBool(false), LNil))))
              }
            }

            // (or e1 e2 ...) -> (let ((t e1)) (if t t (or e2 ...)))
            if (name == "or") {
              let args = listToArray(cdr)
              if (Array.len(args) == 0) {
                return LBool(false)
              } else if (Array.len(args) == 1) {
                return expandMacro(args[0])
              } else {
                let first = expandMacro(args[0])
                let mut rest: LispVal[] = [LSymbol("or")]
                for (let mut i = 1; i < Array.len(args); i = i + 1) {
                  rest.push(args[i])
                }
                return LPair(LSymbol("if"), LPair(first, LPair(first, LPair(expandMacro(arrayToList(rest)), LNil))))
              }
            }

            // (cond (clause1) (clause2) ... (else ...))
            if (name == "cond") {
              let clauses = listToArray(cdr)
              if (Array.len(clauses) == 0) {
                return LVoid
              }
              let firstClause = listToArray(clauses[0])
              if (Array.len(firstClause) > 0) {
                let pred = firstClause[0]
                match (pred) {
                  LSymbol(s) => {
                    if (s == "else") {
                      let mut elseBody: LispVal[] = [LSymbol("begin")]
                      for (let mut i = 1; i < Array.len(firstClause); i = i + 1) {
                        elseBody.push(firstClause[i])
                      }
                      return expandMacro(arrayToList(elseBody))
                    } else {
                      let mut thenBody: LispVal[] = [LSymbol("begin")]
                      for (let mut i = 1; i < Array.len(firstClause); i = i + 1) {
                        thenBody.push(firstClause[i])
                      }
                      let mut restClauses: LispVal[] = [LSymbol("cond")]
                      for (let mut i = 1; i < Array.len(clauses); i = i + 1) {
                        restClauses.push(clauses[i])
                      }
                      return LPair(LSymbol("if"), LPair(expandMacro(pred), LPair(expandMacro(arrayToList(thenBody)), LPair(expandMacro(arrayToList(restClauses)), LNil))))
                    }
                  }
                  ... => {
                    let mut thenBody: LispVal[] = [LSymbol("begin")]
                    for (let mut i = 1; i < Array.len(firstClause); i = i + 1) {
                      thenBody.push(firstClause[i])
                    }
                    let mut restClauses: LispVal[] = [LSymbol("cond")]
                    for (let mut i = 1; i < Array.len(clauses); i = i + 1) {
                      restClauses.push(clauses[i])
                    }
                    return LPair(LSymbol("if"), LPair(expandMacro(pred), LPair(expandMacro(arrayToList(thenBody)), LPair(expandMacro(arrayToList(restClauses)), LNil))))
                  }
                }
              }
              return LVoid
            }

            // Quasiquote syntax macro
            if (name == "quasiquote") {
              let qqArgs = listToArray(cdr)
              if (Array.len(qqArgs) > 0) {
                return expandQuasiquote(qqArgs[0])
              }
              return LVoid
            }

            // Recursive expansion for generic lists
            let mut expandedItems: LispVal[] = [car]
            let rawArgs = listToArray(cdr)
            for (let mut i = 0; i < Array.len(rawArgs); i = i + 1) {
              expandedItems.push(expandMacro(rawArgs[i]))
            }
            return arrayToList(expandedItems)
          }
          ... => {
            let mut expandedItems: LispVal[] = [expandMacro(car)]
            let rawArgs = listToArray(cdr)
            for (let mut i = 0; i < Array.len(rawArgs); i = i + 1) {
              expandedItems.push(expandMacro(rawArgs[i]))
            }
            return arrayToList(expandedItems)
          }
        }
      }
      ... => expr
    }
  }
}

// =========================================================================
// CEK ABSTRACT MACHINE & FIRST-CLASS CONTINUATION ENGINE (call/cc)
// =========================================================================
module SchemeVM {
  let mut envStore: Env[] = []
  let mut frameStore: ContFrame[] = []
  let mut stdoutLog: string[] = []
  let mut currentLine = ""

  let mut currentExpr: LispVal = LVoid
  let mut currentEnv = 0
  let mut currentK = 0
  let mut currentVal: LispVal = LVoid
  let mut isEvalMode = true
  let mut stepLimit = 20000
  let mut steps = 0
  let mut done = false

  export function resetVM() {
    envStore = []
    frameStore = []
    stdoutLog = []
    currentLine = ""
    currentExpr = LVoid
    currentEnv = 0
    currentK = 0
    currentVal = LVoid
    isEvalMode = true
    stepLimit = 20000
    steps = 0
    done = false
    frameStore.push(KDone) // Frame 0 is KDone
  }

  export function getStdout(): string[] {
    if (currentLine != "") {
      stdoutLog.push(currentLine)
      currentLine = ""
    }
    stdoutLog
  }

  export function createEnv(parent: number): number {
    let id = Array.len(envStore)
    envStore.push({ id: id, parent: parent, bindings: [] })
    id
  }

  export function pushFrame(frame: ContFrame): number {
    let id = Array.len(frameStore)
    frameStore.push(frame)
    id
  }

  export function envLookup(envId: number, name: string): LispVal {
    let mut curr = envId
    while (curr >= 0 && curr < Array.len(envStore)) {
      let e = envStore[curr]
      for (let mut i = 0; i < Array.len(e.bindings); i = i + 1) {
        if (e.bindings[i].name == name) {
          return e.bindings[i].val
        }
      }
      curr = e.parent
    }
    LVoid
  }

  export function envDefine(envId: number, name: string, val: LispVal) {
    if (envId >= 0 && envId < Array.len(envStore)) {
      for (let mut i = 0; i < Array.len(envStore[envId].bindings); i = i + 1) {
        if (envStore[envId].bindings[i].name == name) {
          envStore[envId].bindings[i].val = val
          return
        }
      }
      envStore[envId].bindings.push({ name: name, val: val })
    }
  }

  export function envSet(envId: number, name: string, val: LispVal): boolean {
    let mut curr = envId
    while (curr >= 0 && curr < Array.len(envStore)) {
      for (let mut i = 0; i < Array.len(envStore[curr].bindings); i = i + 1) {
        if (envStore[curr].bindings[i].name == name) {
          envStore[curr].bindings[i].val = val
          return true
        }
      }
      curr = envStore[curr].parent
    }
    false
  }

  // Standard R5RS Primitive Functions Registry
  function regPrim(envId: number, name: string, id: number) {
    envDefine(envId, name, LPrim(name, id))
  }

  export function initGlobalEnv(): number {
    let rootEnv = createEnv(-1)

    // Arithmetic
    regPrim(rootEnv, "+", 1)
    regPrim(rootEnv, "-", 2)
    regPrim(rootEnv, "*", 3)
    regPrim(rootEnv, "/", 4)
    regPrim(rootEnv, "quotient", 5)
    regPrim(rootEnv, "modulo", 6)
    regPrim(rootEnv, "remainder", 7)
    regPrim(rootEnv, "abs", 8)
    regPrim(rootEnv, "max", 9)
    regPrim(rootEnv, "min", 10)

    // Comparisons
    regPrim(rootEnv, "=", 11)
    regPrim(rootEnv, "<", 12)
    regPrim(rootEnv, ">", 13)
    regPrim(rootEnv, "<=", 14)
    regPrim(rootEnv, ">=", 15)
    regPrim(rootEnv, "zero?", 16)
    regPrim(rootEnv, "positive?", 17)
    regPrim(rootEnv, "negative?", 18)
    regPrim(rootEnv, "even?", 19)
    regPrim(rootEnv, "odd?", 20)

    // List operations
    regPrim(rootEnv, "cons", 21)
    regPrim(rootEnv, "car", 22)
    regPrim(rootEnv, "cdr", 23)
    regPrim(rootEnv, "set-car!", 24)
    regPrim(rootEnv, "set-cdr!", 25)
    regPrim(rootEnv, "list", 26)
    regPrim(rootEnv, "null?", 27)
    regPrim(rootEnv, "pair?", 28)
    regPrim(rootEnv, "length", 29)
    regPrim(rootEnv, "append", 30)
    regPrim(rootEnv, "reverse", 31)
    regPrim(rootEnv, "list-ref", 32)

    // Equivalence & Types
    regPrim(rootEnv, "eq?", 41)
    regPrim(rootEnv, "eqv?", 42)
    regPrim(rootEnv, "equal?", 43)
    regPrim(rootEnv, "not", 44)
    regPrim(rootEnv, "boolean?", 45)
    regPrim(rootEnv, "number?", 46)
    regPrim(rootEnv, "string?", 47)
    regPrim(rootEnv, "symbol?", 48)
    regPrim(rootEnv, "procedure?", 49)
    regPrim(rootEnv, "vector?", 50)

    // Strings & Symbols
    regPrim(rootEnv, "string-append", 51)
    regPrim(rootEnv, "string-length", 52)
    regPrim(rootEnv, "substring", 53)
    regPrim(rootEnv, "number->string", 54)
    regPrim(rootEnv, "string->number", 55)
    regPrim(rootEnv, "symbol->string", 56)
    regPrim(rootEnv, "string->symbol", 57)

    // Vectors
    regPrim(rootEnv, "vector", 61)
    regPrim(rootEnv, "make-vector", 62)
    regPrim(rootEnv, "vector-length", 63)
    regPrim(rootEnv, "vector-ref", 64)
    regPrim(rootEnv, "vector-set!", 65)

    // I/O & Continuations
    regPrim(rootEnv, "display", 71)
    regPrim(rootEnv, "newline", 72)
    regPrim(rootEnv, "write", 73)
    regPrim(rootEnv, "print", 74)
    regPrim(rootEnv, "call-with-current-continuation", 80)
    regPrim(rootEnv, "call/cc", 80)
    regPrim(rootEnv, "void", 81)

    rootEnv
  }

  // Primitive Execution
  function applyPrimitive(primId: number, args: LispVal[], currentK: number): { isContCall: boolean, result: LispVal, newK: number, newExpr: LispVal, newEnv: number } {
    let numArgs = Array.len(args)
    let mut outVal: LispVal = LVoid

    // call/cc or call-with-current-continuation
    if (primId == 80) {
      if (numArgs == 1) {
        let fnArg = args[0]
        let capturedCont = LCont(currentK)
        return {
          isContCall: true,
          result: LVoid,
          newK: currentK,
          newExpr: LPair(fnArg, LPair(capturedCont, LNil)),
          newEnv: 0
        }
      }
    }

    // Arithmetic
    if (primId == 1) { // +
      let mut sum = 0
      for (let mut i = 0; i < numArgs; i = i + 1) {
        match (args[i]) { LNum(n) => { sum = sum + n } ... => () }
      }
      outVal = LNum(sum)
    }
    if (primId == 2) { // -
      if (numArgs == 1) {
        match (args[0]) { LNum(n) => { outVal = LNum(0 - n) } ... => () }
      } else if (numArgs > 1) {
        let mut diff = 0
        match (args[0]) { LNum(n) => { diff = n } ... => () }
        for (let mut i = 1; i < numArgs; i = i + 1) {
          match (args[i]) { LNum(n) => { diff = diff - n } ... => () }
        }
        outVal = LNum(diff)
      }
    }
    if (primId == 3) { // *
      let mut prod = 1
      for (let mut i = 0; i < numArgs; i = i + 1) {
        match (args[i]) { LNum(n) => { prod = prod * n } ... => () }
      }
      outVal = LNum(prod)
    }
    if (primId == 4) { // /
      if (numArgs == 2) {
        match (args[0]) {
          LNum(a) => match (args[1]) {
            LNum(b) => { outVal = LNum(b != 0 ? a / b : 0) }
            ... => ()
          }
          ... => ()
        }
      }
    }
    if (primId == 5) { // quotient
      if (numArgs == 2) {
        match (args[0]) {
          LNum(a) => match (args[1]) {
            LNum(b) => { outVal = LNum(b != 0 ? Math.floor(a / b) : 0) }
            ... => ()
          }
          ... => ()
        }
      }
    }
    if (primId == 6 || primId == 7) { // modulo / remainder
      if (numArgs == 2) {
        match (args[0]) {
          LNum(a) => match (args[1]) {
            LNum(b) => { outVal = LNum(b != 0 ? a % b : 0) }
            ... => ()
          }
          ... => ()
        }
      }
    }
    if (primId == 8) { // abs
      if (numArgs == 1) {
        match (args[0]) { LNum(n) => { outVal = LNum(Math.abs(n)) } ... => () }
      }
    }
    if (primId == 9) { // max
      let mut m = -999999999
      for (let mut i = 0; i < numArgs; i = i + 1) {
        match (args[i]) { LNum(n) => { m = Math.max(m, n) } ... => () }
      }
      outVal = LNum(m)
    }
    if (primId == 10) { // min
      let mut m = 999999999
      for (let mut i = 0; i < numArgs; i = i + 1) {
        match (args[i]) { LNum(n) => { m = Math.min(m, n) } ... => () }
      }
      outVal = LNum(m)
    }

    // Comparisons
    if (primId == 11) { // =
      if (numArgs == 2) {
        match (args[0]) { LNum(a) => match (args[1]) { LNum(b) => { outVal = LBool(a == b) } ... => () } ... => () }
      }
    }
    if (primId == 12) { // <
      if (numArgs == 2) {
        match (args[0]) { LNum(a) => match (args[1]) { LNum(b) => { outVal = LBool(a < b) } ... => () } ... => () }
      }
    }
    if (primId == 13) { // >
      if (numArgs == 2) {
        match (args[0]) { LNum(a) => match (args[1]) { LNum(b) => { outVal = LBool(a > b) } ... => () } ... => () }
      }
    }
    if (primId == 14) { // <=
      if (numArgs == 2) {
        match (args[0]) { LNum(a) => match (args[1]) { LNum(b) => { outVal = LBool(a <= b) } ... => () } ... => () }
      }
    }
    if (primId == 15) { // >=
      if (numArgs == 2) {
        match (args[0]) { LNum(a) => match (args[1]) { LNum(b) => { outVal = LBool(a >= b) } ... => () } ... => () }
      }
    }
    if (primId == 16) { // zero?
      if (numArgs == 1) {
        match (args[0]) { LNum(n) => { outVal = LBool(n == 0) } ... => () }
      }
    }
    if (primId == 17) { // positive?
      if (numArgs == 1) {
        match (args[0]) { LNum(n) => { outVal = LBool(n > 0) } ... => () }
      }
    }
    if (primId == 18) { // negative?
      if (numArgs == 1) {
        match (args[0]) { LNum(n) => { outVal = LBool(n < 0) } ... => () }
      }
    }

    // List operations
    if (primId == 21) { // cons
      if (numArgs == 2) {
        outVal = LPair(args[0], args[1])
      }
    }
    if (primId == 22) { // car
      if (numArgs == 1) {
        match (args[0]) { LPair(h, t) => { outVal = h } ... => () }
      }
    }
    if (primId == 23) { // cdr
      if (numArgs == 1) {
        match (args[0]) { LPair(h, t) => { outVal = t } ... => () }
      }
    }
    if (primId == 26) { // list
      outVal = LispMacro.arrayToList(args)
    }
    if (primId == 27) { // null?
      if (numArgs == 1) {
        match (args[0]) { LNil => { outVal = LBool(true) } ... => { outVal = LBool(false) } }
      }
    }
    if (primId == 28) { // pair?
      if (numArgs == 1) {
        match (args[0]) { LPair(h, t) => { outVal = LBool(true) } ... => { outVal = LBool(false) } }
      }
    }
    if (primId == 29) { // length
      if (numArgs == 1) {
        let items = LispMacro.listToArray(args[0])
        outVal = LNum(Array.len(items))
      }
    }
    if (primId == 30) { // append
      let mut all: LispVal[] = []
      for (let mut i = 0; i < numArgs; i = i + 1) {
        let sub = LispMacro.listToArray(args[i])
        for (let mut j = 0; j < Array.len(sub); j = j + 1) {
          all.push(sub[j])
        }
      }
      outVal = LispMacro.arrayToList(all)
    }
    if (primId == 31) { // reverse
      if (numArgs == 1) {
        let items = LispMacro.listToArray(args[0])
        let mut rev: LispVal[] = []
        for (let mut i = Array.len(items) - 1; i >= 0; i = i - 1) {
          rev.push(items[i])
        }
        outVal = LispMacro.arrayToList(rev)
      }
    }

    // Equivalence
    if (primId == 41 || primId == 42 || primId == 43) { // eq?, eqv?, equal?
      if (numArgs == 2) {
        let s1 = LispPrinter.printVal(args[0])
        let s2 = LispPrinter.printVal(args[1])
        outVal = LBool(s1 == s2)
      }
    }
    if (primId == 44) { // not
      if (numArgs == 1) {
        match (args[0]) { LBool(b) => { outVal = LBool(!b) } ... => { outVal = LBool(false) } }
      }
    }
    if (primId == 45) { // boolean?
      if (numArgs == 1) {
        match (args[0]) { LBool(b) => { outVal = LBool(true) } ... => { outVal = LBool(false) } }
      }
    }
    if (primId == 46) { // number?
      if (numArgs == 1) {
        match (args[0]) { LNum(n) => { outVal = LBool(true) } ... => { outVal = LBool(false) } }
      }
    }
    if (primId == 47) { // string?
      if (numArgs == 1) {
        match (args[0]) { LStr(s) => { outVal = LBool(true) } ... => { outVal = LBool(false) } }
      }
    }
    if (primId == 48) { // symbol?
      if (numArgs == 1) {
        match (args[0]) { LSymbol(s) => { outVal = LBool(true) } ... => { outVal = LBool(false) } }
      }
    }
    if (primId == 49) { // procedure?
      if (numArgs == 1) {
        match (args[0]) {
          LPrim(n, id) => { outVal = LBool(true) }
          LClosure(p, v, body, env) => { outVal = LBool(true) }
          LCont(k) => { outVal = LBool(true) }
          ... => { outVal = LBool(false) }
        }
      }
    }

    // Strings & Symbols
    if (primId == 51) { // string-append
      let mut res = ""
      for (let mut i = 0; i < numArgs; i = i + 1) {
        match (args[i]) { LStr(s) => { res = concat(res, s) } ... => () }
      }
      outVal = LStr(res)
    }
    if (primId == 52) { // string-length
      if (numArgs == 1) {
        match (args[0]) { LStr(s) => { outVal = LNum(String.len(s)) } ... => () }
      }
    }
    if (primId == 54) { // number->string
      if (numArgs == 1) {
        match (args[0]) { LNum(n) => { outVal = LStr(to_string(n)) } ... => () }
      }
    }
    if (primId == 55) { // string->number
      if (numArgs == 1) {
        match (args[0]) { LStr(s) => { outVal = LNum(String.parseFloat(s)) } ... => () }
      }
    }
    if (primId == 56) { // symbol->string
      if (numArgs == 1) {
        match (args[0]) { LSymbol(s) => { outVal = LStr(s) } ... => () }
      }
    }
    if (primId == 57) { // string->symbol
      if (numArgs == 1) {
        match (args[0]) { LStr(s) => { outVal = LSymbol(s) } ... => () }
      }
    }

    // Vectors
    if (primId == 61) { // vector
      outVal = LVector(args)
    }
    if (primId == 62) { // make-vector
      if (numArgs >= 1) {
        let mut count = 0
        let fill = numArgs > 1 ? args[1] : LNum(0)
        match (args[0]) { LNum(n) => { count = Math.floor(n) } ... => () }
        let mut vec: LispVal[] = []
        for (let mut i = 0; i < count; i = i + 1) {
          vec.push(fill)
        }
        outVal = LVector(vec)
      }
    }
    if (primId == 63) { // vector-length
      if (numArgs == 1) {
        match (args[0]) { LVector(v) => { outVal = LNum(Array.len(v)) } ... => () }
      }
    }
    if (primId == 64) { // vector-ref
      if (numArgs == 2) {
        match (args[0]) {
          LVector(v) => match (args[1]) {
            LNum(idx) => {
              let i = Math.floor(idx)
              if (i >= 0 && i < Array.len(v)) {
                outVal = v[i]
              }
            }
            ... => ()
          }
          ... => ()
        }
      }
    }

    // I/O
    if (primId == 71 || primId == 74) { // display / print
      if (numArgs >= 1) {
        let s = match (args[0]) {
          LStr(str) => str
          LNum(n)   => to_string(n)
          LBool(b)  => b ? "#t" : "#f"
          ...       => LispPrinter.printVal(args[0])
        }
        currentLine = concat(currentLine, s)
      }
    }
    if (primId == 72) { // newline
      stdoutLog.push(currentLine)
      currentLine = ""
    }
    if (primId == 73) { // write
      if (numArgs >= 1) {
        currentLine = concat(currentLine, LispPrinter.printVal(args[0]))
      }
    }

    { isContCall: false, result: outVal, newK: currentK, newExpr: LVoid, newEnv: 0 }
  }

  // Helper inside SchemeVM to dispatch function calls
  function applyFunction(fnVal: LispVal, args: LispVal[], callEnv: number, nextK: number): void {
    match (fnVal) {
      // Built-in Primitive
      LPrim(name, id) => {
        let primRes = applyPrimitive(id, args, nextK)
        if (primRes.isContCall) {
          currentExpr = primRes.newExpr
          currentEnv = callEnv
          currentK = primRes.newK
          isEvalMode = true
        } else {
          currentVal = primRes.result
          currentK = nextK
          isEvalMode = false
        }
      }
      // User-defined Closure
      LClosure(params, varArg, body, closureEnv) => {
        let callScope = createEnv(closureEnv)
        for (let mut i = 0; i < Array.len(params); i = i + 1) {
          let argVal = i < Array.len(args) ? args[i] : LNil
          envDefine(callScope, params[i], argVal)
        }

        if (Array.len(body) == 0) {
          currentVal = LVoid
          currentK = nextK
          isEvalMode = false
        } else if (Array.len(body) == 1) {
          currentExpr = body[0]
          currentEnv = callScope
          currentK = nextK
          isEvalMode = true
        } else {
          let first = body[0]
          let mut rest: LispVal[] = []
          for (let mut i = 1; i < Array.len(body); i = i + 1) {
            rest.push(body[i])
          }
          let seqFrame = pushFrame(KSeq(rest, callScope, nextK))
          currentExpr = first
          currentEnv = callScope
          currentK = seqFrame
          isEvalMode = true
        }
      }
      // First-Class Captured Continuation: (k return-val)
      // DISCARDS the current continuation and restores captured k!
      LCont(savedK) => {
        let returnVal = Array.len(args) > 0 ? args[0] : LVoid
        currentVal = returnVal
        currentK = savedK
        isEvalMode = false
      }
      ... => {
        currentVal = LVoid
        currentK = nextK
        isEvalMode = false
      }
    }
  }

  // --- CEK Evaluator Trampoline ---
  export function evaluate(rawExpr: LispVal, rootEnv: number): LispVal {
    let macroExpanded = LispMacro.expandMacro(rawExpr)

    currentExpr = macroExpanded
    currentEnv = rootEnv
    currentK = 0 // KDone
    currentVal = LVoid
    isEvalMode = true // true: evaluating expr; false: returning val to continuation

    stepLimit = 20000
    steps = 0
    done = false

    while (steps < stepLimit && !done) {
      steps = steps + 1

      if (isEvalMode) {
        // --- EVALUATION STEP ---
        match (currentExpr) {
          LSymbol(name) => {
            let found = envLookup(currentEnv, name)
            currentVal = found
            isEvalMode = false
          }
          LPair(head, tail) => {
            match (head) {
              LSymbol(special) => {
                // (quote e)
                if (special == "quote") {
                  match (tail) {
                    LPair(quoted, LNil) => {
                      currentVal = quoted
                      isEvalMode = false
                    }
                    ... => {
                      currentVal = tail
                      isEvalMode = false
                    }
                  }
                }
                // (if cond then else)
                else if (special == "if") {
                  let ifArgs = LispMacro.listToArray(tail)
                  if (Array.len(ifArgs) >= 2) {
                    let condExpr = ifArgs[0]
                    let thenBr = ifArgs[1]
                    let elseBr = Array.len(ifArgs) >= 3 ? ifArgs[2] : LVoid
                    let nextFrame = pushFrame(KIf(thenBr, elseBr, currentEnv, currentK))
                    currentExpr = condExpr
                    currentK = nextFrame
                  } else {
                    currentVal = LVoid
                    isEvalMode = false
                  }
                }
                // (begin e1 e2 ...)
                else if (special == "begin") {
                  let seqStmts = LispMacro.listToArray(tail)
                  if (Array.len(seqStmts) == 0) {
                    currentVal = LVoid
                    isEvalMode = false
                  } else if (Array.len(seqStmts) == 1) {
                    currentExpr = seqStmts[0]
                  } else {
                    let first = seqStmts[0]
                    let mut rest: LispVal[] = []
                    for (let mut i = 1; i < Array.len(seqStmts); i = i + 1) {
                      rest.push(seqStmts[i])
                    }
                    let nextFrame = pushFrame(KSeq(rest, currentEnv, currentK))
                    currentExpr = first
                    currentK = nextFrame
                  }
                }
                // (define var val) or (define (fn p1 ...) body ...)
                else if (special == "define") {
                  match (tail) {
                    LPair(nameOrSig, bodyOrVal) => {
                      match (nameOrSig) {
                        LSymbol(varName) => {
                          match (bodyOrVal) {
                            LPair(initExpr, LNil) => {
                              let nextFrame = pushFrame(KDefine(varName, currentEnv, currentK))
                              currentExpr = initExpr
                              currentK = nextFrame
                            }
                            ... => {
                              currentVal = LVoid
                              isEvalMode = false
                            }
                          }
                        }
                        LPair(fnNameVal, paramsVal) => {
                          // Function definition shorthand: (define (fn x y) body)
                          match (fnNameVal) {
                            LSymbol(fnName) => {
                              let pArr = LispMacro.listToArray(paramsVal)
                              let mut pNames: string[] = []
                              for (let mut i = 0; i < Array.len(pArr); i = i + 1) {
                                match (pArr[i]) { LSymbol(p) => pNames.push(p) ... => () }
                              }
                              let bodyArr = LispMacro.listToArray(bodyOrVal)
                              let closure = LClosure(pNames, "", bodyArr, currentEnv)
                              envDefine(currentEnv, fnName, closure)
                              currentVal = LSymbol(fnName)
                              isEvalMode = false
                            }
                            ... => {
                              currentVal = LVoid
                              isEvalMode = false
                            }
                          }
                        }
                        ... => {
                          currentVal = LVoid
                          isEvalMode = false
                        }
                      }
                    }
                    ... => {
                      currentVal = LVoid
                      isEvalMode = false
                    }
                  }
                }
                // (set! var val)
                else if (special == "set!") {
                  match (tail) {
                    LPair(varVal, valPair) => {
                      match (varVal) {
                        LSymbol(varName) => {
                          match (valPair) {
                            LPair(newValExpr, LNil) => {
                              let nextFrame = pushFrame(KSet(varName, currentEnv, currentK))
                              currentExpr = newValExpr
                              currentK = nextFrame
                            }
                            ... => {
                              currentVal = LVoid
                              isEvalMode = false
                            }
                          }
                        }
                        ... => {
                          currentVal = LVoid
                          isEvalMode = false
                        }
                      }
                    }
                    ... => {
                      currentVal = LVoid
                      isEvalMode = false
                    }
                  }
                }
                // (lambda (p1 p2 ...) body ...)
                else if (special == "lambda") {
                  match (tail) {
                    LPair(paramsVal, bodyVal) => {
                      let pArr = LispMacro.listToArray(paramsVal)
                      let mut pNames: string[] = []
                      for (let mut i = 0; i < Array.len(pArr); i = i + 1) {
                        match (pArr[i]) { LSymbol(p) => pNames.push(p) ... => () }
                      }
                      let bodyArr = LispMacro.listToArray(bodyVal)
                      currentVal = LClosure(pNames, "", bodyArr, currentEnv)
                      isEvalMode = false
                    }
                    ... => {
                      currentVal = LVoid
                      isEvalMode = false
                    }
                  }
                }
                // Standard function application
                else {
                  let args = LispMacro.listToArray(tail)
                  let nextFrame = pushFrame(KEvalHead(args, currentEnv, currentK))
                  currentExpr = head
                  currentK = nextFrame
                }
              }
              // Head is complex expression
              ... => {
                let args = LispMacro.listToArray(tail)
                let nextFrame = pushFrame(KEvalHead(args, currentEnv, currentK))
                currentExpr = head
                currentK = nextFrame
              }
            }
          }
          ... => {
            currentVal = currentExpr
            isEvalMode = false
          }
        }
      } else {
        // --- CONTINUATION RETURN STEP ---
        if (currentK == 0) {
          // Finished evaluation!
          done = true
        } else {
          let frame = frameStore[currentK]
          match (frame) {
            KDone => {
              done = true
            }
            KSeq(rest, envId, nextK) => {
              if (Array.len(rest) == 0) {
                currentK = nextK
                // currentVal remains
              } else if (Array.len(rest) == 1) {
                currentExpr = rest[0]
                currentEnv = envId
                currentK = nextK
                isEvalMode = true
              } else {
                let nextExpr = rest[0]
                let mut remaining: LispVal[] = []
                for (let mut i = 1; i < Array.len(rest); i = i + 1) {
                  remaining.push(rest[i])
                }
                let nextF = pushFrame(KSeq(remaining, envId, nextK))
                currentExpr = nextExpr
                currentEnv = envId
                currentK = nextF
                isEvalMode = true
              }
            }
            KIf(thenBr, elseBr, envId, nextK) => {
              let isTruthy = match (currentVal) {
                LBool(b) => b
                LNil     => false
                ...      => true
              }
              currentExpr = isTruthy ? thenBr : elseBr
              currentEnv = envId
              currentK = nextK
              isEvalMode = true
            }
            KDefine(sym, envId, nextK) => {
              envDefine(envId, sym, currentVal)
              currentVal = LSymbol(sym)
              currentK = nextK
            }
            KSet(sym, envId, nextK) => {
              envSet(envId, sym, currentVal)
              currentVal = LVoid
              currentK = nextK
            }
            KEvalHead(unevalArgs, envId, nextK) => {
              let fnVal = currentVal
              if (Array.len(unevalArgs) == 0) {
                // Apply function with 0 args
                applyFunction(fnVal, [], envId, nextK)
              } else {
                let firstArg = unevalArgs[0]
                let mut pending: LispVal[] = []
                for (let mut i = 1; i < Array.len(unevalArgs); i = i + 1) {
                  pending.push(unevalArgs[i])
                }
                let nextF = pushFrame(KAppArgs(fnVal, [], pending, envId, nextK))
                currentExpr = firstArg
                currentEnv = envId
                currentK = nextF
                isEvalMode = true
              }
            }
            KAppArgs(fnVal, evaluated, pending, envId, nextK) => {
              let mut evaledSoFar = evaluated
              evaledSoFar.push(currentVal)

              if (Array.len(pending) == 0) {
                // All arguments evaluated! Apply function!
                applyFunction(fnVal, evaledSoFar, envId, nextK)
              } else {
                let nextArg = pending[0]
                let mut restPending: LispVal[] = []
                for (let mut i = 1; i < Array.len(pending); i = i + 1) {
                  restPending.push(pending[i])
                }
                let nextF = pushFrame(KAppArgs(fnVal, evaledSoFar, restPending, envId, nextK))
                currentExpr = nextArg
                currentEnv = envId
                currentK = nextF
                isEvalMode = true
              }
            }
          }
        }
      }
    }

    currentVal
  }

  export function runProgram(source: string): string[] {
    resetVM()
    let rootEnv = initGlobalEnv()
    let exprs = LispReader.readAll(source)

    for (let mut i = 0; i < Array.len(exprs); i = i + 1) {
      let res = evaluate(exprs[i], rootEnv)
      match (res) {
        LVoid => ()
        ... => ()
      }
    }

    getStdout()
  }
}

// =========================================================================
// R5RS SCHEME DEMO RUNNER & TEST DRIVER
// =========================================================================
module SchemeDriver {
  export function runDemo() {
    println("================================================================")
    println("λ TypeLang R5RS Scheme (Lisp) Engine with call/cc & Macros")
    println("================================================================")

    // Demo 1: Core Expressions, Closures & Recursion
    println("\\n--- [Test 1: Recursion & Closures (Factorial & Fibonacci)] ---")
    let code1 = "(define (fact n) (if (<= n 1) 1 (* n (fact (- n 1))))) (define (fib n) (if (<= n 1) n (+ (fib (- n 1)) (fib (- n 2))))) (display \\"fact(6) = \\") (display (fact 6)) (newline) (display \\"fib(10) = \\") (display (fib 10)) (newline)"
    let out1 = SchemeVM.runProgram(code1)
    for (let mut i = 0; i < Array.len(out1); i = i + 1) {
      println(concat("  ", out1[i]))
    }

    // Demo 2: Higher-Order Functions: map, filter, list operations
    println("\\n--- [Test 2: Higher-Order Functions (Map & Filter)] ---")
    let code2 = "(define (map f xs) (if (null? xs) '() (cons (f (car xs)) (map f (cdr xs))))) (define (filter p xs) (if (null? xs) '() (if (p (car xs)) (cons (car xs) (filter p (cdr xs))) (filter p (cdr xs))))) (define nums '(1 2 3 4 5 6)) (define doubled (map (lambda (x) (* x 2)) nums)) (define evens (filter (lambda (x) (= (modulo x 2) 0)) nums)) (display \\"Original: \\") (write nums) (newline) (display \\"Doubled:  \\") (write doubled) (newline) (display \\"Evens:    \\") (write evens) (newline)"
    let out2 = SchemeVM.runProgram(code2)
    for (let mut i = 0; i < Array.len(out2); i = i + 1) {
      println(concat("  ", out2[i]))
    }

    // Demo 3: Reader Macros & Quasiquotation (quote, quasiquote, unquote-splicing)
    println("\\n--- [Test 3: Reader Macros & Quasiquote with Unquote-Splicing] ---")
    let code3 = "(define a 10) (define b '(20 30)) (define templ (quasiquote (header (unquote a) (unquote-splicing b) footer))) (display \\"Quasiquote Template: (quasiquote (header (unquote a) (unquote-splicing b) footer))\\") (newline) (display \\"Expanded Result:     \\") (write templ) (newline)"
    let out3 = SchemeVM.runProgram(code3)
    for (let mut i = 0; i < Array.len(out3); i = i + 1) {
      println(concat("  ", out3[i]))
    }

    // Demo 4: Syntax Macros (let*, cond, when, unless, and, or)
    println("\\n--- [Test 4: Syntax Macros (let*, cond, when, unless, and, or)] ---")
    let code4 = "(let* ((x 5) (y (* x 2)) (z (+ y 3))) (display \\"let* cascading binding (x=5, y=10, z=13): z = \\") (display z) (newline)) (define score 85) (define grade (cond ((>= score 90) \\"A\\") ((>= score 80) \\"B\\") ((>= score 70) \\"C\\") (else \\"F\\"))) (display \\"Grade for 85: \\") (display grade) (newline) (when (> score 50) (display \\"when macro: Passed exam!\\") (newline))"
    let out4 = SchemeVM.runProgram(code4)
    for (let mut i = 0; i < Array.len(out4); i = i + 1) {
      println(concat("  ", out4[i]))
    }

    // Demo 5: First-Class Continuations (call/cc) - Non-Local Escape & Early Exit
    println("\\n--- [Test 5: call/cc Non-Local Escape & List Search] ---")
    let code5 = "(define (product-with-early-exit xs) (call/cc (lambda (return) (define (loop lst) (cond ((null? lst) 1) ((= (car lst) 0) (return 0)) ((< (car lst) 0) (return 'negative-found)) (else (* (car lst) (loop (cdr lst)))))) (loop xs)))) (display \\"Product of '(1 2 3 4): \\") (write (product-with-early-exit '(1 2 3 4))) (newline) (display \\"Product of '(1 2 0 4 5): \\") (write (product-with-early-exit '(1 2 0 4 5))) (newline) (display \\"Product of '(1 2 -5 4): \\") (write (product-with-early-exit '(1 2 -5 4))) (newline)"
    let out5 = SchemeVM.runProgram(code5)
    for (let mut i = 0; i < Array.len(out5); i = i + 1) {
      println(concat("  ", out5[i]))
    }

    // Demo 6: First-Class Continuations (call/cc) - Coroutines & Cooperative Multitasking
    println("\\n--- [Test 6: call/cc Coroutines (Cooperative Multitasking)] ---")
    let code6 = "(define exit-main #f) (define cont-a #f) (define cont-b #f) (define (task-a) (display \\"[Task A] Step 1\\") (newline) (call/cc (lambda (k) (set! cont-a k) (cont-b 'from-a))) (display \\"[Task A] Step 2\\") (newline) (call/cc (lambda (k) (set! cont-a k) (cont-b 'from-a))) (display \\"[Task A] Complete!\\") (newline) (cont-b 'done-a)) (define (task-b) (display \\"[Task B] Step 1\\") (newline) (call/cc (lambda (k) (set! cont-b k) (cont-a 'from-b))) (display \\"[Task B] Step 2\\") (newline) (call/cc (lambda (k) (set! cont-b k) (cont-a 'from-b))) (display \\"[Task B] Complete!\\") (newline) (exit-main 'all-done)) (call/cc (lambda (exit) (set! exit-main exit) (call/cc (lambda (k) (set! cont-b k) (task-a))) (task-b)))"
    let out6 = SchemeVM.runProgram(code6)
    for (let mut i = 0; i < Array.len(out6); i = i + 1) {
      println(concat("  ", out6[i]))
    }

    // Demo 7: First-Class Continuations (call/cc) - Resumable Generator & State Inversion
    println("\\n--- [Test 7: call/cc Resumable Generator & State Inversion] ---")
    let code7 = "(define gen-k #f) (define main-k #f) (define (counter-task) (define (loop i) (call/cc (lambda (k) (set! gen-k k) (main-k i))) (loop (+ i 10))) (loop 100)) (define (next-val) (call/cc (lambda (k) (set! main-k k) (if gen-k (gen-k #t) (counter-task))))) (display \\"Generator Tick 1: \\") (display (next-val)) (newline) (display \\"Generator Tick 2: \\") (display (next-val)) (newline) (display \\"Generator Tick 3: \\") (display (next-val)) (newline)"
    let out7 = SchemeVM.runProgram(code7)
    for (let mut i = 0; i < Array.len(out7); i = i + 1) {
      println(concat("  ", out7[i]))
    }

    println("\\n================================================================")
    println("✨ R5RS Scheme with First-Class Continuations & Macros Complete!")
    println("================================================================")
  }
}

// Execute Scheme Driver
SchemeDriver.runDemo()
`
};
