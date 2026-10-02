import { createDiagnostic, mkStringWriter, AriadneColor, AriadneLabel } from './ariadne';
import { Diagnostic, QuickFix, DiagnosticLabel } from './types';

/**
 * Calculates character byte/character offset from line and column (1-indexed).
 */
export function lineColToOffset(code: string, line: number, col: number): number {
  if (!code) return 0;
  const lines = code.split('\n');
  let offset = 0;
  const targetLineIdx = Math.max(0, line - 1);
  for (let i = 0; i < Math.min(targetLineIdx, lines.length); i++) {
    offset += lines[i].length + 1; // +1 for newline
  }
  const lineStr = lines[targetLineIdx] || '';
  const colOffset = Math.max(0, Math.min(col - 1, lineStr.length));
  return offset + colOffset;
}

/**
 * Format a diagnostic using ariadne-ts into rich terminal and plain text reports.
 */
export function formatAriadneDiagnostic(
  diag: Diagnostic,
  code: string,
  filename: string = 'main.tl'
): { ariadneReport: string; ariadneReportPlain: string } {
  try {
    const src = code && code.trim().length > 0 ? code : ' ';
    const allLines = src.split('\n');
    const startOffset = lineColToOffset(src, diag.line, diag.col);
    const endLine = diag.endLine || diag.line;
    const endCol = diag.endCol || (diag.col + 1);
    let endOffset = lineColToOffset(src, endLine, endCol);
    if (endOffset <= startOffset) {
      endOffset = startOffset + 1;
    }

    const kindMap: Record<Diagnostic['severity'], 'Error' | 'Warning' | 'Advice'> = {
      error: 'Error',
      warning: 'Warning',
      info: 'Advice'
    };

    const labelColor: AriadneColor = diag.severity === 'warning' ? 'yellow' : 'red';
    const categoryCode = diag.category
      ? diag.category.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8)
      : 'ERR';

    // Build labels list
    const ariadneLabels: AriadneLabel[] = [];

    if (diag.labels && diag.labels.length > 0) {
      // Use explicitly provided labels
      diag.labels.forEach((lbl, idx) => {
        const sOff = lineColToOffset(src, lbl.line, lbl.col);
        const eOff = lineColToOffset(src, lbl.endLine || lbl.line, lbl.endCol || (lbl.col + 1));
        ariadneLabels.push({
          range: { start: sOff, end: Math.max(sOff + 1, eOff) },
          fstring: lbl.message || diag.message,
          message: lbl.message || diag.message,
          color: (lbl.color as AriadneColor) || (lbl.style === 'secondary' ? 'cyan' : labelColor),
          style: lbl.style || (idx === 0 ? 'primary' : 'secondary')
        });
      });
    } else {
      // Primary label for the main error position
      let primaryMessage = diag.message;
      if (diag.category === 'Type Unification') {
        primaryMessage = diag.message.replace(/^Type mismatch:\s*/i, '');
        const periodIdx = primaryMessage.indexOf('. ');
        if (periodIdx > 0 && periodIdx < 65) {
          primaryMessage = primaryMessage.substring(0, periodIdx);
        }
      } else if (diag.category === 'Undefined Symbol') {
        if (diag.message.includes("In 'do' notation: 'flatMap'")) {
          primaryMessage = "missing 'flatMap' definition required for 'do' notation";
        } else if (diag.message.includes("In 'do' notation: 'pure'")) {
          primaryMessage = "missing 'pure' definition required for 'do' notation";
        } else if (diag.message.includes("In 'do(")) {
          primaryMessage = "monad does not provide method required for 'do' notation";
        } else {
          primaryMessage = 'not found in this scope';
        }
      } else if (diag.category === 'Immutability Violation') {
        primaryMessage = 'cannot mutate immutable variable';
      }

      ariadneLabels.push({
        range: { start: startOffset, end: endOffset },
        fstring: primaryMessage,
        message: primaryMessage,
        color: labelColor,
        style: 'primary'
      });

      // Secondary label synthesis for rich context
      const currLineText = allLines[diag.line - 1] || '';

      if (diag.category === 'Immutability Violation') {
        const varMatch = diag.message.match(/variable '([^']+)'/i);
        const varName = varMatch ? varMatch[1] : null;
        if (varName) {
          for (let i = diag.line - 2; i >= 0; i--) {
            const line = allLines[i];
            const declMatch = line.match(new RegExp(`\\blet\\s+(${varName})\\b`));
            if (declMatch && declMatch.index !== undefined) {
              const declCol = declMatch.index + (declMatch[0].length - varName.length) + 1;
              const declStart = lineColToOffset(src, i + 1, declCol);
              const declEnd = declStart + varName.length;
              ariadneLabels.push({
                range: { start: declStart, end: declEnd },
                fstring: `variable first declared as immutable here`,
                message: `variable first declared as immutable here`,
                color: 'cyan',
                style: 'secondary'
              });
              break;
            }
          }
        }
      } else if (diag.category === 'Type Unification') {
        // Check if there is an operator in the line (e.g. `count + text`)
        const opMatch = currLineText.match(/([a-zA-Z0-9_]+)\s*(\+|\-|\*|\/|==|!=|<|>)\s*([a-zA-Z0-9_]+)/);
        if (opMatch && opMatch.index !== undefined) {
          const leftName = opMatch[1];
          const rightName = opMatch[3];
          const leftCol = opMatch.index + 1;
          const leftStart = lineColToOffset(src, diag.line, leftCol);
          const leftEnd = leftStart + leftName.length;

          const rightCol = opMatch.index + 1 + opMatch[0].lastIndexOf(rightName);
          const rightStart = lineColToOffset(src, diag.line, rightCol);
          const rightEnd = rightStart + rightName.length;

          // Replace coarse expression label with fine-grained dual operand labels
          ariadneLabels.length = 0;
          const unifyMatch = diag.message.match(/cannot unify '([^']+)' with '([^']+)'/i);
          const typeA = unifyMatch ? unifyMatch[1] : null;
          const typeB = unifyMatch ? unifyMatch[2] : null;

          ariadneLabels.push({
            range: { start: rightStart, end: rightEnd },
            fstring: typeA ? `this expression has type '${typeA}'` : `unexpected operand type`,
            message: typeA ? `this expression has type '${typeA}'` : `unexpected operand type`,
            color: labelColor,
            style: 'primary'
          });

          ariadneLabels.push({
            range: { start: leftStart, end: leftEnd },
            fstring: typeB ? `expected '${typeB}' to match this operand` : `expected matching operand type`,
            message: typeB ? `expected '${typeB}' to match this operand` : `expected matching operand type`,
            color: 'cyan',
            style: 'secondary'
          });
        } else if (/\breturn\b/.test(currLineText)) {
          for (let i = diag.line - 2; i >= 0; i--) {
            const line = allLines[i];
            const fnMatch = line.match(/\bfunction\s+([a-zA-Z0-9_]+)(?:<[^>]+>)?\s*\([^)]*\)\s*:\s*([a-zA-Z0-9_<>[\] ,]+)\s*\{/);
            if (fnMatch && fnMatch.index !== undefined) {
              const retTypeStr = fnMatch[2].trim();
              const typeCol = line.lastIndexOf(retTypeStr) + 1;
              const typeStart = lineColToOffset(src, i + 1, typeCol);
              const typeEnd = typeStart + retTypeStr.length;
              ariadneLabels.push({
                range: { start: typeStart, end: typeEnd },
                fstring: `expected '${retTypeStr}' because of function return type`,
                message: `expected '${retTypeStr}' because of function return type`,
                color: 'cyan',
                style: 'secondary'
              });
              break;
            }
          }
        }
      }
    }

    const colorWriter = mkStringWriter();
    createDiagnostic({
      filename,
      message: diag.message,
      type: kindMap[diag.severity] || 'Error',
      code: categoryCode,
      offset: startOffset,
      labels: ariadneLabels,
      note: diag.quickFixes && diag.quickFixes.length > 0
        ? `Suggestion: ${diag.quickFixes[0].title}`
        : undefined,
      source: { type: 'string', data: src },
      writer: colorWriter,
      withColor: true
    });
    const ariadneReport = colorWriter.unwrap();

    const plainWriter = mkStringWriter();
    createDiagnostic({
      filename,
      message: diag.message,
      type: kindMap[diag.severity] || 'Error',
      code: categoryCode,
      offset: startOffset,
      labels: ariadneLabels,
      note: diag.quickFixes && diag.quickFixes.length > 0
        ? `Suggestion: ${diag.quickFixes[0].title}`
        : undefined,
      source: { type: 'string', data: src },
      writer: plainWriter,
      withColor: false
    });
    const ariadneReportPlain = plainWriter.unwrap();

    return { ariadneReport, ariadneReportPlain };
  } catch (e) {
    const fallback = `[${diag.severity.toUpperCase()}] ${diag.message} at line ${diag.line}, col ${diag.col}`;
    return { ariadneReport: fallback, ariadneReportPlain: fallback };
  }
}

/**
 * Diagnostic Enricher:
 * Extends raw compiler diagnostics with Ariadne-ts reports, code snippets, caret line markers,
 * error categorization, and actionable quick-fix suggestions.
 */
export function createDiagnosticFromError(err: any, code: string): Diagnostic {
  const message = err?.message || String(err) || 'Compilation Error';

  // 1. Check if error has structured location attached
  if (err?.loc && typeof err.loc === 'object') {
    return {
      severity: 'error',
      message,
      line: err.loc.line || 1,
      col: err.loc.col || 1,
      endLine: err.loc.endLine || err.loc.line || 1,
      endCol: err.loc.endCol || (err.loc.col ? err.loc.col + 1 : 1),
      category: 'Syntax Error'
    };
  }

  // 2. Parse from message e.g. "at line 3, col 5" or "line 3, column 5" or "starting at line 3, col 5"
  const lineMatch = message.match(/(?:at\s+line|starting\s+at\s+line|line)\s+(\d+)(?:,\s*(?:col|column)\s*(\d+))?/i);
  if (lineMatch) {
    const line = parseInt(lineMatch[1], 10);
    const col = lineMatch[2] ? parseInt(lineMatch[2], 10) : 1;
    return {
      severity: 'error',
      message,
      line,
      col,
      endLine: line,
      endCol: col + 5,
      category: 'Syntax Error'
    };
  }

  return {
    severity: 'error',
    message,
    line: 1,
    col: 1,
    endLine: 1,
    endCol: 1,
    category: 'General'
  };
}

export function enrichDiagnostics(rawDiagnostics: Diagnostic[], code: string, filename: string = 'main.tl'): Diagnostic[] {
  const lines = code.split('\n');

  return rawDiagnostics.map(diag => {
    const lineIndex = Math.max(0, diag.line - 1);
    const lineText = lines[lineIndex] || '';
    const colIndex = Math.max(1, diag.col);

    // Build visual caret marker matching exact token span (e.g. "   ^~~~~~" or "   ^")
    const leadingSpaces = ' '.repeat(Math.max(0, colIndex - 1));
    const spanLen = diag.endCol && diag.endCol > colIndex ? Math.max(1, diag.endCol - colIndex) : 1;
    const markerSymbols = spanLen > 1 ? '^' + '~'.repeat(spanLen - 1) : '^';
    const caretMarker = diag.caretMarker || `${leadingSpaces}${markerSymbols}`;

    // Categorize error and generate contextual quick fixes
    const category = diag.category || categorizeError(diag.message);
    const generatedFixes = generateQuickFixes(diag.message, lineText, diag.line, category, lines);
    const quickFixes = diag.quickFixes && diag.quickFixes.length > 0
      ? [...diag.quickFixes, ...generatedFixes.filter(gf => !diag.quickFixes!.some(f => f.title === gf.title))]
      : generatedFixes;

    const baseDiag: Diagnostic = {
      ...diag,
      codeSnippet: diag.codeSnippet || lineText,
      caretMarker,
      category,
      quickFixes
    };

    const { ariadneReport, ariadneReportPlain } = formatAriadneDiagnostic(baseDiag, code, filename);

    return {
      ...baseDiag,
      ariadneReport,
      ariadneReportPlain
    };
  });
}

function categorizeError(message: string): Diagnostic['category'] {
  const lower = message.toLowerCase();

  if (lower.includes('cannot unify') || lower.includes('type mismatch') || lower.includes('expected type')) {
    return 'Type Unification';
  }
  if (lower.includes('undefined variable') || lower.includes('unknown symbol') || lower.includes('not found')) {
    return 'Undefined Symbol';
  }
  if (lower.includes('non-exhaustive') || lower.includes('missing match arm') || lower.includes('unhandled constructor')) {
    return 'Missing Arm';
  }
  if (lower.includes('immutable') || lower.includes('cannot mutate') || lower.includes('readonly')) {
    return 'Immutability Violation';
  }
  if (lower.includes('unexpected token') || lower.includes('syntax error') || lower.includes('expected')) {
    return 'Syntax Error';
  }

  return 'General';
}

function generateQuickFixes(
  message: string,
  lineText: string,
  lineNum: number,
  category: Diagnostic['category'],
  allLines: string[] = []
): QuickFix[] {
  const fixes: QuickFix[] = [];
  const lowerMsg = message.toLowerCase();
  const indent = lineText.match(/^(\s*)/)?.[1] || '';

  // 1. Type Mismatch Quick Fixes
  if (category === 'Type Unification') {
    if (lowerMsg.includes("cannot unify 'number' with 'string'")) {
      // Actual is number, Expected is string
      fixes.push({
        title: '💡 Wrap expression with to_string(...)',
        actionKind: 'wrap_expression',
        targetLine: lineNum,
        replacementText: lineText.replace(/(=|\+|-|\*|\/|,|\()\s*([a-zA-Z0-9_".]+)/, '$1 to_string($2)')
      });
    } else if (lowerMsg.includes("cannot unify 'string' with 'number'")) {
      // Actual is string, Expected is number
      fixes.push({
        title: '💡 Wrap parameter with parse_int(...)',
        actionKind: 'wrap_expression',
        targetLine: lineNum,
        replacementText: lineText.replace(/(=|\+|-|\*|\/|,|\()\s*([a-zA-Z0-9_".]+)/, '$1 parse_int($2)')
      });
    } else if (lowerMsg.includes("expected algebraic data type") || lowerMsg.includes("wrap value with constructor")) {
      const match = message.match(/constructor '([^']+)'/i);
      const ctor = match ? match[1] : 'Some';
      fixes.push({
        title: `💡 Wrap value with ${ctor}(...)`,
        actionKind: 'wrap_expression',
        targetLine: lineNum,
        replacementText: lineText.replace(/(=|<-|\+|-|\*|\/|,|\()\s*([a-zA-Z0-9_".]+)/, `$1 ${ctor}($2)`)
      });
    }
  }

  // 2. Do Notation Specific Quick Fixes
  if (lowerMsg.includes("'flatmap' function is not defined") || (lowerMsg.includes("flatmap") && lowerMsg.includes("do"))) {
    fixes.push({
      title: "💡 Define Option flatMap helper",
      actionKind: 'add_let',
      targetLine: 1,
      replacementText: `function flatMap<a, b>(opt: Option<a>, f: (x: a) => Option<b>): Option<b> {\n  match (opt) {\n    Some(v) => f(v)\n    None => None\n  }\n}\n\n`
    });
  }

  if (lowerMsg.includes("'pure' function is not defined") || (lowerMsg.includes("pure") && lowerMsg.includes("do"))) {
    fixes.push({
      title: "💡 Define Option pure helper",
      actionKind: 'add_let',
      targetLine: 1,
      replacementText: `function pure<a>(val: a): Option<a> {\n  Some(val)\n}\n\n`
    });
  }

  if (lineText.includes('<-') && (lowerMsg.includes("monadic bind '<-'") || lowerMsg.includes("did you mean to use 'let"))) {
    fixes.push({
      title: "💡 Replace monadic '<-' with 'let = '",
      actionKind: 'replace_line',
      targetLine: lineNum,
      replacementText: lineText.replace(/([a-zA-Z0-9_]+)\s*<-\s*/, 'let $1 = ')
    });
  }

  // 3. Missing Match Arm Quick Fixes
  if (category === 'Missing Arm' || lowerMsg.includes('match')) {
    fixes.push({
      title: '💡 Insert wildcard match arm (_ => ...)',
      actionKind: 'insert_arm',
      targetLine: lineNum,
      replacementText: `${lineText}\n${indent}  _ => "Guest"`
    });
  }

  // 4. Undefined Symbol Quick Fixes
  if (category === 'Undefined Symbol') {
    const varMatch = message.match(/undefined variable '([^']+)'/i) || message.match(/symbol '([^']+)'/i);
    if (varMatch && varMatch[1] && varMatch[1] !== 'flatMap' && varMatch[1] !== 'pure') {
      const varName = varMatch[1];
      fixes.push({
        title: `💡 Declare variable 'let ${varName} = ...'`,
        actionKind: 'add_let',
        targetLine: lineNum,
        replacementText: `${indent}let ${varName} = 0\n${lineText}`
      });
    }
  }

  // 5. Immutability Violation Quick Fixes
  if (category === 'Immutability Violation') {
    const varMatch = message.match(/variable '([^']+)'/i);
    const varName = varMatch ? varMatch[1] : null;
    let targetDeclLine = lineNum;
    let targetDeclText = lineText;

    if (varName && allLines.length > 0) {
      for (let i = lineNum - 1; i >= 0; i--) {
        const line = allLines[i];
        if (line && new RegExp(`\\blet\\s+${varName}\\b`).test(line)) {
          targetDeclLine = i + 1;
          targetDeclText = line;
          break;
        }
      }
    }

    fixes.push({
      title: `💡 Mark '${varName || 'variable'}' as mutable (let mut)`,
      actionKind: 'replace_line',
      targetLine: targetDeclLine,
      replacementText: targetDeclText.replace(/\blet\b/, 'let mut ')
    });
  }

  return fixes;
}
