import React, { useRef, useEffect, useState, useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Diagnostic, QuickFix } from '../lang/types';
import { ProjectFile } from '../types/project';
import {
  Sparkles,
  Info,
  Code2,
  AlertCircle,
  Plus,
  FileCode,
  X,
  Edit3,
  Trash2,
  Play,
  Square,
  Crosshair,
  Layers,
  ArrowRight,
  Maximize2,
  Minimize2,
  Settings2,
  WrapText,
  Sliders,
  Columns
} from 'lucide-react';
import { getHoverInformation, inspectTypeAtPosition, getWordAtPosition, TypeInspectionResult, getCompletionInformation, getDefinitionLocation } from '../lang/lsp';

// Module-level tracking for Monaco registrations to avoid duplicate providers and listeners across re-mounts
let isTypeLangRegistered = false;
let hoverProviderDisposable: { dispose: () => void } | null = null;
let completionProviderDisposable: { dispose: () => void } | null = null;
let codeActionProviderDisposable: { dispose: () => void } | null = null;
let definitionProviderDisposable: { dispose: () => void } | null = null;

interface CodeEditorProps {
  files: ProjectFile[];
  activeFileId: string;
  onFileSelect: (id: string) => void;
  onFileAdd: () => void;
  onFileDelete: (id: string) => void;
  onFileRename: (id: string) => void;
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onStop?: () => void;
  isRunning?: boolean;
  onFormat?: () => void;
  onApplyQuickFix?: (fix: QuickFix) => void;
  diagnostics: Diagnostic[];
  onCursorChange?: (pos: { line: number; col: number; word?: string }) => void;
  onOpenTypeExplorer?: () => void;
  splitPct?: number;
  onSetSplitPct?: (pct: number) => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  onOpenVSCodeModal?: () => void;
  currentExampleName?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  files,
  activeFileId,
  onFileSelect,
  onFileAdd,
  onFileDelete,
  onFileRename,
  code,
  onChange,
  onRun,
  onStop,
  isRunning = false,
  onFormat,
  onApplyQuickFix,
  diagnostics,
  onCursorChange,
  onOpenTypeExplorer,
  splitPct = 60,
  onSetSplitPct,
  isMaximized = false,
  onToggleMaximize,
  onOpenVSCodeModal,
  currentExampleName
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const filesRef = useRef(files);
  filesRef.current = files;
  const activeFileIdRef = useRef(activeFileId);
  activeFileIdRef.current = activeFileId;
  const onFileSelectRef = useRef(onFileSelect);
  onFileSelectRef.current = onFileSelect;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [useFallbackTextarea, setUseFallbackTextarea] = useState<boolean>(false);

  // Editor Display & Large Screen Customization Preferences
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('typelang_editor_font_size');
    return saved ? parseInt(saved, 10) || 14 : 14;
  });
  const [showMinimap, setShowMinimap] = useState<boolean>(() => {
    return localStorage.getItem('typelang_editor_minimap') === 'true';
  });
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>(() => {
    return (localStorage.getItem('typelang_editor_wordwrap') as 'on' | 'off') || 'off';
  });
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);

  const handleFontSizeChange = (delta: number) => {
    const nextSize = Math.min(24, Math.max(11, fontSize + delta));
    setFontSize(nextSize);
    localStorage.setItem('typelang_editor_font_size', nextSize.toString());
  };

  const handleToggleMinimap = () => {
    const next = !showMinimap;
    setShowMinimap(next);
    localStorage.setItem('typelang_editor_minimap', next ? 'true' : 'false');
  };

  const handleToggleWordWrap = () => {
    const next = wordWrap === 'on' ? 'off' : 'on';
    setWordWrap(next);
    localStorage.setItem('typelang_editor_wordwrap', next);
  };

  // Quick mobile type inspector preview popup
  const [mobileHoverResult, setMobileHoverResult] = useState<TypeInspectionResult | null>(null);
  const [mobileHoverColorized, setMobileHoverColorized] = useState<{ snippet: string; html: string } | null>(null);
  const mobileHoverTimeoutRef = useRef<any>(null);
  const mobileHoverSnippet = mobileHoverResult
    ? mobileHoverResult.category === 'keyword'
      ? mobileHoverResult.symbol
      : mobileHoverResult.signature || mobileHoverResult.typeString
    : '';

  useEffect(() => {
    const colorize = monacoRef.current?.editor?.colorize;
    if (!mobileHoverSnippet || !colorize || useFallbackTextarea) return;

    let isCurrent = true;
    void colorize(mobileHoverSnippet, 'typelang', { theme: 'typelang-dark' })
      .then((html: string) => {
        if (isCurrent) setMobileHoverColorized({ snippet: mobileHoverSnippet, html });
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [mobileHoverSnippet, useFallbackTextarea]);

  const diagnosticsRef = useRef<Diagnostic[]>(diagnostics);
  diagnosticsRef.current = diagnostics;
  const onApplyQuickFixRef = useRef(onApplyQuickFix);
  onApplyQuickFixRef.current = onApplyQuickFix;

  // Clean up global Monaco providers on unmount to prevent duplicate hover/completion entries
  useEffect(() => {
    return () => {
      if (hoverProviderDisposable) {
        hoverProviderDisposable.dispose();
        hoverProviderDisposable = null;
      }
      if (completionProviderDisposable) {
        completionProviderDisposable.dispose();
        completionProviderDisposable = null;
      }
      if (codeActionProviderDisposable) {
        codeActionProviderDisposable.dispose();
        codeActionProviderDisposable = null;
      }
      if (definitionProviderDisposable) {
        definitionProviderDisposable.dispose();
        definitionProviderDisposable = null;
      }
    };
  }, []);

  const handleCursorMoved = useCallback((line: number, col: number) => {
    const word = getWordAtPosition(code, line, col) || undefined;
    if (onCursorChange) {
      onCursorChange({ line, col, word });
    }
  }, [code, onCursorChange]);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const sortFilesByDependencies = (fileList: ProjectFile[]) => {
      const graph = new Map<string, string[]>();
      const moduleToFile = new Map<string, string>();
      
      for (const f of fileList) {
        const modMatch = f.content.match(/module\s+([A-Za-z_][A-Za-z0-9_]*)/g);
        if (modMatch) {
          for (const m of modMatch) {
            const modName = m.replace('module', '').trim();
            moduleToFile.set(modName, f.id);
          }
        }
      }
      
      for (const f of fileList) {
        const deps = new Set<string>();
        const importMatch = f.content.match(/import\s+([A-Za-z_][A-Za-z0-9_]*)/g);
        if (importMatch) {
          for (const imp of importMatch) {
            const modName = imp.replace('import', '').trim();
            if (moduleToFile.has(modName) && moduleToFile.get(modName) !== f.id) {
              deps.add(moduleToFile.get(modName)!);
            }
          }
        }
        graph.set(f.id, Array.from(deps));
      }
      
      const result: ProjectFile[] = [];
      const visited = new Set<string>();
      const visiting = new Set<string>();
      
      const visit = (f: ProjectFile) => {
        if (visited.has(f.id)) return;
        if (visiting.has(f.id)) return;
        visiting.add(f.id);
        
        const deps = graph.get(f.id) || [];
        for (const depId of deps) {
          const depFile = fileList.find(x => x.id === depId);
          if (depFile) {
            visit(depFile);
          }
        }
        
        visiting.delete(f.id);
        visited.add(f.id);
        result.push(f);
      };
      
      for (const f of fileList) {
        visit(f);
      }
      
      return result;
    };

    const getVirtualWorkspace = (modelValue: string) => {
      const currentFiles = sortFilesByDependencies(filesRef.current);
      if (currentFiles.length === 0) {
        return { combinedSource: '', offsetLine: 0, map: [] };
      }
      if (currentFiles.length === 1) {
        return { 
          combinedSource: modelValue, 
          offsetLine: 0,
          map: [{
            fileId: currentFiles[0].id,
            filename: currentFiles[0].name,
            startLine: 1,
            endLine: modelValue.split('\n').length,
            content: modelValue
          }]
        };
      }

      let combinedSource = '';
      let currentLine = 1;
      let offsetLine = 0;
      const map: { fileId: string; filename: string; startLine: number; endLine: number; content: string }[] = [];

      currentFiles.forEach((f, index) => {
        const header = `// File: ${f.name}\n`;
        const isTarget = f.id === activeFileIdRef.current;
        const content = isTarget ? modelValue : f.content;
        
        if (isTarget) {
          offsetLine = currentLine;
        }
        
        const fileLines = content.split('\n').length;
        const startLine = currentLine + 1; // Code starts after header line
        const endLine = startLine + fileLines - 1;
        
        map.push({
          fileId: f.id,
          filename: f.name,
          startLine,
          endLine,
          content
        });

        combinedSource += header + content;
        if (index < currentFiles.length - 1) {
          combinedSource += '\n\n';
          currentLine = endLine + 2;
        }
      });
      
      return { combinedSource, offsetLine, map };
    };

    // Dispose any previously registered providers to prevent duplicate hover/completion/action entries
    if (hoverProviderDisposable) {
      hoverProviderDisposable.dispose();
      hoverProviderDisposable = null;
    }
    if (completionProviderDisposable) {
      completionProviderDisposable.dispose();
      completionProviderDisposable = null;
    }
    if (codeActionProviderDisposable) {
      codeActionProviderDisposable.dispose();
      codeActionProviderDisposable = null;
    }
    if (definitionProviderDisposable) {
      definitionProviderDisposable.dispose();
      definitionProviderDisposable = null;
    }

    // Register TypeLang language only once globally
    const existingLangs = monaco.languages.getLanguages();
    if (!existingLangs.some((l: any) => l.id === 'typelang')) {
      monaco.languages.register({ id: 'typelang' });
    }

    if (!isTypeLangRegistered) {
      isTypeLangRegistered = true;

      monaco.languages.setLanguageConfiguration('typelang', {
      comments: {
        lineComment: '//',
        blockComment: ['/*', '*/']
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: '`', close: '`' }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
        { open: '`', close: '`' }
      ]
    });

    monaco.languages.setMonarchTokensProvider('typelang', {
      keywords: [
        'module', 'export', 'import', 'extern', 'as', 'type', 'function', 'fn',
        'match', 'if', 'else', 'then', 'mut', 'let', 'self',
        'for', 'while', 'switch', 'case', 'default', 'in', 'break', 'continue',
        'return', 'do', 'where', 'pure', 'pack', 'unpack'
      ],
      booleans: ['true', 'false'],
      typeKeywords: [
        'number', 'boolean', 'string', 'void', 'any', 'never', 'unknown',
        'Option', 'Result', 'List', 'Array', 'Map', 'Set', 'Promise'
      ],
      operators: [
        '=', '=>', '->', '<-', '==', '!=', '<=', '>=', '<', '>',
        '&&', '||', '+', '-', '*', '/', '%', '!', '?', ':',
        '...', '..=', '..', '+=', '-=', '*=', '/=', '|'
      ],
      tokenizer: {
        root: [
          // Whitespace & comments
          { include: '@whitespace' },

          // Numbers: hex, binary, scientific notation floats, integers
          [/0[xX][0-9a-fA-F]+/, 'number.hex'],
          [/0[bB][01]+/, 'number.binary'],
          [/\d+(\.\d+)?([eE][+-]?\d+)?/, 'number'],

          // Strings
          [/"([^"\\]|\\.)*"/, 'string'],
          [/'([^'\\]|\\.)*'/, 'string'],
          [/`([^`\\]|\\.)*`/, 'string'],

          // Monadic and arrow operators
          [/<-/, 'operator.bind'],
          [/=>/, 'operator.arrow'],
          [/->/, 'operator.arrow'],
          [/\.\.(=)?/, 'operator.range'],
          [/\.\.\./, 'operator.spread'],

          // Identifiers and keywords
          [/[a-zA-Z_][a-zA-Z0-9_]*/, {
            cases: {
              '@keywords': 'keyword',
              '@booleans': 'constant.language',
              '@typeKeywords': 'type',
              '^[A-Z][a-zA-Z0-9_]*$': 'type.identifier',
              '@default': 'identifier'
            }
          }],

          // Delimiters & Brackets
          [/[{}()\[\]]/, '@brackets'],
          [/[,:;]/, 'delimiter'],

          // Other operators
          [/[=><!~?:&|+\-*\/\^%]+/, {
            cases: {
              '@operators': 'operator',
              '@default': 'operator'
            }
          }]
        ],
        whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/\/\/.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment']
        ],
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ]
      }
    });

    monaco.editor.defineTheme('typelang-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'constant.language', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'typeKeywords', foreground: '4EC9B0' },
        { token: 'type.identifier', foreground: '4FC1FF', fontStyle: 'bold' },
        { token: 'identifier', foreground: '9CDCFE' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'number.hex', foreground: 'B5CEA8' },
        { token: 'number.binary', foreground: 'B5CEA8' },
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'operator', foreground: 'D4D4D4' },
        { token: 'operator.bind', foreground: 'F43F5E', fontStyle: 'bold' },
        { token: 'operator.arrow', foreground: 'D2A8FF', fontStyle: 'bold' },
        { token: 'operator.range', foreground: 'D4D4D4' },
        { token: 'operator.spread', foreground: 'D4D4D4' },
        { token: 'delimiter', foreground: '94A3B8' }
      ],
      colors: {
        'editor.background': '#0f172a', // slate-900
        'editor.foreground': '#f8fafc',
        'editor.lineHighlightBackground': '#1e293b',
        'editorLineNumber.foreground': '#475569',
        'editorCursor.foreground': '#38bdf8',
        'editor.selectionBackground': '#33415580',
        'editorBracketMatch.background': '#334155',
        'editorBracketMatch.border': '#38bdf8'
      }
    });
    }

    monaco.editor.setTheme('typelang-dark');

    definitionProviderDisposable = monaco.languages.registerDefinitionProvider('typelang', {
      provideDefinition: (model: any, position: any) => {
        const docCode = model.getValue();
        const workspace = getVirtualWorkspace(docCode);
        const defLoc = getDefinitionLocation(workspace.combinedSource, position.lineNumber + workspace.offsetLine, position.column);
        if (!defLoc) return null;
        
        const targetFile = workspace.map.find(m => defLoc.line >= m.startLine && defLoc.line <= m.endLine);
        if (!targetFile) return null;
        
        if (targetFile.fileId === activeFileIdRef.current) {
          const localLine = defLoc.line - targetFile.startLine + 1;
          const localEndLine = (defLoc.endLine || defLoc.line) - targetFile.startLine + 1;
          return {
            uri: model.uri,
            range: {
              startLineNumber: localLine,
              startColumn: defLoc.col,
              endLineNumber: localEndLine,
              endColumn: defLoc.endCol || defLoc.col
            }
          };
        } else {
          onFileSelectRef.current(targetFile.fileId);
          
          const localLine = defLoc.line - targetFile.startLine + 1;
          
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.revealPositionInCenter({ lineNumber: localLine, column: defLoc.col });
              editorRef.current.setPosition({ lineNumber: localLine, column: defLoc.col });
              editorRef.current.focus();
            }
          }, 80);
          return null;
        }
      }
    });

    hoverProviderDisposable = monaco.languages.registerHoverProvider('typelang', {
      provideHover: (model: any, position: any) => {
        const docCode = model.getValue();
        const workspace = getVirtualWorkspace(docCode);
        const hover = getHoverInformation(workspace.combinedSource, position.lineNumber + workspace.offsetLine, position.column);
        if (!hover || !hover.contents || hover.contents.length === 0) return null;

        // Deduplicate contents and eliminate redundant entries
        const seen = new Set<string>();
        const uniqueContents: string[] = [];
        for (const item of hover.contents) {
          const trimmed = (item || '').trim();
          if (trimmed && !seen.has(trimmed)) {
            seen.add(trimmed);
            uniqueContents.push(trimmed);
          }
        }

        if (uniqueContents.length === 0) return null;

        const word = model.getWordAtPosition(position);
        const range = word ? {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        } : undefined;

        // In Monaco, multiple elements in the contents array are separated by horizontal rules (<hr>).
        // Combining into a single markdown value creates a single unified card without divider lines.
        return {
          range,
          contents: [{ value: uniqueContents.join('\n\n') }]
        };
      }
    });

    completionProviderDisposable = monaco.languages.registerCompletionItemProvider('typelang', {
      triggerCharacters: ['.', '{', ' ', ',', ':', '<', '"'],
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const docCode = model.getValue();
        const workspace = getVirtualWorkspace(docCode);
        const dynamicCompletions = getCompletionInformation(workspace.combinedSource, position.lineNumber + workspace.offsetLine, position.column);

        const mapKind = (kind?: string) => {
          switch (kind) {
            case 'function': return monaco.languages.CompletionItemKind.Function;
            case 'method': return monaco.languages.CompletionItemKind.Method;
            case 'variable': return monaco.languages.CompletionItemKind.Variable;
            case 'type': return monaco.languages.CompletionItemKind.Class;
            case 'module': return monaco.languages.CompletionItemKind.Module;
            case 'keyword': return monaco.languages.CompletionItemKind.Keyword;
            case 'snippet': return monaco.languages.CompletionItemKind.Snippet;
            case 'constant': return monaco.languages.CompletionItemKind.Constant;
            case 'constructor': return monaco.languages.CompletionItemKind.Constructor;
            case 'property': return monaco.languages.CompletionItemKind.Property;
            default: return monaco.languages.CompletionItemKind.Text;
          }
        };

        let suggestions: any[] = [];

        if (dynamicCompletions && dynamicCompletions.length > 0) {
          suggestions = dynamicCompletions.map((item, index) => ({
            label: item.label,
            kind: mapKind(item.kind),
            detail: item.detail,
            documentation: item.documentation ? {
              value: item.documentation,
              isTrusted: true
            } : undefined,
            insertText: item.insertText ?? item.label,
            insertTextRules: item.isSnippet
              ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
              : undefined,
            filterText: item.filterText,
            range,
            sortText: item.sortText || String(index).padStart(4, '0')
          }));
        } else {
          suggestions = [
          {
            label: 'do',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'do {\n  ${1:x} <- ${2:computation};\n  pure ${3:result};\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Monadic do-notation block with bind statements and pure return',
            range
          },
          {
            label: 'where',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'where {\n  let ${1:helper} = ${2:value};\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Scoped auxiliary bindings and helper functions',
            range
          },
          {
            label: 'pure',
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: 'pure ${1:value}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Lifts a pure value into the current monad',
            range
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'function ${1:name}<${2:T}>(${3:param}: ${2:T}): ${4:void} {\n  $0\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define a generic polymorphic function',
            range
          },
          {
            label: 'type (GADT)',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'type ${1:Expr}<a> =\n  | ${2:Lit}(value: number): ${1:Expr}<number>\n  | ${3:Bool}(value: boolean): ${1:Expr}<boolean>\n  | ${4:Add}(left: ${1:Expr}<number>, right: ${1:Expr}<number>): ${1:Expr}<number>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Declare a Generalized Algebraic Data Type (GADT)',
            range
          },
          {
            label: 'match',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'match (${1:expr}) {\n  ${2:Pattern} => ${3:result}\n  ... => ${4:fallback}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Exhaustive pattern match expression',
            range
          },
          {
            label: 'switch',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'switch (${1:expr}) {\n  case ${2:value} => ${3:result};\n  default => ${4:fallback};\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Multi-branch switch statement',
            range
          },
          {
            label: 'module',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'module ${1:ModuleName} {\n  export function ${2:doWork}(): ${3:void} {\n    $0\n  }\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Define a named module namespace with exports',
            range
          },
          {
            label: 'extern function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'extern function ${1:name}(${2:param}: ${3:string}): ${4:void};',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Declare a foreign JavaScript function interface binding',
            range
          }
        ];
        }
        return { suggestions };
      }
    });

    codeActionProviderDisposable = monaco.languages.registerCodeActionProvider('typelang', {
      provideCodeActions: (model: any, range: any) => {
        const actions: any[] = [];
        const currentDiags = diagnosticsRef.current;
        for (const diag of currentDiags) {
          const diagLine = diag.line || 1;
          if (diagLine >= range.startLineNumber && diagLine <= range.endLineNumber && diag.quickFixes) {
            for (const fix of diag.quickFixes) {
              actions.push({
                title: fix.title,
                kind: 'quickfix',
                isPreferred: true,
                apply: () => {
                  if (onApplyQuickFixRef.current) {
                    onApplyQuickFixRef.current(fix);
                  }
                }
              });
            }
          }
        }
        return { actions, dispose: () => {} };
      }
    });

    // Listen to cursor position changes to update Type Explorer
    editor.onDidChangeCursorPosition((e: any) => {
      if (e && e.position) {
        handleCursorMoved(e.position.lineNumber, e.position.column);
      }
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });

    if (onFormat) {
      editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
        onFormat();
      });
    }
  };

  /**
   * Triggers a hover action at the current cursor position.
   * Useful for mobile touchscreens or keyboard shortcuts.
   */
  const handleTriggerHoverAtCursor = () => {
    let line = 1;
    let col = 1;

    if (!useFallbackTextarea && editorRef.current) {
      const position = editorRef.current.getPosition();
      if (position) {
        line = position.lineNumber;
        col = position.column;
      }
      editorRef.current.focus();
      // Execute Monaco's native Show Hover action
      try {
        editorRef.current.getAction('editor.action.showHover')?.run();
      } catch (err) {
        console.warn('Monaco hover action error', err);
      }
    } else if (textareaRef.current) {
      const start = textareaRef.current.selectionStart || 0;
      const textUpToCursor = code.substring(0, start);
      const linesArray = textUpToCursor.split('\n');
      line = linesArray.length;
      col = linesArray[linesArray.length - 1].length + 1;
    }

    // Inspect the type at this position
    const inspected = inspectTypeAtPosition(code, line, col);
    if (inspected) {
      setMobileHoverResult(inspected);
      if (mobileHoverTimeoutRef.current) {
        clearTimeout(mobileHoverTimeoutRef.current);
      }
      mobileHoverTimeoutRef.current = setTimeout(() => {
        setMobileHoverResult(null);
      }, 7000);
    }

    if (onCursorChange) {
      const word = getWordAtPosition(code, line, col) || undefined;
      onCursorChange({ line, col, word });
    }
  };

  useEffect(() => {
    if (!monacoRef.current || !editorRef.current) return;
    const monaco = monacoRef.current;
    const model = editorRef.current.getModel();
    if (!model) return;

    const activeDiags = diagnostics.filter(d => !d.fileId || d.fileId === activeFileId);
    const markers = activeDiags.map(d => {
      const startLine = Math.max(1, d.line || 1);
      const startCol = Math.max(1, d.col || 1);
      const endLine = Math.max(startLine, d.endLine || startLine);
      const endCol = Math.max(startCol + 1, d.endCol || startCol + 1);
      return {
        startLineNumber: startLine,
        startColumn: startCol,
        endLineNumber: endLine,
        endColumn: endCol,
        message: d.message,
        severity: d.severity === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning
      };
    });
    monaco.editor.setModelMarkers(model, 'typelang', markers);
  }, [diagnostics, activeFileId]);

  const linesCount = code.split('\n').length;

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 border-r border-slate-800">
      {/* File Tabs Bar */}
      <div className="flex bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar scroll-smooth">
        {files.map(file => (
          <div
            key={file.id}
            onClick={() => onFileSelect(file.id)}
            className={`group relative flex items-center min-w-[120px] max-w-[200px] h-10 px-3 cursor-pointer transition-all border-r border-slate-800/50 ${
              activeFileId === file.id 
                ? 'bg-slate-900 text-indigo-400 border-b-2 border-b-indigo-500 shadow-[inset_0_-2px_10px_rgba(99,102,241,0.05)]' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/40'
            }`}
          >
            <FileCode className={`w-3.5 h-3.5 mr-2 shrink-0 ${activeFileId === file.id ? 'text-indigo-400' : 'text-slate-600'}`} />
            <span className="text-[11px] font-bold truncate flex-1 tracking-tight">
              {file.name}
            </span>
            
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
              <button 
                onClick={(e) => { e.stopPropagation(); onFileRename(file.id); }}
                className="p-1 hover:text-white rounded-md transition-colors"
                title="Rename File"
              >
                <Edit3 className="w-3 h-3" />
              </button>
              {files.length > 1 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onFileDelete(file.id); }}
                  className="p-1 hover:text-rose-400 rounded-md transition-colors"
                  title="Delete File"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          onClick={onFileAdd}
          className="flex items-center justify-center w-10 h-10 text-slate-500 hover:text-indigo-400 hover:bg-slate-900/60 transition-all border-r border-slate-800/50"
          title="Add New File"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Controls & Layout Customization Bar */}
      <div className="bg-slate-900/70 px-3 sm:px-4 py-1.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {currentExampleName && (
            <div 
              className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold shrink-0"
              title={`Active Loaded Example: ${currentExampleName}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate max-w-[180px] sm:max-w-[260px] font-bold">{currentExampleName}</span>
            </div>
          )}

          <button
            onClick={() => setUseFallbackTextarea(!useFallbackTextarea)}
            className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase tracking-wider transition border border-slate-700 cursor-pointer"
          >
            {useFallbackTextarea ? '⚡ Light' : '🎨 Monaco'}
          </button>

          {/* Hover / Type Inspector Trigger Button */}
          <button
            onClick={handleTriggerHoverAtCursor}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/30 transition cursor-pointer text-[11px] font-semibold active:scale-95 shadow-sm"
            title="Inspect Type at Cursor (Hover Trigger for Mobile & Desktop)"
          >
            <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
            <span>Inspect</span>
          </button>

          {/* Large Screen / Laptop Width Split Presets */}
          {onSetSplitPct && (
            <div className="hidden md:flex items-center space-x-1 pl-1 border-l border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-0.5">Width:</span>
              {[
                { label: '50%', val: 50 },
                { label: '60%', val: 60 },
                { label: '75%', val: 75 },
                { label: '90%', val: 90 },
              ].map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    if (isMaximized && onToggleMaximize) {
                      onToggleMaximize();
                    }
                    onSetSplitPct(preset.val);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition cursor-pointer active:scale-95 ${
                    Math.abs(splitPct - preset.val) < 3 && !isMaximized
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                  title={`Set Editor split to ${preset.label}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}

          {/* Font Size Adjusters */}
          <div className="hidden sm:flex items-center space-x-1 pl-1 border-l border-slate-800">
            <button
              onClick={() => handleFontSizeChange(-1)}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition border border-slate-700/60"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-[10px] font-mono text-slate-400 min-w-[20px] text-center">{fontSize}px</span>
            <button
              onClick={() => handleFontSizeChange(1)}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold transition border border-slate-700/60"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Word Wrap & Minimap Toggles */}
          <div className="hidden xl:flex items-center space-x-1 pl-1 border-l border-slate-800">
            <button
              onClick={handleToggleWordWrap}
              className={`p-1 rounded text-[10px] transition border cursor-pointer ${
                wordWrap === 'on'
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800/80 text-slate-500 border-slate-700/50 hover:text-slate-300'
              }`}
              title={`Word Wrap: ${wordWrap === 'on' ? 'ON' : 'OFF'}`}
            >
              <WrapText className="w-3 h-3" />
            </button>
            <button
              onClick={handleToggleMinimap}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition border cursor-pointer ${
                showMinimap
                  ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800/80 text-slate-500 border-slate-700/50 hover:text-slate-300'
              }`}
              title={`Minimap: ${showMinimap ? 'ON' : 'OFF'}`}
            >
              Map
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-2.5">
          <button
            onClick={onRun}
            className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg border border-emerald-500/20 transition-all text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow-sm"
            title="Run Active TypeLang Program (Ctrl+Enter)"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run</span>
          </button>

          <button
            onClick={onStop}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border transition-all text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow-sm ${
              isRunning
                ? 'bg-rose-600/30 hover:bg-rose-600/40 text-rose-300 border-rose-500/50 animate-pulse'
                : 'bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-300 text-slate-400 border-slate-700/80'
            }`}
            title="Stop Running Code & Terminate All Loops/Audio (Escape)"
          >
            <Square className="w-3 h-3 fill-current text-rose-400" />
            <span>Stop</span>
          </button>

          {onFormat && (
            <button
              onClick={onFormat}
              className="flex items-center space-x-1 px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/20 transition-all text-[11px] font-bold uppercase tracking-wider cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Format</span>
            </button>
          )}

          {onOpenVSCodeModal && (
            <button
              onClick={onOpenVSCodeModal}
              className="hidden md:flex items-center space-x-1 px-2 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 rounded-lg border border-sky-500/20 transition-all text-[11px] font-bold uppercase tracking-wider cursor-pointer"
              title="Export VS Code Grammar (typelang.tmLanguage.json)"
            >
              <FileCode className="w-3 h-3 text-sky-400" />
              <span className="hidden lg:inline">VS Code</span>
            </button>
          )}

          {/* Maximize / Fullscreen Editor Mode Toggle */}
          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className={`hidden md:flex items-center space-x-1 px-2 py-1 rounded-lg border transition-all text-[11px] font-bold uppercase tracking-wider cursor-pointer ${
                isMaximized
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 border-slate-700/80'
              }`}
              title={isMaximized ? 'Restore Split View' : 'Maximize Editor (Focus Mode)'}
            >
              {isMaximized ? (
                <>
                  <Minimize2 className="w-3 h-3" />
                  <span className="hidden lg:inline">Split</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3" />
                  <span className="hidden lg:inline">Max</span>
                </>
              )}
            </button>
          )}

          <span className="text-[11px] text-slate-500 hidden sm:inline font-mono">⌘+Enter</span>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="flex-1 min-h-[300px] relative overflow-hidden flex">
        {useFallbackTextarea ? (
          <div className="flex-1 flex bg-slate-950 font-mono text-xs overflow-auto">
            <div className="py-3 px-2 bg-slate-950 border-r border-slate-800 text-slate-600 select-none text-right font-mono text-xs min-w-[36px]">
              {Array.from({ length: Math.max(1, linesCount) }, (_, i) => (
                <div key={i + 1} className="leading-5">{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={e => onChange(e.target.value)}
              onSelect={e => {
                const target = e.target as HTMLTextAreaElement;
                const start = target.selectionStart || 0;
                const textUpToCursor = code.substring(0, start);
                const linesArray = textUpToCursor.split('\n');
                const line = linesArray.length;
                const col = linesArray[linesArray.length - 1].length + 1;
                handleCursorMoved(line, col);
              }}
              style={{ fontSize: `${fontSize}px` }}
              className="flex-1 p-3 bg-slate-900 text-slate-100 font-mono leading-5 focus:outline-none resize-none"
              spellCheck={false}
            />
          </div>
        ) : (
          <Editor
            height="100%"
            language="typelang"
            theme="typelang-dark"
            value={code}
            onChange={val => onChange(val || '')}
            onMount={handleEditorDidMount}
            options={{
              fontSize: fontSize,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              minimap: { enabled: showMinimap },
              wordWrap: wordWrap,
              scrollBeyondLastLine: false,
              padding: { top: 12, bottom: 12 },
              automaticLayout: true,
              tabSize: 2,
              lineNumbersMinChars: 3,
              quickSuggestions: {
                other: true,
                comments: false,
                strings: false
              },
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: 'on',
              tabCompletion: 'on'
            }}
          />
        )}

        {/* Mobile Quick Type Hover Overlay Card */}
        {mobileHoverResult && (
          <div className="absolute bottom-4 left-4 right-4 z-40 bg-slate-950/95 backdrop-blur-md p-3.5 rounded-xl border border-indigo-500/40 shadow-2xl space-y-2 text-xs animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-amber-300 text-sm">
                  {mobileHoverResult.symbol}
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {mobileHoverResult.category}
                </span>
              </div>
              <button
                onClick={() => setMobileHoverResult(null)}
                className="p-1 text-slate-400 hover:text-white rounded-md transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <pre className="bg-slate-900 p-2 rounded-md border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre">
              {!useFallbackTextarea && mobileHoverColorized?.snippet === mobileHoverSnippet
                ? <code dangerouslySetInnerHTML={{ __html: mobileHoverColorized.html }} />
                : mobileHoverSnippet}
            </pre>

            {onOpenTypeExplorer && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    setMobileHoverResult(null);
                    onOpenTypeExplorer();
                  }}
                  className="flex items-center space-x-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
                >
                  <span>Open in Type Explorer</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


