import chokidar from 'chokidar';
import { countFiles } from './fileCounter.js';
import { calculateProgress } from './progressCalculator.js';

/**
 * Watches a directory and calculates the progress of files being added.
 * @param {string} directoryPath Path to the directory to watch.
 * @param {number} totalFiles The total number of expected files.
 * @param {Function} onProgressUpdate Callback function to call on progress update.
 */
export function watchDirectory(directoryPath, totalFiles, onProgressUpdate) {
  const watcher = chokidar.watch(directoryPath, { ignoreInitial: true });

  watcher.on('add', async () => {
    const currentFiles = await countFiles(directoryPath);
    const progress = calculateProgress(currentFiles, totalFiles);
    onProgressUpdate(progress);
  });
}