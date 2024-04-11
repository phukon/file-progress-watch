import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';
// import { calculateProgress } from './progressCalculator.js';
import { waitForDirectoryCreation } from './wait-creation.js';
import { countDirectories } from './countDir.js';

import EventEmitter from 'events';
import blessed from 'blessed';
// Global store to hold counts for each directory
const directoryCounts = {};
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const myEmitter = new EventEmitter();

const screen = blessed.screen({
  smartCSR: true,
  title: 'Terminal Interface',
});

const menuBox = blessed.box({
  parent: screen,
  width: '80%',
  height: '100%',
  border: {
    type: 'line',
  },
  style: {
    fg: 'white',
    border: {
      fg: 'white',
    },
  },
});

const menu = blessed.list({
  parent: menuBox,
  top: 'center',
  left: 'center',
  width: '90%',
  height: '90%',
  align: 'center',
  tags: true,
  keys: true,
  border: {
    type: 'line',
  },
  style: {
    selected: {
      bg: 'yellow',
      bold: true,
    },
  },
  items: ['Use the', 'arrow keys', 'to move'],
});

menuBox.pushLine('\t\tTemplate pages');

const logBox = blessed.box({
  parent: screen,
  left: '80%',
  width: '20%',
  height: '100%',
  border: {
    type: 'line',
  },
  scrollbar: {
    ch: ' ',
    inverse: true,
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: 'white',
    },
  },
});

function logMessage(message) {
  logBox.setContent('');
  logBox.pushLine(`Total pages built: ${calculateSumCounts(directoryCounts)}`);
  logBox.pushLine(message);
  screen.render();
}
// Event handling for menu selection
menu.on('select', (item) => {
  if (item.content === 'Quit') {
    return process.exit(0);
  }
  logMessage(`\nSelected route:\n ${item.content}`);
    // Debugging: Log the keys in directoryCounts
  // console.log('Keys in directoryCounts:', Object.keys(directoryCounts));

  const count = directoryCounts[item.content];
  if (count !== undefined) {
    logMessage(`\nPages built for \n ${item.content}\n > ${count}`);
  } else {
    logMessage(`\nPages built for \n ${item.content}\n > 0`);
  }
});

// Handle Escape or Q to quit
screen.key(['escape', 'q', 'C-c'], () => {
  return process.exit(0);
});
// Initial log message
logBox.pushLine('(Use arrow keys to navigate the menu)');
logBox.pushLine('Total pages built: ');

function calculateSumCounts(countsObject) {
  let sum = 0;
  for (const key in countsObject) {
    if (Object.prototype.hasOwnProperty.call(countsObject, key)) {
      sum += countsObject[key];
    }
  }
  return sum;
}

// Event listener for counting directories
myEmitter.on('message', (c, d) => {
  // Shorten the path to use as the key in directoryCounts
  const shortenedPath = path.relative(__dirname, d);
  // console.log('sp', shortenedPath);
  const newPathArray = shortenedPath.split(path.sep);
  // console.log('newpatharry', newPathArray);
  const newPath = path.sep + path.join(...newPathArray.slice(3));
  // console.log('newpath', newPath);
  directoryCounts[newPath] = c;
  // console.log('dircount', directoryCounts);
  logBox.pushLine('building pages... ..');
});

// Focus on the menu to enable keyboard navigation
menu.focus();
// Render the screen
screen.render();

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
export async function watchDirectory(
  directoryPath,
  dirs,
  onProgressUpdate,
  onStopCallback
) {
  const targetDirectory = path.resolve(__dirname, '../fgh/play');
  await waitForDirectoryCreation(directoryPath);

  try {
    const pathArrays = Array.from(dirs).map((p) => {
      const pathArray = p.split(path.sep);
      pathArray.pop(); // removing the template page name
      return pathArray.slice(2); // keeping only the childrens of the target dir
    });

    const joinedPaths = pathArrays.map((p) => path.sep + path.join(...p));

    const watchList = await dirWatchList(targetDirectory, joinedPaths);
    menu.clearItems();
    menu.setItems([...joinedPaths, ' ', 'Quit']);

    const watchers = [];

    for (const dir of watchList) {
      const watcher = chokidar.watch(dir, { ignoreInitial: true, depth: 0 });
      watchers.push(watcher);

      watcher.on('addDir', async () => {
        // console.log('dir', dir);
        let count = await countDirectories(dir);
        myEmitter.emit('message', count, dir);
      });
    }
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
