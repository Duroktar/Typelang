export interface AriadneWriter {
  write: (str: string) => void;
  write_char?: (ch: string) => void;
  unwrap?: () => string;
}

export function mkStringWriter(): AriadneWriter & { unwrap: () => string } {
  let buf = '';
  return {
    write: (str: string) => { buf += str; },
    write_char: (ch: string) => { buf += ch; },
    unwrap: () => buf,
  };
}

export type AriadneColor =
  | 'red'
  | 'yellow'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'magenta'
  | 'brightRed'
  | 'brightYellow'
  | 'brightBlue'
  | 'brightCyan'
  | 'brightGreen'
  | 'brightMagenta'
  | 'white'
  | 'gray'
  | 'dim'
  | string;

export interface AriadneLabel {
  range: { start: number; end: number };
  fstring?: string;
  message?: string;
  color?: AriadneColor;
  priority?: number;
  style?: 'primary' | 'secondary';
}

export interface AriadneDiagnosticOptions {
  filename: string;
  message: string;
  type: 'Error' | 'Warning' | 'Advice' | string;
  code?: string | number;
  offset: number;
  labels?: AriadneLabel[];
  note?: string;
  help?: string;
  source: { type: 'string'; data: string };
  writer: AriadneWriter;
  withColor?: boolean;
}

export const ANSI = {
  reset: '\u001b[0m',
  bold: '\u001b[1m',
  dim: '\u001b[2m',
  italic: '\u001b[3m',
  underline: '\u001b[4m',

  black: '\u001b[30m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
  white: '\u001b[37m',

  brightBlack: '\u001b[90m',
  brightRed: '\u001b[91m',
  brightGreen: '\u001b[92m',
  brightYellow: '\u001b[93m',
  brightBlue: '\u001b[94m',
  brightMagenta: '\u001b[95m',
  brightCyan: '\u001b[96m',
  brightWhite: '\u001b[97m',
};

const COLOR_MAP: Record<string, string> = {
  red: ANSI.brightRed,
  brightRed: ANSI.brightRed,
  yellow: ANSI.brightYellow,
  brightYellow: ANSI.brightYellow,
  blue: ANSI.brightBlue,
  brightBlue: ANSI.brightBlue,
  cyan: ANSI.brightCyan,
  brightCyan: ANSI.brightCyan,
  green: ANSI.brightGreen,
  brightGreen: ANSI.brightGreen,
  magenta: ANSI.brightMagenta,
  brightMagenta: ANSI.brightMagenta,
  white: ANSI.brightWhite,
  brightWhite: ANSI.brightWhite,
  gray: ANSI.brightBlack,
  dim: ANSI.dim,
};

export function colorize(text: string, color: AriadneColor | undefined, withColor: boolean): string {
  if (!withColor || !color) return text;
  const ansiCode = COLOR_MAP[color] || '';
  if (!ansiCode) return text;
  return `${ansiCode}${text}${ANSI.reset}`;
}

interface ResolvedLabel {
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
  message: string;
  color: AriadneColor;
  style: 'primary' | 'secondary';
  priority: number;
}

/**
 * Pure TypeScript, zero-dependency Ariadne-style diagnostic formatter with
 * full ANSI colors, multiple labeled spans, line gutters, and unicode box-drawing frames.
 */
export function createDiagnostic(opts: AriadneDiagnosticOptions): void {
  const {
    filename,
    message,
    type,
    code,
    offset,
    labels = [],
    note,
    help,
    source,
    writer,
    withColor = true
  } = opts;

  const src = source.data || '';
  const lines = src.split('\n');

  // Compute line and column from character offset (1-indexed)
  function offsetToLineCol(off: number): { line: number; col: number } {
    let curr = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineLen = lines[i].length + 1; // +1 for \n
      if (curr + lineLen > off || i === lines.length - 1) {
        return {
          line: i + 1,
          col: Math.max(1, off - curr + 1)
        };
      }
      curr += lineLen;
    }
    return { line: 1, col: 1 };
  }

  // 1. Resolve all labels
  const resolvedLabels: ResolvedLabel[] = [];

  if (labels.length === 0) {
    const primaryPos = offsetToLineCol(offset);
    resolvedLabels.push({
      startLine: primaryPos.line,
      startCol: primaryPos.col,
      endLine: primaryPos.line,
      endCol: primaryPos.col + 1,
      message,
      color: type === 'Warning' ? 'yellow' : 'red',
      style: 'primary',
      priority: 0
    });
  } else {
    labels.forEach((lbl, idx) => {
      const startLoc = offsetToLineCol(lbl.range.start);
      const endLoc = offsetToLineCol(lbl.range.end);
      let endCol = endLoc.col;
      if (endLoc.line === startLoc.line && endCol <= startLoc.col) {
        endCol = startLoc.col + 1;
      }
      const isPrimary = lbl.style ? lbl.style === 'primary' : idx === 0;
      const defaultColor: AriadneColor = isPrimary
        ? (type === 'Warning' ? 'yellow' : 'red')
        : 'cyan';

      resolvedLabels.push({
        startLine: startLoc.line,
        startCol: startLoc.col,
        endLine: endLoc.line,
        endCol,
        message: lbl.fstring || lbl.message || '',
        color: lbl.color || defaultColor,
        style: isPrimary ? 'primary' : 'secondary',
        priority: lbl.priority ?? (isPrimary ? 0 : 10 + idx)
      });
    });
  }

  // Primary label is used for header coordinates
  const primaryLabel = resolvedLabels.find(l => l.style === 'primary') || resolvedLabels[0];
  const primaryLine = primaryLabel.startLine;
  const primaryCol = primaryLabel.startCol;

  // 2. Header Line
  const typeName = type || 'Error';
  const typeColor: AriadneColor = typeName === 'Warning' ? 'yellow' : typeName === 'Advice' ? 'cyan' : 'red';
  const codeTag = code ? `[E${code}] ` : '';

  if (withColor) {
    const codeFormatted = code ? `${ANSI.dim}[E${code}]${ANSI.reset} ` : '';
    const typeFormatted = `${ANSI.bold}${colorize(typeName, typeColor, true)}${ANSI.reset}`;
    writer.write(`${codeFormatted}${typeFormatted}: ${ANSI.bold}${message}${ANSI.reset}\n`);
  } else {
    writer.write(`${codeTag}${typeName}: ${message}\n`);
  }

  // Determine line gutter width
  const allLines = resolvedLabels.map(l => l.startLine);
  const maxLineNum = Math.max(...allLines, 1);
  const gutterWidth = Math.max(2, String(maxLineNum).length);
  const gutterPad = ' '.repeat(gutterWidth);

  // 3. Box Header Frame: ╭─[filename:line:col]
  const colC = (s: string) => colorize(s, 'brightCyan', withColor);
  const colW = (s: string) => colorize(s, 'white', withColor);
  const colY = (s: string) => colorize(s, 'brightYellow', withColor);
  const colDim = (s: string) => colorize(s, 'dim', withColor);

  const posHeader = `   ${colC('╭─[')}${colW(filename)}${colC(':')}${colY(String(primaryLine))}${colC(':')}${colY(String(primaryCol))}${colC(']')}\n`;
  writer.write(posHeader);

  // 4. Group labels by line number
  const labelsByLine = new Map<number, ResolvedLabel[]>();
  for (const lbl of resolvedLabels) {
    const list = labelsByLine.get(lbl.startLine) || [];
    list.push(lbl);
    labelsByLine.set(lbl.startLine, list);
  }

  const sortedLineNums = Array.from(labelsByLine.keys()).sort((a, b) => a - b);

  sortedLineNums.forEach((lineNum, idx) => {
    if (idx > 0 && lineNum - sortedLineNums[idx - 1] > 1) {
      // Print fold separator
      writer.write(`   ${colC('·')}\n`);
    }

    const lineText = lines[lineNum - 1] || '';
    const lineNumPadded = String(lineNum).padStart(gutterWidth, ' ');
    const codeLine = `   ${colC('│')} ${colDim(lineNumPadded)} ${colC('│')} ${lineText}\n`;
    writer.write(codeLine);

    // Render carets and labels for this line
    const lineLabels = labelsByLine.get(lineNum)!;
    // Sort labels on line by column
    lineLabels.sort((a, b) => a.startCol - b.startCol);

    // Compute underline spans
    interface CaretSpan {
      startCol: number; // 0-indexed
      endCol: number;   // 0-indexed
      anchorCol: number;// 0-indexed
      pattern: string;
      label: ResolvedLabel;
    }

    const carets: CaretSpan[] = lineLabels.map(lbl => {
      const start = Math.max(0, lbl.startCol - 1);
      const end = Math.max(start + 1, lbl.endCol - 1);
      const len = Math.max(1, end - start);
      let pattern = '─'.repeat(len);
      if (len >= 3) {
        const mid = Math.floor(len / 2);
        pattern = '─'.repeat(mid) + '┬' + '─'.repeat(len - mid - 1);
      } else if (len === 2) {
        pattern = '┬─';
      } else {
        pattern = '┬';
      }
      const anchorCol = start + (len >= 3 ? Math.floor(len / 2) : 0);
      return { startCol: start, endCol: end, anchorCol, pattern, label: lbl };
    });

    // 4a. Caret Row
    // Build combined caret string with colors
    let caretRow = '';
    let currentPos = 0;

    for (const c of carets) {
      if (c.startCol > currentPos) {
        caretRow += ' '.repeat(c.startCol - currentPos);
        currentPos = c.startCol;
      }
      if (c.startCol >= currentPos) {
        const coloredPattern = colorize(c.pattern, c.label.color, withColor);
        caretRow += coloredPattern;
        currentPos = c.startCol + c.pattern.length;
      }
    }

    writer.write(`   ${colC('·')} ${gutterPad} ${colC('·')} ${caretRow}\n`);

    // 4b. Label Annotation Arrows
    // In Ariadne, when multiple labels are on the same line, arrows are drawn
    // from right-to-left, with vertical lines '│' maintaining connections for earlier labels.
    const sortedByAnchor = [...carets].sort((a, b) => a.anchorCol - b.anchorCol);

    for (let k = sortedByAnchor.length - 1; k >= 0; k--) {
      const active = sortedByAnchor[k];
      if (!active.label.message) continue;

      let arrowRow = '';
      let pos = 0;

      // Draw vertical bars for all labels to the left of active
      for (let j = 0; j < k; j++) {
        const preceding = sortedByAnchor[j];
        if (preceding.anchorCol > pos) {
          arrowRow += ' '.repeat(preceding.anchorCol - pos);
          pos = preceding.anchorCol;
        }
        arrowRow += colorize('│', preceding.label.color, withColor);
        pos += 1;
      }

      // Draw arrow and label message for active label
      if (active.anchorCol > pos) {
        arrowRow += ' '.repeat(active.anchorCol - pos);
        pos = active.anchorCol;
      }

      const arrowSymbol = colorize('╰──── ', active.label.color, withColor);
      const msgColored = colorize(active.label.message, active.label.color, withColor);
      arrowRow += `${arrowSymbol}${msgColored}`;

      writer.write(`   ${colC('·')} ${gutterPad} ${colC('·')} ${arrowRow}\n`);
    }
  });

  // 5. Note / Help footer if provided
  if (note) {
    writer.write(`   ${colC('·')}\n`);
    const notePrefix = colorize('Note:', 'brightGreen', withColor);
    writer.write(`   ${colC('·')} ${notePrefix} ${note}\n`);
  }

  if (help) {
    writer.write(`   ${colC('·')}\n`);
    const helpPrefix = colorize('Help:', 'brightYellow', withColor);
    writer.write(`   ${colC('·')} ${helpPrefix} ${help}\n`);
  }

  // 6. Box Footer Frame: ───╯
  writer.write(`${colC('───╯')}\n`);
}
