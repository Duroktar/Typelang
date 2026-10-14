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
