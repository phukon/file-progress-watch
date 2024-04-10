import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';
// import { calculateProgress } from './progressCalculator.js';
import { waitForDirectoryCreation } from './wait-creation.js';
import { countDirectories } from './countDir.js';

/**
 * Return the list of template dirs to be watched
 * @param {string} targetDirectory
 * @param {Array<string>} templatePagePaths
 * @returns {Promise<Set<string>>}
 */
const dirWatchList = async (targetDirectory, templatePagePaths) => {
	const dirToWatch = new Set();
	for (const templatePath of templatePagePaths) {
		if (fs.existsSync(targetDirectory + templatePath)) {
			dirToWatch.add(targetDirectory + templatePath);
		}
	}
	return dirToWatch;
};

/**
 * Watches a directory and calculates the progress of files being added.
 * @param {string} directoryPath
 * @param {Set<string>} dirs
 * @param {Function} onProgressUpdate
 * @param {Function} onStopCallback
 */
export async function watchDirectory(directoryPath, dirs, onProgressUpdate, onStopCallback) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const targetDirectory = path.resolve(__dirname, '../fgh/play');
  await waitForDirectoryCreation(directoryPath);

  try {
    const pathArrays = Array.from(dirs).map((path) => {
      const normalizedPath = path.replace(/\\/g, '/');
      const pathArray = normalizedPath.split('/');
      pathArray.pop();
      return pathArray.slice(2);
    });

    const watchList = await dirWatchList(
      targetDirectory,
      pathArrays.map((p) => '\\' + path.join(...p))
    );

    const watchers = [];

    for (const dir of watchList) {
      const watcher = chokidar.watch(dir, { ignoreInitial: true });
      watchers.push(watcher);

      // watcher.on('add', async () => {
      //   const currentFiles = await contentCounter(dir);
      //   const progress = calculateProgress(currentFiles, totalFiles);
        onProgressUpdate("added: ", dir);

      //   if (progress >= 100) {
      //     watcher.close();
      //     if (typeof onStopCallback === 'function') {
      //       onStopCallback();
      //     }
      //   }
      // });

      watcher.on('addDir', async () => {
        await countDirectories(dir)
      });
    }

    return watchers;
  } catch (err) {
    console.error('Error:', err);
    return [];
  }
}
// export async function watchDirectory(directoryPath, dirs, onProgressUpdate, onStopCallback) {
// 	const __dirname = path.dirname(fileURLToPath(import.meta.url));
// 	const targetDirectory = path.resolve(__dirname, '../fgh/play');

// 	await waitForDirectoryCreation(directoryPath);
// 	try {
// 		const pathArrays = Array.from(dirs).map((path) => {
// 			const normalizedPath = path.replace(/\\/g, '/');
// 			const pathArray = normalizedPath.split('/');
// 			pathArray.pop();
// 			return pathArray.slice(2);
// 		});

// 		// /!\ Returns a set!
// 		const watchList = await dirWatchList(
// 			targetDirectory,
// 			pathArrays.map((p) => '\\' + path.join(...p))
// 		);

// 		const watchers = [];

// 		for (const dir of watchList) {
// 			const watcher = chokidar.watch(dir, { ignoreInitial: true });
// 			watchers.push(watcher);

// 			watcher.on('add', async () => {
// 				// const currentFiles = await contentCounter(dir);
// 				// const progress = calculateProgress(currentFiles, totalFiles);
// 				// onProgressUpdate(progress);
// 				// if (progress >= 100) {
// 				//   watcher.close();
// 				//   if (typeof onStopCallback === 'function') {
// 				//     onStopCallback();
// 				//   }
// 				// }
// 			});
// 		}


// 	} catch (err) {
// 		console.error('Error:', err);
// 	}

// 	// const currentFiles = await contentCounter(directoryPath);
// 	// const initialProgress = calculateProgress(currentFiles, totalFiles);

// 	// if (initialProgress >= 100) {
// 	// 	// console.log('\nProgress already at 100% or greater');
// 	// 	if (typeof onStopCallback === 'function') {
// 	// 		onStopCallback();
// 	// 	}
// 	// 	return;
// 	// }
// 	const templateDirWatcher = chokidar.watch(directoryPath, { ignoreInitial: true });
// 	const watcher = chokidar.watch(directoryPath, { ignoreInitial: true });

// 	async function updateProgress() {
// 		// const currentFiles = await contentCounter(directoryPath);
// 		// const progress = calculateProgress(currentFiles, totalFiles);
// 		onProgressUpdate('dd');

// 		// if (progress >= 100) {
// 		// 	watcher.close();

// 		// 	if (typeof onStopCallback === 'function') {
// 		// 		onStopCallback();
// 		// 	}
// 		// }
// 	}

// 	watcher.on('add', updateProgress);
// 	watcher.on('addDir', updateProgress);
// }
