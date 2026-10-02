# AGENTS.md

This repository is TypeLang: a TypeScript-based language compiler and IDE playground with a React front end. Most work should stay in the compiler pipeline under `src/lang/` and keep the UI in `src/components/` isolated from language-core changes.

## Project map

- `src/lang/`: lexer, parser, type checker, evaluator, JS/LLVM code generators, examples, LSP, tests. This is the TypeLang language implementation layer.
- `src/components/`: IDE panels, editor, preview, output rendering, and app shell.
- `scripts/`: project-level validation and targeted test runners.
- `docs/`: design, language notes, grammar summaries, and TDD notes for the compiler pipeline.
- `plan.md`: current hardening and polish goals for the project.

## Language architecture

This repo is a TypeScript host implementation of a custom language called TypeLang. The language itself is not TypeScript; it is a distinct typed language with its own lexer, parser, AST, and example programs.

The best way to understand the language is to read:

- `src/lang/lexer.ts` for tokens and lexical structure
- `src/lang/parser.ts` for grammar and expression precedence
- `src/lang/ast.ts` for the AST and type representations
- `src/lang/examples/` for real syntax and semantic usage
- `src/lang/textmateGrammar.ts` for editor syntax highlighting

## Relevant docs

- [plan.md](plan.md)
- [docs/LLVM_TDD_ROADMAP.md](docs/LLVM_TDD_ROADMAP.md)
- [docs/TYPELANG_LANGUAGE_SUMMARY.md](docs/TYPELANG_LANGUAGE_SUMMARY.md)
- [docs/TYPELANG_GRAMMAR_SUMMARY.md](docs/TYPELANG_GRAMMAR_SUMMARY.md)

## Build and validation

Use the project scripts rather than ad-hoc commands:

- `npm test` — run the compiler suite and LLVM unit tests.
- `npm run lint` — TypeScript validation.
- `npm run build` — runs tests, then Vite production build.
- `npm run dev` — local Vite app for interactive work.

When making changes, prefer a focused check that matches the affected area. For compiler bugs, add or update a failing test in the relevant TypeLang test file before fixing the implementation.

## Engineering conventions

- Favor minimal, test-backed changes over broad refactors.
- Treat this as a hardening project: keep semantics stable, improve diagnostics, and strengthen the compiler pipeline rather than adding unrelated features.
- If a fix touches the language core, inspect the relevant pipeline stage (lexer/parser/checker/evaluator/codegen) before patching.
- Keep UI changes separate from compiler logic unless the feature intentionally crosses both layers.
- When code or behavior is already described in the docs, link to that source instead of duplicating explanations in agent guidance.

## Typical change patterns

- Parser or type-checker work: update the corresponding logic in `src/lang/` and add a focused regression in `src/lang/tests.ts` or `src/lang/tests_llvm.ts`.
- LLVM/codegen fixes: validate with the LLVM-focused test runner and ensure generated SSA stays valid.
- App/editor changes: prefer changes inside `src/components/` and ensure they do not break compiler integration or output panels.
- Documentation-only work: update the canonical doc and keep this file brief and actionable.

## Working style for agents

- Be surgical: narrow reads, narrow edits, and clear verification.
- Before claiming success, run the relevant project command and check the actual output.
- If a task is ambiguous, verify the existing project conventions in the repo before proceeding.
- Keep changes consistent with the TypeLang hardening plan in [plan.md](plan.md).
