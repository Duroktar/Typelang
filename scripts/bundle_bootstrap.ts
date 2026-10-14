/**
 * TypeLang Self-Hosted Compiler Bundler
 *
 * Concatenates modular TypeLang source files from /bootstrap/
 * into a single unified compilation unit for Stage 0 bootstrapping.
 */

import * as fs from 'fs';
import * as path from 'path';

export const BOOTSTRAP_MODULES = [
  'tokens.tl',
  'ast.tl',
  'lexer.tl',
  'parser.tl',
  'checker.tl',
  'codegen_c.tl',
  'main.tl'
];

export function bundleBootstrap(rootDir: string = process.cwd()): string {
  const bootstrapDir = path.join(rootDir, 'bootstrap');
  const outDir = path.join(rootDir, '.tl_build', 'bootstrap');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  let bundleContent = `// ============================================================================\n`;
  bundleContent += `// TypeLang Self-Hosted Compiler (Monolithic Bootstrap Bundle)\n`;
  bundleContent += `// Auto-generated from /bootstrap/ modular components\n`;
  bundleContent += `// ============================================================================\n\n`;

  for (const mod of BOOTSTRAP_MODULES) {
    const modPath = path.join(bootstrapDir, mod);
    if (!fs.existsSync(modPath)) {
      throw new Error(`Bootstrap module not found: ${modPath}`);
    }
    const content = fs.readFileSync(modPath, 'utf-8');
    bundleContent += `// ----------------------------------------------------------------------------\n`;
    bundleContent += `// Module: ${mod}\n`;
    bundleContent += `// ----------------------------------------------------------------------------\n\n`;
    bundleContent += content.trim() + '\n\n';
  }

  const outFilePath = path.join(outDir, 'compiler.tl');
  fs.writeFileSync(outFilePath, bundleContent, 'utf-8');
  return outFilePath;
}

if (process.argv[1]?.endsWith('bundle_bootstrap.ts')) {
  const bundlePath = bundleBootstrap();
  console.log(`✓ Successfully bundled TypeLang self-hosted compiler to ${bundlePath}`);
}
