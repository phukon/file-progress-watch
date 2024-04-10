import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';
import blessed from 'blessed';

const screen = blessed.screen({ smartCSR: true, title: 'Terminal Interface' });
const menuBox = blessed.box({
  parent: screen,
  width: '20%',
  height: '100%',
  border: { type: 'line' },
  style: {
    fg: 'white',
    border: { fg: 'white' },
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
  border: { type: 'line' },
  style: {
    selected: { bg: 'yellow', bold: true },
  },
  items: ['Option 1', 'Option 2', 'Option 3', 'Quit'],
});

menuBox.pushLine('Template pages');

const logBox = blessed.box({
  parent: screen,
  left: '20%',
  width: '80%',
  height: '100%',
  border: { type: 'line' },
  scrollbar: { ch: ' ', inverse: true },
  style: {
    fg: 'white',
    bg: 'black',
    border: { fg: 'white' },
  },
});

function logMessage(message) {
  logBox.setContent('');
  logBox.pushLine('(Use arrow keys to navigate the menu)');
  logBox.pushLine('Total pages built: ');
  logBox.pushLine(message);
  screen.render();
}

menu.on('select', (item) => {
  if (item.content === 'Quit') {
    return process.exit(0);
  }
  logMessage(`Selected: ${item.content}`);
});

logBox.pushLine('(Use arrow keys to navigate the menu)');
logBox.pushLine('Total pages built: ');
menu.focus();
screen.render();

let intervalId;

async function watchDirectory(directoryPath) {
  // const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // const targetDirectory = path.resolve(__dirname, '../fgh/play');

  try {
    const watcher = chokidar.watch(directoryPath, { ignoreInitial: true });
    watcher.on('addDir', async (dir) => {
      const dirCount = await countDirectories(dir);
      logBox.pushLine(`Dir count for: ${dir}`, dirCount);
    });
    return [watcher];
  } catch (err) {
    console.error('Error:', err);
    return [];
  }
}

async function countDirectories(dir) {
  const files = await fs.promises.readdir(dir);
  return files.filter((file) => fs.statSync(path.join(dir, file)).isDirectory()).length;
}

const refreshTable = async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const targetDirectory = path.resolve(__dirname, '../fgh/play');
  const dirCount = await countDirectories(targetDirectory);
  logMessage(`Total pages built: ${dirCount}`);
};

const watchers = await watchDirectory('../fgh/play', (message) => {
  logMessage(message);
});

refreshTable();
intervalId = setInterval(refreshTable, 5000);

screen.key(['escape', 'q', 'C-c'], () => {
  watchers.forEach((watcher) => watcher.close());
  clearInterval(intervalId);
  return process.exit(0);
});

watchDirectory('../fgh/play')