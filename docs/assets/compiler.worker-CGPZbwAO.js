const KEYWORDS=new Set(["module","export","import","extern","as","type","function","fn","match","if","return","else","then","mut","true","false","let","self","for","while","switch","case","default","in","break","continue","do","where","pure"]);class Lexer{constructor(e){this.pos=0,this.line=1,this.col=1,this.input=e}tokenize(){const e=[];for(;this.pos<this.input.length&&(this.skipWhitespaceAndComments(),!(this.pos>=this.input.length));){const t=this.line,n=this.col,r=this.input[this.pos];if(/[a-zA-Z_]/.test(r)){const o=this.readIdentifier(),l={line:t,col:n,endLine:this.line,endCol:this.col};KEYWORDS.has(o)?o==="true"||o==="false"?this.emit(e,{type:"BOOLEAN",value:o,loc:l}):this.emit(e,{type:"KEYWORD",value:o,loc:l}):this.emit(e,{type:"IDENT",value:o,loc:l});continue}if(/[0-9]/.test(r)){const o=this.readNumber(),l={line:t,col:n,endLine:this.line,endCol:this.col};this.emit(e,{type:"NUMBER",value:o,loc:l});continue}if(r==='"'||r==="'"){const o=this.readString(r),l={line:t,col:n,endLine:this.line,endCol:this.col};this.emit(e,{type:"STRING",value:o,loc:l});continue}const s=this.input.slice(this.pos);if(s.startsWith("...")){this.advance(3);const o={line:t,col:n,endLine:this.line,endCol:this.col};this.emit(e,{type:"SYMBOL",value:"...",loc:o});continue}if(s.startsWith("..=")){this.advance(3);const o={line:t,col:n,endLine:this.line,endCol:this.col};this.emit(e,{type:"SYMBOL",value:"..=",loc:o});continue}if(s.startsWith("..")){this.advance(2);const o={line:t,col:n,endLine:this.line,endCol:this.col};this.emit(e,{type:"SYMBOL",value:"..",loc:o});continue}if(s.startsWith("=>")||s.startsWith("->")||s.startsWith("<-")||s.startsWith("==")||s.startsWith("!=")||s.startsWith("<=")||s.startsWith(">=")||s.startsWith("&&")||s.startsWith("||")||s.startsWith("+=")||s.startsWith("-=")||s.startsWith("*=")||s.startsWith("/=")){const o=s.slice(0,2);this.advance(2);const l={line:t,col:n,endLine:this.line,endCol:this.col};this.emit(e,{type:"SYMBOL",value:o,loc:l});continue}if("{}()[]:;,.|?=+-*/%<>!".includes(r)){this.advance(1);const o={line:t,col:n,endLine:this.line,endCol:this.col};this.emit(e,{type:"SYMBOL",value:r,loc:o});continue}const i=new Error(`Unexpected character '${r}' at line ${this.line}, col ${this.col}`);throw i.loc={line:this.line,col:this.col,endLine:this.line,endCol:this.col+1},i}return e.push({type:"EOF",value:"",loc:{line:this.line,col:this.col,endLine:this.line,endCol:this.col}}),e}advance(e=1){for(let t=0;t<e;t++)this.pos<this.input.length&&(this.input[this.pos]===`
`?(this.line++,this.col=1):this.col++,this.pos++)}emit(e,t){this.pendingDocComment&&(t.docComment=this.pendingDocComment,this.pendingDocComment=void 0),e.push(t)}appendDocComment(e){this.pendingDocComment=this.pendingDocComment?`${this.pendingDocComment}
${e}`:e}skipWhitespaceAndComments(){let e=0;for(;this.pos<this.input.length;){const t=this.input[this.pos];if(/\s/.test(t)){t===`
`&&(e++,e>1&&(this.pendingDocComment=void 0)),this.advance(1);continue}if(t==="/"&&this.input[this.pos+1]==="/"){const n=this.input[this.pos+2]==="/"&&this.input[this.pos+3]!=="/",r=this.pos;for(this.advance(2);this.pos<this.input.length&&this.input[this.pos]!==`
`;)this.advance(1);n&&this.appendDocComment(this.input.slice(r+3,this.pos).trimStart()),e=0;continue}if(t==="/"&&this.input[this.pos+1]==="*"){const n=this.pos,r=this.input[this.pos+2]==="*"&&this.input[this.pos+3]!=="*",s=this.line,i=this.col;this.advance(2);let o=!1;for(;this.pos<this.input.length-1;){if(this.input[this.pos]==="*"&&this.input[this.pos+1]==="/"){this.advance(2),o=!0;break}this.advance(1)}if(!o){const l=new Error(`Unterminated block comment starting at line ${s}, col ${i}`);throw l.loc={line:s,col:i,endLine:this.line,endCol:this.col},l}r&&this.appendDocComment(this.input.slice(n,this.pos)),e=0;continue}break}}readIdentifier(){let e=this.pos;for(;this.pos<this.input.length&&/[a-zA-Z0-9_]/.test(this.input[this.pos]);)this.advance(1);return this.input.slice(e,this.pos)}readNumber(){let e=this.pos,t=!1;for(;this.pos<this.input.length;){const n=this.input[this.pos];if(/[0-9]/.test(n))this.advance(1);else if(n==="."&&!t&&/[0-9]/.test(this.input[this.pos+1]||""))t=!0,this.advance(1);else break}return this.input.slice(e,this.pos)}readString(e){const t=this.line,n=this.col;this.advance(1);let r="";for(;this.pos<this.input.length;){const i=this.input[this.pos];if(i===e)return this.advance(1),r;if(i==="\\"){this.advance(1);const o=this.input[this.pos];o==="n"?r+=`
`:o==="r"?r+="\r":o==="t"?r+="	":o==="\\"?r+="\\":o===e?r+=e:r+=o,this.advance(1)}else r+=i,this.advance(1)}const s=new Error(`Unterminated string starting at line ${t}, col ${n}`);throw s.loc={line:t,col:n,endLine:this.line,endCol:this.col},s}}function getTypeParamName(a){return typeof a=="string"?a:a.name}function typeParamToString(a){return typeof a=="string"?a:a.raw?a.raw:a.kindAnnotation?`${a.name}: ${kindASTToString(a.kindAnnotation)}`:a.arity&&a.arity>0?`${a.name}<${Array(a.arity).fill("_").join(", ")}>`:a.name}function kindASTToString(a){return a.kind==="star"?"*":`${a.from.kind==="arrow"?`(${kindASTToString(a.from)})`:kindASTToString(a.from)} -> ${kindASTToString(a.to)}`}function desugarDo(a){return desugarDoItems(a.monad,a.items,0,a.loc)}function desugarDoItems(a,e,t,n){if(t>=e.length)return{kind:"e_literal",value:null,loc:n};const r=e[t];if(t===e.length-1){if(r.kind==="do_return"){const o=a?{kind:"e_field_access",object:a,field:"pure",loc:r.loc}:{kind:"e_var",name:"pure",loc:r.loc};o.isDoDesugared=!0,o.doOp="pure",o.doItem=r,o.doMonad=a,o.doScopeLoc=n;const l={kind:"e_call",callee:o,args:[r.expr],loc:r.loc};return l.isDoDesugared=!0,l.doOp="pure",l.doItem=r,l.doMonad=a,l.doScopeLoc=n,a||r.isPure?l:r.expr}if(r.kind==="do_expr"){if(a&&r.expr.kind==="e_call"&&r.expr.callee.kind==="e_var"&&r.expr.callee.name==="pure"){const o={kind:"e_field_access",object:a,field:"pure",loc:r.expr.loc};o.isDoDesugared=!0,o.doOp="pure",o.doItem=r,o.doMonad=a,o.doScopeLoc=n;const l={kind:"e_call",callee:o,args:r.expr.args,loc:r.expr.loc};return l.isDoDesugared=!0,l.doOp="pure",l.doItem=r,l.doMonad=a,l.doScopeLoc=n,l}return r.expr}if(r.kind==="do_bind")return r.expr;if(r.kind==="do_let")return{kind:"e_block",statements:[{kind:"s_let",name:r.name,isMut:r.isMut,typeAnnotation:r.typeAnnotation,init:r.init,loc:r.loc}],result:{kind:"e_var",name:r.name,loc:r.loc},loc:r.loc}}const i=desugarDoItems(a,e,t+1,n);if(r.kind==="do_let")return{kind:"e_block",statements:[{kind:"s_let",name:r.name,isMut:r.isMut,typeAnnotation:r.typeAnnotation,init:r.init,loc:r.loc}],result:i,loc:r.loc};if(r.kind==="do_bind"){let o=i,l;r.pattern.kind==="p_var"?l=r.pattern.name:(l=`$m_val_${t}`,o={kind:"e_match",scrutinee:{kind:"e_var",name:l,loc:r.loc},arms:[{pattern:r.pattern,body:i,loc:r.loc}],loc:r.loc});const c={kind:"e_lambda",typeParams:[],params:[{name:l,loc:r.pattern.kind==="p_var"&&r.pattern.loc?r.pattern.loc:r.loc}],body:o,loc:r.loc};c.isDoBind=!0,c.doVarName=l,c.doScopeLoc=n,c.doItem=r;const u=a?{kind:"e_field_access",object:a,field:"flatMap",loc:r.loc}:{kind:"e_var",name:"flatMap",loc:r.loc};u.isDoDesugared=!0,u.doOp="flatMap",u.doItem=r,u.doMonad=a,u.doScopeLoc=n,u.doVarName=l;const p={kind:"e_call",callee:u,args:[r.expr,c],loc:r.loc};return p.isDoDesugared=!0,p.doOp="flatMap",p.doItem=r,p.doMonad=a,p.doScopeLoc=n,p.doVarName=l,p}if(r.kind==="do_expr"){const o={kind:"e_lambda",typeParams:[],params:[{name:`_unused_${t}`,loc:r.loc}],body:i,loc:r.loc};o.isDoBind=!0,o.doScopeLoc=n,o.doItem=r;const l=a?{kind:"e_field_access",object:a,field:"flatMap",loc:r.loc}:{kind:"e_var",name:"flatMap",loc:r.loc};l.isDoDesugared=!0,l.doOp="flatMap",l.doItem=r,l.doMonad=a,l.doScopeLoc=n;const c={kind:"e_call",callee:l,args:[r.expr,o],loc:r.loc};return c.isDoDesugared=!0,c.doOp="flatMap",c.doItem=r,c.doMonad=a,c.doScopeLoc=n,c}if(r.kind==="do_return"){const o=a?{kind:"e_field_access",object:a,field:"pure",loc:r.loc}:{kind:"e_var",name:"pure",loc:r.loc};o.isDoDesugared=!0,o.doOp="pure",o.doItem=r,o.doMonad=a,o.doScopeLoc=n;const l={kind:"e_call",callee:o,args:[r.expr],loc:r.loc};return l.isDoDesugared=!0,l.doOp="pure",l.doItem=r,l.doMonad=a,l.doScopeLoc=n,a||r.isPure?l:r.expr}return i}class Parser{constructor(e){this.pos=0,this.tokens=e}parseProgram(e=!1){const t=[];for(;!this.isAtEnd();)if(e)try{t.push(this.parseStatement())}catch{if(this.synchronize(),this.isAtEnd())break}else t.push(this.parseStatement());return{statements:t}}synchronize(){if(!this.isAtEnd())for(this.advance();!this.isAtEnd();){const e=this.previous();if(e.type==="SYMBOL"&&e.value===";")return;const t=this.peek().type,n=this.peek().value;if(t==="KEYWORD")switch(n){case"let":case"function":case"type":case"module":case"import":case"export":case"match":case"if":case"for":case"while":case"return":return}this.advance()}}peek(){return this.tokens[this.pos]}previous(){return this.tokens[this.pos-1]}isAtEnd(){return this.peek().type==="EOF"}check(e,t){if(this.isAtEnd())return!1;const n=this.peek();return!(n.type!==e||t!==void 0&&n.value!==t)}match(e,t){return this.check(e,t)?(this.advance(),!0):!1}advance(){return this.isAtEnd()||this.pos++,this.previous()}consume(e,t,n){if(this.check(e,t))return this.advance();const r=this.peek(),s=new Error(n||`Expected '${t||e}' but got '${r.value}' at line ${r.loc.line}, col ${r.loc.col}`);throw s.loc=r.loc,s}consumeIdentOrKeyword(e){const t=this.peek();if(t.type==="IDENT"||t.type==="KEYWORD")return this.advance(),t.value;const n=new Error(e||`Expected identifier but got '${t.value}' at line ${t.loc.line}, col ${t.loc.col}`);throw n.loc=t.loc,n}parseStatement(){const e=this.peek().docComment,t=this.match("KEYWORD","export"),n=e||this.peek().docComment;if(this.check("KEYWORD","extern")){if(t)throw new Error("Cannot export an extern statement directly");return this.parseExternStatement()}if(this.check("KEYWORD","import")){if(t)throw new Error("Cannot export an import statement");return this.parseImportStatement()}if(this.check("KEYWORD","module"))return this.parseModuleStatement(t);if(this.check("KEYWORD","type"))return this.parseTypeDeclaration(t,n);if(this.check("KEYWORD","function"))return this.parseFunctionDeclaration(t,n);if(this.check("KEYWORD","let"))return this.parseLetStatement(t,n);if(t)throw new Error("Cannot export an expression statement");const r=this.parseExpr();return this.match("SYMBOL",";"),{kind:"s_expr",expr:r,loc:r.loc}}parseExternStatement(){const e=this.peek().docComment,t=this.consume("KEYWORD","extern");if(this.check("KEYWORD","module")||this.check("STRING")){let n="",r;if(this.match("KEYWORD","module"))if(this.check("STRING")){const u=this.advance();n=u.value,r=u.loc}else{const u=this.peek();n=this.consumeIdentOrKeyword("Expected module name after extern module"),r=u.loc}else if(this.check("STRING")){const u=this.advance();n=u.value,r=u.loc}let s,i;if(this.match("KEYWORD","as")){const u=this.peek();s=this.consumeIdentOrKeyword("Expected alias name after as"),i=u.loc}this.consume("SYMBOL","{","Expected '{' to start extern module body");const o=[],l=[],c=[];for(;!this.check("SYMBOL","}")&&!this.isAtEnd();){const u=this.peek().docComment,p=this.match("KEYWORD","export");this.check("KEYWORD","fn")||this.check("KEYWORD","function")?(this.advance(),o.push(this.parseExternFunction(s||n,p,u))):this.check("KEYWORD","type")?(this.advance(),l.push(this.parseExternType(p,u))):this.check("KEYWORD","let")||this.check("KEYWORD","var")||this.check("KEYWORD","const")?(this.advance(),c.push(this.parseExternValue(s||n,p,u))):this.advance()}return this.consume("SYMBOL","}","Expected '}' at end of extern module"),{kind:"s_extern_module",name:s||n,functions:o,types:l,values:c,docComment:e,loc:i||r||t.loc}}if(this.match("KEYWORD","fn")||this.match("KEYWORD","function")){const n=this.parseExternFunction(void 0,void 0,e);return{...n,loc:n.loc||t.loc}}if(this.match("KEYWORD","type")){const n=this.parseExternType(void 0,e);return{...n,loc:n.loc||t.loc}}if(this.match("KEYWORD","let")||this.match("KEYWORD","const")||this.match("KEYWORD","var")){const n=this.parseExternValue(void 0,void 0,e);return{...n,loc:n.loc||t.loc}}throw new Error(`Unexpected token after 'extern' at line ${t.loc.line}`)}parseTypeParams(){const e=[];if(this.match("SYMBOL","<")){if(this.check("SYMBOL",">"))return this.advance(),e;do e.push(this.parseSingleTypeParam());while(this.match("SYMBOL",","));this.consume("SYMBOL",">","Expected '>' after type parameters")}return e}parseSingleTypeParam(){const e=this.peek(),t=this.consumeIdentOrKeyword("Expected type parameter name");if(this.match("SYMBOL","<")){let n=0;const r=[];if(!this.check("SYMBOL",">"))do if(n++,this.check("IDENT")||this.check("KEYWORD")){const o=this.advance();if(o.value==="_"||o.value==="*")r.push("_");else{let l=o.value;this.match("SYMBOL","<")&&(this.consume("IDENT","_"),this.consume("SYMBOL",">"),l+="<_>"),r.push(l)}}else this.match("SYMBOL","*")&&r.push("_");while(this.match("SYMBOL",","));this.consume("SYMBOL",">","Expected '>' after higher-order type parameter arguments");const s=`${t}<${r.join(", ")}>`;let i={kind:"star",loc:e.loc};for(let o=0;o<Math.max(1,n);o++)i={kind:"arrow",from:{kind:"star",loc:e.loc},to:i,loc:e.loc};return{name:t,arity:Math.max(1,n),kindAnnotation:i,raw:s,loc:e.loc}}if(this.match("SYMBOL",":")){const n=this.parseKind();return{name:t,kindAnnotation:n,raw:`${t}: ${kindASTToString(n)}`,loc:e.loc}}return{name:t,arity:0,kindAnnotation:{kind:"star",loc:e.loc},raw:t,loc:e.loc}}parseKind(){let e;const t=this.peek();if(this.match("SYMBOL","(")?(e=this.parseKind(),this.consume("SYMBOL",")","Expected ')' after kind in parentheses")):this.match("SYMBOL","*")||this.check("IDENT")&&(this.peek().value==="Type"||this.peek().value==="*")?(this.check("IDENT")&&this.advance(),e={kind:"star",loc:t.loc}):e={kind:"star",loc:t.loc},this.match("SYMBOL","->")||this.match("SYMBOL","=>")){const n=this.parseKind();return{kind:"arrow",from:e,to:n,loc:t.loc}}return e}parseExternFunction(e,t,n){const r=this.peek(),s=this.consumeIdentOrKeyword("Expected function name in extern declaration"),i=this.parseTypeParams();this.consume("SYMBOL","(","Expected '(' for extern function parameters");const o=[];if(!this.check("SYMBOL",")"))do{const u=this.peek(),p=this.consumeIdentOrKeyword("Expected parameter name"),d=this.match("SYMBOL","?");this.consume("SYMBOL",":","Expected ':' after parameter name");const f=this.parseTypeAST();o.push({name:p,type:f,isOptional:d,loc:u.loc})}while(this.match("SYMBOL",","));this.consume("SYMBOL",")","Expected ')' after parameters");let l={kind:"base",name:"void"};this.match("SYMBOL",":")&&(l=this.parseTypeAST());let c;return this.match("KEYWORD","as")&&(this.check("STRING")?c=this.advance().value:c=this.consumeIdentOrKeyword("Expected JS symbol name after as")),this.match("SYMBOL",";"),{kind:"s_extern_function",name:s,moduleName:e,typeParams:i,params:o,returnType:l,jsSymbol:c,isExported:t,docComment:n,loc:r.loc}}parseExternType(e,t){const n=this.peek(),r=this.consumeIdentOrKeyword("Expected type name in extern type declaration"),s=this.parseTypeParams();this.consume("SYMBOL","=","Expected '=' in extern type declaration");const i=this.parseTypeAST();return this.match("SYMBOL",";"),{kind:"s_extern_type",name:r,typeParams:s,type:i,isExported:e,docComment:t,loc:n.loc}}parseExternValue(e,t,n){const r=this.peek(),s=this.consumeIdentOrKeyword("Expected value name in extern declaration");this.consume("SYMBOL",":","Expected ':' after value name");const i=this.parseTypeAST();let o;return this.match("KEYWORD","as")&&(this.check("STRING")?o=this.advance().value:o=this.consumeIdentOrKeyword("Expected JS symbol name after as")),this.match("SYMBOL",";"),{kind:"s_extern_value",name:s,moduleName:e,type:i,jsSymbol:o,isExported:t,docComment:n,loc:r.loc}}parseImportStatement(){const e=this.consume("KEYWORD","import");if(this.check("SYMBOL","{")){this.advance();const s=[];if(this.match("SYMBOL","*"))s.push({name:"*",isAll:!0});else do{const i=this.consumeIdentOrKeyword("Expected imported name");let o;this.match("KEYWORD","as")&&(o=this.consumeIdentOrKeyword("Expected alias name")),s.push({name:i,alias:o})}while(this.match("SYMBOL",","));if(this.consume("SYMBOL","}","Expected '}' after import specifiers"),this.match("IDENT","from")||this.match("KEYWORD","from")){let i="";return this.check("STRING")?i=this.advance().value:i=this.consumeIdentOrKeyword("Expected module name after from"),this.match("SYMBOL",";"),{kind:"s_import",modulePath:[i],specifiers:s,loc:e.loc}}}const t=this.peek();let n=[];for(t.type==="STRING"?n=[this.advance().value]:n=[this.consumeIdentOrKeyword("Expected module name in import")];this.match("SYMBOL",".");){if(this.check("SYMBOL","{")){this.advance();const s=[];if(this.match("SYMBOL","*"))s.push({name:"*",isAll:!0});else do{const i=this.consumeIdentOrKeyword("Expected imported name");let o;this.match("KEYWORD","as")&&(o=this.consumeIdentOrKeyword("Expected alias name")),s.push({name:i,alias:o})}while(this.match("SYMBOL",","));return this.consume("SYMBOL","}","Expected '}' after import specifiers"),this.match("SYMBOL",";"),{kind:"s_import",modulePath:n,specifiers:s,loc:e.loc}}n.push(this.consumeIdentOrKeyword("Expected submodule identifier"))}let r;return this.match("KEYWORD","as")&&(r=this.consumeIdentOrKeyword("Expected alias name")),this.match("SYMBOL",";"),{kind:"s_import",modulePath:n,alias:r,loc:e.loc}}parseModuleStatement(e){const t=this.consume("KEYWORD","module"),n=this.consume("IDENT",void 0,"Expected module name").value;this.consume("SYMBOL","{","Expected '{' to start module body");const r=[];for(;!this.check("SYMBOL","}")&&!this.isAtEnd();)r.push(this.parseStatement());return this.consume("SYMBOL","}","Expected '}' at end of module"),{kind:"s_module",name:n,body:r,isExported:e,loc:t.loc}}parseTypeDeclaration(e,t){const n=this.consume("KEYWORD","type"),r=this.consume("IDENT",void 0,"Expected type name").value,s=this.parseTypeParams();if(this.consume("SYMBOL","=","Expected '=' in type declaration"),this.check("SYMBOL","|")||this.check("IDENT")&&this.isConstructorStart()){const o=this.parseGADTConstructors();return this.match("SYMBOL",";"),{kind:"s_gadt",decl:{kind:"gadt",name:r,typeParams:s,constructors:o,docComment:t||n.docComment,isExported:e,loc:n.loc},isExported:e,loc:n.loc}}const i=this.parseTypeAST();return this.match("SYMBOL",";"),{kind:"s_type_alias",decl:{kind:"type_alias",name:r,typeParams:s,type:i,docComment:t||n.docComment,isExported:e,loc:n.loc},isExported:e,loc:n.loc}}isConstructorStart(){const e=this.peek();return e.type==="IDENT"&&/^[A-Z]/.test(e.value)}parseGADTConstructors(){const e=[];this.match("SYMBOL","|");do{const t=this.peek().docComment||this.previous().docComment,n=this.consume("IDENT",void 0,"Expected constructor name"),r=n.value;let s=[],i=[],o;this.match("SYMBOL",":")?(s=this.parseTypeParams(),this.match("SYMBOL","(")?(i=this.parseGADTConstructorParams(),this.consume("SYMBOL",")","Expected ')' after constructor parameters"),this.match("SYMBOL","=>")||this.match("SYMBOL",":")?o=this.parseTypeAST():!this.check("SYMBOL","|")&&!this.check("SYMBOL",";")&&!this.isAtEnd()&&(o=this.parseTypeAST())):o=this.parseTypeAST()):(s=this.parseTypeParams(),this.match("SYMBOL","(")&&(i=this.parseGADTConstructorParams(),this.consume("SYMBOL",")","Expected ')' after constructor parameters")),(this.match("SYMBOL",":")||this.match("SYMBOL","=>"))&&(o=this.parseTypeAST())),e.push({name:r,typeParams:s,params:i,returnType:o,docComment:t||n.docComment,loc:n.loc})}while(this.match("SYMBOL","|"));return e}parseGADTConstructorParams(){const e=[];if(this.check("SYMBOL",")"))return e;do{const t=this.peek(),n=this.consumeIdentOrKeyword("Expected parameter name");this.consume("SYMBOL",":","Expected ':' after parameter name");const r=this.parseTypeAST();e.push({name:n,type:r,loc:t.loc})}while(this.match("SYMBOL",","));return e}parseFunctionDeclaration(e,t){const n=this.consume("KEYWORD","function"),r=this.consumeIdentOrKeyword("Expected function name"),s=this.parseTypeParams();this.consume("SYMBOL","(","Expected '(' for function parameters");const i=[];if(!this.check("SYMBOL",")"))do{const u=this.peek(),p=this.consumeIdentOrKeyword("Expected parameter name");this.consume("SYMBOL",":","Expected ':' for parameter type");const d=this.parseTypeAST();i.push({name:p,type:d,loc:u.loc})}while(this.match("SYMBOL",","));this.consume("SYMBOL",")","Expected ')' after parameters");let o={kind:"base",name:"void"};this.match("SYMBOL",":")&&(o=this.parseTypeAST()),this.consume("SYMBOL","{","Expected '{' for function body");const l=this.parseBlockBody();let c;if(this.match("KEYWORD","where")){for(this.consume("SYMBOL","{","Expected '{' after where"),c=[];!this.check("SYMBOL","}")&&!this.isAtEnd();)c.push(this.parseStatement());this.consume("SYMBOL","}","Expected '}' at end of where clause")}return{kind:"s_function",name:r,typeParams:s,params:i,returnType:o,body:l,whereBindings:c,isExported:e,docComment:t||n.docComment,loc:n.loc}}parseLetStatement(e,t){const n=this.consume("KEYWORD","let"),r=this.match("KEYWORD","mut"),s=this.consume("IDENT",void 0,"Expected variable name").value;let i;this.match("SYMBOL",":")&&(i=this.parseTypeAST()),this.consume("SYMBOL","=","Expected '=' in let declaration");const o=this.parseExpr();return this.match("SYMBOL",";"),{kind:"s_let",name:s,isMut:r,typeAnnotation:i,init:o,isExported:e,docComment:t||n.docComment,loc:n.loc}}parseTypeAST(){if(this.check("SYMBOL","<")){const t=this.peek().loc,n=this.parseTypeParams();if(this.match("SYMBOL","=>")){const i=this.parseTypeAST();return{kind:"type_lambda",params:n,body:i,loc:t}}this.consume("SYMBOL","(","Expected '(' for function type parameters");const r=this.parseFunctionTypeParams();this.consume("SYMBOL",")","Expected ')' after function type parameters"),this.consume("SYMBOL","=>","Expected '=>' for function return type");const s=this.parseTypeAST();return{kind:"fun",typeParams:n,params:r,returnType:s,loc:t}}if(this.check("SYMBOL","(")){const t=this.pos;try{const n=this.peek().loc;this.advance();const r=this.parseFunctionTypeParams();if(this.consume("SYMBOL",")"),this.match("SYMBOL","=>")){const s=this.parseTypeAST();return{kind:"fun",typeParams:[],params:r,returnType:s,loc:n}}}catch{this.pos=t}}let e=this.parsePrimaryType();for(;this.match("SYMBOL","<");){const t=[];if(!this.check("SYMBOL",">"))do t.push(this.parseTypeAST());while(this.match("SYMBOL",","));this.consume("SYMBOL",">","Expected '>' after type arguments"),e={kind:"hkt_app",target:e,args:t,loc:e.loc}}for(;this.check("SYMBOL","[")&&this.lookaheadSymbol("]");)this.advance(),this.advance(),e={kind:"app",name:"Array",args:[e],loc:e.loc};return e}parseFunctionTypeParams(){const e=[];if(this.check("SYMBOL",")"))return e;do if((this.check("IDENT")||this.check("KEYWORD"))&&this.lookaheadSymbol(":")){const t=this.advance().value;this.consume("SYMBOL",":");const n=this.parseTypeAST();e.push({name:t,type:n})}else{const t=this.parseTypeAST();e.push({type:t})}while(this.match("SYMBOL",","));return e}lookaheadSymbol(e){return this.pos+1<this.tokens.length?this.tokens[this.pos+1].value===e:!1}parsePrimaryType(){const e=this.peek();if(this.match("SYMBOL","(")){const t=this.parseTypeAST();return this.consume("SYMBOL",")","Expected ')' after parenthesized type"),t}if(this.match("SYMBOL","[")){const t=[];if(!this.check("SYMBOL","]"))do t.push(this.parseTypeAST());while(this.match("SYMBOL",","));return this.consume("SYMBOL","]","Expected ']' at end of tuple type"),{kind:"tuple",elements:t,loc:e.loc}}if(this.match("SYMBOL","{")){const t=[];if(!this.check("SYMBOL","}"))do{const n=this.match("KEYWORD","mut"),r=this.consumeIdentOrKeyword("Expected record field name"),s=this.match("SYMBOL","?");this.consume("SYMBOL",":","Expected ':' after record field name");const i=this.parseTypeAST();t.push({name:r,type:i,isMut:n,isOptional:s})}while(this.match("SYMBOL",",")||this.check("IDENT")||this.check("KEYWORD"));return this.consume("SYMBOL","}","Expected '}' at end of record type"),{kind:"record",fields:t,loc:e.loc}}if(this.match("IDENT","_")||this.match("SYMBOL","*"))return{kind:"var",name:"_",loc:e.loc};if(this.check("IDENT")||this.check("KEYWORD")){const t=this.advance().value;if(["number","boolean","string","void"].includes(t))return{kind:"base",name:t,loc:e.loc};if(this.match("SYMBOL","<")){const n=[];if(!this.check("SYMBOL",">"))do n.push(this.parseTypeAST());while(this.match("SYMBOL",","));return this.consume("SYMBOL",">","Expected '>' after type arguments"),{kind:"app",name:t,args:n,loc:e.loc}}return/^[a-z_]/.test(t)?{kind:"var",name:t,loc:e.loc}:{kind:"app",name:t,args:[],loc:e.loc}}throw new Error(`Unexpected token '${e.value}' in type signature at line ${e.loc.line}, col ${e.loc.col}`)}parseExpr(){let e=this.parseAssignment();if(this.match("KEYWORD","where")){this.consume("SYMBOL","{","Expected '{' after where");const t=[];for(;!this.check("SYMBOL","}")&&!this.isAtEnd();)t.push(this.parseStatement());this.consume("SYMBOL","}","Expected '}' at end of where clause"),e={kind:"e_where",expr:e,bindings:t,loc:e.loc}}return e}parseAssignment(){const e=this.parseTernary();if(this.match("SYMBOL","=")||this.match("SYMBOL","+=")||this.match("SYMBOL","-=")||this.match("SYMBOL","*=")||this.match("SYMBOL","/=")||this.match("SYMBOL","%=")){const t=this.previous().value,n=this.parseAssignment();return{kind:"e_assign",target:e,value:n,op:t,loc:e.loc}}return e}parseTernary(){const e=this.parseLogicalOr();if(this.match("SYMBOL","?")){const t=this.parseExpr();this.consume("SYMBOL",":","Expected ':' in ternary expression");const n=this.parseExpr();return{kind:"e_if",cond:e,thenExpr:t,elseExpr:n,loc:e.loc}}return e}parseLogicalOr(){let e=this.parseLogicalAnd();for(;this.match("SYMBOL","||");){const t=this.parseLogicalAnd();e={kind:"e_binary",op:"||",left:e,right:t,loc:e.loc}}return e}parseLogicalAnd(){let e=this.parseEquality();for(;this.match("SYMBOL","&&");){const t=this.parseEquality();e={kind:"e_binary",op:"&&",left:e,right:t,loc:e.loc}}return e}parseEquality(){let e=this.parseRelational();for(;this.check("SYMBOL","==")||this.check("SYMBOL","!=");){const t=this.advance().value,n=this.parseRelational();e={kind:"e_binary",op:t,left:e,right:n,loc:e.loc}}return e}parseRelational(){let e=this.parseRange();for(;this.check("SYMBOL","<")||this.check("SYMBOL","<=")||this.check("SYMBOL",">")||this.check("SYMBOL",">=");){const t=this.advance().value,n=this.parseRange();e={kind:"e_binary",op:t,left:e,right:n,loc:e.loc}}return e}parseRange(){let e=this.parseAdditive();if(this.check("SYMBOL","..")||this.check("SYMBOL","..=")){const n=this.advance().value==="..=",r=this.parseAdditive();return{kind:"e_range",start:e,end:r,inclusive:n,loc:e.loc}}return e}parseAdditive(){let e=this.parseMultiplicative();for(;this.check("SYMBOL","+")||this.check("SYMBOL","-");){const t=this.advance().value,n=this.parseMultiplicative();e={kind:"e_binary",op:t,left:e,right:n,loc:e.loc}}return e}parseMultiplicative(){let e=this.parseUnary();for(;this.check("SYMBOL","*")||this.check("SYMBOL","/")||this.check("SYMBOL","%");){const t=this.advance().value,n=this.parseUnary();e={kind:"e_binary",op:t,left:e,right:n,loc:e.loc}}return e}parseUnary(){if(this.check("SYMBOL","!")||this.check("SYMBOL","-")){const e=this.advance(),t=this.parseUnary();return{kind:"e_unary",op:e.value,expr:t,loc:e.loc}}return this.parsePostfix()}parsePostfix(){let e=this.parsePrimary();for(;;){if(this.match("SYMBOL","(")){const t=[];if(!this.check("SYMBOL",")"))do t.push(this.parseExpr());while(this.match("SYMBOL",","));this.consume("SYMBOL",")","Expected ')' after argument list"),e={kind:"e_call",callee:e,args:t,loc:e.loc};continue}if(this.match("SYMBOL",".")){const t=this.previous(),n=this.peek(),r=n&&n.loc&&n.loc.line===t.loc.line,s=n&&n.type==="KEYWORD"&&["let","function","type","module","extern","import","export","return"].includes(n.value);if(r&&!s&&(this.check("IDENT")||this.check("KEYWORD"))){const i=this.consumeIdentOrKeyword("Expected field or method identifier");if(this.match("SYMBOL","(")){const o=[];if(!this.check("SYMBOL",")"))do o.push(this.parseExpr());while(this.match("SYMBOL",","));this.consume("SYMBOL",")","Expected ')' after method arguments"),e={kind:"e_method_call",object:e,method:i,args:o,loc:e.loc}}else e={kind:"e_field_access",object:e,field:i,loc:e.loc}}else e={kind:"e_field_access",object:e,field:"",loc:e.loc};continue}if(this.check("SYMBOL","[")){const t=this.peek(),n=this.previous();if(t.loc.line>n.loc.line)break;this.advance();const r=this.parseExpr();this.consume("SYMBOL","]","Expected ']' after index"),e={kind:"e_index",target:e,index:r,loc:e.loc};continue}break}return e}parsePrimary(){const e=this.peek();if(this.match("NUMBER"))return{kind:"e_literal",value:parseFloat(this.previous().value),loc:e.loc};if(this.match("STRING"))return{kind:"e_literal",value:this.previous().value,loc:e.loc};if(this.match("BOOLEAN"))return{kind:"e_literal",value:this.previous().value==="true",loc:e.loc};if(this.match("KEYWORD","break"))return{kind:"e_break",loc:e.loc};if(this.match("KEYWORD","continue"))return{kind:"e_continue",loc:e.loc};if(this.match("KEYWORD","return")){const t=this.previous();let n;if(!this.check("SYMBOL","}")&&!this.check("SYMBOL",";")&&!this.isAtEnd()){const r=this.peek();r.loc.line===t.loc.line&&(r.type!=="KEYWORD"||["true","false","match","if","fn","switch"].includes(r.value))&&(n=this.parseExpr())}return{kind:"e_return",value:n,loc:t.loc}}if(this.match("KEYWORD","match")){this.consume("SYMBOL","(","Expected '(' after 'match'");const t=this.parseExpr();this.consume("SYMBOL",")","Expected ')' after match scrutinee"),this.consume("SYMBOL","{","Expected '{' to start match arms");const n=[];let r=!1;for(;!this.check("SYMBOL","}")&&!this.isAtEnd();){if(this.match("SYMBOL","...")){r=!0,this.consume("SYMBOL","=>","Expected '=>' after '...'");const u=this.parseExpr();n.push({pattern:{kind:"p_rest",loc:e.loc},body:u,loc:e.loc}),this.match("SYMBOL",",");break}const s=this.parsePattern();let i;this.match("KEYWORD","as")&&(i=this.consume("IDENT",void 0,"Expected binding name after 'as'").value);let o;this.match("KEYWORD","if")&&(o=this.parseExpr());const l=i?{kind:"p_as",pattern:s,name:i,loc:s.loc}:s;this.consume("SYMBOL","=>","Expected '=>' in match arm");const c=this.parseExpr();n.push({pattern:l,guard:o,body:c,loc:s.loc}),this.match("SYMBOL",",")}return this.consume("SYMBOL","}","Expected '}' at end of match"),{kind:"e_match",scrutinee:t,arms:n,hasRest:r,loc:e.loc}}if(this.match("KEYWORD","switch")){let t;this.check("SYMBOL","(")?(this.advance(),t=this.parseExpr(),this.consume("SYMBOL",")","Expected ')' after switch discriminant")):t=this.parseExpr(),this.consume("SYMBOL","{","Expected '{' to start switch cases");const n=[];let r;for(;!this.check("SYMBOL","}")&&!this.isAtEnd();)if(this.match("KEYWORD","case")){const s=[];do s.push(this.parseExpr());while(this.match("SYMBOL",","));for(this.consume("SYMBOL",":","Expected ':' after case value");this.match("KEYWORD","case");){do s.push(this.parseExpr());while(this.match("SYMBOL",","));this.consume("SYMBOL",":","Expected ':' after case value")}const i=this.parseExpr();n.push({values:s,value:s[0],body:i})}else if(this.match("KEYWORD","default"))this.consume("SYMBOL",":","Expected ':' after default"),r=this.parseExpr();else throw new Error(`Expected 'case' or 'default' in switch block at line ${this.peek().loc.line}, col ${this.peek().loc.col}`);return this.consume("SYMBOL","}","Expected '}' to end switch block"),{kind:"e_switch",discriminant:t,cases:n,defaultCase:r,loc:e.loc}}if(this.match("KEYWORD","if")){let t;this.check("SYMBOL","(")?(this.advance(),t=this.parseExpr(),this.consume("SYMBOL",")","Expected ')' after if condition")):(t=this.parseExpr(),this.match("KEYWORD","then"));const n=this.parseExpr();let r;return this.match("KEYWORD","else")&&(r=this.parseExpr()),{kind:"e_if",cond:t,thenExpr:n,elseExpr:r,loc:e.loc}}if(this.match("KEYWORD","for")||this.match("IDENT","for")){const t=this.previous();this.consume("SYMBOL","(","Expected '(' after 'for'");let n;this.check("KEYWORD","let")?n=this.parseLetStatement(!1):this.check("SYMBOL",";")?this.consume("SYMBOL",";"):(n=this.parseExpr(),this.check("SYMBOL",";")&&this.advance());let r;this.check("SYMBOL",";")||(r=this.parseExpr()),this.consume("SYMBOL",";","Expected ';' after for loop condition");let s;this.check("SYMBOL",")")||(s=this.parseExpr()),this.consume("SYMBOL",")","Expected ')' after for loop update"),this.consume("SYMBOL","{","Expected '{' for loop body");const i=this.parseBlockBody(t.loc);return{kind:"e_for",init:n,cond:r,update:s,body:i,loc:t.loc}}if(this.match("KEYWORD","while")||this.match("IDENT","while")){const t=this.previous();let n;this.check("SYMBOL","(")?(this.advance(),n=this.parseExpr(),this.consume("SYMBOL",")","Expected ')' after while condition")):n=this.parseExpr(),this.consume("SYMBOL","{","Expected '{' for while body");const r=this.parseBlockBody(t.loc);return{kind:"e_while",cond:n,body:r,loc:t.loc}}if(this.match("KEYWORD","do")){let t;this.match("SYMBOL","(")&&(t=this.parseExpr(),this.consume("SYMBOL",")","Expected ')' after do monad parameter")),this.consume("SYMBOL","{","Expected '{' to start do block");const n=[];for(;!this.check("SYMBOL","}")&&!this.isAtEnd();)n.push(this.parseDoItem());const r=this.consume("SYMBOL","}","Expected '}' at end of do block"),s=(r==null?void 0:r.loc)||(n.length>0?n[n.length-1].loc:e.loc);return{kind:"e_do",monad:t,items:n,loc:{line:e.loc.line,col:e.loc.col,endLine:(s==null?void 0:s.endLine)||(s==null?void 0:s.line)||e.loc.line+5e3,endCol:(s==null?void 0:s.endCol)||999999}}}if(this.check("SYMBOL","{")&&!this.isRecordLiteralStart())return this.advance(),this.parseBlockBody(e.loc);if(this.check("SYMBOL","{"))return this.parseRecordExpression();if(this.check("SYMBOL","<")){const t=this.peek().loc,n=this.parseTypeParams();this.consume("SYMBOL","(","Expected '(' for lambda parameters");const r=this.parseLambdaParams();this.consume("SYMBOL",")","Expected ')' after lambda parameters");let s;this.match("SYMBOL",":")&&(s=this.parseTypeAST()),this.consume("SYMBOL","=>","Expected '=>' in lambda expression");const i=this.parseExpr();return{kind:"e_lambda",typeParams:n,params:r,returnType:s,body:i,loc:t}}if(this.match("KEYWORD","fn")){const t=this.parseTypeParams();this.consume("SYMBOL","(","Expected '(' for lambda parameters");const n=this.parseLambdaParams();this.consume("SYMBOL",")","Expected ')' after lambda parameters");let r;this.match("SYMBOL",":")&&(r=this.parseTypeAST());let s;if(this.match("SYMBOL","=>"))s=this.parseExpr();else if(this.check("SYMBOL","{"))this.advance(),s=this.parseBlockBody(e.loc);else throw new Error(`Expected '=>' or '{' for lambda body at line ${e.loc.line}, col ${e.loc.col}`);return{kind:"e_lambda",typeParams:t,params:n,returnType:r,body:s,loc:e.loc}}if(this.match("SYMBOL","(")){if(this.match("SYMBOL",")")){if(this.match("SYMBOL","=>")){const n=this.parseExpr();return{kind:"e_lambda",typeParams:[],params:[],body:n,loc:e.loc}}return{kind:"e_literal",value:null,loc:e.loc}}if(this.check("IDENT")&&this.lookaheadSymbol(":")){const n=this.parseLambdaParams();this.consume("SYMBOL",")");let r;this.match("SYMBOL",":")&&(r=this.parseTypeAST()),this.consume("SYMBOL","=>","Expected '=>' in lambda expression");const s=this.parseExpr();return{kind:"e_lambda",typeParams:[],params:n,returnType:r,body:s,loc:e.loc}}const t=this.parseExpr();if(this.match("SYMBOL",",")){const n=[t];do n.push(this.parseExpr());while(this.match("SYMBOL",","));return this.consume("SYMBOL",")","Expected ')' at end of tuple"),{kind:"e_tuple",elements:n,loc:e.loc}}return this.consume("SYMBOL",")","Expected ')' after expression"),t}if(this.match("SYMBOL","[")){const t=[];if(!this.check("SYMBOL","]")){const n=this.parseExpr();if(this.match("KEYWORD","for")){const r=this.consumeIdentOrKeyword("Expected identifier after 'for'");this.consume("KEYWORD","in","Expected 'in' after list comprehension param");const s=this.parseExpr();let i;return this.match("KEYWORD","if")&&(i=this.parseExpr()),this.consume("SYMBOL","]","Expected ']' at end of list comprehension"),{kind:"e_list_comp",element:n,param:r,iterable:s,condition:i,loc:e.loc}}for(t.push(n);this.match("SYMBOL",",")&&!this.check("SYMBOL","]");)t.push(this.parseExpr())}return this.consume("SYMBOL","]","Expected ']' at end of tuple"),t.length===1&&t[0].kind==="e_range"?t[0]:{kind:"e_tuple",elements:t,loc:e.loc}}if(this.check("IDENT")||this.check("KEYWORD","self")||this.check("KEYWORD","pure")){const t=this.advance().value;if(/^[A-Z]/.test(t)&&this.match("SYMBOL",".")){const n=this.previous(),r=this.peek(),s=r&&r.loc&&r.loc.line===n.loc.line,i=r&&r.type==="KEYWORD"&&["let","function","type","module","extern","import","export","return"].includes(r.value),o=[t];let l="";if(s&&!i&&(this.check("IDENT")||this.check("KEYWORD")))for(l=this.consumeIdentOrKeyword("Expected field or member name");/^[A-Z]/.test(l)&&this.match("SYMBOL",".");)if(o.push(l),this.check("IDENT")||this.check("KEYWORD"))l=this.consumeIdentOrKeyword("Expected field or member name");else{l="";break}return{kind:"e_var",name:l,modulePath:o,loc:e.loc}}return{kind:"e_var",name:t,loc:e.loc}}throw e.loc?new Error(`Unexpected token '${e.value}' in expression at line ${e.loc.line}, col ${e.loc.col}`):new Error(`Unexpected token '${e.value}' in expression at end of file`)}parseDoItem(){var n,r,s,i,o,l,c,u,p,d,f,m;const e=this.peek();if(this.match("KEYWORD","let")){const y=this.match("KEYWORD","mut"),_=this.consume("IDENT",void 0,"Expected variable name").value;let g;this.match("SYMBOL",":")&&(g=this.parseTypeAST()),this.consume("SYMBOL","=","Expected '=' in let declaration");const h=this.parseExpr();return this.match("SYMBOL",";"),{kind:"do_let",name:_,isMut:y,typeAnnotation:g,init:h,loc:{line:e.loc.line,col:e.loc.col,endLine:((n=h.loc)==null?void 0:n.endLine)||e.loc.endLine,endCol:((r=h.loc)==null?void 0:r.endCol)||e.loc.endCol}}}if(this.isDoBindAhead()){const y=this.parsePattern();this.consume("SYMBOL","<-","Expected '<-' in monadic bind");const _=this.parseExpr();return this.match("SYMBOL",";"),{kind:"do_bind",pattern:y,expr:_,loc:{line:((s=y.loc)==null?void 0:s.line)||e.loc.line,col:((i=y.loc)==null?void 0:i.col)||e.loc.col,endLine:((o=_.loc)==null?void 0:o.endLine)||((l=y.loc)==null?void 0:l.endLine),endCol:((c=_.loc)==null?void 0:c.endCol)||((u=y.loc)==null?void 0:u.endCol)}}}if(this.match("KEYWORD","pure")){const y=this.parseExpr();return this.match("SYMBOL",";"),{kind:"do_return",expr:y,isPure:!0,loc:{line:e.loc.line,col:e.loc.col,endLine:((p=y.loc)==null?void 0:p.endLine)||e.loc.endLine,endCol:((d=y.loc)==null?void 0:d.endCol)||e.loc.endCol}}}if(this.match("KEYWORD","return")){const y=this.parseExpr();return this.match("SYMBOL",";"),{kind:"do_return",expr:y,isPure:!1,loc:{line:e.loc.line,col:e.loc.col,endLine:((f=y.loc)==null?void 0:f.endLine)||e.loc.endLine,endCol:((m=y.loc)==null?void 0:m.endCol)||e.loc.endCol}}}const t=this.parseExpr();return this.match("SYMBOL",";"),{kind:"do_expr",expr:t,loc:t.loc}}isDoBindAhead(){let e=this.pos,t=0,n=0,r=0;for(;e<this.tokens.length;){const s=this.tokens[e];if(s.type==="EOF")break;if(s.type==="SYMBOL")if(s.value==="(")t++;else if(s.value===")")t--;else if(s.value==="{")n++;else if(s.value==="}"){if(n===0)break;n--}else if(s.value==="[")r++;else if(s.value==="]")r--;else{if(s.value===";"&&t===0&&n===0&&r===0)break;if(s.value==="<-"&&t===0&&n===0&&r===0)return!0}e++}return!1}isRecordLiteralStart(){if(this.pos+1<this.tokens.length){const e=this.tokens[this.pos+1];if(e.value==="mut"||e.value==="..."||e.value==="}")return!0;if((e.type==="IDENT"||e.type==="KEYWORD")&&this.pos+2<this.tokens.length){const t=this.tokens[this.pos+2];if(t.value===":"||t.value==="("&&this.pos+3<this.tokens.length&&this.tokens[this.pos+3].value==="self"||t.value===",")return!0}}return!1}parseRecordExpression(){const e=this.consume("SYMBOL","{");let t;const n=[],r=[];if(!this.check("SYMBOL","}"))for(this.match("SYMBOL","...")&&(t=this.parseExpr(),this.match("SYMBOL",","));!this.check("SYMBOL","}")&&!this.isAtEnd();){const s=this.match("KEYWORD","mut"),i=this.consumeIdentOrKeyword("Expected field name");if(this.match("SYMBOL","(")){const o=this.consumeIdentOrKeyword("Expected 'self' param name"),l=[];if(!this.check("SYMBOL",")"))do{const p=this.consumeIdentOrKeyword("Expected parameter name");let d;this.match("SYMBOL",":")&&(d=this.parseTypeAST()),l.push({name:p,type:d})}while(this.match("SYMBOL",","));this.consume("SYMBOL",")","Expected ')' after method parameters");let c;this.match("SYMBOL",":")&&(c=this.parseTypeAST()),this.consume("SYMBOL","{","Expected '{' for method body");const u=this.parseBlockBody();r.push({name:i,selfParam:o,params:l,returnType:c,body:u})}else{let o;this.match("SYMBOL",":")?o=this.parseExpr():o={kind:"e_var",name:i,loc:e.loc},n.push({name:i,value:o,isMut:s})}this.match("SYMBOL",",")}return this.consume("SYMBOL","}","Expected '}' at end of record"),t?{kind:"e_record_update",base:t,updates:n,loc:e.loc}:{kind:"e_record",fields:n,methods:r,loc:e.loc}}parseLambdaParams(){const e=[];if(this.check("SYMBOL",")"))return e;do{const t=this.peek(),n=this.consumeIdentOrKeyword("Expected parameter name");let r;this.match("SYMBOL",":")&&(r=this.parseTypeAST()),e.push({name:n,type:r,loc:t.loc})}while(this.match("SYMBOL",","));return e}parseBlockBody(e){const t=[];let n;for(;!this.check("SYMBOL","}")&&!this.isAtEnd();)if(this.check("KEYWORD","let")||this.check("KEYWORD","function")||this.check("KEYWORD","type")||this.check("KEYWORD","import")||this.check("KEYWORD","module")||this.check("KEYWORD","extern")||this.check("KEYWORD","export"))t.push(this.parseStatement());else{const r=this.parseExpr();this.check("SYMBOL",";")?(this.advance(),t.push({kind:"s_expr",expr:r,loc:r.loc})):this.check("SYMBOL","}")?n=r:t.push({kind:"s_expr",expr:r,loc:r.loc})}return this.consume("SYMBOL","}","Expected '}' at end of block"),{kind:"e_block",statements:t,result:n,loc:e}}parsePattern(){const e=this.peek();if(this.match("IDENT","_"))return{kind:"p_wildcard",loc:e.loc};if(this.match("NUMBER"))return{kind:"p_literal",value:parseFloat(this.previous().value),loc:e.loc};if(this.match("STRING"))return{kind:"p_literal",value:this.previous().value,loc:e.loc};if(this.match("BOOLEAN"))return{kind:"p_literal",value:this.previous().value==="true",loc:e.loc};if(this.match("SYMBOL","{")){const t=[];if(!this.check("SYMBOL","}"))do{const n=this.consume("IDENT",void 0,"Expected record field pattern name").value;let r,s;this.match("SYMBOL",":")&&(s=this.parsePattern()),t.push({name:n,alias:r,pattern:s})}while(this.match("SYMBOL",","));return this.consume("SYMBOL","}","Expected '}' after record pattern"),{kind:"p_record",fields:t,loc:e.loc}}if(this.match("SYMBOL","[")){const t=[];if(!this.check("SYMBOL","]"))do t.push(this.parsePattern());while(this.match("SYMBOL",","));return this.consume("SYMBOL","]","Expected ']' after tuple pattern"),{kind:"p_tuple",elements:t,loc:e.loc}}if(this.check("IDENT")||this.check("KEYWORD","self")){const t=this.advance().value;if(/^[A-Z]/.test(t)){const n=[];if(this.match("SYMBOL","(")){if(!this.check("SYMBOL",")"))do n.push(this.parsePattern());while(this.match("SYMBOL",","));this.consume("SYMBOL",")","Expected ')' after constructor pattern arguments")}return{kind:"p_ctor",name:t,args:n,loc:e.loc}}return{kind:"p_var",name:t,loc:e.loc}}throw new Error(`Unexpected token '${e.value}' in pattern at line ${e.loc.line}, col ${e.loc.col}`)}}function normalizeDocComment(a){let e=a.trim();return e.startsWith("/**")&&(e=e.slice(3,e.endsWith("*/")?-2:void 0)),e.split(/\r?\n/).map(t=>t.replace(/^\s*\/\/\//,"").replace(/^\s*\*/,"").replace(/^\s+/,"").trimEnd()).join(`
`).trim().split(`
`)}function parseDocComment(a){if(!a)return{description:"",tags:[]};const e=[],t=[];let n;for(const r of normalizeDocComment(a)){const s=r.match(/^@([\w-]+)\b(?:\s+(.*))?$/);if(s){const i=s[1].toLowerCase();let o=(s[2]||"").trim(),l;if(i==="param"||i==="arg"||i==="argument"||i==="typeparam"||i==="template"){o=o.replace(/^\{[^}]*\}\s*/,"");const c=o.match(/^(?:<([^>]+)>|\[([^\]=]+)(?:=[^\]]+)?\]|([^\s-]+))(?:\s+-?\s*)?(.*)$/);c&&(l=c[1]||c[2]||c[3],o=c[4]||"")}n={tag:i,name:l,description:o},t.push(n);continue}n?n.description=[n.description,r.trim()].filter(Boolean).join(`
`):e.push(r)}return{description:e.join(`
`).trim(),tags:t}}function getParameterDoc(a,e){var n;const t=new Set(["param","arg","argument"]);return((n=parseDocComment(a).tags.find(r=>t.has(r.tag)&&r.name===e))==null?void 0:n.description)||void 0}function renderDocComment(a,e=[]){if(!a)return;const t=parseDocComment(a),n=[];t.description&&n.push(t.description);const r=new Map(t.tags.filter(o=>["param","arg","argument"].includes(o.tag)&&o.name).map(o=>[o.name,o.description])),s=e.filter(o=>r.has(o));s.length&&n.push(`**Parameters**
${s.map(o=>`- \`${o}\`: ${r.get(o)}`).join(`
`)}`);const i=o=>{switch(o.tag){case"return":case"returns":return o.description?`**Returns**
${o.description}`:"";case"throws":case"exception":return`**Throws**${o.name?` \`${o.name}\``:""}${o.description?`
${o.description}`:""}`;case"example":return`**Example**

\`\`\`typelang
${o.description}
\`\`\``;case"deprecated":return`> **Deprecated.** ${o.description}`;case"since":return`*Since ${o.description}*`;case"see":return`**See also:** ${o.description}`;case"typeparam":case"template":return o.name?`- Type parameter \`${o.name}\`: ${o.description}`:"";default:return`**@${o.tag}${o.name?` ${o.name}`:""}**${o.description?`
${o.description}`:""}`}};for(const o of t.tags){if(["param","arg","argument"].includes(o.tag))continue;const l=i(o);l&&n.push(l)}return n.join(`

`)||void 0}function formatDocComment(a){return normalizeDocComment(a).map(e=>`///${e?` ${e}`:""}`).join(`
`)}const STDLIB_MODULES$1=[{id:"Option",name:"Option",category:"Monad",tagline:"Safe optional values without null or undefined exceptions",description:"The Option monad represents an optional value: every Option is either Some and contains a value, or None, and does not. It is the functional alternative to null/undefined pointers.",typeDefinition:`type Option<a> =
  | Some(val: a): Option<a>
  | None: Option<a>`,lawsDoc:{leftIdentity:"flatMap(pure(x), f)  ===  f(x)",rightIdentity:"flatMap(m, pure)  ===  m",associativity:"flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"},doNotationSnippet:`import Option.{ Some, None, getOrElse, map, filter }

let result = do(Option) {
  userId <- Some(42);
  user <- findUserById(userId);
  profile <- user.profile;
  pure profile.email;
}`,typeLangSource:`// Option Module Implementation in TypeLang
module Option {
  export function pure<a>(val: a): Option<a> {
    Some(val)
  }

  export function of<a>(val: a): Option<a> {
    Some(val)
  }

  export function isSome<a>(opt: Option<a>): boolean {
    match (opt) {
      Some(_) => true
      None => false
    }
  }

  export function isNone<a>(opt: Option<a>): boolean {
    match (opt) {
      Some(_) => false
      None => true
    }
  }

  export function getOrElse<a>(opt: Option<a>, defaultVal: a): a {
    match (opt) {
      Some(v) => v
      None => defaultVal
    }
  }

  export function orElse<a>(opt: Option<a>, altOpt: Option<a>): Option<a> {
    match (opt) {
      Some(_) => opt
      None => altOpt
    }
  }

  export function map<a, b>(opt: Option<a>, fn: (x: a) => b): Option<b> {
    match (opt) {
      Some(v) => Some(fn(v))
      None => None
    }
  }

  export function flatMap<a, b>(opt: Option<a>, fn: (x: a) => Option<b>): Option<b> {
    match (opt) {
      Some(v) => fn(v)
      None => None
    }
  }

  export function filter<a>(opt: Option<a>, pred: (x: a) => boolean): Option<a> {
    match (opt) {
      Some(v) => if (pred(v)) Some(v) else None
      None => None
    }
  }

  export function fold<a, b>(opt: Option<a>, defaultVal: b, fn: (x: a) => b): b {
    match (opt) {
      Some(v) => fn(v)
      None => defaultVal
    }
  }

  export function flatten<a>(opt: Option<Option<a>>): Option<a> {
    match (opt) {
      Some(inner) => inner
      None => None
    }
  }

  export function zip<a, b>(optA: Option<a>, optB: Option<b>): Option<(a, b)> {
    match (optA) {
      Some(a) => match (optB) {
        Some(b) => Some((a, b))
        None => None
      }
      None => None
    }
  }

  export function toResult<a, e>(opt: Option<a>, err: e): Result<a, e> {
    match (opt) {
      Some(v) => Ok(v)
      None => Err(err)
    }
  }

  export function contains<a>(opt: Option<a>, elem: a): boolean {
    match (opt) {
      Some(v) => v == elem
      None => false
    }
  }

  export function exists<a>(opt: Option<a>, pred: (x: a) => boolean): boolean {
    match (opt) {
      Some(v) => pred(v)
      None => false
    }
  }

  export function tap<a>(opt: Option<a>, fn: (x: a) => void): Option<a> {
    match (opt) {
      Some(v) => { fn(v); opt }
      None => None
    }
  }
}`,jsSource:`const $Some = (val) => Object.freeze({ $tag: "Some", val, $args: [val] });
const $None = Object.freeze({ $tag: "None", $args: [] });
const $Option = {
  Some: $Some,
  None: $None,
  pure: $Some,
  of: $Some,
  isSome: (opt) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some"),
  isNone: (opt) => Boolean(!opt || typeof opt !== "object" || opt.$tag === "None"),
  getOrElse: (opt, defaultVal) => (opt && typeof opt === "object" && opt.$tag === "Some" ? opt.val : defaultVal),
  map: (opt, fn) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function" ? $Some(fn(opt.val)) : $None),
  flatMap: (opt, fn) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function" ? fn(opt.val) : $None),
  filter: (opt, pred) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof pred === "function" && pred(opt.val) ? opt : $None),
  flatten: (opt) => (opt && typeof opt === "object" && opt.$tag === "Some" ? opt.val : $None),
  zip: (a, b) => (a && typeof a === "object" && a.$tag === "Some" && b && typeof b === "object" && b.$tag === "Some" ? $Some([a.val, b.val]) : $None),
  fromNullable: (v) => (v === null || v === undefined ? $None : $Some(v)),
  fold: (opt, defaultVal, fn) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function" ? fn(opt.val) : defaultVal),
  orElse: (opt, alt) => (opt && typeof opt === "object" && opt.$tag === "Some" ? opt : alt),
  toResult: (opt, err) => (opt && typeof opt === "object" && opt.$tag === "Some" ? $Ok(opt.val) : $Err(err)),
  contains: (opt, elem) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some" && opt.val === elem),
  exists: (opt, pred) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some" && typeof pred === "function" && pred(opt.val)),
  tap: (opt, fn) => { if (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function") fn(opt.val); return opt; }
};`,functions:[{name:"pure",signature:"pure<a>(val: a): Option<a>",description:"Lifts a pure value into an Option by wrapping it with Some(val).",typeLangImpl:"function pure<a>(val: a): Option<a> { Some(val) }",jsImpl:"(val) => $Some(val)",example:"let opt = Option.pure(42) // Some(42)"},{name:"map",signature:"map<a, b>(opt: Option<a>, fn: (x: a) => b): Option<b>",description:"Applies a function to the value inside Some, or returns None unchanged.",typeLangImpl:`function map<a, b>(opt: Option<a>, fn: (x: a) => b): Option<b> {
  match (opt) {
    Some(v) => Some(fn(v))
    None => None
  }
}`,jsImpl:'(opt, fn) => (opt?.$tag === "Some" ? $Some(fn(opt.val)) : $None)',example:"Option.map(Some(10), (x: number) => x * 2) // Some(20)"},{name:"flatMap",signature:"flatMap<a, b>(opt: Option<a>, fn: (x: a) => Option<b>): Option<b>",description:"Sequences two monadic Option computations, propagating None if either fails.",typeLangImpl:`function flatMap<a, b>(opt: Option<a>, fn: (x: a) => Option<b>): Option<b> {
  match (opt) {
    Some(v) => fn(v)
    None => None
  }
}`,jsImpl:'(opt, fn) => (opt?.$tag === "Some" ? fn(opt.val) : $None)',example:"Option.flatMap(Some(10), (x: number) => if (x > 5) Some(x) else None)"},{name:"getOrElse",signature:"getOrElse<a>(opt: Option<a>, defaultVal: a): a",description:"Extracts the value from Some, or returns defaultVal if None.",typeLangImpl:`function getOrElse<a>(opt: Option<a>, defaultVal: a): a {
  match (opt) {
    Some(v) => v
    None => defaultVal
  }
}`,jsImpl:'(opt, defaultVal) => (opt?.$tag === "Some" ? opt.val : defaultVal)',example:"Option.getOrElse(None, 100) // 100"},{name:"filter",signature:"filter<a>(opt: Option<a>, pred: (x: a) => boolean): Option<a>",description:"Retains the value if Some and pred(val) is true, otherwise returns None.",typeLangImpl:`function filter<a>(opt: Option<a>, pred: (x: a) => boolean): Option<a> {
  match (opt) {
    Some(v) => if (pred(v)) Some(v) else None
    None => None
  }
}`,jsImpl:'(opt, pred) => (opt?.$tag === "Some" && pred(opt.val) ? opt : $None)',example:"Option.filter(Some(12), (x: number) => x % 2 == 0) // Some(12)"},{name:"fold",signature:"fold<a, b>(opt: Option<a>, defaultVal: b, fn: (x: a) => b): b",description:"Applies fn if Some, or returns defaultVal if None.",typeLangImpl:`function fold<a, b>(opt: Option<a>, defaultVal: b, fn: (x: a) => b): b {
  match (opt) {
    Some(v) => fn(v)
    None => defaultVal
  }
}`,jsImpl:'(opt, defaultVal, fn) => (opt?.$tag === "Some" ? fn(opt.val) : defaultVal)',example:'Option.fold(Some("hello"), 0, (s: string) => String.len(s)) // 5'}]},{id:"Result",name:"Result",category:"Monad",tagline:"Railway-oriented error handling with explicit failure values",description:"Result is a type used for returning and propagating errors. It has two variants: Ok representing success and containing a value, and Err representing error and containing an error cause.",typeDefinition:`type Result<a, e> =
  | Ok(val: a): Result<a, e>
  | Err(err: e): Result<a, e>`,lawsDoc:{leftIdentity:"flatMap(pure(x), f)  ===  f(x)",rightIdentity:"flatMap(m, pure)  ===  m",associativity:"flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"},doNotationSnippet:`import Result.{ Ok, Err, map, mapError, getOrElse }

function safeCalculate(rawInput: string): Result<number, string> {
  do(Result) {
    num <- parseNumber(rawInput);
    positive <- if (num > 0) Ok(num) else Err("Number must be positive");
    reciprocal <- if (positive != 0) Ok(100 / positive) else Err("Division by zero");
    pure reciprocal * 2;
  }
}`,typeLangSource:`// Result Module Implementation in TypeLang
module Result {
  export function pure<a, e>(val: a): Result<a, e> {
    Ok(val)
  }

  export function of<a, e>(val: a): Result<a, e> {
    Ok(val)
  }

  export function isOk<a, e>(res: Result<a, e>): boolean {
    match (res) {
      Ok(_) => true
      Err(_) => false
    }
  }

  export function isErr<a, e>(res: Result<a, e>): boolean {
    match (res) {
      Ok(_) => false
      Err(_) => true
    }
  }

  export function getOrElse<a, e>(res: Result<a, e>, defaultVal: a): a {
    match (res) {
      Ok(v) => v
      Err(_) => defaultVal
    }
  }

  export function orElse<a, e>(res: Result<a, e>, altRes: Result<a, e>): Result<a, e> {
    match (res) {
      Ok(_) => res
      Err(_) => altRes
    }
  }

  export function map<a, b, e>(res: Result<a, e>, fn: (x: a) => b): Result<b, e> {
    match (res) {
      Ok(v) => Ok(fn(v))
      Err(err) => Err(err)
    }
  }

  export function mapError<a, e, e2>(res: Result<a, e>, fn: (err: e) => e2): Result<a, e2> {
    match (res) {
      Ok(v) => Ok(v)
      Err(err) => Err(fn(err))
    }
  }

  export function flatMap<a, b, e>(res: Result<a, e>, fn: (x: a) => Result<b, e>): Result<b, e> {
    match (res) {
      Ok(v) => fn(v)
      Err(err) => Err(err)
    }
  }

  export function fold<a, e, b>(res: Result<a, e>, onErr: (err: e) => b, onOk: (val: a) => b): b {
    match (res) {
      Ok(v) => onOk(v)
      Err(err) => onErr(err)
    }
  }

  export function toOption<a, e>(res: Result<a, e>): Option<a> {
    match (res) {
      Ok(v) => Some(v)
      Err(_) => None
    }
  }

  export function fromOption<a, e>(opt: Option<a>, err: e): Result<a, e> {
    match (opt) {
      Some(v) => Ok(v)
      None => Err(err)
    }
  }

  export function fromTry<a>(fn: () => a): Result<a, string> {
    // Wrapped with runtime try/catch
    Ok(fn())
  }
}`,jsSource:`const $Ok = (val) => Object.freeze({ $tag: "Ok", val, $args: [val] });
const $Err = (err) => Object.freeze({ $tag: "Err", err, $args: [err] });
const $Result = {
  Ok: $Ok,
  Err: $Err,
  pure: $Ok,
  of: $Ok,
  isOk: (res) => Boolean(res && typeof res === "object" && res.$tag === "Ok"),
  isErr: (res) => Boolean(!res || typeof res !== "object" || res.$tag === "Err"),
  getOrElse: (res, defaultVal) => (res && typeof res === "object" && res.$tag === "Ok" ? res.val : defaultVal),
  map: (res, fn) => (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function" ? $Ok(fn(res.val)) : res),
  mapError: (res, fn) => (res && typeof res === "object" && res.$tag === "Err" && typeof fn === "function" ? $Err(fn(res.err)) : res),
  flatMap: (res, fn) => (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function" ? fn(res.val) : res),
  flatten: (res) => (res && typeof res === "object" && res.$tag === "Ok" ? res.val : res),
  toOption: (res) => (res && typeof res === "object" && res.$tag === "Ok" ? $Some(res.val) : $None),
  fromOption: (opt, err) => (opt && typeof opt === "object" && opt.$tag === "Some" ? $Ok(opt.val) : $Err(err)),
  fold: (res, onErr, onOk) => (res && typeof res === "object" && res.$tag === "Ok" && typeof onOk === "function" ? onOk(res.val) : (typeof onErr === "function" ? onErr(res && res.$tag === "Err" ? res.err : res) : res)),
  orElse: (res, alt) => (res && typeof res === "object" && res.$tag === "Ok" ? res : alt),
  zip: (a, b) => (a && typeof a === "object" && a.$tag === "Ok" && b && typeof b === "object" && b.$tag === "Ok" ? $Ok([a.val, b.val]) : (a && a.$tag === "Err" ? a : b)),
  tap: (res, fn) => { if (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function") fn(res.val); return res; },
  fromTry: (fn) => { try { return $Ok(typeof fn === "function" ? fn() : fn); } catch(e) { return $Err(e?.message || String(e)); } }
};`,functions:[{name:"pure",signature:"pure<a, e>(val: a): Result<a, e>",description:"Lifts a successful value into a Result by wrapping with Ok(val).",typeLangImpl:"function pure<a, e>(val: a): Result<a, e> { Ok(val) }",jsImpl:"(val) => $Ok(val)",example:"let res = Result.pure(200) // Ok(200)"},{name:"map",signature:"map<a, b, e>(res: Result<a, e>, fn: (x: a) => b): Result<b, e>",description:"Transforms the successful Ok value, leaving Err untouched.",typeLangImpl:`function map<a, b, e>(res: Result<a, e>, fn: (x: a) => b): Result<b, e> {
  match (res) {
    Ok(v) => Ok(fn(v))
    Err(e) => Err(e)
  }
}`,jsImpl:'(res, fn) => (res?.$tag === "Ok" ? $Ok(fn(res.val)) : res)',example:"Result.map(Ok(10), (x: number) => x * 5) // Ok(50)"},{name:"mapError",signature:"mapError<a, e, e2>(res: Result<a, e>, fn: (err: e) => e2): Result<a, e2>",description:"Transforms the error inside Err, leaving Ok untouched.",typeLangImpl:`function mapError<a, e, e2>(res: Result<a, e>, fn: (err: e) => e2): Result<a, e2> {
  match (res) {
    Ok(v) => Ok(v)
    Err(e) => Err(fn(e))
  }
}`,jsImpl:'(res, fn) => (res?.$tag === "Err" ? $Err(fn(res.err)) : res)',example:'Result.mapError(Err(404), (code: number) => concat("HTTP Error ", to_string(code)))'},{name:"flatMap",signature:"flatMap<a, b, e>(res: Result<a, e>, fn: (x: a) => Result<b, e>): Result<b, e>",description:"Sequences fallible operations. If Ok, calls fn with the value; if Err, stops early.",typeLangImpl:`function flatMap<a, b, e>(res: Result<a, e>, fn: (x: a) => Result<b, e>): Result<b, e> {
  match (res) {
    Ok(v) => fn(v)
    Err(e) => Err(e)
  }
}`,jsImpl:'(res, fn) => (res?.$tag === "Ok" ? fn(res.val) : res)',example:'Result.flatMap(safeParse("10"), (n: number) => safeDivide(100, n))'},{name:"fold",signature:"fold<a, e, b>(res: Result<a, e>, onErr: (err: e) => b, onOk: (val: a) => b): b",description:"Folds a Result into a single output by handling both Ok and Err cases.",typeLangImpl:`function fold<a, e, b>(res: Result<a, e>, onErr: (err: e) => b, onOk: (val: a) => b): b {
  match (res) {
    Ok(v) => onOk(v)
    Err(e) => onErr(e)
  }
}`,jsImpl:'(res, onErr, onOk) => (res?.$tag === "Ok" ? onOk(res.val) : onErr(res.err))',example:"Result.fold(res, (err: string) => 0, (val: number) => val)"}]},{id:"Either",name:"Either",category:"Monad",tagline:"Disjoint union representing two possible types (Left or Right)",description:"The Either type represents values with two possibilities: Left(a) or Right(b). By convention, Right is used to contain successful values, and Left contains error or auxiliary data.",typeDefinition:`type Either<l, r> =
  | Left(left: l): Either<l, r>
  | Right(right: r): Either<l, r>`,lawsDoc:{leftIdentity:"flatMap(pure(x), f)  ===  f(x)",rightIdentity:"flatMap(m, pure)  ===  m",associativity:"flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"},doNotationSnippet:`import Either.{ Left, Right, map, fold }

let computation = do(Either) {
  valA <- Right(10);
  valB <- Right(20);
  pure valA + valB;
}`,typeLangSource:`// Either Module Implementation in TypeLang
module Either {
  export function pure<l, r>(val: r): Either<l, r> {
    Right(val)
  }

  export function of<l, r>(val: r): Either<l, r> {
    Right(val)
  }

  export function left<l, r>(lVal: l): Either<l, r> {
    Left(lVal)
  }

  export function right<l, r>(rVal: r): Either<l, r> {
    Right(rVal)
  }

  export function isRight<l, r>(e: Either<l, r>): boolean {
    match (e) {
      Right(_) => true
      Left(_) => false
    }
  }

  export function isLeft<l, r>(e: Either<l, r>): boolean {
    match (e) {
      Right(_) => false
      Left(_) => true
    }
  }

  export function getOrElse<l, r>(e: Either<l, r>, defaultVal: r): r {
    match (e) {
      Right(v) => v
      Left(_) => defaultVal
    }
  }

  export function map<l, r, r2>(e: Either<l, r>, fn: (x: r) => r2): Either<l, r2> {
    match (e) {
      Right(v) => Right(fn(v))
      Left(lVal) => Left(lVal)
    }
  }

  export function mapLeft<l, r, l2>(e: Either<l, r>, fn: (err: l) => l2): Either<l2, r> {
    match (e) {
      Right(v) => Right(v)
      Left(lVal) => Left(fn(lVal))
    }
  }

  export function flatMap<l, r, r2>(e: Either<l, r>, fn: (x: r) => Either<l, r2>): Either<l, r2> {
    match (e) {
      Right(v) => fn(v)
      Left(lVal) => Left(lVal)
    }
  }

  export function fold<l, r, b>(e: Either<l, r>, onLeft: (l: l) => b, onRight: (r: r) => b): b {
    match (e) {
      Right(v) => onRight(v)
      Left(lVal) => onLeft(lVal)
    }
  }

  export function swap<l, r>(e: Either<l, r>): Either<r, l> {
    match (e) {
      Right(v) => Left(v)
      Left(lVal) => Right(lVal)
    }
  }
}`,jsSource:`const $Left = (left) => Object.freeze({ $tag: "Left", left, $args: [left] });
const $Right = (right) => Object.freeze({ $tag: "Right", right, $args: [right] });
const $Either = {
  Left: $Left,
  Right: $Right,
  pure: $Right,
  of: $Right,
  left: $Left,
  right: $Right,
  isLeft: (e) => Boolean(e && typeof e === "object" && e.$tag === "Left"),
  isRight: (e) => Boolean(e && typeof e === "object" && e.$tag === "Right"),
  getOrElse: (e, defaultVal) => (e && typeof e === "object" && e.$tag === "Right" ? e.right : defaultVal),
  map: (e, fn) => (e && typeof e === "object" && e.$tag === "Right" && typeof fn === "function" ? $Right(fn(e.right)) : e),
  mapLeft: (e, fn) => (e && typeof e === "object" && e.$tag === "Left" && typeof fn === "function" ? $Left(fn(e.left)) : e),
  flatMap: (e, fn) => (e && typeof e === "object" && e.$tag === "Right" && typeof fn === "function" ? fn(e.right) : e),
  fold: (e, onLeft, onRight) => (e && typeof e === "object" && e.$tag === "Right" && typeof onRight === "function" ? onRight(e.right) : (typeof onLeft === "function" ? onLeft(e && e.$tag === "Left" ? e.left : e) : e)),
  swap: (e) => (e && typeof e === "object" && e.$tag === "Right" ? $Left(e.right) : (e && e.$tag === "Left" ? $Right(e.left) : e)),
  toOption: (e) => (e && typeof e === "object" && e.$tag === "Right" ? $Some(e.right) : $None),
  toResult: (e) => (e && typeof e === "object" && e.$tag === "Right" ? $Ok(e.right) : $Err(e?.left)),
  fromResult: (res) => (res && typeof res === "object" && res.$tag === "Ok" ? $Right(res.val) : $Left(res?.err))
};`,functions:[{name:"pure",signature:"pure<l, r>(val: r): Either<l, r>",description:"Lifts a value into Right(val).",typeLangImpl:"function pure<l, r>(val: r): Either<l, r> { Right(val) }",jsImpl:"(val) => $Right(val)",example:"Either.pure(42) // Right(42)"},{name:"swap",signature:"swap<l, r>(e: Either<l, r>): Either<r, l>",description:"Swaps Left to Right and Right to Left.",typeLangImpl:`function swap<l, r>(e: Either<l, r>): Either<r, l> {
  match (e) {
    Right(r) => Left(r)
    Left(l) => Right(l)
  }
}`,jsImpl:'(e) => (e.$tag === "Right" ? $Left(e.right) : $Right(e.left))',example:'Either.swap(Left("err")) // Right("err")'}]},{id:"Reader",name:"Reader",category:"Monad",tagline:"Dependency injection & environment propagation without global state",description:"The Reader monad represents a computation that can read values from a shared environment r, pass it implicitly, and compute a result a.",typeDefinition:`type Reader<r, a> = {
  run: (environment: r) => a
}`,lawsDoc:{leftIdentity:"flatMap(pure(x), f)  ===  f(x)",rightIdentity:"flatMap(m, pure)  ===  m",associativity:"flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"},doNotationSnippet:`import Reader.{ ask, asks, run, local }

type Config = { host: string, port: number }

let buildUrl = do(Reader) {
  cfg <- Reader.ask();
  pure concat("https://", concat(cfg.host, concat(":", to_string(cfg.port))));
}

let endpoint = Reader.run(buildUrl, { host: "localhost", port: 8080 })`,typeLangSource:`// Reader Module Implementation in TypeLang
module Reader {
  export function pure<r, a>(val: a): Reader<r, a> {
    { run: (_env: r) => val }
  }

  export function ask<r>(): Reader<r, r> {
    { run: (env: r) => env }
  }

  export function asks<r, a>(fn: (env: r) => a): Reader<r, a> {
    { run: (env: r) => fn(env) }
  }

  export function run<r, a>(reader: Reader<r, a>, environment: r): a {
    reader.run(environment)
  }

  export function map<r, a, b>(reader: Reader<r, a>, fn: (x: a) => b): Reader<r, b> {
    { run: (env: r) => fn(reader.run(env)) }
  }

  export function flatMap<r, a, b>(reader: Reader<r, a>, fn: (x: a) => Reader<r, b>): Reader<r, b> {
    { run: (env: r) => {
        let val = reader.run(env);
        let nextReader = fn(val);
        nextReader.run(env)
      }
    }
  }

  export function local<r, r2, a>(reader: Reader<r, a>, transformEnv: (env: r2) => r): Reader<r2, a> {
    { run: (env: r2) => reader.run(transformEnv(env)) }
  }
}`,jsSource:`const $wrapReader = (fn) => ({ $tag: "Reader", run: typeof fn === "function" ? fn : (_r) => fn });
const $Reader = {
  pure: (v) => $wrapReader((_r) => v),
  of: (v) => $wrapReader((_r) => v),
  ask: () => $wrapReader((r) => r),
  asks: (fn) => $wrapReader((r) => typeof fn === "function" ? fn(r) : r),
  run: (reader, env) => (reader && typeof reader.run === "function" ? reader.run(env) : reader),
  map: (reader, fn) => $wrapReader((r) => { const v = reader && typeof reader.run === "function" ? reader.run(r) : reader; return typeof fn === "function" ? fn(v) : v; }),
  flatMap: (reader, fn) => $wrapReader((r) => { const v = reader && typeof reader.run === "function" ? reader.run(r) : reader; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run(r) : next; }),
  local: (reader, transformEnv) => $wrapReader((r) => { const tr = typeof transformEnv === "function" ? transformEnv(r) : r; return reader && typeof reader.run === "function" ? reader.run(tr) : reader; })
};`,functions:[{name:"ask",signature:"ask<r>(): Reader<r, r>",description:"Retrieves the current ambient environment.",typeLangImpl:"function ask<r>(): Reader<r, r> { { run: (env: r) => env } }",jsImpl:"() => $wrapReader((r) => r)",example:"Reader.ask()"},{name:"asks",signature:"asks<r, a>(fn: (env: r) => a): Reader<r, a>",description:"Projects a property or function out of the environment.",typeLangImpl:"function asks<r, a>(fn: (env: r) => a): Reader<r, a> { { run: (env: r) => fn(env) } }",jsImpl:"(fn) => $wrapReader((r) => fn(r))",example:"Reader.asks((c: Config) => c.port)"},{name:"run",signature:"run<r, a>(reader: Reader<r, a>, environment: r): a",description:"Executes the Reader computation by supplying the environment.",typeLangImpl:"function run<r, a>(reader: Reader<r, a>, environment: r): a { reader.run(environment) }",jsImpl:"(reader, env) => reader.run(env)",example:'Reader.run(myReader, { token: "abc" })'}]},{id:"Writer",name:"Writer",category:"Monad",tagline:"Pure functional accumulator and audit trail logging",description:"The Writer monad allows accumulating an auxiliary log or monoid alongside a computed result, without mutating any global state.",typeDefinition:`type Writer<w, a> = {
  val: a,
  log: [w],
  run: () => (a, [w])
}`,lawsDoc:{leftIdentity:"flatMap(pure(x), f)  ===  f(x)",rightIdentity:"flatMap(m, pure)  ===  m",associativity:"flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"},doNotationSnippet:`import Writer.{ tell, run }

let loggedCompute = do(Writer) {
  _ <- Writer.tell("Parsing parameters");
  let val = 42;
  _ <- Writer.tell("Calculated master answer");
  pure val;
}

let result = Writer.run(loggedCompute)
let val = result[0]
let logs = result[1]`,typeLangSource:`// Writer Module Implementation in TypeLang
module Writer {
  export function pure<w, a>(val: a): Writer<w, a> {
    { val: val, log: [] }
  }

  export function tell<w>(entry: w): Writer<w, void> {
    { val: (), log: [entry] }
  }

  export function run<w, a>(writer: Writer<w, a>): (a, [w]) {
    (writer.val, writer.log)
  }

  export function value<w, a>(writer: Writer<w, a>): a {
    writer.val
  }

  export function log<w, a>(writer: Writer<w, a>): [w] {
    writer.log
  }

  export function map<w, a, b>(writer: Writer<w, a>, fn: (x: a) => b): Writer<w, b> {
    { val: fn(writer.val), log: writer.log }
  }

  export function flatMap<w, a, b>(writer: Writer<w, a>, fn: (x: a) => Writer<w, b>): Writer<w, b> {
    let next = fn(writer.val);
    { val: next.val, log: Array.concat(writer.log, next.log) }
  }
}`,jsSource:`const $wrapWriter = (val, log = []) => ({ $tag: "Writer", val, log: Array.isArray(log) ? log : [log], run: () => [val, Array.isArray(log) ? log : [log]] });
const $Writer = {
  pure: (v) => $wrapWriter(v, []),
  of: (v) => $wrapWriter(v, []),
  tell: (entry) => $wrapWriter(null, [entry]),
  run: (w) => (w && typeof w.run === "function" ? w.run() : [w?.val, w?.log || []]),
  value: (w) => (w ? w.val : null),
  log: (w) => (w && Array.isArray(w.log) ? w.log : []),
  map: (w, fn) => $wrapWriter(typeof fn === "function" ? fn(w?.val) : w?.val, w?.log || []),
  flatMap: (w, fn) => { const next = typeof fn === "function" ? fn(w?.val) : null; return $wrapWriter(next?.val, [...(w?.log || []), ...(next?.log || [])]); },
  listen: (w) => $wrapWriter([w?.val, w?.log || []], w?.log || [])
};`,functions:[{name:"tell",signature:"tell<w>(entry: w): Writer<w, void>",description:"Appends a single log entry into the Writer accumulator.",typeLangImpl:"function tell<w>(entry: w): Writer<w, void> { { val: (), log: [entry] } }",jsImpl:"(entry) => $wrapWriter(null, [entry])",example:'Writer.tell("Step 1 done")'},{name:"run",signature:"run<w, a>(writer: Writer<w, a>): (a, [w])",description:"Executes the Writer computation and returns a tuple of (value, logs).",typeLangImpl:"function run<w, a>(writer: Writer<w, a>): (a, [w]) { (writer.val, writer.log) }",jsImpl:"(w) => [w.val, w.log]",example:"let res = Writer.run(w)"}]},{id:"State",name:"State",category:"Monad",tagline:"Pure stateful computation without mutable variables",description:"The State monad models stateful computations as pure functions of type (s: State) => (result: a, nextState: s).",typeDefinition:`type State<s, a> = {
  run: (initialState: s) => (a, s)
}`,lawsDoc:{leftIdentity:"flatMap(pure(x), f)  ===  f(x)",rightIdentity:"flatMap(m, pure)  ===  m",associativity:"flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"},doNotationSnippet:`import State.{ get, set, modify, run }

let counterPipeline = do(State) {
  count <- State.get();
  _ <- State.set(count + 1);
  _ <- State.modify((s: number) => s * 10);
  pure count;
}

let result = State.run(counterPipeline, 5) // (5, 60)`,typeLangSource:`// State Module Implementation in TypeLang
module State {
  export function pure<s, a>(val: a): State<s, a> {
    { run: (s: s) => (val, s) }
  }

  export function get<s>(): State<s, s> {
    { run: (s: s) => (s, s) }
  }

  export function set<s>(newState: s): State<s, void> {
    { run: (_s: s) => ((), newState) }
  }

  export function modify<s>(fn: (s: s) => s): State<s, void> {
    { run: (s: s) => ((), fn(s)) }
  }

  export function run<s, a>(st: State<s, a>, initialState: s): (a, s) {
    st.run(initialState)
  }

  export function evalState<s, a>(st: State<s, a>, initialState: s): a {
    let r = st.run(initialState);
    r[0]
  }

  export function execState<s, a>(st: State<s, a>, initialState: s): s {
    let r = st.run(initialState);
    r[1]
  }

  export function map<s, a, b>(st: State<s, a>, fn: (x: a) => b): State<s, b> {
    { run: (s: s) => {
        let res = st.run(s);
        (fn(res[0]), res[1])
      }
    }
  }

  export function flatMap<s, a, b>(st: State<s, a>, fn: (x: a) => State<s, b>): State<s, b> {
    { run: (s: s) => {
        let res = st.run(s);
        let nextStateMonad = fn(res[0]);
        nextStateMonad.run(res[1])
      }
    }
  }
}`,jsSource:`const $wrapState = (fn) => ({ $tag: "State", run: typeof fn === "function" ? fn : (s) => [null, s] });
const $State = {
  pure: (v) => $wrapState((s) => [v, s]),
  of: (v) => $wrapState((s) => [v, s]),
  get: () => $wrapState((s) => [s, s]),
  set: (ns) => $wrapState((_s) => [null, ns]),
  modify: (fn) => $wrapState((s) => [null, typeof fn === "function" ? fn(s) : s]),
  run: (st, s) => (st && typeof st.run === "function" ? st.run(s) : [null, s]),
  evalState: (st, s) => { const r = st && typeof st.run === "function" ? st.run(s) : [null, s]; return Array.isArray(r) ? r[0] : r; },
  execState: (st, s) => { const r = st && typeof st.run === "function" ? st.run(s) : [null, s]; return Array.isArray(r) ? r[1] : r; },
  map: (st, fn) => $wrapState((s) => { const [v, ns] = st && typeof st.run === "function" ? st.run(s) : [null, s]; return [typeof fn === "function" ? fn(v) : v, ns]; }),
  flatMap: (st, fn) => $wrapState((s) => { const [v, ns] = st && typeof st.run === "function" ? st.run(s) : [null, s]; const next = typeof fn === "function" ? fn(v) : null; return next && typeof next.run === "function" ? next.run(ns) : [null, ns]; })
};`,functions:[{name:"get",signature:"get<s>(): State<s, s>",description:"Fetches the current state value.",typeLangImpl:"function get<s>(): State<s, s> { { run: (s: s) => (s, s) } }",jsImpl:"() => $wrapState((s) => [s, s])",example:"State.get()"},{name:"set",signature:"set<s>(newState: s): State<s, void>",description:"Replaces the existing state with newState.",typeLangImpl:"function set<s>(newState: s): State<s, void> { { run: (_s: s) => ((), newState) } }",jsImpl:"(ns) => $wrapState((_s) => [null, ns])",example:"State.set(100)"},{name:"modify",signature:"modify<s>(fn: (s: s) => s): State<s, void>",description:"Modifies the current state with a transition function fn.",typeLangImpl:"function modify<s>(fn: (s: s) => s): State<s, void> { { run: (s: s) => ((), fn(s)) } }",jsImpl:"(fn) => $wrapState((s) => [null, fn(s)])",example:"State.modify((s: number) => s + 1)"}]},{id:"Task",name:"Task",category:"Monad",tagline:"Lazy and composable asynchronous computations",description:"The Task monad encapsulates lazy computations that produce a value when executed via Task.run().",typeDefinition:`type Task<a> = {
  run: () => a
}`,lawsDoc:{leftIdentity:"flatMap(pure(x), f)  ===  f(x)",rightIdentity:"flatMap(m, pure)  ===  m",associativity:"flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"},doNotationSnippet:`import Task.{ succeed, delay, run }

let asyncPipeline = do(Task) {
  raw <- Task.succeed(100);
  computed <- Task.delay(() => raw * 2);
  pure computed + 50;
}

let result = Task.run(asyncPipeline) // 250`,typeLangSource:`// Task Module Implementation in TypeLang
module Task {
  export function pure<a>(val: a): Task<a> {
    { run: () => val }
  }

  export function succeed<a>(val: a): Task<a> {
    { run: () => val }
  }

  export function delay<a>(fn: () => a): Task<a> {
    { run: fn }
  }

  export function run<a>(task: Task<a>): a {
    task.run()
  }

  export function map<a, b>(task: Task<a>, fn: (x: a) => b): Task<b> {
    { run: () => fn(task.run()) }
  }

  export function flatMap<a, b>(task: Task<a>, fn: (x: a) => Task<b>): Task<b> {
    { run: () => {
        let val = task.run();
        let nextTask = fn(val);
        nextTask.run()
      }
    }
  }
}`,jsSource:`const $wrapTask = (fn) => ({ $tag: "Task", run: typeof fn === "function" ? fn : () => fn });
const $Task = {
  pure: (v) => $wrapTask(() => v),
  of: (v) => $wrapTask(() => v),
  succeed: (v) => $wrapTask(() => v),
  delay: (fn) => $wrapTask(typeof fn === "function" ? fn : () => fn),
  run: (t) => (t && typeof t.run === "function" ? t.run() : t),
  map: (t, fn) => $wrapTask(() => { const v = t && typeof t.run === "function" ? t.run() : t; return typeof fn === "function" ? fn(v) : v; }),
  flatMap: (t, fn) => $wrapTask(() => { const v = t && typeof t.run === "function" ? t.run() : t; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run() : next; })
};`,functions:[{name:"succeed",signature:"succeed<a>(val: a): Task<a>",description:"Creates a Task that immediately resolves to val upon execution.",typeLangImpl:"function succeed<a>(val: a): Task<a> { { run: () => val } }",jsImpl:"(val) => $wrapTask(() => val)",example:'Task.succeed("data")'},{name:"run",signature:"run<a>(task: Task<a>): a",description:"Executes the task computation and returns the computed result.",typeLangImpl:"function run<a>(task: Task<a>): a { task.run() }",jsImpl:"(task) => task.run()",example:"Task.run(t)"}]},{id:"IO",name:"IO",category:"Monad",tagline:"Deferred input/output and referentially transparent side-effects",description:"The IO monad represents deferred I/O operations, ensuring pure functional code remains free of unmanaged side effects until IO.run() is invoked.",typeDefinition:`type IO<a> = {
  run: () => a
}`,lawsDoc:{leftIdentity:"flatMap(pure(x), f)  ===  f(x)",rightIdentity:"flatMap(m, pure)  ===  m",associativity:"flatMap(flatMap(m, f), g)  ===  flatMap(m, (x) => flatMap(f(x), g))"},doNotationSnippet:`import IO.{ println, delay, run }

let program = do(IO) {
  _ <- IO.println("Starting application...");
  time <- IO.delay(() => Date.now());
  _ <- IO.println(concat("Current timestamp: ", to_string(time)));
  pure 0;
}

IO.run(program)`,typeLangSource:`// IO Module Implementation in TypeLang
module IO {
  export function pure<a>(val: a): IO<a> {
    { run: () => val }
  }

  export function delay<a>(fn: () => a): IO<a> {
    { run: fn }
  }

  export function run<a>(io: IO<a>): a {
    io.run()
  }

  export function println(msg: string): IO<void> {
    { run: () => println(msg) }
  }

  export function map<a, b>(io: IO<a>, fn: (x: a) => b): IO<b> {
    { run: () => fn(io.run()) }
  }

  export function flatMap<a, b>(io: IO<a>, fn: (x: a) => IO<b>): IO<b> {
    { run: () => {
        let val = io.run();
        let nextIO = fn(val);
        nextIO.run()
      }
    }
  }
}`,jsSource:`const $wrapIO = (comp) => ({ $tag: "IO", run: typeof comp === "function" ? comp : () => comp });
const $IO = {
  pure: (v) => $wrapIO(() => v),
  of: (v) => $wrapIO(() => v),
  delay: (fn) => $wrapIO(typeof fn === "function" ? fn : () => fn),
  map: (io, fn) => $wrapIO(() => { const v = io && typeof io.run === "function" ? io.run() : io; return typeof fn === "function" ? fn(v) : v; }),
  flatMap: (io, fn) => $wrapIO(() => { const v = io && typeof io.run === "function" ? io.run() : io; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run() : next; }),
  run: (io) => (io && typeof io.run === "function" ? io.run() : io),
  println: (msg) => $wrapIO(() => console.log(String(msg)))
};`,functions:[{name:"println",signature:"println(msg: string): IO<void>",description:"Creates a deferred IO operation to print a string message to console.",typeLangImpl:"function println(msg: string): IO<void> { { run: () => println(msg) } }",jsImpl:"(msg) => $wrapIO(() => console.log(String(msg)))",example:'IO.println("Hello World")'},{name:"run",signature:"run<a>(io: IO<a>): a",description:"Executes the IO action, performing all deferred side effects.",typeLangImpl:"function run<a>(io: IO<a>): a { io.run() }",jsImpl:"(io) => io.run()",example:"IO.run(action)"}]},{id:"Array",name:"Array",category:"Core",tagline:"Standard array and list manipulation utilities",description:"High-performance collection methods for arrays including immutable transformation, mapping, filtering, reducing, slicing, and concatenating.",typeDefinition:"type Array<a> = [a]",typeLangSource:`module Array {
  export extern function len<a>(arr: [a]): number
  export extern function map<a, b>(arr: [a], fn: (elem: a) => b): [b]
  export extern function filter<a>(arr: [a], pred: (elem: a) => boolean): [a]
  export extern function reduce<a, acc>(arr: [a], initial: acc, fn: (accumulator: acc, elem: a) => acc): acc
  export extern function push<a>(arr: [a], elem: a): [a]
  export extern function slice<a>(arr: [a], start: number, end: number): [a]
  export extern function concat<a>(a: [a], b: [a]): [a]
  export extern function join(arr: [string], separator: string): string
}`,jsSource:`const $Array = {
  len: (arr) => Array.isArray(arr) ? arr.length : 0,
  map: (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.map(fn) : [],
  filter: (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.filter(fn) : [],
  reduce: (arr, init, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.reduce(fn, init) : init,
  push: (arr, elem) => Array.isArray(arr) ? [...arr, elem] : [elem],
  slice: (arr, start, end) => Array.isArray(arr) ? arr.slice(start, end) : [],
  concat: (a, b) => Array.isArray(a) && Array.isArray(b) ? a.concat(b) : [],
  join: (arr, sep) => Array.isArray(arr) ? arr.join(sep) : ""
};`,functions:[{name:"len",signature:"len<a>(arr: [a]): number",description:"Returns the number of elements in an array.",typeLangImpl:"extern function len<a>(arr: [a]): number",jsImpl:"(arr) => arr.length",example:"Array.len([1, 2, 3]) // 3"},{name:"map",signature:"map<a, b>(arr: [a], fn: (x: a) => b): [b]",description:"Creates a new array by applying fn to every element.",typeLangImpl:"extern function map<a, b>(arr: [a], fn: (x: a) => b): [b]",jsImpl:"(arr, fn) => arr.map(fn)",example:"Array.map([1, 2, 3], (x: number) => x * 2)"},{name:"filter",signature:"filter<a>(arr: [a], pred: (x: a) => boolean): [a]",description:"Filters array elements matching predicate pred.",typeLangImpl:"extern function filter<a>(arr: [a], pred: (x: a) => boolean): [a]",jsImpl:"(arr, pred) => arr.filter(pred)",example:"Array.filter([1, 2, 3, 4], (x: number) => x % 2 == 0)"},{name:"reduce",signature:"reduce<a, acc>(arr: [a], init: acc, fn: (acc: acc, x: a) => acc): acc",description:"Reduces array to a single value using accumulator fn.",typeLangImpl:"extern function reduce<a, acc>(arr: [a], init: acc, fn: (acc: acc, x: a) => acc): acc",jsImpl:"(arr, init, fn) => arr.reduce(fn, init)",example:"Array.reduce([1, 2, 3], 0, (acc: number, x: number) => acc + x)"}]},{id:"String",name:"String",category:"Core",tagline:"Text manipulation, parsing, and substring operations",description:"Standard string utilities for computing string length, extracting substrings, splitting by delimiters, and parsing numbers.",typeDefinition:"type String = string",typeLangSource:`module String {
  export extern function len(s: string): number
  export extern function slice(s: string, start: number, end: number): string
  export extern function split(s: string, delimiter: string): [string]
  export extern function contains(s: string, substr: string): boolean
  export extern function parseInt(s: string): number
  export extern function parseFloat(s: string): number
}`,jsSource:`const $String = {
  len: (s) => String(s).length,
  slice: (s, start, end) => String(s).slice(start, end),
  split: (s, delim) => String(s).split(delim),
  contains: (s, sub) => String(s).includes(sub),
  parseInt: (s) => Number.parseInt(String(s), 10),
  parseFloat: (s) => Number.parseFloat(String(s))
};`,functions:[{name:"len",signature:"len(s: string): number",description:"Returns the character length of a string.",typeLangImpl:"extern function len(s: string): number",jsImpl:"(s) => String(s).length",example:'String.len("hello") // 5'},{name:"split",signature:"split(s: string, delimiter: string): [string]",description:"Splits a string into a list of substrings separated by delimiter.",typeLangImpl:"extern function split(s: string, delimiter: string): [string]",jsImpl:"(s, delim) => String(s).split(delim)",example:'String.split("a,b,c", ",") // ["a", "b", "c"]'},{name:"parseFloat",signature:"parseFloat(s: string): number",description:"Parses a string into a floating-point number.",typeLangImpl:"extern function parseFloat(s: string): number",jsImpl:"(s) => Number.parseFloat(String(s))",example:'String.parseFloat("3.14159") // 3.14159'}]},{id:"Math",name:"Math",category:"Core",tagline:"Standard mathematical and trigonometric functions",description:"Full suite of math operations: power, root, trigonometric functions, rounding, bitwise operations, and constants like PI.",typeDefinition:"module Math",typeLangSource:`module Math {
  export extern function sqrt(x: number): number
  export extern function abs(x: number): number
  export extern function floor(x: number): number
  export extern function ceil(x: number): number
  export extern function round(x: number): number
  export extern function min(a: number, b: number): number
  export extern function max(a: number, b: number): number
  export extern function pow(base: number, exp: number): number
  export extern function random(): number
  export extern function cos(rad: number): number
  export extern function sin(rad: number): number
  export extern function atan2(y: number, x: number): number
  export extern function log(x: number): number
  export extern function bitwise_and(a: number, b: number): number
  export extern function bitwise_or(a: number, b: number): number
  export extern function bitwise_xor(a: number, b: number): number
  export extern function bitwise_not(x: number): number
  export extern function bitwise_shl(a: number, b: number): number
  export extern function bitwise_shr(a: number, b: number): number
  export let PI: number = 3.141592653589793
}`,jsSource:`const $Math = {
  sqrt: Math.sqrt,
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
  random: Math.random,
  cos: Math.cos,
  sin: Math.sin,
  atan2: Math.atan2,
  log: Math.log,
  bitwise_and: (a, b) => Number(a) & Number(b),
  bitwise_or: (a, b) => Number(a) | Number(b),
  bitwise_xor: (a, b) => Number(a) ^ Number(b),
  bitwise_not: (x) => ~Number(x),
  bitwise_shl: (a, b) => Number(a) << Number(b),
  bitwise_shr: (a, b) => Number(a) >> Number(b),
  PI: Math.PI
};`,functions:[{name:"sqrt",signature:"sqrt(x: number): number",description:"Returns the square root of a number.",typeLangImpl:"extern function sqrt(x: number): number",jsImpl:"Math.sqrt",example:"Math.sqrt(16) // 4"},{name:"pow",signature:"pow(base: number, exp: number): number",description:"Returns base raised to the power of exp.",typeLangImpl:"extern function pow(base: number, exp: number): number",jsImpl:"Math.pow",example:"Math.pow(2, 8) // 256"},{name:"sin",signature:"sin(rad: number): number",description:"Returns the sine of an angle in radians.",typeLangImpl:"extern function sin(rad: number): number",jsImpl:"Math.sin",example:"Math.sin(Math.PI / 2) // 1"}]},{id:"Setoid",name:"Setoid",category:"Algebraic",tagline:"Equivalence relation abstraction for deep structural equality comparison",description:"The Setoid abstraction represents data types with an equivalence relation satisfying reflexivity, symmetry, and transitivity.",typeDefinition:"type Setoid<a> = { equals: (x: a, y: a) => boolean }",lawsDoc:{leftIdentity:"equals(a, a) === true (Reflexivity)",rightIdentity:"equals(a, b) === equals(b, a) (Symmetry)",associativity:"if equals(a, b) && equals(b, c) then equals(a, c) (Transitivity)"},typeLangSource:`module Setoid {
  export function equals<a, b>(a: a, b: b): boolean
  export function notEquals<a, b>(a: a, b: b): boolean
  export function fromEquals<a>(eqFn: (x: a, y: a) => boolean): Setoid<a>
  export function contramap<a, b>(s: Setoid<b>, fn: (x: a) => b): Setoid<a>
}`,jsSource:`const $Setoid = {
  equals: (a, b) => $deepEquals(a, b),
  notEquals: (a, b) => !$deepEquals(a, b),
  fromEquals: (eqFn) => ({ equals: eqFn }),
  contramap: (setoid, fn) => ({ equals: (x, y) => setoid.equals(fn(x), fn(y)) })
};`,functions:[{name:"equals",signature:"equals<a, b>(a: a, b: b): boolean",description:"Deep structural equality check across primitives, records, tuples, ADTs, and arrays.",typeLangImpl:"extern function equals<a, b>(a: a, b: b): boolean",jsImpl:"(a, b) => $deepEquals(a, b)",example:"Setoid.equals([1, 2, 3], [1, 2, 3]) // true"},{name:"notEquals",signature:"notEquals<a, b>(a: a, b: b): boolean",description:"Negated equality comparison check.",typeLangImpl:"extern function notEquals<a, b>(a: a, b: b): boolean",jsImpl:"(a, b) => !$deepEquals(a, b)",example:'Setoid.notEquals("hello", "world") // true'},{name:"contramap",signature:"contramap<a, b>(setoid: Setoid<b>, fn: (x: a) => b): Setoid<a>",description:"Derives a Setoid<a> from a Setoid<b> and a mapping function f: a -> b.",typeLangImpl:"function contramap<a, b>(s: Setoid<b>, fn: (x: a) => b): Setoid<a>",jsImpl:"(setoid, fn) => ({ equals: (x, y) => setoid.equals(fn(x), fn(y)) })",example:"let byId = Setoid.contramap(Setoid, (user) => user.id)"}]},{id:"Ord",name:"Ord",category:"Algebraic",tagline:"Total ordering and comparison abstraction for sorting, clamping, and bounds",description:"The Ord abstraction extends Setoid with total ordering relationships (Less, Equal, Greater).",typeDefinition:`type Ordering = Less | Equal | Greater
type Ord<a> = { compare: (x: a, y: a) => Ordering }`,typeLangSource:`module Ord {
  export function compare<a>(a: a, b: a): Ordering
  export function min<a>(a: a, b: a): a
  export function max<a>(a: a, b: a): a
  export function clamp<a>(val: a, minVal: a, maxVal: a): a
  export function between<a>(val: a, minVal: a, maxVal: a): boolean
  export function isLess<a>(a: a, b: a): boolean
  export function isGreater<a>(a: a, b: a): boolean
  export function isEqual<a>(a: a, b: a): boolean
  export function contramap<a, b>(ordB: Ord<b>, fn: (x: a) => b): Ord<a>
  export function reverse<a>(ord: Ord<a>): Ord<a>
}`,jsSource:`const $Ord = {
  compare: (a, b) => $compareVals(a, b),
  min: (a, b) => ($compareVals(a, b) === $OrderingLess ? a : b),
  max: (a, b) => ($compareVals(a, b) === $OrderingGreater ? a : b),
  clamp: (val, minVal, maxVal) => ($compareVals(val, minVal) === $OrderingLess ? minVal : ($compareVals(val, maxVal) === $OrderingGreater ? maxVal : val)),
  between: (val, minVal, maxVal) => ($compareVals(val, minVal) !== $OrderingLess && $compareVals(val, maxVal) !== $OrderingGreater),
  reverse: (ord) => ({ compare: (x, y) => ord.compare(y, x) })
};`,functions:[{name:"compare",signature:"compare<a>(a: a, b: a): Ordering",description:"Compares two values returning Less, Equal, or Greater.",typeLangImpl:"extern function compare<a>(a: a, b: a): Ordering",jsImpl:"(a, b) => $compareVals(a, b)",example:"Ord.compare(10, 20) // Less"},{name:"clamp",signature:"clamp<a>(val: a, minVal: a, maxVal: a): a",description:"Restricts a value within a lower and upper bound.",typeLangImpl:"function clamp<a>(val: a, minVal: a, maxVal: a): a",jsImpl:"(val, minVal, maxVal) => ...",example:"Ord.clamp(150, 0, 100) // 100"},{name:"between",signature:"between<a>(val: a, minVal: a, maxVal: a): boolean",description:"Checks whether a value is inclusively within bounds.",typeLangImpl:"function between<a>(val: a, minVal: a, maxVal: a): boolean",jsImpl:"(val, minVal, maxVal) => ...",example:"Ord.between(5, 1, 10) // true"}]},{id:"Semigroup",name:"Semigroup",category:"Algebraic",tagline:"Associative binary combination operation abstraction",description:"A Semigroup is an algebraic structure with an associative binary operation `combine(a, b)`. Also accessible via alias `SemiGroup`.",typeDefinition:"type Semigroup<a> = { combine: (x: a, y: a) => a }",lawsDoc:{leftIdentity:"",rightIdentity:"",associativity:"combine(combine(a, b), c) === combine(a, combine(b, c))"},typeLangSource:`module Semigroup {
  export function combine<a>(a: a, b: a): a
  export function concatAll<a>(list: Array<a>, fallback: a): a
  export function first<a>(): Semigroup<a>
  export function last<a>(): Semigroup<a>
  export function struct<a>(semigroups: a): Semigroup<a>
  export function dual<a>(s: Semigroup<a>): Semigroup<a>
}`,jsSource:`const $Semigroup = {
  combine: (a, b) => $combineSemigroup(a, b),
  concatAll: (list, fallback) => (list.length === 0 ? fallback : list.reduce($combineSemigroup)),
  dual: (s) => ({ combine: (a, b) => s.combine(b, a) })
};`,functions:[{name:"combine",signature:"combine<a>(a: a, b: a): a",description:"Combines two elements using structural or primitive semigroup addition/concatenation.",typeLangImpl:"extern function combine<a>(a: a, b: a): a",jsImpl:"(a, b) => $combineSemigroup(a, b)",example:'Semigroup.combine("Hello ", "World") // "Hello World"'},{name:"concatAll",signature:"concatAll<a>(list: Array<a>, fallback: a): a",description:"Reduces an array of elements using the semigroup operation.",typeLangImpl:"function concatAll<a>(list: Array<a>, fallback: a): a",jsImpl:"(list, fallback) => list.reduce($combineSemigroup, fallback)",example:"Semigroup.concatAll([1, 2, 3, 4], 0) // 10"}]},{id:"Monoid",name:"Monoid",category:"Algebraic",tagline:"Semigroup with an identity element (empty value)",description:"A Monoid is an associative semigroup equipped with a identity element `empty` such that `combine(empty, x) === x === combine(x, empty)`.",typeDefinition:"type Monoid<a> = { empty: () => a, combine: (x: a, y: a) => a }",lawsDoc:{leftIdentity:"combine(empty(), x) === x",rightIdentity:"combine(x, empty()) === x",associativity:"combine(combine(a, b), c) === combine(a, combine(b, c))"},typeLangSource:`module Monoid {
  export function empty<a>(typeOrName: string): a
  export function combine<a>(a: a, b: a): a
  export function concatAll<a>(list: Array<a>, identity: a): a
  export const Sum: Monoid<number>
  export const Product: Monoid<number>
  export const String: Monoid<string>
  export const Array: Monoid<any>
  export const All: Monoid<boolean>
  export const Any: Monoid<boolean>
  export function struct<a>(monoids: a): Monoid<a>
}`,jsSource:`const $Monoid = {
  empty: (typeOrName) => $monoidEmptyMap[typeOrName],
  combine: $combineSemigroup,
  concatAll: (list, identity) => list.reduce($combineSemigroup, identity),
  Sum: { empty: () => 0, combine: (a, b) => a + b },
  Product: { empty: () => 1, combine: (a, b) => a * b },
  All: { empty: () => true, combine: (a, b) => a && b }
};`,functions:[{name:"concatAll",signature:"concatAll<a>(list: Array<a>, identity: a): a",description:"Aggregates a list of monoidal values, returning identity if list is empty.",typeLangImpl:"function concatAll<a>(list: Array<a>, identity: a): a",jsImpl:"(list, identity) => list.reduce($combineSemigroup, identity)",example:'Monoid.concatAll(["a", "b", "c"], "") // "abc"'},{name:"struct",signature:"struct<a>(monoids: a): Monoid<a>",description:"Combines a record of monoids into a monoid for the record shape.",typeLangImpl:"function struct<a>(monoids: a): Monoid<a>",jsImpl:"(monoids) => ({ empty: ..., combine: ... })",example:"let StatsMonoid = Monoid.struct({ count: Monoid.Sum, label: Monoid.String })"}]},{id:"Group",name:"Group",category:"Algebraic",tagline:"Monoid equipped with an inverse operation (invert / subtract)",description:"A Group extends a Monoid with an inverse operation `invert(x)` such that `combine(x, invert(x)) === empty()`.",typeDefinition:"type Group<a> = { empty: () => a, combine: (x: a, y: a) => a, invert: (x: a) => a }",lawsDoc:{leftIdentity:"combine(empty(), x) === x",rightIdentity:"combine(x, empty()) === x",associativity:"combine(combine(a, b), c) === combine(a, combine(b, c))",inverse:"combine(x, invert(x)) === empty()"},typeLangSource:`module Group {
  export function invert<a>(a: a): a
  export function subtract<a>(a: a, b: a): a
  export const SumNumber: Group<number>
  export const ProductNonZero: Group<number>
}`,jsSource:`const $Group = {
  invert: (a) => (typeof a === "number" ? -a : a.invert()),
  subtract: (a, b) => a - b,
  SumNumber: { empty: () => 0, combine: (a, b) => a + b, invert: (a) => -a }
};`,functions:[{name:"invert",signature:"invert<a>(a: a): a",description:"Returns the inverse element of a group member.",typeLangImpl:"function invert<a>(a: a): a",jsImpl:'(a) => (typeof a === "number" ? -a : a.invert())',example:"Group.invert(42) // -42"},{name:"subtract",signature:"subtract<a>(a: a, b: a): a",description:"Subtracts b from a by combining a with the inverse of b.",typeLangImpl:"function subtract<a>(a: a, b: a): a",jsImpl:"(a, b) => a - b",example:"Group.subtract(100, 25) // 75"}]},{id:"Functor",name:"Functor",category:"Algebraic",tagline:"Mapping interface for wrapped / parameterized container structures",description:"A Functor allows mapping functions over data wrapped in containers (Option, Result, Either, Array, Task, State, etc.).",typeDefinition:"type Functor<f> = { map: <a, b>(fa: f<a>, fn: (x: a) => b) => f<b> }",lawsDoc:{leftIdentity:"map(fa, (x) => x) === fa (Identity)",associativity:"map(map(fa, f), g) === map(fa, (x) => g(f(x))) (Composition)"},typeLangSource:`module Functor {
  export function map<f, a, b>(fa: f<a>, fn: (x: a) => b): f<b>
  export function lift<f, a, b>(fn: (x: a) => b): (fa: f<a>) => f<b>
  export function as<f, a, b>(fa: f<a>, val: b): f<b>
  export function voidRight<f, a>(fa: f<a>): f<null>
  export function flap<f, a, b>(fab: f<(x: a) => b>, a: a): f<b>
}`,jsSource:`const $Functor = {
  map: $mapFunctor,
  lift: (fn) => (fa) => $mapFunctor(fa, fn),
  as: (fa, val) => $mapFunctor(fa, () => val)
};`,functions:[{name:"map",signature:"map<f, a, b>(fa: f<a>, fn: (x: a) => b): f<b>",description:"Applies a function to the inner value(s) of any functor object.",typeLangImpl:"extern function map<f, a, b>(fa: f<a>, fn: (x: a) => b): f<b>",jsImpl:"(fa, fn) => $mapFunctor(fa, fn)",example:"Functor.map(Some(5), (x) => x * 2) // Some(10)"},{name:"lift",signature:"lift<f, a, b>(fn: (x: a) => b): (fa: f<a>) => f<b>",description:"Lifts an un-wrapped function a -> b to a functor function f<a> -> f<b>.",typeLangImpl:"function lift<f, a, b>(fn: (x: a) => b): (fa: f<a>) => f<b>",jsImpl:"(fn) => (fa) => $mapFunctor(fa, fn)",example:"let doubleOpt = Functor.lift((x: number) => x * 2)"}]},{id:"Contravariant",name:"Contravariant",category:"Algebraic",tagline:"Contravariant functor mapping inputs for consumer/predicate structures",description:"A Contravariant functor maps over function argument positions (inputs) rather than outputs (e.g. Predicate, Setoid, Ord, Encoder).",typeDefinition:"type Contravariant<f> = { contramap: <a, b>(fa: f<b>, fn: (x: a) => b) => f<a> }",typeLangSource:`module Contravariant {
  export function contramap<f, a, b>(fa: f<b>, fn: (x: a) => b): f<a>
  export function cmap<f, a, b>(fa: f<b>, fn: (x: a) => b): f<a>
  export function predicate<a>(pred: (x: a) => boolean): any
}`,jsSource:`const $Contravariant = {
  contramap: (fa, fn) => (x) => fa(fn(x)),
  predicate: (pred) => ({ run: pred, cmap: (fn) => (x) => pred(fn(x)) })
};`,functions:[{name:"contramap",signature:"contramap<f, a, b>(fa: f<b>, fn: (x: a) => b): f<a>",description:"Pre-composes an input transformation function fn: a -> b onto a consumer/predicate f<b>.",typeLangImpl:"function contramap<f, a, b>(fa: f<b>, fn: (x: a) => b): f<a>",jsImpl:"(fa, fn) => (x) => fa(fn(x))",example:"let isEvenUser = Contravariant.contramap((n: number) => n % 2 == 0, (user) => user.age)"}]},{id:"Applicative",name:"Applicative",category:"Algebraic",tagline:"Applicative functors with pure injection and curried function application (ap)",description:"Applicative functors allow applying wrapped functions to wrapped arguments independently and combining multiple effects.",typeDefinition:"type Applicative<f> = { pure: <a>(x: a) => f<a>, ap: <a, b>(ff: f<(x: a) => b>, fa: f<a>) => f<b> }",lawsDoc:{leftIdentity:"ap(pure(f), pure(x)) === pure(f(x)) (Identity)",associativity:"ap(pure((f) => (x) => f(x)), fa) === fa"},typeLangSource:`module Applicative {
  export function pure<a>(val: a): Option<a>
  export function ap<f, a, b>(ff: f<(x: a) => b>, fa: f<a>): f<b>
  export function lift2<f, a, b, c>(fn: (x: a, y: b) => c, fa: f<a>, fb: f<b>): f<c>
  export function lift3<f, a, b, c, d>(fn: (x: a, y: b, z: c) => d, fa: f<a>, fb: f<b>, fc: f<c>): f<d>
  export function zip<f, a, b>(fa: f<a>, fb: f<b>): f<[a, b]>
}`,jsSource:`const $Applicative = {
  pure: $Some,
  ap: $apApplicative,
  lift2: (fn, fa, fb) => $apApplicative($mapFunctor(fa, (a) => (b) => fn(a, b)), fb),
  zip: (fa, fb) => $apApplicative($mapFunctor(fa, (a) => (b) => [a, b]), fb)
};`,functions:[{name:"ap",signature:"ap<f, a, b>(ff: f<(x: a) => b>, fa: f<a>): f<b>",description:"Applies a wrapped function ff to a wrapped value fa.",typeLangImpl:"extern function ap<f, a, b>(ff: f<(x: a) => b>, fa: f<a>): f<b>",jsImpl:"(ff, fa) => $apApplicative(ff, fa)",example:"Applicative.ap(Some((x) => x + 10), Some(5)) // Some(15)"},{name:"lift2",signature:"lift2<f, a, b, c>(fn: (x: a, y: b) => c, fa: f<a>, fb: f<b>): f<c>",description:"Lifts a binary function (a, b) -> c to operate over two applicative structures.",typeLangImpl:"function lift2<f, a, b, c>(fn: (x: a, y: b) => c, fa: f<a>, fb: f<b>): f<c>",jsImpl:"(fn, fa, fb) => ...",example:"Applicative.lift2((x, y) => x + y, Some(3), Some(4)) // Some(7)"}]},{id:"Validation",name:"Validation",category:"Algebraic",tagline:"Error-accumulating Applicative structure for form & request validation",description:"Unlike Result/Either (which short-circuits on first error), Validation accumulates ALL errors using a semigroup list.",typeDefinition:"type Validation<a> = Valid(val: a) | Invalid(errs: Array<any>)",typeLangSource:`module Validation {
  export function Valid<a>(val: a): Validation<a>
  export function Invalid<e>(errs: Array<e>): Validation<any>
  export function pure<a>(val: a): Validation<a>
  export function invalid<e>(err: e): Validation<any>
  export function isValid<a>(v: Validation<a>): boolean
  export function isInvalid<a>(v: Validation<a>): boolean
  export function map<a, b>(v: Validation<a>, fn: (x: a) => b): Validation<b>
  export function ap<a, b>(vf: Validation<(x: a) => b>, va: Validation<a>): Validation<b>
  export function accumulate<a, b, c>(v1: Validation<a>, v2: Validation<b>, fn: (x: a, y: b) => c): Validation<c>
  export function getOrElse<a>(v: Validation<a>, defaultVal: a): a
  export function toResult<a>(v: Validation<a>): Result<a, any>
}`,jsSource:`const $Validation = {
  Valid: $Valid,
  Invalid: $Invalid,
  pure: $Valid,
  invalid: (err) => $Invalid([err]),
  accumulate: (v1, v2, fn) => {
    if (v1.$tag === 'Valid' && v2.$tag === 'Valid') return $Valid(fn(v1.val, v2.val));
    return $Invalid([...(v1.errs || []), ...(v2.errs || [])]);
  }
};`,functions:[{name:"accumulate",signature:"accumulate<a, b, c>(v1: Validation<a>, v2: Validation<b>, fn: (x: a, y: b) => c): Validation<c>",description:"Combines two validations, gathering errors from both if invalid.",typeLangImpl:"function accumulate<a, b, c>(v1: Validation<a>, v2: Validation<b>, fn: (x: a, y: b) => c): Validation<c>",jsImpl:"(v1, v2, fn) => ...",example:'Validation.accumulate(Invalid(["Name missing"]), Invalid(["Age must be positive"]), User)'}]},{id:"Bifunctor",name:"Bifunctor",category:"Algebraic",tagline:"Mapping two covariant type parameters independently (Result, Either, Tuple)",description:"A Bifunctor is a container with two type parameters (e.g. Either<l, r>, Result<a, e>) allowing mapping both sides simultaneously via `bimap(fab, f, g)`.",typeDefinition:"type Bifunctor<f> = { bimap: <a, b, c, d>(fab: f<a, b>, f: (x: a) => c, g: (y: b) => d) => f<c, d> }",typeLangSource:`module Bifunctor {
  export function bimap<f, a, b, c, d>(fab: f<a, b>, f: (x: a) => c, g: (y: b) => d): f<c, d>
}`,jsSource:`const $Bifunctor = {
  bimap: (fab, f, g) => (fab.$tag === "Ok" ? $Ok(g(fab.val)) : $Err(f(fab.err)))
};`,functions:[{name:"bimap",signature:"bimap<f, a, b, c, d>(fab: f<a, b>, f: (x: a) => c, g: (y: b) => d): f<c, d>",description:"Applies f to the left/error parameter and g to the right/value parameter.",typeLangImpl:"function bimap<f, a, b, c, d>(fab: f<a, b>, f: (x: a) => c, g: (y: b) => d): f<c, d>",jsImpl:"(fab, f, g) => ...",example:'Bifunctor.bimap(Ok(10), (e) => "Error: " + e, (v) => v * 2) // Ok(20)'}]},{id:"Profunctor",name:"Profunctor",category:"Algebraic",tagline:"Contravariant on input and covariant on output (Functions, Kleisli arrows)",description:"Profunctors map contravariantly over input positions and covariantly over output positions via `dimap(pab, f, g)`.",typeDefinition:"type Profunctor<p> = { dimap: <a, b, c, d>(pab: p<a, b>, f: (x: c) => a, g: (y: b) => d) => p<c, d> }",typeLangSource:`module Profunctor {
  export function dimap<p, a, b, c, d>(pab: p<a, b>, f: (x: c) => a, g: (y: b) => d): p<c, d>
  export function promap<p, a, b, c, d>(pab: p<a, b>, f: (x: c) => a, g: (y: b) => d): p<c, d>
}`,jsSource:`const $Profunctor = {
  dimap: (pab, f, g) => (x) => g(pab(f(x)))
};`,functions:[{name:"dimap",signature:"dimap<p, a, b, c, d>(pab: p<a, b>, f: (x: c) => a, g: (y: b) => d): p<c, d>",description:"Transforms a function/arrow pab by pre-processing input with f and post-processing output with g.",typeLangImpl:"function dimap<p, a, b, c, d>(pab: p<a, b>, f: (x: c) => a, g: (y: b) => d): p<c, d>",jsImpl:"(pab, f, g) => (x) => g(pab(f(x)))",example:'Profunctor.dimap((n: number) => n * 2, (str) => String.parseInt(str), (num) => "Res: " + to_string(num))'}]},{id:"Foldable",name:"Foldable",category:"Algebraic",tagline:"Data structure traversal and reduction into summary values or monoids",description:"Foldable structures can be collapsed into a single value using left fold or monoidal accumulation.",typeDefinition:"type Foldable<f> = { foldLeft: <a, b>(fa: f<a>, initial: b, fn: (acc: b, x: a) => b) => b }",typeLangSource:`module Foldable {
  export function foldLeft<f, a, b>(fa: f<a>, initial: b, fn: (acc: b, x: a) => b): b
  export function foldMap<f, a, m>(fa: f<a>, monoid: Monoid<m>, fn: (x: a) => m): m
}`,jsSource:`const $Foldable = {
  foldLeft: (fa, initial, fn) => (Array.isArray(fa) ? fa.reduce(fn, initial) : initial),
  foldMap: (fa, monoid, fn) => fa.reduce((acc, x) => monoid.combine(acc, fn(x)), monoid.empty())
};`,functions:[{name:"foldLeft",signature:"foldLeft<f, a, b>(fa: f<a>, initial: b, fn: (acc: b, x: a) => b): b",description:"Reduces any foldable structure (Array, Option, Result) from left to right.",typeLangImpl:"function foldLeft<f, a, b>(fa: f<a>, initial: b, fn: (acc: b, x: a) => b): b",jsImpl:"(fa, initial, fn) => ...",example:"Foldable.foldLeft([1, 2, 3, 4], 0, (acc, x) => acc + x) // 10"},{name:"foldMap",signature:"foldMap<f, a, m>(fa: f<a>, monoid: Monoid<m>, fn: (x: a) => m): m",description:"Maps each element to a monoid and combines the results.",typeLangImpl:"function foldMap<f, a, m>(fa: f<a>, monoid: Monoid<m>, fn: (x: a) => m): m",jsImpl:"(fa, monoid, fn) => ...",example:'Foldable.foldMap(["a", "b", "c"], Monoid.String, (x) => x + "!") // "a!b!c!"'}]},{id:"DOM",name:"DOM",category:"Runtime",tagline:"Reactive Virtual DOM & Browser Rendering System",description:"Client-side web engine for mounting Virtual DOM components, interactive stateful UI, canvas 2D contexts, audio synthesis, and event listeners.",typeDefinition:"type VNode = { tag: string, props: any, children: [any], $vnode: boolean }",typeLangSource:`module DOM {
  export extern function h(tag: string, props: any, children: [any]): VNode
  export extern function render(vnode: VNode, containerId: string): void
  export extern function getElementById(id: string): any
  export extern function createCanvas(id: string, width: number, height: number): any
  export extern function getAudioContext(): any
}`,jsSource:`const $DOM = {
  h: (tag, props, children) => ({ $vnode: true, tag, props: props || {}, children: Array.isArray(children) ? children : [children] }),
  render: (vnode, containerId) => { /* virtual dom reconciler */ },
  getElementById: (id) => typeof document !== 'undefined' ? document.getElementById(id) : null
};`,functions:[{name:"h",signature:"h(tag: string, props: any, children: [any]): VNode",description:"Creates a Virtual DOM node element.",typeLangImpl:"extern function h(tag: string, props: any, children: [any]): VNode",jsImpl:"(tag, props, children) => ({ $vnode: true, tag, props, children })",example:'DOM.h("button", { onClick: () => count = count + 1 }, ["Click me"])'},{name:"render",signature:"render(vnode: VNode, containerId: string): void",description:"Mounts and reconciles a Virtual DOM root inside a container element.",typeLangImpl:"extern function render(vnode: VNode, containerId: string): void",jsImpl:"(vnode, containerId) => { /* DOM mount */ }",example:'DOM.render(appView, "root")'}]},{id:"Node",name:"Node",category:"Runtime",tagline:"Server-side Express microservice & filesystem runtime",description:"Server runtime providing HTTP server creation, routing, JSON response emission, asynchronous file read/write operations, and port listening.",typeDefinition:"module Node",typeLangSource:`module Node {
  export extern function createServer(): any
  export extern function get(server: any, path: string, handler: (req: any, res: any) => void): void
  export extern function post(server: any, path: string, handler: (req: any, res: any) => void): void
  export extern function listen(server: any, port: number, callback: () => void): void
  export extern function readFile(path: string): string
  export extern function writeFile(path: string, content: string): void
  export extern function json(res: any, data: any): void
}`,jsSource:`const $Node = {
  createServer: () => ({ routes: [] }),
  readFile: (path) => "mock file content",
  writeFile: (path, content) => {},
  listen: (server, port, cb) => { if (typeof cb === 'function') cb(); }
};`,functions:[{name:"createServer",signature:"createServer(): any",description:"Instantiates a new HTTP microservice server instance.",typeLangImpl:"extern function createServer(): any",jsImpl:"() => ({ routes: [] })",example:"let app = Node.createServer()"},{name:"listen",signature:"listen(server: any, port: number, callback: () => void): void",description:"Starts the server listening on the specified port.",typeLangImpl:"extern function listen(server: any, port: number, callback: () => void): void",jsImpl:"(server, port, cb) => cb()",example:'Node.listen(app, 3000, () => println("Server running on port 3000"))'}]}],ROOT_BUILTIN_DOC_COMMENTS={print:`/**
 * Writes a value to standard output without appending a newline.
 * @param val The value to write.
 * @returns Nothing.
 */`,println:`/**
 * Writes a value to standard output followed by a newline.
 * @param val The value to write.
 * @returns Nothing.
 */`,to_string:`/**
 * Converts a value to its canonical string representation.
 * @param val The value to convert.
 * @returns The formatted string.
 */`,concat:`/**
 * Concatenates two strings in order.
 * @param a The first string.
 * @param b The string to append.
 * @returns The concatenated string.
 */`,requestAnimationFrame:`/**
 * Schedules a callback for the next animation frame in browser runtimes.
 * @param callback The function to invoke for the next frame.
 */`,setInterval:`/**
 * Repeatedly invokes a callback at the requested interval.
 * @param callback The function to invoke.
 * @param ms The delay between invocations, in milliseconds.
 * @returns A timer handle that can be passed to clearInterval.
 */`,clearInterval:`/**
 * Cancels a repeating timer created by setInterval.
 * @param handle The timer handle to cancel.
 */`,setTimeout:`/**
 * Schedules a callback to run once after a delay.
 * @param callback The function to invoke.
 * @param ms The delay before invocation, in milliseconds.
 * @returns A timer handle that can be passed to clearTimeout.
 */`,clearTimeout:`/**
 * Cancels a pending one-shot timer created by setTimeout.
 * @param handle The timer handle to cancel.
 */`};function getRootBuiltinDoc(a){const e=ROOT_BUILTIN_DOC_COMMENTS[a];return e?renderDocComment(e):void 0}function getStdLibModuleDoc(a){const e=a.toLowerCase(),t=STDLIB_MODULES$1.find(n=>n.id.toLowerCase()===e||n.name.toLowerCase()===e);return t==null?void 0:t.description}function getStdLibMemberDoc(a,e,t=[],n){const r=a.toLowerCase(),s=STDLIB_MODULES$1.find(P=>P.id.toLowerCase()===r||P.name.toLowerCase()===r);if(!s)return;const i=s.functions.find(P=>P.name===e),o={pure:"Lifts a plain value into the module’s computational context.",of:"Constructs a value in the module’s context.",map:"Transforms the value inside the context without changing the context itself.",flatMap:"Chains a context-producing transformation while preserving the module’s sequencing rules.",filter:"Keeps the value only when it satisfies the supplied predicate.",fold:"Reduces the value to a result by selecting the appropriate branch or handler.",getOrElse:"Extracts the contained value, or returns the provided fallback.",flatten:"Removes one layer of nested context.",zip:"Combines two values while preserving the module’s context semantics.",tap:"Runs a side-effecting callback and returns the original contextual value.",swap:"Exchanges the left and right cases of the value.",mapError:"Transforms the error channel while preserving a successful value.",fromOption:"Converts an optional value into this result type using the provided error.",toOption:"Converts this value to an Option, discarding error information when present.",run:"Executes the deferred computation with the supplied environment or state.",ask:"Reads the complete environment supplied to a Reader computation.",asks:"Projects a value from the Reader environment.",tell:"Appends a value to the Writer output.",listen:"Returns the computation result together with the output it produced.",get:"Reads the current state.",set:"Replaces the current state with the supplied value.",modify:"Updates the current state with a transformation function.",evalState:"Runs a state computation and returns only its result.",execState:"Runs a state computation and returns only its final state.",combine:"Combines two values using the algebraic instance’s operation.",concatAll:"Combines a collection of values from left to right.",compare:"Compares two values and returns their ordering.",contramap:"Transforms inputs before passing them to the underlying operation.",bimap:"Transforms both sides of a two-parameter value.",dimap:"Transforms the input and output of a profunctor.",foldLeft:"Traverses a collection from left to right while carrying an accumulator.",foldMap:"Maps each element into a monoid and combines the results.",accumulate:"Combines multiple validations while accumulating all available errors.",ap:"Applies a function held in an applicative context to a contextual value.",lift2:"Lifts a two-argument function to operate on applicative values.",lift3:"Lifts a three-argument function to operate on applicative values.",isSome:"Returns whether the Option contains a value.",isNone:"Returns whether the Option is empty.",isOk:"Returns whether the Result represents success.",isErr:"Returns whether the Result represents failure.",isLeft:"Returns whether the Either contains a left value.",isRight:"Returns whether the Either contains a right value.",isValid:"Returns whether the Validation represents success.",isInvalid:"Returns whether the Validation contains errors.",min:"Returns the smaller of two ordered values.",max:"Returns the larger of two ordered values.",clamp:"Bounds a value to the inclusive minimum and maximum.",between:"Checks whether a value falls within the supplied bounds.",invert:"Returns the inverse of a value in the group.",subtract:"Combines a value with the inverse of another value.",stringify:"Serializes a value as JSON text.",parse:"Parses JSON text into a TypeLang value.",envGet:"Reads an environment variable by name.",readFile:"Reads text from a file path.",writeFile:"Writes text to a file path.",createApp:"Creates a new HTTP application instance.",getElementById:"Looks up a DOM element by its identifier.",createElement:"Creates a DOM element with the requested tag name.",setText:"Replaces an element’s text content.",setHtml:"Replaces an element’s HTML content.",setAttr:"Sets an attribute on a DOM element.",appendChild:"Appends a child node to a parent node.",addEventListener:"Registers a callback for a DOM event.",mount:"Mounts a virtual DOM tree into a browser container."},l=(i==null?void 0:i.description)||o[e]||`Provides the ${e} operation for values in the ${a} module.`,c=i==null?void 0:i.example,u={arr:"The input array or collection.",opt:"The optional value to inspect or transform.",res:"The result value to inspect or transform.",fn:"The callback applied to the input value.",pred:"The predicate used to decide which values to keep.",elem:"The element to add or combine.",initial:"The initial accumulator value.",init:"The initial accumulator value.",acc:"The accumulated value passed to the next step.",accumulator:"The accumulated value passed to the next step.",x:"The value supplied to the callback.",value:"The value to process.",val:"The value to process.",defaultVal:"The fallback value used when no value is available.",callback:"The function invoked by this operation."},p=(i==null?void 0:i.signature)||"",d=p.indexOf("(");let f=d,m=0;for(;f>=0&&f<p.length&&(p[f]==="("&&m++,!(p[f]===")"&&--m===0));f++);const y=d>=0?p.slice(d+1,f):"",_=[];let g=0,h=0;for(let P=0;P<=y.length;P++){const $=y[P];if(($==="("||$==="["||$==="{")&&g++,($===")"||$==="]"||$==="}")&&g--,$===","&&g===0||P===y.length){const b=y.slice(h,P).split(":")[0].trim();b&&_.push(b),h=P+1}}const T=_.length?_:t,L=T.map(P=>` * @param ${P} ${u[P]||`The ${P} input used by this operation.`}`).join(`
`),A=(f>=0&&i?p.slice(f+1).replace(/^\s*:\s*/,"").trim():n)||"",V=c?` * @example
 * ${c.replace(/\n/g,`
 * `)}
`:"",I=`/**
 * ${l.replace(/\n/g,`
 * `)}
${L?`${L}
`:""}${A?` * @returns The result of this operation (${A}).
`:""}${V} */`;return renderDocComment(I,T)}const KIND_STAR={kind:"star"};function kindArrow(a,e){return{kind:"arrow",from:a,to:e}}function makeKindN(a){let e=KIND_STAR;for(let t=0;t<a;t++)e=kindArrow(KIND_STAR,e);return e}function kindArity(a){let e=0,t=a;for(;t.kind==="arrow";)e++,t=t.to;return e}const PRIM_NUMBER={kind:"prim",name:"number"},PRIM_BOOLEAN={kind:"prim",name:"boolean"},PRIM_STRING={kind:"prim",name:"string"},PRIM_VOID={kind:"prim",name:"void"};let varCounter=0;function freshTypeVar(a,e=KIND_STAR){return{kind:"var",id:++varCounter,name:a,typeKind:e}}function prune(a,e=new Set){if(a.kind==="var"&&a.instance)return e.has(a)?a:(e.add(a),a.instance=prune(a.instance,e),a.instance);if(a.kind==="hkt_app"){const t=prune(a.constructor,e),n=a.args.map(r=>prune(r,e));if(t.kind==="cons")return t.name==="Array"||t.name==="list"?{kind:"tup",elements:[n[0]||freshTypeVar("a")]}:{kind:"cons",name:t.name,args:[...t.args,...n]};if(t.kind==="type_lambda"){const r=new Map;return t.params.forEach((s,i)=>{n[i]&&r.set(s,n[i])}),prune(substituteInType(t.body,r),e)}return{kind:"hkt_app",constructor:t,args:n}}return a}function substituteInType(a,e,t=new Map){if(t.has(a))return t.get(a);switch(a.kind){case"var":return a.name&&e.has(a.name)?e.get(a.name):a.instance?substituteInType(a.instance,e,t):a;case"fun":{const n={kind:"fun",params:[],returnType:PRIM_VOID};return t.set(a,n),n.params=a.params.map(r=>({...r,type:substituteInType(r.type,e,t)})),n.returnType=substituteInType(a.returnType,e,t),n}case"rec":{const n={kind:"rec",fields:[]};return t.set(a,n),n.fields=a.fields.map(r=>({...r,type:substituteInType(r.type,e,t)})),n}case"tup":{const n={kind:"tup",elements:[]};return t.set(a,n),n.elements=a.elements.map(r=>substituteInType(r,e,t)),n}case"cons":{if(e.has(a.name)&&a.args.length===0)return e.get(a.name);if(e.has(a.name)&&a.args.length>0){const n=e.get(a.name),r=a.args.map(s=>substituteInType(s,e,t));return n.kind==="cons"?{kind:"cons",name:n.name,args:[...n.args,...r]}:{kind:"hkt_app",constructor:n,args:r}}return{kind:"cons",name:a.name,args:a.args.map(n=>substituteInType(n,e,t))}}case"hkt_app":{const n=substituteInType(a.constructor,e,t),r=a.args.map(s=>substituteInType(s,e,t));return{kind:"hkt_app",constructor:n,args:r}}case"type_lambda":{const n=new Map(e);for(const r of a.params)n.delete(r);return{kind:"type_lambda",params:a.params,body:substituteInType(a.body,n,t)}}case"poly":{const n=new Map(e);for(const r of a.quantifiers)n.delete(r);return{kind:"poly",quantifiers:a.quantifiers,quantifierKinds:a.quantifierKinds,type:substituteInType(a.type,n,t)}}default:return a}}function typeToString(a,e=new Set){const t=prune(a);if(e.has(t))return"Self";e.add(t);let n="";switch(t.kind){case"prim":n=t.name;break;case"var":n=t.instance?typeToString(t.instance,e):t.name||`'t${t.id}`;break;case"existential":n=`∃${t.name}_${t.id}`;break;case"poly":{n=`<${t.quantifiers.map(s=>{if(t.quantifierKinds&&t.quantifierKinds.has(s)){const i=t.quantifierKinds.get(s);if(i.kind==="arrow"){const o=kindArity(i);return`${s}<${Array(o).fill("_").join(", ")}>`}}return s}).join(", ")}>${typeToString(t.type,e)}`;break}case"fun":{n=`(${t.params.map(s=>s.name?`${s.name}: ${typeToString(s.type,e)}`:typeToString(s.type,e)).join(", ")}) => ${typeToString(t.returnType,e)}`;break}case"rec":{n=`{ ${t.fields.map(s=>`${s.isMut?"mut ":""}${s.name}${s.isOptional?"?":""}: ${typeToString(s.type,e)}`).join(", ")} }`;break}case"tup":n=`[${t.elements.map(r=>typeToString(r,e)).join(", ")}]`;break;case"cons":n=t.args.length>0?`${t.name}<${t.args.map(r=>typeToString(r,e)).join(", ")}>`:t.name;break;case"hkt_app":{const r=typeToString(t.constructor,e),s=t.args.map(i=>typeToString(i,e)).join(", ");n=`${r}<${s}>`;break}case"type_lambda":n=`λ<${t.params.join(", ")}> => ${typeToString(t.body,e)}`;break}return e.delete(t),n}function astToKind(a){return!a||a.kind==="star"?KIND_STAR:a.kind==="arrow"?kindArrow(astToKind(a.from),astToKind(a.to)):KIND_STAR}function getTypeParamKind(a){return typeof a=="string"?KIND_STAR:a.kindAnnotation?astToKind(a.kindAnnotation):a.arity!==void 0&&a.arity>0?makeKindN(a.arity):KIND_STAR}function createTypeVarForParam(a){const e=getTypeParamName(a),t=getTypeParamKind(a);return freshTypeVar(e,t)}function createScopedEnv(a){return{vars:a?new Map(a.vars):new Map,mutVars:a?new Set(a.mutVars):new Set,gadts:a?new Map(a.gadts):new Map,typeAliases:a?new Map(a.typeAliases):new Map,modules:a?new Map(a.modules):new Map,exports:new Set,parent:a,currentReturnType:a==null?void 0:a.currentReturnType,defLocs:a&&a.defLocs?new Map(a.defLocs):new Map,docs:a!=null&&a.docs?new Map(a.docs):new Map,moduleDoc:a==null?void 0:a.moduleDoc}}function levenshteinDistance(a,e){const t=a.length,n=e.length,r=Array.from({length:t+1},()=>Array(n+1).fill(0));for(let s=0;s<=t;s++)r[s][0]=s;for(let s=0;s<=n;s++)r[0][s]=s;for(let s=1;s<=t;s++)for(let i=1;i<=n;i++){const o=a[s-1].toLowerCase()===e[i-1].toLowerCase()?0:1;r[s][i]=Math.min(r[s-1][i]+1,r[s][i-1]+1,r[s-1][i-1]+o),s>1&&i>1&&a[s-1].toLowerCase()===e[i-2].toLowerCase()&&a[s-2].toLowerCase()===e[i-1].toLowerCase()&&(r[s][i]=Math.min(r[s][i],r[s-2][i-2]+1))}return r[t][n]}function findBestSuggestion(a,e,t=3){let n=null,r=1/0;for(const s of e){if(s===a)continue;const i=levenshteinDistance(a,s),o=Math.min(t,Math.max(1,Math.floor(a.length/2)+1));i<=o&&i<r&&(r=i,n=s)}return n}function createInitialEnv(){var G;const a={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set,defLocs:new Map,docs:new Map};a.vars.set("print",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:PRIM_VOID}}),a.vars.set("println",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:PRIM_VOID}}),a.vars.set("to_string",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:PRIM_STRING}}),a.vars.set("concat",{kind:"fun",params:[{name:"a",type:PRIM_STRING},{name:"b",type:PRIM_STRING}],returnType:PRIM_STRING}),a.vars.set("parse_int",{kind:"fun",params:[{name:"s",type:PRIM_STRING}],returnType:PRIM_NUMBER}),a.vars.set("parse_float",{kind:"fun",params:[{name:"s",type:PRIM_STRING}],returnType:PRIM_NUMBER}),a.vars.set("time_now",{kind:"fun",params:[],returnType:PRIM_NUMBER});const e={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set};e.vars.set("sqrt",{kind:"fun",params:[{name:"x",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("abs",{kind:"fun",params:[{name:"x",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("floor",{kind:"fun",params:[{name:"x",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("ceil",{kind:"fun",params:[{name:"x",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("round",{kind:"fun",params:[{name:"x",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("min",{kind:"fun",params:[{name:"a",type:PRIM_NUMBER},{name:"b",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("max",{kind:"fun",params:[{name:"a",type:PRIM_NUMBER},{name:"b",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("pow",{kind:"fun",params:[{name:"base",type:PRIM_NUMBER},{name:"exp",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("random",{kind:"fun",params:[],returnType:PRIM_NUMBER}),e.vars.set("cos",{kind:"fun",params:[{name:"x",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("sin",{kind:"fun",params:[{name:"x",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("atan2",{kind:"fun",params:[{name:"y",type:PRIM_NUMBER},{name:"x",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("log",{kind:"fun",params:[{name:"x",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("bitwise_and",{kind:"fun",params:[{name:"a",type:PRIM_NUMBER},{name:"b",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("bitwise_or",{kind:"fun",params:[{name:"a",type:PRIM_NUMBER},{name:"b",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("bitwise_xor",{kind:"fun",params:[{name:"a",type:PRIM_NUMBER},{name:"b",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("bitwise_not",{kind:"fun",params:[{name:"x",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("bitwise_shl",{kind:"fun",params:[{name:"a",type:PRIM_NUMBER},{name:"b",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("bitwise_shr",{kind:"fun",params:[{name:"a",type:PRIM_NUMBER},{name:"b",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}),e.vars.set("PI",PRIM_NUMBER),e.vars.set("E",PRIM_NUMBER);for(const w of Array.from(e.vars.keys()))e.exports.add(w);a.modules.set("Math",e);const t={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set};t.vars.set("len",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"arr",type:{kind:"tup",elements:[freshTypeVar("a")]}}],returnType:PRIM_NUMBER}}),t.vars.set("map",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"arr",type:{kind:"tup",elements:[freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:{kind:"tup",elements:[freshTypeVar("b")]}}}),t.vars.set("filter",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"arr",type:{kind:"tup",elements:[freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:PRIM_BOOLEAN}}],returnType:{kind:"tup",elements:[freshTypeVar("a")]}}}),t.vars.set("reduce",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"arr",type:{kind:"tup",elements:[freshTypeVar("a")]}},{name:"init",type:freshTypeVar("b")},{name:"fn",type:{kind:"fun",params:[{name:"acc",type:freshTypeVar("b")},{name:"elem",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:freshTypeVar("b")}}),t.vars.set("push",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"arr",type:{kind:"tup",elements:[freshTypeVar("a")]}},{name:"elem",type:freshTypeVar("a")}],returnType:{kind:"tup",elements:[freshTypeVar("a")]}}}),t.vars.set("slice",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"arr",type:{kind:"tup",elements:[freshTypeVar("a")]}},{name:"start",type:PRIM_NUMBER},{name:"end",type:PRIM_NUMBER}],returnType:{kind:"tup",elements:[freshTypeVar("a")]}}}),t.vars.set("concat",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"a",type:{kind:"tup",elements:[freshTypeVar("a")]}},{name:"b",type:{kind:"tup",elements:[freshTypeVar("a")]}}],returnType:{kind:"tup",elements:[freshTypeVar("a")]}}}),t.vars.set("join",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"arr",type:{kind:"tup",elements:[freshTypeVar("a")]}},{name:"sep",type:PRIM_STRING}],returnType:PRIM_STRING}});for(const w of Array.from(t.vars.keys()))t.exports.add(w);a.modules.set("Array",t);const n={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set};n.vars.set("len",{kind:"fun",params:[{name:"s",type:PRIM_STRING}],returnType:PRIM_NUMBER}),n.vars.set("slice",{kind:"fun",params:[{name:"s",type:PRIM_STRING},{name:"start",type:PRIM_NUMBER},{name:"end",type:PRIM_NUMBER}],returnType:PRIM_STRING}),n.vars.set("split",{kind:"fun",params:[{name:"s",type:PRIM_STRING},{name:"delim",type:PRIM_STRING}],returnType:{kind:"tup",elements:[PRIM_STRING]}}),n.vars.set("contains",{kind:"fun",params:[{name:"s",type:PRIM_STRING},{name:"sub",type:PRIM_STRING}],returnType:PRIM_BOOLEAN}),n.vars.set("parseInt",{kind:"fun",params:[{name:"s",type:PRIM_STRING}],returnType:PRIM_NUMBER}),n.vars.set("parseFloat",{kind:"fun",params:[{name:"s",type:PRIM_STRING}],returnType:PRIM_NUMBER});for(const w of Array.from(n.vars.keys()))n.exports.add(w);a.modules.set("String",n);const r={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set},s={kind:"gadt",name:"Option",typeParams:[{name:"a"}],constructors:[{name:"Some",typeParams:[],params:[{name:"val",type:{kind:"var",name:"a"}}]},{name:"None",typeParams:[],params:[]}]};r.gadts.set("Option",s),a.gadts.set("Option",s);const i={kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}}},o={kind:"poly",quantifiers:["a"],type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}};a.vars.set("Some",i),a.vars.set("None",o),r.vars.set("Some",i),r.vars.set("None",o),r.vars.set("pure",i),r.vars.set("of",i),r.vars.set("flatMap",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"opt",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("b")]}}}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("b")]}}}),r.vars.set("map",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"opt",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("b")]}}}),r.vars.set("filter",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"opt",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"pred",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:PRIM_BOOLEAN}}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}}}),r.vars.set("getOrElse",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"opt",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"defaultVal",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}}),r.vars.set("isSome",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"opt",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}}],returnType:PRIM_BOOLEAN}}),r.vars.set("isNone",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"opt",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}}],returnType:PRIM_BOOLEAN}}),r.vars.set("flatten",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"opt",type:{kind:"cons",name:"Option",args:[{kind:"cons",name:"Option",args:[freshTypeVar("a")]}]}}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}}}),r.vars.set("zip",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"optA",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"optB",type:{kind:"cons",name:"Option",args:[freshTypeVar("b")]}}],returnType:{kind:"cons",name:"Option",args:[{kind:"tup",elements:[freshTypeVar("a"),freshTypeVar("b")]}]}}}),r.vars.set("fromNullable",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}}}),r.vars.set("fold",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"opt",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"defaultVal",type:freshTypeVar("b")},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:freshTypeVar("b")}}),r.vars.set("orElse",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"opt",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"altOpt",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}}}),r.vars.set("toResult",{kind:"poly",quantifiers:["a","e"],type:{kind:"fun",params:[{name:"opt",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"err",type:freshTypeVar("e")}],returnType:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}}}),r.vars.set("contains",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"opt",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"elem",type:freshTypeVar("a")}],returnType:PRIM_BOOLEAN}}),r.vars.set("exists",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"opt",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"pred",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:PRIM_BOOLEAN}}],returnType:PRIM_BOOLEAN}}),r.vars.set("tap",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"opt",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}}});for(const w of Array.from(r.vars.keys()))r.exports.add(w);a.modules.set("Option",r);const l={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set},c={kind:"gadt",name:"Result",typeParams:[{name:"a"},{name:"e"}],constructors:[{name:"Ok",typeParams:[],params:[{name:"val",type:{kind:"var",name:"a"}}]},{name:"Err",typeParams:[],params:[{name:"err",type:{kind:"var",name:"e"}}]}]};l.gadts.set("Result",c),a.gadts.set("Result",c);const u={kind:"poly",quantifiers:["a","e"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}}},p={kind:"poly",quantifiers:["a","e"],type:{kind:"fun",params:[{name:"err",type:freshTypeVar("e")}],returnType:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}}};a.vars.set("Ok",u),a.vars.set("Err",p),l.vars.set("Ok",u),l.vars.set("Err",p),l.vars.set("pure",u),l.vars.set("of",u),l.vars.set("flatMap",{kind:"poly",quantifiers:["a","b","e"],type:{kind:"fun",params:[{name:"res",type:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Result",args:[freshTypeVar("b"),freshTypeVar("e")]}}}],returnType:{kind:"cons",name:"Result",args:[freshTypeVar("b"),freshTypeVar("e")]}}}),l.vars.set("map",{kind:"poly",quantifiers:["a","b","e"],type:{kind:"fun",params:[{name:"res",type:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:{kind:"cons",name:"Result",args:[freshTypeVar("b"),freshTypeVar("e")]}}}),l.vars.set("mapError",{kind:"poly",quantifiers:["a","e","e2"],type:{kind:"fun",params:[{name:"res",type:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}},{name:"fn",type:{kind:"fun",params:[{name:"err",type:freshTypeVar("e")}],returnType:freshTypeVar("e2")}}],returnType:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e2")]}}}),l.vars.set("getOrElse",{kind:"poly",quantifiers:["a","e"],type:{kind:"fun",params:[{name:"res",type:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}},{name:"defaultVal",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}}),l.vars.set("isOk",{kind:"poly",quantifiers:["a","e"],type:{kind:"fun",params:[{name:"res",type:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}}],returnType:PRIM_BOOLEAN}}),l.vars.set("isErr",{kind:"poly",quantifiers:["a","e"],type:{kind:"fun",params:[{name:"res",type:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}}],returnType:PRIM_BOOLEAN}}),l.vars.set("flatten",{kind:"poly",quantifiers:["a","e"],type:{kind:"fun",params:[{name:"res",type:{kind:"cons",name:"Result",args:[{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]},freshTypeVar("e")]}}],returnType:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}}}),l.vars.set("toOption",{kind:"poly",quantifiers:["a","e"],type:{kind:"fun",params:[{name:"res",type:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}}}),l.vars.set("fromOption",{kind:"poly",quantifiers:["a","e"],type:{kind:"fun",params:[{name:"opt",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"err",type:freshTypeVar("e")}],returnType:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}}}),l.vars.set("fold",{kind:"poly",quantifiers:["a","e","b"],type:{kind:"fun",params:[{name:"res",type:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}},{name:"onErr",type:{kind:"fun",params:[{name:"err",type:freshTypeVar("e")}],returnType:freshTypeVar("b")}},{name:"onOk",type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:freshTypeVar("b")}}),l.vars.set("orElse",{kind:"poly",quantifiers:["a","e"],type:{kind:"fun",params:[{name:"res",type:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}},{name:"altRes",type:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}}],returnType:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}}}),l.vars.set("zip",{kind:"poly",quantifiers:["a","b","e"],type:{kind:"fun",params:[{name:"resA",type:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}},{name:"resB",type:{kind:"cons",name:"Result",args:[freshTypeVar("b"),freshTypeVar("e")]}}],returnType:{kind:"cons",name:"Result",args:[{kind:"tup",elements:[freshTypeVar("a"),freshTypeVar("b")]},freshTypeVar("e")]}}}),l.vars.set("tap",{kind:"poly",quantifiers:["a","e","b"],type:{kind:"fun",params:[{name:"res",type:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}},{name:"fn",type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}}}),l.vars.set("fromTry",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"fn",type:{kind:"fun",params:[],returnType:freshTypeVar("a")}}],returnType:{kind:"cons",name:"Result",args:[freshTypeVar("a"),PRIM_STRING]}}});for(const w of Array.from(l.vars.keys()))l.exports.add(w);a.modules.set("Result",l);const d={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set},f={kind:"gadt",name:"Either",typeParams:[{name:"l"},{name:"r"}],constructors:[{name:"Left",typeParams:[],params:[{name:"left",type:{kind:"var",name:"l"}}]},{name:"Right",typeParams:[],params:[{name:"right",type:{kind:"var",name:"r"}}]}]};d.gadts.set("Either",f),a.gadts.set("Either",f);const m={kind:"poly",quantifiers:["l","r"],type:{kind:"fun",params:[{name:"left",type:freshTypeVar("l")}],returnType:{kind:"cons",name:"Either",args:[freshTypeVar("l"),freshTypeVar("r")]}}},y={kind:"poly",quantifiers:["l","r"],type:{kind:"fun",params:[{name:"right",type:freshTypeVar("r")}],returnType:{kind:"cons",name:"Either",args:[freshTypeVar("l"),freshTypeVar("r")]}}};a.vars.set("Left",m),a.vars.set("Right",y),d.vars.set("Left",m),d.vars.set("Right",y),d.vars.set("left",m),d.vars.set("right",y),d.vars.set("pure",y),d.vars.set("of",y),d.vars.set("isLeft",{kind:"poly",quantifiers:["l","r"],type:{kind:"fun",params:[{name:"e",type:{kind:"cons",name:"Either",args:[freshTypeVar("l"),freshTypeVar("r")]}}],returnType:PRIM_BOOLEAN}}),d.vars.set("isRight",{kind:"poly",quantifiers:["l","r"],type:{kind:"fun",params:[{name:"e",type:{kind:"cons",name:"Either",args:[freshTypeVar("l"),freshTypeVar("r")]}}],returnType:PRIM_BOOLEAN}}),d.vars.set("getOrElse",{kind:"poly",quantifiers:["l","r"],type:{kind:"fun",params:[{name:"e",type:{kind:"cons",name:"Either",args:[freshTypeVar("l"),freshTypeVar("r")]}},{name:"defaultVal",type:freshTypeVar("r")}],returnType:freshTypeVar("r")}}),d.vars.set("map",{kind:"poly",quantifiers:["l","r","r2"],type:{kind:"fun",params:[{name:"e",type:{kind:"cons",name:"Either",args:[freshTypeVar("l"),freshTypeVar("r")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("r")}],returnType:freshTypeVar("r2")}}],returnType:{kind:"cons",name:"Either",args:[freshTypeVar("l"),freshTypeVar("r2")]}}}),d.vars.set("mapLeft",{kind:"poly",quantifiers:["l","r","l2"],type:{kind:"fun",params:[{name:"e",type:{kind:"cons",name:"Either",args:[freshTypeVar("l"),freshTypeVar("r")]}},{name:"fn",type:{kind:"fun",params:[{name:"err",type:freshTypeVar("l")}],returnType:freshTypeVar("l2")}}],returnType:{kind:"cons",name:"Either",args:[freshTypeVar("l2"),freshTypeVar("r")]}}}),d.vars.set("flatMap",{kind:"poly",quantifiers:["l","r","r2"],type:{kind:"fun",params:[{name:"e",type:{kind:"cons",name:"Either",args:[freshTypeVar("l"),freshTypeVar("r")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("r")}],returnType:{kind:"cons",name:"Either",args:[freshTypeVar("l"),freshTypeVar("r2")]}}}],returnType:{kind:"cons",name:"Either",args:[freshTypeVar("l"),freshTypeVar("r2")]}}}),d.vars.set("fold",{kind:"poly",quantifiers:["l","r","b"],type:{kind:"fun",params:[{name:"e",type:{kind:"cons",name:"Either",args:[freshTypeVar("l"),freshTypeVar("r")]}},{name:"onLeft",type:{kind:"fun",params:[{name:"l",type:freshTypeVar("l")}],returnType:freshTypeVar("b")}},{name:"onRight",type:{kind:"fun",params:[{name:"r",type:freshTypeVar("r")}],returnType:freshTypeVar("b")}}],returnType:freshTypeVar("b")}}),d.vars.set("swap",{kind:"poly",quantifiers:["l","r"],type:{kind:"fun",params:[{name:"e",type:{kind:"cons",name:"Either",args:[freshTypeVar("l"),freshTypeVar("r")]}}],returnType:{kind:"cons",name:"Either",args:[freshTypeVar("r"),freshTypeVar("l")]}}}),d.vars.set("toOption",{kind:"poly",quantifiers:["l","r"],type:{kind:"fun",params:[{name:"e",type:{kind:"cons",name:"Either",args:[freshTypeVar("l"),freshTypeVar("r")]}}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("r")]}}}),d.vars.set("toResult",{kind:"poly",quantifiers:["l","r"],type:{kind:"fun",params:[{name:"e",type:{kind:"cons",name:"Either",args:[freshTypeVar("l"),freshTypeVar("r")]}}],returnType:{kind:"cons",name:"Result",args:[freshTypeVar("r"),freshTypeVar("l")]}}}),d.vars.set("fromResult",{kind:"poly",quantifiers:["a","e"],type:{kind:"fun",params:[{name:"res",type:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}}],returnType:{kind:"cons",name:"Either",args:[freshTypeVar("e"),freshTypeVar("a")]}}});for(const w of Array.from(d.vars.keys()))d.exports.add(w);a.modules.set("Either",d);const _={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set},g={kind:"poly",quantifiers:["r","a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Reader",args:[freshTypeVar("r"),freshTypeVar("a")]}}};_.vars.set("pure",g),_.vars.set("of",g),_.vars.set("ask",{kind:"poly",quantifiers:["r"],type:{kind:"fun",params:[],returnType:{kind:"cons",name:"Reader",args:[freshTypeVar("r"),freshTypeVar("r")]}}}),_.vars.set("asks",{kind:"poly",quantifiers:["r","a"],type:{kind:"fun",params:[{name:"fn",type:{kind:"fun",params:[{name:"env",type:freshTypeVar("r")}],returnType:freshTypeVar("a")}}],returnType:{kind:"cons",name:"Reader",args:[freshTypeVar("r"),freshTypeVar("a")]}}}),_.vars.set("run",{kind:"poly",quantifiers:["r","a"],type:{kind:"fun",params:[{name:"reader",type:{kind:"cons",name:"Reader",args:[freshTypeVar("r"),freshTypeVar("a")]}},{name:"environment",type:freshTypeVar("r")}],returnType:freshTypeVar("a")}}),_.vars.set("map",{kind:"poly",quantifiers:["r","a","b"],type:{kind:"fun",params:[{name:"reader",type:{kind:"cons",name:"Reader",args:[freshTypeVar("r"),freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:{kind:"cons",name:"Reader",args:[freshTypeVar("r"),freshTypeVar("b")]}}}),_.vars.set("flatMap",{kind:"poly",quantifiers:["r","a","b"],type:{kind:"fun",params:[{name:"reader",type:{kind:"cons",name:"Reader",args:[freshTypeVar("r"),freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Reader",args:[freshTypeVar("r"),freshTypeVar("b")]}}}],returnType:{kind:"cons",name:"Reader",args:[freshTypeVar("r"),freshTypeVar("b")]}}}),_.vars.set("local",{kind:"poly",quantifiers:["r","r2","a"],type:{kind:"fun",params:[{name:"reader",type:{kind:"cons",name:"Reader",args:[freshTypeVar("r"),freshTypeVar("a")]}},{name:"transformEnv",type:{kind:"fun",params:[{name:"env",type:freshTypeVar("r2")}],returnType:freshTypeVar("r")}}],returnType:{kind:"cons",name:"Reader",args:[freshTypeVar("r2"),freshTypeVar("a")]}}});for(const w of Array.from(_.vars.keys()))_.exports.add(w);a.modules.set("Reader",_);const h={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set},T={kind:"poly",quantifiers:["w","a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Writer",args:[freshTypeVar("w"),freshTypeVar("a")]}}};h.vars.set("pure",T),h.vars.set("of",T),h.vars.set("tell",{kind:"poly",quantifiers:["w"],type:{kind:"fun",params:[{name:"entry",type:freshTypeVar("w")}],returnType:{kind:"cons",name:"Writer",args:[freshTypeVar("w"),PRIM_VOID]}}}),h.vars.set("run",{kind:"poly",quantifiers:["w","a"],type:{kind:"fun",params:[{name:"writer",type:{kind:"cons",name:"Writer",args:[freshTypeVar("w"),freshTypeVar("a")]}}],returnType:{kind:"tup",elements:[freshTypeVar("a"),{kind:"tup",elements:[freshTypeVar("w")]}]}}}),h.vars.set("value",{kind:"poly",quantifiers:["w","a"],type:{kind:"fun",params:[{name:"writer",type:{kind:"cons",name:"Writer",args:[freshTypeVar("w"),freshTypeVar("a")]}}],returnType:freshTypeVar("a")}}),h.vars.set("log",{kind:"poly",quantifiers:["w","a"],type:{kind:"fun",params:[{name:"writer",type:{kind:"cons",name:"Writer",args:[freshTypeVar("w"),freshTypeVar("a")]}}],returnType:{kind:"tup",elements:[freshTypeVar("w")]}}}),h.vars.set("map",{kind:"poly",quantifiers:["w","a","b"],type:{kind:"fun",params:[{name:"writer",type:{kind:"cons",name:"Writer",args:[freshTypeVar("w"),freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:{kind:"cons",name:"Writer",args:[freshTypeVar("w"),freshTypeVar("b")]}}}),h.vars.set("flatMap",{kind:"poly",quantifiers:["w","a","b"],type:{kind:"fun",params:[{name:"writer",type:{kind:"cons",name:"Writer",args:[freshTypeVar("w"),freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Writer",args:[freshTypeVar("w"),freshTypeVar("b")]}}}],returnType:{kind:"cons",name:"Writer",args:[freshTypeVar("w"),freshTypeVar("b")]}}}),h.vars.set("listen",{kind:"poly",quantifiers:["w","a"],type:{kind:"fun",params:[{name:"writer",type:{kind:"cons",name:"Writer",args:[freshTypeVar("w"),freshTypeVar("a")]}}],returnType:{kind:"cons",name:"Writer",args:[freshTypeVar("w"),{kind:"tup",elements:[freshTypeVar("a"),{kind:"tup",elements:[freshTypeVar("w")]}]}]}}});for(const w of Array.from(h.vars.keys()))h.exports.add(w);a.modules.set("Writer",h);const L={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set},A={kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Task",args:[freshTypeVar("a")]}}};L.vars.set("pure",A),L.vars.set("of",A),L.vars.set("succeed",A),L.vars.set("delay",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"fn",type:{kind:"fun",params:[],returnType:freshTypeVar("a")}}],returnType:{kind:"cons",name:"Task",args:[freshTypeVar("a")]}}}),L.vars.set("run",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"task",type:{kind:"cons",name:"Task",args:[freshTypeVar("a")]}}],returnType:freshTypeVar("a")}}),L.vars.set("map",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"task",type:{kind:"cons",name:"Task",args:[freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:{kind:"cons",name:"Task",args:[freshTypeVar("b")]}}}),L.vars.set("flatMap",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"task",type:{kind:"cons",name:"Task",args:[freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Task",args:[freshTypeVar("b")]}}}],returnType:{kind:"cons",name:"Task",args:[freshTypeVar("b")]}}});for(const w of Array.from(L.vars.keys()))L.exports.add(w);a.modules.set("Task",L);const V={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set},I={kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"IO",args:[freshTypeVar("a")]}}};V.vars.set("pure",I),V.vars.set("of",I),V.vars.set("flatMap",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"io",type:{kind:"cons",name:"IO",args:[freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"IO",args:[freshTypeVar("b")]}}}],returnType:{kind:"cons",name:"IO",args:[freshTypeVar("b")]}}}),V.vars.set("map",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"io",type:{kind:"cons",name:"IO",args:[freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:{kind:"cons",name:"IO",args:[freshTypeVar("b")]}}}),V.vars.set("run",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"io",type:{kind:"cons",name:"IO",args:[freshTypeVar("a")]}}],returnType:freshTypeVar("a")}}),V.vars.set("delay",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"fn",type:{kind:"fun",params:[],returnType:freshTypeVar("a")}}],returnType:{kind:"cons",name:"IO",args:[freshTypeVar("a")]}}}),V.vars.set("println",{kind:"fun",params:[{name:"msg",type:PRIM_STRING}],returnType:{kind:"cons",name:"IO",args:[PRIM_VOID]}});for(const w of Array.from(V.vars.keys()))V.exports.add(w);a.modules.set("IO",V);const P={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set},$={kind:"poly",quantifiers:["s","a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"State",args:[freshTypeVar("s"),freshTypeVar("a")]}}};P.vars.set("pure",$),P.vars.set("of",$),P.vars.set("get",{kind:"poly",quantifiers:["s"],type:{kind:"fun",params:[],returnType:{kind:"cons",name:"State",args:[freshTypeVar("s"),freshTypeVar("s")]}}}),P.vars.set("set",{kind:"poly",quantifiers:["s"],type:{kind:"fun",params:[{name:"newState",type:freshTypeVar("s")}],returnType:{kind:"cons",name:"State",args:[freshTypeVar("s"),PRIM_VOID]}}}),P.vars.set("modify",{kind:"poly",quantifiers:["s"],type:{kind:"fun",params:[{name:"fn",type:{kind:"fun",params:[{name:"s",type:freshTypeVar("s")}],returnType:freshTypeVar("s")}}],returnType:{kind:"cons",name:"State",args:[freshTypeVar("s"),PRIM_VOID]}}}),P.vars.set("run",{kind:"poly",quantifiers:["s","a"],type:{kind:"fun",params:[{name:"st",type:{kind:"cons",name:"State",args:[freshTypeVar("s"),freshTypeVar("a")]}},{name:"initialState",type:freshTypeVar("s")}],returnType:{kind:"tup",elements:[freshTypeVar("a"),freshTypeVar("s")]}}}),P.vars.set("evalState",{kind:"poly",quantifiers:["s","a"],type:{kind:"fun",params:[{name:"st",type:{kind:"cons",name:"State",args:[freshTypeVar("s"),freshTypeVar("a")]}},{name:"initialState",type:freshTypeVar("s")}],returnType:freshTypeVar("a")}}),P.vars.set("execState",{kind:"poly",quantifiers:["s","a"],type:{kind:"fun",params:[{name:"st",type:{kind:"cons",name:"State",args:[freshTypeVar("s"),freshTypeVar("a")]}},{name:"initialState",type:freshTypeVar("s")}],returnType:freshTypeVar("s")}}),P.vars.set("map",{kind:"poly",quantifiers:["s","a","b"],type:{kind:"fun",params:[{name:"st",type:{kind:"cons",name:"State",args:[freshTypeVar("s"),freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:{kind:"cons",name:"State",args:[freshTypeVar("s"),freshTypeVar("b")]}}}),P.vars.set("flatMap",{kind:"poly",quantifiers:["s","a","b"],type:{kind:"fun",params:[{name:"st",type:{kind:"cons",name:"State",args:[freshTypeVar("s"),freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"State",args:[freshTypeVar("s"),freshTypeVar("b")]}}}],returnType:{kind:"cons",name:"State",args:[freshTypeVar("s"),freshTypeVar("b")]}}});for(const w of Array.from(P.vars.keys()))P.exports.add(w);a.modules.set("State",P);const b={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set},S={kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"a",type:freshTypeVar("a")},{name:"b",type:freshTypeVar("b")}],returnType:PRIM_BOOLEAN}};b.vars.set("equals",S),b.vars.set("notEquals",S),b.vars.set("fromEquals",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"eqFn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")},{name:"y",type:freshTypeVar("a")}],returnType:PRIM_BOOLEAN}}],returnType:freshTypeVar("a")}}),b.vars.set("contramap",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"setoid",type:freshTypeVar("b")},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:freshTypeVar("a")}});for(const w of Array.from(b.vars.keys()))b.exports.add(w);a.modules.set("Setoid",b);const v={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set};v.vars.set("Less",{kind:"cons",name:"Ordering",args:[]}),v.vars.set("Equal",{kind:"cons",name:"Ordering",args:[]}),v.vars.set("Greater",{kind:"cons",name:"Ordering",args:[]}),v.vars.set("compare",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"a",type:freshTypeVar("a")},{name:"b",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Ordering",args:[]}}}),v.vars.set("min",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"a",type:freshTypeVar("a")},{name:"b",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}}),v.vars.set("max",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"a",type:freshTypeVar("a")},{name:"b",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}}),v.vars.set("clamp",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")},{name:"minVal",type:freshTypeVar("a")},{name:"maxVal",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}}),v.vars.set("between",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")},{name:"minVal",type:freshTypeVar("a")},{name:"maxVal",type:freshTypeVar("a")}],returnType:PRIM_BOOLEAN}}),v.vars.set("isLess",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"a",type:freshTypeVar("a")},{name:"b",type:freshTypeVar("a")}],returnType:PRIM_BOOLEAN}}),v.vars.set("isGreater",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"a",type:freshTypeVar("a")},{name:"b",type:freshTypeVar("a")}],returnType:PRIM_BOOLEAN}}),v.vars.set("isEqual",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"a",type:freshTypeVar("a")},{name:"b",type:freshTypeVar("a")}],returnType:PRIM_BOOLEAN}}),v.vars.set("fromCompare",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"cmpFn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")},{name:"y",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Ordering",args:[]}}}],returnType:freshTypeVar("a")}}),v.vars.set("contramap",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"ordB",type:freshTypeVar("b")},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:freshTypeVar("a")}}),v.vars.set("reverse",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"ord",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}});for(const w of Array.from(v.vars.keys()))v.exports.add(w);a.modules.set("Ord",v);const R={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set};R.vars.set("combine",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"a",type:freshTypeVar("a")},{name:"b",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}}),R.vars.set("concatAll",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"list",type:{kind:"tup",elements:[freshTypeVar("a")]}},{name:"fallback",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}}),R.vars.set("first",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[],returnType:freshTypeVar("a")}}),R.vars.set("last",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[],returnType:freshTypeVar("a")}}),R.vars.set("struct",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"semigroups",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}}),R.vars.set("dual",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"semigroup",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}});for(const w of Array.from(R.vars.keys()))R.exports.add(w);a.modules.set("Semigroup",R),a.modules.set("SemiGroup",R);const E={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set};E.vars.set("empty",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"typeOrName",type:PRIM_STRING}],returnType:freshTypeVar("a")}}),E.vars.set("combine",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"a",type:freshTypeVar("a")},{name:"b",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}}),E.vars.set("concatAll",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"list",type:{kind:"tup",elements:[freshTypeVar("a")]}},{name:"identity",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}}),E.vars.set("Sum",freshTypeVar("a")),E.vars.set("Product",freshTypeVar("a")),E.vars.set("String",freshTypeVar("a")),E.vars.set("Array",freshTypeVar("a")),E.vars.set("All",freshTypeVar("a")),E.vars.set("Any",freshTypeVar("a")),E.vars.set("struct",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"monoids",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}});for(const w of Array.from(E.vars.keys()))E.exports.add(w);a.modules.set("Monoid",E);const k={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set};k.vars.set("invert",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"a",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}}),k.vars.set("subtract",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"a",type:freshTypeVar("a")},{name:"b",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}}),k.vars.set("SumNumber",freshTypeVar("a")),k.vars.set("ProductNonZero",freshTypeVar("a"));for(const w of Array.from(k.vars.keys()))k.exports.add(w);a.modules.set("Group",k);const O={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set};O.vars.set("map",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"fa",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("b")]}}}),O.vars.set("lift",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:{kind:"fun",params:[{name:"fa",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("b")]}}}}),O.vars.set("as",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"fa",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"val",type:freshTypeVar("b")}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("b")]}}}),O.vars.set("voidRight",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"fa",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}}],returnType:{kind:"cons",name:"Option",args:[PRIM_STRING]}}}),O.vars.set("flap",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"fab",type:freshTypeVar("a")},{name:"a",type:freshTypeVar("b")}],returnType:freshTypeVar("a")}});for(const w of Array.from(O.vars.keys()))O.exports.add(w);a.modules.set("Functor",O);const x={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set};x.vars.set("contramap",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"fa",type:{kind:"fun",params:[{name:"y",type:freshTypeVar("b")}],returnType:PRIM_BOOLEAN}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:PRIM_BOOLEAN}}}),x.vars.set("cmap",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"fa",type:{kind:"fun",params:[{name:"y",type:freshTypeVar("b")}],returnType:PRIM_BOOLEAN}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:PRIM_BOOLEAN}}}),x.vars.set("predicate",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"pred",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:PRIM_BOOLEAN}}],returnType:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:PRIM_BOOLEAN}}});for(const w of Array.from(x.vars.keys()))x.exports.add(w);a.modules.set("Contravariant",x);const M={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set};M.vars.set("pure",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}}}),M.vars.set("ap",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"ff",type:{kind:"cons",name:"Option",args:[{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}]}},{name:"fa",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("b")]}}}),M.vars.set("lift2",{kind:"poly",quantifiers:["a","b","c"],type:{kind:"fun",params:[{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")},{name:"y",type:freshTypeVar("b")}],returnType:freshTypeVar("c")}},{name:"fa",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"fb",type:{kind:"cons",name:"Option",args:[freshTypeVar("b")]}}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("c")]}}}),M.vars.set("lift3",{kind:"poly",quantifiers:["a","b","c","d"],type:{kind:"fun",params:[{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")},{name:"y",type:freshTypeVar("b")},{name:"z",type:freshTypeVar("c")}],returnType:freshTypeVar("d")}},{name:"fa",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"fb",type:{kind:"cons",name:"Option",args:[freshTypeVar("b")]}},{name:"fc",type:{kind:"cons",name:"Option",args:[freshTypeVar("c")]}}],returnType:{kind:"cons",name:"Option",args:[freshTypeVar("d")]}}}),M.vars.set("zip",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"fa",type:{kind:"cons",name:"Option",args:[freshTypeVar("a")]}},{name:"fb",type:{kind:"cons",name:"Option",args:[freshTypeVar("b")]}}],returnType:{kind:"cons",name:"Option",args:[{kind:"tup",elements:[freshTypeVar("a"),freshTypeVar("b")]}]}}});for(const w of Array.from(M.vars.keys()))M.exports.add(w);a.modules.set("Applicative",M);const N={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set};N.vars.set("Valid",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Validation",args:[freshTypeVar("a")]}}}),N.vars.set("Invalid",{kind:"poly",quantifiers:["e"],type:{kind:"fun",params:[{name:"errs",type:{kind:"tup",elements:[freshTypeVar("e")]}}],returnType:{kind:"cons",name:"Validation",args:[freshTypeVar("e")]}}}),N.vars.set("pure",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:{kind:"cons",name:"Validation",args:[freshTypeVar("a")]}}}),N.vars.set("invalid",{kind:"poly",quantifiers:["e"],type:{kind:"fun",params:[{name:"err",type:freshTypeVar("e")}],returnType:{kind:"cons",name:"Validation",args:[freshTypeVar("e")]}}}),N.vars.set("isValid",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"v",type:{kind:"cons",name:"Validation",args:[freshTypeVar("a")]}}],returnType:PRIM_BOOLEAN}}),N.vars.set("isInvalid",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"v",type:{kind:"cons",name:"Validation",args:[freshTypeVar("a")]}}],returnType:PRIM_BOOLEAN}}),N.vars.set("map",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"v",type:{kind:"cons",name:"Validation",args:[freshTypeVar("a")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:{kind:"cons",name:"Validation",args:[freshTypeVar("b")]}}}),N.vars.set("ap",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"vf",type:{kind:"cons",name:"Validation",args:[{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}]}},{name:"va",type:{kind:"cons",name:"Validation",args:[freshTypeVar("a")]}}],returnType:{kind:"cons",name:"Validation",args:[freshTypeVar("b")]}}}),N.vars.set("accumulate",{kind:"poly",quantifiers:["a","b","c"],type:{kind:"fun",params:[{name:"v1",type:{kind:"cons",name:"Validation",args:[freshTypeVar("a")]}},{name:"v2",type:{kind:"cons",name:"Validation",args:[freshTypeVar("b")]}},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")},{name:"y",type:freshTypeVar("b")}],returnType:freshTypeVar("c")}}],returnType:{kind:"cons",name:"Validation",args:[freshTypeVar("c")]}}}),N.vars.set("getOrElse",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"v",type:{kind:"cons",name:"Validation",args:[freshTypeVar("a")]}},{name:"defaultVal",type:freshTypeVar("a")}],returnType:freshTypeVar("a")}}),N.vars.set("toResult",{kind:"poly",quantifiers:["a","e"],type:{kind:"fun",params:[{name:"v",type:{kind:"cons",name:"Validation",args:[freshTypeVar("a")]}}],returnType:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("e")]}}});for(const w of Array.from(N.vars.keys()))N.exports.add(w);a.modules.set("Validation",N);const q={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set};q.vars.set("bimap",{kind:"poly",quantifiers:["a","b","c","d"],type:{kind:"fun",params:[{name:"fab",type:{kind:"cons",name:"Result",args:[freshTypeVar("a"),freshTypeVar("b")]}},{name:"f",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("b")}],returnType:freshTypeVar("d")}},{name:"g",type:{kind:"fun",params:[{name:"y",type:freshTypeVar("a")}],returnType:freshTypeVar("c")}}],returnType:{kind:"cons",name:"Result",args:[freshTypeVar("c"),freshTypeVar("d")]}}});for(const w of Array.from(q.vars.keys()))q.exports.add(w);a.modules.set("Bifunctor",q);const C={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set},j={kind:"poly",quantifiers:["a","b","c","d"],type:{kind:"fun",params:[{name:"pab",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}},{name:"f",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("c")}],returnType:freshTypeVar("a")}},{name:"g",type:{kind:"fun",params:[{name:"y",type:freshTypeVar("b")}],returnType:freshTypeVar("d")}}],returnType:{kind:"fun",params:[{name:"x",type:freshTypeVar("c")}],returnType:freshTypeVar("d")}}};C.vars.set("dimap",j),C.vars.set("promap",j);for(const w of Array.from(C.vars.keys()))C.exports.add(w);a.modules.set("Profunctor",C);const F={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set};F.vars.set("foldLeft",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"fa",type:{kind:"tup",elements:[freshTypeVar("a")]}},{name:"initial",type:freshTypeVar("b")},{name:"fn",type:{kind:"fun",params:[{name:"acc",type:freshTypeVar("b")},{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("b")}}],returnType:freshTypeVar("b")}}),F.vars.set("foldMap",{kind:"poly",quantifiers:["a","m"],type:{kind:"fun",params:[{name:"fa",type:{kind:"tup",elements:[freshTypeVar("a")]}},{name:"monoid",type:freshTypeVar("m")},{name:"fn",type:{kind:"fun",params:[{name:"x",type:freshTypeVar("a")}],returnType:freshTypeVar("m")}}],returnType:freshTypeVar("m")}});for(const w of Array.from(F.vars.keys()))F.exports.add(w);a.modules.set("Foldable",F);const B={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set};B.vars.set("getElementById",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"id",type:PRIM_STRING}],returnType:freshTypeVar("a")}}),B.vars.set("createElement",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"tag",type:PRIM_STRING}],returnType:freshTypeVar("a")}}),B.vars.set("setText",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"el",type:freshTypeVar("a")},{name:"text",type:PRIM_STRING}],returnType:PRIM_VOID}}),B.vars.set("getValue",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"el",type:freshTypeVar("a")}],returnType:PRIM_STRING}}),B.vars.set("setValue",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"el",type:freshTypeVar("a")},{name:"val",type:PRIM_STRING}],returnType:PRIM_VOID}}),B.vars.set("focus",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"el",type:freshTypeVar("a")}],returnType:PRIM_VOID}}),B.vars.set("blur",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"el",type:freshTypeVar("a")}],returnType:PRIM_VOID}}),B.vars.set("setHtml",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"el",type:freshTypeVar("a")},{name:"html",type:PRIM_STRING}],returnType:PRIM_VOID}}),B.vars.set("setAttr",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"el",type:freshTypeVar("a")},{name:"attr",type:PRIM_STRING},{name:"val",type:PRIM_STRING}],returnType:PRIM_VOID}}),B.vars.set("appendChild",{kind:"poly",quantifiers:["a","b"],type:{kind:"fun",params:[{name:"parent",type:freshTypeVar("a")},{name:"child",type:freshTypeVar("b")}],returnType:PRIM_VOID}}),B.vars.set("addEventListener",{kind:"poly",quantifiers:["a","e"],type:{kind:"fun",params:[{name:"el",type:freshTypeVar("a")},{name:"evt",type:PRIM_STRING},{name:"handler",type:{kind:"fun",params:[{name:"e",type:freshTypeVar("e")}],returnType:PRIM_VOID}}],returnType:PRIM_VOID}}),B.vars.set("h",{kind:"poly",quantifiers:["p","c","v"],type:{kind:"fun",params:[{name:"tag",type:PRIM_STRING},{name:"props",type:freshTypeVar("p")},{name:"children",type:freshTypeVar("c")}],returnType:freshTypeVar("v")}}),B.vars.set("mount",{kind:"poly",quantifiers:["c","v"],type:{kind:"fun",params:[{name:"containerId",type:freshTypeVar("c")},{name:"vnode",type:freshTypeVar("v")}],returnType:PRIM_VOID}}),a.vars.set("requestAnimationFrame",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"callback",type:{kind:"fun",params:[],returnType:PRIM_VOID}}],returnType:PRIM_VOID}}),a.vars.set("setInterval",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"callback",type:{kind:"fun",params:[],returnType:PRIM_VOID}},{name:"ms",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}}),a.vars.set("clearInterval",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"handle",type:PRIM_NUMBER}],returnType:PRIM_VOID}}),a.vars.set("setTimeout",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"callback",type:{kind:"fun",params:[],returnType:PRIM_VOID}},{name:"ms",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}}),a.vars.set("clearTimeout",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"handle",type:PRIM_NUMBER}],returnType:PRIM_VOID}}),B.vars.set("eval",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"code",type:PRIM_STRING}],returnType:freshTypeVar("a")}}),B.vars.set("log",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"val",type:freshTypeVar("a")}],returnType:PRIM_VOID}}),B.vars.set("initAudio",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[],returnType:PRIM_VOID}}),B.vars.set("playCustomTone",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"freq",type:PRIM_NUMBER},{name:"waveType",type:PRIM_STRING},{name:"duration",type:PRIM_NUMBER},{name:"volume",type:PRIM_NUMBER},{name:"attack",type:PRIM_NUMBER}],returnType:PRIM_VOID}}),B.vars.set("playNoise",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"duration",type:PRIM_NUMBER},{name:"volume",type:PRIM_NUMBER}],returnType:PRIM_VOID}}),B.vars.set("playTone",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"freq",type:PRIM_NUMBER},{name:"duration",type:PRIM_NUMBER},{name:"waveType",type:PRIM_STRING},{name:"volume",type:PRIM_NUMBER}],returnType:PRIM_VOID}}),B.vars.set("playRamp",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"startFreq",type:PRIM_NUMBER},{name:"endFreq",type:PRIM_NUMBER},{name:"duration",type:PRIM_NUMBER},{name:"waveType",type:PRIM_STRING},{name:"volume",type:PRIM_NUMBER}],returnType:PRIM_VOID}}),B.vars.set("playSequence",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"notes",type:{kind:"tup",elements:[PRIM_NUMBER]}},{name:"noteDuration",type:PRIM_NUMBER},{name:"waveType",type:PRIM_STRING},{name:"volume",type:PRIM_NUMBER}],returnType:PRIM_VOID}}),B.vars.set("startMusic",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"id",type:PRIM_STRING},{name:"notes",type:{kind:"tup",elements:[PRIM_NUMBER]}},{name:"intervalMs",type:PRIM_NUMBER},{name:"waveType",type:PRIM_STRING},{name:"volume",type:PRIM_NUMBER}],returnType:PRIM_VOID}}),B.vars.set("stopMusic",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"id",type:PRIM_STRING}],returnType:PRIM_VOID}}),B.vars.set("resumeAudio",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[],returnType:PRIM_VOID}}),B.vars.set("confetti",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"count",type:PRIM_NUMBER},{name:"spread",type:PRIM_NUMBER},{name:"originY",type:PRIM_NUMBER}],returnType:PRIM_VOID}}),B.vars.set("setInterval",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"callback",type:{kind:"fun",params:[],returnType:PRIM_VOID}},{name:"ms",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}}),B.vars.set("clearInterval",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"handle",type:PRIM_NUMBER}],returnType:PRIM_VOID}}),B.vars.set("setTimeout",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"callback",type:{kind:"fun",params:[],returnType:PRIM_VOID}},{name:"ms",type:PRIM_NUMBER}],returnType:PRIM_NUMBER}}),B.vars.set("clearTimeout",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"handle",type:PRIM_NUMBER}],returnType:PRIM_VOID}}),B.vars.set("requestAnimationFrame",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"callback",type:{kind:"fun",params:[],returnType:PRIM_VOID}}],returnType:PRIM_VOID}}),B.vars.set("storageGet",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"key",type:PRIM_STRING}],returnType:PRIM_STRING}}),B.vars.set("storageSet",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"key",type:PRIM_STRING},{name:"val",type:PRIM_STRING}],returnType:PRIM_VOID}}),B.vars.set("storageRemove",{kind:"poly",quantifiers:[],type:{kind:"fun",params:[{name:"key",type:PRIM_STRING}],returnType:PRIM_VOID}});for(const w of Array.from(B.vars.keys()))B.exports.add(w);a.modules.set("DOM",B);const Y={vars:new Map,mutVars:new Set,gadts:new Map,typeAliases:new Map,modules:new Map,exports:new Set};Y.vars.set("stringify",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"data",type:freshTypeVar("a")}],returnType:PRIM_STRING}}),Y.vars.set("parse",{kind:"poly",quantifiers:["a"],type:{kind:"fun",params:[{name:"jsonStr",type:PRIM_STRING}],returnType:freshTypeVar("a")}}),Y.vars.set("envGet",{kind:"fun",params:[{name:"key",type:PRIM_STRING}],returnType:PRIM_STRING}),Y.vars.set("readFile",{kind:"fun",params:[{name:"path",type:PRIM_STRING}],returnType:PRIM_STRING}),Y.vars.set("writeFile",{kind:"fun",params:[{name:"path",type:PRIM_STRING},{name:"content",type:PRIM_STRING}],returnType:PRIM_VOID}),Y.vars.set("createApp",{kind:"poly",quantifiers:["app"],type:{kind:"fun",params:[],returnType:freshTypeVar("app")}}),Y.vars.set("get",{kind:"poly",quantifiers:["app","req","res"],type:{kind:"fun",params:[{name:"app",type:freshTypeVar("app")},{name:"path",type:PRIM_STRING},{name:"handler",type:{kind:"fun",params:[{name:"req",type:freshTypeVar("req")},{name:"res",type:freshTypeVar("res")}],returnType:PRIM_VOID}}],returnType:PRIM_VOID}}),Y.vars.set("post",{kind:"poly",quantifiers:["app","req","res"],type:{kind:"fun",params:[{name:"app",type:freshTypeVar("app")},{name:"path",type:PRIM_STRING},{name:"handler",type:{kind:"fun",params:[{name:"req",type:freshTypeVar("req")},{name:"res",type:freshTypeVar("res")}],returnType:PRIM_VOID}}],returnType:PRIM_VOID}}),Y.vars.set("use",{kind:"poly",quantifiers:["app","req","res"],type:{kind:"fun",params:[{name:"app",type:freshTypeVar("app")},{name:"middleware",type:{kind:"fun",params:[{name:"req",type:freshTypeVar("req")},{name:"res",type:freshTypeVar("res")},{name:"next",type:{kind:"fun",params:[],returnType:PRIM_VOID}}],returnType:PRIM_VOID}}],returnType:PRIM_VOID}}),Y.vars.set("listen",{kind:"poly",quantifiers:["app","server"],type:{kind:"fun",params:[{name:"app",type:freshTypeVar("app")},{name:"port",type:PRIM_NUMBER},{name:"callback",type:{kind:"fun",params:[],returnType:PRIM_VOID}}],returnType:freshTypeVar("server")}}),Y.vars.set("send",{kind:"poly",quantifiers:["res"],type:{kind:"fun",params:[{name:"res",type:freshTypeVar("res")},{name:"body",type:PRIM_STRING}],returnType:PRIM_VOID}}),Y.vars.set("json",{kind:"poly",quantifiers:["res","data"],type:{kind:"fun",params:[{name:"res",type:freshTypeVar("res")},{name:"data",type:freshTypeVar("data")}],returnType:PRIM_VOID}}),Y.vars.set("status",{kind:"poly",quantifiers:["res"],type:{kind:"fun",params:[{name:"res",type:freshTypeVar("res")},{name:"statusCode",type:PRIM_NUMBER}],returnType:freshTypeVar("res")}}),Y.vars.set("now",{kind:"fun",params:[],returnType:PRIM_NUMBER});for(const w of Array.from(Y.vars.keys()))Y.exports.add(w);a.modules.set("Node",Y);for(const[w]of a.vars){const D=getRootBuiltinDoc(w);D&&((G=a.docs)==null||G.set(w,D))}for(const[w,D]of a.modules){D.docs=new Map,D.moduleDoc=getStdLibModuleDoc(w);for(const[z,K]of D.vars){const W=K.kind==="poly"?K.type:K,J=W.kind==="fun"?W.params.map((Z,Q)=>Z.name||`arg${Q+1}`):[],U=W.kind==="fun"?typeToString(W.returnType):void 0,H=getStdLibMemberDoc(w,z,J,U);H&&D.docs.set(z,H)}}return a}class TypeChecker{constructor(e={}){this.diagnostics=[],this.symbols=[],this.recursionDepth=0,this.maxRecursionDepth=250,this.unifyDepth=0,this.maxUnifyDepth=250,this.astDepth=0,this.maxAstDepth=250,this.typeIdCounter=0,this.unifyingPairs=new Set,this.options=e}registerSymbol(e){this.symbols.push(e)}getOrAssignId(e){return e._id||(e._id=++this.typeIdCounter),e._id}checkProgram(e){this.recursionDepth=0,this.unifyDepth=0,this.astDepth=0,this.symbols=[];const t=createInitialEnv();return this.checkStatementList(e.statements,t),t}checkStatementList(e,t){var n,r;for(const s of e)if(s.kind==="s_type_alias"){const i=new Map;for(const l of s.decl.typeParams){const c=getTypeParamName(l);i.set(c,createTypeVarForParam(l))}const o=this.astToType(s.decl.type,t,i);t.typeAliases.set(s.decl.name,{typeParams:s.decl.typeParams,type:o}),s.isExported&&t.exports.add(s.decl.name),this.registerSymbol({name:s.decl.name,type:o,kind:"type_alias",isExported:s.isExported,loc:s.decl.loc||s.loc,doc:renderDocComment(s.decl.docComment)||`Type Alias \`${s.decl.name}\``})}else if(s.kind==="s_gadt"){t.gadts.set(s.decl.name,{name:s.decl.name,typeParams:s.decl.typeParams,constructors:s.decl.constructors}),s.isExported&&t.exports.add(s.decl.name),this.registerSymbol({name:s.decl.name,type:{kind:"cons",name:s.decl.name,args:s.decl.typeParams.map(i=>({kind:"var",id:0,name:getTypeParamName(i)}))},kind:"gadt",isExported:s.isExported,loc:s.decl.loc||s.loc,doc:renderDocComment(s.decl.docComment)||`GADT Type \`${s.decl.name}\``});for(const i of s.decl.constructors){const o=new Map,l=[...s.decl.typeParams,...i.typeParams],c=[],u=new Map;for(const m of l){const y=getTypeParamName(m),_=getTypeParamKind(m);c.push(y),u.set(y,_),o.set(y,createTypeVarForParam(m))}const p=i.params.map(m=>({name:m.name,type:this.astToType(m.type,t,o)}));let d;if(i.returnType)d=this.astToType(i.returnType,t,o);else{const m=s.decl.typeParams.map(y=>o.get(getTypeParamName(y))||createTypeVarForParam(y));d={kind:"cons",name:s.decl.name,args:m}}let f;i.params.length===0?f=d:f={kind:"fun",params:p,returnType:d},c.length>0&&(f={kind:"poly",quantifiers:c,quantifierKinds:u,type:f}),t.vars.set(i.name,f),i.loc&&((n=t.defLocs)==null||n.set(i.name,i.loc)),s.isExported&&t.exports.add(i.name),this.registerSymbol({name:i.name,type:f,kind:"constructor",loc:i.loc,containerName:s.decl.name,doc:renderDocComment(i.docComment,i.params.map(m=>m.name))||`GADT Constructor \`${i.name}\` for type \`${s.decl.name}\``})}}for(const s of e)if(s.kind==="s_function"){const i=new Map,o=[],l=new Map;for(const d of s.typeParams){const f=getTypeParamName(d),m=getTypeParamKind(d);o.push(f),l.set(f,m),i.set(f,createTypeVarForParam(d))}const c=s.params.map(d=>({name:d.name,type:this.astToType(d.type,t,i)})),u=this.astToType(s.returnType,t,i);let p={kind:"fun",params:c,returnType:u};o.length>0&&(p={kind:"poly",quantifiers:o,quantifierKinds:l,type:p}),t.vars.set(s.name,p),s.loc&&((r=t.defLocs)==null||r.set(s.name,s.loc)),s.isExported&&t.exports.add(s.name)}for(const s of e)this.checkStatement(s,t)}astToType(e,t,n=new Map){if(this.astDepth++,this.astDepth>this.maxAstDepth)return this.addError(`Type error: Exceeded maximum recursion depth of ${this.maxAstDepth} while constructing recursive GADT type AST.`,void 0,"Type Checking"),this.astDepth--,freshTypeVar("depth_exceeded");try{return this.astToTypeInner(e,t,n)}finally{this.astDepth--}}astToTypeInner(e,t,n=new Map){switch(e.kind){case"base":switch(e.name){case"number":return PRIM_NUMBER;case"boolean":return PRIM_BOOLEAN;case"string":return PRIM_STRING;case"void":return PRIM_VOID}case"var":{if(n.has(e.name))return n.get(e.name);if(t.typeAliases.has(e.name)){const s=t.typeAliases.get(e.name);if(s.typeParams.length===0)return s.type}const r=freshTypeVar(e.name);return n.set(e.name,r),r}case"type_lambda":{const r=new Map(n),s=[];for(const o of e.params){const l=getTypeParamName(o);s.push(l),r.set(l,createTypeVarForParam(o))}const i=this.astToType(e.body,t,r);return{kind:"type_lambda",params:s,body:i}}case"hkt_app":{const r=this.astToType(e.target,t,n),s=e.args.map(i=>this.astToType(i,t,n));return prune({kind:"hkt_app",constructor:r,args:s})}case"fun":{const r=new Map(n),s=[],i=new Map;for(const u of e.typeParams){const p=getTypeParamName(u),d=getTypeParamKind(u);s.push(p),i.set(p,d),r.set(p,createTypeVarForParam(u))}const o=e.params.map(u=>({name:u.name,type:this.astToType(u.type,t,r)})),l=this.astToType(e.returnType,t,r),c={kind:"fun",params:o,returnType:l};return s.length>0?{kind:"poly",quantifiers:s,quantifierKinds:i,type:c}:c}case"record":return{kind:"rec",fields:e.fields.map(s=>({name:s.name,type:this.astToType(s.type,t,n),isMut:s.isMut,isOptional:s.isOptional}))};case"tuple":return{kind:"tup",elements:e.elements.map(r=>this.astToType(r,t,n))};case"app":{if(n&&n.has(e.name)){const r=n.get(e.name);return!e.args||e.args.length===0?r:prune({kind:"hkt_app",constructor:r,args:e.args.map(s=>this.astToType(s,t,n))})}if(e.name==="Array"||e.name==="list")return{kind:"tup",elements:[e.args[0]?this.astToType(e.args[0],t,n):freshTypeVar("a")]};if(t.typeAliases.has(e.name)){const r=t.typeAliases.get(e.name),s=e.args.map(o=>this.astToType(o,t,n)),i=new Map;return r.typeParams.forEach((o,l)=>{const c=getTypeParamName(o);s[l]&&i.set(c,s[l])}),this.substituteTypeParams(r.type,i)}return{kind:"cons",name:e.name,args:e.args.map(r=>this.astToType(r,t,n))}}case"forall":{const r=new Map(n),s=[],i=new Map;for(const l of e.typeParams){const c=getTypeParamName(l),u=getTypeParamKind(l);s.push(c),i.set(c,u),r.set(c,createTypeVarForParam(l))}const o=this.astToType(e.type,t,r);return{kind:"poly",quantifiers:s,quantifierKinds:i,type:o}}}}substituteTypeParams(e,t,n=new Map){const r=e;if(n.has(r))return n.get(r);switch(r.kind){case"var":return r.name&&t.has(r.name)?t.get(r.name):r.instance?this.substituteTypeParams(r.instance,t,n):r;case"fun":{const s={kind:"fun",params:[],returnType:PRIM_VOID};return n.set(r,s),s.params=r.params.map(i=>({...i,type:this.substituteTypeParams(i.type,t,n)})),s.returnType=this.substituteTypeParams(r.returnType,t,n),s}case"rec":{const s={kind:"rec",fields:[]};return n.set(r,s),s.fields=r.fields.map(i=>({...i,type:this.substituteTypeParams(i.type,t,n)})),s}case"tup":{const s={kind:"tup",elements:[]};return n.set(r,s),s.elements=r.elements.map(i=>this.substituteTypeParams(i,t,n)),s}case"cons":{const s={kind:"cons",name:r.name,args:[]};return n.set(r,s),s.args=r.args.map(i=>this.substituteTypeParams(i,t,n)),s}case"poly":{const s={kind:"poly",quantifiers:r.quantifiers,quantifierKinds:r.quantifierKinds,type:PRIM_VOID};n.set(r,s);const i=new Map(t);for(const o of r.quantifiers)i.delete(o);return s.type=this.substituteTypeParams(r.type,i,n),s}case"hkt_app":return prune({kind:"hkt_app",constructor:this.substituteTypeParams(r.constructor,t,n),args:r.args.map(s=>this.substituteTypeParams(s,t,n))});case"type_lambda":{const s=new Map(t);for(const i of r.params)s.delete(i);return{kind:"type_lambda",params:r.params,body:this.substituteTypeParams(r.body,s,n)}}default:return r}}checkStatement(e,t){var n,r,s,i,o,l,c,u,p,d,f,m,y,_,g,h,T,L,A,V,I,P,$,b,S;switch(e.kind){case"s_let":{let v;if(e.typeAnnotation){const E=this.astToType(e.typeAnnotation,t);this.checkExpr(e.init,E,t),v=E}else v=this.synthExpr(e.init,t);t.vars.set(e.name,v),e.loc&&((n=t.defLocs)==null||n.set(e.name,e.loc)),e.isMut&&t.mutVars.add(e.name),e.isExported&&t.exports.add(e.name);const R=!!t.parent;this.registerSymbol({name:e.name,type:v,kind:"variable",isMut:e.isMut,isExported:e.isExported,loc:e.loc,doc:renderDocComment(e.docComment)||(R?`${e.isMut?"Mutable local":"Local"} variable \`${e.name}\``:`${e.isExported?"Exported top-level":"Top-level"} variable \`${e.name}\``)});break}case"s_function":{const v=createScopedEnv(t),R=new Map,E=new Map;for(const M of e.typeParams){const N=getTypeParamName(M),q=getTypeParamKind(M);E.set(N,q),R.set(N,createTypeVarForParam(M))}const k=e.params.map(M=>({name:M.name,type:this.astToType(M.type,t,R),loc:M.loc}));for(const M of k)v.vars.set(M.name,M.type),M.loc&&((r=v.defLocs)==null||r.set(M.name,M.loc)),this.registerSymbol({name:M.name,type:M.type,kind:"parameter",loc:M.loc||e.loc,containerName:e.name,scopeRange:{startLine:((s=e.loc)==null?void 0:s.line)||1,startCol:((i=e.loc)==null?void 0:i.col)||1,endLine:((o=e.body.loc)==null?void 0:o.endLine)||((l=e.loc)!=null&&l.line?e.loc.line+5e3:999999),endCol:((c=e.body.loc)==null?void 0:c.endCol)||999999},doc:getParameterDoc(e.docComment,M.name)||`Parameter \`${M.name}\` of function \`${e.name}\``});const O=this.astToType(e.returnType,t,R);let x=t.vars.get(e.name)||{kind:"fun",params:k,returnType:O};v.vars.set(e.name,x),e.loc&&((u=v.defLocs)==null||u.set(e.name,e.loc),(p=t.defLocs)==null||p.set(e.name,e.loc)),v.currentReturnType=O,this.registerSymbol({name:e.name,type:x,kind:"function",isExported:e.isExported,loc:e.loc,doc:renderDocComment(e.docComment,e.params.map(M=>M.name))||(e.isExported?`Exported function \`${e.name}\``:`Function \`${e.name}\``)}),e.whereBindings&&e.whereBindings.length>0&&this.checkStatementList(e.whereBindings,v),this.checkExpr(e.body,O,v);break}case"s_gadt":{t.gadts.set(e.decl.name,{name:e.decl.name,typeParams:e.decl.typeParams,constructors:e.decl.constructors}),e.isExported&&t.exports.add(e.decl.name),e.loc&&((d=t.defLocs)==null||d.set(e.decl.name,e.loc)),this.registerSymbol({name:e.decl.name,type:{kind:"cons",name:e.decl.name,args:[]},kind:"gadt",loc:e.loc,doc:`GADT Type \`${e.decl.name}\``});for(const v of e.decl.constructors){const R=new Map,E=[...e.decl.typeParams,...v.typeParams],k=[],O=new Map;for(const q of E){const C=getTypeParamName(q),j=getTypeParamKind(q);k.push(C),O.set(C,j),R.set(C,createTypeVarForParam(q))}const x=v.params.map(q=>({name:q.name,type:this.astToType(q.type,t,R)}));let M;if(v.returnType)M=this.astToType(v.returnType,t,R);else{const q=e.decl.typeParams.map(C=>R.get(getTypeParamName(C))||createTypeVarForParam(C));M={kind:"cons",name:e.decl.name,args:q}}let N;v.params.length===0?N=M:N={kind:"fun",params:x,returnType:M},k.length>0&&(N={kind:"poly",quantifiers:k,quantifierKinds:O,type:N}),t.vars.set(v.name,N),e.isExported&&t.exports.add(v.name)}break}case"s_type_alias":{const v=new Map;for(const E of e.decl.typeParams){const k=getTypeParamName(E);v.set(k,createTypeVarForParam(E))}const R=this.astToType(e.decl.type,t,v);t.typeAliases.set(e.decl.name,{typeParams:e.decl.typeParams,type:R}),e.isExported&&t.exports.add(e.decl.name),e.loc&&((f=t.defLocs)==null||f.set(e.decl.name,e.loc)),this.registerSymbol({name:e.decl.name,type:R,kind:"type_alias",loc:e.loc,doc:`Type Alias \`${e.decl.name}\``});break}case"s_module":{const v=createScopedEnv(t);v.exports=new Set,v.currentReturnType=void 0,t.modules.set(e.name,v),e.isExported&&t.exports.add(e.name),this.checkStatementList(e.body,v);break}case"s_extern_function":{const v=new Map,R=[],E=new Map;for(const M of e.typeParams){const N=getTypeParamName(M),q=getTypeParamKind(M);R.push(N),E.set(N,q),v.set(N,createTypeVarForParam(M))}const k=e.params.map(M=>({name:M.name,type:this.astToType(M.type,t,v),loc:M.loc}));for(const M of k)this.registerSymbol({name:M.name,type:M.type,kind:"parameter",containerName:e.name,loc:M.loc||e.loc,scopeRange:{startLine:((m=e.loc)==null?void 0:m.line)||1,startCol:1,endLine:((y=e.loc)==null?void 0:y.line)||1,endCol:999999},doc:`Parameter \`${M.name}\` of extern function \`${e.name}\``});const O=this.astToType(e.returnType,t,v);let x={kind:"fun",params:k,returnType:O};R.length>0&&(x={kind:"poly",quantifiers:R,quantifierKinds:E,type:x}),t.vars.set(e.name,x),e.isExported&&t.exports.add(e.name),this.registerSymbol({name:e.name,type:x,kind:"function",isExported:e.isExported,loc:e.loc,doc:e.docComment||`Extern function \`${e.name}\``});break}case"s_extern_type":{const v=new Map;for(const E of e.typeParams){const k=getTypeParamName(E);v.set(k,createTypeVarForParam(E))}const R=this.astToType(e.type,t,v);t.typeAliases.set(e.name,{typeParams:e.typeParams,type:R}),e.isExported&&t.exports.add(e.name),this.registerSymbol({name:e.name,type:R,kind:"type_alias",isExported:e.isExported,loc:e.loc,doc:e.docComment||`Extern type \`${e.name}\``});break}case"s_extern_value":{const v=this.astToType(e.type,t);t.vars.set(e.name,v),e.isExported&&t.exports.add(e.name),this.registerSymbol({name:e.name,type:v,kind:"variable",isExported:e.isExported,loc:e.loc,doc:e.docComment||`Extern value \`${e.name}\``});break}case"s_extern_module":{const v=createScopedEnv(t);v.exports=new Set,e.docComment&&(v.moduleDoc=e.docComment),this.registerSymbol({name:e.name,type:this.moduleEnvToType(v),kind:"module",loc:e.loc,doc:e.docComment||`Extern module \`${e.name}\``});for(const k of e.types){const O=new Map;for(const M of k.typeParams){const N=getTypeParamName(M);O.set(N,createTypeVarForParam(M))}const x=this.astToType(k.type,v,O);v.typeAliases.set(k.name,{typeParams:k.typeParams,type:x}),v.exports.add(k.name),k.loc&&((_=v.defLocs)==null||_.set(k.name,k.loc)),k.docComment&&((g=v.docs)==null||g.set(k.name,k.docComment)),this.registerSymbol({name:k.name,type:x,kind:"type_alias",containerName:e.name,loc:k.loc,doc:k.docComment||`Type alias \`${e.name}.${k.name}\``})}for(const k of e.values){const O=this.astToType(k.type,v);v.vars.set(k.name,O),v.exports.add(k.name),k.loc&&((h=v.defLocs)==null||h.set(k.name,k.loc)),k.docComment&&((T=v.docs)==null||T.set(k.name,k.docComment)),this.registerSymbol({name:k.name,type:O,kind:"variable",containerName:e.name,loc:k.loc,doc:k.docComment||`Extern variable \`${e.name}.${k.name}\``})}for(const k of e.functions){const O=new Map,x=[],M=new Map;for(const j of k.typeParams){const F=getTypeParamName(j),B=getTypeParamKind(j);x.push(F),M.set(F,B),O.set(F,createTypeVarForParam(j))}const N=k.params.map(j=>({name:j.name,type:this.astToType(j.type,v,O),loc:j.loc}));for(const j of N)this.registerSymbol({name:j.name,type:j.type,kind:"parameter",containerName:k.name,loc:j.loc||k.loc,scopeRange:{startLine:((L=k.loc)==null?void 0:L.line)||((A=e.loc)==null?void 0:A.line)||1,startCol:1,endLine:((V=k.loc)==null?void 0:V.line)||((I=e.loc)==null?void 0:I.line)||1,endCol:999999},doc:`Parameter \`${j.name}\` of function \`${e.name}.${k.name}\``});const q=this.astToType(k.returnType,v,O);let C={kind:"fun",params:N,returnType:q};x.length>0&&(C={kind:"poly",quantifiers:x,quantifierKinds:M,type:C}),v.vars.set(k.name,C),v.exports.add(k.name),k.loc&&((P=v.defLocs)==null||P.set(k.name,k.loc)),k.docComment&&(($=v.docs)==null||$.set(k.name,k.docComment)),this.registerSymbol({name:k.name,type:C,kind:"function",containerName:e.name,loc:k.loc,doc:k.docComment||`Extern function \`${e.name}.${k.name}\``})}const R=this.moduleEnvToType(v);t.modules.set(e.name,v),t.vars.set(e.name,R),e.loc&&((b=t.defLocs)==null||b.set(e.name,e.loc));const E=e.name.replace(/^npm:/,"").replace(/[^a-zA-Z0-9_]/g,"_");E!==e.name&&(t.modules.set(E,v),t.vars.set(E,R),e.loc&&((S=t.defLocs)==null||S.set(E,e.loc))),e.isExported&&t.exports.add(e.name);break}case"s_import":{this.processImport(e,t);break}case"s_expr":{this.synthExpr(e.expr,t);break}}}processImport(e,t){var i,o;let n=t,r;for(;n;){if(n.modules.has(e.modulePath[0])){r=n;break}n=n.parent}if(!r&&this.options.resolveModule){const l=e.modulePath[0],c=this.options.resolveModule(l);c&&(t.modules.set(l,c),r=t)}let s=r;for(const l of e.modulePath){if(!s)break;s=s.modules.get(l)}if(!s){const l=[];let c=t;for(;c;){for(const d of Array.from(c.modules.keys()))l.includes(d)||l.push(d);c=c.parent}const u=findBestSuggestion(e.modulePath.join("."),l),p=u?` Did you mean '${u}'?`:"";this.addError(`Module '${e.modulePath.join(".")}' not found.${p}`,e.loc,"Undefined Symbol");return}if(e.alias){t.modules.set(e.alias,s);return}if(e.specifiers)for(const l of e.specifiers)if(l.isAll)s.exports.forEach(c=>{var u,p;s.vars.has(c)&&t.vars.set(c,s.vars.get(c)),(u=s.docs)!=null&&u.has(c)&&((p=t.docs)==null||p.set(c,s.docs.get(c))),s.gadts.has(c)&&t.gadts.set(c,s.gadts.get(c)),s.typeAliases.has(c)&&t.typeAliases.set(c,s.typeAliases.get(c))});else{const c=l.name,u=l.alias||c;let p=!1;if(s.vars.has(c)){t.vars.set(u,s.vars.get(c));const d=(i=s.docs)==null?void 0:i.get(c);d&&((o=t.docs)==null||o.set(u,d)),p=!0}if(s.gadts.has(c)&&(t.gadts.set(u,s.gadts.get(c)),p=!0),s.typeAliases.has(c)&&(t.typeAliases.set(u,s.typeAliases.get(c)),p=!0),!p){const d=Array.from(new Set([...Array.from(s.exports),...Array.from(s.vars.keys()),...Array.from(s.gadts.keys()),...Array.from(s.typeAliases.keys())])),f=findBestSuggestion(c,d),m=f?` Did you mean '${f}'?`:"";this.addError(`Export '${c}' not found in module '${e.modulePath.join(".")}'.${m}`,l.loc||e.loc,"Undefined Symbol")}}else t.modules.set(e.modulePath[e.modulePath.length-1],s)}synthExpr(e,t){if(this.recursionDepth++,this.recursionDepth>this.maxRecursionDepth)return this.addError(`Type error: Maximum recursion depth of ${this.maxRecursionDepth} exceeded during type inference/checking. Check for complex or infinitely recursive GADT types.`,e.loc,"Type Checking"),this.recursionDepth--,freshTypeVar("rec_exceeded");try{return this.synthExprInner(e,t)}finally{this.recursionDepth--}}synthExprInner(e,t){var n,r,s,i,o,l,c,u,p,d,f,m,y,_,g,h,T,L,A,V,I,P;switch(e.kind){case"e_literal":return typeof e.value=="number"?PRIM_NUMBER:typeof e.value=="boolean"?PRIM_BOOLEAN:typeof e.value=="string"?PRIM_STRING:PRIM_VOID;case"e_var":{if(e.modulePath&&e.modulePath.length>0){let C=t,j;for(;C;){if(C.modules.has(e.modulePath[0])){j=C;break}C=C.parent}let F=j;for(const B of e.modulePath)F=F==null?void 0:F.modules.get(B);if(F){if(!e.name)return freshTypeVar("__member__");if(F.vars.has(e.name)){const w=this.instantiate(F.vars.get(e.name)),D=(n=F.defLocs)==null?void 0:n.get(e.name);return e.loc&&D&&this.registerSymbol({name:e.name,type:w,kind:"reference",loc:e.loc,scopeRange:{startLine:D.line,startCol:D.col,endLine:D.endLine||D.line,endCol:D.endCol||D.col}}),w}if(F.modules.has(e.name)){const w=this.moduleEnvToType(F.modules.get(e.name)),D=(r=F.defLocs)==null?void 0:r.get(e.name);return e.loc&&D&&this.registerSymbol({name:e.name,type:w,kind:"reference",loc:e.loc,scopeRange:{startLine:D.line,startCol:D.col,endLine:D.endLine||D.line,endCol:D.endCol||D.col}}),w}const B=Array.from(F.exports),Y=findBestSuggestion(e.name,B),G=Y?` Did you mean '${e.modulePath.join(".")}.${Y}'?`:"";return this.addError(`Member '${e.name}' not found in module '${e.modulePath.join(".")}'.${G}`,e.loc,"Undefined Symbol",Y?[{title:`💡 Replace with '${Y}'`,targetLine:(s=e.loc)==null?void 0:s.line,replacementText:Y}]:void 0),freshTypeVar(e.name)}}let $=t,b,S;for(;$;){if($.vars.has(e.name)){S=this.instantiate($.vars.get(e.name)),b=(i=$.defLocs)==null?void 0:i.get(e.name);break}if($.modules.has(e.name)){S=this.moduleEnvToType($.modules.get(e.name)),b=(o=$.defLocs)==null?void 0:o.get(e.name);break}$=$.parent}if(S)return e.loc&&b&&this.registerSymbol({name:e.name,type:S,kind:"reference",loc:e.loc,scopeRange:{startLine:b.line,startCol:b.col,endLine:b.endLine||b.line,endCol:b.endCol||b.col}}),S;if(e.isDoDesugared||e.doOp){const C=e.doOp||e.name;if(C==="flatMap")return this.addError("In 'do' notation: 'flatMap' function is not defined in scope. Monadic 'do' blocks desugar bindings like 'x <- expr' into 'flatMap(expr, (x) => ...)'. To use 'do' notation, define or import a 'flatMap' function for your monad type (e.g. Option, Result, IO, Promise).",e.loc,"Undefined Symbol",[{title:"💡 Define Option flatMap: function flatMap<a, b>(opt: Option<a>, f: (x: a) => Option<b>): Option<b> { ... }",actionKind:"add_let",targetLine:Math.max(1,(((l=e.loc)==null?void 0:l.line)||1)-1),replacementText:`function flatMap<a, b>(opt: Option<a>, f: (x: a) => Option<b>): Option<b> {
  match (opt) {
    Some(v) => f(v)
    None => None
  }
}
`}]),freshTypeVar("flatMap");if(C==="pure")return this.addError("In 'do' notation: 'pure' function is not defined in scope. Monadic 'do' blocks desugar 'pure val' into 'pure(val)' to lift values into your monad. To use 'pure' in 'do' blocks, define or import a 'pure' function (e.g. function pure<a>(val: a): Option<a> { Some(val) }).",e.loc,"Undefined Symbol",[{title:"💡 Define Option pure: function pure<a>(val: a): Option<a> { Some(val) }",actionKind:"add_let",targetLine:Math.max(1,(((c=e.loc)==null?void 0:c.line)||1)-1),replacementText:`function pure<a>(val: a): Option<a> {
  Some(val)
}
`}]),freshTypeVar("pure")}const v=[];let R=t;for(;R;){for(const C of Array.from(R.vars.keys()))v.includes(C)||v.push(C);for(const C of Array.from(R.modules.keys()))v.includes(C)||v.push(C);R=R.parent}let E=null,k=t;for(;k;){for(const[C,j]of Array.from(k.modules.entries()))if(j.exports.has(e.name)){E={modName:C,exportName:e.name};break}if(E)break;k=k.parent}if(E)return this.addError(`Undefined variable '${e.name}'. Did you mean '${E.modName}.${E.exportName}' or 'import ${E.modName}.{ ${E.exportName} }'?`,e.loc,"Undefined Symbol",[{title:`💡 Use '${E.modName}.${E.exportName}'`,actionKind:"wrap_expression",targetLine:(u=e.loc)==null?void 0:u.line,replacementText:`${E.modName}.${E.exportName}`},{title:`💡 Import '${E.exportName}' from ${E.modName}`,actionKind:"add_let",targetLine:1,replacementText:`import ${E.modName}.{ ${E.exportName} };
`}]),freshTypeVar(e.name);const O=findBestSuggestion(e.name,v);if(O)return this.addError(`Undefined variable '${e.name}'. Did you mean '${O}'?`,e.loc,"Undefined Symbol",[{title:`💡 Replace with '${O}'`,actionKind:"replace_line",targetLine:(p=e.loc)==null?void 0:p.line,replacementText:O}]),freshTypeVar(e.name);const x=[];let M=t;for(;M;){for(const[C,j]of Array.from(M.modules.entries()))for(const F of Array.from(j.exports))x.push({modName:C,expName:F});M=M.parent}const N=x.map(C=>C.expName),q=findBestSuggestion(e.name,N);if(q){const C=x.find(F=>F.expName===q),j=C?C.modName:"Math";return this.addError(`Undefined variable '${e.name}'. Did you mean '${j}.${q}'?`,e.loc,"Undefined Symbol",[{title:`💡 Use '${j}.${q}'`,actionKind:"wrap_expression",targetLine:(d=e.loc)==null?void 0:d.line,replacementText:`${j}.${q}`}]),freshTypeVar(e.name)}return this.addError(`Undefined variable '${e.name}'`,e.loc,"Undefined Symbol"),freshTypeVar(e.name)}case"e_unary":{const $=this.synthExpr(e.expr,t);return e.op==="-"?(this.unify($,PRIM_NUMBER,e.loc),PRIM_NUMBER):e.op==="!"?(this.unify($,PRIM_BOOLEAN,e.loc),PRIM_BOOLEAN):$}case"e_binary":{const $=this.synthExpr(e.left,t),b=this.synthExpr(e.right,t);return["+","-","*","/","%"].includes(e.op)?e.op==="+"&&prune($).kind==="prim"&&$.name==="string"?(this.unify(b,PRIM_STRING,e.loc),PRIM_STRING):(this.unify($,PRIM_NUMBER,e.loc),this.unify(b,PRIM_NUMBER,e.loc),PRIM_NUMBER):["==","!="].includes(e.op)?(this.unify($,b,e.loc),PRIM_BOOLEAN):["<","<=",">",">="].includes(e.op)?(this.unify($,PRIM_NUMBER,e.loc),this.unify(b,PRIM_NUMBER,e.loc),PRIM_BOOLEAN):["&&","||"].includes(e.op)?(this.unify($,PRIM_BOOLEAN,e.loc),this.unify(b,PRIM_BOOLEAN,e.loc),PRIM_BOOLEAN):$}case"e_assign":{if(e.target.kind==="e_var"){let b=t,S=!1,v=!1;for(;b;){if(b.vars.has(e.target.name)){S=!0,b.mutVars.has(e.target.name)&&(v=!0);break}b=b.parent}S&&!v&&this.addError(`Cannot assign to immutable variable '${e.target.name}'. Variable must be declared with 'let mut ${e.target.name}' to allow reassignment.`,e.loc||e.target.loc,"Immutability Violation")}else if(e.target.kind==="e_field_access"){const b=e.target,S=prune(this.synthExpr(b.object,t));if(S.kind==="rec"){const v=S.fields.find(R=>R.name===b.field);v&&!v.isMut&&this.addError(`Cannot mutate immutable record field '${b.field}'. Declare field with 'mut ${b.field}' in record definition.`,e.loc||b.loc,"Immutability Violation")}}const $=this.synthExpr(e.target,t);return this.checkExpr(e.value,$,t),PRIM_VOID}case"e_call":{const $=prune(this.synthExpr(e.callee,t));if($.kind==="poly"){const v=this.instantiate($);return this.checkFunCall(v,e.args,t,e.loc)}if($.kind==="fun")return this.checkFunCall($,e.args,t,e.loc);const b=freshTypeVar("ret"),S={kind:"fun",params:e.args.map(v=>({type:this.synthExpr(v,t)})),returnType:b};return this.unify($,S,e.loc),b}case"e_field_access":{const $=e.isDoDesugared,b=e.doOp,S=prune(this.synthExpr(e.object,t));if($&&(b==="flatMap"||b==="pure"||e.field==="flatMap"||e.field==="pure")){const v=e.object.kind==="e_var"?e.object.name:"Monad";let R;if(S.kind==="rec"){const E=S.fields.find(k=>k.name===e.field);E&&(R=E.type)}if(R)return R;if(e.field==="flatMap")return this.addError(`In 'do(${v})' notation: '${v}' does not provide a 'flatMap' function. Monadic 'do(${v})' blocks desugar bindings like 'x <- expr' into '${v}.flatMap(expr, (x) => ...)'. Ensure '${v}' defines 'flatMap'.`,e.loc,"Undefined Symbol"),freshTypeVar("flatMap");if(e.field==="pure")return this.addError(`In 'do(${v})' notation: '${v}' does not provide a 'pure' function. Monadic 'do(${v})' blocks desugar 'pure val' into '${v}.pure(val)'. Ensure '${v}' defines 'pure'.`,e.loc,"Undefined Symbol"),freshTypeVar("pure")}if(S.kind==="rec"){if(!e.field)return freshTypeVar("__field__");const v=S.fields.find(O=>O.name===e.field);if(v)return v.type;const R=S.fields.map(O=>O.name),E=findBestSuggestion(e.field,R),k=E?` Did you mean '${E}'?`:"";this.addError(`Record field '${e.field}' not found.${k}`,e.loc,"Undefined Symbol",E?[{title:`💡 Replace with field '${E}'`,targetLine:(f=e.loc)==null?void 0:f.line,replacementText:E}]:void 0)}return freshTypeVar(e.field)}case"e_index":{const $=prune(this.synthExpr(e.target,t)),b=this.synthExpr(e.index,t);if(this.unify(b,PRIM_NUMBER,e.loc),$.kind==="tup"){if(e.index.kind==="e_literal"&&typeof e.index.value=="number"){const S=e.index.value;if(S>=0&&S<$.elements.length)return $.elements[S]}if($.elements.length>0)return $.elements[0]}return freshTypeVar("elem")}case"e_method_call":{const $=prune(this.synthExpr(e.object,t));if($.kind==="rec"){const S=$.fields.find(v=>v.name===e.method);if(S){const v=prune(S.type),R=v.kind==="poly"?this.instantiate(v):v;if(R.kind==="fun"){if($.isModule||R.params.length===e.args.length)return e.isModuleMethod=!0,this.checkFunCall(R,e.args,t,e.loc);{const E=[e.object,...e.args];return this.checkFunCall(R,E,t,e.loc)}}}}if(["push","pop","shift","unshift","splice","slice","indexOf","lastIndexOf","includes","join","concat","map","filter","reduce","forEach","find","findIndex","trim","toLowerCase","toUpperCase","replace","replaceAll","split","charAt","substring","startsWith","endsWith","toString","valueOf","addEventListener","removeEventListener","getAttribute","setAttribute","getElementById","querySelector","querySelectorAll","appendChild","removeChild","getContext","getBoundingClientRect","fill","stroke","beginPath","closePath","moveTo","lineTo","arc","rect","fillRect","strokeRect","clearRect","fillText","strokeText","setLineDash","getLineDash","measureText","clip","createLinearGradient","createRadialGradient","createPattern","drawImage","addColorStop","quadraticCurveTo","bezierCurveTo","ellipse","arcTo","save","restore","translate","rotate","scale","preventDefault","stopPropagation"].includes(e.method))return e.args.forEach(S=>this.synthExpr(S,t)),e.isModuleMethod=!0,freshTypeVar(e.method+"_ret");if($.kind==="rec"){const S=$.fields.filter(E=>{const k=prune(E.type);return k.kind==="fun"||k.kind==="poly"}).map(E=>E.name),v=findBestSuggestion(e.method,S),R=v?` Did you mean '${v}'?`:"";return this.addError(`Method '${e.method}' not found on object.${R}`,e.loc,"Undefined Symbol",v?[{title:`💡 Replace with method '${v}'`,targetLine:(m=e.loc)==null?void 0:m.line,replacementText:v}]:void 0),freshTypeVar(e.method)}return this.addError(`Method '${e.method}' not found on non-record object`,e.loc,"Undefined Symbol"),freshTypeVar(e.method)}case"e_record":{const $=e.fields.map(S=>({name:S.name,type:this.synthExpr(S.value,t),isMut:S.isMut}));if(e.methods)for(const S of e.methods){const v=createScopedEnv(t),R={kind:"rec",fields:$};v.vars.set(S.selfParam,R);const E=S.params.map(O=>({name:O.name,type:O.type?this.astToType(O.type,t):freshTypeVar(O.name)}));E.forEach(O=>v.vars.set(O.name,O.type));const k=S.returnType?this.astToType(S.returnType,t):PRIM_VOID;v.currentReturnType=k,this.checkExpr(S.body,k,v),$.push({name:S.name,type:{kind:"fun",params:[{name:S.selfParam,type:R},...E],returnType:k},isMut:!1})}const b={kind:"rec",fields:$};for(const S of $)S.type.kind==="fun"&&S.type.params.length>0&&(S.type.params[0].type=b);return b}case"e_record_update":{const $=prune(this.synthExpr(e.base,t));if($.kind==="rec"){const b=[...$.fields];for(const S of e.updates){const v=this.synthExpr(S.value,t),R=b.findIndex(E=>E.name===S.name);R>=0?this.unify(b[R].type,v,e.loc):b.push({name:S.name,type:v,isMut:S.isMut})}return{kind:"rec",fields:b}}return $}case"e_tuple":return{kind:"tup",elements:e.elements.map($=>this.synthExpr($,t))};case"e_lambda":{const $=createScopedEnv(t),b=new Map,S=[],v=new Map;for(const O of e.typeParams||[]){const x=getTypeParamName(O),M=getTypeParamKind(O);S.push(x),v.set(x,M),b.set(x,createTypeVarForParam(O))}const R=e.params.map(O=>({name:O.name,type:O.type?this.astToType(O.type,t,b):freshTypeVar(O.name),loc:O.loc}));for(const O of R){$.vars.set(O.name,O.type);const x=e.isDoBind,M=e.doScopeLoc;O.name.startsWith("$m_val_")||this.registerSymbol({name:O.name,type:O.type,kind:x?"variable":"parameter",loc:O.loc||e.loc,containerName:x?void 0:"anonymous function",scopeRange:{startLine:((y=O.loc)==null?void 0:y.line)||((_=e.loc)==null?void 0:_.line)||1,startCol:1,endLine:(M==null?void 0:M.endLine)||((g=e.body.loc)==null?void 0:g.endLine)||((h=e.loc)!=null&&h.line?e.loc.line+5e3:999999),endCol:(M==null?void 0:M.endCol)||((T=e.body.loc)==null?void 0:T.endCol)||999999},doc:x?`Local variable \`${O.name}\` bound in \`do\` block`:`Parameter \`${O.name}\` of anonymous function`})}let E;if(e.returnType)E=this.astToType(e.returnType,t,b),$.currentReturnType=E,this.checkExpr(e.body,E,$);else{const O=freshTypeVar("ret");$.currentReturnType=O,E=this.synthExpr(e.body,$),this.unify(E,O,e.loc)}const k={kind:"fun",params:R,returnType:E};return S.length>0?{kind:"poly",quantifiers:S,quantifierKinds:v,type:k}:k}case"e_if":if(this.checkExpr(e.cond,PRIM_BOOLEAN,t),e.elseExpr){const $=this.synthExpr(e.thenExpr,t);return this.checkExpr(e.elseExpr,$,t),$}else return this.synthExpr(e.thenExpr,t),PRIM_VOID;case"e_block":{const $=createScopedEnv(t);return this.checkStatementList(e.statements,$),e.result?this.synthExpr(e.result,$):PRIM_VOID}case"e_match":{const $=this.synthExpr(e.scrutinee,t);return this.checkMatch(e.arms,e.hasRest,$,void 0,t,e.loc)}case"e_switch":{const $=this.synthExpr(e.discriminant,t);let b;for(const S of e.cases){const v=S.values&&S.values.length>0?S.values:[S.value];for(const E of v){const k=this.synthExpr(E,t);this.unify($,k,E.loc||e.loc)}const R=this.synthExpr(S.body,t);b?this.unify(b,R,S.body.loc||e.loc):b=R}if(e.defaultCase){const S=this.synthExpr(e.defaultCase,t);b?this.unify(b,S,e.defaultCase.loc||e.loc):b=S}return b||PRIM_VOID}case"e_list_comp":{const $=this.synthExpr(e.iterable,t);let b=freshTypeVar("a");const S={kind:"tup",elements:[b]};this.unify($,S,e.loc);const v=createScopedEnv(t);if(v.vars.set(e.param,b),this.registerSymbol({name:e.param,type:b,kind:"loop",loc:e.loc,scopeRange:{startLine:((L=e.loc)==null?void 0:L.line)||1,startCol:((A=e.loc)==null?void 0:A.col)||1,endLine:((V=e.loc)==null?void 0:V.endLine)||((I=e.loc)!=null&&I.line?e.loc.line+100:999999),endCol:((P=e.loc)==null?void 0:P.endCol)||999999},doc:`List comprehension element \`${e.param}\``}),e.condition){const E=this.synthExpr(e.condition,v);this.unify(E,PRIM_BOOLEAN,e.condition.loc)}return{kind:"tup",elements:[this.synthExpr(e.element,v)]}}case"e_range":return this.checkExpr(e.start,PRIM_NUMBER,t),this.checkExpr(e.end,PRIM_NUMBER,t),{kind:"tup",elements:[PRIM_NUMBER]};case"e_for":{const $=createScopedEnv(t);return e.init&&(e.init.kind==="s_let"?this.checkStatement(e.init,$):e.init.kind==="s_expr"?this.synthExpr(e.init.expr,$):e.init.kind.startsWith("e_")&&this.synthExpr(e.init,$)),e.cond&&this.checkExpr(e.cond,PRIM_BOOLEAN,$),e.update&&this.synthExpr(e.update,$),this.synthExpr(e.body,$),PRIM_VOID}case"e_while":{const $=createScopedEnv(t);return this.checkExpr(e.cond,PRIM_BOOLEAN,$),this.synthExpr(e.body,$),PRIM_VOID}case"e_break":case"e_continue":return PRIM_VOID;case"e_return":{const $=t.currentReturnType;return $?e.value?(this.checkExpr(e.value,$,t),$):(this.unify(PRIM_VOID,$,e.loc),PRIM_VOID):(this.addError("A 'return' statement can only be used within a function body.",e.loc,"Control Flow"),PRIM_VOID)}case"e_do":{const $=desugarDo(e);return this.synthExpr($,t)}case"e_where":{const $=createScopedEnv(t);return this.checkStatementList(e.bindings,$),this.synthExpr(e.expr,$)}}}checkExpr(e,t,n){if(this.recursionDepth++,this.recursionDepth>this.maxRecursionDepth){this.addError(`Type error: Maximum recursion depth of ${this.maxRecursionDepth} exceeded during type inference/checking. Check for complex or infinitely recursive GADT types.`,e.loc,"Type Checking"),this.recursionDepth--;return}try{this.checkExprInner(e,t,n)}finally{this.recursionDepth--}}checkExprInner(e,t,n){const r=prune(t);if(e.kind==="e_do"){const i=desugarDo(e);this.checkExpr(i,r,n);return}if(e.kind==="e_where"){const i=createScopedEnv(n);this.checkStatementList(e.bindings,i),this.checkExpr(e.expr,r,i);return}if(e.kind==="e_lambda"&&r.kind==="fun"){const i=createScopedEnv(n),o=e.isDoBind,l=e.doScopeLoc;e.params.forEach((c,u)=>{var d,f,m,y,_,g;const p=((d=r.params[u])==null?void 0:d.type)||freshTypeVar(c.name);i.vars.set(c.name,p),c.name.startsWith("$m_val_")||this.registerSymbol({name:c.name,type:p,kind:o?"variable":"parameter",loc:c.loc||e.loc,containerName:o?void 0:"anonymous function",scopeRange:{startLine:((f=c.loc)==null?void 0:f.line)||((m=e.loc)==null?void 0:m.line)||1,startCol:1,endLine:(l==null?void 0:l.endLine)||((y=e.body.loc)==null?void 0:y.endLine)||((_=e.loc)!=null&&_.line?e.loc.line+5e3:999999),endCol:(l==null?void 0:l.endCol)||((g=e.body.loc)==null?void 0:g.endCol)||999999},doc:o?`Local variable \`${c.name}\` bound in \`do\` block`:`Parameter \`${c.name}\` of anonymous function`})}),i.currentReturnType=r.returnType,this.checkExpr(e.body,r.returnType,i);return}if(e.kind==="e_block"){const i=createScopedEnv(n);this.checkStatementList(e.statements,i),e.result&&this.checkExpr(e.result,r,i);return}if(e.kind==="e_range"){const i=this.synthExpr(e,n);this.unify(i,r,e.loc);return}if(e.kind==="e_return"){const i=n.currentReturnType||r;e.value?this.checkExpr(e.value,i,n):this.unify(PRIM_VOID,i,e.loc);return}if(e.kind==="e_match"){const i=this.synthExpr(e.scrutinee,n);this.checkMatch(e.arms,e.hasRest,i,r,n,e.loc);return}if(e.kind==="e_var"&&r.kind==="poly"){let i,o=n;for(;o;){if(o.vars.has(e.name)){i=o.vars.get(e.name);break}o=o.parent}if(i&&i.kind==="poly"){this.unify(i,r,e.loc);return}}const s=this.synthExpr(e,n);this.unify(s,r,e.loc)}checkFunCall(e,t,n,r){const s=prune(e);if(s.kind==="poly"){const i=this.instantiate(s);return this.checkFunCall(i,t,n,r)}return s.kind==="fun"?(t.length!==s.params.length&&this.addError(`Expected ${s.params.length} arguments, but got ${t.length}`,r,"Type Checking"),s.params.forEach((i,o)=>{t[o]&&this.checkExpr(t[o],i.type,n)}),s.returnType):freshTypeVar("ret")}freshCopy(e,t=new Map,n=new Map){const r=prune(e);if(n.has(r))return n.get(r);switch(r.kind){case"var":return t.has(r.id)||t.set(r.id,freshTypeVar(r.name)),t.get(r.id);case"fun":{const s={kind:"fun",params:[],returnType:PRIM_VOID};return n.set(r,s),s.params=r.params.map(i=>({...i,type:this.freshCopy(i.type,t,n)})),s.returnType=this.freshCopy(r.returnType,t,n),s}case"rec":{const s={kind:"rec",fields:[]};return n.set(r,s),s.fields=r.fields.map(i=>({...i,type:this.freshCopy(i.type,t,n)})),s}case"tup":{const s={kind:"tup",elements:[]};return n.set(r,s),s.elements=r.elements.map(i=>this.freshCopy(i,t,n)),s}case"cons":{const s={kind:"cons",name:r.name,args:[]};return n.set(r,s),s.args=r.args.map(i=>this.freshCopy(i,t,n)),s}case"poly":{const s={kind:"poly",quantifiers:r.quantifiers,quantifierKinds:r.quantifierKinds,type:PRIM_VOID};return n.set(r,s),s.type=this.freshCopy(r.type,t,n),s}case"hkt_app":return prune({kind:"hkt_app",constructor:this.freshCopy(r.constructor,t,n),args:r.args.map(s=>this.freshCopy(s,t,n))});case"type_lambda":return{kind:"type_lambda",params:r.params,body:this.freshCopy(r.body,t,n)};default:return r}}freshCopyPair(e,t){const n=new Map,r=this.freshCopy(e,n),s=t?this.freshCopy(t,n):void 0;return[r,s]}checkMatch(e,t,n,r,s,i){const o=r||freshTypeVar("arm_res"),l=prune(n);this.checkExhaustiveness(e,t,l,s,i);for(const c of e){const u=createScopedEnv(s),[p,d]=this.freshCopyPair(l,r),f=d||freshTypeVar("arm_res");this.bindPattern(c.pattern,p,u),c.guard&&this.checkExpr(c.guard,PRIM_BOOLEAN,u),this.checkExpr(c.body,f,u),r||this.unify(f,o,c.loc)}return o}bindPattern(e,t,n){var s;const r=prune(t);switch(e.kind){case"p_var":n.vars.set(e.name,r),this.registerSymbol({name:e.name,type:r,kind:"pattern",loc:e.loc,doc:`Pattern variable \`${e.name}\``});break;case"p_as":n.vars.set(e.name,r),this.registerSymbol({name:e.name,type:r,kind:"pattern",loc:e.loc,doc:`Pattern alias variable \`${e.name}\``}),this.bindPattern(e.pattern,r,n);break;case"p_ctor":{let i=n.vars.get(e.name);if(i){const o=this.instantiate(i);o.kind==="fun"?(e.args.length!==o.params.length&&this.addError(`Constructor '${e.name}' expects ${o.params.length} arguments, but pattern has ${e.args.length}`,e.loc,"Pattern Match"),this.unify(o.returnType,r,e.loc),e.args.forEach((l,c)=>{o.params[c]?this.bindPattern(l,o.params[c].type,n):this.bindPattern(l,freshTypeVar(`arg${c}`),n)})):(e.args.length>0&&this.addError(`Constructor '${e.name}' expects 0 arguments, but pattern has ${e.args.length}`,e.loc,"Pattern Match"),this.unify(o,r,e.loc))}else{const o=[];let l=n;for(;l;){for(const p of Array.from(l.gadts.values()))for(const d of p.constructors)o.includes(d.name)||o.push(d.name);l=l.parent}const c=findBestSuggestion(e.name,o),u=c?` Did you mean '${c}'?`:"";this.addError(`Unknown constructor '${e.name}' in pattern match.${u}`,e.loc,"Pattern Match",c?[{title:`💡 Replace with constructor '${c}'`,targetLine:(s=e.loc)==null?void 0:s.line,replacementText:c}]:void 0)}break}case"p_record":{if(r.kind==="rec")for(const i of e.fields){const o=r.fields.find(l=>l.name===i.name);if(o){const l=o.type;if(i.pattern)this.bindPattern(i.pattern,l,n);else{const c=i.alias||i.name;n.vars.set(c,l)}}}break}case"p_tuple":{r.kind==="tup"&&e.elements.forEach((i,o)=>{r.elements[o]&&this.bindPattern(i,r.elements[o],n)});break}case"p_literal":{const i=typeof e.value=="number"?PRIM_NUMBER:typeof e.value=="string"?PRIM_STRING:PRIM_BOOLEAN;this.unify(i,r,e.loc);break}}}checkExhaustiveness(e,t,n,r,s){if(!(t||e.some(o=>o.pattern.kind==="p_wildcard"||o.pattern.kind==="p_var"||o.pattern.kind==="p_rest"))&&n.kind==="cons"){let o=r,l;for(;o;){if(o.gadts.has(n.name)){l=o.gadts.get(n.name);break}o=o.parent}if(l){const c=new Set;for(const p of e)p.pattern.kind==="p_ctor"&&c.add(p.pattern.name);const u=l.constructors.map(p=>p.name).filter(p=>!c.has(p));u.length>0&&this.addError(`Non-exhaustive pattern match on type '${n.name}'. Missing constructors: ${u.join(", ")}`,s,"Pattern Match",u.map(p=>({title:`💡 Add match arm for '${p}'`,actionKind:"add_match_arm",targetLine:((s==null?void 0:s.line)||1)+e.length,replacementText:`  | ${p}(_) => { /* handle ${p} */ }
`})))}}}instantiate(e){var n;const t=prune(e);if(t.kind==="poly"){const r=new Map;for(const s of t.quantifiers){const i=((n=t.quantifierKinds)==null?void 0:n.get(s))||KIND_STAR;r.set(s,freshTypeVar(s,i))}return this.substituteTypeParams(t.type,r)}return t}occursIn(e,t,n=new Set){const r=prune(t);return n.has(r)?!1:(n.add(r),r.kind==="var"?r.id===e:r.kind==="fun"?r.params.some(s=>this.occursIn(e,s.type,n))||this.occursIn(e,r.returnType,n):r.kind==="rec"?r.fields.some(s=>this.occursIn(e,s.type,n)):r.kind==="tup"?r.elements.some(s=>this.occursIn(e,s,n)):r.kind==="cons"?r.args.some(s=>this.occursIn(e,s,n)):r.kind==="poly"?this.occursIn(e,r.type,n):r.kind==="hkt_app"?this.occursIn(e,r.constructor,n)||r.args.some(s=>this.occursIn(e,s,n)):r.kind==="type_lambda"?this.occursIn(e,r.body,n):!1)}unify(e,t,n){if(this.unifyDepth++,this.unifyDepth>this.maxUnifyDepth){this.addError(`Type error: Maximum unification depth of ${this.maxUnifyDepth} exceeded during type unification. Check for complex recursive GADT types.`,n,"Type Unification"),this.unifyDepth--;return}try{this.unifyInner(e,t,n)}finally{this.unifyDepth--}}unifyInner(e,t,n){const r=prune(e),s=prune(t);if(r===s)return;if(r.kind==="poly"&&s.kind==="poly"&&r.quantifiers.length===s.quantifiers.length){const o=r.quantifiers.map(d=>freshTypeVar(d)),l=new Map,c=new Map;r.quantifiers.forEach((d,f)=>{l.set(d,o[f]),c.set(s.quantifiers[f],o[f])});const u=this.substituteTypeParams(r.type,l),p=this.substituteTypeParams(s.type,c);this.unify(u,p,n);return}if(r.kind==="poly"){this.unify(this.instantiate(r),s,n);return}if(s.kind==="poly"){this.unify(r,this.instantiate(s),n);return}if(r.kind==="var"){if(s.kind==="var"&&r.id===s.id)return;if(this.occursIn(r.id,s)){this.addError(`Type error: Occurs check failed. Type variable '${r.name||`'t${r.id}`}' occurs within recursive type '${typeToString(s)}', which would construct an infinite type.`,n,"Type Unification");return}r.instance=s;return}if(s.kind==="var"){if(this.occursIn(s.id,r)){this.addError(`Type error: Occurs check failed. Type variable '${s.name||`'t${s.id}`}' occurs within recursive type '${typeToString(r)}', which would construct an infinite type.`,n,"Type Unification");return}s.instance=r;return}if(r.kind==="prim"&&s.kind==="prim"&&r.name===s.name)return;const i=`${this.getOrAssignId(r)}:${this.getOrAssignId(s)}`;if(!this.unifyingPairs.has(i)){this.unifyingPairs.add(i);try{if(r.kind==="hkt_app"&&s.kind==="hkt_app"){this.unify(r.constructor,s.constructor,n),r.args.forEach((l,c)=>{s.args[c]&&this.unify(l,s.args[c],n)});return}if(r.kind==="type_lambda"&&s.kind==="type_lambda"&&r.params.length===s.params.length){const l=new Map;r.params.forEach((u,p)=>{l.set(s.params[p],{kind:"var",id:0,name:u})});const c=this.substituteTypeParams(s.body,l);this.unify(r.body,c,n);return}if(r.kind==="hkt_app"&&s.kind==="cons"){const l=prune(r.constructor);if(l.kind==="var"&&r.args.length===s.args.length){l.instance={kind:"type_lambda",params:r.args.map((c,u)=>`$p${u}`),body:{kind:"cons",name:s.name,args:r.args.map((c,u)=>({kind:"var",id:-100-u,name:`$p${u}`}))}},r.args.forEach((c,u)=>{s.args[u]&&this.unify(c,s.args[u],n)});return}}if(s.kind==="hkt_app"&&r.kind==="cons"){const l=prune(s.constructor);if(l.kind==="var"&&s.args.length===r.args.length){l.instance={kind:"type_lambda",params:s.args.map((c,u)=>`$p${u}`),body:{kind:"cons",name:r.name,args:s.args.map((c,u)=>({kind:"var",id:-100-u,name:`$p${u}`}))}},s.args.forEach((c,u)=>{r.args[u]&&this.unify(c,r.args[u],n)});return}}if(r.kind==="cons"&&s.kind==="cons"&&r.name===s.name){r.args.forEach((l,c)=>{s.args[c]&&this.unify(l,s.args[c],n)});return}if(r.kind==="fun"&&s.kind==="fun"){r.params.forEach((l,c)=>{s.params[c]&&this.unify(l.type,s.params[c].type,n)}),this.unify(r.returnType,s.returnType,n);return}if(r.kind==="tup"&&s.kind==="tup"){if(r.elements.length===1&&s.elements.length>1){s.elements.forEach(l=>this.unify(r.elements[0],l,n));return}if(s.elements.length===1&&r.elements.length>1){r.elements.forEach(l=>this.unify(l,s.elements[0],n));return}r.elements.forEach((l,c)=>{s.elements[c]&&this.unify(l,s.elements[c],n)});return}if(r.kind==="rec"&&s.kind==="rec"){s.fields.forEach(l=>{const c=r.fields.find(u=>u.name===l.name);c?this.unify(c.type,l.type,n):this.addError(`Record type mismatch: Missing required field '${l.name}' in record`,n,"Type Unification")});return}const o=this.formatHumanizedTypeMismatch(r,s);this.addError(o.message,n,"Type Unification",o.quickFixes)}finally{this.unifyingPairs.delete(i)}}}formatHumanizedTypeMismatch(e,t){const n=typeToString(e),r=typeToString(t),s=`Type mismatch: cannot unify '${n}' with '${r}'`;if(n==="number"&&r==="string")return{message:`${s}. Expected a string, but received a number. Tip: Convert number to string using 'to_string(...)'.`,quickFixes:[{title:"💡 Convert number using to_string(...)",actionKind:"wrap_expression"}]};if(n==="string"&&r==="number")return{message:`${s}. Expected a number, but received a string. Tip: Parse with 'parse_int(...)' or remove quotes.`,quickFixes:[{title:"💡 Parse string using parse_int(...)",actionKind:"wrap_expression"}]};if(n==="boolean"&&r==="number"||n==="number"&&r==="boolean")return{message:`${s}. Numbers and booleans cannot be implicitly coerced in TypeLang. Tip: Use comparison 'x != 0' for condition checks or 'if (b) 1 else 0'.`};if(n==="boolean"&&r==="string"||n==="string"&&r==="boolean")return{message:`${s}. Booleans and strings are incompatible types. Tip: Convert boolean using 'to_string(b)' or 'if (b) "true" else "false"'.`};if((e.kind==="fun"||e.kind==="poly")&&(t.kind==="prim"||t.kind==="tup"||t.kind==="rec"))return{message:`${s}. Found a function definition or reference where a '${r}' value was expected (did you forget to invoke it with '()'?).`};if((t.kind==="fun"||t.kind==="poly")&&(e.kind==="prim"||e.kind==="tup"||e.kind==="rec"))return{message:`${s}. Expected a callable function '${r}', but found a non-callable value of type '${n}'.`};if(e.kind==="cons"&&t.kind==="prim")return{message:`${s}. Expected a primitive '${r}', but found algebraic data type '${n}'. Tip: Use pattern matching 'match (val) { ... }' to extract the inner value.`};if(t.kind==="cons"&&e.kind==="prim"){const i=t.name==="Option"?"Some":t.name==="Result"?"Ok":t.name;return{message:`${s}. Expected algebraic data type '${r}', but found primitive '${n}'. Tip: Wrap value with constructor '${i}(...)'.`}}return e.kind==="tup"&&t.kind==="prim"?{message:`${s}. Expected a single '${r}', but received an array/tuple '${n}'. Tip: Access elements with '[0]' or iterate over the list.`}:t.kind==="tup"&&e.kind==="prim"?{message:`${s}. Expected an array/tuple '${r}', but received a single '${n}'. Tip: Wrap in array brackets '[...]'.`}:{message:s}}addError(e,t,n,r,s){let i=1,o=1,l,c,u="General";typeof t=="number"?(i=t,o=typeof n=="number"?n:1):(t&&typeof t=="object"&&(i=t.line||1,o=t.col||1,l=t.endLine,c=t.endCol),typeof n=="string"&&(u=n)),this.diagnostics.push({severity:"error",message:e,line:i,col:o,endLine:l,endCol:c,category:u,labels:s,quickFixes:r})}addWarning(e,t,n,r,s){let i=1,o=1,l,c,u="General";typeof t=="number"?(i=t,o=typeof n=="number"?n:1):(t&&typeof t=="object"&&(i=t.line||1,o=t.col||1,l=t.endLine,c=t.endCol),typeof n=="string"&&(u=n)),this.diagnostics.push({severity:"warning",message:e,line:i,col:o,endLine:l,endCol:c,category:u,labels:s,quickFixes:r})}moduleEnvToType(e){const t=[];return e.vars.forEach((n,r)=>{t.push({name:r,type:n})}),e.modules.forEach((n,r)=>{t.push({name:r,type:this.moduleEnvToType(n)})}),{kind:"rec",fields:t,isModule:!0}}}var define_process_env_default={};class BreakSignal{}class ContinueSignal{}class ReturnSignal{constructor(e){this.value=e}}function createInitialRuntimeEnv(stdout){const env={vars:new Map,modules:new Map,exports:new Set};env.vars.set("print",a=>{const e=formatValue(a);return stdout.push(e),null}),env.vars.set("println",a=>{const e=formatValue(a);return stdout.push(e+`
`),null}),env.vars.set("to_string",a=>formatValue(a)),env.vars.set("concat",(a,e)=>String(a)+String(e)),env.vars.set("requestAnimationFrame",a=>typeof requestAnimationFrame<"u"?requestAnimationFrame(a):setTimeout(a,16)),env.vars.set("setInterval",(a,e)=>typeof setInterval<"u"?setInterval(a,Number(e)):0),env.vars.set("clearInterval",a=>{typeof clearInterval<"u"&&clearInterval(a)}),env.vars.set("setTimeout",(a,e)=>typeof setTimeout<"u"?setTimeout(a,Number(e)):0),env.vars.set("clearTimeout",a=>{typeof clearTimeout<"u"&&clearTimeout(a)}),env.vars.set("parse_int",a=>parseInt(String(a),10)),env.vars.set("parse_float",a=>parseFloat(String(a))),env.vars.set("time_now",()=>Date.now()),env.vars.set("get_cli_arg",a=>{const e=Math.floor(Number(a));return typeof process<"u"&&process.argv&&e>=0&&e<process.argv.length?process.argv[e]:""}),env.vars.set("read_file",a=>{try{if(typeof require<"u"){const e=require("fs");if(e.existsSync(String(a)))return e.readFileSync(String(a),"utf-8")}}catch{}return""}),env.vars.set("write_file",(a,e)=>{try{if(typeof require<"u")return require("fs").writeFileSync(String(a),String(e),"utf-8"),!0}catch{}return!1});const mathEnv={vars:new Map,modules:new Map,exports:new Set};mathEnv.vars.set("sqrt",a=>Math.sqrt(Number(a))),mathEnv.vars.set("abs",a=>Math.abs(Number(a))),mathEnv.vars.set("floor",a=>Math.floor(Number(a))),mathEnv.vars.set("ceil",a=>Math.ceil(Number(a))),mathEnv.vars.set("round",a=>Math.round(Number(a))),mathEnv.vars.set("min",(a,e)=>Math.min(Number(a),Number(e))),mathEnv.vars.set("max",(a,e)=>Math.max(Number(a),Number(e))),mathEnv.vars.set("pow",(a,e)=>Math.pow(Number(a),Number(e))),mathEnv.vars.set("random",()=>Math.random()),mathEnv.vars.set("cos",a=>Math.cos(Number(a))),mathEnv.vars.set("sin",a=>Math.sin(Number(a))),mathEnv.vars.set("atan2",(a,e)=>Math.atan2(Number(a),Number(e))),mathEnv.vars.set("log",a=>Math.log(Number(a))),mathEnv.vars.set("bitwise_and",(a,e)=>Number(a)&Number(e)),mathEnv.vars.set("bitwise_or",(a,e)=>Number(a)|Number(e)),mathEnv.vars.set("bitwise_xor",(a,e)=>Number(a)^Number(e)),mathEnv.vars.set("bitwise_not",a=>~Number(a)),mathEnv.vars.set("bitwise_shl",(a,e)=>Number(a)<<Number(e)),mathEnv.vars.set("bitwise_shr",(a,e)=>Number(a)>>Number(e)),mathEnv.vars.set("PI",Math.PI);for(const a of mathEnv.vars.keys())mathEnv.exports.add(a);env.modules.set("Math",mathEnv);const arrayEnv={vars:new Map,modules:new Map,exports:new Set};arrayEnv.vars.set("len",a=>Array.isArray(a)?a.length:0),arrayEnv.vars.set("map",(a,e)=>Array.isArray(a)&&typeof e=="function"?a.map(t=>e(t)):[]),arrayEnv.vars.set("filter",(a,e)=>Array.isArray(a)&&typeof e=="function"?a.filter(t=>!!e(t)):[]),arrayEnv.vars.set("reduce",(a,e,t)=>Array.isArray(a)&&typeof t=="function"?a.reduce((n,r)=>t(n,r),e):e),arrayEnv.vars.set("push",(a,e)=>Array.isArray(a)?[...a,e]:[e]),arrayEnv.vars.set("slice",(a,e,t)=>Array.isArray(a)?a.slice(e,t):[]),arrayEnv.vars.set("concat",(a,e)=>Array.isArray(a)&&Array.isArray(e)?a.concat(e):[]),arrayEnv.vars.set("join",(a,e)=>Array.isArray(a)?a.map(t=>String(t)).join(String(e)):"");for(const a of arrayEnv.vars.keys())arrayEnv.exports.add(a);env.modules.set("Array",arrayEnv);const stringEnv={vars:new Map,modules:new Map,exports:new Set};stringEnv.vars.set("len",a=>String(a).length),stringEnv.vars.set("slice",(a,e,t)=>String(a).slice(e,t)),stringEnv.vars.set("split",(a,e)=>String(a).split(String(e))),stringEnv.vars.set("contains",(a,e)=>String(a).includes(String(e))),stringEnv.vars.set("parseInt",a=>parseInt(String(a),10)),stringEnv.vars.set("parseFloat",a=>parseFloat(String(a)));for(const a of stringEnv.vars.keys())stringEnv.exports.add(a);env.modules.set("String",stringEnv);const SomeCtor=a=>({$tag:"Some",val:a,$args:[a]}),NoneVal=Object.freeze({$tag:"None",$args:[]});env.vars.set("Some",SomeCtor),env.vars.set("None",NoneVal);const optionEnv={vars:new Map,modules:new Map,exports:new Set};optionEnv.vars.set("Some",SomeCtor),optionEnv.vars.set("None",NoneVal),optionEnv.vars.set("pure",a=>SomeCtor(a)),optionEnv.vars.set("of",a=>SomeCtor(a)),optionEnv.vars.set("isSome",a=>!!(a&&typeof a=="object"&&a.$tag==="Some")),optionEnv.vars.set("isNone",a=>!a||typeof a!="object"||a.$tag==="None"),optionEnv.vars.set("getOrElse",(a,e)=>a&&typeof a=="object"&&a.$tag==="Some"?a.val:e),optionEnv.vars.set("map",(a,e)=>a&&typeof a=="object"&&a.$tag==="Some"&&typeof e=="function"?SomeCtor(e(a.val)):NoneVal),optionEnv.vars.set("flatMap",(a,e)=>a&&typeof a=="object"&&a.$tag==="Some"&&typeof e=="function"?e(a.val):NoneVal),optionEnv.vars.set("filter",(a,e)=>a&&typeof a=="object"&&a.$tag==="Some"&&typeof e=="function"&&e(a.val)?a:NoneVal),optionEnv.vars.set("flatten",a=>a&&typeof a=="object"&&a.$tag==="Some"?a.val:NoneVal),optionEnv.vars.set("zip",(a,e)=>a&&typeof a=="object"&&a.$tag==="Some"&&e&&typeof e=="object"&&e.$tag==="Some"?SomeCtor([a.val,e.val]):NoneVal),optionEnv.vars.set("fromNullable",a=>a==null?NoneVal:SomeCtor(a)),optionEnv.vars.set("fold",(a,e,t)=>a&&typeof a=="object"&&a.$tag==="Some"&&typeof t=="function"?t(a.val):e),optionEnv.vars.set("orElse",(a,e)=>a&&typeof a=="object"&&a.$tag==="Some"?a:e),optionEnv.vars.set("toResult",(a,e)=>a&&typeof a=="object"&&a.$tag==="Some"?OkCtor(a.val):ErrCtor(e)),optionEnv.vars.set("contains",(a,e)=>!!(a&&typeof a=="object"&&a.$tag==="Some"&&a.val===e)),optionEnv.vars.set("exists",(a,e)=>!!(a&&typeof a=="object"&&a.$tag==="Some"&&typeof e=="function"&&e(a.val))),optionEnv.vars.set("tap",(a,e)=>(a&&typeof a=="object"&&a.$tag==="Some"&&typeof e=="function"&&e(a.val),a));for(const a of optionEnv.vars.keys())optionEnv.exports.add(a);env.modules.set("Option",optionEnv);const OkCtor=a=>({$tag:"Ok",val:a,$args:[a]}),ErrCtor=a=>({$tag:"Err",err:a,$args:[a]});env.vars.set("Ok",OkCtor),env.vars.set("Err",ErrCtor);const resultEnv={vars:new Map,modules:new Map,exports:new Set};resultEnv.vars.set("Ok",OkCtor),resultEnv.vars.set("Err",ErrCtor),resultEnv.vars.set("pure",a=>OkCtor(a)),resultEnv.vars.set("of",a=>OkCtor(a)),resultEnv.vars.set("isOk",a=>!!(a&&typeof a=="object"&&a.$tag==="Ok")),resultEnv.vars.set("isErr",a=>!a||typeof a!="object"||a.$tag==="Err"),resultEnv.vars.set("getOrElse",(a,e)=>a&&typeof a=="object"&&a.$tag==="Ok"?a.val:e),resultEnv.vars.set("map",(a,e)=>a&&typeof a=="object"&&a.$tag==="Ok"&&typeof e=="function"?OkCtor(e(a.val)):a),resultEnv.vars.set("mapError",(a,e)=>a&&typeof a=="object"&&a.$tag==="Err"&&typeof e=="function"?ErrCtor(e(a.err)):a),resultEnv.vars.set("flatMap",(a,e)=>a&&typeof a=="object"&&a.$tag==="Ok"&&typeof e=="function"?e(a.val):a),resultEnv.vars.set("flatten",a=>a&&typeof a=="object"&&a.$tag==="Ok"?a.val:a),resultEnv.vars.set("toOption",a=>a&&typeof a=="object"&&a.$tag==="Ok"?SomeCtor(a.val):NoneVal),resultEnv.vars.set("fromOption",(a,e)=>a&&typeof a=="object"&&a.$tag==="Some"?OkCtor(a.val):ErrCtor(e)),resultEnv.vars.set("fold",(a,e,t)=>a&&typeof a=="object"&&a.$tag==="Ok"&&typeof t=="function"?t(a.val):a&&typeof a=="object"&&a.$tag==="Err"&&typeof e=="function"?e(a.err):typeof e=="function"?e(a):a),resultEnv.vars.set("orElse",(a,e)=>a&&typeof a=="object"&&a.$tag==="Ok"?a:e),resultEnv.vars.set("zip",(a,e)=>a&&typeof a=="object"&&a.$tag==="Ok"&&e&&typeof e=="object"&&e.$tag==="Ok"?OkCtor([a.val,e.val]):a&&typeof a=="object"&&a.$tag==="Err"?a:e),resultEnv.vars.set("tap",(a,e)=>(a&&typeof a=="object"&&a.$tag==="Ok"&&typeof e=="function"&&e(a.val),a)),resultEnv.vars.set("fromTry",a=>{try{return OkCtor(typeof a=="function"?a():a)}catch(e){return ErrCtor((e==null?void 0:e.message)||String(e))}});for(const a of resultEnv.vars.keys())resultEnv.exports.add(a);env.modules.set("Result",resultEnv);const LeftCtor=a=>({$tag:"Left",left:a,$args:[a]}),RightCtor=a=>({$tag:"Right",right:a,$args:[a]});env.vars.set("Left",LeftCtor),env.vars.set("Right",RightCtor);const eitherEnv={vars:new Map,modules:new Map,exports:new Set};eitherEnv.vars.set("Left",LeftCtor),eitherEnv.vars.set("Right",RightCtor),eitherEnv.vars.set("pure",a=>RightCtor(a)),eitherEnv.vars.set("of",a=>RightCtor(a)),eitherEnv.vars.set("right",a=>RightCtor(a)),eitherEnv.vars.set("left",a=>LeftCtor(a)),eitherEnv.vars.set("isRight",a=>!!(a&&typeof a=="object"&&a.$tag==="Right")),eitherEnv.vars.set("isLeft",a=>!a||typeof a!="object"||a.$tag==="Left"),eitherEnv.vars.set("getOrElse",(a,e)=>a&&typeof a=="object"&&a.$tag==="Right"?a.right:e),eitherEnv.vars.set("map",(a,e)=>a&&typeof a=="object"&&a.$tag==="Right"&&typeof e=="function"?RightCtor(e(a.right)):a),eitherEnv.vars.set("mapLeft",(a,e)=>a&&typeof a=="object"&&a.$tag==="Left"&&typeof e=="function"?LeftCtor(e(a.left)):a),eitherEnv.vars.set("flatMap",(a,e)=>a&&typeof a=="object"&&a.$tag==="Right"&&typeof e=="function"?e(a.right):a),eitherEnv.vars.set("fold",(a,e,t)=>a&&typeof a=="object"&&a.$tag==="Right"&&typeof t=="function"?t(a.right):a&&typeof a=="object"&&a.$tag==="Left"&&typeof e=="function"?e(a.left):typeof e=="function"?e(a):a),eitherEnv.vars.set("swap",a=>a&&typeof a=="object"&&a.$tag==="Right"?LeftCtor(a.right):a&&typeof a=="object"&&a.$tag==="Left"?RightCtor(a.left):a),eitherEnv.vars.set("toOption",a=>a&&typeof a=="object"&&a.$tag==="Right"?SomeCtor(a.right):NoneVal),eitherEnv.vars.set("toResult",a=>a&&typeof a=="object"&&a.$tag==="Right"?OkCtor(a.right):ErrCtor(a==null?void 0:a.left)),eitherEnv.vars.set("fromResult",a=>a&&typeof a=="object"&&a.$tag==="Ok"?RightCtor(a.val):LeftCtor(a==null?void 0:a.err));for(const a of eitherEnv.vars.keys())eitherEnv.exports.add(a);env.modules.set("Either",eitherEnv);const wrapReader=a=>({$tag:"Reader",run:typeof a=="function"?a:e=>a}),readerEnv={vars:new Map,modules:new Map,exports:new Set};readerEnv.vars.set("pure",a=>wrapReader(e=>a)),readerEnv.vars.set("of",a=>wrapReader(e=>a)),readerEnv.vars.set("ask",()=>wrapReader(a=>a)),readerEnv.vars.set("asks",a=>wrapReader(e=>typeof a=="function"?a(e):e)),readerEnv.vars.set("run",(a,e)=>a&&typeof a.run=="function"?a.run(e):a),readerEnv.vars.set("map",(a,e)=>wrapReader(t=>{const n=a&&typeof a.run=="function"?a.run(t):a;return typeof e=="function"?e(n):n})),readerEnv.vars.set("flatMap",(a,e)=>wrapReader(t=>{const n=a&&typeof a.run=="function"?a.run(t):a,r=typeof e=="function"?e(n):n;return r&&typeof r.run=="function"?r.run(t):r})),readerEnv.vars.set("local",(a,e)=>wrapReader(t=>{const n=typeof e=="function"?e(t):t;return a&&typeof a.run=="function"?a.run(n):a}));for(const a of readerEnv.vars.keys())readerEnv.exports.add(a);env.modules.set("Reader",readerEnv);const wrapWriter=(a,e=[])=>({$tag:"Writer",val:a,log:Array.isArray(e)?e:[e],run:()=>[a,Array.isArray(e)?e:[e]]}),writerEnv={vars:new Map,modules:new Map,exports:new Set};writerEnv.vars.set("pure",a=>wrapWriter(a,[])),writerEnv.vars.set("of",a=>wrapWriter(a,[])),writerEnv.vars.set("tell",a=>wrapWriter(null,[a])),writerEnv.vars.set("run",a=>a&&typeof a.run=="function"?a.run():[a==null?void 0:a.val,(a==null?void 0:a.log)||[]]),writerEnv.vars.set("value",a=>a?a.val:null),writerEnv.vars.set("log",a=>a&&Array.isArray(a.log)?a.log:[]),writerEnv.vars.set("map",(a,e)=>{const t=a==null?void 0:a.val,n=Array.isArray(a==null?void 0:a.log)?a.log:[];return wrapWriter(typeof e=="function"?e(t):t,n)}),writerEnv.vars.set("flatMap",(a,e)=>{const t=a==null?void 0:a.val,n=Array.isArray(a==null?void 0:a.log)?a.log:[],r=typeof e=="function"?e(t):null,s=Array.isArray(r==null?void 0:r.log)?r.log:[];return wrapWriter(r==null?void 0:r.val,[...n,...s])}),writerEnv.vars.set("listen",a=>{const e=a==null?void 0:a.val,t=Array.isArray(a==null?void 0:a.log)?a.log:[];return wrapWriter([e,t],t)});for(const a of writerEnv.vars.keys())writerEnv.exports.add(a);env.modules.set("Writer",writerEnv);const LessCtor=Object.freeze({$tag:"Less",$args:[]}),EqualCtor=Object.freeze({$tag:"Equal",$args:[]}),GreaterCtor=Object.freeze({$tag:"Greater",$args:[]});env.vars.set("Less",LessCtor),env.vars.set("Equal",EqualCtor),env.vars.set("Greater",GreaterCtor);const deepEquals=(a,e)=>{if(a===e)return!0;if(a==null||e===null||e===void 0)return a===e;if(typeof a!=typeof e)return!1;if(typeof a=="object"){if(a.$tag&&e.$tag){if(a.$tag!==e.$tag)return!1;if(a.val!==void 0&&e.val!==void 0)return deepEquals(a.val,e.val);if(a.err!==void 0&&e.err!==void 0)return deepEquals(a.err,e.err);if(a.left!==void 0&&e.left!==void 0)return deepEquals(a.left,e.left);if(a.right!==void 0&&e.right!==void 0)return deepEquals(a.right,e.right)}if(Array.isArray(a)&&Array.isArray(e)){if(a.length!==e.length)return!1;for(let r=0;r<a.length;r++)if(!deepEquals(a[r],e[r]))return!1;return!0}const t=Object.keys(a),n=Object.keys(e);if(t.length!==n.length)return!1;for(const r of t)if(!deepEquals(a[r],e[r]))return!1;return!0}return!1},setoidEnv={vars:new Map,modules:new Map,exports:new Set};setoidEnv.vars.set("equals",(a,e)=>deepEquals(a,e)),setoidEnv.vars.set("notEquals",(a,e)=>!deepEquals(a,e)),setoidEnv.vars.set("fromEquals",a=>({equals:a})),setoidEnv.vars.set("contramap",(a,e)=>({equals:(t,n)=>a&&typeof a.equals=="function"?a.equals(e(t),e(n)):deepEquals(e(t),e(n))}));for(const a of setoidEnv.vars.keys())setoidEnv.exports.add(a);env.modules.set("Setoid",setoidEnv);const compareVals=(a,e)=>a===e?EqualCtor:typeof a=="number"&&typeof e=="number"?a<e?LessCtor:GreaterCtor:typeof a=="string"&&typeof e=="string"?a<e?LessCtor:a>e?GreaterCtor:EqualCtor:typeof a=="boolean"&&typeof e=="boolean"?a===e?EqualCtor:!a&&e?LessCtor:GreaterCtor:String(a)<String(e)?LessCtor:String(a)>String(e)?GreaterCtor:EqualCtor,ordEnv={vars:new Map,modules:new Map,exports:new Set};ordEnv.vars.set("Less",LessCtor),ordEnv.vars.set("Equal",EqualCtor),ordEnv.vars.set("Greater",GreaterCtor),ordEnv.vars.set("compare",(a,e)=>compareVals(a,e)),ordEnv.vars.set("min",(a,e)=>compareVals(a,e)===LessCtor?a:e),ordEnv.vars.set("max",(a,e)=>compareVals(a,e)===GreaterCtor?a:e),ordEnv.vars.set("clamp",(a,e,t)=>compareVals(a,e)===LessCtor?e:compareVals(a,t)===GreaterCtor?t:a),ordEnv.vars.set("between",(a,e,t)=>compareVals(a,e)!==LessCtor&&compareVals(a,t)!==GreaterCtor),ordEnv.vars.set("isLess",(a,e)=>compareVals(a,e)===LessCtor),ordEnv.vars.set("isGreater",(a,e)=>compareVals(a,e)===GreaterCtor),ordEnv.vars.set("isEqual",(a,e)=>compareVals(a,e)===EqualCtor),ordEnv.vars.set("fromCompare",a=>({compare:a})),ordEnv.vars.set("contramap",(a,e)=>({compare:(t,n)=>a&&typeof a.compare=="function"?a.compare(e(t),e(n)):compareVals(e(t),e(n))})),ordEnv.vars.set("reverse",a=>({compare:(e,t)=>a&&typeof a.compare=="function"?a.compare(t,e):compareVals(t,e)}));for(const a of ordEnv.vars.keys())ordEnv.exports.add(a);env.modules.set("Ord",ordEnv);const combineSemigroup=(a,e)=>typeof a=="number"&&typeof e=="number"||typeof a=="string"&&typeof e=="string"?a+e:Array.isArray(a)&&Array.isArray(e)?[...a,...e]:a&&typeof a=="object"&&a.$tag==="Some"&&e&&typeof e=="object"&&e.$tag==="Some"?SomeCtor(combineSemigroup(a.val,e.val)):a&&typeof a=="object"&&a.$tag==="Some"?a:e&&typeof e=="object"&&e.$tag==="Some"?e:a&&typeof a=="object"&&typeof a.combine=="function"?a.combine(e):e,semigroupEnv={vars:new Map,modules:new Map,exports:new Set};semigroupEnv.vars.set("combine",(a,e)=>combineSemigroup(a,e)),semigroupEnv.vars.set("concatAll",(a,e)=>!Array.isArray(a)||a.length===0?e:a.reduce((t,n)=>combineSemigroup(t,n))),semigroupEnv.vars.set("combineAll",(a,e)=>!Array.isArray(a)||a.length===0?e:a.reduce((t,n)=>combineSemigroup(t,n))),semigroupEnv.vars.set("first",()=>({combine:(a,e)=>a})),semigroupEnv.vars.set("last",()=>({combine:(a,e)=>e})),semigroupEnv.vars.set("struct",a=>({combine:(e,t)=>{const n={};for(const r in a)n[r]=a[r].combine(e[r],t[r]);return n}})),semigroupEnv.vars.set("dual",a=>({combine:(e,t)=>a&&typeof a.combine=="function"?a.combine(t,e):combineSemigroup(t,e)}));for(const a of semigroupEnv.vars.keys())semigroupEnv.exports.add(a);env.modules.set("Semigroup",semigroupEnv),env.modules.set("SemiGroup",semigroupEnv);const groupEnv={vars:new Map,modules:new Map,exports:new Set};groupEnv.vars.set("invert",a=>typeof a=="number"?-a:a&&typeof a.invert=="function"?a.invert():a),groupEnv.vars.set("subtract",(a,e)=>typeof a=="number"&&typeof e=="number"?a-e:combineSemigroup(a,groupEnv.vars.get("invert")(e))),groupEnv.vars.set("SumNumber",{empty:()=>0,combine:(a,e)=>a+e,invert:a=>-a}),groupEnv.vars.set("ProductNonZero",{empty:()=>1,combine:(a,e)=>a*e,invert:a=>1/a});for(const a of groupEnv.vars.keys())groupEnv.exports.add(a);env.modules.set("Group",groupEnv);const monoidEmptyMap={Sum:0,Product:1,String:"",Array:[],All:!0,Any:!1},monoidEnv={vars:new Map,modules:new Map,exports:new Set};monoidEnv.vars.set("empty",a=>a in monoidEmptyMap?monoidEmptyMap[a]:null),monoidEnv.vars.set("combine",(a,e)=>combineSemigroup(a,e)),monoidEnv.vars.set("concatAll",(a,e)=>!Array.isArray(a)||a.length===0?e:a.reduce((t,n)=>combineSemigroup(t,n),e)),monoidEnv.vars.set("Sum",{empty:()=>0,combine:(a,e)=>a+e}),monoidEnv.vars.set("Product",{empty:()=>1,combine:(a,e)=>a*e}),monoidEnv.vars.set("String",{empty:()=>"",combine:(a,e)=>a+e}),monoidEnv.vars.set("Array",{empty:()=>[],combine:(a,e)=>[...a,...e]}),monoidEnv.vars.set("All",{empty:()=>!0,combine:(a,e)=>a&&e}),monoidEnv.vars.set("Any",{empty:()=>!1,combine:(a,e)=>a||e}),monoidEnv.vars.set("struct",a=>({empty:()=>{const e={};for(const t in a)e[t]=a[t].empty();return e},combine:(e,t)=>{const n={};for(const r in a)n[r]=a[r].combine(e[r],t[r]);return n}}));for(const a of monoidEnv.vars.keys())monoidEnv.exports.add(a);env.modules.set("Monoid",monoidEnv);const mapFunctor=(a,e)=>{if(a&&typeof a=="object"){if(a.$tag==="Some")return SomeCtor(e(a.val));if(a.$tag==="None")return NoneVal;if(a.$tag==="Ok")return OkCtor(e(a.val));if(a.$tag==="Err")return a;if(a.$tag==="Right")return RightCtor(e(a.right));if(a.$tag==="Left")return a;if(a.$tag==="Valid")return ValidCtor(e(a.val));if(a.$tag==="Invalid")return a;if(typeof a.map=="function")return a.map(e)}return Array.isArray(a)?a.map(e):a},functorEnv={vars:new Map,modules:new Map,exports:new Set};functorEnv.vars.set("map",(a,e)=>mapFunctor(a,e)),functorEnv.vars.set("lift",a=>e=>mapFunctor(e,a)),functorEnv.vars.set("as",(a,e)=>mapFunctor(a,()=>e)),functorEnv.vars.set("voidRight",a=>mapFunctor(a,()=>null));for(const a of functorEnv.vars.keys())functorEnv.exports.add(a);env.modules.set("Functor",functorEnv);const contravariantEnv={vars:new Map,modules:new Map,exports:new Set};contravariantEnv.vars.set("cmap",(a,e)=>typeof a=="function"?t=>a(e(t)):a&&typeof a.cmap=="function"?a.cmap(e):a&&typeof a.contramap=="function"?a.contramap(e):t=>a(e(t))),contravariantEnv.vars.set("contramap",(a,e)=>typeof a=="function"?t=>a(e(t)):t=>a(e(t))),contravariantEnv.vars.set("predicate",a=>({run:a,cmap:e=>t=>a(e(t))}));for(const a of contravariantEnv.vars.keys())contravariantEnv.exports.add(a);env.modules.set("Contravariant",contravariantEnv);const apApplicative=(a,e)=>{if(a&&typeof a=="object"&&e&&typeof e=="object"){if(a.$tag==="Some"&&e.$tag==="Some")return SomeCtor(a.val(e.val));if(a.$tag==="None"||e.$tag==="None")return NoneVal;if(a.$tag==="Ok"&&e.$tag==="Ok")return OkCtor(a.val(e.val));if(a.$tag==="Err")return a;if(e.$tag==="Err")return e;if(a.$tag==="Right"&&e.$tag==="Right")return RightCtor(a.right(e.right));if(a.$tag==="Left")return a;if(e.$tag==="Left")return e;if(a.$tag==="Valid"&&e.$tag==="Valid")return ValidCtor(a.val(e.val));if(a.$tag==="Invalid"&&e.$tag==="Invalid")return InvalidCtor([...a.errs,...e.errs]);if(a.$tag==="Invalid")return a;if(e.$tag==="Invalid")return e}if(Array.isArray(a)&&Array.isArray(e)){const t=[];for(const n of a)for(const r of e)typeof n=="function"&&t.push(n(r));return t}return e},applicativeEnv={vars:new Map,modules:new Map,exports:new Set};applicativeEnv.vars.set("pure",a=>SomeCtor(a)),applicativeEnv.vars.set("ap",(a,e)=>apApplicative(a,e)),applicativeEnv.vars.set("lift2",(a,e,t)=>{const n=mapFunctor(e,r=>s=>a(r,s));return apApplicative(n,t)}),applicativeEnv.vars.set("lift3",(a,e,t,n)=>{const r=mapFunctor(e,i=>o=>l=>a(i,o,l)),s=apApplicative(r,t);return apApplicative(s,n)}),applicativeEnv.vars.set("zip",(a,e)=>{const n=mapFunctor(a,r=>s=>[r,s]);return apApplicative(n,e)});for(const a of applicativeEnv.vars.keys())applicativeEnv.exports.add(a);env.modules.set("Applicative",applicativeEnv);const ValidCtor=a=>Object.freeze({$tag:"Valid",val:a,$args:[a]}),InvalidCtor=a=>Object.freeze({$tag:"Invalid",errs:Array.isArray(a)?a:[a],$args:[Array.isArray(a)?a:[a]]});env.vars.set("Valid",ValidCtor),env.vars.set("Invalid",InvalidCtor);const validationEnv={vars:new Map,modules:new Map,exports:new Set};validationEnv.vars.set("Valid",ValidCtor),validationEnv.vars.set("Invalid",InvalidCtor),validationEnv.vars.set("pure",a=>ValidCtor(a)),validationEnv.vars.set("invalid",a=>InvalidCtor([a])),validationEnv.vars.set("isValid",a=>!!(a&&typeof a=="object"&&a.$tag==="Valid")),validationEnv.vars.set("isInvalid",a=>!!(a&&typeof a=="object"&&a.$tag==="Invalid")),validationEnv.vars.set("map",(a,e)=>a&&typeof a=="object"&&a.$tag==="Valid"&&typeof e=="function"?ValidCtor(e(a.val)):a),validationEnv.vars.set("ap",(a,e)=>apApplicative(a,e)),validationEnv.vars.set("accumulate",(a,e,t)=>{if(a&&a.$tag==="Valid"&&e&&e.$tag==="Valid"&&typeof t=="function")return ValidCtor(t(a.val,e.val));const n=a&&a.$tag==="Invalid"?a.errs:[],r=e&&e.$tag==="Invalid"?e.errs:[];return InvalidCtor([...n,...r])}),validationEnv.vars.set("getOrElse",(a,e)=>a&&a.$tag==="Valid"?a.val:e),validationEnv.vars.set("toResult",a=>a&&a.$tag==="Valid"?OkCtor(a.val):ErrCtor(a==null?void 0:a.errs));for(const a of validationEnv.vars.keys())validationEnv.exports.add(a);env.modules.set("Validation",validationEnv);const bifunctorEnv={vars:new Map,modules:new Map,exports:new Set};bifunctorEnv.vars.set("bimap",(a,e,t)=>{if(a&&typeof a=="object"){if(a.$tag==="Ok")return OkCtor(t(a.val));if(a.$tag==="Err")return ErrCtor(e(a.err));if(a.$tag==="Right")return RightCtor(t(a.right));if(a.$tag==="Left")return LeftCtor(e(a.left));if(typeof a.bimap=="function")return a.bimap(e,t)}return a});for(const a of bifunctorEnv.vars.keys())bifunctorEnv.exports.add(a);env.modules.set("Bifunctor",bifunctorEnv);const profunctorEnv={vars:new Map,modules:new Map,exports:new Set},dimapFn=(a,e,t)=>typeof a=="function"?n=>t(a(e(n))):a&&typeof a.dimap=="function"?a.dimap(e,t):n=>t(a(e(n)));profunctorEnv.vars.set("dimap",dimapFn),profunctorEnv.vars.set("promap",dimapFn);for(const a of profunctorEnv.vars.keys())profunctorEnv.exports.add(a);env.modules.set("Profunctor",profunctorEnv);const foldableEnv={vars:new Map,modules:new Map,exports:new Set};foldableEnv.vars.set("foldLeft",(a,e,t)=>{if(Array.isArray(a))return a.reduce(t,e);if(a&&typeof a=="object"){if(a.$tag==="Some")return t(e,a.val);if(a.$tag==="None")return e;if(a.$tag==="Ok")return t(e,a.val);if(a.$tag==="Err")return e;if(typeof a.reduce=="function")return a.reduce(t,e)}return e}),foldableEnv.vars.set("foldMap",(a,e,t)=>{const n=typeof e=="object"&&typeof e.combine=="function"?e.combine:combineSemigroup,r=typeof e=="object"&&typeof e.empty=="function"?e.empty():typeof e=="string"?monoidEmptyMap[e]:null;return Array.isArray(a)?a.reduce((s,i)=>n(s,t(i)),r):a&&typeof a=="object"&&(a.$tag==="Some"||a.$tag==="Ok")?n(r,t(a.val)):r});for(const a of foldableEnv.vars.keys())foldableEnv.exports.add(a);env.modules.set("Foldable",foldableEnv);const wrapTask=a=>({$tag:"Task",run:typeof a=="function"?a:()=>a}),taskEnv={vars:new Map,modules:new Map,exports:new Set};taskEnv.vars.set("pure",a=>wrapTask(()=>a)),taskEnv.vars.set("of",a=>wrapTask(()=>a)),taskEnv.vars.set("succeed",a=>wrapTask(()=>a)),taskEnv.vars.set("delay",a=>wrapTask(typeof a=="function"?a:()=>a)),taskEnv.vars.set("run",a=>a&&typeof a.run=="function"?a.run():a),taskEnv.vars.set("map",(a,e)=>wrapTask(()=>{const t=a&&typeof a.run=="function"?a.run():a;return typeof e=="function"?e(t):t})),taskEnv.vars.set("flatMap",(a,e)=>wrapTask(()=>{const t=a&&typeof a.run=="function"?a.run():a,n=typeof e=="function"?e(t):t;return n&&typeof n.run=="function"?n.run():n}));for(const a of taskEnv.vars.keys())taskEnv.exports.add(a);env.modules.set("Task",taskEnv);const wrapIO=a=>({$tag:"IO",run:typeof a=="function"?a:()=>a}),ioEnv={vars:new Map,modules:new Map,exports:new Set};ioEnv.vars.set("pure",a=>wrapIO(()=>a)),ioEnv.vars.set("of",a=>wrapIO(()=>a)),ioEnv.vars.set("delay",a=>wrapIO(typeof a=="function"?a:()=>a)),ioEnv.vars.set("map",(a,e)=>wrapIO(()=>{const t=a&&typeof a.run=="function"?a.run():a;return typeof e=="function"?e(t):t})),ioEnv.vars.set("flatMap",(a,e)=>wrapIO(()=>{const t=a&&typeof a.run=="function"?a.run():a,n=typeof e=="function"?e(t):t;return n&&typeof n.run=="function"?n.run():n})),ioEnv.vars.set("run",a=>a&&typeof a.run=="function"?a.run():a),ioEnv.vars.set("println",a=>wrapIO(()=>console.log(String(a))));for(const a of ioEnv.vars.keys())ioEnv.exports.add(a);env.modules.set("IO",ioEnv);const wrapState=a=>({$tag:"State",run:typeof a=="function"?a:e=>[null,e]}),stateEnv={vars:new Map,modules:new Map,exports:new Set};stateEnv.vars.set("pure",a=>wrapState(e=>[a,e])),stateEnv.vars.set("of",a=>wrapState(e=>[a,e])),stateEnv.vars.set("get",()=>wrapState(a=>[a,a])),stateEnv.vars.set("set",a=>wrapState(e=>[null,a])),stateEnv.vars.set("modify",a=>wrapState(e=>[null,typeof a=="function"?a(e):e])),stateEnv.vars.set("run",(a,e)=>a&&typeof a.run=="function"?a.run(e):[null,e]),stateEnv.vars.set("evalState",(a,e)=>{const t=a&&typeof a.run=="function"?a.run(e):[null,e];return Array.isArray(t)?t[0]:t}),stateEnv.vars.set("execState",(a,e)=>{const t=a&&typeof a.run=="function"?a.run(e):[null,e];return Array.isArray(t)?t[1]:t}),stateEnv.vars.set("map",(a,e)=>wrapState(t=>{const[n,r]=a&&typeof a.run=="function"?a.run(t):[null,t];return[typeof e=="function"?e(n):n,r]})),stateEnv.vars.set("flatMap",(a,e)=>wrapState(t=>{const[n,r]=a&&typeof a.run=="function"?a.run(t):[null,t],s=typeof e=="function"?e(n):null;return s&&typeof s.run=="function"?s.run(r):[null,r]}));for(const a of stateEnv.vars.keys())stateEnv.exports.add(a);env.modules.set("State",stateEnv);const domEnv={vars:new Map,modules:new Map,exports:new Set};domEnv.vars.set("getElementById",a=>typeof document<"u"?document.getElementById(String(a)):{id:String(a),textContent:"",innerHTML:"",value:"",getContext:()=>({fillRect:()=>{},strokeRect:()=>{},clearRect:()=>{},beginPath:()=>{},moveTo:()=>{},lineTo:()=>{},stroke:()=>{},fill:()=>{},arc:()=>{},closePath:()=>{},fillStyle:"",strokeStyle:"",lineWidth:1})}),domEnv.vars.set("createElement",a=>typeof document<"u"?document.createElement(String(a)):{tag:String(a),attrs:{},children:[],textContent:""}),domEnv.vars.set("setText",(a,e)=>(a&&"textContent"in a&&(a.textContent=String(e)),null)),domEnv.vars.set("getValue",a=>a&&typeof a=="object"&&"value"in a?String(a.value):""),domEnv.vars.set("setValue",(a,e)=>(a&&typeof a=="object"&&"value"in a&&(a.value=String(e)),null)),domEnv.vars.set("focus",a=>(a&&typeof a.focus=="function"&&a.focus(),null)),domEnv.vars.set("blur",a=>(a&&typeof a.blur=="function"&&a.blur(),null)),domEnv.vars.set("setHtml",(a,e)=>(a&&"innerHTML"in a&&(a.innerHTML=String(e)),null)),domEnv.vars.set("setAttr",(a,e,t)=>(a&&"setAttribute"in a&&a.setAttribute(String(e),String(t)),null)),domEnv.vars.set("appendChild",(a,e)=>(a&&"appendChild"in a&&e&&a.appendChild(e),null)),domEnv.vars.set("addEventListener",(a,e,t)=>(a&&"addEventListener"in a&&typeof t=="function"&&a.addEventListener(String(e),t),null)),domEnv.vars.set("h",(a,e={},t=[])=>({$vnode:!0,tag:String(a),props:e||{},children:Array.isArray(t)?t:[t]})),domEnv.vars.set("mount",(a,e)=>(stdout.push(`[DOM Mount] Mounted Virtual DOM root into container #${typeof a=="string"?a:"root"}
`),null)),domEnv.vars.set("eval",code=>{try{return eval(String(code))}catch{return null}}),domEnv.vars.set("log",a=>(stdout.push(formatValue(a)+`
`),null)),domEnv.vars.set("initAudio",()=>null),domEnv.vars.set("playCustomTone",(a,e,t,n,r)=>null),domEnv.vars.set("playNoise",(a,e)=>null),domEnv.vars.set("playTone",(a,e,t,n)=>null),domEnv.vars.set("playRamp",(a,e,t,n,r)=>null),domEnv.vars.set("playSequence",(a,e,t,n)=>null),domEnv.vars.set("startMusic",(a,e,t,n,r)=>null),domEnv.vars.set("stopMusic",a=>null),domEnv.vars.set("resumeAudio",()=>null),domEnv.vars.set("confetti",(a,e,t)=>null),domEnv.vars.set("setInterval",(a,e)=>typeof setInterval<"u"?setInterval(a,e):1),domEnv.vars.set("clearInterval",a=>(typeof clearInterval<"u"&&clearInterval(a),null)),domEnv.vars.set("setTimeout",(a,e)=>typeof setTimeout<"u"?setTimeout(a,e):1),domEnv.vars.set("clearTimeout",a=>(typeof clearTimeout<"u"&&clearTimeout(a),null)),domEnv.vars.set("requestAnimationFrame",a=>(typeof requestAnimationFrame<"u"&&requestAnimationFrame(a),null)),domEnv.vars.set("storageGet",a=>""),domEnv.vars.set("storageSet",(a,e)=>null),domEnv.vars.set("storageRemove",a=>null);for(const a of domEnv.vars.keys())domEnv.exports.add(a);env.modules.set("DOM",domEnv);const nodeEnv={vars:new Map,modules:new Map,exports:new Set};nodeEnv.vars.set("stringify",a=>{try{return JSON.stringify(a)}catch{return"{}"}}),nodeEnv.vars.set("parse",a=>{try{return JSON.parse(String(a))}catch{return null}}),nodeEnv.vars.set("envGet",a=>typeof process<"u"&&define_process_env_default&&define_process_env_default[String(a)]||""),nodeEnv.vars.set("readFile",a=>`// Mock file content for ${a}`),nodeEnv.vars.set("writeFile",(a,e)=>(stdout.push(`[File System] Wrote ${String(e).length} bytes to ${a}
`),null)),nodeEnv.vars.set("createApp",()=>({_routes:[],_middlewares:[],name:"TypeLangExpressServer"})),nodeEnv.vars.set("get",(a,e,t)=>(a&&a._routes&&a._routes.push({method:"GET",path:String(e),handler:t}),null)),nodeEnv.vars.set("post",(a,e,t)=>(a&&a._routes&&a._routes.push({method:"POST",path:String(e),handler:t}),null)),nodeEnv.vars.set("use",(a,e)=>(a&&a._middlewares&&a._middlewares.push(e),null)),nodeEnv.vars.set("listen",(a,e,t)=>(stdout.push(`[Node Express] 🚀 Server running and listening on http://localhost:${e}
`),typeof t=="function"&&t(),{port:Number(e),close:()=>{stdout.push(`[Node Express] Server on port ${e} closed
`)}})),nodeEnv.vars.set("send",(a,e)=>(stdout.push(`[HTTP Response] ${e}
`),null)),nodeEnv.vars.set("json",(a,e)=>{const t=JSON.stringify(e);return stdout.push(`[HTTP JSON Response] ${t}
`),null}),nodeEnv.vars.set("status",(a,e)=>(a&&typeof a=="object"&&(a.statusCode=e),a||{statusCode:e})),nodeEnv.vars.set("now",()=>Date.now());for(const a of nodeEnv.vars.keys())nodeEnv.exports.add(a);return env.modules.set("Node",nodeEnv),env}function formatValue(a,e=new Set){if(a==null)return"void";if(typeof a=="boolean"||typeof a=="number")return String(a);if(typeof a=="string")return a;if(typeof a=="function")return"<function>";if(typeof a=="object"){if(e.has(a))return"...";if(e.add(a),a.$tag){const n=Object.keys(a).filter(s=>s!=="$tag");if(n.length===0)return a.$tag;const r=n.map(s=>formatValue(a[s],e)).join(", ");return`${a.$tag}(${r})`}return Array.isArray(a)?`[${a.map(n=>formatValue(n,e)).join(", ")}]`:`{ ${Object.entries(a).filter(([n])=>typeof a[n]!="function").map(([n,r])=>`${n}: ${formatValue(r,e)}`).join(", ")} }`}return String(a)}class Evaluator{constructor(){this.stdout=[],this.recursionDepth=0,this.maxRecursionDepth=500}evalProgram(e){const t=performance.now();this.stdout=[],this.recursionDepth=0;const n=createInitialRuntimeEnv(this.stdout);let r=null;for(const i of e.statements)r=this.evalStatement(i,n);const s=performance.now();return{stdout:this.stdout,result:r,executionTimeMs:Math.round((s-t)*100)/100}}evalStatement(e,t){switch(e.kind){case"s_let":{const n=this.evalExpr(e.init,t);return t.vars.set(e.name,n),e.isExported&&t.exports.add(e.name),n}case"s_function":{const n=(...r)=>{const s={vars:new Map,modules:new Map,exports:new Set,parent:t};if(e.whereBindings&&e.whereBindings.length>0)for(const i of e.whereBindings)this.evalStatement(i,s);e.params.forEach((i,o)=>{s.vars.set(i.name,r[o])});try{return this.evalExpr(e.body,s)}catch(i){if(i instanceof ReturnSignal)return i.value;throw i}};return t.vars.set(e.name,n),e.isExported&&t.exports.add(e.name),n}case"s_gadt":{for(const n of e.decl.constructors){if(n.params.length===0)t.vars.set(n.name,{$tag:n.name});else{const r=(...s)=>{const i={$tag:n.name};return n.params.forEach((o,l)=>{i[o.name]=s[l]}),i};t.vars.set(n.name,r)}e.isExported&&t.exports.add(n.name)}return null}case"s_type_alias":return null;case"s_module":{const n={vars:new Map,modules:new Map,exports:new Set,parent:t};t.modules.set(e.name,n),e.isExported&&t.exports.add(e.name);for(const r of e.body)this.evalStatement(r,n);return n}case"s_import":return this.processImport(e,t),null;case"s_extern_module":{const n={vars:new Map,modules:new Map,exports:new Set,parent:t},r={};for(const i of e.functions){const o=(...l)=>{const u=(typeof globalThis<"u"?globalThis:{})[e.name]||(typeof window<"u"?window[e.name]:void 0);if(u&&typeof u[i.name]=="function")return u[i.name](...l);if(i.name==="sum"&&Array.isArray(l[0]))return l[0].reduce((p,d)=>Number(p)+Number(d),0);if(i.name==="chunk"&&Array.isArray(l[0])){const p=l[0],d=Number(l[1])||1,f=[];for(let m=0;m<p.length;m+=d)f.push(p.slice(m,m+d));return f}return null};n.vars.set(i.name,o),n.exports.add(i.name),r[i.name]=o}for(const i of e.values){const l=(typeof globalThis<"u"?globalThis:{})[e.name],c=l&&i.name in l?l[i.name]:null;n.vars.set(i.name,c),n.exports.add(i.name),r[i.name]=c}t.modules.set(e.name,n),t.vars.set(e.name,r);const s=e.name.replace(/^npm:/,"").replace(/[^a-zA-Z0-9_]/g,"_");return s!==e.name&&(t.modules.set(s,n),t.vars.set(s,r)),e.isExported&&t.exports.add(e.name),n}case"s_extern_function":{const n=typeof globalThis<"u"?globalThis:{},r=(...s)=>typeof n[e.name]=="function"?n[e.name](...s):null;return t.vars.set(e.name,r),e.isExported&&t.exports.add(e.name),r}case"s_extern_value":{const r=(typeof globalThis<"u"?globalThis:{})[e.name]??null;return t.vars.set(e.name,r),e.isExported&&t.exports.add(e.name),r}case"s_extern_type":return null;case"s_expr":return this.evalExpr(e.expr,t)}}processImport(e,t){let n=t,r;for(;n;){if(n.modules.has(e.modulePath[0])){r=n;break}n=n.parent}let s=r;for(const i of e.modulePath){if(!s)break;s=s.modules.get(i)}if(s){if(e.alias){t.modules.set(e.alias,s);return}if(e.specifiers)for(const i of e.specifiers)if(i.isAll)s.exports.forEach(o=>{s.vars.has(o)&&t.vars.set(o,s.vars.get(o))});else{const o=i.name,l=i.alias||o;s.vars.has(o)&&t.vars.set(l,s.vars.get(o))}else t.modules.set(e.modulePath[e.modulePath.length-1],s)}}evalExpr(e,t){if(this.recursionDepth++,this.recursionDepth>this.maxRecursionDepth)throw this.recursionDepth--,new Error(`Runtime Error: Maximum recursion depth of ${this.maxRecursionDepth} exceeded. Stack overflow or infinite recursion detected.`);try{return this.evalExprInner(e,t)}finally{this.recursionDepth--}}evalExprInner(e,t){switch(e.kind){case"e_literal":return e.value;case"e_var":{if(e.modulePath&&e.modulePath.length>0){let r=t,s;for(;r;){if(r.modules.has(e.modulePath[0])){s=r;break}r=r.parent}let i=s;for(const o of e.modulePath)i=i==null?void 0:i.modules.get(o);if(i){if(i.vars.has(e.name))return i.vars.get(e.name);if(i.modules.has(e.name))return this.moduleEnvToObject(i.modules.get(e.name))}}let n=t;for(;n;){if(n.vars.has(e.name))return n.vars.get(e.name);if(n.modules.has(e.name))return this.moduleEnvToObject(n.modules.get(e.name));n=n.parent}throw new Error(`Runtime Error: Undefined variable '${e.name}'`)}case"e_unary":{const n=this.evalExpr(e.expr,t);return e.op==="-"?-n:e.op==="!"?!n:n}case"e_binary":{const n=this.evalExpr(e.left,t),r=this.evalExpr(e.right,t);switch(e.op){case"+":return n+r;case"-":return n-r;case"*":return n*r;case"/":return n/r;case"%":return n%r;case"==":return n===r;case"!=":return n!==r;case"<":return n<r;case"<=":return n<=r;case">":return n>r;case">=":return n>=r;case"&&":return!!(n&&r);case"||":return!!(n||r)}}case"e_assign":{const n=this.evalExpr(e.value,t);if(e.target.kind==="e_var"){const r=e.target.name;let s=t;for(;s;){if(s.vars.has(r)){let i=s.vars.get(r);return e.op==="+="?i+=n:e.op==="-="?i-=n:e.op==="*="?i*=n:e.op==="/="?i/=n:i=n,s.vars.set(r,i),i}s=s.parent}return t.vars.set(r,n),n}else if(e.target.kind==="e_field_access"){const r=this.evalExpr(e.target.object,t);let s=r[e.target.field];return e.op==="+="?s+=n:e.op==="-="?s-=n:e.op==="*="?s*=n:e.op==="/="?s/=n:s=n,r[e.target.field]=s,s}else if(e.target.kind==="e_index"){const r=this.evalExpr(e.target.target,t),s=this.evalExpr(e.target.index,t);if(r!=null){let i=r[s];return e.op==="+="?i+=n:e.op==="-="?i-=n:e.op==="*="?i*=n:e.op==="/="?i/=n:i=n,r[s]=i,i}}return n}case"e_call":{const n=this.evalExpr(e.callee,t),r=e.args.map(s=>this.evalExpr(s,t));if(typeof n=="function")return n(...r);throw new Error("Runtime Error: Object is not a function")}case"e_field_access":{const n=this.evalExpr(e.object,t);return n!=null?n[e.field]:void 0}case"e_index":{const n=this.evalExpr(e.target,t),r=this.evalExpr(e.index,t);return n!=null&&n[r]!==void 0?n[r]:null}case"e_method_call":{const n=this.evalExpr(e.object,t);if(n==null)throw new Error(`Runtime Error: Cannot call method '${e.method}' on ${n}`);const r=n[e.method],s=e.args.map(i=>this.evalExpr(i,t));if(typeof r=="function")return e.isModuleMethod||Array.isArray(n)||typeof n=="string"||typeof n=="number"||n instanceof Map||n instanceof Set?r.apply(n,s):r._isTypeLangMethod?r.call(n,n,...s):r.apply(n,s);throw new Error(`Runtime Error: Method '${e.method}' is not defined on target`)}case"e_record":{const n={};for(const r of e.fields)n[r.name]=this.evalExpr(r.value,t);if(e.methods)for(const r of e.methods){const s=(i,...o)=>{const l={vars:new Map,modules:new Map,exports:new Set,parent:t};return l.vars.set(r.selfParam,i),r.params.forEach((c,u)=>{l.vars.set(c.name,o[u])}),this.evalExpr(r.body,l)};s._isTypeLangMethod=!0,n[r.name]=s}return n}case"e_record_update":{const r={...this.evalExpr(e.base,t)};for(const s of e.updates)r[s.name]=this.evalExpr(s.value,t);return r}case"e_tuple":return e.elements.map(n=>this.evalExpr(n,t));case"e_lambda":return(...n)=>{const r={vars:new Map,modules:new Map,exports:new Set,parent:t};return e.params.forEach((s,i)=>{r.vars.set(s.name,n[i])}),this.evalExpr(e.body,r)};case"e_if":return this.evalExpr(e.cond,t)?this.evalExpr(e.thenExpr,t):e.elseExpr?this.evalExpr(e.elseExpr,t):null;case"e_block":{const n={vars:new Map,modules:new Map,exports:new Set,parent:t};let r=null;for(const s of e.statements)r=this.evalStatement(s,n);return e.result?this.evalExpr(e.result,n):r}case"e_switch":{const n=this.evalExpr(e.discriminant,t);let r=!1,s=!1;for(const i of e.cases){const o=i.values&&i.values.length>0?i.values:i.value?[i.value]:[];let l=!1;for(const c of o){const u=this.evalExpr(c,t);if(this.isValEqual(n,u)){l=!0;break}}if(l||s){r=!0,s=!1;try{return this.evalExpr(i.body,t)}catch(c){if(c instanceof ContinueSignal){s=!0;continue}else{if(c instanceof BreakSignal)return null;throw c}}}}return e.defaultCase&&(!r||s)?this.evalExpr(e.defaultCase,t):null}case"e_range":{const n=this.evalExpr(e.start,t),r=this.evalExpr(e.end,t),s=Number(n),i=Number(r),o=[];if(s<=i){const l=e.inclusive?i:i-1;for(let c=s;c<=l;c++)o.push(c)}else{const l=e.inclusive?i:i+1;for(let c=s;c>=l;c--)o.push(c)}return o}case"e_list_comp":{const n=this.evalExpr(e.iterable,t);if(!Array.isArray(n))throw new Error(`Runtime Error: List comprehension iterable must be an array, got ${formatValue(n)}`);const r=[];for(const s of n){const i={vars:new Map(t.vars),modules:t.modules,exports:t.exports,parent:t};if(i.vars.set(e.param,s),e.condition&&!this.evalExpr(e.condition,i))continue;const o=this.evalExpr(e.element,i);r.push(o)}return r}case"e_match":{const n=this.evalExpr(e.scrutinee,t);for(const r of e.arms){const s={vars:new Map,modules:new Map,exports:new Set,parent:t};if(this.matchPattern(r.pattern,n,s)){if(r.guard&&!this.evalExpr(r.guard,s))continue;return this.evalExpr(r.body,s)}}throw new Error(`Runtime Error: Unhandled pattern match for value ${formatValue(n)}`)}case"e_for":{const n={vars:new Map,modules:new Map,exports:new Set,parent:t};e.init&&(e.init.kind==="s_let"?this.evalStatement(e.init,n):e.init.kind==="s_expr"?this.evalExpr(e.init.expr,n):e.init.kind.startsWith("e_")&&this.evalExpr(e.init,n));let r=0;const s=1e6;for(;!e.cond||this.evalExpr(e.cond,n);){if(r++,r>s)throw new Error(`Runtime Error: Loop exceeded maximum iteration count (${s}). Infinite loop detected.`);try{this.evalExpr(e.body,n)}catch(i){if(i instanceof BreakSignal)break;if(!(i instanceof ContinueSignal))throw i}e.update&&this.evalExpr(e.update,n)}return null}case"e_while":{const n={vars:new Map,modules:new Map,exports:new Set,parent:t};let r=0;const s=1e6;for(;this.evalExpr(e.cond,n);){if(r++,r>s)throw new Error(`Runtime Error: Loop exceeded maximum iteration count (${s}). Infinite loop detected.`);try{this.evalExpr(e.body,n)}catch(i){if(i instanceof BreakSignal)break;if(i instanceof ContinueSignal)continue;throw i}}return null}case"e_break":throw new BreakSignal;case"e_continue":throw new ContinueSignal;case"e_return":{const n=e.value?this.evalExpr(e.value,t):null;throw new ReturnSignal(n)}case"e_do":{const n=desugarDo(e);return this.evalExpr(n,t)}case"e_where":{const n={vars:new Map,modules:new Map,exports:new Set,parent:t};for(const r of e.bindings)this.evalStatement(r,n);return this.evalExpr(e.expr,n)}}}matchPattern(e,t,n){switch(e.kind){case"p_wildcard":case"p_rest":return!0;case"p_var":return n.vars.set(e.name,t),!0;case"p_literal":return e.value===t;case"p_as":return n.vars.set(e.name,t),this.matchPattern(e.pattern,t,n);case"p_ctor":{if(t&&typeof t=="object"&&t.$tag===e.name){const r=Object.keys(t).filter(s=>s!=="$tag");for(let s=0;s<e.args.length;s++){const i=r[s];if(!this.matchPattern(e.args[s],t[i],n))return!1}return!0}return!1}case"p_record":{if(t&&typeof t=="object"){for(const r of e.fields){const s=t[r.name];if(r.pattern){if(!this.matchPattern(r.pattern,s,n))return!1}else{const i=r.alias||r.name;n.vars.set(i,s)}}return!0}return!1}case"p_tuple":{if(Array.isArray(t)){for(let r=0;r<e.elements.length;r++)if(!this.matchPattern(e.elements[r],t[r],n))return!1;return!0}return!1}}}isValEqual(e,t){if(e===t)return!0;if(e&&t&&typeof e=="object"&&typeof t=="object"){if(e.$tag&&t.$tag){if(e.$tag!==t.$tag)return!1;const n=Object.keys(e).filter(s=>s!=="$tag"),r=Object.keys(t).filter(s=>s!=="$tag");return n.length!==r.length?!1:n.every((s,i)=>this.isValEqual(e[s],t[r[i]]))}if(Array.isArray(e)&&Array.isArray(t))return e.length!==t.length?!1:e.every((n,r)=>this.isValEqual(n,t[r]))}return!1}moduleEnvToObject(e){const t={};return e.vars.forEach((n,r)=>{t[r]=n}),e.modules.forEach((n,r)=>{t[r]=this.moduleEnvToObject(n)}),t}}const JS_RESERVED_WORDS=new Set(["break","case","catch","class","const","continue","debugger","default","delete","do","else","export","extends","finally","for","function","if","import","in","instanceof","new","return","super","switch","this","throw","try","typeof","var","void","while","with","yield","await","enum","implements","interface","package","private","protected","public","static","eval","arguments"]);function sanitizeIdent(a){return JS_RESERVED_WORDS.has(a)?`_${a}`:a}class JSCodeGenerator{constructor(){this.tempVarCounter=0,this.indentLevel=0,this.localScopeVars=[]}freshVar(e="_t"){return`${e}$${++this.tempVarCounter}`}indent(){return"  ".repeat(this.indentLevel)}pushScope(e=[]){this.localScopeVars.push(new Set(e))}popScope(){this.localScopeVars.pop()}isLocalVar(e){for(let t=this.localScopeVars.length-1;t>=0;t--)if(this.localScopeVars[t].has(e))return!0;return!1}addLocalVar(e){this.localScopeVars.length>0&&this.localScopeVars[this.localScopeVars.length-1].add(e)}generate(e,t={target:"browser",includePrelude:!0}){this.tempVarCounter=0,this.indentLevel=0,this.localScopeVars=[];const n=[];t.includePrelude!==!1&&(n.push(this.generatePrelude(t.target||"browser")),n.push("")),this.pushScope();for(const r of e.statements){const s=this.generateStatement(r);s.trim()&&n.push(s)}return this.popScope(),n.join(`
`)}generatePrelude(e){return[e==="node"?"// TypeLang Generated Server Backend (Node.js Target)":"// TypeLang Generated Client Web App (ES2022 Target)",'"use strict";',"","// Core Language Primitives",'const $print = (v) => { console.log(typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)); return null; };','const $println = (v) => { console.log(typeof v === "object" && v !== null ? JSON.stringify(v) : String(v)); return null; };','const $to_string = (v) => typeof v === "object" && v !== null ? JSON.stringify(v) : String(v);',"const $concat = (a, b) => String(a) + String(b);","const $parse_int = (s) => parseInt(String(s), 10);","const $parse_float = (s) => parseFloat(String(s));","const $time_now = () => Date.now();","class __BreakSignal {}","class __ContinueSignal {}","class __ReturnSignal { constructor(v) { this.value = v; } }","","// Standard Library: Math Module","const $Math = {","  sqrt: Math.sqrt,","  abs: Math.abs,","  floor: Math.floor,","  ceil: Math.ceil,","  round: Math.round,","  min: Math.min,","  max: Math.max,","  pow: Math.pow,","  random: Math.random,","  cos: Math.cos,","  sin: Math.sin,","  atan2: Math.atan2,","  log: Math.log,","  bitwise_and: (a, b) => Number(a) & Number(b),","  bitwise_or: (a, b) => Number(a) | Number(b),","  bitwise_xor: (a, b) => Number(a) ^ Number(b),","  bitwise_not: (x) => ~Number(x),","  bitwise_shl: (a, b) => Number(a) << Number(b),","  bitwise_shr: (a, b) => Number(a) >> Number(b),","  PI: Math.PI","};","const Math$sqrt = $Math.sqrt, Math$abs = $Math.abs, Math$floor = $Math.floor, Math$ceil = $Math.ceil;","const Math$round = $Math.round, Math$min = $Math.min, Math$max = $Math.max, Math$pow = $Math.pow, Math$random = $Math.random;","const Math$cos = $Math.cos, Math$sin = $Math.sin, Math$atan2 = $Math.atan2, Math$log = $Math.log, Math$PI = $Math.PI;","const Math$bitwise_and = $Math.bitwise_and, Math$bitwise_or = $Math.bitwise_or, Math$bitwise_xor = $Math.bitwise_xor;","const Math$bitwise_not = $Math.bitwise_not, Math$bitwise_shl = $Math.bitwise_shl, Math$bitwise_shr = $Math.bitwise_shr;","","// Standard Library: Array Module","const $Array = {","  len: (arr) => Array.isArray(arr) ? arr.length : 0,",'  map: (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.map(fn) : [],','  filter: (arr, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.filter(fn) : [],','  reduce: (arr, init, fn) => Array.isArray(arr) && typeof fn === "function" ? arr.reduce(fn, init) : init,',"  push: (arr, elem) => Array.isArray(arr) ? [...arr, elem] : [elem],","  slice: (arr, start, end) => Array.isArray(arr) ? arr.slice(start, end) : [],","  concat: (a, b) => Array.isArray(a) && Array.isArray(b) ? a.concat(b) : [],",'  join: (arr, sep) => Array.isArray(arr) ? arr.join(sep) : ""',"};","const Array$len = $Array.len, Array$map = $Array.map, Array$filter = $Array.filter, Array$reduce = $Array.reduce;","const Array$push = $Array.push, Array$slice = $Array.slice, Array$concat = $Array.concat, Array$join = $Array.join;","","// Standard Library: String Module","const $String = {","  len: (s) => String(s).length,","  slice: (s, start, end) => String(s).slice(start, end),","  split: (s, delim) => String(s).split(delim),","  contains: (s, sub) => String(s).includes(sub),","  parseInt: (s) => Number.parseInt(String(s), 10),","  parseFloat: (s) => Number.parseFloat(String(s))","};","const String$len = $String.len, String$slice = $String.slice, String$split = $String.split, String$contains = $String.contains;","const String$parseInt = $String.parseInt, String$parseFloat = $String.parseFloat;","","// Standard Library: Option Module",'const $Some = (val) => Object.freeze({ $tag: "Some", val, $args: [val] });','const $None = Object.freeze({ $tag: "None", $args: [] });',"const $Option = {","  Some: $Some,","  None: $None,","  pure: $Some,","  of: $Some,","  some: $Some,","  none: $None,",'  isSome: (opt) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some"),','  isNone: (opt) => Boolean(!opt || typeof opt !== "object" || opt.$tag === "None"),','  getOrElse: (opt, defaultVal) => (opt && typeof opt === "object" && opt.$tag === "Some" ? opt.val : defaultVal),','  map: (opt, fn) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function" ? $Some(fn(opt.val)) : $None),','  flatMap: (opt, fn) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function" ? fn(opt.val) : $None),','  filter: (opt, pred) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof pred === "function" && pred(opt.val) ? opt : $None),','  flatten: (opt) => (opt && typeof opt === "object" && opt.$tag === "Some" ? opt.val : $None),','  zip: (a, b) => (a && typeof a === "object" && a.$tag === "Some" && b && typeof b === "object" && b.$tag === "Some" ? $Some([a.val, b.val]) : $None),',"  fromNullable: (v) => (v === null || v === undefined ? $None : $Some(v)),",'  fold: (opt, defaultVal, fn) => (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function" ? fn(opt.val) : defaultVal),','  orElse: (opt, alt) => (opt && typeof opt === "object" && opt.$tag === "Some" ? opt : alt),','  toResult: (opt, err) => (opt && typeof opt === "object" && opt.$tag === "Some" ? $Ok(opt.val) : $Err(err)),','  contains: (opt, elem) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some" && opt.val === elem),','  exists: (opt, pred) => Boolean(opt && typeof opt === "object" && opt.$tag === "Some" && typeof pred === "function" && pred(opt.val)),','  tap: (opt, fn) => { if (opt && typeof opt === "object" && opt.$tag === "Some" && typeof fn === "function") fn(opt.val); return opt; }',"};","const Option$Some = $Option.Some, Option$None = $Option.None, Option$pure = $Option.pure, Option$of = $Option.of;","const Option$map = $Option.map, Option$flatMap = $Option.flatMap, Option$filter = $Option.filter, Option$getOrElse = $Option.getOrElse;","","// Standard Library: Result Module",'const $Ok = (val) => Object.freeze({ $tag: "Ok", val, $args: [val] });','const $Err = (err) => Object.freeze({ $tag: "Err", err, $args: [err] });',"const $Result = {","  Ok: $Ok,","  Err: $Err,","  pure: $Ok,","  of: $Ok,","  ok: $Ok,","  err: $Err,",'  isOk: (res) => Boolean(res && typeof res === "object" && res.$tag === "Ok"),','  isErr: (res) => Boolean(!res || typeof res !== "object" || res.$tag === "Err"),','  getOrElse: (res, defaultVal) => (res && typeof res === "object" && res.$tag === "Ok" ? res.val : defaultVal),','  map: (res, fn) => (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function" ? $Ok(fn(res.val)) : res),','  mapError: (res, fn) => (res && typeof res === "object" && res.$tag === "Err" && typeof fn === "function" ? $Err(fn(res.err)) : res),','  flatMap: (res, fn) => (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function" ? fn(res.val) : res),','  flatten: (res) => (res && typeof res === "object" && res.$tag === "Ok" ? res.val : res),','  toOption: (res) => (res && typeof res === "object" && res.$tag === "Ok" ? $Some(res.val) : $None),','  fromOption: (opt, err) => (opt && typeof opt === "object" && opt.$tag === "Some" ? $Ok(opt.val) : $Err(err)),','  fold: (res, onErr, onOk) => (res && typeof res === "object" && res.$tag === "Ok" && typeof onOk === "function" ? onOk(res.val) : (typeof onErr === "function" ? onErr(res && res.$tag === "Err" ? res.err : res) : res)),','  orElse: (res, alt) => (res && typeof res === "object" && res.$tag === "Ok" ? res : alt),','  zip: (a, b) => (a && typeof a === "object" && a.$tag === "Ok" && b && typeof b === "object" && b.$tag === "Ok" ? $Ok([a.val, b.val]) : (a && a.$tag === "Err" ? a : b)),','  tap: (res, fn) => { if (res && typeof res === "object" && res.$tag === "Ok" && typeof fn === "function") fn(res.val); return res; },','  fromTry: (fn) => { try { return $Ok(typeof fn === "function" ? fn() : fn); } catch(e) { return $Err(e?.message || String(e)); } }',"};","const Result$Ok = $Result.Ok, Result$Err = $Result.Err, Result$pure = $Result.pure, Result$of = $Result.of;","const Result$map = $Result.map, Result$flatMap = $Result.flatMap, Result$mapError = $Result.mapError, Result$getOrElse = $Result.getOrElse;","","// Standard Library: Either Module",'const $Left = (left) => Object.freeze({ $tag: "Left", left, $args: [left] });','const $Right = (right) => Object.freeze({ $tag: "Right", right, $args: [right] });',"const $Either = {","  Left: $Left,","  Right: $Right,","  pure: $Right,","  of: $Right,","  left: $Left,","  right: $Right,",'  isLeft: (e) => Boolean(e && typeof e === "object" && e.$tag === "Left"),','  isRight: (e) => Boolean(e && typeof e === "object" && e.$tag === "Right"),','  getOrElse: (e, defaultVal) => (e && typeof e === "object" && e.$tag === "Right" ? e.right : defaultVal),','  map: (e, fn) => (e && typeof e === "object" && e.$tag === "Right" && typeof fn === "function" ? $Right(fn(e.right)) : e),','  mapLeft: (e, fn) => (e && typeof e === "object" && e.$tag === "Left" && typeof fn === "function" ? $Left(fn(e.left)) : e),','  flatMap: (e, fn) => (e && typeof e === "object" && e.$tag === "Right" && typeof fn === "function" ? fn(e.right) : e),','  fold: (e, onLeft, onRight) => (e && typeof e === "object" && e.$tag === "Right" && typeof onRight === "function" ? onRight(e.right) : (typeof onLeft === "function" ? onLeft(e && e.$tag === "Left" ? e.left : e) : e)),','  swap: (e) => (e && typeof e === "object" && e.$tag === "Right" ? $Left(e.right) : (e && e.$tag === "Left" ? $Right(e.left) : e)),','  toOption: (e) => (e && typeof e === "object" && e.$tag === "Right" ? $Some(e.right) : $None),','  toResult: (e) => (e && typeof e === "object" && e.$tag === "Right" ? $Ok(e.right) : $Err(e?.left)),','  fromResult: (res) => (res && typeof res === "object" && res.$tag === "Ok" ? $Right(res.val) : $Left(res?.err))',"};","const Either$Left = $Either.Left, Either$Right = $Either.Right, Either$pure = $Either.pure, Either$of = $Either.of;","const Either$map = $Either.map, Either$mapLeft = $Either.mapLeft, Either$flatMap = $Either.flatMap, Either$fold = $Either.fold;","","// Standard Library: Reader Module",'const $wrapReader = (fn) => ({ $tag: "Reader", run: typeof fn === "function" ? fn : (_r) => fn });',"const $Reader = {","  pure: (v) => $wrapReader((_r) => v),","  of: (v) => $wrapReader((_r) => v),","  ask: () => $wrapReader((r) => r),",'  asks: (fn) => $wrapReader((r) => typeof fn === "function" ? fn(r) : r),','  run: (reader, env) => (reader && typeof reader.run === "function" ? reader.run(env) : reader),','  map: (reader, fn) => $wrapReader((r) => { const v = reader && typeof reader.run === "function" ? reader.run(r) : reader; return typeof fn === "function" ? fn(v) : v; }),','  flatMap: (reader, fn) => $wrapReader((r) => { const v = reader && typeof reader.run === "function" ? reader.run(r) : reader; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run(r) : next; }),','  local: (reader, transformEnv) => $wrapReader((r) => { const tr = typeof transformEnv === "function" ? transformEnv(r) : r; return reader && typeof reader.run === "function" ? reader.run(tr) : reader; })',"};","const Reader$pure = $Reader.pure, Reader$of = $Reader.of, Reader$ask = $Reader.ask, Reader$asks = $Reader.asks, Reader$run = $Reader.run;","const Reader$map = $Reader.map, Reader$flatMap = $Reader.flatMap, Reader$local = $Reader.local;","","// Standard Library: Writer Module",'const $wrapWriter = (val, log = []) => ({ $tag: "Writer", val, log: Array.isArray(log) ? log : [log], run: () => [val, Array.isArray(log) ? log : [log]] });',"const $Writer = {","  pure: (v) => $wrapWriter(v, []),","  of: (v) => $wrapWriter(v, []),","  tell: (entry) => $wrapWriter(null, [entry]),",'  run: (w) => (w && typeof w.run === "function" ? w.run() : [w?.val, w?.log || []]),',"  value: (w) => (w ? w.val : null),","  log: (w) => (w && Array.isArray(w.log) ? w.log : []),",'  map: (w, fn) => $wrapWriter(typeof fn === "function" ? fn(w?.val) : w?.val, w?.log || []),','  flatMap: (w, fn) => { const next = typeof fn === "function" ? fn(w?.val) : null; return $wrapWriter(next?.val, [...(w?.log || []), ...(next?.log || [])]); },',"  listen: (w) => $wrapWriter([w?.val, w?.log || []], w?.log || [])","};","const Writer$pure = $Writer.pure, Writer$of = $Writer.of, Writer$tell = $Writer.tell, Writer$run = $Writer.run;","const Writer$value = $Writer.value, Writer$log = $Writer.log, Writer$map = $Writer.map, Writer$flatMap = $Writer.flatMap;","","// Standard Library: Task Module",'const $wrapTask = (fn) => ({ $tag: "Task", run: typeof fn === "function" ? fn : () => fn });',"const $Task = {","  pure: (v) => $wrapTask(() => v),","  of: (v) => $wrapTask(() => v),","  succeed: (v) => $wrapTask(() => v),",'  delay: (fn) => $wrapTask(typeof fn === "function" ? fn : () => fn),','  run: (t) => (t && typeof t.run === "function" ? t.run() : t),','  map: (t, fn) => $wrapTask(() => { const v = t && typeof t.run === "function" ? t.run() : t; return typeof fn === "function" ? fn(v) : v; }),','  flatMap: (t, fn) => $wrapTask(() => { const v = t && typeof t.run === "function" ? t.run() : t; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run() : next; })',"};","const Task$pure = $Task.pure, Task$of = $Task.of, Task$succeed = $Task.succeed, Task$run = $Task.run, Task$map = $Task.map, Task$flatMap = $Task.flatMap;","","// Standard Library: IO Module",'const $wrapIO = (comp) => ({ $tag: "IO", run: typeof comp === "function" ? comp : () => comp });',"const $IO = {","  pure: (v) => $wrapIO(() => v),","  of: (v) => $wrapIO(() => v),",'  delay: (fn) => $wrapIO(typeof fn === "function" ? fn : () => fn),','  map: (io, fn) => $wrapIO(() => { const v = io && typeof io.run === "function" ? io.run() : io; return typeof fn === "function" ? fn(v) : v; }),','  flatMap: (io, fn) => $wrapIO(() => { const v = io && typeof io.run === "function" ? io.run() : io; const next = typeof fn === "function" ? fn(v) : v; return next && typeof next.run === "function" ? next.run() : next; }),','  run: (io) => (io && typeof io.run === "function" ? io.run() : io),',"  println: (msg) => $wrapIO(() => console.log(String(msg)))","};","const IO$pure = $IO.pure, IO$of = $IO.of, IO$delay = $IO.delay, IO$map = $IO.map, IO$flatMap = $IO.flatMap, IO$run = $IO.run;","","// Standard Library: State Module",'const $wrapState = (fn) => ({ $tag: "State", run: typeof fn === "function" ? fn : (s) => [null, s] });',"const $State = {","  pure: (v) => $wrapState((s) => [v, s]),","  of: (v) => $wrapState((s) => [v, s]),","  get: () => $wrapState((s) => [s, s]),","  set: (ns) => $wrapState((_s) => [null, ns]),",'  modify: (fn) => $wrapState((s) => [null, typeof fn === "function" ? fn(s) : s]),','  run: (st, s) => (st && typeof st.run === "function" ? st.run(s) : [null, s]),','  evalState: (st, s) => { const r = st && typeof st.run === "function" ? st.run(s) : [null, s]; return Array.isArray(r) ? r[0] : r; },','  execState: (st, s) => { const r = st && typeof st.run === "function" ? st.run(s) : [null, s]; return Array.isArray(r) ? r[1] : r; },','  map: (st, fn) => $wrapState((s) => { const [v, ns] = st && typeof st.run === "function" ? st.run(s) : [null, s]; return [typeof fn === "function" ? fn(v) : v, ns]; }),','  flatMap: (st, fn) => $wrapState((s) => { const [v, ns] = st && typeof st.run === "function" ? st.run(s) : [null, s]; const next = typeof fn === "function" ? fn(v) : null; return next && typeof next.run === "function" ? next.run(ns) : [null, ns]; })',"};","const State$pure = $State.pure, State$get = $State.get, State$set = $State.set, State$modify = $State.modify, State$run = $State.run;","const State$evalState = $State.evalState, State$execState = $State.execState, State$map = $State.map, State$flatMap = $State.flatMap;","","// Standard Library: Setoid Module","const $deepEquals = (a, b) => {","  if (a === b) return true;",'  if (a && typeof a === "object" && b && typeof b === "object") {',"    if (a.$tag && b.$tag && a.$tag !== b.$tag) return false;","    const ka = Object.keys(a), kb = Object.keys(b);","    if (ka.length !== kb.length) return false;","    for (const k of ka) { if (!$deepEquals(a[k], b[k])) return false; }","    return true;","  }","  return false;","};","const $Setoid = {","  equals: (a, b) => $deepEquals(a, b),","  notEquals: (a, b) => !$deepEquals(a, b),","  fromEquals: (eqFn) => ({ equals: eqFn }),",'  contramap: (setoid, fn) => ({ equals: (x, y) => (setoid && typeof setoid.equals === "function" ? setoid.equals(fn(x), fn(y)) : $deepEquals(fn(x), fn(y))) })',"};","","// Standard Library: Ord Module",'const $OrderingLess = Object.freeze({ $tag: "Less", $args: [] });','const $OrderingEqual = Object.freeze({ $tag: "Equal", $args: [] });','const $OrderingGreater = Object.freeze({ $tag: "Greater", $args: [] });',"const $compareVals = (a, b) => {","  if (a === b) return $OrderingEqual;",'  if (typeof a === "number" && typeof b === "number") return a < b ? $OrderingLess : $OrderingGreater;','  if (typeof a === "string" && typeof b === "string") return a < b ? $OrderingLess : (a > b ? $OrderingGreater : $OrderingEqual);',"  return String(a) < String(b) ? $OrderingLess : (String(a) > String(b) ? $OrderingGreater : $OrderingEqual);","};","const $Ord = {","  Less: $OrderingLess,","  Equal: $OrderingEqual,","  Greater: $OrderingGreater,","  compare: $compareVals,","  min: (a, b) => ($compareVals(a, b) === $OrderingLess ? a : b),","  max: (a, b) => ($compareVals(a, b) === $OrderingGreater ? a : b),","  clamp: (val, minVal, maxVal) => ($compareVals(val, minVal) === $OrderingLess ? minVal : ($compareVals(val, maxVal) === $OrderingGreater ? maxVal : val)),","  between: (val, minVal, maxVal) => ($compareVals(val, minVal) !== $OrderingLess && $compareVals(val, maxVal) !== $OrderingGreater),","  isLess: (a, b) => $compareVals(a, b) === $OrderingLess,","  isGreater: (a, b) => $compareVals(a, b) === $OrderingGreater,","  isEqual: (a, b) => $compareVals(a, b) === $OrderingEqual,","  fromCompare: (cmpFn) => ({ compare: cmpFn }),",'  contramap: (ordB, fn) => ({ compare: (x, y) => (ordB && typeof ordB.compare === "function" ? ordB.compare(fn(x), fn(y)) : $compareVals(fn(x), fn(y))) }),','  reverse: (ord) => ({ compare: (x, y) => (ord && typeof ord.compare === "function" ? ord.compare(y, x) : $compareVals(y, x)) })',"};","","// Standard Library: Semigroup & SemiGroup Modules","const $combineSemigroup = (a, b) => {",'  if (typeof a === "number" && typeof b === "number") return a + b;','  if (typeof a === "string" && typeof b === "string") return a + b;',"  if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b];",'  if (a && typeof a === "object" && a.$tag === "Some" && b && typeof b === "object" && b.$tag === "Some") return $Some($combineSemigroup(a.val, b.val));','  if (a && typeof a === "object" && a.$tag === "Some") return a;','  if (b && typeof b === "object" && b.$tag === "Some") return b;','  if (a && typeof a === "object" && typeof a.combine === "function") return a.combine(b);',"  return b;","};","const $Semigroup = {","  combine: $combineSemigroup,","  concatAll: (list, fallback) => (!Array.isArray(list) || list.length === 0 ? fallback : list.reduce($combineSemigroup)),","  first: () => ({ combine: (a, _b) => a }),","  last: () => ({ combine: (_a, b) => b }),","  struct: (semigroups) => ({ combine: (a, b) => { const res = {}; for (const k in semigroups) res[k] = semigroups[k].combine(a[k], b[k]); return res; } }),",'  dual: (s) => ({ combine: (a, b) => (s && typeof s.combine === "function" ? s.combine(b, a) : $combineSemigroup(b, a)) })',"};","const $SemiGroup = $Semigroup;","","// Standard Library: Monoid Module",'const $monoidEmptyMap = { Sum: 0, Product: 1, String: "", Array: [], All: true, Any: false };',"const $Monoid = {","  empty: (typeOrName) => (typeOrName in $monoidEmptyMap ? $monoidEmptyMap[typeOrName] : null),","  combine: $combineSemigroup,","  concatAll: (list, identity) => (!Array.isArray(list) || list.length === 0 ? identity : list.reduce($combineSemigroup, identity)),","  Sum: { empty: () => 0, combine: (a, b) => a + b },","  Product: { empty: () => 1, combine: (a, b) => a * b },",'  String: { empty: () => "", combine: (a, b) => a + b },',"  Array: { empty: () => [], combine: (a, b) => [...a, ...b] },","  All: { empty: () => true, combine: (a, b) => a && b },","  Any: { empty: () => false, combine: (a, b) => a || b },","  struct: (monoids) => ({ empty: () => { const res = {}; for (const k in monoids) res[k] = monoids[k].empty(); return res; }, combine: (a, b) => { const res = {}; for (const k in monoids) res[k] = monoids[k].combine(a[k], b[k]); return res; } })","};","","// Standard Library: Group Module","const $Group = {",'  invert: (a) => (typeof a === "number" ? -a : (a && typeof a.invert === "function" ? a.invert() : a)),','  subtract: (a, b) => (typeof a === "number" && typeof b === "number" ? a - b : $combineSemigroup(a, $Group.invert(b))),',"  SumNumber: { empty: () => 0, combine: (a, b) => a + b, invert: (a) => -a },","  ProductNonZero: { empty: () => 1, combine: (a, b) => a * b, invert: (a) => 1 / a }","};","","// Standard Library: Functor Module","const $mapFunctor = (fa, fn) => {",'  if (fa && typeof fa === "object") {','    if (fa.$tag === "Some") return $Some(fn(fa.val));','    if (fa.$tag === "None") return $None;','    if (fa.$tag === "Ok") return $Ok(fn(fa.val));','    if (fa.$tag === "Err") return fa;','    if (fa.$tag === "Right") return $Right(fn(fa.right));','    if (fa.$tag === "Left") return fa;','    if (fa.$tag === "Valid") return $Valid(fn(fa.val));','    if (fa.$tag === "Invalid") return fa;','    if (typeof fa.map === "function") return fa.map(fn);',"  }","  if (Array.isArray(fa)) return fa.map(fn);","  return fa;","};","const $Functor = {","  map: $mapFunctor,","  lift: (fn) => (fa) => $mapFunctor(fa, fn),","  as: (fa, val) => $mapFunctor(fa, () => val),","  voidRight: (fa) => $mapFunctor(fa, () => null),",'  flap: (fab, a) => $mapFunctor(fab, (f) => (typeof f === "function" ? f(a) : f))',"};","","// Standard Library: Contravariant Functor Module","const $Contravariant = {",'  contramap: (fa, fn) => (typeof fa === "function" ? (x) => fa(fn(x)) : (x) => fa(fn(x))),','  cmap: (fa, fn) => (typeof fa === "function" ? (x) => fa(fn(x)) : (x) => fa(fn(x))),',"  predicate: (pred) => ({ run: pred, cmap: (fn) => (x) => pred(fn(x)) })","};","","// Standard Library: Applicative Functor Module","const $apApplicative = (ff, fa) => {",'  if (ff && typeof ff === "object" && fa && typeof fa === "object") {','    if (ff.$tag === "Some" && fa.$tag === "Some") return $Some(ff.val(fa.val));','    if (ff.$tag === "None" || fa.$tag === "None") return $None;','    if (ff.$tag === "Ok" && fa.$tag === "Ok") return $Ok(ff.val(fa.val));','    if (ff.$tag === "Err") return ff;','    if (fa.$tag === "Err") return fa;','    if (ff.$tag === "Right" && fa.$tag === "Right") return $Right(ff.right(fa.right));','    if (ff.$tag === "Left") return ff;','    if (fa.$tag === "Left") return fa;','    if (ff.$tag === "Valid" && fa.$tag === "Valid") return $Valid(ff.val(fa.val));','    if (ff.$tag === "Invalid" && fa.$tag === "Invalid") return $Invalid([...ff.errs, ...fa.errs]);','    if (ff.$tag === "Invalid") return ff;','    if (fa.$tag === "Invalid") return fa;',"  }","  if (Array.isArray(ff) && Array.isArray(fa)) {","    const res = [];",'    for (const f of ff) { for (const a of fa) { if (typeof f === "function") res.push(f(a)); } }',"    return res;","  }","  return fa;","};","const $Applicative = {","  pure: $Some,","  ap: $apApplicative,","  lift2: (fn, fa, fb) => $apApplicative($mapFunctor(fa, (a) => (b) => fn(a, b)), fb),","  lift3: (fn, fa, fb, fc) => $apApplicative($apApplicative($mapFunctor(fa, (a) => (b) => (c) => fn(a, b, c)), fb), fc),","  zip: (fa, fb) => $apApplicative($mapFunctor(fa, (a) => (b) => [a, b]), fb)","};","","// Standard Library: Validation Module",'const $Valid = (val) => Object.freeze({ $tag: "Valid", val, $args: [val] });','const $Invalid = (errs) => Object.freeze({ $tag: "Invalid", errs: Array.isArray(errs) ? errs : [errs], $args: [Array.isArray(errs) ? errs : [errs]] });',"const $Validation = {","  Valid: $Valid,","  Invalid: $Invalid,","  pure: $Valid,","  invalid: (err) => $Invalid([err]),",'  isValid: (v) => Boolean(v && typeof v === "object" && v.$tag === "Valid"),','  isInvalid: (v) => Boolean(v && typeof v === "object" && v.$tag === "Invalid"),','  map: (v, fn) => (v && typeof v === "object" && v.$tag === "Valid" && typeof fn === "function" ? $Valid(fn(v.val)) : v),',"  ap: $apApplicative,","  accumulate: (v1, v2, fn) => {",'    if (v1 && v1.$tag === "Valid" && v2 && v2.$tag === "Valid" && typeof fn === "function") return $Valid(fn(v1.val, v2.val));','    const errs1 = v1 && v1.$tag === "Invalid" ? v1.errs : [];','    const errs2 = v2 && v2.$tag === "Invalid" ? v2.errs : [];',"    return $Invalid([...errs1, ...errs2]);","  },",'  getOrElse: (v, defaultVal) => (v && v.$tag === "Valid" ? v.val : defaultVal),','  toResult: (v) => (v && v.$tag === "Valid" ? $Ok(v.val) : $Err(v?.errs))',"};","","// Standard Library: Bifunctor Module","const $Bifunctor = {","  bimap: (fab, f, g) => {",'    if (fab && typeof fab === "object") {','      if (fab.$tag === "Ok") return $Ok(g(fab.val));','      if (fab.$tag === "Err") return $Err(f(fab.err));','      if (fab.$tag === "Right") return $Right(g(fab.right));','      if (fab.$tag === "Left") return $Left(f(fab.left));','      if (typeof fab.bimap === "function") return fab.bimap(f, g);',"    }","    return fab;","  }","};","","// Standard Library: Profunctor Module",'const $dimapFn = (pab, f, g) => (typeof pab === "function" ? (x) => g(pab(f(x))) : (pab && typeof pab.dimap === "function" ? pab.dimap(f, g) : (x) => g(pab(f(x)))));',"const $Profunctor = { dimap: $dimapFn, promap: $dimapFn };","","// Standard Library: Foldable Module","const $Foldable = {","  foldLeft: (fa, initial, fn) => {","    if (Array.isArray(fa)) return fa.reduce(fn, initial);",'    if (fa && typeof fa === "object") {','      if (fa.$tag === "Some" || fa.$tag === "Ok") return fn(initial, fa.val);','      if (fa.$tag === "None" || fa.$tag === "Err") return initial;','      if (typeof fa.reduce === "function") return fa.reduce(fn, initial);',"    }","    return initial;","  },","  foldMap: (fa, monoid, fn) => {",'    const combine = typeof monoid === "object" && typeof monoid.combine === "function" ? monoid.combine : $combineSemigroup;','    const empty = typeof monoid === "object" && typeof monoid.empty === "function" ? monoid.empty() : (typeof monoid === "string" ? $monoidEmptyMap[monoid] : null);',"    if (Array.isArray(fa)) return fa.reduce((acc, x) => combine(acc, fn(x)), empty);",'    if (fa && typeof fa === "object" && (fa.$tag === "Some" || fa.$tag === "Ok")) return combine(empty, fn(fa.val));',"    return empty;","  }","};","","// Standard Library: DOM Module (Browser Target)","const $dom_render_vnode = (vnode) => {",'  if (vnode === null || vnode === undefined) return document.createTextNode("");','  if (typeof vnode === "string" || typeof vnode === "number" || typeof vnode === "boolean") return document.createTextNode(String(vnode));',"  if (Array.isArray(vnode)) {","    const frag = document.createDocumentFragment();","    for (const child of vnode) frag.appendChild($dom_render_vnode(child));","    return frag;","  }",'  if (typeof Node !== "undefined" && vnode instanceof Node) return vnode;','  if (!vnode.$vnode) return document.createTextNode(typeof vnode === "object" ? JSON.stringify(vnode) : String(vnode));','  const isSvg = ["svg", "path", "circle", "rect", "line", "polyline", "polygon", "text", "g"].includes(vnode.tag);',"  const el = isSvg",'    ? document.createElementNS("http://www.w3.org/2000/svg", vnode.tag)',"    : document.createElement(vnode.tag);","  if (vnode.children) {","    const childrenArr = Array.isArray(vnode.children) ? vnode.children : [vnode.children];","    for (const child of childrenArr) {","      if (child !== null && child !== undefined) {","        el.appendChild($dom_render_vnode(child));","      }","    }","  }","  if (vnode.props) {",'    const props = (typeof vnode.props === "object" && vnode.props !== null) ? vnode.props : {};',"    for (const [k, val] of Object.entries(props)) {",'      if (k.startsWith("on") && typeof val === "function") {',"        el.addEventListener(k.slice(2).toLowerCase(), val);",'      } else if (k === "className" || k === "class") {','        if (isSvg) el.setAttribute("class", val);',"        else el.className = val;",'      } else if (k === "style") {','        if (typeof val === "object" && val !== null && el.style) {',"          Object.assign(el.style, val);",'        } else if (typeof val === "string" && el.style) {',"          el.style.cssText = val;","        }",'      } else if (k === "value" && el && ("value" in el)) {',"        el.value = String(val);",'      } else if (k === "selected" && el && ("selected" in el)) {',"        el.selected = Boolean(val);",'      } else if (k === "checked" && el && ("checked" in el)) {',"        el.checked = Boolean(val);",'      } else if (el && typeof el.setAttribute === "function") {',"        el.setAttribute(k, String(val));","      }","    }","  }","  return el;","};","const $get_actx = () => {",'  if (typeof window === "undefined") return null;',"  const AC = window.AudioContext || window.webkitAudioContext;","  if (!AC) return null;","  if (!window._tl_actx) window._tl_actx = new AC();",'  if (window._tl_actx.state === "suspended") {',"    try { window._tl_actx.resume(); } catch (_) {}","  }","  return window._tl_actx;","};","const $DOM = {","  getElementById: (id) => {",'    if (typeof $mountTarget !== "undefined" && $mountTarget) {',"      if ($mountTarget.id === id) return $mountTarget;",'      const inner = $mountTarget.querySelector("#" + id);',"      if (inner) return inner;","    }",'    return typeof document !== "undefined" ? document.getElementById(id) : null;',"  },",'  createElement: (tag) => typeof document !== "undefined" ? document.createElement(tag) : { tag, attrs: {}, children: [] },','  setText: (el, text) => { if (el && "textContent" in el) el.textContent = String(text); return null; },','  getValue: (el) => (el && "value" in el ? String(el.value) : ""),','  setValue: (el, val) => { if (el && "value" in el) el.value = String(val); return null; },','  focus: (el) => { if (el && typeof el.focus === "function") el.focus(); return null; },','  blur: (el) => { if (el && typeof el.blur === "function") el.blur(); return null; },','  setHtml: (el, html) => { if (el && "innerHTML" in el) el.innerHTML = String(html); return null; },','  setAttr: (el, k, v) => { if (el && "setAttribute" in el) el.setAttribute(k, String(v)); return null; },','  appendChild: (parent, child) => { if (parent && "appendChild" in parent && child) parent.appendChild(child); return null; },','  addEventListener: (el, evt, handler) => { if (el && "addEventListener" in el) el.addEventListener(evt, handler); return null; },',"  h: (tag, props = {}, children = []) => ({ $vnode: true, tag, props: props || {}, children: Array.isArray(children) ? children : [children] }),","  mount: (containerId, vnode) => {","    let root = null;",'    if (typeof $mountTarget !== "undefined" && $mountTarget) {','      if (typeof containerId === "string") {',"        if ($mountTarget.id === containerId) root = $mountTarget;",'        else root = $mountTarget.querySelector("#" + containerId) || $mountTarget;',"      } else {","        root = containerId;","      }","    }",'    if (!root && typeof document !== "undefined") {','      root = typeof containerId === "string" ? document.getElementById(containerId) : containerId;',"    }","    if (root) {",'      root.innerHTML = "";',"      root.appendChild($dom_render_vnode(vnode));","    }","    return null;","  },",'  eval: (code) => { try { return (typeof window !== "undefined" && window.eval ? window.eval(code) : (0, eval)(code)); } catch (e) { return null; } },','  _eval: (code) => { try { return (typeof window !== "undefined" && window.eval ? window.eval(code) : (0, eval)(code)); } catch (e) { return null; } },',"  log: (v) => { console.log(v); return null; },",'  initAudio: () => { try { const c = $get_actx(); if (c && c.state === "suspended") c.resume(); return c; } catch (_) { return null; } },',"  playCustomTone: (freq, waveType, duration, volume, attack) => {","    try {","      const c = $get_actx();","      if (!c) return null;","      const o = c.createOscillator();","      const g = c.createGain();",'      o.type = waveType || "square";',"      o.frequency.setValueAtTime(Math.max(1, freq || 440), c.currentTime);","      const d = duration || 0.1;","      const v = volume !== undefined ? volume : 0.1;","      const atk = attack || 0.015;","      g.gain.setValueAtTime(0.0001, c.currentTime);","      g.gain.linearRampToValueAtTime(v, c.currentTime + atk);","      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d);","      o.connect(g);","      g.connect(c.destination);","      o.start();","      o.stop(c.currentTime + d);","    } catch (_) {}","    return null;","  },","  playNoise: (duration, volume) => {","    try {","      const c = $get_actx();","      if (!c) return null;","      const dur = duration || 0.12;","      const vol = volume !== undefined ? volume : 0.2;","      const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);","      const data = buf.getChannelData(0);","      for (let i = 0; i < data.length; i++) {","        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.03));","      }","      const src = c.createBufferSource();","      src.buffer = buf;","      const gain = c.createGain();","      gain.gain.setValueAtTime(vol, c.currentTime);","      gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);","      src.connect(gain);","      gain.connect(c.destination);","      src.start();","    } catch (_) {}","    return null;","  },","  playTone: (freq, duration, waveType, volume) => {","    try {","      const c = $get_actx();","      if (!c) return null;","      const o = c.createOscillator();","      const g = c.createGain();",'      o.type = waveType || "sine";',"      o.frequency.setValueAtTime(Math.max(1, freq || 440), c.currentTime);","      const d = duration || 0.08;","      const v = volume !== undefined ? volume : 0.1;","      g.gain.setValueAtTime(v, c.currentTime);","      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d);","      o.connect(g);","      g.connect(c.destination);","      o.start();","      o.stop(c.currentTime + d);","    } catch (_) {}","    return null;","  },","  playRamp: (startFreq, endFreq, duration, waveType, volume) => {","    try {","      const c = $get_actx();","      if (!c) return null;","      const o = c.createOscillator();","      const g = c.createGain();",'      o.type = waveType || "sine";',"      o.frequency.setValueAtTime(Math.max(1, startFreq || 440), c.currentTime);","      const d = duration || 0.08;","      const v = volume !== undefined ? volume : 0.1;","      o.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq || 220), c.currentTime + d);","      g.gain.setValueAtTime(v, c.currentTime);","      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + d);","      o.connect(g);","      g.connect(c.destination);","      o.start();","      o.stop(c.currentTime + d);","    } catch (_) {}","    return null;","  },","  playSequence: (notes, noteDuration, waveType, volume) => {","    try {","      const c = $get_actx();","      if (!c || !notes || !notes.length) return null;","      const d = noteDuration || 0.08;","      const v = volume !== undefined ? volume : 0.12;","      notes.forEach((f, i) => {","        if (f <= 0) return;","        const o = c.createOscillator();","        const g = c.createGain();",'        o.type = waveType || "sine";',"        o.frequency.setValueAtTime(f, c.currentTime + i * d);","        g.gain.setValueAtTime(v, c.currentTime + i * d);","        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + i * d + d * 1.5);","        o.connect(g);","        g.connect(c.destination);","        o.start(c.currentTime + i * d);","        o.stop(c.currentTime + i * d + d * 1.5);","      });","    } catch (_) {}","    return null;","  },","  startMusic: (id, notes, intervalMs, waveType, volume) => {","    try {",'      if (typeof window === "undefined") return null;',"      if (!window._tl_music_loops) window._tl_music_loops = {};","      if (window._tl_music_loops[id]) clearInterval(window._tl_music_loops[id]);","      let step = 0;","      const c = $get_actx();","      const iv = intervalMs || 150;","      const v = volume !== undefined ? volume : 0.04;",'      const w = waveType || "square";',"      window._tl_music_loops[id] = setInterval(() => {","        if (!c || !notes || !notes.length) return;","        const f = notes[step % notes.length];","        step++;","        if (f > 0) {","          const o = c.createOscillator();","          const g = c.createGain();","          o.type = w;","          o.frequency.setValueAtTime(f, c.currentTime);","          g.gain.setValueAtTime(v, c.currentTime);","          g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (iv / 1000) * 0.9);","          o.connect(g);","          g.connect(c.destination);","          o.start();","          o.stop(c.currentTime + (iv / 1000) * 0.9);","        }","      }, iv);","    } catch (_) {}","    return null;","  },","  stopMusic: (id) => {","    try {",'      if (typeof window !== "undefined" && window._tl_music_loops && window._tl_music_loops[id]) {',"        clearInterval(window._tl_music_loops[id]);","        delete window._tl_music_loops[id];","      }","    } catch (_) {}","    return null;","  },","  resumeAudio: () => {","    try {","      const c = $get_actx();",'      if (c && c.state === "suspended") c.resume();',"    } catch (_) {}","    return null;","  },","  confetti: (count, spread, originY) => {","    try {",'      if (typeof window !== "undefined" && window.confetti) {',"        window.confetti({","          particleCount: count || 80,","          spread: spread || 70,","          origin: { y: originY !== undefined ? originY : 0.6 }","        });","      }","    } catch (_) {}","    return null;","  },",'  setInterval: (fn, ms) => (typeof setInterval !== "undefined" ? setInterval(fn, ms) : 0),','  clearInterval: (id) => { if (typeof clearInterval !== "undefined") clearInterval(id); return null; },','  setTimeout: (fn, ms) => (typeof setTimeout !== "undefined" ? setTimeout(fn, ms) : 0),','  clearTimeout: (id) => { if (typeof clearTimeout !== "undefined") clearTimeout(id); return null; },','  requestAnimationFrame: (fn) => { if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(fn); return null; },','  storageGet: (k) => { try { return (typeof localStorage !== "undefined" && localStorage.getItem(k)) || ""; } catch (_) { return ""; } },','  storageSet: (k, v) => { try { if (typeof localStorage !== "undefined") localStorage.setItem(k, v); } catch (_) {} return null; },','  storageRemove: (k) => { try { if (typeof localStorage !== "undefined") localStorage.removeItem(k); } catch (_) {} return null; }',"};","const DOM = $DOM;","const DOM$getElementById = $DOM.getElementById, DOM$createElement = $DOM.createElement, DOM$setText = $DOM.setText;","const DOM$setHtml = $DOM.setHtml, DOM$setAttr = $DOM.setAttr, DOM$appendChild = $DOM.appendChild, DOM$addEventListener = $DOM.addEventListener;","const DOM$h = $DOM.h, DOM$mount = $DOM.mount, DOM$eval = $DOM.eval, DOM$_eval = $DOM._eval, DOM$log = $DOM.log;","const DOM$playTone = $DOM.playTone, DOM$playRamp = $DOM.playRamp, DOM$playSequence = $DOM.playSequence;","const DOM$startMusic = $DOM.startMusic, DOM$stopMusic = $DOM.stopMusic, DOM$resumeAudio = $DOM.resumeAudio, DOM$confetti = $DOM.confetti;","const DOM$setInterval = $DOM.setInterval, DOM$clearInterval = $DOM.clearInterval, DOM$setTimeout = $DOM.setTimeout, DOM$clearTimeout = $DOM.clearTimeout, DOM$requestAnimationFrame = $DOM.requestAnimationFrame;","const DOM$storageGet = $DOM.storageGet, DOM$storageSet = $DOM.storageSet, DOM$storageRemove = $DOM.storageRemove;","","// Standard Library: Node.js / Universal Data Processing Module",'const $node_req = (m) => { try { return typeof require !== "undefined" ? require(m) : null; } catch (_) { return null; } };','const fs = $node_req("fs");','const path = $node_req("path");','const http = $node_req("http");',"","const $Node = {",'  envGet: (k) => (typeof process !== "undefined" && process.env ? process.env[k] || "" : ""),','  readFile: (p) => fs ? fs.readFileSync(p, "utf-8") : `// Mock file content for ${p}`,','  writeFile: (p, content) => { if (fs) fs.writeFileSync(p, content, "utf-8"); return null; },',"  stringify: (data) => JSON.stringify(data),","  parse: (str) => JSON.parse(str),","  now: () => Date.now(),","  createApp: () => {",'    const express = $node_req("express");',"    if (express) {","      try { return express(); } catch (_) {}","    }","    const routes = [];","    const middlewares = [];","    const app = {","      use: (fn) => { middlewares.push(fn); return app; },",'      get: (p, fn) => { routes.push({ method: "GET", path: p, fn }); return app; },','      post: (p, fn) => { routes.push({ method: "POST", path: p, fn }); return app; },',"      listen: (port, cb) => {","        if (http) {","          const server = http.createServer((req, res) => {",'            res.json = (data) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(data)); };',"            res.status = (code) => { res.statusCode = code; return res; };","            res.send = (body) => { res.end(String(body)); };","            const matched = routes.find(r => r.method === req.method && r.path === req.url);","            if (matched) return matched.fn(req, res);",'            res.statusCode = 404; res.end("Not Found");',"          });","          server.listen(port, () => { if (cb) cb(); });","          return server;","        }","        console.log(`[Mock Server] Listening on port ${port}`);","        if (cb) cb();","        return { close: () => {} };","      }","    };","    return app;","  },","  get: (app, p, handler) => { if (app && app.get) app.get(p, handler); return null; },","  post: (app, p, handler) => { if (app && app.post) app.post(p, handler); return null; },","  use: (app, middleware) => { if (app && app.use) app.use(middleware); return null; },","  listen: (app, port, cb) => { console.log(`[Express Engine] Server listening on port ${port}`); if (cb) cb(); return { close: () => {} }; },","  send: (res, body) => { if (res && res.send) res.send(body); else if (res && res.end) res.end(body); return null; },","  json: (res, data) => { if (res && res.json) res.json(data); else if (res && res.end) res.end(JSON.stringify(data)); return null; },","  status: (res, code) => { if (res && res.status) return res.status(code); if (res) res.statusCode = code; return res; }","};","const Node$envGet = $Node.envGet, Node$readFile = $Node.readFile, Node$writeFile = $Node.writeFile;","const Node$stringify = $Node.stringify, Node$parse = $Node.parse, Node$now = $Node.now, Node$createApp = $Node.createApp;","const Node$get = $Node.get, Node$post = $Node.post, Node$use = $Node.use, Node$listen = $Node.listen;","const Node$send = $Node.send, Node$json = $Node.json, Node$status = $Node.status;"].join(`
`)}generateStatement(e){switch(e.kind){case"s_let":{const t=e.isMut?"let":"const",n=sanitizeIdent(e.name);this.addLocalVar(e.name);const r=this.generateExpr(e.init);return`${this.indent()}${t} ${n} = ${r};`}case"s_function":{const t=sanitizeIdent(e.name);this.addLocalVar(e.name);const n=e.params.map(i=>sanitizeIdent(i.name));this.pushScope(e.params.map(i=>i.name));let r="";e.whereBindings&&e.whereBindings.length>0&&(r=e.whereBindings.map(i=>this.generateStatement(i)).join(`
`)+`
`);const s=this.generateFunctionBody(e.body);return this.popScope(),`${this.indent()}function ${t}(${n.join(", ")}) {
${r}${this.indent()}  try {
${s}
${this.indent()}  } catch(e) { if (e instanceof __ReturnSignal) return e.value; else throw e; }
${this.indent()}}`}case"s_gadt":return e.decl.constructors.map(n=>{this.addLocalVar(n.name);const r=sanitizeIdent(n.name);if(n.params.length===0)return`${this.indent()}const ${r} = Object.freeze({ $tag: "${n.name}", $args: [] });`;const s=n.params.map(l=>sanitizeIdent(l.name)).join(", "),i=n.params.map(l=>`${sanitizeIdent(l.name)}: ${sanitizeIdent(l.name)}`).join(", "),o=n.params.map(l=>sanitizeIdent(l.name)).join(", ");return`${this.indent()}const ${r} = (${s}) => ({ $tag: "${n.name}", ${i}, $args: [${o}] });`}).join(`
`);case"s_module":{const t=sanitizeIdent(e.name);this.addLocalVar(e.name),this.indentLevel++,this.pushScope();const n=e.body.map(i=>this.generateStatement(i)).join(`
`);this.popScope();const r=[],s=i=>{const o=sanitizeIdent(i);i!==o&&r.push(`${i}: ${o}`),r.push(o)};for(const i of e.body)i.kind==="s_let"&&i.name||i.kind==="s_function"&&i.name||i.kind==="s_module"&&i.name?s(i.name):i.kind==="s_gadt"&&i.decl.constructors.forEach(o=>s(o.name));return this.indentLevel--,[`${this.indent()}const ${t} = (() => {`,n,`${this.indent()}  return { ${r.join(", ")} };`,`${this.indent()}})();`].join(`
`)}case"s_import":{const t=["Math","Array","String","DOM","Node","Option","Result","Either","Reader","Writer","Task","IO","State","Setoid","Ord","Semigroup","SemiGroup","Monoid","Group","Functor","Contravariant","Applicative","Validation","Bifunctor","Profunctor","Foldable"],n=e.modulePath[0],r=t.includes(n)&&e.modulePath.length===1?`$${n}`:e.modulePath.map(sanitizeIdent).join(".");if(e.specifiers&&e.specifiers.length>0){const s=e.specifiers.map(i=>{const o=i.name,l=i.alias?sanitizeIdent(i.alias):sanitizeIdent(i.name);return this.addLocalVar(i.alias||i.name),l!==o?`${o}: ${l}`:o}).join(", ");return`${this.indent()}const { ${s} } = ${r};`}if(e.alias){const s=sanitizeIdent(e.alias);return this.addLocalVar(e.alias),`${this.indent()}const ${s} = ${r};`}return`${this.indent()}const ${sanitizeIdent(e.modulePath[e.modulePath.length-1])} = ${r};`}case"s_extern_function":{const t=sanitizeIdent(e.name);this.addLocalVar(e.name);const n=e.jsSymbol||e.name,r=e.moduleName?sanitizeIdent(e.moduleName):null;return r?`${this.indent()}const ${t} = (...args) => (typeof ${r} !== "undefined" && typeof ${r}["${n}"] === "function") ? ${r}["${n}"](...args) : (typeof globalThis !== "undefined" && globalThis["${r}"] && typeof globalThis["${r}"]["${n}"] === "function") ? globalThis["${r}"]["${n}"](...args) : null;`:`${this.indent()}const ${t} = (...args) => { const g = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : global); const fn = g["${n}"]; return typeof fn === "function" ? fn(...args) : null; };`}case"s_extern_type":return`${this.indent()}// extern type ${e.name}`;case"s_extern_value":{const t=sanitizeIdent(e.name);this.addLocalVar(e.name);const n=e.jsSymbol||e.name,r=new Set(["window","document","globalThis","console","location","navigator","history","self","top","parent"]);return e.name==="window"||n==="window"?`${this.indent()}if (typeof globalThis !== "undefined" && typeof globalThis.window === "undefined") { globalThis.window = globalThis; }`:r.has(e.name)||r.has(n)?`${this.indent()}// extern value ${e.name} is provided by the global environment`:`${this.indent()}const ${t} = (typeof globalThis !== "undefined" && "${n}" in globalThis ? globalThis["${n}"] : (typeof globalThis !== "undefined" ? globalThis["${n}"] : undefined));`}case"s_extern_module":{const t=e.name.replace(/^npm:/,""),n=sanitizeIdent(t.replace(/[^a-zA-Z0-9_]/g,"_"));this.addLocalVar(n);const r=e.functions.map(i=>{const o=sanitizeIdent(i.name),l=i.jsSymbol||i.name;return`${o}: (...args) => {
            const g = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : global);
            const m = g["${t}"] || g["${n}"] || g;
            const target = typeof m["${l}"] === "function" ? m["${l}"] : (typeof g["${l}"] === "function" ? g["${l}"] : null);
            if (target) return target(...args);
            if ("${l}" === "sum" && Array.isArray(args[0])) return args[0].reduce((a, b) => Number(a) + Number(b), 0);
            if ("${l}" === "chunk" && Array.isArray(args[0])) {
              const arr = args[0], size = Number(args[1]) || 1, res = [];
              for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
              return res;
            }
            console.warn("FFI call ${e.name}.${i.name} missing implementation");
            return null;
          }`}),s=e.values.map(i=>{const o=sanitizeIdent(i.name),l=i.jsSymbol||i.name;return`${o}: (typeof globalThis !== "undefined" ? (globalThis["${t}"] ? globalThis["${t}"]["${l}"] : globalThis["${l}"]) : undefined)`});return[`${this.indent()}const ${n} = (() => {`,`${this.indent()}  const g = typeof globalThis !== "undefined" ? globalThis : (typeof window !== "undefined" ? window : global);`,`${this.indent()}  const rawMod = g["${t}"] || g["${n}"] || {};`,`${this.indent()}  return {`,...r.map(i=>`${this.indent()}    ${i},`),...s.map(i=>`${this.indent()}    ${i},`),`${this.indent()}    ...rawMod`,`${this.indent()}  };`,`${this.indent()}})();`].join(`
`)}case"s_type_alias":return`${this.indent()}// type alias ${e.decl.name}`;case"s_expr":{if(e.expr.kind==="e_for")return this.generateForStatement(e.expr);if(e.expr.kind==="e_while")return this.generateWhileStatement(e.expr);const t=this.generateExpr(e.expr);return`${this.indent()}${t};`}default:return""}}generateFunctionBody(e){if(this.indentLevel++,e.kind==="e_block"){this.pushScope();const n=[];for(const r of e.statements)n.push(this.generateStatement(r));return e.result&&n.push(`${this.indent()}return ${this.generateExpr(e.result)};`),this.popScope(),this.indentLevel--,n.join(`
`)}const t=`${this.indent()}return ${this.generateExpr(e)};`;return this.indentLevel--,t}generateExpr(e){switch(e.kind){case"e_literal":return e.value===null?"null":typeof e.value=="string"?JSON.stringify(e.value):String(e.value);case"e_var":{const t=this.isLocalVar(e.name),n=["print","println","to_string","concat","parse_int","parse_float","time_now"],r=["Math","Array","String","DOM","Node","Option","Result","Either","Reader","Writer","Task","IO","State","Setoid","Ord","Semigroup","SemiGroup","Monoid","Group","Functor","Contravariant","Applicative","Validation","Bifunctor","Profunctor","Foldable"];if(!t&&n.includes(e.name)&&(!e.modulePath||e.modulePath.length===0))return`$${e.name}`;if(!t&&r.includes(e.name)&&(!e.modulePath||e.modulePath.length===0))return`$${e.name}`;if(e.modulePath&&e.modulePath.length>0){const s=e.modulePath[0];return`${r.includes(s)&&e.modulePath.length===1?`$${s}`:e.modulePath.map(sanitizeIdent).join(".")}.${sanitizeIdent(e.name)}`}return sanitizeIdent(e.name)}case"e_unary":{const t=this.generateExpr(e.expr);return`${e.op}(${t})`}case"e_binary":{const t=this.generateExpr(e.left),n=this.generateExpr(e.right);let r=e.op;return r==="=="&&(r="==="),r==="!="&&(r="!=="),`(${t} ${r} ${n})`}case"e_assign":{const t=this.generateExpr(e.value),n=e.op||"=";if(e.target.kind==="e_var")return`(${sanitizeIdent(e.target.name)} ${n} ${t})`;if(e.target.kind==="e_field_access")return`(${this.generateExpr(e.target.object)}.${sanitizeIdent(e.target.field)} ${n} ${t})`;if(e.target.kind==="e_index"){const r=this.generateExpr(e.target.target),s=this.generateExpr(e.target.index);return`(${r}[${s}] ${n} ${t})`}return`(${t})`}case"e_call":{const t=this.generateExpr(e.callee),n=e.args.map(r=>this.generateExpr(r)).join(", ");return`${t}(${n})`}case"e_method_call":{const t=this.generateExpr(e.object),n=e.args.map(i=>this.generateExpr(i));if(["push","pop","shift","unshift","splice","slice","indexOf","lastIndexOf","includes","join","concat","map","filter","reduce","forEach","find","findIndex","trim","toLowerCase","toUpperCase","replace","replaceAll","split","charAt","substring","startsWith","endsWith","toString","valueOf","addEventListener","removeEventListener","getAttribute","setAttribute","getElementById","querySelector","querySelectorAll","appendChild","removeChild","getContext","getBoundingClientRect","fill","stroke","beginPath","closePath","moveTo","lineTo","arc","rect","fillRect","strokeRect","clearRect","fillText","strokeText","setLineDash","getLineDash","measureText","clip","createLinearGradient","createRadialGradient","createPattern","drawImage","addColorStop","quadraticCurveTo","bezierCurveTo","ellipse","arcTo","save","restore","translate","rotate","scale","preventDefault","stopPropagation"].includes(e.method)||e.isModuleMethod)return`${t}.${sanitizeIdent(e.method)}(${n.join(", ")})`;const s=[t,...n].join(", ");return`${t}.${sanitizeIdent(e.method)}(${s})`}case"e_field_access":return`${this.generateExpr(e.object)}.${sanitizeIdent(e.field)}`;case"e_index":{const t=this.generateExpr(e.target),n=this.generateExpr(e.index);return`${t}[${n}]`}case"e_record":{const t=e.fields.map(s=>`${sanitizeIdent(s.name)}: ${this.generateExpr(s.value)}`),n=(e.methods||[]).map(s=>{const o=[sanitizeIdent(s.selfParam),...s.params.map(c=>sanitizeIdent(c.name))].join(", ");this.pushScope([s.selfParam,...s.params.map(c=>c.name)]);const l=this.generateFunctionBody(s.body);return this.popScope(),`${sanitizeIdent(s.name)}: function(${o}) {
${l}
${this.indent()}}`}),r=[...t,...n];return r.length===0?"({})":`({ ${r.join(", ")} })`}case"e_record_update":{const t=this.generateExpr(e.base),n=e.updates.map(r=>`${sanitizeIdent(r.name)}: ${this.generateExpr(r.value)}`).join(", ");return n?`({ ...${t}, ${n} })`:`({ ...${t} })`}case"e_tuple":return`[${e.elements.map(n=>this.generateExpr(n)).join(", ")}]`;case"e_lambda":{const t=e.params.map(r=>sanitizeIdent(r.name));this.pushScope(e.params.map(r=>r.name));let n;if(e.body.kind==="e_block"){const r=this.generateFunctionBody(e.body);n=`((${t.join(", ")}) => {
${r}
${this.indent()}})`}else n=`((${t.join(", ")}) => ${this.generateExpr(e.body)})`;return this.popScope(),n}case"e_if":{const t=this.generateExpr(e.cond),n=this.generateExpr(e.thenExpr);if(e.elseExpr){const r=this.generateExpr(e.elseExpr);return`(${t} ? ${n} : ${r})`}return`(${t} ? ${n} : null)`}case"e_block":{this.indentLevel++,this.pushScope();const t=e.statements.map(s=>this.generateStatement(s)),n=e.result?`${this.indent()}return ${this.generateExpr(e.result)};`:"";return this.popScope(),this.indentLevel--,`(() => {
${[...t,n].filter(Boolean).join(`
`)}
${this.indent()}})()`}case"e_match":return this.generateMatchExpr(e.scrutinee,e.arms);case"e_switch":{let n=`(() => {
  const $discr = ${this.generateExpr(e.discriminant)};
  let $matched = false, $fallthrough = false;
`;for(const r of e.cases){const i=(r.values&&r.values.length>0?r.values:r.value?[r.value]:[]).map(o=>`$discr === (${this.generateExpr(o)})`).join(" || ");n+=`  if ($fallthrough || (${i})) {
    $matched = true;
    $fallthrough = false;
    try {
      return ${this.generateExpr(r.body)};
    } catch ($e) {
      if ($e instanceof __ContinueSignal) { $fallthrough = true; }
      else if ($e instanceof __BreakSignal) { return; }
      else throw $e;
    }
  }
`}return e.defaultCase&&(n+=`  if ($fallthrough || !$matched) {
    return ${this.generateExpr(e.defaultCase)};
  }
`),n+="})()",n}case"e_range":{const t=this.generateExpr(e.start),n=this.generateExpr(e.end),r=e.inclusive?"true":"false";return`((s, e, inc) => { const res = []; if (s <= e) { const limit = inc ? e : e - 1; for (let i = s; i <= limit; i++) res.push(i); } else { const limit = inc ? e : e + 1; for (let i = s; i >= limit; i--) res.push(i); } return res; })(${t}, ${n}, ${r})`}case"e_list_comp":{const t=this.generateExpr(e.iterable);let n=`(Array.isArray(${t}) ? ${t} : [])`;return e.condition&&(n+=`.filter(${e.param} => ${this.generateExpr(e.condition)})`),n+=`.map(${e.param} => ${this.generateExpr(e.element)})`,n}case"e_for":return`(() => {
${this.generateForStatement(e)}
})()`;case"e_while":return`(() => {
${this.generateWhileStatement(e)}
})()`;case"e_break":return"(function(){ throw new __BreakSignal(); })()";case"e_continue":return"(function(){ throw new __ContinueSignal(); })()";case"e_return":return`(function(){ throw new __ReturnSignal(${e.value?this.generateExpr(e.value):"null"}); })()`;case"e_do":{const t=desugarDo(e);return this.generateExpr(t)}case"e_where":{this.pushScope(),this.indentLevel++;const t=e.bindings.map(r=>this.generateStatement(r)).join(`
`),n=`${this.indent()}return ${this.generateExpr(e.expr)};`;return this.indentLevel--,this.popScope(),`(() => {
${t}
${n}
${this.indent()}})()`}default:return"null"}}generateForStatement(e){this.pushScope();let t="";if(e.init)if(e.init.kind==="s_let"){const i=sanitizeIdent(e.init.name);this.addLocalVar(e.init.name);const o=this.generateExpr(e.init.init);t=`let ${i} = ${o}`}else e.init.kind==="s_expr"?t=this.generateExpr(e.init.expr):e.init.kind.startsWith("e_")&&(t=this.generateExpr(e.init));const n=e.cond?this.generateExpr(e.cond):"",r=e.update?this.generateExpr(e.update):"";let s="";if(e.body.kind==="e_block"){this.indentLevel++;const i=e.body.statements.map(l=>this.generateStatement(l)),o=e.body.result?`${this.indent()}${this.generateExpr(e.body.result)};`:"";this.indentLevel--,s=`{
${[...i,o].filter(Boolean).join(`
`)}
${this.indent()}}`}else s=`{
${this.indent()}  ${this.generateExpr(e.body)};
${this.indent()}}`;return this.popScope(),`${this.indent()}try { for (${t}; ${n}; ${r}) { try ${s} catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }`}generateWhileStatement(e){this.pushScope();const t=this.generateExpr(e.cond);let n="";if(e.body.kind==="e_block"){this.indentLevel++;const r=e.body.statements.map(i=>this.generateStatement(i)),s=e.body.result?`${this.indent()}${this.generateExpr(e.body.result)};`:"";this.indentLevel--,n=`{
${[...r,s].filter(Boolean).join(`
`)}
${this.indent()}}`}else n=`{
${this.indent()}  ${this.generateExpr(e.body)};
${this.indent()}}`;return this.popScope(),`${this.indent()}try { while (${t}) { try ${n} catch(e) { if (e instanceof __ContinueSignal) continue; else throw e; } } } catch(e) { if (!(e instanceof __BreakSignal)) throw e; }`}generateMatchExpr(e,t){const n=this.generateExpr(e),r=this.freshVar("_m");this.indentLevel++;const s=[];for(const i of t){const o=[],l=[],c=[];this.compilePatternMatch(i.pattern,r,o,l,c),this.pushScope(c);let u="";i.guard&&(u=`if (${this.generateExpr(i.guard)}) `);const p=o.length>0?o.join(" && "):"true",d=this.generateExpr(i.body);this.popScope();const f=l.map(m=>`${this.indent()}  ${m};`).join(`
`);s.push(`${this.indent()}if (${p}) {
`+(f?`${f}
`:"")+(u?`${this.indent()}  if (${this.generateExpr(i.guard)}) {
${this.indent()}    return ${d};
${this.indent()}  }
`:`${this.indent()}  return ${d};
`)+`${this.indent()}}`)}return this.indentLevel--,`(((${r}) => {
`+s.join(`
`)+`
${this.indent()}  throw new Error("Unhandled pattern match in TypeLang");
${this.indent()}})(${n}))`}compilePatternMatch(e,t,n,r,s){switch(e.kind){case"p_wildcard":case"p_rest":break;case"p_var":{const i=sanitizeIdent(e.name);r.push(`const ${i} = ${t}`),s.push(e.name);break}case"p_literal":{const i=e.value===null?"null":typeof e.value=="string"?JSON.stringify(e.value):String(e.value);n.push(`(${t} === ${i})`);break}case"p_as":{const i=sanitizeIdent(e.name);r.push(`const ${i} = ${t}`),s.push(e.name),this.compilePatternMatch(e.pattern,t,n,r,s);break}case"p_ctor":{n.push(`Boolean(${t} && typeof ${t} === 'object' && ${t}.$tag === "${e.name}")`);for(let i=0;i<e.args.length;i++){const o=`(${t} && ${t}.$args ? ${t}.$args[${i}] : (${t} ? Object.values(${t})[${i+1}] : undefined))`;this.compilePatternMatch(e.args[i],o,n,r,s)}break}case"p_record":{n.push(`Boolean(${t} && typeof ${t} === 'object')`);for(const i of e.fields){const o=`${t}.${sanitizeIdent(i.name)}`;if(i.pattern)this.compilePatternMatch(i.pattern,o,n,r,s);else{const l=i.alias||i.name,c=sanitizeIdent(l);r.push(`const ${c} = ${o}`),s.push(l)}}break}case"p_tuple":{n.push(`Array.isArray(${t})`);for(let i=0;i<e.elements.length;i++){const o=`${t}[${i}]`;this.compilePatternMatch(e.elements[i],o,n,r,s)}break}}}}class LLVMIRGenerator{constructor(){this.tempRegCounter=0,this.blockCounter=0,this.lambdaCounter=0,this.stringPool=new Map,this.stringDecls=[],this.blocks=[],this.currentBlock=null,this.entryAllocas=[],this.varAllocaMap=new Map,this.gadtConstructorTags=new Map,this.gadtTypeNames=new Set,this.functionDefinitions=new Map,this.externalDeclarations=new Map,this.extraFunctionsCode=[],this.allocatedAllocasInFn=new Set,this.currentModulePrefix="",this.globalVariables=new Map,this.globalVarDecls=[],this.loopStack=[]}freshReg(){return`%t${++this.tempRegCounter}`}freshBlock(e="bb"){return`${e}.${++this.blockCounter}`}startBlock(e){const t=this.blocks.find(r=>r.name===e);if(t)return this.currentBlock=t,t;const n={name:e,instructions:[],terminated:!1};return this.blocks.push(n),this.currentBlock=n,n}emit(e){this.currentBlock||this.startBlock("entry"),!this.currentBlock.terminated&&this.currentBlock.instructions.push(`  ${e}`)}emitAlloca(e){this.entryAllocas.push(`  ${e}`)}emitBranch(e){!this.currentBlock||this.currentBlock.terminated||(this.currentBlock.instructions.push(`  br label %${e}`),this.currentBlock.terminated=!0)}emitCondBranch(e,t,n){!this.currentBlock||this.currentBlock.terminated||(this.currentBlock.instructions.push(`  br i1 ${e}, label %${t}, label %${n}`),this.currentBlock.terminated=!0)}registerString(e){if(this.stringPool.has(e))return this.stringPool.get(e);const t=`@.str.${this.stringPool.size}`;this.stringPool.set(e,t);const n=new TextEncoder().encode(e);let r="";for(let i=0;i<n.length;i++){const o=n[i];o>=32&&o<=126&&o!==34&&o!==92?r+=String.fromCharCode(o):r+="\\"+o.toString(16).toUpperCase().padStart(2,"0")}const s=n.length+1;return this.stringDecls.push(`${t} = private unnamed_addr constant [${s} x i8] c"${r}\\00", align 1`),t}llvmTypeFromAST(e){if(!e)return"double";switch(e.kind){case"base":return e.name==="string"?"i8*":e.name==="boolean"?"i1":e.name==="void"?"void":"double";case"app":return this.gadtTypeNames.has(e.name)?"%struct.GADTValue*":e.name==="Array"?"%struct.Array*":"%struct.GADTValue*";case"var":case"fun":case"record":case"tuple":return"i8*";default:return"double"}}castToI8Ptr(e){if(e.type==="void")return"null";if(e.type==="i8*")return e.name==="0.0"||e.name==="0"||e.name===""?"null":e.name;if(e.type.endsWith("*")){if(e.name==="0.0"||e.name==="0"||e.name===""||e.name==="null")return"null";const n=this.freshReg();return this.emit(`${n} = bitcast ${e.type} ${e.name} to i8*`),n}if(e.type==="double"){const n=e.name.startsWith("%")?e.name:(()=>{const i=this.freshReg();return this.emit(`${i} = fadd double ${e.name}, 0.0`),i})(),r=this.freshReg();this.emit(`${r} = bitcast double ${n} to i64`);const s=this.freshReg();return this.emit(`${s} = inttoptr i64 ${r} to i8*`),s}if(e.type==="i64"){const n=this.freshReg();return this.emit(`${n} = inttoptr i64 ${e.name} to i8*`),n}if(e.type==="i32"){const n=this.freshReg();this.emit(`${n} = zext i32 ${e.name} to i64`);const r=this.freshReg();return this.emit(`${r} = inttoptr i64 ${n} to i8*`),r}if(e.type==="i1"){const n=this.freshReg();this.emit(`${n} = zext i1 ${e.name} to i64`);const r=this.freshReg();return this.emit(`${r} = inttoptr i64 ${n} to i8*`),r}const t=this.freshReg();return this.emit(`${t} = bitcast ${e.type} ${e.name} to i8*`),t}castFromI8Ptr(e,t){if(t==="void")return"";const n=e==="0.0"||e==="0"||e===""||!e?"null":e;if(t==="i8*")return n;if(t.endsWith("*")){if(n==="null")return"null";const s=this.freshReg();return this.emit(`${s} = bitcast i8* ${n} to ${t}`),s}if(t==="double"){if(n==="null")return"0.0";const s=this.freshReg();this.emit(`${s} = ptrtoint i8* ${n} to i64`);const i=this.freshReg();return this.emit(`${i} = bitcast i64 ${s} to double`),i}if(t==="i64"){if(n==="null")return"0";const s=this.freshReg();return this.emit(`${s} = ptrtoint i8* ${n} to i64`),s}if(t==="i32"){if(n==="null")return"0";const s=this.freshReg();this.emit(`${s} = ptrtoint i8* ${n} to i64`);const i=this.freshReg();return this.emit(`${i} = trunc i64 ${s} to i32`),i}if(t==="i1"){if(n==="null")return"0";const s=this.freshReg();this.emit(`${s} = ptrtoint i8* ${n} to i64`);const i=this.freshReg();return this.emit(`${i} = trunc i64 ${s} to i1`),i}const r=this.freshReg();return this.emit(`${r} = bitcast i8* ${n} to ${t}`),r}coerceToDouble(e){if(e.type==="double")return e;if(e.type==="void")return{type:"double",name:"0.0"};const t=this.freshReg();if(e.type==="i1")return this.emit(`${t} = uitofp i1 ${e.name} to double`),{type:"double",name:t};if(e.type==="i32")return this.emit(`${t} = sitofp i32 ${e.name} to double`),{type:"double",name:t};if(e.type==="i64")return this.emit(`${t} = sitofp i64 ${e.name} to double`),{type:"double",name:t};if(e.type==="i8*"||e.type.endsWith("*")){const n=e.name==="0.0"||e.name==="0"||e.name===""||!e.name?"null":e.name;if(n==="null")return{type:"double",name:"0.0"};const r=e.type==="i8*"?n:this.castToI8Ptr(e),s=this.freshReg();return this.emit(`${s} = ptrtoint i8* ${r} to i64`),this.emit(`${t} = bitcast i64 ${s} to double`),{type:"double",name:t}}return{type:"double",name:"0.0"}}coerceToI1(e){if(e.type==="i1")return e;if(e.type==="void")return{type:"i1",name:"0"};const t=this.freshReg();if(e.type==="double")return this.emit(`${t} = fcmp one double ${e.name}, 0.0`),{type:"i1",name:t};if(e.type==="i32")return this.emit(`${t} = icmp ne i32 ${e.name}, 0`),{type:"i1",name:t};if(e.type==="i64")return this.emit(`${t} = icmp ne i64 ${e.name}, 0`),{type:"i1",name:t};if(e.type==="i8*"||e.type.endsWith("*")){const n=e.name==="0.0"||e.name==="0"||e.name===""||!e.name?"null":e.name,r=e.type==="i8*"?n:this.castToI8Ptr(e);return this.emit(`${t} = icmp ne i8* ${r}, null`),{type:"i1",name:t}}return{type:"i1",name:"1"}}convertToStringPtr(e){if(e.type==="i8*")return e.name==="0.0"||e.name==="0"||e.name===""?"null":e.name;if(e.type.endsWith("*"))return this.castToI8Ptr(e);const t=this.freshReg();if(this.emit(`${t} = call i8* @malloc(i64 64)`),e.type==="double"){const n=this.freshReg();this.emit(`${n} = call i32 (i8*, i8*, ...) @sprintf(i8* ${t}, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_num, i64 0, i64 0), double ${e.name})`)}else if(e.type==="i64"||e.type==="i32"){const n=this.freshReg();this.emit(`${n} = call i32 (i8*, i8*, ...) @sprintf(i8* ${t}, i8* getelementptr inbounds ([5 x i8], [5 x i8]* @.fmt_tostr_int, i64 0, i64 0), ${e.type} ${e.name})`)}else if(e.type==="i1"){const n=this.freshReg();this.emit(`${n} = getelementptr inbounds [5 x i8], [5 x i8]* @.fmt_bool_t_val, i64 0, i64 0`);const r=this.freshReg();this.emit(`${r} = getelementptr inbounds [6 x i8], [6 x i8]* @.fmt_bool_f_val, i64 0, i64 0`);const s=this.freshReg();this.emit(`${s} = select i1 ${e.name}, i8* ${n}, i8* ${r}`);const i=this.freshReg();this.emit(`${i} = call i8* @strcpy(i8* ${t}, i8* ${s})`)}else{const n=this.castToI8Ptr(e),r=this.freshReg();this.emit(`${r} = call i32 (i8*, i8*, ...) @sprintf(i8* ${t}, i8* getelementptr inbounds ([3 x i8], [3 x i8]* @.fmt_tostr_str, i64 0, i64 0), i8* ${n})`)}return t}coerceToType(e,t){if(e.type===t)return(e.name==="0.0"||e.name==="0"||e.name==="")&&t.endsWith("*")?{type:t,name:"null"}:e;if(t==="void")return{type:"void",name:""};if(t==="double")return this.coerceToDouble(e);if(t==="i1")return this.coerceToI1(e);if(t==="i8*")return{type:"i8*",name:this.castToI8Ptr(e)};if(t.endsWith("*")){if(e.name==="null"||e.name==="0.0"||e.name==="0"||e.name===""||!e.name)return{type:t,name:"null"};const n=e.type==="i8*"?e.name:this.castToI8Ptr(e),r=this.freshReg();return this.emit(`${r} = bitcast i8* ${n} to ${t}`),{type:t,name:r}}return e}generate(e){this.tempRegCounter=0,this.blockCounter=0,this.lambdaCounter=0,this.stringPool.clear(),this.stringDecls=[],this.gadtConstructorTags.clear(),this.gadtTypeNames.clear(),this.functionDefinitions.clear(),this.externalDeclarations.clear(),this.extraFunctionsCode=[],this.globalVariables.clear(),this.globalVarDecls=[];const t=(d,f="")=>{for(const m of d)if(m.kind==="s_gadt")this.gadtTypeNames.add(m.decl.name),m.decl.constructors.forEach((y,_)=>{const g=f?`${f}_${y.name}`:y.name;this.gadtConstructorTags.set(g,{tag:_,typeName:m.decl.name,arity:y.params.length}),f&&this.gadtConstructorTags.set(y.name,{tag:_,typeName:m.decl.name,arity:y.params.length})});else if(m.kind==="s_module"){const y=f?`${f}_${m.name}`:m.name;t(m.body,y)}};t(e.statements);const n=(d,f="")=>{for(const m of d)if(m.kind==="s_let"){const y=f?`${f}_${m.name}`:m.name,_=m.typeAnnotation?this.llvmTypeFromAST(m.typeAnnotation):"i8*",g={symbol:y,type:_};this.globalVariables.set(y,g),f?(this.globalVariables.set(`${f}.${m.name}`,g),this.globalVariables.set(m.name,g)):this.globalVariables.set(m.name,g);let h="null";_==="double"?h="0.0":(_==="i1"||_==="i32"||_==="i64")&&(h="0"),this.globalVarDecls.push(`@${y} = global ${_} ${h}, align 8`)}else if(m.kind==="s_module"){const y=f?`${f}_${m.name}`:m.name;n(m.body,y)}};n(e.statements);const r=[],s=(d,f="")=>{for(const m of d)if(m.kind==="s_function"){const y=f?`${f}_${m.name}`:m.name;r.push({fn:m,prefix:f,symbol:y}),m.whereBindings&&s(m.whereBindings,f)}else if(m.kind==="s_module"){const y=f?`${f}_${m.name}`:m.name;s(m.body,y)}};s(e.statements);for(const d of r){const f=d.fn,m=f.params.map(h=>this.llvmTypeFromAST(h.type)),y=this.llvmTypeFromAST(f.returnType),_={paramTypes:m,retType:y},g={symbol:d.symbol,sig:_};this.functionDefinitions.set(d.symbol,g),d.prefix?this.functionDefinitions.set(`${d.prefix}.${f.name}`,g):this.functionDefinitions.set(f.name,g)}const i=[];for(const d of r){const f=d.fn,m=f.name;f.name=d.symbol,i.push(this.generateFunction(f,d.prefix)),f.name=m}const o=this.generateMain(e),l=["; =====================================================================","; Module: TypeLang Generated LLVM SSA Target","; Architecture: x86_64-unknown-linux-gnu / POSIX","; =====================================================================",'; ModuleID = "typelang_module"','source_filename = "main.tl"','target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-f80:128-n8:16:32:64-S128"','target triple = "x86_64-unknown-linux-gnu"',"","; --- Core Data Struct Layouts ---","%struct.GADTValue = type { i32, i8* }     ; Tagged union (tag: i32, payload: i8*)","%struct.Array = type { i64, i8** }        ; Dynamic array (len: i64, data: i8**)","%struct.RecordField = type { i8*, i8* }   ; Structural dynamic field slot","","; --- Standard Formats & String Constants ---",'@.fmt_str = private unnamed_addr constant [4 x i8] c"%s\\0A\\00", align 1','@.fmt_num = private unnamed_addr constant [4 x i8] c"%f\\0A\\00", align 1','@.fmt_int = private unnamed_addr constant [6 x i8] c"%lld\\0A\\00", align 1','@.fmt_bool_t = private unnamed_addr constant [6 x i8] c"true\\0A\\00", align 1','@.fmt_bool_f = private unnamed_addr constant [7 x i8] c"false\\0A\\00", align 1','@.fmt_tostr_str = private unnamed_addr constant [3 x i8] c"%s\\00", align 1','@.fmt_tostr_num = private unnamed_addr constant [5 x i8] c"%.14g\\00", align 1','@.fmt_tostr_int = private unnamed_addr constant [5 x i8] c"%lld\\00", align 1','@.fmt_bool_t_val = private unnamed_addr constant [5 x i8] c"true\\00", align 1','@.fmt_bool_f_val = private unnamed_addr constant [6 x i8] c"false\\00", align 1'];this.stringDecls.length>0&&(l.push(""),l.push("; --- Interned String Literals ---"),l.push(...this.stringDecls)),this.globalVarDecls.length>0&&(l.push(""),l.push("; --- Global and Module Variables ---"),l.push(...this.globalVarDecls)),l.push(""),l.push("; --- External POSIX C Library Declarations ---"),l.push("declare i32 @printf(i8*, ...)"),l.push("declare i32 @sprintf(i8*, i8*, ...)"),l.push("declare i32 @puts(i8*)"),l.push("declare i8* @malloc(i64)"),l.push("declare void @free(i8*)"),l.push("declare void @exit(i32)"),l.push("declare i64 @strlen(i8*)"),l.push("declare i8* @strcpy(i8*, i8*)"),l.push("declare i8* @strcat(i8*, i8*)"),l.push("declare i32 @strcmp(i8*, i8*)"),l.push("declare double @atof(i8*)"),l.push("declare i64 @atoll(i8*)"),l.push("declare double @llvm.sqrt.f64(double)"),l.push("declare double @llvm.pow.f64(double, double)"),l.push("declare double @llvm.fabs.f64(double)"),l.push("declare double @llvm.floor.f64(double)"),l.push("declare double @llvm.ceil.f64(double)"),l.push("declare double @llvm.sin.f64(double)"),l.push("declare double @llvm.cos.f64(double)");const c=["","; --- Runtime Helper: Dynamic Record Field Lookup ---","define i8* @_tl_record_get(i8* %rec, i8* %field) {","entry:","  %cmp_null = icmp eq i8* %rec, null","  br i1 %cmp_null, label %ret_null, label %check_rec","check_rec:","  %count_ptr = bitcast i8* %rec to i64*","  %count = load i64, i64* %count_ptr, align 8","  br label %loop.cond","loop.cond:","  %i = phi i64 [ 0, %check_rec ], [ %next_i, %loop.step ]","  %done = icmp sge i64 %i, %count","  br i1 %done, label %ret_null, label %loop.body","loop.body:","  %slot_offset = mul i64 %i, 16","  %key_offset = add i64 %slot_offset, 8","  %key_ptr_loc = getelementptr inbounds i8, i8* %rec, i64 %key_offset","  %key_ptr_cast = bitcast i8* %key_ptr_loc to i8**","  %key = load i8*, i8** %key_ptr_cast, align 8","  %cmp = call i32 @strcmp(i8* %key, i8* %field)","  %match = icmp eq i32 %cmp, 0","  br i1 %match, label %found, label %loop.step","found:","  %val_offset = add i64 %slot_offset, 16","  %val_ptr_loc = getelementptr inbounds i8, i8* %rec, i64 %val_offset","  %val_ptr_cast = bitcast i8* %val_ptr_loc to i8**","  %val = load i8*, i8** %val_ptr_cast, align 8","  ret i8* %val","loop.step:","  %next_i = add i64 %i, 1","  br label %loop.cond","ret_null:","  ret i8* null","}",""].join(`
`),u=["","; --- Runtime Helper: Array Join ---","define i8* @_tl_array_join(%struct.Array* %arr, i8* %sep) {","entry:","  %cmp_null = icmp eq %struct.Array* %arr, null","  br i1 %cmp_null, label %ret_empty, label %check_len","check_len:","  %len_ptr = getelementptr inbounds %struct.Array, %struct.Array* %arr, i32 0, i32 0","  %len = load i64, i64* %len_ptr, align 8","  %cmp_zero = icmp sle i64 %len, 0","  br i1 %cmp_zero, label %ret_empty, label %alloc_buf","alloc_buf:","  %buf = call i8* @malloc(i64 65536)","  store i8 0, i8* %buf, align 1","  %data_ptr = getelementptr inbounds %struct.Array, %struct.Array* %arr, i32 0, i32 1","  %elems = load i8**, i8*** %data_ptr, align 8","  br label %join.loop.cond","join.loop.cond:","  %i = phi i64 [ 0, %alloc_buf ], [ %next_i, %join.loop.step ]","  %done = icmp sge i64 %i, %len","  br i1 %done, label %join.done, label %join.loop.body","join.loop.body:","  %is_first = icmp eq i64 %i, 0","  br i1 %is_first, label %append_elem, label %check_sep","check_sep:","  %sep_null = icmp eq i8* %sep, null","  br i1 %sep_null, label %append_elem, label %append_sep","append_sep:","  %tmp_cat1 = call i8* @strcat(i8* %buf, i8* %sep)","  br label %append_elem","append_elem:","  %elem_slot = getelementptr inbounds i8*, i8** %elems, i64 %i","  %elem_str = load i8*, i8** %elem_slot, align 8","  %elem_null = icmp eq i8* %elem_str, null","  br i1 %elem_null, label %join.loop.step, label %do_elem_cat","do_elem_cat:","  %tmp_cat2 = call i8* @strcat(i8* %buf, i8* %elem_str)","  br label %join.loop.step","join.loop.step:","  %next_i = add i64 %i, 1","  br label %join.loop.cond","join.done:","  ret i8* %buf","ret_empty:","  %empty = call i8* @malloc(i64 1)","  store i8 0, i8* %empty, align 1","  ret i8* %empty","}",""].join(`
`),p=["","; --- Runtime Helper: Array Push ---","define %struct.Array* @_tl_array_push(%struct.Array* %arr, i8* %elem) {","entry:","  %cmp_null = icmp eq %struct.Array* %arr, null","  br i1 %cmp_null, label %ret_null, label %do_push","do_push:","  %len_ptr = getelementptr inbounds %struct.Array, %struct.Array* %arr, i32 0, i32 0","  %len = load i64, i64* %len_ptr, align 8","  %new_len = add i64 %len, 1","  %data_ptr = getelementptr inbounds %struct.Array, %struct.Array* %arr, i32 0, i32 1","  %old_data = load i8**, i8*** %data_ptr, align 8","  %new_bytes = mul i64 %new_len, 8","  %new_data_raw = call i8* @malloc(i64 %new_bytes)","  %new_data = bitcast i8* %new_data_raw to i8**","  br label %push.loop.cond","push.loop.cond:","  %idx = phi i64 [ 0, %do_push ], [ %next_idx, %push.loop.body ]","  %cmp_done = icmp sge i64 %idx, %len","  br i1 %cmp_done, label %push.loop.end, label %push.loop.body","push.loop.body:","  %old_slot = getelementptr inbounds i8*, i8** %old_data, i64 %idx","  %old_val = load i8*, i8** %old_slot, align 8","  %new_slot = getelementptr inbounds i8*, i8** %new_data, i64 %idx","  store i8* %old_val, i8** %new_slot, align 8","  %next_idx = add i64 %idx, 1","  br label %push.loop.cond","push.loop.end:","  %push_slot = getelementptr inbounds i8*, i8** %new_data, i64 %len","  store i8* %elem, i8** %push_slot, align 8","  store i64 %new_len, i64* %len_ptr, align 8","  store i8** %new_data, i8*** %data_ptr, align 8","  ret %struct.Array* %arr","ret_null:","  ret %struct.Array* null","}",""].join(`
`);for(const[d,f]of this.externalDeclarations.entries())!this.functionDefinitions.has(d)&&d!=="_tl_record_get"&&d!=="_tl_array_join"&&d!=="_tl_array_push"&&l.push(`declare ${f.retType} @${d}(${f.paramTypes.join(", ")})`);return l.push(""),[...l,c,u,p,...this.extraFunctionsCode,...i,o].join(`
`)}generateFunction(e,t=""){const n=this.blocks,r=this.currentBlock,s=new Map(this.varAllocaMap),i=[...this.entryAllocas];this.blocks=[],this.currentBlock=null,this.entryAllocas=[],this.varAllocaMap.clear(),this.allocatedAllocasInFn.clear(),this.currentModulePrefix=t;const o=e.params.map(p=>`${this.llvmTypeFromAST(p.type)} %arg.${p.name}`),l=this.llvmTypeFromAST(e.returnType),c=[`define ${l} @${e.name}(${o.join(", ")}) {`];this.startBlock("entry");for(const p of e.params){const d=this.llvmTypeFromAST(p.type),f=`%${p.name}.addr`;this.emitAlloca(`${f} = alloca ${d}, align 8`),this.emit(`store ${d} %arg.${p.name}, ${d}* ${f}, align 8`),this.varAllocaMap.set(p.name,{type:d,reg:f})}if(e.whereBindings)for(const p of e.whereBindings)p.kind!=="s_function"&&this.lowerTopLevelStatement(p);const u=this.lowerExpr(e.body);if(l==="void")this.emitRet("void");else{let p=u;if(u.type!==l){if(u.type==="i8*"){const d=this.castFromI8Ptr(u.name,l);p={type:l,name:d}}else if(l==="i8*")p={type:"i8*",name:this.castToI8Ptr(u)};else if(l==="double")p=this.coerceToDouble(u);else if(l==="i1")p=this.coerceToI1(u);else if(l.endsWith("*"))if(u.name==="0.0"||u.name==="0"||u.type==="void")p={type:l,name:"null"};else{const d=this.castToI8Ptr(u),f=this.freshReg();this.emit(`${f} = bitcast i8* ${d} to ${l}`),p={type:l,name:f}}}this.emitRet(l,p.name)}this.finalizeBlocks(l);for(let p=0;p<this.blocks.length;p++){const d=this.blocks[p];c.push(`${d.name}:`),p===0&&this.entryAllocas.length>0&&c.push(...this.entryAllocas),c.push(...d.instructions)}return c.push(`}
`),this.blocks=n,this.currentBlock=r,this.varAllocaMap=s,this.entryAllocas=i,c.join(`
`)}generateMain(e){this.blocks=[],this.currentBlock=null,this.entryAllocas=[],this.varAllocaMap.clear(),this.allocatedAllocasInFn.clear(),this.currentModulePrefix="";const t=["define i32 @main() {"];this.startBlock("entry");for(const n of e.statements)this.lowerTopLevelStatement(n);this.emitRet("i32","0"),this.finalizeBlocks("i32");for(let n=0;n<this.blocks.length;n++){const r=this.blocks[n];t.push(`${r.name}:`),n===0&&this.entryAllocas.length>0&&t.push(...this.entryAllocas),t.push(...r.instructions)}return t.push("}"),t.join(`
`)}finalizeBlocks(e){for(let t=0;t<this.blocks.length;t++){const n=this.blocks[t];n.instructions.length===0?(t+1<this.blocks.length?n.instructions.push(`  br label %${this.blocks[t+1].name}`):e==="void"?n.instructions.push("  ret void"):e==="i32"?n.instructions.push("  ret i32 0"):e==="double"?n.instructions.push("  ret double 0.0"):e==="i1"?n.instructions.push("  ret i1 0"):n.instructions.push(`  ret ${e} null`),n.terminated=!0):n.terminated||(t+1<this.blocks.length?n.instructions.push(`  br label %${this.blocks[t+1].name}`):e==="void"?n.instructions.push("  ret void"):e==="i32"?n.instructions.push("  ret i32 0"):e==="double"?n.instructions.push("  ret double 0.0"):e==="i1"?n.instructions.push("  ret i1 0"):n.instructions.push(`  ret ${e} null`),n.terminated=!0)}}emitRet(e,t){!this.currentBlock||this.currentBlock.terminated||(e==="void"||!t?this.currentBlock.instructions.push("  ret void"):this.currentBlock.instructions.push(`  ret ${e} ${t}`),this.currentBlock.terminated=!0)}lowerTopLevelStatement(e){switch(e.kind){case"s_let":{const t=this.lowerExpr(e.init),n=this.currentModulePrefix?`${this.currentModulePrefix}_${e.name}`:e.name,r=this.globalVariables.get(n)||this.globalVariables.get(e.name),s=t.type==="void"?"i8*":t.type;let o=`${e.name}.var`,l=1;for(;this.allocatedAllocasInFn.has(o);)o=`${e.name}.${l++}.var`;this.allocatedAllocasInFn.add(o);const c=`%${o}`;if(this.emitAlloca(`${c} = alloca ${s}, align 8`),t.type!=="void"&&this.emit(`store ${t.type} ${t.name}, ${t.type}* ${c}, align 8`),this.varAllocaMap.set(e.name,{type:s,reg:c}),r){const u=this.coerceToType(t,r.type);this.emit(`store ${r.type} ${u.name}, ${r.type}* @${r.symbol}, align 8`)}break}case"s_expr":{this.lowerExpr(e.expr);break}case"s_module":{const t=this.currentModulePrefix;this.currentModulePrefix=t?`${t}_${e.name}`:e.name;for(const n of e.body)this.lowerTopLevelStatement(n);this.currentModulePrefix=t;break}case"s_gadt":{this.emit(`; GADT Sum Type Definition: ${e.decl.name}`),e.decl.constructors.forEach((t,n)=>{this.emit(`;   Constructor [${n}]: ${t.name}(${t.params.map(r=>r.name).join(", ")})`)});break}}}lowerExpr(e){switch(e.kind){case"e_literal":{if(typeof e.value=="number")return{type:"double",name:Number.isInteger(e.value)?`${e.value}.0`:String(e.value)};if(typeof e.value=="boolean")return{type:"i1",name:e.value?"1":"0"};if(typeof e.value=="string"){const t=this.registerString(e.value),n=this.freshReg(),r=new TextEncoder().encode(e.value).length+1;return this.emit(`${n} = getelementptr inbounds [${r} x i8], [${r} x i8]* ${t}, i64 0, i64 0`),{type:"i8*",name:n}}return{type:"i8*",name:"null"}}case"e_var":{const t=e.modulePath&&e.modulePath.length>0?e.modulePath.join("_"):"",n=t?`${t}_${e.name}`:e.name,r=this.varAllocaMap.get(e.name)||this.varAllocaMap.get(n);if(r){const l=this.freshReg();return this.emit(`${l} = load ${r.type}, ${r.type}* ${r.reg}, align 8`),{type:r.type,name:l}}let s=this.globalVariables.get(n);if(!s&&!t&&this.currentModulePrefix&&(s=this.globalVariables.get(`${this.currentModulePrefix}_${e.name}`)),!s&&!t&&(s=this.globalVariables.get(e.name)),s){const l=this.freshReg();return this.emit(`${l} = load ${s.type}, ${s.type}* @${s.symbol}, align 8`),{type:s.type,name:l}}const i=this.gadtConstructorTags.get(n)||this.gadtConstructorTags.get(e.name);if(i&&i.arity===0)return this.constructGADT(i.tag,[]);let o=this.functionDefinitions.get(n);if(!o&&!t&&this.currentModulePrefix&&(o=this.functionDefinitions.get(`${this.currentModulePrefix}_${e.name}`)),!o&&!t&&(o=this.functionDefinitions.get(e.name)),o){const l=o.sig,c=`${l.retType} (${l.paramTypes.join(", ")})*`,u=this.freshReg();return this.emit(`${u} = bitcast ${c} @${o.symbol} to i8*`),{type:"i8*",name:u}}return{type:"double",name:"0.0"}}case"e_binary":{const t=this.lowerExpr(e.left),n=this.lowerExpr(e.right),r=this.freshReg();if(e.op==="+"&&(e.left.kind==="e_literal"&&typeof e.left.value=="string"||e.right.kind==="e_literal"&&typeof e.right.value=="string")){const o=this.convertToStringPtr(t),l=this.convertToStringPtr(n),c=this.freshReg();this.emit(`${c} = call i64 @strlen(i8* ${o})`);const u=this.freshReg();this.emit(`${u} = call i64 @strlen(i8* ${l})`);const p=this.freshReg();this.emit(`${p} = add i64 ${c}, ${u}`);const d=this.freshReg();this.emit(`${d} = add i64 ${p}, 1`),this.emit(`${r} = call i8* @malloc(i64 ${d})`);const f=this.freshReg();this.emit(`${f} = call i8* @strcpy(i8* ${r}, i8* ${o})`);const m=this.freshReg();return this.emit(`${m} = call i8* @strcat(i8* ${r}, i8* ${l})`),{type:"i8*",name:r}}if(e.op==="&&"||e.op==="||"){const o=this.coerceToI1(t),l=this.coerceToI1(n);return e.op==="&&"?this.emit(`${r} = and i1 ${o.name}, ${l.name}`):this.emit(`${r} = or i1 ${o.name}, ${l.name}`),{type:"i1",name:r}}if(e.op==="=="||e.op==="!="){if(t.type==="i1"&&n.type==="i1"){const u=e.op==="=="?"eq":"ne";return this.emit(`${r} = icmp ${u} i1 ${t.name}, ${n.name}`),{type:"i1",name:r}}if(t.type.endsWith("*")&&n.type.endsWith("*")){const u=this.castToI8Ptr(t),p=this.castToI8Ptr(n),d=e.op==="=="?"eq":"ne";return this.emit(`${r} = icmp ${d} i8* ${u}, ${p}`),{type:"i1",name:r}}const o=this.coerceToDouble(t),l=this.coerceToDouble(n),c=e.op==="=="?"fcmp oeq":"fcmp one";return this.emit(`${r} = ${c} double ${o.name}, ${l.name}`),{type:"i1",name:r}}if(e.op==="<"||e.op==="<="||e.op===">"||e.op===">="){const o=this.coerceToDouble(t),l=this.coerceToDouble(n),c={"<":"olt","<=":"ole",">":"ogt",">=":"oge"};return this.emit(`${r} = fcmp ${c[e.op]} double ${o.name}, ${l.name}`),{type:"i1",name:r}}const s=this.coerceToDouble(t),i=this.coerceToDouble(n);switch(e.op){case"+":return this.emit(`${r} = fadd double ${s.name}, ${i.name}`),{type:"double",name:r};case"-":return this.emit(`${r} = fsub double ${s.name}, ${i.name}`),{type:"double",name:r};case"*":return this.emit(`${r} = fmul double ${s.name}, ${i.name}`),{type:"double",name:r};case"/":return this.emit(`${r} = fdiv double ${s.name}, ${i.name}`),{type:"double",name:r};case"%":return this.emit(`${r} = frem double ${s.name}, ${i.name}`),{type:"double",name:r};default:return t}}case"e_unary":{const t=this.lowerExpr(e.expr),n=this.freshReg();if(e.op==="-"){const r=this.coerceToDouble(t);return this.emit(`${n} = fneg double ${r.name}`),{type:"double",name:n}}else if(e.op==="!"){const r=this.coerceToI1(t);return this.emit(`${n} = xor i1 ${r.name}, 1`),{type:"i1",name:n}}return t}case"e_call":{if(e.callee.kind==="e_var"){const l=e.callee.modulePath&&e.callee.modulePath.length>0?e.callee.modulePath.join("_"):"";let c=l?`${l}_${e.callee.name}`:e.callee.name;if(!l&&this.currentModulePrefix){const g=`${this.currentModulePrefix}_${e.callee.name}`;(this.functionDefinitions.has(g)||this.gadtConstructorTags.has(g))&&(c=g)}if(c==="print"||c==="println"||c==="log"||c==="console_log"){const g=e.args.map(h=>this.lowerExpr(h));for(const h of g)if(h.type==="i8*")this.emit(`call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* ${h.name})`);else if(h.type==="double")this.emit(`call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_num, i64 0, i64 0), double ${h.name})`);else if(h.type==="i64"||h.type==="i32")this.emit(`call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([6 x i8], [6 x i8]* @.fmt_int, i64 0, i64 0), ${h.type} ${h.name})`);else if(h.type==="i1"){const T=this.freshReg();this.emit(`${T} = select i1 ${h.name}, i8* getelementptr inbounds ([6 x i8], [6 x i8]* @.fmt_bool_t, i64 0, i64 0), i8* getelementptr inbounds ([7 x i8], [7 x i8]* @.fmt_bool_f, i64 0, i64 0)`),this.emit(`call i32 (i8*, ...) @printf(i8* ${T})`)}else{const T=this.castToI8Ptr(h);this.emit(`call i32 (i8*, ...) @printf(i8* getelementptr inbounds ([4 x i8], [4 x i8]* @.fmt_str, i64 0, i64 0), i8* ${T})`)}return{type:"void",name:""}}if(c==="str_concat"||c==="concat"){const g=this.lowerExpr(e.args[0]),h=this.lowerExpr(e.args[1]),T=this.convertToStringPtr(g),L=this.convertToStringPtr(h),A=this.freshReg();this.emit(`${A} = call i64 @strlen(i8* ${T})`);const V=this.freshReg();this.emit(`${V} = call i64 @strlen(i8* ${L})`);const I=this.freshReg();this.emit(`${I} = add i64 ${A}, ${V}`);const P=this.freshReg();this.emit(`${P} = add i64 ${I}, 1`);const $=this.freshReg();this.emit(`${$} = call i8* @malloc(i64 ${P})`);const b=this.freshReg();this.emit(`${b} = call i8* @strcpy(i8* ${$}, i8* ${T})`);const S=this.freshReg();return this.emit(`${S} = call i8* @strcat(i8* ${$}, i8* ${L})`),{type:"i8*",name:$}}if(c==="to_string"){const g=e.args.length>0?this.lowerExpr(e.args[0]):{type:"i8*",name:"null"};return{type:"i8*",name:this.convertToStringPtr(g)}}if(c==="String_parseFloat"||c==="parseFloat"){const g=e.args.length>0?this.lowerExpr(e.args[0]):{type:"i8*",name:"null"},h=this.convertToStringPtr(g),T=this.freshReg();return this.emit(`${T} = call double @atof(i8* ${h})`),{type:"double",name:T}}if(c==="parseInt"||c==="String_parseInt"){const g=e.args.length>0?this.lowerExpr(e.args[0]):{type:"i8*",name:"null"},h=this.convertToStringPtr(g),T=this.freshReg();this.emit(`${T} = call i64 @atoll(i8* ${h})`);const L=this.freshReg();return this.emit(`${L} = sitofp i64 ${T} to double`),{type:"double",name:L}}if(c==="h"||c==="createElement"){this.externalDeclarations.has("h")||this.externalDeclarations.set("h",{paramTypes:["i8*","i8*","i8*"],retType:"i8*"});const g=e.args.length>0?this.castToI8Ptr(this.lowerExpr(e.args[0])):"null",h=e.args.length>1?this.castToI8Ptr(this.lowerExpr(e.args[1])):"null",T=e.args.length>2?this.castToI8Ptr(this.lowerExpr(e.args[2])):"null",L=this.freshReg();return this.emit(`${L} = call i8* @h(i8* ${g}, i8* ${h}, i8* ${T})`),{type:"i8*",name:L}}if(c==="Array_len"||c==="Array_length"||c==="len"||c==="length"){const g=this.lowerExpr(e.args[0]);if(g.type==="%struct.Array*"){const h=this.freshReg();this.emit(`${h} = getelementptr inbounds %struct.Array, %struct.Array* ${g.name}, i32 0, i32 0`);const T=this.freshReg();this.emit(`${T} = load i64, i64* ${h}, align 8`);const L=this.freshReg();return this.emit(`${L} = sitofp i64 ${T} to double`),{type:"double",name:L}}else{const h=this.castToI8Ptr(g),T=this.freshReg();this.emit(`${T} = bitcast i8* ${h} to %struct.Array*`);const L=this.freshReg();this.emit(`${L} = getelementptr inbounds %struct.Array, %struct.Array* ${T}, i32 0, i32 0`);const A=this.freshReg();this.emit(`${A} = load i64, i64* ${L}, align 8`);const V=this.freshReg();return this.emit(`${V} = sitofp i64 ${A} to double`),{type:"double",name:V}}}if(c==="Array_join"||c==="join"){const g=this.lowerExpr(e.args[0]),h=e.args.length>1?this.convertToStringPtr(this.lowerExpr(e.args[1])):"null";let T=g.name;if(g.type!=="%struct.Array*"){const A=this.freshReg(),V=this.castToI8Ptr(g);this.emit(`${A} = bitcast i8* ${V} to %struct.Array*`),T=A}const L=this.freshReg();return this.emit(`${L} = call i8* @_tl_array_join(%struct.Array* ${T}, i8* ${h})`),{type:"i8*",name:L}}if(c==="Array_push"||c==="push"&&e.args.length>=2){const g=this.lowerExpr(e.args[0]),h=e.args.length>1?this.castToI8Ptr(this.lowerExpr(e.args[1])):"null";let T=g.name;if(g.type!=="%struct.Array*"){const A=this.freshReg(),V=this.castToI8Ptr(g);this.emit(`${A} = bitcast i8* ${V} to %struct.Array*`),T=A}const L=this.freshReg();return this.emit(`${L} = call %struct.Array* @_tl_array_push(%struct.Array* ${T}, i8* ${h})`),{type:"%struct.Array*",name:L}}if(c==="math_sqrt"||c==="Math_sqrt"||c==="sqrt"){const g=this.coerceToDouble(this.lowerExpr(e.args[0])),h=this.freshReg();return this.emit(`${h} = call double @llvm.sqrt.f64(double ${g.name})`),{type:"double",name:h}}if(c==="math_pow"||c==="Math_pow"||c==="pow"){const g=this.coerceToDouble(this.lowerExpr(e.args[0])),h=this.coerceToDouble(this.lowerExpr(e.args[1])),T=this.freshReg();return this.emit(`${T} = call double @llvm.pow.f64(double ${g.name}, double ${h.name})`),{type:"double",name:T}}if(c==="math_abs"||c==="Math_abs"||c==="abs"){const g=this.coerceToDouble(this.lowerExpr(e.args[0])),h=this.freshReg();return this.emit(`${h} = call double @llvm.fabs.f64(double ${g.name})`),{type:"double",name:h}}if(c==="math_floor"||c==="Math_floor"||c==="floor"){const g=this.coerceToDouble(this.lowerExpr(e.args[0])),h=this.freshReg();return this.emit(`${h} = call double @llvm.floor.f64(double ${g.name})`),{type:"double",name:h}}if(c==="math_ceil"||c==="Math_ceil"||c==="ceil"){const g=this.coerceToDouble(this.lowerExpr(e.args[0])),h=this.freshReg();return this.emit(`${h} = call double @llvm.ceil.f64(double ${g.name})`),{type:"double",name:h}}if(c==="math_sin"||c==="Math_sin"||c==="sin"){const g=this.coerceToDouble(this.lowerExpr(e.args[0])),h=this.freshReg();return this.emit(`${h} = call double @llvm.sin.f64(double ${g.name})`),{type:"double",name:h}}if(c==="math_cos"||c==="Math_cos"||c==="cos"){const g=this.coerceToDouble(this.lowerExpr(e.args[0])),h=this.freshReg();return this.emit(`${h} = call double @llvm.cos.f64(double ${g.name})`),{type:"double",name:h}}const u=this.gadtConstructorTags.get(c)||this.gadtConstructorTags.get(e.callee.name);if(u){const g=e.args.map(h=>this.lowerExpr(h));return this.constructGADT(u.tag,g)}let p=this.functionDefinitions.get(c);if(!p&&!l&&this.currentModulePrefix){const g=`${this.currentModulePrefix}_${e.callee.name}`;p=this.functionDefinitions.get(g)}if(!p&&!l&&(p=this.functionDefinitions.get(e.callee.name)),p){const g=p.sig,h=[];for(let A=0;A<e.args.length;A++){const V=this.lowerExpr(e.args[A]),I=g.paramTypes[A]||V.type;if(V.type!==I)if(I==="i8*"){const P=this.castToI8Ptr(V);h.push({type:"i8*",name:P})}else if(I==="double")h.push(this.coerceToDouble(V));else if(I==="i1")h.push(this.coerceToI1(V));else if(I.endsWith("*"))if(V.type==="i8*"){const P=this.castFromI8Ptr(V.name,I);h.push({type:I,name:P})}else{const P=this.castToI8Ptr(V),$=this.freshReg();this.emit(`${$} = bitcast i8* ${P} to ${I}`),h.push({type:I,name:$})}else h.push(V);else h.push(V)}const T=h.map(A=>`${A.type} ${A.name}`).join(", "),L=this.freshReg();return g.retType==="void"?(this.emit(`call void @${p.symbol}(${T})`),{type:"void",name:""}):(this.emit(`${L} = call ${g.retType} @${p.symbol}(${T})`),{type:g.retType,name:L})}const d=this.varAllocaMap.get(c)||this.varAllocaMap.get(e.callee.name);if(d){const g=this.freshReg();this.emit(`${g} = load ${d.type}, ${d.type}* ${d.reg}, align 8`);const h=e.args.map(I=>this.lowerExpr(I)),T=h.map(()=>"i8*"),L=this.freshReg();this.emit(`${L} = bitcast ${d.type} ${g} to i8* (${T.join(", ")})*`);const A=h.map(I=>I.type!=="i8*"?`i8* ${this.castToI8Ptr(I)}`:`i8* ${I.name}`),V=this.freshReg();return this.emit(`${V} = call i8* ${L}(${A.join(", ")})`),{type:"i8*",name:V}}let f=this.externalDeclarations.get(c);f||(f={paramTypes:e.args.map(h=>this.lowerExpr(h)).map(h=>h.type==="void"?"i8*":h.type),retType:"double"},this.externalDeclarations.set(c,f));const m=[];for(let g=0;g<e.args.length;g++){const h=this.lowerExpr(e.args[g]),T=f.paramTypes[g]||"double";h.type!==T?T==="double"?m.push(this.coerceToDouble(h)):T==="i8*"?m.push({type:"i8*",name:this.castToI8Ptr(h)}):T==="i1"?m.push(this.coerceToI1(h)):m.push(h):m.push(h)}const y=m.map(g=>`${g.type} ${g.name}`).join(", "),_=this.freshReg();return this.emit(`${_} = call ${f.retType} @${c}(${y})`),{type:f.retType,name:_}}if(e.callee.kind==="e_field_access"){const l=e.callee.field;if(l==="push"){const c=this.lowerExpr(e.callee.object),u=e.args.length>0?this.castToI8Ptr(this.lowerExpr(e.args[0])):"null";let p=c.name;if(c.type!=="%struct.Array*"){const f=this.freshReg(),m=this.castToI8Ptr(c);this.emit(`${f} = bitcast i8* ${m} to %struct.Array*`),p=f}const d=this.freshReg();return this.emit(`${d} = call %struct.Array* @_tl_array_push(%struct.Array* ${p}, i8* ${u})`),{type:"%struct.Array*",name:d}}if(l==="join"){const c=this.lowerExpr(e.callee.object),u=e.args.length>0?this.convertToStringPtr(this.lowerExpr(e.args[0])):"null";let p=c.name;if(c.type!=="%struct.Array*"){const f=this.freshReg(),m=this.castToI8Ptr(c);this.emit(`${f} = bitcast i8* ${m} to %struct.Array*`),p=f}const d=this.freshReg();return this.emit(`${d} = call i8* @_tl_array_join(%struct.Array* ${p}, i8* ${u})`),{type:"i8*",name:d}}}const t=this.lowerExpr(e.callee),n=e.args.map(l=>this.lowerExpr(l)),r=n.map(()=>"i8*"),s=this.freshReg();this.emit(`${s} = bitcast ${t.type} ${t.name} to i8* (${r.join(", ")})*`);const i=n.map(l=>l.type!=="i8*"?`i8* ${this.castToI8Ptr(l)}`:`i8* ${l.name}`),o=this.freshReg();return this.emit(`${o} = call i8* ${s}(${i.join(", ")})`),{type:"i8*",name:o}}case"e_lambda":{const t=`.lambda_${++this.lambdaCounter}`,n=this.generateLambda(t,e);this.extraFunctionsCode.push(n);const s=`i8* (${e.params.map(()=>"i8*").join(", ")})*`,i=this.freshReg();return this.emit(`${i} = bitcast ${s} @${t} to i8*`),{type:"i8*",name:i}}case"e_if":{const t=this.coerceToI1(this.lowerExpr(e.cond)),n=this.freshBlock("then"),r=this.freshBlock("else"),s=this.freshBlock("if.merge");this.emitCondBranch(t.name,n,r),this.startBlock(n);const i=this.lowerExpr(e.thenExpr),o=this.currentBlock.name;this.startBlock(r);const l=e.elseExpr?this.lowerExpr(e.elseExpr):{type:"void",name:""},c=this.currentBlock.name;if(i.type==="void"||!e.elseExpr||l.type==="void")return this.startBlock(o),this.emitBranch(s),this.startBlock(c),this.emitBranch(s),this.startBlock(s),{type:"void",name:""};let u=i.type;i.type!==l.type&&(i.type==="double"&&(l.type==="i32"||l.type==="i64")||l.type==="double"&&(i.type==="i32"||i.type==="i64")?u="double":u="i8*"),this.startBlock(o);const p=this.coerceToType(i,u);this.emitBranch(s);const d=this.currentBlock.name;this.startBlock(c);const f=this.coerceToType(l,u);this.emitBranch(s);const m=this.currentBlock.name;this.startBlock(s);const y=this.freshReg();return this.emit(`${y} = phi ${u} [ ${p.name}, %${d} ], [ ${f.name}, %${m} ]`),{type:u,name:y}}case"e_block":{let t={type:"void",name:""};for(const n of e.statements)if(n.kind==="s_expr"){if(t=this.lowerExpr(n.expr),n.expr.kind==="e_return")return t}else this.lowerTopLevelStatement(n);return e.result?this.lowerExpr(e.result):t}case"e_match":{const t=this.lowerExpr(e.scrutinee),n=this.freshBlock("match.default"),r=this.freshBlock("match.merge");let s=t.name;const i=t.type==="%struct.GADTValue*"||t.type.endsWith("*")||t.type==="i8*";if(i&&t.type!=="%struct.GADTValue*"){const V=this.freshReg(),I=this.castToI8Ptr(t);this.emit(`${V} = bitcast i8* ${I} to %struct.GADTValue*`),s=V}let o=this.freshReg();if(i){const V=this.freshReg();this.emit(`${V} = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* ${s}, i32 0, i32 0`),this.emit(`${o} = load i32, i32* ${V}, align 4`)}else o="0";const l=e.arms.map((V,I)=>this.freshBlock(`match.arm${I}`)),c=new Set,u=[];let p=n;e.arms.forEach((V,I)=>{if(V.pattern.kind==="p_ctor"){const P=this.gadtConstructorTags.get(V.pattern.name),$=P?P.tag:I;c.has($)||(c.add($),u.push(`i32 ${$}, label %${l[I]}`))}else V.pattern.kind==="p_wildcard"||V.pattern.kind==="p_var"?p=l[I]:c.has(I)||(c.add(I),u.push(`i32 ${I}, label %${l[I]}`))}),this.currentBlock.terminated||(this.currentBlock.instructions.push(`  switch i32 ${o}, label %${p} [ ${u.join(" ")} ]`),this.currentBlock.terminated=!0);const d=[];e.arms.forEach((V,I)=>{if(this.startBlock(l[I]),V.pattern.kind==="p_ctor"&&V.pattern.args&&V.pattern.args.length>0&&i){const $=this.freshReg();this.emit(`${$} = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* ${s}, i32 0, i32 1`);const b=this.freshReg();this.emit(`${b} = load i8*, i8** ${$}, align 8`),V.pattern.args.forEach((S,v)=>{if(S.kind==="p_var"){const R=this.freshReg();this.emit(`${R} = getelementptr inbounds i8, i8* ${b}, i64 ${v*8}`);const E=this.freshReg();this.emit(`${E} = bitcast i8* ${R} to i8**`);const k=this.freshReg();this.emit(`${k} = load i8*, i8** ${E}, align 8`);const O=this.freshReg();this.emitAlloca(`${O} = alloca i8*, align 8`),this.emit(`store i8* ${k}, i8** ${O}, align 8`),this.varAllocaMap.set(S.name,{type:"i8*",reg:O})}})}if(V.pattern.kind==="p_record"&&i){const $=this.castToI8Ptr(t);for(const b of V.pattern.fields||[]){const S=b.alias?b.alias:b.name,v=this.registerString(b.name),R=new TextEncoder().encode(b.name).length+1,E=this.freshReg();this.emit(`${E} = getelementptr inbounds [${R} x i8], [${R} x i8]* ${v}, i64 0, i64 0`);const k=this.freshReg();this.emit(`${k} = call i8* @_tl_record_get(i8* ${$}, i8* ${E})`);const O=this.freshReg();this.emitAlloca(`${O} = alloca i8*, align 8`),this.emit(`store i8* ${k}, i8** ${O}, align 8`),this.varAllocaMap.set(S,{type:"i8*",reg:O})}}if(V.guard){const $=this.coerceToI1(this.lowerExpr(V.guard)),b=this.freshBlock(`match.guard_pass${I}`),S=I+1<e.arms.length?l[I+1]:p;this.emitCondBranch($.name,b,S),this.startBlock(b)}const P=this.lowerExpr(V.body);d.push({armIndex:I,blockName:this.currentBlock.name,val:P})}),p===n&&(this.startBlock(n),d.push({armIndex:-1,blockName:n,val:{type:"i8*",name:"null"}}));const f=d.filter(V=>V.val.type!=="void");if(f.length===0)return d.forEach(V=>{this.startBlock(V.blockName),this.emitBranch(r)}),this.startBlock(r),{type:"void",name:""};let m="i8*";const y=f.some(V=>V.val.type==="double"),_=f.some(V=>V.val.type==="i1"),g=f.some(V=>V.val.type==="%struct.Array*"),h=f.some(V=>V.val.type==="%struct.GADTValue*");y?m="double":_?m="i1":g?m="%struct.Array*":h?m="%struct.GADTValue*":m="i8*";const T=[];d.forEach(V=>{this.startBlock(V.blockName);const I=this.coerceToType(V.val,m);this.emitBranch(r),T.push({label:this.currentBlock.name,valName:I.name})}),this.startBlock(r);const L=this.freshReg(),A=T.map(V=>`[ ${V.valName}, %${V.label} ]`).join(", ");return this.emit(`${L} = phi ${m} ${A}`),{type:m,name:L}}case"e_record":{const t=e.fields.length,n=8+t*16,r=this.freshReg();this.emit(`${r} = call i8* @malloc(i64 ${n})`);const s=this.freshReg();this.emit(`${s} = bitcast i8* ${r} to i64*`),this.emit(`store i64 ${t}, i64* ${s}, align 8`);for(let i=0;i<t;i++){const o=e.fields[i],l=this.registerString(o.name),c=new TextEncoder().encode(o.name).length+1,u=this.freshReg();this.emit(`${u} = getelementptr inbounds [${c} x i8], [${c} x i8]* ${l}, i64 0, i64 0`);const p=this.lowerExpr(o.value),d=this.castToI8Ptr(p),f=this.freshReg();this.emit(`${f} = getelementptr inbounds i8, i8* ${r}, i64 ${8+i*16}`);const m=this.freshReg();this.emit(`${m} = bitcast i8* ${f} to i8**`),this.emit(`store i8* ${u}, i8** ${m}, align 8`);const y=this.freshReg();this.emit(`${y} = getelementptr inbounds i8, i8* ${r}, i64 ${16+i*16}`);const _=this.freshReg();this.emit(`${_} = bitcast i8* ${y} to i8**`),this.emit(`store i8* ${d}, i8** ${_}, align 8`)}return{type:"i8*",name:r}}case"e_record_update":{const t=e.updates.length,n=8+(t+4)*16,r=this.freshReg();this.emit(`${r} = call i8* @malloc(i64 ${n})`);for(let s=0;s<t;s++){const i=e.updates[s],o=this.registerString(i.name),l=new TextEncoder().encode(i.name).length+1,c=this.freshReg();this.emit(`${c} = getelementptr inbounds [${l} x i8], [${l} x i8]* ${o}, i64 0, i64 0`);const u=this.lowerExpr(i.value),p=this.castToI8Ptr(u),d=this.freshReg();this.emit(`${d} = getelementptr inbounds i8, i8* ${r}, i64 ${8+s*16}`);const f=this.freshReg();this.emit(`${f} = bitcast i8* ${d} to i8**`),this.emit(`store i8* ${c}, i8** ${f}, align 8`);const m=this.freshReg();this.emit(`${m} = getelementptr inbounds i8, i8* ${r}, i64 ${16+s*16}`);const y=this.freshReg();this.emit(`${y} = bitcast i8* ${m} to i8**`),this.emit(`store i8* ${p}, i8** ${y}, align 8`)}return{type:"i8*",name:r}}case"e_tuple":{const t=e.elements.length,n=this.freshReg();this.emit(`${n} = call i8* @malloc(i64 16)`);const r=this.freshReg();this.emit(`${r} = bitcast i8* ${n} to %struct.Array*`);const s=this.freshReg();this.emit(`${s} = getelementptr inbounds %struct.Array, %struct.Array* ${r}, i32 0, i32 0`),this.emit(`store i64 ${t}, i64* ${s}, align 8`);const i=Math.max(16,t*8),o=this.freshReg();this.emit(`${o} = call i8* @malloc(i64 ${i})`);for(let u=0;u<t;u++){const p=this.lowerExpr(e.elements[u]),d=this.castToI8Ptr(p),f=this.freshReg();this.emit(`${f} = getelementptr inbounds i8, i8* ${o}, i64 ${u*8}`);const m=this.freshReg();this.emit(`${m} = bitcast i8* ${f} to i8**`),this.emit(`store i8* ${d}, i8** ${m}, align 8`)}const l=this.freshReg();this.emit(`${l} = getelementptr inbounds %struct.Array, %struct.Array* ${r}, i32 0, i32 1`);const c=this.freshReg();return this.emit(`${c} = bitcast i8* ${o} to i8**`),this.emit(`store i8** ${c}, i8*** ${l}, align 8`),{type:"%struct.Array*",name:r}}case"e_index":{const t=this.lowerExpr(e.target),n=this.lowerExpr(e.index),r=this.freshReg();if(n.type==="double"?this.emit(`${r} = fptosi double ${n.name} to i64`):n.type==="i32"?this.emit(`${r} = sext i32 ${n.name} to i64`):n.type==="i64"?this.emit(`${r} = add i64 ${n.name}, 0`):this.emit(`${r} = add i64 0, 0`),t.type==="%struct.Array*"||t.type.endsWith("*")||t.type==="i8*"){const s=t.type==="%struct.Array*"?t.name:(()=>{const u=this.castToI8Ptr(t),p=this.freshReg();return this.emit(`${p} = bitcast i8* ${u} to %struct.Array*`),p})(),i=this.freshReg();this.emit(`${i} = getelementptr inbounds %struct.Array, %struct.Array* ${s}, i32 0, i32 1`);const o=this.freshReg();this.emit(`${o} = load i8**, i8*** ${i}, align 8`);const l=this.freshReg();this.emit(`${l} = getelementptr inbounds i8*, i8** ${o}, i64 ${r}`);const c=this.freshReg();return this.emit(`${c} = load i8*, i8** ${l}, align 8`),{type:"i8*",name:c}}return{type:"double",name:"0.0"}}case"e_field_access":{const t=this.lowerExpr(e.object);if(e.field==="length"||e.field==="len"){if(t.type.endsWith("*")||t.type==="i8*"){const l=t.type==="%struct.Array*"?t.name:(()=>{const d=this.castToI8Ptr(t),f=this.freshReg();return this.emit(`${f} = bitcast i8* ${d} to %struct.Array*`),f})(),c=this.freshReg();this.emit(`${c} = getelementptr inbounds %struct.Array, %struct.Array* ${l}, i32 0, i32 0`);const u=this.freshReg();this.emit(`${u} = load i64, i64* ${c}, align 8`);const p=this.freshReg();return this.emit(`${p} = sitofp i64 ${u} to double`),{type:"double",name:p}}return{type:"double",name:"0.0"}}const n=this.castToI8Ptr(t),r=this.registerString(e.field),s=new TextEncoder().encode(e.field).length+1,i=this.freshReg();this.emit(`${i} = getelementptr inbounds [${s} x i8], [${s} x i8]* ${r}, i64 0, i64 0`);const o=this.freshReg();return this.emit(`${o} = call i8* @_tl_record_get(i8* ${n}, i8* ${i})`),{type:"i8*",name:o}}case"e_assign":{if(e.target.kind==="e_var"){const t=e.target.name;let n=this.varAllocaMap.get(t);const r=this.lowerExpr(e.value);let s=n?void 0:this.globalVariables.get(t)||(this.currentModulePrefix?this.globalVariables.get(`${this.currentModulePrefix}_${t}`):void 0);if(!n&&!s){const o=r.type==="void"?"double":r.type,l=this.freshReg();this.emitAlloca(`${l} = alloca ${o}, align 8`),n={type:o,reg:l},this.varAllocaMap.set(t,n)}let i=r;if(e.op&&e.op!=="="){const o=this.lowerExpr(e.target),l=e.op[0],c=this.freshReg(),u=this.coerceToDouble(o),p=this.coerceToDouble(r);l==="+"?this.emit(`${c} = fadd double ${u.name}, ${p.name}`):l==="-"?this.emit(`${c} = fsub double ${u.name}, ${p.name}`):l==="*"?this.emit(`${c} = fmul double ${u.name}, ${p.name}`):l==="/"&&this.emit(`${c} = fdiv double ${u.name}, ${p.name}`),i={type:"double",name:c}}if(s){const o=this.coerceToType(i,s.type);return this.emit(`store ${s.type} ${o.name}, ${s.type}* @${s.symbol}, align 8`),i}if(n)if(i.type!==n.type)if(n.type==="i8*"){const o=this.castToI8Ptr(i);this.emit(`store i8* ${o}, i8** ${n.reg}, align 8`)}else if(i.type==="i8*"){const o=this.castFromI8Ptr(i.name,n.type);this.emit(`store ${n.type} ${o}, ${n.type}* ${n.reg}, align 8`)}else if(n.type==="double"){const o=this.coerceToDouble(i);this.emit(`store double ${o.name}, double* ${n.reg}, align 8`)}else if(n.type==="i1"){const o=this.coerceToI1(i);this.emit(`store i1 ${o.name}, i1* ${n.reg}, align 8`)}else if(n.type.endsWith("*")){const o=this.castToI8Ptr(i),l=this.freshReg();this.emit(`${l} = bitcast i8* ${o} to ${n.type}`),this.emit(`store ${n.type} ${l}, ${n.type}* ${n.reg}, align 8`)}else this.emit(`store ${n.type} ${i.name}, ${n.type}* ${n.reg}, align 8`);else this.emit(`store ${n.type} ${i.name}, ${n.type}* ${n.reg}, align 8`);return i}else if(e.target.kind==="e_index"){const t=this.lowerExpr(e.target.target),n=this.lowerExpr(e.target.index),r=this.lowerExpr(e.value),s=this.castToI8Ptr(r),i=this.freshReg();if(n.type==="double"?this.emit(`${i} = fptosi double ${n.name} to i64`):n.type==="i32"?this.emit(`${i} = sext i32 ${n.name} to i64`):n.type==="i64"?this.emit(`${i} = add i64 ${n.name}, 0`):this.emit(`${i} = add i64 0, 0`),t.type==="%struct.Array*"||t.type.endsWith("*")||t.type==="i8*"){const o=t.type==="%struct.Array*"?t.name:(()=>{const p=this.castToI8Ptr(t),d=this.freshReg();return this.emit(`${d} = bitcast i8* ${p} to %struct.Array*`),d})(),l=this.freshReg();this.emit(`${l} = getelementptr inbounds %struct.Array, %struct.Array* ${o}, i32 0, i32 1`);const c=this.freshReg();this.emit(`${c} = load i8**, i8*** ${l}, align 8`);const u=this.freshReg();this.emit(`${u} = getelementptr inbounds i8*, i8** ${c}, i64 ${i}`),this.emit(`store i8* ${s}, i8** ${u}, align 8`)}return r}return{type:"void",name:""}}case"e_switch":{const t=this.lowerExpr(e.discriminant),n=this.freshBlock("switch.merge"),r=[];let s=this.freshBlock("switch.cond");this.emitBranch(s);for(let c=0;c<e.cases.length;c++){const u=e.cases[c],p=this.freshBlock(`switch.body${c}`),d=this.freshBlock(`switch.case_next${c+1}`),f=u.values&&u.values.length>0?u.values:u.value?[u.value]:[];let m=s;for(let _=0;_<f.length;_++){this.startBlock(m);const g=this.lowerExpr(f[_]),h=this.freshReg();if(t.type.endsWith("*")&&g.type.endsWith("*")){const L=this.castToI8Ptr(t),A=this.castToI8Ptr(g);this.emit(`${h} = icmp eq i8* ${L}, ${A}`)}else{const L=this.coerceToDouble(t),A=this.coerceToDouble(g);this.emit(`${h} = fcmp oeq double ${L.name}, ${A.name}`)}const T=_+1<f.length?this.freshBlock(`switch.or${c}_${_+1}`):d;this.emitCondBranch(h,p,T),m=T}this.startBlock(p);const y=this.lowerExpr(u.body);r.push({val:y,block:this.currentBlock.name}),s=d}if(this.startBlock(s),e.defaultCase){const c=this.lowerExpr(e.defaultCase);r.push({val:c,block:this.currentBlock.name})}else r.push({val:{type:"void",name:""},block:this.currentBlock.name});const i=r.filter(c=>c.val.type!=="void");if(i.length===0){for(const c of r)this.startBlock(c.block),this.emitBranch(n);return this.startBlock(n),{type:"void",name:""}}let o=i[0].val.type;for(const c of i)c.val.type!==o&&(c.val.type==="double"||o==="double"?o="double":c.val.type==="i1"||o==="i1"?o="i1":o="i8*");const l=[];for(const c of r){if(this.startBlock(c.block),c.val.type==="void"){this.emitBranch(n);continue}const u=this.coerceToType(c.val,o);this.emitBranch(n),l.push(`[ ${u.name}, %${this.currentBlock.name} ]`)}if(this.startBlock(n),l.length>0){const c=this.freshReg();return this.emit(`${c} = phi ${o} ${l.join(", ")}`),{type:o,name:c}}return{type:"void",name:""}}case"e_range":{const t=this.lowerExpr(e.start),n=this.lowerExpr(e.end),r=this.freshReg();t.type==="double"?this.emit(`${r} = fptosi double ${t.name} to i64`):this.emit(`${r} = add i64 0, 0`);const s=this.freshReg();n.type==="double"?this.emit(`${s} = fptosi double ${n.name} to i64`):this.emit(`${s} = add i64 0, 0`);const i=this.freshReg();this.emit(`${i} = icmp sle i64 ${r}, ${s}`);const o=this.freshReg();e.inclusive?this.emit(`${o} = add i64 ${s}, 0`):this.emit(`${o} = sub i64 ${s}, 1`);const l=this.freshReg();e.inclusive?this.emit(`${l} = add i64 ${s}, 0`):this.emit(`${l} = add i64 ${s}, 1`);const c=this.freshReg();this.emit(`${c} = select i1 ${i}, i64 ${o}, i64 ${l}`);const u=this.freshReg();this.emit(`${u} = sub i64 ${c}, ${r}`);const p=this.freshReg();this.emit(`${p} = add i64 ${u}, 1`);const d=this.freshReg();this.emit(`${d} = icmp sge i64 ${c}, ${r}`);const f=this.freshReg();this.emit(`${f} = select i1 ${d}, i64 ${p}, i64 0`);const m=this.freshReg();this.emit(`${m} = sub i64 ${r}, ${c}`);const y=this.freshReg();this.emit(`${y} = add i64 ${m}, 1`);const _=this.freshReg();this.emit(`${_} = icmp sle i64 ${c}, ${r}`);const g=this.freshReg();this.emit(`${g} = select i1 ${_}, i64 ${y}, i64 0`);const h=this.freshReg();this.emit(`${h} = select i1 ${i}, i64 ${f}, i64 ${g}`);const T=this.freshReg();this.emit(`${T} = call i8* @malloc(i64 16)`);const L=this.freshReg();this.emit(`${L} = bitcast i8* ${T} to %struct.Array*`);const A=this.freshReg();this.emit(`${A} = getelementptr inbounds %struct.Array, %struct.Array* ${L}, i32 0, i32 0`),this.emit(`store i64 ${h}, i64* ${A}, align 8`);const V=this.freshReg();this.emit(`${V} = mul i64 ${h}, 8`);const I=this.freshReg(),P=this.freshReg();this.emit(`${P} = icmp eq i64 ${V}, 0`),this.emit(`${I} = select i1 ${P}, i64 16, i64 ${V}`);const $=this.freshReg();this.emit(`${$} = call i8* @malloc(i64 ${I})`);const b=this.freshReg();this.emit(`${b} = getelementptr inbounds %struct.Array, %struct.Array* ${L}, i32 0, i32 1`);const S=this.freshReg();return this.emit(`${S} = bitcast i8* ${$} to i8**`),this.emit(`store i8** ${S}, i8*** ${b}, align 8`),{type:"%struct.Array*",name:L}}case"e_list_comp":return{type:"%struct.Array*",name:"null"};case"e_for":{const t=e.init,n=e.cond,r=e.update,s=e.body;t&&("kind"in t&&typeof t.kind=="string"&&t.kind.startsWith("s_")?this.lowerTopLevelStatement(t):this.lowerExpr(t));const i=this.freshBlock("for.cond"),o=this.freshBlock("for.body"),l=r?this.freshBlock("for.step"):i,c=this.freshBlock("for.merge");if(this.loopStack.push({condBlock:l,mergeBlock:c}),this.emitBranch(i),this.startBlock(i),n){const u=this.coerceToI1(this.lowerExpr(n));this.emitCondBranch(u.name,o,c)}else this.emitBranch(o);return this.startBlock(o),this.lowerExpr(s),r&&(this.emitBranch(l),this.startBlock(l),this.lowerExpr(r)),this.emitBranch(i),this.loopStack.pop(),this.startBlock(c),{type:"void",name:""}}case"e_while":{const t=this.freshBlock("while.cond"),n=this.freshBlock("while.body"),r=this.freshBlock("while.merge");this.loopStack.push({condBlock:t,mergeBlock:r}),this.emitBranch(t),this.startBlock(t);const s=this.coerceToI1(this.lowerExpr(e.cond));return this.emitCondBranch(s.name,n,r),this.startBlock(n),this.lowerExpr(e.body),this.emitBranch(t),this.loopStack.pop(),this.startBlock(r),{type:"void",name:""}}case"e_break":{const t=this.loopStack[this.loopStack.length-1];if(t){this.emitBranch(t.mergeBlock);const n=this.freshBlock("dead.break");this.startBlock(n)}return{type:"void",name:""}}case"e_continue":{const t=this.loopStack[this.loopStack.length-1];if(t){this.emitBranch(t.condBlock);const n=this.freshBlock("dead.continue");this.startBlock(n)}return{type:"void",name:""}}case"e_return":{const t=e.value||e.expr;return t?this.lowerExpr(t):{type:"void",name:""}}case"e_do":{const t=desugarDo(e);return this.lowerExpr(t)}case"e_where":{const t=e;if(t.bindings)for(const n of t.bindings)this.lowerTopLevelStatement(n);return this.lowerExpr(t.expr)}default:return{type:"double",name:"0.0"}}}generateLambda(e,t){const n=this.blocks,r=this.currentBlock,s=new Map(this.varAllocaMap),i=[...this.entryAllocas];this.blocks=[],this.currentBlock=null,this.entryAllocas=[],this.varAllocaMap.clear();const o=t.params.map(p=>`i8* %arg.${p.name}`),l=[`define internal i8* @${e}(${o.join(", ")}) {`];this.startBlock("entry");for(const p of t.params){const d=this.llvmTypeFromAST(p.type),f=this.freshReg();if(this.emitAlloca(`${f} = alloca ${d}, align 8`),d==="i8*")this.emit(`store i8* %arg.${p.name}, i8** ${f}, align 8`);else{const m=this.castFromI8Ptr(`%arg.${p.name}`,d);this.emit(`store ${d} ${m}, ${d}* ${f}, align 8`)}this.varAllocaMap.set(p.name,{type:d,reg:f})}const c=this.lowerExpr(t.body),u=this.castToI8Ptr(c);this.emitRet("i8*",u),this.finalizeBlocks("i8*");for(let p=0;p<this.blocks.length;p++){const d=this.blocks[p];l.push(`${d.name}:`),p===0&&this.entryAllocas.length>0&&l.push(...this.entryAllocas),l.push(...d.instructions)}return l.push(`}
`),this.blocks=n,this.currentBlock=r,this.varAllocaMap=s,this.entryAllocas=i,l.join(`
`)}constructGADT(e,t){const n=this.freshReg();this.emit(`${n} = call i8* @malloc(i64 16)`);const r=this.freshReg();this.emit(`${r} = bitcast i8* ${n} to %struct.GADTValue*`);const s=this.freshReg();if(this.emit(`${s} = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* ${r}, i32 0, i32 0`),this.emit(`store i32 ${e}, i32* ${s}, align 4`),t.length>0){const i=t.length*8,o=this.freshReg();this.emit(`${o} = call i8* @malloc(i64 ${i})`);for(let c=0;c<t.length;c++){const u=t[c],p=this.castToI8Ptr(u),d=this.freshReg();this.emit(`${d} = getelementptr inbounds i8, i8* ${o}, i64 ${c*8}`);const f=this.freshReg();this.emit(`${f} = bitcast i8* ${d} to i8**`),this.emit(`store i8* ${p}, i8** ${f}, align 8`)}const l=this.freshReg();this.emit(`${l} = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* ${r}, i32 0, i32 1`),this.emit(`store i8* ${o}, i8** ${l}, align 8`)}else{const i=this.freshReg();this.emit(`${i} = getelementptr inbounds %struct.GADTValue, %struct.GADTValue* ${r}, i32 0, i32 1`),this.emit(`store i8* null, i8** ${i}, align 8`)}return{type:"%struct.GADTValue*",name:r}}}const STDLIB_MODULES=new Set(["Math","Array","String","Option","Result","Either","Reader","Writer","State","Task"]),PRELUDE_CTORS=new Set(["Some","None","Ok","Err","Left","Right"]),C_RESERVED_WORDS=new Set(["auto","break","case","char","const","continue","default","do","double","else","enum","extern","float","for","goto","if","inline","int","long","register","restrict","return","short","signed","sizeof","static","struct","switch","typedef","union","unsigned","void","volatile","while","_Alignas","_Alignof","_Atomic","_Bool","_Complex","_Generic","_Imaginary","_Noreturn","_Static_assert","_Thread_local","alignas","alignof","and","and_eq","asm","bitand","bitor","bool","catch","char8_t","char16_t","char32_t","class","compl","concept","consteval","constexpr","constinit","const_cast","co_await","co_return","co_yield","decltype","delete","dynamic_cast","explicit","export","false","friend","mutable","namespace","new","noexcept","not","not_eq","nullptr","operator","or","or_eq","override","private","protected","public","reflexpr","reinterpret_cast","requires","static_assert","static_cast","template","this","thread_local","throw","true","try","typeid","typename","using","virtual","wchar_t","xor","xor_eq","final","import","module","main","NULL","stdin","stdout","stderr"]);function sanitizeCIdent(a){return!a||typeof a!="string"?"_val":C_RESERVED_WORDS.has(a)||/^[0-9]/.test(a)?`_tl_${a}`:a.replace(/[^a-zA-Z0-9_]/g,"_")}function collectPatternVarNames(a){if(!a)return[];switch(a.kind){case"p_var":return[a.name];case"p_ctor":{const e=[];for(const t of a.args||[])e.push(...collectPatternVarNames(t));return e}case"p_tuple":{const e=[];for(const t of a.elements||[])e.push(...collectPatternVarNames(t));return e}case"p_record":{const e=[];for(const t of a.fields||[]){const n=t.alias?t.alias:t.name;e.push(n)}return e}case"p_as":return[a.name,...collectPatternVarNames(a.pattern)];default:return[]}}class CCodeGenerator{constructor(){this.tempVarCounter=0,this.indentLevel=0,this.localScopeVars=[],this.isCpp=!0,this.insideFunction=!1,this.currentModulePath=[],this.zeroArityCtors=new Set(["None","Nil"]),this.lambdaDecls=[]}freshVar(e="_t"){return`${e}_${++this.tempVarCounter}`}indent(){return"  ".repeat(this.indentLevel)}pushScope(e=[]){this.localScopeVars.push(new Set(e.filter(Boolean)))}popScope(){this.localScopeVars.pop()}addLocalVar(e){e&&this.localScopeVars.length>0&&this.localScopeVars[this.localScopeVars.length-1].add(e)}isLocalVar(e){for(let t=this.localScopeVars.length-1;t>=0;t--)if(this.localScopeVars[t].has(e))return!0;return!1}getCIdent(e){const t=sanitizeCIdent(e);return!this.isCpp&&this.currentModulePath.length>0?`${this.currentModulePath.map(sanitizeCIdent).join("_")}_${t}`:t}collectForwardDecls(e,t=[]){var r,s,i;const n=[];for(const o of e)if(o){if(o.kind==="s_function"){const l=sanitizeCIdent(o.name),c=!this.isCpp&&t.length>0?`${t.map(sanitizeCIdent).join("_")}_${l}`:l,u=(o.params||[]).map(d=>{const f=sanitizeCIdent(d.name);return this.isCpp?`const TLValue& ${f}`:`TLValue ${f}`}),p=u.length>0?u.join(", "):this.isCpp?"":"void";(!this.isCpp||t.length===0)&&n.push(`TLValue ${c}(${p});`)}else if(o.kind==="s_gadt"){if((r=o.decl)!=null&&r.name){const l=sanitizeCIdent(o.decl.name),c=!this.isCpp&&t.length>0?`${t.map(sanitizeCIdent).join("_")}_${l}`:l;n.push(this.isCpp?`using ${l} = TLValue;`:`typedef TLValue ${c};`)}for(const l of((s=o.decl)==null?void 0:s.constructors)||[]){if(t.length===0&&PRELUDE_CTORS.has(l.name)){(!l.params||l.params.length===0)&&this.zeroArityCtors.add(l.name);continue}const c=sanitizeCIdent(l.name),u=!this.isCpp&&t.length>0?`${t.map(sanitizeCIdent).join("_")}_${c}`:c;if(!l.params||l.params.length===0)n.push(this.isCpp?`TLValue ${u}();`:`static inline TLValue ${u}(void);`),this.zeroArityCtors.add(l.name);else{const p=l.params.map(d=>{const f=sanitizeCIdent(d.name);return this.isCpp?`const TLValue& ${f}`:`TLValue ${f}`});n.push(this.isCpp?`TLValue ${u}(${p.join(", ")});`:`static inline TLValue ${u}(${p.join(", ")});`)}}}else if(o.kind==="s_type_alias"){if((i=o.decl)!=null&&i.name){const l=sanitizeCIdent(o.decl.name),c=!this.isCpp&&t.length>0?`${t.map(sanitizeCIdent).join("_")}_${l}`:l;n.push(this.isCpp?`using ${l} = TLValue;`:`typedef TLValue ${c};`)}}else if(o.kind==="s_let"){const l=sanitizeCIdent(o.name),c=!this.isCpp&&t.length>0?`${t.map(sanitizeCIdent).join("_")}_${l}`:l;n.push(`extern TLValue ${c};`)}else if(o.kind==="s_module")if(this.isCpp){const l=this.collectForwardDecls(o.body||[],[...t,o.name]);if(l.length>0){const c=sanitizeCIdent(o.name);n.push(`namespace ${c} {
  ${l.join(`
  `)}
}`)}}else{const l=[...t,o.name];n.push(...this.collectForwardDecls(o.body||[],l))}}return n}generate(e,t={target:"cpp",standard:"cpp17",includePrelude:!0,includeMain:!0}){this.tempVarCounter=0,this.indentLevel=0,this.localScopeVars=[],this.currentModulePath=[],this.zeroArityCtors=new Set(["None","Nil"]),this.lambdaDecls=[],this.isCpp=t.target!=="c";const n=[];t.includePrelude!==!1&&(n.push(this.isCpp?this.generateCppPrelude():this.generateCPrelude()),n.push("")),this.pushScope();const r=e&&e.statements?this.collectForwardDecls(e.statements):[],s=[],i=[];if(e&&e.statements){for(const o of e.statements)if(o)if(o.kind==="s_function"||o.kind==="s_gadt"||o.kind==="s_type_alias"||o.kind==="s_module"||o.kind==="s_import"||o.kind==="s_let"){const l=this.generateStatement(o);l.trim()&&s.push(l)}else{const l=this.generateStatement(o);l.trim()&&i.push(l)}}if(r.length>0&&(n.push("// Top-Level Function & Constructor Prototypes"),n.push(r.join(`
`)),n.push("")),this.lambdaDecls.length>0&&(n.push("// Generated Lambda Functions"),n.push(this.lambdaDecls.join(`

`)),n.push("")),s.length>0&&(n.push("// Top-Level Declarations & Modules"),n.push(s.join(`

`)),n.push("")),t.includeMain!==!1){if(n.push("// Entry Point"),n.push("int main(int argc, char** argv) {"),n.push("  // Initialize runtime environment"),n.push("  (void)argc; (void)argv;"),this.isCpp){n.push("  for (int i = 0; i < argc; ++i) { typelang::get_global_argv().push_back(argv[i]); }"),n.push("  try {"),this.indentLevel=2;for(const o of i)o.trim()&&n.push(o);this.indentLevel=0,n.push("  } catch (const typelang::__TLReturnSignal& r) {"),n.push("    (void)r;"),n.push("    return 0;"),n.push("  } catch (const std::exception& e) {"),n.push('    std::cerr << "Uncaught TypeLang Exception: " << e.what() << std::endl;'),n.push("    return 1;"),n.push("  }")}else{n.push("  _tl_argc = argc; _tl_argv = argv;"),this.indentLevel=1;for(const o of i)o.trim()&&n.push(o);this.indentLevel=0}n.push("  return 0;"),n.push("}")}else for(const o of i)o.trim()&&n.push(o);return this.popScope(),n.join(`
`)}generateCppPrelude(){return`// ============================================================================
// TypeLang Native C++ Target (C++17 / C++20 Compatible)
// Generated by TypeLang Native Multi-Target Compiler Backend
// ============================================================================
#include <iostream>
#include <string>
#include <fstream>
#include <vector>
#include <map>
#include <memory>
#include <variant>
#include <functional>
#include <cmath>
#include <sstream>
#include <iomanip>
#include <chrono>
#include <algorithm>
#include <cstdint>
#include <stdexcept>

namespace typelang {

class TLValue;

using TLFunction = std::function<TLValue(const std::vector<TLValue>&)>;
using TLRecord = std::map<std::string, TLValue>;
using TLArray = std::vector<TLValue>;

enum class TLKind {
  Null,
  Bool,
  Number,
  String,
  Array,
  Record,
  Variant,
  Function
};

struct TLVariantPayload {
  std::string tag;
  std::vector<TLValue> args;
  std::map<std::string, TLValue> fields;
};

class TLValue {
public:
  TLKind kind = TLKind::Null;
  bool bool_val = false;
  double num_val = 0.0;
  std::string str_val;
  std::shared_ptr<TLArray> arr_val;
  std::shared_ptr<TLRecord> rec_val;
  std::shared_ptr<TLVariantPayload> var_val;
  std::shared_ptr<TLFunction> fn_val;

  TLValue() : kind(TLKind::Null) {}
  TLValue(std::nullptr_t) : kind(TLKind::Null) {}
  explicit TLValue(bool b) : kind(TLKind::Bool), bool_val(b) {}
  TLValue(int n) : kind(TLKind::Number), num_val(static_cast<double>(n)) {}
  TLValue(int64_t n) : kind(TLKind::Number), num_val(static_cast<double>(n)) {}
  TLValue(size_t n) : kind(TLKind::Number), num_val(static_cast<double>(n)) {}
  TLValue(double d) : kind(TLKind::Number), num_val(d) {}
  TLValue(const char* s) : kind(TLKind::String), str_val(s ? s : "") {}
  TLValue(const std::string& s) : kind(TLKind::String), str_val(s) {}
  TLValue(const TLArray& a) : kind(TLKind::Array), arr_val(std::make_shared<TLArray>(a)) {}
  TLValue(const TLRecord& r) : kind(TLKind::Record), rec_val(std::make_shared<TLRecord>(r)) {}
  TLValue(TLFunction f) : kind(TLKind::Function), fn_val(std::make_shared<TLFunction>(f)) {}

  TLValue(const TLValue& other) = default;
  TLValue(TLValue& other) : TLValue(static_cast<const TLValue&>(other)) {}
  TLValue(TLValue&& other) = default;
  TLValue& operator=(const TLValue& other) = default;
  TLValue& operator=(TLValue&& other) = default;

  TLValue(TLValue (*fn)()) : kind(TLKind::Function) {
    fn_val = std::make_shared<TLFunction>([fn](const std::vector<TLValue>& args) -> TLValue {
      (void)args;
      return fn();
    });
  }

  TLValue(TLValue (*fn)(const TLValue&)) : kind(TLKind::Function) {
    fn_val = std::make_shared<TLFunction>([fn](const std::vector<TLValue>& args) -> TLValue {
      return fn(args.size() > 0 ? args[0] : TLValue());
    });
  }

  TLValue(TLValue (*fn)(TLValue)) : kind(TLKind::Function) {
    fn_val = std::make_shared<TLFunction>([fn](const std::vector<TLValue>& args) -> TLValue {
      return fn(args.size() > 0 ? args[0] : TLValue());
    });
  }

  TLValue(TLValue (*fn)(const TLValue&, const TLValue&)) : kind(TLKind::Function) {
    fn_val = std::make_shared<TLFunction>([fn](const std::vector<TLValue>& args) -> TLValue {
      return fn(args.size() > 0 ? args[0] : TLValue(), args.size() > 1 ? args[1] : TLValue());
    });
  }

  TLValue(TLValue (*fn)(TLValue, TLValue)) : kind(TLKind::Function) {
    fn_val = std::make_shared<TLFunction>([fn](const std::vector<TLValue>& args) -> TLValue {
      return fn(args.size() > 0 ? args[0] : TLValue(), args.size() > 1 ? args[1] : TLValue());
    });
  }

  TLValue(TLValue (*fn)(const TLValue&, const TLValue&, const TLValue&)) : kind(TLKind::Function) {
    fn_val = std::make_shared<TLFunction>([fn](const std::vector<TLValue>& args) -> TLValue {
      return fn(
        args.size() > 0 ? args[0] : TLValue(),
        args.size() > 1 ? args[1] : TLValue(),
        args.size() > 2 ? args[2] : TLValue()
      );
    });
  }

  TLValue(TLValue (*fn)(TLValue, TLValue, TLValue)) : kind(TLKind::Function) {
    fn_val = std::make_shared<TLFunction>([fn](const std::vector<TLValue>& args) -> TLValue {
      return fn(
        args.size() > 0 ? args[0] : TLValue(),
        args.size() > 1 ? args[1] : TLValue(),
        args.size() > 2 ? args[2] : TLValue()
      );
    });
  }

  static TLValue make_variant(const std::string& tag, const std::vector<TLValue>& args = {}, const std::map<std::string, TLValue>& fields = {}) {
    TLValue v;
    v.kind = TLKind::Variant;
    v.var_val = std::make_shared<TLVariantPayload>();
    v.var_val->tag = tag;
    v.var_val->args = args;
    v.var_val->fields = fields;
    return v;
  }

  static TLValue make_array(const std::vector<TLValue>& elems) {
    return TLValue(elems);
  }

  static TLValue make_record(const std::map<std::string, TLValue>& fields) {
    return TLValue(fields);
  }

  bool is_truthy() const {
    switch (kind) {
      case TLKind::Null: return false;
      case TLKind::Bool: return bool_val;
      case TLKind::Number: return num_val != 0.0 && !std::isnan(num_val);
      case TLKind::String: return !str_val.empty();
      case TLKind::Array: return arr_val != nullptr && !arr_val->empty();
      case TLKind::Record: return rec_val != nullptr;
      case TLKind::Variant: return true;
      case TLKind::Function: return true;
    }
    return false;
  }

  double to_double() const {
    if (kind == TLKind::Number) return num_val;
    if (kind == TLKind::Bool) return bool_val ? 1.0 : 0.0;
    if (kind == TLKind::String) {
      try { return std::stod(str_val); } catch (...) { return 0.0; }
    }
    return 0.0;
  }

  int64_t to_int() const {
    return static_cast<int64_t>(to_double());
  }

  std::string to_string() const {
    switch (kind) {
      case TLKind::Null: return "null";
      case TLKind::Bool: return bool_val ? "true" : "false";
      case TLKind::Number: {
        if (std::isnan(num_val)) return "NaN";
        if (std::isinf(num_val)) return num_val > 0 ? "Infinity" : "-Infinity";
        if (num_val == static_cast<int64_t>(num_val)) {
          return std::to_string(static_cast<int64_t>(num_val));
        }
        std::ostringstream ss;
        ss << std::setprecision(10) << num_val;
        return ss.str();
      }
      case TLKind::String: return str_val;
      case TLKind::Array: {
        if (!arr_val) return "[]";
        std::ostringstream ss;
        ss << "[";
        for (size_t i = 0; i < arr_val->size(); ++i) {
          if (i > 0) ss << ", ";
          ss << (*arr_val)[i].to_string();
        }
        ss << "]";
        return ss.str();
      }
      case TLKind::Record: {
        if (!rec_val) return "{}";
        std::ostringstream ss;
        ss << "{ ";
        bool first = true;
        for (const auto& kv : *rec_val) {
          if (!first) ss << ", ";
          ss << kv.first << ": " << kv.second.to_string();
          first = false;
        }
        ss << " }";
        return ss.str();
      }
      case TLKind::Variant: {
        if (!var_val) return "<variant>";
        std::ostringstream ss;
        ss << var_val->tag;
        if (!var_val->args.empty()) {
          ss << "(";
          for (size_t i = 0; i < var_val->args.size(); ++i) {
            if (i > 0) ss << ", ";
            ss << var_val->args[i].to_string();
          }
          ss << ")";
        }
        return ss.str();
      }
      case TLKind::Function: return "<function>";
    }
    return "";
  }

  TLValue operator+(const TLValue& other) const {
    if (kind == TLKind::String || other.kind == TLKind::String) {
      return TLValue(to_string() + other.to_string());
    }
    return TLValue(to_double() + other.to_double());
  }

  TLValue operator-(const TLValue& other) const { return TLValue(to_double() - other.to_double()); }
  TLValue operator*(const TLValue& other) const { return TLValue(to_double() * other.to_double()); }
  TLValue operator/(const TLValue& other) const {
    double d = other.to_double();
    if (d == 0.0) return TLValue(0.0);
    return TLValue(to_double() / d);
  }
  TLValue operator%(const TLValue& other) const {
    int64_t a = to_int();
    int64_t b = other.to_int();
    if (b == 0) return TLValue(0.0);
    return TLValue(static_cast<double>(a % b));
  }

  TLValue& operator+=(const TLValue& other) {
    *this = *this + other;
    return *this;
  }

  TLValue& operator-=(const TLValue& other) {
    *this = *this - other;
    return *this;
  }

  TLValue& operator*=(const TLValue& other) {
    *this = *this * other;
    return *this;
  }

  TLValue& operator/=(const TLValue& other) {
    *this = *this / other;
    return *this;
  }

  TLValue& operator%=(const TLValue& other) {
    *this = *this % other;
    return *this;
  }

  TLValue operator==(const TLValue& other) const {
    if (kind != other.kind) {
      if (kind == TLKind::Number && other.kind == TLKind::Number) {
        return TLValue(num_val == other.num_val);
      }
      return TLValue(false);
    }
    switch (kind) {
      case TLKind::Null: return TLValue(true);
      case TLKind::Bool: return TLValue(bool_val == other.bool_val);
      case TLKind::Number: return TLValue(num_val == other.num_val);
      case TLKind::String: return TLValue(str_val == other.str_val);
      case TLKind::Variant: {
        if (!var_val || !other.var_val) return TLValue(var_val == other.var_val);
        if (var_val->tag != other.var_val->tag) return TLValue(false);
        if (var_val->args.size() != other.var_val->args.size()) return TLValue(false);
        for (size_t i = 0; i < var_val->args.size(); ++i) {
          if (!(var_val->args[i] == other.var_val->args[i]).bool_val) return TLValue(false);
        }
        return TLValue(true);
      }
      default: return TLValue(this == &other);
    }
  }

  TLValue operator!=(const TLValue& other) const {
    return TLValue(!(*this == other).bool_val);
  }

  TLValue operator<(const TLValue& other) const {
    if (kind == TLKind::String && other.kind == TLKind::String) {
      return TLValue(str_val < other.str_val);
    }
    return TLValue(to_double() < other.to_double());
  }

  TLValue operator<=(const TLValue& other) const {
    if (kind == TLKind::String && other.kind == TLKind::String) {
      return TLValue(str_val <= other.str_val);
    }
    return TLValue(to_double() <= other.to_double());
  }

  TLValue operator>(const TLValue& other) const {
    if (kind == TLKind::String && other.kind == TLKind::String) {
      return TLValue(str_val > other.str_val);
    }
    return TLValue(to_double() > other.to_double());
  }

  TLValue operator>=(const TLValue& other) const {
    if (kind == TLKind::String && other.kind == TLKind::String) {
      return TLValue(str_val >= other.str_val);
    }
    return TLValue(to_double() >= other.to_double());
  }

  TLValue operator!() const { return TLValue(!is_truthy()); }
  TLValue operator-() const { return TLValue(-to_double()); }

  TLValue operator[](const TLValue& key) const {
    if (kind == TLKind::Array && arr_val) {
      int64_t idx = key.to_int();
      if (idx < 0 || idx >= static_cast<int64_t>(arr_val->size())) return TLValue();
      return (*arr_val)[idx];
    }
    if (kind == TLKind::String) {
      int64_t idx = key.to_int();
      if (idx < 0 || idx >= static_cast<int64_t>(str_val.size())) return TLValue("");
      return TLValue(std::string(1, str_val[idx]));
    }
    if (kind == TLKind::Record && rec_val) {
      std::string k = key.to_string();
      auto it = rec_val->find(k);
      if (it != rec_val->end()) return it->second;
      return TLValue();
    }
    if (kind == TLKind::Variant && var_val) {
      std::string k = key.to_string();
      auto it = var_val->fields.find(k);
      if (it != var_val->fields.end()) return it->second;
      if (k == "$tag") return TLValue(var_val->tag);
    }
    return TLValue();
  }

  TLValue& operator[](const TLValue& key) {
    if (kind == TLKind::Array) {
      if (!arr_val) arr_val = std::make_shared<TLArray>();
      int64_t idx = key.to_int();
      if (idx >= 0) {
        if (idx >= static_cast<int64_t>(arr_val->size())) {
          arr_val->resize(idx + 1);
        }
        return (*arr_val)[idx];
      }
    }
    if (kind == TLKind::Record || kind == TLKind::Null) {
      if (kind != TLKind::Record) {
        kind = TLKind::Record;
        rec_val = std::make_shared<TLRecord>();
      }
      return (*rec_val)[key.to_string()];
    }
    static TLValue dummy;
    dummy = TLValue();
    return dummy;
  }

  TLValue push_val(const TLValue& item) {
    if (kind != TLKind::Array) {
      kind = TLKind::Array;
      arr_val = std::make_shared<TLArray>();
    }
    if (!arr_val) arr_val = std::make_shared<TLArray>();
    arr_val->push_back(item);
    return *this;
  }

  TLValue get(const std::string& key) const {
    return (*this)[TLValue(key)];
  }

  void set(const std::string& key, const TLValue& val) {
    if (kind != TLKind::Record) {
      kind = TLKind::Record;
      rec_val = std::make_shared<TLRecord>();
    }
    (*rec_val)[key] = val;
  }

  TLValue call(const std::vector<TLValue>& args = {}) const {
    if (kind == TLKind::Function && fn_val && *fn_val) {
      return (*fn_val)(args);
    }
    return TLValue();
  }

  TLValue operator()() const {
    return call({});
  }

  TLValue operator()(const TLValue& a1) const {
    return call({a1});
  }

  TLValue operator()(const TLValue& a1, const TLValue& a2) const {
    return call({a1, a2});
  }

  TLValue operator()(const TLValue& a1, const TLValue& a2, const TLValue& a3) const {
    return call({a1, a2, a3});
  }
};

// Exception signals for TypeLang control flow
class __TLBreakSignal {};
class __TLContinueSignal {};
class __TLReturnSignal {
public:
  TLValue value;
  explicit __TLReturnSignal(const TLValue& v) : value(v) {}
};

inline std::ostream& operator<<(std::ostream& os, const TLValue& v) {
  return os << v.to_string();
}

// Builtin I/O & Utility Functions
inline TLValue print(const TLValue& v) {
  std::cout << v.to_string();
  return TLValue();
}

inline TLValue println(const TLValue& v = TLValue("")) {
  std::cout << v.to_string() << std::endl;
  return TLValue();
}

inline TLValue to_string(const TLValue& v) {
  return TLValue(v.to_string());
}

inline TLValue concat(const TLValue& a, const TLValue& b) {
  return TLValue(a.to_string() + b.to_string());
}

inline TLValue parse_int(const TLValue& s) {
  return TLValue(static_cast<double>(s.to_int()));
}

inline TLValue parse_float(const TLValue& s) {
  return TLValue(s.to_double());
}

inline TLValue time_now() {
  auto now = std::chrono::high_resolution_clock::now().time_since_epoch();
  double ms = std::chrono::duration<double, std::milli>(now).count();
  return TLValue(ms);
}

inline std::vector<std::string>& get_global_argv() {
  static std::vector<std::string> argv;
  return argv;
}

inline TLValue get_cli_arg(const TLValue& idx) {
  const auto& argv = get_global_argv();
  int64_t i = idx.to_int();
  if (i >= 0 && i < static_cast<int64_t>(argv.size())) {
    return TLValue(argv[i]);
  }
  return TLValue("");
}

inline TLValue read_file(const TLValue& path) {
  std::string p = path.to_string();
  std::ifstream f(p, std::ios::in | std::ios::binary);
  if (!f.is_open()) return TLValue("");
  std::string content((std::istreambuf_iterator<char>(f)), std::istreambuf_iterator<char>());
  return TLValue(content);
}

inline TLValue write_file(const TLValue& path, const TLValue& content) {
  std::string p = path.to_string();
  std::string c = content.to_string();
  std::ofstream f(p, std::ios::out | std::ios::binary);
  if (!f.is_open()) return TLValue(false);
  f << c;
  return TLValue(true);
}

// Option & Result GADT Constructors
inline TLValue Some(const TLValue& val) {
  return TLValue::make_variant("Some", {val}, {{"val", val}});
}

inline TLValue None() {
  return TLValue::make_variant("None", {});
}

inline TLValue Ok(const TLValue& val) {
  return TLValue::make_variant("Ok", {val}, {{"val", val}});
}

inline TLValue Err(const TLValue& err) {
  return TLValue::make_variant("Err", {err}, {{"err", err}});
}

inline TLValue Left(const TLValue& l) {
  return TLValue::make_variant("Left", {l}, {{"left", l}});
}

inline TLValue Right(const TLValue& r) {
  return TLValue::make_variant("Right", {r}, {{"right", r}});
}

// Math Standard Library Module
namespace Math {
  inline TLValue sqrt(const TLValue& x) { return TLValue(std::sqrt(x.to_double())); }
  inline TLValue abs(const TLValue& x) { return TLValue(std::abs(x.to_double())); }
  inline TLValue floor(const TLValue& x) { return TLValue(std::floor(x.to_double())); }
  inline TLValue ceil(const TLValue& x) { return TLValue(std::ceil(x.to_double())); }
  inline TLValue round(const TLValue& x) { return TLValue(std::round(x.to_double())); }
  inline TLValue sin(const TLValue& x) { return TLValue(std::sin(x.to_double())); }
  inline TLValue cos(const TLValue& x) { return TLValue(std::cos(x.to_double())); }
  inline TLValue tan(const TLValue& x) { return TLValue(std::tan(x.to_double())); }
  inline TLValue atan2(const TLValue& y, const TLValue& x) { return TLValue(std::atan2(y.to_double(), x.to_double())); }
  inline TLValue log(const TLValue& x) { return TLValue(std::log(x.to_double())); }
  inline TLValue pow(const TLValue& b, const TLValue& e) { return TLValue(std::pow(b.to_double(), e.to_double())); }
  inline TLValue min(const TLValue& a, const TLValue& b) { return TLValue(std::min(a.to_double(), b.to_double())); }
  inline TLValue max(const TLValue& a, const TLValue& b) { return TLValue(std::max(a.to_double(), b.to_double())); }
  inline TLValue random() { return TLValue(static_cast<double>(rand()) / static_cast<double>(RAND_MAX)); }
  inline TLValue bitwise_and(const TLValue& a, const TLValue& b) { return TLValue(static_cast<double>(a.to_int() & b.to_int())); }
  inline TLValue bitwise_or(const TLValue& a, const TLValue& b) { return TLValue(static_cast<double>(a.to_int() | b.to_int())); }
  inline TLValue bitwise_xor(const TLValue& a, const TLValue& b) { return TLValue(static_cast<double>(a.to_int() ^ b.to_int())); }
  inline TLValue bitwise_not(const TLValue& a) { return TLValue(static_cast<double>(~a.to_int())); }
  inline TLValue bitwise_shl(const TLValue& a, const TLValue& b) { return TLValue(static_cast<double>(a.to_int() << b.to_int())); }
  inline TLValue bitwise_shr(const TLValue& a, const TLValue& b) { return TLValue(static_cast<double>(a.to_int() >> b.to_int())); }
  const double PI = 3.14159265358979323846;
  const double E = 2.71828182845904523536;
}

// Array Standard Library Module
namespace Array {
  inline TLValue len(const TLValue& arr) {
    if (arr.kind == TLKind::Array && arr.arr_val) return TLValue(arr.arr_val->size());
    return TLValue(0.0);
  }

  inline TLValue push(const TLValue& arr, const TLValue& item) {
    TLArray result;
    if (arr.kind == TLKind::Array && arr.arr_val) {
      result = *arr.arr_val;
    }
    result.push_back(item);
    return TLValue(result);
  }

  inline TLValue map(const TLValue& arr, const TLValue& fn) {
    TLArray result;
    if (arr.kind == TLKind::Array && arr.arr_val) {
      for (const auto& elem : *arr.arr_val) {
        result.push_back(fn.call({elem}));
      }
    }
    return TLValue(result);
  }

  inline TLValue filter(const TLValue& arr, const TLValue& pred) {
    TLArray result;
    if (arr.kind == TLKind::Array && arr.arr_val) {
      for (const auto& elem : *arr.arr_val) {
        if (pred.call({elem}).is_truthy()) {
          result.push_back(elem);
        }
      }
    }
    return TLValue(result);
  }

  inline TLValue reduce(const TLValue& arr, const TLValue& init, const TLValue& fn) {
    TLValue acc = init;
    if (arr.kind == TLKind::Array && arr.arr_val) {
      for (const auto& elem : *arr.arr_val) {
        acc = fn.call({acc, elem});
      }
    }
    return acc;
  }

  inline TLValue slice(const TLValue& arr, const TLValue& start, const TLValue& end) {
    TLArray result;
    if (arr.kind == TLKind::Array && arr.arr_val) {
      int64_t s = std::max(int64_t(0), start.to_int());
      int64_t e = std::min(int64_t(arr.arr_val->size()), end.to_int());
      for (int64_t i = s; i < e; ++i) {
        result.push_back((*arr.arr_val)[i]);
      }
    }
    return TLValue(result);
  }

  inline TLValue concat(const TLValue& a, const TLValue& b) {
    TLArray result;
    if (a.kind == TLKind::Array && a.arr_val) result.insert(result.end(), a.arr_val->begin(), a.arr_val->end());
    if (b.kind == TLKind::Array && b.arr_val) result.insert(result.end(), b.arr_val->begin(), b.arr_val->end());
    return TLValue(result);
  }

  inline TLValue join(const TLValue& arr, const TLValue& sep) {
    std::string s = sep.to_string();
    std::ostringstream ss;
    if (arr.kind == TLKind::Array && arr.arr_val) {
      for (size_t i = 0; i < arr.arr_val->size(); ++i) {
        if (i > 0) ss << s;
        ss << (*arr.arr_val)[i].to_string();
      }
    }
    return TLValue(ss.str());
  }

  inline TLValue reverse(const TLValue& arr) {
    TLArray result;
    if (arr.kind == TLKind::Array && arr.arr_val) {
      result = *arr.arr_val;
      std::reverse(result.begin(), result.end());
    }
    return TLValue(result);
  }

  inline TLValue includes(const TLValue& arr, const TLValue& item) {
    if (arr.kind == TLKind::Array && arr.arr_val) {
      for (const auto& elem : *arr.arr_val) {
        if ((elem == item).bool_val) return TLValue(true);
      }
    }
    return TLValue(false);
  }

  inline TLValue indexOf(const TLValue& arr, const TLValue& item) {
    if (arr.kind == TLKind::Array && arr.arr_val) {
      for (size_t i = 0; i < arr.arr_val->size(); ++i) {
        if (((*arr.arr_val)[i] == item).bool_val) return TLValue(static_cast<double>(i));
      }
    }
    return TLValue(-1.0);
  }
}

// String Standard Library Module
namespace String {
  inline TLValue len(const TLValue& str) {
    return TLValue(static_cast<double>(str.to_string().size()));
  }

  inline TLValue charAt(const TLValue& str, const TLValue& idx) {
    std::string s = str.to_string();
    int64_t i = idx.to_int();
    if (i < 0 || i >= static_cast<int64_t>(s.size())) return TLValue("");
    return TLValue(std::string(1, s[i]));
  }

  inline TLValue substring(const TLValue& str, const TLValue& start, const TLValue& end) {
    std::string s = str.to_string();
    int64_t st = std::max(int64_t(0), start.to_int());
    int64_t en = std::min(int64_t(s.size()), end.to_int());
    if (st >= en) return TLValue("");
    return TLValue(s.substr(st, en - st));
  }

  inline TLValue toLowerCase(const TLValue& str) {
    std::string s = str.to_string();
    std::transform(s.begin(), s.end(), s.begin(), ::tolower);
    return TLValue(s);
  }

  inline TLValue toUpperCase(const TLValue& str) {
    std::string s = str.to_string();
    std::transform(s.begin(), s.end(), s.begin(), ::toupper);
    return TLValue(s);
  }

  inline TLValue trim(const TLValue& str) {
    std::string s = str.to_string();
    size_t first = s.find_first_not_of(" \\t\\n\\r");
    if (first == std::string::npos) return TLValue("");
    size_t last = s.find_last_not_of(" \\t\\n\\r");
    return TLValue(s.substr(first, (last - first + 1)));
  }

  inline TLValue split(const TLValue& str, const TLValue& delim) {
    std::string s = str.to_string();
    std::string d = delim.to_string();
    TLArray result;
    if (d.empty()) {
      for (char c : s) result.push_back(TLValue(std::string(1, c)));
      return TLValue(result);
    }
    size_t pos = 0, prev = 0;
    while ((pos = s.find(d, prev)) != std::string::npos) {
      result.push_back(TLValue(s.substr(prev, pos - prev)));
      prev = pos + d.length();
    }
    result.push_back(TLValue(s.substr(prev)));
    return TLValue(result);
  }
  inline TLValue slice(const TLValue& str, const TLValue& start, const TLValue& end) {
    return substring(str, start, end);
  }
  inline TLValue contains(const TLValue& str, const TLValue& substr) {
    std::string s = str.to_string();
    std::string sub = substr.to_string();
    return TLValue(s.find(sub) != std::string::npos);
  }
  inline TLValue parse_int(const TLValue& s) { return typelang::parse_int(s); }
  inline TLValue parseInt(const TLValue& s) { return typelang::parse_int(s); }
  inline TLValue parse_float(const TLValue& s) { return typelang::parse_float(s); }
  inline TLValue parseFloat(const TLValue& s) { return typelang::parse_float(s); }
}

// Option Standard Library Module
namespace Option {
  inline TLValue isSome(const TLValue& opt) {
    return TLValue(opt.kind == TLKind::Variant && opt.var_val && opt.var_val->tag == "Some");
  }
  inline TLValue isNone(const TLValue& opt) {
    return TLValue(opt.kind == TLKind::Variant && opt.var_val && opt.var_val->tag == "None");
  }
  inline TLValue unwrap(const TLValue& opt) {
    if (isSome(opt).bool_val && !opt.var_val->args.empty()) return opt.var_val->args[0];
    return TLValue();
  }
  inline TLValue unwrapOr(const TLValue& opt, const TLValue& def) {
    if (isSome(opt).bool_val && !opt.var_val->args.empty()) return opt.var_val->args[0];
    return def;
  }
  inline TLValue Some(const TLValue& val) { return typelang::Some(val); }
  inline TLValue None() { return typelang::None(); }
  inline TLValue pure(const TLValue& val) { return typelang::Some(val); }
  inline TLValue flatMap(const TLValue& opt, const TLValue& fn) {
    if (isSome(opt).bool_val && !opt.var_val->args.empty()) return fn.call({opt.var_val->args[0]});
    return None();
  }
  inline TLValue getOrElse(const TLValue& opt, const TLValue& def) {
    if (isSome(opt).bool_val && !opt.var_val->args.empty()) return opt.var_val->args[0];
    return def;
  }
  inline TLValue map(const TLValue& opt, const TLValue& fn) {
    if (isSome(opt).bool_val && !opt.var_val->args.empty()) return typelang::Some(fn.call({opt.var_val->args[0]}));
    return typelang::None();
  }
  inline TLValue filter(const TLValue& opt, const TLValue& pred) {
    if (isSome(opt).bool_val && !opt.var_val->args.empty() && pred.call({opt.var_val->args[0]}).is_truthy()) return opt;
    return typelang::None();
  }
  inline TLValue fold(const TLValue& opt, const TLValue& onNone, const TLValue& onSome) {
    if (isSome(opt).bool_val && !opt.var_val->args.empty()) return onSome.call({opt.var_val->args[0]});
    return onNone.call({});
  }
}

// Result Standard Library Module
namespace Result {
  inline TLValue isOk(const TLValue& res) {
    return TLValue(res.kind == TLKind::Variant && res.var_val && res.var_val->tag == "Ok");
  }
  inline TLValue isErr(const TLValue& res) {
    return TLValue(res.kind == TLKind::Variant && res.var_val && res.var_val->tag == "Err");
  }
  inline TLValue unwrap(const TLValue& res) {
    if (isOk(res).bool_val && !res.var_val->args.empty()) return res.var_val->args[0];
    return TLValue();
  }
  inline TLValue unwrapOr(const TLValue& res, const TLValue& def) {
    if (isOk(res).bool_val && !res.var_val->args.empty()) return res.var_val->args[0];
    return def;
  }
  inline TLValue Ok(const TLValue& val) { return typelang::Ok(val); }
  inline TLValue Err(const TLValue& err) { return typelang::Err(err); }
  inline TLValue pure(const TLValue& val) { return typelang::Ok(val); }
  inline TLValue map(const TLValue& res, const TLValue& fn) {
    if (isOk(res).bool_val && !res.var_val->args.empty()) return typelang::Ok(fn.call({res.var_val->args[0]}));
    return res;
  }
  inline TLValue mapError(const TLValue& res, const TLValue& fn) {
    if (isErr(res).bool_val && !res.var_val->args.empty()) return typelang::Err(fn.call({res.var_val->args[0]}));
    return res;
  }
  inline TLValue flatMap(const TLValue& res, const TLValue& fn) {
    if (isOk(res).bool_val && !res.var_val->args.empty()) return fn.call({res.var_val->args[0]});
    return res;
  }
  inline TLValue fromOption(const TLValue& opt, const TLValue& err) {
    if (Option::isSome(opt).bool_val && !opt.var_val->args.empty()) return typelang::Ok(opt.var_val->args[0]);
    return typelang::Err(err);
  }
  inline TLValue toOption(const TLValue& res) {
    if (isOk(res).bool_val && !res.var_val->args.empty()) return typelang::Some(res.var_val->args[0]);
    return typelang::None();
  }
}

// Either Standard Library Module
namespace Either {
  inline TLValue Left(const TLValue& val) { return typelang::Left(val); }
  inline TLValue Right(const TLValue& val) { return typelang::Right(val); }
  inline TLValue pure(const TLValue& val) { return typelang::Right(val); }
  inline TLValue isLeft(const TLValue& e) {
    return TLValue(e.kind == TLKind::Variant && e.var_val && e.var_val->tag == "Left");
  }
  inline TLValue isRight(const TLValue& e) {
    return TLValue(e.kind == TLKind::Variant && e.var_val && e.var_val->tag == "Right");
  }
  inline TLValue getOrElse(const TLValue& e, const TLValue& def) {
    if (isRight(e).bool_val && !e.var_val->args.empty()) return e.var_val->args[0];
    return def;
  }
  inline TLValue swap(const TLValue& e) {
    if (isRight(e).bool_val && !e.var_val->args.empty()) return typelang::Left(e.var_val->args[0]);
    if (isLeft(e).bool_val && !e.var_val->args.empty()) return typelang::Right(e.var_val->args[0]);
    return e;
  }
  inline TLValue map(const TLValue& e, const TLValue& fn) {
    if (isRight(e).bool_val && !e.var_val->args.empty()) return typelang::Right(fn.call({e.var_val->args[0]}));
    return e;
  }
  inline TLValue flatMap(const TLValue& e, const TLValue& fn) {
    if (isRight(e).bool_val && !e.var_val->args.empty()) return fn.call({e.var_val->args[0]});
    return e;
  }
}

// Reader Standard Library Module
namespace Reader {
  inline TLValue run(const TLValue& reader, const TLValue& env) {
    return reader.call({env});
  }
  inline TLValue pure(const TLValue& val) {
    return TLValue(TLFunction([val](const std::vector<TLValue>& args) -> TLValue {
      (void)args;
      return val;
    }));
  }
  inline TLValue flatMap(const TLValue& reader, const TLValue& fn) {
    return TLValue(TLFunction([reader, fn](const std::vector<TLValue>& args) -> TLValue {
      TLValue env = args.size() > 0 ? args[0] : TLValue();
      TLValue a = reader.call({env});
      TLValue nextReader = fn.call({a});
      return nextReader.call({env});
    }));
  }
  inline TLValue ask() {
    return TLValue(TLFunction([](const std::vector<TLValue>& args) -> TLValue {
      return args.size() > 0 ? args[0] : TLValue();
    }));
  }
  inline TLValue asks(const TLValue& fn) {
    return TLValue(TLFunction([fn](const std::vector<TLValue>& args) -> TLValue {
      TLValue env = args.size() > 0 ? args[0] : TLValue();
      return fn.call({env});
    }));
  }
  inline TLValue local(const TLValue& fn, const TLValue& reader) {
    return TLValue(TLFunction([fn, reader](const std::vector<TLValue>& args) -> TLValue {
      TLValue env = args.size() > 0 ? args[0] : TLValue();
      TLValue modifiedEnv = fn.call({env});
      return reader.call({modifiedEnv});
    }));
  }
}

// Writer Standard Library Module
namespace Writer {
  inline TLValue run(const TLValue& writer) {
    return writer.call({});
  }
  inline TLValue pure(const TLValue& val) {
    return TLValue(TLFunction([val](const std::vector<TLValue>& args) -> TLValue {
      (void)args;
      return TLValue::make_array({val, TLValue::make_array({})});
    }));
  }
  inline TLValue flatMap(const TLValue& writer, const TLValue& fn) {
    return TLValue(TLFunction([writer, fn](const std::vector<TLValue>& args) -> TLValue {
      (void)args;
      TLValue res = writer.call({});
      TLValue val = res[TLValue(0)];
      TLValue logs1 = res[TLValue(1)];
      TLValue nextWriter = fn.call({val});
      TLValue nextRes = nextWriter.call({});
      TLValue nextVal = nextRes[TLValue(0)];
      TLValue logs2 = nextRes[TLValue(1)];
      
      std::vector<TLValue> mergedLogs;
      if (logs1.kind == TLKind::Array && logs1.arr_val) {
        mergedLogs.insert(mergedLogs.end(), logs1.arr_val->begin(), logs1.arr_val->end());
      }
      if (logs2.kind == TLKind::Array && logs2.arr_val) {
        mergedLogs.insert(mergedLogs.end(), logs2.arr_val->begin(), logs2.arr_val->end());
      }
      return TLValue::make_array({nextVal, TLValue::make_array(mergedLogs)});
    }));
  }
  inline TLValue tell(const TLValue& msg) {
    return TLValue(TLFunction([msg](const std::vector<TLValue>& args) -> TLValue {
      (void)args;
      return TLValue::make_array({TLValue(), TLValue::make_array({msg})});
    }));
  }
  inline TLValue listen(const TLValue& writer) {
    return TLValue(TLFunction([writer](const std::vector<TLValue>& args) -> TLValue {
      (void)args;
      TLValue res = writer.call({});
      TLValue val = res[TLValue(0)];
      TLValue logs = res[TLValue(1)];
      return TLValue::make_array({TLValue::make_array({val, logs}), logs});
    }));
  }
}

// State Standard Library Module
namespace State {
  inline TLValue run(const TLValue& stateFn, const TLValue& state) {
    return stateFn.call({state});
  }
  inline TLValue pure(const TLValue& val) {
    return TLValue(TLFunction([val](const std::vector<TLValue>& args) -> TLValue {
      TLValue s = args.size() > 0 ? args[0] : TLValue();
      return TLValue::make_array({val, s});
    }));
  }
  inline TLValue flatMap(const TLValue& stateFn, const TLValue& fn) {
    return TLValue(TLFunction([stateFn, fn](const std::vector<TLValue>& args) -> TLValue {
      TLValue s1 = args.size() > 0 ? args[0] : TLValue();
      TLValue res = stateFn.call({s1});
      TLValue val = res[TLValue(0)];
      TLValue s2 = res[TLValue(1)];
      TLValue nextStateFn = fn.call({val});
      return nextStateFn.call({s2});
    }));
  }
  inline TLValue get() {
    return TLValue(TLFunction([](const std::vector<TLValue>& args) -> TLValue {
      TLValue s = args.size() > 0 ? args[0] : TLValue();
      return TLValue::make_array({s, s});
    }));
  }
  inline TLValue set(const TLValue& nextState) {
    return TLValue(TLFunction([nextState](const std::vector<TLValue>& args) -> TLValue {
      (void)args;
      return TLValue::make_array({TLValue(), nextState});
    }));
  }
  inline TLValue modify(const TLValue& fn) {
    return TLValue(TLFunction([fn](const std::vector<TLValue>& args) -> TLValue {
      TLValue s = args.size() > 0 ? args[0] : TLValue();
      TLValue nextState = fn.call({s});
      return TLValue::make_array({TLValue(), nextState});
    }));
  }
}

// Task Standard Library Module
namespace Task {
  inline TLValue run(const TLValue& task) {
    return task.call({});
  }
  inline TLValue pure(const TLValue& val) {
    return TLValue(TLFunction([val](const std::vector<TLValue>& args) -> TLValue {
      (void)args;
      return val;
    }));
  }
  inline TLValue succeed(const TLValue& val) {
    return pure(val);
  }
  inline TLValue flatMap(const TLValue& task, const TLValue& fn) {
    return TLValue(TLFunction([task, fn](const std::vector<TLValue>& args) -> TLValue {
      (void)args;
      TLValue val = task.call({});
      TLValue nextTask = fn.call({val});
      return nextTask.call({});
    }));
  }
  inline TLValue delay(const TLValue& fn) {
    return TLValue(TLFunction([fn](const std::vector<TLValue>& args) -> TLValue {
      (void)args;
      return fn.call({});
    }));
  }
}

} // namespace typelang

using namespace typelang;
`}generateCPrelude(){return`// ============================================================================
// TypeLang Native C Target (C11 / C99 Compatible)
// Generated by TypeLang Native Multi-Target Compiler Backend
// ============================================================================
#define _GNU_SOURCE
#define _DEFAULT_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <stdint.h>
#include <math.h>

typedef enum {
  TL_KIND_NULL,
  TL_KIND_BOOL,
  TL_KIND_NUM,
  TL_KIND_STR,
  TL_KIND_ARR,
  TL_KIND_REC,
  TL_KIND_VAR,
  TL_KIND_FN
} TL_Kind;

typedef struct TL_Val TL_Val;
typedef TL_Val TLValue;

typedef TL_Val (*TL_FnPtr)(size_t argc, const TL_Val* argv);

typedef struct TL_Variant TL_Variant;
typedef struct TL_Array TL_Array;
typedef struct TL_Record TL_Record;
typedef struct TL_Field TL_Field;

struct TL_Val {
  TL_Kind kind;
  union {
    bool b;
    double n;
    char* s;
    TL_Array* arr;
    TL_Record* rec;
    TL_Variant* var;
    TL_FnPtr fn;
  } u;
};

struct TL_Variant {
  const char* tag;
  size_t argc;
  TL_Val* args;
};

struct TL_Array {
  size_t len;
  size_t cap;
  TL_Val* items;
};

struct TL_Field {
  const char* key;
  TL_Val val;
};

struct TL_Record {
  size_t len;
  size_t cap;
  TL_Field* fields;
};

static inline TLValue tl_null(void) {
  TLValue v;
  v.kind = TL_KIND_NULL;
  v.u.n = 0;
  return v;
}

static inline TLValue tl_bool(bool b) {
  TLValue v;
  v.kind = TL_KIND_BOOL;
  v.u.b = b;
  return v;
}

static inline TLValue tl_num(double n) {
  TLValue v;
  v.kind = TL_KIND_NUM;
  v.u.n = n;
  return v;
}

static inline TLValue tl_str(const char* s) {
  TLValue v;
  v.kind = TL_KIND_STR;
  if (!s) s = "";
  v.u.s = strdup(s);
  return v;
}

static inline TLValue tl_fn(TL_FnPtr fn) {
  TLValue v;
  v.kind = TL_KIND_FN;
  v.u.fn = fn;
  return v;
}

static inline TLValue tl_variant(const char* tag, size_t argc, const TLValue* argv) {
  TLValue v;
  v.kind = TL_KIND_VAR;
  v.u.var = (TL_Variant*)malloc(sizeof(TL_Variant));
  v.u.var->tag = tag ? tag : "";
  v.u.var->argc = argc;
  if (argc > 0 && argv != NULL) {
    v.u.var->args = (TL_Val*)malloc(sizeof(TL_Val) * argc);
    for (size_t i = 0; i < argc; ++i) {
      v.u.var->args[i] = argv[i];
    }
  } else {
    v.u.var->args = NULL;
  }
  return v;
}

static inline TLValue tl_array(size_t len, const TLValue* items) {
  TLValue v;
  v.kind = TL_KIND_ARR;
  v.u.arr = (TL_Array*)malloc(sizeof(TL_Array));
  v.u.arr->len = len;
  v.u.arr->cap = len;
  if (len > 0 && items != NULL) {
    v.u.arr->items = (TL_Val*)malloc(sizeof(TL_Val) * len);
    for (size_t i = 0; i < len; ++i) {
      v.u.arr->items[i] = items[i];
    }
  } else {
    v.u.arr->items = NULL;
  }
  return v;
}

static inline TLValue tl_record(size_t len, const char** keys, const TLValue* vals) {
  TLValue v;
  v.kind = TL_KIND_REC;
  v.u.rec = (TL_Record*)malloc(sizeof(TL_Record));
  v.u.rec->len = len;
  v.u.rec->cap = len;
  if (len > 0 && keys != NULL && vals != NULL) {
    v.u.rec->fields = (TL_Field*)malloc(sizeof(TL_Field) * len);
    for (size_t i = 0; i < len; ++i) {
      v.u.rec->fields[i].key = keys[i];
      v.u.rec->fields[i].val = vals[i];
    }
  } else {
    v.u.rec->fields = NULL;
  }
  return v;
}

static inline char* tl_to_string_c(TLValue v) {
  char buf[128];
  switch (v.kind) {
    case TL_KIND_NULL: return strdup("null");
    case TL_KIND_BOOL: return strdup(v.u.b ? "true" : "false");
    case TL_KIND_NUM: {
      if (isnan(v.u.n)) return strdup("NaN");
      if (isinf(v.u.n)) return strdup(v.u.n > 0 ? "Infinity" : "-Infinity");
      if (v.u.n == (int64_t)v.u.n) {
        snprintf(buf, sizeof(buf), "%lld", (long long)(int64_t)v.u.n);
      } else {
        snprintf(buf, sizeof(buf), "%g", v.u.n);
      }
      return strdup(buf);
    }
    case TL_KIND_STR: return strdup(v.u.s ? v.u.s : "");
    case TL_KIND_VAR: {
      if (!v.u.var) return strdup("<variant>");
      if (v.u.var->argc == 0) return strdup(v.u.var->tag);
      size_t cap = 256;
      char* res = (char*)malloc(cap);
      snprintf(res, cap, "%s(", v.u.var->tag);
      for (size_t i = 0; i < v.u.var->argc; ++i) {
        char* item = tl_to_string_c(v.u.var->args[i]);
        if (i > 0) {
          strncat(res, ", ", cap - strlen(res) - 1);
        }
        strncat(res, item, cap - strlen(res) - 1);
        free(item);
      }
      strncat(res, ")", cap - strlen(res) - 1);
      return res;
    }
    case TL_KIND_ARR: {
      if (!v.u.arr || v.u.arr->len == 0) return strdup("[]");
      size_t cap = 512;
      char* res = (char*)malloc(cap);
      strcpy(res, "[");
      for (size_t i = 0; i < v.u.arr->len; ++i) {
        if (i > 0) strncat(res, ", ", cap - strlen(res) - 1);
        char* item = tl_to_string_c(v.u.arr->items[i]);
        strncat(res, item, cap - strlen(res) - 1);
        free(item);
      }
      strncat(res, "]", cap - strlen(res) - 1);
      return res;
    }
    case TL_KIND_REC: {
      if (!v.u.rec || v.u.rec->len == 0) return strdup("{}");
      size_t cap = 512;
      char* res = (char*)malloc(cap);
      strcpy(res, "{ ");
      for (size_t i = 0; i < v.u.rec->len; ++i) {
        if (i > 0) strncat(res, ", ", cap - strlen(res) - 1);
        char* item = tl_to_string_c(v.u.rec->fields[i].val);
        strncat(res, v.u.rec->fields[i].key, cap - strlen(res) - 1);
        strncat(res, ": ", cap - strlen(res) - 1);
        strncat(res, item, cap - strlen(res) - 1);
        free(item);
      }
      strncat(res, " }", cap - strlen(res) - 1);
      return res;
    }
    case TL_KIND_FN: return strdup("<function>");
  }
  return strdup("");
}

static inline TLValue to_string(TLValue v) {
  char* s = tl_to_string_c(v);
  TLValue res = tl_str(s);
  free(s);
  return res;
}

static inline TLValue print(TLValue v) {
  char* s = tl_to_string_c(v);
  fputs(s, stdout);
  free(s);
  return tl_null();
}

static inline TLValue println(TLValue v) {
  char* s = tl_to_string_c(v);
  puts(s);
  free(s);
  return tl_null();
}

static inline TLValue concat(TLValue a, TLValue b) {
  char* sa = tl_to_string_c(a);
  char* sb = tl_to_string_c(b);
  size_t len = strlen(sa) + strlen(sb) + 1;
  char* res = (char*)malloc(len);
  strcpy(res, sa);
  strcat(res, sb);
  TLValue v = tl_str(res);
  free(sa); free(sb); free(res);
  return v;
}

static inline bool tl_is_truthy(TLValue v) {
  switch (v.kind) {
    case TL_KIND_NULL: return false;
    case TL_KIND_BOOL: return v.u.b;
    case TL_KIND_NUM: return v.u.n != 0.0 && !isnan(v.u.n);
    case TL_KIND_STR: return v.u.s && v.u.s[0] != 0;
    case TL_KIND_ARR: return v.u.arr && v.u.arr->len > 0;
    case TL_KIND_REC: return v.u.rec != NULL;
    case TL_KIND_VAR: return true;
    case TL_KIND_FN: return true;
  }
  return false;
}

static inline double tl_to_num(TLValue v) {
  if (v.kind == TL_KIND_NUM) return v.u.n;
  if (v.kind == TL_KIND_BOOL) return v.u.b ? 1.0 : 0.0;
  if (v.kind == TL_KIND_STR && v.u.s) return atof(v.u.s);
  return 0.0;
}

static inline TLValue tl_add(TLValue a, TLValue b) {
  if (a.kind == TL_KIND_STR || b.kind == TL_KIND_STR) {
    return concat(a, b);
  }
  return tl_num(tl_to_num(a) + tl_to_num(b));
}

static inline TLValue tl_sub(TLValue a, TLValue b) { return tl_num(tl_to_num(a) - tl_to_num(b)); }
static inline TLValue tl_mul(TLValue a, TLValue b) { return tl_num(tl_to_num(a) * tl_to_num(b)); }
static inline TLValue tl_div(TLValue a, TLValue b) {
  double d = tl_to_num(b);
  if (d == 0.0) return tl_num(0.0);
  return tl_num(tl_to_num(a) / d);
}
static inline TLValue tl_mod(TLValue a, TLValue b) {
  int64_t ia = (int64_t)tl_to_num(a);
  int64_t ib = (int64_t)tl_to_num(b);
  if (ib == 0) return tl_num(0.0);
  return tl_num((double)(ia % ib));
}

static inline bool tl_eq_bool(TLValue a, TLValue b) {
  if (a.kind != b.kind) {
    if (a.kind == TL_KIND_NUM && b.kind == TL_KIND_NUM) return a.u.n == b.u.n;
    return false;
  }
  switch (a.kind) {
    case TL_KIND_NULL: return true;
    case TL_KIND_BOOL: return a.u.b == b.u.b;
    case TL_KIND_NUM: return a.u.n == b.u.n;
    case TL_KIND_STR: return strcmp(a.u.s ? a.u.s : "", b.u.s ? b.u.s : "") == 0;
    case TL_KIND_VAR: {
      if (!a.u.var || !b.u.var) return a.u.var == b.u.var;
      if (strcmp(a.u.var->tag, b.u.var->tag) != 0) return false;
      if (a.u.var->argc != b.u.var->argc) return false;
      for (size_t i = 0; i < a.u.var->argc; ++i) {
        if (!tl_eq_bool(a.u.var->args[i], b.u.var->args[i])) return false;
      }
      return true;
    }
    default: return false;
  }
}

static inline TLValue tl_eq(TLValue a, TLValue b) { return tl_bool(tl_eq_bool(a, b)); }
static inline TLValue tl_ne(TLValue a, TLValue b) { return tl_bool(!tl_eq_bool(a, b)); }
static inline TLValue tl_lt(TLValue a, TLValue b) { return tl_bool(tl_to_num(a) < tl_to_num(b)); }
static inline TLValue tl_le(TLValue a, TLValue b) { return tl_bool(tl_to_num(a) <= tl_to_num(b)); }
static inline TLValue tl_gt(TLValue a, TLValue b) { return tl_bool(tl_to_num(a) > tl_to_num(b)); }
static inline TLValue tl_ge(TLValue a, TLValue b) { return tl_bool(tl_to_num(a) >= tl_to_num(b)); }
static inline TLValue tl_not(TLValue a) { return tl_bool(!tl_is_truthy(a)); }
static inline TLValue tl_neg(TLValue a) { return tl_num(-tl_to_num(a)); }

static inline TLValue tl_get_field(TLValue obj, const char* key) {
  if (obj.kind == TL_KIND_REC && obj.u.rec && key) {
    for (size_t i = 0; i < obj.u.rec->len; ++i) {
      if (strcmp(obj.u.rec->fields[i].key, key) == 0) {
        return obj.u.rec->fields[i].val;
      }
    }
  }
  if (obj.kind == TL_KIND_VAR && obj.u.var && key) {
    if (strcmp(key, "$tag") == 0) return tl_str(obj.u.var->tag);
  }
  return tl_null();
}

static inline TLValue tl_get_index(TLValue obj, TLValue idx) {
  int64_t i = (int64_t)tl_to_num(idx);
  if (obj.kind == TL_KIND_ARR && obj.u.arr) {
    if (i >= 0 && i < (int64_t)obj.u.arr->len) {
      return obj.u.arr->items[i];
    }
  }
  if (obj.kind == TL_KIND_STR && obj.u.s) {
    if (i >= 0 && i < (int64_t)strlen(obj.u.s)) {
      char tmp[2] = { obj.u.s[i], 0 };
      return tl_str(tmp);
    }
  }
  return tl_null();
}

static inline TLValue tl_is_tag(TLValue v, const char* tag) {
  if (v.kind == TL_KIND_VAR && v.u.var && tag) {
    return tl_bool(strcmp(v.u.var->tag, tag) == 0);
  }
  return tl_bool(false);
}

static inline TLValue tl_var_arg(TLValue v, size_t idx) {
  if (v.kind == TL_KIND_VAR && v.u.var && idx < v.u.var->argc) {
    return v.u.var->args[idx];
  }
  return tl_null();
}

static inline TLValue Some(TLValue val) { return tl_variant("Some", 1, (TLValue[]){ val }); }
static inline TLValue None(void) { return tl_variant("None", 0, NULL); }
static inline TLValue Ok(TLValue val) { return tl_variant("Ok", 1, (TLValue[]){ val }); }
static inline TLValue Err(TLValue err) { return tl_variant("Err", 1, (TLValue[]){ err }); }
static inline TLValue Left(TLValue l) { return tl_variant("Left", 1, (TLValue[]){ l }); }
static inline TLValue Right(TLValue r) { return tl_variant("Right", 1, (TLValue[]){ r }); }

static inline TLValue parse_int(TLValue s) {
  if (s.kind == TL_KIND_STR && s.u.s) return tl_num(atof(s.u.s));
  return tl_num(tl_to_num(s));
}
static inline TLValue parseInt(TLValue s) { return parse_int(s); }
static inline TLValue parse_float(TLValue s) {
  if (s.kind == TL_KIND_STR && s.u.s) return tl_num(atof(s.u.s));
  return tl_num(tl_to_num(s));
}
static inline TLValue parseFloat(TLValue s) { return parse_float(s); }

static inline TLValue Math_sqrt(TLValue x) { return tl_num(sqrt(tl_to_num(x))); }
static inline TLValue Math_abs(TLValue x) { return tl_num(fabs(tl_to_num(x))); }
static inline TLValue Math_floor(TLValue x) { return tl_num(floor(tl_to_num(x))); }
static inline TLValue Math_ceil(TLValue x) { return tl_num(ceil(tl_to_num(x))); }
static inline TLValue Math_round(TLValue x) { return tl_num(round(tl_to_num(x))); }
static inline TLValue Math_sin(TLValue x) { return tl_num(sin(tl_to_num(x))); }
static inline TLValue Math_cos(TLValue x) { return tl_num(cos(tl_to_num(x))); }
static inline TLValue Math_tan(TLValue x) { return tl_num(tan(tl_to_num(x))); }
static inline TLValue Math_log(TLValue x) { return tl_num(log(tl_to_num(x))); }
static inline TLValue Math_pow(TLValue b, TLValue e) { return tl_num(pow(tl_to_num(b), tl_to_num(e))); }
static inline TLValue Math_min(TLValue a, TLValue b) { return tl_num(fmin(tl_to_num(a), tl_to_num(b))); }
static inline TLValue Math_max(TLValue a, TLValue b) { return tl_num(fmax(tl_to_num(a), tl_to_num(b))); }

static inline TLValue String_len(TLValue str) {
  if (str.kind == TL_KIND_STR && str.u.s) return tl_num((double)strlen(str.u.s));
  return tl_num(0.0);
}
static inline TLValue String_parse_int(TLValue str) { return parse_int(str); }
static inline TLValue String_parseInt(TLValue str) { return parse_int(str); }
static inline TLValue String_parse_float(TLValue str) { return parse_float(str); }
static inline TLValue String_parseFloat(TLValue str) { return parse_float(str); }
static inline TLValue String_split(TLValue str, TLValue delim) {
  if (str.kind != TL_KIND_STR || !str.u.s) return tl_array(0, NULL);
  const char* d = (delim.kind == TL_KIND_STR && delim.u.s) ? delim.u.s : "";
  size_t cap = 16, count = 0;
  TLValue* items = (TLValue*)malloc(sizeof(TLValue) * cap);
  char* s = strdup(str.u.s);
  if (d[0] == 0) {
    for (size_t i = 0; i < strlen(s); ++i) {
      char tmp[2] = { s[i], 0 };
      if (count >= cap) { cap *= 2; items = (TLValue*)realloc(items, sizeof(TLValue) * cap); }
      items[count++] = tl_str(tmp);
    }
  } else {
    char* token = strtok(s, d);
    while (token) {
      if (count >= cap) { cap *= 2; items = (TLValue*)realloc(items, sizeof(TLValue) * cap); }
      items[count++] = tl_str(token);
      token = strtok(NULL, d);
    }
  }
  free(s);
  TLValue res = tl_array(count, items);
  free(items);
  return res;
}

static inline TLValue String_slice(TLValue str, TLValue start, TLValue end) {
  if (str.kind != TL_KIND_STR || !str.u.s) return tl_str("");
  int64_t len = (int64_t)strlen(str.u.s);
  int64_t s = (int64_t)tl_to_num(start);
  int64_t e = (int64_t)tl_to_num(end);
  if (s < 0) s = 0;
  if (e > len) e = len;
  if (s >= e) return tl_str("");
  int64_t sub_len = e - s;
  char* buf = (char*)malloc(sub_len + 1);
  if (!buf) return tl_str("");
  memcpy(buf, str.u.s + s, sub_len);
  buf[sub_len] = '\0';
  TLValue res = tl_str(buf);
  free(buf);
  return res;
}
static inline TLValue String_substring(TLValue str, TLValue start, TLValue end) { return String_slice(str, start, end); }
static inline TLValue String_charAt(TLValue str, TLValue idx) {
  int64_t i = (int64_t)tl_to_num(idx);
  return String_slice(str, tl_num((double)i), tl_num((double)(i + 1)));
}
static inline TLValue String_contains(TLValue str, TLValue substr) {
  if (str.kind != TL_KIND_STR || !str.u.s || substr.kind != TL_KIND_STR || !substr.u.s) return tl_bool(false);
  return tl_bool(strstr(str.u.s, substr.u.s) != NULL);
}

static inline TLValue Array_push(TLValue arr, TLValue item) {
  if (arr.kind != TL_KIND_ARR || !arr.u.arr) {
    return tl_array(1, &item);
  }
  TL_Array* a = arr.u.arr;
  if (a->len >= a->cap) {
    size_t new_cap = a->cap < 4 ? 4 : a->cap * 2;
    TL_Val* new_items = (TL_Val*)realloc(a->items, sizeof(TL_Val) * new_cap);
    if (new_items) { a->items = new_items; a->cap = new_cap; }
  }
  if (a->len < a->cap) {
    a->items[a->len++] = item;
  }
  return arr;
}

static int _tl_argc = 0;
static char** _tl_argv = NULL;

static inline TLValue get_cli_arg(TLValue idx) {
  int64_t i = (int64_t)tl_to_num(idx);
  if (i >= 0 && i < _tl_argc && _tl_argv && _tl_argv[i]) {
    return tl_str(_tl_argv[i]);
  }
  return tl_str("");
}
static inline TLValue tl_get_cli_arg(TLValue idx) { return get_cli_arg(idx); }

static inline TLValue read_file(TLValue path) {
  if (path.kind != TL_KIND_STR || !path.u.s) return tl_str("");
  FILE* f = fopen(path.u.s, "rb");
  if (!f) return tl_str("");
  fseek(f, 0, SEEK_END);
  long len = ftell(f);
  fseek(f, 0, SEEK_SET);
  if (len < 0) { fclose(f); return tl_str(""); }
  char* buf = (char*)malloc(len + 1);
  if (!buf) { fclose(f); return tl_str(""); }
  size_t read_bytes = fread(buf, 1, len, f);
  buf[read_bytes] = '\0';
  fclose(f);
  TLValue res = tl_str(buf);
  free(buf);
  return res;
}
static inline TLValue tl_read_file(TLValue path) { return read_file(path); }

static inline TLValue write_file(TLValue path, TLValue content) {
  if (path.kind != TL_KIND_STR || !path.u.s) return tl_bool(false);
  const char* text = (content.kind == TL_KIND_STR && content.u.s) ? content.u.s : "";
  FILE* f = fopen(path.u.s, "wb");
  if (!f) return tl_bool(false);
  fputs(text, f);
  fclose(f);
  return tl_bool(true);
}
static inline TLValue tl_write_file(TLValue path, TLValue content) { return write_file(path, content); }

static inline TLValue time_now(void) {
  return tl_num(0.0);
}

static inline TLValue Array_len(TLValue arr) {
  if (arr.kind == TL_KIND_ARR && arr.u.arr) return tl_num((double)arr.u.arr->len);
  return tl_num(0.0);
}
static inline TLValue Array_map(TLValue arr, TLValue fn) {
  if (arr.kind != TL_KIND_ARR || !arr.u.arr) return tl_array(0, NULL);
  size_t len = arr.u.arr->len;
  TLValue* items = (TLValue*)malloc(sizeof(TLValue) * len);
  for (size_t i = 0; i < len; ++i) {
    TLValue arg = arr.u.arr->items[i];
    items[i] = fn.kind == TL_KIND_FN && fn.u.fn ? fn.u.fn(1, &arg) : tl_null();
  }
  TLValue res = tl_array(len, items);
  free(items);
  return res;
}
static inline TLValue Array_filter(TLValue arr, TLValue pred) {
  if (arr.kind != TL_KIND_ARR || !arr.u.arr) return tl_array(0, NULL);
  size_t len = arr.u.arr->len;
  TLValue* items = (TLValue*)malloc(sizeof(TLValue) * len);
  size_t count = 0;
  for (size_t i = 0; i < len; ++i) {
    TLValue arg = arr.u.arr->items[i];
    TLValue cond = pred.kind == TL_KIND_FN && pred.u.fn ? pred.u.fn(1, &arg) : tl_bool(false);
    if (tl_is_truthy(cond)) {
      items[count++] = arg;
    }
  }
  TLValue res = tl_array(count, items);
  free(items);
  return res;
}
static inline TLValue Array_reduce(TLValue arr, TLValue init, TLValue fn) {
  TLValue acc = init;
  if (arr.kind == TL_KIND_ARR && arr.u.arr) {
    for (size_t i = 0; i < arr.u.arr->len; ++i) {
      TLValue args[2] = { acc, arr.u.arr->items[i] };
      acc = fn.kind == TL_KIND_FN && fn.u.fn ? fn.u.fn(2, args) : acc;
    }
  }
  return acc;
}
`}generateStatement(e){var t,n,r,s,i,o,l,c;if(!e)return"";switch(e.kind){case"s_let":{const u=sanitizeCIdent(e.name);this.addLocalVar(e.name);const p=e.init?this.generateExpr(e.init):this.isCpp?"TLValue()":"tl_null()";return`${this.indent()}TLValue ${u} = ${p};`}case"s_function":{const u=this.getCIdent(e.name),p=(e.params||[]).map(g=>{const h=sanitizeCIdent(g.name);return this.isCpp?`const TLValue& ${h}`:`TLValue ${h}`}),d=p.length>0?p.join(", "):this.isCpp?"":"void";this.pushScope((e.params||[]).map(g=>g.name));const f=this.insideFunction;this.insideFunction=!0;let m="";e.whereBindings&&e.whereBindings.length>0&&(this.indentLevel++,m=e.whereBindings.map(g=>this.generateStatement(g)).join(`
`)+`
`,this.indentLevel--);const y=e.body?this.generateFunctionBody(e.body):`${this.indent()}  return ${this.isCpp?"TLValue()":"tl_null()"};`;this.popScope();const _=this.isCpp&&f;if(this.insideFunction=f,this.isCpp){if(_){const h=(e.params||[]).map(T=>`const TLValue& ${sanitizeCIdent(T.name)}`).join(", ");return`${this.indent()}auto ${u} = [&](${h}) -> TLValue {
${m}  try {
${y}
  } catch (const typelang::__TLReturnSignal& __sig) { return __sig.value; }
${this.indent()}};`}return`${this.indent()}TLValue ${u}(${d}) {
${m}  try {
${y}
  } catch (const typelang::__TLReturnSignal& __sig) { return __sig.value; }
${this.indent()}}`}return`${this.indent()}TLValue ${u}(${d}) {
${m}${y}
${this.indent()}}`}case"s_gadt":{const u=(t=e.decl)!=null&&t.name?this.isCpp?`${this.indent()}using ${sanitizeCIdent(e.decl.name)} = TLValue;`:`${this.indent()}typedef TLValue ${this.getCIdent(e.decl.name)};`:"",p=(((n=e.decl)==null?void 0:n.constructors)||[]).map(d=>{if(this.currentModulePath.length===0&&PRELUDE_CTORS.has(d.name))return(!d.params||d.params.length===0)&&this.zeroArityCtors.add(d.name),"";const f=this.getCIdent(d.name);if(!d.params||d.params.length===0)return this.zeroArityCtors.add(d.name),this.isCpp?`${this.indent()}inline TLValue ${f}() { return TLValue::make_variant("${d.name}", {}); }`:`${this.indent()}static inline TLValue ${f}(void) { return tl_variant("${d.name}", 0, NULL); }`;if(this.isCpp){const m=d.params.map(g=>`const TLValue& ${sanitizeCIdent(g.name)}`).join(", "),y=d.params.map(g=>sanitizeCIdent(g.name)).join(", "),_=d.params.map(g=>`{"${g.name}", ${sanitizeCIdent(g.name)}}`).join(", ");return`${this.indent()}inline TLValue ${f}(${m}) {
${this.indent()}  return TLValue::make_variant("${d.name}", {${y}}, {${_}});
${this.indent()}}`}else{const m=d.params.map(_=>`TLValue ${sanitizeCIdent(_.name)}`).join(", "),y=d.params.map(_=>sanitizeCIdent(_.name)).join(", ");return`${this.indent()}static inline TLValue ${f}(${m}) {
${this.indent()}  return tl_variant("${d.name}", ${d.params.length}, (TLValue[]){ ${y} });
${this.indent()}}`}});return[u,...p].filter(Boolean).join(`
`)}case"s_module":{const u=sanitizeCIdent(e.name);if(this.addLocalVar(e.name),this.currentModulePath.push(e.name),this.isCpp){this.indentLevel++,this.pushScope();const p=(e.body||[]).map(d=>this.generateStatement(d)).join(`
`);return this.popScope(),this.indentLevel--,this.currentModulePath.pop(),`${this.indent()}namespace ${u} {
${p}
${this.indent()}}`}else{this.pushScope();const p=(e.body||[]).map(d=>this.generateStatement(d)).join(`
`);return this.popScope(),this.currentModulePath.pop(),`// Module: ${u}
${p}`}}case"s_type_alias":{const u=(r=e.decl)==null?void 0:r.name;return u?this.isCpp?`${this.indent()}using ${sanitizeCIdent(u)} = TLValue;`:`${this.indent()}typedef TLValue ${this.getCIdent(u)};`:`${this.indent()}// Type alias`}case"s_import":{const u=(e.modulePath||[]).map(sanitizeCIdent);if(u.length===0)return"";if(this.isCpp){const d=`${STDLIB_MODULES.has(u[0])?"typelang::":""}${u.join("::")}`;return e.specifiers&&e.specifiers.length>0?e.specifiers.map(m=>{if(m.isAll)return`${this.indent()}using namespace ${d};`;if(PRELUDE_CTORS.has(m.name)&&!m.alias)return"";const y=sanitizeCIdent(m.name),_=m.alias?sanitizeCIdent(m.alias):y;return _!==y?`${this.indent()}using ${_} = ${d}::${y};`:`${this.indent()}using ${d}::${y};`}).filter(Boolean).join(`
`):e.alias?`${this.indent()}namespace ${sanitizeCIdent(e.alias)} = ${d};`:`${this.indent()}using namespace ${d};`}else{const p=u.join("_");return e.specifiers&&e.specifiers.length>0?e.specifiers.map(f=>{if(f.isAll)return`${this.indent()}// import ${p}.*`;const m=sanitizeCIdent(f.name),y=f.alias?sanitizeCIdent(f.alias):m;return`${this.indent()}#define ${y} ${p}_${m}`}).join(`
`):e.alias?`${this.indent()}// alias ${sanitizeCIdent(e.alias)} = ${p}`:`${this.indent()}// import ${p}`}}case"s_extern_function":{const u=sanitizeCIdent(e.name);return this.addLocalVar(e.name),`${this.indent()}// extern function ${u}`}case"s_extern_type":case"s_extern_value":case"s_extern_module":return`${this.indent()}// extern ${e.name||""}`;case"s_expr":{if(((s=e.expr)==null?void 0:s.kind)==="e_for")return this.generateForLoopStatement(e.expr);if(((i=e.expr)==null?void 0:i.kind)==="e_while")return this.generateWhileLoopStatement(e.expr);if(!this.isCpp&&((o=e.expr)==null?void 0:o.kind)==="e_if")return this.generateIfStatement(e.expr);if(!this.isCpp&&((l=e.expr)==null?void 0:l.kind)==="e_break")return`${this.indent()}break;`;if(!this.isCpp&&((c=e.expr)==null?void 0:c.kind)==="e_continue")return`${this.indent()}continue;`;const u=this.generateExpr(e.expr);return`${this.indent()}${u};`}default:return""}}generateFunctionBody(e){if(this.indentLevel++,e.kind==="e_block"){const n=[];if(this.pushScope(),e.statements)for(const r of e.statements)n.push(this.generateStatement(r));return e.result?n.push(`${this.indent()}return ${this.generateExpr(e.result)};`):n.push(`${this.indent()}return ${this.isCpp?"TLValue()":"tl_null()"};`),this.popScope(),this.indentLevel--,n.join(`
`)}if(e.kind==="e_match"){const n=this.generateMatchStatementBody(e.scrutinee,e.arms||[]);return this.indentLevel--,n}const t=`${this.indent()}return ${this.generateExpr(e)};`;return this.indentLevel--,t}generateExpr(e){if(!e)return this.isCpp?"TLValue()":"tl_null()";switch(e.kind){case"e_literal":{if(e.value===null||e.value===void 0)return this.isCpp?"TLValue()":"tl_null()";if(typeof e.value=="string"){const n=this.escapeString(e.value);return this.isCpp?`TLValue("${n}")`:`tl_str("${n}")`}if(typeof e.value=="boolean")return this.isCpp?`TLValue(${e.value?"true":"false"})`:`tl_bool(${e.value?"true":"false"})`;if(typeof e.value=="number")return this.isCpp?`TLValue(${e.value})`:`tl_num(${e.value})`;const t=this.escapeString(String(e.value));return this.isCpp?`TLValue("${t}")`:`tl_str("${t}")`}case"e_var":{const t=this.isLocalVar(e.name),n=["print","println","to_string","concat","parse_int","parse_float","time_now","get_cli_arg","read_file","write_file"],r=["Math","Array","String","Option","Result"];if(!t&&this.zeroArityCtors.has(e.name)&&(!e.modulePath||e.modulePath.length===0))return this.isCpp?`${sanitizeCIdent(e.name)}()`:`${this.getCIdent(e.name)}()`;if(!t&&n.includes(e.name)&&(!e.modulePath||e.modulePath.length===0))return this.isCpp?`typelang::${sanitizeCIdent(e.name)}`:sanitizeCIdent(e.name);if(!t&&r.includes(e.name)&&(!e.modulePath||e.modulePath.length===0))return this.isCpp?`typelang::${sanitizeCIdent(e.name)}`:sanitizeCIdent(e.name);if(e.modulePath&&e.modulePath.length>0){const s=this.isCpp?"::":"_",i=this.isCpp&&STDLIB_MODULES.has(e.modulePath[0])?"typelang::":"",o=e.modulePath.map(sanitizeCIdent).join(s);return`${i}${o}${s}${sanitizeCIdent(e.name)}`}return!t&&!this.isCpp&&this.currentModulePath.length>0?this.getCIdent(e.name):sanitizeCIdent(e.name)}case"e_unary":{const t=this.generateExpr(e.expr);return this.isCpp?e.op==="!"?`(!${t})`:e.op==="-"?`(-${t})`:t:e.op==="!"?`tl_not(${t})`:e.op==="-"?`tl_neg(${t})`:t}case"e_binary":{const t=this.generateExpr(e.left),n=this.generateExpr(e.right);if(this.isCpp)switch(e.op){case"+":return`(${t} + ${n})`;case"-":return`(${t} - ${n})`;case"*":return`(${t} * ${n})`;case"/":return`(${t} / ${n})`;case"%":return`(${t} % ${n})`;case"==":return`(${t} == ${n})`;case"!=":return`(${t} != ${n})`;case"<":return`(${t} < ${n})`;case"<=":return`(${t} <= ${n})`;case">":return`(${t} > ${n})`;case">=":return`(${t} >= ${n})`;case"&&":return`TLValue(${t}.is_truthy() && ${n}.is_truthy())`;case"||":return`TLValue(${t}.is_truthy() || ${n}.is_truthy())`;default:return`(${t} + ${n})`}else switch(e.op){case"+":return`tl_add(${t}, ${n})`;case"-":return`tl_sub(${t}, ${n})`;case"*":return`tl_mul(${t}, ${n})`;case"/":return`tl_div(${t}, ${n})`;case"%":return`tl_mod(${t}, ${n})`;case"==":return`tl_eq(${t}, ${n})`;case"!=":return`tl_ne(${t}, ${n})`;case"<":return`tl_lt(${t}, ${n})`;case"<=":return`tl_le(${t}, ${n})`;case">":return`tl_gt(${t}, ${n})`;case">=":return`tl_ge(${t}, ${n})`;case"&&":return`tl_bool(tl_is_truthy(${t}) && tl_is_truthy(${n}))`;case"||":return`tl_bool(tl_is_truthy(${t}) || tl_is_truthy(${n}))`;default:return`tl_add(${t}, ${n})`}}case"e_assign":{const t=this.generateExpr(e.value),n=e.op||"=";if(e.target.kind==="e_var"){if(this.isCpp)return`(${sanitizeCIdent(e.target.name)} ${n} ${t})`;{const r=sanitizeCIdent(e.target.name);return n==="+="?`(${r} = tl_add(${r}, ${t}))`:n==="-="?`(${r} = tl_sub(${r}, ${t}))`:n==="*="?`(${r} = tl_mul(${r}, ${t}))`:n==="/="?`(${r} = tl_div(${r}, ${t}))`:n==="%="?`(${r} = tl_mod(${r}, ${t}))`:`(${r} = ${t})`}}else if(e.target.kind==="e_field_access"){const r=this.generateExpr(e.target.object);if(this.isCpp){if(n==="=")return`(${r}.set("${e.target.field}", ${t}), ${t})`;{const s=n.slice(0,-1);return`(${r}.set("${e.target.field}", (${r}.get("${e.target.field}") ${s} ${t})), ${r}.get("${e.target.field}"))`}}else return`(${t})`}else if(e.target.kind==="e_index"){const r=this.generateExpr(e.target.target),s=this.generateExpr(e.target.index);return`(${r}[${s}] ${n} ${t})`}return`(${t})`}case"e_call":{const t=this.generateExpr(e.callee),n=(e.args||[]).map(r=>this.generateExpr(r));if(e.callee.kind==="e_var"){const r=e.callee.name,s=this.isLocalVar(r);if(!e.callee.modulePath||e.callee.modulePath.length===0){const c=!s&&!this.isCpp&&this.currentModulePath.length>0?this.getCIdent(r):sanitizeCIdent(r);return s?this.isCpp?`${c}.call({${n.join(", ")}})`:`(${c}.kind == TL_KIND_FN && ${c}.u.fn ? ${c}.u.fn(${n.length}, (TLValue[]){ ${n.join(", ")} }) : tl_null())`:`${c}(${n.join(", ")})`}const i=this.isCpp?"::":"_",o=this.isCpp&&STDLIB_MODULES.has(e.callee.modulePath[0])?"typelang::":"",l=e.callee.modulePath.map(sanitizeCIdent).join(i);return`${o}${l}${i}${sanitizeCIdent(r)}(${n.join(", ")})`}if(e.callee.kind==="e_field_access"){const r=this.generateExpr(e.callee.object),s=e.callee.field;if(e.callee.object.kind==="e_var"){const i=e.callee.object.name;if(!this.isLocalVar(i)&&(STDLIB_MODULES.has(i)||this.currentModulePath.includes(i))){const l=this.isCpp?"::":"_";return`${this.isCpp&&STDLIB_MODULES.has(i)?"typelang::":""}${sanitizeCIdent(i)}${l}${sanitizeCIdent(s)}(${n.join(", ")})`}}return this.isCpp?e.isModuleMethod||e.callee.isModuleMethod?`${r}.get("${s}").call({${n.join(", ")}})`:`${r}.get("${s}").call({${[r,...n].join(", ")}})`:`tl_get_field(${r}, "${s}")`}return this.isCpp?`${t}.call({${n.join(", ")}})`:`${t}`}case"e_method_call":{const t=this.generateExpr(e.object),n=(e.args||[]).map(r=>this.generateExpr(r));if(e.object.kind==="e_var"){const r=sanitizeCIdent(e.object.name);if(r==="Math"||r==="Array"||r==="String"||r==="Option"||r==="Result"){const s=this.isCpp?"::":"_";return`${r}${s}${sanitizeCIdent(e.method)}(${n.join(", ")})`}}return this.isCpp?e.method==="push"&&n.length>0?`${t}.push_val(${n[0]})`:e.method==="len"||e.method==="length"?`typelang::Array::len(${t})`:e.isModuleMethod?`${t}.get("${e.method}").call({${n.join(", ")}})`:`${t}.get("${e.method}").call({${[t,...n].join(", ")}})`:e.method==="push"&&n.length>0?`tl_array_push(${t}, ${n[0]})`:e.method==="len"||e.method==="length"?`tl_len(${t})`:`tl_get_field(${t}, "${e.method}")`}case"e_field_access":{if(e.object.kind==="e_var"){const n=sanitizeCIdent(e.object.name);if(n==="Math"||n==="Array"||n==="String"||n==="Option"||n==="Result")return this.isCpp?"TLValue(TLFunction([](const std::vector<TLValue>& a) { (void)a; return TLValue(); }))":"tl_null()"}const t=this.generateExpr(e.object);return this.isCpp?`${t}.get("${e.field}")`:`tl_get_field(${t}, "${e.field}")`}case"e_index":{const t=this.generateExpr(e.target),n=this.generateExpr(e.index);return this.isCpp?`${t}[${n}]`:`tl_get_index(${t}, ${n})`}case"e_record":{const t=[];for(const n of e.fields||[])t.push({name:n.name,valueCode:this.generateExpr(n.value)});for(const n of e.methods||[]){const r=n.selfParam?[{name:n.selfParam},...n.params||[]]:n.params||[],s=this.generateExpr({kind:"e_lambda",typeParams:[],params:r,body:n.body});t.push({name:n.name,valueCode:s})}if(this.isCpp)return`TLValue::make_record({${t.map(r=>`{"${r.name}", ${r.valueCode}}`).join(", ")}})`;{const n=t.length;if(n===0)return"tl_record(0, NULL, NULL)";const r=t.map(i=>`"${i.name}"`).join(", "),s=t.map(i=>i.valueCode).join(", ");return`tl_record(${n}, (const char*[]){ ${r} }, (const TLValue[]){ ${s} })`}}case"e_record_update":{const t=this.generateExpr(e.base);if(this.isCpp){const n=(e.updates||[]).map(r=>`{"${r.name}", ${this.generateExpr(r.value)}}`);return`[&]() -> TLValue {
  TLValue _b = ${t};
  if (_b.kind != TLKind::Record || !_b.rec_val) _b.rec_val = std::make_shared<TLRecord>();
  TLRecord _r = *_b.rec_val;
  for (const auto& kv : std::map<std::string, TLValue>{${n.join(", ")}}) { _r[kv.first] = kv.second; }
  return TLValue(_r);
}()`}else return t}case"e_tuple":{const t=(e.elements||[]).map(n=>this.generateExpr(n));if(this.isCpp)return`TLValue::make_array({${t.join(", ")}})`;{const n=t.length;return n===0?"tl_array(0, NULL)":`tl_array(${n}, (const TLValue[]){ ${t.join(", ")} })`}}case"e_lambda":{const t=(e.params||[]).map(r=>r.name);this.pushScope(t);const n=this.generateFunctionBody(e.body);if(this.popScope(),this.isCpp)return`TLValue(TLFunction([&](const std::vector<TLValue>& _args) -> TLValue {
  ${(e.params||[]).map((s,i)=>`TLValue ${sanitizeCIdent(s.name)} = (_args.size() > ${i} ? _args[${i}] : TLValue());`).join(" ")}
  try {
${n}
  } catch (const typelang::__TLReturnSignal& __sig) { return __sig.value; }
}))`;{const r=this.freshVar("_tl_lambda"),s=(e.params||[]).map((o,l)=>`  TLValue ${sanitizeCIdent(o.name)} = (argc > ${l} ? argv[${l}] : tl_null());`).join(`
`),i=`static TLValue ${r}(size_t argc, const TLValue* argv) {
  (void)argc; (void)argv;
${s}
${n}
}`;return this.lambdaDecls.push(i),`tl_fn(${r})`}}case"e_if":{const t=this.generateExpr(e.cond),n=this.generateExpr(e.thenExpr),r=e.elseExpr?this.generateExpr(e.elseExpr):this.isCpp?"TLValue()":"tl_null()";return this.isCpp?`(${t}.is_truthy() ? ${n} : ${r})`:`(tl_is_truthy(${t}) ? ${n} : ${r})`}case"e_match":return this.generateMatchExpr(e.scrutinee,e.arms||[]);case"e_switch":{const t=this.generateExpr(e.discriminant);if(this.isCpp){let n=`[&]() -> TLValue {
  TLValue _discr = ${t};
  bool _matched = false, _fallthrough = false;
`;for(const r of e.cases||[]){const i=(r.values&&r.values.length>0?r.values:r.value?[r.value]:[]).map(o=>`(_discr == ${this.generateExpr(o)}).bool_val`).join(" || ");n+=`  if (_fallthrough || (${i})) {
    _matched = true;
    _fallthrough = false;
    try {
      return ${this.generateExpr(r.body)};
    } catch (const typelang::__TLContinueSignal&) { _fallthrough = true; }
    catch (const typelang::__TLBreakSignal&) { return TLValue(); }
  }
`}return e.defaultCase&&(n+=`  if (_fallthrough || !_matched) {
    return ${this.generateExpr(e.defaultCase)};
  }
`),n+=`  return TLValue();
}()`,n}else{let n=`({
  TLValue _discr = ${t};
  TLValue _res = tl_null();
`,r=!0;for(const s of e.cases||[]){const o=(s.values&&s.values.length>0?s.values:s.value?[s.value]:[]).map(l=>`tl_eq_bool(_discr, ${this.generateExpr(l)})`).join(" || ");n+=`  ${r?"":"else "}if (${o}) {
    _res = ${this.generateExpr(s.body)};
  }
`,r=!1}return e.defaultCase&&(n+=`  else {
    _res = ${this.generateExpr(e.defaultCase)};
  }
`),n+=`  _res;
})`,n}}case"e_range":{const t=this.generateExpr(e.start),n=this.generateExpr(e.end),r=e.inclusive?"true":"false";return this.isCpp?`[&]() -> TLValue {
  TLArray _res;
  int64_t _s = (${t}).to_int();
  int64_t _e = (${n}).to_int();
  bool _inc = ${r};
  if (_s <= _e) {
    int64_t _limit = _inc ? _e : _e - 1;
    for (int64_t _i = _s; _i <= _limit; ++_i) _res.push_back(TLValue(_i));
  } else {
    int64_t _limit = _inc ? _e : _e + 1;
    for (int64_t _i = _s; _i >= _limit; --_i) _res.push_back(TLValue(_i));
  }
  return TLValue(_res);
}()`:`({ int64_t _s = (int64_t)tl_to_num(${t}); int64_t _e = (int64_t)tl_to_num(${n}); size_t _len = (_s <= _e ? _e - _s + 1 : _s - _e + 1); TLValue* _arr = (TLValue*)malloc(sizeof(TLValue) * _len); for(size_t _i = 0; _i < _len; ++_i) _arr[_i] = tl_num(_s <= _e ? _s + _i : _s - _i); tl_array(_len, _arr); })`}case"e_list_comp":{const t=sanitizeCIdent(e.param),n=this.generateExpr(e.iterable),r=e.condition?this.isCpp?`if (${this.generateExpr(e.condition)}.is_truthy()) `:`if (tl_is_truthy(${this.generateExpr(e.condition)})) `:"",s=this.generateExpr(e.element);return this.isCpp?`[&]() -> TLValue {
  TLArray _res;
  TLValue _list = ${n};
  if (_list.kind == TLKind::Array && _list.arr_val) {
    for (const auto& ${t} : *_list.arr_val) {
      ${r}_res.push_back(${s});
    }
  }
  return TLValue(_res);
}()`:"tl_null()"}case"e_block":{this.indentLevel++,this.pushScope();const t=[];if(e.statements)for(const r of e.statements)t.push(this.generateStatement(r));const n=e.result?this.generateExpr(e.result):this.isCpp?"TLValue()":"tl_null()";return this.isCpp?(t.push(`${this.indent()}return ${n};`),this.popScope(),this.indentLevel--,`[&]() -> TLValue {
${t.join(`
`)}
}()`):(t.push(`${this.indent()}${n};`),this.popScope(),this.indentLevel--,`({
${t.join(`
`)}
})`)}case"e_for":return this.isCpp?`[&]() -> TLValue {
${this.generateForLoopStatement(e)}
  return TLValue();
}()`:`({
${this.generateForLoopStatement(e)}
  tl_null();
})`;case"e_while":return this.isCpp?`[&]() -> TLValue {
${this.generateWhileLoopStatement(e)}
  return TLValue();
}()`:`({
${this.generateWhileLoopStatement(e)}
  tl_null();
})`;case"e_break":return this.isCpp?"([]() -> TLValue { throw typelang::__TLBreakSignal(); return TLValue(); })()":"tl_null()";case"e_continue":return this.isCpp?"([]() -> TLValue { throw typelang::__TLContinueSignal(); return TLValue(); })()":"tl_null()";case"e_return":{const t=e.value?this.generateExpr(e.value):this.isCpp?"TLValue()":"tl_null()";return this.isCpp?`([&]() -> TLValue { throw typelang::__TLReturnSignal(${t}); return TLValue(); })()`:`return ${t}`}case"e_do":{const t=desugarDo(e);return this.generateExpr(t)}case"e_where":{this.pushScope(),this.indentLevel++;const t=this.insideFunction;this.insideFunction=!0;const n=(e.bindings||[]).map(s=>this.generateStatement(s)).join(`
`);this.insideFunction=t;const r=this.isCpp?`${this.indent()}return ${this.generateExpr(e.expr)};`:`${this.indent()}${this.generateExpr(e.expr)};`;return this.indentLevel--,this.popScope(),this.isCpp?`[&]() -> TLValue {
${n}
${r}
${this.indent()}}()`:`({
${n}
${r}
${this.indent()}})`}default:return this.isCpp?"TLValue()":"tl_null()"}}generateForLoopStatement(e){var i;this.pushScope();let t="";if(e.init)if(e.init.kind==="s_let"){const o=sanitizeCIdent(e.init.name);this.addLocalVar(e.init.name);const l=this.generateExpr(e.init.init);t=`TLValue ${o} = ${l}`}else e.init.kind==="s_expr"?t=this.generateExpr(e.init.expr):(i=e.init.kind)!=null&&i.startsWith("e_")&&(t=this.generateExpr(e.init));const n=e.cond?this.isCpp?`${this.generateExpr(e.cond)}.is_truthy()`:`tl_is_truthy(${this.generateExpr(e.cond)})`:"true",r=e.update?this.generateExpr(e.update):"";let s="";if(e.body.kind==="e_block"){this.indentLevel++;const o=(e.body.statements||[]).map(c=>this.generateStatement(c)),l=e.body.result?`${this.indent()}${this.generateExpr(e.body.result)};`:"";this.indentLevel--,s=`{
${[...o,l].filter(Boolean).join(`
`)}
${this.indent()}}`}else s=`{
${this.indent()}  ${this.generateExpr(e.body)};
${this.indent()}}`;return this.popScope(),this.isCpp?`${this.indent()}try { for (${t}; ${n}; ${r}) { try ${s} catch(const typelang::__TLContinueSignal&) { continue; } } } catch(const typelang::__TLBreakSignal&) {}`:`${this.indent()}for (${t}; ${n}; ${r}) ${s}`}generateWhileLoopStatement(e){this.pushScope();const t=e.cond?this.isCpp?`${this.generateExpr(e.cond)}.is_truthy()`:`tl_is_truthy(${this.generateExpr(e.cond)})`:"true";let n="";if(e.body.kind==="e_block"){this.indentLevel++;const r=(e.body.statements||[]).map(i=>this.generateStatement(i)),s=e.body.result?`${this.indent()}${this.generateExpr(e.body.result)};`:"";this.indentLevel--,n=`{
${[...r,s].filter(Boolean).join(`
`)}
${this.indent()}}`}else n=`{
${this.indent()}  ${this.generateExpr(e.body)};
${this.indent()}}`;return this.popScope(),this.isCpp?`${this.indent()}try { while (${t}) { try ${n} catch(const typelang::__TLContinueSignal&) { continue; } } } catch(const typelang::__TLBreakSignal&) {}`:`${this.indent()}while (${t}) ${n}`}generateIfStatement(e){const t=`tl_is_truthy(${this.generateExpr(e.cond)})`;this.indentLevel++;let n="";if(e.thenExpr&&e.thenExpr.kind==="e_block"){const s=(e.thenExpr.statements||[]).map(o=>this.generateStatement(o)),i=e.thenExpr.result?`${this.indent()}${this.generateExpr(e.thenExpr.result)};`:"";n=[...s,i].filter(Boolean).join(`
`)}else e.thenExpr&&(n=`${this.indent()}${this.generateExpr(e.thenExpr)};`);this.indentLevel--;let r="";if(e.elseExpr)if(e.elseExpr.kind==="e_if")r=` else ${this.generateIfStatement(e.elseExpr).trimStart()}`;else{this.indentLevel++;let s="";if(e.elseExpr.kind==="e_block"){const i=(e.elseExpr.statements||[]).map(l=>this.generateStatement(l)),o=e.elseExpr.result?`${this.indent()}${this.generateExpr(e.elseExpr.result)};`:"";s=[...i,o].filter(Boolean).join(`
`)}else s=`${this.indent()}${this.generateExpr(e.elseExpr)};`;this.indentLevel--,r=` else {
${s}
${this.indent()}}`}return`${this.indent()}if (${t}) {
${n}
${this.indent()}}${r}`}generateMatchStatementBody(e,t){const n=this.generateExpr(e),r=this.freshVar("_match_val"),s=[];s.push(`${this.indent()}TLValue ${r} = ${n};`);for(const i of t){const o=this.generatePatternCondition(i.pattern,r),l=this.generatePatternBindings(i.pattern,r),c=collectPatternVarNames(i.pattern);this.pushScope(c);const u=this.generateExpr(i.body),p=i.guard?this.generateExpr(i.guard):"";if(this.popScope(),s.push(`${this.indent()}if (${o}) {`),this.indentLevel++,l.trim()&&s.push(`${this.indent()}${l}`),i.guard){const d=this.isCpp?`if (${p}.is_truthy())`:`if (tl_is_truthy(${p}))`;s.push(`${this.indent()}${d} {`),this.indentLevel++,s.push(`${this.indent()}return ${u};`),this.indentLevel--,s.push(`${this.indent()}}`)}else s.push(`${this.indent()}return ${u};`);this.indentLevel--,s.push(`${this.indent()}}`)}return s.push(`${this.indent()}return ${this.isCpp?"TLValue()":"tl_null()"};`),s.join(`
`)}generateMatchExpr(e,t){const n=this.generateExpr(e),r=this.freshVar("_match_val");if(this.isCpp){const s=(t||[]).map(i=>{const o=this.generatePatternCondition(i.pattern,r),l=this.generatePatternBindings(i.pattern,r),c=collectPatternVarNames(i.pattern);this.pushScope(c);const u=this.generateExpr(i.body),p=i.guard?this.generateExpr(i.guard):"";this.popScope();let d="";return i.guard?d=`  if (${p}.is_truthy()) {
    return ${u};
  }`:d=`  return ${u};`,`if (${o}) {
  ${l}
${d}
}`});return`[&]() -> TLValue {
  TLValue ${r} = ${n};
  ${s.join(`
  `)}
  return TLValue();
}()`}else{const s=(t||[]).map(i=>{const o=this.generatePatternCondition(i.pattern,r),l=this.generatePatternBindings(i.pattern,r),c=collectPatternVarNames(i.pattern);this.pushScope(c);const u=this.generateExpr(i.body),p=i.guard?this.generateExpr(i.guard):"";this.popScope();let d="";return i.guard?d=`if (tl_is_truthy(${p})) {
      _res = ${u};
      _done = true;
    }`:d=`_res = ${u};
    _done = true;`,`if (!_done && (${o})) {
    ${l}
    ${d}
  }`});return`({
  TLValue ${r} = ${n};
  TLValue _res = tl_null();
  bool _done = false;
  ${s.join(`
  `)}
  _res;
})`}}generatePatternCondition(e,t){if(!e)return"true";switch(e.kind){case"p_wildcard":case"p_var":return"true";case"p_literal":{const n=this.generateExpr({kind:"e_literal",value:e.value});return this.isCpp?`(${t} == ${n}).bool_val`:`tl_eq_bool(${t}, ${n})`}case"p_ctor":return this.isCpp?`(${t}.kind == TLKind::Variant && ${t}.var_val && ${t}.var_val->tag == "${e.name}")`:`tl_is_tag(${t}, "${e.name}").u.b`;case"p_tuple":if(this.isCpp){const n=(e.elements||[]).map((r,s)=>this.generatePatternCondition(r,`(${t}[TLValue(${s})])`));return`(${t}.kind == TLKind::Array && ${t}.arr_val && ${t}.arr_val->size() >= ${e.elements.length} ${n.length>0?"&& "+n.join(" && "):""})`}else{const n=(e.elements||[]).map((r,s)=>this.generatePatternCondition(r,`tl_get_index(${t}, tl_num(${s}))`));return`(${t}.kind == TL_KIND_ARR && ${t}.u.arr && ${t}.u.arr->len >= ${e.elements.length} ${n.length>0?"&& "+n.join(" && "):""})`}case"p_record":if(this.isCpp){const n=(e.fields||[]).map(r=>`(${t}.get("${r.name}").kind != TLKind::Null)`);return`(${t}.kind == TLKind::Record && ${t}.rec_val ${n.length>0?"&& "+n.join(" && "):""})`}else{const n=(e.fields||[]).map(r=>`(tl_get_field(${t}, "${r.name}").kind != TL_KIND_NULL)`);return`(${t}.kind == TL_KIND_REC && ${t}.u.rec ${n.length>0?"&& "+n.join(" && "):""})`}default:return"true"}}generatePatternBindings(e,t){if(!e)return"";switch(e.kind){case"p_var":return`TLValue ${sanitizeCIdent(e.name)} = ${t};`;case"p_ctor":return(e.args||[]).map((r,s)=>r.kind==="p_var"?this.isCpp?`TLValue ${sanitizeCIdent(r.name)} = (${t}.var_val->args.size() > ${s} ? ${t}.var_val->args[${s}] : TLValue());`:`TLValue ${sanitizeCIdent(r.name)} = tl_var_arg(${t}, ${s});`:"").filter(Boolean).join(`
  `);case"p_record":return(e.fields||[]).map(r=>{const s=r.alias?sanitizeCIdent(r.alias):sanitizeCIdent(r.name);return this.isCpp?`TLValue ${s} = ${t}.get("${r.name}");`:`TLValue ${s} = tl_get_field(${t}, "${r.name}");`}).join(`
  `);case"p_tuple":return(e.elements||[]).map((r,s)=>r.kind==="p_var"?this.isCpp?`TLValue ${sanitizeCIdent(r.name)} = ${t}[TLValue(${s})];`:`TLValue ${sanitizeCIdent(r.name)} = tl_get_index(${t}, tl_num(${s}));`:"").filter(Boolean).join(`
  `);default:return""}}escapeString(e){return e?e.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"\\n").replace(/\r/g,"\\r").replace(/\t/g,"\\t"):""}}class WasmCodeGenerator{constructor(){this.indentLevel=0,this.stringTable=new Map,this.nextStringOffset=1024,this.functionNames=new Set,this.fnSignatures=new Map,this.currentLocals=new Map,this.localCounter=0,this.loopStack=[],this.gadtConstructors=new Map,this.zeroArityCtors=new Set,this.lambdas=[],this.lambdaCounter=0,this.topLevelGlobals=new Map,this.capturedGlobals=new Set,this.isTopLevel=!1}indent(){return"  ".repeat(this.indentLevel)}registerString(e){if(this.stringTable.has(e))return this.stringTable.get(e);const n=new TextEncoder().encode(e).length,r=this.nextStringOffset,s=4+n+1+7&-8;this.nextStringOffset+=s;const i={offset:r,len:n};return this.stringTable.set(e,i),i}sanitizeWasmIdent(e){return e.replace(/[^a-zA-Z0-9_]/g,"_")}registerConstructor(e,t,n,r){this.gadtConstructors.set(e,{name:e,tag:t,arity:n,typeName:r}),n===0&&this.zeroArityCtors.add(e),this.functionNames.add(e),this.fnSignatures.set(e,"i32")}isStringExpr(e){if(!e)return!1;if(e.kind==="e_literal"&&typeof e.value=="string")return!0;if(e.kind==="e_var")return(this.currentLocals.get(e.name)||this.topLevelGlobals.get(e.name))==="i32";if(e.kind==="e_call"&&e.callee.kind==="e_var"){const t=e.callee.name;return["concat","to_string","read_file","get_cli_arg","String_slice","String_charAt","char_at","charAt"].includes(t)?!0:this.fnSignatures.get(t)==="i32"}return!!(e.kind==="e_method_call"&&["charAt","char_at"].includes(e.method))}isI32Expr(e){if(!e)return!1;if(e.kind==="e_literal"&&typeof e.value=="string"||e.kind==="e_tuple"||e.kind==="e_record")return!0;if(e.kind==="e_var")return this.zeroArityCtors.has(e.name)?!0:(this.currentLocals.get(e.name)||this.topLevelGlobals.get(e.name))==="i32";if(e.kind==="e_call"&&e.callee.kind==="e_var"){const t=e.callee.name;return this.gadtConstructors.has(t)||["concat","to_string","read_file","get_cli_arg","String_slice","String_charAt","char_at","charAt"].includes(t)?!0:this.fnSignatures.get(t)==="i32"}return!1}ensureF64(e,t){return t.trim()?this.isI32Expr(e)?`${this.indent()}(f64.convert_i32_u
${t}
${this.indent()})`:t:`${this.indent()}(f64.const 0)`}ensureI32(e,t){return t.trim()?this.isI32Expr(e)?t:`${this.indent()}(i32.trunc_f64_u
${t}
${this.indent()})`:`${this.indent()}(i32.const 0)`}generateWat(e,t={}){this.stringTable.clear(),this.nextStringOffset=1024,this.functionNames.clear(),this.fnSignatures.clear(),this.gadtConstructors.clear(),this.zeroArityCtors.clear(),this.lambdas=[],this.lambdaCounter=0,this.topLevelGlobals.clear(),this.capturedGlobals.clear(),this.loopStack=[],this.fnSignatures.set("println","void"),this.fnSignatures.set("print","void"),this.fnSignatures.set("concat","i32"),this.fnSignatures.set("to_string","i32"),this.fnSignatures.set("len","f64"),this.fnSignatures.set("push","i32"),this.fnSignatures.set("char_at","i32"),this.fnSignatures.set("charAt","i32"),this.fnSignatures.set("time_now","f64"),this.fnSignatures.set("read_file","i32"),this.fnSignatures.set("write_file","f64"),this.fnSignatures.set("get_cli_arg","i32"),this.fnSignatures.set("parse_int","f64"),this.fnSignatures.set("parse_float","f64"),this.registerConstructor("Some",0,1,"Option"),this.registerConstructor("None",1,0,"Option"),this.registerConstructor("Ok",0,1,"Result"),this.registerConstructor("Err",1,1,"Result"),this.registerConstructor("Left",0,1,"Either"),this.registerConstructor("Right",1,1,"Either"),this.registerConstructor("Cons",0,2,"List"),this.registerConstructor("Nil",1,0,"List");for(const h of e.statements)h.kind==="s_gadt"&&h.decl.constructors.forEach((T,L)=>{this.registerConstructor(T.name,L,T.params.length,h.decl.name)});for(const h of e.statements)if(h.kind==="s_function"){this.functionNames.add(h.name);let T="f64";if(h.returnType){const L=h.returnType.name,A=h.returnType.kind;L==="void"?T="void":L==="string"||A==="t_array"?T="i32":T="f64"}this.fnSignatures.set(h.name,T)}const n=h=>{if(h){if(h.kind==="s_function"&&h.params)for(const T of h.params)this.capturedGlobals.add(T.name);if(h.kind==="e_lambda"&&h.params)for(const T of h.params)this.capturedGlobals.add(T.name);h.kind==="p_var"&&h.name&&this.capturedGlobals.add(h.name);for(const T of Object.keys(h)){const L=h[T];L&&typeof L=="object"&&(Array.isArray(L)?L.forEach(n):n(L))}}};n(e);for(const h of e.statements)if(h.kind==="s_let"){let T="f64";if(h.typeAnnotation){const L=h.typeAnnotation.name,A=h.typeAnnotation.kind;(L==="string"||A==="t_array")&&(T="i32")}T==="f64"&&h.init&&(h.init.kind==="e_literal"&&typeof h.init.value=="string"||h.init.kind==="e_tuple"||h.init.kind==="e_record"||this.isStringExpr(h.init))&&(T="i32"),this.topLevelGlobals.set(h.name,T)}const r=t.initialMemoryPages||2,s=t.maxMemoryPages||100,i=[];for(const h of this.gadtConstructors.values()){const T=this.sanitizeWasmIdent(h.name);if(h.arity===0)i.push([`  (func $${T} (result i32)`,`    (call $gadt_create (i32.const ${h.tag}) (i32.const 0))`,"  )"].join(`
`));else{const L=Array.from({length:h.arity},(V,I)=>`(param $p${I} f64)`).join(" "),A=Array.from({length:h.arity},(V,I)=>`    (call $gadt_set_field (local.get $ptr) (i32.const ${I}) (local.get $p${I}))`).join(`
`);i.push([`  (func $${T} ${L} (result i32)`,"    (local $ptr i32)",`    (local.set $ptr (call $gadt_create (i32.const ${h.tag}) (i32.const ${h.arity})))`,A,"    (local.get $ptr)","  )"].join(`
`))}}const o=[],l=[];this.isTopLevel=!1;for(const h of e.statements)h.kind==="s_function"&&o.push(this.generateFunction(h));this.currentLocals.clear(),this.localCounter=0,this.indentLevel=2,this.isTopLevel=!0;for(const h of e.statements)if(h.kind!=="s_function"){const T=this.generateStatement(h);T.trim()&&l.push(T)}this.isTopLevel=!1;const c=[];let u=0;for(;u<this.lambdas.length;){const h=this.lambdas[u++];c.push(this.generateLambda(h))}const p=[];for(const[h,T]of this.stringTable.entries()){const L=new TextEncoder().encode(h),A=L.length;let I=[(A&255).toString(16).padStart(2,"0"),(A>>8&255).toString(16).padStart(2,"0"),(A>>16&255).toString(16).padStart(2,"0"),(A>>24&255).toString(16).padStart(2,"0")].map(P=>`\\${P}`).join("");for(let P=0;P<A;P++){const $=L[P];$>=32&&$<=126&&$!==34&&$!==92?I+=String.fromCharCode($):I+=`\\${$.toString(16).padStart(2,"0")}`}I+="\\00",p.push(`  (data (i32.const ${T.offset}) "${I}")`)}const d=[];for(const[h,T]of this.currentLocals.entries())d.push(`    (local $${this.sanitizeWasmIdent(h)} ${T})`);const f=[];for(const[h,T]of this.topLevelGlobals.entries()){const L=T==="i32"?"(i32.const 0)":"(f64.const 0.0)";f.push(`  (global $${this.sanitizeWasmIdent(h)} (mut ${T}) ${L})`)}for(const h of this.capturedGlobals)f.push(`  (global $g_var_${this.sanitizeWasmIdent(h)} (mut f64) (f64.const 0.0))`);const m=Math.max(16,this.lambdas.length+2),y=this.lambdas.map(h=>`$${h.funcName}`),_=[`  (table (export "table") ${m} funcref)`];return y.length>0&&_.push(`  (elem (i32.const 1) ${y.join(" ")})`),["(module","  ;; ==========================================================================","  ;; Generated by TypeLang WebAssembly (WASM / WAT) Code Generator","  ;; ==========================================================================","","  ;; --- Host Runtime Imports ---",'  (import "host" "println_str" (func $host_println_str (param i32 i32)))','  (import "host" "print_str" (func $host_print_str (param i32 i32)))','  (import "host" "println_num" (func $host_println_num (param f64)))','  (import "host" "print_num" (func $host_print_num (param f64)))','  (import "host" "num_to_str" (func $host_num_to_str (param f64) (result i32)))','  (import "host" "parse_int" (func $host_parse_int (param i32) (result f64)))','  (import "host" "parse_float" (func $host_parse_float (param i32) (result f64)))','  (import "host" "read_file" (func $host_read_file (param i32 i32) (result i32)))','  (import "host" "write_file" (func $host_write_file (param i32 i32 i32 i32) (result f64)))','  (import "host" "get_cli_arg" (func $host_get_cli_arg (param f64) (result i32)))','  (import "host" "time_now" (func $host_time_now (result f64)))','  (import "host" "math_pow" (func $host_math_pow (param f64 f64) (result f64)))',"","  ;; --- Indirect Function Signatures ---","  (type $sig_0 (func (result f64)))","  (type $sig_1 (func (param f64) (result f64)))","  (type $sig_2 (func (param f64 f64) (result f64)))","  (type $sig_3 (func (param f64 f64 f64) (result f64)))","  (type $sig_4 (func (param f64 f64 f64 f64) (result f64)))","",`  ;; --- Linear Memory (${r} initial pages = ${r*64}KB) ---`,`  (memory (export "memory") ${r} ${s})`,`  (global $heap_ptr (mut i32) (i32.const ${this.nextStringOffset}))`,'  (export "heap_ptr" (global $heap_ptr))',"","  ;; --- Module Globals & Closure Storage ---",...f,"","  ;; --- Function Table ---",..._,"","  ;; --- Built-in Dynamic Allocator with Auto-Growth ---",'  (func $alloc (export "alloc") (param $size i32) (result i32)',"    (local $ptr i32)","    (local $new_heap i32)","    (local $mem_size_bytes i32)","    (local.set $ptr (global.get $heap_ptr))","    (local.set $new_heap (i32.and (i32.add (i32.add (local.get $ptr) (local.get $size)) (i32.const 7)) (i32.const -8)))","    (local.set $mem_size_bytes (i32.mul (memory.size) (i32.const 65536)))","    (if (i32.gt_u (local.get $new_heap) (local.get $mem_size_bytes))","      (then","        (drop (memory.grow (i32.add (i32.div_u (i32.sub (local.get $new_heap) (local.get $mem_size_bytes)) (i32.const 65536)) (i32.const 1))))","      )","    )","    (global.set $heap_ptr (local.get $new_heap))","    (local.get $ptr)","  )","","  ;; --- Output Helpers ---","  (func $println_str_val (param $ptr i32)","    (if (i32.ne (local.get $ptr) (i32.const 0))","      (then","        (call $host_println_str","          (i32.add (local.get $ptr) (i32.const 4))","          (i32.load (local.get $ptr))","        )","      )","      (else","        (call $host_println_str (i32.const 0) (i32.const 0))","      )","    )","  )","","  (func $print_str_val (param $ptr i32)","    (if (i32.ne (local.get $ptr) (i32.const 0))","      (then","        (call $host_print_str","          (i32.add (local.get $ptr) (i32.const 4))","          (i32.load (local.get $ptr))","        )","      )","    )","  )","","  ;; --- Math Modulo ---","  (func $mod (param $a f64) (param $b f64) (result f64)","    (if (result f64) (f64.eq (local.get $b) (f64.const 0.0))","      (then (f64.const 0.0))","      (else","        (f64.sub (local.get $a) (f64.mul (f64.trunc (f64.div (local.get $a) (local.get $b))) (local.get $b)))","      )","    )","  )","","  ;; --- Built-in Dynamic Array Utilities ---","  ;; Array Header: [len: i32, cap: i32, items: f64[]]","  (func $array_create (param $len i32) (result i32)","    (local $ptr i32)","    (local $bytes i32)","    (local.set $bytes (i32.add (i32.const 8) (i32.mul (local.get $len) (i32.const 8))))","    (local.set $ptr (call $alloc (local.get $bytes)))","    (i32.store (local.get $ptr) (local.get $len))","    (i32.store offset=4 (local.get $ptr) (local.get $len))","    (local.get $ptr)","  )","","  (func $array_get (param $arr i32) (param $idx f64) (result f64)","    (local $i i32)","    (if (result f64) (i32.eqz (local.get $arr))","      (then (f64.const 0.0))","      (else","        (local.set $i (i32.trunc_f64_u (local.get $idx)))","        (f64.load (i32.add (i32.add (local.get $arr) (i32.const 8)) (i32.mul (local.get $i) (i32.const 8))))","      )","    )","  )","","  (func $array_set (param $arr i32) (param $idx f64) (param $val f64) (result f64)","    (local $i i32)","    (if (result f64) (i32.eqz (local.get $arr))","      (then (local.get $val))","      (else","        (local.set $i (i32.trunc_f64_u (local.get $idx)))","        (f64.store (i32.add (i32.add (local.get $arr) (i32.const 8)) (i32.mul (local.get $i) (i32.const 8))) (local.get $val))","        (local.get $val)","      )","    )","  )","","  (func $array_push (param $arr i32) (param $val f64) (result i32)","    (local $len i32)","    (if (result i32) (i32.eqz (local.get $arr))","      (then (i32.const 0))","      (else","        (local.set $len (i32.load (local.get $arr)))","        (f64.store (i32.add (i32.add (local.get $arr) (i32.const 8)) (i32.mul (local.get $len) (i32.const 8))) (local.get $val))","        (i32.store (local.get $arr) (i32.add (local.get $len) (i32.const 1)))","        (local.get $arr)","      )","    )","  )","","  ;; --- Built-in Algebraic Data Type (GADT / Sum Type) Utilities ---","  ;; GADT Header: [tag: i32, arity: i32, payload: f64[]]","  (func $gadt_create (param $tag i32) (param $arity i32) (result i32)","    (local $ptr i32)","    (local.set $ptr (call $alloc (i32.add (i32.const 8) (i32.mul (local.get $arity) (i32.const 8)))))","    (i32.store (local.get $ptr) (local.get $tag))","    (i32.store offset=4 (local.get $ptr) (local.get $arity))","    (local.get $ptr)","  )","","  (func $gadt_get_tag (param $ptr i32) (result i32)","    (if (result i32) (i32.eqz (local.get $ptr))","      (then (i32.const -1))","      (else (i32.load (local.get $ptr)))","    )","  )","","  (func $gadt_get_field (param $ptr i32) (param $idx i32) (result f64)","    (if (result f64) (i32.eqz (local.get $ptr))","      (then (f64.const 0.0))","      (else","        (f64.load (i32.add (i32.add (local.get $ptr) (i32.const 8)) (i32.mul (local.get $idx) (i32.const 8))))","      )","    )","  )","","  (func $gadt_set_field (param $ptr i32) (param $idx i32) (param $val f64)","    (if (i32.ne (local.get $ptr) (i32.const 0))","      (then","        (f64.store (i32.add (i32.add (local.get $ptr) (i32.const 8)) (i32.mul (local.get $idx) (i32.const 8))) (local.get $val))","      )","    )","  )","","  ;; --- Built-in Record / Object Utilities ---","  ;; Record Header: [num_fields: i32, fields: { key_str: i32, val: f64 }[]]","  (func $record_create (param $num_fields i32) (result i32)","    (local $ptr i32)","    (local.set $ptr (call $alloc (i32.add (i32.const 8) (i32.mul (local.get $num_fields) (i32.const 16)))))","    (i32.store (local.get $ptr) (local.get $num_fields))","    (local.get $ptr)","  )","","  (func $record_set (param $rec i32) (param $idx i32) (param $key i32) (param $val f64)","    (if (i32.ne (local.get $rec) (i32.const 0))","      (then","        (i32.store (i32.add (i32.add (local.get $rec) (i32.const 8)) (i32.mul (local.get $idx) (i32.const 16))) (local.get $key))","        (f64.store (i32.add (i32.add (local.get $rec) (i32.const 16)) (i32.mul (local.get $idx) (i32.const 16))) (local.get $val))","      )","    )","  )","","  (func $record_get (param $rec i32) (param $key i32) (result f64)","    (local $count i32)","    (local $i i32)","    (local $k i32)","    (if (result f64) (i32.eqz (local.get $rec))","      (then (f64.const 0.0))","      (else","        (local.set $count (i32.load (local.get $rec)))","        (local.set $i (i32.const 0))","        (block $b_rec (loop $l_rec","          (br_if $b_rec (i32.ge_u (local.get $i) (local.get $count)))","          (local.set $k (i32.load (i32.add (i32.add (local.get $rec) (i32.const 8)) (i32.mul (local.get $i) (i32.const 16)))))","          (if (i32.or (i32.eq (local.get $k) (local.get $key)) (f64.ne (call $str_eq (local.get $k) (local.get $key)) (f64.const 0.0)))","            (then","              (return (f64.load (i32.add (i32.add (local.get $rec) (i32.const 16)) (i32.mul (local.get $i) (i32.const 16)))))","            )","          )","          (local.set $i (i32.add (local.get $i) (i32.const 1)))","          (br $l_rec)","        ))","        (f64.const 0.0)","      )","    )","  )","","  ;; --- Built-in String Utilities ---","  (func $concat (param $s1 i32) (param $s2 i32) (result i32)","    (local $len1 i32)","    (local $len2 i32)","    (local $totalLen i32)","    (local $newPtr i32)","    (local $i i32)","    (if (i32.eqz (local.get $s1)) (then (return (local.get $s2))))","    (if (i32.eqz (local.get $s2)) (then (return (local.get $s1))))","    (local.set $len1 (i32.load (local.get $s1)))","    (local.set $len2 (i32.load (local.get $s2)))","    (local.set $totalLen (i32.add (local.get $len1) (local.get $len2)))","    (local.set $newPtr (call $alloc (i32.add (local.get $totalLen) (i32.const 5))))","    (i32.store (local.get $newPtr) (local.get $totalLen))","    ;; Copy bytes from s1","    (local.set $i (i32.const 0))","    (block $b1 (loop $l1","      (br_if $b1 (i32.ge_u (local.get $i) (local.get $len1)))","      (i32.store8 (i32.add (i32.add (local.get $newPtr) (i32.const 4)) (local.get $i))","                  (i32.load8_u (i32.add (i32.add (local.get $s1) (i32.const 4)) (local.get $i))))","      (local.set $i (i32.add (local.get $i) (i32.const 1)))","      (br $l1)","    ))","    ;; Copy bytes from s2","    (local.set $i (i32.const 0))","    (block $b2 (loop $l2","      (br_if $b2 (i32.ge_u (local.get $i) (local.get $len2)))","      (i32.store8 (i32.add (i32.add (i32.add (local.get $newPtr) (i32.const 4)) (local.get $len1)) (local.get $i))","                  (i32.load8_u (i32.add (i32.add (local.get $s2) (i32.const 4)) (local.get $i))))","      (local.set $i (i32.add (local.get $i) (i32.const 1)))","      (br $l2)","    ))","    (i32.store8 (i32.add (i32.add (local.get $newPtr) (i32.const 4)) (local.get $totalLen)) (i32.const 0))","    (local.get $newPtr)","  )","","  (func $str_eq (param $s1 i32) (param $s2 i32) (result f64)","    (local $len1 i32)","    (local $len2 i32)","    (local $i i32)","    (if (i32.eq (local.get $s1) (local.get $s2)) (then (return (f64.const 1.0))))","    (if (i32.or (i32.eqz (local.get $s1)) (i32.eqz (local.get $s2))) (then (return (f64.const 0.0))))","    (local.set $len1 (i32.load (local.get $s1)))","    (local.set $len2 (i32.load (local.get $s2)))","    (if (i32.ne (local.get $len1) (local.get $len2)) (then (return (f64.const 0.0))))","    (local.set $i (i32.const 0))","    (block $exit (loop $loop","      (br_if $exit (i32.ge_u (local.get $i) (local.get $len1)))","      (if (i32.ne","            (i32.load8_u (i32.add (i32.add (local.get $s1) (i32.const 4)) (local.get $i)))","            (i32.load8_u (i32.add (i32.add (local.get $s2) (i32.const 4)) (local.get $i))))","        (then (return (f64.const 0.0))))","      (local.set $i (i32.add (local.get $i) (i32.const 1)))","      (br $loop)","    ))","    (f64.const 1.0)","  )","","  (func $str_char_at (param $str i32) (param $idx f64) (result i32)","    (local $i i32)","    (local $len i32)","    (local $newPtr i32)","    (if (i32.eqz (local.get $str)) (then (return (i32.const 0))))","    (local.set $len (i32.load (local.get $str)))","    (local.set $i (i32.trunc_f64_u (local.get $idx)))","    (if (i32.ge_u (local.get $i) (local.get $len)) (then (return (i32.const 0))))","    (local.set $newPtr (call $alloc (i32.const 6)))","    (i32.store (local.get $newPtr) (i32.const 1))","    (i32.store8 (i32.add (local.get $newPtr) (i32.const 4))","                (i32.load8_u (i32.add (i32.add (local.get $str) (i32.const 4)) (local.get $i))))","    (i32.store8 (i32.add (local.get $newPtr) (i32.const 5)) (i32.const 0))","    (local.get $newPtr)","  )","","  ;; --- Built-in Generic Length Query ---","  (func $len (param $obj i32) (result f64)","    (if (result f64) (i32.eqz (local.get $obj))","      (then (f64.const 0.0))","      (else (f64.convert_i32_u (i32.load (local.get $obj))))","    )","  )","","  ;; --- Static Data Segments (String Literals) ---",...p,"","  ;; --- Algebraic Data Type Constructors ---",...i,"","  ;; --- User Functions ---",...o,"","  ;; --- Lambdas & Closures ---",...c,"","  ;; --- Main Entry Point ---",'  (func (export "_start") (export "main") (result f64)',...d,...l,"    (f64.const 0)","  )",")"].join(`
`)}generateFunction(e){const t=this.sanitizeWasmIdent(e.name);this.currentLocals.clear();const n=[];for(const u of e.params){const p=this.sanitizeWasmIdent(u.name),d=u.type&&(u.type.name==="string"||u.type.kind==="t_array")?"i32":"f64";this.currentLocals.set(u.name,d),n.push(`(param $${p} ${d})`)}const r=this.fnSignatures.get(e.name)||"f64",s=r==="void",i=s?"":`(result ${r})`;this.indentLevel=2;const o=this.generateFunctionBody(e.body,s,r),l=[];for(const[u,p]of this.currentLocals.entries())e.params.some(d=>d.name===u)||l.push(`    (local $${this.sanitizeWasmIdent(u)} ${p})`);return[`  (func $${t} ${n.join(" ")} ${i}`.trimEnd(),...l,o,"  )"].join(`
`)}generateLambda(e){const t=e.expr,n=new Map(this.currentLocals);this.currentLocals.clear();const r=[],s=[],i=[];t.params.forEach((l,c)=>{const u=this.sanitizeWasmIdent(l.name);this.currentLocals.set(l.name,"f64"),r.push(`(param $p${c} f64)`),i.push(`    (local $${u} f64)`),s.push(`    (local.set $${u} (local.get $p${c}))`),s.push(`    (global.set $g_var_${u} (local.get $p${c}))`)}),this.indentLevel=2;const o=this.generateFunctionBody(t.body,!1,"f64");for(const[l,c]of this.currentLocals.entries())t.params.some(u=>u.name===l)||i.push(`    (local $${this.sanitizeWasmIdent(l)} ${c})`);return this.currentLocals=n,[`  (func $${e.funcName} ${r.join(" ")} (result f64)`,...i,...s,o,"  )"].join(`
`)}generateFunctionBody(e,t,n){if(!e)return t?"":`${this.indent()}(${n}.const 0)`;if(e.kind==="e_block"){const s=e.statements,i=s.length,o=[];for(let l=0;l<i;l++){const c=s[l];if(l===i-1&&!e.result&&!t)if(c.kind==="s_expr"&&c.expr){const p=this.generateExpr(c.expr,!1);o.push(n==="f64"?this.ensureF64(c.expr,p):p)}else o.push(this.generateStatement(c)),o.push(`${this.indent()}(${n}.const 0)`);else o.push(this.generateStatement(c))}if(e.result)if(t)o.push(this.generateStatement({kind:"s_expr",expr:e.result}));else{const l=this.generateExpr(e.result,!1);o.push(n==="f64"?this.ensureF64(e.result,l):l)}else i===0&&!t&&o.push(`${this.indent()}(${n}.const 0)`);return o.filter(l=>l.trim()).join(`
`)}if(t)return this.generateExpr(e,!0);const r=this.generateExpr(e,!1);return n==="f64"?this.ensureF64(e,r):r}generateStatement(e){switch(e.kind){case"s_let":{const t=this.sanitizeWasmIdent(e.name);let n="f64";if(e.typeAnnotation){const s=e.typeAnnotation.name,i=e.typeAnnotation.kind;(s==="string"||i==="t_array")&&(n="i32")}n==="f64"&&e.init&&(e.init.kind==="e_literal"&&typeof e.init.value=="string"||e.init.kind==="e_tuple"||e.init.kind==="e_record"||this.isStringExpr(e.init))&&(n="i32"),this.currentLocals.set(e.name,n);let r=this.generateExpr(e.init,!1);return n==="f64"&&this.isI32Expr(e.init)?r=this.ensureF64(e.init,r):n==="i32"&&!this.isI32Expr(e.init)&&(r=this.ensureI32(e.init,r)),this.isTopLevel?(this.topLevelGlobals.set(e.name,n),`${this.indent()}(local.set $${t}
${r}
${this.indent()})
${this.indent()}(global.set $${t} (local.get $${t}))`):`${this.indent()}(local.set $${t}
${r}
${this.indent()})`}case"s_gadt":return"";case"s_expr":{if(!e.expr)return"";if(e.expr.kind==="e_assign"&&e.expr.target.kind==="e_var")return this.generateExpr(e.expr,!0);if(e.expr.kind==="e_call"&&e.expr.callee.kind==="e_var"){const n=e.expr.callee.name;if(this.fnSignatures.get(n)==="void")return this.generateExpr(e.expr,!0)}if(e.expr.kind==="e_while"||e.expr.kind==="e_for")return this.generateExpr(e.expr,!0);if(e.expr.kind==="e_if")return this.generateExpr(e.expr,!0);if(e.expr.kind==="e_match")return this.generateExpr(e.expr,!0);if(e.expr.kind==="e_return")return this.generateExpr(e.expr,!0);const t=this.generateExpr(e.expr,!1);return`${this.indent()}(drop
${t}
${this.indent()})`}default:return""}}generateCondition(e){if(!e)return"(i32.const 1)";if(e.kind==="e_binary"){const n=e.op;if(["<","<=",">",">=","==","!="].includes(n)){const r=this.generateExpr(e.left,!1),s=this.generateExpr(e.right,!1);if(n==="==")return this.isStringExpr(e.left)||this.isStringExpr(e.right)?`(i32.trunc_f64_u (call $str_eq
${r}
${s}
${this.indent()}))`:`(f64.eq
${r}
${s}
${this.indent()})`;if(n==="!=")return this.isStringExpr(e.left)||this.isStringExpr(e.right)?`(i32.eqz (i32.trunc_f64_u (call $str_eq
${r}
${s}
${this.indent()})))`:`(f64.ne
${r}
${s}
${this.indent()})`;if(n==="<")return`(f64.lt
${r}
${s}
${this.indent()})`;if(n==="<=")return`(f64.le
${r}
${s}
${this.indent()})`;if(n===">")return`(f64.gt
${r}
${s}
${this.indent()})`;if(n===">=")return`(f64.ge
${r}
${s}
${this.indent()})`}if(n==="&&"){const r=this.generateCondition(e.left),s=this.generateCondition(e.right);return`(i32.and ${r} ${s})`}if(n==="||"){const r=this.generateCondition(e.left),s=this.generateCondition(e.right);return`(i32.or ${r} ${s})`}}return e.kind==="e_unary"&&e.op==="!"?`(i32.eqz ${this.generateCondition(e.expr)})`:`(f64.ne ${this.generateExpr(e,!1).trim()} (f64.const 0))`}generateExpr(e,t=!1){var n;if(!e)return t?"":`${this.indent()}(f64.const 0)`;switch(e.kind){case"e_literal":{if(typeof e.value=="number"){const r=Number.isInteger(e.value)?`${e.value}.0`:`${e.value}`;return`${this.indent()}(f64.const ${r})`}if(typeof e.value=="boolean")return`${this.indent()}(f64.const ${e.value?1:0})`;if(typeof e.value=="string"){const r=this.registerString(e.value);return`${this.indent()}(i32.const ${r.offset})`}return`${this.indent()}(f64.const 0)`}case"e_var":{const r=this.sanitizeWasmIdent(e.name);return this.currentLocals.has(e.name)?`${this.indent()}(local.get $${r})`:this.zeroArityCtors.has(e.name)?`${this.indent()}(call $${r})`:this.topLevelGlobals.has(e.name)?`${this.indent()}(global.get $${r})`:this.capturedGlobals.has(e.name)?`${this.indent()}(global.get $g_var_${r})`:`${this.indent()}(local.get $${r})`}case"e_assign":{if(e.target.kind==="e_var"){const r=this.sanitizeWasmIdent(e.target.name),s=this.generateExpr(e.value,!1),i=e.op;let o="";if(i&&i!=="="){const l=i==="+="?"f64.add":i==="-="?"f64.sub":i==="*="?"f64.mul":i==="/="?"f64.div":"f64.add";o=`${this.indent()}(local.set $${r}
${this.indent()}  (${l} (local.get $${r})
${s}
${this.indent()}  )
${this.indent()})`}else o=`${this.indent()}(local.set $${r}
${s}
${this.indent()})`;return this.topLevelGlobals.has(e.target.name)&&(o+=`
${this.indent()}(global.set $${r} (local.get $${r}))`),this.capturedGlobals.has(e.target.name)&&(o+=`
${this.indent()}(global.set $g_var_${r} (local.get $${r}))`),o}if(e.target.kind==="e_index"){const r=this.generateExpr(e.target.target,!1),s=this.generateExpr(e.target.index,!1),i=this.generateExpr(e.value,!1),o=e.op;let l="";if(o&&o!=="="){const c=o==="+="?"f64.add":o==="-="?"f64.sub":o==="*="?"f64.mul":o==="/="?"f64.div":"f64.add";l=`${this.indent()}(call $array_set
${r}
${s}
${this.indent()}  (${c} (call $array_get
${r}
${s}
${this.indent()}  )
${i}
${this.indent()}  )
${this.indent()})`}else l=`${this.indent()}(call $array_set
${r}
${s}
${i}
${this.indent()})`;return t?`${this.indent()}(drop
${l}
${this.indent()})`:l}return""}case"e_binary":{const r=e.op;if(r==="&&"){const o=this.generateExpr(e.left,!1),l=this.generateExpr(e.right,!1);return`${this.indent()}(f64.convert_i32_s (i32.and (f64.ne ${o.trim()} (f64.const 0)) (f64.ne ${l.trim()} (f64.const 0))))`}if(r==="||"){const o=this.generateExpr(e.left,!1),l=this.generateExpr(e.right,!1);return`${this.indent()}(f64.convert_i32_s (i32.or (f64.ne ${o.trim()} (f64.const 0)) (f64.ne ${l.trim()} (f64.const 0))))`}if(r==="%"){const o=this.generateExpr(e.left,!1),l=this.generateExpr(e.right,!1);return`${this.indent()}(call $mod
${o}
${l}
${this.indent()})`}const s=this.generateExpr(e.left,!1),i=this.generateExpr(e.right,!1);return r==="+"?`${this.indent()}(f64.add
${s}
${i}
${this.indent()})`:r==="-"?`${this.indent()}(f64.sub
${s}
${i}
${this.indent()})`:r==="*"?`${this.indent()}(f64.mul
${s}
${i}
${this.indent()})`:r==="/"?`${this.indent()}(f64.div
${s}
${i}
${this.indent()})`:r==="<="?`${this.indent()}(f64.convert_i32_s (f64.le
${s}
${i}
${this.indent()}))`:r==="<"?`${this.indent()}(f64.convert_i32_s (f64.lt
${s}
${i}
${this.indent()}))`:r===">="?`${this.indent()}(f64.convert_i32_s (f64.ge
${s}
${i}
${this.indent()}))`:r===">"?`${this.indent()}(f64.convert_i32_s (f64.gt
${s}
${i}
${this.indent()}))`:r==="=="?this.isStringExpr(e.left)||this.isStringExpr(e.right)?`${this.indent()}(call $str_eq
${s}
${i}
${this.indent()})`:`${this.indent()}(f64.convert_i32_s (f64.eq
${s}
${i}
${this.indent()}))`:r==="!="?this.isStringExpr(e.left)||this.isStringExpr(e.right)?`${this.indent()}(f64.convert_i32_s (i32.eqz (i32.trunc_f64_u (call $str_eq
${s}
${i}
${this.indent()}))))`:`${this.indent()}(f64.convert_i32_s (f64.ne
${s}
${i}
${this.indent()}))`:`${this.indent()}(f64.add
${s}
${i}
${this.indent()})`}case"e_unary":{const r=this.generateExpr(e.expr,!1);return e.op==="-"?`${this.indent()}(f64.neg
${r}
${this.indent()})`:e.op==="!"?`${this.indent()}(f64.convert_i32_s (f64.eq
${r}
${this.indent()}  (f64.const 0)
${this.indent()}))`:r}case"e_if":{const r=this.generateCondition(e.cond),s=e.thenExpr||e.then,i=e.elseExpr||e.else;if(t){const o=this.generateBlockOrStatement(s),l=i?this.generateBlockOrStatement(i):"";return[`${this.indent()}(if ${r.trim()}`,`${this.indent()}  (then`,o,`${this.indent()}  )`,l?`${this.indent()}  (else
${l}
${this.indent()}  )`:"",`${this.indent()})`].filter(Boolean).join(`
`)}else{const o=this.generateExpr(s,!1),l=i?this.generateExpr(i,!1):`${this.indent()}  (f64.const 0)`;return[`${this.indent()}(if (result f64) ${r.trim()}`,`${this.indent()}  (then`,o,`${this.indent()}  )`,`${this.indent()}  (else`,l,`${this.indent()}  )`,`${this.indent()})`].join(`
`)}}case"e_while":{const r=++this.localCounter,s=`while_exit_${r}`,i=`while_loop_${r}`;this.loopStack.push({exit:s,loop:i});const o=this.generateCondition(e.cond),l=this.generateBlockOrStatement(e.body);return this.loopStack.pop(),[`${this.indent()}(block $${s}`,`${this.indent()}  (loop $${i}`,`${this.indent()}    (br_if $${s} (i32.eqz ${o.trim()}))`,l,`${this.indent()}    (br $${i})`,`${this.indent()}  )`,`${this.indent()})`].join(`
`)}case"e_for":{const r=++this.localCounter,s=`for_exit_${r}`,i=`for_loop_${r}`,o=`for_cont_${r}`;this.loopStack.push({exit:s,loop:o});const l=e.init?e.init.kind.startsWith("s_")?this.generateStatement(e.init):this.generateExpr(e.init,!0):"",c=e.cond?this.generateCondition(e.cond).trim():"(i32.const 1)",u=e.update?this.generateExpr(e.update,!0):"",p=this.generateBlockOrStatement(e.body);return this.loopStack.pop(),[l,`${this.indent()}(block $${s}`,`${this.indent()}  (loop $${i}`,`${this.indent()}    (br_if $${s} (i32.eqz ${c}))`,`${this.indent()}    (block $${o}`,p,`${this.indent()}    )`,u,`${this.indent()}    (br $${i})`,`${this.indent()}  )`,`${this.indent()})`].filter(Boolean).join(`
`)}case"e_break":{if(this.loopStack.length>0){const r=this.loopStack[this.loopStack.length-1];return`${this.indent()}(br $${r.exit})`}return""}case"e_continue":{if(this.loopStack.length>0){const r=this.loopStack[this.loopStack.length-1];return`${this.indent()}(br $${r.loop})`}return""}case"e_return":{if(e.value){const r=this.generateExpr(e.value,!1);return`${this.indent()}(return
${r}
${this.indent()})`}return`${this.indent()}(return)`}case"e_call":{if(e.callee.kind==="e_var"){const l=e.callee.name,c=(n=e.callee.modulePath)==null?void 0:n[0];if(c==="Math"||l.startsWith("Math_")){const f=l.replace(/^Math_/,"");if(f==="sqrt"&&e.args.length===1){const m=this.generateExpr(e.args[0],!1);return`${this.indent()}(f64.sqrt
${m}
${this.indent()})`}if(f==="abs"&&e.args.length===1){const m=this.generateExpr(e.args[0],!1);return`${this.indent()}(f64.abs
${m}
${this.indent()})`}if(f==="floor"&&e.args.length===1){const m=this.generateExpr(e.args[0],!1);return`${this.indent()}(f64.floor
${m}
${this.indent()})`}if(f==="ceil"&&e.args.length===1){const m=this.generateExpr(e.args[0],!1);return`${this.indent()}(f64.ceil
${m}
${this.indent()})`}if(f==="trunc"&&e.args.length===1){const m=this.generateExpr(e.args[0],!1);return`${this.indent()}(f64.trunc
${m}
${this.indent()})`}if(f==="round"&&e.args.length===1){const m=this.generateExpr(e.args[0],!1);return`${this.indent()}(f64.nearest
${m}
${this.indent()})`}if(f==="min"&&e.args.length===2){const m=this.generateExpr(e.args[0],!1),y=this.generateExpr(e.args[1],!1);return`${this.indent()}(f64.min
${m}
${y}
${this.indent()})`}if(f==="max"&&e.args.length===2){const m=this.generateExpr(e.args[0],!1),y=this.generateExpr(e.args[1],!1);return`${this.indent()}(f64.max
${m}
${y}
${this.indent()})`}if(f==="pow"&&e.args.length===2){const m=this.generateExpr(e.args[0],!1),y=this.generateExpr(e.args[1],!1);return`${this.indent()}(call $host_math_pow
${m}
${y}
${this.indent()})`}}if(l==="println"&&e.args.length===1){const f=e.args[0];if(this.isStringExpr(f)){const y=this.generateExpr(f,!1);return`${this.indent()}(call $println_str_val
${y}
${this.indent()})`}const m=this.ensureF64(f,this.generateExpr(f,!1));return`${this.indent()}(call $host_println_num
${m}
${this.indent()})`}if(l==="print"&&e.args.length===1){const f=e.args[0];if(this.isStringExpr(f)){const y=this.generateExpr(f,!1);return`${this.indent()}(call $print_str_val
${y}
${this.indent()})`}const m=this.ensureF64(f,this.generateExpr(f,!1));return`${this.indent()}(call $host_print_num
${m}
${this.indent()})`}if(l==="concat"&&e.args.length===2){const f=this.generateExpr(e.args[0],!1),m=this.generateExpr(e.args[1],!1);return`${this.indent()}(call $concat
${f}
${m}
${this.indent()})`}if(l==="to_string"&&e.args.length===1){const f=this.ensureF64(e.args[0],this.generateExpr(e.args[0],!1));return`${this.indent()}(call $host_num_to_str
${f}
${this.indent()})`}if((l==="len"||c==="Array"&&l==="len"||c==="String"&&l==="len")&&e.args.length===1){const f=this.generateExpr(e.args[0],!1);return`${this.indent()}(call $len
${f}
${this.indent()})`}if((l==="push"||c==="Array"&&l==="push")&&e.args.length===2){const f=this.generateExpr(e.args[0],!1),m=this.ensureF64(e.args[1],this.generateExpr(e.args[1],!1));return`${this.indent()}(call $array_push
${f}
${m}
${this.indent()})`}if(l==="time_now"&&e.args.length===0)return`${this.indent()}(call $host_time_now)`;if(l==="parse_int"&&e.args.length===1){const f=this.generateExpr(e.args[0],!1);return`${this.indent()}(call $host_parse_int
${f}
${this.indent()})`}if(l==="parse_float"&&e.args.length===1){const f=this.generateExpr(e.args[0],!1);return`${this.indent()}(call $host_parse_float
${f}
${this.indent()})`}if(l==="read_file"&&e.args.length===1){const f=this.generateExpr(e.args[0],!1);return`${this.indent()}(call $host_read_file
${f}
${this.indent()}  (i32.load ${f.trim()})
${this.indent()})`}if(l==="write_file"&&e.args.length===2){const f=this.generateExpr(e.args[0],!1),m=this.generateExpr(e.args[1],!1);return`${this.indent()}(call $host_write_file
${f}
${this.indent()}  (i32.load ${f.trim()})
${m}
${this.indent()}  (i32.load ${m.trim()})
${this.indent()})`}if(l==="get_cli_arg"&&e.args.length===1){const f=this.generateExpr(e.args[0],!1);return`${this.indent()}(call $host_get_cli_arg
${f}
${this.indent()})`}if((l==="char_at"||l==="charAt"||c==="String"&&(l==="charAt"||l==="char_at"))&&e.args.length===2){const f=this.generateExpr(e.args[0],!1),m=this.generateExpr(e.args[1],!1);return`${this.indent()}(call $str_char_at
${f}
${m}
${this.indent()})`}if(this.gadtConstructors.has(l)){const f=e.args.map(m=>this.ensureF64(m,this.generateExpr(m,!1))).join(`
`);return`${this.indent()}(call $${this.sanitizeWasmIdent(l)}
${f}
${this.indent()})`}if(this.functionNames.has(l)){const f=e.args.map(m=>this.generateExpr(m,!1)).join(`
`);return`${this.indent()}(call $${this.sanitizeWasmIdent(l)}
${f}
${this.indent()})`}const u=Math.min(4,e.args.length),p=`(i32.trunc_f64_u (local.get $${this.sanitizeWasmIdent(l)}))`,d=e.args.map(f=>this.ensureF64(f,this.generateExpr(f,!1))).join(`
`);return`${this.indent()}(call_indirect (type $sig_${u})
${d}
${this.indent()}  ${p}
${this.indent()})`}if(e.callee.kind==="e_field_access"){const l=this.generateExpr(e.callee.object,!1),c=this.registerString(e.callee.field),u=Math.min(4,e.args.length),p=e.args.map(f=>this.ensureF64(f,this.generateExpr(f,!1))).join(`
`),d=`(i32.trunc_f64_u (call $record_get ${this.ensureI32(e.callee.object,l)} (i32.const ${c.offset})))`;return`${this.indent()}(call_indirect (type $sig_${u})
${p}
${this.indent()}  ${d}
${this.indent()})`}const r=this.generateExpr(e.callee,!1),s=Math.min(4,e.args.length),i=e.args.map(l=>this.ensureF64(l,this.generateExpr(l,!1))).join(`
`),o=`(i32.trunc_f64_u ${r.trim()})`;return`${this.indent()}(call_indirect (type $sig_${s})
${i}
${this.indent()}  ${o}
${this.indent()})`}case"e_field_access":{if(e.field==="len"||e.field==="length"){const i=this.generateExpr(e.object,!1);return`${this.indent()}(call $len
${i}
${this.indent()})`}const r=this.generateExpr(e.object,!1),s=this.registerString(e.field);return`${this.indent()}(call $record_get
${this.ensureI32(e.object,r)}
${this.indent()}(i32.const ${s.offset})
${this.indent()})`}case"e_method_call":{const r=e.method;if(r==="len"||r==="length"){const p=this.generateExpr(e.object,!1);return`${this.indent()}(call $len
${p}
${this.indent()})`}if(r==="push"&&e.args.length===1){const p=this.generateExpr(e.object,!1),d=this.ensureF64(e.args[0],this.generateExpr(e.args[0],!1)),f=`${this.indent()}(call $array_push
${p}
${d}
${this.indent()})`;return t?`${this.indent()}(drop
${f}
${this.indent()})`:f}if((r==="charAt"||r==="char_at")&&e.args.length===1){const p=this.generateExpr(e.object,!1),d=this.generateExpr(e.args[0],!1);return`${this.indent()}(call $str_char_at
${p}
${d}
${this.indent()})`}const s=this.generateExpr(e.object,!1),i=this.registerString(r),o=Math.min(4,e.args.length),l=e.args.map(p=>this.ensureF64(p,this.generateExpr(p,!1))).join(`
`),c=`(i32.trunc_f64_u (call $record_get ${this.ensureI32(e.object,s)} (i32.const ${i.offset})))`,u=`${this.indent()}(call_indirect (type $sig_${o})
${l}
${this.indent()}  ${c}
${this.indent()})`;return t?`${this.indent()}(drop
${u}
${this.indent()})`:u}case"e_tuple":{const r=e.elements,s=r.length,i=`_arr_${++this.localCounter}`;this.currentLocals.set(i,"i32");const o=[`${this.indent()}(local.set $${i} (call $array_create (i32.const ${s})))`];for(let l=0;l<s;l++){const c=this.ensureF64(r[l],this.generateExpr(r[l],!1));o.push(`${this.indent()}(f64.store (i32.add (i32.add (local.get $${i}) (i32.const 8)) (i32.const ${l*8})) ${c.trim()})`)}return o.push(`${this.indent()}(local.get $${i})`),o.join(`
`)}case"e_record":{const r=e.fields||[],s=r.length,i=`_rec_${++this.localCounter}`;this.currentLocals.set(i,"i32");const o=[`${this.indent()}(local.set $${i} (call $record_create (i32.const ${s})))`];return r.forEach((l,c)=>{const u=this.registerString(l.name),p=this.ensureF64(l.value,this.generateExpr(l.value,!1));o.push(`${this.indent()}(call $record_set (local.get $${i}) (i32.const ${c}) (i32.const ${u.offset}) ${p.trim()})`)}),o.push(`${this.indent()}(local.get $${i})`),o.join(`
`)}case"e_lambda":{const r=++this.lambdaCounter,s=`_lambda_${r}`;return this.lambdas.push({id:r,funcName:s,expr:e}),`${this.indent()}(f64.const ${r}.0)`}case"e_match":{const r=++this.localCounter,s=`_scrutinee_${r}`,i=`_match_res_${r}`;this.currentLocals.set(s,"i32"),t||this.currentLocals.set(i,"f64");const o=this.ensureI32(e.scrutinee,this.generateExpr(e.scrutinee,!1)),l=`match_exit_${r}`,c=[];for(const p of e.arms){const d=p.pattern;let f="(i32.const 1)";const m=[];if(d.kind==="p_ctor"){const _=this.gadtConstructors.get(d.name),g=_?_.tag:0;f=`(i32.eq (call $gadt_get_tag (local.get $${s})) (i32.const ${g}))`,(d.args||[]).forEach((h,T)=>{if(h.kind==="p_var"){const L=this.sanitizeWasmIdent(h.name);this.currentLocals.set(h.name,"f64"),m.push(`${this.indent()}    (local.set $${L} (call $gadt_get_field (local.get $${s}) (i32.const ${T})))`),m.push(`${this.indent()}    (global.set $g_var_${L} (local.get $${L}))`)}})}else if(d.kind==="p_var"){const _=this.sanitizeWasmIdent(d.name);this.currentLocals.set(d.name,"f64"),m.push(`${this.indent()}    (local.set $${_} (f64.convert_i32_u (local.get $${s})))`),m.push(`${this.indent()}    (global.set $g_var_${_} (local.get $${_}))`)}else d.kind==="p_literal"&&typeof d.value=="number"&&(f=`(f64.eq (f64.convert_i32_u (local.get $${s})) (f64.const ${d.value}))`);p.guard&&(f=`(i32.and ${f} ${this.generateCondition(p.guard).trim()})`);let y="";if(t)y=this.generateBlockOrStatement(p.body);else{const _=this.ensureF64(p.body,this.generateExpr(p.body,!1));y=`${this.indent()}    (local.set $${i} ${_.trim()})`}c.push([`${this.indent()}  (if ${f}`,`${this.indent()}    (then`,m.join(`
`),y,`${this.indent()}      (br $${l})`,`${this.indent()}    )`,`${this.indent()}  )`].filter(Boolean).join(`
`))}return[`${this.indent()}(local.set $${s} ${o.trim()})`,`${this.indent()}(block $${l}`,c.join(`
`),`${this.indent()})`,t?"":`${this.indent()}(local.get $${i})`].filter(Boolean).join(`
`)}case"e_index":{const r=this.generateExpr(e.target,!1),s=this.generateExpr(e.index,!1);return`${this.indent()}(call $array_get
${r}
${s}
${this.indent()})`}case"e_block":{const r=[],s=e.statements.length;for(let i=0;i<s;i++){const o=e.statements[i];if(i===s-1&&!e.result&&!t)if(o.kind==="s_expr"&&o.expr){const c=this.generateExpr(o.expr,!1);r.push(this.ensureF64(o.expr,c))}else r.push(this.generateStatement(o)),r.push(`${this.indent()}(f64.const 0)`);else r.push(this.generateStatement(o))}if(e.result)if(t)r.push(this.generateStatement({kind:"s_expr",expr:e.result}));else{const i=this.generateExpr(e.result,!1);r.push(this.ensureF64(e.result,i))}else s===0&&!t&&r.push(`${this.indent()}(f64.const 0)`);return r.filter(i=>i.trim()).join(`
`)}default:return t?"":`${this.indent()}(f64.const 0)`}}generateBlockOrStatement(e){if(!e)return"";if(e.kind==="e_block"){const t=e.statements.map(n=>this.generateStatement(n));return e.result&&t.push(this.generateStatement({kind:"s_expr",expr:e.result})),t.filter(n=>n.trim()).join(`
`)}return this.generateExpr(e,!0)}async compileWatToWasm(e){const r=(await(await import("./index-DyqknZV_.js").then(function(i){return i.i})).default()).parseWat("module.wat",e),{buffer:s}=r.toBinary({log:!1,write_debug_names:!0});return new Uint8Array(s)}async executeWasm(e,t={}){const n=performance.now(),r=[];let s="",i;typeof e=="string"?(s=e,i=await this.compileWatToWasm(e)):i=e;let o,l=null,c=65536;const u=t.cliArgs||["typelang.wasm"],p=(m,y)=>{if(m<=0||y<=0||!o)return"";const _=new Uint8Array(o.buffer,m,y);return new TextDecoder("utf-8").decode(_)},d=m=>{const y=Buffer.from(m,"utf-8"),_=y.length;let g;return l&&typeof l.exports.alloc=="function"?g=l.exports.alloc(_+8):(g=c,c+=_+16&-8),new DataView(o.buffer).setUint32(g,_,!0),new Uint8Array(o.buffer,g+4,_).set(y),new Uint8Array(o.buffer,g+4+_,1)[0]=0,g},f={host:{println_str:(m,y)=>{r.push(p(m,y))},print_str:(m,y)=>{const _=p(m,y);r.length===0&&r.push(""),r[r.length-1]+=_},println_num:m=>{r.push(Number.isInteger(m)?`${m}`:`${m}`)},print_num:m=>{const y=Number.isInteger(m)?`${m}`:`${m}`;r.length===0&&r.push(""),r[r.length-1]+=y},num_to_str:m=>{const y=Number.isInteger(m)?`${m}`:`${m}`;return d(y)},parse_int:m=>{const y=new DataView(o.buffer).getUint32(m,!0),_=p(m+4,y);return parseInt(_,10)||0},parse_float:m=>{const y=new DataView(o.buffer).getUint32(m,!0),_=p(m+4,y);return parseFloat(_)||0},read_file:(m,y)=>{const _=p(m,y);try{const g=require("fs");if(g.existsSync(_))return d(g.readFileSync(_,"utf-8"))}catch{}return d("")},write_file:(m,y,_,g)=>{const h=p(m,y),T=p(_,g);try{return require("fs").writeFileSync(h,T,"utf-8"),1}catch{return 0}},get_cli_arg:m=>{const y=Math.floor(m);return y>=0&&y<u.length?d(u[y]):d("")},time_now:()=>Date.now(),math_pow:(m,y)=>Math.pow(m,y)}};try{const m=await WebAssembly.instantiate(i,f);l=m.instance,o=m.instance.exports.memory;let y=0;typeof m.instance.exports.main=="function"?y=m.instance.exports.main():typeof m.instance.exports._start=="function"&&(y=m.instance.exports._start());const _=Math.round((performance.now()-n)*100)/100;return{stdout:r,result:y,exitCode:0,executionTimeMs:_,watSource:s,binarySizeBytes:i.length}}catch(m){const y=Math.round((performance.now()-n)*100)/100;return{stdout:r,exitCode:1,executionTimeMs:y,watSource:s,binarySizeBytes:i.length,error:String(m.message||m)}}}}class LLVMGenerator{generateLLVM(e){return new LLVMIRGenerator().generate(e)}generateJS(e,t){return new JSCodeGenerator().generate(e,t)}generateNode(e){return new JSCodeGenerator().generate(e,{target:"node",includePrelude:!0})}generateC(e,t){return new CCodeGenerator().generate(e,{target:"c",...t})}generateCpp(e,t){return new CCodeGenerator().generate(e,{target:"cpp",...t})}generateWasmWAT(e,t){return new WasmCodeGenerator().generateWat(e,t)}}function mkStringWriter(){let a="";return{write:e=>{a+=e},write_char:e=>{a+=e},unwrap:()=>a}}const ANSI={reset:"\x1B[0m",bold:"\x1B[1m",dim:"\x1B[2m",brightBlack:"\x1B[90m",brightRed:"\x1B[91m",brightGreen:"\x1B[92m",brightYellow:"\x1B[93m",brightBlue:"\x1B[94m",brightMagenta:"\x1B[95m",brightCyan:"\x1B[96m",brightWhite:"\x1B[97m"},COLOR_MAP={red:ANSI.brightRed,brightRed:ANSI.brightRed,yellow:ANSI.brightYellow,brightYellow:ANSI.brightYellow,blue:ANSI.brightBlue,brightBlue:ANSI.brightBlue,cyan:ANSI.brightCyan,brightCyan:ANSI.brightCyan,green:ANSI.brightGreen,brightGreen:ANSI.brightGreen,magenta:ANSI.brightMagenta,brightMagenta:ANSI.brightMagenta,white:ANSI.brightWhite,brightWhite:ANSI.brightWhite,gray:ANSI.brightBlack,dim:ANSI.dim};function colorize(a,e,t){if(!t||!e)return a;const n=COLOR_MAP[e]||"";return n?`${n}${a}${ANSI.reset}`:a}function createDiagnostic(a){const{filename:e,message:t,type:n,code:r,offset:s,labels:i=[],note:o,help:l,source:c,writer:u,withColor:p=!0}=a,f=(c.data||"").split(`
`);function m(x){let M=0;for(let N=0;N<f.length;N++){const q=f[N].length+1;if(M+q>x||N===f.length-1)return{line:N+1,col:Math.max(1,x-M+1)};M+=q}return{line:1,col:1}}const y=[];if(i.length===0){const x=m(s);y.push({startLine:x.line,startCol:x.col,endLine:x.line,endCol:x.col+1,message:t,color:n==="Warning"?"yellow":"red",style:"primary",priority:0})}else i.forEach((x,M)=>{const N=m(x.range.start),q=m(x.range.end);let C=q.col;q.line===N.line&&C<=N.col&&(C=N.col+1);const j=x.style?x.style==="primary":M===0,F=j?n==="Warning"?"yellow":"red":"cyan";y.push({startLine:N.line,startCol:N.col,endLine:q.line,endCol:C,message:x.fstring||x.message||"",color:x.color||F,style:j?"primary":"secondary",priority:x.priority??(j?0:10+M)})});const _=y.find(x=>x.style==="primary")||y[0],g=_.startLine,h=_.startCol,T=n||"Error",L=T==="Warning"?"yellow":T==="Advice"?"cyan":"red",A=r?`[E${r}] `:"";if(p){const x=r?`${ANSI.dim}[E${r}]${ANSI.reset} `:"",M=`${ANSI.bold}${colorize(T,L,!0)}${ANSI.reset}`;u.write(`${x}${M}: ${ANSI.bold}${t}${ANSI.reset}
`)}else u.write(`${A}${T}: ${t}
`);const V=y.map(x=>x.startLine),I=Math.max(...V,1),P=Math.max(2,String(I).length),$=" ".repeat(P),b=x=>colorize(x,"brightCyan",p),S=x=>colorize(x,"white",p),v=x=>colorize(x,"brightYellow",p),R=x=>colorize(x,"dim",p),E=`   ${b("╭─[")}${S(e)}${b(":")}${v(String(g))}${b(":")}${v(String(h))}${b("]")}
`;u.write(E);const k=new Map;for(const x of y){const M=k.get(x.startLine)||[];M.push(x),k.set(x.startLine,M)}const O=Array.from(k.keys()).sort((x,M)=>x-M);if(O.forEach((x,M)=>{M>0&&x-O[M-1]>1&&u.write(`   ${b("·")}
`);const N=f[x-1]||"",q=String(x).padStart(P," "),C=`   ${b("│")} ${R(q)} ${b("│")} ${N}
`;u.write(C);const j=k.get(x);j.sort((w,D)=>w.startCol-D.startCol);const F=j.map(w=>{const D=Math.max(0,w.startCol-1),z=Math.max(D+1,w.endCol-1),K=Math.max(1,z-D);let W="─".repeat(K);if(K>=3){const U=Math.floor(K/2);W="─".repeat(U)+"┬"+"─".repeat(K-U-1)}else K===2?W="┬─":W="┬";const J=D+(K>=3?Math.floor(K/2):0);return{startCol:D,endCol:z,anchorCol:J,pattern:W,label:w}});let B="",Y=0;for(const w of F)if(w.startCol>Y&&(B+=" ".repeat(w.startCol-Y),Y=w.startCol),w.startCol>=Y){const D=colorize(w.pattern,w.label.color,p);B+=D,Y=w.startCol+w.pattern.length}u.write(`   ${b("·")} ${$} ${b("·")} ${B}
`);const G=[...F].sort((w,D)=>w.anchorCol-D.anchorCol);for(let w=G.length-1;w>=0;w--){const D=G[w];if(!D.label.message)continue;let z="",K=0;for(let U=0;U<w;U++){const H=G[U];H.anchorCol>K&&(z+=" ".repeat(H.anchorCol-K),K=H.anchorCol),z+=colorize("│",H.label.color,p),K+=1}D.anchorCol>K&&(z+=" ".repeat(D.anchorCol-K),K=D.anchorCol);const W=colorize("╰──── ",D.label.color,p),J=colorize(D.label.message,D.label.color,p);z+=`${W}${J}`,u.write(`   ${b("·")} ${$} ${b("·")} ${z}
`)}}),o){u.write(`   ${b("·")}
`);const x=colorize("Note:","brightGreen",p);u.write(`   ${b("·")} ${x} ${o}
`)}if(l){u.write(`   ${b("·")}
`);const x=colorize("Help:","brightYellow",p);u.write(`   ${b("·")} ${x} ${l}
`)}u.write(`${b("───╯")}
`)}function lineColToOffset(a,e,t){if(!a)return 0;const n=a.split(`
`);let r=0;const s=Math.max(0,e-1);for(let l=0;l<Math.min(s,n.length);l++)r+=n[l].length+1;const i=n[s]||"",o=Math.max(0,Math.min(t-1,i.length));return r+o}function formatAriadneDiagnostic(a,e,t="main.tl"){try{const n=e&&e.trim().length>0?e:" ",r=n.split(`
`),s=lineColToOffset(n,a.line,a.col),i=a.endLine||a.line,o=a.endCol||a.col+1;let l=lineColToOffset(n,i,o);l<=s&&(l=s+1);const c={error:"Error",warning:"Warning",info:"Advice"},u=a.severity==="warning"?"yellow":"red",p=a.category?a.category.toUpperCase().replace(/[^A-Z]/g,"").slice(0,8):"ERR",d=[];if(a.labels&&a.labels.length>0)a.labels.forEach((g,h)=>{const T=lineColToOffset(n,g.line,g.col),L=lineColToOffset(n,g.endLine||g.line,g.endCol||g.col+1);d.push({range:{start:T,end:Math.max(T+1,L)},fstring:g.message||a.message,message:g.message||a.message,color:g.color||(g.style==="secondary"?"cyan":u),style:g.style||(h===0?"primary":"secondary")})});else{let g=a.message;if(a.category==="Type Unification"){g=a.message.replace(/^Type mismatch:\s*/i,"");const T=g.indexOf(". ");T>0&&T<65&&(g=g.substring(0,T))}else a.category==="Undefined Symbol"?a.message.includes("In 'do' notation: 'flatMap'")?g="missing 'flatMap' definition required for 'do' notation":a.message.includes("In 'do' notation: 'pure'")?g="missing 'pure' definition required for 'do' notation":a.message.includes("In 'do(")?g="monad does not provide method required for 'do' notation":g="not found in this scope":a.category==="Immutability Violation"&&(g="cannot mutate immutable variable");d.push({range:{start:s,end:l},fstring:g,message:g,color:u,style:"primary"});const h=r[a.line-1]||"";if(a.category==="Immutability Violation"){const T=a.message.match(/variable '([^']+)'/i),L=T?T[1]:null;if(L)for(let A=a.line-2;A>=0;A--){const I=r[A].match(new RegExp(`\\blet\\s+(${L})\\b`));if(I&&I.index!==void 0){const P=I.index+(I[0].length-L.length)+1,$=lineColToOffset(n,A+1,P),b=$+L.length;d.push({range:{start:$,end:b},fstring:"variable first declared as immutable here",message:"variable first declared as immutable here",color:"cyan",style:"secondary"});break}}}else if(a.category==="Type Unification"){const T=h.match(/([a-zA-Z0-9_]+)\s*(\+|\-|\*|\/|==|!=|<|>)\s*([a-zA-Z0-9_]+)/);if(T&&T.index!==void 0){const L=T[1],A=T[3],V=T.index+1,I=lineColToOffset(n,a.line,V),P=I+L.length,$=T.index+1+T[0].lastIndexOf(A),b=lineColToOffset(n,a.line,$),S=b+A.length;d.length=0;const v=a.message.match(/cannot unify '([^']+)' with '([^']+)'/i),R=v?v[1]:null,E=v?v[2]:null;d.push({range:{start:b,end:S},fstring:R?`this expression has type '${R}'`:"unexpected operand type",message:R?`this expression has type '${R}'`:"unexpected operand type",color:u,style:"primary"}),d.push({range:{start:I,end:P},fstring:E?`expected '${E}' to match this operand`:"expected matching operand type",message:E?`expected '${E}' to match this operand`:"expected matching operand type",color:"cyan",style:"secondary"})}else if(/\breturn\b/.test(h))for(let L=a.line-2;L>=0;L--){const A=r[L],V=A.match(/\bfunction\s+([a-zA-Z0-9_]+)(?:<[^>]+>)?\s*\([^)]*\)\s*:\s*([a-zA-Z0-9_<>[\] ,]+)\s*\{/);if(V&&V.index!==void 0){const I=V[2].trim(),P=A.lastIndexOf(I)+1,$=lineColToOffset(n,L+1,P),b=$+I.length;d.push({range:{start:$,end:b},fstring:`expected '${I}' because of function return type`,message:`expected '${I}' because of function return type`,color:"cyan",style:"secondary"});break}}}}const f=mkStringWriter();createDiagnostic({filename:t,message:a.message,type:c[a.severity]||"Error",code:p,offset:s,labels:d,note:a.quickFixes&&a.quickFixes.length>0?`Suggestion: ${a.quickFixes[0].title}`:void 0,source:{type:"string",data:n},writer:f,withColor:!0});const m=f.unwrap(),y=mkStringWriter();createDiagnostic({filename:t,message:a.message,type:c[a.severity]||"Error",code:p,offset:s,labels:d,note:a.quickFixes&&a.quickFixes.length>0?`Suggestion: ${a.quickFixes[0].title}`:void 0,source:{type:"string",data:n},writer:y,withColor:!1});const _=y.unwrap();return{ariadneReport:m,ariadneReportPlain:_}}catch{const r=`[${a.severity.toUpperCase()}] ${a.message} at line ${a.line}, col ${a.col}`;return{ariadneReport:r,ariadneReportPlain:r}}}function createDiagnosticFromError(a,e){const t=(a==null?void 0:a.message)||String(a)||"Compilation Error";if(a!=null&&a.loc&&typeof a.loc=="object")return{severity:"error",message:t,line:a.loc.line||1,col:a.loc.col||1,endLine:a.loc.endLine||a.loc.line||1,endCol:a.loc.endCol||(a.loc.col?a.loc.col+1:1),category:"Syntax Error"};const n=t.match(/(?:at\s+line|starting\s+at\s+line|line)\s+(\d+)(?:,\s*(?:col|column)\s*(\d+))?/i);if(n){const r=parseInt(n[1],10),s=n[2]?parseInt(n[2],10):1;return{severity:"error",message:t,line:r,col:s,endLine:r,endCol:s+5,category:"Syntax Error"}}return{severity:"error",message:t,line:1,col:1,endLine:1,endCol:1,category:"General"}}function enrichDiagnostics(a,e,t="main.tl"){const n=e.split(`
`);return a.map(r=>{const s=Math.max(0,r.line-1),i=n[s]||"",o=Math.max(1,r.col),l=" ".repeat(Math.max(0,o-1)),c=r.endCol&&r.endCol>o?Math.max(1,r.endCol-o):1,u=c>1?"^"+"~".repeat(c-1):"^",p=r.caretMarker||`${l}${u}`,d=r.category||categorizeError(r.message),f=generateQuickFixes(r.message,i,r.line,d,n),m=r.quickFixes&&r.quickFixes.length>0?[...r.quickFixes,...f.filter(h=>!r.quickFixes.some(T=>T.title===h.title))]:f,y={...r,codeSnippet:r.codeSnippet||i,caretMarker:p,category:d,quickFixes:m},{ariadneReport:_,ariadneReportPlain:g}=formatAriadneDiagnostic(y,e,t);return{...y,ariadneReport:_,ariadneReportPlain:g}})}function categorizeError(a){const e=a.toLowerCase();return e.includes("cannot unify")||e.includes("type mismatch")||e.includes("expected type")?"Type Unification":e.includes("undefined variable")||e.includes("unknown symbol")||e.includes("not found")?"Undefined Symbol":e.includes("non-exhaustive")||e.includes("missing match arm")||e.includes("unhandled constructor")?"Missing Arm":e.includes("immutable")||e.includes("cannot mutate")||e.includes("readonly")?"Immutability Violation":e.includes("unexpected token")||e.includes("syntax error")||e.includes("expected")?"Syntax Error":"General"}function generateQuickFixes(a,e,t,n,r=[]){var l;const s=[],i=a.toLowerCase(),o=((l=e.match(/^(\s*)/))==null?void 0:l[1])||"";if(n==="Type Unification"){if(i.includes("cannot unify 'number' with 'string'"))s.push({title:"💡 Wrap expression with to_string(...)",actionKind:"wrap_expression",targetLine:t,replacementText:e.replace(/(=|\+|-|\*|\/|,|\()\s*([a-zA-Z0-9_".]+)/,"$1 to_string($2)")});else if(i.includes("cannot unify 'string' with 'number'"))s.push({title:"💡 Wrap parameter with parse_int(...)",actionKind:"wrap_expression",targetLine:t,replacementText:e.replace(/(=|\+|-|\*|\/|,|\()\s*([a-zA-Z0-9_".]+)/,"$1 parse_int($2)")});else if(i.includes("expected algebraic data type")||i.includes("wrap value with constructor")){const c=a.match(/constructor '([^']+)'/i),u=c?c[1]:"Some";s.push({title:`💡 Wrap value with ${u}(...)`,actionKind:"wrap_expression",targetLine:t,replacementText:e.replace(/(=|<-|\+|-|\*|\/|,|\()\s*([a-zA-Z0-9_".]+)/,`$1 ${u}($2)`)})}}if((i.includes("'flatmap' function is not defined")||i.includes("flatmap")&&i.includes("do"))&&s.push({title:"💡 Define Option flatMap helper",actionKind:"add_let",targetLine:1,replacementText:`function flatMap<a, b>(opt: Option<a>, f: (x: a) => Option<b>): Option<b> {
  match (opt) {
    Some(v) => f(v)
    None => None
  }
}

`}),(i.includes("'pure' function is not defined")||i.includes("pure")&&i.includes("do"))&&s.push({title:"💡 Define Option pure helper",actionKind:"add_let",targetLine:1,replacementText:`function pure<a>(val: a): Option<a> {
  Some(val)
}

`}),e.includes("<-")&&(i.includes("monadic bind '<-'")||i.includes("did you mean to use 'let"))&&s.push({title:"💡 Replace monadic '<-' with 'let = '",actionKind:"replace_line",targetLine:t,replacementText:e.replace(/([a-zA-Z0-9_]+)\s*<-\s*/,"let $1 = ")}),(n==="Missing Arm"||i.includes("match"))&&s.push({title:"💡 Insert wildcard match arm (_ => ...)",actionKind:"insert_arm",targetLine:t,replacementText:`${e}
${o}  _ => "Guest"`}),n==="Undefined Symbol"){const c=a.match(/undefined variable '([^']+)'/i)||a.match(/symbol '([^']+)'/i);if(c&&c[1]&&c[1]!=="flatMap"&&c[1]!=="pure"){const u=c[1];s.push({title:`💡 Declare variable 'let ${u} = ...'`,actionKind:"add_let",targetLine:t,replacementText:`${o}let ${u} = 0
${e}`})}}if(n==="Immutability Violation"){const c=a.match(/variable '([^']+)'/i),u=c?c[1]:null;let p=t,d=e;if(u&&r.length>0)for(let f=t-1;f>=0;f--){const m=r[f];if(m&&new RegExp(`\\blet\\s+${u}\\b`).test(m)){p=f+1,d=m;break}}s.push({title:`💡 Mark '${u||"variable"}' as mutable (let mut)`,actionKind:"replace_line",targetLine:p,replacementText:d.replace(/\blet\b/,"let mut ")})}return s}class Formatter{constructor(){this.indentLevel=0}indent(){return"  ".repeat(this.indentLevel)}format(e){try{const n=new Lexer(e).tokenize(),s=new Parser(n).parseProgram();return this.formatProgram(s)}catch{return this.fallbackFormat(e)}}formatProgram(e){return e.statements.map(n=>this.formatStatement(n)).join(`

`).trim()+`
`}formatStatement(e){switch(e.kind){case"s_let":{const t=e.isMut?"mut ":"",n=e.typeAnnotation?`: ${this.formatType(e.typeAnnotation)}`:"",r=this.formatExpr(e.init);return`${e.docComment?`${formatDocComment(e.docComment).split(`
`).map(i=>`${this.indent()}${i}`).join(`
`)}
`:""}${this.indent()}let ${t}${e.name}${n} = ${r}`}case"s_function":{const t=e.isExported?"export ":"",n=e.typeParams&&e.typeParams.length>0?`<${e.typeParams.map(c=>typeParamToString(c)).join(", ")}>`:"",r=e.params.map(c=>`${c.name}: ${this.formatType(c.type)}`).join(", "),s=e.returnType?`: ${this.formatType(e.returnType)}`:"";this.indentLevel++;let i;if(e.body.kind==="e_block"){const c=e.body.statements.map(p=>this.formatStatement(p)).join(`
`),u=e.body.result?`${this.indent()}${this.formatExpr(e.body.result)}`:"";i=[c,u].filter(Boolean).join(`
`)}else i=`${this.indent()}${this.formatExpr(e.body)}`;this.indentLevel--;let o="";if(e.whereBindings&&e.whereBindings.length>0){this.indentLevel++;const c=e.whereBindings.map(u=>this.formatStatement(u)).join(`
`);this.indentLevel--,o=` where {
${c}
${this.indent()}}`}return`${e.docComment?`${formatDocComment(e.docComment).split(`
`).map(c=>`${this.indent()}${c}`).join(`
`)}
`:""}${this.indent()}${t}function ${e.name}${n}(${r})${s} {
${i}
${this.indent()}}${o}`}case"s_expr":return`${this.indent()}${this.formatExpr(e.expr)}`;case"s_type_alias":return this.formatDocPrefix(e.decl.docComment)+this.formatTypeAlias(e.decl);case"s_gadt":return this.formatDocPrefix(e.decl.docComment)+this.formatGadt(e.decl);case"s_module":return this.formatModule(e);case"s_extern_module":{this.indentLevel++;const t=e.functions.map(i=>this.formatExternFunction(i)).join(`
`),n=e.types.map(i=>this.formatExternType(i)).join(`
`),r=e.values.map(i=>this.formatExternValue(i)).join(`
`),s=[t,n,r].filter(i=>i.length>0).join(`
`);return this.indentLevel--,`${this.indent()}extern module ${e.name} {
${s}
${this.indent()}}`}case"s_extern_function":return this.formatExternFunction(e);case"s_import":{const t=e.modulePath.join(".");if(e.specifiers&&e.specifiers.length>0){const r=e.specifiers.map(s=>s.alias?`${s.name} as ${s.alias}`:s.name).join(", ");return`${this.indent()}import ${t}.{ ${r} }`}const n=e.alias?` as ${e.alias}`:"";return`${this.indent()}import ${t}${n}`}default:return this.indent()+"// Statement"}}formatTypeAlias(e){const t=e.typeParams&&e.typeParams.length>0?`<${e.typeParams.map(r=>typeParamToString(r)).join(", ")}>`:"",n=this.formatType(e.type);return`${this.indent()}type ${e.name}${t} = ${n}`}formatDocPrefix(e){return e?`${formatDocComment(e).split(`
`).map(t=>`${this.indent()}${t}`).join(`
`)}
`:""}formatGadt(e){const t=e.typeParams&&e.typeParams.length>0?`<${e.typeParams.map(r=>typeParamToString(r)).join(", ")}>`:"";this.indentLevel++;const n=e.constructors.map(r=>{const s=r.typeParams&&r.typeParams.length>0?`<${r.typeParams.map(l=>typeParamToString(l)).join(", ")}>`:"",i=r.params.length>0?`(${r.params.map(l=>`${l.name}: ${this.formatType(l.type)}`).join(", ")})`:"",o=r.returnType?`: ${this.formatType(r.returnType)}`:"";return`${this.formatDocPrefix(r.docComment)}${this.indent()}| ${r.name}${s}${i}${o}`}).join(`
`);return this.indentLevel--,`${this.indent()}type ${e.name}${t} =
${n}`}formatModule(e){const t=e.isExported?"export ":"";this.indentLevel++;const n=e.body.map(r=>this.formatStatement(r)).join(`
`);return this.indentLevel--,`${this.indent()}${t}module ${e.name} {
${n}
${this.indent()}}`}formatExternFunction(e){const t=e.typeParams&&e.typeParams.length>0?`<${e.typeParams.map(r=>typeParamToString(r)).join(", ")}>`:"",n=e.params.map(r=>`${r.name}: ${this.formatType(r.type)}`).join(", ");return`${this.indent()}function ${e.name}${t}(${n}): ${this.formatType(e.returnType)}`}formatExternType(e){const t=e.typeParams&&e.typeParams.length>0?`<${e.typeParams.map(n=>typeParamToString(n)).join(", ")}>`:"";return`${this.indent()}type ${e.name}${t} = ${this.formatType(e.type)}`}formatExternValue(e){return`${this.indent()}let ${e.name}: ${this.formatType(e.type)}`}formatExpr(e){switch(e.kind){case"e_literal":return JSON.stringify(e.value);case"e_var":return e.modulePath?`${e.modulePath.join(".")}.${e.name}`:e.name;case"e_unary":{const t=this.formatExpr(e.expr);return`${e.op}${t}`}case"e_binary":{let t=this.formatExpr(e.left),n=this.formatExpr(e.right);const r=i=>i==="||"?1:i==="&&"?2:["==","!="].includes(i)?3:["<","<=",">",">="].includes(i)?4:["+","-"].includes(i)?5:["*","/","%"].includes(i)?6:0,s=r(e.op);return e.left.kind==="e_binary"&&r(e.left.op)<s&&(t=`(${t})`),e.right.kind==="e_binary"&&r(e.right.op)<=s&&(n=`(${n})`),`${t} ${e.op} ${n}`}case"e_call":{const t=this.formatExpr(e.callee),n=e.args.map(r=>this.formatExpr(r)).join(", ");return`${t}(${n})`}case"e_lambda":{const t=e.typeParams&&e.typeParams.length>0?`<${e.typeParams.join(", ")}>`:"",n=e.params.map(s=>s.type?`${s.name}: ${this.formatType(s.type)}`:s.name).join(", "),r=e.returnType?`: ${this.formatType(e.returnType)}`:"";return e.body.kind==="e_block"?`fn${t}(${n})${r} ${this.formatExpr(e.body)}`:`fn${t}(${n})${r} => ${this.formatExpr(e.body)}`}case"e_if":{const t=this.formatExpr(e.cond),n=this.formatExpr(e.thenExpr);if(e.elseExpr){const r=this.formatExpr(e.elseExpr);return`if (${t}) ${n} else ${r}`}return`if (${t}) ${n}`}case"e_match":{const t=this.formatExpr(e.scrutinee);this.indentLevel++;const n=e.arms.map(r=>{const s=this.formatPattern(r.pattern),i=r.guard?` if (${this.formatExpr(r.guard)})`:"",o=this.formatExpr(r.body);return`${this.indent()}${s}${i} => ${o}`}).join(`
`);return this.indentLevel--,`match (${t}) {
${n}
${this.indent()}}`}case"e_assign":{const t=this.formatExpr(e.target),n=this.formatExpr(e.value);return`${t} = ${n}`}case"e_record":{const t=e.fields.map(s=>`${s.isMut?"mut ":""}${s.name}: ${this.formatExpr(s.value)}`),n=(e.methods||[]).map(s=>{const i=s.params.map(c=>c.type?`${c.name}: ${this.formatType(c.type)}`:c.name).join(", "),o=s.returnType?`: ${this.formatType(s.returnType)}`:"",l=this.formatExpr(s.body);return`${s.name}(${s.selfParam}${i?", "+i:""})${o} ${l}`}),r=[...t,...n];return r.length===0?"{}":n.length>0?`{
  ${r.join(`,
  `)}
}`:`{ ${r.join(", ")} }`}case"e_record_update":{const t=this.formatExpr(e.base),n=e.updates.map(r=>`${r.isMut?"mut ":""}${r.name}: ${this.formatExpr(r.value)}`).join(", ");return n?`{ ...${t}, ${n} }`:`{ ...${t} }`}case"e_method_call":{const t=this.formatExpr(e.object),n=e.args.map(r=>this.formatExpr(r)).join(", ");return`${t}.${e.method}(${n})`}case"e_field_access":return`${this.formatExpr(e.object)}.${e.field}`;case"e_range":{const t=e.inclusive?"..=":"..";return`${this.formatExpr(e.start)}${t}${this.formatExpr(e.end)}`}case"e_tuple":return`[${e.elements.map(n=>this.formatExpr(n)).join(", ")}]`;case"e_index":return`${this.formatExpr(e.target)}[${this.formatExpr(e.index)}]`;case"e_block":{if(e.statements.length===0&&e.result)return`{ ${this.formatExpr(e.result)} }`;if(e.statements.length===0&&!e.result)return"()";this.indentLevel++;const t=e.statements.map(s=>this.formatStatement(s)).join(`
`),n=e.result?`${this.indent()}${this.formatExpr(e.result)}`:"";return this.indentLevel--,`{
${[t,n].filter(Boolean).join(`
`)}
${this.indent()}}`}case"e_switch":{const t=this.formatExpr(e.discriminant);this.indentLevel++;const n=e.cases.map(s=>{const o=(s.values&&s.values.length>0?s.values:s.value?[s.value]:[]).map(c=>this.formatExpr(c)).join(", "),l=this.formatExpr(s.body);return`${this.indent()}case ${o}:
${this.indent()}  ${l}`}).join(`
`);let r="";if(e.defaultCase){const s=this.formatExpr(e.defaultCase);r=`
${this.indent()}default:
${this.indent()}  ${s}`}return this.indentLevel--,`switch (${t}) {
${n}${r}
${this.indent()}}`}case"e_list_comp":{const t=this.formatExpr(e.element),n=this.formatExpr(e.iterable),r=e.condition?` if ${this.formatExpr(e.condition)}`:"";return`[${t} for ${e.param} in ${n}${r}]`}case"e_for":{let t="";e.init&&(e.init.kind.startsWith("s_")?t=this.formatStatement(e.init).trim():t=this.formatExpr(e.init));const n=e.cond?this.formatExpr(e.cond):"",r=e.update?this.formatExpr(e.update):"",s=this.formatExpr(e.body);return`for (${t}; ${n}; ${r}) ${s}`}case"e_while":{const t=this.formatExpr(e.cond),n=this.formatExpr(e.body);return`while (${t}) ${n}`}case"e_break":return"break";case"e_continue":return"continue";case"e_return":return e.value?`return ${this.formatExpr(e.value)}`:"return";case"e_do":{this.indentLevel++;const t=e.items.map(r=>{switch(r.kind){case"do_bind":return`${this.indent()}${this.formatPattern(r.pattern)} <- ${this.formatExpr(r.expr)};`;case"do_let":{const s=r.isMut?"mut ":"",i=r.typeAnnotation?`: ${this.formatType(r.typeAnnotation)}`:"";return`${this.indent()}let ${s}${r.name}${i} = ${this.formatExpr(r.init)};`}case"do_expr":return`${this.indent()}${this.formatExpr(r.expr)};`;case"do_return":return`${this.indent()}${r.isPure?"pure":"return"} ${this.formatExpr(r.expr)};`}}).join(`
`);return this.indentLevel--,`do${e.monad?`(${this.formatExpr(e.monad)})`:""} {
${t}
${this.indent()}}`}case"e_where":{this.indentLevel++;const t=e.bindings.map(n=>this.formatStatement(n)).join(`
`);return this.indentLevel--,`${this.formatExpr(e.expr)} where {
${t}
${this.indent()}}`}default:return"/* expr */"}}formatType(e){switch(e.kind){case"base":return e.name;case"var":return e.name;case"app":{if(e.name==="Array"&&e.args.length===1)return`${this.formatType(e.args[0])}[]`;if(e.args.length===0)return e.name;const t=e.args.map(n=>this.formatType(n)).join(", ");return`${e.name}<${t}>`}case"fun":{const t=e.typeParams&&e.typeParams.length>0?`<${e.typeParams.map(r=>typeParamToString(r)).join(", ")}>`:"",n=e.params.map(r=>r.name?`${r.name}: ${this.formatType(r.type)}`:this.formatType(r.type)).join(", ");return`${t}(${n}) => ${this.formatType(e.returnType)}`}case"record":return`{ ${e.fields.map(n=>`${n.isMut?"mut ":""}${n.name}: ${this.formatType(n.type)}`).join(", ")} }`;case"tuple":return`[${e.elements.map(n=>this.formatType(n)).join(", ")}]`;case"forall":return`<${e.typeParams.map(t=>typeParamToString(t)).join(", ")}>${this.formatType(e.type)}`;case"type_lambda":return`\\${e.params.map(n=>typeParamToString(n)).join(", ")} => ${this.formatType(e.body)}`;case"hkt_app":{const t=this.formatType(e.target),n=e.args.map(r=>this.formatType(r)).join(", ");return`${t}<${n}>`}}}static formatTypeAST(e){return new Formatter().formatType(e)}formatPattern(e){switch(e.kind){case"p_var":return e.name;case"p_literal":return JSON.stringify(e.value);case"p_ctor":{if(e.args.length===0)return e.name;const t=e.args.map(n=>this.formatPattern(n)).join(", ");return`${e.name}(${t})`}case"p_record":return`{ ${e.fields.map(n=>`${n.name}: ${n.pattern?this.formatPattern(n.pattern):n.alias||n.name}`).join(", ")} }`;case"p_tuple":return`[${e.elements.map(n=>this.formatPattern(n)).join(", ")}]`;case"p_as":return`${this.formatPattern(e.pattern)} as ${e.name}`;case"p_wildcard":return"_";case"p_rest":return"..."}}fallbackFormat(e){const t=e.split(`
`);let n=0;const r=[];for(let s of t){let i=s.trim();if(!i){r.push("");continue}(i.startsWith("}")||i.startsWith("]"))&&(n=Math.max(0,n-1));const o="  ".repeat(n);i=i.replace(/\s*=\s*/g," = ").replace(/\s*=>\s*/g," => ").replace(/\s*:\s*/g,": ").replace(/\s*,\s*/g,", "),r.push(o+i),(i.endsWith("{")||i.endsWith("["))&&n++}return r.join(`
`)}}function formatTypeLangCode(a){return new Formatter().format(a)}const processDiagnostics=(a,e,t)=>!t||t.length===0?enrichDiagnostics(a,e,"main.tl"):a.map(n=>{const r=t.find(d=>n.line>=d.startLine&&n.line<=d.endLine)||t[0],s=r?r.startLine-1:0,i=Math.max(1,n.line-s),o=n.endLine?Math.max(i,n.endLine-s):i,l={...n,line:i,endLine:o,fileId:r==null?void 0:r.fileId,filename:r==null?void 0:r.filename},c=(r==null?void 0:r.content)||e,u=(r==null?void 0:r.filename)||"main.tl";return enrichDiagnostics([l],c,u)[0]||l});self.onmessage=a=>{var t,n,r,s;const e=a.data;if(!(!e||!e.id))try{if(e.action==="format"){const A=formatTypeLangCode(e.code||""),V={id:e.id,action:"format",success:!0,formattedCode:A};self.postMessage(V);return}const i=e.combinedSource||"",o=e.mapEntries||[],c=new Lexer(i).tokenize(),p=new Parser(c).parseProgram(),d=new TypeChecker;d.checkProgram(p);const f=processDiagnostics(d.diagnostics,i,o),m=new LLVMGenerator,y=m.generateLLVM(p),_=m.generateJS(p),g=m.generateNode(p),h=m.generateC(p),T=m.generateCpp(p),L=m.generateWasmWAT(p);if(e.action==="typecheck"){const A={id:e.id,action:"typecheck",success:!0,ast:p,diagnostics:f,llvmCode:y,jsCode:_,nodeCode:g,cCode:h,cppCode:T,watCode:L};self.postMessage(A);return}if(e.action==="eval"){const A=d.diagnostics.filter($=>$.severity==="error");if(A.length>0){const $=((t=f[0])==null?void 0:t.ariadneReport)||((n=f[0])==null?void 0:n.ariadneReportPlain)||A[0].message,b={id:e.id,action:"eval",success:!1,ast:p,diagnostics:f,stdout:[`❌ Type Check Failed: ${A.length} error(s) found.

${$}`],llvmCode:y,jsCode:_,nodeCode:g,cCode:h,cppCode:T,watCode:L};self.postMessage(b);return}const I=new Evaluator().evalProgram(p),P={id:e.id,action:"eval",success:!0,ast:p,diagnostics:f,stdout:I.stdout,executionTimeMs:I.executionTimeMs,llvmCode:y,jsCode:_,nodeCode:g,cCode:h,cppCode:T,watCode:L};self.postMessage(P);return}}catch(i){const o=e.combinedSource||e.code||"",l=e.mapEntries||[],c=i.message||String(i),u=createDiagnosticFromError(i),p=processDiagnostics([u],o,l),d=((r=p[0])==null?void 0:r.ariadneReport)||((s=p[0])==null?void 0:s.ariadneReportPlain)||c,f={id:e.id,action:e.action,success:!1,diagnostics:p,stdout:[`❌ Error:

${d}`],error:c};self.postMessage(f)}};
