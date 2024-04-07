import fs from 'fs/promises';
import chokidar from 'chokidar';
import { countFiles } from './fileCounter.js';
import { calculateProgress } from './progressCalculator.js';

/**
 * Waits for the specified directory to be created.
 * @param {string} directoryPath
 * @param {number} maxAttempts
 * @param {number} intervalMs
 * @returns {Promise<void>}
 */
async function waitForDirectoryCreation(directoryPath, maxAttempts = 30, intervalMs = 3000) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    try {
      const dirExists = await (await fs.stat(directoryPath)).isDirectory()
      if (dirExists) {
        console.log(`Directory ${directoryPath} exists.`);
        return;
      } else {
        console.log("dir not found")
      }
    } catch (error) {
      console.log("waiting for the dir to be created")
    }
    attempts++;
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Directory ${directoryPath} not created within the specified time.`);
}


/**
 * Watches a directory and calculates the progress of files being added.
 * @param {string} directoryPath
 * @param {number} totalFiles
 * @param {Function} onProgressUpdate
 */
export async function watchDirectory(directoryPath, totalFiles, onProgressUpdate, onStopCallback) {
  await waitForDirectoryCreation(directoryPath)
  const watcher = chokidar.watch(directoryPath, { ignoreInitial: true });

  async function updateProgress() {
    const currentFiles = await countFiles(directoryPath);
    const progress = calculateProgress(currentFiles, totalFiles);
    onProgressUpdate(progress);

    if (progress >= 100) {
      watcher.close();

      if (typeof onStopCallback === 'function') {
        onStopCallback();
      }
    }
  }
  watcher.on('add', updateProgress);
  watcher.on('addDir', updateProgress);
}