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
