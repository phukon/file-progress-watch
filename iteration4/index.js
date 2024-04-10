const fs = require('fs').promises;
const path = require('path');

// async function readDirectoryStructure(dirPath, basePath = '') {
//   let structure = {};
//   const entries = await fs.readdir(path.join(basePath, dirPath), { withFileTypes: true });
//   for (let entry of entries) {
//     const entryPath = path.join(dirPath, entry.name);
//     const fullPath = path.join(basePath, entryPath);
//     if (entry.isDirectory()) {
//       structure[entry.name] = await readDirectoryStructure(entryPath, basePath);
//     } else {
//       structure[entry.name] = fullPath;
//     }
//   }
//   return structure;
// }


readDirectoryStructure('../play')
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.error(err);
  });

async function readDirectoryStructure(dirPath) {
  let structure = {};
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (let entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      structure[entry.name] = await readDirectoryStructure(entryPath);
    } else {
      structure[entry.name] = 'file';
    }
  }
  return structure;
}