import { watchDirectory } from './watcher.js';

const directoryPath = '../../evidence/.evidence/template/.svelte-kit/output/prerendered/pages';
// const directoryPath = '../play';
const totalExpectedFiles = 5;

console.log('started');
watchDirectory(
  directoryPath,
  totalExpectedFiles,
  (progress) => {
    console.log(`Build Progress: ${progress}%`);
  },
  () => {
    console.log('Build completed. Exiting program.');
    process.exit();
  }
);
