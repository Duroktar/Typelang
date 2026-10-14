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
