import { runCompilerTestSuite } from './src/lang/tests';
const res = runCompilerTestSuite();
const failed = res.filter(r => !r.passed);
console.log(`Passed: ${res.length - failed.length}/${res.length}`);
if (failed.length > 0) {
  console.log('Failed:', JSON.stringify(failed, null, 2));
}
