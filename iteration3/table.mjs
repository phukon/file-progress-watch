import blessed from 'blessed';
import blessed_contrib from 'blessed-contrib';

// Import your watchDirectory function from elsewhere
import { watchDirectory } from './watchDirectory';

/**
 * Watches a directory and displays the directory count in a table.
 * @param {string} directoryPath - The path to the directory to be watched.
 * @param {Set<string>} dirs - The set of directories to be watched.
 * @param {Function} onProgressUpdate - A callback function to be called when progress is updated.
 * @param {Function} onStopCallback - A callback function to be called when the watcher is stopped.
 * @param {number} [refreshInterval=5000] - The interval (in milliseconds) to refresh the table data.
 */
export async function watchAndDisplayDirectoryTable(
  directoryPath,
  dirs,
  onProgressUpdate,
  onStopCallback,
  refreshInterval = 5000
) {
  const watchers = await watchDirectory(directoryPath, dirs, onProgressUpdate, onStopCallback);

  // Create the screen and table
  const screen = blessed.screen();
  const grid = new blessed_contrib.grid({ rows: 1, cols: 1, screen: screen });
  const table = grid.set(0, 0, 1, 1, blessed_contrib.table, {
    keys: true,
    fg: 'white',
    selectedFg: 'white',
    selectedBg: 'blue',
    interactive: true,
    label: 'Directory Counts',
    border: { type: 'line', fg: 'cyan' },
    columnSpacing: 1,
    columnWidth: [50, 10]
  });

  // Refresh the table data periodically
  const refreshTable = async () => {
    table.clearRows();
    for (const dir of dirs) {
      const dirCount = await countDirectories(dir);
      table.addRow([dir, dirCount]);
    }
    screen.render();
  };

  refreshTable();
  const refreshInterval = setInterval(refreshTable, refreshInterval);

  // Handle Escape or Q to quit
  screen.key(['escape', 'q', 'C-c'], () => {
    watchers.forEach((watcher) => watcher.close());
    clearInterval(refreshInterval);
    return process.exit(0);
  });

  // Render the screen
  screen.render();
}

/**
 * Counts the number of directories in a given directory path.
 * @param {string} directoryPath - The path to the directory to be scanned.
 * @returns {Promise<number>} - The number of directories found in the given directory path.
 */
async function countDirectories(directoryPath) {
  // Implementation of countDirectories function
}