# TypeLang Hardening & Polish Release Plan

This plan focuses exclusively on **tightening the existing implementation, developer ergonomics, pipeline resilience, error reporting, and test infrastructure** without introducing new language features.

---

## 1. Type Checker & Diagnostic Precision [COMPLETED]
- [x] **Pinpoint Diagnostic Spans**: Ensure all type mismatch, unbound symbol, and exhaustiveness error diagnostics carry exact start and end AST token columns rather than broad line-level or fallback ranges.
- [x] **Enhanced "Did You Mean?" Suggestions**: Improve fuzzy matching Levenshtein distance for typos across local symbols, record fields, enum constructors, and modular standard library imports (`Math`, `Array`, `String`, `DOM`, `Node`).
- [x] **Occurs-Check Cycle Detection Diagnostics**: Provide cleaner, human-readable circular reference errors (e.g. `Type variable 'a cannot occur within (a) => number`) when type unification encounters recursive type constraints.
- [x] **Strict Mutability & Reassignment Verification**: Verify edge cases in mutable binding checks (e.g. mutation inside nested closures and match arms) to prevent silent state bleed.

---

## 2. Compiler Pipeline & Codegen Resilience [COMPLETED]
- [x] **JS Codegen Tree-Shaking & Dead Code Minimization**: Clean up prelude emission in `codegen_js.ts` so that unused standard library modules are omitted when compiling for minimal bundle targets.
- [x] **LLVM IR Verification & SSA Canonicalization**:
  - Audit type casting, string allocation, and array indexing instructions in `codegen_llvm.ts` to guarantee 100% LLVM SSA validation compliance.
  - Standardize integer vs float phi-node handling in control-flow merges (`if-then-else` expressions).
- [x] **Source Map & Formatter Roundtrip Fidelity**:
  - Ensure `src/lang/formatter.ts` correctly preserves operator precedence parenthesization, unary operators, multiline record spreads, and trailing commas without mutating AST semantics.
  - Formatter roundtrip verification integrated into the automated compiler test suite (`37/37` passing).

---

## 3. Language Server Protocol (LSP) & IDE Tooling [COMPLETED]
- [x] **Hover Documentation Completeness**: Expanded docstring and signature tooltips for all built-ins and modular standard library methods across `Math` (`sqrt`, `abs`, `floor`, `ceil`, `round`, `min`, `max`, `pow`, `random`), `Array` (`len`, `map`, `filter`, `reduce`, `push`, `slice`), `String` (`len`, `slice`, `split`, `contains`, `parseInt`, `parseFloat`), `DOM` (`getElementById`, `createElement`, `setText`, `setHtml`, `setAttr`, `appendChild`, `addEventListener`, `h`, `mount`), and `Node` (`stringify`, `parse`, `envGet`, `readFile`, `writeFile`, `createApp`, `get`, `post`, `listen`).
- [x] **Autocompletion & Quick-Fix Lightbulb Actions**:
  - Monaco editor integrated with symbol autocompletion and snippet proposals for GADT declarations, match patterns, and modules.
  - Quick-fix code actions hooked to diagnostics for one-click typo correction, let declaration insertion, and match arm synthesis.
- [x] **AST Inspector Performance & Visual Tree View**: Dual visual tree view and raw JSON inspector with per-statement token badges and location tags.

---

## 4. Test Runner & Harness Hardening [COMPLETED]
- [x] **Parser Precedence & Expression Hardening**: Added stress test cases covering deeply nested binary arithmetic, boolean logical operators (`&&`, `||`), unary expressions (`!`, `-`), closures with multi-level lexical scoping, and functional record spread updates.
- [x] **Compiler Test Suite Coverage**: Expanded test suite to 37 comprehensive test cases verifying lexing, parsing, type checking, evaluation, formatter roundtrip, LSP hover sanity, JS sandbox execution, and LLVM IR SSA generation.
- [x] **In-Browser JS & Node Sandbox Runner**: Real-time execution of generated JavaScript in isolated evaluation sandboxes with stdout interception, execution timing telemetry, and error capture.

---

## 5. UI Polish & Ergonomics [COMPLETED]
- [x] **Console & Terminal Polish**: Added real-time log search filtering, line counters, and formatted output display in the IDE stdout console tab.
- [x] **Spec Documentation Synchronization**: Audited interactive code samples and spec documentation in `src/components/SpecDoc.tsx` ensuring complete alignment with the draft v0.1 syntax.

