import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  DidChangeConfigurationNotification,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationParams,
  CompletionItem as LSPCompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  Hover,
  MarkupKind,
  Location,
} from 'vscode-languageserver/node.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  Lexer,
  Parser,
  TypeChecker,
  ProjectWorkspace,
  NodeSystemHost,
  getHoverInformation,
  getCompletionInformation,
  getDefinitionLocation,
} from '@typelang/lang';
import type {
  CompletionItem as TLCompletionItem,
  HoverResult,
  DefinitionLocation,
} from '@typelang/lang';

// Initialize Node host & multi-file workspace for TypeLang
const systemHost = new NodeSystemHost();
const workspace = new ProjectWorkspace(systemHost);

// Create a connection for the server using Node IPC
const connection = createConnection(ProposedFeatures.all);

// Create a text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  hasConfigurationCapability = !!(
    capabilities.general && (capabilities.general as any).configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );

  return {
    capabilities: {
      textDocumentSync: 1, // Full sync
      hoverProvider: true,
      definitionProvider: true,
      completionProvider: {
        resolveProvider: false,
        triggerCharacters: ['.', '{', ':', '<', '"'],
      },
    },
  };
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
});

connection.onDidChangeConfiguration((_change: DidChangeConfigurationParams) => {
  // Re-validate all open text documents
  documents.all().forEach(validateTextDocument);
});

// When a text document is opened or its content changes
documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

// Clean up cached files and overlays when documents close
documents.onDidClose((event) => {
  const filePath = uriToFilePath(event.document.uri);
  systemHost.removeOverlay(filePath);
  workspace.invalidateFile(filePath);
  connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

/**
 * Normalizes document URI to a file path
 */
function uriToFilePath(uri: string): string {
  if (uri.startsWith('file://')) {
    try {
      return decodeURIComponent(uri.slice('file://'.length));
    } catch {
      return uri.slice('file://'.length);
    }
  }
  return uri;
}

/**
 * Validates TypeLang document and publishes diagnostics
 */
async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  const filePath = uriToFilePath(textDocument.uri);
  const diagnostics: Diagnostic[] = [];

  try {
    // Keep in-memory workspace buffer up-to-date with unsaved changes
    systemHost.setOverlay(filePath, text);
    workspace.invalidateFile(filePath);

    // Multi-file workspace checking
    workspace.checkFile(filePath);

    // Collect diagnostics from workspace for this file
    const fileDiags = workspace.diagnostics.filter(
      (d: any) => !d.file || d.file === filePath
    );

    if (fileDiags.length > 0) {
      for (const diag of fileDiags) {
        diagnostics.push({
          severity:
            diag.severity === 'warning'
              ? DiagnosticSeverity.Warning
              : diag.severity === 'info'
              ? DiagnosticSeverity.Information
              : DiagnosticSeverity.Error,
          range: {
            start: {
              line: Math.max(0, diag.line - 1),
              character: Math.max(0, diag.col - 1),
            },
            end: {
              line: Math.max(0, (diag.endLine || diag.line) - 1),
              character: Math.max(0, (diag.endCol || diag.col + 1) - 1),
            },
          },
          message: diag.message,
          source: 'typelang',
        });
      }
    } else {
      // Validate standalone file syntax and semantics
      const lexer = new Lexer(text);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parseProgram();

      const checker = new TypeChecker();
      checker.checkProgram(ast);

      for (const diag of checker.diagnostics) {
        diagnostics.push({
          severity:
            diag.severity === 'warning'
              ? DiagnosticSeverity.Warning
              : diag.severity === 'info'
              ? DiagnosticSeverity.Information
              : DiagnosticSeverity.Error,
          range: {
            start: {
              line: Math.max(0, diag.line - 1),
              character: Math.max(0, diag.col - 1),
            },
            end: {
              line: Math.max(0, (diag.endLine || diag.line) - 1),
              character: Math.max(0, (diag.endCol || diag.col + 1) - 1),
            },
          },
          message: diag.message,
          source: 'typelang',
        });
      }
    }
  } catch (err: any) {
    if (err && err.loc) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: {
            line: Math.max(0, err.loc.line - 1),
            character: Math.max(0, err.loc.col - 1),
          },
          end: {
            line: Math.max(0, (err.loc.endLine || err.loc.line) - 1),
            character: Math.max(0, (err.loc.endCol || err.loc.col + 1) - 1),
          },
        },
        message: err.message || 'Syntax error',
        source: 'typelang',
      });
    } else {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: { line: 0, character: 0 },
          end: { line: 0, character: 1 },
        },
        message: err?.message || 'Unexpected compiler error',
        source: 'typelang',
      });
    }
  }

  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// Hover support
connection.onHover((params: TextDocumentPositionParams): Hover | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return null;

  const text = document.getText();
  const line = params.position.line + 1;
  const col = params.position.character + 1;

  try {
    const info: HoverResult | null = getHoverInformation(text, line, col);
    if (!info || !info.contents || info.contents.length === 0) return null;

    // Deduplicate and filter empty content strings
    const seen = new Set<string>();
    const uniqueContents: string[] = [];
    for (const item of info.contents) {
      const trimmed = (item || '').trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        uniqueContents.push(trimmed);
      }
    }

    if (uniqueContents.length === 0) return null;

    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: uniqueContents.join('\n\n'),
      },
    };
  } catch {
    return null;
  }
});

// Go-to-Definition support
connection.onDefinition(
  (params: TextDocumentPositionParams): Location | null => {
    const document = documents.get(params.textDocument.uri);
    if (!document) return null;

    const text = document.getText();
    const line = params.position.line + 1;
    const col = params.position.character + 1;

    try {
      const defLoc: DefinitionLocation | null = getDefinitionLocation(
        text,
        line,
        col
      );
      if (!defLoc) return null;

      return {
        uri: params.textDocument.uri,
        range: {
          start: {
            line: Math.max(0, defLoc.line - 1),
            character: Math.max(0, defLoc.col - 1),
          },
          end: {
            line: Math.max(0, (defLoc.endLine || defLoc.line) - 1),
            character: Math.max(0, (defLoc.endCol || defLoc.col) - 1),
          },
        },
      };
    } catch {
      return null;
    }
  }
);

// Autocompletion support
connection.onCompletion(
  (params: TextDocumentPositionParams): LSPCompletionItem[] => {
    const document = documents.get(params.textDocument.uri);
    if (!document) return [];

    const text = document.getText();
    const line = params.position.line + 1;
    const col = params.position.character + 1;

    try {
      const items: TLCompletionItem[] = getCompletionInformation(
        text,
        line,
        col
      );
      if (items && items.length > 0) {
        return items.map((item) => ({
          label: item.label,
          kind: mapCompletionKind(item.kind),
          detail: item.detail,
          documentation: item.documentation,
          insertText: item.insertText || item.label,
          sortText: item.sortText,
          filterText: item.filterText,
        }));
      }
    } catch {
      // Incomplete syntax fallback
    }

    return [];
  }
);

/**
 * Map TypeLang completion item kinds to LSP CompletionItemKind
 */
function mapCompletionKind(
  kind?: string
): CompletionItemKind {
  switch (kind) {
    case 'function':
      return CompletionItemKind.Function;
    case 'method':
      return CompletionItemKind.Method;
    case 'variable':
      return CompletionItemKind.Variable;
    case 'type':
      return CompletionItemKind.Class;
    case 'module':
      return CompletionItemKind.Module;
    case 'constructor':
      return CompletionItemKind.Constructor;
    case 'snippet':
      return CompletionItemKind.Snippet;
    case 'keyword':
      return CompletionItemKind.Keyword;
    case 'property':
      return CompletionItemKind.Property;
    case 'constant':
      return CompletionItemKind.Constant;
    default:
      return CompletionItemKind.Text;
  }
}

// Text document management
documents.listen(connection);

// Listen on the connection
connection.listen();
