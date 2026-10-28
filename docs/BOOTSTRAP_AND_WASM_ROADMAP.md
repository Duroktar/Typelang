# TypeLang Bootstrapping & WebAssembly (WASM) Architecture

## Overview

TypeLang features a multi-stage self-hosting bootstrap pipeline and a high-performance, portable WebAssembly (WAT / WASM) target alongside its existing LLVM IR, C11, C++17, and JavaScript/TypeScript backends.

---

## 1. Why WebAssembly (WASM) is Superior for Bootstrapping

Traditional compiler bootstrapping relies on compiling the self-hosted compiler down to C source code, and then invoking a host C compiler (GCC, Clang) to produce an executable `stage1` binary.

### The Problem with Native C Toolchains for Bootstrapping:
1. **Container & Cloud Portability:** Most cloud runtime containers, serverless environments, and web dev containers do not have `gcc`, `g++`, or `clang` pre-installed (`build-essential`).
2. **Platform & Architecture Lock-In:** Native binaries (`.bin`, `.exe`, Mach-O, ELF) are tightly coupled to the host OS and architecture (x86_64, aarch64, armv7). A binary compiled on macOS cannot run on Linux or Windows.
3. **Browser Execution:** Web browsers and in-browser playgrounds cannot execute native C binaries under any circumstances.

### Why WebAssembly (WASM) Solves This:
1. **Universal Zero-Dependency Execution:** Every modern JavaScript engine (V8 in Node.js, JavaScriptCore in Bun/Safari, SpiderMonkey in Firefox, and Chromium in all browsers) includes a native, sandboxed, high-performance WebAssembly virtual machine out of the box with zero external dependencies.
2. **Bit-Identical Reproducibility:** WebAssembly binaries run identically across all hardware architectures and operating systems.
3. **Full Browser Integration:** The TypeLang Web IDE playground can compile programs to WebAssembly, execute them, and display stdout and execution metrics in real-time right in the browser.
4. **Fast Compilation & Execution:** WAT text generation is fast, linear memory layout is deterministic, and JIT compilation to machine code is near-instantaneous.

---

## 2. Dual-Track Bootstrapping Architecture

TypeLang implements a dual-track strategy to provide maximum flexibility:

| Capability | Track A: Universal WebAssembly (WASM) | Track B: Native C11 / C++17 AOT |
|---|---|---|
| **Host Toolchain Needed** | None (Node.js / Bun / Browser only) | `gcc` / `clang` / `g++` |
| **Portability** | 100% portable across OS & Architectures | Host-specific native binary |
| **Execution Environment** | Node.js, Bun, Browser Playground, Serverless | Host operating system terminal / POSIX |
| **Primary Use Case** | Cloud CI, Browser Playground, Zero-install bootstrap | Maximum native execution throughput & distribution |

---

## 3. The Multi-Stage Pipeline (`scripts/test_bootstrap_pipeline.ts`)

```
[/bootstrap/*.tl] ──(Stage 0: Bundler)──> [compiler.tl]
                                              │
                      ┌───────────────────────┴────────────────────────┐
                      ▼                                                ▼
     (Stage 1: Host TS Compiler)                       (Stage 1: Host TS Compiler)
       Generates C11 & C++17                             Generates WebAssembly (WAT)
              │                                                │
              ▼                                                ▼
     [stage1_compiler.c/cpp]                           [test_programs.wat]
              │                                                │
   (Native GCC/Clang if present)                         (Node / V8 WASM Engine)
              │                                                │
              ▼                                                ▼
      [stage1_compiler.bin]                            ✅ Executed in ~10-40ms
              │                                           (hello, fib, data_structures)
              ▼
   (Stage 2: Self-Hosting Verification)
      compiler.tl executed to compile
      test suite into verified C11 sources
```

### Pipeline Verification Commands:
- `npm run bootstrap` — Executes the complete multi-stage bootstrap pipeline. Automatically senses available toolchains and validates Stages 0, 1, 1.5 (WASM), and 2 (Self-Hosting).
- `npm run test:wasm` — Validates the WebAssembly target across standard test programs (`hello.tl`, `fib.tl`, `data_structures.tl`).
- `npm run test:native` — Validates across AST Evaluator, LLVMInterpreter, C11, and C++17 backends.
- `npm test` — Comprehensive verification running core compiler tests, LLVM unit tests, codegen tests, all 50 examples, and WebAssembly target tests.

---

## 4. IDE Playground Integration

The TypeLang IDE playground (`OutputPanel.tsx`) now includes:
1. **WebAssembly (WASM / WAT) Tab**: Direct view of generated WAT disassembly with syntax coloring and line counts.
2. **"Run WASM" Button**: Instant in-browser execution with real-time stdout, elapsed time tracking, and exit code reporting.
3. **"Download .wasm" Button**: Compiles the WAT source to a binary `.wasm` file using WasmCodeGenerator and downloads it directly to disk.
4. **"Download .wat" Button**: Downloads the clean, human-readable WebAssembly text format file.
