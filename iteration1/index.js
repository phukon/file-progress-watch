import { FileWatcher } from './src/fileWatcher.js';
import { ProgressCalculator } from './src/progressCalculator.js';

// Assuming we expect 100 files to determine the build is complete
const totalExpectedFiles = 100;
const directoryToWatch = '.evidence/template/.svelte-kit/output/prerendered/pages';

const progressCalculator = new ProgressCalculator(totalExpectedFiles);
const fileWatcher = new FileWatcher(directoryToWatch);

fileWatcher.setOnFileAddedCallback(() => {
  progressCalculator.fileCompleted();
});

fileWatcher.startWatching();