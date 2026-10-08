import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  DidChangeConfigurationNotification,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationParams,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  Hover,
  MarkupKind,
} from 'vscode-languageserver/node.js';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  Lexer,
  Parser,
  TypeChecker,
  getHoverInformation,
  getCompletionItems,
  configureLSP,
} from '@typelang/lang';
import type { HoverResult, CompletionItemData } from '@typelang/lang';

import { ProjectWorkspace, NodeSystemHost } from '@typelang/lang';

const workspace = new ProjectWorkspace(new NodeSystemHost());

// Create a connection for the server using Node IPC
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// Configure LSP with docs URL from environment
const docsBaseUrl = process.env.TYPELANG_DOCS_URL || 'http://localhost:3000/docs';
configureLSP({ docsBaseUrl });

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {
  const capabilities = params.capabilities;

  hasConfigurationCapability = !!(
    capabilities.general && (capabilities.general as any).configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  return {
    capabilities: {
      textDocumentSync: 1, // Full sync
      hoverProvider: true,
      completionProvider: {
        resolveProvider: false,
        triggerCharacters: ['.'],
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

connection.onDidChangeConfiguration((change: DidChangeConfigurationParams) => {
  // Re-validate all open text documents
  documents.all().forEach(validateTextDocument);
});

// When a text document is opened or its content changes
documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const text = textDocument.getText();
  const diagnostics: Diagnostic[] = [];

  try {
    // Lex and parse
    // const lexer = new Lexer(text);
    // const tokens = lexer.tokenize();
    // const parser = new Parser(tokens);
    // const ast = parser.parseProgram();

    // // Type check
    // const checker = new TypeChecker();
    // checker.checkProgram(ast);

    const filetargetraw = textDocument.uri
    console.log('filetargetraw:', filetargetraw)
    const filetarget = filetargetraw.substring('file://'.length)
    console.log('filetarget:', filetarget)
    workspace.checkFile(filetarget);

    console.log(workspace)
    // Collect diagnostics from checker
    if (workspace.diagnostics && workspace.diagnostics.length > 0) {
      for (const diag of workspace.diagnostics) {
        diagnostics.push({
          severity: diag.severity === 'error' ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning,
          range: {
            start: { line: diag.line - 1, character: diag.col - 1 },
            end: { line: (diag.endLine || diag.line) - 1, character: (diag.endCol || diag.col + 1) - 1 },
          },
          message: diag.message,
          source: 'typelang',
        });
      }
    }
  } catch (err: any) {
    // Handle parse errors
    if (err.loc) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: {
          start: { line: err.loc.line - 1, character: err.loc.col - 1 },
          end: { line: err.loc.line - 1, character: err.loc.col },
        },
        message: err.message || 'Parse error',
        source: 'typelang',
      });
    } else {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
        message: err.message || 'Unknown error',
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
    const target = params.textDocument.uri.slice('file://'.length);
    console.log('onHover: target:', target)
    const env = workspace.checkFile(target);
    console.log('symbolCache', workspace.symbolCache);
    console.log('workspace', workspace);
    const symbols = workspace.symbolCache.get(target) || [];
    const program = workspace.fileAstCache.get(target);
    const info = getHoverInformation(program!, env!, symbols, text, line, col);
    if (!info) return null;

    // Convert HoverResult to LSP Hover with proper markdown formatting
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: info.contents.join('\n\n'),
      },
    };
  } catch (err: any) {
    return null;
  }
});

// Completion support
connection.onCompletion((params: TextDocumentPositionParams): CompletionItem[] => {
  const document = documents.get(params.textDocument.uri);
  if (!document) return [];

  const text = document.getText();
  const line = params.position.line + 1;
  const col = params.position.character + 1;

  try {
    const items = getCompletionItems(text, line, col);
    return items.map((item: CompletionItemData) => ({
      label: item.label,
      kind: mapCompletionKind(item.kind),
      detail: item.detail,
      documentation: item.documentation,
      insertText: item.insertText || item.label,
      sortText: item.sortText || item.label,
    }));
  } catch (err) {
    // Return a whimsical cat with helpful message when code is incomplete
    return [
      {
        label: '🐱 Code needs some TLC...',
        kind: CompletionItemKind.Text,
        detail: 'Incomplete syntax detected',
        documentation: `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ∧_∧                          ┃
┃ ( ･ω･)  Looks like something  ┃
┃ ⊃✏️ ⊂  is missing or broken!  ┃
┃                               ┃
┃  Don't worry, fix the syntax  ┃
┃  and your completions will    ┃
┃  purr back to life! 💜         ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`,
        insertText: '',
        sortText: 'zzz_incomplete',
      },
    ];
  }
});

/**
 * Map completion item kind from our domain model to LSP CompletionItemKind
 */
function mapCompletionKind(
  kind: 'Keyword' | 'Function' | 'Variable' | 'Type' | 'Module' | 'Constructor' | 'Snippet'
): CompletionItemKind {
  const kindMap: Record<string, CompletionItemKind> = {
    'Keyword': CompletionItemKind.Keyword,
    'Function': CompletionItemKind.Function,
    'Variable': CompletionItemKind.Variable,
    'Type': CompletionItemKind.Class,
    'Module': CompletionItemKind.Module,
    'Constructor': CompletionItemKind.Constructor,
    'Snippet': CompletionItemKind.Snippet,
  };
  return kindMap[kind] || CompletionItemKind.Text;
}

// Text document management
documents.listen(connection);

// Listen on the connection
connection.listen();
