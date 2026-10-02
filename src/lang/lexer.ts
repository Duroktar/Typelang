// Lexer for TypeLang (Draft v0.1 Specification)
import { SourceLoc } from './ast';

export type TokenType =
  | 'KEYWORD'
  | 'IDENT'
  | 'NUMBER'
  | 'STRING'
  | 'BOOLEAN'
  | 'SYMBOL'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  loc: SourceLoc;
  docComment?: string;
}

const KEYWORDS = new Set([
  'module',
  'export',
  'import',
  'extern',
  'as',
  'type',
  'function',
  'fn',
  'match',
  'if',
  'return',
  'else',
  'then',
  'mut',
  'true',
  'false',
  'let',
  'self',
  'for',
  'while',
  'switch',
  'case',
  'default',
  'in',
  'break',
  'continue',
  'do',
  'where',
  'pure'
]);

export class Lexer {
  private input: string;
  private pos: number = 0;
  private line: number = 1;
  private col: number = 1;
  private pendingDocComment?: string;

  constructor(input: string) {
    this.input = input;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.pos < this.input.length) {
      this.skipWhitespaceAndComments();
      if (this.pos >= this.input.length) break;

      const startLine = this.line;
      const startCol = this.col;
      const ch = this.input[this.pos];

      // Identifier / Keyword
      if (/[a-zA-Z_]/.test(ch)) {
        const ident = this.readIdentifier();
        const loc: SourceLoc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        if (KEYWORDS.has(ident)) {
          if (ident === 'true' || ident === 'false') {
            this.emit(tokens, { type: 'BOOLEAN', value: ident, loc });
          } else {
            this.emit(tokens, { type: 'KEYWORD', value: ident, loc });
          }
        } else {
          this.emit(tokens, { type: 'IDENT', value: ident, loc });
        }
        continue;
      }

      // Number
      if (/[0-9]/.test(ch)) {
        const num = this.readNumber();
        const loc: SourceLoc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        this.emit(tokens, { type: 'NUMBER', value: num, loc });
        continue;
      }

      // String literal
      if (ch === '"' || ch === "'") {
        const str = this.readString(ch);
        const loc: SourceLoc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        this.emit(tokens, { type: 'STRING', value: str, loc });
        continue;
      }

      // Multi-char symbols
      const rest = this.input.slice(this.pos);

      if (rest.startsWith('...')) {
        this.advance(3);
        const loc: SourceLoc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        this.emit(tokens, { type: 'SYMBOL', value: '...', loc });
        continue;
      }

      if (rest.startsWith('..=')) {
        this.advance(3);
        const loc: SourceLoc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        this.emit(tokens, { type: 'SYMBOL', value: '..=', loc });
        continue;
      }

      if (rest.startsWith('..')) {
        this.advance(2);
        const loc: SourceLoc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        this.emit(tokens, { type: 'SYMBOL', value: '..', loc });
        continue;
      }

      if (
        rest.startsWith('=>') ||
        rest.startsWith('->') ||
        rest.startsWith('<-') ||
        rest.startsWith('==') ||
        rest.startsWith('!=') ||
        rest.startsWith('<=') ||
        rest.startsWith('>=') ||
        rest.startsWith('&&') ||
        rest.startsWith('||') ||
        rest.startsWith('+=') ||
        rest.startsWith('-=') ||
        rest.startsWith('*=') ||
        rest.startsWith('/=')
      ) {
        const sym = rest.slice(0, 2);
        this.advance(2);
        const loc: SourceLoc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        this.emit(tokens, { type: 'SYMBOL', value: sym, loc });
        continue;
      }

      // Single-char symbols
      if (
        '{}()[]:;,.|?=+-*/%<>!'.includes(ch)
      ) {
        this.advance(1);
        const loc: SourceLoc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
        this.emit(tokens, { type: 'SYMBOL', value: ch, loc });
        continue;
      }

      // Unknown character
      const lexErr: any = new Error(`Unexpected character '${ch}' at line ${this.line}, col ${this.col}`);
      lexErr.loc = { line: this.line, col: this.col, endLine: this.line, endCol: this.col + 1 };
      throw lexErr;
    }

    tokens.push({
      type: 'EOF',
      value: '',
      loc: { line: this.line, col: this.col, endLine: this.line, endCol: this.col }
    });

    return tokens;
  }

  private advance(n: number = 1) {
    for (let i = 0; i < n; i++) {
      if (this.pos < this.input.length) {
        if (this.input[this.pos] === '\n') {
          this.line++;
          this.col = 1;
        } else {
          this.col++;
        }
        this.pos++;
      }
    }
  }

  private emit(tokens: Token[], token: Token): void {
    if (this.pendingDocComment) {
      token.docComment = this.pendingDocComment;
      this.pendingDocComment = undefined;
    }
    tokens.push(token);
  }

  private appendDocComment(comment: string): void {
    this.pendingDocComment = this.pendingDocComment
      ? `${this.pendingDocComment}\n${comment}`
      : comment;
  }

  private skipWhitespaceAndComments() {
    let newlinesSinceComment = 0;
    while (this.pos < this.input.length) {
      const ch = this.input[this.pos];
      if (/\s/.test(ch)) {
        if (ch === '\n') {
          newlinesSinceComment++;
          if (newlinesSinceComment > 1) this.pendingDocComment = undefined;
        }
        this.advance(1);
        continue;
      }

      // Line comment //
      if (ch === '/' && this.input[this.pos + 1] === '/') {
        const isDocComment = this.input[this.pos + 2] === '/' && this.input[this.pos + 3] !== '/';
        const commentStart = this.pos;
        this.advance(2);
        while (this.pos < this.input.length && this.input[this.pos] !== '\n') {
          this.advance(1);
        }
        if (isDocComment) this.appendDocComment(this.input.slice(commentStart + 3, this.pos).trimStart());
        newlinesSinceComment = 0;
        continue;
      }

      // Block comment /* */
      if (ch === '/' && this.input[this.pos + 1] === '*') {
        const commentStart = this.pos;
        const isDocComment = this.input[this.pos + 2] === '*' && this.input[this.pos + 3] !== '*';
        const commentLine = this.line;
        const commentCol = this.col;
        this.advance(2);
        let closed = false;
        while (this.pos < this.input.length - 1) {
          if (this.input[this.pos] === '*' && this.input[this.pos + 1] === '/') {
            this.advance(2);
            closed = true;
            break;
          }
          this.advance(1);
        }
        if (!closed) {
          const commentErr: any = new Error(`Unterminated block comment starting at line ${commentLine}, col ${commentCol}`);
          commentErr.loc = { line: commentLine, col: commentCol, endLine: this.line, endCol: this.col };
          throw commentErr;
        }
        if (isDocComment) this.appendDocComment(this.input.slice(commentStart, this.pos));
        newlinesSinceComment = 0;
        continue;
      }

      break;
    }
  }

  private readIdentifier(): string {
    let start = this.pos;
    while (
      this.pos < this.input.length &&
      /[a-zA-Z0-9_]/.test(this.input[this.pos])
    ) {
      this.advance(1);
    }
    return this.input.slice(start, this.pos);
  }

  private readNumber(): string {
    let start = this.pos;
    let hasDot = false;
    while (this.pos < this.input.length) {
      const ch = this.input[this.pos];
      if (/[0-9]/.test(ch)) {
        this.advance(1);
      } else if (ch === '.' && !hasDot && /[0-9]/.test(this.input[this.pos + 1] || '')) {
        hasDot = true;
        this.advance(1);
      } else {
        break;
      }
    }
    return this.input.slice(start, this.pos);
  }

  private readString(quote: string): string {
    const startLine = this.line;
    const startCol = this.col;
    this.advance(1); // skip initial quote
    let str = '';
    while (this.pos < this.input.length) {
      const ch = this.input[this.pos];
      if (ch === quote) {
        this.advance(1); // skip closing quote
        return str;
      }
      if (ch === '\\') {
        this.advance(1);
        const next = this.input[this.pos];
        if (next === 'n') str += '\n';
        else if (next === 't') str += '\t';
        else if (next === '\\') str += '\\';
        else if (next === quote) str += quote;
        else str += next;
        this.advance(1);
      } else {
        str += ch;
        this.advance(1);
      }
    }
    const stringErr: any = new Error(`Unterminated string starting at line ${startLine}, col ${startCol}`);
    stringErr.loc = { line: startLine, col: startCol, endLine: this.line, endCol: this.col };
    throw stringErr;
  }
}
