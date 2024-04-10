import { watchTargetDirectory } from './fileSystemWatcher.js';
import { buildDirectoryStructure } from './directoryStructureBuilder.js';
import { startCounting } from './templateDirectoryCounter.js';

const targetDirectory = '../play';
const buildDirectory = '../fgh/play';

// Start watching the target directory for template file changes
watchTargetDirectory(targetDirectory, buildDirectory);

// Start counting template directories and files in the build directory
startCounting(buildDirectory);

console.log('Monitoring started. Press Ctrl+C to stop.');