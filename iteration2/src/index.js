import { getPagesDir } from './get-pages.js';
import { watchDirectory } from './watcher.js';

async function main() {
  const directoryPath = '../../evidence/.evidence/template/.svelte-kit/output/prerendered/pages';
  // const directoryPath = '../play';

  try {
    const totalExpectedFiles = await getPagesDir('../../evidence/pages');

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
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}
main();
