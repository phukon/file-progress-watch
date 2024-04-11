import { findTemplatePagesPaths } from './findTemplatePagesPaths.js';
import { watchDirectory } from './watcher.js';

async function main() {
  const directoryPath = '../fgh/play';
  const dirs = await findTemplatePagesPaths('../play');

  await watchDirectory(
    directoryPath,
    dirs
  );
}

main();