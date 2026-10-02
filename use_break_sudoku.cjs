const fs = require('fs');
const examplesFile = 'src/lang/examples.ts';
let code = fs.readFileSync(examplesFile, 'utf-8');

const oldIsValid = `function isValid(g: number[], idx: number, val: number): boolean {
  let r = floor(idx / 9)
  let c = idx - r * 9
  
  let mut valid = true
  
  for (let mut i = 0; i < 9; i = i + 1) {
    if (g[r * 9 + i] == val) {
      valid = false
      i = 10
    }
  }
  
  if (valid) {
    for (let mut i = 0; i < 9; i = i + 1) {
      if (g[i * 9 + c] == val) {
        valid = false
        i = 10
      }
    }
  }
  
  if (valid) {
    let br = floor(r / 3) * 3
    let bc = floor(c / 3) * 3
    for (let mut i = 0; i < 3; i = i + 1) {
      for (let mut j = 0; j < 3; j = j + 1) {
        if (g[(br + i) * 9 + (bc + j)] == val) {
          valid = false
          j = 10
          i = 10
        }
      }
    }
  }
  
  valid
}`;

const newIsValid = `function isValid(g: number[], idx: number, val: number): boolean {
  let r = floor(idx / 9)
  let c = idx - r * 9
  
  for (let mut i = 0; i < 9; i = i + 1) {
    if (g[r * 9 + i] == val) { return false }
  }
  
  for (let mut i = 0; i < 9; i = i + 1) {
    if (g[i * 9 + c] == val) { return false }
  }
  
  let br = floor(r / 3) * 3
  let bc = floor(c / 3) * 3
  for (let mut i = 0; i < 3; i = i + 1) {
    for (let mut j = 0; j < 3; j = j + 1) {
      if (g[(br + i) * 9 + (bc + j)] == val) { return false }
    }
  }
  
  true
}`;

const oldSolveLoop = `      for (let mut v = currVal + 1; v <= 9; v = v + 1) {
        if (isValid(grid, cellIdx, v)) {
          grid[cellIdx] = v
          foundValid = true
          v = 10
        }
      }`;

const newSolveLoop = `      for (let mut v = currVal + 1; v <= 9; v = v + 1) {
        if (isValid(grid, cellIdx, v)) {
          grid[cellIdx] = v
          foundValid = true
          break
        }
      }`;

if (code.includes(oldIsValid)) {
  code = code.replace(oldIsValid, newIsValid);
  console.log('Replaced isValid with early returns');
} else {
  console.error('Could not find oldIsValid');
}

if (code.includes(oldSolveLoop)) {
  code = code.replace(oldSolveLoop, newSolveLoop);
  console.log('Replaced solveLoop with break');
} else {
  console.error('Could not find oldSolveLoop');
}

fs.writeFileSync(examplesFile, code);
