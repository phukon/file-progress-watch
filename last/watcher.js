import fs from 'fs';
import path from 'path';
import { fork } from 'child_process';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';
import { waitForDirectoryCreation } from './wait-creation.js';
import { countDirectories } from './countDir.js';
import EventEmitter from 'events';

let CHILD_READY_FLAG = false;
let timeout;
console.log(timeout)

const resetTimeout = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    console.log('No activity detected for over 10 seconds. Killing process...');
    process.exit(1);
  }, 15000);
};
class ParentEmitter extends EventEmitter {}
const parentEmitter = new ParentEmitter();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ------------------- redirection
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Directory paths for log file
const logsDirectory = path.join(__dirname, 'logs');
ensureDirectoryExists(logsDirectory);
const stdoutLogPath = path.join(logsDirectory, 'stdout.log');
const stdoutLog = fs.createWriteStream(stdoutLogPath);
stdoutLog.on('error', (err) => {
  console.error('Error writing to stdout.log:', err);
});

// Redirect stdout and stderr to log files
console.log('Redirecting stdout and stderr...');
// process.stdout.pipe(stdoutLog);
process.stdout.write = process.stderr.write = stdoutLog.write.bind(stdoutLog);
// process.stdout.write = stdoutLog.write.bind(stdoutLog);
console.log('Stream redirection setup complete.');

// --------------
const blessedAppProcess = fork(path.join(__dirname, 'blessed.js'));

blessedAppProcess.on('message', ({ type }) => {
  if (type === 'childReady') {
    CHILD_READY_FLAG = true;
  }
});

blessedAppProcess.on('message', ({ type, eventName, args }) => {
  console.log(`Message from Blessed app: ${type}`);
});

parentEmitter.on('message', (count, dir) => {
  CHILD_READY_FLAG &&
    blessedAppProcess.send({ type: 'dataFromParent', count, dir });
});

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
        console.log('tooooooooooooooooooo');
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
