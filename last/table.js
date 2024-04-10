import blessed from 'blessed';
// import blessed_contrib from 'blessed-contrib';

// Import your watchDirectory function from elsewhere
import { watchDirectory } from './watcher.js';
import { countDirectories } from './countDir.js';

/**
 * Watches a directory and displays the directory count in a table.
 * @param {string} directoryPath - The path to the directory to be watched.
 * @param {Set<string>} dirs - The set of directories to be watched.
 * @param {Function} onProgressUpdate - A callback function to be called when progress is updated.
 * @param {Function} onStopCallback - A callback function to be called when the watcher is stopped.
 * @param {number} refreshInterval - The interval (in milliseconds) to refresh the table data.
 */
export async function watchAndDisplayDirectoryTable(
  directoryPath,
  dirs,
  onProgressUpdate,
  onStopCallback,
  refreshInterval = 5000
) {
  const watchers = await watchDirectory(
    directoryPath,
    dirs,
    onProgressUpdate,
    onStopCallback
  );

  const screen = blessed.screen({
    smartCSR: true,
    title: 'Terminal Interface',
  });


  const menuBox = blessed.box({
    parent: screen,
    width: '20%',
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
    items: ['Option 1', 'Option 2', 'Option 3', 'Quit'],
  });

  menuBox.pushLine('Template pages');

  const logBox = blessed.box({
    parent: screen,
    left: '20%',
    width: '80%',
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
    // Clear previous content in the log area
    logBox.setContent('');
    logBox.pushLine('(Use arrow keys to navigate the menu)');
    logBox.pushLine('Total pages built: ');
    // logBox.pushLine(' ');
    //   for (let i=0; i < 11 ; i++) {
    //   logBox.pushLine(`Selected: ${message}`);
    // }
    logBox.pushLine(message);
    screen.render();
  }

  // Event handling for menu selection
  menu.on('select', (item) => {
    if (item.content === 'Quit') {
      return process.exit(0);
    }
    logMessage(`Selected: ${item.content}`);
  });



  // Initial log message
  logBox.pushLine('(Use arrow keys to navigate the menu)');
  logBox.pushLine('Total pages built: ');

  menu.focus();
  screen.render();

  // Refresh the data periodically
  let intervalId;
  const refreshTable = async () => {
    for (const dir of dirs) {
      const dirCount = await countDirectories(dir);
        logBox.pushLine(`Dir count for: ${dir}`, dirCount);
    }
    screen.render();
  };

  refreshTable();
  intervalId = setInterval(refreshTable, refreshInterval);
  
  // Handle Escape or Q to quit
  screen.key(['escape', 'q', 'C-c'], () => {
    watchers.forEach((watcher) => watcher.close());
    clearInterval(intervalId);
    return process.exit(0);
  });
}
