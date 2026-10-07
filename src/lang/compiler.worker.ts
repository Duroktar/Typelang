// Web Worker for offloading TypeLang compilation, typechecking, evaluation, and code generation
import { Lexer } from './lexer';
import { Parser } from './parser';
import { TypeChecker } from './checker';
import { Evaluator } from './evaluator';
import { LLVMGenerator } from './codegen';
import { enrichDiagnostics, createDiagnosticFromError } from './diagnostics';
import { formatTypeLangCode } from './formatter';
import { Diagnostic } from './types';

export interface WorkerRequest {
  id: string;
  action: 'typecheck' | 'eval' | 'format';
  combinedSource?: string;
  mapEntries?: { fileId: string; filename: string; startLine: number; endLine: number; content: string }[];
  code?: string;
}

export interface WorkerResponse {
  id: string;
  action: 'typecheck' | 'eval' | 'format';
  success: boolean;
  ast?: any;
  diagnostics?: Diagnostic[];
  stdout?: string[];
  executionTimeMs?: number | null;
  llvmCode?: string;
  jsCode?: string;
  nodeCode?: string;
  cCode?: string;
  cppCode?: string;
  formattedCode?: string;
  error?: string;
}

const processDiagnostics = (rawDiagnostics: Diagnostic[], combinedSource: string, mapEntries: { fileId: string; filename: string; startLine: number; endLine: number; content: string }[]) => {
  if (!mapEntries || mapEntries.length === 0) {
    return enrichDiagnostics(rawDiagnostics, combinedSource, 'main.tl');
  }

  return rawDiagnostics.map(diag => {
    const entry = mapEntries.find(e => diag.line >= e.startLine && diag.line <= e.endLine) || mapEntries[0];
    const lineOffset = entry ? entry.startLine - 1 : 0;
    const mappedLine = Math.max(1, diag.line - lineOffset);
    const mappedEndLine = diag.endLine ? Math.max(mappedLine, diag.endLine - lineOffset) : mappedLine;

    const fileDiag: Diagnostic = {
      ...diag,
      line: mappedLine,
      endLine: mappedEndLine,
      fileId: entry?.fileId,
      filename: entry?.filename
    };

    const fileContent = entry?.content || combinedSource;
    const filename = entry?.filename || 'main.tl';

    const enrichedList = enrichDiagnostics([fileDiag], fileContent, filename);
    return enrichedList[0] || fileDiag;
  });
};

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const req = e.data;
  if (!req || !req.id) return;

  try {
    if (req.action === 'format') {
      const formatted = formatTypeLangCode(req.code || '');
      const response: WorkerResponse = {
        id: req.id,
        action: 'format',
        success: true,
        formattedCode: formatted
      };
      self.postMessage(response);
      return;
    }

    const combinedSource = req.combinedSource || '';
    const mapEntries = req.mapEntries || [];

    const lexer = new Lexer(combinedSource);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parseProgram();

    const typeChecker = new TypeChecker();
    typeChecker.checkProgram(ast);
    const enrichedDiags = processDiagnostics(typeChecker.diagnostics, combinedSource, mapEntries);

    const codegen = new LLVMGenerator();
    const llvmCode = codegen.generateLLVM(ast);
    const jsCode = codegen.generateJS(ast);
    const nodeCode = codegen.generateNode(ast);
    const cCode = codegen.generateC(ast);
    const cppCode = codegen.generateCpp(ast);

    if (req.action === 'typecheck') {
      const response: WorkerResponse = {
        id: req.id,
        action: 'typecheck',
        success: true,
        ast,
        diagnostics: enrichedDiags,
        llvmCode,
        jsCode,
        nodeCode,
        cCode,
        cppCode
      };
      self.postMessage(response);
      return;
    }

    if (req.action === 'eval') {
      const typeErrors = typeChecker.diagnostics.filter(d => d.severity === 'error');
      if (typeErrors.length > 0) {
        const report = enrichedDiags[0]?.ariadneReport || enrichedDiags[0]?.ariadneReportPlain || typeErrors[0].message;
        const response: WorkerResponse = {
          id: req.id,
          action: 'eval',
          success: false,
          ast,
          diagnostics: enrichedDiags,
          stdout: [`❌ Type Check Failed: ${typeErrors.length} error(s) found.\n\n${report}`],
          llvmCode,
          jsCode,
          nodeCode,
          cCode,
          cppCode
        };
        self.postMessage(response);
        return;
      }

      const evaluator = new Evaluator();
      const evalResult = evaluator.evalProgram(ast);

      const response: WorkerResponse = {
        id: req.id,
        action: 'eval',
        success: true,
        ast,
        diagnostics: enrichedDiags,
        stdout: evalResult.stdout,
        executionTimeMs: evalResult.executionTimeMs,
        llvmCode,
        jsCode,
        nodeCode,
        cCode,
        cppCode
      };
      self.postMessage(response);
      return;
    }
  } catch (err: any) {
    const combinedSource = req.combinedSource || req.code || '';
    const mapEntries = req.mapEntries || [];
    const errorMessage = err.message || String(err);
    const diag = createDiagnosticFromError(err, combinedSource);
    const enriched = processDiagnostics([diag], combinedSource, mapEntries);
    const reportStr = enriched[0]?.ariadneReport || enriched[0]?.ariadneReportPlain || errorMessage;

    const response: WorkerResponse = {
      id: req.id,
      action: req.action,
      success: false,
      diagnostics: enriched,
      stdout: [`❌ Error:\n\n${reportStr}`],
      error: errorMessage
    };
    self.postMessage(response);
  }
};
