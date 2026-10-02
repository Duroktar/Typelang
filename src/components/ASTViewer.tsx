import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Layers,
  Copy,
  Check,
  Code2,
  Maximize2,
  Minimize2,
  Box,
  Braces,
  Filter,
  Sparkles,
  GitBranch,
  Terminal,
  FileJson,
  Eye,
  Info,
  Hash
} from 'lucide-react';
import {
  Program,
  Statement,
  Expr,
  Pattern,
  TypeAST,
  GADTDecl,
  GADTConstructor,
  MatchArm,
  SourceLoc
} from '../lang/ast';

interface ASTViewerProps {
  programAST: Program | null;
  code?: string;
  onSelectLoc?: (line: number, col: number) => void;
}

// Convert TypeAST to concise string
function typeASTToString(t?: TypeAST): string {
  if (!t) return 'unknown';
  switch (t.kind) {
    case 'base':
      return t.name;
    case 'var':
      return t.name;
    case 'fun': {
      const ps = t.params.map(p => (p.name ? `${p.name}: ${typeASTToString(p.type)}` : typeASTToString(p.type))).join(', ');
      const quant = t.typeParams.length > 0 ? `<${t.typeParams.join(', ')}>` : '';
      return `${quant}(${ps}) => ${typeASTToString(t.returnType)}`;
    }
    case 'record':
      return `{ ${t.fields.map(f => `${f.isMut ? 'mut ' : ''}${f.name}${f.isOptional ? '?' : ''}: ${typeASTToString(f.type)}`).join(', ')} }`;
    case 'tuple':
      return `(${t.elements.map(typeASTToString).join(', ')})`;
    case 'app':
      return `${t.name}${t.args.length > 0 ? `<${t.args.map(typeASTToString).join(', ')}>` : ''}`;
    case 'forall':
      return `forall <${t.typeParams.join(', ')}> ${typeASTToString(t.type)}`;
    default:
      return 'type';
  }
}

// Helper to get concise summary representation for an AST node
function getNodeSummary(node: any, kind: string): { label: string; badge: string; badgeColor: string; subtitle?: string } {
  if (!node) return { label: 'null', badge: 'null', badgeColor: 'bg-slate-800 text-slate-400' };

  switch (kind) {
    case 's_gadt': {
      const decl: GADTDecl = node.decl;
      const typeParams = decl.typeParams.length > 0 ? `<${decl.typeParams.join(', ')}>` : '';
      const ctorCount = decl.constructors.length;
      return {
        label: `type ${decl.name}${typeParams}`,
        badge: 'GADT',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        subtitle: `${ctorCount} constructor variant${ctorCount === 1 ? '' : 's'}`
      };
    }

    case 'gadt_ctor': {
      const ctor: GADTConstructor = node;
      const paramStr = ctor.params.map(p => `${p.name}: ${typeASTToString(p.type)}`).join(', ');
      const retStr = ctor.returnType ? `: ${typeASTToString(ctor.returnType)}` : '';
      return {
        label: `${ctor.name}(${paramStr})${retStr}`,
        badge: 'Constructor',
        badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        subtitle: ctor.typeParams.length > 0 ? `Type params: <${ctor.typeParams.join(', ')}>` : undefined
      };
    }

    case 's_let': {
      const typeStr = node.typeAnnotation ? `: ${typeASTToString(node.typeAnnotation)}` : '';
      return {
        label: `${node.isMut ? 'let mut' : 'let'} ${node.name}${typeStr}`,
        badge: 'Let Binding',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      };
    }

    case 's_function': {
      const tparams = node.typeParams?.length > 0 ? `<${node.typeParams.join(', ')}>` : '';
      const params = node.params.map((p: any) => `${p.name}: ${typeASTToString(p.type)}`).join(', ');
      const ret = node.returnType ? `: ${typeASTToString(node.returnType)}` : '';
      return {
        label: `function ${node.name}${tparams}(${params})${ret}`,
        badge: 'Function',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      };
    }

    case 's_type_alias': {
      const decl = node.decl;
      const tparams = decl.typeParams.length > 0 ? `<${decl.typeParams.join(', ')}>` : '';
      return {
        label: `type ${decl.name}${tparams} = ${typeASTToString(decl.type)}`,
        badge: 'Type Alias',
        badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
      };
    }

    case 's_module': {
      return {
        label: `module ${node.name}`,
        badge: 'Module',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        subtitle: `${node.body?.length || 0} statement(s)`
      };
    }

    case 's_import': {
      const path = node.modulePath?.join('.') || '';
      return {
        label: `import ${path}${node.alias ? ` as ${node.alias}` : ''}`,
        badge: 'Import',
        badgeColor: 'bg-slate-700/40 text-slate-300 border-slate-600/40'
      };
    }

    case 's_expr': {
      return {
        label: `Expr Statement (${node.expr?.kind || 'expr'})`,
        badge: 'Statement',
        badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
      };
    }

    case 'e_match': {
      return {
        label: `match expression (${node.arms?.length || 0} arms)`,
        badge: 'Pattern Match',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      };
    }

    case 'match_arm': {
      return {
        label: `case pattern =>`,
        badge: 'Match Arm',
        badgeColor: 'bg-amber-500/15 text-amber-200 border-amber-500/25',
        subtitle: node.guard ? 'with guard condition' : undefined
      };
    }

    case 'p_ctor': {
      return {
        label: `| ${node.name}(${node.args?.length || 0} pattern args)`,
        badge: 'GADT Pattern',
        badgeColor: 'bg-indigo-500/25 text-indigo-200 border-indigo-500/40'
      };
    }

    case 'p_var': {
      return {
        label: `var: ${node.name}`,
        badge: 'Var Pattern',
        badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
      };
    }

    case 'p_wildcard': {
      return {
        label: `_ (wildcard)`,
        badge: 'Wildcard',
        badgeColor: 'bg-slate-800 text-slate-400 border-slate-700'
      };
    }

    case 'p_literal': {
      return {
        label: `literal: ${JSON.stringify(node.value)}`,
        badge: 'Lit Pattern',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      };
    }

    case 'p_record': {
      return {
        label: `record pattern { ${node.fields?.map((f: any) => f.name).join(', ') || ''} }`,
        badge: 'Record Pattern',
        badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
      };
    }

    case 'p_tuple': {
      return {
        label: `tuple pattern (${node.elements?.length || 0} items)`,
        badge: 'Tuple Pattern',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
      };
    }

    case 'e_literal': {
      return {
        label: `Literal: ${JSON.stringify(node.value)}`,
        badge: typeof node.value,
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      };
    }

    case 'e_var': {
      const mod = node.modulePath && node.modulePath.length > 0 ? `${node.modulePath.join('.')}.` : '';
      return {
        label: `Var: ${mod}${node.name}`,
        badge: 'Variable',
        badgeColor: 'bg-blue-500/15 text-blue-300 border-blue-500/20'
      };
    }

    case 'e_binary': {
      return {
        label: `Binary Op '${node.op}'`,
        badge: 'Binary Expr',
        badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
      };
    }

    case 'e_call': {
      return {
        label: `Function Call (${node.args?.length || 0} args)`,
        badge: 'Call',
        badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
      };
    }

    case 'e_lambda': {
      const params = node.params?.map((p: any) => p.name).join(', ') || '';
      return {
        label: `Lambda (${params}) =>`,
        badge: 'Lambda',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      };
    }

    case 'e_if': {
      return {
        label: `if / then / else`,
        badge: 'Condition',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      };
    }

    case 'e_block': {
      return {
        label: `Block (${node.statements?.length || 0} stmts)`,
        badge: 'Block',
        badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
      };
    }

    case 'e_record': {
      return {
        label: `Record { ${node.fields?.map((f: any) => f.name).join(', ') || ''} }`,
        badge: 'Record',
        badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
      };
    }

    case 'e_tuple': {
      return {
        label: `Tuple (${node.elements?.length || 0} elements)`,
        badge: 'Tuple',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
      };
    }

    default:
      return {
        label: kind,
        badge: kind,
        badgeColor: 'bg-slate-800 text-slate-400 border-slate-700'
      };
  }
}

interface TreeNodeProps {
  label: string;
  nodeKey: string;
  kind: string;
  nodeData: any;
  loc?: SourceLoc;
  depth: number;
  expandedMap: Record<string, boolean>;
  onToggle: (key: string) => void;
  searchQuery: string;
  onSelectLoc?: (line: number, col: number) => void;
}

const TreeNodeItem: React.FC<TreeNodeProps> = ({
  label,
  nodeKey,
  kind,
  nodeData,
  loc,
  depth,
  expandedMap,
  onToggle,
  searchQuery,
  onSelectLoc
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const isExpanded = expandedMap[nodeKey] !== false; // default expanded

  const summary = useMemo(() => {
    return getNodeSummary(nodeData, kind);
  }, [nodeData, kind]);

  // Determine children based on node type
  const children = useMemo(() => {
    if (!nodeData) return [];
    const list: { key: string; label: string; kind: string; data: any; loc?: SourceLoc }[] = [];

    // GADT declaration
    if (kind === 's_gadt' && nodeData.decl?.constructors) {
      nodeData.decl.constructors.forEach((ctor: GADTConstructor, i: number) => {
        list.push({
          key: `${nodeKey}.ctor_${ctor.name || i}`,
          label: `Constructor: ${ctor.name}`,
          kind: 'gadt_ctor',
          data: ctor,
          loc: ctor.loc
        });
      });
    }

    // GADT Constructor
    if (kind === 'gadt_ctor') {
      if (nodeData.params && nodeData.params.length > 0) {
        nodeData.params.forEach((param: any, i: number) => {
          list.push({
            key: `${nodeKey}.param_${param.name || i}`,
            label: `param: ${param.name}: ${typeASTToString(param.type)}`,
            kind: 'type_param',
            data: param,
            loc: param.loc
          });
        });
      }
      if (nodeData.returnType) {
        list.push({
          key: `${nodeKey}.ret`,
          label: `returnType: ${typeASTToString(nodeData.returnType)}`,
          kind: 'type_return',
          data: nodeData.returnType,
          loc: nodeData.returnType.loc
        });
      }
    }

    // Statement Let
    if (kind === 's_let') {
      if (nodeData.typeAnnotation) {
        list.push({
          key: `${nodeKey}.type`,
          label: `typeAnnotation: ${typeASTToString(nodeData.typeAnnotation)}`,
          kind: 'type_annotation',
          data: nodeData.typeAnnotation,
          loc: nodeData.typeAnnotation.loc
        });
      }
      if (nodeData.init) {
        list.push({
          key: `${nodeKey}.init`,
          label: `init: ${nodeData.init.kind}`,
          kind: nodeData.init.kind,
          data: nodeData.init,
          loc: nodeData.init.loc
        });
      }
    }

    // Statement Function
    if (kind === 's_function') {
      if (nodeData.params && nodeData.params.length > 0) {
        nodeData.params.forEach((p: any, i: number) => {
          list.push({
            key: `${nodeKey}.p_${p.name || i}`,
            label: `param: ${p.name}: ${typeASTToString(p.type)}`,
            kind: 'param_decl',
            data: p
          });
        });
      }
      if (nodeData.body) {
        list.push({
          key: `${nodeKey}.body`,
          label: `body (${nodeData.body.kind})`,
          kind: nodeData.body.kind,
          data: nodeData.body,
          loc: nodeData.body.loc
        });
      }
    }

    // Statement Module
    if (kind === 's_module' && nodeData.body) {
      nodeData.body.forEach((stmt: Statement, i: number) => {
        list.push({
          key: `${nodeKey}.stmt_${i}`,
          label: `statement [${i}]`,
          kind: stmt.kind,
          data: stmt,
          loc: stmt.loc
        });
      });
    }

    // Statement Expr
    if (kind === 's_expr' && nodeData.expr) {
      list.push({
        key: `${nodeKey}.expr`,
        label: `expr: ${nodeData.expr.kind}`,
        kind: nodeData.expr.kind,
        data: nodeData.expr,
        loc: nodeData.expr.loc
      });
    }

    // Expression Match
    if (kind === 'e_match') {
      if (nodeData.scrutinee) {
        list.push({
          key: `${nodeKey}.scrutinee`,
          label: `scrutinee: ${nodeData.scrutinee.kind}`,
          kind: nodeData.scrutinee.kind,
          data: nodeData.scrutinee,
          loc: nodeData.scrutinee.loc
        });
      }
      if (nodeData.arms && nodeData.arms.length > 0) {
        nodeData.arms.forEach((arm: MatchArm, i: number) => {
          list.push({
            key: `${nodeKey}.arm_${i}`,
            label: `Match Arm [${i}]`,
            kind: 'match_arm',
            data: arm,
            loc: arm.loc
          });
        });
      }
    }

    // Match Arm
    if (kind === 'match_arm') {
      if (nodeData.pattern) {
        list.push({
          key: `${nodeKey}.pattern`,
          label: `pattern: ${nodeData.pattern.kind}`,
          kind: nodeData.pattern.kind,
          data: nodeData.pattern,
          loc: nodeData.pattern.loc
        });
      }
      if (nodeData.guard) {
        list.push({
          key: `${nodeKey}.guard`,
          label: `guard: ${nodeData.guard.kind}`,
          kind: nodeData.guard.kind,
          data: nodeData.guard,
          loc: nodeData.guard.loc
        });
      }
      if (nodeData.body) {
        list.push({
          key: `${nodeKey}.body`,
          label: `arm body: ${nodeData.body.kind}`,
          kind: nodeData.body.kind,
          data: nodeData.body,
          loc: nodeData.body.loc
        });
      }
    }

    // Pattern Constructor (GADT Pattern)
    if (kind === 'p_ctor' && nodeData.args) {
      nodeData.args.forEach((arg: Pattern, i: number) => {
        list.push({
          key: `${nodeKey}.arg_${i}`,
          label: `arg[${i}]: ${arg.kind}`,
          kind: arg.kind,
          data: arg,
          loc: arg.loc
        });
      });
    }

    // Expression Binary
    if (kind === 'e_binary') {
      if (nodeData.left) {
        list.push({
          key: `${nodeKey}.left`,
          label: `left: ${nodeData.left.kind}`,
          kind: nodeData.left.kind,
          data: nodeData.left,
          loc: nodeData.left.loc
        });
      }
      if (nodeData.right) {
        list.push({
          key: `${nodeKey}.right`,
          label: `right: ${nodeData.right.kind}`,
          kind: nodeData.right.kind,
          data: nodeData.right,
          loc: nodeData.right.loc
        });
      }
    }

    // Expression Call
    if (kind === 'e_call') {
      if (nodeData.callee) {
        list.push({
          key: `${nodeKey}.callee`,
          label: `callee: ${nodeData.callee.kind}`,
          kind: nodeData.callee.kind,
          data: nodeData.callee,
          loc: nodeData.callee.loc
        });
      }
      if (nodeData.args && nodeData.args.length > 0) {
        nodeData.args.forEach((arg: Expr, i: number) => {
          list.push({
            key: `${nodeKey}.arg_${i}`,
            label: `arg[${i}]: ${arg.kind}`,
            kind: arg.kind,
            data: arg,
            loc: arg.loc
          });
        });
      }
    }

    // Expression Lambda
    if (kind === 'e_lambda') {
      if (nodeData.body) {
        list.push({
          key: `${nodeKey}.body`,
          label: `body (${nodeData.body.kind})`,
          kind: nodeData.body.kind,
          data: nodeData.body,
          loc: nodeData.body.loc
        });
      }
    }

    // Expression If
    if (kind === 'e_if') {
      if (nodeData.condition) {
        list.push({
          key: `${nodeKey}.cond`,
          label: `condition: ${nodeData.condition.kind}`,
          kind: nodeData.condition.kind,
          data: nodeData.condition,
          loc: nodeData.condition.loc
        });
      }
      if (nodeData.thenBranch) {
        list.push({
          key: `${nodeKey}.then`,
          label: `thenBranch: ${nodeData.thenBranch.kind}`,
          kind: nodeData.thenBranch.kind,
          data: nodeData.thenBranch,
          loc: nodeData.thenBranch.loc
        });
      }
      if (nodeData.elseBranch) {
        list.push({
          key: `${nodeKey}.else`,
          label: `elseBranch: ${nodeData.elseBranch.kind}`,
          kind: nodeData.elseBranch.kind,
          data: nodeData.elseBranch,
          loc: nodeData.elseBranch.loc
        });
      }
    }

    // Expression Block
    if (kind === 'e_block' && nodeData.statements) {
      nodeData.statements.forEach((st: Statement | Expr, i: number) => {
        list.push({
          key: `${nodeKey}.stmt_${i}`,
          label: `stmt [${i}] (${st.kind})`,
          kind: st.kind,
          data: st,
          loc: (st as any).loc
        });
      });
    }

    return list;
  }, [nodeData, kind, nodeKey]);

  const hasChildren = children.length > 0;

  // Matching check for highlighting
  const isMatch = useMemo(() => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    const str = `${summary.label} ${summary.badge} ${summary.subtitle || ''} ${kind}`.toLowerCase();
    return str.includes(q);
  }, [searchQuery, summary, kind]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(nodeData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLocClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loc && onSelectLoc) {
      onSelectLoc(loc.line, loc.col);
    }
  };

  return (
    <div className="font-mono text-xs select-none">
      {/* Node Row Header */}
      <div
        onClick={() => hasChildren && onToggle(nodeKey)}
        className={`group flex items-center justify-between py-1.5 px-2.5 rounded-lg border transition-all cursor-pointer ${
          isMatch
            ? 'bg-amber-950/40 border-amber-500/60 shadow-sm'
            : isExpanded && hasChildren
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-slate-950 border-slate-850 hover:bg-slate-900/60 hover:border-slate-800'
        }`}
        style={{ marginLeft: `${Math.min(depth * 14, 180)}px` }}
      >
        <div className="flex items-center space-x-2 min-w-0 pr-2">
          {/* Expand/Collapse Chevron */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(nodeKey);
              }}
              className="p-0.5 text-slate-400 hover:text-white rounded transition"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
              )}
            </button>
          ) : (
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            </div>
          )}

          {/* Kind Badge */}
          <span
            className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border shrink-0 ${summary.badgeColor}`}
          >
            {summary.badge}
          </span>

          {/* Label text */}
          <span className="font-semibold text-slate-200 truncate text-[11px]">
            {summary.label}
          </span>

          {/* Subtitle if any */}
          {summary.subtitle && (
            <span className="text-slate-500 text-[10px] hidden md:inline truncate">
              • {summary.subtitle}
            </span>
          )}
        </div>

        {/* Right side: Source location & quick actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {loc && (
            <button
              onClick={handleLocClick}
              className="text-[10px] font-mono text-slate-500 hover:text-indigo-300 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800 hover:border-indigo-500/30 transition"
              title="Jump to code location"
            >
              L{loc.line}:{loc.col}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
            title="Copy Node JSON"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Children Tree Nodes */}
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1 relative pl-2 border-l border-slate-850/80 ml-2">
          {children.map(child => (
            <TreeNodeItem
              key={child.key}
              nodeKey={child.key}
              label={child.label}
              kind={child.kind}
              nodeData={child.data}
              loc={child.loc || child.data?.loc}
              depth={depth + 1}
              expandedMap={expandedMap}
              onToggle={onToggle}
              searchQuery={searchQuery}
              onSelectLoc={onSelectLoc}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const ASTViewer: React.FC<ASTViewerProps> = ({
  programAST,
  code = '',
  onSelectLoc
}) => {
  const [viewMode, setViewMode] = useState<'tree' | 'json'>('tree');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [filterGadtOnly, setFilterGadtOnly] = useState<boolean>(false);

  // Toggle single node
  const handleToggle = (key: string) => {
    setExpandedMap(prev => ({
      ...prev,
      [key]: prev[key] === false ? true : false
    }));
  };

  // Expand / Collapse all
  const handleExpandAll = () => {
    setExpandedMap({});
  };

  const handleCollapseAll = () => {
    if (!programAST) return;
    const collapsed: Record<string, boolean> = {};
    programAST.statements.forEach((_, idx) => {
      collapsed[`stmt_${idx}`] = false;
    });
    setExpandedMap(collapsed);
  };

  // Expand only GADTs and collapse others
  const handleExpandGADTsOnly = () => {
    if (!programAST) return;
    const map: Record<string, boolean> = {};
    programAST.statements.forEach((stmt, idx) => {
      if (stmt.kind === 's_gadt' || stmt.kind === 's_type_alias') {
        map[`stmt_${idx}`] = true;
      } else {
        map[`stmt_${idx}`] = false;
      }
    });
    setExpandedMap(map);
  };

  const handleCopyJSON = () => {
    if (!programAST) return;
    navigator.clipboard.writeText(JSON.stringify(programAST, null, 2));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Filter statements if GADT filter is enabled
  const displayedStatements = useMemo(() => {
    if (!programAST) return [];
    return programAST.statements.filter(stmt => {
      if (filterGadtOnly) {
        return (
          stmt.kind === 's_gadt' ||
          stmt.kind === 's_type_alias' ||
          (stmt.kind === 's_let' && stmt.init?.kind === 'e_match') ||
          (stmt.kind === 's_expr' && stmt.expr?.kind === 'e_match') ||
          (stmt.kind === 's_function' && stmt.body?.kind === 'e_match')
        );
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const jsonStr = JSON.stringify(stmt).toLowerCase();
        return jsonStr.includes(q);
      }
      return true;
    });
  }, [programAST, filterGadtOnly, searchQuery]);

  // High-level AST Metrics
  const metrics = useMemo(() => {
    if (!programAST) return { totalStmts: 0, gadts: 0, functions: 0, matches: 0 };
    let gadts = 0;
    let functions = 0;
    let matches = 0;

    const countMatches = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      if (obj.kind === 'e_match') matches++;
      for (const k of Object.keys(obj)) {
        countMatches(obj[k]);
      }
    };

    programAST.statements.forEach(s => {
      if (s.kind === 's_gadt') gadts++;
      if (s.kind === 's_function') functions++;
      countMatches(s);
    });

    return {
      totalStmts: programAST.statements.length,
      gadts,
      functions,
      matches
    };
  }, [programAST]);

  return (
    <div className="space-y-3.5 text-xs font-sans text-slate-200">
      {/* Header & Controls Toolbar */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Title & Stats */}
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-200 text-xs">Interactive AST Inspector</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-900 border border-slate-800 text-indigo-300">
                  {metrics.totalStmts} Root Statements
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Explore hierarchical syntax nodes, inspect GADT constructor trees, patterns, and match arms
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search AST nodes (e.g. Expr, Lit, match)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-2">
          {/* Quick Filter & Expand Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleExpandAll}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer text-[11px]"
              title="Expand All Nodes"
            >
              <Maximize2 className="w-3 h-3 text-indigo-400" />
              <span>Expand All</span>
            </button>

            <button
              onClick={handleCollapseAll}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer text-[11px]"
              title="Collapse All Nodes"
            >
              <Minimize2 className="w-3 h-3 text-slate-400" />
              <span>Collapse</span>
            </button>

            <button
              onClick={handleExpandGADTsOnly}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition cursor-pointer text-[11px]"
              title="Focus on GADT definitions"
            >
              <Layers className="w-3 h-3 text-purple-400" />
              <span>Focus GADTs</span>
            </button>

            <button
              onClick={() => setFilterGadtOnly(!filterGadtOnly)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border transition cursor-pointer text-[11px] ${
                filterGadtOnly
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>{filterGadtOnly ? 'Showing GADTs & Matches' : 'Filter GADTs'}</span>
            </button>
          </div>

          {/* View Mode Toggle & Copy */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('tree')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  viewMode === 'tree'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Tree View</span>
              </button>
              <button
                onClick={() => setViewMode('json')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                  viewMode === 'json'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileJson className="w-3 h-3" />
                <span>Raw JSON</span>
              </button>
            </div>

            <button
              onClick={handleCopyJSON}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer text-[11px]"
              title="Copy Complete AST JSON"
            >
              {copiedAll ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedAll ? 'Copied' : 'Copy AST'}</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Summary Bar */}
        <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>GADTs: <strong className="text-purple-300">{metrics.gadts}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Pattern Matches: <strong className="text-amber-300">{metrics.matches}</strong></span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Functions: <strong className="text-emerald-300">{metrics.functions}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {programAST ? (
        viewMode === 'tree' ? (
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {displayedStatements.length === 0 ? (
              <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center text-slate-500">
                No AST statements match the current filter or search criteria.
              </div>
            ) : (
              displayedStatements.map((stmt, idx) => (
                <TreeNodeItem
                  key={`stmt_${idx}`}
                  nodeKey={`stmt_${idx}`}
                  label={`Statement [${idx}]: ${stmt.kind}`}
                  kind={stmt.kind}
                  nodeData={stmt}
                  loc={stmt.loc}
                  depth={0}
                  expandedMap={expandedMap}
                  onToggle={handleToggle}
                  searchQuery={searchQuery}
                  onSelectLoc={onSelectLoc}
                />
              ))
            )}
          </div>
        ) : (
          <div className="relative">
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed max-h-[620px]">
              {JSON.stringify(programAST, null, 2)}
            </pre>
          </div>
        )
      ) : (
        <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center text-slate-500 space-y-2">
          <Info className="w-5 h-5 mx-auto text-slate-600" />
          <p className="text-xs">Run or parse the code to generate the Abstract Syntax Tree (AST).</p>
        </div>
      )}
    </div>
  );
};
