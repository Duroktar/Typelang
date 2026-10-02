const fs = require('fs');

const examplesFile = 'src/lang/examples.ts';
let code = fs.readFileSync(examplesFile, 'utf-8');

const enigmaCode = fs.readFileSync('enigma.typelang', 'utf-8');
const enigmaExample = `
  ,
  {
    id: "27",
    title: "27. Cryptography Lab: Enigma Machine Simulator",
    description: "A functional simulation of the WWII Enigma cipher machine.",
    code: \`${enigmaCode.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`
  }`;

// Find the end of the EXAMPLES array.
// It ends with:
//   }
// ];
// We will replace `\n];` with `${enigmaExample}\n];`
if (code.includes('];')) {
  let lastBracketIndex = code.lastIndexOf('];');
  code = code.substring(0, lastBracketIndex) + enigmaExample + '\n' + code.substring(lastBracketIndex);
  fs.writeFileSync(examplesFile, code);
  console.log('Successfully added Enigma to EXAMPLES!');
} else {
  console.error('Could not find the end of EXAMPLES array.');
}
