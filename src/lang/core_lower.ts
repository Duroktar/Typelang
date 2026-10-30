// ============================================================================
// TypeLang Core Lowering Pass
// Lowers TypeLang AST (Program) into Core IR (CoreProgram)
// Exhaustively handles and desugars all 26 TypeLang expression types.
// ============================================================================

import { Program, Statement, Expr, SFunction, SLet, desugarDo } from './ast';
import { CoreProgram, CoreDecl, CoreExpr, CoreCaseArm } from './core';

export class CoreLowerer {
  public lower(program: Program): CoreProgram {
    const decls: CoreDecl[] = [];
    const topExecStmts: Statement[] = [];

    const collectDeclsAndStmts = (stmts: Statement[], prefix = '') => {
      for (const stmt of stmts) {
        if (stmt.kind === 's_function') {
          const fn = this.lowerFunction(stmt);
          decls.push(fn);
          if (prefix) {
            decls.push({
              ...fn,
              name: `${prefix}_${fn.name}`
            });
          }
        } else if (stmt.kind === 's_module') {
          collectDeclsAndStmts(stmt.body, prefix ? `${prefix}_${stmt.name}` : stmt.name);
        } else if (stmt.kind !== 's_import' && stmt.kind !== 's_gadt' && stmt.kind !== 's_type_alias') {
          topExecStmts.push(stmt);
        }
      }
    };

    collectDeclsAndStmts(program.statements);

    let mainExpr: CoreExpr | undefined = undefined;
    if (topExecStmts.length > 0) {
      let current: CoreExpr = { kind: 'e_lit', value: 0 };
      for (let i = topExecStmts.length - 1; i >= 0; i--) {
        const s = topExecStmts[i];
        if (s.kind === 's_let') {
          const val: CoreExpr = s.init ? this.lowerExpr(s.init) : { kind: 'e_lit', value: 0 };
          current = { kind: 'e_let', name: s.name, val, body: current };
        } else if (s.kind === 's_expr' && s.expr) {
          if (s.expr.kind === 'e_return') {
            current = s.expr.value ? this.lowerExpr(s.expr.value) : { kind: 'e_lit', value: 0 };
          } else {
            const exprVal = this.lowerExpr(s.expr);
            current = { kind: 'e_let', name: `_top_${i}`, val: exprVal, body: current };
          }
        }
      }
      mainExpr = current;
    } else {
      // Check if there is an explicit main function
      const mainFn = decls.find(d => d.name === 'main');
      if (mainFn) {
        mainExpr = { kind: 'e_app', fn: { kind: 'e_var', name: 'main' }, arg: { kind: 'e_lit', value: 0 } };
      }
    }

    return { decls, mainExpr };
  }

  private lowerFunction(fn: SFunction): CoreDecl {
    const params = (fn.params || []).map(p => ({ name: p.name }));
    const body = fn.body ? this.lowerExpr(fn.body) : { kind: 'e_lit' as const, value: 0 };
    return {
      name: fn.name,
      params,
      body
    };
  }

  public lowerExpr(expr: Expr): CoreExpr {
    if (!expr) {
      return { kind: 'e_lit', value: 0 };
    }

    switch (expr.kind) {
      case 'e_literal':
        return { kind: 'e_lit', value: expr.value === null ? 0 : expr.value };

      case 'e_var':
        return { kind: 'e_var', name: expr.name };

      case 'e_unary': {
        if (expr.op === '-') {
          return {
            kind: 'e_prim',
            op: '-',
            args: [{ kind: 'e_lit', value: 0 }, this.lowerExpr(expr.expr)]
          };
        }
        return {
          kind: 'e_prim',
          op: '!',
          args: [this.lowerExpr(expr.expr)]
        };
      }

      case 'e_binary': {
        const left = this.lowerExpr(expr.left);
        const right = this.lowerExpr(expr.right);
        return { kind: 'e_prim', op: expr.op, args: [left, right] };
      }

      case 'e_assign': {
        const targetName = expr.target.kind === 'e_var' ? expr.target.name : '_tmp_assign';
        const val = this.lowerExpr(expr.value);
        return { kind: 'e_let', name: targetName, val, body: { kind: 'e_var', name: targetName } };
      }

      case 'e_call': {
        const callee = this.lowerExpr(expr.callee);
        const args = (expr.args || []).map(a => this.lowerExpr(a));
        if (args.length === 0) {
          return { kind: 'e_app', fn: callee, arg: { kind: 'e_lit', value: 0 } };
        }
        let app: CoreExpr = callee;
        for (const arg of args) {
          app = { kind: 'e_app', fn: app, arg };
        }
        return app;
      }

      case 'e_method_call': {
        const obj = this.lowerExpr(expr.object);
        const args = (expr.args || []).map(a => this.lowerExpr(a));
        const methodFn: CoreExpr = { kind: 'e_var', name: expr.method };
        let app: CoreExpr = { kind: 'e_app', fn: methodFn, arg: obj };
        for (const arg of args) {
          app = { kind: 'e_app', fn: app, arg };
        }
        return app;
      }

      case 'e_field_access': {
        const obj = this.lowerExpr(expr.object);
        return {
          kind: 'e_prim',
          op: 'field_get',
          args: [obj, { kind: 'e_lit', value: expr.field }]
        };
      }

      case 'e_index': {
        const target = this.lowerExpr(expr.target);
        const idx = this.lowerExpr(expr.index);
        return {
          kind: 'e_prim',
          op: 'index',
          args: [target, idx]
        };
      }

      case 'e_record': {
        const fieldExprs: CoreExpr[] = [];
        for (const f of expr.fields) {
          fieldExprs.push({ kind: 'e_lit', value: f.name });
          fieldExprs.push(this.lowerExpr(f.value));
        }
        return {
          kind: 'e_con',
          name: 'Record',
          args: fieldExprs
        };
      }

      case 'e_record_update': {
        const base = this.lowerExpr(expr.base);
        const updateExprs: CoreExpr[] = [base];
        for (const u of expr.updates) {
          updateExprs.push({ kind: 'e_lit', value: u.name });
          updateExprs.push(this.lowerExpr(u.value));
        }
        return {
          kind: 'e_prim',
          op: 'record_update',
          args: updateExprs
        };
      }

      case 'e_tuple': {
        const elems = (expr.elements || []).map(e => this.lowerExpr(e));
        return {
          kind: 'e_con',
          name: `Tuple${elems.length}`,
          args: elems
        };
      }

      case 'e_lambda': {
        const param = expr.params?.[0]?.name || 'x';
        const body = this.lowerExpr(expr.body);
        return { kind: 'e_lam', param, body };
      }

      case 'e_if': {
        const cond = this.lowerExpr(expr.cond);
        const thenExpr = this.lowerExpr(expr.thenExpr);
        const elseExpr = expr.elseExpr ? this.lowerExpr(expr.elseExpr) : { kind: 'e_lit' as const, value: 0 };
        return {
          kind: 'e_prim',
          op: 'if',
          args: [cond, thenExpr, elseExpr]
        };
      }

      case 'e_block': {
        const stmts = expr.statements || [];
        let current: CoreExpr = expr.result ? this.lowerExpr(expr.result) : { kind: 'e_lit', value: 0 };

        for (let i = stmts.length - 1; i >= 0; i--) {
          const s = stmts[i];
          if (s.kind === 's_let') {
            const val = s.init ? this.lowerExpr(s.init) : { kind: 'e_lit' as const, value: 0 };
            current = { kind: 'e_let', name: s.name, val, body: current };
          } else if (s.kind === 's_expr' && s.expr) {
            if (s.expr.kind === 'e_return') {
              current = s.expr.value ? this.lowerExpr(s.expr.value) : { kind: 'e_lit', value: 0 };
            } else {
              const exprVal = this.lowerExpr(s.expr);
              current = { kind: 'e_let', name: `_t${i}`, val: exprVal, body: current };
            }
          }
        }
        return current;
      }

      case 'e_match': {
        const scrutinee = this.lowerExpr(expr.scrutinee);
        const arms: CoreCaseArm[] = (expr.arms || []).map(arm => {
          const ctorName = arm.pattern.kind === 'p_ctor' ? arm.pattern.name : 'default';
          const boundVars = (arm.pattern as any).args ? (arm.pattern as any).args.map((a: any) => a.name || 'x') : [];
          const body = this.lowerExpr(arm.body);
          return { constructorName: ctorName, boundVars, body };
        });
        return { kind: 'e_case', scrutinee, arms };
      }

      case 'e_switch': {
        const disc = this.lowerExpr(expr.discriminant);
        let current: CoreExpr = expr.defaultCase ? this.lowerExpr(expr.defaultCase) : { kind: 'e_lit', value: 0 };
        for (let i = (expr.cases || []).length - 1; i >= 0; i--) {
          const c = expr.cases[i];
          const caseVal = this.lowerExpr(c.value);
          const caseBody = this.lowerExpr(c.body);
          const cond: CoreExpr = { kind: 'e_prim', op: '==', args: [disc, caseVal] };
          current = { kind: 'e_prim', op: 'if', args: [cond, caseBody, current] };
        }
        return current;
      }

      case 'e_for': {
        const bodyExpr = this.lowerExpr(expr.body);
        const condExpr: CoreExpr = expr.cond ? this.lowerExpr(expr.cond) : { kind: 'e_lit', value: 1 };
        const updateExpr: CoreExpr = expr.update ? this.lowerExpr(expr.update) : { kind: 'e_lit', value: 0 };
        const loopBody: CoreExpr = {
          kind: 'e_let',
          name: '_loop_body',
          val: bodyExpr,
          body: updateExpr
        };
        const whileExpr: CoreExpr = {
          kind: 'e_prim',
          op: 'while',
          args: [condExpr, loopBody]
        };
        if (expr.init) {
          if ('kind' in expr.init && expr.init.kind === 's_let') {
            const initVal: CoreExpr = expr.init.init ? this.lowerExpr(expr.init.init) : { kind: 'e_lit', value: 0 };
            return { kind: 'e_let', name: expr.init.name, val: initVal, body: whileExpr };
          }
          if ('kind' in expr.init && expr.init.kind === 's_expr') {
            return { kind: 'e_let', name: '_init', val: this.lowerExpr(expr.init.expr), body: whileExpr };
          }
          return { kind: 'e_let', name: '_init', val: this.lowerExpr(expr.init as Expr), body: whileExpr };
        }
        return whileExpr;
      }

      case 'e_while': {
        const cond = this.lowerExpr(expr.cond);
        const body = this.lowerExpr(expr.body);
        return {
          kind: 'e_prim',
          op: 'while',
          args: [cond, body]
        };
      }

      case 'e_break':
        return { kind: 'e_prim', op: 'break', args: [] };

      case 'e_continue':
        return { kind: 'e_prim', op: 'continue', args: [] };

      case 'e_return':
        return expr.value ? this.lowerExpr(expr.value) : { kind: 'e_lit', value: 0 };

      case 'e_list_comp': {
        const elem = this.lowerExpr(expr.element);
        const iter = this.lowerExpr(expr.iterable);
        const mapLam: CoreExpr = { kind: 'e_lam', param: expr.param, body: elem };
        if (expr.condition) {
          const cond = this.lowerExpr(expr.condition);
          const filterLam: CoreExpr = { kind: 'e_lam', param: expr.param, body: cond };
          const filtered: CoreExpr = {
            kind: 'e_app',
            fn: { kind: 'e_app', fn: { kind: 'e_var', name: 'filter' }, arg: filterLam },
            arg: iter
          };
          return {
            kind: 'e_app',
            fn: { kind: 'e_app', fn: { kind: 'e_var', name: 'map' }, arg: mapLam },
            arg: filtered
          };
        }
        return {
          kind: 'e_app',
          fn: { kind: 'e_app', fn: { kind: 'e_var', name: 'map' }, arg: mapLam },
          arg: iter
        };
      }

      case 'e_range': {
        const start = this.lowerExpr(expr.start);
        const end = this.lowerExpr(expr.end);
        return {
          kind: 'e_prim',
          op: expr.inclusive ? 'range_inclusive' : 'range',
          args: [start, end]
        };
      }

      case 'e_do': {
        const desugared = desugarDo(expr);
        return this.lowerExpr(desugared);
      }

      case 'e_where': {
        let current = this.lowerExpr(expr.expr);
        for (let i = (expr.bindings || []).length - 1; i >= 0; i--) {
          const b = expr.bindings[i];
          if (b.kind === 's_let') {
            const val: CoreExpr = b.init ? this.lowerExpr(b.init) : { kind: 'e_lit', value: 0 };
            current = { kind: 'e_let', name: b.name, val, body: current };
          } else if (b.kind === 's_function') {
            const fnDecl = this.lowerFunction(b);
            current = { kind: 'e_let', name: fnDecl.name, val: fnDecl.body, body: current };
          }
        }
        return current;
      }

      default: {
        const _exhaustiveCheck: never = expr;
        return { kind: 'e_lit', value: 0 };
      }
    }
  }
}
