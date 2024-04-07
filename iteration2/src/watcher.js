import chokidar from 'chokidar';
import { countFiles } from './fileCounter.js';
import { calculateProgress } from './progressCalculator.js';

/**
 * Watches a directory and calculates the progress of files being added.
 * @param {string} directoryPath
 * @param {number} totalFiles
 * @param {Function} onProgressUpdate
 */
export function watchDirectory(directoryPath, totalFiles, onProgressUpdate, onStopCallback) {
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
