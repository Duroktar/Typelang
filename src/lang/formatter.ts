import { Lexer } from './lexer';
import { Parser } from './parser';
import {
  Program,
  Statement,
  Expr,
  TypeAST,
  Pattern,
  GADTDecl,
  TypeAliasDecl,
  SModule,
  typeParamToString
} from './ast';
import { formatDocComment } from './docComments';

/**
 * TypeLang Code Prettifier & AST Formatter
 * Pretty-prints TypeLang source code into standard, idiomatic style.
 */
export class Formatter {
  private indentLevel = 0;

  private indent(): string {
    return '  '.repeat(this.indentLevel);
  }

  public format(code: string): string {
    try {
      const lexer = new Lexer(code);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parseProgram();

      return this.formatProgram(ast);
    } catch {
      // Fallback: If AST parsing fails due to incomplete code during editing,
      // perform clean line-based whitespace & operator normalization.
      return this.fallbackFormat(code);
    }
  }

  public formatProgram(program: Program): string {
    const formattedStmts = program.statements.map(stmt => this.formatStatement(stmt));
    return formattedStmts.join('\n\n').trim() + '\n';
  }

  private formatStatement(stmt: Statement): string {
    switch (stmt.kind) {
      case 's_let': {
        const mutStr = stmt.isMut ? 'mut ' : '';
        const typeStr = stmt.typeAnnotation ? `: ${this.formatType(stmt.typeAnnotation)}` : '';
        const initStr = this.formatExpr(stmt.init);
        const docPrefix = stmt.docComment
          ? `${formatDocComment(stmt.docComment).split('\n').map(line => `${this.indent()}${line}`).join('\n')}\n`
          : '';
        return `${docPrefix}${this.indent()}let ${mutStr}${stmt.name}${typeStr} = ${initStr}`;
      }

      case 's_function': {
        const exportPrefix = stmt.isExported ? 'export ' : '';
        const typeParams = stmt.typeParams && stmt.typeParams.length > 0 ? `<${stmt.typeParams.map(tp => typeParamToString(tp)).join(', ')}>` : '';
        const params = stmt.params
          .map(p => `${p.name}: ${this.formatType(p.type)}`)
          .join(', ');
        const retType = stmt.returnType ? `: ${this.formatType(stmt.returnType)}` : '';

        this.indentLevel++;
        let bodyLines: string;
        if (stmt.body.kind === 'e_block') {
          const stmts = stmt.body.statements.map(s => this.formatStatement(s)).join('\n');
          const res = stmt.body.result ? `${this.indent()}${this.formatExpr(stmt.body.result)}` : '';
          bodyLines = [stmts, res].filter(Boolean).join('\n');
        } else {
          bodyLines = `${this.indent()}${this.formatExpr(stmt.body)}`;
        }
        this.indentLevel--;

        let whereClause = '';
        if (stmt.whereBindings && stmt.whereBindings.length > 0) {
          this.indentLevel++;
          const whereStmts = stmt.whereBindings.map(s => this.formatStatement(s)).join('\n');
          this.indentLevel--;
          whereClause = ` where {\n${whereStmts}\n${this.indent()}}`;
        }

        const docPrefix = stmt.docComment
          ? `${formatDocComment(stmt.docComment).split('\n').map(line => `${this.indent()}${line}`).join('\n')}\n`
          : '';
        return `${docPrefix}${this.indent()}${exportPrefix}function ${stmt.name}${typeParams}(${params})${retType} {\n${bodyLines}\n${this.indent()}}${whereClause}`;
      }

      case 's_expr':
        return `${this.indent()}${this.formatExpr(stmt.expr)}`;

      case 's_type_alias':
        return this.formatDocPrefix(stmt.decl.docComment) + this.formatTypeAlias(stmt.decl);

      case 's_gadt':
        return this.formatDocPrefix(stmt.decl.docComment) + this.formatGadt(stmt.decl);

      case 's_module':
        return this.formatModule(stmt);

      case 's_extern_module': {
        this.indentLevel++;
        const funcs = stmt.functions.map(f => this.formatExternFunction(f)).join('\n');
        const types = stmt.types.map(t => this.formatExternType(t)).join('\n');
        const vals = stmt.values.map(v => this.formatExternValue(v)).join('\n');
        const content = [funcs, types, vals].filter(c => c.length > 0).join('\n');
        this.indentLevel--;
        return `${this.indent()}extern module ${stmt.name} {\n${content}\n${this.indent()}}`;
      }

      case 's_extern_function':
        return this.formatExternFunction(stmt);

      case 's_import': {
        const modPath = stmt.modulePath.join('.');
        if (stmt.specifiers && stmt.specifiers.length > 0) {
          const specs = stmt.specifiers.map(s => s.alias ? `${s.name} as ${s.alias}` : s.name).join(', ');
          return `${this.indent()}import ${modPath}.{ ${specs} }`;
        }
        const aliasStr = stmt.alias ? ` as ${stmt.alias}` : '';
        return `${this.indent()}import ${modPath}${aliasStr}`;
      }

      default:
        return this.indent() + '// Statement';
    }
  }

  private formatTypeAlias(decl: TypeAliasDecl): string {
    const typeParams = decl.typeParams && decl.typeParams.length > 0 ? `<${decl.typeParams.map(tp => typeParamToString(tp)).join(', ')}>` : '';
    const body = this.formatType(decl.type);
    return `${this.indent()}type ${decl.name}${typeParams} = ${body}`;
  }

  private formatDocPrefix(raw?: string): string {
    return raw
      ? `${formatDocComment(raw).split('\n').map(line => `${this.indent()}${line}`).join('\n')}\n`
      : '';
  }

  private formatGadt(gadt: GADTDecl): string {
    const typeParams = gadt.typeParams && gadt.typeParams.length > 0 ? `<${gadt.typeParams.map(tp => typeParamToString(tp)).join(', ')}>` : '';
    this.indentLevel++;
    const ctors = gadt.constructors
      .map(c => {
        const cTypeParams = c.typeParams && c.typeParams.length > 0 ? `<${c.typeParams.map(tp => typeParamToString(tp)).join(', ')}>` : '';
        const params = c.params.length > 0 ? `(${c.params.map(p => `${p.name}: ${this.formatType(p.type)}`).join(', ')})` : '';
        const retType = c.returnType ? `: ${this.formatType(c.returnType)}` : '';
        return `${this.formatDocPrefix(c.docComment)}${this.indent()}| ${c.name}${cTypeParams}${params}${retType}`;
      })
      .join('\n');
    this.indentLevel--;

    return `${this.indent()}type ${gadt.name}${typeParams} =\n${ctors}`;
  }

  private formatModule(mod: SModule): string {
    const exportStr = mod.isExported ? 'export ' : '';
    this.indentLevel++;
    const body = mod.body.map(s => this.formatStatement(s)).join('\n');
    this.indentLevel--;

    return `${this.indent()}${exportStr}module ${mod.name} {\n${body}\n${this.indent()}}`;
  }

  private formatExternFunction(f: any): string {
    const typeParams = f.typeParams && f.typeParams.length > 0 ? `<${f.typeParams.map((tp: any) => typeParamToString(tp)).join(', ')}>` : '';
    const params = f.params.map((p: any) => `${p.name}: ${this.formatType(p.type)}`).join(', ');
    return `${this.indent()}function ${f.name}${typeParams}(${params}): ${this.formatType(f.returnType)}`;
  }

  private formatExternType(t: any): string {
    const typeParams = t.typeParams && t.typeParams.length > 0 ? `<${t.typeParams.map((tp: any) => typeParamToString(tp)).join(', ')}>` : '';
    return `${this.indent()}type ${t.name}${typeParams} = ${this.formatType(t.type)}`;
  }

  private formatExternValue(v: any): string {
    return `${this.indent()}let ${v.name}: ${this.formatType(v.type)}`;
  }

  private formatExpr(expr: Expr): string {
    switch (expr.kind) {
      case 'e_literal':
        return JSON.stringify(expr.value);

      case 'e_var':
        return expr.modulePath ? `${expr.modulePath.join('.')}.${expr.name}` : expr.name;

      case 'e_unary': {
        const inner = this.formatExpr(expr.expr);
        return `${expr.op}${inner}`;
      }

      case 'e_binary': {
        let l = this.formatExpr(expr.left);
        let r = this.formatExpr(expr.right);

        // Parenthesize child binary expressions with lower precedence
        const opPrec = (op: string) => {
          if (op === '||') return 1;
          if (op === '&&') return 2;
          if (['==', '!='].includes(op)) return 3;
          if (['<', '<=', '>', '>='].includes(op)) return 4;
          if (['+', '-'].includes(op)) return 5;
          if (['*', '/', '%'].includes(op)) return 6;
          return 0;
        };

        const currentPrec = opPrec(expr.op);
        if (expr.left.kind === 'e_binary' && opPrec(expr.left.op) < currentPrec) {
          l = `(${l})`;
        }
        if (expr.right.kind === 'e_binary' && opPrec(expr.right.op) <= currentPrec) {
          r = `(${r})`;
        }

        return `${l} ${expr.op} ${r}`;
      }

      case 'e_call': {
        const fn = this.formatExpr(expr.callee);
        const args = expr.args.map(a => this.formatExpr(a)).join(', ');
        return `${fn}(${args})`;
      }

      case 'e_lambda': {
        const typeParams = expr.typeParams && expr.typeParams.length > 0 ? `<${expr.typeParams.join(', ')}>` : '';
        const params = expr.params.map(p => (p.type ? `${p.name}: ${this.formatType(p.type)}` : p.name)).join(', ');
        const retType = expr.returnType ? `: ${this.formatType(expr.returnType)}` : '';
        if (expr.body.kind === 'e_block') {
          return `fn${typeParams}(${params})${retType} ${this.formatExpr(expr.body)}`;
        }
        return `fn${typeParams}(${params})${retType} => ${this.formatExpr(expr.body)}`;
      }

      case 'e_if': {
        const cond = this.formatExpr(expr.cond);
        const thenE = this.formatExpr(expr.thenExpr);
        if (expr.elseExpr) {
          const elseE = this.formatExpr(expr.elseExpr);
          return `if (${cond}) ${thenE} else ${elseE}`;
        }
        return `if (${cond}) ${thenE}`;
      }

      case 'e_match': {
        const target = this.formatExpr(expr.scrutinee);
        this.indentLevel++;
        const arms = expr.arms
          .map(a => {
            const pat = this.formatPattern(a.pattern);
            const guard = a.guard ? ` if (${this.formatExpr(a.guard)})` : '';
            const body = this.formatExpr(a.body);
            return `${this.indent()}${pat}${guard} => ${body}`;
          })
          .join('\n');
        this.indentLevel--;
        return `match (${target}) {\n${arms}\n${this.indent()}}`;
      }

      case 'e_assign': {
        const target = this.formatExpr(expr.target);
        const val = this.formatExpr(expr.value);
        return `${target} = ${val}`;
      }

      case 'e_record': {
        const fields = expr.fields.map(f => `${f.isMut ? 'mut ' : ''}${f.name}: ${this.formatExpr(f.value)}`);
        const methods = (expr.methods || []).map(m => {
          const params = m.params.map(p => (p.type ? `${p.name}: ${this.formatType(p.type)}` : p.name)).join(', ');
          const ret = m.returnType ? `: ${this.formatType(m.returnType)}` : '';
          const body = this.formatExpr(m.body);
          return `${m.name}(${m.selfParam}${params ? ', ' + params : ''})${ret} ${body}`;
        });
        const all = [...fields, ...methods];
        if (all.length === 0) return '{}';
        if (methods.length > 0) {
          return `{\n  ${all.join(',\n  ')}\n}`;
        }
        return `{ ${all.join(', ')} }`;
      }

      case 'e_record_update': {
        const base = this.formatExpr(expr.base);
        const updates = expr.updates.map(u => `${u.isMut ? 'mut ' : ''}${u.name}: ${this.formatExpr(u.value)}`).join(', ');
        return updates ? `{ ...${base}, ${updates} }` : `{ ...${base} }`;
      }

      case 'e_method_call': {
        const obj = this.formatExpr(expr.object);
        const args = expr.args.map(a => this.formatExpr(a)).join(', ');
        return `${obj}.${expr.method}(${args})`;
      }

      case 'e_field_access': {
        return `${this.formatExpr(expr.object)}.${expr.field}`;
      }

      case 'e_range': {
        const op = expr.inclusive ? '..=' : '..';
        return `${this.formatExpr(expr.start)}${op}${this.formatExpr(expr.end)}`;
      }

      case 'e_tuple': {
        const elems = expr.elements.map(e => this.formatExpr(e)).join(', ');
        return `[${elems}]`;
      }

      case 'e_index': {
        return `${this.formatExpr(expr.target)}[${this.formatExpr(expr.index)}]`;
      }

      case 'e_block': {
        if (expr.statements.length === 0 && expr.result) {
          return `{ ${this.formatExpr(expr.result)} }`;
        }
        if (expr.statements.length === 0 && !expr.result) {
          return `()`;
        }
        this.indentLevel++;
        const stmts = expr.statements.map(s => this.formatStatement(s)).join('\n');
        const res = expr.result ? `${this.indent()}${this.formatExpr(expr.result)}` : '';
        this.indentLevel--;
        const content = [stmts, res].filter(Boolean).join('\n');
        return `{\n${content}\n${this.indent()}}`;
      }

      case 'e_switch': {
        const discr = this.formatExpr(expr.discriminant);
        this.indentLevel++;
        const cases = expr.cases
          .map(c => {
            const vals = c.values && c.values.length > 0 ? c.values : (c.value ? [c.value] : []);
            const valStrs = vals.map(v => this.formatExpr(v)).join(', ');
            const body = this.formatExpr(c.body);
            return `${this.indent()}case ${valStrs}:\n${this.indent()}  ${body}`;
          })
          .join('\n');
        let defStr = '';
        if (expr.defaultCase) {
          const defBody = this.formatExpr(expr.defaultCase);
          defStr = `\n${this.indent()}default:\n${this.indent()}  ${defBody}`;
        }
        this.indentLevel--;
        return `switch (${discr}) {\n${cases}${defStr}\n${this.indent()}}`;
      }

      case 'e_list_comp': {
        const elem = this.formatExpr(expr.element);
        const iter = this.formatExpr(expr.iterable);
        const cond = expr.condition ? ` if ${this.formatExpr(expr.condition)}` : '';
        return `[${elem} for ${expr.param} in ${iter}${cond}]`;
      }

      case 'e_for': {
        let initStr = '';
        if (expr.init) {
          if (expr.init.kind.startsWith('s_')) {
            initStr = this.formatStatement(expr.init as Statement).trim();
          } else {
            initStr = this.formatExpr(expr.init as Expr);
          }
        }
        const condStr = expr.cond ? this.formatExpr(expr.cond) : '';
        const updStr = expr.update ? this.formatExpr(expr.update) : '';
        const bodyStr = this.formatExpr(expr.body);
        return `for (${initStr}; ${condStr}; ${updStr}) ${bodyStr}`;
      }

      case 'e_while': {
        const condStr = this.formatExpr(expr.cond);
        const bodyStr = this.formatExpr(expr.body);
        return `while (${condStr}) ${bodyStr}`;
      }

      case 'e_break':
        return 'break';

      case 'e_continue':
        return 'continue';

      case 'e_return':
        return expr.value ? `return ${this.formatExpr(expr.value)}` : 'return';

      case 'e_do': {
        this.indentLevel++;
        const items = expr.items.map(item => {
          switch (item.kind) {
            case 'do_bind':
              return `${this.indent()}${this.formatPattern(item.pattern)} <- ${this.formatExpr(item.expr)};`;
            case 'do_let': {
              const mutStr = item.isMut ? 'mut ' : '';
              const typeStr = item.typeAnnotation ? `: ${this.formatType(item.typeAnnotation)}` : '';
              return `${this.indent()}let ${mutStr}${item.name}${typeStr} = ${this.formatExpr(item.init)};`;
            }
            case 'do_expr':
              return `${this.indent()}${this.formatExpr(item.expr)};`;
            case 'do_return':
              return `${this.indent()}${item.isPure ? 'pure' : 'return'} ${this.formatExpr(item.expr)};`;
          }
        }).join('\n');
        this.indentLevel--;
        const monadStr = expr.monad ? `(${this.formatExpr(expr.monad)})` : '';
        return `do${monadStr} {\n${items}\n${this.indent()}}`;
      }

      case 'e_where': {
        this.indentLevel++;
        const bindings = expr.bindings.map(s => this.formatStatement(s)).join('\n');
        this.indentLevel--;
        return `${this.formatExpr(expr.expr)} where {\n${bindings}\n${this.indent()}}`;
      }

      default:
        return '/* expr */';
    }
  }

  public formatType(type: TypeAST): string {
    switch (type.kind) {
      case 'base':
        return type.name;
      case 'var':
        return type.name;
      case 'app': {
        if (type.name === 'Array' && type.args.length === 1) {
          return `${this.formatType(type.args[0])}[]`;
        }
        if (type.args.length === 0) return type.name;
        const args = type.args.map(a => this.formatType(a)).join(', ');
        return `${type.name}<${args}>`;
      }
      case 'fun': {
        const typeParams = type.typeParams && type.typeParams.length > 0 ? `<${type.typeParams.map(tp => typeParamToString(tp)).join(', ')}>` : '';
        const params = type.params.map(p => (p.name ? `${p.name}: ${this.formatType(p.type)}` : this.formatType(p.type))).join(', ');
        return `${typeParams}(${params}) => ${this.formatType(type.returnType)}`;
      }
      case 'record': {
        const fields = type.fields.map(f => `${f.isMut ? 'mut ' : ''}${f.name}: ${this.formatType(f.type)}`).join(', ');
        return `{ ${fields} }`;
      }
      case 'tuple': {
        const elems = type.elements.map(e => this.formatType(e)).join(', ');
        return `[${elems}]`;
      }
      case 'forall': {
        return `<${type.typeParams.map(tp => typeParamToString(tp)).join(', ')}>${this.formatType(type.type)}`;
      }
      case 'type_lambda': {
        const params = type.params.map(p => typeParamToString(p)).join(', ');
        return `\\${params} => ${this.formatType(type.body)}`;
      }
      case 'hkt_app': {
        const ctor = this.formatType(type.target);
        const args = type.args.map(a => this.formatType(a)).join(', ');
        return `${ctor}<${args}>`;
      }
    }
  }

  public static formatTypeAST(type: TypeAST): string {
    return new Formatter().formatType(type);
  }

  private formatPattern(pat: Pattern): string {
    switch (pat.kind) {
      case 'p_var':
        return pat.name;
      case 'p_literal':
        return JSON.stringify(pat.value);
      case 'p_ctor': {
        if (pat.args.length === 0) return pat.name;
        const args = pat.args.map(a => this.formatPattern(a)).join(', ');
        return `${pat.name}(${args})`;
      }
      case 'p_record': {
        const fields = pat.fields.map(f => `${f.name}: ${f.pattern ? this.formatPattern(f.pattern) : f.alias || f.name}`).join(', ');
        return `{ ${fields} }`;
      }
      case 'p_tuple': {
        const elems = pat.elements.map(e => this.formatPattern(e)).join(', ');
        return `[${elems}]`;
      }
      case 'p_as': {
        return `${this.formatPattern(pat.pattern)} as ${pat.name}`;
      }
      case 'p_wildcard':
        return '_';
      case 'p_rest':
        return '...';
    }
  }

  private fallbackFormat(code: string): string {
    const lines = code.split('\n');
    let level = 0;
    const formattedLines: string[] = [];

    for (let line of lines) {
      let trimmed = line.trim();
      if (!trimmed) {
        formattedLines.push('');
        continue;
      }

      // Decrement level if closing brace
      if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
        level = Math.max(0, level - 1);
      }

      const indentStr = '  '.repeat(level);
      // Clean space around = and =>
      trimmed = trimmed
        .replace(/\s*=\s*/g, ' = ')
        .replace(/\s*=>\s*/g, ' => ')
        .replace(/\s*:\s*/g, ': ')
        .replace(/\s*,\s*/g, ', ');

      formattedLines.push(indentStr + trimmed);

      // Increment level if line ends with opening brace or match block
      if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
        level++;
      }
    }

    return formattedLines.join('\n');
  }
}

export function formatTypeLangCode(code: string): string {
  const formatter = new Formatter();
  return formatter.format(code);
}
