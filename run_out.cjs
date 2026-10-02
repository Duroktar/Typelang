const fs = require('fs');
const js = fs.readFileSync('out.js', 'utf-8');
const result = new Function(js + '\nreturn findNumber([1,2,3,4,5], 3);')();
console.log("Result: " + result);
