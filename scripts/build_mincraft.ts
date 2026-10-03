import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Script } from 'node:vm';
import { TypeChecker } from '../src/lang/checker';
import { JSCodeGenerator } from '../src/lang/codegen_js';
import { Lexer } from '../src/lang/lexer';
import { Parser } from '../src/lang/parser';

const projectRoot = process.cwd();
const sourcePath = resolve(projectRoot, 'mincraft/main.typelang');
const outputPath = resolve(projectRoot, 'mincraft/main.js');
const source = readFileSync(sourcePath, 'utf8');

let program;
try {
  const tokens = new Lexer(source).tokenize();
  program = new Parser(tokens).parseProgram();
} catch (error) {
  console.error(`TypeLang parse failed for mincraft/main.typelang: ${String(error)}`);
  process.exit(1);
}

const checker = new TypeChecker();
checker.checkProgram(program);
const errors = checker.diagnostics.filter(diagnostic => diagnostic.severity === 'error');
if (errors.length > 0) {
  for (const diagnostic of errors) {
    console.error(`mincraft/main.typelang:${diagnostic.line}:${diagnostic.col}: ${diagnostic.message}`);
  }
  process.exit(1);
}

const javascript = new JSCodeGenerator().generate(program, {
  target: 'browser',
  includePrelude: true
});

try {
  new Script(javascript, { filename: 'mincraft/main.js' });
} catch (error) {
  console.error(`Generated JavaScript syntax check failed: ${String(error)}`);
  process.exit(1);
}

writeFileSync(outputPath, javascript);
console.log('Mincraft TypeLang check passed.');
console.log(`Generated browser client: ${outputPath}`);
