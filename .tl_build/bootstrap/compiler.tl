// ============================================================================
// TypeLang Self-Hosted Compiler (Monolithic Bootstrap Bundle)
// Auto-generated from /bootstrap/ modular components
// ============================================================================

// ----------------------------------------------------------------------------
// Module: tokens.tl
// ----------------------------------------------------------------------------

// ============================================================================
// TypeLang Self-Hosted Compiler: Tokens Module (Array-tag representation)
// ============================================================================

function TokNum(val: number, line: number) { [1.0, val, line] }
function TokStr(val: string, line: number) { [2.0, val, line] }
function TokIdent(name: string, line: number) { [3.0, name, line] }
function TokKw(kw: string, line: number) { [4.0, kw, line] }
function TokSym(sym: string, line: number) { [5.0, sym, line] }
function TokEOF(line: number) { [6.0, line] }

function token_kind(tok: any): string {
  let k = tok[0.0];
  if (k == 1.0) { "num" }
  else if (k == 2.0) { "str" }
  else if (k == 3.0) { "ident" }
  else if (k == 4.0) { "kw" }
  else if (k == 5.0) { "sym" }
  else { "eof" }
}

function token_str_val(tok: any): string {
  let k = tok[0.0];
  if (k == 1.0) { to_string(tok[1.0]) }
  else if (k == 2.0) { tok[1.0] }
  else if (k == 3.0) { tok[1.0] }
  else if (k == 4.0) { tok[1.0] }
  else if (k == 5.0) { tok[1.0] }
  else { "<EOF>" }
}

function token_num_val(tok: any): number {
  let k = tok[0.0];
  if (k == 1.0) { tok[1.0] }
  else { 0.0 }
}

function token_line(tok: any): number {
  let k = tok[0.0];
  if (k == 6.0) { tok[1.0] }
  else { tok[2.0] }
}

// ----------------------------------------------------------------------------
// Module: ast.tl
// ----------------------------------------------------------------------------

// ============================================================================
// TypeLang Self-Hosted Compiler: AST Definitions Module (Array-tag representation)
// ============================================================================

function ENum(val: number) { [1.0, val] }
function EStr(val: string) { [2.0, val] }
function EBool(b: boolean) { [3.0, b] }
function EVar(name: string) { [4.0, name] }
function EBinOp(op: string, left: any, right: any) { [5.0, op, left, right] }
function EUnary(op: string, arg: any) { [6.0, op, arg] }
function ECall(fnName: string, args: any[]) { [7.0, fnName, args] }
function EIf(cond: any, thenBr: any, elseBr: any) { [8.0, cond, thenBr, elseBr] }
function EBlock(stmts: any[], result: any) { [9.0, stmts, result] }
function EArray(elements: any[]) { [10.0, elements] }
function EIndex(arr: any, idx: any) { [11.0, arr, idx] }

function SLet(name: string, isMut: boolean, init: any) { [20.0, name, isMut, init] }
function SAssign(name: string, val: any) { [21.0, name, val] }
function SAssignOp(op: string, name: string, val: any) { [22.0, op, name, val] }
function SExpr(expr: any) { [23.0, expr] }
function SReturn(val: any) { [24.0, val] }
function SWhile(cond: any, body: any[]) { [25.0, cond, body] }
function SIf(cond: any, thenBody: any[], elseBody: any[]) { [26.0, cond, thenBody, elseBody] }
function SFunc(name: string, params: string[], body: any[]) { [27.0, name, params, body] }

// ----------------------------------------------------------------------------
// Module: lexer.tl
// ----------------------------------------------------------------------------

// ============================================================================
// TypeLang Self-Hosted Compiler: Lexer Module
// ============================================================================

function is_digit(ch: string): boolean {
  String.len(ch) == 1.0 && String.contains("0123456789", ch)
}

function is_alpha(ch: string): boolean {
  String.len(ch) == 1.0 && String.contains("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_", ch)
}

function is_alphanumeric(ch: string): boolean {
  is_alpha(ch) || is_digit(ch)
}

function is_keyword(w: string): boolean {
  w == "let" || w == "mut" || w == "function" || w == "fn" ||
  w == "if" || w == "else" || w == "while" || w == "return" ||
  w == "true" || w == "false" || w == "println" || w == "print" ||
  w == "type" || w == "match"
}

function tokenize(src: string): Token[] {
  let mut tokens: Token[] = [];
  let len = String.len(src);
  let mut i = 0.0;
  let mut line = 1.0;

  while (i < len) {
    let ch = String.slice(src, i, i + 1.0);

    // Whitespace handling
    if (ch == " " || ch == "\t" || ch == "\r") {
      i += 1.0;
    } else if (ch == "\n") {
      line += 1.0;
      i += 1.0;
    } else if (ch == "/" && i + 1.0 < len && String.slice(src, i + 1.0, i + 2.0) == "/") {
      // Line comment //
      i += 2.0;
      while (i < len && String.slice(src, i, i + 1.0) != "\n") {
        i += 1.0;
      }
    } else if (is_digit(ch)) {
      // Numeric literal
      let start = i;
      while (i < len && (is_digit(String.slice(src, i, i + 1.0)) || String.slice(src, i, i + 1.0) == ".")) {
        i += 1.0;
      }
      let numStr = String.slice(src, start, i);
      let numVal = String.parseFloat(numStr);
      tokens.push(TokNum(numVal, line));
    } else if (ch == "\"") {
      // String literal
      i += 1.0;
      let start = i;
      while (i < len && String.slice(src, i, i + 1.0) != "\"") {
        if (String.slice(src, i, i + 1.0) == "\n") {
          line += 1.0;
        }
        i += 1.0;
      }
      let strVal = String.slice(src, start, i);
      if (i < len && String.slice(src, i, i + 1.0) == "\"") {
        i += 1.0;
      }
      tokens.push(TokStr(strVal, line));
    } else if (is_alpha(ch)) {
      // Identifier or Keyword
      let start = i;
      while (i < len && is_alphanumeric(String.slice(src, i, i + 1.0))) {
        i += 1.0;
      }
      let word = String.slice(src, start, i);
      if (is_keyword(word)) {
        tokens.push(TokKw(word, line));
      } else {
        tokens.push(TokIdent(word, line));
      }
    } else {
      // Multi-character and single-character symbols
      let nextCh = (i + 1.0 < len) ? String.slice(src, i + 1.0, i + 2.0) : "";
      let twoChar = concat(ch, nextCh);

      let mut isTwoChar = false;
      if (twoChar == "==") { isTwoChar = true; }
      else if (twoChar == "!=") { isTwoChar = true; }
      else if (twoChar == "<=") { isTwoChar = true; }
      else if (twoChar == ">=") { isTwoChar = true; }
      else if (twoChar == "+=") { isTwoChar = true; }
      else if (twoChar == "-=") { isTwoChar = true; }
      else if (twoChar == "*=") { isTwoChar = true; }
      else if (twoChar == "/=") { isTwoChar = true; }
      else if (twoChar == "&&") { isTwoChar = true; }
      else if (twoChar == "||") { isTwoChar = true; }

      if (isTwoChar) {
        tokens.push(TokSym(twoChar, line));
        i += 2.0;
      } else {
        tokens.push(TokSym(ch, line));
        i += 1.0;
      }
    }
  }

  tokens.push(TokEOF(line));
  tokens
}

// ----------------------------------------------------------------------------
// Module: parser.tl
// ----------------------------------------------------------------------------

// ============================================================================
// TypeLang Self-Hosted Compiler: Parser Module (Enhanced for compiler.tl)
// ============================================================================

type ParseResult = {
  stmts: any[],
  errors: string[]
};

let mut parse_pos = 0.0;
let mut parse_tokens: any[] = [];
let mut parse_errors: string[] = [];

function parse_peek(): any {
  let numTokens = Array.len(parse_tokens);
  if (parse_pos < numTokens) {
    parse_tokens[parse_pos]
  } else {
    TokEOF(0.0)
  }
}

function parse_peek_ahead(offset: number): any {
  let idx = parse_pos + offset;
  let numTokens = Array.len(parse_tokens);
  if (idx < numTokens) {
    parse_tokens[idx]
  } else {
    TokEOF(0.0)
  }
}

function parse_check(kind: string, val: string): boolean {
  let t = parse_peek();
  if (token_kind(t) != kind) {
    false
  } else if (val != "" && token_str_val(t) != val) {
    false
  } else {
    true
  }
}

function parse_advance(): any {
  let t = parse_peek();
  let numTokens = Array.len(parse_tokens);
  if (parse_pos < numTokens) {
    parse_pos += 1.0;
  }
  t
}

function parse_match(kind: string, val: string): boolean {
  if (parse_check(kind, val)) {
    parse_advance();
    true
  } else {
    false
  }
}

// --- Expression Parsing ---

function parse_primary(): any {
  let t = parse_peek();
  let kind = token_kind(t);
  let val = token_str_val(t);

  if (kind == "num") {
    parse_advance();
    ENum(token_num_val(t))
  } else if (kind == "str") {
    parse_advance();
    EStr(val)
  } else if (kind == "kw" && (val == "true" || val == "false")) {
    parse_advance();
    EBool(val == "true")
  } else if (kind == "ident" || (kind == "kw" && (val == "println" || val == "print"))) {
    parse_advance();
    let name = val;
    if (parse_match("sym", "(")) {
      let mut args: any[] = [];
      if (!parse_check("sym", ")")) {
        args.push(parse_expr());
        while (parse_match("sym", ",")) {
          args.push(parse_expr());
        }
      }
      parse_match("sym", ")");
      ECall(name, args)
    } else {
      EVar(name)
    }
  } else if (parse_match("sym", "[")) {
    let mut elements: any[] = [];
    if (!parse_check("sym", "]")) {
      elements.push(parse_expr());
      while (parse_match("sym", ",")) {
        elements.push(parse_expr());
      }
    }
    parse_match("sym", "]");
    EArray(elements)
  } else if (parse_match("sym", "(")) {
    let e = parse_expr();
    parse_match("sym", ")");
    e
  } else if (parse_match("kw", "if")) {
    parse_match("sym", "(");
    let cond = parse_expr();
    parse_match("sym", ")");
    let thenBr = parse_expr();
    parse_match("kw", "else");
    let elseBr = parse_expr();
    EIf(cond, thenBr, elseBr)
  } else {
    parse_advance();
    parse_errors.push(concat("Unexpected token in expression: ", val));
    ENum(0.0)
  }
}

function parse_postfix(): any {
  let mut expr = parse_primary();
  while (parse_check("sym", "[") || parse_check("sym", ".")) {
    if (parse_match("sym", "[")) {
      let idx = parse_expr();
      parse_match("sym", "]");
      expr = EIndex(expr, idx);
    } else {
      parse_advance(); // consume '.'
      let field = token_str_val(parse_advance());
      if (parse_match("sym", "(")) {
        let mut args: any[] = [];
        args.push(expr);
        if (!parse_check("sym", ")")) {
          args.push(parse_expr());
          while (parse_match("sym", ",")) {
            args.push(parse_expr());
          }
        }
        parse_match("sym", ")");
        let baseName = (expr[0.0] == 4.0) ? expr[1.0] : "Obj";
        if (field == "push") {
          expr = ECall("Array_push", args);
        } else if (field == "contains") {
          expr = ECall("String_contains", args);
        } else if (field == "slice") {
          expr = ECall("String_slice", args);
        } else {
          expr = ECall(concat(concat(baseName, "_"), field), args);
        }
      } else {
        let baseName = (expr[0.0] == 4.0) ? expr[1.0] : "Obj";
        expr = EVar(concat(concat(baseName, "_"), field));
      }
    }
  }
  expr
}

function parse_unary(): any {
  if (parse_check("sym", "-") || parse_check("sym", "!")) {
    let op = token_str_val(parse_advance());
    let arg = parse_unary();
    EUnary(op, arg)
  } else {
    parse_postfix()
  }
}

function parse_multiplicative(): any {
  let mut left = parse_unary();
  while (parse_check("sym", "*") || parse_check("sym", "/") || parse_check("sym", "%")) {
    let op = token_str_val(parse_advance());
    let right = parse_unary();
    left = EBinOp(op, left, right);
  }
  left
}

function parse_additive(): any {
  let mut left = parse_multiplicative();
  while (parse_check("sym", "+") || parse_check("sym", "-")) {
    let op = token_str_val(parse_advance());
    let right = parse_multiplicative();
    left = EBinOp(op, left, right);
  }
  left
}

function parse_comparison(): any {
  let mut left = parse_additive();
  while (parse_check("sym", "<") || parse_check("sym", "<=") || parse_check("sym", ">") || parse_check("sym", ">=")) {
    let op = token_str_val(parse_advance());
    let right = parse_additive();
    left = EBinOp(op, left, right);
  }
  left
}

function parse_equality(): any {
  let mut left = parse_comparison();
  while (parse_check("sym", "==") || parse_check("sym", "!=")) {
    let op = token_str_val(parse_advance());
    let right = parse_comparison();
    left = EBinOp(op, left, right);
  }
  left
}

function parse_logical(): any {
  let mut left = parse_equality();
  while (parse_check("sym", "&&") || parse_check("sym", "||")) {
    let op = token_str_val(parse_advance());
    let right = parse_equality();
    left = EBinOp(op, left, right);
  }
  left
}

function parse_expr(): any {
  let mut expr = parse_logical();
  if (parse_match("sym", "?")) {
    let thenBr = parse_expr();
    parse_match("sym", ":");
    let elseBr = parse_expr();
    expr = EIf(expr, thenBr, elseBr);
  }
  expr
}

// --- Statement Parsing ---

function parse_block(): any[] {
  let mut blockStmts: any[] = [];
  parse_match("sym", "{");
  while (!parse_check("sym", "}") && !parse_check("eof", "")) {
    blockStmts.push(parse_statement());
  }
  parse_match("sym", "}");
  blockStmts
}

function parse_statement(): any {
  let numTokens = Array.len(parse_tokens);
  if (parse_match("kw", "let")) {
    let isMut = parse_match("kw", "mut");
    let name = token_str_val(parse_advance());
    if (parse_match("sym", ":")) {
      let mut bracketDepth = 0.0;
      while (!parse_check("sym", "=") && !parse_check("eof", "")) {
        let t = parse_peek();
        let symVal = token_str_val(t);
        if (token_kind(t) == "sym" && symVal == "[") {
          bracketDepth += 1.0;
        } else if (token_kind(t) == "sym" && symVal == "]") {
          bracketDepth -= 1.0;
        } else if (bracketDepth == 0.0 && token_kind(t) == "sym" && symVal == "=") {
          break;
        }
        parse_advance();
      }
    }
    parse_match("sym", "=");
    let init = parse_expr();
    parse_match("sym", ";");
    SLet(name, isMut, init)
  } else if (parse_match("kw", "function") || parse_match("kw", "fn")) {
    let name = token_str_val(parse_advance());
    parse_match("sym", "(");
    let mut params: string[] = [];
    if (!parse_check("sym", ")")) {
      let pName = token_str_val(parse_advance());
      if (parse_match("sym", ":")) {
        while (!parse_check("sym", ",") && !parse_check("sym", ")") && !parse_check("eof", "")) {
          parse_advance();
        }
      }
      params.push(pName);
      while (parse_match("sym", ",")) {
        let nextName = token_str_val(parse_advance());
        if (parse_match("sym", ":")) {
          while (!parse_check("sym", ",") && !parse_check("sym", ")") && !parse_check("eof", "")) {
            parse_advance();
          }
        }
        params.push(nextName);
      }
    }
    parse_match("sym", ")");
    if (parse_match("sym", ":")) {
      while (!parse_check("sym", "{") && !parse_check("eof", "")) {
        parse_advance();
      }
    }
    let body = parse_block();
    SFunc(name, params, body)
  } else if (parse_match("kw", "if")) {
    parse_match("sym", "(");
    let cond = parse_expr();
    parse_match("sym", ")");
    let thenBody = parse_block();
    let mut elseBody: any[] = [];
    if (parse_match("kw", "else")) {
      if (parse_check("kw", "if")) {
        elseBody.push(parse_statement());
      } else {
        elseBody = parse_block();
      }
    }
    SIf(cond, thenBody, elseBody)
  } else if (parse_match("kw", "while")) {
    parse_match("sym", "(");
    let cond = parse_expr();
    parse_match("sym", ")");
    let body = parse_block();
    SWhile(cond, body)
  } else if (parse_match("kw", "return")) {
    let val = parse_expr();
    parse_match("sym", ";");
    SReturn(val)
  } else {
    let expr = parse_expr();
    if (expr[0.0] == 4.0 && (parse_check("sym", "=") || parse_check("sym", "+=") || parse_check("sym", "-=") || parse_check("sym", "*=") || parse_check("sym", "/="))) {
      let name = expr[1.0];
      let op = token_str_val(parse_advance());
      let val = parse_expr();
      parse_match("sym", ";");
      if (op == "=") {
        SAssign(name, val)
      } else {
        SAssignOp(op, name, val)
      }
    } else {
      parse_match("sym", ";");
      SExpr(expr)
    }
  }
}

function parse(tokens: any[]): ParseResult {
  parse_tokens = tokens;
  parse_pos = 0.0;
  parse_errors = [];
  let mut stmts: any[] = [];

  while (!parse_check("eof", "")) {
    stmts.push(parse_statement());
  }

  { stmts: stmts, errors: parse_errors }
}

// ----------------------------------------------------------------------------
// Module: checker.tl
// ----------------------------------------------------------------------------

// ============================================================================
// TypeLang Self-Hosted Compiler: Semantic Type Checker Module (Array tags)
// ============================================================================

let mut checker_vars: string[] = [];
let mut checker_funcs: string[] = [];

function is_builtin_fn(name: string): boolean {
  name == "println" || name == "print" || name == "to_string" ||
  name == "concat" || name == "parse_int" || name == "parse_float" ||
  name == "len" || name == "push" || name == "read_file" || name == "write_file" ||
  name == "get_cli_arg" ||
  name == "Math_sqrt" || name == "Math_floor" || name == "Math_ceil" || name == "Math_abs"
}

function check_expr(expr: any): boolean {
  let tag = expr[0.0];
  if (tag == 5.0) {
    check_expr(expr[2.0]) && check_expr(expr[3.0])
  } else if (tag == 6.0) {
    check_expr(expr[2.0])
  } else if (tag == 7.0) {
    let args = expr[2.0];
    let mut aIdx = 0.0;
    let aCount = Array.len(args);
    while (aIdx < aCount) {
      check_expr(args[aIdx]);
      aIdx += 1.0;
    }
    true
  } else if (tag == 8.0) {
    check_expr(expr[1.0]) && check_expr(expr[2.0]) && check_expr(expr[3.0])
  } else if (tag == 10.0) {
    let elems = expr[1.0];
    let mut eIdx = 0.0;
    let eCount = Array.len(elems);
    while (eIdx < eCount) {
      check_expr(elems[eIdx]);
      eIdx += 1.0;
    }
    true
  } else if (tag == 11.0) {
    check_expr(expr[1.0]) && check_expr(expr[2.0])
  } else {
    true
  }
}

function check_statement(stmt: any): boolean {
  let tag = stmt[0.0];
  if (tag == 20.0) {
    check_expr(stmt[3.0]);
    checker_vars.push(stmt[1.0]);
    true
  } else if (tag == 21.0) {
    check_expr(stmt[2.0])
  } else if (tag == 22.0) {
    check_expr(stmt[3.0])
  } else if (tag == 23.0) {
    check_expr(stmt[1.0])
  } else if (tag == 24.0) {
    check_expr(stmt[1.0])
  } else if (tag == 25.0) {
    check_expr(stmt[1.0]);
    let body = stmt[2.0];
    let mut bIdx = 0.0;
    let bCount = Array.len(body);
    while (bIdx < bCount) {
      check_statement(body[bIdx]);
      bIdx += 1.0;
    }
    true
  } else if (tag == 26.0) {
    check_expr(stmt[1.0]);
    let thenBody = stmt[2.0];
    let mut tIdx = 0.0;
    let tCount = Array.len(thenBody);
    while (tIdx < tCount) {
      check_statement(thenBody[tIdx]);
      tIdx += 1.0;
    }
    let elseBody = stmt[3.0];
    let mut eIdx = 0.0;
    let eCount = Array.len(elseBody);
    while (eIdx < eCount) {
      check_statement(elseBody[eIdx]);
      eIdx += 1.0;
    }
    true
  } else if (tag == 27.0) {
    let params = stmt[2.0];
    let mut pIdx = 0.0;
    let pCount = Array.len(params);
    while (pIdx < pCount) {
      checker_vars.push(params[pIdx]);
      pIdx += 1.0;
    }
    let body = stmt[3.0];
    let mut bIdx = 0.0;
    let bCount = Array.len(body);
    while (bIdx < bCount) {
      check_statement(body[bIdx]);
      bIdx += 1.0;
    }
    true
  } else {
    true
  }
}

function check_semantics(stmts: any[]): any {
  let mut errors: string[] = [];
  checker_vars = [];
  checker_funcs = [];

  checker_funcs.push("println");
  checker_funcs.push("print");
  checker_funcs.push("to_string");
  checker_funcs.push("concat");
  checker_funcs.push("len");
  checker_funcs.push("push");
  checker_funcs.push("read_file");
  checker_funcs.push("write_file");
  checker_funcs.push("get_cli_arg");

  let mut i = 0.0;
  let count = Array.len(stmts);
  while (i < count) {
    if (stmts[i][0.0] == 27.0) {
      checker_funcs.push(stmts[i][1.0]);
    }
    i += 1.0;
  }

  i = 0.0;
  while (i < count) {
    check_statement(stmts[i]);
    i += 1.0;
  }

  { isValid: true, errors: errors }
}

// ----------------------------------------------------------------------------
// Module: codegen_c.tl
// ----------------------------------------------------------------------------

// ============================================================================
// TypeLang Self-Hosted Compiler: C11 / C99 Code Generator Module (Array tags)
// ============================================================================

function sanitize_c_ident(name: string): string {
  if (name == "int" || name == "char" || name == "float" || name == "double" ||
      name == "return" || name == "while" || name == "if" || name == "else" ||
      name == "case" || name == "switch" || name == "default" || name == "break" ||
      name == "continue" || name == "void" || name == "static" || name == "extern" ||
      name == "const" || name == "struct" || name == "typedef" || name == "union" ||
      name == "main") {
    concat("_tl_", name)
  } else {
    name
  }
}

function escape_c_string(s: string): string {
  let len = String.len(s);
  let mut out = "";
  let mut i = 0.0;
  while (i < len) {
    let ch = String.slice(s, i, i + 1.0);
    if (ch == "\\") {
      out = concat(out, "\\\\");
    } else if (ch == "\"") {
      out = concat(out, "\\\"");
    } else if (ch == "\n") {
      out = concat(out, "\\n");
    } else if (ch == "\t") {
      out = concat(out, "\\t");
    } else {
      out = concat(out, ch);
    }
    i += 1.0;
  }
  out
}

function emit_expr(expr: any): string {
  let tag = expr[0.0];
  if (tag == 1.0) {
    concat(concat("tl_num(", to_string(expr[1.0])), ")")
  } else if (tag == 2.0) {
    concat(concat("tl_str(\"", escape_c_string(expr[1.0])), "\")")
  } else if (tag == 3.0) {
    concat("tl_bool(", concat(expr[1.0] ? "true" : "false", ")"))
  } else if (tag == 4.0) {
    sanitize_c_ident(expr[1.0])
  } else if (tag == 5.0) {
    let op = expr[1.0];
    let lCode = emit_expr(expr[2.0]);
    let rCode = emit_expr(expr[3.0]);
    if (op == "+") {
      concat(concat(concat("tl_add(", lCode), ", "), concat(rCode, ")"))
    } else if (op == "-") {
      concat(concat(concat("tl_sub(", lCode), ", "), concat(rCode, ")"))
    } else if (op == "*") {
      concat(concat(concat("tl_mul(", lCode), ", "), concat(rCode, ")"))
    } else if (op == "/") {
      concat(concat(concat("tl_div(", lCode), ", "), concat(rCode, ")"))
    } else if (op == "%") {
      concat(concat(concat("tl_mod(", lCode), ", "), concat(rCode, ")"))
    } else if (op == "==") {
      concat(concat(concat("tl_eq(", lCode), ", "), concat(rCode, ")"))
    } else if (op == "!=") {
      concat(concat(concat("tl_neq(", lCode), ", "), concat(rCode, ")"))
    } else if (op == "<") {
      concat(concat(concat("tl_lt(", lCode), ", "), concat(rCode, ")"))
    } else if (op == "<=") {
      concat(concat(concat("tl_lte(", lCode), ", "), concat(rCode, ")"))
    } else if (op == ">") {
      concat(concat(concat("tl_gt(", lCode), ", "), concat(rCode, ")"))
    } else if (op == ">=") {
      concat(concat(concat("tl_gte(", lCode), ", "), concat(rCode, ")"))
    } else if (op == "&&") {
      concat(concat(concat("tl_bool(tl_is_truthy(", lCode), ") && tl_is_truthy("), concat(rCode, ")))"))
    } else if (op == "||") {
      concat(concat(concat("tl_bool(tl_is_truthy(", lCode), ") || tl_is_truthy("), concat(rCode, ")))"))
    } else {
      concat(concat(concat("tl_add(", lCode), ", "), concat(rCode, ")"))
    }
  } else if (tag == 6.0) {
    let op = expr[1.0];
    let aCode = emit_expr(expr[2.0]);
    if (op == "-") {
      concat(concat("tl_neg(", aCode), ")")
    } else if (op == "!") {
      concat(concat("tl_not(", aCode), ")")
    } else {
      aCode
    }
  } else if (tag == 7.0) {
    let fnName = expr[1.0];
    let args = expr[2.0];
    let aCount = Array.len(args);
    if (fnName == "println" && aCount == 1.0) {
      concat(concat("tl_println(", emit_expr(args[0.0])), ")")
    } else if (fnName == "print" && aCount == 1.0) {
      concat(concat("tl_print(", emit_expr(args[0.0])), ")")
    } else if (fnName == "concat" && aCount == 2.0) {
      concat(concat(concat("tl_concat(", emit_expr(args[0.0])), ", "), concat(emit_expr(args[1.0]), ")"))
    } else if (fnName == "to_string" && aCount == 1.0) {
      concat(concat("tl_to_string(", emit_expr(args[0.0])), ")")
    } else if (fnName == "len" && aCount == 1.0) {
      concat(concat("tl_len(", emit_expr(args[0.0])), ")")
    } else if (fnName == "read_file" && aCount == 1.0) {
      concat(concat("tl_read_file(", emit_expr(args[0.0])), ")")
    } else if (fnName == "write_file" && aCount == 2.0) {
      concat(concat(concat("tl_write_file(", emit_expr(args[0.0])), ", "), concat(emit_expr(args[1.0]), ")"))
    } else if (fnName == "get_cli_arg" && aCount == 1.0) {
      concat(concat("tl_get_cli_arg(", emit_expr(args[0.0])), ")")
    } else {
      let mut argListStr = "";
      let mut i = 0.0;
      while (i < aCount) {
        if (i > 0.0) {
          argListStr = concat(argListStr, ", ");
        }
        argListStr = concat(argListStr, emit_expr(args[i]));
        i += 1.0;
      }
      concat(concat(concat(sanitize_c_ident(fnName), "("), argListStr), ")")
    }
  } else if (tag == 8.0) {
    concat(concat("(tl_is_truthy(", emit_expr(expr[1.0])),
           concat(concat(") ? (", emit_expr(expr[2.0])),
                  concat(") : (", concat(emit_expr(expr[3.0]), "))"))))
  } else if (tag == 9.0) {
    emit_expr(expr[2.0])
  } else if (tag == 10.0) {
    let elements = expr[1.0];
    let count = Array.len(elements);
    if (count == 0.0) {
      "tl_array(0, NULL)"
    } else {
      let mut elemList = "";
      let mut i = 0.0;
      while (i < count) {
        if (i > 0.0) elemList = concat(elemList, ", ");
        elemList = concat(elemList, emit_expr(elements[i]));
        i += 1.0;
      }
      concat(concat(concat("tl_array(", to_string(count)), ", (const TLValue[]){ "), concat(elemList, " })"))
    }
  } else if (tag == 11.0) {
    concat(concat(concat("tl_array_get(", emit_expr(expr[1.0])), ", "), concat(emit_expr(expr[2.0]), ")"))
  } else {
    "tl_null()"
  }
}

function emit_statement(stmt: any, indent: string): string {
  let tag = stmt[0.0];
  if (tag == 20.0) {
    concat(indent, concat(concat("TLValue ", sanitize_c_ident(stmt[1.0])), concat(" = ", concat(emit_expr(stmt[3.0]), ";\n"))))
  } else if (tag == 21.0) {
    concat(indent, concat(sanitize_c_ident(stmt[1.0]), concat(" = ", concat(emit_expr(stmt[2.0]), ";\n"))))
  } else if (tag == 22.0) {
    let op = stmt[1.0];
    let safeName = sanitize_c_ident(stmt[2.0]);
    let vCode = emit_expr(stmt[3.0]);
    if (op == "+=") {
      concat(indent, concat(concat(concat(safeName, " = tl_add("), safeName), concat(concat(", ", vCode), ");\n")))
    } else if (op == "-=") {
      concat(indent, concat(concat(concat(safeName, " = tl_sub("), safeName), concat(concat(", ", vCode), ");\n")))
    } else if (op == "*=") {
      concat(indent, concat(concat(concat(safeName, " = tl_mul("), safeName), concat(concat(", ", vCode), ");\n")))
    } else if (op == "/=") {
      concat(indent, concat(concat(concat(safeName, " = tl_div("), safeName), concat(concat(", ", vCode), ");\n")))
    } else {
      concat(indent, concat(safeName, concat(" = ", concat(vCode, ";\n"))))
    }
  } else if (tag == 23.0) {
    concat(indent, concat(emit_expr(stmt[1.0]), ";\n"))
  } else if (tag == 24.0) {
    concat(indent, concat("return ", concat(emit_expr(stmt[1.0]), ";\n")))
  } else if (tag == 25.0) {
    let mut out = concat(indent, concat("while (tl_is_truthy(", concat(emit_expr(stmt[1.0]), ")) {\n")));
    let innerIndent = concat(indent, "  ");
    let body = stmt[2.0];
    let mut i = 0.0;
    let count = Array.len(body);
    while (i < count) {
      out = concat(out, emit_statement(body[i], innerIndent));
      i += 1.0;
    }
    concat(out, concat(indent, "}\n"))
  } else if (tag == 26.0) {
    let mut out = concat(indent, concat("if (tl_is_truthy(", concat(emit_expr(stmt[1.0]), ")) {\n")));
    let innerIndent = concat(indent, "  ");
    let thenBody = stmt[2.0];
    let mut tIdx = 0.0;
    let tCount = Array.len(thenBody);
    while (tIdx < tCount) {
      out = concat(out, emit_statement(thenBody[tIdx], innerIndent));
      tIdx += 1.0;
    }
    out = concat(out, concat(indent, "}"));
    let elseBody = stmt[3.0];
    let eCount = Array.len(elseBody);
    if (eCount > 0.0) {
      out = concat(out, " else {\n");
      let mut eIdx = 0.0;
      while (eIdx < eCount) {
        out = concat(out, emit_statement(elseBody[eIdx], innerIndent));
        eIdx += 1.0;
      }
      out = concat(out, concat(indent, "}\n"));
    } else {
      out = concat(out, "\n");
    }
    out
  } else {
    ""
  }
}

function emit_program(stmts: any[]): string {
  let mut header = "// ============================================================================\n";
  header = concat(header, "// Generated by TypeLang Self-Hosted C11 / C99 Compiler\n");
  header = concat(header, "// ============================================================================\n\n");
  header = concat(header, "#include \"tl_runtime.h\"\n\n");

  let mut prototypes = "// --- Function Prototypes ---\n";
  let mut functions = "// --- Function Implementations ---\n";
  let mut mainBody = "";

  let mut i = 0.0;
  let count = Array.len(stmts);

  while (i < count) {
    let st = stmts[i];
    if (st[0.0] == 27.0) {
      let fnName = st[1.0];
      let params = st[2.0];
      let body = st[3.0];
      let safeFnName = sanitize_c_ident(fnName);
      let mut paramListStr = "";
      let pCount = Array.len(params);
      let mut pIdx = 0.0;
      while (pIdx < pCount) {
        if (pIdx > 0.0) paramListStr = concat(paramListStr, ", ");
        paramListStr = concat(paramListStr, concat("TLValue ", sanitize_c_ident(params[pIdx])));
        pIdx += 1.0;
      }
      if (pCount == 0.0) {
        paramListStr = "void";
      }

      prototypes = concat(prototypes, concat(concat("TLValue ", safeFnName), concat("(", concat(paramListStr, ");\n"))));

      let mut fnImpl = concat(concat("TLValue ", safeFnName), concat("(", concat(paramListStr, ") {\n")));
      let mut bIdx = 0.0;
      let bCount = Array.len(body);
      while (bIdx < bCount) {
        fnImpl = concat(fnImpl, emit_statement(body[bIdx], "  "));
        bIdx += 1.0;
      }
      fnImpl = concat(fnImpl, "  return tl_null();\n}\n\n");
      functions = concat(functions, fnImpl);
    } else {
      mainBody = concat(mainBody, emit_statement(st, "  "));
    }
    i += 1.0;
  }

  let mut mainFn = "// --- Main Entry Point ---\n";
  mainFn = concat(mainFn, "int main(int argc, char** argv) {\n");
  mainFn = concat(mainFn, "  _tl_argc = argc; _tl_argv = argv;\n\n");
  mainFn = concat(mainFn, mainBody);
  mainFn = concat(mainFn, "  return 0;\n");
  mainFn = concat(mainFn, "}\n");

  concat(concat(concat(header, prototypes), concat("\n", functions)), concat("\n", mainFn))
}

// ----------------------------------------------------------------------------
// Module: main.tl
// ----------------------------------------------------------------------------

// ============================================================================
// TypeLang Self-Hosted Compiler: Driver & CLI Module
// ============================================================================

function compile_source(sourceCode: string): string {
  // Stage 1: Lexical Analysis
  let tokens = tokenize(sourceCode);
  println(concat("Scanned Token Count: ", to_string(Array.len(tokens))));

  // Stage 2: Syntactic Parsing
  let parseResult = parse(tokens);
  println(concat("Parsed Statement Count: ", to_string(Array.len(parseResult.stmts))));
  if (Array.len(parseResult.errors) > 0.0) {
    println("❌ Parsing Errors Encountered:");
    let mut errIdx = 0.0;
    let errCount = Array.len(parseResult.errors);
    while (errIdx < errCount) {
      println(concat("  - ", parseResult.errors[errIdx]));
      errIdx += 1.0;
    }
    return "";
  }

  // Stage 3: Semantic Analysis & Type Checking
  let checkResult = check_semantics(parseResult.stmts);
  if (!checkResult.isValid) {
    println("❌ Semantic Errors Encountered:");
    let mut errIdx = 0.0;
    let errCount = Array.len(checkResult.errors);
    while (errIdx < errCount) {
      println(concat("  - ", checkResult.errors[errIdx]));
      errIdx += 1.0;
    }
    return "";
  }

  // Stage 4: C11 / C99 Code Generation
  let cSource = emit_program(parseResult.stmts);
  cSource
}

function run_compiler_cli(): void {
  let cliInput = get_cli_arg(1.0);
  if (cliInput != "") {
    let sourceText = read_file(cliInput);
    if (sourceText != "") {
      let emittedC = compile_source(sourceText);
      let cliOutput = get_cli_arg(2.0);
      if (cliOutput != "") {
        write_file(cliOutput, emittedC);
        println(concat("✓ Successfully compiled to ", cliOutput));
      } else {
        println(emittedC);
      }
    } else {
      println(concat("❌ Error reading input file: ", cliInput));
    }
  } else {
    println("🚀 TypeLang Self-Hosted C11 / C99 Native Compiler Initialized");
    let sampleProgram = "println(\"Hello from TypeLang Compiled C11!\");\nlet x = 10.0 + 32.0;\nprintln(concat(\"Computed value: \", to_string(x)));\n";
    let compiledOutput = compile_source(sampleProgram);
    println("✓ Emitted C11 Code Preview:");
    println(compiledOutput);
  }
}

run_compiler_cli();

