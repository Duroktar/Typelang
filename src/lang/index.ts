// TypeLang compiler and language tools public API

// Lexer & Tokens
export { Lexer } from './lexer';
export type { Token, TokenType } from './lexer';

// Parser & AST
export { Parser } from './parser';
export * as AST from './ast';
export type {
  Program,
  Statement,
  Expr,
  TypeAST,
  TypeParam,
  GADTConstructor,
} from './ast';

// Type Checker & Semantic Types
export { TypeChecker, createInitialEnv } from './checker';
export type { TypeEnv, ScopeSymbol } from './checker';
export * from './types';

// Evaluator & Runtime
export { Evaluator, createInitialRuntimeEnv } from './evaluator';
export type { RuntimeEnv, EvaluationResult } from './evaluator';

// Multi-file Workspace
export { ProjectWorkspace, NodeSystemHost } from './workspace';
export type { SystemHost } from './workspace';

// LSP & Language Intelligence
export {
  getHoverInformation,
  getCompletionInformation,
  getDefinitionLocation,
  getWordAtPosition,
  findMatchingSymbol,
  resolveReferenceSymbol,
  inspectSymbolByName,
  inspectTypeAtPosition,
  getAllSymbolsFromTypeEnv,
} from './lsp';
export type {
  CompletionItem,
  HoverResult,
  TypeInspectionResult,
  DefinitionLocation,
} from './lsp';

// Diagnostics
export {
  formatAriadneDiagnostic,
  createDiagnosticFromError,
  enrichDiagnostics,
  lineColToOffset,
} from './diagnostics';
export { Formatter } from './formatter';

// Documentation & Stdlib metadata
export {
  STDLIB_MODULES,
  getRootBuiltinDoc,
  getStdLibModuleDoc,
  getStdLibMemberDoc,
} from './stdlibDocs';
export type { StdLibFunctionDoc, StdLibModuleDoc } from './stdlibDocs';
export {
  parseDocComment,
  getParameterDoc,
  renderDocComment,
  formatDocComment,
} from './docComments';
export type { DocTag, ParsedDocComment } from './docComments';

// Code Generation & Exhaustive Test Suites
export { LLVMIRGenerator } from './codegen_llvm';
export { CCodeGenerator } from './codegen_c';
export { JSCodeGenerator } from './codegen_js';
export { LLVMGenerator } from './codegen';
export {
  CODEGEN_TEST_CASES,
  runCodegenTestSuite,
} from './tests_codegen';
export type {
  CodegenTestCase,
  CodegenTestResult,
  CodegenSuiteSummary,
} from './tests_codegen';

