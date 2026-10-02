// Parser for TypeLang (Draft v0.1 Specification)
import {
  Program,
  Statement,
  Expr,
  EBlock,
  Pattern,
  TypeAST,
  GADTDecl,
  GADTConstructor,
  TypeAliasDecl,
  SourceLoc,
  ImportSpecifier,
  MatchArm,
  ERecordFieldExpr,
  EMethodDef,
  TRecordField,
  PRecordFieldPattern,
  SExternFunction,
  SExternType,
  SExternValue,
  SExternModule,
  TypeParam,
  TypeParamAST,
  KindAST,
  kindASTToString,
  EDo,
  EWhere,
  DoItem
} from './ast';
import { Token, Lexer } from './lexer';

export class Parser {
  private tokens: Token[];
  private pos: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parseProgram(resilient = false): Program {
    const statements: Statement[] = [];
    while (!this.isAtEnd()) {
      if (resilient) {
        try {
          statements.push(this.parseStatement());
        } catch (e: any) {
          this.synchronize();
          if (this.isAtEnd()) break;
        }
      } else {
        statements.push(this.parseStatement());
      }
    }
    return { statements };
  }

  private synchronize(): void {
    if (this.isAtEnd()) return;
    this.advance();

    while (!this.isAtEnd()) {
      const prev = this.previous();
      if (prev.type === 'SYMBOL' && prev.value === ';') return;

      const peekType = this.peek().type;
      const peekVal = this.peek().value;

      if (peekType === 'KEYWORD') {
        switch (peekVal) {
          case 'let':
          case 'function':
          case 'type':
          case 'module':
          case 'import':
          case 'export':
          case 'match':
          case 'if':
          case 'for':
          case 'while':
          case 'return':
            return;
        }
      }

      this.advance();
    }
  }

  // ==================== HELPER METHODS ====================

  private peek(): Token {
    return this.tokens[this.pos];
  }

  private previous(): Token {
    return this.tokens[this.pos - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  private check(type: string, value?: string): boolean {
    if (this.isAtEnd()) return false;
    const tok = this.peek();
    if (tok.type !== type) return false;
    if (value !== undefined && tok.value !== value) return false;
    return true;
  }

  private match(type: string, value?: string): boolean {
    if (this.check(type, value)) {
      this.advance();
      return true;
    }
    return false;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.pos++;
    return this.previous();
  }

  private consume(type: string, value?: string, message?: string): Token {
    if (this.check(type, value)) {
      return this.advance();
    }
    const tok = this.peek();
    const err: any = new Error(
      message ||
        `Expected '${value || type}' but got '${tok.value}' at line ${tok.loc.line}, col ${tok.loc.col}`
    );
    err.loc = tok.loc;
    throw err;
  }

  private consumeIdentOrKeyword(message?: string): string {
    const tok = this.peek();
    if (tok.type === 'IDENT' || tok.type === 'KEYWORD') {
      this.advance();
      return tok.value;
    }
    const err: any = new Error(
      message ||
        `Expected identifier but got '${tok.value}' at line ${tok.loc.line}, col ${tok.loc.col}`
    );
    err.loc = tok.loc;
    throw err;
  }

  // ==================== STATEMENTS & DECLARATIONS ====================

  private parseStatement(): Statement {
    const leadingDocComment = this.peek().docComment;
    const isExported = this.match('KEYWORD', 'export');
    const docComment = leadingDocComment || this.peek().docComment;

    if (this.check('KEYWORD', 'extern')) {
      if (isExported) throw new Error("Cannot export an extern statement directly");
      return this.parseExternStatement();
    }

    if (this.check('KEYWORD', 'import')) {
      if (isExported) throw new Error("Cannot export an import statement");
      return this.parseImportStatement();
    }

    if (this.check('KEYWORD', 'module')) {
      return this.parseModuleStatement(isExported);
    }

    if (this.check('KEYWORD', 'type')) {
      return this.parseTypeDeclaration(isExported, docComment);
    }

    if (this.check('KEYWORD', 'function')) {
      return this.parseFunctionDeclaration(isExported, docComment);
    }

    if (this.check('KEYWORD', 'let')) {
      return this.parseLetStatement(isExported, docComment);
    }

    // Expression statement
    if (isExported) throw new Error("Cannot export an expression statement");
    const expr = this.parseExpr();
    this.match('SYMBOL', ';');
    return { kind: 's_expr', expr, loc: expr.loc };
  }

  private parseExternStatement(): Statement {
    const tok = this.consume('KEYWORD', 'extern');

    // Case 1: extern module ModuleName { ... } or extern "npm:pkg" as ModuleName { ... }
    if (this.check('KEYWORD', 'module') || this.check('STRING')) {
      let moduleName = '';
      if (this.match('KEYWORD', 'module')) {
        if (this.check('STRING')) {
          moduleName = this.advance().value;
        } else {
          moduleName = this.consumeIdentOrKeyword("Expected module name after extern module");
        }
      } else if (this.check('STRING')) {
        moduleName = this.advance().value;
      }

      let alias: string | undefined;
      if (this.match('KEYWORD', 'as')) {
        alias = this.consumeIdentOrKeyword("Expected alias name after as");
      }

      this.consume('SYMBOL', '{', "Expected '{' to start extern module body");

      const functions: SExternFunction[] = [];
      const types: SExternType[] = [];
      const values: SExternValue[] = [];

      while (!this.check('SYMBOL', '}') && !this.isAtEnd()) {
        const itemExported = this.match('KEYWORD', 'export');
        if (this.check('KEYWORD', 'fn') || this.check('KEYWORD', 'function')) {
          this.advance();
          functions.push(this.parseExternFunction(alias || moduleName, itemExported));
        } else if (this.check('KEYWORD', 'type')) {
          this.advance();
          types.push(this.parseExternType(itemExported));
        } else if (this.check('KEYWORD', 'let') || this.check('KEYWORD', 'var') || this.check('KEYWORD', 'const')) {
          this.advance();
          values.push(this.parseExternValue(alias || moduleName, itemExported));
        } else {
          this.advance();
        }
      }

      this.consume('SYMBOL', '}', "Expected '}' at end of extern module");
      return {
        kind: 's_extern_module',
        name: alias || moduleName,
        functions,
        types,
        values,
        loc: tok.loc
      };
    }

    // Case 2: extern fn / extern function
    if (this.match('KEYWORD', 'fn') || this.match('KEYWORD', 'function')) {
      const fn = this.parseExternFunction();
      return { ...fn, loc: tok.loc };
    }

    // Case 3: extern type
    if (this.match('KEYWORD', 'type')) {
      const t = this.parseExternType();
      return { ...t, loc: tok.loc };
    }

    // Case 4: extern let / const / var
    if (this.match('KEYWORD', 'let') || this.match('KEYWORD', 'const') || this.match('KEYWORD', 'var')) {
      const v = this.parseExternValue();
      return { ...v, loc: tok.loc };
    }

    throw new Error(`Unexpected token after 'extern' at line ${tok.loc.line}`);
  }

  // ==================== TYPE PARAMETER & KIND PARSING ====================

  public parseTypeParams(): TypeParam[] {
    const typeParams: TypeParam[] = [];
    if (this.match('SYMBOL', '<')) {
      if (this.check('SYMBOL', '>')) {
        this.advance();
        return typeParams;
      }
      do {
        typeParams.push(this.parseSingleTypeParam());
      } while (this.match('SYMBOL', ','));
      this.consume('SYMBOL', '>', "Expected '>' after type parameters");
    }
    return typeParams;
  }

  private parseSingleTypeParam(): TypeParam {
    const tok = this.peek();
    const name = this.consumeIdentOrKeyword("Expected type parameter name");

    // HOTs: Check if parameter is a higher-order type constructor e.g. F<_>, F<_, _>, M<_, _, _>
    if (this.match('SYMBOL', '<')) {
      let arity = 0;
      const innerParams: string[] = [];
      if (!this.check('SYMBOL', '>')) {
        do {
          arity++;
          if (this.check('IDENT') || this.check('KEYWORD')) {
            const innerTok = this.advance();
            if (innerTok.value === '_' || innerTok.value === '*') {
              innerParams.push('_');
            } else {
              let innerName = innerTok.value;
              if (this.match('SYMBOL', '<')) {
                this.consume('IDENT', '_');
                this.consume('SYMBOL', '>');
                innerName += '<_>';
              }
              innerParams.push(innerName);
            }
          } else if (this.match('SYMBOL', '*')) {
            innerParams.push('_');
          }
        } while (this.match('SYMBOL', ','));
      }
      this.consume('SYMBOL', '>', "Expected '>' after higher-order type parameter arguments");

      const raw = `${name}<${innerParams.join(', ')}>`;
      let kind: KindAST = { kind: 'star', loc: tok.loc };
      for (let i = 0; i < Math.max(1, arity); i++) {
        kind = { kind: 'arrow', from: { kind: 'star', loc: tok.loc }, to: kind, loc: tok.loc };
      }
      return {
        name,
        arity: Math.max(1, arity),
        kindAnnotation: kind,
        raw,
        loc: tok.loc
      };
    }

    // HOTs: Check if explicit kind annotation e.g. F: * -> * or T: (* -> *) -> * -> *
    if (this.match('SYMBOL', ':')) {
      const kind = this.parseKind();
      return {
        name,
        kindAnnotation: kind,
        raw: `${name}: ${kindASTToString(kind)}`,
        loc: tok.loc
      };
    }

    return {
      name,
      arity: 0,
      kindAnnotation: { kind: 'star', loc: tok.loc },
      raw: name,
      loc: tok.loc
    };
  }

  public parseKind(): KindAST {
    let left: KindAST;
    const tok = this.peek();

    if (this.match('SYMBOL', '(')) {
      left = this.parseKind();
      this.consume('SYMBOL', ')', "Expected ')' after kind in parentheses");
    } else if (this.match('SYMBOL', '*') || (this.check('IDENT') && (this.peek().value === 'Type' || this.peek().value === '*'))) {
      if (this.check('IDENT')) this.advance();
      left = { kind: 'star', loc: tok.loc };
    } else {
      left = { kind: 'star', loc: tok.loc };
    }

    if (this.match('SYMBOL', '->') || this.match('SYMBOL', '=>')) {
      const right = this.parseKind();
      return { kind: 'arrow', from: left, to: right, loc: tok.loc };
    }

    return left;
  }

  private parseExternFunction(moduleName?: string, isExported?: boolean): SExternFunction {
    const fnName = this.consumeIdentOrKeyword("Expected function name in extern declaration");
    const typeParams = this.parseTypeParams();

    this.consume('SYMBOL', '(', "Expected '(' for extern function parameters");
    const params: { name: string; type: TypeAST; isOptional?: boolean }[] = [];
    if (!this.check('SYMBOL', ')')) {
      do {
        const pName = this.consumeIdentOrKeyword("Expected parameter name");
        const isOptional = this.match('SYMBOL', '?');
        this.consume('SYMBOL', ':', "Expected ':' after parameter name");
        const pType = this.parseTypeAST();
        params.push({ name: pName, type: pType, isOptional });
      } while (this.match('SYMBOL', ','));
    }
    this.consume('SYMBOL', ')', "Expected ')' after parameters");

    let returnType: TypeAST = { kind: 'base', name: 'void' };
    if (this.match('SYMBOL', ':')) {
      returnType = this.parseTypeAST();
    }

    let jsSymbol: string | undefined;
    if (this.match('KEYWORD', 'as')) {
      if (this.check('STRING')) {
        jsSymbol = this.advance().value;
      } else {
        jsSymbol = this.consumeIdentOrKeyword("Expected JS symbol name after as");
      }
    }

    this.match('SYMBOL', ';');

    return {
      kind: 's_extern_function',
      name: fnName,
      moduleName,
      typeParams,
      params,
      returnType,
      jsSymbol,
      isExported
    };
  }

  private parseExternType(isExported?: boolean): SExternType {
    const name = this.consumeIdentOrKeyword("Expected type name in extern type declaration");
    const typeParams = this.parseTypeParams();

    this.consume('SYMBOL', '=', "Expected '=' in extern type declaration");
    const type = this.parseTypeAST();
    this.match('SYMBOL', ';');

    return {
      kind: 's_extern_type',
      name,
      typeParams,
      type,
      isExported
    };
  }

  private parseExternValue(moduleName?: string, isExported?: boolean): SExternValue {
    const name = this.consumeIdentOrKeyword("Expected value name in extern declaration");
    this.consume('SYMBOL', ':', "Expected ':' after value name");
    const type = this.parseTypeAST();

    let jsSymbol: string | undefined;
    if (this.match('KEYWORD', 'as')) {
      if (this.check('STRING')) {
        jsSymbol = this.advance().value;
      } else {
        jsSymbol = this.consumeIdentOrKeyword("Expected JS symbol name after as");
      }
    }

    this.match('SYMBOL', ';');

    return {
      kind: 's_extern_value',
      name,
      moduleName,
      type,
      jsSymbol,
      isExported
    };
  }

  private parseImportStatement(): Statement {
    const tok = this.consume('KEYWORD', 'import');

    // Check for ES6/FFI import: import { a, b } from "npm:lodash"
    if (this.check('SYMBOL', '{')) {
      this.advance(); // consume '{'
      const specifiers: ImportSpecifier[] = [];
      if (this.match('SYMBOL', '*')) {
        specifiers.push({ name: '*', isAll: true });
      } else {
        do {
          const name = this.consumeIdentOrKeyword("Expected imported name");
          let alias: string | undefined;
          if (this.match('KEYWORD', 'as')) {
            alias = this.consumeIdentOrKeyword("Expected alias name");
          }
          specifiers.push({ name, alias });
        } while (this.match('SYMBOL', ','));
      }
      this.consume('SYMBOL', '}', "Expected '}' after import specifiers");

      if (this.match('IDENT', 'from') || this.match('KEYWORD', 'from')) {
        let modName = '';
        if (this.check('STRING')) {
          modName = this.advance().value;
        } else {
          modName = this.consumeIdentOrKeyword("Expected module name after from");
        }
        this.match('SYMBOL', ';');
        return {
          kind: 's_import',
          modulePath: [modName],
          specifiers,
          loc: tok.loc
        };
      }
    }

    const firstToken = this.peek();
    let path: string[] = [];
    if (firstToken.type === 'STRING') {
      path = [this.advance().value];
    } else {
      path = [this.consumeIdentOrKeyword("Expected module name in import")];
    }

    while (this.match('SYMBOL', '.')) {
      if (this.check('SYMBOL', '{')) {
        // Grouped import: import Expr.{ Expr, eval } or import Expr.{ * }
        this.advance(); // consume '{'
        const specifiers: ImportSpecifier[] = [];
        if (this.match('SYMBOL', '*')) {
          specifiers.push({ name: '*', isAll: true });
        } else {
          do {
            const name = this.consumeIdentOrKeyword("Expected imported name");
            let alias: string | undefined;
            if (this.match('KEYWORD', 'as')) {
              alias = this.consumeIdentOrKeyword("Expected alias name");
            }
            specifiers.push({ name, alias });
          } while (this.match('SYMBOL', ','));
        }
        this.consume('SYMBOL', '}', "Expected '}' after import specifiers");
        this.match('SYMBOL', ';');
        return {
          kind: 's_import',
          modulePath: path,
          specifiers,
          loc: tok.loc
        };
      }
      path.push(this.consumeIdentOrKeyword("Expected submodule identifier"));
    }

    let alias: string | undefined;
    if (this.match('KEYWORD', 'as')) {
      alias = this.consumeIdentOrKeyword("Expected alias name");
    }

    this.match('SYMBOL', ';');
    return {
      kind: 's_import',
      modulePath: path,
      alias,
      loc: tok.loc
    };
  }

  private parseModuleStatement(isExported: boolean): Statement {
    const tok = this.consume('KEYWORD', 'module');
    const name = this.consume('IDENT', undefined, "Expected module name").value;
    this.consume('SYMBOL', '{', "Expected '{' to start module body");

    const body: Statement[] = [];
    while (!this.check('SYMBOL', '}') && !this.isAtEnd()) {
      body.push(this.parseStatement());
    }

    this.consume('SYMBOL', '}', "Expected '}' at end of module");
    return {
      kind: 's_module',
      name,
      body,
      isExported,
      loc: tok.loc
    };
  }

  private parseTypeDeclaration(isExported: boolean, docComment?: string): Statement {
    const tok = this.consume('KEYWORD', 'type');
    const name = this.consume('IDENT', undefined, "Expected type name").value;
    const typeParams = this.parseTypeParams();

    this.consume('SYMBOL', '=', "Expected '=' in type declaration");

    // Check if this is a GADT constructor variant declaration (starts with optional '|' or constructor)
    if (this.check('SYMBOL', '|') || (this.check('IDENT') && this.isConstructorStart())) {
      const constructors = this.parseGADTConstructors();
      this.match('SYMBOL', ';');
      return {
        kind: 's_gadt',
        decl: {
          kind: 'gadt',
          name,
          typeParams,
          constructors,
          docComment: docComment || tok.docComment,
          isExported,
          loc: tok.loc
        },
        isExported,
        loc: tok.loc
      };
    }

    // Otherwise it's a Type Alias
    const type = this.parseTypeAST();
    this.match('SYMBOL', ';');
    return {
      kind: 's_type_alias',
      decl: {
        kind: 'type_alias',
        name,
        typeParams,
        type,
        docComment: docComment || tok.docComment,
        isExported,
        loc: tok.loc
      },
      isExported,
      loc: tok.loc
    };
  }

  private isConstructorStart(): boolean {
    const tok = this.peek();
    // Uppercase identifier indicates constructor e.g. Lit, Bool, Pack
    return tok.type === 'IDENT' && /^[A-Z]/.test(tok.value);
  }

  private parseGADTConstructors(): GADTConstructor[] {
    const constructors: GADTConstructor[] = [];
    this.match('SYMBOL', '|'); // optional leading pipe

    do {
      const leadingDocComment = this.peek().docComment || this.previous().docComment;
      const ctorTok = this.consume('IDENT', undefined, "Expected constructor name");
      const name = ctorTok.value;

      let typeParams: TypeParam[] = [];
      let params: { name: string; type: TypeAST }[] = [];
      let returnType: TypeAST | undefined;

      if (this.match('SYMBOL', ':')) {
        // Full / typed constructor syntax e.g. Pack: <a>(...) => ReturnType  or  Nil: List<a>
        typeParams = this.parseTypeParams();

        if (this.match('SYMBOL', '(')) {
          params = this.parseGADTConstructorParams();
          this.consume('SYMBOL', ')', "Expected ')' after constructor parameters");
          if (this.match('SYMBOL', '=>') || this.match('SYMBOL', ':')) {
            returnType = this.parseTypeAST();
          } else if (!this.check('SYMBOL', '|') && !this.check('SYMBOL', ';') && !this.isAtEnd()) {
            returnType = this.parseTypeAST();
          }
        } else {
          // Nullary constructor with return type e.g. Nil: List<a> or Point: Shape
          returnType = this.parseTypeAST();
        }
      } else {
        // Short form: Pack<a>(params): ReturnType or Lit(value: number): Expr<number> or Point
        typeParams = this.parseTypeParams();

        if (this.match('SYMBOL', '(')) {
          params = this.parseGADTConstructorParams();
          this.consume('SYMBOL', ')', "Expected ')' after constructor parameters");
        }

        if (this.match('SYMBOL', ':') || this.match('SYMBOL', '=>')) {
          returnType = this.parseTypeAST();
        }
      }

      constructors.push({
        name,
        typeParams,
        params,
        returnType,
        docComment: leadingDocComment || ctorTok.docComment,
        loc: ctorTok.loc
      });
    } while (this.match('SYMBOL', '|'));

    return constructors;
  }

  private parseGADTConstructorParams(): { name: string; type: TypeAST; loc?: SourceLoc }[] {
    const params: { name: string; type: TypeAST; loc?: SourceLoc }[] = [];
    if (this.check('SYMBOL', ')')) return params;

    do {
      const pTok = this.peek();
      const paramName = this.consumeIdentOrKeyword("Expected parameter name");
      this.consume('SYMBOL', ':', "Expected ':' after parameter name");
      const paramType = this.parseTypeAST();
      params.push({ name: paramName, type: paramType, loc: pTok.loc });
    } while (this.match('SYMBOL', ','));

    return params;
  }

  private parseFunctionDeclaration(isExported: boolean, docComment?: string): Statement {
    const tok = this.consume('KEYWORD', 'function');
    const name = this.consumeIdentOrKeyword("Expected function name");
    const typeParams = this.parseTypeParams();

    this.consume('SYMBOL', '(', "Expected '(' for function parameters");
    const params: { name: string; type: TypeAST; loc?: SourceLoc }[] = [];
    if (!this.check('SYMBOL', ')')) {
      do {
        const pTok = this.peek();
        const pName = this.consumeIdentOrKeyword("Expected parameter name");
        this.consume('SYMBOL', ':', "Expected ':' for parameter type");
        const pType = this.parseTypeAST();
        params.push({ name: pName, type: pType, loc: pTok.loc });
      } while (this.match('SYMBOL', ','));
    }
    this.consume('SYMBOL', ')', "Expected ')' after parameters");

    let returnType: TypeAST = { kind: 'base', name: 'void' };
    if (this.match('SYMBOL', ':')) {
      returnType = this.parseTypeAST();
    }

    this.consume('SYMBOL', '{', "Expected '{' for function body");
    const body = this.parseBlockBody();

    let whereBindings: Statement[] | undefined;
    if (this.match('KEYWORD', 'where')) {
      this.consume('SYMBOL', '{', "Expected '{' after where");
      whereBindings = [];
      while (!this.check('SYMBOL', '}') && !this.isAtEnd()) {
        whereBindings.push(this.parseStatement());
      }
      this.consume('SYMBOL', '}', "Expected '}' at end of where clause");
    }

    return {
      kind: 's_function',
      name,
      typeParams,
      params,
      returnType,
      body,
      whereBindings,
      isExported,
      docComment: docComment || tok.docComment,
      loc: tok.loc
    };
  }

  private parseLetStatement(isExported: boolean, docComment?: string): Statement {
    const tok = this.consume('KEYWORD', 'let');
    const isMut = this.match('KEYWORD', 'mut');
    const name = this.consume('IDENT', undefined, "Expected variable name").value;

    let typeAnnotation: TypeAST | undefined;
    if (this.match('SYMBOL', ':')) {
      typeAnnotation = this.parseTypeAST();
    }

    this.consume('SYMBOL', '=', "Expected '=' in let declaration");
    const init = this.parseExpr();
    this.match('SYMBOL', ';');

    return {
      kind: 's_let',
      name,
      isMut,
      typeAnnotation,
      init,
      isExported,
      docComment: docComment || tok.docComment,
      loc: tok.loc
    };
  }

  // ==================== TYPES PARSER ====================

  private parseTypeAST(): TypeAST {
    // Higher-rank polymorphic function or type lambda: <F<_>, a>(x: a) => F<a> or <a, b> => Option<a>
    if (this.check('SYMBOL', '<')) {
      const loc = this.peek().loc;
      const typeParams = this.parseTypeParams();

      // Check if it's a Type Lambda: <a, b> => TypeBody
      if (this.match('SYMBOL', '=>')) {
        const body = this.parseTypeAST();
        return {
          kind: 'type_lambda',
          params: typeParams,
          body,
          loc
        };
      }

      this.consume('SYMBOL', '(', "Expected '(' for function type parameters");
      const params = this.parseFunctionTypeParams();
      this.consume('SYMBOL', ')', "Expected ')' after function type parameters");
      this.consume('SYMBOL', '=>', "Expected '=>' for function return type");
      const returnType = this.parseTypeAST();

      return {
        kind: 'fun',
        typeParams,
        params,
        returnType,
        loc
      };
    }

    // Function type with parens (x: A, y: B) => C
    if (this.check('SYMBOL', '(')) {
      const savePos = this.pos;
      try {
        const loc = this.peek().loc;
        this.advance(); // '('
        const params = this.parseFunctionTypeParams();
        this.consume('SYMBOL', ')');
        if (this.match('SYMBOL', '=>')) {
          const returnType = this.parseTypeAST();
          return { kind: 'fun', typeParams: [], params, returnType, loc };
        }
      } catch (e) {
        this.pos = savePos; // backtrack if not a function type
      }
    }

    // Base Primary Type
    let target = this.parsePrimaryType();

    // Support chained higher-kinded type application: target<T> e.g. (Fix<F>)<A>
    while (this.match('SYMBOL', '<')) {
      const args: TypeAST[] = [];
      if (!this.check('SYMBOL', '>')) {
        do {
          args.push(this.parseTypeAST());
        } while (this.match('SYMBOL', ','));
      }
      this.consume('SYMBOL', '>', "Expected '>' after type arguments");
      target = { kind: 'hkt_app', target, args, loc: target.loc };
    }

    // Check for postfix array brackets e.g. number[] or string[][]
    while (this.check('SYMBOL', '[') && this.lookaheadSymbol(']')) {
      this.advance(); // consume '['
      this.advance(); // consume ']'
      target = { kind: 'app', name: 'Array', args: [target], loc: target.loc };
    }

    return target;
  }

  private parseFunctionTypeParams(): { name?: string; type: TypeAST }[] {
    const params: { name?: string; type: TypeAST }[] = [];
    if (this.check('SYMBOL', ')')) return params;

    do {
      if ((this.check('IDENT') || this.check('KEYWORD')) && this.lookaheadSymbol(':')) {
        const name = this.advance().value;
        this.consume('SYMBOL', ':');
        const type = this.parseTypeAST();
        params.push({ name, type });
      } else {
        const type = this.parseTypeAST();
        params.push({ type });
      }
    } while (this.match('SYMBOL', ','));

    return params;
  }

  private lookaheadSymbol(sym: string): boolean {
    if (this.pos + 1 < this.tokens.length) {
      return this.tokens[this.pos + 1].value === sym;
    }
    return false;
  }

  private parsePrimaryType(): TypeAST {
    const tok = this.peek();

    // Parenthesized type: (A)
    if (this.match('SYMBOL', '(')) {
      const inner = this.parseTypeAST();
      this.consume('SYMBOL', ')', "Expected ')' after parenthesized type");
      return inner;
    }

    // Tuple type [A, B]
    if (this.match('SYMBOL', '[')) {
      const elements: TypeAST[] = [];
      if (!this.check('SYMBOL', ']')) {
        do {
          elements.push(this.parseTypeAST());
        } while (this.match('SYMBOL', ','));
      }
      this.consume('SYMBOL', ']', "Expected ']' at end of tuple type");
      return { kind: 'tuple', elements, loc: tok.loc };
    }

    // Record type { name: string, mut count: number, email?: string }
    if (this.match('SYMBOL', '{')) {
      const fields: TRecordField[] = [];
      if (!this.check('SYMBOL', '}')) {
        do {
          const isMut = this.match('KEYWORD', 'mut');
          const name = this.consumeIdentOrKeyword("Expected record field name");
          const isOptional = this.match('SYMBOL', '?');
          this.consume('SYMBOL', ':', "Expected ':' after record field name");
          const type = this.parseTypeAST();
          fields.push({ name, type, isMut, isOptional });
        } while (this.match('SYMBOL', ',') || this.check('IDENT') || this.check('KEYWORD'));
      }
      this.consume('SYMBOL', '}', "Expected '}' at end of record type");
      return { kind: 'record', fields, loc: tok.loc };
    }

    // Wildcard / underscore type placeholder: _ or *
    if (this.match('IDENT', '_') || this.match('SYMBOL', '*')) {
      return { kind: 'var', name: '_', loc: tok.loc };
    }

    // Base type or Identifier (Type variable / Type Constructor)
    if (this.check('IDENT') || this.check('KEYWORD')) {
      const name = this.advance().value;
      if (['number', 'boolean', 'string', 'void'].includes(name)) {
        return { kind: 'base', name: name as any, loc: tok.loc };
      }

      // Check if type application e.g. Expr<number> or list<a> or F<a>
      if (this.match('SYMBOL', '<')) {
        const args: TypeAST[] = [];
        if (!this.check('SYMBOL', '>')) {
          do {
            args.push(this.parseTypeAST());
          } while (this.match('SYMBOL', ','));
        }
        this.consume('SYMBOL', '>', "Expected '>' after type arguments");
        return { kind: 'app', name, args, loc: tok.loc };
      }

      // Identifier: lowercase -> TVar, uppercase -> TApp (0-arg constructor) or TVar
      if (/^[a-z_]/.test(name)) {
        return { kind: 'var', name, loc: tok.loc };
      } else {
        return { kind: 'app', name, args: [], loc: tok.loc };
      }
    }

    throw new Error(`Unexpected token '${tok.value}' in type signature at line ${tok.loc.line}, col ${tok.loc.col}`);
  }

  // ==================== EXPRESSION PARSER ====================

  public parseExpr(): Expr {
    let expr = this.parseAssignment();
    if (this.match('KEYWORD', 'where')) {
      this.consume('SYMBOL', '{', "Expected '{' after where");
      const bindings: Statement[] = [];
      while (!this.check('SYMBOL', '}') && !this.isAtEnd()) {
        bindings.push(this.parseStatement());
      }
      this.consume('SYMBOL', '}', "Expected '}' at end of where clause");
      expr = {
        kind: 'e_where',
        expr,
        bindings,
        loc: expr.loc
      };
    }
    return expr;
  }

  private parseAssignment(): Expr {
    const expr = this.parseTernary();

    if (
      this.match('SYMBOL', '=') ||
      this.match('SYMBOL', '+=') ||
      this.match('SYMBOL', '-=') ||
      this.match('SYMBOL', '*=') ||
      this.match('SYMBOL', '/=')
    ) {
      const op = this.previous().value as any;
      const value = this.parseAssignment();
      return {
        kind: 'e_assign',
        target: expr,
        value,
        op,
        loc: expr.loc
      };
    }

    return expr;
  }

  private parseTernary(): Expr {
    const cond = this.parseLogicalOr();
    if (this.match('SYMBOL', '?')) {
      const thenExpr = this.parseExpr();
      this.consume('SYMBOL', ':', "Expected ':' in ternary expression");
      const elseExpr = this.parseExpr();
      return { kind: 'e_if', cond, thenExpr, elseExpr, loc: cond.loc };
    }
    return cond;
  }

  private parseLogicalOr(): Expr {
    let left = this.parseLogicalAnd();
    while (this.match('SYMBOL', '||')) {
      const right = this.parseLogicalAnd();
      left = { kind: 'e_binary', op: '||', left, right, loc: left.loc };
    }
    return left;
  }

  private parseLogicalAnd(): Expr {
    let left = this.parseEquality();
    while (this.match('SYMBOL', '&&')) {
      const right = this.parseEquality();
      left = { kind: 'e_binary', op: '&&', left, right, loc: left.loc };
    }
    return left;
  }

  private parseEquality(): Expr {
    let left = this.parseRelational();
    while (this.check('SYMBOL', '==') || this.check('SYMBOL', '!=')) {
      const op = this.advance().value as any;
      const right = this.parseRelational();
      left = { kind: 'e_binary', op, left, right, loc: left.loc };
    }
    return left;
  }

  private parseRelational(): Expr {
    let left = this.parseRange();
    while (
      this.check('SYMBOL', '<') ||
      this.check('SYMBOL', '<=') ||
      this.check('SYMBOL', '>') ||
      this.check('SYMBOL', '>=')
    ) {
      const op = this.advance().value as any;
      const right = this.parseRange();
      left = { kind: 'e_binary', op, left, right, loc: left.loc };
    }
    return left;
  }

  private parseRange(): Expr {
    let left = this.parseAdditive();
    if (this.check('SYMBOL', '..') || this.check('SYMBOL', '..=')) {
      const opTok = this.advance();
      const inclusive = opTok.value === '..=';
      const right = this.parseAdditive();
      return {
        kind: 'e_range',
        start: left,
        end: right,
        inclusive,
        loc: left.loc
      };
    }
    return left;
  }

  private parseAdditive(): Expr {
    let left = this.parseMultiplicative();
    while (this.check('SYMBOL', '+') || this.check('SYMBOL', '-')) {
      const op = this.advance().value as any;
      const right = this.parseMultiplicative();
      left = { kind: 'e_binary', op, left, right, loc: left.loc };
    }
    return left;
  }

  private parseMultiplicative(): Expr {
    let left = this.parseUnary();
    while (this.check('SYMBOL', '*') || this.check('SYMBOL', '/') || this.check('SYMBOL', '%')) {
      const op = this.advance().value as any;
      const right = this.parseUnary();
      left = { kind: 'e_binary', op, left, right, loc: left.loc };
    }
    return left;
  }

  private parseUnary(): Expr {
    if (this.check('SYMBOL', '!') || this.check('SYMBOL', '-')) {
      const tok = this.advance();
      const expr = this.parseUnary();
      return { kind: 'e_unary', op: tok.value as any, expr, loc: tok.loc };
    }

    return this.parsePostfix();
  }

  private parsePostfix(): Expr {
    let expr = this.parsePrimary();

    while (true) {
      // Call: expr(...)
      if (this.match('SYMBOL', '(')) {
        const args: Expr[] = [];
        if (!this.check('SYMBOL', ')')) {
          do {
            args.push(this.parseExpr());
          } while (this.match('SYMBOL', ','));
        }
        this.consume('SYMBOL', ')', "Expected ')' after argument list");
        expr = { kind: 'e_call', callee: expr, args, loc: expr.loc };
        continue;
      }

      // Field or Method Access: expr.field or expr.method(...)
      if (this.match('SYMBOL', '.')) {
        const dotTok = this.previous();
        const nextTok = this.peek();
        const isNextOnSameLine = nextTok && nextTok.loc && nextTok.loc.line === dotTok.loc.line;
        const isStatementKeyword = nextTok && nextTok.type === 'KEYWORD' &&
          ['let', 'function', 'type', 'module', 'extern', 'import', 'export', 'return'].includes(nextTok.value);

        if (isNextOnSameLine && !isStatementKeyword && (this.check('IDENT') || this.check('KEYWORD'))) {
          const nameTokValue = this.consumeIdentOrKeyword("Expected field or method identifier");
          if (this.match('SYMBOL', '(')) {
            const args: Expr[] = [];
            if (!this.check('SYMBOL', ')')) {
              do {
                args.push(this.parseExpr());
              } while (this.match('SYMBOL', ','));
            }
            this.consume('SYMBOL', ')', "Expected ')' after method arguments");
            expr = {
              kind: 'e_method_call',
              object: expr,
              method: nameTokValue,
              args,
              loc: expr.loc
            };
          } else {
            expr = {
              kind: 'e_field_access',
              object: expr,
              field: nameTokValue,
              loc: expr.loc
            };
          }
        } else {
          // Trailing dot while actively typing in editor (e.g. `user.` or `user. `)
          expr = {
            kind: 'e_field_access',
            object: expr,
            field: '',
            loc: expr.loc
          };
        }
        continue;
      }

      // Index Access: expr[index]
      if (this.check('SYMBOL', '[')) {
        const nextTok = this.peek();
        const prevTok = this.previous();
        if (nextTok.loc.line > prevTok.loc.line) {
          break;
        }
        this.advance(); // consume '['
        const index = this.parseExpr();
        this.consume('SYMBOL', ']', "Expected ']' after index");
        expr = { kind: 'e_index', target: expr, index, loc: expr.loc };
        continue;
      }

      break;
    }

    return expr;
  }

  private parsePrimary(): Expr {
    const tok = this.peek();

    // Numbers
    if (this.match('NUMBER')) {
      return { kind: 'e_literal', value: parseFloat(this.previous().value), loc: tok.loc };
    }

    // Strings
    if (this.match('STRING')) {
      return { kind: 'e_literal', value: this.previous().value, loc: tok.loc };
    }

    // Booleans
    if (this.match('BOOLEAN')) {
      return { kind: 'e_literal', value: this.previous().value === 'true', loc: tok.loc };
    }


    // Break
    if (this.match('KEYWORD', 'break')) {
      return { kind: 'e_break', loc: tok.loc };
    }

    // Continue
    if (this.match('KEYWORD', 'continue')) {
      return { kind: 'e_continue', loc: tok.loc };
    }

    // Return
    if (this.match('KEYWORD', 'return')) {
      const tok = this.previous();
      let value = undefined;
      // Heuristic: if we aren't at the end of a block/statement, parse an expression
      if (!this.check('SYMBOL', '}') && !this.check('SYMBOL', ';') && !this.isAtEnd()) {
        const nextTok = this.peek();
        // Return expression must start on the same line as the 'return' keyword
        if (nextTok.loc.line === tok.loc.line) {
          if (nextTok.type !== 'KEYWORD' || ['true', 'false', 'match', 'if', 'fn', 'switch'].includes(nextTok.value)) {
            value = this.parseExpr();
          }
        }
      }
      return { kind: 'e_return', value, loc: tok.loc };
    }

    // Match expression: match (scrutinee) { ... }
    if (this.match('KEYWORD', 'match')) {
      this.consume('SYMBOL', '(', "Expected '(' after 'match'");
      const scrutinee = this.parseExpr();
      this.consume('SYMBOL', ')', "Expected ')' after match scrutinee");
      this.consume('SYMBOL', '{', "Expected '{' to start match arms");

      const arms: MatchArm[] = [];
      let hasRest = false;

      while (!this.check('SYMBOL', '}') && !this.isAtEnd()) {
        if (this.match('SYMBOL', '...')) {
          hasRest = true;
          this.consume('SYMBOL', '=>', "Expected '=>' after '...'");
          const body = this.parseExpr();
          arms.push({
            pattern: { kind: 'p_rest', loc: tok.loc },
            body,
            loc: tok.loc
          });
          this.match('SYMBOL', ',');
          break; // '...' must be last
        }

        const pattern = this.parsePattern();

        let nameAlias: string | undefined;
        if (this.match('KEYWORD', 'as')) {
          nameAlias = this.consume('IDENT', undefined, "Expected binding name after 'as'").value;
        }

        let guard: Expr | undefined;
        if (this.match('KEYWORD', 'if')) {
          guard = this.parseExpr();
        }

        const finalPattern: Pattern = nameAlias
          ? { kind: 'p_as', pattern, name: nameAlias, loc: pattern.loc }
          : pattern;

        this.consume('SYMBOL', '=>', "Expected '=>' in match arm");
        const body = this.parseExpr();

        arms.push({ pattern: finalPattern, guard, body, loc: pattern.loc });
        this.match('SYMBOL', ',');
      }

      this.consume('SYMBOL', '}', "Expected '}' at end of match");
      return { kind: 'e_match', scrutinee, arms, hasRest, loc: tok.loc };
    }

    // Switch expression: switch (discriminant) { case val: expr ... default: expr }
    if (this.match('KEYWORD', 'switch')) {
      let discriminant: Expr;
      if (this.check('SYMBOL', '(')) {
        this.advance();
        discriminant = this.parseExpr();
        this.consume('SYMBOL', ')', "Expected ')' after switch discriminant");
      } else {
        discriminant = this.parseExpr();
      }
      this.consume('SYMBOL', '{', "Expected '{' to start switch cases");

      const cases: { values: Expr[]; value: Expr; body: Expr }[] = [];
      let defaultCase: Expr | undefined;

      while (!this.check('SYMBOL', '}') && !this.isAtEnd()) {
        if (this.match('KEYWORD', 'case')) {
          const caseValues: Expr[] = [];
          do {
            caseValues.push(this.parseExpr());
          } while (this.match('SYMBOL', ','));

          this.consume('SYMBOL', ':', "Expected ':' after case value");

          while (this.match('KEYWORD', 'case')) {
            do {
              caseValues.push(this.parseExpr());
            } while (this.match('SYMBOL', ','));
            this.consume('SYMBOL', ':', "Expected ':' after case value");
          }

          const body = this.parseExpr();
          cases.push({ values: caseValues, value: caseValues[0], body });
        } else if (this.match('KEYWORD', 'default')) {
          this.consume('SYMBOL', ':', "Expected ':' after default");
          defaultCase = this.parseExpr();
        } else {
          throw new Error(`Expected 'case' or 'default' in switch block at line ${this.peek().loc.line}, col ${this.peek().loc.col}`);
        }
      }
      this.consume('SYMBOL', '}', "Expected '}' to end switch block");
      return { kind: 'e_switch', discriminant, cases, defaultCase, loc: tok.loc };
    }

    // If expression: if cond then expr1 else expr2  OR  if (cond) expr1 else expr2
    if (this.match('KEYWORD', 'if')) {
      let cond: Expr;
      if (this.check('SYMBOL', '(')) {
        this.advance();
        cond = this.parseExpr();
        this.consume('SYMBOL', ')', "Expected ')' after if condition");
      } else {
        cond = this.parseExpr();
        this.match('KEYWORD', 'then');
      }

      const thenExpr = this.parseExpr();
      let elseExpr: Expr | undefined;
      if (this.match('KEYWORD', 'else')) {
        elseExpr = this.parseExpr();
      }

      return { kind: 'e_if', cond, thenExpr, elseExpr, loc: tok.loc };
    }

    // For loop: for (let i = 0; i < 10; i = i + 1) { ... }
    if (this.match('KEYWORD', 'for') || this.match('IDENT', 'for')) {
      const tok = this.previous();
      this.consume('SYMBOL', '(', "Expected '(' after 'for'");

      let init: Statement | Expr | undefined;
      if (this.check('KEYWORD', 'let')) {
        init = this.parseLetStatement(false);
      } else if (!this.check('SYMBOL', ';')) {
        init = this.parseExpr();
        if (this.check('SYMBOL', ';')) this.advance();
      } else {
        this.consume('SYMBOL', ';');
      }

      let cond: Expr | undefined;
      if (!this.check('SYMBOL', ';')) {
        cond = this.parseExpr();
      }
      this.consume('SYMBOL', ';', "Expected ';' after for loop condition");

      let update: Expr | undefined;
      if (!this.check('SYMBOL', ')')) {
        update = this.parseExpr();
      }
      this.consume('SYMBOL', ')', "Expected ')' after for loop update");

      this.consume('SYMBOL', '{', "Expected '{' for loop body");
      const body = this.parseBlockBody(tok.loc);

      return { kind: 'e_for', init, cond, update, body, loc: tok.loc };
    }

    // While loop: while (cond) { ... }
    if (this.match('KEYWORD', 'while') || this.match('IDENT', 'while')) {
      const tok = this.previous();
      let cond: Expr;
      if (this.check('SYMBOL', '(')) {
        this.advance();
        cond = this.parseExpr();
        this.consume('SYMBOL', ')', "Expected ')' after while condition");
      } else {
        cond = this.parseExpr();
      }

      this.consume('SYMBOL', '{', "Expected '{' for while body");
      const body = this.parseBlockBody(tok.loc);

      return { kind: 'e_while', cond, body, loc: tok.loc };
    }

    // Do notation: do { ... } or do(monad) { ... }
    if (this.match('KEYWORD', 'do')) {
      let monad: Expr | undefined;
      if (this.match('SYMBOL', '(')) {
        monad = this.parseExpr();
        this.consume('SYMBOL', ')', "Expected ')' after do monad parameter");
      }
      this.consume('SYMBOL', '{', "Expected '{' to start do block");
      const items: DoItem[] = [];
      while (!this.check('SYMBOL', '}') && !this.isAtEnd()) {
        items.push(this.parseDoItem());
      }
      const closeBrace = this.consume('SYMBOL', '}', "Expected '}' at end of do block");
      const endLoc = closeBrace?.loc || (items.length > 0 ? items[items.length - 1].loc : tok.loc);
      return {
        kind: 'e_do',
        monad,
        items,
        loc: {
          line: tok.loc.line,
          col: tok.loc.col,
          endLine: endLoc?.endLine || endLoc?.line || tok.loc.line + 5000,
          endCol: endLoc?.endCol || 999999
        }
      };
    }

    // Block expression { let x = 1; x + 1 }
    if (this.check('SYMBOL', '{') && !this.isRecordLiteralStart()) {
      this.advance(); // consume '{'
      return this.parseBlockBody(tok.loc);
    }

    // Record expression { name: "Alice", ...person, mut count: 0, inc(self) { ... } }
    if (this.check('SYMBOL', '{')) {
      return this.parseRecordExpression();
    }

    // Polymorphic lambda: <a>(x: a) => x or <F<_>, a>(x: a) => F<a>
    if (this.check('SYMBOL', '<')) {
      const loc = this.peek().loc;
      const typeParams = this.parseTypeParams();

      this.consume('SYMBOL', '(', "Expected '(' for lambda parameters");
      const params = this.parseLambdaParams();
      this.consume('SYMBOL', ')', "Expected ')' after lambda parameters");

      let returnType: TypeAST | undefined;
      if (this.match('SYMBOL', ':')) {
        returnType = this.parseTypeAST();
      }

      this.consume('SYMBOL', '=>', "Expected '=>' in lambda expression");
      const body = this.parseExpr();

      return {
        kind: 'e_lambda',
        typeParams,
        params,
        returnType,
        body,
        loc
      };
    }

    // Explicit lambda starting with 'fn' keyword: fn(x) { x * 2 }, fn(x) => x * 2, fn<T>(x: T): T { x }
    if (this.match('KEYWORD', 'fn')) {
      const typeParams = this.parseTypeParams();

      this.consume('SYMBOL', '(', "Expected '(' for lambda parameters");
      const params = this.parseLambdaParams();
      this.consume('SYMBOL', ')', "Expected ')' after lambda parameters");

      let returnType: TypeAST | undefined;
      if (this.match('SYMBOL', ':')) {
        returnType = this.parseTypeAST();
      }

      let body: Expr;
      if (this.match('SYMBOL', '=>')) {
        body = this.parseExpr();
      } else if (this.check('SYMBOL', '{')) {
        this.advance(); // consume '{'
        body = this.parseBlockBody(tok.loc);
      } else {
        throw new Error(`Expected '=>' or '{' for lambda body at line ${tok.loc.line}, col ${tok.loc.col}`);
      }

      return {
        kind: 'e_lambda',
        typeParams,
        params,
        returnType,
        body,
        loc: tok.loc
      };
    }

    // Tuple or Parenthesized expression or Lambda (x: number) => expr
    if (this.match('SYMBOL', '(')) {
      if (this.match('SYMBOL', ')')) {
        // () -> void literal
        if (this.match('SYMBOL', '=>')) {
          const body = this.parseExpr();
          return { kind: 'e_lambda', typeParams: [], params: [], body, loc: tok.loc };
        }
        return { kind: 'e_literal', value: null, loc: tok.loc };
      }

      // Check if Lambda parameter list e.g. (x: number, y: string) => expr
      if (this.check('IDENT') && this.lookaheadSymbol(':')) {
        const params = this.parseLambdaParams();
        this.consume('SYMBOL', ')');
        let returnType: TypeAST | undefined;
        if (this.match('SYMBOL', ':')) {
          returnType = this.parseTypeAST();
        }
        this.consume('SYMBOL', '=>', "Expected '=>' in lambda expression");
        const body = this.parseExpr();
        return { kind: 'e_lambda', typeParams: [], params, returnType, body, loc: tok.loc };
      }

      const firstExpr = this.parseExpr();

      if (this.match('SYMBOL', ',')) {
        // Tuple expression [e1, e2]
        const elements: Expr[] = [firstExpr];
        do {
          elements.push(this.parseExpr());
        } while (this.match('SYMBOL', ','));
        this.consume('SYMBOL', ')', "Expected ')' at end of tuple");
        return { kind: 'e_tuple', elements, loc: tok.loc };
      }

      this.consume('SYMBOL', ')', "Expected ')' after expression");
      return firstExpr;
    }

    // Array / Tuple bracket literal [a, b] or [a for x in arr if x > 0]
    if (this.match('SYMBOL', '[')) {
      const elements: Expr[] = [];
      if (!this.check('SYMBOL', ']')) {
        const firstExpr = this.parseExpr();

        if (this.match('KEYWORD', 'for')) {
          const param = this.consumeIdentOrKeyword("Expected identifier after 'for'");
          this.consume('KEYWORD', 'in', "Expected 'in' after list comprehension param");
          const iterable = this.parseExpr();
          let condition: Expr | undefined;
          if (this.match('KEYWORD', 'if')) {
            condition = this.parseExpr();
          }
          this.consume('SYMBOL', ']', "Expected ']' at end of list comprehension");
          return { kind: 'e_list_comp', element: firstExpr, param, iterable, condition, loc: tok.loc };
        }

        elements.push(firstExpr);
        while (this.match('SYMBOL', ',')) {
          if (this.check('SYMBOL', ']')) break;
          elements.push(this.parseExpr());
        }
      }
      this.consume('SYMBOL', ']', "Expected ']' at end of tuple");
      if (elements.length === 1 && elements[0].kind === 'e_range') {
        return elements[0];
      }
      return { kind: 'e_tuple', elements, loc: tok.loc };
    }

    // Identifier or Constructor or Module reference e.g. Expr.Lit or x or self or pure
    if (this.check('IDENT') || this.check('KEYWORD', 'self') || this.check('KEYWORD', 'pure')) {
      const name = this.advance().value;

      // Uppercase module path reference e.g. MathCore.Algebra.square or Expr.Add
      if (/^[A-Z]/.test(name) && this.match('SYMBOL', '.')) {
        const dotTok = this.previous();
        const nextTok = this.peek();
        const isNextOnSameLine = nextTok && nextTok.loc && nextTok.loc.line === dotTok.loc.line;
        const isStatementKeyword = nextTok && nextTok.type === 'KEYWORD' &&
          ['let', 'function', 'type', 'module', 'extern', 'import', 'export', 'return'].includes(nextTok.value);

        const modulePath = [name];
        let fieldName = '';
        if (isNextOnSameLine && !isStatementKeyword && (this.check('IDENT') || this.check('KEYWORD'))) {
          fieldName = this.consumeIdentOrKeyword("Expected field or member name");
          while (/^[A-Z]/.test(fieldName) && this.match('SYMBOL', '.')) {
            modulePath.push(fieldName);
            if (this.check('IDENT') || this.check('KEYWORD')) {
              fieldName = this.consumeIdentOrKeyword("Expected field or member name");
            } else {
              fieldName = '';
              break;
            }
          }
        }

        return {
          kind: 'e_var',
          name: fieldName,
          modulePath,
          loc: tok.loc
        };
      }

      return { kind: 'e_var', name, loc: tok.loc };
    }

    if (!tok.loc) {
      throw new Error(`Unexpected token '${tok.value}' in expression at end of file`);
    }
    throw new Error(`Unexpected token '${tok.value}' in expression at line ${tok.loc.line}, col ${tok.loc.col}`);
  }

  private parseDoItem(): DoItem {
    const tok = this.peek();

    // 1. Let binding: let x = expr; or let mut x: T = expr;
    if (this.match('KEYWORD', 'let')) {
      const isMut = this.match('KEYWORD', 'mut');
      const name = this.consume('IDENT', undefined, "Expected variable name").value;
      let typeAnnotation: TypeAST | undefined;
      if (this.match('SYMBOL', ':')) {
        typeAnnotation = this.parseTypeAST();
      }
      this.consume('SYMBOL', '=', "Expected '=' in let declaration");
      const init = this.parseExpr();
      this.match('SYMBOL', ';');
      return {
        kind: 'do_let',
        name,
        isMut,
        typeAnnotation,
        init,
        loc: {
          line: tok.loc.line,
          col: tok.loc.col,
          endLine: init.loc?.endLine || tok.loc.endLine,
          endCol: init.loc?.endCol || tok.loc.endCol
        }
      };
    }

    // 2. Monadic bind: pattern <- expr;
    if (this.isDoBindAhead()) {
      const pattern = this.parsePattern();
      this.consume('SYMBOL', '<-', "Expected '<-' in monadic bind");
      const expr = this.parseExpr();
      this.match('SYMBOL', ';');
      return {
        kind: 'do_bind',
        pattern,
        expr,
        loc: {
          line: pattern.loc?.line || tok.loc.line,
          col: pattern.loc?.col || tok.loc.col,
          endLine: expr.loc?.endLine || pattern.loc?.endLine,
          endCol: expr.loc?.endCol || pattern.loc?.endCol
        }
      };
    }

    // 3. Pure return: pure expr;
    if (this.match('KEYWORD', 'pure')) {
      const expr = this.parseExpr();
      this.match('SYMBOL', ';');
      return {
        kind: 'do_return',
        expr,
        isPure: true,
        loc: {
          line: tok.loc.line,
          col: tok.loc.col,
          endLine: expr.loc?.endLine || tok.loc.endLine,
          endCol: expr.loc?.endCol || tok.loc.endCol
        }
      };
    }

    // 4. Return: return expr;
    if (this.match('KEYWORD', 'return')) {
      const expr = this.parseExpr();
      this.match('SYMBOL', ';');
      return {
        kind: 'do_return',
        expr,
        isPure: false,
        loc: {
          line: tok.loc.line,
          col: tok.loc.col,
          endLine: expr.loc?.endLine || tok.loc.endLine,
          endCol: expr.loc?.endCol || tok.loc.endCol
        }
      };
    }

    // 5. Expression statement / final yield
    const expr = this.parseExpr();
    this.match('SYMBOL', ';');
    return {
      kind: 'do_expr',
      expr,
      loc: expr.loc
    };
  }

  private isDoBindAhead(): boolean {
    let i = this.pos;
    let parenDepth = 0;
    let braceDepth = 0;
    let bracketDepth = 0;
    while (i < this.tokens.length) {
      const t = this.tokens[i];
      if (t.type === 'EOF') break;
      if (t.type === 'SYMBOL') {
        if (t.value === '(') parenDepth++;
        else if (t.value === ')') parenDepth--;
        else if (t.value === '{') braceDepth++;
        else if (t.value === '}') {
          if (braceDepth === 0) break;
          braceDepth--;
        }
        else if (t.value === '[') bracketDepth++;
        else if (t.value === ']') bracketDepth--;
        else if (t.value === ';' && parenDepth === 0 && braceDepth === 0 && bracketDepth === 0) break;
        else if (t.value === '<-' && parenDepth === 0 && braceDepth === 0 && bracketDepth === 0) {
          return true;
        }
      }
      i++;
    }
    return false;
  }

  private isRecordLiteralStart(): boolean {
    // Look ahead past '{' to see if it's `{ name:`, `{ mut`, `{ ...`, `{ field,`, or `{ inc(self) {`, or `{}`
    if (this.pos + 1 < this.tokens.length) {
      const next = this.tokens[this.pos + 1];
      if (next.value === 'mut' || next.value === '...') return true;
      if (next.value === '}') return true; // Empty record {}
      if ((next.type === 'IDENT' || next.type === 'KEYWORD') && this.pos + 2 < this.tokens.length) {
        const next2 = this.tokens[this.pos + 2];
        if (next2.value === ':') return true;
        // Check for record method `{ method(self...) {`
        if (next2.value === '(') {
          // Look ahead to see if the first param is 'self'
          if (this.pos + 3 < this.tokens.length && this.tokens[this.pos + 3].value === 'self') {
            return true;
          }
        }
        // Check for shorthand field with multiple items `{ className, id }`
        if (next2.value === ',') {
          return true;
        }
      }
    }
    return false;
  }

  private parseRecordExpression(): Expr {
    const tok = this.consume('SYMBOL', '{');

    let base: Expr | undefined;
    const fields: ERecordFieldExpr[] = [];
    const methods: EMethodDef[] = [];

    if (!this.check('SYMBOL', '}')) {
      // Record update spread { ...person, age: 31 }
      if (this.match('SYMBOL', '...')) {
        base = this.parseExpr();
        if (this.match('SYMBOL', ',')) {
          // parse additional fields
        }
      }

      while (!this.check('SYMBOL', '}') && !this.isAtEnd()) {
        const isMut = this.match('KEYWORD', 'mut');
        const name = this.consumeIdentOrKeyword("Expected field name");

        // Method definition inside record: inc(self): void { self.count += 1 }
        if (this.match('SYMBOL', '(')) {
          const selfParam = this.consumeIdentOrKeyword("Expected 'self' param name");
          const params: { name: string; type?: TypeAST }[] = [];
          if (!this.check('SYMBOL', ')')) {
            do {
              const pName = this.consumeIdentOrKeyword("Expected parameter name");
              let pType: TypeAST | undefined;
              if (this.match('SYMBOL', ':')) {
                pType = this.parseTypeAST();
              }
              params.push({ name: pName, type: pType });
            } while (this.match('SYMBOL', ','));
          }
          this.consume('SYMBOL', ')', "Expected ')' after method parameters");

          let returnType: TypeAST | undefined;
          if (this.match('SYMBOL', ':')) {
            returnType = this.parseTypeAST();
          }

          this.consume('SYMBOL', '{', "Expected '{' for method body");
          const body = this.parseBlockBody();

          methods.push({ name, selfParam, params, returnType, body });
        } else {
          // Standard field or shorthand field
          let value: Expr;
          if (this.match('SYMBOL', ':')) {
            value = this.parseExpr();
          } else {
            // Field shorthand e.g. { x, y } -> { x: x, y: y }
            value = { kind: 'e_var', name, loc: tok.loc };
          }
          fields.push({ name, value, isMut });
        }

        this.match('SYMBOL', ',');
      }
    }

    this.consume('SYMBOL', '}', "Expected '}' at end of record");

    if (base) {
      return { kind: 'e_record_update', base, updates: fields, loc: tok.loc };
    }

    return { kind: 'e_record', fields, methods, loc: tok.loc };
  }

  private parseLambdaParams(): { name: string; type?: TypeAST; loc?: SourceLoc }[] {
    const params: { name: string; type?: TypeAST; loc?: SourceLoc }[] = [];
    if (this.check('SYMBOL', ')')) return params;

    do {
      const pTok = this.peek();
      const name = this.consumeIdentOrKeyword("Expected parameter name");
      let type: TypeAST | undefined;
      if (this.match('SYMBOL', ':')) {
        type = this.parseTypeAST();
      }
      params.push({ name, type, loc: pTok.loc });
    } while (this.match('SYMBOL', ','));

    return params;
  }

  private parseBlockBody(loc?: SourceLoc): EBlock {
    const statements: Statement[] = [];
    let result: Expr | undefined;

    while (!this.check('SYMBOL', '}') && !this.isAtEnd()) {
      if (
        this.check('KEYWORD', 'let') ||
        this.check('KEYWORD', 'function') ||
        this.check('KEYWORD', 'type') ||
        this.check('KEYWORD', 'import') ||
        this.check('KEYWORD', 'module') ||
        this.check('KEYWORD', 'extern') ||
        this.check('KEYWORD', 'export')
      ) {
        statements.push(this.parseStatement());
      } else {
        const expr = this.parseExpr();
        if (this.check('SYMBOL', ';')) {
          this.advance();
          statements.push({ kind: 's_expr', expr, loc: expr.loc });
        } else if (this.check('SYMBOL', '}')) {
          result = expr; // Implicit block return value
        } else {
          statements.push({ kind: 's_expr', expr, loc: expr.loc });
        }
      }
    }

    this.consume('SYMBOL', '}', "Expected '}' at end of block");
    return { kind: 'e_block', statements, result, loc };
  }

  // ==================== PATTERN PARSER ====================

  private parsePattern(): Pattern {
    const tok = this.peek();

    // Wildcard _
    if (this.match('IDENT', '_')) {
      return { kind: 'p_wildcard', loc: tok.loc };
    }

    // Literal patterns
    if (this.match('NUMBER')) {
      return { kind: 'p_literal', value: parseFloat(this.previous().value), loc: tok.loc };
    }
    if (this.match('STRING')) {
      return { kind: 'p_literal', value: this.previous().value, loc: tok.loc };
    }
    if (this.match('BOOLEAN')) {
      return { kind: 'p_literal', value: this.previous().value === 'true', loc: tok.loc };
    }

    // Record pattern { name, age: a }
    if (this.match('SYMBOL', '{')) {
      const fields: PRecordFieldPattern[] = [];
      if (!this.check('SYMBOL', '}')) {
        do {
          const name = this.consume('IDENT', undefined, "Expected record field pattern name").value;
          let alias: string | undefined;
          let pattern: Pattern | undefined;
          if (this.match('SYMBOL', ':')) {
            pattern = this.parsePattern();
          }
          fields.push({ name, alias, pattern });
        } while (this.match('SYMBOL', ','));
      }
      this.consume('SYMBOL', '}', "Expected '}' after record pattern");
      return { kind: 'p_record', fields, loc: tok.loc };
    }

    // Tuple pattern [a, b]
    if (this.match('SYMBOL', '[')) {
      const elements: Pattern[] = [];
      if (!this.check('SYMBOL', ']')) {
        do {
          elements.push(this.parsePattern());
        } while (this.match('SYMBOL', ','));
      }
      this.consume('SYMBOL', ']', "Expected ']' after tuple pattern");
      return { kind: 'p_tuple', elements, loc: tok.loc };
    }

    // Identifier: Constructor pattern Lit(v) or Variable pattern v or self
    if (this.check('IDENT') || this.check('KEYWORD', 'self')) {
      const name = this.advance().value;

      // Uppercase -> Constructor pattern
      if (/^[A-Z]/.test(name)) {
        const args: Pattern[] = [];
        if (this.match('SYMBOL', '(')) {
          if (!this.check('SYMBOL', ')')) {
            do {
              args.push(this.parsePattern());
            } while (this.match('SYMBOL', ','));
          }
          this.consume('SYMBOL', ')', "Expected ')' after constructor pattern arguments");
        }
        return { kind: 'p_ctor', name, args, loc: tok.loc };
      }

      // Lowercase -> Variable pattern
      return { kind: 'p_var', name, loc: tok.loc };
    }

    throw new Error(`Unexpected token '${tok.value}' in pattern at line ${tok.loc.line}, col ${tok.loc.col}`);
  }
}
