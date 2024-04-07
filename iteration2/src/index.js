import { watchDirectory } from './watcher.js';

// const directoryPath = '.evidence/template/.svelte-kit/output/prerendered/pages';
const directoryPath = '../play'
const totalExpectedFiles = 3;

console.log('started')
watchDirectory(directoryPath, totalExpectedFiles, (progress) => {
  console.log(`Build Progress: ${progress}%`);
});