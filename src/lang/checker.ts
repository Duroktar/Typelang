import { getParameterDoc, renderDocComment } from './docComments';
import { getRootBuiltinDoc, getStdLibMemberDoc, getStdLibModuleDoc } from './stdlibDocs';
// Bidirectional Type Checker & GADT Engine for TypeLang (Draft v0.1 Specification)
import {
  Program,
  Statement,
  Expr,
  Pattern,
  TypeAST,
  MatchArm,
  SourceLoc,
  GADTConstructor,
  GADTDecl,
  EFieldAccess,
  TypeParam,
  TypeParamAST,
  KindAST,
  getTypeParamName,
  typeParamToString,
  kindASTToString,
  desugarDo
} from './ast';
import {
  Type,
  PRIM_NUMBER,
  PRIM_BOOLEAN,
  PRIM_STRING,
  PRIM_VOID,
  Diagnostic,
  DiagnosticLabel,
  QuickFix,
  freshTypeVar,
  freshExistential,
  prune,
  typeToString,
  TVar,
  TCons,
  TRec,
  TFun,
  TTup,
  TPoly,
  THKTApp,
  TTypeLambda,
  Kind,
  KIND_STAR,
  kindArrow,
  makeKindN,
  kindArity,
  kindToString,
  kindEquals
} from './types';

export function astToKind(k?: KindAST): Kind {
  if (!k) return KIND_STAR;
  if (k.kind === 'star') return KIND_STAR;
  if (k.kind === 'arrow') return kindArrow(astToKind(k.from), astToKind(k.to));
  return KIND_STAR;
}

export function getTypeParamKind(tp: TypeParam): Kind {
  if (typeof tp === 'string') return KIND_STAR;
  if (tp.kindAnnotation) {
    return astToKind(tp.kindAnnotation);
  }
  if (tp.arity !== undefined && tp.arity > 0) {
    return makeKindN(tp.arity);
  }
  return KIND_STAR;
}

export function createTypeVarForParam(tp: TypeParam): TVar {
  const name = getTypeParamName(tp);
  const kind = getTypeParamKind(tp);
  return freshTypeVar(name, kind);
}

export interface TypeEnv {
  vars: Map<string, Type>;
  mutVars: Set<string>;
  gadts: Map<string, { name: string; typeParams: TypeParam[]; constructors: GADTConstructor[] }>;
  typeAliases: Map<string, { typeParams: TypeParam[]; type: Type }>;
  modules: Map<string, TypeEnv>;
  exports: Set<string>;
  parent?: TypeEnv;
  currentReturnType?: Type;
  defLocs?: Map<string, SourceLoc>;
  docs?: Map<string, string>;
  moduleDoc?: string;
}

export interface ScopeSymbol {
  name: string;
  type: Type;
  kind: 'parameter' | 'variable' | 'function' | 'pattern' | 'loop' | 'field' | 'module' | 'gadt' | 'constructor' | 'type_alias' | 'extern' | 'reference';
  isMut?: boolean;
  isExported?: boolean;
  loc?: SourceLoc;
  scopeRange?: {
    startLine: number;
    startCol: number;
    endLine: number;
    endCol: number;
  };
  doc?: string;
  signature?: string;
  containerName?: string;
}

export function createScopedEnv(parent?: TypeEnv): TypeEnv {
  return {
    vars: parent ? new Map(parent.vars) : new Map(),
    mutVars: parent ? new Set(parent.mutVars) : new Set(),
    gadts: parent ? new Map(parent.gadts) : new Map(),
    typeAliases: parent ? new Map(parent.typeAliases) : new Map(),
    modules: parent ? new Map(parent.modules) : new Map(),
    exports: new Set(),
    parent,
    currentReturnType: parent?.currentReturnType,
    defLocs: (parent && parent.defLocs) ? new Map(parent.defLocs) : new Map(),
    docs: parent?.docs ? new Map(parent.docs) : new Map(),
    moduleDoc: parent?.moduleDoc
  };
}

/**
 * Computes Levenshtein edit distance with transposition support (Damerau-Levenshtein)
 * for accurate "Did You Mean?" compiler suggestions.
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1].toLowerCase() === s2[j - 1].toLowerCase() ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
      if (
        i > 1 &&
        j > 1 &&
        s1[i - 1].toLowerCase() === s2[j - 2].toLowerCase() &&
        s1[i - 2].toLowerCase() === s2[j - 1].toLowerCase()
      ) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1); // transposition
      }
    }
  }
  return dp[m][n];
}

/**
 * Finds the closest candidate string matching target with proportional distance threshold.
 */
export function findBestSuggestion(target: string, candidates: string[], maxDist = 3): string | null {
  let best: string | null = null;
  let bestDist = Infinity;

  for (const candidate of candidates) {
    if (candidate === target) continue;
    const dist = levenshteinDistance(target, candidate);
    const threshold = Math.min(maxDist, Math.max(1, Math.floor(target.length / 2) + 1));
    if (dist <= threshold && dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }

  return best;
}

export function createInitialEnv(): TypeEnv {
  const env: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set(),
    defLocs: new Map(),
    docs: new Map()
  };

  // Standard library functions
  env.vars.set('print', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'val', type: freshTypeVar('a') }],
      returnType: PRIM_VOID
    }
  });

  env.vars.set('println', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'val', type: freshTypeVar('a') }],
      returnType: PRIM_VOID
    }
  });

  env.vars.set('to_string', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'val', type: freshTypeVar('a') }],
      returnType: PRIM_STRING
    }
  });

  env.vars.set('concat', {
    kind: 'fun',
    params: [
      { name: 'a', type: PRIM_STRING },
      { name: 'b', type: PRIM_STRING }
    ],
    returnType: PRIM_STRING
  });

  env.vars.set('parse_int', {
    kind: 'fun',
    params: [{ name: 's', type: PRIM_STRING }],
    returnType: PRIM_NUMBER
  });

  env.vars.set('parse_float', {
    kind: 'fun',
    params: [{ name: 's', type: PRIM_STRING }],
    returnType: PRIM_NUMBER
  });

  env.vars.set('time_now', {
    kind: 'fun',
    params: [],
    returnType: PRIM_NUMBER
  });

  // Standard library modules
  const mathEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };

  mathEnv.vars.set('sqrt', { kind: 'fun', params: [{ name: 'x', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('abs', { kind: 'fun', params: [{ name: 'x', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('floor', { kind: 'fun', params: [{ name: 'x', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('ceil', { kind: 'fun', params: [{ name: 'x', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('round', { kind: 'fun', params: [{ name: 'x', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('min', { kind: 'fun', params: [{ name: 'a', type: PRIM_NUMBER }, { name: 'b', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('max', { kind: 'fun', params: [{ name: 'a', type: PRIM_NUMBER }, { name: 'b', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('pow', { kind: 'fun', params: [{ name: 'base', type: PRIM_NUMBER }, { name: 'exp', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('random', { kind: 'fun', params: [], returnType: PRIM_NUMBER });
  mathEnv.vars.set('cos', { kind: 'fun', params: [{ name: 'x', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('sin', { kind: 'fun', params: [{ name: 'x', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('atan2', { kind: 'fun', params: [{ name: 'y', type: PRIM_NUMBER }, { name: 'x', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('log', { kind: 'fun', params: [{ name: 'x', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('bitwise_and', { kind: 'fun', params: [{ name: 'a', type: PRIM_NUMBER }, { name: 'b', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('bitwise_or', { kind: 'fun', params: [{ name: 'a', type: PRIM_NUMBER }, { name: 'b', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('bitwise_xor', { kind: 'fun', params: [{ name: 'a', type: PRIM_NUMBER }, { name: 'b', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('bitwise_not', { kind: 'fun', params: [{ name: 'x', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('bitwise_shl', { kind: 'fun', params: [{ name: 'a', type: PRIM_NUMBER }, { name: 'b', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('bitwise_shr', { kind: 'fun', params: [{ name: 'a', type: PRIM_NUMBER }, { name: 'b', type: PRIM_NUMBER }], returnType: PRIM_NUMBER });
  mathEnv.vars.set('PI', PRIM_NUMBER);
  mathEnv.vars.set('E', PRIM_NUMBER);
  for (const name of Array.from(mathEnv.vars.keys())) mathEnv.exports.add(name);
  env.modules.set('Math', mathEnv);

  const arrayEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };

  arrayEnv.vars.set('len', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'arr', type: { kind: 'tup', elements: [freshTypeVar('a')] } }],
      returnType: PRIM_NUMBER
    }
  });

  arrayEnv.vars.set('map', {
    kind: 'poly',
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'arr', type: { kind: 'tup', elements: [freshTypeVar('a')] } },
        { name: 'fn', type: { kind: 'fun', params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }
      ],
      returnType: { kind: 'tup', elements: [freshTypeVar('b')] }
    }
  });

  arrayEnv.vars.set('filter', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'arr', type: { kind: 'tup', elements: [freshTypeVar('a')] } },
        { name: 'fn', type: { kind: 'fun', params: [{ name: 'x', type: freshTypeVar('a') }], returnType: PRIM_BOOLEAN } }
      ],
      returnType: { kind: 'tup', elements: [freshTypeVar('a')] }
    }
  });

  arrayEnv.vars.set('reduce', {
    kind: 'poly',
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'arr', type: { kind: 'tup', elements: [freshTypeVar('a')] } },
        { name: 'init', type: freshTypeVar('b') },
        {
          name: 'fn',
          type: {
            kind: 'fun',
            params: [
              { name: 'acc', type: freshTypeVar('b') },
              { name: 'elem', type: freshTypeVar('a') }
            ],
            returnType: freshTypeVar('b')
          }
        }
      ],
      returnType: freshTypeVar('b')
    }
  });

  arrayEnv.vars.set('push', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'arr', type: { kind: 'tup', elements: [freshTypeVar('a')] } },
        { name: 'elem', type: freshTypeVar('a') }
      ],
      returnType: { kind: 'tup', elements: [freshTypeVar('a')] }
    }
  });

  arrayEnv.vars.set('slice', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'arr', type: { kind: 'tup', elements: [freshTypeVar('a')] } },
        { name: 'start', type: PRIM_NUMBER },
        { name: 'end', type: PRIM_NUMBER }
      ],
      returnType: { kind: 'tup', elements: [freshTypeVar('a')] }
    }
  });

  arrayEnv.vars.set('concat', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'a', type: { kind: 'tup', elements: [freshTypeVar('a')] } },
        { name: 'b', type: { kind: 'tup', elements: [freshTypeVar('a')] } }
      ],
      returnType: { kind: 'tup', elements: [freshTypeVar('a')] }
    }
  });

  arrayEnv.vars.set('join', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'arr', type: { kind: 'tup', elements: [freshTypeVar('a')] } },
        { name: 'sep', type: PRIM_STRING }
      ],
      returnType: PRIM_STRING
    }
  });
  for (const name of Array.from(arrayEnv.vars.keys())) arrayEnv.exports.add(name);
  env.modules.set('Array', arrayEnv);

  const stringEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };

  stringEnv.vars.set('len', {
    kind: 'fun',
    params: [{ name: 's', type: PRIM_STRING }],
    returnType: PRIM_NUMBER
  });

  stringEnv.vars.set('slice', {
    kind: 'fun',
    params: [
      { name: 's', type: PRIM_STRING },
      { name: 'start', type: PRIM_NUMBER },
      { name: 'end', type: PRIM_NUMBER }
    ],
    returnType: PRIM_STRING
  });

  stringEnv.vars.set('split', {
    kind: 'fun',
    params: [
      { name: 's', type: PRIM_STRING },
      { name: 'delim', type: PRIM_STRING }
    ],
    returnType: { kind: 'tup', elements: [PRIM_STRING] }
  });

  stringEnv.vars.set('contains', {
    kind: 'fun',
    params: [
      { name: 's', type: PRIM_STRING },
      { name: 'sub', type: PRIM_STRING }
    ],
    returnType: PRIM_BOOLEAN
  });

  stringEnv.vars.set('parseInt', {
    kind: 'fun',
    params: [{ name: 's', type: PRIM_STRING }],
    returnType: PRIM_NUMBER
  });

  stringEnv.vars.set('parseFloat', {
    kind: 'fun',
    params: [{ name: 's', type: PRIM_STRING }],
    returnType: PRIM_NUMBER
  });
  for (const name of Array.from(stringEnv.vars.keys())) stringEnv.exports.add(name);
  env.modules.set('String', stringEnv);

  // ==================== MONADIC STD LIB MODULES ====================

  // Option Module & GADT
  const optionEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };

  const optionGadt: GADTDecl = {
    kind: 'gadt',
    name: 'Option',
    typeParams: [{ name: 'a' }],
    constructors: [
      { name: 'Some', typeParams: [], params: [{ name: 'val', type: { kind: 'var', name: 'a' } }] },
      { name: 'None', typeParams: [], params: [] }
    ]
  };
  optionEnv.gadts.set('Option', optionGadt);
  env.gadts.set('Option', optionGadt);

  const someType: Type = {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'val', type: freshTypeVar('a') }],
      returnType: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] }
    }
  };

  const noneType: Type = {
    kind: 'poly',
    quantifiers: ['a'],
    type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] }
  };

  env.vars.set('Some', someType);
  env.vars.set('None', noneType);

  optionEnv.vars.set('Some', someType);
  optionEnv.vars.set('None', noneType);
  optionEnv.vars.set('pure', someType);
  optionEnv.vars.set('of', someType);

  optionEnv.vars.set('flatMap', {
    kind: 'poly',
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'opt', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] } },
        {
          name: 'fn',
          type: {
            kind: 'fun',
            params: [{ name: 'x', type: freshTypeVar('a') }],
            returnType: { kind: 'cons', name: 'Option', args: [freshTypeVar('b')] }
          }
        }
      ],
      returnType: { kind: 'cons', name: 'Option', args: [freshTypeVar('b')] }
    }
  });

  optionEnv.vars.set('map', {
    kind: 'poly',
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'opt', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] } },
        {
          name: 'fn',
          type: {
            kind: 'fun',
            params: [{ name: 'x', type: freshTypeVar('a') }],
            returnType: freshTypeVar('b')
          }
        }
      ],
      returnType: { kind: 'cons', name: 'Option', args: [freshTypeVar('b')] }
    }
  });

  optionEnv.vars.set('filter', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'opt', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] } },
        {
          name: 'pred',
          type: {
            kind: 'fun',
            params: [{ name: 'x', type: freshTypeVar('a') }],
            returnType: PRIM_BOOLEAN
          }
        }
      ],
      returnType: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] }
    }
  });

  optionEnv.vars.set('getOrElse', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'opt', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] } },
        { name: 'defaultVal', type: freshTypeVar('a') }
      ],
      returnType: freshTypeVar('a')
    }
  });

  optionEnv.vars.set('isSome', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'opt', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] } }],
      returnType: PRIM_BOOLEAN
    }
  });

  optionEnv.vars.set('isNone', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'opt', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] } }],
      returnType: PRIM_BOOLEAN
    }
  });

  optionEnv.vars.set('flatten', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'opt', type: { kind: 'cons', name: 'Option', args: [{ kind: 'cons', name: 'Option', args: [freshTypeVar('a')] }] } }],
      returnType: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] }
    }
  });

  optionEnv.vars.set('zip', {
    kind: 'poly',
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'optA', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] } },
        { name: 'optB', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('b')] } }
      ],
      returnType: { kind: 'cons', name: 'Option', args: [{ kind: 'tup', elements: [freshTypeVar('a'), freshTypeVar('b')] }] }
    }
  });

  optionEnv.vars.set('fromNullable', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'val', type: freshTypeVar('a') }],
      returnType: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] }
    }
  });

  optionEnv.vars.set('fold', {
    kind: 'poly',
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'opt', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] } },
        { name: 'defaultVal', type: freshTypeVar('b') },
        { name: 'fn', type: { kind: 'fun', params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }
      ],
      returnType: freshTypeVar('b')
    }
  });

  optionEnv.vars.set('orElse', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'opt', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] } },
        { name: 'altOpt', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] } }
      ],
      returnType: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] }
    }
  });

  optionEnv.vars.set('toResult', {
    kind: 'poly',
    quantifiers: ['a', 'e'],
    type: {
      kind: 'fun',
      params: [
        { name: 'opt', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] } },
        { name: 'err', type: freshTypeVar('e') }
      ],
      returnType: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] }
    }
  });

  optionEnv.vars.set('contains', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'opt', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] } },
        { name: 'elem', type: freshTypeVar('a') }
      ],
      returnType: PRIM_BOOLEAN
    }
  });

  optionEnv.vars.set('exists', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'opt', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] } },
        { name: 'pred', type: { kind: 'fun', params: [{ name: 'x', type: freshTypeVar('a') }], returnType: PRIM_BOOLEAN } }
      ],
      returnType: PRIM_BOOLEAN
    }
  });

  optionEnv.vars.set('tap', {
    kind: 'poly',
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'opt', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] } },
        { name: 'fn', type: { kind: 'fun', params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }
      ],
      returnType: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] }
    }
  });

  for (const name of Array.from(optionEnv.vars.keys())) optionEnv.exports.add(name);
  env.modules.set('Option', optionEnv);

  // Result Module & GADT
  const resultEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };

  const resultGadt: GADTDecl = {
    kind: 'gadt',
    name: 'Result',
    typeParams: [{ name: 'a' }, { name: 'e' }],
    constructors: [
      { name: 'Ok', typeParams: [], params: [{ name: 'val', type: { kind: 'var', name: 'a' } }] },
      { name: 'Err', typeParams: [], params: [{ name: 'err', type: { kind: 'var', name: 'e' } }] }
    ]
  };
  resultEnv.gadts.set('Result', resultGadt);
  env.gadts.set('Result', resultGadt);

  const okType: Type = {
    kind: 'poly',
    quantifiers: ['a', 'e'],
    type: {
      kind: 'fun',
      params: [{ name: 'val', type: freshTypeVar('a') }],
      returnType: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] }
    }
  };

  const errType: Type = {
    kind: 'poly',
    quantifiers: ['a', 'e'],
    type: {
      kind: 'fun',
      params: [{ name: 'err', type: freshTypeVar('e') }],
      returnType: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] }
    }
  };

  env.vars.set('Ok', okType);
  env.vars.set('Err', errType);

  resultEnv.vars.set('Ok', okType);
  resultEnv.vars.set('Err', errType);
  resultEnv.vars.set('pure', okType);
  resultEnv.vars.set('of', okType);

  resultEnv.vars.set('flatMap', {
    kind: 'poly',
    quantifiers: ['a', 'b', 'e'],
    type: {
      kind: 'fun',
      params: [
        { name: 'res', type: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] } },
        {
          name: 'fn',
          type: {
            kind: 'fun',
            params: [{ name: 'x', type: freshTypeVar('a') }],
            returnType: { kind: 'cons', name: 'Result', args: [freshTypeVar('b'), freshTypeVar('e')] }
          }
        }
      ],
      returnType: { kind: 'cons', name: 'Result', args: [freshTypeVar('b'), freshTypeVar('e')] }
    }
  });

  resultEnv.vars.set('map', {
    kind: 'poly',
    quantifiers: ['a', 'b', 'e'],
    type: {
      kind: 'fun',
      params: [
        { name: 'res', type: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] } },
        {
          name: 'fn',
          type: {
            kind: 'fun',
            params: [{ name: 'x', type: freshTypeVar('a') }],
            returnType: freshTypeVar('b')
          }
        }
      ],
      returnType: { kind: 'cons', name: 'Result', args: [freshTypeVar('b'), freshTypeVar('e')] }
    }
  });

  resultEnv.vars.set('mapError', {
    kind: 'poly',
    quantifiers: ['a', 'e', 'e2'],
    type: {
      kind: 'fun',
      params: [
        { name: 'res', type: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] } },
        {
          name: 'fn',
          type: {
            kind: 'fun',
            params: [{ name: 'err', type: freshTypeVar('e') }],
            returnType: freshTypeVar('e2')
          }
        }
      ],
      returnType: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e2')] }
    }
  });

  resultEnv.vars.set('getOrElse', {
    kind: 'poly',
    quantifiers: ['a', 'e'],
    type: {
      kind: 'fun',
      params: [
        { name: 'res', type: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] } },
        { name: 'defaultVal', type: freshTypeVar('a') }
      ],
      returnType: freshTypeVar('a')
    }
  });

  resultEnv.vars.set('isOk', {
    kind: 'poly',
    quantifiers: ['a', 'e'],
    type: {
      kind: 'fun',
      params: [{ name: 'res', type: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] } }],
      returnType: PRIM_BOOLEAN
    }
  });

  resultEnv.vars.set('isErr', {
    kind: 'poly',
    quantifiers: ['a', 'e'],
    type: {
      kind: 'fun',
      params: [{ name: 'res', type: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] } }],
      returnType: PRIM_BOOLEAN
    }
  });

  resultEnv.vars.set('flatten', {
    kind: 'poly',
    quantifiers: ['a', 'e'],
    type: {
      kind: 'fun',
      params: [{ name: 'res', type: { kind: 'cons', name: 'Result', args: [{ kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] }, freshTypeVar('e')] } }],
      returnType: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] }
    }
  });

  resultEnv.vars.set('toOption', {
    kind: 'poly',
    quantifiers: ['a', 'e'],
    type: {
      kind: 'fun',
      params: [{ name: 'res', type: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] } }],
      returnType: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] }
    }
  });

  resultEnv.vars.set('fromOption', {
    kind: 'poly',
    quantifiers: ['a', 'e'],
    type: {
      kind: 'fun',
      params: [
        { name: 'opt', type: { kind: 'cons', name: 'Option', args: [freshTypeVar('a')] } },
        { name: 'err', type: freshTypeVar('e') }
      ],
      returnType: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] }
    }
  });

  resultEnv.vars.set('fold', {
    kind: 'poly',
    quantifiers: ['a', 'e', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'res', type: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] } },
        { name: 'onErr', type: { kind: 'fun', params: [{ name: 'err', type: freshTypeVar('e') }], returnType: freshTypeVar('b') } },
        { name: 'onOk', type: { kind: 'fun', params: [{ name: 'val', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }
      ],
      returnType: freshTypeVar('b')
    }
  });

  resultEnv.vars.set('orElse', {
    kind: 'poly',
    quantifiers: ['a', 'e'],
    type: {
      kind: 'fun',
      params: [
        { name: 'res', type: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] } },
        { name: 'altRes', type: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] } }
      ],
      returnType: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] }
    }
  });

  resultEnv.vars.set('zip', {
    kind: 'poly',
    quantifiers: ['a', 'b', 'e'],
    type: {
      kind: 'fun',
      params: [
        { name: 'resA', type: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] } },
        { name: 'resB', type: { kind: 'cons', name: 'Result', args: [freshTypeVar('b'), freshTypeVar('e')] } }
      ],
      returnType: { kind: 'cons', name: 'Result', args: [{ kind: 'tup', elements: [freshTypeVar('a'), freshTypeVar('b')] }, freshTypeVar('e')] }
    }
  });

  resultEnv.vars.set('tap', {
    kind: 'poly',
    quantifiers: ['a', 'e', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'res', type: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] } },
        { name: 'fn', type: { kind: 'fun', params: [{ name: 'val', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }
      ],
      returnType: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] }
    }
  });

  resultEnv.vars.set('fromTry', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'fn', type: { kind: 'fun', params: [], returnType: freshTypeVar('a') } }],
      returnType: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), PRIM_STRING] }
    }
  });

  for (const name of Array.from(resultEnv.vars.keys())) resultEnv.exports.add(name);
  env.modules.set('Result', resultEnv);

  // Either Module & GADT
  const eitherEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };

  const eitherGadt: GADTDecl = {
    kind: 'gadt',
    name: 'Either',
    typeParams: [{ name: 'l' }, { name: 'r' }],
    constructors: [
      { name: 'Left', typeParams: [], params: [{ name: 'left', type: { kind: 'var', name: 'l' } }] },
      { name: 'Right', typeParams: [], params: [{ name: 'right', type: { kind: 'var', name: 'r' } }] }
    ]
  };
  eitherEnv.gadts.set('Either', eitherGadt);
  env.gadts.set('Either', eitherGadt);

  const leftType: Type = {
    kind: 'poly',
    quantifiers: ['l', 'r'],
    type: {
      kind: 'fun',
      params: [{ name: 'left', type: freshTypeVar('l') }],
      returnType: { kind: 'cons', name: 'Either', args: [freshTypeVar('l'), freshTypeVar('r')] }
    }
  };

  const rightType: Type = {
    kind: 'poly',
    quantifiers: ['l', 'r'],
    type: {
      kind: 'fun',
      params: [{ name: 'right', type: freshTypeVar('r') }],
      returnType: { kind: 'cons', name: 'Either', args: [freshTypeVar('l'), freshTypeVar('r')] }
    }
  };

  env.vars.set('Left', leftType);
  env.vars.set('Right', rightType);

  eitherEnv.vars.set('Left', leftType);
  eitherEnv.vars.set('Right', rightType);
  eitherEnv.vars.set('left', leftType);
  eitherEnv.vars.set('right', rightType);
  eitherEnv.vars.set('pure', rightType);
  eitherEnv.vars.set('of', rightType);

  eitherEnv.vars.set('isLeft', {
    kind: 'poly',
    quantifiers: ['l', 'r'],
    type: {
      kind: 'fun',
      params: [{ name: 'e', type: { kind: 'cons', name: 'Either', args: [freshTypeVar('l'), freshTypeVar('r')] } }],
      returnType: PRIM_BOOLEAN
    }
  });

  eitherEnv.vars.set('isRight', {
    kind: 'poly',
    quantifiers: ['l', 'r'],
    type: {
      kind: 'fun',
      params: [{ name: 'e', type: { kind: 'cons', name: 'Either', args: [freshTypeVar('l'), freshTypeVar('r')] } }],
      returnType: PRIM_BOOLEAN
    }
  });

  eitherEnv.vars.set('getOrElse', {
    kind: 'poly',
    quantifiers: ['l', 'r'],
    type: {
      kind: 'fun',
      params: [
        { name: 'e', type: { kind: 'cons', name: 'Either', args: [freshTypeVar('l'), freshTypeVar('r')] } },
        { name: 'defaultVal', type: freshTypeVar('r') }
      ],
      returnType: freshTypeVar('r')
    }
  });

  eitherEnv.vars.set('map', {
    kind: 'poly',
    quantifiers: ['l', 'r', 'r2'],
    type: {
      kind: 'fun',
      params: [
        { name: 'e', type: { kind: 'cons', name: 'Either', args: [freshTypeVar('l'), freshTypeVar('r')] } },
        { name: 'fn', type: { kind: 'fun', params: [{ name: 'x', type: freshTypeVar('r') }], returnType: freshTypeVar('r2') } }
      ],
      returnType: { kind: 'cons', name: 'Either', args: [freshTypeVar('l'), freshTypeVar('r2')] }
    }
  });

  eitherEnv.vars.set('mapLeft', {
    kind: 'poly',
    quantifiers: ['l', 'r', 'l2'],
    type: {
      kind: 'fun',
      params: [
        { name: 'e', type: { kind: 'cons', name: 'Either', args: [freshTypeVar('l'), freshTypeVar('r')] } },
        { name: 'fn', type: { kind: 'fun', params: [{ name: 'err', type: freshTypeVar('l') }], returnType: freshTypeVar('l2') } }
      ],
      returnType: { kind: 'cons', name: 'Either', args: [freshTypeVar('l2'), freshTypeVar('r')] }
    }
  });

  eitherEnv.vars.set('flatMap', {
    kind: 'poly',
    quantifiers: ['l', 'r', 'r2'],
    type: {
      kind: 'fun',
      params: [
        { name: 'e', type: { kind: 'cons', name: 'Either', args: [freshTypeVar('l'), freshTypeVar('r')] } },
        {
          name: 'fn',
          type: {
            kind: 'fun',
            params: [{ name: 'x', type: freshTypeVar('r') }],
            returnType: { kind: 'cons', name: 'Either', args: [freshTypeVar('l'), freshTypeVar('r2')] }
          }
        }
      ],
      returnType: { kind: 'cons', name: 'Either', args: [freshTypeVar('l'), freshTypeVar('r2')] }
    }
  });

  eitherEnv.vars.set('fold', {
    kind: 'poly',
    quantifiers: ['l', 'r', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'e', type: { kind: 'cons', name: 'Either', args: [freshTypeVar('l'), freshTypeVar('r')] } },
        { name: 'onLeft', type: { kind: 'fun', params: [{ name: 'l', type: freshTypeVar('l') }], returnType: freshTypeVar('b') } },
        { name: 'onRight', type: { kind: 'fun', params: [{ name: 'r', type: freshTypeVar('r') }], returnType: freshTypeVar('b') } }
      ],
      returnType: freshTypeVar('b')
    }
  });

  eitherEnv.vars.set('swap', {
    kind: 'poly',
    quantifiers: ['l', 'r'],
    type: {
      kind: 'fun',
      params: [{ name: 'e', type: { kind: 'cons', name: 'Either', args: [freshTypeVar('l'), freshTypeVar('r')] } }],
      returnType: { kind: 'cons', name: 'Either', args: [freshTypeVar('r'), freshTypeVar('l')] }
    }
  });

  eitherEnv.vars.set('toOption', {
    kind: 'poly',
    quantifiers: ['l', 'r'],
    type: {
      kind: 'fun',
      params: [{ name: 'e', type: { kind: 'cons', name: 'Either', args: [freshTypeVar('l'), freshTypeVar('r')] } }],
      returnType: { kind: 'cons', name: 'Option', args: [freshTypeVar('r')] }
    }
  });

  eitherEnv.vars.set('toResult', {
    kind: 'poly',
    quantifiers: ['l', 'r'],
    type: {
      kind: 'fun',
      params: [{ name: 'e', type: { kind: 'cons', name: 'Either', args: [freshTypeVar('l'), freshTypeVar('r')] } }],
      returnType: { kind: 'cons', name: 'Result', args: [freshTypeVar('r'), freshTypeVar('l')] }
    }
  });

  eitherEnv.vars.set('fromResult', {
    kind: 'poly',
    quantifiers: ['a', 'e'],
    type: {
      kind: 'fun',
      params: [{ name: 'res', type: { kind: 'cons', name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] } }],
      returnType: { kind: 'cons', name: 'Either', args: [freshTypeVar('e'), freshTypeVar('a')] }
    }
  });

  for (const name of Array.from(eitherEnv.vars.keys())) eitherEnv.exports.add(name);
  env.modules.set('Either', eitherEnv);

  // Reader Module
  const readerEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };

  const readerPureType: Type = {
    kind: 'poly',
    quantifiers: ['r', 'a'],
    type: {
      kind: 'fun',
      params: [{ name: 'val', type: freshTypeVar('a') }],
      returnType: { kind: 'cons', name: 'Reader', args: [freshTypeVar('r'), freshTypeVar('a')] }
    }
  };

  readerEnv.vars.set('pure', readerPureType);
  readerEnv.vars.set('of', readerPureType);

  readerEnv.vars.set('ask', {
    kind: 'poly',
    quantifiers: ['r'],
    type: {
      kind: 'fun',
      params: [],
      returnType: { kind: 'cons', name: 'Reader', args: [freshTypeVar('r'), freshTypeVar('r')] }
    }
  });

  readerEnv.vars.set('asks', {
    kind: 'poly',
    quantifiers: ['r', 'a'],
    type: {
      kind: 'fun',
      params: [{ name: 'fn', type: { kind: 'fun', params: [{ name: 'env', type: freshTypeVar('r') }], returnType: freshTypeVar('a') } }],
      returnType: { kind: 'cons', name: 'Reader', args: [freshTypeVar('r'), freshTypeVar('a')] }
    }
  });

  readerEnv.vars.set('run', {
    kind: 'poly',
    quantifiers: ['r', 'a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'reader', type: { kind: 'cons', name: 'Reader', args: [freshTypeVar('r'), freshTypeVar('a')] } },
        { name: 'environment', type: freshTypeVar('r') }
      ],
      returnType: freshTypeVar('a')
    }
  });

  readerEnv.vars.set('map', {
    kind: 'poly',
    quantifiers: ['r', 'a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'reader', type: { kind: 'cons', name: 'Reader', args: [freshTypeVar('r'), freshTypeVar('a')] } },
        { name: 'fn', type: { kind: 'fun', params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }
      ],
      returnType: { kind: 'cons', name: 'Reader', args: [freshTypeVar('r'), freshTypeVar('b')] }
    }
  });

  readerEnv.vars.set('flatMap', {
    kind: 'poly',
    quantifiers: ['r', 'a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'reader', type: { kind: 'cons', name: 'Reader', args: [freshTypeVar('r'), freshTypeVar('a')] } },
        {
          name: 'fn',
          type: {
            kind: 'fun',
            params: [{ name: 'x', type: freshTypeVar('a') }],
            returnType: { kind: 'cons', name: 'Reader', args: [freshTypeVar('r'), freshTypeVar('b')] }
          }
        }
      ],
      returnType: { kind: 'cons', name: 'Reader', args: [freshTypeVar('r'), freshTypeVar('b')] }
    }
  });

  readerEnv.vars.set('local', {
    kind: 'poly',
    quantifiers: ['r', 'r2', 'a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'reader', type: { kind: 'cons', name: 'Reader', args: [freshTypeVar('r'), freshTypeVar('a')] } },
        { name: 'transformEnv', type: { kind: 'fun', params: [{ name: 'env', type: freshTypeVar('r2') }], returnType: freshTypeVar('r') } }
      ],
      returnType: { kind: 'cons', name: 'Reader', args: [freshTypeVar('r2'), freshTypeVar('a')] }
    }
  });

  for (const name of Array.from(readerEnv.vars.keys())) readerEnv.exports.add(name);
  env.modules.set('Reader', readerEnv);

  // Writer Module
  const writerEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };

  const writerPureType: Type = {
    kind: 'poly',
    quantifiers: ['w', 'a'],
    type: {
      kind: 'fun',
      params: [{ name: 'val', type: freshTypeVar('a') }],
      returnType: { kind: 'cons', name: 'Writer', args: [freshTypeVar('w'), freshTypeVar('a')] }
    }
  };

  writerEnv.vars.set('pure', writerPureType);
  writerEnv.vars.set('of', writerPureType);

  writerEnv.vars.set('tell', {
    kind: 'poly',
    quantifiers: ['w'],
    type: {
      kind: 'fun',
      params: [{ name: 'entry', type: freshTypeVar('w') }],
      returnType: { kind: 'cons', name: 'Writer', args: [freshTypeVar('w'), PRIM_VOID] }
    }
  });

  writerEnv.vars.set('run', {
    kind: 'poly',
    quantifiers: ['w', 'a'],
    type: {
      kind: 'fun',
      params: [{ name: 'writer', type: { kind: 'cons', name: 'Writer', args: [freshTypeVar('w'), freshTypeVar('a')] } }],
      returnType: { kind: 'tup', elements: [freshTypeVar('a'), { kind: 'tup', elements: [freshTypeVar('w')] }] }
    }
  });

  writerEnv.vars.set('value', {
    kind: 'poly',
    quantifiers: ['w', 'a'],
    type: {
      kind: 'fun',
      params: [{ name: 'writer', type: { kind: 'cons', name: 'Writer', args: [freshTypeVar('w'), freshTypeVar('a')] } }],
      returnType: freshTypeVar('a')
    }
  });

  writerEnv.vars.set('log', {
    kind: 'poly',
    quantifiers: ['w', 'a'],
    type: {
      kind: 'fun',
      params: [{ name: 'writer', type: { kind: 'cons', name: 'Writer', args: [freshTypeVar('w'), freshTypeVar('a')] } }],
      returnType: { kind: 'tup', elements: [freshTypeVar('w')] }
    }
  });

  writerEnv.vars.set('map', {
    kind: 'poly',
    quantifiers: ['w', 'a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'writer', type: { kind: 'cons', name: 'Writer', args: [freshTypeVar('w'), freshTypeVar('a')] } },
        { name: 'fn', type: { kind: 'fun', params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }
      ],
      returnType: { kind: 'cons', name: 'Writer', args: [freshTypeVar('w'), freshTypeVar('b')] }
    }
  });

  writerEnv.vars.set('flatMap', {
    kind: 'poly',
    quantifiers: ['w', 'a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'writer', type: { kind: 'cons', name: 'Writer', args: [freshTypeVar('w'), freshTypeVar('a')] } },
        {
          name: 'fn',
          type: {
            kind: 'fun',
            params: [{ name: 'x', type: freshTypeVar('a') }],
            returnType: { kind: 'cons', name: 'Writer', args: [freshTypeVar('w'), freshTypeVar('b')] }
          }
        }
      ],
      returnType: { kind: 'cons', name: 'Writer', args: [freshTypeVar('w'), freshTypeVar('b')] }
    }
  });

  writerEnv.vars.set('listen', {
    kind: 'poly',
    quantifiers: ['w', 'a'],
    type: {
      kind: 'fun',
      params: [{ name: 'writer', type: { kind: 'cons', name: 'Writer', args: [freshTypeVar('w'), freshTypeVar('a')] } }],
      returnType: { kind: 'cons', name: 'Writer', args: [freshTypeVar('w'), { kind: 'tup', elements: [freshTypeVar('a'), { kind: 'tup', elements: [freshTypeVar('w')] }] }] }
    }
  });

  for (const name of Array.from(writerEnv.vars.keys())) writerEnv.exports.add(name);
  env.modules.set('Writer', writerEnv);

  // Task Module
  const taskEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };

  const taskPureType: Type = {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'val', type: freshTypeVar('a') }],
      returnType: { kind: 'cons', name: 'Task', args: [freshTypeVar('a')] }
    }
  };

  taskEnv.vars.set('pure', taskPureType);
  taskEnv.vars.set('of', taskPureType);
  taskEnv.vars.set('succeed', taskPureType);

  taskEnv.vars.set('delay', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'fn', type: { kind: 'fun', params: [], returnType: freshTypeVar('a') } }],
      returnType: { kind: 'cons', name: 'Task', args: [freshTypeVar('a')] }
    }
  });

  taskEnv.vars.set('run', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'task', type: { kind: 'cons', name: 'Task', args: [freshTypeVar('a')] } }],
      returnType: freshTypeVar('a')
    }
  });

  taskEnv.vars.set('map', {
    kind: 'poly',
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'task', type: { kind: 'cons', name: 'Task', args: [freshTypeVar('a')] } },
        { name: 'fn', type: { kind: 'fun', params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }
      ],
      returnType: { kind: 'cons', name: 'Task', args: [freshTypeVar('b')] }
    }
  });

  taskEnv.vars.set('flatMap', {
    kind: 'poly',
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'task', type: { kind: 'cons', name: 'Task', args: [freshTypeVar('a')] } },
        {
          name: 'fn',
          type: {
            kind: 'fun',
            params: [{ name: 'x', type: freshTypeVar('a') }],
            returnType: { kind: 'cons', name: 'Task', args: [freshTypeVar('b')] }
          }
        }
      ],
      returnType: { kind: 'cons', name: 'Task', args: [freshTypeVar('b')] }
    }
  });

  for (const name of Array.from(taskEnv.vars.keys())) taskEnv.exports.add(name);
  env.modules.set('Task', taskEnv);

  // IO Module
  const ioEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };

  const ioPureType: Type = {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'val', type: freshTypeVar('a') }],
      returnType: { kind: 'cons', name: 'IO', args: [freshTypeVar('a')] }
    }
  };

  ioEnv.vars.set('pure', ioPureType);
  ioEnv.vars.set('of', ioPureType);

  ioEnv.vars.set('flatMap', {
    kind: 'poly',
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'io', type: { kind: 'cons', name: 'IO', args: [freshTypeVar('a')] } },
        {
          name: 'fn',
          type: {
            kind: 'fun',
            params: [{ name: 'x', type: freshTypeVar('a') }],
            returnType: { kind: 'cons', name: 'IO', args: [freshTypeVar('b')] }
          }
        }
      ],
      returnType: { kind: 'cons', name: 'IO', args: [freshTypeVar('b')] }
    }
  });

  ioEnv.vars.set('map', {
    kind: 'poly',
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'io', type: { kind: 'cons', name: 'IO', args: [freshTypeVar('a')] } },
        {
          name: 'fn',
          type: {
            kind: 'fun',
            params: [{ name: 'x', type: freshTypeVar('a') }],
            returnType: freshTypeVar('b')
          }
        }
      ],
      returnType: { kind: 'cons', name: 'IO', args: [freshTypeVar('b')] }
    }
  });

  ioEnv.vars.set('run', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'io', type: { kind: 'cons', name: 'IO', args: [freshTypeVar('a')] } }],
      returnType: freshTypeVar('a')
    }
  });

  ioEnv.vars.set('delay', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'fn', type: { kind: 'fun', params: [], returnType: freshTypeVar('a') } }],
      returnType: { kind: 'cons', name: 'IO', args: [freshTypeVar('a')] }
    }
  });

  ioEnv.vars.set('println', {
    kind: 'fun',
    params: [{ name: 'msg', type: PRIM_STRING }],
    returnType: { kind: 'cons', name: 'IO', args: [PRIM_VOID] }
  });

  for (const name of Array.from(ioEnv.vars.keys())) ioEnv.exports.add(name);
  env.modules.set('IO', ioEnv);

  // State Module
  const stateEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };

  const statePureType: Type = {
    kind: 'poly',
    quantifiers: ['s', 'a'],
    type: {
      kind: 'fun',
      params: [{ name: 'val', type: freshTypeVar('a') }],
      returnType: { kind: 'cons', name: 'State', args: [freshTypeVar('s'), freshTypeVar('a')] }
    }
  };

  stateEnv.vars.set('pure', statePureType);
  stateEnv.vars.set('of', statePureType);

  stateEnv.vars.set('get', {
    kind: 'poly',
    quantifiers: ['s'],
    type: {
      kind: 'fun',
      params: [],
      returnType: { kind: 'cons', name: 'State', args: [freshTypeVar('s'), freshTypeVar('s')] }
    }
  });

  stateEnv.vars.set('set', {
    kind: 'poly',
    quantifiers: ['s'],
    type: {
      kind: 'fun',
      params: [{ name: 'newState', type: freshTypeVar('s') }],
      returnType: { kind: 'cons', name: 'State', args: [freshTypeVar('s'), PRIM_VOID] }
    }
  });

  stateEnv.vars.set('modify', {
    kind: 'poly',
    quantifiers: ['s'],
    type: {
      kind: 'fun',
      params: [{ name: 'fn', type: { kind: 'fun', params: [{ name: 's', type: freshTypeVar('s') }], returnType: freshTypeVar('s') } }],
      returnType: { kind: 'cons', name: 'State', args: [freshTypeVar('s'), PRIM_VOID] }
    }
  });

  stateEnv.vars.set('run', {
    kind: 'poly',
    quantifiers: ['s', 'a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'st', type: { kind: 'cons', name: 'State', args: [freshTypeVar('s'), freshTypeVar('a')] } },
        { name: 'initialState', type: freshTypeVar('s') }
      ],
      returnType: { kind: 'tup', elements: [freshTypeVar('a'), freshTypeVar('s')] }
    }
  });

  stateEnv.vars.set('evalState', {
    kind: 'poly',
    quantifiers: ['s', 'a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'st', type: { kind: 'cons', name: 'State', args: [freshTypeVar('s'), freshTypeVar('a')] } },
        { name: 'initialState', type: freshTypeVar('s') }
      ],
      returnType: freshTypeVar('a')
    }
  });

  stateEnv.vars.set('execState', {
    kind: 'poly',
    quantifiers: ['s', 'a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'st', type: { kind: 'cons', name: 'State', args: [freshTypeVar('s'), freshTypeVar('a')] } },
        { name: 'initialState', type: freshTypeVar('s') }
      ],
      returnType: freshTypeVar('s')
    }
  });

  stateEnv.vars.set('map', {
    kind: 'poly',
    quantifiers: ['s', 'a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'st', type: { kind: 'cons', name: 'State', args: [freshTypeVar('s'), freshTypeVar('a')] } },
        { name: 'fn', type: { kind: 'fun', params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }
      ],
      returnType: { kind: 'cons', name: 'State', args: [freshTypeVar('s'), freshTypeVar('b')] }
    }
  });

  stateEnv.vars.set('flatMap', {
    kind: 'poly',
    quantifiers: ['s', 'a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'st', type: { kind: 'cons', name: 'State', args: [freshTypeVar('s'), freshTypeVar('a')] } },
        {
          name: 'fn',
          type: {
            kind: 'fun',
            params: [{ name: 'x', type: freshTypeVar('a') }],
            returnType: { kind: 'cons', name: 'State', args: [freshTypeVar('s'), freshTypeVar('b')] }
          }
        }
      ],
      returnType: { kind: 'cons', name: 'State', args: [freshTypeVar('s'), freshTypeVar('b')] }
    }
  });

  for (const name of Array.from(stateEnv.vars.keys())) stateEnv.exports.add(name);
  env.modules.set('State', stateEnv);

  // Setoid Module
  const setoidEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };
  const setoidPoly = {
    kind: 'poly' as const,
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'a', type: freshTypeVar('a') }, { name: 'b', type: freshTypeVar('b') }],
      returnType: PRIM_BOOLEAN
    }
  };
  setoidEnv.vars.set('equals', setoidPoly);
  setoidEnv.vars.set('notEquals', setoidPoly);
  setoidEnv.vars.set('fromEquals', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'eqFn', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }, { name: 'y', type: freshTypeVar('a') }], returnType: PRIM_BOOLEAN } }],
      returnType: freshTypeVar('a')
    }
  });
  setoidEnv.vars.set('contramap', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'setoid', type: freshTypeVar('b') }, { name: 'fn', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }],
      returnType: freshTypeVar('a')
    }
  });
  for (const name of Array.from(setoidEnv.vars.keys())) setoidEnv.exports.add(name);
  env.modules.set('Setoid', setoidEnv);

  // Ord Module
  const ordEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };
  ordEnv.vars.set('Less', { kind: 'cons', name: 'Ordering', args: [] });
  ordEnv.vars.set('Equal', { kind: 'cons', name: 'Ordering', args: [] });
  ordEnv.vars.set('Greater', { kind: 'cons', name: 'Ordering', args: [] });
  ordEnv.vars.set('compare', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'a', type: freshTypeVar('a') }, { name: 'b', type: freshTypeVar('a') }],
      returnType: { kind: 'cons', name: 'Ordering', args: [] }
    }
  });
  ordEnv.vars.set('min', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'a', type: freshTypeVar('a') }, { name: 'b', type: freshTypeVar('a') }],
      returnType: freshTypeVar('a')
    }
  });
  ordEnv.vars.set('max', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'a', type: freshTypeVar('a') }, { name: 'b', type: freshTypeVar('a') }],
      returnType: freshTypeVar('a')
    }
  });
  ordEnv.vars.set('clamp', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'val', type: freshTypeVar('a') }, { name: 'minVal', type: freshTypeVar('a') }, { name: 'maxVal', type: freshTypeVar('a') }],
      returnType: freshTypeVar('a')
    }
  });
  ordEnv.vars.set('between', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'val', type: freshTypeVar('a') }, { name: 'minVal', type: freshTypeVar('a') }, { name: 'maxVal', type: freshTypeVar('a') }],
      returnType: PRIM_BOOLEAN
    }
  });
  ordEnv.vars.set('isLess', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'a', type: freshTypeVar('a') }, { name: 'b', type: freshTypeVar('a') }],
      returnType: PRIM_BOOLEAN
    }
  });
  ordEnv.vars.set('isGreater', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'a', type: freshTypeVar('a') }, { name: 'b', type: freshTypeVar('a') }],
      returnType: PRIM_BOOLEAN
    }
  });
  ordEnv.vars.set('isEqual', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'a', type: freshTypeVar('a') }, { name: 'b', type: freshTypeVar('a') }],
      returnType: PRIM_BOOLEAN
    }
  });
  ordEnv.vars.set('fromCompare', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'cmpFn', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }, { name: 'y', type: freshTypeVar('a') }], returnType: { kind: 'cons', name: 'Ordering', args: [] } } }],
      returnType: freshTypeVar('a')
    }
  });
  ordEnv.vars.set('contramap', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'ordB', type: freshTypeVar('b') }, { name: 'fn', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }],
      returnType: freshTypeVar('a')
    }
  });
  ordEnv.vars.set('reverse', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'ord', type: freshTypeVar('a') }],
      returnType: freshTypeVar('a')
    }
  });
  for (const name of Array.from(ordEnv.vars.keys())) ordEnv.exports.add(name);
  env.modules.set('Ord', ordEnv);

  // Semigroup & SemiGroup Modules
  const semigroupEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };
  semigroupEnv.vars.set('combine', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'a', type: freshTypeVar('a') }, { name: 'b', type: freshTypeVar('a') }],
      returnType: freshTypeVar('a')
    }
  });
  semigroupEnv.vars.set('concatAll', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'list', type: { kind: 'tup' as const, elements: [freshTypeVar('a')] } }, { name: 'fallback', type: freshTypeVar('a') }],
      returnType: freshTypeVar('a')
    }
  });
  semigroupEnv.vars.set('first', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [],
      returnType: freshTypeVar('a')
    }
  });
  semigroupEnv.vars.set('last', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [],
      returnType: freshTypeVar('a')
    }
  });
  semigroupEnv.vars.set('struct', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'semigroups', type: freshTypeVar('a') }],
      returnType: freshTypeVar('a')
    }
  });
  semigroupEnv.vars.set('dual', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'semigroup', type: freshTypeVar('a') }],
      returnType: freshTypeVar('a')
    }
  });
  for (const name of Array.from(semigroupEnv.vars.keys())) semigroupEnv.exports.add(name);
  env.modules.set('Semigroup', semigroupEnv);
  env.modules.set('SemiGroup', semigroupEnv);

  // Monoid Module
  const monoidEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };
  monoidEnv.vars.set('empty', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'typeOrName', type: PRIM_STRING }],
      returnType: freshTypeVar('a')
    }
  });
  monoidEnv.vars.set('combine', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'a', type: freshTypeVar('a') }, { name: 'b', type: freshTypeVar('a') }],
      returnType: freshTypeVar('a')
    }
  });
  monoidEnv.vars.set('concatAll', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'list', type: { kind: 'tup' as const, elements: [freshTypeVar('a')] } }, { name: 'identity', type: freshTypeVar('a') }],
      returnType: freshTypeVar('a')
    }
  });
  monoidEnv.vars.set('Sum', freshTypeVar('a'));
  monoidEnv.vars.set('Product', freshTypeVar('a'));
  monoidEnv.vars.set('String', freshTypeVar('a'));
  monoidEnv.vars.set('Array', freshTypeVar('a'));
  monoidEnv.vars.set('All', freshTypeVar('a'));
  monoidEnv.vars.set('Any', freshTypeVar('a'));
  monoidEnv.vars.set('struct', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'monoids', type: freshTypeVar('a') }],
      returnType: freshTypeVar('a')
    }
  });
  for (const name of Array.from(monoidEnv.vars.keys())) monoidEnv.exports.add(name);
  env.modules.set('Monoid', monoidEnv);

  // Group Module
  const groupEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };
  groupEnv.vars.set('invert', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'a', type: freshTypeVar('a') }],
      returnType: freshTypeVar('a')
    }
  });
  groupEnv.vars.set('subtract', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'a', type: freshTypeVar('a') }, { name: 'b', type: freshTypeVar('a') }],
      returnType: freshTypeVar('a')
    }
  });
  groupEnv.vars.set('SumNumber', freshTypeVar('a'));
  groupEnv.vars.set('ProductNonZero', freshTypeVar('a'));
  for (const name of Array.from(groupEnv.vars.keys())) groupEnv.exports.add(name);
  env.modules.set('Group', groupEnv);

  // Functor Module
  const functorEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };
  functorEnv.vars.set('map', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun' as const,
      params: [
        { name: 'fa', type: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('a')] } },
        { name: 'fn', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }
      ],
      returnType: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('b')] }
    }
  });
  functorEnv.vars.set('lift', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'fn', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }],
      returnType: { kind: 'fun' as const, params: [{ name: 'fa', type: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('a')] } }], returnType: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('b')] } }
    }
  });
  functorEnv.vars.set('as', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'fa', type: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('a')] } }, { name: 'val', type: freshTypeVar('b') }],
      returnType: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('b')] }
    }
  });
  functorEnv.vars.set('voidRight', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'fa', type: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('a')] } }],
      returnType: { kind: 'cons' as const, name: 'Option', args: [PRIM_STRING] }
    }
  });
  functorEnv.vars.set('flap', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'fab', type: freshTypeVar('a') }, { name: 'a', type: freshTypeVar('b') }],
      returnType: freshTypeVar('a')
    }
  });
  for (const name of Array.from(functorEnv.vars.keys())) functorEnv.exports.add(name);
  env.modules.set('Functor', functorEnv);

  // Contravariant Module
  const contravariantEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };
  contravariantEnv.vars.set('contramap', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'fa', type: { kind: 'fun' as const, params: [{ name: 'y', type: freshTypeVar('b') }], returnType: PRIM_BOOLEAN } }, { name: 'fn', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }],
      returnType: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }], returnType: PRIM_BOOLEAN }
    }
  });
  contravariantEnv.vars.set('cmap', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'fa', type: { kind: 'fun' as const, params: [{ name: 'y', type: freshTypeVar('b') }], returnType: PRIM_BOOLEAN } }, { name: 'fn', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }],
      returnType: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }], returnType: PRIM_BOOLEAN }
    }
  });
  contravariantEnv.vars.set('predicate', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'pred', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }], returnType: PRIM_BOOLEAN } }],
      returnType: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }], returnType: PRIM_BOOLEAN }
    }
  });
  for (const name of Array.from(contravariantEnv.vars.keys())) contravariantEnv.exports.add(name);
  env.modules.set('Contravariant', contravariantEnv);

  // Applicative Module
  const applicativeEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };
  applicativeEnv.vars.set('pure', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'val', type: freshTypeVar('a') }],
      returnType: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('a')] }
    }
  });
  applicativeEnv.vars.set('ap', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun' as const,
      params: [
        { name: 'ff', type: { kind: 'cons' as const, name: 'Option', args: [{ kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') }] } },
        { name: 'fa', type: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('a')] } }
      ],
      returnType: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('b')] }
    }
  });
  applicativeEnv.vars.set('lift2', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b', 'c'],
    type: {
      kind: 'fun' as const,
      params: [
        { name: 'fn', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }, { name: 'y', type: freshTypeVar('b') }], returnType: freshTypeVar('c') } },
        { name: 'fa', type: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('a')] } },
        { name: 'fb', type: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('b')] } }
      ],
      returnType: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('c')] }
    }
  });
  applicativeEnv.vars.set('lift3', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b', 'c', 'd'],
    type: {
      kind: 'fun' as const,
      params: [
        { name: 'fn', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }, { name: 'y', type: freshTypeVar('b') }, { name: 'z', type: freshTypeVar('c') }], returnType: freshTypeVar('d') } },
        { name: 'fa', type: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('a')] } },
        { name: 'fb', type: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('b')] } },
        { name: 'fc', type: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('c')] } }
      ],
      returnType: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('d')] }
    }
  });
  applicativeEnv.vars.set('zip', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun' as const,
      params: [
        { name: 'fa', type: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('a')] } },
        { name: 'fb', type: { kind: 'cons' as const, name: 'Option', args: [freshTypeVar('b')] } }
      ],
      returnType: { kind: 'cons' as const, name: 'Option', args: [{ kind: 'tup' as const, elements: [freshTypeVar('a'), freshTypeVar('b')] }] }
    }
  });
  for (const name of Array.from(applicativeEnv.vars.keys())) applicativeEnv.exports.add(name);
  env.modules.set('Applicative', applicativeEnv);

  // Validation Module
  const validationEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };
  validationEnv.vars.set('Valid', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'val', type: freshTypeVar('a') }],
      returnType: { kind: 'cons' as const, name: 'Validation', args: [freshTypeVar('a')] }
    }
  });
  validationEnv.vars.set('Invalid', {
    kind: 'poly' as const,
    quantifiers: ['e'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'errs', type: { kind: 'tup' as const, elements: [freshTypeVar('e')] } }],
      returnType: { kind: 'cons' as const, name: 'Validation', args: [freshTypeVar('e')] }
    }
  });
  validationEnv.vars.set('pure', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'val', type: freshTypeVar('a') }],
      returnType: { kind: 'cons' as const, name: 'Validation', args: [freshTypeVar('a')] }
    }
  });
  validationEnv.vars.set('invalid', {
    kind: 'poly' as const,
    quantifiers: ['e'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'err', type: freshTypeVar('e') }],
      returnType: { kind: 'cons' as const, name: 'Validation', args: [freshTypeVar('e')] }
    }
  });
  validationEnv.vars.set('isValid', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'v', type: { kind: 'cons' as const, name: 'Validation', args: [freshTypeVar('a')] } }],
      returnType: PRIM_BOOLEAN
    }
  });
  validationEnv.vars.set('isInvalid', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'v', type: { kind: 'cons' as const, name: 'Validation', args: [freshTypeVar('a')] } }],
      returnType: PRIM_BOOLEAN
    }
  });
  validationEnv.vars.set('map', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun' as const,
      params: [
        { name: 'v', type: { kind: 'cons' as const, name: 'Validation', args: [freshTypeVar('a')] } },
        { name: 'fn', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }
      ],
      returnType: { kind: 'cons' as const, name: 'Validation', args: [freshTypeVar('b')] }
    }
  });
  validationEnv.vars.set('ap', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun' as const,
      params: [
        { name: 'vf', type: { kind: 'cons' as const, name: 'Validation', args: [{ kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') }] } },
        { name: 'va', type: { kind: 'cons' as const, name: 'Validation', args: [freshTypeVar('a')] } }
      ],
      returnType: { kind: 'cons' as const, name: 'Validation', args: [freshTypeVar('b')] }
    }
  });
  validationEnv.vars.set('accumulate', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b', 'c'],
    type: {
      kind: 'fun' as const,
      params: [
        { name: 'v1', type: { kind: 'cons' as const, name: 'Validation', args: [freshTypeVar('a')] } },
        { name: 'v2', type: { kind: 'cons' as const, name: 'Validation', args: [freshTypeVar('b')] } },
        { name: 'fn', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }, { name: 'y', type: freshTypeVar('b') }], returnType: freshTypeVar('c') } }
      ],
      returnType: { kind: 'cons' as const, name: 'Validation', args: [freshTypeVar('c')] }
    }
  });
  validationEnv.vars.set('getOrElse', {
    kind: 'poly' as const,
    quantifiers: ['a'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'v', type: { kind: 'cons' as const, name: 'Validation', args: [freshTypeVar('a')] } }, { name: 'defaultVal', type: freshTypeVar('a') }],
      returnType: freshTypeVar('a')
    }
  });
  validationEnv.vars.set('toResult', {
    kind: 'poly' as const,
    quantifiers: ['a', 'e'],
    type: {
      kind: 'fun' as const,
      params: [{ name: 'v', type: { kind: 'cons' as const, name: 'Validation', args: [freshTypeVar('a')] } }],
      returnType: { kind: 'cons' as const, name: 'Result', args: [freshTypeVar('a'), freshTypeVar('e')] }
    }
  });
  for (const name of Array.from(validationEnv.vars.keys())) validationEnv.exports.add(name);
  env.modules.set('Validation', validationEnv);

  // Bifunctor Module
  const bifunctorEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };
  bifunctorEnv.vars.set('bimap', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b', 'c', 'd'],
    type: {
      kind: 'fun' as const,
      params: [
        { name: 'fab', type: { kind: 'cons' as const, name: 'Result', args: [freshTypeVar('a'), freshTypeVar('b')] } },
        { name: 'f', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('b') }], returnType: freshTypeVar('d') } },
        { name: 'g', type: { kind: 'fun' as const, params: [{ name: 'y', type: freshTypeVar('a') }], returnType: freshTypeVar('c') } }
      ],
      returnType: { kind: 'cons' as const, name: 'Result', args: [freshTypeVar('c'), freshTypeVar('d')] }
    }
  });
  for (const name of Array.from(bifunctorEnv.vars.keys())) bifunctorEnv.exports.add(name);
  env.modules.set('Bifunctor', bifunctorEnv);

  // Profunctor Module
  const profunctorEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };
  const profunctorDimap = {
    kind: 'poly' as const,
    quantifiers: ['a', 'b', 'c', 'd'],
    type: {
      kind: 'fun' as const,
      params: [
        { name: 'pab', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } },
        { name: 'f', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('c') }], returnType: freshTypeVar('a') } },
        { name: 'g', type: { kind: 'fun' as const, params: [{ name: 'y', type: freshTypeVar('b') }], returnType: freshTypeVar('d') } }
      ],
      returnType: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('c') }], returnType: freshTypeVar('d') }
    }
  };
  profunctorEnv.vars.set('dimap', profunctorDimap);
  profunctorEnv.vars.set('promap', profunctorDimap);
  for (const name of Array.from(profunctorEnv.vars.keys())) profunctorEnv.exports.add(name);
  env.modules.set('Profunctor', profunctorEnv);

  // Foldable Module
  const foldableEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };
  foldableEnv.vars.set('foldLeft', {
    kind: 'poly' as const,
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun' as const,
      params: [
        { name: 'fa', type: { kind: 'tup' as const, elements: [freshTypeVar('a')] } },
        { name: 'initial', type: freshTypeVar('b') },
        { name: 'fn', type: { kind: 'fun' as const, params: [{ name: 'acc', type: freshTypeVar('b') }, { name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('b') } }
      ],
      returnType: freshTypeVar('b')
    }
  });
  foldableEnv.vars.set('foldMap', {
    kind: 'poly' as const,
    quantifiers: ['a', 'm'],
    type: {
      kind: 'fun' as const,
      params: [
        { name: 'fa', type: { kind: 'tup' as const, elements: [freshTypeVar('a')] } },
        { name: 'monoid', type: freshTypeVar('m') },
        { name: 'fn', type: { kind: 'fun' as const, params: [{ name: 'x', type: freshTypeVar('a') }], returnType: freshTypeVar('m') } }
      ],
      returnType: freshTypeVar('m')
    }
  });
  for (const name of Array.from(foldableEnv.vars.keys())) foldableEnv.exports.add(name);
  env.modules.set('Foldable', foldableEnv);

  const domEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };

  domEnv.vars.set('getElementById', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'id', type: PRIM_STRING }],
      returnType: freshTypeVar('a')
    }
  });

  domEnv.vars.set('createElement', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'tag', type: PRIM_STRING }],
      returnType: freshTypeVar('a')
    }
  });

  domEnv.vars.set('setText', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'el', type: freshTypeVar('a') },
        { name: 'text', type: PRIM_STRING }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('getValue', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'el', type: freshTypeVar('a') }],
      returnType: PRIM_STRING
    }
  });

  domEnv.vars.set('setValue', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'el', type: freshTypeVar('a') },
        { name: 'val', type: PRIM_STRING }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('focus', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'el', type: freshTypeVar('a') }],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('blur', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'el', type: freshTypeVar('a') }],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('setHtml', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'el', type: freshTypeVar('a') },
        { name: 'html', type: PRIM_STRING }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('setAttr', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [
        { name: 'el', type: freshTypeVar('a') },
        { name: 'attr', type: PRIM_STRING },
        { name: 'val', type: PRIM_STRING }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('appendChild', {
    kind: 'poly',
    quantifiers: ['a', 'b'],
    type: {
      kind: 'fun',
      params: [
        { name: 'parent', type: freshTypeVar('a') },
        { name: 'child', type: freshTypeVar('b') }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('addEventListener', {
    kind: 'poly',
    quantifiers: ['a', 'e'],
    type: {
      kind: 'fun',
      params: [
        { name: 'el', type: freshTypeVar('a') },
        { name: 'evt', type: PRIM_STRING },
        { name: 'handler', type: { kind: 'fun', params: [{ name: 'e', type: freshTypeVar('e') }], returnType: PRIM_VOID } }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('h', {
    kind: 'poly',
    quantifiers: ['p', 'c', 'v'],
    type: {
      kind: 'fun',
      params: [
        { name: 'tag', type: PRIM_STRING },
        { name: 'props', type: freshTypeVar('p') },
        { name: 'children', type: freshTypeVar('c') }
      ],
      returnType: freshTypeVar('v')
    }
  });

  domEnv.vars.set('mount', {
    kind: 'poly',
    quantifiers: ['c', 'v'],
    type: {
      kind: 'fun',
      params: [
        { name: 'containerId', type: freshTypeVar('c') },
        { name: 'vnode', type: freshTypeVar('v') }
      ],
      returnType: PRIM_VOID
    }
  });

  env.vars.set('requestAnimationFrame', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'callback', type: { kind: 'fun', params: [], returnType: PRIM_VOID } }
      ],
      returnType: PRIM_VOID
    }
  });

  env.vars.set('setInterval', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'callback', type: { kind: 'fun', params: [], returnType: PRIM_VOID } },
        { name: 'ms', type: PRIM_NUMBER }
      ],
      returnType: PRIM_NUMBER
    }
  });

  env.vars.set('clearInterval', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'handle', type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });

  env.vars.set('setTimeout', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'callback', type: { kind: 'fun', params: [], returnType: PRIM_VOID } },
        { name: 'ms', type: PRIM_NUMBER }
      ],
      returnType: PRIM_NUMBER
    }
  });

  env.vars.set('clearTimeout', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'handle', type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('eval', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'code', type: PRIM_STRING }],
      returnType: freshTypeVar('a')
    }
  });

  domEnv.vars.set('log', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'val', type: freshTypeVar('a') }],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('initAudio', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('playCustomTone', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'freq', type: PRIM_NUMBER },
        { name: 'waveType', type: PRIM_STRING },
        { name: 'duration', type: PRIM_NUMBER },
        { name: 'volume', type: PRIM_NUMBER },
        { name: 'attack', type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('playNoise', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'duration', type: PRIM_NUMBER },
        { name: 'volume', type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('playTone', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'freq', type: PRIM_NUMBER },
        { name: 'duration', type: PRIM_NUMBER },
        { name: 'waveType', type: PRIM_STRING },
        { name: 'volume', type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('playRamp', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'startFreq', type: PRIM_NUMBER },
        { name: 'endFreq', type: PRIM_NUMBER },
        { name: 'duration', type: PRIM_NUMBER },
        { name: 'waveType', type: PRIM_STRING },
        { name: 'volume', type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('playSequence', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'notes', type: { kind: 'tup', elements: [PRIM_NUMBER] } },
        { name: 'noteDuration', type: PRIM_NUMBER },
        { name: 'waveType', type: PRIM_STRING },
        { name: 'volume', type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('startMusic', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'id', type: PRIM_STRING },
        { name: 'notes', type: { kind: 'tup', elements: [PRIM_NUMBER] } },
        { name: 'intervalMs', type: PRIM_NUMBER },
        { name: 'waveType', type: PRIM_STRING },
        { name: 'volume', type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('stopMusic', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [{ name: 'id', type: PRIM_STRING }],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('resumeAudio', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('confetti', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'count', type: PRIM_NUMBER },
        { name: 'spread', type: PRIM_NUMBER },
        { name: 'originY', type: PRIM_NUMBER }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('setInterval', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'callback', type: { kind: 'fun', params: [], returnType: PRIM_VOID } },
        { name: 'ms', type: PRIM_NUMBER }
      ],
      returnType: PRIM_NUMBER
    }
  });

  domEnv.vars.set('clearInterval', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [{ name: 'handle', type: PRIM_NUMBER }],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('setTimeout', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'callback', type: { kind: 'fun', params: [], returnType: PRIM_VOID } },
        { name: 'ms', type: PRIM_NUMBER }
      ],
      returnType: PRIM_NUMBER
    }
  });

  domEnv.vars.set('clearTimeout', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [{ name: 'handle', type: PRIM_NUMBER }],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('requestAnimationFrame', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'callback', type: { kind: 'fun', params: [], returnType: PRIM_VOID } }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('storageGet', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [{ name: 'key', type: PRIM_STRING }],
      returnType: PRIM_STRING
    }
  });

  domEnv.vars.set('storageSet', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [
        { name: 'key', type: PRIM_STRING },
        { name: 'val', type: PRIM_STRING }
      ],
      returnType: PRIM_VOID
    }
  });

  domEnv.vars.set('storageRemove', {
    kind: 'poly',
    quantifiers: [],
    type: {
      kind: 'fun',
      params: [{ name: 'key', type: PRIM_STRING }],
      returnType: PRIM_VOID
    }
  });
  for (const name of Array.from(domEnv.vars.keys())) domEnv.exports.add(name);
  env.modules.set('DOM', domEnv);

  const nodeEnv: TypeEnv = {
    vars: new Map(),
    mutVars: new Set(),
    gadts: new Map(),
    typeAliases: new Map(),
    modules: new Map(),
    exports: new Set()
  };

  nodeEnv.vars.set('stringify', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'data', type: freshTypeVar('a') }],
      returnType: PRIM_STRING
    }
  });

  nodeEnv.vars.set('parse', {
    kind: 'poly',
    quantifiers: ['a'],
    type: {
      kind: 'fun',
      params: [{ name: 'jsonStr', type: PRIM_STRING }],
      returnType: freshTypeVar('a')
    }
  });

  nodeEnv.vars.set('envGet', {
    kind: 'fun',
    params: [{ name: 'key', type: PRIM_STRING }],
    returnType: PRIM_STRING
  });

  nodeEnv.vars.set('readFile', {
    kind: 'fun',
    params: [{ name: 'path', type: PRIM_STRING }],
    returnType: PRIM_STRING
  });

  nodeEnv.vars.set('writeFile', {
    kind: 'fun',
    params: [
      { name: 'path', type: PRIM_STRING },
      { name: 'content', type: PRIM_STRING }
    ],
    returnType: PRIM_VOID
  });

  nodeEnv.vars.set('createApp', {
    kind: 'poly',
    quantifiers: ['app'],
    type: {
      kind: 'fun',
      params: [],
      returnType: freshTypeVar('app')
    }
  });

  nodeEnv.vars.set('get', {
    kind: 'poly',
    quantifiers: ['app', 'req', 'res'],
    type: {
      kind: 'fun',
      params: [
        { name: 'app', type: freshTypeVar('app') },
        { name: 'path', type: PRIM_STRING },
        {
          name: 'handler',
          type: {
            kind: 'fun',
            params: [
              { name: 'req', type: freshTypeVar('req') },
              { name: 'res', type: freshTypeVar('res') }
            ],
            returnType: PRIM_VOID
          }
        }
      ],
      returnType: PRIM_VOID
    }
  });

  nodeEnv.vars.set('post', {
    kind: 'poly',
    quantifiers: ['app', 'req', 'res'],
    type: {
      kind: 'fun',
      params: [
        { name: 'app', type: freshTypeVar('app') },
        { name: 'path', type: PRIM_STRING },
        {
          name: 'handler',
          type: {
            kind: 'fun',
            params: [
              { name: 'req', type: freshTypeVar('req') },
              { name: 'res', type: freshTypeVar('res') }
            ],
            returnType: PRIM_VOID
          }
        }
      ],
      returnType: PRIM_VOID
    }
  });

  nodeEnv.vars.set('use', {
    kind: 'poly',
    quantifiers: ['app', 'req', 'res'],
    type: {
      kind: 'fun',
      params: [
        { name: 'app', type: freshTypeVar('app') },
        {
          name: 'middleware',
          type: {
            kind: 'fun',
            params: [
              { name: 'req', type: freshTypeVar('req') },
              { name: 'res', type: freshTypeVar('res') },
              { name: 'next', type: { kind: 'fun', params: [], returnType: PRIM_VOID } }
            ],
            returnType: PRIM_VOID
          }
        }
      ],
      returnType: PRIM_VOID
    }
  });

  nodeEnv.vars.set('listen', {
    kind: 'poly',
    quantifiers: ['app', 'server'],
    type: {
      kind: 'fun',
      params: [
        { name: 'app', type: freshTypeVar('app') },
        { name: 'port', type: PRIM_NUMBER },
        {
          name: 'callback',
          type: { kind: 'fun', params: [], returnType: PRIM_VOID }
        }
      ],
      returnType: freshTypeVar('server')
    }
  });

  nodeEnv.vars.set('send', {
    kind: 'poly',
    quantifiers: ['res'],
    type: {
      kind: 'fun',
      params: [
        { name: 'res', type: freshTypeVar('res') },
        { name: 'body', type: PRIM_STRING }
      ],
      returnType: PRIM_VOID
    }
  });

  nodeEnv.vars.set('json', {
    kind: 'poly',
    quantifiers: ['res', 'data'],
    type: {
      kind: 'fun',
      params: [
        { name: 'res', type: freshTypeVar('res') },
        { name: 'data', type: freshTypeVar('data') }
      ],
      returnType: PRIM_VOID
    }
  });

  nodeEnv.vars.set('status', {
    kind: 'poly',
    quantifiers: ['res'],
    type: {
      kind: 'fun',
      params: [
        { name: 'res', type: freshTypeVar('res') },
        { name: 'statusCode', type: PRIM_NUMBER }
      ],
      returnType: freshTypeVar('res')
    }
  });

  nodeEnv.vars.set('now', {
    kind: 'fun',
    params: [],
    returnType: PRIM_NUMBER
  });
  for (const name of Array.from(nodeEnv.vars.keys())) nodeEnv.exports.add(name);
  env.modules.set('Node', nodeEnv);

  for (const [name] of env.vars) {
    const doc = getRootBuiltinDoc(name);
    if (doc) env.docs?.set(name, doc);
  }

  for (const [moduleName, moduleEnv] of env.modules) {
    moduleEnv.docs = new Map();
    moduleEnv.moduleDoc = getStdLibModuleDoc(moduleName);
    for (const [memberName, memberType] of moduleEnv.vars) {
      const callableType = memberType.kind === 'poly' ? memberType.type : memberType;
      const parameterNames = callableType.kind === 'fun'
        ? callableType.params.map((param, index) => param.name || `arg${index + 1}`)
        : [];
      const returnType = callableType.kind === 'fun' ? typeToString(callableType.returnType) : undefined;
      const doc = getStdLibMemberDoc(moduleName, memberName, parameterNames, returnType);
      if (doc) {
        moduleEnv.docs.set(memberName, doc);
      }
    }
  }

  return env;
}

export interface CheckerOptions {
  resolveModule?: (moduleName: string) => TypeEnv | null;
}

export class TypeChecker {
  public diagnostics: Diagnostic[] = [];
  public symbols: ScopeSymbol[] = [];
  public recursionDepth = 0;
  public maxRecursionDepth = 250;
  public unifyDepth = 0;
  public maxUnifyDepth = 250;
  public astDepth = 0;
  public maxAstDepth = 250;

  private typeIdCounter = 0;
  private unifyingPairs = new Set<string>();
  private options: CheckerOptions;

  constructor(options: CheckerOptions = {}) {
    this.options = options;
  }

  public registerSymbol(sym: ScopeSymbol) {
    this.symbols.push(sym);
  }

  private getOrAssignId(t: Type): number {
    if (!(t as any)._id) {
      (t as any)._id = ++this.typeIdCounter;
    }
    return (t as any)._id;
  }

  public checkProgram(program: Program): TypeEnv {
    this.recursionDepth = 0;
    this.unifyDepth = 0;
    this.astDepth = 0;
    this.symbols = [];
    const env = createInitialEnv();
    this.checkStatementList(program.statements, env);
    return env;
  }

  private checkStatementList(statements: Statement[], env: TypeEnv) {
    // 1. First pass: Hoist type aliases & GADT type definitions
    for (const stmt of statements) {
      if (stmt.kind === 's_type_alias') {
        const typeVarMap = new Map<string, Type>();
        for (const tp of stmt.decl.typeParams) {
          const name = getTypeParamName(tp);
          typeVarMap.set(name, createTypeVarForParam(tp));
        }
        const targetType = this.astToType(stmt.decl.type, env, typeVarMap);
        env.typeAliases.set(stmt.decl.name, {
          typeParams: stmt.decl.typeParams,
          type: targetType
        });
        if (stmt.isExported) env.exports.add(stmt.decl.name);
        this.registerSymbol({
          name: stmt.decl.name,
          type: targetType,
          kind: 'type_alias',
          isExported: stmt.isExported,
          loc: stmt.decl.loc || stmt.loc,
          doc: renderDocComment(stmt.decl.docComment) || `Type Alias \`${stmt.decl.name}\``
        });
      } else if (stmt.kind === 's_gadt') {
        env.gadts.set(stmt.decl.name, {
          name: stmt.decl.name,
          typeParams: stmt.decl.typeParams,
          constructors: stmt.decl.constructors
        });
        if (stmt.isExported) env.exports.add(stmt.decl.name);
        this.registerSymbol({
          name: stmt.decl.name,
          type: { kind: 'cons', name: stmt.decl.name, args: stmt.decl.typeParams.map(tp => ({ kind: 'var', id: 0, name: getTypeParamName(tp) })) },
          kind: 'gadt',
          isExported: stmt.isExported,
          loc: stmt.decl.loc || stmt.loc,
          doc: renderDocComment(stmt.decl.docComment) || `GADT Type \`${stmt.decl.name}\``
        });

        for (const ctor of stmt.decl.constructors) {
          const ctorTypeMap = new Map<string, Type>();
          const allTypeParams = [...stmt.decl.typeParams, ...ctor.typeParams];
          const allQuantifiers: string[] = [];
          const quantifierKinds = new Map<string, Kind>();
          for (const tp of allTypeParams) {
            const name = getTypeParamName(tp);
            const kind = getTypeParamKind(tp);
            allQuantifiers.push(name);
            quantifierKinds.set(name, kind);
            ctorTypeMap.set(name, createTypeVarForParam(tp));
          }

          const params = ctor.params.map(p => ({
            name: p.name,
            type: this.astToType(p.type, env, ctorTypeMap)
          }));

          let returnType: Type;
          if (ctor.returnType) {
            returnType = this.astToType(ctor.returnType, env, ctorTypeMap);
          } else {
            const args = stmt.decl.typeParams.map(tp => ctorTypeMap.get(getTypeParamName(tp)) || createTypeVarForParam(tp));
            returnType = { kind: 'cons', name: stmt.decl.name, args };
          }

          let fnType: Type;
          if (ctor.params.length === 0) {
            fnType = returnType;
          } else {
            fnType = { kind: 'fun', params, returnType };
          }
          if (allQuantifiers.length > 0) {
            fnType = { kind: 'poly', quantifiers: allQuantifiers, quantifierKinds, type: fnType };
          }

          env.vars.set(ctor.name, fnType);
          if (ctor.loc) env.defLocs?.set(ctor.name, ctor.loc);
          if (stmt.isExported) env.exports.add(ctor.name);
          this.registerSymbol({
            name: ctor.name,
            type: fnType,
            kind: 'constructor',
            loc: ctor.loc,
            containerName: stmt.decl.name,
            doc: renderDocComment(ctor.docComment, ctor.params.map(param => param.name)) ||
              `GADT Constructor \`${ctor.name}\` for type \`${stmt.decl.name}\``
          });
        }
      }
    }

    // 2. Second pass: Hoist function declarations
    for (const stmt of statements) {
      if (stmt.kind === 's_function') {
        const typeVarMap = new Map<string, Type>();
        const quantifiers: string[] = [];
        const quantifierKinds = new Map<string, Kind>();
        for (const tp of stmt.typeParams) {
          const name = getTypeParamName(tp);
          const kind = getTypeParamKind(tp);
          quantifiers.push(name);
          quantifierKinds.set(name, kind);
          typeVarMap.set(name, createTypeVarForParam(tp));
        }
        const params = stmt.params.map(p => ({
          name: p.name,
          type: this.astToType(p.type, env, typeVarMap)
        }));
        const returnType = this.astToType(stmt.returnType, env, typeVarMap);
        let funType: Type = { kind: 'fun', params, returnType };
        if (quantifiers.length > 0) {
          funType = { kind: 'poly', quantifiers, quantifierKinds, type: funType };
        }
        env.vars.set(stmt.name, funType);
        if (stmt.loc) env.defLocs?.set(stmt.name, stmt.loc);
        if (stmt.isExported) env.exports.add(stmt.name);
      }
    }

    // 3. Third pass: Check all statements sequentially
    for (const stmt of statements) {
      this.checkStatement(stmt, env);
    }
  }

  // Convert TypeAST to internal Type
  public astToType(ast: TypeAST, env: TypeEnv, typeVarMap: Map<string, Type> = new Map()): Type {
    this.astDepth++;
    if (this.astDepth > this.maxAstDepth) {
      this.addError(
        `Type error: Exceeded maximum recursion depth of ${this.maxAstDepth} while constructing recursive GADT type AST.`,
        undefined,
        'Type Checking'
      );
      this.astDepth--;
      return freshTypeVar('depth_exceeded');
    }
    try {
      return this.astToTypeInner(ast, env, typeVarMap);
    } finally {
      this.astDepth--;
    }
  }

  private astToTypeInner(ast: TypeAST, env: TypeEnv, typeVarMap: Map<string, Type> = new Map()): Type {
    switch (ast.kind) {
      case 'base':
        switch (ast.name) {
          case 'number': return PRIM_NUMBER;
          case 'boolean': return PRIM_BOOLEAN;
          case 'string': return PRIM_STRING;
          case 'void': return PRIM_VOID;
        }
      case 'var': {
        if (typeVarMap.has(ast.name)) {
          return typeVarMap.get(ast.name)!;
        }
        // Alias lookup
        if (env.typeAliases.has(ast.name)) {
          const alias = env.typeAliases.get(ast.name)!;
          if (alias.typeParams.length === 0) return alias.type;
        }
        const v = freshTypeVar(ast.name);
        typeVarMap.set(ast.name, v);
        return v;
      }
      case 'type_lambda': {
        const localMap = new Map(typeVarMap);
        const params: string[] = [];
        for (const tp of ast.params) {
          const name = getTypeParamName(tp);
          params.push(name);
          localMap.set(name, createTypeVarForParam(tp));
        }
        const body = this.astToType(ast.body, env, localMap);
        return {
          kind: 'type_lambda',
          params,
          body
        };
      }
      case 'hkt_app': {
        const target = this.astToType(ast.target, env, typeVarMap);
        const args = ast.args.map(a => this.astToType(a, env, typeVarMap));
        return prune({
          kind: 'hkt_app',
          constructor: target,
          args
        });
      }
      case 'fun': {
        const localMap = new Map(typeVarMap);
        const quantifiers: string[] = [];
        const quantifierKinds = new Map<string, Kind>();
        for (const tp of ast.typeParams) {
          const name = getTypeParamName(tp);
          const kind = getTypeParamKind(tp);
          quantifiers.push(name);
          quantifierKinds.set(name, kind);
          localMap.set(name, createTypeVarForParam(tp));
        }
        const params = ast.params.map(p => ({
          name: p.name,
          type: this.astToType(p.type, env, localMap)
        }));
        const returnType = this.astToType(ast.returnType, env, localMap);
        const funType: Type = { kind: 'fun', params, returnType };
        if (quantifiers.length > 0) {
          return { kind: 'poly', quantifiers, quantifierKinds, type: funType };
        }
        return funType;
      }
      case 'record': {
        const fields = ast.fields.map(f => ({
          name: f.name,
          type: this.astToType(f.type, env, typeVarMap),
          isMut: f.isMut,
          isOptional: f.isOptional
        }));
        return { kind: 'rec', fields };
      }
      case 'tuple': {
        return {
          kind: 'tup',
          elements: ast.elements.map(e => this.astToType(e, env, typeVarMap))
        };
      }
      case 'app': {
        if (typeVarMap && typeVarMap.has(ast.name)) {
          const tv = typeVarMap.get(ast.name)!;
          if (!ast.args || ast.args.length === 0) {
            return tv;
          }
          return prune({
            kind: 'hkt_app',
            constructor: tv,
            args: ast.args.map(a => this.astToType(a, env, typeVarMap))
          });
        }
        if (ast.name === 'Array' || ast.name === 'list') {
          const elemType = ast.args[0] ? this.astToType(ast.args[0], env, typeVarMap) : freshTypeVar('a');
          return { kind: 'tup', elements: [elemType] };
        }
        // Alias application e.g. Id<number>
        if (env.typeAliases.has(ast.name)) {
          const alias = env.typeAliases.get(ast.name)!;
          const argTypes = ast.args.map(a => this.astToType(a, env, typeVarMap));
          const aliasSubst = new Map<string, Type>();
          alias.typeParams.forEach((tp, i) => {
            const name = getTypeParamName(tp);
            if (argTypes[i]) aliasSubst.set(name, argTypes[i]);
          });
          return this.substituteTypeParams(alias.type, aliasSubst);
        }
        return {
          kind: 'cons',
          name: ast.name,
          args: ast.args.map(a => this.astToType(a, env, typeVarMap))
        };
      }
      case 'forall': {
        const localMap = new Map(typeVarMap);
        const quantifiers: string[] = [];
        const quantifierKinds = new Map<string, Kind>();
        for (const tp of ast.typeParams) {
          const name = getTypeParamName(tp);
          const kind = getTypeParamKind(tp);
          quantifiers.push(name);
          quantifierKinds.set(name, kind);
          localMap.set(name, createTypeVarForParam(tp));
        }
        const inner = this.astToType(ast.type, env, localMap);
        return { kind: 'poly', quantifiers, quantifierKinds, type: inner };
      }
    }
  }

  private substituteTypeParams(t: Type, map: Map<string, Type>, visited = new Map<Type, Type>()): Type {
    const type = t;
    if (visited.has(type)) {
      return visited.get(type)!;
    }
    switch (type.kind) {
      case 'var':
        if (type.name && map.has(type.name)) return map.get(type.name)!;
        if (type.instance) return this.substituteTypeParams(type.instance, map, visited);
        return type;
      case 'fun': {
        const newFun: TFun = { kind: 'fun', params: [], returnType: PRIM_VOID };
        visited.set(type, newFun);
        newFun.params = type.params.map(p => ({ ...p, type: this.substituteTypeParams(p.type, map, visited) }));
        newFun.returnType = this.substituteTypeParams(type.returnType, map, visited);
        return newFun;
      }
      case 'rec': {
        const newRec: TRec = { kind: 'rec', fields: [] };
        visited.set(type, newRec);
        newRec.fields = type.fields.map(f => ({ ...f, type: this.substituteTypeParams(f.type, map, visited) }));
        return newRec;
      }
      case 'tup': {
        const newTup: TTup = { kind: 'tup', elements: [] };
        visited.set(type, newTup);
        newTup.elements = type.elements.map(e => this.substituteTypeParams(e, map, visited));
        return newTup;
      }
      case 'cons': {
        const newCons: TCons = { kind: 'cons', name: type.name, args: [] };
        visited.set(type, newCons);
        newCons.args = type.args.map(a => this.substituteTypeParams(a, map, visited));
        return newCons;
      }
      case 'poly': {
        const newPoly: TPoly = { kind: 'poly', quantifiers: type.quantifiers, quantifierKinds: type.quantifierKinds, type: PRIM_VOID };
        visited.set(type, newPoly);
        const innerMap = new Map(map);
        for (const q of type.quantifiers) innerMap.delete(q);
        newPoly.type = this.substituteTypeParams(type.type, innerMap, visited);
        return newPoly;
      }
      case 'hkt_app': {
        return prune({
          kind: 'hkt_app',
          constructor: this.substituteTypeParams(type.constructor, map, visited),
          args: type.args.map(a => this.substituteTypeParams(a, map, visited))
        });
      }
      case 'type_lambda': {
        const newMap = new Map(map);
        for (const p of type.params) newMap.delete(p);
        return {
          kind: 'type_lambda',
          params: type.params,
          body: this.substituteTypeParams(type.body, newMap, visited)
        };
      }
      default:
        return type;
    }
  }

  private checkStatement(stmt: Statement, env: TypeEnv) {
    switch (stmt.kind) {
      case 's_let': {
        let type: Type;
        if (stmt.typeAnnotation) {
          const annotated = this.astToType(stmt.typeAnnotation, env);
          this.checkExpr(stmt.init, annotated, env);
          type = annotated;
        } else {
          type = this.synthExpr(stmt.init, env);
        }
        env.vars.set(stmt.name, type);
        if (stmt.loc) env.defLocs?.set(stmt.name, stmt.loc);
        if (stmt.isMut) {
          env.mutVars.add(stmt.name);
        }
        if (stmt.isExported) env.exports.add(stmt.name);

        const isLocal = !!env.parent;
        this.registerSymbol({
          name: stmt.name,
          type,
          kind: isLocal ? 'variable' : 'variable',
          isMut: stmt.isMut,
          isExported: stmt.isExported,
          loc: stmt.loc,
          doc: renderDocComment(stmt.docComment) || (isLocal
            ? `${stmt.isMut ? 'Mutable local' : 'Local'} variable \`${stmt.name}\``
            : `${stmt.isExported ? 'Exported top-level' : 'Top-level'} variable \`${stmt.name}\``)
        });
        break;
      }
      case 's_function': {
        const localEnv = createScopedEnv(env);

        const typeVarMap = new Map<string, Type>();
        const quantifiers: string[] = [];
        const quantifierKinds = new Map<string, Kind>();
        for (const tp of stmt.typeParams) {
          const name = getTypeParamName(tp);
          const kind = getTypeParamKind(tp);
          quantifiers.push(name);
          quantifierKinds.set(name, kind);
          typeVarMap.set(name, createTypeVarForParam(tp));
        }

        const params = stmt.params.map(p => ({
          name: p.name,
          type: this.astToType(p.type, env, typeVarMap),
          loc: p.loc
        }));

        for (const p of params) {
          localEnv.vars.set(p.name, p.type);
          if (p.loc) localEnv.defLocs?.set(p.name, p.loc);
          this.registerSymbol({
            name: p.name,
            type: p.type,
            kind: 'parameter',
            loc: p.loc || stmt.loc,
            containerName: stmt.name,
            scopeRange: {
              startLine: stmt.loc?.line || 1,
              startCol: stmt.loc?.col || 1,
              endLine: stmt.body.loc?.endLine || (stmt.loc?.line ? stmt.loc.line + 5000 : 999999),
              endCol: stmt.body.loc?.endCol || 999999
            },
            doc: getParameterDoc(stmt.docComment, p.name) || `Parameter \`${p.name}\` of function \`${stmt.name}\``
          });
        }

        const returnType = this.astToType(stmt.returnType, env, typeVarMap);

        let funType = env.vars.get(stmt.name) || { kind: 'fun', params, returnType };
        localEnv.vars.set(stmt.name, funType);
        if (stmt.loc) {
          localEnv.defLocs?.set(stmt.name, stmt.loc);
          env.defLocs?.set(stmt.name, stmt.loc);
        }
        localEnv.currentReturnType = returnType;
        this.registerSymbol({
          name: stmt.name,
          type: funType,
          kind: 'function',
          isExported: stmt.isExported,
          loc: stmt.loc,
          doc: renderDocComment(stmt.docComment, stmt.params.map(param => param.name)) ||
            (stmt.isExported ? `Exported function \`${stmt.name}\`` : `Function \`${stmt.name}\``)
        });

        if (stmt.whereBindings && stmt.whereBindings.length > 0) {
          this.checkStatementList(stmt.whereBindings, localEnv);
        }

        this.checkExpr(stmt.body, returnType, localEnv);
        break;
      }
      case 's_gadt': {
        env.gadts.set(stmt.decl.name, {
          name: stmt.decl.name,
          typeParams: stmt.decl.typeParams,
          constructors: stmt.decl.constructors
        });

        if (stmt.isExported) env.exports.add(stmt.decl.name);
        if (stmt.loc) env.defLocs?.set(stmt.decl.name, stmt.loc);

        this.registerSymbol({
          name: stmt.decl.name,
          type: { kind: 'cons', name: stmt.decl.name, args: [] },
          kind: 'gadt',
          loc: stmt.loc,
          doc: `GADT Type \`${stmt.decl.name}\``
        });

        // Register constructors in env as constructor functions
        for (const ctor of stmt.decl.constructors) {
          const ctorTypeMap = new Map<string, Type>();
          const allTypeParams = [...stmt.decl.typeParams, ...ctor.typeParams];
          const allQuantifiers: string[] = [];
          const quantifierKinds = new Map<string, Kind>();
          for (const tp of allTypeParams) {
            const name = getTypeParamName(tp);
            const kind = getTypeParamKind(tp);
            allQuantifiers.push(name);
            quantifierKinds.set(name, kind);
            ctorTypeMap.set(name, createTypeVarForParam(tp));
          }

          const params = ctor.params.map(p => ({
            name: p.name,
            type: this.astToType(p.type, env, ctorTypeMap)
          }));

          let returnType: Type;
          if (ctor.returnType) {
            returnType = this.astToType(ctor.returnType, env, ctorTypeMap);
          } else {
            const args = stmt.decl.typeParams.map(tp => ctorTypeMap.get(getTypeParamName(tp)) || createTypeVarForParam(tp));
            returnType = { kind: 'cons', name: stmt.decl.name, args };
          }

          let fnType: Type;
          if (ctor.params.length === 0) {
            fnType = returnType;
          } else {
            fnType = { kind: 'fun', params, returnType };
          }
          if (allQuantifiers.length > 0) {
            fnType = { kind: 'poly', quantifiers: allQuantifiers, quantifierKinds, type: fnType };
          }

          env.vars.set(ctor.name, fnType);
          if (stmt.isExported) env.exports.add(ctor.name);
        }
        break;
      }
      case 's_type_alias': {
        const typeVarMap = new Map<string, Type>();
        for (const tp of stmt.decl.typeParams) {
          const name = getTypeParamName(tp);
          typeVarMap.set(name, createTypeVarForParam(tp));
        }
        const targetType = this.astToType(stmt.decl.type, env, typeVarMap);
        env.typeAliases.set(stmt.decl.name, {
          typeParams: stmt.decl.typeParams,
          type: targetType
        });
        if (stmt.isExported) env.exports.add(stmt.decl.name);
        if (stmt.loc) env.defLocs?.set(stmt.decl.name, stmt.loc);

        this.registerSymbol({
          name: stmt.decl.name,
          type: targetType,
          kind: 'type_alias',
          loc: stmt.loc,
          doc: `Type Alias \`${stmt.decl.name}\``
        });
        break;
      }
      case 's_module': {
        const modEnv = createScopedEnv(env);
        modEnv.exports = new Set();
        modEnv.currentReturnType = undefined;

        env.modules.set(stmt.name, modEnv);
        if (stmt.isExported) env.exports.add(stmt.name);

        this.checkStatementList(stmt.body, modEnv);
        break;
      }
      case 's_extern_function': {
        const typeVarMap = new Map<string, Type>();
        const quantifiers: string[] = [];
        const quantifierKinds = new Map<string, Kind>();
        for (const tp of stmt.typeParams) {
          const name = getTypeParamName(tp);
          const kind = getTypeParamKind(tp);
          quantifiers.push(name);
          quantifierKinds.set(name, kind);
          typeVarMap.set(name, createTypeVarForParam(tp));
        }
        const params = stmt.params.map(p => ({
          name: p.name,
          type: this.astToType(p.type, env, typeVarMap),
          loc: p.loc
        }));
        for (const p of params) {
          this.registerSymbol({
            name: p.name,
            type: p.type,
            kind: 'parameter',
            containerName: stmt.name,
            loc: p.loc || stmt.loc,
            scopeRange: {
              startLine: stmt.loc?.line || 1,
              startCol: 1,
              endLine: stmt.loc?.line || 1,
              endCol: 999999
            },
            doc: `Parameter \`${p.name}\` of extern function \`${stmt.name}\``
          });
        }
        const returnType = this.astToType(stmt.returnType, env, typeVarMap);
        let fnType: Type = { kind: 'fun', params, returnType };
        if (quantifiers.length > 0) {
          fnType = { kind: 'poly', quantifiers, quantifierKinds, type: fnType };
        }
        env.vars.set(stmt.name, fnType);
        if (stmt.isExported) env.exports.add(stmt.name);
        this.registerSymbol({
          name: stmt.name,
          type: fnType,
          kind: 'function',
          isExported: stmt.isExported,
          loc: stmt.loc,
          doc: stmt.docComment || `Extern function \`${stmt.name}\``
        });
        break;
      }

      case 's_extern_type': {
        const typeVarMap = new Map<string, Type>();
        for (const tp of stmt.typeParams) {
          const name = getTypeParamName(tp);
          typeVarMap.set(name, createTypeVarForParam(tp));
        }
        const targetType = this.astToType(stmt.type, env, typeVarMap);
        env.typeAliases.set(stmt.name, {
          typeParams: stmt.typeParams,
          type: targetType
        });
        if (stmt.isExported) env.exports.add(stmt.name);
        this.registerSymbol({
          name: stmt.name,
          type: targetType,
          kind: 'type_alias',
          isExported: stmt.isExported,
          loc: stmt.loc,
          doc: stmt.docComment || `Extern type \`${stmt.name}\``
        });
        break;
      }

      case 's_extern_value': {
        const valType = this.astToType(stmt.type, env);
        env.vars.set(stmt.name, valType);
        if (stmt.isExported) env.exports.add(stmt.name);
        this.registerSymbol({
          name: stmt.name,
          type: valType,
          kind: 'variable',
          isExported: stmt.isExported,
          loc: stmt.loc,
          doc: stmt.docComment || `Extern value \`${stmt.name}\``
        });
        break;
      }

      case 's_extern_module': {
        const modEnv = createScopedEnv(env);
        modEnv.exports = new Set();
        if (stmt.docComment) modEnv.moduleDoc = stmt.docComment;

        // Register the extern module symbol
        this.registerSymbol({
          name: stmt.name,
          type: this.moduleEnvToType(modEnv),
          kind: 'module',
          loc: stmt.loc,
          doc: stmt.docComment || `Extern module \`${stmt.name}\``
        });

        for (const t of stmt.types) {
          const typeVarMap = new Map<string, Type>();
          for (const tp of t.typeParams) {
            const name = getTypeParamName(tp);
            typeVarMap.set(name, createTypeVarForParam(tp));
          }
          const targetType = this.astToType(t.type, modEnv, typeVarMap);
          modEnv.typeAliases.set(t.name, {
            typeParams: t.typeParams,
            type: targetType
          });
          modEnv.exports.add(t.name);
          if (t.loc) modEnv.defLocs?.set(t.name, t.loc);
          if (t.docComment) modEnv.docs?.set(t.name, t.docComment);

          this.registerSymbol({
            name: t.name,
            type: targetType,
            kind: 'type_alias',
            containerName: stmt.name,
            loc: t.loc,
            doc: t.docComment || `Type alias \`${stmt.name}.${t.name}\``
          });
        }

        for (const v of stmt.values) {
          const valType = this.astToType(v.type, modEnv);
          modEnv.vars.set(v.name, valType);
          modEnv.exports.add(v.name);
          if (v.loc) modEnv.defLocs?.set(v.name, v.loc);
          if (v.docComment) modEnv.docs?.set(v.name, v.docComment);

          this.registerSymbol({
            name: v.name,
            type: valType,
            kind: 'variable',
            containerName: stmt.name,
            loc: v.loc,
            doc: v.docComment || `Extern variable \`${stmt.name}.${v.name}\``
          });
        }

        for (const fn of stmt.functions) {
          const typeVarMap = new Map<string, Type>();
          const quantifiers: string[] = [];
          const quantifierKinds = new Map<string, Kind>();
          for (const tp of fn.typeParams) {
            const name = getTypeParamName(tp);
            const kind = getTypeParamKind(tp);
            quantifiers.push(name);
            quantifierKinds.set(name, kind);
            typeVarMap.set(name, createTypeVarForParam(tp));
          }
          const params = fn.params.map(p => ({
            name: p.name,
            type: this.astToType(p.type, modEnv, typeVarMap),
            loc: p.loc
          }));

          for (const p of params) {
            this.registerSymbol({
              name: p.name,
              type: p.type,
              kind: 'parameter',
              containerName: fn.name,
              loc: p.loc || fn.loc,
              scopeRange: {
                startLine: fn.loc?.line || stmt.loc?.line || 1,
                startCol: 1,
                endLine: fn.loc?.line || stmt.loc?.line || 1,
                endCol: 999999
              },
              doc: `Parameter \`${p.name}\` of function \`${stmt.name}.${fn.name}\``
            });
          }

          const returnType = this.astToType(fn.returnType, modEnv, typeVarMap);
          let fnType: Type = { kind: 'fun', params, returnType };
          if (quantifiers.length > 0) {
            fnType = { kind: 'poly', quantifiers, quantifierKinds, type: fnType };
          }
          modEnv.vars.set(fn.name, fnType);
          modEnv.exports.add(fn.name);
          if (fn.loc) modEnv.defLocs?.set(fn.name, fn.loc);
          if (fn.docComment) modEnv.docs?.set(fn.name, fn.docComment);

          this.registerSymbol({
            name: fn.name,
            type: fnType,
            kind: 'function',
            containerName: stmt.name,
            loc: fn.loc,
            doc: fn.docComment || `Extern function \`${stmt.name}.${fn.name}\``
          });
        }

        const modType = this.moduleEnvToType(modEnv);
        env.modules.set(stmt.name, modEnv);
        env.vars.set(stmt.name, modType);
        if (stmt.loc) env.defLocs?.set(stmt.name, stmt.loc);
        const cleanName = stmt.name.replace(/^npm:/, '').replace(/[^a-zA-Z0-9_]/g, '_');
        if (cleanName !== stmt.name) {
          env.modules.set(cleanName, modEnv);
          env.vars.set(cleanName, modType);
          if (stmt.loc) env.defLocs?.set(cleanName, stmt.loc);
        }
        if (stmt.isExported) env.exports.add(stmt.name);
        break;
      }

      case 's_import': {
        this.processImport(stmt, env);
        break;
      }
      case 's_expr': {
        this.synthExpr(stmt.expr, env);
        break;
      }
    }
  }

  private processImport(stmt: { modulePath: string[]; specifiers?: any[]; alias?: string; loc?: SourceLoc }, env: TypeEnv) {
    let searchEnv: TypeEnv | undefined = env;
    let baseEnv: TypeEnv | undefined = undefined;
    while (searchEnv) {
      if (searchEnv.modules.has(stmt.modulePath[0])) {
        baseEnv = searchEnv;
        break;
      }
      searchEnv = searchEnv.parent;
    }

    if (!baseEnv && this.options.resolveModule) {
      const moduleName = stmt.modulePath[0];
      const resolvedEnv = this.options.resolveModule(moduleName);
      if (resolvedEnv) {
        env.modules.set(moduleName, resolvedEnv);
        baseEnv = env;
      }
    }

    let current: TypeEnv | undefined = baseEnv;
    for (const seg of stmt.modulePath) {
      if (!current) break;
      current = current.modules.get(seg);
    }

    if (!current) {
      const knownModules: string[] = [];
      let mEnv: TypeEnv | undefined = env;
      while (mEnv) {
        for (const k of Array.from(mEnv.modules.keys())) {
          if (!knownModules.includes(k)) knownModules.push(k);
        }
        mEnv = mEnv.parent;
      }
      const closest = findBestSuggestion(stmt.modulePath.join('.'), knownModules);
      const suggestion = closest ? ` Did you mean '${closest}'?` : '';
      this.addError(`Module '${stmt.modulePath.join('.')}' not found.${suggestion}`, stmt.loc, 'Undefined Symbol');
      return;
    }

    if (stmt.alias) {
      env.modules.set(stmt.alias, current);
      return;
    }

    if (stmt.specifiers) {
      for (const spec of stmt.specifiers) {
        if (spec.isAll) {
          current.exports.forEach(expName => {
            if (current!.vars.has(expName)) env.vars.set(expName, current!.vars.get(expName)!);
            if (current!.docs?.has(expName)) env.docs?.set(expName, current!.docs.get(expName)!);
            if (current!.gadts.has(expName)) env.gadts.set(expName, current!.gadts.get(expName)!);
            if (current!.typeAliases.has(expName)) env.typeAliases.set(expName, current!.typeAliases.get(expName)!);
          });
        } else {
          const importName = spec.name;
          const targetName = spec.alias || importName;
          let found = false;
          if (current.vars.has(importName)) {
            env.vars.set(targetName, current.vars.get(importName)!);
            const doc = current.docs?.get(importName);
            if (doc) env.docs?.set(targetName, doc);
            found = true;
          }
          if (current.gadts.has(importName)) {
            env.gadts.set(targetName, current.gadts.get(importName)!);
            found = true;
          }
          if (current.typeAliases.has(importName)) {
            env.typeAliases.set(targetName, current.typeAliases.get(importName)!);
            found = true;
          }

          if (!found) {
            const availableExports = Array.from(
              new Set([...Array.from(current.exports), ...Array.from(current.vars.keys()), ...Array.from(current.gadts.keys()), ...Array.from(current.typeAliases.keys())])
            );
            const closest = findBestSuggestion(importName, availableExports);
            const suggestion = closest ? ` Did you mean '${closest}'?` : '';
            this.addError(
              `Export '${importName}' not found in module '${stmt.modulePath.join('.')}'.${suggestion}`,
              spec.loc || stmt.loc,
              'Undefined Symbol'
            );
          }
        }
      }
    } else {
      // Direct module binding
      env.modules.set(stmt.modulePath[stmt.modulePath.length - 1], current);
    }
  }

  // ==================== BIDIRECTIONAL SYNTH & CHECK ====================

  public synthExpr(expr: Expr, env: TypeEnv): Type {
    this.recursionDepth++;
    if (this.recursionDepth > this.maxRecursionDepth) {
      this.addError(
        `Type error: Maximum recursion depth of ${this.maxRecursionDepth} exceeded during type inference/checking. Check for complex or infinitely recursive GADT types.`,
        expr.loc,
        'Type Checking'
      );
      this.recursionDepth--;
      return freshTypeVar('rec_exceeded');
    }
    try {
      return this.synthExprInner(expr, env);
    } finally {
      this.recursionDepth--;
    }
  }

  private synthExprInner(expr: Expr, env: TypeEnv): Type {
    switch (expr.kind) {
      case 'e_literal': {
        if (typeof expr.value === 'number') return PRIM_NUMBER;
        if (typeof expr.value === 'boolean') return PRIM_BOOLEAN;
        if (typeof expr.value === 'string') return PRIM_STRING;
        return PRIM_VOID;
      }
      case 'e_var': {
        if (expr.modulePath && expr.modulePath.length > 0) {
          let searchEnv: TypeEnv | undefined = env;
          let baseEnv: TypeEnv | undefined = undefined;
          while (searchEnv) {
            if (searchEnv.modules.has(expr.modulePath[0])) {
              baseEnv = searchEnv;
              break;
            }
            searchEnv = searchEnv.parent;
          }

          let modEnv: TypeEnv | undefined = baseEnv;
          for (const seg of expr.modulePath) {
            modEnv = modEnv?.modules.get(seg);
          }
          if (modEnv) {
            if (!expr.name) {
              return freshTypeVar('__member__');
            }
            if (modEnv.vars.has(expr.name)) {
              const type = this.instantiate(modEnv.vars.get(expr.name)!);
              const foundLoc = modEnv.defLocs?.get(expr.name);
              if (expr.loc && foundLoc) {
                this.registerSymbol({
                  name: expr.name,
                  type,
                  kind: 'reference',
                  loc: expr.loc,
                  scopeRange: {
                    startLine: foundLoc.line,
                    startCol: foundLoc.col,
                    endLine: foundLoc.endLine || foundLoc.line,
                    endCol: foundLoc.endCol || foundLoc.col
                  }
                });
              }
              return type;
            }
            if (modEnv.modules.has(expr.name)) {
              const type = this.moduleEnvToType(modEnv.modules.get(expr.name)!);
              const foundLoc = modEnv.defLocs?.get(expr.name);
              if (expr.loc && foundLoc) {
                this.registerSymbol({
                  name: expr.name,
                  type,
                  kind: 'reference',
                  loc: expr.loc,
                  scopeRange: {
                    startLine: foundLoc.line,
                    startCol: foundLoc.col,
                    endLine: foundLoc.endLine || foundLoc.line,
                    endCol: foundLoc.endCol || foundLoc.col
                  }
                });
              }
              return type;
            }

            const candidateExports = Array.from(modEnv.exports);
            const closest = findBestSuggestion(expr.name, candidateExports);
            const suggestion = closest ? ` Did you mean '${expr.modulePath.join('.')}.${closest}'?` : '';
            this.addError(
              `Member '${expr.name}' not found in module '${expr.modulePath.join('.')}'.${suggestion}`,
              expr.loc,
              'Undefined Symbol',
              closest ? [{ title: `💡 Replace with '${closest}'`, targetLine: expr.loc?.line, replacementText: closest }] : undefined
            );
            return freshTypeVar(expr.name);
          }
        }

        let curr: TypeEnv | undefined = env;
        let foundLoc: SourceLoc | undefined = undefined;
        let resolvedType: Type | undefined = undefined;
        while (curr) {
          if (curr.vars.has(expr.name)) {
            resolvedType = this.instantiate(curr.vars.get(expr.name)!);
            foundLoc = curr.defLocs?.get(expr.name);
            break;
          }
          if (curr.modules.has(expr.name)) {
            resolvedType = this.moduleEnvToType(curr.modules.get(expr.name)!);
            foundLoc = curr.defLocs?.get(expr.name);
            break;
          }
          curr = curr.parent;
        }

        if (resolvedType) {
          if (expr.loc && foundLoc) {
            this.registerSymbol({
              name: expr.name,
              type: resolvedType,
              kind: 'reference',
              loc: expr.loc,
              scopeRange: {
                startLine: foundLoc.line,
                startCol: foundLoc.col,
                endLine: foundLoc.endLine || foundLoc.line,
                endCol: foundLoc.endCol || foundLoc.col
              }
            });
          }
          return resolvedType;
        }

        // Check for do-notation desugared flatMap or pure
        if ((expr as any).isDoDesugared || (expr as any).doOp) {
          const doOp = (expr as any).doOp || expr.name;
          if (doOp === 'flatMap') {
            this.addError(
              `In 'do' notation: 'flatMap' function is not defined in scope. Monadic 'do' blocks desugar bindings like 'x <- expr' into 'flatMap(expr, (x) => ...)'. To use 'do' notation, define or import a 'flatMap' function for your monad type (e.g. Option, Result, IO, Promise).`,
              expr.loc,
              'Undefined Symbol',
              [
                {
                  title: "💡 Define Option flatMap: function flatMap<a, b>(opt: Option<a>, f: (x: a) => Option<b>): Option<b> { ... }",
                  actionKind: 'add_let',
                  targetLine: Math.max(1, (expr.loc?.line || 1) - 1),
                  replacementText: `function flatMap<a, b>(opt: Option<a>, f: (x: a) => Option<b>): Option<b> {\n  match (opt) {\n    Some(v) => f(v)\n    None => None\n  }\n}\n`
                }
              ]
            );
            return freshTypeVar('flatMap');
          }
          if (doOp === 'pure') {
            this.addError(
              `In 'do' notation: 'pure' function is not defined in scope. Monadic 'do' blocks desugar 'pure val' into 'pure(val)' to lift values into your monad. To use 'pure' in 'do' blocks, define or import a 'pure' function (e.g. function pure<a>(val: a): Option<a> { Some(val) }).`,
              expr.loc,
              'Undefined Symbol',
              [
                {
                  title: "💡 Define Option pure: function pure<a>(val: a): Option<a> { Some(val) }",
                  actionKind: 'add_let',
                  targetLine: Math.max(1, (expr.loc?.line || 1) - 1),
                  replacementText: `function pure<a>(val: a): Option<a> {\n  Some(val)\n}\n`
                }
              ]
            );
            return freshTypeVar('pure');
          }
        }

        // Variable not found in lexical scope -> Search for Did-You-Mean suggestions
        const inScopeVars: string[] = [];
        let sCurr: TypeEnv | undefined = env;
        while (sCurr) {
          for (const k of Array.from(sCurr.vars.keys())) {
            if (!inScopeVars.includes(k)) inScopeVars.push(k);
          }
          for (const k of Array.from(sCurr.modules.keys())) {
            if (!inScopeVars.includes(k)) inScopeVars.push(k);
          }
          sCurr = sCurr.parent;
        }

        // Check if an accessible module exports an identifier with this exact name
        let moduleWithExactExport: { modName: string; exportName: string } | null = null;
        let mCurr: TypeEnv | undefined = env;
        while (mCurr) {
          for (const [modName, mod] of Array.from(mCurr.modules.entries())) {
            if (mod.exports.has(expr.name)) {
              moduleWithExactExport = { modName, exportName: expr.name };
              break;
            }
          }
          if (moduleWithExactExport) break;
          mCurr = mCurr.parent;
        }

        if (moduleWithExactExport) {
          this.addError(
            `Undefined variable '${expr.name}'. Did you mean '${moduleWithExactExport.modName}.${moduleWithExactExport.exportName}' or 'import ${moduleWithExactExport.modName}.{ ${moduleWithExactExport.exportName} }'?`,
            expr.loc,
            'Undefined Symbol',
            [
              {
                title: `💡 Use '${moduleWithExactExport.modName}.${moduleWithExactExport.exportName}'`,
                actionKind: 'wrap_expression',
                targetLine: expr.loc?.line,
                replacementText: `${moduleWithExactExport.modName}.${moduleWithExactExport.exportName}`
              },
              {
                title: `💡 Import '${moduleWithExactExport.exportName}' from ${moduleWithExactExport.modName}`,
                actionKind: 'add_let',
                targetLine: 1,
                replacementText: `import ${moduleWithExactExport.modName}.{ ${moduleWithExactExport.exportName} };\n`
              }
            ]
          );
          return freshTypeVar(expr.name);
        }

        // Fuzzy match in current scope
        const closestInScope = findBestSuggestion(expr.name, inScopeVars);
        if (closestInScope) {
          this.addError(
            `Undefined variable '${expr.name}'. Did you mean '${closestInScope}'?`,
            expr.loc,
            'Undefined Symbol',
            [{
              title: `💡 Replace with '${closestInScope}'`,
              actionKind: 'replace_line',
              targetLine: expr.loc?.line,
              replacementText: closestInScope
            }]
          );
          return freshTypeVar(expr.name);
        }

        // Fuzzy match in accessible module exports
        const allModuleExports: { modName: string; expName: string }[] = [];
        let amCurr: TypeEnv | undefined = env;
        while (amCurr) {
          for (const [modName, mod] of Array.from(amCurr.modules.entries())) {
            for (const exp of Array.from(mod.exports)) {
              allModuleExports.push({ modName, expName: exp });
            }
          }
          amCurr = amCurr.parent;
        }
        const exportNames = allModuleExports.map(m => m.expName);
        const closestExport = findBestSuggestion(expr.name, exportNames);
        if (closestExport) {
          const match = allModuleExports.find(m => m.expName === closestExport);
          const modName = match ? match.modName : 'Math';
          this.addError(
            `Undefined variable '${expr.name}'. Did you mean '${modName}.${closestExport}'?`,
            expr.loc,
            'Undefined Symbol',
            [{
              title: `💡 Use '${modName}.${closestExport}'`,
              actionKind: 'wrap_expression',
              targetLine: expr.loc?.line,
              replacementText: `${modName}.${closestExport}`
            }]
          );
          return freshTypeVar(expr.name);
        }

        this.addError(`Undefined variable '${expr.name}'`, expr.loc, 'Undefined Symbol');
        return freshTypeVar(expr.name);
      }
      case 'e_unary': {
        const sub = this.synthExpr(expr.expr, env);
        if (expr.op === '-') {
          this.unify(sub, PRIM_NUMBER, expr.loc);
          return PRIM_NUMBER;
        }
        if (expr.op === '!') {
          this.unify(sub, PRIM_BOOLEAN, expr.loc);
          return PRIM_BOOLEAN;
        }
        return sub;
      }
      case 'e_binary': {
        const left = this.synthExpr(expr.left, env);
        const right = this.synthExpr(expr.right, env);

        if (['+', '-', '*', '/', '%'].includes(expr.op)) {
          if (expr.op === '+' && (prune(left).kind === 'prim' && (left as any).name === 'string')) {
            this.unify(right, PRIM_STRING, expr.loc);
            return PRIM_STRING;
          }
          this.unify(left, PRIM_NUMBER, expr.loc);
          this.unify(right, PRIM_NUMBER, expr.loc);
          return PRIM_NUMBER;
        }

        if (['==', '!='].includes(expr.op)) {
          this.unify(left, right, expr.loc);
          return PRIM_BOOLEAN;
        }

        if (['<', '<=', '>', '>='].includes(expr.op)) {
          this.unify(left, PRIM_NUMBER, expr.loc);
          this.unify(right, PRIM_NUMBER, expr.loc);
          return PRIM_BOOLEAN;
        }

        if (['&&', '||'].includes(expr.op)) {
          this.unify(left, PRIM_BOOLEAN, expr.loc);
          this.unify(right, PRIM_BOOLEAN, expr.loc);
          return PRIM_BOOLEAN;
        }

        return left;
      }
      case 'e_assign': {
        // Strict immutability verification for variable and record field reassignment
        if (expr.target.kind === 'e_var') {
          let curr: TypeEnv | undefined = env;
          let foundVar = false;
          let isMutable = false;
          while (curr) {
            if (curr.vars.has(expr.target.name)) {
              foundVar = true;
              if (curr.mutVars.has(expr.target.name)) {
                isMutable = true;
              }
              break;
            }
            curr = curr.parent;
          }

          if (foundVar && !isMutable) {
            this.addError(
              `Cannot assign to immutable variable '${expr.target.name}'. Variable must be declared with 'let mut ${expr.target.name}' to allow reassignment.`,
              expr.loc || expr.target.loc,
              'Immutability Violation'
            );
          }
        } else if (expr.target.kind === 'e_field_access') {
          const fieldTarget = expr.target as EFieldAccess;
          const objType = prune(this.synthExpr(fieldTarget.object, env));
          if (objType.kind === 'rec') {
            const field = objType.fields.find(f => f.name === fieldTarget.field);
            if (field && !field.isMut) {
              this.addError(
                `Cannot mutate immutable record field '${fieldTarget.field}'. Declare field with 'mut ${fieldTarget.field}' in record definition.`,
                expr.loc || fieldTarget.loc,
                'Immutability Violation'
              );
            }
          }
        }

        const targetType = this.synthExpr(expr.target, env);
        this.checkExpr(expr.value, targetType, env);
        return PRIM_VOID;
      }
      case 'e_call': {
        const calleeType = prune(this.synthExpr(expr.callee, env));

        if (calleeType.kind === 'poly') {
          const inst = this.instantiate(calleeType);
          return this.checkFunCall(inst, expr.args, env, expr.loc);
        }

        if (calleeType.kind === 'fun') {
          return this.checkFunCall(calleeType, expr.args, env, expr.loc);
        }

        const ret = freshTypeVar('ret');
        const expectedFun: Type = {
          kind: 'fun',
          params: expr.args.map(a => ({ type: this.synthExpr(a, env) })),
          returnType: ret
        };
        this.unify(calleeType, expectedFun, expr.loc);
        return ret;
      }
      case 'e_field_access': {
        const isDoDesugared = (expr as any).isDoDesugared;
        const doOp = (expr as any).doOp;
        const objType = prune(this.synthExpr(expr.object, env));

        if (isDoDesugared && (doOp === 'flatMap' || doOp === 'pure' || expr.field === 'flatMap' || expr.field === 'pure')) {
          const monadName = expr.object.kind === 'e_var' ? (expr.object as any).name : 'Monad';
          let foundField: Type | undefined;
          if (objType.kind === 'rec') {
            const f = objType.fields.find(field => field.name === expr.field);
            if (f) foundField = f.type;
          }
          if (foundField) return foundField;

          if (expr.field === 'flatMap') {
            this.addError(
              `In 'do(${monadName})' notation: '${monadName}' does not provide a 'flatMap' function. Monadic 'do(${monadName})' blocks desugar bindings like 'x <- expr' into '${monadName}.flatMap(expr, (x) => ...)'. Ensure '${monadName}' defines 'flatMap'.`,
              expr.loc,
              'Undefined Symbol'
            );
            return freshTypeVar('flatMap');
          } else if (expr.field === 'pure') {
            this.addError(
              `In 'do(${monadName})' notation: '${monadName}' does not provide a 'pure' function. Monadic 'do(${monadName})' blocks desugar 'pure val' into '${monadName}.pure(val)'. Ensure '${monadName}' defines 'pure'.`,
              expr.loc,
              'Undefined Symbol'
            );
            return freshTypeVar('pure');
          }
        }

        if (objType.kind === 'rec') {
          if (!expr.field) {
            return freshTypeVar('__field__');
          }
          const field = objType.fields.find(f => f.name === expr.field);
          if (field) return field.type;
          const candidateFields = objType.fields.map(f => f.name);
          const closest = findBestSuggestion(expr.field, candidateFields);
          const suggestion = closest ? ` Did you mean '${closest}'?` : '';
          this.addError(
            `Record field '${expr.field}' not found.${suggestion}`,
            expr.loc,
            'Undefined Symbol',
            closest ? [{ title: `💡 Replace with field '${closest}'`, targetLine: expr.loc?.line, replacementText: closest }] : undefined
          );
        }
        return freshTypeVar(expr.field);
      }
      case 'e_index': {
        const targetType = prune(this.synthExpr(expr.target, env));
        const indexType = this.synthExpr(expr.index, env);
        this.unify(indexType, PRIM_NUMBER, expr.loc);

        if (targetType.kind === 'tup') {
          if (expr.index.kind === 'e_literal' && typeof expr.index.value === 'number') {
            const idx = expr.index.value;
            if (idx >= 0 && idx < targetType.elements.length) {
              return targetType.elements[idx];
            }
          }
          if (targetType.elements.length > 0) return targetType.elements[0];
        }
        return freshTypeVar('elem');
      }
      case 'e_method_call': {
        const objType = prune(this.synthExpr(expr.object, env));

        if (objType.kind === 'rec') {
          const field = objType.fields.find(f => f.name === expr.method);
          if (field) {
            const rawType = prune(field.type);
            const funType = rawType.kind === 'poly' ? this.instantiate(rawType) : rawType;
            if (funType.kind === 'fun') {
              if (objType.isModule || funType.params.length === expr.args.length) {
                expr.isModuleMethod = true;
                return this.checkFunCall(funType, expr.args, env, expr.loc);
              } else {
                // First argument is self
                const args = [expr.object, ...expr.args];
                return this.checkFunCall(funType, args, env, expr.loc);
              }
            }
          }
        }

        const nativeMethods = [
          'push', 'pop', 'shift', 'unshift', 'splice', 'slice', 'indexOf', 'lastIndexOf',
          'includes', 'join', 'concat', 'map', 'filter', 'reduce', 'forEach', 'find', 'findIndex',
          'trim', 'toLowerCase', 'toUpperCase', 'replace', 'replaceAll', 'split', 'charAt',
          'substring', 'startsWith', 'endsWith', 'toString', 'valueOf',
          'addEventListener', 'removeEventListener', 'getAttribute', 'setAttribute',
          'getElementById', 'querySelector', 'querySelectorAll', 'appendChild', 'removeChild',
          'getContext', 'getBoundingClientRect', 'fill', 'stroke', 'beginPath', 'closePath',
          'moveTo', 'lineTo', 'arc', 'rect', 'fillRect', 'strokeRect', 'clearRect',
          'fillText', 'strokeText', 'setLineDash', 'getLineDash', 'measureText', 'clip',
          'createLinearGradient', 'createRadialGradient', 'createPattern', 'drawImage',
          'addColorStop', 'quadraticCurveTo', 'bezierCurveTo', 'ellipse', 'arcTo',
          'save', 'restore', 'translate', 'rotate', 'scale', 'preventDefault', 'stopPropagation'
        ];
        if (nativeMethods.includes(expr.method)) {
          expr.args.forEach(a => this.synthExpr(a, env));
          expr.isModuleMethod = true; // Prevents "self" passing in JS codegen
          return freshTypeVar(expr.method + '_ret');
        }
        
        if (objType.kind === 'rec') {
          const candidateMethods = objType.fields.filter(f => {
            const t = prune(f.type);
            return t.kind === 'fun' || t.kind === 'poly';
          }).map(f => f.name);
          const closest = findBestSuggestion(expr.method, candidateMethods);
          const suggestion = closest ? ` Did you mean '${closest}'?` : '';
          this.addError(
            `Method '${expr.method}' not found on object.${suggestion}`,
            expr.loc,
            'Undefined Symbol',
            closest ? [{ title: `💡 Replace with method '${closest}'`, targetLine: expr.loc?.line, replacementText: closest }] : undefined
          );
          return freshTypeVar(expr.method);
        }
        this.addError(`Method '${expr.method}' not found on non-record object`, expr.loc, 'Undefined Symbol');
        return freshTypeVar(expr.method);
      }
      case 'e_record': {
        const fields = expr.fields.map(f => ({
          name: f.name,
          type: this.synthExpr(f.value, env),
          isMut: f.isMut
        }));

        if (expr.methods) {
          for (const m of expr.methods) {
            const localEnv = createScopedEnv(env);

            const recTypePlaceholder: TRec = { kind: 'rec', fields };
            localEnv.vars.set(m.selfParam, recTypePlaceholder);

            const mParams = m.params.map(p => ({
              name: p.name,
              type: p.type ? this.astToType(p.type, env) : freshTypeVar(p.name)
            }));

            mParams.forEach(p => localEnv.vars.set(p.name, p.type));

            const returnType = m.returnType ? this.astToType(m.returnType, env) : PRIM_VOID;
            localEnv.currentReturnType = returnType;
            this.checkExpr(m.body, returnType, localEnv);

            fields.push({
              name: m.name,
              type: {
                kind: 'fun',
                params: [{ name: m.selfParam, type: recTypePlaceholder }, ...mParams],
                returnType
              },
              isMut: false
            });
          }
        }

        const recType: TRec = { kind: 'rec', fields };
        // Fill back self reference in methods
        for (const f of fields) {
          if (f.type.kind === 'fun' && f.type.params.length > 0) {
            f.type.params[0].type = recType;
          }
        }

        return recType;
      }
      case 'e_record_update': {
        const baseType = prune(this.synthExpr(expr.base, env));
        if (baseType.kind === 'rec') {
          const updatedFields = [...baseType.fields];
          for (const u of expr.updates) {
            const valType = this.synthExpr(u.value, env);
            const idx = updatedFields.findIndex(f => f.name === u.name);
            if (idx >= 0) {
              this.unify(updatedFields[idx].type, valType, expr.loc);
            } else {
              updatedFields.push({ name: u.name, type: valType, isMut: u.isMut });
            }
          }
          return { kind: 'rec', fields: updatedFields };
        }
        return baseType;
      }
      case 'e_tuple': {
        return {
          kind: 'tup',
          elements: expr.elements.map(e => this.synthExpr(e, env))
        };
      }
      case 'e_lambda': {
        const localEnv = createScopedEnv(env);
        const typeVarMap = new Map<string, Type>();
        const quantifiers: string[] = [];
        const quantifierKinds = new Map<string, Kind>();
        for (const tp of (expr.typeParams || [])) {
          const name = getTypeParamName(tp);
          const kind = getTypeParamKind(tp);
          quantifiers.push(name);
          quantifierKinds.set(name, kind);
          typeVarMap.set(name, createTypeVarForParam(tp));
        }

        const params = expr.params.map(p => ({
          name: p.name,
          type: p.type ? this.astToType(p.type, env, typeVarMap) : freshTypeVar(p.name),
          loc: p.loc
        }));

        for (const p of params) {
          localEnv.vars.set(p.name, p.type);
          const isDoBind = (expr as any).isDoBind;
          const doScope = (expr as any).doScopeLoc;
          if (!p.name.startsWith('$m_val_')) {
            this.registerSymbol({
              name: p.name,
              type: p.type,
              kind: isDoBind ? 'variable' : 'parameter',
              loc: p.loc || expr.loc,
              containerName: isDoBind ? undefined : 'anonymous function',
              scopeRange: {
                startLine: p.loc?.line || expr.loc?.line || 1,
                startCol: 1,
                endLine: doScope?.endLine || expr.body.loc?.endLine || (expr.loc?.line ? expr.loc.line + 5000 : 999999),
                endCol: doScope?.endCol || expr.body.loc?.endCol || 999999
              },
              doc: isDoBind
                ? `Local variable \`${p.name}\` bound in \`do\` block`
                : `Parameter \`${p.name}\` of anonymous function`
            });
          }
        }

        let returnType: Type;
        if (expr.returnType) {
          returnType = this.astToType(expr.returnType, env, typeVarMap);
          localEnv.currentReturnType = returnType;
          this.checkExpr(expr.body, returnType, localEnv);
        } else {
          const retVar = freshTypeVar('ret');
          localEnv.currentReturnType = retVar;
          returnType = this.synthExpr(expr.body, localEnv);
          this.unify(returnType, retVar, expr.loc);
        }

        const funType: Type = { kind: 'fun', params, returnType };
        if (quantifiers.length > 0) {
          return { kind: 'poly', quantifiers, quantifierKinds, type: funType };
        }
        return funType;
      }
      case 'e_if': {
        this.checkExpr(expr.cond, PRIM_BOOLEAN, env);
        if (expr.elseExpr) {
          const thenType = this.synthExpr(expr.thenExpr, env);
          this.checkExpr(expr.elseExpr, thenType, env);
          return thenType;
        } else {
          this.synthExpr(expr.thenExpr, env);
          return PRIM_VOID;
        }
      }
      case 'e_block': {
        const localEnv = createScopedEnv(env);
        this.checkStatementList(expr.statements, localEnv);

        if (expr.result) {
          return this.synthExpr(expr.result, localEnv);
        }
        return PRIM_VOID;
      }
      case 'e_match': {
        const scrutineeType = this.synthExpr(expr.scrutinee, env);
        return this.checkMatch(expr.arms, expr.hasRest, scrutineeType, undefined, env, expr.loc);
      }
      case 'e_switch': {
        const discriminantType = this.synthExpr(expr.discriminant, env);
        let resultType: Type | undefined = undefined;

        for (const c of expr.cases) {
          const caseVals = c.values && c.values.length > 0 ? c.values : [c.value];
          for (const val of caseVals) {
            const caseValueType = this.synthExpr(val, env);
            this.unify(discriminantType, caseValueType, val.loc || expr.loc);
          }
          const bodyType = this.synthExpr(c.body, env);
          if (!resultType) {
            resultType = bodyType;
          } else {
            this.unify(resultType, bodyType, c.body.loc || expr.loc);
          }
        }

        if (expr.defaultCase) {
          const defaultType = this.synthExpr(expr.defaultCase, env);
          if (!resultType) {
            resultType = defaultType;
          } else {
            this.unify(resultType, defaultType, expr.defaultCase.loc || expr.loc);
          }
        }

        return resultType || PRIM_VOID;
      }
      case 'e_list_comp': {
        const iterType = this.synthExpr(expr.iterable, env);
        
        // Ensure iterable is an Array
        let elementType: Type = freshTypeVar('a');
        
        const arrayType: Type = { kind: 'tup', elements: [elementType] };
        
        this.unify(iterType, arrayType, expr.loc);

        const localEnv = createScopedEnv(env);
        localEnv.vars.set(expr.param, elementType);
        this.registerSymbol({
          name: expr.param,
          type: elementType,
          kind: 'loop',
          loc: expr.loc,
          scopeRange: {
            startLine: expr.loc?.line || 1,
            startCol: expr.loc?.col || 1,
            endLine: expr.loc?.endLine || (expr.loc?.line ? expr.loc.line + 100 : 999999),
            endCol: expr.loc?.endCol || 999999
          },
          doc: `List comprehension element \`${expr.param}\``
        });

        if (expr.condition) {
          const condType = this.synthExpr(expr.condition, localEnv);
          this.unify(condType, PRIM_BOOLEAN, expr.condition.loc);
        }

        const resType = this.synthExpr(expr.element, localEnv);
        return { kind: 'tup', elements: [resType] };
      }
      case 'e_range': {
        this.checkExpr(expr.start, PRIM_NUMBER, env);
        this.checkExpr(expr.end, PRIM_NUMBER, env);
        return { kind: 'tup', elements: [PRIM_NUMBER] };
      }
      case 'e_for': {
        const localEnv = createScopedEnv(env);
        if (expr.init) {
          if (expr.init.kind === 's_let') {
            this.checkStatement(expr.init, localEnv);
          } else if (expr.init.kind === 's_expr') {
            this.synthExpr(expr.init.expr, localEnv);
          } else if (expr.init.kind.startsWith('e_')) {
            this.synthExpr(expr.init as Expr, localEnv);
          }
        }
        if (expr.cond) {
          this.checkExpr(expr.cond, PRIM_BOOLEAN, localEnv);
        }
        if (expr.update) {
          this.synthExpr(expr.update, localEnv);
        }
        this.synthExpr(expr.body, localEnv);
        return PRIM_VOID;
      }
      case 'e_while': {
        const localEnv = createScopedEnv(env);
        this.checkExpr(expr.cond, PRIM_BOOLEAN, localEnv);
        this.synthExpr(expr.body, localEnv);
        return PRIM_VOID;
      }

      case 'e_break':
      case 'e_continue': {
        return PRIM_VOID;
      }
      
      case 'e_return': {
        const expectedRet = env.currentReturnType;
        if (!expectedRet) {
          this.addError(
            `A 'return' statement can only be used within a function body.`,
            expr.loc,
            'Control Flow'
          );
          return PRIM_VOID;
        }
        if (expr.value) {
          this.checkExpr(expr.value, expectedRet, env);
          return expectedRet;
        } else {
          this.unify(PRIM_VOID, expectedRet, expr.loc);
          return PRIM_VOID;
        }
      }

      case 'e_do': {
        const desugared = desugarDo(expr);
        return this.synthExpr(desugared, env);
      }

      case 'e_where': {
        const localEnv = createScopedEnv(env);
        this.checkStatementList(expr.bindings, localEnv);
        return this.synthExpr(expr.expr, localEnv);
      }
    }
  }

  public checkExpr(expr: Expr, expected: Type, env: TypeEnv) {
    this.recursionDepth++;
    if (this.recursionDepth > this.maxRecursionDepth) {
      this.addError(
        `Type error: Maximum recursion depth of ${this.maxRecursionDepth} exceeded during type inference/checking. Check for complex or infinitely recursive GADT types.`,
        expr.loc,
        'Type Checking'
      );
      this.recursionDepth--;
      return;
    }
    try {
      this.checkExprInner(expr, expected, env);
    } finally {
      this.recursionDepth--;
    }
  }

  private checkExprInner(expr: Expr, expected: Type, env: TypeEnv) {
    const expectedPruned = prune(expected);

    if (expr.kind === 'e_do') {
      const desugared = desugarDo(expr);
      this.checkExpr(desugared, expectedPruned, env);
      return;
    }

    if (expr.kind === 'e_where') {
      const localEnv = createScopedEnv(env);
      this.checkStatementList(expr.bindings, localEnv);
      this.checkExpr(expr.expr, expectedPruned, localEnv);
      return;
    }

    if (expr.kind === 'e_lambda' && expectedPruned.kind === 'fun') {
      const localEnv = createScopedEnv(env);
      const isDoBind = (expr as any).isDoBind;
      const doScope = (expr as any).doScopeLoc;

      expr.params.forEach((p, i) => {
        const pType = expectedPruned.params[i]?.type || freshTypeVar(p.name);
        localEnv.vars.set(p.name, pType);

        if (!p.name.startsWith('$m_val_')) {
          this.registerSymbol({
            name: p.name,
            type: pType,
            kind: isDoBind ? 'variable' : 'parameter',
            loc: p.loc || expr.loc,
            containerName: isDoBind ? undefined : 'anonymous function',
            scopeRange: {
              startLine: p.loc?.line || expr.loc?.line || 1,
              startCol: 1,
              endLine: doScope?.endLine || expr.body.loc?.endLine || (expr.loc?.line ? expr.loc.line + 5000 : 999999),
              endCol: doScope?.endCol || expr.body.loc?.endCol || 999999
            },
            doc: isDoBind
              ? `Local variable \`${p.name}\` bound in \`do\` block`
              : `Parameter \`${p.name}\` of anonymous function`
          });
        }
      });

      localEnv.currentReturnType = expectedPruned.returnType;
      this.checkExpr(expr.body, expectedPruned.returnType, localEnv);
      return;
    }

    if (expr.kind === 'e_block') {
      const localEnv = createScopedEnv(env);
      this.checkStatementList(expr.statements, localEnv);

      if (expr.result) {
        this.checkExpr(expr.result, expectedPruned, localEnv);
      }
      return;
    }

    if (expr.kind === 'e_range') {
      const rangeType = this.synthExpr(expr, env);
      this.unify(rangeType, expectedPruned, expr.loc);
      return;
    }

    if (expr.kind === 'e_return') {
      const expectedRet = env.currentReturnType || expectedPruned;
      if (expr.value) {
        this.checkExpr(expr.value, expectedRet, env);
      } else {
        this.unify(PRIM_VOID, expectedRet, expr.loc);
      }
      return;
    }

    if (expr.kind === 'e_match') {
      const scrutineeType = this.synthExpr(expr.scrutinee, env);
      this.checkMatch(expr.arms, expr.hasRest, scrutineeType, expectedPruned, env, expr.loc);
      return;
    }

    if (expr.kind === 'e_var' && expectedPruned.kind === 'poly') {
      let varType: Type | undefined;
      let curr: TypeEnv | undefined = env;
      while (curr) {
        if (curr.vars.has(expr.name)) {
          varType = curr.vars.get(expr.name);
          break;
        }
        curr = curr.parent;
      }
      if (varType && varType.kind === 'poly') {
        this.unify(varType, expectedPruned, expr.loc);
        return;
      }
    }

    const synthed = this.synthExpr(expr, env);
    this.unify(synthed, expectedPruned, expr.loc);
  }

  private checkFunCall(funType: Type, args: Expr[], env: TypeEnv, loc?: SourceLoc): Type {
    const fn = prune(funType);
    if (fn.kind === 'poly') {
      const inst = this.instantiate(fn);
      return this.checkFunCall(inst, args, env, loc);
    }

    if (fn.kind === 'fun') {
      if (args.length !== fn.params.length) {
        this.addError(
          `Expected ${fn.params.length} arguments, but got ${args.length}`,
          loc,
          'Type Checking'
        );
      }
      fn.params.forEach((p, i) => {
        if (args[i]) {
          this.checkExpr(args[i], p.type, env);
        }
      });
      return fn.returnType;
    }

    return freshTypeVar('ret');
  }

  private freshCopy(type: Type, map = new Map<number, Type>(), visited = new Map<Type, Type>()): Type {
    const t = prune(type);
    if (visited.has(t)) {
      return visited.get(t)!;
    }
    switch (t.kind) {
      case 'var': {
        if (!map.has(t.id)) {
          map.set(t.id, freshTypeVar(t.name));
        }
        return map.get(t.id)!;
      }
      case 'fun': {
        const newFun: TFun = { kind: 'fun', params: [], returnType: PRIM_VOID };
        visited.set(t, newFun);
        newFun.params = t.params.map(p => ({ ...p, type: this.freshCopy(p.type, map, visited) }));
        newFun.returnType = this.freshCopy(t.returnType, map, visited);
        return newFun;
      }
      case 'rec': {
        const newRec: TRec = { kind: 'rec', fields: [] };
        visited.set(t, newRec);
        newRec.fields = t.fields.map(f => ({ ...f, type: this.freshCopy(f.type, map, visited) }));
        return newRec;
      }
      case 'tup': {
        const newTup: TTup = { kind: 'tup', elements: [] };
        visited.set(t, newTup);
        newTup.elements = t.elements.map(e => this.freshCopy(e, map, visited));
        return newTup;
      }
      case 'cons': {
        const newCons: TCons = { kind: 'cons', name: t.name, args: [] };
        visited.set(t, newCons);
        newCons.args = t.args.map(a => this.freshCopy(a, map, visited));
        return newCons;
      }
      case 'poly': {
        const newPoly: TPoly = { kind: 'poly', quantifiers: t.quantifiers, quantifierKinds: t.quantifierKinds, type: PRIM_VOID };
        visited.set(t, newPoly);
        newPoly.type = this.freshCopy(t.type, map, visited);
        return newPoly;
      }
      case 'hkt_app': {
        return prune({
          kind: 'hkt_app',
          constructor: this.freshCopy(t.constructor, map, visited),
          args: t.args.map(a => this.freshCopy(a, map, visited))
        });
      }
      case 'type_lambda': {
        return {
          kind: 'type_lambda',
          params: t.params,
          body: this.freshCopy(t.body, map, visited)
        };
      }
      default:
        return t;
    }
  }

  private freshCopyPair(
    t1: Type,
    t2: Type | undefined
  ): [Type, Type | undefined] {
    const map = new Map<number, Type>();
    const c1 = this.freshCopy(t1, map);
    const c2 = t2 ? this.freshCopy(t2, map) : undefined;
    return [c1, c2];
  }

  // GADT Refinement & Match Arm Checker
  private checkMatch(
    arms: MatchArm[],
    hasRest: boolean | undefined,
    scrutineeType: Type,
    expectedType: Type | undefined,
    env: TypeEnv,
    loc?: SourceLoc
  ): Type {
    const overallResultType = expectedType || freshTypeVar('arm_res');
    const scrutineePruned = prune(scrutineeType);

    // Exhaustiveness check
    this.checkExhaustiveness(arms, hasRest, scrutineePruned, env, loc);

    for (const arm of arms) {
      const armEnv = createScopedEnv(env);

      const [armScrutinee, armExpected] = this.freshCopyPair(scrutineePruned, expectedType);
      const targetExpected = armExpected || freshTypeVar('arm_res');

      // GADT Refinement & Pattern Variable Binding
      this.bindPattern(arm.pattern, armScrutinee, armEnv);

      if (arm.guard) {
        this.checkExpr(arm.guard, PRIM_BOOLEAN, armEnv);
      }

      this.checkExpr(arm.body, targetExpected, armEnv);

      if (!expectedType) {
        this.unify(targetExpected, overallResultType, arm.loc);
      }
    }

    return overallResultType;
  }

  private bindPattern(pat: Pattern, targetType: Type, env: TypeEnv) {
    const type = prune(targetType);

    switch (pat.kind) {
      case 'p_var':
        env.vars.set(pat.name, type);
        this.registerSymbol({
          name: pat.name,
          type,
          kind: 'pattern',
          loc: pat.loc,
          doc: `Pattern variable \`${pat.name}\``
        });
        break;
      case 'p_as':
        env.vars.set(pat.name, type);
        this.registerSymbol({
          name: pat.name,
          type,
          kind: 'pattern',
          loc: pat.loc,
          doc: `Pattern alias variable \`${pat.name}\``
        });
        this.bindPattern(pat.pattern, type, env);
        break;
      case 'p_ctor': {
        // GADT Constructor matching
        let ctorType = env.vars.get(pat.name);
        if (ctorType) {
          const inst = this.instantiate(ctorType);
          if (inst.kind === 'fun') {
            if (pat.args.length !== inst.params.length) {
              this.addError(
                `Constructor '${pat.name}' expects ${inst.params.length} arguments, but pattern has ${pat.args.length}`,
                pat.loc,
                'Pattern Match'
              );
            }
            // Unify return type with target type for GADT refinement!
            this.unify(inst.returnType, type, pat.loc);

            // Bind constructor parameter patterns
            pat.args.forEach((argPat, i) => {
              if (inst.params[i]) {
                this.bindPattern(argPat, inst.params[i].type, env);
              } else {
                this.bindPattern(argPat, freshTypeVar(`arg${i}`), env);
              }
            });
          } else {
            if (pat.args.length > 0) {
              this.addError(
                `Constructor '${pat.name}' expects 0 arguments, but pattern has ${pat.args.length}`,
                pat.loc,
                'Pattern Match'
              );
            }
            this.unify(inst, type, pat.loc);
          }
        } else {
          // Look up candidate constructors across all known GADTs for Did-You-Mean suggestion
          const allCtors: string[] = [];
          let gEnv: TypeEnv | undefined = env;
          while (gEnv) {
            for (const gadt of Array.from(gEnv.gadts.values())) {
              for (const c of gadt.constructors) {
                if (!allCtors.includes(c.name)) allCtors.push(c.name);
              }
            }
            gEnv = gEnv.parent;
          }
          const closest = findBestSuggestion(pat.name, allCtors);
          const suggestion = closest ? ` Did you mean '${closest}'?` : '';
          this.addError(
            `Unknown constructor '${pat.name}' in pattern match.${suggestion}`,
            pat.loc,
            'Pattern Match',
            closest ? [{ title: `💡 Replace with constructor '${closest}'`, targetLine: pat.loc?.line, replacementText: closest }] : undefined
          );
        }
        break;
      }
      case 'p_record': {
        if (type.kind === 'rec') {
          for (const f of pat.fields) {
            const targetField = type.fields.find(tf => tf.name === f.name);
            if (targetField) {
              const fieldType = targetField.type;
              if (f.pattern) {
                this.bindPattern(f.pattern, fieldType, env);
              } else {
                const varName = f.alias || f.name;
                env.vars.set(varName, fieldType);
              }
            }
          }
        }
        break;
      }
      case 'p_tuple': {
        if (type.kind === 'tup') {
          pat.elements.forEach((elemPat, i) => {
            if (type.elements[i]) {
              this.bindPattern(elemPat, type.elements[i], env);
            }
          });
        }
        break;
      }
      case 'p_literal': {
        const litType = typeof pat.value === 'number'
          ? PRIM_NUMBER
          : typeof pat.value === 'string'
          ? PRIM_STRING
          : PRIM_BOOLEAN;
        this.unify(litType, type, pat.loc);
        break;
      }
    }
  }

  private checkExhaustiveness(
    arms: MatchArm[],
    hasRest: boolean | undefined,
    scrutineeType: Type,
    env: TypeEnv,
    loc?: SourceLoc
  ) {
    if (hasRest) return; // '...' escape hatch

    // If wildcard or variable pattern exists, it's exhaustive
    const hasCatchAll = arms.some(
      a => a.pattern.kind === 'p_wildcard' || a.pattern.kind === 'p_var' || a.pattern.kind === 'p_rest'
    );

    if (hasCatchAll) return;

    // GADT Exhaustiveness check
    if (scrutineeType.kind === 'cons') {
      let gEnv: TypeEnv | undefined = env;
      let gadtDecl: { name: string; typeParams: TypeParam[]; constructors: GADTConstructor[] } | undefined;
      while (gEnv) {
        if (gEnv.gadts.has(scrutineeType.name)) {
          gadtDecl = gEnv.gadts.get(scrutineeType.name);
          break;
        }
        gEnv = gEnv.parent;
      }

      if (gadtDecl) {
        const coveredCtors = new Set<string>();
        for (const arm of arms) {
          if (arm.pattern.kind === 'p_ctor') {
            coveredCtors.add(arm.pattern.name);
          }
        }

        const missing = gadtDecl.constructors.map(c => c.name).filter(c => !coveredCtors.has(c));
        if (missing.length > 0) {
          this.addError(
            `Non-exhaustive pattern match on type '${scrutineeType.name}'. Missing constructors: ${missing.join(', ')}`,
            loc,
            'Pattern Match',
            missing.map(m => ({
              title: `💡 Add match arm for '${m}'`,
              actionKind: 'add_match_arm',
              targetLine: (loc?.line || 1) + arms.length,
              replacementText: `  | ${m}(_) => { /* handle ${m} */ }\n`
            }))
          );
        }
      }
    }
  }

  // Instantiate polymorphic type
  private instantiate(type: Type): Type {
    const t = prune(type);
    if (t.kind === 'poly') {
      const map = new Map<string, Type>();
      for (const q of t.quantifiers) {
        const k = t.quantifierKinds?.get(q) || KIND_STAR;
        map.set(q, freshTypeVar(q, k));
      }
      return this.substituteTypeParams(t.type, map);
    }
    return t;
  }

  private occursIn(id: number, type: Type, visited = new Set<Type>()): boolean {
    const t = prune(type);
    if (visited.has(t)) return false;
    visited.add(t);

    if (t.kind === 'var') return t.id === id;
    if (t.kind === 'fun') {
      return t.params.some(p => this.occursIn(id, p.type, visited)) || this.occursIn(id, t.returnType, visited);
    }
    if (t.kind === 'rec') {
      return t.fields.some(f => this.occursIn(id, f.type, visited));
    }
    if (t.kind === 'tup') {
      return t.elements.some(e => this.occursIn(id, e, visited));
    }
    if (t.kind === 'cons') {
      return t.args.some(a => this.occursIn(id, a, visited));
    }
    if (t.kind === 'poly') {
      return this.occursIn(id, t.type, visited);
    }
    if (t.kind === 'hkt_app') {
      return this.occursIn(id, t.constructor, visited) || t.args.some(a => this.occursIn(id, a, visited));
    }
    if (t.kind === 'type_lambda') {
      return this.occursIn(id, t.body, visited);
    }
    return false;
  }

  // Unification Algorithm
  private unify(t1: Type, t2: Type, loc?: SourceLoc) {
    this.unifyDepth++;
    if (this.unifyDepth > this.maxUnifyDepth) {
      this.addError(
        `Type error: Maximum unification depth of ${this.maxUnifyDepth} exceeded during type unification. Check for complex recursive GADT types.`,
        loc,
        'Type Unification'
      );
      this.unifyDepth--;
      return;
    }
    try {
      this.unifyInner(t1, t2, loc);
    } finally {
      this.unifyDepth--;
    }
  }

  private unifyInner(t1: Type, t2: Type, loc?: SourceLoc) {
    const p1 = prune(t1);
    const p2 = prune(t2);

    if (p1 === p2) return;

    if (p1.kind === 'poly' && p2.kind === 'poly') {
      if (p1.quantifiers.length === p2.quantifiers.length) {
        const freshVars = p1.quantifiers.map(q => freshTypeVar(q));
        const subst1 = new Map<string, Type>();
        const subst2 = new Map<string, Type>();
        p1.quantifiers.forEach((q, i) => {
          subst1.set(q, freshVars[i]);
          subst2.set(p2.quantifiers[i], freshVars[i]);
        });
        const p1BodySubst = this.substituteTypeParams(p1.type, subst1);
        const p2BodySubst = this.substituteTypeParams(p2.type, subst2);
        this.unify(p1BodySubst, p2BodySubst, loc);
        return;
      }
    }

    if (p1.kind === 'poly') {
      this.unify(this.instantiate(p1), p2, loc);
      return;
    }

    if (p2.kind === 'poly') {
      this.unify(p1, this.instantiate(p2), loc);
      return;
    }

    if (p1.kind === 'var') {
      if (p2.kind === 'var' && p1.id === p2.id) return;
      if (this.occursIn(p1.id, p2)) {
        this.addError(
          `Type error: Occurs check failed. Type variable '${p1.name || `'t${p1.id}`}' occurs within recursive type '${typeToString(p2)}', which would construct an infinite type.`,
          loc,
          'Type Unification'
        );
        return;
      }
      p1.instance = p2;
      return;
    }

    if (p2.kind === 'var') {
      if (this.occursIn(p2.id, p1)) {
        this.addError(
          `Type error: Occurs check failed. Type variable '${p2.name || `'t${p2.id}`}' occurs within recursive type '${typeToString(p1)}', which would construct an infinite type.`,
          loc,
          'Type Unification'
        );
        return;
      }
      p2.instance = p1;
      return;
    }

    if (p1.kind === 'prim' && p2.kind === 'prim' && p1.name === p2.name) {
      return;
    }

    const pairKey = `${this.getOrAssignId(p1)}:${this.getOrAssignId(p2)}`;
    if (this.unifyingPairs.has(pairKey)) return;
    this.unifyingPairs.add(pairKey);

    try {
      // HKT Application unification
      if (p1.kind === 'hkt_app' && p2.kind === 'hkt_app') {
        this.unify(p1.constructor, p2.constructor, loc);
        p1.args.forEach((a, i) => {
          if (p2.args[i]) this.unify(a, p2.args[i], loc);
        });
        return;
      }

      if (p1.kind === 'type_lambda' && p2.kind === 'type_lambda') {
        if (p1.params.length === p2.params.length) {
          const subst = new Map<string, Type>();
          p1.params.forEach((p, i) => {
            subst.set(p2.params[i], { kind: 'var', id: 0, name: p });
          });
          const p2BodySubst = this.substituteTypeParams(p2.body, subst);
          this.unify(p1.body, p2BodySubst, loc);
          return;
        }
      }

      if (p1.kind === 'hkt_app' && p2.kind === 'cons') {
        const c1 = prune(p1.constructor);
        if (c1.kind === 'var' && p1.args.length === p2.args.length) {
          c1.instance = {
            kind: 'type_lambda',
            params: p1.args.map((_, i) => `$p${i}`),
            body: {
              kind: 'cons',
              name: p2.name,
              args: p1.args.map((_, i) => ({ kind: 'var', id: -100 - i, name: `$p${i}` }))
            }
          };
          p1.args.forEach((a, i) => {
            if (p2.args[i]) this.unify(a, p2.args[i], loc);
          });
          return;
        }
      }

      if (p2.kind === 'hkt_app' && p1.kind === 'cons') {
        const c2 = prune(p2.constructor);
        if (c2.kind === 'var' && p2.args.length === p1.args.length) {
          c2.instance = {
            kind: 'type_lambda',
            params: p2.args.map((_, i) => `$p${i}`),
            body: {
              kind: 'cons',
              name: p1.name,
              args: p2.args.map((_, i) => ({ kind: 'var', id: -100 - i, name: `$p${i}` }))
            }
          };
          p2.args.forEach((a, i) => {
            if (p1.args[i]) this.unify(a, p1.args[i], loc);
          });
          return;
        }
      }

      if (p1.kind === 'cons' && p2.kind === 'cons' && p1.name === p2.name) {
        p1.args.forEach((a, i) => {
          if (p2.args[i]) this.unify(a, p2.args[i], loc);
        });
        return;
      }

      if (p1.kind === 'fun' && p2.kind === 'fun') {
        p1.params.forEach((p, i) => {
          if (p2.params[i]) this.unify(p.type, p2.params[i].type, loc);
        });
        this.unify(p1.returnType, p2.returnType, loc);
        return;
      }

      if (p1.kind === 'tup' && p2.kind === 'tup') {
        if (p1.elements.length === 1 && p2.elements.length > 1) {
          p2.elements.forEach(e => this.unify(p1.elements[0], e, loc));
          return;
        }
        if (p2.elements.length === 1 && p1.elements.length > 1) {
          p1.elements.forEach(e => this.unify(e, p2.elements[0], loc));
          return;
        }
        p1.elements.forEach((e, i) => {
          if (p2.elements[i]) this.unify(e, p2.elements[i], loc);
        });
        return;
      }

      if (p1.kind === 'rec' && p2.kind === 'rec') {
        p2.fields.forEach(f => {
          const match = p1.fields.find(f1 => f1.name === f.name);
          if (match) {
            this.unify(match.type, f.type, loc);
          } else {
            this.addError(
              `Record type mismatch: Missing required field '${f.name}' in record`,
              loc,
              'Type Unification'
            );
          }
        });
        return;
      }

      const mismatch = this.formatHumanizedTypeMismatch(p1, p2);
      this.addError(
        mismatch.message,
        loc,
        'Type Unification',
        mismatch.quickFixes
      );
    } finally {
      this.unifyingPairs.delete(pairKey);
    }
  }

  private formatHumanizedTypeMismatch(p1: Type, p2: Type): { message: string; quickFixes?: QuickFix[] } {
    const str1 = typeToString(p1);
    const str2 = typeToString(p2);
    const base = `Type mismatch: cannot unify '${str1}' with '${str2}'`;

    // Number & String
    if (str1 === 'number' && str2 === 'string') {
      return {
        message: `${base}. Expected a string, but received a number. Tip: Convert number to string using 'to_string(...)'.`,
        quickFixes: [{ title: '💡 Convert number using to_string(...)', actionKind: 'wrap_expression' }]
      };
    }
    if (str1 === 'string' && str2 === 'number') {
      return {
        message: `${base}. Expected a number, but received a string. Tip: Parse with 'parse_int(...)' or remove quotes.`,
        quickFixes: [{ title: '💡 Parse string using parse_int(...)', actionKind: 'wrap_expression' }]
      };
    }

    // Boolean & Number
    if ((str1 === 'boolean' && str2 === 'number') || (str1 === 'number' && str2 === 'boolean')) {
      return {
        message: `${base}. Numbers and booleans cannot be implicitly coerced in TypeLang. Tip: Use comparison 'x != 0' for condition checks or 'if (b) 1 else 0'.`
      };
    }

    // Boolean & String
    if ((str1 === 'boolean' && str2 === 'string') || (str1 === 'string' && str2 === 'boolean')) {
      return {
        message: `${base}. Booleans and strings are incompatible types. Tip: Convert boolean using 'to_string(b)' or 'if (b) "true" else "false"'.`
      };
    }

    // Function vs non-function
    if ((p1.kind === 'fun' || p1.kind === 'poly') && (p2.kind === 'prim' || p2.kind === 'tup' || p2.kind === 'rec')) {
      return {
        message: `${base}. Found a function definition or reference where a '${str2}' value was expected (did you forget to invoke it with '()'?).`
      };
    }
    if ((p2.kind === 'fun' || p2.kind === 'poly') && (p1.kind === 'prim' || p1.kind === 'tup' || p1.kind === 'rec')) {
      return {
        message: `${base}. Expected a callable function '${str2}', but found a non-callable value of type '${str1}'.`
      };
    }

    // ADT / Option / Result vs primitive
    if (p1.kind === 'cons' && p2.kind === 'prim') {
      return {
        message: `${base}. Expected a primitive '${str2}', but found algebraic data type '${str1}'. Tip: Use pattern matching 'match (val) { ... }' to extract the inner value.`
      };
    }
    if (p2.kind === 'cons' && p1.kind === 'prim') {
      const ctorName = p2.name === 'Option' ? 'Some' : (p2.name === 'Result' ? 'Ok' : p2.name);
      return {
        message: `${base}. Expected algebraic data type '${str2}', but found primitive '${str1}'. Tip: Wrap value with constructor '${ctorName}(...)'.`
      };
    }

    // Array / Tuple vs element
    if (p1.kind === 'tup' && p2.kind === 'prim') {
      return {
        message: `${base}. Expected a single '${str2}', but received an array/tuple '${str1}'. Tip: Access elements with '[0]' or iterate over the list.`
      };
    }
    if (p2.kind === 'tup' && p1.kind === 'prim') {
      return {
        message: `${base}. Expected an array/tuple '${str2}', but received a single '${str1}'. Tip: Wrap in array brackets '[...]'.`
      };
    }

    return { message: base };
  }

  private addError(
    message: string,
    locOrLine?: SourceLoc | number,
    colOrCategory?: number | Diagnostic['category'],
    quickFixes?: QuickFix[],
    labels?: DiagnosticLabel[]
  ) {
    let line = 1;
    let col = 1;
    let endLine: number | undefined;
    let endCol: number | undefined;
    let cat: Diagnostic['category'] = 'General';

    if (typeof locOrLine === 'number') {
      line = locOrLine;
      col = typeof colOrCategory === 'number' ? colOrCategory : 1;
    } else if (locOrLine && typeof locOrLine === 'object') {
      line = locOrLine.line || 1;
      col = locOrLine.col || 1;
      endLine = locOrLine.endLine;
      endCol = locOrLine.endCol;
      if (typeof colOrCategory === 'string') {
        cat = colOrCategory as Diagnostic['category'];
      }
    } else if (typeof colOrCategory === 'string') {
      cat = colOrCategory as Diagnostic['category'];
    }

    this.diagnostics.push({
      severity: 'error',
      message,
      line,
      col,
      endLine,
      endCol,
      category: cat,
      labels,
      quickFixes
    });
  }

  private addWarning(
    message: string,
    locOrLine?: SourceLoc | number,
    colOrCategory?: number | Diagnostic['category'],
    quickFixes?: QuickFix[],
    labels?: DiagnosticLabel[]
  ) {
    let line = 1;
    let col = 1;
    let endLine: number | undefined;
    let endCol: number | undefined;
    let cat: Diagnostic['category'] = 'General';

    if (typeof locOrLine === 'number') {
      line = locOrLine;
      col = typeof colOrCategory === 'number' ? colOrCategory : 1;
    } else if (locOrLine && typeof locOrLine === 'object') {
      line = locOrLine.line || 1;
      col = locOrLine.col || 1;
      endLine = locOrLine.endLine;
      endCol = locOrLine.endCol;
      if (typeof colOrCategory === 'string') {
        cat = colOrCategory as Diagnostic['category'];
      }
    } else if (typeof colOrCategory === 'string') {
      cat = colOrCategory as Diagnostic['category'];
    }

    this.diagnostics.push({
      severity: 'warning',
      message,
      line,
      col,
      endLine,
      endCol,
      category: cat,
      labels,
      quickFixes
    });
  }

  private moduleEnvToType(modEnv: TypeEnv): Type {
    const fields: { name: string; type: Type }[] = [];
    modEnv.vars.forEach((v, k) => {
      fields.push({ name: k, type: v });
    });
    modEnv.modules.forEach((subm, k) => {
      fields.push({ name: k, type: this.moduleEnvToType(subm) });
    });
    return { kind: 'rec', fields, isModule: true };
  }
}
