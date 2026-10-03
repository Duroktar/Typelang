# Mincraft · TypeLang voxel sandbox

A small, playable first-person voxel survival game. The simulation, world generation, controls, crafting and Canvas renderer are authored in `main.typelang`; `main.js` is its browser-target JavaScript output. No game engine or runtime dependency is required to play.

## Install, build, and play

The game source is `main.typelang`. The browser does **not** compile TypeLang at runtime: `main.js` is the generated client loaded by the page. Rebuild it whenever you change the TypeLang source so the browser always runs the latest compiled game.

1. Install the repository dependencies from the repository root: `npm install`.
2. Compile and typecheck just this game: `npm run mincraft:build`.
3. Start the standalone local web server: `npm run mincraft:serve`.
4. Open [http://127.0.0.1:4174/](http://127.0.0.1:4174/) and click the game canvas. Stop the server with Ctrl+C.

The build command runs the TypeLang lexer, parser, typechecker, and browser JavaScript generator, then checks the generated JavaScript syntax. It only checks this game; it does **not** run the repository-wide example suite. The standalone server uses Node's built-in HTTP module and serves the `mincraft/` folder only. You can override its defaults with `HOST` or `PORT` environment variables.

For a quick offline launch, open `index.html` directly after building. Serving over HTTP is more reliable across browsers.

Click the view to create a world. Drag on the canvas to look around; press Escape to pause.

| Input | Action |
| --- | --- |
| WASD / arrows | Walk and strafe |
| Hold and drag mouse | Look around |
| Left click | Mine the block under the crosshair |
| Right click | Place the selected block |
| 1–8 / mouse wheel | Select a hotbar slot |
| E | Open inventory and crafting |
| Space | Jump |
| Q | Swing a wooden sword |
| Shift + left click | Sword attack |
| F | Eat an apple |
| F3 | Toggle coordinates and debug stats |
| Escape | Pause / close inventory |
| R | Start a fresh world from title or death |

## Build behavior

`npm run mincraft:build` overwrites the checked-in `main.js` from `main.typelang`. Commit both when changing game logic so the standalone page and the TypeLang source stay in sync. `npm run mincraft:serve` serves that generated output and the page locally; it does not compile automatically, so run the build command again after source edits.

## Included systems

- Seeded 48 × 48 procedural hills, layered dirt and stone, beaches, a lake, oak trees and coal seams.
- First-person software raycaster with pixelated block faces, distance shading, a day/night sky, clouds, crosshair, hotbar and target readout.
- Block mining and placement, eight-slot hotbar, inventory, crafting recipes, workbench-gated tools, coal torches, rare leaf apples and edible food.
- Wandering sheep, night-spawned hostile crawlers, simple pursuit/combat, health and hunger, jumping, death and respawn.
- A `GamePhase` algebraic data type, a `Mob` record type, procedural functions, stateful arrays, pattern-based state rendering, callbacks, and browser FFI via TypeLang.

This is intentionally a compact early-survival-era tribute rather than a 1:1 recreation: it has no networked multiplayer, caves, fluids simulation, persistence, or full voxel meshing. The renderer uses a lightweight heightfield/column approach so it stays responsive in a browser.

## Manual compiler command (optional)

The npm build command above is the recommended way to compile. This equivalent one-line command is available if you want to run the compiler pipeline directly from the repository root:

```sh
npx tsx -e 'import { readFileSync, writeFileSync } from "node:fs"; import { Lexer } from "./src/lang/lexer.ts"; import { Parser } from "./src/lang/parser.ts"; import { TypeChecker } from "./src/lang/checker.ts"; import { JSCodeGenerator } from "./src/lang/codegen_js.ts"; const file = "mincraft/main.typelang"; const ast = new Parser(new Lexer(readFileSync(file, "utf8")).tokenize()).parseProgram(); const checker = new TypeChecker(); checker.checkProgram(ast); const errors = checker.diagnostics.filter(d => d.severity === "error"); if (errors.length) { for (const d of errors) console.error(`${d.line}: ${d.message}`); process.exit(1); } writeFileSync("mincraft/main.js", new JSCodeGenerator().generate(ast, { target: "browser", includePrelude: true })); console.log("TypeLang checked and mincraft/main.js generated");'
```

This focused check validates just the game source and does not run the repository-wide example test suite. The generated JavaScript is checked in so the game can be played without the compiler toolchain.
