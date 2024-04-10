import fs from 'fs-extra';
import path from 'path';

export function buildDirectoryStructure(filePath, buildDirectory, isRemoval = false) {
  const relativePath = path.relative('./target', filePath);
  const buildPath = path.join(buildDirectory, relativePath);

  if (isRemoval) {
    fs.remove(buildPath)
      .then(() => console.log(`Removed: ${buildPath}`))
      .catch(err => console.error(err));
  } else {
    fs.ensureFile(buildPath)
      .then(() => console.log(`Built: ${buildPath}`))
      .catch(err => console.error(err));
  }
}