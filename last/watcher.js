import fs from 'fs';
import path from 'path';
import { fork } from 'child_process';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';
import { waitForDirectoryCreation } from './wait-creation.js';
import { countDirectories } from './countDir.js';
import EventEmitter from 'events';
import os from 'os';
const { tmpdir: tempDir } = os;

let CHILD_READY_FLAG = false;
let timeout;
console.log(timeout);

/**
 * Resets the timeout to 15 seconds.
 * The timer will only start after the target directory has been
 * created, therefore the process will not be killed prematurely.
 */
const resetTimeout = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    console.log('No activity detected for over 10 seconds. Killing process...');
    process.exit(1);
  }, 15_000);
};

/**
 * Custom event emitter for the parent process.
 */
class ParentEmitter extends EventEmitter {}
const parentEmitter = new ParentEmitter();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Ensures that a directory exists, creating it if it doesn't.
 * @param {string} directory - The path to the directory to ensure.
 */
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Directory paths for log file
const logsDirectory = path.join(tempDir(), 'evidence-logs');
ensureDirectoryExists(logsDirectory);
const stdoutLogPath = path.join(logsDirectory, 'stdout.log');
const stdoutLog = fs.createWriteStream(stdoutLogPath);
stdoutLog.on('error', (err) => {
  console.error('Error writing to stdout.log:', err);
});

// Redirect stdout and stderr to log files
console.log('Redirecting stdout and stderr...');
process.stdout.write = process.stderr.write = stdoutLog.write.bind(stdoutLog);
console.log('Stream redirection setup complete.');

// Fork the blessed.js process
const blessedAppProcess = fork(path.join(__dirname, 'blessed.js'));

// Handle messages from the forked process
blessedAppProcess.on('message', ({ type }) => {
  if (type === 'childReady') {
    CHILD_READY_FLAG = true;
  }
});

blessedAppProcess.on('message', ({ type }) => {
  console.log(`Message from Blessed app: ${type}`);
});

// Forward messages from the parent process to the forked process
parentEmitter.on('message', (count, dir) => {
  CHILD_READY_FLAG && blessedAppProcess.send({ type: 'dataFromParent', count, dir });
});

/**
 * Returns the list of template directories to be watched.
 * @param {string} targetDirectory - The target directory to search for template pages.
 * @param {Array<string>} templatePagePaths - The relative paths to the template pages.
 * @returns {Promise<Set<string>>} - A Set of directory paths to watch.
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
 * @param {string} directoryPath - The path to the directory to watch.
 * @param {Set<string>} dirs - The set of directories to watch.
 * @param {Function} onProgressUpdate - The callback function to call when progress is updated.
 * @param {Function} onStopCallback - The callback function to call when the watch stops.
 */
export async function watchDirectory(
  directoryPath,
  dirs
) {
  const targetDirectory = path.resolve(__dirname, '../fgh/play');
  await waitForDirectoryCreation(directoryPath);

  try {
    const pathArrays = Array.from(dirs).map((p) => {
      const pathArray = p.split(path.sep);
      pathArray.pop(); // removing the template page name
      return pathArray.slice(2); // removing target dir top paths
    });

    const joinedPaths = pathArrays.map((p) => path.sep + path.join(...p));

    const watchList = await dirWatchList(targetDirectory, joinedPaths);
    blessedAppProcess.on('message', ({ type }) => {
      if (type === 'childReady') {
        const updatedOptions = [...joinedPaths, ' ', 'Quit'];
        blessedAppProcess.send({ type: 'config', configArray: updatedOptions });
      }
    });

    const watchers = [];

    for (const dir of watchList) {
      const watcher = chokidar.watch(dir, { ignoreInitial: true, depth: 0 });
      watchers.push(watcher);

      watcher.on('addDir', async () => {
        resetTimeout();
        let count = await countDirectories(dir);
        parentEmitter.emit('message', count, dir);
      });
    }
  } catch (err) {
    console.error('Error:', err);
    return;
  }
}