import fs from 'fs';
import path from 'path';

/**
 * Counts the number of files in a given directory.
 * @param {string} directoryPath Path to the directory.
 * @returns {Promise<number>} The number of files in the directory.
 */
export async function countFiles(directoryPath) {
  const files = await fs.promises.readdir(directoryPath);
  const fileCount = files.filter(file => fs.statSync(path.join(directoryPath, file)).isFile()).length;
  return fileCount;
}