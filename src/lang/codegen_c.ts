// Complete C / C++ (C11 / C++17 / C++20) Code Generator for TypeLang
import {
  Program,
  Statement,
  Expr,
  EFor,
  EWhile,
  Pattern,
  MatchArm,
  GADTConstructor,
  ImportSpecifier,
  desugarDo
} from './ast';

export interface CCodeGenOptions {
  target?: 'c' | 'cpp';
  standard?: 'c11' | 'c99' | 'cpp17' | 'cpp20';
  includePrelude?: boolean;
  includeMain?: boolean;
  namespaceName?: string;
}

const STDLIB_MODULES = new Set(['Math', 'Array', 'String', 'Option', 'Result', 'Either', 'Reader', 'Writer', 'State', 'Task']);
const PRELUDE_CTORS = new Set(['Some', 'None', 'Ok', 'Err', 'Left', 'Right']);

const C_RESERVED_WORDS = new Set([
  'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
  'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
  'inline', 'int', 'long', 'register', 'restrict', 'return', 'short',
  'signed', 'sizeof', 'static', 'struct', 'switch', 'typedef', 'union',
  'unsigned', 'void', 'volatile', 'while', '_Alignas', '_Alignof',
  '_Atomic', '_Bool', '_Complex', '_Generic', '_Imaginary', '_Noreturn',
  '_Static_assert', '_Thread_local',
  // C++ keywords
  'alignas', 'alignof', 'and', 'and_eq', 'asm', 'bitand', 'bitor',
  'bool', 'catch', 'char8_t', 'char16_t', 'char32_t', 'class', 'compl',
  'concept', 'consteval', 'constexpr', 'constinit', 'const_cast',
  'co_await', 'co_return', 'co_yield', 'decltype', 'delete', 'dynamic_cast',
  'explicit', 'export', 'false', 'friend', 'mutable', 'namespace', 'new',
  'noexcept', 'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq',
  'override', 'private', 'protected', 'public', 'reflexpr', 'reinterpret_cast',
  'requires', 'static_assert', 'static_cast', 'template', 'this',
  'thread_local', 'throw', 'true', 'try', 'typeid', 'typename', 'using',
  'virtual', 'wchar_t', 'xor', 'xor_eq', 'final', 'import', 'module',
  'main', 'NULL', 'stdin', 'stdout', 'stderr'
]);

export function sanitizeCIdent(name: string): string {
  if (!name || typeof name !== 'string') return '_val';
  if (C_RESERVED_WORDS.has(name) || /^[0-9]/.test(name)) {
    return `_tl_${name}`;
  }
  return name.replace(/[^a-zA-Z0-9_]/g, '_');
}

function collectPatternVarNames(pat: Pattern): string[] {
  if (!pat) return [];
  switch (pat.kind) {
    case 'p_var':
      return [pat.name];
    case 'p_ctor': {
      const names: string[] = [];
      for (const arg of (pat.args || [])) {
        names.push(...collectPatternVarNames(arg));
      }
      return names;
    }
    case 'p_tuple': {
      const names: string[] = [];
      for (const elem of (pat.elements || [])) {
        names.push(...collectPatternVarNames(elem));
      }
      return names;
    }
    case 'p_record': {
      const names: string[] = [];
      for (const f of (pat.fields || [])) {
        const name = f.alias ? f.alias : f.name;
        names.push(name);
      }
      return names;
    }
    case 'p_as': {
      return [pat.name, ...collectPatternVarNames(pat.pattern)];
    }
    default:
      return [];
  }
}

export class CCodeGenerator {
  private tempVarCounter = 0;
  private indentLevel = 0;
  private localScopeVars: Set<string>[] = [];
  private isCpp = true;
  private insideFunction = false;

  private currentModulePath: string[] = [];
  private zeroArityCtors = new Set<string>(['None', 'Nil']);

  private freshVar(prefix = '_t'): string {
    return `${prefix}_${++this.tempVarCounter}`;
  }

  private indent(): string {
    return '  '.repeat(this.indentLevel);
  }

  private pushScope(vars: string[] = []): void {
    this.localScopeVars.push(new Set(vars.filter(Boolean)));
  }

  private popScope(): void {
    this.localScopeVars.pop();
  }

  private addLocalVar(name: string): void {
    if (name && this.localScopeVars.length > 0) {
      this.localScopeVars[this.localScopeVars.length - 1].add(name);
    }
  }

  private isLocalVar(name: string): boolean {
    for (let i = this.localScopeVars.length - 1; i >= 0; i--) {
      if (this.localScopeVars[i].has(name)) return true;
    }
    return false;
  }

  private getCIdent(name: string): string {
    const safe = sanitizeCIdent(name);
    if (!this.isCpp && this.currentModulePath.length > 0) {
      const modPrefix = this.currentModulePath.map(sanitizeCIdent).join('_');
      return `${modPrefix}_${safe}`;
    }
    return safe;
  }

  private collectForwardDecls(stmts: Statement[], modPath: string[] = []): string[] {
    const decls: string[] = [];
    for (const stmt of stmts) {
      if (!stmt) continue;
      if (stmt.kind === 's_function') {
        const fnName = sanitizeCIdent(stmt.name);
        const fullFnName = (!this.isCpp && modPath.length > 0)
          ? `${modPath.map(sanitizeCIdent).join('_')}_${fnName}`
          : fnName;
        const paramList = (stmt.params || []).map(p => {
          const pName = sanitizeCIdent(p.name);
          return this.isCpp ? `const TLValue& ${pName}` : `TLValue ${pName}`;
        });
        const paramStr = paramList.length > 0 ? paramList.join(', ') : (this.isCpp ? '' : 'void');
        if (!this.isCpp || modPath.length === 0) {
          decls.push(`TLValue ${fullFnName}(${paramStr});`);
        }
      } else if (stmt.kind === 's_gadt') {
        if (stmt.decl?.name) {
          const typeName = sanitizeCIdent(stmt.decl.name);
          const fullTypeName = (!this.isCpp && modPath.length > 0)
            ? `${modPath.map(sanitizeCIdent).join('_')}_${typeName}`
            : typeName;
          decls.push(this.isCpp ? `using ${typeName} = TLValue;` : `typedef TLValue ${fullTypeName};`);
        }
        for (const ctor of (stmt.decl?.constructors || [])) {
          if (modPath.length === 0 && PRELUDE_CTORS.has(ctor.name)) {
            if (!ctor.params || ctor.params.length === 0) {
              this.zeroArityCtors.add(ctor.name);
            }
            continue;
          }
          const ctorName = sanitizeCIdent(ctor.name);
          const fullCtorName = (!this.isCpp && modPath.length > 0)
            ? `${modPath.map(sanitizeCIdent).join('_')}_${ctorName}`
            : ctorName;
          if (!ctor.params || ctor.params.length === 0) {
            decls.push(this.isCpp ? `TLValue ${fullCtorName}();` : `static inline TLValue ${fullCtorName}(void);`);
            this.zeroArityCtors.add(ctor.name);
          } else {
            const paramList = ctor.params.map(p => {
              const pName = sanitizeCIdent(p.name);
              return this.isCpp ? `const TLValue& ${pName}` : `TLValue ${pName}`;
            });
            decls.push(this.isCpp ? `TLValue ${fullCtorName}(${paramList.join(', ')});` : `static inline TLValue ${fullCtorName}(${paramList.join(', ')});`);
          }
        }
      } else if (stmt.kind === 's_type_alias') {
        if (stmt.decl?.name) {
          const typeName = sanitizeCIdent(stmt.decl.name);
          const fullTypeName = (!this.isCpp && modPath.length > 0)
            ? `${modPath.map(sanitizeCIdent).join('_')}_${typeName}`
            : typeName;
          decls.push(this.isCpp ? `using ${typeName} = TLValue;` : `typedef TLValue ${fullTypeName};`);
        }
      } else if (stmt.kind === 's_module') {
        if (!this.isCpp) {
          const nextModPath = [...modPath, stmt.name];
          decls.push(...this.collectForwardDecls(stmt.body || [], nextModPath));
        } else {
          const innerDecls = this.collectForwardDecls(stmt.body || [], [...modPath, stmt.name]);
          if (innerDecls.length > 0) {
            const modName = sanitizeCIdent(stmt.name);
            decls.push(`namespace ${modName} {\n  ${innerDecls.join('\n  ')}\n}`);
          }
        }
      }
    }
    return decls;
  }

  public generate(program: Program, options: CCodeGenOptions = { target: 'cpp', standard: 'cpp17', includePrelude: true, includeMain: true }): string {
    this.tempVarCounter = 0;
    this.indentLevel = 0;
    this.localScopeVars = [];
    this.currentModulePath = [];
    this.zeroArityCtors = new Set<string>(['None', 'Nil']);
    this.isCpp = options.target !== 'c';
    const lines: string[] = [];

    if (options.includePrelude !== false) {
      lines.push(this.isCpp ? this.generateCppPrelude() : this.generateCPrelude());
      lines.push('');
    }

    this.pushScope();

    // Top-level statements vs main body statements
    const forwardDecls: string[] = program && program.statements ? this.collectForwardDecls(program.statements) : [];
    const topLevelDecls: string[] = [];
    const mainBodyStatements: string[] = [];

    if (program && program.statements) {
      for (const stmt of program.statements) {
        if (!stmt) continue;
        if (stmt.kind === 's_function' || stmt.kind === 's_gadt' || stmt.kind === 's_type_alias' || stmt.kind === 's_module' || stmt.kind === 's_import') {
          const s = this.generateStatement(stmt);
          if (s.trim()) topLevelDecls.push(s);
        } else {
          const s = this.generateStatement(stmt);
          if (s.trim()) mainBodyStatements.push(s);
        }
      }
    }

    if (forwardDecls.length > 0) {
      lines.push('// Top-Level Function & Constructor Prototypes');
      lines.push(forwardDecls.join('\n'));
      lines.push('');
    }

    if (topLevelDecls.length > 0) {
      lines.push('// Top-Level Declarations & Modules');
      lines.push(topLevelDecls.join('\n\n'));
      lines.push('');
    }

    if (options.includeMain !== false) {
      lines.push('// Entry Point');
      lines.push('int main(int argc, char** argv) {');
      lines.push('  // Initialize runtime environment');
      lines.push('  (void)argc; (void)argv;');
      if (this.isCpp) {
        lines.push('  try {');
        this.indentLevel = 2;
        for (const stmtStr of mainBodyStatements) {
          if (stmtStr.trim()) {
            lines.push(stmtStr);
          }
        }
        this.indentLevel = 0;
        lines.push('  } catch (const typelang::__TLReturnSignal& r) {');
        lines.push('    (void)r;');
        lines.push('    return 0;');
        lines.push('  } catch (const std::exception& e) {');
        lines.push('    std::cerr << "Uncaught TypeLang Exception: " << e.what() << std::endl;');
        lines.push('    return 1;');
        lines.push('  }');
      } else {
        this.indentLevel = 1;
        for (const stmtStr of mainBodyStatements) {
          if (stmtStr.trim()) {
            lines.push(stmtStr);
          }
        }
        this.indentLevel = 0;
      }
      lines.push('  return 0;');
      lines.push('}');
    } else {
      for (const stmtStr of mainBodyStatements) {
        if (stmtStr.trim()) {
          lines.push(stmtStr);
        }
      }
    }

    this.popScope();
    return lines.join('\n');
  }

  private generateCppPrelude(): string {
    return `// ============================================================================
// TypeLang Native C++ Target (C++17 / C++20 Compatible)
// Generated by TypeLang Native Multi-Target Compiler Backend
// ============================================================================
#include <iostream>
#include <string>
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
`;
  }

  private generateCPrelude(): string {
    return `// ============================================================================
// TypeLang Native C Target (C11 / C99 Compatible)
// Generated by TypeLang Native Multi-Target Compiler Backend
// ============================================================================
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
`;
  }

  public generateStatement(stmt: Statement): string {
    if (!stmt) return '';

    switch (stmt.kind) {
      case 's_let': {
        const safeName = sanitizeCIdent(stmt.name);
        this.addLocalVar(stmt.name);
        const init = stmt.init ? this.generateExpr(stmt.init) : (this.isCpp ? 'TLValue()' : 'tl_null()');
        return `${this.indent()}TLValue ${safeName} = ${init};`;
      }

      case 's_function': {
        const safeName = this.getCIdent(stmt.name);
        const paramList = (stmt.params || []).map(p => {
          const pName = sanitizeCIdent(p.name);
          return this.isCpp ? `const TLValue& ${pName}` : `TLValue ${pName}`;
        });
        const paramStr = paramList.length > 0 ? paramList.join(', ') : (this.isCpp ? '' : 'void');
        this.pushScope((stmt.params || []).map(p => p.name));
        
        const wasInside = this.insideFunction;
        this.insideFunction = true;
        
        let whereStr = '';
        if (stmt.whereBindings && stmt.whereBindings.length > 0) {
          this.indentLevel++;
          whereStr = stmt.whereBindings.map(s => this.generateStatement(s)).join('\n') + '\n';
          this.indentLevel--;
        }
        
        const bodyStr = stmt.body ? this.generateFunctionBody(stmt.body) : `${this.indent()}  return ${this.isCpp ? 'TLValue()' : 'tl_null()'};`;
        this.popScope();
        
        const isLocalLambda = this.isCpp && wasInside;
        this.insideFunction = wasInside;
        
        if (isLocalLambda) {
          const paramListLocal = (stmt.params || []).map(p => `const TLValue& ${sanitizeCIdent(p.name)}`);
          const paramStrLocal = paramListLocal.join(', ');
          return `${this.indent()}auto ${safeName} = [&](${paramStrLocal}) -> TLValue {\n${whereStr}${bodyStr}\n${this.indent()}};`;
        }
        
        return `${this.indent()}TLValue ${safeName}(${paramStr}) {\n${whereStr}${bodyStr}\n${this.indent()}}`;
      }

      case 's_gadt': {
        const typeDecl = stmt.decl?.name ? (this.isCpp ? `${this.indent()}using ${sanitizeCIdent(stmt.decl.name)} = TLValue;` : `${this.indent()}typedef TLValue ${this.getCIdent(stmt.decl.name)};`) : '';
        const ctors = (stmt.decl?.constructors || []).map(ctor => {
          if (this.currentModulePath.length === 0 && PRELUDE_CTORS.has(ctor.name)) {
            if (!ctor.params || ctor.params.length === 0) {
              this.zeroArityCtors.add(ctor.name);
            }
            return '';
          }
          const safeCtorName = this.getCIdent(ctor.name);
          if (!ctor.params || ctor.params.length === 0) {
            this.zeroArityCtors.add(ctor.name);
            if (this.isCpp) {
              return `${this.indent()}inline TLValue ${safeCtorName}() { return TLValue::make_variant("${ctor.name}", {}); }`;
            } else {
              return `${this.indent()}static inline TLValue ${safeCtorName}(void) { return tl_variant("${ctor.name}", 0, NULL); }`;
            }
          }
          if (this.isCpp) {
            const params = ctor.params.map(p => `const TLValue& ${sanitizeCIdent(p.name)}`).join(', ');
            const args = ctor.params.map(p => sanitizeCIdent(p.name)).join(', ');
            const fields = ctor.params.map(p => `{"${p.name}", ${sanitizeCIdent(p.name)}}`).join(', ');
            return `${this.indent()}inline TLValue ${safeCtorName}(${params}) {\n${this.indent()}  return TLValue::make_variant("${ctor.name}", {${args}}, {${fields}});\n${this.indent()}}`;
          } else {
            const params = ctor.params.map(p => `TLValue ${sanitizeCIdent(p.name)}`).join(', ');
            const args = ctor.params.map(p => sanitizeCIdent(p.name)).join(', ');
            return `${this.indent()}static inline TLValue ${safeCtorName}(${params}) {\n${this.indent()}  return tl_variant("${ctor.name}", ${ctor.params.length}, (TLValue[]){ ${args} });\n${this.indent()}}`;
          }
        });
        return [typeDecl, ...ctors].filter(Boolean).join('\n');
      }

      case 's_module': {
        const modName = sanitizeCIdent(stmt.name);
        this.addLocalVar(stmt.name);
        this.currentModulePath.push(stmt.name);
        if (this.isCpp) {
          this.indentLevel++;
          this.pushScope();
          const innerStmts = (stmt.body || []).map(s => this.generateStatement(s)).join('\n');
          this.popScope();
          this.indentLevel--;
          this.currentModulePath.pop();
          return `${this.indent()}namespace ${modName} {\n${innerStmts}\n${this.indent()}}`;
        } else {
          this.pushScope();
          const innerStmts = (stmt.body || []).map(s => this.generateStatement(s)).join('\n');
          this.popScope();
          this.currentModulePath.pop();
          return `// Module: ${modName}\n${innerStmts}`;
        }
      }

      case 's_type_alias': {
        const typeName = stmt.decl?.name;
        if (!typeName) return `${this.indent()}// Type alias`;
        return this.isCpp
          ? `${this.indent()}using ${sanitizeCIdent(typeName)} = TLValue;`
          : `${this.indent()}typedef TLValue ${this.getCIdent(typeName)};`;
      }

      case 's_import': {
        const modPath = (stmt.modulePath || []).map(sanitizeCIdent);
        if (modPath.length === 0) return '';

        if (this.isCpp) {
          const prefix = STDLIB_MODULES.has(modPath[0]) ? 'typelang::' : '';
          const cppModPath = `${prefix}${modPath.join('::')}`;
          if (stmt.specifiers && stmt.specifiers.length > 0) {
            const usingLines = stmt.specifiers.map(spec => {
              if (spec.isAll) {
                return `${this.indent()}using namespace ${cppModPath};`;
              }
              if (PRELUDE_CTORS.has(spec.name) && !spec.alias) {
                return '';
              }
              const name = sanitizeCIdent(spec.name);
              const alias = spec.alias ? sanitizeCIdent(spec.alias) : name;
              if (alias !== name) {
                return `${this.indent()}using ${alias} = ${cppModPath}::${name};`;
              }
              return `${this.indent()}using ${cppModPath}::${name};`;
            }).filter(Boolean);
            return usingLines.join('\n');
          } else if (stmt.alias) {
            return `${this.indent()}namespace ${sanitizeCIdent(stmt.alias)} = ${cppModPath};`;
          } else {
            return `${this.indent()}using namespace ${cppModPath};`;
          }
        } else {
          const cModPrefix = modPath.join('_');
          if (stmt.specifiers && stmt.specifiers.length > 0) {
            const macroLines = stmt.specifiers.map(spec => {
              if (spec.isAll) return `${this.indent()}// import ${cModPrefix}.*`;
              const name = sanitizeCIdent(spec.name);
              const alias = spec.alias ? sanitizeCIdent(spec.alias) : name;
              return `${this.indent()}#define ${alias} ${cModPrefix}_${name}`;
            });
            return macroLines.join('\n');
          } else if (stmt.alias) {
            return `${this.indent()}// alias ${sanitizeCIdent(stmt.alias)} = ${cModPrefix}`;
          } else {
            return `${this.indent()}// import ${cModPrefix}`;
          }
        }
      }

      case 's_extern_function': {
        const safeName = sanitizeCIdent(stmt.name);
        this.addLocalVar(stmt.name);
        return `${this.indent()}// extern function ${safeName}`;
      }

      case 's_extern_type':
      case 's_extern_value':
      case 's_extern_module': {
        return `${this.indent()}// extern ${stmt.name || ''}`;
      }

      case 's_expr': {
        if (stmt.expr?.kind === 'e_for') {
          return this.generateForLoopStatement(stmt.expr);
        }
        if (stmt.expr?.kind === 'e_while') {
          return this.generateWhileLoopStatement(stmt.expr);
        }
        if (!this.isCpp && stmt.expr?.kind === 'e_if') {
          return this.generateIfStatement(stmt.expr as any);
        }
        if (!this.isCpp && stmt.expr?.kind === 'e_break') {
          return `${this.indent()}break;`;
        }
        if (!this.isCpp && stmt.expr?.kind === 'e_continue') {
          return `${this.indent()}continue;`;
        }
        const exprStr = this.generateExpr(stmt.expr);
        return `${this.indent()}${exprStr};`;
      }

      default:
        return '';
    }
  }

  private generateFunctionBody(expr: Expr): string {
    this.indentLevel++;
    if (expr.kind === 'e_block') {
      const lines: string[] = [];
      this.pushScope();
      if (expr.statements) {
        for (const s of expr.statements) {
          lines.push(this.generateStatement(s));
        }
      }
      if (expr.result) {
        lines.push(`${this.indent()}return ${this.generateExpr(expr.result)};`);
      } else {
        lines.push(`${this.indent()}return ${this.isCpp ? 'TLValue()' : 'tl_null()'};`);
      }
      this.popScope();
      this.indentLevel--;
      return lines.join('\n');
    }

    if (expr.kind === 'e_match') {
      const matchBody = this.generateMatchStatementBody(expr.scrutinee, expr.arms || []);
      this.indentLevel--;
      return matchBody;
    }

    const ret = `${this.indent()}return ${this.generateExpr(expr)};`;
    this.indentLevel--;
    return ret;
  }

  public generateExpr(expr: Expr): string {
    if (!expr) return this.isCpp ? 'TLValue()' : 'tl_null()';

    switch (expr.kind) {
      case 'e_literal': {
        if (expr.value === null || expr.value === undefined) return this.isCpp ? 'TLValue()' : 'tl_null()';
        if (typeof expr.value === 'string') {
          const esc = this.escapeString(expr.value);
          return this.isCpp ? `TLValue("${esc}")` : `tl_str("${esc}")`;
        }
        if (typeof expr.value === 'boolean') {
          return this.isCpp ? `TLValue(${expr.value ? 'true' : 'false'})` : `tl_bool(${expr.value ? 'true' : 'false'})`;
        }
        if (typeof expr.value === 'number') {
          return this.isCpp ? `TLValue(${expr.value})` : `tl_num(${expr.value})`;
        }
        const esc = this.escapeString(String(expr.value));
        return this.isCpp ? `TLValue("${esc}")` : `tl_str("${esc}")`;
      }

      case 'e_var': {
        const isLocal = this.isLocalVar(expr.name);
        const corePrimitives = ['print', 'println', 'to_string', 'concat', 'parse_int', 'parse_float', 'time_now'];
        const stdModules = ['Math', 'Array', 'String', 'Option', 'Result'];

        if (!isLocal && this.zeroArityCtors.has(expr.name) && (!expr.modulePath || expr.modulePath.length === 0)) {
          return this.isCpp ? `${sanitizeCIdent(expr.name)}()` : `${this.getCIdent(expr.name)}()`;
        }

        if (!isLocal && corePrimitives.includes(expr.name) && (!expr.modulePath || expr.modulePath.length === 0)) {
          return this.isCpp ? `typelang::${sanitizeCIdent(expr.name)}` : sanitizeCIdent(expr.name);
        }
        if (!isLocal && stdModules.includes(expr.name) && (!expr.modulePath || expr.modulePath.length === 0)) {
          return this.isCpp ? `typelang::${sanitizeCIdent(expr.name)}` : sanitizeCIdent(expr.name);
        }
        if (expr.modulePath && expr.modulePath.length > 0) {
          const sep = this.isCpp ? '::' : '_';
          const prefix = (this.isCpp && STDLIB_MODULES.has(expr.modulePath[0])) ? 'typelang::' : '';
          const modStr = expr.modulePath.map(sanitizeCIdent).join(sep);
          return `${prefix}${modStr}${sep}${sanitizeCIdent(expr.name)}`;
        }
        if (!isLocal && !this.isCpp && this.currentModulePath.length > 0) {
          return this.getCIdent(expr.name);
        }
        return sanitizeCIdent(expr.name);
      }

      case 'e_unary': {
        const sub = this.generateExpr(expr.expr);
        if (this.isCpp) {
          if (expr.op === '!') return `(!${sub})`;
          if (expr.op === '-') return `(-${sub})`;
          return sub;
        } else {
          if (expr.op === '!') return `tl_not(${sub})`;
          if (expr.op === '-') return `tl_neg(${sub})`;
          return sub;
        }
      }

      case 'e_binary': {
        const left = this.generateExpr(expr.left);
        const right = this.generateExpr(expr.right);
        if (this.isCpp) {
          switch (expr.op) {
            case '+': return `(${left} + ${right})`;
            case '-': return `(${left} - ${right})`;
            case '*': return `(${left} * ${right})`;
            case '/': return `(${left} / ${right})`;
            case '%': return `(${left} % ${right})`;
            case '==': return `(${left} == ${right})`;
            case '!=': return `(${left} != ${right})`;
            case '<': return `(${left} < ${right})`;
            case '<=': return `(${left} <= ${right})`;
            case '>': return `(${left} > ${right})`;
            case '>=': return `(${left} >= ${right})`;
            case '&&': return `TLValue(${left}.is_truthy() && ${right}.is_truthy())`;
            case '||': return `TLValue(${left}.is_truthy() || ${right}.is_truthy())`;
            default: return `(${left} + ${right})`;
          }
        } else {
          switch (expr.op) {
            case '+': return `tl_add(${left}, ${right})`;
            case '-': return `tl_sub(${left}, ${right})`;
            case '*': return `tl_mul(${left}, ${right})`;
            case '/': return `tl_div(${left}, ${right})`;
            case '%': return `tl_mod(${left}, ${right})`;
            case '==': return `tl_eq(${left}, ${right})`;
            case '!=': return `tl_ne(${left}, ${right})`;
            case '<': return `tl_lt(${left}, ${right})`;
            case '<=': return `tl_le(${left}, ${right})`;
            case '>': return `tl_gt(${left}, ${right})`;
            case '>=': return `tl_ge(${left}, ${right})`;
            case '&&': return `tl_bool(tl_is_truthy(${left}) && tl_is_truthy(${right}))`;
            case '||': return `tl_bool(tl_is_truthy(${left}) || tl_is_truthy(${right}))`;
            default: return `tl_add(${left}, ${right})`;
          }
        }
      }

      case 'e_assign': {
        const val = this.generateExpr(expr.value);
        const op = expr.op || '=';
        if (expr.target.kind === 'e_var') {
          return `(${sanitizeCIdent(expr.target.name)} ${op} ${val})`;
        } else if (expr.target.kind === 'e_field_access') {
          const obj = this.generateExpr(expr.target.object);
          if (this.isCpp) {
            return `(${obj}.set("${expr.target.field}", ${val}), ${val})`;
          } else {
            return `(${val})`;
          }
        } else if (expr.target.kind === 'e_index') {
          const obj = this.generateExpr(expr.target.target);
          const idx = this.generateExpr(expr.target.index);
          return `(${obj}[${idx}] = ${val})`;
        }
        return `(${val})`;
      }

      case 'e_call': {
        const callee = this.generateExpr(expr.callee);
        const args = (expr.args || []).map(a => this.generateExpr(a));

        if (expr.callee.kind === 'e_var') {
          const fnName = expr.callee.name;
          const isLocal = this.isLocalVar(fnName);
          if (!expr.callee.modulePath || expr.callee.modulePath.length === 0) {
            const safeFnName = (!isLocal && !this.isCpp && this.currentModulePath.length > 0)
              ? this.getCIdent(fnName)
              : sanitizeCIdent(fnName);
            if (isLocal) {
              if (this.isCpp) {
                return `${safeFnName}.call({${args.join(', ')}})`;
              } else {
                return `(${safeFnName}.kind == TL_KIND_FN && ${safeFnName}.u.fn ? ${safeFnName}.u.fn(${args.length}, (TLValue[]){ ${args.join(', ')} }) : tl_null())`;
              }
            }
            return `${safeFnName}(${args.join(', ')})`;
          }
          const sep = this.isCpp ? '::' : '_';
          const prefix = (this.isCpp && STDLIB_MODULES.has(expr.callee.modulePath[0])) ? 'typelang::' : '';
          const modPath = expr.callee.modulePath.map(sanitizeCIdent).join(sep);
          return `${prefix}${modPath}${sep}${sanitizeCIdent(fnName)}(${args.join(', ')})`;
        }

        if (expr.callee.kind === 'e_field_access') {
          const objStr = this.generateExpr(expr.callee.object);
          const field = expr.callee.field;
          if (expr.callee.object.kind === 'e_var') {
            const rawObjName = expr.callee.object.name;
            const isObjLocal = this.isLocalVar(rawObjName);
            if (!isObjLocal && (STDLIB_MODULES.has(rawObjName) || this.currentModulePath.includes(rawObjName))) {
              const sep = this.isCpp ? '::' : '_';
              const prefix = (this.isCpp && STDLIB_MODULES.has(rawObjName)) ? 'typelang::' : '';
              return `${prefix}${sanitizeCIdent(rawObjName)}${sep}${sanitizeCIdent(field)}(${args.join(', ')})`;
            }
          }
          if (this.isCpp) {
            if ((expr as any).isModuleMethod || (expr.callee as any).isModuleMethod) {
              return `${objStr}.get("${field}").call({${args.join(', ')}})`;
            }
            return `${objStr}.get("${field}").call({${[objStr, ...args].join(', ')}})`;
          } else {
            return `tl_get_field(${objStr}, "${field}")`;
          }
        }

        if (this.isCpp) {
          return `${callee}.call({${args.join(', ')}})`;
        } else {
          return `${callee}`;
        }
      }

      case 'e_method_call': {
        const obj = this.generateExpr(expr.object);
        const args = (expr.args || []).map(a => this.generateExpr(a));
        if (expr.object.kind === 'e_var') {
          const mod = sanitizeCIdent(expr.object.name);
          if (mod === 'Math' || mod === 'Array' || mod === 'String' || mod === 'Option' || mod === 'Result') {
            const sep = this.isCpp ? '::' : '_';
            return `${mod}${sep}${sanitizeCIdent(expr.method)}(${args.join(', ')})`;
          }
        }
        if (this.isCpp) {
          if ((expr as any).isModuleMethod) {
            return `${obj}.get("${expr.method}").call({${args.join(', ')}})`;
          }
          return `${obj}.get("${expr.method}").call({${[obj, ...args].join(', ')}})`;
        } else {
          return `tl_get_field(${obj}, "${expr.method}")`;
        }
      }

      case 'e_field_access': {
        if (expr.object.kind === 'e_var') {
          const mod = sanitizeCIdent(expr.object.name);
          if (mod === 'Math' || mod === 'Array' || mod === 'String' || mod === 'Option' || mod === 'Result') {
            return this.isCpp ? `TLValue(TLFunction([](const std::vector<TLValue>& a) { (void)a; return TLValue(); }))` : `tl_null()`;
          }
        }
        const obj = this.generateExpr(expr.object);
        if (this.isCpp) {
          return `${obj}.get("${expr.field}")`;
        } else {
          return `tl_get_field(${obj}, "${expr.field}")`;
        }
      }

      case 'e_index': {
        const obj = this.generateExpr(expr.target);
        const idx = this.generateExpr(expr.index);
        if (this.isCpp) {
          return `${obj}[${idx}]`;
        } else {
          return `tl_get_index(${obj}, ${idx})`;
        }
      }

      case 'e_record': {
        const fieldPairs: { name: string; valueCode: string }[] = [];

        for (const f of (expr.fields || [])) {
          fieldPairs.push({
            name: f.name,
            valueCode: this.generateExpr(f.value)
          });
        }

        for (const m of (expr.methods || [])) {
          const methodParams = m.selfParam ? [{ name: m.selfParam }, ...(m.params || [])] : (m.params || []);
          const lambdaStr = this.generateExpr({
            kind: 'e_lambda',
            typeParams: [],
            params: methodParams,
            body: m.body
          });
          fieldPairs.push({
            name: m.name,
            valueCode: lambdaStr
          });
        }

        if (this.isCpp) {
          const cppPairs = fieldPairs.map(fp => `{"${fp.name}", ${fp.valueCode}}`);
          return `TLValue::make_record({${cppPairs.join(', ')}})`;
        } else {
          const len = fieldPairs.length;
          if (len === 0) return 'tl_record(0, NULL, NULL)';
          const keys = fieldPairs.map(fp => `"${fp.name}"`).join(', ');
          const vals = fieldPairs.map(fp => fp.valueCode).join(', ');
          return `tl_record(${len}, (const char*[]){ ${keys} }, (const TLValue[]){ ${vals} })`;
        }
      }

      case 'e_record_update': {
        const base = this.generateExpr(expr.base);
        if (this.isCpp) {
          const updates = (expr.updates || []).map(u => `{"${u.name}", ${this.generateExpr(u.value)}}`);
          return `[&]() -> TLValue {\n  TLValue _b = ${base};\n  if (_b.kind != TLKind::Record || !_b.rec_val) _b.rec_val = std::make_shared<TLRecord>();\n  TLRecord _r = *_b.rec_val;\n  for (const auto& kv : std::map<std::string, TLValue>{${updates.join(', ')}}) { _r[kv.first] = kv.second; }\n  return TLValue(_r);\n}()`;
        } else {
          return base;
        }
      }

      case 'e_tuple': {
        const elems = (expr.elements || []).map(e => this.generateExpr(e));
        if (this.isCpp) {
          return `TLValue::make_array({${elems.join(', ')}})`;
        } else {
          const len = elems.length;
          if (len === 0) return 'tl_array(0, NULL)';
          return `tl_array(${len}, (const TLValue[]){ ${elems.join(', ')} })`;
        }
      }

      case 'e_lambda': {
        const paramNames = (expr.params || []).map(p => p.name);
        this.pushScope(paramNames);
        const bodyStr = this.generateFunctionBody(expr.body);
        this.popScope();

        if (this.isCpp) {
          const argsBindings = (expr.params || []).map((p, idx) => `TLValue ${sanitizeCIdent(p.name)} = (_args.size() > ${idx} ? _args[${idx}] : TLValue());`).join(' ');
          return `TLValue(TLFunction([&](const std::vector<TLValue>& _args) -> TLValue {\n  ${argsBindings}\n  ${bodyStr}\n}))`;
        } else {
          return 'tl_null()';
        }
      }

      case 'e_if': {
        const cond = this.generateExpr(expr.cond);
        const thenBranch = this.generateExpr(expr.thenExpr);
        const elseBranch = expr.elseExpr ? this.generateExpr(expr.elseExpr) : (this.isCpp ? 'TLValue()' : 'tl_null()');
        if (this.isCpp) {
          return `(${cond}.is_truthy() ? ${thenBranch} : ${elseBranch})`;
        } else {
          return `(tl_is_truthy(${cond}) ? ${thenBranch} : ${elseBranch})`;
        }
      }

      case 'e_match': {
        return this.generateMatchExpr(expr.scrutinee, expr.arms || []);
      }

      case 'e_switch': {
        const discr = this.generateExpr(expr.discriminant);
        if (this.isCpp) {
          let out = `[&]() -> TLValue {\n  TLValue _discr = ${discr};\n  bool _matched = false, _fallthrough = false;\n`;
          for (const c of expr.cases || []) {
            const vals = c.values && c.values.length > 0 ? c.values : (c.value ? [c.value] : []);
            const conds = vals.map(v => `(_discr == ${this.generateExpr(v)}).bool_val`).join(' || ');
            out += `  if (_fallthrough || (${conds})) {\n    _matched = true;\n    _fallthrough = false;\n    try {\n      return ${this.generateExpr(c.body)};\n    } catch (const typelang::__TLContinueSignal&) { _fallthrough = true; }\n    catch (const typelang::__TLBreakSignal&) { return TLValue(); }\n  }\n`;
          }
          if (expr.defaultCase) {
            out += `  if (_fallthrough || !_matched) {\n    return ${this.generateExpr(expr.defaultCase)};\n  }\n`;
          }
          out += `  return TLValue();\n}()`;
          return out;
        } else {
          let out = `({\n  TLValue _discr = ${discr};\n  TLValue _res = tl_null();\n`;
          let first = true;
          for (const c of expr.cases || []) {
            const vals = c.values && c.values.length > 0 ? c.values : (c.value ? [c.value] : []);
            const conds = vals.map(v => `tl_eq_bool(_discr, ${this.generateExpr(v)})`).join(' || ');
            out += `  ${first ? '' : 'else '}if (${conds}) {\n    _res = ${this.generateExpr(c.body)};\n  }\n`;
            first = false;
          }
          if (expr.defaultCase) {
            out += `  else {\n    _res = ${this.generateExpr(expr.defaultCase)};\n  }\n`;
          }
          out += `  _res;\n})`;
          return out;
        }
      }

      case 'e_range': {
        const start = this.generateExpr(expr.start);
        const end = this.generateExpr(expr.end);
        const inc = expr.inclusive ? 'true' : 'false';
        if (this.isCpp) {
          return `[&]() -> TLValue {\n  TLArray _res;\n  int64_t _s = (${start}).to_int();\n  int64_t _e = (${end}).to_int();\n  bool _inc = ${inc};\n  if (_s <= _e) {\n    int64_t _limit = _inc ? _e : _e - 1;\n    for (int64_t _i = _s; _i <= _limit; ++_i) _res.push_back(TLValue(_i));\n  } else {\n    int64_t _limit = _inc ? _e : _e + 1;\n    for (int64_t _i = _s; _i >= _limit; --_i) _res.push_back(TLValue(_i));\n  }\n  return TLValue(_res);\n}()`;
        } else {
          return `({ int64_t _s = (int64_t)tl_to_num(${start}); int64_t _e = (int64_t)tl_to_num(${end}); size_t _len = (_s <= _e ? _e - _s + 1 : _s - _e + 1); TLValue* _arr = (TLValue*)malloc(sizeof(TLValue) * _len); for(size_t _i = 0; _i < _len; ++_i) _arr[_i] = tl_num(_s <= _e ? _s + _i : _s - _i); tl_array(_len, _arr); })`;
        }
      }

      case 'e_list_comp': {
        const itemVar = sanitizeCIdent(expr.param);
        const iter = this.generateExpr(expr.iterable);
        const filterStr = expr.condition ? (this.isCpp ? `if (${this.generateExpr(expr.condition)}.is_truthy()) ` : `if (tl_is_truthy(${this.generateExpr(expr.condition)})) `) : '';
        const elemStr = this.generateExpr(expr.element);

        if (this.isCpp) {
          return `[&]() -> TLValue {\n  TLArray _res;\n  TLValue _list = ${iter};\n  if (_list.kind == TLKind::Array && _list.arr_val) {\n    for (const auto& ${itemVar} : *_list.arr_val) {\n      ${filterStr}_res.push_back(${elemStr});\n    }\n  }\n  return TLValue(_res);\n}()`;
        } else {
          return `tl_null()`;
        }
      }

      case 'e_block': {
        this.indentLevel++;
        this.pushScope();
        const lines: string[] = [];
        if (expr.statements) {
          for (const s of expr.statements) {
            lines.push(this.generateStatement(s));
          }
        }
        const res = expr.result ? this.generateExpr(expr.result) : (this.isCpp ? 'TLValue()' : 'tl_null()');
        lines.push(`${this.indent()}return ${res};`);
        this.popScope();
        this.indentLevel--;
        if (this.isCpp) {
          return `[&]() -> TLValue {\n${lines.join('\n')}\n}()`;
        } else {
          return `({\n${lines.join('\n')}\n})`;
        }
      }

      case 'e_for': {
        if (this.isCpp) {
          return `[&]() -> TLValue {\n${this.generateForLoopStatement(expr)}\n  return TLValue();\n}()`;
        } else {
          return `({\n${this.generateForLoopStatement(expr)}\n  tl_null();\n})`;
        }
      }

      case 'e_while': {
        if (this.isCpp) {
          return `[&]() -> TLValue {\n${this.generateWhileLoopStatement(expr)}\n  return TLValue();\n}()`;
        } else {
          return `({\n${this.generateWhileLoopStatement(expr)}\n  tl_null();\n})`;
        }
      }

      case 'e_break':
        return this.isCpp ? `([]() -> TLValue { throw typelang::__TLBreakSignal(); return TLValue(); })()` : 'tl_null()';

      case 'e_continue':
        return this.isCpp ? `([]() -> TLValue { throw typelang::__TLContinueSignal(); return TLValue(); })()` : 'tl_null()';

      case 'e_return': {
        const valStr = expr.value ? this.generateExpr(expr.value) : (this.isCpp ? 'TLValue()' : 'tl_null()');
        return this.isCpp ? `([&]() -> TLValue { throw typelang::__TLReturnSignal(${valStr}); return TLValue(); })()` : `return ${valStr}`;
      }

      case 'e_do': {
        const desugared = desugarDo(expr);
        return this.generateExpr(desugared);
      }

      case 'e_where': {
        this.pushScope();
        this.indentLevel++;
        const wasInside = this.insideFunction;
        this.insideFunction = true;
        const stmts = (expr.bindings || []).map(s => this.generateStatement(s)).join('\n');
        this.insideFunction = wasInside;
        const res = `${this.indent()}return ${this.generateExpr(expr.expr)};`;
        this.indentLevel--;
        this.popScope();
        if (this.isCpp) {
          return `[&]() -> TLValue {\n${stmts}\n${res}\n${this.indent()}}()`;
        } else {
          return `({\n${stmts}\n${res}\n${this.indent()}})`;
        }
      }

      default:
        return this.isCpp ? 'TLValue()' : 'tl_null()';
    }
  }

  private generateForLoopStatement(expr: EFor): string {
    this.pushScope();
    let initStr = '';
    if (expr.init) {
      if (expr.init.kind === 's_let') {
        const safeName = sanitizeCIdent(expr.init.name);
        this.addLocalVar(expr.init.name);
        const initVal = this.generateExpr(expr.init.init);
        initStr = `TLValue ${safeName} = ${initVal}`;
      } else if (expr.init.kind === 's_expr') {
        initStr = this.generateExpr(expr.init.expr);
      } else if ((expr.init as any).kind?.startsWith('e_')) {
        initStr = this.generateExpr(expr.init as Expr);
      }
    }
    const condStr = expr.cond ? (this.isCpp ? `${this.generateExpr(expr.cond)}.is_truthy()` : `tl_is_truthy(${this.generateExpr(expr.cond)})`) : 'true';
    const updateStr = expr.update ? this.generateExpr(expr.update) : '';

    let bodyCode = '';
    if (expr.body.kind === 'e_block') {
      this.indentLevel++;
      const stmts = (expr.body.statements || []).map(s => this.generateStatement(s));
      const res = expr.body.result ? `${this.indent()}${this.generateExpr(expr.body.result)};` : '';
      this.indentLevel--;
      bodyCode = `{\n${[...stmts, res].filter(Boolean).join('\n')}\n${this.indent()}}`;
    } else {
      bodyCode = `{\n${this.indent()}  ${this.generateExpr(expr.body)};\n${this.indent()}}`;
    }
    this.popScope();

    if (this.isCpp) {
      return `${this.indent()}try { for (${initStr}; ${condStr}; ${updateStr}) { try ${bodyCode} catch(const typelang::__TLContinueSignal&) { continue; } } } catch(const typelang::__TLBreakSignal&) {}`;
    } else {
      return `${this.indent()}for (${initStr}; ${condStr}; ${updateStr}) ${bodyCode}`;
    }
  }

  private generateWhileLoopStatement(expr: EWhile): string {
    this.pushScope();
    const condStr = expr.cond ? (this.isCpp ? `${this.generateExpr(expr.cond)}.is_truthy()` : `tl_is_truthy(${this.generateExpr(expr.cond)})`) : 'true';

    let bodyCode = '';
    if (expr.body.kind === 'e_block') {
      this.indentLevel++;
      const stmts = (expr.body.statements || []).map(s => this.generateStatement(s));
      const res = expr.body.result ? `${this.indent()}${this.generateExpr(expr.body.result)};` : '';
      this.indentLevel--;
      bodyCode = `{\n${[...stmts, res].filter(Boolean).join('\n')}\n${this.indent()}}`;
    } else {
      bodyCode = `{\n${this.indent()}  ${this.generateExpr(expr.body)};\n${this.indent()}}`;
    }
    this.popScope();

    if (this.isCpp) {
      return `${this.indent()}try { while (${condStr}) { try ${bodyCode} catch(const typelang::__TLContinueSignal&) { continue; } } } catch(const typelang::__TLBreakSignal&) {}`;
    } else {
      return `${this.indent()}while (${condStr}) ${bodyCode}`;
    }
  }

  private generateIfStatement(expr: any): string {
    const cond = `tl_is_truthy(${this.generateExpr(expr.cond)})`;
    this.indentLevel++;
    let thenCode = '';
    if (expr.thenExpr && expr.thenExpr.kind === 'e_block') {
      const stmts = (expr.thenExpr.statements || []).map((s: Statement) => this.generateStatement(s));
      const res = expr.thenExpr.result ? `${this.indent()}${this.generateExpr(expr.thenExpr.result)};` : '';
      thenCode = [...stmts, res].filter(Boolean).join('\n');
    } else if (expr.thenExpr) {
      thenCode = `${this.indent()}${this.generateExpr(expr.thenExpr)};`;
    }
    this.indentLevel--;

    let elseCode = '';
    if (expr.elseExpr) {
      if (expr.elseExpr.kind === 'e_if') {
        elseCode = ` else ${this.generateIfStatement(expr.elseExpr).trimStart()}`;
      } else {
        this.indentLevel++;
        let innerElse = '';
        if (expr.elseExpr.kind === 'e_block') {
          const stmts = (expr.elseExpr.statements || []).map((s: Statement) => this.generateStatement(s));
          const res = expr.elseExpr.result ? `${this.indent()}${this.generateExpr(expr.elseExpr.result)};` : '';
          innerElse = [...stmts, res].filter(Boolean).join('\n');
        } else {
          innerElse = `${this.indent()}${this.generateExpr(expr.elseExpr)};`;
        }
        this.indentLevel--;
        elseCode = ` else {\n${innerElse}\n${this.indent()}}`;
      }
    }

    return `${this.indent()}if (${cond}) {\n${thenCode}\n${this.indent()}}${elseCode}`;
  }

  private generateMatchStatementBody(scrutinee: Expr, arms: MatchArm[]): string {
    const scrutineeExpr = this.generateExpr(scrutinee);
    const targetVar = this.freshVar('_match_val');

    const lines: string[] = [];
    lines.push(`${this.indent()}TLValue ${targetVar} = ${scrutineeExpr};`);

    for (const arm of arms) {
      const cond = this.generatePatternCondition(arm.pattern, targetVar);
      const bindings = this.generatePatternBindings(arm.pattern, targetVar);

      const patVars = collectPatternVarNames(arm.pattern);
      this.pushScope(patVars);
      const bodyExpr = this.generateExpr(arm.body);
      const guardExpr = arm.guard ? this.generateExpr(arm.guard) : '';
      this.popScope();

      lines.push(`${this.indent()}if (${cond}) {`);
      this.indentLevel++;
      if (bindings.trim()) {
        lines.push(`${this.indent()}${bindings}`);
      }
      if (arm.guard) {
        const guardCheck = this.isCpp
          ? `if (${guardExpr}.is_truthy())`
          : `if (tl_is_truthy(${guardExpr}))`;
        lines.push(`${this.indent()}${guardCheck} {`);
        this.indentLevel++;
        lines.push(`${this.indent()}return ${bodyExpr};`);
        this.indentLevel--;
        lines.push(`${this.indent()}}`);
      } else {
        lines.push(`${this.indent()}return ${bodyExpr};`);
      }
      this.indentLevel--;
      lines.push(`${this.indent()}}`);
    }

    lines.push(`${this.indent()}return ${this.isCpp ? 'TLValue()' : 'tl_null()'};`);
    return lines.join('\n');
  }

  private generateMatchExpr(scrutinee: Expr, arms: MatchArm[]): string {
    const scrutineeExpr = this.generateExpr(scrutinee);
    const targetVar = this.freshVar('_match_val');

    if (this.isCpp) {
      const armChecks = (arms || []).map(arm => {
        const cond = this.generatePatternCondition(arm.pattern, targetVar);
        const bindings = this.generatePatternBindings(arm.pattern, targetVar);

        const patVars = collectPatternVarNames(arm.pattern);
        this.pushScope(patVars);
        const bodyExpr = this.generateExpr(arm.body);
        const guardExpr = arm.guard ? this.generateExpr(arm.guard) : '';
        this.popScope();

        let guardStr = '';
        if (arm.guard) {
          guardStr = `  if (${guardExpr}.is_truthy()) {\n    return ${bodyExpr};\n  }`;
        } else {
          guardStr = `  return ${bodyExpr};`;
        }

        return `if (${cond}) {\n` +
               `  ${bindings}\n` +
               `${guardStr}\n` +
               `}`;
      });

      return `[&]() -> TLValue {\n` +
             `  TLValue ${targetVar} = ${scrutineeExpr};\n` +
             `  ${armChecks.join('\n  ')}\n` +
             `  return TLValue();\n` +
             `}()`;
    } else {
      const armChecks = (arms || []).map((arm) => {
        const cond = this.generatePatternCondition(arm.pattern, targetVar);
        const bindings = this.generatePatternBindings(arm.pattern, targetVar);

        const patVars = collectPatternVarNames(arm.pattern);
        this.pushScope(patVars);
        const bodyExpr = this.generateExpr(arm.body);
        const guardExpr = arm.guard ? this.generateExpr(arm.guard) : '';
        this.popScope();

        let guardStr = '';
        if (arm.guard) {
          guardStr = `if (tl_is_truthy(${guardExpr})) {\n      _res = ${bodyExpr};\n      _done = true;\n    }`;
        } else {
          guardStr = `_res = ${bodyExpr};\n    _done = true;`;
        }

        return `if (!_done && (${cond})) {\n` +
               `    ${bindings}\n    ` +
               `${guardStr}\n` +
               `  }`;
      });

      return `({\n` +
             `  TLValue ${targetVar} = ${scrutineeExpr};\n` +
             `  TLValue _res = tl_null();\n` +
             `  bool _done = false;\n` +
             `  ${armChecks.join('\n  ')}\n` +
             `  _res;\n` +
             `})`;
    }
  }

  private generatePatternCondition(pat: Pattern, targetVar: string): string {
    if (!pat) return 'true';

    switch (pat.kind) {
      case 'p_wildcard':
      case 'p_var':
        return 'true';

      case 'p_literal': {
        const lit = this.generateExpr({ kind: 'e_literal', value: pat.value });
        if (this.isCpp) {
          return `(${targetVar} == ${lit}).bool_val`;
        } else {
          return `tl_eq_bool(${targetVar}, ${lit})`;
        }
      }

      case 'p_ctor': {
        if (this.isCpp) {
          return `(${targetVar}.kind == TLKind::Variant && ${targetVar}.var_val && ${targetVar}.var_val->tag == "${pat.name}")`;
        } else {
          return `tl_is_tag(${targetVar}, "${pat.name}").u.b`;
        }
      }

      case 'p_tuple': {
        if (this.isCpp) {
          const checks = (pat.elements || []).map((elem, i) =>
            this.generatePatternCondition(elem, `(${targetVar}[TLValue(${i})])`)
          );
          return `(${targetVar}.kind == TLKind::Array && ${targetVar}.arr_val && ${targetVar}.arr_val->size() >= ${pat.elements.length} ${checks.length > 0 ? '&& ' + checks.join(' && ') : ''})`;
        } else {
          const checks = (pat.elements || []).map((elem, i) =>
            this.generatePatternCondition(elem, `tl_get_index(${targetVar}, tl_num(${i}))`)
          );
          return `(${targetVar}.kind == TL_KIND_ARR && ${targetVar}.u.arr && ${targetVar}.u.arr->len >= ${pat.elements.length} ${checks.length > 0 ? '&& ' + checks.join(' && ') : ''})`;
        }
      }

      case 'p_record': {
        if (this.isCpp) {
          const checks = (pat.fields || []).map(f =>
            `(${targetVar}.get("${f.name}").kind != TLKind::Null)`
          );
          return `(${targetVar}.kind == TLKind::Record && ${targetVar}.rec_val ${checks.length > 0 ? '&& ' + checks.join(' && ') : ''})`;
        } else {
          const checks = (pat.fields || []).map(f =>
            `(tl_get_field(${targetVar}, "${f.name}").kind != TL_KIND_NULL)`
          );
          return `(${targetVar}.kind == TL_KIND_REC && ${targetVar}.u.rec ${checks.length > 0 ? '&& ' + checks.join(' && ') : ''})`;
        }
      }

      default:
        return 'true';
    }
  }

  private generatePatternBindings(pat: Pattern, targetVar: string): string {
    if (!pat) return '';

    switch (pat.kind) {
      case 'p_var':
        return `TLValue ${sanitizeCIdent(pat.name)} = ${targetVar};`;

      case 'p_ctor': {
        const bindings = (pat.args || []).map((arg, i) => {
          if (arg.kind === 'p_var') {
            if (this.isCpp) {
              return `TLValue ${sanitizeCIdent(arg.name)} = (${targetVar}.var_val->args.size() > ${i} ? ${targetVar}.var_val->args[${i}] : TLValue());`;
            } else {
              return `TLValue ${sanitizeCIdent(arg.name)} = tl_var_arg(${targetVar}, ${i});`;
            }
          }
          return '';
        }).filter(Boolean);
        return bindings.join('\n  ');
      }

      case 'p_record': {
        const bindings = (pat.fields || []).map(f => {
          const varName = f.alias ? sanitizeCIdent(f.alias) : sanitizeCIdent(f.name);
          if (this.isCpp) {
            return `TLValue ${varName} = ${targetVar}.get("${f.name}");`;
          } else {
            return `TLValue ${varName} = tl_get_field(${targetVar}, "${f.name}");`;
          }
        });
        return bindings.join('\n  ');
      }

      case 'p_tuple': {
        const bindings = (pat.elements || []).map((elem, i) => {
          if (elem.kind === 'p_var') {
            if (this.isCpp) {
              return `TLValue ${sanitizeCIdent(elem.name)} = ${targetVar}[TLValue(${i})];`;
            } else {
              return `TLValue ${sanitizeCIdent(elem.name)} = tl_get_index(${targetVar}, tl_num(${i}));`;
            }
          }
          return '';
        }).filter(Boolean);
        return bindings.join('\n  ');
      }

      default:
        return '';
    }
  }

  private escapeString(s: string): string {
    if (!s) return '';
    return s
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }
}
