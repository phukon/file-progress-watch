import blessed from 'blessed';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Global store to hold counts for each directory
const directoryCounts = {};
let timeout;
function resetTimeout() {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    logMessage('No activity detected for over 10 seconds. Killing process...');
    process.exit(1);
  }, 5000); 
}

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
  height: '80%',
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

const totalBox = blessed.box({
  parent: screen,
  top: '80%',
  left: '80%',
  width: '20%',
  height: '20%',
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
  logBox.pushLine(message);
  screen.render();
}
// Event handling for menu selection
menu.on('select', (item) => {
  if (item.content === 'Quit') {
    return process.exit(0);
  }
  logMessage(`\nSelected route:\n ${item.content}`);
  // Debugging
  // console.log('Keys in directoryCounts:', Object.keys(directoryCounts));
  const count = directoryCounts[item.content];
  if (count !== undefined) {
    logMessage(`\nPages built for \n ${item.content}\n\n > ${count}`);
  } else {
    logMessage(`\nPages built for \n ${item.content}\n\n > 0`);
  }
});

// Handle Escape or Q to quit
screen.key(['escape', 'q', 'C-c'], () => {
  return process.exit(0);
});

// Initial log message
logBox.pushLine('\n(Use arrow keys to navigate the menu)');
logBox.pushLine('Total pages built: ');
totalBox.pushLine('\nbuilding pages...');
totalBox.pushLine(`\nTotal built: ${calculateSumCounts(directoryCounts)}`);

function calculateSumCounts(countsObject) {
  let sum = 0;
  for (const key in countsObject) {
    if (Object.prototype.hasOwnProperty.call(countsObject, key)) {
      sum += countsObject[key];
    }
  }
  return sum;
}

process.on('message', ({ type, count, dir }) => {
  resetTimeout();
  if (type === 'dataFromParent') {
    const shortenedPath = path.relative(__dirname, dir);
    const newPathArray = shortenedPath.split(path.sep);
    const newPath = path.sep + path.join(...newPathArray.slice(3));
    directoryCounts[newPath] = count;
    totalBox.setContent('');
    totalBox.pushLine('\nbuilding pages...');
    totalBox.pushLine(`\nTotal built: ${calculateSumCounts(directoryCounts)}`);
    screen.render();
    process.send({
      type: 'dataProcessed',
      result: 'Data processed successfully',
    });
  }
});

process.on('message', ({ type, configArray }) => {
  if (type === 'config') {
    console.log(`Received data from parent ${configArray}`);
    menu.clearItems();
    menu.setItems(configArray);
    screen.render();
    process.send({
      type: 'dataProcessed',
      result: 'Config updated successfully',
    });
  }
});

// Focus on the menu to enable keyboard navigation
menu.focus();
screen.render();
process.send({ type: 'childReady' });
