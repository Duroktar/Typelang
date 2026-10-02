# TypeLang Playground

A browser-based playground for the TypeLang programming language, built with React, TypeScript, and Vite. The project includes the language implementation and compiler under `src/lang/` and the playground UI under `src/components/`.

## Requirements

- Node.js (LTS recommended)
- npm

## Start the development server

From the repository root, install dependencies and start Vite:

```sh
npm install --no-package-lock
npm run dev
```

Vite serves the app at <http://localhost:3000/>. The development server is configured to listen on all network interfaces, so Vite also prints a network URL when it starts.

The `--no-package-lock` option avoids creating a package lockfile. If you prefer npm to create one, use `npm install` instead.

## Other project commands

```sh
npm test       # Run the compiler and LLVM test suite
npm run lint   # TypeScript type-check
npm run build  # Run tests and create a production build in dist/
npm run preview # Preview the production build locally
```

## Project layout

- `src/lang/` — TypeLang lexer, parser, type checker, evaluator, code generators, and tests
- `src/components/` — Playground interface and editor panels
- `scripts/` — Project-level test runners
- `docs/` — Language and compiler documentation
