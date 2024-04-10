const paths = new Set([
  '..\\play\\dede\\deded\\deede\\[lol].md',
  '..\\play\\dede\\deded\\[lol].md',       
  '..\\play\\dede\\dedee\\[lol].md',       
  '..\\play\\hello\\[hello].md',
  '..\\play\\[lol].md'
]);

// Convert paths to arrays
const pathArrays = Array.from(paths).map(path => {
  // Replace backslashes with forward slashes for consistency
  const normalizedPath = path.replace(/\\/g, '/');
  // Split the path into an array using '/'
  const pathArray = normalizedPath.split('/');
  return pathArray;
});

console.log(pathArrays);


const path = require('path');
const filePath = process.cwd()
const parsedPath = path.parse(filePath);

const pathArray = [];
pathArray.push(...parsedPath.dir.split(path.sep));
pathArray.push(parsedPath.base);
pathArray.push(parsedPath.ext);

console.log(pathArray);

const fullPath = path.join(...pathArray);
console.log(fullPath)