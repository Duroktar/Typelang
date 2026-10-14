// ============================================================================
// TypeLang Self-Hosted Compiler: AST Definitions Module (Array-tag representation)
// ============================================================================

function ENum(val: number) { [1.0, val] }
function EStr(val: string) { [2.0, val] }
function EBool(b: boolean) { [3.0, b] }
function EVar(name: string) { [4.0, name] }
function EBinOp(op: string, left: any, right: any) { [5.0, op, left, right] }
function EUnary(op: string, arg: any) { [6.0, op, arg] }
function ECall(fnName: string, args: any[]) { [7.0, fnName, args] }
function EIf(cond: any, thenBr: any, elseBr: any) { [8.0, cond, thenBr, elseBr] }
function EBlock(stmts: any[], result: any) { [9.0, stmts, result] }
function EArray(elements: any[]) { [10.0, elements] }
function EIndex(arr: any, idx: any) { [11.0, arr, idx] }

function SLet(name: string, isMut: boolean, init: any) { [20.0, name, isMut, init] }
function SAssign(name: string, val: any) { [21.0, name, val] }
function SAssignOp(op: string, name: string, val: any) { [22.0, op, name, val] }
function SExpr(expr: any) { [23.0, expr] }
function SReturn(val: any) { [24.0, val] }
function SWhile(cond: any, body: any[]) { [25.0, cond, body] }
function SIf(cond: any, thenBody: any[], elseBody: any[]) { [26.0, cond, thenBody, elseBody] }
function SFunc(name: string, params: string[], body: any[]) { [27.0, name, params, body] }
