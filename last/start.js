import { findTemplatePagesPaths } from './findTemplatePagesPaths.js';
import { watchAndDisplayDirectoryTable } from './table.js';
import { watchDirectory } from './watcher.js';

async function main() {
  const directoryPath = '../fgh/play';
  const dirs = await findTemplatePagesPaths('../play');

  await watchDirectory(
    directoryPath,
    dirs,
    (progress) => {
      console.log(`Build Progress: ${progress}%`);
    },
    () => {
      console.log('\n All the pages have been built.');
    }
  );
}

main();