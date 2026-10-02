const fs = require('fs');

const testsFile = 'src/lang/tests.ts';
let code = fs.readFileSync(testsFile, 'utf-8');

const testSudoku = `
  {
    id: 'test_sudoku_backtracking_loop_limit',
    name: 'Sudoku DFS Backtracking Iterations',
    category: 'Evaluator Engine',
    description: 'Verifies that complex backtracking algorithms (like Sudoku generation) can run efficiently without hitting iteration limits by executing a lightweight deterministic generator.',
    code: \`
      import Math.{ floor }
      let mut grid: number[] = []
      for (let mut i = 0; i < 81; i = i + 1) { grid.push(0) }
      let mut emptyCells: number[] = []
      
      // Deterministic boxes instead of random for testing predictability
      for (let mut box = 0; box < 3; box = box + 1) {
        let br = box * 3
        let bc = box * 3
        let nums = [1,2,3,4,5,6,7,8,9]
        let mut nIdx = 0
        for (let mut i = 0; i < 3; i = i + 1) {
          for (let mut j = 0; j < 3; j = j + 1) {
            grid[(br + i) * 9 + (bc + j)] = nums[nIdx]
            nIdx = nIdx + 1
          }
        }
      }
      
      for (let mut i = 0; i < 81; i = i + 1) {
        if (grid[i] == 0) { emptyCells.push(i) }
      }
      
      function isValid(g: number[], idx: number, val: number): boolean {
        let r = floor(idx / 9)
        let c = idx - r * 9
        let mut valid = true
        for (let mut i = 0; i < 9; i = i + 1) {
          if (g[r * 9 + i] == val) { valid = false; i = 10 }
        }
        if (valid) {
          for (let mut i = 0; i < 9; i = i + 1) {
            if (g[i * 9 + c] == val) { valid = false; i = 10 }
          }
        }
        if (valid) {
          let br = floor(r / 3) * 3
          let bc = floor(c / 3) * 3
          for (let mut i = 0; i < 3; i = i + 1) {
            for (let mut j = 0; j < 3; j = j + 1) {
              if (g[(br + i) * 9 + (bc + j)] == val) { valid = false; j = 10; i = 10 }
            }
          }
        }
        valid
      }
      
      let mut currentEmptyIdx = 0
      let mut keepGoing = true
      let mut steps = 0
      
      while (keepGoing) {
        steps = steps + 1
        if (currentEmptyIdx >= emptyCells.length) {
          keepGoing = false
        } else {
          if (currentEmptyIdx < 0) {
            keepGoing = false
          } else {
            let cellIdx = emptyCells[currentEmptyIdx]
            let currVal = grid[cellIdx]
            let mut foundValid = false
            for (let mut v = currVal + 1; v <= 9; v = v + 1) {
              if (isValid(grid, cellIdx, v)) {
                grid[cellIdx] = v
                foundValid = true
                v = 10
              }
            }
            if (foundValid) { currentEmptyIdx = currentEmptyIdx + 1 } 
            else { grid[cellIdx] = 0; currentEmptyIdx = currentEmptyIdx - 1 }
          }
        }
      }
      steps
    \`,
    expectedTypeErrors: 0,
    expectEvalResult: (res: any) => res > 100 // Must take > 100 steps indicating it successfully performed backtracking DFS
  }`;

if (code.includes('export const COMPILER_TEST_SUITE: TestCase[] = [')) {
  let firstBracketIndex = code.indexOf('export const COMPILER_TEST_SUITE: TestCase[] = [') + 'export const COMPILER_TEST_SUITE: TestCase[] = ['.length;
  code = code.substring(0, firstBracketIndex) + testSudoku + ',' + code.substring(firstBracketIndex);
  fs.writeFileSync(testsFile, code);
  console.log('Successfully added test to COMPILER_TEST_SUITE!');
} else {
  console.error('Could not find the start of COMPILER_TEST_SUITE array.');
}
