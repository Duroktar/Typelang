const fs = require('fs');
const examplesFile = 'src/lang/examples.ts';
let code = fs.readFileSync(examplesFile, 'utf-8');

const badIsValid = `function isValid(g: number[], idx: number, val: number): boolean {
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

const goodIsValid = `function isValid(g: number[], idx: number, val: number): boolean {
  let r = floor(idx / 9)
  let c = idx - r * 9
  
  let mut valid = true
  
  for (let mut i = 0; i < 9; i = i + 1) {
    if (g[r * 9 + i] == val) {
      valid = false
      break
    }
  }
  
  if (valid) {
    for (let mut i = 0; i < 9; i = i + 1) {
      if (g[i * 9 + c] == val) {
        valid = false
        break
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
          break
        }
      }
      if (valid == false) { break }
    }
  }
  
  valid
}`;

code = code.replace(badIsValid, goodIsValid);
fs.writeFileSync(examplesFile, code);
