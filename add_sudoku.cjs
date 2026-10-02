const fs = require('fs');

const examplesFile = 'src/lang/examples.ts';
let code = fs.readFileSync(examplesFile, 'utf-8');

const sudokuCode = fs.readFileSync('sudoku.typelang', 'utf-8');
const sudokuExample = `
  ,
  {
    id: "28",
    name: "28. Sudoku Generator & Backtracking Solver",
    title: "28. Sudoku Generator & Backtracking Solver",
    description: "A fully playable Sudoku board featuring an interactive recursive backtracking solver visualizer.",
    category: "Algorithms & Data Structures",
    code: \`${sudokuCode.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`
  }`;

if (code.includes('];')) {
  let lastBracketIndex = code.lastIndexOf('];');
  code = code.substring(0, lastBracketIndex) + sudokuExample + '\n' + code.substring(lastBracketIndex);
  fs.writeFileSync(examplesFile, code);
  console.log('Successfully added Sudoku to EXAMPLES!');
} else {
  console.error('Could not find the end of EXAMPLES array.');
}
