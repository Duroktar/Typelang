import { runCodegenTestSuite } from '../src/lang/tests_codegen';

console.log('🚀 Running Exhaustive Code Generation Backend Test Suite (LLVM, C, C++)...\n');

const res = runCodegenTestSuite();

const groupedByCategory: Record<string, typeof res.results> = {};
for (const r of res.results) {
  if (!groupedByCategory[r.category]) {
    groupedByCategory[r.category] = [];
  }
  groupedByCategory[r.category].push(r);
}

for (const [cat, tests] of Object.entries(groupedByCategory)) {
  const catPassed = tests.every(t => t.passed);
  console.log(`${catPassed ? '📦' : '⚠️'} ${cat} (${tests.filter(t => t.passed).length}/${tests.length})`);
  for (const t of tests) {
    if (t.passed) {
      console.log(`  ✅ ${t.name} (LLVM: ✓, C: ✓, C++: ✓) [${t.durationMs}ms]`);
    } else {
      console.log(`  ❌ ${t.name}:`);
      t.errors.forEach(e => console.log(`     ${e}`));
    }
  }
  console.log('');
}

console.log(`--------------------------------------------------------------------------------`);
if (res.failed === 0) {
  console.log(`🎉 ALL ${res.passed} CODEGEN COMPILER TESTS PASSED! (${res.durationMs}ms total)`);
  process.exit(0);
} else {
  console.log(`❌ ${res.failed} of ${res.total} codegen tests failed!`);
  process.exit(1);
}
