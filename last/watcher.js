import fs from 'fs';
import path from 'path';
import { fork, spawn } from 'child_process';
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


const childCode = `
import blessed from \'blessed\';
import { fileURLToPath } from \'url\';
import path from \'path\';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Global store to hold counts for each directory.
 */
const directoryCounts = {};

/**
 * Resets the timeout to 20 seconds.
 * This is added as a redundancy in case the child process runs in a detached mode
 * and doesn\'t die on the parent being killed.
 */
let timeout;
function resetTimeout() {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    logMessage(\'No activity detected for over 10 seconds. Killing process...\');
    process.exit(1);
  }, 20_000);
}

/**
 * Creates a blessed screen with a menu box and a log box.
 */
const screen = blessed.screen({
  smartCSR: true,
  title: \'Terminal Interface\',
});

const menuBox = blessed.box({
  parent: screen,
  width: \'80%\',
  height: \'100%\',
  border: {
    type: \'line\',
  },
  style: {
    fg: \'white\',
    border: {
      fg: \'white\',
    },
  },
});

const menu = blessed.list({
  parent: menuBox,
  top: \'center\',
  left: \'center\',
  width: \'90%\',
  height: \'90%\',
  align: \'center\',
  tags: true,
  keys: true,
  border: {
    type: \'line\',
  },
  style: {
    selected: {
      bg: \'yellow\',
      bold: true,
    },
  },
  items: [\'Use the\', \'arrow keys\', \'to move\'],
});

menuBox.pushLine(\'\\t\\tTemplate pages\');

const logBox = blessed.box({
  parent: screen,
  left: \'80%\',
  width: \'20%\',
  height: \'80%\',
  border: {
    type: \'line\',
  },
  scrollbar: {
    ch: \' \'
  },
  style: {
    fg: \'white\',
    bg: \'black\',
    border: {
      fg: \'white\',
    },
  },
});

const totalBox = blessed.box({
  parent: screen,
  top: \'80%\',
  left: \'80%\',
  width: \'20%\',
  height: \'20%\',
  border: {
    type: \'line\',
  },
  scrollbar: {
    ch: \' \'
  },
  style: {
    fg: \'white\',
    bg: \'black\',
    border: {
      fg: \'white\',
    },
  },
});

/**
 * Logs a message to the log box and renders the screen.
 * @param {string} message - The message to log.
 */
function logMessage(message) {
  logBox.setContent(\'\');
  logBox.pushLine(message);
  screen.render();
}

/**
 * Event handler for menu selection.
 * If the selected item is \'Quit\', the process exits.
 * Otherwise, it logs the selected route and the number of pages built for that route.
 * @param {object} item - The selected menu item.
 */
menu.on(\'select\', (item) => {
  if (item.content === \'Quit\') {
    return process.exit(0);
  }
  logMessage(\`\\nSelected route:\\n \${item.content}\`);
  const count = directoryCounts[item.content];
  if (count !== undefined) {
    logMessage(\`\\nPages built for \\n \${item.content}\\n\\n > \${count}\`);
  } else {
    logMessage(\`\\nPages built for \\n \${item.content}\\n\\n > 0\`);
  }
});

// Handle Escape or Q to quit
screen.key([\'escape\', \'q\', \'C-c\'], () => {
  return process.exit(0);
});

// Initial log message
logBox.pushLine(\'\\n(Use arrow keys to navigate the menu)\');
logBox.pushLine(\'Total pages built: \');
totalBox.pushLine(\'building pages...\');
totalBox.pushLine(\`\\nTotal built: \${calculateSumCounts(directoryCounts)}\`);

/**
 * Calculates the sum of all the values in the directoryCounts object.
 * @param {object} countsObject - The object containing the directory counts.
 * @returns {number} - The sum of all the counts.
 */
function calculateSumCounts(countsObject) {
  let sum = 0;
  for (const key in countsObject) {
    if (Object.prototype.hasOwnProperty.call(countsObject, key)) {
      sum += countsObject[key];
    }
  }
  return sum;
}

/**
 * Handles messages from the parent process.
 * If the message type is \'dataFromParent\', it updates the directoryCounts object
 * and the total pages built display.
 * If the message type is \'config\', it updates the menu items.
 * @param {object} message - The message from the parent process.
 */
process.on(\'message\', (message) => {
  const { type, count, dir, configArray } = message;
  resetTimeout();

  if (type === \'dataFromParent\') {
    const shortenedPath = path.relative(__dirname, dir);
    const newPathArray = shortenedPath.split(path.sep);
    const newPath = path.sep + path.join(...newPathArray.slice(3));
    directoryCounts[newPath] = count;
    totalBox.setContent(\'\');
    totalBox.pushLine(\'\\nbuilding pages...\');
    totalBox.pushLine(\`\\nTotal built: \${calculateSumCounts(directoryCounts)}\`);
    screen.render();
    process.send({
      type: \'dataProcessed\',
      result: \'Data processed successfully\',
    });
  } else if (type === \'config\') {
    console.log(\`Received data from parent \${configArray}\`);
    menu.clearItems();
    menu.setItems(configArray);
    screen.render();
    process.send({
      type: \'dataProcessed\',
      result: \'Config updated successfully\',
    });
  }
});

// Focus on the menu to enable keyboard navigation
menu.focus();
screen.render();
process.send({ type: \'childReady\' });
`;

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
const blessedAppProcess = spawn('node', ['-e', childCode]);


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