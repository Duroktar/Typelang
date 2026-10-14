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
