// const paths = new Set([
//   '..\\play\\dede\\deded\\deede\\[lol].md',
//   '..\\play\\dede\\deded\\[lol].md',       
//   '..\\play\\dede\\dedee\\[lol].md',       
//   '..\\play\\hello\\[hello].md',
//   '..\\play\\[lol].md'
// ]);

// // Convert paths to arrays
// const pathArrays = Array.from(paths).map(path => {
//   // Replace backslashes with forward slashes for consistency
//   const normalizedPath = path.replace(/\\/g, '/');
//   // Split the path into an array using '/'
//   const pathArray = normalizedPath.split('/');
//   return pathArray;
// });

// console.log(pathArrays);


// const path = require('path');
// const filePath = process.cwd()
// const parsedPath = path.parse(filePath);

// const pathArray = [];
// pathArray.push(...parsedPath.dir.split(path.sep));
// pathArray.push(parsedPath.base);
// pathArray.push(parsedPath.ext);

// console.log(pathArray);

// const fullPath = path.join(...pathArray);
// console.log(fullPath)
const fs = require('fs');
const path = require('path');

let directoryPath = 'C:\\Users\\rikip\\Desktop\\EXIM\\Projects\\open-source\\patch\\fgh\\play\\';

// Check if the directory exists
if (fs.existsSync(directoryPath)) {
  // Read the contents of the directory
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    
    let directoryCount = 0;
    // Iterate over the files in the directory
    files.forEach(file => {
      // Construct the full path of the file
      let filePath = path.join(directoryPath, file);
      // Check if it's a directory
      if (fs.statSync(filePath).isDirectory()) {
        directoryCount++;
      }
    });
    
    console.log('Number of directories:', directoryCount);
  });
} else {
  console.log(`${directoryPath} does not exist.`);
}
