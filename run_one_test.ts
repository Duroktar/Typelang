import { runCompilerTestSuite } from './src/lang/tests';
const res = runCompilerTestSuite();
const t = res.find(r => r.test.id === 'test_recursive_fibonacci');
console.log(t);
