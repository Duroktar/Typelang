import React, { useMemo } from 'react';

interface AnsiRendererProps {
  text: string;
  className?: string;
  onCopy?: () => void;
  showCopyButton?: boolean;
}

interface TextSegment {
  text: string;
  color?: string;
  bold?: boolean;
  dim?: boolean;
  underline?: boolean;
}

const COLOR_CLASS_MAP: Record<string, string> = {
  red: 'text-rose-400',
  brightRed: 'text-red-400 font-bold',
  yellow: 'text-amber-300',
  brightYellow: 'text-yellow-300 font-semibold',
  green: 'text-emerald-400',
  brightGreen: 'text-emerald-300 font-semibold',
  blue: 'text-sky-400',
  brightBlue: 'text-blue-400 font-semibold',
  magenta: 'text-fuchsia-400',
  brightMagenta: 'text-pink-400 font-semibold',
  cyan: 'text-cyan-400',
  brightCyan: 'text-teal-300 font-semibold',
  white: 'text-slate-100',
  brightWhite: 'text-white font-semibold',
  gray: 'text-slate-500',
  dim: 'text-slate-500',
};

/**
 * Parses ANSI escape sequences into structured segments for React rendering.
 */
function parseAnsi(rawText: string): TextSegment[] {
  if (!rawText) return [];

  const regex = /\u001b\[([0-9;]*)m/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  let currentColor: string | undefined = undefined;
  let currentBold = false;
  let currentDim = false;
  let currentUnderline = false;

  const segments: TextSegment[] = [];

  while ((match = regex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: rawText.slice(lastIndex, match.index),
        color: currentColor,
        bold: currentBold,
        dim: currentDim,
        underline: currentUnderline,
      });
    }

    const codeStr = match[1];
    if (!codeStr || codeStr === '0') {
      currentColor = undefined;
      currentBold = false;
      currentDim = false;
      currentUnderline = false;
    } else {
      const codes = codeStr.split(';').map(Number);
      for (const code of codes) {
        if (code === 0) {
          currentColor = undefined;
          currentBold = false;
          currentDim = false;
          currentUnderline = false;
        } else if (code === 1) {
          currentBold = true;
        } else if (code === 2) {
          currentDim = true;
        } else if (code === 4) {
          currentUnderline = true;
        } else if (code === 31) {
          currentColor = 'red';
        } else if (code === 32) {
          currentColor = 'green';
        } else if (code === 33) {
          currentColor = 'yellow';
        } else if (code === 34) {
          currentColor = 'blue';
        } else if (code === 35) {
          currentColor = 'magenta';
        } else if (code === 36) {
          currentColor = 'cyan';
        } else if (code === 37) {
          currentColor = 'white';
        } else if (code === 90) {
          currentColor = 'gray';
        } else if (code === 91) {
          currentColor = 'brightRed';
        } else if (code === 92) {
          currentColor = 'brightGreen';
        } else if (code === 93) {
          currentColor = 'brightYellow';
        } else if (code === 94) {
          currentColor = 'brightBlue';
        } else if (code === 95) {
          currentColor = 'brightMagenta';
        } else if (code === 96) {
          currentColor = 'brightCyan';
        } else if (code === 97) {
          currentColor = 'brightWhite';
        }
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < rawText.length) {
    segments.push({
      text: rawText.slice(lastIndex),
      color: currentColor,
      bold: currentBold,
      dim: currentDim,
      underline: currentUnderline,
    });
  }

  return segments;
}

export const AnsiRenderer: React.FC<AnsiRendererProps> = ({
  text,
  className = '',
  onCopy,
  showCopyButton = false,
}) => {
  const segments = useMemo(() => parseAnsi(text), [text]);

  const plainText = useMemo(() => {
    return text.replace(/\u001b\[[0-9;]*m/g, '');
  }, [text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(plainText);
    if (onCopy) onCopy();
  };

  return (
    <div className="relative group">
      {showCopyButton && (
        <button
          onClick={handleCopy}
          title="Copy formatted diagnostic"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] rounded border border-slate-700 flex items-center space-x-1"
        >
          <span>Copy</span>
        </button>
      )}
      <pre
        className={`font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre select-text ${className}`}
      >
        {segments.map((seg, idx) => {
          let classes = '';
          if (seg.color && COLOR_CLASS_MAP[seg.color]) {
            classes += ` ${COLOR_CLASS_MAP[seg.color]}`;
          } else if (seg.dim) {
            classes += ' text-slate-500';
          } else {
            classes += ' text-slate-200';
          }

          if (seg.bold && !classes.includes('font-bold') && !classes.includes('font-semibold')) {
            classes += ' font-bold';
          }
          if (seg.underline) {
            classes += ' underline decoration-slate-500';
          }

          return (
            <span key={idx} className={classes.trim()}>
              {seg.text}
            </span>
          );
        })}
      </pre>
    </div>
  );
};
