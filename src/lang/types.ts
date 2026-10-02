// Type System representation and utility helpers for TypeLang (Draft v0.1 Specification)

import { TypeAST, TypeParam, getTypeParamName, typeParamToString } from './ast';

// ==================== KIND SYSTEM ====================

export type Kind =
  | { kind: 'star' }
  | { kind: 'arrow'; from: Kind; to: Kind };

export const KIND_STAR: Kind = { kind: 'star' };

export function kindArrow(from: Kind, to: Kind): Kind {
  return { kind: 'arrow', from, to };
}

export function makeKindN(arity: number): Kind {
  let k: Kind = KIND_STAR;
  for (let i = 0; i < arity; i++) {
    k = kindArrow(KIND_STAR, k);
  }
  return k;
}

export function kindArity(k: Kind): number {
  let count = 0;
  let curr = k;
  while (curr.kind === 'arrow') {
    count++;
    curr = curr.to;
  }
  return count;
}

export function kindToString(k: Kind): string {
  if (k.kind === 'star') return '*';
  const fromStr = k.from.kind === 'arrow' ? `(${kindToString(k.from)})` : kindToString(k.from);
  return `${fromStr} -> ${kindToString(k.to)}`;
}

export function kindEquals(k1: Kind, k2: Kind): boolean {
  if (k1.kind === 'star' && k2.kind === 'star') return true;
  if (k1.kind === 'arrow' && k2.kind === 'arrow') {
    return kindEquals(k1.from, k2.from) && kindEquals(k1.to, k2.to);
  }
  return false;
}

// ==================== TYPES ====================

export type Type =
  | TPrim
  | TVar
  | TPoly
  | TFun
  | TRec
  | TTup
  | TCons
  | TExistential
  | THKTApp
  | TTypeLambda;

export interface TPrim {
  kind: 'prim';
  name: 'number' | 'boolean' | 'string' | 'void';
}

export interface TVar {
  kind: 'var';
  id: number;
  name?: string;
  typeKind?: Kind; // Higher-Order Type: Kind of type variable (default: *)
  instance?: Type;
}

export interface TPoly {
  kind: 'poly';
  quantifiers: string[]; // e.g. ['a', 'b', 'F']
  quantifierKinds?: Map<string, Kind>; // HOTs: Kinds for quantifiers e.g. F: * -> *
  type: Type;
}

export interface TFun {
  kind: 'fun';
  params: { name?: string; type: Type }[];
  returnType: Type;
}

export interface TRecField {
  name: string;
  type: Type;
  isMut?: boolean;
  isOptional?: boolean;
}

export interface TRec {
  kind: 'rec';
  fields: TRecField[];
  isModule?: boolean;
}

export interface TTup {
  kind: 'tup';
  elements: Type[];
}

export interface TCons {
  kind: 'cons';
  name: string; // e.g. "Expr", "Array", "Option"
  args: Type[];
  typeKind?: Kind;
}

export interface THKTApp {
  kind: 'hkt_app';
  constructor: Type; // e.g. TVar('F') with kind * -> * or TCons('Option', []) or TTypeLambda
  args: Type[];
}

export interface TTypeLambda {
  kind: 'type_lambda';
  params: string[];
  body: Type;
  kindSig?: Kind;
}

export interface TExistential {
  kind: 'existential';
  name: string;
  id: number;
}

export interface QuickFix {
  title: string;
  replacementText?: string;
  targetLine?: number;
  actionKind?: 'replace_line' | 'insert_arm' | 'wrap_expression' | 'add_let' | 'add_match_arm';
}

export interface DiagnosticLabel {
  line: number;
  col: number;
  endLine?: number;
  endCol?: number;
  message?: string;
  color?: 'red' | 'yellow' | 'blue' | 'cyan' | 'green' | 'magenta' | 'brightRed' | 'brightCyan' | 'brightYellow' | 'brightBlue' | string;
  style?: 'primary' | 'secondary';
}

export interface Diagnostic {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line: number;
  col: number;
  endLine?: number;
  endCol?: number;
  codeSnippet?: string;
  caretMarker?: string;
  category?: 'Type Unification' | 'Type Checking' | 'Kind Checking' | 'Syntax Error' | 'Missing Arm' | 'Undefined Symbol' | 'Immutability Violation' | 'Pattern Match' | 'Control Flow' | 'General';
  labels?: DiagnosticLabel[];
  quickFixes?: QuickFix[];
  ariadneReport?: string;
  ariadneReportPlain?: string;
  fileId?: string;
  filename?: string;
}

// Built-in Primitives
export const PRIM_NUMBER: TPrim = { kind: 'prim', name: 'number' };
export const PRIM_BOOLEAN: TPrim = { kind: 'prim', name: 'boolean' };
export const PRIM_STRING: TPrim = { kind: 'prim', name: 'string' };
export const PRIM_VOID: TPrim = { kind: 'prim', name: 'void' };

let varCounter = 0;

export function freshTypeVar(name?: string, typeKind: Kind = KIND_STAR): TVar {
  return {
    kind: 'var',
    id: ++varCounter,
    name,
    typeKind
  };
}

let existentialCounter = 0;
export function freshExistential(name: string): TExistential {
  return {
    kind: 'existential',
    name,
    id: ++existentialCounter
  };
}

export function prune(type: Type, visited = new Set<Type>()): Type {
  if (type.kind === 'var' && type.instance) {
    if (visited.has(type)) {
      return type;
    }
    visited.add(type);
    type.instance = prune(type.instance, visited);
    return type.instance;
  }

  if (type.kind === 'hkt_app') {
    const ctor = prune(type.constructor, visited);
    const args = type.args.map(a => prune(a, visited));

    // If constructor resolved to a simple named constructor
    if (ctor.kind === 'cons') {
      if (ctor.name === 'Array' || ctor.name === 'list') {
        return { kind: 'tup', elements: [args[0] || freshTypeVar('a')] };
      }
      return { kind: 'cons', name: ctor.name, args: [...ctor.args, ...args] };
    }

    // If constructor resolved to a type lambda, beta-reduce!
    if (ctor.kind === 'type_lambda') {
      const subst = new Map<string, Type>();
      ctor.params.forEach((p, idx) => {
        if (args[idx]) subst.set(p, args[idx]);
      });
      return prune(substituteInType(ctor.body, subst), visited);
    }

    return { kind: 'hkt_app', constructor: ctor, args };
  }

  return type;
}

export function substituteInType(type: Type, map: Map<string, Type>, visited = new Map<Type, Type>()): Type {
  if (visited.has(type)) return visited.get(type)!;

  switch (type.kind) {
    case 'var':
      if (type.name && map.has(type.name)) return map.get(type.name)!;
      if (type.instance) return substituteInType(type.instance, map, visited);
      return type;
    case 'fun': {
      const newFun: TFun = { kind: 'fun', params: [], returnType: PRIM_VOID };
      visited.set(type, newFun);
      newFun.params = type.params.map(p => ({ ...p, type: substituteInType(p.type, map, visited) }));
      newFun.returnType = substituteInType(type.returnType, map, visited);
      return newFun;
    }
    case 'rec': {
      const newRec: TRec = { kind: 'rec', fields: [] };
      visited.set(type, newRec);
      newRec.fields = type.fields.map(f => ({ ...f, type: substituteInType(f.type, map, visited) }));
      return newRec;
    }
    case 'tup': {
      const newTup: TTup = { kind: 'tup', elements: [] };
      visited.set(type, newTup);
      newTup.elements = type.elements.map(e => substituteInType(e, map, visited));
      return newTup;
    }
    case 'cons': {
      if (map.has(type.name) && type.args.length === 0) {
        return map.get(type.name)!;
      }
      if (map.has(type.name) && type.args.length > 0) {
        const target = map.get(type.name)!;
        const newArgs = type.args.map(a => substituteInType(a, map, visited));
        if (target.kind === 'cons') {
          return { kind: 'cons', name: target.name, args: [...target.args, ...newArgs] };
        }
        return { kind: 'hkt_app', constructor: target, args: newArgs };
      }
      return { kind: 'cons', name: type.name, args: type.args.map(a => substituteInType(a, map, visited)) };
    }
    case 'hkt_app': {
      const newCtor = substituteInType(type.constructor, map, visited);
      const newArgs = type.args.map(a => substituteInType(a, map, visited));
      return { kind: 'hkt_app', constructor: newCtor, args: newArgs };
    }
    case 'type_lambda': {
      const filteredMap = new Map(map);
      for (const p of type.params) filteredMap.delete(p);
      return { kind: 'type_lambda', params: type.params, body: substituteInType(type.body, filteredMap, visited) };
    }
    case 'poly': {
      const filteredMap = new Map(map);
      for (const q of type.quantifiers) filteredMap.delete(q);
      return { kind: 'poly', quantifiers: type.quantifiers, quantifierKinds: type.quantifierKinds, type: substituteInType(type.type, filteredMap, visited) };
    }
    default:
      return type;
  }
}

export function typeToString(t: Type, visiting = new Set<Type>()): string {
  const type = prune(t);
  if (visiting.has(type)) {
    return 'Self';
  }
  visiting.add(type);

  let result = '';
  switch (type.kind) {
    case 'prim':
      result = type.name;
      break;
    case 'var':
      result = type.instance ? typeToString(type.instance, visiting) : type.name || `'t${type.id}`;
      break;
    case 'existential':
      result = `∃${type.name}_${type.id}`;
      break;
    case 'poly': {
      const qStrings = type.quantifiers.map(q => {
        if (type.quantifierKinds && type.quantifierKinds.has(q)) {
          const k = type.quantifierKinds.get(q)!;
          if (k.kind === 'arrow') {
            const arity = kindArity(k);
            return `${q}<${Array(arity).fill('_').join(', ')}>`;
          }
        }
        return q;
      });
      result = `<${qStrings.join(', ')}>${typeToString(type.type, visiting)}`;
      break;
    }
    case 'fun': {
      const params = type.params
        .map(p => (p.name ? `${p.name}: ${typeToString(p.type, visiting)}` : typeToString(p.type, visiting)))
        .join(', ');
      result = `(${params}) => ${typeToString(type.returnType, visiting)}`;
      break;
    }
    case 'rec': {
      const fields = type.fields
        .map(f => `${f.isMut ? 'mut ' : ''}${f.name}${f.isOptional ? '?' : ''}: ${typeToString(f.type, visiting)}`)
        .join(', ');
      result = `{ ${fields} }`;
      break;
    }
    case 'tup':
      result = `[${type.elements.map(e => typeToString(e, visiting)).join(', ')}]`;
      break;
    case 'cons':
      result = type.args.length > 0
        ? `${type.name}<${type.args.map(a => typeToString(a, visiting)).join(', ')}>`
        : type.name;
      break;
    case 'hkt_app': {
      const ctorStr = typeToString(type.constructor, visiting);
      const argsStr = type.args.map(a => typeToString(a, visiting)).join(', ');
      result = `${ctorStr}<${argsStr}>`;
      break;
    }
    case 'type_lambda':
      result = `λ<${type.params.join(', ')}> => ${typeToString(type.body, visiting)}`;
      break;
  }

  visiting.delete(type);
  return result;
}

export function typeASTToString(t: TypeAST): string {
  switch (t.kind) {
    case 'base':
      return t.name;
    case 'var':
      return t.name;
    case 'fun': {
      const params = t.params
        .map(p => (p.name ? `${p.name}: ${typeASTToString(p.type)}` : typeASTToString(p.type)))
        .join(', ');
      const tParams = t.typeParams.length > 0 ? `<${t.typeParams.map(typeParamToString).join(', ')}>` : '';
      return `${tParams}(${params}) => ${typeASTToString(t.returnType)}`;
    }
    case 'record': {
      const fields = t.fields
        .map(f => `${f.isMut ? 'mut ' : ''}${f.name}${f.isOptional ? '?' : ''}: ${typeASTToString(f.type)}`)
        .join(', ');
      return `{ ${fields} }`;
    }
    case 'tuple':
      return `[${t.elements.map(e => typeASTToString(e)).join(', ')}]`;
    case 'app':
      return t.args.length > 0
        ? `${t.name}<${t.args.map(a => typeASTToString(a)).join(', ')}>`
        : t.name;
    case 'hkt_app':
      return `${typeASTToString(t.target)}<${t.args.map(a => typeASTToString(a)).join(', ')}>`;
    case 'type_lambda':
      return `λ<${t.params.map(typeParamToString).join(', ')}> => ${typeASTToString(t.body)}`;
    case 'forall':
      return `<${t.typeParams.map(typeParamToString).join(', ')}>${typeASTToString(t.type)}`;
    default:
      return 'unknown';
  }
}
