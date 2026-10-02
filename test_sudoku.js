function isValid(g, idx, val) {
  let r = Math.floor(idx / 9)
  let c = idx - r * 9
  for (let i = 0; i < 9; i++) if (g[r * 9 + i] == val) return false;
  for (let i = 0; i < 9; i++) if (g[i * 9 + c] == val) return false;
  let br = Math.floor(r / 3) * 3
  let bc = Math.floor(c / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (g[(br + i) * 9 + (bc + j)] == val) return false;
    }
  }
  return true;
}

function run() {
  let grid = new Array(81).fill(0);
  for (let box = 0; box < 3; box++) {
    let br = box * 3
    let bc = box * 3
    let nums = [1,2,3,4,5,6,7,8,9]
    for (let i = 0; i < 9; i++) {
      let swapIdx = Math.floor(Math.random() * 9)
      let temp = nums[i]
      nums[i] = nums[swapIdx]
      nums[swapIdx] = temp
    }
    let nIdx = 0
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        grid[(br + i) * 9 + (bc + j)] = nums[nIdx++]
      }
    }
  }
  
  let emptyCells = [];
  for (let i = 0; i < 81; i++) if (grid[i] == 0) emptyCells.push(i);
  
  let currentEmptyIdx = 0;
  let steps = 0;
  
  while (currentEmptyIdx >= 0 && currentEmptyIdx < emptyCells.length) {
    steps++;
    let cellIdx = emptyCells[currentEmptyIdx]
    let currVal = grid[cellIdx]
    let foundValid = false;
    for (let v = currVal + 1; v <= 9; v++) {
      if (isValid(grid, cellIdx, v)) {
        grid[cellIdx] = v;
        foundValid = true;
        break;
      }
    }
    if (foundValid) {
      currentEmptyIdx++;
    } else {
      grid[cellIdx] = 0;
      currentEmptyIdx--;
    }
  }
  console.log("Steps:", steps);
}
for(let i=0; i<10; i++) run();
