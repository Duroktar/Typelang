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
