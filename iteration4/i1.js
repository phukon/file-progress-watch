const fs = require('fs').promises;
const path = require('path');

async function readDirectoryStructure(dirPath, rootPath) {
  let structure = {};
  const fullPath = path.resolve(rootPath, dirPath);
  const entries = await fs.readdir(fullPath, { withFileTypes: true });

  for (let entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    const fullEntryPath = path.resolve(rootPath, entryPath);

    if (entry.isDirectory()) {
      structure[entry.name] = await readDirectoryStructure(entryPath, rootPath);
    } else {
      structure[entry.name] = fullEntryPath.replace(rootPath, '');
    }
  }
  return structure;
}

// Example usage
const rootPath = path.resolve(__dirname, '..'); // Assuming the script is in the 'play' directory
readDirectoryStructure('play', rootPath)
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.error(err);
  });
