import { TypeEnv } from './checker';
import { Program, GADTConstructor, Statement } from './ast';
import { Type, typeToString, TFun, TRec, TCons, TPoly } from './types';
import { inspectSymbolByName } from './lsp';

export type TypeNodeCategory = 
  | 'root'
  | 'category'
  | 'gadt'
  | 'constructor'
  | 'record'
  | 'field'
  | 'function'
  | 'param'
  | 'variable'
  | 'module'
  | 'primitive'
  | 'type_param';

export interface TypeGraphNode {
  id: string;
  name: string;
  label: string;
  category: TypeNodeCategory;
  typeString: string;
  signature: string;
  doc?: string;
  kind?: string;
  loc?: { line: number; col: number };
  children?: TypeGraphNode[];
  // Graph metrics
  depth?: number;
  val?: number;
  isExported?: boolean;
  isMut?: boolean;
}

export interface TypeGraphLink {
  id: string;
  source: string;
  target: string;
  label: string;
  kind: 'constructs' | 'field_of' | 'returns' | 'param_of' | 'has_type' | 'member_of' | 'variant_param' | 'alias_of';
}

export interface TypeHierarchyData {
  root: TypeGraphNode;
  nodes: TypeGraphNode[];
  links: TypeGraphLink[];
  stats: {
    totalTypes: number;
    gadtCount: number;
    constructorCount: number;
    recordCount: number;
    functionCount: number;
    variableCount: number;
    moduleCount: number;
  };
}

/**
 * Extracts referenced primitive and compound type names from a Type
 */
function extractTypeReferences(type: Type, refs: Set<string> = new Set()): Set<string> {
  if (!type) return refs;
  switch (type.kind) {
    case 'prim':
      refs.add(type.name);
      break;
    case 'cons':
      refs.add(type.name);
      for (const arg of type.args) {
        extractTypeReferences(arg, refs);
      }
      break;
    case 'rec':
      for (const f of type.fields) {
        extractTypeReferences(f.type, refs);
      }
      break;
    case 'fun':
      for (const p of type.params) {
        extractTypeReferences(p.type, refs);
      }
      extractTypeReferences(type.returnType, refs);
      break;
    case 'poly':
      extractTypeReferences(type.type, refs);
      break;
    case 'tup':
      for (const el of type.elements) {
        extractTypeReferences(el, refs);
      }
      break;
    case 'hkt_app':
      extractTypeReferences(type.constructor, refs);
      for (const arg of type.args) {
        extractTypeReferences(arg, refs);
      }
      break;
  }
  return refs;
}

/**
 * Analyze TypeEnv and AST to generate comprehensive hierarchical tree & relational graph.
 */
export function buildTypeHierarchy(
  typeEnv: TypeEnv | null,
  programAST: Program | null,
  code: string = ''
): TypeHierarchyData {
  const nodesMap = new Map<string, TypeGraphNode>();
  const links: TypeGraphLink[] = [];

  const addNode = (node: TypeGraphNode) => {
    if (!nodesMap.has(node.id)) {
      nodesMap.set(node.id, node);
    }
    return nodesMap.get(node.id)!;
  };

  const addLink = (source: string, target: string, label: string, kind: TypeGraphLink['kind']) => {
    const linkId = `${source}->${target}:${kind}`;
    if (!links.some(l => l.id === linkId)) {
      links.push({ id: linkId, source, target, label, kind });
    }
  };

  // 1. Root Node for Tree View
  const rootNode: TypeGraphNode = {
    id: 'root',
    name: 'Program Type Universe',
    label: 'Type Universe',
    category: 'root',
    typeString: 'kind: *',
    signature: 'Program Type Space',
    doc: 'Unified inferred and declared type hierarchy of the compiled program.',
    children: []
  };
  addNode(rootNode);

  // Category Branches for Tree
  const gadtBranch: TypeGraphNode = {
    id: 'cat_gadts',
    name: 'GADTs & Sum Types',
    label: 'GADTs & Sum Types',
    category: 'category',
    typeString: 'Algebraic Types',
    signature: 'Algebraic Data Types',
    doc: 'Inductive sum types with distinct constructor branches and GADT refinement.',
    children: []
  };

  const recordBranch: TypeGraphNode = {
    id: 'cat_records',
    name: 'Records & Type Aliases',
    label: 'Records & Aliases',
    category: 'category',
    typeString: 'Structural Types',
    signature: 'Product & Alias Types',
    doc: 'Structural record types, aliases, and named object layouts.',
    children: []
  };

  const functionBranch: TypeGraphNode = {
    id: 'cat_functions',
    name: 'Inferred Functions & Callables',
    label: 'Functions & Methods',
    category: 'category',
    typeString: 'Arrow Types',
    signature: 'Functions & Callables',
    doc: 'Top-level functions, closures, and higher-order routines.',
    children: []
  };

  const variableBranch: TypeGraphNode = {
    id: 'cat_variables',
    name: 'Inferred Top-Level State',
    label: 'Variables & State',
    category: 'category',
    typeString: 'Concrete Inferred Bindings',
    signature: 'Variables & Constants',
    doc: 'Top-level value bindings with bidirectional inferred types.',
    children: []
  };

  const moduleBranch: TypeGraphNode = {
    id: 'cat_modules',
    name: 'Namespaces & Modules',
    label: 'Modules',
    category: 'category',
    typeString: 'Namespaces',
    signature: 'Module Declarations',
    doc: 'Encapsulated module scopes and exported symbol interfaces.',
    children: []
  };

  const primitiveBranch: TypeGraphNode = {
    id: 'cat_primitives',
    name: 'Primitive Types',
    label: 'Primitives',
    category: 'category',
    typeString: 'Ground Types',
    signature: 'Ground Types',
    doc: 'Built-in scalar atomic primitives.',
    children: []
  };

  // Register ground primitive nodes
  const primitives = ['number', 'string', 'boolean', 'void'];
  for (const prim of primitives) {
    const primNode: TypeGraphNode = {
      id: `prim_${prim}`,
      name: prim,
      label: prim,
      category: 'primitive',
      typeString: prim,
      signature: `primitive ${prim}`,
      doc: `Built-in scalar atomic ground type \`${prim}\`.`,
      kind: '*'
    };
    addNode(primNode);
    primitiveBranch.children!.push(primNode);
  }

  let gadtCount = 0;
  let constructorCount = 0;
  let recordCount = 0;
  let functionCount = 0;
  let variableCount = 0;
  let moduleCount = 0;

  if (typeEnv) {
    // 2. Process GADTs
    for (const [gadtName, gadt] of typeEnv.gadts.entries()) {
      gadtCount++;
      const paramsStr = gadt.typeParams.length > 0 ? `<${gadt.typeParams.join(', ')}>` : '';
      const kindStr = gadt.typeParams.length > 0 ? `* -> `.repeat(gadt.typeParams.length) + `*` : '*';
      
      const gadtNode: TypeGraphNode = {
        id: `type_${gadtName}`,
        name: gadtName,
        label: `${gadtName}${paramsStr}`,
        category: 'gadt',
        typeString: `type ${gadtName}${paramsStr}`,
        signature: `type ${gadtName}${paramsStr}`,
        kind: kindStr,
        doc: `Generalized Algebraic Data Type with ${gadt.constructors.length} constructor variant(s).`,
        children: []
      };
      addNode(gadtNode);
      gadtBranch.children!.push(gadtNode);

      // Add constructors
      for (const ctor of gadt.constructors) {
        constructorCount++;
        const ctorParams = ctor.params.map(p => `${p.name}: ${p.type.kind}`).join(', ');
        const ctorSig = `${ctor.name}(${ctorParams})`;
        
        const ctorNode: TypeGraphNode = {
          id: `ctor_${gadtName}_${ctor.name}`,
          name: ctor.name,
          label: ctorSig,
          category: 'constructor',
          typeString: `${ctor.name} -> ${gadtName}`,
          signature: ctorSig,
          doc: `Constructor variant for GADT \`${gadtName}\`.`,
          children: []
        };
        addNode(ctorNode);
        gadtNode.children!.push(ctorNode);

        // Relational graph link: ctor -> GADT
        addLink(ctorNode.id, gadtNode.id, 'constructs', 'constructs');

        // Parameter types of constructor
        for (const p of ctor.params) {
          const pNode: TypeGraphNode = {
            id: `ctor_param_${gadtName}_${ctor.name}_${p.name}`,
            name: p.name,
            label: `${p.name}: ${p.type.kind}`,
            category: 'param',
            typeString: p.type.kind,
            signature: `${p.name}: ${p.type.kind}`,
            doc: `Field parameter \`${p.name}\` of constructor \`${ctor.name}\`.`
          };
          addNode(pNode);
          ctorNode.children!.push(pNode);

          // Link to referenced types
          const targetPrim = primitives.find(pr => pr === p.type.kind);
          if (targetPrim) {
            addLink(ctorNode.id, `prim_${targetPrim}`, p.name, 'variant_param');
          } else if (typeEnv.gadts.has(p.type.kind)) {
            addLink(ctorNode.id, `type_${p.type.kind}`, p.name, 'variant_param');
          }
        }
      }
    }

    // 3. Process Type Aliases & Structural Records
    for (const [aliasName, alias] of typeEnv.typeAliases.entries()) {
      recordCount++;
      const typeStr = typeToString(alias.type);
      const paramsStr = alias.typeParams.length > 0 ? `<${alias.typeParams.join(', ')}>` : '';

      const aliasNode: TypeGraphNode = {
        id: `alias_${aliasName}`,
        name: aliasName,
        label: `${aliasName}${paramsStr}`,
        category: 'record',
        typeString: typeStr,
        signature: `type ${aliasName}${paramsStr} = ${typeStr}`,
        doc: `Type alias / structural record \`${aliasName}\`.`,
        children: []
      };
      addNode(aliasNode);
      recordBranch.children!.push(aliasNode);

      // If it's a record, break down fields
      if (alias.type.kind === 'rec') {
        for (const field of alias.type.fields) {
          const fieldTypeStr = typeToString(field.type);
          const fieldNode: TypeGraphNode = {
            id: `field_${aliasName}_${field.name}`,
            name: field.name,
            label: `${field.isMut ? 'mut ' : ''}${field.name}${field.isOptional ? '?' : ''}: ${fieldTypeStr}`,
            category: 'field',
            typeString: fieldTypeStr,
            signature: `${field.name}: ${fieldTypeStr}`,
            isMut: field.isMut,
            doc: `Record property \`${field.name}\` of \`${aliasName}\`.`
          };
          addNode(fieldNode);
          aliasNode.children!.push(fieldNode);

          // Relational link to target type
          const refs = extractTypeReferences(field.type);
          for (const ref of refs) {
            if (primitives.includes(ref)) {
              addLink(aliasNode.id, `prim_${ref}`, field.name, 'field_of');
            } else if (typeEnv.gadts.has(ref)) {
              addLink(aliasNode.id, `type_${ref}`, field.name, 'field_of');
            } else if (typeEnv.typeAliases.has(ref)) {
              addLink(aliasNode.id, `alias_${ref}`, field.name, 'field_of');
            }
          }
        }
      }
    }

    // 4. Process Top-level Variables & Functions
    for (const [varName, varType] of typeEnv.vars.entries()) {
      // Skip internal stdlib if not in user AST
      const isStdlib = ['print', 'println', 'to_string', 'concat'].includes(varName);
      const inUserAst = programAST?.statements.some(s => 
        (s.kind === 's_function' && s.name === varName) || 
        (s.kind === 's_let' && s.name === varName)
      );
      if (isStdlib && !inUserAst) continue;

      const typeStr = typeToString(varType);
      const isFun = varType.kind === 'fun' || (varType.kind === 'poly' && varType.type.kind === 'fun');

      if (isFun) {
        functionCount++;
        let funType: TFun = varType.kind === 'fun' ? varType : (varType.type as TFun);
        let quantifiers: string[] = varType.kind === 'poly' ? (varType as TPoly).quantifiers : [];
        const quantStr = quantifiers.length > 0 ? `<${quantifiers.join(', ')}>` : '';
        const paramsSig = funType.params.map((p, i) => `${p.name || `arg${i + 1}`}: ${typeToString(p.type)}`).join(', ');
        const retSig = typeToString(funType.returnType);

        const funNode: TypeGraphNode = {
          id: `fn_${varName}`,
          name: varName,
          label: `${varName}${quantStr}(${paramsSig}): ${retSig}`,
          category: 'function',
          typeString: typeStr,
          signature: `function ${varName}${quantStr}(${paramsSig}): ${retSig}`,
          doc: `Inferred function \`${varName}\`.`,
          isExported: typeEnv.exports.has(varName),
          children: []
        };
        addNode(funNode);
        functionBranch.children!.push(funNode);

        // Parameters in tree
        for (let i = 0; i < funType.params.length; i++) {
          const p = funType.params[i];
          const pName = p.name || `arg${i + 1}`;
          const pTypeStr = typeToString(p.type);
          const pNode: TypeGraphNode = {
            id: `fn_param_${varName}_${pName}`,
            name: pName,
            label: `${pName}: ${pTypeStr}`,
            category: 'param',
            typeString: pTypeStr,
            signature: `${pName}: ${pTypeStr}`,
            doc: `Argument \`${pName}\` to function \`${varName}\`.`
          };
          addNode(pNode);
          funNode.children!.push(pNode);

          // Link to parameter types
          const refs = extractTypeReferences(p.type);
          for (const ref of refs) {
            if (primitives.includes(ref)) {
              addLink(funNode.id, `prim_${ref}`, `param: ${pName}`, 'param_of');
            } else if (typeEnv.gadts.has(ref)) {
              addLink(funNode.id, `type_${ref}`, `param: ${pName}`, 'param_of');
            } else if (typeEnv.typeAliases.has(ref)) {
              addLink(funNode.id, `alias_${ref}`, `param: ${pName}`, 'param_of');
            }
          }
        }

        // Return type node
        const retNode: TypeGraphNode = {
          id: `fn_ret_${varName}`,
          name: 'returns',
          label: `-> ${retSig}`,
          category: 'param',
          typeString: retSig,
          signature: `returns ${retSig}`,
          doc: `Return type of \`${varName}\`.`
        };
        addNode(retNode);
        funNode.children!.push(retNode);

        // Link to return types
        const retRefs = extractTypeReferences(funType.returnType);
        for (const ref of retRefs) {
          if (primitives.includes(ref)) {
            addLink(funNode.id, `prim_${ref}`, 'returns', 'returns');
          } else if (typeEnv.gadts.has(ref)) {
            addLink(funNode.id, `type_${ref}`, 'returns', 'returns');
          } else if (typeEnv.typeAliases.has(ref)) {
            addLink(funNode.id, `alias_${ref}`, 'returns', 'returns');
          }
        }
      } else {
        // Variable binding
        variableCount++;
        const isMut = typeEnv.mutVars.has(varName);
        const varNode: TypeGraphNode = {
          id: `var_${varName}`,
          name: varName,
          label: `${isMut ? 'mut ' : ''}${varName}: ${typeStr}`,
          category: 'variable',
          typeString: typeStr,
          signature: `let ${isMut ? 'mut ' : ''}${varName}: ${typeStr}`,
          doc: `Inferred variable binding \`${varName}\`.`,
          isMut,
          isExported: typeEnv.exports.has(varName)
        };
        addNode(varNode);
        variableBranch.children!.push(varNode);

        // Link to inferred type
        const refs = extractTypeReferences(varType);
        for (const ref of refs) {
          if (primitives.includes(ref)) {
            addLink(varNode.id, `prim_${ref}`, 'type', 'has_type');
          } else if (typeEnv.gadts.has(ref)) {
            addLink(varNode.id, `type_${ref}`, 'type', 'has_type');
          } else if (typeEnv.typeAliases.has(ref)) {
            addLink(varNode.id, `alias_${ref}`, 'type', 'has_type');
          }
        }
      }
    }

    // 5. Process Modules
    for (const [modName, modEnv] of typeEnv.modules.entries()) {
      if (['Math', 'Array', 'String', 'DOM', 'Node', 'Option', 'Result', 'IO', 'State'].includes(modName)) {
        // Only include if referenced in AST
        const isReferenced = code.includes(`${modName}.`);
        if (!isReferenced) continue;
      }

      moduleCount++;
      const modNode: TypeGraphNode = {
        id: `mod_${modName}`,
        name: modName,
        label: `module ${modName}`,
        category: 'module',
        typeString: `module ${modName}`,
        signature: `module ${modName} (${modEnv.vars.size} exports)`,
        doc: `Module namespace \`${modName}\`.`,
        children: []
      };
      addNode(modNode);
      moduleBranch.children!.push(modNode);

      for (const [memberName, memberType] of modEnv.vars.entries()) {
        const memberTypeStr = typeToString(memberType);
        const memberNode: TypeGraphNode = {
          id: `mod_${modName}_${memberName}`,
          name: memberName,
          label: `${memberName}: ${memberTypeStr}`,
          category: 'function',
          typeString: memberTypeStr,
          signature: `${modName}.${memberName}: ${memberTypeStr}`,
          doc: `Member \`${memberName}\` exported by \`${modName}\`.`
        };
        addNode(memberNode);
        modNode.children!.push(memberNode);
        addLink(memberNode.id, modNode.id, 'member_of', 'member_of');
      }
    }
  }

  // Populate root node children if categories have elements
  if (gadtBranch.children!.length > 0) rootNode.children!.push(gadtBranch);
  if (recordBranch.children!.length > 0) rootNode.children!.push(recordBranch);
  if (functionBranch.children!.length > 0) rootNode.children!.push(functionBranch);
  if (variableBranch.children!.length > 0) rootNode.children!.push(variableBranch);
  if (moduleBranch.children!.length > 0) rootNode.children!.push(moduleBranch);
  if (primitiveBranch.children!.length > 0) rootNode.children!.push(primitiveBranch);

  const totalTypes = gadtCount + recordCount + primitives.length;

  return {
    root: rootNode,
    nodes: Array.from(nodesMap.values()),
    links,
    stats: {
      totalTypes,
      gadtCount,
      constructorCount,
      recordCount,
      functionCount,
      variableCount,
      moduleCount
    }
  };
}
