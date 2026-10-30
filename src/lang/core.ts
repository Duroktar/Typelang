// ============================================================================
// TypeLang Core Language (Core IR)
// A minimal, strongly-typed intermediate language (similar to Core Haskell)
// designed for easy lowering, optimization, and target generation (IR/Bytecode).
// ============================================================================

export type CoreType =
  | { kind: 't_primitive'; name: string }
  | { kind: 't_function'; param: CoreType; returnType: CoreType }
  | { kind: 't_con'; name: string; args: CoreType[] }
  | { kind: 't_var'; name: string };

export type CoreExpr =
  | { kind: 'e_var'; name: string }
  | { kind: 'e_lit'; value: number | string | boolean }
  | { kind: 'e_lam'; param: string; paramType?: CoreType; body: CoreExpr }
  | { kind: 'e_app'; fn: CoreExpr; arg: CoreExpr }
  | { kind: 'e_let'; name: string; val: CoreExpr; body: CoreExpr }
  | { kind: 'e_con'; name: string; args: CoreExpr[] }
  | { kind: 'e_case'; scrutinee: CoreExpr; arms: CoreCaseArm[] }
  | { kind: 'e_prim'; op: string; args: CoreExpr[] };

export interface CoreCaseArm {
  constructorName: string;
  boundVars: string[];
  body: CoreExpr;
}

export interface CoreDecl {
  name: string;
  type?: CoreType;
  params: { name: string; type?: CoreType }[];
  body: CoreExpr;
}

export interface CoreProgram {
  decls: CoreDecl[];
  mainExpr?: CoreExpr;
}

/**
  * Pretty printer for Core IR to inspect the desugared core AST
  */
export function coreToString(program: CoreProgram): string {
  const lines: string[] = [];
  lines.push('--- TypeLang Core IR Program ---');
  for (const decl of program.decls) {
    const paramsStr = decl.params.map(p => `${p.name}`).join(' ');
    lines.push(`letrec ${decl.name} ${paramsStr} = ${exprToString(decl.body)}`);
  }
  if (program.mainExpr) {
    lines.push(`main = ${exprToString(program.mainExpr)}`);
  }
  return lines.join('\n');
}

function exprToString(expr: CoreExpr): string {
  switch (expr.kind) {
    case 'e_var':
      return expr.name;
    case 'e_lit':
      return typeof expr.value === 'string' ? `"${expr.value}"` : String(expr.value);
    case 'e_lam':
      return `(\\${expr.param} -> ${exprToString(expr.body)})`;
    case 'e_app':
      return `(${exprToString(expr.fn)} ${exprToString(expr.arg)})`;
    case 'e_let':
      return `let ${expr.name} = ${exprToString(expr.val)} in ${exprToString(expr.body)}`;
    case 'e_con':
      return `(${expr.name} ${expr.args.map(exprToString).join(' ')})`;
    case 'e_case':
      return `case ${exprToString(expr.scrutinee)} of { ${expr.arms.map(a => `${a.constructorName} ${a.boundVars.join(' ')} -> ${exprToString(a.body)}`).join('; ')} }`;
    case 'e_prim':
      return `(${expr.op} ${expr.args.map(exprToString).join(' ')})`;
  }
}
