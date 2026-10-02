// Abstract Syntax Tree for TypeLang (Draft v0.1 Specification)

export interface SourceLoc {
  line: number;
  col: number;
  endLine?: number;
  endCol?: number;
}

// ==================== KIND & TYPE AST ====================

export interface KindStarAST {
  kind: 'star';
  loc?: SourceLoc;
}

export interface KindArrowAST {
  kind: 'arrow';
  from: KindAST;
  to: KindAST;
  loc?: SourceLoc;
}

export type KindAST = KindStarAST | KindArrowAST;

export interface TypeParamAST {
  name: string;
  kindAnnotation?: KindAST;
  arity?: number; // e.g. F<_> has arity 1, F<_, _> has arity 2
  raw?: string; // e.g. 'F<_>', 'M<_, _>', 'F: * -> *'
  loc?: SourceLoc;
}

export type TypeParam = string | TypeParamAST;

export function getTypeParamName(tp: TypeParam): string {
  return typeof tp === 'string' ? tp : tp.name;
}

export function typeParamToString(tp: TypeParam): string {
  if (typeof tp === 'string') return tp;
  if (tp.raw) return tp.raw;
  if (tp.kindAnnotation) {
    return `${tp.name}: ${kindASTToString(tp.kindAnnotation)}`;
  }
  if (tp.arity && tp.arity > 0) {
    return `${tp.name}<${Array(tp.arity).fill('_').join(', ')}>`;
  }
  return tp.name;
}

export function kindASTToString(k: KindAST): string {
  if (k.kind === 'star') return '*';
  const fromStr = k.from.kind === 'arrow' ? `(${kindASTToString(k.from)})` : kindASTToString(k.from);
  return `${fromStr} -> ${kindASTToString(k.to)}`;
}

export type TypeAST =
  | TBase
  | TVar
  | TFun
  | TRecord
  | TTuple
  | TApp
  | TForall
  | TTypeLambda
  | THKTApp;

export interface TBase {
  kind: 'base';
  name: 'number' | 'boolean' | 'string' | 'void';
  loc?: SourceLoc;
}

export interface TVar {
  kind: 'var';
  name: string;
  loc?: SourceLoc;
}

export interface TFunParam {
  name?: string;
  type: TypeAST;
}

export interface TFun {
  kind: 'fun';
  typeParams: TypeParam[]; // e.g. <a> or <F<_>> for higher-order polymorphic functions
  params: TFunParam[];
  returnType: TypeAST;
  loc?: SourceLoc;
}

export interface TRecordField {
  name: string;
  type: TypeAST;
  isMut?: boolean;
  isOptional?: boolean;
}

export interface TRecord {
  kind: 'record';
  fields: TRecordField[];
  loc?: SourceLoc;
}

export interface TTuple {
  kind: 'tuple';
  elements: TypeAST[];
  loc?: SourceLoc;
}

export interface TApp {
  kind: 'app';
  name: string; // e.g. "Expr", "Array", "Packed", "F"
  args: TypeAST[];
  loc?: SourceLoc;
}

export interface TForall {
  kind: 'forall';
  typeParams: TypeParam[];
  type: TypeAST;
  loc?: SourceLoc;
}

export interface TTypeLambda {
  kind: 'type_lambda';
  params: TypeParam[];
  body: TypeAST;
  loc?: SourceLoc;
}

export interface THKTApp {
  kind: 'hkt_app';
  target: TypeAST;
  args: TypeAST[];
  loc?: SourceLoc;
}

// ==================== GADT & TYPE DECLARATIONS ====================

export interface GADTParam {
  name: string;
  type: TypeAST;
  loc?: SourceLoc;
}

export interface GADTConstructor {
  name: string;
  typeParams: TypeParam[]; // e.g. Pack<a> or Pack: <a> or Pack<F<_>>
  params: GADTParam[];
  returnType?: TypeAST; // e.g. Expr<number> or Packed
  loc?: SourceLoc;
}

export interface GADTDecl {
  kind: 'gadt';
  name: string;
  typeParams: TypeParam[];
  constructors: GADTConstructor[];
  isExported?: boolean;
  loc?: SourceLoc;
}

export interface TypeAliasDecl {
  kind: 'type_alias';
  name: string;
  typeParams: TypeParam[];
  type: TypeAST;
  isExported?: boolean;
  loc?: SourceLoc;
}

// ==================== PATTERNS ====================

export type Pattern =
  | PWildcard
  | PVar
  | PLiteral
  | PConstructor
  | PRecord
  | PTuple
  | PAs
  | PRest;

export interface PWildcard {
  kind: 'p_wildcard';
  loc?: SourceLoc;
}

export interface PVar {
  kind: 'p_var';
  name: string;
  loc?: SourceLoc;
}

export interface PLiteral {
  kind: 'p_literal';
  value: number | boolean | string | null;
  loc?: SourceLoc;
}

export interface PConstructor {
  kind: 'p_ctor';
  name: string;
  args: Pattern[];
  loc?: SourceLoc;
}

export interface PRecordFieldPattern {
  name: string;
  alias?: string;
  pattern?: Pattern;
}

export interface PRecord {
  kind: 'p_record';
  fields: PRecordFieldPattern[];
  loc?: SourceLoc;
}

export interface PTuple {
  kind: 'p_tuple';
  elements: Pattern[];
  loc?: SourceLoc;
}

export interface PAs {
  kind: 'p_as';
  pattern: Pattern;
  name: string;
  loc?: SourceLoc;
}

export interface PRest {
  kind: 'p_rest';
  loc?: SourceLoc;
}

export interface MatchArm {
  pattern: Pattern;
  guard?: Expr;
  body: Expr;
  loc?: SourceLoc;
}

// ==================== EXPRESSIONS ====================

export type DoItem =
  | DoBind
  | DoLet
  | DoExpr
  | DoReturn;

export interface DoBind {
  kind: 'do_bind';
  pattern: Pattern;
  expr: Expr;
  loc?: SourceLoc;
}

export interface DoLet {
  kind: 'do_let';
  name: string;
  isMut?: boolean;
  typeAnnotation?: TypeAST;
  init: Expr;
  loc?: SourceLoc;
}

export interface DoExpr {
  kind: 'do_expr';
  expr: Expr;
  loc?: SourceLoc;
}

export interface DoReturn {
  kind: 'do_return';
  expr: Expr;
  isPure?: boolean;
  loc?: SourceLoc;
}

export interface EDo {
  kind: 'e_do';
  monad?: Expr;
  items: DoItem[];
  loc?: SourceLoc;
}

export interface EWhere {
  kind: 'e_where';
  expr: Expr;
  bindings: Statement[];
  loc?: SourceLoc;
}

export type Expr =
  | ELiteral
  | EVar
  | EUnary
  | EBinary
  | EAssign
  | ECall
  | EMethodCall
  | EFieldAccess
  | EIndex
  | ERecord
  | ERecordUpdate
  | ETuple
  | ELambda
  | EIf
  | EBlock
  | EMatch
  | ESwitch
  | EFor
  | EWhile
  | EBreak
  | EContinue
  | EReturn
  | EListComp
  | ERange
  | EDo
  | EWhere;

export interface EFor {
  kind: 'e_for';
  init?: Statement | Expr;
  cond?: Expr;
  update?: Expr;
  body: Expr;
  loc?: SourceLoc;
}

export interface EWhile {
  kind: 'e_while';
  cond: Expr;
  body: Expr;
  loc?: SourceLoc;
}

export interface EIndex {
  kind: 'e_index';
  target: Expr;
  index: Expr;
  loc?: SourceLoc;
}

export interface ELiteral {
  kind: 'e_literal';
  value: number | boolean | string | null;
  loc?: SourceLoc;
}

export interface EVar {
  kind: 'e_var';
  name: string;
  modulePath?: string[];
  loc?: SourceLoc;
}

export interface EUnary {
  kind: 'e_unary';
  op: '-' | '!';
  expr: Expr;
  loc?: SourceLoc;
}

export interface EBinary {
  kind: 'e_binary';
  op: '+' | '-' | '*' | '/' | '%' | '==' | '!=' | '<' | '<=' | '>' | '>=' | '&&' | '||';
  left: Expr;
  right: Expr;
  loc?: SourceLoc;
}

export interface EAssign {
  kind: 'e_assign';
  target: Expr; // EVar or EFieldAccess
  value: Expr;
  op?: '=' | '+=' | '-=' | '*=' | '/=';
  loc?: SourceLoc;
}

export interface ECall {
  kind: 'e_call';
  callee: Expr;
  args: Expr[];
  typeArgs?: TypeAST[];
  loc?: SourceLoc;
}

export interface EMethodCall {
  kind: 'e_method_call';
  object: Expr;
  method: string;
  args: Expr[];
  isModuleMethod?: boolean;
  loc?: SourceLoc;
}

export interface EFieldAccess {
  kind: 'e_field_access';
  object: Expr;
  field: string;
  loc?: SourceLoc;
}

export interface ERecordFieldExpr {
  name: string;
  value: Expr;
  isMut?: boolean;
}

export interface EMethodDef {
  name: string;
  selfParam: string; // e.g. "self"
  params: { name: string; type?: TypeAST }[];
  returnType?: TypeAST;
  body: Expr;
}

export interface ERecord {
  kind: 'e_record';
  fields: ERecordFieldExpr[];
  methods?: EMethodDef[];
  loc?: SourceLoc;
}

export interface ERecordUpdate {
  kind: 'e_record_update';
  base: Expr; // e.g. person
  updates: ERecordFieldExpr[];
  loc?: SourceLoc;
}

export interface ETuple {
  kind: 'e_tuple';
  elements: Expr[];
  loc?: SourceLoc;
}

export interface ELambda {
  kind: 'e_lambda';
  typeParams: TypeParam[];
  params: { name: string; type?: TypeAST; loc?: SourceLoc }[];
  returnType?: TypeAST;
  body: Expr;
  loc?: SourceLoc;
}

export interface EIf {
  kind: 'e_if';
  cond: Expr;
  thenExpr: Expr;
  elseExpr?: Expr;
  loc?: SourceLoc;
}

export interface EBlock {
  kind: 'e_block';
  statements: Statement[];
  result?: Expr;
  loc?: SourceLoc;
}

export interface EMatch {
  kind: 'e_match';
  scrutinee: Expr;
  arms: MatchArm[];
  hasRest?: boolean;
  loc?: SourceLoc;
}

export interface SwitchCase {
  values?: Expr[];
  value: Expr;
  body: Expr;
  loc?: SourceLoc;
}

export interface ESwitch {
  kind: 'e_switch';
  discriminant: Expr;
  cases: SwitchCase[];
  defaultCase?: Expr;
  loc?: SourceLoc;
}

export interface EListComp {
  kind: 'e_list_comp';
  element: Expr;
  param: string;
  iterable: Expr;
  condition?: Expr;
  loc?: SourceLoc;
}

export interface ERange {
  kind: 'e_range';
  start: Expr;
  end: Expr;
  inclusive: boolean;
  loc?: SourceLoc;
}

// ==================== STATEMENTS & DECLARATIONS ====================

export type Statement =
  | SLet
  | SExpr
  | SFunction
  | SGADT
  | STypeAlias
  | SModule
  | SImport
  | SExternFunction
  | SExternType
  | SExternValue
  | SExternModule;

export interface SExternFunction {
  kind: 's_extern_function';
  name: string;
  moduleName?: string;
  typeParams: TypeParam[];
  params: { name: string; type: TypeAST; isOptional?: boolean }[];
  returnType: TypeAST;
  jsSymbol?: string;
  isExported?: boolean;
  loc?: SourceLoc;
}

export interface SExternType {
  kind: 's_extern_type';
  name: string;
  typeParams: TypeParam[];
  type: TypeAST;
  isExported?: boolean;
  loc?: SourceLoc;
}

export interface SExternValue {
  kind: 's_extern_value';
  name: string;
  moduleName?: string;
  type: TypeAST;
  jsSymbol?: string;
  isExported?: boolean;
  loc?: SourceLoc;
}

export interface SExternModule {
  kind: 's_extern_module';
  name: string;
  functions: SExternFunction[];
  types: SExternType[];
  values: SExternValue[];
  isExported?: boolean;
  loc?: SourceLoc;
}

export interface SLet {
  kind: 's_let';
  name: string;
  isMut?: boolean;
  typeAnnotation?: TypeAST;
  init: Expr;
  isExported?: boolean;
  loc?: SourceLoc;
}

export interface SExpr {
  kind: 's_expr';
  expr: Expr;
  loc?: SourceLoc;
}

export interface SFunction {
  kind: 's_function';
  name: string;
  typeParams: TypeParam[];
  params: { name: string; type: TypeAST; loc?: SourceLoc }[];
  returnType: TypeAST;
  body: Expr;
  whereBindings?: Statement[];
  isExported?: boolean;
  loc?: SourceLoc;
}

export interface SGADT {
  kind: 's_gadt';
  decl: GADTDecl;
  isExported?: boolean;
  loc?: SourceLoc;
}

export interface STypeAlias {
  kind: 's_type_alias';
  decl: TypeAliasDecl;
  isExported?: boolean;
  loc?: SourceLoc;
}

export interface SModule {
  kind: 's_module';
  name: string;
  body: Statement[];
  isExported?: boolean;
  loc?: SourceLoc;
}

export interface ImportSpecifier {
  name: string;
  alias?: string;
  isAll?: boolean; // import Expr.{ * }
}

export interface SImport {
  kind: 's_import';
  modulePath: string[]; // e.g. ["Expr"] or ["Data", "List"]
  specifiers?: ImportSpecifier[]; // null/empty means import Module as whole or import Module as E
  alias?: string; // e.g. import Expr as E
  loc?: SourceLoc;
}

export interface Program {
  statements: Statement[];
}

export interface EBreak {
  kind: 'e_break';
  loc?: SourceLoc;
}

export interface EContinue {
  kind: 'e_continue';
  loc?: SourceLoc;
}

export interface EReturn {
  kind: 'e_return';
  value?: Expr;
  loc?: SourceLoc;
}

/**
 * Desugars a monadic `do` expression into nested calls to `flatMap` and `pure`.
 */
export function desugarDo(expr: EDo): Expr {
  return desugarDoItems(expr.monad, expr.items, 0, expr.loc);
}

function desugarDoItems(monad: Expr | undefined, items: DoItem[], index: number, loc?: SourceLoc): Expr {
  if (index >= items.length) {
    return { kind: 'e_literal', value: null, loc };
  }

  const item = items[index];
  const isLast = index === items.length - 1;

  if (isLast) {
    if (item.kind === 'do_return') {
      const callee: Expr = monad
        ? { kind: 'e_field_access', object: monad, field: 'pure', loc: item.loc }
        : { kind: 'e_var', name: 'pure', loc: item.loc };
      (callee as any).isDoDesugared = true;
      (callee as any).doOp = 'pure';
      (callee as any).doItem = item;
      (callee as any).doMonad = monad;
      (callee as any).doScopeLoc = loc;

      const callExpr: Expr = {
        kind: 'e_call',
        callee,
        args: [item.expr],
        loc: item.loc
      };
      (callExpr as any).isDoDesugared = true;
      (callExpr as any).doOp = 'pure';
      (callExpr as any).doItem = item;
      (callExpr as any).doMonad = monad;
      (callExpr as any).doScopeLoc = loc;

      return monad || item.isPure ? callExpr : item.expr;
    }
    if (item.kind === 'do_expr') {
      if (monad && item.expr.kind === 'e_call' && item.expr.callee.kind === 'e_var' && item.expr.callee.name === 'pure') {
        const callee: Expr = { kind: 'e_field_access', object: monad, field: 'pure', loc: item.expr.loc };
        (callee as any).isDoDesugared = true;
        (callee as any).doOp = 'pure';
        (callee as any).doItem = item;
        (callee as any).doMonad = monad;
        (callee as any).doScopeLoc = loc;

        const callExpr: Expr = {
          kind: 'e_call',
          callee,
          args: item.expr.args,
          loc: item.expr.loc
        };
        (callExpr as any).isDoDesugared = true;
        (callExpr as any).doOp = 'pure';
        (callExpr as any).doItem = item;
        (callExpr as any).doMonad = monad;
        (callExpr as any).doScopeLoc = loc;
        return callExpr;
      }
      return item.expr;
    }
    if (item.kind === 'do_bind') {
      return item.expr;
    }
    if (item.kind === 'do_let') {
      return {
        kind: 'e_block',
        statements: [{
          kind: 's_let',
          name: item.name,
          isMut: item.isMut,
          typeAnnotation: item.typeAnnotation,
          init: item.init,
          loc: item.loc
        }],
        result: { kind: 'e_var', name: item.name, loc: item.loc },
        loc: item.loc
      };
    }
  }

  // Intermediate item
  const restExpr = desugarDoItems(monad, items, index + 1, loc);

  if (item.kind === 'do_let') {
    return {
      kind: 'e_block',
      statements: [{
        kind: 's_let',
        name: item.name,
        isMut: item.isMut,
        typeAnnotation: item.typeAnnotation,
        init: item.init,
        loc: item.loc
      }],
      result: restExpr,
      loc: item.loc
    };
  }

  if (item.kind === 'do_bind') {
    let lambdaBody: Expr = restExpr;
    let paramName: string;

    if (item.pattern.kind === 'p_var') {
      paramName = item.pattern.name;
    } else {
      paramName = `$m_val_${index}`;
      lambdaBody = {
        kind: 'e_match',
        scrutinee: { kind: 'e_var', name: paramName, loc: item.loc },
        arms: [{ pattern: item.pattern, body: restExpr, loc: item.loc }],
        loc: item.loc
      };
    }

    const lambda: Expr = {
      kind: 'e_lambda',
      typeParams: [],
      params: [{ name: paramName, loc: item.pattern.kind === 'p_var' && item.pattern.loc ? item.pattern.loc : item.loc }],
      body: lambdaBody,
      loc: item.loc
    };
    (lambda as any).isDoBind = true;
    (lambda as any).doVarName = paramName;
    (lambda as any).doScopeLoc = loc;
    (lambda as any).doItem = item;

    const callee: Expr = monad
      ? { kind: 'e_field_access', object: monad, field: 'flatMap', loc: item.loc }
      : { kind: 'e_var', name: 'flatMap', loc: item.loc };
    (callee as any).isDoDesugared = true;
    (callee as any).doOp = 'flatMap';
    (callee as any).doItem = item;
    (callee as any).doMonad = monad;
    (callee as any).doScopeLoc = loc;
    (callee as any).doVarName = paramName;

    const callExpr: Expr = {
      kind: 'e_call',
      callee,
      args: [item.expr, lambda],
      loc: item.loc
    };
    (callExpr as any).isDoDesugared = true;
    (callExpr as any).doOp = 'flatMap';
    (callExpr as any).doItem = item;
    (callExpr as any).doMonad = monad;
    (callExpr as any).doScopeLoc = loc;
    (callExpr as any).doVarName = paramName;

    return callExpr;
  }

  if (item.kind === 'do_expr') {
    const lambda: Expr = {
      kind: 'e_lambda',
      typeParams: [],
      params: [{ name: `_unused_${index}`, loc: item.loc }],
      body: restExpr,
      loc: item.loc
    };
    (lambda as any).isDoBind = true;
    (lambda as any).doScopeLoc = loc;
    (lambda as any).doItem = item;

    const callee: Expr = monad
      ? { kind: 'e_field_access', object: monad, field: 'flatMap', loc: item.loc }
      : { kind: 'e_var', name: 'flatMap', loc: item.loc };
    (callee as any).isDoDesugared = true;
    (callee as any).doOp = 'flatMap';
    (callee as any).doItem = item;
    (callee as any).doMonad = monad;
    (callee as any).doScopeLoc = loc;

    const callExpr: Expr = {
      kind: 'e_call',
      callee,
      args: [item.expr, lambda],
      loc: item.loc
    };
    (callExpr as any).isDoDesugared = true;
    (callExpr as any).doOp = 'flatMap';
    (callExpr as any).doItem = item;
    (callExpr as any).doMonad = monad;
    (callExpr as any).doScopeLoc = loc;

    return callExpr;
  }

  if (item.kind === 'do_return') {
    const callee: Expr = monad
      ? { kind: 'e_field_access', object: monad, field: 'pure', loc: item.loc }
      : { kind: 'e_var', name: 'pure', loc: item.loc };
    (callee as any).isDoDesugared = true;
    (callee as any).doOp = 'pure';
    (callee as any).doItem = item;
    (callee as any).doMonad = monad;
    (callee as any).doScopeLoc = loc;

    const callExpr: Expr = {
      kind: 'e_call',
      callee,
      args: [item.expr],
      loc: item.loc
    };
    (callExpr as any).isDoDesugared = true;
    (callExpr as any).doOp = 'pure';
    (callExpr as any).doItem = item;
    (callExpr as any).doMonad = monad;
    (callExpr as any).doScopeLoc = loc;

    return monad || item.isPure ? callExpr : item.expr;
  }

  return restExpr;
}
